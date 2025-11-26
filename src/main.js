import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
<<<<<<< HEAD
import { initCsrf } from './services/api.js'
=======
>>>>>>> origin/main
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

<<<<<<< HEAD
// Инициализируем CSRF токен при загрузке приложения
initCsrf().then(() => {
  app.mount('#app')
})
=======
app.mount('#app')
>>>>>>> origin/main
