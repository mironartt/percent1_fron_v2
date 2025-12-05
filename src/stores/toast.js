import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

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

    toasts.value.unshift(toast)

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

  function success(message, options = {}) {
    return showToast({
      type: 'success',
      title: message,
      ...options
    })
  }

  function error(message, options = {}) {
    return showToast({
      type: 'error',
      title: message,
      ...options
    })
  }

  function warning(message, options = {}) {
    return showToast({
      type: 'warning',
      title: message,
      ...options
    })
  }

  function info(message, options = {}) {
    return showToast({
      type: 'info',
      title: message,
      ...options
    })
  }

  return {
    toasts,
    showToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info
  }
})
