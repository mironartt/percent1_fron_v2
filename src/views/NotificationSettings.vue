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

    <div class="settings-content">
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
              <input type="checkbox" v-model="settings.enabled" @change="saveSettings">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div v-if="!isBotLinked" class="bot-status warning">
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
            <span>Бот привязан</span>
          </div>
        </div>
      </div>

      <div class="card" :class="{ disabled: !settings.enabled }">
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
                v-model="settings.morning.time" 
                class="time-input"
                :disabled="!settings.morning.enabled"
                @change="saveSettings"
              />
              <label class="toggle">
                <input type="checkbox" v-model="settings.morning.enabled" @change="saveSettings">
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
                v-model="settings.evening.time"
                class="time-input"
                :disabled="!settings.evening.enabled"
                @change="saveSettings"
              />
              <label class="toggle">
                <input type="checkbox" v-model="settings.evening.enabled" @change="saveSettings">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="card" :class="{ disabled: !settings.enabled }">
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
              <input type="checkbox" v-model="settings.streakWarning.enabled" @change="saveSettings">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div v-if="settings.streakWarning.enabled" class="setting-subitem">
            <span class="subitem-label">Мин. дней серии:</span>
            <select v-model.number="settings.streakWarning.minStreakDays" class="small-select" @change="saveSettings">
              <option :value="1">1</option>
              <option :value="3">3</option>
              <option :value="5">5</option>
              <option :value="7">7</option>
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
              <input type="checkbox" v-model="settings.achievements.enabled" @change="saveSettings">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">
                <TrendingUp :size="16" />
                Повышение уровня
              </div>
              <div class="setting-desc">Достигнут новый уровень</div>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="settings.levelUp.enabled" @change="saveSettings">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">
                <Clock :size="16" />
                Дедлайны задач
              </div>
              <div class="setting-desc">Напоминание за день до срока</div>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="settings.deadlineReminder.enabled" @change="saveSettings">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div class="card" :class="{ disabled: !settings.enabled }">
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
              <input type="checkbox" v-model="settings.weeklyReport.enabled" @change="saveSettings">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div v-if="settings.weeklyReport.enabled" class="setting-subitem">
            <span class="subitem-label">День:</span>
            <select v-model.number="settings.weeklyReport.dayOfWeek" class="small-select" @change="saveSettings">
              <option :value="0">Воскресенье</option>
              <option :value="1">Понедельник</option>
              <option :value="2">Вторник</option>
              <option :value="3">Среда</option>
              <option :value="4">Четверг</option>
              <option :value="5">Пятница</option>
              <option :value="6">Суббота</option>
            </select>
            <span class="subitem-label">Время:</span>
            <input 
              type="time" 
              v-model="settings.weeklyReport.time"
              class="time-input small"
              @change="saveSettings"
            />
          </div>
        </div>
      </div>

      <div class="card" :class="{ disabled: !settings.enabled }">
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
              <input type="checkbox" v-model="settings.xpRewardReminder.enabled" @change="saveSettings">
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
              <input type="checkbox" v-model="settings.sspReassessment.enabled" @change="saveSettings">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div class="card" :class="{ disabled: !settings.enabled }">
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
              <div class="setting-desc">{{ settings.timezone }}</div>
            </div>
            <select v-model="settings.timezone" class="timezone-select" @change="saveSettings">
              <option value="Europe/Moscow">Москва (UTC+3)</option>
              <option value="Europe/Kaliningrad">Калининград (UTC+2)</option>
              <option value="Europe/Samara">Самара (UTC+4)</option>
              <option value="Asia/Yekaterinburg">Екатеринбург (UTC+5)</option>
              <option value="Asia/Omsk">Омск (UTC+6)</option>
              <option value="Asia/Krasnoyarsk">Красноярск (UTC+7)</option>
              <option value="Asia/Irkutsk">Иркутск (UTC+8)</option>
              <option value="Asia/Yakutsk">Якутск (UTC+9)</option>
              <option value="Asia/Vladivostok">Владивосток (UTC+10)</option>
              <option value="Asia/Magadan">Магадан (UTC+11)</option>
              <option value="Asia/Kamchatka">Камчатка (UTC+12)</option>
            </select>
          </div>
        </div>
      </div>

      <div class="save-status" v-if="saveMessage">
        <CheckCircle :size="16" />
        {{ saveMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
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
  AlertCircle
} from 'lucide-vue-next'

const router = useRouter()
const appStore = useAppStore()

const STORAGE_KEY = 'onepercent_notification_settings'

const defaultSettings = {
  enabled: true,
  morning: {
    enabled: true,
    time: '08:00'
  },
  evening: {
    enabled: true,
    time: '21:00'
  },
  streakWarning: {
    enabled: true,
    minStreakDays: 3,
    hoursBeforeEnd: 2
  },
  achievements: {
    enabled: true
  },
  levelUp: {
    enabled: true
  },
  deadlineReminder: {
    enabled: true,
    daysBefore: 1
  },
  weeklyReport: {
    enabled: true,
    dayOfWeek: 0,
    time: '20:00'
  },
  xpRewardReminder: {
    enabled: false
  },
  sspReassessment: {
    enabled: false,
    intervalDays: 30
  },
  timezone: 'Europe/Moscow'
}

const settings = reactive({ ...defaultSettings })
const saveMessage = ref('')
const isBotLinked = ref(false)

const telegramBotLink = computed(() => appStore.user?.telegram_bot_link || '')

function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      Object.assign(settings, { ...defaultSettings, ...parsed })
    }
  } catch (e) {
    console.warn('[NotificationSettings] Failed to load settings:', e)
  }

  isBotLinked.value = !!appStore.user?.telegram_bot_link
}

function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    showSaveMessage()
  } catch (e) {
    console.warn('[NotificationSettings] Failed to save settings:', e)
  }
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

.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
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
  border-radius: 26px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.toggle input:checked + .toggle-slider {
  background-color: var(--primary-color);
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(22px);
}

.master-toggle-card .toggle-slider {
  background-color: rgba(255,255,255,0.3);
}

.master-toggle-card .toggle input:checked + .toggle-slider {
  background-color: rgba(255,255,255,0.9);
}

.master-toggle-card .toggle input:checked + .toggle-slider:before {
  background-color: var(--primary-color);
}

.time-input {
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  width: 90px;
}

.time-input.small {
  width: 80px;
}

.time-input:disabled {
  opacity: 0.5;
}

.small-select {
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
}

.timezone-select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
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
  background: rgba(251, 191, 36, 0.15);
  color: #f59e0b;
}

.bot-status.success {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.bot-status .link-btn {
  margin-left: auto;
  color: inherit;
  font-weight: 500;
  text-decoration: underline;
}

.save-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .notification-settings-container {
    padding: 0.75rem;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .setting-controls {
    width: 100%;
    justify-content: space-between;
  }

  .setting-subitem {
    padding-left: 0;
  }

  .timezone-select {
    width: 100%;
  }
}
</style>
