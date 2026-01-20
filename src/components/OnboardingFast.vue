<template>
  <div class="onboarding-overlay">
    <div class="onboarding-container" :class="{ 'wide': currentStep >= 2 }">
      <!-- Progress Bar -->
      <div class="progress-section">
        <div class="progress-steps">
          <div
            v-for="(label, index) in stepLabels"
            :key="index"
            class="progress-step-wrapper"
          >
            <div
              class="progress-step"
              :class="{
                active: currentStep === index + 1,
                completed: currentStep > index + 1
              }"
            >
              <span class="step-number">{{ index + 1 }}</span>
            </div>
            <span
              class="progress-label"
              :class="{ active: currentStep === index + 1 }"
            >{{ label }}</span>
          </div>
        </div>
      </div>

      <!-- Step 1: Welcome + Category Selection -->
      <div v-if="currentStep === 1" class="step-content step-welcome">
        <div class="welcome-icon">
          <span class="icon-wrapper icon-wrapper-lg primary">
            <span class="one-percent-text">1%</span>
          </span>
        </div>
        <h1 class="step-title">Добро пожаловать в OnePercent</h1>
        <p class="step-subtitle">Выберите сферу для быстрого старта</p>

        <div class="category-selection">
          <button
            v-for="category in categories"
            :key="category.id"
            class="category-card"
            :class="{ selected: selectedCategory === category.id }"
            @click="selectedCategory = category.id"
          >
            <div class="category-icon" :style="{ background: category.color }">
              <component :is="category.icon" :size="24" />
            </div>
            <div class="category-info">
              <h3>{{ category.name }}</h3>
              <p>{{ category.description }}</p>
            </div>
          </button>
        </div>

        <button
          class="btn btn-primary btn-lg"
          @click="nextStep"
          :disabled="!selectedCategory"
        >
          Продолжить
          <ArrowRight :size="18" />
        </button>
      </div>

      <!-- Step 2: Quick Goal Creation -->
      <div v-if="currentStep === 2" class="step-content step-goal">
        <h2 class="step-title">Опишите свою цель</h2>
        <p class="step-subtitle">{{ getCategoryName(selectedCategory) }}: что хотите улучшить?</p>

        <div class="goal-form">
          <div class="form-group">
            <label>Цель</label>
            <input
              v-model="goalData.title"
              type="text"
              class="form-input"
              placeholder="Например: Научиться программировать"
              @keyup.enter="nextStep"
            />
            <span class="form-hint">Краткое название цели (до 100 символов)</span>
          </div>

          <div class="form-group">
            <label>Описание (опционально)</label>
            <textarea
              v-model="goalData.description"
              class="form-textarea"
              rows="3"
              placeholder="Детали: почему это важно, что планируете делать..."
            ></textarea>
          </div>

          <!-- AI Suggestions (если цель введена) -->
          <div v-if="goalData.title.length > 10" class="ai-suggestions">
            <div class="ai-label">
              <Bot :size="16" />
              AI предлагает шаги:
            </div>
            <div class="suggested-steps">
              <div
                v-for="(step, index) in suggestedSteps"
                :key="index"
                class="suggested-step"
              >
                <Check :size="14" class="check-icon" />
                <span>{{ step }}</span>
              </div>
            </div>
            <span class="form-hint">Эти шаги можно будет отредактировать</span>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn btn-secondary" @click="prevStep">
            <ArrowLeft :size="18" />
            Назад
          </button>
          <button
            class="btn btn-primary"
            @click="nextStep"
            :disabled="!isGoalValid"
          >
            Создать цель
            <ArrowRight :size="18" />
          </button>
        </div>
      </div>

      <!-- Step 3: Completion -->
      <div v-if="currentStep === 3" class="step-content step-complete">
        <div class="success-icon">
          <div class="icon-wrapper icon-wrapper-lg success">
            <Check :size="48" />
          </div>
        </div>
        <h2 class="step-title">Отличный старт!</h2>
        <p class="step-subtitle">Ваша первая цель создана и готова к выполнению</p>

        <div class="completion-summary">
          <div class="summary-card">
            <div class="summary-icon">
              <Target :size="24" />
            </div>
            <div class="summary-info">
              <h4>Цель добавлена</h4>
              <p>{{ goalData.title }}</p>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-icon">
              <ListTodo :size="24" />
            </div>
            <div class="summary-info">
              <h4>Шаги готовы</h4>
              <p>{{ suggestedSteps.length }} действий для достижения</p>
            </div>
          </div>
        </div>

        <div class="next-steps-info">
          <h3>Что дальше?</h3>
          <ul>
            <li>Перейдите в раздел "Цели" чтобы детализировать шаги</li>
            <li>Используйте "Планирование" для распределения задач по дням</li>
            <li>Заполняйте "Дневник" каждый вечер для рефлексии</li>
          </ul>
        </div>

        <button
          class="btn btn-primary btn-lg"
          @click="finishOnboarding"
          :disabled="isSaving"
        >
          <span v-if="!isSaving">Начать работу</span>
          <span v-else>Сохранение...</span>
          <ArrowRight v-if="!isSaving" :size="18" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * OnboardingFast.vue - Быстрый вариант онбординга (A/B Test)
 *
 * Копировать в: src/components/OnboardingFast.vue
 *
 * Характеристики:
 * - 3 шага
 * - 2-3 минуты
 * - Фокус на быстром старте
 * - Минимум полей
 * - AI генерирует шаги автоматически
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useABTestStore } from '@/stores/abtest'
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Target,
  ListTodo,
  Bot,
  Heart,
  Wallet,
  Users,
  Briefcase,
  Dumbbell,
  Palette
} from 'lucide-vue-next'

