<template>
  <Transition name="modal-slide">
    <div v-if="show" class="modal-overlay" @click.self="closeModal">
      <div
        class="mentor-modal"
        ref="modalRef"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- Drag Handle for mobile -->
        <div class="modal-drag-handle">
          <div class="drag-indicator"></div>
        </div>

        <div class="modal-header">
          <button class="modal-close" @click="closeModal">
            <X :size="20" />
          </button>
          <h3>Помощь от ментора</h3>
          <div class="header-spacer"></div>
        </div>

        <div class="modal-body">
          <!-- Step: Intro -->
          <template v-if="step === 'intro'">
            <div class="intro-section">
              <div class="intro-icon">
                <Sparkles :size="40" />
              </div>
              <h4>Персональный подбор целей</h4>
              <p class="intro-description">
                Ментор проанализирует ваши данные из Колеса жизни: оценки сфер,
                зоны роста и ваши желания. На основе этого подберет 3 цели,
                которые помогут вам развиваться в приоритетных направлениях.
              </p>
              <div class="intro-features">
                <div class="feature-item">
                  <Target :size="18" />
                  <span>Цели на основе ваших зон роста</span>
                </div>
                <div class="feature-item">
                  <MessageCircle :size="18" />
                  <span>Объяснение пользы каждой цели</span>
                </div>
                <div class="feature-item">
                  <ListChecks :size="18" />
                  <span>Автоматическая декомпозиция на шаги</span>
                </div>
              </div>
            </div>
          </template>

          <!-- Step: Loading -->
          <template v-else-if="step === 'loading'">
            <div class="loading-section">
              <div class="loading-icon">
                <Bot :size="32" class="pulse" />
              </div>
              <h4>{{ mentorProgress.text || 'Анализирую ваш профиль...' }}</h4>
              <div class="progress-bar-wrapper">
                <div class="progress-bar-track">
                  <div
                    class="progress-bar-fill"
                    :style="{ width: mentorProgress.percent + '%' }"
                  ></div>
                </div>
                <span class="progress-percent">{{ mentorProgress.percent || 0 }}%</span>
              </div>
              <p class="loading-hint">Это займет несколько секунд</p>
            </div>
          </template>

          <!-- Step: Selection -->
          <template v-else-if="step === 'selection'">
            <div class="selection-section">
              <div class="selection-header">
                <h4>Рекомендованные цели</h4>
                <p class="selection-hint">Выберите цели для добавления</p>
              </div>

              <div class="suggestions-list">
                <div
                  v-for="(suggestion, idx) in suggestions"
                  :key="idx"
                  class="suggestion-item"
                >
                  <div
                    class="suggestion-card"
                    :class="{ selected: selectedGoals.includes(idx) }"
                    :style="{ '--sphere-color': getSphereColor(suggestion.sphereId) }"
                    @click="toggleGoalSelection(idx)"
                  >
                    <div class="suggestion-checkbox">
                      <CheckSquare v-if="selectedGoals.includes(idx)" :size="20" />
                      <Square v-else :size="20" />
                    </div>

                    <div class="suggestion-content">
                      <div class="suggestion-top-row">
                        <component :is="getSphereIcon(suggestion.sphereId)" :size="16" class="sphere-icon" />
                        <span class="sphere-name">{{ getSphereName(suggestion.sphereId) }}</span>
                      </div>
                      <h5 class="suggestion-title">{{ suggestion.title }}</h5>
                      <p class="suggestion-reason">{{ suggestion.whyUseful }}</p>
                    </div>
                  </div>

                  <!-- Steps toggle button -->
                  <button
                    v-if="suggestion.steps && suggestion.steps.length > 0"
                    class="steps-toggle"
                    @click="toggleStepsExpand(idx)"
                  >
                    <ListChecks :size="14" />
                    <span>{{ suggestion.steps.length }} {{ getStepsWord(suggestion.steps.length) }}</span>
                    <ChevronDown :size="14" :class="{ rotated: expandedGoals.includes(idx) }" />
                  </button>

                  <!-- Steps dropdown -->
                  <Transition name="slide-down">
                    <div
                      v-if="expandedGoals.includes(idx) && suggestion.steps && suggestion.steps.length > 0"
                      class="steps-list"
                    >
                      <div
                        v-for="(stepItem, stepIdx) in suggestion.steps"
                        :key="stepItem.id"
                        class="step-item"
                      >
                        <span class="step-number">{{ stepIdx + 1 }}</span>
                        <span class="step-title">{{ stepItem.title }}</span>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>
          </template>

          <!-- Step: Creating -->
          <template v-else-if="step === 'creating'">
            <div class="creating-section">
              <div class="loading-spinner"></div>
              <h4>Создаем цели и шаги...</h4>
              <p class="creating-progress">{{ creatingProgress }}</p>
            </div>
          </template>

          <!-- Step: Confirmation -->
          <template v-else-if="step === 'confirmation'">
            <div class="confirmation-section">
              <div class="success-icon">
                <CheckCircle :size="48" />
              </div>
              <h4>Цели успешно созданы!</h4>
              <p class="confirmation-text">
                Добавлено {{ createdGoals.length }} {{ getGoalsWord(createdGoals.length) }} с декомпозицией на шаги
              </p>

              <div class="created-goals-list">
                <div v-for="goal in createdGoals" :key="goal.id" class="created-goal-item">
                  <CheckCircle :size="16" class="created-icon" />
                  <span>{{ goal.text }}</span>
                </div>
              </div>
            </div>
          </template>

          <!-- Step: Error -->
          <template v-else-if="step === 'error'">
            <div class="error-section">
              <div class="error-icon">
                <AlertTriangle :size="48" />
              </div>
              <h4>Не удалось подобрать цели</h4>
              <p class="error-text">{{ errorMessage }}</p>
            </div>
          </template>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <template v-if="step === 'intro'">
            <button class="btn btn-primary btn-full" @click="startGeneration">
              <Sparkles :size="18" />
              <span>Подобрать цели</span>
            </button>
          </template>

          <template v-else-if="step === 'selection'">
            <button class="btn btn-secondary" @click="step = 'intro'">
              <ArrowLeft :size="16" />
              <span>Назад</span>
            </button>
            <button
              class="btn btn-primary"
              :disabled="selectedGoals.length === 0"
              @click="confirmSelection"
            >
              <Plus :size="16" />
              <span>Добавить ({{ selectedGoals.length }})</span>
            </button>
          </template>

          <template v-else-if="step === 'confirmation'">
            <button class="btn btn-secondary" @click="closeModal">
              Закрыть
            </button>
            <button class="btn btn-primary" @click="goToPlanning">
              <Calendar :size="16" />
              <span>Запланировать</span>
            </button>
          </template>

          <template v-else-if="step === 'error'">
            <button class="btn btn-primary btn-full" @click="step = 'intro'">
              Попробовать снова
            </button>
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAITasksStore } from '@/stores/aiTasks'
import { updateGoals, updateGoalSteps } from '@/services/api.js'

