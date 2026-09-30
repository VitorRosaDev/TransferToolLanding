/**
 * Camada unica de analise de audiencia.
 *
 * Regras de privacidade aplicadas aqui:
 * - Nenhum script de terceiros e injetado enquanto nao houver consentimento explicito.
 * - Sem `VITE_GA_ID` configurado, a camada inteira vira no-op (nenhuma rede, nenhum cookie).
 * - Consent Mode v2 com `analytics_storage` negado por padrao e anonimizacao de IP.
 */

export type ConsentStatus = 'granted' | 'denied'

export const CONSENT_STORAGE_KEY = 'transfertool.analytics-consent'

/** Evento disparado pelo rodape para reabrir o banner de consentimento. */
export const CONSENT_REOPEN_EVENT = 'transfertool:consent-reopen'

const GA_ID = import.meta.env.VITE_GA_ID?.trim() ?? ''

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

let scriptRequested = false
let configured = false

/** Existe Measurement ID configurado no build? */
export function hasAnalyticsId(): boolean {
  return GA_ID.length > 0
}

/** Le a escolha salva. `null` = o visitante ainda nao decidiu. */
export function readConsent(): ConsentStatus | null {
  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    return stored === 'granted' || stored === 'denied' ? stored : null
  } catch {
    return null
  }
}

function persistConsent(value: ConsentStatus): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value)
  } catch {
    // Sem storage disponivel: a escolha vale para a sessao atual.
  }
}

function ensureDataLayer(): void {
  window.dataLayer = window.dataLayer ?? []
  window.gtag =
    window.gtag ??
    function gtagShim(...args: unknown[]): void {
      window.dataLayer?.push(args)
    }
}

function applyConsentMode(analyticsStorage: 'granted' | 'denied'): void {
  window.gtag?.('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: analyticsStorage,
  })
}

/**
 * Injeta o gtag.js uma unica vez, de forma nao bloqueante: o `dataLayer` guarda
 * os comandos enfileirados e o script os processa quando terminar de carregar.
 */
function loadGtagScript(): void {
  if (scriptRequested || typeof document === 'undefined') return
  scriptRequested = true

  if (document.querySelector('script[data-transfertool-ga]')) return

  const script = document.createElement('script')
  script.async = true
  script.dataset.transfertoolGa = 'true'
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`
  document.head.appendChild(script)
}

/** Registra consentimento e, se houver Measurement ID, carrega o GA4. */
export function grantConsent(): void {
  persistConsent('granted')

  if (!hasAnalyticsId()) return

  ensureDataLayer()
  applyConsentMode('granted')
  loadGtagScript()

  if (configured) return
  configured = true

  window.gtag?.('js', new Date())
  window.gtag?.('config', GA_ID, {
    anonymize_ip: true,
    send_page_view: true,
  })
  trackEvent('consent_granted')
}

/** Registra recusa: nada e carregado, o acesso a rede fica bloqueado. */
export function denyConsent(): void {
  persistConsent('denied')

  if (!hasAnalyticsId()) return

  ensureDataLayer()
  applyConsentMode('denied')
  window.gtag?.('consent', 'update', { analytics_storage: 'denied' })
}

/**
 * Dispara um evento personalizado. Nunca envia nada sem consentimento explicito.
 * Eventos previstos: `download_started`, `contact_click`, `faq_opened`, `language_changed`.
 */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (!hasAnalyticsId()) return
  if (readConsent() !== 'granted') return
  window.gtag?.('event', name, params ?? {})
}

/** Reaplica a escolha salva (chamado uma vez na inicializacao do app). */
export function initAnalytics(): void {
  const consent = readConsent()
  if (consent === 'granted') {
    grantConsent()
    return
  }
  if (consent === 'denied') {
    denyConsent()
  }
}

/** Solicitado pelo rodape: reabre o banner de cookies. */
export function reopenConsentPreferences(): void {
  window.dispatchEvent(new Event(CONSENT_REOPEN_EVENT))
}
