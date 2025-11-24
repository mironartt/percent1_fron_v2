<template>
  <div class="mini-task-container">
    <!-- Progress Bar -->
    <div class="progress-section">
      <div class="progress-bar-bg">
        <div 
          class="progress-bar-fill"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
      <div class="progress-text">Этап {{ currentStep }} из 4</div>
    </div>

    <!-- Step 1: Welcome -->
    <div v-if="currentStep === 1" class="step-content">
      <div class="welcome-icon">🧹</div>
      <h1 class="step-title">Привет, {{ userName }}!</h1>
      <div class="step-description">
        <p>
          Прежде чем мы погрузимся в глобальные цели, давай проведем быструю уборку в твоей голове.
        </p>
        <p>
          Это займет <strong>15 минут</strong> и подарит тебе невероятную легкость.
        </p>
      </div>

      <div class="benefits-list">
        <div class="benefit-item">
          <span class="benefit-icon">🧠</span>
          <span>Освободишь голову от хаоса</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">✨</span>
          <span>Почувствуешь контроль над делами</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">🎯</span>
          <span>Получишь первый +1%</span>
        </div>
      </div>

      <button class="btn btn-primary btn-lg" @click="nextStep">
        Начать мини-задание
      </button>
    </div>

    <!-- Step 2: Brain Dump -->
    <div v-if="currentStep === 2" class="step-content">
      <h2 class="step-title">Мозговой штурм</h2>
      <div class="timer-block">
        <span class="timer-icon">⏱️</span>
        <span class="timer-value">{{ formatTime(timerSeconds) }}</span>
        <button v-if="!timerEnded" class="btn-timer-stop" @click="stopTimer">
          Закончить раньше
        </button>
      </div>

      <div class="instruction-box">
        <p>
          В режиме мозгового штурма выпиши <strong>ВСЁ</strong>, что крутится у тебя в голове:
        </p>
        <ul>
          <li>Несделанные дела (от «заправить машину» до «найти бухгалтера»)</li>
          <li>Идеи и мысли</li>
          <li>Тревоги и «не забыть бы»</li>
          <li>Личные и рабочие задачи</li>
        </ul>
        <p class="instruction-emphasis">
          Пиши быстро, не фильтруй и не оценивай. Просто вывали всё наружу!
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
        <button class="btn-add" @click="addItem">➕</button>
      </div>

      <div class="items-list">
        <div 
          v-for="item in brainDumpItems" 
          :key="item.id"
          class="item-brick"
          draggable="true"
          @dragstart="dragStart(item, $event)"
        >
          <span class="item-text">{{ item.text }}</span>
          <button class="btn-remove" @click="removeItem(item.id)">✕</button>
        </div>
      </div>

      <div class="items-count">
        Записано: {{ brainDumpItems.length }} {{ pluralize(brainDumpItems.length, 'мысль', 'мысли', 'мыслей') }}
      </div>

      <button 
        class="btn btn-primary" 
        @click="nextStep"
        :disabled="brainDumpItems.length === 0"
      >
        Продолжить
      </button>
    </div>

    <!-- Step 3: Categorization -->
    <div v-if="currentStep === 3" class="step-content">
      <h2 class="step-title">Структурирование</h2>
      <div class="timer-block">
        <span class="timer-icon">⏱️</span>
        <span class="timer-value">{{ formatTime(timerSeconds) }}</span>
        <button v-if="!timerEnded" class="btn-timer-stop" @click="stopTimer">
          Закончить раньше
        </button>
      </div>

      <div class="instruction-box">
        <p>Отлично! Теперь давай быстро рассортируем это.</p>
        <p><strong>Перетащи задачи в нужные списки:</strong></p>
      </div>

      <div class="categories-grid">
        <div 
          v-for="category in categories" 
          :key="category.id"
          class="category-box"
          @drop="drop(category.id, $event)"
          @dragover.prevent
          @dragenter.prevent
        >
          <div class="category-header">
            <span class="category-icon">{{ category.icon }}</span>
            <h3 class="category-title">{{ category.name }}</h3>
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
              Перетащи сюда задачи
            </div>
          </div>
        </div>
      </div>

      <div class="uncategorized-section" v-if="uncategorizedItems.length > 0">
        <h4>Не распределённые задачи ({{ uncategorizedItems.length }}):</h4>
        <div class="items-list horizontal">
          <div 
            v-for="item in uncategorizedItems" 
            :key="item.id"
            class="item-brick"
            draggable="true"
            @dragstart="dragStart(item, $event)"
          >
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
      </button>
    </div>

    <!-- Step 4: Select Actions -->
    <div v-if="currentStep === 4" class="step-content">
      <h2 class="step-title">Выбери дела для выполнения</h2>
      
      <div class="instruction-box">
        <p>
          Финальный шаг! Выбери <strong>1-3 самых легких или самых надоедливых дела</strong> 
          из списка «Следующие действия» и сделай их в ближайшие 24 часа.
        </p>
        <p class="instruction-emphasis">
          Просто чтобы почувствовать облегчение и запустить позитивную волну! 🌊
        </p>
      </div>

      <div class="actions-selection">
        <h3>✅ Следующие действия:</h3>
        <div v-if="nextActionItems.length === 0" class="empty-state">
          На предыдущем шаге не было задач в категории "Следующие действия". 
          Выбери любые другие дела из других категорий!
        </div>
        <label 
          v-for="item in nextActionItems" 
          :key="item.id"
          class="action-checkbox"
          :class="{ disabled: selectedActions.length >= 3 && !selectedActions.includes(item.id) }"
        >
          <input 
            type="checkbox"
            :value="item.id"
            v-model="selectedActions"
            :disabled="selectedActions.length >= 3 && !selectedActions.includes(item.id)"
          />
          <span class="checkbox-text">{{ item.text }}</span>
        </label>
      </div>

      <div class="selection-counter">
        Выбрано: {{ selectedActions.length }} из 3
      </div>

      <!-- Progress Section for Selected Actions -->
      <div v-if="selectedActions.length > 0" class="selected-actions-progress">
        <h3>📊 Твой прогресс</h3>
        <p class="progress-hint">Возвращайся в сервис и отмечай выполненные дела:</p>
        
        <div class="progress-items">
          <label 
            v-for="actionId in selectedActions" 
            :key="actionId"
            class="progress-item"
          >
            <input 
              type="checkbox"
              v-model="completedActions"
              :value="actionId"
              @change="saveProgress"
            />
            <span :class="{ completed: completedActions.includes(actionId) }">
              {{ getItemText(actionId) }}
            </span>
          </label>
        </div>

        <div class="progress-bar-section">
          <div class="progress-bar-bg">
            <div 
              class="progress-bar-fill success"
              :style="{ width: `${actionsProgressPercentage}%` }"
            ></div>
          </div>
          <div class="progress-text">
            {{ completedActions.length }} / {{ selectedActions.length }} выполнено
          </div>
        </div>
      </div>

      <button 
        class="btn btn-primary btn-lg" 
        @click="completeMiniTask"
        :disabled="selectedActions.length === 0"
      >
        Готово
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()

