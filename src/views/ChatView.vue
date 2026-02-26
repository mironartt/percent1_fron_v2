<template>
  <div class="chat-view">
    <CollapsibleDashboard />

    <div class="chat-area">
      <div class="chat-header">
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
      </div>

      <div v-if="store.tutorialStage < 6 && !store.tutorialSkipped" class="tutorial-banner">
        <span class="tutorial-progress">
          <span class="tutorial-step">{{ tutorialStepLabel }}</span>
          <span class="tutorial-dots">
            <span v-for="i in 6" :key="i" :class="['dot', { active: i <= store.tutorialStage + 1 }]"></span>
          </span>
        </span>
        <button @click="handleSkipTutorial" class="tutorial-skip-btn">Пропустить</button>
      </div>

      <div class="chat-container" ref="chatContainer" @scroll="handleScroll">
        <div class="chat-content">
          <div v-if="chatStore.isLoadingMore" class="loading-more">
            <Loader2 :size="20" :stroke-width="1.5" class="spin" />
            <span>Загрузка сообщений...</span>
          </div>

          <div v-if="!hasMessages && !chatStore.isLoading" class="welcome-message">
            <div class="welcome-icon">
              <Sparkles :size="40" :stroke-width="1.5" />
            </div>
            <h4>{{ welcomeTitle }}</h4>
            <p>{{ welcomeText }}</p>
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
      </div>

      <div v-if="chatStore.forceDisconnected" class="force-disconnect-banner">
        <AlertCircle :size="16" :stroke-width="1.5" />
        <span>Чат открыт в другой вкладке</span>
        <button @click="reconnectChat" class="reconnect-btn">Подключиться</button>
      </div>

      <form class="input-container" @submit.prevent="handleSendMessage">
        <div class="input-wrapper">
          <textarea
            v-model="inputText"
            placeholder="Напишите сообщение..."
            :disabled="!canSendMessage"
            ref="inputRef"
            rows="3"
            @keydown.enter.exact.prevent="handleSendMessage"
            @keydown.enter.shift.exact="() => {}"
            @input="autoResize"
          ></textarea>
          <button
            type="submit"
            class="send-btn"
            :disabled="!inputText.trim() || !canSendMessage"
          >
            <Send v-if="!chatStore.isBotProcessing" :size="18" :stroke-width="1.5" />
            <Loader2 v-else :size="18" :stroke-width="1.5" class="spin" />
          </button>
        </div>
      </form>
    </div>

    <UpgradeModal
      v-if="showUpgradeModal"
      title="AI Ментор доступен на Pro"
      message="Получите доступ к AI ментору и персональным рекомендациям с подпиской Pro."
      @close="closeUpgradeModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted, markRaw } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useChatStore } from '@/stores/chat'
import { useXpStore } from '@/stores/xp'
import { useSubscriptionStore } from '@/stores/subscription'
import { useToastStore } from '@/stores/toast'
import CollapsibleDashboard from '@/components/CollapsibleDashboard.vue'
import UpgradeModal from '@/components/UpgradeModal.vue'
import {
  Bot,
  Sparkles,
  Send,
  Target,
  Lightbulb,
  Calendar,
  BookOpen,
  Star,
  Loader2,
  AlertCircle,
  Flame,
  SkipForward,
  Award,
  Compass
} from 'lucide-vue-next'

const route = useRoute()
const store = useAppStore()
const chatStore = useChatStore()
const xpStore = useXpStore()
const subscriptionStore = useSubscriptionStore()
const toastStore = useToastStore()

const inputText = ref('')
const showUpgradeModal = ref(false)
const chatContainer = ref(null)
const inputRef = ref(null)
const isInitialized = ref(false)

const messages = computed(() => chatStore.messages)
const hasMessages = computed(() => chatStore.messages.length > 0)
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

// Tutorial stage labels
const tutorialStepLabel = computed(() => {
  const labels = {
    0: 'Шаг 1 из 6: Первая цель',
    1: 'Шаг 2 из 6: Декомпозиция',
    2: 'Шаг 3 из 6: Планирование',
    3: 'Шаг 4 из 6: Привычки',
    4: 'Шаг 5 из 6: Колесо баланса',
    5: 'Шаг 6 из 6: Достижения'
  }
  return labels[store.tutorialStage] || ''
})

