<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAITasksStore } from '@/stores/aiTasks'
import { useToastStore } from '@/stores/toast'
import { useConfetti } from '@/composables/useConfetti'
import { DEBUG_MODE } from '@/config/settings.js'
import {
  startInterviewSession,
  getInterviewSession,
  getInterviewIteration,
  submitInterviewIteration,
  createInterviewGoals
} from '@/services/api.js'
import {
  Brain, ChevronLeft, ChevronRight, CheckCircle, AlertCircle,
  Loader2, Send, Sparkles, ArrowRight, SkipForward, Bot, Target
} from 'lucide-vue-next'

const router = useRouter()
const store = useAppStore()
const aiTasksStore = useAITasksStore()
const toastStore = useToastStore()
const { celebrateBig } = useConfetti()

// === State ===
const phase = ref('idle') // idle | loading | questions | submitting | analyzing | results | error
const sessionId = ref(null)
const iterationNumber = ref(0)
const questions = ref([])
const answers = ref({}) // { questionId: { selected_option_id, free_text } }
const currentQuestionIndex = ref(0)
const completedIterations = ref(0)
const totalQuestionsAnswered = ref(0)
const aiSummary = ref(null)
const aiInsights = ref(null)
const errorMessage = ref(null)
const showUpgradeModal = ref(false)
const pendingTaskId = ref(null)
const pendingTaskType = ref(null) // 'questions' | 'summary'
const hasExistingSession = ref(false)
const goalsCreated = ref(false)
const selectedGoalIndexes = ref([])
const creatingGoals = ref(false)
const createdGoalsResult = ref(null)
const summaryTaskId = ref(null)
let resumeRetryCount = 0

// === Category config ===
const CATEGORY_COLORS = {
  welfare: 'var(--sphere-wealth)',
  hobby: 'var(--sphere-hobbies)',
  environment: 'var(--sphere-friendship)',
  health_sport: 'var(--sphere-health)',
  work: 'var(--sphere-career)',
  family: 'var(--sphere-love)'
}

const CATEGORY_LABELS = {
  welfare: 'Благосостояние',
  hobby: 'Хобби',
  environment: 'Окружение',
  health_sport: 'Здоровье',
  work: 'Карьера',
  family: 'Семья'
}

// === Computed ===
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || null)
const isLastQuestion = computed(() => currentQuestionIndex.value === questions.value.length - 1)
const isFirstQuestion = computed(() => currentQuestionIndex.value === 0)
const questionProgress = computed(() => {
  if (questions.value.length === 0) return 0
  return Math.round(((currentQuestionIndex.value + 1) / questions.value.length) * 100)
})
const currentAnswer = computed(() => {
  if (!currentQuestion.value) return null
  return answers.value[currentQuestion.value.id] || null
})
const hasCurrentAnswer = computed(() => {
  const answer = currentAnswer.value
  if (!answer) return false
  return answer.selected_option_id !== null || (answer.free_text && answer.free_text.trim().length > 0)
})
const allQuestionsAnswered = computed(() => {
  return questions.value.every(q => {
    const answer = answers.value[q.id]
    return answer && (answer.selected_option_id !== null || (answer.free_text && answer.free_text.trim().length > 0))
  })
})

const aiProgress = computed(() => {
  if (!pendingTaskId.value) return { percent: 0, text: '' }
  const task = aiTasksStore.activeTasks.find(t => t.task_id === pendingTaskId.value)
  if (!task) return { percent: 0, text: 'Подготовка...' }
  return {
    percent: task.progress_percent || 0,
    text: task.progress_text || 'AI подбирает вопросы...'
  }
})

const summaryProgress = computed(() => {
  if (!pendingTaskId.value) return { percent: 0, text: 'Саша анализирует ответы...' }
  const task = aiTasksStore.activeTasks.find(t => t.task_id === pendingTaskId.value)
  if (!task) return { percent: 0, text: 'Саша анализирует ответы...' }
  return {
    percent: task.progress_percent || 0,
    text: task.progress_text || 'Саша анализирует ответы...'
  }
})

// === WebSocket watcher ===
watch(() => aiTasksStore.activeTasks, (tasks) => {
  if (!pendingTaskId.value) return

  const task = tasks.find(t => t.task_id === pendingTaskId.value)
  if (!task) return

  if (DEBUG_MODE) {
    console.log('[Interview] Task update:', task.task_id, task.status, task.progress_percent, 'type:', pendingTaskType.value)
  }

  if (task.status === 'completed') {
    if (pendingTaskType.value === 'summary') {
      handleSummaryCompleted(task.result)
    } else {
      handleTaskCompleted(task.result)
    }
  } else if (task.status === 'failed') {
    if (pendingTaskType.value === 'summary') {
      handleSummaryFailed(task.error)
    } else {
      handleTaskFailed(task.error)
    }
  }
}, { deep: true })

// === Init ===
onMounted(async () => {
  aiTasksStore.connect()
  await checkExistingSession()
})

