<template>
  <div class="catalog-page">
    <CatalogHeader />
    
    <main class="catalog-main">
      <div class="container">
        <CatalogBreadcrumbs :items="breadcrumbs" />

        <section class="hero-section">
          <div class="hero-icon">🎯</div>
          <h1 class="hero-title">Каталог целей</h1>
          <p class="hero-subtitle">
            150+ целей для развития в 6 ключевых сферах жизни.<br>
            Каждая цель разбита на конкретные шаги для достижения.
          </p>
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Найти цель..."
              class="search-input"
            >
            <button class="search-btn">🔍</button>
          </div>
        </section>

        <section class="categories-section">
          <h2 class="section-title">Категории целей</h2>
          <div class="categories-list">
            <div 
              v-for="category in categories" 
              :key="category.id" 
              class="category-block"
            >
              <div class="category-header">
                <div class="category-info">
                  <span class="category-icon">{{ category.icon }}</span>
                  <div class="category-text">
                    <h3>{{ category.title }}</h3>
                    <p>{{ category.goalsCount }} целей • {{ category.description }}</p>
                  </div>
                </div>
                <router-link :to="category.url" class="category-link">
                  Смотреть все цели раздела →
                </router-link>
              </div>
              <div class="subcategories">
                <span class="subcategories-label">Подкатегории:</span>
                <div class="subcategories-list">
                  <router-link 
                    v-for="sub in category.subcategories" 
                    :key="sub.slug"
                    :to="`${category.url}/${sub.slug}`"
                    class="subcategory-link"
                  >
                    {{ sub.title }} ({{ sub.count }})
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="filters-section">
          <h2 class="section-title">Быстрые фильтры</h2>
          <div class="filters-grid">
            <div class="filter-group">
              <span class="filter-label">По сложности:</span>
              <div class="filter-buttons">
                <router-link to="/catalog/goals/filter/difficulty/easy" class="filter-btn">⭐ Лёгкие</router-link>
                <router-link to="/catalog/goals/filter/difficulty/medium" class="filter-btn">⭐⭐ Средние</router-link>
                <router-link to="/catalog/goals/filter/difficulty/hard" class="filter-btn">⭐⭐⭐ Сложные</router-link>
              </div>
            </div>
            <div class="filter-group">
              <span class="filter-label">По длительности:</span>
              <div class="filter-buttons">
                <router-link to="/catalog/goals/filter/duration/1month" class="filter-btn">До 1 месяца</router-link>
                <router-link to="/catalog/goals/filter/duration/3months" class="filter-btn">1-3 месяца</router-link>
                <router-link to="/catalog/goals/filter/duration/6months" class="filter-btn">3-6 месяцев</router-link>
                <router-link to="/catalog/goals/filter/duration/year" class="filter-btn">6-12 месяцев</router-link>
              </div>
            </div>
          </div>
        </section>

        <section class="tags-section">
          <h2 class="section-title">Популярные теги</h2>
          <div class="tags-cloud">
            <router-link 
              v-for="tag in popularTags" 
              :key="tag.slug"
              :to="`/catalog/goals/tags/${tag.slug}`"
              class="tag-link"
            >
              #{{ tag.title }}
            </router-link>
          </div>
          <router-link to="/catalog/goals/tags" class="all-tags-link">Все теги →</router-link>
        </section>

        <section class="popular-goals-section">
          <div class="section-header">
            <h2 class="section-title">ТОП-10 популярных целей</h2>
          </div>
          <div class="goals-list">
            <div v-for="(goal, index) in popularGoals" :key="goal.id" class="goal-item">
              <span class="goal-rank">{{ index + 1 }}.</span>
              <CatalogGoalCard :goal="goal" />
            </div>
          </div>
        </section>

        <section class="related-section">
          <h2 class="section-title">Связанные разделы</h2>
          <div class="related-cards">
            <router-link to="/catalog/habits" class="related-card">
              <div class="related-icon">⚡</div>
              <h3>Привычки</h3>
              <p>200+ привычек для ежедневного роста</p>
              <span class="related-link">Перейти →</span>
            </router-link>
            <router-link to="/catalog/bundles" class="related-card">
              <div class="related-icon">📦</div>
              <h3>Готовые наборы</h3>
              <p>Цель + привычки для достижения</p>
              <span class="related-link">Перейти →</span>
            </router-link>
          </div>
        </section>
      </div>
    </main>

    <CatalogFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CatalogHeader from '@/components/catalog/CatalogHeader.vue'
