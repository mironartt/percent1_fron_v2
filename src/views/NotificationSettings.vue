<template>
  <div class="notification-settings-container">
    <header class="page-header">
      <button class="back-btn" @click="goBack">
        <ArrowLeft :size="20" />
      </button>
      <div>
        <h1>Уведомления</h1>
        <p class="subtitle">Настройка Telegram уведомлений</p>
      </div>
    </header>

    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Загрузка настроек...</p>
    </div>

    <div v-else-if="loadError" class="error-state">
      <AlertCircle :size="32" />
      <p>{{ loadError }}</p>
      <button class="retry-btn" @click="loadSettings">Повторить</button>
    </div>

    <div v-else class="settings-content">
      <div class="card master-toggle-card">
        <div class="card-body">
          <div class="setting-item master-toggle">
            <div>
              <div class="setting-title">
                <Bell :size="18" />
                Все уведомления
              </div>
              <div class="setting-desc">Глобальный переключатель</div>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="settings.alerts_enabled" @change="saveField('alerts_enabled')">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div v-if="!settings.telegram_connected" class="bot-status warning">
            <AlertCircle :size="16" />
            <span>Telegram бот не привязан</span>
            <a 
              v-if="telegramBotLink"
              :href="telegramBotLink"
              target="_blank"
              class="link-btn"
            >
              Привязать
            </a>
          </div>
          <div v-else class="bot-status success">
            <CheckCircle :size="16" />
            <span>Бот привязан{{ settings.telegram_username ? `: ${settings.telegram_username}` : '' }}</span>
          </div>
        </div>
      </div>

      <div class="card" :class="{ disabled: !settings.alerts_enabled }">
        <div class="card-header">
          <h3 class="card-title">
            <Sun :size="18" />
            Ежедневные
          </h3>
        </div>
        <div class="card-body">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">
                <Sunrise :size="16" />
                Утреннее напоминание
              </div>
              <div class="setting-desc">Задачи и привычки на день</div>
            </div>
            <div class="setting-controls">
              <input 
                type="time" 
                v-model="settings.morning_reminder_time" 
                class="time-input"
                :disabled="!settings.morning_reminder_enabled"
                @change="saveField('morning_reminder_time')"
              />
              <label class="toggle">
                <input type="checkbox" v-model="settings.morning_reminder_enabled" @change="saveField('morning_reminder_enabled')">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">
                <Sunset :size="16" />
                Вечернее напоминание
              </div>
              <div class="setting-desc">Заполнить дневник</div>
            </div>
            <div class="setting-controls">
              <input 
                type="time" 
                v-model="settings.evening_reminder_time"
                class="time-input"
                :disabled="!settings.evening_reminder_enabled"
                @change="saveField('evening_reminder_time')"
              />
              <label class="toggle">
                <input type="checkbox" v-model="settings.evening_reminder_enabled" @change="saveField('evening_reminder_enabled')">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="card" :class="{ disabled: !settings.alerts_enabled }">
        <div class="card-header">
          <h3 class="card-title">
            <Zap :size="18" />
            События
          </h3>
        </div>
        <div class="card-body">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">
                <Flame :size="16" />
                Предупреждение о серии
              </div>
              <div class="setting-desc">Когда серия под угрозой</div>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="settings.streak_warning_enabled" @change="saveField('streak_warning_enabled')">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div v-if="settings.streak_warning_enabled" class="setting-subitem">
            <span class="subitem-label">Мин. дней серии:</span>
            <select v-model.number="settings.streak_warning_min_days" class="small-select" @change="saveField('streak_warning_min_days')">
              <option :value="1">1</option>
              <option :value="3">3</option>
              <option :value="5">5</option>
              <option :value="7">7</option>
              <option :value="10">10</option>
              <option :value="14">14</option>
              <option :value="21">21</option>
              <option :value="30">30</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">
                <Trophy :size="16" />
                Достижения
              </div>
              <div class="setting-desc">Получено новое достижение</div>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="settings.achievement_notification_enabled" @change="saveField('achievement_notification_enabled')">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">
                <Clock :size="16" />
                Дедлайны целей
              </div>
              <div class="setting-desc">Напоминание до срока</div>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="settings.deadline_reminder_enabled" @change="saveField('deadline_reminder_enabled')">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div v-if="settings.deadline_reminder_enabled" class="setting-subitem">
            <span class="subitem-label">За сколько дней:</span>
            <select v-model.number="settings.deadline_reminder_days_before" class="small-select" @change="saveField('deadline_reminder_days_before')">
              <option :value="1">1</option>
              <option :value="2">2</option>
              <option :value="3">3</option>
              <option :value="5">5</option>
              <option :value="7">7</option>
              <option :value="10">10</option>
              <option :value="14">14</option>
              <option :value="21">21</option>
              <option :value="30">30</option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">
                <TrendingUp :size="16" />
                Прогресс целей
              </div>
              <div class="setting-desc">Уведомление при достижении 80%+</div>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="settings.goal_progress_enabled" @change="saveField('goal_progress_enabled')">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">
                <AlertTriangle :size="16" />
                Просроченные шаги
              </div>
              <div class="setting-desc">Напоминание о невыполненных шагах</div>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="settings.overdue_steps_enabled" @change="saveField('overdue_steps_enabled')">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div class="card" :class="{ disabled: !settings.alerts_enabled }">
        <div class="card-header">
          <h3 class="card-title">
            <Calendar :size="18" />
            Еженедельные
          </h3>
        </div>
        <div class="card-body">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">
                <BarChart3 :size="16" />
                Отчёт за неделю
              </div>
              <div class="setting-desc">Статистика и прогресс</div>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="settings.weekly_report_enabled" @change="saveField('weekly_report_enabled')">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div v-if="settings.weekly_report_enabled" class="setting-subitem">
            <span class="subitem-label">День:</span>
            <select v-model.number="settings.weekly_report_day" class="small-select" @change="saveField('weekly_report_day')">
              <option :value="0">Понедельник</option>
              <option :value="1">Вторник</option>
              <option :value="2">Среда</option>
              <option :value="3">Четверг</option>
              <option :value="4">Пятница</option>
              <option :value="5">Суббота</option>
              <option :value="6">Воскресенье</option>
            </select>
            <span class="subitem-label">Время:</span>
            <input 
              type="time" 
              v-model="settings.weekly_report_time"
              class="time-input small"
              @change="saveField('weekly_report_time')"
            />
          </div>
        </div>
      </div>

      <div class="card" :class="{ disabled: !settings.alerts_enabled }">
        <div class="card-header">
          <h3 class="card-title">
            <Star :size="18" />
            Дополнительные
          </h3>
        </div>
        <div class="card-body">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">
                <Gift :size="16" />
                Напоминание о наградах
              </div>
              <div class="setting-desc">Когда хватает XP на награду</div>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="settings.reward_reminder_enabled" @change="saveField('reward_reminder_enabled')">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">
                <PieChart :size="16" />
                Переоценка Колеса жизни
              </div>
              <div class="setting-desc">Напоминание раз в месяц</div>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="settings.ssp_reevaluation_enabled" @change="saveField('ssp_reevaluation_enabled')">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div v-if="settings.ssp_reevaluation_enabled" class="setting-subitem">
            <span class="subitem-label">День месяца:</span>
            <select v-model.number="settings.ssp_reevaluation_day_of_month" class="small-select" @change="saveField('ssp_reevaluation_day_of_month')">
              <option v-for="day in 28" :key="day" :value="day">{{ day }}</option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">
                <UserX :size="16" />
                Неактивность
              </div>
              <div class="setting-desc">Напоминание при отсутствии активности</div>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="settings.inactivity_reminder_enabled" @change="saveField('inactivity_reminder_enabled')">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div v-if="settings.inactivity_reminder_enabled" class="setting-subitem">
            <span class="subitem-label">Дней без активности:</span>
            <select v-model.number="settings.inactivity_reminder_days" class="small-select" @change="saveField('inactivity_reminder_days')">
              <option :value="1">1</option>
              <option :value="2">2</option>
              <option :value="3">3</option>
              <option :value="5">5</option>
              <option :value="7">7</option>
              <option :value="10">10</option>
              <option :value="14">14</option>
              <option :value="21">21</option>
              <option :value="30">30</option>
            </select>
          </div>
        </div>
      </div>

      <div class="card" :class="{ disabled: !settings.alerts_enabled }">
        <div class="card-header">
          <h3 class="card-title">
            <Globe :size="18" />
            Часовой пояс
          </h3>
        </div>
        <div class="card-body">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">Текущий часовой пояс</div>
              <div class="setting-desc">{{ timezoneLabel }}</div>
            </div>
            <select v-model="settings.timezone" class="timezone-select" @change="saveField('timezone')">
              <option value="Europe/Kaliningrad">Калининград (UTC+2)</option>
              <option value="Europe/Moscow">Москва (UTC+3)</option>
              <option value="Europe/Samara">Самара (UTC+4)</option>
              <option value="Asia/Yekaterinburg">Екатеринбург (UTC+5)</option>
              <option value="Asia/Omsk">Омск (UTC+6)</option>
              <option value="Asia/Krasnoyarsk">Красноярск (UTC+7)</option>
              <option value="Asia/Irkutsk">Иркутск (UTC+8)</option>
              <option value="Asia/Yakutsk">Якутск (UTC+9)</option>
              <option value="Asia/Vladivostok">Владивосток (UTC+10)</option>
              <option value="Asia/Magadan">Магадан (UTC+11)</option>
              <option value="Asia/Kamchatka">Камчатка (UTC+12)</option>
              <option value="Europe/Kiev">Киев (UTC+2)</option>
              <option value="Europe/Minsk">Минск (UTC+3)</option>
              <option value="Asia/Almaty">Алматы (UTC+6)</option>
              <option value="Asia/Novosibirsk">Новосибирск (UTC+7)</option>
            </select>
          </div>
        </div>
      </div>

      <div class="save-status" :class="{ visible: saveMessage || isSaving }">
        <template v-if="isSaving">
          <div class="saving-spinner"></div>
          Сохранение...
        </template>
        <template v-else-if="saveMessage">
          <CheckCircle :size="16" />
          {{ saveMessage }}
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { getAlertSettings, updateAlertSettings } from '@/services/api'
import {
  ArrowLeft,
  Bell,
  Sun,
  Sunrise,
  Sunset,
  Zap,
  Flame,
  Trophy,
  TrendingUp,
  Clock,
  Calendar,
  BarChart3,
  Star,
  Gift,
  PieChart,
  Globe,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  UserX
} from 'lucide-vue-next'

