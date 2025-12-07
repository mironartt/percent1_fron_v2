<template>
  <div class="profile-page">
    <header class="profile-header">
      <div class="header-main">
        <div class="user-info">
          <div class="avatar">
            <User :size="24" :stroke-width="1.5" />
          </div>
          <div class="user-details">
            <h1>{{ userName }}</h1>
          </div>
        </div>
        <div class="xp-display">
          <div class="xp-balance">
            <Sparkles :size="20" :stroke-width="1.5" />
            <span class="xp-value">{{ xpBalance }}</span>
            <span class="xp-label">XP</span>
          </div>
          <div class="xp-lifetime desktop-only">
            Всего заработано: {{ lifetimeEarned }} XP
          </div>
        </div>
      </div>
      <div class="header-reward" v-if="nextReward">
        <div class="reward-mini">
          <span class="reward-mini-icon">{{ nextReward.icon }}</span>
          <div class="reward-mini-progress">
            <div 
              class="reward-mini-fill"
              :style="{ width: nextRewardProgress + '%' }"
            />
          </div>
          <span class="reward-mini-text">{{ xpToNextReward }}</span>
        </div>
      </div>
    </header>

    <div class="profile-content">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon habits">
            <Flame :size="18" :stroke-width="1.5" />
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ habitStreak }}</span>
            <span class="stat-label">дней</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon journal">
            <BookOpen :size="18" :stroke-width="1.5" />
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ journalStreak }}</span>
            <span class="stat-label">записей</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon tasks">
            <CheckCircle :size="18" :stroke-width="1.5" />
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ todayXP }}</span>
            <span class="stat-label">сегодня</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon week">
            <TrendingUp :size="18" :stroke-width="1.5" />
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ weekXP }}</span>
            <span class="stat-label">неделя</span>
          </div>
        </div>
      </div>

      <div class="next-reward desktop-only" v-if="nextReward">
        <div class="next-reward-header">
          <Target :size="18" :stroke-width="1.5" />
          <span>Следующая награда</span>
        </div>
        <div class="next-reward-content">
          <span class="reward-icon">{{ nextReward.icon }}</span>
          <div class="reward-details">
            <span class="reward-name">{{ nextReward.name }}</span>
            <div class="reward-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  :style="{ width: nextRewardProgress + '%' }"
                />
              </div>
              <span class="progress-text">{{ xpToNextReward }} XP осталось</span>
            </div>
          </div>
        </div>
      </div>

      <RewardWishlist />

      <div class="xp-history" :class="{ collapsed: !historyExpanded }">
        <button class="history-header" @click="historyExpanded = !historyExpanded">
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
          <div v-if="recentHistory.length === 0" class="empty-history">
            <p>Начните выполнять задачи и привычки, чтобы получать XP</p>
          </div>
          <div v-else class="history-list">
            <div 
              v-for="entry in recentHistory" 
              :key="entry.id"
              class="history-item"
            >
              <div class="history-icon" :class="getSourceClass(entry.source)">
                <component :is="getSourceIcon(entry.source)" :size="14" :stroke-width="1.5" />
              </div>
              <div class="history-info">
                <span class="history-source">{{ getSourceLabel(entry.source) }}</span>
                <span class="history-meta" v-if="entry.metadata?.habitName">
                  {{ entry.metadata.habitName }}
                </span>
              </div>
              <span class="history-amount">+{{ entry.amount }} XP</span>
              <span class="history-time">{{ formatTime(entry.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'
import { useXpStore } from '../stores/xp'
import RewardWishlist from '../components/RewardWishlist.vue'
import { 
  User, 
  Sparkles, 
  Flame, 
  BookOpen, 
  CheckCircle, 
  TrendingUp,
  Target,
  History,
  Zap,
  Star,
  ChevronDown
} from 'lucide-vue-next'

const historyExpanded = ref(false)

const appStore = useAppStore()
const xpStore = useXpStore()

const userName = computed(() => appStore.displayName)
const userEmail = computed(() => appStore.user.email || 'user@example.com')
const xpBalance = computed(() => xpStore.xpBalance)
const lifetimeEarned = computed(() => xpStore.lifetimeEarned)
const habitStreak = computed(() => appStore.habitStreak)
const journalStreak = computed(() => appStore.journalStreak)
const todayXP = computed(() => xpStore.todayXP)
const weekXP = computed(() => xpStore.weekXP)
const nextReward = computed(() => xpStore.nextReward)
const xpToNextReward = computed(() => xpStore.xpToNextReward)

const nextRewardProgress = computed(() => {
  if (!nextReward.value) return 0
  return ((xpBalance.value / nextReward.value.cost) * 100).toFixed(0)
})

const recentHistory = computed(() => {
  return xpStore.xpHistory.slice(0, 10)
})

function getSourceClass(source) {
  switch (source) {
    case 'habit_completed': return 'habit'
    case 'focus_task_completed': return 'task'
    case 'goal_step_completed': return 'step'
    case 'goal_completed': return 'goal'
    case 'journal_entry': return 'journal'
    default: return 'other'
  }
}

function getSourceIcon(source) {
  switch (source) {
    case 'habit_completed': return Flame
    case 'focus_task_completed': return CheckCircle
    case 'goal_step_completed': return Zap
    case 'goal_completed': return Star
    case 'journal_entry': return BookOpen
    default: return Sparkles
  }
}

function getSourceLabel(source) {
  switch (source) {
    case 'habit_completed': return 'Привычка'
    case 'focus_task_completed': return 'Задача'
    case 'goal_step_completed': return 'Шаг цели'
    case 'goal_completed': return 'Цель выполнена'
    case 'journal_entry': return 'Дневник'
    default: return 'Действие'
  }
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return 'только что'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`
  
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
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

.profile-header {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
}

.header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.user-details h1 {
  font-size: 1.1rem;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin: 0.125rem 0 0 0;
}

.xp-display {
  text-align: right;
  flex-shrink: 0;
}

.xp-balance {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  justify-content: flex-end;
}

.xp-balance svg {
  color: #a855f7;
}

.xp-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #7c3aed;
}

.xp-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #a855f7;
}

.xp-lifetime {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.125rem;
}

.header-reward {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
}

.reward-mini {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reward-mini-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.reward-mini-progress {
  flex: 1;
  height: 6px;
  background: rgba(124, 58, 237, 0.15);
  border-radius: 3px;
  overflow: hidden;
}

.reward-mini-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #a855f7);
  border-radius: 3px;
  transition: width 0.4s ease;
}

.reward-mini-text {
  font-size: 0.8rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.desktop-only {
  display: block;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.stat-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 0.75rem 0.5rem;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.375rem;
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.habits {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
}

.stat-icon.journal {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.stat-icon.tasks {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.stat-icon.week {
  background: rgba(124, 58, 237, 0.1);
  color: #7c3aed;
}

.stat-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.65rem;
  color: var(--text-muted);
  line-height: 1.2;
}

.next-reward {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(168, 85, 247, 0.1));
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: 16px;
  padding: 1.25rem;
}

.next-reward-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #7c3aed;
  margin-bottom: 1rem;
}

.next-reward-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.reward-icon {
  font-size: 2.5rem;
}

.reward-details {
  flex: 1;
}

.reward-name {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.reward-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(124, 58, 237, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #a855f7);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 0.85rem;
  color: var(--text-muted);
  white-space: nowrap;
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
  color: #22c55e;
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

.empty-history {
  text-align: center;
  padding: 1.5rem;
  color: var(--text-muted);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 10px;
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
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
}

.history-icon.task {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.history-icon.step {
  background: rgba(234, 179, 8, 0.1);
  color: #eab308;
}

.history-icon.goal {
  background: rgba(124, 58, 237, 0.1);
  color: #7c3aed;
}

.history-icon.journal {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.history-icon.other {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-source {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
}

.history-meta {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-amount {
  font-weight: 600;
  color: #22c55e;
  font-size: 0.9rem;
}

.history-time {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
}

</style>
