<template>
  <button class="mobile-menu-btn" @click="toggleMobile" :class="{ hidden: isMobileOpen, 'scroll-hidden': isScrollHidden }">
    <Menu :size="24" :stroke-width="1.5" />
  </button>
  
  <div class="mobile-overlay" :class="{ visible: isMobileOpen }" @click="closeMobile"></div>
  
  <aside class="sidebar" :class="{ collapsed: isCollapsed, 'mobile-open': isMobileOpen }">
    <div class="sidebar-header">
      <h1 class="logo" v-show="!isCollapsed">OnePercent</h1>
      <h1 class="logo-short" v-show="isCollapsed">1%</h1>
      <p class="tagline" v-show="!isCollapsed">+1% каждый день</p>
      <button class="mobile-close-btn" @click="closeMobile">
        <X :size="24" :stroke-width="1.5" />
      </button>
    </div>

    <button class="collapse-btn" @click="toggleCollapse" :title="isCollapsed ? 'Развернуть меню' : 'Свернуть меню'">
      <ChevronLeft class="collapse-icon" :class="{ rotated: isCollapsed }" :size="20" :stroke-width="1.5" />
    </button>

    <nav class="sidebar-nav">
      <div 
        v-for="item in menuItems" 
        :key="item.path"
        class="nav-item-wrapper"
      >
        <router-link 
          v-if="!item.locked || hasAccess"
          :to="item.path" 
          class="nav-item" 
          active-class="active"
          :title="isCollapsed ? item.label : ''"
        >
          <component :is="item.icon" class="icon" :size="20" :stroke-width="1.5" />
          <span class="nav-label">{{ item.label }}</span>
        </router-link>

        <div 
          v-else
          class="nav-item disabled"
          :class="{ 'has-lock': item.showLock }"
          :title="isCollapsed ? item.label : (item.showLock ? lockTooltip : '')"
        >
          <component :is="item.icon" class="icon" :size="20" :stroke-width="1.5" />
          <span class="nav-label">{{ item.label }}</span>
          <Lock v-if="item.showLock && !isCollapsed" class="lock-icon" :size="14" :stroke-width="1.5" />
        </div>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="theme-toggle" @click="toggleTheme" :title="isDark ? 'Светлая тема' : 'Тёмная тема'">
        <Sun v-if="isDark" class="theme-icon" :size="20" :stroke-width="1.5" />
        <Moon v-else class="theme-icon" :size="20" :stroke-width="1.5" />
        <span class="nav-label">{{ isDark ? 'Светлая тема' : 'Тёмная тема' }}</span>
      </div>
      
      <!-- User info and Telegram bot temporarily hidden
      <div class="user-info" v-if="store.isAuthenticated && !isCollapsed">
        <User class="user-avatar" :size="24" :stroke-width="1.5" />
        <span class="user-name">{{ store.displayName }}</span>
      </div>
      
      <button 
        v-if="store.user.telegram_bot_link"
        class="telegram-btn" 
        @click="showTelegramModal = true"
        :title="isCollapsed ? 'Телеграм бот' : ''"
      >
        <Send class="icon telegram-icon" :size="20" :stroke-width="1.5" />
        <span class="nav-label">Телеграм бот</span>
      </button>
      -->
      
      <router-link to="/app/settings" class="settings-link" :title="isCollapsed ? 'Настройки' : ''">
        <Settings class="icon" :size="20" :stroke-width="1.5" />
        <span class="nav-label">Настройки</span>
      </router-link>
      <router-link to="/auth/logout" class="logout-link" :title="isCollapsed ? 'Выйти' : ''">
        <LogOut class="icon" :size="20" :stroke-width="1.5" />
        <span class="nav-label">Выйти</span>
      </router-link>
    </div>
  </aside>

  <!-- Telegram modal temporarily hidden
  <Teleport to="body">
    <div v-if="showTelegramModal" class="modal-overlay" @click.self="showTelegramModal = false">
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-icon-wrapper">
            <Send class="modal-icon" :size="24" :stroke-width="1.5" />
          </div>
          <h2 class="modal-title">Подключите Telegram-бота</h2>
          <button class="modal-close" @click="showTelegramModal = false">
            <X :size="20" :stroke-width="1.5" />
          </button>
        </div>
        
        <div class="modal-body">
          <p class="modal-description">
            Telegram-бот поможет вам получать напоминания о задачах, отслеживать прогресс и оставаться в курсе своих целей.
          </p>
          
          <div class="telegram-link-section">
            <label class="link-label">Ваша персональная ссылка:</label>
            <div class="link-container">
              <input 
                type="text" 
                class="link-input" 
                :value="store.user.telegram_bot_link" 
                readonly 
                ref="linkInput"
              />
              <button class="copy-btn" @click="copyLink" :title="copied ? 'Скопировано!' : 'Скопировать'">
                <Check v-if="copied" class="copy-icon success" :size="18" :stroke-width="2" />
                <Copy v-else class="copy-icon" :size="18" :stroke-width="1.5" />
              </button>
            </div>
          </div>
          
          <a 
            :href="store.user.telegram_bot_link" 
            target="_blank" 
            rel="noopener noreferrer"
            class="open-telegram-btn"
          >
            <Send :size="18" :stroke-width="1.5" />
            Открыть в Telegram
            <ExternalLink :size="14" :stroke-width="1.5" />
          </a>
        </div>
      </div>
    </div>
  </Teleport>
  -->
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { 
  BarChart3, 
  Target, 
  Landmark, 
  Calendar, 
  Zap, 
  Gem, 
  Users, 
  Award,
  User,
  Settings,
  LogOut,
  Lock,
  ChevronLeft,
  Sun,
  Moon,
  Send,
  X,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  GraduationCap,
  Menu,
  Flame
} from 'lucide-vue-next'
import { useRoute } from 'vue-router'

