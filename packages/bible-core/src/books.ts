import type { Book, Testament } from './types';

type Raw = [
  id: string,
  chapters: number,
  pt: string,
  en: string,
  abbrPt: string,
  abbrEn: string,
  testament: Testament,
];

const RAW: Raw[] = [
  ['gen', 50, 'Gênesis', 'Genesis', 'Gn', 'Gn', 'ot'],
  ['exo', 40, 'Êxodo', 'Exodus', 'Ex', 'Ex', 'ot'],
  ['lev', 27, 'Levítico', 'Leviticus', 'Lv', 'Lv', 'ot'],
  ['num', 36, 'Números', 'Numbers', 'Nm', 'Nu', 'ot'],
  ['deu', 34, 'Deuteronômio', 'Deuteronomy', 'Dt', 'Dt', 'ot'],
  ['jos', 24, 'Josué', 'Joshua', 'Js', 'Josh', 'ot'],
  ['jdg', 21, 'Juízes', 'Judges', 'Jz', 'Judg', 'ot'],
  ['rut', 4, 'Rute', 'Ruth', 'Rt', 'Ruth', 'ot'],
  ['1sa', 31, '1 Samuel', '1 Samuel', '1Sm', '1Sam', 'ot'],
  ['2sa', 24, '2 Samuel', '2 Samuel', '2Sm', '2Sam', 'ot'],
  ['1ki', 22, '1 Reis', '1 Kings', '1R', '1Kgs', 'ot'],
  ['2ki', 25, '2 Reis', '2 Kings', '2R', '2Kgs', 'ot'],
  ['1ch', 29, '1 Crônicas', '1 Chronicles', '1Cr', '1Chr', 'ot'],
  ['2ch', 36, '2 Crônicas', '2 Chronicles', '2Cr', '2Chr', 'ot'],
  ['ezr', 10, 'Esdras', 'Ezra', 'Ed', 'Ezra', 'ot'],
  ['neh', 13, 'Neemias', 'Nehemiah', 'Ne', 'Neh', 'ot'],
  ['est', 10, 'Ester', 'Esther', 'Et', 'Est', 'ot'],
  ['job', 42, 'Jó', 'Job', 'Jó', 'Job', 'ot'],
  ['psa', 150, 'Salmos', 'Psalms', 'Sl', 'Ps', 'ot'],
  ['pro', 31, 'Provérbios', 'Proverbs', 'Pv', 'Prov', 'ot'],
  ['ecc', 12, 'Eclesiastes', 'Ecclesiastes', 'Ec', 'Eccl', 'ot'],
  ['sng', 8, 'Cantares', 'Song of Solomon', 'Ct', 'Song', 'ot'],
  ['isa', 66, 'Isaías', 'Isaiah', 'Is', 'Isa', 'ot'],
  ['jer', 52, 'Jeremias', 'Jeremiah', 'Jr', 'Jer', 'ot'],
  ['lam', 5, 'Lamentações', 'Lamentations', 'Lm', 'Lam', 'ot'],
  ['ezk', 48, 'Ezequiel', 'Ezekiel', 'Ez', 'Ezek', 'ot'],
  ['dan', 12, 'Daniel', 'Daniel', 'Dn', 'Dan', 'ot'],
  ['hos', 14, 'Oseias', 'Hosea', 'Os', 'Hos', 'ot'],
  ['jol', 3, 'Joel', 'Joel', 'Jl', 'Joel', 'ot'],
  ['amo', 9, 'Amós', 'Amos', 'Am', 'Amos', 'ot'],
  ['obd', 1, 'Obadias', 'Obadiah', 'Ob', 'Obad', 'ot'],
  ['jon', 4, 'Jonas', 'Jonah', 'Jn', 'Jonah', 'ot'],
  ['mic', 7, 'Miqueias', 'Micah', 'Mi', 'Mic', 'ot'],
  ['nam', 3, 'Naum', 'Nahum', 'Na', 'Nah', 'ot'],
  ['hab', 3, 'Habacuque', 'Habakkuk', 'Ha', 'Hab', 'ot'],
  ['zep', 3, 'Sofonias', 'Zephaniah', 'Sf', 'Zeph', 'ot'],
  ['hag', 2, 'Ageu', 'Haggai', 'Ag', 'Hag', 'ot'],
  ['zec', 14, 'Zacarias', 'Zechariah', 'Zc', 'Zech', 'ot'],
  ['mal', 4, 'Malaquias', 'Malachi', 'Ml', 'Mal', 'ot'],
  ['mat', 28, 'Mateus', 'Matthew', 'Mt', 'Matt', 'nt'],
  ['mrk', 16, 'Marcos', 'Mark', 'Mc', 'Mark', 'nt'],
  ['luk', 24, 'Lucas', 'Luke', 'Lc', 'Luke', 'nt'],
  ['jhn', 21, 'João', 'John', 'Jo', 'John', 'nt'],
  ['act', 28, 'Atos', 'Acts', 'At', 'Acts', 'nt'],
  ['rom', 16, 'Romanos', 'Romans', 'Rm', 'Rom', 'nt'],
  ['1co', 16, '1 Coríntios', '1 Corinthians', '1Co', '1Cor', 'nt'],
  ['2co', 13, '2 Coríntios', '2 Corinthians', '2Co', '2Cor', 'nt'],
  ['gal', 6, 'Gálatas', 'Galatians', 'Gl', 'Gal', 'nt'],
  ['eph', 6, 'Efésios', 'Ephesians', 'Ef', 'Eph', 'nt'],
  ['php', 4, 'Filipenses', 'Philippians', 'Fp', 'Phil', 'nt'],
  ['col', 4, 'Colossenses', 'Colossians', 'Cl', 'Col', 'nt'],
  ['1th', 5, '1 Tessalonicenses', '1 Thessalonians', '1Ts', '1Thess', 'nt'],
  ['2th', 3, '2 Tessalonicenses', '2 Thessalonians', '2Ts', '2Thess', 'nt'],
  ['1ti', 6, '1 Timóteo', '1 Timothy', '1Tm', '1Tim', 'nt'],
  ['2ti', 4, '2 Timóteo', '2 Timothy', '2Tm', '2Tim', 'nt'],
  ['tit', 3, 'Tito', 'Titus', 'Tt', 'Titus', 'nt'],
  ['phm', 1, 'Filemom', 'Philemon', 'Fm', 'Phlm', 'nt'],
  ['heb', 13, 'Hebreus', 'Hebrews', 'Hb', 'Heb', 'nt'],
  ['jas', 5, 'Tiago', 'James', 'Tg', 'James', 'nt'],
  ['1pe', 5, '1 Pedro', '1 Peter', '1P', '1Pet', 'nt'],
  ['2pe', 3, '2 Pedro', '2 Peter', '2P', '2Pet', 'nt'],
  ['1jn', 5, '1 João', '1 John', '1J', '1John', 'nt'],
  ['2jn', 1, '2 João', '2 John', '2J', '2John', 'nt'],
  ['3jn', 1, '3 João', '3 John', '3J', '3John', 'nt'],
  ['jud', 1, 'Judas', 'Jude', 'Jd', 'Jude', 'nt'],
  ['rev', 22, 'Apocalipse', 'Revelation', 'Ap', 'Rev', 'nt'],
];

