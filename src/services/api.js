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
  '/api/rest/front/get-user-data/'
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
  
  const config = {
    method,
    headers,
    credentials: 'same-origin' // Cookie-based auth
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
    
    await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
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
  checkAuth,
  getCurrentUser,
  getCsrfToken,
  getOnboardingData,
  updateOnboardingData
}

export default api
