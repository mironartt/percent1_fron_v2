<template>
  <div class="habits-page">
    <header class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>
            <Flame :size="28" :stroke-width="1.5" />
            Мои привычки
          </h1>
          <p class="subtitle">Маленькие шаги к большим изменениям</p>
        </div>
        <button class="btn btn-primary" @click="openAddModal">
          <Plus :size="18" :stroke-width="1.5" />
          Добавить привычку
        </button>
      </div>
    </header>

    <div class="stats-bar">
      <div class="stat-item streak">
        <div class="stat-icon">
          <Zap :size="20" :stroke-width="1.5" />
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ habitStreak }}</span>
          <span class="stat-label">{{ pluralizeDays(habitStreak) }} подряд</span>
        </div>
      </div>
      <div class="stat-item today">
        <div class="stat-icon">
          <CheckCircle :size="20" :stroke-width="1.5" />
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ todayCompleted }}/{{ todayTotal }}</span>
          <span class="stat-label">сегодня</span>
        </div>
      </div>
      <div class="stat-item xp">
        <div class="stat-icon">
          <Sparkles :size="20" :stroke-width="1.5" />
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ weekXpFromHabits }}</span>
          <span class="stat-label">XP за неделю</span>
        </div>
      </div>
      <button class="stat-item mode clickable" @click="showSettingsModal = true" title="Нажмите для настройки геймификации">
        <div class="stat-icon" :class="gameSettings.difficultyMode">
          <Shield :size="20" :stroke-width="1.5" />
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ difficultyLabel }}</span>
          <span class="stat-label">режим</span>
        </div>
        <div class="stat-action">
          <Settings :size="14" :stroke-width="1.5" />
        </div>
      </button>
    </div>

    <div class="analytics-section" v-if="allHabits.length > 0">
      <div class="analytics-header">
        <h3>
          <TrendingUp :size="18" :stroke-width="1.5" />
          Аналитика
        </h3>
      </div>
      
      <div class="analytics-grid">
        <div class="analytics-card completion">
          <div class="card-header">
            <span class="card-title">Выполнение</span>
          </div>
          <div class="completion-stats">
            <div class="completion-item">
              <span class="completion-value">{{ weekCompletionRate }}%</span>
              <span class="completion-label">за 7 дней</span>
            </div>
            <div class="completion-item">
              <span class="completion-value">{{ monthCompletionRate }}%</span>
              <span class="completion-label">за 30 дней</span>
            </div>
          </div>
          <div class="trend-chart">
            <div 
              v-for="(day, index) in last14Days" 
              :key="index" 
              class="trend-bar"
              :class="{ filled: day.completed > 0, partial: day.completed > 0 && day.completed < day.total }"
              :style="{ height: day.total > 0 ? (day.completed / day.total * 100) + '%' : '10%' }"
              :title="`${day.date}: ${day.completed}/${day.total}`"
            ></div>
          </div>
        </div>

        <div class="analytics-card calendar">
          <div class="card-header">
            <span class="card-title">Календарь</span>
            <span class="card-subtitle">последние 4 недели</span>
          </div>
          <div class="heatmap">
            <div class="heatmap-row" v-for="week in calendarWeeks" :key="week.weekNum">
              <div 
                v-for="day in week.days" 
                :key="day.date"
                class="heatmap-cell"
                :class="getHeatmapClass(day)"
                :title="`${formatCalendarDate(day.date)}: ${day.completed}/${day.total}`"
              ></div>
            </div>
          </div>
          <div class="heatmap-legend">
            <span>Меньше</span>
            <div class="legend-scale">
              <div class="legend-cell level-0"></div>
              <div class="legend-cell level-1"></div>
              <div class="legend-cell level-2"></div>
              <div class="legend-cell level-3"></div>
            </div>
            <span>Больше</span>
          </div>
        </div>

        <div class="analytics-card achievements">
          <div class="card-header">
            <span class="card-title">Достижения</span>
          </div>
          <div class="badges-list">
            <div 
              v-for="badge in habitBadges" 
              :key="badge.id"
              class="badge-item"
              :class="{ unlocked: badge.unlocked, locked: !badge.unlocked }"
            >
              <span class="badge-icon">{{ badge.icon }}</span>
              <div class="badge-info">
                <span class="badge-name">{{ badge.name }}</span>
                <span class="badge-desc">{{ badge.description }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="habits-content">
      <div class="habits-list" v-if="allHabits.length > 0">
        <div class="week-header">
          <span class="day-label" v-for="day in weekDays" :key="day.key">{{ day.short }}</span>
        </div>
        
        <div 
          v-for="habit in allHabits" 
          :key="habit.id"
          class="habit-card"
          :class="{ completed: isHabitCompletedToday(habit), 'not-scheduled': !isScheduledForToday(habit) }"
        >
          <div class="habit-main" @click="toggleHabitCompletion(habit)">
            <div class="habit-check">
              <div class="checkbox" :class="{ checked: isHabitCompletedToday(habit), disabled: !isScheduledForToday(habit) }">
                <Check v-if="isHabitCompletedToday(habit)" :size="14" :stroke-width="2.5" />
              </div>
            </div>
            <span class="habit-icon">{{ habit.icon }}</span>
            <div class="habit-info">
              <span class="habit-name">{{ habit.name }}</span>
              <div class="habit-meta">
                <span class="xp-badge positive">+{{ habit.xpReward }} XP</span>
                <span v-if="habit.xpPenalty && gameSettings.penaltiesEnabled" class="xp-badge negative">
                  -{{ habit.xpPenalty }} XP
                </span>
                <span class="frequency-badge">{{ getFrequencyLabel(habit) }}</span>
              </div>
            </div>
            <transition name="xp-pop">
              <span v-if="showXpPopup === habit.id" class="xp-popup">+{{ habit.xpReward }} XP</span>
            </transition>
          </div>
          
          <div class="habit-schedule">
            <div 
              v-for="day in weekDays" 
              :key="day.key"
              class="schedule-dot"
              :class="{ 
                active: isScheduledForDay(habit, day.key),
                completed: isCompletedOnDay(habit, day.date),
                today: day.isToday
              }"
            >
              <div class="dot-inner"></div>
            </div>
          </div>
          
          <div class="habit-actions">
            <button class="btn-icon" @click.stop="editHabit(habit)" title="Редактировать">
              <Pencil :size="16" :stroke-width="1.5" />
            </button>
            <button class="btn-icon" @click.stop="archiveHabit(habit)" title="Архивировать">
              <Archive :size="16" :stroke-width="1.5" />
            </button>
            <button class="btn-icon danger" @click.stop="confirmDeleteHabit(habit)" title="Удалить">
              <Trash2 :size="16" :stroke-width="1.5" />
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">🔥</div>
        <h3>Начните формировать привычки</h3>
        <p>Добавьте регулярные действия, которые хотите закрепить в своей жизни</p>
        <button class="btn btn-primary" @click="openAddModal">
          <Plus :size="18" :stroke-width="1.5" />
          Создать первую привычку
        </button>
      </div>
    </div>

    <div class="ai-coach-hint" v-if="coachHint">
      <div class="hint-icon">
        <Bot :size="20" :stroke-width="1.5" />
      </div>
      <p>{{ coachHint }}</p>
      <button class="btn-icon" @click="coachHint = null">
        <X :size="16" :stroke-width="1.5" />
      </button>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ editingHabit ? 'Редактировать привычку' : 'Новая привычка' }}</h3>
            <button class="btn-close" @click="closeModal">
              <X :size="20" :stroke-width="1.5" />
            </button>
          </div>
          
          <div class="modal-content">
            <div class="form-group">
              <label>Иконка</label>
              <div class="icon-grid">
                <button 
                  v-for="icon in habitIcons" 
                  :key="icon"
                  class="icon-option"
                  :class="{ selected: formData.icon === icon }"
                  @click="formData.icon = icon"
                >
                  {{ icon }}
                </button>
              </div>
            </div>
            
            <div class="form-group">
              <label>Название</label>
              <input 
                v-model="formData.name"
                type="text"
                class="form-input"
                placeholder="Например: Утренняя пробежка"
              />
            </div>
            
            <div class="form-group">
              <label>Описание (необязательно)</label>
              <textarea 
                v-model="formData.description"
                class="form-input"
                rows="2"
                placeholder="Зачем вам эта привычка?"
              />
            </div>
            
            <div class="form-row">
              <div class="form-group half">
                <label>Награда за выполнение</label>
                <div class="input-with-suffix">
                  <input 
                    v-model.number="formData.xpReward"
                    type="number"
                    min="1"
                    max="100"
                    class="form-input"
                  />
                  <span class="suffix">XP</span>
                </div>
              </div>
              
              <div class="form-group half">
                <label>
                  Штраф за пропуск
                  <span class="optional">(опционально)</span>
                </label>
                <div class="input-with-suffix">
                  <input 
                    v-model.number="formData.xpPenalty"
                    type="number"
                    min="0"
                    max="50"
                    class="form-input"
                    :disabled="!gameSettings.penaltiesEnabled"
                  />
                  <span class="suffix">XP</span>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label>Расписание</label>
              <div class="schedule-options">
                <button 
                  class="schedule-btn"
                  :class="{ active: formData.frequencyType === 'daily' }"
                  @click="formData.frequencyType = 'daily'"
                >
                  Ежедневно
                </button>
                <button 
                  class="schedule-btn"
                  :class="{ active: formData.frequencyType === 'weekdays' }"
                  @click="formData.frequencyType = 'weekdays'"
                >
                  Будни
                </button>
                <button 
                  class="schedule-btn"
                  :class="{ active: formData.frequencyType === 'weekends' }"
                  @click="formData.frequencyType = 'weekends'"
                >
                  Выходные
                </button>
                <button 
                  class="schedule-btn"
                  :class="{ active: formData.frequencyType === 'custom' }"
                  @click="formData.frequencyType = 'custom'"
                >
                  По дням
                </button>
              </div>
              
              <div v-if="formData.frequencyType === 'custom'" class="days-selector">
                <button 
                  v-for="day in weekDaysConfig" 
                  :key="day.key"
                  class="day-btn"
                  :class="{ active: formData.scheduleDays.includes(day.key) }"
                  @click="toggleDay(day.key)"
                >
                  {{ day.short }}
                </button>
              </div>
            </div>
            
            <div class="form-group">
              <label>Напоминание (необязательно)</label>
              <input 
                v-model="formData.reminderTime"
                type="time"
                class="form-input time-input"
              />
            </div>
          </div>
          
          <div class="modal-footer">
            <button v-if="editingHabit" class="btn btn-danger" @click="deleteHabit">
              <Trash2 :size="16" :stroke-width="1.5" />
              Удалить
            </button>
            <div class="spacer"></div>
            <button class="btn btn-secondary" @click="closeModal">Отмена</button>
            <button 
              class="btn btn-primary" 
              @click="saveHabit"
              :disabled="!formData.name.trim()"
            >
              {{ editingHabit ? 'Сохранить' : 'Создать' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showSettingsModal" class="modal-overlay" @click.self="showSettingsModal = false">
        <div class="modal-container modal-settings">
          <div class="modal-header">
            <h3>
              <Settings :size="20" :stroke-width="1.5" />
              Настройки геймификации
            </h3>
            <button class="btn-close" @click="showSettingsModal = false">
              <X :size="20" :stroke-width="1.5" />
            </button>
          </div>
          
          <div class="modal-content">
            <div class="settings-section">
              <div class="section-header">
                <h4>Режим сложности</h4>
                <span class="section-hint">Выберите подходящий уровень</span>
              </div>
              
              <div class="difficulty-options">
                <button 
                  class="difficulty-btn soft"
                  :class="{ active: gameSettings.difficultyMode === 'soft' }"
                  @click="setDifficulty('soft')"
                >
                  <div class="diff-icon">🌱</div>
                  <div class="diff-info">
                    <span class="diff-name">Мягкий</span>
                    <span class="diff-desc">Только награды, без штрафов</span>
                    <span class="diff-details">Идеально для начинающих. Получайте XP за выполненные привычки без риска потерять прогресс.</span>
                  </div>
                  <div class="diff-check" v-if="gameSettings.difficultyMode === 'soft'">
                    <Check :size="16" :stroke-width="2.5" />
                  </div>
                </button>
                
                <button 
                  class="difficulty-btn balanced"
                  :class="{ active: gameSettings.difficultyMode === 'balanced' }"
                  @click="setDifficulty('balanced')"
                >
                  <div class="diff-icon">⚖️</div>
                  <div class="diff-info">
                    <span class="diff-name">Сбалансированный</span>
                    <span class="diff-desc">Штрафы 50% от награды</span>
                    <span class="diff-details">Баланс мотивации и ответственности. Пропуск привычки снимает половину XP награды. Амнистия 1 раз в неделю.</span>
                  </div>
                  <div class="diff-check" v-if="gameSettings.difficultyMode === 'balanced'">
                    <Check :size="16" :stroke-width="2.5" />
                  </div>
                </button>
                
                <button 
                  class="difficulty-btn hardcore"
                  :class="{ active: gameSettings.difficultyMode === 'hardcore' }"
                  @click="setDifficulty('hardcore')"
                >
                  <div class="diff-icon">🔥</div>
                  <div class="diff-info">
                    <span class="diff-name">Хардкор</span>
                    <span class="diff-desc">Штрафы равны награде</span>
                    <span class="diff-details">Максимальная ответственность. Пропуск = полный штраф. Быстрый прогресс при дисциплине, высокий риск при срывах.</span>
                  </div>
                  <div class="diff-check" v-if="gameSettings.difficultyMode === 'hardcore'">
                    <Check :size="16" :stroke-width="2.5" />
                  </div>
                </button>
              </div>
            </div>
            
            <div class="settings-section">
              <div class="section-header">
                <h4>Санкции</h4>
                <span class="section-hint">Включите для дополнительной мотивации</span>
              </div>
              <p class="settings-info">
                <Info :size="14" :stroke-width="1.5" />
                Штрафы снимают XP, но ваш баланс никогда не уйдёт ниже 0
              </p>
              
              <div class="toggle-group">
                <label class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">Штрафы за пропуск привычек</span>
                    <span class="toggle-hint">Снимает XP если запланированная привычка не выполнена</span>
                  </div>
                  <input type="checkbox" v-model="gameSettings.penaltiesEnabled" @change="saveGameSettings" />
                  <span class="toggle"></span>
                </label>
                
                <label class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">Штрафы за дневник</span>
                    <span class="toggle-hint">Снимает XP если дневник не заполнен за день</span>
                  </div>
                  <input type="checkbox" v-model="gameSettings.journalPenalty" @change="saveGameSettings" />
                  <span class="toggle"></span>
                </label>
                
                <label class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">Штрафы за планирование</span>
                    <span class="toggle-hint">Снимает XP если нет плана на следующий день</span>
                  </div>
                  <input type="checkbox" v-model="gameSettings.planningPenalty" @change="saveGameSettings" />
                  <span class="toggle"></span>
                </label>
              </div>
            </div>
            
            <div class="settings-section">
              <div class="section-header">
                <h4>AI-коуч</h4>
                <span class="section-hint">Персональный помощник</span>
              </div>
              
              <div class="toggle-group">
                <label class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-label">Подсказки и напоминания</span>
                    <span class="toggle-hint">Получайте советы, мотивацию и напоминания от AI-ментора</span>
                  </div>
                  <input type="checkbox" v-model="gameSettings.aiCoachEnabled" @change="saveGameSettings" />
                  <span class="toggle"></span>
                </label>
              </div>
              
              <div class="amnesty-info" v-if="gameSettings.penaltiesEnabled">
                <Gift :size="18" :stroke-width="1.5" />
                <div class="amnesty-content">
                  <span class="amnesty-title">Амнистия</span>
                  <span class="amnesty-desc">{{ weeklyAmnestyAvailable ? 'Доступна 1 раз в неделю — отменяет все штрафы за день' : 'Использована на этой неделе' }}</span>
                </div>
                <button 
                  v-if="weeklyAmnestyAvailable" 
                  class="btn btn-sm btn-secondary"
                  @click="useAmnesty"
                >
                  Активировать
                </button>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn btn-primary" @click="showSettingsModal = false">Готово</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import { useXpStore, XP_REWARDS } from '../stores/xp'
import { useToastStore } from '../stores/toast'
import { DEBUG_MODE } from '@/config/settings.js'
import { 
  Flame, Plus, Zap, CheckCircle, Sparkles, Shield, Bot,
  Check, Pencil, X, Trash2, Settings, Gift, Archive, Info, TrendingUp, Calendar, Award
} from 'lucide-vue-next'

const appStore = useAppStore()
const xpStore = useXpStore()
const toast = useToastStore()

const showModal = ref(false)
const showSettingsModal = ref(false)
const editingHabit = ref(null)
const showXpPopup = ref(null)
const coachHint = ref(null)

const weekDaysConfig = [
  { key: 1, name: 'Понедельник', short: 'Пн' },
  { key: 2, name: 'Вторник', short: 'Вт' },
  { key: 3, name: 'Среда', short: 'Ср' },
  { key: 4, name: 'Четверг', short: 'Чт' },
  { key: 5, name: 'Пятница', short: 'Пт' },
  { key: 6, name: 'Суббота', short: 'Сб' },
  { key: 0, name: 'Воскресенье', short: 'Вс' }
]

const habitIcons = [
  '🏃', '📖', '🧘', '💪', '🎯', '📝', '💧', '🍎',
  '😴', '🧠', '🎨', '🎵', '🌅', '🚶', '🧹', '💼'
]

const formData = ref({
  name: '',
  icon: '🔥',
  description: '',
  xpReward: 5,
  xpPenalty: 0,
  frequencyType: 'daily',
  scheduleDays: [1, 2, 3, 4, 5, 6, 0],
  reminderTime: ''
})

const gameSettings = ref({
  difficultyMode: 'soft',
  penaltiesEnabled: false,
  journalPenalty: false,
  planningPenalty: false,
  aiCoachEnabled: true,
  weeklyAmnestyUsed: null
})

const weekDays = computed(() => {
  const today = new Date()
  const currentDay = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((currentDay + 6) % 7))
  
  return weekDaysConfig.map((day, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return {
      ...day,
      date: date.toISOString().split('T')[0],
      isToday: date.toDateString() === today.toDateString()
    }
  })
})

const allHabits = computed(() => {
  return appStore.habits.filter(h => !h.archived).map(habit => ({
    ...habit,
    frequencyType: habit.frequencyType || 'daily',
    scheduleDays: habit.scheduleDays || [1, 2, 3, 4, 5, 6, 0],
    xpPenalty: habit.xpPenalty || 0
  }))
})

const habitStreak = computed(() => appStore.habitStreak)
const scheduledToday = computed(() => {
  const today = new Date().getDay()
  return allHabits.value.filter(h => isScheduledForDay(h, today))
})

const todayCompleted = computed(() => {
  const todayStr = new Date().toISOString().split('T')[0]
  const completedIds = appStore.habitLog[todayStr] || []
  return scheduledToday.value.filter(h => completedIds.includes(h.id)).length
})

const todayTotal = computed(() => scheduledToday.value.length)

const weekXpFromHabits = computed(() => {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  return xpStore.xpHistory
    .filter(e => e.source === 'habit_completed' && new Date(e.timestamp) >= weekAgo)
    .reduce((sum, e) => sum + e.amount, 0)
})

const difficultyLabel = computed(() => {
  const labels = { soft: 'Мягкий', balanced: 'Баланс', hardcore: 'Хардкор' }
  return labels[gameSettings.value.difficultyMode]
})

const weeklyAmnestyAvailable = computed(() => {
  if (!gameSettings.value.weeklyAmnestyUsed) return true
  const usedDate = new Date(gameSettings.value.weeklyAmnestyUsed)
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  return usedDate < weekAgo
})

function isScheduledForDay(habit, dayKey) {
  if (habit.frequencyType === 'daily') return true
  if (habit.frequencyType === 'weekdays') return dayKey >= 1 && dayKey <= 5
  if (habit.frequencyType === 'weekends') return dayKey === 0 || dayKey === 6
  return habit.scheduleDays?.includes(dayKey)
}

function getCompletionForDate(dateStr) {
  const dayOfWeek = new Date(dateStr).getDay()
  const scheduledForDay = allHabits.value.filter(h => isScheduledForDay(h, dayOfWeek))
  const completedIds = appStore.habitLog[dateStr] || []
  const completed = scheduledForDay.filter(h => completedIds.includes(h.id)).length
  return { completed, total: scheduledForDay.length }
}

const last14Days = computed(() => {
  const days = []
  const today = new Date()
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const { completed, total } = getCompletionForDate(dateStr)
    days.push({ date: dateStr, completed, total })
  }
  return days
})

