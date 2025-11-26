/**
 * Пример файла локальных настроек
 * 
 * Для использования:
 * 1. Скопируйте этот файл как local_settings.js
 * 2. Измените настройки под вашу среду
 * 3. local_settings.js НЕ должен быть в git
 * 
 * Команда: cp src/config/local_settings.example.js src/config/local_settings.js
 */

// Режим разработки
export const DEV_MODE = true

// Пропустить проверку авторизации (удобно для разработки UI)
export const SKIP_AUTH_CHECK = true

// Базовый URL API (оставить пустым для использования proxy)
export const API_BASE_URL = ''

// Минимальный интервал между запросами (мс)
export const MIN_REQUEST_INTERVAL = 500

// Показывать отладочную информацию в консоли
export const DEBUG_MODE = true

// Принудительно показывать онбординг (для тестирования и разработки)
// Если true - онбординг будет показан даже если уже пройден
export const FORCE_SHOW_ONBOARDING = false

// Принудительно показывать мини-задание (для тестирования и разработки)
// Если true - мини-задание будет показано даже если уже пройдено
export const FORCE_SHOW_MINITASK = false
