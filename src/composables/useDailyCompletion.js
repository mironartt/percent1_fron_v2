/**
 * Composable for tracking daily task/habit completion
 * and firing celebration effects (confetti, toast) once per transition.
 *
 * Uses sessionStorage to avoid re-firing on page reload.
 */
import { watch, ref } from 'vue'
import { useConfetti } from './useConfetti'
import { useToastStore } from '@/stores/toast'

const STORAGE_KEY = 'onepercent-daily-celebration'

function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

function getCelebratedState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const state = JSON.parse(raw)
    if (state.date !== getTodayKey()) return null
    return state
  } catch {
    return null
  }
}

function saveCelebratedState(state) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      date: getTodayKey(),
      ...state
    }))
  } catch { /* ignore */ }
}

// Module-level state shared across components
const celebrated = ref(getCelebratedState() || {
  tasks: false,
  habits: false,
  all: false
})

export function useDailyCompletion() {
  const { celebrate, sparkle, celebrateFrom } = useConfetti()

  function onTasksComplete(element) {
    if (celebrated.value.tasks) return
    celebrated.value.tasks = true
    saveCelebratedState(celebrated.value)

    const toastStore = useToastStore()
    toastStore.success('Все задачи выполнены!', {
      message: 'Отличная работа! Так держать!',
      duration: 4000
    })

    if (element) {
      celebrateFrom(element)
    } else {
      sparkle()
    }
  }

  function onHabitsComplete(element) {
    if (celebrated.value.habits) return
    celebrated.value.habits = true
    saveCelebratedState(celebrated.value)

    const toastStore = useToastStore()
    toastStore.success('Все привычки на сегодня выполнены!', {
      message: 'Ты молодец! Стабильность — ключ к успеху.',
      duration: 4000
    })

    if (element) {
      celebrateFrom(element)
    } else {
      sparkle()
    }
  }

  function onAllComplete() {
    if (celebrated.value.all) return
    celebrated.value.all = true
    saveCelebratedState(celebrated.value)

    const toastStore = useToastStore()
    toastStore.success('День выполнен на 100%!', {
      message: 'Все задачи и привычки сделаны. Невероятный результат!',
      duration: 5000
    })

    celebrate()
  }

  /**
   * Setup watchers for automatic celebration triggers.
   * @param {Object} opts
   * @param {import('vue').Ref|import('vue').ComputedRef} opts.tasksCompleted
   * @param {import('vue').Ref|import('vue').ComputedRef} opts.tasksTotal
   * @param {import('vue').Ref|import('vue').ComputedRef} opts.habitsCompleted
   * @param {import('vue').Ref|import('vue').ComputedRef} opts.habitsTotal
   * @param {import('vue').Ref} [opts.progressBarRef] - DOM ref for confetti origin
   */
  function setupWatchers({ tasksCompleted, tasksTotal, habitsCompleted, habitsTotal, progressBarRef }) {
    // Watch tasks completion
    watch([tasksCompleted, tasksTotal], ([completed, total], [oldCompleted]) => {
      if (total > 0 && completed === total && oldCompleted !== total) {
        setTimeout(() => onTasksComplete(progressBarRef?.value), 300)
      }
    })

    // Watch habits completion
    watch([habitsCompleted, habitsTotal], ([completed, total], [oldCompleted]) => {
      if (total > 0 && completed === total && oldCompleted !== total) {
        setTimeout(() => onHabitsComplete(progressBarRef?.value), 300)
      }
    })

    // Watch all complete (tasks + habits both done)
    watch([tasksCompleted, tasksTotal, habitsCompleted, habitsTotal], ([tc, tt, hc, ht]) => {
      if (tt > 0 && ht > 0 && tc === tt && hc === ht && !celebrated.value.all) {
        setTimeout(() => onAllComplete(), 600)
      }
    })
  }

  return {
    celebrated,
    setupWatchers,
    onTasksComplete,
    onHabitsComplete,
    onAllComplete
  }
}
