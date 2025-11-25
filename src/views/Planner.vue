<template>
  <div class="planner-container">
    <header class="page-header">
      <div>
        <h1>Планировщик</h1>
        <p class="subtitle">
          Системное управление временем, вниманием и энергией
        </p>
      </div>
      <div class="date-display">
        <span class="date-icon">📅</span>
        <span>{{ formattedDate }}</span>
      </div>
    </header>

    <div class="planner-tabs">
      <button 
        class="tab-btn"
        :class="{ active: activeTab === 'day' }"
        @click="activeTab = 'day'"
      >
        📆 Сегодня
      </button>
      <button 
        class="tab-btn"
        :class="{ active: activeTab === 'week' }"
        @click="activeTab = 'week'"
      >
        📊 Неделя
      </button>
      <button 
        class="tab-btn"
        :class="{ active: activeTab === 'energy' }"
        @click="activeTab = 'energy'"
      >
        ⚡ Энергия
      </button>
    </div>

    <!-- Daily Planning Tab -->
    <div v-show="activeTab === 'day'" class="tab-content">
      <div class="planner-grid">
        <div class="card priorities-card">
          <div class="card-header">
            <h3 class="card-title">🎯 Топ-3 приоритета дня</h3>
          </div>
          <div class="card-body">
            <p class="info-text">
              Определите 3 самые важные задачи, которые приблизят вас к целям
            </p>
            <div class="priorities-list">
              <div 
                v-for="(priority, index) in dailyPlan.topPriorities" 
                :key="index"
                class="priority-item"
              >
                <span class="priority-number">{{ index + 1 }}</span>
                <input 
                  type="text"
                  v-model="priority.title"
                  class="form-input"
                  :placeholder="`Приоритет ${index + 1}`"
                  @blur="saveDailyPlan"
                />
                <button 
                  class="btn-icon delete"
                  @click="removePriority(index)"
                  v-if="dailyPlan.topPriorities.length > 1"
                >
                  ✕
                </button>
              </div>
            </div>
            <button 
              v-if="dailyPlan.topPriorities.length < 3"
              class="btn btn-secondary btn-sm"
              @click="addPriority"
            >
              ➕ Добавить приоритет
            </button>
          </div>
        </div>

        <div class="card tasks-card">
          <div class="card-header">
            <h3 class="card-title">✅ Задачи дня</h3>
            <button class="btn btn-sm btn-primary" @click="showAddTaskModal = true">
              ➕ Задача
            </button>
          </div>
          <div class="card-body">
            <div v-if="dailyPlan.tasks.length === 0" class="empty-message">
              Добавьте задачи на сегодня
            </div>
            <div v-else class="tasks-list">
              <label 
                v-for="task in dailyPlan.tasks" 
                :key="task.id"
                class="task-item"
              >
                <input 
                  type="checkbox"
                  v-model="task.completed"
                  @change="saveDailyPlan"
                />
                <span :class="{ completed: task.completed }">{{ task.title }}</span>
                <button 
                  class="btn-icon delete"
                  @click.prevent="deleteTask(task.id)"
                >
                  🗑️
                </button>
              </label>
            </div>
            <div class="tasks-summary">
              Выполнено: {{ completedTasksCount }} / {{ dailyPlan.tasks.length }}
            </div>
          </div>
        </div>
      </div>

      <div class="reflections-grid">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">🌅 Утренняя рефлексия</h3>
          </div>
          <div class="card-body">
            <textarea 
              v-model="dailyPlan.morningReflection"
              class="form-textarea"
              rows="4"
              placeholder="Как я себя чувствую? Что важно сделать сегодня? Какой настрой?"
              @blur="saveDailyPlan"
            ></textarea>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">🌙 Вечерняя рефлексия</h3>
          </div>
          <div class="card-body">
            <textarea 
              v-model="dailyPlan.eveningReflection"
              class="form-textarea"
              rows="4"
              placeholder="Что удалось сделать? Какие инсайты? Что можно улучшить завтра?"
              @blur="saveDailyPlan"
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly Planning Tab -->
    <div v-show="activeTab === 'week'" class="tab-content">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">📊 План недели</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">Фокусные цели недели</label>
            <p class="info-text">Выберите 1-3 цели, на которых сфокусируетесь на этой неделе</p>
            <div class="goals-selector">
              <label 
                v-for="goal in activeGoalsList" 
                :key="goal.id"
                class="goal-checkbox"
              >
                <input 
                  type="checkbox"
                  :value="goal.id"
                  v-model="weeklyPlan.focusGoals"
                  @change="saveWeeklyPlan"
                />
                <span>{{ goal.title }}</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Ключевые результаты недели</label>
            <textarea 
              v-model="weeklyPlan.keyResults"
              class="form-textarea"
              rows="4"
              placeholder="Каких конкретных результатов хотите достичь за неделю?"
              @blur="saveWeeklyPlan"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Потенциальные препятствия</label>
            <textarea 
              v-model="weeklyPlan.obstacles"
              class="form-textarea"
              rows="3"
              placeholder="Что может помешать? Как это предотвратить?"
              @blur="saveWeeklyPlan"
            ></textarea>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">📝 Итоги недели</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">Что удалось достичь?</label>
            <textarea 
              v-model="weeklyPlan.achievements"
              class="form-textarea"
              rows="3"
              placeholder="Зафиксируйте свои достижения"
              @blur="saveWeeklyPlan"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Главные инсайты</label>
            <textarea 
              v-model="weeklyPlan.insights"
              class="form-textarea"
              rows="3"
              placeholder="Что вы поняли о себе, своих целях, своих подходах?"
              @blur="saveWeeklyPlan"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Что улучшить на следующей неделе?</label>
            <textarea 
              v-model="weeklyPlan.improvements"
              class="form-textarea"
              rows="3"
              placeholder="Какие корректировки внести?"
              @blur="saveWeeklyPlan"
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- Energy Management Tab -->
    <div v-show="activeTab === 'energy'" class="tab-content">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">⚡ Контур энергии</h3>
        </div>
        <div class="card-body">
          <p class="info-text">
            Оцените свой уровень энергии по трем контурам для эффективного управления ресурсом
          </p>

          <div class="energy-levels">
            <div class="energy-item">
              <div class="energy-header">
                <span class="energy-icon">💪</span>
                <div>
                  <h4>Тело (физическая энергия)</h4>
                  <p>Сон, питание, движение, восстановление</p>
                </div>
              </div>
              <div class="energy-slider">
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  v-model.number="energyLevels.body"
                  @change="saveEnergyLevels"
                  class="slider"
                />
                <span class="energy-value">{{ energyLevels.body }}/10</span>
              </div>
            </div>

            <div class="energy-item">
              <div class="energy-header">
                <span class="energy-icon">🧠</span>
                <div>
                  <h4>Разум (ментальная энергия)</h4>
                  <p>Фокус, ясность, концентрация, отсутствие перегрузки</p>
                </div>
              </div>
              <div class="energy-slider">
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  v-model.number="energyLevels.mind"
                  @change="saveEnergyLevels"
                  class="slider"
                />
                <span class="energy-value">{{ energyLevels.mind }}/10</span>
              </div>
            </div>

            <div class="energy-item">
              <div class="energy-header">
                <span class="energy-icon">❤️</span>
                <div>
                  <h4>Смысл (эмоциональная энергия)</h4>
                  <p>Мотивация, вдохновение, связь с целями</p>
                </div>
              </div>
              <div class="energy-slider">
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  v-model.number="energyLevels.meaning"
                  @change="saveEnergyLevels"
                  class="slider"
                />
                <span class="energy-value">{{ energyLevels.meaning }}/10</span>
              </div>
            </div>
          </div>

          <div class="energy-summary">
            <div class="summary-score">
              <span class="summary-label">Общий уровень энергии:</span>
              <span class="summary-value">{{ averageEnergy }}/10</span>
            </div>
            <p class="summary-advice">{{ getEnergyAdvice() }}</p>
          </div>

          <div class="form-group">
            <label class="form-label">Заметки по энергии</label>
            <textarea 
              v-model="energyLevels.notes"
              class="form-textarea"
              rows="3"
              placeholder="Что влияет на вашу энергию? Что помогает восстановиться?"
              @blur="saveEnergyLevels"
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Task Modal -->
    <transition name="fade">
      <div v-if="showAddTaskModal" class="modal-overlay" @click.self="showAddTaskModal = false">
        <div class="modal">
          <div class="modal-header">
            <h2>Новая задача</h2>
            <button class="btn-close" @click="showAddTaskModal = false">✕</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Название задачи</label>
              <input 
                type="text"
                v-model="newTask"
                class="form-input"
                placeholder="Что нужно сделать?"
                @keyup.enter="addTask"
              />
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showAddTaskModal = false">Отмена</button>
            <button class="btn btn-primary" @click="addTask">Добавить</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()

