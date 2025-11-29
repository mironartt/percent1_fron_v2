<template>
  <div class="mentor-widget">
    <div class="mentor-header">
      <div class="mentor-avatar">
        <Bot :size="24" :stroke-width="1.5" />
      </div>
      <div class="mentor-info">
        <h3>AI Ментор</h3>
        <span class="mentor-status">
          <span class="status-dot"></span>
          Онлайн
        </span>
      </div>
      <button 
        v-if="messages.length > 0" 
        class="clear-btn"
        @click="clearChat"
        title="Очистить чат"
      >
        <Trash2 :size="16" :stroke-width="1.5" />
      </button>
    </div>

    <div class="chat-container" ref="chatContainer">
      <div v-if="messages.length === 0" class="welcome-message">
        <div class="welcome-icon">
          <Sparkles :size="32" :stroke-width="1.5" />
        </div>
        <h4>Добро пожаловать!</h4>
        <p>Я ваш персональный AI-ментор. Помогу разобраться в целях, подскажу следующие шаги и отвечу на вопросы.</p>
        <div class="quick-prompts">
          <button 
            v-for="prompt in quickPrompts" 
            :key="prompt.id"
            class="quick-prompt-btn"
            @click="sendQuickPrompt(prompt.text)"
          >
            <component :is="prompt.icon" :size="14" :stroke-width="1.5" />
            {{ prompt.label }}
          </button>
        </div>
      </div>

      <div v-else class="messages-list">
        <div 
          v-for="msg in messages" 
          :key="msg.id"
          :class="['message', msg.role]"
        >
          <div v-if="msg.role === 'assistant'" class="message-avatar">
            <Bot :size="16" :stroke-width="1.5" />
          </div>
          <div class="message-bubble">
            <p v-html="formatMessage(msg.content)"></p>
            <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
          </div>
        </div>

        <div v-if="isTyping" class="message assistant">
          <div class="message-avatar">
            <Bot :size="16" :stroke-width="1.5" />
          </div>
          <div class="message-bubble typing">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        </div>
      </div>
    </div>

    <form class="input-container" @submit.prevent="sendMessage">
      <input
        v-model="inputText"
        type="text"
        placeholder="Напишите сообщение..."
        :disabled="isTyping"
        ref="inputRef"
      />
      <button 
        type="submit" 
        class="send-btn"
        :disabled="!inputText.trim() || isTyping"
      >
        <Send :size="18" :stroke-width="1.5" />
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, markRaw } from 'vue'
import { useAppStore } from '../stores/app'
import { Bot, Sparkles, Send, Trash2, Target, Lightbulb, Calendar, BookOpen } from 'lucide-vue-next'

const store = useAppStore()

const inputText = ref('')
const isTyping = ref(false)
const chatContainer = ref(null)
const inputRef = ref(null)

const messages = computed(() => store.mentor.messages)

const quickPrompts = [
  { id: 1, icon: markRaw(Target), label: 'С чего начать?', text: 'С чего мне начать работу над целями?' },
  { id: 2, icon: markRaw(Lightbulb), label: 'Как ставить цели?', text: 'Как правильно формулировать цели?' },
  { id: 3, icon: markRaw(Calendar), label: 'Планирование', text: 'Как эффективно планировать неделю?' },
  { id: 4, icon: markRaw(BookOpen), label: 'О методе 1%', text: 'Расскажи о методе 1% улучшений' }
]

