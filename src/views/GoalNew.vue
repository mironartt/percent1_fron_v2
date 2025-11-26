<template>
  <div class="goal-new-container">
    <header class="page-header">
      <button class="btn btn-secondary btn-back" @click="goBack">
        <span>←</span>
        Назад к списку
      </button>
    </header>

    <div class="edit-layout">
      <div class="main-content">
        <div class="card">
          <div class="card-header">
            <h2>Новая цель</h2>
          </div>

          <div class="form-section">
            <div class="form-group">
              <label class="form-label">Название цели *</label>
              <input 
                type="text"
                :value="goalForm.title"
                @input="updateField('title', $event.target.value)"
                class="form-input form-input-lg"
                placeholder="Например: Выучить английский до B2"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Описание и мотивация</label>
              <textarea 
                :value="goalForm.description"
                @input="updateField('description', $event.target.value)"
                class="form-textarea"
                rows="4"
                placeholder="Почему эта цель важна для вас? Что изменится в вашей жизни?"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Сфера жизни</label>
                <select 
                  :value="goalForm.sphereId"
                  @change="updateField('sphereId', $event.target.value)"
                  class="form-select"
                >
                  <option value="">Выберите сферу</option>
                  <option 
                    v-for="sphere in lifeSpheres" 
                    :key="sphere.id"
                    :value="sphere.id"
                  >
                    {{ sphere.icon }} {{ sphere.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Дедлайн</label>
                <input 
                  type="date"
                  :value="goalForm.deadline"
                  @input="updateField('deadline', $event.target.value)"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">MVP (Минимально жизнеспособный результат)</label>
              <input 
                type="text"
                :value="goalForm.mvp"
                @input="updateField('mvp', $event.target.value)"
                class="form-input"
                placeholder="Какой минимальный результат будет успехом?"
              />
              <span class="form-hint">Определите самый простой вариант достижения цели — что вас уже порадует</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Декомпозиция на шаги</h3>
            <span class="steps-count">{{ goalForm.steps.length }} шагов</span>
          </div>

          <div class="form-hint decomposition-hint">
            Разбейте цель на конкретные действия. Каждый шаг должен быть понятным и выполнимым за 1-4 часа.
          </div>

          <div class="steps-section">
            <div 
              v-for="(step, index) in goalForm.steps" 
              :key="step.id || index"
              class="step-card"
            >
              <div class="step-number-badge">{{ index + 1 }}</div>
              <input 
                type="text"
                :value="step.title"
                @input="updateStep(index, 'title', $event.target.value)"
                class="step-input"
                :placeholder="`Шаг ${index + 1}: что конкретно нужно сделать?`"
              />
              <button 
                class="btn-icon delete"
                @click="removeStep(index)"
                title="Удалить шаг"
              >
                ✕
              </button>
            </div>

            <button class="btn btn-secondary add-step-btn" @click="addStep">
              ➕ Добавить шаг
            </button>
          </div>
        </div>
      </div>

      <div class="sidebar-actions">
<<<<<<< HEAD
        <div class="card sticky-card">
=======
        <div class="ai-coach-section card">
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

        <div class="card">
>>>>>>> origin/main
          <h4>Действия</h4>
          <div class="action-buttons">
            <button class="btn btn-primary btn-lg btn-full" @click="createGoal">
              ✨ Создать цель
            </button>
            <button class="btn btn-secondary btn-full" @click="goBack">
              Отмена
            </button>
          </div>

          <div class="tips-section">
            <h5>Советы по постановке цели</h5>
            <ul class="tips-list">
              <li>Формулируйте цель конкретно и измеримо</li>
              <li>Определите MVP — минимальный результат</li>
              <li>Разбейте на шаги по 1-4 часа каждый</li>
              <li>Укажите дедлайн для мотивации</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
<<<<<<< HEAD

    <AICurator context="decomposition" />
=======
>>>>>>> origin/main
  </div>
</template>

<script setup>
<<<<<<< HEAD
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import AICurator from '../components/AICurator.vue'
=======
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
>>>>>>> origin/main

const router = useRouter()
const store = useAppStore()

const lifeSpheres = computed(() => store.lifeSpheres)

const goalForm = ref({
  title: '',
  description: '',
  sphereId: '',
  deadline: '',
  mvp: '',
  steps: []
})

<<<<<<< HEAD
=======
const chatMessagesRef = ref(null)
const userMessage = ref('')
const chatMessages = ref([
  { role: 'coach', content: 'Привет! Помогу создать цель правильно. Спроси меня о декомпозиции или формулировке.' }
])

const coachResponses = [
  'Хорошая идея! Не забудьте разбить цель на шаги по 1-4 часа.',
  'Попробуйте сформулировать MVP — минимальный результат, который уже порадует.',
  'Каждый шаг должен быть конкретным. Вместо "учить" — "пройти урок 1".',
  'Дедлайн помогает держать фокус. Установите реалистичную дату.',
  'Если цель кажется большой — это нормально. Разбейте её на 3-5 первых шагов.',
  'Подумайте: как вы поймёте, что цель достигнута? Это поможет с формулировкой.',
  'Начните с самого простого шага. Первое действие должно быть лёгким.'
]

async function sendMessage() {
  if (!userMessage.value.trim()) return
  
  chatMessages.value.push({
    role: 'user',
    content: userMessage.value
  })
  
  const userQ = userMessage.value
  userMessage.value = ''
  
  await nextTick()
  scrollToBottom()
  
  setTimeout(() => {
    const randomResponse = coachResponses[Math.floor(Math.random() * coachResponses.length)]
    chatMessages.value.push({
      role: 'coach',
      content: randomResponse
    })
    nextTick(() => scrollToBottom())
  }, 800)
}

function scrollToBottom() {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  }
}

>>>>>>> origin/main
function updateField(field, value) {
  goalForm.value[field] = value
}

function addStep() {
  goalForm.value.steps.push({ 
    id: Date.now().toString(),
    title: '', 
    completed: false 
  })
}

function removeStep(index) {
  goalForm.value.steps.splice(index, 1)
}

function updateStep(index, field, value) {
  goalForm.value.steps[index][field] = value
}

function createGoal() {
  if (!goalForm.value.title.trim()) {
    alert('Введите название цели')
    return
  }

  const filteredSteps = goalForm.value.steps
    .filter(s => s.title.trim())
    .map(s => ({
      id: s.id || Date.now().toString(),
      title: s.title,
      completed: false
    }))

  const goalData = {
    title: goalForm.value.title,
    description: goalForm.value.description,
    sphereId: goalForm.value.sphereId,
    deadline: goalForm.value.deadline,
    mvp: goalForm.value.mvp,
    steps: filteredSteps
  }

  store.addGoal(goalData)
  router.push('/goals')
}

function goBack() {
  router.push('/goals')
}
</script>

<style scoped>
.goal-new-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  align-items: start;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.card-header h2 {
  font-size: 1.5rem;
  margin: 0;
}

.card-header h3 {
  font-size: 1.25rem;
  margin: 0;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-input-lg {
  font-size: 1.25rem;
  padding: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.steps-count {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.decomposition-hint {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.steps-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.step-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
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
  transition: all 0.2s ease;
}

.step-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.add-step-btn {
  margin-top: 0.5rem;
}

.sidebar-actions {
  position: relative;
}

.sticky-card {
  position: sticky;
  top: 2rem;
}

.sticky-card h4 {
  margin-bottom: 1rem;
  font-size: 1rem;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.btn-full {
  width: 100%;
}

.tips-section {
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.tips-section h5 {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tips-list li {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  padding-left: 1.25rem;
  position: relative;
  line-height: 1.4;
}

.tips-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--success-color);
  font-weight: 600;
}

<<<<<<< HEAD
=======
.ai-coach-section {
  margin-bottom: 1rem;
}

.coach-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.coach-header h3 {
  font-size: 1rem;
  margin: 0;
}

.coach-icon {
  font-size: 1.25rem;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 280px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 0.75rem;
}

.message {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.message-avatar {
  font-size: 1rem;
  flex-shrink: 0;
}

.message-content {
  background: var(--bg-primary);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  line-height: 1.4;
  max-width: 90%;
}

.message-content p {
  margin: 0;
}

.user-message {
  flex-direction: row-reverse;
}

.user-message .message-content {
  background: var(--primary-color);
  color: white;
}

.chat-input-area {
  display: flex;
  gap: 0.5rem;
}

.chat-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.chat-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.btn-send {
  padding: 0.5rem 0.75rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s ease;
}

.btn-send:hover:not(:disabled) {
  background: var(--primary-hover);
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

>>>>>>> origin/main
@media (max-width: 1024px) {
  .edit-layout {
    grid-template-columns: 1fr;
  }

  .sidebar-actions {
    order: -1;
  }

  .sticky-card {
    position: static;
  }

  .action-buttons {
    flex-direction: row;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
