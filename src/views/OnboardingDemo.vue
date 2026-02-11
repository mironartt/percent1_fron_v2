<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { sphereScenarios, sphereOrder, motivationOptions, timeOptions } from '@/data/sphereScenarios.js'

// ── State ──────────────────────────────────────────
const currentScreen = ref('motivation') // motivation | scenarios | result | context | time | plan | first_step | sasha_reaction | telegram | today | today_day2 | today_day3 | today_day5 | today_day7
const selectedMotivation = ref(null)
const scenarioIndex = ref(0)
const answers = ref({})
const freeContext = ref('')
const selectedTime = ref(null)
const firstStepText = ref('')
const isGenerating = ref(false)
const generationProgress = ref(0)
const showSashaTyping = ref(false)
const sashaReaction = ref('')
const xpEarned = ref(0)

// ── Demo state for "Today" views ──────────────────
const demoDay = ref(1)
const demoSteps = ref([
  { id: 1, title: 'Написать 3 вещи, которые нравятся в работе', done: true },
  { id: 2, title: 'Написать 3 вещи, которые хочется изменить', done: false },
  { id: 3, title: 'Поговорить с человеком, чья карьера вдохновляет', done: false }
])
const demoHabits = ref([
  { id: 1, title: 'Выпить стакан воды', done: false },
  { id: 2, title: '10 минут чтения', done: false }
])
const demoJournal = ref('')

// ── Computed ──────────────────────────────────────
const currentSphereId = computed(() => sphereOrder[scenarioIndex.value])
const currentSphere = computed(() => sphereScenarios[currentSphereId.value])
const allSpheresAnswered = computed(() => Object.keys(answers.value).length === 6)

const sphereResults = computed(() => {
  return sphereOrder.map(id => ({
    ...sphereScenarios[id],
    score: answers.value[id]?.score || 0,
    context: answers.value[id]?.context || ''
  }))
})

const weakestSphere = computed(() => {
  if (!allSpheresAnswered.value) return null
  return sphereResults.value.reduce((min, s) => s.score < min.score ? s : min)
})

const averageScore = computed(() => {
  const scores = Object.values(answers.value).map(a => a.score)
  if (scores.length === 0) return 0
  return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
})

const progressPercent = computed(() => {
  const screens = ['motivation', 'scenarios', 'result', 'context', 'time', 'plan', 'first_step', 'sasha_reaction', 'telegram']
  const idx = screens.indexOf(currentScreen.value)
  return Math.round(((idx + 1) / screens.length) * 100)
})

// ── Methods ──────────────────────────────────────
function selectMotivation(option) {
  selectedMotivation.value = option
  setTimeout(() => { currentScreen.value = 'scenarios' }, 300)
}

function selectScenario(scenario) {
  answers.value[currentSphereId.value] = {
    score: scenario.score,
    context: scenario.label
  }

  if (scenarioIndex.value < 5) {
    scenarioIndex.value++
  } else {
    currentScreen.value = 'result'
  }
}

function goToContext() {
  currentScreen.value = 'context'
}

function goToTime() {
  currentScreen.value = 'time'
}

function selectTime(option) {
  selectedTime.value = option
  currentScreen.value = 'plan'
  simulateGeneration()
}

async function simulateGeneration() {
  isGenerating.value = true
  generationProgress.value = 0

  const steps = [
    { progress: 20, delay: 600 },
    { progress: 45, delay: 800 },
    { progress: 70, delay: 700 },
    { progress: 90, delay: 500 },
    { progress: 100, delay: 400 }
  ]

  for (const step of steps) {
    await new Promise(r => setTimeout(r, step.delay))
    generationProgress.value = step.progress
  }

  isGenerating.value = false
}

function goToFirstStep() {
  currentScreen.value = 'first_step'
}

async function submitFirstStep() {
  if (!firstStepText.value.trim()) return

  currentScreen.value = 'sasha_reaction'
  showSashaTyping.value = true

  await new Promise(r => setTimeout(r, 2000))
  showSashaTyping.value = false

  const text = firstStepText.value
  const keywords = text.split(/[,.\s]+/).filter(w => w.length > 4).slice(0, 2)
  sashaReaction.value = keywords.length >= 2
    ? `Интересно! Видно, что тебе важны "${keywords[0]}" и "${keywords[1]}". Это подсказка — твоё следующее направление может быть связано именно с этим. Завтра разберёмся глубже.`
    : `Отличное начало! Ты уже сделал первый шаг к пониманию своей ситуации. Завтра мы копнём глубже и посмотрим, что хочется изменить.`

  xpEarned.value = 10
}

