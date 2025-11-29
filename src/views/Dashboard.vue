<template>
  <Onboarding v-if="shouldShowOnboarding" />

  <MiniTaskWelcome 
    v-else-if="shouldShowMiniTask && !showMiniTask" 
    @start="showMiniTask = true"
    @skip="onMiniTaskSkip"
  />

  <MiniTask 
    v-else-if="showMiniTask && !isMiniTaskCompleted" 
    @complete="onMiniTaskComplete"
  />

  <div v-else class="dashboard">
    <header class="page-header">
      <div>
        <h1>Привет, {{ userName }}</h1>
        <p class="subtitle">Ваша система управления жизнью и достижения целей</p>
      </div>
      <div class="header-stats">
        <div class="stat-badge" v-if="journalStreak > 0">
          <Flame :size="16" :stroke-width="1.5" />
          <span>{{ journalStreak }} {{ pluralize(journalStreak, 'день', 'дня', 'дней') }}</span>
        </div>
      </div>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon-wrapper primary">
          <Target :size="24" :stroke-width="1.5" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ averageScore }}/10</div>
          <div class="stat-label">Общий баланс</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper success">
          <TrendingUp :size="24" :stroke-width="1.5" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ activeGoals }}</div>
          <div class="stat-label">Активных целей</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper warning">
          <CheckCircle :size="24" :stroke-width="1.5" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ completedGoals }}</div>
          <div class="stat-label">Достигнуто</div>
        </div>
      </div>
    </div>

    <div class="main-layout">
      <div class="main-content">
        <FirstSteps v-if="!allFirstStepsCompleted" />
        
        <JournalWidget @open="showJournalModal = true" />

        <div class="card current-tasks">
          <div class="card-header">
            <h3 class="card-title">
              <ListTodo :size="18" :stroke-width="1.5" />
              Задачи на сегодня
            </h3>
            <router-link to="/app/planning" class="view-all-btn">
              <Calendar :size="16" :stroke-width="1.5" />
              Планировщик
            </router-link>
          </div>
          <div class="card-body">
            <div v-if="dailyTasks.length === 0" class="empty-state-mini">
              <p>Нет задач на сегодня</p>
              <router-link to="/app/planning" class="btn btn-sm btn-primary">
                Добавить задачи
              </router-link>
            </div>
            <div v-else class="tasks-list">
              <label 
                v-for="task in dailyTasks.slice(0, 5)" 
                :key="task.id"
                class="task-item"
              >
                <input 
                  type="checkbox"
                  v-model="task.completed"
                  @change="updateTask(task)"
                />
                <span :class="{ completed: task.completed }">{{ task.title }}</span>
              </label>
              <router-link 
                v-if="dailyTasks.length > 5"
                to="/app/planning" 
                class="view-all-link"
              >
                Показать все ({{ dailyTasks.length }})
              </router-link>
            </div>
          </div>
        </div>

        <div class="card quick-actions">
          <div class="card-header">
            <h3 class="card-title">
              <Zap :size="18" :stroke-width="1.5" />
              Быстрые действия
            </h3>
          </div>
          <div class="card-body">
            <router-link to="/app/ssp" class="action-link">
              <ChartPie :size="20" :stroke-width="1.5" class="action-icon" />
              <div class="action-content">
                <div class="action-title">Обновить ССП</div>
                <div class="action-desc">Переоценить сферы жизни</div>
              </div>
              <ChevronRight :size="18" :stroke-width="1.5" class="arrow" />
            </router-link>

            <router-link to="/app/goals/new" class="action-link">
              <Plus :size="20" :stroke-width="1.5" class="action-icon" />
              <div class="action-content">
                <div class="action-title">Новая цель</div>
                <div class="action-desc">Создать и декомпозировать</div>
              </div>
              <ChevronRight :size="18" :stroke-width="1.5" class="arrow" />
            </router-link>

            <router-link to="/app/journal" class="action-link">
              <BookOpen :size="20" :stroke-width="1.5" class="action-icon" />
              <div class="action-content">
                <div class="action-title">История дневника</div>
                <div class="action-desc">Все ваши записи</div>
              </div>
              <ChevronRight :size="18" :stroke-width="1.5" class="arrow" />
            </router-link>
          </div>
        </div>
      </div>

      <aside class="sidebar-widgets">
        <MentorWidget />
        
        <div class="card spheres-widget">
          <div class="card-header">
            <h3 class="card-title">
              <ChartPie :size="18" :stroke-width="1.5" />
              Сферы жизни
            </h3>
          </div>
          <div class="card-body">
            <div class="spheres-list">
              <div 
                v-for="sphere in lifeSpheres" 
                :key="sphere.id"
                class="sphere-item"
              >
                <span class="sphere-icon">{{ sphere.icon }}</span>
                <span class="sphere-name">{{ sphere.name }}</span>
                <div class="sphere-bar">
                  <div 
                    class="sphere-fill" 
                    :style="{ width: `${(sphere.score / 10) * 100}%` }"
                  ></div>
                </div>
                <span class="sphere-score">{{ sphere.score }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card motivation-card">
          <div class="motivation-content">
            <Lightbulb :size="28" :stroke-width="1.5" class="motivation-icon" />
            <div>
              <h4 class="motivation-title">Эффект 1%</h4>
              <p class="motivation-text">
                Улучшая каждый день на 1%, за год вы станете сильнее в 37 раз.
              </p>
            </div>
          </div>
        </div>
      </aside>
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
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'
import Onboarding from '../components/Onboarding.vue'
import MiniTaskWelcome from '../components/MiniTaskWelcome.vue'
import MiniTask from '../components/MiniTask.vue'
import JournalWidget from '../components/JournalWidget.vue'
import JournalEntry from '../components/JournalEntry.vue'
import MentorWidget from '../components/MentorWidget.vue'
import FirstSteps from '../components/FirstSteps.vue'
import { DEBUG_MODE } from '@/config/settings.js'
import { 
  Target, 
  TrendingUp, 
  CheckCircle, 
  ListTodo, 
  Calendar, 
  Zap,
  ChartPie,
  Plus,
  BookOpen,
  ChevronRight,
  Lightbulb,
  Flame,
  X
} from 'lucide-vue-next'

const store = useAppStore()
const showJournalModal = ref(false)
const showMiniTask = ref(false)

const userName = computed(() => store.displayName)
const averageScore = computed(() => store.averageScore)
const activeGoals = computed(() => store.activeGoals)
const completedGoals = computed(() => store.completedGoals)
const lifeSpheres = computed(() => store.lifeSpheres)
const dailyTasks = computed(() => store.dailyPlan.tasks)
const journalStreak = computed(() => store.journalStreak)
const allFirstStepsCompleted = computed(() => store.allFirstStepsCompleted)

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

function updateTask(task) {
  store.toggleTask(task.id)
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
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: var(--text-secondary);
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 0.75rem;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.15));
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--warning-color);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-wrapper.primary {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  color: var(--primary-color);
}

