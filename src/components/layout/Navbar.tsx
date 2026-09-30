import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import logoUrl from '../../assets/logo.png'
import { NAV_LABEL_KEY } from '../../config/navigation'
import { SECTION_IDS } from '../../config/site'
import { heroSectionRef } from '../../lib/heroAnchor'
import { buttonClass } from '../ui/buttonClass'
import { IconClose, IconMenu } from '../ui/icons'
import { LanguageToggle } from './LanguageToggle'

/**
 * Fracao do hero em que o cabecalho troca de pele.
 *
 * O progresso vem do proprio hero: 0 com o topo alinhado a janela e 1 quando ele
 * termina de sair de cena. Na metade do caminho a faixa escura ja passou da
 * altura das letras, e o cabecalho pode assumir o fundo claro sem deixar texto
 * claro sobre branco.
 */
const HERO_HANDOVER = 0.5

export function Navbar() {
  const { i18n, t } = useTranslation()
  const [solid, setSolid] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const { scrollYProgress } = useScroll({
    target: heroSectionRef,
    offset: ['start start', 'end start'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const pastHero = progress >= HERO_HANDOVER
    setSolid((current) => (current === pastHero ? current : pastHero))
  })

  const isSolid = solid || menuOpen

  const chrome = isSolid
    ? 'border-ink-200/70 bg-white/85 backdrop-blur-xl'
    : 'border-transparent bg-transparent'
  const brandTone = isSolid ? 'text-ink-900' : 'text-white'
  const linkTone = isSolid ? 'text-ink-600' : 'text-white/80'
  const controlTone = isSolid
    ? 'border-ink-200 text-ink-700 hover:bg-ink-100'
    : 'border-white/25 text-white hover:bg-white/10'

  useEffect(() => {
    // Fecha o menu mobile sempre que o idioma muda (evento de sistema externo).
    const handleLanguageChanged = () => setMenuOpen(false)
    i18n.on('languageChanged', handleLanguageChanged)
    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [i18n])

  useEffect(() => {
    if (!menuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-200 ${chrome}`}
    >
      <nav
        aria-label={t('nav.ariaLabel')}
        className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-6 sm:px-8 lg:h-18"
      >
        <a href="#inicio" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
          <img src={logoUrl} alt="" width={40} height={42} className="h-9 w-auto" />
          <span
            className={`font-display text-lg font-bold tracking-tight transition-colors duration-200 ${brandTone}`}
          >
            {t('common.brand')}
          </span>
        </a>

        <ul className="ml-6 hidden items-center gap-1 lg:flex">
          {SECTION_IDS.map((section) => (
            <li key={section}>
              <a
                href={`#${section}`}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-brand-50 hover:text-brand-700 ${linkTone}`}
              >
                {t(NAV_LABEL_KEY[section])}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2.5">
          <LanguageToggle />

          <a
            href="#downloads"
            className={buttonClass('primary', 'md', 'hidden sm:inline-flex')}
            onClick={() => setMenuOpen(false)}
          >
            {t('nav.cta')}
          </a>

          <button
            type="button"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors lg:hidden ${controlTone}`}
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            aria-label={menuOpen ? t('common.closeMenu') : t('common.openMenu')}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence initial={false}>
        {menuOpen ? (
          <motion.div
            id="menu-mobile"
            key="menu-mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-ink-200/70 bg-white/95 backdrop-blur-xl lg:hidden"
          >
            <ul className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-6 py-4 sm:px-8">
              {SECTION_IDS.map((section) => (
                <li key={section}>
                  <a
                    href={`#${section}`}
                    className="block rounded-xl px-3 py-2.5 text-base font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t(NAV_LABEL_KEY[section])}
                  </a>
                </li>
              ))}
              <li className="pt-1 sm:hidden">
                <a
                  href="#downloads"
                  className={buttonClass('primary', 'md', 'w-full')}
                  onClick={() => setMenuOpen(false)}
                >
                  {t('nav.cta')}
                </a>
              </li>
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
