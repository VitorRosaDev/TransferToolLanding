import type { ReactNode } from 'react'

import {
  sectionChrome,
  sectionIndex,
  sectionTone,
  type SectionId,
  type SectionTone,
} from '../../config/sections'
import { SHEET_SURFACE } from '../../lib/sheetTone'
import { Reveal } from './Reveal'
import { Stack } from './Stack'

/**
 * Cor do numero do bloco.
 *
 * Os neutros (rotulo, regua, titulo, subtitulo) nao precisam de variante: sao
 * tokens `ink-*` e a folha escura os inverte por CSS. O accent, que tambem e
 * preenchimento de botao, fica explicito — sobre fundo escuro o `brand-600`
 * perde contraste de leitura e o tom legivel e o `brand-400`.
 */
const NUMBER_TONE: Record<SectionTone, string> = {
  light: 'text-brand-600',
  dark: 'text-brand-400',
}

interface SectionProps {
  id: SectionId
  /** Numero do bloco, exibido no rotulo tecnico do cabecalho. */
  number: string
  eyebrow: string
  title?: string
  subtitle?: ReactNode
  /** Camada decorativa atras do conteudo (malha, cena 3D). */
  background?: ReactNode
  className?: string
  children: ReactNode
}

/**
 * Casca padrao de secao: uma folha da mesa.
 *
 * O cabecalho usa sempre a mesma gramatica (regua fina + `NN / ROTULO` +
 * titulo + subtitulo), o que da ritmo de documento tecnico em vez de uma
 * sequencia de blocos soltos. Tom e posicao de empilhamento vem de
 * `src/config/sections.ts` — nenhuma secao escolhe a propria pele.
 */
export function Section({
  id,
  number,
  eyebrow,
  title,
  subtitle,
  background,
  className = '',
  children,
}: SectionProps) {
  const headingId = `${id}-title`
  const tone = sectionTone(id)

  return (
    <Stack
      id={id}
      tone={tone}
      chrome={sectionChrome(id)}
      index={sectionIndex(id)}
      background={background}
      className={`${SHEET_SURFACE[tone]} ${className}`.trim()}
      aria-labelledby={title ? headingId : undefined}
    >
      <div className="relative mx-auto my-auto w-full max-w-6xl px-6 py-20 sm:px-8 lg:py-28">
        <Reveal className="mx-auto border-t border-ink-200/80 pt-7 text-center lg:mx-0 lg:text-left">
          <p className="mono-label text-ink-500">
            <span className={NUMBER_TONE[tone]}>{number}</span>
            <span className="mx-2 text-ink-300">/</span>
            {eyebrow}
          </p>

          {title ? (
            <h2
              id={headingId}
              className="mx-auto mt-4 max-w-3xl text-3xl font-bold text-balance text-ink-900 sm:text-4xl lg:mx-0 lg:text-[2.75rem] lg:leading-[1.08]"
            >
              {title}
            </h2>
          ) : null}

          {subtitle ? (
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-justify text-ink-600 sm:text-lg lg:mx-0 lg:text-left">
              {subtitle}
            </p>
          ) : null}
        </Reveal>

        <div className="mt-12 lg:mt-16">{children}</div>
      </div>
    </Stack>
  )
}
