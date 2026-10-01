export type DownloadPlatform = 'desktop' | 'mobile'

export interface DownloadArtifact {
  id: DownloadPlatform
  /** Nome do arquivo publicado como asset de release. */
  fileName: string
  version: string
  /** Tamanho exibido no card (valor do artefato publicado). */
  size: string
  /** URL direta do asset no repositorio publico de releases. */
  url: string
  /** Falso enquanto o artefato nao estiver publicado => card em estado "em preparacao". */
  available: boolean
}

const FALLBACK_DESKTOP_URL =
  'https://github.com/VitorRosaDev/TransferToolReleases/releases/download/v1.2.0/TransferToolRPA-Setup-1.2.0.exe'

const FALLBACK_MOBILE_URL =
  'https://github.com/VitorRosaDev/TransferToolReleases/releases/download/v1.2.0/TransferTool-1.2.0.apk'

/** Pagina publica que lista todas as releases (usada no QR Code e como fallback). */
export const RELEASES_PAGE_URL =
  import.meta.env.VITE_RELEASES_PAGE_URL?.trim() ||
  'https://github.com/VitorRosaDev/TransferToolReleases/releases'

/**
 * Enquanto o repositorio publico de releases nao existir, os cards ficam em
 * "em preparacao". Basta definir VITE_RELEASES_READY=true no build para ativar.
 */
const releasesReady = import.meta.env.VITE_RELEASES_READY === 'true'

export const desktopRelease: DownloadArtifact = {
  id: 'desktop',
  fileName: 'TransferToolRPA-Setup-1.2.0.exe',
  version: '1.2.0',
  size: '164 MB',
  url: import.meta.env.VITE_DESKTOP_DOWNLOAD_URL?.trim() || FALLBACK_DESKTOP_URL,
  available: releasesReady,
}

export const mobileRelease: DownloadArtifact = {
  id: 'mobile',
  fileName: 'TransferTool-1.2.0.apk',
  version: '1.2.0',
  size: '96 MB',
  url: import.meta.env.VITE_MOBILE_DOWNLOAD_URL?.trim() || FALLBACK_MOBILE_URL,
  available: releasesReady,
}

/** Ordem de exibicao: o aplicativo movel e o ponto de entrada do fluxo. */
export const downloadArtifacts: readonly DownloadArtifact[] = [mobileRelease, desktopRelease]
