<template>
  <div class="chat-view">

    <!-- TOP BAR: единое меню с XP/стриками + задачи/привычки -->
    <div
      v-if="!isOnboardingMode && (hasAnyStats || (!hasMessages && !chatStore.isLoading && hasDailyContent))"
      class="top-bar"
      @click.stop
    >
      <div class="top-menu">
        <!-- Stats pills -->
        <router-link v-if="xpStore.xpBalance > 0" to="/app/achievements" class="home-stat">
          <Award :size="14" :stroke-width="1.5" class="home-stat-icon xp" />
          <span class="home-stat-value">{{ xpStore.xpBalance }}</span>
        </router-link>
        <router-link v-if="store.habitStreak > 0" to="/app/habits" class="home-stat">
          <Flame :size="14" :stroke-width="1.5" class="home-stat-icon streak" />
          <span class="home-stat-value">{{ store.habitStreak }}</span>
        </router-link>
        <router-link v-if="store.journalStreak > 0" to="/app/journal" class="home-stat">
          <BookOpen :size="14" :stroke-width="1.5" class="home-stat-icon journal" />
          <span class="home-stat-value">{{ store.journalStreak }}</span>
        </router-link>

        <!-- Divider between stats and daily strips -->
        <div
          v-if="hasAnyStats && !hasMessages && !chatStore.isLoading && hasDailyContent"
          class="top-menu-divider"
        ></div>

        <!-- Daily strip items (only on empty screen) -->
        <template v-if="!hasMessages && !chatStore.isLoading && hasDailyContent">
      <!-- Tasks -->
      <div v-if="emptyStateFocusTasks.length > 0" class="strip-item-wrap">
        <button
          class="strip-item"
          :class="{ active: activeDropdown === 'tasks' }"
          @click.stop="toggleDropdown('tasks')"
        >
          <CheckCircle2 :size="14" :stroke-width="1.5" />
          <span class="strip-label">{{ emptyStateTasksCompleted }}/{{ emptyStateTasksTotal }} задач</span>
          <div class="strip-progress-bar">
            <div
              class="strip-progress-fill tasks"
              :style="{ width: (emptyStateTasksTotal ? emptyStateTasksCompleted / emptyStateTasksTotal * 100 : 0) + '%' }"
            ></div>
          </div>
          <ChevronDown :size="13" :stroke-width="2" class="strip-chevron" :class="{ rotated: activeDropdown === 'tasks' }" />
        </button>
        <Transition name="dropdown">
          <div v-if="activeDropdown === 'tasks'" class="strip-dropdown" @click.stop>
            <div class="dropdown-list">
              <label
                v-for="task in emptyStateFocusTasks"
                :key="task.id"
                class="dropdown-task-row"
                :class="{ completed: task.completed }"
              >
                <input
                  type="checkbox"
                  :checked="task.completed"
                  @change="toggleEmptyStateTask(task)"
                  class="dropdown-task-check"
                />
                <span class="dropdown-task-text">{{ task.title }}</span>
                <span v-if="task.sphere" class="dropdown-task-sphere">{{ task.sphere }}</span>
              </label>
            </div>
            <router-link to="/app/planning" class="dropdown-nav-link" @click="activeDropdown = null">
              Перейти в планирование
              <ChevronDown :size="13" :stroke-width="2" style="transform: rotate(-90deg)" />
            </router-link>
          </div>
        </Transition>
      </div>

      <!-- Habits -->
      <div v-if="emptyStateTodayHabits.length > 0" class="strip-item-wrap">
        <button
          class="strip-item"
          :class="{ active: activeDropdown === 'habits' }"
          @click.stop="toggleDropdown('habits')"
        >
          <Flame :size="14" :stroke-width="1.5" />
          <span class="strip-label">{{ emptyStateHabitsCompleted }}/{{ emptyStateTodayHabits.length }} привычек</span>
          <div class="strip-progress-bar">
            <div
              class="strip-progress-fill habits"
              :style="{ width: (emptyStateTodayHabits.length ? emptyStateHabitsCompleted / emptyStateTodayHabits.length * 100 : 0) + '%' }"
            ></div>
          </div>
          <ChevronDown :size="13" :stroke-width="2" class="strip-chevron" :class="{ rotated: activeDropdown === 'habits' }" />
        </button>
        <Transition name="dropdown">
          <div v-if="activeDropdown === 'habits'" class="strip-dropdown" @click.stop>
            <div class="dropdown-list">
              <label
                v-for="habit in emptyStateTodayHabits"
                :key="habit.habit_id"
                class="dropdown-task-row"
                :class="{ completed: habit.is_complete }"
              >
                <input
                  type="checkbox"
                  :checked="habit.is_complete"
                  @change="toggleEmptyStateHabit(habit)"
                  class="dropdown-task-check"
                />
                <span class="dropdown-task-text">{{ habit.title }}</span>
              </label>
            </div>
            <router-link to="/app/habits" class="dropdown-nav-link" @click="activeDropdown = null">
              Перейти в привычки
              <ChevronDown :size="13" :stroke-width="2" style="transform: rotate(-90deg)" />
            </router-link>
          </div>
        </Transition>
      </div>
        </template>
      </div><!-- /.top-menu -->
    </div><!-- /.top-bar -->

    <!-- ПУСТОЙ ЭКРАН: Claude-like центрированный layout -->
    <div v-if="!hasMessages && !chatStore.isLoading" class="empty-state">
      <!-- Верхняя полоска с кнопкой пропуска -->
      <div v-if="isOnboardingMode || (store.tutorialStage < 6 && !store.tutorialSkipped)" class="empty-top-bar">
        <button v-if="isOnboardingMode" @click="handleSkipOnboarding" class="skip-onboarding-btn" :disabled="skippingOnboarding">
          <Loader2 v-if="skippingOnboarding" :size="14" :stroke-width="1.5" class="spin" />
          Пропустить
        </button>
        <div v-else class="tutorial-progress">
          <span class="tutorial-step">{{ tutorialStepLabel }}</span>
          <button @click="handleSkipTutorial" class="tutorial-skip-btn">Пропустить</button>
        </div>
      </div>

      <!-- Центрированный контент -->
      <div class="empty-center">
        <h1 class="greeting-title">{{ greetingWord }}, {{ userName }}</h1>

        <form @submit.prevent="handleSendMessage" class="empty-form">
          <div class="empty-input-wrapper">
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
            <button type="submit" class="empty-send-btn" :disabled="!inputText.trim() || !canSendMessage">
              <Send v-if="!chatStore.isBotProcessing" :size="18" :stroke-width="1.5" />
              <Loader2 v-else :size="18" :stroke-width="1.5" class="spin" />
            </button>
          </div>

          <div class="empty-chips">
            <button
              v-for="prompt in quickPrompts"
              :key="prompt.id"
              type="button"
              class="prompt-chip"
              @click="sendQuickPrompt(prompt.action ? prompt : prompt.text)"
              :disabled="!canSendMessage"
            >
              <component :is="prompt.icon" :size="14" :stroke-width="1.5" />
              {{ prompt.label }}
            </button>
          </div>
        </form>

      </div>
    </div>

    <!-- АКТИВНЫЙ ЧАТ: есть сообщения или идёт загрузка -->
    <template v-else>
      <CollapsibleDashboard v-if="!isOnboardingMode" />

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
          <button v-if="isOnboardingMode" @click="handleSkipOnboarding" class="skip-onboarding-btn" :disabled="skippingOnboarding">
            <Loader2 v-if="skippingOnboarding" :size="14" :stroke-width="1.5" class="spin" />
            Пропустить
          </button>
        </div>

        <div v-if="!isOnboardingMode && store.tutorialStage < 6 && !store.tutorialSkipped" class="tutorial-banner">
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

            <div v-if="chatStore.isLoading" class="loading-container">
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

              <div v-if="quickReplies.length > 0" class="quick-replies">
                <button
                  v-for="(reply, index) in quickReplies"
                  :key="index"
                  class="quick-reply-chip"
                  @click="sendQuickReply(reply)"
                  :disabled="!canSendMessage"
                >
                  {{ reply }}
                </button>
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
              rows="1"
              @keydown.enter.exact.prevent="handleSendMessage"
              @keydown.enter.shift.exact="() => {}"
              @input="autoResize"
            ></textarea>
            <button type="submit" class="send-btn" :disabled="!inputText.trim() || !canSendMessage">
              <Send v-if="!chatStore.isBotProcessing" :size="18" :stroke-width="1.5" />
              <Loader2 v-else :size="18" :stroke-width="1.5" class="spin" />
            </button>
          </div>
        </form>
      </div>
    </template>

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
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useChatStore } from '@/stores/chat'
import { useXpStore } from '@/stores/xp'
import { useSubscriptionStore } from '@/stores/subscription'
import { useToastStore } from '@/stores/toast'
import { checkAuth, skipOnboarding, updateGoalSteps } from '@/services/api.js'
import { DEV_MODE } from '@/config/settings'
import { markHabitCompleted } from '@/services/habitsApi'
import { useConfetti } from '@/composables/useConfetti'
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
  Compass,
  ClipboardList,
  CheckCircle2,
  Circle,
  ChevronDown
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useAppStore()
const chatStore = useChatStore()
const xpStore = useXpStore()
const subscriptionStore = useSubscriptionStore()
const toastStore = useToastStore()

