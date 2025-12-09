<template>
  <div class="profile-page">
    <header class="page-header">
      <h1 class="page-title">Достижения</h1>
      <p class="page-subtitle">Ваш прогресс и награды</p>
    </header>

    <div class="progress-card section-card">
      <div class="progress-card-header">
        <div class="progress-title">
          <Trophy :size="18" :stroke-width="1.5" class="progress-icon" />
          <span>Мой прогресс</span>
        </div>
        <div class="xp-display">
          <Sparkles :size="18" :stroke-width="1.5" class="xp-icon" />
          <span class="xp-value">{{ xpBalance }}</span>
          <span class="xp-label">XP</span>
        </div>
      </div>
      <p class="progress-hint">Зарабатывайте XP за привычки, задачи и дневник. Обменивайте на награды из списка желаний.</p>
      <div class="progress-stats">
        <div class="progress-stat">
          <span class="progress-stat-value">{{ todayXP }}</span>
          <span class="progress-stat-label">сегодня</span>
        </div>
        <div class="progress-stat">
          <span class="progress-stat-value">{{ weekXP }}</span>
          <span class="progress-stat-label">за неделю</span>
        </div>
        <div class="progress-stat">
          <span class="progress-stat-value">{{ lifetimeEarned }}</span>
          <span class="progress-stat-label">всего заработано</span>
        </div>
      </div>
      <div class="next-reward-compact" v-if="nextReward">
        <div class="next-reward-info">
          <span class="next-reward-icon">{{ nextReward.icon }}</span>
          <span class="next-reward-name">{{ nextReward.name }}</span>
        </div>
        <div class="next-reward-progress">
          <div class="progress-bar-mini">
            <div 
              class="progress-fill-mini"
              :style="{ width: nextRewardProgress + '%' }"
            />
          </div>
          <span class="next-reward-xp">{{ xpToNextReward }} XP до награды</span>
        </div>
      </div>
    </div>

    <div class="profile-content">

      <RewardWishlist />

      <div class="xp-history" :class="{ collapsed: !historyExpanded }">
        <button class="history-header" @click="toggleHistory">
          <div class="history-title">
            <History :size="18" :stroke-width="1.5" />
            <span>История XP</span>
          </div>
          <div class="history-summary" v-if="!historyExpanded && todayXP > 0">
            <span class="summary-text">Сегодня +{{ todayXP }} XP</span>
          </div>
          <ChevronDown :size="18" :stroke-width="1.5" class="expand-icon" />
        </button>
        <div class="history-content" v-show="historyExpanded">
          <div v-if="historyLoading" class="loading-history">
            <Loader2 :size="20" class="spinner" />
            <span>Загрузка истории...</span>
          </div>
          <div v-else-if="xpHistoryGroups.length === 0" class="empty-history">
            <p>Начните выполнять задачи и привычки, чтобы получать XP</p>
          </div>
          <div v-else class="history-list">
            <div 
              v-for="dayGroup in xpHistoryGroups" 
              :key="dayGroup.date"
              class="history-day"
            >
              <div class="day-header">
                <span class="day-date">{{ formatDayDate(dayGroup.date) }}</span>
                <span class="day-summary">
                  <span v-if="dayGroup.total_earned > 0" class="day-earned">+{{ dayGroup.total_earned }}</span>
                  <span v-if="dayGroup.total_spent > 0" class="day-spent">-{{ dayGroup.total_spent }}</span>
                </span>
              </div>
              <div 
                v-for="group in dayGroup.groups" 
                :key="group.group_type"
                class="history-group"
              >
                <div class="group-header">
                  <div class="history-icon" :class="getGroupClass(group.group_type)">
                    <component :is="getGroupIcon(group.group_type)" :size="14" :stroke-width="1.5" />
                  </div>
                  <span class="group-label">{{ group.group_type_display }}</span>
                  <span class="group-amount" :class="{ negative: group.total_amount < 0 }">
                    {{ group.total_amount > 0 ? '+' : '' }}{{ group.total_amount }} XP
                  </span>
                </div>
                <div v-if="group.group_type === 'reward_redeemed'" class="group-items">
                  <div 
                    v-for="item in group.items" 
                    :key="item.transaction_id"
                    class="reward-item"
                  >
                    <span class="reward-item-name">{{ item.reward_name }}</span>
                    <span class="reward-item-amount">{{ item.amount }} XP</span>
                  </div>
                </div>
              </div>
            </div>
            <button 
              v-if="historyPage < historyTotalPages"
              class="load-more-btn"
              @click="loadMoreHistory"
              :disabled="historyLoading"
            >
              Загрузить ещё
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import { useXpStore } from '../stores/xp'
import RewardWishlist from '../components/RewardWishlist.vue'
import { 
  Sparkles, 
  Flame, 
  BookOpen, 
  Trophy,
  History,
  Zap,
  Star,
  ChevronDown,
  CheckCircle,
  Gift,
  AlertCircle,
  Loader2
} from 'lucide-vue-next'

const historyExpanded = ref(false)

const appStore = useAppStore()
const xpStore = useXpStore()

