<template>
  <div class="newyear-results">
    <!-- Snowflakes animation -->
    <div class="snowflakes" aria-hidden="true">
      <div class="snowflake">❄</div>
      <div class="snowflake">❅</div>
      <div class="snowflake">✨</div>
      <div class="snowflake">❆</div>
      <div class="snowflake">❄</div>
      <div class="snowflake">⭐</div>
      <div class="snowflake">❅</div>
      <div class="snowflake">✨</div>
      <div class="snowflake">❆</div>
      <div class="snowflake">❄</div>
      <div class="snowflake">❅</div>
      <div class="snowflake">⭐</div>
    </div>

    <!-- Sparkle decorations -->
    <div class="sparkles" aria-hidden="true">
      <div class="sparkle">✦</div>
      <div class="sparkle">✧</div>
      <div class="sparkle">✦</div>
      <div class="sparkle">✧</div>
      <div class="sparkle">✦</div>
    </div>

    <header class="results-header">
      <div class="container">
        <div class="logo">
          <span class="logo-icon">1%</span>
          <span class="logo-text">OnePercent</span>
        </div>
      </div>
    </header>

    <main class="results-main">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-animation">
            <div class="spinner"></div>
            <div class="loading-text">
              <h2>Генерируем твой план на 2026 ✨</h2>
              <p>{{ loadingMessage }}</p>
            </div>
          </div>
          <div class="loading-steps">
            <div class="loading-step" :class="{ active: loadingStep >= 1, done: loadingStep > 1 }">
              <span class="step-icon">{{ loadingStep > 1 ? '✓' : '1' }}</span>
              <span>Анализируем твои ответы</span>
            </div>
            <div class="loading-step" :class="{ active: loadingStep >= 2, done: loadingStep > 2 }">
              <span class="step-icon">{{ loadingStep > 2 ? '✓' : '2' }}</span>
              <span>Подбираем цели</span>
            </div>
            <div class="loading-step" :class="{ active: loadingStep >= 3, done: loadingStep > 3 }">
              <span class="step-icon">{{ loadingStep > 3 ? '✓' : '3' }}</span>
              <span>Составляем план действий</span>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div v-else class="results-content">
          <div class="results-hero">
            <h1>Твои итоги 2025 ✨</h1>
            <p>Анализ твоего года по 6 ключевым сферам жизни</p>
          </div>

          <div class="spheres-grid">
            <div 
              v-for="sphere in store.spheres" 
              :key="sphere.id"
              class="sphere-card"
            >
              <div class="sphere-header">
                <span class="sphere-icon">{{ sphere.icon }}</span>
                <span class="sphere-name">{{ sphere.name }}</span>
              </div>
              <div class="sphere-score-bar">
                <div 
                  class="score-fill" 
                  :style="{ 
                    width: (store.sphereScores[sphere.id] * 10) + '%',
                    background: sphere.color 
                  }"
                ></div>
              </div>
              <div class="sphere-score">{{ store.sphereScores[sphere.id] || 0 }}/10</div>
            </div>
          </div>

          <div class="insights-section">
            <div class="insight-card strengths">
              <h3>💪 Твои сильные стороны</h3>
              <div class="insight-list">
                <div 
                  v-for="(sphere, index) in store.topStrengths" 
                  :key="sphere.id"
                  class="insight-item"
                >
                  <span class="insight-rank">#{{ index + 1 }}</span>
                  <span class="insight-icon">{{ sphere.icon }}</span>
                  <span class="insight-name">{{ sphere.name }}</span>
                  <span class="insight-score">{{ store.sphereScores[sphere.id] }}</span>
                </div>
              </div>
            </div>

            <div class="insight-card growth">
              <h3>🎯 Зоны роста</h3>
              <div class="insight-list">
                <div 
                  v-for="(sphere, index) in store.growthZones" 
                  :key="sphere.id"
                  class="insight-item"
                >
                  <span class="insight-rank">#{{ index + 1 }}</span>
                  <span class="insight-icon">{{ sphere.icon }}</span>
                  <span class="insight-name">{{ sphere.name }}</span>
                  <span class="insight-score">{{ store.sphereScores[sphere.id] }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="lever-section" v-if="store.mainLever">
            <div class="lever-card">
              <div class="lever-badge">Главный рычаг 2026</div>
              <div class="lever-content">
                <span class="lever-icon">{{ store.mainLever.icon }}</span>
                <h2>{{ store.mainLever.name }}</h2>
                <p>Улучшение этой сферы даст максимальный эффект на все остальные области твоей жизни</p>
              </div>
            </div>
          </div>

          <!-- AI-Generated Plan Section -->
          <div class="plan-section" v-if="plan">
            <div class="plan-hero">
              <h2>🎯 Твой план на 2026</h2>
              <p class="motivation">{{ plan.motivation }}</p>
            </div>

            <div class="goals-section">
              <h3>Цели на 2026</h3>
              <div class="goals-list">
                <div 
                  v-for="(goal, index) in plan.goals" 
                  :key="goal.id"
                  class="goal-card"
                  :class="{ expanded: expandedGoal === index }"
                >
                  <div class="goal-header" @click="toggleGoal(index)">
                    <div class="goal-number">{{ index + 1 }}</div>
                    <div class="goal-info">
                      <div class="goal-sphere">{{ getSphereIcon(goal.sphereId) }} {{ getSphereName(goal.sphereId) }}</div>
                      <h4 class="goal-title">{{ goal.title }}</h4>
                      <div class="goal-metric">📊 {{ goal.metric }}</div>
                    </div>
                    <div class="expand-icon">{{ expandedGoal === index ? '−' : '+' }}</div>
                  </div>
                  <div class="goal-steps" v-show="expandedGoal === index">
                    <div class="steps-header">
                      <span>Шаги к цели</span>
                      <span class="total-hours">{{ getTotalHours(goal.steps) }}ч</span>
                    </div>
                    <div 
                      v-for="(step, si) in goal.steps" 
                      :key="si"
                      class="step-item"
                    >
                      <span class="step-checkbox">☐</span>
                      <span class="step-title">{{ step.title }}</span>
                      <span class="step-hours">{{ step.hours }}ч</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="week-plan-section">
              <h3>План на январь</h3>
              <div class="weeks-grid">
                <div 
                  v-for="week in plan.weekPlan" 
                  :key="week.week"
                  class="week-card"
                >
                  <div class="week-header">
                    <span class="week-number">Неделя {{ week.week }}</span>
                    <span class="week-dates">{{ getWeekDates(week.week) }}</span>
                  </div>
                  <div class="week-focus">{{ week.focus }}</div>
                  <ul class="week-tasks">
                    <li v-for="(task, ti) in week.tasks" :key="ti">{{ task }}</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- CTA Block -->
            <div class="cta-section">
              <div class="cta-card">
                <h2>🚀 Сохрани план в приложении</h2>
                <p>Все {{ totalSteps }} шагов автоматически появятся в твоём планировщике с напоминаниями</p>
                <router-link to="/auth/register" class="cta-btn pulse">
                  Добавить в OnePercent
                  <span class="arrow">→</span>
                </router-link>
                <p class="cta-hint">Бесплатно • Telegram-бот напомнит о задачах</p>
              </div>
            </div>
          </div>

          <div class="share-section">
            <h3>Поделись результатами</h3>
            <div class="share-buttons">
              <button class="share-btn telegram" @click="shareToTelegram">
                <span class="btn-icon">📱</span>
                Telegram
              </button>
              <button class="share-btn copy" @click="copyLink">
                <span class="btn-icon">🔗</span>
                {{ copied ? 'Скопировано!' : 'Копировать ссылку' }}
              </button>
            </div>
          </div>

          <div class="restart-section">
            <button class="restart-btn" @click="restartTest">
              Пройти тест заново
            </button>
          </div>
        </div>
      </div>
    </main>

    <footer class="results-footer">
      <div class="container">
        <div class="footer-legal">
          <div class="legal-links">
            <a href="https://percent1.ru/privacy" target="_blank" rel="noopener noreferrer">Политика конфиденциальности</a>
            <a href="https://percent1.ru/termspolicy" target="_blank" rel="noopener noreferrer">Пользовательское соглашение</a>
            <a href="https://percent1.ru/disclaimer" target="_blank" rel="noopener noreferrer">Отказ от ответственности</a>
          </div>
          <div class="company-info">
            <p>ИП Косик Дмитрий Владимирович | ИНН: 711280092908 | ОГРНИП: 321774600674346</p>
          </div>
          <p class="copyright">© 2025 OnePercent. Все права защищены.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNewYearStore } from '@/stores/newyear'
