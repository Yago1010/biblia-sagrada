'use client';

import { BOOKS } from '@biblia/core';
import { useApp } from '../lib/store';

export type TestamentFilter = 'all' | 'ot' | 'nt';

export function BookGrid({
  filter,
  onOpen,
}: {
  filter: TestamentFilter;
  onOpen: (bookId: string) => void;
}) {
  const { lang, s } = useApp();

  const groups: { key: string; label: string; ids: string[] }[] = [];
  if (filter === 'all' || filter === 'ot') {
    groups.push({
      key: 'ot',
      label: s.old,
      ids: BOOKS.filter((b) => b.testament === 'ot').map((b) => b.id),
    });
  }
  if (filter === 'all' || filter === 'nt') {
    groups.push({
      key: 'nt',
      label: s.new,
      ids: BOOKS.filter((b) => b.testament === 'nt').map((b) => b.id),
    });
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.key}>
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            {group.label}
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {group.ids.map((id) => {
              const book = BOOKS.find((b) => b.id === id)!;
              return (
                <button
                  key={id}
                  onClick={() => onOpen(id)}
                  className="sheet flex items-baseline justify-between gap-2 px-3 py-2.5 text-left transition hover:-translate-y-px hover:border-accent"
                >
                  <span className="truncate text-sm font-medium">{book.names[lang]}</span>
                  <span className="shrink-0 text-[11px] text-muted">
                    {book.chapters} {s.chapters}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