// === Session management ===
async function checkExistingSession() {
  try {
    const result = await getInterviewSession()

    if (result.status === 'ok' && result.data) {
      const data = result.data
      sessionId.value = data.session_id
      completedIterations.value = data.iterations_count || 0
      totalQuestionsAnswered.value = data.total_questions_answered || 0

      if (data.status === 'in_progress') {
        hasExistingSession.value = true
        if (DEBUG_MODE) {
          console.log('[Interview] Found active session:', data.session_id)
        }
      } else if (data.status === 'analyzing') {
        hasExistingSession.value = true
        summaryTaskId.value = data.summary_task_id
        if (data.summary_task_id) {
          pendingTaskId.value = data.summary_task_id
          pendingTaskType.value = 'summary'
        }
        phase.value = 'analyzing'
        return
      } else if (data.status === 'completed') {
        aiSummary.value = data.ai_summary
        aiInsights.value = data.ai_insights
        goalsCreated.value = data.goals_created || false
        if (aiInsights.value) initSelectedGoals()
        phase.value = 'results'
        return
      }
    }
  } catch (e) {
    if (DEBUG_MODE) {
      console.log('[Interview] No existing session or error:', e)
    }
  }
}

async function startSession() {
  phase.value = 'loading'
  errorMessage.value = null

  try {
    if (hasExistingSession.value && sessionId.value) {
      await resumeSession()
      return
    }

    const result = await startInterviewSession()

    if (result.status === 'ok' && result.data) {
      sessionId.value = result.data.session_id
      pendingTaskId.value = result.data.task_id
      pendingTaskType.value = 'questions'
      iterationNumber.value = result.data.iteration_number || 1
      completedIterations.value = 0
      totalQuestionsAnswered.value = 0

      if (DEBUG_MODE) {
        console.log('[Interview] Session started:', result.data)
      }
    } else {
      handleApiError(result)
    }
  } catch (e) {
    if (DEBUG_MODE) {
      console.error('[Interview] Start session error:', e)
    }
    errorMessage.value = 'Не удалось начать интервью. Попробуйте позже.'
    phase.value = 'error'
  }
}

async function resumeSession() {
  try {
    const result = await getInterviewIteration(sessionId.value)

    if (result.status === 'ok' && result.data) {
      const data = result.data

      // Обновляем статистику
      completedIterations.value = data.completed_iterations || 0
      totalQuestionsAnswered.value = data.total_questions_answered || 0

      if (data.session_status === 'completed') {
        await loadCompletedSession()
        return
      }

      if (data.session_status === 'analyzing') {
        const sessionResult = await getInterviewSession(sessionId.value)
        if (sessionResult.status === 'ok' && sessionResult.data) {
          summaryTaskId.value = sessionResult.data.summary_task_id
          if (sessionResult.data.status === 'completed') {
            aiSummary.value = sessionResult.data.ai_summary
            aiInsights.value = sessionResult.data.ai_insights
            goalsCreated.value = sessionResult.data.goals_created || false
            if (aiInsights.value) initSelectedGoals()
            phase.value = 'results'
          } else if (sessionResult.data.summary_task_id) {
            pendingTaskId.value = sessionResult.data.summary_task_id
            pendingTaskType.value = 'summary'
            phase.value = 'analyzing'
          } else {
            phase.value = 'analyzing'
          }
        }
        return
      }

      const iteration = data.current_iteration
      if (!iteration) {
        // Нет текущей итерации — сессия завершена
        await loadCompletedSession()
        return
      }

      iterationNumber.value = iteration.iteration_number

      if (iteration.status === 'waiting_answers') {
        setQuestions(iteration.questions)
        phase.value = 'questions'
      } else if (iteration.status === 'selecting') {
        // AI ещё подбирает вопросы — ждём через WS
        phase.value = 'loading'
        // Попробуем найти running task
        const runningTask = aiTasksStore.activeTasks.find(
          t => t.task_type === 'interview_select_questions' && ['pending', 'running'].includes(t.status)
        )
        if (runningTask) {
          pendingTaskId.value = runningTask.task_id
          pendingTaskType.value = 'questions'
        }
      } else if (iteration.status === 'completed' || iteration.status === 'failed') {
        // Текущая итерация завершена/ошибка — попробуем получить результат сессии
        await loadCompletedSession()
      }
    } else {
      handleApiError(result)
    }
  } catch (e) {
    if (DEBUG_MODE) {
      console.error('[Interview] Resume error:', e)
    }
    errorMessage.value = 'Не удалось восстановить сессию.'
    phase.value = 'error'
  }
}

// === Questions ===
function setQuestions(questionsData) {
  const data = questionsData || []
  if (data.length === 0) {
    if (DEBUG_MODE) {
      console.warn('[Interview] setQuestions called with empty array, loading from API')
    }
    loadIterationFromApi()
    return
  }

  questions.value = data
  answers.value = {}
  currentQuestionIndex.value = 0

  // Инициализируем пустые ответы
  for (const q of questions.value) {
    answers.value[q.id] = {
      selected_option_id: null,
      free_text: ''
    }
  }
}

function selectOption(optionId) {
  if (!currentQuestion.value) return
  const qId = currentQuestion.value.id
  if (!answers.value[qId]) {
    answers.value[qId] = { selected_option_id: null, free_text: '' }
  }
  answers.value[qId].selected_option_id = optionId
}