const userName = computed(() => store.user.name)

const currentStep = ref(1)
const totalSteps = 4

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
    icon: '🗓️',
    description: 'Дела с жёсткой датой/временем'
  },
  {
    id: 'next',
    name: 'Следующие действия',
    icon: '✅',
    description: 'Что сделать в ближайшее время'
  },
  {
    id: 'someday',
    name: 'Идеи/Когда-нибудь',
    icon: '💡',
    description: 'Не срочно, но интересно'
  },
  {
    id: 'reference',
    name: 'Справка',
    icon: '📚',
    description: 'Информация для хранения'
  }
]

const draggedItem = ref(null)

// Step 4: Action Selection
const selectedActions = ref([])
const completedActions = ref([])

const progressPercentage = computed(() => {
  return (currentStep.value / totalSteps) * 100
})

const uncategorizedItems = computed(() => {
  return brainDumpItems.value.filter(item => !item.category)
})

const nextActionItems = computed(() => {
  return brainDumpItems.value.filter(item => item.category === 'next')
})

const actionsProgressPercentage = computed(() => {
  if (selectedActions.value.length === 0) return 0
  return (completedActions.value.length / selectedActions.value.length) * 100
})

function nextStep() {
  if (currentStep.value === 2) {
    // Save brain dump to backend
    saveBrainDump()
  }
  
  if (currentStep.value === 3) {
    // Save categorization to backend
    saveCategorization()
  }

  currentStep.value++
  startTimer()
}

