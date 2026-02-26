<template>
  <div class="interview-container">
    <!-- Idle: Start Screen -->
    <div v-if="phase === 'idle'" class="phase-idle">
      <div class="idle-card">
        <div class="idle-icon">
          <ClipboardList :size="48" :stroke-width="1.2" />
        </div>
        <h1 class="idle-title">Персональное интервью</h1>
        <p class="idle-desc">
          Я задам несколько вопросов, чтобы понять твои сильные стороны и подобрать рекомендации именно под тебя.
        </p>
        <div class="idle-badge">
          <Clock :size="14" />
          ~5 минут
        </div>
        <div class="idle-actions">
          <button class="btn btn-primary btn-lg" @click="handleStart" :disabled="starting">
            <Loader2 v-if="starting" :size="18" class="spin" />
            <Play v-else :size="18" />
            {{ existingSession ? 'Продолжить' : 'Начать' }}
          </button>
          <button class="btn btn-ghost" @click="handleSkip">
            Пропустить
          </button>
        </div>
      </div>
    </div>

    <!-- Loading: AI selecting questions -->
    <div v-else-if="phase === 'loading'" class="phase-loading">
      <div class="loading-card">
        <div class="loading-icon">
          <Bot :size="40" :stroke-width="1.2" />
        </div>
        <h2>{{ pendingTaskType === 'summary' ? 'Анализирую ответы...' : 'Подбираю вопросы...' }}</h2>
        <div class="progress-bar-container">
          <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <p class="progress-text">{{ progressText || 'Это займёт несколько секунд' }}</p>
      </div>
    </div>

    <!-- Questions: One question at a time -->
    <div v-else-if="phase === 'questions'" class="phase-questions">
      <div class="questions-header">
        <div class="iteration-badge">
          Вопрос {{ currentQuestionIndex + 1 }} из {{ questions.length }}
        </div>
        <div class="iteration-progress">
          <div class="iteration-bar" :style="{ width: questionProgressPercent + '%' }"></div>
        </div>
      </div>

      <div v-if="currentQuestion" class="question-card">
        <h2 class="question-text">{{ currentQuestion.text }}</h2>

        <div class="options-list">
          <button
            v-for="option in currentQuestion.options"
            :key="option.id"
            class="option-btn"
            :class="{ selected: selectedOptionId === option.id }"
            @click="selectOption(option.id)"
          >
            <span class="option-radio">
              <span v-if="selectedOptionId === option.id" class="option-radio-inner"></span>
            </span>
            {{ option.text }}
          </button>
        </div>

        <div class="free-text-section">
          <label class="free-text-label">Комментарий (необязательно)</label>
          <textarea
            v-model="freeText"
            class="free-text-input"
            placeholder="Расскажи подробнее..."
            rows="3"
            maxlength="5000"
          ></textarea>
        </div>

        <div class="question-actions">
          <button
            class="btn btn-primary"
            :disabled="!canSubmitQuestion"
            @click="nextQuestion"
          >
            {{ isLastQuestion ? 'Завершить' : 'Далее' }}
            <ArrowRight :size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- Submitting: Sending answers -->
    <div v-else-if="phase === 'submitting'" class="phase-loading">
      <div class="loading-card">
        <Loader2 :size="40" class="spin" style="color: var(--primary-color)" />
        <h2>Отправляю ответы...</h2>
      </div>
    </div>

    <!-- Analyzing: AI generating summary -->
    <div v-else-if="phase === 'analyzing'" class="phase-loading">
      <div class="loading-card">
        <div class="loading-icon">
          <Sparkles :size="40" :stroke-width="1.2" />
        </div>
        <h2>Анализирую результаты...</h2>
        <div class="progress-bar-container">
          <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <p class="progress-text">{{ progressText || 'Составляю персональный профиль' }}</p>
      </div>
    </div>

    <!-- Results -->
    <div v-else-if="phase === 'results'" class="phase-results">
      <!-- Mentor message -->
      <div v-if="aiInsights?.mentor_message" class="result-card mentor-card">
        <div class="mentor-avatar">
          <Bot :size="24" :stroke-width="1.5" />
        </div>
        <div class="mentor-text">{{ aiInsights.mentor_message }}</div>
      </div>

      <!-- Personality Profile -->
      <div v-if="aiInsights?.personality_profile" class="result-card">
        <h3><User :size="18" /> Твой профиль</h3>
        <p>{{ aiInsights.personality_profile.summary }}</p>
        <div v-if="aiInsights.personality_profile.key_traits?.length" class="traits-list">
          <span v-for="trait in aiInsights.personality_profile.key_traits" :key="trait" class="trait-badge">
            {{ trait }}
          </span>
        </div>
      </div>

      <!-- Strengths -->
      <div v-if="aiInsights?.strengths?.length" class="result-card">
        <h3><TrendingUp :size="18" /> Сильные стороны</h3>
        <ul class="insights-list">
          <li v-for="s in aiInsights.strengths" :key="s.text || s">
            <span class="insight-category" v-if="s.category" :style="{ color: getSphereColor(s.category) }">
              {{ getSphereLabel(s.category) }}
            </span>
            {{ s.text || s }}
          </li>
        </ul>
      </div>

      <!-- Growth Areas -->
      <div v-if="aiInsights?.growth_areas?.length" class="result-card">
        <h3><Target :size="18" /> Зоны роста</h3>
        <ul class="insights-list">
          <li v-for="g in aiInsights.growth_areas" :key="g.text || g" :class="{ 'high-priority': g.priority === 'high' }">
            <span class="insight-category" v-if="g.category" :style="{ color: getSphereColor(g.category) }">
              {{ getSphereLabel(g.category) }}
            </span>
            {{ g.text || g }}
            <span v-if="g.priority === 'high'" class="priority-badge">Приоритет</span>
          </li>
        </ul>
      </div>

      <!-- Recommended Focus -->
      <div v-if="aiInsights?.recommended_focus?.length" class="result-card">
        <h3><Compass :size="18" /> Фокус</h3>
        <ol class="focus-list">
          <li v-for="(focus, i) in aiInsights.recommended_focus" :key="i">{{ focus }}</li>
        </ol>
      </div>

      <!-- Recommended Goals -->
      <div v-if="recommendedGoals.length && !goalsCreated" class="result-card goals-card">
        <h3><Flag :size="18" /> Рекомендованные цели</h3>
        <div v-for="(goal, index) in recommendedGoals" :key="index" class="goal-checkbox">
          <label class="goal-label">
            <input type="checkbox" v-model="selectedGoalIndexes" :value="index" />
            <span class="goal-info">
              <span class="goal-title">{{ goal.title }}</span>
              <span v-if="goal.category" class="goal-sphere" :style="{ color: getSphereColor(goal.category) }">
                {{ getSphereLabel(goal.category) }}
              </span>
            </span>
          </label>
        </div>
        <button
          class="btn btn-primary"
          :disabled="selectedGoalIndexes.length === 0 || creatingGoals"
          @click="handleCreateGoals"
        >
          <Loader2 v-if="creatingGoals" :size="16" class="spin" />
          Создать {{ selectedGoalIndexes.length }} {{ pluralizeGoals(selectedGoalIndexes.length) }}
        </button>
      </div>

      <!-- Goals Created Success -->
      <div v-if="goalsCreated" class="result-card success-card">
        <CheckCircle :size="32" style="color: var(--success-color)" />
        <p>Создано {{ createdGoalsCount }} {{ pluralizeGoals(createdGoalsCount) }}{{ createdStepsCount ? ` и ${createdStepsCount} шагов` : '' }}</p>
      </div>

      <!-- Fallback: simple summary if no ai_insights but has ai_summary -->
      <div v-if="!aiInsights && aiSummary" class="result-card mentor-card">
        <div class="mentor-avatar">
          <Bot :size="24" :stroke-width="1.5" />
        </div>
        <div class="mentor-text">{{ aiSummary }}</div>
      </div>

      <!-- Action buttons -->
      <div class="results-actions">
        <button class="btn btn-primary" @click="handleFinish">
          {{ goalsCreated ? 'Перейти к целям' : 'Готово' }}
        </button>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="phase === 'error'" class="phase-error">
      <div class="error-card">
        <AlertCircle :size="40" style="color: var(--danger-color)" />
        <h2>Что-то пошло не так</h2>
        <p>{{ errorMessage }}</p>
        <button class="btn btn-primary" @click="handleRetry">
          <RefreshCcw :size="16" />
          Попробовать снова
        </button>
        <button class="btn btn-ghost" @click="handleSkip">Вернуться назад</button>
      </div>
    </div>

    <!-- Upgrade Modal -->
    <UpgradeModal v-if="showUpgradeModal" @close="showUpgradeModal = false; handleSkip()" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app.js'