const activeTab = ref('day')
const showAddTaskModal = ref(false)
const newTask = ref('')

const dailyPlan = computed(() => store.dailyPlan)
const weeklyPlan = computed(() => store.weeklyPlan)
const activeGoalsList = computed(() => store.goals.filter(g => g.status === 'active'))

const energyLevels = ref({
  body: 5,
  mind: 5,
  meaning: 5,
  notes: ''
})

const formattedDate = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('ru-RU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const completedTasksCount = computed(() => {
  return dailyPlan.value.tasks.filter(t => t.completed).length
})

const averageEnergy = computed(() => {
  const avg = (energyLevels.value.body + energyLevels.value.mind + energyLevels.value.meaning) / 3
  return Math.round(avg * 10) / 10
})

function addPriority() {
  if (dailyPlan.value.topPriorities.length < 3) {
    dailyPlan.value.topPriorities.push({ title: '' })
  }
}

function removePriority(index) {
  dailyPlan.value.topPriorities.splice(index, 1)
  saveDailyPlan()
}

function addTask() {
  if (newTask.value.trim()) {
    store.addTask({ title: newTask.value.trim() })
    newTask.value = ''
    showAddTaskModal.value = false
  }
}

function deleteTask(taskId) {
  const index = dailyPlan.value.tasks.findIndex(t => t.id === taskId)
  if (index !== -1) {
    dailyPlan.value.tasks.splice(index, 1)
    saveDailyPlan()
  }
}

