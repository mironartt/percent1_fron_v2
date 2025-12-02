import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { DEBUG_MODE, FORCE_SHOW_ONBOARDING, FORCE_SHOW_MINITASK } from '@/config/settings.js'
import { 
  getOnboardingData, 
  updateOnboardingData, 
  getMiniTaskData, 
  updateMiniTaskData, 
  getSSPData, 
  updateSSPData, 
  getGlobalData,
  getGoals,
  getGoalSteps,
  updateGoals,
  updateGoalSteps,
  createGoal as apiCreateGoal,
  updateGoal as apiUpdateGoal,
  deleteGoal as apiDeleteGoal,
  completeGoal as apiCompleteGoal,
  createStep as apiCreateStep,
  updateStep as apiUpdateStep,
  deleteStep as apiDeleteStep,
  toggleStepComplete as apiToggleStepComplete,
  scheduleStep as apiScheduleStep
} from '@/services/api.js'
import { useToastStore } from '@/stores/toast'

export const useAppStore = defineStore('app', () => {
  // ========================================
  // GLOBAL DATA (справочники из бэкенда)
  // ========================================
  
  const globalData = ref({
    loading: false,
    loaded: false,
    telegramAuthLink: '',
    telegramAuthCallbackUrl: '',
    // Справочники для целей и шагов
    goalsCategories: [],        // Категории целей (welfare, hobby, ...)
    goalsTypes: [],             // Типы оценки целей (true, false)
    goalsStatuses: [],          // Статусы целей (work, complete)
    goalsStatusesFilter: [],    // Статусы для фильтрации (+ unstatus)
    stepStatusesFilter: [],     // Статусы шагов (planned, unplanned)
    stepResultsFilter: [],      // Результаты шагов (complete, uncomplete)
    timesData: [],              // Варианты времени (half, one, two, ...)
    priorityData: []            // Приоритеты (critical, important, ...)
  })
  
  /**
   * Загрузить глобальные данные с бэкенда
   * Включает справочники для целей, шагов, приоритетов и т.д.
   */
  async function loadGlobalData() {
    if (globalData.value.loading) return
    
    globalData.value.loading = true
    
    try {
      const result = await getGlobalData()
      
      if (result.status === 'ok' && result.data) {
        const data = result.data
        
        globalData.value = {
          loading: false,
          loaded: true,
          telegramAuthLink: data.t_auth_link || '',
          telegramAuthCallbackUrl: data.t_auth_callback_url || '',
          goalsCategories: data.goals_categories_data || [],
          goalsTypes: data.goals_types_data || [],
          goalsStatuses: data.goals_statuses_data || [],
          goalsStatusesFilter: data.goals_statuses_filter_data || [],
          stepStatusesFilter: data.step_statuses_filter_data || [],
          stepResultsFilter: data.step_results_filter_data || [],
          timesData: data.times_data || [],
          priorityData: data.priority_data || []
        }
        
        if (DEBUG_MODE) {
          console.log('[Store] Global data loaded:', {
            categories: globalData.value.goalsCategories.length,
            types: globalData.value.goalsTypes.length,
            statuses: globalData.value.goalsStatuses.length,
            priorities: globalData.value.priorityData.length
          })
        }
      } else {
        globalData.value.loading = false
        if (DEBUG_MODE) {
          console.warn('[Store] Failed to load global data:', result)
        }
      }
    } catch (error) {
      globalData.value.loading = false
      if (DEBUG_MODE) {
        console.error('[Store] Error loading global data:', error)
      }
    }
  }
  
  /**
   * Маппинг категорий бэкенда на фронтенд ID сфер
   * Бэкенд: welfare, hobby, environment, health_sport, work, family
   * Фронт: wealth, hobbies, friendship, health, career, love
   */
  const categoryBackendToFrontend = {
    'welfare': 'wealth',
    'hobby': 'hobbies',
    'environment': 'friendship',
    'health_sport': 'health',
    'work': 'career',
    'family': 'love'
  }
  
  const categoryFrontendToBackend = {
    'wealth': 'welfare',
    'hobbies': 'hobby',
    'friendship': 'environment',
    'health': 'health_sport',
    'career': 'work',
    'love': 'family'
  }
  
  /**
   * Получить название категории по ID
   */
  function getCategoryTitle(categoryId) {
    const category = globalData.value.goalsCategories.find(c => c.id === categoryId)
    return category ? category.title : categoryId
  }
  
  /**
   * Получить название приоритета по ID
   */
  function getPriorityTitle(priorityId) {
    const priority = globalData.value.priorityData.find(p => p.id === priorityId)
    return priority ? priority.title : priorityId
  }
  
  /**
   * Получить название времени по ID
   */
  function getTimeTitle(timeId) {
    const time = globalData.value.timesData.find(t => t.id === timeId)
    return time ? time.title : timeId
  }
  
  // ========================================
  // GOALS API (загрузка и синхронизация с бэкендом)
  // ========================================
  
  const goalsApiData = ref({
    loading: false,
    loaded: false,
    totalData: null,
    pagination: { page: 1, pageSize: 6, totalPages: 1, totalItems: 0 }
  })
  
  /**
   * Загрузить цели с бэкенда и синхронизировать с локальным состоянием
   * @param {Object} params - Параметры запроса (фильтры, сортировка, пагинация)
   */
  async function loadGoalsFromBackend(params = {}) {
    if (goalsApiData.value.loading) return { success: false, reason: 'loading' }
    
    goalsApiData.value.loading = true
    
    try {
      const result = await getGoals(params)
      
      if (result.status === 'ok' && result.data) {
        const data = result.data
        
        // Сохраняем статистику
        goalsApiData.value.totalData = data.total_data || null
        goalsApiData.value.pagination = {
          page: data.page || 1,
          pageSize: data.page_size || 6,
          totalPages: data.total_pages || 1,
          totalItems: data.total_items || 0,
          totalFilteredItems: data.total_filtered_items || 0
        }
        
        // Синхронизируем цели с локальным состоянием goalsBank.rawIdeas
        if (data.goals_data && Array.isArray(data.goals_data)) {
          syncGoalsFromBackend(data.goals_data)
        }
        
        goalsApiData.value.loaded = true
        goalsApiData.value.loading = false
        
        if (DEBUG_MODE) {
          console.log('[Store] Goals loaded from backend:', {
            count: data.goals_data?.length || 0,
            total: data.total_items,
            page: data.page
          })
        }
        
        return { success: true, data }
      } else {
        goalsApiData.value.loading = false
        if (DEBUG_MODE) {
          console.warn('[Store] Failed to load goals:', result)
        }
        return { success: false, error: result.message }
      }
    } catch (error) {
      goalsApiData.value.loading = false
      if (DEBUG_MODE) {
        console.error('[Store] Error loading goals:', error)
      }
      return { success: false, error: error.message }
    }
  }
  
  /**
   * Синхронизировать цели из бэкенда с локальным store
   * Преобразует формат бэкенда в формат фронтенда
   */
  function syncGoalsFromBackend(backendGoals) {
    const syncedGoals = backendGoals.map(g => ({
      id: String(g.goal_id),
      backendId: g.goal_id,
      text: g.title || '',
      sphereId: categoryBackendToFrontend[g.category] || g.category || '',
      whyImportant: g.why_important || '',
      threeWhys: {
        why1: g.why_important || '',
        why2: g.why_give_me || '',
        why3: g.why_about_me || ''
      },
      // score: 'true' → validated, 'false' → rejected, null → raw
      status: g.score === 'true' ? 'validated' : (g.score === 'false' ? 'rejected' : 'raw'),
      validated: g.score === 'true',
      // status из бэкенда: 'work', 'complete', null
      workStatus: g.status || null,
      dateCreated: g.date_created || new Date().toISOString(),
      dateCompleted: g.date_completed || null,
      totalStepsData: g.total_steps_data || null,
      stepsData: g.steps_data || []
    }))
    
    // Обновляем goalsBank.rawIdeas
    goalsBank.value.rawIdeas = syncedGoals
    
    // Также обновляем goals (цели в работе)
    const goalsInWork = syncedGoals.filter(g => g.workStatus === 'work' || g.workStatus === 'complete')
    
    goalsInWork.forEach(backendGoal => {
      const existingGoal = goals.value.find(g => g.backendId === backendGoal.backendId)
      if (!existingGoal) {
        // Добавляем цель в работу
        goals.value.push({
          id: backendGoal.id,
          backendId: backendGoal.backendId,
          title: backendGoal.text,
          description: backendGoal.whyImportant,
          sphereId: backendGoal.sphereId,
          source: 'goals-bank',
          sourceId: backendGoal.id,
          threeWhys: backendGoal.threeWhys,
          status: backendGoal.workStatus === 'complete' ? 'completed' : 'active',
          progress: backendGoal.totalStepsData?.complete_percent || 0,
          steps: backendGoal.stepsData || [],
          createdAt: backendGoal.dateCreated,
          completedAt: backendGoal.dateCompleted
        })
      } else {
        // Обновляем существующую цель
        Object.assign(existingGoal, {
          title: backendGoal.text,
          description: backendGoal.whyImportant,
          sphereId: backendGoal.sphereId,
          threeWhys: backendGoal.threeWhys,
          status: backendGoal.workStatus === 'complete' ? 'completed' : 'active',
          progress: backendGoal.totalStepsData?.complete_percent || 0,
          steps: backendGoal.stepsData || [],
          completedAt: backendGoal.dateCompleted
        })
      }
    })
    
    if (DEBUG_MODE) {
      console.log('[Store] Goals synced from backend:', {
        rawIdeas: goalsBank.value.rawIdeas.length,
        goalsInWork: goalsInWork.length
      })
    }
  }
  
  /**
   * Создать новую цель на бэкенде
   * @param {Object} goalData - Данные цели
   * @returns {Promise<{success: boolean, goalId?: number}>}
   */
  async function createGoalOnBackend(goalData) {
    try {
      const backendData = {
        title: goalData.text || goalData.title,
        category: categoryFrontendToBackend[goalData.sphereId] || goalData.sphereId,
        score: goalData.status === 'validated' ? 'true' : (goalData.status === 'rejected' ? 'false' : null),
        status: goalData.workStatus || null,
        why_important: goalData.whyImportant || goalData.threeWhys?.why1 || '',
        why_give_me: goalData.threeWhys?.why2 || '',
        why_about_me: goalData.threeWhys?.why3 || ''
      }
      
      const result = await apiCreateGoal(backendData)
      
      if (result.status === 'ok') {
        if (DEBUG_MODE) {
          console.log('[Store] Goal created on backend:', result.data)
        }
        return { success: true, goalId: result.data?.created_goals_ids?.[0] }
      }
      
      return { success: false, error: result.message }
    } catch (error) {
      if (DEBUG_MODE) {
        console.error('[Store] Error creating goal on backend:', error)
      }
      return { success: false, error: error.message }
    }
  }
  
  /**
   * Обновить цель на бэкенде
   * @param {number} goalId - ID цели
   * @param {Object} goalData - Данные для обновления
   */
  async function updateGoalOnBackend(goalId, goalData) {
    try {
      const backendData = {}
      
      if (goalData.text !== undefined) backendData.title = goalData.text
      if (goalData.title !== undefined) backendData.title = goalData.title
      if (goalData.sphereId !== undefined) {
        backendData.category = categoryFrontendToBackend[goalData.sphereId] || goalData.sphereId
      }
      if (goalData.status !== undefined) {
        backendData.score = goalData.status === 'validated' ? 'true' : (goalData.status === 'rejected' ? 'false' : null)
      }
      if (goalData.workStatus !== undefined) {
        backendData.status = goalData.workStatus
      }
      if (goalData.whyImportant !== undefined) backendData.why_important = goalData.whyImportant
      if (goalData.threeWhys !== undefined) {
        backendData.why_important = goalData.threeWhys.why1 || ''
        backendData.why_give_me = goalData.threeWhys.why2 || ''
        backendData.why_about_me = goalData.threeWhys.why3 || ''
      }
      
      const result = await apiUpdateGoal(goalId, backendData)
      
      if (result.status === 'ok') {
        if (DEBUG_MODE) {
          console.log('[Store] Goal updated on backend:', goalId)
        }
        return { success: true }
      }
      
      return { success: false, error: result.message }
    } catch (error) {
      if (DEBUG_MODE) {
        console.error('[Store] Error updating goal on backend:', error)
      }
      return { success: false, error: error.message }
    }
  }
  
  /**
   * Удалить цель на бэкенде
   * @param {number} goalId - ID цели
   */
  async function deleteGoalOnBackend(goalId) {
    try {
      const result = await apiDeleteGoal(goalId)
      
      if (result.status === 'ok') {
        if (DEBUG_MODE) {
          console.log('[Store] Goal deleted on backend:', goalId)
        }
        return { success: true }
      }
      
      return { success: false, error: result.message }
    } catch (error) {
      if (DEBUG_MODE) {
        console.error('[Store] Error deleting goal on backend:', error)
      }
      return { success: false, error: error.message }
    }
  }
  
  /**
   * Завершить цель на бэкенде
   * @param {number} goalId - ID цели
   */
  async function completeGoalOnBackend(goalId) {
    try {
      const result = await apiCompleteGoal(goalId)
      
      if (result.status === 'ok') {
        if (DEBUG_MODE) {
          console.log('[Store] Goal completed on backend:', goalId)
        }
        return { success: true }
      }
      
      return { success: false, error: result.message }
    } catch (error) {
      if (DEBUG_MODE) {
        console.error('[Store] Error completing goal on backend:', error)
      }
      return { success: false, error: error.message }
    }
  }
  
  /**
   * Взять цель в работу (установить status: 'work' на бэкенде)
   * @param {number} goalId - ID цели
   */
  async function takeGoalToWorkOnBackend(goalId) {
    return updateGoalOnBackend(goalId, { workStatus: 'work' })
  }
  
  /**
   * Убрать цель из работы (установить status: null на бэкенде)
   * @param {number} goalId - ID цели
   */
  async function removeGoalFromWorkOnBackend(goalId) {
    return updateGoalOnBackend(goalId, { workStatus: null })
  }
  
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
    finish_minitask: false,
    telegram_bot_link: ''
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
        finish_minitask: userData.finish_minitask ?? false,
        telegram_bot_link: userData.telegram_bot_link || ''
      }
      
      if (DEBUG_MODE) {
        console.log('[Store] User set:', {
          id: user.value.id,
          email: user.value.email,
          name: user.value.first_name,
          isAuthenticated: user.value.is_authenticated,
          finishOnboarding: user.value.finish_onboarding,
          finishMinitask: user.value.finish_minitask,
          telegramBotLink: user.value.telegram_bot_link ? 'present' : 'none'
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
      finish_minitask: false,
      telegram_bot_link: ''
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

  // Mini Task data (расширенная структура для синхронизации с бэкендом)
  const miniTask = ref({
    completed: false,
    loading: false,
    stepCompleted: 0,
    tasks: [],
    categories: [],
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

  // ========================================
  // JOURNAL (Дневник)
  // ========================================
  
  const journal = ref({
    entries: [],
    todayEntry: null,
    loading: false
  })

  // Получить сегодняшнюю дату в формате YYYY-MM-DD
  function getTodayDateString() {
    return new Date().toISOString().split('T')[0]
  }

  // Проверить, есть ли запись на сегодня
  const hasTodayEntry = computed(() => {
    const today = getTodayDateString()
    return journal.value.entries.some(e => e.date === today)
  })

  // Получить запись на сегодня
  const todayJournalEntry = computed(() => {
    const today = getTodayDateString()
    return journal.value.entries.find(e => e.date === today) || null
  })

  // Добавить запись в дневник
  function addJournalEntry(entry) {
    const today = getTodayDateString()
    const existingIndex = journal.value.entries.findIndex(e => e.date === today)
    
    const newEntry = {
      id: Date.now().toString(),
      date: today,
      createdAt: new Date().toISOString(),
      whatDone: entry.whatDone || '',
      whatNotDone: entry.whatNotDone || '',
      reflection: entry.reflection || '',
      tomorrowPlans: entry.tomorrowPlans || '',
      aiResponse: entry.aiResponse || null,
      aiResponseLoading: false
    }
    
    if (existingIndex !== -1) {
      journal.value.entries[existingIndex] = newEntry
    } else {
      journal.value.entries.unshift(newEntry)
    }
    
    // Триггер для первых шагов
    if (!firstSteps.value.write_journal) {
      completeFirstStep('write_journal')
    }
    
    saveToLocalStorage()
    return newEntry
  }

  // Обновить существующую запись дневника
  function updateJournalEntry(entryId, updates) {
    const entryIndex = journal.value.entries.findIndex(e => 
      e.id === entryId || String(e.id) === String(entryId)
    )
    
    if (entryIndex !== -1) {
      const existingEntry = journal.value.entries[entryIndex]
      const updatedEntry = {
        ...existingEntry,
        whatDone: updates.whatDone ?? existingEntry.whatDone,
        whatNotDone: updates.whatNotDone ?? existingEntry.whatNotDone,
        reflection: updates.reflection ?? existingEntry.reflection,
        tomorrowPlans: updates.tomorrowPlans ?? existingEntry.tomorrowPlans
      }
      journal.value.entries[entryIndex] = updatedEntry
      saveToLocalStorage()
      return updatedEntry
    }
    
    return null
  }
  
  // Удалить запись дневника
  function deleteJournalEntry(entryId) {
    const entryIndex = journal.value.entries.findIndex(e => 
      e.id === entryId || String(e.id) === String(entryId)
    )
    
    if (entryIndex !== -1) {
      journal.value.entries.splice(entryIndex, 1)
      saveToLocalStorage()
      return true
    }
    
    return false
  }

  // Обновить AI-ответ для записи
  function updateJournalAIResponse(entryId, aiResponse) {
    const entry = journal.value.entries.find(e => e.id === entryId)
    if (entry) {
      entry.aiResponse = aiResponse
      entry.aiResponseLoading = false
      saveToLocalStorage()
    }
  }

  // Установить статус загрузки AI для записи
  function setJournalAILoading(entryId, loading) {
    const entry = journal.value.entries.find(e => e.id === entryId)
    if (entry) {
      entry.aiResponseLoading = loading
    }
  }

  // Получить записи за последние N дней
  function getRecentJournalEntries(days = 7) {
    return journal.value.entries.slice(0, days)
  }

  // Стрик дней (сколько дней подряд есть записи)
  const journalStreak = computed(() => {
    if (journal.value.entries.length === 0) return 0
    
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]
      
      const hasEntry = journal.value.entries.some(e => e.date === dateStr)
      if (hasEntry) {
        streak++
      } else if (i > 0) {
        break
      }
    }
    
    return streak
  })

  // ========================================
  // FIRST STEPS (Новые мини-задания)
  // ========================================
  
  const firstSteps = ref({
    ssp: false,
    add_idea: false,
    validate_goal: false,
    select_key_goal: false,
    plan_task: false,
    write_journal: false,
    chat_mentor: false
  })

  const mentorStepMessages = {
    ssp: 'Отлично! Ты оценил баланс жизни. Это первый шаг к пониманию, где нужны улучшения. Теперь попробуй добавить идею в Банк целей!',
    add_idea: 'Супер! Идея записана. Теперь важно проверить её — действительно ли это твоя цель, а не навязанная извне?',
    validate_goal: 'Прекрасно! Цель проверена. Теперь выбери ключевую цель, на которой сфокусируешься.',
    select_key_goal: 'Ключевая цель выбрана! Теперь запланируй конкретную задачу на эту неделю.',
    plan_task: 'Задача в плане! Напиши в дневник — это поможет осмыслить день и настроиться на следующий.',
    write_journal: 'Дневник заполнен! Если есть вопросы или нужен совет — я всегда готов помочь.',
    chat_mentor: 'Рад общению! Помни: я здесь, чтобы помогать тебе расти на 1% каждый день.'
  }

  function completeFirstStep(stepId) {
    if (firstSteps.value.hasOwnProperty(stepId) && !firstSteps.value[stepId]) {
      firstSteps.value[stepId] = true
      saveToLocalStorage()
      
      if (DEBUG_MODE) {
        console.log('[Store] First step completed:', stepId)
      }
      
      try {
        const toastStore = useToastStore()
        toastStore.showFirstStepToast(stepId, firstSteps.value)
      } catch (e) {
        if (DEBUG_MODE) {
          console.warn('[Store] Could not show toast:', e)
        }
      }
      
      if (mentorStepMessages[stepId]) {
        setTimeout(() => {
          addMentorMessage({
            content: mentorStepMessages[stepId],
            role: 'assistant'
          })
        }, 1000)
      }
    }
  }

  const firstStepsCompleted = computed(() => {
    return Object.values(firstSteps.value).filter(v => v === true).length
  })

  const firstStepsTotal = computed(() => {
    return Object.keys(firstSteps.value).length
  })

  const allFirstStepsCompleted = computed(() => {
    return firstStepsCompleted.value === firstStepsTotal.value
  })

  // ========================================
  // MENTOR (ИИ-наставник)
  // ========================================

  const mentor = ref({
    messages: [],
    isOpen: false,
    mode: 'on_request',
    lastActivity: null
  })

  const mentorPanelCollapsed = ref(false)

  function toggleMentorPanel() {
    mentorPanelCollapsed.value = !mentorPanelCollapsed.value
    saveToLocalStorage()
  }

  function openMentorChat() {
    mentor.value.isOpen = true
    if (!firstSteps.value.chat_mentor) {
      completeFirstStep('chat_mentor')
    }
    saveToLocalStorage()
  }

  function closeMentorChat() {
    mentor.value.isOpen = false
    saveToLocalStorage()
  }

  function addMentorMessage(message) {
    mentor.value.messages.push({
      id: Date.now().toString(),
      ...message,
      timestamp: new Date().toISOString()
    })
    mentor.value.lastActivity = new Date().toISOString()
    saveToLocalStorage()
  }

  function sendMentorMessage(content, role = 'user') {
    addMentorMessage({
      content,
      role
    })
    
    if (role === 'user' && !firstSteps.value.chat_mentor) {
      completeFirstStep('chat_mentor')
    }
  }

  function clearMentorMessages() {
    mentor.value.messages = []
    saveToLocalStorage()
  }

  function setMentorMode(mode) {
    mentor.value.mode = mode
    saveToLocalStorage()
  }

  // Настройки Telegram
  const telegramSettings = ref({
    connected: false,
    chatId: '',
    username: '',
    notifications: {
      morningPlan: true,
      morningTime: '08:00',
      eveningReview: true,
      eveningTime: '21:00',
      weekendPlanning: true,
      taskReminders: false
    },
    connectedAt: null
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

  // ========================================
  // USER STAGE (Адаптивный дашборд)
  // ========================================
  // Stage 1: ССП не заполнена (все оценки = 0)
  // Stage 2: ССП заполнена, но нет целей
  // Stage 3: Есть цели, но нет задач на неделю
  // Stage 4: Всё настроено - полный дашборд
  
  const isSSPCompleted = computed(() => {
    return sspModuleCompleted.value.completed || lifeSpheres.value.some(s => s.score > 0)
  })

  const hasGoals = computed(() => {
    return goals.value.length > 0
  })

  const hasWeeklyTasks = computed(() => {
    const currentPlan = getCurrentWeekPlan()
    return currentPlan && currentPlan.scheduledTasks && currentPlan.scheduledTasks.length > 0
  })

  const userStage = computed(() => {
    // Stage 1: ССП не заполнена
    if (!isSSPCompleted.value) {
      return 1
    }
    
    // Stage 2: ССП заполнена, но нет целей
    if (!hasGoals.value) {
      return 2
    }
    
    // Stage 3: Есть цели, но нет задач на неделю
    if (!hasWeeklyTasks.value) {
      return 3
    }
    
    // Stage 4: Всё настроено
    return 4
  })

  // Actions
  function updateSphere(sphereId, updates) {
    const sphere = lifeSpheres.value.find(s => s.id === sphereId)
    if (sphere) {
      Object.assign(sphere, updates)
      saveToLocalStorage()
    }
  }

  function updateSphereReflection(sphereId, reflection) {
    const sphere = lifeSpheres.value.find(s => s.id === sphereId)
    if (sphere) {
      sphere.reflection = { ...sphere.reflection, ...reflection }
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
      weeklyPlans: weeklyPlans.value,
      telegramSettings: telegramSettings.value,
      journal: journal.value,
      firstSteps: firstSteps.value,
      mentor: mentor.value,
      mentorPanelCollapsed: mentorPanelCollapsed.value
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
        if (parsed.telegramSettings) telegramSettings.value = { ...telegramSettings.value, ...parsed.telegramSettings }
        if (parsed.journal) journal.value = { ...journal.value, ...parsed.journal }
        if (parsed.firstSteps) firstSteps.value = { ...firstSteps.value, ...parsed.firstSteps }
        if (parsed.mentor) mentor.value = { ...mentor.value, ...parsed.mentor }
        if (parsed.mentorPanelCollapsed !== undefined) mentorPanelCollapsed.value = parsed.mentorPanelCollapsed
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
    
    const isCompleted = user.value.finish_onboarding || onboarding.value.completed
    
    if (isCompleted) {
      return false
    }
    
    return true
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

  // ========================================
  // MINI-TASK BACKEND METHODS
  // ========================================

  /**
   * Загрузить данные мини-задания с бэкенда
   */
  async function loadMiniTaskFromBackend() {
    if (DEBUG_MODE) {
      console.log('[Store] Loading mini-task data from backend...')
    }
    
    miniTask.value.loading = true
    
    try {
      const result = await getMiniTaskData()
      
      if (result.status === 'ok' && result.data) {
        const data = result.data
        
        miniTask.value = {
          completed: data.is_complete ?? false,
          loading: false,
          stepCompleted: data.step_completed ?? 0,
          tasks: data.tasks || [],
          categories: data.categories_data || [],
          selectedActions: [],
          completedActions: []
        }
        
        // Извлекаем selectedActions и completedActions из tasks
        if (data.tasks && data.tasks.length > 0) {
          miniTask.value.selectedActions = data.tasks
            .filter(t => t.is_selected_for_action)
            .map(t => t.task_id)
          
          miniTask.value.completedActions = data.tasks
            .filter(t => t.is_completed)
            .map(t => t.task_id)
        }
        
        if (DEBUG_MODE) {
          console.log('[Store] Mini-task data loaded:', {
            completed: miniTask.value.completed,
            stepCompleted: miniTask.value.stepCompleted,
            tasksCount: miniTask.value.tasks.length,
            categoriesCount: miniTask.value.categories.length
          })
        }
        
        return miniTask.value
      } else {
        if (DEBUG_MODE) {
          console.warn('[Store] Failed to load mini-task data:', result)
        }
        miniTask.value.loading = false
        return null
      }
    } catch (error) {
      if (DEBUG_MODE) {
        console.error('[Store] Error loading mini-task data:', error)
      }
      miniTask.value.loading = false
      return null
    }
  }

  /**
   * Сохранить данные мини-задания на бэкенд
   * @param {object} data - Данные для сохранения
   */
  async function saveMiniTaskToBackend(data) {
    if (DEBUG_MODE) {
      console.log('[Store] Saving mini-task data to backend:', data)
    }
    
    try {
      const result = await updateMiniTaskData(data)
      
      if (result.status === 'ok') {
        // Обновляем локальное состояние
        if (data.step_completed !== undefined) {
          miniTask.value.stepCompleted = data.step_completed
        }
        if (data.is_complete !== undefined) {
          miniTask.value.completed = data.is_complete
          if (data.is_complete) {
            user.value.finish_minitask = true
          }
        }
        
        // Если пришли обновлённые tasks с task_id, обновляем локальный массив
        if (result.data && result.data.tasks) {
          miniTask.value.tasks = result.data.tasks
        }
        
        if (DEBUG_MODE) {
          console.log('[Store] Mini-task data saved successfully')
        }
        
        return { success: true, data: result.data }
      } else {
        if (DEBUG_MODE) {
          console.warn('[Store] Failed to save mini-task data:', result)
        }
        return { success: false, error: result.error_data }
      }
    } catch (error) {
      if (DEBUG_MODE) {
        console.error('[Store] Error saving mini-task data:', error)
      }
      return { success: false, error }
    }
  }

  /**
   * Обновить шаг мини-задания
   */
  async function updateMiniTaskStep(step) {
    return saveMiniTaskToBackend({ step_completed: step })
  }

  /**
   * Сохранить задачи мини-задания (шаг 2 - brain dump)
   * @param {Array} tasks - Массив задач с текстом
   * @param {number} stepCompleted - Номер завершённого шага
   */
  async function saveMiniTaskTasks(tasks, stepCompleted) {
    const formattedTasks = tasks.map((task, index) => ({
      task_id: task.task_id || null,
      text: task.text,
      category: task.category || null,
      order: index,
      is_selected_for_action: task.is_selected_for_action || false,
      is_completed: task.is_completed || false
    }))
    
    return saveMiniTaskToBackend({
      tasks: formattedTasks,
      step_completed: stepCompleted,
      is_complete: false
    })
  }

  /**
   * Завершить мини-задание
   */
  async function completeMiniTaskWithBackend(tasks) {
    const formattedTasks = tasks.map((task, index) => ({
      task_id: task.task_id || null,
      text: task.text,
      category: task.category,
      order: index,
      is_selected_for_action: task.is_selected_for_action || false,
      is_completed: task.is_completed || false
    }))
    
    return saveMiniTaskToBackend({
      tasks: formattedTasks,
      step_completed: 4,
      is_complete: true
    })
  }

  function completeMiniTask(data) {
    miniTask.value = {
      ...miniTask.value,
      completed: true,
      completedAt: new Date().toISOString()
    }
    user.value.finish_minitask = true
    saveToLocalStorage()
  }

  function resetMiniTask() {
    miniTask.value = {
      completed: false,
      loading: false,
      stepCompleted: 0,
      tasks: [],
      categories: [],
      selectedActions: [],
      completedActions: []
    }
    saveToLocalStorage()
  }

  function skipMiniTask() {
    miniTask.value = {
      completed: true,
      skipped: true,
      data: null,
      completedAt: new Date().toISOString()
    }
    saveToLocalStorage()
  }

  // ========================================
  // SSP BACKEND METHODS
  // ========================================

  /**
   * Маппинг ID категорий: frontend → backend
   */
  const CATEGORY_MAP_TO_BACKEND = {
    'wealth': 'welfare',
    'hobbies': 'hobby',
    'friendship': 'environment',
    'health': 'health_sport',
    'career': 'work',
    'love': 'family'
  }

  /**
   * Маппинг ID категорий: backend → frontend
   */
  const CATEGORY_MAP_TO_FRONTEND = {
    'welfare': 'wealth',
    'hobby': 'hobbies',
    'environment': 'friendship',
    'health_sport': 'health',
    'work': 'career',
    'family': 'love'
  }

  /**
   * SSP данные с бэкенда
   */
  const sspBackendData = ref({
    loading: false,
    loaded: false,
    maxRating: 10,
    baseCategoriesInfo: [],
    circleData: [],
    categoriesReflectionData: [],
    totalData: null
  })

  /**
   * Загрузить данные ССП с бэкенда
   */
  async function loadSSPFromBackend() {
    if (DEBUG_MODE) {
      console.log('[Store] Loading SSP data from backend...')
    }
    
    sspBackendData.value.loading = true
    
    try {
      const result = await getSSPData()
      
      if (result.status === 'ok' && result.data) {
        const data = result.data
        
        sspBackendData.value = {
          loading: false,
          loaded: true,
          maxRating: data.max_rating || 10,
          baseCategoriesInfo: data.base_categories_info || [],
          circleData: data.circle_data || [],
          categoriesReflectionData: data.categories_reflection_data || [],
          totalData: data.total_data || null
        }
        
        // Синхронизируем локальные lifeSpheres с данными бэкенда
        syncLifeSpheresFromBackend(data)
        
        if (DEBUG_MODE) {
          console.log('[Store] SSP data loaded:', {
            categoriesCount: sspBackendData.value.circleData.length,
            reflectionsCount: sspBackendData.value.categoriesReflectionData.length,
            totalData: sspBackendData.value.totalData
          })
        }
        
        return sspBackendData.value
      } else {
        if (DEBUG_MODE) {
          console.warn('[Store] Failed to load SSP data:', result)
        }
        sspBackendData.value.loading = false
        return null
      }
    } catch (error) {
      if (DEBUG_MODE) {
        console.error('[Store] Error loading SSP data:', error)
      }
      sspBackendData.value.loading = false
      return null
    }
  }

  /**
   * Синхронизировать локальные lifeSpheres с данными бэкенда
   */
  function syncLifeSpheresFromBackend(backendData) {
    // Обновляем оценки из circle_data
    if (backendData.circle_data && backendData.circle_data.length > 0) {
      backendData.circle_data.forEach(item => {
        const frontendId = CATEGORY_MAP_TO_FRONTEND[item.category]
        if (frontendId) {
          const sphere = lifeSpheres.value.find(s => s.id === frontendId)
          if (sphere && item.rating !== null && item.rating !== undefined) {
            sphere.score = item.rating
          }
        }
      })
    }
    
    // Обновляем рефлексии из categories_reflection_data
    if (backendData.categories_reflection_data && backendData.categories_reflection_data.length > 0) {
      backendData.categories_reflection_data.forEach(item => {
        const frontendId = CATEGORY_MAP_TO_FRONTEND[item.category]
        if (frontendId) {
          const sphere = lifeSpheres.value.find(s => s.id === frontendId)
          if (sphere) {
            // Обновляем оценку если есть
            if (item.rating !== null && item.rating !== undefined) {
              sphere.score = item.rating
            }
            // Обновляем рефлексию
            sphere.reflection = {
              why: item.rating_reason || '',
              ten: item.what_mean_max_rating || '',
              prevents: item.max_rating_difficulties || '',
              desired: item.what_want || ''
            }
          }
        }
      })
    }
    
    // Обновляем статус завершения модуля
    if (backendData.total_data) {
      const allRated = backendData.total_data.categories_with_rating >= 6
      const allReflected = backendData.total_data.reflection_questions_answers >= 24
      
      if (allRated && allReflected) {
        sspModuleCompleted.value = {
          completed: true,
          data: {
            completedAt: new Date().toISOString(),
            totalData: backendData.total_data
          }
        }
      }
    }
    
    saveToLocalStorage()
  }

  /**
   * Сохранить данные ССП на бэкенд
   * @param {Array} categoriesData - Массив данных категорий в формате бэкенда
   */
  async function saveSSPToBackend(categoriesData) {
    if (DEBUG_MODE) {
      console.log('[Store] Saving SSP data to backend:', categoriesData)
    }
    
    try {
      const result = await updateSSPData({
        categories_reflection_data: categoriesData
      })
      
      if (result.status === 'ok') {
        const data = result.data
        
        if (DEBUG_MODE) {
          console.log('[Store] SSP data saved successfully, response:', data)
        }
        
        // Обновляем sspBackendData из ответа (теперь update возвращает те же данные что и get)
        if (data) {
          sspBackendData.value = {
            loading: false,
            loaded: true,
            maxRating: data.max_rating || 10,
            circleData: data.circle_data || [],
            categoriesReflectionData: data.categories_reflection_data || [],
            totalData: data.total_data || {
              categories_with_rating: 0,
              user_rating: 0,
              reflection_questions_answers: 0,
              reflection_questions_total: 24
            }
          }
          
          if (DEBUG_MODE) {
            console.log('[Store] SSP backend data updated from save response:', {
              categoriesCount: sspBackendData.value.circleData.length,
              reflectionsCount: sspBackendData.value.categoriesReflectionData.length,
              totalData: sspBackendData.value.totalData
            })
          }
        }
        
        return { success: true, data: data }
      } else {
        if (DEBUG_MODE) {
          console.warn('[Store] Failed to save SSP data:', result)
        }
        return { success: false, error: result.error_data }
      }
    } catch (error) {
      if (DEBUG_MODE) {
        console.error('[Store] Error saving SSP data:', error)
      }
      return { success: false, error }
    }
  }

  /**
   * Сохранить оценки сфер на бэкенд (шаг 2 - ССП)
   */
  async function saveSSPRatingsToBackend() {
    const categoriesData = lifeSpheres.value.map(sphere => {
      const backendCategory = CATEGORY_MAP_TO_BACKEND[sphere.id]
      return {
        category: backendCategory,
        rating: sphere.score
      }
    })
    
    return saveSSPToBackend(categoriesData)
  }

  /**
   * Сохранить рефлексию сферы на бэкенд (шаг 3 - Рефлексия)
   * @param {string} sphereId - ID сферы (frontend)
   */
  async function saveSSPReflectionToBackend(sphereId) {
    const sphere = lifeSpheres.value.find(s => s.id === sphereId)
    if (!sphere) return { success: false, error: 'Sphere not found' }
    
    const backendCategory = CATEGORY_MAP_TO_BACKEND[sphereId]
    const categoryData = {
      category: backendCategory,
      rating: sphere.score,
      rating_reason: sphere.reflection?.why || '',
      what_mean_max_rating: sphere.reflection?.ten || '',
      max_rating_difficulties: sphere.reflection?.prevents || '',
      what_want: sphere.reflection?.desired || ''
    }
    
    return saveSSPToBackend([categoryData])
  }

  /**
   * Сохранить все рефлексии на бэкенд
   */
  async function saveAllSSPReflectionsToBackend() {
    const categoriesData = lifeSpheres.value.map(sphere => {
      const backendCategory = CATEGORY_MAP_TO_BACKEND[sphere.id]
      return {
        category: backendCategory,
        rating: sphere.score,
        rating_reason: sphere.reflection?.why || '',
        what_mean_max_rating: sphere.reflection?.ten || '',
        max_rating_difficulties: sphere.reflection?.prevents || '',
        what_want: sphere.reflection?.desired || ''
      }
    })
    
    return saveSSPToBackend(categoriesData)
  }

  /**
   * Геттер для маппинга категорий
   */
  function getCategoryBackendId(frontendId) {
    return CATEGORY_MAP_TO_BACKEND[frontendId] || frontendId
  }

  function getCategoryFrontendId(backendId) {
    return CATEGORY_MAP_TO_FRONTEND[backendId] || backendId
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
    
    // Триггер для первых шагов
    if (!firstSteps.value.ssp) {
      completeFirstStep('ssp')
    }
    
    saveToLocalStorage()
  }

  // Goals Bank methods
  function addRawIdea(idea, options = {}) {
    const newIdea = {
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      text: idea.text || '',
      whyImportant: idea.whyImportant || '',
      sphereId: idea.sphereId || '',
      mvp: idea.mvp || '',
      decomposition: idea.decomposition || '',
      status: idea.status || 'raw',
      validated: idea.status === 'validated',
      threeWhys: {
        why1: idea.whyImportant || idea.threeWhys?.why1 || '',
        why2: idea.threeWhys?.why2 || '',
        why3: idea.threeWhys?.why3 || ''
      }
    }
    
    if (options.insertAtTop) {
      goalsBank.value.rawIdeas.unshift(newIdea)
    } else {
      goalsBank.value.rawIdeas.push(newIdea)
    }
    
    // Триггер для первых шагов
    if (!firstSteps.value.add_idea) {
      completeFirstStep('add_idea')
    }
    
    // Если цель сразу валидирована
    if (newIdea.status === 'validated' && !firstSteps.value.validate_goal) {
      completeFirstStep('validate_goal')
    }
    
    saveToLocalStorage()
    
    return newIdea
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
      
      // Триггер для первых шагов
      if (!firstSteps.value.validate_goal) {
        completeFirstStep('validate_goal')
      }
      
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
    
    // Триггер для первых шагов
    if (!firstSteps.value.select_key_goal) {
      completeFirstStep('select_key_goal')
    }
    
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
        sourceId: selectedGoal.id || null,
        threeWhys: selectedGoal.threeWhys || null
      })
    })
    
    if (selectedGoals.length > 0 && !firstSteps.value.select_key_goal) {
      completeFirstStep('select_key_goal')
    }
    
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

  // Telegram Settings methods
  function connectTelegram(chatId, username) {
    telegramSettings.value.connected = true
    telegramSettings.value.chatId = chatId
    telegramSettings.value.username = username
    telegramSettings.value.connectedAt = new Date().toISOString()
    saveToLocalStorage()
  }

  function disconnectTelegram() {
    telegramSettings.value.connected = false
    telegramSettings.value.chatId = ''
    telegramSettings.value.username = ''
    telegramSettings.value.connectedAt = null
    saveToLocalStorage()
  }

  function updateTelegramNotifications(settings) {
    telegramSettings.value.notifications = {
      ...telegramSettings.value.notifications,
      ...settings
    }
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
      
      // Триггер для первых шагов
      if (!firstSteps.value.plan_task) {
        completeFirstStep('plan_task')
      }
      
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
    
    // User Stage (Adaptive Dashboard)
    userStage,
    isSSPCompleted,
    hasGoals,
    hasWeeklyTasks,
    
    // Journal
    journal,
    hasTodayEntry,
    todayJournalEntry,
    journalStreak,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    updateJournalAIResponse,
    setJournalAILoading,
    getRecentJournalEntries,
    
    // First Steps (новые мини-задания)
    firstSteps,
    completeFirstStep,
    firstStepsCompleted,
    firstStepsTotal,
    allFirstStepsCompleted,
    
    // Mentor (ИИ-наставник)
    mentor,
    mentorPanelCollapsed,
    toggleMentorPanel,
    openMentorChat,
    closeMentorChat,
    addMentorMessage,
    sendMentorMessage,
    clearMentorMessages,
    setMentorMode,
    
    // Actions
    updateSphere,
    updateSphereReflection,
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
    skipMiniTask,
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
    
    // Mini-task backend methods
    loadMiniTaskFromBackend,
    saveMiniTaskToBackend,
    saveMiniTaskTasks,
    updateMiniTaskStep,
    completeMiniTaskWithBackend,
    completeMiniTask,
    resetMiniTask,
    
    // SSP backend methods
    sspBackendData,
    loadSSPFromBackend,
    saveSSPToBackend,
    saveSSPRatingsToBackend,
    saveSSPReflectionToBackend,
    saveAllSSPReflectionsToBackend,
    syncLifeSpheresFromBackend,
    getCategoryBackendId,
    getCategoryFrontendId,
    
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
    toggleScheduledTaskComplete,
    
    // Telegram Settings
    telegramSettings,
    connectTelegram,
    disconnectTelegram,
    updateTelegramNotifications,
    
    // Global Data (справочники)
    globalData,
    loadGlobalData,
    categoryBackendToFrontend,
    categoryFrontendToBackend,
    
    // Goals API (загрузка и синхронизация целей)
    goalsApiData,
    loadGoalsFromBackend,
    syncGoalsFromBackend,
    createGoalOnBackend,
    updateGoalOnBackend,
    deleteGoalOnBackend,
    completeGoalOnBackend,
    takeGoalToWorkOnBackend,
    removeGoalFromWorkOnBackend,
    getCategoryTitle,
    getPriorityTitle,
    getTimeTitle
  }
})
