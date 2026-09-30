import { useEffect, useState } from 'react'

import { SECTIONS, type SectionChrome, type SectionTone } from '../config/sections'

/** Cabecalho fixo: a altura dele e a linha onde as folhas trocam de pele. */
const HEADER_SELECTOR = '[data-site-nav]'

/** Marcador publico de cada folha — ver `Stack`. */
const SHEET_SELECTOR = '[data-section-tone]'

/** Estado inicial: a pagina abre na primeira folha, o hero. */
const INITIAL_THEME: SectionTheme = { tone: SECTIONS[0].tone, chrome: SECTIONS[0].chrome }

export interface SectionTheme {
  /** Tom da folha que esta sob o cabecalho. */
  tone: SectionTone
  /** Como o cabecalho pousa nessa folha (vidro ou solto). */
  chrome: SectionChrome
}

function isTone(value: string | null): value is SectionTone {
  return value === 'light' || value === 'dark'
}

function isChrome(value: string | null): value is SectionChrome {
  return value === 'glass' || value === 'transparent'
}

/**
 * Folha que esta atravessando a linha do cabecalho.
 *
 * Usa o retangulo real de cada folha (e nao a posicao de fluxo), entao uma folha
 * presa com topo negativo continua contando enquanto cobre o topo da janela. A
 * ultima folha da ordem do documento que atende ao criterio e a que esta visivel
 * sob a navbar naquele instante.
 */
export function readSectionTheme(): SectionTheme | null {
  const header = document.querySelector(HEADER_SELECTOR)
  const line = header ? header.getBoundingClientRect().height : 0
  let theme: SectionTheme | null = null

  for (const sheet of document.querySelectorAll<HTMLElement>(SHEET_SELECTOR)) {
    const { top, bottom } = sheet.getBoundingClientRect()
    const tone = sheet.getAttribute('data-section-tone')

    if (top > line || bottom <= line || !isTone(tone)) continue

    const chrome = sheet.getAttribute('data-section-chrome')
    theme = { tone, chrome: isChrome(chrome) ? chrome : 'glass' }
  }

  return theme
}

/**
 * Tom e pele da folha sob a navbar, para a troca de pele do cabecalho.
 *
 * A leitura roda no `scroll` (agrupada num quadro) e no `resize`, entao a troca
 * acontece no instante em que a borda da proxima folha cruza o cabecalho — e nao
 * num limiar fixo do hero.
 */
export function useSectionTheme(): SectionTheme {
  const [theme, setTheme] = useState<SectionTheme>(INITIAL_THEME)

  useEffect(() => {
    let frame = 0

    const apply = () => {
      frame = 0
      const next = readSectionTheme()
      if (!next) return
      setTheme((current) =>
        current.tone === next.tone && current.chrome === next.chrome ? current : next,
      )
    }

    const schedule = () => {
      if (frame) return
      frame = window.requestAnimationFrame(apply)
    }

    // Leitura sincrona na montagem: a pele inicial sai certa no primeiro quadro.
    apply()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return theme
}
