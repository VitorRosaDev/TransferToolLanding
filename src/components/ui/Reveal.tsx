import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
}

/**
 * Entrada discreta: opacidade e 10px de deslocamento, uma unica vez.
 *
 * Movimento exagerado repetido em cada bloco e o que faz uma pagina "parecer
 * gerada". Aqui a animacao existe para dar ordem de leitura, nao espetaculo.
 */
export function Reveal({ children, className = '', delay = 0 }: RevealProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-64px' }}
      transition={{ duration: 0.45, delay, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
