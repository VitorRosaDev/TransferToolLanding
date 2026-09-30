import { useTranslation } from 'react-i18next'

import { CONTACT_LINKS, siteConfig, type ContactLinkId } from '../../config/site'
import { trackEvent } from '../../lib/analytics'
import { CardLink, IconTile } from '../ui/Card'
import { IconExternalLink, IconGithub, IconGlobe, IconLinkedin, IconMail } from '../ui/icons'
import { Reveal } from '../ui/Reveal'
import { Section } from '../ui/Section'

const CONTACT_ITEMS = {
  linkedin: { href: siteConfig.linkedin, Icon: IconLinkedin, external: true },
  email: { href: `mailto:${siteConfig.email}`, Icon: IconMail, external: false },
  website: { href: siteConfig.website, Icon: IconGlobe, external: true },
  github: { href: siteConfig.github, Icon: IconGithub, external: true },
}

/**
 * Secao 06 — quem mantem o projeto.
 *
 * Cada canal e um card-clicavel inteiro (IconTile + rotulo + valor), porque o
 * valor em si (endereco, perfil) e o que o visitante quer conferir antes de
 * clicar.
 */
export function Contact() {
  const { t } = useTranslation()

  return (
    <Section
      id="contact"
      number="06"
      eyebrow={t('contact.eyebrow')}
      title={t('contact.title')}
      tone="muted"
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-5">
          <p className="text-base leading-relaxed text-ink-600">{t('contact.text')}</p>
        </Reveal>

        <Reveal className="lg:col-span-7" delay={0.08}>
          <p className="mono-label text-ink-500">{t('contact.linksLabel')}</p>

          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {CONTACT_LINKS.map((id: ContactLinkId) => {
              const { href, Icon, external } = CONTACT_ITEMS[id]

              return (
                <li key={id}>
                  <CardLink
                    href={href}
                    external={external}
                    onClick={() => trackEvent('contact_click', { channel: id })}
                    className="group h-full p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
                  >
                    <span className="flex items-center gap-3.5">
                      <IconTile>
                        <Icon className="h-5 w-5" />
                      </IconTile>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-ink-900">
                          {t(`contact.${id}`)}
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-xs text-ink-500">
                          {t(`contact.${id}Value`)}
                        </span>
                      </span>

                      {external ? (
                        <IconExternalLink className="h-4 w-4 shrink-0 text-ink-300 transition-colors group-hover:text-brand-600" />
                      ) : null}
                    </span>
                  </CardLink>
                </li>
              )
            })}
          </ul>
        </Reveal>
      </div>
    </Section>
  )
}
