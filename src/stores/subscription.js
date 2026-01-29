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
  getPaymentHistory as apiGetPaymentHistory,
  markModalShown as apiMarkModalShown
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
  
  const lastRefreshTime = ref(0)
  const REFRESH_THROTTLE_MS = 2000

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

  const isPaidExpired = computed(() => {
    return subscription.value?.is_paid_expired === true
  })

  const shouldShowTrialExpiredModal = computed(() => {
    return subscription.value?.should_show_trial_expired_modal === true
  })

  const shouldShowPaidExpiredModal = computed(() => {
    return subscription.value?.should_show_paid_expired_modal === true
  })

  const subscriptionState = computed(() => {
    // Платный тариф активен — ничего не показываем
    if (isPaid.value) return 'paid'

    // Платная подписка истекла — показать модалку (если не показывали)
    if (isPaidExpired.value) return 'paid_expired'

    // Trial истёк — показать модалку (если не показывали)
    if (isTrialExpired.value) return 'trial_expired'

    // Trial активен — показать баннер
    if (isTrial.value) {
      if (daysRemaining.value <= 1) return 'trial_danger'
      if (daysRemaining.value <= 3) return 'trial_warning'
      return 'trial_normal'
    }

    // Freemium — ненавязчивый баннер
    if (isFree.value) return 'freemium'

    return 'unknown'
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

  function hasFeature(featureId) {
    // Пока данные подписки не загружены — разрешаем доступ (бэкенд проверит)
    if (!subscription.value) {
      return true
    }
    if (isTrial.value && !isTrialExpired.value) {
      return FEATURE_MAP.pro.includes(featureId)
    }
    const tariffCode = effectiveTariffCode.value
    const features = FEATURE_MAP[tariffCode] || []
    return features.includes(featureId)
  }

  function hasAIAccess() {
    // Пока данные подписки не загружены — разрешаем доступ (бэкенд проверит)
    if (!subscription.value) {
      return true
    }
    return hasFeature('chat_ai') || hasFeature('goals_ai_assistant')
  }

  function getLimit(limitKey) {
    // Пока данные подписки не загружены — нет лимитов
    if (!subscription.value) {
      return null
    }
    if (isTrial.value && !isTrialExpired.value) {
      return null
    }
    const limits = subscription.value?.effective_tariff?.limits
    if (!limits) return null
    return limits[limitKey] ?? null
  }

  function checkLimit(limitKey, currentCount) {
    // Пока данные подписки не загружены — разрешаем
    if (!subscription.value) {
      return { allowed: true, limit: null, remaining: null }
    }
    const limit = getLimit(limitKey)
    if (limit === null) return { allowed: true, limit: null, remaining: null }
    const remaining = Math.max(0, limit - currentCount)
    return {
      allowed: currentCount < limit,
      limit,
      remaining
    }
  }

  function isLimitError(error) {
    if (!error) return null
    const errorCode = error.error || error.code || error.key
    const limitErrors = ['goals_limit_exceeded', 'habits_limit_exceeded', 'rewards_limit_exceeded']
    if (limitErrors.includes(errorCode)) {
      return {
        type: errorCode,
        message: error.message || 'Достигнут лимит для вашего тарифа',
        currentCount: error.current_count,
        limit: error.limit,
        tariffCode: error.tariff_code
      }
    }
    return null
  }

  async function loadSubscription(force = false) {
    if (loading.value) {
      return new Promise(resolve => {
        const check = setInterval(() => {
          if (!loading.value) {
            clearInterval(check)
            resolve()
          }
        }, 50)
      })
    }

    loading.value = true

    try {
      const result = await getSubscription()

      if (result.status === 'ok' && result.data) {
        subscription.value = result.data.subscription
        activePromocode.value = result.data.active_promocode || null
        lastRefreshTime.value = Date.now()

        if (DEBUG_MODE) {
          console.log('[Subscription] Loaded:', {
            status: subscription.value?.effective_status,
            tariff: subscription.value?.effective_tariff?.code,
            isTrial: subscription.value?.is_trial,
            isTrialExpired: subscription.value?.is_trial_expired,
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
  
  async function refreshSubscriptionThrottled() {
    const now = Date.now()
    if (now - lastRefreshTime.value < REFRESH_THROTTLE_MS) {
      if (DEBUG_MODE) {
        console.log('[Subscription] Refresh throttled, skipping')
      }
      return false
    }
    
    await loadSubscription(true)
    return true
  }
  
  async function verifyFeatureAccess(featureId) {
    const cachedAccess = hasFeature(featureId)
    
    if (!cachedAccess) {
      await refreshSubscriptionThrottled()
      return hasFeature(featureId)
    }
    
    return true
  }
  
  async function verifyAIAccess() {
    const cachedAccess = hasAIAccess()
    
    if (!cachedAccess) {
      await refreshSubscriptionThrottled()
      return hasAIAccess()
    }
    
    return true
  }
  
  async function verifyLimit(limitKey, currentCount) {
    const cachedCheck = checkLimit(limitKey, currentCount)
    
    if (!cachedCheck.allowed) {
      await refreshSubscriptionThrottled()
      return checkLimit(limitKey, currentCount)
    }
    
    return cachedCheck
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

  function setShouldShowTrialExpiredModal(value) {
    if (subscription.value) {
      subscription.value.should_show_trial_expired_modal = value
    }
  }

  function setShouldShowPaidExpiredModal(value) {
    if (subscription.value) {
      subscription.value.should_show_paid_expired_modal = value
    }
  }

  async function markModalAsShown(modalType) {
    try {
      const result = await apiMarkModalShown(modalType)
      
      if (result.status === 'ok') {
        if (modalType === 'trial_expired') {
          setShouldShowTrialExpiredModal(false)
        } else if (modalType === 'paid_expired') {
          setShouldShowPaidExpiredModal(false)
        }
        
        if (DEBUG_MODE) {
          console.log('[Subscription] Modal marked as shown:', modalType)
        }
        
        return { success: true }
      }
      
      return { success: false, error: result.error_message || 'Ошибка' }
    } catch (error) {
      if (DEBUG_MODE) {
        console.error('[Subscription] Mark modal shown error:', error)
      }
      return { success: false, error: 'Ошибка при отметке модалки' }
    }
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
    isPaidExpired,
    daysRemaining,
    canUpgrade,
    canProlong,
    isFree,
    isBasic,
    isPro,
    shouldShowTrialExpiredModal,
    shouldShowPaidExpiredModal,
    subscriptionState,

    hasFeature,
    hasAIAccess,
    getLimit,
    checkLimit,
    isLimitError,

    loadSubscription,
    refreshSubscriptionThrottled,
    verifyFeatureAccess,
    verifyAIAccess,
    verifyLimit,
    loadTariffs,
    activatePromocode,
    calculatePayment,
    createPayment,
    loadPaymentHistory,
    getTariffById,
    getTermById,
    getHitTerm,
    setShouldShowTrialExpiredModal,
    setShouldShowPaidExpiredModal,
    markModalAsShown,
    reset
  }
})
