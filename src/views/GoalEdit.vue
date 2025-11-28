<template>
  <div class="goal-edit-container">
    <header class="page-header">
      <button class="btn btn-secondary btn-back" @click="goBack">
        <ArrowLeft :size="16" />
        Назад к списку
      </button>
      <div class="header-actions">
        <button class="btn btn-primary btn-with-icon" @click="saveGoal">
          <Save :size="16" />
          Сохранить
        </button>
        <button class="btn btn-secondary" @click="goBack">
          Отмена
        </button>
        <button 
          class="btn btn-danger-outline btn-with-icon"
          @click="deleteGoalConfirm"
        >
          <Trash2 :size="16" />
          Удалить
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
        <div class="card goal-info-card">
          <div class="card-header">
            <div class="goal-title-section">
              <h2 class="goal-title line-clamp-2">{{ goalForm.title || 'Без названия' }}</h2>
              <span 
                class="goal-status-badge"
                :class="goal.status"
              >
                {{ getStatusLabel(goal.status) }}
              </span>
            </div>
            <button 
              v-if="goal.sourceId" 
              class="btn btn-link edit-in-bank-btn"
              @click="goToGoalsBank"
            >
              <ExternalLink :size="14" />
              Редактировать в Банке целей
            </button>
          </div>

          <div class="goal-info-section">
            <div class="goal-info-row" v-if="goalForm.description">
              <span class="info-label">Почему важно:</span>
              <p class="info-value description-value">{{ goalForm.description }}</p>
            </div>

            <div class="goal-info-grid">
              <div class="goal-info-item" v-if="goalForm.sphereId">
                <span class="info-label">Сфера:</span>
                <div class="sphere-display">
                  <span class="sphere-icon-wrapper" :style="{ '--sphere-color': getSphereColor(goalForm.sphereId) }">
                    <component :is="getSphereIconComponent(goalForm.sphereId)" :size="16" />
                  </span>
                  <span class="sphere-name">{{ getSphereName(goalForm.sphereId) }}</span>
                </div>
              </div>

              <div class="goal-info-item">
                <span class="info-label">Дедлайн:</span>
                <input 
                  type="date"
                  :value="goalForm.deadline"
                  @input="updateField('deadline', $event.target.value)"
                  class="form-input deadline-input"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Декомпозиция на шаги</h3>
            <span class="steps-count">{{ goalForm.steps.length }} шагов</span>
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
                dragging: dragIndex === index,
                'drag-over': dragOverIndex === index && dragIndex !== index,
                'step-completed': step.completed
              }"
              draggable="true"
              @dragstart="handleDragStart(index, $event)"
              @dragend="handleDragEnd"
              @dragover="handleDragOver(index, $event)"
              @drop="handleDrop(index, $event)"
            >
              <div class="step-drag-handle" title="Перетащите для изменения порядка">
                <GripVertical :size="16" />
              </div>
              
              <div class="step-checkbox-wrapper">
                <input 
                  type="checkbox"
                  :checked="step.completed"
                  @change="toggleStepCompletion(index)"
                  class="step-checkbox"
                  :id="`step-checkbox-${index}`"
                />
                <label 
                  :for="`step-checkbox-${index}`" 
                  class="step-checkbox-label"
                  :title="step.completed ? 'Отметить как невыполненный' : 'Отметить как выполненный'"
                >
                  <CheckSquare v-if="step.completed" :size="20" class="check-icon checked" />
                  <Square v-else :size="20" class="check-icon" />
                </label>
              </div>

              <span class="step-number-badge">{{ index + 1 }}</span>
              <div class="step-main">
                <input 
                  type="text"
                  :value="step.title"
                  @input="updateStep(index, 'title', $event.target.value)"
                  class="step-input"
                  :class="{ 'completed-text': step.completed }"
                  :placeholder="`Шаг ${index + 1}: что конкретно нужно сделать?`"
                />
                <div class="step-comment-section">
                  <textarea 
                    :value="step.comment || ''"
                    @input="updateStep(index, 'comment', $event.target.value)"
                    class="step-comment-input"
                    :placeholder="'Комментарий к шагу (необязательно)'"
                    rows="1"
                  ></textarea>
                </div>
              </div>
              <button 
                class="btn-icon delete"
                @click="removeStep(index)"
                title="Удалить шаг"
              >
                <X :size="16" />
              </button>
            </div>

            <button class="btn btn-secondary add-step-btn btn-with-icon" @click="addStep">
              <Plus :size="16" />
              Добавить шаг
            </button>
          </div>

          <div class="goal-meta-info">
            <span class="meta-item">
              <span class="meta-label">Создана:</span>
              {{ formatDate(goal.createdAt) }}
            </span>
            <span v-if="goal.completedAt" class="meta-item">
              <span class="meta-label">Завершена:</span>
              {{ formatDate(goal.completedAt) }}
            </span>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { 
  Trash2, Save, Plus, ArrowLeft, GripVertical, X, ExternalLink,
  Wallet, Palette, Users, Heart, Briefcase, HeartHandshake, Target,
  Square, CheckSquare
} from 'lucide-vue-next'

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


