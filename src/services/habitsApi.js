/**
 * API клиент для раздела "Привычки"
 * 
 * 18 endpoints для полного функционала:
 * - Настройки (2): get, update
 * - Привычки (2): get, update (create/edit/delete/restore)
 * - Выполнение (1): update completions
 * - Амнистия (2): apply, revoke
 * - Аналитика (1): get
 * - Достижения (1): get
 * - Статистика (2): stats-panel, recommended
 * - XP (2): history, stats
 * - Награды (5): get, create, redeem, update, delete
 */

import { request } from '@/services/api.js'
import { DEBUG_MODE } from '@/config/settings.js'

const HABITS_API_PREFIX = '/api/app/habits'

/**
 * Обёртка для запросов к Habits API
 * @param {string} endpoint - Путь относительно /api/app/habits
 * @param {object} data - Данные запроса
 * @returns {Promise<object>} - Ответ API
 */
async function habitsRequest(endpoint, data = {}) {
  const fullEndpoint = `${HABITS_API_PREFIX}${endpoint}`
  
  if (DEBUG_MODE) {
    console.log(`[HabitsAPI] POST ${fullEndpoint}`, data)
  }
  
  const result = await request('POST', fullEndpoint, data)
  
  if (result.error) {
    if (DEBUG_MODE) {
      console.error(`[HabitsAPI] Error:`, result.error)
    }
    return { success: false, error: result.error }
  }
  
  if (result.response?.status === 'ok') {
    return { success: true, data: result.response.data }
  }
  
  if (result.status === 'ok') {
    return { success: true, data: result.data }
  }
  
  return { success: false, error: result.error_data || { message: 'Неизвестная ошибка' } }
}

// ========================================
// 1. НАСТРОЙКИ (2 endpoints)
// ========================================

/**
 * Получить настройки геймификации пользователя
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 * 
 * Возвращает:
 * - difficulty_mode: 'soft' | 'balanced' | 'hardcore' | 'custom'
 * - xp_penalty_planning: number (0-100)
 * - xp_penalty_journal: number (0-100)
 * - amnesty_per_week: number
 * - amnesty_remaining: number
 * - amnestied_dates: string[] (YYYY-MM-DD)
 */
export async function getSettings() {
  return habitsRequest('/settings/get/')
}

/**
 * Обновить настройки геймификации
 * @param {object} settings - Настройки для обновления
 * @param {string} [settings.difficulty_mode] - Режим сложности
 * @param {number} [settings.xp_penalty_planning] - Штраф за планирование (0-100)
 * @param {number} [settings.xp_penalty_journal] - Штраф за дневник (0-100)
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export async function updateSettings(settings) {
  return habitsRequest('/settings/update/', settings)
}

// ========================================
// 2. ПРИВЫЧКИ (2 endpoints)
// ========================================

/**
 * Получить список привычек с недельным расписанием
 * @param {object} params - Параметры запроса
 * @param {string} [params.date_from] - Начало периода (YYYY-MM-DD)
 * @param {string} [params.date_to] - Конец периода (YYYY-MM-DD)
 * @param {boolean} [params.include_deleted] - Включить удалённые
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 * 
 * Возвращает:
 * - habits: массив привычек с completions за период
 * - settings: настройки геймификации
 * - week_dates: массив дат недели
 */
export async function getHabits(params = {}) {
  return habitsRequest('/get/', params)
}

/**
 * Создать/обновить/удалить/восстановить привычки
 * @param {object} data - Данные операции
 * @param {string} data.action - 'create' | 'update' | 'delete' | 'restore'
 * @param {Array} data.habits - Массив привычек для операции
 * 
 * Для create:
 * - name: string (обязательно)
 * - icon: string (название иконки, например 'fire', 'strength')
 * - xp_reward: number (1-100)
 * - xp_penalty: number (0-200)
 * - frequency_type: 'daily' | 'weekly' | 'custom'
 * - schedule_days: number[] (0=Вс, 1=Пн, ... 6=Сб)
 * - description: string
 * 
 * Для update:
 * - habit_id: number (обязательно)
 * - ...любые поля для обновления
 * 
 * Для delete/restore:
 * - habit_id: number (обязательно)
 * 
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export async function updateHabits(data) {
  return habitsRequest('/update/', data)
}

/**
 * Хелпер: создать одну привычку
 */
export async function createHabit(habitData) {
  return updateHabits({
    action: 'create',
    habits: [habitData]
  })
}

/**
 * Хелпер: создать несколько привычек
 */
