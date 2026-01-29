<template>
  <div id="app" :class="appClasses">
    <ImpersonateBanner />
    <Sidebar v-if="hasSidebar" @collapse-change="onCollapseChange" />
    <main class="main-content">
      <TrialBanner v-if="showTrialBanner" />
      <router-view v-slot="{ Component, route }">
        <Suspense>
          <template #default>
            <div class="page-wrapper">
              <component :is="Component" :key="route.path" />
            </div>
          </template>
          <template #fallback>
            <div class="page-loading">
              <div class="loading-spinner"></div>
            </div>
          </template>
        </Suspense>
      </router-view>
    </main>
    <TelegramAuthModals />
    <PolicyAcceptanceModal 
      :show="showPolicyModal" 
      @accepted="onPolicyAccepted" 
    />
    <MentorPanel v-if="showMentorPanel" />
    <BottomNavigation v-if="showBottomNav" />
    <ToastNotification />
    <XPNotification />
    <WelcomeVideoModal ref="welcomeVideoModal" />
    <SubscriptionExpiredModal
      v-model="showSubscriptionExpiredModal"
      :type="subscriptionExpiredType"
      @continue-free="onSubscriptionModalClosed"
      @upgrade="onSubscriptionModalClosed"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, watchEffect, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import BottomNavigation from './components/BottomNavigation.vue'
import TelegramAuthModals from './components/TelegramAuthModals.vue'
import PolicyAcceptanceModal from './components/PolicyAcceptanceModal.vue'
import MentorPanel from './components/MentorPanel.vue'
import WelcomeVideoModal from './components/WelcomeVideoModal.vue'
import ToastNotification from './components/ToastNotification.vue'
import XPNotification from './components/XPNotification.vue'
import ImpersonateBanner from './components/ImpersonateBanner.vue'
import TrialBanner from './components/subscription/TrialBanner.vue'
import SubscriptionExpiredModal from './components/subscription/SubscriptionExpiredModal.vue'
import { useAppStore } from './stores/app'
import { useAITasksStore } from './stores/aiTasks'
import { useSubscriptionStore } from './stores/subscription'
import { useTelegram } from './composables/useTelegram'
import { telegramWebAppAuth, getUserData } from './services/api'
import { DEV_MODE, SKIP_AUTH_CHECK, SKIP_POLICY_CHECK, DEBUG_MODE } from './config/settings'

const route = useRoute()
const router = useRouter()
const store = useAppStore()
const aiTasksStore = useAITasksStore()
const subscriptionStore = useSubscriptionStore()
const sidebarCollapsed = ref(false)
const welcomeVideoModal = ref(null)
const showSubscriptionExpiredModal = ref(false)
const subscriptionExpiredType = ref('trial_expired')

// Telegram Mini Apps интеграция
const {
  isInTelegram,
  initData,
  themeParams,
  colorScheme,
  applyTelegramTheme,
} = useTelegram()

// Авторизация через Telegram Mini Apps
async function handleTelegramAuth() {
  if (!isInTelegram.value || !initData.value) {
    return
  }

  // Если уже авторизован — пропускаем
  if (store.isAuthenticated) {
    console.log('[TWA] Already authenticated, skipping TWA auth')
    return
  }

  console.log('[TWA] Starting authentication...')

  try {
    const response = await telegramWebAppAuth(initData.value)

    if (response.status === 'ok') {
      console.log('[TWA] Auth successful:', response.data)

      // Загружаем данные пользователя
      const userData = await getUserData()
      if (userData.status === 'ok') {
        store.setUser(userData.data)
      }

      // Если нужно завершить регистрацию
      if (response.data.needs_registration_complete) {
        console.log('[TWA] Needs registration complete, redirecting...')
        router.push('/app/?telegram_complete_registration=1')
      } else if (route.path === '/' || route.path === '/auth/login') {
        // Редирект на дашборд если на лендинге или логине
        router.push('/app')
      }
    } else {
      console.error('[TWA] Auth failed:', response)
    }
  } catch (error) {
    console.error('[TWA] Auth error:', error)
  }
}

