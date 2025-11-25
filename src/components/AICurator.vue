<template>
  <div class="ai-curator" :class="{ expanded: isExpanded, minimized: isMinimized }">
    <!-- Minimized state -->
    <div v-if="isMinimized" class="curator-minimized" @click="toggleMinimize">
      <div class="minimized-icon">🤖</div>
      <div class="minimized-text">ИИ-Куратор</div>
      <div v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</div>
    </div>

    <!-- Expanded state -->
    <div v-else class="curator-panel">
      <div class="curator-header">
        <div class="curator-title">
          <span class="curator-icon">🤖</span>
          <h3>ИИ-Куратор</h3>
        </div>
        <div class="curator-actions">
          <button class="btn-minimize" @click="toggleExpanded" :title="isExpanded ? 'Свернуть' : 'Развернуть'">
            {{ isExpanded ? '−' : '□' }}
          </button>
          <button class="btn-minimize" @click="toggleMinimize" title="Скрыть">
            ✕
          </button>
        </div>
      </div>

      <div class="curator-status">
        <span class="status-dot"></span>
        <span>Готов помочь</span>
      </div>

      <div class="chat-messages" ref="messagesContainer">
        <div v-if="messages.length === 0" class="welcome-message">
          <p>👋 Привет! Я ваш ИИ-куратор.</p>
          <p>Задавайте вопросы по упражнениям, делитесь размышлениями или просто спрашивайте совета.</p>
        </div>

        <div
          v-for="message in messages"
          :key="message.id"
          class="message"
          :class="message.role"
        >
          <div class="message-content">
            <div v-if="message.role === 'assistant'" class="message-avatar">🤖</div>
            <div class="message-bubble">
              <div class="message-text">{{ message.content }}</div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
            <div v-if="message.role === 'user'" class="message-avatar user">👤</div>
          </div>
        </div>

        <div v-if="isLoading" class="message assistant">
          <div class="message-content">
            <div class="message-avatar">🤖</div>
            <div class="message-bubble">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <textarea
          v-model="inputMessage"
          @keydown.enter.exact.prevent="sendMessage"
          @keydown.enter.shift.exact="inputMessage += '\n'"
          placeholder="Задайте вопрос..."
          rows="1"
          class="input-field"
        ></textarea>
        <button
          class="btn-send"
          @click="sendMessage"
          :disabled="!inputMessage.trim() || isLoading"
        >
          <span>📤</span>
        </button>
      </div>

      <div class="quick-prompts">
        <button
          v-for="prompt in quickPrompts"
          :key="prompt"
          class="quick-prompt-btn"
          @click="useQuickPrompt(prompt)"
        >
          {{ prompt }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue'

const props = defineProps({
  context: {
    type: String,
    default: 'general'
  }
})

const isExpanded = ref(false)
const isMinimized = ref(false)
const inputMessage = ref('')
const messages = ref([])
const isLoading = ref(false)
const unreadCount = ref(0)
const messagesContainer = ref(null)

const contextPrompts = {
  general: [
    'Как оценить сферу жизни?',
    'Что такое истинная цель?',
    'Помоги выбрать приоритеты'
  ],
  decomposition: [
    'Как правильно декомпозировать цель?',
    'Сколько шагов должно быть?',
    'Как определить MVP цели?'
  ],
  ssp: [
    'Что такое ССП?',
    'Как работает колесо баланса?',
    'Помоги оценить сферы'
  ]
}

const quickPrompts = computed(() => {
  return contextPrompts[props.context] || contextPrompts.general
})

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}

function toggleMinimize() {
  isMinimized.value = !isMinimized.value
  if (!isMinimized.value) {
    unreadCount.value = 0
  }
}

