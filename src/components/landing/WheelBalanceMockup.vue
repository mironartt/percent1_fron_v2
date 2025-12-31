<template>
  <div class="browser-frame">
    <div class="browser-header">
      <div class="browser-dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
      <div class="browser-title">OnePercent AI</div>
    </div>
    <div class="browser-content">
      <div class="balance-card">
        <h3 class="balance-title">Текущий баланс</h3>
        
        <div class="wheel-container">
          <svg viewBox="0 0 200 200" class="radar-chart">
            <defs>
              <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#818cf8;stop-opacity:0.6" />
                <stop offset="100%" style="stop-color:#6366f1;stop-opacity:0.4" />
              </linearGradient>
            </defs>
            
            <g transform="translate(100, 100)">
              <polygon 
                v-for="level in [1, 0.8, 0.6, 0.4, 0.2]" 
                :key="level"
                :points="getHexagonPoints(level * 70)"
                class="grid-hexagon"
              />
              
              <line 
                v-for="i in 6" 
                :key="'line-' + i"
                x1="0" y1="0"
                :x2="Math.cos((i - 1) * Math.PI / 3 - Math.PI / 2) * 70"
                :y2="Math.sin((i - 1) * Math.PI / 3 - Math.PI / 2) * 70"
                class="grid-line"
              />
              
              <polygon :points="dataPoints" class="data-polygon" />
              
              <circle 
                v-for="(point, i) in dataPointsArray" 
                :key="'point-' + i"
                :cx="point.x"
                :cy="point.y"
                r="3"
                class="data-point"
              />
            </g>
            
            <text 
              v-for="(label, i) in labels" 
              :key="'label-' + i"
              :x="100 + Math.cos(i * Math.PI / 3 - Math.PI / 2) * 90"
              :y="100 + Math.sin(i * Math.PI / 3 - Math.PI / 2) * 90"
              class="sphere-label"
              text-anchor="middle"
              dominant-baseline="middle"
            >
              {{ label }}
            </text>
          </svg>
        </div>
        
        <div class="analysis-box">
          <p>
            <strong>Анализ:</strong> Фокус на карьере, риск выгорания. 
            Рекомендуется подтянуть "Здоровье" и "Отдых".
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const labels = ['Здоровье', 'Финансы', 'Карьера', 'Семья', 'Рост', 'Отдых']
const scores = [0.4, 0.5, 0.9, 0.5, 0.6, 0.3]

function getHexagonPoints(radius) {
  const points = []
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI / 3) - Math.PI / 2
    points.push(`${Math.cos(angle) * radius},${Math.sin(angle) * radius}`)
  }
  return points.join(' ')
}

const dataPointsArray = computed(() => {
  return scores.map((score, i) => {
    const angle = (i * Math.PI / 3) - Math.PI / 2
    const radius = score * 70
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    }
  })
})

const dataPoints = computed(() => {
  return dataPointsArray.value.map(p => `${p.x},${p.y}`).join(' ')
})
</script>

<style scoped>
.browser-frame {
  background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.browser-header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
}

.browser-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #cbd5e1;
}

.browser-title {
  flex: 1;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  background: white;
  padding: 6px 24px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  margin-right: 60px;
}

.browser-content {
  padding: 32px;
  display: flex;
  justify-content: center;
}

.balance-card {
  background: white;
  border-radius: 20px;
  padding: 24px 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  max-width: 320px;
  width: 100%;
}

.balance-title {
  text-align: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
}

.wheel-container {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.radar-chart {
  width: 200px;
  height: 200px;
}

.grid-hexagon {
  fill: none;
  stroke: #e2e8f0;
  stroke-width: 1;
}

.grid-line {
  stroke: #e2e8f0;
  stroke-width: 1;
}

.data-polygon {
  fill: url(#radarFill);
  stroke: #6366f1;
  stroke-width: 2;
}

.data-point {
  fill: #6366f1;
}

.sphere-label {
  font-size: 11px;
  font-weight: 600;
  fill: #475569;
}

.analysis-box {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.analysis-box p {
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.5;
  margin: 0;
  text-align: center;
}

.analysis-box strong {
  color: #6366f1;
}

@media (max-width: 480px) {
  .browser-content {
    padding: 20px;
  }
  
  .balance-card {
    padding: 20px;
  }
  
  .radar-chart {
    width: 160px;
    height: 160px;
  }
}
</style>
