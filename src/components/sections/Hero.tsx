import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import { trackEvent } from '../../lib/analytics'
import { heroSectionRef } from '../../lib/heroAnchor'
import { useTypewriter } from '../../lib/useTypewriter'
import { buttonClass } from '../ui/buttonClass'
import { ShapeGrid } from '../ui/ShapeGrid'
import { TransferCoreCanvas } from './TransferCoreCanvas'

/**
 * Hero: a promessa em uma frase e o nucleo visual da transferencia. O conteudo
 * recua suavemente no scroll para dar passagem a secao seguinte.
 */
export function Hero() {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()
  const titleLine1 = t('hero.titleLine1')
  const titleLine2 = t('hero.titleLine2')
  const { typed, isTyping } = useTypewriter(titleLine2)

  const { scrollYProgress } = useScroll({
    target: heroSectionRef,
    offset: ['start start', 'end start'],
  })

  const copyY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : -60])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.72], [1, shouldReduceMotion ? 1 : 0])

  return (
    <section
      id="inicio"
      ref={heroSectionRef}
      className="relative isolate overflow-hidden bg-void-950 pt-28 pb-20 sm:pt-32 lg:pt-40 lg:pb-28"
    >
      {/*
        Palco do hero: malha animada no lugar da textura estatica. O passo de
        56px mantem a cadencia da malha antiga; a borda usa o mesmo branco de
        5,5% e o hover acende a celula no azul da marca. A camada nao captura
        ponteiro (o ShapeGrid rastreia o cursor pela janela) e desbota nas bordas
        pela mascara radial.
      */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 mask-fade-edges">
        <ShapeGrid
          direction="diagonal"
          speed={0.2}
          squareSize={100}
          shape="square"
          borderColor="rgba(255, 255, 255, 0.055)"
          hoverFillColor="rgba(59, 118, 246, 0.22)"
          hoverTrailAmount={4}
        />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-14">
          <motion.div style={{ y: copyY, opacity: copyOpacity }}>
            <p className="mono-label text-white/55">{t('hero.badge')}</p>

            {/*
              Duas camadas no mesmo slot do grid: a invisivel reserva a altura do
              titulo completo (nada se desloca enquanto o texto e datilografado) e
              a visivel mostra o prefixo. O nome acessivel vem do aria-label.
              A quebra forcada mantem a segunda linha sempre abaixo da primeira:
              sem ela o texto datilografado comeca na mesma linha e a frase reflui
              a cada letra.
            */}
            <h1
              aria-label={`${titleLine1} ${titleLine2}`}
              className="mt-6 grid max-w-[18ch] text-4xl leading-[1.06] font-bold text-balance text-white sm:text-5xl lg:text-[3.4rem]"
            >
              <span aria-hidden="true" className="invisible col-start-1 row-start-1">
                {titleLine1}
                <br />
                <span className="text-white/50">{titleLine2}</span>
              </span>

              <span aria-hidden="true" className="col-start-1 row-start-1">
                {titleLine1}
                <br />
                <span className="text-white/50">{typed}</span>
                {isTyping ? (
                  <span className="ml-1 inline-block h-[1em] w-[0.085em] translate-y-[0.08em] rounded-full bg-current animate-caret-blink" />
                ) : null}
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
              {t('hero.subtitle')}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#downloads"
                className={buttonClass('primary', 'lg')}
                onClick={() => trackEvent('cta_click', { location: 'hero', target: 'downloads' })}
              >
                {t('hero.ctaPrimary')}
              </a>
              <a
                href="#howItWorks"
                className={buttonClass('onDark', 'lg')}
                onClick={() =>
                  trackEvent('cta_click', { location: 'hero', target: 'how-it-works' })
                }
              >
                {t('hero.ctaSecondary')}
              </a>
            </div>

            <p className="mono-label mt-8 flex items-center gap-2.5 text-white/55">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400 animate-pulse-soft"
              />
              {t('hero.offlineNote')}
            </p>
          </motion.div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="relative h-[300px] w-full sm:h-[360px] lg:h-[400px]">
              <TransferCoreCanvas className="absolute inset-0 h-full w-full" />
            </div>

            <motion.p
              style={{ opacity: copyOpacity }}
              className="mono-label mt-4 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-center text-white/50"
            >
              <span>{t('hero.flow.mobileLabel')}</span>
              <span aria-hidden="true" className="text-white/20">
                &rarr;
              </span>
              <span className="text-brand-300">{t('hero.flow.payloadLabel')}</span>
              <span aria-hidden="true" className="text-white/20">
                &rarr;
              </span>
              <span>{t('hero.flow.desktopLabel')}</span>
            </motion.p>
          </div>
        </div>
      </div>

    </section>
  )
}
