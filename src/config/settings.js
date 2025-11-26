/**
 * Настройки приложения
 * 
 * Конфигурация загружается из local_settings.js
 * Для изменения настроек редактируйте local_settings.js
 */

import * as localSettings from './local_settings.js'

// Режим разработки
export const DEV_MODE = localSettings.DEV_MODE ?? import.meta.env.DEV ?? false

// Пропустить проверку авторизации (только для разработки)
export const SKIP_AUTH_CHECK = localSettings.SKIP_AUTH_CHECK ?? false

// Базовый URL API (пустой = относительные пути через proxy)
export const API_BASE_URL = localSettings.API_BASE_URL ?? ''

// Минимальный интервал между запросами (мс)
export const MIN_REQUEST_INTERVAL = localSettings.MIN_REQUEST_INTERVAL ?? 500

// Показывать ли отладочную информацию в консоли
export const DEBUG_MODE = localSettings.DEBUG_MODE ?? false

// Логируем загрузку настроек
if (DEBUG_MODE) {
  console.log('[Settings] Configuration loaded:', {
    DEV_MODE,
    SKIP_AUTH_CHECK,
    API_BASE_URL,
    MIN_REQUEST_INTERVAL,
    DEBUG_MODE
  })
}

// Экспорт всех настроек как объекта для удобства
export const settings = {
  DEV_MODE,
  SKIP_AUTH_CHECK,
  API_BASE_URL,
  MIN_REQUEST_INTERVAL,
  DEBUG_MODE
}

export default settings