async function sendMessage() {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userMessage = {
    id: Date.now(),
    role: 'user',
    content: inputMessage.value.trim(),
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  inputMessage.value = ''
  isLoading.value = true

  scrollToBottom()

  try {
    const response = await callAI(userMessage.content)
    
    const assistantMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: response,
      timestamp: new Date()
    }

    messages.value.push(assistantMessage)

    if (isMinimized.value) {
      unreadCount.value++
    }
  } catch (error) {
    console.error('Error calling AI:', error)
    messages.value.push({
      id: Date.now() + 1,
      role: 'assistant',
      content: 'Извините, произошла ошибка. Попробуйте позже.',
      timestamp: new Date()
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

async function callAI(message) {
  return getDemoResponse(message)
}

function getDemoResponse(message) {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('оценить') || lowerMessage.includes('сферу')) {
    return 'Оцените каждую сферу от 0 до 10, где 0 - полное отсутствие результатов, а 10 - идеальное состояние. Будьте честны с собой - это ваша точка отсчета для роста.'
  }
  
  if (lowerMessage.includes('истинная') || lowerMessage.includes('цель')) {
    return 'Истинная цель - та, что откликается внутри вас. Спросите себя: "Я хочу это для себя или чтобы кому-то что-то доказать?" Если чувствуете радость при мысли о достижении - цель ваша.'
  }
  
  if (lowerMessage.includes('приоритет') || lowerMessage.includes('выбрать')) {
    return 'Выбирайте 3-5 целей по принципу максимального эффекта. Какие цели, если их достичь, сильнее всего изменят вашу жизнь к лучшему? Начните с них.'
  }
  
  if (lowerMessage.includes('баланс')) {
    return 'Баланс - это когда ни одна сфера жизни не проседает критически. Проверьте: нет ли у вас оценок ниже 3? Это зоны, требующие срочного внимания.'
  }
  
  if (lowerMessage.includes('декомпозир') || lowerMessage.includes('разбить')) {
    return 'Декомпозиция цели - это разбивка большой цели на маленькие шаги. Хорошая декомпозиция отвечает на вопрос "Что конкретно я делаю завтра?". Каждый шаг должен быть понятным действием, которое можно выполнить за 1-4 часа.'
  }
  
  if (lowerMessage.includes('шаг') && (lowerMessage.includes('сколько') || lowerMessage.includes('много'))) {
    return 'Оптимальное количество шагов - от 5 до 15. Меньше - возможно, шаги слишком крупные и их нужно разбить. Больше - цель слишком масштабная, стоит выделить MVP и начать с него.'
  }
  
  if (lowerMessage.includes('mvp') || lowerMessage.includes('минимальн')) {
    return 'MVP (Minimum Viable Product) для цели - это минимальный результат, который уже считается успехом. Например, для "Выучить английский" MVP может быть "Провести 5-минутный разговор с носителем". Определите: какой минимум вас уже порадует?'
  }
  
  if (lowerMessage.includes('правильн') && lowerMessage.includes('декомпоз')) {
    return 'Правильная декомпозиция:\n1. Определите конечный результат (что именно хотите получить)\n2. Выделите MVP - минимальный жизнеспособный результат\n3. Разбейте путь к MVP на конкретные шаги\n4. Каждый шаг = конкретное действие (глагол + объект)\n5. Проверьте: можно ли каждый шаг сделать за 1-4 часа?'
  }
  
  return `Отличный вопрос! ${message.includes('?') ? 'Давайте разберемся вместе.' : 'Продолжайте работать с упражнением.'} Помните: каждый шаг приближает вас к вашей Точке Б. Что именно вас сейчас волнует больше всего?`
}

function useQuickPrompt(prompt) {
  inputMessage.value = prompt
  sendMessage()
}

function formatTime(date) {
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}
</script>

<style scoped>
.ai-curator {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 100;
  transition: all 0.3s ease;
}

.curator-minimized {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border-radius: 50px;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.curator-minimized:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

.minimized-icon {
  font-size: 1.5rem;
}

.minimized-text {
  font-weight: 600;
  font-size: 1rem;
}

.unread-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: var(--danger-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

.curator-panel {
  width: 400px;
  max-height: 600px;
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.ai-curator.expanded .curator-panel {
  max-height: 80vh;
  width: 500px;
}

.curator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
}

.curator-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.curator-icon {
  font-size: 1.75rem;
}

.curator-title h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.curator-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-minimize {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-minimize:hover {
  background: rgba(255, 255, 255, 0.3);
}

.curator-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--bg-secondary);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success-color);
  animation: pulse 2s infinite;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.welcome-message {
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem 1rem;
}

.welcome-message p {
  margin-bottom: 0.75rem;
}

.message {
  display: flex;
  flex-direction: column;
}

.message-content {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
}

.message.user .message-content {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.message-avatar.user {
  background: var(--secondary-color);
}

.message-bubble {
  max-width: 70%;
  padding: 0.875rem 1.125rem;
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
}

.message.user .message-bubble {
  background: var(--primary-color);
  color: white;
}

.message-text {
  line-height: 1.5;
  font-size: 0.9375rem;
}

.message-time {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 0.5rem;
  text-align: right;
}

.message.user .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.typing-indicator {
  display: flex;
  gap: 0.375rem;
  padding: 0.5rem 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-secondary);
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-4px);
  }
}

.chat-input {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

.input-field {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  resize: none;
  max-height: 100px;
  font-family: inherit;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-color);
}

.btn-send {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--primary-color);
  color: white;
  cursor: pointer;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-send:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quick-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

.quick-prompt-btn {
  padding: 0.5rem 0.875rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.quick-prompt-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

@media (max-width: 768px) {
  .ai-curator {
    bottom: 1rem;
    right: 1rem;
  }

  .curator-panel {
    width: calc(100vw - 2rem);
    max-width: 400px;
  }

  .ai-curator.expanded .curator-panel {
    width: calc(100vw - 2rem);
    max-width: none;
  }
}
</style>