const weekCompletionRate = computed(() => {
  let totalCompleted = 0
  let totalScheduled = 0
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const { completed, total } = getCompletionForDate(dateStr)
    totalCompleted += completed
    totalScheduled += total
  }
  return totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0
})

const monthCompletionRate = computed(() => {
  let totalCompleted = 0
  let totalScheduled = 0
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const { completed, total } = getCompletionForDate(dateStr)
    totalCompleted += completed
    totalScheduled += total
  }
  return totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0
})

const calendarWeeks = computed(() => {
  const weeks = []
  const today = new Date()
  for (let w = 3; w >= 0; w--) {
    const weekDays = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(today)
      date.setDate(date.getDate() - (w * 7 + (6 - d)))
      const dateStr = date.toISOString().split('T')[0]
      const { completed, total } = getCompletionForDate(dateStr)
      weekDays.push({ date: dateStr, completed, total })
    }
    weeks.push({ weekNum: 3 - w, days: weekDays })
  }
  return weeks
})

function getHeatmapClass(day) {
  if (day.total === 0) return 'level-0'
  const rate = day.completed / day.total
  if (rate === 0) return 'level-0'
  if (rate < 0.5) return 'level-1'
  if (rate < 1) return 'level-2'
  return 'level-3'
}

function formatCalendarDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

