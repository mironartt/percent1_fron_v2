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
      <div class="stat-card">
        <div class="stat-icon">
          <TrendingUp :size="24" />
        </div>
        <div class="stat-value">{{ stats.activeReferrals }}</div>
        <div class="stat-label">Активных рефералов</div>
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
              <p>Вы получаете 20% от первой оплаты друга</p>
            </div>
          </div>
        </div>
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
            <div class="reward-percent">20%</div>
            <div class="reward-desc">
              <h4>От первой оплаты</h4>
              <p>Получайте 20% от первой оплаты каждого приглашённого друга</p>
            </div>
          </div>
          <div class="reward-item">
            <div class="reward-percent">10%</div>
            <div class="reward-desc">
              <h4>От продлений</h4>
              <p>Продолжайте получать 10% от всех последующих продлений</p>
            </div>
          </div>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { Users, Coins, TrendingUp, Link, Copy, HelpCircle, Gift, History } from 'lucide-vue-next'

const router = useRouter()
const store = useAppStore()

const stats = ref({
  invitedCount: 0,
  earnedAmount: 0,
  activeReferrals: 0
})

const copied = ref(false)

const referralCode = computed(() => {
  return store.user?.referral_code || 'demo123'
})

const referralLink = computed(() => {
  return `https://onepercent.app/ref/${referralCode.value}`
})

const referralHistory = ref([])

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
  grid-template-columns: repeat(3, 1fr);
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
