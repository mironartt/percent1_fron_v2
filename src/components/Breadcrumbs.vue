<template>
  <nav class="breadcrumbs" aria-label="Навигация">
    <ol class="breadcrumbs-list">
      <li v-for="(item, index) in items" :key="index" class="breadcrumb-item">
        <router-link 
          v-if="index < items.length - 1"
          :to="item.to"
          class="breadcrumb-link"
        >
          {{ item.label }}
        </router-link>
        <span v-else class="breadcrumb-current">
          {{ item.label }}
        </span>
        <ChevronRight 
          v-if="index < items.length - 1" 
          :size="14" 
          :stroke-width="2" 
          class="breadcrumb-separator"
        />
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { ChevronRight } from 'lucide-vue-next'

defineProps({
  items: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.breadcrumbs {
  margin-bottom: 16px;
  overflow-x: auto;
}

.breadcrumbs-list {
  display: inline-flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 4px;
  list-style: none;
  margin: 0;
  padding: 0;
  width: max-content;
}

.breadcrumb-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  line-height: 1;
  white-space: nowrap;
  flex: 0 0 auto;
  width: auto;
}

.breadcrumb-link {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s;
  line-height: 1;
  vertical-align: middle;
}

.breadcrumb-link:hover {
  color: var(--primary-color);
}

.breadcrumb-current {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
  line-height: 1;
  vertical-align: middle;
}

.breadcrumb-separator {
  color: var(--text-tertiary);
  flex-shrink: 0;
  vertical-align: middle;
  display: inline-flex;
  align-items: center;
}

@media (max-width: 640px) {
  .breadcrumbs {
    margin-bottom: 12px;
  }
  
  .breadcrumb-link,
  .breadcrumb-current {
    font-size: 13px;
  }
}
</style>
