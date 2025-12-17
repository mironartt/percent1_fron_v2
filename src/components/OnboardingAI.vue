<template>
  <div class="onboarding-overlay">
    <div class="onboarding-container" :class="{ 'wide': currentStep >= 2 }">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>

      <template v-else>
        <div class="progress-section">
          <div class="progress-steps">
            <div 
              v-for="(label, index) in stepLabels" 
              :key="index"
              class="progress-step-wrapper"
            >
              <div 
                class="progress-step"
                :class="{ 
                  active: currentStep === index + 1, 
                  completed: currentStep > index + 1 
                }"
              >
                <span class="step-number">{{ index + 1 }}</span>
              </div>
              <span 
                class="progress-label"
                :class="{ active: currentStep === index + 1 }"
              >{{ label }}</span>
            </div>
          </div>
        </div>

        <div v-if="currentStep === 1" class="step-content step-welcome">
          <div class="welcome-icon">
            <span class="icon-wrapper icon-wrapper-lg primary">
              <span class="one-percent-text">1%</span>
            </span>
          </div>
          <h1 class="step-title">Добро пожаловать в OnePercent</h1>
          <p class="step-subtitle">Система для развития навыка управления жизнью и доходом</p>

          <div class="survey-questions">
            <div class="survey-question">
              <label class="question-label">
                <Clock :size="18" />
                Сколько времени готовы уделять развитию?
              </label>
              <div class="options-row">
                <button 
                  v-for="time in timeOptions" 
                  :key="time.id"
                  class="option-btn compact"
                  :class="{ selected: surveyData.timeCommitment === time.id }"
                  @click="surveyData.timeCommitment = time.id"
                >
                  {{ time.label }}
                </button>
              </div>
            </div>
          </div>

          <button 
            class="btn btn-primary btn-lg"
            @click="nextStep"
            :disabled="!isStep1Valid"
          >
            Начать диагностику
            <ArrowRight :size="18" />
          </button>
        </div>

        <div v-if="currentStep === 2" class="step-content step-diagnosis">
          <h2 class="step-title">Оцените каждую сферу жизни</h2>
          <p class="step-subtitle">Перетащите ползунок, чтобы поставить оценку от 0 до 10</p>

          <div class="spheres-list">
            <div 
              v-for="sphere in localSpheres" 
              :key="sphere.id"
              class="sphere-rating-card"
              :style="{ '--sphere-color': getSphereColor(sphere.id) }"
            >
              <div class="sphere-header">
                <div class="sphere-icon">
                  <component :is="getSphereIcon(sphere.id)" :size="24" />
                </div>
                <div class="sphere-info">
                  <h3>{{ sphere.name }}</h3>
                  <p class="sphere-hint">{{ getSphereHint(sphere.id) }}</p>
                </div>
                <div class="sphere-score">{{ sphere.score }}</div>
              </div>
              <div class="slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  v-model.number="sphere.score"
                  class="sphere-slider"
                  :style="{ '--progress': (sphere.score / 10) * 100 + '%' }"
                />
                <div class="slider-labels">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <button class="btn btn-secondary" @click="prevStep">
              <ArrowLeft :size="18" />
              Назад
            </button>
            <button 
              class="btn btn-primary"
              @click="nextStep"
              :disabled="!isStep2Valid"
            >
              Посмотреть результат
              <ArrowRight :size="18" />
            </button>
          </div>
        </div>

        <div v-if="currentStep === 3" class="step-content step-wheel">
          <h2 class="step-title">Система сбалансированных показателей</h2>
          <p class="step-subtitle">Визуализация текущего состояния всех сфер жизни</p>

          <div class="wheel-section">
            <div class="wheel-container">
              <WheelOfLife :spheres="localSpheres" :readonly="true" />
            </div>
            <div class="wheel-stats">
              <div class="stat-card primary">
                <div class="stat-value">{{ averageScore.toFixed(1) }}</div>
                <div class="stat-label">Средний балл</div>
              </div>
              <div class="stat-card success" v-if="strongestSphere">
                <div class="stat-icon">
                  <component :is="getSphereIcon(strongestSphere.id)" :size="24" />
                </div>
                <div class="stat-info">
                  <div class="stat-value-sm">{{ strongestSphere.name }}</div>
                  <div class="stat-label">Сильная сторона</div>
                </div>
              </div>
              <div class="stat-card warning" v-if="weakestSphere">
                <div class="stat-icon">
                  <component :is="getSphereIcon(weakestSphere.id)" :size="24" />
                </div>
                <div class="stat-info">
                  <div class="stat-value-sm">{{ weakestSphere.name }}</div>
                  <div class="stat-label">Зона роста</div>
                </div>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <button class="btn btn-secondary" @click="prevStep">
              <ArrowLeft :size="18" />
              Назад
            </button>
            <button class="btn btn-primary" @click="nextStep">
              Получить анализ от AI
              <Bot :size="18" />
            </button>
          </div>
        </div>

        <div v-if="currentStep === 4" class="step-content step-analysis">
          <div class="ai-analysis-section">
            <div class="ai-header">
              <div class="ai-avatar">
                <Bot :size="32" />
              </div>
              <div class="ai-info">
                <h3>AI Ментор</h3>
                <span class="ai-status">
                  <span class="status-dot"></span>
                  {{ isAnalyzing ? 'Анализирует...' : 'Онлайн' }}
                </span>
              </div>
            </div>

            <div class="analysis-content">
              <div v-if="isAnalyzing" class="analyzing-state">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p>{{ aiTaskProgress.text || 'Анализирую ваши результаты...' }}</p>
                <div v-if="aiTaskProgress.percent > 0" class="progress-bar-wrapper">
                  <div class="progress-bar" :style="{ width: aiTaskProgress.percent + '%' }"></div>
                </div>
              </div>
              <div v-if="aiTaskError && !isAnalyzing" class="error-state">
                <AlertTriangle :size="24" />
                <p>{{ aiTaskError }}</p>
              </div>

              <div v-if="!isAnalyzing && aiAnalysis" class="ai-message">
                <div class="message-bubble">
                  <p v-html="aiAnalysis"></p>
                </div>
              </div>
            </div>

            <div class="insights-cards" v-if="!isAnalyzing">
              <div class="insight-card" v-for="insight in insights" :key="insight.id">
                <component :is="insight.icon" :size="20" class="insight-icon" />
                <div class="insight-content">
                  <h4>{{ insight.title }}</h4>
                  <p>{{ insight.text }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <button class="btn btn-secondary" @click="prevStep">
              <ArrowLeft :size="18" />
              Назад
            </button>
            <button class="btn btn-primary" @click="nextStep" :disabled="isAnalyzing">
              Получить план на 7 дней
              <Calendar :size="18" />
            </button>
          </div>
        </div>

        <div v-if="currentStep === 5" class="step-content step-plan">
          <div class="plan-header">
            <div class="plan-icon-wrapper">
              <Sparkles :size="24" class="plan-icon" />
            </div>
            <div class="plan-header-text">
              <h2 class="step-title">Ваши цели на старт</h2>
              <p class="step-subtitle">AI подготовил цели с шагами на основе анализа ССП. Утвердите или откажитесь от целей.</p>
            </div>
          </div>

          <div class="goals-status-summary">
            <div class="status-item accepted">
              <Check :size="14" />
              {{ acceptedGoalsCount }} принято
            </div>
            <div class="status-item pending">
              <Clock :size="14" />
              {{ pendingGoalsCount }} ожидает
            </div>
            <div class="status-item rejected">
              <X :size="14" />
              {{ rejectedGoalsCount }} пропущено
            </div>
          </div>

          <div class="goals-review-list">
            <div 
              v-for="goal in aiGoals" 
              :key="goal.id"
              class="goal-review-card"
              :class="{ 
                accepted: goal.status === 'accepted',
                rejected: goal.status === 'rejected',
                expanded: goal.expanded
              }"
              :style="{ '--goal-color': getSphereColor(goal.sphereId) }"
            >
              <div class="goal-review-header">
                <div class="goal-sphere-icon" :style="{ background: getSphereColor(goal.sphereId) }">
                  <component :is="getSphereIcon(goal.sphereId)" :size="18" />
                </div>
                <div class="goal-review-info" v-if="editingGoalId !== goal.id">
                  <h4>{{ goal.title }}</h4>
                  <p class="goal-description">{{ goal.description }}</p>
                  <div class="goal-meta">
                    <span class="goal-sphere-tag">{{ getSphereName(goal.sphereId) }}</span>
                    <span class="goal-steps-count">≡ {{ goal.steps.length }} шагов</span>
                  </div>
                </div>
                <div class="goal-edit-form" v-else>
                  <input 
                    type="text"
                    v-model="editingGoalData.title"
                    class="goal-edit-input"
                    placeholder="Название цели"
                    @keyup.enter="saveGoalEdit(goal)"
                    @keyup.escape="cancelEditGoal"
                  />
                  <textarea 
                    v-model="editingGoalData.description"
                    class="goal-edit-textarea"
                    placeholder="Описание (необязательно)"
                    rows="2"
                  ></textarea>
                  <div class="goal-edit-actions">
                    <button class="btn btn-sm btn-secondary" @click="cancelEditGoal">Отмена</button>
                    <button class="btn btn-sm btn-primary" @click="saveGoalEdit(goal)">Сохранить</button>
                  </div>
                </div>
              </div>

              <div class="goal-steps-toggle" @click="toggleGoalSteps(goal)">
                <component :is="goal.expanded ? ChevronUp : ChevronDown" :size="16" />
                {{ goal.expanded ? 'Скрыть шаги' : 'Показать шаги' }}
              </div>

              <div v-if="goal.expanded" class="goal-steps-list">
                <div 
                  v-for="(step, index) in goal.steps" 
                  :key="step.id"
                  class="goal-step-item"
                >
                  <span class="step-number">{{ index + 1 }}</span>
                  <span class="step-text">{{ step.title }}</span>
                </div>
              </div>

              <div class="goal-actions">
                <button 
                  class="goal-action-btn accept"
                  :class="{ active: goal.status === 'accepted' }"
                  @click="setGoalStatus(goal, 'accepted')"
                  title="Принять цель"
                >
                  <Check :size="18" />
                </button>
                <button 
                  class="goal-action-btn edit"
                  @click="editGoal(goal)"
                  title="Редактировать"
                >
                  <Pencil :size="18" />
                </button>
                <button 
                  class="goal-action-btn reject"
                  :class="{ active: goal.status === 'rejected' }"
                  @click="setGoalStatus(goal, 'rejected')"
                  title="Пропустить"
                >
                  <X :size="18" />
                </button>
              </div>
            </div>
          </div>

          <div class="step-actions final">
            <button class="btn btn-secondary" @click="skipAllGoals" :disabled="isSaving">
              Пропустить всё
            </button>
            <button 
              class="btn btn-primary btn-lg" 
              @click="completeOnboarding"
              :disabled="isSaving || acceptedGoalsCount === 0"
            >
              <Check :size="18" />
              {{ isSaving ? 'Сохранение...' : `Добавить цели (${acceptedGoalsCount})` }}
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { useAITasksStore } from '../stores/aiTasks'
import WheelOfLife from './WheelOfLife.vue'
import { DEBUG_MODE, SKIP_AUTH_CHECK } from '@/config/settings.js'
import * as api from '@/services/api.js'
import {
  Sparkles, Target, Clock, ArrowRight, ArrowLeft,
  Bot, Calendar, Rocket, CheckCircle, TrendingUp,
  Briefcase, Heart, Dumbbell, Users, Palette, Wallet,
  Lightbulb, AlertTriangle, Zap, ListTodo,
  Check, Pencil, X, ChevronDown, ChevronUp
} from 'lucide-vue-next'

