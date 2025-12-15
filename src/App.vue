<template>
  <div id="app" :class="appClasses">
    <Sidebar v-if="hasSidebar" @collapse-change="onCollapseChange" />
    <main class="main-content">
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
    <MentorPanel v-if="showMentorPanel" />
    <ToastNotification />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import TelegramAuthModals from './components/TelegramAuthModals.vue'
import MentorPanel from './components/MentorPanel.vue'
import ToastNotification from './components/ToastNotification.vue'
import { useAppStore } from './stores/app'

const route = useRoute()
const store = useAppStore()
const sidebarCollapsed = ref(false)

onMounted(() => {
  const savedCollapsed = localStorage.getItem('sidebar-collapsed')
  if (savedCollapsed !== null) {
    sidebarCollapsed.value = savedCollapsed === 'true'
  }
})

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

const isOnboarding = computed(() => {
  return store.shouldShowOnboarding && route.path === '/app'
})

const hasSidebar = computed(() => !isAuthPage.value && !isOnboarding.value && !isLandingPage.value && !isLegalPage.value)

const isAppPage = computed(() => {
  return route.path === '/app' || route.path.startsWith('/app/')
})

const showMentorPanel = computed(() => {
  return hasSidebar.value && isAppPage.value && !isOnboarding.value
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
/* Global styles for mobile header spacing */
@media (max-width: 768px) {
  .page-header h1,
  .section-header h1 {
    margin-left: 2.5rem;
  }
}
</style>
