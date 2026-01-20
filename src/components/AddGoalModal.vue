<template>
  <Teleport to="body">
    <Transition name="modal-slide">
      <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
        <div
          class="goal-modal"
          ref="modalRef"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <!-- Drag Handle for mobile -->
          <div class="modal-drag-handle">
            <div class="drag-indicator"></div>
          </div>

          <!-- Compact Header -->
          <div class="modal-header">
            <button class="modal-close" @click="closeModal" aria-label="Закрыть">
              <X :size="20" />
            </button>
            <h3>Новая цель</h3>
            <div class="header-spacer"></div>
          </div>

          <div class="modal-body">
            <!-- Main Input - Primary Focus -->
            <div class="main-input-section">
              <input
                ref="titleInput"
                v-model="newGoal.text"
                type="text"
                class="goal-title-input"
                placeholder="Чего вы хотите достичь?"
                @keydown.enter="handleEnterKey"
              />
            </div>

            <!-- Sphere Selection - Collapsible -->
            <div class="sphere-section">
              <!-- Selected sphere or toggle button -->
              <button
                v-if="!showSphereSelector && !newGoal.sphereId"
                class="sphere-toggle-btn"
                @click="showSphereSelector = true"
              >
                <Plus :size="16" />
                <span>Выбрать сферу жизни</span>
              </button>

              <!-- Selected sphere chip (when sphere is chosen but selector closed) -->
              <button
                v-else-if="!showSphereSelector && newGoal.sphereId"
                class="sphere-selected-btn"
                :style="{ '--sphere-color': getSphereColor(newGoal.sphereId) }"
                @click="showSphereSelector = true"
              >
                <component :is="getSphereIcon(newGoal.sphereId)" :size="16" />
                <span>{{ getSphereNameOnly(newGoal.sphereId) }}</span>
                <ChevronDown :size="14" class="edit-icon" />
              </button>

              <!-- Sphere chips (expanded) -->
              <Transition name="slide-down">
                <div v-if="showSphereSelector" class="sphere-chips-wrapper">
                  <div class="sphere-chips">
                    <button
                      v-for="sphere in lifeSpheres"
                      :key="sphere.id"
                      class="sphere-chip"
                      :class="{ active: newGoal.sphereId === sphere.id }"
                      :style="{ '--sphere-color': getSphereColor(sphere.id) }"
                      @click="selectSphere(sphere.id)"
                    >
                      <component :is="getSphereIcon(sphere.id)" :size="16" />
                      <span>{{ getSphereNameOnly(sphere.id) }}</span>
                    </button>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Divider -->
            <div class="section-divider"></div>

            <!-- Help Section - Less Prominent -->
            <div class="help-section">
              <span class="help-label">
                <Lightbulb :size="14" />
                Нужна идея?
              </span>
              <div class="help-buttons">
                <button class="help-btn" @click="toggleTemplates">
                  <FileText :size="14" />
                  <span>Шаблоны</span>
                </button>
                <button class="help-btn help-btn-mentor" @click="openMentorModal">
                  <Bot :size="14" />
                  <span>Ментор</span>
                </button>
              </div>
            </div>

            <!-- Templates Dropdown -->
            <Transition name="slide-down">
              <div v-if="showTemplates" class="templates-dropdown">
                <div class="templates-tabs">
                  <button
                    v-for="sphere in lifeSpheres"
                    :key="sphere.id"
                    class="template-tab"
                    :class="{ active: selectedTemplateSphere === sphere.id }"
                    :style="{ '--sphere-color': getSphereColor(sphere.id) }"
                    @click="selectedTemplateSphere = sphere.id"
                  >
                    <component :is="getSphereIcon(sphere.id)" :size="14" />
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
            </Transition>

            <!-- Motivation Section - Single Expandable -->
            <div class="motivation-section">
              <button
                class="motivation-toggle"
                :class="{ expanded: showMotivation, filled: hasMotivation }"
                @click="showMotivation = !showMotivation"
              >
                <MessageSquare :size="16" />
                <span>{{ showMotivation ? 'Скрыть мотивацию' : 'Добавить мотивацию' }}</span>
                <span v-if="!showMotivation && !hasMotivation" class="optional-tag">опционально</span>
                <span v-if="hasMotivation && !showMotivation" class="filled-indicator">
                  <Check :size="12" />
                </span>
                <ChevronDown :size="16" class="toggle-icon" :class="{ rotated: showMotivation }" />
              </button>

              <Transition name="slide-down">
                <div v-if="showMotivation" class="motivation-content">
                  <textarea
                    v-model="newGoal.whyImportant"
                    class="motivation-textarea"
                    placeholder="Почему эта цель важна для вас? Как изменится ваша жизнь после её достижения?"
                    rows="3"
                  ></textarea>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Footer - Single Primary Action -->
          <div class="modal-footer">
            <button
              class="btn-create"
              :disabled="!canCreate"
              @click="saveNewGoal"
            >
              <Loader2 v-if="isSaving" :size="18" class="spin" />
              <template v-else>
                <Plus :size="18" />
                <span>Создать цель</span>
              </template>
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
  FileText,
  Check,
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
const modalRef = ref(null)

