import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import i18n from '../i18n'
import { LanguageToggle } from '../components/layout/LanguageToggle'

describe('LanguageToggle', () => {
  it('marca o idioma ativo com aria-pressed', () => {
    render(<LanguageToggle />)

    expect(screen.getByRole('button', { name: 'PT' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('troca o idioma, persiste a escolha e atualiza <html lang>', async () => {
    const user = userEvent.setup()
    render(<LanguageToggle />)

    await user.click(screen.getByRole('button', { name: 'EN' }))

    expect(i18n.language).toBe('en')
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'PT' })).toHaveAttribute('aria-pressed', 'false')
    expect(document.documentElement.lang).toBe('en')
    expect(window.localStorage.getItem('transfertool.language')).toBe('en')
  })

  it('volta ao portugues ao clicar em PT', async () => {
    const user = userEvent.setup()
    render(<LanguageToggle />)

    await user.click(screen.getByRole('button', { name: 'EN' }))
    await user.click(screen.getByRole('button', { name: 'PT' }))

    expect(i18n.language).toBe('pt-BR')
    expect(document.documentElement.lang).toBe('pt-BR')
  })
})
