import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

import i18n from '../i18n'

/**
 * jsdom nao implementa IntersectionObserver, usado pelo `whileInView` do
 * Framer Motion. O stub reporta o elemento imediatamente como visivel para que
 * o conteudo seja renderizado de forma deterministica nos testes.
 */
class IntersectionObserverStub {
  readonly root = null
  readonly rootMargin = '0px'
  readonly thresholds: readonly number[] = [0]

  constructor(private readonly callback: IntersectionObserverCallback) {}

  observe(target: Element): void {
    const rect = target.getBoundingClientRect()

    this.callback(
      [
        {
          isIntersecting: true,
          intersectionRatio: 1,
          target,
          time: 0,
          boundingClientRect: rect,
          intersectionRect: rect,
          rootBounds: null,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    )
  }

  unobserve(): void {}

  disconnect(): void {}

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

globalThis.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver

// Idioma deterministico em todos os testes e isolamento de storage.
beforeEach(async () => {
  await i18n.changeLanguage('pt-BR')
})

afterEach(() => {
  cleanup()

  // Remove qualquer gtag.js injetado por um teste anterior: a injecao e unica por
  // design, entao residuo no <head> quebraria asserts de "nenhum script externo".
  document.querySelectorAll('script[data-transfertool-ga]').forEach((script) => script.remove())

  window.localStorage.clear()
  delete window.gtag
  delete window.dataLayer

  // Nao permite que um stub de ambiente vaze para o proximo arquivo de teste.
  vi.unstubAllEnvs()
})
