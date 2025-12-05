<template>
  <Teleport to="body">
    <div v-if="showModal" class="tg-modal-overlay" @click.self="closeModal">
      <div class="tg-modal-container">
        <div class="tg-modal-header" :class="modalHeaderClass">
          <div class="tg-modal-icon-wrapper" :class="modalIconClass">
            <AlertCircle v-if="modalType === 'expired' || modalType === 'not_found'" :size="28" :stroke-width="1.5" />
            <CheckCircle v-else-if="modalType === 'complete_registration'" :size="28" :stroke-width="1.5" />
          </div>
          <h2 class="tg-modal-title">{{ modalTitle }}</h2>
          <button class="tg-modal-close" @click="closeModal">
            <X :size="20" :stroke-width="1.5" />
          </button>
        </div>
        
        <div class="tg-modal-body">
          <template v-if="modalType === 'expired'">
            <p class="tg-modal-description">
              Ссылка для входа истекла. Срок действия ссылки — 10 минут.
            </p>
            <p class="tg-modal-hint">
              Вы можете запросить новую ссылку в Telegram-боте или воспользоваться другим способом входа.
            </p>
            
            <div class="tg-modal-actions">
              <a href="/auth/telegram" class="tg-action-btn telegram">
                <Send :size="18" :stroke-width="1.5" />
                Войти через Telegram
              </a>
              <div class="tg-action-row">
                <a href="/auth/login" class="tg-action-btn secondary">
                  Войти
                </a>
                <a href="/auth/register" class="tg-action-btn secondary">
                  Регистрация
                </a>
              </div>
            </div>
          </template>
          
          <template v-else-if="modalType === 'not_found'">
            <p class="tg-modal-description">
              Ссылка для входа недействительна или уже была использована.
            </p>
            <p class="tg-modal-hint">
              Запросите новую ссылку в Telegram-боте или воспользуйтесь другим способом входа.
            </p>
            
            <div class="tg-modal-actions">
              <a href="/auth/telegram" class="tg-action-btn telegram">
                <Send :size="18" :stroke-width="1.5" />
                Войти через Telegram
              </a>
              <div class="tg-action-row">
                <a href="/auth/login" class="tg-action-btn secondary">
                  Войти
                </a>
                <a href="/auth/register" class="tg-action-btn secondary">
                  Регистрация
                </a>
              </div>
            </div>
          </template>
          
          <template v-else-if="modalType === 'complete_registration'">
            <p class="tg-modal-description">
              Вы успешно зарегистрировались через Telegram! Для полного доступа к аккаунту укажите email и пароль.
            </p>
            <p class="tg-modal-hint">
              Это позволит вам входить в систему без Telegram и восстановить доступ, если потребуется.
            </p>
            
            <!-- Общая ошибка API -->
            <div v-if="apiError" class="tg-api-error">
              <AlertCircle :size="16" :stroke-width="1.5" />
              <span>{{ apiError }}</span>
            </div>
            
            <form class="tg-form" @submit.prevent="submitRegistration">
              <div class="tg-form-group">
                <label class="tg-form-label">
                  <Mail :size="16" :stroke-width="1.5" />
                  Email
                </label>
                <input 
                  type="email" 
                  class="tg-form-input" 
                  :class="{ 'has-error': fieldErrors.email }"
                  v-model="formData.email"
                  placeholder="your@email.com"
                  required
                  :disabled="isSubmitting"
                />
                <span v-if="fieldErrors.email" class="tg-form-error">
                  {{ fieldErrors.email }}
                </span>
              </div>
              
              <div class="tg-form-group">
                <label class="tg-form-label">
                  <Lock :size="16" :stroke-width="1.5" />
                  Пароль
                </label>
                <div class="tg-password-wrapper">
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    class="tg-form-input" 
                    :class="{ 'has-error': fieldErrors.password }"
                    v-model="formData.password"
                    placeholder="Минимум 8 символов"
                    required
                    minlength="8"
                    :disabled="isSubmitting"
                  />
                  <button type="button" class="tg-password-toggle" @click="showPassword = !showPassword" :disabled="isSubmitting">
                    <EyeOff v-if="showPassword" :size="18" :stroke-width="1.5" />
                    <Eye v-else :size="18" :stroke-width="1.5" />
                  </button>
                </div>
                <span v-if="fieldErrors.password" class="tg-form-error">
                  {{ fieldErrors.password }}
                </span>
              </div>
              
              <div class="tg-form-group">
                <label class="tg-form-label">
                  <Lock :size="16" :stroke-width="1.5" />
                  Подтвердите пароль
                </label>
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  class="tg-form-input" 
                  v-model="formData.confirmPassword"
                  placeholder="Повторите пароль"
                  required
                  :disabled="isSubmitting"
                />
                <span v-if="formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword" class="tg-form-error">
                  Пароли не совпадают
                </span>
              </div>
              
              <button type="submit" class="tg-submit-btn" :disabled="!isFormValid || isSubmitting">
                <Loader2 v-if="isSubmitting" :size="18" :stroke-width="1.5" class="tg-spinner" />
                <CheckCircle v-else :size="18" :stroke-width="1.5" />
                {{ isSubmitting ? 'Сохранение...' : 'Сохранить данные' }}
              </button>
              
              <button type="button" class="tg-skip-btn" @click="closeModal" :disabled="isSubmitting">
                Пропустить
              </button>
            </form>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { completeTelegramRegistration, getUserData } from '@/services/api'
