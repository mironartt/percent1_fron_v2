<template>
  <div class="ssp-container">
    <!-- Empty State - First Visit -->
    <div v-if="showEmptyState" class="empty-state-section">
      <div class="empty-state-card card">
        <div class="hero-icon-circle">
          <ChartPie :size="48" :stroke-width="1.5" />
        </div>
        <h1>Система сбалансированных показателей</h1>
        <p class="subtitle">
          Оцените баланс всех сфер вашей жизни и определите точки роста
        </p>
        
        <div class="lesson-info">
          <h3>Что вас ждёт в уроке:</h3>
          <div class="lesson-steps">
            <div class="lesson-step">
              <span class="step-num">1</span>
              <div>
                <strong>Теория</strong>
                <p>Узнаете, как баланс влияет на качество жизни</p>
              </div>
            </div>
            <div class="lesson-step">
              <span class="step-num">2</span>
              <div>
                <strong>Колесо баланса</strong>
                <p>Оцените каждую из 6 сфер жизни от 0 до 10</p>
              </div>
            </div>
            <div class="lesson-step">
              <span class="step-num">3</span>
              <div>
                <strong>Рефлексия</strong>
                <p>Проведёте глубокий анализ каждой сферы</p>
              </div>
            </div>
            <div class="lesson-step">
              <span class="step-num">4</span>
              <div>
                <strong>Итог</strong>
                <p>Зафиксируете результаты и инсайты</p>
              </div>
            </div>
          </div>
        </div>

        <button class="btn btn-primary btn-lg" @click="startLesson">
          <Sparkles :size="18" />
          Начать оценку
        </button>
      </div>
    </div>

    <!-- Summary State - After Completion -->
    <div v-else-if="showSummary" class="summary-section-main">
      <header class="section-header">
        <h1>Система сбалансированных показателей</h1>
      </header>

      <div class="summary-stats-row">
        <div class="summary-stat-compact">
          <div class="stat-icon-wrapper stat-icon-primary">
            <TrendingUp :size="20" :stroke-width="2" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ averageScore.toFixed(1) }}</div>
            <div class="stat-label">Средний балл</div>
          </div>
        </div>

        <div class="summary-stat-compact" v-if="strongestSphere">
          <div class="stat-icon-wrapper" :style="{ color: getSphereColor(strongestSphere.id), background: `color-mix(in srgb, ${getSphereColor(strongestSphere.id)} 12%, transparent)` }">
            <component :is="getSphereIcon(strongestSphere.id)" :size="20" :stroke-width="2" />
          </div>
          <div class="stat-info">
            <div class="stat-value-text">{{ strongestSphere.name }}</div>
            <div class="stat-label">Самая сильная</div>
          </div>
        </div>

        <div class="summary-stat-compact" v-if="weakestSphere">
          <div class="stat-icon-wrapper stat-icon-warning" :style="{ color: getSphereColor(weakestSphere.id), background: `color-mix(in srgb, ${getSphereColor(weakestSphere.id)} 12%, transparent)` }">
            <component :is="getSphereIcon(weakestSphere.id)" :size="20" :stroke-width="2" />
          </div>
          <div class="stat-info">
            <div class="stat-value-text">{{ weakestSphere.name }}</div>
            <div class="stat-label">Зона роста</div>
          </div>
        </div>
      </div>

      <div class="wheel-summary card">
        <h3>Система сбалансированных показателей</h3>
        <div class="wheel-visualization">
          <WheelOfLife :spheres="lifeSpheres" :readonly="true" />
        </div>
      </div>

      <!-- Reflection Summary Accordion -->
      <div class="reflection-summary card">
        <h3>Ваша рефлексия</h3>
        <div class="reflection-accordion readonly">
          <div 
            v-for="sphere in lifeSpheres" 
            :key="sphere.id"
            class="accordion-item"
            :class="{ 
              expanded: expandedSummarySpheres.includes(sphere.id),
              'has-content': hasReflectionContent(sphere),
              'editing': editingSphereId === sphere.id
            }"
            :style="{ '--sphere-color': getSphereColor(sphere.id) }"
          >
            <div 
              class="accordion-header"
              @click="toggleSummarySphereExpand(sphere.id)"
            >
              <div class="accordion-left">
                <div class="sphere-icon-wrapper" :style="{ color: getSphereColor(sphere.id) }">
                  <component :is="getSphereIcon(sphere.id)" :size="24" :stroke-width="2" />
                </div>
                <div class="sphere-title-info">
                  <h2>{{ sphere.name }}</h2>
                  <span class="score-badge-neutral">{{ sphere.score }}/10</span>
                </div>
              </div>
              <div class="accordion-right">
                <button 
                  v-if="editingSphereId !== sphere.id"
                  class="btn-edit-reflection"
                  @click.stop="startEditReflection(sphere)"
                  title="Редактировать"
                >
                  <Pencil :size="16" :stroke-width="2" />
                </button>
                <ChevronDown 
                  :size="20" 
                  class="accordion-chevron" 
                  :class="{ rotated: expandedSummarySpheres.includes(sphere.id) }" 
                />
              </div>
            </div>

            <div class="accordion-content" v-show="expandedSummarySpheres.includes(sphere.id)">
              <!-- Edit Mode -->
              <div v-if="editingSphereId === sphere.id" class="reflection-edit-form">
                <div class="question-item">
                  <label class="question-label">Почему такой балл?</label>
                  <textarea 
                    v-model="editingReflection.why"
                    placeholder="Напишите свой ответ..."
                    class="reflection-textarea"
                    rows="2"
                  ></textarea>
                </div>
                <div class="question-item">
                  <label class="question-label">Что нужно для 10?</label>
                  <textarea 
                    v-model="editingReflection.ten"
                    placeholder="Опишите идеальное состояние..."
                    class="reflection-textarea"
                    rows="2"
                  ></textarea>
                </div>
                <div class="question-item">
                  <label class="question-label">Что мешает?</label>
                  <textarea 
                    v-model="editingReflection.prevents"
                    placeholder="Назовите препятствия..."
                    class="reflection-textarea"
                    rows="2"
                  ></textarea>
                </div>
                <div class="question-item">
                  <label class="question-label">Желаемое состояние</label>
                  <textarea 
                    v-model="editingReflection.desired"
                    placeholder="Опишите, как вы хотите..."
                    class="reflection-textarea"
                    rows="2"
                  ></textarea>
                </div>
                <div class="edit-actions">
                  <button class="btn btn-secondary btn-sm" @click="cancelEditReflection">
                    <X :size="16" />
                    Отмена
                  </button>
                  <button class="btn btn-primary btn-sm" @click="saveEditReflection(sphere.id)">
                    <Check :size="16" />
                    Сохранить
                  </button>
                </div>
              </div>
              <!-- View Mode -->
              <div v-else>
                <div class="reflection-answers" v-if="hasReflectionContent(sphere)">
                  <div class="answer-item" v-if="sphere.reflection?.why">
                    <div class="answer-label">Почему такой балл?</div>
                    <div class="answer-text">{{ sphere.reflection.why }}</div>
                  </div>
                  <div class="answer-item" v-if="sphere.reflection?.ten">
                    <div class="answer-label">Что нужно для 10?</div>
                    <div class="answer-text">{{ sphere.reflection.ten }}</div>
                  </div>
                  <div class="answer-item" v-if="sphere.reflection?.prevents">
                    <div class="answer-label">Что мешает?</div>
                    <div class="answer-text">{{ sphere.reflection.prevents }}</div>
                  </div>
                  <div class="answer-item" v-if="sphere.reflection?.desired">
                    <div class="answer-label">Желаемое состояние</div>
                    <div class="answer-text">{{ sphere.reflection.desired }}</div>
                  </div>
                </div>
                <div class="no-reflection" v-else>
                  <span>Рефлексия не заполнена</span>
                  <button class="btn btn-secondary btn-sm" @click.stop="startEditReflection(sphere)">
                    <Pencil :size="14" />
                    Добавить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="summary-actions">
        <button class="btn btn-primary btn-lg" @click="goToGoalsBank">
          🏦 Перейти в Банк целей
        </button>
        <button class="btn btn-secondary" @click="restartLesson">
          🔄 Пройти оценку заново
        </button>
      </div>
    </div>

    <!-- Lesson Mode - In Progress -->
    <div v-else class="lesson-mode">
      <!-- Progress indicator -->
      <div class="progress-bar">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="progress-step"
          :class="{ 
            active: currentStep === index + 1, 
            completed: currentStep > index + 1 
          }"
          @click="goToStep(index + 1)"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-label">{{ step }}</div>
        </div>
      </div>

    <!-- Step 1: Теория -->
    <div v-if="currentStep === 1" class="step-content">
      <div class="theory-section">
        <header class="section-header">
          <h1>Система сбалансированных показателей</h1>
          <p class="subtitle">
            Жизнь — это как компьютерная игра, и сейчас мы настраиваем твой аватар
          </p>
        </header>

        <div class="card theory-content">
          <h2>Зачем нужно ССП?</h2>
          
          <p class="theory-text">
            Представьте вашу жизнь как колесо. Каждая спица — это важная сфера: здоровье, карьера, отношения, финансы, хобби и личностный рост. Если одна из спиц короче других, колесо катится неровно.
          </p>

          <p class="theory-text">
            Точно так же работает и ваша жизнь. Дисбаланс в одной сфере влияет на все остальные. Нельзя быть по-настоящему успешным в карьере, если страдает здоровье. Сложно радоваться достижениям, если нет времени на близких.
          </p>

          <div class="idea-block">
            <div class="idea-icon-wrapper">
              <Lightbulb :size="24" :stroke-width="2" />
            </div>
            <div class="idea-content">
              <h3>Ключевая идея</h3>
              <p>Для роста нужен баланс. Цели работают только тогда, когда опираются на внутреннюю мотивацию и системное равновесие между всеми сферами жизни.</p>
            </div>
          </div>

          <div class="theory-steps-section">
            <h3>Что вас ждёт:</h3>
            <div class="theory-steps">
              <div class="theory-step">
                <span class="theory-step-num">1</span>
                <div class="theory-step-content">
                  <strong>Колесо баланса</strong>
                  <p>Оцените каждую из 6 сфер жизни от 0 до 10</p>
                </div>
              </div>
              <div class="theory-step">
                <span class="theory-step-num">2</span>
                <div class="theory-step-content">
                  <strong>Глубокая рефлексия</strong>
                  <p>Ответьте на вопросы о каждой сфере</p>
                </div>
              </div>
              <div class="theory-step">
                <span class="theory-step-num">3</span>
                <div class="theory-step-content">
                  <strong>Итоги и инсайты</strong>
                  <p>Зафиксируйте результаты и точки роста</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn btn-primary btn-lg btn-with-icon" @click="nextStep">
            Перейти к Колесу баланса
            <ArrowRight :size="18" />
          </button>
        </div>
      </div>
    </div>

    <!-- Step 2: Колесо баланса -->
    <div v-if="currentStep === 2" class="step-content">
      <div class="wheel-section">
        <header class="section-header">
          <h1>Система сбалансированных показателей</h1>
          <p class="subtitle">
            Оцените текущее состояние каждой сферы вашей жизни
          </p>
        </header>

        <div class="wheel-layout">
          <div class="wheel-main card">
            <div class="wheel-instruction">
              💡 Кликните на сектор и перетащите его край наружу или внутрь, чтобы изменить оценку от 0 до 10.
            </div>
            <WheelOfLife 
              :spheres="lifeSpheres"
              @update-sphere="handleSphereUpdate"
            />
          </div>

          <div class="wheel-sidebar">
            <div class="card sphere-details" v-if="selectedSphere">
              <h3>{{ selectedSphere.icon }} {{ selectedSphere.name }}</h3>
              <div class="score-display-large">
                <span class="score-value">{{ selectedSphere.score }}</span>
                <span class="score-max">/10</span>
              </div>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn btn-secondary" @click="prevStep">
            ← Назад к теории
          </button>
          <button class="btn btn-primary btn-lg" @click="nextStep" :disabled="!wheelCompleted">
            Продолжить →
          </button>
        </div>
      </div>
    </div>

    <!-- Step 3: Глубокая рефлексия -->
    <div v-if="currentStep === 3" class="step-content">
      <div class="reflection-section">
        <header class="section-header">
          <h1>Глубокая рефлексия</h1>
          <p class="subtitle">
            Кликните на сферу, чтобы раскрыть вопросы. Отвечайте честно — не думайте пока о реализации.
          </p>
        </header>

        <div class="reflection-accordion">
          <div 
            v-for="sphere in lifeSpheres" 
            :key="sphere.id"
            class="accordion-item"
            :class="{ 
              expanded: expandedSpheres.includes(sphere.id),
              'has-content': hasReflectionContent(sphere)
            }"
            :style="{ '--sphere-color': getSphereColor(sphere.id) }"
          >
            <div 
              class="accordion-header"
              @click="toggleSphereExpand(sphere.id)"
            >
              <div class="accordion-left">
                <div class="sphere-icon-wrapper" :style="{ color: getSphereColor(sphere.id) }">
                  <component :is="getSphereIcon(sphere.id)" :size="24" :stroke-width="2" />
                </div>
                <div class="sphere-title-info">
                  <h2>{{ sphere.name }}</h2>
                  <div class="header-meta">
                    <span class="score-badge-neutral">{{ sphere.score }}/10</span>
                    <span v-if="hasReflectionContent(sphere)" class="filled-badge">Заполнено</span>
                  </div>
                </div>
              </div>
              <ChevronDown 
                :size="20" 
                class="accordion-chevron" 
                :class="{ rotated: expandedSpheres.includes(sphere.id) }" 
              />
            </div>

            <div class="accordion-content" v-show="expandedSpheres.includes(sphere.id)">
              <div class="questions-group">
                <div class="question-item">
                  <label class="question-label">
                    📌 Почему я поставил именно эту оценку?
                  </label>
                  <textarea 
                    v-model="sphere.reflection.why"
                    @input="saveReflection(sphere.id)"
                    placeholder="Напишите свой ответ..."
                    class="reflection-textarea"
                    rows="3"
                  ></textarea>
                </div>

                <div class="question-item">
                  <label class="question-label">
                    ⭐ Что для меня "10" в этой сфере?
                  </label>
                  <textarea 
                    v-model="sphere.reflection.ten"
                    @input="saveReflection(sphere.id)"
                    placeholder="Опишите идеальное состояние..."
                    class="reflection-textarea"
                    rows="3"
                  ></textarea>
                </div>

                <div class="question-item">
                  <label class="question-label">
                    🚧 Что мешает дойти до "10"?
                  </label>
                  <textarea 
                    v-model="sphere.reflection.prevents"
                    @input="saveReflection(sphere.id)"
                    placeholder="Назовите препятствия и барьеры..."
                    class="reflection-textarea"
                    rows="3"
                  ></textarea>
                </div>

                <div class="question-item">
                  <label class="question-label">
                    🎯 Как я хочу, чтобы было?
                  </label>
                  <textarea 
                    v-model="sphere.reflection.desired"
                    @input="saveReflection(sphere.id)"
                    placeholder="Опишите, как вы хотите развивать эту сферу..."
                    class="reflection-textarea"
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn btn-secondary" @click="prevStep">
            ← Назад к колесу баланса
          </button>
          <button 
            class="btn btn-primary btn-lg" 
            @click="nextStep"
          >
            Продолжить к итогам →
          </button>
        </div>
      </div>
    </div>

    <!-- Step 4: Итог -->
    <div v-if="currentStep === 4" class="step-content">
      <div class="completion-section">
        <!-- Hero Celebration Block -->
        <div class="completion-hero">
          <div class="completion-icon">
            <CheckCircle2 :size="72" :stroke-width="1.5" />
          </div>
          <h1>Модуль завершён!</h1>
          <div class="completion-score">
            <span class="score-label">Ваш баланс</span>
            <span class="score-value">{{ backendAverageScore.toFixed(1) }}/10</span>
          </div>
        </div>

        <!-- Compact Metrics Row -->
        <div class="completion-metrics">
          <div class="metric-card">
            <div class="metric-icon">
              <Circle :size="24" :stroke-width="2" />
            </div>
            <div class="metric-value">{{ backendCategoriesCount }}</div>
            <div class="metric-label">сфер оценено</div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">
              <MessageSquare :size="24" :stroke-width="2" />
            </div>
            <div class="metric-value">{{ reflectionQuestionsData.answered }}/{{ reflectionQuestionsData.total }}</div>
            <div class="metric-label">вопросов рефлексии</div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">
              <Target :size="24" :stroke-width="2" />
            </div>
            <div class="metric-value">1</div>
            <div class="metric-label">колесо баланса</div>
          </div>
        </div>

        <!-- Single Insight Quote -->
        <div class="completion-insight">
          <blockquote>
            Баланс — это осознанный выбор приоритетов, а не идеальные 10/10 везде
          </blockquote>
        </div>

        <!-- Action Buttons -->
        <div class="completion-actions">
          <button class="btn btn-secondary" @click="resetModule">
            <RotateCcw :size="18" />
            Пройти заново
          </button>
          <button 
            class="btn btn-primary btn-lg" 
            @click="completeModule"
          >
            Перейти в Банк целей
            <ArrowRight :size="18" />
          </button>
        </div>
      </div>
    </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '../stores/app'
