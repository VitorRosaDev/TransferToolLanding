import type { ElementType, HTMLAttributes, ReactNode } from 'react'

/** Superficie unica da pagina: mesmo raio, borda e sombra em todos os cards. */
const SURFACE_CLASS = 'rounded-2xl border border-ink-200/70 bg-surface shadow-card'

interface CardProps {
  children: ReactNode
  className?: string
  /**
   * Permite escolher a tag semantica (`li`, `div`, `section`...).
   *
   * O tipo precisa ser limitado aos elementos HTML: o `ElementType` cru tambem
   * cobre as chaves que o React Three Fiber injeta em `JSX.IntrinsicElements`, e
   * as que ele deixa como `never` zeram a inferencia das props do componente.
   */
  as?: ElementType<HTMLAttributes<HTMLElement>>
}

/**
 * Bloco de conteudo padrao.
 *
 * O padding fica a cargo de quem usa (`className`), evitando que duas regras
 * de espacamento disputem a mesma propriedade no CSS gerado.
 */
export function Card({ children, className = '', as: Tag = 'article' }: CardProps) {
  return <Tag className={`${SURFACE_CLASS} ${className}`.trim()}>{children}</Tag>
}

interface CardLinkProps {
  href: string
  /** Abre em nova aba com `rel` seguro (links internos do site ficam na mesma aba). */
  external?: boolean
  className?: string
  onClick?: () => void
  'aria-label'?: string
  children: ReactNode
}

/**
 * Card que e inteiro clicavel.
 *
 * Reusa a mesma superficie do `Card` para que um cartao de contato e um cartao
 * de conteudo sejam indistinguiveis em raio, borda e sombra.
 */
export function CardLink({
  href,
  external = false,
  className = '',
  onClick,
  children,
  ...rest
}: CardLinkProps) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onClick={onClick}
      aria-label={rest['aria-label']}
      className={`${SURFACE_CLASS} block ${className}`.trim()}
    >
      {children}
    </a>
  )
}

interface IconTileProps {
  children: ReactNode
  className?: string
}

/** Quadrado de icone: um so tom de accent para toda a pagina. */
export function IconTile({ children, className = '' }: IconTileProps) {
  return (
    <span
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-brand-100 bg-brand-50 text-brand-600 ${className}`.trim()}
    >
      {children}
    </span>
  )
}
