import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { readSectionTheme, useSectionTheme } from '../lib/useSectionTheme'

/** A cena e montada a mao: cada teste precisa deixar a pagina limpa para o proximo. */
afterEach(() => {
  document.querySelector('[data-site-nav]')?.remove()
  document.querySelectorAll('section[data-section-tone]').forEach((sheet) => sheet.remove())
})

/** Retangulo de teste de uma folha (o jsdom nao calcula layout). */
function rect(top: number, bottom: number): DOMRect {
  return {
    top,
    bottom,
    height: bottom - top,
    left: 0,
    right: 0,
    width: 0,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect
}

interface SheetSpec {
  id: string
  tone: 'light' | 'dark'
  /** Ausente reproduz uma folha que nao declara pele (fallback `glass`). */
  chrome?: 'glass' | 'transparent'
  top: number
  bottom: number
}

/**
 * Monta a cena minima que a leitura consulta: um cabecalho com altura propria e
 * as folhas, cada uma com o retangulo que o teste quiser.
 */
function mountScene(sheets: SheetSpec[], headerHeight = 64) {
  const header = document.createElement('nav')
  header.setAttribute('data-site-nav', '')
  header.getBoundingClientRect = () => rect(0, headerHeight)
  document.body.append(header)

  const elements = sheets.map(({ id, tone, chrome, top, bottom }) => {
    const sheet = document.createElement('section')
    sheet.dataset.sectionTone = tone
    if (chrome) sheet.dataset.sectionChrome = chrome
    sheet.id = id
    sheet.getBoundingClientRect = () => rect(top, bottom)
    document.body.append(sheet)

    return sheet
  })

  return { header, elements }
}

function Harness() {
  const { tone, chrome } = useSectionTheme()

  return (
    <>
      <span data-testid="tone">{tone}</span>
      <span data-testid="chrome">{chrome}</span>
    </>
  )
}

describe('readSectionTheme', () => {
  it('nao define tema quando nenhuma folha atravessa a linha do cabecalho', () => {
    mountScene([
      { id: 'inicio', tone: 'dark', chrome: 'transparent', top: -900, bottom: -100 },
      { id: 'overview', tone: 'light', top: 200, bottom: 900 },
    ])

    expect(readSectionTheme()).toBeNull()
  })

  it('responde pela ultima folha que atravessa a linha', () => {
    mountScene([
      { id: 'inicio', tone: 'dark', chrome: 'transparent', top: -400, bottom: 500 },
      { id: 'overview', tone: 'light', chrome: 'glass', top: 0, bottom: 700 },
    ])

    // A folha clara ja cobre a linha: e ela que esta sob a navbar.
    expect(readSectionTheme()).toEqual({ tone: 'light', chrome: 'glass' })
  })

  it('ignora folha que ainda nao chegou ao topo da janela', () => {
    mountScene([
      { id: 'inicio', tone: 'dark', chrome: 'transparent', top: -400, bottom: 500 },
      { id: 'overview', tone: 'light', chrome: 'glass', top: 300, bottom: 900 },
    ])

    expect(readSectionTheme()).toEqual({ tone: 'dark', chrome: 'transparent' })
  })

  it('cai no vidro quando a folha nao declara pele', () => {
    mountScene([{ id: 'privacy', tone: 'dark', top: -100, bottom: 800 }])

    expect(readSectionTheme()).toEqual({ tone: 'dark', chrome: 'glass' })
  })
})

describe('useSectionTheme', () => {
  it('comeca no tema da primeira folha', () => {
    render(<Harness />)

    expect(screen.getByTestId('tone')).toHaveTextContent('dark')
    expect(screen.getByTestId('chrome')).toHaveTextContent('transparent')
  })

  it('troca de tema no scroll, quando a folha seguinte cruza a linha', async () => {
    render(<Harness />)

    const { elements } = mountScene([
      { id: 'inicio', tone: 'dark', chrome: 'transparent', top: -400, bottom: 500 },
      { id: 'overview', tone: 'light', chrome: 'glass', top: -40, bottom: 700 },
    ])

    window.dispatchEvent(new Event('scroll'))

    await waitFor(() => expect(screen.getByTestId('tone')).toHaveTextContent('light'))
    expect(screen.getByTestId('chrome')).toHaveTextContent('glass')

    // Sentido inverso: a folha do hero volta a cobrir a linha.
    elements[1].getBoundingClientRect = () => rect(400, 900)
    window.dispatchEvent(new Event('scroll'))

    await waitFor(() => expect(screen.getByTestId('tone')).toHaveTextContent('dark'))
    expect(screen.getByTestId('chrome')).toHaveTextContent('transparent')

    elements.forEach((element) => element.remove())
  })
})
