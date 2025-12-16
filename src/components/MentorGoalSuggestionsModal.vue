<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="closeModal">
      <div class="mentor-modal">
        <div class="modal-header">
          <h3>
            <Bot :size="20" class="modal-header-icon" />
            Помощь от ментора
          </h3>
          <button class="modal-close" @click="closeModal">
            <X :size="20" />
          </button>
        </div>

        <div class="modal-body">
          <template v-if="step === 'intro'">
            <div class="intro-section">
              <div class="intro-icon">
                <Sparkles :size="48" />
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
              <button class="btn btn-primary btn-lg" @click="startGeneration">
                <Sparkles :size="18" />
                Подобрать цели
              </button>
            </div>
          </template>

          <template v-else-if="step === 'loading'">
            <div class="loading-section">
              <div class="loading-spinner-large"></div>
              <h4>Ментор анализирует ваш профиль...</h4>
              <p class="loading-hint">Это займет несколько секунд</p>
            </div>
          </template>

          <template v-else-if="step === 'selection'">
            <div class="selection-section">
              <h4>Рекомендованные цели</h4>
              <p class="selection-hint">Выберите цели, которые хотите добавить</p>
              
              <div class="suggestions-list">
                <div 
                  v-for="(suggestion, idx) in suggestions" 
                  :key="idx"
                  class="suggestion-wrapper"
                >
                  <div 
                    class="suggestion-card"
                    :class="{ selected: selectedGoals.includes(idx) }"
                    @click="toggleGoalSelection(idx)"
                  >
                    <div class="suggestion-checkbox">
                      <CheckSquare v-if="selectedGoals.includes(idx)" :size="20" />
                      <Square v-else :size="20" />
                    </div>
                    <div class="suggestion-content">
                      <div class="suggestion-header">
                        <span class="sphere-badge" :style="{ background: getSphereColor(suggestion.sphereId) }">
                          {{ getSphereName(suggestion.sphereId) }}
                        </span>
                      </div>
                      <h5 class="suggestion-title">{{ suggestion.title }}</h5>
                      <p class="suggestion-reason">
                        <Bot :size="14" />
                        {{ suggestion.whyUseful }}
                      </p>
                      
                      <button 
                        v-if="suggestion.steps && suggestion.steps.length > 0"
                        class="steps-toggle-btn"
                        @click.stop="toggleStepsExpand(idx)"
                      >
                        <ListChecks :size="14" />
                        <span>{{ suggestion.steps.length }} {{ getStepsWord(suggestion.steps.length) }}</span>
                        <ChevronUp v-if="expandedGoals.includes(idx)" :size="14" />
                        <ChevronDown v-else :size="14" />
                      </button>
                    </div>
                  </div>
                  
                  <Transition name="steps-expand">
                    <div 
                      v-if="expandedGoals.includes(idx) && suggestion.steps && suggestion.steps.length > 0"
                      class="steps-dropdown"
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

              <div class="selection-actions">
                <button class="btn btn-secondary" @click="step = 'intro'">
                  <ArrowLeft :size="16" />
                  Назад
                </button>
                <button 
                  class="btn btn-primary" 
                  :disabled="selectedGoals.length === 0"
                  @click="confirmSelection"
                >
                  Добавить выбранные ({{ selectedGoals.length }})
                </button>
              </div>
            </div>
          </template>

          <template v-else-if="step === 'creating'">
            <div class="creating-section">
              <div class="loading-spinner-large"></div>
              <h4>Создаем цели и шаги...</h4>
              <p class="creating-progress">{{ creatingProgress }}</p>
            </div>
          </template>

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

              <div class="confirmation-actions">
                <button class="btn btn-secondary" @click="closeModal">
                  Закрыть
                </button>
                <button class="btn btn-primary" @click="goToPlanning">
                  <Calendar :size="16" />
                  Запланировать сейчас
                </button>
              </div>
            </div>
          </template>

          <template v-else-if="step === 'error'">
            <div class="error-section">
              <div class="error-icon">
                <AlertTriangle :size="48" />
              </div>
              <h4>Не удалось подобрать цели</h4>
              <p class="error-text">{{ errorMessage }}</p>
              <button class="btn btn-primary" @click="step = 'intro'">
                Попробовать снова
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, onMounted } from 'vue'
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
  ChevronUp
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

const categoryFrontendToBackend = {
  wealth: 'welfare',
  hobbies: 'hobby',
  friendship: 'environment',
  health: 'health_sport',
  career: 'work',
  love: 'family'
}

function toggleStepsExpand(idx) {
  const index = expandedGoals.value.indexOf(idx)
  if (index === -1) {
    expandedGoals.value.push(idx)
  } else {
    expandedGoals.value.splice(index, 1)
  }
}

const sphereColors = {
  wealth: '#f59e0b',
  hobbies: '#ec4899',
  friendship: '#8b5cf6',
  health: '#10b981',
  career: '#3b82f6',
  love: '#ef4444'
}

const sphereNames = {
  wealth: 'Благосостояние',
  hobbies: 'Хобби и отдых',
  friendship: 'Дружба и окружение',
  health: 'Здоровье и спорт',
  career: 'Работа и карьера',
  love: 'Любовь, семья'
}