import { DEBUG_MODE } from '@/config/settings.js'
import WheelOfLife from '../components/WheelOfLife.vue'
import { 
  Wallet, 
  Palette, 
  Users, 
  Heart, 
  Briefcase, 
  HeartHandshake,
  ChevronDown,
  CheckCircle2,
  Circle,
  MessageSquare,
  Target,
  ArrowRight,
  RotateCcw,
  TrendingUp,
  Pencil,
  Check,
  X,
  Lightbulb,
  ChartPie,
  Sparkles
} from 'lucide-vue-next'

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

function getSphereIcon(sphereId) {
  return sphereIcons[sphereId] || Wallet
}

function getSphereColor(sphereId) {
  return sphereColors[sphereId] || '#6366f1'
}

const store = useAppStore()
const router = useRouter()
const route = useRoute()

const steps = ['Теория', 'ССП', 'Рефлексия', 'Итог']
const currentStep = ref(1)

const lifeSpheres = computed(() => store.lifeSpheres)
const selectedSphere = ref(null)
const sspModuleCompleted = computed(() => store.sspModuleCompleted)

const lessonStarted = ref(false)
const expandedSpheres = ref([])
const expandedSummarySpheres = ref([])

// Backend loading state
const isLoading = ref(false)
const backendError = ref(null)

