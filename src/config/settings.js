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

// Принудительно показывать онбординг (для тестирования и разработки)
export const FORCE_SHOW_ONBOARDING = localSettings.FORCE_SHOW_ONBOARDING ?? false

// Принудительно показывать мини-задание (для тестирования и разработки)
export const FORCE_SHOW_MINITASK = localSettings.FORCE_SHOW_MINITASK ?? false

// Логируем загрузку настроек
if (DEBUG_MODE) {
  console.log('[Settings] Configuration loaded:', {
    DEV_MODE,
    SKIP_AUTH_CHECK,
    API_BASE_URL,
    MIN_REQUEST_INTERVAL,
    DEBUG_MODE,
    FORCE_SHOW_ONBOARDING,
    FORCE_SHOW_MINITASK
  })
}

// Экспорт всех настроек как объекта для удобства
export const settings = {
  DEV_MODE,
  SKIP_AUTH_CHECK,
  API_BASE_URL,
  MIN_REQUEST_INTERVAL,
  DEBUG_MODE,
  FORCE_SHOW_ONBOARDING,
  FORCE_SHOW_MINITASK
}

export default settings
