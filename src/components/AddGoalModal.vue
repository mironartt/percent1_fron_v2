<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <div class="edit-modal edit-modal-extended">
          <div class="modal-header">
            <h3>
              <Plus :size="20" :stroke-width="2" class="modal-header-icon" />
              Добавление новой цели
            </h3>
            <button class="modal-close" @click="close">
              <X :size="20" :stroke-width="2" />
            </button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Название цели</label>
              <input 
                ref="titleInput"
                v-model="newGoal.text"
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
                  :class="{ active: newGoal.sphereId === sphere.id }"
                  :style="{ '--sphere-color': getSphereColor(sphere.id) }"
                  @click="newGoal.sphereId = sphere.id"
                >
                  <component :is="getSphereIcon(sphere.id)" :size="18" :stroke-width="2" />
                  <span>{{ getSphereNameOnly(sphere.id) }}</span>
                </button>
              </div>
            </div>

            <div class="reflection-toggle-section">
              <button class="reflection-toggle-btn" @click="showReflectionSection = !showReflectionSection">
                <MessageSquare :size="16" />
                <span>Добавить рефлексию</span>
                <span class="optional-badge">опционально</span>
                <ChevronDown :size="16" class="toggle-chevron" :class="{ rotated: showReflectionSection }" />
              </button>
              
              <transition name="slide-fade">
                <div v-if="showReflectionSection" class="reflection-content">
                  <div class="accordion-group">
                    <div 
                      class="accordion-header" 
                      :class="{ open: whyAccordion.question1Open, filled: newGoal.whyImportant?.trim() }"
                      @click="whyAccordion.question1Open = !whyAccordion.question1Open"
                    >
                      <span class="accordion-title">1. Почему для меня это важно?</span>
                      <ChevronDown :size="16" class="accordion-chevron" :class="{ open: whyAccordion.question1Open }" />
                    </div>
                    <div class="accordion-content" v-show="whyAccordion.question1Open">
                      <textarea 
                        v-model="newGoal.whyImportant"
                        class="form-textarea"
                        placeholder="Опишите, почему эта цель важна для вас"
                        rows="3"
                      ></textarea>
                    </div>
                  </div>

                  <div class="accordion-group">
                    <div 
                      class="accordion-header" 
                      :class="{ open: whyAccordion.question2Open, filled: newGoal.why2?.trim() }"
                      @click="whyAccordion.question2Open = !whyAccordion.question2Open"
                    >
                      <span class="accordion-title">2. Как это изменит мою жизнь?</span>
                      <ChevronDown :size="16" class="accordion-chevron" :class="{ open: whyAccordion.question2Open }" />
                    </div>
                    <div class="accordion-content" v-show="whyAccordion.question2Open">
                      <textarea 
                        v-model="newGoal.why2"
                        class="form-textarea"
                        placeholder="Опишите, как достижение этой цели изменит вашу жизнь"
                        rows="3"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <div class="modal-footer modal-footer-add">
            <button class="btn btn-secondary" @click="close">
              Отмена
            </button>
            <button 
              class="btn btn-primary" 
              @click="save" 
              :disabled="!newGoal.text.trim() || isSaving"
            >
              <Loader2 v-if="isSaving" :size="16" :stroke-width="2" class="spin" />
              <Plus v-else :size="16" :stroke-width="2" />
              Добавить цель
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useAppStore } from '@/stores/app'
import { 
  Plus, X, ChevronDown, MessageSquare, Loader2,
  Wallet, Palette, Users, Heart, Briefcase, HeartHandshake
} from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'created'])

const store = useAppStore()
const titleInput = ref(null)

const lifeSpheres = computed(() => store.lifeSpheres)

const newGoal = ref({
  text: '',
  sphereId: '',
  whyImportant: '',
  why2: '',
  status: null,
  generatedByAI: false,
  steps: []
})

const showReflectionSection = ref(false)
const whyAccordion = ref({
  question1Open: false,
  question2Open: false
})
const isSaving = ref(false)

function getSphereColor(sphereId) {
  const colors = {
    'welfare': '#22c55e',
    'hobby': '#f97316',
    'environment': '#0ea5e9',
    'health_sport': '#ef4444',
    'work': '#8b5cf6',
    'family': '#ec4899'
  }
  return colors[sphereId] || '#6b7280'
}