const habitBadges = computed(() => {
  const streak = habitStreak.value
  const badges = [
    { id: 'week', icon: '🔥', name: '7 дней подряд', description: 'Неделя без пропусков', unlocked: streak >= 7 },
    { id: 'fortnight', icon: '⚡', name: '14 дней подряд', description: 'Две недели дисциплины', unlocked: streak >= 14 },
    { id: 'month', icon: '🏆', name: '30 дней подряд', description: 'Месяц стабильности', unlocked: streak >= 30 },
    { id: 'perfectWeek', icon: '💎', name: 'Идеальная неделя', description: '100% выполнение за 7 дней', unlocked: weekCompletionRate.value === 100 },
  ]
  return badges
})

function isScheduledForToday(habit) {
  const today = new Date().getDay()
  return isScheduledForDay(habit, today)
}

function isHabitCompletedToday(habit) {
  const today = new Date().toISOString().split('T')[0]
  return appStore.habitLog[today]?.includes(habit.id)
}

function isCompletedOnDay(habit, dateStr) {
  return appStore.habitLog[dateStr]?.includes(habit.id)
}

function getFrequencyLabel(habit) {
  if (habit.frequencyType === 'daily') return 'Ежедневно'
  if (habit.frequencyType === 'weekdays') return 'Будни'
  if (habit.frequencyType === 'weekends') return 'Выходные'
  const days = habit.scheduleDays?.length || 0
  return `${days} ${pluralizeDaysWord(days)} в неделю`
}

