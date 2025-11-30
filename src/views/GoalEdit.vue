<template>
  <div class="goal-edit-container">
    <!-- Toast уведомления -->
    <transition-group name="toast-slide" tag="div" class="toast-container">
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        class="toast"
        :class="toast.type"
      >
        <CheckCircle2 v-if="toast.type === 'success'" :size="16" />
        <AlertCircle v-else-if="toast.type === 'error'" :size="16" />
        <span>{{ toast.message }}</span>
      </div>
    </transition-group>

    <header class="page-header">
      <button class="btn btn-secondary btn-back" @click="goBack">
        <ArrowLeft :size="16" />
        Назад
      </button>
      <div class="header-actions">
        <button class="btn btn-ghost btn-with-icon btn-planning" @click="goToPlanning" title="Запланировать шаги">
          <CalendarDays :size="16" />
          <span class="btn-planning-text">Планировщик</span>
        </button>
        <button class="btn btn-primary btn-with-icon" @click="saveAndGoToBank">
          <Save :size="16" />
          Сохранить
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
      <div class="empty-icon">
        <AlertCircle :size="48" />
      </div>
      <h3>Цель не найдена</h3>
      <p>Возможно, она была удалена или указан неверный адрес</p>
      <button class="btn btn-primary" @click="goBack">
        Вернуться к списку целей
      </button>
    </div>

    <div v-else class="edit-layout">
      <div class="main-content">
        <div class="card goal-info-card">
          <div class="card-header-optimized">
            <div class="goal-title-wrapper">
              <h2 class="goal-title-truncate" :title="goalForm.title">{{ goalForm.title || 'Без названия' }}</h2>
              <button 
                v-if="goal.sourceId" 
                class="btn btn-link edit-in-bank-btn"
                @click="openEditModal"
              >
                <Edit2 :size="14" />
                Редактировать цель
              </button>
            </div>
            <div class="goal-meta-right">
              <span 
                class="goal-status-badge"
                :class="goal.status"
              >
                {{ getStatusLabel(goal.status) }}
              </span>
              <div class="sphere-display-compact" v-if="goalForm.sphereId">
                <span class="sphere-icon-wrapper" :style="{ '--sphere-color': getSphereColor(goalForm.sphereId) }">
                  <component :is="getSphereIconComponent(goalForm.sphereId)" :size="14" />
                </span>
                <span class="sphere-name-sm">{{ getSphereName(goalForm.sphereId) }}</span>
              </div>
            </div>
          </div>

          <div class="goal-info-section" v-if="goalForm.description">
            <div class="goal-info-row">
              <span class="info-label">Почему важно:</span>
              <p class="info-value description-value">{{ goalForm.description }}</p>
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

          <!-- Фильтры шагов -->
          <div class="steps-filters">
            <div class="filter-row">
              <div class="search-input-wrapper">
                <Search :size="16" class="search-icon" />
                <input 
                  v-model="searchQuery"
                  type="text"
                  class="search-input"
                  placeholder="Поиск по шагам..."
                />
                <button 
                  v-if="searchQuery" 
                  class="search-clear"
                  @click="searchQuery = ''"
                >
                  <X :size="14" />
                </button>
              </div>
              
              <select v-model="filterStatus" class="filter-select">
                <option value="">Все статусы</option>
                <option value="pending">Не выполнены</option>
                <option value="completed">Выполнены</option>
              </select>
              
              <select v-model="filterPriority" class="filter-select">
                <option value="">Все приоритеты</option>
                <option value="critical">Критично</option>
                <option value="desirable">Важно</option>
                <option value="attention">Внимание</option>
                <option value="optional">Опционально</option>
              </select>
              
              <button 
                v-if="hasActiveFilters"
                class="btn btn-sm btn-secondary"
                @click="clearFilters"
              >
                <X :size="14" />
                Сбросить
              </button>
              
              <div class="sort-controls">
                <select v-model="sortBy" class="filter-select sort-select">
                  <option value="order">По порядку</option>
                  <option value="priority">По приоритету</option>
                  <option value="status">По статусу</option>
                  <option value="time">По времени</option>
                  <option value="date">По дате</option>
                </select>
                <button 
                  class="btn-icon sort-direction-btn"
                  @click="toggleSortDirection"
                  :title="sortDirection === 'asc' ? 'По возрастанию' : 'По убыванию'"
                >
                  <ChevronsUpDown :size="16" v-if="sortBy === 'order'" />
                  <ChevronUp :size="16" v-else-if="sortDirection === 'asc'" />
                  <ChevronDown :size="16" v-else />
                </button>
              </div>
            </div>
          </div>

          <!-- Подсказка о drag/drop -->
          <div v-if="hasActiveFilters" class="drag-disabled-hint">
            Перетаскивание шагов отключено при активных фильтрах
          </div>

          <div class="steps-section" :class="{ 'has-scroll': paginatedSteps.length > 6 }">
            <div 
              v-for="(step, displayIndex) in paginatedSteps" 
              :key="step.id || displayIndex"
              class="step-card"
              :class="{ 
                dragging: isDragEnabled && dragIndex === getOriginalIndex(step),
                'drag-over': isDragEnabled && dragOverIndex === getOriginalIndex(step) && dragIndex !== getOriginalIndex(step),
                'step-completed': step.completed,
                'drag-disabled': !isDragEnabled,
                ['priority-' + step.priority]: step.priority && !step.completed
              }"
              :style="step.priority && !step.completed ? { '--priority-color': getPriorityColor(step.priority) } : {}"
              :draggable="isDragEnabled"
              @dragstart="isDragEnabled && handleDragStart(getOriginalIndex(step), $event)"
              @dragend="isDragEnabled && handleDragEnd()"
              @dragover="isDragEnabled && handleDragOver(getOriginalIndex(step), $event)"
              @drop="isDragEnabled && handleDrop(getOriginalIndex(step), $event)"
            >
              <div 
                class="step-drag-handle" 
                :class="{ disabled: !isDragEnabled }"
                :title="isDragEnabled ? 'Перетащите для изменения порядка' : 'Сбросьте фильтры для перетаскивания'"
              >
                <GripVertical :size="16" />
              </div>
              
              <div class="step-checkbox-wrapper">
                <input 
                  type="checkbox"
                  :checked="step.completed"
                  @change="toggleStepCompletion(getOriginalIndex(step))"
                  class="step-checkbox"
                  :id="`step-checkbox-${step.id}`"
                />
                <label 
                  :for="`step-checkbox-${step.id}`" 
                  class="step-checkbox-label"
                  :title="step.completed ? 'Отметить как невыполненный' : 'Отметить как выполненный'"
                >
                  <CheckSquare v-if="step.completed" :size="20" class="check-icon checked" />
                  <Square v-else :size="20" class="check-icon" />
                </label>
              </div>

              <span class="step-number-badge">{{ getOriginalIndex(step) + 1 }}</span>
              
              <div class="step-main">
                <input 
                  type="text"
                  :value="step.title"
                  @input="updateStep(getOriginalIndex(step), 'title', $event.target.value)"
                  @blur="autoSave"
                  class="step-input"
                  :class="{ 'completed-text': step.completed }"
                  :placeholder="`Шаг ${getOriginalIndex(step) + 1}: что конкретно нужно сделать?`"
                />
                
                <!-- Параметры шага -->
                <div class="step-params">
                  <!-- Приоритет -->
                  <select 
                    :value="step.priority || ''"
                    @change="updateStepAndSave(getOriginalIndex(step), 'priority', $event.target.value)"
                    class="step-param-select priority-select-sm"
                    :class="'priority-' + (step.priority || 'none')"
                    title="Приоритет"
                  >
                    <option value="">Приоритет</option>
                    <option value="critical">Критично</option>
                    <option value="desirable">Важно</option>
                    <option value="attention">Внимание</option>
                    <option value="optional">Опционально</option>
                  </select>
                  
                  <!-- Время -->
                  <select 
                    :value="step.timeEstimate || ''"
                    @change="updateStepAndSave(getOriginalIndex(step), 'timeEstimate', $event.target.value)"
                    class="step-param-select time-select-sm"
                    title="Время на выполнение"
                  >
                    <option value="">Время</option>
                    <option value="15">15 мин</option>
                    <option value="30">30 мин</option>
                    <option value="60">1 час</option>
                    <option value="120">2 часа</option>
                    <option value="180">3 часа</option>
                    <option value="240">4 часа</option>
                  </select>
                  
                  <!-- Дата -->
                  <div class="date-picker-wrapper">
                    <input 
                      type="date"
                      :value="step.scheduledDate || ''"
                      @change="updateStepAndSave(getOriginalIndex(step), 'scheduledDate', $event.target.value)"
                      class="step-param-select date-input-sm"
                      title="Запланировать на дату"
                    />
                    <Calendar :size="14" class="date-icon" />
                  </div>
                  
                  <!-- Статус -->
                  <select 
                    :value="step.status || (step.completed ? 'completed' : 'pending')"
                    @change="updateStepStatus(getOriginalIndex(step), $event.target.value)"
                    class="step-param-select status-select-sm"
                    :class="'status-' + (step.status || (step.completed ? 'completed' : 'pending'))"
                    title="Статус шага"
                  >
                    <option value="pending">Ожидает</option>
                    <option value="in_progress">В работе</option>
                    <option value="completed">Выполнен</option>
                  </select>
                </div>
                
                <!-- Комментарий -->
                <div class="step-comment-section">
                  <textarea 
                    ref="commentTextareas"
                    :value="step.comment || ''"
                    @input="handleCommentInput(getOriginalIndex(step), $event)"
                    @blur="autoSave"
                    class="step-comment-input"
                    :placeholder="'Комментарий к шагу (необязательно)'"
                    rows="1"
                  ></textarea>
                </div>
              </div>
              
              <button 
                class="btn-icon btn-icon-danger"
                @click="removeStep(getOriginalIndex(step))"
                title="Удалить шаг"
              >
                <X :size="16" :stroke-width="2" />
              </button>
            </div>
            
            <!-- Кнопка загрузить ещё -->
            <div v-if="hasMoreSteps" class="load-more-steps">
              <button class="btn btn-secondary btn-sm" @click="loadMoreSteps">
                Загрузить ещё {{ remainingStepsCount }} шагов
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

    <!-- Модальное окно редактирования цели (унифицировано с GoalsBank) -->
    <transition name="modal-fade">
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="edit-modal edit-modal-extended">
          <div class="modal-header">
            <h3>
              <Edit2 :size="20" :stroke-width="2" class="modal-header-icon" />
              Редактирование цели
            </h3>
            <button class="modal-close" @click="closeEditModal">
              <X :size="20" :stroke-width="2" />
            </button>
          </div>
          
          <div class="modal-body" v-if="editingGoal">
            <div class="form-group">
              <label class="form-label">Название цели</label>
              <input 
                v-model="editingGoal.text"
                type="text"
                class="form-input"
                placeholder="Введите название цели"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Сфера жизни</label>
              <div class="sphere-select-grid">
                <button 
                  v-for="sphere in lifeSpheres"
                  :key="sphere.id"
                  class="sphere-select-btn"
                  :class="{ active: editingGoal.sphereId === sphere.id }"
                  :style="{ '--sphere-color': getSphereColor(sphere.id) }"
                  @click="editingGoal.sphereId = sphere.id"
                >
                  <component :is="getSphereIconComponent(sphere.id)" :size="18" :stroke-width="2" />
                  <span>{{ getSphereNameOnly(sphere.id) }}</span>
                </button>
              </div>
            </div>
            
            <div class="why-section-divider">
              <span>Правило "3 Почему"</span>
            </div>
            
            <div class="form-group">
              <label class="form-label">1. Почему эта цель мне важна?</label>
              <textarea 
                v-model="editingGoal.whyImportant"
                class="form-textarea"
                placeholder="Опишите, почему эта цель важна для вас"
                rows="3"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label class="form-label">2. Почему именно это даст мне то, что я хочу?</label>
              <textarea 
                v-model="editingGoal.why2"
                class="form-textarea"
                placeholder="Объясните, как достижение этой цели приведёт вас к желаемому результату"
                rows="3"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label class="form-label">3. Почему это действительно про меня?</label>
              <textarea 
                v-model="editingGoal.why3"
                class="form-textarea"
                placeholder="Подтвердите, что эта цель соответствует вашим ценностям и личности"
                rows="3"
              ></textarea>
            </div>
            
            <div class="validation-section">
              <div class="validation-label">Оценка цели:</div>
              <div class="validation-buttons">
                <button 
                  class="btn btn-validation btn-true-goal"
                  :class="{ active: editingGoal.status === 'validated' }"
                  @click="editingGoal.status = 'validated'"
                >
                  <CheckCircle :size="18" :stroke-width="2" />
                  Это истинная цель
                </button>
                <button 
                  class="btn btn-validation btn-false-goal"
                  :class="{ active: editingGoal.status === 'rejected' }"
                  @click="editingGoal.status = 'rejected'"
                >
                  <XCircle :size="18" :stroke-width="2" />
                  Это ложная цель
                </button>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <div class="modal-footer-left">
              <button 
                class="btn btn-danger-outline" 
                @click="deleteGoalFromModal"
              >
                <Trash2 :size="16" :stroke-width="2" />
                Удалить
              </button>
            </div>
            <div class="modal-footer-right">
              <button class="btn btn-secondary" @click="closeEditModal">
                Отмена
              </button>
              <button class="btn btn-primary" @click="saveEditModal">
                <Check :size="16" :stroke-width="2" />
                Сохранить
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { 
  Trash2, Save, Plus, ArrowLeft, GripVertical, X, Edit2, ChevronUp, ChevronDown, ChevronsUpDown,
  Wallet, Palette, Users, Heart, Briefcase, HeartHandshake, Target,
  Square, CheckSquare, Search, Calendar, CheckCircle2, AlertCircle,
  CheckCircle, XCircle, Check, CalendarDays
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
  mvp: '',
  steps: [],
  progress: 0
})

