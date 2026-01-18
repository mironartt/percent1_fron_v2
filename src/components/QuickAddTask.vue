<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="quick-task-overlay" @click.self="close">
        <div class="quick-task-modal">
          <div class="modal-header">
            <h3>
              <Zap :size="20" :stroke-width="1.5" />
              Быстрая задача
            </h3>
            <button class="close-btn" @click="close">
              <X :size="20" :stroke-width="1.5" />
            </button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label>Название задачи</label>
              <input 
                ref="taskInput"
                v-model="taskTitle"
                type="text"
                placeholder="Что нужно сделать?"
                class="task-input"
                @keydown.enter="save"
              />
            </div>

            <div class="form-group">
              <label>
                <Target :size="14" :stroke-width="1.5" class="label-icon" />
                Цель
                <span class="required-badge">обязательно</span>
              </label>
              <div class="goal-selector" ref="goalSelectorRef">
                <div class="goal-input-wrap">
                  <span v-if="selectedGoal && !showGoalDropdown" class="goal-input-sphere">{{ selectedGoal.sphereIcon }}</span>
                  <input 
                    ref="goalInputRef"
                    v-model="goalInputValue"
                    type="text"
                    placeholder="Найти или выбрать цель..."
                    class="goal-input"
                    :class="{ 
                      'has-value': selectedGoal, 
                      'error': showGoalError,
                      'with-sphere': selectedGoal && !showGoalDropdown
                    }"
                    @focus="openGoalDropdown"
                    @input="onGoalSearchInput"
                    @blur="onGoalInputBlur"
                  />
                  <button 
                    v-if="selectedGoal" 
                    class="clear-goal-btn"
                    @click.stop="clearGoal"
                    type="button"
                  >
                    <X :size="14" :stroke-width="2" />
                  </button>
                  <ChevronDown 
                    v-else
                    :size="18" 
                    :stroke-width="1.5" 
                    class="dropdown-chevron"
                    :class="{ rotated: showGoalDropdown }"
                  />
                </div>
                
                <Transition name="dropdown">
                  <div 
                    v-if="showGoalDropdown" 
                    ref="goalDropdownRef"
                    class="goal-dropdown"
                    @scroll="handleDropdownScroll"
                  >
                    <div v-if="isLoadingGoals" class="dropdown-loading">
                      <Loader2 :size="18" class="spin" />
                      <span>Загрузка...</span>
                    </div>
                    <div v-else-if="filteredGoals.length === 0" class="dropdown-empty">
                      <span>{{ goalSearchQuery.length > 0 && goalSearchQuery.length < 3 ? 'Введите минимум 3 символа для поиска' : 'Цели не найдены' }}</span>
                    </div>
                    <template v-else>
                      <button
                        v-for="goal in filteredGoals"
                        :key="goal.id"
                        class="goal-option"
                        :class="{ selected: selectedGoal?.id === goal.id }"
                        @mousedown.prevent="selectGoal(goal)"
                        type="button"
                      >
                        <span class="goal-sphere" v-if="goal.sphereIcon">{{ goal.sphereIcon }}</span>
                        <span class="goal-title">{{ goal.title }}</span>
                        <Check v-if="selectedGoal?.id === goal.id" :size="16" class="check-icon" />
                      </button>
                      <div v-if="isLoadingMore" class="dropdown-loading-more">
                        <Loader2 :size="16" class="spin" />
                        <span>Загрузка...</span>
                      </div>
                    </template>
                  </div>
                </Transition>
              </div>
              <span v-if="showGoalError" class="error-message">Выберите цель для задачи</span>
            </div>
            
            <div class="form-group">
              <label>
                <Calendar :size="14" :stroke-width="1.5" class="label-icon" />
                Когда
              </label>
              <div class="day-selector">
                <button 
                  v-for="day in dayOptions" 
                  :key="day.value"
                  :class="['day-btn', { active: selectedDay === day.value }]"
                  @click="selectDay(day.value)"
                >
                  {{ day.label }}
                </button>
              </div>
              <div v-if="selectedDay === 'custom'" class="date-picker-row">
                <input 
                  v-model="customDate"
                  type="date"
                  class="date-input"
                  :min="todayDateStr"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label>
                <Flag :size="14" :stroke-width="1.5" class="label-icon" />
                Приоритет
              </label>
              <div class="pill-selector">
                <button 
                  v-for="p in priorityOptions" 
                  :key="p.value"
                  :class="['pill-btn', 'priority-pill', { active: selectedPriority === p.value }]"
                  :style="selectedPriority === p.value && p.color ? { 
                    background: p.color, 
                    borderColor: p.color, 
                    color: 'white' 
                  } : {}"
                  @click="selectedPriority = selectedPriority === p.value ? '' : p.value"
                >
                  {{ p.label }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>
                <Clock :size="14" :stroke-width="1.5" class="label-icon" />
                Время
              </label>
              <div class="pill-selector">
                <button 
                  v-for="time in timeOptions" 
                  :key="time.value"
                  :class="['pill-btn', 'time-pill', { active: selectedTime === time.value }]"
                  @click="selectedTime = selectedTime === time.value ? '' : time.value"
                >
                  {{ time.label }}
                </button>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="close">
              Отмена
            </button>
            <button 
              class="btn btn-primary" 
              :disabled="!canSave || isSaving"
              @click="save"
            >
              <Loader2 v-if="isSaving" :size="16" :stroke-width="2" class="spin" />
              <Check v-else :size="16" :stroke-width="2" />
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Zap, X, Target, Check, Loader2, ChevronDown, Calendar, Flag, Clock } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { createStep, scheduleStep, getGoals } from '@/services/api'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'created'])

