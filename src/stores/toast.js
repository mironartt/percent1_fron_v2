import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])
  
  const firstStepsConfig = {
    ssp: {
      title: 'Баланс жизни оценён!',
      nextStep: 'add_idea',
      nextStepText: 'Добавить первую идею',
      nextStepRoute: '/app/goals-bank',
      icon: 'check-circle'
    },
    add_idea: {
      title: 'Идея добавлена!',
      nextStep: 'validate_goal',
      nextStepText: 'Проверить цель',
      nextStepRoute: '/app/goals-bank',
      icon: 'lightbulb'
    },
    validate_goal: {
      title: 'Цель проверена!',
      nextStep: 'select_key_goal',
      nextStepText: 'Выбрать ключевую цель',
      nextStepRoute: '/app/goals-bank',
      icon: 'target'
    },
    select_key_goal: {
      title: 'Ключевая цель выбрана!',
      nextStep: 'plan_task',
      nextStepText: 'Запланировать задачу',
      nextStepRoute: '/app/planning',
      icon: 'star'
    },
    plan_task: {
      title: 'Задача запланирована!',
      nextStep: 'write_journal',
      nextStepText: 'Написать в дневник',
      nextStepRoute: '/app/journal',
      icon: 'calendar'
    },
    write_journal: {
      title: 'Запись в дневнике!',
      nextStep: 'chat_mentor',
      nextStepText: 'Пообщаться с ментором',
      nextStepRoute: '/app',
      icon: 'book-open'
    },
    chat_mentor: {
      title: 'Общение с ментором!',
      nextStep: null,
      nextStepText: null,
      nextStepRoute: null,
      icon: 'message-circle'
    }
  }

  function showFirstStepToast(stepId, firstSteps) {
    const config = firstStepsConfig[stepId]
    if (!config) return

    const hasNextStep = config.nextStep && !firstSteps[config.nextStep]
    
    const toast = {
      id: Date.now().toString(),
      type: 'first-step',
      title: config.title,
      icon: config.icon,
      nextStepText: hasNextStep ? config.nextStepText : null,
      nextStepRoute: hasNextStep ? config.nextStepRoute : null,
      duration: 5000,
      createdAt: Date.now()
    }

    toasts.value.push(toast)

    setTimeout(() => {
      removeToast(toast.id)
    }, toast.duration)

    return toast
  }

  function showToast(options) {
    const toast = {
      id: Date.now().toString(),
      type: options.type || 'info',
      title: options.title,
      message: options.message || null,
      icon: options.icon || null,
      action: options.action || null,
      actionText: options.actionText || null,
      actionRoute: options.actionRoute || null,
      duration: options.duration || 4000,
      createdAt: Date.now()
    }

    toasts.value.push(toast)

    if (toast.duration > 0) {
      setTimeout(() => {
        removeToast(toast.id)
      }, toast.duration)
    }

    return toast
  }

  function removeToast(id) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  function clearAllToasts() {
    toasts.value = []
  }

  return {
    toasts,
    firstStepsConfig,
    showFirstStepToast,
    showToast,
    removeToast,
    clearAllToasts
  }
})