function updateFreeText(text) {
  if (!currentQuestion.value) return
  const qId = currentQuestion.value.id
  if (!answers.value[qId]) {
    answers.value[qId] = { selected_option_id: null, free_text: '' }
  }
  answers.value[qId].free_text = text
}

function goNextQuestion() {
  if (!isLastQuestion.value && hasCurrentAnswer.value) {
    currentQuestionIndex.value++
  }
}

function goPrevQuestion() {
  if (!isFirstQuestion.value) {
    currentQuestionIndex.value--
  }
}

// === Submit ===
async function submitAnswers() {
  if (phase.value === 'submitting') return
  if (!allQuestionsAnswered.value) {
    toastStore.showToast({ message: 'Ответьте на все вопросы', type: 'warning' })
    return
  }

  phase.value = 'submitting'
  errorMessage.value = null

  const answersArray = questions.value.map(q => {
    const answer = answers.value[q.id]
    return {
      question_id: q.id,
      selected_option_id: answer.selected_option_id,
      free_text: answer.free_text?.trim() || null
    }
  })

  try {
    const result = await submitInterviewIteration(sessionId.value, answersArray)

    if (result.status === 'ok' && result.data) {
      const data = result.data
      completedIterations.value = data.iteration_completed || completedIterations.value + 1
      totalQuestionsAnswered.value += questions.value.length

      if (data.session_completed) {
        if (data.analyzing && data.summary_task_id) {
          // AI анализирует — переходим в фазу analyzing
          summaryTaskId.value = data.summary_task_id
          pendingTaskId.value = data.summary_task_id
          pendingTaskType.value = 'summary'
          phase.value = 'analyzing'
        } else {
          // Старый формат (fallback) — сразу результаты
          aiSummary.value = data.ai_summary
          aiInsights.value = data.ai_insights
          if (aiInsights.value) initSelectedGoals()
          phase.value = 'results'
          celebrateBig()
        }
      } else {
        // Следующая итерация — ждём AI
        pendingTaskId.value = data.next_task_id
        pendingTaskType.value = 'questions'
        iterationNumber.value = data.next_iteration_number || iterationNumber.value + 1
        phase.value = 'loading'
      }
    } else {
      handleApiError(result)
    }
  } catch (e) {
    if (DEBUG_MODE) {
      console.error('[Interview] Submit error:', e)
    }
    errorMessage.value = 'Не удалось отправить ответы. Попробуйте снова.'
    phase.value = 'error'
  }
}

// === Task callbacks ===
function handleTaskCompleted(result) {
  if (DEBUG_MODE) {
    console.log('[Interview] Task completed with result:', result)
  }

  pendingTaskId.value = null
  pendingTaskType.value = null

  if (result && result.is_complete) {
    // AI решил, что данных достаточно — загрузим результат сессии
    loadCompletedSession()
    return
  }

  if (result && result.questions && result.questions.length > 0) {
    setQuestions(result.questions)
    phase.value = 'questions'
  } else {
    // Нет вопросов в результате — попробуем через API
    loadIterationFromApi()
  }
}

function handleTaskFailed(error) {
  if (DEBUG_MODE) {
    console.error('[Interview] Task failed:', error)
  }
  pendingTaskId.value = null
  pendingTaskType.value = null
  errorMessage.value = error?.message || 'AI не смог подобрать вопросы. Попробуйте снова.'
  phase.value = 'error'
}

function handleSummaryCompleted(result) {
  pendingTaskId.value = null
  pendingTaskType.value = null
  aiSummary.value = result.ai_summary
  aiInsights.value = result.ai_insights
  if (aiInsights.value) initSelectedGoals()
  phase.value = 'results'
  celebrateBig()
}

function handleSummaryFailed(error) {
  pendingTaskId.value = null
  pendingTaskType.value = null
  errorMessage.value = error?.message || 'AI не смог сгенерировать анализ. Попробуйте снова.'
  phase.value = 'error'
}

async function loadIterationFromApi() {
  try {
    const result = await getInterviewIteration(sessionId.value)
    if (result.status === 'ok' && result.data?.current_iteration) {
      const iteration = result.data.current_iteration
      if (iteration.status === 'waiting_answers' && iteration.questions?.length > 0) {
        setQuestions(iteration.questions)
        phase.value = 'questions'
        return
      }
    }
    // Если не получили вопросы — проверим сессию
    await loadCompletedSession()
  } catch (e) {
    if (DEBUG_MODE) {
      console.error('[Interview] Load iteration error:', e)
    }
    errorMessage.value = 'Не удалось загрузить вопросы.'
    phase.value = 'error'
  }
}

async function loadCompletedSession() {
  try {
    const result = await getInterviewSession(sessionId.value)
    if (result.status === 'ok' && result.data) {
      if (result.data.status === 'analyzing') {
        summaryTaskId.value = result.data.summary_task_id
        if (result.data.summary_task_id) {
          pendingTaskId.value = result.data.summary_task_id
          pendingTaskType.value = 'summary'
        }
        phase.value = 'analyzing'
        return
      }
      aiSummary.value = result.data.ai_summary
      aiInsights.value = result.data.ai_insights
      goalsCreated.value = result.data.goals_created || false
      completedIterations.value = result.data.iterations_count || completedIterations.value
      totalQuestionsAnswered.value = result.data.total_questions_answered || totalQuestionsAnswered.value
      if (aiInsights.value) initSelectedGoals()
      phase.value = 'results'
      celebrateBig()
    } else {
      errorMessage.value = 'Не удалось загрузить результаты интервью.'
      phase.value = 'error'
    }
  } catch (e) {
    if (DEBUG_MODE) {
      console.error('[Interview] Load completed session error:', e)
    }
    errorMessage.value = 'Не удалось загрузить результаты интервью.'
    phase.value = 'error'
  }
}

