import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { useColorScheme } from 'react-native';
import { fetchTranslations } from './api';
import { palette, type Palette, type ResolvedMode } from './theme';

const LS_LANG = 'biblia:lang';
const LS_TRANSLATION = 'biblia:translation';
const LS_HIGHLIGHTS = 'biblia:highlights';
const LS_MODE = 'biblia:mode';

export type ThemeMode = 'light' | 'dark' | 'system';

interface AppState {
  hydrated: boolean;
  lang: Lang;
  setLang: (lang: Lang) => void;
  translationId: string;
  setTranslationId: (id: string) => void;
  translations: AvailableTranslation[];
  translationsLoaded: boolean;
  s: Strings;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  cycleMode: () => void;
  resolvedMode: ResolvedMode;
  colors: Palette;
  highlights: string[];
  isHighlighted: (key: string) => boolean;
  toggleHighlight: (key: string) => void;
  makeKey: (bookId: string, chapter: number, verse: number) => string;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [hydrated, setHydrated] = useState(false);
  const [lang, setLangState] = useState<Lang>('pt');
  const [translationId, setTranslationIdState] = useState('almeida');
  const [translations, setTranslations] = useState<AvailableTranslation[]>([]);
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [highlights, setHighlights] = useState<string[]>([]);

  const translationsRef = useRef<AvailableTranslation[]>([]);
  useEffect(() => {
    translationsRef.current = translations;
  }, [translations]);

  // preferências salvas
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const entries = await AsyncStorage.multiGet([
          LS_LANG,
          LS_TRANSLATION,
          LS_HIGHLIGHTS,
          LS_MODE,
        ]);
        if (!alive) return;
        const map = Object.fromEntries(entries);
        const storedLang = map[LS_LANG];
        if (storedLang === 'pt' || storedLang === 'en') setLangState(storedLang);
        const storedTranslation = map[LS_TRANSLATION];
        if (storedTranslation) setTranslationIdState(storedTranslation);
        const storedMode = map[LS_MODE];
        if (storedMode === 'light' || storedMode === 'dark' || storedMode === 'system') {
          setModeState(storedMode);
        }
        const storedHighlights = map[LS_HIGHLIGHTS];
        if (storedHighlights) {
          const parsed = JSON.parse(storedHighlights);
          if (Array.isArray(parsed)) {
            setHighlights(parsed.filter((k) => typeof k === 'string'));
          }
        }
      } catch {
        // storage indisponível — segue com padrões
      }
      if (alive) setHydrated(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // traduções disponíveis
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

  // mantém tradução utilizável para o idioma atual
  useEffect(() => {
    if (!hydrated || translations.length === 0) return;
    const current = translations.find((t) => t.id === translationId);
    if (current && current.available && current.lang === lang) return;
    const fallback =
      translations.find((t) => t.lang === lang && t.available) ??
      translations.find((t) => t.available);
    if (fallback && fallback.id !== translationId) setTranslationIdState(fallback.id);
  }, [hydrated, translations, translationId, lang]);

  // persistência
  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(LS_LANG, lang).catch(() => {});
  }, [lang, hydrated]);
  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(LS_TRANSLATION, translationId).catch(() => {});
  }, [translationId, hydrated]);
  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(LS_MODE, mode).catch(() => {});
  }, [mode, hydrated]);
  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(LS_HIGHLIGHTS, JSON.stringify(highlights)).catch(() => {});
  }, [highlights, hydrated]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    setTranslationIdState((currentId) => {
      const list = translationsRef.current;
      const current = list.find((t) => t.id === currentId);
      if (current && current.lang === next) return currentId;
      const target =
        list.find((t) => t.lang === next && t.available) ?? list.find((t) => t.lang === next);
      return target ? target.id : currentId;
    });
  }, []);

  const setTranslationId = useCallback((id: string) => setTranslationIdState(id), []);
  const setMode = useCallback((next: ThemeMode) => setModeState(next), []);
  const cycleMode = useCallback(() => {
    setModeState((prev) => (prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light'));
  }, []);

  const toggleHighlight = useCallback((key: string) => {
    setHighlights((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }, []);
  const isHighlighted = useCallback((key: string) => highlights.includes(key), [highlights]);
  const makeKey = useCallback(
    (bookId: string, chapter: number, verse: number) => highlightKey(bookId, chapter, verse),
    [],
  );

  const resolvedMode: ResolvedMode =
    mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
  const s = STRINGS[lang];

  const value = useMemo<AppState>(
    () => ({
      hydrated,
      lang,
      setLang,
      translationId,
      setTranslationId,
      translations,
      translationsLoaded: translations.length > 0,
      s,
      mode,
      setMode,
      cycleMode,
      resolvedMode,
      colors: palette(resolvedMode),
      highlights,
      isHighlighted,
      toggleHighlight,
      makeKey,
    }),
    [
      hydrated,
      lang,
      setLang,
      translationId,
      setTranslationId,
      translations,
      s,
      mode,
      setMode,
      cycleMode,
      resolvedMode,
      highlights,
      isHighlighted,
      toggleHighlight,
      makeKey,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp precisa estar dentro de AppProvider');
  return ctx;
}
