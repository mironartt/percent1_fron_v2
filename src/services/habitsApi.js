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

const HABITS_API_PREFIX = '/api/rest/front/app/habits'

/**
 * Обёртка для запросов к Habits API
 * @param {string} endpoint - Путь относительно /api/rest/front/app/habits
 * @param {object} data - Данные запроса
 * @returns {Promise<object>} - Ответ API
 */
async function habitsRequest(endpoint, data = {}) {
  const fullEndpoint = `${HABITS_API_PREFIX}${endpoint}`
  
  if (DEBUG_MODE) {
    console.log(`[HabitsAPI] POST ${fullEndpoint}`, data)
  }
  
  const result = await request('POST', fullEndpoint, data)
  
  if (result.status === 'ok') {
    return { success: true, data: result.data }
  }
  
  if (result.status === 'error') {
    if (DEBUG_MODE) {
      console.error(`[HabitsAPI] Error:`, result.error_data)
    }
    return { success: false, error: result.error_data || { message: 'Ошибка сервера' } }
  }
  
  if (result.error) {
    if (DEBUG_MODE) {
      console.error(`[HabitsAPI] Request Error:`, result.error)
    }
    return { success: false, error: result.error }
  }
  
  return { success: false, error: { message: 'Неизвестный формат ответа' } }
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
 * 
 * ПРАВИЛЬНАЯ СТРУКТУРА ЗАПРОСА:
 * @param {object} data - Данные операции (все поля опциональны, но минимум одно обязательно)
 * @param {Array} [data.habits_data] - Массив для создания/обновления привычек
 * @param {Array} [data.deleted_habit_ids] - Массив ID для soft-delete
 * @param {Array} [data.restored_habit_ids] - Массив ID для восстановления
 * @param {Array} [data.permanently_deleted_ids] - Массив ID для полного удаления
 * 
 * Структура habits_data:
 * - habit_id?: number (если есть - обновление, если нет - создание)
 * - name: string (обязательно для создания)
 * - icon?: string (название иконки, например 'fire', 'strength', по умолчанию 'fire')
 * - xp_reward?: number (1-100, по умолчанию 5)
 * - xp_penalty?: number (0-200, по умолчанию 0)
 * - frequency_type?: 'daily' | 'weekdays' | 'weekends' | 'custom'
 * - schedule_days?: number[] (0=Вс, 1=Пн, ... 6=Сб)
 * - description?: string (до 500 символов)
 * 
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export async function updateHabits(data) {
  return habitsRequest('/update/', data)
}

/**
 * Хелпер: создать одну привычку
 * @param {object} habitData - Данные привычки (без habit_id)
 */
export async function createHabit(habitData) {
  return updateHabits({
    habits_data: [habitData]
  })
}

/**
 * Хелпер: создать несколько привычек
 * @param {Array} habitsArray - Массив данных привычек (без habit_id)
 */
export async function createHabits(habitsArray) {
  return updateHabits({
    habits_data: habitsArray
  })
}

/**
 * Хелпер: обновить одну привычку
 * @param {number} habitId - ID привычки
 * @param {object} habitData - Поля для обновления
 */
export async function updateHabit(habitId, habitData) {
  return updateHabits({
    habits_data: [{ habit_id: habitId, ...habitData }]
  })
}

/**
 * Хелпер: удалить привычку (soft-delete, можно восстановить)
 * @param {number} habitId - ID привычки
 */
export async function deleteHabit(habitId) {
  return updateHabits({
    deleted_habit_ids: [habitId]
  })
}

/**
 * Хелпер: удалить несколько привычек (soft-delete)
 * @param {Array<number>} habitIds - Массив ID привычек
 */
export async function deleteHabits(habitIds) {
  return updateHabits({
    deleted_habit_ids: habitIds
  })
}

/**
 * Хелпер: восстановить привычку
 * @param {number} habitId - ID привычки
 */
export async function restoreHabit(habitId) {
  return updateHabits({
    restored_habit_ids: [habitId]
  })
}

/**
 * Хелпер: восстановить несколько привычек
 * @param {Array<number>} habitIds - Массив ID привычек
 */
export async function restoreHabits(habitIds) {
  return updateHabits({
    restored_habit_ids: habitIds
  })
}

/**
 * Хелпер: архивировать привычку (обновление с is_archived: true)
 * @param {number} habitId - ID привычки
 */
export async function archiveHabit(habitId) {
  return updateHabits({
    habits_data: [{ habit_id: habitId, is_archived: true }]
  })
}

/**
 * Хелпер: полностью удалить привычку (БЕЗВОЗВРАТНО!)
 * @param {number} habitId - ID привычки
 */
export async function permanentlyDeleteHabit(habitId) {
  return updateHabits({
    permanently_deleted_ids: [habitId]
  })
}

/**
 * Хелпер: полностью удалить несколько привычек (БЕЗВОЗВРАТНО!)
 * @param {Array<number>} habitIds - Массив ID привычек
 */
export async function permanentlyDeleteHabits(habitIds) {
  return updateHabits({
    permanently_deleted_ids: habitIds
  })
}

// ========================================
// 3. ВЫПОЛНЕНИЕ (1 endpoint)
// ========================================

/**
 * Обновить статус выполнения привычек
 * @param {Array} completionsData - Массив изменений
 * @param {number} completionsData[].habit_id - ID привычки
 * @param {string} completionsData[].date - Дата (YYYY-MM-DD)
 * @param {string} completionsData[].status - 'completed' | 'missed' | 'excused' | null
 * @param {string} [completionsData[].note] - Заметка
 * @param {string} [completionsData[].excuse_reason] - Причина (для excused)
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 * 
 * Возвращает:
 * - updated_completions: массив обновлённых записей
 * - xp_changes: массив изменений XP
 * - new_achievements: массив новых достижений (если есть)
 */
export async function updateCompletions(completionsData) {
  return habitsRequest('/completions/update/', { completions_data: completionsData })
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
// 4. АМНИСТИЯ (3 endpoints)
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

/**
 * Получить доступные дни для амнистии
 * Возвращает детальную информацию для модального окна выбора дня
 * @param {string} [weekStart] - Начало недели (YYYY-MM-DD), опционально
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 * 
 * Возвращает:
 * - week_start: string (YYYY-MM-DD)
 * - week_end: string (YYYY-MM-DD)
 * - amnesty_available: { total: number, used: number, remaining: number }
 * - days: массив дней недели с информацией:
 *   - date: string (YYYY-MM-DD)
 *   - weekday: number (1-7, понедельник = 1)
 *   - is_amnestied: boolean
 *   - can_apply: boolean
 *   - total_penalty: number (сколько XP вернётся)
 *   - missed_habits_count: number (количество пропущенных)
 */
export async function getAmnestyAvailableDays(weekStart = null) {
  const params = weekStart ? { week_start: weekStart } : {}
  return habitsRequest('/amnesty/available-days/', params)
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
 * Создать награды (массовое создание)
 * @param {Array<object>} rewards - Массив наград (до 100 штук)
 * @param {string} rewards[].name - Название (обязательно)
 * @param {number} rewards[].cost - Стоимость в XP (обязательно)
 * @param {string} [rewards[].icon='🎁'] - Emoji иконка
 * @param {string} [rewards[].description=''] - Описание
 * @returns {Promise<{status: string, data?: {rewards: Array, created_count: number, total_items: number, current_balance: number}}>}
 */
export async function createRewards(rewards) {
  return habitsRequest('/rewards/create/', { rewards_data: rewards })
}

/**
 * Создать одну награду (обёртка для совместимости)
 * @deprecated Используйте createRewards([reward])
 */
export async function createReward(reward) {
  return createRewards([reward])
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
  createRewards,
  redeemReward,
  updateReward,
  deleteReward
}
