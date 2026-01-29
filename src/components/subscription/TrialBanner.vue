<template>
  <div v-if="shouldShow" :class="['trial-banner', bannerClass]">
    <div class="banner-content">
      <component :is="bannerIcon" :size="20" class="banner-icon" />
      <span class="banner-text">{{ bannerText }}</span>
    </div>
    <router-link to="/app/subscription" class="banner-btn">
      {{ buttonText }}
      <ArrowRight :size="16" />
    </router-link>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSubscriptionStore } from '@/stores/subscription'
import { pluralizeDays } from '@/utils/pluralize'
import { Gift, AlertTriangle, Clock, Package, ArrowRight } from 'lucide-vue-next'

const route = useRoute()
const subscriptionStore = useSubscriptionStore()

const bannerType = computed(() => {
  const state = subscriptionStore.subscriptionState
  
  if (state === 'trial_normal' || state === 'trial_warning' || state === 'trial_danger') {
    return state
  }
  
  if (state === 'freemium') {
    return 'freemium'
  }
  
  return null
})

const shouldShow = computed(() => {
  if (!bannerType.value) return false
  
  if (subscriptionStore.isPaid) return false
  
  if (subscriptionStore.isTrial) return true
  
  if (subscriptionStore.isFree && !subscriptionStore.isTrial && route.path === '/app') {
    return true
  }
  
  return false
})

const bannerClass = computed(() => {
  switch (bannerType.value) {
    case 'trial_normal':
      return 'banner-primary'
    case 'trial_warning':
      return 'banner-warning'
    case 'trial_danger':
      return 'banner-danger'
    case 'freemium':
      return 'banner-neutral'
    default:
      return ''
  }
})

const bannerIcon = computed(() => {
  switch (bannerType.value) {
    case 'trial_normal':
      return Gift
    case 'trial_warning':
      return AlertTriangle
    case 'trial_danger':
      return Clock
    case 'freemium':
      return Package
    default:
      return Gift
  }
})

const bannerText = computed(() => {
  const days = subscriptionStore.daysRemaining
  
  switch (bannerType.value) {
    case 'trial_normal':
      return `Пробный период: осталось ${pluralizeDays(days)}`
    case 'trial_warning':
      return `Пробный период заканчивается через ${pluralizeDays(days)}!`
    case 'trial_danger':
      return 'Последний день пробного периода!'
    case 'freemium':
      return 'Тариф: Freemium'
    default:
      return ''
  }
})

const buttonText = computed(() => {
  switch (bannerType.value) {
    case 'trial_normal':
      return 'Продлить подписку'
    case 'trial_warning':
      return 'Продлить'
    case 'trial_danger':
      return 'Оформить подписку'
    case 'freemium':
      return 'Перейти на Pro'
    default:
      return 'Подписка'
  }
})
</script>

<style scoped>
.trial-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.banner-icon {
  flex-shrink: 0;
}

.banner-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.banner-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-md, 6px);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: opacity 0.2s ease;
  white-space: nowrap;
}

.banner-btn:hover {
  opacity: 0.9;
}

.banner-primary {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color, #6366f1);
}

.banner-primary .banner-btn {
  background: var(--primary-color, #6366f1);
  color: white;
}

.banner-warning {
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
}

.banner-warning .banner-btn {
  background: #f59e0b;
  color: white;
}

.banner-danger {
  background: rgba(239, 68, 68, 0.15);
  color: #dc2626;
}

.banner-danger .banner-btn {
  background: #ef4444;
  color: white;
}

.banner-neutral {
  background: var(--bg-secondary, #f3f4f6);
  color: var(--text-secondary, #6b7280);
}

.banner-neutral .banner-btn {
  background: var(--primary-color, #6366f1);
  color: white;
}

@media (max-width: 480px) {
  .trial-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .banner-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