import { useAITasksStore } from '@/stores/aiTasks.js'
import { useToastStore } from '@/stores/toast.js'
import {
  startInterviewSession,
  getInterviewSession,
  getInterviewIteration,
  submitInterviewIteration,
  createInterviewGoals
} from '@/services/api.js'
import UpgradeModal from '@/components/UpgradeModal.vue'
import {
  ClipboardList, Clock, Play, Bot, Loader2, Sparkles,
  ArrowRight, User, TrendingUp, Target, Compass, Flag,
  CheckCircle, AlertCircle, RefreshCcw
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useAppStore()
const aiTasksStore = useAITasksStore()
const toastStore = useToastStore()

// Phase management
const phase = ref('idle') // idle | loading | questions | submitting | analyzing | results | error

// Session state
const sessionId = ref(null)
const existingSession = ref(null)
const starting = ref(false)

// Questions state
const questions = ref([])
const currentQuestionIndex = ref(0)
const selectedOptionId = ref(null)
const freeText = ref('')
const answersCollected = ref([])

// WebSocket tracking
const pendingTaskId = ref(null)
const pendingTaskType = ref(null) // 'questions' | 'summary'
const progressPercent = ref(0)
const progressText = ref('')

// Results state
const aiInsights = ref(null)
const aiSummary = ref(null)
const recommendedGoals = ref([])
const selectedGoalIndexes = ref([])
const goalsCreated = ref(false)
const creatingGoals = ref(false)
const createdGoalsCount = ref(0)
const createdStepsCount = ref(0)

// Error state
const errorMessage = ref('')
const showUpgradeModal = ref(false)

// Source tracking
const source = computed(() => route.query.source || 'chat')

// Question computeds
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || null)
const isLastQuestion = computed(() => currentQuestionIndex.value === questions.value.length - 1)
const canSubmitQuestion = computed(() => selectedOptionId.value !== null || freeText.value.trim().length > 0)
const questionProgressPercent = computed(() => {
  if (questions.value.length === 0) return 0
  return ((currentQuestionIndex.value + 1) / questions.value.length) * 100
})

