<template>
  <nav class="bottom-nav" role="navigation" aria-label="Main navigation">
    <router-link
      v-for="item in leftNavItems"
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

    <div class="fab-spacer">
      <Transition name="fab-overlay">
        <div 
          v-if="fabOpen" 
          class="fab-overlay"
          @click="closeFab"
        ></div>
      </Transition>
      
      <Transition name="fab-menu">
        <div v-if="fabOpen" class="fab-menu">
          <button
            v-for="(item, index) in fabMenuItems"
            :key="item.id"
            class="fab-menu-item"
            :style="{ '--delay': index * 0.05 + 's' }"
            @click="handleFabItemClick(item)"
          >
            <span class="fab-menu-label">{{ item.label }}</span>
            <span class="fab-menu-icon" :style="{ background: item.color }">
              <component :is="item.icon" :size="20" :stroke-width="1.5" />
            </span>
          </button>
        </div>
      </Transition>
      
      <button 
        class="fab-button"
        :class="{ open: fabOpen }"
        @click="toggleFab"
        aria-label="Меню быстрых действий"
      >
        <Plus :size="28" :stroke-width="2.5" class="fab-icon" />
      </button>
    </div>

    <router-link
      v-for="item in rightNavItems"
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
  </nav>

  <QuickAddTask
    v-model="showQuickTask"
    @created="onQuickTaskCreated"
  />

  <AddGoalModal
    v-model="showAddGoalModal"
    @created="onGoalCreated"
    @open-mentor="openMentor"
  />

  <AddHabitModal
    v-model="showAddHabitModal"
    @created="onHabitCreated"
    @open-mentor="openMentor"
  />

  <JournalEntry
    v-if="showJournalModal"
    v-model="showJournalModal"
    :is-modal="true"
    @close="showJournalModal = false"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { Home, Target, Calendar, Menu, Plus, Zap, BookOpen, Dumbbell, MessageCircle } from 'lucide-vue-next'
import QuickAddTask from './QuickAddTask.vue'
import AddGoalModal from './AddGoalModal.vue'
import AddHabitModal from './AddHabitModal.vue'
import JournalEntry from './JournalEntry.vue'

const route = useRoute()
const router = useRouter()
const store = useAppStore()

const leftNavItems = [
  { path: '/app', icon: Home, label: 'Главная' },
  { path: '/app/goals-bank', icon: Target, label: 'Цели' }
]

const rightNavItems = [
  { path: '/app/planning', icon: Calendar, label: 'План' },
  { path: '/app/more', icon: Menu, label: 'Ещё' }
]

const fabMenuItems = [
  { id: 'task', label: 'Быстрая задача', icon: Zap, color: '#f59e0b' },
  { id: 'goal', label: 'Новая цель', icon: Target, color: '#10b981' },
  { id: 'journal', label: 'Запись в дневник', icon: BookOpen, color: '#8b5cf6' },
  { id: 'habit', label: 'Добавить привычку', icon: Dumbbell, color: '#3b82f6' },
  { id: 'mentor', label: 'AI ментор', icon: MessageCircle, color: '#ec4899' }
]

const fabOpen = ref(false)
const showQuickTask = ref(false)
const showAddGoalModal = ref(false)
const showAddHabitModal = ref(false)
const showJournalModal = ref(false)

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

function handleFabItemClick(item) {
  closeFab()
  switch (item.id) {
    case 'task':
      showQuickTask.value = true
      break
    case 'goal':
      showAddGoalModal.value = true
      break
    case 'journal':
      showJournalModal.value = true
      break
    case 'habit':
      showAddHabitModal.value = true
      break
    case 'mentor':
      openMentor()
      break
  }
}

function openMentor() {
  store.mentorPanelCollapsed = false
}

function onQuickTaskCreated(task) {
  showQuickTask.value = false
}

function onGoalCreated(goal) {
  showAddGoalModal.value = false
}

function onHabitCreated(habit) {
  showAddHabitModal.value = false
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

.fab-spacer {
  position: relative;
  flex: 1;
  min-width: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab-button {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #4f46e5;
  border: 4px solid var(--bg-primary);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
  transition: all 0.3s ease;
  z-index: 1070;
}

:root.dark .fab-button {
  border-color: #121212;
}

.fab-button:hover {
  transform: translateX(-50%) scale(1.05);
}

.fab-button:active {
  transform: translateX(-50%) scale(0.95);
}

.fab-button.open {
  background: #4f46e5;
}

.fab-icon {
  transition: transform 0.3s ease;
}

.fab-button.open .fab-icon {
  transform: rotate(45deg);
}

.fab-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1050;
}

.fab-overlay-enter-active,
.fab-overlay-leave-active {
  transition: opacity 0.2s ease;
}

.fab-overlay-enter-from,
.fab-overlay-leave-to {
  opacity: 0;
}

.fab-menu {
  position: fixed;
  bottom: calc(var(--bottom-nav-height) + var(--safe-area-bottom) + 20px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 1060;
}

.fab-menu-enter-active {
  transition: opacity 0.2s ease;
}

.fab-menu-leave-active {
  transition: opacity 0.15s ease;
}

.fab-menu-enter-from,
.fab-menu-leave-to {
  opacity: 0;
}

.fab-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  animation: slideIn 0.25s ease forwards;
  animation-delay: var(--delay);
  opacity: 0;
  transform: translateY(10px);
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fab-menu-label {
  background: white;
  color: #1f2937;
  padding: 12px 20px;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transition: all 0.2s ease;
}

:root.dark .fab-menu-label {
  background: #2d2d2d;
  color: #f5f5f5;
}

.fab-menu-item:hover .fab-menu-label {
  transform: translateX(-4px);
}

.fab-menu-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.fab-menu-item:hover .fab-menu-icon {
  transform: scale(1.1);
}

@media (prefers-reduced-motion: reduce) {
  .nav-item,
  .fab-button,
  .fab-icon,
  .fab-menu-item,
  .fab-menu-label,
  .fab-menu-icon {
    transition: none;
  }
  .fab-menu-item {
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
