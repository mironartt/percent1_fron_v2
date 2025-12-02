<template>
  <div class="habit-tracker">
    <div class="habit-header">
      <div class="habit-title">
        <Flame :size="18" :stroke-width="1.5" />
        <span>Привычки</span>
        <span class="habit-count">{{ completedCount }}/{{ totalCount }}</span>
      </div>
      <button class="btn-icon" @click="$emit('manage')" title="Управление привычками">
        <Settings :size="16" :stroke-width="1.5" />
      </button>
    </div>

    <div class="habits-list">
      <div 
        v-for="habit in todayHabits" 
        :key="habit.id"
        class="habit-item"
        :class="{ completed: habit.completed }"
        @click="handleToggle(habit)"
      >
        <div class="habit-check">
          <div class="checkbox" :class="{ checked: habit.completed }">
            <Check v-if="habit.completed" :size="12" :stroke-width="2.5" />
          </div>
        </div>
        <span class="habit-icon">{{ habit.icon }}</span>
        <span class="habit-name">{{ habit.name }}</span>
        <transition name="xp-fade">
          <span v-if="showXP === habit.id" class="xp-popup">+{{ habit.xpReward || 5 }} XP</span>
        </transition>
      </div>
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
import { useXpStore, XP_REWARDS } from '../stores/xp'
import { Flame, Settings, Check, Zap } from 'lucide-vue-next'

const emit = defineEmits(['manage'])

const appStore = useAppStore()
const xpStore = useXpStore()

const showXP = ref(null)

const todayHabits = computed(() => appStore.todayHabits)
const completedCount = computed(() => appStore.todayHabitsCompleted)
const totalCount = computed(() => appStore.todayHabitsTotal)
const habitStreak = computed(() => appStore.habitStreak)

function handleToggle(habit) {
  const result = appStore.toggleHabit(habit.id)
  
  if (result.completed) {
    const xpAmount = habit.xpReward || XP_REWARDS.HABIT_COMPLETED
    xpStore.awardXP(xpAmount, 'habit_completed', { 
      habitId: habit.id, 
      habitName: habit.name 
    })
    
    showXP.value = habit.id
    setTimeout(() => {
      showXP.value = null
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
}

.habit-title svg {
  color: var(--primary-color);
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
}

.btn-icon:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
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
