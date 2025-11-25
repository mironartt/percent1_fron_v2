<template>
  <div class="goals-bank-container">
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

    <!-- Step 1: Формирование банка целей -->
    <div v-if="currentStep === 1" class="step-content">
      <div class="step-section">
        <header class="section-header">
          <h1>📝 Формирование банка целей</h1>
          <p class="subtitle">
            Запиши все идеи, желания, мечты, цели, хотелки для каждой сферы.
            <strong>Не фильтруй, не рационализируй.</strong>
          </p>
        </header>

        <div class="instruction-card card">
          <div class="instruction-icon">💡</div>
          <div>
            <h3>Как заполнять?</h3>
            <ul>
              <li>Записывай всё подряд — желания, мечты, цели</li>
              <li>Ничего не удаляй и не структурируй</li>
              <li>Это сырая база для декомпозиции на следующих этапах</li>
              <li>Формулируй: <strong>что хочу</strong> + <strong>почему это важно для меня</strong></li>
            </ul>
          </div>
        </div>

        <div class="goals-table-container">
          <h3 class="table-title">🏦 Банк идей и целей на жизнь</h3>
          
          <div class="add-idea-section">
            <select v-model="newIdea.sphereId" class="form-select sphere-select">
              <option value="">Выбери сферу</option>
              <option v-for="sphere in lifeSpheres" :key="sphere.id" :value="sphere.id">
                {{ sphere.icon }} {{ sphere.name }}
              </option>
            </select>
            <input 
              v-model="newIdea.text"
              type="text"
              class="form-input"
              placeholder="Цель/Идея (что хочу)"
              @keyup.enter="addNewIdea"
            />
            <input 
              v-model="newIdea.whyImportant"
              type="text"
              class="form-input"
              placeholder="Почему это важно для меня?"
              @keyup.enter="addNewIdea"
            />
            <button class="btn btn-primary" @click="addNewIdea">
              ➕ Добавить
            </button>
          </div>

          <div class="goals-table">
            <div class="table-header">
              <div class="col-status">Статус</div>
              <div class="col-sphere">Сфера</div>
              <div class="col-goal">Цель/Идея</div>
              <div class="col-why">Почему важно?</div>
              <div class="col-mvp">MVP</div>
              <div class="col-decomposition">Декомпозиция</div>
              <div class="col-actions">Действия</div>
            </div>

            <div v-if="rawIdeas.length === 0" class="empty-table">
              <p>Пока нет целей. Начните добавлять свои идеи и желания!</p>
            </div>

            <div 
              v-for="idea in rawIdeas" 
              :key="idea.id"
              class="table-row"
              :class="{ validated: idea.status === 'validated', rejected: idea.status === 'rejected' }"
            >
              <div class="col-status">
                <span class="status-badge" :class="idea.status">
                  {{ getStatusLabel(idea.status) }}
                </span>
              </div>
              <div class="col-sphere">
                {{ getSphereName(idea.sphereId) }}
              </div>
              <div class="col-goal">
                <input 
                  :value="idea.text"
                  @input="updateIdea(idea.id, { text: $event.target.value })"
                  class="cell-input"
                  placeholder="Цель..."
                />
              </div>
              <div class="col-why">
                <textarea 
                  :value="idea.whyImportant"
                  @input="updateIdea(idea.id, { whyImportant: $event.target.value })"
                  class="cell-textarea"
                  placeholder="Почему важно..."
                  rows="2"
                ></textarea>
              </div>
              <div class="col-mvp">
                <textarea 
                  :value="idea.mvp"
                  @input="updateIdea(idea.id, { mvp: $event.target.value })"
                  class="cell-textarea"
                  placeholder="MVP если цель большая..."
                  rows="2"
                ></textarea>
              </div>
              <div class="col-decomposition">
                <textarea 
                  :value="idea.decomposition"
                  @input="updateIdea(idea.id, { decomposition: $event.target.value })"
                  class="cell-textarea"
                  placeholder="Шаги декомпозиции..."
                  rows="2"
                ></textarea>
              </div>
              <div class="col-actions">
                <button 
                  class="btn-icon delete"
                  @click="deleteIdea(idea.id)"
                  title="Удалить"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <div class="ideas-count">
            Добавлено идей: <strong>{{ rawIdeas.length }}</strong>
          </div>
          <button 
            class="btn btn-primary btn-lg" 
            @click="nextStep"
            :disabled="!canProceedToStep(2)"
          >
            Перейти к проверке целей →
          </button>
        </div>
      </div>
    </div>

    <!-- Step 2: Проверка целей -->
    <div v-if="currentStep === 2" class="step-content">
      <div class="step-section">
        <header class="section-header">
          <h1>🔍 Проверка целей</h1>
          <p class="subtitle">
            Проверь каждую цель с помощью правила "3 Почему" и отсей ложные цели
          </p>
        </header>

        <div class="filters-block card">
          <h3>⚠️ Убери следующие типы целей:</h3>
          <div class="filter-types">
            <div class="filter-type">
              <span class="filter-icon">🎭</span>
              <div>
                <strong>Социально-приемлемые цели</strong>
                <p>"Чтобы выглядело правильно" перед другими</p>
              </div>
            </div>
            <div class="filter-type">
              <span class="filter-icon">👥</span>
              <div>
                <strong>Чужие цели</strong>
                <p>Взятые у авторитетов или окружения</p>
              </div>
            </div>
            <div class="filter-type">
              <span class="filter-icon">💭</span>
              <div>
                <strong>Суррогаты</strong>
                <p>Цели, не ведущие к реальному результату</p>
              </div>
            </div>
          </div>
        </div>

        <div class="three-whys-instruction card">
          <h3>✅ Правило "3 Почему"</h3>
          <p>Для каждой цели ответь на три вопроса:</p>
          <ol>
            <li><strong>Почему эта цель мне важна?</strong></li>
            <li><strong>Почему именно это даст мне то, что я хочу?</strong></li>
            <li><strong>Почему это действительно про меня?</strong></li>
          </ol>
        </div>

        <div class="validation-list">
          <div 
            v-for="idea in rawIdeas" 
            :key="idea.id"
            class="validation-card card"
            :class="{ validated: idea.status === 'validated', rejected: idea.status === 'rejected' }"
          >
            <div class="validation-header">
              <div class="goal-info">
                <span class="sphere-badge">{{ getSphereName(idea.sphereId) }}</span>
                <h4>{{ idea.text || 'Без названия' }}</h4>
              </div>
              <div class="validation-actions">
                <button 
                  class="btn btn-sm"
                  :class="idea.status === 'validated' ? 'btn-success' : 'btn-secondary'"
                  @click="validateGoal(idea.id, true)"
                >
                  ✅ Истинная
                </button>
                <button 
                  class="btn btn-sm"
                  :class="idea.status === 'rejected' ? 'btn-danger' : 'btn-secondary'"
                  @click="validateGoal(idea.id, false)"
                >
                  ❌ Ложная
                </button>
              </div>
            </div>
            
            <p class="why-important">{{ idea.whyImportant }}</p>

            <div class="three-whys-form">
              <div class="why-field">
                <label>1. Почему эта цель мне важна?</label>
                <textarea 
                  :value="idea.threeWhys?.why1 || ''"
                  @input="updateIdeaWhys(idea.id, 'why1', $event.target.value)"
                  rows="2"
                  placeholder="Напиши свой ответ..."
                ></textarea>
              </div>
              <div class="why-field">
                <label>2. Почему именно это даст мне то, что я хочу?</label>
                <textarea 
                  :value="idea.threeWhys?.why2 || ''"
                  @input="updateIdeaWhys(idea.id, 'why2', $event.target.value)"
                  rows="2"
                  placeholder="Напиши свой ответ..."
                ></textarea>
              </div>
              <div class="why-field">
                <label>3. Почему это действительно про меня?</label>
                <textarea 
                  :value="idea.threeWhys?.why3 || ''"
                  @input="updateIdeaWhys(idea.id, 'why3', $event.target.value)"
                  rows="2"
                  placeholder="Напиши свой ответ..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn btn-secondary" @click="prevStep">
            ← Назад
          </button>
          <div class="validation-stats">
            <span class="stat validated">✅ Истинных: {{ validatedCount }}</span>
            <span class="stat rejected">❌ Ложных: {{ rejectedCount }}</span>
          </div>
          <button 
            class="btn btn-primary btn-lg" 
            @click="nextStep"
            :disabled="!canProceedToStep(3)"
          >
            Перейти к анализу связей →
          </button>
        </div>
      </div>
    </div>

    <!-- Step 3: Осознание взаимосвязей -->
    <div v-if="currentStep === 3" class="step-content">
      <div class="step-section">
        <header class="section-header">
          <h1>🔗 Осознание взаимосвязей</h1>
          <p class="subtitle">
            Каждая сфера влияет на другие. Найди точки роста и "камень, который тянет вниз"
          </p>
        </header>

        <div class="spheres-analysis">
          <div class="spheres-grid">
            <div 
              v-for="sphere in sortedSpheres" 
              :key="sphere.id"
              class="sphere-analysis-card card"
              :class="{ 
                lowest: sphere.id === lowestSphere?.id,
                selected: sphereAnalysis.lowestSphere === sphere.id || sphereAnalysis.leverageSphere === sphere.id
              }"
            >
              <div class="sphere-header">
                <span class="sphere-icon">{{ sphere.icon }}</span>
                <div>
                  <h4>{{ sphere.name }}</h4>
                  <div class="sphere-score">Оценка: {{ sphere.score }}/10</div>
                </div>
              </div>
              <div class="sphere-goals-count">
                Целей: {{ getGoalsCountForSphere(sphere.id) }}
              </div>
              <div class="sphere-actions">
                <button 
                  class="btn btn-sm"
                  :class="sphereAnalysis.lowestSphere === sphere.id ? 'btn-danger' : 'btn-secondary'"
                  @click="setLowestSphere(sphere.id)"
                >
                  ⬇️ Камень
                </button>
                <button 
                  class="btn btn-sm"
                  :class="sphereAnalysis.leverageSphere === sphere.id ? 'btn-success' : 'btn-secondary'"
                  @click="setLeverageSphere(sphere.id)"
                >
                  ⬆️ Рычаг
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="analysis-questions card">
          <h3>📊 Анализ взаимосвязей</h3>
          
          <div class="analysis-field">
            <label>
              <span class="field-icon">⬇️</span>
              Камень, который тянет вниз (сфера с минимальным баллом):
            </label>
            <div v-if="sphereAnalysis.lowestSphere" class="selected-sphere">
              {{ getSphereName(sphereAnalysis.lowestSphere) }}
            </div>
            <p v-else class="hint">Выберите сферу выше</p>
          </div>

          <div class="analysis-field">
            <label>
              <span class="field-icon">⬆️</span>
              Сфера-рычаг (если её улучшить, подтянутся остальные):
            </label>
            <div v-if="sphereAnalysis.leverageSphere" class="selected-sphere">
              {{ getSphereName(sphereAnalysis.leverageSphere) }}
            </div>
            <p v-else class="hint">Выберите сферу выше</p>
          </div>

          <div class="analysis-field">
            <label>
              <span class="field-icon">💭</span>
              Твои мысли о взаимосвязях:
            </label>
            <textarea 
              :value="sphereAnalysis.notes"
              @input="updateAnalysisNotes($event.target.value)"
              rows="4"
              placeholder="Как сферы влияют друг на друга? Какие закономерности ты видишь?"
            ></textarea>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn btn-secondary" @click="prevStep">
            ← Назад
          </button>
          <button 
            class="btn btn-primary btn-lg" 
            @click="nextStep"
            :disabled="!canProceedToStep(4)"
          >
            Сформулировать ключевые цели →
          </button>
        </div>
      </div>
    </div>

    <!-- Step 4: Формулирование реальных целей -->
    <div v-if="currentStep === 4" class="step-content">
      <div class="step-section">
        <header class="section-header">
          <h1>🎯 Формулирование реальных целей</h1>
          <p class="subtitle">
            Переведи "я хочу" в "я делаю". Сформулируй 3–5 ключевых целей.
          </p>
        </header>

        <div class="key-goals-instruction card">
          <h3>✨ Критерии ключевых целей:</h3>
          <ul>
            <li><strong>Реально зажигают</strong> — вызывают энтузиазм</li>
            <li><strong>Взаимосвязаны</strong> — поддерживают друг друга</li>
            <li><strong>Повышают баланс</strong> — улучшают общую картину жизни</li>
          </ul>
        </div>

        <div class="validated-goals-summary card">
          <h3>📋 Ваши истинные цели ({{ validatedGoals.length }})</h3>
          <div class="validated-list">
            <div v-for="goal in validatedGoals" :key="goal.id" class="validated-goal-item">
              <span class="sphere-mini">{{ getSphereName(goal.sphereId) }}</span>
              <span>{{ goal.text }}</span>
            </div>
          </div>
        </div>

        <div class="key-goals-section">
          <h3>🏆 Мои 3-5 ключевых целей</h3>
          
          <div class="add-key-goal">
            <select v-model="newKeyGoal.sphereId" class="form-select">
              <option value="">Сфера</option>
              <option v-for="sphere in lifeSpheres" :key="sphere.id" :value="sphere.id">
                {{ sphere.icon }} {{ sphere.name }}
              </option>
            </select>
            <input 
              v-model="newKeyGoal.text"
              type="text"
              class="form-input"
              placeholder="Я хочу..."
            />
            <input 
              v-model="newKeyGoal.action"
              type="text"
              class="form-input"
              placeholder="Я делаю..."
            />
            <button 
              class="btn btn-primary" 
              @click="addKeyGoalHandler"
              :disabled="keyGoals.length >= 5"
            >
              ➕ Добавить
            </button>
          </div>

          <div class="key-goals-list">
            <div 
              v-for="(goal, index) in keyGoals" 
              :key="goal.id"
              class="key-goal-card card"
            >
              <div class="key-goal-number">{{ index + 1 }}</div>
              <div class="key-goal-content">
                <div class="key-goal-sphere">{{ getSphereName(goal.sphereId) }}</div>
                <div class="key-goal-want">
                  <span class="label">Хочу:</span>
                  {{ goal.text }}
                </div>
                <div class="key-goal-do">
                  <span class="label">Делаю:</span>
                  {{ goal.action }}
                </div>
              </div>
              <button 
                class="btn-icon delete"
                @click="removeKeyGoal(goal.id)"
              >
                🗑️
              </button>
            </div>
          </div>

          <div v-if="keyGoals.length === 0" class="empty-key-goals">
            <p>Добавьте от 3 до 5 ключевых целей</p>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn btn-secondary" @click="prevStep">
            ← Назад
          </button>
          <button 
            class="btn btn-primary btn-lg" 
            @click="completeGoalsBankHandler"
            :disabled="keyGoals.length < 3"
          >
            ✅ Завершить и сохранить
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()

