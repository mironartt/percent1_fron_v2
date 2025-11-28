<template>
  <div class="mini-task-container">
    <!-- Stepper Progress -->
    <div class="stepper-progress">
      <div 
        v-for="(step, index) in stepsMeta" 
        :key="index"
        class="stepper-step"
        :class="{ 
          active: currentStep === index + 1, 
          completed: currentStep > index + 1 
        }"
      >
        <div class="stepper-icon">
          <Check v-if="currentStep > index + 1" :size="16" />
          <component v-else :is="step.icon" :size="16" />
        </div>
        <span class="stepper-label">{{ step.shortName }}</span>
        <div v-if="index < stepsMeta.length - 1" class="stepper-line"></div>
      </div>
    </div>

    <!-- Step 1: Welcome -->
    <div v-if="currentStep === 1" class="step-content">
      <div class="step-header">
        <div class="step-icon-large purple">
          <Sparkles :size="32" />
        </div>
        <h1 class="step-title">Привет, {{ userName }}!</h1>
      </div>
      
      <div class="step-description">
        <p>
          Прежде чем мы погрузимся в глобальные цели, давай проведем быструю уборку в твоей голове.
        </p>
        <p>
          Это займет <strong>5 минут</strong> и подарит тебе невероятную легкость.
        </p>
      </div>

      <div class="benefits-list">
        <div class="benefit-item">
          <span class="benefit-icon purple">
            <Brain :size="20" />
          </span>
          <span>Освободишь голову от хаоса</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon blue">
            <Sparkles :size="20" />
          </span>
          <span>Почувствуешь контроль над делами</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon green">
            <Target :size="20" />
          </span>
          <span>Получишь первый +1%</span>
        </div>
      </div>

      <button class="btn btn-primary btn-lg" @click="nextStep">
        <Rocket :size="20" />
        Начать мини-задание
      </button>
    </div>

    <!-- Step 2: Brain Dump -->
    <div v-if="currentStep === 2" class="step-content">
      <div class="step-header compact">
        <div class="step-icon-medium purple">
          <Brain :size="24" />
        </div>
        <h2 class="step-title">Мозговой штурм</h2>
      </div>

      <!-- Timer -->
      <div class="timer-block" :class="timerUrgencyClass">
        <div class="timer-icon-wrapper">
          <Timer :size="24" />
        </div>
        <span class="timer-value">{{ formatTime(timerSeconds) }}</span>
        <button v-if="!timerEnded" class="btn-timer-action" @click="stopTimer">
          <SkipForward :size="16" />
          Закончить раньше
        </button>
      </div>

      <!-- Motivation Message -->
      <div class="motivation-message" v-if="brainDumpItems.length > 0">
        <Zap :size="16" />
        <span>{{ motivationMessage }}</span>
      </div>

      <div class="instruction-box">
        <div class="instruction-header">
          <Lightbulb :size="18" />
          <span>Что записывать?</span>
        </div>
        <ul>
          <li>Несделанные дела (от «заправить машину» до «найти бухгалтера»)</li>
          <li>Идеи и мысли</li>
          <li>Тревоги и «не забыть бы»</li>
          <li>Личные и рабочие задачи</li>
        </ul>
        <p class="instruction-emphasis">
          <ArrowRight :size="16" />
          Пиши быстро, не фильтруй и не оценивай!
        </p>
      </div>

      <div class="input-area">
        <input 
          v-model="newItem"
          @keyup.enter="addItem"
          type="text"
          class="item-input"
          placeholder="Напиши что-то и нажми Enter..."
          ref="itemInput"
        />
        <button class="btn-add" @click="addItem">
          <Plus :size="20" />
        </button>
      </div>

      <div class="items-list" v-if="brainDumpItems.length > 0">
        <TransitionGroup name="item">
          <div 
            v-for="item in brainDumpItems" 
            :key="item.id"
            class="item-brick"
            draggable="true"
            @dragstart="dragStart(item, $event)"
          >
            <GripVertical :size="16" class="drag-handle" />
            <span class="item-text">{{ item.text }}</span>
            <button class="btn-remove" @click="removeItem(item.id)">
              <X :size="14" />
            </button>
          </div>
        </TransitionGroup>
      </div>

      <div class="items-count" v-if="brainDumpItems.length > 0">
        <FileText :size="16" />
        Записано: <strong>{{ brainDumpItems.length }}</strong> {{ pluralize(brainDumpItems.length, 'мысль', 'мысли', 'мыслей') }}
      </div>

      <button 
        class="btn btn-primary" 
        @click="nextStep"
        :disabled="brainDumpItems.length === 0"
      >
        Продолжить
        <ArrowRight :size="18" />
      </button>
    </div>

    <!-- Step 3: Categorization -->
    <div v-if="currentStep === 3" class="step-content">
      <div class="step-header compact">
        <div class="step-icon-medium blue">
          <FolderOpen :size="24" />
        </div>
        <h2 class="step-title">Структурирование</h2>
      </div>

      <!-- Timer -->
      <div class="timer-block" :class="timerUrgencyClass">
        <div class="timer-icon-wrapper">
          <Timer :size="24" />
        </div>
        <span class="timer-value">{{ formatTime(timerSeconds) }}</span>
        <button v-if="!timerEnded" class="btn-timer-action" @click="stopTimer">
          <SkipForward :size="16" />
          Закончить раньше
        </button>
      </div>

      <div class="instruction-box compact">
        <p><strong>Перетащи задачи в нужные категории:</strong></p>
      </div>

      <div class="categories-grid">
        <div 
          v-for="category in categories" 
          :key="category.id"
          class="category-box"
          :class="{ 'drag-over': dragOverCategory === category.id }"
          @drop="drop(category.id, $event)"
          @dragover.prevent="dragOverCategory = category.id"
          @dragleave="dragOverCategory = null"
          @dragenter.prevent
        >
          <div class="category-header">
            <span class="category-icon" :class="category.colorClass">
              <component :is="category.icon" :size="18" />
            </span>
            <h3 class="category-title">{{ category.name }}</h3>
            <span class="category-count" v-if="getCategoryItems(category.id).length > 0">
              {{ getCategoryItems(category.id).length }}
            </span>
          </div>
          <div class="category-description">{{ category.description }}</div>
          <div class="category-items">
            <div 
              v-for="item in getCategoryItems(category.id)" 
              :key="item.id"
              class="item-brick small"
              draggable="true"
              @dragstart="dragStart(item, $event)"
            >
              <span class="item-text">{{ item.text }}</span>
            </div>
            <div v-if="getCategoryItems(category.id).length === 0" class="empty-hint">
              <ArrowDownToLine :size="16" />
              Перетащи сюда
            </div>
          </div>
        </div>
      </div>

      <div class="uncategorized-section" v-if="uncategorizedItems.length > 0">
        <div class="uncategorized-header">
          <AlertCircle :size="18" />
          <span>Не распределено: <strong>{{ uncategorizedItems.length }}</strong></span>
        </div>
        <div class="items-list horizontal">
          <div 
            v-for="item in uncategorizedItems" 
            :key="item.id"
            class="item-brick"
            draggable="true"
            @dragstart="dragStart(item, $event)"
          >
            <GripVertical :size="14" class="drag-handle" />
            <span class="item-text">{{ item.text }}</span>
          </div>
        </div>
      </div>

      <button 
        class="btn btn-primary" 
        @click="nextStep"
        :disabled="uncategorizedItems.length > 0"
      >
        Продолжить
        <ArrowRight :size="18" />
      </button>
    </div>

    <!-- Step 4: Select Actions -->
    <div v-if="currentStep === 4" class="step-content">
      <div class="step-header compact">
        <div class="step-icon-medium green">
          <CheckSquare :size="24" />
        </div>
        <h2 class="step-title">Выбери дела для выполнения</h2>
      </div>
      
      <div class="instruction-box">
        <p>
          Финальный шаг! Выбери <strong>1-3 самых легких или самых надоедливых дела</strong> 
          из списка «Следующие действия» и сделай их в ближайшие 24 часа.
        </p>
        <p class="instruction-emphasis">
          <Waves :size="16" />
          Просто чтобы почувствовать облегчение и запустить позитивную волну!
        </p>
      </div>

      <div class="actions-selection">
        <div class="selection-header">
          <CheckCircle :size="18" />
          <span>Следующие действия</span>
        </div>
        <div v-if="nextActionItems.length === 0" class="empty-state">
          <Inbox :size="24" />
          <p>На предыдущем шаге не было задач в категории "Следующие действия". 
          Выбери любые другие дела!</p>
        </div>
        <label 
          v-for="item in nextActionItems" 
          :key="item.id"
          class="action-checkbox"
          :class="{ 
            selected: selectedActions.includes(item.id),
            disabled: selectedActions.length >= 3 && !selectedActions.includes(item.id) 
          }"
        >
          <input 
            type="checkbox"
            :value="item.id"
            v-model="selectedActions"
            :disabled="selectedActions.length >= 3 && !selectedActions.includes(item.id)"
          />
          <span class="checkbox-icon">
            <Check v-if="selectedActions.includes(item.id)" :size="14" />
          </span>
          <span class="checkbox-text">{{ item.text }}</span>
        </label>
      </div>

      <div class="selection-counter">
        <div class="counter-dots">
          <span 
            v-for="i in 3" 
            :key="i" 
            class="counter-dot"
            :class="{ filled: i <= selectedActions.length }"
          ></span>
        </div>
        <span>Выбрано: {{ selectedActions.length }} из 3</span>
      </div>

      <button 
        class="btn btn-primary btn-lg btn-complete" 
        @click="completeMiniTask"
        :disabled="selectedActions.length === 0"
      >
        <Trophy :size="20" />
        Завершить и получить +1%
      </button>
    </div>

    <!-- Completion Modal -->
    <Transition name="modal">
      <div v-if="showCompletion" class="completion-overlay" @click="closeCompletion">
        <div class="completion-modal" @click.stop>
          <div class="confetti-container">
            <div v-for="i in 50" :key="i" class="confetti" :style="getConfettiStyle(i)"></div>
          </div>
          
          <div class="completion-icon">
            <Trophy :size="48" />
          </div>
          
          <h2 class="completion-title">Поздравляем!</h2>
          <p class="completion-subtitle">Ты получил свой первый +1%</p>
          
          <div class="completion-stats">
            <div class="stat-item">
              <span class="stat-value">{{ brainDumpItems.length }}</span>
              <span class="stat-label">мыслей записано</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ selectedActions.length }}</span>
              <span class="stat-label">дел выбрано</span>
            </div>
          </div>

          <div class="completion-message">
            <Lightbulb :size="18" />
            <p>Теперь выполни выбранные дела в течение 24 часов. Это запустит цепочку маленьких побед!</p>
          </div>

          <button class="btn btn-primary btn-lg" @click="closeCompletion">
            <Rocket :size="18" />
            Продолжить
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, markRaw } from 'vue'
import { useAppStore } from '../stores/app'
import { 
  Brain, FolderOpen, CheckSquare, Trophy, Check, Timer, 
  SkipForward, Lightbulb, ArrowRight, Plus, X, GripVertical,
  FileText, Calendar, Sparkles, BookOpen, AlertCircle,
  ArrowDownToLine, CheckCircle, Inbox, Waves, Rocket, Target, Zap
} from 'lucide-vue-next'