/** remove acento, força minúsculas e colapsa separadores */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export const BOOKS: Book[] = RAW.map((r, index) => ({
  id: r[0],
  index,
  testament: r[6],
  chapters: r[1],
  names: { pt: r[2], en: r[3] },
  abbr: { pt: r[4], en: r[5] },
  aliases: [],
  apiName: r[3].toLowerCase(),
}));

/** abreviações populares que não batem com nome/sigla base */
const EXTRA_ALIASES: Record<string, string[]> = {
  gen: ['ge', 'gn'],
  exo: ['exod', 'ex'],
  jos: ['josh', 'josue', 'joshua'],
  jdg: ['judg', 'jg', 'juizes', 'judges'],
  psa: ['ps', 'salmo', 'salmos'],
  pro: ['pr', 'provb'],
  ecc: ['ecl'],
  sng: ['sos', 'song', 'cantares', 'canticos'],
  ezk: ['eze', 'ezequiel'],
  obd: ['ob'],
  jon: ['jon', 'jonas', 'jonah'],
  mic: ['miqueias'],
  mat: ['mt', 'matt', 'mateus'],
  mrk: ['mk', 'mc', 'marcos'],
  luk: ['lk', 'lc', 'lucas'],
  jhn: ['jn', 'jo', 'joh', 'john', 'joao'],
  act: ['at', 'atos'],
  rom: ['rm', 'ro', 'romanos'],
  gal: ['ga'],
  eph: ['ep'],
  php: ['pp'],
  col: ['co'],
  heb: ['he'],
  jas: ['ja', 'jas', 'tiago'],
  rev: ['ap', 'apoc', 'apocalipse'],
};

