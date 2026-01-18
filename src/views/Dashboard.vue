<template>
  <OnboardingAI v-if="shouldShowOnboarding" />

  <!-- MiniTask disabled - decision to remove this feature
  <MiniTaskWelcome 
    v-else-if="shouldShowMiniTask && !showMiniTask" 
    @start="showMiniTask = true"
    @skip="onMiniTaskSkip"
  />

  <MiniTask 
    v-else-if="showMiniTask && !isMiniTaskCompleted" 
    @complete="onMiniTaskComplete"
  />
  -->

  <div v-else class="dashboard-wrapper">
    <div class="dashboard">
      <header class="day-header">
        <div class="greeting-section">
          <div class="time-icon" :class="timeOfDayClass">
            <component :is="timeIcon" :size="28" :stroke-width="1.5" />
          </div>
          <div class="greeting-text">
            <h1>{{ greeting }}, {{ userName }}</h1>
            <p class="day-subtitle">{{ dayMessage }}</p>
          </div>
        </div>
        <div class="header-badges">
          <XpBadge @click="$router.push('/app/achievements')" />
          <div class="streak-badge" v-if="journalStreak > 0" title="Стрик — количество дней подряд, когда вы вели дневник">
            <Flame :size="16" :stroke-width="1.5" />
            <span>{{ journalStreak }} {{ pluralize(journalStreak, 'день', 'дня', 'дней') }}</span>
          </div>
        </div>
      </header>

      <DailyProgressBar class="progress-section" />

      <div class="day-content">
        <div class="focus-goals-grid">
          <div class="card focus-card">
            <div class="card-header">
              <h3 class="card-title">
                <Crosshair :size="18" :stroke-width="1.5" />
                Фокус дня
              </h3>
              <div class="header-actions">
                <span class="focus-count">{{ completedFocusTasks }}/{{ totalFocusTasks }}</span>
                <button 
                  class="settings-btn" 
                  @click="$router.push('/app/planning')"
                  title="Настроить задачи"
                >
                  <Settings :size="16" :stroke-width="1.5" />
                </button>
              </div>
            </div>
            <div class="card-body">
              <div v-if="focusTasks.length === 0" class="empty-focus">
                <div class="empty-icon">
                  <Sparkles :size="32" :stroke-width="1.5" />
                </div>
                <p>Выберите 1-3 важных дела на сегодня</p>
                <router-link to="/app/planning" class="btn btn-primary">
                  <Plus :size="18" :stroke-width="1.5" />
                  Выбрать задачи
                </router-link>
              </div>
              <div v-else class="focus-list">
                <div 
                  v-for="task in focusTasks" 
                  :key="task.id"
                  class="focus-item"
                  :class="{ completed: task.completed }"
                >
                  <button 
                    class="focus-check"
                    :class="{ checked: task.completed }"
                    @click="toggleFocusTask(task)"
                  >
                    <Check v-if="task.completed" :size="14" :stroke-width="2.5" />
                  </button>
                  <div class="focus-content">
                    <span class="focus-title">{{ task.title }}</span>
                    <span class="focus-sphere" v-if="task.sphere">{{ task.sphere }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card goals-card">
            <div class="card-header">
              <h3 class="card-title">
                <Flag :size="18" :stroke-width="1.5" />
                Мои цели
              </h3>
              <span class="goals-count">{{ totalIncompleteGoals }}</span>
            </div>
            <div class="card-body">
              <div v-if="topGoals.length === 0" class="empty-goals">
                <div class="empty-icon">
                  <Target :size="32" :stroke-width="1.5" />
                </div>
                <p>Добавьте цели для отслеживания прогресса</p>
                <router-link to="/app/goals-bank" class="btn btn-primary">
                  <Plus :size="18" :stroke-width="1.5" />
                  В банк целей
                </router-link>
              </div>
              <div v-else class="goals-list">
                <div 
                  v-for="goal in topGoals" 
                  :key="goal.id"
                  class="goal-item"
                  @click="goToGoal(goal)"
                >
                  <div class="goal-info">
                    <span class="goal-sphere-badge" v-if="goal.sphereIcon">{{ goal.sphereIcon }}</span>
                    <span class="goal-title">{{ goal.title }}</span>
                  </div>
                  <div class="goal-progress-wrap">
                    <div class="goal-progress-bar">
                      <div class="goal-progress-fill" :style="{ width: goal.progress + '%' }"></div>
                    </div>
                    <span class="goal-progress-text">{{ goal.progress }}%</span>
                  </div>
                </div>
                <router-link 
                  v-if="totalIncompleteGoals > 3"
                  to="/app/goals-bank" 
                  class="more-goals-link"
                >
                  +{{ totalIncompleteGoals - 3 }} {{ pluralize(totalIncompleteGoals - 3, 'цель', 'цели', 'целей') }}
                </router-link>
              </div>
            </div>
          </div>
          <HabitTracker @manage="showHabitManager = true" class="habits-widget" />
        </div>

        <div v-if="isEvening" class="card evening-card">
          <div class="evening-content">
            <div class="evening-icon">
              <Moon :size="24" :stroke-width="1.5" />
            </div>
            <div class="evening-text">
              <h4>Вечерняя точка</h4>
              <p>Подведите итоги дня и запланируйте завтра</p>
            </div>
            <button class="btn btn-secondary" @click="showJournalModal = true">
              Записать
            </button>
          </div>
        </div>

        <div class="card mentor-cta">
          <div class="mentor-content">
            <div class="mentor-avatar">
              <MessageCircle :size="24" :stroke-width="1.5" />
            </div>
            <div class="mentor-text">
              <h4>AI Ментор</h4>
              <p>{{ mentorHint }}</p>
            </div>
            <button class="btn btn-primary" @click="openMentorPanel">
              <MessageCircle :size="16" :stroke-width="1.5" />
              Спросить
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="showJournalModal" class="modal-overlay" @click.self="showJournalModal = false">
      <div class="modal-container">
        <button class="modal-close" @click="showJournalModal = false">
          <X :size="20" :stroke-width="1.5" />
        </button>
        <JournalEntry @saved="showJournalModal = false" />
      </div>
    </div>
  </Teleport>

  <Teleport to="body">
    <PlanReview 
      v-if="showPlanReview" 
      @close="store.closePlanReview()"
      @confirmed="onPlanConfirmed"
    />
  </Teleport>

  <HabitManagerModal 
    v-if="showHabitManager" 
    @close="showHabitManager = false" 
  />
</template>

<script setup>
import { ref, computed, watch, onMounted, onActivated } from 'vue'
import { useAppStore } from '../stores/app'
import * as api from '../services/api'
import OnboardingAI from '../components/OnboardingAI.vue'
import MiniTaskWelcome from '../components/MiniTaskWelcome.vue'
import MiniTask from '../components/MiniTask.vue'
import JournalEntry from '../components/JournalEntry.vue'
import PlanReview from '../components/PlanReview.vue'
import HabitTracker from '../components/HabitTracker.vue'
import HabitManagerModal from '../components/HabitManagerModal.vue'
import DailyProgressBar from '../components/DailyProgressBar.vue'
import XpBadge from '../components/XpBadge.vue'
import { useActivationStore } from '@/stores/activation'
import { useXpStore } from '@/stores/xp'
import { useXPNotification } from '@/composables/useXPNotification.js'
import { DEBUG_MODE } from '@/config/settings.js'
import { 
  Sun,
  Sunset,
  Moon,
  Target, 
  Crosshair,
  Check,
  Plus,
  Flame,
  MessageCircle,
  Sparkles,
  Flag,
  X,
  Settings
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const store = useAppStore()
const activationStore = useActivationStore()
const xpStore = useXpStore()
const { showStepCompletedXP, XP_AMOUNTS } = useXPNotification()
const router = useRouter()
const showJournalModal = ref(false)
const showMiniTask = ref(false)
const showHabitManager = ref(false)

activationStore.init()

function triggerMentorSpotlight() {
  if (DEBUG_MODE) {
    console.log('[Dashboard] Triggering mentor spotlight mode')
  }
  
  store.enableMentorSpotlight()
  
  setTimeout(() => {
    if (store.mentor.messages.length === 0) {
      const welcomeMessage = `Привет! 👋

Я проанализировал твои ответы из диагностики и создал для тебя персональные цели.

Давай я помогу тебе начать. Вот что рекомендую сделать первым делом:

→ **Выбери 1-3 важных дела на сегодня** в разделе «Планирование»

Это поможет сфокусироваться на главном и сразу начать двигаться к целям.

Готов начать?`
      
      store.sendMentorMessage(welcomeMessage, 'assistant')
      if (DEBUG_MODE) {
        console.log('[Dashboard] Sent mentor welcome message')
      }
    }
    activationStore.completeMentorIntro()
    activationStore.setGuidanceStep('select_focus')
  }, 500)
}

async function refreshDashboardData() {
  try {
    const result = await api.getUserData()
    if (result.status === 'ok' && result.data) {
      store.setUser(result.data)
      if (DEBUG_MODE) {
        console.log('[Dashboard] Data refreshed:', {
          todayTasks: result.data.today_tasks?.total_count || 0,
          topGoals: result.data.top_goals?.goals?.length || 0
        })
      }
    }
  } catch (error) {
    console.error('[Dashboard] Failed to refresh data:', error)
  }
}

watch(() => store.user.finish_onboarding, async (finished, oldVal) => {
  if (DEBUG_MODE) {
    console.log('[Dashboard] Mentor intro watch:', {
      finish_onboarding: finished,
      oldVal,
      mentorIntroCompleted: activationStore.mentorIntroCompleted,
      isAllCompleted: activationStore.isAllCompleted
    })
  }
  if (finished && !oldVal) {
    await refreshDashboardData()
  }
  if (finished && !activationStore.mentorIntroCompleted && !activationStore.isAllCompleted) {
    triggerMentorSpotlight()
  }
})

onMounted(async () => {
  if (DEBUG_MODE) {
    console.log('[Dashboard] onMounted mentor intro check:', {
      finish_onboarding: store.user.finish_onboarding,
      mentorIntroCompleted: activationStore.mentorIntroCompleted,
      isAllCompleted: activationStore.isAllCompleted
    })
  }
  
  if (store.user.finish_onboarding) {
    await refreshDashboardData()
  }
  
  if (store.user.finish_onboarding && !activationStore.mentorIntroCompleted && !activationStore.isAllCompleted) {
    triggerMentorSpotlight()
  }
})

onActivated(async () => {
  if (DEBUG_MODE) {
    console.log('[Dashboard] onActivated - refreshing data')
  }
  if (store.user.finish_onboarding) {
    await refreshDashboardData()
  }
})

const userName = computed(() => store.displayName)
const averageScore = computed(() => store.averageScore)
const journalStreak = computed(() => store.journalStreak)
const hasTodayEntry = computed(() => store.hasTodayEntry)
const showPlanReview = computed(() => store.showPlanReview)

// Данные из API get-user-data (с защитными проверками)
const defaultTodayTasks = { total_count: 0, completed_count: 0, tasks: [] }
const defaultTopGoals = { total_incomplete_goals: 0, goals: [] }
const apiTodayTasks = computed(() => {
  try {
    return store.userDashboardData?.today_tasks || defaultTodayTasks
  } catch {
    return defaultTodayTasks
  }
})
const apiTopGoals = computed(() => {
  try {
    return store.userDashboardData?.top_goals || defaultTopGoals
  } catch {
    return defaultTopGoals
  }
})

const currentHour = computed(() => new Date().getHours())

const timeOfDay = computed(() => {
  const hour = currentHour.value
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  return 'evening'
})

const timeOfDayClass = computed(() => timeOfDay.value)

const timeIcon = computed(() => {
  switch (timeOfDay.value) {
    case 'morning': return Sun
    case 'afternoon': return Sun
    case 'evening': return Moon
    default: return Sun
  }
})

const greeting = computed(() => {
  switch (timeOfDay.value) {
    case 'morning': return 'Доброе утро'
    case 'afternoon': return 'Добрый день'
    case 'evening': return 'Добрый вечер'
    default: return 'Привет'
  }
})

const dayMessage = computed(() => {
  const hour = currentHour.value
  if (hour >= 5 && hour < 9) return 'Отличное время для планирования дня'
  if (hour >= 9 && hour < 12) return 'Время для важных дел'
  if (hour >= 12 && hour < 14) return 'Не забудьте про перерыв'
  if (hour >= 14 && hour < 18) return 'Продолжайте двигаться к целям'
  if (hour >= 18 && hour < 21) return 'Время подвести итоги дня'
  return 'Отдохните и подготовьтесь к завтра'
})

const isEvening = computed(() => currentHour.value >= 18)

// Фокус дня - используем данные из API today_tasks (показываем все задачи со скроллом)
const focusTasks = computed(() => {
  const tasks = apiTodayTasks.value.tasks || []
  return tasks.map(task => ({
    id: task.step_id,
    title: task.step_title,
    completed: task.is_complete,
    sphere: task.goal_title,
    priority: task.priority,
    goalId: task.goal_id
  }))
})

const completedFocusTasks = computed(() => {
  return apiTodayTasks.value.completed_count || 0
})

const totalFocusTasks = computed(() => {
  return apiTodayTasks.value.total_count || 0
})

const mentorHint = computed(() => {
  if (focusTasks.value.length === 0) return 'Помогу выбрать задачи на сегодня'
  if (completedFocusTasks.value === focusTasks.value.length) return 'Отлично! Все задачи выполнены'
  return 'Готов помочь с текущими задачами'
})

// Маппинг категорий на иконки
const categoryIcons = {
  welfare: '💰',
  hobby: '🎯',
  environment: '👥',
  health_sport: '❤️',
  work: '💼',
  family: '👨‍👩‍👧'
}

// Мои цели - используем данные из API top_goals
const totalIncompleteGoals = computed(() => {
  return apiTopGoals.value.total_incomplete_goals || 0
})

const topGoals = computed(() => {
  const goals = apiTopGoals.value.goals || []
  return goals.map(goal => ({
    id: goal.goal_id,
    backendId: goal.goal_id,
    title: goal.title,
    sphereIcon: categoryIcons[goal.category] || '🎯',
    progress: goal.progress_percent || 0,
    totalSteps: goal.total_steps,
    completedSteps: goal.completed_steps,
    status: goal.status,
    category: goal.category
  }))
})

function goToGoal(goal) {
  const goalId = goal.backendId || goal.id
  router.push(`/app/goals/${goalId}`)
}

const shouldShowOnboarding = computed(() => {
  const show = store.shouldShowOnboarding
  if (DEBUG_MODE) {
    console.log('[Dashboard] shouldShowOnboarding:', show)
  }
  return show
})

const shouldShowMiniTask = computed(() => {
  const show = store.shouldShowMiniTask
  if (DEBUG_MODE) {
    console.log('[Dashboard] shouldShowMiniTask:', show)
  }
  return show
})

const isMiniTaskCompleted = computed(() => store.miniTask.completed)

function onMiniTaskComplete() {
  showMiniTask.value = false
}

function onMiniTaskSkip() {
  store.skipMiniTask()
}

async function toggleFocusTask(task) {
  const tasksArray = store.userDashboardData?.today_tasks?.tasks
  const apiTask = tasksArray?.find(t => t.step_id === task.id)
  
  // Читаем текущее состояние напрямую из API данных
  const currentCompleted = apiTask?.is_complete || false
  const newCompleted = !currentCompleted
  
  console.log('[Dashboard] toggleFocusTask:', { 
    taskId: task.id, 
    goalId: task.goalId,
    currentCompleted, 
    newCompleted 
  })
  
  // Track activation task - user marked a focus task as complete (select_focus)
  if (newCompleted) {
    try {
      const result = activationStore.completeTask('select_focus')
      if (result.completed && result.message) {
        store.sendMentorMessage(result.message, 'assistant')
      }
    } catch (e) {
      console.error('[Dashboard] Activation tracking error:', e)
    }
  }
  
  // Optimistic update - мгновенно обновляем UI
  if (apiTask) {
    apiTask.is_complete = newCompleted
    // Обновляем счётчики
    if (newCompleted) {
      store.userDashboardData.today_tasks.completed_count++
    } else {
      store.userDashboardData.today_tasks.completed_count--
    }
  }
  
  // Синхронизация с store.goals для Planning страницы
  const storeGoal = store.goals.find(g => g.backendId === task.goalId || g.id === task.goalId)
  const storeStep = storeGoal?.steps?.find(s => s.backendId === task.id || s.id === task.id)
  if (storeStep) {
    storeStep.completed = newCompleted
    console.log('[Dashboard] Synced step.completed in store.goals')
  }
  
  // Синхронизация с блоком "Мои цели" (top_goals)
  const topGoalsArray = store.userDashboardData?.top_goals?.goals
  const topGoal = topGoalsArray?.find(g => g.goal_id === task.goalId)
  if (topGoal) {
    // Обновляем счётчик выполненных шагов
    if (newCompleted) {
      topGoal.completed_steps = (topGoal.completed_steps || 0) + 1
    } else {
      topGoal.completed_steps = Math.max(0, (topGoal.completed_steps || 1) - 1)
    }
    // Пересчитываем прогресс
    if (topGoal.total_steps > 0) {
      topGoal.progress_percent = Math.round((topGoal.completed_steps / topGoal.total_steps) * 100)
    }
    console.log('[Dashboard] Synced progress in top_goals:', {
      goalId: task.goalId,
      completedSteps: topGoal.completed_steps,
      totalSteps: topGoal.total_steps,
      progress: topGoal.progress_percent
    })
  }
  
  try {
    const { updateGoalSteps } = await import('@/services/api.js')
    console.log('[Dashboard] Sending updateGoalSteps:', { goal_id: task.goalId, step_id: task.id, is_complete: newCompleted })
    await updateGoalSteps({
      goals_steps_data: [{
        goal_id: task.goalId,
        step_id: task.id,
        is_complete: newCompleted
      }]
    })
    console.log('[Dashboard] updateGoalSteps success')
    
    // XP обновление и уведомление
    if (newCompleted) {
      showStepCompletedXP()
      xpStore.addToBalance(XP_AMOUNTS.goal_step_completed)
    } else {
      xpStore.addToBalance(-XP_AMOUNTS.goal_step_completed)
    }
  } catch (error) {
    console.error('[Dashboard] Error toggling focus task:', error)
    // Откатываем изменения при ошибке
    if (apiTask) {
      apiTask.is_complete = currentCompleted
      if (newCompleted) {
        store.userDashboardData.today_tasks.completed_count--
      } else {
        store.userDashboardData.today_tasks.completed_count++
      }
    }
    // Откат top_goals
    if (topGoal) {
      if (newCompleted) {
        topGoal.completed_steps = Math.max(0, (topGoal.completed_steps || 1) - 1)
      } else {
        topGoal.completed_steps = (topGoal.completed_steps || 0) + 1
      }
      if (topGoal.total_steps > 0) {
        topGoal.progress_percent = Math.round((topGoal.completed_steps / topGoal.total_steps) * 100)
      }
    }
  }
}

function openMentorPanel() {
  if (window.innerWidth < 1024) {
    store.openMentorMobile()
  } else {
    store.toggleMentorPanel(false)
  }
}

function onPlanConfirmed() {
  if (DEBUG_MODE) {
    console.log('[Dashboard] AI Plan confirmed, tasks added to daily plan')
  }
}

function pluralize(n, one, few, many) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}
</script>

<style scoped>
.dashboard-wrapper {
  display: flex;
  min-height: 100%;
}

.dashboard {
  flex: 1;
  min-width: 0;
}

.day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.greeting-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.time-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-icon.morning {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15));
  color: #f59e0b;
}

