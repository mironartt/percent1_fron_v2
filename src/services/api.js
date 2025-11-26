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

// Хранилище CSRF токена
let csrfToken = null

// Хранилище последних запросов для rate limiting
const requestTimestamps = new Map()

/**
 * Получить текущий CSRF токен
 */
export function getCsrfToken() {
  return csrfToken
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
  
  // Добавляем CSRF токен если есть и не пропускаем
  if (!skipCsrf && csrfToken) {
    headers['X-CSRFToken'] = csrfToken
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
 * Инициализация CSRF токена
 * Должен вызываться при загрузке приложения
 */
export async function initCsrf() {
  const result = await request('POST', '/api/rest/front/csrf/', null, { 
    skipCsrf: true,
    skipRateLimit: true 
  })
  
  if (result.status === 'ok' && result.csrf_token) {
    csrfToken = result.csrf_token
    if (DEBUG_MODE) {
      console.log('[API] CSRF token initialized')
    }
    return true
  }
  
  if (DEBUG_MODE) {
    console.error('[API] Failed to initialize CSRF token:', result)
  }
  return false
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
  const result = await request('POST', '/api/rest/front/logout/')
  
  // Очищаем CSRF токен после выхода
  if (result.status === 'ok') {
    csrfToken = null
  }
  
  return result
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
  login,
  register,
  logout,
  getUserData,
  requestPasswordRecovery,
  checkAuth,
  getCurrentUser,
  getCsrfToken
}

export default api
