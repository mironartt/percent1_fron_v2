import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// Определяем бэкенд URL из переменной окружения или используем дефолт
const API_BACKEND_URL = process.env.VITE_API_BACKEND_URL || 'http://127.0.0.1:8017'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './attached_assets'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    open: false,
    allowedHosts: true,
    proxy: {
      '/api/ai': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: API_BACKEND_URL,
        changeOrigin: true,
        secure: true,
        cookieDomainRewrite: '',
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
