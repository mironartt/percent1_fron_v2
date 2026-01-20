<template>
  <div class="onboarding-overlay">
    <div class="onboarding-container" :class="{ 'wide': currentStep >= 3 }">
      <!-- Progress Bar -->
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

      <!-- Step 1: Welcome + Time Commitment -->
      <div v-if="currentStep === 1" class="step-content step-welcome">
        <div class="welcome-icon">
          <span class="icon-wrapper icon-wrapper-lg primary">
            <span class="one-percent-text">1%</span>
          </span>
        </div>
        <h1 class="step-title">Добро пожаловать в OnePercent</h1>
        <p class="step-subtitle">Система для управления жизнью через ежедневные улучшения на 1%</p>

        <div class="survey-questions">
          <div class="survey-question">
            <label class="question-label">
              <Clock :size="18" />
              Сколько времени готовы уделять развитию ежедневно?
            </label>
            <div class="options-row">
              <button
                v-for="time in timeOptions"
                :key="time.id"
                class="option-btn"
                :class="{ selected: timeCommitment === time.id }"
                @click="timeCommitment = time.id"
              >
                <span class="option-label">{{ time.label }}</span>
                <span class="option-hint">{{ time.hint }}</span>
              </button>
            </div>
          </div>
        </div>

        <button
          class="btn btn-primary btn-lg"
          @click="nextStep"
          :disabled="!timeCommitment"
        >
          Начать диагностику
          <ArrowRight :size="18" />
        </button>
      </div>

      <!-- Step 2: SSP Diagnosis (Rate spheres) -->
      <div v-if="currentStep === 2" class="step-content step-diagnosis">
        <h2 class="step-title">Оцените каждую сферу жизни</h2>
        <p class="step-subtitle">Перетащите ползунок, чтобы поставить оценку от 0 до 10</p>

        <div class="spheres-list">
          <div
            v-for="sphere in spheres"
            :key="sphere.id"
            class="sphere-rating-card"
            :style="{ '--sphere-color': sphere.color }"
          >
            <div class="sphere-header">
              <div class="sphere-icon" :style="{ background: sphere.color }">
                <component :is="sphere.icon" :size="24" />
              </div>
              <div class="sphere-info">
                <h3>{{ sphere.name }}</h3>
                <p class="sphere-hint">{{ sphere.hint }}</p>
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
            :disabled="!isAllSpheresRated"
          >
            Посмотреть результат
            <ArrowRight :size="18" />
          </button>
        </div>
      </div>

      <!-- Step 3: Wheel of Life Visualization -->
      <div v-if="currentStep === 3" class="step-content step-wheel">
        <h2 class="step-title">Система сбалансированных показателей</h2>
        <p class="step-subtitle">Визуализация текущего состояния всех сфер жизни</p>

        <div class="wheel-section">
          <div class="wheel-container">
            <WheelOfLife :spheres="spheres" :readonly="true" />
          </div>
          <div class="wheel-stats">
            <div class="stat-card primary">
              <div class="stat-value">{{ averageScore.toFixed(1) }}</div>
              <div class="stat-label">Средний балл</div>
            </div>
            <div class="stat-card success" v-if="strongestSphere">
              <div class="stat-icon">
                <component :is="strongestSphere.icon" :size="24" />
              </div>
              <div class="stat-info">
                <div class="stat-value-sm">{{ strongestSphere.name }}</div>
                <div class="stat-label">Сильная сторона</div>
              </div>
            </div>
            <div class="stat-card warning" v-if="weakestSphere">
              <div class="stat-icon">
                <component :is="weakestSphere.icon" :size="24" />
              </div>
              <div class="stat-info">
                <div class="stat-value-sm">{{ weakestSphere.name }}</div>
                <div class="stat-label">Зона роста</div>
              </div>
            </div>
          </div>
        </div>

        <div class="insights-preview">
          <h3>Первые выводы</h3>
          <div class="insight-cards">
            <div class="insight-card" v-for="insight in quickInsights" :key="insight.id">
              <component :is="insight.icon" :size="20" class="insight-icon" />
              <p>{{ insight.text }}</p>
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

      <!-- Step 4: AI Analysis -->
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
              <p>{{ analysisProgress }}</p>
            </div>

            <div v-if="!isAnalyzing && aiAnalysis" class="ai-message">
              <div class="message-bubble">
                <p>{{ aiAnalysis }}</p>
              </div>
            </div>
          </div>

          <div class="detailed-insights" v-if="!isAnalyzing">
            <h3>Детальный анализ</h3>
            <div class="insight-cards">
              <div class="insight-card" v-for="insight in detailedInsights" :key="insight.id">
                <component :is="insight.icon" :size="20" class="insight-icon" />
                <div class="insight-content">
                  <h4>{{ insight.title }}</h4>
                  <p>{{ insight.text }}</p>
                </div>
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
            Получить план действий
            <Target :size="18" />
          </button>
        </div>
      </div>

      <!-- Step 5: AI Goals Review -->
      <div v-if="currentStep === 5" class="step-content step-goals">
        <div class="plan-header">
          <h2 class="step-title">Рекомендованные цели</h2>
          <p class="step-subtitle">AI сформировал цели на основе анализа ССП. Выберите подходящие.</p>
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
            {{ rejectedGoalsCount }} отклонено
          </div>
        </div>

        <div class="goals-review-list">
          <div
            v-for="goal in aiGoals"
            :key="goal.id"
            class="goal-review-card"
            :class="{
              accepted: goal.status === 'accepted',
              rejected: goal.status === 'rejected'
            }"
            :style="{ '--goal-color': goal.color }"
          >
            <div class="goal-header">
              <div class="goal-icon" :style="{ background: goal.color }">
                <component :is="goal.icon" :size="20" />
              </div>
              <div class="goal-info">
                <h4>{{ goal.title }}</h4>
                <p class="goal-description">{{ goal.description }}</p>
                <div class="goal-meta">
                  <span class="goal-sphere-tag">{{ goal.sphereName }}</span>
                  <span class="goal-steps-count">{{ goal.steps.length }} шагов</span>
                </div>
              </div>
            </div>

            <div class="goal-steps-preview" v-if="goal.expanded">
              <div class="step-item" v-for="(step, index) in goal.steps" :key="index">
                <Check :size="14" />
                <span>{{ step }}</span>
              </div>
            </div>

            <div class="goal-actions">
              <button
                class="btn-icon"
                @click="goal.expanded = !goal.expanded"
                :title="goal.expanded ? 'Свернуть' : 'Показать шаги'"
              >
                <ListTodo :size="18" />
              </button>
              <button
                v-if="goal.status !== 'rejected'"
                class="btn btn-sm btn-success"
                @click="acceptGoal(goal)"
              >
                <Check :size="16" />
                {{ goal.status === 'accepted' ? 'Принято' : 'Принять' }}
              </button>
              <button
                v-if="goal.status !== 'accepted'"
                class="btn btn-sm btn-ghost"
                @click="rejectGoal(goal)"
              >
                <X :size="16" />
                {{ goal.status === 'rejected' ? 'Отклонено' : 'Пропустить' }}
              </button>
            </div>
          </div>
        </div>

        <div class="completion-info">
          <p>
            <strong>Совет:</strong> Рекомендуем принять 2-3 цели для начала.
            Остальные можно добавить позже в разделе "Банк целей".
          </p>
        </div>

        <button
          class="btn btn-primary btn-lg"
          @click="finishOnboarding"
          :disabled="acceptedGoalsCount === 0 || isSaving"
        >
          <span v-if="!isSaving">Начать работу ({{ acceptedGoalsCount }} {{ goalWord }})</span>
          <span v-else>Сохранение...</span>
          <ArrowRight v-if="!isSaving" :size="18" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * OnboardingDeep.vue - Глубокий вариант онбординга (A/B Test)
 *
 * Копировать в: src/components/OnboardingDeep.vue
 *
 * Характеристики:
 * - 5 шагов
 * - 5-7 минут
 * - Полная диагностика ССП
 * - AI анализ результатов
 * - Множественные цели
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useABTestStore } from '@/stores/abtest'
import WheelOfLife from '@/components/WheelOfLife.vue'
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Target,
  ListTodo,
  Zap,
  Bot,
  Heart,
  Wallet,
  Users,
  Briefcase,
  Dumbbell,
  Palette,
  Clock,
  X,
  TrendingUp,
  AlertCircle,
  Lightbulb
} from 'lucide-vue-next'

