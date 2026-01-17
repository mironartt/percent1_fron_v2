/**
 * Haptic feedback composable
 * Uses Vibration API for tactile feedback on supported devices
 */

export function useHaptics() {
  // Check if Vibration API is supported
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator

  /**
   * Light tap feedback (10ms)
   */
  function tap() {
    if (isSupported) {
      navigator.vibrate(10)
    }
  }

  /**
   * Success feedback - double pulse
   */
  function success() {
    if (isSupported) {
      navigator.vibrate([10, 50, 10])
    }
  }

  /**
   * Warning feedback - triple pulse
   */
  function warning() {
    if (isSupported) {
      navigator.vibrate([30, 30, 30])
    }
  }

  /**
   * Error feedback - long pulse
   */
  function error() {
    if (isSupported) {
      navigator.vibrate([50, 100, 50])
    }
  }

  /**
   * Heavy feedback - strong single pulse
   */
  function heavy() {
    if (isSupported) {
      navigator.vibrate(50)
    }
  }

  /**
   * Selection change - very light
   */
  function selection() {
    if (isSupported) {
      navigator.vibrate(5)
    }
  }

  /**
   * Custom pattern
   * @param {number | number[]} pattern - Duration in ms or array of [vibrate, pause, vibrate, ...]
   */
  function vibrate(pattern) {
    if (isSupported) {
      navigator.vibrate(pattern)
    }
  }

  /**
   * Cancel any ongoing vibration
   */
  function cancel() {
    if (isSupported) {
      navigator.vibrate(0)
    }
  }

  return {
    isSupported,
    tap,
    success,
    warning,
    error,
    heavy,
    selection,
    vibrate,
    cancel
  }
}
