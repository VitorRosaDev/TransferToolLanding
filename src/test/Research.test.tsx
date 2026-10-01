import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Research } from '../components/sections/Research'

describe('Research', () => {
  it('apresenta a origem cientifica do ecossistema', () => {
    render(<Research />)

    expect(
      screen.getByRole('heading', { name: /nasceu de uma pesquisa científica/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/almoxarifado central da rede municipal de Alvorada/i),
    ).toBeInTheDocument()
  })

  it('mantem o artigo em estado "em elaboracao"', () => {
    render(<Research />)

    expect(screen.getByRole('button', { name: /artigo em elaboração/i })).toBeDisabled()
    expect(screen.getByText(/concluído e defendido/i)).toBeInTheDocument()
  })
})
