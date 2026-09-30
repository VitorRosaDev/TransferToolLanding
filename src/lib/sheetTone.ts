import { createContext, useContext } from 'react'

import type { SectionTone } from '../config/sections'

/**
 * Tom da folha em que o componente esta montado.
 *
 * O padrao e `light`: o que esta fora de uma folha (navbar, rodape, aviso de
 * cookies) e o que for renderizado isoladamente em teste segue a leitura clara
 * da pagina. Quem precisa de uma variante de accent escura (o unico caso em que
 * o token neutro nao resolve) le o tom por aqui em vez de receber prop.
 */
export const SheetToneContext = createContext<SectionTone>('light')

export function useSheetTone(): SectionTone {
  return useContext(SheetToneContext)
}

/**
 * Superficie opaca de cada tom.
 *
 * O fundo precisa ser solido: e ele que esconde a folha de baixo enquanto a de
 * cima passa por cima. O `text-white` da folha escura tambem e base de heranca
 * para qualquer texto sem cor propria (os neutros invertem por token).
 *
 * Fica fora do elemento da folha porque quem tem fundo proprio (o hero, com o
 * `void-950`) escolhe a superficie sem competir com uma classe de
 * `background-color` ja aplicada — duas utilidades iguais no mesmo elemento sao
 * resolvidas pela ordem do CSS, nao pela ordem do atributo.
 */
export const SHEET_SURFACE: Record<SectionTone, string> = {
  light: 'bg-surface',
  dark: 'bg-void-900 text-white',
}
