import type { Book, Lang } from './types';

export function referenceFor(book: Book, chapter: number, lang: Lang): string {
  return `${book.names[lang]} ${chapter}`;
}

export function verseReference(
  book: Book,
  chapter: number,
  verse: number,
  lang: Lang,
): string {
  return `${book.names[lang]} ${chapter}:${verse}`;
}

export function formatCopyText(
  book: Book,
  chapter: number,
  verse: number,
  text: string,
  translationName: string,
  lang: Lang,
): string {
  return `${verseReference(book, chapter, verse, lang)} (${translationName})\n${text}`;
}

/** chave de destaque/marcado: bookId:chapter:verse */
export function highlightKey(bookId: string, chapter: number, verse: number): string {
  return `${bookId}:${chapter}:${verse}`;
}
