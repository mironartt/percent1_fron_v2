/**
 * API клиент для работы с Django бэкендом
 * 
 * Функциональность:
 * - Централизованное управление CSRF токеном
 * - Cookie-based авторизация
 * - Rate limiting (защита от спама)
 * - Единая обработка ошибок
 */

import { API_BASE_URL, MIN_REQUEST_INTERVAL, DEBUG_MODE, CREDENTIALS_MODE } from '@/config/settings.js'

// Хранилище последних запросов для rate limiting
const requestTimestamps = new Map()

// Хранилище CSRF токена в памяти (для cross-origin запросов)
let csrfTokenInMemory = null

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
 * Установить CSRF токен в память (для cross-origin сценариев)
 * @param {string} token - CSRF токен
 */
export function setCsrfToken(token) {
  csrfTokenInMemory = token
  if (DEBUG_MODE) {
    console.log('[API] CSRF token saved to memory')
  }
}

/**
 * Получить текущий CSRF токен
 * Приоритет: память > cookie (для поддержки cross-origin)
 * @returns {string|null} - CSRF токен или null
 */
export function getCsrfToken() {
  return csrfTokenInMemory || getCookie('csrftoken')
}

/**
 * Синхронизировать CSRF токен из cookie в память
 * Используется после регистрации/логина когда бэкенд устанавливает новый токен
 */
export function syncCsrfFromCookie() {
  const cookieToken = getCookie('csrftoken')
  if (cookieToken) {
    csrfTokenInMemory = cookieToken
    if (DEBUG_MODE) {
      console.log('[API] CSRF token synced from cookie')
    }
  }
}

/**
 * Определить режим credentials для запроса
 * Приоритет: CREDENTIALS_MODE из настроек > авто-определение по API_BASE_URL
 * @returns {RequestCredentials} - 'include' | 'same-origin'
 */
function getCredentialsMode() {
  if (CREDENTIALS_MODE) {
    return CREDENTIALS_MODE
  }
  const isCrossOrigin = API_BASE_URL && API_BASE_URL.length > 0
  return isCrossOrigin ? 'include' : 'same-origin'
}

/**
 * Централизованная обёртка над fetch с автоматическим CSRF токеном
 * Используйте эту функцию вместо нативного fetch для всех запросов к бэкенду
 * 
 * @param {string} url - URL запроса
 * @param {RequestInit} options - Опции fetch
 * @returns {Promise<Response>} - Response объект
 */
