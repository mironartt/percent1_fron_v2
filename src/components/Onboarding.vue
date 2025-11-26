<template>
  <div class="onboarding-overlay">
    <div class="onboarding-container">
<<<<<<< HEAD
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>

      <template v-else>
        <!-- Progress Bar -->
        <div class="progress-section">
          <div class="progress-bar-bg">
            <div 
              class="progress-bar-fill"
              :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
            ></div>
          </div>
          <div class="progress-text">Шаг {{ currentStep }} из {{ totalSteps }}</div>
        </div>

        <!-- Step 1: Philosophy -->
        <div v-if="currentStep === 1" class="step-content step-philosophy">
          <div class="philosophy-icon">🎮</div>
          <h1 class="step-title">Жизнь — это игра.<br>Ты — её разработчик</h1>
=======
      <!-- Progress Bar -->
      <div class="progress-section">
        <div class="progress-bar-bg">
          <div 
            class="progress-bar-fill"
            :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
          ></div>
        </div>
        <div class="progress-text">Шаг {{ currentStep }} из {{ totalSteps }}</div>
      </div>

      <!-- Step 1: Philosophy -->
      <div v-if="currentStep === 1" class="step-content step-philosophy">
        <div class="philosophy-icon">🎮</div>
        <h1 class="step-title">Жизнь — это игра.<br>Ты — её разработчик</h1>
>>>>>>> origin/main
        <div class="philosophy-text">
          <p>
            Система 1% — это не курс и не набор советов. Это твой персональный движок развития, 
            где ты создаёшь правила, выбираешь цели и проходишь уровни.
          </p>
          <p>
            Ты не просто игрок в чужой игре — ты разработчик своего сценария. 
            Каждый день ты делаешь выбор: развиваться или стоять на месте.
          </p>
          <p class="highlight">
            💡 Улучшаясь на 1% каждый день, за год ты станешь сильнее в 38 раз.
          </p>
        </div>

        <div class="key-ideas">
          <div class="key-idea-item">
            <span class="idea-icon">🎯</span>
            <div>
              <strong>Системность, а не мотивация</strong>
              <p>Работает механика, а не эмоции</p>
            </div>
          </div>
          <div class="key-idea-item">
            <span class="idea-icon">📊</span>
            <div>
              <strong>Измеряемый прогресс</strong>
              <p>Видишь рост в цифрах и действиях</p>
            </div>
          </div>
          <div class="key-idea-item">
            <span class="idea-icon">🔄</span>
            <div>
              <strong>Честная работа</strong>
              <p>Без иллюзий, только реальность</p>
            </div>
          </div>
        </div>

<<<<<<< HEAD
        <button 
          class="btn btn-primary btn-large" 
          @click="nextStep"
          :disabled="isSaving"
        >
          {{ step1ButtonText }}
=======
        <button class="btn btn-primary btn-large" @click="nextStep">
          Начать создание своей игры
>>>>>>> origin/main
        </button>
      </div>

      <!-- Step 2: Reflection -->
      <div v-if="currentStep === 2" class="step-content step-reflection">
        <h2 class="step-title">Давай разберёмся, зачем ты здесь</h2>
        <p class="step-subtitle">Честные ответы — основа твоей стратегии</p>

        <div class="form-group">
          <label class="form-label">
            <span class="question-number">1.</span>
            Почему ты пришёл в "Систему 1%"?
          </label>
          <span class="form-hint">Что привело тебя сюда? Какая боль или желание?</span>
          <textarea 
            v-model="formData.whyHere"
            class="form-textarea"
            rows="5"
            placeholder="Например: Устал от хаоса, хочу системности и контроля над жизнью..."
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">
            <span class="question-number">2.</span>
            Что ты хочешь изменить в "сценарии своей игры"?
          </label>
          <span class="form-hint">Какие аспекты жизни требуют трансформации?</span>
          <textarea 
            v-model="formData.whatToChange"
            class="form-textarea"
            rows="5"
            placeholder="Например: Хочу выстроить здоровые отношения, увеличить доход, найти баланс..."
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">
            <span class="question-number">3.</span>
            Что для тебя сейчас зона роста, а что зона комфорта?
          </label>
          <span class="form-hint">Будь честен: где ты растёшь, а где прячешься?</span>
          <textarea 
            v-model="formData.growthVsComfort"
            class="form-textarea"
            rows="5"
            placeholder="Зона роста: публичные выступления, новые проекты...
