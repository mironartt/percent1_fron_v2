<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo-container">
        <div class="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="logo-text">
          <span class="logo-name">OnePercent</span>
          <span class="logo-badge">MVP</span>
        </div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section">
        <div 
          v-for="item in mainMenuItems" 
          :key="item.path"
          class="nav-item-wrapper"
        >
          <router-link 
            v-if="!item.locked || hasAccess"
            :to="item.path" 
            class="nav-item" 
            active-class="active"
          >
            <span class="nav-icon" v-html="item.icon"></span>
            <span class="nav-label">{{ item.label }}</span>
            <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
          </router-link>

          <div 
            v-else
            class="nav-item disabled"
            :title="lockTooltip"
          >
            <span class="nav-icon" v-html="item.icon"></span>
            <span class="nav-label">{{ item.label }}</span>
            <span class="lock-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
          </div>
        </div>
      </div>

      <div class="nav-divider"></div>

      <div class="nav-section">
        <div class="nav-section-title">Инструменты</div>
        <div 
          v-for="item in toolsMenuItems" 
          :key="item.path"
          class="nav-item-wrapper"
        >
          <router-link 
            v-if="!item.locked || hasAccess"
            :to="item.path" 
            class="nav-item" 
            active-class="active"
          >
            <span class="nav-icon" v-html="item.icon"></span>
            <span class="nav-label">{{ item.label }}</span>
          </router-link>

          <div 
            v-else
            class="nav-item disabled"
            :title="lockTooltip"
          >
            <span class="nav-icon" v-html="item.icon"></span>
            <span class="nav-label">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </nav>

    <div class="sidebar-footer">
      <router-link to="/settings" class="nav-item" active-class="active">
        <span class="nav-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </span>
        <span class="nav-label">Настройки</span>
      </router-link>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()

const hasAccess = computed(() => {
  return store.payment.completed
})

const lockTooltip = 'Для доступа необходима подписка'

const mainMenuItems = [
  { 
    path: '/', 
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>', 
    label: 'Главная', 
    locked: true 
  },
  { 
    path: '/ssp', 
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/></svg>', 
    label: 'ССП', 
    locked: true 
  },
  { 
    path: '/goals', 
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>', 
    label: 'Банк целей', 
    locked: true 
  },
  { 
    path: '/planner', 
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>', 
    label: 'Планирование', 
    locked: true 
  }
]

const toolsMenuItems = [
  { 
    path: '/club', 
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', 
    label: 'Клуб 1%', 
    locked: true 
  }
]
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 240px;
  height: 100vh;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.sidebar-header {
  padding: 1rem 1rem;
  border-bottom: 1px solid var(--border-light);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.logo-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-md);
}

.logo-icon svg {
  width: 18px;
  height: 18px;
}

.logo-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
}

.logo-badge {
  font-size: 0.625rem;
  font-weight: 500;
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
}

.sidebar-nav {
  flex: 1;
  padding: 0.75rem 0;
  overflow-y: auto;
}

.nav-section {
  padding: 0 0.5rem;
}

.nav-section-title {
  padding: 0.5rem 0.75rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-divider {
  height: 1px;
  background: var(--border-light);
  margin: 0.5rem 1rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.75rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.8125rem;
  border-radius: var(--radius-md);
  transition: all 0.15s ease;
  margin-bottom: 2px;
}

.nav-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.nav-item.active {
  background: rgba(37, 99, 235, 0.08);
  color: var(--primary-color);
}

.nav-item.active .nav-icon {
  color: var(--primary-color);
}

.nav-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.nav-item.disabled:hover {
  background: transparent;
  color: var(--text-secondary);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.nav-icon svg {
  width: 18px;
  height: 18px;
}

.nav-label {
  flex: 1;
}

.nav-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  background: var(--primary-color);
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
}

.lock-icon {
  display: flex;
  align-items: center;
  color: var(--text-tertiary);
}

.sidebar-footer {
  padding: 0.75rem 0.5rem;
  border-top: 1px solid var(--border-light);
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
