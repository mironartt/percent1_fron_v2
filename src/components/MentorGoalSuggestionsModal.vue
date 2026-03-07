<template>
  <AiMentorModal
    :show="show"
    :step="step"
    title="Персональный подбор целей"
    subtitle="Персональный подбор целей"
    description="Ментор проанализирует ваши данные из Колеса жизни: оценки сфер, зоны роста и ваши желания. На основе этого подберет 3 цели, которые помогут вам развиваться в приоритетных направлениях."
    :features="introFeatures"
    buttonText="Подобрать цели"
    :loadingText="mentorProgress.text || 'Анализирую ваш профиль...'"
    :loadingPercent="mentorProgress.percent || 0"
    @close="closeModal"
    @start="startGeneration"
  >
    <!-- Selection Step -->
    <template #selection>
      <div class="selection-section">
        <div class="selection-header">
          <h4>Рекомендованные цели</h4>
          <p class="selection-hint">Выберите цели для добавления</p>
        </div>
        <div class="suggestions-list aim-scrollable">
          <div v-for="(suggestion, idx) in suggestions" :key="idx" class="suggestion-item">
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
            <button
              v-if="suggestion.steps && suggestion.steps.length > 0"
              class="steps-toggle"
              @click="toggleStepsExpand(idx)"
            >
              <ListChecks :size="14" />
              <span>{{ suggestion.steps.length }} {{ getStepsWord(suggestion.steps.length) }}</span>
              <ChevronDown :size="14" :class="{ rotated: expandedGoals.includes(idx) }" />
            </button>
            <Transition name="slide-down">
              <div
                v-if="expandedGoals.includes(idx) && suggestion.steps && suggestion.steps.length > 0"
                class="steps-list"
              >
                <div v-for="(stepItem, stepIdx) in suggestion.steps" :key="stepItem.id" class="step-item">
                  <span class="step-number">{{ stepIdx + 1 }}</span>
                  <span class="step-title">{{ stepItem.title }}</span>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </template>

    <!-- Creating Step -->
    <template #creating>
      <div class="creating-section">
        <div class="loading-spinner"></div>
        <h4>Создаем цели и шаги...</h4>
        <p class="creating-progress">{{ creatingProgress }}</p>
      </div>
    </template>

    <!-- Confirmation Step -->
    <template #confirmation>
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

    <!-- Error Step -->
    <template #error>
      <div class="error-section">
        <div class="error-icon">
          <AlertTriangle :size="48" />
        </div>
        <h4>Не удалось подобрать цели</h4>
        <p class="error-text">{{ errorMessage }}</p>
      </div>
    </template>

    <!-- Footer for non-intro steps -->
    <template #footer="{ step: currentStep }">
      <template v-if="currentStep === 'selection'">
        <button class="aim-btn aim-btn-secondary" @click="step = 'intro'">
          <ArrowLeft :size="16" />
          <span>Назад</span>
        </button>
        <button
          class="aim-btn aim-btn-primary"
          :disabled="selectedGoals.length === 0"
          @click="confirmSelection"
        >
          <Plus :size="16" />
          <span>Добавить ({{ selectedGoals.length }})</span>
        </button>
      </template>

      <template v-else-if="currentStep === 'confirmation'">
        <button class="aim-btn aim-btn-secondary" @click="closeModal">
          Закрыть
        </button>
        <button class="aim-btn aim-btn-primary" @click="goToPlanning">
          <Calendar :size="16" />
          <span>Запланировать</span>
        </button>
      </template>

      <template v-else-if="currentStep === 'error'">
        <button class="aim-btn aim-btn-primary aim-btn-full" @click="step = 'intro'">
          Попробовать снова
        </button>
      </template>
    </template>
  </AiMentorModal>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAITasksStore } from '@/stores/aiTasks'
import { updateGoals, updateGoalSteps } from '@/services/api.js'
import AiMentorModal from '@/components/AiMentorModal.vue'

import {
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
  show: { type: Boolean, default: false }
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

const introFeatures = [
  { icon: markRaw(Target), text: 'Цели на основе ваших зон роста' },
  { icon: markRaw(MessageCircle), text: 'Объяснение пользы каждой цели' },
  { icon: markRaw(ListChecks), text: 'Автоматическая декомпозиция на шаги' }
]

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

function getSphereIcon(sphereId) { return sphereIcons[sphereId] || Lightbulb }
function getSphereColor(sphereId) { return sphereColors[sphereId] || '#6366f1' }
function getSphereName(sphereId) { return sphereNames[sphereId] || sphereId }

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
  if (index === -1) selectedGoals.value.push(idx)
  else selectedGoals.value.splice(index, 1)
}

