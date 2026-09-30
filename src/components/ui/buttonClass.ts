export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'onDark'
export type ButtonSize = 'md' | 'lg'

const BASE_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-200 disabled:pointer-events-none disabled:opacity-55'

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white shadow-[0_12px_26px_-16px_var(--color-brand-700)] hover:bg-brand-700',
  secondary:
    'border border-ink-200 bg-surface text-ink-800 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800',
  ghost: 'text-ink-700 hover:bg-ink-100 hover:text-ink-900',
  onDark: 'text-white ring-1 ring-white/20 ring-inset hover:bg-white/10',
}

const SIZE_CLASS: Record<ButtonSize, string> = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-base',
}

/** Classes do botao padrao — reutilizavel em `<a>` e `<button>` fora do componente. */
export function buttonClass(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className = '',
): string {
  return `${BASE_CLASS} ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`.trim()
}
