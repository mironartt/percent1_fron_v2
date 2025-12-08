import { getCsrfToken } from '@/services/api.js'

export async function generateGoalWithAI(goalText, sphereId = null) {
  try {
    const headers = { 'Content-Type': 'application/json' }
    const csrfToken = getCsrfToken()
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken
    }
    
    const response = await fetch('/api/ai/generate-goal', {
      method: 'POST',
      headers,
      credentials: 'same-origin',
      body: JSON.stringify({ goalText, sphereId })
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Server error')
    }

    return result
  } catch (error) {
    console.error('[AI Goal Service] Error:', error)
    return {
      success: false,
      error: error.message || 'Ошибка генерации цели'
    }
  }
}

export async function generateStepsWithAI(goalTitle, sphereId = null) {
  try {
    const headers = { 'Content-Type': 'application/json' }
    const csrfToken = getCsrfToken()
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken
    }
    
    const response = await fetch('/api/ai/generate-steps', {
      method: 'POST',
      headers,
      credentials: 'same-origin',
      body: JSON.stringify({ goalTitle, sphereId })
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Server error')
    }

    return result
  } catch (error) {
    console.error('[AI Goal Service] Generate steps error:', error)
    return {
      success: false,
      error: error.message || 'Ошибка генерации шагов'
    }
  }
}
