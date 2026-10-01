/**
 * Fonte unica das folhas empilhadas.
 *
 * A pagina e uma mesa: cada secao e uma folha opaca que fica presa enquanto a
 * seguinte sobe e cobre a anterior. Ordem, tom, pele e rotulo de menu vivem
 * nesta lista — `App`, `Stack` e Navbar leem daqui em vez de manterem cada um o
 * seu mapeamento.
 *
 * - `tone` define o fundo da folha, a tinta e a inversao dos neutros declarada
 *   em `src/styles/index.css`;
 * - `chrome` define como o cabecalho pousa sobre a folha: `glass` (vidro do tom,
 *   com blur e filete) ou `transparent` (solto, so onde existe cena de fundo).
 */
export const SECTIONS = [
  { id: 'inicio', tone: 'dark', chrome: 'transparent' },
  { id: 'overview', tone: 'light', chrome: 'glass', navLabelKey: 'nav.overview' },
  { id: 'howItWorks', tone: 'dark', chrome: 'glass', navLabelKey: 'nav.howItWorks' },
  { id: 'downloads', tone: 'light', chrome: 'glass', navLabelKey: 'nav.downloads' },
  { id: 'privacy', tone: 'dark', chrome: 'glass', navLabelKey: 'nav.privacy' },
  { id: 'faq', tone: 'light', chrome: 'glass', navLabelKey: 'nav.faq' },
  { id: 'research', tone: 'dark', chrome: 'glass' },
] as const

type SectionEntry = (typeof SECTIONS)[number]

export type SectionId = SectionEntry['id']

export type SectionTone = SectionEntry['tone']

/** Pele do cabecalho sobre a folha — ver o comentario acima. */
export type SectionChrome = SectionEntry['chrome']

/** Secoes que aparecem no menu: o hero fica de fora (o logo ja leva para `#inicio`). */
type NavEntry = Extract<SectionEntry, { navLabelKey: string }>

export const NAV_SECTIONS: readonly NavEntry[] = SECTIONS.filter(
  (section): section is NavEntry => 'navLabelKey' in section,
)

/** Tom declarado para a folha — consumido pelo `Section` e pela navbar. */
export function sectionTone(id: SectionId): SectionTone {
  return SECTIONS.find((section) => section.id === id)?.tone ?? 'light'
}

/** Pele do cabecalho sobre a folha — vidro do tom, salvo onde ha cena de fundo. */
export function sectionChrome(id: SectionId): SectionChrome {
  return SECTIONS.find((section) => section.id === id)?.chrome ?? 'glass'
}

/**
 * Posicao da folha na mesa (0 = primeira).
 *
 * A ordem da lista e a ordem de empilhamento: cada folha sobe um degrau de
 * `z-index`, entao a que chega cobre todas as anteriores.
 */
export function sectionIndex(id: SectionId): number {
  return SECTIONS.findIndex((section) => section.id === id)
}