const store = useAppStore()

const taskInput = ref(null)
const goalSelectorRef = ref(null)
const goalInputRef = ref(null)
const goalDropdownRef = ref(null)
const taskTitle = ref('')
const selectedDay = ref('today')
const selectedGoal = ref(null)
const goalSearchQuery = ref('')
const showGoalDropdown = ref(false)
const showGoalError = ref(false)
const isSaving = ref(false)
const availableGoals = ref([])
const isLoadingGoals = ref(false)
const isLoadingMore = ref(false)
const currentPage = ref(1)
const hasMoreGoals = ref(true)
const searchDebounceTimer = ref(null)
const PAGE_SIZE = 20

const goalInputValue = computed({
  get() {
    if (showGoalDropdown.value) {
      return goalSearchQuery.value
    }
    return selectedGoal.value ? selectedGoal.value.title : ''
  },
  set(val) {
    goalSearchQuery.value = val
  }
})

const dayOptions = [
  { value: 'today', label: 'Сегодня' },
  { value: 'tomorrow', label: 'Завтра' },
  { value: 'custom', label: 'Дата' },
  { value: 'none', label: 'Без даты' }
]

const priorityOptions = [
  { value: 'critical', label: 'Критично', color: '#ef4444' },
  { value: 'important', label: 'Важно', color: '#f59e0b' },
  { value: 'attention', label: 'В поле внимания', color: '#6366f1' },
  { value: 'optional', label: 'По возможности', color: '#9ca3af' },
  { value: '', label: 'Без приоритета', color: null }
]

const timeOptions = [
  { value: 'half', label: '30 минут' },
  { value: 'one', label: '1 час' },
  { value: 'two', label: '2 часа' },
  { value: 'three', label: '3 часа' },
  { value: 'four', label: '4 часа' },
  { value: '', label: 'Без оценки' }
]

const customDate = ref('')
const selectedPriority = ref('')
const selectedTime = ref('')

const todayDateStr = computed(() => formatDate(new Date()))

const canSave = computed(() => taskTitle.value.trim().length > 0 && selectedGoal.value)

function selectDay(value) {
  selectedDay.value = value
  if (value === 'custom' && !customDate.value) {
    customDate.value = todayDateStr.value
  }
}

const filteredGoals = computed(() => {
  return availableGoals.value
})

async function loadGoals(reset = true, searchQuery = '') {
  if (reset) {
    if (isLoadingGoals.value) return
    isLoadingGoals.value = true
    currentPage.value = 1
    hasMoreGoals.value = true
  } else {
    if (isLoadingMore.value || !hasMoreGoals.value) return
    isLoadingMore.value = true
  }
  
  try {
    const params = {
      status_filter: 'work',
      with_steps_data: false,
      page_size: PAGE_SIZE,
      page: reset ? 1 : currentPage.value
    }
    
    if (searchQuery && searchQuery.trim().length >= 3) {
      params.query_filter = searchQuery.trim()
    }
    
    const result = await getGoals(params)
    
    const goalsData = result.data?.goals_data || result.goals_data
    
    if (result.status === 'ok' && goalsData && Array.isArray(goalsData)) {
      const newGoals = goalsData.map(g => ({
        id: g.goal_id || g.id,
        title: g.title,
        sphereIcon: getSphereIcon(g.category)
      }))
      
      if (reset) {
        availableGoals.value = newGoals
      } else {
        availableGoals.value = [...availableGoals.value, ...newGoals]
      }
      
      hasMoreGoals.value = newGoals.length === PAGE_SIZE
      if (!reset) {
        currentPage.value++
      }
    } else {
      if (reset) {
        availableGoals.value = []
      }
      hasMoreGoals.value = false
    }
  } catch (error) {
    console.error('[QuickAddTask] Failed to load goals:', error)
  } finally {
    isLoadingGoals.value = false
    isLoadingMore.value = false
  }
}