function goToGoalsBank() {
  if (goal.value && goal.value.sourceId) {
    router.push(`/app/goals-bank?edit=${goal.value.sourceId}`)
  } else {
    router.push('/app/goals-bank')
  }
}

function getSphereIconComponent(sphereId) {
  const iconMap = {
    'wealth': Wallet,
    'hobbies': Palette,
    'friendship': Users,
    'health': Heart,
    'career': Briefcase,
    'love': HeartHandshake
  }
  return iconMap[sphereId] || Target
}

function getSphereColor(sphereId) {
  const colorMap = {
    'wealth': '#e63946',
    'hobbies': '#f4a261',
    'friendship': '#e9c46a',
    'health': '#2a9d8f',
    'career': '#264653',
    'love': '#9b5de5'
  }
  return colorMap[sphereId] || '#6366f1'
}

function getSphereName(sphereId) {
  const sphere = lifeSpheres.value.find(s => s.id === sphereId)
  return sphere ? sphere.name : 'Не указана'
}

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
    comment: '',
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
  const filteredSteps = goalForm.value.steps
    .filter(s => s.title.trim())
    .map((s, index) => ({
      id: s.id || `step_${Date.now()}_${index}`,
      title: s.title,
      completed: s.completed || false,
      comment: s.comment || '',
      timeEstimate: s.timeEstimate || '',
      priority: s.priority || ''
    }))

  const progress = filteredSteps.length > 0
    ? Math.round((filteredSteps.filter(s => s.completed).length / filteredSteps.length) * 100)
    : 0

  const goalData = {
    deadline: goalForm.value.deadline,
    steps: filteredSteps,
    progress: progress
  }

  store.updateGoal(goal.value.id, goalData)
  router.push('/app/goals')
}

function goBack() {
  router.push('/app/goals')
}

function deleteGoalConfirm() {
  if (confirm(`Удалить цель "${goal.value.title}"?`)) {
    store.deleteGoal(goal.value.id)
    router.push('/app/goals')
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
  max-width: 900px;
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
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 900px;
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

/* Goal Info Card - Read Only Display */
.goal-info-card .card-header {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}

.goal-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.goal-title {
  font-size: 1.5rem;
  margin: 0;
  color: var(--text-primary);
}

.edit-in-bank-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0;
  font-size: 0.875rem;
  color: var(--primary-color);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.edit-in-bank-btn:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.goal-info-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.goal-info-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  margin: 0;
  color: var(--text-primary);
  line-height: 1.5;
}

.description-value {
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--primary-color);
}

.goal-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.goal-info-item {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.sphere-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sphere-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.1);
  color: var(--sphere-color, #6366f1);
  border: 1.5px solid var(--sphere-color, var(--border-color));
}

.sphere-name {
  font-weight: 500;
  color: var(--text-primary);
}

.deadline-input {
  max-width: 200px;
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

.step-card.step-completed {
  background: rgba(16, 185, 129, 0.08);
  border-left: 3px solid var(--success-color);
}

.step-checkbox-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.step-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.step-checkbox-label {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.step-checkbox-label:hover {
  background: var(--bg-tertiary);
}

.check-icon {
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.check-icon.checked {
  color: var(--success-color);
}

.step-input.completed-text {
  text-decoration: line-through;
  color: var(--text-secondary);
  opacity: 0.7;
}

.step-comment-section {
  margin-top: 0.25rem;
}

.step-comment-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  background: transparent;
  color: var(--text-secondary);
  resize: none;
  transition: all 0.2s ease;
  min-height: 32px;
}

.step-comment-input:focus {
  outline: none;
  border-color: var(--border-color);
  background: var(--bg-primary);
}

.step-comment-input::placeholder {
  color: var(--text-muted);
  font-style: italic;
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

.btn-with-icon {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.goal-meta-info {
  display: flex;
  gap: 2rem;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.goal-meta-info .meta-item {
  display: flex;
  gap: 0.5rem;
}

.goal-meta-info .meta-label {
  color: var(--text-muted);
}

.step-number-badge {
  width: 28px;
  height: 28px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}


@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .header-actions .btn {
    flex: 1;
    min-width: 100px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .goal-meta-info {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
