<template>
  <div class="planning-container">
    <!-- Empty State - First Visit -->
    <div v-if="showEmptyState" class="empty-state-section">
      <div class="empty-state-card card">
        <div class="empty-icon">📅</div>
        <h1>Планирование</h1>
        <p class="subtitle">
          Распределите шаги по дням недели и получайте напоминания
        </p>
        
        <div class="lesson-info">
          <h3>Что вас ждёт в уроке:</h3>
          <div class="lesson-steps">
            <div class="lesson-step">
              <span class="step-num">1</span>
              <div>
                <strong>Теория планирования</strong>
                <p>Узнаете принципы эффективного недельного планирования</p>
              </div>
            </div>
            <div class="lesson-step">
              <span class="step-num">2</span>
              <div>
                <strong>Практика</strong>
                <p>Распределите шаги ваших целей по дням недели</p>
              </div>
            </div>
            <div class="lesson-step">
              <span class="step-num">3</span>
              <div>
                <strong>Настройка напоминаний</strong>
                <p>Подключите Telegram-бота для ежедневных напоминаний</p>
              </div>
            </div>
          </div>
        </div>

        <button class="btn btn-primary btn-lg" @click="startLesson">
          ✨ Начать урок
        </button>
      </div>
    </div>

    <!-- Lesson Mode -->
    <div v-else-if="!lessonCompleted" class="lesson-mode">
      <div class="progress-bar">
        <div 
          v-for="(step, index) in lessonSteps" 
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

      <!-- Step 1: Theory -->
      <div v-if="currentStep === 1" class="step-content">
        <div class="step-layout">
          <div class="step-main">
            <header class="section-header">
              <h1>📚 Теория недельного планирования</h1>
              <p class="subtitle">
                Научитесь планировать неделю так, чтобы двигаться к целям каждый день
              </p>
            </header>

            <div class="theory-content">
              <div class="theory-block card">
                <h3>🎯 Принцип «Неделя вперёд»</h3>
                <p>
                  Планируйте неделю заранее — в выходные или в начале недели. 
                  Это даёт ясность и снижает стресс от неопределённости.
                </p>
                <div class="key-point">
                  <span class="key-icon">💡</span>
                  <span>Лучшее время для планирования: воскресенье вечером или понедельник утром</span>
                </div>
              </div>

              <div class="theory-block card">
                <h3>⚡ Правило 3 шагов в день</h3>
                <p>
                  Не перегружайте день. Выберите максимум 3 ключевых шага из ваших целей.
                  Остальное время оставьте для рутины и непредвиденных задач.
                </p>
                <div class="key-point">
                  <span class="key-icon">⚠️</span>
                  <span>Перегруженный план = срыв плана. Меньше = лучше.</span>
                </div>
              </div>

              <div class="theory-block card">
                <h3>🔄 Баланс сфер жизни</h3>
                <p>
                  Распределяйте шаги из разных сфер жизни по неделе.
                  Это поможет поддерживать баланс и не выгорать.
                </p>
                <ul class="balance-tips">
                  <li>Утро — для важных и сложных задач</li>
                  <li>День — для рутины и встреч</li>
                  <li>Вечер — для отдыха и хобби</li>
                </ul>
              </div>

              <div class="theory-block card">
                <h3>📱 Напоминания = дисциплина</h3>
                <p>
                  Ежедневные напоминания в Telegram помогут не забыть о запланированных шагах.
                  Отмечайте выполнение прямо в мессенджере — и прогресс синхронизируется.
                </p>
                <div class="telegram-preview">
                  <div class="tg-message">
                    <strong>🎯 Задачи на сегодня:</strong>
                    <ul>
                      <li>☐ Пробежка 30 минут</li>
                      <li>☐ Прочитать главу книги</li>
                      <li>☐ Позвонить другу</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div class="step-actions">
              <button class="btn btn-primary btn-lg" @click="nextStep">
                Перейти к практике →
              </button>
            </div>
          </div>

          <div class="step-sidebar">
            <GuidancePanel
              title="Подсказки"
              icon="💡"
              :tips="theoryTips"
              :showAICoach="true"
              initialMessage="Привет! Я помогу разобраться с планированием. Спрашивай, если что-то непонятно."
              chatPlaceholder="Задайте вопрос о планировании..."
              :coachResponses="planningCoachResponses"
              sticky
            />
          </div>
        </div>
      </div>

      <!-- Step 2: Practice -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="step-layout">
          <div class="step-main">
            <header class="section-header">
              <h1>📋 Планирование недели</h1>
              <p class="subtitle">
                Распределите шаги из ваших целей по дням недели
              </p>
            </header>

            <div class="week-info card">
              <div class="week-dates">
                <span class="week-label">Планируемая неделя:</span>
                <span class="week-range">{{ weekRangeText }}</span>
              </div>
            </div>

            <!-- Goals with steps to schedule -->
            <div class="goals-to-schedule">
              <h3>🎯 Ваши цели и шаги</h3>
              <p class="hint" v-if="goalsWithSteps.length === 0">
                У вас пока нет целей с шагами. Сначала добавьте цели в модуле Декомпозиция.
              </p>
              
              <div v-for="goal in goalsWithSteps" :key="goal.id" class="goal-schedule-card card">
                <div class="goal-header">
                  <span class="goal-sphere">{{ getSphereName(goal.sphereId) }}</span>
                  <h4>{{ goal.title }}</h4>
                </div>
                <div class="steps-to-schedule">
                  <div 
                    v-for="step in getUncompletedSteps(goal)" 
                    :key="step.id"
                    class="step-schedule-item"
                    :class="{ scheduled: isStepScheduled(goal.id, step.id) }"
                  >
                    <div class="step-info">
                      <span class="step-title">{{ step.title }}</span>
                    </div>
                    <div class="step-schedule-controls">
                      <select 
                        :value="getScheduledDate(goal.id, step.id)"
                        @change="scheduleStep(goal.id, step, $event.target.value)"
                        class="day-select"
                      >
                        <option value="">📅 День</option>
                        <option 
                          v-for="day in weekDays" 
                          :key="day.date"
                          :value="day.date"
                        >
                          {{ day.label }}
                        </option>
                      </select>
                      <template v-if="isStepScheduled(goal.id, step.id)">
                        <select 
                          :value="getScheduledTimeEstimate(goal.id, step.id)"
                          @change="updateScheduledStep(goal.id, step.id, 'timeEstimate', $event.target.value)"
                          class="time-select"
                          title="Время выполнения"
                        >
                          <option value="">⏱️ Время</option>
                          <option value="30min">30 мин</option>
                          <option value="1h">1 час</option>
                          <option value="2h">2 часа</option>
                          <option value="4h">4 часа</option>
                        </select>
                        <select 
                          :value="getScheduledPriority(goal.id, step.id)"
                          @change="updateScheduledStep(goal.id, step.id, 'priority', $event.target.value)"
                          class="priority-select"
                          title="Приоритет"
                        >
                          <option value="">🎯 Приоритет</option>
                          <option value="high">Высокий</option>
                          <option value="medium">Средний</option>
                          <option value="low">Низкий</option>
                        </select>
                        <button 
                          class="btn-icon remove"
                          @click="unscheduleStep(goal.id, step.id)"
                          title="Убрать из плана"
                        >
                          ✕
                        </button>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Weekly Calendar View -->
            <div class="week-calendar card">
              <h3>📅 Ваш план на неделю</h3>
              <div class="calendar-grid">
                <div 
                  v-for="day in weekDays" 
                  :key="day.date"
                  class="calendar-day"
                  :class="{ today: isToday(day.date), 'has-tasks': getTasksForDay(day.date).length > 0 }"
                >
                  <div class="day-header">
                    <span class="day-name">{{ day.shortName }}</span>
                    <span class="day-date">{{ day.dayNum }}</span>
                  </div>
                  <div class="day-tasks">
                    <div 
                      v-for="task in getTasksForDay(day.date)" 
                      :key="task.id"
                      class="scheduled-task"
                    >
                      <span class="task-title">{{ task.stepTitle }}</span>
                    </div>
                    <div v-if="getTasksForDay(day.date).length === 0" class="no-tasks">
                      —
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="step-actions">
              <button class="btn btn-secondary" @click="prevStep">
                ← Назад
              </button>
              <button 
                class="btn btn-primary btn-lg" 
                @click="nextStep"
                :disabled="scheduledTasksCount === 0"
              >
                Далее: Напоминания →
              </button>
            </div>
          </div>

          <div class="step-sidebar">
            <GuidancePanel
              title="Подсказки"
              icon="💡"
              :tips="practiceTips"
              :checklist="practiceChecklist"
              checklistTitle="Чек-лист"
              :showAICoach="true"
              initialMessage="Отлично! Распределяй шаги по дням. Помни: не больше 3 шагов в день."
              chatPlaceholder="Спросите совет..."
              :coachResponses="planningCoachResponses"
              sticky
            />
          </div>
        </div>
      </div>

      <!-- Step 3: Telegram Setup -->
      <div v-if="currentStep === 3" class="step-content">
        <div class="step-layout">
          <div class="step-main">
            <header class="section-header">
              <h1>📱 Настройка напоминаний</h1>
              <p class="subtitle">
                Подключите Telegram-бота для получения ежедневных задач
              </p>
            </header>

            <div class="telegram-setup card">
              <div class="telegram-icon">📱</div>
              <h3>Telegram-бот (скоро)</h3>
              <p>
                Интеграция с Telegram находится в разработке. 
                Скоро вы сможете получать ежедневные напоминания о запланированных задачах 
                и отмечать их выполнение прямо в мессенджере.
              </p>
              <div class="coming-soon-badge">
                🚧 В разработке
              </div>
            </div>

            <div class="plan-summary card">
              <h3>📊 Ваш план на неделю</h3>
              <div class="summary-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ scheduledTasksCount }}</span>
                  <span class="stat-label">Запланировано шагов</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ scheduledDaysCount }}</span>
                  <span class="stat-label">Дней с задачами</span>
                </div>
              </div>

              <div class="daily-breakdown">
                <div 
                  v-for="day in weekDays" 
                  :key="day.date"
                  class="day-summary"
                  v-if="getTasksForDay(day.date).length > 0"
                >
                  <span class="day-name">{{ day.label }}:</span>
                  <span class="day-tasks-count">{{ getTasksForDay(day.date).length }} {{ pluralize(getTasksForDay(day.date).length, 'шаг', 'шага', 'шагов') }}</span>
                </div>
              </div>
            </div>

            <div class="step-actions">
              <button class="btn btn-secondary" @click="prevStep">
                ← Назад
              </button>
              <button class="btn btn-primary btn-lg" @click="completeLesson">
                ✅ Завершить урок
              </button>
            </div>
          </div>

          <div class="step-sidebar">
            <GuidancePanel
              title="Подсказки"
              icon="💡"
              :tips="telegramTips"
              :showAICoach="true"
              initialMessage="Отлично! Ваш план готов. Скоро мы добавим интеграцию с Telegram."
              chatPlaceholder="Задайте вопрос..."
              :coachResponses="planningCoachResponses"
              sticky
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Planner Mode - After lesson completion -->
    <div v-else class="planner-mode">
      <div class="planner-layout">
        <div class="planner-main">
          <header class="section-header">
            <div class="header-row">
              <h1>📅 Планирование недели</h1>
              <button class="btn btn-secondary btn-sm" @click="restartLesson">
                🔄 Пройти урок заново
              </button>
            </div>
            <p class="subtitle">{{ weekRangeText }}</p>
          </header>

          <!-- Goals with steps -->
          <div class="goals-section">
            <h3>🎯 Цели и шаги</h3>
            <div v-if="goalsWithSteps.length === 0" class="empty-goals card">
              <p>У вас пока нет целей с шагами.</p>
              <button class="btn btn-primary" @click="goToDecomposition">
                Перейти к декомпозиции
              </button>
            </div>

            <div v-for="goal in goalsWithSteps" :key="goal.id" class="goal-card card">
              <div class="goal-header">
                <span class="goal-sphere">{{ getSphereName(goal.sphereId) }}</span>
                <h4>{{ goal.title }}</h4>
                <span class="goal-progress">{{ goal.progress }}%</span>
              </div>
              <div class="steps-list">
                <div 
                  v-for="step in getUncompletedSteps(goal)" 
                  :key="step.id"
                  class="step-item"
                  :class="{ scheduled: isStepScheduled(goal.id, step.id) }"
                >
                  <span class="step-title">{{ step.title }}</span>
                  <div class="step-actions">
                    <select 
                      :value="getScheduledDate(goal.id, step.id)"
                      @change="scheduleStep(goal.id, step, $event.target.value)"
                      class="day-select-sm"
                    >
                      <option value="">—</option>
                      <option 
                        v-for="day in weekDays" 
                        :key="day.date"
                        :value="day.date"
                      >
                        {{ day.shortName }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Week Calendar -->
          <div class="week-calendar-full card">
            <h3>📅 План на неделю</h3>
            <div class="calendar-grid-full">
              <div 
                v-for="day in weekDays" 
                :key="day.date"
                class="calendar-day-full"
                :class="{ today: isToday(day.date) }"
              >
                <div class="day-header-full">
                  <span class="day-name">{{ day.label }}</span>
                  <span class="tasks-count" v-if="getTasksForDay(day.date).length > 0">
                    {{ getTasksForDay(day.date).length }}
                  </span>
                </div>
                <div class="day-tasks-full">
                  <div 
                    v-for="task in getTasksForDay(day.date)" 
                    :key="task.id"
                    class="task-card"
                    :class="{ completed: task.completed }"
                  >
                    <input 
                      type="checkbox"
                      :checked="task.completed"
                      @change="toggleTaskComplete(task.id)"
                      class="task-checkbox"
                    />
                    <div class="task-info">
                      <span class="task-title">{{ task.stepTitle }}</span>
                      <span class="task-goal">{{ task.goalTitle }}</span>
                    </div>
                    <button 
                      class="btn-icon remove-sm"
                      @click="removeTask(task.id)"
                      title="Удалить"
                    >
                      ✕
                    </button>
                  </div>
                  <div v-if="getTasksForDay(day.date).length === 0" class="empty-day">
                    Нет задач
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="planner-sidebar">
          <GuidancePanel
            title="ИИ-коуч"
            icon="🤖"
            :tips="plannerTips"
            :showAICoach="true"
            initialMessage="Привет! Как идёт выполнение плана? Могу помочь с распределением задач."
            chatPlaceholder="Спросите совет..."
            :coachResponses="planningCoachResponses"
            sticky
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import GuidancePanel from '../components/GuidancePanel.vue'

const store = useAppStore()
const router = useRouter()

const lessonSteps = ['Теория', 'Практика', 'Напоминания']

const lessonStarted = computed(() => store.planningModule.lessonStarted)
const lessonCompleted = computed(() => store.planningModule.lessonCompleted)
const currentStep = computed(() => store.planningModule.currentStep)

const showEmptyState = computed(() => {
  return !lessonStarted.value && !lessonCompleted.value
})

const goals = computed(() => store.goals)
const goalsWithSteps = computed(() => {
  return goals.value.filter(g => g.status === 'active' && g.steps && g.steps.length > 0)
})

const lifeSpheres = computed(() => store.lifeSpheres)

function getSphereName(sphereId) {
  const sphere = lifeSpheres.value.find(s => s.id === sphereId)
  return sphere ? `${sphere.icon} ${sphere.name}` : ''
}

function getUncompletedSteps(goal) {
  return (goal.steps || []).filter(s => !s.completed)
}

const weekDays = computed(() => {
  const days = []
  const today = new Date()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)
  
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  const fullNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    days.push({
      date: date.toISOString().split('T')[0],
      dayNum: date.getDate(),
      shortName: dayNames[i],
      label: fullNames[i]
    })
  }
  return days
})