// Toast уведомления
const toasts = ref([])
let toastId = 0

function showToast(message, type = 'success') {
  const id = ++toastId
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3000)
}

// Модальное окно редактирования
const showEditModal = ref(false)
const editingGoal = ref(null)

// Фильтры
const searchQuery = ref('')
const filterStatus = ref('')
const filterPriority = ref('')
const sortBy = ref('order')
const sortDirection = ref('asc')

// Пагинация
const stepsDisplayLimit = ref(10)

const hasActiveFilters = computed(() => {
  return searchQuery.value || filterStatus.value || filterPriority.value
})

// Drag & drop отключен при активных фильтрах или пагинации
const isDragEnabled = computed(() => {
  // Отключить если фильтры активны ИЛИ показаны не все шаги
  if (hasActiveFilters.value) return false
  // Отключить если сортировка не по порядку
  if (sortBy.value !== 'order') return false
  // Отключить если пагинация обрезает список
  if (filteredSteps.value.length > stepsDisplayLimit.value) return false
  // Отключить если отфильтрованный список не равен полному
  if (filteredSteps.value.length !== goalForm.value.steps.length) return false
  return true
})

// Флаг сохранения и отслеживание изменений
const isSaving = ref(false)
let lastSavedHash = ''

function clearFilters() {
  searchQuery.value = ''
  filterStatus.value = ''
  filterPriority.value = ''
}