function pluralizeDays(n) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'день'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'дня'
  return 'дней'
}

function pluralizeDaysWord(n) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'день'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'дня'
  return 'дней'
}

function toggleHabitCompletion(habit) {
  if (!isScheduledForToday(habit)) {
    toast.showToast({ title: 'Эта привычка не запланирована на сегодня', type: 'info' })
    return
  }
  
  const result = appStore.toggleHabit(habit.id)
  
  if (result.completed) {
    const xpAmount = habit.xpReward || XP_REWARDS.HABIT_COMPLETED
    xpStore.awardXP(xpAmount, 'habit_completed', { 
      habitId: habit.id, 
      habitName: habit.name 
    })
    
    showXpPopup.value = habit.id
    setTimeout(() => {
      showXpPopup.value = null
    }, 1200)
  } else {
    const lastEvent = xpStore.xpHistory.find(
      e => e.source === 'habit_completed' && 
           e.metadata?.habitId === habit.id &&
           new Date(e.timestamp).toDateString() === new Date().toDateString()
    )
    if (lastEvent) {
      xpStore.revokeXP(lastEvent.id)
    }
  }
}

function openAddModal() {
  editingHabit.value = null
  formData.value = {
    name: '',
    icon: '🔥',
    description: '',
    xpReward: 5,
    xpPenalty: gameSettings.value.difficultyMode === 'hardcore' ? 5 : 
               gameSettings.value.difficultyMode === 'balanced' ? 3 : 0,
    frequencyType: 'daily',
    scheduleDays: [1, 2, 3, 4, 5, 6, 0],
    reminderTime: ''
  }
  showModal.value = true
}

