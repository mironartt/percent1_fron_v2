<template>
  <div class="profile-page">
    <header class="page-header">
      <Breadcrumbs :items="breadcrumbItems" />
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
          <h3 class="history-title">
            <History :size="18" :stroke-width="1.5" />
            История XP
          </h3>
          <div class="history-summary" v-if="!historyExpanded && todayXP > 0">
            <span class="summary-text">Сегодня +{{ todayXP }} XP</span>
          </div>
          <ChevronDown :size="18" :stroke-width="1.5" class="expand-icon" />
        </button>
        <div class="history-content" v-show="historyExpanded">
          <div class="history-filters">
            <div class="filter-row filter-dropdowns">
              <select 
                class="filter-select"
                :value="historyFilters.transaction_status_filter || ''"
                @change="setStatusFilter($event.target.value || null)"
              >
                <option value="">Все операции</option>
                <option value="earned">Начисления</option>
                <option value="spent">Списания</option>
              </select>
              <select 
                class="filter-select"
                :value="historyFilters.transaction_category_filter || ''"
                @change="setCategoryFilter($event.target.value || null)"
              >
                <option value="">Все категории</option>
                <option value="habits">Привычки</option>
                <option value="diary">Дневник</option>
                <option value="goals">Цели</option>
                <option value="rewards">Награды</option>
              </select>
            </div>
            <div class="filter-row search-row">
              <div class="search-input-wrapper">
                <Search :size="16" class="search-icon" />
                <input 
                  type="text"
                  v-model="searchQuery"
                  placeholder="Поиск по названию..."
                  class="search-input"
                  @input="onSearchInput"
                />
                <button 
                  v-if="searchQuery" 
                  class="clear-search" 
                  @click="clearSearch"
                >
                  <X :size="14" />
                </button>
              </div>
              <button 
                v-if="hasActiveFilters"
                class="reset-filters-btn"
                @click="resetFilters"
              >
                <RotateCcw :size="14" />
                Сбросить
              </button>
            </div>
          </div>

          <div v-if="historyLoading && xpHistoryGroups.length === 0" class="loading-history">
            <Loader2 :size="20" class="spinner" />
            <span>Загрузка истории...</span>
          </div>
          <div v-else-if="xpHistoryGroups.length === 0" class="empty-history">
            <p v-if="hasActiveFilters">Ничего не найдено по вашему запросу</p>
            <p v-else>Начните выполнять задачи и привычки, чтобы получать XP</p>
          </div>
          <div v-else class="history-list">
            <div 
              v-for="dayGroup in xpHistoryGroups" 
              :key="dayGroup.date"
              class="history-day"
              :class="{ expanded: expandedDays[dayGroup.date] }"
            >
              <button class="day-header" @click="toggleDay(dayGroup.date)">
                <ChevronRight :size="16" class="day-expand-icon" />
                <span class="day-date">{{ formatDayDate(dayGroup.date) }}</span>
                <span class="day-summary">
                  <span v-if="dayGroup.total_earned > 0" class="day-earned">+{{ dayGroup.total_earned }}</span>
                  <span v-if="dayGroup.total_spent > 0" class="day-spent">-{{ dayGroup.total_spent }}</span>
                </span>
              </button>
              <div class="day-content" v-show="expandedDays[dayGroup.date]">
                <div 
                  v-for="(group, groupIndex) in dayGroup.groups" 
                  :key="group.group_type + '-' + groupIndex"
                  class="history-group"
                  :class="{ expanded: expandedGroups[dayGroup.date + '-' + groupIndex] }"
                >
                  <button 
                    class="group-header"
                    @click="toggleGroup(dayGroup.date, groupIndex, group)"
                    :class="{ clickable: hasGroupDetails(group) }"
                  >
                    <ChevronRight 
                      v-if="hasGroupDetails(group)" 
                      :size="14" 
                      class="group-expand-icon" 
                    />
                    <div class="history-icon" :class="getGroupClass(group.group_type)">
                      <component :is="getGroupIcon(group.group_type)" :size="14" :stroke-width="1.5" />
                    </div>
                    <span class="group-label">{{ group.group_type_display }}</span>
                    <span class="group-amount" :class="{ negative: group.total_amount < 0 }">
                      {{ group.total_amount > 0 ? '+' : '' }}{{ group.total_amount }} XP
                    </span>
                  </button>
                  <div 
                    v-if="hasGroupDetails(group)" 
                    class="group-items" 
                    v-show="expandedGroups[dayGroup.date + '-' + groupIndex]"
                  >
                    <div 
                      v-for="(item, itemIndex) in group.items" 
                      :key="itemIndex"
                      class="detail-item"
                    >
                      <span class="detail-name">{{ getItemName(item) }}</span>
                      <span class="detail-amount" :class="{ negative: item.amount < 0 }">
                        {{ item.amount > 0 ? '+' : '' }}{{ item.amount }} XP
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="historyTotalPages > 1" class="pagination">
              <button 
                class="pagination-btn"
                :disabled="historyPage <= 1 || historyLoading"
                @click="goToPage(historyPage - 1)"
              >
                <ChevronLeft :size="16" />
              </button>
              <div class="pagination-pages">
                <button
                  v-for="pageNum in visiblePages"
                  :key="pageNum"
                  class="pagination-page"
                  :class="{ active: pageNum === historyPage, dots: pageNum === '...' }"
                  :disabled="pageNum === '...' || historyLoading"
                  @click="pageNum !== '...' && goToPage(pageNum)"
                >
                  {{ pageNum }}
                </button>
              </div>
              <button 
                class="pagination-btn"
                :disabled="historyPage >= historyTotalPages || historyLoading"
                @click="goToPage(historyPage + 1)"
              >
                <ChevronRight :size="16" />
              </button>
            </div>

            <div v-if="historyLoading" class="loading-overlay">
              <Loader2 :size="20" class="spinner" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useAppStore } from '../stores/app'
