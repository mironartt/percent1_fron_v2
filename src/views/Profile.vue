<template>
  <div class="profile-page">
    <header class="page-header">
      <h1 class="page-title">Достижения</h1>
      <p class="page-subtitle">Ваш прогресс и награды</p>
    </header>

    <!-- Секция: Мой прогресс -->
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
  Sparkles, 
  Flame, 
  BookOpen, 
  Trophy,
  History,
  Zap,
  Star,
  ChevronDown,
  CheckCircle
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

.stats-section {
  margin-bottom: 1rem;
}

.stats-section-header {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.stats-section-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.stats-section-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.stats-panel {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 0.25rem;
}

.stats-panel::-webkit-scrollbar {
  display: none;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  white-space: nowrap;
  flex-shrink: 0;
}

.stat-chip .stat-value {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.stat-chip .stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.stat-icon-habits {
  color: var(--status-warning-text);
}

.stat-icon-journal {
  color: var(--status-info-text);
}

.stat-icon-tasks {
  color: var(--status-success-text);
}

.stat-icon-week {
  color: var(--status-purple-text);
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

.user-card {
  margin-bottom: 1rem;
}

.user-card-main {
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
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.user-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
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

.xp-lifetime {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.125rem;
}

.user-card-reward {
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
  background: var(--status-purple-bg);
  border-radius: 3px;
  overflow: hidden;
}

.reward-mini-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--status-purple-text), var(--status-info-text));
  border-radius: 3px;
  transition: width 0.4s ease;
}

.reward-mini-text {
  font-size: 0.8rem;
  color: var(--text-secondary);
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
  gap: 1rem;
}

.next-reward {
  background: linear-gradient(135deg, var(--status-purple-bg), var(--status-info-bg));
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.25rem;
}

.next-reward-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: var(--primary-color);
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
  background: var(--status-purple-bg);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--status-purple-text), var(--status-info-text));
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
  background: var(--status-warning-bg);
  color: var(--status-warning-text);
}

.history-icon.task {
  background: var(--status-success-bg);
  color: var(--status-success-text);
}

.history-icon.step {
  background: var(--status-warning-bg);
  color: var(--status-warning-text);
}

.history-icon.goal {
  background: var(--status-purple-bg);
  color: var(--status-purple-text);
}

.history-icon.journal {
  background: var(--status-info-bg);
  color: var(--status-info-text);
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
  color: var(--success-color);
  font-size: 0.9rem;
}

.history-time {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
}


</style>
