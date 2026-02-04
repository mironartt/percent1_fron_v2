/**
 * Frontend Settings Service
 * 
 * API для хранения пользовательских настроек фронтенда в БД.
 * Поддерживает кэширование в localStorage для быстрого старта.
 * 
 * Ключи:
 * - theme: 'light' | 'dark' — тема оформления
 * - welcome_video_watched: boolean — видео просмотрено
 * - welcome_video_remind_after: ISO date string — когда напомнить о видео
 */

import { API_BASE_URL, DEBUG_MODE, CREDENTIALS_MODE } from '@/config/settings.js'
import { getCsrfToken } from '@/services/api.js'

const CACHE_KEY = 'frontend_settings_cache'

/**
 * Получить настройки из localStorage кэша
 */
export function getCachedSettings() {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    return cached ? JSON.parse(cached) : {}
  } catch (e) {
    console.warn('[FrontendSettings] Failed to parse cache:', e)
    return {}
  }
}

/**
 * Сохранить настройки в localStorage кэш
 */
export function setCachedSettings(settings) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(settings))
  } catch (e) {
    console.warn('[FrontendSettings] Failed to save cache:', e)
  }
}

/**
 * Получить настройки с бэкенда
 * @returns {Promise<Object>} - Объект настроек
 */
export async function getFrontendSettings() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/rest/front/app/frontend-settings/get/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken() || ''
      },
      credentials: CREDENTIALS_MODE,
      body: JSON.stringify({})
    })
    
    const data = await response.json()
    
    if (data.status === 'ok' && data.data?.settings) {
      setCachedSettings(data.data.settings)
      return data.data.settings
    }
    
    return getCachedSettings()
  } catch (e) {
    console.error('[FrontendSettings] Failed to get settings:', e)
    return getCachedSettings()
  }
}

/**
 * Обновить настройки на бэкенде
 * @param {Object} settings - Объект с настройками для обновления (merge логика)
 * @returns {Promise<Object>} - Актуальный объект настроек
 */
export async function updateFrontendSettings(settings) {
  const cached = getCachedSettings()
  const optimisticSettings = { ...cached }
  
  Object.keys(settings).forEach(key => {
    if (settings[key] === null) {
      delete optimisticSettings[key]
    } else {
      optimisticSettings[key] = settings[key]
    }
  })
  setCachedSettings(optimisticSettings)
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/rest/front/app/frontend-settings/update/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken() || ''
      },
      credentials: CREDENTIALS_MODE,
      body: JSON.stringify({ settings })
    })
    
    const data = await response.json()
    
    if (data.status === 'ok' && data.data?.settings) {
      setCachedSettings(data.data.settings)
      if (DEBUG_MODE) {
        console.log('[FrontendSettings] Updated:', data.data.settings)
      }
      return data.data.settings
    }
    
    return optimisticSettings
  } catch (e) {
    console.error('[FrontendSettings] Failed to update settings:', e)
    return optimisticSettings
  }
}

/**
 * Получить значение одной настройки
 * @param {string} key - Ключ настройки
 * @param {*} defaultValue - Значение по умолчанию
 */
export function getSetting(key, defaultValue = null) {
  const settings = getCachedSettings()
  return settings[key] ?? defaultValue
}

/**
 * Обновить одну настройку
 * @param {string} key - Ключ настройки
 * @param {*} value - Значение (null для удаления)
 */
export async function setSetting(key, value) {
  return updateFrontendSettings({ [key]: value })
}