// Sphere helpers
const sphereColors = {
  welfare: '#e63946', wealth: '#e63946',
  hobby: '#f4a261', hobbies: '#f4a261',
  environment: '#e9c46a', friendship: '#e9c46a',
  health_sport: '#2a9d8f', health: '#2a9d8f',
  work: '#264653', career: '#264653',
  family: '#9b5de5', love: '#9b5de5'
}
const sphereLabels = {
  welfare: 'Финансы', wealth: 'Финансы',
  hobby: 'Хобби', hobbies: 'Хобби',
  environment: 'Окружение', friendship: 'Окружение',
  health_sport: 'Здоровье', health: 'Здоровье',
  work: 'Карьера', career: 'Карьера',
  family: 'Отношения', love: 'Отношения'
}

function getSphereColor(id) { return sphereColors[id] || 'var(--text-secondary)' }
function getSphereLabel(id) { return sphereLabels[id] || id }

function pluralizeGoals(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'цель'
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'цели'
  return 'целей'
}

// ===== Actions =====

async function handleStart() {
  starting.value = true

  try {
    // If we have an existing in_progress session, restore it
    if (existingSession.value && existingSession.value.status === 'in_progress') {
      sessionId.value = existingSession.value.session_id
      await restoreSession(existingSession.value)
      return
    }

    // Start new session
    const result = await startInterviewSession()

    if (result.status === 'error') {
      if (result.error_code === 'interview_no_ai_access') {
        showUpgradeModal.value = true
        starting.value = false
        return
      }
      if (result.error_code === 'interview_session_already_active') {
        // Auto-restore existing session
        sessionId.value = result.data?.session_id
        await loadSession()
        return
      }
      throw new Error(result.error_message || 'Ошибка запуска')
    }

    sessionId.value = result.data.session_id
    pendingTaskId.value = result.data.task_id
    pendingTaskType.value = 'questions'
    phase.value = 'loading'
  } catch (e) {
    errorMessage.value = e.message
    phase.value = 'error'
  } finally {
    starting.value = false
  }
}

