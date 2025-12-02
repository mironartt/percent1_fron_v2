/**
 * API клиент для работы с Django бэкендом
 * 
 * Функциональность:
 * - Централизованное управление CSRF токеном
 * - Cookie-based авторизация
 * - Rate limiting (защита от спама)
 * - Единая обработка ошибок
 */

import { API_BASE_URL, MIN_REQUEST_INTERVAL, DEBUG_MODE } from '@/config/settings.js'

// Хранилище последних запросов для rate limiting
const requestTimestamps = new Map()

/**
 * Утилита для получения значения cookie по имени
 * @param {string} name - Имя cookie
 * @returns {string|null} - Значение cookie или null
 */
function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(';').shift())
  }
  return null
}

/**
 * Получить текущий CSRF токен из cookie
 * @returns {string|null} - CSRF токен или null
 */
export function getCsrfToken() {
  return getCookie('csrftoken')
}

// Эндпоинты, освобождённые от rate limiting
const RATE_LIMIT_EXEMPT = [
  '/api/rest/front/csrf/',
  '/api/rest/front/login/',
  '/api/rest/front/logout/',
  '/api/rest/front/registration/',
  '/api/rest/front/get-user-data/',
  '/api/rest/front/get-global-data/'
]

/**
 * Проверка rate limiting
 * @param {string} endpoint - URL эндпоинта
 * @returns {boolean} - true если запрос разрешён
 */
function checkRateLimit(endpoint) {
  // Освобождённые эндпоинты
  if (RATE_LIMIT_EXEMPT.includes(endpoint)) {
    return true
  }
  
  const now = Date.now()
  const lastRequest = requestTimestamps.get(endpoint)
  
  if (lastRequest && (now - lastRequest) < MIN_REQUEST_INTERVAL) {
    if (DEBUG_MODE) {
      console.warn(`[API] Rate limit: request to ${endpoint} blocked (too soon)`)
    }
    return false
  }
  
  requestTimestamps.set(endpoint, now)
  return true
}

/**
 * Универсальный метод для выполнения запросов
 * @param {string} method - HTTP метод
 * @param {string} endpoint - URL эндпоинта (без базового URL)
 * @param {object} data - Данные для отправки
 * @param {object} options - Дополнительные опции
 * @returns {Promise<object>} - Ответ сервера
 */
export async function request(method, endpoint, data = null, options = {}) {
  const { skipRateLimit = false, skipCsrf = false } = options
  
  // Проверка rate limiting
  if (!skipRateLimit && !checkRateLimit(endpoint)) {
    return {
      status: 'error',
      error_data: {
        message: 'Слишком много запросов. Подождите немного.',
        key: 'rate_limit'
      }
    }
  }
  
  const url = `${API_BASE_URL}${endpoint}`
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
  
  // Добавляем CSRF токен из cookie если не пропускаем
  if (!skipCsrf) {
    const csrfToken = getCookie('csrftoken')
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken
    }
  }
  
  // Определяем credentials в зависимости от того, куда идёт запрос
  // 'include' - для cross-origin запросов (когда API_BASE_URL указан)
  // 'same-origin' - для запросов на тот же домен (через proxy)
  const isCrossOrigin = API_BASE_URL && API_BASE_URL.length > 0
  
  const config = {
    method,
    headers,
    credentials: isCrossOrigin ? 'include' : 'same-origin' // Cookie-based auth
  }
  
  if (data && method !== 'GET') {
    config.body = JSON.stringify(data)
  }
  
  if (DEBUG_MODE) {
    console.log(`[API] ${method} ${url}`, data)
  }
  
  try {
    const response = await fetch(url, config)
    
    // Парсим JSON ответ
    let result
    try {
      result = await response.json()
    } catch (e) {
      result = {
        status: 'error',
        error_data: {
          message: 'Ошибка при обработке ответа сервера',
          key: 'parse_error'
        }
      }
    }
    
    if (DEBUG_MODE) {
      console.log(`[API] Response:`, result)
    }
    
    // Обработка HTTP ошибок
    if (!response.ok) {
      // Если ответ уже содержит структуру ошибки - возвращаем как есть
      if (result.status === 'error' && result.error_data) {
        return result
      }
      
      // Иначе формируем структуру ошибки
      return {
        status: 'error',
        error_data: {
          message: result.message || result.detail || `Ошибка сервера (${response.status})`,
          key: 'http_error',
          http_status: response.status
        }
      }
    }
    
    return result
    
  } catch (error) {
    if (DEBUG_MODE) {
      console.error(`[API] Network error:`, error)
    }
    
    return {
      status: 'error',
      error_data: {
        message: 'Ошибка сети. Проверьте подключение к интернету.',
        key: 'network_error'
      }
    }
  }
}