const router = useRouter()
const store = useAppStore()
const aiTasksStore = useAITasksStore()

const currentStep = ref(1)
const totalSteps = 5
const stepLabels = ['Знакомство', 'Диагностика', 'Результат', 'Анализ', 'План']
const isLoading = ref(false)
const isAnalyzing = ref(false)
const aiTaskProgress = ref({ percent: 0, text: '' })
const aiTaskError = ref(null)

const categoryBackendToFrontend = {
  'welfare': 'wealth',
  'hobby': 'hobbies',
  'environment': 'friendship',
  'health_sport': 'health',
  'health': 'health',
  'work': 'career',
  'family': 'love'
}

const surveyData = ref({
  timeCommitment: null
})

const timeOptions = [
  { id: '15_mins', label: '15 мин/день' },
  { id: '30_mins', label: '30 мин/день' },
  { id: '1_hour', label: '1 час/день' },
  { id: 'something', label: 'По возможности' }
]

const localSpheres = ref([
  { id: 'wealth', name: 'Благосостояние', score: 5 },
  { id: 'hobbies', name: 'Хобби и отдых', score: 5 },
  { id: 'friendship', name: 'Дружба и окружение', score: 5 },
  { id: 'health', name: 'Здоровье и спорт', score: 5 },
  { id: 'career', name: 'Работа и карьера', score: 5 },
  { id: 'love', name: 'Любовь, семья, отношения', score: 5 }
])

