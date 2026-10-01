import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Footer } from '../components/layout/Footer'
import { siteConfig } from '../config/site'
import { CONSENT_REOPEN_EVENT } from '../lib/analytics'

describe('Footer', () => {
  it('assina com o ano corrente, sem o material antigo do rodape', () => {
    const year = new Date().getFullYear()
    render(<Footer />)

    expect(screen.getByText(`© ${year} Vitor Rosa - All rights reserved.`)).toBeInTheDocument()
    expect(screen.queryByText(/voltar ao topo/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/feito com/i)).not.toBeInTheDocument()
  })

  it('lista os canais do autor em icones com rotulo acessivel', () => {
    render(<Footer />)

    const linkedin = screen.getByRole('link', { name: /linkedin de vitor rosa/i })
    expect(linkedin).toHaveAttribute('href', siteConfig.linkedin)
    expect(linkedin).toHaveAttribute('rel', 'noopener noreferrer')

    const github = screen.getByRole('link', { name: /github de vitor rosa/i })
    expect(github).toHaveAttribute('href', siteConfig.github)

    const email = screen.getByRole('link', { name: /enviar e-mail/i })
    expect(email).toHaveAttribute('href', `mailto:${siteConfig.email}`)
    expect(email).not.toHaveAttribute('target')

    expect(screen.getByRole('link', { name: /portfólio de vitor rosa/i })).toHaveAttribute(
      'href',
      siteConfig.website,
    )
  })

  it('oferece idioma com icone e empilha assinatura, canais e preferencias', () => {
    render(<Footer />)

    const footer = screen.getByRole('contentinfo')
    const copyright = screen.getByText(/Vitor Rosa - All rights reserved\./)
    const links = within(footer).getByRole('list', { name: /canais de contato/i })
    const language = within(footer).getByRole('group', { name: 'Idioma' })
    const preferences = screen.getByRole('button', { name: /preferências de cookies/i })

    expect(language.querySelector('svg')).not.toBeNull()
    expect(copyright.compareDocumentPosition(links) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(links.compareDocumentPosition(language) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(
      language.compareDocumentPosition(preferences) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(footer.querySelector(':scope > div')?.className).toContain('flex-col')
  })

  it('reabre as preferencias de cookies', async () => {
    const user = userEvent.setup()
    const listener = vi.fn()
    window.addEventListener(CONSENT_REOPEN_EVENT, listener)

    render(<Footer />)
    await user.click(screen.getByRole('button', { name: /preferências de cookies/i }))

    expect(listener).toHaveBeenCalledTimes(1)
    window.removeEventListener(CONSENT_REOPEN_EVENT, listener)
  })
})
