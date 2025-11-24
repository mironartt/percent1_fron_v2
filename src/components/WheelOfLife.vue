<template>
  <div class="wheel-of-life">
    <svg 
      :width="size" 
      :height="size" 
      :viewBox="`0 0 ${size} ${size}`"
      class="wheel-svg"
    >
      <!-- Background circle -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="var(--bg-secondary)"
        stroke="var(--border-color)"
        stroke-width="2"
      />

      <!-- Grid circles -->
      <circle
        v-for="i in 10"
        :key="`grid-${i}`"
        :cx="center"
        :cy="center"
        :r="(radius / 10) * i"
        fill="none"
        stroke="var(--border-color)"
        stroke-width="1"
        opacity="0.3"
      />

      <!-- Sphere segments -->
      <g v-for="(sphere, index) in spheres" :key="sphere.id">
        <!-- Segment path -->
        <path
          :d="getSegmentPath(index, sphere.score)"
          :fill="getSegmentColor(index)"
          :opacity="hoveredSphere === sphere.id ? 0.9 : 0.7"
          :stroke="selectedSphere === sphere.id ? 'var(--primary-color)' : 'white'"
          :stroke-width="selectedSphere === sphere.id ? 3 : 1"
          class="segment"
          @click="handleSegmentClick($event, sphere, index)"
          @mouseenter="hoveredSphere = sphere.id"
          @mouseleave="hoveredSphere = null"
        />

        <!-- Dividing lines -->
        <line
          :x1="center"
          :y1="center"
          :x2="center + radius * Math.cos(getAngle(index))"
          :y2="center + radius * Math.sin(getAngle(index))"
          stroke="white"
          stroke-width="2"
        />

        <text
          :x="center + (radius + 85) * Math.cos(getAngle(index) + angleStep / 2)"
          :y="center + (radius + 85) * Math.sin(getAngle(index) + angleStep / 2)"
          text-anchor="middle"
          dominant-baseline="middle"
          class="sphere-name"
          @click="selectSphere(sphere)"
        >
          {{ sphere.name }}
        </text>

        <!-- Interactive handle for dragging -->
        <circle
          :cx="center + getHandleRadius(sphere.score) * Math.cos(getAngle(index) + angleStep / 2)"
          :cy="center + getHandleRadius(sphere.score) * Math.sin(getAngle(index) + angleStep / 2)"
          r="8"
          :fill="selectedSphere === sphere.id ? 'var(--primary-color)' : 'white'"
          stroke="var(--primary-color)"
          stroke-width="2"
          class="drag-handle"
          @mousedown="startDrag($event, sphere, index)"
          @touchstart="startDrag($event, sphere, index)"
        />
      </g>

      <!-- Center score display -->
      <g>
        <circle
          :cx="center"
          :cy="center"
          r="50"
          fill="white"
          stroke="var(--primary-color)"
          stroke-width="3"
        />
        <text
          :x="center"
          :y="center - 10"
          text-anchor="middle"
          dominant-baseline="middle"
          class="center-score"
        >
          {{ averageScore }}
        </text>
        <text
          :x="center"
          :y="center + 15"
          text-anchor="middle"
          dominant-baseline="middle"
          class="center-label"
        >
          Средний балл
        </text>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  spheres: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update-sphere'])

const size = 600
const center = size / 2
const radius = 200

const selectedSphere = ref(null)
const hoveredSphere = ref(null)
const dragging = ref(false)

const angleStep = (2 * Math.PI) / props.spheres.length

const averageScore = computed(() => {
  const total = props.spheres.reduce((sum, s) => sum + s.score, 0)
  return Math.round(total / props.spheres.length * 10) / 10
})

function getHandleRadius(score) {
  return Math.max((radius / 10) * score, radius / 15)
}

function getAngle(index) {
  return index * angleStep - Math.PI / 2
}

function getSegmentPath(index, score) {
  const startAngle = getAngle(index)
  const endAngle = getAngle(index + 1)
  const scoreRadius = (radius / 10) * score

  const x1 = center + scoreRadius * Math.cos(startAngle)
  const y1 = center + scoreRadius * Math.sin(startAngle)
  const x2 = center + scoreRadius * Math.cos(endAngle)
  const y2 = center + scoreRadius * Math.sin(endAngle)

  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0

  return `
    M ${center} ${center}
    L ${x1} ${y1}
    A ${scoreRadius} ${scoreRadius} 0 ${largeArc} 1 ${x2} ${y2}
    Z
  `
}

function getSegmentColor(index) {
  const colors = [
    'rgba(99, 102, 241, 0.6)',
    'rgba(139, 92, 246, 0.6)',
    'rgba(16, 185, 129, 0.6)',
    'rgba(245, 158, 11, 0.6)',
    'rgba(239, 68, 68, 0.6)',
    'rgba(236, 72, 153, 0.6)'
  ]
  return colors[index % colors.length]
}

function selectSphere(sphere) {
  selectedSphere.value = sphere.id
  emit('update-sphere', sphere)
}

function handleSegmentClick(event, sphere, index) {
  selectedSphere.value = sphere.id
  
  const svg = event.target.closest('svg')
  const rect = svg.getBoundingClientRect()
  
  const x = event.clientX - rect.left - center
  const y = event.clientY - rect.top - center
  
  const distance = Math.sqrt(x * x + y * y)
  const newScore = Math.max(0, Math.min(10, Math.round((distance / radius) * 10)))
  
  emit('update-sphere', {
    ...sphere,
    score: newScore
  })
}

function handleSliderChange(event, sphere) {
  const newScore = parseInt(event.target.value, 10)
  emit('update-sphere', {
    ...sphere,
    score: newScore
  })
}

function updateScore(sphere) {
  emit('update-sphere', sphere)
}

function startDrag(event, sphere, index) {
  event.preventDefault()
  dragging.value = true
  selectedSphere.value = sphere.id

  const handleMove = (e) => {
    if (!dragging.value) return

    const touch = e.touches ? e.touches[0] : e
    const svg = event.target.closest('svg')
    const rect = svg.getBoundingClientRect()
    
    const x = touch.clientX - rect.left - center
    const y = touch.clientY - rect.top - center
    
    const distance = Math.sqrt(x * x + y * y)
    const newScore = Math.max(0, Math.min(10, Math.round((distance / radius) * 10)))
    
    emit('update-sphere', {
      ...sphere,
      score: newScore
    })
  }

  const handleEnd = () => {
    dragging.value = false
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('touchend', handleEnd)
  }

  document.addEventListener('mousemove', handleMove)
  document.addEventListener('mouseup', handleEnd)
  document.addEventListener('touchmove', handleMove)
  document.addEventListener('touchend', handleEnd)
}
</script>

<style scoped>
.wheel-of-life {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.wheel-svg {
  max-width: 100%;
  height: auto;
  cursor: pointer;
}

.segment {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.segment:hover {
  opacity: 0.9 !important;
}

.sphere-label {
  font-size: 24px;
  cursor: pointer;
  user-select: none;
}

.sphere-name {
  font-size: 14px;
  font-weight: 500;
  fill: var(--text-primary);
  cursor: pointer;
  user-select: none;
}

.drag-handle {
  cursor: grab;
  transition: all 0.2s ease;
}

.drag-handle:hover {
  r: 10;
}

.drag-handle:active {
  cursor: grabbing;
}

.center-score {
  font-size: 32px;
  font-weight: 700;
  fill: var(--primary-color);
}

.center-label {
  font-size: 12px;
  fill: var(--text-secondary);
}


@media (max-width: 768px) {
  .sphere-name {
    font-size: 10px;
  }
}
</style>
