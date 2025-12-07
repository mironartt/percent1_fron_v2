export async function generateGoalWithAI(goalText, sphereId = null) {
  try {
    const response = await fetch('/api/ai/generate-goal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
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