.time-icon.afternoon {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.15));
  color: #3b82f6;
}

.time-icon.evening {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(168, 85, 247, 0.15));
  color: #8b5cf6;
}

.greeting-text h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}

.day-subtitle {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.9375rem;
}

.header-badges {
  display: flex;
  gap: 0.75rem;
}

.streak-badge,
.balance-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 600;
}

.streak-badge {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.15));
  color: var(--warning-color);
}

.balance-badge {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  color: var(--primary-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.balance-badge:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
  transform: translateY(-1px);
}

.progress-section {
  margin-bottom: 1.5rem;
}

.day-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.focus-goals-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 1.25rem;
  align-items: start;
}

.focus-card {
  grid-row: span 2;
}

.habits-widget {
  align-self: start;
}

@media (max-width: 768px) {
  .focus-goals-grid {
    grid-template-columns: 1fr;
  }
  
  .focus-card {
    grid-row: auto;
    max-height: 400px;
  }
}

.card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.focus-card:hover,
.goals-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.card-title svg {
  color: var(--primary-color);
}

.card-body {
  padding: 1.25rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.focus-count {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-color);
  background: rgba(99, 102, 241, 0.1);
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
}

.settings-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
}

.settings-btn:hover {
  background: var(--bg-secondary);
  color: var(--primary-color);
}

