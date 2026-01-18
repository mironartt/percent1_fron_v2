<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
        <div class="edit-modal edit-modal-extended">
          <div class="modal-header">
            <h3>
              <Plus :size="20" :stroke-width="2" class="modal-header-icon" />
              Добавление новой цели
            </h3>
            <button class="modal-close" @click="closeModal">
              <X :size="20" :stroke-width="2" />
            </button>
          </div>

          <div class="modal-body">
            <div class="helpers-section">
              <button class="helper-toggle" @click="toggleTemplates">
                <Lightbulb :size="18" />
                <span>Выбрать из шаблонов</span>
                <ChevronDown :size="16" class="toggle-chevron" :class="{ rotated: showTemplates }" />
              </button>
              <button class="helper-toggle mentor-toggle" @click="openMentorModal">
                <Bot :size="18" />
                <span>Помощь от ментора</span>
              </button>
            </div>
            
            <transition name="slide-fade">
              <div v-if="showTemplates" class="templates-section">
                <div class="templates-sphere-tabs">
                  <button
                    v-for="sphere in lifeSpheres"
                    :key="sphere.id"
                    class="template-sphere-tab"
                    :class="{ active: selectedTemplateSphere === sphere.id }"
                    :style="{ '--sphere-color': getSphereColor(sphere.id) }"
                    :title="getSphereNameOnly(sphere.id)"
                    @click="selectedTemplateSphere = sphere.id"
                  >
                    <component :is="getSphereIcon(sphere.id)" :size="16" />
                  </button>
                </div>
                
                <div class="templates-list">
                  <button
                    v-for="(template, idx) in filteredTemplates"
                    :key="idx"
                    class="template-item"
                    @click="selectTemplate(template)"
                  >
                    {{ template }}
                  </button>
                </div>
              </div>
            </transition>

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
                      @click="toggleWhyQuestion(1)"
                    >
                      <span class="accordion-title">1. Почему для меня это важно?</span>
                      <span v-if="newGoal.whyImportant?.trim() && !whyAccordion.question1Open" class="accordion-preview">{{ newGoal.whyImportant.slice(0, 30) }}...</span>
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
                      @click="toggleWhyQuestion(2)"
                    >
                      <span class="accordion-title">2. Как это изменит мою жизнь?</span>
                      <span v-if="newGoal.why2?.trim() && !whyAccordion.question2Open" class="accordion-preview">{{ newGoal.why2.slice(0, 30) }}...</span>
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
            <button class="btn btn-secondary" @click="closeModal">
              Отмена
            </button>
            <button class="btn btn-primary" @click="saveNewGoal" :disabled="!newGoal.text.trim() || isSaving">
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
  Plus, 
  X, 
  ChevronDown, 
  Lightbulb, 
  MessageSquare, 
  Bot,
  Loader2,
  Wallet, 
  Palette, 
  Users, 
  Heart, 
  Briefcase, 
  HeartHandshake
} from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'created', 'open-mentor'])

const store = useAppStore()
const titleInput = ref(null)

const sphereIcons = {
  wealth: Wallet,
  hobbies: Palette,
  friendship: Users,
  health: Heart,
  career: Briefcase,
  love: HeartHandshake
}

const sphereColors = {
  wealth: '#e63946',
  hobbies: '#f4a261',
  friendship: '#e9c46a',
  health: '#2a9d8f',
  career: '#264653',
  love: '#9b5de5'
}

const goalTemplates = {
  wealth: [
    'Создать финансовую подушку на 3 месяца',
    'Увеличить доход на 20%',
    'Закрыть все кредиты и долги',
    'Начать инвестировать регулярно',
    'Сократить ненужные расходы'
  ],
  hobbies: [
    'Освоить новое творческое хобби',
    'Создать портфолио своих работ',
    'Участвовать в творческом конкурсе',
    'Выделять время на отдых и хобби еженедельно',
    'Пройти курс по дизайну/музыке/искусству'
  ],
  friendship: [
    'Улучшить общение с друзьями',
    'Завести новых друзей по интересам',
    'Организовать регулярные встречи с друзьями',
    'Научиться слушать и понимать других',
    'Расширить круг общения'
  ],
  health: [
    'Установить режим сна 7-8 часов',
    'Заниматься спортом 3 раза в неделю',
    'Пройти полное медицинское обследование',
    'Наладить здоровое питание',
    'Избавиться от вредной привычки'
  ],
  career: [
    'Получить повышение или новую должность',
    'Освоить новый профессиональный навык',
    'Построить личный бренд в индустрии',
    'Найти ментора в своей сфере',
    'Пройти сертификацию или курс повышения квалификации'
  ],
  love: [
    'Улучшить отношения с партнёром',
    'Проводить качественное время с семьёй',
    'Научиться выражать чувства и благодарность',
    'Разрешить затянувшийся конфликт в отношениях',
    'Укрепить эмоциональную связь с близкими'
  ]
}

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