const emit = defineEmits(['complete'])
const store = useAppStore()

const userName = computed(() => store.user.name || 'друг')

const currentStep = ref(1)
const totalSteps = 4
const showCompletion = ref(false)

// Stepper metadata
const stepsMeta = [
  { icon: markRaw(Sparkles), shortName: 'Старт' },
  { icon: markRaw(Brain), shortName: 'Штурм' },
  { icon: markRaw(FolderOpen), shortName: 'Сортировка' },
  { icon: markRaw(CheckSquare), shortName: 'Выбор' }
]

// Timer
const timerSeconds = ref(0)
const timerEnded = ref(false)
let timerInterval = null

// Step 2: Brain Dump
const newItem = ref('')
const itemInput = ref(null)
const brainDumpItems = ref([])
let itemIdCounter = 0

// Step 3: Categories
const categories = [
  {
    id: 'calendar',
    name: 'Календарь',
    icon: markRaw(Calendar),
    colorClass: 'red',
    description: 'Дела с жёсткой датой/временем'
  },
  {
    id: 'next',
    name: 'Следующие действия',
    icon: markRaw(CheckCircle),
    colorClass: 'green',
    description: 'Что сделать в ближайшее время'
  },
  {
    id: 'someday',
    name: 'Идеи / Когда-нибудь',
    icon: markRaw(Lightbulb),
    colorClass: 'amber',
    description: 'Не срочно, но интересно'
  },
  {
    id: 'reference',
    name: 'Справка',
    icon: markRaw(BookOpen),
    colorClass: 'blue',
    description: 'Информация для хранения'
  }
]