function toggleSphereExpand(sphereId) {
  const index = expandedSpheres.value.indexOf(sphereId)
  if (index === -1) {
    expandedSpheres.value.push(sphereId)
  } else {
    expandedSpheres.value.splice(index, 1)
  }
}

function toggleSummarySphereExpand(sphereId) {
  const index = expandedSummarySpheres.value.indexOf(sphereId)
  if (index === -1) {
    expandedSummarySpheres.value.push(sphereId)
  } else {
    expandedSummarySpheres.value.splice(index, 1)
  }
}

const editingSphereId = ref(null)
const editingReflection = ref({
  why: '',
  ten: '',
  prevents: '',
  desired: ''
})

function startEditReflection(sphere) {
  editingSphereId.value = sphere.id
  editingReflection.value = {
    why: sphere.reflection?.why || '',
    ten: sphere.reflection?.ten || '',
    prevents: sphere.reflection?.prevents || '',
    desired: sphere.reflection?.desired || ''
  }
  if (!expandedSummarySpheres.value.includes(sphere.id)) {
    expandedSummarySpheres.value.push(sphere.id)
  }
}

function cancelEditReflection() {
  editingSphereId.value = null
  editingReflection.value = { why: '', ten: '', prevents: '', desired: '' }
}

async function saveEditReflection(sphereId) {
  store.updateSphereReflection(sphereId, { ...editingReflection.value })
  editingSphereId.value = null
  editingReflection.value = { why: '', ten: '', prevents: '', desired: '' }
  
  // Сохраняем рефлексию на бэкенд
  if (DEBUG_MODE) {
    console.log('[SSP] Saving edited reflection for sphere:', sphereId)
  }
  const result = await store.saveSSPReflectionToBackend(sphereId)
  if (!result.success && DEBUG_MODE) {
    console.warn('[SSP] Failed to save edited reflection:', result.error)
  }
}

