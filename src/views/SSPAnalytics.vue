<template>
  <div class="ssp-analytics-container">
    <header class="page-header">
      <div>
        <h1>ССП - Аналитика и Прогресс</h1>
        <p class="subtitle">
          Отслеживайте динамику развития по всем сферам жизни
        </p>
      </div>
    </header>

    <div class="analytics-grid">
      <!-- Тренд общего баланса -->
      <div class="card analytics-card">
        <div class="card-header">
          <h3>📈 Тренд общего баланса</h3>
        </div>
        <div class="card-body">
          <div class="trend-chart">
            <div class="chart-bars">
              <div 
                v-for="(bar, index) in scoreTrend" 
                :key="index"
                class="bar-wrapper"
              >
                <div 
                  class="bar" 
                  :style="{ height: bar.value * 10 + '%' }"
                  :class="{ 'trending-up': bar.direction === 'up', 'trending-down': bar.direction === 'down' }"
                >
                  <span class="bar-value">{{ bar.value }}</span>
                </div>
                <span class="bar-label">{{ bar.label }}</span>
              </div>
            </div>
          </div>
          <div class="trend-stats">
            <div class="stat">
              <span class="label">Средний показатель</span>
              <span class="value">{{ averageScore.toFixed(1) }}</span>
            </div>
            <div class="stat">
              <span class="label">Прогресс за месяц</span>
              <span class="value trending-up">+0.8</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Сферы по приоритету -->
      <div class="card analytics-card">
        <div class="card-header">
          <h3>🎯 Приоритетные зоны</h3>
        </div>
        <div class="card-body">
          <div class="priority-list">
            <div 
              v-for="sphere in spheresByPriority" 
              :key="sphere.id"
              class="priority-item"
              :class="{ 'critical': sphere.score < 3, 'warning': sphere.score < 6 }"
            >
              <div class="priority-info">
                <span class="icon">{{ sphere.icon }}</span>
                <div class="text">
                  <h4>{{ sphere.name }}</h4>
                  <p>{{ sphere.notes ? sphere.notes.substring(0, 50) + '...' : 'Нет заметок' }}</p>
                </div>
              </div>
              <div class="priority-score">
                <span class="score" :style="{ color: getScoreColor(sphere.score) }">
                  {{ sphere.score }}/10
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Радар-диаграмма -->
      <div class="card analytics-card full-width">
        <div class="card-header">
          <h3>🔄 Баланс сфер жизни</h3>
        </div>
        <div class="card-body">
          <div class="radar-container">
            <div class="spheres-dots">
              <div 
                v-for="sphere in lifeSpheres" 
                :key="sphere.id"
                class="sphere-dot"
                :style="{ 
                  '--angle': getSphereAngle(sphere.id) + 'deg',
                  '--score': sphere.score / 10
                }"
              >
                <span class="dot-icon">{{ sphere.icon }}</span>
                <span class="dot-label">{{ sphere.name }}</span>
                <span class="dot-value">{{ sphere.score }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Статистика -->
      <div class="card analytics-card">
        <div class="card-header">
          <h3>📊 Статистика</h3>
        </div>
        <div class="card-body">
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-number">{{ spheresAbove7 }}</div>
              <div class="stat-label">Сфер выше 7/10</div>
              <div class="stat-description">Хороший результат!</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">{{ spheresBelow5 }}</div>
              <div class="stat-label">Сфер ниже 5/10</div>
              <div class="stat-description">Требуют внимания</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">{{ maxScore }}</div>
              <div class="stat-label">Максимальная сфера</div>
              <div class="stat-description">{{ maxSphere?.name }}</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">{{ minScore }}</div>
              <div class="stat-label">Минимальная сфера</div>
              <div class="stat-description">{{ minSphere?.name }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Рекомендации -->
      <div class="card analytics-card full-width">
        <div class="card-header">
          <h3>💡 Персональные рекомендации</h3>
        </div>
        <div class="card-body">
          <div class="recommendations">
            <div 
              v-for="(rec, index) in getRecommendations()" 
              :key="index"
              class="recommendation-item"
            >
              <span class="rec-icon">{{ rec.icon }}</span>
              <div class="rec-text">
                <h4>{{ rec.title }}</h4>
                <p>{{ rec.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()

const lifeSpheres = computed(() => store.lifeSpheres)
const averageScore = computed(() => store.averageScore)

const scoreTrend = [
  { label: 'Пн', value: 6.2, direction: 'up' },
  { label: 'Вт', value: 6.5, direction: 'up' },
  { label: 'Ср', value: 6.3, direction: 'down' },
  { label: 'Чт', value: 6.8, direction: 'up' },
  { label: 'Пт', value: 6.9, direction: 'up' },
  { label: 'Сб', value: 7.1, direction: 'up' },
  { label: 'Вс', value: 7.0, direction: 'down' }
]

const spheresByPriority = computed(() => {
  return [...lifeSpheres.value].sort((a, b) => a.score - b.score)
})

const spheresAbove7 = computed(() => {
  return lifeSpheres.value.filter(s => s.score >= 7).length
})

const spheresBelow5 = computed(() => {
  return lifeSpheres.value.filter(s => s.score < 5).length
})

const maxScore = computed(() => {
  return Math.max(...lifeSpheres.value.map(s => s.score))
})

const minScore = computed(() => {
  return Math.min(...lifeSpheres.value.map(s => s.score))
})

const maxSphere = computed(() => {
  return lifeSpheres.value.find(s => s.score === maxScore.value)
})

const minSphere = computed(() => {
  return lifeSpheres.value.find(s => s.score === minScore.value)
})

function getSphereAngle(sphereId) {
  const index = lifeSpheres.value.findIndex(s => s.id === sphereId)
  return (index * 360) / lifeSpheres.value.length
}

function getScoreColor(score) {
  if (score >= 8) return '#10b981'
  if (score >= 6) return '#3b82f6'
  if (score >= 4) return '#f59e0b'
  return '#ef4444'
}

function getRecommendations() {
  const recs = []

  if (spheresBelow5.value > 0) {
    recs.push({
      icon: '⚠️',
      title: 'Уделите внимание критичным сферам',
      description: `У вас ${spheresBelow5.value} сфер(ы) с оценкой ниже 5/10. Начните с малых шагов улучшения.`
    })
  }

  if (averageScore.value < 5) {
    recs.push({
      icon: '🎯',
      title: 'Составьте план действий',
      description: 'Общий баланс низкий. Определите 1-2 приоритетные сферы для фокуса.'
    })
  }

  if (spheresAbove7.value >= 4) {
    recs.push({
      icon: '🚀',
      title: 'Вы на правильном пути',
      description: 'Несколько сфер развиваются хорошо. Продолжайте в том же направлении!'
    })
  }

  recs.push({
    icon: '📝',
    title: 'Регулярно обновляйте оценки',
    description: 'Еженедельное обновление ССП помогает отслеживать прогресс и вовремя корректировать стратегию.'
  })

  return recs
}
</script>

<style scoped>
.ssp-analytics-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.analytics-card.full-width {
  grid-column: 1 / -1;
}

.card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.card-header h3 {
  font-size: 1.125rem;
  margin: 0;
}

.card-body {
  padding: 1.5rem;
}

/* Trend Chart */
.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 200px;
  margin-bottom: 1.5rem;
  gap: 0.5rem;
}

.bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.bar {
  width: 100%;
  background: linear-gradient(180deg, var(--primary-color), var(--secondary-color));
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  min-height: 20px;
}

.bar:hover {
  filter: brightness(1.1);
}

.bar.trending-down {
  background: linear-gradient(180deg, #ef4444, #dc2626);
}

.bar-value {
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding-bottom: 0.25rem;
}

.bar-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.trend-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat {
  text-align: center;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.stat .label {
  display: block;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.stat .value {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-color);
}

.stat .value.trending-up {
  color: #10b981;
}

/* Priority List */
.priority-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.priority-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--primary-color);
  transition: all 0.2s ease;
}

.priority-item:hover {
  transform: translateX(4px);
}

.priority-item.critical {
  border-left-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.priority-item.warning {
  border-left-color: #f59e0b;
  background: rgba(245, 158, 11, 0.05);
}

.priority-info {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex: 1;
}

.icon {
  font-size: 1.5rem;
}

.priority-info .text h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.priority-info .text p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.priority-score {
  font-weight: 600;
}

/* Radar Container */
.radar-container {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spheres-dots {
  position: relative;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle at center, var(--bg-secondary) 0%, transparent 70%);
  border: 2px dashed var(--border-color);
}

.sphere-dot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 70px;
  height: 70px;
  transform: translate(-50%, -50%) rotate(var(--angle)) translateY(calc(-140px * var(--score))) rotate(calc(-1 * var(--angle)));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  border-radius: 50%;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.sphere-dot:hover {
  transform: translate(-50%, -50%) rotate(var(--angle)) translateY(calc(-140px * var(--score))) rotate(calc(-1 * var(--angle))) scale(1.1);
}

.dot-icon {
  font-size: 1.5rem;
}

.dot-label {
  font-size: 0.7rem;
  margin-top: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.dot-value {
  font-size: 0.8rem;
  font-weight: 700;
  margin-top: 0.25rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-box {
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  text-align: center;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.stat-box:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.stat-description {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

/* Recommendations */
.recommendations {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recommendation-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--primary-color);
}

.rec-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.rec-text h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.rec-text p {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }

  .analytics-card.full-width {
    grid-column: 1;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
