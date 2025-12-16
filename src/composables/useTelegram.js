/**
 * Composable для работы с Telegram Mini Apps (TWA).
 *
 * Предоставляет:
 * - Определение запуска из Telegram
 * - Данные пользователя и initData для авторизации
 * - Параметры темы Telegram
 * - Методы взаимодействия (MainButton, Haptic, close и др.)
 *
 * Использование:
 *   import { useTelegram } from '@/composables/useTelegram'
 *
 *   const { isInTelegram, initData, user, themeParams } = useTelegram()
 *
 *   if (isInTelegram.value) {
 *     // Авторизация через initData
 *     await api.telegramWebAppAuth(initData.value)
 *   }
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'

// Синглтон для хранения состояния (чтобы не инициализировать несколько раз)
let telegramState = null

/**
 * Инициализировать состояние Telegram WebApp.
 */
function initTelegramState() {
    if (telegramState) {
        return telegramState
    }

    const isInTelegram = ref(false)
    const webApp = ref(null)
    const user = ref(null)
    const initData = ref(null)
    const themeParams = ref({})
    const colorScheme = ref('light')
    const viewportHeight = ref(0)
    const viewportStableHeight = ref(0)
    const isExpanded = ref(false)
    const platform = ref('')

    // Инициализация
    const tg = window.Telegram?.WebApp
    if (tg) {
        isInTelegram.value = true
        webApp.value = tg
        user.value = tg.initDataUnsafe?.user || null
        initData.value = tg.initData || null
        themeParams.value = tg.themeParams || {}
        colorScheme.value = tg.colorScheme || 'light'
        viewportHeight.value = tg.viewportHeight || 0
        viewportStableHeight.value = tg.viewportStableHeight || 0
        isExpanded.value = tg.isExpanded || false
        platform.value = tg.platform || ''

        // Сообщаем Telegram что приложение готово
        tg.ready()

        // Расширяем на весь экран
        if (!tg.isExpanded) {
            tg.expand()
            isExpanded.value = true
        }

        // Подписываемся на изменение темы
        tg.onEvent('themeChanged', () => {
            themeParams.value = tg.themeParams || {}
            colorScheme.value = tg.colorScheme || 'light'
        })

        // Подписываемся на изменение viewport
        tg.onEvent('viewportChanged', ({ isStateStable }) => {
            viewportHeight.value = tg.viewportHeight
            if (isStateStable) {
                viewportStableHeight.value = tg.viewportStableHeight
            }
        })

        console.log('[TWA] Telegram WebApp initialized', {
            platform: platform.value,
            colorScheme: colorScheme.value,
            userId: user.value?.id,
        })
    }

    telegramState = {
        isInTelegram,
        webApp,
        user,
        initData,
        themeParams,
        colorScheme,
        viewportHeight,
        viewportStableHeight,
        isExpanded,
        platform,
    }

    return telegramState
}

/**
 * Composable для работы с Telegram Mini Apps.
 */
