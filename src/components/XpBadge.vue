<template>
  <div class="xp-badge" :class="{ 'has-notification': showNotification }" @click="$emit('click')">
    <div class="xp-icon">
      <Sparkles :size="16" :stroke-width="1.5" />
    </div>
    <div class="xp-info">
      <span class="xp-value">{{ formattedXP }}</span>
      <span class="xp-label">XP</span>
    </div>
    <transition name="xp-popup">
      <div v-if="showNotification" class="xp-notification">
        +{{ lastEarned }} XP
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useXpStore } from '../stores/xp'
import { Sparkles } from 'lucide-vue-next'

const emit = defineEmits(['click'])

const xpStore = useXpStore()

const showNotification = ref(false)
const lastEarned = ref(0)
const previousBalance = ref(xpStore.xpBalance)

const formattedXP = computed(() => {
  const xp = xpStore.xpBalance
  if (xp >= 1000) {
    return (xp / 1000).toFixed(1) + 'k'
  }
  return xp
})

watch(() => xpStore.xpBalance, (newVal, oldVal) => {
  if (newVal > oldVal) {
    lastEarned.value = newVal - oldVal
    showNotification.value = true
    setTimeout(() => {
      showNotification.value = false
    }, 2000)
  }
  previousBalance.value = newVal
})
</script>

<style scoped>
.xp-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(168, 85, 247, 0.1));
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.xp-badge:hover {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(168, 85, 247, 0.15));
  transform: translateY(-1px);
}

.xp-badge.has-notification {
  animation: xp-pulse 0.5s ease;
}

@keyframes xp-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.xp-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a855f7;
}

.xp-info {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.xp-value {
  font-size: 1rem;
  font-weight: 700;
  color: #7c3aed;
}

.xp-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #a855f7;
  text-transform: uppercase;
}

.xp-notification {
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  white-space: nowrap;
}

.xp-popup-enter-active {
  animation: popup-in 0.3s ease;
}

.xp-popup-leave-active {
  animation: popup-out 0.3s ease;
}

@keyframes popup-in {
  from {
    opacity: 0;
    transform: translateY(5px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes popup-out {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-5px) scale(0.8);
  }
}
</style>