const store = useAppStore()
const route = useRoute()
const emit = defineEmits(['collapse-change'])

const isCollapsed = ref(false)
const isDark = ref(false)
const showTelegramModal = ref(false)
const copied = ref(false)
const linkInput = ref(null)
const isMobileOpen = ref(false)
const isMobile = ref(false)
const isScrollHidden = ref(false)
let lastScrollY = 0
let scrollThreshold = 50

function toggleMobile() {
  isMobileOpen.value = !isMobileOpen.value
  if (isMobileOpen.value) {
    document.body.style.overflow = 'hidden'
    store.closeMentorMobile()
  } else {
    document.body.style.overflow = ''
  }
}

function closeMobile() {
  isMobileOpen.value = false
  document.body.style.overflow = ''
}

function checkMobile() {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    isCollapsed.value = false
  } else {
    closeMobile()
  }
}

function handleScroll() {
  if (!isMobile.value) return
  
  const currentScrollY = window.scrollY
  
  if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
    isScrollHidden.value = true
  } else if (currentScrollY < lastScrollY) {
    isScrollHidden.value = false
  }
  
  lastScrollY = currentScrollY
}

function copyLink() {
  if (store.user.telegram_bot_link) {
    navigator.clipboard.writeText(store.user.telegram_bot_link)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

onMounted(() => {
  const savedCollapsed = localStorage.getItem('sidebar-collapsed')
  if (savedCollapsed !== null) {
    isCollapsed.value = savedCollapsed === 'true'
    emit('collapse-change', isCollapsed.value)
  }
  
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else if (savedTheme === 'light') {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = prefersDark
    if (prefersDark) {
      document.documentElement.classList.add('dark')
    }
  }
  
  checkMobile()
  window.addEventListener('resize', checkMobile)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = ''
})

watch(() => route.path, () => {
  if (isMobile.value) {
    closeMobile()
  }
})

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebar-collapsed', isCollapsed.value.toString())
  emit('collapse-change', isCollapsed.value)
}

function toggleTheme() {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

const hasAccess = computed(() => {
  return store.payment.completed
})

const lockTooltip = 'Для доступа в систему необходима подписка'

const menuItems = [
  { path: '/app', icon: BarChart3, label: 'Главная', locked: false, showLock: false },
  { path: '/app/ssp', icon: Target, label: 'ССП', locked: false, showLock: false },
  { path: '/app/goals-bank', icon: Landmark, label: 'Банк целей', locked: false, showLock: false },
  { path: '/app/planning', icon: Calendar, label: 'Планирование', locked: false, showLock: false },
  { path: '/app/journal', icon: BookOpen, label: 'Дневник', locked: false, showLock: false },
  { path: '/app/habits', icon: Flame, label: 'Привычки', locked: false, showLock: false },
  { path: '/app/achievements', icon: Award, label: 'Достижения', locked: false, showLock: false },
  { path: '/app/learning', icon: GraduationCap, label: 'Обучение', locked: false, showLock: false },
  { path: '/app/energy', icon: Zap, label: 'Ресурс и энергия', locked: true, showLock: false },
  { path: '/app/principles', icon: Gem, label: 'Принципы и убеждения', locked: true, showLock: false },
  { path: '/app/club', icon: Users, label: 'Клуб 1%', locked: true, showLock: false }
]
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 280px;
  height: 100vh;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 72px;
}

.sidebar-header {
  padding: 2rem 1.5rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  min-height: 100px;
}

.sidebar.collapsed .sidebar-header {
  padding: 2rem 0.75rem 1.5rem;
  text-align: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.25rem;
}

.logo-short {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0;
}

.tagline {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.collapse-btn {
  position: absolute;
  top: 110px;
  right: -12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 101;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.collapse-btn:hover {
  background: var(--bg-tertiary);
  box-shadow: var(--shadow-md);
}

.collapse-icon {
  color: var(--text-secondary);
  transition: transform 0.3s ease;
}

.collapse-icon.rotated {
  transform: rotate(180deg);
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
}

.sidebar.collapsed .nav-item {
  padding: 0.875rem;
  justify-content: center;
}

.nav-label {
  white-space: nowrap;
  overflow: hidden;
  transition: opacity 0.2s ease, width 0.3s ease;
}

.sidebar.collapsed .nav-label {
  opacity: 0;
  width: 0;
  display: none;
}

.nav-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.nav-item.active {
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.1), transparent);
  color: var(--primary-color);
  border-left: 3px solid var(--primary-color);
  padding-left: calc(1.5rem - 3px);
}

.sidebar.collapsed .nav-item.active {
  padding-left: calc(0.875rem - 3px);
  background: rgba(99, 102, 241, 0.1);
}

.nav-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  color: var(--text-secondary);
}