function getSphereIcon(sphereId) {
  const icons = {
    'welfare': Wallet,
    'hobby': Palette,
    'environment': Users,
    'health_sport': Heart,
    'work': Briefcase,
    'family': HeartHandshake
  }
  return icons[sphereId] || Wallet
}

function getSphereNameOnly(sphereId) {
  const names = {
    'welfare': 'Финансы',
    'hobby': 'Хобби',
    'environment': 'Окружение',
    'health_sport': 'Здоровье',
    'work': 'Работа',
    'family': 'Семья'
  }
  return names[sphereId] || sphereId
}

async function save() {
  if (!newGoal.value.text.trim() || isSaving.value) return
  
  isSaving.value = true
  
  try {
    const goalData = {
      text: newGoal.value.text.trim(),
      sphereId: newGoal.value.sphereId,
      whyImportant: newGoal.value.whyImportant,
      status: newGoal.value.status,
      threeWhys: {
        why1: newGoal.value.whyImportant,
        why2: newGoal.value.why2
      },
      generatedByAI: false,
      steps: []
    }
    
    const localGoal = store.addRawIdea(goalData, { insertAtTop: true })
    
    store.createGoalOnBackend(goalData).then(result => {
      if (result.success && result.goalId) {
        store.updateRawIdea(localGoal.id, { backendId: result.goalId })
      }
    })
    
    emit('created', localGoal)
    resetForm()
    close()
  } catch (error) {
    console.error('[AddGoalModal] Save error:', error)
    alert('Ошибка: ' + error.message)
  } finally {
    isSaving.value = false
  }
}

function resetForm() {
  newGoal.value = {
    text: '',
    sphereId: '',
    whyImportant: '',
    why2: '',
    status: null,
    generatedByAI: false,
    steps: []
  }
  showReflectionSection.value = false
  whyAccordion.value = { question1Open: false, question2Open: false }
}

function close() {
  emit('update:modelValue', false)
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      titleInput.value?.focus()
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

.edit-modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 520px;
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
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-header-icon {
  color: #6366f1;
}

.modal-close {
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

.modal-close:hover {
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

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 15px;
  color: #1f2937;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
}

.sphere-select-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.sphere-select-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
}

.sphere-select-btn:hover {
  border-color: var(--sphere-color);
  background: color-mix(in srgb, var(--sphere-color) 5%, white);
}

.sphere-select-btn.active {
  border-color: var(--sphere-color);
  background: color-mix(in srgb, var(--sphere-color) 10%, white);
  color: var(--sphere-color);
}

.reflection-toggle-section {
  margin-top: 8px;
}

.reflection-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 1px dashed #d1d5db;
  border-radius: 12px;
  background: #f9fafb;
  cursor: pointer;
  width: 100%;
  font-size: 14px;
  color: #6b7280;
  transition: all 0.2s;
}

.reflection-toggle-btn:hover {
  border-color: #9ca3af;
  background: #f3f4f6;
}

.optional-badge {
  font-size: 11px;
  padding: 2px 8px;
  background: #e5e7eb;
  border-radius: 6px;
  color: #9ca3af;
}

.toggle-chevron {
  margin-left: auto;
  transition: transform 0.2s;
}

.toggle-chevron.rotated {
  transform: rotate(180deg);
}

.reflection-content {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.accordion-group {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.accordion-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f9fafb;
  cursor: pointer;
  transition: background 0.2s;
}

.accordion-header:hover {
  background: #f3f4f6;
}

.accordion-title {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.accordion-chevron {
  transition: transform 0.2s;
  color: #9ca3af;
}

.accordion-chevron.open {
  transform: rotate(180deg);
}

.accordion-content {
  padding: 12px 16px;
  background: white;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  resize: vertical;
  font-family: inherit;
}

.form-textarea:focus {
  outline: none;
  border-color: #6366f1;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #f1f3f5;
  background: #f9fafb;
}

.modal-footer-add {
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

.modal-fade-enter-active .edit-modal,
.modal-fade-leave-active .edit-modal {
  transition: transform 0.25s ease, opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .edit-modal,
.modal-fade-leave-to .edit-modal {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 480px) {
  .edit-modal {
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
  
  .sphere-select-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