import {
  Bot,
  X,
  Sparkles,
  Target,
  MessageCircle,
  ListChecks,
  Square,
  CheckSquare,
  ArrowLeft,
  CheckCircle,
  Calendar,
  AlertTriangle,
  ChevronDown,
  Plus,
  Wallet,
  Palette,
  Users,
  Heart,
  Briefcase,
  HeartHandshake,
  Lightbulb
} from 'lucide-vue-next'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'goals-created'])

const router = useRouter()
const appStore = useAppStore()
const aiTasksStore = useAITasksStore()

const modalRef = ref(null)
const step = ref('intro')
const suggestions = ref([])
const selectedGoals = ref([])
const createdGoals = ref([])
const creatingProgress = ref('')
const errorMessage = ref('')
const isMentorActive = ref(false)
const isDecompositionActive = ref(false)
const mentorProgress = ref({ percent: 0, text: '' })
const expandedGoals = ref([])

// Touch handling for swipe-to-close
const touchStartY = ref(0)
const touchCurrentY = ref(0)
const isDragging = ref(false)

function handleTouchStart(e) {
  if (e.target.closest('.suggestions-list') || e.target.closest('.steps-list')) return
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

const categoryFrontendToBackend = {
  wealth: 'welfare',
  hobbies: 'hobby',
  friendship: 'environment',
  health: 'health_sport',
  career: 'work',
  love: 'family'
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

const sphereNames = {
  wealth: 'Благосостояние',
  hobbies: 'Хобби',
  friendship: 'Дружба',
  health: 'Здоровье',
  career: 'Карьера',
  love: 'Любовь'
}

function getSphereIcon(sphereId) {
  return sphereIcons[sphereId] || Lightbulb
}

function getSphereColor(sphereId) {
  return sphereColors[sphereId] || '#6366f1'
}

function getSphereName(sphereId) {
  return sphereNames[sphereId] || sphereId
}

function getGoalsWord(count) {
  if (count === 1) return 'цель'
  if (count >= 2 && count <= 4) return 'цели'
  return 'целей'
}

function getStepsWord(count) {
  if (count === 1) return 'шаг'
  if (count >= 2 && count <= 4) return 'шага'
  return 'шагов'
}

function toggleGoalSelection(idx) {
  const index = selectedGoals.value.indexOf(idx)
  if (index === -1) {
    selectedGoals.value.push(idx)
  } else {
    selectedGoals.value.splice(index, 1)
  }
}

function toggleStepsExpand(idx) {
  const index = expandedGoals.value.indexOf(idx)
  if (index === -1) {
    expandedGoals.value.push(idx)
  } else {
    expandedGoals.value.splice(index, 1)
  }
}

async function startGeneration() {
  step.value = 'loading'
  selectedGoals.value = []
  isMentorActive.value = true
  mentorProgress.value = { percent: 0, text: 'Анализирую ваш профиль...' }

  try {
    const sspData = prepareSSPData()
    const result = await aiTasksStore.startTaskAndWait('goal_mentor_help', { ssp_data: sspData }, 120000)
    handleMentorResult(result)
  } catch (error) {
    console.error('[MentorModal] Generation error:', error)
    errorMessage.value = error.message || 'Произошла ошибка при генерации целей'
    step.value = 'error'
  } finally {
    isMentorActive.value = false
  }
}

watch(() => aiTasksStore.getTaskProgress('goal_mentor_help'), (progress) => {
  if (progress && isMentorActive.value) {
    mentorProgress.value = progress
  }
}, { deep: true })

function handleMentorResult(result) {
  const goals = result.goals || result.suggestions || []

  if (goals.length > 0) {
    const categoryBackendToFrontend = {
      'welfare': 'wealth',
      'hobby': 'hobbies',
      'environment': 'friendship',
      'health_sport': 'health',
      'health': 'health',
      'work': 'career',
      'family': 'love'
    }

    suggestions.value = goals.map((s, idx) => ({
      id: `suggestion-${Date.now()}-${idx}`,
      title: s.title,
      sphereId: s.sphere_id || (s.category ? categoryBackendToFrontend[s.category] || s.category : null),
      whyUseful: s.why_important || s.description || '',
      steps: (s.steps || []).map((step, stepIdx) => ({
        id: `step-${Date.now()}-${idx}-${stepIdx}`,
        title: step.title || step,
        order: stepIdx + 1
      }))
    }))
    step.value = 'selection'
  } else {
    errorMessage.value = 'Не удалось получить рекомендации'
    step.value = 'error'
  }
}

function prepareSSPData() {
  const lifeSpheres = appStore.lifeSpheres || []

  return {
    spheres: lifeSpheres.map(s => ({
      id: s.id,
      score: s.score || 0
    }))
  }
}

async function confirmSelection() {
  step.value = 'creating'
  createdGoals.value = []
  isDecompositionActive.value = true

  const selected = selectedGoals.value.map(idx => suggestions.value[idx])

  if (selected.length === 0) {
    step.value = 'selection'
    isDecompositionActive.value = false
    return
  }

  creatingProgress.value = `Создаем ${selected.length} ${getGoalsWord(selected.length)}...`

  try {
    const goalsData = selected.map(suggestion => ({
      goal_id: null,
      title: suggestion.title,
      category: categoryFrontendToBackend[suggestion.sphereId] || suggestion.sphereId || 'welfare',
      score: 'true',
      status: 'work',
      why_important: suggestion.whyUseful || 'Рекомендовано AI-ментором'
    }))

    console.log('[MentorModal] Sending goals to backend:', goalsData)

    const goalsResult = await updateGoals({ goals_data: goalsData })

    console.log('[MentorModal] Goals API response:', goalsResult)

    if (!goalsResult || goalsResult.status !== 'ok') {
      throw new Error(goalsResult?.message || 'Не удалось создать цели')
    }

    let createdIds = goalsResult.data?.created_goals_ids
    if (!createdIds || createdIds.length === 0) {
      if (goalsResult.data?.goals_data) {
        createdIds = goalsResult.data.goals_data.map(g => g.goal_id).filter(id => id != null)
      }
    }

    if (!createdIds || createdIds.length === 0) {
      throw new Error('Сервер не вернул ID созданных целей')
    }

    console.log('[MentorModal] Goals created with IDs:', createdIds)

    const allStepsData = []
    const createdGoalsInfo = []

    selected.forEach((suggestion, index) => {
      const backendId = createdIds[index]
      if (!backendId) return

      createdGoalsInfo.push({
        backendId,
        title: suggestion.title,
        steps: suggestion.steps || []
      })

      if (suggestion.steps && suggestion.steps.length > 0) {
        suggestion.steps.forEach((stepItem, stepIndex) => {
          allStepsData.push({
            goal_id: backendId,
            step_id: null,
            title: stepItem.title,
            order: stepIndex + 1,
            is_complete: false,
            priority: null,
            time_duration: null,
            dt: null
          })
        })
      }
    })

    if (allStepsData.length > 0) {
      creatingProgress.value = `Создаем ${allStepsData.length} ${getStepsWord(allStepsData.length)}...`

      console.log('[MentorModal] Sending steps to backend:', allStepsData)

      try {
        const stepsResult = await updateGoalSteps({ goals_steps_data: allStepsData })
        console.log('[MentorModal] Steps API response:', stepsResult)

        if (stepsResult.status !== 'ok') {
          console.warn('[MentorModal] Steps creation had issues:', stepsResult)
        }
      } catch (stepsError) {
        console.error('[MentorModal] Error creating steps:', stepsError)
      }
    }

    createdGoals.value = createdGoalsInfo.map(info => ({
      id: info.backendId,
      text: info.title
    }))

    await appStore.loadGoalsFromBackend()

    isDecompositionActive.value = false
    step.value = 'confirmation'
    emit('goals-created', createdGoals.value)

  } catch (error) {
    console.error('[MentorModal] Error in confirmSelection:', error)
    errorMessage.value = error.message || 'Произошла ошибка при создании целей'
    isDecompositionActive.value = false
    step.value = 'error'
  }
}

function goToPlanning() {
  closeModal()
  router.push('/app/planning')
}

function closeModal() {
  if (modalRef.value) {
    modalRef.value.style.transform = ''
  }
  step.value = 'intro'
  suggestions.value = []
  selectedGoals.value = []
  createdGoals.value = []
  expandedGoals.value = []
  isMentorActive.value = false
  isDecompositionActive.value = false
  emit('close')
}

onBeforeUnmount(() => {
  isMentorActive.value = false
  isDecompositionActive.value = false
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

.mentor-modal {
  background: var(--bg-primary, #fff);
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
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
  flex-shrink: 0;
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary, #1f2937);
  text-align: center;
  flex: 1;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  color: var(--text-secondary, #6b7280);
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

/* Intro Section */
.intro-section {
  text-align: center;
}

.intro-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  margin: 0 auto 1.25rem;
  background: linear-gradient(135deg, #10b981, #22c55e);
  border-radius: 50%;
  color: #fff;
}

.intro-section h4 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: var(--text-primary, #1f2937);
}

.intro-description {
  color: var(--text-secondary, #6b7280);
  line-height: 1.6;
  margin-bottom: 1.25rem;
  font-size: 0.9375rem;
}

.intro-features {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  background: var(--bg-secondary, #f3f4f6);
  border-radius: 10px;
  color: var(--text-primary, #1f2937);
  font-size: 0.875rem;
}

.feature-item svg {
  color: #10b981;
  flex-shrink: 0;
}

/* Loading Section */
.loading-section {
  text-align: center;
  padding: 2rem 0;
}

.loading-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin: 0 auto 1.25rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 50%;
  color: #10b981;
}

.loading-icon .pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.loading-section h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem;
  color: var(--text-primary, #1f2937);
}

.progress-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 280px;
  margin: 0 auto 1rem;
}

.progress-bar-track {
  flex: 1;
  height: 6px;
  background: var(--bg-secondary, #e5e7eb);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #22c55e);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-percent {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #10b981;
  min-width: 40px;
}

.loading-hint {
  color: var(--text-tertiary, #9ca3af);
  font-size: 0.8125rem;
  margin: 0;
}

/* Selection Section */
.selection-section {
  display: flex;
  flex-direction: column;
}

.selection-header {
  margin-bottom: 1rem;
}

.selection-header h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  color: var(--text-primary, #1f2937);
}

.selection-hint {
  color: var(--text-secondary, #6b7280);
  font-size: 0.875rem;
  margin: 0;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.suggestion-item {
  display: flex;
  flex-direction: column;
}

.suggestion-card {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-secondary, #f9fafb);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.suggestion-card:hover {
  background: var(--bg-tertiary, #f3f4f6);
}

.suggestion-card.selected {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.suggestion-checkbox {
  flex-shrink: 0;
  color: var(--text-tertiary, #9ca3af);
  margin-top: 2px;
}

.suggestion-card.selected .suggestion-checkbox {
  color: #10b981;
}

.suggestion-content {
  flex: 1;
  min-width: 0;
}

.suggestion-top-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 0.375rem;
}

.suggestion-top-row .sphere-icon {
  color: var(--sphere-color);
}

.sphere-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--sphere-color);
}

.suggestion-title {
  font-size: 0.9375rem;
  font-weight: 600;
  margin: 0 0 0.375rem;
  color: var(--text-primary, #1f2937);
  line-height: 1.3;
}

.suggestion-reason {
  font-size: 0.8125rem;
  color: var(--text-secondary, #6b7280);
  line-height: 1.4;
  margin: 0;
}

.steps-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  align-self: flex-start;
  margin-top: 0.5rem;
  margin-left: 2.75rem;
  padding: 0.375rem 0.625rem;
  background: transparent;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  font-size: 0.75rem;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  transition: all 0.15s;
}

.steps-toggle:hover {
  border-color: #10b981;
  color: #10b981;
}

.steps-toggle svg:last-child {
  transition: transform 0.2s;
}

.steps-toggle svg.rotated {
  transform: rotate(180deg);
}

.steps-list {
  margin-top: 0.5rem;
  margin-left: 2.75rem;
  padding: 0.75rem;
  background: var(--bg-tertiary, #f3f4f6);
  border-radius: 8px;
  border-left: 3px solid #10b981;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.375rem 0;
  font-size: 0.8125rem;
  color: var(--text-secondary, #6b7280);
}

.step-item:not(:last-child) {
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  padding-bottom: 0.5rem;
  margin-bottom: 0.25rem;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  background: #10b981;
  color: #fff;
  font-size: 0.6875rem;
  font-weight: 600;
  border-radius: 50%;
  flex-shrink: 0;
}

.step-title {
  flex: 1;
  line-height: 1.4;
}

/* Creating Section */
.creating-section {
  text-align: center;
  padding: 2rem 0;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--bg-secondary, #e5e7eb);
  border-top-color: #10b981;
  border-radius: 50%;
  margin: 0 auto 1.25rem;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.creating-section h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: var(--text-primary, #1f2937);
}

.creating-progress {
  color: var(--text-secondary, #6b7280);
  font-size: 0.875rem;
  margin: 0;
}

/* Confirmation Section */
.confirmation-section {
  text-align: center;
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  margin: 0 auto 1.25rem;
  background: #dcfce7;
  border-radius: 50%;
  color: #22c55e;
}

.confirmation-section h4 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: var(--text-primary, #1f2937);
}

.confirmation-text {
  color: var(--text-secondary, #6b7280);
  margin-bottom: 1.25rem;
  font-size: 0.9375rem;
}

.created-goals-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
}

.created-goal-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  background: var(--bg-secondary, #f3f4f6);
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--text-primary, #1f2937);
}

.created-icon {
  color: #22c55e;
  flex-shrink: 0;
}

/* Error Section */
.error-section {
  text-align: center;
  padding: 1rem 0;
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  margin: 0 auto 1.25rem;
  background: #fef3c7;
  border-radius: 50%;
  color: #f59e0b;
}

.error-section h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: var(--text-primary, #1f2937);
}

.error-text {
  color: var(--text-secondary, #6b7280);
  font-size: 0.9375rem;
  margin: 0;
}

/* Footer */
.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-secondary, #f9fafb);
  flex-shrink: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  flex: 1;
}

.btn-full {
  width: 100%;
}

.btn-primary {
  background: #10b981;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #059669;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #1f2937);
  border: 1px solid var(--border-color, #e5e7eb);
}

.btn-secondary:hover {
  background: var(--bg-tertiary, #f3f4f6);
}

/* Animations */
.modal-slide-enter-active,
.modal-slide-leave-active {
  transition: opacity 0.25s ease;
}

.modal-slide-enter-active .mentor-modal,
.modal-slide-leave-active .mentor-modal {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}

.modal-slide-enter-from,
.modal-slide-leave-to {
  opacity: 0;
}

.modal-slide-enter-from .mentor-modal {
  transform: translateY(20px) scale(0.98);
  opacity: 0;
}

.modal-slide-leave-to .mentor-modal {
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
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 500px;
}

/* Mobile Styles */
@media (max-width: 480px) {
  .modal-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .mentor-modal {
    max-width: 100%;
    max-height: 95vh;
    border-radius: 20px 20px 0 0;
  }

  .modal-drag-handle {
    display: flex;
  }

  .modal-header {
    padding-top: 0.5rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .intro-icon {
    width: 64px;
    height: 64px;
  }

  .intro-icon svg {
    width: 32px;
    height: 32px;
  }

  .intro-section h4 {
    font-size: 1.125rem;
  }

  .intro-description {
    font-size: 0.875rem;
  }

  .feature-item {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }

  .feature-item svg {
    width: 16px;
    height: 16px;
  }

  .modal-footer {
    padding: 0.875rem 1rem;
  }

  .btn {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
  }

  /* Slide up animation for mobile */
  .modal-slide-enter-from .mentor-modal {
    transform: translateY(100%);
  }

  .modal-slide-leave-to .mentor-modal {
    transform: translateY(100%);
  }
}
</style>
