import { useTranslation } from 'react-i18next'

import logoUrl from '../../assets/logo.png'
import { RELEASES_PAGE_URL } from '../../config/downloads'
import { NAV_LABEL_KEY } from '../../config/navigation'
import { SECTION_IDS, siteConfig } from '../../config/site'
import { reopenConsentPreferences } from '../../lib/analytics'
import { IconArrowUp, IconGithub, IconLinkedin, IconMail } from '../ui/icons'

const linkClass = 'text-sm text-ink-600 transition-colors hover:text-brand-700'
const groupTitleClass = 'text-xs font-semibold tracking-[0.14em] text-ink-500 uppercase'

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-ink-200/70 bg-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <img src={logoUrl} alt="" width={40} height={42} className="h-9 w-auto" />
              <span className="font-display text-lg font-bold text-ink-900">
                {t('common.brand')}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500">
              {t('footer.tagline')}
            </p>
          </div>

          <nav aria-label={t('footer.productTitle')}>
            <h2 className={groupTitleClass}>{t('footer.productTitle')}</h2>
            <ul className="mt-4 list-none space-y-2.5 p-0">
              {SECTION_IDS.map((section) => (
                <li key={section}>
                  <a href={`#${section}`} className={linkClass}>
                    {t(NAV_LABEL_KEY[section])}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t('footer.projectTitle')}>
            <h2 className={groupTitleClass}>{t('footer.projectTitle')}</h2>
            <ul className="mt-4 list-none space-y-2.5 p-0">
              <li>
                <a
                  href={RELEASES_PAGE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {t('footer.releases')}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {t('contact.github')}
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={reopenConsentPreferences}
                  className={`${linkClass} text-left`}
                >
                  {t('footer.consentPreferences')}
                </button>
              </li>
            </ul>
          </nav>

          <nav aria-label={t('footer.contactTitle')}>
            <h2 className={groupTitleClass}>{t('footer.contactTitle')}</h2>
            <ul className="mt-4 list-none space-y-2.5 p-0">
              <li>
                <a
                  href={siteConfig.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClass} inline-flex items-center gap-2`}
                >
                  <IconLinkedin className="h-4 w-4" />
                  {t('contact.linkedin')}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className={`${linkClass} inline-flex items-center gap-2`}
                >
                  <IconMail className="h-4 w-4" />
                  {t('contact.email')}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClass} inline-flex items-center gap-2`}
                >
                  <IconGithub className="h-4 w-4" />
                  {t('contact.github')}
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-ink-200/70 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-ink-500">{t('footer.rights', { year })}</p>
          <p className="text-xs text-ink-500">{t('footer.builtWith')}</p>
          <a
            href="#inicio"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 transition-colors hover:text-brand-800"
          >
            <IconArrowUp className="h-3.5 w-3.5" />
            {t('footer.backToTop')}
          </a>
        </div>
      </div>
    </footer>
  )
}