export async function createHabits(habitsArray) {
  return updateHabits({
    action: 'create',
    habits: habitsArray
  })
}

/**
 * Хелпер: обновить одну привычку
 */
export async function updateHabit(habitId, habitData) {
  return updateHabits({
    action: 'update',
    habits: [{ habit_id: habitId, ...habitData }]
  })
}

/**
 * Хелпер: удалить привычку (soft-delete)
 */
export async function deleteHabit(habitId) {
  return updateHabits({
    action: 'delete',
    habits: [{ habit_id: habitId }]
  })
}

/**
 * Хелпер: восстановить привычку
 */
export async function restoreHabit(habitId) {
  return updateHabits({
    action: 'restore',
    habits: [{ habit_id: habitId }]
  })
}

/**
 * Хелпер: архивировать привычку (обновление с is_archived: true)
 */
export async function archiveHabit(habitId) {
  return updateHabits({
    action: 'update',
    habits: [{ habit_id: habitId, is_archived: true }]
  })
}

/**
 * Хелпер: полностью удалить привычку (delete с permanent: true)
 */
export async function permanentlyDeleteHabit(habitId) {
  return updateHabits({
    action: 'delete',
    habits: [{ habit_id: habitId }],
    permanent: true
  })
}

// ========================================
// 3. ВЫПОЛНЕНИЕ (1 endpoint)
// ========================================

/**
 * Обновить статус выполнения привычек
 * @param {Array} completions - Массив изменений
 * @param {number} completions[].habit_id - ID привычки
 * @param {string} completions[].date - Дата (YYYY-MM-DD)
 * @param {string} completions[].status - 'completed' | 'missed' | 'excused' | null
 * @param {string} [completions[].note] - Заметка
 * @param {string} [completions[].excuse_reason] - Причина (для excused)
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 * 
 * Возвращает:
 * - updated_completions: массив обновлённых записей
 * - xp_changes: массив изменений XP
 * - new_achievements: массив новых достижений (если есть)
 */
export async function updateCompletions(completions) {
  return habitsRequest('/completions/update/', { completions })
}

/**
 * Хелпер: отметить одну привычку как выполненную
 */
export async function markHabitCompleted(habitId, date, note = '') {
  return updateCompletions([{
    habit_id: habitId,
    date,
    status: 'completed',
    note
  }])
}

/**
 * Хелпер: отменить выполнение привычки
 */
export async function unmarkHabitCompleted(habitId, date) {
  return updateCompletions([{
    habit_id: habitId,
    date,
    status: null
  }])
}

/**
 * Хелпер: отметить уважительный пропуск
 */
export async function markHabitExcused(habitId, date, excuseReason) {
  return updateCompletions([{
    habit_id: habitId,
    date,
    status: 'excused',
    excuse_reason: excuseReason
  }])
}

// ========================================
// 4. АМНИСТИЯ (2 endpoints)
// ========================================

/**
 * Применить амнистию к дате
 * Возвращает штрафы за пропущенные привычки в этот день
 * @param {string} date - Дата (YYYY-MM-DD)
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 * 
 * Возвращает:
 * - success: boolean
 * - xp_restored: number (сколько XP вернули)
 * - amnesty_remaining: number (осталось амнистий)
 * - amnestied_habits: массив привычек которые были амнистированы
 */
export async function applyAmnesty(date) {
  return habitsRequest('/amnesty/apply/', { date })
}

/**
 * Отменить амнистию для даты
 * Снова списывает штрафы
 * @param {string} date - Дата (YYYY-MM-DD)
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export async function revokeAmnesty(date) {
  return habitsRequest('/amnesty/revoke/', { date })
}

// ========================================
// 5. АНАЛИТИКА (1 endpoint)
// ========================================

/**
 * Получить данные аналитики
 * Тяжёлый запрос - рекомендуется кэшировать
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 * 
 * Возвращает:
 * - completion_stats: { week_rate, month_rate, weekly_trend, best_week, worst_week, per_habit }
 * - calendar_data: { year_total_completions, year_active_days, best_month, heatmap, monthly_stats }
 * - habit_stats: массив детальной статистики по каждой привычке
 */
export async function getAnalytics() {
  return habitsRequest('/analytics/get/')
}

// ========================================
// 6. ДОСТИЖЕНИЯ (1 endpoint)
// ========================================

/**
 * Получить достижения пользователя
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 * 
 * Возвращает:
 * - total_count: number
 * - unlocked_count: number
 * - categories: массив категорий с достижениями
 *   - category: 'streak' | 'completion' | 'volume' | 'variety'
 *   - name: string
 *   - achievements: массив достижений
 */
