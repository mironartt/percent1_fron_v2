<template>
  <div id="app" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <Sidebar v-if="!isAuthPage" @collapse-change="onCollapseChange" />
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
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'

const route = useRoute()
const sidebarCollapsed = ref(false)

onMounted(() => {
  const savedCollapsed = localStorage.getItem('sidebar-collapsed')
  if (savedCollapsed !== null) {
    sidebarCollapsed.value = savedCollapsed === 'true'
  }
})

function onCollapseChange(collapsed) {
  sidebarCollapsed.value = collapsed
}

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
  margin-left: 280px;
  padding: 2rem;
  background: var(--bg-secondary);
  transition: margin-left 0.3s ease;
}

#app.sidebar-collapsed .main-content {
  margin-left: 72px;
}

.main-content.full-width {
  margin-left: 0 !important;
  padding: 0;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0 !important;
    padding: 1rem;
  }
}
</style>
