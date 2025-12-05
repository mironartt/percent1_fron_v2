<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1 class="login-logo">OnePercent</h1>
          <p class="login-subtitle">+1% каждый день к лучшей жизни</p>
          <h2>Добро пожаловать назад</h2>
          <p class="login-description">Войдите в свой аккаунт, чтобы продолжить</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email" class="form-label">
              <span class="label-text">Email адрес</span>
            </label>
            <div class="input-wrapper">
              <span class="input-icon">
                <Mail :size="18" />
              </span>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="form-input"
                placeholder="your@email.com"
                required
                :disabled="isSubmitting"
                @blur="validateField('email')"
              />
            </div>
            <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">
              <span class="label-text">Пароль</span>
            </label>
            <div class="input-wrapper">
              <span class="input-icon">
                <Lock :size="18" />
              </span>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="Введите пароль"
                required
                :disabled="isSubmitting"
                @blur="validateField('password')"
              />
              <button
                type="button"
                class="btn-toggle-password"
                @click="showPassword = !showPassword"
                :title="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
              >
                <Eye v-if="showPassword" :size="18" />
                <EyeOff v-else :size="18" />
              </button>
            </div>
            <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input
                v-model="form.rememberMe"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-text">Запомнить меня</span>
            </label>
            <router-link to="/auth/recovery" class="forgot-link">Забыли пароль?</router-link>
          </div>

          <div v-if="apiError" class="api-error">
            <div class="api-error-message">{{ apiError }}</div>
            <div v-if="apiErrorDetail" class="api-error-detail">{{ apiErrorDetail }}</div>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-lg login-submit"
            :disabled="isSubmitting"
          >
            <span v-if="!isSubmitting">Войти</span>
            <span v-else>Загрузка...</span>
          </button>
        </form>

        <div class="divider">
          <span>или</span>
        </div>


        <div class="social-login single">
          <button 
            type="button" 
            class="btn-social telegram" 
            :disabled="isTelegramLoading"
            @click="handleTelegramLogin"
          >
            <span v-if="isTelegramLoading" class="social-icon">...</span>
            <span v-else class="social-icon telegram-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </span>
            <span>{{ isTelegramLoading ? 'Загрузка...' : 'Войти через Telegram' }}</span>

          </button>
        </div>

        <div class="login-footer">
          <p>
            Нет аккаунта?
            <router-link to="/auth/register" class="link">Зарегистрируйтесь здесь</router-link>
          </p>
        </div>
      </div>

      <div class="login-benefits">
        <div class="benefits-header">
          <h3>Почему выбирают OnePercent</h3>
        </div>
        <div class="benefits-list">
          <div class="benefit-item">
            <span class="icon-wrapper icon-wrapper-md">
              <Rocket :size="24" />
            </span>
            <div>
              <h4>Простая система</h4>
              <p>Начните улучшать жизнь за 5 минут</p>
            </div>
          </div>
          <div class="benefit-item">
            <span class="icon-wrapper icon-wrapper-md">
              <TrendingUp :size="24" />
            </span>
            <div>
              <h4>Видимый прогресс</h4>
              <p>Отслеживайте свой рост день за днём</p>
            </div>
          </div>
          <div class="benefit-item">
            <span class="icon-wrapper icon-wrapper-md">
              <Target :size="24" />
            </span>
            <div>
              <h4>Достижение целей</h4>
              <p>Управляйте всеми сферами жизни</p>
            </div>
          </div>
          <div class="benefit-item">
            <span class="icon-wrapper icon-wrapper-md">
              <Users :size="24" />
            </span>
            <div>
              <h4>Поддержка сообщества</h4>
              <p>Вместе достигать больше</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="showSuccess" class="modal-overlay" @click="closeSuccess">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <span class="icon-wrapper icon-wrapper-lg success">
              <CheckCircle2 :size="48" />
            </span>
            <h2>Успешный вход!</h2>
          </div>
          <div class="modal-body">
            <p>Вы успешно вошли в систему. Сейчас вас перенаправит в личный кабинет.</p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import api from '@/services/api.js'
