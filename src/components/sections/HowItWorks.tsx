import { motion, useInView, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { Section } from '../ui/Section'

const STEP_IDS = ['montar', 'fechar', 'exportar', 'importar', 'automatizar'] as const

type StepId = (typeof STEP_IDS)[number]

/**
 * Secao 02 — o fluxo em cinco passos.
 *
 * Em vez de cinco cards iguais, um unico eixo vertical: a linha de progresso e
 * desenhada conforme o scroll e o passo sob o foco acende. O movimento aqui
 * explica a sequencia (o produto e literalmente uma rotina em ordem), o que
 * seria decoracao em qualquer outro bloco.
 */
export function HowItWorks() {
  const { t } = useTranslation()
  const listRef = useRef<HTMLOListElement>(null)
  const shouldReduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 65%', 'end 90%'],
  })

  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.5 })

  return (
    <Section
      id="howItWorks"
      number="02"
      eyebrow={t('howItWorks.eyebrow')}
      title={t('howItWorks.title')}
      subtitle={t('howItWorks.subtitle')}
    >
      <div className="relative">
        <span
          aria-hidden="true"
          className="absolute top-3 bottom-3 left-4 w-px bg-ink-200 sm:left-5"
        />
        <motion.span
          aria-hidden="true"
          className="absolute top-3 bottom-3 left-4 w-px origin-top bg-brand-600 sm:left-5"
          style={{ scaleY: shouldReduceMotion ? 1 : progress }}
        />

        <ol ref={listRef} className="space-y-10 sm:space-y-12">
          {STEP_IDS.map((id, index) => (
            <StepRow key={id} id={id} index={index} />
          ))}
        </ol>
      </div>

      <p className="mt-12 border-t border-ink-200/80 pt-6 text-sm leading-relaxed text-ink-500 sm:mt-14">
        {t('howItWorks.humanNote')}
      </p>
    </Section>
  )
}

interface StepRowProps {
  id: StepId
  index: number
}

function StepRow({ id, index }: StepRowProps) {
  const { t } = useTranslation()
  const itemRef = useRef<HTMLLIElement>(null)
  const isCurrent = useInView(itemRef, { margin: '-40% 0px -45% 0px' })

  return (
    <li
      ref={itemRef}
      className="relative grid gap-3 pl-12 sm:pl-16 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-12"
    >
      {/* A bolinha esconde a linha atras dela: o marcador usa a mesma superficie
          de fundo da folha (`bg-surface-muted`), entao a linha nao aparece por
          tras do numero em nenhum dos tons. */}
      <span
        aria-hidden="true"
        className={`absolute top-0 left-0 flex h-8 w-8 items-center justify-center rounded-full border font-mono text-[0.6875rem] font-semibold tabular-nums transition-colors duration-300 sm:h-10 sm:w-10 ${
          isCurrent
            ? 'border-brand-600 bg-brand-600 text-white'
            : 'border-ink-200 bg-surface-muted text-ink-500'
        }`}
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="lg:pt-1.5">
        <p className="mono-label text-ink-500">{t(`howItWorks.steps.${id}.label`)}</p>
        <h3 className="mt-2 text-lg font-bold text-ink-900 sm:text-xl">
          {t(`howItWorks.steps.${id}.title`)}
        </h3>
      </div>

      <p className="text-sm leading-relaxed text-ink-600 sm:text-base lg:pt-7">
        {t(`howItWorks.steps.${id}.text`)}
      </p>
    </li>
  )
}