function toggleSortDirection() {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
}

function sortSteps(steps) {
  if (sortBy.value === 'order') {
    return steps
  }
  
  const sorted = [...steps]
  const dir = sortDirection.value === 'asc' ? 1 : -1
  
  sorted.sort((a, b) => {
    switch (sortBy.value) {
      case 'priority': {
        const priorityOrder = { 'critical': 1, 'desirable': 2, 'attention': 3, 'optional': 4, '': 5 }
        const aVal = priorityOrder[a.priority || ''] || 5
        const bVal = priorityOrder[b.priority || ''] || 5
        return (aVal - bVal) * dir
      }
      case 'status': {
        const statusOrder = { 'in_progress': 1, 'pending': 2, 'completed': 3 }
        const aVal = statusOrder[a.status || 'pending'] || 2
        const bVal = statusOrder[b.status || 'pending'] || 2
        return (aVal - bVal) * dir
      }
      case 'time': {
        const timeOrder = { '15': 1, '30': 2, '60': 3, '120': 4, '180': 5, '240': 6, '': 7 }
        const aVal = timeOrder[a.timeEstimate || ''] || 7
        const bVal = timeOrder[b.timeEstimate || ''] || 7
        return (aVal - bVal) * dir
      }
      case 'date': {
        const aDate = a.scheduledDate ? new Date(a.scheduledDate).getTime() : (dir === 1 ? Infinity : -Infinity)
        const bDate = b.scheduledDate ? new Date(b.scheduledDate).getTime() : (dir === 1 ? Infinity : -Infinity)
        return (aDate - bDate) * dir
      }
      default:
        return 0
    }
  })
  
  return sorted
}

