import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import apiService from './services/api'

// Инициализация приложения
async function initApp() {
  // Получаем CSRF токен перед запуском приложения
  await apiService.fetchCsrfToken()

  const app = createApp(App)

  app.use(createPinia())
  app.use(router)

  app.mount('#app')
}

// Запускаем приложение
initApp()