import { 
  X, 
  AlertCircle, 
  CheckCircle, 
  Send, 
  Mail, 
  Lock,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useAppStore()

const showModal = ref(false)
const modalType = ref('')
const showPassword = ref(false)
const isSubmitting = ref(false)
const apiError = ref('')
const fieldErrors = ref({
  email: '',
  password: ''
})

const formData = ref({
  email: '',
  password: '',
  confirmPassword: ''
})

const modalTitle = computed(() => {
  switch (modalType.value) {
    case 'expired':
      return 'Ссылка устарела'
    case 'not_found':
      return 'Ссылка недействительна'
    case 'complete_registration':
      return 'Завершите регистрацию'
    default:
      return ''
  }
})

const modalHeaderClass = computed(() => {
  if (modalType.value === 'expired' || modalType.value === 'not_found') {
    return 'warning'
  }
  return 'success'
})

const modalIconClass = computed(() => {
  if (modalType.value === 'expired' || modalType.value === 'not_found') {
    return 'warning'
  }
  return 'success'
})

const isFormValid = computed(() => {
  return formData.value.email && 
         formData.value.password && 
         formData.value.password.length >= 8 &&
         formData.value.password === formData.value.confirmPassword
})

/**
 * Проверяет, нужно ли показывать модальное окно завершения регистрации
 * Условия:
 * 1. is_telegram_registration = true
 * 2. email пустой ИЛИ заканчивается на @telegram.com ИЛИ начинается с @
 */
function needsRegistrationCompletion(userData) {
  if (!userData) return false
  if (!userData.is_telegram_registration) return false
  
  const email = userData.email || ''
  
  // Email пустой
  if (!email) return true
  
  // Email заканчивается на @telegram.com
  if (email.endsWith('@telegram.com')) return true
  
  // Email начинается с @
  if (email.startsWith('@')) return true
  
  return false
}

async function checkQueryParams() {
  const telegramAuthError = route.query.telegram_auth_error
  const telegramCompleteRegistration = route.query.telegram_complete_registration
  
  if (telegramAuthError === 'token_expired') {
    modalType.value = 'expired'
    showModal.value = true
  } else if (telegramAuthError === 'token_not_found') {
    modalType.value = 'not_found'
    showModal.value = true
  } else if (telegramCompleteRegistration === '1') {
    // Проверяем данные пользователя перед показом модального окна
    try {
      const result = await getUserData()
      if (result.status === 'ok' && result.data) {
        if (needsRegistrationCompletion(result.data)) {
          modalType.value = 'complete_registration'
          showModal.value = true
        } else {
          // Пользователь уже заполнил данные - убираем параметр из URL
          const query = { ...route.query }
          delete query.telegram_complete_registration
          router.replace({ query })
        }
      }
    } catch (error) {
      console.error('[TelegramAuth] Failed to check user data:', error)
      // При ошибке всё равно показываем модальное окно
      modalType.value = 'complete_registration'
      showModal.value = true
    }
  }
}

function closeModal() {
  showModal.value = false
  modalType.value = ''
  apiError.value = ''
  fieldErrors.value = { email: '', password: '' }
  formData.value = { email: '', password: '', confirmPassword: '' }
  
  const query = { ...route.query }
  delete query.telegram_auth_error
  delete query.telegram_complete_registration
  router.replace({ query })
}

function parseApiErrors(errorData) {
  fieldErrors.value = { email: '', password: '' }
  apiError.value = ''
  
  if (!errorData) return
  
  // Обработка ошибок по полям
  if (errorData.email) {
    fieldErrors.value.email = Array.isArray(errorData.email) 
      ? errorData.email.join('. ') 
      : errorData.email
  }
  
  if (errorData.password1 || errorData.password2) {
    const pwdErrors = []
    if (errorData.password1) {
      pwdErrors.push(Array.isArray(errorData.password1) ? errorData.password1.join('. ') : errorData.password1)
    }
    if (errorData.password2) {
      pwdErrors.push(Array.isArray(errorData.password2) ? errorData.password2.join('. ') : errorData.password2)
    }
    fieldErrors.value.password = pwdErrors.join('. ')
  }
  
  // Общие ошибки
  if (errorData.non_field_errors) {
    apiError.value = Array.isArray(errorData.non_field_errors) 
      ? errorData.non_field_errors.join('. ') 
      : errorData.non_field_errors
  } else if (errorData.detail) {
    apiError.value = errorData.detail
  } else if (errorData.error) {
    apiError.value = errorData.error
  }
}

async function submitRegistration() {
  if (!isFormValid.value || isSubmitting.value) return
  
  isSubmitting.value = true
  apiError.value = ''
  fieldErrors.value = { email: '', password: '' }
  
  try {
    const result = await completeTelegramRegistration(
      formData.value.email,
      formData.value.password,
      formData.value.confirmPassword
    )
    
    if (result.status === 'ok') {
      console.log('[TelegramAuth] Registration completed successfully')
      
      // Обновляем данные пользователя в store
      if (result.data) {
        store.setUser(result.data)
      }
      
      closeModal()
    } else {
      // Обработка ошибок
      parseApiErrors(result.error_data || result.errors || result)
      
      if (!apiError.value && !fieldErrors.value.email && !fieldErrors.value.password) {
        apiError.value = 'Произошла ошибка при сохранении данных'
      }
    }
  } catch (error) {
    console.error('[TelegramAuth] Registration error:', error)
    apiError.value = 'Произошла ошибка соединения. Попробуйте позже.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  checkQueryParams()
})

watch(() => route.query, () => {
  checkQueryParams()
}, { deep: true })
</script>

<style scoped>
.tg-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.tg-modal-container {
  background: var(--bg-primary);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  animation: tgModalSlideIn 0.2s ease-out;
}

@keyframes tgModalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.tg-modal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.tg-modal-header.warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), transparent);
}

