<template>
  <div id="app">
    <Sidebar v-if="!isAuthPage" />
    <main class="main-content" :class="{ 'full-width': isAuthPage }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'

const route = useRoute()

const isAuthPage = computed(() => {
  return route.name === 'register' || route.name === 'login'
})
</script>

<style scoped>
#app {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  padding: 1.5rem 2rem;
  background: var(--bg-secondary);
}

.main-content.full-width {
  margin-left: 0;
  padding: 0;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 1rem;
  }
}
</style>
