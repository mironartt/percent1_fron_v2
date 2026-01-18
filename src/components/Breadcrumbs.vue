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
}

.breadcrumbs-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.breadcrumb-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  line-height: 1;
}

.breadcrumb-link {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: #6366f1;
}

.breadcrumb-current {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.breadcrumb-separator {
  color: #d1d5db;
  flex-shrink: 0;
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