import { useLandingSSPStore } from '@/stores/landingSSP'
import { DEBUG_MODE } from '@/config/settings.js'
import confetti from 'canvas-confetti'

const router = useRouter()
const route = useRoute()
const store = useNewYearStore()
const landingSSPStore = useLandingSSPStore()

const loading = ref(true)
const loadingStep = ref(1)
const loadingMessage = ref('Анализируем твои ответы...')
const plan = ref(null)
const expandedGoal = ref(0)
const copied = ref(false)
const backendData = ref(null)
const loadError = ref(null)

const backendCategoryToSphereId = {
  'welfare': 'welfare',
  'hobby': 'hobby',
  'environment': 'environment',
  'health_sport': 'health',
  'work': 'work',
  'family': 'family'
}

const demoPlan = {
  motivation: 'Ты уже сделал первый шаг — проанализировал свой год. Теперь пора действовать! Каждый маленький шаг приближает тебя к большим переменам.',
  goals: [
    {
      id: 'goal-1',
      title: 'Создать финансовую подушку безопасности',
      sphereId: 'welfare',
      metric: 'Накопить 3 месячных дохода к июню 2026',
      steps: [
        { title: 'Проанализировать расходы за последние 3 месяца', hours: 2 },
        { title: 'Открыть накопительный счёт с высоким процентом', hours: 1 },
        { title: 'Настроить автоматический перевод 10% зарплаты', hours: 0.5 },
        { title: 'Найти 3 статьи расходов для оптимизации', hours: 1 }
      ]
    },
    {
      id: 'goal-2',
      title: 'Восстановить энергию и здоровье',
      sphereId: 'health',
      metric: 'Тренировки 3 раза в неделю, сон 7-8 часов',
      steps: [
        { title: 'Записаться в фитнес-клуб рядом с домом', hours: 1 },
        { title: 'Составить план тренировок на неделю', hours: 1 },
        { title: 'Установить напоминание ложиться до 23:00', hours: 0.5 },
        { title: 'Пройти базовый чек-ап здоровья', hours: 3 }
      ]
    },
    {
      id: 'goal-3',
      title: 'Развить профессиональные навыки',
      sphereId: 'work',
      metric: 'Пройти 1 курс и получить повышение/новый оффер',
      steps: [
        { title: 'Определить 3 ключевых навыка для развития', hours: 1 },
        { title: 'Выбрать онлайн-курс и начать обучение', hours: 2 },
        { title: 'Обновить резюме с новыми достижениями', hours: 2 },
        { title: 'Назначить встречу с руководителем о карьере', hours: 1 }
      ]
    }
  ],
  weekPlan: [
    { week: 1, focus: 'Анализ и планирование', tasks: ['Проанализировать расходы', 'Записаться в зал', 'Определить навыки для развития'] },
    { week: 2, focus: 'Запуск систем', tasks: ['Открыть накопительный счёт', 'Первая тренировка', 'Выбрать курс'] },
    { week: 3, focus: 'Закрепление привычек', tasks: ['3 тренировки за неделю', 'Начать курс', 'Настроить автоперевод'] },
    { week: 4, focus: 'Первые результаты', tasks: ['Проверить накопления', 'Обновить резюме', 'Оценить прогресс'] }
  ]
}