const sphereIcons = {
  wealth: Wallet,
  hobbies: Palette,
  friendship: Users,
  health: Dumbbell,
  career: Briefcase,
  love: Heart
}

const sphereColors = {
  wealth: '#10b981',
  hobbies: '#f59e0b',
  friendship: '#8b5cf6',
  health: '#ef4444',
  career: '#3b82f6',
  love: '#ec4899'
}

const sphereHints = {
  wealth: 'Финансы, сбережения, материальная стабильность',
  hobbies: 'Увлечения, отдых, творчество, путешествия',
  friendship: 'Друзья, социальные связи, нетворкинг',
  health: 'Физическое здоровье, спорт, питание, сон',
  career: 'Работа, профессия, развитие, достижения',
  love: 'Партнёр, дети, близкие родственники'
}

const sphereIdToBackend = {
  wealth: 'welfare',
  hobbies: 'hobby',
  friendship: 'environment',
  health: 'health_sport',
  career: 'work',
  love: 'family'
}

const isSaving = ref(false)

function getSphereIcon(id) {
  return sphereIcons[id] || Target
}

function getSphereColor(id) {
  return sphereColors[id] || '#6b7280'
}

function getSphereHint(id) {
  return sphereHints[id] || ''
}

function getSphereName(id) {
  const sphere = localSpheres.value.find(s => s.id === id)
  return sphere ? sphere.name : ''
}

const isStep1Valid = computed(() => {
  return surveyData.value.timeCommitment !== null
})

const isStep2Valid = computed(() => {
  return localSpheres.value.some(s => s.score > 0)
})

const averageScore = computed(() => {
  const total = localSpheres.value.reduce((sum, s) => sum + s.score, 0)
  return total / localSpheres.value.length
})

const strongestSphere = computed(() => {
  return [...localSpheres.value].sort((a, b) => b.score - a.score)[0]
})

const weakestSphere = computed(() => {
  return [...localSpheres.value].sort((a, b) => a.score - b.score)[0]
})

const weakSpheres = computed(() => {
  return localSpheres.value
    .filter(s => s.score <= 5)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
})

const weakSpheresCount = computed(() => weakSpheres.value.length)

const aiAnalysis = ref('')
const insights = ref([])

const aiGoals = ref([])

const acceptedGoalsCount = computed(() => 
  aiGoals.value.filter(g => g.status === 'accepted').length
)

const pendingGoalsCount = computed(() => 
  aiGoals.value.filter(g => g.status === 'pending').length
)

const rejectedGoalsCount = computed(() => 
  aiGoals.value.filter(g => g.status === 'rejected').length
)

function setGoalStatus(goal, status) {
  goal.status = goal.status === status ? 'pending' : status
}

function toggleGoalSteps(goal) {
  goal.expanded = !goal.expanded
}

const editingGoalId = ref(null)
const editingGoalData = ref({ title: '', description: '' })

function editGoal(goal) {
  if (DEBUG_MODE) {
    console.log('[OnboardingAI] Edit goal:', goal)
  }
  editingGoalId.value = goal.id
  editingGoalData.value = {
    title: goal.title,
    description: goal.description || ''
  }
}

function cancelEditGoal() {
  editingGoalId.value = null
  editingGoalData.value = { title: '', description: '' }
}

function saveGoalEdit(goal) {
  if (editingGoalData.value.title.trim()) {
    goal.title = editingGoalData.value.title.trim()
    goal.description = editingGoalData.value.description.trim()
    if (DEBUG_MODE) {
      console.log('[OnboardingAI] Goal updated:', goal)
    }
  }
  cancelEditGoal()
}

function skipAllGoals() {
  aiGoals.value.forEach(goal => {
    goal.status = 'rejected'
  })
  completeOnboarding()
}

async function generateAIAnalysis() {
  isAnalyzing.value = true
  aiTaskError.value = null
  aiTaskProgress.value = { percent: 0, text: 'Запуск анализа...' }
  
  try {
    const result = await aiTasksStore.startTaskAndWait('onboarding_generate_goals', {}, 120000)
    
    if (DEBUG_MODE) {
      console.log('[OnboardingAI] AI task completed:', result)
    }
    
    handleAITaskCompleted(result)
    
  } catch (error) {
    if (DEBUG_MODE) {
      console.error('[OnboardingAI] Failed AI task:', error)
    }
    aiTaskError.value = error.message
    generateFallbackAnalysis()
  }
}