const router = useRouter()
const store = useAppStore()
const abStore = useABTestStore()

// State
const currentStep = ref(1)
const timeCommitment = ref(null)
const isSaving = ref(false)
const isAnalyzing = ref(false)
const analysisProgress = ref('Анализирую ваши результаты...')
const aiAnalysis = ref('')
const stepStartTime = ref(Date.now())

// Step labels
const stepLabels = ['Приветствие', 'Диагностика', 'Визуализация', 'Анализ', 'Цели']

// Time options
const timeOptions = [
  { id: '15min', label: '15 минут', hint: 'Минимум' },
  { id: '30min', label: '30 минут', hint: 'Оптимально' },
  { id: '1hour', label: '1 час', hint: 'Амбициозно' },
  { id: '2hours', label: '2+ часа', hint: 'Максимум' }
]

// Spheres (6 life spheres)
const spheres = ref([
  {
    id: 'health',
    name: 'Здоровье',
    hint: 'Физическая форма, энергия, самочувствие',
    color: '#EF4444',
    icon: Dumbbell,
    score: 5
  },
  {
    id: 'career',
    name: 'Карьера',
    hint: 'Работа, профессиональный рост, достижения',
    color: '#F59E0B',
    icon: Briefcase,
    score: 5
  },
  {
    id: 'wealth',
    name: 'Финансы',
    hint: 'Доход, накопления, финансовая стабильность',
    color: '#10B981',
    icon: Wallet,
    score: 5
  },
  {
    id: 'love',
    name: 'Любовь',
    hint: 'Отношения, семья, близкие люди',
    color: '#EC4899',
    icon: Heart,
    score: 5
  },
  {
    id: 'friendship',
    name: 'Окружение',
    hint: 'Друзья, связи, социальная жизнь',
    color: '#8B5CF6',
    icon: Users,
    score: 5
  },
  {
    id: 'hobbies',
    name: 'Хобби',
    hint: 'Творчество, увлечения, саморазвитие',
    color: '#06B6D4',
    icon: Palette,
    score: 5
  }
])

