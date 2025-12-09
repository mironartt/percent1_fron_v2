<template>
  <div class="settings-container">
    <header class="page-header">
      <div>
        <h1>Настройки</h1>
        <p class="subtitle">Управление профилем, оплатой и параметрами приложения</p>
      </div>
    </header>

    <div class="settings-grid">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <User :size="18" :stroke-width="1.5" class="card-icon" />
            Профиль
          </h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">Имя</label>
            <input 
              type="text"
              v-model="userName"
              class="form-input"
              placeholder="Ваше имя"
              @blur="saveUserName"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <div v-if="needsEmailSetup" class="email-setup-block">
              <div class="email-setup-message">
                <Mail :size="16" />
                <span>Email не указан</span>
              </div>
              <button class="btn btn-primary btn-sm" @click="openEmailSetupModal">
                Указать email
              </button>
            </div>
            <template v-else>
              <input 
                type="email"
                class="form-input"
                :value="userEmail"
                disabled
                readonly
              />
              <span class="form-hint">Email нельзя изменить после указания</span>
            </template>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <CreditCard :size="18" :stroke-width="1.5" class="card-icon" />
            Подписка и оплата
          </h3>
        </div>
        <div class="card-body">
          <div class="subscription-status">
            <div class="status-badge trial">Пробный период</div>
            <p class="status-text">Осталось 7 дней бесплатного доступа</p>
          </div>

          <div class="pricing-info">
            <h4>Тарифы OnePercent</h4>
            <div class="price-options">
              <div class="price-option">
                <div class="price-name">Месячный</div>
                <div class="price-value">990 ₽/мес</div>
              </div>
              <div class="price-option recommended">
                <div class="price-badge">Выгодно</div>
                <div class="price-name">Годовой</div>
                <div class="price-value">7 990 ₽/год</div>
                <div class="price-save">Экономия 4 000 ₽</div>
              </div>
            </div>
          </div>

          <button class="btn btn-primary btn-lg" style="width: 100%; margin-top: 1rem;">
            Оформить подписку
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <Bell :size="18" :stroke-width="1.5" class="card-icon" />
            Уведомления
          </h3>
        </div>
        <div class="card-body">
          <div class="setting-item">
            <div>
              <div class="setting-title">Ежедневные напоминания</div>
              <div class="setting-desc">Утренние и вечерние чек-ины</div>
            </div>
            <label class="toggle">
              <input type="checkbox" checked>
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item telegram-bot-item">
            <div class="telegram-bot-info">
              <div class="setting-title">
                <Send :size="16" class="telegram-icon" />
                Telegram бот
              </div>
              <div class="setting-desc">
                Получайте напоминания, отмечайте привычки и общайтесь с AI-ментором прямо в Telegram
              </div>
            </div>
            <a 
              v-if="telegramBotLink"
              :href="telegramBotLink"
              target="_blank"
              class="btn btn-primary btn-sm telegram-btn"
            >
              <Send :size="14" />
              Открыть бота
            </a>
            <span v-else class="loading-text">Загрузка...</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <Bot :size="18" :stroke-width="1.5" class="card-icon" />
            AI Ментор
          </h3>
        </div>
        <div class="card-body">
          <div class="setting-item">
            <div>
              <div class="setting-title">Режим работы</div>
              <div class="setting-desc">Как наставник будет взаимодействовать с вами</div>
            </div>
            <select class="form-select" v-model="mentorMode" @change="updateMentorMode">
              <option value="proactive">Проактивный</option>
              <option value="on_request">По запросу</option>
              <option value="off">Выключен</option>
            </select>
          </div>

          <div class="mode-description">
            <div v-if="mentorMode === 'proactive'" class="mode-info">
              <Sparkles :size="16" :stroke-width="1.5" />
              <span>Наставник сам предлагает советы и подсказки на страницах</span>
            </div>
            <div v-else-if="mentorMode === 'on_request'" class="mode-info">
              <MessageCircle :size="16" :stroke-width="1.5" />
              <span>Наставник отвечает только когда вы к нему обращаетесь</span>
            </div>
            <div v-else class="mode-info muted">
              <VolumeX :size="16" :stroke-width="1.5" />
              <span>Наставник полностью отключен</span>
            </div>
          </div>

          <div class="setting-item" style="margin-top: 1rem;">
            <div>
              <div class="setting-title">Очистить историю чата</div>
              <div class="setting-desc">Удалить все сообщения с наставником</div>
            </div>
            <button 
              class="btn btn-secondary btn-sm" 
              @click="clearMentorHistory"
              :disabled="mentorMessagesCount === 0"
            >
              Очистить ({{ mentorMessagesCount }})
            </button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <FileText :size="18" :stroke-width="1.5" class="card-icon" />
            Мой старт (онбординг)
          </h3>
        </div>
        <div class="card-body">
          <div v-if="hasOnboardingData" class="onboarding-data">
            <div class="onboarding-section" v-if="onboardingData.whyHere">
              <h4>Почему я пришёл в Систему 1%</h4>
              <p>{{ onboardingData.whyHere }}</p>
            </div>

            <div class="onboarding-section" v-if="onboardingData.whatToChange">
              <h4>Что хочу изменить</h4>
              <p>{{ onboardingData.whatToChange }}</p>
            </div>

            <div class="onboarding-section" v-if="onboardingData.growthVsComfort">
              <h4>Зона роста vs Зона комфорта</h4>
              <p>{{ onboardingData.growthVsComfort }}</p>
            </div>

            <div class="onboarding-journey" v-if="onboardingData.pointA || onboardingData.pointB">
              <div class="journey-point" v-if="onboardingData.pointA">
                <strong>Точка А (где был):</strong>
                <p>{{ onboardingData.pointA }}</p>
              </div>
              <div class="journey-arrow" v-if="onboardingData.pointA && onboardingData.pointB">→</div>
              <div class="journey-point" v-if="onboardingData.pointB">
                <strong>Точка Б (куда иду):</strong>
                <p>{{ onboardingData.pointB }}</p>
              </div>
            </div>

            <div class="onboarding-section" v-if="onboardingData.whyImportant">
              <h4>Почему это важно</h4>
              <p>{{ onboardingData.whyImportant }}</p>
            </div>

            <div class="onboarding-meta" v-if="onboardingData.completedAt">
              <small>Пройден: {{ formatDate(onboardingData.completedAt) }}</small>
            </div>

            <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
              <button class="btn btn-secondary" @click="resetOnboarding">
                Пройти заново
              </button>
            </div>
          </div>
          <div v-else class="empty-onboarding">
            <p>Данные онбординга не найдены</p>
            <button class="btn btn-primary btn-sm" @click="resetOnboarding" style="margin-top: 0.5rem;">
              Пройти онбординг
            </button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <Settings :size="18" :stroke-width="1.5" class="card-icon" />
            Дополнительно
          </h3>
        </div>
        <div class="card-body">
          <div class="setting-item">
            <div>
              <div class="setting-title">Выход из аккаунта</div>
              <div class="setting-desc">Выйти из текущей сессии</div>
            </div>
            <button class="btn btn-secondary btn-sm" @click="handleLogout">
              <LogOut :size="14" style="margin-right: 0.25rem" />
              Выйти
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showEmailSetupModal" class="modal-overlay" @click.self="closeEmailSetupModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Укажите email и пароль</h3>
          <button class="btn-close" @click="closeEmailSetupModal">
            <X :size="20" />
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-description">
            Укажите email для восстановления доступа и получения уведомлений
          </p>
          
          <div class="form-group">
            <label class="form-label">Email</label>
            <input 
              type="email"
              v-model="setupEmail"
              class="form-input"
              placeholder="your@email.com"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Пароль</label>
            <input 
              type="password"
              v-model="setupPassword"
              class="form-input"
              placeholder="Минимум 6 символов"
            />
          </div>
          
          <div v-if="setupError" class="error-message">{{ setupError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeEmailSetupModal">Отмена</button>
          <button 
            class="btn btn-primary" 
            @click="submitEmailSetup"
            :disabled="isSubmittingEmail"
          >
            {{ isSubmittingEmail ? 'Сохранение...' : 'Сохранить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { useToastStore } from '../stores/toast'
import * as api from '@/services/api.js'
import { Bot, Sparkles, MessageCircle, VolumeX, User, CreditCard, Bell, FileText, Settings, LogOut, Send, Mail, X } from 'lucide-vue-next'

const router = useRouter()
const store = useAppStore()
const toastStore = useToastStore()

const userName = ref(store.user.first_name || '')
const userEmail = ref('')
const telegramBotLink = ref('')
const isTelegramRegistration = ref(false)
const needsEmailSetup = computed(() => isTelegramRegistration.value && userEmail.value.startsWith('@'))

const showEmailSetupModal = ref(false)
const setupEmail = ref('')
const setupPassword = ref('')
const setupError = ref('')
const isSubmittingEmail = ref(false)

const backendOnboardingData = ref(null)
const onboardingData = computed(() => {
  if (backendOnboardingData.value) {
    return {
      whyHere: backendOnboardingData.value.reason_joined || '',
      whatToChange: backendOnboardingData.value.desired_changes || '',
      growthVsComfort: backendOnboardingData.value.growth_comfort_zones || '',
      pointA: backendOnboardingData.value.current_state || '',
      pointB: backendOnboardingData.value.goal_state || '',
      whyImportant: backendOnboardingData.value.why_important || '',
      completedAt: backendOnboardingData.value.date_created || null
    }
  }
  return null
})

const hasOnboardingData = computed(() => {
  if (!onboardingData.value) return false
  return onboardingData.value.whyHere || onboardingData.value.whatToChange || 
         onboardingData.value.pointA || onboardingData.value.pointB
})

const mentorMode = ref(store.mentor.mode || 'on_request')
const mentorMessagesCount = computed(() => store.mentor.messages?.length || 0)

onMounted(async () => {
  await loadUserData()
  await loadOnboardingData()
})

async function loadUserData() {
  try {
    const result = await api.getUserData()
    if (result.status === 'ok' && result.data) {
      userEmail.value = result.data.email || ''
      telegramBotLink.value = result.data.telegram_bot_link || ''
      isTelegramRegistration.value = result.data.is_telegram_registration || false
      if (result.data.name) {
        userName.value = result.data.name
      }
    }
  } catch (error) {
    console.error('[Settings] Failed to load user data:', error)
  }
}

async function loadOnboardingData() {
  try {
    const result = await api.getOnboardingData()
    if (result.status === 'ok' && result.data) {
      backendOnboardingData.value = result.data
    }
  } catch (error) {
    console.error('[Settings] Failed to load onboarding data:', error)
  }
}

function openEmailSetupModal() {
  setupEmail.value = ''
  setupPassword.value = ''
  setupError.value = ''
  showEmailSetupModal.value = true
}

function closeEmailSetupModal() {
  showEmailSetupModal.value = false
}

async function submitEmailSetup() {
  setupError.value = ''
  
  if (!setupEmail.value || !setupEmail.value.includes('@')) {
    setupError.value = 'Введите корректный email'
    return
  }
  
  if (!setupPassword.value || setupPassword.value.length < 6) {
    setupError.value = 'Пароль должен быть не менее 6 символов'
    return
  }
  
  isSubmittingEmail.value = true
  
  try {
    const result = await api.completeTelegramRegistration(
      setupEmail.value,
      setupPassword.value,
      setupPassword.value
    )
    
    if (result.status === 'ok') {
      userEmail.value = setupEmail.value
      isTelegramRegistration.value = false
      closeEmailSetupModal()
      toastStore.success('Email успешно сохранён')
    } else {
      setupError.value = result.error_data?.message || 'Ошибка сохранения'
    }
  } catch (error) {
    setupError.value = 'Ошибка сети. Попробуйте позже.'
  } finally {
    isSubmittingEmail.value = false
  }
}

function updateMentorMode() {
  store.setMentorMode(mentorMode.value)
}

function clearMentorHistory() {
  if (confirm('Вы уверены? Вся история сообщений с наставником будет удалена.')) {
    store.clearMentorMessages()
  }
}

function saveUserName() {
  store.user.first_name = userName.value
  store.saveToLocalStorage()
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function resetOnboarding() {
  if (confirm('Вы уверены? Все данные онбординга будут сброшены и вы начнёте заново.')) {
    try {
      await api.updateOnboardingData({ is_complete: false, step_completed: 0 })
      store.resetOnboarding()
      router.push('/onboarding')
    } catch (error) {
      console.error('[Settings] Failed to reset onboarding:', error)
      store.resetOnboarding()
      router.push('/onboarding')
    }
  }
}

function handleLogout() {
  router.push('/auth/logout')
}
</script>

<style scoped>
.settings-container {
  max-width: var(--content-width-narrow);
  margin: 0 auto;
  padding: var(--container-padding);
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.page-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-icon {
  color: var(--primary-color);
  flex-shrink: 0;
}

.subscription-status {
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
  text-align: center;
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.status-badge.trial {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
}

.status-text {
  color: var(--text-secondary);
  margin: 0;
}

.pricing-info h4 {
  font-size: 1.125rem;
  margin-bottom: 1rem;
}

.price-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.price-option {
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  text-align: center;
  transition: all 0.2s ease;
  position: relative;
}

.price-option:hover {
  border-color: var(--border-color);
}

.price-option.recommended {
  border-color: var(--primary-color);
  background: rgba(99, 102, 241, 0.05);
}

.price-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
}

.price-name {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.price-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.price-save {
  font-size: 0.875rem;
  color: var(--success-color);
  font-weight: 500;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.setting-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.setting-item.danger .setting-title {
  color: var(--danger-color);
}

.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-tertiary);
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle input:checked + .toggle-slider {
  background-color: var(--primary-color);
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.btn-danger {
  background: var(--danger-color);
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.onboarding-data {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.onboarding-section h4 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.onboarding-section p {
  margin: 0;
  line-height: 1.6;
  color: var(--text-secondary);
  white-space: pre-wrap;
}

.onboarding-journey {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1.5rem;
  align-items: center;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.journey-point strong {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.journey-point p {
  margin: 0;
  line-height: 1.6;
  color: var(--text-secondary);
}

.journey-arrow {
  font-size: 2rem;
  color: var(--primary-color);
}

.onboarding-meta {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.onboarding-meta small {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.empty-onboarding {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.form-select {
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  outline: none;
}

.form-select:focus {
  border-color: var(--primary-color);
}

.mode-description {
  margin-top: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.mode-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.mode-info svg {
  color: var(--primary-color);
  flex-shrink: 0;
}

.mode-info.muted svg {
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .price-options {
    grid-template-columns: 1fr;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .onboarding-journey {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .journey-arrow {
    transform: rotate(90deg);
    justify-self: center;
  }
}

/* Dark theme overrides */
:root.dark .settings-card {
  background: var(--card-bg);
  border-color: var(--border-color);
}

:root.dark .setting-label {
  color: var(--text-primary);
}

:root.dark .setting-description {
  color: var(--text-secondary);
}

:root.dark .price-card {
  background: var(--bg-tertiary);
  border-color: var(--border-color);
}

:root.dark .price-card.active {
  border-color: var(--primary-color);
}

:root.dark .btn-logout {
  background: var(--status-danger-bg);
  color: var(--danger-color);
}

:root.dark .btn-logout:hover {
  background: rgba(248, 113, 113, 0.25);
}

.telegram-bot-item {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}

.telegram-bot-info {
  flex: 1;
}

.telegram-bot-info .setting-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.telegram-icon {
  color: #0088cc;
}

.telegram-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.loading-text {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.email-setup-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  border: 1px dashed var(--border-color);
}

.email-setup-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.email-setup-message svg {
  color: var(--text-muted);
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
  padding: 1rem;
}

.modal-content {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  max-width: 420px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
}

.btn-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--radius-sm);
}

.btn-close:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.modal-description {
  margin: 0 0 1.25rem 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

.error-message {
  color: var(--danger-color);
  font-size: 0.85rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: var(--status-danger-bg);
  border-radius: var(--radius-sm);
}

:root.dark .modal-content {
  background: var(--card-bg);
}

:root.dark .email-setup-block {
  background: var(--bg-tertiary);
}
</style>