function generateFallbackAnalysis() {
  const weak = weakestSphere.value
  const strong = strongestSphere.value
  const avg = averageScore.value
  
  aiAnalysis.value = `
    <strong>Отличная работа!</strong> Вы честно оценили свою жизнь — это первый шаг к изменениям.<br><br>
    
    Ваш средний балл <strong>${avg.toFixed(1)}/10</strong> показывает ${avg >= 7 ? 'хороший уровень баланса' : avg >= 5 ? 'есть пространство для роста' : 'серьёзный потенциал улучшений'}.<br><br>
    
    <strong>${strong.name}</strong> (${strong.score}/10) — ваша сильная сторона. Используйте этот ресурс для развития других сфер.<br><br>
    
    <strong>${weak.name}</strong> (${weak.score}/10) — главная зона роста. Рекомендую начать с небольших ежедневных действий в этой области.
  `
  
  insights.value = [
    {
      id: 1,
      icon: Lightbulb,
      title: 'Ключевой инсайт',
      text: `Фокус на "${weak.name}" даст максимальный эффект на общий баланс`
    },
    {
      id: 2,
      icon: Zap,
      title: 'Быстрая победа',
      text: `Уделяйте 15 минут в день на "${weak.name}" — за неделю увидите прогресс`
    },
    {
      id: 3,
      icon: TrendingUp,
      title: 'Стратегия роста',
      text: `Используйте силу "${strong.name}" как мотивацию для развития слабых сфер`
    }
  ]
  
  isAnalyzing.value = false
  generateFallbackGoals()
}

watch(() => aiTasksStore.getTaskProgress('onboarding_generate_goals'), (progress) => {
  if (progress) {
    aiTaskProgress.value = progress
  }
}, { deep: true })

watch(() => aiTasksStore.activeTasks, (tasks) => {
  const task = tasks.find(t => t.task_type === 'onboarding_generate_goals')
  
  if (task) {
    if (task.status === 'completed' && task.result) {
      handleAITaskCompleted(task.result)
    } else if (task.status === 'failed') {
      if (DEBUG_MODE) {
        console.error('[OnboardingAI] AI task failed:', task.error)
      }
      aiTaskError.value = task.error?.message || 'Ошибка генерации'
      generateFallbackAnalysis()
    }
  }
}, { deep: true })

function handleAITaskCompleted(result) {
  if (DEBUG_MODE) {
    console.log('[OnboardingAI] AI task completed:', result)
  }
  
  const weak = weakestSphere.value
  const strong = strongestSphere.value
  const avg = averageScore.value
  
  aiAnalysis.value = `
    <strong>Отличная работа!</strong> Вы честно оценили свою жизнь — это первый шаг к изменениям.<br><br>
    
    Ваш средний балл <strong>${avg.toFixed(1)}/10</strong> показывает ${avg >= 7 ? 'хороший уровень баланса' : avg >= 5 ? 'есть пространство для роста' : 'серьёзный потенциал улучшений'}.<br><br>
    
    <strong>${strong.name}</strong> (${strong.score}/10) — ваша сильная сторона. Используйте этот ресурс для развития других сфер.<br><br>
    
    <strong>${weak.name}</strong> (${weak.score}/10) — главная зона роста. Рекомендую начать с небольших ежедневных действий в этой области.
  `
  
  insights.value = [
    {
      id: 1,
      icon: Lightbulb,
      title: 'Ключевой инсайт',
      text: `Фокус на "${weak.name}" даст максимальный эффект на общий баланс`
    },
    {
      id: 2,
      icon: Zap,
      title: 'Быстрая победа',
      text: `Уделяйте 15 минут в день на "${weak.name}" — за неделю увидите прогресс`
    },
    {
      id: 3,
      icon: TrendingUp,
      title: 'Стратегия роста',
      text: `Используйте силу "${strong.name}" как мотивацию для развития слабых сфер`
    }
  ]
  
  isAnalyzing.value = false
  
  if (result.goals && result.goals.length > 0) {
    processAIGoals(result.goals)
  } else {
    generateFallbackGoals()
  }
}

function processAIGoals(goals) {
  const generatedGoals = goals.map((goal, index) => {
    const frontendCategory = categoryBackendToFrontend[goal.category] || goal.category
    
    return {
      id: `ai-goal-${frontendCategory}-${Date.now()}-${index}`,
      sphereId: frontendCategory,
      title: goal.title,
      description: goal.description || '',
      whyImportant: goal.why_important || '',
      status: 'pending',
      expanded: false,
      steps: (goal.steps || []).map((step, stepIndex) => ({
        id: `step-${Date.now()}-${index}-${stepIndex}`,
        title: step.title,
        description: step.description || '',
        order: stepIndex + 1
      }))
    }
  })
  
  aiGoals.value = generatedGoals
  
  if (DEBUG_MODE) {
    console.log('[OnboardingAI] Processed AI goals:', generatedGoals)
  }
}

