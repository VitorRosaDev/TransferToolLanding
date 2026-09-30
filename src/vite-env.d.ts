/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Measurement ID do GA4 (ex.: G-XXXXXXXXXX). Sem valor => nenhum script de terceiros e carregado. */
  readonly VITE_GA_ID?: string
  /** 'true' habilita os botoes de download apontando para as releases publicadas. */
  readonly VITE_RELEASES_READY?: string
  /** URL direta do instalador do TransferTool RPA (Desktop). */
  readonly VITE_DESKTOP_DOWNLOAD_URL?: string
  /** URL direta do APK do TransferTool Mobile. */
  readonly VITE_MOBILE_DOWNLOAD_URL?: string
  /** URL publica do repositorio que hospeda os assets de release. */
  readonly VITE_RELEASES_PAGE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