const router = useRouter()
const store = useAppStore()
const abStore = useABTestStore()

// State
const currentStep = ref(1)
const selectedCategory = ref(null)
const goalData = ref({
  title: '',
  description: ''
})
const isSaving = ref(false)
const stepStartTime = ref(Date.now())

// Step labels
const stepLabels = ['Выбор', 'Цель', 'Готово']

// Categories (6 life spheres) - синхронизировано с ССП
const categories = [
  {
    id: 'health',
    name: 'Здоровье и спорт',
    description: 'Физическая форма, питание, энергия',
    color: '#ef4444',
    icon: Dumbbell
  },
  {
    id: 'career',
    name: 'Работа и карьера',
    description: 'Профессия, развитие, достижения',
    color: '#3b82f6',
    icon: Briefcase
  },
  {
    id: 'wealth',
    name: 'Благосостояние',
    description: 'Финансы, сбережения, стабильность',
    color: '#10b981',
    icon: Wallet
  },
  {
    id: 'love',
    name: 'Любовь, семья, отношения',
    description: 'Партнёр, близкие, гармония',
    color: '#ec4899',
    icon: Heart
  },
  {
    id: 'friendship',
    name: 'Дружба и окружение',
    description: 'Друзья, социальные связи, нетворкинг',
    color: '#8b5cf6',
    icon: Users
  },
  {
    id: 'hobbies',
    name: 'Хобби и отдых',
    description: 'Увлечения, творчество, путешествия',
    color: '#f59e0b',
    icon: Palette
  }
]

// Computed
const getCategoryName = (id) => {
  return categories.find(c => c.id === id)?.name || ''
}

const isGoalValid = computed(() => {
  return goalData.value.title.length >= 3
})

// AI Suggested Steps (mock - в реальности вызов AI)
const suggestedSteps = computed(() => {
  if (!goalData.value.title || goalData.value.title.length < 10) {
    return []
  }

  // Простая эвристика на основе категории
  const category = selectedCategory.value
  const baseSteps = {
    health: [
      'Выбрать вид физической активности',
      'Составить недельный план тренировок',
      'Начать с 3 тренировок в неделю',
      'Отслеживать прогресс'
    ],
    career: [
      'Определить навыки для роста',
      'Найти курсы или материалы',
      'Выделить 5 часов в неделю на обучение',
      'Применить знания на практике'
    ],
    wealth: [
      'Проанализировать текущие расходы',
      'Составить бюджет на месяц',
      'Настроить автоматические переводы в накопления',
      'Изучить основы инвестирования'
    ],
    love: [
      'Проводить качественное время вместе',
      'Запланировать свидание раз в неделю',
      'Обсудить общие цели',
      'Проявлять заботу каждый день'
    ],
    friendship: [
      'Составить список близких людей',
      'Назначить встречи с 3 друзьями',
      'Вступить в сообщество по интересам',
      'Поддерживать связь регулярно'
    ],
    hobbies: [
      'Выделить 3 часа в неделю на хобби',
      'Изучить основы интересующей темы',
      'Присоединиться к сообществу',
      'Создать первый проект'
    ]
  }

  return baseSteps[category] || [
    'Изучить тему подробнее',
    'Составить план действий',
    'Начать с малого',
    'Отслеживать прогресс'
  ]
})