.empty-focus {
  text-align: center;
  padding: 2rem 1rem;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
}

.empty-focus p {
  color: var(--text-secondary);
  margin: 0 0 1.25rem 0;
}

.focus-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 540px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
}

.focus-list::-webkit-scrollbar {
  width: 4px;
}

.focus-list::-webkit-scrollbar-track {
  background: transparent;
}

.focus-list::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}

.focus-list::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

.focus-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  border-left: 3px solid transparent;
}

.focus-item:hover {
  transform: translateX(4px);
  border-left-color: var(--primary-color);
  background: var(--bg-tertiary);
}

.focus-item.completed {
  opacity: 0.6;
}

.focus-item.completed .focus-title {
  text-decoration: line-through;
  color: var(--text-tertiary);
}

.focus-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--border-color, #d1d5db);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  color: white;
}

.focus-check:hover {
  border-color: var(--primary, #6366f1);
  background: var(--primary-light, rgba(99, 102, 241, 0.1));
}

.focus-check.checked {
  background: var(--success-color, #10b981);
  border-color: var(--success-color, #10b981);
}

.focus-check.just-checked {
  animation: task-check-pop 0.25s ease;
}

.focus-item.just-completed {
  animation: task-complete 0.3s ease;
}

.focus-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.focus-title {
  font-weight: 500;
  font-size: 0.9375rem;
}

.focus-sphere {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.more-tasks-link {
  display: block;
  text-align: center;
  padding: 0.625rem;
  color: var(--primary-color);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
}

.more-tasks-link:hover {
  text-decoration: underline;
}

.goals-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
}

.goals-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.5rem;
  background: var(--primary-light);
  color: var(--primary-color);
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 999px;
}

.empty-goals {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  text-align: center;
}

.empty-goals .empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.empty-goals p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  font-size: 0.9375rem;
}

.goals-list {
  display: flex;
  flex-direction: column;
}

.goal-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  cursor: pointer;
  transition: background-color var(--transition-fast), transform var(--transition-fast), border-color var(--transition-fast);
  border-bottom: 1px solid var(--border-color);
  border-left: 3px solid transparent;
}