const welcomeTitle = computed(() => {
  if (store.tutorialStage === 0) return 'Давай настроим систему'
  if (store.tutorialStage === 1) return 'Отлично, цель создана!'
  if (store.tutorialStage === 2) return 'Шаги готовы, время планировать'
  if (store.tutorialStage === 3) return 'Осталось добавить привычку'
  if (store.tutorialStage === 4) return 'Время оценить жизнь целиком'
  if (store.tutorialStage === 5) return 'Награди себя за прогресс'
  return 'Добро пожаловать!'
})

const welcomeText = computed(() => {
  if (store.tutorialStage === 0) return 'Я Саша, твой AI-наставник. Начнём с главного — поставим первую цель. Можешь написать мне прямо здесь или выбрать подсказку ниже.'
  if (store.tutorialStage === 1) return 'Теперь разобьём цель на конкретные шаги. Большая цель становится реальной, когда есть план.'
  if (store.tutorialStage === 2) return 'Шаги есть — теперь запланируем их на неделю. Без расписания задачи остаются намерениями.'
  if (store.tutorialStage === 3) return 'Привычки — двигатель ежедневного прогресса. Добавь первую, и перейдём к следующему шагу.'
  if (store.tutorialStage === 4) return 'Колесо баланса — основа системы. Оцени 6 сфер жизни, чтобы понять, куда направить усилия.'
  if (store.tutorialStage === 5) return 'Создай награду для себя — то, чем порадуешь себя за заработанные XP. Это мотивация в действии.'
  return 'Я ваш персональный AI-ментор. Помогу разобраться в целях, подскажу следующие шаги и отвечу на вопросы.'
})

const quickPrompts = computed(() => {
  const stage = store.tutorialStage

  // Tutorial-specific prompts
  if (stage === 0) {
    return [
      { id: 't0-1', icon: markRaw(Target), label: 'Создать первую цель', text: 'Помоги мне создать мою первую цель' },
      { id: 't0-2', icon: markRaw(Lightbulb), label: 'Как это работает?', text: 'Расскажи как работает OnePercent и что тут можно делать' },
      { id: 't0-3', icon: markRaw(SkipForward), label: 'Пропустить обучение', text: 'Я уже разбираюсь, хочу пропустить обучение и пользоваться всеми функциями' }
    ]
  }

  if (stage === 1) {
    return [
      { id: 't1-1', icon: markRaw(Target), label: 'Разбить цель на шаги', text: 'Помоги разбить мою цель на конкретные шаги' },
      { id: 't1-2', icon: markRaw(Lightbulb), label: 'Зачем нужны шаги?', text: 'Объясни зачем разбивать цели на шаги и как это правильно делать' }
    ]
  }

  if (stage === 2) {
    return [
      { id: 't2-1', icon: markRaw(Calendar), label: 'Запланировать неделю', text: 'Помоги запланировать задачи на эту неделю' },
      { id: 't2-2', icon: markRaw(Lightbulb), label: 'Как планировать?', text: 'Как эффективно планировать неделю, чтобы задачи реально выполнялись?' }
    ]
  }

  if (stage === 3) {
    return [
      { id: 't3-1', icon: markRaw(Flame), label: 'Создать привычку', text: 'Помоги создать мою первую ежедневную привычку' },
      { id: 't3-2', icon: markRaw(Lightbulb), label: 'Зачем привычки?', text: 'Почему привычки важны для достижения целей и как работает XP-система?' }
    ]
  }

  if (stage === 4) {
    return [
      { id: 't4-1', icon: markRaw(Compass), label: 'Заполнить колесо баланса', text: 'Помоги оценить мои 6 сфер жизни в колесе баланса' },
      { id: 't4-2', icon: markRaw(Lightbulb), label: 'Что такое колесо баланса?', text: 'Расскажи зачем нужно колесо баланса и как оно помогает в развитии' }
    ]
  }

  if (stage === 5) {
    return [
      { id: 't5-1', icon: markRaw(Award), label: 'Создать награду', text: 'Помоги создать мою первую награду за XP' },
      { id: 't5-2', icon: markRaw(Lightbulb), label: 'Как работают награды?', text: 'Расскажи как работает система наград и XP в OnePercent' }
    ]
  }

  // Stage 6+: normal prompts
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

  const hasAccess = await subscriptionStore.verifyAIAccess()
  if (!hasAccess) {
    showUpgradeModal.value = true
    return
  }

  const userText = inputText.value.trim()
  inputText.value = ''

  // Reset textarea height
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
  }

  await chatStore.sendMessage(userText, {
    sourcePage: route.path,
    clientContext: {
      routeName: route.name
    }
  })

  await nextTick()
  scrollToBottom()
}