const router = useRouter()
const appStore = useAppStore()

const defaultSettings = {
  alerts_enabled: true,
  timezone: 'Europe/Moscow',
  telegram_connected: false,
  telegram_username: '',
  morning_reminder_enabled: true,
  morning_reminder_time: '08:00',
  evening_reminder_enabled: true,
  evening_reminder_time: '21:00',
  streak_warning_enabled: true,
  streak_warning_min_days: 3,
  achievement_notification_enabled: true,
  deadline_reminder_enabled: true,
  deadline_reminder_days_before: 3,
  weekly_report_enabled: true,
  weekly_report_day: 0,
  weekly_report_time: '10:00',
  reward_reminder_enabled: true,
  ssp_reevaluation_enabled: true,
  ssp_reevaluation_day_of_month: 1,
  inactivity_reminder_enabled: true,
  inactivity_reminder_days: 3,
  goal_progress_enabled: true,
  overdue_steps_enabled: true
}

const settings = reactive({ ...defaultSettings })
const lastGoodSettings = ref(null)
const isLoading = ref(true)
const loadError = ref('')
const isSaving = ref(false)
const saveMessage = ref('')
const pendingChanges = ref({})

const telegramBotLink = computed(() => appStore.user?.telegram_bot_link || '')

const timezoneLabels = {
  'Europe/Kaliningrad': 'Калининград (UTC+2)',
  'Europe/Moscow': 'Москва (UTC+3)',
  'Europe/Samara': 'Самара (UTC+4)',
  'Asia/Yekaterinburg': 'Екатеринбург (UTC+5)',
  'Asia/Omsk': 'Омск (UTC+6)',
  'Asia/Krasnoyarsk': 'Красноярск (UTC+7)',
  'Asia/Irkutsk': 'Иркутск (UTC+8)',
  'Asia/Yakutsk': 'Якутск (UTC+9)',
  'Asia/Vladivostok': 'Владивосток (UTC+10)',
  'Asia/Magadan': 'Магадан (UTC+11)',
  'Asia/Kamchatka': 'Камчатка (UTC+12)',
  'Europe/Kiev': 'Киев (UTC+2)',
  'Europe/Minsk': 'Минск (UTC+3)',
  'Asia/Almaty': 'Алматы (UTC+6)',
  'Asia/Novosibirsk': 'Новосибирск (UTC+7)'
}

