<template>
  <div class="mentor-floating-container">
    <Transition name="hint-fade">
      <div 
        v-if="showHint && !isOpen" 
        class="mentor-hint"
        @click="openChat"
      >
        <Bot :size="16" :stroke-width="1.5" />
        <span>{{ currentHint }}</span>
        <button class="hint-close" @click.stop="dismissHint">
          <X :size="14" :stroke-width="1.5" />
        </button>
      </div>
    </Transition>
    
    <button 
      class="mentor-floating-btn"
      :class="{ active: isOpen }"
      @click="toggleChat"
    >
      <Bot v-if="!isOpen" :size="24" :stroke-width="1.5" />
      <X v-else :size="24" :stroke-width="1.5" />
    </button>
    
    <Transition name="chat-slide">
      <div v-if="isOpen" class="floating-chat-panel">
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="chat-avatar">
              <Bot :size="20" :stroke-width="1.5" />
            </div>
            <div>
              <h4>AI Ментор</h4>
              <span class="status">Онлайн</span>
            </div>
          </div>
          <button class="minimize-btn" @click="closeChat">
            <Minus :size="18" :stroke-width="1.5" />
          </button>
        </div>
        
        <div class="chat-messages" ref="messagesContainer">
          <div v-if="messages.length === 0" class="welcome-msg">
            <Sparkles :size="24" :stroke-width="1.5" />
            <p>Чем могу помочь?</p>
          </div>
          
          <div 
            v-for="msg in messages" 
            :key="msg.id"
            :class="['message', msg.role]"
          >
            <div v-if="msg.role === 'assistant'" class="msg-avatar">
              <Bot :size="14" :stroke-width="1.5" />
            </div>
            <div class="msg-bubble" v-html="formatMessage(msg.content)"></div>
          </div>
          
          <div v-if="isTyping" class="message assistant">
            <div class="msg-avatar">
              <Bot :size="14" :stroke-width="1.5" />
            </div>
            <div class="msg-bubble typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
        
        <form class="chat-input-area" @submit.prevent="sendMessage">
          <input
            v-model="inputText"
            type="text"
            placeholder="Задайте вопрос..."
            :disabled="isTyping"
          />
          <button type="submit" :disabled="!inputText.trim() || isTyping">
            <Send :size="18" :stroke-width="1.5" />
          </button>
        </form>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '../stores/app'
import { Bot, X, Minus, Send, Sparkles } from 'lucide-vue-next'

const store = useAppStore()
const route = useRoute()

const isOpen = ref(false)
const showHint = ref(false)
const inputText = ref('')
const isTyping = ref(false)
const messagesContainer = ref(null)
const hintTimeout = ref(null)
const hintDismissed = ref(false)

const messages = computed(() => store.mentor.messages)

const contextualHints = {
  '/app/ssp': 'Нужна помощь с оценкой сфер жизни?',
  '/app/goals': 'Подскажу, как правильно ставить цели!',
  '/app/decomposition': 'Помогу разбить цель на шаги',
  '/app/planning': 'Советы по планированию недели',
  '/app/journal': 'Расскажу о пользе рефлексии',
  'default': 'Есть вопрос? Я помогу!'
}

const currentHint = computed(() => {
  return contextualHints[route.path] || contextualHints['default']
})

const demoResponses = {
  default: `Отличный вопрос! 

Вот что я могу предложить:
1. Помочь с постановкой целей
2. Подсказать следующие шаги
3. Ответить на вопросы о методе 1%

Что вас интересует?`
}

function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

function toggleChat() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    showHint.value = false
    store.openMentorChat()
  } else {
    store.closeMentorChat()
  }
}

function openChat() {
  isOpen.value = true
  showHint.value = false
  store.openMentorChat()
}

function closeChat() {
  isOpen.value = false
  store.closeMentorChat()
}

function dismissHint() {
  showHint.value = false
  hintDismissed.value = true
}

async function sendMessage() {
  if (!inputText.value.trim() || isTyping.value) return
  
  const userText = inputText.value.trim()
  inputText.value = ''
  
  store.sendMentorMessage(userText)
  
  await nextTick()
  scrollToBottom()
  
  isTyping.value = true
  
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800))
  
  store.sendMentorMessage(demoResponses.default, 'assistant')
  
  isTyping.value = false
  
  await nextTick()
  scrollToBottom()
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function showContextualHint() {
  if (!hintDismissed.value && !isOpen.value) {
    hintTimeout.value = setTimeout(() => {
      showHint.value = true
    }, 5000)
  }
}

watch(() => route.path, () => {
  if (hintTimeout.value) {
    clearTimeout(hintTimeout.value)
  }
  showHint.value = false
  hintDismissed.value = false
  showContextualHint()
})

watch(messages, () => {
  nextTick(() => scrollToBottom())
}, { deep: true })

onMounted(() => {
  showContextualHint()
})

onUnmounted(() => {
  if (hintTimeout.value) {
    clearTimeout(hintTimeout.value)
  }
})
</script>

<style scoped>
.mentor-floating-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.mentor-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  max-width: 280px;
  font-size: 0.85rem;
  color: var(--text-primary);
}

.mentor-hint:hover {
  border-color: var(--primary-color);
}

.mentor-hint svg:first-child {
  color: #667eea;
  flex-shrink: 0;
}

.hint-close {
  background: transparent;
  border: none;
  padding: 2px;
  color: var(--text-secondary);
  cursor: pointer;
  flex-shrink: 0;
}

.hint-close:hover {
  color: var(--text-primary);
}

.mentor-floating-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
}

.mentor-floating-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
}

.mentor-floating-btn.active {
  background: var(--bg-secondary);
  color: var(--text-primary);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.floating-chat-panel {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 360px;
  height: 450px;
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.chat-header-info h4 {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.chat-header-info .status {
  font-size: 0.75rem;
  color: #22c55e;
}

.minimize-btn {
  background: transparent;
  border: none;
  padding: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 6px;
}

.minimize-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.welcome-msg {
  text-align: center;
  padding: 30px 20px;
  color: var(--text-secondary);
}

.welcome-msg svg {
  color: #667eea;
  margin-bottom: 8px;
}

.welcome-msg p {
  margin: 0;
  font-size: 0.9rem;
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

.msg-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.msg-bubble {
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 0.85rem;
  line-height: 1.4;
}

.message.assistant .msg-bubble {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-bottom-left-radius: 4px;
}

.message.user .msg-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.msg-bubble.typing {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
}

.msg-bubble.typing span {
  width: 6px;
  height: 6px;
  background: var(--text-secondary);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.msg-bubble.typing span:nth-child(1) { animation-delay: -0.32s; }
.msg-bubble.typing span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.chat-input-area {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.chat-input-area input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: var(--card-bg);
  font-size: 0.85rem;
  color: var(--text-primary);
  outline: none;
}

.chat-input-area input:focus {
  border-color: var(--primary-color);
}

.chat-input-area input::placeholder {
  color: var(--text-secondary);
}

.chat-input-area button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-input-area button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hint-fade-enter-active,
.hint-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.hint-fade-enter-from,
.hint-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.chat-slide-enter-from,
.chat-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

@media (max-width: 480px) {
  .mentor-floating-container {
    bottom: 24px;
    right: 16px;
  }
  
  .floating-chat-panel {
    width: calc(100vw - 48px);
    right: -12px;
  }
  
  .mentor-hint {
    max-width: 200px;
    font-size: 0.8rem;
  }
}
</style>