const { celebrateBig: fireConfetti } = useConfetti()

const inputText = ref('')
const showUpgradeModal = ref(false)
const chatContainer = ref(null)
const inputRef = ref(null)
const isInitialized = ref(false)
const skippingOnboarding = ref(false)
const activeDropdown = ref(null)

function toggleDropdown(name) {
  activeDropdown.value = activeDropdown.value === name ? null : name
}

function closeDropdowns() {
  activeDropdown.value = null
}

// Onboarding mode: new user without finished onboarding
const isOnboardingMode = computed(() => store.shouldShowOnboarding)

const greetingWord = computed(() => {
  const h = new Date().getHours()
  if (h >= 6 && h < 12) return 'Доброе утро'
  if (h >= 12 && h < 18) return 'Добрый день'
  if (h >= 18 && h < 23) return 'Добрый вечер'
  return 'Доброй ночи'
})

const userName = computed(() => store.user?.first_name || '')

// Daily overview data (shown in empty state below chips)
const dashboardData = computed(() => store.userDashboardData || {})

const emptyStateFocusTasks = computed(() => {
  if (store.tutorialStage < 2) return []
  const tasks = dashboardData.value.today_tasks?.tasks || []
  return tasks.map(task => ({
    id: task.step_id,
    title: task.step_title,
    completed: task.is_complete,
    sphere: task.goal_title,
    goalId: task.goal_id
  }))
})

