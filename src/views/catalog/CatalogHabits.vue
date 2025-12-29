<template>
  <div class="catalog-page">
    <CatalogHeader />
    
    <main class="catalog-main">
      <div class="container">
        <CatalogBreadcrumbs :items="breadcrumbs" />

        <section class="hero-section">
          <div class="hero-icon">⚡</div>
          <h1 class="hero-title">Каталог привычек</h1>
          <p class="hero-subtitle">
            200+ полезных привычек для здоровья, продуктивности, финансов и отношений.<br>
            Фильтры по времени, сложности и частоте.
          </p>
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Найти привычку..."
              class="search-input"
            >
            <button class="search-btn">🔍</button>
          </div>
        </section>

        <section class="categories-section">
          <h2 class="section-title">Категории привычек</h2>
          <div class="categories-grid">
            <router-link 
              v-for="category in habitCategories" 
              :key="category.id"
              :to="`/catalog/habits/${category.slug}`"
              class="category-card"
            >
              <div class="category-header-row">
                <span class="category-icon">{{ category.icon }}</span>
                <span class="category-count">{{ category.habitsCount }}</span>
              </div>
              <h3>{{ category.title }}</h3>
              <p>{{ category.description }}</p>
              <div class="popular-items">
                <span class="popular-label">Популярные:</span>
                <span class="popular-list">{{ category.popularItems?.join(' • ') }}</span>
              </div>
              <span class="category-link">Все привычки раздела →</span>
            </router-link>
          </div>
        </section>

        <section class="filters-section">
          <h2 class="section-title">Быстрые фильтры</h2>
          <div class="filters-grid">
            <div class="filter-group">
              <span class="filter-label">По сложности:</span>
              <div class="filter-buttons">
                <router-link to="/catalog/habits/filter/difficulty/easy" class="filter-btn easy">⭐ Лёгкие</router-link>
                <router-link to="/catalog/habits/filter/difficulty/medium" class="filter-btn medium">⭐⭐ Средние</router-link>
                <router-link to="/catalog/habits/filter/difficulty/hard" class="filter-btn hard">⭐⭐⭐ Сложные</router-link>
              </div>
            </div>
            <div class="filter-group">
              <span class="filter-label">По времени:</span>
              <div class="filter-buttons">
                <router-link to="/catalog/habits/filter/duration/5min" class="filter-btn">До 5 мин</router-link>
                <router-link to="/catalog/habits/filter/duration/15min" class="filter-btn">5-15 мин</router-link>
                <router-link to="/catalog/habits/filter/duration/30min" class="filter-btn">15-30 мин</router-link>
                <router-link to="/catalog/habits/filter/duration/30plus" class="filter-btn">30+ мин</router-link>
              </div>
            </div>
            <div class="filter-group">
              <span class="filter-label">По частоте:</span>
              <div class="filter-buttons">
                <router-link to="/catalog/habits/filter/frequency/daily" class="filter-btn">Ежедневно</router-link>
                <router-link to="/catalog/habits/filter/frequency/weekdays" class="filter-btn">По будням</router-link>
                <router-link to="/catalog/habits/filter/frequency/weekends" class="filter-btn">По выходным</router-link>
                <router-link to="/catalog/habits/filter/frequency/weekly" class="filter-btn">Несколько раз/нед</router-link>
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
              :to="`/catalog/habits/tags/${tag.slug}`"
              class="tag-link"
            >
              #{{ tag.title }}
            </router-link>
          </div>
          <router-link to="/catalog/habits/tags" class="all-tags-link">Все теги →</router-link>
        </section>

        <section class="collections-section">
          <h2 class="section-title">Подборки привычек</h2>
          <div class="collections-grid">
            <router-link 
              v-for="collection in habitCollections" 
              :key="collection.id"
              :to="collection.url"
              class="collection-card"
            >
              <div class="collection-icon">{{ collection.icon }}</div>
              <h3>{{ collection.title }}</h3>
              <p>{{ collection.description }}</p>
              <span class="collection-count">{{ collection.count }} привычек</span>
            </router-link>
          </div>
        </section>

        <section class="top-habits-section">
          <div class="section-header">
            <h2 class="section-title">ТОП-10 популярных привычек</h2>
          </div>
          <div class="habits-list">
            <div v-for="(habit, index) in topHabits" :key="habit.id" class="habit-item">
              <span class="habit-rank">{{ index + 1 }}.</span>
              <div class="habit-card-full">
                <div class="habit-header">
                  <span class="habit-icon">⚡</span>
                  <h3>{{ habit.title }}</h3>
                </div>
                <div class="habit-meta">
                  <span class="habit-category">{{ habit.categoryName }}</span>
                  <span>•</span>
                  <span class="habit-duration">⏱ {{ habit.duration }}</span>
                  <span>•</span>
                  <span class="habit-difficulty" :class="getDifficultyClass(habit.difficulty)">
                    {{ getDifficultyStars(habit.difficulty) }} {{ habit.difficulty }}
                  </span>
                  <span>•</span>
                  <span class="habit-frequency">{{ habit.frequency }}</span>
                </div>
                <p class="habit-description">{{ habit.description }}</p>
                <div class="habit-tags">
                  <span v-for="tag in habit.tags" :key="tag" class="habit-tag">#{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="show-all">
            <router-link to="/catalog/habits" class="btn btn-outline">Показать все привычки (200+) →</router-link>
          </div>
        </section>

        <section class="related-section">
          <h2 class="section-title">Связанные разделы</h2>
          <div class="related-cards">
            <router-link to="/catalog/goals" class="related-card">
              <div class="related-icon">🎯</div>
              <h3>Цели</h3>
              <p>150+ целей с пошаговыми планами</p>
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
import { ref, computed, onMounted } from 'vue'
import CatalogHeader from '@/components/catalog/CatalogHeader.vue'
import CatalogFooter from '@/components/catalog/CatalogFooter.vue'
import CatalogBreadcrumbs from '@/components/catalog/CatalogBreadcrumbs.vue'
import { categories, popularHabits, popularTags, habitCollections } from '@/data/catalogMockData'