/**
 * Построение URL с правильным объединением путей
 * Обрабатывает случаи когда API_BASE_URL уже содержит /api префикс
 * @param {string} endpoint - Относительный путь эндпоинта (например /api/rest/front/csrf/)
 * @returns {string} - Полный URL
 */
function buildUrl(endpoint) {
  const base = API_BASE_URL || window.location.origin
  
  // Убираем trailing slash у base и leading slash у endpoint
  const cleanBase = base.replace(/\/+$/, '')
  let cleanEndpoint = endpoint.replace(/^\/+/, '')
  
  // Если base уже содержит /api, а endpoint тоже начинается с api/
  // то убираем дублирующийся api/ из endpoint
  if (cleanBase.endsWith('/api') && cleanEndpoint.startsWith('api/')) {
    cleanEndpoint = cleanEndpoint.substring(4) // Убираем 'api/'
  }
  
  return `${cleanBase}/${cleanEndpoint}`
}

/**
 * Инициализация/обновление CSRF токена
 * Делает запрос к серверу, который устанавливает cookie 'csrftoken'
 * Должен вызываться при загрузке приложения и при переходе на страницы
 */
export async function initCsrf() {
  try {
    const url = buildUrl('/api/rest/front/csrf/')
    
    if (DEBUG_MODE) {
      console.log('[API] Refreshing CSRF token from:', url)
    }
    
    // Определяем credentials в зависимости от того, куда идёт запрос
    const isCrossOrigin = API_BASE_URL && API_BASE_URL.length > 0
    
    await fetch(url, {
      method: 'POST',
      credentials: isCrossOrigin ? 'include' : 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })
    
    // Проверяем что cookie установлена
    const token = getCookie('csrftoken')
    
    if (DEBUG_MODE) {
      if (token) {
        console.log('[API] CSRF token initialized from cookie')
      } else {
        console.warn('[API] CSRF cookie not set after request')
      }
    }
    
    return !!token
  } catch (error) {
    if (DEBUG_MODE) {
      console.error('[API] Failed to initialize CSRF token:', error)
    }
    return false
  }
}

/**
 * Обновление CSRF токена (алиас для initCsrf)
 * Используется при переходе между страницами
 */
export async function refreshCsrf() {
  return initCsrf()
}

/**
 * Авторизация пользователя
 * @param {string} email - Email пользователя
 * @param {string} password - Пароль
 */
export async function login(email, password) {
  return request('POST', '/api/rest/front/login/', { email, password })
}

/**
 * Регистрация нового пользователя
 * @param {string} first_name - Имя пользователя
 * @param {string} email - Email
 * @param {string} password1 - Пароль
 * @param {string} password2 - Подтверждение пароля
 */
export async function register(first_name, email, password1, password2) {
  return request('POST', '/api/rest/front/registration/', {
    first_name,
    email,
    password1,
    password2
  })
}

/**
 * Выход из системы
 */
export async function logout() {
  return request('POST', '/api/rest/front/logout/')
}

/**
 * Получение данных текущего пользователя
 */
export async function getUserData() {
  return request('POST', '/api/rest/front/get-user-data/')
}

/**
 * Восстановление пароля (запрос на отправку письма)
 * @param {string} email - Email пользователя
 */
