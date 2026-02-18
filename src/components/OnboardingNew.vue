<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { sphereScenarios, sphereOrder, motivationOptions } from '@/data/sphereScenarios.js'
import { DEBUG_MODE } from '@/config/settings.js'
import {
  Rocket, Sparkles, Compass, Target, Bot, TrendingUp, BookOpen,
  RefreshCw, ClipboardList, Scale,
  Briefcase, Heart, Wallet, HeartHandshake, Users, Palette
} from 'lucide-vue-next'

const router = useRouter()
const store = useAppStore()

// ── Icon mappings ──────────────────────────────────
const SPHERE_ICONS = { career: Briefcase, health: Heart, wealth: Wallet, love: HeartHandshake, friendship: Users, hobbies: Palette }
const MOTIVATION_ICONS = { stuck: RefreshCw, discipline: ClipboardList, specific_goal: Target, balance: Scale }

// ── State ──────────────────────────────────────────
const currentScreen = ref('welcome') // welcome | benefits | motivation | scenarios | result
const selectedMotivation = ref(null)
const scenarioIndex = ref(0)
const answers = ref({})
const isSaving = ref(false)

// ── Backend integration state ────────────────────
const isLoadingQuestions = ref(true)
const backendQuestions = ref(null) // null = не загружено/ошибка, [] = загружено
const interviewAnswersMap = ref({}) // { questionId: { question_id, selected_option_id, free_text } }

// ── Backend → Frontend category mapping ──────────
const BACKEND_TO_SPHERE = {
  work: 'career',
  health_sport: 'health',
  welfare: 'wealth',
  family: 'love',
  environment: 'friendship',
  hobby: 'hobbies'
}

const SPHERE_TO_BACKEND = {
  career: 'work',
  health: 'health_sport',
  wealth: 'welfare',
  love: 'family',
  friendship: 'environment',
  hobbies: 'hobby'
}

// ── Load questions from backend on mount ─────────
onMounted(async () => {
  try {
    await store.loadInterviewQuestions()
    if (store.interviewData.loaded && store.interviewData.questions.length > 0) {
      backendQuestions.value = store.interviewData.questions
      if (DEBUG_MODE) {
        console.log('[Onboarding] Backend questions loaded:', backendQuestions.value.length)
      }
    }
  } catch (e) {
    if (DEBUG_MODE) {
      console.error('[Onboarding] Failed to load questions, using fallback:', e)
    }
  } finally {
    isLoadingQuestions.value = false
  }
})

// ── Whether we use backend data ──────────────────
const useBackend = computed(() => backendQuestions.value !== null && backendQuestions.value.length > 0)

// ── Dynamic data: backend or fallback ────────────

// Motivation question (category === null)
const motivationQuestion = computed(() => {
  if (!useBackend.value) return null
  return backendQuestions.value.find(q => q.category === null || q.category === '')
})

const dynamicMotivationOptions = computed(() => {
  if (motivationQuestion.value && motivationQuestion.value.answer_options?.length > 0) {
    return motivationQuestion.value.answer_options.map((opt, idx) => ({
      id: opt.id || `opt_${idx}`,
      label: opt.text,
      icon: null,
      _optionId: opt.id
    }))
  }
  return motivationOptions
})

// Sphere order and scenarios from backend
const dynamicSphereOrder = computed(() => {
  if (!useBackend.value) return sphereOrder
  const order = []
  for (const q of backendQuestions.value) {
    if (q.category && BACKEND_TO_SPHERE[q.category]) {
      order.push(BACKEND_TO_SPHERE[q.category])
    }
  }
  return order.length === 6 ? order : sphereOrder
})

const dynamicSphereScenarios = computed(() => {
  if (!useBackend.value) return sphereScenarios

  const result = {}
  for (const q of backendQuestions.value) {
    if (!q.category || !BACKEND_TO_SPHERE[q.category]) continue
    const sphereId = BACKEND_TO_SPHERE[q.category]
    const fallback = sphereScenarios[sphereId] || {}

    result[sphereId] = {
      id: sphereId,
      name: q.title || fallback.name || sphereId,
      icon: fallback.icon || '',
      color: fallback.color || '#6366f1',
      emoji: fallback.emoji || '',
      _questionId: q.id,
      scenarios: (q.answer_options || []).map(opt => ({
        label: opt.text,
        score: opt.weight || 0,
        _optionId: opt.id
      }))
    }
  }

  // Заполняем пропущенные сферы из хардкода
  for (const id of sphereOrder) {
    if (!result[id]) {
      result[id] = sphereScenarios[id]
    }
  }

  return result
})

