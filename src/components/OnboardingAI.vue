<template>
  <div class="onboarding-overlay">
    <div class="onboarding-container" :class="{ 'wide': currentStep >= 3 }">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>

      <template v-else>
        <div class="progress-section">
          <div class="progress-steps">
            <div 
              v-for="step in totalSteps" 
              :key="step"
              class="progress-step"
              :class="{ 
                active: currentStep === step, 
                completed: currentStep > step 
              }"
            >
              <span class="step-number">{{ step }}</span>
            </div>
          </div>
          <div class="progress-labels">
            <span :class="{ active: currentStep === 1 }">Знакомство</span>
            <span :class="{ active: currentStep === 2 }">Диагностика</span>
            <span :class="{ active: currentStep === 3 }">Результат</span>
            <span :class="{ active: currentStep === 4 }">Анализ</span>
            <span :class="{ active: currentStep === 5 }">План</span>
          </div>
        </div>

        <div v-if="currentStep === 1" class="step-content step-welcome">
          <div class="welcome-icon">
            <span class="icon-wrapper icon-wrapper-lg primary">
              <Sparkles :size="48" />
            </span>
          </div>
          <h1 class="step-title">Добро пожаловать в OnePercent</h1>
          <p class="step-subtitle">Ответьте на несколько вопросов, чтобы мы могли создать персональный план развития</p>

          <div class="survey-questions">
            <div class="survey-question">
              <label class="question-label">
                <Target :size="18" />
                Какая главная цель привела вас сюда?
              </label>
              <div class="options-grid">
                <button 
                  v-for="goal in goalOptions" 
                  :key="goal.id"
                  class="option-btn"
                  :class="{ selected: surveyData.mainGoal === goal.id }"
                  @click="surveyData.mainGoal = goal.id"
                >
                  <component :is="goal.icon" :size="20" />
                  {{ goal.label }}
                </button>
              </div>
            </div>

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
          <h2 class="step-title">Ваше колесо баланса</h2>
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
              <Calendar :size="40" />
            </div>
            <h2 class="step-title">Ваш план на 7 дней</h2>
            <p class="step-subtitle">Персональные задачи для улучшения слабых сфер</p>
          </div>

          <div class="weekly-plan">
            <div 
              v-for="task in weeklyTasks" 
              :key="task.id"
              class="plan-task"
              :style="{ '--task-color': getSphereColor(task.sphereId) }"
            >
              <div class="task-day">{{ task.day }}</div>
              <div class="task-content">
                <div class="task-sphere">
                  <component :is="getSphereIcon(task.sphereId)" :size="16" />
                  {{ getSphereName(task.sphereId) }}
                </div>
                <h4>{{ task.title }}</h4>
                <p>{{ task.description }}</p>
              </div>
              <div class="task-time">
                <Clock :size="14" />
                {{ task.duration }}
              </div>
            </div>
          </div>

          <div class="plan-summary">
            <div class="summary-item">
              <CheckCircle :size="20" class="text-success" />
              <span>{{ weeklyTasks.length }} задач на неделю</span>
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
              Начать путь к успеху
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
  Lightbulb, AlertTriangle, Zap
} from 'lucide-vue-next'

const router = useRouter()
const store = useAppStore()

const currentStep = ref(1)
const totalSteps = 5
const isLoading = ref(false)
const isAnalyzing = ref(false)

const surveyData = ref({
  mainGoal: null,
  timeCommitment: null
})

const goalOptions = [
  { id: 'balance', label: 'Баланс в жизни', icon: Palette },
  { id: 'career', label: 'Карьера и доход', icon: Briefcase },
  { id: 'health', label: 'Здоровье и энергия', icon: Dumbbell },
  { id: 'relationships', label: 'Отношения', icon: Heart }
]

const timeOptions = [
  { id: '15min', label: '15 мин/день' },
  { id: '30min', label: '30 мин/день' },
  { id: '1hour', label: '1 час/день' },
  { id: 'flexible', label: 'По возможности' }
]

const localSpheres = ref([
  { id: 'wealth', name: 'Благосостояние', score: 5 },
  { id: 'hobbies', name: 'Хобби и отдых', score: 5 },
  { id: 'relationships', name: 'Дружба и окружение', score: 5 },
  { id: 'health', name: 'Здоровье и спорт', score: 5 },
  { id: 'family', name: 'Любовь и семья', score: 5 },
  { id: 'career', name: 'Работа и карьера', score: 5 }
])

const sphereIcons = {
  wealth: Wallet,
  hobbies: Palette,
  relationships: Users,
  health: Dumbbell,
  family: Heart,
  career: Briefcase
}

const sphereColors = {
  wealth: '#10b981',
  hobbies: '#f59e0b',
  relationships: '#8b5cf6',
  health: '#ef4444',
  family: '#ec4899',
  career: '#3b82f6'
}