function generateFallbackGoals() {
  const goalTemplates = {
    wealth: {
      title: 'Улучшить финансовое положение',
      description: 'Начать осознанно управлять деньгами и создать финансовую подушку',
      whyImportant: 'Финансовая стабильность даёт свободу выбора и снижает стресс',
      steps: [
        { title: 'Записать все источники дохода и расходы за месяц' },
        { title: 'Определить 3 категории расходов для оптимизации' },
        { title: 'Открыть накопительный счёт и настроить автоперевод' },
        { title: 'Изучить основы инвестирования (1 статья/видео)' },
        { title: 'Составить бюджет на следующий месяц' }
      ]
    },
    hobbies: {
      title: 'Развить творческое хобби',
      description: 'Регулярно уделять время любимому занятию для отдыха и самовыражения',
      whyImportant: 'Хобби наполняет энергией и помогает справляться со стрессом',
      steps: [
        { title: 'Выбрать одно хобби для развития на ближайший месяц' },
        { title: 'Выделить 30 минут 3 раза в неделю на занятие' },
        { title: 'Найти онлайн-сообщество или курс по теме' },
        { title: 'Попробовать что-то новое в рамках хобби' },
        { title: 'Поделиться результатами с друзьями или в соцсетях' }
      ]
    },
    friendship: {
      title: 'Укрепить дружеские связи',
      description: 'Поддерживать регулярное общение с важными людьми',
      whyImportant: 'Крепкие социальные связи повышают качество жизни и поддержку',
      steps: [
        { title: 'Составить список 5 важных друзей' },
        { title: 'Написать или позвонить одному другу на этой неделе' },
        { title: 'Запланировать встречу с другом на ближайшие 2 недели' },
        { title: 'Познакомиться с новым человеком (коллега, сосед)' },
        { title: 'Организовать небольшую встречу с друзьями' }
      ]
    },
    health: {
      title: 'Улучшить физическое здоровье',
      description: 'Внедрить простые привычки для поддержания энергии и здоровья',
      whyImportant: 'Здоровье — фундамент для всех достижений в жизни',
      steps: [
        { title: 'Начать делать 10-минутную зарядку каждое утро' },
        { title: 'Выпивать 8 стаканов воды в день' },
        { title: 'Добавить 20-минутную прогулку в распорядок дня' },
        { title: 'Лечь спать на 30 минут раньше обычного' },
        { title: 'Заменить один нездоровый перекус на полезный' }
      ]
    },
    career: {
      title: 'Развить профессиональные навыки',
      description: 'Инвестировать в карьерный рост и новые компетенции',
      whyImportant: 'Профессиональный рост открывает новые возможности',
      steps: [
        { title: 'Определить 1-2 навыка для развития' },
        { title: 'Найти онлайн-курс или книгу по теме' },
        { title: 'Уделять 20 минут в день на обучение' },
        { title: 'Применить новый навык в работе' },
        { title: 'Запросить обратную связь от коллег или руководителя' }
      ]
    },
    love: {
      title: 'Укрепить семейные отношения',
      description: 'Уделять качественное время близким людям',
      whyImportant: 'Крепкая семья даёт поддержку и чувство принадлежности',
      steps: [
        { title: 'Провести вечер вместе без гаджетов' },
        { title: 'Сказать близким, за что вы их цените' },
        { title: 'Организовать совместный ужин или прогулку' },
        { title: 'Помочь близкому с его задачей или проблемой' },
        { title: 'Спланировать совместное мероприятие на выходные' }
      ]
    }
  }
  
  const generatedGoals = []
  
  weakSpheres.value.slice(0, 3).forEach((sphere, index) => {
    const template = goalTemplates[sphere.id]
    if (template) {
      generatedGoals.push({
        id: `ai-goal-${sphere.id}-${Date.now()}-${index}`,
        sphereId: sphere.id,
        title: template.title,
        description: template.description,
        whyImportant: template.whyImportant,
        status: 'pending',
        expanded: false,
        steps: template.steps.map((step, stepIndex) => ({
          id: `step-${Date.now()}-${index}-${stepIndex}`,
          title: step.title,
          order: stepIndex + 1
        }))
      })
    }
  })
  
  aiGoals.value = generatedGoals
}

async function nextStep() {
  if (currentStep.value < totalSteps) {
    const fromStep = currentStep.value
    
    if (fromStep === 1 && !SKIP_AUTH_CHECK) {
      await saveHowManyTime()
    }
    
    if (fromStep === 2 && !SKIP_AUTH_CHECK) {
      await saveSSPData()
    }
    
    currentStep.value++
    
    if (currentStep.value === 4) {
      generateAIAnalysis()
    }
    
  }
}

async function saveHowManyTime() {
  if (!surveyData.value.timeCommitment) return
  
  isSaving.value = true
  try {
    const result = await api.updateOnboardingData({
      how_many_time: surveyData.value.timeCommitment,
      step_completed: 1
    })
    
    if (DEBUG_MODE) {
      console.log('[OnboardingAI] Saved how_many_time:', surveyData.value.timeCommitment, result)
    }
  } catch (error) {
    console.error('[OnboardingAI] Failed to save how_many_time:', error)
  } finally {
    isSaving.value = false
  }
}