// AI Generated Goals
const aiGoals = ref([])

// Computed
const isAllSpheresRated = computed(() => {
  return spheres.value.every(s => s.score !== null)
})

const averageScore = computed(() => {
  const sum = spheres.value.reduce((acc, s) => acc + s.score, 0)
  return sum / spheres.value.length
})

const strongestSphere = computed(() => {
  return [...spheres.value].sort((a, b) => b.score - a.score)[0]
})

const weakestSphere = computed(() => {
  return [...spheres.value].sort((a, b) => a.score - b.score)[0]
})

const quickInsights = computed(() => {
  const insights = []
  const avg = averageScore.value

  if (avg >= 7) {
    insights.push({
      id: 1,
      icon: TrendingUp,
      text: 'Общий уровень жизни высокий! Фокус на поддержании баланса.'
    })
  } else if (avg >= 5) {
    insights.push({
      id: 1,
      icon: Lightbulb,
      text: 'Есть потенциал для роста в нескольких сферах.'
    })
  } else {
    insights.push({
      id: 1,
      icon: AlertCircle,
      text: 'Важно уделить внимание проблемным зонам.'
    })
  }

  const lowSpheres = spheres.value.filter(s => s.score < 5)
  if (lowSpheres.length > 0) {
    insights.push({
      id: 2,
      icon: Target,
      text: `Зоны роста: ${lowSpheres.map(s => s.name).join(', ')}`
    })
  }

  return insights
})

const detailedInsights = computed(() => {
  return [
    {
      id: 1,
      icon: TrendingUp,
      title: 'Сильная сторона',
      text: `${strongestSphere.value?.name} (${strongestSphere.value?.score}/10) - продолжайте развивать этот навык и используйте его как опору.`
    },
    {
      id: 2,
      icon: Target,
      title: 'Приоритет для роста',
      text: `${weakestSphere.value?.name} (${weakestSphere.value?.score}/10) - начните с небольших улучшений в этой сфере.`
    },
    {
      id: 3,
      icon: Lightbulb,
      title: 'Рекомендация',
      text: 'Фокусируйтесь на 1-2 сферах одновременно. Малые ежедневные действия приведут к значительным результатам.'
    }
  ]
})

const acceptedGoalsCount = computed(() => {
  return aiGoals.value.filter(g => g.status === 'accepted').length
})