const xpBalance = computed(() => xpStore.xpBalance)
const lifetimeEarned = computed(() => xpStore.lifetimeEarned)
const todayXP = computed(() => xpStore.todayXP)
const weekXP = computed(() => xpStore.weekXP)
const nextReward = computed(() => xpStore.nextReward)
const xpToNextReward = computed(() => xpStore.xpToNextReward)
const xpHistoryGroups = computed(() => xpStore.xpHistoryGroups)
const historyLoading = computed(() => xpStore.historyLoading)
const historyPage = computed(() => xpStore.historyPage)
const historyTotalPages = computed(() => xpStore.historyTotalPages)

const nextRewardProgress = computed(() => {
  if (!nextReward.value) return 0
  return ((xpBalance.value / nextReward.value.cost) * 100).toFixed(0)
})

onMounted(async () => {
  await xpStore.fetchXPStats()
})

async function toggleHistory() {
  historyExpanded.value = !historyExpanded.value
  if (historyExpanded.value && xpHistoryGroups.value.length === 0) {
    await xpStore.fetchXPHistory({ page: 1, page_size: 10 })
  }
}

async function loadMoreHistory() {
  await xpStore.loadMoreHistory()
}

function formatDayDate(dateStr) {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return 'Сегодня'
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Вчера'
  }
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

function getGroupClass(groupType) {
  switch (groupType) {
    case 'habit_completed': return 'habit'
    case 'habit_penalty': return 'penalty'
    case 'journal_entry': return 'journal'
    case 'journal_penalty': return 'penalty'
    case 'planning_penalty': return 'penalty'
    case 'goal_step_completed': return 'step'
    case 'goal_completed': return 'goal'
    case 'reward_redeemed': return 'reward'
    case 'achievement_bonus': return 'achievement'
    default: return 'other'
  }
}

function getGroupIcon(groupType) {
  switch (groupType) {
    case 'habit_completed': return Flame
    case 'habit_penalty': return AlertCircle
    case 'journal_entry': return BookOpen
    case 'journal_penalty': return AlertCircle
    case 'planning_penalty': return AlertCircle
    case 'goal_step_completed': return Zap
    case 'goal_completed': return Star
    case 'reward_redeemed': return Gift
    case 'achievement_bonus': return Trophy
    default: return Sparkles
  }
}
</script>

<style scoped>
.profile-page {
  max-width: var(--content-width-narrow);
  width: 100%;
  margin: 0 auto;
  padding: var(--container-padding);
  box-sizing: border-box;
}

.page-header {
  text-align: center;
  margin-bottom: 1rem;
  width: 100%;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
}

.page-subtitle {
  color: var(--text-secondary);
  margin: 0 auto;
  font-size: 0.9rem;
  text-align: center;
  display: block;
  width: 100%;
}

.progress-card {
  margin-bottom: 1rem;
  padding: 1rem;
}

.progress-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.progress-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
}

.progress-icon {
  color: var(--status-purple-text);
}

.xp-icon {
  color: var(--secondary-color);
}

.progress-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  text-align: center;
}

.progress-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.progress-stat {
  flex: 1;
  text-align: center;
}

.progress-stat-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
}

.progress-stat-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
}

.next-reward-compact {
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
}

.next-reward-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.next-reward-icon {
  font-size: 1.25rem;
}

.next-reward-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

.next-reward-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar-mini {
  flex: 1;
  height: 6px;
  background: var(--status-purple-bg);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill-mini {
  height: 100%;
  background: linear-gradient(90deg, var(--status-purple-text), var(--status-info-text));
  border-radius: 3px;
  transition: width 0.4s ease;
}

.next-reward-xp {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.xp-display {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.xp-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
}

.xp-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--secondary-color);
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.xp-history {
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.history-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s ease;
}

.history-header:hover {
  background: var(--bg-secondary);
}

.history-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.history-title svg {
  color: var(--primary-color);
}

.history-summary {
  flex: 1;
  text-align: right;
}

.summary-text {
  font-size: 0.85rem;
  color: var(--success-color);
  font-weight: 500;
}

.expand-icon {
  color: var(--text-muted);
  transition: transform 0.2s ease;
}

.xp-history:not(.collapsed) .expand-icon {
  transform: rotate(180deg);
}

.history-content {
  padding: 0 1.25rem 1.25rem;
}

.loading-history {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem;
  color: var(--text-secondary);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-history {
  text-align: center;
  padding: 1.5rem;
  color: var(--text-muted);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-day {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.day-date {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.day-summary {
  display: flex;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
}

.day-earned {
  color: var(--success-color);
}

.day-spent {
  color: #ef4444;
}

.history-group {
  padding: 0.5rem 0;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.history-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-icon.habit {
  background: var(--status-warning-bg);
  color: var(--status-warning-text);
}

.history-icon.penalty {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.history-icon.journal {
  background: var(--status-info-bg);
  color: var(--status-info-text);
}

.history-icon.step {
  background: var(--status-warning-bg);
  color: var(--status-warning-text);
}

.history-icon.goal {
  background: var(--status-purple-bg);
  color: var(--status-purple-text);
}

.history-icon.reward {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}

.history-icon.achievement {
  background: var(--status-success-bg);
  color: var(--status-success-text);
}

.history-icon.other {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.group-label {
  flex: 1;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.group-amount {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--success-color);
}

.group-amount.negative {
  color: #ef4444;
}

.group-items {
  margin-left: 2.5rem;
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.reward-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.reward-item-amount {
  color: #ef4444;
}

.load-more-btn {
  width: 100%;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-more-btn:hover:not(:disabled) {
  background: var(--bg-tertiary);
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
