import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import {
  CONSENT_REOPEN_EVENT,
  denyConsent,
  grantConsent,
  readConsent,
  type ConsentStatus,
} from '../../lib/analytics'
import { buttonClass } from '../ui/buttonClass'
import { IconCookie } from '../ui/icons'

/**
 * Banner de consentimento (LGPD).
 *
 * Aparece enquanto nao houver escolha salva e reaparece quando o rodape ou a
 * secao de privacidade pedem para reabrir as preferencias. Nenhum script de
 * terceiros e injetado antes do "Aceitar".
 */
export function CookieBanner() {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(() => readConsent() === null)

  useEffect(() => {
    const handleReopen = () => setIsVisible(true)
    window.addEventListener(CONSENT_REOPEN_EVENT, handleReopen)
    return () => window.removeEventListener(CONSENT_REOPEN_EVENT, handleReopen)
  }, [])

  const decide = useCallback((status: ConsentStatus) => {
    if (status === 'granted') {
      grantConsent()
    } else {
      denyConsent()
    }
    setIsVisible(false)
  }, [])

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          key="cookie-banner"
          role="region"
          aria-label={t('cookies.ariaLabel')}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 28 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-3xl rounded-2xl border border-ink-200/80 bg-white/95 p-5 shadow-lift backdrop-blur-xl sm:inset-x-6 sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
              <IconCookie className="h-5 w-5" />
            </span>

            <div className="flex-1">
              <h2 className="font-display text-base font-bold text-ink-900">
                {t('cookies.title')}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{t('cookies.text')}</p>
              <a
                href="#privacy"
                onClick={() => setIsVisible(false)}
                className="mt-2 inline-block text-xs font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
              >
                {t('cookies.details')}
              </a>
            </div>

            <div className="flex shrink-0 gap-2 sm:flex-col">
              <button
                type="button"
                className={buttonClass('primary', 'md')}
                onClick={() => decide('granted')}
              >
                {t('cookies.accept')}
              </button>
              <button
                type="button"
                className={buttonClass('secondary', 'md')}
                onClick={() => decide('denied')}
              >
                {t('cookies.reject')}
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
