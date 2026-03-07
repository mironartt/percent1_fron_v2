<template>
  <div class="wishlist-section">
    <div class="section-header">
      <h3>
        <Gift :size="18" :stroke-width="1.5" />
        Мои награды
      </h3>
      <div class="header-actions">
        <button class="btn-header-action btn-add" @click="showAddModal = true">
          <Plus :size="14" :stroke-width="2" />
          <span>Добавить награду</span>
        </button>
      </div>
    </div>

    <div v-if="rewardsLoading && rewards.length === 0" class="loading-state">
      <Loader2 :size="24" :stroke-width="2" class="spinner" />
      <span>Загрузка наград...</span>
    </div>

    <div v-else-if="rewards.length === 0" class="empty-state">
      <div class="empty-state-icon">
        <Gift :size="40" :stroke-width="1.5" />
      </div>
      <p>Добавьте награды, которые хотите получить за свои достижения</p>
      <button class="btn btn-primary btn-sm" @click="showAddModal = true">
        Добавить награду
      </button>
    </div>

    <div v-else>
      <div class="rewards-compact mobile-only">
        <div class="compact-list">
          <div 
            v-for="reward in visibleRewards" 
            :key="reward.reward_id"
            class="compact-reward"
            :class="{ available: reward.can_afford }"
            @click="reward.can_afford ? claimReward(reward) : editReward(reward)"
          >
            <span class="compact-icon">{{ reward.icon }}</span>
            <div class="compact-info">
              <span class="compact-name">{{ reward.name }}</span>
              <div class="compact-progress" v-if="!reward.can_afford">
                <div class="progress-bar-mini">
                  <div 
                    class="progress-fill-mini"
                    :style="{ width: getProgress(reward) + '%' }"
                  />
                </div>
                <span class="progress-text-mini">{{ xpBalance }}/{{ reward.cost }}</span>
              </div>
              <span v-else class="compact-ready">Доступна!</span>
            </div>
            <Check v-if="reward.can_afford" :size="16" :stroke-width="2" class="compact-check" />
          </div>
        </div>
        
        <div class="compact-actions">
          <button 
            v-if="hiddenRewardsCount > 0" 
            class="btn-expand"
            @click="toggleRewardsExpand"
          >
            <span v-if="!rewardsExpanded">Ещё {{ hiddenRewardsCount }}</span>
            <span v-else>Свернуть</span>
            <ChevronDown :size="16" :stroke-width="2" :class="{ rotated: rewardsExpanded }" />
          </button>
          <button class="btn-add-compact" @click="showAddModal = true">
            <Plus :size="16" :stroke-width="2" />
            <span>Добавить</span>
          </button>
          <button class="btn-ai-compact" @click="openAiSuggestionsModal">
            <Sparkles :size="16" :stroke-width="2" />
            <span>Ментор</span>
          </button>
        </div>
      </div>

      <div class="rewards-list desktop-only">
        <div class="rewards-section" v-if="availableRewards.length > 0">
          <h4 class="section-label available">Доступны сейчас</h4>
          <div 
            v-for="reward in availableRewards" 
            :key="reward.reward_id"
            class="reward-card available"
          >
            <span class="reward-icon">{{ reward.icon }}</span>
            <div class="reward-info">
              <span class="reward-name">{{ reward.name }}</span>
              <span class="reward-cost">{{ reward.cost }} XP</span>
            </div>
            <button class="btn btn-success btn-sm" @click="claimReward(reward)" :disabled="rewardsLoading">
              Получить
            </button>
          </div>
        </div>

        <div class="rewards-section" v-if="upcomingRewards.length > 0">
          <h4 class="section-label upcoming">Впереди</h4>
          <div 
            v-for="reward in upcomingRewards" 
            :key="reward.reward_id"
            class="reward-card"
          >
            <span class="reward-icon">{{ reward.icon }}</span>
            <div class="reward-info">
              <span class="reward-name">{{ reward.name }}</span>
              <div class="reward-progress">
                <div class="progress-bar">
                  <div 
                    class="progress-fill"
                    :style="{ width: getProgress(reward) + '%' }"
                  />
                </div>
                <span class="progress-text">{{ xpBalance }}/{{ reward.cost }} XP</span>
              </div>
            </div>
            <button class="btn-icon" @click="editReward(reward)">
              <Pencil :size="14" :stroke-width="1.5" />
            </button>
          </div>
        </div>

        <div class="rewards-section" v-if="redeemedRewards.length > 0">
          <h4 class="section-label redeemed">Полученные</h4>
          <div 
            v-for="reward in redeemedRewards.slice(0, 3)" 
            :key="reward.reward_id"
            class="reward-card redeemed"
          >
            <span class="reward-icon">{{ reward.icon }}</span>
            <div class="reward-info">
              <span class="reward-name">{{ reward.name }}</span>
              <span class="reward-date">{{ formatDate(reward.date_redeemed) }}</span>
            </div>
            <Check :size="18" :stroke-width="2" class="check-icon" />
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showAddModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container modal-sm">
          <div class="modal-header">
            <button
              class="header-icon-btn"
              :class="{ active: activeSection === 'icon' }"
              @click="toggleSection('icon')"
            >
              {{ formData.icon }}
            </button>
            <input
              ref="rewardNameInput"
              v-model="formData.name"
              type="text"
              class="header-name-input"
              :placeholder="editingReward ? 'Редактировать награду' : 'Новая награда'"
              @keydown.enter="formData.name.trim() && formData.cost && saveReward()"
            />
            <button class="btn-close" @click="closeModal">
              <X :size="20" :stroke-width="1.5" />
            </button>
          </div>

          <div class="modal-body">
            <div v-if="activeSection === 'icon'" class="expand-section">
              <div class="icon-grid-full">
                <button
                  v-for="icon in availableIcons"
                  :key="icon"
                  class="icon-option"
                  :class="{ selected: formData.icon === icon }"
                  @click="formData.icon = icon; activeSection = null"
                >
                  {{ icon }}
                </button>
              </div>
            </div>

            <div class="action-bar">
              <button
                v-if="editingReward"
                class="action-chip action-chip-danger"
                @click="deleteReward"
                :disabled="rewardsLoading"
                title="Удалить"
              >
                <Trash2 :size="14" :stroke-width="1.5" />
              </button>
              <button
                class="action-chip"
                :class="{ active: activeSection === 'cost' }"
                @click="toggleSection('cost')"
              >
                <Coins :size="14" :stroke-width="1.5" />
                {{ formData.cost }} XP
              </button>
              <button
                class="action-chip"
                :class="{ active: activeSection === 'more' }"
                @click="toggleSection('more')"
              >
                <Plus :size="14" :stroke-width="1.5" />
                Описание
              </button>
              <div class="action-bar-spacer"></div>
              <button
                class="btn-create"
                @click="saveReward"
                :disabled="!formData.name.trim() || !formData.cost || rewardsLoading"
              >
                <Loader2 v-if="rewardsLoading" :size="16" :stroke-width="2" class="spin" />
                {{ editingReward ? 'Сохранить' : 'Добавить' }}
              </button>
            </div>

            <div v-if="activeSection === 'cost'" class="expand-section">
              <label class="expand-label">Стоимость (XP)</label>
              <input
                v-model.number="formData.cost"
                type="number"
                min="10"
                max="10000"
                class="form-input"
              />
            </div>

            <div v-if="activeSection === 'more'" class="expand-section">
              <textarea
                v-model="formData.description"
                class="form-input"
                rows="2"
                placeholder="Чем эта награда особенная?"
              />
            </div>

            <div v-if="!editingReward" class="suggest-row">
              <span class="suggest-label">Нужна идея?</span>
              <button class="suggest-link-btn" @click="openAiSuggestionsModal">
                <Sparkles :size="12" :stroke-width="1.5" />
                Ментор
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="claimingReward" class="modal-overlay" @click.self="claimingReward = null">
        <div class="modal-container modal-sm claim-modal">
          <div class="claim-content">
            <div class="claim-icon">{{ claimingReward.icon }}</div>
            <h3>Получить награду?</h3>
            <p class="claim-name">{{ claimingReward.name }}</p>
            <p class="claim-cost">-{{ claimingReward.cost }} XP</p>
            <p class="claim-balance">Останется: {{ xpBalance - claimingReward.cost }} XP</p>
          </div>
          <div class="claim-actions">
            <button class="btn btn-secondary" @click="claimingReward = null">Отмена</button>
            <button class="btn btn-success" @click="confirmClaim" :disabled="rewardsLoading">
              Получить!
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <AiMentorModal
      :show="showAiSuggestionsModal"
      :step="aiSuggestionsStep"
      title="Умный подбор наград"
      subtitle="AI-ментор подберёт награды специально для вас"
      description="На основе ваших целей, интересов и зон роста я предложу награды, которые будут мотивировать именно вас."
      :features="rewardFeatures"
      buttonText="Подобрать награды"
      loadingText="AI анализирует ваш профиль..."
      skipKey="rewardSuggestionsSkipIntro"
      :skipChecked="skipRewardSuggestionsIntro"
      @update:skipChecked="skipRewardSuggestionsIntro = $event; saveSkipIntroPreference()"
      @close="closeAiSuggestionsModal"
      @start="startAiSuggestions"
    >
      <template #selection>
        <div class="ai-selection-section">
          <p class="ai-selection-hint">Выберите награды, которые хотите добавить</p>
          <div class="ai-rewards-list aim-scrollable">
            <div
              v-for="(reward, idx) in aiSuggestedRewards"
              :key="idx"
              class="ai-reward-card"
              :class="{ selected: selectedAiRewards.includes(idx) }"
              @click="toggleAiRewardSelection(idx)"
            >
              <div class="ai-reward-header">
                <span class="ai-reward-icon">{{ reward.icon }}</span>
                <div class="ai-reward-info">
                  <span class="ai-reward-name">{{ reward.name }}</span>
                  <span class="ai-reward-cost">{{ reward.cost }} XP</span>
                </div>
                <div class="ai-reward-checkbox">
                  <Check v-if="selectedAiRewards.includes(idx)" :size="16" :stroke-width="2" />
                </div>
              </div>
              <p class="ai-reward-why">{{ reward.whyMotivating }}</p>
            </div>
          </div>
        </div>
      </template>

      <template #confirmation>
        <div class="ai-confirmation-section">
          <div class="ai-success-icon"><CheckCircle :size="48" :stroke-width="1.5" /></div>
          <h4>Награды успешно добавлены!</h4>
          <p class="ai-confirmation-text">Добавлено {{ createdAiRewards.length }} {{ getRewardsWord(createdAiRewards.length) }}</p>
          <div class="ai-created-list">
            <div v-for="reward in createdAiRewards" :key="reward.reward_id" class="ai-created-item">
              <span class="ai-created-icon">{{ reward.icon }}</span>
              <span>{{ reward.name }}</span>
              <span class="ai-created-cost">{{ reward.cost }} XP</span>
            </div>
          </div>
        </div>
      </template>

      <template #error>
        <div class="ai-error-section">
          <div class="ai-error-icon"><AlertTriangle :size="48" :stroke-width="1.5" /></div>
          <h4>Не удалось подобрать награды</h4>
          <p class="ai-error-text">{{ aiSuggestionsErrorMessage }}</p>
        </div>
      </template>

      <template #footer="{ step: currentStep }">
        <template v-if="currentStep === 'selection'">
          <button class="aim-btn aim-btn-primary aim-btn-full" :disabled="selectedAiRewards.length === 0" @click="confirmAiRewardSelection">
            Добавить {{ selectedAiRewards.length }} {{ getRewardsWord(selectedAiRewards.length) }}
          </button>
        </template>
        <template v-else-if="currentStep === 'confirmation'">
          <button class="aim-btn aim-btn-primary aim-btn-full" @click="closeAiSuggestionsModal">Отлично!</button>
        </template>
        <template v-else-if="currentStep === 'error'">
          <button class="aim-btn aim-btn-secondary" @click="openManualAddModal">Добавить вручную</button>
          <button class="aim-btn aim-btn-primary" @click="aiSuggestionsStep = 'intro'">Попробовать снова</button>
        </template>
      </template>
    </AiMentorModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, markRaw } from 'vue'