const weekRangeText = computed(() => {
  if (weekDays.value.length < 7) return ''
  const start = new Date(weekDays.value[0].date)
  const end = new Date(weekDays.value[6].date)
  const options = { day: 'numeric', month: 'long' }
  return `${start.toLocaleDateString('ru-RU', options)} — ${end.toLocaleDateString('ru-RU', options)}`
})

function isToday(dateStr) {
  return dateStr === new Date().toISOString().split('T')[0]
}

const currentPlan = computed(() => {
  return store.getCurrentWeekPlan()
})

const scheduledTasks = computed(() => {
  return currentPlan.value?.scheduledTasks || []
})

const scheduledTasksCount = computed(() => scheduledTasks.value.length)

const scheduledDaysCount = computed(() => {
  const days = new Set(scheduledTasks.value.map(t => t.scheduledDate))
  return days.size
})

function getTasksForDay(dateStr) {
  return scheduledTasks.value.filter(t => t.scheduledDate === dateStr)
}

function isStepScheduled(goalId, stepId) {
  return scheduledTasks.value.some(t => t.goalId === goalId && t.stepId === stepId)
}

function getScheduledDate(goalId, stepId) {
  const task = scheduledTasks.value.find(t => t.goalId === goalId && t.stepId === stepId)
  return task?.scheduledDate || ''
}

