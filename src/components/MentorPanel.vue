<template>
  <div class="mentor-panel-wrapper">
    <div 
      v-if="isMobileOpen" 
      class="mentor-overlay"
      @click="closeMobile"
    ></div>
    
    <button 
      v-if="isMobile && !isMobileOpen"
      class="mentor-mobile-btn"
      @click="toggleMobile"
    >
      <Bot :size="24" :stroke-width="1.5" />
      <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
    </button>
    
    <div :class="['mentor-panel', { collapsed: isCollapsed && !isMobile, 'mobile-open': isMobileOpen }]">
      <div v-if="isCollapsed && !isMobile" class="collapsed-content" @click="togglePanel">
        <div class="collapsed-avatar">
          <Bot :size="20" :stroke-width="1.5" />
          <span v-if="unreadCount > 0" class="unread-badge-collapsed">{{ unreadCount }}</span>
        </div>
        <span class="collapsed-label">AI Ментор</span>
        <div class="collapsed-indicator" :class="{ 'has-messages': messages.length > 0 || unreadCount > 0 }">
          <MessageCircle :size="14" :stroke-width="1.5" />
        </div>
        <ChevronLeft :size="16" :stroke-width="1.5" class="collapsed-arrow" />
      </div>

      <div v-else class="panel-content">
      <div class="panel-header">
        <div class="header-left">
          <div class="mentor-avatar">
            <Bot :size="20" :stroke-width="1.5" />
          </div>
          <div class="mentor-info">
            <h3>AI Ментор</h3>
            <span class="mentor-status">
              <span class="status-dot"></span>
              Онлайн
            </span>
          </div>
        </div>
        <div class="header-actions">
          <button 
            class="icon-btn collapse-btn"
            @click="togglePanel"
            title="Свернуть панель"
          >
            <PanelRightClose :size="18" :stroke-width="1.5" />
          </button>
        </div>
      </div>

      <div class="chat-container" ref="chatContainer">
        <div v-if="messages.length === 0" class="welcome-message">
          <div class="welcome-icon">
            <Sparkles :size="40" :stroke-width="1.5" />
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
        <textarea
          v-model="inputText"
          placeholder="Напишите сообщение..."
          :disabled="isTyping"
          ref="inputRef"
          rows="3"
          @keydown.enter.exact.prevent="sendMessage"
          @keydown.enter.shift.exact="() => {}"
        ></textarea>
        <button 
          type="submit" 
          class="send-btn"
          :disabled="!inputText.trim() || isTyping"
        >
          <Send :size="18" :stroke-width="1.5" />
        </button>
      </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted, markRaw } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '../stores/app'
import { useXpStore } from '../stores/xp'
import { 
  Bot, 
  Sparkles, 
  Send, 
  Trash2, 
  Target, 
  Lightbulb, 
  Calendar, 
  BookOpen,
  Star,
  PanelRightClose,
  MessageCircle,
  ChevronLeft,
  X
} from 'lucide-vue-next'

const route = useRoute()
const store = useAppStore()
const xpStore = useXpStore()

const inputText = ref('')
const isTyping = ref(false)
const chatContainer = ref(null)
const inputRef = ref(null)
const isMobile = ref(false)

const messages = computed(() => store.mentor.messages)
const isCollapsed = computed(() => store.mentorPanelCollapsed)
const isMobileOpen = computed(() => store.mentorMobileOpen)
const unreadCount = computed(() => store.unreadMentorCount)

function checkMobile() {
  isMobile.value = window.innerWidth < 1024
  store.setMentorIsMobile(isMobile.value)
  if (!isMobile.value) {
    store.closeMentorMobile()
    document.body.style.overflow = ''
  }
}

function toggleMobile() {
  if (isMobileOpen.value) {
    store.closeMentorMobile()
    document.body.style.overflow = ''
  } else {
    store.openMentorMobile()
    document.body.style.overflow = 'hidden'
  }
}

function closeMobile() {
  store.closeMentorMobile()
  document.body.style.overflow = ''
}

