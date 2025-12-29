<template>
  <div class="catalog-page">
    <CatalogHeader />
    
    <main class="catalog-main">
      <div class="container">
        <CatalogBreadcrumbs :items="breadcrumbs" />

        <section class="hero-section">
          <div class="hero-icon">📦</div>
          <h1 class="hero-title">Готовые наборы</h1>
          <p class="hero-subtitle">
            Цель + привычки в одном пакете.<br>
            Проверенные комбинации для максимального результата.
          </p>
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Найти набор..."
              class="search-input"
            >
            <button class="search-btn">🔍</button>
          </div>
        </section>

        <section class="explanation-section">
          <h2 class="section-title">Что такое набор?</h2>
          <div class="explanation-card">
            <div class="formula">
              <span class="formula-item">🎯 Цель</span>
              <span class="formula-plus">+</span>
              <span class="formula-item">⚡ 3-5 привычек</span>
              <span class="formula-equals">=</span>
              <span class="formula-result">📦 Набор</span>
            </div>
            <p class="explanation-text">
              Мы подобрали оптимальные комбинации привычек для достижения конкретных целей. 
              Не нужно думать, что добавить — просто активируйте набор и следуйте плану.
            </p>
            <div class="flow-diagram">
              <div class="flow-step">
                <div class="flow-box">Цель</div>
              </div>
              <div class="flow-arrow">→</div>
              <div class="flow-step">
                <div class="flow-box">
                  Привычка<br>
                  Привычка<br>
                  Привычка
                </div>
              </div>
              <div class="flow-arrow">→</div>
              <div class="flow-step">
                <div class="flow-box result">Результат</div>
              </div>
            </div>
          </div>
        </section>

        <section class="filter-section">
          <h2 class="section-title">Наборы по категориям</h2>
          <div class="category-filter">
            <button 
              v-for="cat in categoryFilters" 
              :key="cat.id"
              :class="['filter-btn', { active: activeCategory === cat.id }]"
              @click="activeCategory = cat.id"
            >
              {{ cat.icon }} {{ cat.title }}
            </button>
          </div>
        </section>

        <section class="bundles-section">
          <h2 class="section-title">ТОП наборов</h2>
          <div class="bundles-list">
            <div 
              v-for="bundle in filteredBundles" 
              :key="bundle.id" 
              class="bundle-card"
            >
              <div class="bundle-header">
                <span class="bundle-icon">📦</span>
                <h3>{{ bundle.title }}</h3>
              </div>
              
              <div class="bundle-goal">
                <div class="goal-label">🎯 Цель:</div>
                <router-link :to="bundle.goal.url" class="goal-link">
                  {{ bundle.goal.title }}
                </router-link>
              </div>

              <div class="bundle-habits">
                <div class="habits-label">⚡ Привычки в наборе:</div>
                <ul class="habits-list">
                  <li v-for="(habit, index) in bundle.habits" :key="index">
                    {{ habit.title }} <span class="habit-duration">({{ habit.duration }})</span>
                  </li>
                </ul>
              </div>

              <div class="bundle-meta">
                <span class="meta-item">
                  <span class="meta-icon">⏱</span>
                  Срок достижения: {{ bundle.duration }}
                </span>
                <span class="meta-item">
                  <span class="meta-icon">⭐</span>
                  Сложность: {{ bundle.difficulty }}
                </span>
              </div>

              <div class="bundle-actions">
                <router-link :to="bundle.url" class="btn btn-outline">Подробнее о наборе →</router-link>
                <button class="btn btn-primary">Добавить набор</button>
              </div>
            </div>
          </div>
        </section>

        <section class="more-bundles-section">
          <h2 class="section-title">Ещё наборы</h2>
          <div class="more-bundles-grid">
            <div class="more-bundle-card">
              <span class="more-bundle-icon">🏋️</span>
              <h4>Спортивная форма за 3 месяца</h4>
              <p>Цель + 5 привычек для фитнеса</p>
            </div>
            <div class="more-bundle-card">
              <span class="more-bundle-icon">📚</span>
              <h4>Читать 50 книг в год</h4>
              <p>Цель + 3 привычки для чтения</p>
            </div>
            <div class="more-bundle-card">
              <span class="more-bundle-icon">💼</span>
              <h4>Повышение на работе</h4>
              <p>Цель + 4 привычки для карьеры</p>
            </div>
            <div class="more-bundle-card">
              <span class="more-bundle-icon">🧘</span>
              <h4>Спокойствие и осознанность</h4>
              <p>Цель + 4 привычки для ментала</p>
            </div>
            <div class="more-bundle-card">
              <span class="more-bundle-icon">💰</span>
              <h4>Инвестиции для начинающих</h4>
              <p>Цель + 3 привычки для инвестиций</p>
            </div>
            <div class="more-bundle-card">
              <span class="more-bundle-icon">❤️</span>
              <h4>Крепкие отношения</h4>
              <p>Цель + 4 привычки для семьи</p>
            </div>
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
            <router-link to="/catalog/habits" class="related-card">
              <div class="related-icon">⚡</div>
              <h3>Привычки</h3>
              <p>200+ привычек для ежедневного роста</p>
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
import { popularBundles } from '@/data/catalogMockData'

