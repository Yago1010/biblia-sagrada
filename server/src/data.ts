import fs from 'node:fs';
import path from 'node:path';
import {
  BOOKS,
  TRANSLATIONS,
  normalize,
  referenceFor,
  resolveBook,
  type AvailableTranslation,
  type ChapterPayload,
  type TranslationMeta,
  type Verse,
  type VerseHit,
} from '@biblia/core';

export class DataError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'DataError';
  }
}

/**
 * Acha server/data subindo a partir do cwd — funciona com cwd em
 * server/, na raiz do monorepo ou em apps/web (Next).
 * Override: BIBLIA_DATA_DIR=/caminho/absoluto
 */
function findDataDir(): string {
  if (process.env.BIBLIA_DATA_DIR) return path.resolve(process.env.BIBLIA_DATA_DIR);
  let dir = process.cwd();
  for (let i = 0; i < 8; i += 1) {
    const nested = path.join(dir, 'server', 'data');
    if (fs.existsSync(nested)) return nested;
    const direct = path.join(dir, 'data');
    if (fs.existsSync(path.join(direct, 'README.md'))) return direct;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.join(process.cwd(), 'server', 'data');
}

export const DATA_DIR = findDataDir();

interface LocalBook {
  id?: string;
  abbrev?: string;
  chapters: unknown[];
}

const localCache = new Map<string, LocalBook[]>();
const chapterCache = new Map<string, ChapterPayload>();
const failedFiles = new Set<string>();

function filePath(id: string): string {
  return path.join(DATA_DIR, `${id}.json`);
}

export function hasLocalFile(id: string): boolean {
  return fs.existsSync(filePath(id));
}

export function listTranslations(): AvailableTranslation[] {
  return TRANSLATIONS.map((meta) => ({
    ...meta,
    available: meta.source === 'api' ? true : hasLocalFile(meta.id),
  }));
}

function normalizeVerses(input: unknown): Verse[] {
  if (!Array.isArray(input)) {
    throw new DataError(500, 'invalid_chapter_data', 'capítulo não é uma lista de versículos');
  }
  const verses: Verse[] = [];
  input.forEach((raw, i) => {
    if (typeof raw === 'string') {
      const text = raw.replace(/\s+/g, ' ').trim();
      if (text) verses.push({ n: i + 1, text });
      return;
    }
    if (raw && typeof raw === 'object') {
      const o = raw as { verse?: unknown; n?: unknown; text?: unknown };
      const text = String(o.text ?? '')
        .replace(/\s+/g, ' ')
        .trim();
      const n = Number(o.verse ?? o.n ?? i + 1);
      if (text) verses.push({ n: Number.isFinite(n) ? n : i + 1, text });
      return;
    }
    throw new DataError(500, 'invalid_verse', 'formato de versículo inválido no JSON');
  });
  if (!verses.length) {
    throw new DataError(500, 'empty_chapter', 'capítulo sem versículos no JSON');
  }
  return verses;
}

function loadLocal(id: string): LocalBook[] {
  const cached = localCache.get(id);
  if (cached) return cached;

  const file = filePath(id);
  if (!fs.existsSync(file)) {
    throw new DataError(404, 'translation_file_missing', `arquivo não encontrado: ${file}`);
  }
  if (failedFiles.has(file)) {
    throw new DataError(500, 'invalid_json', `JSON inválido (cacheado): ${file}`);
  }

  let parsed: unknown;
  try {
    // remove BOM — arquivos exportados do Excel/Windows têm
    parsed = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
  } catch (err) {
    failedFiles.add(file);
    throw new DataError(500, 'invalid_json', `JSON inválido: ${file} — ${(err as Error).message}`);
  }

  const arr = Array.isArray(parsed)
    ? parsed
    : Array.isArray((parsed as { books?: unknown[] }).books)
      ? ((parsed as { books: unknown[] }).books)
      : null;
  if (!arr) {
    throw new DataError(
      500,
      'invalid_format',
      `formato inesperado em ${file}: esperado array de 66 livros`,
    );
  }

  let books: LocalBook[];
  if (arr.length === BOOKS.length) {
    books = arr as LocalBook[];
  } else {
    const byKey = new Map<string, LocalBook>();
    for (const b of arr as LocalBook[]) {
      const key = normalize(String(b.id ?? b.abbrev ?? ''));
      if (key) byKey.set(key, b);
    }
    books = BOOKS.map((meta) => {
      const keys = [
        meta.id,
        meta.abbr.pt,
        meta.abbr.en,
        meta.names.pt,
        meta.names.en,
        meta.apiName,
      ].map(normalize);
      for (const k of keys) {
        const hit = byKey.get(k);
        if (hit) return hit;
      }
      return null as unknown as LocalBook;
    });
    if (books.some((b) => !b || !Array.isArray(b.chapters))) {
      throw new DataError(
        500,
        'invalid_format',
        `${path.basename(file)} precisa ter os 66 livros (encontrado ${arr.length}) ou siglas conhecidas`,
      );
    }
  }

  localCache.set(id, books);
  return books;
}

async function fromLocal(meta: TranslationMeta, bookId: string, chapter: number): Promise<ChapterPayload> {
  const book = resolveBook(bookId)!;
  const books = loadLocal(meta.id);
  const local = books[book.index];
  if (!local || !Array.isArray(local.chapters)) {
    throw new DataError(500, 'book_missing', `livro ${book.names.pt} ausente no arquivo ${meta.id}.json`);
  }
  const raw = local.chapters[chapter - 1];
  if (raw === undefined) {
    throw new DataError(404, 'chapter_not_found', `${book.names.pt} ${chapter} não existe no arquivo`);
  }
  return {
    translation: meta.id,
    bookId: book.id,
    chapter,
    reference: referenceFor(book, chapter, meta.lang),
    verses: normalizeVerses(raw),
    source: 'local',
  };
}

async function fromApi(meta: TranslationMeta, bookId: string, chapter: number): Promise<ChapterPayload> {
  const book = resolveBook(bookId)!;
  const nameLang = meta.bookLang ?? meta.lang;
  const bookName = nameLang === 'pt' ? book.names.pt : book.apiName;
  const url = `https://bible-api.com/${encodeURIComponent(`${bookName} ${chapter}`)}?translation=${meta.api}`;

  let res: Response | undefined;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      res = await fetch(url, {
        signal: AbortSignal.timeout(15000),
        headers: { 'User-Agent': 'biblia-sagrada/1.0' },
      });
    } catch (err) {
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        continue;
      }
      throw new DataError(502, 'api_unreachable', `bible-api.com indisponível: ${(err as Error).message}`);
    }
    if ((res.status === 429 || res.status === 403 || res.status >= 500) && attempt < 2) {
      const wait = Math.min(Number(res.headers.get('retry-after') ?? '3') || 3, 20);
      await new Promise((resolve) => setTimeout(resolve, wait * 1000));
      continue;
    }
    break;
  }
  if (!res) throw new DataError(502, 'api_unreachable', 'bible-api.com indisponível');

  if (res.status === 429 || res.status === 403) {
    throw new DataError(
      502,
      'rate_limited',
      'bible-api.com limitou as requisições — tente de novo em instantes',
    );
  }
  if (res.status === 404) {
    throw new DataError(404, 'chapter_not_found', `${referenceFor(book, chapter, nameLang)} não encontrado na API`);
  }
  if (!res.ok) {
    throw new DataError(502, 'api_error', `bible-api.com respondeu ${res.status}`);
  }

  const data = (await res.json()) as { verses?: { verse: number; text: string }[] };
  const verses: Verse[] = (data.verses ?? [])
    .map((v) => ({
      n: Number(v.verse),
      text: String(v.text ?? '')
        .replace(/\s+/g, ' ')
        .trim(),
    }))
    .filter((v) => v.text && Number.isFinite(v.n));
  if (!verses.length) {
    throw new DataError(404, 'empty_chapter', `${referenceFor(book, chapter, nameLang)} veio vazio da API`);
  }

  return {
    translation: meta.id,
    bookId: book.id,
    chapter,
    reference: referenceFor(book, chapter, nameLang),
    verses,
    source: 'api',
  };
}