onMounted(async () => {
  const savedCollapsed = localStorage.getItem('sidebar-collapsed')
  if (savedCollapsed !== null) {
    sidebarCollapsed.value = savedCollapsed === 'true'
  }

  // Применяем тему Telegram если запущены из TWA
  if (isInTelegram.value) {
    applyTelegramTheme()
  }

  // Авторизация через Telegram Mini Apps
  await handleTelegramAuth()

  // WebSocket подключается только на страницах /app/
  if (store.isAuthenticated && route.path.startsWith('/app')) {
    aiTasksStore.connect()
    
    // Показываем приветственное видео при первом визите
    nextTick(() => {
      welcomeVideoModal.value?.show()
    })
  }
})

// Следим за изменением темы Telegram
watchEffect(() => {
  if (isInTelegram.value && themeParams.value) {
    applyTelegramTheme()
  }
})

// WebSocket подключение только для страниц /app/
watch([() => store.isAuthenticated, () => route.path], ([isAuth, path], [wasAuth, wasPath]) => {
  const isAppRoute = path?.startsWith('/app')
  const wasAppRoute = wasPath?.startsWith('/app')
  
  if (isAuth && isAppRoute && !aiTasksStore.isConnected && !aiTasksStore.isConnecting) {
    aiTasksStore.connect()
  } else if ((!isAuth && wasAuth) || (wasAppRoute && !isAppRoute)) {
    // User logged out or left /app/ - disconnect
    if (aiTasksStore.isConnected) {
      aiTasksStore.disconnect()
    }
  }
  
  // Show welcome video when user enters /app for the first time
  if (isAuth && isAppRoute && (!wasAuth || !wasAppRoute)) {
    nextTick(() => {
      welcomeVideoModal.value?.show()
    })
  }
  
  // Check subscription modals when entering app
  if (isAuth && isAppRoute) {
    nextTick(() => {
      checkSubscriptionModals()
    })
  }
})

// Watch subscription state for modal display
watch(
  () => [subscriptionStore.shouldShowTrialExpiredModal, subscriptionStore.shouldShowPaidExpiredModal],
  ([showTrial, showPaid]) => {
    if (store.isAuthenticated && isAppPage.value) {
      if (showTrial && !showSubscriptionExpiredModal.value) {
        subscriptionExpiredType.value = 'trial_expired'
        showSubscriptionExpiredModal.value = true
      } else if (showPaid && !showSubscriptionExpiredModal.value) {
        subscriptionExpiredType.value = 'paid_expired'
        showSubscriptionExpiredModal.value = true
      }
    }
  }
)

function onCollapseChange(collapsed) {
  sidebarCollapsed.value = collapsed
}

const isAuthPage = computed(() => {
  return route.name === 'register' || route.name === 'login'
})

const isLandingPage = computed(() => {
  return route.name === 'landing' || route.path === '/' || route.path.startsWith('/land')
})

const isLegalPage = computed(() => {
  return route.name === 'privacy' || route.name === 'terms' || route.name === 'disclaimer'
})

const isCatalogPage = computed(() => {
  return route.path.startsWith('/catalog')
})

const isOnboarding = computed(() => {
  return store.shouldShowOnboarding && route.path === '/app'
})

const hasSidebar = computed(() => !isAuthPage.value && !isOnboarding.value && !isLandingPage.value && !isLegalPage.value && !isCatalogPage.value)

const isAppPage = computed(() => {
  return route.path === '/app' || route.path.startsWith('/app/')
})

const showMentorPanel = computed(() => {
  return hasSidebar.value && isAppPage.value && !isOnboarding.value
})

const showBottomNav = computed(() => {
  return hasSidebar.value && isAppPage.value && !isOnboarding.value
})

