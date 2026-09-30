import { afterEach, describe, expect, it, vi } from 'vitest'

/** Carrega o modulo com um Measurement ID especifico (a constante e lida no import). */
async function loadAnalytics(gaId?: string) {
  vi.resetModules()
  vi.stubEnv('VITE_GA_ID', gaId ?? '')
  return await import('../lib/analytics')
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('lib/analytics', () => {
  it('nao tem Measurement ID quando a variavel de ambiente esta vazia', async () => {
    const analytics = await loadAnalytics()
    expect(analytics.hasAnalyticsId()).toBe(false)
  })

  it('comeca sem consentimento registrado', async () => {
    const analytics = await loadAnalytics('G-TESTE123')
    expect(analytics.readConsent()).toBeNull()
  })

  it('nao injeta script de terceiros quando o visitante recusa', async () => {
    const analytics = await loadAnalytics('G-TESTE123')

    analytics.denyConsent()

    expect(analytics.readConsent()).toBe('denied')
    expect(document.querySelector('script[data-transfertool-ga]')).toBeNull()
  })

  it('permanece inerte quando nao ha Measurement ID configurado', async () => {
    const analytics = await loadAnalytics()

    analytics.grantConsent()

    expect(analytics.readConsent()).toBe('granted')
    expect(document.querySelector('script[data-transfertool-ga]')).toBeNull()
  })

  it('carrega o gtag apenas depois do consentimento', async () => {
    const analytics = await loadAnalytics('G-TESTE123')

    analytics.grantConsent()

    const script = document.querySelector('script[data-transfertool-ga]')
    expect(script).not.toBeNull()
    expect(script?.getAttribute('src')).toContain('G-TESTE123')
  })

  it('injeta o script uma unica vez', async () => {
    const analytics = await loadAnalytics('G-TESTE123')

    analytics.grantConsent()
    analytics.grantConsent()
    analytics.initAnalytics()

    expect(document.querySelectorAll('script[data-transfertool-ga]')).toHaveLength(1)
  })

  it('descarta eventos personalizados sem consentimento', async () => {
    const analytics = await loadAnalytics('G-TESTE123')
    const gtagSpy = vi.fn()
    window.gtag = gtagSpy

    analytics.trackEvent('download_started', { platform: 'mobile' })

    expect(gtagSpy).not.toHaveBeenCalled()
  })

  it('encaminha eventos personalizados apos o consentimento', async () => {
    const analytics = await loadAnalytics('G-TESTE123')
    analytics.grantConsent()

    const gtagSpy = vi.fn()
    window.gtag = gtagSpy

    analytics.trackEvent('download_started', { platform: 'mobile', version: '1.1.1' })

    expect(gtagSpy).toHaveBeenCalledWith('event', 'download_started', {
      platform: 'mobile',
      version: '1.1.1',
    })
  })

  it('grava a escolha do visitante para as proximas visitas', async () => {
    const analytics = await loadAnalytics('G-TESTE123')

    analytics.grantConsent()

    expect(window.localStorage.getItem(analytics.CONSENT_STORAGE_KEY)).toBe('granted')
  })

  it('dispara o evento de reabertura das preferencias', async () => {
    const analytics = await loadAnalytics('G-TESTE123')
    const listener = vi.fn()
    window.addEventListener(analytics.CONSENT_REOPEN_EVENT, listener)

    analytics.reopenConsentPreferences()

    expect(listener).toHaveBeenCalledTimes(1)
    window.removeEventListener(analytics.CONSENT_REOPEN_EVENT, listener)
  })
})
