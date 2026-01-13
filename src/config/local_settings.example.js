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

// =============================================================================
// РЕЖИМ РАБОТЫ
// =============================================================================

// Режим разработки
export const DEV_MODE = true;

// Пропустить проверку авторизации (удобно для разработки UI)
export const SKIP_AUTH_CHECK = true;

// Показывать отладочную информацию в консоли
export const DEBUG_MODE = true;

// =============================================================================
// API НАСТРОЙКИ
// =============================================================================

// Базовый URL API
// Варианты:
//   ''                                  - использовать Vite proxy (рекомендуется)
//   'https://percent1.ru'               - прямое подключение к продакшену
//   'https://xxx.ru.tuna.am'            - подключение через туннель
export const API_BASE_URL = "";

// URL бэкенда для Vite proxy (используется только при API_BASE_URL = '')
// Vite проксирует /api/* запросы на этот адрес, решая проблему third-party cookies
// Приоритет: local_settings.js → env VITE_API_BACKEND_URL → localhost:8017
// Примеры:
//   'http://127.0.0.1:8017'             - локальный Django runserver
//   'https://xxx.ru.tuna.am'            - туннель к локальному серверу
//   'https://api.production.com'        - продакшен API
export const VITE_PROXY_TARGET = "http://127.0.0.1:8017";

// Минимальный интервал между запросами (мс)
export const MIN_REQUEST_INTERVAL = 500;

// Режим credentials для fetch запросов
// 'include' - отправлять куки для cross-origin запросов
// 'same-origin' - отправлять куки только для same-origin запросов
// undefined - автоматический выбор на основе API_BASE_URL
export const CREDENTIALS_MODE = undefined;

// Базовый URL для WebSocket (если отличается от API_BASE_URL)
// Пустой = использовать API_BASE_URL или window.location.origin
// Примеры:
//   ''                                  - автоопределение
//   'wss://percent1.ru'                 - явный WebSocket URL
//   'wss://xxx.ru.tuna.am'              - WebSocket через туннель
// export const WS_BASE_URL = '';

// =============================================================================
// VITE HMR (Hot Module Replacement) — для работы через туннель/proxy
// =============================================================================
// 
// Эти настройки нужны ТОЛЬКО если вы работаете через внешний туннель (tuna, ngrok)
// и хотите чтобы hot reload работал.
// 
// Если не указаны — используется стандартное поведение Vite (localhost).
//
// Пример настройки для tuna:
//   VITE_HMR_HOST = 'xxx.ru.tuna.am'
//   VITE_HMR_PROTOCOL = 'wss'
//   VITE_HMR_CLIENT_PORT = 443

// Хост для HMR WebSocket соединения
// Укажите домен вашего туннеля без протокола
// export const VITE_HMR_HOST = 'ft1zzp-95-72-16-20.ru.tuna.am';

// Протокол для HMR: 'ws' (http) или 'wss' (https)
// Для туннелей с HTTPS используйте 'wss'
// export const VITE_HMR_PROTOCOL = 'wss';

// Порт клиента для HMR
// Для HTTPS туннелей обычно 443
// export const VITE_HMR_CLIENT_PORT = 443;

// =============================================================================
// ТЕСТИРОВАНИЕ И ОТЛАДКА
// =============================================================================

// Принудительно показывать онбординг (для тестирования и разработки)
// Если true - онбординг будет показан даже если уже пройден
export const FORCE_SHOW_ONBOARDING = false;

// Принудительно показывать мини-задание (для тестирования и разработки)
// Если true - мини-задание будет показано даже если уже пройдено
export const FORCE_SHOW_MINITASK = false;

// Демо-режим планирования (показывает фейковые данные)
export const DEMO_PLANNING_MODE = false;

// =============================================================================
// ССЫЛКИ И ДОМЕН
// =============================================================================

// Домен сайта для полных ссылок (реферальные ссылки и т.д.)
// Используется когда нужны абсолютные URL вместо относительных путей
// Примеры:
//   'https://percent1.ru'                - продакшен домен
//   'https://dev.percent1.ru'            - dev/staging окружение
export const SITE_DOMAIN = "https://percent1.ru";

// =============================================================================
// SITEMAP
// =============================================================================

// Hostname для sitemap.xml (генерируется при npm run build)
// По умолчанию: 'https://percent1.ru'
// export const SITEMAP_HOSTNAME = 'https://percent1.ru';

// =============================================================================
// ПРИМЕРЫ КОНФИГУРАЦИЙ
// =============================================================================

/**
 * ПРИМЕР 1: Локальная разработка (стандартно)
 * - Фронт на localhost:5000
 * - Бэк на localhost:8017
 * 
 * export const API_BASE_URL = "";
 * export const VITE_PROXY_TARGET = "http://127.0.0.1:8017";
 */

/**
 * ПРИМЕР 2: Локальная разработка через tuna
 * - Фронт и бэк через один домен tuna
 * - nginx проксирует /api на Django, остальное на Vite
 * 
 * export const API_BASE_URL = "";
 * export const VITE_PROXY_TARGET = "http://127.0.0.1:8017";
 * export const VITE_HMR_HOST = 'ft1zzp-95-72-16-20.ru.tuna.am';
 * export const VITE_HMR_PROTOCOL = 'wss';
 * export const VITE_HMR_CLIENT_PORT = 443;
 */

/**
 * ПРИМЕР 3: Подключение к удалённому бэкенду
 * - Фронт локально
 * - API на продакшене или тестовом сервере
 * 
 * export const API_BASE_URL = "https://percent1.ru";
 * export const CREDENTIALS_MODE = "include";
 */