const totalSteps = computed(() => {
  if (!plan.value?.goals) return 0
  return plan.value.goals.reduce((sum, g) => sum + (g.steps?.length || 0), 0)
})

function getSphereIcon(id) {
  const sphere = store.spheres.find(s => s.id === id)
  return sphere?.icon || '🎯'
}

function getSphereName(id) {
  const sphere = store.spheres.find(s => s.id === id)
  return sphere?.name || id
}

function getTotalHours(steps) {
  if (!steps) return 0
  return steps.reduce((sum, s) => sum + (s.hours || 0), 0)
}

function getWeekDates(weekNum) {
  const jan1 = new Date(2026, 0, 1)
  const dayOfWeek = jan1.getDay()
  const firstMonday = dayOfWeek === 0 ? 2 : dayOfWeek === 1 ? 1 : 9 - dayOfWeek
  const startDay = firstMonday + (weekNum - 1) * 7
  const endDay = startDay + 6
  return `${startDay}-${Math.min(endDay, 31)} января`
}

function toggleGoal(index) {
  expandedGoal.value = expandedGoal.value === index ? -1 : index
}

function fireConfetti() {
  const duration = 3000
  const end = Date.now() + duration
  const colors = ['#d97706', '#f59e0b', '#10b981', '#8b5cf6', '#3b82f6']

  ;(function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }())
}

