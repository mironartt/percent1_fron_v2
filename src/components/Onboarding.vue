<template>
  <div class="onboarding-overlay">
    <div class="onboarding-container">
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
          <div class="philosophy-icon">
            <span class="icon-wrapper icon-wrapper-lg primary">
              <Gamepad2 :size="48" />
            </span>
          </div>
          <h1 class="step-title">Жизнь — это игра.<br>Ты — её разработчик</h1>
          <div class="philosophy-text">
            <p>
              Система 1% — твой персональный движок развития. 
              Каждый день ты делаешь выбор: расти или стоять на месте.
            </p>
            <div class="highlight">
              <span class="icon-wrapper icon-wrapper-sm accent">
                <Lightbulb :size="16" />
              </span>
              <p>+1% каждый день = в 38 раз сильнее за год</p>
            </div>
          </div>

          <div class="key-ideas">
            <div class="key-idea-item">
              <span class="icon-wrapper icon-wrapper-md target">
                <Target :size="24" />
              </span>
              <div>
                <strong>Системность, а не мотивация</strong>
                <p>Работает механика, а не эмоции</p>
              </div>
            </div>
            <div class="key-idea-item">
              <span class="icon-wrapper icon-wrapper-md chart">
                <BarChart3 :size="24" />
              </span>
              <div>
                <strong>Измеряемый прогресс</strong>
                <p>Видишь рост в цифрах</p>
              </div>
            </div>
            <div class="key-idea-item">
              <span class="icon-wrapper icon-wrapper-md refresh">
                <RefreshCcw :size="24" />
              </span>
              <div>
                <strong>Честная работа</strong>
                <p>Без иллюзий, только реальность</p>
              </div>
            </div>
          </div>

          <button 
            class="btn btn-primary" 
            @click="nextStep"
            :disabled="isSaving"
          >
            {{ step1ButtonText }}
          </button>
        </div>

        <!-- Step 2: Points A & B -->
        <div v-if="currentStep === 2" class="step-content step-my-start">
          <h2 class="step-title">Твоя точка старта</h2>
          <p class="step-subtitle">Откуда начинаешь и куда идёшь (можно заполнить позже)</p>

          <div class="journey-visual">
            <div class="point point-a">
              <span class="point-label">Точка А</span>
              <span class="icon-wrapper icon-wrapper-md map-pin">
                <MapPin :size="24" />
              </span>
            </div>
            <div class="journey-arrow">
              <span class="arrow-line"></span>
            </div>
            <div class="point point-b">
              <span class="point-label">Точка Б</span>
              <span class="icon-wrapper icon-wrapper-md target">
                <Target :size="24" />
              </span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="icon-wrapper icon-wrapper-xs map-pin">
                <MapPin :size="14" />
              </span>
              Где я сейчас
            </label>
            <textarea 
              v-model="formData.pointA"
              class="form-textarea"
              rows="3"
              placeholder="Работа, доход, здоровье, отношения..."
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="icon-wrapper icon-wrapper-xs target">
                <Target :size="14" />
              </span>
              Куда хочу прийти
            </label>
            <textarea 
              v-model="formData.pointB"
              class="form-textarea"
              rows="3"
              placeholder="Моё желаемое будущее через год..."
            ></textarea>
          </div>

          <div class="step-actions">
            <button class="btn btn-secondary" @click="prevStep" :disabled="isSaving">Назад</button>
            <button class="btn btn-ghost" @click="skipStep" :disabled="isSaving">Пропустить</button>
            <button 
              class="btn btn-primary" 
              @click="nextStep"
              :disabled="isSaving"
            >
              {{ isSaving ? 'Сохранение...' : 'Продолжить' }}
            </button>
          </div>
        </div>

        <!-- Step 3: Rules -->
        <div v-if="currentStep === 3" class="step-content step-rules">
          <div class="completion-icon">
            <span class="icon-wrapper icon-wrapper-lg success">
              <CheckCircle2 :size="48" />
            </span>
          </div>
          <h2 class="step-title">Почти готово!</h2>
          <p class="step-subtitle">Осталось подтвердить готовность к честной работе</p>

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
            <button class="btn btn-secondary" @click="prevStep" :disabled="isSaving">Назад</button>
            <button 
              class="btn btn-primary btn-large btn-with-icon" 
              @click="completeOnboarding"
              :disabled="!formData.acceptRules || isSaving"
            >
              <Rocket :size="18" />
              {{ isSaving ? 'Сохранение...' : 'Приступить' }}
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import { DEBUG_MODE, SKIP_AUTH_CHECK } from '@/config/settings.js'
import { 
  Gamepad2, Target, BarChart3, RefreshCcw, MapPin, 
  CheckCircle2, Check, Rocket, Lightbulb
} from 'lucide-vue-next'