// Фильтрованные и отсортированные шаги
const filteredSteps = computed(() => {
  let steps = goalForm.value.steps
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    steps = steps.filter(s => 
      s.title?.toLowerCase().includes(query) || 
      s.comment?.toLowerCase().includes(query)
    )
  }
  
  if (filterStatus.value) {
    if (filterStatus.value === 'completed') {
      steps = steps.filter(s => s.completed || s.status === 'completed')
    } else if (filterStatus.value === 'pending') {
      steps = steps.filter(s => !s.completed && s.status !== 'completed')
    }
  }
  
  if (filterPriority.value) {
    steps = steps.filter(s => s.priority === filterPriority.value)
  }
  
  // Применить сортировку
  steps = sortSteps(steps)
  
  return steps
})

// Пагинированные шаги
const paginatedSteps = computed(() => {
  return filteredSteps.value.slice(0, stepsDisplayLimit.value)
})

const hasMoreSteps = computed(() => {
  return filteredSteps.value.length > stepsDisplayLimit.value
})

const remainingStepsCount = computed(() => {
  return filteredSteps.value.length - stepsDisplayLimit.value
})

function loadMoreSteps() {
  stepsDisplayLimit.value += 10
  adjustAllCommentHeights()
}

// Получить оригинальный индекс шага в goalForm.steps
function getOriginalIndex(step) {
  return goalForm.value.steps.findIndex(s => s.id === step.id)
}