async function generatePlan() {
  loading.value = true
  loadingStep.value = 1
  loadingMessage.value = 'Анализируем твои ответы...'

  try {
    setTimeout(() => {
      loadingStep.value = 2
      loadingMessage.value = 'Подбираем персональные цели...'
    }, 1500)
    
    setTimeout(() => {
      loadingStep.value = 3
      loadingMessage.value = 'Составляем план на 4 недели...'
    }, 3000)

    const response = await fetch('/api/ai/year-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sphereScores: store.sphereScores,
        growthZones: store.growthZones.map(z => ({
          id: z.id,
          name: z.name
        })),
        answers: store.answers
      })
    })

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Ошибка генерации плана')
    }

    plan.value = data.data
    loading.value = false
    
    setTimeout(() => {
      fireConfetti()
    }, 300)
    
  } catch (err) {
    console.error('Year plan generation error:', err)
    console.log('Using demo plan as fallback')
    plan.value = demoPlan
    loading.value = false
    setTimeout(() => {
      fireConfetti()
    }, 300)
  }
}

function shareToTelegram() {
  const leverName = store.mainLever?.name || 'определён'
  const text = `Привет! 👋

92% людей забросят новогодние цели к февралю 😬

Я решил быть в 8% — прошёл тест и получил чёткий план на 2026.

Главный рычаг: ${leverName}

Узнай свой за 10 минут ⬇️`
  const url = window.location.origin + '/land/newyear'
  window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank')
}