// Touch handling for swipe-to-close
const touchStartY = ref(0)
const touchCurrentY = ref(0)
const isDragging = ref(false)

function handleTouchStart(e) {
  if (e.target.closest('.templates-list') || e.target.closest('.motivation-textarea')) return
  touchStartY.value = e.touches[0].clientY
  isDragging.value = true
}

function handleTouchMove(e) {
  if (!isDragging.value) return
  touchCurrentY.value = e.touches[0].clientY
  const diff = touchCurrentY.value - touchStartY.value

  if (diff > 0 && modalRef.value) {
    modalRef.value.style.transform = `translateY(${Math.min(diff, 200)}px)`
  }
}

function handleTouchEnd() {
  if (!isDragging.value) return
  const diff = touchCurrentY.value - touchStartY.value

  if (diff > 100) {
    closeModal()
  } else if (modalRef.value) {
    modalRef.value.style.transform = ''
  }

  isDragging.value = false
  touchStartY.value = 0
  touchCurrentY.value = 0
}

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
const showMotivation = ref(false)
const showSphereSelector = ref(false)
const isSaving = ref(false)

const filteredTemplates = computed(() => {
  if (!selectedTemplateSphere.value) return []
  return goalTemplates[selectedTemplateSphere.value] || []
})

const canCreate = computed(() => {
  return newGoal.value.text.trim() && newGoal.value.sphereId && !isSaving.value
})