.goal-item:last-of-type {
  border-bottom: none;
}

.goal-item:hover {
  background: var(--bg-secondary);
  transform: translateX(4px);
  border-left-color: var(--primary-color);
}

.goal-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.goal-sphere-badge {
  font-size: 1rem;
  flex-shrink: 0;
}

.goal-title {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goal-progress-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.goal-progress-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.goal-progress-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.goal-progress-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 2.5rem;
  text-align: right;
}

.more-goals-link {
  display: block;
  text-align: center;
  padding: 0.625rem;
  color: var(--primary-color);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
}

.more-goals-link:hover {
  text-decoration: underline;
}

.habits-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (max-width: 600px) {
  .habits-row {
    grid-template-columns: 1fr;
  }
}

.habit-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem 1.25rem;
}

.habit-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.habit-icon.journal {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.habit-icon.balance {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
}

.habit-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.habit-name {
  font-weight: 600;
  font-size: 0.9375rem;
}

.habit-status {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

.habit-status.done {
  color: var(--success-color);
}

.habit-action {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-color);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  text-decoration: none;
}

.habit-action:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.habit-check {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--success-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.evening-card {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(168, 85, 247, 0.08));
  border-color: rgba(139, 92, 246, 0.15);
}

.evening-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
}

.evening-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.evening-text {
  flex: 1;
}