const steps = ['Банк идей', 'Проверка', 'Взаимосвязи', 'Ключевые цели']
const currentStep = computed(() => store.goalsBank.currentStep)

const lifeSpheres = computed(() => store.lifeSpheres)
const rawIdeas = computed(() => store.goalsBank.rawIdeas)
const keyGoals = computed(() => store.goalsBank.keyGoals)
const sphereAnalysis = computed(() => store.goalsBank.sphereAnalysis)

const validatedGoals = computed(() => rawIdeas.value.filter(i => i.status === 'validated'))
const validatedCount = computed(() => validatedGoals.value.length)
const rejectedCount = computed(() => rawIdeas.value.filter(i => i.status === 'rejected').length)

const sortedSpheres = computed(() => {
  return [...lifeSpheres.value].sort((a, b) => a.score - b.score)
})

const lowestSphere = computed(() => {
  if (lifeSpheres.value.length === 0) return null
  return lifeSpheres.value.reduce((min, s) => s.score < min.score ? s : min)
})

const newIdea = ref({
  sphereId: '',
  text: '',
  whyImportant: ''
})

const newKeyGoal = ref({
  sphereId: '',
  text: '',
  action: ''
})

function canProceedToStep(step) {
  if (step === 1) return true
  if (step === 2) return rawIdeas.value.length > 0
  if (step === 3) return rawIdeas.value.length > 0 && validatedCount.value > 0
  if (step === 4) return validatedCount.value > 0 && (sphereAnalysis.value.lowestSphere || sphereAnalysis.value.leverageSphere)
  return false
}