const demoResponses = {
  default: `Отличный вопрос! Я помогу вам разобраться.

Для начала рекомендую:
1. Оценить текущее состояние жизни через модуль ССП (Сбалансированная система показателей)
2. Записать все идеи целей в Банк Целей
3. Выбрать 1-3 ключевые цели для работы

Что из этого вас интересует больше всего?`,

  'С чего начать': `Рад помочь с первыми шагами! Вот оптимальный путь:

**1. Оцените свою жизнь (ССП)**
Пройдите модуль «Сбалансированная система» — это займет 10-15 минут. Вы оцените 8 сфер жизни и увидите, где нужны улучшения.

**2. Соберите идеи целей**
В «Банке Целей» запишите все, чего хотите достичь. Не фильтруйте — записывайте всё!

**3. Выберите фокус**
Из всех идей выберите 1-3 главные цели на ближайший период.

Начните с модуля ССП — он даст понимание приоритетов.`,

  'Как правильно формулировать': `Хороший вопрос о формулировке целей!

**Используйте принцип SMART:**
• **S** (Specific) — Конкретная: «Пробежать 5 км» вместо «Заняться бегом»
• **M** (Measurable) — Измеримая: как вы поймёте, что достигли?
• **A** (Achievable) — Достижимая: реально ли это сейчас?
• **R** (Relevant) — Актуальная: зачем вам это?
• **T** (Time-bound) — Ограниченная во времени: к какой дате?

**Пример:**
Вместо: «Хочу выучить английский»
Лучше: «К 1 марта пройти курс B1 и сдать тест на 80%»

Хотите попрактиковаться с вашей целью?`,

  'Как эффективно планировать': `Планирование недели — ключ к прогрессу!

**Метод еженедельного планирования:**

1. **Воскресенье вечером (15 мин)**
   • Посмотрите на ключевые цели
   • Выберите 2-3 главные задачи недели
   • Распределите их по дням

2. **Каждое утро (5 мин)**
   • Проверьте план на день
   • Выберите 1-3 приоритетные задачи
   • Начните с самой важной

3. **Вечером (5 мин)**
   • Отметьте выполненное
   • Запишите в дневник рефлексию
   • Скорректируйте план на завтра

**Правило 1%:** Достаточно делать одну маленькую задачу в день!`,

  'О методе 1%': `**Философия 1% улучшений**

Это принцип, что маленькие ежедневные улучшения приводят к огромным результатам.

**Математика:**
• 1% улучшения каждый день = 37x рост за год
• 1% ухудшения каждый день = почти 0 через год

**Как применять:**
1. Не пытайтесь изменить всё сразу
2. Выберите одну маленькую привычку
3. Делайте её каждый день
4. Добавляйте новую только когда первая стала автоматической

**Примеры 1% действий:**
• 5 минут чтения
• 1 отжимание
• 1 благодарность в дневнике
• 1 новое слово на иностранном

Какую привычку хотите внедрить первой?`
}

function findResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase()
  
  for (const [key, response] of Object.entries(demoResponses)) {
    if (key !== 'default' && lowerMessage.includes(key.toLowerCase())) {
      return response
    }
  }
  
  return demoResponses.default
}

function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

async function sendMessage() {
  if (!inputText.value.trim() || isTyping.value) return
  
  const userText = inputText.value.trim()
  inputText.value = ''
  
  store.sendMentorMessage(userText)
  
  await nextTick()
  scrollToBottom()
  
  isTyping.value = true
  
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
  
  const response = findResponse(userText)
  store.sendMentorMessage(response, 'assistant')
  
  isTyping.value = false
  
  await nextTick()
  scrollToBottom()
}

function sendQuickPrompt(text) {
  inputText.value = text
  sendMessage()
}

function clearChat() {
  store.clearMentorMessages()
}

function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

watch(messages, () => {
  nextTick(() => scrollToBottom())
}, { deep: true })

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.mentor-widget {
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 500px;
  overflow: hidden;
}

.mentor-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.mentor-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.mentor-info {
  flex: 1;
}

.mentor-info h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.mentor-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
}

.clear-btn {
  background: transparent;
  border: none;
  padding: 8px;
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.welcome-message {
  text-align: center;
  padding: 24px 16px;
}

.welcome-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
}

.welcome-message h4 {
  margin: 0 0 8px;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.welcome-message p {
  margin: 0 0 20px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.quick-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.quick-prompt-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  font-size: 0.8rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.quick-prompt-btn:hover {
  background: var(--bg-hover);
  border-color: var(--primary-color);
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  gap: 8px;
  max-width: 85%;
}

.message.user {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.message-bubble {
  padding: 10px 14px;
  border-radius: 16px;
  position: relative;
}

.message.assistant .message-bubble {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-bottom-left-radius: 4px;
}

.message.user .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.message-bubble p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

.message-time {
  display: block;
  font-size: 0.7rem;
  opacity: 0.7;
  margin-top: 4px;
}

.message-bubble.typing {
  display: flex;
  gap: 4px;
  padding: 14px 18px;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: var(--text-secondary);
  border-radius: 50%;
  animation: typingBounce 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes typingBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.input-container {
  display: flex;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.input-container input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 24px;
  background: var(--card-bg);
  font-size: 0.9rem;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s;
}

.input-container input:focus {
  border-color: var(--primary-color);
}

.input-container input::placeholder {
  color: var(--text-secondary);
}

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s, transform 0.2s;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