// === Error handling ===
function handleApiError(result) {
  const code = result.error_code
  const message = result.error_message

  if (DEBUG_MODE) {
    console.warn('[Interview] API error:', code, message)
  }

  switch (code) {
    case 'interview_no_ai_access':
      showUpgradeModal.value = true
      phase.value = 'idle'
      break
    case 'interview_session_already_active':
      if (resumeRetryCount >= 2) {
        errorMessage.value = 'Не удалось восстановить сессию.'
        phase.value = 'error'
        break
      }
      resumeRetryCount++
      hasExistingSession.value = true
      phase.value = 'loading'
      resumeSession()
      break
    case 'interview_deep_missing_answers':
    case 'interview_need_answer':
      toastStore.showToast({ message: message || 'Ответьте на все вопросы', type: 'warning' })
      phase.value = 'questions'
      break
    case 'interview_session_not_found':
      sessionId.value = null
      hasExistingSession.value = false
      phase.value = 'idle'
      break
    default:
      errorMessage.value = message || 'Произошла ошибка. Попробуйте позже.'
      phase.value = 'error'
  }
}

function retry() {
  errorMessage.value = null
  if (summaryTaskId.value && sessionId.value) {
    retrySummary()
  } else if (sessionId.value) {
    phase.value = 'loading'
    resumeSession()
  } else {
    phase.value = 'idle'
  }
}

function goToDashboard() {
  router.push('/app')
}

function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || 'var(--primary-color)'
}

function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] || null
}

function pluralize(n, one, few, many) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

// === Goals ===
function initSelectedGoals() {
  const goals = aiInsights.value?.recommended_goals || []
  selectedGoalIndexes.value = goals.map((_, i) => i)
}

function toggleGoalSelection(index) {
  const idx = selectedGoalIndexes.value.indexOf(index)
  if (idx === -1) {
    selectedGoalIndexes.value.push(index)
  } else {
    selectedGoalIndexes.value.splice(idx, 1)
  }
}

async function createGoals() {
  if (creatingGoals.value || goalsCreated.value) return
  if (selectedGoalIndexes.value.length === 0) {
    toastStore.showToast({ message: 'Выберите хотя бы одну цель', type: 'warning' })
    return
  }
  creatingGoals.value = true
  try {
    const result = await createInterviewGoals(sessionId.value, selectedGoalIndexes.value)
    if (result.status === 'ok' && result.data) {
      goalsCreated.value = true
      createdGoalsResult.value = result.data
      celebrateBig()
      toastStore.showToast({
        message: `Создано ${result.data.created_goals_count} целей!`,
        type: 'success'
      })
    } else {
      handleGoalsError(result)
    }
  } catch (e) {
    toastStore.showToast({ message: 'Не удалось создать цели', type: 'error' })
  } finally {
    creatingGoals.value = false
  }
}

function handleGoalsError(result) {
  const code = result.error_code
  switch (code) {
    case 'interview_goals_already_created':
      goalsCreated.value = true
      toastStore.showToast({ message: 'Цели уже были созданы', type: 'info' })
      break
    case 'interview_session_not_completed':
    case 'interview_no_insights':
      toastStore.showToast({ message: 'Результаты анализа ещё не готовы', type: 'warning' })
      break
    case 'interview_invalid_goal_index':
      toastStore.showToast({ message: 'Некорректный выбор цели', type: 'error' })
      break
    default:
      toastStore.showToast({ message: result.error_message || 'Ошибка', type: 'error' })
  }
}

// === Retry summary ===
async function retrySummary() {
  phase.value = 'analyzing'
  errorMessage.value = null
  try {
    const result = await aiTasksStore.startTask('interview_generate_summary', {
      session_id: sessionId.value
    })
    if (result.task_id) {
      pendingTaskId.value = result.task_id
      pendingTaskType.value = 'summary'
      summaryTaskId.value = result.task_id
    }
  } catch (e) {
    errorMessage.value = 'Не удалось запустить анализ.'
    phase.value = 'error'
  }
}
</script>