import { resetAuthCache } from '@/router/index.js'
import { 
  Mail, Lock, Eye, EyeOff, Rocket, TrendingUp, 
  Target, Users, CheckCircle2 
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const store = useAppStore()

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const errors = reactive({
  email: '',
  password: ''
})

const showPassword = ref(false)
const isSubmitting = ref(false)
const showSuccess = ref(false)
const apiError = ref('')
const apiErrorDetail = ref('')

// Telegram auth state
const isTelegramLoading = ref(false)
const telegramAuthLink = ref('')
const telegramCallbackUrl = ref('')

/**
 * Обработка возврата из Telegram OAuth
 * Проверяет наличие #tgAuthResult= в хеше и редиректит на callback
 */
function processTelegramAuthResult() {
  const hash = window.location.hash
  
  if (hash.startsWith('#tgAuthResult=')) {
    console.log('[Telegram Auth] Found tgAuthResult in hash')
    
    try {
      // Извлекаем и декодируем данные
      const base64Data = hash.substring('#tgAuthResult='.length)
      const jsonString = atob(base64Data)
      const authData = JSON.parse(jsonString)
      
      console.log('[Telegram Auth] Decoded auth data:', authData)
      
      // Формируем URL для callback с данными в query
      const params = new URLSearchParams(authData)
      const callbackUrl = telegramCallbackUrl.value + '?' + params.toString()
      
      console.log('[Telegram Auth] Redirecting to:', callbackUrl)
      
      // Редиректим на Django callback
      window.location.href = callbackUrl
      
    } catch (error) {
      console.error('[Telegram Auth] Error processing auth data:', error)
      apiError.value = 'Ошибка обработки данных авторизации Telegram'
      // Очищаем хеш
      window.location.hash = ''
    }
  }
}

/**
 * Загрузка данных для Telegram авторизации
 */
async function loadTelegramAuthData() {
  try {
    const result = await api.getGlobalData()
    
    if (result.status === 'ok' && result.data) {
      telegramAuthLink.value = result.data.t_auth_link || ''
      telegramCallbackUrl.value = result.data.t_auth_callback_url || ''
      
      // После загрузки callback URL проверяем хеш
      if (telegramCallbackUrl.value) {
        processTelegramAuthResult()
      }
    }
  } catch (error) {
    console.error('[Telegram Auth] Failed to load global data:', error)
  }
}

/**
 * Обработчик клика по кнопке Telegram
 */
function handleTelegramLogin() {
  window.open('https://t.me/Percent_One_bot', '_blank')
}

onMounted(async () => {
  await api.initCsrf()
  
  // Загружаем данные для Telegram авторизации
  await loadTelegramAuthData()
})

function validateField(field) {
  switch (field) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!form.email) {
        errors.email = 'Введите email адрес'
      } else if (!emailRegex.test(form.email)) {
        errors.email = 'Введите корректный email адрес'
      } else {
        errors.email = ''
      }
      break

    case 'password':
      if (!form.password) {
        errors.password = 'Введите пароль'
      } else if (form.password.length < 6) {
        errors.password = 'Пароль должен содержать минимум 6 символов'
      } else {
        errors.password = ''
      }
      break
  }
}

function validateForm() {
  validateField('email')
  validateField('password')

  return !errors.email && !errors.password
}

async function handleLogin() {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  apiError.value = ''
  apiErrorDetail.value = ''

  try {
    const result = await api.login(form.email, form.password)

    if (result.status === 'ok') {
      resetAuthCache()
      
      if (result.data) {
        store.setUser(result.data)
      }
      
      showSuccess.value = true

      setTimeout(() => {
        const redirectPath = route.query.redirect || '/app'
        router.push(redirectPath)
      }, 1500)
    } else {
      apiError.value = result.error_data?.message || 'Неверный email или пароль'
      apiErrorDetail.value = result.error_data?.key || ''
    }
  } catch (e) {
    apiError.value = 'Ошибка сети. Проверьте подключение к интернету.'
    apiErrorDetail.value = ''
  } finally {
    isSubmitting.value = false
  }
}

function closeSuccess() {
  showSuccess.value = false
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  padding-left: 0;
}

.login-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  align-items: center;
}

.login-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  box-shadow: var(--shadow-xl);
}

.login-header {
  margin-bottom: 2rem;
  text-align: center;
}

.login-logo {
  font-size: 1.75rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.login-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.login-header h2 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.login-description {
  color: var(--text-secondary);
  margin: 0;
}

.login-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9375rem;
  color: var(--text-primary);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 2.75rem;
  font-size: 0.9375rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input::placeholder {
  color: var(--text-tertiary);
}

.form-input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-toggle-password {
  position: absolute;
  right: 0.875rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-toggle-password:hover {
  transform: scale(1.1);
}

.form-error {
  display: block;
  margin-top: 0.35rem;
  font-size: 0.8125rem;
  color: var(--danger-color);
}

.api-error {
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
  color: var(--danger-color);
}

.api-error-message {
  font-size: 0.875rem;
}

.api-error-detail {
  font-size: 0.75rem;
  font-style: italic;
  margin-top: 0.35rem;
  opacity: 0.85;
}

.checkbox-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9375rem;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--primary-color);
}

.checkbox-text {
  color: var(--text-secondary);
}

.forgot-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
}

.forgot-link:hover {
  text-decoration: underline;
}

.link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.link:hover {
  text-decoration: underline;
}

.login-submit {
  width: 100%;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-lg {
  padding: 1rem 1.5rem;
}

.divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.social-login {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.social-login.single {
  grid-template-columns: 1fr;
}

.btn-social {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: white;
  color: var(--text-primary);
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
}

.btn-social.telegram {
  background: #0088cc;
  border-color: #0088cc;
  color: white;
}

.btn-social.telegram:hover:not(:disabled) {
  background: #0077b3;
  border-color: #0077b3;
}

.btn-social:hover:not(:disabled) {
  border-color: var(--primary-color);
  background: var(--bg-secondary);
}

.btn-social:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.social-icon {
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.telegram-icon svg {
  fill: currentColor;
}

.login-footer {
  text-align: center;
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

.login-footer p {
  margin: 0;
}

.login-benefits {
  color: white;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  backdrop-filter: blur(10px);
}

.benefits-header h3 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.benefit-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.icon-wrapper-md {
  width: 48px;
  height: 48px;
}

.icon-wrapper-lg {
  width: 80px;
  height: 80px;
}

.icon-wrapper.success {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.benefit-item h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.benefit-item p {
  margin: 0;
  font-size: 0.875rem;
  opacity: 0.9;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: var(--radius-xl);
  padding: 2rem;
  max-width: 400px;
  box-shadow: var(--shadow-xl);
  text-align: center;
}

.modal-header h2 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.modal-body p {
  color: var(--text-secondary);
  line-height: 1.6;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 968px) {
  .login-container {
    grid-template-columns: 1fr;
  }

  .login-benefits {
    display: none;
  }

  .login-card {
    padding: 2rem;
  }

  .login-page {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 1.5rem;
  }

  .login-header h2 {
    font-size: 1.5rem;
  }

  .social-login {
    grid-template-columns: 1fr;
  }
}
</style>
