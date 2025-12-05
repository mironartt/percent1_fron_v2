<template>
  <div class="wheel-of-life">
    <svg 
      :width="svgSize" 
      :height="svgSize" 
      :viewBox="`0 0 ${svgSize} ${svgSize}`"
      class="wheel-svg"
    >
      <defs>
        <!-- Arc paths for curved text - outer line -->
        <path
          v-for="(sphere, index) in spheres"
          :key="`arc-path-${sphere.id}`"
          :id="`text-arc-${index}`"
          :d="getTextArcPath(index, 0)"
          fill="none"
        />
        <!-- Arc paths for curved text - inner line (for two-line labels) -->
        <path
          v-for="(sphere, index) in spheres"
          :key="`arc-path-inner-${sphere.id}`"
          :id="`text-arc-inner-${index}`"
          :d="getTextArcPath(index, 1)"
          fill="none"
        />
      </defs>

      <!-- Outer wheel circle (full boundary) -->
      <circle
        :cx="center"
        :cy="center"
        :r="outerRadius"
        fill="var(--wheel-bg, #ffffff)"
        stroke="var(--border-color)"
        stroke-width="1"
      />

      <!-- Grid circles (10 levels) - inside the score area -->
      <circle
        v-for="i in 10"
        :key="`grid-${i}`"
        :cx="center"
        :cy="center"
        :r="(gridRadius / 10) * i"
        fill="none"
        stroke="var(--border-color)"
        stroke-width="1"
        opacity="0.4"
      />

      <!-- Radial dividing lines (from center to outer edge) -->
      <line
        v-for="(sphere, index) in spheres"
        :key="`line-${sphere.id}`"
        :x1="center"
        :y1="center"
        :x2="center + outerRadius * Math.cos(getAngle(index))"
        :y2="center + outerRadius * Math.sin(getAngle(index))"
        stroke="var(--border-color)"
        stroke-width="1"
        opacity="0.5"
      />

      <!-- Center white circle -->
      <circle
        :cx="center"
        :cy="center"
        :r="centerRadius"
        fill="white"
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

      <!-- Sphere labels - curved text following arc -->
      <template v-for="(sphere, index) in spheres" :key="`label-group-${sphere.id}`">
        <!-- Single line label (short names) -->
        <text
          v-if="!needsTwoLines(sphere.name)"
          :fill="getSphereColor(index)"
          :class="['sphere-label', { 'sphere-label-readonly': readonly }]"
          @click="!readonly && selectSphere(sphere)"
        >
          <textPath
            :href="`#text-arc-${index}`"
            startOffset="50%"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {{ sphere.name.toUpperCase() }}
          </textPath>
        </text>
        <!-- Two line label (long names) -->
        <template v-else>
          <text
            :fill="getSphereColor(index)"
            :class="['sphere-label', { 'sphere-label-readonly': readonly }]"
            @click="!readonly && selectSphere(sphere)"
          >
            <textPath
              :href="`#text-arc-${index}`"
              startOffset="50%"
              text-anchor="middle"
              dominant-baseline="middle"
            >
              {{ splitName(sphere.name)[0] }}
            </textPath>
          </text>
          <text
            :fill="getSphereColor(index)"
            :class="['sphere-label', 'sphere-label-line2', { 'sphere-label-readonly': readonly }]"
            @click="!readonly && selectSphere(sphere)"
          >
            <textPath
              :href="`#text-arc-inner-${index}`"
              startOffset="50%"
              text-anchor="middle"
              dominant-baseline="middle"
            >
              {{ splitName(sphere.name)[1] }}
            </textPath>
          </text>
        </template>
      </template>

      <!-- Interactive handle for dragging (hidden in readonly mode) -->
      <circle
        v-for="(sphere, index) in spheres"
        :key="`handle-${sphere.id}`"
        v-if="!readonly"
        :cx="center + Math.max((gridRadius / 10) * sphere.score, gridRadius / 15) * Math.cos(getAngle(index) + angleStep / 2)"
        :cy="center + Math.max((gridRadius / 10) * sphere.score, gridRadius / 15) * Math.sin(getAngle(index) + angleStep / 2)"
        r="14"
        :fill="selectedSphere === sphere.id ? getSphereColor(index) : 'white'"
        :stroke="getSphereColor(index)"
        stroke-width="3"
        class="drag-handle"
        @mousedown="startDrag($event, sphere, index)"
        @touchstart.prevent="startDrag($event, sphere, index)"
      />
      <!-- Invisible larger touch target for mobile -->
      <circle
        v-for="(sphere, index) in spheres"
        :key="`touch-${sphere.id}`"
        v-if="!readonly"
        :cx="center + Math.max((gridRadius / 10) * sphere.score, gridRadius / 15) * Math.cos(getAngle(index) + angleStep / 2)"
        :cy="center + Math.max((gridRadius / 10) * sphere.score, gridRadius / 15) * Math.sin(getAngle(index) + angleStep / 2)"
        r="28"
        fill="transparent"
        class="touch-target"
        @mousedown="startDrag($event, sphere, index)"
        @touchstart.prevent="startDrag($event, sphere, index)"
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
const outerRadius = 320
const gridRadius = 240
const centerRadius = 24
const labelRadius = (gridRadius + outerRadius) / 2 + 15

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