/** aliases ambíguos — resolvidos à força para o livro mais procurado */
const FORCE_ALIASES: Record<string, string> = {
  jn: 'jhn',
  jo: 'jhn',
  joh: 'jhn',
  john: 'jhn',
  joao: 'jhn',
  at: 'act',
  ap: 'rev',
  apoc: 'rev',
  lc: 'luk',
  mc: 'mrk',
  mt: 'mat',
  rm: 'rom',
  ro: 'rom',
  ps: 'psa',
  ja: 'jas',
};

const ALIAS_MAP = new Map<string, Book>();

function put(alias: string, book: Book, force = false): void {
  const key = normalize(alias);
  if (!key) return;
  if (force || !ALIAS_MAP.has(key)) ALIAS_MAP.set(key, book);
}

for (const book of BOOKS) {
  for (const a of [book.names.pt, book.names.en, book.abbr.pt, book.abbr.en, book.id]) {
    put(a, book);
  }
}
for (const [id, list] of Object.entries(EXTRA_ALIASES)) {
  const book = BOOKS.find((b) => b.id === id);
  if (!book) continue;
  for (const a of list) put(a, book);
}
for (const [alias, id] of Object.entries(FORCE_ALIASES)) {
  const book = BOOKS.find((b) => b.id === id);
  if (book) put(alias, book, true);
}

for (const book of BOOKS) {
  book.aliases = [...ALIAS_MAP.entries()].filter(([, b]) => b.id === book.id).map(([k]) => k);
}

export function getBook(id: string): Book | undefined {
  return BOOKS.find((b) => b.id === id);
}

export function bookFromAlias(token: string): Book | undefined {
  return ALIAS_MAP.get(normalize(token));
}

/** resolve "jhn", "joão", "john", "1co"... para um livro */
export function resolveBook(param: string): Book | undefined {
  return getBook(param) ?? bookFromAlias(param);
}

export function searchBooks(raw: string, limit = 12): Book[] {
  const q = normalize(raw);
  if (!q) return [];
  const exact = ALIAS_MAP.get(q);
  const starts: Book[] = [];
  const contains: Book[] = [];
  for (const book of BOOKS) {
    if (exact && book.id === exact.id) continue;
    const hay = [
      book.names.pt,
      book.names.en,
      book.abbr.pt,
      book.abbr.en,
      book.id,
    ].map(normalize);
    if (hay.some((h) => h.startsWith(q))) starts.push(book);
    else if (hay.some((h) => h.includes(q))) contains.push(book);
    if (starts.length >= limit) break;
  }
  return [...(exact ? [exact] : []), ...starts, ...contains].slice(0, limit);
}

/** entende "joão 3", "jn 3:16", "salmos 23", "john 3" */
export function parseQuery(raw: string): {
  book?: Book;
  chapter?: number;
  verse?: number;
  books: Book[];
} {
  const nq = normalize(raw);
  if (!nq) return { books: [] };

  let rest = nq;
  let chapter: number | undefined;
  let verse: number | undefined;

  const m = nq.match(/^(.*?)(\d+)(?::(\d+))?$/);
  if (m) {
    rest = m[1].trim();
    const c = Number(m[2]);
    if (c > 0) {
      chapter = c;
      if (m[3]) verse = Number(m[3]);
    }
  }

  if (!rest) return { chapter, verse, books: [] };

  const exact = bookFromAlias(rest);
  const books = exact ? [exact] : searchBooks(rest, 12);
  return { book: exact, chapter, verse, books };
}
