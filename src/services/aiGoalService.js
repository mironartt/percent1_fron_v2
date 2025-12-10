import { apiFetch } from '@/services/api.js'

export async function generateGoalWithAI(goalText, sphereId = null) {
  try {
    const response = await apiFetch('/api/ai/generate-goal', {
      method: 'POST',
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
    const response = await apiFetch('/api/ai/generate-steps', {
      method: 'POST',
      body: JSON.stringify({ goalTitle, sphereId })
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Server error')
    }

    if (result.success && result.data?.steps) {
      return {
        success: true,
        steps: result.data.steps.map(s => s.title)
      }
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

export async function generateMentorGoalSuggestions(sspData) {
  try {
    const response = await apiFetch('/api/ai/mentor-suggestions', {
      method: 'POST',
      body: JSON.stringify({ sspData })
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Server error')
    }

    return result
  } catch (error) {
    console.error('[AI Goal Service] Mentor suggestions error:', error)
    return {
      success: false,
      error: error.message || 'Ошибка подбора целей'
    }
  }
}