<template>
  <div class="interview-root">
    <div class="interview-content">

      <!-- IDLE: Start screen -->
      <div v-if="phase === 'idle'" class="screen fade-in">
        <div class="screen-icon">
          <Brain :size="48" :stroke-width="1.5" />
        </div>
        <h1>AI Интервью</h1>
        <p class="screen-subtitle">
          Персональное тестирование с адаптивным подбором вопросов. AI проанализирует ваши ответы и даст рекомендации.
        </p>

        <div class="info-cards">
          <div class="info-card">
            <Sparkles :size="18" :stroke-width="1.5" />
            <span>3-10 итераций</span>
          </div>
          <div class="info-card">
            <Brain :size="18" :stroke-width="1.5" />
            <span>Адаптивные вопросы</span>
          </div>
        </div>

        <button class="btn-primary" @click="startSession">
          {{ hasExistingSession ? 'Продолжить интервью' : 'Начать интервью' }}
          <ArrowRight :size="18" :stroke-width="2" />
        </button>
        <button class="btn-skip" @click="goToDashboard">
          Пропустить
          <SkipForward :size="14" :stroke-width="1.5" />
        </button>
      </div>

      <!-- LOADING: AI selecting questions -->
      <div v-else-if="phase === 'loading'" class="screen fade-in">
        <div class="loading-container">
          <div class="loading-spinner">
            <Loader2 :size="40" :stroke-width="1.5" class="spin" />
          </div>
          <h2>AI подбирает вопросы</h2>
          <p class="loading-text">{{ aiProgress.text || 'Анализируем ваш профиль...' }}</p>

          <div class="loading-progress-bar">
            <div class="loading-progress-fill" :style="{ width: aiProgress.percent + '%' }"></div>
          </div>

          <div class="loading-stats" v-if="completedIterations > 0">
            <span>Итерация {{ iterationNumber }}</span>
            <span class="stats-divider">&middot;</span>
            <span>Отвечено {{ totalQuestionsAnswered }} вопросов</span>
          </div>
        </div>
      </div>

      <!-- QUESTIONS: Answer one at a time -->
      <div v-else-if="phase === 'questions' && currentQuestion" class="screen fade-in">
        <div class="question-header">
          <div class="scenario-counter">
            Вопрос {{ currentQuestionIndex + 1 }}/{{ questions.length }}
            <span v-if="iterationNumber > 0"> &middot; Итерация {{ iterationNumber }}</span>
          </div>

          <div class="question-progress-bar">
            <div class="question-progress-fill" :style="{ width: questionProgress + '%' }"></div>
          </div>
        </div>

        <div class="question-card">
          <div class="question-meta" v-if="currentQuestion.category">
            <span
              class="category-badge"
              :style="{ color: getCategoryColor(currentQuestion.category), borderColor: getCategoryColor(currentQuestion.category) }"
            >
              <span v-if="currentQuestion.icon" class="question-icon-emoji">{{ currentQuestion.icon }}</span>
              {{ getCategoryLabel(currentQuestion.category) }}
            </span>
          </div>
          <div v-else-if="currentQuestion.icon" class="question-icon-solo">
            {{ currentQuestion.icon }}
          </div>

          <h2 class="question-title">{{ currentQuestion.title }}</h2>
          <p v-if="currentQuestion.description" class="question-description">{{ currentQuestion.description }}</p>
        </div>

        <div class="options-list">
          <button
            v-for="option in currentQuestion.answer_options"
            :key="option.id"
            class="option-card"
            :class="{ selected: currentAnswer?.selected_option_id === option.id }"
            @click="selectOption(option.id)"
          >
            <span class="option-radio">
              <span class="option-radio-dot" v-if="currentAnswer?.selected_option_id === option.id"></span>
            </span>
            <span class="option-label">{{ option.text }}</span>
          </button>
        </div>

        <div class="free-text-section">
          <textarea
            class="free-text-input"
            :value="currentAnswer?.free_text || ''"
            @input="updateFreeText($event.target.value)"
            placeholder="Дополните ответ своими словами (необязательно)"
            rows="2"
            maxlength="5000"
          ></textarea>
        </div>

        <div class="question-nav">
          <button
            class="btn-nav btn-prev"
            :disabled="isFirstQuestion"
            @click="goPrevQuestion"
          >
            <ChevronLeft :size="18" :stroke-width="2" />
            Назад
          </button>

          <button
            v-if="!isLastQuestion"
            class="btn-nav btn-next"
            :disabled="!hasCurrentAnswer"
            @click="goNextQuestion"
          >
            Далее
            <ChevronRight :size="18" :stroke-width="2" />
          </button>

          <button
            v-else
            class="btn-primary btn-submit"
            :disabled="!allQuestionsAnswered"
            @click="submitAnswers"
          >
            <Send :size="16" :stroke-width="2" />
            Отправить
          </button>
        </div>
      </div>

      <!-- SUBMITTING: Sending answers -->
      <div v-else-if="phase === 'submitting'" class="screen fade-in">
        <div class="loading-container">
          <div class="loading-spinner">
            <Loader2 :size="40" :stroke-width="1.5" class="spin" />
          </div>
          <h2>Отправляем ответы</h2>
          <p class="loading-text">AI анализирует ваши ответы...</p>
        </div>
      </div>

      <!-- ANALYZING: AI generating summary -->
      <div v-else-if="phase === 'analyzing'" class="screen fade-in">
        <div class="loading-container">
          <div class="loading-spinner">
            <Loader2 :size="40" :stroke-width="1.5" class="spin" />
          </div>
          <h2>Саша анализирует твои ответы</h2>
          <p class="loading-text">{{ summaryProgress.text }}</p>
          <div class="loading-progress-bar">
            <div class="loading-progress-fill" :style="{ width: summaryProgress.percent + '%' }"></div>
          </div>
          <div v-if="completedIterations > 0" class="loading-stats">
            <span>{{ completedIterations }} {{ pluralize(completedIterations, 'итерация', 'итерации', 'итераций') }}</span>
            <span class="stats-divider">&middot;</span>
            <span>{{ totalQuestionsAnswered }} {{ pluralize(totalQuestionsAnswered, 'ответ', 'ответа', 'ответов') }}</span>
          </div>
        </div>
      </div>

      <!-- RESULTS: Rich results screen -->
      <div v-else-if="phase === 'results'" class="screen fade-in results-screen">

        <!-- Header -->
        <div class="completed-icon">
          <CheckCircle :size="56" :stroke-width="1.5" />
        </div>
        <h1>Интервью завершено!</h1>
        <p class="screen-subtitle">
          Вы прошли {{ completedIterations }} {{ pluralize(completedIterations, 'итерацию', 'итерации', 'итераций') }}
          и ответили на {{ totalQuestionsAnswered }} {{ pluralize(totalQuestionsAnswered, 'вопрос', 'вопроса', 'вопросов') }}
        </p>

        <!-- Mentor Message -->
        <div v-if="aiInsights && aiInsights.mentor_message" class="sasha-card">
          <div class="sasha-avatar">
            <Bot :size="20" :stroke-width="1.5" />
          </div>
          <div class="sasha-content">
            <div class="sasha-name">Саша, AI Ментор</div>
            <p>{{ aiInsights.mentor_message }}</p>
          </div>
        </div>

        <!-- Personality Profile -->
        <div v-if="aiInsights && aiInsights.personality_profile" class="results-section">
          <h3 class="results-section-title">
            <Brain :size="18" :stroke-width="2" />
            Твой портрет
          </h3>
          <p class="results-text">{{ aiInsights.personality_profile.summary }}</p>
          <div v-if="aiInsights.personality_profile.key_traits" class="traits-list">
            <span v-for="trait in aiInsights.personality_profile.key_traits" :key="trait" class="trait-badge">
              {{ trait }}
            </span>
          </div>
        </div>

        <!-- Strengths -->
        <div v-if="aiInsights && aiInsights.strengths && aiInsights.strengths.length" class="results-section">
          <h3 class="results-section-title">
            <Sparkles :size="18" :stroke-width="2" />
            Сильные стороны
          </h3>
          <div v-for="item in aiInsights.strengths" :key="item.area" class="insight-card">
            <div class="insight-card-header">
              <span class="insight-area-badge" :style="{ borderColor: getCategoryColor(item.area), color: getCategoryColor(item.area) }">
                {{ item.area_name }}
              </span>
            </div>
            <p class="insight-description">{{ item.description }}</p>
          </div>
        </div>

        <!-- Growth Areas -->
        <div v-if="aiInsights && aiInsights.growth_areas && aiInsights.growth_areas.length" class="results-section">
          <h3 class="results-section-title">
            <ArrowRight :size="18" :stroke-width="2" />
            Зоны роста
          </h3>
          <div v-for="item in aiInsights.growth_areas" :key="item.area" class="insight-card">
            <div class="insight-card-header">
              <span class="insight-area-badge" :style="{ borderColor: getCategoryColor(item.area), color: getCategoryColor(item.area) }">
                {{ item.area_name }}
              </span>
              <span v-if="item.priority === 'high'" class="priority-badge priority-high">Приоритет</span>
            </div>
            <p class="insight-description">{{ item.description }}</p>
          </div>
        </div>

        <!-- Recommended Focus -->
        <div v-if="aiInsights && aiInsights.recommended_focus && aiInsights.recommended_focus.length" class="results-section">
          <h3 class="results-section-title">
            <Target :size="18" :stroke-width="2" />
            Рекомендованный фокус
          </h3>
          <div class="focus-list">
            <div v-for="(focus, i) in aiInsights.recommended_focus" :key="i" class="focus-item">
              <span class="focus-number">{{ i + 1 }}</span>
              <span>{{ focus }}</span>
            </div>
          </div>
        </div>

        <!-- Recommended Goals -->
        <div v-if="aiInsights && aiInsights.recommended_goals && aiInsights.recommended_goals.length" class="results-section">
          <h3 class="results-section-title">
            <Target :size="18" :stroke-width="2" />
            Рекомендованные цели
          </h3>
          <p class="results-text results-text-sm">Выберите цели, которые хотите добавить в свой план</p>

          <div class="goals-list">
            <div
              v-for="(goal, index) in aiInsights.recommended_goals"
              :key="index"
              class="goal-card"
              :class="{ 'goal-selected': selectedGoalIndexes.includes(index), 'goal-disabled': goalsCreated }"
              @click="!goalsCreated && toggleGoalSelection(index)"
            >
              <div class="goal-checkbox">
                <CheckCircle v-if="selectedGoalIndexes.includes(index)" :size="20" :stroke-width="2" />
                <div v-else class="goal-checkbox-empty"></div>
              </div>
              <div class="goal-info">
                <div class="goal-title">{{ goal.title }}</div>
                <span v-if="goal.category" class="goal-category-badge" :style="{ borderColor: getCategoryColor(goal.category), color: getCategoryColor(goal.category) }">
                  {{ getCategoryLabel(goal.category) || goal.category }}
                </span>
                <p v-if="goal.why_important" class="goal-why">{{ goal.why_important }}</p>
                <div v-if="goal.steps && goal.steps.length" class="goal-steps-count">
                  {{ goal.steps.length }} {{ pluralize(goal.steps.length, 'шаг', 'шага', 'шагов') }}
                </div>
              </div>
            </div>
          </div>

          <!-- Create Goals Button -->
          <div v-if="!goalsCreated" class="goals-actions">
            <button
              class="btn-primary"
              :disabled="creatingGoals || selectedGoalIndexes.length === 0"
              @click="createGoals"
            >
              <Loader2 v-if="creatingGoals" :size="18" :stroke-width="2" class="spin" />
              <Target v-else :size="18" :stroke-width="2" />
              Создать {{ selectedGoalIndexes.length }} {{ pluralize(selectedGoalIndexes.length, 'цель', 'цели', 'целей') }}
            </button>
          </div>

          <!-- Goals Created Success -->
          <div v-else class="goals-created-success">
            <CheckCircle :size="20" :stroke-width="2" />
            <span v-if="createdGoalsResult">
              Создано {{ createdGoalsResult.created_goals_count }} {{ pluralize(createdGoalsResult.created_goals_count, 'цель', 'цели', 'целей') }}
              и {{ createdGoalsResult.created_steps_count }} {{ pluralize(createdGoalsResult.created_steps_count, 'шаг', 'шага', 'шагов') }}
            </span>
            <span v-else>Цели созданы</span>
          </div>
        </div>

        <!-- Fallback: simple ai_summary (если нет ai_insights) -->
        <div v-else-if="aiSummary" class="sasha-card">
          <div class="sasha-avatar">
            <Bot :size="20" :stroke-width="1.5" />
          </div>
          <div class="sasha-content">
            <div class="sasha-name">AI Ментор</div>
            <p>{{ aiSummary }}</p>
          </div>
        </div>

        <!-- Go to dashboard button -->
        <button class="btn-primary btn-dashboard" @click="goToDashboard">
          На главную
          <ArrowRight :size="18" :stroke-width="2" />
        </button>

        <button v-if="goalsCreated" class="btn-skip" @click="router.push('/app/goals-bank')">
          Перейти к целям
        </button>
      </div>

      <!-- ERROR -->
      <div v-else-if="phase === 'error'" class="screen fade-in">
        <div class="error-icon">
          <AlertCircle :size="48" :stroke-width="1.5" />
        </div>
        <h1>Что-то пошло не так</h1>
        <p class="screen-subtitle">{{ errorMessage || 'Произошла ошибка. Попробуйте позже.' }}</p>
        <button class="btn-primary" @click="retry">Попробовать снова</button>
        <button class="btn-skip" @click="goToDashboard">На главную</button>
      </div>

    </div>
  </div>

  <Teleport to="body">
    <div v-if="showUpgradeModal" class="modal-overlay" @click.self="showUpgradeModal = false">
      <div class="upgrade-modal">
        <div class="upgrade-modal-icon">
          <Sparkles :size="32" :stroke-width="1.5" />
        </div>
        <h3>AI Интервью доступно на платном тарифе</h3>
        <p>Перейдите на платный тариф, чтобы получить персонализированное AI интервью с адаптивными вопросами.</p>
        <button class="btn-primary" @click="router.push('/app/subscription'); showUpgradeModal = false">
          Посмотреть тарифы
        </button>
        <button class="btn-skip" @click="showUpgradeModal = false; goToDashboard()">
          Позже
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* === Base === */
.interview-root {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.interview-content {
  max-width: 540px;
  margin: 0 auto;
  padding: 40px 20px 60px;
}

/* === Screens === */
.screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.fade-in {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.screen-icon {
  margin-bottom: 16px;
  color: var(--primary-color);
}

h1 {
  font-size: 1.375rem;
  font-weight: 700;
  margin: 0 0 8px;
  line-height: 1.3;
  color: var(--text-primary);
}

h2 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--text-primary);
}

