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
          <div :class="['plan-status-badge', currentPlan.status]">
            <Clock v-if="currentPlan.status === 'trial'" :size="14" />
            <Check v-else-if="currentPlan.status === 'active'" :size="14" />
            {{ currentPlan.statusLabel }}
          </div>
        </div>
        <div class="current-plan-name">{{ currentPlan.name }}</div>
        <p class="current-plan-details">{{ currentPlan.details }}</p>
      </div>
      <div v-if="currentPlan.nextBillingDate" class="next-billing">
        <span class="next-billing-label">Следующее списание</span>
        <span class="next-billing-date">{{ currentPlan.nextBillingDate }}</span>
      </div>
    </div>

    <div class="period-selector">
      <button 
        v-for="period in periods" 
        :key="period.months"
        :class="['period-btn', { active: selectedPeriod === period.months }]"
        @click="selectedPeriod = period.months"
      >
        <span class="period-name">{{ period.label }}</span>
        <span v-if="period.discount > 0" class="period-discount">-{{ period.discount }}%</span>
        <span v-if="period.months === 12" class="best-value-badge">Выгодно</span>
      </button>
    </div>

    <div class="plans-grid">
      <div class="plan-card free">
        <div class="plan-header">
          <h3 class="plan-name">Бесплатный</h3>
          <div class="plan-price">
            <span class="price-value">0 ₽</span>
            <span class="price-period">навсегда</span>
          </div>
        </div>
        <ul class="plan-features">
          <li><Check :size="16" class="feature-icon included" /> Колесо баланса (ССП)</li>
          <li><Check :size="16" class="feature-icon included" /> Банк целей (до 4 целей)</li>
          <li><Check :size="16" class="feature-icon included" /> Базовое планирование</li>
          <li><Check :size="16" class="feature-icon included" /> Трекер привычек (до 3)</li>
          <li><Check :size="16" class="feature-icon included" /> Дневник рефлексии</li>
          <li><Check :size="16" class="feature-icon included" /> Достижения (до 5)</li>
          <li><Check :size="16" class="feature-icon included" /> Напоминания в Telegram</li>
        </ul>
        <button class="btn btn-secondary btn-lg plan-btn">
          Текущий план
        </button>
      </div>

      <div class="plan-card pro popular">
        <div class="popular-badge">Популярный выбор</div>
        <div class="plan-header">
          <h3 class="plan-name">Pro</h3>
          <div class="plan-price">
            <span class="price-value">{{ formatPrice(proPrice) }} ₽</span>
            <span class="price-period">{{ priceLabel }}</span>
          </div>
          <div v-if="proSavings > 0" class="savings">
            Экономия {{ formatPrice(proSavings) }} ₽
          </div>
        </div>
        <ul class="plan-features">
          <li><Check :size="16" class="feature-icon included" /> Всё из Бесплатного плана</li>
          <li><Check :size="16" class="feature-icon included" /> Безлимитные цели и привычки</li>
          <li><Check :size="16" class="feature-icon included" /> AI ментор</li>
          <li><Check :size="16" class="feature-icon included" /> AI планирование</li>
          <li><Check :size="16" class="feature-icon included" /> AI помощь</li>
          <li><Check :size="16" class="feature-icon included" /> Голосовой чат с ментором в Telegram</li>
          <li><Check :size="16" class="feature-icon included" /> Клуб 1%</li>
        </ul>
        <button class="btn btn-primary btn-lg plan-btn">
          Выбрать Pro
        </button>
      </div>

      <div class="plan-card pro-plus coming-soon">
        <div class="coming-soon-badge">Скоро</div>
        <div class="plan-header">
          <h3 class="plan-name">Клуб 1%</h3>
          <div class="plan-price">
            <span class="price-value">{{ formatPrice(proPlusPrice) }} ₽</span>
            <span class="price-period">{{ priceLabel }}</span>
          </div>
          <div v-if="proPlusSavings > 0" class="savings">
            Экономия {{ formatPrice(proPlusSavings) }} ₽
          </div>
        </div>
        <ul class="plan-features">
          <li><Check :size="16" class="feature-icon included" /> Всё из Pro плана</li>
          <li><Check :size="16" class="feature-icon included" /> Еженедельные мастермайнды</li>
          <li><Check :size="16" class="feature-icon included" /> Групповые челленджи</li>
          <li><Check :size="16" class="feature-icon included" /> Ранний доступ к новым функциям</li>
          <li><Check :size="16" class="feature-icon included" /> Нетворкинг 2.0</li>
        </ul>
        <button class="btn btn-primary btn-lg plan-btn pro-plus-btn" disabled>
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
      <div v-if="billingHistory.length > 0" class="billing-table-wrapper">
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
            <tr v-for="item in billingHistory" :key="item.id">
              <td class="date-cell">{{ item.date }}</td>
              <td>{{ item.description }}</td>
              <td class="amount-cell">{{ formatPrice(item.amount) }} ₽</td>
              <td>
                <span :class="['payment-status', item.status]">
                  {{ item.statusLabel }}
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Check, X, Clock, Shield, Receipt } from 'lucide-vue-next'

