import { useTranslation } from 'react-i18next'

import { Card, IconTile } from '../ui/Card'
import { Reveal } from '../ui/Reveal'
import { IconCheck, IconMonitor, IconSmartphone } from '../ui/icons'

const PRODUCT_IDS = ['mobile', 'desktop'] as const
const PRODUCT_ICONS = { mobile: IconSmartphone, desktop: IconMonitor }
const BULLET_KEYS = ['one', 'two', 'three'] as const
const BENEFIT_IDS = ['resilient', 'typed', 'batches', 'auditable'] as const

/**
 * Bloco final da secao 01: as duas aplicacoes lado a lado e, logo abaixo, as
 * garantias que valem para o conjunto.
 *
 * As garantias nao viram cards — uma lista tipografica com marcador de accent
 * mantem o peso visual abaixo dos dois produtos e evita quatro caixas iguais.
 */
export function OverviewProducts() {
  const { t } = useTranslation()

  return (
    <div className="mt-16 lg:mt-24">
      <div className="grid gap-5 md:grid-cols-2 md:gap-6">
        {PRODUCT_IDS.map((id, index) => {
          const Icon = PRODUCT_ICONS[id]

          return (
            <Reveal key={id} delay={index * 0.08}>
              <Card className="flex h-full flex-col p-6 transition-shadow duration-300 hover:shadow-lift sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="mono-label text-ink-500">{t(`overview.products.${id}.tag`)}</p>
                    <h3 className="mt-2.5 text-xl font-bold text-ink-900">
                      {t(`overview.products.${id}.title`)}
                    </h3>
                  </div>

                  <IconTile>
                    <Icon className="h-5 w-5" />
                  </IconTile>
                </div>

                <p className="mt-5 text-justify text-sm leading-relaxed text-ink-600">
                  {t(`overview.products.${id}.text`)}
                </p>

                <ul className="mt-6 space-y-2.5 border-t border-ink-200/70 pt-5">
                  {BULLET_KEYS.map((key) => (
                    <li key={key} className="flex items-start gap-2.5 text-sm text-ink-700">
                      <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                      {t(`overview.products.${id}.bullets.${key}`)}
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          )
        })}
      </div>

      <ul className="mt-14 grid gap-x-10 gap-y-9 border-t border-ink-200/80 pt-10 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFIT_IDS.map((id) => (
          <li key={id}>
            <span aria-hidden="true" className="block h-1 w-7 rounded-full bg-brand-600" />
            <h3 className="mt-4 text-base font-semibold text-ink-900">
              {t(`overview.benefits.${id}.title`)}
            </h3>
            <p className="mt-2 text-justify text-sm leading-relaxed text-ink-600">
              {t(`overview.benefits.${id}.text`)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
