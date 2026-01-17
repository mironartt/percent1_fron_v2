/**
 * Confetti micro-interaction composable
 * Based on Todoist/Structured completion celebrations
 */

let confettiModule = null

// Lazy load canvas-confetti
async function loadConfetti() {
  if (confettiModule) return confettiModule

  try {
    const module = await import('canvas-confetti')
    confettiModule = module.default
    return confettiModule
  } catch (error) {
    console.warn('[useConfetti] canvas-confetti not installed. Run: npm install canvas-confetti')
    return null
  }
}

export function useConfetti() {
  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

  /**
   * Basic celebration burst
   */
  async function celebrate() {
    if (prefersReducedMotion) return

    const confetti = await loadConfetti()
    if (!confetti) return

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981'],
      disableForReducedMotion: true
    })
  }

  /**
   * Big celebration for achievements/goals
   */
  async function celebrateBig() {
    if (prefersReducedMotion) return

    const confetti = await loadConfetti()
    if (!confetti) return

    const duration = 1500
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#6366f1', '#a855f7', '#ec4899'],
        disableForReducedMotion: true
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f59e0b', '#10b981', '#3b82f6'],
        disableForReducedMotion: true
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  }

  /**
   * Celebrate from a specific element position
   */
  async function celebrateFrom(element) {
    if (prefersReducedMotion || !element) return

    const confetti = await loadConfetti()
    if (!confetti) return

    const rect = element.getBoundingClientRect()
    const x = (rect.left + rect.width / 2) / window.innerWidth
    const y = (rect.top + rect.height / 2) / window.innerHeight

    confetti({
      particleCount: 30,
      spread: 50,
      origin: { x, y },
      colors: ['#6366f1', '#a855f7', '#10b981'],
      disableForReducedMotion: true
    })
  }

  /**
   * Subtle sparkle effect
   */
  async function sparkle() {
    if (prefersReducedMotion) return

    const confetti = await loadConfetti()
    if (!confetti) return

    confetti({
      particleCount: 20,
      spread: 40,
      startVelocity: 15,
      decay: 0.95,
      gravity: 0.5,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#f59e0b'],
      shapes: ['star'],
      disableForReducedMotion: true
    })
  }

  return {
    celebrate,
    celebrateBig,
    celebrateFrom,
    sparkle
  }
}