const emptyStateTasksCompleted = computed(() => dashboardData.value.today_tasks?.completed_count || 0)
const emptyStateTasksTotal = computed(() => dashboardData.value.today_tasks?.total_count || 0)

const emptyStateTodayHabits = computed(() => {
  if (store.tutorialStage < 3) return []
  const habits = dashboardData.value.today_habits?.habits || []
  return habits.slice(0, 8)
})

const emptyStateHabitsCompleted = computed(() =>
  emptyStateTodayHabits.value.filter(h => h.is_complete).length
)

const hasDailyContent = computed(() =>
  emptyStateFocusTasks.value.length > 0 || emptyStateTodayHabits.value.length > 0
)

const hasAnyStats = computed(() =>
  xpStore.xpBalance > 0 || store.habitStreak > 0 || store.journalStreak > 0
)

function pluralDays(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'день'
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'дня'
  return 'дней'
}

const messages = computed(() => chatStore.messages)
const hasMessages = computed(() => chatStore.messages.length > 0)
const canSendMessage = computed(() => chatStore.canSendMessage && !chatStore.forceDisconnected)

const quickReplies = computed(() => {
  if (!hasMessages.value || chatStore.isBotTyping || chatStore.isBotProcessing) return []
  const lastMsg = messages.value[messages.value.length - 1]
  if (!lastMsg || lastMsg.message_type !== 'bot') return []
  const replies = lastMsg.bot_metadata?.quick_replies
  if (!Array.isArray(replies) || replies.length === 0) return []
  return replies
})

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
  if (isOnboardingMode.value) return 'Добро пожаловать!'
  if (store.tutorialStage === 0) return 'Давай настроим систему'
  if (store.tutorialStage === 1) return 'Отлично, цель создана!'
  if (store.tutorialStage === 2) return 'Шаги готовы, время планировать'
  if (store.tutorialStage === 3) return 'Осталось добавить привычку'
  if (store.tutorialStage === 4) return 'Время оценить жизнь целиком'
  if (store.tutorialStage === 5) return 'Награди себя за прогресс'
  return 'Добро пожаловать!'
})

