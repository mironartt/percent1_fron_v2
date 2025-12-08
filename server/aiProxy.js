import express from 'express'
import cors from 'cors'
import OpenAI from 'openai'

const app = express()
app.use(cors())
app.use(express.json())

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const MODEL = 'gpt-5'

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
})

app.post('/api/ai/generate-goal', async (req, res) => {
  try {
    const { goalText, sphereId } = req.body
    
    if (!goalText || !goalText.trim()) {
      return res.status(400).json({ success: false, error: 'Goal text is required' })
    }

    const systemPrompt = `Ты - эксперт по постановке целей и личной эффективности. Пользователь даёт тебе цель, а ты создаёшь структурированную декомпозицию с конкретными шагами.

Верни JSON объект со следующей структурой:
{
  "title": "Уточнённая формулировка цели (краткая, до 100 символов)",
  "whyImportant": "Почему эта цель важна (1-2 предложения)",
  "howChangesLife": "Как достижение цели изменит жизнь (1-2 предложения)", 
  "steps": [
    {
      "title": "Название шага (краткое, до 80 символов)",
      "description": "Описание шага (опционально, до 200 символов)",
      "order": 1
    }
  ]
}

Правила:
- Создай 3-7 конкретных, измеримых шагов
- Шаги должны быть последовательными и логичными
- Используй глаголы действия в начале каждого шага
- Шаги должны быть выполнимыми за разумное время (от часа до недели каждый)
- Отвечай ТОЛЬКО валидным JSON без markdown-разметки`

    const userPrompt = sphereId 
      ? `Цель: "${goalText}"\nСфера жизни: ${sphereId}`
      : `Цель: "${goalText}"`

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 8192
    })

    const content = response.choices?.[0]?.message?.content
    if (!content) {
      console.error('[AI Proxy] Empty response. Finish reason:', response.choices?.[0]?.finish_reason)
      throw new Error('Empty response from AI')
    }

    const parsed = JSON.parse(content)
    
    if (!parsed.title || !Array.isArray(parsed.steps) || parsed.steps.length === 0) {
      throw new Error('Invalid response format from AI')
    }

    res.json({
      success: true,
      data: {
        title: parsed.title,
        whyImportant: parsed.whyImportant || '',
        howChangesLife: parsed.howChangesLife || '',
        steps: parsed.steps.map((step, index) => ({
          id: `ai-step-${Date.now()}-${index}`,
          title: step.title,
          description: step.description || '',
          order: step.order || index + 1,
          completed: false
        })),
        generatedByAI: true
      }
    })
  } catch (error) {
    console.error('[AI Proxy] Error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Error generating goal'
    })
  }
})

app.post('/api/ai/generate-steps', async (req, res) => {
  try {
    const { goalTitle, sphereId } = req.body
    
    if (!goalTitle || !goalTitle.trim()) {
      return res.status(400).json({ success: false, error: 'Goal title is required' })
    }

    const systemPrompt = `Ты - эксперт по декомпозиции целей. Пользователь даёт тебе цель, а ты создаёшь конкретные шаги для её достижения.

Верни JSON объект со следующей структурой:
{
  "steps": [
    {
      "title": "Название шага (краткое, до 80 символов)",
      "description": "Описание шага (опционально, до 150 символов)",
      "timeEstimate": 2
    }
  ]
}

Правила:
- Создай 3-7 конкретных, измеримых шагов
- Шаги должны быть последовательными и логичными
- Используй глаголы действия в начале каждого шага
- timeEstimate - примерное время выполнения в часах (0.5 - 8)
- Отвечай ТОЛЬКО валидным JSON без markdown-разметки`

    const userPrompt = sphereId 
      ? `Цель: "${goalTitle}"\nСфера жизни: ${sphereId}`
      : `Цель: "${goalTitle}"`

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 4096
    })

    const content = response.choices?.[0]?.message?.content
    if (!content) {
      console.error('[AI Proxy] Empty response for steps. Finish reason:', response.choices?.[0]?.finish_reason)
      throw new Error('Empty response from AI')
    }

    const parsed = JSON.parse(content)
    
    if (!Array.isArray(parsed.steps) || parsed.steps.length === 0) {
      throw new Error('Invalid response format from AI')
    }

    res.json({
      success: true,
      data: {
        steps: parsed.steps.map((step, index) => ({
          title: step.title,
          description: step.description || '',
          timeEstimate: step.timeEstimate || null,
          order: index + 1
        }))
      }
    })
  } catch (error) {
    console.error('[AI Proxy] Generate steps error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Error generating steps'
    })
  }
})

app.get('/api/ai/health', (req, res) => {
  res.json({ status: 'ok' })
})

const PORT = 3001
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[AI Proxy] Server running on port ${PORT}`)
})
