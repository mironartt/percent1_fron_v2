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
                <p>Анализирую ваши результаты...</p>
              </div>

              <div v-else class="ai-message">
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
            <div class="plan-icon">
              <Target :size="40" />
            </div>
            <h2 class="step-title">Ваши первые цели</h2>
            <p class="step-subtitle">AI подготовил цели с шагами для улучшения слабых сфер</p>
          </div>

          <div class="goals-preview">
            <div 
              v-for="goal in aiGoals" 
              :key="goal.id"
              class="goal-preview-card"
              :style="{ '--goal-color': getSphereColor(goal.sphereId) }"
            >
              <div class="goal-preview-header">
                <div class="goal-sphere-icon" :style="{ background: getSphereColor(goal.sphereId) }">
                  <component :is="getSphereIcon(goal.sphereId)" :size="18" />
                </div>
                <div class="goal-preview-info">
                  <span class="goal-sphere-name">{{ getSphereName(goal.sphereId) }}</span>
                  <h4>{{ goal.title }}</h4>
                </div>
              </div>
              <div class="goal-steps-preview">
                <div class="steps-label">
                  <ListTodo :size="14" />
                  {{ goal.steps.length }} шагов к цели:
                </div>
                <ul class="steps-list-mini">
                  <li v-for="(step, index) in goal.steps.slice(0, 3)" :key="index">
                    {{ step.title }}
                  </li>
                  <li v-if="goal.steps.length > 3" class="more-steps">
                    +{{ goal.steps.length - 3 }} ещё...
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="plan-summary">
            <div class="summary-item">
              <Target :size="20" class="text-success" />
              <span>{{ aiGoals.length }} цели для старта</span>
            </div>
            <div class="summary-item">
              <TrendingUp :size="20" class="text-primary" />
              <span>Фокус на {{ weakSpheresCount }} сферах роста</span>
            </div>
          </div>

          <div class="step-actions final">
            <button class="btn btn-secondary" @click="prevStep">
              <ArrowLeft :size="18" />
              Назад
            </button>
            <button class="btn btn-primary btn-lg" @click="completeOnboarding">
              <Rocket :size="20" />
              Сделать первый +1%
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
import WheelOfLife from './WheelOfLife.vue'
import { DEBUG_MODE, SKIP_AUTH_CHECK } from '@/config/settings.js'
import {
  Sparkles, Target, Clock, ArrowRight, ArrowLeft,
  Bot, Calendar, Rocket, CheckCircle, TrendingUp,
  Briefcase, Heart, Dumbbell, Users, Palette, Wallet,
  Lightbulb, AlertTriangle, Zap, ListTodo
} from 'lucide-vue-next'

const router = useRouter()
const store = useAppStore()

const currentStep = ref(1)
const totalSteps = 5
const stepLabels = ['Знакомство', 'Диагностика', 'Результат', 'Анализ', 'План']
const isLoading = ref(false)
const isAnalyzing = ref(false)

const surveyData = ref({
  timeCommitment: null
})

const timeOptions = [
  { id: '15min', label: '15 мин/день' },
  { id: '30min', label: '30 мин/день' },
  { id: '1hour', label: '1 час/день' },
  { id: 'flexible', label: 'По возможности' }
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

function generateAIAnalysis() {
  isAnalyzing.value = true
  
  setTimeout(() => {
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
  }, 2000)
}

function generateAIGoals() {
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

function nextStep() {
  if (currentStep.value < totalSteps) {
    currentStep.value++
    
    if (currentStep.value === 4) {
      generateAIAnalysis()
    }
    
    if (currentStep.value === 5) {
      generateAIGoals()
    }
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

async function completeOnboarding() {
  if (DEBUG_MODE) {
    console.log('[OnboardingAI] Saving sphere ratings to store...')
  }
  
  localSpheres.value.forEach(sphere => {
    store.updateSphere(sphere.id, { score: sphere.score })
    if (DEBUG_MODE) {
      console.log(`[OnboardingAI] Updated sphere ${sphere.id}: ${sphere.score}`)
    }
  })
  
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
    aiGoals: aiGoals.value,
    completedAt: new Date().toISOString()
  })
  
  store.initAIRecommendations(aiGoals.value)
  
  store.completeFirstStep('ssp')
  store.completeFirstStep('chat_mentor')
  
  if (DEBUG_MODE) {
    console.log('[OnboardingAI] Completed, navigating to dashboard with AI goals review')
  }
  
  router.push('/app')
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
}
</style>