import { useXpStore } from '../stores/xp'
import RewardWishlist from '../components/RewardWishlist.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import { 
  Sparkles, 
  Flame, 
  BookOpen, 
  Trophy,
  History,
  Zap,
  Star,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Gift,
  AlertCircle,
  Loader2,
  Search,
  X,
  RotateCcw
} from 'lucide-vue-next'

const historyExpanded = ref(false)
const expandedDays = reactive({})
const expandedGroups = reactive({})
const searchQuery = ref('')
let searchTimeout = null

const appStore = useAppStore()
const xpStore = useXpStore()

const breadcrumbItems = [
  { label: 'Главная', to: '/app' },
  { label: 'Достижения', to: '/app/achievements' }
]

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
const historyFilters = computed(() => xpStore.historyFilters)
const hasActiveFilters = computed(() => xpStore.hasActiveFilters)

function resetExpandedState() {
  Object.keys(expandedDays).forEach(key => delete expandedDays[key])
  Object.keys(expandedGroups).forEach(key => delete expandedGroups[key])
}

const nextRewardProgress = computed(() => {
  if (!nextReward.value) return 0
  return ((xpBalance.value / nextReward.value.cost) * 100).toFixed(0)
})

const visiblePages = computed(() => {
  const total = historyTotalPages.value
  const current = historyPage.value
  const pages = []
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    
    for (let i = start; i <= end; i++) pages.push(i)
    
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }
  
  return pages
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

function toggleDay(date) {
  expandedDays[date] = !expandedDays[date]
}

function toggleGroup(date, groupIndex, group) {
  if (!hasGroupDetails(group)) return
  const key = date + '-' + groupIndex
  expandedGroups[key] = !expandedGroups[key]
}

function hasGroupDetails(group) {
  return group.items && group.items.length > 0 && 
    (group.items.length > 1 || group.items[0].habit_name || group.items[0].reward_name)
}

function getItemName(item) {
  return item.habit_name || item.reward_name || item.goal_name || item.description || 'Операция'
}

async function setStatusFilter(value) {
  xpStore.setHistoryFilter('transaction_status_filter', value)
  resetExpandedState()
  await xpStore.applyHistoryFilters()
}

async function setCategoryFilter(value) {
  xpStore.setHistoryFilter('transaction_category_filter', value)
  resetExpandedState()
  await xpStore.applyHistoryFilters()
}

function onSearchInput() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    xpStore.setHistoryFilter('query_filter', searchQuery.value)
    resetExpandedState()
    await xpStore.applyHistoryFilters()
  }, 500)
}

async function clearSearch() {
  searchQuery.value = ''
  xpStore.setHistoryFilter('query_filter', '')
  resetExpandedState()
  await xpStore.applyHistoryFilters()
}