.nav-item.disabled:hover {
  background: transparent;
  color: var(--text-secondary);
}

.icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: #9ca3af;
  transition: color 0.2s ease;
}

.nav-item:hover .icon {
  color: var(--text-primary);
}

.nav-item.active .icon {
  color: var(--primary-color);
}

.lock-icon {
  margin-left: auto;
  width: 14px;
  height: 14px;
  color: #9ca3af;
  opacity: 0.6;
}

.nav-item.has-lock {
  position: relative;
  cursor: help;
}

.sidebar-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

.sidebar.collapsed .sidebar-footer {
  padding: 1rem 0.5rem;
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 0.5rem;
}

.sidebar.collapsed .theme-toggle {
  justify-content: center;
  padding: 0.75rem;
}

.theme-toggle:hover {
  color: var(--text-primary);
}

.theme-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--warning-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.user-avatar {
  width: 24px;
  height: 24px;
  color: #9ca3af;
}

.user-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9375rem;
}

.settings-link,
.logout-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
}

.sidebar.collapsed .settings-link,
.sidebar.collapsed .logout-link {
  justify-content: center;
  padding: 0.75rem;
}

.settings-link:hover,
.logout-link:hover {
  color: var(--text-primary);
}

.logout-link {
  color: var(--danger-color);
}

.logout-link:hover {
  color: var(--danger-color);
  opacity: 0.8;
}

.telegram-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  color: var(--text-secondary);
  font-size: 0.9375rem;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all 0.2s ease;
}

.sidebar.collapsed .telegram-btn {
  justify-content: center;
  padding: 0.75rem;
}

.telegram-btn:hover {
  color: var(--text-primary);
}

.telegram-icon {
  color: #0088cc;
}

.telegram-btn:hover .telegram-icon {
  color: #0099dd;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: var(--bg-primary);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  animation: modalSlideIn 0.2s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.modal-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0088cc, #00aaff);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-icon {
  color: white;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.modal-description {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
}

.telegram-link-section {
  margin-bottom: 1.25rem;
}

.link-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.link-container {
  display: flex;
  gap: 0.5rem;
}

.link-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-family: monospace;
  min-width: 0;
}

.link-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.copy-btn {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.copy-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
}

.copy-icon {
  color: var(--text-secondary);
}

.copy-icon.success {
  color: var(--success-color);
}

.open-telegram-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem 1.25rem;
  background: linear-gradient(135deg, #0088cc, #00aaff);
  color: white;
  font-size: 0.9375rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.open-telegram-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 136, 204, 0.3);
}

.open-telegram-btn:active {
  transform: translateY(0);
}

.mobile-menu-btn {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 200;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  cursor: pointer;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.mobile-menu-btn:hover {
  background: var(--bg-tertiary);
}

.mobile-menu-btn.hidden {
  opacity: 0;
  pointer-events: none;
}

.mobile-menu-btn.scroll-hidden {
  transform: translateY(-100px);
  opacity: 0;
  pointer-events: none;
}

.mobile-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.mobile-overlay.visible {
  display: block;
  opacity: 1;
  pointer-events: auto;
}

.mobile-close-btn {
  display: none;
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--bg-tertiary);
  border: none;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.mobile-close-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }
  
  .mobile-overlay {
    display: block;
  }
  
  .mobile-close-btn {
    display: flex;
  }
  
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    width: 280px !important;
  }
  
  .sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .sidebar.collapsed {
    width: 280px !important;
  }
  
  .sidebar.collapsed .nav-label,
  .sidebar.collapsed .tagline {
    opacity: 1;
    width: auto;
    display: block;
  }
  
  .sidebar.collapsed .nav-item {
    padding: 0.875rem 1.5rem;
    justify-content: flex-start;
  }
  
  .sidebar.collapsed .sidebar-header {
    padding: 2rem 1.5rem 1.5rem;
    text-align: left;
  }
  
  .sidebar.collapsed .logo-short {
    display: none;
  }
  
  .sidebar.collapsed .logo {
    display: block !important;
  }
  
  .sidebar.collapsed .sidebar-footer {
    padding: 1rem 1.5rem;
  }
  
  .sidebar.collapsed .theme-toggle,
  .sidebar.collapsed .settings-link,
  .sidebar.collapsed .logout-link,
  .sidebar.collapsed .telegram-btn {
    justify-content: flex-start;
    padding: 0.75rem 0;
  }
  
  .collapse-btn {
    display: none;
  }
}
</style>
