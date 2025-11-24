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
          :fill="getSegmentColor(index, true)"
          :opacity="hoveredSphere === sphere.id ? 0.9 : 0.75"
          :stroke="getSegmentColor(index, false)"
          :stroke-width="selectedSphere === sphere.id ? 3 : 2"
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
          :x="center + (radius + 85) * Math.cos(getAngle(index) + angleStep.value / 2)"
          :y="center + (radius + 85) * Math.sin(getAngle(index) + angleStep.value / 2)"
          text-anchor="middle"
          dominant-baseline="middle"
          class="sphere-name"
          @click="selectSphere(sphere)"
        >
          {{ sphere.name }}
        </text>

        <!-- Interactive handle for dragging -->
        <circle
          :cx="center + getHandleRadius(sphere.score) * Math.cos(getAngle(index) + angleStep.value / 2)"
          :cy="center + getHandleRadius(sphere.score) * Math.sin(getAngle(index) + angleStep.value / 2)"
          r="8"
          :fill="selectedSphere === sphere.id ? 'var(--primary-color)' : 'white'"
          stroke="var(--primary-color)"
          stroke-width="2"
          class="drag-handle"
          @mousedown="startDrag($event, sphere, index)"
          @touchstart="startDrag($event, sphere, index)"
        />
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

const angleStep = computed(() => (2 * Math.PI) / props.spheres.length)


function getHandleRadius(score) {
  return Math.max((radius / 10) * score, radius / 15)
}

function getAngle(index) {
  return index * angleStep.value - Math.PI / 2
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

function getSegmentColor(index, isFill = true) {
  const fillColors = [
    'rgba(100, 150, 255, 0.3)',     // blue
    'rgba(100, 200, 100, 0.3)',     // green
    'rgba(255, 100, 150, 0.3)',     // pink/red
    'rgba(255, 150, 100, 0.3)',     // orange
    'rgba(150, 100, 255, 0.3)',     // purple
    'rgba(255, 200, 100, 0.3)'      // light orange
  ]
  
  const strokeColors = [
    'rgb(100, 150, 255)',      // blue
    'rgb(100, 200, 100)',      // green
    'rgb(255, 100, 150)',      // pink/red
    'rgb(255, 150, 100)',      // orange
    'rgb(150, 100, 255)',      // purple
    'rgb(255, 200, 100)'       // light orange
  ]
  
  return isFill ? fillColors[index % fillColors.length] : strokeColors[index % strokeColors.length]
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



@media (max-width: 768px) {
  .sphere-name {
    font-size: 10px;
  }
}
</style>