export async function requestPasswordRecovery(email) {
  return request('POST', '/api/rest/front/password-recovery/', { email })
}

/**
 * Получение глобальных данных (ссылки для Telegram авторизации и т.д.)
 * @returns {Promise<object>} - Глобальные данные
 */
export async function getGlobalData() {
  return request('POST', '/api/rest/front/get-global-data/', {})
}

// ========================================
// ONBOARDING API
// ========================================

/**
 * Получить данные онбординга пользователя
 * @returns {Promise<object>} - Данные онбординга
 */
export async function getOnboardingData() {
  return request('POST', '/api/rest/front/app/onboard/get/')
}

/**
 * Обновить данные онбординга
 * @param {object} data - Данные для обновления
 * @param {string} [data.reason_joined] - Почему пришёл в Систему 1%
 * @param {string} [data.desired_changes] - Что хочет изменить
 * @param {string} [data.growth_comfort_zones] - Зона роста и комфорта
 * @param {string} [data.current_state] - Точка А: где сейчас
 * @param {string} [data.goal_state] - Точка Б: куда хочет
 * @param {string} [data.why_important] - Почему это важно
 * @param {number} [data.step_completed] - Завершённый шаг
 * @param {boolean} [data.is_complete] - Онбординг завершён
 * @returns {Promise<object>} - Результат обновления
 */
export async function updateOnboardingData(data) {
  return request('POST', '/api/rest/front/app/onboard/update/', data)
}

/**
 * Проверка статуса авторизации
 * Возвращает данные пользователя если авторизован, иначе null
 */
export async function checkAuth() {
  const result = await getUserData()
  
  if (result.status === 'ok') {
    return result.data || result
  }
  
  return null
}

// Алиас для совместимости
export const getCurrentUser = checkAuth

// ========================================
// SSP (Сбалансированная Система Показателей) API
// ========================================

/**
 * Получить данные блока ССП
 * Возвращает все данные: оценки, рефлексии, итоговую статистику
 * @returns {Promise<object>} - Данные ССП
 */
export async function getSSPData() {
  return request('POST', '/api/rest/front/app/ssp/get/')
}

/**
 * Обновить данные блока ССП
 * @param {object} data - Данные для обновления
 * @param {Array} data.categories_reflection_data - Массив данных по категориям
 * @param {string} data.categories_reflection_data[].category - ID категории (welfare, hobby, environment, health_sport, work, family)
 * @param {number} [data.categories_reflection_data[].rating] - Оценка (0-10)
 * @param {string} [data.categories_reflection_data[].rating_reason] - Почему такая оценка?
 * @param {string} [data.categories_reflection_data[].what_mean_max_rating] - Что для меня "10"?
 * @param {string} [data.categories_reflection_data[].max_rating_difficulties] - Что мешает дойти до "10"?
 * @param {string} [data.categories_reflection_data[].what_want] - Как я хочу, чтобы было?
 * @returns {Promise<object>} - Результат обновления
 */
export async function updateSSPData(data) {
  return request('POST', '/api/rest/front/app/ssp/update/', data)
}

// ========================================
// MINI-TASK API
// ========================================

/**
 * Получить данные мини-задания пользователя
 * Возвращает текущий статус, задачи и категории для шага 3
 * @returns {Promise<object>} - Данные мини-задания
 */
export async function getMiniTaskData() {
  return request('POST', '/api/rest/front/app/onboard/mini-task/get/')
}

/**
 * Обновить данные мини-задания
 * @param {object} data - Данные для обновления
 * @param {Array} [data.tasks] - Массив задач
 * @param {number} [data.step_completed] - Завершённый шаг (1-4)
 * @param {boolean} [data.is_complete] - Мини-задание завершено
 * @returns {Promise<object>} - Результат обновления
 */
export async function updateMiniTaskData(data) {
  return request('POST', '/api/rest/front/app/onboard/mini-task/update/', data)
}

