<template>
  <div class="habit-tracker">
    <div class="habit-header">
      <router-link to="/app/habits" class="habit-title">
        <Flame :size="18" :stroke-width="1.5" />
        <span>Привычки</span>
        <span class="habit-count">{{ completedCount }}/{{ scheduledCount }}</span>
      </router-link>
      <router-link to="/app/habits" class="btn-icon" title="Управление привычками">
        <ChevronRight :size="16" :stroke-width="1.5" />
      </router-link>
    </div>

    <div class="habits-list" v-if="scheduledHabits.length > 0">
      <div 
        v-for="habit in scheduledHabits" 
        :key="getDisplayId(habit)"
        class="habit-item"
        :class="{ completed: getHabitCompleted(habit) }"
        @click="handleToggle(habit)"
      >
        <div class="habit-check">
          <div class="checkbox" :class="{ checked: getHabitCompleted(habit) }">
            <Check v-if="getHabitCompleted(habit)" :size="12" :stroke-width="2.5" />
          </div>
        </div>
        <span class="habit-icon">{{ getDisplayIcon(habit) }}</span>
        <span class="habit-name">{{ habit.name }}</span>
        <transition name="xp-fade">
          <span v-if="showXP === getDisplayId(habit)" class="xp-popup">+{{ habit.xpReward || 5 }} XP</span>
        </transition>
      </div>
    </div>

    <div v-else class="empty-habits">
      <p>Нет привычек на сегодня</p>
      <router-link to="/app/habits" class="add-link">
        <Plus :size="14" :stroke-width="1.5" />
        Добавить
      </router-link>
    </div>

    <div v-if="habitStreak > 0" class="streak-info">
      <Zap :size="14" :stroke-width="1.5" />
      <span>{{ habitStreak }} {{ pluralizeDays(habitStreak) }} подряд</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'
import { useHabitsStore } from '../stores/habits'
import { useXpStore } from '../stores/xp'
import { Flame, Check, Zap, ChevronRight, Plus } from 'lucide-vue-next'
import { getTodayDateString } from '../utils/dateUtils'

const appStore = useAppStore()
const habitsStore = useHabitsStore()
const xpStore = useXpStore()

const showXP = ref(null)
const isToggling = ref(false)

const todayDayOfWeek = new Date().getDay()
const todayDateStr = getTodayDateString()

// Данные привычек на сегодня уже загружаются через get-user-data API
// и сохраняются в appStore.userDashboardData.today_habits
// Отдельный запрос loadHabits() не нужен для виджета Dashboard

function isScheduledForToday(habit) {
  const schedDays = habit.schedule_days || habit.scheduleDays
  const freqType = habit.frequencyType || habit.frequency_type
  
  // Если есть конкретные дни в расписании (не все 7 дней) - использовать их
  if (schedDays && Array.isArray(schedDays) && schedDays.length > 0 && schedDays.length < 7) {
    return schedDays.includes(todayDayOfWeek)
  }
  
  // Иначе проверяем по типу частоты
  if (!freqType || freqType === 'daily') return true
  if (freqType === 'weekdays') return todayDayOfWeek >= 1 && todayDayOfWeek <= 5
  if (freqType === 'weekends') return todayDayOfWeek === 0 || todayDayOfWeek === 6
  return schedDays?.includes(todayDayOfWeek) ?? true
}

function isCompletedToday(habit) {
  if (habit.completions && Array.isArray(habit.completions)) {
    return habit.completions.some(c => c.date === todayDateStr && c.status === 'completed')
  }
  
  return appStore.habitLog[todayDateStr]?.includes(habit.id) || false
}

function getHabitIcon(habit) {
  if (habit.icon && typeof habit.icon === 'string') {
    const iconMap = {
      'fire': '🔥', 'strength': '💪', 'brain': '🧠', 'heart': '❤️',
      'book': '📚', 'run': '🏃', 'water': '💧', 'sleep': '😴',
      'meditation': '🧘', 'target': '🎯', 'money': '💰', 'graph': '📈',
      'sun': '☀️', 'moon': '🌙', 'shield': '🛡️', 'palette': '🎨',
      'smile': '😊', 'apple': '🍎', 'weight': '⚖️', 'calendar': '📅',
      'trophy': '🏆', 'star': '⭐', 'rocket': '🚀', 'leaf': '🌿',
      'coffee': '☕', 'music': '🎵', 'camera': '📷', 'laptop': '💻',
      'dumbbell': '🏋️', 'yoga': '🧘‍♀️', 'bicycle': '🚴', 'swimmer': '🏊'
    }
    return iconMap[habit.icon] || habit.icon
  }
  return habit.icon || '📌'
}

// Используем today_habits из API get-user-data (приоритет), затем habitsStore, затем appStore
const defaultTodayHabits = { total_count: 0, completed_count: 0, habits: [] }
const apiTodayHabits = computed(() => {
  try {
    return appStore.userDashboardData?.today_habits || defaultTodayHabits
  } catch {
    return defaultTodayHabits
  }
})

const allHabits = computed(() => {
  // Приоритет 1: данные из API get-user-data (возвращаем оригинальные объекты для реактивности)
  const apiHabits = apiTodayHabits.value?.habits
  if (apiHabits && apiHabits.length > 0) {
    return apiHabits
  }
  
  // Приоритет 2: данные из habitsStore (полная загрузка)
  if (habitsStore.habits && habitsStore.habits.length > 0) {
    return habitsStore.habits.filter(h => !h.date_deleted)
  }
  
  // Приоритет 3: локальные данные
  return appStore.todayHabits
})