async function saveSSPData() {
  isSaving.value = true
  try {
    const categoriesData = localSpheres.value.map(sphere => ({
      category: sphereIdToBackend[sphere.id],
      rating: sphere.score
    }))
    
    const result = await api.updateSSPData({
      categories_reflection_data: categoriesData
    })
    
    if (DEBUG_MODE) {
      console.log('[OnboardingAI] Saved SSP data:', categoriesData, result)
    }
    
    await api.updateOnboardingData({
      step_completed: 2
    })
  } catch (error) {
    console.error('[OnboardingAI] Failed to save SSP data:', error)
  } finally {
    isSaving.value = false
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

async function completeOnboarding() {
  isSaving.value = true
  
  if (DEBUG_MODE) {
    console.log('[OnboardingAI] Saving sphere ratings to store...')
  }
  
  localSpheres.value.forEach(sphere => {
    store.updateSphere(sphere.id, { score: sphere.score })
    if (DEBUG_MODE) {
      console.log(`[OnboardingAI] Updated sphere ${sphere.id}: ${sphere.score}`)
    }
  })
  
  const acceptedGoals = aiGoals.value.filter(g => g.status === 'accepted')
  
  if (!SKIP_AUTH_CHECK && acceptedGoals.length > 0) {
    try {
      const createdGoalIds = await createGoalsOnBackend(acceptedGoals)
      
      if (createdGoalIds.length > 0) {
        await createStepsOnBackend(acceptedGoals, createdGoalIds)
      }
      
      if (DEBUG_MODE) {
        console.log('[OnboardingAI] Goals and steps created on backend:', createdGoalIds)
      }
    } catch (error) {
      console.error('[OnboardingAI] Failed to create goals on backend:', error)
    }
  }
  
  const onboardingData = {
    reason_joined: surveyData.value.reason,
    desired_changes: surveyData.value.desiredChanges,
    growth_comfort_zones: surveyData.value.growthZones,
    current_state: surveyData.value.currentState,
    goal_state: surveyData.value.goalState,
    why_important: surveyData.value.whyImportant
  }
  
  if (!SKIP_AUTH_CHECK) {
    try {
      await store.completeOnboardingWithBackend(onboardingData)
      if (DEBUG_MODE) {
        console.log('[OnboardingAI] Onboarding saved to backend successfully')
      }
    } catch (error) {
      console.error('[OnboardingAI] Failed to save onboarding to backend:', error)
      store.setUserFinishOnboarding(true)
      if (DEBUG_MODE) {
        console.log('[OnboardingAI] Set finish_onboarding locally to prevent loop')
      }
    }
  } else {
    if (DEBUG_MODE) {
      console.log('[OnboardingAI] Backend save skipped (SKIP_AUTH_CHECK=true)')
    }
  }
  
  store.completeOnboarding({
    surveyData: surveyData.value,
    sphereRatings: localSpheres.value.map(s => ({ id: s.id, score: s.score })),
    aiGoals: acceptedGoals,
    completedAt: new Date().toISOString()
  })
  
  store.initAIRecommendations(acceptedGoals, { skipShowModal: true })
  
  store.completeFirstStep('ssp')
  store.completeFirstStep('chat_mentor')
  
  // Загрузить свежие данные для Dashboard после онбординга
  try {
    const userDataResult = await api.getUserData()
    if (userDataResult.status === 'ok' && userDataResult.data) {
      store.setUser(userDataResult.data)
      if (DEBUG_MODE) {
        console.log('[OnboardingAI] Dashboard data refreshed after onboarding')
      }
    }
  } catch (error) {
    console.error('[OnboardingAI] Failed to refresh dashboard data:', error)
  }
  
  isSaving.value = false
  
  if (DEBUG_MODE) {
    console.log('[OnboardingAI] Completed, navigating to dashboard with AI goals review')
  }
  
  router.push('/app')
}

async function createGoalsOnBackend(acceptedGoals) {
  const goalsData = acceptedGoals.map(goal => ({
    goal_id: null,
    title: goal.title,
    category: sphereIdToBackend[goal.sphereId],
    score: 'true',
    status: 'work',
    why_important: goal.whyImportant || '',
    why_give_me: '',
    why_about_me: ''
  }))
  
  if (DEBUG_MODE) {
    console.log('[OnboardingAI] Creating goals:', goalsData)
  }
  
  const result = await api.updateGoals({ goals_data: goalsData })
  
  if (DEBUG_MODE) {
    console.log('[OnboardingAI] Create goals response:', result)
  }
  
  if (result.status === 'ok') {
    let createdIds = result.data?.created_goals_ids
    if (!createdIds && result.data?.goals_data) {
      createdIds = result.data.goals_data.map(g => g.goal_id).filter(id => id != null)
    }
    if (createdIds && createdIds.length > 0) {
      if (DEBUG_MODE) {
        console.log('[OnboardingAI] Created goal IDs:', createdIds)
      }
      return createdIds
    }
  }
  
  if (result.status === 'error') {
    console.error('[OnboardingAI] Failed to create goals:', result.error_data)
    throw new Error(result.error_data?.message || 'Failed to create goals')
  }
  
  return []
}

async function createStepsOnBackend(acceptedGoals, goalIds) {
  if (!goalIds || goalIds.length === 0) {
    console.warn('[OnboardingAI] No goal IDs provided for creating steps')
    return
  }
  
  const stepsData = []
  
  acceptedGoals.forEach((goal, goalIndex) => {
    const backendGoalId = goalIds[goalIndex]
    if (!backendGoalId) {
      console.warn(`[OnboardingAI] No backend ID for goal index ${goalIndex}`)
      return
    }
    
    goal.steps.forEach((step, stepIndex) => {
      stepsData.push({
        goal_id: backendGoalId,
        step_id: null,
        title: step.title,
        order: stepIndex + 1
      })
    })
  })
  
  if (stepsData.length === 0) {
    console.warn('[OnboardingAI] No steps to create')
    return
  }
  
  if (DEBUG_MODE) {
    console.log('[OnboardingAI] Creating steps:', stepsData)
  }
  
  const result = await api.updateGoalSteps({ goals_steps_data: stepsData })
  
  if (DEBUG_MODE) {
    console.log('[OnboardingAI] Create steps response:', result)
  }
  
  if (result.status === 'error') {
    console.error('[OnboardingAI] Failed to create steps:', result.error_data)
  }
}
</script>

<style scoped>
.onboarding-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-color);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem;
  overflow-y: auto;
}

.onboarding-container {
  width: 100%;
  max-width: 600px;
  background: var(--card-bg);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
  transition: max-width 0.3s ease;
}

.onboarding-container.wide {
  max-width: 900px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.progress-section {
  margin-bottom: 2rem;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.progress-steps::before {
  content: '';
  position: absolute;
  top: 16px;
  left: 32px;
  right: 32px;
  height: 2px;
  background: var(--border-color);
  z-index: 0;
}

.progress-step-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.progress-step {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-secondary);
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.progress-step.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.progress-step.completed {
  background: var(--success-color, #10b981);
  border-color: var(--success-color, #10b981);
  color: white;
}

.progress-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-align: center;
  white-space: nowrap;
}

.progress-label.active {
  color: var(--primary-color);
  font-weight: 600;
}

.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-align: center;
}

.step-subtitle {
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 2rem;
}

.welcome-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.icon-wrapper-lg {
  width: 80px;
  height: 80px;
}

.icon-wrapper.primary {
  background: linear-gradient(135deg, var(--primary-color), #a78bfa);
  color: white;
}

.one-percent-text {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -1px;
}

.survey-questions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.survey-question .question-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.options-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-btn:hover {
  border-color: var(--primary-color);
  background: var(--bg-color);
}

.option-btn.selected {
  border-color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 10%, transparent);
  color: var(--primary-color);
}

.option-btn.compact {
  padding: 0.625rem 1rem;
  flex: 1;
  justify-content: center;
  min-width: fit-content;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-secondary {
  background: var(--bg-color);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--border-color);
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  width: 100%;
}

.step-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.step-actions .btn-primary {
  flex: 1;
}

.step-actions.final {
  flex-direction: column;
}

.step-actions.final .btn-lg {
  order: -1;
}

.spheres-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (max-width: 768px) {
  .spheres-list {
    grid-template-columns: 1fr;
  }
}

.sphere-rating-card {
  background: var(--bg-color);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid var(--border-color);
}

.sphere-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.sphere-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--sphere-color) 15%, transparent);
  color: var(--sphere-color);
}