// ========================================
// GOALS API (Банк целей, Планирование, Детали цели)
// ========================================

/**
 * Получить список целей с возможностью фильтрации и пагинации
 * Используется на страницах: Банк целей, Планирование
 * 
 * @param {object} params - Параметры запроса
 * @param {boolean} [params.with_steps_data] - Получить данные по шагам (первая страница)
 * @param {string} [params.order_by] - Поле сортировки: 'date_created' | 'status' | 'title' | 'category'
 * @param {string} [params.order_direction] - Направление: 'asc' | 'desc'
 * @param {string} [params.status_filter] - Фильтр по статусу: 'work' | 'complete' | 'unstatus'
 * @param {string} [params.category_filter] - Фильтр по категории
 * @param {string} [params.query_filter] - Текстовый поиск (min 3 символа)
 * @param {number} [params.page] - Номер страницы
 * @returns {Promise<object>} - Список целей с пагинацией и статистикой
 * 
 * Ответ содержит:
 * - goals_data: массив целей
 * - total_data: статистика (total_goals, true_goals, false_goals, in_work_goals)
 * - total_data_steps_data: статистика по шагам (если with_steps_data=true)
 * - page, page_size, total_pages, total_items, total_filtered_items
 */
export async function getGoals(params = {}) {
  return request('POST', '/api/rest/front/app/goals/get/', params)
}

/**
 * Получить данные по шагам конкретной цели с фильтрацией и пагинацией
 * Используется на страницах: Детали цели, Планирование (при раскрытии карточки)
 * 
 * @param {object} params - Параметры запроса
 * @param {number} params.goal_id - ID цели (обязательный)
 * @param {string} [params.order_by] - Поле сортировки: 'order' | 'date_created' | 'status' | 'priority'
 * @param {string} [params.order_direction] - Направление: 'asc' | 'desc'
 * @param {string} [params.status_filter] - Фильтр по статусу: 'planned' | 'unplanned'
 * @param {string} [params.result_filter] - Фильтр по результату: 'complete' | 'uncomplete'
 * @param {string} [params.priority_filter] - Фильтр по приоритету: 'critical' | 'important' | 'attention' | 'optional'
 * @param {string} [params.query_filter] - Текстовый поиск (min 3 символа)
 * @param {number} [params.page] - Номер страницы
 * @param {number} [params.page_size] - Размер страницы (6-10)
 * @returns {Promise<object>} - Данные цели с шагами
 * 
 * Ответ содержит:
 * - goal_data: данные цели + steps_data + total_data
 * - page, page_size, total_pages, total_items, total_filtered_items
 */
export async function getGoalSteps(params) {
  return request('POST', '/api/rest/front/app/goals/steps/get/', params)
}

/**
 * Создать или обновить цели
 * 
 * @param {object} data - Данные для обновления
 * @param {Array} [data.goals_data] - Массив целей для создания/обновления
 * @param {number|null} data.goals_data[].goal_id - ID цели (null для создания, число для обновления)
 * @param {string} data.goals_data[].title - Название цели
 * @param {string} [data.goals_data[].category] - Категория: 'welfare' | 'hobby' | 'environment' | 'health_sport' | 'work' | 'family'
 * @param {string} [data.goals_data[].status] - Статус: 'work' | 'complete' | null
 * @param {string} [data.goals_data[].score] - Оценка: 'true' | 'false' | null
 * @param {string} [data.goals_data[].why_important] - Почему это важно?
 * @param {string} [data.goals_data[].why_give_me] - Что это мне даст?
 * @param {string} [data.goals_data[].why_about_me] - Почему это про меня?
 * @param {Array<number>} [data.deleted_goals_ids] - ID целей для удаления
 * @param {Array<number>} [data.completed_goals_ids] - ID целей для завершения
 * @returns {Promise<object>} - Обновлённые данные целей
 */
export async function updateGoals(data) {
  return request('POST', '/api/rest/front/app/goals/update/', data)
}

