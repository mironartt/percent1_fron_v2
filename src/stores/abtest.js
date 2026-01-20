import { defineStore } from 'pinia'
import { DEBUG_MODE } from '@/config/settings.js'

export const useABTestStore = defineStore('abtest', {
  state: () => ({
    variant: null,
    sessionId: null,
    startTime: null,
    events: [],
  }),

  getters: {
    currentVariant: (state) => state.variant,
    isAssigned: (state) => !!state.variant,
  },

  actions: {
    initFromBackend(variant) {
      if (this.variant === variant) return
      
      this.variant = variant
      this.sessionId = this.generateSessionId()
      this.startTime = Date.now()
      
      if (DEBUG_MODE) {
        console.log('[ABTest] Initialized from backend:', {
          variant,
          sessionId: this.sessionId
        })
      }
    },

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

      this.events.push(event)

      try {
        const { trackABEvent } = await import('@/services/api.js')
        await trackABEvent(event)
      } catch (error) {
        if (DEBUG_MODE) {
          console.warn('[ABTest] Failed to track event:', error)
        }
      }
    },

    async trackOnboardingStarted() {
      await this.trackEvent('onboarding_started', {
        variant: this.variant,
      })
    },

    async trackStepCompleted(stepNumber, timeSpentMs, additionalData = {}) {
      await this.trackEvent('step_completed', {
        step_number: stepNumber,
        time_spent_ms: timeSpentMs,
        ...additionalData,
      })
    },

    async trackOnboardingCompleted(totalTimeMs) {
      await this.trackEvent('onboarding_completed', {
        total_time_ms: totalTimeMs,
        total_steps: this.variant === 'fast' ? 3 : 5,
      })
    },

    async trackOnboardingAbandoned(stepNumber, timeSpentMs) {
      await this.trackEvent('onboarding_abandoned', {
        step_number: stepNumber,
        time_spent_ms: timeSpentMs,
      })
    },

    generateSessionId() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    },

    reset() {
      this.variant = null
      this.sessionId = null
      this.startTime = null
      this.events = []
    },

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
