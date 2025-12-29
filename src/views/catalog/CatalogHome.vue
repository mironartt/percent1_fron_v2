<template>
  <div class="catalog-page">
    <CatalogHeader />
    
    <main class="catalog-main">
      <div class="container">
        <CatalogBreadcrumbs :items="breadcrumbs" />

        <section class="hero-section">
          <h1 class="hero-title">Каталог целей и привычек</h1>
          <p class="hero-subtitle">
            Более 500 готовых шаблонов для личного развития.<br>
            Выберите цель или привычку и начните меняться уже сегодня.
          </p>
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Поиск по каталогу..."
              class="search-input"
            >
            <button class="search-btn">🔍</button>
          </div>
        </section>

        <section class="sections-grid">
          <h2 class="section-title">Разделы каталога</h2>
          <div class="sections-cards">
            <router-link to="/catalog/goals" class="section-card goals">
              <div class="section-icon">🎯</div>
              <h3>Цели</h3>
              <p>150+ целей в 6 сферах жизни</p>
              <span class="section-link">Смотреть цели →</span>
            </router-link>
            <router-link to="/catalog/habits" class="section-card habits">
              <div class="section-icon">⚡</div>
              <h3>Привычки</h3>
              <p>200+ привычек для ежедневного роста</p>
              <span class="section-link">Смотреть привычки →</span>
            </router-link>
            <router-link to="/catalog/bundles" class="section-card bundles">
              <div class="section-icon">📦</div>
              <h3>Готовые наборы</h3>
              <p>30+ наборов «Цель + Привычки»</p>
              <span class="section-link">Смотреть наборы →</span>
            </router-link>
          </div>
        </section>

        <section class="categories-section">
          <h2 class="section-title">Популярные категории</h2>
          <div class="categories-grid">
            <CatalogCategoryCard 
              v-for="category in categories" 
              :key="category.id"
              :category="category"
            />
          </div>
        </section>

        <section class="popular-goals-section">
          <div class="section-header">
            <h2 class="section-title">Популярные цели</h2>
            <router-link to="/catalog/goals" class="section-link">Смотреть все цели →</router-link>
          </div>
          <div class="goals-list">
            <CatalogGoalCard 
              v-for="goal in popularGoals" 
              :key="goal.id"
              :goal="goal"
            />
          </div>
        </section>

        <section class="popular-habits-section">
          <div class="section-header">
            <h2 class="section-title">Популярные привычки</h2>
            <router-link to="/catalog/habits" class="section-link">Смотреть все привычки →</router-link>
          </div>
          <div class="habits-grid">
            <CatalogHabitCard 
              v-for="habit in popularHabits" 
              :key="habit.id"
              :habit="habit"
            />
          </div>
        </section>

        <section class="how-it-works-section">
          <h2 class="section-title">Как это работает</h2>
          <div class="steps-grid">
            <div class="step-card">
              <div class="step-number">1</div>
              <h3>Выберите цель или привычку</h3>
              <p>Найдите то, что подходит именно вам из 500+ шаблонов</p>
            </div>
            <div class="step-card">
              <div class="step-number">2</div>
              <h3>Добавьте привычки</h3>
              <p>Система подберёт оптимальные привычки для достижения цели</p>
            </div>
            <div class="step-card">
              <div class="step-number">3</div>
              <h3>Отслеживайте прогресс</h3>
              <p>Получайте XP, достижения и мотивацию каждый день</p>
            </div>
          </div>
          <div class="cta-buttons">
            <router-link to="/auth/register" class="btn btn-primary btn-lg">Начать бесплатно</router-link>
            <router-link to="/" class="btn btn-outline btn-lg">Узнать больше о системе</router-link>
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
import CatalogCategoryCard from '@/components/catalog/CatalogCategoryCard.vue'
import CatalogGoalCard from '@/components/catalog/CatalogGoalCard.vue'
import CatalogHabitCard from '@/components/catalog/CatalogHabitCard.vue'
import { categories, popularGoals, popularHabits } from '@/data/catalogMockData'

const searchQuery = ref('')

const breadcrumbs = [
  { title: 'Главная', path: '/' },
  { title: 'Каталог', path: '/catalog' }
]

onMounted(() => {
  document.title = 'Каталог целей и привычек — OnePercent'
  
  let metaDesc = document.querySelector('meta[name="description"]')
  if (!metaDesc) {
    metaDesc = document.createElement('meta')
    metaDesc.name = 'description'
    document.head.appendChild(metaDesc)
  }
  metaDesc.content = 'Более 500 готовых шаблонов целей и привычек для личного развития. Выберите цель, добавьте привычки и начните меняться на 1% каждый день.'
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

.search-input::placeholder {
  color: #9ca3af;
}

.search-btn {
  padding: 16px 20px;
  background: #6366f1;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.2s;
}

.search-btn:hover {
  background: #4f46e5;
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

.section-header .section-title {
  margin: 0;
}

.section-link {
  color: #6366f1;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.section-link:hover {
  color: #4f46e5;
}

.sections-grid {
  margin-bottom: 60px;
}

.sections-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.section-card {
  display: flex;
  flex-direction: column;
  padding: 32px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.3s;
}

.section-card:hover {
  border-color: #6366f1;
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.15);
  transform: translateY(-4px);
}

.section-card.goals:hover {
  border-color: #6366f1;
}

.section-card.habits:hover {
  border-color: #f59e0b;
}

.section-card.bundles:hover {
  border-color: #10b981;
}

.section-icon {
  font-size: 40px;
  margin-bottom: 16px;
}

.section-card h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px;
}

.section-card p {
  color: #6b7280;
  font-size: 15px;
  margin: 0 0 16px;
  flex: 1;
}

.section-card .section-link {
  font-size: 14px;
}

.categories-section {
  margin-bottom: 60px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.popular-goals-section {
  margin-bottom: 60px;
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.popular-habits-section {
  margin-bottom: 60px;
}

.habits-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.how-it-works-section {
  background: white;
  border-radius: 20px;
  padding: 48px;
  text-align: center;
  margin-bottom: 40px;
}

.how-it-works-section .section-title {
  margin-bottom: 32px;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-bottom: 40px;
}

.step-card {
  text-align: center;
}

.step-number {
  width: 48px;
  height: 48px;
  background: #6366f1;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  margin: 0 auto 16px;
}

.step-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px;
}

.step-card p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
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
  cursor: pointer;
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover {
  background: #4f46e5;
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  color: #6366f1;
  border-color: #6366f1;
}

.btn-outline:hover {
  background: #f5f3ff;
}

.btn-lg {
  padding: 16px 32px;
  font-size: 17px;
}

@media (max-width: 1024px) {
  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 28px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .sections-cards {
    grid-template-columns: 1fr;
  }

  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .habits-grid {
    grid-template-columns: 1fr;
  }

  .steps-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .how-it-works-section {
    padding: 32px 24px;
  }

  .cta-buttons {
    flex-direction: column;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}
</style>
