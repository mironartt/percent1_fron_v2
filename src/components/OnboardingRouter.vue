<template>
  <OnboardingNew />
</template>

<script setup>
import { onMounted } from 'vue'
import { useABTestStore } from '@/stores/abtest'
import OnboardingNew from './OnboardingNew.vue'

const abStore = useABTestStore()

onMounted(() => {
  abStore.initFromBackend('scenario_v1')
  abStore.trackOnboardingStarted()
})
</script>
