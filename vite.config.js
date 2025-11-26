import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    open: false,
<<<<<<< HEAD
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8017',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
=======
    allowedHosts: true
>>>>>>> origin/main
  }
})
