<template>
  <div id="app" :class="appClasses">
    <Sidebar v-if="hasSidebar" @collapse-change="onCollapseChange" />
    <main class="main-content">
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

const hasSidebar = computed(() => !isAuthPage.value)

const appClasses = computed(() => ({
  'has-sidebar': hasSidebar.value,
  'sidebar-collapsed': hasSidebar.value && sidebarCollapsed.value
}))
</script>

<style scoped>
#app {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 0;
  padding: 0;
  background: var(--bg-secondary);
  transition: margin-left 0.3s ease;
}

#app.has-sidebar .main-content {
  margin-left: 280px;
  padding: 2rem;
}

#app.has-sidebar.sidebar-collapsed .main-content {
  margin-left: 72px;
}

@media (max-width: 768px) {
  #app.has-sidebar .main-content,
  #app.has-sidebar.sidebar-collapsed .main-content {
    margin-left: 0;
    padding: 1rem;
  }
}
</style>
