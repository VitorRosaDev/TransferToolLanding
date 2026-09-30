Eu tenho uma ideia, mas não sei todos os termos técnicos dela. 
O site carrega.
eu rolo para baixo.
O texto dentro do hero recua (`copyY = -60px`) e desbota (`copyOpacity`) no scroll, com uma gradiente `from-transparent to-surface` dissolvendo o `void-950` no branco. 
Quero que isso ainda aconteça, mas, quando eu rolar para baixo, a section hero inteira fica parada. a section seguinte deve se sobrepor de baixo para cima. como se eu pusesse uma folha em cima da outra sobre a mesa. Vamos desenvolver esta transição, pois eu gostaria que fosse o padrão de transição entre todas as sessões da página e que elas alternem entre o padrão claro e escuro.
O `Navbar` deve trocar de pele conforme a linha da próxima section o atravessa.

Você descreveu exatamente o que tecnicamente se chama "sticky stacking" (seções que se empilham como folhas), generalizado como padrão e com alternância claro/escuro. Mapeei a estrutura atual inteira. Antes de abrir qualquer arquivo, aqui está o plano.

Traduzindo sua ideia para os termos técnicos
O que você disse	Termo técnico
"a section hero inteira fica parada"	position: sticky; top: 0 (a seção "gruda" no topo da janela enquanto o resto rola)
"a section seguinte se sobrepõe de baixo para cima"	cover: a próxima seção, opaca e com z-index maior, desliza por cima
"folha em cima da outra"	cada seção vira uma "folha" (sheet) com fundo sólido — já todas têm fundo opaco
"alternem entre claro e escuro"	cada seção ganha um tone (light/dark) declarado numa fonte única
"Navbar troca de pele conforme a linha da próxima section o atravessa"	a navbar passa a ler o tone da seção que está na "linha" do cabeçalho (a borda entre duas folhas), em vez do threshold fixo atual
Estado atual (o que já temos e o que mudaria)
Composição (App.tsx): Hero (escuro bg-void-950) + 6 seções via <Section>: overview(branco), howItWorks(muted), downloads(branco), privacy(muted), faq(branco), contact(muted) → Footer + CookieBanner.
Section.tsx: só tem tone: 'default' | 'muted' (ambas claras). Todo texto/card usa text-ink-*/bg-surface/border-ink-200 — ou seja, não existe tom escuro além do hero.
Navbar.tsx: troca de pele num threshold único sobre o hero (HERO_HANDOVER = 0.5). Não sabe de "linha entre seções".
Hero.tsx: já tem o recuo/desbotamento (copyY/copyOpacity) que você quer manter, e o degradê from-transparent to-surface que perguntou antes.
A feature anterior de pin/cover que eu reverti usava .hero-pin-spacer/.hero-cover-pull + fitsOneScreen — era específica do hero; agora a ideia é generalizar e limpar isso.
Arquitetura proposta (como ficaria)
Fonte única de ordem + tom — src/config/sections.ts:


{ id: 'inicio',     tone: 'dark'  },
{ id: 'overview',   tone: 'light' },
{ id: 'howItWorks', tone: 'dark'  },
{ id: 'downloads',  tone: 'light' },
{ id: 'privacy',    tone: 'dark'  },
{ id: 'faq',        tone: 'light' },
{ id: 'contact',    tone: 'dark'  },
App.tsx, o wrapper de empilhamento e a navbar leem da mesma lista (sem duplicar).

Wrapper reutilizável Stack (src/components/ui/Stack.tsx) que substitui a <Section> na hora de montar cada folha:

aplica sticky top-0 + z-index crescente + fundo opaco por tom;
gate de ajuste: só "prende" quando a folha cabe na tela (medição via ResizeObserver + matchMedia/innerHeight); folha mais alta rola normal (graceful) — reaproveita a ideia do fitsOneScreen, mas sem spacer/margem negativa (o sticky puro já faz o cover).
Tom escuro no design system (Section.tsx, Card.tsx, tokens no index.css):

