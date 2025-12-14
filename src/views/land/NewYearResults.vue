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

        <!-- Рекомендации: цели и шаги -->
        <div class="recommendations-section" v-if="store.mainLeverRecommendations">
          <h2 class="section-title">🎯 Твой план действий</h2>
          
          <div class="goals-block">
            <h3>Цели на 2026</h3>
            <div class="goals-list">
              <div 
                v-for="(goal, index) in store.mainLeverRecommendations.goals" 
                :key="index"
                class="goal-item"
              >
                <div class="goal-number">{{ index + 1 }}</div>
                <div class="goal-content">
                  <div class="goal-title">{{ goal.title }}</div>
                  <div class="goal-metric">{{ goal.metric }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="steps-block">
            <h3>Первые шаги</h3>
            <div class="steps-list">
              <div 
                v-for="(step, index) in store.mainLeverRecommendations.steps" 
                :key="index"
                class="step-item"
              >
                <div class="step-checkbox">☐</div>
                <div class="step-title">{{ step.title }}</div>
                <div class="step-hours">{{ step.hours }}ч</div>
              </div>
            </div>
          </div>

          <div class="week-plan-block">
            <h3>План на 4 недели</h3>
            <div class="weeks-list">
              <div 
                v-for="weekItem in store.mainLeverRecommendations.weekPlan" 
                :key="weekItem.week"
                class="week-item-detailed"
              >
                <div class="week-header">
                  <div class="week-number">Неделя {{ weekItem.week }}</div>
                </div>
                <ul class="week-tasks">
                  <li v-for="(task, idx) in weekItem.tasks" :key="idx">{{ task }}</li>
                </ul>
              </div>
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
          </div>
        </div>

        <div class="service-flow-section">
          <h2 class="section-title">📋 Запланируй задачи в сервисе</h2>
          <p class="section-subtitle">Все шаги из твоего плана превращаются в удобный таск-менеджер</p>
          
          <div class="service-content">
            <div class="planner-mockup" aria-hidden="true">
              <div class="mockup-header">
                <div class="mockup-title">
                  <span class="mockup-icon">📋</span>
                  <span>Мой план на январь</span>
                </div>
                <div class="mockup-progress">
                  <div class="progress-fill" style="width: 35%"></div>
                </div>
                <span class="mockup-stats">5 из 14 выполнено</span>
              </div>
              
              <div class="mockup-weeks">
                <div class="mockup-week">
                  <div class="week-label-mock">Неделя 1</div>
                  <div class="task-card completed">
                    <span class="task-check">✓</span>
                    <span class="task-text">Скачать выписки из банков</span>
                    <span class="task-xp">+15 XP</span>
                  </div>
                  <div class="task-card completed">
                    <span class="task-check">✓</span>
                    <span class="task-text">Категоризировать расходы</span>
                    <span class="task-xp">+25 XP</span>
                  </div>
                  <div class="task-card">
                    <span class="task-check empty"></span>
                    <span class="task-text">Найти подписки на отмену</span>
                    <span class="task-time">1ч</span>
                  </div>
                </div>
                <div class="mockup-week">
                  <div class="week-label-mock">Неделя 2</div>
                  <div class="task-card">
                    <span class="task-check empty"></span>
                    <span class="task-text">Открыть накопительный счёт</span>
                    <span class="task-time">30м</span>
                  </div>
                  <div class="task-card">
                    <span class="task-check empty"></span>
                    <span class="task-text">Настроить автоперевод</span>
                    <span class="task-time">30м</span>
                  </div>
                </div>
              </div>
              
              <div class="mockup-footer">
                <div class="xp-badge">
                  <span class="xp-icon">⚡</span>
                  <span>145 XP заработано</span>
                </div>
                <div class="streak-badge">
                  <span class="streak-icon">🔥</span>
                  <span>5 дней подряд</span>
                </div>
              </div>
            </div>

            <div class="benefits-section">
              <div class="benefits-grid">
                <article class="benefit-card">
                  <div class="benefit-icon">📅</div>
                  <div class="benefit-content">
                    <h4>Всё разбито по неделям</h4>
                    <p>Ты точно знаешь что делать <strong>сегодня</strong>. Не нужно думать — просто действуй.</p>
                  </div>
                </article>
                <article class="benefit-card">
                  <div class="benefit-icon">✅</div>
                  <div class="benefit-content">
                    <h4>Видимый прогресс</h4>
                    <p>Отмечай выполненное и наблюдай как <strong>растёт процент</strong> достижения цели.</p>
                  </div>
                </article>
                <article class="benefit-card">
                  <div class="benefit-icon">🔔</div>
                  <div class="benefit-content">
                    <h4>Напоминания в Telegram</h4>
                    <p>Бот напомнит о задачах утром и <strong>не даст забыть</strong> важное вечером.</p>
                  </div>
                </article>
                <article class="benefit-card">
                  <div class="benefit-icon">⚡</div>
                  <div class="benefit-content">
                    <h4>XP за каждый шаг</h4>
                    <p>Получай очки опыта, открывай достижения — <strong>геймификация</strong> для дисциплины.</p>
                  </div>
                </article>
                <article class="benefit-card">
                  <div class="benefit-icon">📊</div>
                  <div class="benefit-content">
                    <h4>Аналитика прогресса</h4>
                    <p>Графики, статистика, streak-и — <strong>мотивация через цифры</strong> и визуализацию.</p>
                  </div>
                </article>
              </div>

              <div class="value-message">
                <div class="value-icon">🎯</div>
                <div class="value-text">
                  <h4>От плана к результату за 4 недели</h4>
                  <p>AI создаёт план → ты получаешь шаги → выполняешь по 1-2 в день → видишь прогресс → достигаешь цели</p>
                </div>
              </div>

              <router-link to="/auth/register" class="cta-btn-large">
                Запланировать задачи
                <span class="arrow">→</span>
              </router-link>
            </div>
          </div>
        </div>

        <div class="restart-section">
          <button class="restart-btn" @click="restartTest">
            Пройти тест заново
          </button>
        </div>
      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNewYearStore } from '@/stores/newyear'

