import { useTranslation } from 'react-i18next'

import { siteConfig } from '../../config/site'
import { reopenConsentPreferences } from '../../lib/analytics'
import { IconGithub, IconGlobe, IconLinkedin, IconMail } from '../ui/icons'
import { LanguageToggle } from './LanguageToggle'

/**
 * Canais do autor — os mesmos links do antigo card de contato, agora em icones
 * inline no rodape. O rotulo acessivel de cada um vem do dicionario.
 */
const SOCIAL_LINKS = [
  { id: 'linkedin', href: siteConfig.linkedin, Icon: IconLinkedin, external: true },
  { id: 'github', href: siteConfig.github, Icon: IconGithub, external: true },
  { id: 'email', href: `mailto:${siteConfig.email}`, Icon: IconMail, external: false },
  { id: 'website', href: siteConfig.website, Icon: IconGlobe, external: true },
] as const

const ICON_LINK_CLASS =
  'inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-brand-700'

/**
 * Rodape: a assinatura do projeto em uma linha, seguida dos canais em icones.
 *
 * Fica fora do empilhamento (nao e folha): entra depois da ultima e sobe com o
 * fim do documento. `z-20` garante que ele passe por cima da folha final na
 * emenda.
 */
export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="relative z-20 border-t border-ink-200/70 bg-surface">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-6 py-8 text-center sm:flex-row sm:justify-between sm:px-8 sm:text-left">
        <p className="text-xs text-ink-500">{t('footer.rights', { year })}</p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <ul aria-label={t('footer.linksLabel')} className="flex list-none items-center gap-1 p-0">
            {SOCIAL_LINKS.map(({ id, href, Icon, external }) => (
              <li key={id}>
                <a
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  aria-label={t(`footer.links.${id}`)}
                  title={t(`footer.links.${id}`)}
                  className={ICON_LINK_CLASS}
                >
                  <Icon className="h-4.5 w-4.5" />
                </a>
              </li>
            ))}
          </ul>

          <LanguageToggle
            showIcon
            className="inline-flex! border-transparent bg-transparent p-0 backdrop-blur-none lg:hidden!"
          />

          <button
            type="button"
            onClick={reopenConsentPreferences}
            className="text-xs font-medium text-ink-500 underline underline-offset-2 transition-colors hover:text-brand-700"
          >
            {t('footer.consentPreferences')}
          </button>
        </div>
      </div>
    </footer>
  )
}
