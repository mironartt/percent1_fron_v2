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

// Пропустить проверку политик (только для разработки)
export const SKIP_POLICY_CHECK = localSettings.SKIP_POLICY_CHECK ?? false

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

// Демо-режим планировщика (для демонстрации UI)
export const DEMO_PLANNING_MODE = localSettings.DEMO_PLANNING_MODE ?? false

// Режим credentials для fetch запросов ('include' | 'same-origin' | undefined для авто)
export const CREDENTIALS_MODE = localSettings.CREDENTIALS_MODE ?? undefined

// Домен сайта для полных ссылок (реферальные ссылки и т.д.)
export const SITE_DOMAIN = localSettings.SITE_DOMAIN ?? 'https://percent1.ru'

// ID счётчика Яндекс.Метрики
export const YANDEX_METRIKA_ID = localSettings.YANDEX_METRIKA_ID ?? 105671462

// Базовый URL для WebSocket (если отличается от API_BASE_URL)
// Пустой = использовать API_BASE_URL или window.location.origin
export const WS_BASE_URL = localSettings.WS_BASE_URL ?? ''

// Логируем загрузку настроек
if (DEBUG_MODE) {
  console.log('[Settings] Configuration loaded:', {
    DEV_MODE,
    SKIP_AUTH_CHECK,
    SKIP_POLICY_CHECK,
    API_BASE_URL,
    WS_BASE_URL,
    MIN_REQUEST_INTERVAL,
    DEBUG_MODE,
    FORCE_SHOW_ONBOARDING,
    FORCE_SHOW_MINITASK,
    DEMO_PLANNING_MODE,
    CREDENTIALS_MODE,
    YANDEX_METRIKA_ID,
    SITE_DOMAIN
  })
}

// Экспорт всех настроек как объекта для удобства
export const settings = {
  DEV_MODE,
  SKIP_AUTH_CHECK,
  SKIP_POLICY_CHECK,
  API_BASE_URL,
  WS_BASE_URL,
  MIN_REQUEST_INTERVAL,
  DEBUG_MODE,
  FORCE_SHOW_ONBOARDING,
  FORCE_SHOW_MINITASK,
  DEMO_PLANNING_MODE,
  CREDENTIALS_MODE,
  YANDEX_METRIKA_ID,
  SITE_DOMAIN
}

export default settings