function getScheduledTimeEstimate(goalId, stepId) {
  const task = scheduledTasks.value.find(t => t.goalId === goalId && t.stepId === stepId)
  return task?.timeEstimate || ''
}

function getScheduledPriority(goalId, stepId) {
  const task = scheduledTasks.value.find(t => t.goalId === goalId && t.stepId === stepId)
  return task?.priority || ''
}

function updateScheduledStep(goalId, stepId, field, value) {
  ensureWeekPlan()
  const plan = store.getCurrentWeekPlan()
  if (!plan) return

  const existingTask = scheduledTasks.value.find(t => t.goalId === goalId && t.stepId === stepId)
  if (existingTask) {
    store.updateScheduledTask(plan.id, existingTask.id, { [field]: value })
  }
}

function ensureWeekPlan() {
  if (!currentPlan.value) {
    const mondayDate = weekDays.value[0]?.date
    if (mondayDate) {
      store.createWeeklyPlan(mondayDate)
    }
  }
}

function scheduleStep(goalId, step, dateStr) {
  ensureWeekPlan()
  const plan = store.getCurrentWeekPlan()
  if (!plan) return

  const existingTask = scheduledTasks.value.find(t => t.goalId === goalId && t.stepId === step.id)
  if (existingTask) {
    if (dateStr) {
      store.updateScheduledTask(plan.id, existingTask.id, { scheduledDate: dateStr })
    } else {
      store.removeScheduledTask(plan.id, existingTask.id)
    }
  } else if (dateStr) {
    const goal = goals.value.find(g => g.id === goalId)
    store.addScheduledTask(plan.id, {
      goalId: goalId,
      stepId: step.id,
      stepTitle: step.title,
      goalTitle: goal?.title || '',
      scheduledDate: dateStr,
      timeEstimate: '',
      priority: ''
    })
  }
}

