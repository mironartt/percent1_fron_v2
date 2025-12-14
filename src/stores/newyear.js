import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNewYearStore = defineStore('newyear', () => {
  const STORAGE_KEY = 'newyear_answers'
  const PROGRESS_KEY = 'newyear_progress'
  const REF_KEY = 'newyear_ref'
  const COMPLETED_KEY = 'newyear_completed'

  const spheres = [
    { id: 'health', name: 'Здоровье', icon: '💪', color: '#10b981' },
    { id: 'career', name: 'Карьера', icon: '💼', color: '#3b82f6' },
    { id: 'finance', name: 'Финансы', icon: '💰', color: '#f59e0b' },
    { id: 'relationships', name: 'Отношения', icon: '❤️', color: '#ef4444' },
    { id: 'growth', name: 'Развитие', icon: '📚', color: '#8b5cf6' },
    { id: 'rest', name: 'Отдых', icon: '🌴', color: '#06b6d4' }
  ]

  const questions = [
    { id: 1, sphere: 'health', type: 'scale', text: 'Как ты оцениваешь своё здоровье и энергию в 2025 году?' },
    { id: 2, sphere: 'health', type: 'text', text: 'Что больше всего повлияло на твоё здоровье в этом году?' },
    { id: 3, sphere: 'career', type: 'scale', text: 'Насколько ты доволен своим профессиональным ростом в 2025?' },
    { id: 4, sphere: 'career', type: 'text', text: 'Какое главное достижение в карьере ты можешь отметить?' },
    { id: 5, sphere: 'finance', type: 'scale', text: 'Как ты оцениваешь своё финансовое положение?' },
    { id: 6, sphere: 'finance', type: 'text', text: 'Что помогло или помешало тебе в финансах этого года?' },
    { id: 7, sphere: 'relationships', type: 'scale', text: 'Насколько ты доволен качеством отношений с близкими?' },
    { id: 8, sphere: 'relationships', type: 'text', text: 'Какой момент в отношениях был самым важным в этом году?' },
    { id: 9, sphere: 'growth', type: 'scale', text: 'Как ты оцениваешь своё личностное развитие в 2025?' },
    { id: 10, sphere: 'growth', type: 'text', text: 'Чему самому важному ты научился в этом году?' },
    { id: 11, sphere: 'rest', type: 'scale', text: 'Насколько качественно ты отдыхал и восстанавливался?' },
    { id: 12, sphere: 'rest', type: 'text', text: 'Что дало тебе больше всего энергии и радости?' }
  ]

  const answers = ref(loadAnswers())
  const currentQuestion = ref(loadProgress())
  const referralCode = ref(loadReferral())
  const isCompleted = ref(localStorage.getItem(COMPLETED_KEY) === 'true')

  function loadAnswers() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  }

  function loadProgress() {
    try {
      const saved = localStorage.getItem(PROGRESS_KEY)
      return saved ? parseInt(saved, 10) : 0
    } catch {
      return 0
    }
  }

  function loadReferral() {
    try {
      return localStorage.getItem(REF_KEY) || null
    } catch {
      return null
    }
  }

  function saveAnswers() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers.value))
  }

  function saveProgress() {
    localStorage.setItem(PROGRESS_KEY, currentQuestion.value.toString())
  }

  function setAnswer(questionId, value) {
    answers.value[questionId] = value
    saveAnswers()
  }

  function nextQuestion() {
    if (currentQuestion.value < questions.length - 1) {
      currentQuestion.value++
      saveProgress()
    }
  }

  function prevQuestion() {
    if (currentQuestion.value > 0) {
      currentQuestion.value--
      saveProgress()
    }
  }

  function goToQuestion(index) {
    if (index >= 0 && index < questions.length) {
      currentQuestion.value = index
      saveProgress()
    }
  }

  function completeTest() {
    isCompleted.value = true
    localStorage.setItem(COMPLETED_KEY, 'true')
  }

  function setReferralCode(code) {
    referralCode.value = code
    localStorage.setItem(REF_KEY, code)
  }

  function resetTest() {
    answers.value = {}
    currentQuestion.value = 0
    isCompleted.value = false
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(PROGRESS_KEY)
    localStorage.removeItem(COMPLETED_KEY)
  }

  const progress = computed(() => {
    const answered = Object.keys(answers.value).length
    return Math.round((answered / questions.length) * 100)
  })

  const currentQuestionData = computed(() => {
    return questions[currentQuestion.value] || null
  })

  const sphereScores = computed(() => {
    const scores = {}
    spheres.forEach(sphere => {
      const scaleQuestion = questions.find(q => q.sphere === sphere.id && q.type === 'scale')
      if (scaleQuestion && answers.value[scaleQuestion.id] !== undefined) {
        scores[sphere.id] = answers.value[scaleQuestion.id]
      } else {
        scores[sphere.id] = 0
      }
    })
    return scores
  })

  const topStrengths = computed(() => {
    const sorted = [...spheres].sort((a, b) => 
      (sphereScores.value[b.id] || 0) - (sphereScores.value[a.id] || 0)
    )
    return sorted.slice(0, 3)
  })

  const growthZones = computed(() => {
    const sorted = [...spheres].sort((a, b) => 
      (sphereScores.value[a.id] || 0) - (sphereScores.value[b.id] || 0)
    )
    return sorted.slice(0, 3)
  })

  const mainLever = computed(() => {
    return growthZones.value[0] || null
  })

  const canProceed = computed(() => {
    const q = currentQuestionData.value
    if (!q) return false
    const answer = answers.value[q.id]
    if (q.type === 'scale') return answer !== undefined && answer !== null
    if (q.type === 'text') return answer && answer.trim().length > 0
    return false
  })

  const isLastQuestion = computed(() => {
    return currentQuestion.value === questions.length - 1
  })

  return {
    spheres,
    questions,
    answers,
    currentQuestion,
    referralCode,
    isCompleted,
    progress,
    currentQuestionData,
    sphereScores,
    topStrengths,
    growthZones,
    mainLever,
    canProceed,
    isLastQuestion,
    setAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    completeTest,
    setReferralCode,
    resetTest
  }
})
