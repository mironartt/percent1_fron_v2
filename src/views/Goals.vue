<template>
  <div class="goals-container">
    <!-- Empty State: First-time visitors -->
    <div v-if="showEmptyState" class="empty-welcome">
      <div class="welcome-card card">
        <div class="welcome-icon">🎯</div>
        <h1>Декомпозиция</h1>
        <p class="welcome-subtitle">
          Превратите большие желания в системный план действий
        </p>

        <div class="lesson-preview">
          <h3>Что вас ждёт в уроке:</h3>
          <div class="preview-steps">
            <div class="preview-step">
              <span class="step-number">1</span>
              <div>
                <strong>Теория декомпозиции</strong>
                <p>Узнаете 3 правила хорошего шага</p>
              </div>
            </div>
            <div class="preview-step">
              <span class="step-number">2</span>
              <div>
                <strong>Практика</strong>
                <p>Разобьёте первую цель на шаги</p>
              </div>
            </div>
            <div class="preview-step">
              <span class="step-number">3</span>
              <div>
                <strong>Проверка</strong>
                <p>Проверьте результат и завершите урок</p>
              </div>
            </div>
          </div>
        </div>

        <button class="btn btn-primary btn-lg" @click="startLesson">
          Начать урок
        </button>
      </div>
    </div>

    <!-- Lesson Mode -->
    <div v-else-if="showLesson" class="lesson-mode">
      <!-- Progress Bar -->
      <div class="lesson-progress">
        <div class="progress-steps">
          <div 
            v-for="step in 3" 
            :key="step"
            class="progress-step"
            :class="{ active: currentStep >= step, current: currentStep === step }"
          >
            <span class="step-dot">{{ step }}</span>
            <span class="step-label">{{ getStepLabel(step) }}</span>
          </div>
        </div>
      </div>

      <!-- Step 1: Theory -->
      <div v-if="currentStep === 1" class="step-content">
        <div class="theory-section">
          <h2>Искусство декомпозиции</h2>
          <p class="intro-text">
            Декомпозиция — это разбиение большой цели на конкретные, выполнимые шаги. 
            Это ключевой навык для превращения мечты в реальность.
          </p>

          <div class="rules-section">
            <h3>3 правила хорошего шага</h3>
            <div class="rule-cards">
              <div class="rule-card">
                <div class="rule-icon">⏱️</div>
                <h4>1-4 часа</h4>
                <p>Каждый шаг должен быть выполним за 1-4 часа. Если дольше — разбейте его дальше.</p>
              </div>
              <div class="rule-card">
                <div class="rule-icon">✅</div>
                <h4>Конкретность</h4>
                <p>Шаг должен быть настолько конкретным, чтобы было понятно — выполнен он или нет.</p>
              </div>
              <div class="rule-card">
                <div class="rule-icon">🎯</div>
                <h4>Измеримость</h4>
                <p>У шага должен быть чёткий результат: файл, звонок, документ, решение.</p>
              </div>
            </div>
          </div>

          <div class="example-section card">
            <h4>Пример хорошей декомпозиции</h4>
            <div class="goal-example">
              <div class="goal-title-example">
                <span class="goal-icon">🎯</span>
                <span>Выучить английский до B2</span>
              </div>
              <div class="steps-example">
                <div class="step-example good">
                  <span class="check">✓</span>
                  <span>Пройти тест на определение уровня (30 мин)</span>
                </div>
                <div class="step-example good">
                  <span class="check">✓</span>
                  <span>Выбрать онлайн-школу и записаться на пробный урок (1 час)</span>
                </div>
                <div class="step-example good">
                  <span class="check">✓</span>
                  <span>Составить расписание занятий на неделю (30 мин)</span>
                </div>
                <div class="step-example bad">
                  <span class="cross">✗</span>
                  <span>"Учить английский" — слишком размыто!</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn btn-primary btn-lg" @click="nextStep">
            Понял, продолжить →
          </button>
        </div>
      </div>

      <!-- Step 2: Practice -->
      <div v-if="currentStep === 2" class="step-content step-2-layout">
        <div class="step-2-main">
          <h2>Практика: разбиваем цель</h2>
          
          <div v-if="goalsFromBank.length > 0" class="goals-from-bank card">
            <h4>Ваши цели из Банка целей:</h4>
            <div class="bank-goals-list">
              <div 
                v-for="goal in goalsFromBank" 
                :key="goal.id"
                class="bank-goal-item"
                :class="{ selected: selectedGoalForPractice?.id === goal.id }"
                @click="selectGoalForPractice(goal)"
              >
                <span class="goal-sphere">{{ getSphereIcon(goal.sphereId) }}</span>
                <span class="goal-name">{{ goal.title }}</span>
                <span v-if="selectedGoalForPractice?.id === goal.id" class="selected-badge">Выбрана</span>
              </div>
            </div>
          </div>

          <div v-if="selectedGoalForPractice" class="practice-area card">
            <div class="practice-header">
              <h4>Декомпозиция цели:</h4>
              <p class="practice-goal-title">{{ selectedGoalForPractice.title }}</p>
            </div>

            <div class="practice-steps">
              <div 
                v-for="(step, index) in practiceSteps" 
                :key="index"
                class="practice-step"
              >
                <span class="step-number-badge">{{ index + 1 }}</span>
                <input 
                  type="text"
                  v-model="practiceSteps[index]"
                  :placeholder="`Шаг ${index + 1}: что конкретно нужно сделать?`"
                  class="step-input"
                />
                <button 
                  v-if="practiceSteps.length > 1"
                  class="btn-icon delete"
                  @click="removePracticeStep(index)"
                >✕</button>
              </div>

              <button class="btn btn-secondary" @click="addPracticeStep">
                ➕ Добавить шаг
              </button>
            </div>
          </div>

          <div v-else class="no-goal-selected card">
            <p>Выберите цель из Банка целей выше или создайте новую</p>
            <button class="btn btn-outline" @click="createNewGoalFromLesson">
              ➕ Создать новую цель
            </button>
          </div>
        </div>

        <div class="step-2-sidebar">
          <div class="ai-coach card">
            <div class="coach-header">
              <span class="coach-icon">🤖</span>
              <h3>ИИ-коуч</h3>
            </div>
            <div class="chat-container">
              <div class="chat-messages" ref="chatMessagesRef">
                <div 
                  v-for="(msg, idx) in chatMessages" 
                  :key="idx"
                  class="message"
                  :class="msg.role === 'user' ? 'user-message' : 'coach-message'"
                >
                  <span class="message-avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</span>
                  <div class="message-content">
                    <p>{{ msg.content }}</p>
                  </div>
                </div>
              </div>
              <div class="chat-input-area">
                <input 
                  type="text"
                  v-model="userMessage"
                  @keyup.enter="sendMessage"
                  placeholder="Спросите совет..."
                  class="chat-input"
                />
                <button 
                  class="btn-send"
                  @click="sendMessage"
                  :disabled="!userMessage.trim()"
                >→</button>
              </div>
            </div>
          </div>
        </div>

        <div class="step-actions full-width">
          <button class="btn btn-secondary" @click="prevStep">← Назад</button>
          <button 
            class="btn btn-primary btn-lg" 
            @click="nextStep"
            :disabled="!canProceedFromStep2"
          >
            Продолжить →
          </button>
        </div>
      </div>

      <!-- Step 3: Review and Complete -->
      <div v-if="currentStep === 3" class="step-content">
        <h2>Проверьте декомпозицию</h2>
        <p class="intro-text">
          Отлично! Вы разбили цель на конкретные шаги. 
          Проверьте результат и завершите урок.
        </p>

        <div v-if="selectedGoalForPractice" class="decomposition-review card">
          <h4>Ваша цель:</h4>
          <p class="review-goal-title">🎯 {{ selectedGoalForPractice.title }}</p>
          
          <h4>Ваши шаги:</h4>
          <div class="review-steps">
            <div 
              v-for="(step, index) in practiceSteps.filter(s => s.trim())" 
              :key="index"
              class="review-step-item"
            >
              <span class="step-number-badge">{{ index + 1 }}</span>
              <span class="step-text">{{ step }}</span>
            </div>
          </div>

          <div class="review-summary">
            <p class="summary-text">
              ✅ {{ practiceSteps.filter(s => s.trim()).length }} шагов готовы к выполнению
            </p>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn btn-secondary" @click="prevStep">← Назад</button>
          <button 
            class="btn btn-primary btn-lg" 
            @click="completeLesson"
            :disabled="!canCompleteLesson"
          >
            ✨ Завершить урок
          </button>
        </div>
      </div>
    </div>

    <!-- Summary State - After Lesson Completion -->
    <div v-else-if="showSummary" class="summary-section">
      <header class="section-header">
        <h1>🎯 Декомпозиция — Результаты</h1>
        <p class="subtitle">Урок завершён {{ formatCompletedDate }}</p>
      </header>

      <div class="summary-grid">
        <div class="summary-card card">
          <div class="summary-icon">🎯</div>
          <div class="summary-value">{{ goals.length }}</div>
          <div class="summary-label">Всего целей</div>
        </div>

        <div class="summary-card card">
          <div class="summary-icon">🏦</div>
          <div class="summary-value">{{ goalsFromBank.length }}</div>
          <div class="summary-label">Из Банка целей</div>
        </div>

        <div class="summary-card card">
          <div class="summary-icon">📋</div>
          <div class="summary-value">{{ totalStepsCount }}</div>
          <div class="summary-label">Шагов создано</div>
        </div>

        <div class="summary-card card">
          <div class="summary-icon">✅</div>
          <div class="summary-value">{{ completedStepsCount }}</div>
          <div class="summary-label">Шагов выполнено</div>
        </div>
      </div>

      <!-- Цели с декомпозицией -->
      <div class="goals-summary card" v-if="goals.length > 0">
        <h3>📋 Ваши цели и шаги</h3>
        <div class="goals-accordion">
          <div 
            v-for="goal in goals" 
            :key="goal.id"
            class="accordion-item"
            :class="{ expanded: expandedSummaryGoalId === goal.id }"
          >
            <div 
              class="accordion-header"
              @click="toggleSummaryGoalExpand(goal.id)"
            >
              <div class="accordion-title">
                <span class="expand-arrow">{{ expandedSummaryGoalId === goal.id ? '▼' : '▶' }}</span>
                <span v-if="goal.source === 'goals-bank'" class="source-badge-small">🏦</span>
                <span class="goal-name">{{ goal.title }}</span>
              </div>
              <div class="goal-meta-badges">
                <span class="progress-badge">{{ goal.progress }}%</span>
                <span class="steps-badge">{{ goal.steps?.length || 0 }} шагов</span>
              </div>
            </div>
            <transition name="accordion-expand">
              <div v-if="expandedSummaryGoalId === goal.id" class="accordion-content">
                <div v-if="goal.threeWhys" class="three-whys-block">
                  <h4>Правило "3 Почему":</h4>
                  <div class="answer-item" v-if="goal.threeWhys.why1">
                    <div class="answer-label">1. Почему эта цель мне важна?</div>
                    <div class="answer-text">{{ goal.threeWhys.why1 }}</div>
                  </div>
                  <div class="answer-item" v-if="goal.threeWhys.why2">
                    <div class="answer-label">2. Почему именно это даст мне то, что я хочу?</div>
                    <div class="answer-text">{{ goal.threeWhys.why2 }}</div>
                  </div>
                  <div class="answer-item" v-if="goal.threeWhys.why3">
                    <div class="answer-label">3. Почему это действительно про меня?</div>
                    <div class="answer-text">{{ goal.threeWhys.why3 }}</div>
                  </div>
                </div>
                <div v-if="goal.steps && goal.steps.length > 0" class="steps-list">
                  <h4>Шаги:</h4>
                  <div 
                    v-for="(step, idx) in goal.steps" 
                    :key="step.id"
                    class="step-item"
                    :class="{ completed: step.completed }"
                  >
                    <span class="step-checkbox">{{ step.completed ? '✅' : '⬜' }}</span>
                    <span class="step-text">{{ step.title }}</span>
                  </div>
                </div>
                <div v-else class="no-steps">
                  Шаги ещё не добавлены
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <div v-else class="empty-summary card">
        <p>У вас пока нет целей. Создайте первую цель!</p>
      </div>

      <div class="summary-actions">
        <button class="btn btn-primary btn-lg" @click="goToGoalsList">
          📋 Перейти к списку целей
        </button>
        <button class="btn btn-secondary" @click="restartLesson">
          🔄 Пройти урок заново
        </button>
      </div>
    </div>

    <!-- List Mode -->
    <div v-else-if="showGoalsList" class="goals-list-mode">
      <header class="page-header">
        <div>
          <h1>Цели и декомпозиция</h1>
          <p class="subtitle">
            Превратите большие желания в системный план действий
          </p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline" @click="goToSummary">
            📊 Результаты урока
          </button>
          <button class="btn btn-secondary" @click="restartLesson">
            📚 Пройти урок заново
          </button>
          <button class="btn btn-primary" @click="createNewGoal">
            <span>➕</span>
            Новая цель
          </button>
        </div>
      </header>

      <div v-if="goals.length === 0" class="empty-goals card">
        <div class="empty-icon">🎯</div>
        <h3>У вас пока нет целей</h3>
        <p>Начните с постановки первой цели, которая действительно важна для вас</p>
        <button class="btn btn-primary btn-lg" @click="createNewGoal">
          Создать первую цель
        </button>
      </div>

      <div v-else class="goals-layout">
        <div class="goals-main">
          <div class="goals-filters">
            <button 
              class="filter-btn"
              :class="{ active: filter === 'all' }"
              @click="filter = 'all'"
            >
              Все ({{ goals.length }})
            </button>
            <button 
              class="filter-btn"
              :class="{ active: filter === 'active' }"
              @click="filter = 'active'"
            >
              Активные ({{ activeGoalsCount }})
            </button>
            <button 
              class="filter-btn"
              :class="{ active: filter === 'completed' }"
              @click="filter = 'completed'"
            >
              Завершённые ({{ completedGoalsCount }})
            </button>
          </div>

          <div class="goals-list">
            <div 
              v-for="goal in filteredGoals" 
              :key="goal.id"
              class="goal-card card"
              @click="openGoalDetail(goal)"
            >
              <div class="goal-header">
                <div class="goal-title-section">
                  <h3 class="goal-title">{{ goal.title }}</h3>
                  <div class="goal-badges">
                    <span 
                      class="goal-status-badge"
                      :class="goal.status"
                    >
                      {{ getStatusLabel(goal.status) }}
                    </span>
                    <span v-if="goal.source === 'goals-bank'" class="source-badge">
                      🏦 Из Банка целей
                    </span>
                  </div>
                </div>
                <div class="goal-actions">
                  <button 
                    class="btn-icon"
                    @click.stop="editGoal(goal)"
                    title="Редактировать"
                  >
                    ✏️
                  </button>
                  <button 
                    class="btn-icon delete"
                    @click.stop="deleteGoalConfirm(goal)"
                    title="Удалить"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <p v-if="goal.description" class="goal-description">
                {{ goal.description }}
              </p>

              <div class="goal-meta">
                <div class="goal-meta-item">
                  <span class="meta-label">Сфера:</span>
                  <span class="meta-value">{{ getSphereName(goal.sphereId) }}</span>
                </div>
                <div v-if="goal.deadline" class="goal-meta-item">
                  <span class="meta-label">Дедлайн:</span>
                  <span class="meta-value">{{ formatDate(goal.deadline) }}</span>
                </div>
              </div>

              <div class="goal-progress">
                <div class="progress-header">
                  <span class="progress-label">Прогресс</span>
                  <span class="progress-value">{{ goal.progress }}%</span>
                </div>
                <div class="progress-bar">
                  <div 
                    class="progress-fill"
                    :style="{ width: `${goal.progress}%` }"
                  ></div>
                </div>
              </div>

              <div v-if="goal.steps && goal.steps.length > 0" class="goal-steps-preview">
                <div class="steps-count">
                  {{ getCompletedSteps(goal) }} / {{ goal.steps.length }} шагов выполнено
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="goals-sidebar">
          <div class="ai-coach card">
            <div class="coach-header">
              <span class="coach-icon">🤖</span>
              <h3>ИИ-коуч</h3>
            </div>
            <div class="chat-container">
              <div class="chat-messages" ref="listChatMessagesRef">
                <div 
                  v-for="(msg, idx) in listChatMessages" 
                  :key="idx"
                  class="message"
                  :class="msg.role === 'user' ? 'user-message' : 'coach-message'"
                >
                  <span class="message-avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</span>
                  <div class="message-content">
                    <p>{{ msg.content }}</p>
                  </div>
                </div>
              </div>
              <div class="chat-input-area">
                <input 
                  type="text"
                  v-model="listUserMessage"
                  @keyup.enter="sendListMessage"
                  placeholder="Спросите совет..."
                  class="chat-input"
                />
                <button 
                  class="btn-send"
                  @click="sendListMessage"
                  :disabled="!listUserMessage.trim()"
                >→</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Goal Detail Modal -->
    <transition name="fade">
      <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
        <div class="modal modal-large">
          <div class="modal-header">
            <h2>{{ selectedGoal?.title }}</h2>
            <button class="btn-close" @click="showDetailModal = false">✕</button>
          </div>

          <div class="modal-body">
            <div class="goal-detail-status">
              <span 
                class="goal-status-badge large"
                :class="selectedGoal?.status"
              >
                {{ getStatusLabel(selectedGoal?.status) }}
              </span>
              <div class="goal-detail-meta">
                <div>Сфера: {{ getSphereName(selectedGoal?.sphereId) }}</div>
                <div v-if="selectedGoal?.deadline">
                  Дедлайн: {{ formatDate(selectedGoal?.deadline) }}
                </div>
              </div>
            </div>

            <div v-if="selectedGoal?.threeWhys" class="goal-detail-section why-section">
              <h4>Почему эта цель важна (3 Почему)</h4>
              <div class="why-answers">
                <p v-if="selectedGoal.threeWhys.why1"><strong>1.</strong> {{ selectedGoal.threeWhys.why1 }}</p>
                <p v-if="selectedGoal.threeWhys.why2"><strong>2.</strong> {{ selectedGoal.threeWhys.why2 }}</p>
                <p v-if="selectedGoal.threeWhys.why3"><strong>3.</strong> {{ selectedGoal.threeWhys.why3 }}</p>
              </div>
            </div>

            <div v-if="selectedGoal?.description" class="goal-detail-section">
              <h4>Описание</h4>
              <p>{{ selectedGoal.description }}</p>
            </div>

            <div v-if="selectedGoal?.mvp" class="goal-detail-section">
              <h4>MVP</h4>
              <p>{{ selectedGoal.mvp }}</p>
            </div>

            <div class="goal-detail-section">
              <h4>Прогресс: {{ selectedGoal?.progress }}%</h4>
              <div class="progress-bar large">
                <div 
                  class="progress-fill"
                  :style="{ width: `${selectedGoal?.progress}%` }"
                ></div>
              </div>
            </div>

            <div v-if="selectedGoal?.steps && selectedGoal.steps.length > 0" class="goal-detail-section">
              <h4>Шаги ({{ getCompletedSteps(selectedGoal) }}/{{ selectedGoal.steps.length }})</h4>
              <div class="steps-checklist">
                <label 
                  v-for="(step, index) in selectedGoal.steps" 
                  :key="index"
                  class="step-checkbox"
                >
                  <input 
                    type="checkbox"
                    v-model="step.completed"
                    @change="updateGoalProgress(selectedGoal)"
                  />
                  <span :class="{ completed: step.completed }">{{ step.title }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showDetailModal = false">Закрыть</button>
            <button 
              v-if="selectedGoal?.status === 'active'"
              class="btn btn-primary"
              @click="openCompleteGoalModal(selectedGoal)"
            >
              ✅ Завершить цель
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Completion Reflection Modal -->
    <transition name="fade">
      <div v-if="showCompletionModal" class="modal-overlay" @click.self="showCompletionModal = false">
        <div class="modal">
          <div class="modal-header">
            <h2>🎉 Поздравляем!</h2>
            <button class="btn-close" @click="showCompletionModal = false">✕</button>
          </div>

          <div class="modal-body">
            <p class="completion-intro">
              Вы завершаете цель "{{ goalToComplete?.title }}". Давайте подведём итоги!
            </p>

            <div class="form-group">
              <label class="form-label">Что получилось хорошо?</label>
              <textarea 
                v-model="completionReflection.success"
                class="form-textarea"
                rows="3"
                placeholder="Какие шаги были выполнены особенно успешно?"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Что было сложно?</label>
              <textarea 
                v-model="completionReflection.challenges"
                class="form-textarea"
                rows="3"
                placeholder="С какими трудностями вы столкнулись?"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Что вы узнали?</label>
              <textarea 
                v-model="completionReflection.learnings"
                class="form-textarea"
                rows="3"
                placeholder="Какие уроки вынесли из достижения этой цели?"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showCompletionModal = false">Отмена</button>
            <button class="btn btn-primary" @click="confirmCompleteGoal">
              ✅ Завершить цель
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'

const router = useRouter()
const store = useAppStore()

const goals = computed(() => store.goals)
const lifeSpheres = computed(() => store.lifeSpheres)
const decompositionModule = computed(() => store.decompositionModule)
const goalsBank = computed(() => store.goalsBank)

const filter = ref('all')
const showDetailModal = ref(false)
const selectedGoal = ref(null)
const showCompletionModal = ref(false)
const goalToComplete = ref(null)
const completionReflection = ref({
  success: '',
  challenges: '',
  learnings: ''
})

const currentStep = computed(() => decompositionModule.value.currentStep)

const showEmptyState = computed(() => {
  return !decompositionModule.value.lessonStarted && !decompositionModule.value.lessonCompleted
})

const showLesson = computed(() => {
  return decompositionModule.value.lessonStarted && !decompositionModule.value.lessonCompleted
})

const showSummary = computed(() => {
  return decompositionModule.value.lessonCompleted && !viewingGoalsList.value
})

const showGoalsList = computed(() => {
  return decompositionModule.value.lessonCompleted && viewingGoalsList.value
})

const goalsFromBank = computed(() => {
  return goals.value.filter(g => g.source === 'goals-bank')
})

const totalStepsCount = computed(() => {
  return goals.value.reduce((sum, g) => sum + (g.steps?.length || 0), 0)
})

const completedStepsCount = computed(() => {
  return goals.value.reduce((sum, g) => {
    return sum + (g.steps?.filter(s => s.completed)?.length || 0)
  }, 0)
})

const formatCompletedDate = computed(() => {
  if (!decompositionModule.value.completedAt) return ''
  const date = new Date(decompositionModule.value.completedAt)
  return date.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
})

const expandedSummaryGoalId = ref(null)
const viewingGoalsList = ref(false)

const activeGoalsCount = computed(() => goals.value.filter(g => g.status === 'active').length)
const completedGoalsCount = computed(() => goals.value.filter(g => g.status === 'completed').length)

const filteredGoals = computed(() => {
  if (filter.value === 'all') return goals.value
  return goals.value.filter(g => g.status === filter.value)
})

const selectedGoalForPractice = ref(null)
const practiceSteps = ref(['', '', ''])

const chatMessagesRef = ref(null)
const listChatMessagesRef = ref(null)
const userMessage = ref('')
const listUserMessage = ref('')
const chatMessages = ref([
  { role: 'coach', content: 'Привет! Я помогу тебе разбить цель на конкретные шаги. Выбери цель из списка или задай вопрос.' }
])
const listChatMessages = ref([
  { role: 'coach', content: 'Привет! Чем могу помочь с твоими целями? Спроси о декомпозиции или планировании.' }
])

const canProceedFromStep2 = computed(() => {
  return selectedGoalForPractice.value && practiceSteps.value.filter(s => s.trim()).length >= 2
})

const canCompleteLesson = computed(() => {
  return selectedGoalForPractice.value && practiceSteps.value.filter(s => s.trim()).length >= 2
})

function getStepLabel(step) {
  const labels = { 1: 'Теория', 2: 'Практика', 3: 'Проверка' }
  return labels[step]
}

function startLesson() {
  store.startDecompositionLesson()
}

function nextStep() {
  if (currentStep.value < 3) {
    store.setDecompositionStep(currentStep.value + 1)
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    store.setDecompositionStep(currentStep.value - 1)
  }
}

function selectGoalForPractice(goal) {
  selectedGoalForPractice.value = { ...goal }
  if (goal.steps && goal.steps.length > 0) {
    practiceSteps.value = goal.steps.map(s => s.title)
  } else {
    practiceSteps.value = ['', '', '']
  }
}

function addPracticeStep() {
  practiceSteps.value.push('')
}

function removePracticeStep(index) {
  practiceSteps.value.splice(index, 1)
}

function createNewGoalFromLesson() {
  router.push('/goals/new')
}

async function sendMessage() {
  if (!userMessage.value.trim()) return
  
  const msg = userMessage.value
  chatMessages.value.push({ role: 'user', content: msg })
  userMessage.value = ''
  
  await nextTick()
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  }
  
  setTimeout(() => {
    const responses = [
      'Хороший вопрос! Попробуй разбить этот шаг на ещё более мелкие действия — каждое не больше 1-2 часов.',
      'Помни: конкретный шаг = понятный результат. Что именно ты получишь после выполнения?',
      'Отлично! Теперь подумай — какой первый шаг ты можешь сделать уже сегодня?',
      'Рекомендую начать с самого простого шага — это создаст momentum для остальных.'
    ]
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    chatMessages.value.push({ role: 'coach', content: randomResponse })
    
    nextTick(() => {
      if (chatMessagesRef.value) {
        chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
      }
    })
  }, 1000)
}