function getSphereColor(sphereId) {
  return sphereColors[sphereId] || '#10b981'
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
    isMentorActive.value = false
  }
}

watch(() => aiTasksStore.getTaskProgress('goal_mentor_help'), (progress) => {
  if (progress && isMentorActive.value) {
    mentorProgress.value = progress
  }
}, { deep: true })

function handleMentorResult(result) {
  isMentorActive.value = false
  
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.mentor-modal {
  background: var(--bg-primary, #fff);
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
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
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary, #1f2937);
}

.modal-header-icon {
  color: #10b981;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-secondary, #6b7280);
  transition: all 0.2s;
}

.modal-close:hover {
  background: var(--bg-secondary, #f3f4f6);
  color: var(--text-primary, #1f2937);
}

.modal-body {
  padding: 1.5rem;
}

.intro-section {
  text-align: center;
}

.intro-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
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
  margin-bottom: 1.5rem;
}

.intro-features {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary, #f3f4f6);
  border-radius: 10px;
  color: var(--text-primary, #1f2937);
  font-size: 0.9rem;
}

.feature-item svg {
  color: #10b981;
  flex-shrink: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
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
  background: var(--bg-secondary, #f3f4f6);
  color: var(--text-primary, #1f2937);
}

.btn-secondary:hover {
  background: var(--bg-tertiary, #e5e7eb);
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1rem;
  width: 100%;
}

.loading-section,
.creating-section {
  text-align: center;
  padding: 2rem 0;
}

.loading-spinner-large {
  width: 48px;
  height: 48px;
  border: 3px solid var(--bg-secondary, #f3f4f6);
  border-top-color: #10b981;
  border-radius: 50%;
  margin: 0 auto 1.5rem;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-section h4,
.creating-section h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: var(--text-primary, #1f2937);
}

.loading-hint,
.creating-progress {
  color: var(--text-secondary, #6b7280);
  font-size: 0.9rem;
}

.selection-section h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  color: var(--text-primary, #1f2937);
}

.selection-hint {
  color: var(--text-secondary, #6b7280);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.suggestion-card {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-secondary, #f3f4f6);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-card:hover {
  background: var(--bg-tertiary, #e5e7eb);
}

.suggestion-card.selected {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.suggestion-checkbox {
  flex-shrink: 0;
  color: var(--text-secondary, #6b7280);
}

.suggestion-card.selected .suggestion-checkbox {
  color: #10b981;
}

.suggestion-content {
  flex: 1;
  min-width: 0;
}

.suggestion-header {
  margin-bottom: 0.5rem;
}

.sphere-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #fff;
  border-radius: 4px;
}

.suggestion-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: var(--text-primary, #1f2937);
}

.suggestion-reason {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary, #6b7280);
  line-height: 1.5;
  margin: 0;
}

.suggestion-reason svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: #10b981;
}

.suggestion-wrapper {
  display: flex;
  flex-direction: column;
}

.steps-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.75rem;
  padding: 0.4rem 0.6rem;
  background: var(--bg-tertiary, #e5e7eb);
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  transition: all 0.2s;
}

.steps-toggle-btn:hover {
  background: var(--bg-quaternary, #d1d5db);
  color: var(--text-primary, #1f2937);
}

.steps-toggle-btn svg {
  flex-shrink: 0;
}

.steps-dropdown {
  margin-left: 2rem;
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-tertiary, #f9fafb);
  border-radius: 8px;
  border-left: 3px solid #10b981;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.4rem 0;
  font-size: 0.85rem;
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
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 50%;
  flex-shrink: 0;
}

.step-title {
  flex: 1;
  line-height: 1.4;
}

.steps-expand-enter-active,
.steps-expand-leave-active {
  transition: all 0.2s ease;
}

.steps-expand-enter-from,
.steps-expand-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
  padding: 0;
  overflow: hidden;
}

.steps-expand-enter-to,
.steps-expand-leave-from {
  opacity: 1;
  max-height: 500px;
}

.selection-actions {
  display: flex;
  gap: 0.75rem;
}

.selection-actions .btn {
  flex: 1;
}

.confirmation-section {
  text-align: center;
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
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
  margin-bottom: 1.5rem;
}

.created-goals-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.created-goal-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary, #f3f4f6);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--text-primary, #1f2937);
}

.created-icon {
  color: #22c55e;
  flex-shrink: 0;
}

.confirmation-actions {
  display: flex;
  gap: 0.75rem;
}

.confirmation-actions .btn {
  flex: 1;
}

.error-section {
  text-align: center;
  padding: 1rem 0;
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: #fef3c7;
  border-radius: 50%;
  color: #f59e0b;
}

.error-section h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: var(--text-primary, #1f2937);
}

.error-text {
  color: var(--text-secondary, #6b7280);
  margin-bottom: 1.5rem;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 480px) {
  .mentor-modal {
    max-height: 95vh;
    border-radius: 16px 16px 0 0;
    margin-top: auto;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .selection-actions,
  .confirmation-actions {
    flex-direction: column;
  }
}
</style>
