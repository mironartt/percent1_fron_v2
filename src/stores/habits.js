/**
 * Pinia Store для раздела "Привычки"
 * 
 * Управляет данными привычек с бэкенда:
 * - Список привычек с completions
 * - Настройки геймификации
 * - Статистика панели (streak, today progress, week XP)
 * - Аналитика и достижения
 * - XP и награды
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { DEBUG_MODE } from '@/config/settings.js'
import * as habitsApi from '@/services/habitsApi.js'

const CACHE_DURATION = 5 * 60 * 1000

export const useHabitsStore = defineStore('habits', () => {
  const loading = ref(false)
  const initialized = ref(false)
  const error = ref(null)

  const habits = ref([])
  const weekDates = ref([])
  const lastFetchParams = ref(null)

  const settings = ref({
    difficulty_mode: 'balanced',
    xp_penalty_planning: 50,
    xp_penalty_journal: 50,
    amnesty_per_week: 1,
    amnesty_remaining: 1,
    amnestied_dates: []
  })

  const statsPanel = ref({
    streak: 0,
    today_completed: 0,
    today_total: 0,
    week_xp: 0,
    amnesty_remaining: 1,
    difficulty_mode: 'balanced'
  })

  const analytics = ref(null)
  const analyticsLastFetch = ref(null)

  const achievements = ref(null)
  const achievementsLastFetch = ref(null)

  const recommendedHabits = ref(null)

  const xpStats = ref({
    xp_balance: 0,
    lifetime_xp: 0,
    today_xp: 0,
    week_xp: 0
  })
  const xpHistory = ref([])

  const rewards = ref([])
  const rewardsLoaded = ref(false)

  const pendingAchievements = ref([])

  const activeHabits = computed(() => habits.value.filter(h => !h.date_deleted))
  const deletedHabits = computed(() => habits.value.filter(h => h.date_deleted))

  const streak = computed(() => statsPanel.value.streak)
  const todayCompleted = computed(() => statsPanel.value.today_completed)
  const todayTotal = computed(() => statsPanel.value.today_total)
  const weekXp = computed(() => statsPanel.value.week_xp)
  const amnestyRemaining = computed(() => settings.value.amnesty_remaining)
  const amnestiedDates = computed(() => settings.value.amnestied_dates || [])
  const difficultyMode = computed(() => settings.value.difficulty_mode)

  const isSoftMode = computed(() => difficultyMode.value === 'soft')
  const isBalancedMode = computed(() => difficultyMode.value === 'balanced')
  const isHardcoreMode = computed(() => difficultyMode.value === 'hardcore')
  const isCustomMode = computed(() => difficultyMode.value === 'custom')

  const xpBalance = computed(() => xpStats.value.xp_balance)
  const lifetimeXp = computed(() => xpStats.value.lifetime_xp)
  const todayXp = computed(() => xpStats.value.today_xp)

  const availableRewards = computed(() => 
    rewards.value.filter(r => r.status === 'available')
  )
  const redeemedRewards = computed(() => 
    rewards.value.filter(r => r.status === 'redeemed')
  )

  const unlockedAchievementsCount = computed(() => achievements.value?.unlocked_count || 0)
  const totalAchievementsCount = computed(() => achievements.value?.total_count || 0)

  async function loadHabits(params = {}) {
    if (loading.value) return { success: false, reason: 'loading' }
    
    loading.value = true
    error.value = null
    
    try {
      const result = await habitsApi.getHabits(params)
      
      if (result.success) {
        habits.value = result.data.habits || []
        weekDates.value = result.data.week_dates || []
        
        if (result.data.settings) {
          Object.assign(settings.value, result.data.settings)
        }
        
        lastFetchParams.value = params
        initialized.value = true
        
        if (DEBUG_MODE) {
          console.log('[HabitsStore] Loaded habits:', habits.value.length)
        }
        
        return { success: true, data: result.data }
      } else {
        error.value = result.error
        return { success: false, error: result.error }
      }
    } catch (e) {
      error.value = { message: e.message }
      if (DEBUG_MODE) console.error('[HabitsStore] Load error:', e)
      return { success: false, error: { message: e.message } }
    } finally {
      loading.value = false
    }
  }

  async function loadStatsPanel() {
    try {
      const result = await habitsApi.getStatsPanel()
      
      if (result.success) {
        Object.assign(statsPanel.value, result.data)
        
        if (result.data.amnesty_remaining !== undefined) {
          settings.value.amnesty_remaining = result.data.amnesty_remaining
        }
        
        if (DEBUG_MODE) {
          console.log('[HabitsStore] Stats panel loaded:', statsPanel.value)
        }
        
        return { success: true, data: result.data }
      }
      return { success: false, error: result.error }
    } catch (e) {
      if (DEBUG_MODE) console.error('[HabitsStore] Stats panel error:', e)
      return { success: false, error: { message: e.message } }
    }
  }

  async function loadSettings() {
    try {
      const result = await habitsApi.getSettings()
      
      if (result.success) {
        Object.assign(settings.value, result.data)
        
        if (DEBUG_MODE) {
          console.log('[HabitsStore] Settings loaded:', settings.value)
        }
        
        return { success: true, data: result.data }
      }
      return { success: false, error: result.error }
    } catch (e) {
      if (DEBUG_MODE) console.error('[HabitsStore] Settings error:', e)
      return { success: false, error: { message: e.message } }
    }
  }

  async function saveSettings(newSettings) {
    const previousSettings = { ...settings.value }
    Object.assign(settings.value, newSettings)
    
    try {
      const result = await habitsApi.updateSettings(newSettings)
      
      if (result.success) {
        if (result.data) {
          Object.assign(settings.value, result.data)
        }
        
        if (DEBUG_MODE) {
          console.log('[HabitsStore] Settings saved:', newSettings)
        }
        
        return { success: true }
      } else {
        Object.assign(settings.value, previousSettings)
        return { success: false, error: result.error }
      }
    } catch (e) {
      Object.assign(settings.value, previousSettings)
      if (DEBUG_MODE) console.error('[HabitsStore] Save settings error:', e)
      return { success: false, error: { message: e.message } }
    }
  }

  async function createHabit(habitData) {
    try {
      const result = await habitsApi.createHabit(habitData)
      
      if (result.success) {
        const newId = result.data?.created_ids?.[0]
        
        if (newId) {
          const newHabit = {
            habit_id: newId,
            ...habitData,
            completions: [],
            date_created: new Date().toISOString()
          }
          habits.value.push(newHabit)
        }
        
        await loadStatsPanel()
        
        if (DEBUG_MODE) {
          console.log('[HabitsStore] Habit created:', newId)
        }
        
        return { success: true, habitId: newId }
      }
      return { success: false, error: result.error }
    } catch (e) {
      if (DEBUG_MODE) console.error('[HabitsStore] Create habit error:', e)
      return { success: false, error: { message: e.message } }
    }
  }

  async function updateHabit(habitId, habitData) {
    const habitIndex = habits.value.findIndex(h => h.habit_id === habitId)
    const previousHabit = habitIndex >= 0 ? { ...habits.value[habitIndex] } : null
    
    if (habitIndex >= 0) {
      Object.assign(habits.value[habitIndex], habitData)
    }
    
    try {
      const result = await habitsApi.updateHabit(habitId, habitData)
      
      if (result.success) {
        if (DEBUG_MODE) {
          console.log('[HabitsStore] Habit updated:', habitId)
        }
        return { success: true }
      } else {
        if (previousHabit && habitIndex >= 0) {
          habits.value[habitIndex] = previousHabit
        }
        return { success: false, error: result.error }
      }
    } catch (e) {
      if (previousHabit && habitIndex >= 0) {
        habits.value[habitIndex] = previousHabit
      }
      if (DEBUG_MODE) console.error('[HabitsStore] Update habit error:', e)
      return { success: false, error: { message: e.message } }
    }
  }

  async function deleteHabit(habitId) {
    const habitIndex = habits.value.findIndex(h => h.habit_id === habitId)
    const previousHabit = habitIndex >= 0 ? { ...habits.value[habitIndex] } : null
    
    if (habitIndex >= 0) {
      habits.value[habitIndex].date_deleted = new Date().toISOString()
    }
    
    try {
      const result = await habitsApi.deleteHabit(habitId)
      
      if (result.success) {
        if (DEBUG_MODE) {
          console.log('[HabitsStore] Habit deleted:', habitId)
        }
        return { success: true }
      } else {
        if (previousHabit && habitIndex >= 0) {
          habits.value[habitIndex] = previousHabit
        }
        return { success: false, error: result.error }
      }
    } catch (e) {
      if (previousHabit && habitIndex >= 0) {
        habits.value[habitIndex] = previousHabit
      }
      if (DEBUG_MODE) console.error('[HabitsStore] Delete habit error:', e)
      return { success: false, error: { message: e.message } }
    }
  }

  async function restoreHabit(habitId) {
    const habitIndex = habits.value.findIndex(h => h.habit_id === habitId)
    const previousHabit = habitIndex >= 0 ? { ...habits.value[habitIndex] } : null
    
    if (habitIndex >= 0) {
      habits.value[habitIndex].date_deleted = null
    }
    
    try {
      const result = await habitsApi.restoreHabit(habitId)
      
      if (result.success) {
        if (DEBUG_MODE) {
          console.log('[HabitsStore] Habit restored:', habitId)
        }
        return { success: true }
      } else {
        if (previousHabit && habitIndex >= 0) {
          habits.value[habitIndex] = previousHabit
        }
        return { success: false, error: result.error }
      }
    } catch (e) {
      if (previousHabit && habitIndex >= 0) {
        habits.value[habitIndex] = previousHabit
      }
      if (DEBUG_MODE) console.error('[HabitsStore] Restore habit error:', e)
      return { success: false, error: { message: e.message } }
    }
  }

  async function archiveHabit(habitId) {
    const habitIndex = habits.value.findIndex(h => h.habit_id === habitId)
    const previousHabit = habitIndex >= 0 ? { ...habits.value[habitIndex] } : null
    
    if (habitIndex >= 0) {
      habits.value[habitIndex].is_archived = true
    }
    
    try {
      const result = await habitsApi.archiveHabit(habitId)
      
      if (result.success) {
        if (DEBUG_MODE) {
          console.log('[HabitsStore] Habit archived:', habitId)
        }
        return { success: true }
      } else {
        if (previousHabit && habitIndex >= 0) {
          habits.value[habitIndex] = previousHabit
        }
        return { success: false, error: result.error }
      }
    } catch (e) {
      if (previousHabit && habitIndex >= 0) {
        habits.value[habitIndex] = previousHabit
      }
      if (DEBUG_MODE) console.error('[HabitsStore] Archive habit error:', e)
      return { success: false, error: { message: e.message } }
    }
  }

  async function permanentlyDeleteHabit(habitId) {
    const habitIndex = habits.value.findIndex(h => h.habit_id === habitId)
    const previousHabit = habitIndex >= 0 ? { ...habits.value[habitIndex] } : null
    
    if (habitIndex >= 0) {
      habits.value.splice(habitIndex, 1)
    }
    
    try {
      const result = await habitsApi.permanentlyDeleteHabit(habitId)
      
      if (result.success) {
        if (DEBUG_MODE) {
          console.log('[HabitsStore] Habit permanently deleted:', habitId)
        }
        return { success: true }
      } else {
        if (previousHabit) {
          habits.value.push(previousHabit)
        }
        return { success: false, error: result.error }
      }
    } catch (e) {
      if (previousHabit) {
        habits.value.push(previousHabit)
      }
      if (DEBUG_MODE) console.error('[HabitsStore] Permanent delete habit error:', e)
      return { success: false, error: { message: e.message } }
    }
  }

  async function markCompleted(habitId, date, note = '') {
    const habit = habits.value.find(h => h.habit_id === habitId)
    if (!habit) return { success: false, error: { message: 'Привычка не найдена' } }
    
    const previousCompletions = [...(habit.completions || [])]
    
    const existingIndex = habit.completions?.findIndex(c => c.date === date)
    if (existingIndex >= 0) {
      habit.completions[existingIndex] = { ...habit.completions[existingIndex], status: 'completed', note }
    } else {
      habit.completions = [...(habit.completions || []), { date, status: 'completed', note }]
    }
    
    statsPanel.value.today_completed++
    
    try {
      const result = await habitsApi.markHabitCompleted(habitId, date, note)
      
      if (result.success) {
        if (result.data.xp_changes) {
          const xpGain = result.data.xp_changes.reduce((sum, c) => sum + (c.amount || 0), 0)
          if (xpGain > 0) {
            xpStats.value.xp_balance += xpGain
            xpStats.value.today_xp += xpGain
            xpStats.value.week_xp += xpGain
          }
        }
        
        if (result.data.new_achievements?.length > 0) {
          pendingAchievements.value.push(...result.data.new_achievements)
        }
        
        if (DEBUG_MODE) {
          console.log('[HabitsStore] Habit completed:', habitId, date)
        }
        
        return { 
          success: true, 
          xpChanges: result.data.xp_changes,
          newAchievements: result.data.new_achievements
        }
      } else {
        habit.completions = previousCompletions
        statsPanel.value.today_completed--
        return { success: false, error: result.error }
      }
    } catch (e) {
      habit.completions = previousCompletions
      statsPanel.value.today_completed--
      if (DEBUG_MODE) console.error('[HabitsStore] Mark completed error:', e)
      return { success: false, error: { message: e.message } }
    }
  }

  async function unmarkCompleted(habitId, date) {
    const habit = habits.value.find(h => h.habit_id === habitId)
    if (!habit) return { success: false, error: { message: 'Привычка не найдена' } }
    
    const previousCompletions = [...(habit.completions || [])]
    
    const existingIndex = habit.completions?.findIndex(c => c.date === date)
    if (existingIndex >= 0) {
      habit.completions[existingIndex] = { ...habit.completions[existingIndex], status: null }
    }
    
    statsPanel.value.today_completed = Math.max(0, statsPanel.value.today_completed - 1)
    
    try {
      const result = await habitsApi.unmarkHabitCompleted(habitId, date)
      
      if (result.success) {
        if (result.data.xp_changes) {
          const xpLoss = result.data.xp_changes.reduce((sum, c) => sum + Math.abs(c.amount || 0), 0)
          if (xpLoss > 0) {
            xpStats.value.xp_balance = Math.max(0, xpStats.value.xp_balance - xpLoss)
            xpStats.value.today_xp = Math.max(0, xpStats.value.today_xp - xpLoss)
            xpStats.value.week_xp = Math.max(0, xpStats.value.week_xp - xpLoss)
          }
        }
        
        if (DEBUG_MODE) {
          console.log('[HabitsStore] Habit unmarked:', habitId, date)
        }
        
        return { success: true, xpChanges: result.data.xp_changes }
      } else {
        habit.completions = previousCompletions
        statsPanel.value.today_completed++
        return { success: false, error: result.error }
      }
    } catch (e) {
      habit.completions = previousCompletions
      statsPanel.value.today_completed++
      if (DEBUG_MODE) console.error('[HabitsStore] Unmark completed error:', e)
      return { success: false, error: { message: e.message } }
    }
  }

  async function markExcused(habitId, date, excuseReason) {
    const habit = habits.value.find(h => h.habit_id === habitId)
    if (!habit) return { success: false, error: { message: 'Привычка не найдена' } }
    
    const previousCompletions = [...(habit.completions || [])]
    
    const existingIndex = habit.completions?.findIndex(c => c.date === date)
    if (existingIndex >= 0) {
      habit.completions[existingIndex] = { 
        ...habit.completions[existingIndex], 
        status: 'excused', 
        excuse_reason: excuseReason 
      }
    } else {
      habit.completions = [...(habit.completions || []), { 
        date, 
        status: 'excused', 
        excuse_reason: excuseReason 
      }]
    }
    
    try {
      const result = await habitsApi.markHabitExcused(habitId, date, excuseReason)
      
      if (result.success) {
        if (DEBUG_MODE) {
          console.log('[HabitsStore] Habit excused:', habitId, date)
        }
        return { success: true }
      } else {
        habit.completions = previousCompletions
        return { success: false, error: result.error }
      }
    } catch (e) {
      habit.completions = previousCompletions
      if (DEBUG_MODE) console.error('[HabitsStore] Mark excused error:', e)
      return { success: false, error: { message: e.message } }
    }
  }

  async function applyAmnesty(date) {
    const previousAmnestiedDates = [...(settings.value.amnestied_dates || [])]
    const previousRemaining = settings.value.amnesty_remaining
    
    settings.value.amnestied_dates = [...previousAmnestiedDates, date]
    settings.value.amnesty_remaining = Math.max(0, previousRemaining - 1)
    
    try {
      const result = await habitsApi.applyAmnesty(date)
      
      if (result.success) {
        if (result.data.amnesty_remaining !== undefined) {
          settings.value.amnesty_remaining = result.data.amnesty_remaining
        }
        
        if (result.data.xp_restored) {
          xpStats.value.xp_balance += result.data.xp_restored
        }
        
        if (DEBUG_MODE) {
          console.log('[HabitsStore] Amnesty applied:', date, '+', result.data.xp_restored, 'XP')
        }
        
        return { 
          success: true, 
          xpRestored: result.data.xp_restored,
          amnestiedHabits: result.data.amnestied_habits
        }
      } else {
        settings.value.amnestied_dates = previousAmnestiedDates
        settings.value.amnesty_remaining = previousRemaining
        return { success: false, error: result.error }
      }
    } catch (e) {
      settings.value.amnestied_dates = previousAmnestiedDates
      settings.value.amnesty_remaining = previousRemaining
      if (DEBUG_MODE) console.error('[HabitsStore] Apply amnesty error:', e)
      return { success: false, error: { message: e.message } }
    }
  }

  async function revokeAmnesty(date) {
    const previousAmnestiedDates = [...(settings.value.amnestied_dates || [])]
    const previousRemaining = settings.value.amnesty_remaining
    
    settings.value.amnestied_dates = previousAmnestiedDates.filter(d => d !== date)
    settings.value.amnesty_remaining = previousRemaining + 1
    
    try {
      const result = await habitsApi.revokeAmnesty(date)
      
      if (result.success) {
        if (result.data.amnesty_remaining !== undefined) {
          settings.value.amnesty_remaining = result.data.amnesty_remaining
        }
        
        if (result.data.xp_deducted) {
          xpStats.value.xp_balance = Math.max(0, xpStats.value.xp_balance - result.data.xp_deducted)
        }
        
        if (DEBUG_MODE) {
          console.log('[HabitsStore] Amnesty revoked:', date)
        }
        
        return { success: true }
      } else {
        settings.value.amnestied_dates = previousAmnestiedDates
        settings.value.amnesty_remaining = previousRemaining
        return { success: false, error: result.error }
      }
    } catch (e) {
      settings.value.amnestied_dates = previousAmnestiedDates
      settings.value.amnesty_remaining = previousRemaining
      if (DEBUG_MODE) console.error('[HabitsStore] Revoke amnesty error:', e)
      return { success: false, error: { message: e.message } }
    }
  }

  async function loadAnalytics(forceRefresh = false) {
    if (!forceRefresh && analytics.value && analyticsLastFetch.value) {
      if (Date.now() - analyticsLastFetch.value < CACHE_DURATION) {
        return { success: true, data: analytics.value, cached: true }
      }
    }
    
    try {
      const result = await habitsApi.getAnalytics()
      
      if (result.success) {
        analytics.value = result.data
        analyticsLastFetch.value = Date.now()
        
        if (DEBUG_MODE) {
          console.log('[HabitsStore] Analytics loaded')
        }
        
        return { success: true, data: result.data }
      }
      return { success: false, error: result.error }
    } catch (e) {
      if (DEBUG_MODE) console.error('[HabitsStore] Analytics error:', e)
      return { success: false, error: { message: e.message } }
    }
  }

  async function loadAchievements(forceRefresh = false) {
    if (!forceRefresh && achievements.value && achievementsLastFetch.value) {
      if (Date.now() - achievementsLastFetch.value < CACHE_DURATION) {
        return { success: true, data: achievements.value, cached: true }
      }
    }
    
    try {
      const result = await habitsApi.getAchievements()
      
      if (result.success) {
        achievements.value = result.data
        achievementsLastFetch.value = Date.now()
        
        if (DEBUG_MODE) {
          console.log('[HabitsStore] Achievements loaded:', result.data.unlocked_count, '/', result.data.total_count)
        }
        
        return { success: true, data: result.data }
      }
      return { success: false, error: result.error }
    } catch (e) {
      if (DEBUG_MODE) console.error('[HabitsStore] Achievements error:', e)
      return { success: false, error: { message: e.message } }
    }
  }

  async function loadRecommendedHabits() {
    if (recommendedHabits.value) {
      return { success: true, data: recommendedHabits.value, cached: true }
    }
    
    try {
      const result = await habitsApi.getRecommendedHabits()
      
      if (result.success) {
        recommendedHabits.value = result.data
        
        if (DEBUG_MODE) {
          console.log('[HabitsStore] Recommended habits loaded')
        }
        
        return { success: true, data: result.data }
      }
      return { success: false, error: result.error }
    } catch (e) {
      if (DEBUG_MODE) console.error('[HabitsStore] Recommended habits error:', e)
      return { success: false, error: { message: e.message } }
    }
  }

  async function loadXPStats() {
    try {
      const result = await habitsApi.getXPStats()
      
      if (result.success) {
        Object.assign(xpStats.value, result.data)
        
        if (DEBUG_MODE) {
          console.log('[HabitsStore] XP stats loaded:', xpStats.value)
        }
        
        return { success: true, data: result.data }
      }
      return { success: false, error: result.error }
    } catch (e) {
      if (DEBUG_MODE) console.error('[HabitsStore] XP stats error:', e)
      return { success: false, error: { message: e.message } }
    }
  }

  async function loadXPHistory(params = {}) {
    try {
      const result = await habitsApi.getXPHistory(params)
      
      if (result.success) {
        xpHistory.value = result.data.transactions || []
        
        if (DEBUG_MODE) {
          console.log('[HabitsStore] XP history loaded:', xpHistory.value.length, 'transactions')
        }
        
        return { success: true, data: result.data }
      }
      return { success: false, error: result.error }
    } catch (e) {
      if (DEBUG_MODE) console.error('[HabitsStore] XP history error:', e)
      return { success: false, error: { message: e.message } }
    }
  }

  async function loadRewards(params = {}) {
    try {
      const result = await habitsApi.getRewards(params)
      
      if (result.success) {
        rewards.value = result.data.rewards || []
        rewardsLoaded.value = true
        
        if (DEBUG_MODE) {
          console.log('[HabitsStore] Rewards loaded:', rewards.value.length)
        }
        
        return { success: true, data: result.data }
      }
      return { success: false, error: result.error }
    } catch (e) {
      if (DEBUG_MODE) console.error('[HabitsStore] Rewards error:', e)
      return { success: false, error: { message: e.message } }
    }
  }

  async function createReward(rewardData) {
    try {
      const result = await habitsApi.createReward(rewardData)
      
      if (result.success) {
        const newReward = {
          reward_id: result.data.reward_id,
          ...rewardData,
          status: 'available',
          date_created: new Date().toISOString()
        }
        rewards.value.push(newReward)
        
        if (DEBUG_MODE) {
          console.log('[HabitsStore] Reward created:', result.data.reward_id)
        }
        
        return { success: true, rewardId: result.data.reward_id }
      }
      return { success: false, error: result.error }
    } catch (e) {
      if (DEBUG_MODE) console.error('[HabitsStore] Create reward error:', e)
      return { success: false, error: { message: e.message } }
    }
  }

  async function redeemReward(rewardId) {
    const reward = rewards.value.find(r => r.reward_id === rewardId)
    if (!reward) return { success: false, error: { message: 'Награда не найдена' } }
    
    if (xpStats.value.xp_balance < reward.cost) {
      return { success: false, error: { message: 'Недостаточно XP' } }
    }
    
    const previousBalance = xpStats.value.xp_balance
    const previousStatus = reward.status
    
    xpStats.value.xp_balance -= reward.cost
    reward.status = 'redeemed'
    reward.date_redeemed = new Date().toISOString()
    
    try {
      const result = await habitsApi.redeemReward(rewardId)
      
      if (result.success) {
        if (result.data.new_balance !== undefined) {
          xpStats.value.xp_balance = result.data.new_balance
        }
        
        if (DEBUG_MODE) {
          console.log('[HabitsStore] Reward redeemed:', rewardId)
        }
        
        return { success: true, newBalance: result.data.new_balance }
      } else {
        xpStats.value.xp_balance = previousBalance
        reward.status = previousStatus
        reward.date_redeemed = null
        return { success: false, error: result.error || { message: result.data?.error } }
      }
    } catch (e) {
      xpStats.value.xp_balance = previousBalance
      reward.status = previousStatus
      reward.date_redeemed = null
      if (DEBUG_MODE) console.error('[HabitsStore] Redeem reward error:', e)
      return { success: false, error: { message: e.message } }
    }
  }

  async function updateReward(rewardId, updates) {
    const reward = rewards.value.find(r => r.reward_id === rewardId)
    if (!reward) return { success: false, error: { message: 'Награда не найдена' } }
    
    const previousReward = { ...reward }
    Object.assign(reward, updates)
    
    try {
      const result = await habitsApi.updateReward(rewardId, updates)
      
      if (result.success) {
        if (DEBUG_MODE) {
          console.log('[HabitsStore] Reward updated:', rewardId)
        }
        return { success: true }
      } else {
        Object.assign(reward, previousReward)
        return { success: false, error: result.error }
      }
    } catch (e) {
      Object.assign(reward, previousReward)
      if (DEBUG_MODE) console.error('[HabitsStore] Update reward error:', e)
      return { success: false, error: { message: e.message } }
    }
  }

  async function deleteReward(rewardId, permanent = false) {
    const rewardIndex = rewards.value.findIndex(r => r.reward_id === rewardId)
    if (rewardIndex < 0) return { success: false, error: { message: 'Награда не найдена' } }
    
    const removedReward = rewards.value.splice(rewardIndex, 1)[0]
    
    try {
      const result = await habitsApi.deleteReward(rewardId, permanent)
      
      if (result.success) {
        if (DEBUG_MODE) {
          console.log('[HabitsStore] Reward deleted:', rewardId, permanent ? '(permanent)' : '')
        }
        return { success: true }
      } else {
        rewards.value.splice(rewardIndex, 0, removedReward)
        return { success: false, error: result.error }
      }
    } catch (e) {
      rewards.value.splice(rewardIndex, 0, removedReward)
      if (DEBUG_MODE) console.error('[HabitsStore] Delete reward error:', e)
      return { success: false, error: { message: e.message } }
    }
  }

  async function initialize(params = {}) {
    if (initialized.value && !params.force) {
      return { success: true, cached: true }
    }
    
    const results = await Promise.all([
      loadHabits(params),
      loadStatsPanel()
    ])
    
    const habitsResult = results[0]
    const statsResult = results[1]
    
    if (!habitsResult.success) {
      return { success: false, error: habitsResult.error }
    }
    
    return { success: true }
  }

  function getHabitById(habitId) {
    return habits.value.find(h => h.habit_id === habitId)
  }

  function getCompletionStatus(habitId, date) {
    const habit = getHabitById(habitId)
    if (!habit) return null
    
    const completion = habit.completions?.find(c => c.date === date)
    return completion?.status || null
  }

  function isHabitScheduledForDay(habit, dayOfWeek) {
    if (!habit) return false
    
    if (habit.frequency_type === 'daily') return true
    if (habit.frequency_type === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5
    if (habit.frequency_type === 'weekends') return dayOfWeek === 0 || dayOfWeek === 6
    
    return habit.schedule_days?.includes(dayOfWeek) ?? false
  }

  function popPendingAchievement() {
    return pendingAchievements.value.shift()
  }

  function clearPendingAchievements() {
    pendingAchievements.value = []
  }

  function resetStore() {
    habits.value = []
    weekDates.value = []
    settings.value = {
      difficulty_mode: 'balanced',
      xp_penalty_planning: 50,
      xp_penalty_journal: 50,
      amnesty_per_week: 1,
      amnesty_remaining: 1,
      amnestied_dates: []
    }
    statsPanel.value = {
      streak: 0,
      today_completed: 0,
      today_total: 0,
      week_xp: 0,
      amnesty_remaining: 1,
      difficulty_mode: 'balanced'
    }
    analytics.value = null
    analyticsLastFetch.value = null
    achievements.value = null
    achievementsLastFetch.value = null
    recommendedHabits.value = null
    xpStats.value = { xp_balance: 0, lifetime_xp: 0, today_xp: 0, week_xp: 0 }
    xpHistory.value = []
    rewards.value = []
    rewardsLoaded.value = false
    pendingAchievements.value = []
    initialized.value = false
    error.value = null
    
    if (DEBUG_MODE) {
      console.log('[HabitsStore] Store reset')
    }
  }

  return {
    loading,
    initialized,
    error,
    
    habits,
    weekDates,
    settings,
    statsPanel,
    analytics,
    achievements,
    recommendedHabits,
    xpStats,
    xpHistory,
    rewards,
    rewardsLoaded,
    pendingAchievements,
    
    activeHabits,
    deletedHabits,
    streak,
    todayCompleted,
    todayTotal,
    weekXp,
    amnestyRemaining,
    amnestiedDates,
    difficultyMode,
    isSoftMode,
    isBalancedMode,
    isHardcoreMode,
    isCustomMode,
    xpBalance,
    lifetimeXp,
    todayXp,
    availableRewards,
    redeemedRewards,
    unlockedAchievementsCount,
    totalAchievementsCount,
    
    initialize,
    loadHabits,
    loadStatsPanel,
    loadSettings,
    saveSettings,
    
    createHabit,
    updateHabit,
    deleteHabit,
    restoreHabit,
    archiveHabit,
    permanentlyDeleteHabit,
    
    markCompleted,
    unmarkCompleted,
    markExcused,
    
    applyAmnesty,
    revokeAmnesty,
    
    loadAnalytics,
    loadAchievements,
    loadRecommendedHabits,
    
    loadXPStats,
    loadXPHistory,
    
    loadRewards,
    createReward,
    redeemReward,
    updateReward,
    deleteReward,
    
    getHabitById,
    getCompletionStatus,
    isHabitScheduledForDay,
    popPendingAchievement,
    clearPendingAchievements,
    resetStore
  }
})
