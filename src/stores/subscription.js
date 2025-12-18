import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { DEBUG_MODE } from '@/config/settings.js'
import {
  getTariffs,
  getTariffsLanding,
  getSubscription,
  activatePromocode as apiActivatePromocode,
  getPromocode,
  calculatePayment as apiCalculatePayment,
  createPayment as apiCreatePayment,
  getPaymentHistory as apiGetPaymentHistory
} from '@/services/billing.js'

export const useSubscriptionStore = defineStore('subscription', () => {
  const subscription = ref(null)
  const tariffs = ref([])
  const terms = ref([])
  const activePromocode = ref(null)
  const paymentHistory = ref([])

  const loading = ref(false)
  const tariffsLoading = ref(false)
  const historyLoading = ref(false)

  const effectiveTariffCode = computed(() => {
    return subscription.value?.effective_tariff?.code || 'free'
  })

  const effectiveStatus = computed(() => {
    return subscription.value?.effective_status || 'active'
  })

  const isTrial = computed(() => {
    return subscription.value?.is_trial === true
  })

  const isTrialExpired = computed(() => {
    return subscription.value?.is_trial_expired === true
  })

  const isPaid = computed(() => {
    return subscription.value?.is_paid === true
  })

  const daysRemaining = computed(() => {
    return subscription.value?.days_remaining || 0
  })

  const canUpgrade = computed(() => {
    return subscription.value?.can_upgrade !== false
  })

  const canProlong = computed(() => {
    return subscription.value?.can_prolong === true
  })

  const isFree = computed(() => {
    return effectiveTariffCode.value === 'free'
  })

  const isBasic = computed(() => {
    return effectiveTariffCode.value === 'basic'
  })

  const isPro = computed(() => {
    return effectiveTariffCode.value === 'pro'
  })

  const FEATURE_MAP = {
    free: [],
    basic: ['goals_unlimited', 'habits_unlimited', 'diary_unlimited', 'ssp_history'],
    pro: [
      'goals_unlimited', 'goals_ai_assistant', 'habits_unlimited',
      'habits_analytics', 'diary_unlimited', 'ssp_history',
      'chat_ai', 'priority_support'
    ]
  }

  const LIMITS_MAP = {
    free: {
      max_goals: 3,
      max_habits: 5,
      max_diary_entries_per_month: 10
    },
    basic: null,
    pro: null
  }

  function hasFeature(featureId) {
    if (isTrial.value && !isTrialExpired.value) {
      return FEATURE_MAP.pro.includes(featureId)
    }
    const tariffCode = effectiveTariffCode.value
    const features = FEATURE_MAP[tariffCode] || []
    return features.includes(featureId)
  }

  function hasAIAccess() {
    return hasFeature('chat_ai') || hasFeature('goals_ai_assistant')
  }

  function getLimit(limitKey) {
    if (isTrial.value && !isTrialExpired.value) {
      return null
    }
    const tariffCode = effectiveTariffCode.value
    const limits = LIMITS_MAP[tariffCode]
    if (!limits) return null
    return limits[limitKey] || null
  }

  function checkLimit(limitKey, currentCount) {
    const limit = getLimit(limitKey)
    if (limit === null) return { allowed: true, limit: null, remaining: null }
    const remaining = Math.max(0, limit - currentCount)
    return {
      allowed: currentCount < limit,
      limit,
      remaining
    }
  }

  async function loadSubscription() {
    if (loading.value) return

    loading.value = true

    try {
      const result = await getSubscription()

      if (result.status === 'ok' && result.data) {
        subscription.value = result.data.subscription
        activePromocode.value = result.data.active_promocode || null

        if (DEBUG_MODE) {
          console.log('[Subscription] Loaded:', {
            status: subscription.value?.effective_status,
            tariff: subscription.value?.effective_tariff?.code,
            isTrial: subscription.value?.is_trial,
            daysRemaining: subscription.value?.days_remaining
          })
        }
      }
    } catch (error) {
      if (DEBUG_MODE) {
        console.error('[Subscription] Load error:', error)
      }
    } finally {
      loading.value = false
    }
  }

  async function loadTariffs(forLanding = false) {
    if (tariffsLoading.value) return

    tariffsLoading.value = true

    try {
      const result = forLanding ? await getTariffsLanding() : await getTariffs()

      if (result.status === 'ok' && result.data) {
        tariffs.value = result.data.tariffs || []
        terms.value = result.data.terms || []

        if (DEBUG_MODE) {
          console.log('[Subscription] Tariffs loaded:', tariffs.value.length)
        }
      }
    } catch (error) {
      if (DEBUG_MODE) {
        console.error('[Subscription] Tariffs load error:', error)
      }
    } finally {
      tariffsLoading.value = false
    }
  }

  async function activatePromocode(code) {
    try {
      const result = await apiActivatePromocode(code)

      if (result.status === 'ok' && result.data?.promocode) {
        activePromocode.value = result.data.promocode

        await loadTariffs()

        return { success: true, promocode: result.data.promocode }
      }

      return {
        success: false,
        error: result.error_message || 'Не удалось активировать промокод'
      }
    } catch (error) {
      return {
        success: false,
        error: 'Ошибка при активации промокода'
      }
    }
  }

  async function calculatePayment(tariffId, termId) {
    try {
      const result = await apiCalculatePayment(tariffId, termId)

      if (result.status === 'ok' && result.data?.calculation) {
        return { success: true, calculation: result.data.calculation }
      }

      return {
        success: false,
        error: result.error_message || 'Не удалось рассчитать стоимость'
      }
    } catch (error) {
      return {
        success: false,
        error: 'Ошибка при расчёте стоимости'
      }
    }
  }

  async function createPayment(tariffId, termId, finalPrice) {
    try {
      const result = await apiCreatePayment(tariffId, termId, finalPrice)

      if (result.status === 'ok' && result.data?.payment_link) {
        return {
          success: true,
          paymentId: result.data.payment_id,
          paymentLink: result.data.payment_link
        }
      }

      return {
        success: false,
        error: result.error_message || 'Не удалось создать платёж'
      }
    } catch (error) {
      return {
        success: false,
        error: 'Ошибка при создании платежа'
      }
    }
  }

  async function loadPaymentHistory() {
    if (historyLoading.value) return

    historyLoading.value = true

    try {
      const result = await apiGetPaymentHistory()

      if (result.status === 'ok' && result.data?.payments) {
        paymentHistory.value = result.data.payments
      }
    } catch (error) {
      if (DEBUG_MODE) {
        console.error('[Subscription] Payment history error:', error)
      }
    } finally {
      historyLoading.value = false
    }
  }

  function getTariffById(tariffId) {
    return tariffs.value.find(t => t.id === tariffId) || null
  }

  function getTermById(termId) {
    return terms.value.find(t => t.id === termId) || null
  }

  function getHitTerm() {
    return terms.value.find(t => t.is_hit) || terms.value[0] || null
  }

  function reset() {
    subscription.value = null
    tariffs.value = []
    terms.value = []
    activePromocode.value = null
    paymentHistory.value = []
  }

  return {
    subscription,
    tariffs,
    terms,
    activePromocode,
    paymentHistory,

    loading,
    tariffsLoading,
    historyLoading,

    effectiveTariffCode,
    effectiveStatus,
    isTrial,
    isTrialExpired,
    isPaid,
    daysRemaining,
    canUpgrade,
    canProlong,
    isFree,
    isBasic,
    isPro,

    hasFeature,
    hasAIAccess,
    getLimit,
    checkLimit,

    loadSubscription,
    loadTariffs,
    activatePromocode,
    calculatePayment,
    createPayment,
    loadPaymentHistory,
    getTariffById,
    getTermById,
    getHitTerm,
    reset
  }
})
