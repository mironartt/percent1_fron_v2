import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { DEBUG_MODE } from '@/config/settings.js'
import * as api from '@/services/api.js'

export const XP_REWARDS = {
  HABIT_COMPLETED: 5,
  FOCUS_TASK_COMPLETED: 10,
  GOAL_STEP_COMPLETED: 25,
  GOAL_COMPLETED: 150,
  STREAK_BONUS_7_DAYS: 30,
  STREAK_BONUS_30_DAYS: 100,
  JOURNAL_ENTRY: 10
}

const GROUP_TYPE_DISPLAY = {
  'habits_completed': 'Награда за выполнение привычек',
  'habits_penalty': 'Штраф за невыполнение привычек',
  'habit_completed': 'Привычка выполнена',
  'habit_penalty': 'Штраф за привычку',
  'diary_completed': 'Награда за заполнение дневника',
  'diary_penalty': 'Штраф за незаполнение дневника',
  'journal_entry': 'Запись в дневнике',
  'journal_penalty': 'Штраф за дневник',
  'planning_penalty': 'Штраф за невыполнение планов',
  'goal_step_completed': 'Шаг цели выполнен',
  'goal_completed': 'Цель достигнута',
  'goals_completed': 'Награда за выполнение целей',
  'reward_redeemed': 'Награда получена',
  'achievement_bonus': 'Бонус за достижение'
}

function transformHistoryGroups(historyGroups) {
  return historyGroups.map(dayGroup => ({
    date: dayGroup.date,
    total_earned: dayGroup.total_earned || 0,
    total_spent: Math.abs(dayGroup.total_spent || 0),
    groups: (dayGroup.entries || []).map(entry => ({
      group_type: entry.type,
      group_type_display: entry.title || GROUP_TYPE_DISPLAY[entry.type] || entry.type,
      total_amount: entry.amount,
      items: entry.details || [{ 
        reward_name: entry.reward_name,
        amount: entry.amount,
        transaction_id: entry.reward_id || Math.random()
      }]
    }))
  }))
}

