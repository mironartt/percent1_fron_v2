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
          <span class="icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </router-link>

        <div 
          v-else
          class="nav-item disabled"
          :class="{ 'has-lock': item.showLock }"
          :title="item.showLock ? lockTooltip : ''"
        >
          <span class="icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
          <span v-if="item.showLock" class="lock-icon">🔒</span>
        </div>
      </div>
    </nav>

    <div class="sidebar-footer">
      <router-link to="/settings" class="settings-link">
        <span class="icon">⚙️</span>
        <span>Настройки</span>
      </router-link>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()

const hasAccess = computed(() => {
  // Доступ есть только если оплачена подписка
  return store.payment.completed
})

const lockTooltip = 'Для доступа в систему необходима подписка'

const menuItems = [
  { path: '/', icon: '📊', label: 'Главная', locked: false, showLock: false },
  { path: '/who', icon: '🧭', label: 'Кто ты', locked: true, showLock: false },
  { path: '/ssp', icon: '🎯', label: 'ССП', locked: false, showLock: false },
  { path: '/goals-bank', icon: '🏦', label: 'Банк целей', locked: false, showLock: false },
  { path: '/goals', icon: '🏆', label: 'Декомпозиция', locked: false, showLock: false },
  { path: '/planning', icon: '📅', label: 'Планирование', locked: false, showLock: false },
  { path: '/energy', icon: '⚡', label: 'Ресурс и энергия', locked: true, showLock: false },
  { path: '/principles', icon: '💎', label: 'Принципы и убеждения', locked: true, showLock: false },
  { path: '/club', icon: '👥', label: 'Клуб 1%', locked: true, showLock: false },
  { path: '/achievements', icon: '🏅', label: 'Достижения', locked: true, showLock: false }
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
  font-size: 1.25rem;
  width: 1.5rem;
  text-align: center;
}

.lock-icon {
  margin-left: auto;
  font-size: 0.875rem;
  opacity: 0.6;
}

.nav-item.has-lock {
  position: relative;
  cursor: help;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.settings-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 0;
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.settings-link:hover {
  color: var(--text-primary);
}

.settings-link .icon {
  font-size: 1.25rem;
  width: 1.5rem;
  text-align: center;
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
