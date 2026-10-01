import { useTranslation } from 'react-i18next'

import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES, type SupportedLanguage } from '../../i18n'
import { trackEvent } from '../../lib/analytics'
import { IconGlobe } from '../ui/icons'

const SHORT_LABEL: Record<SupportedLanguage, string> = {
  'pt-BR': 'PT',
  en: 'EN',
}

interface LanguageToggleProps {
  className?: string
  showIcon?: boolean
}

function normalizeLanguage(language: string): SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(language)
    ? (language as SupportedLanguage)
    : 'pt-BR'
}

/** Alternador de idioma acessivel (grupo de botoes com `aria-pressed`). */
export function LanguageToggle({ className = '', showIcon = false }: LanguageToggleProps) {
  const { i18n, t } = useTranslation()
  const current = normalizeLanguage(i18n.language)

  const handleSelect = (language: SupportedLanguage) => {
    if (language === current) return
    void i18n.changeLanguage(language)
    trackEvent('language_changed', { language })
  }

  return (
    <div
      role="group"
      aria-label={t('common.language')}
      className={`inline-flex items-center gap-0.5 rounded-full border border-ink-200 bg-white/80 p-0.5 backdrop-blur ${className}`.trim()}
    >
      {showIcon ? (
        <IconGlobe aria-hidden="true" className="ml-2 h-4 w-4 shrink-0 text-ink-500" />
      ) : null}
      {SUPPORTED_LANGUAGES.map((language) => {
        const isActive = language === current

        return (
          <button
            key={language}
            type="button"
            onClick={() => handleSelect(language)}
            aria-pressed={isActive}
            title={t('common.switchTo', { language: LANGUAGE_LABELS[language] })}
            className={`min-h-11 min-w-11 rounded-full px-2.5 text-xs font-semibold tracking-wide transition-colors ${
              isActive ? 'bg-brand-600 text-white' : 'text-ink-500 hover:text-brand-700'
            }`}
          >
            {SHORT_LABEL[language]}
          </button>
        )
      })}
    </div>
  )
}