const timezoneLabel = computed(() => timezoneLabels[settings.timezone] || settings.timezone)

let saveTimeout = null

async function loadSettings() {
  isLoading.value = true
  loadError.value = ''
  
  try {
    const result = await getAlertSettings()
    
    if (result.status === 'ok' && result.data) {
      Object.assign(settings, { ...defaultSettings, ...result.data })
      lastGoodSettings.value = { ...settings }
    } else {
      throw new Error(result.error_data?.message || 'Не удалось загрузить настройки')
    }
  } catch (error) {
    console.error('[NotificationSettings] Failed to load settings:', error)
    loadError.value = error.message || 'Ошибка загрузки настроек'
  } finally {
    isLoading.value = false
  }
}

async function saveField(fieldName) {
  pendingChanges.value[fieldName] = settings[fieldName]
  
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  
  saveTimeout = setTimeout(async () => {
    isSaving.value = true
    saveMessage.value = ''
    
    const changesToSave = { ...pendingChanges.value }
    pendingChanges.value = {}
    
    try {
      const result = await updateAlertSettings(changesToSave)
      
      if (result.status === 'ok' && result.data) {
        Object.assign(settings, result.data)
        lastGoodSettings.value = { ...settings }
        showSaveMessage()
      } else {
        throw new Error(result.error_data?.message || 'Ошибка сохранения')
      }
    } catch (error) {
      console.error('[NotificationSettings] Failed to save settings:', error)
      if (lastGoodSettings.value) {
        Object.assign(settings, lastGoodSettings.value)
      }
      saveMessage.value = 'Ошибка сохранения'
      setTimeout(() => {
        saveMessage.value = ''
      }, 3000)
    } finally {
      isSaving.value = false
    }
  }, 500)
}

