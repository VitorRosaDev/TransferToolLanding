import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

interface TypewriterOptions {
  /** Intervalo entre letras, em ms. */
  speed?: number
  /** Espera antes da primeira letra, em ms. */
  delay?: number
}

/**
 * Datilografa um texto letra a letra.
 *
 * O prefixo devolvido e sempre coerente com o texto atual: quando o idioma muda,
 * a contagem antiga e descartada no proprio render (sem um quadro com o fim do
 * texto anterior). Com `prefers-reduced-motion` o texto sai inteiro de uma vez.
 */
export function useTypewriter(text: string, { speed = 50, delay = 600 }: TypewriterOptions = {}) {
  const shouldReduceMotion = useReducedMotion()
  const [typed, setTyped] = useState({ text, count: 0 })

  useEffect(() => {
    if (shouldReduceMotion || !text) return

    let index = 0
    let timer = window.setTimeout(function step() {
      index += 1
      setTyped({ text, count: index })
      if (index < text.length) timer = window.setTimeout(step, speed)
    }, delay)

    return () => window.clearTimeout(timer)
  }, [text, speed, delay, shouldReduceMotion])

  const count = shouldReduceMotion ? text.length : typed.text === text ? typed.count : 0

  return { typed: text.slice(0, count), isTyping: count < text.length }
}