const searchQuery = ref('')

const breadcrumbs = [
  { title: 'Главная', path: '/' },
  { title: 'Каталог', path: '/catalog' },
  { title: 'Привычки', path: '/catalog/habits' }
]

const habitCategories = computed(() => categories.map(cat => ({
  ...cat,
  url: `/catalog/habits/${cat.slug}`,
  popularItems: cat.subcategories?.slice(0, 3).map(s => s.title)
})))

const topHabits = computed(() => [
  ...popularHabits,
  {
    id: 7,
    title: 'Благодарность перед сном',
    categoryName: 'Ментальное здоровье',
    duration: '5 мин',
    difficulty: 'Легко',
    frequency: 'Ежедневно',
    description: 'Записывайте 3 вещи, за которые благодарны сегодня',
    tags: ['благодарность', 'вечер', 'ментальное']
  },
  {
    id: 8,
    title: 'Холодный душ',
    categoryName: 'Здоровье',
    duration: '3 мин',
    difficulty: 'Средняя',
    frequency: 'Ежедневно',
    description: 'Заканчивайте душ холодной водой для бодрости',
    tags: ['утро', 'энергия', 'закаливание']
  },
  {
    id: 9,
    title: 'Изучение нового слова',
    categoryName: 'Саморазвитие',
    duration: '2 мин',
    difficulty: 'Легко',
    frequency: 'Ежедневно',
    description: 'Учите одно новое слово на иностранном языке',
    tags: ['языки', 'обучение', 'развитие']
  },
  {
    id: 10,
    title: 'Отжимания',
    categoryName: 'Здоровье',
    duration: '5 мин',
    difficulty: 'Средняя',
    frequency: 'Ежедневно',
    description: 'Делайте отжимания для укрепления верхней части тела',
    tags: ['спорт', 'сила', 'фитнес']
  }
])

