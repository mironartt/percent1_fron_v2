<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h1 class="register-logo">OnePercent</h1>
          <p class="register-subtitle">+1% каждый день к лучшей жизни</p>
          <h2>Присоединяйтесь к системе</h2>
          <p class="register-description">Начните путь к достижению своих целей прямо сейчас</p>
        </div>

        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label for="name" class="form-label">
              <span class="label-text">Ваше имя</span>
            </label>
            <div class="input-wrapper">
              <span class="input-icon">&#x1F464;</span>
              <input
                id="name"
                v-model="form.name"
                type="text"
                class="form-input"
                placeholder="Введите ваше имя"
                required
                :disabled="isSubmitting"
                @blur="validateField('name')"
              />
            </div>
            <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
          </div>

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
              <span class="label-hint">(минимум 8 символов)</span>
            </label>
            <div class="input-wrapper">
              <span class="input-icon">&#x1F512;</span>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="Придумайте надежный пароль"
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
            <span v-else class="form-hint">Используйте цифры, буквы и символы для безопасности</span>
          </div>

          <div class="form-group">
            <label for="password2" class="form-label">
              <span class="label-text">Подтвердите пароль</span>
            </label>
            <div class="input-wrapper">
              <span class="input-icon">&#x1F512;</span>
              <input
                id="password2"
                v-model="form.password2"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="Повторите пароль"
                required
                :disabled="isSubmitting"
                @blur="validateField('password2')"
              />
            </div>
            <span v-if="errors.password2" class="form-error">{{ errors.password2 }}</span>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input
                v-model="form.agreeTerms"
                type="checkbox"
                class="checkbox-input"
                required
              />
              <span class="checkbox-text">
                Я согласен с 
                <a href="#" @click.prevent class="link">условиями использования</a>
                и 
                <a href="#" @click.prevent class="link">политикой конфиденциальности</a>
              </span>
            </label>
          </div>

          <div v-if="apiError" class="api-error">
            {{ apiError }}
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-lg register-submit"
            :disabled="isSubmitting"
          >
            <span v-if="!isSubmitting">Создать аккаунт</span>
            <span v-else>Загрузка...</span>
          </button>
        </form>

        <div class="divider">
          <span>или</span>
        </div>

        <div class="social-register">
          <button type="button" class="btn-social google" disabled>
            <span class="social-icon">&#x1F535;</span>
            <span>Google</span>
          </button>
          <button type="button" class="btn-social telegram" disabled>
            <span class="social-icon">&#x1F4AC;</span>
            <span>Telegram</span>
          </button>
        </div>

        <div class="register-footer">
          <p>
            Уже есть аккаунт?
            <router-link to="/auth/login" class="link">Войдите здесь</router-link>
          </p>
        </div>
      </div>

      <div class="register-benefits">
        <div class="benefits-header">
          <h3>Что вас ждёт в OnePercent</h3>
        </div>
        <div class="benefits-list">
          <div class="benefit-item">
            <span class="benefit-icon">&#x1F3AF;</span>
            <div>
              <h4>Система управления жизнью</h4>
              <p>ССП для баланса всех сфер</p>
            </div>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">&#x1F4CA;</span>
            <div>
              <h4>Отслеживание прогресса</h4>
              <p>Графики и статистика развития</p>
            </div>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">&#x1F4A1;</span>
            <div>
              <h4>Персональные рекомендации</h4>
              <p>Советы для улучшения на 1%</p>
            </div>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">&#x1F465;</span>
            <div>
              <h4>Сообщество единомышленников</h4>
              <p>Клуб 1% для взаимной поддержки</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="showSuccess" class="modal-overlay" @click="closeSuccess">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h2>&#x1F389; Добро пожаловать!</h2>
          </div>
          <div class="modal-body">
            <p>Ваш аккаунт успешно создан. Сейчас вас перенаправит в личный кабинет.</p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import api from '@/services/api.js'
import { resetAuthCache } from '@/router/index.js'

const router = useRouter()
const store = useAppStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
  password2: '',
  agreeTerms: false
})

const errors = reactive({
  name: '',
  email: '',
  password: '',
  password2: ''
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
    case 'name':
      if (!form.name.trim()) {
        errors.name = 'Введите ваше имя'
      } else if (form.name.trim().length < 2) {
        errors.name = 'Имя должно содержать минимум 2 символа'
      } else {
        errors.name = ''
      }
      break

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
        errors.password = 'Придумайте пароль'
      } else if (form.password.length < 8) {
        errors.password = 'Пароль должен содержать минимум 8 символов'
      } else {
        errors.password = ''
      }
      if (form.password2 && form.password !== form.password2) {
        errors.password2 = 'Пароли не совпадают'
      }
      break

    case 'password2':
      if (!form.password2) {
        errors.password2 = 'Подтвердите пароль'
      } else if (form.password !== form.password2) {
        errors.password2 = 'Пароли не совпадают'
      } else {
        errors.password2 = ''
      }
      break
  }
}

function validateForm() {
  validateField('name')
  validateField('email')
  validateField('password')
  validateField('password2')

  return !errors.name && !errors.email && !errors.password && !errors.password2 && form.agreeTerms
}

async function handleRegister() {
  if (!validateForm()) {
    if (!form.agreeTerms) {
      apiError.value = 'Необходимо согласиться с условиями использования'
    }
    return
  }

  isSubmitting.value = true
  apiError.value = ''

  try {
    const result = await api.register(form.name, form.email, form.password, form.password2)

    if (result.status === 'ok') {
      resetAuthCache()
      
      if (result.data) {
        store.setUser(result.data)
      }
      
      showSuccess.value = true

      setTimeout(() => {
        router.push('/app')
      }, 1500)
    } else {
      apiError.value = result.error_data?.message || 'Произошла ошибка при регистрации'
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
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  padding-left: 0;
}

.register-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  align-items: center;
}

.register-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  box-shadow: var(--shadow-xl);
}

.register-header {
  margin-bottom: 2rem;
  text-align: center;
}

.register-logo {
  font-size: 1.75rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.register-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.register-header h2 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.register-description {
  color: var(--text-secondary);
  margin: 0;
}

.register-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9375rem;
}

.label-text {
  display: block;
  color: var(--text-primary);
}

.label-hint {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  font-weight: 400;
  display: block;
  margin-top: 0.25rem;
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

.form-hint {
  display: block;
  margin-top: 0.35rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
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
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.9375rem;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  margin-top: 0.25rem;
  cursor: pointer;
  accent-color: var(--primary-color);
}

.checkbox-text {
  color: var(--text-secondary);
  line-height: 1.5;
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

.register-submit {
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

.social-register {
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

.register-footer {
  text-align: center;
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

.register-footer p {
  margin: 0;
}

.register-benefits {
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
  .register-container {
    grid-template-columns: 1fr;
  }

  .register-benefits {
    display: none;
  }

  .register-card {
    padding: 2rem;
  }

  .register-page {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .register-card {
    padding: 1.5rem;
  }

  .register-header h2 {
    font-size: 1.5rem;
  }

  .social-register {
    grid-template-columns: 1fr;
  }
}
</style>