// Сброс пагинации при изменении фильтров
watch([searchQuery, filterStatus, filterPriority], () => {
  stepsDisplayLimit.value = 10
})

function openEditModal() {
  // Найти данные из rawIdeas (банка целей)
  const rawIdea = store.goalsBank?.rawIdeas?.find(r => r.id === goal.value.sourceId)
  
  editingGoal.value = {
    id: goal.value.sourceId,
    text: goal.value.title,
    sphereId: goal.value.sphereId,
    whyImportant: rawIdea?.whyImportant || rawIdea?.threeWhys?.why1 || goal.value.description || '',
    why2: rawIdea?.threeWhys?.why2 || '',
    why3: rawIdea?.threeWhys?.why3 || '',
    status: rawIdea?.status || 'validated'
  }
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  editingGoal.value = null
}

function deleteGoalFromModal() {
  if (editingGoal.value && confirm('Удалить эту цель?')) {
    store.deleteRawIdea(editingGoal.value.id)
    store.deleteGoal(goal.value.id)
    closeEditModal()
    router.push('/app/goals-bank')
  }
}

function getSphereNameOnly(sphereId) {
  const sphere = lifeSpheres.value.find(s => s.id === sphereId)
  return sphere ? sphere.name : ''
}

function goToPlanning() {
  router.push('/app/planning')
}

function saveEditModal() {
  if (!editingGoal.value) return
  
  // Обновить в банке целей
  store.updateRawIdea(editingGoal.value.id, {
    text: editingGoal.value.text,
    whyImportant: editingGoal.value.whyImportant,
    sphereId: editingGoal.value.sphereId,
    threeWhys: {
      why1: editingGoal.value.whyImportant,
      why2: editingGoal.value.why2,
      why3: editingGoal.value.why3
    }
  })
  
  // Обновить текущую цель
  store.updateGoal(goal.value.id, {
    title: editingGoal.value.text,
    sphereId: editingGoal.value.sphereId,
    description: editingGoal.value.whyImportant
  })
  
  // Обновить локальную форму
  goalForm.value.title = editingGoal.value.text
  goalForm.value.sphereId = editingGoal.value.sphereId
  goalForm.value.description = editingGoal.value.whyImportant
  
  closeEditModal()
  showToast('Цель успешно обновлена')
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

function getPriorityColor(priority) {
  const colors = {
    'critical': '#ef4444',
    'desirable': '#f97316',
    'attention': '#3b82f6',
    'optional': '#9ca3af'
  }
  return colors[priority] || '#9ca3af'
}

const dragIndex = ref(null)
const dragOverIndex = ref(null)

onMounted(() => {
  loadGoalData()
})

watch(() => route.params.id, () => {
  loadGoalData()
})

const commentTextareas = ref([])

function adjustAllCommentHeights() {
  nextTick(() => {
    const textareas = document.querySelectorAll('.step-comment-input')
    textareas.forEach(textarea => {
      if (textarea.value && textarea.value.includes('\n')) {
        textarea.style.height = 'auto'
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20
        const maxHeight = lineHeight * 7 + 16
        const newHeight = Math.min(textarea.scrollHeight, maxHeight)
        textarea.style.height = newHeight + 'px'
        
        if (textarea.scrollHeight > maxHeight) {
          textarea.style.overflowY = 'auto'
        } else {
          textarea.style.overflowY = 'hidden'
        }
      }
    })
  })
}

function loadGoalData() {
  if (goal.value) {
    goalForm.value = {
      title: goal.value.title || '',
      description: goal.value.description || '',
      sphereId: goal.value.sphereId || '',
      mvp: goal.value.mvp || '',
      steps: goal.value.steps ? goal.value.steps.map(s => ({ ...s })) : [],
      progress: goal.value.progress || 0
    }
    recalculateProgress()
    // Инициализировать hash для отслеживания изменений
    lastSavedHash = getStepsHash()
    // Корректировать высоту многострочных комментариев
    adjustAllCommentHeights()
  }
}

function addStep() {
  const newStep = { 
    id: Date.now().toString(),
    title: '', 
    completed: false,
    comment: '',
    timeEstimate: '',
    priority: '',
    scheduledDate: '',
    status: 'pending',
    isNew: true
  }
  goalForm.value.steps.push(newStep)
  
  // Увеличить лимит пагинации чтобы новый шаг был виден
  stepsDisplayLimit.value = goalForm.value.steps.length
  
  // НЕ сохраняем пустой шаг — сохранение произойдёт когда пользователь введёт название
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
    autoSave()
  }
  dragIndex.value = null
  dragOverIndex.value = null
}