async function loadSession() {
  try {
    const result = await getInterviewSession(sessionId.value)
    if (result.status === 'ok' && result.data) {
      await restoreSession(result.data)
    } else {
      phase.value = 'idle'
    }
  } catch (e) {
    errorMessage.value = e.message
    phase.value = 'error'
  }
}

async function restoreSession(sessionData) {
  sessionId.value = sessionData.session_id

  if (sessionData.status === 'completed') {
    aiInsights.value = sessionData.ai_insights || null
    aiSummary.value = sessionData.ai_summary || null
    if (aiInsights.value?.recommended_goals) {
      recommendedGoals.value = aiInsights.value.recommended_goals
      selectedGoalIndexes.value = recommendedGoals.value.map((_, i) => i)
    }
    phase.value = 'results'
    starting.value = false
    return
  }

  if (sessionData.status === 'analyzing') {
    pendingTaskType.value = 'summary'
    pendingTaskId.value = sessionData.summary_task_id || null
    phase.value = 'analyzing'
    starting.value = false
    return
  }

  // in_progress — load current iteration
  try {
    const iterResult = await getInterviewIteration(sessionId.value)
    if (iterResult.status === 'ok' && iterResult.data) {
      const iter = iterResult.data

      if (iter.status === 'waiting_answers') {
        questions.value = iter.questions || []
        currentQuestionIndex.value = 0
        selectedOptionId.value = null
        freeText.value = ''
        answersCollected.value = []
        phase.value = 'questions'
      } else if (iter.status === 'selecting') {
        pendingTaskId.value = iter.task_id || null
        pendingTaskType.value = 'questions'
        phase.value = 'loading'
      } else {
        phase.value = 'idle'
      }
    } else {
      phase.value = 'idle'
    }
  } catch (e) {
    errorMessage.value = e.message
    phase.value = 'error'
  } finally {
    starting.value = false
  }
}

function selectOption(optionId) {
  selectedOptionId.value = optionId
}

async function nextQuestion() {
  if (!canSubmitQuestion.value) return

  // Collect answer
  answersCollected.value.push({
    question_id: currentQuestion.value.id,
    selected_option_id: selectedOptionId.value,
    free_text: freeText.value.trim() || null
  })

  if (!isLastQuestion.value) {
    // Move to next question
    currentQuestionIndex.value++
    selectedOptionId.value = null
    freeText.value = ''
    return
  }

  // Last question — submit iteration
  phase.value = 'submitting'

  try {
    const result = await submitInterviewIteration(sessionId.value, answersCollected.value)

    if (result.status === 'error') {
      if (result.error_code === 'interview_deep_missing_answers') {
        toastStore.warning('Пожалуйста, ответьте на все вопросы')
        phase.value = 'questions'
        return
      }
      throw new Error(result.error_message || 'Ошибка отправки')
    }

    const data = result.data

    if (data.session_completed && data.analyzing) {
      // Session complete, analyzing
      pendingTaskType.value = 'summary'
      pendingTaskId.value = data.summary_task_id || null
      phase.value = 'analyzing'
    } else if (data.session_completed) {
      // Session complete, results ready
      await loadSession()
    } else {
      // More iterations — wait for next questions
      pendingTaskType.value = 'questions'
      pendingTaskId.value = data.task_id || null
      answersCollected.value = []
      phase.value = 'loading'
    }
  } catch (e) {
    errorMessage.value = e.message
    phase.value = 'error'
  }
}

