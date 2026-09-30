import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Fontes self-hosted (subset latin: pt-BR + EN) — zero requisicoes a terceiros.
import '@fontsource/space-grotesk/latin-500.css'
import '@fontsource/space-grotesk/latin-600.css'
import '@fontsource/space-grotesk/latin-700.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/jetbrains-mono/latin-400.css'
import '@fontsource/jetbrains-mono/latin-500.css'

import './styles/index.css'
// Inicializa o i18next antes do primeiro render.
import './i18n'
import App from './App'

const container = document.getElementById('root')

if (!container) {
  throw new Error('Elemento #root nao encontrado em index.html')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