function removeStep(index) {
  goalForm.value.steps.splice(index, 1)
  recalculateProgress()
  autoSave()
}

function updateStep(index, field, value) {
  goalForm.value.steps[index][field] = value
}

function updateStepAndSave(index, field, value) {
  goalForm.value.steps[index][field] = value
  autoSave()
}

function updateStepStatus(index, status) {
  goalForm.value.steps[index].status = status
  goalForm.value.steps[index].completed = status === 'completed'
  recalculateProgress()
  autoSave()
}

function toggleStepCompletion(index) {
  const step = goalForm.value.steps[index]
  if (!step.title.trim()) {
    showToast('Сначала введите название шага', 'error')
    return
  }
  step.completed = !step.completed
  step.status = step.completed ? 'completed' : 'pending'
  recalculateProgress()
  autoSave()
}

// Обработка комментария с авто-расширением
function handleCommentInput(index, event) {
  const textarea = event.target
  updateStep(index, 'comment', textarea.value)
  
  // Авто-расширение (макс 7 строк)
  textarea.style.height = 'auto'
  const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20
  const maxHeight = lineHeight * 7 + 16 // 7 строк + padding
  const newHeight = Math.min(textarea.scrollHeight, maxHeight)
  textarea.style.height = newHeight + 'px'
  
  if (textarea.scrollHeight > maxHeight) {
    textarea.style.overflowY = 'auto'
  } else {
    textarea.style.overflowY = 'hidden'
  }
}

function recalculateProgress() {
  if (goalForm.value.steps.length > 0) {
    const completed = goalForm.value.steps.filter(s => s.completed).length
    goalForm.value.progress = Math.round((completed / goalForm.value.steps.length) * 100)
  } else {
    goalForm.value.progress = 0
  }
}

// Автосохранение с debounce
let saveTimeout = null
let pendingSave = false

function autoSave() {
  if (saveTimeout) clearTimeout(saveTimeout)
  pendingSave = true
  saveTimeout = setTimeout(() => {
    doSave()
  }, 500)
}

function getStepsHash() {
  // Исключаем пустые шаги из хэша
  return JSON.stringify(goalForm.value.steps
    .filter(s => s.title && s.title.trim())
    .map(s => ({
      id: s.id,
      title: s.title,
      completed: s.completed,
      comment: s.comment,
      timeEstimate: s.timeEstimate,
      priority: s.priority,
      scheduledDate: s.scheduledDate,
      status: s.status
    })))
}

function doSave(showNotification = true) {
  if (!goal.value) return
  
  const currentHash = getStepsHash()
  
  // Не сохранять если нет изменений
  if (currentHash === lastSavedHash) {
    pendingSave = false
    return
  }
  
  isSaving.value = true
  pendingSave = false
  
  try {
    const stepsToSave = goalForm.value.steps
      .filter(s => s.title.trim())
      .map((s, index) => ({
        id: s.id || `step_${Date.now()}_${index}`,
        title: s.title,
        completed: s.completed || false,
        comment: s.comment || '',
        timeEstimate: s.timeEstimate || '',
        priority: s.priority || '',
        scheduledDate: s.scheduledDate || '',
        status: s.status || (s.completed ? 'completed' : 'pending')
      }))

    const progress = stepsToSave.length > 0
      ? Math.round((stepsToSave.filter(s => s.completed).length / stepsToSave.length) * 100)
      : 0

    store.updateGoal(goal.value.id, {
      steps: stepsToSave,
      progress: progress
    })
    
    lastSavedHash = currentHash
    
    if (showNotification) {
      showToast('Изменения сохранены')
    }
  } catch (e) {
    showToast('Ошибка сохранения', 'error')
  } finally {
    isSaving.value = false
  }
}

