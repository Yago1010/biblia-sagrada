'use client';

import {
  STRINGS,
  highlightKey,
  type AvailableTranslation,
  type Lang,
  type Strings,
} from '@biblia/core';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { fetchTranslations } from './api';

const LS_LANG = 'biblia:lang';
const LS_TRANSLATION = 'biblia:translation';
const LS_HIGHLIGHTS = 'biblia:highlights';

interface AppState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  translationId: string;
  setTranslationId: (id: string) => void;
  translations: AvailableTranslation[];
  translationsLoaded: boolean;
  s: Strings;
  highlights: string[];
  isHighlighted: (key: string) => boolean;
  toggleHighlight: (key: string) => void;
  makeKey: (bookId: string, chapter: number, verse: number) => string;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('pt');
  const [translationId, setTranslationIdState] = useState('almeida');
  const [translations, setTranslations] = useState<AvailableTranslation[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // ref estável para leitura dentro de callbacks
  const translationsRef = useRef<AvailableTranslation[]>([]);

  // lê preferências salvas no aparelho
  useEffect(() => {
    try {
      const storedLang = localStorage.getItem(LS_LANG);
      if (storedLang === 'pt' || storedLang === 'en') setLangState(storedLang);
      const storedTranslation = localStorage.getItem(LS_TRANSLATION);
      if (storedTranslation) setTranslationIdState(storedTranslation);
      const storedHighlights = localStorage.getItem(LS_HIGHLIGHTS);
      if (storedHighlights) {
        const parsed = JSON.parse(storedHighlights);
        if (Array.isArray(parsed)) setHighlights(parsed.filter((k) => typeof k === 'string'));
      }
    } catch {
      // storage indisponível — segue com padrões
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    let alive = true;
    fetchTranslations()
      .then((list) => {
        if (alive) setTranslations(list);
      })
      .catch(() => {
        if (alive) setTranslations([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    translationsRef.current = translations;
  }, [translations]);

  // persiste
  useEffect(() => {
    if (hydrated) localStorage.setItem(LS_LANG, lang);
  }, [lang, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(LS_TRANSLATION, translationId);
  }, [translationId, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(LS_HIGHLIGHTS, JSON.stringify(highlights));
  }, [highlights, hydrated]);

  // mantém uma tradução utilizável para o idioma atual
  useEffect(() => {
    if (!hydrated || translations.length === 0) return;
    const current = translations.find((t) => t.id === translationId);
    if (current && current.available && current.lang === lang) return;
    const fallback =
      translations.find((t) => t.lang === lang && t.available) ??
      translations.find((t) => t.available);
    if (fallback && fallback.id !== translationId) setTranslationIdState(fallback.id);
  }, [hydrated, translations, translationId, lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    setTranslationIdState((currentId) => {
      // troca junto para a tradução do novo idioma
      const list = translationsRef.current;
      const current = list.find((t) => t.id === currentId);
      if (current && current.lang === next) return currentId;
      const target =
        list.find((t) => t.lang === next && t.available) ?? list.find((t) => t.lang === next);
      return target ? target.id : currentId;
    });
  }, []);

  const setTranslationId = useCallback((id: string) => setTranslationIdState(id), []);

  const toggleHighlight = useCallback((key: string) => {
    setHighlights((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }, []);

  const isHighlighted = useCallback((key: string) => highlights.includes(key), [highlights]);

  const makeKey = useCallback(
    (bookId: string, chapter: number, verse: number) => highlightKey(bookId, chapter, verse),
    [],
  );

  const s = STRINGS[lang];

  const value = useMemo<AppState>(
    () => ({
      lang,
      setLang,
      translationId,
      setTranslationId,
      translations,
      translationsLoaded: translations.length > 0,
      s,
      highlights,
      isHighlighted,
      toggleHighlight,
      makeKey,
    }),
    [lang, setLang, translationId, setTranslationId, translations, s, highlights, isHighlighted, toggleHighlight, makeKey],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp precisa estar dentro de AppProvider');
  return ctx;
}
