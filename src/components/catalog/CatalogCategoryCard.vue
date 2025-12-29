<template>
  <router-link :to="category.url" class="category-card">
    <div class="category-icon">{{ category.icon }}</div>
    <h3 class="category-title">{{ category.title }}</h3>
    <div class="category-stats">
      <span v-if="category.goalsCount">{{ category.goalsCount }} целей</span>
      <span v-if="category.goalsCount && category.habitsCount" class="stat-separator">•</span>
      <span v-if="category.habitsCount">{{ category.habitsCount }} привычек</span>
    </div>
  </router-link>
</template>

<script setup>
defineProps({
  category: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s;
}

.category-card:hover {
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
}

.category-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.category-title {
  color: #1f2937;
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 8px;
}

.category-stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
}

.stat-separator {
  color: #d1d5db;
}

@media (max-width: 600px) {
  .category-card {
    padding: 20px 12px;
  }

  .category-icon {
    font-size: 28px;
  }

  .category-title {
    font-size: 14px;
  }

  .category-stats {
    font-size: 12px;
  }
}
</style>
