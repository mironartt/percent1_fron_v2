import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNewYearStore = defineStore('newyear', () => {
  const STORAGE_KEY = 'newyear_answers'
  const PROGRESS_KEY = 'newyear_progress'
  const REF_KEY = 'newyear_ref'
  const COMPLETED_KEY = 'newyear_completed'

  const spheres = [
    { id: 'welfare', name: 'Благосостояние', icon: '💰', color: '#eab308' },
    { id: 'hobby', name: 'Хобби и отдых', icon: '🎨', color: '#f97316' },
    { id: 'environment', name: 'Дружба и окружение', icon: '👥', color: '#14b8a6' },
    { id: 'health', name: 'Здоровье и спорт', icon: '💪', color: '#22c55e' },
    { id: 'work', name: 'Работа и карьера', icon: '💼', color: '#8b5cf6' },
    { id: 'family', name: 'Любовь, семья, отношения', icon: '❤️', color: '#ef4444' }
  ]

  const questions = [
    { id: 1, sphere: 'welfare', type: 'scale', text: 'Как ты оцениваешь своё финансовое благосостояние в 2025 году?' },
    { id: 2, sphere: 'welfare', type: 'text', text: 'Что больше всего повлияло на твоё финансовое положение в этом году?' },
    { id: 3, sphere: 'hobby', type: 'scale', text: 'Насколько ты доволен своим отдыхом и хобби в 2025?' },
    { id: 4, sphere: 'hobby', type: 'text', text: 'Какое увлечение или отдых принесли тебе больше всего радости?' },
    { id: 5, sphere: 'environment', type: 'scale', text: 'Как ты оцениваешь качество своего окружения и дружбы?' },
    { id: 6, sphere: 'environment', type: 'text', text: 'Какие отношения с друзьями были самыми значимыми в этом году?' },
    { id: 7, sphere: 'health', type: 'scale', text: 'Насколько ты доволен своим здоровьем и физической формой?' },
    { id: 8, sphere: 'health', type: 'text', text: 'Что помогло или помешало тебе в заботе о здоровье?' },
    { id: 9, sphere: 'work', type: 'scale', text: 'Как ты оцениваешь свой профессиональный рост и карьеру в 2025?' },
    { id: 10, sphere: 'work', type: 'text', text: 'Какое главное достижение в работе ты можешь отметить?' },
    { id: 11, sphere: 'family', type: 'scale', text: 'Насколько ты доволен отношениями с семьёй и любимыми?' },
    { id: 12, sphere: 'family', type: 'text', text: 'Какой момент в семейных отношениях был самым важным?' }
  ]

  const recommendations = {
    welfare: {
      goals: [
        { title: 'Создать финансовую подушку на 3 месяца', metric: 'Накопить сумму = 3 месячных расхода' },
        { title: 'Увеличить доход на 20%', metric: 'Найти дополнительный источник дохода' }
      ],
      steps: [
        { title: 'Составить бюджет на январь', hours: 2 },
        { title: 'Открыть накопительный счёт', hours: 1 },
        { title: 'Проанализировать расходы за 2025', hours: 3 },
        { title: 'Найти 3 идеи для доп. дохода', hours: 2 }
      ]
    },
    hobby: {
      goals: [
        { title: 'Выделять 5 часов в неделю на хобби', metric: 'Регулярные занятия любимым делом' },
        { title: 'Освоить новое увлечение', metric: 'Попробовать 3 новых активности' }
      ],
      steps: [
        { title: 'Выбрать хобби для развития', hours: 1 },
        { title: 'Записаться на мастер-класс', hours: 1 },
        { title: 'Забронировать время в календаре', hours: 1 },
        { title: 'Купить необходимые материалы', hours: 2 }
      ]
    },
    environment: {
      goals: [
        { title: 'Укрепить связи с 5 близкими друзьями', metric: 'Регулярные встречи раз в 2 недели' },
        { title: 'Расширить круг общения', metric: 'Познакомиться с 10 новыми людьми' }
      ],
      steps: [
        { title: 'Составить список важных людей', hours: 1 },
        { title: 'Назначить встречу с другом', hours: 1 },
        { title: 'Найти сообщество по интересам', hours: 2 },
        { title: 'Посетить нетворкинг-мероприятие', hours: 3 }
      ]
    },
    health: {
      goals: [
        { title: 'Заниматься спортом 3 раза в неделю', metric: '12 тренировок в месяц' },
        { title: 'Улучшить качество сна', metric: '7-8 часов сна ежедневно' }
      ],
      steps: [
        { title: 'Записаться в спортзал/на тренировки', hours: 1 },
        { title: 'Составить план питания на неделю', hours: 2 },
        { title: 'Установить режим сна', hours: 1 },
        { title: 'Пройти чек-ап у врача', hours: 3 }
      ]
    },
    work: {
      goals: [
        { title: 'Получить повышение или новую должность', metric: 'Рост зарплаты на 30%' },
        { title: 'Освоить новый навык для карьеры', metric: 'Пройти 2 профессиональных курса' }
      ],
      steps: [
        { title: 'Обсудить карьерный план с руководителем', hours: 1 },
        { title: 'Выбрать курс для обучения', hours: 2 },
        { title: 'Обновить резюме и LinkedIn', hours: 2 },
        { title: 'Начать вести рабочий дневник достижений', hours: 1 }
      ]
    },
    family: {
      goals: [
        { title: 'Проводить quality time с семьёй каждую неделю', metric: 'Минимум 1 семейное мероприятие в неделю' },
        { title: 'Улучшить коммуникацию в отношениях', metric: 'Ежедневные разговоры по душам' }
      ],
      steps: [
        { title: 'Запланировать семейный ужин', hours: 1 },
        { title: 'Организовать совместный досуг на выходные', hours: 2 },
        { title: 'Написать благодарственное письмо близкому', hours: 1 },
        { title: 'Забронировать время для свидания/встречи', hours: 1 }
      ]
    }
  }

  const weekPlan = [
    { week: 1, title: 'Анализ и планирование', focus: 'Оценить текущую ситуацию и поставить цели' },
    { week: 2, title: 'Первые шаги', focus: 'Начать с самых простых задач для разгона' },
    { week: 3, title: 'Набор темпа', focus: 'Закрепить привычки и увеличить нагрузку' },
    { week: 4, title: 'Рефлексия и корректировка', focus: 'Оценить прогресс и скорректировать план' }
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

  const mainLeverRecommendations = computed(() => {
    if (!mainLever.value) return null
    return recommendations[mainLever.value.id] || null
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
    recommendations,
    weekPlan,
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
    mainLeverRecommendations,
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