.sphere-info {
  flex: 1;
}

.sphere-info h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.sphere-hint {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0;
}

.sphere-score {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--sphere-color);
  min-width: 40px;
  text-align: center;
}

.slider-container {
  position: relative;
}

.sphere-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: var(--border-color);
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  background: linear-gradient(to right, var(--sphere-color) var(--progress), var(--border-color) var(--progress));
}

.sphere-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--sphere-color);
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  cursor: grab;
}

.sphere-slider::-webkit-slider-thumb:active {
  cursor: grabbing;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.wheel-section {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 1.5rem;
  align-items: center;
  margin-bottom: 2rem;
}

.wheel-container {
  display: flex;
  justify-content: center;
  transform: scale(0.95);
  transform-origin: center;
}

.wheel-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-card {
  background: var(--bg-color);
  border-radius: 12px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stat-card.primary {
  background: linear-gradient(135deg, var(--primary-color), #a78bfa);
  color: white;
  flex-direction: column;
  text-align: center;
  padding: 1rem;
}

.stat-card.primary .stat-value {
  font-size: 2rem;
  font-weight: 700;
}

.stat-card.success {
  border: 1px solid var(--success-color, #10b981);
}

.stat-card.success .stat-icon {
  color: var(--success-color, #10b981);
}

.stat-card.warning {
  border: 1px solid var(--warning-color, #f59e0b);
}

.stat-card.warning .stat-icon {
  color: var(--warning-color, #f59e0b);
}

.stat-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-bg);
  border-radius: 10px;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value-sm {
  font-weight: 600;
  font-size: 0.9rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.stat-card.primary .stat-label {
  color: rgba(255,255,255,0.8);
}

.ai-analysis-section {
  background: var(--bg-color);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.ai-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.ai-avatar {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--primary-color), #a78bfa);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-info h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.ai-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--success-color, #10b981);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success-color, #10b981);
}

.analyzing-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  gap: 1rem;
}

.typing-indicator {
  display: flex;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-color);
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.message-bubble {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 1.25rem;
  line-height: 1.6;
}

.insights-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.insight-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.insight-icon {
  color: var(--primary-color);
  flex-shrink: 0;
}

.insight-content h4 {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.insight-content p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0;
}

.plan-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.plan-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--primary-color), #a78bfa);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.75rem;
}

.weekly-plan {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.plan-task {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-color);
  border-radius: 10px;
  border-left: 4px solid var(--task-color);
}

.task-day {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--task-color);
  min-width: 32px;
}

.task-content {
  flex: 1;
}

.task-sphere {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--task-color);
  margin-bottom: 0.25rem;
}

.task-content h4 {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.task-content p {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0;
}

.task-time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.plan-summary {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;
  background: var(--bg-color);
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.text-success {
  color: var(--success-color, #10b981);
}

.text-primary {
  color: var(--primary-color);
}

.goals-preview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.goal-preview-card {
  background: var(--bg-color);
  border-radius: 12px;
  border-left: 4px solid var(--goal-color);
  padding: 1rem;
}

.goal-preview-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.goal-sphere-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.goal-preview-info {
  flex: 1;
}

.goal-sphere-name {
  font-size: 0.75rem;
  color: var(--goal-color);
  font-weight: 500;
}

.goal-preview-info h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0.25rem 0 0 0;
}

.goal-steps-preview {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 0.75rem;
}

.steps-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.steps-list-mini {
  list-style: none;
  padding: 0;
  margin: 0;
}

.steps-list-mini li {
  font-size: 0.85rem;
  padding: 0.25rem 0;
  padding-left: 1rem;
  position: relative;
  color: var(--text-primary);
}

.steps-list-mini li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--goal-color);
}

.steps-list-mini li.more-steps {
  color: var(--text-secondary);
  font-style: italic;
}

.steps-list-mini li.more-steps::before {
  content: '';
}

.steps-list-mini li.more-steps.clickable {
  cursor: pointer;
  transition: color 0.2s ease;
}

.steps-list-mini li.more-steps.clickable:hover {
  color: var(--primary-color);
  text-decoration: underline;
}

.plan-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary-color), #a78bfa);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
}

.plan-header {
  display: flex;
  align-items: flex-start;
  text-align: left;
  margin-bottom: 1.5rem;
}

.plan-header-text .step-title {
  text-align: left;
  margin-bottom: 0.25rem;
  font-size: 1.5rem;
}

.plan-header-text .step-subtitle {
  text-align: left;
  margin-bottom: 0;
  font-size: 0.9rem;
}