.screen-subtitle {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0 0 24px;
  line-height: 1.5;
}

/* === Idle screen === */
.info-cards {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: 13px;
  color: var(--text-secondary);
}

.info-card svg {
  color: var(--primary-color);
  flex-shrink: 0;
}

/* === Loading === */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 0;
}

.loading-spinner {
  color: var(--primary-color);
  margin-bottom: 8px;
}

.spin {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-text {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
}

.loading-progress-bar {
  width: 100%;
  max-width: 300px;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
}

.loading-progress-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 2px;
  transition: width 0.5s ease;
}

.loading-stats {
  display: flex;
  gap: 6px;
  font-size: 13px;
  color: var(--text-tertiary);
  margin-top: 8px;
}

.stats-divider {
  color: var(--border-color);
}

/* === Questions === */
.question-header {
  width: 100%;
  margin-bottom: 24px;
}

.scenario-counter {
  color: var(--primary-color);
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  text-align: center;
}

.question-progress-bar {
  width: 100%;
  height: 3px;
  background: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
}

.question-progress-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.question-card {
  width: 100%;
  margin-bottom: 24px;
  text-align: center;
}

.question-meta {
  margin-bottom: 12px;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border: 1px solid;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.question-icon-emoji {
  font-size: 14px;
}

.question-icon-solo {
  font-size: 32px;
  margin-bottom: 12px;
}

.question-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 8px;
  line-height: 1.4;
}

