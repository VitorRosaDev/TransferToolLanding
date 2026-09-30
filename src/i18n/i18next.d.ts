import 'react-i18next'

import type ptBR from './locales/pt-BR.json'

// Tipagem estrita das chaves de traducao: `t('hero.titleLine1')` ganha autocompletar.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: {
      translation: typeof ptBR
    }
  }
}
