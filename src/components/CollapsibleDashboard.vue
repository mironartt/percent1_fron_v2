<template>
  <div class="stats-bar">
    <div class="bar-metrics">
      <!-- XP -->
      <button class="metric xp-metric" @click="$router.push('/app/achievements')">
        <Trophy :size="14" :stroke-width="1.5" />
        <span class="metric-value">{{ formattedXp }}</span>
      </button>

      <!-- Streak -->
      <button class="metric streak-metric" v-if="habitStreak > 0" @click="$router.push('/app/habits')">
        <BookOpen :size="14" :stroke-width="1.5" />
        <span class="metric-value">{{ habitStreak }}</span>
      </button>

      <div class="bar-divider"></div>

      <!-- Tasks -->
      <button
        class="metric metric-dropdown"
        :class="{ 'metric--complete': isTasksComplete, 'metric--active': openDropdown === 'tasks' }"
        @click.stop="toggleDropdown('tasks')"
        v-if="tasksTotal > 0"
      >
        <CheckCircle2 :size="14" :stroke-width="1.5" />
        <span class="metric-value">{{ tasksCompleted }}/{{ tasksTotal }}</span>
        <span class="metric-label">задач</span>
        <div class="inline-progress">
          <div class="inline-progress-fill tasks-fill" :style="{ width: tasksPercent + '%' }"></div>
        </div>
        <ChevronDown :size="12" :stroke-width="1.5" class="chevron" :class="{ rotated: openDropdown === 'tasks' }" />
      </button>

      <!-- Habits -->
      <button
        class="metric metric-dropdown"
        :class="{ 'metric--complete': isHabitsComplete, 'metric--active': openDropdown === 'habits' }"
        @click.stop="toggleDropdown('habits')"
        v-if="habitsTotal > 0"
      >
        <Flame :size="14" :stroke-width="1.5" />
        <span class="metric-value">{{ habitsCompleted }}/{{ habitsTotal }}</span>
        <span class="metric-label">привычек</span>
        <div class="inline-progress">
          <div class="inline-progress-fill habits-fill" :style="{ width: habitsPercent + '%' }"></div>
        </div>
        <ChevronDown :size="12" :stroke-width="1.5" class="chevron" :class="{ rotated: openDropdown === 'habits' }" />
      </button>
    </div>

    <!-- Tasks dropdown -->
    <Transition name="dropdown">
      <div v-if="openDropdown === 'tasks'" class="dropdown-panel" @click.stop>
        <div class="task-list">
          <button
            v-for="task in focusTasks"
            :key="task.id"
            class="task-item"
            :class="{ completed: task.completed }"
            @click="toggleTask(task)"
          >
            <CheckCircle2 v-if="task.completed" :size="16" :stroke-width="1.5" class="task-check" />
            <Circle v-else :size="16" :stroke-width="1.5" class="task-circle" />
            <span class="task-title">{{ task.title }}</span>
            <span v-if="task.sphere" class="task-sphere">{{ task.sphere }}</span>
          </button>
          <div v-if="focusTasks.length === 0" class="dropdown-empty">
            Нет задач на сегодня
          </div>
        </div>
      </div>
    </Transition>

    <!-- Habits dropdown -->
    <Transition name="dropdown">
      <div v-if="openDropdown === 'habits'" class="dropdown-panel" @click.stop>
        <div class="habits-list">
          <button
            v-for="habit in todayHabits"
            :key="habit.habit_id"
            class="habit-item"
            :class="{ done: habit.is_complete }"
            @click="toggleHabit(habit)"
          >
            <CheckCircle2 v-if="habit.is_complete" :size="16" :stroke-width="1.5" class="habit-check" />
            <Circle v-else :size="16" :stroke-width="1.5" class="habit-circle" />
            <span class="habit-name">{{ habit.title }}</span>
          </button>
          <div v-if="todayHabits.length === 0" class="dropdown-empty">
            Нет привычек на сегодня
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAppStore } from '@/stores/app'
import { useXpStore } from '@/stores/xp'
import {
  Trophy,
  BookOpen,
  Flame,
  CheckCircle2,
  Circle,
  ChevronDown
} from 'lucide-vue-next'
import { updateGoalSteps } from '@/services/api'
import { markHabitCompleted } from '@/services/habitsApi'
import { useDailyCompletion } from '@/composables/useDailyCompletion'

const store = useAppStore()
const xpStore = useXpStore()

const openDropdown = ref(null)

function toggleDropdown(name) {
  openDropdown.value = openDropdown.value === name ? null : name
}