function hasReflectionContent(sphere) {
  if (!sphere.reflection) return false
  return sphere.reflection.why || sphere.reflection.ten || 
         sphere.reflection.prevents || sphere.reflection.desired
}

const showEmptyState = computed(() => {
  return false
})

const showSummary = computed(() => {
  return !!sspModuleCompleted.value?.completed
})

const averageScore = computed(() => {
  const scores = lifeSpheres.value.map(s => s.score || 0)
  return scores.reduce((a, b) => a + b, 0) / scores.length
})

const strongestSphere = computed(() => {
  return lifeSpheres.value.reduce((max, s) => 
    (!max || (s.score || 0) > (max.score || 0)) ? s : max
  , null)
})

const weakestSphere = computed(() => {
  return lifeSpheres.value.reduce((min, s) => 
    (!min || (s.score || 0) < (min.score || 0)) ? s : min
  , null)
})

const reflectionQuestionsData = computed(() => {
  const backendData = store.sspBackendData
  const totalData = backendData?.totalData
  if (totalData && typeof totalData.reflection_questions_answers === 'number') {
    return {
      answered: totalData.reflection_questions_answers,
      total: totalData.reflection_questions_total || 24
    }
  }
  return { answered: 0, total: 24 }
})

const backendAverageScore = computed(() => {
  const backendData = store.sspBackendData
  const totalData = backendData?.totalData
  if (totalData && typeof totalData.user_rating === 'number') {
    return totalData.user_rating
  }
  return averageScore.value
})

