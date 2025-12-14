<template>
  <div class="mentor-panel-wrapper">
    <div 
      v-if="spotlightMode" 
      class="spotlight-overlay"
      @click="exitSpotlight"
    >
      <div class="spotlight-hint">
        Нажмите, чтобы продолжить
      </div>
    </div>
    
    <div 
      v-if="isMobileOpen && !spotlightMode" 
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
    
    <div :class="['mentor-panel', { collapsed: isCollapsed && !isMobile, 'mobile-open': isMobileOpen, 'spotlight-active': spotlightMode }]">
      <div v-if="isCollapsed && !isMobile" class="collapsed-content" @click="togglePanel">
        <div class="collapsed-avatar">
          <Bot :size="20" :stroke-width="1.5" />
          <span v-if="unreadCount > 0" class="unread-badge-collapsed">{{ unreadCount }}</span>
        </div>
        <span class="collapsed-label">AI Ментор</span>
        <div class="collapsed-indicator" :class="{ 'has-messages': hasMessages || unreadCount > 0 }">
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
              <span :class="['status-dot', connectionStatusClass]"></span>
              {{ connectionStatusText }}
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

      <div class="chat-container" ref="chatContainer" @scroll="handleScroll">
        <div v-if="chatStore.isLoadingMore" class="loading-more">
          <Loader2 :size="20" :stroke-width="1.5" class="spin" />
          <span>Загрузка сообщений...</span>
        </div>
        
        <div v-if="!hasMessages && !chatStore.isLoading" class="welcome-message">
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
              :disabled="!canSendMessage"
            >
              <component :is="prompt.icon" :size="14" :stroke-width="1.5" />
              {{ prompt.label }}
            </button>
          </div>
        </div>

        <div v-else-if="chatStore.isLoading" class="loading-container">
          <Loader2 :size="32" :stroke-width="1.5" class="spin" />
          <span>Загрузка чата...</span>
        </div>

        <div v-else class="messages-list">
          <div 
            v-for="msg in messages" 
            :key="msg.message_id"
            :class="['message', msg.message_type === 'bot' ? 'assistant' : 'user']"
          >
            <div v-if="msg.message_type === 'bot'" class="message-avatar">
              <Bot :size="16" :stroke-width="1.5" />
            </div>
            <div class="message-bubble">
              <div v-html="formatMessage(msg.content)"></div>
              <span class="message-time">{{ formatTime(msg.date_created) }}</span>
            </div>
          </div>

          <div v-if="chatStore.isBotTyping" class="message assistant">
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

      <div v-if="chatStore.forceDisconnected" class="force-disconnect-banner">
        <AlertCircle :size="16" :stroke-width="1.5" />
        <span>Чат открыт в другой вкладке</span>
        <button @click="reconnectChat" class="reconnect-btn">Подключиться</button>
      </div>

      <form class="input-container" @submit.prevent="handleSendMessage">
        <textarea
          v-model="inputText"
          placeholder="Напишите сообщение..."
          :disabled="!canSendMessage"
          ref="inputRef"
          rows="3"
          @keydown.enter.exact.prevent="handleSendMessage"
          @keydown.enter.shift.exact="() => {}"
        ></textarea>
        <button 
          type="submit" 
          class="send-btn"
          :disabled="!inputText.trim() || !canSendMessage"
        >
          <Send v-if="!chatStore.isBotProcessing" :size="18" :stroke-width="1.5" />
          <Loader2 v-else :size="18" :stroke-width="1.5" class="spin" />
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
import { useChatStore } from '../stores/chat'
import { useXpStore } from '../stores/xp'
import { 
  Bot, 
  Sparkles, 
  Send, 
  Target, 
  Lightbulb, 
  Calendar, 
  BookOpen,
  Star,
  PanelRightClose,
  MessageCircle,
  ChevronLeft,
  Loader2,
  AlertCircle
} from 'lucide-vue-next'

const route = useRoute()
const store = useAppStore()
const chatStore = useChatStore()
const xpStore = useXpStore()

const inputText = ref('')
const chatContainer = ref(null)
const inputRef = ref(null)
const isMobile = ref(false)
const isInitialized = ref(false)

const messages = computed(() => chatStore.messages)
const hasMessages = computed(() => chatStore.messages.length > 0)
const isCollapsed = computed(() => store.mentorPanelCollapsed)
const isMobileOpen = computed(() => store.mentorMobileOpen)
const unreadCount = computed(() => chatStore.unreadCount)
const spotlightMode = computed(() => store.mentorSpotlightMode)
const canSendMessage = computed(() => chatStore.canSendMessage && !chatStore.forceDisconnected)

const connectionStatusClass = computed(() => {
  if (chatStore.forceDisconnected) return 'offline'
  switch (chatStore.connectionStatus) {
    case 'connected': return 'online'
    case 'reconnecting': return 'connecting'
    default: return 'offline'
  }
})

