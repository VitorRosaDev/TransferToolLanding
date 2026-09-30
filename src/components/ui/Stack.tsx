import { useCallback, useLayoutEffect, useRef, useState, type ReactNode, type Ref } from 'react'
import { useReducedMotion } from 'framer-motion'

import type { SectionChrome, SectionTone } from '../../config/sections'
import { SheetToneContext } from '../../lib/sheetTone'

/** Degrau da primeira folha: cada folha seguinte sobe um e cobre as anteriores. */
const SHEET_BASE_Z = 10

interface StackProps {
  id: string
  /** Tom declarado em `src/config/sections.ts`. */
  tone: SectionTone
  /** Pele do cabecalho sobre esta folha — vidro do tom ou solto sobre a cena. */
  chrome: SectionChrome
  /** Posicao na mesa (0 = primeira folha). Define o `z-index`. */
  index: number
  /** Camada decorativa atras do conteudo (malha, cena 3D). */
  background?: ReactNode
  className?: string
  /** Ancora externa: o hero, por exemplo, serve de referencia para o cubo. */
  ref?: Ref<HTMLElement>
  'aria-labelledby'?: string
  children: ReactNode
}

/**
 * Folha empilhada.
 *
 * A mecanica e toda de CSS: `position: sticky` com um `top` calculado:
 *
 * - folha que cabe na janela → `top: 0`, prende no topo e a proxima sobe por
 *   cima dela;
 * - folha mais alta que a janela → `top: janela - altura`, rola inteira e so
 *   trava quando o fim encosta na base da tela, que e exatamente o instante em
 *   que a folha seguinte entra em cena.
 *
 * A medida depende das duas alturas (conteudo e janela), entao o recalculo
 * escuta o `ResizeObserver` da folha e o `resize` da janela. Com
 * `prefers-reduced-motion` a folha apenas rola: sem `sticky` nao ha transicao
 * de capa para preservar.
 *
 * `data-section-tone` e o marcador publico da folha: a navbar le daqui o tom
 * que deve vestir (`useSectionTheme`) e `src/styles/index.css` usa o mesmo
 * atributo para inverter os neutros. Por isso a marcacao fica no proprio
 * elemento da folha — o retangulo dele e a medida que a navbar consulta, e
 * folha presa comecando fora da tela continua cobrindo o topo da janela.
 */
export function Stack({
  id,
  tone,
  chrome,
  index,
  background,
  className = '',
  ref,
  'aria-labelledby': labelledBy,
  children,
}: StackProps) {
  const sheetRef = useRef<HTMLElement>(null)
  const [top, setTop] = useState(0)
  const isPinned = useReducedMotion() !== true

  // Ancora interna (medicao) + ancora externa (o hero), no mesmo no.
  const attachSheet = useCallback(
    (node: HTMLElement | null) => {
      sheetRef.current = node
      if (!ref) return
      if (typeof ref === 'function') ref(node)
      else ref.current = node
    },
    [ref],
  )

  useLayoutEffect(() => {
    if (!isPinned) return undefined

    const sheet = sheetRef.current
    if (!sheet) return undefined

    const measure = () => {
      const viewport = window.innerHeight
      const height = sheet.offsetHeight
      setTop(height > viewport ? viewport - height : 0)
    }

    measure()
    window.addEventListener('resize', measure)

    if (typeof ResizeObserver === 'undefined') {
      return () => window.removeEventListener('resize', measure)
    }

    const observer = new ResizeObserver(measure)
    observer.observe(sheet)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [isPinned])

  return (
    <section
      id={id}
      ref={attachSheet}
      data-section-tone={tone}
      data-section-chrome={chrome}
      aria-labelledby={labelledBy}
      style={
        isPinned
          ? { top: `${top}px`, zIndex: SHEET_BASE_Z + index }
          : { zIndex: SHEET_BASE_Z + index }
      }
      className={`${isPinned ? 'sticky' : 'relative'} flex min-h-dvh flex-col ${className}`.trim()}
    >
      {background ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          {background}
        </div>
      ) : null}

      <SheetToneContext.Provider value={tone}>{children}</SheetToneContext.Provider>
    </section>
  )
}
