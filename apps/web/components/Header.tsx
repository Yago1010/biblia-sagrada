'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useApp } from '../lib/store';
import { IconMenu, IconMoon, IconSearch, IconSun } from './icons';

export function Header({ onMenu, onSearch }: { onMenu: () => void; onSearch: () => void }) {
  const { s } = useApp();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === 'dark';

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-base/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-3">
        <button className="btn-icon" onClick={onMenu} aria-label={s.menu} title={s.menu}>
          <IconMenu />
        </button>
        <div className="flex-1 text-center">
          <span className="text-[15px] font-semibold tracking-wide">{s.appName}</span>
        </div>
        <button className="btn-icon" onClick={onSearch} aria-label={s.search} title={s.search}>
          <IconSearch />
        </button>
        <button
          className="btn-icon"
          onClick={() => setTheme(dark ? 'light' : 'dark')}
          aria-label={s.theme}
          title={s.theme}
        >
          {dark ? <IconSun /> : <IconMoon />}
        </button>
      </div>
    </header>
  );
}