const welcomeText = computed(() => {
  if (isOnboardingMode.value) return 'Я ваш персональный AI-ментор. Помогу разобраться в целях, подскажу следующие шаги и отвечу на вопросы.'
  if (store.tutorialStage === 0) return 'Я Саша, твой AI-наставник. Начнём с главного — поставим первую цель. Можешь написать мне прямо здесь или выбрать подсказку ниже.'
  if (store.tutorialStage === 1) return 'Теперь разобьём цель на конкретные шаги. Большая цель становится реальной, когда есть план.'
  if (store.tutorialStage === 2) return 'Шаги есть — теперь запланируем их на неделю. Без расписания задачи остаются намерениями.'
  if (store.tutorialStage === 3) return 'Привычки — двигатель ежедневного прогресса. Добавь первую, и перейдём к следующему шагу.'
  if (store.tutorialStage === 4) return 'Колесо баланса — основа системы. Оцени 6 сфер жизни, чтобы понять, куда направить усилия.'
  if (store.tutorialStage === 5) return 'Создай награду для себя — то, чем порадуешь себя за заработанные XP. Это мотивация в действии.'
  return 'Я ваш персональный AI-ментор. Помогу разобраться в целях, подскажу следующие шаги и отвечу на вопросы.'
})

const quickPrompts = computed(() => {
  // Onboarding mode: simplified prompts for new users
  if (isOnboardingMode.value) {
    return [
      { id: 'ob-1', icon: markRaw(Compass), label: 'С чего начать?', text: 'С чего мне начать? Расскажи что это за сервис и как он поможет мне.' },
      { id: 'ob-2', icon: markRaw(Target), label: 'У меня есть цель', text: 'У меня есть конкретная цель, которую я хочу достичь.' },
      { id: 'ob-3', icon: markRaw(BookOpen), label: 'О методе 1%', text: 'Расскажи подробнее о методе ежедневного улучшения на 1%' }
    ]
  }

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
    const prompts = [
      { id: 't1-1', icon: markRaw(Target), label: 'Разбить цель на шаги', text: 'Помоги разбить мою цель на конкретные шаги' },
      { id: 't1-2', icon: markRaw(Lightbulb), label: 'Зачем нужны шаги?', text: 'Объясни зачем разбивать цели на шаги и как это правильно делать' }
    ]
    if (!store.interviewCompleted) {
      prompts.push({ id: 't1-interview', icon: markRaw(ClipboardList), label: 'Пройти интервью', action: 'interview' })
    }
    return prompts
  }

  if (stage === 2) {
    return [
      { id: 't2-1', icon: markRaw(Calendar), label: 'Запланировать неделю', text: 'Помоги запланировать задачи на эту неделю' },
      { id: 't2-2', icon: markRaw(Lightbulb), label: 'Как планировать?', text: 'Как эффективно планировать неделю, чтобы задачи реально выполнялись?' }
    ]
  }

  if (stage === 3) {
    const prompts = [
      { id: 't3-1', icon: markRaw(Flame), label: 'Создать привычку', text: 'Помоги создать мою первую ежедневную привычку' },
      { id: 't3-2', icon: markRaw(Lightbulb), label: 'Зачем привычки?', text: 'Почему привычки важны для достижения целей и как работает XP-система?' }
    ]
    if (!store.interviewCompleted) {
      prompts.push({ id: 't3-interview', icon: markRaw(ClipboardList), label: 'Пройти интервью', action: 'interview' })
    }
    return prompts
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

function sendQuickPrompt(prompt) {
  if (typeof prompt === 'object' && prompt.action === 'interview') {
    router.push('/app/interview?source=chat')
    return
  }
  const text = typeof prompt === 'string' ? prompt : prompt.text
  inputText.value = text
  handleSendMessage()
}

function sendQuickReply(text) {
  inputText.value = text
  handleSendMessage()
}

async function toggleEmptyStateTask(task) {
  const tasksArray = store.userDashboardData?.today_tasks?.tasks
  const apiTask = tasksArray?.find(t => t.step_id === task.id)
  const newCompleted = !task.completed
  if (apiTask) {
    apiTask.is_complete = newCompleted
    if (newCompleted) {
      store.userDashboardData.today_tasks.completed_count++
    } else {
      store.userDashboardData.today_tasks.completed_count--
    }
  }
  try {
    await updateGoalSteps({
      goals_steps_data: [{ goal_id: task.goalId, step_id: task.id, is_complete: newCompleted }]
    })
  } catch {
    if (apiTask) {
      apiTask.is_complete = !newCompleted
      if (newCompleted) {
        store.userDashboardData.today_tasks.completed_count--
      } else {
        store.userDashboardData.today_tasks.completed_count++
      }
    }
  }
}

async function toggleEmptyStateHabit(habit) {
  const habitsArray = store.userDashboardData?.today_habits?.habits
  const apiHabit = habitsArray?.find(h => h.habit_id === habit.habit_id)
  const newCompleted = !habit.is_complete
  if (apiHabit) {
    apiHabit.is_complete = newCompleted
    if (newCompleted) {
      store.userDashboardData.today_habits.completed_count++
    } else {
      store.userDashboardData.today_habits.completed_count--
    }
  }
  try {
    const today = new Date().toISOString().split('T')[0]
    await markHabitCompleted(habit.habit_id, today)
  } catch {
    if (apiHabit) {
      apiHabit.is_complete = !newCompleted
      if (newCompleted) {
        store.userDashboardData.today_habits.completed_count--
      } else {
        store.userDashboardData.today_habits.completed_count++
      }
    }
  }
}

async function handleSkipTutorial() {
  await store.skipTutorial()
}

async function handleSkipOnboarding() {
  if (skippingOnboarding.value) return
  skippingOnboarding.value = true
  try {
    const result = await skipOnboarding()
    if (result.status === 'ok') {
      await store.skipTutorial()
      await completeOnboardingTransition()
    }
  } catch (e) {
    toastStore.error('Ошибка при пропуске онбординга')
  } finally {
    skippingOnboarding.value = false
  }
}

async function completeOnboardingTransition() {
  // Refresh user data to get finish_onboarding = true
  const userData = await checkAuth()
  if (userData) {
    store.setUser(userData)
  }

  // Celebration
  fireConfetti()
  toastStore.success('Добро пожаловать в OnePercent!')
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
  const minHeight = 3 * 1.6 * 16 // 3 rows * line-height 1.6 * font-size 16px (empty-input uses 1rem=16px)
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

// Watch for onboarding_completed WebSocket event
watch(() => chatStore.onboardingCompleted, async (completed) => {
  if (completed && isOnboardingMode.value) {
    chatStore.onboardingCompleted = false
    await completeOnboardingTransition()
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
  document.addEventListener('click', closeDropdowns)

  // DEV: mock XP and streaks for preview
  if (DEV_MODE) {
    xpStore.xpBalance = 420
    xpStore.todayXP = 35
    const injectJournalStreak = () => {
      if (store.user) {
        store.user.journal_streak = 5
      } else {
        setTimeout(injectJournalStreak, 300)
      }
    }
    injectJournalStreak()
  }

  // DEV: inject mock daily data to preview empty-state cards
  if (DEV_MODE && !store.userDashboardData?.today_tasks?.tasks?.length) {
    store.frontendSettings.tutorial_skipped = true
    store.userDashboardData = {
      today_tasks: {
        total_count: 5,
        completed_count: 1,
        tasks: [
          { step_id: 1, step_title: 'Написать отчёт за квартал', is_complete: false, goal_title: 'Карьера', goal_id: 1 },
          { step_id: 2, step_title: 'Прочитать 20 страниц книги', is_complete: true, goal_title: 'Знания', goal_id: 2 },
          { step_id: 3, step_title: 'Спортзал — силовая тренировка', is_complete: false, goal_title: 'Здоровье', goal_id: 3 },
          { step_id: 4, step_title: 'Позвонить клиенту', is_complete: false, goal_title: 'Карьера', goal_id: 1 },
          { step_id: 5, step_title: 'Медитация 10 минут', is_complete: false, goal_title: 'Здоровье', goal_id: 3 }
        ]
      },
      today_habits: {
        total_count: 4,
        completed_count: 1,
        habits: [
          { habit_id: 1, title: 'Вода 2л', is_complete: true },
          { habit_id: 2, title: 'Пробежка', is_complete: false },
          { habit_id: 3, title: 'Чтение', is_complete: false },
          { habit_id: 4, title: 'Без соцсетей до 10:00', is_complete: false }
        ]
      },
      top_goals: { total_incomplete_goals: 3, goals: [] }
    }
    // DEV: mock XP and streaks
    xpStore.xpBalance = 420
    xpStore.todayXP = 35
    if (store.user) store.user.journal_streak = 5
  }
})

onUnmounted(() => {
  chatStore.disconnectWebSocket()
  document.removeEventListener('click', closeDropdowns)
})
</script>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
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

:root.dark .force-disconnect-banner {
  background: rgba(245, 158, 11, 0.12);
  border-top-color: rgba(245, 158, 11, 0.25);
  color: #fbbf24;
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

.skip-onboarding-btn {
  padding: 6px 14px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.skip-onboarding-btn:hover:not(:disabled) {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--text-secondary);
}

.skip-onboarding-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.quick-replies {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 0 4px 36px;
}

.quick-reply-chip {
  padding: 8px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--primary-color);
  border-radius: 20px;
  font-size: 0.875rem;
  color: var(--primary-color);
  cursor: pointer;
  transition: all var(--transition-fast);
  line-height: 1.4;
  min-height: 44px;
  display: flex;
  align-items: center;
}

.quick-reply-chip:hover:not(:disabled) {
  background: var(--primary-light);
  border-color: var(--primary-dark);
  color: var(--primary-dark);
}

.quick-reply-chip:active:not(:disabled) {
  transform: scale(0.97);
}

.quick-reply-chip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .chat-view {
    height: auto;
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

/* ─── Top bar (XP + стрики + задачи/привычки в одну строку) ─── */

.top-bar {
  flex-shrink: 0;
  padding: 1.5rem 1rem 0.5rem;
  position: relative;
  display: flex;
  justify-content: center;
}

.top-menu {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  overflow: visible;
  width: 100%;
  max-width: 680px;
}

.top-menu-divider {
  width: 1px;
  height: 20px;
  background: var(--border-color);
  flex-shrink: 0;
}

/* ─── Пустой экран (Claude-like) ─── */

.empty-state {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  padding-bottom: 18vh;
  position: relative;
}

.empty-top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 12px 0;
}

.mentor-avatar-sm {
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

.empty-center {
  width: 100%;
  max-width: 680px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.greeting-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  line-height: 1.2;
  margin: 0;
}

.empty-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 14px 14px 14px 18px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.empty-input-wrapper:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 2px 20px rgba(99, 102, 241, 0.1);
}

.empty-input-wrapper textarea {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 1rem;
  resize: none;
  outline: none;
  line-height: 1.6;
  max-height: 160px;
  overflow-y: auto;
  font-family: inherit;
}

.empty-input-wrapper textarea::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.empty-send-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--primary-color);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.empty-send-btn:hover:not(:disabled) {
  opacity: 0.88;
  transform: scale(1.05);
}

.empty-send-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.empty-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.prompt-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.prompt-chip:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(99, 102, 241, 0.05);
}

.prompt-chip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.strip-item-wrap {
  position: static;
  flex: 1;
  min-width: 0;
}

.strip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  background: transparent;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: color 0.2s;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-family: inherit;
}

.strip-item:hover,
.strip-item.active {
  color: var(--text-primary);
}

.strip-label {
  font-weight: 500;
  white-space: nowrap;
}

.strip-progress-bar {
  flex: 1;
  height: 3px;
  background: var(--bg-secondary);
  border-radius: 2px;
  overflow: hidden;
  min-width: 20px;
}

.strip-progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
}

