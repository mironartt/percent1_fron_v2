<template>
  <div class="subscription-container">
    <header class="page-header centered">
      <h1>Выберите тариф</h1>
      <p class="subtitle">Выберите план, который подходит именно вам</p>
    </header>

    <div class="current-plan-block">
      <div class="current-plan-info">
        <div class="current-plan-header">
          <span class="current-plan-label">Текущий тариф</span>
          <div :class="['plan-status-badge', subscriptionStore.effectiveStatus]">
            <Clock v-if="subscriptionStore.isTrial" :size="14" />
            <Check v-else-if="subscriptionStore.isPaid" :size="14" />
            <AlertCircle v-else-if="subscriptionStore.isTrialExpired" :size="14" />
            {{ statusLabel }}
          </div>
        </div>
        <div class="current-plan-name">{{ currentTariffName }}</div>
        <p class="current-plan-details">{{ planDetails }}</p>
      </div>
      <div v-if="nextBillingDate" class="next-billing">
        <span class="next-billing-label">Следующее списание</span>
        <span class="next-billing-date">{{ nextBillingDate }}</span>
      </div>
    </div>

    <div v-if="activePromocode" class="promocode-active">
      <Tag :size="18" />
      <div class="promocode-info">
        <span class="promocode-label">Активный промокод</span>
        <span class="promocode-code">{{ activePromocode.code }}</span>
        <span class="promocode-discount">
          {{ activePromocode.discount_type === 'percent' ? `-${activePromocode.discount_value}%` : `-${activePromocode.discount_value}₽` }}
        </span>
      </div>
    </div>

    <div class="promocode-input-section">
      <div class="promocode-form">
        <input 
          v-model="promocodeInput"
          type="text"
          placeholder="Введите промокод"
          class="promocode-input"
          :disabled="promocodeLoading"
        />
        <button 
          class="btn btn-secondary"
          @click="applyPromocode"
          :disabled="!promocodeInput.trim() || promocodeLoading"
        >
          {{ promocodeLoading ? 'Применяем...' : 'Применить' }}
        </button>
      </div>
      <p v-if="promocodeError" class="promocode-error">{{ promocodeError }}</p>
      <p v-if="promocodeSuccess" class="promocode-success">{{ promocodeSuccess }}</p>
    </div>

    <div v-if="terms.length > 0" class="period-selector">
      <button 
        v-for="term in terms" 
        :key="term.id"
        :class="['period-btn', { active: selectedTerm?.id === term.id, hit: term.is_hit }]"
        @click="selectTerm(term.id)"
      >
        <span class="period-name">{{ term.title }}</span>
        <span v-if="term.discount > 0" class="period-discount">-{{ term.discount }}%</span>
        <span v-if="term.is_hit" class="best-value-badge">Хит</span>
      </button>
    </div>

    <div v-if="subscriptionStore.tariffsLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка тарифов...</p>
    </div>

    <div v-else class="plans-grid">
      <div 
        v-for="(tariff, index) in tariffs" 
        :key="tariff.id"
        :class="['plan-card', getTariffClass(tariff, index)]"
      >
        <div v-if="index === 1" class="popular-badge">Популярный выбор</div>
        <div v-if="tariff.code === 'coming_soon'" class="coming-soon-badge">Скоро</div>
        
        <div class="plan-header">
          <h3 class="plan-name">{{ tariff.title }}</h3>
          <div class="plan-price">
            <span class="price-value">{{ formatPrice(getTariffPrice(tariff)) }} ₽</span>
            <span class="price-period">{{ getPriceLabel(tariff) }}</span>
          </div>
          <div v-if="getTariffSavings(tariff) > 0" class="savings">
            Экономия {{ formatPrice(getTariffSavings(tariff)) }} ₽
          </div>
        </div>
        
        <p v-if="tariff.description" class="plan-description">{{ tariff.description }}</p>
        
        <ul class="plan-features">
          <li 
            v-for="item in getSortedFeatureItems(tariff)" 
            :key="item.id"
          >
            <Check :size="16" class="feature-icon included" />
            {{ item.text }}
          </li>
        </ul>
        
        <button 
          v-if="tariff.code === 'free'"
          class="btn btn-secondary btn-lg plan-btn"
          :disabled="isCurrentTariff(tariff)"
        >
          {{ isCurrentTariff(tariff) ? 'Текущий план' : 'Выбрать' }}
        </button>
        <button 
          v-else-if="tariff.code !== 'coming_soon'"
          :class="['btn', 'btn-lg', 'plan-btn', index === 1 ? 'btn-primary' : 'btn-secondary']"
          @click="selectTariff(tariff)"
          :disabled="paymentLoading"
        >
          {{ getButtonText(tariff) }}
        </button>
        <button 
          v-else
          class="btn btn-secondary btn-lg plan-btn"
          disabled
        >
          Скоро
        </button>
      </div>
    </div>

    <div class="guarantee">
      <Shield :size="20" />
      <p>Гарантия возврата денег в течение 7 дней. Без вопросов.</p>
    </div>

    <div class="billing-history-section">
      <h2 class="section-title">
        <Receipt :size="20" />
        История платежей
      </h2>
      <div v-if="paymentHistory.length > 0" class="billing-table-wrapper">
        <table class="billing-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Описание</th>
              <th>Сумма</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paymentHistory" :key="item.id">
              <td class="date-cell">{{ formatDate(item.date) }}</td>
              <td>{{ item.tariff }} ({{ item.term_months }} мес)</td>
              <td class="amount-cell">{{ formatPrice(item.amount) }} ₽</td>
              <td>
                <span :class="['payment-status', item.status]">
                  {{ getPaymentStatusLabel(item.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="no-billing-history">
        <Receipt :size="32" class="empty-icon" />
        <p>История платежей пуста</p>
        <span class="hint">Здесь будут отображаться ваши платежи после оформления подписки</span>
      </div>
    </div>

    <PaymentModal 
      v-if="showPaymentModal"
      :tariff="selectedTariff"
      :term="selectedTerm"
      @close="closePaymentModal"
      @payment-success="onPaymentSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Check, Clock, Shield, Receipt, Tag, AlertCircle } from 'lucide-vue-next'
import { useSubscriptionStore } from '@/stores/subscription'
import PaymentModal from '@/components/PaymentModal.vue'

const router = useRouter()
const subscriptionStore = useSubscriptionStore()

const promocodeInput = ref('')
const promocodeLoading = ref(false)
const promocodeError = ref('')
const promocodeSuccess = ref('')
const selectedTermId = ref(null)
const showPaymentModal = ref(false)
const selectedTariff = ref(null)
const paymentLoading = ref(false)

const tariffs = computed(() => subscriptionStore.tariffs)
const terms = computed(() => subscriptionStore.terms)
const paymentHistory = computed(() => subscriptionStore.paymentHistory)
const activePromocode = computed(() => subscriptionStore.activePromocode)

const selectedTerm = computed(() => {
  if (!terms.value.length) return null
  if (selectedTermId.value) {
    return terms.value.find(t => t.id === selectedTermId.value) || terms.value[0]
  }
  return terms.value.find(t => t.is_hit) || terms.value[0]
})

const currentTariffName = computed(() => {
  return subscriptionStore.subscription?.effective_tariff?.title || 'Бесплатный'
})

const statusLabel = computed(() => {
  if (subscriptionStore.isTrial) return 'Пробный период'
  if (subscriptionStore.isTrialExpired) return 'Триал истёк'
  if (subscriptionStore.isPaid) return 'Активна'
  return 'Бесплатный'
})

const planDetails = computed(() => {
  if (subscriptionStore.isTrial) {
    return `Осталось ${subscriptionStore.daysRemaining} дней бесплатного доступа ко всем функциям`
  }
  if (subscriptionStore.isTrialExpired) {
    return 'Пробный период закончился. Оформите подписку для доступа к Pro-функциям'
  }
  if (subscriptionStore.isPaid) {
    return `Подписка активна ещё ${subscriptionStore.daysRemaining} дней`
  }
  return 'Базовый функционал'
})

const nextBillingDate = computed(() => {
  const sub = subscriptionStore.subscription
  if (!sub) return null
  if (sub.paid_end) {
    return formatDate(sub.paid_end)
  }
  return null
})

function selectTerm(termId) {
  selectedTermId.value = termId
}

function getTariffClass(tariff, index) {
  if (tariff.code === 'coming_soon') return 'coming-soon'
  if (index === 1) return 'popular'
  if (index === 2) return 'pro-plus'
  if (tariff.code === 'free') return 'free'
  return ''
}

function getTariffPrice(tariff) {
  if (!tariff || tariff.code === 'free') return 0
  if (!selectedTerm.value || !tariff.terms) return tariff.price
  
  const term = tariff.terms.find(t => t.id === selectedTerm.value.id)
  if (!term) return tariff.price
  
  return term.final_price
}

function getTariffSavings(tariff) {
  if (!tariff || tariff.code === 'free' || !selectedTerm.value) return 0
  const term = tariff.terms?.find(t => t.id === selectedTerm.value.id)
  if (!term) return 0
  return parseFloat(term.savings) || 0
}

function getSortedFeatureItems(tariff) {
  if (!tariff?.feature_items?.length) return []
  return [...tariff.feature_items].sort((a, b) => a.sort_order - b.sort_order)
}

function getPriceLabel(tariff) {
  if (tariff.code === 'free') return 'навсегда'
  if (!selectedTerm.value) return '/ месяц'
  if (selectedTerm.value.months === 1) return '/ месяц'
  return `за ${selectedTerm.value.months} мес`
}

function isCurrentTariff(tariff) {
  return subscriptionStore.effectiveTariffCode === tariff.code
}

function getButtonText(tariff) {
  if (isCurrentTariff(tariff)) {
    return subscriptionStore.canProlong ? 'Продлить' : 'Текущий план'
  }
  return 'Выбрать'
}

function selectTariff(tariff) {
  if (!selectedTerm.value) return
  selectedTariff.value = tariff
  showPaymentModal.value = true
}

function closePaymentModal() {
  showPaymentModal.value = false
  selectedTariff.value = null
}

function onPaymentSuccess() {
  closePaymentModal()
  subscriptionStore.loadSubscription()
  subscriptionStore.loadPaymentHistory()
}

async function applyPromocode() {
  if (!promocodeInput.value.trim()) return
  
  promocodeLoading.value = true
  promocodeError.value = ''
  promocodeSuccess.value = ''
  
  const result = await subscriptionStore.activatePromocode(promocodeInput.value.trim())
  
  promocodeLoading.value = false
  
  if (result.success) {
    promocodeSuccess.value = `Промокод ${result.promocode.code} активирован!`
    promocodeInput.value = ''
  } else {
    promocodeError.value = result.error
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

function getPaymentStatusLabel(status) {
  const labels = {
    'done': 'Оплачено',
    'pending': 'Ожидает',
    'failed': 'Ошибка',
    'refunded': 'Возврат'
  }
  return labels[status] || status
}

onMounted(() => {
  subscriptionStore.loadSubscription()
  subscriptionStore.loadTariffs()
  subscriptionStore.loadPaymentHistory()
  
  if (terms.value.length > 0) {
    const hitTerm = terms.value.find(t => t.is_hit)
    if (hitTerm) {
      selectedTermId.value = hitTerm.id
    }
  }
})
</script>

<style scoped>
.subscription-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--container-padding);
}

.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.page-header.centered {
  flex-direction: column;
  text-align: center;
}

.page-header h1 {
  font-size: 1.75rem;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: var(--text-secondary);
  margin: 0;
}

.current-plan-block {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-color);
}

.current-plan-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.current-plan-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.plan-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
}

.plan-status-badge.trial {
  background: rgba(99, 102, 241, 0.15);
  color: var(--primary-color);
}

.plan-status-badge.active {
  background: rgba(34, 197, 94, 0.15);
  color: var(--success-color);
}

.plan-status-badge.expired {
  background: rgba(239, 68, 68, 0.15);
  color: var(--danger-color);
}

.current-plan-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.current-plan-details {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9375rem;
}

.next-billing {
  text-align: right;
}

.next-billing-label {
  display: block;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.next-billing-date {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.promocode-active {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
  color: var(--success-color);
}

.promocode-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.promocode-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.promocode-code {
  font-weight: 600;
}

.promocode-discount {
  background: var(--success-color);
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
}

.promocode-input-section {
  margin-bottom: 2rem;
}

.promocode-form {
  display: flex;
  gap: 0.75rem;
  max-width: 400px;
}

.promocode-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.promocode-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.promocode-error {
  color: var(--danger-color);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.promocode-success {
  color: var(--success-color);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.period-selector {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.period-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 1rem 1.5rem;
  background: var(--bg-secondary);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
}

.period-btn:hover {
  border-color: var(--border-color);
}

.period-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.period-btn.active .period-name {
  color: white;
}

.period-btn.active .period-discount {
  color: rgba(255, 255, 255, 0.9);
}

.period-name {
  font-weight: 600;
  font-size: 1rem;
}

.period-discount {
  font-size: 0.875rem;
  color: var(--success-color);
  font-weight: 600;
}

.best-value-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: linear-gradient(135deg, #d97706, #f59e0b);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.plan-card {
  position: relative;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.plan-card.popular {
  border-color: var(--primary-color);
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.2);
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary-color);
  color: white;
  padding: 0.375rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.coming-soon-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  padding: 0.375rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  border: 1px solid var(--border-color);
}

.plan-card.coming-soon {
  opacity: 0.7;
}

.plan-header {
  text-align: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.plan-name {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
}

.plan-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.5rem;
}

.price-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.price-period {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.savings {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--success-color);
  font-weight: 600;
}

.plan-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 1rem;
  text-align: center;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem;
  flex: 1;
}

.plan-features li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.625rem 0;
  font-size: 0.9375rem;
  line-height: 1.4;
}

.feature-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.feature-icon.included {
  color: var(--success-color);
}

.plan-btn {
  width: 100%;
  margin-top: auto;
}

.plan-card.free .plan-btn:disabled {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: default;
}

.guarantee {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
}

.guarantee svg {
  color: var(--success-color);
  flex-shrink: 0;
}

.guarantee p {
  margin: 0;
  font-size: 0.9375rem;
}

.billing-history-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
}

.section-title svg {
  color: var(--text-secondary);
}

.billing-table-wrapper {
  overflow-x: auto;
}

.billing-table {
  width: 100%;
  border-collapse: collapse;
}

.billing-table th,
.billing-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.billing-table th {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-secondary);
  background: var(--bg-secondary);
}

