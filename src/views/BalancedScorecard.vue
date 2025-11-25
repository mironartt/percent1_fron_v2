<template>
  <div class="ssp-container">
    <!-- Empty State - First Visit -->
    <div v-if="showEmptyState" class="empty-state-section">
      <div class="empty-state-card card">
        <div class="empty-icon">⚖️</div>
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
          ✨ Начать оценку
        </button>
      </div>
    </div>

    <!-- Summary State - After Completion -->
    <div v-else-if="showSummary" class="summary-section-main">
      <header class="section-header">
        <h1>⚖️ ССП — Результаты</h1>
        <p class="subtitle">Оценка завершена {{ formatCompletedDate }}</p>
      </header>

      <div class="summary-grid">
        <div class="summary-stat-card card">
          <div class="summary-icon">📊</div>
          <div class="summary-value">{{ averageScore.toFixed(1) }}</div>
          <div class="summary-label">Средний балл</div>
        </div>

        <div class="summary-stat-card card" v-if="strongestSphere">
          <div class="summary-icon">💪</div>
          <div class="summary-value">{{ strongestSphere.icon }}</div>
          <div class="summary-label">Самая сильная<br/>{{ strongestSphere.name }}</div>
        </div>

        <div class="summary-stat-card card" v-if="weakestSphere">
          <div class="summary-icon">🎯</div>
          <div class="summary-value">{{ weakestSphere.icon }}</div>
          <div class="summary-label">Зона роста<br/>{{ weakestSphere.name }}</div>
        </div>
      </div>

      <div class="wheel-summary card">
        <h3>Система сбалансированных показателей</h3>
        <div class="wheel-visualization">
          <WheelOfLife :spheres="lifeSpheres" :readonly="true" />
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
          
          <p style="margin-bottom: 1.5rem; line-height: 1.6;">
            Представьте вашу жизнь как колесо. Каждая спица — это важная сфера: здоровье, карьера, отношения, финансы, хобби и личностный рост. Если одна из спиц короче других, колесо катится неровно.
          </p>

          <p style="margin-bottom: 1.5rem; line-height: 1.6;">
            Точно так же работает и ваша жизнь. Дисбаланс в одной сфере влияет на все остальные. Нельзя быть по-настоящему успешным в карьере, если страдает здоровье. Сложно радоваться достижениям, если нет времени на близких.
          </p>

          <div class="idea-block" style="margin-bottom: 2rem;">
            <div class="idea-icon">💡</div>
            <div>
              <h3>Ключевая идея</h3>
              <p>Для роста нужен баланс. Цели работают только тогда, когда опираются на внутреннюю мотивацию и системное равновесие между всеми сферами жизни.</p>
            </div>
          </div>

          <h3 style="margin-bottom: 1.5rem; font-size: 1.1rem; font-weight: 600;">Что вы будете делать?</h3>
          <ol style="margin-left: 1.5rem; line-height: 1.8; font-size: 0.95rem;">
            <li><strong>Шаг 1:</strong> Оцените каждую сферу жизни от 0 до 10, переещая секторы колеса.</li>
            <li><strong>Шаг 2:</strong> Ответьте на вопросы ИИ-коуча о каждой сфере.</li>
            <li><strong>Шаг 3:</strong> Проведете глубокую рефлексию и дадите себе ответ почему поставили такой балл</li>
          </ol>
        </div>

        <div class="step-actions">
          <button class="btn btn-primary btn-lg" @click="nextStep">
            Перейти к упражнению "Колесо баланса" →
          </button>
        </div>
      </div>
    </div>

    <!-- Step 2: Колесо баланса -->
    <div v-if="currentStep === 2" class="step-content">
      <div class="wheel-section">
        <header class="section-header">
          <h1>⚖️ Система сбалансированных показателей</h1>
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
            <div class="card ai-coach">
              <div class="coach-header">
                <span class="coach-icon">💬</span>
                <h3>ИИ-коуч</h3>
              </div>
              
              <div class="chat-container">
                <div class="chat-messages">
                  <div class="message coach-message">
                    <span class="message-avatar">🤖</span>
                    <div class="message-content">
                      <p>Заполните колесо баланса, оценив каждую сферу от 0 до 10. Для этого кликните на сектор и перетащите его край наружу или внутрь.</p>
                    </div>
                  </div>
                  <div v-for="msg in chatMessages" :key="msg.id" class="message" :class="msg.type">
                    <span v-if="msg.type === 'coach'" class="message-avatar">🤖</span>
                    <div class="message-content">
                      <p>{{ msg.text }}</p>
                    </div>
                  </div>
                </div>
                
                <div class="chat-input-area">
                  <input 
                    v-model="userMessage"
                    @keyup.enter="sendMessage"
                    type="text"
                    placeholder="Напишите ваш ответ..."
                    class="chat-input"
                  />
                  <button @click="sendMessage" class="btn-send">
                    Отправить
                  </button>
                </div>
              </div>
            </div>

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
          <h1>🔍 Глубокая рефлексия</h1>
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
          >
            <div 
              class="accordion-header"
              @click="toggleSphereExpand(sphere.id)"
            >
              <div class="accordion-left">
                <span class="sphere-icon">{{ sphere.icon }}</span>
                <div class="sphere-title-info">
                  <h2>{{ sphere.name }}</h2>
                  <div class="header-meta">
                    <span class="score-badge">{{ sphere.score }}/10</span>
                    <span v-if="hasReflectionContent(sphere)" class="filled-badge">✓ Заполнено</span>
                  </div>
                </div>
              </div>
              <span class="accordion-arrow" :class="{ rotated: expandedSpheres.includes(sphere.id) }">▼</span>
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
      <div class="summary-section">
        <header class="section-header">
          <h1>📋 Итог упражнения</h1>
          <p class="subtitle">
            Вы завершили Систему сбалансированных показателей
          </p>
        </header>

        <div class="summary-content">
          <div class="card summary-card">
            <h2>✅ Что вы сделали</h2>
            <div class="achievement-list">
              <div class="achievement-item">
                <span class="achievement-icon">1️⃣</span>
                <div>
                  <h3>Оценили 6 сфер жизни</h3>
                  <p>Определили текущее состояние каждой важной области вашей жизни</p>
                </div>
              </div>
              <div class="achievement-item">
                <span class="achievement-icon">2️⃣</span>
                <div>
                  <h3>Провели глубокую рефлексию</h3>
                  <p>Ответили на 4 ключевых вопроса по каждой сфере</p>
                </div>
              </div>
              <div class="achievement-item">
                <span class="achievement-icon">3️⃣</span>
                <div>
                  <h3>Зафиксировали свои желания</h3>
                  <p>Записали свои думки и видение без спешки</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card insight-card">
            <h2>💡 Ключевые insight'ы</h2>
            <ul class="insight-list">
              <li>Баланс в жизни — это не идеальный 10/10 везде, а осознанный выбор приоритетов</li>
              <li>Ваши оценки показывают, где есть дисбаланс и требуется внимание</li>
              <li>Рефлексия помогает понять корни текущей ситуации и направить энергию</li>
              <li>Маленькие изменения в каждой сфере создают большой эффект на качество жизни</li>
            </ul>
          </div>

          <div class="card next-steps-card">
            <h2>🚀 Что дальше?</h2>
            <p>Теперь у вас есть полное понимание своей текущей жизни. Это основа для:</p>
            <ul class="next-steps-list">
              <li>Постановки целей в каждой сфере</li>
              <li>Создания плана развития</li>
              <li>Ежедневного прогресса в направлении желаемого баланса</li>
              <li>Регулярной переоценки и корректировки приоритетов</li>
            </ul>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn btn-secondary" @click="prevStep">
            ← Назад к рефлексии
          </button>
          <button 
            class="btn btn-primary btn-lg" 
            @click="completeModule"
          >
            ✅ Завершить модуль
          </button>
        </div>
      </div>
    </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import WheelOfLife from '../components/WheelOfLife.vue'

