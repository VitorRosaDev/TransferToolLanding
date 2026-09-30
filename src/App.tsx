import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { CookieBanner } from './components/layout/CookieBanner'
import { Footer } from './components/layout/Footer'
import { Navbar } from './components/layout/Navbar'
import { Contact } from './components/sections/Contact'
import { Downloads } from './components/sections/Downloads'
import { Faq } from './components/sections/Faq'
import { Hero } from './components/sections/Hero'
import { HowItWorks } from './components/sections/HowItWorks'
import { Overview } from './components/sections/Overview'
import { Privacy } from './components/sections/Privacy'
import { initAnalytics } from './lib/analytics'

export default function App() {
  const { t } = useTranslation()

  useEffect(() => {
    // Reaplica a escolha de consentimento salva (nenhum script sem permissao).
    initAnalytics()
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[70] focus:rounded-xl focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        {t('common.skipToContent')}
      </a>

      <Navbar />

      <main id="main" className="flex-1">
        <Hero />

        <Overview />

        <HowItWorks />
        <Downloads />
        <Privacy />
        <Faq />
        <Contact />
      </main>

      <Footer />
      <CookieBanner />
    </div>
  )
}