// Methods
const nextStep = () => {
  // Track step completion
  const timeSpent = Date.now() - stepStartTime.value
  abStore.trackStepCompleted(currentStep.value, timeSpent, {
    category: selectedCategory.value,
    goal_title: goalData.value.title
  })

  currentStep.value++
  stepStartTime.value = Date.now()
}

const prevStep = () => {
  currentStep.value--
  stepStartTime.value = Date.now()
}

const finishOnboarding = async () => {
  isSaving.value = true

  try {
    // 1. Создать цель на бэкенде
    const newGoal = {
      title: goalData.value.title,
      text: goalData.value.title,
      sphereId: selectedCategory.value,
      whyImportant: goalData.value.description,
      status: 'validated',
      workStatus: 'work'
    }

    const result = await store.createGoalOnBackend(newGoal)
    
    if (result.success) {
      store.addGoal({
        ...newGoal,
        backendId: result.goalId
      })
    }

    // 2. Завершить онбординг на бэкенде
    await store.completeOnboardingWithBackend({})
    store.setUserFinishOnboarding(true)

    // 3. Track completion
    const totalTime = Date.now() - abStore.startTime
    await abStore.trackOnboardingCompleted(totalTime)

    // 4. Redirect to app
    router.push('/app')
  } catch (error) {
    console.error('Failed to complete onboarding:', error)
    isSaving.value = false
  }
}

// Track abandonment on unmount
onUnmounted(() => {
  if (currentStep.value < 3) {
    const timeSpent = Date.now() - stepStartTime.value
    abStore.trackOnboardingAbandoned(currentStep.value, timeSpent)
  }
})

// Track page visibility (если пользователь переключил вкладку)
const handleVisibilityChange = () => {
  if (document.hidden && currentStep.value < 3) {
    const timeSpent = Date.now() - stepStartTime.value
    abStore.trackOnboardingAbandoned(currentStep.value, timeSpent)
  }
}

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped>
/*
 * Стили для OnboardingFast
 * Базируются на существующих стилях OnboardingAI.vue
 * Копировать стили из основного файла или использовать глобальные классы
 */

.onboarding-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 2rem;
}

.onboarding-container {
  background: white;
  border-radius: 1rem;
  padding: 2.5rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  transition: max-width 0.3s ease;
}

.onboarding-container.wide {
  max-width: 800px;
}

/* Progress Steps */
.progress-section {
  margin-bottom: 2.5rem;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
}

.progress-step-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  position: relative;
}

.progress-step {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #9ca3af;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.progress-step.active {
  background: #667eea;
  color: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
}

.progress-step.completed {
  background: #10b981;
  color: white;
}

.progress-label {
  font-size: 0.875rem;
  color: #9ca3af;
  text-align: center;
  transition: color 0.3s ease;
}

.progress-label.active {
  color: #1f2937;
  font-weight: 500;
}

/* Step Content */
.step-content {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-icon {
  text-align: center;
  margin-bottom: 1.5rem;
}

.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.icon-wrapper-lg {
  width: 5rem;
  height: 5rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.icon-wrapper.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.icon-wrapper.success {
  background: #10b981;
  color: white;
}

.one-percent-text {
  font-family: 'Inter', system-ui, sans-serif;
}

.step-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
  text-align: center;
}

.step-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  text-align: center;
  margin-bottom: 2rem;
}

