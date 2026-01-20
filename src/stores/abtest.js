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

    trackEvent(eventType, metadata = {}) {
      if (!this.sessionId) {
        this.sessionId = this.generateSessionId()
      }

      const event = {
        session_id: this.sessionId,
        variant: this.variant,
        event_type: eventType,
        metadata: {
          ...metadata,
          screen_width: window.screen.width,
          screen_height: window.screen.height,
        },
        timestamp: Date.now(),
      }

      this.events.push(event)

      if (DEBUG_MODE) {
        console.log('[ABTest] Event tracked:', eventType, event)
      }
    },

    trackOnboardingStarted() {
      this.trackEvent('onboarding_started', {
        variant: this.variant,
      })
    },

    trackStepCompleted(stepNumber, timeSpentMs, additionalData = {}) {
      this.trackEvent('step_completed', {
        step_number: stepNumber,
        time_spent_ms: timeSpentMs,
        ...additionalData,
      })
    },

    trackOnboardingCompleted(totalTimeMs) {
      this.trackEvent('onboarding_completed', {
        total_time_ms: totalTimeMs,
        total_steps: this.variant === 'fast' ? 3 : 5,
      })
    },

    trackOnboardingAbandoned(stepNumber, timeSpentMs) {
      this.trackEvent('onboarding_abandoned', {
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
