<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h1 class="logo">OnePercent</h1>
      <p class="tagline">+1% каждый день</p>
    </div>

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
        >
          <component :is="item.icon" class="icon" :size="20" :stroke-width="1.5" />
          <span>{{ item.label }}</span>
        </router-link>

        <div 
          v-else
          class="nav-item disabled"
          :class="{ 'has-lock': item.showLock }"
          :title="item.showLock ? lockTooltip : ''"
        >
          <component :is="item.icon" class="icon" :size="20" :stroke-width="1.5" />
          <span>{{ item.label }}</span>
          <Lock v-if="item.showLock" class="lock-icon" :size="14" :stroke-width="1.5" />
        </div>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info" v-if="store.isAuthenticated">
        <User class="user-avatar" :size="24" :stroke-width="1.5" />
        <span class="user-name">{{ store.displayName }}</span>
      </div>
      <router-link to="/app/settings" class="settings-link">
        <Settings class="icon" :size="20" :stroke-width="1.5" />
        <span>Настройки</span>
      </router-link>
      <router-link to="/auth/logout" class="logout-link">
        <LogOut class="icon" :size="20" :stroke-width="1.5" />
        <span>Выйти</span>
      </router-link>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
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
  Lock
} from 'lucide-vue-next'

const store = useAppStore()

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
}

.sidebar-header {
  padding: 2rem 1.5rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
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

.tagline {
  font-size: 0.875rem;
  color: var(--text-secondary);
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