import { useXpStore } from '../stores/xp'
import { useToastStore } from '../stores/toast'
import { useAppStore } from '../stores/app'
import { useAITasksStore } from '../stores/aiTasks'
import { Gift, Plus, Pencil, Check, X, ChevronDown, Loader2, Sparkles, Target, TrendingUp, Coins, CheckCircle, AlertTriangle, Trash2 } from 'lucide-vue-next'
import AiMentorModal from '@/components/AiMentorModal.vue'

const xpStore = useXpStore()
const toast = useToastStore()
const appStore = useAppStore()
const aiTasksStore = useAITasksStore()

const showAddModal = ref(false)
const rewardNameInput = ref(null)
const rewardsExpanded = ref(false)
const editingReward = ref(null)
const claimingReward = ref(null)

const showAiSuggestionsModal = ref(false)
const aiSuggestionsStep = ref('intro')
const aiSuggestedRewards = ref([])
const selectedAiRewards = ref([])
const createdAiRewards = ref([])
const aiSuggestionsErrorMessage = ref('')
const skipRewardSuggestionsIntro = ref(false)

const rewardFeatures = [
  { icon: markRaw(Target), text: 'Подбор на основе ваших целей' },
  { icon: markRaw(TrendingUp), text: 'Учёт зон роста и интересов' },
  { icon: markRaw(Gift), text: 'Персональные награды для мотивации' },
  { icon: markRaw(Coins), text: 'Оптимальная стоимость в XP' }
]