const connectionStatusText = computed(() => {
  if (chatStore.forceDisconnected) return 'Отключен'
  switch (chatStore.connectionStatus) {
    case 'connected': return 'Онлайн'
    case 'reconnecting': return 'Подключение...'
    default: return 'Офлайн'
  }
})

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
    initializeChat()
  }
}

function closeMobile() {
  store.closeMentorMobile()
  document.body.style.overflow = ''
}

function exitSpotlight() {
  store.disableMentorSpotlight()
}

async function initializeChat() {
  if (!chatStore.conversationId) return
  
  if (!isInitialized.value) {
    const result = await chatStore.loadMessages()
    
    if (result.success) {
      isInitialized.value = true
    }
    
    await nextTick()
    scrollToBottom()
  }
  
  if (!chatStore.isConnected && !chatStore.forceDisconnected) {
    chatStore.connectWebSocket()
  }
  
  if (chatStore.unreadCount > 0) {
    chatStore.markAsRead()
  }
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

function togglePanel() {
  if (isMobile.value) {
    closeMobile()
  } else {
    store.toggleMentorPanel()
    if (!store.mentorPanelCollapsed) {
      initializeChat()
    }
  }
}

function formatMessage(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

async function handleSendMessage() {
  if (!inputText.value.trim() || !canSendMessage.value) return
  
  const userText = inputText.value.trim()
  inputText.value = ''
  
  await chatStore.sendMessage(userText, {
    sourcePage: route.path,
    clientContext: {
      routeName: route.name,
      isMobile: isMobile.value
    }
  })
  
  await nextTick()
  scrollToBottom()
}

function sendQuickPrompt(text) {
  inputText.value = text
  handleSendMessage()
}

function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

async function handleScroll() {
  if (!chatContainer.value) return
  
  if (chatContainer.value.scrollTop < 100 && chatStore.pagination.hasMore && !chatStore.isLoadingMore) {
    const scrollHeightBefore = chatContainer.value.scrollHeight
    await chatStore.loadOlderMessages()
    await nextTick()
    const scrollHeightAfter = chatContainer.value.scrollHeight
    chatContainer.value.scrollTop = scrollHeightAfter - scrollHeightBefore
  }
}

function reconnectChat() {
  chatStore.reconnectAfterForceDisconnect()
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

watch(() => store.mentorPanelCollapsed, (collapsed) => {
  if (!collapsed && !isMobile.value) {
    initializeChat()
  }
})

watch(() => chatStore.conversationId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    isInitialized.value = false
    if (!store.mentorPanelCollapsed && !isMobile.value) {
      initializeChat()
    }
  }
})

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  if (!store.mentorPanelCollapsed && !isMobile.value) {
    initializeChat()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.body.style.overflow = ''
  chatStore.disconnectWebSocket()
})
</script>

<style scoped>
.mentor-panel-wrapper {
  position: relative;
  z-index: 100;
}

.spotlight-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 460px;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 100px;
}

.spotlight-hint {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 0.875rem;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: pulse-hint 2s ease-in-out infinite;
}

@keyframes pulse-hint {
  0%, 100% { opacity: 0.8; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-4px); }
}

@media (max-width: 1023px) {
  .spotlight-overlay {
    right: 0;
    display: none;
  }
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

.mentor-panel.spotlight-active {
  z-index: 1001;
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.3);
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
  background: #6b7280;
  transition: background 0.3s;
}

.status-dot.online {
  background: #22c55e;
}

.status-dot.connecting {
  background: #f59e0b;
  animation: pulse-dot 1s ease-in-out infinite;
}

.status-dot.offline {
  background: #6b7280;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
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

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 16px;
  color: var(--text-secondary);
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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

.quick-prompt-btn:hover:not(:disabled) {
  background: var(--bg-hover);
  border-color: var(--primary-color);
}

.quick-prompt-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.message-bubble code {
  background: var(--bg-secondary);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.875em;
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

.message-time {
  display: block;
  font-size: 0.6875rem;
  color: var(--text-tertiary);
  margin-top: 4px;
  opacity: 0.7;
}

.message.user .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.message-bubble.typing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 14px 18px;
}

.typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-secondary);
  animation: typing-bounce 1.4s ease-in-out infinite;
}

.typing-dot:nth-child(1) { animation-delay: 0s; }
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}

.force-disconnect-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #fef3c7;
  border-top: 1px solid #fcd34d;
  color: #92400e;
  font-size: 0.875rem;
}

.reconnect-btn {
  margin-left: auto;
  padding: 4px 12px;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.reconnect-btn:hover {
  background: #d97706;
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
  flex-shrink: 0;
}

.input-container textarea {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
  line-height: 1.5;
}

.input-container textarea:focus {
  border-color: var(--primary-color);
}

.input-container textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 1023px) {
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
}

@media (max-width: 480px) {
  .mentor-panel {
    max-width: 100%;
  }
  
  .mentor-mobile-btn {
    bottom: 80px;
  }
}
</style>