const draggedItem = ref(null)
const dragOverCategory = ref(null)

// Step 4: Action Selection
const selectedActions = ref([])
const completedActions = ref([])

// Motivation messages
const motivationMessages = [
  'Отлично начинаешь!',
  'Продолжай в том же духе!',
  'Супер, голова уже легче!',
  'Ты молодец, продолжай!',
  'Класс, выгружай всё!',
  'Ещё немного и всё на бумаге!'
]

const motivationMessage = computed(() => {
  const count = brainDumpItems.value.length
  if (count < 3) return motivationMessages[0]
  if (count < 6) return motivationMessages[1]
  if (count < 10) return motivationMessages[2]
  if (count < 15) return motivationMessages[3]
  if (count < 20) return motivationMessages[4]
  return motivationMessages[5]
})

const timerUrgencyClass = computed(() => {
  if (timerEnded.value) return 'ended'
  if (timerSeconds.value <= 30) return 'critical'
  if (timerSeconds.value <= 60) return 'warning'
  return 'normal'
})

const uncategorizedItems = computed(() => {
  return brainDumpItems.value.filter(item => !item.category)
})

const nextActionItems = computed(() => {
  return brainDumpItems.value.filter(item => item.category === 'next')
})

function nextStep() {
  if (currentStep.value === 2) {
    saveBrainDump()
  }
  
  if (currentStep.value === 3) {
    saveCategorization()
  }

  currentStep.value++
  startTimer()
}