function goToTelegram() {
  currentScreen.value = 'telegram'
}

function goToToday() {
  demoDay.value = 1
  currentScreen.value = 'today'
}

function switchDay(day) {
  demoDay.value = day
  currentScreen.value = 'today'
}

function toggleStep(step) {
  step.done = !step.done
}

function toggleHabit(habit) {
  habit.done = !habit.done
}

function restart() {
  currentScreen.value = 'motivation'
  selectedMotivation.value = null
  scenarioIndex.value = 0
  answers.value = {}
  freeContext.value = ''
  selectedTime.value = null
  firstStepText.value = ''
  isGenerating.value = false
  sashaReaction.value = ''
  xpEarned.value = 0
}

// Wheel drawing
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

  // Grid circles
  for (let i = 2; i <= 10; i += 2) {
    ctx.beginPath()
    ctx.arc(cx, cy, (i / 10) * maxR, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
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
    const labelR = maxR + 10
    const lx = cx + Math.cos(labelAngle) * (maxR - 15)
    const ly = cy + Math.sin(labelAngle) * (maxR - 15)

    ctx.fillStyle = '#fff'
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
  <div class="demo-root">
    <!-- Header -->
    <div class="demo-header">
      <div class="demo-header-inner">
        <span class="demo-badge">ДЕМО</span>
        <span class="demo-title">Онбординг V2</span>
        <button class="demo-restart" @click="restart">Начать заново</button>
      </div>
      <!-- Progress bar (only during onboarding screens) -->
      <div v-if="!currentScreen.startsWith('today')" class="demo-progress">
        <div class="demo-progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>

    <div class="demo-content">
      <!-- ═══════════════════════════════════════════════ -->
      <!-- SCREEN: Motivation -->
      <!-- ═══════════════════════════════════════════════ -->
      <div v-if="currentScreen === 'motivation'" class="screen fade-in">
        <div class="screen-icon">🧭</div>
        <h1>Что привело тебя сюда?</h1>
        <p class="screen-subtitle">Это поможет нам подобрать подход именно для тебя</p>

        <div class="options-list">
          <button
            v-for="opt in motivationOptions"
            :key="opt.id"
            class="option-card"
            :class="{ selected: selectedMotivation?.id === opt.id }"
            @click="selectMotivation(opt)"
          >
            <span class="option-icon">{{ opt.icon }}</span>
            <span class="option-label">{{ opt.label }}</span>
          </button>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- SCREEN: Scenario Questions -->
      <!-- ═══════════════════════════════════════════════ -->
      <div v-if="currentScreen === 'scenarios'" class="screen fade-in" :key="scenarioIndex">
        <div class="scenario-counter">{{ scenarioIndex + 1 }} / 6</div>
        <div class="screen-icon" :style="{ color: currentSphere.color }">{{ currentSphere.emoji }}</div>
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

        <!-- Mini wheel preview -->
        <div class="mini-spheres">
          <div
            v-for="(id, i) in sphereOrder"
            :key="id"
            class="mini-sphere-dot"
            :class="{ active: i === scenarioIndex, done: answers[id] }"
            :style="{ backgroundColor: answers[id] ? sphereScenarios[id].color : 'transparent', borderColor: sphereScenarios[id].color }"
          >
            {{ sphereScenarios[id].emoji }}
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- SCREEN: Result + Sasha Insight -->
      <!-- ═══════════════════════════════════════════════ -->
      <div v-if="currentScreen === 'result'" class="screen fade-in">
        <h1>Твоё колесо жизни</h1>

        <div class="wheel-container">
          <canvas ref="wheelCanvas" class="wheel-canvas"></canvas>
        </div>

        <div class="result-stats">
          <div class="stat">
            <span class="stat-value">{{ averageScore }}</span>
            <span class="stat-label">Средний балл</span>
          </div>
          <div class="stat" v-if="weakestSphere">
            <span class="stat-value" :style="{ color: weakestSphere.color }">{{ weakestSphere.emoji }}</span>
            <span class="stat-label">Точка роста</span>
          </div>
        </div>

        <!-- Sasha insight -->
        <div class="sasha-card" v-if="weakestSphere">
          <div class="sasha-avatar">🤖</div>
          <div class="sasha-content">
            <div class="sasha-name">Саша</div>
            <p>Сфера <strong>{{ weakestSphere.name }}</strong> — твоя главная точка роста.</p>
            <p>Ты выбрал: <em>"{{ weakestSphere.context }}"</em> — это самая частая ситуация среди наших пользователей.</p>
            <p>Я вижу потенциал для быстрого прогресса здесь. Давай составлю для тебя персональный план?</p>
          </div>
        </div>

        <button class="btn-primary" @click="goToContext">Составить план</button>

        <p class="screen-note">👆 Здесь в реальном приложении будет экран регистрации:<br>"Создай аккаунт, чтобы сохранить результаты"</p>
      </div>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- SCREEN: Free Context (optional) -->
      <!-- ═══════════════════════════════════════════════ -->
      <div v-if="currentScreen === 'context'" class="screen fade-in">
        <div class="screen-icon" :style="{ color: weakestSphere?.color }">{{ weakestSphere?.emoji }}</div>
        <h1>{{ weakestSphere?.name }}</h1>
        <p class="screen-subtitle">Ты выбрал: "{{ weakestSphere?.context }}"</p>
        <p class="screen-subtitle">Расскажи чуть подробнее <span class="optional-tag">(необязательно)</span></p>

        <textarea
          v-model="freeContext"
          class="text-input"
          placeholder="Например: работаю менеджером 5 лет, хочу попробовать своё дело..."
          rows="4"
        ></textarea>

        <div class="btn-group">
          <button class="btn-primary" @click="goToTime">Продолжить</button>
          <button class="btn-secondary" @click="goToTime">Пропустить</button>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- SCREEN: Time Commitment -->
      <!-- ═══════════════════════════════════════════════ -->
      <div v-if="currentScreen === 'time'" class="screen fade-in">
        <div class="screen-icon">⏱️</div>
        <h1>Сколько времени готов вкладывать в себя каждый день?</h1>

        <div class="options-list">
          <button
            v-for="opt in timeOptions"
            :key="opt.id"
            class="option-card"
            @click="selectTime(opt)"
          >
            <span class="option-label">{{ opt.label }}</span>
            <span class="option-desc">{{ opt.description }}</span>
          </button>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- SCREEN: Plan Generation -->
      <!-- ═══════════════════════════════════════════════ -->
      <div v-if="currentScreen === 'plan'" class="screen fade-in">
        <!-- Generating state -->
        <div v-if="isGenerating" class="generating">
          <div class="sasha-avatar large">🤖</div>
          <h2>Саша составляет твой план...</h2>
          <p class="sasha-thinking" v-if="weakestSphere">
            "Ты сказал, что готов вкладывать {{ selectedTime?.label }} в день.
            Учитывая, что ты {{ weakestSphere.context.toLowerCase() }},
            я начну с самого простого — разобраться, что тебе нравится
            и что хочется изменить. Это фундамент."
          </p>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: generationProgress + '%' }"></div>
          </div>
          <span class="progress-text">{{ generationProgress }}%</span>
        </div>

        <!-- Plan ready -->
        <div v-else class="plan-ready">
          <h1>Твой стартовый план</h1>
          <div class="plan-sphere-badge" v-if="weakestSphere" :style="{ backgroundColor: weakestSphere.color + '20', color: weakestSphere.color, borderColor: weakestSphere.color }">
            {{ weakestSphere.emoji }} {{ weakestSphere.name }}
          </div>

          <div class="goal-card">
            <h3>Определить направление для развития</h3>
            <div class="steps-list">
              <div class="step-item">
                <span class="step-num">1</span>
                <span class="step-text">Написать 3 вещи, которые нравятся в текущей работе</span>
                <span class="step-time">2 мин</span>
              </div>
              <div class="step-item">
                <span class="step-num">2</span>
                <span class="step-text">Написать 3 вещи, которые хочется изменить</span>
                <span class="step-time">2 мин</span>
              </div>
              <div class="step-item">
                <span class="step-num">3</span>
                <span class="step-text">Поговорить с человеком, чья карьера вдохновляет</span>
                <span class="step-time">15 мин</span>
              </div>
            </div>
          </div>

          <button class="btn-primary" @click="goToFirstStep">Начать прямо сейчас</button>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- SCREEN: First Step -->
      <!-- ═══════════════════════════════════════════════ -->
      <div v-if="currentScreen === 'first_step'" class="screen fade-in">
        <div class="screen-icon">✍️</div>
        <h1>Давай начнём прямо сейчас!</h1>
        <p class="screen-subtitle">Шаг 1: Напиши 3 вещи, которые нравятся в текущей работе</p>
        <p class="screen-hint">Это займёт 2 минуты</p>

        <textarea
          v-model="firstStepText"
          class="text-input large"
          placeholder="1. Коллектив&#10;2. Свобода в решениях&#10;3. Стабильная зарплата"
          rows="6"
        ></textarea>

        <button
          class="btn-primary"
          :disabled="!firstStepText.trim()"
          @click="submitFirstStep"
        >
          Готово ✓
        </button>
      </div>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- SCREEN: Sasha Reaction -->
      <!-- ═══════════════════════════════════════════════ -->
      <div v-if="currentScreen === 'sasha_reaction'" class="screen fade-in">
        <!-- Typing indicator -->
        <div v-if="showSashaTyping" class="sasha-typing">
          <div class="sasha-avatar large">🤖</div>
          <div class="typing-dots">
            <span></span><span></span><span></span>
          </div>
          <p>Саша анализирует твой ответ...</p>
        </div>

        <!-- Reaction -->
        <div v-else class="reaction-screen">
          <div class="sasha-card highlight">
            <div class="sasha-avatar">🤖</div>
            <div class="sasha-content">
              <div class="sasha-name">Саша</div>
              <p>{{ sashaReaction }}</p>
            </div>
          </div>

          <div class="xp-celebration" v-if="xpEarned">
            <div class="xp-badge">+{{ xpEarned }} XP</div>
            <h2>Ты уже на 1% лучше, чем вчера!</h2>
            <p>Уровень 1</p>
          </div>

          <button class="btn-primary" @click="goToTelegram">Продолжить</button>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- SCREEN: Telegram Connect -->
      <!-- ═══════════════════════════════════════════════ -->
      <div v-if="currentScreen === 'telegram'" class="screen fade-in">
        <div class="sasha-avatar large">🤖</div>
        <h1>Подключи Сашу в Telegram</h1>
        <p class="screen-subtitle">Он уже знает твои цели и ситуацию</p>

        <div class="telegram-features">
          <div class="tg-feature">
            <span>☀️</span> Каждое утро напоминать о шагах
          </div>
          <div class="tg-feature">
            <span>💬</span> Отвечать на вопросы о целях и планах
          </div>
          <div class="tg-feature">
            <span>✅</span> Ставить задачи по твоей просьбе
          </div>
          <div class="tg-feature">
            <span>📊</span> Замечать закономерности в настроении
          </div>
        </div>

        <p class="tg-tagline">Это как персональный наставник, который всегда на связи.</p>

        <button class="btn-telegram" @click="goToToday">
          Подключить Сашу в Telegram
        </button>
        <button class="btn-secondary" @click="goToToday">Позже</button>
      </div>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- SCREEN: Today View (Focus Mode) -->
      <!-- ═══════════════════════════════════════════════ -->
      <div v-if="currentScreen === 'today'" class="screen fade-in today-screen">
        <!-- Day switcher (demo only) -->
        <div class="day-switcher">
          <button v-for="d in [1,2,3,5,7]" :key="d"
            :class="{ active: demoDay === d }"
            @click="switchDay(d)">
            День {{ d }}
          </button>
        </div>

        <!-- Day 1 -->
        <div v-if="demoDay === 1" class="today-content fade-in">
          <div class="today-header">
            <h1>День 1 из 7</h1>
            <div class="xp-mini">🏆 10 XP</div>
          </div>

          <div class="today-goal">
            <div class="today-goal-sphere" :style="{ color: weakestSphere?.color || '#6366f1' }">
              {{ weakestSphere?.emoji || '💼' }} {{ weakestSphere?.name || 'Карьера' }}
            </div>
            <h3>Определить направление для развития</h3>
          </div>

          <div class="today-section">
            <h4>Сегодня</h4>
            <div v-for="step in demoSteps" :key="step.id" class="today-step" @click="toggleStep(step)">
              <div class="step-checkbox" :class="{ checked: step.done }">
                <span v-if="step.done">✓</span>
              </div>
              <span :class="{ 'step-done': step.done }">{{ step.title }}</span>
            </div>
          </div>

          <div class="today-locked">
            🔒 Завтра откроется: <strong>Дневник</strong>
          </div>

          <div class="sasha-card mini">
            <div class="sasha-avatar small">🤖</div>
            <div class="sasha-content">
              <div class="sasha-name">Саша</div>
              <p>Ты выполнил первый шаг! Хочешь обсудить, что заметил?</p>
              <button class="btn-chat">Обсудить с Сашей</button>
            </div>
          </div>

          <!-- Demo sidebar -->
          <div class="demo-sidebar-preview">
            <h4>Сайдбар</h4>
            <div class="sidebar-item active">📊 Сегодня</div>
            <div class="sidebar-item">🎯 Мои цели</div>
            <div class="sidebar-item locked">📖 Дневник <span class="lock-badge">День 2</span></div>
            <div class="sidebar-item locked">📅 Планирование <span class="lock-badge">День 3</span></div>
            <div class="sidebar-item locked">🔥 Привычки <span class="lock-badge">День 5</span></div>
            <div class="sidebar-item locked">⚙️ Ещё 4 модуля <span class="lock-badge">День 7</span></div>
          </div>
        </div>

        <!-- Day 2 -->
        <div v-if="demoDay === 2" class="today-content fade-in">
          <div class="today-header">
            <h1>День 2 из 7</h1>
            <div class="xp-mini">🏆 25 XP</div>
          </div>

          <div class="mission-card">
            <div class="mission-badge">Миссия дня</div>
            <h3>Напиши вечернюю рефлексию</h3>
            <p>Ответь на один вопрос в дневнике. Это займёт 1 минуту.</p>
          </div>

          <div class="today-section">
            <h4>Дневник — 1 вопрос</h4>
            <div class="journal-question">
              <p><strong>Что сегодня получилось?</strong></p>
              <textarea v-model="demoJournal" class="text-input" rows="3" placeholder="Напиши здесь..."></textarea>
            </div>
          </div>

          <div class="sasha-card mini">
            <div class="sasha-avatar small">🤖</div>
            <div class="sasha-content">
              <div class="sasha-name">Саша</div>
              <p>Исследование Гарварда: рефлексия 15 мин/день = +23% эффективности. Начнём с одного вопроса.</p>
            </div>
          </div>

          <div class="today-locked">
            🔒 Завтра откроется: <strong>Планирование</strong>
          </div>

          <div class="demo-sidebar-preview">
            <h4>Сайдбар</h4>
            <div class="sidebar-item active">📊 Сегодня</div>
            <div class="sidebar-item">🎯 Мои цели</div>
            <div class="sidebar-item new">📖 Дневник <span class="new-badge">NEW</span></div>
            <div class="sidebar-item locked">📅 Планирование <span class="lock-badge">День 3</span></div>
            <div class="sidebar-item locked">🔥 Привычки <span class="lock-badge">День 5</span></div>
            <div class="sidebar-item locked">⚙️ Ещё 4 модуля <span class="lock-badge">День 7</span></div>
          </div>
        </div>

        <!-- Day 3 -->
        <div v-if="demoDay === 3" class="today-content fade-in">
          <div class="today-header">
            <h1>День 3 из 7</h1>
            <div class="xp-mini">🏆 40 XP</div>
          </div>

          <div class="mission-card">
            <div class="mission-badge">Миссия дня</div>
            <h3>Запланируй неделю</h3>
            <p>Распредели 2-3 шага по дням.</p>
          </div>

          <div class="sasha-card mini">
            <div class="sasha-avatar small">🤖</div>
            <div class="sasha-content">
              <div class="sasha-name">Саша</div>
              <p>Психолог Голлвитцер доказал: записать "когда и где" = вероятность x2-3. Попробуй сегодня!</p>
            </div>
          </div>

          <div class="demo-sidebar-preview">
            <h4>Сайдбар</h4>
            <div class="sidebar-item">📊 Сегодня</div>
            <div class="sidebar-item">🎯 Мои цели</div>
            <div class="sidebar-item">📖 Дневник</div>
            <div class="sidebar-item new">📅 Планирование <span class="new-badge">NEW</span></div>
            <div class="sidebar-item locked">🔥 Привычки <span class="lock-badge">День 5</span></div>
            <div class="sidebar-item locked">⚙️ Ещё 4 модуля <span class="lock-badge">День 7</span></div>
          </div>
        </div>

        <!-- Day 5 -->
        <div v-if="demoDay === 5" class="today-content fade-in">
          <div class="today-header">
            <h1>День 5 из 7</h1>
            <div class="xp-mini">🏆 70 XP</div>
          </div>

          <div class="mission-card">
            <div class="mission-badge">Миссия дня</div>
            <h3>Добавь одну привычку</h3>
            <p>Что-то маленькое, невозможно простое.</p>
          </div>

          <div class="today-section">
            <h4>Привычки</h4>
            <div v-for="habit in demoHabits" :key="habit.id" class="today-step" @click="toggleHabit(habit)">
              <div class="step-checkbox" :class="{ checked: habit.done }">
                <span v-if="habit.done">✓</span>
              </div>
              <span :class="{ 'step-done': habit.done }">{{ habit.title }}</span>
            </div>
          </div>

          <div class="sasha-card mini">
            <div class="sasha-avatar small">🤖</div>
            <div class="sasha-content">
              <div class="sasha-name">Саша</div>
              <p>Знаешь, что я могу ставить задачи за тебя? Просто напиши: "Поставь задачу: позвонить маме"</p>
              <button class="btn-chat">Попробовать</button>
            </div>
          </div>

          <div class="demo-sidebar-preview">
            <h4>Сайдбар</h4>
            <div class="sidebar-item">📊 Сегодня</div>
            <div class="sidebar-item">🎯 Мои цели</div>
            <div class="sidebar-item">📖 Дневник</div>
            <div class="sidebar-item">📅 Планирование</div>
            <div class="sidebar-item new">🔥 Привычки <span class="new-badge">NEW</span></div>
            <div class="sidebar-item locked">⚙️ Ещё 4 модуля <span class="lock-badge">День 7</span></div>
          </div>
        </div>

        <!-- Day 7 -->
        <div v-if="demoDay === 7" class="today-content fade-in">
          <div class="today-header">
            <h1>Первая неделя пройдена!</h1>
            <div class="xp-mini">🏆 120 XP • Уровень 2</div>
          </div>

          <div class="week-review">
            <div class="review-stat">
              <span class="review-value">✅ 5</span>
              <span class="review-label">Шагов выполнено</span>
            </div>
            <div class="review-stat">
              <span class="review-value">📝 4</span>
              <span class="review-label">Записей в дневнике</span>
            </div>
            <div class="review-stat">
              <span class="review-value">🔥 3</span>
              <span class="review-label">Серия привычек</span>
            </div>
          </div>

          <div class="sasha-card highlight">
            <div class="sasha-avatar">🤖</div>
            <div class="sasha-content">
              <div class="sasha-name">Саша</div>
              <p>Большинство бросают в первые 3 дня. Ты — нет. Это уже говорит о тебе многое.</p>
              <p>Кстати, за неделю я неплохо тебя узнал. Теперь мои советы будут ещё точнее.</p>
            </div>
          </div>

          <div class="unlock-all">
            🎉 Все функции теперь открыты!
          </div>

          <div class="demo-sidebar-preview">
            <h4>Сайдбар — полный доступ</h4>
            <div class="sidebar-item">📊 Главная</div>
            <div class="sidebar-item">🎯 ССП</div>
            <div class="sidebar-item">🏦 Банк целей</div>
            <div class="sidebar-item">📅 Планирование</div>
            <div class="sidebar-item">📖 Дневник</div>
            <div class="sidebar-item">🔥 Привычки</div>
            <div class="sidebar-item">🏆 Достижения</div>
            <div class="sidebar-item">📚 Обучение</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Base ────────────────────────────── */
.demo-root {
  min-height: 100vh;
  background: #0f0f1a;
  color: #e2e8f0;
  font-family: system-ui, -apple-system, sans-serif;
}

.demo-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #0f0f1a;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.demo-header-inner {
  max-width: 480px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.demo-badge {
  background: #6366f1;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: 1px;
}

.demo-title { font-size: 14px; opacity: 0.7; flex: 1; }

.demo-restart {
  background: none;
  border: 1px solid rgba(255,255,255,0.15);
  color: #94a3b8;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}

.demo-progress {
  height: 3px;
  background: rgba(255,255,255,0.05);
}

.demo-progress-fill {
  height: 100%;
  background: #6366f1;
  transition: width 0.5s ease;
}

/* ── Content ─────────────────────────── */
.demo-content {
  max-width: 480px;
  margin: 0 auto;
  padding: 20px;
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
  font-size: 48px;
  margin-bottom: 16px;
}

h1 {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 8px;
  line-height: 1.3;
}

.screen-subtitle {
  color: #94a3b8;
  font-size: 14px;
  margin: 0 0 24px;
}

.screen-hint {
  color: #64748b;
  font-size: 13px;
  margin: 0 0 16px;
}

.screen-note {
  color: #475569;
  font-size: 12px;
  margin-top: 24px;
  padding: 12px;
  border: 1px dashed rgba(255,255,255,0.1);
  border-radius: 8px;
  line-height: 1.5;
}

.optional-tag {
  color: #64748b;
  font-size: 12px;
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
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 16px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  color: #e2e8f0;
  font-size: 15px;
  transition: all 0.2s;
}

.option-card:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
}

.option-card.selected {
  background: rgba(99, 102, 241, 0.15);
  border-color: #6366f1;
}

.option-icon { font-size: 20px; }
.option-label { flex: 1; }
.option-desc { color: #64748b; font-size: 13px; }

.scenario-counter {
  color: #6366f1;
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
  font-size: 14px;
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
.stat-value { font-size: 28px; font-weight: 700; }
.stat-label { font-size: 12px; color: #94a3b8; }

/* ── Sasha Card ──────────────────────── */
.sasha-card {
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  gap: 14px;
  text-align: left;
  width: 100%;
  margin-bottom: 20px;
}

.sasha-card.highlight {
  background: rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.4);
}

.sasha-card.mini {
  padding: 14px;
  gap: 10px;
}

.sasha-card.mini p { font-size: 13px; }

.sasha-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.sasha-avatar.large { width: 64px; height: 64px; font-size: 32px; margin-bottom: 16px; }
.sasha-avatar.small { width: 32px; height: 32px; font-size: 16px; }

.sasha-content { flex: 1; }
.sasha-name { font-size: 13px; font-weight: 600; color: #6366f1; margin-bottom: 6px; }
.sasha-content p { font-size: 14px; line-height: 1.5; margin: 0 0 6px; color: #cbd5e1; }

.btn-chat {
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #818cf8;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  margin-top: 6px;
}

/* ── Buttons ─────────────────────────── */
.btn-primary {
  background: #6366f1;
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;
}

.btn-primary:hover { background: #5558e6; }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-secondary {
  background: none;
  border: none;
  color: #64748b;
  padding: 12px;
  font-size: 14px;
  cursor: pointer;
}

.btn-telegram {
  background: #2AABEE;
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-bottom: 8px;
}

.btn-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

/* ── Inputs ──────────────────────────── */
.text-input {
  width: 100%;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 14px;
  color: #e2e8f0;
  font-size: 15px;
  font-family: inherit;
  resize: none;
  margin-bottom: 16px;
  line-height: 1.5;
}

.text-input:focus {
  outline: none;
  border-color: #6366f1;
}

.text-input.large { font-size: 16px; }

/* ── Generation ──────────────────────── */
.generating {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
}

.generating h2 { font-size: 18px; margin-bottom: 16px; }

.sasha-thinking {
  color: #94a3b8;
  font-size: 14px;
  font-style: italic;
  line-height: 1.6;
  max-width: 360px;
  margin-bottom: 24px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255,255,255,0.06);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: #6366f1;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text { font-size: 12px; color: #64748b; }

/* ── Plan ────────────────────────────── */
.plan-ready { width: 100%; text-align: center; }

.plan-sphere-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid;
  margin-bottom: 20px;
}

.goal-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 20px;
  text-align: left;
  margin-bottom: 20px;
  width: 100%;
}

.goal-card h3 { font-size: 16px; margin: 0 0 16px; }

.steps-list { display: flex; flex-direction: column; gap: 12px; }

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.step-text { flex: 1; font-size: 14px; }
.step-time { color: #64748b; font-size: 12px; }

/* ── Typing ──────────────────────────── */
.sasha-typing {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
}

.typing-dots {
  display: flex;
  gap: 6px;
  margin: 16px 0 12px;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6366f1;
  animation: typingBounce 1.2s infinite;
}

.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingBounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-8px); opacity: 1; }
}

.sasha-typing p { color: #64748b; font-size: 14px; }

/* ── XP Celebration ──────────────────── */
.xp-celebration {
  text-align: center;
  margin: 24px 0;
}

.xp-badge {
  display: inline-block;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: white;
  font-size: 20px;
  font-weight: 700;
  padding: 8px 24px;
  border-radius: 20px;
  margin-bottom: 12px;
}

.xp-celebration h2 { font-size: 20px; margin: 0 0 4px; }
.xp-celebration p { color: #64748b; margin: 0; }

/* ── Telegram ────────────────────────── */
.telegram-features {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 20px 0;
  text-align: left;
}

.tg-feature {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #cbd5e1;
}

.tg-feature span { font-size: 18px; }

.tg-tagline {
  color: #94a3b8;
  font-size: 14px;
  font-style: italic;
  margin-bottom: 20px;
}

/* ── Today View ──────────────────────── */
.today-screen { align-items: stretch; text-align: left; }

.day-switcher {
  display: flex;
  gap: 6px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.day-switcher button {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: #94a3b8;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
}

.day-switcher button.active {
  background: #6366f1;
  border-color: #6366f1;
  color: white;
}

.today-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.today-header h1 { font-size: 20px; margin: 0; }

.xp-mini {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.today-goal {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.today-goal-sphere { font-size: 13px; font-weight: 600; margin-bottom: 6px; }
.today-goal h3 { font-size: 15px; margin: 0; }

.today-section { margin-bottom: 16px; }
.today-section h4 { font-size: 13px; color: #94a3b8; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.5px; }

.today-step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  cursor: pointer;
  font-size: 14px;
}

.step-checkbox {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 12px;
  transition: all 0.2s;
}

.step-checkbox.checked {
  background: #22c55e;
  border-color: #22c55e;
  color: white;
}

.step-done { text-decoration: line-through; opacity: 0.5; }

.today-locked {
  background: rgba(255,255,255,0.02);
  border: 1px dashed rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 12px 16px;
  text-align: center;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 16px;
}

.mission-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08));
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 16px;
}

.mission-badge {
  display: inline-block;
  background: #6366f1;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.mission-card h3 { font-size: 15px; margin: 0 0 4px; }
.mission-card p { font-size: 13px; color: #94a3b8; margin: 0; }

.journal-question p { margin: 0 0 8px; font-size: 14px; }

/* ── Sidebar Preview ─────────────────── */
.demo-sidebar-preview {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 14px;
  margin-top: 20px;
}

.demo-sidebar-preview h4 {
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 10px;
}

.sidebar-item {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-item.active {
  background: rgba(99, 102, 241, 0.12);
  color: #818cf8;
}

.sidebar-item.locked { opacity: 0.35; }
.sidebar-item.new { color: #22c55e; }

.lock-badge {
  font-size: 10px;
  background: rgba(255,255,255,0.06);
  padding: 2px 6px;
  border-radius: 4px;
  color: #64748b;
}

.new-badge {
  font-size: 9px;
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
}

/* ── Week Review ─────────────────────── */
.week-review {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.review-stat {
  flex: 1;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 14px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.review-value { font-size: 20px; }
.review-label { font-size: 11px; color: #64748b; }

.unlock-all {
  text-align: center;
  font-size: 16px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(99, 102, 241, 0.08));
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 12px;
  margin-bottom: 16px;
}
</style>
