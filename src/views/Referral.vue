<template>
  <div class="referral-container">
    <header class="page-header centered">
      <h1>Реферальная программа</h1>
      <p class="subtitle">Приглашайте друзей и зарабатывайте вместе</p>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <Users :size="24" />
        </div>
        <div class="stat-value">{{ stats.invitedCount }}</div>
        <div class="stat-label">Приглашено друзей</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <Coins :size="24" />
        </div>
        <div class="stat-value">{{ stats.earnedAmount }} ₽</div>
        <div class="stat-label">Заработано</div>
      </div>
    </div>

    <div class="card referral-link-card">
      <div class="card-header">
        <h3 class="card-title">
          <Link :size="18" class="card-icon" />
          Ваша реферальная ссылка
        </h3>
      </div>
      <div class="card-body">
        <div class="link-box">
          <input 
            type="text" 
            :value="referralLink" 
            readonly 
            class="link-input"
          />
          <button class="btn btn-primary copy-btn" @click="copyLink">
            <Copy :size="16" />
            {{ copied ? 'Скопировано!' : 'Копировать' }}
          </button>
        </div>
        <p class="link-hint">Поделитесь этой ссылкой с друзьями, и вы оба получите бонусы</p>
      </div>
    </div>

    <div class="card rewards-card">
      <div class="card-header">
        <h3 class="card-title">
          <Gift :size="18" class="card-icon" />
          Ваши награды
        </h3>
      </div>
      <div class="card-body">
        <div class="rewards-info">
          <div class="reward-item">
            <div class="reward-percent">30%</div>
            <div class="reward-desc">
              <h4>От первой оплаты</h4>
              <p>Получайте 30% от первой оплаты каждого приглашённого друга</p>
            </div>
          </div>
        </div>
        <div class="earnings-examples">
          <h4 class="examples-title">Примеры заработка</h4>
          <div class="examples-grid">
            <div class="example-card">
              <div class="example-plan">Pro</div>
              <div class="example-price">990 ₽/мес</div>
              <div class="example-earning">Вы получите <strong>297 ₽</strong></div>
            </div>
            <div class="example-card featured">
              <div class="example-plan">Клуб 1%</div>
              <div class="example-price">2 990 ₽/мес</div>
              <div class="example-earning">Вы получите <strong>897 ₽</strong></div>
            </div>
          </div>
          <p class="examples-hint">Пригласите 10 друзей на тариф Клуб 1% — заработайте 8 970 ₽</p>
        </div>
      </div>
    </div>

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

    <div class="card referrals-card">
      <div class="card-header">
        <h3 class="card-title">
          <Users :size="18" class="card-icon" />
          Мои рефералы
        </h3>
      </div>
      <div class="card-body">
        <div v-if="paginatedReferrals.length > 0" class="referrals-table-wrapper">
          <table class="referrals-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Тариф</th>
                <th>Ваш бонус</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="referral in paginatedReferrals" :key="referral.id">
                <td class="referral-email">{{ referral.email }}</td>
                <td>
                  <span :class="['plan-badge', `plan-${referral.plan}`]">
                    {{ getPlanName(referral.plan) }}
                  </span>
                </td>
                <td class="referral-bonus">+{{ referral.bonus }} ₽</td>
              </tr>
            </tbody>
          </table>
          
          <div v-if="totalPages > 1" class="pagination">
            <button 
              class="pagination-btn" 
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              ←
            </button>
            <span class="pagination-info">{{ currentPage }} из {{ totalPages }}</span>
            <button 
              class="pagination-btn" 
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >
              →
            </button>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>У вас пока нет рефералов. Поделитесь ссылкой с друзьями!</p>
        </div>
      </div>
    </div>

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
            <span class="balance-value">{{ stats.earnedAmount }} ₽</span>
          </div>
          <p class="withdrawal-hint">Минимальная сумма для вывода: 3 000 ₽</p>
          <button 
            class="btn btn-primary withdrawal-btn" 
            :disabled="stats.earnedAmount < 3000"
            @click="requestWithdrawal"
          >
            <Wallet :size="16" />
            Запросить вывод
          </button>
          <p v-if="stats.earnedAmount < 3000" class="withdrawal-warning">
            Для вывода необходимо накопить минимум 3 000 ₽
          </p>
        </div>
      </div>
    </div>

    <div v-if="referralHistory.length > 0" class="card history-card">
      <div class="card-header">
        <h3 class="card-title">
          <History :size="18" class="card-icon" />
          История начислений
        </h3>
      </div>
      <div class="card-body">
        <div class="history-list">
          <div 
            v-for="item in referralHistory" 
            :key="item.id"
            class="history-item"
          >
            <div class="history-info">
              <div class="history-name">{{ item.referralName }}</div>
              <div class="history-date">{{ formatDate(item.date) }}</div>
            </div>
            <div class="history-amount">+{{ item.amount }} ₽</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showWithdrawalModal" class="modal-overlay" @click.self="showWithdrawalModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Запрос на вывод</h3>
          <button class="modal-close" @click="showWithdrawalModal = false">×</button>
        </div>
        <div class="modal-body">
          <p>Ваша заявка на вывод {{ stats.earnedAmount }} ₽ отправлена!</p>
          <p class="modal-hint">Мы свяжемся с вами в течение 3 рабочих дней для уточнения реквизитов.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="showWithdrawalModal = false">Понятно</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { Users, Coins, Link, Copy, HelpCircle, Gift, History, Wallet } from 'lucide-vue-next'