function unscheduleStep(goalId, stepId) {
  const plan = store.getCurrentWeekPlan()
  if (!plan) return
  const task = scheduledTasks.value.find(t => t.goalId === goalId && t.stepId === stepId)
  if (task) {
    store.removeScheduledTask(plan.id, task.id)
  }
}

function toggleTaskComplete(taskId) {
  const plan = store.getCurrentWeekPlan()
  if (plan) {
    store.toggleScheduledTaskComplete(plan.id, taskId)
  }
}

function removeTask(taskId) {
  const plan = store.getCurrentWeekPlan()
  if (plan) {
    store.removeScheduledTask(plan.id, taskId)
  }
}

function formatTimeEstimate(estimate) {
  const labels = {
    '30min': '30 мин',
    '1h': '1 час',
    '2h': '2 часа',
    '4h': '4 часа'
  }
  return labels[estimate] || estimate
}

function pluralize(n, one, few, many) {
  if (n % 10 === 1 && n % 100 !== 11) return one
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return few
  return many
}

function startLesson() {
  store.startPlanningLesson()
}

function goToStep(step) {
  if (step <= currentStep.value) {
    store.setPlanningStep(step)
  }
}

function nextStep() {
  if (currentStep.value < 3) {
    store.setPlanningStep(currentStep.value + 1)
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    store.setPlanningStep(currentStep.value - 1)
  }
}