Зона комфорта: привычная работа, откладывание сложных решений..."
          ></textarea>
        </div>

        <div class="step-actions">
<<<<<<< HEAD
          <button class="btn btn-secondary" @click="prevStep" :disabled="isSaving">Назад</button>
          <button 
            class="btn btn-primary" 
            @click="nextStep"
            :disabled="!isStep2Valid || isSaving"
          >
            {{ isSaving ? 'Сохранение...' : 'Продолжить' }}
=======
          <button class="btn btn-secondary" @click="prevStep">Назад</button>
          <button 
            class="btn btn-primary" 
            @click="nextStep"
            :disabled="!isStep2Valid"
          >
            Продолжить
>>>>>>> origin/main
          </button>
        </div>
      </div>

      <!-- Step 3: My Start -->
      <div v-if="currentStep === 3" class="step-content step-my-start">
        <h2 class="step-title">Твоя точка старта</h2>
        <p class="step-subtitle">Определи, откуда начинаешь и куда идёшь</p>

        <div class="journey-visual">
          <div class="point point-a">
            <span class="point-label">Точка А</span>
            <span class="point-icon">📍</span>
          </div>
          <div class="journey-arrow">→</div>
          <div class="point point-b">
            <span class="point-label">Точка Б</span>
            <span class="point-icon">🎯</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">
            📍 Точка А: Где я сейчас
          </label>
          <span class="form-hint">Опиши своё текущее состояние без прикрас</span>
          <textarea 
            v-model="formData.pointA"
            class="form-textarea"
            rows="4"
            placeholder="Например: Работаю на нелюбимой работе, доход 80к, нет времени на себя, здоровье на 5/10..."
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">
            🎯 Точка Б: Куда хочу прийти
          </label>
          <span class="form-hint">Конкретная картина желаемого будущего</span>
          <textarea 
            v-model="formData.pointB"
            class="form-textarea"
            rows="4"
            placeholder="Например: Работаю на себя, доход 200к+, здоровье 9/10, баланс между работой и жизнью..."
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">
            💎 Почему это важно для меня
          </label>
          <span class="form-hint">В чём глубинный смысл этих изменений?</span>
          <textarea 
            v-model="formData.whyImportant"
            class="form-textarea"
            rows="4"
            placeholder="Например: Хочу чувствовать, что живу свою жизнь, а не чужой сценарий. Важна свобода и самореализация..."
          ></textarea>
        </div>

        <div class="step-actions">
<<<<<<< HEAD
          <button class="btn btn-secondary" @click="prevStep" :disabled="isSaving">Назад</button>
          <button 
            class="btn btn-primary" 
            @click="nextStep"
            :disabled="!isStep3Valid || isSaving"
          >
            {{ isSaving ? 'Сохранение...' : 'Продолжить' }}
=======
          <button class="btn btn-secondary" @click="prevStep">Назад</button>
          <button 
            class="btn btn-primary" 
            @click="nextStep"
            :disabled="!isStep3Valid"
          >
            Продолжить