const pendingGoalsCount = computed(() => {
  return aiGoals.value.filter(g => g.status === 'pending').length
})

const rejectedGoalsCount = computed(() => {
  return aiGoals.value.filter(g => g.status === 'rejected').length
})

const goalWord = computed(() => {
  const count = acceptedGoalsCount.value
  if (count === 1) return 'цель'
  if (count >= 2 && count <= 4) return 'цели'
  return 'целей'
})

// Methods
const nextStep = async () => {
  // Track step completion
  const timeSpent = Date.now() - stepStartTime.value
  await abStore.trackStepCompleted(currentStep.value, timeSpent, {
    time_commitment: timeCommitment.value,
    average_score: averageScore.value,
    spheres: spheres.value.map(s => ({ id: s.id, score: s.score }))
  })

  // Special logic for step 3 -> 4 (trigger AI analysis)
  if (currentStep.value === 3) {
    currentStep.value++
    stepStartTime.value = Date.now()
    await performAIAnalysis()
  } else if (currentStep.value === 4) {
    currentStep.value++
    stepStartTime.value = Date.now()
    generateAIGoals()
  } else {
    currentStep.value++
    stepStartTime.value = Date.now()
  }
}

const prevStep = () => {
  currentStep.value--
  stepStartTime.value = Date.now()
}

