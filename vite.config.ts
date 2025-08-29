/// <reference types="vitest"/>
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
    server: {
      deps: {
        inline: [
          '@mui/icons-material',
        ],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/scss/variables.scss" as *;`
      }
    }
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
  base: ''
});