const sphereHints = {
  wealth: 'Финансы, сбережения, материальная стабильность',
  hobbies: 'Увлечения, отдых, творчество, путешествия',
  relationships: 'Друзья, социальные связи, нетворкинг',
  health: 'Физическое здоровье, спорт, питание, сон',
  family: 'Партнёр, дети, близкие родственники',
  career: 'Работа, профессия, развитие, достижения'
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
  return surveyData.value.mainGoal && surveyData.value.timeCommitment
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

const weeklyTasks = ref([])

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

function generateWeeklyPlan() {
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  const tasks = []
  
  const taskTemplates = {
    wealth: [
      { title: 'Анализ расходов', description: 'Проверьте траты за последнюю неделю', duration: '15 мин' },
      { title: 'Финансовая цель', description: 'Запишите одну финансовую цель на месяц', duration: '10 мин' }
    ],
    hobbies: [
      { title: 'Время для себя', description: 'Посвятите время любимому занятию', duration: '30 мин' },
      { title: 'Новое хобби', description: 'Попробуйте что-то новое', duration: '20 мин' }
    ],
    relationships: [
      { title: 'Связь с другом', description: 'Напишите или позвоните другу', duration: '15 мин' },
      { title: 'Новое знакомство', description: 'Начните разговор с новым человеком', duration: '10 мин' }
    ],
    health: [
      { title: 'Утренняя зарядка', description: '10 минут простых упражнений', duration: '10 мин' },
      { title: 'Прогулка', description: 'Прогуляйтесь на свежем воздухе', duration: '20 мин' }
    ],
    family: [
      { title: 'Качественное время', description: 'Проведите время с близкими без телефона', duration: '30 мин' },
      { title: 'Благодарность', description: 'Скажите близким, за что вы их цените', duration: '5 мин' }
    ],
    career: [
      { title: 'Развитие навыка', description: 'Изучите что-то новое по работе', duration: '20 мин' },
      { title: 'Планирование', description: 'Составьте план на следующую неделю', duration: '15 мин' }
    ]
  }
  
  weakSpheres.value.forEach((sphere, sphereIndex) => {
    const templates = taskTemplates[sphere.id] || []
    templates.forEach((template, taskIndex) => {
      const dayIndex = (sphereIndex * 2 + taskIndex) % 7
      tasks.push({
        id: `${sphere.id}-${taskIndex}`,
        sphereId: sphere.id,
        day: days[dayIndex],
        ...template
      })
    })
  })
  
  weeklyTasks.value = tasks.sort((a, b) => {
    const dayOrder = { 'Пн': 0, 'Вт': 1, 'Ср': 2, 'Чт': 3, 'Пт': 4, 'Сб': 5, 'Вс': 6 }
    return dayOrder[a.day] - dayOrder[b.day]
  })
}

function nextStep() {
  if (currentStep.value < totalSteps) {
    currentStep.value++
    
    if (currentStep.value === 4) {
      generateAIAnalysis()
    }
    
    if (currentStep.value === 5) {
      generateWeeklyPlan()
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
  
  store.completeOnboarding({
    surveyData: surveyData.value,
    sphereRatings: localSpheres.value.map(s => ({ id: s.id, score: s.score })),
    weeklyPlan: weeklyTasks.value,
    completedAt: new Date().toISOString()
  })
  
  store.completeFirstStep('ssp')
  store.completeFirstStep('chat_mentor')
  
  if (DEBUG_MODE) {
    console.log('[OnboardingAI] Completed, navigating to dashboard')
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
  align-items: center;
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
  margin-bottom: 0.5rem;
}

.progress-steps::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--border-color);
  transform: translateY(-50%);
  z-index: 0;
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

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.progress-labels span.active {
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
  background: var(--primary-hover);
  transform: translateY(-1px);
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sphere-rating-card {
  background: var(--bg-color);
  border-radius: 16px;
  padding: 1.25rem;
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
  grid-template-columns: 1fr 250px;
  gap: 2rem;
  align-items: center;
  margin-bottom: 2rem;
}

.wheel-container {
  display: flex;
  justify-content: center;
  transform: scale(0.7);
  transform-origin: center;
}

.wheel-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-card {
  background: var(--bg-color);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-card.primary {
  background: linear-gradient(135deg, var(--primary-color), #a78bfa);
  color: white;
  flex-direction: column;
  text-align: center;
}

.stat-card.primary .stat-value {
  font-size: 2.5rem;
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
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-bg);
  border-radius: 12px;
}

.stat-info {
  flex: 1;
}

.stat-value-sm {
  font-weight: 600;
  font-size: 1rem;
}

.stat-label {
  font-size: 0.8rem;
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
  margin-bottom: 2rem;
}

.plan-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--primary-color), #a78bfa);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.weekly-plan {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.plan-task {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-color);
  border-radius: 12px;
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

@media (max-width: 768px) {
  .onboarding-container {
    padding: 1.5rem;
    border-radius: 16px;
  }
  
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .wheel-section {
    grid-template-columns: 1fr;
  }
  
  .wheel-container {
    transform: scale(0.55);
  }
  
  .progress-labels {
    display: none;
  }
}
</style>
