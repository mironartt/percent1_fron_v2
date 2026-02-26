<template>
  <div class="collapsible-dashboard" :class="{ collapsed: isCollapsed }">
    <div class="dashboard-bar" @click="toggle">
      <div class="bar-metrics">
        <div class="metric" v-if="focusLabel">
          <Target :size="14" :stroke-width="1.5" />
          <span class="metric-text">{{ focusLabel }}</span>
        </div>
        <div class="metric">
          <Flame :size="14" :stroke-width="1.5" />
          <span class="metric-text">{{ habitStreak }} дн.</span>
        </div>
        <div class="metric xp-metric">
          <Sparkles :size="14" :stroke-width="1.5" />
          <span class="metric-text">{{ formattedXp }} XP</span>
        </div>
        <div class="metric" v-if="tasksTotal > 0">
          <CheckCircle2 :size="14" :stroke-width="1.5" />
          <span class="metric-text">{{ tasksCompleted }}/{{ tasksTotal }}</span>
        </div>
      </div>
      <button class="toggle-btn" :title="isCollapsed ? 'Развернуть' : 'Свернуть'">
        <ChevronDown :size="16" :stroke-width="1.5" class="toggle-icon" :class="{ rotated: !isCollapsed }" />
      </button>
    </div>

    <Transition name="expand">
      <div v-if="!isCollapsed" class="dashboard-expanded">
        <div class="expanded-content">
          <div v-if="focusTasks.length > 0" class="section">
            <h4 class="section-title">Фокус дня</h4>
            <div class="task-list">
              <label
                v-for="task in focusTasks"
                :key="task.id"
                class="task-item"
                :class="{ completed: task.completed }"
              >
                <input
                  type="checkbox"
                  :checked="task.completed"
                  @change="toggleTask(task)"
                  class="task-checkbox"
                />
                <span class="task-title">{{ task.title }}</span>
                <span v-if="task.sphere" class="task-sphere">{{ task.sphere }}</span>
              </label>
            </div>
          </div>

          <div v-if="tasksTotal > 0" class="section">
            <div class="progress-row">
              <span class="progress-label">Прогресс дня</span>
              <span class="progress-value">{{ Math.round(progressPercent) }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>
          </div>

          <div v-if="todayHabits.length > 0" class="section">
            <h4 class="section-title">Привычки</h4>
            <div class="habits-row">
              <button
                v-for="habit in todayHabits"
                :key="habit.habit_id"
                class="habit-chip"
                :class="{ done: habit.is_complete }"
                @click="toggleHabit(habit)"
                :title="habit.title"
              >
                <CheckCircle2 v-if="habit.is_complete" :size="14" :stroke-width="1.5" />
                <Circle v-else :size="14" :stroke-width="1.5" />
                <span class="habit-name">{{ habit.title }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useXpStore } from '@/stores/xp'
import {
  Target,
  Flame,
  Sparkles,
  CheckCircle2,
  Circle,
  ChevronDown
} from 'lucide-vue-next'
import { updateGoalSteps } from '@/services/api'
import { markHabitCompleted } from '@/services/habitsApi'

const store = useAppStore()
const xpStore = useXpStore()

const isCollapsed = computed(() => store.dashboardCollapsed)

function toggle() {
  store.toggleDashboardCollapsed()
}

const habitStreak = computed(() => store.habitStreak || 0)

const formattedXp = computed(() => {
  const xp = xpStore.xpBalance || 0
  if (xp >= 1000) {
    return (xp / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  }
  return xp.toString()
})

const dashboardData = computed(() => store.userDashboardData || {})

const focusTasks = computed(() => {
  const tasks = dashboardData.value.today_tasks?.tasks || []
  return tasks.map(task => ({
    id: task.step_id,
    title: task.step_title,
    completed: task.is_complete,
    sphere: task.goal_title,
    goalId: task.goal_id
  }))
})

const focusLabel = computed(() => {
  if (focusTasks.value.length === 0) return null
  const first = focusTasks.value.find(t => !t.completed)
  return first ? first.title : 'Всё выполнено!'
})

const tasksCompleted = computed(() => dashboardData.value.today_tasks?.completed_count || 0)
const tasksTotal = computed(() => dashboardData.value.today_tasks?.total_count || 0)

const progressPercent = computed(() => {
  if (tasksTotal.value === 0) return 0
  return (tasksCompleted.value / tasksTotal.value) * 100
})

const todayHabits = computed(() => {
  const habits = dashboardData.value.today_habits?.habits || []
  return habits.slice(0, 6)
})

async function toggleTask(task) {
  const tasksArray = store.userDashboardData?.today_tasks?.tasks
  const apiTask = tasksArray?.find(t => t.step_id === task.id)
  const newCompleted = !task.completed

  // Optimistic update
  if (apiTask) {
    apiTask.is_complete = newCompleted
    if (newCompleted) {
      store.userDashboardData.today_tasks.completed_count++
    } else {
      store.userDashboardData.today_tasks.completed_count--
    }
  }

  try {
    await updateGoalSteps({
      goals_steps_data: [{
        goal_id: task.goalId,
        step_id: task.id,
        is_complete: newCompleted
      }]
    })
  } catch (e) {
    // Rollback on error
    if (apiTask) {
      apiTask.is_complete = !newCompleted
      if (newCompleted) {
        store.userDashboardData.today_tasks.completed_count--
      } else {
        store.userDashboardData.today_tasks.completed_count++
      }
    }
  }
}

async function toggleHabit(habit) {
  const habitsArray = store.userDashboardData?.today_habits?.habits
  const apiHabit = habitsArray?.find(h => h.habit_id === habit.habit_id)
  const newCompleted = !habit.is_complete

  // Optimistic update
  if (apiHabit) {
    apiHabit.is_complete = newCompleted
    if (newCompleted) {
      store.userDashboardData.today_habits.completed_count++
    } else {
      store.userDashboardData.today_habits.completed_count--
    }
  }

  try {
    const today = new Date().toISOString().split('T')[0]
    await markHabitCompleted(habit.habit_id, today)
  } catch (e) {
    // Rollback on error
    if (apiHabit) {
      apiHabit.is_complete = !newCompleted
      if (newCompleted) {
        store.userDashboardData.today_habits.completed_count--
      } else {
        store.userDashboardData.today_habits.completed_count++
      }
    }
  }
}
</script>

<style scoped>
.collapsible-dashboard {
  flex-shrink: 0;
  border-bottom: 1px solid var(--border-color);
}

.dashboard-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  cursor: pointer;
  user-select: none;
}

.bar-metrics {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  overflow: hidden;
}

.metric {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  white-space: nowrap;
}

.metric-text {
  font-weight: 500;
}

.xp-metric {
  color: var(--primary-color);
}

.toggle-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.2s;
}

.toggle-btn:hover {
  background: var(--bg-hover);
}

.toggle-icon {
  transition: transform 0.3s ease;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

.dashboard-expanded {
  overflow: hidden;
}

.expanded-content {
  padding: 0 0 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  margin: 0 0 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.task-item:hover {
  background: var(--bg-hover);
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.task-checkbox {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  accent-color: var(--primary-color);
  cursor: pointer;
  flex-shrink: 0;
}

.task-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-sphere {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
  padding: 2px 6px;
  background: var(--bg-secondary);
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}

.progress-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.progress-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.progress-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary-color);
}

.progress-bar {
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: 3px;
  transition: width 0.5s ease;
}

.habits-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.habit-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.habit-chip:hover {
  border-color: var(--primary-color);
  background: var(--bg-hover);
}

.habit-chip.done {
  background: rgba(99, 102, 241, 0.1);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.habit-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Expand transition */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 400px;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

@media (max-width: 768px) {
  .bar-metrics {
    gap: 10px;
  }

  .metric:first-child {
    display: none;
  }
}
</style>