// ── Computed (using dynamic data) ────────────────
const currentSphereId = computed(() => dynamicSphereOrder.value[scenarioIndex.value])
const currentSphere = computed(() => dynamicSphereScenarios.value[currentSphereId.value])
const allSpheresAnswered = computed(() => Object.keys(answers.value).length === 6)

const sphereResults = computed(() => {
  return dynamicSphereOrder.value.map(id => ({
    ...dynamicSphereScenarios.value[id],
    score: answers.value[id]?.score || 0,
    context: answers.value[id]?.context || ''
  }))
})

const weakestSphere = computed(() => {
  if (!allSpheresAnswered.value) return null
  return sphereResults.value.reduce((min, s) => s.score < min.score ? s : min)
})

const progressPercent = computed(() => {
  const screens = ['welcome', 'benefits', 'motivation', 'scenarios', 'result']
  const idx = screens.indexOf(currentScreen.value)
  return Math.round(((idx + 1) / screens.length) * 100)
})

// ── Welcome navigation ──────────────────────────
function goToBenefits() {
  currentScreen.value = 'benefits'
}

function goToMotivation() {
  currentScreen.value = 'motivation'
}

// ── Methods ──────────────────────────────────────
function selectMotivation(option) {
  selectedMotivation.value = option

  // Сохраняем ответ мотивации в interviewAnswersMap (если бэкенд)
  if (useBackend.value && motivationQuestion.value && option._optionId) {
    interviewAnswersMap.value[motivationQuestion.value.id] = {
      question_id: motivationQuestion.value.id,
      selected_option_id: option._optionId,
      free_text: null
    }
  }

  setTimeout(() => {
    currentScreen.value = 'scenarios'
    // В fallback-режиме сохраняем мотивацию отдельным запросом
    if (!useBackend.value) {
      saveMotivationFallback()
    }
  }, 300)
}

async function saveMotivationFallback() {
  try {
    await store.saveOnboardingToBackend({
      reason_joined: selectedMotivation.value.label,
      step_completed: 1
    })
  } catch (e) {
    if (DEBUG_MODE) {
      console.error('[Onboarding] Failed to save motivation (fallback):', e)
    }
  }
}

function selectScenario(scenario) {
  const sphereId = currentSphereId.value
  answers.value[sphereId] = {
    score: scenario.score,
    context: scenario.label
  }

  // Сохраняем ответ в interviewAnswersMap (если бэкенд)
  const sphereData = dynamicSphereScenarios.value[sphereId]
  if (useBackend.value && sphereData?._questionId && scenario._optionId) {
    interviewAnswersMap.value[sphereData._questionId] = {
      question_id: sphereData._questionId,
      selected_option_id: scenario._optionId,
      free_text: null
    }
  }

  if (scenarioIndex.value < 5) {
    scenarioIndex.value++
  } else {
    currentScreen.value = 'result'
    // В backend-режиме всё отправляется при нажатии "Начать"
    // В fallback-режиме сохраняем SSP отдельно
    if (!useBackend.value) {
      saveSphereScoresFallback()
    }
  }
}

async function saveSphereScoresFallback() {
  try {
    const categoriesData = dynamicSphereOrder.value.map(id => ({
      category: SPHERE_TO_BACKEND[id],
      rating: answers.value[id].score
    }))
    await store.saveSSPToBackend(categoriesData, { createNew: true })
    await store.saveOnboardingToBackend({ step_completed: 2 })
  } catch (e) {
    if (DEBUG_MODE) {
      console.error('[Onboarding] Failed to save sphere scores (fallback):', e)
    }
  }
}