>>>>>>> origin/main
          </button>
        </div>
      </div>

      <!-- Step 4: Rules -->
      <div v-if="currentStep === 4" class="step-content step-rules">
        <div class="completion-icon">✅</div>
        <h2 class="step-title">Почти готово!</h2>
        <p class="step-subtitle">Осталось подтвердить готовность к честной работе</p>

        <div class="summary-card">
          <h3>Ты заполнил:</h3>
          <div class="summary-items">
            <div class="summary-item">
              <span class="check-icon">✓</span>
              <span>Понял философию системы</span>
            </div>
            <div class="summary-item">
              <span class="check-icon">✓</span>
              <span>Ответил на вопросы рефлексии</span>
            </div>
            <div class="summary-item">
              <span class="check-icon">✓</span>
              <span>Определил точки А и Б</span>
            </div>
          </div>
        </div>

        <div class="rules-section">
          <h3>Принципы Системы 1%</h3>
          <div class="rules-list">
            <div class="rule-item">
              <span class="rule-number">1</span>
              <p>Честность с собой — основа роста. Без иллюзий и самообмана.</p>
            </div>
            <div class="rule-item">
              <span class="rule-number">2</span>
              <p>Системность важнее мотивации. Делаешь +1% каждый день, а не ждёшь вдохновения.</p>
            </div>
            <div class="rule-item">
              <span class="rule-number">3</span>
              <p>Действие, а не потребление контента. Знания без применения — иллюзия.</p>
            </div>
            <div class="rule-item">
              <span class="rule-number">4</span>
              <p>Ответственность за результат. Ты — разработчик своей игры.</p>
            </div>
          </div>
        </div>

        <label class="checkbox-container">
          <input 
            type="checkbox" 
            v-model="formData.acceptRules"
            class="checkbox-input"
          />
          <span class="checkbox-label">
            Принимаю правила Системы 1% и готов к честной, системной работе
          </span>
        </label>

        <div class="step-actions">
<<<<<<< HEAD
          <button class="btn btn-secondary" @click="prevStep" :disabled="isSaving">Назад</button>
          <button 
            class="btn btn-primary btn-large" 
            @click="completeOnboarding"
            :disabled="!formData.acceptRules || isSaving"
          >
            {{ isSaving ? 'Сохранение...' : '🚀 Приступить' }}
          </button>
        </div>
      </div>
      </template>
=======
          <button class="btn btn-secondary" @click="prevStep">Назад</button>
          <button 
            class="btn btn-primary btn-large" 
            @click="completeOnboarding"
            :disabled="!formData.acceptRules"
          >
            🚀 Приступить
          </button>
        </div>
      </div>
>>>>>>> origin/main
    </div>
  </div>
</template>

<script setup>
<<<<<<< HEAD
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import { DEBUG_MODE, SKIP_AUTH_CHECK } from '@/config/settings.js'
=======
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'
>>>>>>> origin/main

const store = useAppStore()

const currentStep = ref(1)
const totalSteps = 4
<<<<<<< HEAD
const isLoading = ref(true)
const isSaving = ref(false)
const isResuming = ref(false)
const lastCompletedStep = ref(0)
=======
>>>>>>> origin/main

const formData = ref({
  whyHere: '',
  whatToChange: '',
  growthVsComfort: '',
  pointA: '',
  pointB: '',
  whyImportant: '',
  acceptRules: false
})

const isStep2Valid = computed(() => {
  return formData.value.whyHere.trim().length > 20 &&
         formData.value.whatToChange.trim().length > 20 &&
         formData.value.growthVsComfort.trim().length > 20
})

const isStep3Valid = computed(() => {
  return formData.value.pointA.trim().length > 20 &&
         formData.value.pointB.trim().length > 20 &&
         formData.value.whyImportant.trim().length > 20
})

<<<<<<< HEAD
const step1ButtonText = computed(() => {
  return isResuming.value ? 'Продолжить создание своей игры' : 'Начать создание своей игры'
})

onMounted(async () => {
  if (DEBUG_MODE) {
    console.log('[Onboarding] Component mounted, loading data...')
  }
  
  if (SKIP_AUTH_CHECK) {
    if (DEBUG_MODE) {
      console.log('[Onboarding] Auth check skipped, using local data only')
    }
    isLoading.value = false
    return
  }
  
  try {
    await store.loadOnboardingFromBackend()
    
    const onboardingData = store.onboarding.data
    const stepCompleted = store.onboarding.stepCompleted || 0
    
    if (DEBUG_MODE) {
      console.log('[Onboarding] Data loaded from backend:', {
        stepCompleted,
        hasData: !!onboardingData.reason_joined
      })
    }
    
    if (stepCompleted > 0) {
      isResuming.value = true
      lastCompletedStep.value = stepCompleted
      
      formData.value.whyHere = onboardingData.reason_joined || ''
      formData.value.whatToChange = onboardingData.desired_changes || ''
      formData.value.growthVsComfort = onboardingData.growth_comfort_zones || ''
      formData.value.pointA = onboardingData.current_state || ''
      formData.value.pointB = onboardingData.goal_state || ''
      formData.value.whyImportant = onboardingData.why_important || ''
      
      if (DEBUG_MODE) {
        console.log('[Onboarding] Resuming from step:', stepCompleted + 1)
      }
    }
  } catch (error) {
    if (DEBUG_MODE) {
      console.error('[Onboarding] Failed to load data:', error)
    }
  } finally {
    isLoading.value = false
  }
})