async function sendListMessage() {
  if (!listUserMessage.value.trim()) return
  
  const msg = listUserMessage.value
  listChatMessages.value.push({ role: 'user', content: msg })
  listUserMessage.value = ''
  
  await nextTick()
  if (listChatMessagesRef.value) {
    listChatMessagesRef.value.scrollTop = listChatMessagesRef.value.scrollHeight
  }
  
  setTimeout(() => {
    const responses = [
      'Сфокусируйся на одной цели за раз. Какая сейчас самая важная?',
      'Проверь прогресс по активным целям — есть ли шаги, которые можно выполнить сегодня?',
      'Если застрял — разбей текущий шаг на ещё более мелкие действия.',
      'Помни про правило 1-4 часа: каждый шаг должен быть выполним за это время.'
    ]
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    listChatMessages.value.push({ role: 'coach', content: randomResponse })
    
    nextTick(() => {
      if (listChatMessagesRef.value) {
        listChatMessagesRef.value.scrollTop = listChatMessagesRef.value.scrollHeight
      }
    })
  }, 1000)
}

function completeLesson() {
  if (selectedGoalForPractice.value) {
    const filteredSteps = practiceSteps.value
      .filter(s => s.trim())
      .map((title, index) => ({
        id: Date.now().toString() + index,
        title,
        completed: false
      }))
    
    store.updateGoal(selectedGoalForPractice.value.id, {
      steps: filteredSteps,
      progress: 0
    })
  }
  
  store.completeDecompositionLesson()
}