function copyLink() {
  const url = window.location.origin + '/land/newyear'
  navigator.clipboard.writeText(url)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

function restartTest() {
  store.resetTest()
  router.push('/land/newyear/test')
}

function mapBackendDataToStore(data) {
  if (!data?.categories_data) return
  
  for (const cat of data.categories_data) {
    const sphereId = backendCategoryToSphereId[cat.category] || cat.category
    const scaleQuestion = store.questions.find(q => q.sphere === sphereId && q.type === 'scale')
    const textQuestion = store.questions.find(q => q.sphere === sphereId && q.type === 'text')
    
    if (scaleQuestion && cat.score !== null) {
      store.setAnswer(scaleQuestion.id, cat.score)
    }
    if (textQuestion && cat.answer) {
      store.setAnswer(textQuestion.id, cat.answer)
    }
  }
  
  if (DEBUG_MODE) {
    console.log('[NewYearResults] Mapped backend data to store:', store.sphereScores)
  }
}

async function loadFromBackend(hash) {
  try {
    if (DEBUG_MODE) {
      console.log('[NewYearResults] Loading from backend with hash:', hash)
    }
    
    const data = await landingSSPStore.getTest(hash)
    backendData.value = data
    mapBackendDataToStore(data)
    
    return true
  } catch (error) {
    console.error('[NewYearResults] Error loading from backend:', error)
    loadError.value = error.message
    return false
  }
}

onMounted(async () => {
  const hash = route.params.hash
  
  if (hash) {
    const success = await loadFromBackend(hash)
    if (!success) {
      loadError.value = 'Результаты не найдены'
      loading.value = false
      return
    }
    generatePlan()
  } else if (!store.isCompleted) {
    router.push('/land/newyear/test')
    return
  } else {
    generatePlan()
  }
})
</script>

<style scoped>
.newyear-results {
  min-height: 100vh;
  background: #f8fafc;
  color: #1a1a2e;
  position: relative;
  overflow-x: hidden;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Snowflakes */
.snowflakes {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.snowflake {
  position: absolute;
  top: -20px;
  font-size: 1.2rem;
  animation: fall linear infinite;
  opacity: 0.7;
}

.snowflake:nth-child(1) { left: 5%; animation-duration: 12s; animation-delay: 0s; font-size: 1rem; }
.snowflake:nth-child(2) { left: 12%; animation-duration: 14s; animation-delay: 1s; font-size: 1.4rem; }
.snowflake:nth-child(3) { left: 22%; animation-duration: 10s; animation-delay: 2s; font-size: 0.9rem; }
.snowflake:nth-child(4) { left: 32%; animation-duration: 16s; animation-delay: 0.5s; font-size: 1.1rem; }
.snowflake:nth-child(5) { left: 42%; animation-duration: 11s; animation-delay: 3s; font-size: 1.3rem; }
.snowflake:nth-child(6) { left: 52%; animation-duration: 13s; animation-delay: 1.5s; font-size: 1rem; }
.snowflake:nth-child(7) { left: 62%; animation-duration: 15s; animation-delay: 2.5s; font-size: 1.2rem; }
.snowflake:nth-child(8) { left: 72%; animation-duration: 9s; animation-delay: 0.8s; font-size: 0.8rem; }
.snowflake:nth-child(9) { left: 82%; animation-duration: 17s; animation-delay: 1.8s; font-size: 1.4rem; }
.snowflake:nth-child(10) { left: 92%; animation-duration: 12s; animation-delay: 3.5s; font-size: 1rem; }
.snowflake:nth-child(11) { left: 7%; animation-duration: 14s; animation-delay: 4s; font-size: 1.1rem; }
.snowflake:nth-child(12) { left: 88%; animation-duration: 11s; animation-delay: 2.2s; font-size: 1.3rem; }

@keyframes fall {
  0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
  10% { opacity: 0.7; }
  90% { opacity: 0.7; }
  100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
}

/* Sparkles */
.sparkles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.sparkle {
  position: absolute;
  font-size: 1.5rem;
  color: #d97706;
  animation: twinkle 3s ease-in-out infinite;
}

.sparkle:nth-child(1) { top: 10%; left: 8%; animation-delay: 0s; }
.sparkle:nth-child(2) { top: 20%; right: 10%; animation-delay: 0.5s; }
.sparkle:nth-child(3) { top: 40%; left: 5%; animation-delay: 1s; }
.sparkle:nth-child(4) { top: 55%; right: 8%; animation-delay: 1.5s; }
.sparkle:nth-child(5) { top: 75%; left: 12%; animation-delay: 2s; }

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* Header */
.results-header {
  padding: 20px 0;
  background: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(26, 26, 46, 0.08);
  position: relative;
  z-index: 10;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 24px;
  font-weight: 800;
  color: #d97706;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a2e;
}

.results-main {
  padding: 40px 0 80px;
  position: relative;
  z-index: 2;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 0;
}

.loading-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  margin-bottom: 48px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(217, 119, 6, 0.2);
  border-top-color: #d97706;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text h2 {
  font-size: 28px;
  margin-bottom: 8px;
  color: #1a1a2e;
}

.loading-text p {
  color: #64748b;
  font-size: 16px;
}

.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 300px;
  margin: 0 auto;
}

.loading-step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
  opacity: 0.5;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(26, 26, 46, 0.05);
}

.loading-step.active {
  opacity: 1;
  background: rgba(217, 119, 6, 0.08);
  border: 1px solid rgba(217, 119, 6, 0.3);
}

