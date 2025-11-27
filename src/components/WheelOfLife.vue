<template>
  <div class="wheel-of-life">
    <svg 
      :width="svgSize" 
      :height="svgSize" 
      :viewBox="`0 0 ${svgSize} ${svgSize}`"
      class="wheel-svg"
    >
      <!-- Background circle -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="var(--wheel-bg, #f8f9fa)"
        stroke="var(--border-color)"
        stroke-width="1"
      />

      <!-- Grid circles (10 levels) -->
      <circle
        v-for="i in 10"
        :key="`grid-${i}`"
        :cx="center"
        :cy="center"
        :r="(radius / 10) * i"
        fill="none"
        stroke="var(--border-color)"
        stroke-width="1"
        opacity="0.4"
      />

      <!-- Radial dividing lines -->
      <line
        v-for="(sphere, index) in spheres"
        :key="`line-${sphere.id}`"
        :x1="center"
        :y1="center"
        :x2="center + radius * Math.cos(getAngle(index))"
        :y2="center + radius * Math.sin(getAngle(index))"
        stroke="var(--border-color)"
        stroke-width="1"
        opacity="0.5"
      />

      <!-- Sphere segments (filled based on score) -->
      <path
        v-for="(sphere, index) in spheres"
        :key="`segment-${sphere.id}`"
        :d="getSegmentPath(index, sphere.score)"
        :fill="getSphereColor(index)"
        :opacity="!readonly && hoveredSphere === sphere.id ? 1 : 0.85"
        :stroke="!readonly && selectedSphere === sphere.id ? getSphereColor(index) : 'white'"
        :stroke-width="!readonly && selectedSphere === sphere.id ? 3 : 1"
        :class="['segment', { 'segment-readonly': readonly }]"
        @click="!readonly && selectSphere(sphere)"
        @mouseenter="!readonly && (hoveredSphere = sphere.id)"
        @mouseleave="!readonly && (hoveredSphere = null)"
      />

      <!-- Sphere labels using textPath for curved text -->
      <defs>
        <path
          v-for="(sphere, index) in spheres"
          :key="`arc-path-${sphere.id}`"
          :id="`labelArc-${index}`"
          :d="getLabelArcPath(index)"
          fill="none"
        />
      </defs>

      <text
        v-for="(sphere, index) in spheres"
        :key="`label-${sphere.id}`"
        :fill="getSphereColor(index)"
        :class="['sphere-label', { 'sphere-label-readonly': readonly }]"
        @click="!readonly && selectSphere(sphere)"
      >
        <textPath
          :href="`#labelArc-${index}`"
          startOffset="50%"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {{ sphere.name.toUpperCase() }}
        </textPath>
      </text>

      <!-- Interactive handle for dragging (hidden in readonly mode) -->
      <circle
        v-for="(sphere, index) in spheres"
        :key="`handle-${sphere.id}`"
        v-if="!readonly"
        :cx="center + Math.max((radius / 10) * sphere.score, radius / 15) * Math.cos(getAngle(index) + angleStep / 2)"
        :cy="center + Math.max((radius / 10) * sphere.score, radius / 15) * Math.sin(getAngle(index) + angleStep / 2)"
        r="10"
        :fill="selectedSphere === sphere.id ? getSphereColor(index) : 'white'"
        :stroke="getSphereColor(index)"
        stroke-width="3"
        class="drag-handle"
        @mousedown="startDrag($event, sphere, index)"
        @touchstart="startDrag($event, sphere, index)"
      />
    </svg>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  spheres: {
    type: Array,
    required: true
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update-sphere'])

const svgSize = 700
const center = svgSize / 2
const radius = 240
const labelRadius = radius + 30

const selectedSphere = ref(null)
const hoveredSphere = ref(null)
const dragging = ref(false)

const angleStep = computed(() => (2 * Math.PI) / props.spheres.length)

const sphereColors = [
  '#e63946',
  '#f4a261',
  '#e9c46a',
  '#2a9d8f',
  '#264653',
  '#9b5de5'
]

function getAngle(index) {
  return index * angleStep.value - Math.PI / 2
}

function getSegmentPath(index, score) {
  const startAngle = getAngle(index)
  const endAngle = getAngle(index + 1)
  const scoreRadius = (radius / 10) * Math.max(score, 0.5)

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

function getSphereColor(index) {
  return sphereColors[index % sphereColors.length]
}

function getLabelArcPath(index) {
  const startAngle = getAngle(index) + 0.05
  const endAngle = getAngle(index + 1) - 0.05
  const midAngle = (startAngle + endAngle) / 2
  
  const isBottomHalf = midAngle > 0 && midAngle < Math.PI
  
  if (isBottomHalf) {
    const x1 = center + labelRadius * Math.cos(endAngle)
    const y1 = center + labelRadius * Math.sin(endAngle)
    const x2 = center + labelRadius * Math.cos(startAngle)
    const y2 = center + labelRadius * Math.sin(startAngle)
    return `M ${x1} ${y1} A ${labelRadius} ${labelRadius} 0 0 0 ${x2} ${y2}`
  } else {
    const x1 = center + labelRadius * Math.cos(startAngle)
    const y1 = center + labelRadius * Math.sin(startAngle)
    const x2 = center + labelRadius * Math.cos(endAngle)
    const y2 = center + labelRadius * Math.sin(endAngle)
    return `M ${x1} ${y1} A ${labelRadius} ${labelRadius} 0 0 1 ${x2} ${y2}`
  }
}

function selectSphere(sphere) {
  selectedSphere.value = sphere.id
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
    const scale = svgSize / rect.width
    
    const x = (touch.clientX - rect.left) * scale - center
    const y = (touch.clientY - rect.top) * scale - center
    
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
  width: 100%;
}

.wheel-svg {
  max-width: 100%;
  height: auto;
  cursor: pointer;
}

:root.dark .wheel-svg {
  --wheel-bg: #1e1e1e;
}

.segment {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.segment:hover {
  opacity: 1 !important;
}

.segment-readonly {
  cursor: default;
}

.segment-readonly:hover {
  opacity: 0.85 !important;
}

.sphere-label {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  user-select: none;
}

.sphere-label-readonly {
  cursor: default;
}

.drag-handle {
  cursor: grab;
  transition: all 0.2s ease;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.drag-handle:hover {
  r: 12;
}

.drag-handle:active {
  cursor: grabbing;
}

@media (max-width: 768px) {
  .sphere-label {
    font-size: 10px;
  }
}
</style>