function completeLesson() {
  store.completePlanningLesson()
}

function restartLesson() {
  if (confirm('Вы уверены? Урок начнётся заново.')) {
    store.resetPlanningModule()
  }
}

function goToDecomposition() {
  router.push('/goals')
}

const theoryTips = [
  { 
    icon: '📅', 
    text: 'Планируйте неделю в воскресенье вечером или понедельник утром',
    highlight: true
  },
  { 
    icon: '3️⃣', 
    text: 'Не больше 3 ключевых шагов в день — это реалистично и достижимо'
  },
  { 
    icon: '⚖️', 
    text: 'Чередуйте задачи из разных сфер жизни для баланса'
  }
]

const practiceTips = [
  { 
    icon: '🎯', 
    text: 'Сначала распределите самые важные шаги',
    highlight: true
  },
  { 
    icon: '⏰', 
    text: 'Учитывайте время выполнения каждого шага'
  },
  { 
    icon: '🌅', 
    text: 'Сложные задачи лучше планировать на утро'
  }
]

const practiceChecklist = computed(() => [
  { text: 'Распределить хотя бы 1 шаг', done: scheduledTasksCount.value >= 1 },
  { text: 'Не больше 3 шагов в день', done: !weekDays.value.some(d => getTasksForDay(d.date).length > 3) },
  { text: 'Задачи на разные дни', done: scheduledDaysCount.value >= 2 || scheduledTasksCount.value <= 1 }
])

