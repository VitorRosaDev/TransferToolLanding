import { useTranslation } from 'react-i18next'

import { Card } from '../ui/Card'
import { Reveal } from '../ui/Reveal'
import { Section } from '../ui/Section'
import { OverviewProducts } from './OverviewProducts'

const PRODUCT_IDS = ['mobile', 'desktop'] as const

/**
 * Secao 01 — o problema e a resposta.
 *
 * O texto de contexto fica em coluna de leitura (2 paragrafos, sem cards) e a
 * conclusao fica isolada em um bloco com regua de accent a esquerda: a pagina
 * separa "o que acontece hoje" de "o que o TransferTool faz a respeito".
 */
export function Overview() {
  const { t } = useTranslation()

  return (
    <Section id="overview" number="01" eyebrow={t('overview.eyebrow')} title={t('overview.title')}>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-7">
          <p className="text-base leading-relaxed text-ink-600">{t('overview.paragraph1')}</p>
          <p className="mt-5 text-base leading-relaxed text-ink-600">{t('overview.paragraph2')}</p>
        </Reveal>

        <Reveal className="lg:col-span-5" delay={0.08}>
          <Card className="h-full border-l-2 border-l-brand-600 p-6 sm:p-7">
            <p className="mono-label text-brand-700">{t('overview.solutionEyebrow')}</p>

            <h3 className="mt-3.5 text-xl font-bold text-ink-900 lg:text-[1.375rem]">
              {t('overview.solutionTitle')}
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-ink-600">
              {t('overview.solutionText')}
            </p>

            <ul className="mt-6 flex flex-wrap gap-2 border-t border-ink-200/70 pt-5">
              {PRODUCT_IDS.map((id) => (
                <li
                  key={id}
                  className="mono-label rounded-md bg-ink-100 px-2.5 py-1.5 text-ink-600"
                >
                  {t(`overview.products.${id}.title`)}
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      </div>

      <OverviewProducts />
    </Section>
  )
}
