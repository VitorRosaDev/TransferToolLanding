# TransferTool — Landing Page

Página única (SPA) que apresenta o **TransferTool** (coleta offline-first no celular + automação RPA no desktop para transferências de almoxarifado) e funciona como **hub de downloads** das duas aplicações.

Bilíngue (pt-BR / EN), estática, sem backend. Publicada como arquivos estáticos.

---

## Stack

| Camada    | Escolha                                                             |
| :-------- | :------------------------------------------------------------------ |
| Build     | Vite 8 + TypeScript (strict)                                        |
| UI        | React 19 + Tailwind CSS v4 (`@theme` como design system)            |
| Animação  | Framer Motion (`whileInView`, respeitando `prefers-reduced-motion`) |
| i18n      | react-i18next + i18next (pt-BR padrão, EN alternativo)              |
| Fontes    | `@fontsource` self-hosted — Space Grotesk (títulos) e Inter (texto) |
| QR Code   | `qrcode.react` (renderizado localmente, sem API externa)            |
| Testes    | Vitest + Testing Library (jsdom)                                    |
| Qualidade | ESLint (flat config) + Prettier                                     |

> **Sem requisições a terceiros por padrão.** Fontes, QR Code e ícones (SVG inline) são locais. O único recurso externo possível é o Google Analytics, e só depois de consentimento explícito.

---

## Requisitos

- Node.js 20+ (validado em Node 26)
- npm 10+

## Scripts

```bash
npm install        # instala dependências
npm run dev        # servidor de desenvolvimento (http://localhost:5173)
npm run build      # build de produção em ./dist
npm run preview    # serve o ./dist localmente
npm run typecheck  # tsc --noEmit
npm test           # Vitest (execução única)
npm run test:watch # Vitest em watch
npm run lint       # ESLint
npm run format     # Prettier --write
```

---

## Variáveis de ambiente

Copie `.env.example` para `.env.local` (não versionado) e preencha. Todas são **opcionais** — sem elas a página funciona em modo seguro.

| Variável                    | Padrão sem valor                       | Para que serve                                                                      |
| :-------------------------- | :------------------------------------- | :---------------------------------------------------------------------------------- |
| `VITE_GA_ID`                | vazio → **nenhum script de terceiros** | Measurement ID do GA4 (`G-XXXXXXXXXX`). Sem ele, a camada de analytics fica inerte. |
| `VITE_RELEASES_READY`       | `false` → cards "em preparação"        | Mude para `true` quando os instaladores estiverem publicados.                       |
| `VITE_RELEASES_PAGE_URL`    | repositório público de releases        | Página usada no QR Code do APK e como fallback.                                     |
| `VITE_DESKTOP_DOWNLOAD_URL` | asset `v1.1.0` no repo de releases     | URL direta do `TransferToolRPA-Setup-1.1.0.exe`.                                    |
| `VITE_MOBILE_DOWNLOAD_URL`  | asset `v1.1.1` no repo de releases     | URL direta do `TransferTool-1.1.1.apk`.                                             |

### Ativar os downloads (passo a passo)

1. Publique os binários no repositório **público** de releases (ver `ECOSYSTEM_CONTEXT.md`).
2. No `.env.local` (ou no build do Hostinger), ajuste as URLs e defina:
   ```
   VITE_RELEASES_READY=true
   ```
3. Rode `npm run build` novamente. Os botões passam de "Indisponível no momento" para link direto de download, e cada clique dispara o evento `download_started` (apenas com consentimento).

---

## Estrutura

