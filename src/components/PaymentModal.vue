<template>
  <Teleport to="body">
    <div class="payment-modal-overlay" @click.self="close">
      <div class="payment-modal">
        <button class="close-btn" @click="close">
          <X :size="20" />
        </button>
        
        <div class="modal-header">
          <h2>Оформление подписки</h2>
          <p class="modal-subtitle">{{ tariff?.title }} — {{ term?.title }}</p>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Расчёт стоимости...</p>
        </div>

        <div v-else-if="calculation" class="calculation-details">
          <div class="calc-row">
            <span class="calc-label">Тариф</span>
            <span class="calc-value">{{ calculation.tariff_title }}</span>
          </div>
          <div class="calc-row">
            <span class="calc-label">Период</span>
            <span class="calc-value">{{ calculation.term_months }} мес</span>
          </div>
          <div class="calc-row">
            <span class="calc-label">Базовая стоимость</span>
            <span class="calc-value">{{ formatPrice(calculation.total_price) }} ₽</span>
          </div>
          
          <div v-if="calculation.term_discount_value > 0" class="calc-row discount">
            <span class="calc-label">Скидка за период ({{ calculation.term_discount }}%)</span>
            <span class="calc-value">-{{ formatPrice(calculation.term_discount_value) }} ₽</span>
          </div>
          
          <div v-if="calculation.promocode_discount_value > 0" class="calc-row discount">
            <span class="calc-label">Скидка по промокоду ({{ calculation.promocode_discount }}%)</span>
            <span class="calc-value">-{{ formatPrice(calculation.promocode_discount_value) }} ₽</span>
          </div>
          
          <div v-if="calculation.unused_days_value > 0" class="calc-row discount">
            <span class="calc-label">Перерасчёт (неиспользованные дни)</span>
            <span class="calc-value">-{{ formatPrice(calculation.unused_days_value) }} ₽</span>
          </div>
          
          <div v-if="calculation.bonus_days > 0" class="calc-row bonus">
            <span class="calc-label">Бонусные дни</span>
            <span class="calc-value">+{{ calculation.bonus_days }} дней</span>
          </div>
          
          <div class="calc-total">
            <span class="total-label">К оплате</span>
            <span class="total-value">{{ formatPrice(calculation.final_price) }} ₽</span>
          </div>
          
          <div class="subscription-end">
            <Calendar :size="16" />
            <span>Подписка до {{ formatDate(calculation.date_finished) }}</span>
          </div>
        </div>

        <div v-if="error" class="error-message">
          <AlertCircle :size="18" />
          <span>{{ error }}</span>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="close" :disabled="paymentLoading">
            Отмена
          </button>
          <button 
            class="btn btn-primary"
            @click="proceedPayment"
            :disabled="!calculation || paymentLoading"
          >
            <CreditCard v-if="!paymentLoading" :size="18" />
            <span v-if="paymentLoading">Создаём платёж...</span>
            <span v-else>Оплатить {{ calculation ? formatPrice(calculation.final_price) + ' ₽' : '' }}</span>
          </button>
        </div>

        <div class="payment-info">
          <Shield :size="14" />
          <span>Безопасная оплата через Robokassa. Данные карты защищены.</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { X, Calendar, AlertCircle, CreditCard, Shield } from 'lucide-vue-next'
import { useSubscriptionStore } from '@/stores/subscription'

const props = defineProps({
  tariff: {
    type: Object,
    required: true
  },
  term: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'payment-success'])

const subscriptionStore = useSubscriptionStore()

const loading = ref(true)
const calculation = ref(null)
const error = ref('')
const paymentLoading = ref(false)

function close() {
  if (!paymentLoading.value) {
    emit('close')
  }
}

async function loadCalculation() {
  loading.value = true
  error.value = ''
  
  const result = await subscriptionStore.calculatePayment(props.tariff.id, props.term.id)
  
  loading.value = false
  
  if (result.success) {
    calculation.value = result.calculation
  } else {
    error.value = result.error
  }
}

async function proceedPayment() {
  if (!calculation.value) return
  
  paymentLoading.value = true
  error.value = ''
  
  const result = await subscriptionStore.createPayment(
    props.tariff.id,
    props.term.id,
    calculation.value.final_price
  )
  
  if (result.success) {
    window.location.href = result.paymentLink
  } else {
    paymentLoading.value = false
    error.value = result.error
  }
}

function formatPrice(price) {
  return Math.round(price).toLocaleString('ru-RU')
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

onMounted(() => {
  loadCalculation()
})
</script>

<style scoped>
.payment-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.payment-modal {
  position: relative;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 2rem;
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.modal-subtitle {
  color: var(--text-secondary);
  margin: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  gap: 1rem;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.calculation-details {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.calc-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 0.9375rem;
}

.calc-row.discount .calc-value {
  color: var(--success-color);
}

.calc-row.bonus .calc-value {
  color: var(--primary-color);
  font-weight: 600;
}

.calc-label {
  color: var(--text-secondary);
}

.calc-value {
  font-weight: 500;
}

.calc-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 2px solid var(--border-color);
}

.total-label {
  font-size: 1.125rem;
  font-weight: 600;
}

.total-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.subscription-end {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
  color: var(--danger-color);
  font-size: 0.9375rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
}

.modal-actions .btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.payment-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

@media (max-width: 480px) {
  .payment-modal {
    padding: 1.5rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>