export async function getChapter(
  translationId: string,
  bookParam: string,
  chapter: number,
): Promise<ChapterPayload> {
  const meta = TRANSLATIONS.find((t) => t.id === translationId);
  if (!meta) throw new DataError(404, 'unknown_translation', `tradução desconhecida: ${translationId}`);

  const book = resolveBook(bookParam);
  if (!book) throw new DataError(404, 'unknown_book', `livro desconhecido: ${bookParam}`);

  if (meta.ntOnly && book.testament === 'ot') {
    throw new DataError(
      404,
      'testament_unavailable',
      `${meta.name} só tem o Novo Testamento na fonte`,
    );
  }

  if (!Number.isInteger(chapter) || chapter < 1 || chapter > book.chapters) {
    throw new DataError(
      400,
      'invalid_chapter',
      `capítulo inválido: ${book.names.pt} ${chapter} (1-${book.chapters})`,
    );
  }

  const key = `${meta.id}:${book.id}:${chapter}`;
  const cached = chapterCache.get(key);
  if (cached) return cached;

  let payload: ChapterPayload;
  if (meta.source === 'local') {
    payload = await fromLocal(meta, book.id, chapter);
  } else {
    // tradução de API: prefere JSON local (sync offline), cai pra API se faltar
    payload = await localOrApi(meta, book.id, chapter);
  }

  chapterCache.set(key, payload);
  return payload;
}

