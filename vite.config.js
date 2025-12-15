import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'

const localSettingsPath = path.resolve(__dirname, './src/config/local_settings.js')

function readLocalSetting(settingName) {
  if (fs.existsSync(localSettingsPath)) {
    const content = fs.readFileSync(localSettingsPath, 'utf-8')
    const regex = new RegExp(`export\\s+const\\s+${settingName}\\s*=\\s*['"]([^'"]+)['"]`)
    const match = content.match(regex)
    if (match) {
      return match[1]
    }
  }
  return null
}

function readLocalSettingNumber(settingName) {
  if (fs.existsSync(localSettingsPath)) {
    const content = fs.readFileSync(localSettingsPath, 'utf-8')
    const regex = new RegExp(`export\\s+const\\s+${settingName}\\s*=\\s*(\\d+)`)
    const match = content.match(regex)
    if (match) {
      return parseInt(match[1], 10)
    }
  }
  return null
}

function getProxyTarget() {
  const localTarget = readLocalSetting('VITE_PROXY_TARGET')
  if (localTarget) {
    console.log('[Vite] Proxy target from local_settings.js:', localTarget)
    return localTarget
  }
  
  const envTarget = process.env.VITE_API_BACKEND_URL
  if (envTarget) {
    console.log('[Vite] Proxy target from env:', envTarget)
    return envTarget
  }
  
  console.log('[Vite] Proxy target: localhost (default)')
  return 'http://127.0.0.1:8017'
}

function getHmrConfig() {
  const hmrHost = readLocalSetting('VITE_HMR_HOST')
  const hmrProtocol = readLocalSetting('VITE_HMR_PROTOCOL')
  const hmrPort = readLocalSettingNumber('VITE_HMR_CLIENT_PORT')
  
  if (hmrHost || hmrProtocol || hmrPort) {
    const hmrConfig = {}
    
    if (hmrHost) {
      hmrConfig.host = hmrHost
      console.log('[Vite] HMR host from local_settings.js:', hmrHost)
    }
    if (hmrProtocol) {
      hmrConfig.protocol = hmrProtocol
      console.log('[Vite] HMR protocol from local_settings.js:', hmrProtocol)
    }
    if (hmrPort) {
      hmrConfig.clientPort = hmrPort
      console.log('[Vite] HMR clientPort from local_settings.js:', hmrPort)
    }
    
    return hmrConfig
  }
  
  return undefined
}

const API_BACKEND_URL = getProxyTarget()
const hmrConfig = getHmrConfig()

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
    hmr: hmrConfig,
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
