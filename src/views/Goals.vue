<template>
  <div class="goals-container">
    <header class="page-header">
      <div>
        <h1>Цели и декомпозиция</h1>
        <p class="subtitle">
          Превратите большие желания в системный план действий
        </p>
      </div>
      <button class="btn btn-primary" @click="showAddModal = true">
        <span>➕</span>
        Новая цель
      </button>
    </header>

    <div v-if="goals.length === 0" class="empty-state card">
      <div class="empty-icon">🎯</div>
      <h3>У вас пока нет целей</h3>
      <p>Начните с постановки первой цели, которая действительно важна для вас</p>
      <button class="btn btn-primary btn-lg" @click="showAddModal = true">
        Создать первую цель
      </button>
    </div>

    <div v-else class="goals-layout">
      <div class="goals-filters">
        <button 
          class="filter-btn"
          :class="{ active: filter === 'all' }"
          @click="filter = 'all'"
        >
          Все ({{ goals.length }})
        </button>
        <button 
          class="filter-btn"
          :class="{ active: filter === 'active' }"
          @click="filter = 'active'"
        >
          Активные ({{ activeGoals.length }})
        </button>
        <button 
          class="filter-btn"
          :class="{ active: filter === 'completed' }"
          @click="filter = 'completed'"
        >
          Завершённые ({{ completedGoals.length }})
        </button>
      </div>

      <div class="goals-list">
        <div 
          v-for="goal in filteredGoals" 
          :key="goal.id"
          class="goal-card card"
          @click="openGoalDetail(goal)"
        >
          <div class="goal-header">
            <div class="goal-title-section">
              <h3 class="goal-title">{{ goal.title }}</h3>
              <span 
                class="goal-status-badge"
                :class="goal.status"
              >
                {{ getStatusLabel(goal.status) }}
              </span>
            </div>
            <div class="goal-actions">
              <button 
                class="btn-icon"
                @click.stop="editGoal(goal)"
                title="Редактировать"
              >
                ✏️
              </button>
              <button 
                class="btn-icon delete"
                @click.stop="deleteGoalConfirm(goal)"
                title="Удалить"
              >
                🗑️
              </button>
            </div>
          </div>

          <p v-if="goal.description" class="goal-description">
            {{ goal.description }}
          </p>

          <div class="goal-meta">
            <div class="goal-meta-item">
              <span class="meta-label">Сфера:</span>
              <span class="meta-value">{{ getSphereName(goal.sphereId) }}</span>
            </div>
            <div v-if="goal.deadline" class="goal-meta-item">
              <span class="meta-label">Дедлайн:</span>
              <span class="meta-value">{{ formatDate(goal.deadline) }}</span>
            </div>
          </div>

          <div class="goal-progress">
            <div class="progress-header">
              <span class="progress-label">Прогресс</span>
              <span class="progress-value">{{ goal.progress }}%</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: `${goal.progress}%` }"
              ></div>
            </div>
          </div>

          <div v-if="goal.steps && goal.steps.length > 0" class="goal-steps-preview">
            <div class="steps-count">
              {{ getCompletedSteps(goal) }} / {{ goal.steps.length }} шагов выполнено
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Goal Modal -->
    <transition name="fade">
      <div v-if="showAddModal" class="modal-overlay" @click.self="closeModals">
        <div class="modal modal-large">
          <div class="modal-header">
            <h2>Новая цель</h2>
            <button class="btn-close" @click="closeModals">✕</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Название цели *</label>
              <input 
                type="text"
                v-model="goalForm.title"
                class="form-input"
                placeholder="Например: Выучить английский до B2"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Описание и мотивация</label>
              <textarea 
                v-model="goalForm.description"
                class="form-textarea"
                rows="3"
                placeholder="Почему эта цель важна для вас?"
              ></textarea>
              <span class="form-hint">Опишите, что даст вам достижение этой цели</span>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Сфера жизни</label>
                <select v-model="goalForm.sphereId" class="form-select">
                  <option value="">Выберите сферу</option>
                  <option 
                    v-for="sphere in lifeSpheres" 
                    :key="sphere.id"
                    :value="sphere.id"
                  >
                    {{ sphere.icon }} {{ sphere.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Дедлайн</label>
                <input 
                  type="date"
                  v-model="goalForm.deadline"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">MVP (Минимально жизнеспособный результат)</label>
              <input 
                type="text"
                v-model="goalForm.mvp"
                class="form-input"
                placeholder="Какой минимальный результат будет успехом?"
              />
              <span class="form-hint">Определите самый простой вариант достижения цели</span>
            </div>

            <div class="form-group">
              <label class="form-label">Шаги декомпозиции</label>
              <div class="steps-list">
                <div 
                  v-for="(step, index) in goalForm.steps" 
                  :key="index"
                  class="step-item"
                >
                  <input 
                    type="text"
                    v-model="step.title"
                    class="form-input"
                    :placeholder="`Шаг ${index + 1}`"
                  />
                  <button 
                    class="btn-icon delete"
                    @click="removeStep(index)"
                    title="Удалить шаг"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <button class="btn btn-secondary btn-sm" @click="addStep">
                ➕ Добавить шаг
              </button>
              <span class="form-hint">Разбейте цель на конкретные действия</span>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeModals">Отмена</button>
            <button class="btn btn-primary" @click="saveGoal">
              Создать цель
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Goal Detail Modal -->
    <transition name="fade">
      <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
        <div class="modal modal-large">
          <div class="modal-header">
            <h2>{{ selectedGoal?.title }}</h2>
            <button class="btn-close" @click="showDetailModal = false">✕</button>
          </div>

          <div class="modal-body">
            <div class="goal-detail-status">
              <span 
                class="goal-status-badge large"
                :class="selectedGoal?.status"
              >
                {{ getStatusLabel(selectedGoal?.status) }}
              </span>
              <div class="goal-detail-meta">
                <div>Сфера: {{ getSphereName(selectedGoal?.sphereId) }}</div>
                <div v-if="selectedGoal?.deadline">
                  Дедлайн: {{ formatDate(selectedGoal?.deadline) }}
                </div>
              </div>
            </div>

            <div v-if="selectedGoal?.description" class="goal-detail-section">
              <h4>Описание</h4>
              <p>{{ selectedGoal.description }}</p>
            </div>

            <div v-if="selectedGoal?.mvp" class="goal-detail-section">
              <h4>MVP</h4>
              <p>{{ selectedGoal.mvp }}</p>
            </div>

            <div class="goal-detail-section">
              <h4>Прогресс: {{ selectedGoal?.progress }}%</h4>
              <div class="progress-bar large">
                <div 
                  class="progress-fill"
                  :style="{ width: `${selectedGoal?.progress}%` }"
                ></div>
              </div>
            </div>

            <div v-if="selectedGoal?.steps && selectedGoal.steps.length > 0" class="goal-detail-section">
              <h4>Шаги ({{ getCompletedSteps(selectedGoal) }}/{{ selectedGoal.steps.length }})</h4>
              <div class="steps-checklist">
                <label 
                  v-for="(step, index) in selectedGoal.steps" 
                  :key="index"
                  class="step-checkbox"
                >
                  <input 
                    type="checkbox"
                    v-model="step.completed"
                    @change="updateGoalProgress(selectedGoal)"
                  />
                  <span :class="{ completed: step.completed }">{{ step.title }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showDetailModal = false">Закрыть</button>
            <button 
              v-if="selectedGoal?.status === 'active'"
              class="btn btn-primary"
              @click="completeGoal(selectedGoal)"
            >
              ✅ Завершить цель
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- AI Coach Chat -->
    <AICurator context="decomposition" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import AICurator from '../components/AICurator.vue'

const router = useRouter()
const store = useAppStore()

const goals = computed(() => store.goals)
const lifeSpheres = computed(() => store.lifeSpheres)
const activeGoals = computed(() => store.activeGoals)
const completedGoals = computed(() => store.completedGoals)

const filter = ref('all')
const showAddModal = ref(false)
const showDetailModal = ref(false)
const selectedGoal = ref(null)

const goalForm = ref({
  title: '',
  description: '',
  sphereId: '',
  deadline: '',
  mvp: '',
  steps: []
})

const filteredGoals = computed(() => {
  if (filter.value === 'all') return goals.value
  return goals.value.filter(g => g.status === filter.value)
})

function openGoalDetail(goal) {
  selectedGoal.value = { ...goal }
  showDetailModal.value = true
}

function editGoal(goal) {
  router.push(`/goals/${goal.id}`)
}

function deleteGoalConfirm(goal) {
  if (confirm(`Удалить цель "${goal.title}"?`)) {
    store.deleteGoal(goal.id)
  }
}

function addStep() {
  goalForm.value.steps.push({ title: '', completed: false })
}

function removeStep(index) {
  goalForm.value.steps.splice(index, 1)
}

function saveGoal() {
  if (!goalForm.value.title.trim()) {
    alert('Введите название цели')
    return
  }

  const goalData = {
    ...goalForm.value,
    steps: goalForm.value.steps.filter(s => s.title.trim())
  }

  store.addGoal(goalData)
  closeModals()
}

function closeModals() {
  showAddModal.value = false
  selectedGoal.value = null
  goalForm.value = {
    title: '',
    description: '',
    sphereId: '',
    deadline: '',
    mvp: '',
    steps: []
  }
}

function updateGoalProgress(goal) {
  if (goal.steps && goal.steps.length > 0) {
    const completed = goal.steps.filter(s => s.completed).length
    const progress = Math.round((completed / goal.steps.length) * 100)
    store.updateGoal(goal.id, { 
      steps: goal.steps,
      progress 
    })
    if (selectedGoal.value) {
      selectedGoal.value.progress = progress
    }
  }
}

function completeGoal(goal) {
  if (confirm(`Завершить цель "${goal.title}"?`)) {
    store.updateGoal(goal.id, { 
      status: 'completed',
      progress: 100,
      completedAt: new Date().toISOString()
    })
    showDetailModal.value = false
  }
}

function getCompletedSteps(goal) {
  if (!goal.steps) return 0
  return goal.steps.filter(s => s.completed).length
}

function getSphereName(sphereId) {
  const sphere = lifeSpheres.value.find(s => s.id === sphereId)
  return sphere ? `${sphere.icon} ${sphere.name}` : 'Не указана'
}

function getStatusLabel(status) {
  const labels = {
    active: 'Активна',
    completed: 'Завершена',
    paused: 'Приостановлена'
  }
  return labels[status] || status
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<style scoped>
.goals-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.goals-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.goals-filters {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.625rem 1.25rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9375rem;
}

.filter-btn:hover {
  background: var(--bg-tertiary);
}

.filter-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.goals-list {
  display: grid;
  gap: 1.5rem;
}

.goal-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.goal-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.goal-title-section {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.goal-title {
  font-size: 1.25rem;
  margin: 0;
}

.goal-status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.goal-status-badge.active {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.goal-status-badge.completed {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
}

.goal-status-badge.paused {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
}

.goal-status-badge.large {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.goal-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon.delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

.goal-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.goal-meta {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.goal-meta-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.9375rem;
}

.meta-label {
  color: var(--text-secondary);
}

.meta-value {
  font-weight: 500;
}

.goal-progress {
  margin-bottom: 1rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.progress-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-color);
}

.progress-bar {
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar.large {
  height: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transition: width 0.3s ease;
}

.goal-steps-preview {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.steps-count {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Modal specific */
.modal-large {
  max-width: 700px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.step-item {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.step-item .form-input {
  flex: 1;
}

.goal-detail-status {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.goal-detail-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

.goal-detail-section {
  margin-bottom: 1.5rem;
}

.goal-detail-section h4 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.goal-detail-section p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.steps-checklist {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.step-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.step-checkbox:hover {
  background: var(--bg-tertiary);
}

.step-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.step-checkbox span {
  flex: 1;
  font-size: 0.9375rem;
}

.step-checkbox span.completed {
  text-decoration: line-through;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .goal-detail-status {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
