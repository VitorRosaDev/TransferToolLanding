import { useTranslation } from 'react-i18next'

import { downloadArtifacts, RELEASES_PAGE_URL, type DownloadArtifact } from '../../config/downloads'
import { trackEvent } from '../../lib/analytics'
import { buttonClass } from '../ui/buttonClass'
import { IconDownload, IconExternalLink } from '../ui/icons'
import { Reveal } from '../ui/Reveal'
import { Section } from '../ui/Section'
import { DownloadCard, type DownloadCardCopy } from './DownloadCard'

/**
 * Secao 03 — os dois instaladores.
 *
 * A copia de cada plataforma e resolvida aqui (e nao dentro do `DownloadCard`)
 * para que o card receba apenas dados e continue reaproveitavel.
 */
export function Downloads() {
  const { t } = useTranslation()

  const copyFor = (artifact: DownloadArtifact): DownloadCardCopy => {
    const { id } = artifact

    return {
      name: t(`downloads.${id}.name`),
      platformValue: t(`downloads.${id}.platformValue`),
      requirementsTitle: t(`downloads.${id}.requirementsTitle`),
      requirements: [
        t(`downloads.${id}.requirement1`),
        t(`downloads.${id}.requirement2`),
        t(`downloads.${id}.requirement3`),
      ],
      ctaLabel: id === 'mobile' ? t('downloads.downloadApk') : t('downloads.downloadCta'),
    }
  }

  return (
    <Section
      id="downloads"
      number="03"
      eyebrow={t('downloads.eyebrow')}
      title={t('downloads.title')}
      subtitle={t('downloads.subtitle')}
    >
      <div className="grid items-start gap-5 lg:grid-cols-2 lg:gap-6">
        {downloadArtifacts.map((artifact, index) => (
          <Reveal key={artifact.id} delay={index * 0.08}>
            <DownloadCard
              artifact={artifact}
              copy={copyFor(artifact)}
              showQrCode={artifact.id === 'mobile'}
              qrValue={artifact.id === 'mobile' ? RELEASES_PAGE_URL : undefined}
            />
          </Reveal>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-6 border-t border-ink-200/80 pt-8 lg:mt-12 lg:flex-row lg:items-center lg:justify-between">
        <p className="max-w-2xl text-sm leading-relaxed text-ink-500">{t('downloads.integrity')}</p>

        <a
          href={RELEASES_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass('secondary', 'md', 'shrink-0')}
          onClick={() => trackEvent('download_started', { platform: 'releases' })}
        >
          <IconDownload className="h-4 w-4" />
          {t('downloads.allReleases')}
          <IconExternalLink className="h-4 w-4" />
        </a>
      </div>
    </Section>
  )
}
