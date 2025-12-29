<template>
  <nav class="breadcrumbs" aria-label="Навигация">
    <ol class="breadcrumbs-list" itemscope itemtype="https://schema.org/BreadcrumbList">
      <li 
        v-for="(item, index) in items" 
        :key="index"
        class="breadcrumbs-item"
        itemprop="itemListElement" 
        itemscope 
        itemtype="https://schema.org/ListItem"
      >
        <router-link 
          v-if="index < items.length - 1" 
          :to="item.path"
          class="breadcrumbs-link"
          itemprop="item"
        >
          <span itemprop="name">{{ item.title }}</span>
        </router-link>
        <span v-else class="breadcrumbs-current" itemprop="name">{{ item.title }}</span>
        <meta itemprop="position" :content="index + 1" />
        <span v-if="index < items.length - 1" class="breadcrumbs-separator">›</span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.breadcrumbs {
  padding: 16px 0;
}

.breadcrumbs-list {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 0;
  margin: 0;
}

.breadcrumbs-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.breadcrumbs-link {
  color: #6366f1;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumbs-link:hover {
  color: #4f46e5;
  text-decoration: underline;
}

.breadcrumbs-current {
  color: #6b7280;
}

.breadcrumbs-separator {
  color: #9ca3af;
}

@media (max-width: 768px) {
  .breadcrumbs-item {
    font-size: 13px;
  }
}
</style>
