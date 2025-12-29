<template>
  <router-link 
    :to="habit.url || '#'" 
    class="habit-card"
    itemscope 
    itemtype="https://schema.org/Thing"
  >
    <div class="habit-header">
      <div class="habit-icon">⚡</div>
      <h3 class="habit-title" itemprop="name">{{ habit.title }}</h3>
    </div>
    <div class="habit-meta">
      <span class="habit-category">
        <span class="category-icon">{{ categoryIcon }}</span>
        {{ habit.categoryName }}
      </span>
      <span class="habit-duration">⏱ {{ habit.duration }}</span>
      <span class="habit-difficulty" :class="difficultyClass">
        {{ difficultyStars }} {{ habit.difficulty }}
      </span>
    </div>
    <p v-if="habit.description" class="habit-description" itemprop="description">
      {{ habit.description }}
    </p>
    <div v-if="habit.tags && habit.tags.length" class="habit-tags">
      <span v-for="tag in habit.tags.slice(0, 4)" :key="tag" class="habit-tag">#{{ tag }}</span>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  habit: {
    type: Object,
    required: true
  }
})

const categoryIcon = computed(() => {
  const icons = {
    'Здоровье': '🏃',
    'Финансы': '💰',
    'Карьера': '💼',
    'Отношения': '❤️',
    'Хобби': '🎨',
    'Окружение': '👥',
    'Саморазвитие': '📚',
    'Продуктивность': '📋'
  }
  return icons[props.habit.categoryName] || '⚡'
})

const difficultyClass = computed(() => {
  const difficulty = props.habit.difficulty?.toLowerCase()
  if (difficulty?.includes('легк')) return 'easy'
  if (difficulty?.includes('сред')) return 'medium'
  return 'hard'
})

const difficultyStars = computed(() => {
  const difficulty = props.habit.difficulty?.toLowerCase()
  if (difficulty?.includes('легк')) return '⭐'
  if (difficulty?.includes('сред')) return '⭐⭐'
  return '⭐⭐⭐'
})
</script>

<style scoped>
.habit-card {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s;
  height: 100%;
}

.habit-card:hover {
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
}

.habit-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
}

.habit-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.habit-title {
  color: #1f2937;
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
}

.habit-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 10px;
}

.habit-category {
  display: flex;
  align-items: center;
  gap: 4px;
}

.category-icon {
  font-size: 14px;
}

.habit-duration {
  color: #6b7280;
}

.habit-difficulty.easy {
  color: #10b981;
}

.habit-difficulty.medium {
  color: #f59e0b;
}

.habit-difficulty.hard {
  color: #ef4444;
}

.habit-description {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.habit-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.habit-tag {
  font-size: 11px;
  color: #6366f1;
  background: #f5f3ff;
  padding: 2px 6px;
  border-radius: 4px;
}

@media (max-width: 600px) {
  .habit-card {
    padding: 16px;
  }
}
</style>
