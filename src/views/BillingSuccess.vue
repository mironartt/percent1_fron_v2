<template>
  <div class="billing-success-page">
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Загружаем детали платежа...</p>
    </div>
    
    <div v-else class="success-content">
      <div class="success-card">
        <div class="success-icon">
          <CheckCircle :size="64" />
        </div>
        <h1>Оплата прошла успешно!</h1>
        <p class="success-message">
          Спасибо за оформление подписки. Ваш аккаунт уже активирован с полным доступом ко всем функциям.
        </p>
        
        <div v-if="paymentDetails" class="payment-details">
          <div class="detail-row">
            <span class="detail-label">Тариф</span>
            <span class="detail-value">{{ paymentDetails.tariff?.title }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Период</span>
            <span class="detail-value">{{ paymentDetails.term_title }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Сумма</span>
            <span class="detail-value amount">{{ formatAmount(paymentDetails.amount) }} ₽</span>
          </div>
          <div v-if="paymentDetails.discount_total > 0" class="detail-row discount">
            <span class="detail-label">Скидка</span>
            <span class="detail-value">-{{ formatAmount(paymentDetails.discount_total) }} ₽</span>
          </div>
          <div v-if="paymentDetails.promocode_used" class="detail-row">
            <span class="detail-label">Промокод</span>
            <span class="detail-value promocode">{{ paymentDetails.promocode_used }}</span>
          </div>
          <div class="detail-row highlight">
            <span class="detail-label">Подписка активна до</span>
            <span class="detail-value">{{ formatDate(paymentDetails.subscription_end) }}</span>
          </div>
        </div>
        
        <div class="success-actions">
          <router-link to="/app" class="btn btn-primary btn-lg">
            Перейти в приложение
          </router-link>
          <router-link to="/app/subscription" class="btn btn-secondary">
            Посмотреть подписку
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { CheckCircle } from 'lucide-vue-next'
import { useSubscriptionStore } from '@/stores/subscription'
import { getPaymentDetails } from '@/services/billing'

const route = useRoute()
const subscriptionStore = useSubscriptionStore()

const isLoading = ref(true)
const paymentDetails = ref(null)
const error = ref(null)

function formatAmount(amount) {
  if (!amount) return '0'
  return new Intl.NumberFormat('ru-RU').format(amount)
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

async function loadPaymentDetails() {
  const paymentId = route.query.payment_id
  
  if (!paymentId) {
    isLoading.value = false
    return
  }
  
  try {
    const result = await getPaymentDetails(parseInt(paymentId))
    
    if (result.status === 'ok' && result.data?.payment) {
      paymentDetails.value = result.data.payment
    }
  } catch (e) {
    console.error('[BillingSuccess] Error loading payment details:', e)
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadPaymentDetails()
  subscriptionStore.loadSubscription()
})
</script>

<style scoped>
.billing-success-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-container {
  text-align: center;
  color: var(--text-secondary);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.success-card {
  text-align: center;
  max-width: 480px;
  padding: 2.5rem;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.success-icon {
  color: var(--success-color);
  margin-bottom: 1.5rem;
}

.success-card h1 {
  font-size: 1.75rem;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.success-message {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.payment-details {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  margin-bottom: 2rem;
  text-align: left;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row.highlight {
  background: var(--primary-color-light, rgba(111, 66, 193, 0.1));
  margin: 0.5rem -1.25rem 0;
  padding: 0.75rem 1.25rem;
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  border-bottom: none;
}

.detail-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.detail-value {
  color: var(--text-primary);
  font-weight: 500;
}

.detail-value.amount {
  font-size: 1.1rem;
  color: var(--primary-color);
}

.detail-value.promocode {
  background: var(--success-color-light, rgba(34, 197, 94, 0.1));
  color: var(--success-color);
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
}

.detail-row.discount .detail-value {
  color: var(--success-color);
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-color-dark, #5a35a8);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1rem;
}

@media (max-width: 480px) {
  .success-card {
    padding: 1.5rem;
  }
  
  .success-card h1 {
    font-size: 1.5rem;
  }
  
  .payment-details {
    padding: 1rem;
  }
  
  .detail-row.highlight {
    margin: 0.5rem -1rem 0;
    padding: 0.75rem 1rem;
  }
}
</style>