function saveDailyPlan() {
  store.updateDailyPlan(dailyPlan.value)
}

function saveWeeklyPlan() {
  store.updateWeeklyPlan(weeklyPlan.value)
}

function saveEnergyLevels() {
  // Save to localStorage or store
  localStorage.setItem('onepercent-energy', JSON.stringify(energyLevels.value))
}

function loadEnergyLevels() {
  const saved = localStorage.getItem('onepercent-energy')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      energyLevels.value = { ...energyLevels.value, ...parsed }
    } catch (e) {
      console.error('Error loading energy levels:', e)
    }
  }
}

function getEnergyAdvice() {
  const avg = averageEnergy.value
  if (avg >= 8) return '🔥 Отличное состояние! Используйте высокую энергию для важных задач'
  if (avg >= 6) return '✅ Хороший уровень энергии. Продолжайте в том же духе'
  if (avg >= 4) return '⚠️ Энергия снижена. Уделите внимание восстановлению'
  return '🚨 Критически низкая энергия. Необходим отдых и восстановление'
}

// Initialize
if (dailyPlan.value.topPriorities.length === 0) {
  dailyPlan.value.topPriorities = [{ title: '' }, { title: '' }, { title: '' }]
}

loadEnergyLevels()
</script>

<style scoped>
.planner-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
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

.date-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  font-weight: 500;
}

.date-icon {
  font-size: 1.25rem;
}

.planner-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid var(--border-color);
}

.tab-btn {
  padding: 0.875rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-weight: 500;
  font-size: 0.9375rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: -2px;
}

.tab-btn:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.tab-btn.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.tab-content {
  animation: fadeIn 0.3s ease;
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

.planner-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.info-text {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.priorities-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.priority-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.priority-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  flex-shrink: 0;
}

.priority-item .form-input {
  flex: 1;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.task-item:hover {
  background: var(--bg-tertiary);
}

.task-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  flex-shrink: 0;
}

.task-item span {
  flex: 1;
  font-size: 0.9375rem;
}

.task-item span.completed {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.tasks-summary {
  padding: 0.75rem 1rem;
  background: rgba(99, 102, 241, 0.05);
  border-radius: var(--radius-md);
  text-align: center;
  font-weight: 500;
  color: var(--primary-color);
}

.empty-message {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  font-style: italic;
}

.reflections-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.goals-selector {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.goal-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.goal-checkbox:hover {
  background: var(--bg-tertiary);
}

.goal-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.energy-levels {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 1.5rem 0;
}

.energy-item {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.energy-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.energy-icon {
  font-size: 2rem;
}

.energy-header h4 {
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
}

.energy-header p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.energy-slider {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.energy-slider .slider {
  flex: 1;
}

.energy-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-color);
  min-width: 60px;
  text-align: right;
}

.energy-summary {
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
  border-radius: var(--radius-lg);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.summary-score {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.summary-label {
  font-size: 1.125rem;
  font-weight: 600;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.summary-advice {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .planner-grid,
  .reflections-grid {
    grid-template-columns: 1fr;
  }

  .date-display {
    width: 100%;
  }
}
</style>