Section ganha tone: 'default' | 'muted' | 'dark' (ou theme), com título text-white, subtítulo text-white/70, filete border-white/10, número text-brand-400;
novos tokens: superfície escura (reusar --color-void-800/900), borda white/10, textos white/*;
reestilo dos filhos: Card/CardLink/IconTile, DownloadCard, grade de Privacy, timeline de HowItWorks, acordeão de Faq, cards de Contact, botão secondary. É a maior parte do trabalho.
Navbar por "linha" — src/lib/useSectionTheme.ts (ou dentro de sections.ts):

um IntersectionObserver com rootMargin calibrado na altura do cabeçalho (~72px), observando a borda de cada seção; a seção cuja linha está no cabeçalho define o tom;
navbar mapeia tom → pele: sobre dark = transparente + texto branco (como no hero hoje); sobre light = branco/85 + texto ink. Troca no instante em que a linha da próxima folha atravessa o cabeçalho, como você pediu.
Hero mantém o fade interno; o "ficar parado + ser coberto" passa a vir do Stack (a lógica própria de pin do hero continua fora dele).

Fases (para ficar verificável a cada passo)
F1 — Mecânica genérica: Stack + sections.ts + navbar por tom, primeiro só com hero→overview como prova (todos os tons ainda claros, só o hero escuro). Valida screenshot desktop/mobile.
F2 — Alternância de tons: aplicar o mapa claro/escuro completo e o restyle dark de Section + cards/tiles/timeline/faq/contact.
F3 — Acabamento: borda/arredondamento de "folha" (se quiser o efeito de papel: topo levemente arredondado + sombra para cima), prefers-reduced-motion desligando o pin, e testes (useSectionTheme, gate de ajuste, navbar) + lint/prettier/typecheck/build verdes.
Riscos / pontos que quero alinhar antes
Seções altas (HowItWorks/Downloads/Privacy/Faq/Contact são longas, sobretudo no mobile) — é a decisão que muda a mecânica (pergunta abaixo).
Footer/CookieBanner: proponho deixar fora do empilhamento (footer não é "folha"; banner é fixo). Se quiser incluir, aviso.
Sombra/arredondamento da folha: opcional, dá o "papel sobre a mesa" literal. Posso incluir em F3 ou deixar a emenda limpa (sem borda visível), como hoje.
Esforço do restyle dark: é mecânico mas extenso (7 componentes + tokens). Não muda nenhum texto/conteúdo, só cores.
A decisão mais importante é como tratar seções mais altas que a tela:

Quando uma seção for mais alta que a janela (HowItWorks, Downloads, FAQ…), o que deve acontecer?

Riscos
1. Seções altas: Elas devem rolar normalmente. No final elas travam e a próxima passa a subir. Para algumas, estou planejando rolagem lateral (da direita para a esquerda. mas isso é futuro.
2. Footer/CookieBanner: Pode tirar a sessão de Contato e o footer deve conter © 2026 Vitor Rosa - All rights reserved. seguido inline de ícones sóbrios do linkedin, github, email e portfólio, pode tirar "Feito com React, Vite e Tailwind CSS · Fontes self-hosted" e "voltar ao topo.
3. Emenda limpa
4. Por enquanto, apenas cores, mas com ambiente preparado para receber backgrounds dinâmicos como o hero.
5. Quero que o cubo permaneça soberano sobre todas as sections, e que o texto fique alinhado à esquerda, como em hero.
6. Para responsividade mobile web, o cubo é a primeira coisa a aparecer, (gostaria de interatividade com o giroscópio do telefone) e o h1, seguido de sua estrutura semântica rolam para cima até chegar no final e travar. E assim sucessivamente para as demais sections.
Faremos refinamento de responsividade mobile no futuro.
Invoque todas as skills necessárias para refinar o padrão de projeto e executar com profissionalismo. Se necessário quebre em tarefas menores para que a qualidade seja preservada

Perfeito — capturei tudo. Antes de qualquer linha de código, dois registros importantes: __(1)__ continuo em __modo de planejamento__ (não posso editar/executar até você ativar o modo Act), e __(2)__ sua resposta nº 5 mudou a arquitetura de forma decisiva, então preciso fechar isso com você antes de quebrar em tarefas.

## O que ficou registrado das suas respostas

1. __Seções altas__ → rolam normalmente; __no final travam__ e a próxima sobe por cima (rolagem lateral para algumas é futuro).
2. __Footer/CookieBanner__ → __remover a seção Contato__; footer vira `© 2026 Vitor Rosa - All rights reserved.` + 4 ícones sóbrios inline (LinkedIn, GitHub, e-mail, portfólio). Sair __"Feito com React/Vite/Tailwind"__ e __"voltar ao topo"__.
3. __Emenda limpa__ → sem borda/arredondamento de "folha".
4. __Tons__ → por ora só __cores__, mas o sistema de seção deve ter um __slot de fundo__ pronto para backgrounds dinâmicos (tipo o hero).
5. __Cubo soberano__ sobre todas as seções + __texto alinhado à esquerda__ (como no hero).
6. __Mobile__ → cubo primeiro, depois `h1`, e a estrutura semântica rola/trava; giroscópio e refinamento mobile = futuro.

## O ponto que muda a arquitetura (preciso fechar)

Hoje as seções são __folhas opacas__ (branca/muted/preta). Se o __cubo fica soberano__ — ou seja, sempre visível, acima de tudo — isso conflita com "folha opaca sobe e cobre a anterior", porque uma folha opaca __cobriria o cubo também__. São três leituras possíveis:

- __(A)__ Cubo vira uma __cena fixa global__ (sempre à frente/visível); as seções deixam de ser folhas opacas e viram __painéis de texto à esquerda__ que deslizam/travam sobre essa cena. É o design mais forte, mas é outro produto (não é mais "empilhar folhas").
- __(B)__ Cubo fica __só no hero__ (como hoje); as demais seções empilham como folhas opacas (o plano anterior).
- __(C)__ __Híbrido__: cubo fixo numa coluna reservada (desktop à direita / mobile no topo), e as __folhas opacas empilham apenas na coluna do texto__.

## Quebra em tarefas (ordem proposta — a F4 depende da resposta acima)

- __T1 — Fundação/design tokens__: `src/config/sections.ts` (ordem + tom + slot de fundo), tom `dark` no `Section.tsx`, tokens escuros em `index.css`.
- __T2 — Transição de empilhamento genérica__: componente `Stack` (sticky + `z-index` + gate de "cabe na tela" + __travamento no fim__ para seções altas).
- __T3 — Navbar por "linha"__: hook `useSectionTheme` (IntersectionObserver na borda de cada seção, calibrado na altura do cabeçalho) + mapa de peles claro/escuro.
- __T4 — Cubo e layout__ (resposta da pergunta abaixo): hero + persistência do cubo + alinhamento à esquerda + ordem mobile (cubo → h1 → resto).
- __T5 — Restyle escuro__: `Section`, `Card`/`IconTile`/`CardLink`, `DownloadCard`, grade de `Privacy`, timeline de `HowItWorks`, acordeão de `Faq`, botão `secondary`.
- __T6 — Footer/Nav simplificados__: remover `Contact` + `SECTION_IDS`/`NAV_LABEL_KEY`, novo footer (© + ícones), i18n (chaves novas/removidas).
- __T7 — Qualidade__: testes (`useSectionTheme`, gate/travamento, navbar), `prettier`/`lint`/`typecheck`/`build` verdes e validação em browser (desktop + mobile), como na reversão.

Antes de eu abrir qualquer arquivo, preciso da sua decisão sobre o cubo:

Como o cubo 3D deve se comportar em relação às seções? (é o que define toda a arquitetura)

Plan

Fechado: (B) — cubo só no hero; as demais seções empilham como folhas opacas, texto alinhado à esquerda. Com isso a arquitetura está definida. Segue o plano final (modo de planejamento — nada editado ainda).

Plano final
Mapa de seções e tons (fonte única src/config/sections.ts): inicio(dark) → overview(light) → howItWorks(dark) → downloads(light) → privacy(dark) → faq(light). contact é removido (vira o footer).

Mecânica: cada folha = sticky top-0 + z-index crescente + fundo opaco por tom. Seção curta (cabe na tela) → prende e a próxima sobe por cima. Seção alta → rola normal e trava no fim para a próxima subir (vou prototipar esse "travar no fim" e validar visualmente). prefers-reduced-motion desliga o pin. Sem borda/arredondamento (emenda limpa).

Navbar: useSectionTheme (IntersectionObserver na borda de cada seção, calibrado na altura do cabeçalho) — troca de pele no instante em que a linha da próxima folha cruza o cabeçalho: sobre dark = transparente + texto branco; sobre light = branco/85 + texto ink.

Tons: só cores por ora, mas Section ganha um slot de fundo (background?: ReactNode) para receber depois cenas dinâmicas (tipo o ShapeGrid/cubo do hero).

Hero: mantém copyY/copyOpacity e o degradê from-transparent to-surface; o pin/cover passa a vir do Stack genérico (nada de lógica de pin dentro dele). Mobile: cubo primeiro, depois h1 (reordenação da coluna empilhada).

Tarefas (ordem de execução)
#	Tarefa	Critério de aceite
T1	sections.ts + tom dark no Section + slot de fundo + tokens escuros em index.css	Section renderiza dark com título text-white, filete border-white/10, número text-brand-400
T2	Componente Stack (sticky + z + gate "cabe na tela" + travamento no fim)	hero→overview cobrindo sem artefato; seção alta rolando e travando no fim
T3	useSectionTheme + Navbar por linha de seção	navbar troca de pele exatamente quando a borda cruza o cabeçalho
T4	Hero: cubo no hero, mobile cubo-primeiro, manter fade/degradê	desktop: texto à esquerda + cubo à direita; mobile: cubo → h1 → resto
T5	Restyle escuro (Section, Card/IconTile/CardLink, DownloadCard, Privacy, HowItWorks, Faq, secondary)	todas as folhas dark legíveis, contraste ok
T6	Remover Contact (+ SECTION_IDS/NAV_LABEL_KEY/chaves i18n) e novo footer (© 2026 Vitor Rosa - All rights reserved. + 4 ícones inline)	nav/footer sem "contato"; sem "Feito com…" e sem "voltar ao topo"
T7	Testes (useSectionTheme, Stack gate/trava, navbar) + prettier/lint/typecheck/build + validação em browser (desktop/mobile)	suíte verde e screenshots conferidos
Decisões que vou assumir (me corrija se discordar)
Footer exato: © 2026 Vitor Rosa - All rights reserved. seguido inline de LinkedIn, GitHub, e-mail, portfólio (ícones IconLinkedin/IconGithub/IconMail/IconGlobe, já existentes), com aria-label via i18n. O footer.rights passa a carregar essa frase (nome fixo, ano dinâmico ou fixo 2026 — direi na hora).
Contato sai por completo (arquivo, link de nav, chaves contact.*, CONTACT_LINKS); a info de contato fica só nos ícones do footer.
Giroscópio e rolagem lateral de seções ficam no backlog (você marcou como futuro); o "travar no fim" mobile também será refinado depois — nesta etapa entrego a ordem cubo-primeiro e a mecânica desktop/short-section.
Paridade de i18n (pt-BR/en, 177 chaves → novo total) mantida.
Estou pronto para executar. Ative o modo Act (toggle Plan/Act) que eu começo pela T1 e vou validando cada tarefa com o gate de qualidade e screenshots — invocando, quando chegar na execução, as skills de design system, motion/scroll e testes.