async function finishOnboarding() {
  if (isSaving.value) return
  isSaving.value = true

  try {
    if (useBackend.value) {
      // === Backend mode: один атомарный запрос ===
      const answersArray = Object.values(interviewAnswersMap.value)

      if (DEBUG_MODE) {
        console.log('[Onboarding] Submitting interview answers:', answersArray)
      }

      const result = await store.submitInterviewToBackend(answersArray)

      if (result.success) {
        store.setUserFinishOnboarding(true)
        router.push('/app')
      } else {
        // Если submit не прошёл — фоллбэк на старую логику
        if (DEBUG_MODE) {
          console.warn('[Onboarding] Interview submit failed, falling back to legacy flow')
        }
        await finishOnboardingFallback()
      }
    } else {
      // === Fallback mode: 3 отдельных запроса (как раньше) ===
      await finishOnboardingFallback()
    }
  } catch (e) {
    if (DEBUG_MODE) {
      console.error('[Onboarding] Failed to complete onboarding:', e)
    }
    // Последний fallback: просто редиректим
    store.setUserFinishOnboarding(true)
    router.push('/app')
  }
}

async function finishOnboardingFallback() {
  try {
    await store.completeOnboardingWithBackend({})
  } catch (e) {
    if (DEBUG_MODE) {
      console.error('[Onboarding] Fallback complete failed:', e)
    }
  }
  store.setUserFinishOnboarding(true)
  router.push('/app')
}

// ── Wheel drawing ──────────────────────────────────
const wheelCanvas = ref(null)

function drawWheel() {
  if (!wheelCanvas.value) return
  const canvas = wheelCanvas.value
  const ctx = canvas.getContext('2d')
  const size = 280
  canvas.width = size
  canvas.height = size
  const cx = size / 2
  const cy = size / 2
  const maxR = size / 2 - 20

  ctx.clearRect(0, 0, size, size)

  // Detect dark mode
  const isDark = document.documentElement.classList.contains('dark')
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const labelColor = isDark ? '#fff' : '#1f2937'

  // Grid circles
  for (let i = 2; i <= 10; i += 2) {
    ctx.beginPath()
    ctx.arc(cx, cy, (i / 10) * maxR, 0, Math.PI * 2)
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // Sphere segments
  const results = sphereResults.value
  const angleStep = (Math.PI * 2) / 6

  results.forEach((sphere, i) => {
    const angle = angleStep * i - Math.PI / 2
    const nextAngle = angleStep * (i + 1) - Math.PI / 2
    const r = (sphere.score / 10) * maxR

    // Filled segment
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, r, angle, nextAngle)
    ctx.closePath()
    ctx.fillStyle = sphere.color + '40'
    ctx.fill()
    ctx.strokeStyle = sphere.color
    ctx.lineWidth = 2
    ctx.stroke()

    // Label
    const labelAngle = angle + angleStep / 2
    const lx = cx + Math.cos(labelAngle) * (maxR - 15)
    const ly = cy + Math.sin(labelAngle) * (maxR - 15)

    ctx.fillStyle = labelColor
    ctx.font = '11px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(sphere.emoji, lx, ly)
  })
}

watch(() => currentScreen.value, (screen) => {
  if (screen === 'result') {
    nextTick(() => drawWheel())
  }
})
</script>

