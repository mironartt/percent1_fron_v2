<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast'
import { 
  CheckCircle, 
  Lightbulb, 
  Target, 
  Star, 
  Calendar, 
  BookOpen, 
  MessageCircle,
  X,
  ChevronRight,
  Info,
  AlertCircle,
  CheckCheck
} from 'lucide-vue-next'

const router = useRouter()
const toastStore = useToastStore()

const iconMap = {
  'check-circle': CheckCircle,
  'lightbulb': Lightbulb,
  'target': Target,
  'star': Star,
  'calendar': Calendar,
  'book-open': BookOpen,
  'message-circle': MessageCircle,
  'info': Info,
  'alert': AlertCircle,
  'success': CheckCheck
}

function getIcon(iconName) {
  return iconMap[iconName] || CheckCircle
}

function handleAction(toast) {
  if (toast.nextStepRoute) {
    router.push(toast.nextStepRoute)
  } else if (toast.actionRoute) {
    router.push(toast.actionRoute)
  }
  toastStore.removeToast(toast.id)
}

function dismissToast(id) {
  toastStore.removeToast(id)
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div 
          v-for="toast in toastStore.toasts" 
          :key="toast.id"
          class="toast"
          :class="[`toast--${toast.type}`]"
        >
          <div class="toast-icon">
            <component :is="getIcon(toast.icon)" :size="20" />
          </div>
          
          <div class="toast-content">
            <div class="toast-title">{{ toast.title }}</div>
            <div v-if="toast.message" class="toast-message">{{ toast.message }}</div>
            
            <button 
              v-if="toast.nextStepText || toast.actionText"
              class="toast-action"
              @click="handleAction(toast)"
            >
              {{ toast.nextStepText || toast.actionText }}
              <ChevronRight :size="14" />
            </button>
          </div>
          
          <button class="toast-close" @click="dismissToast(toast.id)">
            <X :size="16" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column-reverse;
  gap: 12px;
  max-width: 380px;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  position: relative;
}

.toast--first-step {
  border-left: 3px solid var(--success-color);
}

.toast--success {
  border-left: 3px solid var(--success-color);
}

.toast--info {
  border-left: 3px solid var(--primary-color);
}

.toast--warning {
  border-left: 3px solid var(--warning-color);
}

.toast--error {
  border-left: 3px solid var(--danger-color);
}

.toast-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--success-color);
  color: white;
}

.toast--info .toast-icon {
  background: var(--primary-color);
}

.toast--warning .toast-icon {
  background: var(--warning-color);
}

.toast--error .toast-icon {
  background: var(--danger-color);
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.toast-message {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.toast-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}

.toast-action:hover {
  opacity: 0.8;
}

.toast-close {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px;
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.toast-enter-active {
  animation: slideIn 0.3s ease;
}

.toast-leave-active {
  animation: slideOut 0.2s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

@media (max-width: 480px) {
  .toast-container {
    left: 16px;
    right: 16px;
    bottom: 16px;
    max-width: none;
  }
}
</style>
