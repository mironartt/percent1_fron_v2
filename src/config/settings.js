/**
 * Базовые настройки приложения
 * Этот файл находится в git и содержит дефолтные значения
 * 
 * Для переопределения настроек в локальной среде:
 * 1. Создайте файл local_settings.js в этой же директории
 * 2. Экспортируйте нужные переменные
 * 3. Файл local_settings.js должен быть добавлен в .gitignore
 */

// Режим разработки
export let DEV_MODE = import.meta.env.DEV || false

// Пропустить проверку авторизации (только для разработки)
export let SKIP_AUTH_CHECK = false

// Базовый URL API (пустой = относительные пути через proxy)
export let API_BASE_URL = ''

// Минимальный интервал между запросами (мс)
export let MIN_REQUEST_INTERVAL = 500

// Показывать ли отладочную информацию в консоли
export let DEBUG_MODE = false

// Попытка загрузить локальные настройки
// В продакшене этот файл не существует
try {
  const localSettings = await import('./local_settings.js')
  
  if (localSettings.DEV_MODE !== undefined) DEV_MODE = localSettings.DEV_MODE
  if (localSettings.SKIP_AUTH_CHECK !== undefined) SKIP_AUTH_CHECK = localSettings.SKIP_AUTH_CHECK
  if (localSettings.API_BASE_URL !== undefined) API_BASE_URL = localSettings.API_BASE_URL
  if (localSettings.MIN_REQUEST_INTERVAL !== undefined) MIN_REQUEST_INTERVAL = localSettings.MIN_REQUEST_INTERVAL
  if (localSettings.DEBUG_MODE !== undefined) DEBUG_MODE = localSettings.DEBUG_MODE
  
  if (DEBUG_MODE) {
    console.log('[Settings] Local settings loaded successfully')
  }
} catch (e) {
  // local_settings.js не найден - используем дефолтные значения
  if (import.meta.env.DEV) {
    console.log('[Settings] Using default settings (local_settings.js not found)')
  }
}

// Экспорт всех настроек как объекта для удобства
export const settings = {
  get DEV_MODE() { return DEV_MODE },
  get SKIP_AUTH_CHECK() { return SKIP_AUTH_CHECK },
  get API_BASE_URL() { return API_BASE_URL },
  get MIN_REQUEST_INTERVAL() { return MIN_REQUEST_INTERVAL },
  get DEBUG_MODE() { return DEBUG_MODE }
}

export default settings