function getMidAngle(index) {
  return getAngle(index) + angleStep.value / 2
}

const labelRadiusInner = labelRadius - 22

function needsTwoLines(name) {
  return name.length > 18
}

function splitName(name) {
  const words = name.split(/[,\s]+/)
  if (words.length <= 2) {
    const mid = Math.ceil(name.length / 2)
    const spaceIndex = name.indexOf(' ', mid - 5)
    if (spaceIndex > 0 && spaceIndex < name.length - 3) {
      return [name.slice(0, spaceIndex).toUpperCase(), name.slice(spaceIndex + 1).toUpperCase()]
    }
    return [name.toUpperCase(), '']
  }
  const midIndex = Math.ceil(words.length / 2)
  const firstLine = words.slice(0, midIndex).join(' ').toUpperCase()
  const secondLine = words.slice(midIndex).join(' ').toUpperCase()
  return [firstLine, secondLine]
}

function getTextArcPath(index, lineNumber = 0) {
  const startAngle = getAngle(index)
  const endAngle = getAngle(index + 1)
  const midAngle = getMidAngle(index)
  
  const isBottomHalf = midAngle > 0 && midAngle < Math.PI
  const radius = lineNumber === 0 ? labelRadius : labelRadiusInner
  
  let arcStart, arcEnd
  if (isBottomHalf) {
    arcStart = endAngle
    arcEnd = startAngle
  } else {
    arcStart = startAngle
    arcEnd = endAngle
  }
  
  const x1 = center + radius * Math.cos(arcStart)
  const y1 = center + radius * Math.sin(arcStart)
  const x2 = center + radius * Math.cos(arcEnd)
  const y2 = center + radius * Math.sin(arcEnd)
  
  const sweepFlag = isBottomHalf ? 0 : 1
  
  return `M ${x1} ${y1} A ${radius} ${radius} 0 0 ${sweepFlag} ${x2} ${y2}`
}

function getSegmentPath(index, score) {
  const startAngle = getAngle(index)
  const endAngle = getAngle(index + 1)
  const scoreRadius = (gridRadius / 10) * Math.max(score, 0.5)

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
    const newScore = Math.max(0, Math.min(10, Math.round((distance / gridRadius) * 10)))
    
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
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  cursor: pointer;
  user-select: none;
}

.sphere-label-readonly {
  cursor: default;
}

.sphere-label-line2 {
  font-size: 13px;
}

.drag-handle {
  cursor: grab;
  transition: all 0.2s ease;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.drag-handle:hover {
  r: 16;
}

.drag-handle:active {
  cursor: grabbing;
}

.touch-target {
  cursor: grab;
  touch-action: none;
}

.touch-target:active {
  cursor: grabbing;
}

@media (max-width: 768px) {
  .sphere-label {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: 1.5px;
    paint-order: stroke fill;
    stroke: white;
    stroke-width: 3px;
    stroke-linejoin: round;
  }
  
  .sphere-label-line2 {
    font-size: 20px;
  }
  
  .wheel-of-life {
    width: 100%;
    min-width: unset;
  }
  
  .wheel-svg {
    width: 100%;
    height: auto;
  }
}

@media (max-width: 480px) {
  .sphere-label {
    font-size: 21px;
    letter-spacing: 1px;
    stroke-width: 2.5px;
  }
  
  .sphere-label-line2 {
    font-size: 19px;
  }
  
  .drag-handle {
    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3));
  }
}
</style>