.loading-step.done {
  opacity: 0.7;
}

.loading-step.done .step-icon {
  color: #d97706;
}

.step-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(217, 119, 6, 0.15);
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  color: #1a1a2e;
}

/* Results Content */
.results-content {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.results-hero {
  text-align: center;
  margin-bottom: 48px;
}

.results-hero h1 {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 12px;
  color: #1a1a2e;
}

.results-hero p {
  color: #64748b;
  font-size: 18px;
}

.spheres-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 48px;
}

.sphere-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(26, 26, 46, 0.06);
  border: 1px solid rgba(26, 26, 46, 0.06);
}

.sphere-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.sphere-icon {
  font-size: 24px;
}

.sphere-name {
  font-weight: 600;
  color: #1a1a2e;
}

.sphere-score-bar {
  height: 8px;
  background: rgba(26, 26, 46, 0.08);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.score-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.sphere-score {
  text-align: right;
  font-size: 14px;
  color: #64748b;
}

.insights-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 48px;
}

.insight-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(26, 26, 46, 0.06);
  border: 1px solid rgba(26, 26, 46, 0.06);
}

.insight-card.strengths {
  border-color: rgba(16, 185, 129, 0.3);
}

.insight-card.growth {
  border-color: rgba(245, 158, 11, 0.3);
}

.insight-card h3 {
  font-size: 18px;
  margin-bottom: 20px;
  color: #1a1a2e;
}

.insight-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.insight-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
}

.insight-rank {
  font-size: 12px;
  color: #94a3b8;
  width: 24px;
}

.insight-icon {
  font-size: 20px;
}

.insight-name {
  flex: 1;
  font-weight: 500;
  color: #1a1a2e;
}

.insight-score {
  font-weight: 700;
  color: #10b981;
}

.growth .insight-score {
  color: #f59e0b;
}

.lever-section {
  margin-bottom: 48px;
}

.lever-card {
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
  border: 1px solid rgba(217, 119, 6, 0.3);
  border-radius: 20px;
  padding: 32px;
  text-align: center;
}

.lever-badge {
  display: inline-block;
  background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 20px;
}

.lever-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.lever-content h2 {
  font-size: 28px;
  margin-bottom: 12px;
  color: #1a1a2e;
}

.lever-content p {
  color: #64748b;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Plan Section */
.plan-section {
  margin-bottom: 48px;
}

.plan-hero {
  text-align: center;
  margin-bottom: 40px;
}

.plan-hero h2 {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 16px;
  color: #1a1a2e;
}

.motivation {
  font-size: 18px;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.goals-section {
  margin-bottom: 48px;
}

.goals-section h3,
.week-plan-section h3 {
  font-size: 24px;
  margin-bottom: 24px;
  text-align: center;
  color: #1a1a2e;
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.goal-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(26, 26, 46, 0.06);
  border: 1px solid rgba(26, 26, 46, 0.06);
  overflow: hidden;
  transition: all 0.3s;
}

.goal-card.expanded {
  border-color: rgba(217, 119, 6, 0.3);
}

.goal-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.goal-header:hover {
  background: #f8fafc;
}

.goal-number {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #d97706, #f59e0b);
  border-radius: 10px;
  font-weight: 700;
  font-size: 18px;
  flex-shrink: 0;
  color: white;
}

.goal-info {
  flex: 1;
}

.goal-sphere {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 6px;
}

.goal-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.4;
  color: #1a1a2e;
}

.goal-metric {
  font-size: 14px;
  color: #d97706;
}

.expand-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(26, 26, 46, 0.06);
  border-radius: 8px;
  font-size: 20px;
  color: #64748b;
  flex-shrink: 0;
}

