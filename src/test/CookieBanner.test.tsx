import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

// Executa antes dos imports deste arquivo: garante que o modulo de analytics carregue
// SEM Measurement ID aqui, independentemente de outros testes de ambiente ja executados.
vi.hoisted(() => {
  vi.stubEnv('VITE_GA_ID', '')
})

import { CONSENT_REOPEN_EVENT, CONSENT_STORAGE_KEY, hasAnalyticsId } from '../lib/analytics'
import { CookieBanner } from '../components/layout/CookieBanner'

describe('CookieBanner', () => {
  it('aparece quando o visitante ainda nao decidiu', () => {
    render(<CookieBanner />)

    expect(screen.getByRole('region', { name: /cookies/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Aceitar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Recusar' })).toBeInTheDocument()
  })

  it('grava a recusa e fecha o aviso', async () => {
    const user = userEvent.setup()
    render(<CookieBanner />)

    await user.click(screen.getByRole('button', { name: 'Recusar' }))

    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('denied')
    await waitFor(() =>
      expect(screen.queryByRole('region', { name: /cookies/i })).not.toBeInTheDocument(),
    )
  })

  it('grava o aceite sem carregar scripts quando nao ha Measurement ID', async () => {
    const user = userEvent.setup()
    render(<CookieBanner />)

    await user.click(screen.getByRole('button', { name: 'Aceitar' }))

    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('granted')
    expect(hasAnalyticsId()).toBe(false)
    expect(document.querySelector('script[data-transfertool-ga]')).toBeNull()
  })

  it('nao aparece quando ja existe uma escolha salva', () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'denied')

    render(<CookieBanner />)

    expect(screen.queryByRole('region', { name: /cookies/i })).not.toBeInTheDocument()
  })

  it('reaparece quando as preferencias sao reabertas pelo rodape', async () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'denied')
    render(<CookieBanner />)

    expect(screen.queryByRole('region', { name: /cookies/i })).not.toBeInTheDocument()

    act(() => {
      window.dispatchEvent(new Event(CONSENT_REOPEN_EVENT))
    })

    expect(await screen.findByRole('button', { name: 'Aceitar' })).toBeInTheDocument()
  })
})