function editHabit(habit) {
  editingHabit.value = habit
  formData.value = {
    name: habit.name,
    icon: habit.icon,
    description: habit.description || '',
    xpReward: habit.xpReward || 5,
    xpPenalty: habit.xpPenalty || 0,
    frequencyType: habit.frequencyType || 'daily',
    scheduleDays: habit.scheduleDays || [1, 2, 3, 4, 5, 6, 0],
    reminderTime: habit.reminderTime || ''
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingHabit.value = null
}

function toggleDay(dayKey) {
  const index = formData.value.scheduleDays.indexOf(dayKey)
  if (index === -1) {
    formData.value.scheduleDays.push(dayKey)
  } else if (formData.value.scheduleDays.length > 1) {
    formData.value.scheduleDays.splice(index, 1)
  }
}

function saveHabit() {
  if (!formData.value.name.trim()) return
  
  const habitData = {
    name: formData.value.name.trim(),
    icon: formData.value.icon,
    description: formData.value.description,
    xpReward: formData.value.xpReward,
    xpPenalty: formData.value.xpPenalty,
    frequencyType: formData.value.frequencyType,
    scheduleDays: formData.value.frequencyType === 'custom' ? formData.value.scheduleDays :
                  formData.value.frequencyType === 'weekdays' ? [1, 2, 3, 4, 5] :
                  formData.value.frequencyType === 'weekends' ? [0, 6] : [0, 1, 2, 3, 4, 5, 6],
    reminderTime: formData.value.reminderTime
  }
  
  if (editingHabit.value) {
    appStore.updateHabit(editingHabit.value.id, habitData)
    toast.showToast({ title: 'Привычка обновлена', type: 'success' })
  } else {
    appStore.addHabit(habitData)
    toast.showToast({ title: 'Привычка создана', type: 'success' })
    
    if (allHabits.value.length === 0 && gameSettings.value.aiCoachEnabled) {
      coachHint.value = 'Отлично! Первый шаг сделан. Старайтесь выполнять привычку каждый день — так она закрепится быстрее.'
    }
  }
  
  closeModal()
}

function deleteHabit() {
  if (editingHabit.value) {
    appStore.removeHabit(editingHabit.value.id)
    toast.showToast({ title: 'Привычка удалена', type: 'info' })
    closeModal()
  }
}

function archiveHabit(habit) {
  appStore.updateHabit(habit.id, { archived: true })
  toast.showToast({ title: 'Привычка архивирована', type: 'info' })
}

function confirmDeleteHabit(habit) {
  if (confirm(`Удалить привычку "${habit.name}"?`)) {
    appStore.removeHabit(habit.id)
    toast.showToast({ title: 'Привычка удалена', type: 'info' })
  }
}

function setDifficulty(mode) {
  gameSettings.value.difficultyMode = mode
  gameSettings.value.penaltiesEnabled = mode !== 'soft'
  saveGameSettings()
}

function saveGameSettings() {
  try {
    localStorage.setItem('onepercent_game_settings', JSON.stringify(gameSettings.value))
    if (DEBUG_MODE) {
      console.log('[Habits] Game settings saved:', gameSettings.value)
    }
  } catch (e) {
    console.error('[Habits] Failed to save game settings:', e)
  }
}

function loadGameSettings() {
  try {
    const stored = localStorage.getItem('onepercent_game_settings')
    if (stored) {
      gameSettings.value = { ...gameSettings.value, ...JSON.parse(stored) }
    }
  } catch (e) {
    console.error('[Habits] Failed to load game settings:', e)
  }
}

function useAmnesty() {
  gameSettings.value.weeklyAmnestyUsed = new Date().toISOString()
  saveGameSettings()
  toast.showToast({ title: 'Амнистия активирована!', message: 'Штрафы за сегодня отменены', type: 'success' })
}

onMounted(() => {
  loadGameSettings()
  
  if (gameSettings.value.aiCoachEnabled && habitStreak.value >= 7 && habitStreak.value % 7 === 0) {
    coachHint.value = `Потрясающе! ${habitStreak.value} дней подряд — это уже настоящая привычка! Так держать!`
  }
})
</script>

<style scoped>
.habits-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.title-section h1 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.75rem;
  margin: 0 0 0.25rem 0;
}