.billing-table td {
  font-size: 0.9375rem;
}

.date-cell {
  white-space: nowrap;
  color: var(--text-secondary);
}

.amount-cell {
  font-weight: 600;
}

.payment-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
}

.payment-status.done {
  background: rgba(34, 197, 94, 0.15);
  color: var(--success-color);
}

.payment-status.pending {
  background: rgba(99, 102, 241, 0.15);
  color: var(--primary-color);
}

.payment-status.failed {
  background: rgba(239, 68, 68, 0.15);
  color: var(--danger-color);
}

.payment-status.refunded {
  background: rgba(249, 115, 22, 0.15);
  color: #f97316;
}

.no-billing-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  text-align: center;
}

.no-billing-history .empty-icon {
  color: var(--text-tertiary);
  margin-bottom: 1rem;
}

.no-billing-history p {
  margin: 0 0 0.5rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.no-billing-history .hint {
  font-size: 0.875rem;
  color: var(--text-tertiary);
}

@media (max-width: 768px) {
  .current-plan-block {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .next-billing {
    text-align: center;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
    width: 100%;
  }
  
  .promocode-form {
    flex-direction: column;
    max-width: 100%;
  }
  
  .billing-table th,
  .billing-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.875rem;
  }
  
  .period-selector {
    gap: 0.5rem;
  }
  
  .period-btn {
    padding: 0.75rem 1rem;
    min-width: 75px;
  }
  
  .plans-grid {
    grid-template-columns: 1fr;
  }
  
  .plan-card {
    padding: 1.5rem;
  }
}
</style>
