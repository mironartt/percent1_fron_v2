import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { DEBUG_MODE } from '@/config/settings.js'

export const XP_REWARDS = {
  HABIT_COMPLETED: 5,
  FOCUS_TASK_COMPLETED: 10,
  GOAL_STEP_COMPLETED: 25,
  GOAL_COMPLETED: 150,
  STREAK_BONUS_7_DAYS: 30,
  STREAK_BONUS_30_DAYS: 100,
  JOURNAL_ENTRY: 10
}

const STORAGE_KEY = 'onepercent_xp_store'

export const useXpStore = defineStore('xp', () => {
  const xpBalance = ref(0)
  const lifetimeEarned = ref(0)
  const xpHistory = ref([])
  const wishlist = ref([])
  const redeemedRewards = ref([])

  const availableRewards = computed(() => {
    return wishlist.value
      .filter(r => !r.redeemed && r.cost <= xpBalance.value)
      .sort((a, b) => a.cost - b.cost)
  })

  const upcomingRewards = computed(() => {
    return wishlist.value
      .filter(r => !r.redeemed && r.cost > xpBalance.value)
      .sort((a, b) => a.cost - b.cost)
  })

  const nextReward = computed(() => {
    const upcoming = upcomingRewards.value
    return upcoming.length > 0 ? upcoming[0] : null
  })

  const xpToNextReward = computed(() => {
    if (!nextReward.value) return 0
    return nextReward.value.cost - xpBalance.value
  })

  const todayXP = computed(() => {
    const today = new Date().toDateString()
    return xpHistory.value
      .filter(entry => new Date(entry.timestamp).toDateString() === today)
      .reduce((sum, entry) => sum + entry.amount, 0)
  })

  const weekXP = computed(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return xpHistory.value
      .filter(entry => new Date(entry.timestamp) >= weekAgo)
      .reduce((sum, entry) => sum + entry.amount, 0)
  })

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  }

  function awardXP(amount, source, metadata = {}) {
    const eventId = generateId()
    const entry = {
      id: eventId,
      amount,
      source,
      metadata,
      timestamp: new Date().toISOString()
    }

    xpBalance.value += amount
    lifetimeEarned.value += amount
    xpHistory.value.unshift(entry)

    if (xpHistory.value.length > 500) {
      xpHistory.value = xpHistory.value.slice(0, 500)
    }

    if (DEBUG_MODE) {
      console.log(`[XP] +${amount} XP for ${source}`, metadata)
    }

    saveToStorage()
    return eventId
  }

  function revokeXP(eventId) {
    const index = xpHistory.value.findIndex(e => e.id === eventId)
    if (index === -1) return false

    const entry = xpHistory.value[index]
    xpBalance.value = Math.max(0, xpBalance.value - entry.amount)
    lifetimeEarned.value = Math.max(0, lifetimeEarned.value - entry.amount)
    xpHistory.value.splice(index, 1)

    if (DEBUG_MODE) {
      console.log(`[XP] Revoked ${entry.amount} XP (${entry.source}), lifetime: ${lifetimeEarned.value}`)
    }

    saveToStorage()
    return true
  }

  function spendXP(rewardId) {
    const reward = wishlist.value.find(r => r.id === rewardId)
    if (!reward) return { success: false, error: 'Награда не найдена' }
    if (reward.redeemed) return { success: false, error: 'Награда уже получена' }
    if (xpBalance.value < reward.cost) return { success: false, error: 'Недостаточно XP' }

    xpBalance.value -= reward.cost
    reward.redeemed = true
    reward.redeemedAt = new Date().toISOString()

    redeemedRewards.value.unshift({
      ...reward,
      redeemedAt: reward.redeemedAt
    })

    if (DEBUG_MODE) {
      console.log(`[XP] Redeemed reward: ${reward.name} for ${reward.cost} XP`)
    }

    saveToStorage()
    return { success: true, reward }
  }

  function addReward(reward) {
    const newReward = {
      id: generateId(),
      name: reward.name,
      cost: reward.cost,
      description: reward.description || '',
      icon: reward.icon || '🎁',
      redeemed: false,
      createdAt: new Date().toISOString()
    }

    wishlist.value.push(newReward)

    if (DEBUG_MODE) {
      console.log(`[XP] Added reward: ${newReward.name} (${newReward.cost} XP)`)
    }

    saveToStorage()
    return newReward
  }

  function updateReward(rewardId, updates) {
    const reward = wishlist.value.find(r => r.id === rewardId)
    if (!reward) return false

    Object.assign(reward, {
      name: updates.name ?? reward.name,
      cost: updates.cost ?? reward.cost,
      description: updates.description ?? reward.description,
      icon: updates.icon ?? reward.icon
    })

    if (DEBUG_MODE) {
      console.log(`[XP] Updated reward: ${reward.name}`)
    }

    saveToStorage()
    return true
  }

  function removeReward(rewardId) {
    const index = wishlist.value.findIndex(r => r.id === rewardId)
    if (index === -1) return false

    const removed = wishlist.value.splice(index, 1)[0]

    if (DEBUG_MODE) {
      console.log(`[XP] Removed reward: ${removed.name}`)
    }

    saveToStorage()
    return true
  }

  function saveToStorage() {
    try {
      const data = {
        xpBalance: xpBalance.value,
        lifetimeEarned: lifetimeEarned.value,
        xpHistory: xpHistory.value,
        wishlist: wishlist.value,
        redeemedRewards: redeemedRewards.value,
        version: 1
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('[XP] Failed to save to storage:', e)
    }
  }

  function loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return

      const data = JSON.parse(stored)
      
      xpBalance.value = data.xpBalance ?? 0
      lifetimeEarned.value = data.lifetimeEarned ?? 0
      xpHistory.value = data.xpHistory ?? []
      wishlist.value = data.wishlist ?? []
      redeemedRewards.value = data.redeemedRewards ?? []

      if (DEBUG_MODE) {
        console.log(`[XP] Loaded from storage: ${xpBalance.value} XP, ${wishlist.value.length} rewards`)
      }
    } catch (e) {
      console.error('[XP] Failed to load from storage:', e)
    }
  }

  function resetStore() {
    xpBalance.value = 0
    lifetimeEarned.value = 0
    xpHistory.value = []
    wishlist.value = []
    redeemedRewards.value = []
    saveToStorage()
  }

  function addDemoRewards() {
    if (wishlist.value.length > 0) return

    const demoRewards = [
      { name: 'Кофе в любимой кофейне', cost: 50, icon: '☕', description: 'Побалуй себя вкусным напитком' },
      { name: 'Вечер кино', cost: 100, icon: '🎬', description: 'Посмотреть фильм без угрызений совести' },
      { name: 'Новая книга', cost: 150, icon: '📚', description: 'Купить книгу из списка желаемого' },
      { name: 'Поход в ресторан', cost: 300, icon: '🍽️', description: 'Ужин в любимом месте' },
      { name: 'День без работы', cost: 500, icon: '🏖️', description: 'Полноценный выходной' }
    ]

    demoRewards.forEach(r => addReward(r))

    if (DEBUG_MODE) {
      console.log('[XP] Added demo rewards')
    }
  }

  loadFromStorage()

  return {
    xpBalance,
    lifetimeEarned,
    xpHistory,
    wishlist,
    redeemedRewards,
    
    availableRewards,
    upcomingRewards,
    nextReward,
    xpToNextReward,
    todayXP,
    weekXP,
    
    awardXP,
    revokeXP,
    spendXP,
    addReward,
    updateReward,
    removeReward,
    addDemoRewards,
    resetStore,
    loadFromStorage,
    saveToStorage,
    
    XP_REWARDS
  }
})