const store = useAppStore()
const router = useRouter()

const steps = ['Теория', 'ССП', 'Рефлексия', 'Итог']
const currentStep = ref(1)

const lifeSpheres = computed(() => store.lifeSpheres)
const selectedSphere = ref(null)
const sspModuleCompleted = computed(() => store.sspModuleCompleted)

const lessonStarted = ref(false)
const expandedSpheres = ref([])

function toggleSphereExpand(sphereId) {
  const index = expandedSpheres.value.indexOf(sphereId)
  if (index === -1) {
    expandedSpheres.value.push(sphereId)
  } else {
    expandedSpheres.value.splice(index, 1)
  }
}

function hasReflectionContent(sphere) {
  if (!sphere.reflection) return false
  return sphere.reflection.why || sphere.reflection.ten || 
         sphere.reflection.prevents || sphere.reflection.desired
}

const showEmptyState = computed(() => {
  const hasScores = lifeSpheres.value.some(s => s.score > 0)
  return !sspModuleCompleted.value?.completed && !hasScores && !lessonStarted.value
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
  router.push('/goals-bank')
}

function restartLesson() {
  if (confirm('Вы уверены? Все оценки и рефлексии будут сброшены.')) {
    store.resetSSPModule()
    lessonStarted.value = false
    currentStep.value = 1
  }
}

// Chat state
const chatMessages = ref([])
const userMessage = ref('')

const wheelCompleted = computed(() => {
  return lifeSpheres.value.every(s => s.score > 0)
})


function nextStep() {
  if (currentStep.value < 4) {
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

function sendMessage() {
  if (!userMessage.value.trim()) return
  
  // Add user message
  chatMessages.value.push({
    id: Date.now(),
    type: 'user',
    text: userMessage.value
  })
  
  // Generate coach response based on context
  const coachResponses = [
    'Спасибо за ответ! Это очень важная информация.',
    'Интересно! Расскажите подробнее о вашем подходе к этому.',
    'Я вижу, что это важно для вас. Как вы можете улучшить эту область?',
    'Хорошее наблюдение! Что вы хотите изменить в этом?',
    'Спасибо за честный ответ. Это поможет вам в развитии.'
  ]
  
  const randomResponse = coachResponses[Math.floor(Math.random() * coachResponses.length)]
  
  setTimeout(() => {
    chatMessages.value.push({
      id: Date.now() + 1,
      type: 'coach',
      text: randomResponse
    })
  }, 300)
  
  userMessage.value = ''
}


function getSphereById(sphereId) {
  return lifeSpheres.value.find(s => s.id === sphereId)
}

function saveReflection(sphereId) {
  store.updateSphere(sphereId, {
    reflection: lifeSpheres.value.find(s => s.id === sphereId)?.reflection
  })
}

function completeModule() {
  store.completeSSPModule({
    completedAt: new Date().toISOString(),
    wheelData: lifeSpheres.value.map(s => ({
      id: s.id,
      score: s.score,
      notes: s.notes,
      reflection: s.reflection
    }))
  })
}
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

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-stat-card {
  text-align: center;
  padding: 1.5rem;
}

.summary-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.summary-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.summary-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  line-height: 1.3;
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
  max-width: 500px;
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
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.idea-block {
  display: flex;
  gap: 1.5rem;
  padding: 2rem;
  background: rgba(99, 102, 241, 0.05);
  border-radius: var(--radius-lg);
  border: 2px solid rgba(99, 102, 241, 0.2);
  margin-bottom: 2rem;
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
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.3s ease;
}

.accordion-item:hover {
  border-color: var(--primary-light);
}

.accordion-item.expanded {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
}

.accordion-item.has-content:not(.expanded) {
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.02);
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
</style>
