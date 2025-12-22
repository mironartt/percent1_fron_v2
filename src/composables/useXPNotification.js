import { ref, readonly } from 'vue'

const notifications = ref([])
let notificationId = 0

const XP_AMOUNTS = {
  goal_step_completed: 25,
  goal_completed: 150,
  journal_entry: 10
}

const XP_MESSAGES = {
  goal_step_completed: 'за выполнение шага',
  goal_completed: 'за завершение цели',
  journal_entry: 'за запись в дневник'
}

const XP_ICONS = {
  goal_step_completed: '✓',
  goal_completed: '🎯',
  journal_entry: '📝'
}

export function useXPNotification() {
  function showXPNotification(type, customAmount = null, customMessage = null) {
    const amount = customAmount || XP_AMOUNTS[type] || 0
    const message = customMessage || XP_MESSAGES[type] || ''
    const icon = XP_ICONS[type] || '✨'
    
    if (amount <= 0) return
    
    const id = ++notificationId
    const notification = {
      id,
      amount,
      message,
      icon,
      type,
      visible: true
    }
    
    notifications.value.push(notification)
    
    setTimeout(() => {
      const index = notifications.value.findIndex(n => n.id === id)
      if (index !== -1) {
        notifications.value[index].visible = false
      }
    }, 2000)
    
    setTimeout(() => {
      const index = notifications.value.findIndex(n => n.id === id)
      if (index !== -1) {
        notifications.value.splice(index, 1)
      }
    }, 2500)
    
    return id
  }
  
  function showStepCompletedXP() {
    return showXPNotification('goal_step_completed')
  }
  
  function showGoalCompletedXP() {
    return showXPNotification('goal_completed')
  }
  
  function showJournalEntryXP() {
    return showXPNotification('journal_entry')
  }
  
  function clearNotifications() {
    notifications.value = []
  }
  
  return {
    notifications: readonly(notifications),
    showXPNotification,
    showStepCompletedXP,
    showGoalCompletedXP,
    showJournalEntryXP,
    clearNotifications,
    XP_AMOUNTS,
    XP_MESSAGES
  }
}

export const xpNotificationState = {
  notifications
}
