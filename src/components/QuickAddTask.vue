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
            
            <div class="form-row">
              <div class="form-group half">
                <label>Когда</label>
                <div class="day-selector">
                  <button 
                    v-for="day in dayOptions" 
                    :key="day.value"
                    :class="['day-btn', { active: selectedDay === day.value }]"
                    @click="selectedDay = day.value"
                  >
                    {{ day.label }}
                  </button>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label>Цель (опционально)</label>
              <div class="goal-selector">
                <div class="goal-search-wrap">
                  <Search :size="16" :stroke-width="1.5" class="search-icon" />
                  <input 
                    v-model="goalSearch"
                    type="text"
                    placeholder="Найти или выбрать цель..."
                    class="goal-search"
                    @focus="showGoalDropdown = true"
                  />
                  <button 
                    v-if="selectedGoal" 
                    class="clear-goal-btn"
                    @click="clearGoal"
                  >
                    <X :size="14" :stroke-width="2" />
                  </button>
                </div>
                
                <Transition name="dropdown">
                  <div v-if="showGoalDropdown && filteredGoals.length > 0" class="goal-dropdown">
                    <button
                      v-for="goal in filteredGoals"
                      :key="goal.id"
                      class="goal-option"
                      :class="{ selected: selectedGoal?.id === goal.id }"
                      @click="selectGoal(goal)"
                    >
                      <span class="goal-sphere" v-if="goal.sphereIcon">{{ goal.sphereIcon }}</span>
                      <span class="goal-title">{{ goal.title }}</span>
                    </button>
                  </div>
                </Transition>
              </div>
              
              <div v-if="selectedGoal" class="selected-goal-badge">
                <Target :size="14" :stroke-width="1.5" />
                <span>{{ selectedGoal.title }}</span>
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
              <Plus v-else :size="16" :stroke-width="2" />
              Добавить
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Zap, X, Search, Target, Plus, Loader2 } from 'lucide-vue-next'
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
const taskTitle = ref('')
const selectedDay = ref('today')
const selectedGoal = ref(null)
const goalSearch = ref('')
const showGoalDropdown = ref(false)
const isSaving = ref(false)
const availableGoals = ref([])
const isLoadingGoals = ref(false)

const dayOptions = [
  { value: 'today', label: 'Сегодня' },
  { value: 'tomorrow', label: 'Завтра' },
  { value: 'week', label: 'На неделе' }
]

const canSave = computed(() => taskTitle.value.trim().length > 0 && selectedGoal.value)

const filteredGoals = computed(() => {
  if (!goalSearch.value.trim()) {
    return availableGoals.value.slice(0, 10)
  }
  const query = goalSearch.value.toLowerCase()
  return availableGoals.value
    .filter(g => g.title.toLowerCase().includes(query))
    .slice(0, 10)
})

async function loadGoals() {
  if (isLoadingGoals.value) return
  isLoadingGoals.value = true
  
  try {
    const result = await getGoals({
      status_filter: 'work',
      with_steps_data: false,
      page_size: 50
    })
    
    if (result.status === 'ok' && result.goals_data) {
      availableGoals.value = result.goals_data.map(g => ({
        id: g.id,
        title: g.title,
        sphereIcon: getSphereIcon(g.category)
      }))
    }
  } catch (error) {
    console.error('[QuickAddTask] Failed to load goals:', error)
  } finally {
    isLoadingGoals.value = false
  }
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

function selectGoal(goal) {
  selectedGoal.value = goal
  goalSearch.value = ''
  showGoalDropdown.value = false
}

function clearGoal() {
  selectedGoal.value = null
  goalSearch.value = ''
}

function getTargetDate() {
  const today = new Date()
  
  if (selectedDay.value === 'today') {
    return formatDate(today)
  } else if (selectedDay.value === 'tomorrow') {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return formatDate(tomorrow)
  } else {
    const nextMonday = new Date(today)
    const dayOfWeek = today.getDay()
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
    nextMonday.setDate(today.getDate() + daysUntilMonday)
    return formatDate(nextMonday)
  }
}

function formatDate(date) {
  return date.toISOString().split('T')[0]
}

async function save() {
  if (!canSave.value || isSaving.value) return
  
  isSaving.value = true
  
  try {
    const stepResult = await createStep(selectedGoal.value.id, {
      title: taskTitle.value.trim(),
      description: ''
    })
    
    if (stepResult.status === 'ok' && stepResult.goals_steps_data?.[0]?.id) {
      const stepId = stepResult.goals_steps_data[0].id
      const targetDate = getTargetDate()
      
      await scheduleStep(selectedGoal.value.id, stepId, targetDate)
      
      emit('created', {
        title: taskTitle.value.trim(),
        goalId: selectedGoal.value.id,
        goalTitle: selectedGoal.value.title,
        date: targetDate
      })
      
      resetForm()
      close()
    } else {
      throw new Error(stepResult.error_data?.message || 'Не удалось создать задачу')
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
  goalSearch.value = ''
  showGoalDropdown.value = false
}

function close() {
  emit('update:modelValue', false)
}

function handleClickOutside(e) {
  if (showGoalDropdown.value && !e.target.closest('.goal-selector')) {
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
  max-width: 440px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f3f5;
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
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-group.half {
  flex: 1;
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

.goal-selector {
  position: relative;
}

.goal-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  color: #9ca3af;
  pointer-events: none;
}

.goal-search {
  width: 100%;
  padding: 12px 40px 12px 40px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  color: #1f2937;
  transition: border-color 0.2s;
}

.goal-search:focus {
  outline: none;
  border-color: #6366f1;
}

.clear-goal-btn {
  position: absolute;
  right: 12px;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
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
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
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
  background: #eef2ff;
}

.goal-sphere {
  font-size: 16px;
}

.goal-option .goal-title {
  font-size: 14px;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-goal-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #eef2ff;
  border-radius: 8px;
  font-size: 13px;
  color: #6366f1;
  margin-top: 8px;
}

.selected-goal-badge svg {
  flex-shrink: 0;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #f1f3f5;
  background: #f9fafb;
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
}
</style>