function restartLesson() {
  viewingGoalsList.value = false
  store.resetDecompositionModule()
  store.startDecompositionLesson()
}

function toggleSummaryGoalExpand(goalId) {
  if (expandedSummaryGoalId.value === goalId) {
    expandedSummaryGoalId.value = null
  } else {
    expandedSummaryGoalId.value = goalId
  }
}

function goToGoalsList() {
  viewingGoalsList.value = true
}

function goToSummary() {
  viewingGoalsList.value = false
}

function createNewGoal() {
  router.push('/goals/new')
}

function openGoalDetail(goal) {
  selectedGoal.value = { ...goal }
  showDetailModal.value = true
}

function editGoal(goal) {
  router.push(`/goals/${goal.id}`)
}

function deleteGoalConfirm(goal) {
  if (confirm(`Удалить цель "${goal.title}"?`)) {
    store.deleteGoal(goal.id)
  }
}

function updateGoalProgress(goal) {
  if (goal.steps && goal.steps.length > 0) {
    const completed = goal.steps.filter(s => s.completed).length
    const progress = Math.round((completed / goal.steps.length) * 100)
    store.updateGoal(goal.id, { 
      steps: goal.steps,
      progress 
    })
    if (selectedGoal.value) {
      selectedGoal.value.progress = progress
    }
  }
}