.tg-modal-header.success {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), transparent);
}

.tg-modal-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tg-modal-icon-wrapper.warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.tg-modal-icon-wrapper.success {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

.tg-modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
}

.tg-modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.tg-modal-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.tg-modal-body {
  padding: 1.5rem;
}

.tg-modal-description {
  color: var(--text-primary);
  font-size: 0.9375rem;
  line-height: 1.6;
  margin: 0 0 0.75rem 0;
}

.tg-modal-hint {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 1.5rem 0;
}

.tg-modal-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tg-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tg-action-btn.telegram {
  background: linear-gradient(135deg, #0088cc, #00aaff);
  color: white;
}

.tg-action-btn.telegram:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 136, 204, 0.3);
}

.tg-action-btn.secondary {
  flex: 1;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.tg-action-btn.secondary:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
}

.tg-action-row {
  display: flex;
  gap: 0.75rem;
}

.tg-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tg-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tg-form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.tg-form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9375rem;
  transition: all 0.2s ease;
}

.tg-form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.tg-form-input::placeholder {
  color: var(--text-tertiary);
}

.tg-password-wrapper {
  position: relative;
}

.tg-password-wrapper .tg-form-input {
  padding-right: 3rem;
}

.tg-password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.tg-password-toggle:hover {
  color: var(--text-primary);
}

.tg-form-error {
  font-size: 0.8125rem;
  color: var(--danger-color);
}

.tg-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  font-size: 0.9375rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
}

.tg-submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.tg-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tg-skip-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s ease;
}

.tg-skip-btn:hover {
  color: var(--text-primary);
}

.tg-skip-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* API Error */
.tg-api-error {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  color: var(--danger-color, #ef4444);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.tg-api-error svg {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

/* Input error state */
.tg-form-input.has-error {
  border-color: var(--danger-color, #ef4444);
}

.tg-form-input.has-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Spinner animation */
.tg-spinner {
  animation: tg-spin 1s linear infinite;
}

@keyframes tg-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
