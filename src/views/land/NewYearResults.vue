<template>
  <div class="newyear-results">
    <header class="results-header">
      <div class="container">
        <div class="logo">
          <span class="logo-icon">1%</span>
          <span class="logo-text">OnePercent</span>
        </div>
      </div>
    </header>

    <main class="results-main">
      <div class="container">
        <div class="results-hero">
          <h1>Твои итоги 2025 ✨</h1>
          <p>Анализ твоего года по 6 ключевым сферам жизни</p>
        </div>

        <div class="spheres-grid">
          <div 
            v-for="sphere in store.spheres" 
            :key="sphere.id"
            class="sphere-card"
          >
            <div class="sphere-header">
              <span class="sphere-icon">{{ sphere.icon }}</span>
              <span class="sphere-name">{{ sphere.name }}</span>
            </div>
            <div class="sphere-score-bar">
              <div 
                class="score-fill" 
                :style="{ 
                  width: (store.sphereScores[sphere.id] * 10) + '%',
                  background: sphere.color 
                }"
              ></div>
            </div>
            <div class="sphere-score">{{ store.sphereScores[sphere.id] || 0 }}/10</div>
          </div>
        </div>

        <div class="insights-section">
          <div class="insight-card strengths">
            <h3>💪 Твои сильные стороны</h3>
            <div class="insight-list">
              <div 
                v-for="(sphere, index) in store.topStrengths" 
                :key="sphere.id"
                class="insight-item"
              >
                <span class="insight-rank">#{{ index + 1 }}</span>
                <span class="insight-icon">{{ sphere.icon }}</span>
                <span class="insight-name">{{ sphere.name }}</span>
                <span class="insight-score">{{ store.sphereScores[sphere.id] }}</span>
              </div>
            </div>
          </div>

          <div class="insight-card growth">
            <h3>🎯 Зоны роста</h3>
            <div class="insight-list">
              <div 
                v-for="(sphere, index) in store.growthZones" 
                :key="sphere.id"
                class="insight-item"
              >
                <span class="insight-rank">#{{ index + 1 }}</span>
                <span class="insight-icon">{{ sphere.icon }}</span>
                <span class="insight-name">{{ sphere.name }}</span>
                <span class="insight-score">{{ store.sphereScores[sphere.id] }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="lever-section" v-if="store.mainLever">
          <div class="lever-card">
            <div class="lever-badge">Главный рычаг 2026</div>
            <div class="lever-content">
              <span class="lever-icon">{{ store.mainLever.icon }}</span>
              <h2>{{ store.mainLever.name }}</h2>
              <p>Улучшение этой сферы даст максимальный эффект на все остальные области твоей жизни</p>
            </div>
          </div>
        </div>

        <div class="share-section">
          <h3>Поделись результатами</h3>
          <div class="share-buttons">
            <button class="share-btn telegram" @click="shareToTelegram">
              <span class="btn-icon">📱</span>
              Telegram
            </button>
            <button class="share-btn copy" @click="copyLink">
              <span class="btn-icon">🔗</span>
              {{ copied ? 'Скопировано!' : 'Копировать ссылку' }}
            </button>
            <button class="share-btn download" @click="downloadCard">
              <span class="btn-icon">📥</span>
              Скачать карточку
            </button>
          </div>
        </div>

        <div class="cta-section">
          <div class="cta-card">
            <h2>Хочешь план действий на 2026?</h2>
            <p>Зарегистрируйся и получи персональный AI-план с конкретными целями и шагами</p>
            <ul class="cta-benefits">
              <li>✓ 3-5 целей на основе твоих зон роста</li>
              <li>✓ Декомпозиция на шаги по 1-4 часа</li>
              <li>✓ План на первые 4 недели с датами</li>
              <li>✓ AI-ментор для поддержки</li>
            </ul>
            <router-link to="/auth/register" class="cta-btn">
              Получить AI-план бесплатно
            </router-link>
          </div>
        </div>

        <div class="restart-section">
          <button class="restart-btn" @click="restartTest">
            Пройти тест заново
          </button>
        </div>
      </div>
    </main>

    <div class="share-card-container" ref="shareCardRef">
      <ShareCard :store="store" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNewYearStore } from '@/stores/newyear'
import ShareCard from '@/components/newyear/ShareCard.vue'

const router = useRouter()
const store = useNewYearStore()
const copied = ref(false)
const shareCardRef = ref(null)

onMounted(() => {
  if (!store.isCompleted) {
    router.push('/land/newyear/test')
  }
})

