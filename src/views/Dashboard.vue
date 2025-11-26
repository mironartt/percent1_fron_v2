<template>
  <!-- Show Onboarding if needed -->
  <Onboarding v-if="shouldShowOnboarding" />

  <!-- Show Mini Task Welcome if onboarding done but mini task not started -->
  <MiniTaskWelcome 
    v-else-if="shouldShowMiniTask && !showMiniTask" 
    @start="showMiniTask = true"
  />

  <!-- Show Mini Task if started -->
  <MiniTask v-else-if="showMiniTask && !isMiniTaskCompleted" />

  <!-- Show Dashboard if everything completed -->
  <div v-else class="dashboard">
    <header class="page-header">
      <div>
        <h1 class="greeting-title">Привет, {{ userName }} <Hand :size="28" :stroke-width="1.5" class="greeting-icon" /></h1>
        <p class="subtitle">Ваша система управления жизнью и достижения целей</p>
      </div>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon"><Target :size="32" :stroke-width="1.5" /></div>
        <div class="stat-content">
          <div class="stat-value">{{ averageScore }}/10</div>
          <div class="stat-label">Общий баланс жизни</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon"><Rocket :size="32" :stroke-width="1.5" /></div>
        <div class="stat-content">
          <div class="stat-value">{{ activeGoals }}</div>
          <div class="stat-label">Активных целей</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon"><CheckCircle :size="32" :stroke-width="1.5" /></div>
        <div class="stat-content">
          <div class="stat-value">{{ completedGoals }}</div>
          <div class="stat-label">Достигнутых целей</div>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <div class="card quick-actions">
        <div class="card-header">
          <h3 class="card-title">Быстрые действия</h3>
        </div>
        <div class="card-body">
          <router-link to="/app/ssp" class="action-link">
            <span class="action-icon"><Target :size="24" :stroke-width="1.5" /></span>
            <div class="action-content">
              <div class="action-title">Оценить сферы жизни</div>
              <div class="action-desc">Проведите саморефлексию и оцените баланс</div>
            </div>
          </router-link>

          <router-link to="/app/goals" class="action-link">
            <span class="action-icon"><Rocket :size="24" :stroke-width="1.5" /></span>
            <div class="action-content">
              <div class="action-title">Создать новую цель</div>
              <div class="action-desc">Поставьте цель и декомпозируйте её</div>
            </div>
          </router-link>

          <router-link to="/app/planner" class="action-link">
            <span class="action-icon"><Calendar :size="24" :stroke-width="1.5" /></span>
            <div class="action-content">
              <div class="action-title">Спланировать день</div>
              <div class="action-desc">Определите приоритеты на сегодня</div>
            </div>
          </router-link>
        </div>
      </div>

      <div class="card current-tasks">
        <div class="card-header">
          <h3 class="card-title">Текущие задачи</h3>
        </div>
        <div class="card-body">
          <div v-if="dailyTasks.length === 0" class="empty-state-mini">
            <p>Нет задач на сегодня</p>
            <router-link to="/app/planner" class="btn btn-sm btn-primary" style="margin-top: 1rem;">
              Добавить задачи
            </router-link>
          </div>
          <div v-else class="tasks-preview">
            <label 
              v-for="task in dailyTasks.slice(0, 5)" 
              :key="task.id"
              class="task-preview-item"
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
              to="/app/planner" 
              class="view-all-link"
            >
              Показать все ({{ dailyTasks.length }})
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <div class="card insights">
        <div class="card-header">
          <h3 class="card-title">Сферы жизни</h3>
        </div>
        <div class="card-body">
          <div class="spheres-preview">
            <div 
              v-for="sphere in lifeSpheres" 
              :key="sphere.id"
              class="sphere-preview-item"
            >
              <div class="sphere-preview-header">
                <span class="sphere-icon">{{ sphere.icon }}</span>
                <span class="sphere-name">{{ sphere.name }}</span>
              </div>
              <div class="sphere-score">
                <div class="score-bar">
                  <div 
                    class="score-fill" 
                    :style="{ width: `${(sphere.score / 10) * 100}%` }"
                  ></div>
                </div>
                <span class="score-value">{{ sphere.score }}/10</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card motivation">
        <div class="motivation-content">
          <div class="motivation-icon"><Lightbulb :size="40" :stroke-width="1.5" /></div>
          <div>
            <h3 class="motivation-title">Эффект 1%</h3>
            <p class="motivation-text">
              Улучшая каждый день хотя бы на 1%, за год ты станешь сильнее почти в 38 раз.
              Это эффект сложных процентов, применённый к жизни.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'
import Onboarding from '../components/Onboarding.vue'
import MiniTaskWelcome from '../components/MiniTaskWelcome.vue'
import MiniTask from '../components/MiniTask.vue'
import { DEBUG_MODE } from '@/config/settings.js'
import { Hand, Target, Rocket, CheckCircle, Calendar, Lightbulb } from 'lucide-vue-next'

const store = useAppStore()

const userName = computed(() => store.displayName)
const averageScore = computed(() => store.averageScore)
const activeGoals = computed(() => store.activeGoals)
const completedGoals = computed(() => store.completedGoals)
const lifeSpheres = computed(() => store.lifeSpheres)
const dailyTasks = computed(() => store.dailyPlan.tasks)

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

const showMiniTask = ref(false)

function updateTask(task) {
  store.toggleTask(task.id)
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-secondary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.greeting-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.greeting-icon {
  color: #9ca3af;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
}

.card-body {
  padding: 1.5rem;
}

.action-link {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: var(--radius-md);
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.2s ease;
  margin-bottom: 0.75rem;
}

.action-link:last-child {
  margin-bottom: 0;
}

.action-link:hover {
  background: var(--bg-secondary);
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.action-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.action-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.empty-state-mini {
  text-align: center;
  padding: 1rem;
  color: var(--text-secondary);
}

.tasks-preview {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-preview-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.task-preview-item:hover {
  background: var(--bg-secondary);
}

.task-preview-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--primary-color);
}

.task-preview-item span.completed {
  text-decoration: line-through;
  color: var(--text-tertiary);
}

.view-all-link {
  display: block;
  text-align: center;
  padding: 0.5rem;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
}

.spheres-preview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sphere-preview-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sphere-preview-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sphere-icon {
  font-size: 1.125rem;
}

.sphere-name {
  font-weight: 500;
  font-size: 0.9375rem;
}

.sphere-score {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.score-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: 4px;
  transition: width 0.3s ease;
}

.score-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 40px;
}

.motivation {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
}

.motivation-content {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  align-items: flex-start;
}

.motivation-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.motivation-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.motivation-text {
  opacity: 0.9;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