function closeUpgradeModal() {
  showUpgradeModal.value = false
}

function sendQuickPrompt(text) {
  inputText.value = text
  handleSendMessage()
}

async function handleSkipTutorial() {
  await store.skipTutorial()
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

function autoResize() {
  if (!inputRef.value) return
  inputRef.value.style.height = 'auto'
  const minHeight = 3 * 1.5 * 14 // 3 rows * line-height 1.5 * font-size 14px
  inputRef.value.style.height = Math.max(minHeight, Math.min(inputRef.value.scrollHeight, 160)) + 'px'
}

watch(messages, () => {
  nextTick(() => scrollToBottom())
}, { deep: true })

watch(() => chatStore.isBotTyping, (isTyping) => {
  if (isTyping) {
    nextTick(() => scrollToBottom())
  }
})

watch(() => chatStore.conversationId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    isInitialized.value = false
    initializeChat()
  }
})

// Refresh goals data after bot messages to detect MCP-created entities
watch(() => chatStore.messages.length, async (newLen, oldLen) => {
  if (newLen > oldLen && store.tutorialStage < 6) {
    const lastMsg = chatStore.messages[chatStore.messages.length - 1]
    if (lastMsg?.message_type === 'bot') {
      await store.loadGoalsFromBackend()
    }
  }
})

// Show notification when tutorial stage advances
const tutorialUnlockLabels = {
  1: 'Банк целей',
  2: 'Планирование',
  3: 'Привычки',
  4: 'Колесо баланса',
  5: 'Достижения',
  6: 'Все разделы'
}

watch(() => store.tutorialStage, (newStage, oldStage) => {
  if (newStage > oldStage && oldStage !== undefined && newStage <= 6) {
    const label = tutorialUnlockLabels[newStage]
    if (label) {
      toastStore.success(`Раздел "${label}" разблокирован!`, { duration: 3000 })
    }
  }
})

onMounted(() => {
  initializeChat()
})

onUnmounted(() => {
  chatStore.disconnectWebSocket()
})
</script>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 4rem);
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.chat-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
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

.chat-container {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.chat-content {
  padding: 8px 0;
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
  padding: 48px 16px;
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
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
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
  font-size: 0.9375rem;
  line-height: 1.6;
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
  border-radius: 8px;
  color: #92400e;
  font-size: 0.875rem;
  flex-shrink: 0;
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
  padding: 12px 0;
  flex-shrink: 0;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.input-wrapper textarea {
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
  max-height: 160px;
  overflow-y: auto;
}

.input-wrapper textarea:focus {
  border-color: var(--primary-color);
}

.input-wrapper textarea:disabled {
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

.tutorial-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08));
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 10px;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.tutorial-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tutorial-step {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--primary-color);
}

.tutorial-dots {
  display: flex;
  gap: 4px;
}

.tutorial-dots .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border-color);
  transition: background 0.3s ease;
}

.tutorial-dots .dot.active {
  background: var(--primary-color);
}

.tutorial-skip-btn {
  padding: 4px 10px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.tutorial-skip-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--text-secondary);
}

@media (max-width: 768px) {
  .chat-view {
    height: calc(100vh - calc(var(--bottom-nav-height, 56px) + var(--safe-area-bottom, 0px)));
    max-width: 100%;
  }

  .chat-header {
    padding: 8px 0;
  }

  .message {
    max-width: 90%;
  }

  .quick-prompts {
    flex-direction: column;
  }

  .tutorial-step {
    font-size: 0.75rem;
  }
}
</style>
