import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { DEBUG_MODE, FORCE_SHOW_ONBOARDING, FORCE_SHOW_MINITASK } from '@/config/settings.js'
import { getOnboardingData, updateOnboardingData } from '@/services/api.js'

export const useAppStore = defineStore('app', () => {
  // ========================================
  // USER & AUTH
  // ========================================
  
  const user = ref({
    id: null,
    email: '',
    first_name: '',
    last_name: '',
    is_authenticated: false,
    finish_onboarding: false,
    finish_minitask: false
  })
  
  const userLoading = ref(false)
  
  function setUser(userData) {
    if (userData) {
      user.value = {
        id: userData.id || null,
        email: userData.email || '',
        first_name: userData.first_name || userData.name || '',
        last_name: userData.last_name || '',
        is_authenticated: true,
        finish_onboarding: userData.finish_onboarding ?? false,
        finish_minitask: userData.finish_minitask ?? false
      }
      
      if (DEBUG_MODE) {
        console.log('[Store] User set:', {
          id: user.value.id,
          email: user.value.email,
          name: user.value.first_name,
          isAuthenticated: user.value.is_authenticated,
          finishOnboarding: user.value.finish_onboarding,
          finishMinitask: user.value.finish_minitask
        })
      }
    }
  }
  
  function clearUser() {
    if (DEBUG_MODE) {
      console.log('[Store] User cleared (logout)')
    }
    
    user.value = {
      id: null,
      email: '',
      first_name: '',
      last_name: '',
      is_authenticated: false,
      finish_onboarding: false,
      finish_minitask: false
    }
  }
  
  const isAuthenticated = computed(() => user.value.is_authenticated)
  
  const displayName = computed(() => {
    if (user.value.first_name) {
      return user.value.first_name
    }
    if (user.value.email) {
      return user.value.email.split('@')[0]
    }
    return 'Пользователь'
  })

  // ========================================
  // ССП (Сбалансированная система показателей)
  // ========================================
  
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

  // Onboarding data (расширенная структура для синхронизации с бэкендом)
  const onboarding = ref({
    completed: false,
    loading: false,
    stepCompleted: 0,
    data: {
      reason_joined: '',
      desired_changes: '',
      growth_comfort_zones: '',
      current_state: '',
      goal_state: '',
      why_important: ''
    }
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

  // Модуль Декомпозиции
  const decompositionModule = ref({
    lessonStarted: false,
    lessonCompleted: false,
    currentStep: 1,
    completedAt: null
  })

  // Модуль Планирования
  const planningModule = ref({
    lessonStarted: false,
    lessonCompleted: false,
    currentStep: 1,
    completedAt: null
  })

  // Недельное планирование
  const weeklyPlans = ref([])

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
      goalsBank: goalsBank.value,
      decompositionModule: decompositionModule.value,
      planningModule: planningModule.value,
      weeklyPlans: weeklyPlans.value
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
        if (parsed.decompositionModule) decompositionModule.value = { ...decompositionModule.value, ...parsed.decompositionModule }
        if (parsed.planningModule) planningModule.value = { ...planningModule.value, ...parsed.planningModule }
        if (parsed.weeklyPlans) weeklyPlans.value = parsed.weeklyPlans
      } catch (e) {
        console.error('Error loading data:', e)
      }
    }
  }

  // ========================================
  // ONBOARDING BACKEND METHODS
  // ========================================

  async function loadOnboardingFromBackend() {
    if (DEBUG_MODE) {
      console.log('[Store] Loading onboarding data from backend...')
    }
    
    onboarding.value.loading = true
    
    try {
      const result = await getOnboardingData()
      
      if (result.status === 'ok' && result.data) {
        const data = result.data
        
        onboarding.value = {
          completed: data.is_complete ?? false,
          loading: false,
          stepCompleted: data.step_completed ?? 0,
          data: {
            reason_joined: data.reason_joined || '',
            desired_changes: data.desired_changes || '',
            growth_comfort_zones: data.growth_comfort_zones || '',
            current_state: data.current_state || '',
            goal_state: data.goal_state || '',
            why_important: data.why_important || ''
          }
        }
        
        if (DEBUG_MODE) {
          console.log('[Store] Onboarding data loaded:', {
            completed: onboarding.value.completed,
            stepCompleted: onboarding.value.stepCompleted,
            hasData: !!onboarding.value.data.reason_joined
          })
        }
        
        return onboarding.value
      } else {
        if (DEBUG_MODE) {
          console.warn('[Store] Failed to load onboarding data:', result)
        }
        onboarding.value.loading = false
        return null
      }
    } catch (error) {
      if (DEBUG_MODE) {
        console.error('[Store] Error loading onboarding data:', error)
      }
      onboarding.value.loading = false
      return null
    }
  }

  async function saveOnboardingToBackend(data) {
    if (DEBUG_MODE) {
      console.log('[Store] Saving onboarding data to backend:', data)
    }
    
    try {
      const result = await updateOnboardingData(data)
      
      if (result.status === 'ok') {
        if (data.step_completed !== undefined) {
          onboarding.value.stepCompleted = data.step_completed
        }
        if (data.is_complete !== undefined) {
          onboarding.value.completed = data.is_complete
          if (data.is_complete) {
            user.value.finish_onboarding = true
          }
        }
        
        const fieldMappings = [
          'reason_joined', 'desired_changes', 'growth_comfort_zones',
          'current_state', 'goal_state', 'why_important'
        ]
        
        fieldMappings.forEach(field => {
          if (data[field] !== undefined) {
            onboarding.value.data[field] = data[field]
          }
        })
        
        if (DEBUG_MODE) {
          console.log('[Store] Onboarding data saved successfully')
        }
        
        return true
      } else {
        if (DEBUG_MODE) {
          console.warn('[Store] Failed to save onboarding data:', result)
        }
        return false
      }
    } catch (error) {
      if (DEBUG_MODE) {
        console.error('[Store] Error saving onboarding data:', error)
      }
      return false
    }
  }

  async function updateOnboardingStep(step) {
    return saveOnboardingToBackend({ step_completed: step })
  }

  async function completeOnboardingWithBackend(data) {
    return saveOnboardingToBackend({
      ...data,
      is_complete: true
    })
  }

  const shouldShowOnboarding = computed(() => {
    if (FORCE_SHOW_ONBOARDING) {
      if (DEBUG_MODE) {
        console.log('[Store] Onboarding forced to show (FORCE_SHOW_ONBOARDING=true)')
      }
      return true
    }
    
    if (!user.value.is_authenticated) {
      return false
    }
    
    return !user.value.finish_onboarding && !onboarding.value.completed
  })

  const shouldShowMiniTask = computed(() => {
    if (FORCE_SHOW_MINITASK) {
      if (DEBUG_MODE) {
        console.log('[Store] MiniTask forced to show (FORCE_SHOW_MINITASK=true)')
      }
      return true
    }
    
    if (!user.value.is_authenticated) {
      return false
    }
    
    if (!user.value.finish_onboarding && !onboarding.value.completed) {
      return false
    }
    
    return !user.value.finish_minitask && !miniTask.value.completed
  })

  function completeOnboarding(data) {
    onboarding.value = {
      completed: true,
      loading: false,
      stepCompleted: 4,
      data: data
    }
    saveToLocalStorage()
  }

  function resetOnboarding() {
    onboarding.value = {
      completed: false,
      loading: false,
      stepCompleted: 0,
      data: {
        reason_joined: '',
        desired_changes: '',
        growth_comfort_zones: '',
        current_state: '',
        goal_state: '',
        why_important: ''
      }
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

  function finishGoalsBankLesson() {
    goalsBank.value.completedAt = new Date().toISOString()
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
        source: 'goals-bank',
        threeWhys: selectedGoal.threeWhys || null
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

  // Decomposition Module methods
  function startDecompositionLesson() {
    decompositionModule.value.lessonStarted = true
    decompositionModule.value.currentStep = 1
    saveToLocalStorage()
  }

  function setDecompositionStep(step) {
    decompositionModule.value.currentStep = step
    saveToLocalStorage()
  }

  function completeDecompositionLesson() {
    decompositionModule.value.lessonCompleted = true
    decompositionModule.value.completedAt = new Date().toISOString()
    saveToLocalStorage()
  }

  function resetDecompositionModule() {
    decompositionModule.value = {
      lessonStarted: false,
      lessonCompleted: false,
      currentStep: 1,
      completedAt: null
    }
    saveToLocalStorage()
  }

  // Planning Module methods
  function startPlanningLesson() {
    planningModule.value.lessonStarted = true
    planningModule.value.currentStep = 1
    saveToLocalStorage()
  }

  function setPlanningStep(step) {
    planningModule.value.currentStep = step
    saveToLocalStorage()
  }

  function completePlanningLesson() {
    planningModule.value.lessonCompleted = true
    planningModule.value.completedAt = new Date().toISOString()
    saveToLocalStorage()
  }

  function resetPlanningModule() {
    planningModule.value = {
      lessonStarted: false,
      lessonCompleted: false,
      currentStep: 1,
      completedAt: null
    }
    weeklyPlans.value = []
    saveToLocalStorage()
  }

  function createWeeklyPlan(weekStart) {
    const plan = {
      id: Date.now().toString(),
      weekStart: weekStart,
      createdAt: new Date().toISOString(),
      scheduledTasks: [],
      completed: false
    }
    weeklyPlans.value.push(plan)
    saveToLocalStorage()
    return plan
  }

  function getCurrentWeekPlan() {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)
    monday.setHours(0, 0, 0, 0)
    const mondayStr = monday.toISOString().split('T')[0]
    
    return weeklyPlans.value.find(p => p.weekStart === mondayStr)
  }

  function addScheduledTask(planId, task) {
    const plan = weeklyPlans.value.find(p => p.id === planId)
    if (plan) {
      plan.scheduledTasks.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        goalId: task.goalId,
        stepId: task.stepId,
        stepTitle: task.stepTitle,
        goalTitle: task.goalTitle,
        scheduledDate: task.scheduledDate,
        scheduledTime: task.scheduledTime || null,
        completed: false,
        completedAt: null
      })
      saveToLocalStorage()
    }
  }

  function updateScheduledTask(planId, taskId, updates) {
    const plan = weeklyPlans.value.find(p => p.id === planId)
    if (plan) {
      const task = plan.scheduledTasks.find(t => t.id === taskId)
      if (task) {
        Object.assign(task, updates)
        saveToLocalStorage()
      }
    }
  }

  function removeScheduledTask(planId, taskId) {
    const plan = weeklyPlans.value.find(p => p.id === planId)
    if (plan) {
      const index = plan.scheduledTasks.findIndex(t => t.id === taskId)
      if (index !== -1) {
        plan.scheduledTasks.splice(index, 1)
        saveToLocalStorage()
      }
    }
  }

  function toggleScheduledTaskComplete(planId, taskId) {
    const plan = weeklyPlans.value.find(p => p.id === planId)
    if (plan) {
      const task = plan.scheduledTasks.find(t => t.id === taskId)
      if (task) {
        task.completed = !task.completed
        task.completedAt = task.completed ? new Date().toISOString() : null
        saveToLocalStorage()
      }
    }
  }

  // Load data on init
  loadFromLocalStorage()

  return {
    // User & Auth
    user,
    userLoading,
    setUser,
    clearUser,
    isAuthenticated,
    displayName,
    
    // Core data
    onboarding,
    miniTask,
    payment,
    lifeSpheres,
    sspGoalsBank,
    sspModuleCompleted,
    goals,
    weeklyPlan,
    dailyPlan,
    
    // Computed
    averageScore,
    totalGoals,
    activeGoals,
    completedGoals,
    shouldShowOnboarding,
    shouldShowMiniTask,
    
    // Actions
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
    finishGoalsBankLesson,
    completeGoalsBank,
    resetGoalsBank,
    resetSSPModule,
    decompositionModule,
    startDecompositionLesson,
    setDecompositionStep,
    completeDecompositionLesson,
    resetDecompositionModule,
    
    // Onboarding backend methods
    loadOnboardingFromBackend,
    saveOnboardingToBackend,
    updateOnboardingStep,
    completeOnboardingWithBackend,
    
    // Planning Module
    planningModule,
    weeklyPlans,
    startPlanningLesson,
    setPlanningStep,
    completePlanningLesson,
    resetPlanningModule,
    createWeeklyPlan,
    getCurrentWeekPlan,
    addScheduledTask,
    updateScheduledTask,
    removeScheduledTask,
    toggleScheduledTaskComplete
  }
})