async function handleCreateGoals() {
  if (creatingGoals.value || selectedGoalIndexes.value.length === 0) return
  creatingGoals.value = true

  try {
    const result = await createInterviewGoals(sessionId.value, selectedGoalIndexes.value)

    if (result.status === 'error') {
      if (result.error_code === 'interview_goals_already_created') {
        toastStore.info('Цели уже были созданы')
        goalsCreated.value = true
        return
      }
      throw new Error(result.error_message || 'Ошибка создания целей')
    }

    createdGoalsCount.value = result.data?.goals_created || selectedGoalIndexes.value.length
    createdStepsCount.value = result.data?.steps_created || 0
    goalsCreated.value = true

    // Refresh goals and SSP data in store
    await store.loadGoalsFromBackend()
    await store.loadSSPFromBackend()
  } catch (e) {
    toastStore.error(e.message)
  } finally {
    creatingGoals.value = false
  }
}

function handleFinish() {
  // Mark interview as completed
  store.markInterviewCompleted()

  if (goalsCreated.value) {
    router.push('/app/goals-bank')
  } else if (source.value === 'ssp') {
    router.push('/app/ssp')
  } else {
    router.push('/app')
  }
}

function handleSkip() {
  if (source.value === 'ssp') {
    router.push('/app/ssp')
  } else {
    router.push('/app')
  }
}

function handleRetry() {
  errorMessage.value = ''
  if (sessionId.value) {
    loadSession()
  } else {
    phase.value = 'idle'
  }
}

// ===== WebSocket watcher =====

watch(() => aiTasksStore.activeTasks, (tasks) => {
  if (!pendingTaskId.value) return

  const task = tasks.find(t => t.task_id === pendingTaskId.value)
  if (!task) return

  progressPercent.value = task.progress_percent || 0
  progressText.value = task.progress_text || ''

  if (task.status === 'completed') {
    handleTaskCompleted(task)
  } else if (task.status === 'failed') {
    handleTaskFailed(task)
  }
}, { deep: true })

async function handleTaskCompleted(task) {
  const taskType = pendingTaskType.value
  pendingTaskId.value = null
  progressPercent.value = 0
  progressText.value = ''

  if (taskType === 'questions') {
    // Questions ready — load iteration
    try {
      const result = await getInterviewIteration(sessionId.value)
      if (result.status === 'ok' && result.data) {
        questions.value = result.data.questions || []
        currentQuestionIndex.value = 0
        selectedOptionId.value = null
        freeText.value = ''
        answersCollected.value = []
        phase.value = 'questions'
      }
    } catch (e) {
      errorMessage.value = e.message
      phase.value = 'error'
    }
  } else if (taskType === 'summary') {
    // Summary ready — load results
    await loadSession()
  }
}

function handleTaskFailed(task) {
  pendingTaskId.value = null
  progressPercent.value = 0
  progressText.value = ''
  errorMessage.value = task.error?.message || (pendingTaskType.value === 'summary'
    ? 'Ошибка анализа результатов'
    : 'Ошибка подбора вопросов')
  phase.value = 'error'
}

// ===== Lifecycle =====

onMounted(async () => {
  // Connect to WebSocket for task tracking
  aiTasksStore.connect()

  // Check for existing session (reconnect)
  try {
    const result = await getInterviewSession()
    if (result.status === 'ok' && result.data && result.data.status !== 'expired') {
      existingSession.value = result.data

      // Auto-restore active sessions
      if (['in_progress', 'analyzing'].includes(result.data.status)) {
        await restoreSession(result.data)
        return
      }
      if (result.data.status === 'completed' && result.data.ai_insights) {
        await restoreSession(result.data)
        return
      }
    }
  } catch (e) {
    // No session, show idle
  }

  phase.value = 'idle'
})

onUnmounted(() => {
  // Don't disconnect — other components may use it
})
</script>

<style scoped>
.interview-container {
  max-width: 640px;
  margin: 0 auto;
  padding: 1rem;
  min-height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
}