const performAIAnalysis = async () => {
  isAnalyzing.value = true

  // Simulate AI analysis (в продакшн - реальный API вызов)
  const steps = [
    'Анализирую баланс жизненных сфер...',
    'Выявляю зоны роста...',
    'Формирую рекомендации...',
    'Готово!'
  ]

  for (let i = 0; i < steps.length; i++) {
    analysisProgress.value = steps[i]
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Generate analysis text
  const weak = weakestSphere.value
  const strong = strongestSphere.value
  const avg = averageScore.value

  aiAnalysis.value = `На основе вашей оценки (средний балл: ${avg.toFixed(1)}/10) вижу, что сильная сторона — ${strong.name} (${strong.score}/10). Это отличная база для дальнейшего развития!\n\nОднако ${weak.name} (${weak.score}/10) требует внимания. Рекомендую начать с небольших ежедневных действий в этой сфере — даже 15 минут в день дадут заметный прогресс через месяц.\n\nГлавный совет: не пытайтесь улучшить всё сразу. Выберите 2-3 приоритетные цели и фокусируйтесь на них.`

  isAnalyzing.value = false
}

const generateAIGoals = () => {
  // Generate 3-5 goals based on SSP results
  const goals = []

  // Always add goal for weakest sphere
  const weak = weakestSphere.value
  goals.push({
    id: 1,
    sphereId: weak.id,
    sphereName: weak.name,
    title: `Улучшить показатели: ${weak.name}`,
    description: `Поднять уровень с ${weak.score}/10 до ${Math.min(weak.score + 3, 10)}/10`,
    color: weak.color,
    icon: weak.icon,
    status: 'pending',
    expanded: false,
    steps: generateStepsForSphere(weak.id)
  })

  // Add goals for spheres with score < 6
  const lowSpheres = spheres.value.filter(s => s.score < 6 && s.id !== weak.id).slice(0, 2)
  lowSpheres.forEach((sphere, index) => {
    goals.push({
      id: index + 2,
      sphereId: sphere.id,
      sphereName: sphere.name,
      title: `Развитие: ${sphere.name}`,
      description: `Целевой уровень: ${Math.min(sphere.score + 2, 10)}/10`,
      color: sphere.color,
      icon: sphere.icon,
      status: 'pending',
      expanded: false,
      steps: generateStepsForSphere(sphere.id)
    })
  })

  // Add one aspirational goal for strong sphere
  const strong = strongestSphere.value
  if (strong.score >= 7) {
    goals.push({
      id: goals.length + 1,
      sphereId: strong.id,
      sphereName: strong.name,
      title: `Мастерство: ${strong.name}`,
      description: `Выйти на уровень ${Math.min(strong.score + 1, 10)}/10`,
      color: strong.color,
      icon: strong.icon,
      status: 'pending',
      expanded: false,
      steps: generateStepsForSphere(strong.id, true)
    })
  }

  aiGoals.value = goals
}

const generateStepsForSphere = (sphereId, advanced = false) => {
  const stepsMap = {
    health: advanced
      ? ['Составить программу тренировок с тренером', 'Пройти медицинское обследование', 'Внедрить продвинутую систему питания', 'Участвовать в соревнованиях']
      : ['Выбрать вид физической активности', 'Начать с 3 тренировок в неделю', 'Настроить режим сна', 'Пересмотреть питание'],
    career: advanced
      ? ['Подготовиться к повышению', 'Взять лидерство в проекте', 'Развить экспертизу в узкой области', 'Построить профессиональный бренд']
      : ['Определить желаемую должность', 'Изучить требуемые навыки', 'Пройти онлайн-курс', 'Применить знания на работе'],
    wealth: advanced
      ? ['Диверсифицировать портфель', 'Создать пассивный доход', 'Оптимизировать налоги', 'Инвестировать в образование']
      : ['Проанализировать расходы', 'Создать бюджет', 'Начать откладывать 10%', 'Изучить инвестиции'],
    love: advanced
      ? ['Углубить эмоциональную близость', 'Пройти курс для пар', 'Создать общие традиции', 'Планировать совместное будущее']
      : ['Проводить время вместе', 'Назначить еженедельные свидания', 'Обсудить ожидания', 'Проявлять заботу ежедневно'],
    friendship: advanced
      ? ['Стать организатором сообщества', 'Менторить других', 'Создать мастермайнд группу', 'Развивать глубокие связи']
      : ['Восстановить связь со старыми друзьями', 'Найти сообщество по интересам', 'Назначить 3 встречи в месяц', 'Быть более открытым'],
    hobbies: advanced
      ? ['Монетизировать хобби', 'Участвовать в выставках/конкурсах', 'Обучать других', 'Стать экспертом в нише']
      : ['Выделить 5 часов в неделю', 'Изучить основы', 'Присоединиться к клубу', 'Завершить первый проект']
  }

  return stepsMap[sphereId] || ['Изучить тему', 'Составить план', 'Начать действовать', 'Отслеживать прогресс']
}

const acceptGoal = (goal) => {
  goal.status = 'accepted'
}

const rejectGoal = (goal) => {
  goal.status = 'rejected'
}

const finishOnboarding = async () => {
  isSaving.value = true

  try {
    // 1. Save SSP data
    const categoriesData = spheres.value.map(s => ({
      category: s.id,
      rating: s.score
    }))
    await store.saveSSPToBackend(categoriesData)

    // 2. Create accepted goals on backend
    const acceptedGoals = aiGoals.value.filter(g => g.status === 'accepted')
    for (const goal of acceptedGoals) {
      const newGoal = {
        title: goal.title,
        text: goal.title,
        sphereId: goal.sphereId,
        whyImportant: goal.description,
        status: 'validated',
        workStatus: 'work'
      }
      
      const result = await store.createGoalOnBackend(newGoal)
      
      if (result.success) {
        store.addGoal({
          ...newGoal,
          backendId: result.goalId
        })
      }
    }

    // 3. Complete onboarding on backend
    await store.completeOnboardingWithBackend({})
    store.setUserFinishOnboarding(true)

    // 4. Track completion
    const totalTime = Date.now() - abStore.startTime
    await abStore.trackOnboardingCompleted(totalTime)

    // 5. Redirect
    router.push('/app')
  } catch (error) {
    console.error('Failed to complete onboarding:', error)
    isSaving.value = false
  }
}

// Track abandonment
onUnmounted(() => {
  if (currentStep.value < 5) {
    const timeSpent = Date.now() - stepStartTime.value
    abStore.trackOnboardingAbandoned(currentStep.value, timeSpent)
  }
})

const handleVisibilityChange = () => {
  if (document.hidden && currentStep.value < 5) {
    const timeSpent = Date.now() - stepStartTime.value
    abStore.trackOnboardingAbandoned(currentStep.value, timeSpent)
  }
}

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped>
/* Базовые стили (совпадают с OnboardingFast) */
.onboarding-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 2rem;
}

.onboarding-container {
  background: white;
  border-radius: 1rem;
  padding: 2.5rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  transition: max-width 0.3s ease;
}

.onboarding-container.wide {
  max-width: 900px;
}