function shareToTelegram() {
  const text = `Мои итоги 2025 года! 🎯\n\nГлавный рычаг на 2026: ${store.mainLever?.name || 'определён'}\n\nПройди тест и узнай свои:`
  const url = window.location.origin + '/land/newyear'
  window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank')
}

function copyLink() {
  const url = window.location.origin + '/land/newyear'
  navigator.clipboard.writeText(url)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

async function downloadCard() {
  try {
    const html2canvas = (await import('html2canvas')).default
    const cardElement = document.querySelector('.share-card')
    if (!cardElement) return

    const canvas = await html2canvas(cardElement, {
      scale: 2,
      backgroundColor: '#0f172a',
      logging: false
    })

    const link = document.createElement('a')
    link.download = 'my-year-2025.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (error) {
    console.error('Error generating image:', error)
    alert('Не удалось скачать карточку. Попробуйте ещё раз.')
  }
}

function restartTest() {
  store.resetTest()
  router.push('/land/newyear/test')
}
</script>

<style scoped>
.newyear-results {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #f8fafc;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.results-header {
  padding: 20px 0;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(10px);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 24px;
  font-weight: 800;
  color: #10b981;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
}

.results-main {
  padding: 40px 0 80px;
}

.results-hero {
  text-align: center;
  margin-bottom: 48px;
}

.results-hero h1 {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 12px;
}

.results-hero p {
  color: #94a3b8;
  font-size: 18px;
}

.spheres-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 48px;
}

.sphere-card {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.sphere-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.sphere-icon {
  font-size: 24px;
}

.sphere-name {
  font-weight: 600;
}

.sphere-score-bar {
  height: 8px;
  background: rgba(148, 163, 184, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.score-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.sphere-score {
  text-align: right;
  font-size: 14px;
  color: #94a3b8;
}

.insights-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 48px;
}

.insight-card {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.insight-card.strengths {
  border-color: rgba(16, 185, 129, 0.3);
}

.insight-card.growth {
  border-color: rgba(245, 158, 11, 0.3);
}

.insight-card h3 {
  font-size: 18px;
  margin-bottom: 20px;
}

.insight-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.insight-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 10px;
}

.insight-rank {
  font-size: 12px;
  color: #64748b;
  width: 24px;
}

.insight-icon {
  font-size: 20px;
}

.insight-name {
  flex: 1;
  font-weight: 500;
}

.insight-score {
  font-weight: 700;
  color: #10b981;
}

.growth .insight-score {
  color: #f59e0b;
}

.lever-section {
  margin-bottom: 48px;
}

.lever-card {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 20px;
  padding: 32px;
  text-align: center;
}

.lever-badge {
  display: inline-block;
  background: #10b981;
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 20px;
}

.lever-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.lever-content h2 {
  font-size: 28px;
  margin-bottom: 12px;
}

.lever-content p {
  color: #94a3b8;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
}

.share-section {
  text-align: center;
  margin-bottom: 48px;
}

.share-section h3 {
  font-size: 20px;
  margin-bottom: 20px;
}

.share-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.share-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.share-btn.telegram {
  background: #0088cc;
  color: white;
}

.share-btn.copy {
  background: rgba(148, 163, 184, 0.2);
  color: #f8fafc;
}

.share-btn.download {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.share-btn:hover {
  transform: translateY(-2px);
}

.cta-section {
  margin-bottom: 48px;
}

.cta-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
}

.cta-card h2 {
  font-size: 28px;
  margin-bottom: 12px;
}

.cta-card > p {
  color: #94a3b8;
  margin-bottom: 24px;
}

.cta-benefits {
  list-style: none;
  padding: 0;
  margin: 0 0 32px;
  display: inline-block;
  text-align: left;
}

.cta-benefits li {
  padding: 8px 0;
  color: #e2e8f0;
}

.cta-btn {
  display: inline-block;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  color: white;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px rgba(139, 92, 246, 0.3);
}

.restart-section {
  text-align: center;
}

.restart-btn {
  background: none;
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #94a3b8;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.restart-btn:hover {
  border-color: #f8fafc;
  color: #f8fafc;
}

.share-card-container {
  position: absolute;
  left: -9999px;
  top: -9999px;
}

@media (max-width: 768px) {
  .spheres-grid {
    grid-template-columns: 1fr;
  }
  
  .insights-section {
    grid-template-columns: 1fr;
  }
  
  .results-hero h1 {
    font-size: 28px;
  }
  
  .cta-card {
    padding: 24px;
  }
}
</style>
