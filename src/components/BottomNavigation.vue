<template>
  <nav class="bottom-nav" role="navigation" aria-label="Main navigation">
    <router-link
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="nav-item"
      :class="{ active: isActive(item.path) }"
      :aria-current="isActive(item.path) ? 'page' : undefined"
    >
      <span class="nav-icon">
        <component :is="item.icon" :size="22" :stroke-width="1.5" />
      </span>
      <span class="nav-label">{{ item.label }}</span>
      <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Home, Target, Calendar, BookOpen, Menu } from 'lucide-vue-next'

const route = useRoute()

const navItems = [
  { path: '/app', icon: Home, label: 'Главная' },
  { path: '/app/goals-bank', icon: Target, label: 'Цели' },
  { path: '/app/planning', icon: Calendar, label: 'План' },
  { path: '/app/journal', icon: BookOpen, label: 'Дневник' },
  { path: '/app/more', icon: Menu, label: 'Ещё' }
]

const isActive = (path) => {
  if (path === '/app') return route.path === '/app'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(var(--bottom-nav-height) + var(--safe-area-bottom));
  padding-bottom: var(--safe-area-bottom);
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-around;
  align-items: stretch;
  z-index: 1100;

  /* Glassmorphism effect */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: rgba(var(--bg-primary-rgb, 255, 255, 255), 0.85);
}

:root.dark .bottom-nav {
  background: rgba(18, 18, 18, 0.9);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  flex: 1;
  min-width: 64px;
  min-height: var(--touch-target);
  padding: 6px 12px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.15s ease;
  position: relative;
}

.nav-item.active {
  color: var(--primary-color);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 2px;
  background: var(--primary-color);
  border-radius: 0 0 2px 2px;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.nav-label {
  font-size: 0.625rem;
  font-weight: 500;
  line-height: 1;
}

.nav-badge {
  position: absolute;
  top: 4px;
  right: calc(50% - 20px);
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: var(--danger-color);
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .nav-item {
    transition: none;
  }
}

/* Hide on desktop, show on mobile */
@media (min-width: 769px) {
  .bottom-nav {
    display: none;
  }
}
</style>