import CatalogFooter from '@/components/catalog/CatalogFooter.vue'
import CatalogBreadcrumbs from '@/components/catalog/CatalogBreadcrumbs.vue'
import CatalogGoalCard from '@/components/catalog/CatalogGoalCard.vue'
import { categories, popularGoals, popularTags } from '@/data/catalogMockData'

const searchQuery = ref('')

const breadcrumbs = [
  { title: 'Главная', path: '/' },
  { title: 'Каталог', path: '/catalog' },
  { title: 'Цели', path: '/catalog/goals' }
]

onMounted(() => {
  document.title = 'Каталог целей — 150+ шаблонов для развития • OnePercent'
  
  let metaDesc = document.querySelector('meta[name="description"]')
  if (!metaDesc) {
    metaDesc = document.createElement('meta')
    metaDesc.name = 'description'
    document.head.appendChild(metaDesc)
  }
  metaDesc.content = '150+ готовых целей с пошаговыми планами в 6 сферах жизни: финансы, здоровье, карьера, отношения, хобби, окружение.'
})
</script>

<style scoped>
.catalog-page {
  min-height: 100vh;
  background: #fafafa;
}

.catalog-main {
  padding: 0 0 60px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.hero-section {
  text-align: center;
  padding: 40px 0 50px;
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  margin: 0 -24px 40px;
  padding-left: 24px;
  padding-right: 24px;
  border-radius: 0 0 24px 24px;
}

.hero-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.hero-title {
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px;
}

.hero-subtitle {
  font-size: 18px;
  color: #6b7280;
  margin: 0 0 32px;
  line-height: 1.6;
}

.search-box {
  display: flex;
  max-width: 500px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.search-input {
  flex: 1;
  padding: 16px 20px;
  border: none;
  font-size: 16px;
  outline: none;
}

.search-btn {
  padding: 16px 20px;
  background: #6366f1;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.categories-section {
  margin-bottom: 60px;
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.category-block {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  transition: all 0.2s;
}

.category-block:hover {
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.category-info {
  display: flex;
  gap: 16px;
}

.category-icon {
  font-size: 32px;
}

.category-text h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px;
}

.category-text p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.category-link {
  color: #6366f1;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
}

.category-link:hover {
  text-decoration: underline;
}

.subcategories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.subcategories-label {
  font-size: 13px;
  color: #6b7280;
  margin-right: 8px;
}

.subcategories-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.subcategory-link {
  display: inline-block;
  padding: 6px 12px;
  background: #f5f3ff;
  color: #6366f1;
  text-decoration: none;
  font-size: 13px;
  border-radius: 6px;
  transition: all 0.2s;
}

.subcategory-link:hover {
  background: #ede9fe;
}

.filters-section {
  margin-bottom: 40px;
}

.filters-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.filter-label {
  font-size: 14px;
  color: #6b7280;
  min-width: 120px;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #4b5563;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #6366f1;
  color: #6366f1;
  background: #f5f3ff;
}

.tags-section {
  margin-bottom: 60px;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.tag-link {
  padding: 8px 14px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  color: #6366f1;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
}

.tag-link:hover {
  background: #f5f3ff;
  border-color: #6366f1;
}

.all-tags-link {
  color: #6366f1;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.popular-goals-section {
  margin-bottom: 60px;
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.goal-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.goal-rank {
  font-size: 18px;
  font-weight: 700;
  color: #6366f1;
  min-width: 32px;
  padding-top: 20px;
}

.goal-item :deep(.goal-card) {
  flex: 1;
}

.related-section {
  margin-bottom: 40px;
}

.related-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.related-card {
  display: flex;
  flex-direction: column;
  padding: 28px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.2s;
}

.related-card:hover {
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
}

.related-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.related-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px;
}

.related-card p {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px;
  flex: 1;
}

.related-link {
  color: #6366f1;
  font-weight: 500;
  font-size: 14px;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 28px;
  }

  .category-header {
    flex-direction: column;
    gap: 12px;
  }

  .related-cards {
    grid-template-columns: 1fr;
  }

  .filter-group {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-label {
    min-width: auto;
  }
}
</style>