function openCompleteGoalModal(goal) {
  goalToComplete.value = goal
  completionReflection.value = { success: '', challenges: '', learnings: '' }
  showDetailModal.value = false
  showCompletionModal.value = true
}

function confirmCompleteGoal() {
  if (!goalToComplete.value) return
  
  store.updateGoal(goalToComplete.value.id, { 
    status: 'completed',
    progress: 100,
    completedAt: new Date().toISOString(),
    completionReflection: { ...completionReflection.value }
  })
  
  showCompletionModal.value = false
  goalToComplete.value = null
}

function getCompletedSteps(goal) {
  if (!goal.steps) return 0
  return goal.steps.filter(s => s.completed).length
}

function getSphereName(sphereId) {
  const sphere = lifeSpheres.value.find(s => s.id === sphereId)
  return sphere ? `${sphere.icon} ${sphere.name}` : 'Не указана'
}

function getSphereIcon(sphereId) {
  const sphere = lifeSpheres.value.find(s => s.id === sphereId)
  return sphere ? sphere.icon : '🎯'
}

function getStatusLabel(status) {
  const labels = {
    active: 'Активна',
    completed: 'Завершена',
    paused: 'Приостановлена'
  }
  return labels[status] || status
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<style scoped>
.goals-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Empty Welcome State */
.empty-welcome {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
}

.welcome-card {
  max-width: 600px;
  text-align: center;
  padding: 3rem;
}

.welcome-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.welcome-card h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.welcome-subtitle {
  color: var(--text-secondary);
  font-size: 1.125rem;
  margin-bottom: 2rem;
}

.lesson-preview {
  text-align: left;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.lesson-preview h3 {
  font-size: 1rem;
  margin-bottom: 1rem;
}

.preview-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preview-step {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.preview-step .step-number {
  width: 28px;
  height: 28px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.preview-step strong {
  display: block;
  margin-bottom: 0.25rem;
}

.preview-step p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Lesson Mode */
.lesson-mode {
  max-width: 1000px;
  margin: 0 auto;
}

.lesson-progress {
  margin-bottom: 2rem;
}

.progress-steps {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.progress-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 14px;
  left: calc(100% + 0.5rem);
  width: calc(2rem - 1rem);
  height: 2px;
  background: var(--border-color);
}

.progress-step.active:not(:last-child)::after {
  background: var(--primary-color);
}

.step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.progress-step.active .step-dot {
  background: var(--primary-color);
  color: white;
}

.progress-step.current .step-dot {
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
}

.step-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.progress-step.active .step-label {
  color: var(--text-primary);
  font-weight: 500;
}

/* Step Content */
.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-content h2 {
  font-size: 1.75rem;
  margin-bottom: 1rem;
}

.intro-text {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  max-width: 700px;
}

/* Theory Section */
.theory-section {
  margin-bottom: 2rem;
}

.rules-section {
  margin-bottom: 2rem;
}

.rules-section h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.rule-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.rule-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  text-align: center;
}

.rule-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.rule-card h4 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.rule-card p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.example-section {
  padding: 1.5rem;
}

.example-section h4 {
  margin-bottom: 1rem;
}

.goal-title-example {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.goal-icon {
  font-size: 1.25rem;
}

.steps-example {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.step-example {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
}

.step-example.good {
  background: rgba(16, 185, 129, 0.1);
}

.step-example.bad {
  background: rgba(239, 68, 68, 0.1);
}

.step-example .check {
  color: var(--success-color);
  font-weight: 600;
}

.step-example .cross {
  color: var(--danger-color);
  font-weight: 600;
}

/* Step 2 Layout */
.step-2-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2rem;
  align-items: start;
}

.step-2-main {
  min-width: 0;
}

.step-2-sidebar {
  position: sticky;
  top: 2rem;
}

.full-width {
  grid-column: 1 / -1;
}

/* Goals from Bank */
.goals-from-bank {
  margin-bottom: 1.5rem;
}

.goals-from-bank h4 {
  margin-bottom: 1rem;
}

.bank-goals-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bank-goal-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.bank-goal-item:hover {
  background: var(--bg-tertiary);
}

.bank-goal-item.selected {
  border-color: var(--primary-color);
  background: rgba(99, 102, 241, 0.05);
}

.goal-sphere {
  font-size: 1.25rem;
}

.goal-name {
  flex: 1;
  font-weight: 500;
}

.selected-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-sm);
}

/* Practice Area */
.practice-area {
  padding: 1.5rem;
}

.practice-header {
  margin-bottom: 1.5rem;
}

.practice-header h4 {
  margin-bottom: 0.5rem;
}

.practice-goal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-color);
}

