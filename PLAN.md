Não publicarei na hostinger, decidi publicar como um projeto pessoal referenciado no meu portfólio que está no github pages.
Estou criando um card em "C:\MyGitHub\my-portfolio" que irá apontar para esta página.
Me ajude a publicar com o caminho https://vitorrosadev.github.io/transfertool/
Garanta que os links baixem as respectivas versões atuais disponíveis em https://github.com/VitorRosaDev/TransferToolReleases (com os critérios já estabelecidos: Clicar no botão e iniciar o download sem sair do site nem abrir o github)
Monte um plano detalhado mencionando skills necessárias e passo a passo para a publicação da página.
Não se preocupe com o card para o meu portfólio, já estou produzindo esta atualização em paralelo.

---

Tenho o contexto completo para montar o plano. Resumo do que **verifiquei** (tudo read-only):

- **Repo**: `VitorRosaDev/TransferToolLanding` — já é **público** (`private: false`), branch `main`, remote `origin`.
- **Base**: `vite.config.ts` já usa `base: './'` (relativo) → JS/CSS/fontes já saem relativos e funcionam em subpasta.
- **`dist/index.html`**: o Vite **já reescreve** favicon/apple-touch-icon/og:image/twitter:image de `/img/LOGO.png` → `./img/LOGO.png`. Porém o **JSON-LD `"image": "/img/LOGO.png"` NÃO é reescrito** (fica absoluto na raiz → quebrado em `/transfertool/`), e `og:image`/`twitter:image` relativos não servem para compartilhamento social.
- **Downloads**: `downloads.ts` já aponta para `v1.2.0` (fallback direto do asset). O botão só fica ativo com `VITE_RELEASES_READY=true`.
- **Header do asset no GitHub** (confirmei com curl): `Content-Disposition: attachment` → um link **na mesma aba** baixa o arquivo **sem navegar para lugar nenhum** (e sem abrir o GitHub). Hoje o `DownloadCard` usa `target="_blank"` + ícone de link externo (abre nova aba).
- **URL**: `https://vitorrosadev.github.io/transfertool/` é um _project site_ → o repo precisa se chamar **`transfertool`** (o nome do repo vira o caminho da URL).

---

# PLANO — Publicar em `https://vitorrosadev.github.io/transfertool/`

## Decisões propostas (me corrija se discordar)

1. **Renomear o repo** `TransferToolLanding` → **`transfertool`** (GitHub redireciona o nome antigo). Alternativa: criar um repo novo `transfertool` e fazer push.
2. **Deploy via GitHub Actions** (build + Pages), recomendado por ser "push e pronto". Alternativa: push manual do `dist/` para a branch `gh-pages`.
3. **Download na mesma aba** (remover `target="_blank"` do botão ativo), apoiado no `Content-Disposition: attachment` já confirmado — é o que cumpre à risca "sem sair do site nem abrir o GitHub".
4. Corrigir `og:image`/`twitter:image`/JSON-LD/canonical para a **URL absoluta de produção**.

## Skills mapeadas por etapa

| Etapa                         | Skills                                                                                                                                                                  |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 — Repo/Pages                | `github-automation`, `github-workflow-automation`                                                                                                                       |
| A — Código (paths + download) | `frontend-seo`, `schema-markup`, `seo-technical`, `frontend-security-coder`, `frontend-api-integration-patterns`, `typescript-expert`                                   |
| B — Workflow CI               | `github-actions-templates`, `github-actions-advanced`, `deployment-pipeline-design`, `deployment-procedures`, `cicd-automation-workflow-automate`, `secrets-management` |
| C — Validação                 | `vitest-skill`, `unit-testing-test-generate`, `testing-patterns`, `code-review-and-quality`                                                                             |

---

## ETAPA 0 — Repositório e GitHub Pages (UI, manual)

- **0.1** Renomear o repo para `transfertool` (Settings → General → Rename). Depois, localmente: `git remote set-url origin https://github.com/VitorRosaDev/transfertool.git`.
- **0.2** Habilitar Pages: Settings → Pages → **Source = "GitHub Actions"** (para a Etapa B). (Se optar por manual, "Deploy from a branch" → `gh-pages`.)
- **0.3** Garantir que `TransferToolReleases` permanece público (já é — os assets respondem 302/200).

## ETAPA A — Ajustes de código

- **A1 — `index.html`**: definir a URL absoluta de produção.
  - `og:image` e `twitter:image` → `https://vitorrosadev.github.io/transfertool/img/LOGO.png`.
  - JSON-LD `"image"` → `https://vitorrosadev.github.io/transfertool/img/LOGO.png` (hoje fica `/img/LOGO.png` e quebra).
  - Adicionar `<link rel="canonical" href="https://vitorrosadev.github.io/transfertool/" />`.
  - Remover o `TODO` de domínio (agora definido).
- **A2 — `DownloadCard.tsx`**: no **botão ativo** de download, remover `target="_blank"` e `rel="noopener noreferrer"` e trocar `IconExternalLink` por `IconDownload` → download **na mesma aba** (GitHub responde `Content-Disposition: attachment`, então o navegador baixa sem navegar). Manter o `onClick` de `trackEvent`. **Manter** `target="_blank"` no link secundário "Ver todas as releases" (intencional).
- **A3 — `DownloadCard.test.tsx`**: atualizar o teste "libera o link direto quando o artefato está publicado" (remover o assert de `rel="noopener noreferrer"`; assertar que **não** há `target`).

## ETAPA B — Workflow de deploy (GitHub Actions)

- **B1** Criar `.github/workflows/deploy.yml`:
  1. `actions/checkout`
  2. `actions/setup-node` (node 22, exigido pelo toolchain atual)
  3. `npm ci`
  4. (opcional, gate) `npm run lint` + `npm run typecheck` + `npm test`
  5. `npm run build` com `env: VITE_RELEASES_READY: "true"` (boolean, não é segredo → pode ficar direto no workflow)
  6. `actions/configure-pages` → `actions/upload-pages-artifact` (path `./dist`) → `actions/deploy-pages`
  - Permissões: `id-token: write`, `contents: read`, `pages: write`.
- **B2** (opcional) `VITE_GA_ID` como **secret** do repo para analytics pós-consentimento.
- **B3** Atualizar `README.md`: substituir "Deploy no Hostinger" por "Deploy no GitHub Pages" (steps + URL final).

## ETAPA C — Validação

1. Build local com `VITE_RELEASES_READY=true` e conferir `dist/index.html` (paths relativos/absolutos corretos).
2. Servir `dist/` sob o prefixo `/transfertool/` localmente e validar: página carrega, assets/fontes/favicon OK, seção Pesquisa presente, e o botão de download **baixa o asset direto sem navegar**.
3. `git push` e validar na URL live `https://vitorrosadev.github.io/transfertool/` (desktop + mobile).
4. Gate de qualidade: `npm run format` → `lint` → `typecheck` → `test` → `build`.

---

## Observações fixas

- Nada de `.env.local` commitado; `VITE_RELEASES_READY=true` entra só no build de CI.
- Não é preciso `404.html` (a página é single-page com navegação por âncora, sem router).
- A pasta raiz `img/LOGO.png` (duplicata) não é usada pelo build (só `public/` é copiado) — limpeza opcional.

Confirme (ou ajuste) as **4 decisões** acima e **troque para Act mode** para eu executar. Em especial: você prefere **renomear** `TransferToolLanding` → `transfertool`, ou **criar um repo novo** `transfertool`?

---

Pode fazer a limpeza opcional de img/LOGO.png mencionada no final do plano
Pode renomear o repo para transfertool
