import { useTranslation } from 'react-i18next'

import { Button } from '../ui/Button'
import { Card, IconTile } from '../ui/Card'
import { IconFileCode } from '../ui/icons'
import { Reveal } from '../ui/Reveal'
import { Section } from '../ui/Section'

/**
 * Secao 06 — a origem cientifica do ecossistema.
 *
 * Um relato curto entre o FAQ e o rodape: o TransferTool e a parte pratica de
 * uma pesquisa de conclusao de curso. A coluna de leitura conta a origem e o
 * card reserva o lugar do artigo, hoje em estado "em elaboracao" — o mesmo
 * padrao do botao desabilitado dos downloads.
 */
export function Research() {
  const { t } = useTranslation()

  return (
    <Section id="research" number="06" eyebrow={t('research.eyebrow')} title={t('research.title')}>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-7">
          <p className="text-justify text-base leading-relaxed text-ink-600">
            {t('research.body1')}
          </p>
          <p className="mt-5 text-justify text-base leading-relaxed text-ink-600">
            {t('research.body2')}
          </p>
        </Reveal>

        <Reveal className="lg:col-span-5" delay={0.08}>
          <Card className="flex h-full flex-col p-6 sm:p-7">
            <IconTile>
              <IconFileCode className="h-5 w-5" />
            </IconTile>

            <p className="mono-label mt-5 text-ink-500">{t('research.paperLabel')}</p>
            <h3 className="mt-2 text-lg font-bold text-ink-900">{t('research.paperTitle')}</h3>

            <div className="mt-auto pt-7">
              <Button size="lg" disabled className="w-full">
                {t('research.ctaLabel')}
              </Button>
              <p className="mt-3 text-xs leading-relaxed text-ink-500">
                {t('research.comingSoonHint')}
              </p>
            </div>
          </Card>
        </Reveal>
      </div>
    </Section>
  )
}
