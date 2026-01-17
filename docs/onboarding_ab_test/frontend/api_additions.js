// API Additions for A/B Test
// Добавить эту функцию в конец файла: src/services/api.js

/**
 * Track A/B test event
 * Endpoint: POST /api/rest/front/ab-event/
 *
 * @param {Object} data - Event data
 * @param {string} data.session_id - Session ID (UUID)
 * @param {string} data.variant - Variant ('fast' or 'deep')
 * @param {string} data.event_type - Event type (variant_assigned, onboarding_started, step_completed, onboarding_completed, onboarding_abandoned)
 * @param {number} [data.step_number] - Step number (optional)
 * @param {Object} [data.metadata] - Additional metadata (optional)
 * @returns {Promise<Object>} Response { success: true }
 */
export async function trackABEvent(data) {
  return apiFetch('/api/rest/front/ab-event/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    skipRateLimit: true, // Не применяем rate limiting к трекингу
  })
}

// Пример использования:
/*
import { trackABEvent } from '@/services/api.js'

await trackABEvent({
  session_id: 'uuid-v4-string',
  variant: 'fast',
  event_type: 'variant_assigned',
  metadata: {
    user_agent: navigator.userAgent,
    screen_width: window.screen.width
  }
})

await trackABEvent({
  session_id: 'uuid-v4-string',
  variant: 'deep',
  event_type: 'step_completed',
  step_number: 2,
  metadata: {
    time_spent_ms: 15000,
    category_selected: 'health'
  }
})
*/
