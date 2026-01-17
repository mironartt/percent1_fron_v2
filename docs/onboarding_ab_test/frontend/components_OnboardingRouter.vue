<template>
  <component :is="variantComponent" />
</template>

<script setup>
/**
 * OnboardingRouter.vue
 * Роутер для A/B теста онбординга
 *
 * Копировать в: src/components/OnboardingRouter.vue
 *
 * Назначает пользователя в один из двух вариантов:
 * - Fast (быстрый, 3 шага, 2-3 минуты)
 * - Deep (глубокий, 5 шагов, 5-7 минут)
 */

import { computed, onMounted } from 'vue'
import { useABTestStore } from '@/stores/abtest'
import OnboardingFast from './OnboardingFast.vue'
import OnboardingDeep from './OnboardingDeep.vue'

const abStore = useABTestStore()

// Получаем вариант (назначится автоматически если нет)
const variant = abStore.getVariant()

// Динамически выбираем компонент на основе варианта
const variantComponent = computed(() => {
  return variant === 'fast' ? OnboardingFast : OnboardingDeep
})

// Трекаем начало онбординга
onMounted(() => {
  abStore.trackOnboardingStarted()
})

// Для отладки (можно убрать в продакшн)
if (import.meta.env.DEV) {
  console.log('🧪 A/B Test:', {
    variant,
    sessionId: abStore.sessionId,
    component: variant === 'fast' ? 'OnboardingFast' : 'OnboardingDeep'
  })
}
</script>

<style scoped>
/* Этот компонент не имеет своих стилей - все стили в дочерних компонентах */
</style>