const telegramTips = [
  { 
    icon: '📱', 
    text: 'Telegram-бот будет присылать задачи каждое утро',
    highlight: true
  },
  { 
    icon: '✅', 
    text: 'Отмечайте выполнение прямо в Telegram'
  },
  { 
    icon: '🔄', 
    text: 'Статус синхронизируется с личным кабинетом'
  }
]

const plannerTips = [
  { 
    icon: '📊', 
    text: 'Проверяйте план каждое утро'
  },
  { 
    icon: '✅', 
    text: 'Отмечайте выполненные шаги сразу'
  },
  { 
    icon: '🔄', 
    text: 'Переносите невыполненное на следующий день'
  }
]

const planningCoachResponses = [
  'Хороший план! Помни: не больше 3 важных задач в день.',
  'Попробуй распределить задачи равномерно по неделе.',
  'Учитывай своё расписание — когда у тебя больше энергии?',
  'Сложные задачи лучше ставить на утро, пока есть силы.',
  'Оставляй буфер времени — всегда что-то идёт не по плану.',
  'Регулярность важнее объёма. Лучше каждый день понемногу.'
]

onMounted(() => {
  ensureWeekPlan()
})
</script>

<style scoped>
.planning-container {
  max-width: 1400px;
  margin: 0 auto;
}

.empty-state-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 2rem;
}