.title-section h1 svg {
  color: #f97316;
}

.subtitle {
  color: var(--text-muted);
  margin: 0;
}

.stats-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 640px) {
  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-item {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stat-item.mode {
  cursor: pointer;
  transition: all 0.2s ease;
}

.stat-item.mode:hover {
  border-color: var(--primary-color);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-item.streak .stat-icon {
  background: rgba(234, 179, 8, 0.1);
  color: #eab308;
}

.stat-item.today .stat-icon {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.stat-item.xp .stat-icon {
  background: rgba(124, 58, 237, 0.1);
  color: #7c3aed;
}

.stat-item.mode .stat-icon {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.stat-item.mode .stat-icon.soft { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
.stat-item.mode .stat-icon.balanced { background: rgba(234, 179, 8, 0.1); color: #eab308; }
.stat-item.mode .stat-icon.hardcore { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.habits-content {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.week-header {
  display: flex;
  justify-content: flex-end;
  padding-right: 48px;
  margin-bottom: 0.5rem;
}

.day-label {
  width: 32px;
  text-align: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
}

.habits-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.habit-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.habit-card:hover {
  background: var(--bg-tertiary, rgba(0,0,0,0.05));
}

.habit-card.completed {
  background: rgba(34, 197, 94, 0.1);
}

.habit-card.not-scheduled {
  opacity: 0.5;
}

.habit-main {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  position: relative;
}

.habit-check {
  flex-shrink: 0;
}

.checkbox {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: var(--card-bg);
}

.checkbox.checked {
  background: var(--success-color, #22c55e);
  border-color: var(--success-color, #22c55e);
  color: white;
}

.checkbox.disabled {
  opacity: 0.4;
}

.habit-icon {
  font-size: 1.5rem;
}

.habit-info {
  flex: 1;
  min-width: 0;
}

.habit-name {
  display: block;
  font-weight: 500;
}

.habit-card.completed .habit-name {
  text-decoration: line-through;
  opacity: 0.7;
}

.habit-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.xp-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.xp-badge.positive {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.xp-badge.negative {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.frequency-badge {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.xp-popup {
  position: absolute;
  right: 0;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
}

.xp-pop-enter-active {
  animation: xp-bounce 0.5s ease;
}

.xp-pop-leave-active {
  transition: all 0.3s ease;
}

.xp-pop-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes xp-bounce {
  0% { transform: scale(0.5) translateY(10px); opacity: 0; }
  50% { transform: scale(1.2) translateY(-5px); }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

.habit-schedule {
  display: flex;
  gap: 4px;
}

.schedule-dot {
  width: 32px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dot-inner {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border-color);
  transition: all 0.2s ease;
}

.schedule-dot.active .dot-inner {
  background: var(--text-muted);
}

.schedule-dot.completed .dot-inner {
  background: #22c55e;
  width: 10px;
  height: 10px;
}

.schedule-dot.today .dot-inner {
  box-shadow: 0 0 0 2px var(--primary-color);
}

.habit-actions {
  flex-shrink: 0;
  display: flex;
  gap: 0.25rem;
}

.btn-icon {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--bg-secondary);
}

.btn-icon.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.stat-item.clickable {
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.stat-item.clickable:hover {
  border-color: var(--primary-color);
  background: rgba(124, 58, 237, 0.05);
}

.stat-action {
  margin-left: auto;
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.stat-item.clickable:hover .stat-action {
  color: var(--primary-color);
}

.analytics-section {
  margin-bottom: 1.5rem;
}

.analytics-header {
  margin-bottom: 1rem;
}

.analytics-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.analytics-header h3 svg {
  color: var(--primary-color);
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.analytics-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid var(--border-color);
}

.analytics-card .card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.analytics-card .card-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.analytics-card .card-subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.completion-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.completion-item {
  display: flex;
  flex-direction: column;
}

.completion-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.completion-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.trend-chart {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 40px;
}

.trend-bar {
  flex: 1;
  min-height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  transition: all 0.2s ease;
}

.trend-bar.filled {
  background: var(--primary-color);
}

.trend-bar.partial {
  background: rgba(124, 58, 237, 0.5);
}

.heatmap {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.heatmap-row {
  display: flex;
  gap: 3px;
}

.heatmap-cell {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  background: var(--bg-secondary);
  transition: all 0.2s ease;
}

.heatmap-cell.level-0 { background: var(--bg-secondary); }
.heatmap-cell.level-1 { background: rgba(34, 197, 94, 0.3); }
.heatmap-cell.level-2 { background: rgba(34, 197, 94, 0.6); }
.heatmap-cell.level-3 { background: #22c55e; }

.heatmap-legend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  font-size: 0.7rem;
  color: var(--text-muted);
}

.legend-scale {
  display: flex;
  gap: 2px;
}

.legend-cell {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-cell.level-0 { background: var(--bg-secondary); }
.legend-cell.level-1 { background: rgba(34, 197, 94, 0.3); }
.legend-cell.level-2 { background: rgba(34, 197, 94, 0.6); }
.legend-cell.level-3 { background: #22c55e; }

.badges-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.badge-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 8px;
  background: var(--bg-secondary);
  transition: all 0.2s ease;
}

.badge-item.unlocked {
  background: rgba(34, 197, 94, 0.1);
}

.badge-item.locked {
  opacity: 0.5;
}

.badge-icon {
  font-size: 1.25rem;
}

.badge-info {
  display: flex;
  flex-direction: column;
}

.badge-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.badge-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.section-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.settings-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(124, 58, 237, 0.05);
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.settings-info svg {
  color: var(--primary-color);
  flex-shrink: 0;
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.toggle-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.toggle-label {
  font-weight: 500;
  color: var(--text-primary);
}

.toggle-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.15rem;
}

.diff-details {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
  line-height: 1.4;
}

.diff-check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #22c55e;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.amnesty-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.amnesty-title {
  font-weight: 600;
  color: var(--text-primary);
}

.amnesty-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.ai-coach-hint {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(168, 85, 247, 0.1));
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: 12px;
}

.hint-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(124, 58, 237, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7c3aed;
  flex-shrink: 0;
}

.ai-coach-hint p {
  flex: 1;
  margin: 0;
  font-size: 0.95rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  filter: brightness(1.1);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-sm {
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.modal-container {
  background: var(--card-bg);
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-settings {
  max-width: 520px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.15rem;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  padding: 0.4rem;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: 6px;
}

.modal-content {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

.spacer {
  flex: 1;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.form-group .optional {
  font-weight: 400;
  color: var(--text-muted);
}

.form-input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-group.half {
  flex: 1;
}

.input-with-suffix {
  position: relative;
}

.input-with-suffix .form-input {
  padding-right: 2.5rem;
}

.input-with-suffix .suffix {
  position: absolute;
  right: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.85rem;
  color: var(--text-muted);
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.25rem;
}

.icon-option {
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  border-radius: 8px;
  font-size: 1.35rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-option:hover {
  background: var(--bg-tertiary, rgba(0,0,0,0.05));
}

.icon-option.selected {
  background: var(--primary-color);
}

.schedule-options {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.schedule-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-primary);
}

.schedule-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.days-selector {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.day-btn {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-primary);
}

.day-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.time-input {
  max-width: 150px;
}

.settings-section {
  margin-bottom: 1.5rem;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.settings-section h4 {
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
}

.settings-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0 0 1rem 0;
}

.difficulty-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.difficulty-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.difficulty-btn:hover {
  border-color: var(--text-muted);
}

.difficulty-btn.active {
  border-color: var(--primary-color);
  background: rgba(124, 58, 237, 0.1);
}

.diff-icon {
  font-size: 1.5rem;
}

.diff-info {
  display: flex;
  flex-direction: column;
}

.diff-name {
  font-weight: 600;
  color: var(--text-primary);
}

.diff-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
}

.toggle-row:last-child {
  border-bottom: none;
}

.toggle-row input[type="checkbox"] {
  display: none;
}

.toggle {
  width: 44px;
  height: 24px;
  background: var(--border-color);
  border-radius: 12px;
  position: relative;
  transition: all 0.2s ease;
}

.toggle::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.toggle-row input:checked + .toggle {
  background: var(--primary-color);
}

.toggle-row input:checked + .toggle::after {
  left: 22px;
}

.amnesty-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: rgba(124, 58, 237, 0.1);
  border-radius: 8px;
  font-size: 0.85rem;
  color: #7c3aed;
}

.amnesty-info svg {
  flex-shrink: 0;
}

.amnesty-info .btn {
  margin-left: auto;
}

@media (max-width: 640px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .icon-grid {
    grid-template-columns: repeat(8, 1fr);
  }
  
  .schedule-options {
    flex-direction: column;
  }
  
  .schedule-btn {
    width: 100%;
    text-align: center;
  }
  
  .habit-schedule {
    display: none;
  }
  
  .week-header {
    display: none;
  }
}
</style>
