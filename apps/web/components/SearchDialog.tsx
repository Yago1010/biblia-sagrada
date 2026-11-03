'use client';

import { getBook, parseQuery, type VerseHit } from '@biblia/core';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { searchVerses } from '../lib/api';
import { useApp } from '../lib/store';
import { IconSearch, IconX } from './icons';

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { s, lang } = useApp();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<VerseHit[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const reqId = useRef(0);

  const parsed = useMemo(() => parseQuery(q), [q]);
  const hasQuery = q.trim().length > 0;
  const primary = parsed.book && parsed.chapter ? parsed : null;

  useEffect(() => {
    if (!open) return;
    setQ('');
    setHits([]);
    const timer = setTimeout(() => inputRef.current?.focus(), 40);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // busca textual de versículos (debounce)
  useEffect(() => {
    if (!open) return;
    const term = q.trim();
    if (term.length < 2) {
      setHits([]);
      setSearching(false);
      return;
    }
    const id = ++reqId.current;
    setSearching(true);
    const timer = setTimeout(() => {
      searchVerses(term)
        .then((res) => {
          if (reqId.current === id) setHits(res.hits);
        })
        .catch(() => {
          if (reqId.current === id) setHits([]);
        })
        .finally(() => {
          if (reqId.current === id) setSearching(false);
        });
    }, 300);
    return () => clearTimeout(timer);
  }, [q, open]);

  const go = (bookId: string, chapter?: number, verse?: number) => {
    router.push(`/${bookId}/${chapter ?? 1}${verse ? `#v${verse}` : ''}`);
    onClose();
  };

  const submit = () => {
    if (primary?.book && primary.chapter) {
      go(primary.book.id, primary.chapter, primary.verse);
      return;
    }
    const first = parsed.books[0];
    if (first) go(first.id, 1);
    else if (hits[0]) go(hits[0].bookId, hits[0].chapter, hits[0].verse);
  };

  if (!open) return null;

  const showBooks = hasQuery && parsed.books.length > 0;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 mx-auto w-full max-w-lg px-3 pt-16 sm:pt-24">
        <form
          className="sheet overflow-hidden shadow-2xl shadow-black/20"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="flex items-center gap-2 border-b border-line px-4">
            <IconSearch className="h-4 w-4 shrink-0 text-muted" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={s.searchPlaceholder}
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted"
              autoComplete="off"
              spellCheck={false}
            />
            <button type="button" className="btn-icon !h-7 !w-7" onClick={onClose} aria-label={s.close}>
              <IconX className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[55vh] overflow-y-auto p-2">
            {!hasQuery && <p className="px-3 py-4 text-sm text-muted">{s.searchHint}</p>}

            {hasQuery && primary && (
              <button
                type="button"
                onClick={() => go(primary.book!.id, primary.chapter, primary.verse)}
                className="flex w-full items-center justify-between rounded-xl bg-accent px-4 py-3 text-left text-onaccent"
              >
                <span className="font-semibold">
                  {primary.book!.names[lang]} {primary.chapter}
                  {primary.verse ? `:${primary.verse}` : ''}
                </span>
                <span className="text-xs opacity-80">{s.open} →</span>
              </button>
            )}

            {showBooks && (
              <div className="mt-1">
                {parsed.books.map((book) => (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => go(book.id, 1)}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left transition hover:bg-base"
                  >
                    <span className="text-sm">{book.names[lang]}</span>
                    <span className="text-[11px] text-muted">
                      {book.chapters} {s.chapters}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {hasQuery && searching && (
              <p className="px-3 py-3 text-sm text-muted">{s.searching}</p>
            )}

            {hasQuery && !searching && hits.length > 0 && (
              <div className="mt-1">
                <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                  {s.searchVerses}
                </div>
                {hits.map((hit) => {
                  const book = getBook(hit.bookId);
                  return (
                    <button
                      key={`${hit.translation}:${hit.bookId}:${hit.chapter}:${hit.verse}`}
                      type="button"
                      onClick={() => go(hit.bookId, hit.chapter, hit.verse)}
                      className="flex w-full flex-col gap-0.5 rounded-xl px-4 py-2.5 text-left transition hover:bg-base"
                    >
                      <span className="flex items-baseline gap-2">
                        <span className="text-[11px] font-semibold text-accent">
                          {book ? book.names[lang] : hit.bookId} {hit.chapter}:{hit.verse}
                        </span>
                        <span className="text-[10px] uppercase text-muted">{hit.translationName}</span>
                      </span>
                      <span className="line-clamp-2 text-[13px] leading-snug text-ink">
                        {hit.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {hasQuery &&
              !searching &&
              hits.length === 0 &&
              parsed.books.length === 0 &&
              !primary && (
                <p className="px-3 py-4 text-sm text-muted">{s.noResults}</p>
              )}
          </div>
        </form>
      </div>
    </div>
  );
}
