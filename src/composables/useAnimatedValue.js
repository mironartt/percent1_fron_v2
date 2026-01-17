/**
 * Animated value composable for number counters
 * Used for XP, streaks, progress animations
 */

import { ref } from 'vue'

// Easing functions
const easings = {
  linear: t => t,
  easeOutCubic: t => 1 - Math.pow(1 - t, 3),
  easeOutQuart: t => 1 - Math.pow(1 - t, 4),
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeOutBack: t => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  }
}

/**
 * Create an animated value
 * @param {number} initialValue - Starting value
 * @returns {Object} - { displayValue, animateTo, setValue, formatNumber }
 */
export function useAnimatedValue(initialValue = 0) {
  const displayValue = ref(initialValue)
  const targetValue = ref(initialValue)
  let animationFrame = null

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

  /**
   * Animate to a new value
   * @param {number} newValue - Target value
   * @param {Object} options - Animation options
   */
  function animateTo(newValue, options = {}) {
    const {
      duration = 500,
      easing = 'easeOutCubic'
    } = options

    // Cancel any existing animation
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
    }

    // Skip animation if reduced motion preferred
    if (prefersReducedMotion) {
      displayValue.value = newValue
      targetValue.value = newValue
      return
    }

    const start = displayValue.value
    const diff = newValue - start
    const startTime = performance.now()
    const easingFn = easings[easing] || easings.easeOutCubic

    function step(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easingFn(progress)

      displayValue.value = Math.round(start + diff * easedProgress)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step)
      } else {
        displayValue.value = newValue
        animationFrame = null
      }
    }

    targetValue.value = newValue
    animationFrame = requestAnimationFrame(step)
  }

  /**
   * Set value instantly without animation
   */
  function setValue(newValue) {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }
    displayValue.value = newValue
    targetValue.value = newValue
  }

  /**
   * Increment value with animation
   */
  function increment(amount = 1, options = {}) {
    animateTo(targetValue.value + amount, options)
  }

  /**
   * Decrement value with animation
   */
  function decrement(amount = 1, options = {}) {
    animateTo(targetValue.value - amount, options)
  }

  return {
    displayValue,
    targetValue,
    animateTo,
    setValue,
    increment,
    decrement
  }
}

/**
 * Format number with K/M suffixes
 * @param {number} value - Number to format
 * @param {number} decimals - Decimal places for suffixes
 * @returns {string} - Formatted string
 */
export function formatNumber(value, decimals = 1) {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(decimals).replace(/\.0$/, '') + 'M'
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(decimals).replace(/\.0$/, '') + 'K'
  }
  return String(value)
}
