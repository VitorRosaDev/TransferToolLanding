import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { trackEvent } from '../../lib/analytics'
import { IconChevronDown } from '../ui/icons'
import { Reveal } from '../ui/Reveal'
import { Section } from '../ui/Section'

const FAQ_IDS = [
  'offline',
  'erp',
  'compatibility',
  'security',
  'requirements',
  'data',
  'updates',
] as const

type FaqId = (typeof FAQ_IDS)[number]

/**
 * Secao 05 — duvidas antes do download.
 *
 * Acordeao de item unico, aberto inicialmente na primeira pergunta. O painel e
 * montado/desmontado de verdade (e nao apenas escondido), para que a resposta
 * so exista no DOM quando estiver disponivel para leitura e para o leitor de
 * tela.
 */
export function Faq() {
  const { t } = useTranslation()
  const [openId, setOpenId] = useState<FaqId | null>('offline')

  const toggle = (id: FaqId) => {
    setOpenId((current) => {
      const next = current === id ? null : id
      if (next) trackEvent('faq_opened', { item: id })
      return next
    })
  }

  return (
    <Section id="faq" number="05" eyebrow={t('faq.eyebrow')} title={t('faq.title')}>
      <Reveal>
        <ul className="border-t border-ink-200/80">
          {FAQ_IDS.map((id, index) => {
            const isOpen = openId === id
            const triggerId = `faq-trigger-${id}`
            const panelId = `faq-panel-${id}`

            return (
              <li key={id} className="border-b border-ink-200/80">
                <h3>
                  <button
                    type="button"
                    id={triggerId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(id)}
                    className="group flex w-full items-start gap-4 py-5 text-left transition-colors sm:gap-6 sm:py-6"
                  >
                    <span
                      aria-hidden="true"
                      className={`mono-label pt-1 tabular-nums transition-colors ${
                        isOpen ? 'text-brand-600' : 'text-ink-300'
                      }`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span
                      className={`flex-1 text-base font-semibold transition-colors sm:text-lg ${
                        isOpen ? 'text-brand-700' : 'text-ink-900 group-hover:text-brand-700'
                      }`}
                    >
                      {t(`faq.items.${id}.question`)}
                    </span>

                    <span
                      aria-hidden="true"
                      className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                        isOpen
                          ? 'rotate-180 border-brand-200 bg-brand-50 text-brand-600'
                          : 'border-ink-200 text-ink-500 group-hover:border-brand-200 group-hover:text-brand-600'
                      }`}
                    >
                      <IconChevronDown className="h-4 w-4" />
                    </span>
                  </button>
                </h3>

                {isOpen ? (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={triggerId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-3xl pb-7 text-justify text-sm leading-relaxed text-ink-600 sm:pl-12 sm:text-base">
                      {t(`faq.items.${id}.answer`)}
                    </p>
                  </motion.div>
                ) : null}
              </li>
            )
          })}
        </ul>
      </Reveal>
    </Section>
  )
}
