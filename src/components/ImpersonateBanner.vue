<template>
  <div v-if="isImpersonate" class="impersonate-top-bar">
    <p>
      Вы находитесь под пользователем:
      <strong>[id: <code>{{ userId }}</code>] <code>{{ userEmail }}</code></strong>
      | <a :href="stopUrl">Выйти из под пользователя</a>
      | <a :href="currentPageUrl">Ссылка на эту страницу</a>
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const store = useAppStore()

const isImpersonate = computed(() => store.user?.is_impersonate ?? false)
const userId = computed(() => store.user?.id ?? '')
const userEmail = computed(() => store.user?.email ?? '')

const stopUrl = '/admin/impersonate/stop/'

const currentPageUrl = computed(() => {
  const currentPath = encodeURIComponent(route.fullPath)
  return `/admin/impersonate/${userId.value}/?next=${currentPath}`
})
</script>

<style scoped>
.impersonate-top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99999;
  background: #e53935;
  color: white;
  padding: 8px 16px;
  text-align: center;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.impersonate-top-bar p {
  margin: 0;
}

.impersonate-top-bar code {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.impersonate-top-bar a {
  color: white;
  text-decoration: underline;
  font-weight: 500;
}

.impersonate-top-bar a:hover {
  color: #ffcdd2;
}
</style>
