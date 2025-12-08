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

// Базовый URL API
// Оставить пустым '' для использования Vite proxy (рекомендуется)
// Или указать URL для прямого подключения: 'https://api.example.com'
export const API_BASE_URL = ''

// URL бэкенда для Vite proxy (используется только при API_BASE_URL = '')
// Vite проксирует /api/* запросы на этот адрес, решая проблему third-party cookies
// Приоритет: local_settings.js → env VITE_API_BACKEND_URL → localhost:8017
// Примеры:
//   'http://127.0.0.1:8017'                    - локальный Django
//   'https://myapp.tunnel.com'                 - туннель к локальному серверу
//   'https://api.production.com'               - продакшен API
export const VITE_PROXY_TARGET = 'http://127.0.0.1:8017'

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

// Режим credentials для fetch запросов
// 'include' - отправлять куки для cross-origin запросов
// 'same-origin' - отправлять куки только для same-origin запросов
// undefined - автоматический выбор на основе API_BASE_URL
export const CREDENTIALS_MODE = undefined