/**
 * Создать или обновить шаги целей
 * 
 * @param {object} data - Данные для обновления
 * @param {Array} data.goals_steps_data - Массив шагов для создания/обновления
 * @param {number} data.goals_steps_data[].goal_id - ID цели (обязательный)
 * @param {number|null} [data.goals_steps_data[].step_id] - ID шага (null для создания, число для обновления)
 * @param {string} data.goals_steps_data[].title - Название шага
 * @param {string} [data.goals_steps_data[].description] - Описание/комментарий
 * @param {string} [data.goals_steps_data[].priority] - Приоритет: 'critical' | 'important' | 'attention' | 'optional'
 * @param {string} [data.goals_steps_data[].time_duration] - Время: 'half' | 'one' | 'two' | 'three' | 'four'
 * @param {string} [data.goals_steps_data[].dt] - Дата выполнения (YYYY-MM-DD)
 * @param {number} data.goals_steps_data[].order - Порядковый номер
 * @param {boolean} [data.goals_steps_data[].is_complete] - Шаг завершён
 * @param {boolean} [data.goals_steps_data[].is_deleted] - Шаг удалён
 * @returns {Promise<object>} - Обновлённые данные целей с шагами
 */
export async function updateGoalSteps(data) {
  return request('POST', '/api/rest/front/app/goals/steps/update/', data)
}

// ========================================
// GOALS API HELPER FUNCTIONS
// ========================================

/**
 * Создать новую цель
 * @param {object} goalData - Данные цели
 * @returns {Promise<object>} - Созданная цель
 */
export async function createGoal(goalData) {
  return updateGoals({
    goals_data: [{
      goal_id: null,
      ...goalData
    }]
  })
}

/**
 * Обновить существующую цель
 * @param {number} goalId - ID цели
 * @param {object} goalData - Данные для обновления
 * @returns {Promise<object>} - Обновлённая цель
 */
export async function updateGoal(goalId, goalData) {
  return updateGoals({
    goals_data: [{
      goal_id: goalId,
      ...goalData
    }]
  })
}

/**
 * Удалить цель
 * @param {number} goalId - ID цели
 * @returns {Promise<object>} - Результат удаления
 */
export async function deleteGoal(goalId) {
  return updateGoals({
    deleted_goals_ids: [goalId]
  })
}

/**
 * Завершить цель
 * @param {number} goalId - ID цели
 * @returns {Promise<object>} - Результат
 */
export async function completeGoal(goalId) {
  return updateGoals({
    completed_goals_ids: [goalId]
  })
}

/**
 * Создать новый шаг
 * @param {number} goalId - ID цели
 * @param {object} stepData - Данные шага
 * @returns {Promise<object>} - Созданный шаг
 */
export async function createStep(goalId, stepData) {
  return updateGoalSteps({
    goals_steps_data: [{
      goal_id: goalId,
      step_id: null,
      ...stepData
    }]
  })
}

/**
 * Обновить существующий шаг
 * @param {number} goalId - ID цели
 * @param {number} stepId - ID шага
 * @param {object} stepData - Данные для обновления
 * @returns {Promise<object>} - Обновлённый шаг
 */
export async function updateStep(goalId, stepId, stepData) {
  return updateGoalSteps({
    goals_steps_data: [{
      goal_id: goalId,
      step_id: stepId,
      ...stepData
    }]
  })
}

/**
 * Удалить шаг
 * @param {number} goalId - ID цели
 * @param {number} stepId - ID шага
 * @returns {Promise<object>} - Результат удаления
 */
export async function deleteStep(goalId, stepId) {
  return updateGoalSteps({
    goals_steps_data: [{
      goal_id: goalId,
      step_id: stepId,
      is_deleted: true
    }]
  })
}

/**
 * Отметить шаг завершённым/незавершённым
 * @param {number} goalId - ID цели
 * @param {number} stepId - ID шага
 * @param {boolean} isComplete - Завершён ли шаг
 * @returns {Promise<object>} - Результат
 */