const backendCategoriesCount = computed(() => {
  const backendData = store.sspBackendData
  const totalData = backendData?.totalData
  if (totalData && typeof totalData.categories_with_rating === 'number') {
    return totalData.categories_with_rating
  }
  return lifeSpheres.value.filter(s => s.score > 0).length
})

const formatCompletedDate = computed(() => {
  if (!sspModuleCompleted.value?.completedAt) return ''
  const date = new Date(sspModuleCompleted.value.completedAt)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

function startLesson() {
  lessonStarted.value = true
}

function goToGoalsBank() {
  router.push('/app/goals-bank')
}

function restartLesson() {
  if (confirm('Вы уверены? Все оценки и рефлексии будут сброшены.')) {
    store.resetSSPModule()
    lessonStarted.value = false
    currentStep.value = 1
  }
}

const wheelCompleted = computed(() => {
  return lifeSpheres.value.every(s => s.score > 0)
})


async function nextStep() {
  if (currentStep.value < 4) {
    // Сохраняем оценки при переходе с шага 2 (ССП) на шаг 3
    if (currentStep.value === 2) {
      if (DEBUG_MODE) {
        console.log('[SSP] Saving ratings to backend before step 3...')
      }
      const result = await store.saveSSPRatingsToBackend()
      if (!result.success && DEBUG_MODE) {
        console.warn('[SSP] Failed to save ratings:', result.error)
      }
    }
    
    // Сохраняем все рефлексии при переходе с шага 3 на шаг 4
    if (currentStep.value === 3) {
      if (DEBUG_MODE) {
        console.log('[SSP] Saving all reflections to backend before step 4...')
      }
      const result = await store.saveAllSSPReflectionsToBackend()
      if (!result.success && DEBUG_MODE) {
        console.warn('[SSP] Failed to save reflections:', result.error)
      }
    }
    
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function goToStep(step) {
  if (step <= currentStep.value || step === currentStep.value + 1) {
    currentStep.value = step
  }
}

function handleSphereUpdate(sphereData) {
  selectedSphere.value = sphereData
  store.updateSphere(sphereData.id, { score: sphereData.score })
}

function saveSphereNotes() {
  if (selectedSphere.value) {
    store.updateSphere(selectedSphere.value.id, { 
      notes: selectedSphere.value.notes 
    })
  }
}

function getSphereById(sphereId) {
  return lifeSpheres.value.find(s => s.id === sphereId)
}

async function saveReflection(sphereId) {
  store.updateSphere(sphereId, {
    reflection: lifeSpheres.value.find(s => s.id === sphereId)?.reflection
  })
  
  // Сохраняем рефлексию на бэкенд
  if (DEBUG_MODE) {
    console.log('[SSP] Saving reflection for sphere:', sphereId)
  }
  const result = await store.saveSSPReflectionToBackend(sphereId)
  if (!result.success && DEBUG_MODE) {
    console.warn('[SSP] Failed to save reflection:', result.error)
  }
}

async function completeModule() {
  // Сохраняем все данные на бэкенд перед завершением
  if (DEBUG_MODE) {
    console.log('[SSP] Saving all SSP data to backend before completion...')
  }
  
  const result = await store.saveAllSSPReflectionsToBackend()
  if (!result.success && DEBUG_MODE) {
    console.warn('[SSP] Failed to save SSP data on completion:', result.error)
  }
  
  store.completeSSPModule({
    completedAt: new Date().toISOString(),
    wheelData: lifeSpheres.value.map(s => ({
      id: s.id,
      score: s.score,
      notes: s.notes,
      reflection: s.reflection
    }))
  })
  router.push('/app/goals-bank')
}

function resetModule() {
  // Сбрасываем флаг завершения модуля через store (с сохранением в localStorage)
  store.resetSSPModule()
  
  // Сбрасываем локальное состояние
  currentStep.value = 1
  lessonStarted.value = false
  expandedSpheres.value = []
  expandedSummarySpheres.value = []
  
  if (DEBUG_MODE) {
    console.log('[SSP] Module reset, starting from beginning')
  }
}

function handleStepFromQuery() {
  const stepParam = route.query.spp_step
  
  if (stepParam === undefined || stepParam === null) {
    return
  }
  
  const step = parseInt(stepParam, 10)
  
  if (isNaN(step) || step < 0 || step > 4) {
    if (DEBUG_MODE) {
      console.log('[SSP] Invalid spp_step parameter:', stepParam)
    }
    return
  }
  
  if (DEBUG_MODE) {
    console.log('[SSP] Handling spp_step parameter:', step)
  }
  
  if (step === 0) {
    lessonStarted.value = false
    currentStep.value = 1
  } else {
    lessonStarted.value = true
    currentStep.value = step
  }
}

onMounted(async () => {
  // Загружаем данные ССП с бэкенда
  isLoading.value = true
  backendError.value = null
  
  try {
    if (DEBUG_MODE) {
      console.log('[SSP] Loading SSP data from backend on mount...')
    }
    const result = await store.loadSSPFromBackend()
    
    if (result && result.totalData) {
      if (DEBUG_MODE) {
        console.log('[SSP] SSP data loaded successfully:', {
          categoriesWithRating: result.totalData.categories_with_rating,
          userRating: result.totalData.user_rating,
          reflectionAnswers: result.totalData.reflection_questions_answers,
          reflectionTotal: result.totalData.reflection_questions_total
        })
      }
      
      const totalData = result.totalData
      
      // Проверка "нет данных" - только если нет оценок категорий
      // user_rating может быть 0 легитимно (пользователь поставил 0), поэтому не используем его
      const hasNoData = totalData.categories_with_rating === 0
      
      // Проверяем, завершён ли модуль (есть в localStorage или все данные заполнены)
      const isModuleCompleted = store.sspModuleCompleted.completed || 
                                (totalData.categories_with_rating >= 6 && 
                                 totalData.reflection_questions_answers >= totalData.reflection_questions_total)
      
      if (hasNoData && !isModuleCompleted) {
        // Нет данных - показываем экран 0 (приветствие)
        if (DEBUG_MODE) {
          console.log('[SSP] No data found, showing welcome screen (step 0)')
        }
        lessonStarted.value = false
        currentStep.value = 1
      } else if (isModuleCompleted) {
        // Модуль завершён - показываем итоговый экран
        if (DEBUG_MODE) {
          console.log('[SSP] Module completed, showing summary screen (step 4)')
        }
        lessonStarted.value = true
        currentStep.value = 4
      } else {
        // Есть частичные данные - определяем текущий шаг
        if (DEBUG_MODE) {
          console.log('[SSP] Partial data found, determining current step')
        }
        lessonStarted.value = true
        
        if (totalData.reflection_questions_answers > 0) {
          // Есть ответы на рефлексию - шаг 3 или 4
          currentStep.value = 3
        } else if (totalData.categories_with_rating > 0) {
          // Есть оценки - шаг 2
          currentStep.value = 2
        } else {
          // Начинаем с теории
          currentStep.value = 1
        }
      }
    } else {
      // Нет данных с бэкенда - показываем приветствие
      if (DEBUG_MODE) {
        console.log('[SSP] No backend data, checking localStorage...')
      }
      
      // Проверяем localStorage на случай если бэкенд недоступен
      if (store.sspModuleCompleted.completed) {
        lessonStarted.value = true
        currentStep.value = 4
      } else {
        lessonStarted.value = false
        currentStep.value = 1
      }
    }
  } catch (error) {
    if (DEBUG_MODE) {
      console.error('[SSP] Error loading SSP data:', error)
    }
    backendError.value = 'Ошибка загрузки данных'
    
    // При ошибке проверяем localStorage
    if (store.sspModuleCompleted.completed) {
      lessonStarted.value = true
      currentStep.value = 4
    }
  } finally {
    isLoading.value = false
  }
  
  // Обрабатываем GET параметр (может перезаписать автоопределение шага)
  handleStepFromQuery()
})

watch(() => route.query.spp_step, () => {
  handleStepFromQuery()
})
</script>

<style scoped>
.ssp-container {
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: 2rem;
}

/* Empty State Styles */
.empty-state-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.empty-state-card {
  text-align: center;
  max-width: 600px;
  padding: 3rem;
}

.empty-state-card .empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.hero-icon-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: var(--primary-color);
}

.empty-state-card h1 {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.empty-state-card .subtitle {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.lesson-info {
  text-align: left;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.lesson-info h3 {
  font-size: 1rem;
  margin-bottom: 1rem;
}

.lesson-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lesson-step {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.lesson-step .step-num {
  width: 28px;
  height: 28px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.lesson-step strong {
  display: block;
  margin-bottom: 0.25rem;
}

.lesson-step p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Summary Styles */
.summary-section-main {
  max-width: 900px;
  margin: 0 auto;
}

.summary-section-main .section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.summary-section-main .section-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.summary-section-main .section-header .subtitle {
  color: var(--text-secondary);
}

/* Compact Stats Row */
.summary-stats-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.summary-stat-compact {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  flex: 1;
  min-width: 180px;
}

.stat-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.stat-icon-wrapper.stat-icon-primary {
  color: var(--primary-color);
  background: rgba(99, 102, 241, 0.1);
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1.2;
}

.stat-value-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.2;
}

@media (max-width: 640px) {
  .summary-stats-row {
    flex-direction: column;
  }
  
  .summary-stat-compact {
    min-width: 100%;
  }
}

.wheel-summary {
  margin-bottom: 2rem;
  text-align: center;
}

.wheel-summary h3 {
  margin-bottom: 1rem;
}

.wheel-visualization {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 0;
  max-width: 700px;
  margin: 0 auto;
}

.spheres-results {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sphere-result-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
}

.sphere-icon {
  font-size: 1.5rem;
  width: 2rem;
  flex-shrink: 0;
}

.sphere-name {
  width: 180px;
  font-weight: 500;
  flex-shrink: 0;
}

.score-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.sphere-score {
  width: 50px;
  text-align: right;
  font-weight: 600;
  color: var(--primary-color);
  flex-shrink: 0;
}

.summary-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .sphere-result-item {
    flex-wrap: wrap;
  }
  
  .sphere-name {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .score-bar {
    flex: 1;
    min-width: 150px;
  }
}

.progress-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
  padding: 0 2rem;
}

.progress-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.progress-step.active,
.progress-step.completed {
  opacity: 1;
}

.progress-step::before {
  content: '';
  position: absolute;
  top: 20px;
  right: 50%;
  width: 100%;
  height: 2px;
  background: var(--border-color);
  z-index: 0;
}

.progress-step:first-child::before {
  display: none;
}

.progress-step.completed::before,
.progress-step.active::before {
  background: var(--primary-color);
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.progress-step.active .step-number {
  background: var(--primary-color);
  color: white;
  transform: scale(1.1);
}

.progress-step.completed .step-number {
  background: var(--success-color);
  color: white;
}

.step-label {
  font-size: 0.875rem;
  text-align: center;
  font-weight: 500;
  color: var(--text-secondary);
}

.progress-step.active .step-label {
  color: var(--text-primary);
  font-weight: 600;
}

.step-content {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.video-container {
  margin-bottom: 2rem;
}

.video-placeholder {
  aspect-ratio: 16/9;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  padding: 2rem;
}

.play-button {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-button:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(1.05);
}

.theory-content h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 600;
}

.theory-text {
  margin-bottom: 1.25rem;
  line-height: 1.7;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.idea-block {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(99, 102, 241, 0.06);
  border-radius: var(--radius-md);
  border: 1px solid rgba(99, 102, 241, 0.15);
  margin-bottom: 1.5rem;
}

.idea-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(99, 102, 241, 0.12);
  border-radius: var(--radius-sm);
  color: var(--primary-color);
  flex-shrink: 0;
}

.idea-content h3 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
}

.idea-content p {
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0;
}

/* Theory Steps Section */
.theory-steps-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.theory-steps-section h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.theory-steps {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.theory-step {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.theory-step-num {
  width: 28px;
  height: 28px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.theory-step-content strong {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.125rem;
  color: var(--text-primary);
}

.theory-step-content p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

/* Button with icon */
.btn-with-icon {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.idea-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.idea-block h3 {
  color: var(--primary-color);
  margin-bottom: 0.75rem;
}

.belief-transformation {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  align-items: center;
  margin: 2rem 0;
  padding: 2rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.old-belief h4,
.new-belief h4 {
  margin-bottom: 1rem;
}

.old-belief ul,
.new-belief ul {
  list-style: none;
  padding: 0;
}

.old-belief li,
.new-belief li {
  padding: 0.5rem 0;
  font-size: 0.9375rem;
}

.arrow {
  font-size: 2rem;
  color: var(--primary-color);
}

.journey-vision {
  margin-top: 2rem;
}

.journey-vision h3 {
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 1.5rem;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.benefit-item {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.benefit-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.benefit-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.benefit-item h4 {
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
}

.benefit-item p {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin: 0;
}

.reflection-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.reflection-card {
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
  transition: all 0.3s ease;
}

.reflection-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
}

.sphere-header {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--border-color);
}

.sphere-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.sphere-title-info h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.score-badge {
  display: inline-block;
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.questions-group {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.question-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.question-label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.reflection-textarea {
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  transition: all 0.2s ease;
}

.reflection-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.reflection-textarea::placeholder {
  color: var(--text-secondary);
}

.reflection-accordion {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.accordion-item {
  position: relative;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-left: 4px solid var(--sphere-color, var(--border-color));
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.2s ease;
}

.accordion-item:hover {
  background: var(--bg-primary);
  box-shadow: var(--shadow-sm);
}

.accordion-item.expanded {
  border-left-width: 4px;
  box-shadow: var(--shadow-md);
}

.accordion-item.has-content:not(.expanded)::after {
  content: '';
  position: absolute;
  right: 3.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background: var(--success-color);
  border-radius: 50%;
}

.accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;
}

.accordion-header:hover {
  background: rgba(99, 102, 241, 0.03);
}

.accordion-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.accordion-left .sphere-icon {
  font-size: 2rem;
}

.sphere-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: color-mix(in srgb, currentColor 10%, transparent);
  transition: all 0.2s ease;
}

.accordion-item:hover .sphere-icon-wrapper {
  background: color-mix(in srgb, currentColor 15%, transparent);
}

.score-badge-neutral {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
  padding: 0.15rem 0.5rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

.accordion-chevron {
  color: var(--text-secondary);
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.accordion-chevron.rotated {
  transform: rotate(180deg);
}

.accordion-left .sphere-title-info h2 {
  margin: 0;
  font-size: 1.25rem;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.filled-badge {
  font-size: 0.75rem;
  color: var(--success-color);
  font-weight: 600;
}

.accordion-arrow {
  font-size: 0.75rem;
  color: var(--text-secondary);
  transition: transform 0.3s ease;
}

.accordion-arrow.rotated {
  transform: rotate(180deg);
}

.accordion-content {
  padding: 0 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid var(--border-color);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.accordion-content .questions-group {
  padding-top: 1.5rem;
}

/* Reflection Summary Styles */
.reflection-summary {
  margin-bottom: 2rem;
}

.reflection-summary h3 {
  margin-bottom: 1.5rem;
  text-align: center;
}

.reflection-accordion.readonly .accordion-item {
  cursor: pointer;
}

.reflection-answers {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1rem;
}

.answer-item {
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  padding: 1rem;
}

.answer-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.answer-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-primary);
  white-space: pre-wrap;
}

.no-reflection {
  padding: 1.5rem;
  text-align: center;
  color: var(--text-muted);
  font-style: italic;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.no-reflection span {
  font-style: italic;
}

.no-reflection .btn {
  font-style: normal;
}

/* Accordion Right Side */
.accordion-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Edit Reflection Button */
.btn-edit-reflection {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;
}

.accordion-header:hover .btn-edit-reflection {
  opacity: 1;
}

.btn-edit-reflection:hover {
  background: var(--bg-tertiary);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

/* Reflection Edit Form */
.reflection-edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1rem;
}

.reflection-edit-form .question-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reflection-edit-form .question-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.reflection-edit-form .reflection-textarea {
  padding: 0.75rem;
  font-size: 0.9rem;
  min-height: 60px;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
  margin-top: 0.5rem;
}

.edit-actions .btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.accordion-item.editing {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.summary-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.summary-card,
.insight-card,
.next-steps-card {
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
}

.summary-card h2,
.insight-card h2,
.next-steps-card h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.achievement-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.achievement-item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--primary-color);
}

.achievement-icon {
  font-size: 1.75rem;
  flex-shrink: 0;
}

.achievement-item h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.achievement-item p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.insight-list,
.next-steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.insight-list li,
.next-steps-list li {
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--primary-color);
  font-size: 0.95rem;
  line-height: 1.6;
}

.insight-card p,
.next-steps-card p {
  margin: 0 0 1.5rem 0;
  color: var(--text-secondary);
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 500px;
  gap: 1rem;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-right: 0.5rem;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: var(--bg-primary);
  border-radius: 10px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 10px;
}

.message {
  display: flex;
  gap: 0.75rem;
  animation: fadeIn 0.3s ease;
}

.message.user {
  justify-content: flex-end;
}

.message.user .message-content {
  background: var(--primary-color);
  color: white;
}

.message.coach-message .message-content {
  background: rgba(99, 102, 241, 0.1);
  color: var(--text-primary);
}

.message-avatar {
  font-size: 1.5rem;
  flex-shrink: 0;
  align-self: flex-end;
}

.message-content {
  max-width: 85%;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  word-wrap: break-word;
}

.message-content p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.chat-input-area {
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
}

.chat-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-family: inherit;
  transition: all 0.2s ease;
}

.chat-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.chat-input::placeholder {
  color: var(--text-secondary);
}

.btn-send {
  padding: 0.75rem 1.5rem;
  background: #4ade80;
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.btn-send:hover {
  background: #22c55e;
  transform: translateY(-2px);
}

.btn-send:active {
  transform: translateY(0);
}

.wheel-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.wheel-main {
  padding: 2rem;
}

.wheel-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ai-coach {
  padding: 1.5rem;
}

.coach-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.coach-icon {
  font-size: 2rem;
}

.coach-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.coach-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-tertiary);
}

.status-indicator.active {
  background: var(--success-color);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.coach-intro {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.sphere-details {
  padding: 1.5rem;
}

.sphere-details h3 {
  margin-bottom: 1rem;
}

.score-display-large {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.score-value {
  font-size: 3rem;
  font-weight: 700;
  color: var(--primary-color);
}

.score-max {
  font-size: 1.5rem;
  color: var(--text-secondary);
  margin-left: 0.25rem;
}

.instruction-card {
  margin-bottom: 2rem;
}

.instruction-card h3 {
  margin-bottom: 1rem;
}

.instruction-list {
  padding-left: 1.5rem;
  color: var(--text-secondary);
}

.instruction-list li {
  padding: 0.5rem 0;
  line-height: 1.6;
}

.results-summary h2 {
  font-size: 1.75rem;
  margin-bottom: 2rem;
  text-align: center;
}

.summary-block {
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.summary-block:last-child {
  border-bottom: none;
}

.summary-block h3 {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
}

.wheel-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sphere-summary-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sphere-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 200px;
}

.sphere-score-bar {
  flex: 1;
  height: 32px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  position: relative;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transition: width 0.3s ease;
}

.score-label {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.hint {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  margin-bottom: 1.5rem;
}

.focus-goals-selector {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.goal-checkbox-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.goal-checkbox-item:hover {
  background: var(--bg-tertiary);
}

.goal-checkbox-item.selected {
  border-color: var(--primary-color);
  background: rgba(99, 102, 241, 0.05);
}

.goal-info {
  flex: 1;
}

.goal-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.goal-sphere {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.priority-summary {
  padding: 1rem;
  background: rgba(99, 102, 241, 0.05);
  border-radius: var(--radius-md);
  text-align: center;
}

.wheel-instruction {
  padding: 1rem;
  margin-bottom: 1.5rem;
  background: rgba(99, 102, 241, 0.08);
  border-left: 4px solid var(--primary-color);
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-primary);
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}

.step-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 1024px) {
  .wheel-layout {
    grid-template-columns: 1fr;
  }

  .belief-transformation {
    grid-template-columns: 1fr;
  }

  .arrow {
    transform: rotate(90deg);
    text-align: center;
  }
}

@media (max-width: 768px) {
  .progress-bar {
    padding: 0 0.5rem;
  }

  .step-label {
    font-size: 0.75rem;
  }

  .section-header h1 {
    font-size: 1.75rem;
  }

  .benefits-grid {
    grid-template-columns: 1fr;
  }
}

/* Completion Section (Step 4) */
.completion-section {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
  padding: 2rem 1rem;
}

.completion-hero {
  margin-bottom: 2.5rem;
}

.completion-icon {
  color: #22c55e;
  margin-bottom: 1rem;
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.completion-hero h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.completion-score {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.completion-score .score-label {
  position: static;
  transform: none;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.completion-score .score-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.completion-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-card {
  padding: 1.25rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
}

.metric-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}

.metric-icon {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 0.25rem;
}

.metric-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.completion-insight {
  margin-bottom: 2.5rem;
}

.completion-insight blockquote {
  font-size: 1.1rem;
  font-style: italic;
  color: var(--text-secondary);
  padding: 1.25rem 1.5rem;
  margin: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(99, 102, 241, 0.02));
  border-left: 4px solid var(--primary-color);
  border-radius: var(--radius-md);
  line-height: 1.6;
}

.completion-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.completion-actions .btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 600px) {
  .completion-metrics {
    grid-template-columns: 1fr;
  }
  
  .completion-hero h1 {
    font-size: 1.5rem;
  }
  
  .completion-actions {
    flex-direction: column;
  }
  
  .completion-actions .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
