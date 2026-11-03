/**
 * Sincroniza traduções para server/data/<id>.json
 *
 * Uso:
 *   npm run sync -- --source api --translation almeida --lang pt
 *   npm run sync -- --source api --translation kjv --lang en
 *   npm run sync -- --source api --translation kjv --book john   (teste rápido, 1 livro)
 *   npm run sync -- --import "C:\caminho\nvi.json" --translation nvi --lang pt
 *   npm run sync -- --import "C:\caminho\minha-biblia.json" --translation acf --lang pt
 */
import fs from 'node:fs';
import path from 'node:path';
import { BOOKS, TRANSLATIONS } from '@biblia/core';

interface LocalBook {
  id: string;
  chapters: string[][];
}

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return undefined;
  const value = process.argv[index + 1];
  return value && !value.startsWith('--') ? value : '';
}

function dataDir(): string {
  const dir = path.resolve(process.cwd(), 'server', 'data');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function validateTranslation(id: string, source: 'local' | 'api'): void {
  const meta = TRANSLATIONS.find((t) => t.id === id);
  if (!meta) {
    const known = TRANSLATIONS.map((t) => t.id).join(', ');
    throw new Error(`tradução desconhecida: ${id}. conhecidas: ${known}`);
  }
  if (meta.source !== source) {
    throw new Error(
      `tradução ${id} é source=${meta.source}; use --source ${meta.source} para ela`,
    );
  }
  if (source === 'api' && !meta.api) {
    throw new Error(`tradução ${id} não tem parâmetro de API`);
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const REQUEST_DELAY_MS = 700;

/** busca um capítulo com backoff — bible-api.com responde 429 em rajada */
async function fetchChapterJson(url: string): Promise<{ verses?: { verse: number; text: string }[] }> {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    let res: Response;
    try {
      res = await fetch(url, {
        signal: AbortSignal.timeout(20000),
        headers: { 'User-Agent': 'biblia-sagrada-sync/1.0' },
      });
    } catch {
      await sleep(3000);
      continue;
    }
    if (res.status === 429 || res.status === 403) {
      const wait = Math.min(Number(res.headers.get('retry-after') ?? '20') || 20, 90);
      process.stdout.write(`\n  ${res.status} rate limit — aguardando ${wait}s   `);
      await sleep(wait * 1000);
      continue;
    }
    if (res.status >= 500) {
      await sleep(3000);
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as { verses?: { verse: number; text: string }[] };
  }
  throw new Error('rate limit persistente (429) — rode o sync de novo depois');
}

async function syncFromApi(translationId: string, bookFilter?: string): Promise<void> {
  validateTranslation(translationId, 'api');
  const meta = TRANSLATIONS.find((t) => t.id === translationId)!;
  const targets = bookFilter
    ? BOOKS.filter(
        (b) => b.id === bookFilter || b.apiName.replace(/\s+/g, '') === bookFilter,
      )
    : BOOKS;
  if (!targets.length) throw new Error(`livro não encontrado: ${bookFilter}`);

  const file = path.join(dataDir(), `${translationId}.json`);
  const output = readExisting(file); // sync retomável: livros completos são pulados

  for (const book of targets) {
    const done = output[book.index];
    if (done && done.chapters.length === book.chapters) {
      console.log(`✓ ${book.names.pt} já sincronizado — pulando`);
      continue;
    }

    const chapters: string[][] = [];
    const nameLang = meta.bookLang ?? meta.lang;
    for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
      const bookName = nameLang === 'pt' ? book.names.pt : book.apiName;
      const url = `https://bible-api.com/${encodeURIComponent(
        `${bookName} ${chapter}`,
      )}?translation=${meta.api}`;
      const body = await fetchChapterJson(url);
      const verses: { n: number; text: string }[] = (body.verses ?? [])
        .map((v) => ({
          n: Number(v.verse),
          text: String(v.text ?? '')
            .replace(/\s+/g, ' ')
            .trim(),
        }))
        .filter((v) => v.text && Number.isFinite(v.n));
      if (!verses.length) throw new Error(`${book.apiName} ${chapter} veio vazio`);

      const dense: string[] = [];
      for (const verse of verses) dense[verse.n - 1] = verse.text;
      for (let i = 0; i < dense.length; i += 1) dense[i] = dense[i] ?? '';
      chapters.push(dense);

      process.stdout.write(`\r${book.id} ${chapter}/${book.chapters}   `);
      await sleep(REQUEST_DELAY_MS);
    }

    output[book.index] = { id: book.id, chapters };
    fs.writeFileSync(file, JSON.stringify(output));
    console.log(`\n✓ ${book.names.pt} (${chapters.length} capítulos) → ${file}`);
  }

  console.log(`gravado: ${file}`);
}

function readExisting(file: string): LocalBook[] {
  if (!fs.existsSync(file)) return BOOKS.map((b) => ({ id: b.id, chapters: [] }));
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as LocalBook[];
    if (Array.isArray(parsed) && parsed.length === BOOKS.length) return parsed;
  } catch {
    /* arquivo quebrado — recria do zero */
  }
  return BOOKS.map((b) => ({ id: b.id, chapters: [] }));
}

function importFile(sourcePath: string, translationId: string): void {
  validateTranslation(translationId, 'local');
  const resolved = path.resolve(sourcePath);
  if (!fs.existsSync(resolved)) throw new Error(`arquivo não encontrado: ${resolved}`);

  const parsed = JSON.parse(fs.readFileSync(resolved, 'utf8').replace(/^\uFEFF/, ''));
  const books: unknown[] = Array.isArray(parsed)
    ? parsed
    : Array.isArray((parsed as { books?: unknown[] }).books)
      ? (parsed as { books: unknown[] }).books
      : [];
  if (books.length !== BOOKS.length) {
    throw new Error(
      `esperava ${BOOKS.length} livros na ordem canônica, veio ${books.length}. ` +
        'formato: [ { "id": "gen", "chapters": [ ["verso 1", "verso 2"], ... ] } ]',
    );
  }

  const file = path.join(dataDir(), `${translationId}.json`);
  fs.writeFileSync(file, JSON.stringify(books));
  console.log(`✓ ${translationId} importado de ${resolved}\ngravado: ${file}`);
}

async function main(): Promise<void> {
  const source = arg('source');
  const imported = arg('import');
  const translation = arg('translation');
  const book = arg('book') || undefined;

  if (!translation) {
    throw new Error('use --translation <id> (nvi, acf, ara, niv, kjv, web, almeida)');
  }

  if (imported) {
    importFile(imported, translation);
    return;
  }
  if (source === 'api') {
    await syncFromApi(translation, book);
    return;
  }
  throw new Error('use --source api ... ou --import <arquivo>');
}

main().catch((err: Error) => {
  console.error(`✗ ${err.message}`);
  process.exitCode = 1;
});
