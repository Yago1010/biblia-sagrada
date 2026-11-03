'use client';

import {
  BOOKS,
  formatCopyText,
  getBook,
  highlightKey,
  referenceFor,
  type ChapterPayload,
} from '@biblia/core';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ApiError, fetchChapter } from '../lib/api';
import { useApp } from '../lib/store';
import { MenuPanel } from './MenuPanel';
import { SearchDialog } from './SearchDialog';
import {
  IconArrowLeft,
  IconBookmark,
  IconCheck,
  IconCopy,
  IconMenu,
  IconMoon,
  IconSearch,
  IconShare,
  IconSun,
  IconX,
} from './icons';
import { useTheme } from 'next-themes';

export function ChapterView({ bookId, rawChapter }: { bookId: string; rawChapter: string }) {
  const { lang, translationId, translations, s, isHighlighted, toggleHighlight, makeKey } = useApp();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  const book = getBook(bookId);
  const chapter = Number(rawChapter);
  const valid = Boolean(book) && Number.isInteger(chapter) && chapter >= 1 && chapter <= book!.chapters;

  const [data, setData] = useState<ChapterPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const translationsRef = useRef(translations);
  useEffect(() => {
    translationsRef.current = translations;
  }, [translations]);
  useEffect(() => setMounted(true), []);

  const translationName =
    translationsRef.current.find((t) => t.id === translationId)?.name ?? translationId;

  const step = (dir: -1 | 1) => {
    if (!book) return;
    const target = chapter + dir;
    if (target >= 1 && target <= book.chapters) {
      router.push(`/${book.id}/${target}`);
      return;
    }
    const neighbour = BOOKS[book.index + dir];
    if (neighbour) router.push(`/${neighbour.id}/${dir === 1 ? 1 : neighbour.chapters}`);
  };

  useEffect(() => {
    setSelected(null);
    setPickerOpen(false);
    setCopied(false);

    if (!valid) {
      setData(null);
      setError(s.invalidReference);
      setLoading(false);
      return;
    }

    let alive = true;
    setLoading(true);
    setError(null);
    fetchChapter(translationId, bookId, chapter)
      .then((payload) => {
        if (alive) setData(payload);
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setData(null);
        if (err instanceof ApiError) {
          const name =
            translationsRef.current.find((t) => t.id === translationId)?.name ?? translationId;
          setError(
            err.code === 'translation_file_missing'
              ? s.fileMissing(name)
              : err.code === 'network'
                ? s.serverDown
                : err.message,
          );
        } else {
          setError(String(err));
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
    // s/translationName proposital: s e nome trocam sem precisar rebuscar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translationId, bookId, chapter, valid, attempt]);

  // destaque vindo dos marcados: /jo/3#v16
  useEffect(() => {
    if (!data) return;
    const match = window.location.hash.match(/^#v(\d+)$/);
    if (match) {
      document.getElementById(`v${match[1]}`)?.scrollIntoView({ block: 'center' });
    }
  }, [data]);

  // setas do teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'Escape') {
        setSelected(null);
        setPickerOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const verse = selected !== null ? data?.verses.find((v) => v.n === selected) ?? null : null;

  const flashCopied = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const copyVerse = async () => {
    if (!book || !verse) return;
    const text = formatCopyText(book, chapter, verse.n, verse.text, translationName, lang);
    try {
      await navigator.clipboard.writeText(text);
      flashCopied();
    } catch {
      /* clipboard bloqueado — mantém a seleção visível para cópia manual */
    }
  };

  const shareVerse = async () => {
    if (!book || !verse) return;
    const reference = referenceFor(book, chapter, lang);
    const text = `${reference}:${verse.n} (${translationName})\n${verse.text}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: reference, text });
      } catch {
        /* usuário cancelou */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      flashCopied();
    } catch {
      /* sem share nem clipboard */
    }
  };

  const dark = mounted && resolvedTheme === 'dark';

  return (
    <main className="min-h-screen pb-40">
      <header className="sticky top-0 z-40 border-b border-line bg-base/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-3">
          <Link href="/" className="btn-icon" aria-label={s.back}>
            <IconArrowLeft />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <div className="truncate text-[15px] font-semibold">
              {book ? book.names[lang] : bookId}
            </div>
            <button
              onClick={() => setPickerOpen((v) => !v)}
              className="max-w-full truncate text-[11px] text-muted transition hover:text-ink"
              title={s.selectChapter}
            >
              {s.chapter} {chapter}
              {book ? ` / ${book.chapters}` : ''} · {translationName} ▾
            </button>
          </div>
          <button className="btn-icon" onClick={() => setSearchOpen(true)} aria-label={s.search}>
            <IconSearch />
          </button>
          <button
            className="btn-icon"
            onClick={() => setTheme(dark ? 'light' : 'dark')}
            aria-label={s.theme}
          >
            {dark ? <IconSun /> : <IconMoon />}
          </button>
          <button className="btn-icon" onClick={() => setMenuOpen(true)} aria-label={s.menu}>
            <IconMenu />
          </button>
        </div>

        {pickerOpen && book && (
          <div className="border-t border-line bg-card">
            <div className="mx-auto max-w-3xl px-3 py-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                  {s.selectChapter}
                </span>
                <button className="btn-icon !h-6 !w-6" onClick={() => setPickerOpen(false)}>
                  <IconX className="h-4 w-4" />
                </button>
              </div>
              <div className="grid max-h-56 grid-cols-8 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-12">
                {Array.from({ length: book.chapters }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => router.push(`/${book.id}/${n}`)}
                    className={`h-8 rounded-md border text-xs transition ${
                      n === chapter
                        ? 'border-transparent bg-accent text-onaccent'
                        : 'border-line hover:border-accent'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="mx-auto max-w-3xl px-4 pt-6">
        {loading && <p className="py-16 text-center text-sm text-muted">{s.loading}</p>}

        {!loading && error && (
          <div className="sheet mt-4 p-6 text-center">
            <p className="text-sm leading-relaxed">{error}</p>
            <button className="chip mt-4" onClick={() => setAttempt((n) => n + 1)}>
              {s.retry}
            </button>
          </div>
        )}

        {!loading && data && (
          <>
            <div className="mb-4 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-muted">
              <span>{data.reference}</span>
              <span>
                {data.verses.length} {s.verse}s
              </span>
            </div>

            <div className="space-y-0.5">
              {data.verses.map((item) => {
                const key = makeKey(bookId, chapter, item.n);
                const highlighted = isHighlighted(key);
                const isSelected = selected === item.n;
                return (
                  <div
                    key={item.n}
                    id={`v${item.n}`}
                    onClick={() => setSelected(isSelected ? null : item.n)}
                    className={`-mx-3 flex cursor-pointer gap-3 rounded-xl px-3 py-2 transition ${
                      isSelected ? 'bg-card' : 'hover:bg-card/60'
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(isSelected ? null : item.n);
                      }}
                      className={`mt-1.5 w-6 shrink-0 select-none text-right font-sans text-[11px] font-bold ${
                        highlighted ? 'text-accent' : 'text-muted'
                      }`}
                      aria-label={`${s.verse} ${item.n}`}
                    >
                      {item.n}
                    </button>
                    <p
                      className={`font-serif text-[1.06rem] leading-8 ${highlighted ? 'hl' : ''}`}
                    >
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>

            <nav className="mt-8 flex items-center justify-between gap-2">
              <StepButton dir={-1} label={s.prev} onStep={step} />
              <button
                className="chip"
                onClick={() => {
                  setPickerOpen(true);
                  window.scrollTo({ top: 0 });
                }}
              >
                {s.selectChapter}
              </button>
              <StepButton dir={1} label={s.next} onStep={step} />
            </nav>
          </>
        )}
      </div>

      {verse && book && selected !== null && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 backdrop-blur">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2 px-3 py-3">
            <span className="mr-auto truncate text-xs text-muted">
              {referenceFor(book, chapter, lang)}:{verse.n}
            </span>
            <button className="chip" onClick={copyVerse}>
              {copied ? <IconCheck className="h-4 w-4" /> : <IconCopy className="h-4 w-4" />}
              {copied ? s.copied : s.copy}
            </button>
            <button className="chip" onClick={shareVerse}>
              <IconShare className="h-4 w-4" />
              {s.share}
            </button>
            <button
              className={`chip ${isHighlighted(makeKey(bookId, chapter, verse.n)) ? 'chip-on' : ''}`}
              onClick={() => toggleHighlight(makeKey(bookId, chapter, verse.n))}
            >
              <IconBookmark className="h-4 w-4" />
              {isHighlighted(makeKey(bookId, chapter, verse.n)) ? s.removeHighlight : s.highlight}
            </button>
            <button className="btn-icon" onClick={() => setSelected(null)} aria-label={s.close}>
              <IconX />
            </button>
          </div>
        </div>
      )}

      <MenuPanel open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </main>
  );
}

function StepButton({
  dir,
  label,
  onStep,
}: {
  dir: -1 | 1;
  label: string;
  onStep: (dir: -1 | 1) => void;
}) {
  return (
    <button className="chip" onClick={() => onStep(dir)}>
      {dir === -1 ? '←' : ''} {label} {dir === 1 ? '→' : ''}
    </button>
  );
}
