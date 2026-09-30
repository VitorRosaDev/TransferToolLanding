import type { ReactNode } from 'react'

import { Reveal } from './Reveal'

interface SectionProps {
  id: string
  /** Numero do bloco, exibido no rotulo tecnico do cabecalho. */
  number: string
  eyebrow: string
  title?: string
  subtitle?: ReactNode
  tone?: 'default' | 'muted'
  className?: string
  children: ReactNode
}

/**
 * Casca padrao de secao.
 *
 * O cabecalho usa sempre a mesma gramatica (regua fina + `NN / ROTULO` +
 * titulo + subtitulo), o que da ritmo de documento tecnico em vez de uma
 * sequencia de blocos soltos.
 */
export function Section({
  id,
  number,
  eyebrow,
  title,
  subtitle,
  tone = 'default',
  className = '',
  children,
}: SectionProps) {
  const headingId = `${id}-title`

  return (
    <section
      id={id}
      aria-labelledby={title ? headingId : undefined}
      className={`${tone === 'muted' ? 'bg-surface-muted' : 'bg-surface'} ${className}`.trim()}
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-8 lg:py-28">
        <Reveal className="border-t border-ink-200/80 pt-7">
          <p className="mono-label text-ink-500">
            <span className="text-brand-600">{number}</span>
            <span className="mx-2 text-ink-300">/</span>
            {eyebrow}
          </p>

          {title ? (
            <h2
              id={headingId}
              className="mt-4 max-w-3xl text-3xl font-bold text-balance text-ink-900 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]"
            >
              {title}
            </h2>
          ) : null}

          {subtitle ? (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-600 sm:text-lg">
              {subtitle}
            </p>
          ) : null}
        </Reveal>

        <div className="mt-12 lg:mt-16">{children}</div>
      </div>
    </section>
  )
}
