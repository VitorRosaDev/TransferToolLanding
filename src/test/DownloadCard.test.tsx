import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { DownloadCard, type DownloadCardCopy } from '../components/sections/DownloadCard'
import type { DownloadArtifact } from '../config/downloads'

const artifact: DownloadArtifact = {
  id: 'mobile',
  fileName: 'TransferTool-1.1.1.apk',
  version: '1.1.1',
  size: '96 MB',
  url: 'https://example.com/downloads/TransferTool-1.1.1.apk',
  available: false,
}

const copy: DownloadCardCopy = {
  name: 'TransferTool Mobile',
  platformValue: 'Android 8.0 ou superior',
  requirementsTitle: 'Antes de instalar',
  requirements: ['Habilite fontes confiáveis.'],
  ctaLabel: 'Baixar APK',
}

describe('DownloadCard', () => {
  it('mostra nome, versao, arquivo e tamanho do artefato', () => {
    render(<DownloadCard artifact={artifact} copy={copy} />)

    expect(screen.getByRole('heading', { name: 'TransferTool Mobile' })).toBeInTheDocument()
    expect(screen.getByText('Versão 1.1.1')).toBeInTheDocument()
    expect(screen.getByText('TransferTool-1.1.1.apk')).toBeInTheDocument()
    expect(screen.getByText('96 MB')).toBeInTheDocument()
    expect(screen.getByText('Habilite fontes confiáveis.')).toBeInTheDocument()
  })

  it('bloqueia o download enquanto o artefato nao foi publicado', () => {
    render(<DownloadCard artifact={artifact} copy={copy} />)

    expect(screen.getByRole('button', { name: 'Indisponível no momento' })).toBeDisabled()
    expect(screen.queryByRole('link', { name: 'Baixar APK' })).not.toBeInTheDocument()
    expect(screen.getByText(/publicado no repositório de releases/i)).toBeInTheDocument()
  })

  it('libera o link direto quando o artefato esta publicado', async () => {
    const user = userEvent.setup()
    render(<DownloadCard artifact={{ ...artifact, available: true }} copy={copy} />)

    const link = screen.getByRole('link', { name: 'Baixar APK' })
    expect(link).toHaveAttribute('href', artifact.url)
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')

    await user.click(link)
  })

  it('exibe o QR Code do APK apenas quando solicitado', () => {
    const { unmount } = render(<DownloadCard artifact={artifact} copy={copy} />)
    expect(screen.queryByTestId('download-card-qr')).not.toBeInTheDocument()
    unmount()

    render(
      <DownloadCard
        artifact={artifact}
        copy={copy}
        showQrCode
        qrValue="https://example.com/releases"
      />,
    )

    const qr = screen.getByTestId('download-card-qr')
    expect(qr).toBeInTheDocument()
    expect(qr.querySelector('svg')).not.toBeNull()
  })
})
