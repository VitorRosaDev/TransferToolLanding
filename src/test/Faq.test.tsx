import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Faq } from '../components/sections/Faq'

describe('Faq', () => {
  it('abre o primeiro item por padrao', () => {
    render(<Faq />)

    expect(
      screen.getByRole('button', { name: /precisa de internet para funcionar/i }),
    ).toHaveAttribute('aria-expanded', 'true')
  })

  it('abre a resposta do item clicado', async () => {
    const user = userEvent.setup()
    render(<Faq />)

    const trigger = screen.getByRole('button', { name: /substitui o ERP/i })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(await screen.findByText(/o ERP continua sendo a fonte oficial/i)).toBeInTheDocument()
  })

  it('fecha o item quando ele e clicado novamente', async () => {
    const user = userEvent.setup()
    render(<Faq />)

    const trigger = screen.getByRole('button', { name: /precisa de internet para funcionar/i })
    await user.click(trigger)

    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
  })

  it('associa cada gatilho ao seu painel por id', () => {
    render(<Faq />)

    const trigger = screen.getByRole('button', { name: /quais são os requisitos/i })

    expect(trigger).toHaveAttribute('aria-controls', 'faq-panel-requirements')
    expect(document.getElementById('faq-panel-requirements')).toBeNull()
  })
})