function nextStep() {
  const nextStepNum = currentStep.value + 1
  if (nextStepNum <= 4 && canProceedToStep(nextStepNum)) {
    store.setGoalsBankStep(nextStepNum)
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    store.setGoalsBankStep(currentStep.value - 1)
  }
}

function goToStep(step) {
  if (step < currentStep.value || (step === currentStep.value + 1 && canProceedToStep(step))) {
    store.setGoalsBankStep(step)
  }
}

function addNewIdea() {
  if (!newIdea.value.text.trim()) return
  
  store.addRawIdea({
    text: newIdea.value.text,
    whyImportant: newIdea.value.whyImportant,
    sphereId: newIdea.value.sphereId
  })
  
  newIdea.value = {
    sphereId: newIdea.value.sphereId,
    text: '',
    whyImportant: ''
  }
}

function updateIdea(ideaId, updates) {
  store.updateRawIdea(ideaId, updates)
}

function updateIdeaWhys(ideaId, whyField, value) {
  const idea = rawIdeas.value.find(i => i.id === ideaId)
  if (idea) {
    store.updateRawIdea(ideaId, {
      threeWhys: {
        ...idea.threeWhys,
        [whyField]: value
      }
    })
  }
}

function deleteIdea(ideaId) {
  if (confirm('Удалить эту идею?')) {
    store.deleteRawIdea(ideaId)
  }
}

