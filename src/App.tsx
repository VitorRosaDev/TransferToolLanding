import { useEffect, type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { CookieBanner } from './components/layout/CookieBanner'
import { Footer } from './components/layout/Footer'
import { Navbar } from './components/layout/Navbar'
import { Downloads } from './components/sections/Downloads'
import { Faq } from './components/sections/Faq'
import { Hero } from './components/sections/Hero'
import { HowItWorks } from './components/sections/HowItWorks'
import { Overview } from './components/sections/Overview'
import { Privacy } from './components/sections/Privacy'
import { SECTIONS, type SectionId } from './config/sections'
import { initAnalytics } from './lib/analytics'

/**
 * Folha de cada secao, com a ordem vinda de `src/config/sections.ts`.
 *
 * O mapa e exaustivo por tipo: declarar uma folha nova na configuracao obriga a
 * ligar o componente aqui, e ordem, tom e navegacao passam a ter uma fonte so.
 */
const SHEETS: Record<SectionId, () => ReactElement> = {
  inicio: Hero,
  overview: Overview,
  howItWorks: HowItWorks,
  downloads: Downloads,
  privacy: Privacy,
  faq: Faq,
}

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
        {SECTIONS.map(({ id }) => {
          const Sheet = SHEETS[id]

          return <Sheet key={id} />
        })}
      </main>

      <Footer />
      <CookieBanner />
    </div>
  )
}