export function useTelegram() {
    const state = initTelegramState()

    // === Методы ===

    /**
     * Закрыть Mini App.
     */
    const close = () => {
        state.webApp.value?.close()
    }

    /**
     * Расширить на весь экран.
     */
    const expand = () => {
        if (state.webApp.value && !state.isExpanded.value) {
            state.webApp.value.expand()
            state.isExpanded.value = true
        }
    }

    /**
     * Показать главную кнопку (Main Button).
     *
     * @param {string} text - Текст кнопки
     * @param {Function} onClick - Callback при нажатии
     * @param {Object} options - Дополнительные параметры
     */
    const showMainButton = (text, onClick, options = {}) => {
        const tg = state.webApp.value
        if (!tg) return

        const mainButton = tg.MainButton

        mainButton.text = text

        if (options.color) {
            mainButton.color = options.color
        }
        if (options.textColor) {
            mainButton.textColor = options.textColor
        }

        // Удаляем предыдущий обработчик если был
        mainButton.offClick()
        mainButton.onClick(onClick)

        mainButton.show()

        if (options.loading) {
            mainButton.showProgress()
        }
    }

    /**
     * Скрыть главную кнопку.
     */
    const hideMainButton = () => {
        const tg = state.webApp.value
        if (!tg) return

        tg.MainButton.hide()
        tg.MainButton.offClick()
    }

    /**
     * Показать/скрыть индикатор загрузки на MainButton.
     */
    const setMainButtonLoading = (loading) => {
        const tg = state.webApp.value
        if (!tg) return

        if (loading) {
            tg.MainButton.showProgress()
        } else {
            tg.MainButton.hideProgress()
        }
    }

    /**
     * Показать кнопку "Назад" (Back Button).
     *
     * @param {Function} onClick - Callback при нажатии
     */
    const showBackButton = (onClick) => {
        const tg = state.webApp.value
        if (!tg) return

        tg.BackButton.offClick()
        tg.BackButton.onClick(onClick)
        tg.BackButton.show()
    }

    /**
     * Скрыть кнопку "Назад".
     */
    const hideBackButton = () => {
        const tg = state.webApp.value
        if (!tg) return

        tg.BackButton.hide()
        tg.BackButton.offClick()
    }

    /**
     * Haptic feedback - вибрация при касании.
     *
     * @param {string} style - 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
     */
    const hapticImpact = (style = 'medium') => {
        const tg = state.webApp.value
        if (!tg?.HapticFeedback) return

        tg.HapticFeedback.impactOccurred(style)
    }

    /**
     * Haptic feedback - уведомление.
     *
     * @param {string} type - 'error' | 'success' | 'warning'
     */
    const hapticNotification = (type = 'success') => {
        const tg = state.webApp.value
        if (!tg?.HapticFeedback) return

        tg.HapticFeedback.notificationOccurred(type)
    }

    /**
     * Haptic feedback - выбор элемента.
     */
    const hapticSelection = () => {
        const tg = state.webApp.value
        if (!tg?.HapticFeedback) return

        tg.HapticFeedback.selectionChanged()
    }

    /**
     * Показать всплывающее окно (popup).
     *
     * @param {Object} params - { title, message, buttons }
     * @returns {Promise<string>} - ID нажатой кнопки
     */
    const showPopup = (params) => {
        return new Promise((resolve) => {
            const tg = state.webApp.value
            if (!tg) {
                resolve(null)
                return
            }

            tg.showPopup(params, (buttonId) => {
                resolve(buttonId)
            })
        })
    }

    /**
     * Показать подтверждение (confirm).
     *
     * @param {string} message - Текст сообщения
     * @returns {Promise<boolean>}
     */
    const showConfirm = (message) => {
        return new Promise((resolve) => {
            const tg = state.webApp.value
            if (!tg) {
                resolve(false)
                return
            }

            tg.showConfirm(message, (confirmed) => {
                resolve(confirmed)
            })
        })
    }

    /**
     * Показать alert.
     *
     * @param {string} message - Текст сообщения
     * @returns {Promise<void>}
     */
    const showAlert = (message) => {
        return new Promise((resolve) => {
            const tg = state.webApp.value
            if (!tg) {
                resolve()
                return
            }

            tg.showAlert(message, () => {
                resolve()
            })
        })
    }

    /**
     * Применить тему Telegram к CSS переменным.
     */
    const applyTelegramTheme = () => {
        if (!state.isInTelegram.value || !state.themeParams.value) return

        const root = document.documentElement
        const params = state.themeParams.value

        // Основные цвета
        if (params.bg_color) {
            root.style.setProperty('--tg-bg-color', params.bg_color)
        }
        if (params.text_color) {
            root.style.setProperty('--tg-text-color', params.text_color)
        }
        if (params.hint_color) {
            root.style.setProperty('--tg-hint-color', params.hint_color)
        }
        if (params.link_color) {
            root.style.setProperty('--tg-link-color', params.link_color)
        }
        if (params.button_color) {
            root.style.setProperty('--tg-button-color', params.button_color)
        }
        if (params.button_text_color) {
            root.style.setProperty('--tg-button-text-color', params.button_text_color)
        }
        if (params.secondary_bg_color) {
            root.style.setProperty('--tg-secondary-bg-color', params.secondary_bg_color)
        }

        // Класс темы
        root.classList.toggle('telegram-dark', state.colorScheme.value === 'dark')
        root.classList.toggle('telegram-light', state.colorScheme.value === 'light')
        root.classList.add('in-telegram')

        console.log('[TWA] Theme applied', {
            colorScheme: state.colorScheme.value,
            bgColor: params.bg_color,
        })
    }

    // === Computed ===

    const isDarkMode = computed(() => state.colorScheme.value === 'dark')

    const telegramUserId = computed(() => state.user.value?.id || null)

    const telegramUsername = computed(() => state.user.value?.username || null)

    const telegramFirstName = computed(() => state.user.value?.first_name || null)

    // === Return ===

    return {
        // State (reactive)
        isInTelegram: state.isInTelegram,
        webApp: state.webApp,
        user: state.user,
        initData: state.initData,
        themeParams: state.themeParams,
        colorScheme: state.colorScheme,
        viewportHeight: state.viewportHeight,
        viewportStableHeight: state.viewportStableHeight,
        isExpanded: state.isExpanded,
        platform: state.platform,

        // Computed
        isDarkMode,
        telegramUserId,
        telegramUsername,
        telegramFirstName,

        // Methods
        close,
        expand,
        showMainButton,
        hideMainButton,
        setMainButtonLoading,
        showBackButton,
        hideBackButton,
        hapticImpact,
        hapticNotification,
        hapticSelection,
        showPopup,
        showConfirm,
        showAlert,
        applyTelegramTheme,
    }
}