/* Progress Steps */
.progress-section {
  margin-bottom: 2.5rem;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.progress-step-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.progress-step {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #9ca3af;
  transition: all 0.3s ease;
  z-index: 2;
}

.progress-step.active {
  background: #667eea;
  color: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
}

.progress-step.completed {
  background: #10b981;
  color: white;
}

.progress-label {
  font-size: 0.75rem;
  color: #9ca3af;
  text-align: center;
  transition: color 0.3s ease;
}

.progress-label.active {
  color: #1f2937;
  font-weight: 500;
}

/* Step Content */
.step-content {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Welcome Step */
.welcome-icon {
  text-align: center;
  margin-bottom: 1.5rem;
}

.icon-wrapper-lg {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
}

.icon-wrapper.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.step-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
  text-align: center;
}

.step-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  text-align: center;
  margin-bottom: 2rem;
}

/* Survey Questions */
.survey-questions {
  margin-bottom: 2rem;
}

.survey-question {
  margin-bottom: 1.5rem;
}

.question-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.options-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.option-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-btn:hover {
  border-color: #667eea;
  background: #f9fafb;
}

.option-btn.selected {
  border-color: #667eea;
  background: #eef2ff;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.option-label {
  font-weight: 600;
  color: #1f2937;
}

.option-hint {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* Spheres Rating */
.spheres-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.sphere-rating-card {
  padding: 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  transition: border-color 0.2s ease;
}

.sphere-rating-card:hover {
  border-color: var(--sphere-color);
}

.sphere-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.sphere-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.sphere-info {
  flex: 1;
}

.sphere-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.sphere-hint {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.sphere-score {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--sphere-color);
}

/* Slider */
.slider-container {
  position: relative;
}

.sphere-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
}

.sphere-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--sphere-color);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.sphere-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--sphere-color);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

/* Wheel Section */
.wheel-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.wheel-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.wheel-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-card {
  padding: 1rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-card.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex-direction: column;
  text-align: center;
}

.stat-card.success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.stat-card.warning {
  background: #fef3c7;
  border: 1px solid #fde68a;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
}

.stat-value-sm {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

.stat-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Insights */
.insights-preview,
.detailed-insights {
  margin-bottom: 2rem;
}

.insights-preview h3,
.detailed-insights h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.insight-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.insight-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
}

.insight-icon {
  color: #667eea;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.insight-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.insight-content p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* AI Analysis */
.ai-analysis-section {
  margin-bottom: 2rem;
}

.ai-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.ai-avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.ai-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.analyzing-state {
  text-align: center;
  padding: 2rem;
}

.typing-indicator {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
}

.ai-message {
  margin-bottom: 1.5rem;
}

.message-bubble {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.message-bubble p {
  margin: 0;
  line-height: 1.6;
  color: #1f2937;
  white-space: pre-line;
}

/* Goals Review */
.goals-status-summary {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.75rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-item.accepted {
  color: #10b981;
}

.status-item.pending {
  color: #f59e0b;
}

.status-item.rejected {
  color: #6b7280;
}

.goals-review-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.goal-review-card {
  padding: 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.goal-review-card.accepted {
  border-color: #10b981;
  background: #f0fdf4;
}

.goal-review-card.rejected {
  border-color: #d1d5db;
  background: #f9fafb;
  opacity: 0.6;
}

.goal-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.goal-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.goal-info {
  flex: 1;
}

.goal-info h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.goal-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.goal-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
}

.goal-sphere-tag {
  padding: 0.25rem 0.5rem;
  background: var(--goal-color);
  color: white;
  border-radius: 0.25rem;
  font-weight: 500;
}

.goal-steps-count {
  color: #9ca3af;
}

.goal-steps-preview {
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 0.5rem;
}

.step-item:last-child {
  margin-bottom: 0;
}

.step-item svg {
  color: #10b981;
  flex-shrink: 0;
}

.goal-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-icon {
  width: 2.5rem;
  height: 2.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  border-color: #667eea;
  background: #f9fafb;
}

.completion-info {
  padding: 1rem;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
}

.completion-info p {
  margin: 0;
  font-size: 0.875rem;
  color: #92400e;
}

/* Actions */
.step-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn-ghost {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-ghost:hover {
  background: #f9fafb;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  width: 100%;
}

/* Responsive */
@media (max-width: 768px) {
  .onboarding-container.wide {
    max-width: 100%;
  }

  .wheel-section {
    grid-template-columns: 1fr;
  }

  .options-row {
    grid-template-columns: 1fr;
  }
}
</style>