function validateGoal(ideaId, isValid) {
  store.validateIdea(ideaId, isValid)
}

function setLowestSphere(sphereId) {
  store.updateSphereAnalysis({ lowestSphere: sphereId })
}

function setLeverageSphere(sphereId) {
  store.updateSphereAnalysis({ leverageSphere: sphereId })
}

function updateAnalysisNotes(notes) {
  store.updateSphereAnalysis({ notes })
}

function addKeyGoalHandler() {
  if (!newKeyGoal.value.text.trim()) {
    alert('Введите текст цели')
    return
  }
  if (!newKeyGoal.value.action.trim()) {
    alert('Введите действие (что делаю)')
    return
  }
  if (keyGoals.value.length >= 5) {
    alert('Максимум 5 ключевых целей')
    return
  }
  
  store.addKeyGoal({
    text: newKeyGoal.value.text,
    action: newKeyGoal.value.action,
    sphereId: newKeyGoal.value.sphereId
  })
  
  newKeyGoal.value = {
    sphereId: '',
    text: '',
    action: ''
  }
}

function removeKeyGoal(goalId) {
  store.deleteKeyGoal(goalId)
}

function completeGoalsBankHandler() {
  if (keyGoals.value.length < 3) {
    alert('Добавьте минимум 3 ключевые цели')
    return
  }
  
  const missingActions = keyGoals.value.filter(g => !g.action || !g.action.trim())
  if (missingActions.length > 0) {
    alert('Все цели должны иметь действие (Я делаю...)')
    return
  }
  
  store.completeGoalsBank()
  alert('🎉 Поздравляем! Банк целей сформирован!')
}