const quickPrompts = computed(() => {
  const basePrompts = [
    { id: 1, icon: markRaw(Target), label: 'С чего начать?', text: 'С чего мне начать работу над целями?' },
    { id: 2, icon: markRaw(Lightbulb), label: 'Как ставить цели?', text: 'Как правильно формулировать цели?' },
    { id: 3, icon: markRaw(Calendar), label: 'Планирование', text: 'Как эффективно планировать неделю?' },
    { id: 4, icon: markRaw(BookOpen), label: 'О методе 1%', text: 'Расскажи о методе 1% улучшений' }
  ]
  
  if (xpStore && xpStore.nextReward) {
    basePrompts.push({
      id: 5,
      icon: markRaw(Star),
      label: `До награды: ${xpStore.xpToNextReward} XP`,
      text: `Как быстрее заработать ${xpStore.xpToNextReward} XP до награды "${xpStore.nextReward.name}"?`
    })
  }
  
  return basePrompts
})

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

function togglePanel() {
  if (isMobile.value) {
    closeMobile()
  } else {
    store.toggleMentorPanel()
  }
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

watch(isMobileOpen, (newValue) => {
  document.body.style.overflow = newValue ? 'hidden' : ''
})

watch(() => route.path, () => {
  if (isMobile.value && isMobileOpen.value) {
    closeMobile()
  }
})

onMounted(() => {
  scrollToBottom()
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.mentor-panel-wrapper {
  position: relative;
  z-index: 100;
}

.mentor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.mentor-mobile-btn {
  display: none;
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
  align-items: center;
  justify-content: center;
}

.mentor-mobile-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 24px rgba(102, 126, 234, 0.5);
}

.mentor-mobile-btn.active {
  background: var(--bg-secondary);
  color: var(--text-primary);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #ef4444;
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  animation: pulse-badge 2s ease-in-out infinite;
}

.unread-badge-collapsed {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  animation: pulse-badge 2s ease-in-out infinite;
}

@keyframes pulse-badge {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.mentor-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  background: var(--card-bg);
  border-left: 1px solid var(--border-color);
  border-radius: 0;
  display: flex;
  flex-direction: column;
  width: 460px;
  transition: width 0.3s ease, transform 0.3s ease;
  z-index: 999;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.08);
}

.mentor-panel.collapsed {
  width: 56px;
}

.collapsed-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px 8px;
  cursor: pointer;
  height: 100%;
}

.collapsed-avatar {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}

.collapsed-content:hover .collapsed-avatar {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.collapsed-label {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.5px;
}

.collapsed-indicator {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.collapsed-indicator.has-messages {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
}

.collapsed-arrow {
  color: var(--text-secondary);
  margin-top: auto;
  transition: transform 0.2s;
}

.collapsed-content:hover .collapsed-arrow {
  transform: translateX(-2px);
}

.panel-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mentor-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.mentor-info h3 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
}

.mentor-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon-btn {
  background: transparent;
  border: none;
  padding: 8px;
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
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
  padding: 32px 16px;
}

.welcome-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
}

.welcome-message h4 {
  margin: 0 0 12px;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.welcome-message p {
  margin: 0 0 24px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.quick-prompts {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-prompt-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 0.875rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
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
  max-width: 90%;
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
  font-size: 0.875rem;
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
  flex-shrink: 0;
}

.input-container textarea {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--card-bg);
  font-size: 0.875rem;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s;
  resize: none;
  font-family: inherit;
  line-height: 1.5;
  min-height: 72px;
}

.input-container textarea:focus {
  border-color: var(--primary-color);
}

.input-container textarea::placeholder {
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
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .mentor-mobile-btn {
    display: flex;
  }
  
  .mentor-panel {
    transform: translateX(100%);
    width: 100%;
    max-width: 400px;
  }
  
  .mentor-panel.mobile-open {
    transform: translateX(0);
  }
  
  .mentor-panel.collapsed {
    width: 100%;
    max-width: 400px;
  }
  
  .collapsed-content {
    display: none;
  }
}

@media (max-width: 480px) {
  .mentor-panel {
    max-width: 100%;
  }
  
  .mentor-mobile-btn {
    bottom: 16px;
    right: 16px;
    width: 52px;
    height: 52px;
  }
}
</style>
