import { useTranslation } from 'react-i18next'

import { IconTile } from '../ui/Card'
import {
  IconCloudOff,
  IconCookie,
  IconCpu,
  IconDatabase,
  IconListChecks,
  IconLock,
  IconShield,
} from '../ui/icons'
import { Reveal } from '../ui/Reveal'
import { Section } from '../ui/Section'

const BADGE_IDS = ['local', 'database', 'noCloud', 'noThirdParty', 'session', 'audit'] as const

const BADGE_ICONS = {
  local: IconCpu,
  database: IconDatabase,
  noCloud: IconCloudOff,
  noThirdParty: IconShield,
  session: IconLock,
  audit: IconListChecks,
}

/**
 * Secao 04 — onde os dados ficam.
 *
 * As garantias sao lidas como uma ficha tecnica: celulas brancas coladas por
 * linhas de 1px (`gap-px` sobre o fundo `ink-200`) em vez de seis cards
 * soltos, o que reforca a ideia de conjunto unico e verificavel.
 */
export function Privacy() {
  const { t } = useTranslation()

  return (
    <Section
      id="privacy"
      number="04"
      eyebrow={t('privacy.eyebrow')}
      title={t('privacy.title')}
      subtitle={t('privacy.subtitle')}
      tone="muted"
    >
      <Reveal>
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-ink-200/70 bg-ink-200/70 sm:grid-cols-2 lg:grid-cols-3">
          {BADGE_IDS.map((id) => {
            const Icon = BADGE_ICONS[id]

            return (
              <li key={id} className="bg-surface p-6 sm:p-7">
                <IconTile>
                  <Icon className="h-5 w-5" />
                </IconTile>

                <h3 className="mt-5 text-base font-semibold text-ink-900">
                  {t(`privacy.badges.${id}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                  {t(`privacy.badges.${id}.text`)}
                </p>
              </li>
            )
          })}
        </ul>
      </Reveal>

      <p className="mt-8 flex max-w-3xl items-start gap-2.5 text-sm leading-relaxed text-ink-500">
        <IconCookie className="mt-0.5 h-4 w-4 shrink-0 text-ink-500" />
        {t('privacy.pageNote')}
      </p>
    </Section>
  )
}