const isAiGenerating = ref(false)
const aiProgressText = ref('')
const currentTaskId = ref(null)

const formData = ref({
  name: '',
  cost: 100,
  icon: '🎁',
  description: ''
})

const availableIcons = [
  '🎁', '☕', '🎬', '📚', '🍽️', '🏖️', '🎮', '🛍️',
  '💆', '🎧', '🍰', '🌴', '🎪', '🎨', '🎵', '✈️'
]
const activeSection = ref(null)

function toggleSection(section) {
  activeSection.value = activeSection.value === section ? null : section
}

const xpBalance = computed(() => xpStore.xpBalance)
const rewards = computed(() => xpStore.rewards)
const rewardsLoading = computed(() => xpStore.rewardsLoading)
const availableRewards = computed(() => xpStore.availableRewards)
const upcomingRewards = computed(() => xpStore.upcomingRewards)
const redeemedRewards = computed(() => xpStore.redeemedRewards)

const allActiveRewards = computed(() => {
  const available = availableRewards.value.map(r => ({ ...r, isAvailable: true }))
  const upcoming = upcomingRewards.value.map(r => ({ ...r, isAvailable: false }))
  return [...available, ...upcoming]
})

const visibleRewards = computed(() => {
  if (rewardsExpanded.value) {
    return allActiveRewards.value
  }
  return allActiveRewards.value.slice(0, 4)
})

