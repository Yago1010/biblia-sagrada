export type Lang = 'pt' | 'en';
export type Testament = 'ot' | 'nt';
export type TranslationSource = 'local' | 'api';

export interface Book {
  /** id canônico curto (gen, exo, ... jhn, rev) */
  id: string;
  /** posição 0..65 na ordem canônica — usada para indexar JSONs locais */
  index: number;
  testament: Testament;
  chapters: number;
  names: Record<Lang, string>;
  abbr: Record<Lang, string>;
  /** todos os aliases normalizados (sem acento, minúsculo) */
  aliases: string[];
  /** nome canônico em inglês usado na bible-api.com */
  apiName: string;
}

export interface Verse {
  n: number;
  text: string;
}

export interface ChapterPayload {
  translation: string;
  bookId: string;
  chapter: number;
  reference: string;
  verses: Verse[];
  source: TranslationSource;
}

export interface TranslationMeta {
  id: string;
  name: string;
  lang: Lang;
  source: TranslationSource;
  /** parâmetro de tradução da bible-api.com quando source === 'api' */
  api?: string;
  /** idioma dos nomes de livro aceitos pela bible-api (almeida exige PT) */
  bookLang?: Lang;
  /** tradução só tem Novo Testamento (ylt, cherokee) */
  ntOnly?: boolean;
}

export interface AvailableTranslation extends TranslationMeta {
  available: boolean;
}

/** resultado de busca textual de versículo (JSON locais) */
export interface VerseHit {
  translation: string;
  translationName: string;
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface SearchResult {
  hits: VerseHit[];
  truncated: boolean;
}

export interface ParsedQuery {
  book?: Book;
  chapter?: number;
  verse?: number;
  books: Book[];
}