function startTimer() {
  if (currentStep.value === 2) {
    timerSeconds.value = 7 * 60
    timerEnded.value = false
  } else if (currentStep.value === 3) {
    timerSeconds.value = 5 * 60
    timerEnded.value = false
  } else {
    return
  }

  if (timerInterval) clearInterval(timerInterval)
  
  timerInterval = setInterval(() => {
    if (timerSeconds.value > 0) {
      timerSeconds.value--
    } else {
      timerEnded.value = true
      clearInterval(timerInterval)
    }
  }, 1000)
}

function stopTimer() {
  timerEnded.value = true
  clearInterval(timerInterval)
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function addItem() {
  if (newItem.value.trim()) {
    brainDumpItems.value.push({
      id: ++itemIdCounter,
      text: newItem.value.trim(),
      category: null
    })
    newItem.value = ''
    saveBrainDump()
  }
}

function removeItem(id) {
  const index = brainDumpItems.value.findIndex(item => item.id === id)
  if (index !== -1) {
    brainDumpItems.value.splice(index, 1)
    saveBrainDump()
  }
}

function dragStart(item, event) {
  draggedItem.value = item
  event.dataTransfer.effectAllowed = 'move'
}

function drop(categoryId, event) {
  event.preventDefault()
  dragOverCategory.value = null
  if (draggedItem.value) {
    draggedItem.value.category = categoryId
    draggedItem.value = null
    saveCategorization()
  }
}

function getCategoryItems(categoryId) {
  return brainDumpItems.value.filter(item => item.category === categoryId)
}

function pluralize(count, one, few, many) {
  const mod10 = count % 10
  const mod100 = count % 100
  
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

function getConfettiStyle(index) {
  const colors = ['#6366f1', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6']
  return {
    '--confetti-color': colors[index % colors.length],
    '--confetti-delay': `${Math.random() * 3}s`,
    '--confetti-x': `${Math.random() * 100}%`,
    '--confetti-rotation': `${Math.random() * 360}deg`
  }
}

async function completeMiniTask() {
  const miniTaskData = {
    brainDump: brainDumpItems.value,
    selectedActions: selectedActions.value,
    completedActions: completedActions.value,
    completedAt: new Date().toISOString()
  }

  store.completeMiniTask(miniTaskData)
  showCompletion.value = true
}

function closeCompletion() {
  showCompletion.value = false
  emit('complete')
}

// Backend save functions (placeholders)
async function saveBrainDump() {
  console.log('Saving brain dump:', brainDumpItems.value)
}

async function saveCategorization() {
  console.log('Saving categorization:', brainDumpItems.value)
}

onMounted(() => {
  if (store.miniTask.data) {
    brainDumpItems.value = store.miniTask.data.brainDump || []
    selectedActions.value = store.miniTask.data.selectedActions || []
    completedActions.value = store.miniTask.data.completedActions || []
  }
  
  if (currentStep.value === 2) {
    setTimeout(() => {
      itemInput.value?.focus()
    }, 100)
  }
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped>
.mini-task-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

/* Stepper Progress */
.stepper-progress {
  display: flex;
  justify-content: center;
  gap: 0;
  margin-bottom: 2.5rem;
  padding: 0 1rem;
}

.stepper-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  max-width: 120px;
}

.stepper-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  transition: all 0.3s;
  position: relative;
  z-index: 1;
}

.stepper-step.active .stepper-icon {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.stepper-step.completed .stepper-icon {
  background: var(--success-color);
  color: white;
}

.stepper-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 0.5rem;
  font-weight: 500;
  transition: color 0.3s;
}

.stepper-step.active .stepper-label,
.stepper-step.completed .stepper-label {
  color: var(--text-primary);
}

.stepper-line {
  position: absolute;
  top: 18px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--border-color);
  z-index: 0;
}

.stepper-step.completed .stepper-line {
  background: var(--success-color);
}

/* Step Content */
.step-content {
  animation: fadeSlideIn 0.4s ease;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-header {
  text-align: center;
  margin-bottom: 2rem;
}

.step-header.compact {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.step-icon-large {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 1rem;
}

.step-icon-medium {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
}

.step-icon-large.purple,
.step-icon-medium.purple {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.step-icon-medium.blue {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.step-icon-medium.green {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.step-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
}

.step-header.compact .step-title {
  font-size: 1.5rem;
}

.step-description {
  text-align: center;
  max-width: 550px;
  margin: 0 auto 2rem;
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--text-secondary);
}

/* Benefits List */
.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 450px;
  margin: 0 auto 2rem;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  transition: transform 0.2s;
}

.benefit-item:hover {
  transform: translateX(4px);
}

.benefit-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.benefit-icon.purple {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.benefit-icon.blue {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.benefit-icon.green {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

/* Timer */
.timer-block {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.25rem 2rem;
  border-radius: var(--radius-xl);
  margin-bottom: 1.5rem;
  transition: all 0.3s;
}

.timer-block.normal {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
}

.timer-block.warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(251, 191, 36, 0.1));
}

.timer-block.critical {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(248, 113, 113, 0.1));
  animation: pulse-urgent 1s infinite;
}

.timer-block.ended {
  background: var(--bg-tertiary);
}

@keyframes pulse-urgent {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.timer-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
}

.timer-block.warning .timer-icon-wrapper {
  color: #f59e0b;
}

.timer-block.critical .timer-icon-wrapper {
  color: #ef4444;
}

.timer-value {
  font-size: 2rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  color: var(--primary-color);
}

.timer-block.warning .timer-value {
  color: #f59e0b;
}

.timer-block.critical .timer-value {
  color: #ef4444;
}

.btn-timer-action {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.btn-timer-action:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

/* Motivation Message */
.motivation-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  border-radius: 9999px;
  font-weight: 500;
  font-size: 0.9375rem;
  margin-bottom: 1.5rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Instructions */
.instruction-box {
  padding: 1.25rem 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border-left: 3px solid var(--primary-color);
  margin-bottom: 1.5rem;
}

.instruction-box.compact {
  padding: 1rem 1.25rem;
  text-align: center;
  border-left: none;
}

.instruction-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.75rem;
}

.instruction-box ul {
  margin: 0.75rem 0;
  padding-left: 1.25rem;
  color: var(--text-secondary);
}

.instruction-box li {
  margin: 0.375rem 0;
}

.instruction-emphasis {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-top: 0.75rem;
  margin-bottom: 0;
}

/* Input Area */
.input-area {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.item-input {
  flex: 1;
  padding: 0.875rem 1.25rem;
  font-size: 1rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--bg-primary);
  transition: all 0.2s;
}

.item-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.btn-add {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover {
  background: var(--primary-dark);
  transform: scale(1.05);
}

/* Items List */
.items-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
  margin-bottom: 1rem;
  min-height: 60px;
}

.items-list.horizontal {
  flex-direction: row;
}

.item-brick {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: grab;
  transition: all 0.2s;
  user-select: none;
}

.item-brick:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
  transform: translateY(-1px);
}

.item-brick:active {
  cursor: grabbing;
}

.item-brick.small {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.drag-handle {
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.item-text {
  flex: 1;
  font-size: 0.9375rem;
}

.btn-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-remove:hover {
  background: var(--danger);
  color: white;
}

/* Item animation */
.item-enter-active {
  animation: itemIn 0.3s ease;
}

.item-leave-active {
  animation: itemOut 0.2s ease;
}

@keyframes itemIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes itemOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}

.items-count {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

/* Categories */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.category-box {
  background: var(--bg-primary);
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  min-height: 180px;
  transition: all 0.2s;
}

.category-box:hover {
  border-color: var(--primary-color);
}

.category-box.drag-over {
  border-color: var(--primary-color);
  border-style: solid;
  background: rgba(99, 102, 241, 0.05);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 0.375rem;
}

.category-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
}

.category-icon.red {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.category-icon.green {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.category-icon.amber {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.category-icon.blue {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.category-title {
  font-size: 0.9375rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.category-count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  background: var(--primary-color);
  color: white;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.category-description {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  margin-bottom: 0.75rem;
}

.category-items {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-height: 60px;
}

.empty-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 0.8125rem;
  padding: 1.5rem 0;
}

/* Uncategorized */
.uncategorized-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(245, 158, 11, 0.08);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.uncategorized-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #d97706;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

/* Actions Selection */
.actions-selection {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.selection-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--success-color);
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-tertiary);
}

.empty-state p {
  margin-top: 0.75rem;
  font-size: 0.9375rem;
}

.action-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.5rem;
}

.action-checkbox:hover {
  border-color: var(--primary-color);
}

.action-checkbox.selected {
  border-color: var(--success-color);
  background: rgba(34, 197, 94, 0.05);
}

.action-checkbox.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-checkbox input {
  display: none;
}

.checkbox-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  flex-shrink: 0;
  transition: all 0.2s;
}

.action-checkbox.selected .checkbox-icon {
  background: var(--success-color);
  border-color: var(--success-color);
  color: white;
}

.checkbox-text {
  flex: 1;
}

/* Selection Counter */
.selection-counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

.counter-dots {
  display: flex;
  gap: 0.375rem;
}

.counter-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--border-color);
  transition: background 0.2s;
}

.counter-dot.filled {
  background: var(--success-color);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  width: 100%;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.0625rem;
}

.btn-complete {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.btn-complete:hover:not(:disabled) {
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.35);
}

/* Completion Modal */
.completion-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.completion-modal {
  position: relative;
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  max-width: 420px;
  width: 100%;
  text-align: center;
  overflow: hidden;
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--confetti-color);
  top: -10px;
  left: var(--confetti-x);
  transform: rotate(var(--confetti-rotation));
  animation: confetti-fall 3s linear var(--confetti-delay) infinite;
}

@keyframes confetti-fall {
  0% {
    top: -10px;
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
    transform: rotate(720deg);
  }
}

.completion-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  border-radius: 50%;
  color: white;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
}

.completion-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.375rem;
}

.completion-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.completion-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

.completion-message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  text-align: left;
  padding: 1rem;
  background: rgba(99, 102, 241, 0.08);
  border-radius: var(--radius-lg);
  margin-bottom: 1.5rem;
  color: var(--primary-color);
}

.completion-message p {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.5;
}

/* Modal transitions */
.modal-enter-active {
  animation: modalIn 0.3s ease;
}

.modal-leave-active {
  animation: modalOut 0.2s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes modalOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .mini-task-container {
    padding: 1rem;
  }

  .stepper-label {
    display: none;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .step-title {
    font-size: 1.5rem;
  }

  .timer-value {
    font-size: 1.5rem;
  }

  .completion-stats {
    gap: 1.5rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}
</style>
