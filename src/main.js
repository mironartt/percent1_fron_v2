import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { initCsrf } from './services/api.js'
import { initTracking } from './utils/tracking.js'
import './assets/main.css'

initTracking()

const app = createApp(App)

app.use(createPinia())
app.use(router)

initCsrf().then(() => {
  app.mount('#app')
})