.question-description {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

/* === Options === */
.options-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.option-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  color: var(--text-primary);
  font-size: 15px;
  transition: all var(--transition-normal);
  width: 100%;
}

.option-card:hover {
  background: var(--primary-light);
  border-color: var(--primary-color);
}

.option-card.selected {
  background: var(--primary-light);
  border-color: var(--primary-color);
}

.option-radio {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition-normal);
}

.option-card.selected .option-radio {
  border-color: var(--primary-color);
}

.option-radio-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary-color);
}

.option-label {
  flex: 1;
  line-height: 1.4;
}

/* === Free text === */
.free-text-section {
  width: 100%;
  margin-bottom: 24px;
}

.free-text-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 56px;
  transition: border-color var(--transition-normal);
  box-sizing: border-box;
}

.free-text-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.free-text-input::placeholder {
  color: var(--text-tertiary);
}

/* === Navigation === */
.question-nav {
  display: flex;
  gap: 12px;
  width: 100%;
}

.btn-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-nav:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-prev {
  margin-right: auto;
}

.btn-next {
  margin-left: auto;
  background: var(--primary-light);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-submit {
  margin-left: auto;
  width: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
}

/* === Buttons === */
.btn-primary {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: var(--radius-lg);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary:hover { background: var(--primary-dark); }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-skip {
  background: none;
  border: none;
  color: var(--text-tertiary);
  padding: 12px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-skip:hover { color: var(--text-secondary); }

/* === Completed === */
.completed-icon {
  color: var(--success-color);
  margin-bottom: 16px;
}

/* === Sasha Card === */
.sasha-card {
  background: var(--primary-light);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  gap: 14px;
  text-align: left;
  width: 100%;
  margin-bottom: 24px;
}

.sasha-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  flex-shrink: 0;
}

.sasha-content { flex: 1; }
.sasha-name { font-size: 13px; font-weight: 600; color: var(--primary-color); margin-bottom: 6px; }
.sasha-content p {
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  color: var(--text-secondary);
  white-space: pre-line;
}

/* === Error === */
.error-icon {
  color: var(--danger-color);
  margin-bottom: 16px;
}

/* === Upgrade Modal === */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.upgrade-modal {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 32px 24px;
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.upgrade-modal-icon {
  color: var(--primary-color);
  margin-bottom: 16px;
}

.upgrade-modal h3 {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 12px;
}

.upgrade-modal p {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 24px;
}

/* === Results Screen === */
.results-screen {
  align-items: stretch;
  text-align: left;
}

.results-screen > .completed-icon,
.results-screen > h1,
.results-screen > .screen-subtitle {
  text-align: center;
  align-self: center;
}

.results-section {
  margin-bottom: 24px;
  width: 100%;
}

.results-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 12px;
  color: var(--text-primary);
}

.results-section-title svg {
  color: var(--primary-color);
  flex-shrink: 0;
}

.results-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0 0 12px;
}

.results-text-sm {
  font-size: 13px;
  margin-bottom: 12px;
}

/* Traits */
.traits-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.trait-badge {
  padding: 4px 12px;
  background: var(--primary-light);
  color: var(--primary-color);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
}

/* Insight Cards */
.insight-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  margin-bottom: 10px;
}