async function loadMoreGoals() {
  if (!hasMoreGoals.value || isLoadingMore.value) return
  currentPage.value++
  await loadGoals(false, goalSearchQuery.value)
}

function handleDropdownScroll(event) {
  const el = event.target
  const threshold = 50
  const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold
  
  if (isNearBottom && !isLoadingMore.value && hasMoreGoals.value) {
    loadMoreGoals()
  }
}

function debouncedSearch(query) {
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value)
  }
  
  searchDebounceTimer.value = setTimeout(() => {
    loadGoals(true, query)
  }, 300)
}

function getSphereIcon(category) {
  const icons = {
    'welfare': '💰',
    'hobby': '🎨',
    'environment': '🌍',
    'health_sport': '💪',
    'work': '💼',
    'family': '👨‍👩‍👧‍👦'
  }
  return icons[category] || '🎯'
}

function openGoalDropdown() {
  showGoalDropdown.value = true
  showGoalError.value = false
  goalSearchQuery.value = ''
}

function onGoalSearchInput() {
  showGoalDropdown.value = true
  if (selectedGoal.value) {
    selectedGoal.value = null
  }
  debouncedSearch(goalSearchQuery.value)
}

function onGoalInputBlur() {
  setTimeout(() => {
    showGoalDropdown.value = false
  }, 150)
}

function selectGoal(goal) {
  selectedGoal.value = goal
  goalSearchQuery.value = ''
  showGoalDropdown.value = false
  showGoalError.value = false
}

function clearGoal() {
  selectedGoal.value = null
  goalSearchQuery.value = ''
  nextTick(() => {
    goalInputRef.value?.focus()
  })
}

function getTargetDate() {
  if (selectedDay.value === 'none') {
    return null
  }
  
  const today = new Date()
  
  if (selectedDay.value === 'today') {
    return formatDate(today)
  } else if (selectedDay.value === 'tomorrow') {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return formatDate(tomorrow)
  } else if (selectedDay.value === 'custom' && customDate.value) {
    return customDate.value
  } else {
    return formatDate(today)
  }
}

function mapPriorityToBackend(priority) {
  return priority || null
}

function mapTimeToBackend(time) {
  return time || null
}

function formatDate(date) {
  return date.toISOString().split('T')[0]
}

async function save() {
  if (!selectedGoal.value) {
    showGoalError.value = true
    return
  }
  
  if (!canSave.value || isSaving.value) return
  
  isSaving.value = true
  
  try {
    const goalId = selectedGoal.value.id
    const targetDate = getTargetDate()
    const priority = mapPriorityToBackend(selectedPriority.value)
    const timeDuration = mapTimeToBackend(selectedTime.value)
    
    const stepData = {
      title: taskTitle.value.trim(),
      description: ''
    }
    
    if (targetDate) stepData.dt = targetDate
    if (priority) stepData.priority = priority
    if (timeDuration) stepData.time_duration = timeDuration
    
    const stepResult = await createStep(goalId, stepData)
    
    if (stepResult.status === 'ok') {
      emit('created', {
        title: taskTitle.value.trim(),
        goalId: goalId,
        goalTitle: selectedGoal.value.title,
        date: targetDate,
        priority: selectedPriority.value,
        timeEstimate: selectedTime.value
      })
      
      resetForm()
      close()
    } else {
      throw new Error(stepResult.error_data?.message || stepResult.data?.error_data?.message || 'Не удалось создать задачу')
    }
  } catch (error) {
    console.error('[QuickAddTask] Save error:', error)
    alert('Ошибка: ' + error.message)
  } finally {
    isSaving.value = false
  }
}