export async function getAchievements() {
  return habitsRequest('/achievements/get/')
}

// ========================================
// 7. СТАТИСТИКА (2 endpoints)
// ========================================

/**
 * Получить данные для верхней панели статистики
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 * 
 * Возвращает:
 * - streak: number (дней подряд)
 * - today_completed: number
 * - today_total: number
 * - week_xp: number
 * - amnesty_remaining: number
 * - difficulty_mode: string
 */
export async function getStatsPanel() {
  return habitsRequest('/stats-panel/')
}

/**
 * Получить рекомендуемые привычки
 * Статические данные - можно кэшировать долго
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 * 
 * Возвращает:
 * - categories: массив категорий (5 шт)
 *   - id: 'health' | 'productivity' | 'self_development' | 'mental_health' | 'routine'
 *   - name: string
 *   - icon: string
 *   - habits: массив рекомендуемых привычек
 */
export async function getRecommendedHabits() {
  return habitsRequest('/recommended/')
}

// ========================================
// 8. XP (2 endpoints)
// ========================================

/**
 * Получить историю XP транзакций
 * @param {object} params - Параметры фильтрации
 * @param {number} [params.limit=10] - Количество записей (1-100)
 * @param {string} [params.transaction_type] - Фильтр по типу транзакции
 * @param {string} [params.date_from] - Начало периода (YYYY-MM-DD)
 * @param {string} [params.date_to] - Конец периода (YYYY-MM-DD)
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 * 
 * Типы транзакций:
 * - habit_completed, habit_penalty
 * - goal_step_completed, goal_completed
 * - journal_entry, achievement_bonus
 * - reward_redeemed, manual_adjustment
 */
export async function getXPHistory(params = {}) {
  return habitsRequest('/xp/history/', params)
}

/**
 * Получить статистику XP
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 * 
 * Возвращает:
 * - xp_balance: number (текущий баланс)
 * - lifetime_xp: number (всего заработано)
 * - today_xp: number (заработано сегодня)
 * - week_xp: number (заработано за неделю)
 */
export async function getXPStats() {
  return habitsRequest('/xp/stats/')
}

// ========================================
// 9. НАГРАДЫ (5 endpoints)
// ========================================

/**
 * Получить список наград
 * @param {object} params - Параметры фильтрации
 * @param {string} [params.status_filter] - 'available' | 'redeemed'
 * @param {boolean} [params.include_deleted=false] - Включить удалённые
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export async function getRewards(params = {}) {
  return habitsRequest('/rewards/get/', params)
}

/**
 * Создать награду
 * @param {object} reward - Данные награды
 * @param {string} reward.name - Название (обязательно)
 * @param {number} reward.cost - Стоимость в XP (обязательно)
 * @param {string} [reward.icon='🎁'] - Emoji иконка
 * @param {string} [reward.description=''] - Описание
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export async function createReward(reward) {
  return habitsRequest('/rewards/create/', reward)
}

/**
 * Получить (выкупить) награду за XP
 * @param {number} rewardId - ID награды
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 * 
 * Возвращает:
 * - success: boolean
 * - new_balance: number (новый баланс XP)
 */
export async function redeemReward(rewardId) {
  return habitsRequest('/rewards/redeem/', { reward_id: rewardId })
}

/**
 * Обновить награду
 * @param {number} rewardId - ID награды
 * @param {object} updates - Поля для обновления
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export async function updateReward(rewardId, updates) {
  return habitsRequest('/rewards/update/', { reward_id: rewardId, ...updates })
}

/**
 * Удалить награду
 * @param {number} rewardId - ID награды
 * @param {boolean} [permanent=false] - Удалить навсегда
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export async function deleteReward(rewardId, permanent = false) {
  return habitsRequest('/rewards/delete/', { reward_id: rewardId, permanent })
}

// ========================================
// ЭКСПОРТ
// ========================================

export default {
  getSettings,
  updateSettings,
  
  getHabits,
  updateHabits,
  createHabit,
  createHabits,
  updateHabit,
  deleteHabit,
  restoreHabit,
  
  updateCompletions,
  markHabitCompleted,
  unmarkHabitCompleted,
  markHabitExcused,
  
  applyAmnesty,
  revokeAmnesty,
  
  getAnalytics,
  getAchievements,
  
  getStatsPanel,
  getRecommendedHabits,
  
  getXPHistory,
  getXPStats,
  
  getRewards,
  createReward,
  redeemReward,
  updateReward,
  deleteReward
}
