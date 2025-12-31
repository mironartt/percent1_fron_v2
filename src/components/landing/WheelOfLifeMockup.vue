<template>
  <div class="bg-white rounded-2xl p-6 h-full flex flex-col items-center justify-center">
    <h4 class="text-lg font-bold text-slate-900 mb-4">Текущий баланс</h4>
    <div class="w-full h-[250px] relative flex items-center justify-center">
      <svg viewBox="0 0 200 200" class="w-full h-full max-w-[250px]">
        <g transform="translate(100, 100)">
          <polygon 
            v-for="(level, idx) in [100, 80, 60, 40, 20]" 
            :key="idx"
            :points="getPolygonPoints(level)"
            fill="none"
            stroke="#e2e8f0"
            stroke-width="1"
          />
          <line 
            v-for="(_, idx) in 6" 
            :key="'axis-' + idx"
            x1="0" 
            y1="0" 
            :x2="getAxisPoint(idx, 80).x" 
            :y2="getAxisPoint(idx, 80).y"
            stroke="#e2e8f0"
            stroke-width="1"
          />
          <polygon 
            :points="getDataPoints()"
            fill="rgba(129, 140, 248, 0.4)"
            stroke="#6366f1"
            stroke-width="3"
          />
          <text 
            v-for="(item, idx) in data" 
            :key="'label-' + idx"
            :x="getAxisPoint(idx, 95).x"
            :y="getAxisPoint(idx, 95).y"
            text-anchor="middle"
            dominant-baseline="middle"
            class="text-[10px] font-semibold fill-slate-500"
          >
            {{ item.subject }}
          </text>
        </g>
      </svg>
    </div>
    <div class="text-center mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
      <p class="text-sm text-slate-600">
        <span class="text-indigo-600 font-bold">Анализ:</span> Фокус на карьере, риск выгорания. Рекомендуется подтянуть "Здоровье" и "Отдых".
      </p>
    </div>
  </div>
</template>

<script setup>
const data = [
  { subject: 'Здоровье', value: 65 },
  { subject: 'Финансы', value: 40 },
  { subject: 'Карьера', value: 90 },
  { subject: 'Семья', value: 50 },
  { subject: 'Рост', value: 85 },
  { subject: 'Отдых', value: 30 },
]

const getAxisPoint = (index, radius) => {
  const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius
  }
}

const getPolygonPoints = (radius) => {
  return data.map((_, idx) => {
    const point = getAxisPoint(idx, radius * 0.8)
    return `${point.x},${point.y}`
  }).join(' ')
}

const getDataPoints = () => {
  return data.map((item, idx) => {
    const point = getAxisPoint(idx, item.value * 0.8)
    return `${point.x},${point.y}`
  }).join(' ')
}
</script>