.evening-text h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.evening-text p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.mentor-cta {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.06), rgba(139, 92, 246, 0.06));
  border-color: rgba(99, 102, 241, 0.12);
}

.mentor-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
}

.mentor-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--primary-color), #a78bfa);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mentor-text {
  flex: 1;
}

.mentor-text h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.mentor-text p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

@media (max-width: 768px) {
  .day-header {
    padding-left: 3.5rem;
  }
}

@media (max-width: 600px) {
  .day-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .mentor-content {
    flex-wrap: wrap;
    gap: 0.75rem;
    padding: 1rem;
  }
  
  .mentor-avatar {
    width: 40px;
    height: 40px;
  }
  
  .mentor-text {
    flex: 1;
    min-width: 0;
  }
  
  .mentor-text p {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .mentor-content .btn {
    width: 100%;
    justify-content: center;
    margin-top: 0.25rem;
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  z-index: 10;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Dark theme overrides */
:root.dark .habit-streak {
  color: var(--warning-color);
}

:root.dark .habit-info {
  color: #60a5fa;
}

:root.dark .habit-complete {
  color: var(--secondary-color);
}

:root.dark .section-card {
  background: var(--card-bg);
  border-color: var(--border-color);
}

:root.dark .stat-value {
  color: var(--text-primary);
}

/* =============================================
   MOBILE ADAPTATION STYLES
   ============================================= */

@media (max-width: 768px) {
  .dashboard-wrapper {
    padding-bottom: calc(var(--bottom-nav-height, 56px) + env(safe-area-inset-bottom, 0px) + 1rem);
  }

  .dashboard {
    max-width: 100%;
  }

  .day-header {
    padding: 1rem 0;
    gap: 0.75rem;
  }

  .greeting-section {
    gap: 0.75rem;
  }

  .time-icon {
    width: 40px;
    height: 40px;
  }

  .time-icon svg {
    width: 20px;
    height: 20px;
  }

  .greeting-text h1 {
    font-size: 1.25rem;
  }

  .day-subtitle {
    font-size: 0.8125rem;
  }

  .header-badges {
    gap: 0.5rem;
  }

  .streak-badge {
    padding: 0.25rem 0.625rem;
    font-size: 0.75rem;
  }

  .card-header {
    padding: 0.875rem 1rem;
  }

  .card-body {
    padding: 1rem;
  }

  .focus-item {
    padding: 0.75rem;
    gap: 0.75rem;
    min-height: var(--touch-target, 44px);
  }

  .focus-check {
    width: 24px;
    height: 24px;
  }

  .goal-item {
    padding: 0.75rem;
    min-height: var(--touch-target, 44px);
  }

  .evening-content,
  .mentor-content {
    padding: 1rem;
    gap: 0.75rem;
  }

  .evening-icon,
  .mentor-avatar {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 375px) {
  .greeting-text h1 {
    font-size: 1.125rem;
  }

  .day-subtitle {
    font-size: 0.75rem;
  }

  .time-icon {
    width: 36px;
    height: 36px;
  }
}
</style>
