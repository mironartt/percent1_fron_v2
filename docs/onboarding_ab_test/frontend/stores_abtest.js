// A/B Test Store
// Копировать в: src/stores/abtest.js

import { defineStore } from 'pinia'

export const useABTestStore = defineStore('abtest', {
  state: () => ({
    variant: null, // 'fast' или 'deep'
    sessionId: null,
    startTime: null,
    events: [], // История событий (для отладки)
  }),

  getters: {
    /**
     * Получить текущий вариант онбординга
     */
    currentVariant: (state) => state.variant,

    /**
     * Проверка, назначен ли вариант
     */
    isAssigned: (state) => !!state.variant,
  },

  actions: {
    /**
     * Назначить случайный вариант (50/50)
     */
    assignVariant() {
      // Генерируем случайный вариант
      const variant = Math.random() < 0.5 ? 'fast' : 'deep'

      // Генерируем session ID (UUID v4)
      const sessionId = this.generateSessionId()

      // Сохраняем в state
      this.variant = variant
      this.sessionId = sessionId
      this.startTime = Date.now()

      // Сохраняем в localStorage для персистентности
      localStorage.setItem('onboarding_variant', variant)
      localStorage.setItem('onboarding_session_id', sessionId)
      localStorage.setItem('onboarding_start_time', this.startTime.toString())

      // Трекаем событие назначения варианта
      this.trackEvent('variant_assigned', {
        variant,
        timestamp: new Date().toISOString()
      })

      return variant
    },

    /**
     * Получить вариант (назначить если нет)
     */
    getVariant() {
      // Если уже есть в state
      if (this.variant) {
        return this.variant
      }

      // Проверяем localStorage
      const savedVariant = localStorage.getItem('onboarding_variant')
      const savedSessionId = localStorage.getItem('onboarding_session_id')
      const savedStartTime = localStorage.getItem('onboarding_start_time')

      if (savedVariant && savedSessionId) {
        // Восстанавливаем из localStorage
        this.variant = savedVariant
        this.sessionId = savedSessionId
        this.startTime = savedStartTime ? parseInt(savedStartTime) : Date.now()
        return this.variant
      }

      // Назначаем новый вариант
      return this.assignVariant()
    },

    /**
     * Трекинг событий A/B теста
     */
    async trackEvent(eventType, metadata = {}) {
      if (!this.sessionId) {
        this.sessionId = this.generateSessionId()
      }

      const event = {
        session_id: this.sessionId,
        variant: this.variant,
        event_type: eventType,
        metadata: {
          ...metadata,
          user_agent: navigator.userAgent,
          screen_width: window.screen.width,
          screen_height: window.screen.height,
        },
        timestamp: Date.now(),
      }

      // Добавляем в локальную историю (для отладки)
      this.events.push(event)

      // Отправляем на backend
      try {
        const { trackABEvent } = await import('@/services/api.js')
        await trackABEvent(event)
      } catch (error) {
        console.warn('Failed to track AB event:', error)
        // Не бросаем ошибку - трекинг не должен ломать UX
      }
    },

    /**
     * Трекинг начала онбординга
     */
    async trackOnboardingStarted() {
      await this.trackEvent('onboarding_started', {
        variant: this.variant,
      })
    },

    /**
     * Трекинг завершения шага
     */
    async trackStepCompleted(stepNumber, timeSpentMs, additionalData = {}) {
      await this.trackEvent('step_completed', {
        step_number: stepNumber,
        time_spent_ms: timeSpentMs,
        ...additionalData,
      })
    },

    /**
     * Трекинг завершения онбординга
     */
    async trackOnboardingCompleted(totalTimeMs) {
      await this.trackEvent('onboarding_completed', {
        total_time_ms: totalTimeMs,
        total_steps: this.variant === 'fast' ? 3 : 5,
      })
    },

    /**
     * Трекинг отказа от онбординга
     */
    async trackOnboardingAbandoned(stepNumber, timeSpentMs) {
      await this.trackEvent('onboarding_abandoned', {
        step_number: stepNumber,
        time_spent_ms: timeSpentMs,
      })
    },

    /**
     * Генерация UUID v4 для session ID
     */
    generateSessionId() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    },

    /**
     * Сброс A/B теста (для тестирования)
     */
    reset() {
      this.variant = null
      this.sessionId = null
      this.startTime = null
      this.events = []

      localStorage.removeItem('onboarding_variant')
      localStorage.removeItem('onboarding_session_id')
      localStorage.removeItem('onboarding_start_time')
    },

    /**
     * Получить статистику по текущей сессии (для отладки)
     */
    getSessionStats() {
      return {
        variant: this.variant,
        sessionId: this.sessionId,
        startTime: this.startTime,
        elapsedTime: this.startTime ? Date.now() - this.startTime : 0,
        eventsCount: this.events.length,
        events: this.events,
      }
    },
  },
})
