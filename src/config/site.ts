/** Identificadores das secoes ancoradas — usados pela navbar e pelo rodape. */
export const SECTION_IDS = [
  'overview',
  'howItWorks',
  'downloads',
  'privacy',
  'faq',
  'contact',
] as const

export type SectionId = (typeof SECTION_IDS)[number]

/** Links publicos do autor. Os repositorios de codigo sao privados e nao sao linkados. */
export const siteConfig = {
  name: 'TransferTool',
  author: 'Vitor Rosa',
  email: 'vitor.rosa.dev@outlook.com',
  linkedin: 'https://www.linkedin.com/in/vitorrosadev/',
  website: 'https://vitorrosadev.github.io/',
  github: 'https://github.com/VitorRosaDev',
} as const

export const CONTACT_LINKS = ['linkedin', 'email', 'website', 'github'] as const

export type ContactLinkId = (typeof CONTACT_LINKS)[number]
