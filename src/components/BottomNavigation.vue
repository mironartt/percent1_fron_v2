<template>
  <nav class="bottom-nav" role="navigation" aria-label="Main navigation">
    <router-link
      v-for="item in leftItems"
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
    </router-link>

    <div class="fab-wrapper">
      <Transition name="fab-overlay">
        <div v-if="fabOpen" class="fab-overlay-mobile" @click="closeFab"></div>
      </Transition>
      <Transition name="fab-menu">
        <div v-if="fabOpen" class="fab-menu-mobile">
          <button
            v-for="(item, index) in fabMenuItems"
            :key="item.id"
            class="fab-menu-item-mobile"
            :style="{ '--delay': index * 0.05 + 's' }"
            @click="handleFabAction(item.id)"
          >
            <span class="fab-menu-label-mobile">{{ item.label }}</span>
            <span class="fab-menu-icon-mobile" :style="{ background: item.color }">
              <component :is="item.icon" :size="18" :stroke-width="1.5" />
            </span>
          </button>
        </div>
      </Transition>
      <button class="fab-center" :class="{ open: fabOpen }" @click="toggleFab">
        <Plus :size="26" :stroke-width="2.5" class="fab-icon" />
      </button>
    </div>

    <router-link
      v-for="item in rightItems"
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
    </router-link>

    <button class="nav-item mentor-btn" @click="openMentor">
      <span class="nav-icon">
        <Bot :size="22" :stroke-width="1.5" />
      </span>
      <span class="nav-label">Ментор</span>
      <span v-if="unreadCount > 0" class="nav-badge">{{ unreadCount }}</span>
    </button>

    <router-link
      to="/app/more"
      class="nav-item"
      :class="{ active: isActive('/app/more') }"
    >
      <span class="nav-icon">
        <Menu :size="22" :stroke-width="1.5" />
      </span>
      <span class="nav-label">Ещё</span>
    </router-link>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Home, Target, Calendar, Menu, Plus, Bot, CheckSquare, Flag, BookOpen } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'

const emit = defineEmits(['fab-action'])

const route = useRoute()
const store = useAppStore()

const fabOpen = ref(false)

const leftItems = [
  { path: '/app', icon: Home, label: 'Главная' },
  { path: '/app/goals-bank', icon: Target, label: 'Цели' }
]

const rightItems = [
  { path: '/app/planning', icon: Calendar, label: 'План' }
]

const fabMenuItems = [
  { id: 'task', label: 'Задача', icon: CheckSquare, color: '#10b981' },
  { id: 'goal', label: 'Цель', icon: Flag, color: '#6366f1' },
  { id: 'journal', label: 'Дневник', icon: BookOpen, color: '#f59e0b' }
]

const unreadCount = computed(() => store.unreadMentorCount || 0)

const isActive = (path) => {
  if (path === '/app') return route.path === '/app'
  return route.path.startsWith(path)
}

function toggleFab() {
  fabOpen.value = !fabOpen.value
}

function closeFab() {
  fabOpen.value = false
}

function handleFabAction(actionId) {
  emit('fab-action', actionId)
  closeFab()
}

function openMentor() {
  store.openMentorMobile()
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
  min-width: 48px;
  min-height: var(--touch-target);
  padding: 6px 8px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.15s ease;
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
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
  font-size: 0.6rem;
  font-weight: 500;
  line-height: 1;
}

.nav-badge {
  position: absolute;
  top: 2px;
  right: calc(50% - 18px);
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

.fab-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
}

.fab-center {
  position: absolute;
  bottom: 8px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  border: 4px solid var(--bg-primary);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  z-index: 10;
}

:root.dark .fab-center {
  border-color: #121212;
}

.fab-center:active {
  transform: scale(0.95);
}

.fab-center.open {
  transform: rotate(45deg);
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
}

.fab-icon {
  transition: transform 0.2s ease;
}

.fab-overlay-mobile {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1099;
}

.fab-menu-mobile {
  position: absolute;
  bottom: 72px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 1101;
}

.fab-menu-item-mobile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  animation: fabItemSlide 0.2s ease forwards;
  animation-delay: var(--delay);
  opacity: 0;
  transform: translateY(10px);
}

@keyframes fabItemSlide {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fab-menu-label-mobile {
  padding: 8px 14px;
  background: var(--card-bg);
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
}

.fab-menu-icon-mobile {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.fab-overlay-enter-active,
.fab-overlay-leave-active {
  transition: opacity 0.2s ease;
}

.fab-overlay-enter-from,
.fab-overlay-leave-to {
  opacity: 0;
}

.fab-menu-enter-active,
.fab-menu-leave-active {
  transition: opacity 0.15s ease;
}

.fab-menu-enter-from,
.fab-menu-leave-to {
  opacity: 0;
}

.mentor-btn {
  color: var(--text-secondary);
}

@media (prefers-reduced-motion: reduce) {
  .nav-item,
  .fab-center,
  .fab-icon {
    transition: none;
  }
  .fab-menu-item-mobile {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

@media (min-width: 769px) {
  .bottom-nav {
    display: none;
  }
}
</style>