/* ===== Idle Phase ===== */
.phase-idle {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.idle-card {
  text-align: center;
  padding: 2rem 1.5rem;
}

.idle-icon {
  color: var(--primary-color);
  margin-bottom: 1.5rem;
}

.idle-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.idle-desc {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.5;
  max-width: 400px;
  margin: 0 auto 1rem;
}

.idle-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--bg-tertiary);
  border-radius: 20px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.idle-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

/* ===== Loading / Analyzing / Submitting ===== */
.phase-loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-card {
  text-align: center;
  padding: 2rem 1.5rem;
}

.loading-icon {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.loading-card h2 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.progress-bar-container {
  width: 100%;
  max-width: 300px;
  margin: 0 auto 1rem;
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--primary-color);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  color: var(--text-tertiary);
  font-size: 0.85rem;
}

/* ===== Questions Phase ===== */
.phase-questions {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.questions-header {
  margin-bottom: 1.5rem;
}

.iteration-badge {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.iteration-progress {
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
}

.iteration-bar {
  height: 100%;
  background: var(--primary-color);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.question-card {
  flex: 1;
}

.question-text {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  line-height: 1.4;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.option-btn {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--card-bg);
  cursor: pointer;
  text-align: left;
  font-size: 0.95rem;
  color: var(--text-primary);
  line-height: 1.4;
  transition: all 0.15s ease;
}

.option-btn:hover {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.option-btn.selected {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.option-radio {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
  transition: border-color 0.15s ease;
}

.option-btn.selected .option-radio {
  border-color: var(--primary-color);
}

.option-radio-inner {
  width: 10px;
  height: 10px;
  background: var(--primary-color);
  border-radius: 50%;
}

.free-text-section {
  margin-bottom: 1.5rem;
}

.free-text-label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.free-text-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.95rem;
  resize: vertical;
  font-family: inherit;
}

.free-text-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.question-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 0.5rem;
}

/* ===== Results Phase ===== */
.phase-results {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 2rem;
}

.result-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.25rem;
}

.result-card h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.mentor-card {
  display: flex;
  gap: 12px;
  background: var(--primary-light);
  border-color: var(--primary-color);
}

.mentor-avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mentor-text {
  color: var(--text-primary);
  line-height: 1.5;
  font-size: 0.95rem;
}

.traits-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 0.5rem;
}

.trait-badge {
  padding: 4px 10px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.insights-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.insights-list li {
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  line-height: 1.4;
  color: var(--text-primary);
}

.insights-list li.high-priority {
  border-left: 3px solid var(--warning-color);
}

.insight-category {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 2px;
}

.priority-badge {
  display: inline-block;
  padding: 2px 6px;
  background: var(--warning-color);
  color: #fff;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-left: 6px;
}

.focus-list {
  padding-left: 1.25rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.focus-list li {
  font-size: 0.9rem;
  line-height: 1.4;
  color: var(--text-primary);
}

.goals-card .goal-checkbox {
  margin-bottom: 0.5rem;
}

.goal-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  padding: 10px 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.goal-label input[type="checkbox"] {
  margin-top: 2px;
  flex-shrink: 0;
  accent-color: var(--primary-color);
}

.goal-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.goal-title {
  font-size: 0.9rem;
  color: var(--text-primary);
}

.goal-sphere {
  font-size: 0.75rem;
  font-weight: 600;
}

.goals-card .btn {
  margin-top: 0.75rem;
  width: 100%;
}

.success-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
  padding: 1.5rem;
}

.success-card p {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
}

.results-actions {
  display: flex;
  justify-content: center;
  padding-top: 0.5rem;
}

/* ===== Error Phase ===== */
.phase-error {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-card {
  text-align: center;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.error-card h2 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
}

.error-card p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* ===== Shared ===== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.btn-primary {
  background: var(--primary-color);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-lg {
  padding: 14px 32px;
  font-size: 1rem;
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  padding: 10px 20px;
}

.btn-ghost:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .interview-container {
    padding: 0.75rem;
  }

  .idle-title {
    font-size: 1.3rem;
  }

  .question-text {
    font-size: 1.05rem;
  }
}
</style>
