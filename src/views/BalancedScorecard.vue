<template>
  <div class="ssp-container">
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

        <div class="card">
          <div class="video-container">
            <div class="video-placeholder">
              <div class="play-button">▶</div>
              <p>Видео: "Баланс как основа роста"</p>
              <small>Здесь будет видео с теоретической частью</small>
            </div>
          </div>
        </div>

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
            <li><strong>Шаг 3:</strong> Сформируйте банк целей, отделив свои истинные желания от навязанных.</li>
            <li><strong>Шаг 4:</strong> Выберите 3-5 ключевых целей для фокуса.</li>
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
                <span class="coach-icon">🤖</span>
                <h3>Наставник</h3>
              </div>
              <div class="coach-status">
                <span class="status-indicator active"></span>
                <span>Готов помочь с упражнением</span>
              </div>
              <p class="coach-intro">
                Я помогу вам разобраться с каждой сферой жизни через диалог. 
                Задам вопросы, которые помогут глубже понять ситуацию.
              </p>
              <button class="btn btn-primary" @click="startCoachDialog">
                Начать диалог с Наставником
              </button>
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
            Завершить →
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
            Ответьте на вопросы по каждой сфере жизни. Не думайте пока о реализации — просто фиксируйте мысли и желания.
          </p>
        </header>

        <div class="reflection-cards">
          <div 
            v-for="sphere in lifeSpheres" 
            :key="sphere.id"
            class="reflection-card"
          >
            <div class="sphere-header">
              <span class="sphere-icon">{{ sphere.icon }}</span>
              <div class="sphere-title-info">
                <h2>{{ sphere.name }}</h2>
                <div class="score-badge">Оценка: {{ sphere.score }}/10</div>
              </div>
            </div>

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

        <div class="step-actions">
          <button class="btn btn-secondary" @click="prevStep">
            ← Назад к колесу баланса
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
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'
import WheelOfLife from '../components/WheelOfLife.vue'

const store = useAppStore()

const steps = ['Теория', 'ССП', 'Результаты']
const currentStep = ref(1)

const lifeSpheres = computed(() => store.lifeSpheres)
const selectedSphere = ref(null)

const wheelCompleted = computed(() => {
  return lifeSpheres.value.every(s => s.score > 0)
})


function nextStep() {
  if (currentStep.value < 3) {
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

function startCoachDialog() {
  alert('ИИ-коуч в разработке. Скоро здесь будет интерактивный диалог!')
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
  
  alert('🎉 Поздравляем! Модуль "Сбалансированная система показателей" пройден!')
  currentStep.value = 1
}
</script>

<style scoped>
.ssp-container {
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: 2rem;
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
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--border-color);
  z-index: 0;
}

.progress-step:first-child::before {
  display: none;
}

.progress-step.completed::before {
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