// Синхронное сохранение (flush pending) - всегда сохраняет текущее состояние
function flushSave(showNotification = true) {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
    saveTimeout = null
  }
  pendingSave = false
  // Всегда вызываем doSave для гарантии сохранения последнего состояния
  doSave(showNotification)
}

function saveGoalData() {
  flushSave(true)
}

function saveAndGoToBank() {
  // Сначала сохраняем синхронно (без toast, покажем свой)
  flushSave(false)
  showToast('Цель сохранена')
  
  // Получить фильтры из localStorage
  const savedFilters = localStorage.getItem('goalsBankFilters')
  let query = {}
  
  if (savedFilters) {
    try {
      query = JSON.parse(savedFilters)
    } catch (e) {
      // ignore
    }
  }
  
  // Переходим сразу без задержки
  router.push({ path: '/app/goals-bank', query })
}

function goBack() {
  // Сохранить текущие фильтры банка целей
  const savedFilters = localStorage.getItem('goalsBankFilters')
  let query = {}
  
  if (savedFilters) {
    try {
      query = JSON.parse(savedFilters)
    } catch (e) {
      // ignore
    }
  }
  
  router.push({ path: '/app/goals-bank', query })
}

function deleteGoalConfirm() {
  if (confirm(`Удалить цель "${goal.value.title}"?`)) {
    store.deleteGoal(goal.value.id)
    router.push('/app/goals-bank')
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
  position: relative;
}

/* Toast уведомления */
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: var(--shadow-lg);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
}

.toast.success {
  background: rgba(16, 185, 129, 0.1);
  border-color: var(--success-color);
  color: var(--success-color);
}

.toast.error {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--danger-color);
  color: var(--danger-color);
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
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
  color: var(--text-secondary);
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

/* Goal Info Card */
.goal-info-card .card-header {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}

.card-header-optimized {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1rem;
}

.goal-title-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.goal-title-truncate {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.goal-meta-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
  min-width: 120px;
  max-width: 160px;
}

.sphere-display-compact {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  max-width: 100%;
}