const hiddenRewardsCount = computed(() => {
  return Math.max(0, allActiveRewards.value.length - 4)
})

onMounted(async () => {
  if (rewards.value.length === 0) {
    await xpStore.fetchRewards({ status_filter: null })
  }
})

function toggleRewardsExpand() {
  rewardsExpanded.value = !rewardsExpanded.value
}

function getProgress(reward) {
  return Math.min(100, (xpBalance.value / reward.cost) * 100)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function editReward(reward) {
  editingReward.value = reward
  formData.value = {
    name: reward.name,
    cost: reward.cost,
    icon: reward.icon,
    description: reward.description || ''
  }
  showAddModal.value = true
}

function closeModal() {
  showAddModal.value = false
  editingReward.value = null
  activeSection.value = null
  formData.value = {
    name: '',
    cost: 100,
    icon: '🎁',
    description: ''
  }
}

watch(showAddModal, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      rewardNameInput.value?.focus()
    })
  }
})

async function saveReward() {
  if (editingReward.value) {
    const result = await xpStore.updateReward(editingReward.value.reward_id, formData.value)
    if (result.success) {
      toast.showToast({ title: 'Награда обновлена', type: 'success' })
      closeModal()
    } else {
      toast.showToast({ title: result.error || 'Ошибка обновления', type: 'error' })
    }
  } else {
    const result = await xpStore.addReward(formData.value)
    if (result.success) {
      toast.showToast({ title: 'Награда добавлена', type: 'success' })
      closeModal()
    } else {
      toast.showToast({ title: result.error || 'Ошибка добавления', type: 'error' })
    }
  }
}

