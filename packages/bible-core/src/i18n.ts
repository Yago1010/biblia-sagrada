import type { Lang } from './types';

export interface Strings {
  appName: string;
  tagline: string;
  menu: string;
  search: string;
  searchPlaceholder: string;
  searchHint: string;
  searchVerses: string;
  searching: string;
  verses: string;
  noResults: string;
  open: string;
  chapters: string;
  chapter: string;
  verse: string;
  translations: string;
  language: string;
  theme: string;
  light: string;
  dark: string;
  system: string;
  all: string;
  old: string;
  new: string;
  copy: string;
  copied: string;
  share: string;
  highlight: string;
  removeHighlight: string;
  bookmarks: string;
  noBookmarks: string;
  close: string;
  back: string;
  prev: string;
  next: string;
  loading: string;
  retry: string;
  unavailable: string;
  selectChapter: string;
  invalidReference: string;
  fileMissing: (name: string) => string;
  serverDown: string;
  footerNote: string;
  sourcesTitle: string;
  sourceApi: string;
  sourceLocal: string;
}

export const STRINGS: Record<Lang, Strings> = {
  pt: {
    appName: 'Bíblia Sagrada',
    tagline: 'Todos os livros · NVI e outras traduções',
    menu: 'Menu',
    search: 'Buscar',
    searchPlaceholder: 'Buscar livro, capítulo ou versículo — ex.: João 3, salmos 23:1, amor',
    searchHint: 'Referências (João 3, jn 3:16) e texto dos versículos nas traduções instaladas.',
    searchVerses: 'Versículos',
    searching: 'Buscando…',
    verses: 'versículos',
    noResults: 'Nenhum resultado encontrado.',
    open: 'Abrir',
    chapters: 'capítulos',
    chapter: 'Capítulo',
    verse: 'Versículo',
    translations: 'Tradução',
    language: 'Idioma',
    theme: 'Tema',
    light: 'Claro',
    dark: 'Escuro',
    system: 'Sistema',
    all: 'Todos',
    old: 'Antigo',
    new: 'Novo',
    copy: 'Copiar',
    copied: 'Copiado',
    share: 'Compartilhar',
    highlight: 'Destacar',
    removeHighlight: 'Remover destaque',
    bookmarks: 'Marcados',
    noBookmarks: 'Nenhum versículo marcado ainda.',
    close: 'Fechar',
    back: 'Voltar',
    prev: 'Anterior',
    next: 'Próximo',
    loading: 'Carregando…',
    retry: 'Tentar novamente',
    unavailable: 'Indisponível',
    selectChapter: 'Selecionar capítulo',
    invalidReference: 'Referência inválida.',
    fileMissing: (name) =>
      `Arquivo da tradução ${name} não encontrado em server/data. Veja o README para instalar o JSON.`,
    serverDown: 'Não consegui falar com a API de versículos. Suba o servidor: npm run server',
    footerNote: 'Sem cadastro. Preferências guardadas no seu aparelho.',
    sourcesTitle: 'Fontes de dados',
    sourceApi: 'Ao vivo (bible-api.com) — Almeida, KJV, WEB, ASV, BBE, Darby, DRA, YLT, OEB, CUV, Clementine, RCCV, Synodal…',
    sourceLocal: 'JSON local — NVI, ACF, ARA, NIV (importe o seu em server/data)',
  },
  en: {
    appName: 'Holy Bible',
    tagline: 'All books · NIV and other translations',
    menu: 'Menu',
    search: 'Search',
    searchPlaceholder: 'Search book, chapter or verse — e.g. John 3, psalms 23:1, love',
    searchHint: 'References (John 3, jn 3:16) and verse text from installed translations.',
    searchVerses: 'Verses',
    searching: 'Searching…',
    verses: 'verses',
    noResults: 'No results found.',
    open: 'Open',
    chapters: 'chapters',
    chapter: 'Chapter',
    verse: 'Verse',
    translations: 'Translation',
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    all: 'All',
    old: 'Old Testament',
    new: 'New Testament',
    copy: 'Copy',
    copied: 'Copied',
    share: 'Share',
    highlight: 'Highlight',
    removeHighlight: 'Remove highlight',
    bookmarks: 'Bookmarks',
    noBookmarks: 'No verses bookmarked yet.',
    close: 'Close',
    back: 'Back',
    prev: 'Previous',
    next: 'Next',
    loading: 'Loading…',
    retry: 'Try again',
    unavailable: 'Unavailable',
    selectChapter: 'Select chapter',
    invalidReference: 'Invalid reference.',
    fileMissing: (name) =>
      `Translation file for ${name} not found in server/data. See the README to install the JSON.`,
    serverDown: 'Could not reach the verse API. Start the server: npm run server',
    footerNote: 'No account. Preferences stored on your device.',
    sourcesTitle: 'Data sources',
    sourceApi: 'Live (bible-api.com) — Almeida, KJV, WEB, ASV, BBE, Darby, DRA, YLT, OEB, CUV, Clementine, RCCV, Synodal…',
    sourceLocal: 'Local JSON — NVI, ACF, ARA, NIV (import yours into server/data)',
  },
};
