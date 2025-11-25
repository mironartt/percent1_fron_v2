import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // ССП (Сбалансированная система показателей)
  const lifeSpheres = ref([
    {
      id: 'wealth',
      name: 'Благосостояние',
      icon: '💰',
      score: 0,
      notes: '',
      goals: [],
      reflection: {
        why: '',
        ten: '',
        prevents: '',
        desired: ''
      }
    },
    {
      id: 'hobbies',
      name: 'Хобби и отдых',
      icon: '🎨',
      score: 0,
      notes: '',
      goals: [],
      reflection: {
        why: '',
        ten: '',
        prevents: '',
        desired: ''
      }
    },
    {
      id: 'friendship',
      name: 'Дружба и окружение',
      icon: '👥',
      score: 0,
      notes: '',
      goals: [],
      reflection: {
        why: '',
        ten: '',
        prevents: '',
        desired: ''
      }
    },
    {
      id: 'health',
      name: 'Здоровье и спорт',
      icon: '❤️',
      score: 0,
      notes: '',
      goals: [],
      reflection: {
        why: '',
        ten: '',
        prevents: '',
        desired: ''
      }
    },
    {
      id: 'career',
      name: 'Работа и карьера',
      icon: '💼',
      score: 0,
      notes: '',
      goals: [],
      reflection: {
        why: '',
        ten: '',
        prevents: '',
        desired: ''
      }
    },
    {
      id: 'love',
      name: 'Любовь, семья, отношения',
      icon: '💕',
      score: 0,
      notes: '',
      goals: [],
      reflection: {
        why: '',
        ten: '',
        prevents: '',
        desired: ''
      }
    }
  ])

  // User data
  const user = ref({
    name: 'Дмитрий'
  })

  // Onboarding data
  const onboarding = ref({
    completed: false,
    data: null
  })

  // Mini Task data
  const miniTask = ref({
    completed: false,
    data: null,
    currentStep: 1,
    brainDump: [],
    selectedActions: [],
    completedActions: []
  })

  // Payment data
  const payment = ref({
    completed: false,
    subscription: null
  })

  // ССП - Банк целей и результаты модуля
  const sspGoalsBank = ref([])
  const sspModuleCompleted = ref({
    completed: false,
    data: null
  })

  // Банк целей - полноценная система
  const goalsBank = ref({
    currentStep: 1,
    rawIdeas: [],
    validatedGoals: [],
    keyGoals: [],
    sphereAnalysis: {
      lowestSphere: null,
      leverageSphere: null,
      notes: ''
    },
    completedAt: null
  })

  // Цели
  const goals = ref([])
  
  // Планировщик
  const weeklyPlan = ref({
    currentWeek: null,
    focusGoals: [],
    schedule: {},
    reflections: []
  })

  const dailyPlan = ref({
    date: new Date().toISOString().split('T')[0],
    topPriorities: [],
    tasks: [],
    energyLevel: null,
    morningReflection: '',
    eveningReflection: ''
  })

  // Computed
  const averageScore = computed(() => {
    const total = lifeSpheres.value.reduce((sum, sphere) => sum + sphere.score, 0)
    return Math.round(total / lifeSpheres.value.length)
  })

  const totalGoals = computed(() => goals.value.length)
  
  const activeGoals = computed(() => {
    return goals.value.filter(g => g.status === 'active').length
  })

  const completedGoals = computed(() => {
    return goals.value.filter(g => g.status === 'completed').length
  })

  // Actions
  function updateSphere(sphereId, updates) {
    const sphere = lifeSpheres.value.find(s => s.id === sphereId)
    if (sphere) {
      Object.assign(sphere, updates)
      saveToLocalStorage()
    }
  }

  function addGoal(goal) {
    goals.value.push({
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'active',
      progress: 0,
      ...goal
    })
    saveToLocalStorage()
  }

  function updateGoal(goalId, updates) {
    const goal = goals.value.find(g => g.id === goalId)
    if (goal) {
      Object.assign(goal, updates)
      saveToLocalStorage()
    }
  }

  function deleteGoal(goalId) {
    const index = goals.value.findIndex(g => g.id === goalId)
    if (index !== -1) {
      goals.value.splice(index, 1)
      saveToLocalStorage()
    }
  }

  function updateWeeklyPlan(updates) {
    Object.assign(weeklyPlan.value, updates)
    saveToLocalStorage()
  }

  function updateDailyPlan(updates) {
    Object.assign(dailyPlan.value, updates)
    saveToLocalStorage()
  }

  function addTask(task) {
    dailyPlan.value.tasks.push({
      id: Date.now().toString(),
      completed: false,
      ...task
    })
    saveToLocalStorage()
  }

  function toggleTask(taskId) {
    const task = dailyPlan.value.tasks.find(t => t.id === taskId)
    if (task) {
      task.completed = !task.completed
      saveToLocalStorage()
    }
  }

  function saveToLocalStorage() {
    localStorage.setItem('onepercent-data', JSON.stringify({
      lifeSpheres: lifeSpheres.value,
      goals: goals.value,
      weeklyPlan: weeklyPlan.value,
      dailyPlan: dailyPlan.value,
      onboarding: onboarding.value,
      sspGoalsBank: sspGoalsBank.value,
      sspModuleCompleted: sspModuleCompleted.value,
      goalsBank: goalsBank.value
    }))
  }

  function loadFromLocalStorage() {
    const data = localStorage.getItem('onepercent-data')
    if (data) {
      try {
        const parsed = JSON.parse(data)
        if (parsed.lifeSpheres) {
          lifeSpheres.value = parsed.lifeSpheres.map(sphere => ({
            reflection: {
              why: '',
              ten: '',
              prevents: '',
              desired: ''
            },
            ...sphere
          }))
        }
        if (parsed.goals) goals.value = parsed.goals
        if (parsed.weeklyPlan) weeklyPlan.value = parsed.weeklyPlan
        if (parsed.dailyPlan) dailyPlan.value = parsed.dailyPlan
        if (parsed.onboarding) onboarding.value = parsed.onboarding
        if (parsed.sspGoalsBank) sspGoalsBank.value = parsed.sspGoalsBank
        if (parsed.sspModuleCompleted) sspModuleCompleted.value = parsed.sspModuleCompleted
        if (parsed.goalsBank) goalsBank.value = { ...goalsBank.value, ...parsed.goalsBank }
      } catch (e) {
        console.error('Error loading data:', e)
      }
    }
  }

  function completeOnboarding(data) {
    onboarding.value = {
      completed: true,
      data: data
    }
    saveToLocalStorage()
  }

  function resetOnboarding() {
    onboarding.value = {
      completed: false,
      data: null
    }
    saveToLocalStorage()
  }

  function completeMiniTask(data) {
    miniTask.value = {
      completed: true,
      data: data,
      completedAt: new Date().toISOString()
    }
    saveToLocalStorage()
  }

  // ССП Goals Bank methods
  function addGoalToSSPBank(goal) {
    sspGoalsBank.value.push({
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isTrue: false,
      priority: false,
      ...goal
    })
    saveToLocalStorage()
  }

  function updateSSPGoal(goalId, updates) {
    const goal = sspGoalsBank.value.find(g => g.id === goalId)
    if (goal) {
      Object.assign(goal, updates)
      saveToLocalStorage()
    }
  }

  function deleteSSPGoal(goalId) {
    const index = sspGoalsBank.value.findIndex(g => g.id === goalId)
    if (index !== -1) {
      sspGoalsBank.value.splice(index, 1)
      saveToLocalStorage()
    }
  }

  function completeSSPModule(data) {
    sspModuleCompleted.value = {
      completed: true,
      data: data
    }
    saveToLocalStorage()
  }

  // Goals Bank methods
  function addRawIdea(idea) {
    goalsBank.value.rawIdeas.push({
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      text: idea.text || '',
      whyImportant: idea.whyImportant || '',
      sphereId: idea.sphereId || '',
      mvp: idea.mvp || '',
      decomposition: idea.decomposition || '',
      status: 'raw',
      validated: false,
      threeWhys: {
        why1: '',
        why2: '',
        why3: ''
      }
    })
    saveToLocalStorage()
  }

  function updateRawIdea(ideaId, updates) {
    const idea = goalsBank.value.rawIdeas.find(i => i.id === ideaId)
    if (idea) {
      Object.assign(idea, updates)
      saveToLocalStorage()
    }
  }

  function deleteRawIdea(ideaId) {
    const index = goalsBank.value.rawIdeas.findIndex(i => i.id === ideaId)
    if (index !== -1) {
      goalsBank.value.rawIdeas.splice(index, 1)
      saveToLocalStorage()
    }
  }

  function validateIdea(ideaId, isValid) {
    const idea = goalsBank.value.rawIdeas.find(i => i.id === ideaId)
    if (idea) {
      idea.validated = isValid
      idea.status = isValid ? 'validated' : 'rejected'
      saveToLocalStorage()
    }
  }

  function addKeyGoal(goal) {
    goalsBank.value.keyGoals.push({
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      text: goal.text || '',
      action: goal.action || '',
      sphereId: goal.sphereId || '',
      linkedGoals: goal.linkedGoals || [],
      priority: goal.priority || 0
    })
    saveToLocalStorage()
  }

  function updateKeyGoal(goalId, updates) {
    const goal = goalsBank.value.keyGoals.find(g => g.id === goalId)
    if (goal) {
      Object.assign(goal, updates)
      saveToLocalStorage()
    }
  }

  function deleteKeyGoal(goalId) {
    const index = goalsBank.value.keyGoals.findIndex(g => g.id === goalId)
    if (index !== -1) {
      goalsBank.value.keyGoals.splice(index, 1)
      saveToLocalStorage()
    }
  }

  function updateSphereAnalysis(analysis) {
    goalsBank.value.sphereAnalysis = { ...goalsBank.value.sphereAnalysis, ...analysis }
    saveToLocalStorage()
  }

  function setGoalsBankStep(step) {
    goalsBank.value.currentStep = step
    saveToLocalStorage()
  }

  function completeGoalsBank(selectedGoals = []) {
    goalsBank.value.completedAt = new Date().toISOString()
    
    selectedGoals.forEach(selectedGoal => {
      goals.value.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: selectedGoal.goal,
        description: selectedGoal.whyImportant || '',
        sphereId: selectedGoal.sphere || '',
        status: 'active',
        progress: 0,
        steps: [],
        mvp: '',
        deadline: '',
        createdAt: new Date().toISOString(),
        source: 'goals-bank'
      })
    })
    
    saveToLocalStorage()
  }

  function resetGoalsBank() {
    goalsBank.value = {
      currentStep: 1,
      rawIdeas: [],
      validatedGoals: [],
      keyGoals: [],
      sphereAnalysis: {
        lowestSphere: null,
        leverageSphere: null,
        notes: ''
      },
      completedAt: null
    }
    saveToLocalStorage()
  }

  function resetSSPModule() {
    lifeSpheres.value.forEach(sphere => {
      sphere.score = 0
      sphere.notes = ''
      sphere.reflection = {
        why: '',
        ten: '',
        prevents: '',
        desired: ''
      }
    })
    sspModuleCompleted.value = {
      completed: false,
      data: null
    }
    saveToLocalStorage()
  }

  // Load data on init
  loadFromLocalStorage()

  return {
    user,
    onboarding,
    miniTask,
    payment,
    lifeSpheres,
    sspGoalsBank,
    sspModuleCompleted,
    goals,
    weeklyPlan,
    dailyPlan,
    averageScore,
    totalGoals,
    activeGoals,
    completedGoals,
    updateSphere,
    addGoal,
    updateGoal,
    deleteGoal,
    updateWeeklyPlan,
    updateDailyPlan,
    addTask,
    toggleTask,
    saveToLocalStorage,
    completeOnboarding,
    resetOnboarding,
    completeMiniTask,
    addGoalToSSPBank,
    updateSSPGoal,
    deleteSSPGoal,
    completeSSPModule,
    goalsBank,
    addRawIdea,
    updateRawIdea,
    deleteRawIdea,
    validateIdea,
    addKeyGoal,
    updateKeyGoal,
    deleteKeyGoal,
    updateSphereAnalysis,
    setGoalsBankStep,
    completeGoalsBank,
    resetGoalsBank,
    resetSSPModule
  }
})