.insight-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.insight-area-badge {
  display: inline-flex;
  padding: 2px 10px;
  border: 1px solid;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.priority-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 600;
}

.priority-high {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

.insight-description {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0;
}

/* Focus */
.focus-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.focus-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  font-size: 14px;
  color: var(--text-primary);
}

.focus-number {
  width: 24px;
  height: 24px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

/* Goals */
.goals-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.goal-card {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.goal-card:hover:not(.goal-disabled) {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.goal-card.goal-selected {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.goal-card.goal-disabled {
  opacity: 0.7;
  cursor: default;
}

.goal-checkbox {
  flex-shrink: 0;
  color: var(--primary-color);
  padding-top: 2px;
}

.goal-checkbox-empty {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-radius: 50%;
}

.goal-info {
  flex: 1;
  min-width: 0;
}

.goal-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text-primary);
}

.goal-category-badge {
  display: inline-flex;
  padding: 2px 10px;
  border: 1px solid;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 6px;
}

.goal-why {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0 0 4px;
}

.goal-steps-count {
  font-size: 12px;
  color: var(--text-tertiary);
}

.goals-actions {
  margin-bottom: 16px;
}

.goals-created-success {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: var(--radius-lg);
  color: var(--success-color);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
}

.btn-dashboard {
  margin-top: 8px;
}

/* === Responsive === */
@media (max-width: 768px) {
  .interview-content {
    padding: 24px 16px 80px;
  }

  h1 {
    font-size: 1.25rem;
  }

  .info-cards {
    flex-direction: column;
    gap: 8px;
  }

  .question-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px 16px;
    padding-bottom: calc(12px + var(--safe-area-bottom, 0px));
    background: var(--bg-primary);
    border-top: 1px solid var(--border-color);
    z-index: 50;
  }

  .btn-submit {
    flex: 1;
  }
}
</style>