function getSphereName(sphereId) {
  const sphere = lifeSpheres.value.find(s => s.id === sphereId)
  return sphere ? `${sphere.icon} ${sphere.name}` : 'Не указана'
}

function getGoalsCountForSphere(sphereId) {
  return rawIdeas.value.filter(i => i.sphereId === sphereId).length
}

function getStatusLabel(status) {
  const labels = {
    raw: '📝',
    validated: '✅',
    rejected: '❌'
  }
  return labels[status] || '📝'
}
</script>

<style scoped>
.goals-bank-container {
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

.progress-step::after {
  content: '';
  position: absolute;
  top: 20px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--border-color);
  z-index: 0;
}

.progress-step:last-child::after {
  display: none;
}

.progress-step.completed::after {
  background: var(--primary-color);
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  z-index: 1;
  transition: all 0.3s ease;
}

.progress-step.active .step-number {
  background: var(--primary-color);
  color: white;
}

.progress-step.completed .step-number {
  background: var(--success-color);
  color: white;
}

.step-label {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
}

.section-header {
  margin-bottom: 2rem;
  text-align: center;
}

.section-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
  max-width: 700px;
  margin: 0 auto;
}

.instruction-card {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.instruction-icon {
  font-size: 2.5rem;
}

.instruction-card h3 {
  margin-bottom: 0.75rem;
}

.instruction-card ul {
  margin: 0;
  padding-left: 1.5rem;
  line-height: 1.8;
}

.goals-table-container {
  margin-bottom: 2rem;
}

.table-title {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
}

.add-idea-section {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.sphere-select {
  min-width: 180px;
}

.add-idea-section .form-input {
  flex: 1;
  min-width: 200px;
}

.goals-table {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 140px 1fr 1fr 150px 150px 80px;
  gap: 0.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 140px 1fr 1fr 150px 150px 80px;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  align-items: center;
  transition: all 0.2s ease;
}

.table-row:hover {
  background: var(--bg-tertiary);
}

.table-row.validated {
  background: rgba(16, 185, 129, 0.05);
}

.table-row.rejected {
  background: rgba(239, 68, 68, 0.05);
  opacity: 0.7;
}

.empty-table {
  padding: 3rem;
  text-align: center;
  color: var(--text-secondary);
}

.cell-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.cell-input:focus {
  outline: none;
  border-color: var(--primary-color);
  background: var(--bg-primary);
}

.cell-textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: 0.8rem;
  font-family: inherit;
  resize: vertical;
  min-height: 50px;
  transition: all 0.2s ease;
}

.cell-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  background: var(--bg-primary);
}

