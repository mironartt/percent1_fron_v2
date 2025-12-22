<template>
  <Teleport to="body">
    <div class="xp-notifications-container">
      <TransitionGroup name="xp-notification">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="xp-notification"
          :class="[`xp-notification--${notification.type}`, { 'xp-notification--hidden': !notification.visible }]"
        >
          <span class="xp-notification__icon">{{ notification.icon }}</span>
          <span class="xp-notification__amount">+{{ notification.amount }} XP</span>
          <span v-if="notification.message" class="xp-notification__message">{{ notification.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { xpNotificationState } from '@/composables/useXPNotification.js'

const notifications = computed(() => xpNotificationState.notifications.value)
</script>

<style scoped>
.xp-notifications-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.xp-notification {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95));
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
  color: white;
  font-weight: 600;
  pointer-events: auto;
  backdrop-filter: blur(8px);
}

.xp-notification--goal_completed {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.95), rgba(139, 92, 246, 0.95));
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
}

.xp-notification--journal_entry {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.95));
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
}

.xp-notification--hidden {
  opacity: 0;
  transform: translateX(100px);
}

.xp-notification__icon {
  font-size: 1.25rem;
}

.xp-notification__amount {
  font-size: 1.125rem;
  font-weight: 700;
}

.xp-notification__message {
  font-size: 0.875rem;
  opacity: 0.9;
  font-weight: 500;
}

.xp-notification-enter-active {
  animation: xp-slide-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.xp-notification-leave-active {
  animation: xp-slide-out 0.3s ease-in forwards;
}

@keyframes xp-slide-in {
  0% {
    opacity: 0;
    transform: translateX(100px) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes xp-slide-out {
  0% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(100px) scale(0.8);
  }
}

@media (max-width: 480px) {
  .xp-notifications-container {
    top: 70px;
    right: 10px;
    left: 10px;
  }
  
  .xp-notification {
    padding: 10px 14px;
    font-size: 0.9rem;
  }
  
  .xp-notification__amount {
    font-size: 1rem;
  }
  
  .xp-notification__message {
    font-size: 0.8rem;
  }
}
</style>