async function deleteReward() {
  if (editingReward.value) {
    const result = await xpStore.removeReward(editingReward.value.reward_id)
    if (result.success) {
      toast.showToast({ title: 'Награда удалена', type: 'info' })
      closeModal()
    } else {
      toast.showToast({ title: result.error || 'Ошибка удаления', type: 'error' })
    }
  }
}

function claimReward(reward) {
  claimingReward.value = reward
}

async function confirmClaim() {
  if (!claimingReward.value) return
  
  const result = await xpStore.redeemReward(claimingReward.value.reward_id)
  if (result.success) {
    toast.showToast({ title: `Поздравляем! Вы получили: ${claimingReward.value.name}`, type: 'success' })
  } else {
    toast.showToast({ title: result.error || 'Ошибка получения награды', type: 'error' })
  }
  claimingReward.value = null
}

function openAiSuggestionsModal() {
  showAiSuggestionsModal.value = true
  const skipIntro = localStorage.getItem('skipRewardSuggestionsIntro') === 'true'
  if (skipIntro) {
    startAiSuggestions()
  } else {
    aiSuggestionsStep.value = 'intro'
  }
}

function closeAiSuggestionsModal() {
  showAiSuggestionsModal.value = false
  aiSuggestionsStep.value = 'intro'
  aiSuggestedRewards.value = []
  selectedAiRewards.value = []
  createdAiRewards.value = []
  aiSuggestionsErrorMessage.value = ''
}

function openManualAddModal() {
  closeAiSuggestionsModal()
  showAddModal.value = true
}

function saveSkipIntroPreference() {
  localStorage.setItem('skipRewardSuggestionsIntro', skipRewardSuggestionsIntro.value.toString())
}

function toggleAiRewardSelection(idx) {
  const index = selectedAiRewards.value.indexOf(idx)
  if (index === -1) {
    selectedAiRewards.value.push(idx)
  } else {
    selectedAiRewards.value.splice(index, 1)
  }
}

function getRewardsWord(count) {
  if (count === 1) return 'награду'
  if (count >= 2 && count <= 4) return 'награды'
  return 'наград'
}

async function startAiSuggestions() {
  aiSuggestionsStep.value = 'loading'
  selectedAiRewards.value = []
  isAiGenerating.value = true
  aiProgressText.value = 'Запуск генерации...'
  
  try {
    if (!aiTasksStore.isConnected) {
      aiTasksStore.connect()
    }
    
    const result = await aiTasksStore.startTask('reward_mentor_help', {})
    
    if (result.status === 'already_running') {
      currentTaskId.value = result.task_id
      aiProgressText.value = 'Задача уже выполняется...'
      return
    }
    
    currentTaskId.value = result.task_id
    aiProgressText.value = 'Анализ профиля...'
    
  } catch (error) {
    console.error('[RewardWishlist] AI task start error:', error)
    isAiGenerating.value = false
    aiProgressText.value = ''
    aiSuggestionsErrorMessage.value = error.message || 'Ошибка запуска генерации'
    aiSuggestionsStep.value = 'error'
  }
}

const rewardMentorTask = computed(() => {
  return aiTasksStore.activeTasks.find(t => t.task_type === 'reward_mentor_help')
})

const rewardMentorResult = computed(() => {
  return aiTasksStore.taskResults['reward_mentor_help_latest']
})