function getDifficultyClass(difficulty) {
  if (difficulty?.toLowerCase().includes('легк')) return 'easy'
  if (difficulty?.toLowerCase().includes('сред')) return 'medium'
  return 'hard'
}

function getDifficultyStars(difficulty) {
  if (difficulty?.toLowerCase().includes('легк')) return '⭐'
  if (difficulty?.toLowerCase().includes('сред')) return '⭐⭐'
  return '⭐⭐⭐'
}

onMounted(() => {
  document.title = 'Каталог полезных привычек — 200+ шаблонов на каждый день • OnePercent'
  
  let metaDesc = document.querySelector('meta[name="description"]')
  if (!metaDesc) {
    metaDesc = document.createElement('meta')
    metaDesc.name = 'description'
    document.head.appendChild(metaDesc)
  }
  metaDesc.content = 'Более 200 полезных привычек для здоровья, продуктивности, финансов и отношений. Фильтры по времени, сложности и частоте.'
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
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
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
  background: #f59e0b;
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
  margin-bottom: 24px;
}

.categories-section {
  margin-bottom: 60px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.category-card {
  display: flex;
  flex-direction: column;
  padding: 24px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.2s;
}

.category-card:hover {
  border-color: #f59e0b;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
}

.category-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.category-icon {
  font-size: 32px;
}

.category-count {
  background: #f5f3ff;
  color: #6366f1;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.category-card h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px;
}

.category-card p {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 12px;
}

.popular-items {
  font-size: 13px;
  margin-bottom: 16px;
}

.popular-label {
  color: #9ca3af;
}

.popular-list {
  color: #6b7280;
}

.category-link {
  color: #f59e0b;
  font-weight: 500;
  font-size: 14px;
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
  border-color: #f59e0b;
  color: #f59e0b;
  background: #fffbeb;
}

.filter-btn.easy:hover {
  color: #10b981;
  border-color: #10b981;
  background: #ecfdf5;
}

.filter-btn.medium:hover {
  color: #f59e0b;
  border-color: #f59e0b;
  background: #fffbeb;
}

.filter-btn.hard:hover {
  color: #ef4444;
  border-color: #ef4444;
  background: #fef2f2;
}

.tags-section {
  margin-bottom: 40px;
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
  color: #f59e0b;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
}

.tag-link:hover {
  background: #fffbeb;
  border-color: #f59e0b;
}

.all-tags-link {
  color: #f59e0b;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.collections-section {
  margin-bottom: 60px;
}

.collections-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.collection-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.2s;
}

.collection-card:hover {
  border-color: #f59e0b;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
  transform: translateY(-2px);
}

.collection-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.collection-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px;
}

.collection-card p {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 12px;
  flex: 1;
}

.collection-count {
  font-size: 12px;
  color: #f59e0b;
  font-weight: 600;
}

.top-habits-section {
  margin-bottom: 60px;
}

.habits-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.habit-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.habit-rank {
  font-size: 18px;
  font-weight: 700;
  color: #f59e0b;
  min-width: 32px;
  padding-top: 20px;
}

.habit-card-full {
  flex: 1;
  padding: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s;
}

.habit-card-full:hover {
  border-color: #f59e0b;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1);
}

.habit-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.habit-icon {
  font-size: 20px;
}

.habit-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.habit-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 10px;
}

.habit-category {
  color: #f59e0b;
  font-weight: 500;
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
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 12px;
  line-height: 1.5;
}

.habit-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.habit-tag {
  font-size: 12px;
  color: #f59e0b;
  background: #fffbeb;
  padding: 3px 8px;
  border-radius: 4px;
}

.show-all {
  text-align: center;
  margin-top: 24px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  text-decoration: none;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.btn-outline {
  background: transparent;
  color: #f59e0b;
  border-color: #f59e0b;
}

.btn-outline:hover {
  background: #fffbeb;
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

@media (max-width: 900px) {
  .collections-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 28px;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .collections-grid {
    grid-template-columns: 1fr;
  }

  .related-cards {
    grid-template-columns: 1fr;
  }

  .filter-group {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
