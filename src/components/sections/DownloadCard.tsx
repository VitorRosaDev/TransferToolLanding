import { QRCodeSVG } from 'qrcode.react'
import { useTranslation } from 'react-i18next'

import type { DownloadArtifact } from '../../config/downloads'
import { trackEvent } from '../../lib/analytics'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { IconCheck, IconDownload } from '../ui/icons'

/**
 * Copia estatica do card. Vem de fora (e nao de `t()` interno) para que o
 * componente continue testavel sem dicionario e para deixar explicito que todo
 * texto visivel da plataforma passa pelo `Downloads`.
 */
export interface DownloadCardCopy {
  name: string
  platformValue: string
  requirementsTitle: string
  requirements: readonly string[]
  ctaLabel: string
}

interface DownloadCardProps {
  artifact: DownloadArtifact
  copy: DownloadCardCopy
  /** Habilita o bloco de QR Code (usado apenas no APK). */
  showQrCode?: boolean
  /** URL codificada no QR Code. */
  qrValue?: string
}

/**
 * Card de um artefato publicado.
 *
 * Enquanto o arquivo nao existe no repositorio de releases, o card mostra o
 * estado real (botao desabilitado + explicacao) em vez de um link quebrado.
 */
export function DownloadCard({ artifact, copy, showQrCode = false, qrValue }: DownloadCardProps) {
  const { t } = useTranslation()

  return (
    <Card className="flex h-full flex-col p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-ink-900 lg:text-2xl">{copy.name}</h3>
          <p className="mono-label mt-2.5 text-ink-500">
            {t('downloads.versionLabel', { version: artifact.version })}
          </p>
        </div>

        <span
          className={`mono-label shrink-0 rounded-md border px-2.5 py-1.5 ${
            artifact.available
              ? 'border-brand-200 bg-brand-50 text-brand-700'
              : 'border-ink-200 bg-ink-100 text-ink-600'
          }`}
        >
          {artifact.available ? t('common.download') : t('common.comingSoon')}
        </span>
      </div>

      <dl className="mt-6 grid gap-x-6 gap-y-4 border-t border-ink-200/70 pt-5">
        <div>
          <dt className="mono-label text-ink-500">{t('downloads.platform')}</dt>
          <dd className="mt-1.5 text-sm text-ink-700">{copy.platformValue}</dd>
        </div>

        <div>
          <dt className="mono-label text-ink-500">{t('downloads.fileLabel')}</dt>
          <dd className="mt-1.5 font-mono text-xs break-all text-ink-700">{artifact.fileName}</dd>
        </div>

        <div>
          <dt className="mono-label text-ink-500">{t('common.size')}</dt>
          <dd className="mt-1.5 font-mono text-xs text-ink-700">{artifact.size}</dd>
        </div>
      </dl>

      <div className="mt-6">
        <p className="mono-label text-ink-500">{copy.requirementsTitle}</p>

        <ul className="mt-3.5 space-y-2.5">
          {copy.requirements.map((requirement) => (
            <li key={requirement} className="flex items-start gap-2.5 text-sm text-ink-600">
              <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <span className="leading-relaxed">{requirement}</span>
            </li>
          ))}
        </ul>
      </div>

      {showQrCode && qrValue ? (
        <div
          data-testid="download-card-qr"
          className="mt-7 rounded-xl border border-ink-200/70 bg-surface-muted p-5"
        >
          <QRCodeSVG
            value={qrValue}
            size={128}
            level="M"
            marginSize={0}
            bgColor="transparent"
            fgColor="#121619"
            className="mx-auto h-auto w-full max-w-32"
          />
          <p className="mt-3.5 text-center text-xs leading-relaxed text-ink-500">
            {t('downloads.scanQr')}
          </p>
        </div>
      ) : null}

      <div className="mt-auto pt-7">
        {artifact.available ? (
          // Download na mesma aba: o asset do GitHub responde com
          // `Content-Disposition: attachment`, entao o navegador baixa o
          // arquivo sem navegar para fora do site (nem abrir o GitHub).
          <Button
            href={artifact.url}
            size="lg"
            className="w-full"
            onClick={() =>
              trackEvent('download_started', {
                platform: artifact.id,
                version: artifact.version,
              })
            }
          >
            {copy.ctaLabel}
            <IconDownload className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="lg" disabled className="w-full">
            {t('downloads.noneCta')}
          </Button>
        )}

        {artifact.available ? null : (
          <p className="mt-3 text-xs leading-relaxed text-ink-500">
            {t('downloads.comingSoonHint')}
          </p>
        )}
      </div>
    </Card>
  )
}
