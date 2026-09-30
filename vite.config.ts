import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Base relativa: funciona tanto na raiz do dominio quanto em subpasta
  // (a landing e single-page, sem router, entao paths relativos sao seguros).
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2022',
  },
})
