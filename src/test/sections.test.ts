import { describe, expect, it } from 'vitest'

import {
  NAV_SECTIONS,
  SECTIONS,
  sectionChrome,
  sectionIndex,
  sectionTone,
} from '../config/sections'
import en from '../i18n/locales/en.json'
import ptBR from '../i18n/locales/pt-BR.json'

/** Todas as chaves de um dicionario, no formato `bloco.chave`. */
function flatKeys(source: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(source).flatMap(([key, value]) =>
    value !== null && typeof value === 'object'
      ? flatKeys(value as Record<string, unknown>, `${prefix}${key}.`)
      : `${prefix}${key}`,
  )
}

describe('configuracao das folhas', () => {
  it('mantem ids unicos e o indice igual a ordem de empilhamento', () => {
    const ids = SECTIONS.map((section) => section.id)

    expect(new Set(ids).size).toBe(ids.length)
    ids.forEach((id, index) => expect(sectionIndex(id)).toBe(index))
  })

  it('alterna os tons com o hero abrindo a pagina no escuro', () => {
    expect(SECTIONS[0].tone).toBe('dark')

    SECTIONS.forEach((section, index) => {
      expect(sectionTone(section.id)).toBe(section.tone)

      if (index > 0) expect(section.tone).not.toBe(SECTIONS[index - 1].tone)
    })
  })

  it('coloca no menu as folhas nomeadas, sem o hero e na ordem da pagina', () => {
    expect(NAV_SECTIONS.map((section) => section.id)).toEqual([
      'overview',
      'howItWorks',
      'downloads',
      'privacy',
      'faq',
    ])
  })

  it('deixa solta apenas a folha com cena de fundo (o hero)', () => {
    const transparent = SECTIONS.filter((section) => section.chrome === 'transparent')

    expect(transparent.map((section) => section.id)).toEqual(['inicio'])
    SECTIONS.forEach((section) => expect(sectionChrome(section.id)).toBe(section.chrome))
  })

  it('aponta cada rotulo do menu para uma chave existente nos dois idiomas', () => {
    const ptKeys = flatKeys(ptBR)
    const enKeys = flatKeys(en)

    NAV_SECTIONS.forEach((section) => {
      expect(ptKeys).toContain(section.navLabelKey)
      expect(enKeys).toContain(section.navLabelKey)
    })
  })

  it('mantem os dicionarios com as mesmas chaves', () => {
    expect(flatKeys(en).sort()).toEqual(flatKeys(ptBR).sort())
  })
})
