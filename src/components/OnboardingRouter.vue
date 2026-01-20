<template>
  <!-- Версия 1 или deep вариант A/B теста - используем OnboardingAI -->
  <OnboardingAI v-if="onboardingVersion === 1 || onboardingAbVariant === 'deep'" />
  <!-- Версия 2 + fast вариант A/B теста -->
  <OnboardingFast v-else-if="onboardingAbVariant === 'fast'" />
  <!-- Fallback на OnboardingAI -->
  <OnboardingAI v-else />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useABTestStore } from '@/stores/abtest'
import OnboardingAI from './OnboardingAI.vue'
import OnboardingFast from './OnboardingFast.vue'

const store = useAppStore()
const abStore = useABTestStore()

const onboardingVersion = computed(() => store.user?.onboarding_version ?? 1)
const onboardingAbVariant = computed(() => store.user?.onboarding_ab_variant)

onMounted(() => {
  // Инициализация A/B трекинга для версии 2
  if (onboardingVersion.value === 2 && onboardingAbVariant.value) {
    abStore.initFromBackend(onboardingAbVariant.value)
    abStore.trackOnboardingStarted()
  }
  
  if (import.meta.env.DEV) {
    const componentName = onboardingVersion.value === 1 
      ? 'OnboardingAI (v1)'
      : (onboardingAbVariant.value === 'fast' ? 'OnboardingFast' : 'OnboardingAI (deep)')
    
    console.log('🧪 Onboarding Router:', {
      version: onboardingVersion.value,
      abVariant: onboardingAbVariant.value,
      component: componentName
    })
  }
})
</script>