<template>
  <div class="onboarding-root">
    <!-- Progress bar -->
    <div class="onboarding-progress">
      <div class="onboarding-progress-fill" :style="{ width: progressPercent + '%' }"></div>
    </div>

    <div class="onboarding-content">
      <!-- ═══════════════════════════════════════════════ -->
      <!-- SCREEN: Welcome -->
      <!-- ═══════════════════════════════════════════════ -->
      <div v-if="currentScreen === 'welcome'" class="screen fade-in">
        <div class="screen-icon"><Rocket :size="48" :stroke-width="1.5" /></div>
        <h1>Стань лучше на 1% каждый день</h1>
        <p class="screen-subtitle">Сервис, который помогает расти в 6 сферах жизни: карьера, здоровье, финансы, отношения, окружение, хобби</p>

        <div class="welcome-spheres">
          <span class="welcome-sphere" v-for="s in dynamicSphereOrder" :key="s" :style="{ borderColor: dynamicSphereScenarios[s].color, color: dynamicSphereScenarios[s].color }">
            <component :is="SPHERE_ICONS[s]" :size="22" :stroke-width="1.5" />
          </span>
        </div>

        <button class="btn-primary" @click="goToBenefits">Далее</button>
        <button class="btn-skip" @click="goToMotivation">Пропустить</button>
      </div>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- SCREEN: Benefits -->
      <!-- ═══════════════════════════════════════════════ -->
      <div v-if="currentScreen === 'benefits'" class="screen fade-in">
        <div class="screen-icon"><Sparkles :size="48" :stroke-width="1.5" /></div>
        <h1>Что ты получишь</h1>

        <div class="benefits-list">
          <div class="benefit-item">
            <span class="benefit-icon"><Target :size="22" :stroke-width="1.5" /></span>
            <div class="benefit-text">
              <strong>Персональный план роста</strong>
              <span>На основе твоей ситуации в каждой сфере</span>
            </div>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon"><Bot :size="22" :stroke-width="1.5" /></span>
            <div class="benefit-text">
              <strong>AI-наставник Саша</strong>
              <span>Подсказывает, мотивирует, помогает с целями</span>
            </div>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon"><TrendingUp :size="22" :stroke-width="1.5" /></span>
            <div class="benefit-text">
              <strong>Трекинг привычек и целей</strong>
              <span>Видишь свой прогресс каждый день</span>
            </div>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon"><BookOpen :size="22" :stroke-width="1.5" /></span>
            <div class="benefit-text">
              <strong>Дневник рефлексии</strong>
              <span>Понимаешь себя лучше через ежедневные записи</span>
            </div>
          </div>
        </div>

        <button class="btn-primary" @click="goToMotivation">Начать тест</button>
        <button class="btn-skip" @click="goToMotivation">Пропустить</button>
      </div>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- SCREEN: Motivation -->
      <!-- ═══════════════════════════════════════════════ -->
      <div v-if="currentScreen === 'motivation'" class="screen fade-in">
        <div class="screen-icon"><Compass :size="48" :stroke-width="1.5" /></div>
        <h1>Что привело тебя сюда?</h1>
        <p class="screen-subtitle">Это поможет нам подобрать подход именно для тебя</p>

        <div class="options-list">
          <button
            v-for="opt in dynamicMotivationOptions"
            :key="opt.id"
            class="option-card"
            :class="{ selected: selectedMotivation?.id === opt.id }"
            @click="selectMotivation(opt)"
          >
            <span v-if="MOTIVATION_ICONS[opt.id]" class="option-icon"><component :is="MOTIVATION_ICONS[opt.id]" :size="20" :stroke-width="1.5" /></span>
            <span class="option-label">{{ opt.label }}</span>
          </button>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- SCREEN: Scenario Questions -->
      <!-- ═══════════════════════════════════════════════ -->
      <div v-if="currentScreen === 'scenarios'" class="screen fade-in" :key="scenarioIndex">
        <div class="scenario-counter">{{ scenarioIndex + 1 }} / 6</div>
        <div class="screen-icon" :style="{ color: currentSphere.color }"><component :is="SPHERE_ICONS[currentSphereId]" :size="48" :stroke-width="1.5" /></div>
        <h1>{{ currentSphere.name }}</h1>
        <p class="screen-subtitle">Какое описание ближе к тебе?</p>

        <div class="options-list">
          <button
            v-for="(scenario, idx) in currentSphere.scenarios"
            :key="idx"
            class="option-card scenario-option"
            @click="selectScenario(scenario)"
          >
            <span class="option-label">{{ scenario.label }}</span>
          </button>
        </div>

        <!-- Mini sphere progress dots -->
        <div class="mini-spheres">
          <div
            v-for="(id, i) in dynamicSphereOrder"
            :key="id"
            class="mini-sphere-dot"
            :class="{ active: i === scenarioIndex, done: answers[id] }"
            :style="{ backgroundColor: answers[id] ? dynamicSphereScenarios[id].color : 'transparent', borderColor: dynamicSphereScenarios[id].color, color: answers[id] ? '#fff' : dynamicSphereScenarios[id].color }"
          >
            <component :is="SPHERE_ICONS[id]" :size="16" :stroke-width="1.5" />
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- SCREEN: Result -->
      <!-- ═══════════════════════════════════════════════ -->
      <div v-if="currentScreen === 'result'" class="screen fade-in">
        <h1>Твоё колесо жизни</h1>

        <div class="wheel-container">
          <canvas ref="wheelCanvas" class="wheel-canvas"></canvas>
        </div>

        <div class="result-stats" v-if="weakestSphere">
          <div class="stat">
            <span class="stat-value" :style="{ color: weakestSphere.color }"><component :is="SPHERE_ICONS[weakestSphere.id]" :size="32" :stroke-width="1.5" /></span>
            <span class="stat-label">Точка роста</span>
          </div>
        </div>

        <!-- Sasha insight -->
        <div class="sasha-card" v-if="weakestSphere">
          <div class="sasha-avatar"><Bot :size="20" :stroke-width="1.5" /></div>
          <div class="sasha-content">
            <div class="sasha-name">Саша</div>
            <p>Сфера <strong>{{ weakestSphere.name }}</strong> — твоя главная точка роста.</p>
            <p>Ты выбрал: <em>"{{ weakestSphere.context }}"</em> — это самая частая ситуация среди наших пользователей.</p>
            <p>Я вижу потенциал для быстрого прогресса здесь. Давай начнём!</p>
          </div>
        </div>

        <button class="btn-primary" :disabled="isSaving" @click="finishOnboarding">
          {{ isSaving ? 'Загрузка...' : 'Начать' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Base ────────────────────────────── */
.onboarding-root {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.onboarding-progress {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 3px;
  background: var(--border-color);
}

.onboarding-progress-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.5s ease;
}

/* ── Content ─────────────────────────── */
.onboarding-content {
  max-width: 480px;
  margin: 0 auto;
  padding: 40px 20px 20px;
}

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

.screen-subtitle {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0 0 24px;
}

/* ── Options ─────────────────────────── */
.options-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.option-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 16px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  color: var(--text-primary);
  font-size: 15px;
  transition: all var(--transition-normal);
}

.option-card:hover {
  background: var(--primary-light);
  border-color: var(--primary-color);
}

.option-card.selected {
  background: var(--primary-light);
  border-color: var(--primary-color);
}

.option-icon { display: flex; color: var(--primary-color); flex-shrink: 0; }
.option-label { flex: 1; }

.scenario-counter {
  color: var(--primary-color);
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}

/* ── Mini Spheres ────────────────────── */
.mini-spheres {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.mini-sphere-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  opacity: 0.4;
}

.mini-sphere-dot.active { opacity: 1; transform: scale(1.15); }
.mini-sphere-dot.done { opacity: 0.8; }

/* ── Wheel ───────────────────────────── */
.wheel-container {
  margin: 16px 0;
}

.wheel-canvas {
  display: block;
}

.result-stats {
  display: flex;
  gap: 32px;
  margin-bottom: 20px;
}

.stat { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.stat-value { display: flex; }
.stat-label { font-size: 12px; color: var(--text-secondary); }

/* ── Sasha Card ──────────────────────── */
.sasha-card {
  background: var(--primary-light);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: var(--radius-xl);
  padding: 20px;
  display: flex;
  gap: 14px;
  text-align: left;
  width: 100%;
  margin-bottom: 20px;
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
.sasha-content p { font-size: 14px; line-height: 1.5; margin: 0 0 6px; color: var(--text-secondary); }

/* ── Buttons ─────────────────────────── */
.btn-primary {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: var(--radius-xl);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all var(--transition-normal);
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
}

.btn-skip:hover { color: var(--text-secondary); }

/* ── Welcome Spheres ─────────────────── */
.welcome-spheres {
  display: flex;
  gap: 12px;
  margin: 24px 0 32px;
}

.welcome-sphere {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
}

/* ── Benefits ────────────────────────── */
.benefits-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 8px 0 32px;
  text-align: left;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
}

.benefit-icon {
  display: flex;
  color: var(--primary-color);
  flex-shrink: 0;
  margin-top: 2px;
}

.benefit-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.benefit-text strong {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.benefit-text span {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}
</style>
