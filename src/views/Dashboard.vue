<template>
  <OnboardingAI v-if="shouldShowOnboarding" />

  <MiniTaskWelcome 
    v-else-if="shouldShowMiniTask && !showMiniTask" 
    @start="showMiniTask = true"
    @skip="onMiniTaskSkip"
  />

  <MiniTask 
    v-else-if="showMiniTask && !isMiniTaskCompleted" 
    @complete="onMiniTaskComplete"
  />

  <div v-else class="dashboard-wrapper">
    <div :class="['dashboard', { 'panel-collapsed': isMentorPanelCollapsed }]">
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
          <div class="streak-badge" v-if="journalStreak > 0">
            <Flame :size="16" :stroke-width="1.5" />
            <span>{{ journalStreak }} {{ pluralize(journalStreak, 'день', 'дня', 'дней') }}</span>
          </div>
          <div class="balance-badge">
            <Target :size="16" :stroke-width="1.5" />
            <span>{{ averageScore }}/10</span>
          </div>
        </div>
      </header>

      <div class="day-content">
        <div class="card focus-card">
          <div class="card-header">
            <h3 class="card-title">
              <Crosshair :size="18" :stroke-width="1.5" />
              Фокус дня
            </h3>
            <span class="focus-count">{{ completedFocusTasks }}/{{ focusTasks.length }}</span>
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
                  <Check v-if="task.completed" :size="16" :stroke-width="2" />
                </button>
                <div class="focus-content">
                  <span class="focus-title">{{ task.title }}</span>
                  <span class="focus-sphere" v-if="task.sphere">{{ task.sphere }}</span>
                </div>
              </div>
              <router-link 
                v-if="dailyTasks.length > 3"
                to="/app/planning" 
                class="more-tasks-link"
              >
                +{{ dailyTasks.length - 3 }} {{ pluralize(dailyTasks.length - 3, 'задача', 'задачи', 'задач') }}
              </router-link>
            </div>
          </div>
        </div>

        <div class="habits-row">
          <div class="card habit-card">
            <div class="habit-icon journal">
              <BookOpen :size="20" :stroke-width="1.5" />
            </div>
            <div class="habit-info">
              <span class="habit-name">Дневник</span>
              <span class="habit-status" :class="{ done: hasTodayEntry }">
                {{ hasTodayEntry ? 'Записано' : 'Не записано' }}
              </span>
            </div>
            <button 
              v-if="!hasTodayEntry"
              class="habit-action"
              @click="showJournalModal = true"
            >
              <Plus :size="16" :stroke-width="2" />
            </button>
            <div v-else class="habit-check">
              <Check :size="16" :stroke-width="2" />
            </div>
          </div>

          <div class="card habit-card">
            <div class="habit-icon balance">
              <ChartPie :size="20" :stroke-width="1.5" />
            </div>
            <div class="habit-info">
              <span class="habit-name">Баланс</span>
              <span class="habit-status">{{ averageScore }}/10</span>
            </div>
            <router-link to="/app/ssp" class="habit-action">
              <ChevronRight :size="16" :stroke-width="2" />
            </router-link>
          </div>
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

        <div class="quick-links">
          <router-link to="/app/goals-bank" class="quick-link">
            <Lightbulb :size="18" :stroke-width="1.5" />
            <span>Банк целей</span>
          </router-link>
          <router-link to="/app/planning" class="quick-link">
            <Calendar :size="18" :stroke-width="1.5" />
            <span>Планирование</span>
          </router-link>
          <router-link to="/app/journal" class="quick-link">
            <BookOpen :size="18" :stroke-width="1.5" />
            <span>Дневник</span>
          </router-link>
        </div>
      </div>
    </div>
    
    <MentorPanel />
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
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'
import OnboardingAI from '../components/OnboardingAI.vue'
import MiniTaskWelcome from '../components/MiniTaskWelcome.vue'
import MiniTask from '../components/MiniTask.vue'
import JournalEntry from '../components/JournalEntry.vue'
import MentorPanel from '../components/MentorPanel.vue'
import PlanReview from '../components/PlanReview.vue'
import { DEBUG_MODE } from '@/config/settings.js'
import { 
  Sun,
  Sunset,
  Moon,
  Target, 
  Crosshair,
  Check,
  Plus,
  BookOpen,
  Calendar,
  ChartPie,
  ChevronRight,
  Lightbulb,
  Flame,
  MessageCircle,
  Sparkles,
  X
} from 'lucide-vue-next'

const store = useAppStore()
const showJournalModal = ref(false)
const showMiniTask = ref(false)

const userName = computed(() => store.displayName)
const averageScore = computed(() => store.averageScore)
const dailyTasks = computed(() => store.dailyPlan.tasks || [])
const journalStreak = computed(() => store.journalStreak)
const hasTodayEntry = computed(() => store.hasTodayEntry)
const isMentorPanelCollapsed = computed(() => store.mentorPanelCollapsed)
const showPlanReview = computed(() => store.showPlanReview)

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

const focusTasks = computed(() => {
  return dailyTasks.value.slice(0, 3)
})

const completedFocusTasks = computed(() => {
  return focusTasks.value.filter(t => t.completed).length
})

const mentorHint = computed(() => {
  if (focusTasks.value.length === 0) return 'Помогу выбрать задачи на сегодня'
  if (completedFocusTasks.value === focusTasks.value.length) return 'Отлично! Все задачи выполнены'
  return 'Готов помочь с текущими задачами'
})

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

function toggleFocusTask(task) {
  store.toggleTask(task.id)
}

function openMentorPanel() {
  store.toggleMentorPanel(false)
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
  padding-right: 500px;
  transition: padding-right 0.3s ease;
}

.dashboard.panel-collapsed {
  padding-right: 100px;
}

@media (max-width: 1024px) {
  .dashboard {
    padding-right: 0;
  }
  
  .dashboard.panel-collapsed {
    padding-right: 0;
  }
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
}

.day-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
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

.focus-count {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-color);
  background: rgba(99, 102, 241, 0.1);
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
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
}

.focus-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.focus-item.completed {
  opacity: 0.6;
}

.focus-item.completed .focus-title {
  text-decoration: line-through;
  color: var(--text-tertiary);
}

.focus-check {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  border: 2px solid var(--border-color);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.focus-check:hover {
  border-color: var(--primary-color);
}

.focus-check.checked {
  background: var(--success-color);
  border-color: var(--success-color);
  color: white;
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

.quick-links {
  display: flex;
  gap: 0.75rem;
  padding-top: 0.5rem;
}

.quick-link {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.quick-link:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

@media (max-width: 600px) {
  .quick-links {
    flex-direction: column;
  }
  
  .day-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
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
</style>