.strip-progress-fill.tasks {
  background: var(--primary-color);
}

.strip-progress-fill.habits {
  background: #f59e0b;
}

.strip-chevron {
  flex-shrink: 0;
  transition: transform 0.25s ease;
  color: var(--text-secondary);
}

.strip-chevron.rotated {
  transform: rotate(180deg);
}

/* Dropdown */
.strip-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: hidden;
}

.dropdown-list {
  max-height: 220px;
  overflow-y: auto;
  padding: 6px;
}

.dropdown-task-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  min-height: 40px;
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--text-primary);
  transition: background 0.15s;
  user-select: none;
}

.dropdown-task-row:hover {
  background: var(--bg-secondary);
}

.dropdown-task-row.completed .dropdown-task-text {
  text-decoration: line-through;
  color: var(--text-tertiary, var(--text-secondary));
}

.dropdown-task-check {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  accent-color: var(--primary-color);
  cursor: pointer;
  border-radius: 4px;
}

.dropdown-task-text {
  flex: 1;
  min-width: 0;
  white-space: normal;
  line-height: 1.4;
}

.dropdown-task-sphere {
  font-size: 0.6875rem;
  color: var(--text-secondary);
  padding: 2px 7px;
  background: var(--bg-secondary);
  border-radius: 20px;
  white-space: nowrap;
  flex-shrink: 0;
  font-weight: 400;
}