async function nextStep() {
  if (currentStep.value < totalSteps) {
    isSaving.value = true
    
    let dataToSave = { step_completed: currentStep.value }
    
    if (currentStep.value === 2) {
      dataToSave.reason_joined = formData.value.whyHere
      dataToSave.desired_changes = formData.value.whatToChange
      dataToSave.growth_comfort_zones = formData.value.growthVsComfort
    } else if (currentStep.value === 3) {
      dataToSave.current_state = formData.value.pointA
      dataToSave.goal_state = formData.value.pointB
      dataToSave.why_important = formData.value.whyImportant
    }
    
    if (!SKIP_AUTH_CHECK) {
      const saved = await store.saveOnboardingToBackend(dataToSave)
      
      if (DEBUG_MODE) {
        console.log('[Onboarding] Step saved:', { step: currentStep.value, saved })
      }
    } else if (DEBUG_MODE) {
      console.log('[Onboarding] Step save skipped (SKIP_AUTH_CHECK=true):', dataToSave)
    }
    
    isSaving.value = false
    
    if (isResuming.value && currentStep.value === 1) {
      currentStep.value = lastCompletedStep.value + 1
      isResuming.value = false
    } else {
      currentStep.value++
    }
=======
function nextStep() {
  if (currentStep.value < totalSteps) {
    currentStep.value++
>>>>>>> origin/main
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

async function completeOnboarding() {
  if (!formData.value.acceptRules) return
<<<<<<< HEAD
  
  isSaving.value = true
  
  const backendData = {
    reason_joined: formData.value.whyHere,
    desired_changes: formData.value.whatToChange,
    growth_comfort_zones: formData.value.growthVsComfort,
    current_state: formData.value.pointA,
    goal_state: formData.value.pointB,
    why_important: formData.value.whyImportant,
    step_completed: 4,
    is_complete: true
  }
  
  if (!SKIP_AUTH_CHECK) {
    const saved = await store.completeOnboardingWithBackend(backendData)
    
    if (DEBUG_MODE) {
      console.log('[Onboarding] Completion saved to backend:', saved)
    }
  } else if (DEBUG_MODE) {
    console.log('[Onboarding] Completion save skipped (SKIP_AUTH_CHECK=true):', backendData)
  }
  
  const localData = {
=======

  // Сохраняем данные онбординга
  const onboardingData = {
>>>>>>> origin/main
    whyHere: formData.value.whyHere,
    whatToChange: formData.value.whatToChange,
    growthVsComfort: formData.value.growthVsComfort,
    pointA: formData.value.pointA,
    pointB: formData.value.pointB,
    whyImportant: formData.value.whyImportant,
    acceptRules: formData.value.acceptRules,
    completedAt: new Date().toISOString()
  }
<<<<<<< HEAD
  
  store.completeOnboarding(localData)
  
  isSaving.value = false
  
  if (DEBUG_MODE) {
    console.log('[Onboarding] Completed successfully')
  }
=======

  // Сохраняем в store
  store.completeOnboarding(onboardingData)

  // В будущем здесь будет отправка на backend:
  // await api.post('/onboarding', onboardingData)
  
  // После сохранения компонент автоматически скроется
  // и покажется Dashboard, т.к. isOnboardingCompleted станет true
>>>>>>> origin/main
}
</script>

<style scoped>
.onboarding-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-secondary);
  z-index: 1000;
  overflow-y: auto;
}

.onboarding-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

<<<<<<< HEAD
/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 1rem;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p {
  color: var(--text-secondary);
  font-size: 1.125rem;
}

=======
>>>>>>> origin/main
/* Progress Bar */
.progress-section {
  margin-bottom: 3rem;
}

.progress-bar-bg {
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transition: width 0.5s ease;
}

.progress-text {
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Step Content */
.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.step-subtitle {
  text-align: center;
  color: var(--text-secondary);
  font-size: 1.125rem;
  margin-bottom: 2rem;
}

/* Step 1: Philosophy */
.step-philosophy {
  align-items: center;
  text-align: center;
}

.philosophy-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.philosophy-text {
  max-width: 600px;
  margin: 0 auto 2rem;
  text-align: left;
}

.philosophy-text p {
  margin-bottom: 1rem;
  line-height: 1.7;
  color: var(--text-primary);
  font-size: 1.0625rem;
}

.philosophy-text .highlight {
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  border-left: 4px solid var(--primary-color);
  border-radius: 0.5rem;
  font-weight: 500;
  color: var(--primary-color);
}

.key-ideas {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
  max-width: 600px;
  width: 100%;
}

.key-idea-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--bg-primary);
  border-radius: 0.75rem;
  border: 1px solid var(--border-color);
  text-align: left;
  transition: transform 0.2s;
}

.key-idea-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.idea-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.key-idea-item strong {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.key-idea-item p {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

/* Step 2 & 3: Forms */
.form-group {
  margin-bottom: 2rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.question-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  font-size: 1rem;
  font-weight: 700;
}

.form-hint {
  display: block;
  margin-bottom: 0.75rem;
  font-size: 0.9375rem;
  color: var(--text-secondary);
  font-style: italic;
}

.form-textarea {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 0.75rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
  transition: all 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-textarea::placeholder {
  color: var(--text-tertiary);
}

/* Step 3: Journey Visual */
.journey-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;
  padding: 2rem;
  background: var(--bg-primary);
  border-radius: 1rem;
  border: 2px dashed var(--border-color);
}

.point {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.point-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.point-icon {
  font-size: 3rem;
}

.journey-arrow {
  font-size: 2rem;
  color: var(--primary-color);
  font-weight: 700;
}

/* Step 4: Completion */
.completion-icon {
  font-size: 5rem;
  text-align: center;
  margin-bottom: 1rem;
}

.summary-card {
  background: var(--bg-primary);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
}

.summary-card h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
}

.check-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--success-color);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.875rem;
}

.rules-section {
  margin-bottom: 2rem;
}

.rules-section h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rule-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 0.75rem;
  border: 1px solid var(--border-color);
}

.rule-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border-radius: 50%;
  font-weight: 700;
  flex-shrink: 0;
}