```
src/
├── assets/logo.png                  # logo usado nos componentes (importado e hasheado)
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx               # header fixo, menu mobile, pele por folha
│   │   ├── LanguageToggle.tsx       # PT/EN com aria-pressed
│   │   ├── CookieBanner.tsx         # consentimento LGPD
│   │   └── Footer.tsx               # assinatura + canais em ícones
│   ├── sections/
│   │   ├── Hero.tsx                 # folha inicial: cubo 3D, datilografia, recuo no scroll
│   │   ├── Overview.tsx + OverviewProducts.tsx
│   │   ├── HowItWorks.tsx           # timeline de 5 passos desenhada pelo scroll
│   │   ├── Downloads.tsx + DownloadCard.tsx
│   │   └── Privacy.tsx · Faq.tsx
│   └── ui/                          # Stack (folha), Section, Card, Button, Reveal, ShapeGrid, icons
├── config/
│   ├── sections.ts                  # fonte única: ordem, tom, pele e rótulos das folhas
│   ├── site.ts                      # links do autor
│   └── downloads.ts                 # artefatos, versões, URLs, flag de disponibilidade
├── i18n/
│   ├── index.ts                     # detecção de idioma + metadados do documento
│   ├── i18next.d.ts                 # tipagem estrita das chaves
│   └── locales/{pt-BR,en}.json      # 146 chaves, paridade 1:1
├── lib/
│   ├── analytics.ts                 # GA4 + Consent Mode v2 (única porta de saída)
│   ├── useSectionTheme.ts           # tom da folha que atravessa o cabeçalho
│   └── sheetTone.ts                 # contexto de tom + superfícies das folhas
├── styles/index.css                 # tokens @theme, tons das folhas, base
└── test/                            # setup + 12 arquivos de teste (70 casos)
public/img/LOGO.png                  # favicon / imagem de compartilhamento
index.html                           # meta tags, OG, JSON-LD, <html lang>
```

---

## Capturas de tela da seção "Como funciona"

A timeline de 5 passos exibe um quadro reservado com a cor da plataforma enquanto não houver imagens. Para publicar as capturas reais:

1. Salve os arquivos em `src/assets/steps/` (ex.: `montar.png`, `fechar.png`, `exportar.png`, `importar.png`, `automatizar.png`).
2. Edite `src/components/sections/howItWorksSteps.ts` e preencha o mapa `STEP_SCREENSHOT`:
   ```ts
   import montar from '../../assets/steps/montar.png'
   // ...
   export const STEP_SCREENSHOT: Partial<Record<StepKey, string>> = {
     montar,
     fechar,
     // ...
   }
   ```
3. Rode `npm run build`. O quadro reservado é substituído pela imagem automaticamente, com `alt` derivado do título do passo.

Recomendação: proporção **16:9** (o quadro é `aspect-video`) e largura entre 1280 e 1920 px.

---

## Deploy no Hostinger (hPanel)

1. Rode `npm run build` com as variáveis de produção definidas.
2. Acesse **hPanel → Websites → Gerenciador de arquivos** (ou use FTP) e envie **todo o conteúdo** de `dist/` para `public_html/` (ou a subpasta desejada).
3. Confirme que `index.html`, `assets/` e `img/` chegaram na raiz do destino.

Notas importantes:

- O build usa `base: './'` (caminhos relativos), então **funciona tanto na raiz do domínio quanto em subpasta**, sem reconfiguração.
- A página é single-page com navegação por âncora: **não é necessário** `.htaccess` com regra de rewrite.
- Nenhum binário grande é enviado ao Hostinger — os instaladores ficam no repositório de releases do GitHub.
- Após o primeiro deploy, ative HTTPS (SSL gratuito do hPanel) e revisite os TODOs de SEO abaixo.

### TODOs de SEO pós-domínio

Em `index.html`, substituir pelos valores absolutos do domínio final:

- `og:image` e `twitter:image` (hoje relativos, funcionam no preview mas não em compartilhamento social).
- O campo `"image"` do JSON-LD.
- Opcional: adicionar `<link rel="canonical">`.

---

## Privacidade e analytics

- `src/lib/analytics.ts` é a **única** porta de saída de dados da página.
- Sem `VITE_GA_ID`, o módulo é no-op: nenhum script, nenhum cookie, nenhuma requisição externa (validado em navegador: 0 scripts externos).
- Com `VITE_GA_ID`, o `gtag.js` só é injetado **depois** do clique em "Aceitar", com Consent Mode v2 na ordem `consent:default` → `js` → `config` e `anonymize_ip: true`.
- A escolha fica em `localStorage` (`transfertool.analytics-consent`) e pode ser revista a qualquer momento pelo link "Preferências de cookies" no rodapé (e pelo botão na seção Privacidade).
- Eventos enviados: `consent_granted`, `download_started`, `faq_opened`, `language_changed`.

---

## Testes

```bash
npm test
```

26 casos cobrindo: `analytics` (consentimento, injeção do script, filtragem de eventos), `LanguageToggle` (troca, persistência, `<html lang>`), `CookieBanner` (estados, recusa, reabertura), `DownloadCard` (estado "em preparação", link liberado, QR Code) e `Faq` (acordeão acessível).
