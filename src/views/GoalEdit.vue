<template>
  <div class="goal-edit-container">
    <header class="page-header">
      <button class="btn btn-secondary btn-back" @click="goBack">
        <span>←</span>
        Назад к списку
      </button>
      <div class="header-actions">
        <button 
          v-if="goal && goal.status === 'active'"
          class="btn btn-success"
          @click="completeGoal"
        >
          ✅ Завершить цель
        </button>
        <button 
          class="btn btn-danger-outline"
          @click="deleteGoalConfirm"
        >
          🗑️ Удалить
        </button>
      </div>
    </header>

    <div v-if="!goal" class="empty-state card">
      <div class="empty-icon">❓</div>
      <h3>Цель не найдена</h3>
      <p>Возможно, она была удалена или указан неверный адрес</p>
      <button class="btn btn-primary" @click="goBack">
        Вернуться к списку целей
      </button>
    </div>

    <div v-else class="edit-layout">
      <div class="main-content">
        <div class="card">
          <div class="card-header">
            <h2>Редактирование цели</h2>
            <span 
              class="goal-status-badge"
              :class="goal.status"
            >
              {{ getStatusLabel(goal.status) }}
            </span>
          </div>

          <div class="form-section">
            <div class="form-group">
              <label class="form-label">Название цели *</label>
              <input 
                type="text"
                :value="goalForm.title"
                @input="updateField('title', $event.target.value)"
                class="form-input form-input-lg"
                placeholder="Например: Выучить английский до B2"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Описание и мотивация</label>
              <textarea 
                :value="goalForm.description"
                @input="updateField('description', $event.target.value)"
                class="form-textarea"
                rows="4"
                placeholder="Почему эта цель важна для вас? Что изменится в вашей жизни?"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Сфера жизни</label>
                <select 
                  :value="goalForm.sphereId"
                  @change="updateField('sphereId', $event.target.value)"
                  class="form-select"
                >
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
                  :value="goalForm.deadline"
                  @input="updateField('deadline', $event.target.value)"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">MVP (Минимально жизнеспособный результат)</label>
              <input 
                type="text"
                :value="goalForm.mvp"
                @input="updateField('mvp', $event.target.value)"
                class="form-input"
                placeholder="Какой минимальный результат будет успехом?"
              />
              <span class="form-hint">Определите самый простой вариант достижения цели — что вас уже порадует</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Декомпозиция на шаги</h3>
            <span class="steps-count">{{ completedStepsCount }} / {{ goalForm.steps.length }} выполнено</span>
          </div>

          <div class="form-hint decomposition-hint">
            Разбейте цель на конкретные действия. Каждый шаг должен быть понятным и выполнимым за 1-4 часа.
          </div>

          <div class="steps-section">
            <div 
              v-for="(step, index) in goalForm.steps" 
              :key="step.id || index"
              class="step-card"
              :class="{ 
                completed: step.completed,
                dragging: dragIndex === index,
                'drag-over': dragOverIndex === index && dragIndex !== index
              }"
              draggable="true"
              @dragstart="handleDragStart(index, $event)"
              @dragend="handleDragEnd"
              @dragover="handleDragOver(index, $event)"
              @drop="handleDrop(index, $event)"
            >
              <div class="step-drag-handle" title="Перетащите для изменения порядка">
                ⋮⋮
              </div>
              <div class="step-checkbox-wrapper">
                <input 
                  type="checkbox"
                  :checked="step.completed"
                  @change="toggleStepCompletion(index)"
                  class="step-checkbox"
                />
              </div>
              <div class="step-main">
                <input 
                  type="text"
                  :value="step.title"
                  @input="updateStep(index, 'title', $event.target.value)"
                  class="step-input"
                  :class="{ completed: step.completed }"
                  :placeholder="`Шаг ${index + 1}: что конкретно нужно сделать?`"
                />
                <div class="step-meta">
                  <div class="step-time">
                    <span class="meta-label">⏱️</span>
                    <select 
                      :value="step.timeEstimate || ''"
                      @change="updateStep(index, 'timeEstimate', $event.target.value)"
                      class="step-select"
                    >
                      <option value="">Время</option>
                      <option value="30min">30 мин</option>
                      <option value="1h">1 час</option>
                      <option value="2h">2 часа</option>
                      <option value="4h">4 часа</option>
                    </select>
                  </div>
                  <div class="step-priority">
                    <span class="meta-label">🎯</span>
                    <select 
                      :value="step.priority || ''"
                      @change="updateStep(index, 'priority', $event.target.value)"
                      class="step-select"
                    >
                      <option value="">Приоритет</option>
                      <option value="high">Высокий</option>
                      <option value="medium">Средний</option>
                      <option value="low">Низкий</option>
                    </select>
                  </div>
                  <div v-if="step.priority" class="priority-indicator" :class="step.priority">
                    {{ getPriorityLabel(step.priority) }}
                  </div>
                </div>
              </div>
              <button 
                class="btn-icon delete"
                @click="removeStep(index)"
                title="Удалить шаг"
              >
                ✕
              </button>
            </div>

            <button class="btn btn-secondary add-step-btn" @click="addStep">
              ➕ Добавить шаг
            </button>
          </div>

          <div v-if="goalForm.steps.length > 0" class="steps-summary">
            <div class="summary-item">
              <span class="summary-label">Общее время:</span>
              <span class="summary-value">{{ totalTimeEstimate }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Высокий приоритет:</span>
              <span class="summary-value">{{ highPriorityCount }} шагов</span>
            </div>
          </div>
        </div>

        <div class="card progress-card">
          <div class="card-header">
            <h3>Прогресс</h3>
            <span class="progress-percentage">{{ goalForm.progress }}%</span>
          </div>
          <div class="progress-bar-large">
            <div 
              class="progress-fill"
              :style="{ width: `${goalForm.progress}%` }"
            ></div>
          </div>
          <p class="progress-hint">
            Прогресс рассчитывается автоматически на основе выполненных шагов
          </p>
        </div>
      </div>

      <div class="sidebar-actions">
        <div class="card sticky-card">
          <h4>Действия</h4>
          <div class="action-buttons">
            <button class="btn btn-primary btn-lg btn-full" @click="saveGoal">
              💾 Сохранить изменения
            </button>
            <button class="btn btn-secondary btn-full" @click="goBack">
              Отмена
            </button>
          </div>

          <div class="goal-info">
            <div class="info-item">
              <span class="info-label">Создана:</span>
              <span class="info-value">{{ formatDate(goal.createdAt) }}</span>
            </div>
            <div v-if="goal.completedAt" class="info-item">
              <span class="info-label">Завершена:</span>
              <span class="info-value">{{ formatDate(goal.completedAt) }}</span>
            </div>
          </div>
        </div>

        <div class="ai-helper-section">
          <AICurator 
            context="decomposition" 
            :embedded="true"
            :goalContext="{ title: goalForm.title, sphere: goalForm.sphereId }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import AICurator from '../components/AICurator.vue'

const route = useRoute()
const router = useRouter()
const store = useAppStore()

const lifeSpheres = computed(() => store.lifeSpheres)
const goals = computed(() => store.goals)

const goal = computed(() => {
  return goals.value.find(g => g.id === route.params.id)
})

const goalForm = ref({
  title: '',
  description: '',
  sphereId: '',
  deadline: '',
  mvp: '',
  steps: [],
  progress: 0
})

const completedStepsCount = computed(() => {
  return goalForm.value.steps.filter(s => s.completed).length
})

const totalTimeEstimate = computed(() => {
  const timeMap = {
    '30min': 0.5,
    '1h': 1,
    '2h': 2,
    '4h': 4
  }
  let total = 0
  goalForm.value.steps.forEach(step => {
    if (step.timeEstimate && timeMap[step.timeEstimate]) {
      total += timeMap[step.timeEstimate]
    }
  })
  if (total === 0) return 'Не указано'
  if (total < 1) return `${total * 60} мин`
  if (total === 1) return '1 час'
  return `${total} ч`
})

const highPriorityCount = computed(() => {
  return goalForm.value.steps.filter(s => s.priority === 'high').length
})

const dragIndex = ref(null)
const dragOverIndex = ref(null)

onMounted(() => {
  loadGoalData()
})

watch(() => route.params.id, () => {
  loadGoalData()
})

function loadGoalData() {
  if (goal.value) {
    goalForm.value = {
      title: goal.value.title || '',
      description: goal.value.description || '',
      sphereId: goal.value.sphereId || '',
      deadline: goal.value.deadline || '',
      mvp: goal.value.mvp || '',
      steps: goal.value.steps ? goal.value.steps.map(s => ({ ...s })) : [],
      progress: goal.value.progress || 0
    }
    recalculateProgress()
  }
}

function updateField(field, value) {
  goalForm.value[field] = value
}

function addStep() {
  goalForm.value.steps.push({ 
    id: Date.now().toString(),
    title: '', 
    completed: false,
    timeEstimate: '',
    priority: ''
  })
}

function handleDragStart(index, event) {
  dragIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', index)
}

function handleDragEnd() {
  dragIndex.value = null
  dragOverIndex.value = null
}

function handleDragOver(index, event) {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  dragOverIndex.value = index
}

function handleDrop(index, event) {
  event.preventDefault()
  const fromIndex = dragIndex.value
  if (fromIndex !== null && fromIndex !== index) {
    const steps = [...goalForm.value.steps]
    const [movedStep] = steps.splice(fromIndex, 1)
    steps.splice(index, 0, movedStep)
    goalForm.value.steps = steps
  }
  dragIndex.value = null
  dragOverIndex.value = null
}

function getPriorityLabel(priority) {
  const labels = {
    high: '🔴 Высокий',
    medium: '🟡 Средний',
    low: '🟢 Низкий'
  }
  return labels[priority] || ''
}

function removeStep(index) {
  goalForm.value.steps.splice(index, 1)
  recalculateProgress()
}

function updateStep(index, field, value) {
  goalForm.value.steps[index][field] = value
}

function toggleStepCompletion(index) {
  const step = goalForm.value.steps[index]
  if (!step.title.trim()) {
    alert('Сначала введите название шага')
    return
  }
  step.completed = !step.completed
  recalculateProgress()
}

function recalculateProgress() {
  if (goalForm.value.steps.length > 0) {
    const completed = goalForm.value.steps.filter(s => s.completed).length
    goalForm.value.progress = Math.round((completed / goalForm.value.steps.length) * 100)
  } else {
    goalForm.value.progress = 0
  }
}

function saveGoal() {
  if (!goalForm.value.title.trim()) {
    alert('Введите название цели')
    return
  }

  const filteredSteps = goalForm.value.steps
    .filter(s => s.title.trim())
    .map((s, index) => ({
      id: s.id || `step_${Date.now()}_${index}`,
      title: s.title,
      completed: s.completed || false,
      timeEstimate: s.timeEstimate || '',
      priority: s.priority || ''
    }))

  const progress = filteredSteps.length > 0
    ? Math.round((filteredSteps.filter(s => s.completed).length / filteredSteps.length) * 100)
    : 0

  const goalData = {
    title: goalForm.value.title,
    description: goalForm.value.description,
    sphereId: goalForm.value.sphereId,
    deadline: goalForm.value.deadline,
    mvp: goalForm.value.mvp,
    steps: filteredSteps,
    progress: progress
  }

  store.updateGoal(goal.value.id, goalData)
  router.push('/goals')
}

function goBack() {
  router.push('/goals')
}

function deleteGoalConfirm() {
  if (confirm(`Удалить цель "${goal.value.title}"?`)) {
    store.deleteGoal(goal.value.id)
    router.push('/goals')
  }
}

function completeGoal() {
  if (confirm(`Завершить цель "${goal.value.title}"?`)) {
    store.updateGoal(goal.value.id, { 
      status: 'completed',
      progress: 100,
      completedAt: new Date().toISOString()
    })
    router.push('/goals')
  }
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
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<style scoped>
.goal-edit-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-success {
  background: var(--success-color);
  color: white;
  border: none;
}

.btn-success:hover {
  background: #059669;
}

.btn-danger-outline {
  background: transparent;
  border: 1px solid var(--danger-color);
  color: var(--danger-color);
}

.btn-danger-outline:hover {
  background: var(--danger-color);
  color: white;
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

.edit-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  align-items: start;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.card-header h2 {
  font-size: 1.5rem;
  margin: 0;
}

.card-header h3 {
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

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-input-lg {
  font-size: 1.25rem;
  padding: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.steps-count {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.decomposition-hint {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.steps-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.step-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.step-card.completed {
  background: rgba(16, 185, 129, 0.05);
}

.step-checkbox-wrapper {
  flex-shrink: 0;
}

.step-checkbox {
  width: 24px;
  height: 24px;
  cursor: pointer;
  accent-color: var(--success-color);
}

.step-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 1rem;
  background: var(--bg-primary);
  transition: all 0.2s ease;
}

.step-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.step-input.completed {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.step-drag-handle {
  cursor: grab;
  color: var(--text-secondary);
  font-size: 1.125rem;
  letter-spacing: -2px;
  padding: 0.25rem;
  user-select: none;
  flex-shrink: 0;
}

.step-drag-handle:active {
  cursor: grabbing;
}

.step-card.dragging {
  opacity: 0.5;
  background: var(--bg-tertiary);
}

.step-card.drag-over {
  border: 2px dashed var(--primary-color);
  background: rgba(99, 102, 241, 0.05);
}

.step-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.step-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.step-time,
.step-priority {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.meta-label {
  font-size: 0.875rem;
}

.step-select {
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  background: var(--bg-primary);
  cursor: pointer;
  min-width: 90px;
}

.step-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.priority-indicator {
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
}

.priority-indicator.high {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

.priority-indicator.medium {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
}

.priority-indicator.low {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.steps-summary {
  display: flex;
  gap: 2rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-top: 1rem;
}

.summary-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.summary-label {
  color: var(--text-secondary);
}

.summary-value {
  font-weight: 600;
  color: var(--primary-color);
}

.add-step-btn {
  margin-top: 0.5rem;
}

.progress-card {
  background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
}

.progress-percentage {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.progress-bar-large {
  height: 16px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transition: width 0.3s ease;
}

.progress-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.sidebar-actions {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ai-helper-section {
  margin-top: 0;
}

.sticky-card {
  position: sticky;
  top: 2rem;
}

.sticky-card h4 {
  margin-bottom: 1rem;
  font-size: 1rem;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.btn-full {
  width: 100%;
}

.goal-info {
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 0.875rem;
  font-weight: 500;
}

@media (max-width: 1024px) {
  .edit-layout {
    grid-template-columns: 1fr;
  }

  .sidebar-actions {
    order: -1;
  }

  .sticky-card {
    position: static;
  }

  .action-buttons {
    flex-direction: row;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    flex-direction: column;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