.status-badge {
  font-size: 1.25rem;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.ideas-count {
  font-size: 1rem;
  color: var(--text-secondary);
}

.filters-block {
  margin-bottom: 2rem;
}

.filters-block h3 {
  margin-bottom: 1rem;
  color: var(--warning-color);
}

.filter-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.filter-type {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.filter-icon {
  font-size: 1.5rem;
}

.filter-type p {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.three-whys-instruction {
  margin-bottom: 2rem;
}

.three-whys-instruction h3 {
  margin-bottom: 0.75rem;
  color: var(--success-color);
}

.three-whys-instruction ol {
  margin: 0;
  padding-left: 1.5rem;
  line-height: 2;
}

.validation-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.validation-card {
  transition: all 0.3s ease;
}

.validation-card.validated {
  border-left: 4px solid var(--success-color);
}

.validation-card.rejected {
  border-left: 4px solid var(--danger-color);
  opacity: 0.7;
}

.validation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.goal-info {
  flex: 1;
}

.sphere-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}

.goal-info h4 {
  margin: 0;
  font-size: 1.1rem;
}

.validation-actions {
  display: flex;
  gap: 0.5rem;
}

.why-important {
  color: var(--text-secondary);
  font-style: italic;
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.three-whys-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.why-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
}

.why-field textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  transition: all 0.2s ease;
}

.why-field textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.validation-stats {
  display: flex;
  gap: 1.5rem;
}

.stat {
  font-weight: 500;
}

.stat.validated {
  color: var(--success-color);
}

.stat.rejected {
  color: var(--danger-color);
}

.spheres-analysis {
  margin-bottom: 2rem;
}

.spheres-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.sphere-analysis-card {
  text-align: center;
  transition: all 0.3s ease;
}

.sphere-analysis-card.lowest {
  border: 2px solid var(--danger-color);
}

.sphere-analysis-card.selected {
  transform: scale(1.02);
  box-shadow: var(--shadow-md);
}

.sphere-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.sphere-icon {
  font-size: 2rem;
}

.sphere-header h4 {
  margin: 0;
  font-size: 0.95rem;
  text-align: left;
}

.sphere-score {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.sphere-goals-count {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.sphere-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.analysis-questions {
  margin-bottom: 2rem;
}

.analysis-questions h3 {
  margin-bottom: 1.5rem;
}

.analysis-field {
  margin-bottom: 1.5rem;
}

.analysis-field label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.field-icon {
  font-size: 1.25rem;
}

.selected-sphere {
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  font-weight: 500;
}

.hint {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.analysis-field textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
}

.key-goals-instruction {
  margin-bottom: 2rem;
}

.key-goals-instruction h3 {
  margin-bottom: 1rem;
}

.key-goals-instruction ul {
  margin: 0;
  padding-left: 1.5rem;
  line-height: 2;
}

.validated-goals-summary {
  margin-bottom: 2rem;
}

.validated-goals-summary h3 {
  margin-bottom: 1rem;
}

.validated-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.validated-goal-item {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
}

.sphere-mini {
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.key-goals-section h3 {
  margin-bottom: 1.5rem;
}

.add-key-goal {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.add-key-goal .form-select {
  min-width: 150px;
}

.add-key-goal .form-input {
  flex: 1;
  min-width: 180px;
}

.key-goals-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.key-goal-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.key-goal-number {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  flex-shrink: 0;
}

.key-goal-content {
  flex: 1;
}

.key-goal-sphere {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.key-goal-want,
.key-goal-do {
  margin-bottom: 0.25rem;
}

.key-goal-want .label,
.key-goal-do .label {
  font-weight: 600;
  color: var(--primary-color);
}

.empty-key-goals {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.btn-success {
  background: var(--success-color);
  color: white;
  border-color: var(--success-color);
}

.btn-danger {
  background: var(--danger-color);
  color: white;
  border-color: var(--danger-color);
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
}

.btn-icon.delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

@media (max-width: 1024px) {
  .table-header,
  .table-row {
    grid-template-columns: 60px 120px 1fr 1fr 120px 120px 60px;
  }
}

@media (max-width: 768px) {
  .progress-bar {
    padding: 0;
  }
  
  .step-label {
    font-size: 0.75rem;
  }
  
  .goals-table {
    overflow-x: auto;
  }
  
  .table-header,
  .table-row {
    min-width: 900px;
  }
  
  .add-idea-section {
    flex-direction: column;
  }
  
  .add-idea-section .form-input,
  .sphere-select {
    min-width: 100%;
  }
  
  .step-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .validation-header {
    flex-direction: column;
  }
  
  .filter-types {
    grid-template-columns: 1fr;
  }
}
</style>
