<template>
  <router-link 
    :to="goal.url || '#'" 
    class="goal-card"
    itemscope 
    itemtype="https://schema.org/Thing"
  >
    <div class="goal-icon">🎯</div>
    <div class="goal-content">
      <h3 class="goal-title" itemprop="name">{{ goal.title }}</h3>
      <div class="goal-meta">
        <span class="goal-category">{{ goal.categoryName }}</span>
        <span class="goal-separator">•</span>
        <span class="goal-steps">{{ goal.stepsCount }} шагов</span>
        <span class="goal-separator">•</span>
        <span class="goal-difficulty" :class="difficultyClass">{{ goal.difficulty }}</span>
      </div>
      <p class="goal-description" itemprop="description">{{ goal.description }}</p>
      <div v-if="goal.tags && goal.tags.length" class="goal-tags">
        <span v-for="tag in goal.tags.slice(0, 3)" :key="tag" class="goal-tag">#{{ tag }}</span>
      </div>
    </div>
    <div class="goal-arrow">→</div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  goal: {
    type: Object,
    required: true
  }
})

const difficultyClass = computed(() => {
  const difficulty = props.goal.difficulty?.toLowerCase()
  if (difficulty?.includes('легк') || difficulty?.includes('низк')) return 'easy'
  if (difficulty?.includes('сред')) return 'medium'
  return 'hard'
})
</script>

<style scoped>
.goal-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s;
}

.goal-card:hover {
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
}

.goal-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.goal-content {
  flex: 1;
  min-width: 0;
}

.goal-title {
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px;
  line-height: 1.4;
}

.goal-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.goal-separator {
  color: #d1d5db;
}

.goal-category {
  color: #6366f1;
  font-weight: 500;
}

.goal-difficulty.easy {
  color: #10b981;
}

.goal-difficulty.medium {
  color: #f59e0b;
}

.goal-difficulty.hard {
  color: #ef4444;
}

.goal-description {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.goal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.goal-tag {
  font-size: 12px;
  color: #6366f1;
  background: #f5f3ff;
  padding: 3px 8px;
  border-radius: 4px;
}

.goal-arrow {
  color: #6366f1;
  font-size: 18px;
  opacity: 0;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.goal-card:hover .goal-arrow {
  opacity: 1;
}

@media (max-width: 600px) {
  .goal-card {
    padding: 16px;
  }

  .goal-meta {
    font-size: 12px;
  }

  .goal-arrow {
    display: none;
  }
}
</style>