export const useXpStore = defineStore('xp', () => {
  const xpBalance = ref(0)
  const lifetimeEarned = ref(0)
  const todayXP = ref(0)
  const weekXP = ref(0)
  const rewards = ref([])
  const xpHistoryGroups = ref([])
  
  const loading = ref(false)
  const rewardsLoading = ref(false)
  const historyLoading = ref(false)
  const error = ref(null)
  
  const historyPage = ref(1)
  const historyTotalPages = ref(1)
  const historyTotalItems = ref(0)

  const availableRewards = computed(() => {
    return rewards.value
      .filter(r => r.status === 'available' && r.can_afford)
      .sort((a, b) => a.cost - b.cost)
  })

  const upcomingRewards = computed(() => {
    return rewards.value
      .filter(r => r.status === 'available' && !r.can_afford)
      .sort((a, b) => a.xp_remaining - b.xp_remaining)
  })

  const redeemedRewards = computed(() => {
    return rewards.value
      .filter(r => r.status === 'redeemed')
      .sort((a, b) => new Date(b.date_redeemed) - new Date(a.date_redeemed))
  })

  const nextReward = computed(() => {
    const upcoming = upcomingRewards.value
    return upcoming.length > 0 ? upcoming[0] : null
  })

  const xpToNextReward = computed(() => {
    if (!nextReward.value) return 0
    return nextReward.value.xp_remaining
  })

  async function fetchXPStats() {
    try {
      loading.value = true
      error.value = null
      
      const result = await api.getXPStats()
      
      if (result.status === 'ok' && result.data) {
        xpBalance.value = result.data.xp_balance ?? 0
        lifetimeEarned.value = result.data.lifetime_xp ?? 0
        todayXP.value = result.data.today_xp ?? 0
        weekXP.value = result.data.week_xp ?? 0
        
        if (DEBUG_MODE) {
          console.log('[XP] Stats loaded:', result.data)
        }
      } else {
        error.value = result.error_data?.message || 'Ошибка загрузки XP статистики'
      }
    } catch (e) {
      error.value = 'Ошибка сети при загрузке XP'
      console.error('[XP] fetchXPStats error:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchRewards(params = {}) {
    try {
      rewardsLoading.value = true
      error.value = null
      
      const defaultParams = {
        status_filter: params.status_filter || null,
        order_by: params.order_by || 'distance_to_afford',
        order_direction: params.order_direction || 'asc'
      }
      
      if (params.query_filter && params.query_filter.length >= 2) {
        defaultParams.query_filter = params.query_filter
      }
      
      const result = await api.getRewards(defaultParams)
      
      if (result.status === 'ok' && result.data) {
        rewards.value = result.data.rewards || []
        
        if (result.data.current_balance !== undefined) {
          xpBalance.value = result.data.current_balance
        }
        
        if (DEBUG_MODE) {
          console.log('[XP] Rewards loaded:', rewards.value.length)
        }
      } else {
        error.value = result.error_data?.message || 'Ошибка загрузки наград'
      }
    } catch (e) {
      error.value = 'Ошибка сети при загрузке наград'
      console.error('[XP] fetchRewards error:', e)
    } finally {
      rewardsLoading.value = false
    }
  }

  async function fetchXPHistory(params = {}) {
    try {
      historyLoading.value = true
      error.value = null
      
      const requestParams = {
        page: params.page || 1,
        page_size: params.page_size || 10
      }
      
      if (params.transaction_status_filter) {
        requestParams.transaction_status_filter = params.transaction_status_filter
      }
      if (params.transaction_category_filter) {
        requestParams.transaction_category_filter = params.transaction_category_filter
      }
      if (params.query_filter && params.query_filter.length >= 2) {
        requestParams.query_filter = params.query_filter
      }
      
      const result = await api.getXPHistoryGrouped(requestParams)
      
      if (result.status === 'ok' && result.data) {
        xpHistoryGroups.value = transformHistoryGroups(result.data.history_groups || [])
        historyPage.value = result.data.page || 1
        historyTotalPages.value = result.data.total_pages || 1
        historyTotalItems.value = result.data.total_items || 0
        
        if (DEBUG_MODE) {
          console.log('[XP] History loaded:', xpHistoryGroups.value.length, 'days')
        }
      } else {
        error.value = result.error_data?.message || 'Ошибка загрузки истории XP'
      }
    } catch (e) {
      error.value = 'Ошибка сети при загрузке истории'
      console.error('[XP] fetchXPHistory error:', e)
    } finally {
      historyLoading.value = false
    }
  }

  async function loadMoreHistory(params = {}) {
    if (historyPage.value >= historyTotalPages.value) return
    
    try {
      historyLoading.value = true
      
      const requestParams = {
        page: historyPage.value + 1,
        page_size: params.page_size || 10,
        ...params
      }
      
      const result = await api.getXPHistoryGrouped(requestParams)
      
      if (result.status === 'ok' && result.data) {
        const newGroups = transformHistoryGroups(result.data.history_groups || [])
        xpHistoryGroups.value = [...xpHistoryGroups.value, ...newGroups]
        historyPage.value = result.data.page || historyPage.value + 1
        historyTotalPages.value = result.data.total_pages || 1
      }
    } catch (e) {
      console.error('[XP] loadMoreHistory error:', e)
    } finally {
      historyLoading.value = false
    }
  }

  async function addReward(rewardData) {
    try {
      rewardsLoading.value = true
      error.value = null
      
      const result = await api.createReward({
        name: rewardData.name,
        cost: rewardData.cost,
        icon: rewardData.icon || '🎁',
        description: rewardData.description || ''
      })
      
      if (result.status === 'ok' && result.data) {
        if (DEBUG_MODE) {
          console.log('[XP] Reward created:', result.data.reward_id)
        }
        
        await fetchRewards()
        return { success: true, reward_id: result.data.reward_id }
      } else {
        error.value = result.error_data?.message || 'Ошибка создания награды'
        return { success: false, error: error.value }
      }
    } catch (e) {
      error.value = 'Ошибка сети при создании награды'
      console.error('[XP] addReward error:', e)
      return { success: false, error: error.value }
    } finally {
      rewardsLoading.value = false
    }
  }

  async function updateReward(rewardId, updates) {
    try {
      rewardsLoading.value = true
      error.value = null
      
      const result = await api.updateReward(rewardId, updates)
      
      if (result.status === 'ok') {
        if (DEBUG_MODE) {
          console.log('[XP] Reward updated:', rewardId)
        }
        
        await fetchRewards()
        return { success: true }
      } else {
        error.value = result.error_data?.message || 'Ошибка обновления награды'
        return { success: false, error: error.value }
      }
    } catch (e) {
      error.value = 'Ошибка сети при обновлении награды'
      console.error('[XP] updateReward error:', e)
      return { success: false, error: error.value }
    } finally {
      rewardsLoading.value = false
    }
  }

  async function removeReward(rewardId, permanent = false) {
    try {
      rewardsLoading.value = true
      error.value = null
      
      const result = await api.deleteReward(rewardId, permanent)
      
      if (result.status === 'ok') {
        if (DEBUG_MODE) {
          console.log('[XP] Reward deleted:', rewardId)
        }
        
        rewards.value = rewards.value.filter(r => r.reward_id !== rewardId)
        return { success: true }
      } else {
        error.value = result.error_data?.message || 'Ошибка удаления награды'
        return { success: false, error: error.value }
      }
    } catch (e) {
      error.value = 'Ошибка сети при удалении награды'
      console.error('[XP] removeReward error:', e)
      return { success: false, error: error.value }
    } finally {
      rewardsLoading.value = false
    }
  }

  async function redeemReward(rewardId) {
    try {
      rewardsLoading.value = true
      error.value = null
      
      const result = await api.redeemReward(rewardId)
      
      if (result.status === 'ok' && result.data) {
        if (result.data.success) {
          if (result.data.new_balance !== undefined) {
            xpBalance.value = result.data.new_balance
          }
          
          if (DEBUG_MODE) {
            console.log('[XP] Reward redeemed:', rewardId, 'New balance:', result.data.new_balance)
          }
          
          await fetchRewards()
          return { success: true, new_balance: result.data.new_balance }
        } else {
          const errorMessages = {
            'insufficient_xp': 'Недостаточно XP',
            'reward_not_found': 'Награда не найдена',
            'already_redeemed': 'Награда уже получена'
          }
          error.value = errorMessages[result.data.error] || result.data.error
          return { success: false, error: error.value }
        }
      } else {
        error.value = result.error_data?.message || 'Ошибка получения награды'
        return { success: false, error: error.value }
      }
    } catch (e) {
      error.value = 'Ошибка сети при получении награды'
      console.error('[XP] redeemReward error:', e)
      return { success: false, error: error.value }
    } finally {
      rewardsLoading.value = false
    }
  }

  async function init() {
    await Promise.all([
      fetchXPStats(),
      fetchRewards({ status_filter: 'available' })
    ])
  }

  function resetStore() {
    xpBalance.value = 0
    lifetimeEarned.value = 0
    todayXP.value = 0
    weekXP.value = 0
    rewards.value = []
    xpHistoryGroups.value = []
    historyPage.value = 1
    historyTotalPages.value = 1
    historyTotalItems.value = 0
    error.value = null
  }

  return {
    xpBalance,
    lifetimeEarned,
    todayXP,
    weekXP,
    rewards,
    xpHistoryGroups,
    
    loading,
    rewardsLoading,
    historyLoading,
    error,
    
    historyPage,
    historyTotalPages,
    historyTotalItems,
    
    availableRewards,
    upcomingRewards,
    redeemedRewards,
    nextReward,
    xpToNextReward,
    
    fetchXPStats,
    fetchRewards,
    fetchXPHistory,
    loadMoreHistory,
    addReward,
    updateReward,
    removeReward,
    redeemReward,
    init,
    resetStore,
    
    XP_REWARDS
  }
})