.stat-icon-wrapper.success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.stat-icon-wrapper.warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.8125rem;
}

.main-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.view-all-btn:hover {
  color: var(--primary-color);
}

.card-body {
  padding: 1.25rem;
}

.empty-state-mini {
  text-align: center;
  padding: 1.5rem 1rem;
  color: var(--text-secondary);
}

.empty-state-mini p {
  margin: 0 0 1rem 0;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.5rem;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background 0.2s;
}

.task-item:hover {
  background: var(--bg-secondary);
}

.task-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--primary-color);
  flex-shrink: 0;
}

.task-item span {
  font-size: 0.9375rem;
}

.task-item span.completed {
  text-decoration: line-through;
  color: var(--text-tertiary);
}

.view-all-link {
  display: block;
  text-align: center;
  padding: 0.75rem 0.5rem;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
}

.action-link {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem;
  border-radius: var(--radius-md);
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
}

.action-link:last-child {
  margin-bottom: 0;
}

.action-link:hover {
  background: var(--bg-secondary);
}

.action-link:hover .arrow {
  transform: translateX(4px);
  color: var(--primary-color);
}

.action-icon {
  color: var(--primary-color);
  flex-shrink: 0;
}

.action-content {
  flex: 1;
}

.action-title {
  font-weight: 600;
  font-size: 0.9375rem;
  margin-bottom: 0.125rem;
}

.action-desc {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.arrow {
  color: var(--text-tertiary);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.sidebar-widgets {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.spheres-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sphere-item {
  display: grid;
  grid-template-columns: 24px 1fr 70px 24px;
  align-items: center;
  gap: 0.5rem;
}

.sphere-icon {
  font-size: 1rem;
}

.sphere-name {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sphere-bar {
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.sphere-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: 3px;
  transition: width 0.3s ease;
}

.sphere-score {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-align: right;
}

.motivation-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08));
  border-color: rgba(99, 102, 241, 0.15);
}

.motivation-content {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  align-items: flex-start;
}

.motivation-icon {
  color: var(--primary-color);
  flex-shrink: 0;
}

.motivation-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.375rem 0;
}

.motivation-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
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