function showSaveMessage() {
  saveMessage.value = 'Сохранено'
  setTimeout(() => {
    saveMessage.value = ''
  }, 2000)
}

function goBack() {
  router.push('/app/settings')
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.notification-settings-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
  padding-bottom: 6rem;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem 0;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.2s;
}

.back-btn:hover {
  background: var(--bg-tertiary);
}

.page-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.saving-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state svg {
  color: var(--danger-color, #ef4444);
}

.retry-btn {
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: opacity 0.2s;
}

.card.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.master-toggle-card {
  background: linear-gradient(135deg, var(--primary-color) 0%, #8b5cf6 100%);
  border: none;
}

.master-toggle-card .setting-title,
.master-toggle-card .setting-desc {
  color: white;
}

.master-toggle-card .setting-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-header {
  padding: 1rem 1rem 0.5rem;
  border-bottom: none;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.card-title svg {
  color: var(--primary-color);
}

.card-body {
  padding: 0.5rem 1rem 1rem;
}

.master-toggle-card .card-body {
  padding: 1rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
}

.setting-item:last-child {
  border-bottom: none;
}

.master-toggle .setting-item {
  border-bottom: none;
}

.setting-info {
  flex: 1;
}

.setting-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.9375rem;
  color: var(--text-primary);
}

.setting-title svg {
  color: var(--primary-color);
  flex-shrink: 0;
}

.setting-desc {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin-top: 0.125rem;
}

.setting-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.setting-subitem {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0 0.75rem;
  padding-left: 1.5rem;
  flex-wrap: wrap;
}

.subitem-label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.small-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.8125rem;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
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
  transform: translateX(20px);
}

.time-input {
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  min-width: 90px;
}

.time-input.small {
  min-width: 80px;
  padding: 0.25rem 0.5rem;
  font-size: 0.8125rem;
}

.time-input:disabled {
  opacity: 0.5;
}

.timezone-select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  min-width: 180px;
}

.bot-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  margin-top: 0.75rem;
  font-size: 0.875rem;
}

.bot-status.warning {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.bot-status.success {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.bot-status .link-btn {
  margin-left: auto;
  color: inherit;
  text-decoration: underline;
  font-weight: 500;
}

.save-status {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 0.875rem;
  color: var(--text-primary);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
}

.save-status.visible {
  opacity: 1;
  visibility: visible;
}

.save-status svg {
  color: var(--success-color, #10b981);
}
</style>