.rule-item p {
  margin: 0;
  line-height: 1.6;
}

.checkbox-container {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(99, 102, 241, 0.05);
  border: 2px solid var(--primary-color);
  border-radius: 0.75rem;
  cursor: pointer;
  margin-bottom: 2rem;
  transition: all 0.2s;
}

.checkbox-container:hover {
  background: rgba(99, 102, 241, 0.1);
}

.checkbox-input {
  width: 24px;
  height: 24px;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.checkbox-label {
  font-size: 1.0625rem;
  font-weight: 500;
  line-height: 1.6;
}

/* Buttons */
.step-actions {
  display: flex;
  gap: 1rem;
  margin-top: auto;
  padding-top: 2rem;
}

.btn {
  flex: 1;
  padding: 1rem 2rem;
  font-size: 1.0625rem;
  font-weight: 600;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
}

.btn-secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
}

.btn-large {
  font-size: 1.125rem;
  padding: 1.25rem 2.5rem;
}

@media (max-width: 768px) {
  .onboarding-container {
    padding: 1rem;
  }

  .step-title {
    font-size: 1.5rem;
  }

  .journey-visual {
    flex-direction: column;
    gap: 1rem;
  }

  .journey-arrow {
    transform: rotate(90deg);
  }

  .step-actions {
    flex-direction: column;
  }

  .key-ideas {
    gap: 0.75rem;
  }
}
</style>
