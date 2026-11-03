import type { TranslationMeta } from './types';

/**
 * Traduções registradas.
 *  - source 'api'   : servidas ao vivo pela bible-api.com (17 traduções) — funcionam sem arquivo.
 *  - source 'local' : exigem JSON em server/data/<id>.json (NVI, ACF, ARA, NIV).
 *                     NVI/NIV/ACF/ARA são licenciados: o JSON vem do seu próprio acervo — ver README.
 *
 * bookLang: almeida na bible-api só aceita nomes PT ("Salmos 23", não "Psalms 23").
 * ntOnly:   ylt e cherokee são somente Novo Testamento na fonte.
 */
export const TRANSLATIONS: TranslationMeta[] = [
  // --- português (local, licenciado) ---
  { id: 'nvi', name: 'NVI', lang: 'pt', source: 'local' },
  { id: 'acf', name: 'ACF', lang: 'pt', source: 'local' },
  { id: 'ara', name: 'ARA', lang: 'pt', source: 'local' },
  { id: 'aa', name: 'Almeida Atual.', lang: 'pt', source: 'local' },
  // --- português (api) ---
  { id: 'almeida', name: 'Almeida', lang: 'pt', source: 'api', api: 'almeida', bookLang: 'pt' },
  // --- inglês (api) ---
  { id: 'kjv', name: 'KJV', lang: 'en', source: 'api', api: 'kjv' },
  { id: 'web', name: 'WEB', lang: 'en', source: 'api', api: 'web' },
  { id: 'asv', name: 'ASV', lang: 'en', source: 'api', api: 'asv' },
  { id: 'bbe', name: 'BBE', lang: 'en', source: 'api', api: 'bbe' },
  { id: 'darby', name: 'Darby', lang: 'en', source: 'api', api: 'darby' },
  { id: 'dra', name: 'DRA', lang: 'en', source: 'api', api: 'dra' },
  { id: 'webbe', name: 'WEB-UK', lang: 'en', source: 'api', api: 'webbe' },
  { id: 'oeb-us', name: 'OEB-US', lang: 'en', source: 'api', api: 'oeb-us' },
  { id: 'oeb-cw', name: 'OEB-CW', lang: 'en', source: 'api', api: 'oeb-cw' },
  { id: 'ylt', name: 'YLT', lang: 'en', source: 'api', api: 'ylt', ntOnly: true },
  { id: 'cherokee', name: 'Cherokee', lang: 'en', source: 'api', api: 'cherokee', ntOnly: true },
  // --- outras línguas (api) ---
  { id: 'cuv', name: 'CUV 中文', lang: 'en', source: 'api', api: 'cuv' },
  { id: 'bkr', name: 'BKR čeština', lang: 'en', source: 'api', api: 'bkr' },
  { id: 'clementine', name: 'Clementine Latina', lang: 'en', source: 'api', api: 'clementine' },
  { id: 'rccv', name: 'RCCV română', lang: 'en', source: 'api', api: 'rccv' },
  { id: 'synodal', name: 'Synodal русский', lang: 'en', source: 'api', api: 'synodal' },
  // --- inglês (local, licenciado) ---
  { id: 'niv', name: 'NIV', lang: 'en', source: 'local' },
];

export function getTranslation(id: string): TranslationMeta | undefined {
  return TRANSLATIONS.find((t) => t.id === id);
}
