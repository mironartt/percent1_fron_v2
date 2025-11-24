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
          <h1>🎮 Настройка вашего аватара</h1>
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
          <h2>Зачем нужно колесо баланса?</h2>
          
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
                <h3>ИИ-Коуч</h3>
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
                Начать диалог с ИИ-коучем
              </button>
            </div>

            <div class="card sphere-details" v-if="selectedSphere">
              <h3>{{ selectedSphere.icon }} {{ selectedSphere.name }}</h3>
              <div class="score-display-large">
                <span class="score-value">{{ selectedSphere.score }}</span>
                <span class="score-max">/10</span>
              </div>
              
              <div class="form-group">
                <label class="form-label">Заметки и размышления</label>
                <textarea 
                  v-model="selectedSphere.notes"
                  class="form-textarea"
                  rows="6"
                  placeholder="Что происходит в этой сфере? Что вас беспокоит или радует?"
                  @blur="saveSphereNotes"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn btn-secondary" @click="prevStep">
            ← Назад к теории
          </button>
          <button class="btn btn-primary btn-lg" @click="nextStep" :disabled="!wheelCompleted">
            Перейти к банку целей →
          </button>
        </div>
      </div>
    </div>

    <!-- Step 3: Банк целей -->
    <div v-if="currentStep === 3" class="step-content">
      <div class="goals-bank-section">
        <header class="section-header">
          <h1>🎯 Банк целей</h1>
          <p class="subtitle">
            Исследуйте свои желания, отделите истинные цели от навязанных
          </p>
        </header>

        <div class="card instruction-card">
          <h3>Как работать с банком целей</h3>
          <ol class="instruction-list">
            <li>Выпишите все цели и желания, которые приходят в голову</li>
            <li>Для каждой цели подумайте: "Это действительно МОЯ цель или чья-то?"</li>
            <li>Отметьте цели, которые откликаются внутри (истинные цели)</li>
            <li>Привяжите каждую цель к сфере жизни</li>
          </ol>
        </div>

        <GoalsBank 
          :spheres="lifeSpheres"
          :goals="goalsBank"
          @add-goal="addGoalToBank"
          @update-goal="updateGoalInBank"
          @delete-goal="deleteGoalFromBank"
        />

        <div class="step-actions">
          <button class="btn btn-secondary" @click="prevStep">
            ← Назад к колесу баланса
          </button>
          <button class="btn btn-primary btn-lg" @click="nextStep" :disabled="goalsBank.length === 0">
            Зафиксировать результаты →
          </button>
        </div>
      </div>
    </div>

    <!-- Step 4: Фиксирование результатов -->
    <div v-if="currentStep === 4" class="step-content">
      <div class="results-section">
        <header class="section-header">
          <h1>✅ Фиксирование результатов</h1>
          <p class="subtitle">
            Выберите 3-5 ключевых целей для фокуса
          </p>
        </header>

        <div class="card results-summary">
          <h2>Ваши результаты упражнения</h2>
          
          <div class="summary-block">
            <h3>📊 Колесо баланса</h3>
            <div class="wheel-summary">
              <div 
                v-for="sphere in lifeSpheres" 
                :key="sphere.id"
                class="sphere-summary-item"
              >
                <div class="sphere-info">
                  <span class="sphere-icon">{{ sphere.icon }}</span>
                  <span class="sphere-name">{{ sphere.name }}</span>
                </div>
                <div class="sphere-score-bar">
                  <div 
                    class="score-fill" 
                    :style="{ width: `${sphere.score * 10}%` }"
                  ></div>
                  <span class="score-label">{{ sphere.score }}/10</span>
                </div>
              </div>
            </div>
          </div>

          <div class="summary-block">
            <h3>🎯 Банк целей</h3>
            <p>Всего целей в банке: <strong>{{ goalsBank.length }}</strong></p>
            <p>Истинных целей: <strong>{{ trueGoals.length }}</strong></p>
          </div>

          <div class="summary-block">
            <h3>🎯 Выберите 3-5 приоритетных целей</h3>
            <p class="hint">Выберите цели, которые дадут максимальный эффект для вашего роста</p>
            
            <div class="focus-goals-selector">
              <div 
                v-for="goal in trueGoals" 
                :key="goal.id"
                class="goal-checkbox-item"
                :class="{ selected: goal.priority }"
                @click="togglePriority(goal.id)"
              >
                <input 
                  type="checkbox" 
                  :checked="goal.priority"
                  @click.stop
                  @change="togglePriority(goal.id)"
                />
                <div class="goal-info">
                  <div class="goal-title">{{ goal.title }}</div>
                  <div class="goal-sphere">
                    {{ getSphereById(goal.sphereId)?.icon }} {{ getSphereById(goal.sphereId)?.name }}
                  </div>
                </div>
              </div>
            </div>

            <div v-if="priorityGoals.length > 0" class="priority-summary">
              <p>Выбрано целей: <strong>{{ priorityGoals.length }}</strong></p>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn btn-secondary" @click="prevStep">
            ← Назад к банку целей
          </button>
          <button 
            class="btn btn-primary btn-lg" 
            @click="completeModule"
            :disabled="priorityGoals.length < 3 || priorityGoals.length > 5"
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
import GoalsBank from '../components/GoalsBank.vue'

const store = useAppStore()

const steps = ['Теория', 'ССП', 'Банк целей', 'Результаты']
const currentStep = ref(1)

const lifeSpheres = computed(() => store.lifeSpheres)
const goalsBank = computed(() => store.sspGoalsBank || [])
const selectedSphere = ref(null)

const wheelCompleted = computed(() => {
  return lifeSpheres.value.every(s => s.score > 0)
})

const trueGoals = computed(() => {
  return goalsBank.value.filter(g => g.isTrue)
})

const priorityGoals = computed(() => {
  return goalsBank.value.filter(g => g.priority)
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

function startCoachDialog() {
  alert('ИИ-коуч в разработке. Скоро здесь будет интерактивный диалог!')
}

function addGoalToBank(goal) {
  store.addGoalToSSPBank(goal)
}

function updateGoalInBank(goalId, updates) {
  store.updateSSPGoal(goalId, updates)
}

function deleteGoalFromBank(goalId) {
  store.deleteSSPGoal(goalId)
}

function togglePriority(goalId) {
  const goal = goalsBank.value.find(g => g.id === goalId)
  if (goal) {
    const newPriority = !goal.priority
    
    if (newPriority && priorityGoals.value.length >= 5) {
      alert('Можно выбрать максимум 5 приоритетных целей')
      return
    }
    
    store.updateSSPGoal(goalId, { priority: newPriority })
  }
}

function getSphereById(sphereId) {
  return lifeSpheres.value.find(s => s.id === sphereId)
}

function completeModule() {
  store.completeSSPModule({
    completedAt: new Date().toISOString(),
    wheelData: lifeSpheres.value.map(s => ({
      id: s.id,
      score: s.score,
      notes: s.notes
    })),
    goalsBank: goalsBank.value,
    priorityGoals: priorityGoals.value
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
