<template>
  <div class="fab-container" :class="{ 'mentor-expanded': !mentorCollapsed }">
    <Transition name="fab-overlay">
      <div 
        v-if="isOpen" 
        class="fab-overlay"
        @click="close"
      ></div>
    </Transition>
    
    <Transition name="fab-menu">
      <div v-if="isOpen" class="fab-menu">
        <button
          v-for="(item, index) in menuItems"
          :key="item.id"
          class="fab-menu-item"
          :style="{ '--delay': index * 0.05 + 's' }"
          @click="handleItemClick(item)"
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
      :class="{ open: isOpen }"
      @click="toggle"
    >
      <Plus :size="24" :stroke-width="2" class="fab-icon" />
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'

const props = defineProps({
  menuItems: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['select'])

const store = useAppStore()
const isOpen = ref(false)

const mentorCollapsed = computed(() => store.mentorPanelCollapsed)

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function handleItemClick(item) {
  emit('select', item.id)
  close()
}
</script>

<style scoped>
.fab-container {
  position: fixed;
  right: 80px;
  bottom: 100px;
  z-index: 1000;
  transition: right 0.3s ease;
}

.fab-container.mentor-expanded {
  right: 400px;
}

@media (max-width: 768px) {
  .fab-container {
    display: none;
  }
}

.fab-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  z-index: -1;
}

.fab-overlay-enter-active,
.fab-overlay-leave-active {
  transition: opacity 0.2s ease;
}

.fab-overlay-enter-from,
.fab-overlay-leave-to {
  opacity: 0;
}

.fab-button {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
  transition: all 0.3s ease;
}

.fab-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
}

.fab-button:active {
  transform: scale(0.95);
}

.fab-button.open {
  background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
}

.fab-icon {
  transition: transform 0.3s ease;
}

.fab-button.open .fab-icon {
  transform: rotate(45deg);
}

.fab-menu {
  position: absolute;
  bottom: 70px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.fab-menu-item:hover .fab-menu-label {
  background: #f3f4f6;
  transform: translateX(-4px);
}

.fab-menu-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;
}

.fab-menu-item:hover .fab-menu-icon {
  transform: scale(1.1);
}
</style>
