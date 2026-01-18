<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Новая привычка</h3>
            <button class="btn-close" @click="close">
              <X :size="20" :stroke-width="1.5" />
            </button>
          </div>
          
          <div class="modal-content">
            <div class="icon-picker-row">
              <button 
                v-for="icon in quickIcons" 
                :key="icon.name"
                class="icon-pick-btn"
                :class="{ selected: formData.icon === icon.name }"
                @click="formData.icon = icon.name"
              >
                {{ icon.emoji }}
              </button>
              <button 
                class="icon-pick-btn more-btn"
                :class="{ active: showIconPicker }"
                @click="showIconPicker = !showIconPicker"
              >
                <Ellipsis :size="16" :stroke-width="1.5" />
              </button>
            </div>
            
            <div class="icon-grid-dropdown" v-if="showIconPicker">
              <button 
                v-for="icon in moreIcons" 
                :key="icon.name"
                class="icon-option"
                :class="{ selected: formData.icon === icon.name }"
                @click="formData.icon = icon.name; showIconPicker = false"
              >
                {{ icon.emoji }}
              </button>
            </div>
            
            <div class="habit-name-row">
              <input 
                ref="nameInput"
                v-model="formData.name"
                type="text"
                class="form-input"
                placeholder="Название привычки"
              />
            </div>
            
            <div class="xp-slider-row">
              <label class="slider-label">Награда за выполнение</label>
              <div class="xp-slider-control">
                <input 
                  type="range" 
                  v-model.number="formData.xpReward"
                  min="1"
                  max="100"
                  step="1"
                  class="xp-slider"
                />
                <span class="xp-slider-value">+{{ formData.xpReward }} XP</span>
              </div>
            </div>
            
            <textarea 
              v-model="formData.description"
              class="form-input description-input"
              rows="3"
              placeholder="Зачем вам эта привычка? (опционально)"
            />
            
            <div class="schedule-compact">
              <div class="schedule-presets">
                <button 
                  class="preset-btn"
                  :class="{ active: formData.frequencyType === 'daily' }"
                  @click="formData.frequencyType = 'daily'"
                >
                  Каждый день
                </button>
                <button 
                  class="preset-btn"
                  :class="{ active: formData.frequencyType === 'weekdays' }"
                  @click="formData.frequencyType = 'weekdays'"
                >
                  Будни
                </button>
                <button 
                  class="preset-btn"
                  :class="{ active: formData.frequencyType === 'weekends' }"
                  @click="formData.frequencyType = 'weekends'"
                >
                  Выходные
                </button>
              </div>
              <div class="days-row">
                <button 
                  v-for="day in weekDaysConfig" 
                  :key="day.key"
                  class="day-btn-compact"
                  :class="{ active: isDayActive(day.key) }"
                  @click="toggleDay(day.key)"
                >
                  {{ day.short }}
                </button>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="close">Отмена</button>
            <button 
              class="btn btn-primary" 
              @click="save"
              :disabled="!formData.name.trim() || isSaving"
            >
              <Loader2 v-if="isSaving" :size="16" :stroke-width="2" class="spin" />
              Создать
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useAppStore } from '@/stores/app'
import { useHabitsStore } from '@/stores/habits'
import { X, Ellipsis, Loader2 } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'created'])

const appStore = useAppStore()
const habitsStore = useHabitsStore()
const nameInput = ref(null)
const isSaving = ref(false)
const showIconPicker = ref(false)

const formData = ref({
  name: '',
  icon: '🔥',
  description: '',
  xpReward: 5,
  xpPenalty: 0,
  frequencyType: 'daily',
  scheduleDays: [1, 2, 3, 4, 5, 6, 0]
})

const weekDaysConfig = [
  { key: 1, short: 'Пн' },
  { key: 2, short: 'Вт' },
  { key: 3, short: 'Ср' },
  { key: 4, short: 'Чт' },
  { key: 5, short: 'Пт' },
  { key: 6, short: 'Сб' },
  { key: 0, short: 'Вс' }
]

const quickIcons = [
  { name: '🔥', emoji: '🔥' },
  { name: '💪', emoji: '💪' },
  { name: '📚', emoji: '📚' },
  { name: '🧘', emoji: '🧘' },
  { name: '🏃', emoji: '🏃' },
  { name: '💤', emoji: '💤' }
]

const moreIcons = [
  { name: '🎯', emoji: '🎯' },
  { name: '✅', emoji: '✅' },
  { name: '🌟', emoji: '🌟' },
  { name: '💡', emoji: '💡' },
  { name: '🧠', emoji: '🧠' },
  { name: '🎨', emoji: '🎨' },
  { name: '🏋️', emoji: '🏋️' },
  { name: '🚶', emoji: '🚶' },
  { name: '💊', emoji: '💊' },
  { name: '🥗', emoji: '🥗' },
  { name: '💧', emoji: '💧' },
  { name: '☕', emoji: '☕' }
]