const store = useAppStore()

const currentStep = ref(1)
const totalSteps = 3
const isLoading = ref(true)
const isSaving = ref(false)
const isResuming = ref(false)
const lastCompletedStep = ref(0)

const formData = ref({
  pointA: '',
  pointB: '',
  acceptRules: false
})

const isStep2Valid = computed(() => {
  return true
})

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
      lastCompletedStep.value = Math.min(stepCompleted, totalSteps - 1)
      
      formData.value.pointA = onboardingData.current_state || ''
      formData.value.pointB = onboardingData.goal_state || ''
      
      if (DEBUG_MODE) {
        console.log('[Onboarding] Resuming from step:', lastCompletedStep.value + 1)
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
      dataToSave.current_state = formData.value.pointA
      dataToSave.goal_state = formData.value.pointB
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
      currentStep.value = Math.min(lastCompletedStep.value + 1, totalSteps)
      isResuming.value = false
    } else {
      currentStep.value++
    }
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function skipStep() {
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

async function completeOnboarding() {
  if (!formData.value.acceptRules) return
  
  isSaving.value = true
  
  const backendData = {
    current_state: formData.value.pointA,
    goal_state: formData.value.pointB,
    step_completed: 3,
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
    pointA: formData.value.pointA,
    pointB: formData.value.pointB,
    acceptRules: formData.value.acceptRules,
    completedAt: new Date().toISOString()
  }
  
  store.completeOnboarding(localData)
  
  isSaving.value = false
  
  if (DEBUG_MODE) {
    console.log('[Onboarding] Completed successfully')
  }
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
  margin-bottom: 1.5rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Icon Wrappers */
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.icon-wrapper-xs {
  width: 20px;
  height: 20px;
}

.icon-wrapper-sm {
  width: 28px;
  height: 28px;
}

.icon-wrapper-md {
  width: 48px;
  height: 48px;
}

.icon-wrapper-lg {
  width: 96px;
  height: 96px;
}

.icon-wrapper.primary {
  background: rgba(99, 102, 241, 0.15);
  color: #6366f1;
}

.icon-wrapper.accent {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.icon-wrapper.target {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.icon-wrapper.chart {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.icon-wrapper.refresh {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.icon-wrapper.map-pin {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.icon-wrapper.gem {
  background: rgba(168, 85, 247, 0.15);
  color: #a855f7;
}

.icon-wrapper.success {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
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
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  border-left: 4px solid var(--primary-color);
  border-radius: 0.5rem;
}

.philosophy-text .highlight p {
  margin: 0;
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

.journey-arrow {
  display: flex;
  align-items: center;
  padding: 0 1rem;
}

.arrow-line {
  display: block;
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  position: relative;
}

.arrow-line::after {
  content: '';
  position: absolute;
  right: -2px;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-left: 8px solid var(--secondary-color);
}

/* Step 4: Completion */
.completion-icon {
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

.summary-item .icon-wrapper {
  flex-shrink: 0;
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
  padding: 1rem 2rem;
  font-size: 1.0625rem;
  font-weight: 600;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.step-actions .btn {
  flex: 1;
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

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-tertiary);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: none;
}

.btn-ghost:hover:not(:disabled) {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.btn-large {
  font-size: 1.125rem;
  padding: 1.25rem 2.5rem;
}

.btn-with-icon {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
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
    padding: 0.5rem 0;
  }
  
  .arrow-line {
    width: 40px;
  }

  .step-actions {
    flex-direction: column;
  }

  .key-ideas {
    gap: 0.75rem;
  }
}
</style>