const showTemplates = ref(false)
const selectedTemplateSphere = ref('')
const showReflectionSection = ref(false)
const isSaving = ref(false)

const whyAccordion = ref({
  question1Open: false,
  question2Open: false
})

const filteredTemplates = computed(() => {
  if (!selectedTemplateSphere.value) return []
  return goalTemplates[selectedTemplateSphere.value] || []
})

function getSphereIcon(sphereId) {
  return sphereIcons[sphereId] || Lightbulb
}

function getSphereColor(sphereId) {
  return sphereColors[sphereId] || '#6366f1'
}

function getSphereNameOnly(sphereId) {
  const sphere = lifeSpheres.value.find(s => s.id === sphereId)
  return sphere?.name || sphereId
}

function toggleTemplates() {
  showTemplates.value = !showTemplates.value
  if (showTemplates.value && !selectedTemplateSphere.value && lifeSpheres.value.length > 0) {
    selectedTemplateSphere.value = lifeSpheres.value[0].id
  }
}

function selectTemplate(template) {
  newGoal.value.text = template
  newGoal.value.sphereId = selectedTemplateSphere.value
  showTemplates.value = false
}

function toggleWhyQuestion(questionNum) {
  if (questionNum === 1) {
    whyAccordion.value.question1Open = !whyAccordion.value.question1Open
  } else {
    whyAccordion.value.question2Open = !whyAccordion.value.question2Open
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
  showTemplates.value = false
  selectedTemplateSphere.value = ''
  whyAccordion.value = { question1Open: false, question2Open: false }
}

function closeModal() {
  resetForm()
  emit('update:modelValue', false)
}

function openMentorModal() {
  emit('update:modelValue', false)
  emit('open-mentor')
}

async function saveNewGoal() {
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
      generatedByAI: newGoal.value.generatedByAI,
      steps: newGoal.value.steps || []
    }
    
    const localGoal = store.addRawIdea(goalData, { insertAtTop: true })
    
    store.createGoalOnBackend(goalData).then(result => {
      if (result.success && result.goalId) {
        store.updateRawIdea(localGoal.id, { backendId: result.goalId })
      }
    })
    
    emit('created', localGoal)
    closeModal()
  } catch (error) {
    console.error('[AddGoalModal] Save error:', error)
  } finally {
    isSaving.value = false
  }
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    resetForm()
    nextTick(() => {
      titleInput.value?.focus()
    })
  }
})
</script>

<style scoped>
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
  z-index: 2000;
  padding: 1rem;
}

.edit-modal {
  background: var(--bg-primary, #ffffff);
  border-radius: var(--radius-lg, 16px);
  box-shadow: var(--shadow-lg, 0 20px 60px rgba(0, 0, 0, 0.15));
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
}

.edit-modal.edit-modal-extended {
  max-width: 600px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  margin: 0;
}

.modal-header-icon {
  color: var(--primary-color, #6366f1);
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: var(--bg-secondary, #f3f4f6);
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close:hover {
  background: var(--border-color, #e5e7eb);
  color: var(--text-primary, #1f2937);
}

.modal-body {
  padding: 1.5rem;
}

.helpers-section {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.helper-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  padding: 0.75rem 0.75rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08));
  border: 1px dashed var(--primary-color, #6366f1);
  border-radius: var(--radius-md, 10px);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--primary-color, #6366f1);
  cursor: pointer;
  transition: all 0.2s;
}

.helper-toggle:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.12));
}

.helper-toggle .toggle-chevron {
  margin-left: auto;
  transition: transform 0.2s;
}

.helper-toggle .toggle-chevron.rotated {
  transform: rotate(180deg);
}

.mentor-toggle {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(34, 197, 94, 0.08));
  border-color: #10b981;
  color: #10b981;
}

.mentor-toggle:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(34, 197, 94, 0.15));
}

.templates-section {
  margin-bottom: 1rem;
}

.templates-sphere-tabs {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.template-sphere-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1.5px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-primary, #ffffff);
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  transition: all 0.2s;
}

.template-sphere-tab:hover {
  border-color: var(--sphere-color);
  color: var(--sphere-color);
}

