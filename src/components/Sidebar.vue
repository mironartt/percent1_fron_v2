<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <h1 class="logo" v-show="!isCollapsed">OnePercent</h1>
      <h1 class="logo-short" v-show="isCollapsed">1%</h1>
      <p class="tagline" v-show="!isCollapsed">+1% каждый день</p>
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
      
      <div class="user-info" v-if="store.isAuthenticated && !isCollapsed">
        <User class="user-avatar" :size="24" :stroke-width="1.5" />
        <span class="user-name">{{ store.displayName }}</span>
      </div>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { 
  BarChart3, 
  Compass, 
  Target, 
  Landmark, 
  Trophy, 
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
  Moon
} from 'lucide-vue-next'

const store = useAppStore()
const emit = defineEmits(['collapse-change'])

const isCollapsed = ref(false)
const isDark = ref(false)

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
  { path: '/app/who', icon: Compass, label: 'Кто ты', locked: true, showLock: false },
  { path: '/app/ssp', icon: Target, label: 'ССП', locked: false, showLock: false },
  { path: '/app/goals-bank', icon: Landmark, label: 'Банк целей', locked: false, showLock: false },
  { path: '/app/goals', icon: Trophy, label: 'Декомпозиция', locked: false, showLock: false },
  { path: '/app/planning', icon: Calendar, label: 'Планирование', locked: false, showLock: false },
  { path: '/app/energy', icon: Zap, label: 'Ресурс и энергия', locked: true, showLock: false },
  { path: '/app/principles', icon: Gem, label: 'Принципы и убеждения', locked: true, showLock: false },
  { path: '/app/club', icon: Users, label: 'Клуб 1%', locked: true, showLock: false },
  { path: '/app/achievements', icon: Award, label: 'Достижения', locked: true, showLock: false }
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
</style>