function toggleStepsExpand(idx) {
  const index = expandedGoals.value.indexOf(idx)
  if (index === -1) expandedGoals.value.push(idx)
  else expandedGoals.value.splice(index, 1)
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
      'welfare': 'wealth', 'hobby': 'hobbies', 'environment': 'friendship',
      'health_sport': 'health', 'health': 'health', 'work': 'career', 'family': 'love'
    }
    suggestions.value = goals.map((s, idx) => ({
      id: `suggestion-${Date.now()}-${idx}`,
      title: s.title,
      sphereId: s.sphere_id || (s.category ? categoryBackendToFrontend[s.category] || s.category : null),
      whyUseful: s.why_important || s.description || '',
      steps: (s.steps || []).map((st, si) => ({
        id: `step-${Date.now()}-${idx}-${si}`,
        title: st.title || st,
        order: si + 1
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
  return { spheres: lifeSpheres.map(s => ({ id: s.id, score: s.score || 0 })) }
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

    const goalsResult = await updateGoals({ goals_data: goalsData })

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

    const allStepsData = []
    const createdGoalsInfo = []

    selected.forEach((suggestion, index) => {
      const backendId = createdIds[index]
      if (!backendId) return
      createdGoalsInfo.push({ backendId, title: suggestion.title, steps: suggestion.steps || [] })
      if (suggestion.steps && suggestion.steps.length > 0) {
        suggestion.steps.forEach((stepItem, stepIndex) => {
          allStepsData.push({
            goal_id: backendId, step_id: null, title: stepItem.title,
            order: stepIndex + 1, is_complete: false, priority: null, time_duration: null, dt: null
          })
        })
      }
    })

    if (allStepsData.length > 0) {
      creatingProgress.value = `Создаем ${allStepsData.length} ${getStepsWord(allStepsData.length)}...`
      try {
        await updateGoalSteps({ goals_steps_data: allStepsData })
      } catch (stepsError) {
        console.error('[MentorModal] Error creating steps:', stepsError)
      }
    }

    createdGoals.value = createdGoalsInfo.map(info => ({ id: info.backendId, text: info.title }))
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
/* Selection */
.selection-section { display: flex; flex-direction: column; }
.selection-header { margin-bottom: 1rem; }
.selection-header h4 { font-size: 1.125rem; font-weight: 600; margin: 0 0 0.25rem; color: var(--text-primary, #1f2937); }
.selection-hint { color: var(--text-secondary, #6b7280); font-size: 0.875rem; margin: 0; }

.suggestions-list { display: flex; flex-direction: column; gap: 0.75rem; }
.suggestion-item { display: flex; flex-direction: column; }

.suggestion-card {
  display: flex; gap: 0.75rem; padding: 1rem;
  background: var(--bg-secondary, #f9fafb); border: 2px solid transparent;
  border-radius: 12px; cursor: pointer; transition: all 0.15s;
}
.suggestion-card:hover { background: var(--bg-tertiary, #f3f4f6); }
.suggestion-card.selected { border-color: #10b981; background: rgba(16, 185, 129, 0.05); }

.suggestion-checkbox { flex-shrink: 0; color: var(--text-tertiary, #9ca3af); margin-top: 2px; }
.suggestion-card.selected .suggestion-checkbox { color: #10b981; }

.suggestion-content { flex: 1; min-width: 0; }
.suggestion-top-row { display: flex; align-items: center; gap: 0.375rem; margin-bottom: 0.375rem; }
.suggestion-top-row .sphere-icon { color: var(--sphere-color); }
.sphere-name { font-size: 0.75rem; font-weight: 500; color: var(--sphere-color); }
.suggestion-title { font-size: 0.9375rem; font-weight: 600; margin: 0 0 0.375rem; color: var(--text-primary, #1f2937); line-height: 1.3; }
.suggestion-reason { font-size: 0.8125rem; color: var(--text-secondary, #6b7280); line-height: 1.4; margin: 0; }

.steps-toggle {
  display: inline-flex; align-items: center; gap: 0.375rem;
  align-self: flex-start; margin-top: 0.5rem; margin-left: 2.75rem;
  padding: 0.375rem 0.625rem; background: transparent;
  border: 1px solid var(--border-color, #e5e7eb); border-radius: 6px;
  font-size: 0.75rem; color: var(--text-secondary, #6b7280); cursor: pointer; transition: all 0.15s;
}
.steps-toggle:hover { border-color: #10b981; color: #10b981; }
.steps-toggle svg:last-child { transition: transform 0.2s; }
.steps-toggle svg.rotated { transform: rotate(180deg); }

.steps-list { margin-top: 0.5rem; margin-left: 2.75rem; padding: 0.75rem; background: var(--bg-tertiary, #f3f4f6); border-radius: 8px; border-left: 3px solid #10b981; }
.step-item { display: flex; align-items: flex-start; gap: 0.5rem; padding: 0.375rem 0; font-size: 0.8125rem; color: var(--text-secondary, #6b7280); }
.step-item:not(:last-child) { border-bottom: 1px solid var(--border-color, #e5e7eb); padding-bottom: 0.5rem; margin-bottom: 0.25rem; }
.step-number { display: flex; align-items: center; justify-content: center; min-width: 1.25rem; height: 1.25rem; background: #10b981; color: #fff; font-size: 0.6875rem; font-weight: 600; border-radius: 50%; flex-shrink: 0; }
.step-title { flex: 1; line-height: 1.4; }

/* Creating */
.creating-section { text-align: center; padding: 2rem 0; }
.loading-spinner { width: 48px; height: 48px; border: 3px solid var(--bg-secondary, #e5e7eb); border-top-color: #10b981; border-radius: 50%; margin: 0 auto 1.25rem; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.creating-section h4 { font-size: 1rem; font-weight: 600; margin: 0 0 0.5rem; color: var(--text-primary, #1f2937); }
.creating-progress { color: var(--text-secondary, #6b7280); font-size: 0.875rem; margin: 0; }

/* Confirmation */
.confirmation-section { text-align: center; }
.success-icon { display: flex; align-items: center; justify-content: center; width: 72px; height: 72px; margin: 0 auto 1.25rem; background: #dcfce7; border-radius: 50%; color: #22c55e; }
.confirmation-section h4 { font-size: 1.25rem; font-weight: 600; margin: 0 0 0.5rem; color: var(--text-primary, #1f2937); }
.confirmation-text { color: var(--text-secondary, #6b7280); margin-bottom: 1.25rem; font-size: 0.9375rem; }
.created-goals-list { display: flex; flex-direction: column; gap: 0.5rem; text-align: left; }
.created-goal-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem 0.875rem; background: var(--bg-secondary, #f3f4f6); border-radius: 8px; font-size: 0.875rem; color: var(--text-primary, #1f2937); }
.created-icon { color: #22c55e; flex-shrink: 0; }

/* Error */
.error-section { text-align: center; padding: 1rem 0; }
.error-icon { display: flex; align-items: center; justify-content: center; width: 72px; height: 72px; margin: 0 auto 1.25rem; background: #fef3c7; border-radius: 50%; color: #f59e0b; }
.error-section h4 { font-size: 1.125rem; font-weight: 600; margin: 0 0 0.5rem; color: var(--text-primary, #1f2937); }
.error-text { color: var(--text-secondary, #6b7280); font-size: 0.9375rem; margin: 0; }

/* Shared button styles (inherit from AiMentorModal) */
.aim-btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 0.5rem; padding: 0.75rem 1.25rem; font-size: 0.9375rem;
  font-weight: 500; border-radius: 10px; border: none; cursor: pointer;
  transition: all 0.15s; flex: 1; font-family: inherit;
}
.aim-btn-full { width: 100%; }
.aim-btn-primary { background: var(--success-color, #10b981); color: #fff; }
.aim-btn-primary:hover:not(:disabled) { background: #059669; }
.aim-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.aim-btn-secondary { background: var(--bg-primary, #fff); color: var(--text-primary, #1f2937); border: 1px solid var(--border-color, #e5e7eb); }
.aim-btn-secondary:hover { background: var(--bg-tertiary, #f3f4f6); }

/* Animations */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; overflow: hidden; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; max-height: 0; }
.slide-down-enter-to, .slide-down-leave-from { opacity: 1; max-height: 500px; }
</style>