.template-sphere-tab.active {
  border-color: var(--sphere-color);
  background: color-mix(in srgb, var(--sphere-color) 15%, var(--bg-primary, #ffffff));
  color: var(--sphere-color);
}

.templates-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.template-item {
  padding: 0.75rem;
  background: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: var(--radius-sm, 8px);
  font-size: 0.875rem;
  color: var(--text-primary, #1f2937);
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
}

.template-item:hover {
  border-color: var(--primary-color, #6366f1);
  background: rgba(99, 102, 241, 0.05);
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary, #6b7280);
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: var(--radius-md, 10px);
  background: var(--bg-primary, #ffffff);
  font-size: 0.9375rem;
  color: var(--text-primary, #1f2937);
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color, #6366f1);
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
  gap: 0.375rem;
  padding: 0.75rem 0.5rem;
  border: 1.5px solid var(--border-color, #e5e7eb);
  border-radius: var(--radius-md, 10px);
  background: var(--bg-primary, #ffffff);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8125rem;
  color: var(--text-secondary, #6b7280);
}

.sphere-select-btn:hover {
  border-color: var(--sphere-color);
  background: color-mix(in srgb, var(--sphere-color) 5%, var(--bg-primary, #ffffff));
}

.sphere-select-btn.active {
  border-color: var(--sphere-color);
  background: color-mix(in srgb, var(--sphere-color) 10%, var(--bg-primary, #ffffff));
  color: var(--sphere-color);
}

.sphere-select-btn svg {
  color: var(--sphere-color);
}

.reflection-toggle-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.reflection-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: transparent;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: var(--radius-md, 10px);
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  transition: all 0.2s;
}

.reflection-toggle-btn:hover {
  border-color: var(--primary-color, #6366f1);
  color: var(--primary-color, #6366f1);
}

.reflection-toggle-btn .toggle-chevron {
  margin-left: auto;
  transition: transform 0.2s;
}

.reflection-toggle-btn .toggle-chevron.rotated {
  transform: rotate(180deg);
}

.optional-badge {
  font-size: 0.7rem;
  padding: 0.125rem 0.375rem;
  background: var(--bg-secondary, #f3f4f6);
  color: var(--text-secondary, #6b7280);
  border-radius: 4px;
}

.reflection-content {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-secondary, #f9fafb);
  border-radius: var(--radius-md, 10px);
}

.accordion-group {
  margin-bottom: 0.5rem;
}

.accordion-group:last-child {
  margin-bottom: 0;
}

.accordion-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: var(--radius-sm, 8px);
  cursor: pointer;
  transition: all 0.2s;
}

.accordion-header:hover {
  background: var(--bg-secondary, #f9fafb);
}

.accordion-header.open {
  border-radius: var(--radius-sm, 8px) var(--radius-sm, 8px) 0 0;
  border-bottom-color: transparent;
}

.accordion-header.filled:not(.open) {
  border-color: var(--success, #10b981);
  background: rgba(16, 185, 129, 0.05);
}

.accordion-title {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary, #1f2937);
}

.accordion-preview {
  font-size: 0.75rem;
  color: var(--text-secondary, #9ca3af);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.accordion-chevron {
  color: var(--text-secondary, #9ca3af);
  transition: transform 0.2s;
}

.accordion-chevron.open {
  transform: rotate(180deg);
}

.accordion-content {
  padding: 0.75rem;
  background: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-top: none;
  border-radius: 0 0 var(--radius-sm, 8px) var(--radius-sm, 8px);
}

.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: var(--radius-md, 10px);
  background: var(--bg-primary, #ffffff);
  font-size: 0.9375rem;
  color: var(--text-primary, #1f2937);
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color, #6366f1);
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-secondary, #f9fafb);
}

.modal-footer-add {
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius-md, 10px);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: var(--bg-primary, #ffffff);
  color: var(--text-secondary, #6b7280);
  border: 1px solid var(--border-color, #e5e7eb);
}

.btn-secondary:hover {
  background: var(--bg-secondary, #f3f4f6);
  border-color: var(--border-color, #d1d5db);
}

.btn-primary {
  background: var(--primary-color, #6366f1);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark, #4f46e5);
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
  transition: all 0.25s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  opacity: 1;
  max-height: 400px;
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 0;
    align-items: flex-end;
  }
  
  .edit-modal {
    max-width: 100%;
    border-radius: 20px 20px 0 0;
    max-height: 95vh;
  }
  
  .helpers-section {
    flex-direction: column;
  }
  
  .helper-toggle span {
    font-size: 0.8rem;
  }
  
  .sphere-select-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
