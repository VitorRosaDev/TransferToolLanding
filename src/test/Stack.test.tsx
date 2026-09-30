import { render } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Stack } from '../components/ui/Stack'

/**
 * O `useReducedMotion` real responde pela media consultada no `matchMedia`, cujo
 * stub do setup devolve `false`. O mock deixa cada teste escolher a preferencia
 * e exercitar as duas ramificacoes da folha (presa ou apenas rolando).
 */
const reducedMotion = vi.hoisted(() => ({ enabled: false }))

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>()

  return { ...actual, useReducedMotion: () => reducedMotion.enabled }
})

/** Altura de janela usada nas medidas do teste. */
const VIEWPORT = 800

/** Base do empilhamento declarada no componente. */
const BASE_Z = 10

function stubViewport(height: number, viewport = VIEWPORT) {
  vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(viewport)
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(height)
}

const sheetOf = (container: HTMLElement) => {
  const sheet = container.querySelector('section')
  if (!sheet) throw new Error('a folha nao foi renderizada')
  return sheet
}

describe('Stack', () => {
  it('prende no topo a folha que cabe na janela', () => {
    stubViewport(600)

    const { container } = render(
      <Stack id="overview" tone="light" chrome="glass" index={1}>
        <p>conteudo</p>
      </Stack>,
    )
    const sheet = sheetOf(container)

    expect(sheet.style.top).toBe('0px')
    expect(sheet.className).toContain('sticky')
    expect(sheet.className).toContain('min-h-dvh')
  })

  it('trava no fim a folha mais alta que a janela', () => {
    stubViewport(1200)

    const { container } = render(
      <Stack id="privacy" tone="dark" chrome="glass" index={4}>
        <p>conteudo</p>
      </Stack>,
    )
    const sheet = sheetOf(container)

    // 800 - 1200: rola inteira e so trava quando o fim encosta na base.
    expect(sheet.style.top).toBe('-400px')
    expect(sheet.style.zIndex).toBe(String(BASE_Z + 4))
  })

  it('sobe o z-index a cada folha e publica tom e pele para a navbar', () => {
    stubViewport(600)

    const { container } = render(
      <Stack id="inicio" tone="dark" chrome="transparent" index={0}>
        <p>conteudo</p>
      </Stack>,
    )
    const sheet = sheetOf(container)

    expect(sheet.dataset.sectionTone).toBe('dark')
    expect(sheet.dataset.sectionChrome).toBe('transparent')
    expect(sheet.id).toBe('inicio')
  })

  it('entrega a ancora externa no proprio elemento da folha', () => {
    stubViewport(600)
    const anchor = createRef<HTMLElement>()

    const { container } = render(
      <Stack id="inicio" tone="dark" chrome="transparent" index={0} ref={anchor}>
        <p>conteudo</p>
      </Stack>,
    )

    expect(anchor.current).toBe(sheetOf(container))
  })

  it('desenha a camada de fundo atras do conteudo', () => {
    stubViewport(600)

    const { container } = render(
      <Stack
        id="inicio"
        tone="dark"
        chrome="transparent"
        index={0}
        background={<canvas data-testid="cena" />}
      >
        <p>conteudo</p>
      </Stack>,
    )

    const scene = container.querySelector('[data-testid="cena"]')

    expect(scene).not.toBeNull()
    expect(scene?.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('apenas rola quando o movimento e reduzido', () => {
    stubViewport(1200)
    reducedMotion.enabled = true

    const { container } = render(
      <Stack id="faq" tone="light" chrome="glass" index={5}>
        <p>conteudo</p>
      </Stack>,
    )
    const sheet = sheetOf(container)

    expect(sheet.className).not.toContain('sticky')
    expect(sheet.className).toContain('relative')
    expect(sheet.style.top).toBe('')
  })
})