async function localOrApi(meta: TranslationMeta, bookId: string, chapter: number): Promise<ChapterPayload> {
  if (hasLocalFile(meta.id)) {
    try {
      return await fromLocal(meta, bookId, chapter);
    } catch (err) {
      if (!(err instanceof DataError)) throw err;
      // livro/capítulo ausente no JSON parcial → a API completa
    }
  }
  return fromApi(meta, bookId, chapter);
}

// ---------------------------------------------------------------------------
// busca textual de versículos — varre todos os JSONs locais (nvi, acf, ara,
// niv, kjv sincronizado…) com índice de texto dobrado em cache (mtime)
// ---------------------------------------------------------------------------

interface IndexedVerse {
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
  folded: string;
}

const searchIndex = new Map<string, { mtime: number; verses: IndexedVerse[] }>();

function buildIndex(meta: TranslationMeta): IndexedVerse[] {
  const file = filePath(meta.id);
  let mtime: number;
  try {
    mtime = fs.statSync(file).mtimeMs;
  } catch {
    return [];
  }
  const cached = searchIndex.get(meta.id);
  if (cached && cached.mtime === mtime) return cached.verses;

  let books: LocalBook[];
  try {
    books = loadLocal(meta.id);
  } catch {
    return [];
  }

  const verses: IndexedVerse[] = [];
  for (const book of BOOKS) {
    const local = books[book.index];
    if (!local || !Array.isArray(local.chapters)) continue;
    local.chapters.forEach((raw, ci) => {
      let norm: Verse[];
      try {
        norm = normalizeVerses(raw);
      } catch {
        return; // capítulo malformado não derruba a busca
      }
      for (const v of norm) {
        verses.push({
          bookId: book.id,
          chapter: ci + 1,
          verse: v.n,
          text: v.text,
          folded: normalize(v.text),
        });
      }
    });
  }
  searchIndex.set(meta.id, { mtime, verses });
  return verses;
}

/** busca versículos por texto em todos os JSONs locais disponíveis */
export function searchVerses(raw: string, limit = 40): { hits: VerseHit[]; truncated: boolean } {
  const words = normalize(raw)
    .split(' ')
    .filter((w) => w.length >= 2);
  if (!words.length) return { hits: [], truncated: false };

  // teto por tradução p/ uma não saturar o limite (diversifica os resultados)
  const perTranslation = Math.max(4, Math.ceil(limit / 3));
  const hits: VerseHit[] = [];
  const counts = new Map<string, number>();
  let truncated = false;
  outer: for (const meta of TRANSLATIONS) {
    if (!hasLocalFile(meta.id)) continue;
    for (const v of buildIndex(meta)) {
      if (!words.every((w) => v.folded.includes(w))) continue;
      const used = counts.get(meta.id) ?? 0;
      if (used >= perTranslation) break; // cota desta tradução cheia
      counts.set(meta.id, used + 1);
      hits.push({
        translation: meta.id,
        translationName: meta.name,
        bookId: v.bookId,
        chapter: v.chapter,
        verse: v.verse,
        text: v.text,
      });
      if (hits.length >= limit) {
        truncated = true;
        break outer;
      }
    }
  }
  return { hits, truncated };
}