const rewardMentorError = computed(() => {
  return aiTasksStore.taskErrors['reward_mentor_help_latest']
})

watch(rewardMentorTask, (task) => {
  if (task) {
    isAiGenerating.value = true
    aiProgressText.value = task.progress_text || 'Генерация наград...'
    currentTaskId.value = task.task_id
  }
}, { deep: true })

watch(rewardMentorResult, (result) => {
  if (result && currentTaskId.value) {
    isAiGenerating.value = false
    aiProgressText.value = ''
    
    if (result.rewards && result.rewards.length > 0) {
      aiSuggestedRewards.value = result.rewards.map(r => ({
        name: r.name,
        icon: r.icon || '🎁',
        cost: r.cost,
        description: r.description || '',
        whyMotivating: r.why_motivating || r.whyMotivating || ''
      }))
      aiSuggestionsStep.value = 'selection'
    } else {
      aiSuggestionsErrorMessage.value = 'AI не смог сгенерировать награды'
      aiSuggestionsStep.value = 'error'
    }
    
    currentTaskId.value = null
  }
}, { deep: true })

watch(rewardMentorError, (error) => {
  if (error && currentTaskId.value) {
    isAiGenerating.value = false
    aiProgressText.value = ''
    aiSuggestionsErrorMessage.value = error.message || 'Ошибка генерации наград'
    aiSuggestionsStep.value = 'error'
    currentTaskId.value = null
  }
}, { deep: true })

onMounted(() => {
  if (aiTasksStore.isConnected) {
    const existingTask = rewardMentorTask.value
    if (existingTask) {
      isAiGenerating.value = true
      aiProgressText.value = existingTask.progress_text || 'Генерация...'
      currentTaskId.value = existingTask.task_id
      showAiSuggestionsModal.value = true
      aiSuggestionsStep.value = 'loading'
    }
  }
})

async function confirmAiRewardSelection() {
  createdAiRewards.value = []
  
  const selected = selectedAiRewards.value.map(idx => aiSuggestedRewards.value[idx])
  
  const rewardsToCreate = selected.map(reward => ({
    name: reward.name,
    icon: reward.icon || '🎁',
    cost: reward.cost || 500,
    description: reward.whyMotivating || ''
  }))
  
  const result = await xpStore.addRewards(rewardsToCreate)
  
  if (result.success && result.rewards?.length > 0) {
    createdAiRewards.value = result.rewards
    aiSuggestionsStep.value = 'confirmation'
  } else {
    const errorMsg = result.error_code === 'rewards_limit_exceeded' 
      ? 'Достигнут лимит наград для вашего тарифа'
      : result.error || 'Не удалось добавить награды'
    toast.showToast({ title: errorMsg, type: 'error' })
    closeAiSuggestionsModal()
  }
}
</script>

<style scoped>
.wishlist-section {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.section-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.section-header h3 svg {
  color: var(--primary-color);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--bg-secondary);
  color: var(--primary-color);
}

