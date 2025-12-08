import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'

// Читаем VITE_PROXY_TARGET из local_settings.js
function getProxyTarget() {
  const localSettingsPath = path.resolve(__dirname, './src/config/local_settings.js')
  
  if (fs.existsSync(localSettingsPath)) {
    const content = fs.readFileSync(localSettingsPath, 'utf-8')
    const match = content.match(/export\s+const\s+VITE_PROXY_TARGET\s*=\s*['"]([^'"]+)['"]/)
    if (match) {
      console.log('[Vite] Proxy target from local_settings.js:', match[1])
      return match[1]
    }
  }
  
  // Fallback на переменную окружения или localhost
  const envTarget = process.env.VITE_API_BACKEND_URL
  if (envTarget) {
    console.log('[Vite] Proxy target from env:', envTarget)
    return envTarget
  }
  
  console.log('[Vite] Proxy target: localhost (default)')
  return 'http://127.0.0.1:8017'
}

const API_BACKEND_URL = getProxyTarget()

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