async function resetFilters() {
  searchQuery.value = ''
  xpStore.resetHistoryFilters()
  resetExpandedState()
  await xpStore.applyHistoryFilters()
}

async function goToPage(page) {
  resetExpandedState()
  await xpStore.goToHistoryPage(page)
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
    case 'habit_completed': 
    case 'habits_completed': 
      return 'habit'
    case 'habit_penalty': 
    case 'habits_penalty': 
      return 'penalty'
    case 'journal_entry': 
    case 'diary_completed':
      return 'journal'
    case 'journal_penalty': 
    case 'diary_penalty':
    case 'planning_penalty': 
      return 'penalty'
    case 'goal_step_completed': return 'step'
    case 'goal_completed': 
    case 'goals_completed':
      return 'goal'
    case 'reward_redeemed': return 'reward'
    case 'achievement_bonus': return 'achievement'
    default: return 'other'
  }
}

function getGroupIcon(groupType) {
  switch (groupType) {
    case 'habit_completed': 
    case 'habits_completed': 
      return Flame
    case 'habit_penalty': 
    case 'habits_penalty': 
    case 'journal_penalty': 
    case 'diary_penalty':
    case 'planning_penalty': 
      return AlertCircle
    case 'journal_entry': 
    case 'diary_completed':
      return BookOpen
    case 'goal_step_completed': return Zap
    case 'goal_completed': 
    case 'goals_completed':
      return Star
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

.page-header :deep(.breadcrumbs) {
  text-align: left;
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
  .page-header {
    padding-left: 0;
    padding-right: 0;
    text-align: left;
  }

  .desktop-only {
    display: none !important;
  }
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
  margin: 0;
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

.history-filters {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1rem;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.category-chips {
  gap: 0.25rem;
}

.filter-chips .chip-filter {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
  border-radius: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.filter-chips .chip-filter:hover {
  background: var(--bg-tertiary);
}

.filter-chips .chip-filter.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.filter-dropdowns {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  min-width: 140px;
}

.filter-select:hover {
  border-color: var(--primary-color);
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-row {
  gap: 0.75rem;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.5rem 2rem 0.5rem 2.25rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.85rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.clear-search {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
}

.clear-search:hover {
  color: var(--text-primary);
}

.reset-filters-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.reset-filters-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.day-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  background: none;
  border: none;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background 0.2s ease;
}

.day-header:hover {
  background: var(--bg-hover, var(--bg-secondary));
}

.day-expand-icon {
  color: var(--text-muted);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.history-day.expanded .day-expand-icon {
  transform: rotate(90deg);
}

.day-date {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
  flex: 1;
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

.day-content {
  padding-left: 0.5rem;
  border-left: 2px solid var(--border-color);
  margin-left: 0.5rem;
  margin-top: 0.5rem;
}

.history-group {
  padding: 0.25rem 0;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  padding: 0.25rem 0;
  color: inherit;
  font: inherit;
}

.group-header.clickable {
  cursor: pointer;
}

.group-header.clickable:hover {
  background: var(--bg-hover, var(--bg-secondary));
  border-radius: 6px;
}

.group-expand-icon {
  color: var(--text-muted);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.history-group.expanded .group-expand-icon {
  transform: rotate(90deg);
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
  margin-left: 2rem;
  margin-top: 0.25rem;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
}

.detail-name {
  color: var(--text-secondary);
  flex: 1;
}

.detail-amount {
  font-weight: 500;
  color: var(--success-color);
}

.detail-amount.negative {
  color: #ef4444;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 0.25rem;
}

.pagination-page {
  min-width: 32px;
  height: 32px;
  padding: 0 0.5rem;
  border-radius: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-page:hover:not(:disabled):not(.active) {
  background: var(--bg-tertiary);
}

.pagination-page.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.pagination-page.dots {
  background: transparent;
  border: none;
  cursor: default;
}

.loading-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.history-list {
  position: relative;
}

@media (max-width: 480px) {
  .filter-chips {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 0.25rem;
    -webkit-overflow-scrolling: touch;
  }
  
  .filter-chips .chip-filter {
    flex-shrink: 0;
  }
  
  .filter-dropdowns {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .filter-select {
    width: 100%;
    min-width: unset;
  }
  
  .pagination-pages {
    max-width: 200px;
    overflow-x: auto;
  }
}
</style>
