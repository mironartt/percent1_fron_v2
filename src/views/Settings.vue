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
            <input 
              type="email"
              class="form-input"
              placeholder="your@email.com"
            />
            <span class="form-hint">Для уведомлений и восстановления доступа</span>
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

          <div class="setting-item">
            <div>
              <div class="setting-title">Email уведомления</div>
              <div class="setting-desc">Еженедельные отчеты о прогрессе</div>
            </div>
            <label class="toggle">
              <input type="checkbox">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div>
              <div class="setting-title">Telegram бот</div>
              <div class="setting-desc">Интеграция с мессенджером</div>
            </div>
            <button class="btn btn-secondary btn-sm" @click="goToTelegramSettings">Настроить</button>
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
          <div v-if="onboardingData" class="onboarding-data">
            <div class="onboarding-section">
              <h4>Почему я пришёл в Систему 1%</h4>
              <p>{{ onboardingData.whyHere }}</p>
            </div>

            <div class="onboarding-section">
              <h4>Что хочу изменить</h4>
              <p>{{ onboardingData.whatToChange }}</p>
            </div>

            <div class="onboarding-section">
              <h4>Зона роста vs Зона комфорта</h4>
              <p>{{ onboardingData.growthVsComfort }}</p>
            </div>

            <div class="onboarding-journey">
              <div class="journey-point">
                <strong>📍 Точка А (где был):</strong>
                <p>{{ onboardingData.pointA }}</p>
              </div>
              <div class="journey-arrow">→</div>
              <div class="journey-point">
                <strong>🎯 Точка Б (куда иду):</strong>
                <p>{{ onboardingData.pointB }}</p>
              </div>
            </div>

            <div class="onboarding-section">
              <h4>💎 Почему это важно</h4>
              <p>{{ onboardingData.whyImportant }}</p>
            </div>

            <div class="onboarding-meta">
              <small>Пройден: {{ formatDate(onboardingData.completedAt) }}</small>
            </div>

            <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
              <button class="btn btn-secondary" @click="resetOnboarding">
                🔄 Пройти онбординг заново
              </button>
            </div>
          </div>
          <div v-else class="empty-onboarding">
            <p>Вы еще не прошли онбординг</p>
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
              <div class="setting-title">Экспорт данных</div>
              <div class="setting-desc">Скачать все ваши данные</div>
            </div>
            <button class="btn btn-secondary btn-sm">Экспорт</button>
          </div>

          <div class="setting-item">
            <div>
              <div class="setting-title">Импорт данных</div>
              <div class="setting-desc">Загрузить данные из файла</div>
            </div>
            <button class="btn btn-secondary btn-sm">Импорт</button>
          </div>

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

          <div class="setting-item danger">
            <div>
              <div class="setting-title">Удалить аккаунт</div>
              <div class="setting-desc">Безвозвратное удаление данных</div>
            </div>
            <button class="btn btn-danger btn-sm">Удалить</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { Bot, Sparkles, MessageCircle, VolumeX, User, CreditCard, Bell, FileText, Settings, LogOut } from 'lucide-vue-next'

const router = useRouter()
const store = useAppStore()

const userName = ref(store.user.name)
const onboardingData = computed(() => store.onboarding.data)

const mentorMode = ref(store.mentor.mode || 'on_request')
const mentorMessagesCount = computed(() => store.mentor.messages?.length || 0)

function updateMentorMode() {
  store.setMentorMode(mentorMode.value)
}

function clearMentorHistory() {
  if (confirm('Вы уверены? Вся история сообщений с наставником будет удалена.')) {
    store.clearMentorMessages()
  }
}

function saveUserName() {
  store.user.name = userName.value
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

function resetOnboarding() {
  if (confirm('Вы уверены? Все данные онбординга будут сброшены и вы вернётесь к началу.')) {
    store.resetOnboarding()
    window.location.href = '/'
  }
}

function handleLogout() {
  router.push('/auth/logout')
}

function goToTelegramSettings() {
  router.push('/app/planning')
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
</style>