.empty-state-card {
  text-align: center;
  max-width: 600px;
  padding: 3rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state-card h1 {
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.lesson-info {
  text-align: left;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.lesson-info h3 {
  margin-bottom: 1rem;
  font-size: 1rem;
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

.step-num {
  width: 28px;
  height: 28px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.lesson-step strong {
  display: block;
  margin-bottom: 0.25rem;
}

.lesson-step p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
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

.progress-step .step-number {
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
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
}

.step-main {
  min-width: 0;
}

.step-sidebar {
  min-width: 0;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-header h1 {
  margin-bottom: 0.5rem;
}

.theory-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.theory-block {
  padding: 1.5rem;
}

.theory-block h3 {
  margin-bottom: 0.75rem;
}

.theory-block p {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.key-point {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
}

.key-icon {
  flex-shrink: 0;
}

.balance-tips {
  margin: 0;
  padding-left: 1.25rem;
}

.balance-tips li {
  margin-bottom: 0.5rem;
}

.telegram-preview {
  background: #e3f2fd;
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-top: 1rem;
}

.tg-message {
  font-size: 0.9rem;
}

.tg-message ul {
  margin: 0.5rem 0 0;
  padding-left: 1.25rem;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.week-info {
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
}

.week-dates {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.week-label {
  color: var(--text-secondary);
}

.week-range {
  font-weight: 600;
  color: var(--primary-color);
}

.goals-to-schedule {
  margin-bottom: 2rem;
}

.goals-to-schedule h3 {
  margin-bottom: 1rem;
}

.hint {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.goal-schedule-card {
  margin-bottom: 1rem;
  padding: 1.25rem;
}

.goal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.goal-sphere {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.goal-header h4 {
  margin: 0;
  flex: 1;
}

.goal-progress {
  font-weight: 600;
  color: var(--primary-color);
}

.steps-to-schedule {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.step-schedule-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.step-schedule-item.scheduled {
  background: rgba(99, 102, 241, 0.1);
  border-left: 3px solid var(--primary-color);
}

.step-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.step-title {
  font-size: 0.9rem;
}

.step-time {
  font-size: 0.8rem;
  color: var(--text-secondary);
  padding: 0.125rem 0.5rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

.step-schedule-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.time-select,
.priority-select,
.day-select {
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  background: var(--bg-primary);
  cursor: pointer;
}

.time-select {
  min-width: 100px;
}

.priority-select {
  min-width: 110px;
}

.priority-select option[value="high"] {
  color: var(--danger-color);
}

.priority-select option[value="medium"] {
  color: var(--warning-color);
}

.priority-select option[value="low"] {
  color: var(--success-color);
}

.btn-icon.remove {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon.remove:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

.week-calendar {
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.week-calendar h3 {
  margin-bottom: 1rem;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.calendar-day {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  min-height: 100px;
}

.calendar-day.today {
  border: 2px solid var(--primary-color);
}

.calendar-day.has-tasks {
  background: rgba(99, 102, 241, 0.05);
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.day-name {
  font-weight: 600;
  font-size: 0.875rem;
}

.day-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.day-tasks {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.scheduled-task {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-tasks {
  color: var(--text-tertiary);
  font-size: 0.8rem;
  text-align: center;
}

.telegram-setup {
  text-align: center;
  padding: 3rem;
  margin-bottom: 1.5rem;
}

.telegram-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.telegram-setup h3 {
  margin-bottom: 0.75rem;
}

.telegram-setup p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.coming-soon-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
  border-radius: var(--radius-md);
  font-weight: 600;
}

.plan-summary {
  padding: 1.5rem;
}

.plan-summary h3 {
  margin-bottom: 1rem;
}

.summary-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.daily-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.day-summary {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.day-summary .day-name {
  font-weight: 500;
}

.day-tasks-count {
  color: var(--text-secondary);
}

.planner-mode {
  padding: 0;
}

.planner-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
}

.planner-main {
  min-width: 0;
}

.planner-sidebar {
  min-width: 0;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.goals-section {
  margin-bottom: 2rem;
}

.goals-section h3 {
  margin-bottom: 1rem;
}

.empty-goals {
  text-align: center;
  padding: 2rem;
}

.empty-goals p {
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

.goal-card {
  margin-bottom: 1rem;
  padding: 1.25rem;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.step-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.step-item.scheduled {
  background: rgba(99, 102, 241, 0.08);
}

.step-item .step-title {
  flex: 1;
  font-size: 0.875rem;
}

.step-item .step-actions {
  flex-shrink: 0;
}

.day-select-sm {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  background: var(--bg-primary);
  cursor: pointer;
}

.week-calendar-full {
  padding: 1.5rem;
}

.week-calendar-full h3 {
  margin-bottom: 1rem;
}

.calendar-grid-full {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.75rem;
}

.calendar-day-full {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  min-height: 150px;
  display: flex;
  flex-direction: column;
}

.calendar-day-full.today {
  border: 2px solid var(--primary-color);
}

.day-header-full {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.day-header-full .day-name {
  font-weight: 600;
  font-size: 0.8rem;
}

.tasks-count {
  width: 22px;
  height: 22px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.day-tasks-full {
  flex: 1;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  overflow-y: auto;
}

.task-card {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
}

.task-card.completed {
  opacity: 0.6;
}

.task-card.completed .task-title {
  text-decoration: line-through;
}

.task-checkbox {
  margin-top: 2px;
  cursor: pointer;
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-info .task-title {
  display: block;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-info .task-goal {
  display: block;
  font-size: 0.7rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-icon.remove-sm {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: 2px;
  font-size: 0.7rem;
  flex-shrink: 0;
}

.btn-icon.remove-sm:hover {
  color: var(--danger-color);
}

.empty-day {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: 0.8rem;
}

@media (max-width: 1024px) {
  .step-layout,
  .planner-layout {
    grid-template-columns: 1fr;
  }
  
  .step-sidebar,
  .planner-sidebar {
    order: -1;
  }
  
  .calendar-grid,
  .calendar-grid-full {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .progress-bar {
    padding: 0 0.5rem;
  }
  
  .step-label {
    display: none;
  }
  
  .calendar-grid,
  .calendar-grid-full {
    grid-template-columns: 1fr;
  }
  
  .step-actions {
    flex-direction: column;
  }
  
  .step-schedule-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .step-schedule-controls {
    width: 100%;
  }
  
  .time-select,
  .priority-select,
  .day-select {
    flex: 1;
  }
}
</style>
