<template>
  <div class="referral-container">
    <header class="page-header centered">
      <h1>Реферальная программа</h1>
      <p class="subtitle">Приглашайте друзей и зарабатывайте вместе</p>
    </header>

    <!-- Загрузка -->
    <div v-if="isLoading" class="loading-state">
      <Loader2 :size="32" class="spinner" />
      <p>Загрузка данных...</p>
    </div>

    <template v-else>
      <!-- Статистика -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <Users :size="24" />
          </div>
          <div class="stat-value">{{ stats.totalReferrals }}</div>
          <div class="stat-label">Приглашено друзей</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon paid">
            <UserCheck :size="24" />
          </div>
          <div class="stat-value">{{ stats.paidReferrals }}</div>
          <div class="stat-label">Оплатили подписку</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon earned">
            <Coins :size="24" />
          </div>
          <div class="stat-value">{{ formatMoney(stats.totalEarned) }} ₽</div>
          <div class="stat-label">Заработано всего</div>
        </div>
        <div class="stat-card highlight">
          <div class="stat-icon balance">
            <Wallet :size="24" />
          </div>
          <div class="stat-value">{{ formatMoney(stats.balance) }} ₽</div>
          <div class="stat-label">Доступно к выводу</div>
        </div>
      </div>

      <!-- Реферальная ссылка -->
      <div class="card referral-link-card">
        <div class="card-header">
          <h3 class="card-title">
            <Link :size="18" class="card-icon" />
            Ваша реферальная ссылка
          </h3>
        </div>
        <div class="card-body">
          <div class="link-tabs">
            <button 
              :class="['link-tab', { active: activeLinkType === 'direct' }]"
              @click="activeLinkType = 'direct'"
            >
              Прямая ссылка
            </button>
            <button 
              :class="['link-tab', { active: activeLinkType === 'query' }]"
              @click="activeLinkType = 'query'"
            >
              С параметром
            </button>
          </div>
          <div class="link-box">
            <input 
              type="text" 
              :value="currentLink" 
              readonly 
              class="link-input"
            />
            <button class="btn btn-primary copy-btn" @click="copyLink">
              <Copy :size="16" />
              {{ copied ? 'Скопировано!' : 'Копировать' }}
            </button>
          </div>
          <p class="link-hint">Поделитесь этой ссылкой с друзьями — вы получите 30% от их первой оплаты</p>
        </div>
      </div>

      <!-- Калькулятор дохода -->
      <div class="card calculator-card">
        <div class="card-header">
          <h3 class="card-title">
            <Calculator :size="18" class="card-icon" />
            Калькулятор дохода
          </h3>
        </div>
        <div class="card-body">
          <div v-if="calculator.length > 0" class="calculator-grid">
            <div 
              v-for="item in calculator" 
              :key="`${item.tariff_code}-${item.term_months}`"
              class="calculator-item"
              :class="{ featured: item.tariff_code === 'club' }"
            >
              <div class="calc-tariff">{{ item.tariff_title }}</div>
              <div class="calc-term">{{ item.term_title }}</div>
              <div class="calc-price">{{ formatMoney(item.payment_amount) }} ₽</div>
              <div class="calc-reward">
                <span class="reward-label">Ваш доход:</span>
                <span class="reward-value">+{{ formatMoney(item.reward_amount) }} ₽</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-calculator">
            <p>Данные калькулятора загружаются...</p>
          </div>
        </div>
      </div>

      <!-- Как это работает -->
      <div class="card how-it-works-card">
        <div class="card-header">
          <h3 class="card-title">
            <HelpCircle :size="18" class="card-icon" />
            Как это работает
          </h3>
        </div>
        <div class="card-body">
          <div class="steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>Поделитесь ссылкой</h4>
                <p>Отправьте свою реферальную ссылку друзьям</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>Друг регистрируется</h4>
                <p>Ваш друг создаёт аккаунт по вашей ссылке</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>Получаете награду</h4>
                <p>Вы получаете 30% от первой оплаты друга</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Мои рефералы -->
      <div class="card referrals-card">
        <div class="card-header">
          <h3 class="card-title">
            <Users :size="18" class="card-icon" />
            Мои рефералы
          </h3>
        </div>
        <div class="card-body">
          <div v-if="referrals.length > 0" class="referrals-table-wrapper">
            <table class="referrals-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Дата регистрации</th>
                  <th>Статус</th>
                  <th>Ваш бонус</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="referral in referrals" :key="referral.id">
                  <td class="referral-email">{{ referral.email_masked }}</td>
                  <td class="referral-date">{{ formatDate(referral.date_created) }}</td>
                  <td>
                    <span :class="['status-badge', referral.has_first_payment ? 'status-paid' : 'status-pending']">
                      {{ referral.has_first_payment ? 'Оплатил' : 'Ожидание оплаты' }}
                    </span>
                  </td>
                  <td class="referral-bonus">
                    <template v-if="referral.has_first_payment">
                      +{{ formatMoney(referral.first_payment_amount * 0.3) }} ₽
                    </template>
                    <template v-else>
                      <span class="pending-text">—</span>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <!-- Пагинация рефералов -->
            <div v-if="pagination.totalPages > 1" class="pagination">
              <button 
                class="pagination-btn" 
                :disabled="pagination.page === 1"
                @click="loadReferrals(pagination.page - 1)"
              >
                ←
              </button>
              <span class="pagination-info">{{ pagination.page }} из {{ pagination.totalPages }}</span>
              <button 
                class="pagination-btn" 
                :disabled="pagination.page === pagination.totalPages"
                @click="loadReferrals(pagination.page + 1)"
              >
                →
              </button>
            </div>
          </div>
          <div v-else class="empty-state">
            <Users :size="48" class="empty-icon" />
            <p>У вас пока нет рефералов</p>
            <p class="empty-hint">Поделитесь ссылкой с друзьями!</p>
          </div>
        </div>
      </div>

      <!-- Вывод средств -->
      <div class="card withdrawal-card">
        <div class="card-header">
          <h3 class="card-title">
            <Wallet :size="18" class="card-icon" />
            Вывод средств
          </h3>
        </div>
        <div class="card-body">
          <div class="withdrawal-info">
            <div class="balance-row">
              <span class="balance-label">Доступно к выводу:</span>
              <span class="balance-value">{{ formatMoney(stats.balance) }} ₽</span>
            </div>
            <div v-if="stats.pendingWithdrawals > 0" class="pending-row">
              <span class="pending-label">В обработке:</span>
              <span class="pending-value">{{ formatMoney(stats.pendingWithdrawals) }} ₽</span>
            </div>
            <p class="withdrawal-hint">Минимальная сумма для вывода: {{ formatMoney(stats.minWithdrawalAmount) }} ₽</p>
            <button 
              class="btn btn-primary withdrawal-btn" 
              :disabled="stats.balance < stats.minWithdrawalAmount || isWithdrawing"
              @click="openWithdrawalModal"
            >
              <Wallet :size="16" />
              Запросить вывод
            </button>
            <p v-if="stats.balance < stats.minWithdrawalAmount && stats.balance > 0" class="withdrawal-warning">
              Для вывода необходимо накопить минимум {{ formatMoney(stats.minWithdrawalAmount) }} ₽
            </p>
          </div>

          <!-- Список заявок на вывод -->
          <div v-if="withdrawals.length > 0" class="withdrawals-section">
            <h4 class="withdrawals-title">Мои заявки на вывод</h4>
            <div class="withdrawals-list">
              <div 
                v-for="withdrawal in withdrawals" 
                :key="withdrawal.id"
                class="withdrawal-item"
              >
                <div class="withdrawal-item-info">
                  <div class="withdrawal-amount">{{ formatMoney(withdrawal.amount) }} ₽</div>
                  <div class="withdrawal-date">{{ formatDateTime(withdrawal.date_created) }}</div>
                  <div v-if="withdrawal.comment" class="withdrawal-comment">{{ withdrawal.comment }}</div>
                </div>
                <div class="withdrawal-item-status">
                  <span :class="['withdrawal-status', `status-${withdrawal.status}`]">
                    {{ getWithdrawalStatusLabel(withdrawal.status) }}
                  </span>
                  <div v-if="withdrawal.admin_comment" class="admin-comment">
                    {{ withdrawal.admin_comment }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- История транзакций -->
      <div v-if="transactions.length > 0" class="card history-card">
        <div class="card-header">
          <h3 class="card-title">
            <History :size="18" class="card-icon" />
            История транзакций
          </h3>
          <div class="filter-tabs">
            <button 
              :class="['filter-tab', { active: transactionFilter === null }]"
              @click="loadTransactions(null)"
            >
              Все
            </button>
            <button 
              :class="['filter-tab', { active: transactionFilter === 'income' }]"
              @click="loadTransactions('income')"
            >
              Начисления
            </button>
            <button 
              :class="['filter-tab', { active: transactionFilter === 'withdrawal' }]"
              @click="loadTransactions('withdrawal')"
            >
              Выводы
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="history-list">
            <div 
              v-for="tx in transactions" 
              :key="tx.id"
              class="history-item"
              :class="{ 'history-withdrawal': tx.type === 'withdrawal' }"
            >
              <div class="history-info">
                <div class="history-type">
                  {{ tx.type === 'income' ? 'Начисление за реферала' : 'Вывод средств' }}
                </div>
                <div class="history-date">{{ formatDateTime(tx.date_created) }}</div>
              </div>
              <div :class="['history-amount', tx.type === 'income' ? 'amount-income' : 'amount-withdrawal']">
                {{ tx.type === 'income' ? '+' : '' }}{{ formatMoney(tx.amount) }} ₽
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Модал создания заявки на вывод -->
    <div v-if="showWithdrawalModal" class="modal-overlay" @click.self="closeWithdrawalModal">
      <div class="modal withdrawal-modal">
        <div class="modal-header">
          <h3>Запрос на вывод средств</h3>
          <button class="modal-close" @click="closeWithdrawalModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Сумма вывода</label>
            <div class="amount-input-wrapper">
              <input 
                type="number" 
                v-model.number="withdrawalForm.amount"
                :min="stats.minWithdrawalAmount"
                :max="stats.balance"
                class="amount-input"
                placeholder="3000"
              />
              <span class="amount-suffix">₽</span>
            </div>
            <div class="amount-hints">
              <span>Минимум: {{ formatMoney(stats.minWithdrawalAmount) }} ₽</span>
              <span>Доступно: {{ formatMoney(stats.balance) }} ₽</span>
            </div>
            <button 
              class="btn-max"
              @click="withdrawalForm.amount = stats.balance"
            >
              Вывести всё
            </button>
          </div>
          <div class="form-group">
            <label>Реквизиты для перевода</label>
            <textarea 
              v-model="withdrawalForm.comment"
              class="comment-input"
              placeholder="Например: Перевод на карту Сбербанка: 4276 1234 5678 9012"
              rows="3"
            ></textarea>
          </div>
          <p v-if="withdrawalError" class="withdrawal-error">{{ withdrawalError }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeWithdrawalModal">Отмена</button>
          <button 
            class="btn btn-primary" 
            :disabled="!isWithdrawalValid || isWithdrawing"
            @click="submitWithdrawal"
          >
            <Loader2 v-if="isWithdrawing" :size="16" class="spinner" />
            {{ isWithdrawing ? 'Отправка...' : 'Отправить заявку' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Модал успешной заявки -->
    <div v-if="showSuccessModal" class="modal-overlay" @click.self="showSuccessModal = false">
      <div class="modal success-modal">
        <div class="modal-body centered">
          <div class="success-icon">
            <CheckCircle :size="48" />
          </div>
          <h3>Заявка отправлена!</h3>
          <p>Ваша заявка на вывод {{ formatMoney(lastWithdrawalAmount) }} ₽ принята.</p>
          <p class="modal-hint">Мы обработаем её в течение 3 рабочих дней.</p>
        </div>
        <div class="modal-footer centered">
          <button class="btn btn-primary" @click="showSuccessModal = false">Понятно</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { SITE_DOMAIN, DEBUG_MODE } from '@/config/settings.js'
import { 
  getReferralData, 
  getReferralTransactions, 
  createReferralWithdrawal, 
  getReferralWithdrawals 
} from '@/services/api.js'
import { 
  Users, UserCheck, Coins, Link, Copy, HelpCircle, 
  History, Wallet, Calculator, Loader2, CheckCircle 
} from 'lucide-vue-next'

const router = useRouter()
const store = useAppStore()

// Состояние загрузки
const isLoading = ref(true)
const isWithdrawing = ref(false)

// Данные
const stats = ref({
  balance: 0,
  totalEarned: 0,
  totalReferrals: 0,
  paidReferrals: 0,
  pendingWithdrawals: 0,
  minWithdrawalAmount: 3000
})

const referralLinks = ref({
  direct: '',
  query: ''
})

const calculator = ref([])
const referrals = ref([])
const transactions = ref([])
const withdrawals = ref([])

const pagination = ref({
  page: 1,
  pageSize: 10,
  totalPages: 1,
  totalItems: 0
})

// UI состояние
const copied = ref(false)
const activeLinkType = ref('direct')
const transactionFilter = ref(null)
const showWithdrawalModal = ref(false)
const showSuccessModal = ref(false)
const withdrawalError = ref('')
const lastWithdrawalAmount = ref(0)

const withdrawalForm = ref({
  amount: 0,
  comment: ''
})

// Вычисляемые свойства
const currentLink = computed(() => {
  return activeLinkType.value === 'direct' 
    ? referralLinks.value.direct 
    : referralLinks.value.query
})

const isWithdrawalValid = computed(() => {
  const amount = withdrawalForm.value.amount
  return amount >= stats.value.minWithdrawalAmount && amount <= stats.value.balance
})

// Функции форматирования
function formatMoney(value) {
  if (value === null || value === undefined) return '0'
  const numValue = Number(value)
  if (isNaN(numValue)) return '0'
  return Number.isInteger(numValue) 
    ? numValue.toLocaleString('ru-RU')
    : numValue.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
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

function formatDateTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getWithdrawalStatusLabel(status) {
  const labels = {
    pending: 'Ожидает',
    approved: 'Одобрено',
    rejected: 'Отклонено',
    completed: 'Выполнено'
  }
  return labels[status] || status
}

// Копирование ссылки
async function copyLink() {
  try {
    await navigator.clipboard.writeText(currentLink.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// Загрузка данных
async function loadData() {
  isLoading.value = true
  try {
    const result = await getReferralData({ page: 1, page_size: 10 })
    
    if (result.status === 'ok' && result.data) {
      const data = result.data
      
      stats.value = {
        balance: data.balance || 0,
        totalEarned: data.total_earned || 0,
        totalReferrals: data.total_referrals || 0,
        paidReferrals: data.paid_referrals || 0,
        pendingWithdrawals: data.pending_withdrawals || 0,
        minWithdrawalAmount: data.min_withdrawal_amount || 3000
      }
      
      referralLinks.value = {
        direct: data.referral_links?.direct || `${SITE_DOMAIN}/ref/DEMO`,
        query: data.referral_links?.query || `${SITE_DOMAIN}/?ref=DEMO`
      }
      
      calculator.value = data.calculator || []
      referrals.value = data.referrals || []
      
      pagination.value = {
        page: data.page || 1,
        pageSize: data.page_size || 10,
        totalPages: data.total_pages || 1,
        totalItems: data.total_items || 0
      }
      
      if (DEBUG_MODE) {
        console.log('[Referral] Data loaded:', data)
      }
    }
    
    // Загружаем транзакции и заявки параллельно
    await Promise.all([
      loadTransactions(null),
      loadWithdrawals()
    ])
    
  } catch (error) {
    console.error('[Referral] Error loading data:', error)
  } finally {
    isLoading.value = false
  }
}

async function loadReferrals(page = 1) {
  try {
    const result = await getReferralData({ page, page_size: 10 })
    
    if (result.status === 'ok' && result.data) {
      referrals.value = result.data.referrals || []
      pagination.value = {
        page: result.data.page || 1,
        pageSize: result.data.page_size || 10,
        totalPages: result.data.total_pages || 1,
        totalItems: result.data.total_items || 0
      }
    }
  } catch (error) {
    console.error('[Referral] Error loading referrals:', error)
  }
}

async function loadTransactions(typeFilter) {
  transactionFilter.value = typeFilter
  try {
    const params = { page: 1, page_size: 50 }
    if (typeFilter) {
      params.type_filter = typeFilter
    }
    
    const result = await getReferralTransactions(params)
    
    if (result.status === 'ok' && result.data) {
      transactions.value = result.data.transactions || []
    }
  } catch (error) {
    console.error('[Referral] Error loading transactions:', error)
  }
}

async function loadWithdrawals() {
  try {
    const result = await getReferralWithdrawals({})
    
    if (result.status === 'ok' && result.data) {
      withdrawals.value = result.data.withdrawals || []
    }
  } catch (error) {
    console.error('[Referral] Error loading withdrawals:', error)
  }
}

// Модал вывода
function openWithdrawalModal() {
  withdrawalForm.value = {
    amount: stats.value.balance >= stats.value.minWithdrawalAmount ? stats.value.balance : stats.value.minWithdrawalAmount,
    comment: ''
  }
  withdrawalError.value = ''
  showWithdrawalModal.value = true
}

function closeWithdrawalModal() {
  showWithdrawalModal.value = false
  withdrawalError.value = ''
}

async function submitWithdrawal() {
  if (!isWithdrawalValid.value) return
  
  isWithdrawing.value = true
  withdrawalError.value = ''
  
  try {
    const result = await createReferralWithdrawal({
      amount: withdrawalForm.value.amount,
      comment: withdrawalForm.value.comment || null
    })
    
    if (result.status === 'ok') {
      lastWithdrawalAmount.value = withdrawalForm.value.amount
      
      // Обновляем баланс
      if (result.data?.new_balance !== undefined) {
        stats.value.balance = result.data.new_balance
      }
      
      closeWithdrawalModal()
      showSuccessModal.value = true
      
      // Перезагружаем данные
      await Promise.all([
        loadWithdrawals(),
        loadTransactions(transactionFilter.value)
      ])
    } else {
      const errorKey = result.error_data?.key
      if (errorKey === 'withdrawal_min_amount') {
        withdrawalError.value = `Минимальная сумма вывода: ${formatMoney(stats.value.minWithdrawalAmount)} ₽`
      } else if (errorKey === 'withdrawal_insufficient_balance') {
        withdrawalError.value = 'Недостаточно средств на балансе'
      } else {
        withdrawalError.value = result.error_data?.message || 'Произошла ошибка'
      }
    }
  } catch (error) {
    console.error('[Referral] Error creating withdrawal:', error)
    withdrawalError.value = 'Ошибка сети. Попробуйте позже.'
  } finally {
    isWithdrawing.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.referral-container {
  max-width: var(--content-width-narrow);
  margin: 0 auto;
  padding: var(--container-padding);
}

.page-header {
  margin-bottom: 2rem;
}

.page-header.centered {
  text-align: center;
}

.page-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-card.highlight {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05));
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.stat-icon {
  width: 44px;
  height: 44px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.75rem;
  color: var(--primary-color);
}

.stat-icon.paid {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.stat-icon.earned {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.stat-icon.balance {
  background: rgba(99, 102, 241, 0.15);
  color: var(--primary-color);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
}

.card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.card-icon {
  color: var(--primary-color);
}

.card-body {
  padding: 1.5rem;
}

/* Link tabs */
.link-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.link-tab {
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.link-tab.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.link-box {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.link-input {
  flex: 1;
  padding: 0.875rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--text-primary);
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.link-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Calculator */
.calculator-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.calculator-item {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 1rem;
  text-align: center;
}

.calculator-item.featured {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.calc-tariff {
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.calc-term {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.calc-price {
  font-size: 0.875rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.calc-reward {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.reward-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.reward-value {
  font-weight: 700;
  color: #10b981;
}

/* Steps */
.steps {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.step {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.step-number {
  width: 32px;
  height: 32px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
}

.step-content p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Referrals table */
.referrals-table-wrapper {
  overflow-x: auto;
}

.referrals-table {
  width: 100%;
  border-collapse: collapse;
}

.referrals-table th,
.referrals-table td {
  padding: 0.875rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.referrals-table th {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.8125rem;
}

.referrals-table tbody tr:last-child td {
  border-bottom: none;
}

.referral-email {
  font-weight: 500;
}

.referral-date {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.referral-bonus {
  font-weight: 600;
  color: #10b981;
}

.pending-text {
  color: var(--text-muted);
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-paid {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-pending {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-secondary);
}

.empty-icon {
  color: var(--border-color);
  margin-bottom: 1rem;
}

.empty-hint {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  margin-top: 1rem;
}

.pagination-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  background: white;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 1rem;
  color: var(--text-primary);
  transition: background 0.2s, border-color 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Withdrawal */
.withdrawal-info {
  text-align: center;
}

.balance-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.balance-label {
  color: var(--text-secondary);
}

.balance-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.pending-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.pending-label {
  color: var(--text-secondary);
}

.pending-value {
  color: #f59e0b;
  font-weight: 600;
}

.withdrawal-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.withdrawal-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.withdrawal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.withdrawal-warning {
  font-size: 0.875rem;
  color: #f59e0b;
  margin-top: 1rem;
  margin-bottom: 0;
}

/* Withdrawals list */
.withdrawals-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.withdrawals-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem;
  text-align: left;
}

.withdrawals-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.withdrawal-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  gap: 1rem;
}

.withdrawal-amount {
  font-weight: 600;
  font-size: 1.125rem;
}

.withdrawal-date {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.withdrawal-comment {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.withdrawal-item-status {
  text-align: right;
}

.withdrawal-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-pending {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.status-approved {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.status-rejected {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.status-completed {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.admin-comment {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

/* History / Transactions */
.filter-tabs {
  display: flex;
  gap: 0.5rem;
}

.filter-tab {
  padding: 0.375rem 0.75rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tab.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.history-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
}

.history-item:last-child {
  border-bottom: none;
}

.history-type {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.history-date {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.history-amount {
  font-weight: 600;
}

.amount-income {
  color: #10b981;
}

.amount-withdrawal {
  color: var(--text-primary);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: var(--radius-lg);
  max-width: 440px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  line-height: 1;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body.centered {
  text-align: center;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.modal-footer.centered {
  justify-content: center;
}

.modal-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Withdrawal form */
.form-group {
  margin-bottom: 1.25rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.amount-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.amount-input {
  width: 100%;
  padding: 0.875rem 2.5rem 0.875rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 1.25rem;
  font-weight: 600;
}

.amount-suffix {
  position: absolute;
  right: 1rem;
  color: var(--text-secondary);
  font-size: 1.125rem;
}

.amount-hints {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.btn-max {
  margin-top: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-max:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.comment-input {
  width: 100%;
  padding: 0.875rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  resize: vertical;
  font-family: inherit;
}

.withdrawal-error {
  color: #ef4444;
  font-size: 0.875rem;
  margin: 0;
}

/* Success modal */
.success-icon {
  color: #10b981;
  margin-bottom: 1rem;
}

.success-modal h3 {
  margin: 0 0 0.5rem;
}

.success-modal p {
  margin: 0 0 0.5rem;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .link-box {
    flex-direction: column;
  }
  
  .copy-btn {
    width: 100%;
    justify-content: center;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-tabs {
    width: 100%;
    overflow-x: auto;
  }
  
  .calculator-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .withdrawal-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .withdrawal-item-status {
    text-align: left;
    margin-top: 0.5rem;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .calculator-grid {
    grid-template-columns: 1fr;
  }
}
</style>