const hasMotivation = computed(() => {
  return newGoal.value.whyImportant?.trim()
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

function selectSphere(sphereId) {
  newGoal.value.sphereId = sphereId
  showSphereSelector.value = false
}

function selectTemplate(template) {
  newGoal.value.text = template
  newGoal.value.sphereId = selectedTemplateSphere.value
  showTemplates.value = false
  // Focus back to input for potential editing
  nextTick(() => {
    titleInput.value?.focus()
  })
}

function handleEnterKey(e) {
  if (e.shiftKey) return
  if (canCreate.value) {
    saveNewGoal()
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
  showMotivation.value = false
  showTemplates.value = false
  showSphereSelector.value = false
  selectedTemplateSphere.value = ''
}

function closeModal() {
  if (modalRef.value) {
    modalRef.value.style.transform = ''
  }
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
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.goal-modal {
  background: var(--bg-primary, #ffffff);
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease;
}

.modal-drag-handle {
  display: none;
  justify-content: center;
  padding: 12px 0 4px;
}

.drag-indicator {
  width: 36px;
  height: 4px;
  background: var(--border-color, #d1d5db);
  border-radius: 2px;
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  margin: 0;
  text-align: center;
  flex: 1;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  transition: all 0.15s;
}

.modal-close:hover {
  background: var(--bg-secondary, #f3f4f6);
  color: var(--text-primary, #1f2937);
}

.header-spacer {
  width: 36px;
}

/* Body */
.modal-body {
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
}

/* Main Input */
.main-input-section {
  margin-bottom: 1.25rem;
}

.goal-title-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  background: var(--bg-primary, #ffffff);
  font-size: 1.0625rem;
  font-weight: 500;
  color: var(--text-primary, #1f2937);
  transition: all 0.2s;
}

.goal-title-input:focus {
  outline: none;
  border-color: var(--primary-color, #6366f1);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.goal-title-input::placeholder {
  color: var(--text-tertiary, #9ca3af);
  font-weight: 400;
}

/* Sphere Section */
.sphere-section {
  margin-bottom: 1.25rem;
}

.sphere-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border: 1.5px dashed var(--border-color, #d1d5db);
  border-radius: 20px;
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  transition: all 0.15s;
}

.sphere-toggle-btn:hover {
  border-color: var(--primary-color, #6366f1);
  color: var(--primary-color, #6366f1);
  background: rgba(99, 102, 241, 0.05);
}

.sphere-toggle-btn .optional-tag {
  margin-left: 0.25rem;
}

.sphere-selected-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border: 1.5px solid var(--sphere-color);
  border-radius: 20px;
  background: color-mix(in srgb, var(--sphere-color) 10%, transparent);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--sphere-color);
  cursor: pointer;
  transition: all 0.15s;
}

.sphere-selected-btn:hover {
  background: color-mix(in srgb, var(--sphere-color) 15%, transparent);
}

.sphere-selected-btn svg {
  color: var(--sphere-color);
}

.sphere-selected-btn .edit-icon {
  margin-left: 0.25rem;
  opacity: 0.7;
}

.sphere-chips-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sphere-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.sphere-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border: 1.5px solid var(--border-color, #e5e7eb);
  border-radius: 20px;
  background: var(--bg-primary, #ffffff);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  transition: all 0.15s;
}

.sphere-chip:hover {
  border-color: var(--sphere-color);
  color: var(--sphere-color);
}

.sphere-chip.active {
  border-color: var(--sphere-color);
  background: var(--sphere-color);
  color: white;
}

.sphere-chip.active svg {
  color: white;
}

.sphere-chip svg {
  color: var(--sphere-color);
  transition: color 0.15s;
}

.sphere-clear-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-size: 0.75rem;
  color: var(--text-tertiary, #9ca3af);
  cursor: pointer;
  transition: all 0.15s;
  align-self: flex-start;
}

.sphere-clear-btn:hover {
  color: var(--danger, #ef4444);
  background: rgba(239, 68, 68, 0.1);
}

/* Divider */
.section-divider {
  height: 1px;
  background: var(--border-color, #e5e7eb);
  margin: 0.75rem 0;
}

/* Help Section */
.help-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.help-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--text-tertiary, #9ca3af);
}

.help-buttons {
  display: flex;
  gap: 0.5rem;
}

.help-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-primary, #ffffff);
  font-size: 0.8125rem;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  transition: all 0.15s;
}

.help-btn:hover {
  border-color: var(--primary-color, #6366f1);
  color: var(--primary-color, #6366f1);
  background: rgba(99, 102, 241, 0.05);
}

.help-btn-mentor {
  border-color: rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.help-btn-mentor:hover {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

/* Templates Dropdown */
.templates-dropdown {
  background: var(--bg-secondary, #f9fafb);
  border-radius: 12px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
}

.templates-tabs {
  display: flex;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.template-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1.5px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-primary, #ffffff);
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  transition: all 0.15s;
}

.template-tab:hover {
  border-color: var(--sphere-color);
  color: var(--sphere-color);
}

.template-tab.active {
  border-color: var(--sphere-color);
  background: var(--sphere-color);
  color: white;
}

.templates-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  max-height: 180px;
  overflow-y: auto;
}

.template-item {
  padding: 0.625rem 0.75rem;
  background: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--text-primary, #1f2937);
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
}

.template-item:hover {
  border-color: var(--primary-color, #6366f1);
  background: rgba(99, 102, 241, 0.03);
}

/* Motivation Section */
.motivation-section {
  margin-top: 0.5rem;
}

.motivation-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: transparent;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  transition: all 0.15s;
}

.motivation-toggle:hover {
  border-color: var(--text-tertiary, #9ca3af);
}

.motivation-toggle.expanded {
  border-color: var(--primary-color, #6366f1);
  color: var(--primary-color, #6366f1);
  border-radius: 10px 10px 0 0;
  border-bottom-color: transparent;
}

.motivation-toggle.filled:not(.expanded) {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.optional-tag {
  font-size: 0.6875rem;
  padding: 0.125rem 0.375rem;
  background: var(--bg-secondary, #f3f4f6);
  color: var(--text-tertiary, #9ca3af);
  border-radius: 4px;
  margin-left: auto;
}

.filled-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  margin-left: auto;
}

.toggle-icon {
  margin-left: auto;
  transition: transform 0.2s;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

.motivation-content {
  padding: 0.75rem;
  background: var(--bg-secondary, #f9fafb);
  border: 1px solid var(--primary-color, #6366f1);
  border-top: none;
  border-radius: 0 0 10px 10px;
}

.motivation-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-primary, #ffffff);
  font-size: 0.9375rem;
  color: var(--text-primary, #1f2937);
  font-family: inherit;
  resize: none;
  min-height: 80px;
  transition: border-color 0.15s;
}

.motivation-textarea:focus {
  outline: none;
  border-color: var(--primary-color, #6366f1);
}

.motivation-textarea::placeholder {
  color: var(--text-tertiary, #9ca3af);
}

/* Footer */
.modal-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-secondary, #f9fafb);
}

.btn-create {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: var(--primary-color, #6366f1);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-create:hover:not(:disabled) {
  background: var(--primary-dark, #4f46e5);
  transform: translateY(-1px);
}

.btn-create:active:not(:disabled) {
  transform: translateY(0);
}

.btn-create:disabled {
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

/* Animations */
.modal-slide-enter-active,
.modal-slide-leave-active {
  transition: opacity 0.25s ease;
}

.modal-slide-enter-active .goal-modal,
.modal-slide-leave-active .goal-modal {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}

.modal-slide-enter-from,
.modal-slide-leave-to {
  opacity: 0;
}

.modal-slide-enter-from .goal-modal {
  transform: translateY(20px) scale(0.98);
  opacity: 0;
}

.modal-slide-leave-to .goal-modal {
  transform: translateY(20px) scale(0.98);
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-bottom: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 300px;
}

/* Mobile Styles */
@media (max-width: 480px) {
  .modal-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .goal-modal {
    max-width: 100%;
    border-radius: 20px 20px 0 0;
    max-height: 95vh;
  }

  .modal-drag-handle {
    display: flex;
  }

  .modal-header {
    padding-top: 0.5rem;
  }

  .sphere-chips {
    gap: 0.375rem;
  }

  .sphere-chip {
    padding: 0.4rem 0.75rem;
    font-size: 0.75rem;
  }

  .help-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .help-buttons {
    width: 100%;
  }

  .help-btn {
    flex: 1;
    justify-content: center;
  }

  /* Slide up animation for mobile */
  .modal-slide-enter-from .goal-modal {
    transform: translateY(100%);
  }

  .modal-slide-leave-to .goal-modal {
    transform: translateY(100%);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .goal-modal {
    background: var(--bg-primary, #1f2937);
  }

  .goal-title-input,
  .motivation-textarea,
  .template-item {
    background: var(--bg-secondary, #374151);
  }
}
</style>