const router = useRouter()
const store = useNewYearStore()
const copied = ref(false)

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

.recommendations-section {
  margin-bottom: 48px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 32px;
}

.goals-block,
.steps-block,
.week-plan-block {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.goals-block h3,
.steps-block h3,
.week-plan-block h3 {
  font-size: 18px;
  margin-bottom: 20px;
  color: #10b981;
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.goal-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 12px;
}

.goal-number {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.goal-content {
  flex: 1;
}

.goal-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.goal-metric {
  font-size: 14px;
  color: #94a3b8;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 10px;
}

.step-checkbox {
  font-size: 18px;
  color: #64748b;
}

.step-title {
  flex: 1;
  font-size: 15px;
}

.step-hours {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.weeks-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.week-item-detailed {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 12px;
  padding: 16px;
}

.week-header {
  margin-bottom: 12px;
}

.week-number {
  font-size: 14px;
  color: #10b981;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.week-tasks {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.week-tasks li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  color: #e2e8f0;
  line-height: 1.4;
}

.week-tasks li::before {
  content: '○';
  color: #64748b;
  flex-shrink: 0;
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

.service-flow-section {
  margin-bottom: 48px;
}

.section-subtitle {
  text-align: center;
  color: #94a3b8;
  margin-bottom: 32px;
  font-size: 16px;
}

.service-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
}

.planner-mockup {
  background: rgba(15, 23, 42, 0.9);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.mockup-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  margin-bottom: 16px;
}

.mockup-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.mockup-icon {
  font-size: 20px;
}

.mockup-progress {
  height: 8px;
  background: rgba(148, 163, 184, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.mockup-progress .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  border-radius: 4px;
}

.mockup-stats {
  font-size: 13px;
  color: #94a3b8;
}

.mockup-weeks {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mockup-week {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.week-label-mock {
  font-size: 12px;
  color: #10b981;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.task-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 8px;
  border-left: 3px solid #64748b;
}

.task-card.completed {
  border-left-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.task-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #10b981;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.task-check.empty {
  background: transparent;
  border: 2px solid #64748b;
}

.task-text {
  flex: 1;
  font-size: 13px;
  color: #e2e8f0;
}

.task-xp {
  font-size: 12px;
  color: #10b981;
  font-weight: 600;
}

.task-time {
  font-size: 12px;
  color: #64748b;
}

.mockup-footer {
  display: flex;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  margin-top: 16px;
}

.xp-badge,
.streak-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #94a3b8;
  background: rgba(30, 41, 59, 0.8);
  padding: 8px 12px;
  border-radius: 20px;
}

.xp-icon,
.streak-icon {
  font-size: 16px;
}

.benefits-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.benefits-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.benefit-card {
  background: rgba(30, 41, 59, 0.6);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.benefit-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.benefit-content h4 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #f8fafc;
}

.benefit-content p {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.4;
  margin: 0;
}

.benefit-content strong {
  color: #10b981;
  font-weight: 600;
}

.value-message {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
  border-radius: 14px;
  padding: 20px;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.value-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.value-text h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #10b981;
}

.value-text p {
  font-size: 13px;
  color: #cbd5e1;
  line-height: 1.5;
  margin: 0;
}

.cta-btn-large {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.cta-btn-large:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3);
}

.cta-btn-large .arrow {
  font-size: 20px;
}

@media (max-width: 960px) {
  .service-content {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  
  .planner-mockup {
    max-width: 450px;
    margin: 0 auto;
  }
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

  .section-title {
    font-size: 24px;
  }

  .goals-block,
  .steps-block,
  .week-plan-block {
    padding: 16px;
  }

  .weeks-list {
    gap: 12px;
  }
  
  .week-item-detailed {
    padding: 12px;
  }

  .goal-item {
    padding: 12px;
  }

  .step-item {
    padding: 10px 12px;
  }

  .step-title {
    font-size: 14px;
  }
}
</style>