function isDayActive(dayKey) {
  if (formData.value.frequencyType === 'daily') {
    return true
  } else if (formData.value.frequencyType === 'weekdays') {
    return [1, 2, 3, 4, 5].includes(dayKey)
  } else if (formData.value.frequencyType === 'weekends') {
    return [0, 6].includes(dayKey)
  }
  return formData.value.scheduleDays.includes(dayKey)
}

function toggleDay(dayKey) {
  formData.value.frequencyType = 'custom'
  
  if (formData.value.scheduleDays.includes(dayKey)) {
    formData.value.scheduleDays = formData.value.scheduleDays.filter(d => d !== dayKey)
  } else {
    formData.value.scheduleDays = [...formData.value.scheduleDays, dayKey]
  }
}

async function save() {
  if (!formData.value.name.trim() || isSaving.value) return
  
  isSaving.value = true
  
  try {
    const scheduleDays = formData.value.frequencyType === 'custom' ? formData.value.scheduleDays :
                         formData.value.frequencyType === 'weekdays' ? [1, 2, 3, 4, 5] :
                         formData.value.frequencyType === 'weekends' ? [0, 6] : [0, 1, 2, 3, 4, 5, 6]
    
    const habitData = {
      name: formData.value.name.trim(),
      icon: formData.value.icon,
      description: formData.value.description,
      xpReward: formData.value.xpReward,
      xpPenalty: formData.value.xpPenalty,
      frequencyType: formData.value.frequencyType,
      scheduleDays: scheduleDays
    }
    
    const localHabit = appStore.addHabit(habitData)
    
    const backendHabitData = {
      name: habitData.name,
      description: habitData.description || '',
      icon: habitData.icon,
      xp_reward: habitData.xpReward,
      xp_penalty: habitData.xpPenalty || 0,
      schedule_days: scheduleDays
    }
    
    habitsStore.createHabit(backendHabitData).then(result => {
      if (result.success && result.data?.id) {
        appStore.updateHabit(localHabit.id, { backendId: result.data.id })
      }
    })
    
    emit('created', localHabit)
    resetForm()
    close()
  } catch (error) {
    console.error('[AddHabitModal] Save error:', error)
    alert('Ошибка: ' + error.message)
  } finally {
    isSaving.value = false
  }
}

function resetForm() {
  formData.value = {
    name: '',
    icon: '🔥',
    description: '',
    xpReward: 5,
    xpPenalty: 0,
    frequencyType: 'daily',
    scheduleDays: [1, 2, 3, 4, 5, 6, 0]
  }
  showIconPicker.value = false
}

function close() {
  emit('update:modelValue', false)
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      nameInput.value?.focus()
    })
  } else {
    resetForm()
  }
})
</script>

<style scoped>
.modal-overlay {
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

.modal-container {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f3f5;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.btn-close {
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

.btn-close:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.modal-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.icon-picker-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.icon-pick-btn {
  width: 44px;
  height: 44px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.2s;
}

.icon-pick-btn:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.icon-pick-btn.selected {
  border-color: #6366f1;
  background: #eef2ff;
}

.more-btn {
  color: #6b7280;
}

.more-btn.active {
  border-color: #6366f1;
  color: #6366f1;
}

.icon-grid-dropdown {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 12px;
  margin-top: -8px;
}

.icon-option {
  width: 40px;
  height: 40px;
  border: 2px solid transparent;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
}

.icon-option:hover {
  border-color: #d1d5db;
}

.icon-option.selected {
  border-color: #6366f1;
  background: #eef2ff;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 15px;
  color: #1f2937;
  transition: border-color 0.2s;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
}

.form-input::placeholder {
  color: #9ca3af;
}

.description-input {
  resize: vertical;
  min-height: 80px;
}

.xp-slider-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slider-label {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}

.xp-slider-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.xp-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  appearance: none;
  background: #e5e7eb;
  cursor: pointer;
}

.xp-slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.3);
}

.xp-slider-value {
  min-width: 70px;
  font-size: 14px;
  font-weight: 600;
  color: #10b981;
}

.schedule-compact {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-presets {
  display: flex;
  gap: 8px;
}

.preset-btn {
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

.preset-btn:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.preset-btn.active {
  border-color: #6366f1;
  background: #eef2ff;
  color: #6366f1;
}

.days-row {
  display: flex;
  gap: 6px;
}

.day-btn-compact {
  flex: 1;
  padding: 10px 6px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.day-btn-compact:hover {
  border-color: #d1d5db;
}

.day-btn-compact.active {
  border-color: #10b981;
  background: #ecfdf5;
  color: #10b981;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #f1f3f5;
  background: #f9fafb;
  justify-content: flex-end;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
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

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: transform 0.25s ease, opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

@media (max-width: 480px) {
  .modal-container {
    max-width: 100%;
    border-radius: 20px 20px 0 0;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }
  
  .modal-overlay {
    align-items: flex-end;
    padding: 0;
  }
  
  .schedule-presets {
    flex-wrap: wrap;
  }
  
  .preset-btn {
    flex: 1 1 30%;
    min-width: 0;
  }
}
</style>