function getDisplayId(habit) {
  return habit.habit_id || habit.id
}

function getDisplayIcon(habit) {
  return getHabitIcon(habit)
}

function getHabitCompleted(habit) {
  // Приоритет 1: is_completed из API get-user-data (обновляется optimistic update)
  if (habit.is_completed !== undefined) {
    return habit.is_completed
  }
  // Приоритет 2: completions массив из habitsStore
  if (habit.completions && Array.isArray(habit.completions)) {
    return habit.completions.some(c => c.date === todayDateStr && c.status === 'completed')
  }
  // Приоритет 3: completed флаг
  if (habit.completed !== undefined) {
    return habit.completed
  }
  // Fallback: локальный habitLog
  return appStore.habitLog[todayDateStr]?.includes(habit.id) || false
}

const scheduledHabits = computed(() => {
  // Если данные из API - они уже отфильтрованы по расписанию
  const apiHabits = apiTodayHabits.value?.habits
  if (apiHabits && apiHabits.length > 0) {
    return allHabits.value
  }
  return allHabits.value.filter(h => isScheduledForToday(h))
})

const completedCount = computed(() => {
  // Используем данные из API если они есть
  const count = apiTodayHabits.value?.completed_count
  if (count !== undefined && count !== null) {
    return count
  }
  return scheduledHabits.value.filter(h => getHabitCompleted(h)).length
})

const scheduledCount = computed(() => {
  // Используем данные из API если они есть
  const count = apiTodayHabits.value?.total_count
  if (count !== undefined && count !== null) {
    return count
  }
  return scheduledHabits.value.length
})

const habitStreak = computed(() => {
  if (habitsStore.statsPanel?.streak !== undefined) {
    return habitsStore.statsPanel.streak
  }
  return appStore.habitStreak
})

async function handleToggle(habit) {
  console.log('[HabitTracker] handleToggle called:', { 
    habit, 
    isToggling: isToggling.value 
  })
  
  if (isToggling.value) {
    console.log('[HabitTracker] Skipping - already toggling')
    return
  }
  
  const habitId = getDisplayId(habit)
  const isFromBackend = habit.habit_id !== undefined
  const wasCompleted = getHabitCompleted(habit)
  const newCompletedState = !wasCompleted
  
  console.log('[HabitTracker] Toggle details:', { 
    habitId, 
    isFromBackend, 
    wasCompleted, 
    newCompletedState 
  })
  
  // Мгновенно обновляем UI (optimistic update)
  appStore.updateHabitCompletionInDashboard(habit.habit_id || habitId, newCompletedState)
  
  if (isFromBackend) {
    isToggling.value = true
    try {
      if (wasCompleted) {
        const result = await habitsStore.unmarkCompleted(habit.habit_id, todayDateStr)
        if (!result?.success) {
          // Откатить изменения при ошибке
          appStore.updateHabitCompletionInDashboard(habit.habit_id, true)
        }
      } else {
        const result = await habitsStore.markCompleted(habit.habit_id, todayDateStr)
        
        if (result?.success) {
          showXP.value = habitId
          setTimeout(() => {
            showXP.value = null
          }, 1200)
        } else {
          // Откатить изменения при ошибке
          appStore.updateHabitCompletionInDashboard(habit.habit_id, false)
        }
      }
    } catch (error) {
      // Откатить изменения при ошибке
      appStore.updateHabitCompletionInDashboard(habit.habit_id, wasCompleted)
    } finally {
      isToggling.value = false
    }
  } else {
    const result = appStore.toggleHabit(habit.id)
    
    if (result.completed) {
      showXP.value = habit.id
      setTimeout(() => {
        showXP.value = null
      }, 1200)
    }
  }
}

function pluralizeDays(n) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'день'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'дня'
  return 'дней'
}
</script>

<style scoped>
.habit-tracker {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 1.25rem;
  border: 1px solid var(--border-color);
}

.habit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.habit-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.habit-title:hover {
  color: var(--primary-color);
}

.habit-title svg {
  color: #f97316;
}

.habit-count {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.btn-icon {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: var(--bg-secondary);
  color: var(--primary-color);
}

.habits-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.habit-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  background: var(--bg-secondary);
}

.habit-item:hover {
  background: var(--bg-tertiary, rgba(0,0,0,0.05));
}

.habit-item.completed {
  background: rgba(34, 197, 94, 0.1);
}

.habit-check {
  flex-shrink: 0;
}

.checkbox {
  width: 20px;
  height: 20px;
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

.habit-icon {
  font-size: 1.1rem;
}

.habit-name {
  flex: 1;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.habit-item.completed .habit-name {
  text-decoration: line-through;
  opacity: 0.7;
}

.xp-popup {
  position: absolute;
  right: 0.75rem;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  animation: xp-bounce 0.5s ease;
}

@keyframes xp-bounce {
  0% {
    transform: scale(0.5) translateY(10px);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) translateY(-5px);
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.xp-fade-enter-active {
  animation: xp-bounce 0.5s ease;
}

.xp-fade-leave-active {
  transition: all 0.3s ease;
}

.xp-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.empty-habits {
  text-align: center;
  padding: 1rem;
}

.empty-habits p {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0 0 0.75rem 0;
}

.add-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--primary-color);
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
}

.add-link:hover {
  text-decoration: underline;
}

.streak-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.streak-info svg {
  color: #f59e0b;
}
</style>