const router = useRouter()
const store = useAppStore()

const ITEMS_PER_PAGE = 10

const stats = ref({
  invitedCount: 0,
  earnedAmount: 0
})

const copied = ref(false)
const currentPage = ref(1)
const showWithdrawalModal = ref(false)

const referrals = ref([])

const referralCode = computed(() => {
  return store.user?.referral_code || 'demo123'
})

const referralLink = computed(() => {
  return `https://onepercent.app/ref/${referralCode.value}`
})

const referralHistory = ref([])

const totalPages = computed(() => {
  return Math.ceil(referrals.value.length / ITEMS_PER_PAGE)
})

const paginatedReferrals = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  const end = start + ITEMS_PER_PAGE
  return referrals.value.slice(start, end)
})

function getPlanName(plan) {
  const plans = {
    free: 'Бесплатный',
    pro: 'Pro',
    club: 'Клуб 1%'
  }
  return plans[plan] || plan
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(referralLink.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

function requestWithdrawal() {
  if (stats.value.earnedAmount >= 3000) {
    showWithdrawalModal.value = true
  }
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

onMounted(() => {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: var(--primary-color);
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
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
  font-size: 0.9375rem;
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

.rewards-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.reward-item {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
}

.reward-percent {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  min-width: 60px;
}

.reward-desc h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
}

.reward-desc p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.earnings-examples {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.examples-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem;
  text-align: center;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.example-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 1rem;
  text-align: center;
}

.example-card.featured {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.example-plan {
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.example-price {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.example-earning {
  font-size: 0.875rem;
  color: var(--text-primary);
}

.example-earning strong {
  color: var(--success-color);
  font-weight: 700;
}

.examples-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-align: center;
  margin: 0;
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

.history-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.history-date {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.history-amount {
  font-weight: 600;
  color: var(--success-color);
}

.referrals-table-wrapper {
  overflow-x: auto;
}

.referrals-table {
  width: 100%;
  border-collapse: collapse;
}

.referrals-table th,
.referrals-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.referrals-table th {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.referrals-table tbody tr:last-child td {
  border-bottom: none;
}

.referral-email {
  font-weight: 500;
}

.referral-bonus {
  font-weight: 600;
  color: var(--success-color);
}

.plan-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.plan-free {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.plan-pro {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
}

.plan-club {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15));
  color: #7c3aed;
}

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

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

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
  color: var(--warning-color, #f59e0b);
  margin-top: 1rem;
  margin-bottom: 0;
}

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
  max-width: 400px;
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

.modal-body p {
  margin: 0 0 1rem;
}

.modal-body p:last-child {
  margin-bottom: 0;
}

.modal-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  text-align: right;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .link-box {
    flex-direction: column;
  }
  
  .copy-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
