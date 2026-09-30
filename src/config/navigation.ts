import type { SectionId } from './site'

/**
 * Rotulos de navegacao em chaves literais: permite tipagem estrita do `t()`
 * e reuso pela navbar e pelo rodape sem duplicar mapeamentos.
 */
export const NAV_LABEL_KEY = {
  overview: 'nav.overview',
  howItWorks: 'nav.howItWorks',
  downloads: 'nav.downloads',
  privacy: 'nav.privacy',
  faq: 'nav.faq',
  contact: 'nav.contact',
} as const satisfies Record<SectionId, string>
