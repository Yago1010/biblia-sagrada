'use client';

import { BOOKS } from '@biblia/core';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BookGrid, type TestamentFilter } from '../components/BookGrid';
import { Header } from '../components/Header';
import { IconSearch } from '../components/icons';
import { MenuPanel } from '../components/MenuPanel';
import { SearchDialog } from '../components/SearchDialog';
import { useApp } from '../lib/store';

export default function HomePage() {
  const { lang, setLang, translationId, setTranslationId, translations, s } = useApp();
  const router = useRouter();
  const [filter, setFilter] = useState<TestamentFilter>('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filters: { id: TestamentFilter; label: string }[] = [
    { id: 'all', label: s.all },
    { id: 'ot', label: s.old },
    { id: 'nt', label: s.new },
  ];

  return (
    <div className="min-h-screen">
      <Header onMenu={() => setMenuOpen(true)} onSearch={() => setSearchOpen(true)} />

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6">
        <section className="mb-5">
          <p className="text-sm text-muted">{s.tagline}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted">
            {BOOKS.length} {s.all.toLowerCase() === 'all' ? 'books' : 'livros'} ·{' '}
            {BOOKS.reduce((sum, b) => sum + b.chapters, 0)} {s.chapters}
          </p>
        </section>

        {/* tradução + idioma */}
        <section className="mb-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
              {s.translations}
            </span>
            <div className="flex gap-1.5">
              {(['pt', 'en'] as const).map((code) => (
                <button
                  key={code}
                  className={`chip !px-2.5 !py-1 text-xs ${lang === code ? 'chip-on' : ''}`}
                  onClick={() => setLang(code)}
                >
                  {code === 'pt' ? 'Português' : 'English'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {translations.map((item) => (
              <button
                key={item.id}
                disabled={!item.available}
                onClick={() => setTranslationId(item.id)}
                title={item.available ? item.name : `${item.name} — ${s.unavailable}`}
                className={`chip ${
                  translationId === item.id ? 'chip-on' : ''
                } ${item.available ? '' : 'cursor-not-allowed opacity-45'}`}
              >
                {item.name}
                <span className="text-[10px] uppercase opacity-70">{item.lang}</span>
              </button>
            ))}
            {translations.length === 0 && (
              <button className="chip" onClick={() => setSearchOpen(true)}>
                <IconSearch className="h-4 w-4" />
                {s.search}
              </button>
            )}
          </div>
        </section>

        {/* busca */}
        <button
          onClick={() => setSearchOpen(true)}
          className="mb-5 flex h-11 w-full items-center gap-2 rounded-xl border border-line bg-card px-3 text-left text-sm text-muted transition hover:border-accent"
        >
          <IconSearch className="h-4 w-4" />
          <span className="truncate">{s.searchPlaceholder}</span>
          <kbd className="ml-auto hidden rounded border border-line px-1.5 py-0.5 text-[10px] sm:block">
            Ctrl K
          </kbd>
        </button>

        {/* filtro de testamento */}
        <div className="mb-4 flex gap-2">
          {filters.map((option) => (
            <button
              key={option.id}
              className={`chip ${filter === option.id ? 'chip-on' : ''}`}
              onClick={() => setFilter(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <BookGrid filter={filter} onOpen={(bookId) => router.push(`/${bookId}/1`)} />

        <p className="mt-10 text-center text-[11px] text-muted">{s.footerNote}</p>
      </main>

      <MenuPanel open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
