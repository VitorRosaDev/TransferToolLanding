import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Configuracao de testes isolada do build (sem o plugin do Tailwind).
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
    restoreMocks: true,
  },
})