.practice-steps {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.practice-step {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.step-number-badge {
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

.step-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 1rem;
  background: var(--bg-primary);
}

.step-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.no-goal-selected {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.no-goal-selected p {
  margin-bottom: 1rem;
}

/* AI Coach */
.ai-coach {
  background: #ffffff;
  border: 1px solid var(--border-color);
  padding: 1rem;
}

.coach-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.coach-icon {
  font-size: 1.25rem;
}

.coach-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 300px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-right: 0.5rem;
}

.message {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.message-avatar {
  flex-shrink: 0;
  font-size: 1rem;
}

.message-content {
  flex: 1;
}

.message-content p {
  margin: 0;
  padding: 0.6rem 0.85rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  line-height: 1.4;
}

.coach-message .message-content p {
  background: var(--bg-tertiary);
}

.user-message {
  flex-direction: row-reverse;
}

.user-message .message-content p {
  background: var(--primary-color);
  color: white;
}

.chat-input-area {
  display: flex;
  gap: 0.5rem;
}

.chat-input {
  flex: 1;
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  background: var(--bg-primary);
}

.chat-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.btn-send {
  padding: 0.6rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s ease;
}

.btn-send:hover:not(:disabled) {
  background: var(--primary-dark);
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Step 3: First Step Selection */
.first-step-selection {
  margin-bottom: 1.5rem;
}

.first-step-selection h4 {
  margin-bottom: 1rem;
}

.steps-selection {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.step-selection-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.step-selection-item:hover {
  background: var(--bg-tertiary);
}

.step-selection-item.selected {
  border-color: var(--primary-color);
  background: rgba(99, 102, 241, 0.05);
}

.step-radio {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-selection-item.selected .step-radio {
  border-color: var(--primary-color);
}

.radio-dot {
  width: 10px;
  height: 10px;
  background: var(--primary-color);
  border-radius: 50%;
}

.step-text {
  flex: 1;
}

/* Commitment Section */
.commitment-section {
  padding: 1.5rem;
}

.commitment-section h4 {
  margin-bottom: 0.5rem;
}

.commitment-section > p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.commitment-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.commitment-btn {
  flex: 1;
  min-width: 120px;
  padding: 1rem;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.commitment-btn:hover {
  background: var(--bg-tertiary);
}

.commitment-btn.active {
  border-color: var(--primary-color);
  background: rgba(99, 102, 241, 0.05);
}

/* Step Actions */
.step-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
}

/* Goals List Mode */
.goals-list-mode .page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.empty-goals {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-goals h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.empty-goals p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

/* Goals Layout with Sidebar */
.goals-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2rem;
  align-items: start;
}

.goals-main {
  min-width: 0;
}

.goals-sidebar {
  position: sticky;
  top: 2rem;
}

.goals-filters {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.filter-btn {
  padding: 0.625rem 1.25rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9375rem;
}

.filter-btn:hover {
  background: var(--bg-tertiary);
}

.filter-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.goals-list {
  display: grid;
  gap: 1.5rem;
}

.goal-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.goal-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.goal-title-section {
  flex: 1;
}

.goal-title {
  font-size: 1.25rem;
  margin: 0 0 0.5rem 0;
}

.goal-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.goal-status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.goal-status-badge.active {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.goal-status-badge.completed {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
}

.goal-status-badge.paused {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
}

.goal-status-badge.large {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.source-badge {
  padding: 0.25rem 0.5rem;
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.goal-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--bg-tertiary);
}

.btn-icon.delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

.goal-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.goal-meta {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.goal-meta-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.9375rem;
}

.meta-label {
  color: var(--text-secondary);
}

.meta-value {
  font-weight: 500;
}

.goal-progress {
  margin-bottom: 1rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.progress-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-color);
}

.progress-bar {
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar.large {
  height: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transition: width 0.3s ease;
}

.goal-steps-preview {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.steps-count {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-large {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.btn-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 1rem;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--border-color);
  justify-content: flex-end;
}

.goal-detail-status {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.goal-detail-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

.goal-detail-section {
  margin-bottom: 1.5rem;
}

.goal-detail-section h4 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.goal-detail-section p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.why-section {
  background: rgba(99, 102, 241, 0.05);
  padding: 1rem;
  border-radius: var(--radius-md);
  border-left: 3px solid var(--primary-color);
}

.why-answers p {
  margin-bottom: 0.5rem;
}

.why-answers p:last-child {
  margin-bottom: 0;
}

.steps-checklist {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.step-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.step-checkbox:hover {
  background: var(--bg-tertiary);
}

.step-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.step-checkbox span {
  flex: 1;
  font-size: 0.9375rem;
}

.step-checkbox span.completed {
  text-decoration: line-through;
  color: var(--text-secondary);
}

/* Completion Modal */
.completion-intro {
  font-size: 1.0625rem;
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  background: var(--bg-primary);
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .step-2-layout,
  .goals-layout {
    grid-template-columns: 1fr;
  }
  
  .step-2-sidebar,
  .goals-sidebar {
    position: static;
    order: -1;
  }
}

@media (max-width: 768px) {
  .goals-list-mode .page-header {
    flex-direction: column;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .header-actions .btn {
    width: 100%;
  }
  
  .progress-steps {
    gap: 1rem;
  }
  
  .step-label {
    display: none;
  }
  
  .commitment-options {
    flex-direction: column;
  }
  
  .goal-detail-status {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Summary Section */
.summary-section {
  max-width: 900px;
  margin: 0 auto;
}

.summary-section .section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.summary-section .section-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.summary-section .section-header .subtitle {
  color: var(--text-secondary);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  text-align: center;
  padding: 1.5rem;
}

.summary-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.summary-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.summary-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.summary-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.goals-summary {
  margin-bottom: 1.5rem;
}

.goals-summary h3 {
  margin-bottom: 1rem;
}

.goals-accordion {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.accordion-item {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  background: var(--bg-secondary);
  transition: background 0.2s ease;
}

.accordion-header:hover {
  background: var(--bg-tertiary);
}

.accordion-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.expand-arrow {
  font-size: 0.75rem;
  color: var(--text-secondary);
  width: 1rem;
}

.source-badge-small {
  font-size: 0.875rem;
}

.goal-meta-badges {
  display: flex;
  gap: 0.75rem;
}

.progress-badge {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-color);
}

.steps-badge {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.accordion-content {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-primary);
}

.accordion-expand-enter-active,
.accordion-expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.accordion-expand-enter-from,
.accordion-expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.three-whys-block {
  margin-bottom: 1.5rem;
}

.three-whys-block h4 {
  font-size: 0.9375rem;
  margin-bottom: 0.75rem;
  color: var(--text-secondary);
}

.answer-item {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.answer-label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.answer-text {
  font-size: 0.9375rem;
}

.steps-list h4 {
  font-size: 0.9375rem;
  margin-bottom: 0.75rem;
  color: var(--text-secondary);
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.step-item.completed .step-text {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.no-steps {
  color: var(--text-secondary);
  font-style: italic;
}

.empty-summary {
  text-align: center;
  padding: 2rem;
}

/* Decomposition Review (Step 3) */
.decomposition-review {
  margin-bottom: 2rem;
}

.decomposition-review h4 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.review-goal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.review-steps {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.review-step-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.review-summary {
  padding: 1rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: var(--radius-md);
  text-align: center;
}

.review-summary .summary-text {
  margin: 0;
  color: var(--success-color);
  font-weight: 500;
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .summary-actions {
    flex-direction: column;
  }
  
  .summary-actions .btn {
    width: 100%;
  }
}
</style>