const router = useRouter()

const currentPlan = ref({
  name: 'Бесплатный',
  status: 'trial',
  statusLabel: 'Пробный период',
  details: 'Осталось 7 дней бесплатного доступа ко всем функциям',
  nextBillingDate: null
})

const billingHistory = ref([])

const periods = [
  { months: 1, label: '1 мес', discount: 0 },
  { months: 3, label: '3 мес', discount: 10 },
  { months: 6, label: '6 мес', discount: 20 },
  { months: 12, label: '12 мес', discount: 30 }
]

const selectedPeriod = ref(12)

const baseProPrice = 990
const baseProPlusPrice = 2990

const currentDiscount = computed(() => {
  const period = periods.find(p => p.months === selectedPeriod.value)
  return period ? period.discount : 0
})

const proPrice = computed(() => {
  const fullPrice = baseProPrice * selectedPeriod.value
  const discount = currentDiscount.value / 100
  return Math.round(fullPrice * (1 - discount))
})

const proPlusPrice = computed(() => {
  const fullPrice = baseProPlusPrice * selectedPeriod.value
  const discount = currentDiscount.value / 100
  return Math.round(fullPrice * (1 - discount))
})

const proSavings = computed(() => {
  const fullPrice = baseProPrice * selectedPeriod.value
  return fullPrice - proPrice.value
})

const proPlusSavings = computed(() => {
  const fullPrice = baseProPlusPrice * selectedPeriod.value
  return proPlusPrice.value < fullPrice ? fullPrice - proPlusPrice.value : 0
})

const priceLabel = computed(() => {
  if (selectedPeriod.value === 1) return '/ месяц'
  return `за ${selectedPeriod.value} мес`
})

function formatPrice(price) {
  return price.toLocaleString('ru-RU')
}

function goBack() {
  router.push('/app/settings')
}
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

.btn-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-back:hover {
  background: var(--bg-tertiary);
}

.page-header h1 {
  font-size: 1.75rem;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: var(--text-secondary);
  margin: 0;
}

.current-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(99, 102, 241, 0.1);
  border-radius: var(--radius-md);
  margin-bottom: 2rem;
}

.current-status .status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
}

.current-status p {
  margin: 0;
  color: var(--text-secondary);
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
  background: rgba(99, 102, 241, 0.1);
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

.feature-icon.excluded {
  color: var(--text-tertiary);
}

.plan-features li:has(.excluded) {
  color: var(--text-tertiary);
}

.plan-btn {
  width: 100%;
  margin-top: auto;
}

.plan-card.free .plan-btn {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: default;
}

.plan-card.pro-plus .plan-name {
  background: linear-gradient(135deg, #d97706, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.pro-plus-btn {
  background: linear-gradient(135deg, #d97706, #f59e0b);
  border: none;
}

.pro-plus-btn:hover {
  background: linear-gradient(135deg, #b45309, #d97706);
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

.current-plan-block {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  margin-bottom: 2rem;
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

.plan-card.coming-soon .pro-plus-btn {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: not-allowed;
}

.plan-card.coming-soon .pro-plus-btn:hover {
  background: var(--bg-tertiary);
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

.payment-status.paid {
  background: rgba(34, 197, 94, 0.15);
  color: var(--success-color);
}

.payment-status.refunded {
  background: rgba(249, 115, 22, 0.15);
  color: #f97316;
}

.payment-status.pending {
  background: rgba(99, 102, 241, 0.15);
  color: var(--primary-color);
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