const showPolicyModal = computed(() => {
  // Пропускаем модал политик в режиме разработки
  if (SKIP_POLICY_CHECK) {
    return false
  }
  return store.isAuthenticated && store.needsPolicyAcceptance && isAppPage.value
})

function onPolicyAccepted() {
  console.log('[App] Policy accepted by user')
}

function onSubscriptionModalClosed() {
  showSubscriptionExpiredModal.value = false
}

function checkSubscriptionModals() {
  if (!store.isAuthenticated) return
  
  if (subscriptionStore.shouldShowTrialExpiredModal) {
    subscriptionExpiredType.value = 'trial_expired'
    showSubscriptionExpiredModal.value = true
  } else if (subscriptionStore.shouldShowPaidExpiredModal) {
    subscriptionExpiredType.value = 'paid_expired'
    showSubscriptionExpiredModal.value = true
  }
}

const showTrialBanner = computed(() => {
  if (!store.isAuthenticated) return false
  if (!isAppPage.value) return false
  if (isOnboarding.value) return false
  
  const state = subscriptionStore.subscriptionState
  return ['trial_normal', 'trial_warning', 'trial_danger', 'freemium'].includes(state)
})

const appClasses = computed(() => ({
  'has-sidebar': hasSidebar.value,
  'sidebar-collapsed': hasSidebar.value && sidebarCollapsed.value,
  'has-mentor-panel': showMentorPanel.value,
  'mentor-collapsed': showMentorPanel.value && store.mentorPanelCollapsed
}))
</script>

<style scoped>
#app {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 0;
  padding: 0;
  background: var(--bg-secondary);
  transition: margin-left 0.3s ease;
}

#app.has-sidebar .main-content {
  margin-left: 280px;
  padding: 2rem;
}

#app.has-sidebar.sidebar-collapsed .main-content {
  margin-left: 72px;
}

@media (min-width: 1024px) {
  #app.has-mentor-panel .main-content {
    margin-right: 460px;
    transition: margin-left 0.3s ease, margin-right 0.3s ease;
  }
  
  #app.has-mentor-panel.mentor-collapsed .main-content {
    margin-right: 56px;
  }
}

@media (max-width: 768px) {
  #app.has-sidebar .main-content,
  #app.has-sidebar.sidebar-collapsed .main-content {
    margin-left: 0;
    padding: 1rem;
    overflow-x: hidden;
  }
}

.page-wrapper {
  width: 100%;
  height: 100%;
}

.page-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  width: 100%;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color, #e5e5e5);
  border-top-color: var(--primary-color, #3b82f6);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

<style>
/* Global spin animation for loaders */
.spin {
  animation: spin 1s linear infinite;
}

/* Global styles for mobile header spacing */
@media (max-width: 768px) {
  .page-header h1,
  .section-header h1 {
    margin-left: 2.5rem;
  }
}

/* Telegram Mini Apps theme integration */
:root {
  /* Default TWA colors (will be overwritten by JS) */
  --tg-bg-color: #ffffff;
  --tg-text-color: #1f2937;
  --tg-hint-color: #6b7280;
  --tg-link-color: #4f46e5;
  --tg-button-color: #4f46e5;
  --tg-button-text-color: #ffffff;
  --tg-secondary-bg-color: #f9fafb;
}

/* Apply Telegram theme when in TWA */
.in-telegram {
  --bg-primary: var(--tg-bg-color);
  --bg-secondary: var(--tg-secondary-bg-color);
  --text-primary: var(--tg-text-color);
  --text-secondary: var(--tg-hint-color);
  --primary-color: var(--tg-button-color);
}

.in-telegram.telegram-dark {
  --bg-primary: var(--tg-bg-color);
  --bg-secondary: var(--tg-secondary-bg-color);
  --text-primary: var(--tg-text-color);
  --text-secondary: var(--tg-hint-color);
}

/* Hide browser-specific elements in TWA */
.in-telegram .hide-in-telegram {
  display: none !important;
}
</style>