.goal-steps {
  padding: 0 20px 20px;
  border-top: 1px solid rgba(26, 26, 46, 0.08);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.steps-header {
  display: flex;
  justify-content: space-between;
  padding: 16px 0 12px;
  font-size: 14px;
  color: #64748b;
}

.total-hours {
  color: #d97706;
  font-weight: 600;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(26, 26, 46, 0.05);
}

.step-item:last-child {
  border-bottom: none;
}

.step-checkbox {
  color: #94a3b8;
}

.step-title {
  flex: 1;
  font-size: 14px;
  color: #1a1a2e;
}

.step-hours {
  font-size: 13px;
  color: #64748b;
  background: rgba(26, 26, 46, 0.06);
  padding: 2px 8px;
  border-radius: 4px;
}

.week-plan-section {
  margin-bottom: 48px;
}

.weeks-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.week-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(26, 26, 46, 0.06);
  border: 1px solid rgba(26, 26, 46, 0.06);
}

.week-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.week-number {
  font-weight: 700;
  color: #d97706;
}

.week-dates {
  font-size: 12px;
  color: #94a3b8;
}

.week-focus {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1a1a2e;
}

.week-tasks {
  list-style: none;
  padding: 0;
  margin: 0;
}

.week-tasks li {
  position: relative;
  padding-left: 16px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
}

.week-tasks li::before {
  content: '○';
  position: absolute;
  left: 0;
  color: #94a3b8;
}

/* CTA Section */
.cta-section {
  margin-bottom: 48px;
}

.cta-card {
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
  border: 1px solid rgba(217, 119, 6, 0.3);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
}

.cta-card h2 {
  font-size: 24px;
  margin-bottom: 12px;
  color: #1a1a2e;
}

.cta-card > p {
  color: #64748b;
  margin-bottom: 24px;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 40px;
  background: linear-gradient(135deg, #d97706, #f59e0b);
  color: white;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(217, 119, 6, 0.3);
}

.cta-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 30px rgba(217, 119, 6, 0.4);
}

.cta-btn.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 4px 20px rgba(217, 119, 6, 0.3); }
  50% { box-shadow: 0 4px 30px rgba(217, 119, 6, 0.5); }
}

.cta-hint {
  margin-top: 16px;
  font-size: 14px;
  color: #94a3b8;
}

.share-section {
  text-align: center;
  margin-bottom: 48px;
}

.share-section h3 {
  font-size: 20px;
  margin-bottom: 20px;
  color: #1a1a2e;
}

.share-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.share-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.share-btn.telegram {
  background: #0088cc;
  color: white;
}

.share-btn.copy {
  background: rgba(26, 26, 46, 0.1);
  color: #1a1a2e;
}

.share-btn:hover {
  transform: translateY(-2px);
}

.restart-section {
  text-align: center;
}

.restart-btn {
  background: none;
  border: 1px solid rgba(26, 26, 46, 0.2);
  color: #64748b;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.restart-btn:hover {
  border-color: #1a1a2e;
  color: #1a1a2e;
}

@media (max-width: 768px) {
  .spheres-grid {
    grid-template-columns: 1fr;
  }
  
  .insights-section {
    grid-template-columns: 1fr;
  }
  
  .weeks-grid {
    grid-template-columns: 1fr;
  }
  
  .results-hero h1 {
    font-size: 28px;
  }
  
  .plan-hero h2 {
    font-size: 24px;
  }
  
  .cta-card {
    padding: 24px;
  }

  .loading-text h2 {
    font-size: 22px;
  }
}

/* Footer - Dark for contrast */
.results-footer {
  padding: 40px 0;
  background: #1a1a2e;
  border-top: 1px solid rgba(248, 250, 252, 0.1);
  position: relative;
  z-index: 2;
}

.footer-legal {
  text-align: center;
}

.legal-links {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.legal-links a {
  color: rgba(248, 250, 252, 0.6);
  text-decoration: none;
  font-size: 0.8125rem;
  transition: color 0.2s;
}

.legal-links a:hover {
  color: #f8fafc;
}

.company-info {
  color: rgba(248, 250, 252, 0.4);
  font-size: 0.75rem;
}

.company-info p {
  margin: 0;
}

.copyright {
  color: rgba(248, 250, 252, 0.5);
  font-size: 0.875rem;
  margin: 0.75rem 0 0;
}
</style>
