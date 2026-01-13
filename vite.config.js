import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Sitemap from 'vite-plugin-sitemap'
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

const SITEMAP_HOSTNAME = readLocalSetting('SITEMAP_HOSTNAME') || 'https://percent1.ru'

const catalogCategories = [
  { slug: 'welfare', subcategories: ['savings', 'investments', 'income', 'debts'] },
  { slug: 'health_sport', subcategories: ['fitness', 'nutrition', 'sleep', 'mental'] },
  { slug: 'work', subcategories: ['skills', 'career-growth', 'business', 'education'] },
  { slug: 'family', subcategories: ['partner', 'children', 'parents', 'friends'] },
  { slug: 'hobby', subcategories: ['creativity', 'music', 'languages', 'sports-hobby'] },
  { slug: 'environment', subcategories: ['networking', 'communication', 'community', 'social-skills'] }
]

const catalogGoalsRoutes = catalogCategories.flatMap(cat => [
  `/catalog/goals/${cat.slug}`,
  ...cat.subcategories.map(sub => `/catalog/goals/${cat.slug}/${sub}`)
])

const catalogHabitsRoutes = catalogCategories.map(cat => `/catalog/habits/${cat.slug}`)

const publicRoutes = [
  '/land/old_v5',
  '/land/old_v1',
  '/land/newyear',
  '/land/newyear/test',
  '/land/version2',
  '/land/version3',
  '/land/version4',
  '/land/version6',
  '/catalog',
  '/catalog/goals',
  '/catalog/habits',
  '/catalog/bundles',
  ...catalogGoalsRoutes,
  ...catalogHabitsRoutes,
  '/auth/login',
  '/auth/register',
  '/auth/recovery',
  '/privacy',
  '/termspolicy',
  '/disclaimer'
]

export default defineConfig({
  plugins: [
    vue(),
    Sitemap({
      hostname: SITEMAP_HOSTNAME,
      dynamicRoutes: publicRoutes,
      exclude: [
        '/app/*',
        '/onboarding',
        '/auth/logout',
        '/ref/*',
        '/land/version7',
        '/login',
        '/register',
        '/ssp',
        '/goals',
        '/goals/*',
        '/goals-bank',
        '/planner',
        '/planning',
        '/settings',
        '/club',
        '/billing/*'
      ],
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date(),
      readable: true
    })
  ],
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