export async function apiFetch(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers
  }
  
  const csrfToken = getCsrfToken()
  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken
  }
  
  const config = {
    ...options,
    headers,
    credentials: options.credentials || getCredentialsMode()
  }
  
  return fetch(url, config)
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
  
  const config = {
    method
  }
  
  if (data && method !== 'GET') {
    config.body = JSON.stringify(data)
  }
  
  if (DEBUG_MODE) {
    console.log(`[API] ${method} ${url}`, data)
  }
  
  try {
    const response = await apiFetch(url, config)
    
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
      // Обработка 403 policy_acceptance_required - показать модалку
      if (response.status === 403 && 
          (result.error_data?.key === 'policy_acceptance_required' || 
           result.error_code === 'policy_acceptance_required')) {
        if (DEBUG_MODE) {
          console.log('[API] Policy acceptance required, triggering modal')
        }
        
        import('@/stores/app').then(({ useAppStore }) => {
          const appStore = useAppStore()
          appStore.showPolicyModal()
        }).catch(err => {
          console.error('[API] Failed to load app store:', err)
        })
        
        return {
          status: 'error',
          error_data: {
            message: 'Необходимо принять условия использования',
            key: 'policy_acceptance_required'
          }
        }
      }
      
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
 * Делает запрос к серверу и сохраняет токен из ответа
 * Поддерживает cross-origin сценарии (токен из JSON/заголовка)
 * Должен вызываться при загрузке приложения и при переходе на страницы
 */
export async function initCsrf() {
  try {
    const url = buildUrl('/api/rest/front/csrf/')
    
    if (DEBUG_MODE) {
      console.log('[API] Refreshing CSRF token from:', url)
    }
    
    const response = await apiFetch(url, {
      method: 'POST',
      body: JSON.stringify({})
    })
    
    let token = null
    
    // 1. Пробуем получить токен из заголовка ответа
    token = response.headers.get('X-CSRFToken')
    
    // 2. Пробуем получить токен из JSON ответа
    if (!token) {
      try {
        const data = await response.json()
        token = data.csrfToken || data.csrf_token || data.token
      } catch (e) {
        // JSON парсинг не удался - игнорируем
      }
    }
    
    // 3. Fallback на cookie (для same-origin)
    if (!token) {
      token = getCookie('csrftoken')
    }
    
    // Сохраняем токен в память
    if (token) {
      setCsrfToken(token)
      if (DEBUG_MODE) {
        console.log('[API] CSRF token initialized')
      }
      return true
    }
    
    if (DEBUG_MODE) {
      console.warn('[API] CSRF token not found in response')
    }
    return false
    
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
  const result = await request('POST', '/api/rest/front/login/', { email, password })
  if (result.status === 'ok') {
    syncCsrfFromCookie()
  }
  return result
}

/**
 * Регистрация нового пользователя
 * @param {string} first_name - Имя пользователя
 * @param {string} email - Email
 * @param {string} password1 - Пароль
 * @param {string} password2 - Подтверждение пароля
 * @param {boolean} is_terms_accepted - Согласие с условиями использования
 * @param {boolean} is_privacy_accepted - Согласие с политикой конфиденциальности
 * @param {string|null} referral_code - Реферальный код (опционально)
 */
export async function register(first_name, email, password1, password2, is_terms_accepted = true, is_privacy_accepted = true, referral_code = null) {
  const { getTrackingData, clearTrackingData } = await import('@/utils/tracking.js')
  const trackingData = getTrackingData()
  
  const payload = {
    first_name,
    email,
    password1,
    password2,
    is_terms_accepted,
    is_privacy_accepted
  }
  if (referral_code) {
    payload.referral_code = referral_code
  }
  if (trackingData.utm_source) payload.utm_source = trackingData.utm_source
  if (trackingData.utm_medium) payload.utm_medium = trackingData.utm_medium
  if (trackingData.utm_campaign) payload.utm_campaign = trackingData.utm_campaign
  if (trackingData.utm_term) payload.utm_term = trackingData.utm_term
  if (trackingData.utm_content) payload.utm_content = trackingData.utm_content
  if (trackingData.ga_client_id) payload.ga_client_id = trackingData.ga_client_id
  if (trackingData.http_referer) payload.http_referer = trackingData.http_referer
  
  const result = await request('POST', '/api/rest/front/registration/', payload)
  if (result.status === 'ok') {
    syncCsrfFromCookie()
    clearTrackingData()
  }
  return result
}

/**
 * Завершение регистрации через Telegram (заполнение email и пароля)
 * @param {string} email - Email пользователя
 * @param {string} password1 - Пароль
 * @param {string} password2 - Подтверждение пароля
 */
export async function completeTelegramRegistration(email, password1, password2) {
  const { getTrackingData, clearTrackingData } = await import('@/utils/tracking.js')
  const trackingData = getTrackingData()
  
  const payload = {
    email,
    password1,
    password2
  }
  if (trackingData.utm_source) payload.utm_source = trackingData.utm_source
  if (trackingData.utm_medium) payload.utm_medium = trackingData.utm_medium
  if (trackingData.utm_campaign) payload.utm_campaign = trackingData.utm_campaign
  if (trackingData.utm_term) payload.utm_term = trackingData.utm_term
  if (trackingData.utm_content) payload.utm_content = trackingData.utm_content
  if (trackingData.ga_client_id) payload.ga_client_id = trackingData.ga_client_id
  if (trackingData.http_referer) payload.http_referer = trackingData.http_referer
  
  const result = await request('POST', '/api/rest/front/registration/fill-data/', payload)
  if (result.status === 'ok') {
    syncCsrfFromCookie()
    clearTrackingData()
  }
  return result
}

/**
 * Авторизация через Telegram Mini Apps (TWA).
 *
 * Принимает initData от Telegram WebApp и авторизует пользователя.
 * Если пользователь новый — создаёт аккаунт автоматически.
 *
 * @param {string} initData - initData строка от window.Telegram.WebApp.initData
 * @returns {Promise<Object>} - { status, data: { user_id, telegram_id, needs_registration_complete, is_new_user, csrf_token } }
 */
export async function telegramWebAppAuth(initData) {
  const result = await request('POST', '/api/rest/front/telegram/webapp-auth/', {
    init_data: initData
  })
  if (result.status === 'ok') {
    syncCsrfFromCookie()
  }
  return result
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
 * Обновление данных пользователя (согласие с политиками)
 * @param {object} data - Данные для обновления
 * @param {boolean} data.is_terms_accepted - Согласие с условиями использования
 * @param {boolean} data.is_privacy_accepted - Согласие с политикой конфиденциальности
 * @returns {Promise<object>} - Результат обновления
 */
export async function updateUserData(data) {
  return request('POST', '/api/rest/front/update-user-data/', data)
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
 * @param {string} [data.ssp_evaluation_id] - ID переоценки (если передан - редактирование, если нет - новая переоценка)
 * @param {Array} data.categories_reflection_data - Массив данных по категориям
 * @param {string} data.categories_reflection_data[].category - ID категории (welfare, hobby, environment, health_sport, work, family)
 * @param {number} [data.categories_reflection_data[].rating] - Оценка (0-10)
 * @param {string} [data.categories_reflection_data[].rating_reason] - Почему такая оценка?
 * @param {string} [data.categories_reflection_data[].what_mean_max_rating] - Что для меня "10"?
 * @param {string} [data.categories_reflection_data[].max_rating_difficulties] - Что мешает дойти до "10"?
 * @param {string} [data.categories_reflection_data[].what_want] - Как я хочу, чтобы было?
 * @returns {Promise<object>} - Результат обновления с ssp_evaluation_id
 */
export async function updateSSPData(data) {
  return request('POST', '/api/rest/front/app/ssp/update/', data)
}

/**
 * Получить историю переоценок ССП
 * @returns {Promise<object>} - История переоценок
 * @property {boolean} data.has_data - Есть ли данные истории
 * @property {Array} data.history - Массив переоценок с датами и оценками
 * @property {Array} data.chart_data - Данные для графика (последние 10 оценок)
 * @property {Array} data.spheres_trends - Тренды по сферам (up/down/stable)
 */
export async function getSSPHistory() {
  return request('POST', '/api/rest/front/app/ssp/history/get/')
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

// ==================== PLANNING API ====================

/**
 * Получить запланированные шаги по диапазону дат
 * @param {object} params - Параметры запроса
 * @param {string} params.date_from - Начальная дата (YYYY-MM-DD)
 * @param {string} params.date_to - Конечная дата (YYYY-MM-DD)
 * @returns {Promise<object>} - Данные по дням с шагами
 * 
 * Response format:
 * {
 *   status: 'ok',
 *   data: {
 *     date_from: 'YYYY-MM-DD',
 *     date_to: 'YYYY-MM-DD',
 *     result_week_data: [
 *       {
 *         date: 'YYYY-MM-DD',
 *         steps_data: [...],
 *         total_steps: number,
 *         total_complete: number,
 *         total_uncomplete: number,
 *         complete_percent: number
 *       },
 *       ...
 *     ]
 *   }
 * }
 */
export async function getPlannedSteps(params) {
  const requestData = {
    date_from: params.date_from,
    date_to: params.date_to
  }

  return request('POST', '/api/rest/front/app/goals/steps/planned/get/', requestData)
}

// ==================== GOAL NOTES API ====================

/**
 * Получить заметки по цели с пагинацией и поиском
 * @param {object} params - Параметры запроса
 * @param {number} params.goal_id - ID цели (обязательный)
 * @param {number} [params.page] - Номер страницы
 * @param {number} [params.page_size] - Размер страницы (по умолчанию 10)
 * @param {string} [params.query_filter] - Текстовый поиск (мин 3 символа)
 * @param {string} [params.order_by] - Поле сортировки (date_created)
 * @param {string} [params.order_direction] - Направление (asc, desc)
 * @returns {Promise<object>} - Список заметок с пагинацией
 *
 * Response format:
 * {
 *   status: 'ok',
 *   data: {
 *     notes_data: [
 *       { note_id, text, date_created, date_updated }
 *     ],
 *     total_items: number,
 *     total_filtered_items: number,
 *     total_pages: number,
 *     page: number,
 *     page_size: number
 *   }
 * }
 */
export async function getGoalNotes(params) {
  const requestData = {
    goal_id: params.goal_id,
    page: params.page || 1,
    page_size: params.page_size || 10,
    order_by: params.order_by || 'date_created',
    order_direction: params.order_direction || 'desc'
  }

  if (params.query_filter && params.query_filter.length >= 3) {
    requestData.query_filter = params.query_filter
  }

  return request('POST', '/api/rest/front/app/goals/notes/get/', requestData)
}

/**
 * Создать или обновить заметки цели
 * @param {object} data - Данные для обновления
 * @param {number} data.goal_id - ID цели (обязательный)
 * @param {Array} [data.notes_data] - Массив заметок для создания/обновления
 * @param {number|null} data.notes_data[].note_id - ID заметки (null для создания)
 * @param {string} data.notes_data[].text - Текст заметки
 * @param {Array<number>} [data.deleted_notes_ids] - ID заметок для удаления
 * @returns {Promise<object>} - Первая страница обновлённых заметок
 */
export async function updateGoalNotes(data) {
  return request('POST', '/api/rest/front/app/goals/notes/update/', data)
}

/**
 * Создать новую заметку
 * @param {number} goalId - ID цели
 * @param {string} text - Текст заметки
 * @returns {Promise<object>} - Созданная заметка
 */
export async function createGoalNote(goalId, text) {
  return updateGoalNotes({
    goal_id: goalId,
    notes_data: [{
      note_id: null,
      text: text
    }]
  })
}

/**
 * Обновить существующую заметку
 * @param {number} goalId - ID цели
 * @param {number} noteId - ID заметки
 * @param {string} text - Новый текст заметки
 * @returns {Promise<object>} - Обновлённая заметка
 */
export async function updateGoalNote(goalId, noteId, text) {
  return updateGoalNotes({
    goal_id: goalId,
    notes_data: [{
      note_id: noteId,
      text: text
    }]
  })
}

/**
 * Удалить заметку
 * @param {number} goalId - ID цели
 * @param {number} noteId - ID заметки
 * @returns {Promise<object>} - Результат удаления
 */
export async function deleteGoalNote(goalId, noteId) {
  return updateGoalNotes({
    goal_id: goalId,
    deleted_notes_ids: [noteId]
  })
}

// ========================================
// XP & REWARDS API
// ========================================

/**
 * Получить статистику XP пользователя
 * @returns {Promise<object>} - Статистика XP
 * @property {number} data.xp_balance - Текущий баланс XP
 * @property {number} data.lifetime_xp - Всего заработано XP
 * @property {number} data.today_xp - Заработано сегодня
 * @property {number} data.week_xp - Заработано за неделю
 */
export async function getXPStats() {
  return request('POST', '/api/rest/front/app/habits/xp/stats/')
}

/**
 * Получить список наград с фильтрацией и сортировкой
 * @param {object} params - Параметры запроса
 * @param {string} [params.status_filter] - Фильтр по статусу: 'available' | 'redeemed' | null
 * @param {boolean} [params.include_deleted] - Включить удалённые награды
 * @param {string} [params.query_filter] - Поиск по названию/описанию (мин 2 символа)
 * @param {string} [params.order_by] - Сортировка: 'cost' | 'distance_to_afford' | 'date_created'
 * @param {string} [params.order_direction] - Направление: 'asc' | 'desc'
 * @returns {Promise<object>} - Список наград
 * @property {Array} data.rewards - Массив наград
 * @property {number} data.total_items - Всего наград
 * @property {number} data.total_filtered_items - С учётом фильтров
 * @property {number} data.current_balance - Текущий баланс XP
 */
export async function getRewards(params = {}) {
  return request('POST', '/api/rest/front/app/habits/rewards/get/', params)
}

/**
 * Создать награды (массовое создание до 100 штук)
 * @param {Array<object>} rewards - Массив наград
 * @param {string} rewards[].name - Название награды (обязательно)
 * @param {number} rewards[].cost - Стоимость в XP (обязательно)
 * @param {string} [rewards[].icon] - Иконка (emoji), по умолчанию '🎁'
 * @param {string} [rewards[].description] - Описание
 * @returns {Promise<object>} - { rewards, created_count, total_items, current_balance }
 */
export async function createRewards(rewards) {
  return request('POST', '/api/rest/front/app/habits/rewards/create/', { rewards_data: rewards })
}

/**
 * Создать одну награду (обёртка для совместимости)
 * @deprecated Используйте createRewards([reward])
 */
export async function createReward(data) {
  return createRewards([data])
}

/**
 * Обновить награду
 * @param {number} rewardId - ID награды
 * @param {object} data - Данные для обновления
 * @param {string} [data.name] - Название
 * @param {number} [data.cost] - Стоимость
 * @param {string} [data.icon] - Иконка
 * @param {string} [data.description] - Описание
 * @returns {Promise<object>} - Результат
 */
export async function updateReward(rewardId, data) {
  return request('POST', '/api/rest/front/app/habits/rewards/update/', {
    reward_id: rewardId,
    ...data
  })
}

/**
 * Удалить награду
 * @param {number} rewardId - ID награды
 * @param {boolean} [permanent=false] - Безвозвратное удаление (true) или soft-delete (false)
 * @returns {Promise<object>} - Результат
 */
export async function deleteReward(rewardId, permanent = false) {
  return request('POST', '/api/rest/front/app/habits/rewards/delete/', {
    reward_id: rewardId,
    permanent
  })
}

/**
 * Получить награду (покупка за XP)
 * @param {number} rewardId - ID награды
 * @returns {Promise<object>} - Результат
 * @property {boolean} data.success - Успешно ли
 * @property {number} [data.new_balance] - Новый баланс XP (при успехе)
 * @property {string} [data.error] - Код ошибки: 'insufficient_xp' | 'reward_not_found' | 'already_redeemed'
 */
export async function redeemReward(rewardId) {
  return request('POST', '/api/rest/front/app/habits/rewards/redeem/', {
    reward_id: rewardId
  })
}

/**
 * Получить группированную историю XP транзакций
 * @param {object} params - Параметры запроса
 * @param {string} [params.transaction_status_filter] - Фильтр: 'earned' | 'spent' | null
 * @param {string} [params.transaction_category_filter] - Категория: 'habits' | 'diary' | 'planning' | 'rewards' | 'goals' | 'other'
 * @param {string} [params.query_filter] - Поиск по названиям (мин 2 символа)
 * @param {number} [params.page] - Номер страницы (по дням)
 * @param {number} [params.page_size] - Размер страницы (5-50, по умолчанию 10)
 * @returns {Promise<object>} - Сгруппированная история
 * @property {Array} data.history_groups - Группы по дням
 * @property {number} data.total_items - Всего дней
 * @property {number} data.total_filtered_items - С учётом фильтров
 * @property {number} data.total_pages - Всего страниц
 * @property {number} data.page - Текущая страница
 * @property {number} data.page_size - Размер страницы
 */
export async function getXPHistoryGrouped(params = {}) {
  return request('POST', '/api/rest/front/app/habits/xp/history-grouped/', params)
}

// ========================================
// CHAT API (AI Mentor WebSocket + REST fallback)
// ========================================

/**
 * Получить список бесед (чатов) пользователя
 * @param {object} params - Параметры запроса
 * @param {string} [params.conversation_type_filter] - Фильтр типа: 'ai_bot' | 'user_to_user'
 * @param {string} [params.order_by] - Поле сортировки: 'last_message_at'
 * @param {string} [params.order_direction] - Направление: 'asc' | 'desc'
 * @param {number} [params.page] - Номер страницы
 * @param {number} [params.page_size] - Размер страницы (default 20)
 * @returns {Promise<object>} - Список бесед
 * @property {Array} data.conversations_data - Массив бесед
 * @property {number} data.total_items - Всего бесед
 * @property {number} data.total_pages - Всего страниц
 */
export async function getChatConversations(params = {}) {
  return request('POST', '/api/rest/front/app/chat/conversations/get/', params)
}

/**
 * Создать новую беседу
 * @param {object} params - Параметры
 * @param {string} [params.conversation_type] - Тип: 'ai_bot' (default) | 'user_to_user'
 * @param {string} [params.title] - Название беседы
 * @returns {Promise<object>} - Созданная беседа
 * @property {object} data.conversation - Данные беседы
 */
export async function createChatConversation(params = {}) {
  return request('POST', '/api/rest/front/app/chat/conversations/create/', params)
}

/**
 * Удалить беседу (soft delete)
 * @param {number} conversationId - ID беседы
 * @returns {Promise<object>} - Результат
 */
export async function deleteChatConversation(conversationId) {
  return request('POST', '/api/rest/front/app/chat/conversations/delete/', {
    conversation_id: conversationId
  })
}

/**
 * Получить сообщения из беседы с пагинацией
 * @param {object} params - Параметры запроса
 * @param {number} params.conversation_id - ID беседы (обязательный)
 * @param {string} [params.order_by] - Поле сортировки: 'date_created'
 * @param {string} [params.order_direction] - Направление: 'asc' (старые сверху) | 'desc' (новые сверху)
 * @param {number} [params.page] - Номер страницы
 * @param {number} [params.page_size] - Размер страницы (default 50)
 * @returns {Promise<object>} - Сообщения с пагинацией
 * @property {Array} data.messages_data - Массив сообщений
 * @property {number} data.total_items - Всего сообщений
 * @property {number} data.total_pages - Всего страниц
 * @property {number} data.page - Текущая страница
 */
export async function getChatMessages(params) {
  return request('POST', '/api/rest/front/app/chat/messages/get/', params)
}

/**
 * Отправить сообщение в беседу (REST fallback, если WebSocket недоступен)
 * @param {object} params - Параметры
 * @param {number} params.conversation_id - ID беседы
 * @param {string} params.content - Текст сообщения (1-10000 символов)
 * @param {number} [params.reply_to_id] - ID сообщения для ответа
 * @param {string} [params.source_page] - URL страницы отправки (например '/goals')
 * @param {object} [params.client_context] - Контекст UI (произвольный JSON)
 * @returns {Promise<object>} - Отправленное сообщение
 * @property {object} data.message - Данные сообщения
 */
export async function sendChatMessage(params) {
  return request('POST', '/api/rest/front/app/chat/messages/send/', params)
}

/**
 * Отметить сообщения как прочитанные
 * @param {object} params - Параметры
 * @param {number} params.conversation_id - ID беседы
 * @param {Array<number>} [params.message_ids] - ID сообщений (если не указан - все непрочитанные)
 * @returns {Promise<object>} - Результат
 */
export async function markChatMessagesRead(params) {
  return request('POST', '/api/rest/front/app/chat/messages/mark-read/', params)
}

/**
 * Обновить реакцию на сообщение
 * @param {object} params - Параметры
 * @param {number} params.message_id - ID сообщения
 * @param {string} params.reaction_type - Тип реакции: 'like' | 'dislike' | 'helpful'
 * @param {boolean} [params.remove] - Удалить реакцию (true) или добавить (false)
 * @returns {Promise<object>} - Результат
 */
export async function updateChatReaction(params) {
  return request('POST', '/api/rest/front/app/chat/reactions/update/', params)
}

// ========================================
// Referral API (Реферальная система)
// ========================================

/**
 * Получить данные страницы рефералов
 * @param {object} params - Параметры запроса
 * @param {number} [params.page] - Страница (по умолчанию 1)
 * @param {number} [params.page_size] - Размер страницы (1-50, по умолчанию 10)
 * @param {string} [params.order_by] - Поле сортировки: 'date_created' | 'has_first_payment'
 * @param {string} [params.order_direction] - Направление: 'asc' | 'desc'
 * @returns {Promise<object>} - Данные страницы рефералов (баланс, статистика, ссылки, калькулятор, рефералы)
 */
export async function getReferralData(params = {}) {
  return request('POST', '/api/rest/front/app/referral/get/', params)
}

/**
 * Получить историю транзакций реферальной системы
 * @param {object} params - Параметры запроса
 * @param {number} [params.page] - Страница (по умолчанию 1)
 * @param {number} [params.page_size] - Размер страницы (1-100, по умолчанию 20)
 * @param {string} [params.type_filter] - Фильтр по типу: 'income' | 'withdrawal' | null
 * @returns {Promise<object>} - История транзакций с пагинацией
 */
export async function getReferralTransactions(params = {}) {
  return request('POST', '/api/rest/front/app/referral/transactions/get/', params)
}

/**
 * Создать заявку на вывод средств
 * @param {object} params - Параметры запроса
 * @param {number} params.amount - Сумма вывода (минимум 3000 руб)
 * @param {string} [params.comment] - Комментарий (реквизиты, пожелания)
 * @returns {Promise<object>} - Данные созданной заявки и новый баланс
 */
export async function createReferralWithdrawal(params) {
  return request('POST', '/api/rest/front/app/referral/withdrawal/create/', params)
}

/**
 * Получить список заявок на вывод
 * @param {object} params - Параметры запроса
 * @param {string} [params.status_filter] - Фильтр по статусу: 'pending' | 'approved' | 'rejected' | 'completed' | null
 * @returns {Promise<object>} - Список заявок на вывод
 */
export async function getReferralWithdrawals(params = {}) {
  return request('POST', '/api/rest/front/app/referral/withdrawal/get/', params)
}

// ==================== ALERTS/NOTIFICATIONS API ====================

/**
 * Получить настройки уведомлений пользователя
 * @returns {Promise<object>} - Настройки уведомлений
 */
export async function getAlertSettings() {
  return request('POST', '/api/rest/front/app/alerts/settings/get/', {})
}

/**
 * Обновить настройки уведомлений
 * @param {object} data - Изменяемые поля настроек
 * @returns {Promise<object>} - Обновлённые настройки
 */
export async function updateAlertSettings(data) {
  return request('POST', '/api/rest/front/app/alerts/settings/update/', data)
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
  deleteDiaryEntry,
  // Planning API
  getPlannedSteps,
  // Goal Notes API
  getGoalNotes,
  updateGoalNotes,
  createGoalNote,
  updateGoalNote,
  deleteGoalNote,
  // XP & Rewards API
  getXPStats,
  getRewards,
  createReward,
  createRewards,
  updateReward,
  deleteReward,
  redeemReward,
  getXPHistoryGrouped,
  // Chat API
  getChatConversations,
  createChatConversation,
  deleteChatConversation,
  getChatMessages,
  sendChatMessage,
  markChatMessagesRead,
  updateChatReaction,
  // Referral API
  getReferralData,
  getReferralTransactions,
  createReferralWithdrawal,
  getReferralWithdrawals,
  // Alerts/Notifications API
  getAlertSettings,
  updateAlertSettings
}

export default api