.btn-header-action {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  border-radius: 8px;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-header-action.btn-add {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.btn-header-action.btn-add:hover {
  background: var(--primary-dark);
  border-color: var(--primary-dark);
}

.btn-header-action.btn-ai {
  background: color-mix(in srgb, var(--success-color) 15%, transparent);
  color: var(--success-color);
  border-color: var(--success-color);
}

.btn-header-action.btn-ai:hover:not(:disabled) {
  background: color-mix(in srgb, var(--success-color) 25%, transparent);
}

.btn-header-action.btn-ai:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-header-action.btn-ai.generating {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-color: var(--border-color);
}

.btn-header-action .spin {
  animation: spin 1s linear infinite;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
  color: var(--text-secondary);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
}

.empty-state-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.rewards-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.rewards-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.section-label.available {
  color: var(--success-color);
}

.section-label.upcoming {
  color: var(--text-secondary);
}

.section-label.redeemed {
  color: var(--text-muted);
}

.reward-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.reward-card.available {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.reward-card.redeemed {
  opacity: 0.6;
}

.reward-icon {
  font-size: 1.5rem;
}

.reward-info {
  flex: 1;
  min-width: 0;
}

.reward-name {
  display: block;
  font-weight: 500;
  font-size: 0.95rem;
  margin-bottom: 0.15rem;
}

.reward-cost {
  font-size: 0.85rem;
  color: var(--primary-color);
  font-weight: 500;
}

.reward-date {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.reward-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #a855f7);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.check-icon {
  color: var(--success-color);
}

.btn-success {
  background: var(--success-color);
  color: white;
}

.btn-danger {
  background: var(--danger-color);
  color: white;
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

.modal-container {
  background: var(--card-bg);
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: calc(100dvh - 2rem);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.header-icon-btn {
  width: 42px;
  height: 42px;
  min-width: 42px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.header-icon-btn:hover {
  border-color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 5%, transparent);
}

.header-icon-btn.active {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.header-name-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1.125rem;
  font-weight: 600;
  background: transparent;
  color: var(--text-primary);
  padding: 0;
  min-width: 0;
}

.header-name-input::placeholder {
  color: var(--text-secondary);
  font-weight: 500;
}

.btn-close {
  background: none;
  border: none;
  padding: 0.4rem;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: 6px;
}

.modal-body {
  padding: 16px 20px;
}

.modal-content {
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
}

.action-bar {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.action-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.action-chip:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 5%, transparent);
}

.action-chip.active {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.action-chip-danger {
  color: var(--text-muted);
}

.action-chip-danger:hover {
  border-color: var(--danger-color);
  color: var(--danger-color);
  background: color-mix(in srgb, var(--danger-color) 5%, transparent);
}

.action-bar-spacer {
  flex: 1;
}

.btn-create {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  border-radius: var(--radius-md);
  border: none;
  background: var(--primary-color);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-create:hover:not(:disabled) {
  background: var(--primary-dark);
}

.btn-create:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.expand-section {
  padding: 10px;
  background: var(--bg-secondary);
  border-radius: 10px;
  margin-top: 10px;
}

.expand-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--text-secondary);
}

.icon-grid-full {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
}

.icon-option {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: var(--bg-primary);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.icon-option:hover {
  border-color: color-mix(in srgb, var(--primary-color) 40%, transparent);
  transform: scale(1.1);
}

.icon-option.selected {
  border-color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 8%, transparent);
}

.form-input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.suggest-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
}

.suggest-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.suggest-link-btn {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--primary-color);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  transition: opacity 0.2s;
}

.suggest-link-btn:hover {
  opacity: 0.7;
}

.claim-modal .claim-content {
  text-align: center;
  padding: 2rem 1.5rem;
}

.claim-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.claim-name {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.claim-cost {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--danger-color);
  margin-bottom: 0.25rem;
}

.claim-balance {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.claim-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  justify-content: center;
}

@media (max-width: 768px) {
  .wishlist-section {
    padding: 1rem;
  }
  
  .section-header {
    margin-bottom: 0.75rem;
  }
  
  .section-header .header-actions {
    display: none !important;
  }
  
  .rewards-list.desktop-only {
    display: none !important;
  }
  
  .rewards-compact.mobile-only {
    display: block !important;
  }
  
  .btn-icon.desktop-only {
    display: none !important;
  }
}

.rewards-compact {
  display: none;
}

.compact-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.compact-reward {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.compact-reward:active {
  transform: scale(0.98);
}

.compact-reward.available {
  border-color: var(--success-color);
  background: rgba(34, 197, 94, 0.08);
}

.compact-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.compact-info {
  flex: 1;
  min-width: 0;
}

.compact-name {
  display: block;
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.compact-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar-mini {
  flex: 1;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill-mini {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #a855f7);
  border-radius: 2px;
}

.progress-text-mini {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.compact-ready {
  font-size: 0.8rem;
  color: var(--success-color);
  font-weight: 500;
}

.compact-check {
  color: var(--success-color);
  flex-shrink: 0;
}

.compact-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.btn-expand {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-expand:hover {
  background: var(--bg-tertiary);
}

.btn-expand svg {
  transition: transform 0.2s ease;
}

.btn-expand svg.rotated {
  transform: rotate(180deg);
}

.btn-add-compact {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.75rem;
  background: var(--primary-color);
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-add-compact:hover {
  opacity: 0.9;
}

.btn-ai-compact {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.75rem;
  background: var(--success-color);
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-ai-compact:hover {
  opacity: 0.9;
}

.empty-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.btn-ai {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--success-color);
  border: none;
  color: white;
}

.btn-ai:hover {
  opacity: 0.9;
}

.ai-suggestions-modal {
  max-width: 500px;
}

.ai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ai-header-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ai-header-icon {
  color: var(--success-color);
}

.ai-header-title h3 {
  margin: 0;
  font-size: 1.1rem;
}

.ai-content {
  padding: 1.5rem;
}

.ai-intro-section {
  text-align: center;
}

.ai-intro-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.ai-intro-icon svg {
  color: var(--success-color);
}

.ai-intro-section h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1.1rem;
}

.ai-intro-text {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.ai-features {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.ai-feature {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(16, 185, 129, 0.08);
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--text-primary);
}

.ai-feature svg {
  color: var(--success-color);
  flex-shrink: 0;
}

.btn-ai-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: var(--success-color);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-ai-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-ai-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.skip-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.skip-checkbox input {
  cursor: pointer;
}

.ai-loading-section {
  text-align: center;
  padding: 2rem 0;
}

.ai-spinner {
  color: var(--success-color);
  margin-bottom: 1rem;
}

.ai-loading-section h4 {
  margin: 0 0 0.5rem 0;
}

.ai-loading-text {
  color: var(--text-secondary);
}

.ai-selection-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ai-selection-hint {
  color: var(--text-secondary);
  margin: 0;
  text-align: center;
}

.ai-rewards-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ai-reward-card {
  padding: 1rem;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ai-reward-card:hover {
  border-color: var(--success-color);
}

.ai-reward-card.selected {
  border-color: var(--success-color);
  background: rgba(16, 185, 129, 0.08);
}

.ai-reward-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.ai-reward-icon {
  font-size: 1.5rem;
}

.ai-reward-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ai-reward-name {
  font-weight: 600;
  font-size: 0.95rem;
}

.ai-reward-cost {
  font-size: 0.85rem;
  color: var(--success-color);
  font-weight: 500;
}

.ai-reward-checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.ai-reward-card.selected .ai-reward-checkbox {
  background: var(--success-color);
  border-color: var(--success-color);
  color: white;
}

.ai-reward-why {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.ai-confirmation-section {
  text-align: center;
}

.ai-success-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.ai-success-icon svg {
  color: var(--success-color);
}

.ai-confirmation-section h4 {
  margin: 0 0 0.5rem 0;
}

.ai-confirmation-text {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.ai-created-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.ai-created-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(16, 185, 129, 0.08);
  border-radius: 8px;
  font-size: 0.9rem;
}

.ai-created-icon {
  font-size: 1.1rem;
}

.ai-created-cost {
  margin-left: auto;
  color: var(--success-color);
  font-weight: 500;
  font-size: 0.85rem;
}

.ai-error-section {
  text-align: center;
}

.ai-error-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.ai-error-icon svg {
  color: #f59e0b;
}

.ai-error-section h4 {
  margin: 0 0 0.5rem 0;
}

.ai-error-text {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.ai-error-actions {
  display: flex;
  gap: 0.75rem;
}

.ai-error-actions .btn {
  flex: 1;
}

/* AiMentorModal footer buttons */
.aim-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  flex: 1;
  font-family: inherit;
}

.aim-btn-full { width: 100%; }

.aim-btn-primary {
  background: var(--success-color, #10b981);
  color: #fff;
}

.aim-btn-primary:hover:not(:disabled) {
  background: #059669;
}

.aim-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.aim-btn-secondary {
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #1f2937);
  border: 1px solid var(--border-color, #e5e7eb);
}

.aim-btn-secondary:hover {
  background: var(--bg-tertiary, #f3f4f6);
}
</style>