const searchQuery = ref('')
const activeCategory = ref('all')

const breadcrumbs = [
  { title: 'Главная', path: '/' },
  { title: 'Каталог', path: '/catalog' },
  { title: 'Готовые наборы', path: '/catalog/bundles' }
]

const categoryFilters = [
  { id: 'all', title: 'Все', icon: '' },
  { id: 'welfare', title: 'Финансы', icon: '💰' },
  { id: 'health_sport', title: 'Здоровье', icon: '🏃' },
  { id: 'work', title: 'Карьера', icon: '💼' },
  { id: 'family', title: 'Отношения', icon: '❤️' }
]

const filteredBundles = computed(() => {
  if (activeCategory.value === 'all') return popularBundles
  return popularBundles.filter(b => b.categoryId === activeCategory.value)
})

onMounted(() => {
  document.title = 'Готовые наборы «Цель + Привычки» — 30+ комбинаций • OnePercent'
  
  let metaDesc = document.querySelector('meta[name="description"]')
  if (!metaDesc) {
    metaDesc = document.createElement('meta')
    metaDesc.name = 'description'
    document.head.appendChild(metaDesc)
  }
  metaDesc.content = 'Готовые наборы для достижения целей: цель + 3-5 привычек в одном пакете. Проверенные комбинации для финансов, здоровья, карьеры и отношений.'
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
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
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
  background: #10b981;
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

.explanation-section {
  margin-bottom: 50px;
}

.explanation-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
}

.formula {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.formula-item {
  background: #f5f3ff;
  padding: 12px 20px;
  border-radius: 10px;
  color: #6366f1;
}

.formula-plus,
.formula-equals {
  color: #9ca3af;
  font-size: 24px;
}

.formula-result {
  background: #d1fae5;
  padding: 12px 20px;
  border-radius: 10px;
  color: #10b981;
}

.explanation-text {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
  max-width: 700px;
  margin: 0 auto 32px;
}

.flow-diagram {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.flow-box {
  background: #f3f4f6;
  padding: 16px 24px;
  border-radius: 10px;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.6;
}

.flow-box.result {
  background: #d1fae5;
  color: #10b981;
  font-weight: 600;
}

.flow-arrow {
  font-size: 24px;
  color: #9ca3af;
}

.filter-section {
  margin-bottom: 40px;
}

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-btn {
  padding: 10px 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  color: #4b5563;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #10b981;
  color: #10b981;
}

.filter-btn.active {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.bundles-section {
  margin-bottom: 60px;
}

.bundles-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.bundle-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 28px;
  transition: all 0.2s;
}

.bundle-card:hover {
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
}

.bundle-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.bundle-icon {
  font-size: 28px;
}

.bundle-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.bundle-goal {
  margin-bottom: 20px;
}

.goal-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 6px;
}

.goal-link {
  color: #6366f1;
  text-decoration: none;
  font-weight: 500;
}

.goal-link:hover {
  text-decoration: underline;
}

.bundle-habits {
  margin-bottom: 20px;
}

.habits-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 10px;
}

.habits-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.habits-list li {
  padding: 8px 0;
  color: #4b5563;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.habits-list li::before {
  content: '•';
  color: #10b981;
  font-weight: bold;
}

.habit-duration {
  color: #9ca3af;
  font-size: 13px;
}

.bundle-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 20px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
}

.meta-icon {
  font-size: 16px;
}

.bundle-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s;
  border: 2px solid transparent;
  cursor: pointer;
}

.btn-primary {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.btn-primary:hover {
  background: #059669;
  border-color: #059669;
}

.btn-outline {
  background: transparent;
  color: #10b981;
  border-color: #10b981;
}

.btn-outline:hover {
  background: #ecfdf5;
}

.more-bundles-section {
  margin-bottom: 60px;
}

.more-bundles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.more-bundle-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.2s;
}

.more-bundle-card:hover {
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
}

.more-bundle-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 12px;
}

.more-bundle-card h4 {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px;
}

.more-bundle-card p {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
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
  .more-bundles-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 28px;
  }

  .formula {
    flex-direction: column;
    gap: 12px;
  }

  .flow-diagram {
    flex-direction: column;
  }

  .flow-arrow {
    transform: rotate(90deg);
  }

  .more-bundles-grid {
    grid-template-columns: 1fr;
  }

  .related-cards {
    grid-template-columns: 1fr;
  }

  .bundle-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