function resetForm() {
  taskTitle.value = ''
  selectedDay.value = 'today'
  selectedGoal.value = null
  goalSearchQuery.value = ''
  showGoalDropdown.value = false
  showGoalError.value = false
  customDate.value = ''
  selectedPriority.value = ''
  selectedTime.value = ''
}

function close() {
  emit('update:modelValue', false)
}

function handleClickOutside(e) {
  if (showGoalDropdown.value && goalSelectorRef.value && !goalSelectorRef.value.contains(e.target)) {
    showGoalDropdown.value = false
  }
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    loadGoals()
    nextTick(() => {
      taskInput.value?.focus()
    })
  } else {
    resetForm()
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value)
  }
})
</script>

<style scoped>
.quick-task-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
}

.quick-task-modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f3f5;
  flex-shrink: 0;
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-header h3 svg {
  color: #f59e0b;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}

.label-icon {
  color: #9ca3af;
}

.required-badge {
  font-size: 11px;
  font-weight: 500;
  color: #ef4444;
  background: #fef2f2;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 4px;
}

.task-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  color: #1f2937;
  transition: border-color 0.2s;
}

.task-input:focus {
  outline: none;
  border-color: #6366f1;
}

.task-input::placeholder {
  color: #9ca3af;
}

.goal-selector {
  position: relative;
}

.goal-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.goal-input-sphere {
  position: absolute;
  left: 12px;
  font-size: 16px;
  z-index: 1;
  pointer-events: none;
}

.goal-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  color: #1f2937;
  transition: border-color 0.2s, background 0.2s;
}

.goal-input.with-sphere {
  padding-left: 40px;
}

.goal-input:focus {
  outline: none;
  border-color: #6366f1;
}

.goal-input.has-value {
  border-color: #6366f1;
  background: #f5f3ff;
  font-weight: 500;
}

.goal-input.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.goal-input::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.dropdown-chevron {
  position: absolute;
  right: 12px;
  color: #9ca3af;
  pointer-events: none;
  transition: transform 0.2s;
}

.dropdown-chevron.rotated {
  transform: rotate(180deg);
}

.clear-goal-btn {
  position: absolute;
  right: 10px;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background: white;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.clear-goal-btn:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.goal-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  max-height: 240px;
  overflow-y: auto;
  z-index: 10;
}

.dropdown-loading,
.dropdown-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  color: #9ca3af;
  font-size: 14px;
}

.dropdown-loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  color: #9ca3af;
  font-size: 13px;
  border-top: 1px solid #f3f4f6;
}

.goal-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
}

.goal-option:hover {
  background: #f3f4f6;
}

.goal-option.selected {
  background: #f5f3ff;
}

.goal-option .goal-sphere {
  font-size: 16px;
  flex-shrink: 0;
}

.goal-option .goal-title {
  flex: 1;
  font-size: 14px;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goal-option .check-icon {
  color: #6366f1;
  flex-shrink: 0;
}

.error-message {
  font-size: 12px;
  color: #ef4444;
}

.day-selector {
  display: flex;
  gap: 8px;
}

.day-btn {
  flex: 1;
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.day-btn:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.day-btn.active {
  border-color: #6366f1;
  background: #eef2ff;
  color: #6366f1;
}

.date-picker-row {
  margin-top: 8px;
}

.date-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  color: #1f2937;
  transition: border-color 0.2s;
}

.date-input:focus {
  outline: none;
  border-color: #6366f1;
}

.pill-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill-btn {
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 20px;
  background: white;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.pill-btn:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.pill-btn.active {
  border-color: #6366f1;
  background: #6366f1;
  color: white;
}

.priority-pill.active {
  font-weight: 600;
}

.time-pill.active {
  border-color: #6366f1;
  background: #6366f1;
  color: white;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #f1f3f5;
  background: #f9fafb;
  flex-shrink: 0;
}

.btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .quick-task-modal,
.modal-leave-active .quick-task-modal {
  transition: transform 0.25s ease, opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .quick-task-modal,
.modal-leave-to .quick-task-modal {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 480px) {
  .quick-task-modal {
    max-width: 100%;
    border-radius: 20px 20px 0 0;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 85vh;
  }
  
  .quick-task-overlay {
    align-items: flex-end;
    padding: 0;
  }
  
  .day-selector {
    flex-wrap: wrap;
  }
  
  .day-btn {
    flex: 1 1 calc(33% - 6px);
    min-width: 0;
  }

  .pill-btn {
    padding: 8px 12px;
    font-size: 12px;
  }
}
</style>
