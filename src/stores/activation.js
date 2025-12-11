import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { DEBUG_MODE } from '@/config/settings.js'

const STORAGE_KEY = 'onepercent_activation'

const MISSION_TASKS = [
  {
    id: 'select_focus',
    title: 'Выбери фокус на сегодня',
    description: 'Выбери 1-3 важных шага из своих целей',
    icon: 'Crosshair',
    xpReward: 15,
    route: '/app/planning'
  },
  {
    id: 'create_habit',
    title: 'Создай первую привычку',
    description: 'Добавь полезную привычку для ежедневного выполнения',
    icon: 'Flame',
    xpReward: 15,
    route: '/app/habits'
  },
  {
    id: 'view_goals',
    title: 'Изучи свои цели',
    description: 'Посмотри цели, которые AI создал для тебя',
    icon: 'Target',
    xpReward: 10,
    route: '/app/goals'
  },
  {
    id: 'write_reflection',
    title: 'Заполни вечернюю рефлексию',
    description: 'Запиши свои мысли в дневник',
    icon: 'BookOpen',
    xpReward: 15,
    route: '/app/journal'
  }
]

export const useActivationStore = defineStore('activation', () => {
  const completedTasks = ref({})
  const modalDismissed = ref(false)
  const missionStarted = ref(false)
  
  const tasks = computed(() => {
    return MISSION_TASKS.map(task => ({
      ...task,
      completed: !!completedTasks.value[task.id]
    }))
  })
  
  const completedCount = computed(() => {
    return Object.values(completedTasks.value).filter(Boolean).length
  })
  
  const totalCount = computed(() => MISSION_TASKS.length)
  
  const progress = computed(() => {
    return Math.round((completedCount.value / totalCount.value) * 100)
  })
  
  const isAllCompleted = computed(() => {
    return completedCount.value >= totalCount.value
  })
  
  const shouldShowMission = computed(() => {
    if (isAllCompleted.value) return false
    if (modalDismissed.value && missionStarted.value) return false
    return true
  })
  
  const nextTask = computed(() => {
    return tasks.value.find(t => !t.completed)
  })
  
  function completeTask(taskId) {
    if (!completedTasks.value[taskId]) {
      completedTasks.value[taskId] = true
      saveToStorage()
      
      if (DEBUG_MODE) {
        console.log('[Activation] Task completed:', taskId, 'Progress:', progress.value + '%')
      }
      
      return true
    }
    return false
  }
  
  function dismissModal() {
    modalDismissed.value = true
    missionStarted.value = true
    saveToStorage()
    
    if (DEBUG_MODE) {
      console.log('[Activation] Modal dismissed')
    }
  }
  
  function showModal() {
    modalDismissed.value = false
    
    if (DEBUG_MODE) {
      console.log('[Activation] Modal shown')
    }
  }
  
  function resetMission() {
    completedTasks.value = {}
    modalDismissed.value = false
    missionStarted.value = false
    saveToStorage()
    
    if (DEBUG_MODE) {
      console.log('[Activation] Mission reset')
    }
  }
  
  function saveToStorage() {
    try {
      const data = {
        completedTasks: completedTasks.value,
        modalDismissed: modalDismissed.value,
        missionStarted: missionStarted.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      if (DEBUG_MODE) {
        console.error('[Activation] Error saving to storage:', e)
      }
    }
  }
  
  function loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        completedTasks.value = data.completedTasks || {}
        modalDismissed.value = data.modalDismissed || false
        missionStarted.value = data.missionStarted || false
        
        if (DEBUG_MODE) {
          console.log('[Activation] Loaded from storage:', data)
        }
      }
    } catch (e) {
      if (DEBUG_MODE) {
        console.error('[Activation] Error loading from storage:', e)
      }
    }
  }
  
  function init() {
    loadFromStorage()
  }
  
  return {
    tasks,
    completedTasks,
    completedCount,
    totalCount,
    progress,
    isAllCompleted,
    shouldShowMission,
    nextTask,
    modalDismissed,
    missionStarted,
    
    completeTask,
    dismissModal,
    showModal,
    resetMission,
    init
  }
})