function startTimer() {
  if (currentStep.value === 2) {
    // 7 minutes for brain dump
    timerSeconds.value = 7 * 60
    timerEnded.value = false
  } else if (currentStep.value === 3) {
    // 5 minutes for categorization
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
    
    // Auto-save to backend
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
  if (draggedItem.value) {
    draggedItem.value.category = categoryId
    draggedItem.value = null
    
    // Auto-save to backend
    saveCategorization()
  }
}

function getCategoryItems(categoryId) {
  return brainDumpItems.value.filter(item => item.category === categoryId)
}

function getItemText(itemId) {
  const item = brainDumpItems.value.find(i => i.id === itemId)
  return item ? item.text : ''
}

function pluralize(count, one, few, many) {
  const mod10 = count % 10
  const mod100 = count % 100
  
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

function saveProgress() {
  // Save to backend
  saveMiniTaskProgress()
}

async function completeMiniTask() {
  // Save final data
  const miniTaskData = {
    brainDump: brainDumpItems.value,
    selectedActions: selectedActions.value,
    completedActions: completedActions.value,
    completedAt: new Date().toISOString()
  }

  store.completeMiniTask(miniTaskData)

  // В будущем: await api.post('/mini-task/complete', miniTaskData)
  
  // Show achievement
  // Emit event to parent to show achievement modal
}

// Backend save functions (placeholders)
async function saveBrainDump() {
  // await api.post('/mini-task/brain-dump', { items: brainDumpItems.value })
  console.log('Saving brain dump:', brainDumpItems.value)
}

async function saveCategorization() {
  // await api.post('/mini-task/categorization', { items: brainDumpItems.value })
  console.log('Saving categorization:', brainDumpItems.value)
}

async function saveMiniTaskProgress() {
  // await api.post('/mini-task/progress', { 
  //   selectedActions: selectedActions.value,
  //   completedActions: completedActions.value 
  // })
  console.log('Saving progress:', completedActions.value)
}

onMounted(() => {
  // Load existing data if returning to mini-task
  if (store.miniTask.data) {
    brainDumpItems.value = store.miniTask.data.brainDump || []
    selectedActions.value = store.miniTask.data.selectedActions || []
    completedActions.value = store.miniTask.data.completedActions || []
  }
  
  // Focus input on step 2
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
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
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
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transition: width 0.5s ease;
}

.progress-bar-fill.success {
  background: linear-gradient(90deg, var(--success), #059669);
}

.progress-text {
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Steps */
.step-content {
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
  margin-bottom: 1.5rem;
}

.step-description {
  text-align: center;
  max-width: 600px;
  margin: 0 auto 2rem;
  font-size: 1.0625rem;
  line-height: 1.7;
}

/* Welcome */
.welcome-icon {
  text-align: center;
  font-size: 5rem;
  margin-bottom: 1.5rem;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 500px;
  margin: 0 auto 2rem;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: var(--bg-primary);
  border-radius: 0.75rem;
  border: 1px solid var(--border);
}

.benefit-icon {
  font-size: 1.5rem;
}

/* Timer */
.timer-block {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  border-radius: 1rem;
  margin-bottom: 2rem;
}

.timer-icon {
  font-size: 2rem;
}

.timer-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary);
  font-family: 'Courier New', monospace;
}

.btn-timer-stop {
  padding: 0.5rem 1rem;
  background: white;
  border: 2px solid var(--border);
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-timer-stop:hover {
  background: var(--bg-tertiary);
}

/* Instructions */
.instruction-box {
  padding: 1.5rem;
  background: var(--bg-primary);
  border-radius: 1rem;
  border-left: 4px solid var(--primary);
  margin-bottom: 2rem;
}

.instruction-box ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.instruction-box li {
  margin: 0.5rem 0;
}

.instruction-emphasis {
  font-weight: 600;
  color: var(--primary);
  margin-top: 1rem;
}

/* Input Area */
.input-area {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.item-input {
  flex: 1;
  padding: 1rem 1.25rem;
  font-size: 1rem;
  border: 2px solid var(--border);
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.item-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.btn-add {
  padding: 1rem 1.5rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover {
  background: var(--primary-dark);
  transform: scale(1.05);
}

/* Items */
.items-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  min-height: 100px;
}

.items-list.horizontal {
  flex-direction: row;
}

.item-brick {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 2px solid var(--border);
  border-radius: 0.5rem;
  cursor: move;
  transition: all 0.2s;
  user-select: none;
}

.item-brick:hover {
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
  transform: translateY(-2px);
}

.item-brick.small {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.item-text {
  flex: 1;
}

.btn-remove {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 1rem;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: var(--danger);
  color: white;
}

.items-count {
  text-align: center;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

/* Categories */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.category-box {
  background: var(--bg-primary);
  border: 2px dashed var(--border);
  border-radius: 1rem;
  padding: 1.5rem;
  min-height: 250px;
  transition: all 0.2s;
}

.category-box:hover {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.02);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.category-icon {
  font-size: 1.5rem;
}

.category-title {
  font-size: 1.125rem;
  margin: 0;
}

.category-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.category-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 100px;
}

.empty-hint {
  text-align: center;
  color: var(--text-tertiary);
  font-style: italic;
  padding: 2rem 0;
}

.uncategorized-section {
  background: rgba(245, 158, 11, 0.1);
  padding: 1.5rem;
  border-radius: 1rem;
  border: 2px solid var(--warning);
  margin-bottom: 2rem;
}

.uncategorized-section h4 {
  color: var(--warning);
  margin-bottom: 1rem;
}

/* Action Selection */
.actions-selection {
  background: var(--bg-primary);
  padding: 1.5rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
}

.actions-selection h3 {
  margin-bottom: 1rem;
}

.action-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-checkbox:hover {
  background: var(--bg-tertiary);
}

.action-checkbox.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.checkbox-text {
  flex: 1;
}

.selection-counter {
  text-align: center;
  font-weight: 600;
  color: var(--primary);
  font-size: 1.125rem;
  margin-bottom: 2rem;
}

/* Progress Section */
.selected-actions-progress {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(5, 150, 105, 0.05));
  padding: 2rem;
  border-radius: 1rem;
  border: 2px solid var(--success);
  margin-bottom: 2rem;
}

.selected-actions-progress h3 {
  margin-bottom: 0.5rem;
}

.progress-hint {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.progress-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  cursor: pointer;
}

.progress-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.progress-item span {
  flex: 1;
  transition: all 0.2s;
}

.progress-item span.completed {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.progress-bar-section {
  margin-top: 1.5rem;
}

/* Buttons */
.btn {
  padding: 1rem 2rem;
  font-size: 1.0625rem;
  font-weight: 600;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: block;
  margin: 0 auto;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
}

.btn-large {
  font-size: 1.125rem;
  padding: 1.25rem 2.5rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  font-style: italic;
}

@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: 1fr;
  }
}
</style>