export async function toggleStepComplete(goalId, stepId, isComplete) {
  return updateGoalSteps({
    goals_steps_data: [{
      goal_id: goalId,
      step_id: stepId,
      is_complete: isComplete
    }]
  })
}

/**
 * Запланировать шаг на дату
 * @param {number} goalId - ID цели
 * @param {number} stepId - ID шага
 * @param {string} date - Дата в формате YYYY-MM-DD
 * @param {string} [priority] - Приоритет
 * @param {string} [timeDuration] - Время выполнения
 * @returns {Promise<object>} - Результат
 */
export async function scheduleStep(goalId, stepId, date, priority = null, timeDuration = null) {
  const stepData = {
    goal_id: goalId,
    step_id: stepId,
    dt: date
  }
  if (priority) stepData.priority = priority
  if (timeDuration) stepData.time_duration = timeDuration
  
  return updateGoalSteps({
    goals_steps_data: [stepData]
  })
}

// ==================== DIARY API ====================

/**
 * Получить записи дневника
 * @param {object} params - Параметры запроса
 * @param {string} [params.order_by] - Поле сортировки (date_created)
 * @param {string} [params.order_direction] - Направление (asc, desc)
 * @param {string} [params.query_filter] - Текстовый поиск (мин 3 символа)
 * @param {number} [params.page] - Номер страницы
 * @returns {Promise<object>} - Список записей дневника
 */
export async function getDiaryEntries(params = {}) {
  const requestData = {
    order_by: params.order_by || 'date_created',
    order_direction: params.order_direction || 'desc',
    page: params.page || 1
  }
  
  if (params.query_filter && params.query_filter.length >= 3) {
    requestData.query_filter = params.query_filter
  }
  
  return request('POST', '/api/rest/front/app/diary/get/', requestData)
}

/**
 * Создать или обновить запись дневника
 * @param {object} data - Данные записи
 * @param {number} [data.diary_id] - ID записи (null для создания)
 * @param {string} [data.what_done] - Что сделал
 * @param {string} [data.what_not_done] - Что не сделал
 * @param {string} [data.reflection] - Рефлексия
 * @param {string} [data.plans] - Планы на завтра
 * @param {boolean} [data.deleted] - Удалить запись
 * @returns {Promise<object>} - { diary_id }
 */
export async function updateDiaryEntry(data) {
  return request('POST', '/api/rest/front/app/diary/update/', data)
}

/**
 * Создать новую запись дневника
 * @param {object} entryData - Данные записи
 * @returns {Promise<object>} - { diary_id }
 */
export async function createDiaryEntry(entryData) {
  return updateDiaryEntry({
    diary_id: null,
    what_done: entryData.what_done || '',
    what_not_done: entryData.what_not_done || '',
    reflection: entryData.reflection || '',
    plans: entryData.plans || ''
  })
}

/**
 * Удалить запись дневника
 * @param {number} diaryId - ID записи
 * @returns {Promise<object>} - Результат
 */
export async function deleteDiaryEntry(diaryId) {
  return updateDiaryEntry({
    diary_id: diaryId,
    deleted: true
  })
}

// Экспорт API как объекта для удобства
export const api = {
  request,
  initCsrf,
  refreshCsrf,
  login,
  register,
  logout,
  getUserData,
  requestPasswordRecovery,
  getGlobalData,
  checkAuth,
  getCurrentUser,
  getCsrfToken,
  getOnboardingData,
  updateOnboardingData,
  getSSPData,
  updateSSPData,
  getMiniTaskData,
  updateMiniTaskData,
  // Goals API
  getGoals,
  getGoalSteps,
  updateGoals,
  updateGoalSteps,
  // Goals Helper Functions
  createGoal,
  updateGoal,
  deleteGoal,
  completeGoal,
  createStep,
  updateStep,
  deleteStep,
  toggleStepComplete,
  scheduleStep,
  // Diary API
  getDiaryEntries,
  updateDiaryEntry,
  createDiaryEntry,
  deleteDiaryEntry
}

export default api