.sphere-name-sm {
  font-size: 0.8125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goal-title-section {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  max-width: 100%;
  min-width: 0;
}

.goal-title {
  font-size: 1.5rem;
  margin: 0;
  color: var(--text-primary);
  word-break: break-word;
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
}

.edit-in-bank-btn:hover {
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
  grid-template-columns: 1fr;
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

.steps-count {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.decomposition-hint {
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

/* Фильтры шагов */
.steps-filters {
  margin-bottom: 1rem;
}

.filter-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 300px;
}

.search-input-wrapper .search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.search-input {
  width: 100%;
  padding: 0.5rem 2rem 0.5rem 2.25rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  background: var(--bg-primary);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.search-clear {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  background: var(--bg-primary);
  min-width: 130px;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: auto;
}

.sort-select {
  min-width: 120px;
}

.sort-direction-btn {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-direction-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.drag-disabled-hint {
  padding: 0.5rem 0.75rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  color: #b45309;
  margin-bottom: 0.75rem;
}

.steps-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.steps-section.has-scroll {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.step-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.step-card.priority-critical:not(.step-completed) {
  border-left-color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
}

.step-card.priority-desirable:not(.step-completed) {
  border-left-color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}

.step-card.priority-attention:not(.step-completed) {
  border-left-color: #3b82f6;
  background: rgba(59, 130, 246, 0.06);
}

.step-card.priority-optional:not(.step-completed) {
  border-left-color: #9ca3af;
  background: rgba(156, 163, 175, 0.06);
}

.step-card.step-completed {
  background: rgba(16, 185, 129, 0.08);
  border-left-color: var(--success-color);
}

.step-checkbox-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  margin-top: 0.25rem;
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

.step-drag-handle {
  cursor: grab;
  color: var(--text-secondary);
  padding: 0.25rem;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.step-drag-handle.disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.step-drag-handle:active:not(.disabled) {
  cursor: grabbing;
}

.step-card.drag-disabled {
  cursor: default;
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

.step-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  background: var(--bg-primary);
}

.step-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* Параметры шага */
.step-params {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.step-param-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  background: var(--bg-primary);
  cursor: pointer;
}

.step-param-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.priority-select-sm {
  min-width: 90px;
}

.priority-select-sm.priority-critical {
  border-color: var(--danger-color);
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

.priority-select-sm.priority-desirable {
  border-color: var(--warning-color);
  background: rgba(245, 158, 11, 0.1);
  color: #b45309;
}

.priority-select-sm.priority-attention {
  border-color: var(--info-color);
  background: rgba(59, 130, 246, 0.1);
  color: var(--info-color);
}

.priority-select-sm.priority-optional {
  border-color: var(--text-tertiary);
  background: rgba(156, 163, 175, 0.1);
}

.time-select-sm {
  min-width: 80px;
}

.date-picker-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.date-input-sm {
  min-width: 120px;
  padding-right: 1.75rem;
}

.date-icon {
  position: absolute;
  right: 0.5rem;
  color: var(--text-secondary);
  pointer-events: none;
}

.status-select-sm {
  min-width: 90px;
}

.status-select-sm.status-completed {
  border-color: var(--success-color);
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.status-select-sm.status-in_progress {
  border-color: var(--info-color);
  background: rgba(59, 130, 246, 0.1);
  color: var(--info-color);
}

.status-select-sm.status-pending {
  border-color: var(--text-tertiary);
  background: rgba(156, 163, 175, 0.1);
}

/* Комментарий */
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
  min-height: 32px;
  overflow-y: hidden;
  transition: border-color 0.2s ease, background 0.2s ease;
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
  margin-top: 0.25rem;
}

.btn-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.btn-icon-danger {
  border-color: var(--border-color);
  color: var(--text-secondary);
}

.btn-icon-danger:hover {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}

/* Кнопка загрузить ещё */
.load-more-steps {
  display: flex;
  justify-content: center;
  padding: 0.5rem 0;
}

.add-step-btn {
  margin-top: 0.5rem;
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

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.edit-modal {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.edit-modal.edit-modal-extended {
  max-width: 600px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.125rem;
}

.modal-header-icon {
  color: var(--primary-color);
}

.btn-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--radius-sm);
}

.btn-close:hover {
  background: var(--bg-secondary);
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  background: var(--bg-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-textarea {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  background: var(--bg-primary);
  resize: vertical;
  min-height: 80px;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.sphere-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.sphere-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  cursor: pointer;
  font-size: 0.75rem;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.sphere-btn:hover {
  border-color: var(--sphere-color);
  background: rgba(99, 102, 241, 0.05);
}

.sphere-btn.active {
  border-color: var(--sphere-color);
  background: rgba(99, 102, 241, 0.1);
  color: var(--sphere-color);
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

.modal-footer-left {
  display: flex;
  gap: 0.5rem;
}

.modal-footer-right {
  display: flex;
  gap: 0.75rem;
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.sphere-select-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.sphere-select-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  cursor: pointer;
  font-size: 0.75rem;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.sphere-select-btn:hover {
  border-color: var(--sphere-color);
  background: rgba(99, 102, 241, 0.05);
}

.sphere-select-btn.active {
  border-color: var(--sphere-color);
  background: rgba(99, 102, 241, 0.1);
  color: var(--sphere-color);
}

.why-section-divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0 1rem;
}

.why-section-divider::before,
.why-section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.why-section-divider span {
  padding: 0 1rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.validation-section {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.validation-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.validation-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn-validation {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-true-goal {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.btn-true-goal:hover,
.btn-true-goal.active {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.btn-false-goal {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.btn-false-goal:hover,
.btn-false-goal.active {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}

.btn-planning {
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn-planning:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
  background: rgba(99, 102, 241, 0.05);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
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

  .btn-planning-text {
    display: none;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input-wrapper {
    max-width: none;
  }
  
  .filter-select {
    width: 100%;
  }

  .step-params {
    flex-direction: column;
  }
  
  .step-param-select {
    width: 100%;
  }

  .goal-meta-info {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .sphere-selector,
  .sphere-select-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .card-header-optimized {
    flex-direction: column;
    gap: 0.75rem;
  }

  .goal-title-wrapper {
    width: 100%;
  }

  .goal-title-truncate {
    white-space: normal;
    -webkit-line-clamp: 2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
  }

  .goal-meta-right {
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }

  .validation-buttons {
    flex-direction: column;
  }

  .modal-footer {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }

  .modal-footer-left,
  .modal-footer-right {
    width: 100%;
    justify-content: stretch;
  }

  .modal-footer-right {
    flex-direction: row;
  }

  .modal-footer-left .btn,
  .modal-footer-right .btn {
    flex: 1;
  }
}
</style>
