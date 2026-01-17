<template>
  <div
    class="swipeable-wrapper"
    :class="{ swiping: isSwiping }"
  >
    <!-- Background actions -->
    <div class="swipe-actions">
      <div class="action complete" :style="{ opacity: completeOpacity }">
        <Check :size="20" :stroke-width="2" />
        <span class="action-label">Готово</span>
      </div>
      <div class="action delete" :style="{ opacity: deleteOpacity }">
        <Trash2 :size="20" :stroke-width="2" />
        <span class="action-label">Удалить</span>
      </div>
    </div>

    <!-- Swipeable card -->
    <div
      ref="cardRef"
      class="swipeable-card"
      @touchstart.passive="onTouchStart"
      @touchmove.passive="onTouchMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
      :style="cardStyle"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Check, Trash2 } from 'lucide-vue-next'

const props = defineProps({
  threshold: { type: Number, default: 80 },
  maxSwipe: { type: Number, default: 120 },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['complete', 'delete'])

const cardRef = ref(null)
const offset = ref(0)
const startX = ref(0)
const startY = ref(0)
const isSwiping = ref(false)
const isHorizontal = ref(null)

// Computed styles
const cardStyle = computed(() => ({
  transform: `translateX(${offset.value}px)`,
  transition: isSwiping.value ? 'none' : 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
}))

const completeOpacity = computed(() => {
  if (offset.value >= 0) return 0
  return Math.min(1, Math.abs(offset.value) / props.threshold)
})

const deleteOpacity = computed(() => {
  if (offset.value <= 0) return 0
  return Math.min(1, offset.value / props.threshold)
})

// Haptic feedback
function triggerHaptic(type = 'light') {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: [10, 50, 10],
      heavy: [30, 50, 30]
    }
    navigator.vibrate(patterns[type] || patterns.light)
  }
}

// Touch handlers
function onTouchStart(e) {
  if (props.disabled) return

  startX.value = e.touches[0].clientX
  startY.value = e.touches[0].clientY
  isHorizontal.value = null
}

function onTouchMove(e) {
  if (props.disabled) return

  const currentX = e.touches[0].clientX
  const currentY = e.touches[0].clientY
  const diffX = currentX - startX.value
  const diffY = currentY - startY.value

  // Determine swipe direction on first move
  if (isHorizontal.value === null) {
    if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
      isHorizontal.value = Math.abs(diffX) > Math.abs(diffY)
    }
    return
  }

  // Only handle horizontal swipes
  if (!isHorizontal.value) return

  isSwiping.value = true

  // Apply resistance at edges
  let newOffset = diffX
  if (Math.abs(newOffset) > props.maxSwipe) {
    const overflow = Math.abs(newOffset) - props.maxSwipe
    const resistance = 1 - (overflow / (overflow + 100))
    newOffset = Math.sign(newOffset) * (props.maxSwipe + overflow * resistance * 0.3)
  }

  offset.value = newOffset

  // Haptic feedback when crossing threshold
  if (Math.abs(offset.value) >= props.threshold && Math.abs(diffX) < props.threshold + 5) {
    triggerHaptic('medium')
  }
}

function onTouchEnd() {
  if (props.disabled) return

  isSwiping.value = false

  // Check if threshold crossed
  if (offset.value <= -props.threshold) {
    triggerHaptic('heavy')
    emit('complete')
  } else if (offset.value >= props.threshold) {
    triggerHaptic('heavy')
    emit('delete')
  }

  // Spring back
  offset.value = 0
  isHorizontal.value = null
}
</script>

<style scoped>
.swipeable-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-md);
}

.swipeable-card {
  position: relative;
  z-index: 2;
  background: var(--bg-primary);
  will-change: transform;
}

.swipe-actions {
  position: absolute;
  inset: 0;
  display: flex;
  z-index: 1;
}

.action {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  color: white;
  font-weight: 600;
  transition: opacity 0.1s ease;
  min-height: var(--touch-target);
}

.action.complete {
  background: var(--success-color);
  justify-content: flex-end;
  align-items: flex-start;
  padding-left: 1.25rem;
  flex-direction: row;
  gap: 0.5rem;
}

.action.delete {
  background: var(--danger-color);
  justify-content: flex-start;
  align-items: flex-end;
  padding-right: 1.25rem;
  flex-direction: row-reverse;
  gap: 0.5rem;
}

.action-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .swipeable-card {
    transition: none !important;
  }

  .action {
    transition: none;
  }
}
</style>
