import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import ptBR from './locales/pt-BR.json'

export const SUPPORTED_LANGUAGES = ['pt-BR', 'en'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const LANGUAGE_STORAGE_KEY = 'transfertool.language'

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  'pt-BR': 'Português',
  en: 'English',
}

function isSupported(value: string | null | undefined): value is SupportedLanguage {
  return typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value)
}

function readStoredLanguage(): SupportedLanguage | null {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return isSupported(stored) ? stored : null
  } catch {
    // Navegacao privada ou storage bloqueado: seguimos sem persistir.
    return null
  }
}

/** Idioma inicial: escolha salva > idioma do navegador > pt-BR. */
export function detectLanguage(): SupportedLanguage {
  const stored = readStoredLanguage()
  if (stored) return stored

  if (typeof navigator === 'undefined') return 'pt-BR'

  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language]

  for (const candidate of candidates) {
    const normalized = candidate?.toLowerCase() ?? ''
    if (normalized.startsWith('pt')) return 'pt-BR'
    if (normalized.startsWith('en')) return 'en'
  }

  return 'pt-BR'
}

function persistLanguage(language: SupportedLanguage): void {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch {
    // Sem persistencia: a preferencia vale apenas para a sessao atual.
  }
}

/** Mantem <html lang>, <title> e a meta description coerentes com o idioma ativo (SEO). */
function applyDocumentMetadata(language: SupportedLanguage): void {
  if (typeof document === 'undefined') return

  document.documentElement.lang = language
  document.title = i18n.t('meta.title')

  const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
  if (description) {
    description.content = i18n.t('meta.description')
  }

  const ogLocale = document.querySelector<HTMLMetaElement>('meta[property="og:locale"]')
  if (ogLocale) {
    ogLocale.content = language === 'pt-BR' ? 'pt_BR' : 'en_US'
  }
}

void i18n.use(initReactI18next).init({
  resources: {
    'pt-BR': { translation: ptBR },
    en: { translation: en },
  },
  lng: detectLanguage(),
  fallbackLng: 'pt-BR',
  supportedLngs: SUPPORTED_LANGUAGES,
  interpolation: { escapeValue: false },
  returnNull: false,
})

i18n.on('languageChanged', (language) => {
  if (!isSupported(language)) return
  persistLanguage(language)
  applyDocumentMetadata(language)
})

applyDocumentMetadata(isSupported(i18n.language) ? i18n.language : 'pt-BR')

export default i18n
