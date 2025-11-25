<template>
  <Onboarding v-if="!isOnboardingCompleted" />

  <MiniTaskWelcome 
    v-else-if="isOnboardingCompleted && !isMiniTaskCompleted && !showMiniTask" 
    @start="showMiniTask = true"
  />

  <MiniTask v-else-if="showMiniTask && !isMiniTaskCompleted" />

  <div v-else class="dashboard">
    <header class="page-header">
      <div class="header-left">
        <h1>Главная</h1>
        <p class="subtitle">Добро пожаловать, {{ userName }}</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-outline">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Помощь
        </button>
      </div>
    </header>

    <div class="metrics-row">
      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-label">Общий баланс</span>
          <span class="metric-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10"/>
            </svg>
          </span>
        </div>
        <div class="metric-value">{{ averageScore }}<span class="metric-unit">/10</span></div>
        <div class="metric-change positive" v-if="averageScore > 5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
          </svg>
          Выше среднего
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-label">Активные цели</span>
          <span class="metric-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          </span>
        </div>
        <div class="metric-value">{{ activeGoals }}</div>
        <div class="metric-subtext">целей в работе</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-label">Достигнуто</span>
          <span class="metric-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </span>
        </div>
        <div class="metric-value">{{ completedGoals }}</div>
        <div class="metric-subtext">выполненных целей</div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-label">Задачи сегодня</span>
          <span class="metric-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </span>
        </div>
        <div class="metric-value">{{ completedTasks }}<span class="metric-unit">/{{ totalTasks }}</span></div>
        <div class="metric-subtext">выполнено</div>
      </div>
    </div>

    <div class="content-grid">
      <div class="main-column">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Сферы жизни</h3>
            <router-link to="/ssp" class="card-action">Оценить</router-link>
          </div>
          <div class="card-body">
            <table class="spheres-table">
              <thead>
                <tr>
                  <th>Сфера</th>
                  <th style="text-align: right;">Оценка</th>
                  <th style="text-align: right;">Прогресс</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="sphere in lifeSpheres" :key="sphere.id">
                  <td>
                    <div class="sphere-cell">
                      <span class="sphere-indicator" :style="{ background: getSphereColor(sphere.score) }"></span>
                      {{ sphere.name }}
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <span class="score-value">{{ sphere.score }}</span>
                  </td>
                  <td style="text-align: right;">
                    <div class="progress-bar-cell">
                      <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: `${sphere.score * 10}%`, background: getSphereColor(sphere.score) }"></div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Задачи на сегодня</h3>
            <router-link to="/planner" class="card-action">Все задачи</router-link>
          </div>
          <div class="card-body">
            <div v-if="dailyTasks.length === 0" class="empty-state">
              <div class="empty-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <p>Нет задач на сегодня</p>
              <router-link to="/planner" class="btn btn-sm btn-primary">
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
                  :checked="task.completed"
                  @change="updateTask(task)"
                />
                <span class="task-checkbox"></span>
                <span class="task-text" :class="{ completed: task.completed }">{{ task.title }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="side-column">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Быстрые действия</h3>
          </div>
          <div class="card-body">
            <router-link to="/ssp" class="quick-action">
              <div class="action-icon blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10"/>
                </svg>
              </div>
              <div class="action-text">
                <div class="action-title">Оценить сферы</div>
                <div class="action-desc">Проведите саморефлексию</div>
              </div>
              <svg class="action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </router-link>

            <router-link to="/goals" class="quick-action">
              <div class="action-icon green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="6"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
              </div>
              <div class="action-text">
                <div class="action-title">Новая цель</div>
                <div class="action-desc">Поставьте цель</div>
              </div>
              <svg class="action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </router-link>

            <router-link to="/planner" class="quick-action">
              <div class="action-icon purple">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                </svg>
              </div>
              <div class="action-text">
                <div class="action-title">Планирование</div>
                <div class="action-desc">Задачи на день</div>
              </div>
              <svg class="action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </router-link>
          </div>
        </div>

        <div class="card tip-card">
          <div class="tip-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <div class="tip-content">
            <h4>Эффект 1%</h4>
            <p>Улучшая каждый день хотя бы на 1%, за год вы станете сильнее почти в 38 раз.</p>
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

const store = useAppStore()

const userName = computed(() => store.user.name)
const averageScore = computed(() => store.averageScore)
const activeGoals = computed(() => store.activeGoals)
const completedGoals = computed(() => store.completedGoals)
const lifeSpheres = computed(() => store.lifeSpheres)
const dailyTasks = computed(() => store.dailyPlan.tasks)
const isOnboardingCompleted = computed(() => store.onboarding.completed)
const isMiniTaskCompleted = computed(() => store.miniTask.completed)

const totalTasks = computed(() => dailyTasks.value.length)
const completedTasks = computed(() => dailyTasks.value.filter(t => t.completed).length)

const showMiniTask = ref(false)

function updateTask(task) {
  store.toggleTask(task.id)
}

function getSphereColor(score) {
  if (score >= 7) return '#22c55e'
  if (score >= 4) return '#f59e0b'
  return '#ef4444'
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.header-left h1 {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.metric-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1rem 1.25rem;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.metric-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.metric-icon {
  color: var(--text-tertiary);
}

.metric-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.metric-unit {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-tertiary);
}

.metric-change {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  margin-top: 0.5rem;
}

.metric-change.positive {
  color: var(--success-color);
}

.metric-change.negative {
  color: var(--danger-color);
}

.metric-subtext {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
  margin-top: 0.25rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.5rem;
}

.main-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.side-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-action {
  font-size: 0.75rem;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.card-action:hover {
  text-decoration: underline;
}

.spheres-table {
  margin: -0.5rem -0.25rem;
}

.spheres-table th {
  font-size: 0.6875rem;
  padding: 0.5rem 0.75rem;
}

.spheres-table td {
  padding: 0.625rem 0.75rem;
}

.sphere-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
}

.sphere-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.score-value {
  font-weight: 600;
  font-size: 0.8125rem;
}

.progress-bar-cell {
  width: 80px;
  margin-left: auto;
}

.progress-bar {
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.empty-icon {
  color: var(--text-tertiary);
  margin-bottom: 0.75rem;
}

.empty-state p {
  margin-bottom: 1rem;
  font-size: 0.8125rem;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
}

.task-item:hover {
  background: var(--bg-tertiary);
}

.task-item input[type="checkbox"] {
  display: none;
}

.task-checkbox {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  flex-shrink: 0;
  position: relative;
  transition: all 0.15s ease;
}

.task-item input:checked + .task-checkbox {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.task-item input:checked + .task-checkbox::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.task-text {
  flex: 1;
  font-size: 0.8125rem;
}

.task-text.completed {
  text-decoration: line-through;
  color: var(--text-tertiary);
}

.quick-action {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all 0.15s ease;
  margin-bottom: 0.5rem;
}

.quick-action:last-child {
  margin-bottom: 0;
}

.quick-action:hover {
  background: var(--bg-tertiary);
}

.action-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-icon.blue {
  background: rgba(37, 99, 235, 0.1);
  color: var(--primary-color);
}

.action-icon.green {
  background: rgba(34, 197, 94, 0.1);
  color: var(--success-color);
}

.action-icon.purple {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.action-text {
  flex: 1;
}

.action-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.125rem;
}

.action-desc {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
}

.action-arrow {
  color: var(--text-tertiary);
}

.tip-card {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.04), rgba(37, 99, 235, 0.08));
  border-color: rgba(37, 99, 235, 0.15);
  display: flex;
  gap: 0.75rem;
}

.tip-icon {
  width: 36px;
  height: 36px;
  background: rgba(37, 99, 235, 0.1);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  flex-shrink: 0;
}

.tip-content h4 {
  font-size: 0.8125rem;
  margin-bottom: 0.25rem;
}

.tip-content p {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .metrics-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .metrics-row {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
