'use client';

import { getBook, type Lang } from '@biblia/core';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useApp } from '../lib/store';
import { IconX } from './icons';

type ThemeChoice = 'light' | 'dark' | 'system';

export function MenuPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang, setLang, translationId, setTranslationId, translations, s, highlights, toggleHighlight } =
    useApp();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  if (!open) return null;

  const themes: { id: ThemeChoice; label: string }[] = [
    { id: 'light', label: s.light },
    { id: 'dark', label: s.dark },
    { id: 'system', label: s.system },
  ];
  const langs: { id: Lang; label: string }[] = [
    { id: 'pt', label: 'Português' },
    { id: 'en', label: 'English' },
  ];

  const openBookmark = (key: string) => {
    const [bookId, chapter, verse] = key.split(':');
    onClose();
    router.push(`/${bookId}/${chapter}#v${verse}`);
  };

  const rowClass =
    'flex w-full items-center justify-between rounded-xl border border-line px-3 py-2.5 text-left text-sm transition hover:border-accent';

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <aside className="absolute left-0 top-0 flex h-full w-80 max-w-[88vw] flex-col border-r border-line bg-card">
        <div className="flex items-center justify-between border-b border-line px-4 py-4">
          <div>
            <div className="text-sm font-semibold">{s.appName}</div>
            <div className="text-[11px] text-muted">{s.tagline}</div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label={s.close}>
            <IconX />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
              {s.theme}
            </h3>
            <div className="flex gap-2">
              {themes.map((option) => (
                <button
                  key={option.id}
                  className={`chip flex-1 justify-center ${theme === option.id ? 'chip-on' : ''}`}
                  onClick={() => setTheme(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
              {s.language}
            </h3>
            <div className="flex gap-2">
              {langs.map((option) => (
                <button
                  key={option.id}
                  className={`chip flex-1 justify-center ${lang === option.id ? 'chip-on' : ''}`}
                  onClick={() => setLang(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
              {s.translations}
            </h3>
            <div className="space-y-1.5">
              {translations.map((item) => (
                <button
                  key={item.id}
                  disabled={!item.available}
                  onClick={() => setTranslationId(item.id)}
                  className={`${rowClass} ${
                    translationId === item.id ? 'border-accent bg-accent/10' : ''
                  } ${item.available ? '' : 'cursor-not-allowed opacity-50'}`}
                >
                  <span>
                    <span className="font-medium">{item.name}</span>
                    <span className="ml-2 text-[11px] uppercase text-muted">{item.lang}</span>
                  </span>
                  {!item.available && (
                    <span className="text-[11px] text-muted">{s.unavailable}</span>
                  )}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
              {s.bookmarks}
            </h3>
            {highlights.length === 0 ? (
              <p className="text-sm text-muted">{s.noBookmarks}</p>
            ) : (
              <div className="space-y-1.5">
                {highlights.map((key) => {
                  const [bookId, chapter, verse] = key.split(':');
                  const book = getBook(bookId);
                  return (
                    <div key={key} className={rowClass}>
                      <button className="flex-1 text-left" onClick={() => openBookmark(key)}>
                        {book ? book.names[lang] : bookId} {chapter}:{verse}
                      </button>
                      <button
                        className="btn-icon !h-6 !w-6 text-muted"
                        onClick={() => toggleHighlight(key)}
                        aria-label={s.removeHighlight}
                      >
                        <IconX className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
              {s.sourcesTitle}
            </h3>
            <ul className="space-y-1 text-[12px] leading-relaxed text-muted">
              <li>{s.sourceApi}</li>
              <li>{s.sourceLocal}</li>
            </ul>
          </section>
        </div>

        <div className="border-t border-line px-4 py-3 text-[11px] text-muted">{s.footerNote}</div>
      </aside>
    </div>
  );
}
