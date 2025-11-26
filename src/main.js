import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { initCsrf } from './services/api.js'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Инициализируем CSRF токен при загрузке приложения
initCsrf().then(() => {
  app.mount('#app')
})