.goals-status-summary {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.status-item.accepted {
  color: var(--success-color, #10b981);
}

.status-item.rejected {
  color: var(--text-muted, #9ca3af);
}

.goals-review-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.goal-review-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-left: 4px solid var(--goal-color);
  transition: all 0.2s ease;
}

.goal-review-card.accepted {
  border-color: var(--success-color, #10b981);
  background: color-mix(in srgb, var(--success-color, #10b981) 5%, var(--card-bg));
}

.goal-review-card.rejected {
  opacity: 0.6;
  border-left-color: var(--text-muted, #9ca3af);
}

.goal-review-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.goal-review-info {
  flex: 1;
  min-width: 0;
}

.goal-review-info h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
}

.goal-description {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.goal-edit-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.goal-edit-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  background: var(--bg-color);
  color: var(--text-primary);
}

.goal-edit-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.15);
}

.goal-edit-textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.85rem;
  background: var(--bg-color);
  color: var(--text-primary);
  resize: vertical;
  min-height: 50px;
}

.goal-edit-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.goal-edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.goal-edit-actions .btn-sm {
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
}

.goal-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.goal-sphere-tag {
  font-size: 0.75rem;
  color: var(--goal-color);
  font-weight: 500;
}

.goal-steps-count {
  font-size: 0.75rem;
  color: var(--text-muted, #9ca3af);
}

.goal-steps-toggle {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
  padding: 0.5rem 0;
  cursor: pointer;
  transition: color 0.2s ease;
}

.goal-steps-toggle:hover {
  color: var(--primary-color);
}

.goal-steps-list {
  background: var(--bg-color);
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
}

.goal-step-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.goal-step-item:not(:last-child) {
  border-bottom: 1px solid var(--border-color);
}

.goal-step-item .step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.goal-step-item .step-text {
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--text-primary);
  text-align: left;
}

.goal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
}

.goal-action-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.goal-action-btn:hover {
  border-color: var(--text-muted);
  background: var(--bg-color);
}

.goal-action-btn.accept:hover,
.goal-action-btn.accept.active {
  border-color: var(--success-color, #10b981);
  background: var(--success-color, #10b981);
  color: white;
}

.goal-action-btn.edit:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.goal-action-btn.reject:hover,
.goal-action-btn.reject.active {
  border-color: var(--text-muted, #9ca3af);
  background: var(--text-muted, #9ca3af);
  color: white;
}

.step-actions.final {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .onboarding-container {
    padding: 1.5rem;
    border-radius: 16px;
    overflow: hidden;
  }
  
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .wheel-section {
    grid-template-columns: 1fr;
    overflow: hidden;
  }
  
  .wheel-container {
    transform: scale(1);
    transform-origin: center;
    width: calc(100% + 2rem);
    max-width: none;
    margin: 0 -1rem;
  }
  
  .progress-labels {
    display: none;
  }
  
  .progress-step-wrapper {
    min-width: 0;
  }
  
  .progress-label {
    font-size: 0.65rem;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .step-actions {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }
  
  .btn {
    font-size: 0.9rem;
    padding: 0.75rem 1rem;
  }
  
  .btn-lg {
    padding: 0.85rem 1.25rem;
  }
  
  .step-actions .btn {
    width: 100%;
    justify-content: center;
  }
  
  .step-actions .btn-primary {
    flex: none;
  }
  
  .wheel-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
  
  .stat-card {
    padding: 0.75rem;
    border-radius: 12px;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
  }
  
  .stat-card.primary {
    display: none;
  }
  
  .stat-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
  }
  
  .stat-value-sm {
    font-size: 0.8rem;
    word-break: normal;
    line-height: 1.3;
  }
  
  .stat-label {
    font-size: 0.65rem;
  }
  
  .stat-info {
    min-width: 0;
    overflow: visible;
  }
  
  /* Страница Анализ - мобильная оптимизация */
  .ai-analysis-section {
    padding: 1rem;
    border-radius: 16px;
    margin-bottom: 1rem;
  }
  
  .ai-header {
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .ai-avatar {
    width: 40px;
    height: 40px;
    border-radius: 12px;
  }
  
  .ai-avatar svg {
    width: 20px;
    height: 20px;
  }
  
  .ai-info h3 {
    font-size: 0.95rem;
  }
  
  .ai-status {
    font-size: 0.75rem;
  }
  
  .message-bubble {
    padding: 1rem;
    border-radius: 12px;
    font-size: 0.9rem;
  }
  
  .insights-cards {
    gap: 0.5rem;
    margin-top: 1rem;
  }
  
  .insight-card {
    padding: 0.75rem;
    gap: 0.75rem;
    border-radius: 10px;
  }
  
  .insight-icon {
    width: 18px;
    height: 18px;
  }
  
  .insight-content h4 {
    font-size: 0.8rem;
  }
  
  .insight-content p {
    font-size: 0.75rem;
  }
  
  /* Страница План - мобильная оптимизация */
  .plan-header {
    margin-bottom: 1rem;
  }
  
  .plan-icon {
    display: none;
  }
  
  .step-plan .step-title {
    font-size: 1.4rem;
  }
  
  .step-plan .step-subtitle {
    font-size: 0.85rem;
    margin-bottom: 1rem;
  }
  
  .goals-preview {
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .goal-preview-card {
    padding: 0.75rem;
    border-radius: 10px;
  }
  
  .goal-preview-header {
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  .goal-sphere-icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
  }
  
  .goal-sphere-icon svg {
    width: 14px;
    height: 14px;
  }
  
  .goal-sphere-name {
    font-size: 0.7rem;
  }
  
  .goal-preview-info h4 {
    font-size: 0.85rem;
    margin-top: 0.15rem;
  }
  
  .goal-steps-preview {
    padding: 0.5rem;
    border-radius: 6px;
  }
  
  .steps-label {
    font-size: 0.7rem;
    gap: 0.35rem;
    margin-bottom: 0.35rem;
  }
  
  .steps-list-mini li {
    font-size: 0.75rem;
    padding: 0.15rem 0;
    padding-left: 0.75rem;
  }
  
  .plan-summary {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .summary-item {
    font-size: 0.8rem;
    gap: 0.35rem;
    justify-content: center;
  }
  
  .summary-item svg {
    width: 16px;
    height: 16px;
  }
  
  .goal-steps-list {
    padding: 0.5rem;
  }
  
  .goal-step-item {
    gap: 0.5rem;
    padding: 0.4rem 0;
  }
  
  .goal-step-item .step-number {
    width: 20px;
    height: 20px;
    font-size: 0.65rem;
  }
  
  .goal-step-item .step-text {
    font-size: 0.8rem;
    line-height: 1.3;
  }
}
</style>
