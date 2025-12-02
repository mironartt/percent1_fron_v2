<template>
  <div class="progress-container">
    <div class="progress-header">
      <div class="progress-label">
        <TrendingUp :size="16" :stroke-width="1.5" />
        <span>Прогресс дня</span>
      </div>
      <div class="progress-value">
        <span class="percentage">{{ progressPercent }}%</span>
        <span class="details">{{ completedItems }}/{{ totalItems }}</span>
      </div>
    </div>
    
    <div class="progress-bar-wrapper">
      <div class="progress-bar">
        <div 
          class="progress-fill"
          :class="progressClass"
          :style="{ width: progressPercent + '%' }"
        />
      </div>
    </div>

    <div class="progress-breakdown">
      <div class="breakdown-item" v-if="focusTasks.total > 0">
        <Target :size="12" :stroke-width="1.5" />
        <span>Задачи: {{ focusTasks.completed }}/{{ focusTasks.total }}</span>
      </div>
      <div class="breakdown-item" v-if="habits.total > 0">
        <Flame :size="12" :stroke-width="1.5" />
        <span>Привычки: {{ habits.completed }}/{{ habits.total }}</span>
      </div>
      <div class="breakdown-item" v-if="showJournal">
        <BookOpen :size="12" :stroke-width="1.5" />
        <span>Дневник: {{ journal.completed ? '✓' : '—' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '../stores/app'
import { TrendingUp, Target, Flame, BookOpen } from 'lucide-vue-next'

const appStore = useAppStore()

const focusTasks = computed(() => {
  const tasks = appStore.dailyPlan.tasks || []
  const focusOnly = tasks.slice(0, 3)
  return {
    total: focusOnly.length,
    completed: focusOnly.filter(t => t.completed).length
  }
})

const habits = computed(() => ({
  total: appStore.todayHabitsTotal,
  completed: appStore.todayHabitsCompleted
}))

const journal = computed(() => ({
  completed: appStore.hasTodayEntry
}))

const showJournal = computed(() => {
  const hour = new Date().getHours()
  return hour >= 18 || journal.value.completed
})

const completedItems = computed(() => {
  let count = focusTasks.value.completed + habits.value.completed
  if (showJournal.value && journal.value.completed) count++
  return count
})

const totalItems = computed(() => {
  let count = focusTasks.value.total + habits.value.total
  if (showJournal.value) count++
  return count
})

const progressPercent = computed(() => {
  if (totalItems.value === 0) return 0
  return Math.round((completedItems.value / totalItems.value) * 100)
})

const progressClass = computed(() => {
  const p = progressPercent.value
  if (p >= 100) return 'complete'
  if (p >= 70) return 'good'
  if (p >= 40) return 'medium'
  return 'low'
})
</script>

<style scoped>
.progress-container {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 1rem 1.25rem;
  border: 1px solid var(--border-color);
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.progress-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.progress-label svg {
  color: var(--primary-color);
}

.progress-value {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.percentage {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.details {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.progress-bar-wrapper {
  margin-bottom: 0.75rem;
}

.progress-bar {
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease, background 0.3s ease;
}

.progress-fill.low {
  background: linear-gradient(90deg, #f87171, #fbbf24);
}

.progress-fill.medium {
  background: linear-gradient(90deg, #fbbf24, #a3e635);
}

.progress-fill.good {
  background: linear-gradient(90deg, #a3e635, #22c55e);
}

.progress-fill.complete {
  background: linear-gradient(90deg, #22c55e, #10b981);
}

.progress-breakdown {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.breakdown-item svg {
  opacity: 0.7;
}
</style>
