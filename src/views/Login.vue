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
              <span class="input-icon">&#x1F4E7;</span>
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
              <span class="input-icon">&#x1F512;</span>
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
                {{ showPassword ? '&#x1F441;' : '&#x1F441;&#x200D;&#x1F5E8;' }}
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
            {{ apiError }}
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

        <div class="social-login">
          <button type="button" class="btn-social google" disabled>
            <span class="social-icon">&#x1F535;</span>
            <span>Google</span>
          </button>
          <button type="button" class="btn-social telegram" disabled>
            <span class="social-icon">&#x1F4AC;</span>
            <span>Telegram</span>
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
            <span class="benefit-icon">&#x1F680;</span>
            <div>
              <h4>Простая система</h4>
              <p>Начните улучшать жизнь за 5 минут</p>
            </div>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">&#x1F4C8;</span>
            <div>
              <h4>Видимый прогресс</h4>
              <p>Отслеживайте свой рост день за днём</p>
            </div>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">&#x1F3AF;</span>
            <div>
              <h4>Достижение целей</h4>
              <p>Управляйте всеми сферами жизни</p>
            </div>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">&#x1F4AA;</span>
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
            <h2>&#x1F389; Успешный вход!</h2>
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

onMounted(async () => {
  await api.initCsrf()
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
    }
  } catch (e) {
    apiError.value = 'Ошибка сети. Проверьте подключение к интернету.'
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
  font-size: 1.125rem;
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
  font-size: 0.875rem;
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

.btn-social:hover:not(:disabled) {
  border-color: var(--primary-color);
  background: var(--bg-secondary);
}

.btn-social:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.social-icon {
  font-size: 1.125rem;
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
}

.benefit-icon {
  font-size: 1.75rem;
  flex-shrink: 0;
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
