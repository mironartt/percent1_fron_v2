<template>
  <div class="recovery-page">
    <div class="recovery-container">
      <div class="recovery-card">
        <div class="recovery-header">
          <h1 class="recovery-logo">OnePercent</h1>
          <p class="recovery-subtitle">+1% каждый день к лучшей жизни</p>
          <h2>Восстановление пароля</h2>
          <p class="recovery-description">Введите email, указанный при регистрации</p>
        </div>

        <div v-if="!emailSent">
          <form @submit.prevent="handleRecovery" class="recovery-form">
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
                  @blur="validateEmail"
                />
              </div>
              <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
            </div>

            <div v-if="apiError" class="api-error">
              {{ apiError }}
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-lg recovery-submit"
              :disabled="isSubmitting"
            >
              <span v-if="!isSubmitting">Отправить ссылку для восстановления</span>
              <span v-else>Отправка...</span>
            </button>
          </form>
        </div>

        <div v-else class="success-message">
          <div class="success-icon">&#x2709;&#xFE0F;</div>
          <h3>Письмо отправлено!</h3>
          <p>
            Мы отправили инструкции по восстановлению пароля на адрес 
            <strong>{{ form.email }}</strong>
          </p>
          <p class="hint">
            Если письмо не пришло, проверьте папку "Спам" или попробуйте снова через несколько минут.
          </p>
          <button @click="resetForm" class="btn btn-outline">
            Отправить повторно
          </button>
        </div>

        <div class="recovery-footer">
          <p>
            Вспомнили пароль?
            <router-link to="/auth/login" class="link">Войти</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import api from '@/services/api.js'

const form = reactive({
  email: ''
})

const errors = reactive({
  email: ''
})

const isSubmitting = ref(false)
const emailSent = ref(false)
const apiError = ref('')

function validateEmail() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.email) {
    errors.email = 'Введите email адрес'
  } else if (!emailRegex.test(form.email)) {
    errors.email = 'Введите корректный email адрес'
  } else {
    errors.email = ''
  }
  return !errors.email
}

async function handleRecovery() {
  if (!validateEmail()) {
    return
  }

  isSubmitting.value = true
  apiError.value = ''

  try {
    const result = await api.requestPasswordRecovery(form.email)

    if (result.status === 'ok') {
      emailSent.value = true
    } else {
      apiError.value = result.error_data?.message || 'Произошла ошибка. Попробуйте позже.'
    }
  } catch (e) {
    apiError.value = 'Ошибка сети. Проверьте подключение к интернету.'
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  emailSent.value = false
  apiError.value = ''
}
</script>

<style scoped>
.recovery-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.recovery-container {
  width: 100%;
  max-width: 480px;
}

.recovery-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  box-shadow: var(--shadow-xl);
}

.recovery-header {
  margin-bottom: 2rem;
  text-align: center;
}

.recovery-logo {
  font-size: 1.75rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.recovery-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.recovery-header h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.recovery-description {
  color: var(--text-secondary);
  margin: 0;
}

.recovery-form {
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
  padding: 0.75rem 1rem 0.75rem 2.75rem;
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

.recovery-submit {
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

.btn-outline {
  border: 2px solid var(--border-color);
  background: transparent;
  color: var(--text-primary);
}

.btn-outline:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-lg {
  padding: 1rem 1.5rem;
}

.success-message {
  text-align: center;
  padding: 1rem 0;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.success-message h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--success-color);
}

.success-message p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.6;
}

.success-message .hint {
  font-size: 0.875rem;
  color: var(--text-tertiary);
  margin-bottom: 1.5rem;
}

.recovery-footer {
  text-align: center;
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.recovery-footer p {
  margin: 0;
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

@media (max-width: 480px) {
  .recovery-card {
    padding: 1.5rem;
  }

  .recovery-header h2 {
    font-size: 1.25rem;
  }
}
</style>