function closeDropdown() {
  openDropdown.value = null
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
  setupWatchers({
    tasksCompleted,
    tasksTotal,
    habitsCompleted,
    habitsTotal
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdown)
})

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

const tasksCompleted = computed(() => dashboardData.value.today_tasks?.completed_count || 0)
const tasksTotal = computed(() => dashboardData.value.today_tasks?.total_count || 0)
const tasksPercent = computed(() => tasksTotal.value === 0 ? 0 : (tasksCompleted.value / tasksTotal.value) * 100)

const todayHabits = computed(() => {
  const habits = dashboardData.value.today_habits?.habits || []
  return habits.slice(0, 6)
})

const habitsCompleted = computed(() => dashboardData.value.today_habits?.completed_count || 0)
const habitsTotal = computed(() => dashboardData.value.today_habits?.total_count || 0)
const habitsPercent = computed(() => habitsTotal.value === 0 ? 0 : (habitsCompleted.value / habitsTotal.value) * 100)

const isTasksComplete = computed(() => tasksTotal.value > 0 && tasksCompleted.value === tasksTotal.value)
const isHabitsComplete = computed(() => habitsTotal.value > 0 && habitsCompleted.value === habitsTotal.value)

// Celebration effects
const { setupWatchers } = useDailyCompletion()

async function toggleTask(task) {
  const tasksArray = store.userDashboardData?.today_tasks?.tasks
  const apiTask = tasksArray?.find(t => t.step_id === task.id)
  const newCompleted = !task.completed

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
.stats-bar {
  flex-shrink: 0;
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  margin-bottom: 0.5rem;
  position: relative;
}

.bar-metrics {
  display: flex;
  align-items: center;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}

.bar-metrics::-webkit-scrollbar {
  display: none;
}

/* Base metric */
.metric {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  white-space: nowrap;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 10px;
  transition: background 0.15s;
  font-family: inherit;
  flex-shrink: 0;
}

.metric:hover {
  background: var(--bg-secondary);
}

.metric-value {
  font-weight: 600;
  color: var(--text-primary);
}

.metric-label {
  color: var(--text-secondary);
}

/* XP */
.xp-metric svg {
  color: #f59e0b;
}

/* Streak */
.streak-metric svg {
  color: var(--primary-color);
}

/* Divider */
.bar-divider {
  width: 1px;
  height: 20px;
  background: var(--border-color);
  flex-shrink: 0;
}

/* Dropdown metrics — stretch to fill */
.metric-dropdown {
  flex: 1;
  min-width: 0;
}

/* Inline progress bar */
.inline-progress {
  flex: 1;
  min-width: 40px;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
}

.inline-progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
}

.tasks-fill {
  background: var(--primary-color);
}

.habits-fill {
  background: #f59e0b;
}

/* Complete state */
.metric--complete .metric-value {
  color: var(--success-color);
}

.metric--complete svg {
  color: var(--success-color);
}

.metric--complete .tasks-fill,
.metric--complete .habits-fill {
  background: var(--success-color);
}

/* Active dropdown */
.metric--active {
  background: var(--bg-secondary);
}

/* Chevron */
.chevron {
  transition: transform 0.2s ease;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.chevron.rotated {
  transform: rotate(180deg);
}

/* Dropdown panels */
.dropdown-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  margin-top: 4px;
  padding: 0.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.dropdown-empty {
  padding: 0.75rem;
  text-align: center;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

/* Tasks dropdown */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  font-size: 0.8125rem;
  color: var(--text-primary);
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  font-family: inherit;
}

.task-item:hover {
  background: var(--bg-secondary);
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: var(--text-tertiary);
}

.task-circle {
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.task-check {
  color: var(--success-color);
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

/* Habits dropdown */
.habits-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.habit-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  font-size: 0.8125rem;
  color: var(--text-primary);
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  font-family: inherit;
}

.habit-item:hover {
  background: var(--bg-secondary);
}

.habit-circle {
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.habit-check {
  color: var(--success-color);
  flex-shrink: 0;
}

.habit-item.done .habit-name {
  color: var(--text-tertiary);
  text-decoration: line-through;
}

.habit-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
  max-height: 400px;
}

.dropdown-enter-from,
.dropdown-leave-to {
  max-height: 0;
  opacity: 0;
}

@media (max-width: 768px) {
  .stats-bar {
    margin-left: 0.75rem;
    margin-right: 0.75rem;
  }

  .metric-label {
    display: none;
  }

  .metric {
    padding: 0.4rem 0.5rem;
    font-size: 0.75rem;
  }

  .inline-progress {
    min-width: 24px;
  }
}

/* Dark theme */
:root.dark .stats-bar {
  background: var(--card-bg);
}
</style>
