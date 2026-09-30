import type { MouseEvent, ReactNode } from 'react'

import { buttonClass, type ButtonSize, type ButtonVariant } from './buttonClass'

interface SharedProps {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
}

type AnchorProps = SharedProps & {
  href: string
  target?: string
  rel?: string
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
  'aria-label'?: string
}

type NativeProps = SharedProps & {
  href?: undefined
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  'aria-label'?: string
}

export type ButtonProps = AnchorProps | NativeProps

/** Botao unico da aplicacao: vira `<a>` quando recebe `href`, senao `<button>`. */
export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', className, children } = props
  const classes = buttonClass(variant, size, className)

  if (props.href !== undefined) {
    return (
      <a
        className={classes}
        href={props.href}
        target={props.target}
        rel={props.rel}
        onClick={props.onClick}
        aria-label={props['aria-label']}
      >
        {children}
      </a>
    )
  }

  return (
    <button
      className={classes}
      type={props.type ?? 'button'}
      disabled={props.disabled}
      onClick={props.onClick}
      aria-label={props['aria-label']}
    >
      {children}
    </button>
  )
}