/* Category Selection */
.category-selection {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.category-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.category-card:hover {
  border-color: #667eea;
  background: #f9fafb;
}

.category-card.selected {
  border-color: #667eea;
  background: #eef2ff;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.category-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.category-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.category-info p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Goal Form */
.goal-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-hint {
  display: block;
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}

/* AI Suggestions */
.ai-suggestions {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 0.5rem;
}

.ai-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #0284c7;
  margin-bottom: 0.75rem;
}

.suggested-steps {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.suggested-step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}

.check-icon {
  color: #10b981;
  flex-shrink: 0;
}

/* Completion Summary */
.completion-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
}

.summary-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.summary-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.summary-info p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Next Steps Info */
.next-steps-info {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.next-steps-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #166534;
  margin-bottom: 1rem;
}

.next-steps-info ul {
  margin: 0;
  padding-left: 1.5rem;
}

.next-steps-info li {
  color: #15803d;
  margin-bottom: 0.5rem;
}

/* Actions */
.step-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  width: 100%;
}

.success-icon {
  text-align: center;
  margin-bottom: 1.5rem;
}

/* ==================== MOBILE STYLES ==================== */
@media (max-width: 768px) {
  .onboarding-overlay {
    padding: 0;
    align-items: flex-start;
  }

  .onboarding-container {
    border-radius: 0;
    padding: 1.25rem;
    max-height: 100vh;
    min-height: 100vh;
    max-width: 100%;
  }

  .onboarding-container.wide {
    max-width: 100%;
  }

  .progress-section {
    margin-bottom: 1.5rem;
  }

  .progress-step {
    width: 2rem;
    height: 2rem;
    font-size: 0.875rem;
  }

  .progress-label {
    font-size: 0.75rem;
  }

  .step-title {
    font-size: 1.5rem;
    margin-bottom: 0.375rem;
  }

  .step-subtitle {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }

  .icon-wrapper-lg {
    width: 4rem;
    height: 4rem;
    font-size: 1.25rem;
  }

  /* Category cards - mobile optimized */
  .category-selection {
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .category-card {
    padding: 0.875rem;
    gap: 0.75rem;
  }

  .category-icon {
    width: 2.5rem;
    height: 2.5rem;
  }

  .category-info h3 {
    font-size: 1rem;
  }

  .category-info p {
    font-size: 0.8rem;
  }

  /* Form - mobile optimized */
  .form-group {
    margin-bottom: 1rem;
  }

  .form-input,
  .form-textarea {
    padding: 0.75rem;
    font-size: 16px; /* Prevents zoom on iOS */
  }

  .form-textarea {
    min-height: 80px;
  }

  /* AI suggestions - mobile */
  .ai-suggestions {
    padding: 0.875rem;
  }

  .suggested-step {
    padding: 0.5rem 0;
    font-size: 0.8rem;
  }

  /* Completion summary - mobile */
  .completion-summary {
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .summary-card {
    padding: 0.875rem;
    gap: 0.75rem;
  }

  .summary-icon {
    width: 2.5rem;
    height: 2.5rem;
  }

  .summary-info h4 {
    font-size: 0.9rem;
  }

  .summary-info p {
    font-size: 0.8rem;
  }

  /* Next steps - mobile */
  .next-steps-info {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .next-steps-info h3 {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }

  .next-steps-info li {
    font-size: 0.875rem;
    margin-bottom: 0.375rem;
  }

  /* Buttons - mobile */
  .btn {
    padding: 0.875rem 1.25rem;
    font-size: 1rem;
  }

  .btn-lg {
    padding: 1rem 1.5rem;
  }

  .step-actions {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }

  .step-actions .btn-secondary {
    width: 100%;
  }

  .step-actions .btn-primary {
    width: 100%;
  }
}

/* Extra small screens */
@media (max-width: 375px) {
  .onboarding-container {
    padding: 1rem;
  }

  .step-title {
    font-size: 1.25rem;
  }

  .step-subtitle {
    font-size: 0.9rem;
  }

  .category-info h3 {
    font-size: 0.9rem;
  }

  .category-info p {
    font-size: 0.75rem;
  }
}
</style>
