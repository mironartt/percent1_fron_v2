<template>
  <OnboardingAI v-if="onboardingVersion === 1" />
  <OnboardingFast v-else-if="onboardingAbVariant === 'fast'" />
  <OnboardingDeep v-else />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useABTestStore } from '@/stores/abtest'
import OnboardingAI from './OnboardingAI.vue'
import OnboardingFast from './OnboardingFast.vue'
import OnboardingDeep from './OnboardingDeep.vue'

const store = useAppStore()
const abStore = useABTestStore()

const onboardingVersion = computed(() => store.user?.onboarding_version ?? 1)
const onboardingAbVariant = computed(() => store.user?.onboarding_ab_variant)

onMounted(() => {
  if (onboardingVersion.value === 2 && onboardingAbVariant.value) {
    abStore.initFromBackend(onboardingAbVariant.value)
    abStore.trackOnboardingStarted()
  }
  
  if (import.meta.env.DEV) {
    console.log('🧪 Onboarding Router:', {
      version: onboardingVersion.value,
      abVariant: onboardingAbVariant.value,
      component: onboardingVersion.value === 1 
        ? 'OnboardingAI' 
        : (onboardingAbVariant.value === 'fast' ? 'OnboardingFast' : 'OnboardingDeep')
    })
  }
})
</script>