.dropdown-nav-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-top: 1px solid var(--border-color);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--primary-color);
  text-decoration: none;
  transition: background 0.15s;
}

.dropdown-nav-link:hover {
  background: rgba(99, 102, 241, 0.05);
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 768px) {
  .top-bar {
    padding-top: 4px;
  }

  .top-menu {
    width: 100%;
  }

  .top-menu .strip-item-wrap {
    flex: 1;
    min-width: 0;
  }

  .top-menu .strip-item {
    padding: 8px 10px;
    font-size: 0.8125rem;
    gap: 6px;
  }

  .top-menu .strip-progress-bar {
    display: none;
  }

  .empty-state {
    padding-top: 1rem;
    padding-bottom: 12vh;
  }

  .greeting-title {
    font-size: 1.5rem;
  }

  .empty-center {
    gap: 1.5rem;
  }

  .empty-chips {
    gap: 6px;
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    justify-content: flex-start;
    padding-bottom: 2px;
  }

  .empty-chips::-webkit-scrollbar {
    display: none;
  }

  .prompt-chip {
    font-size: 0.8125rem;
    padding: 7px 12px;
    flex-shrink: 0;
  }

  .strip-item {
    padding: 9px 12px;
    font-size: 0.8125rem;
  }

  /* Dropdown on mobile: stretch to full chat width */
  .strip-item-wrap {
    position: static;
  }

  .strip-dropdown {
    left: 0;
    right: 0;
  }
}

/* ─── Home stats (XP + streaks) ─── */

.home-stat {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  background: transparent;
  border: none;
  border-radius: 100px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
  flex-shrink: 0;
  transition: opacity 0.15s;
}

.home-stat:hover {
  opacity: 0.7;
}

.home-stat-icon.xp { color: var(--warning-color); }
.home-stat-icon.streak { color: var(--danger-color, #ef4444); }
.home-stat-icon.journal { color: var(--primary-color); }
</style>
