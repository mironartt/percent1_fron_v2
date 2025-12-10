<template>
  <div class="wishlist-section">
    <div class="section-header">
      <h3>
        <Gift :size="18" :stroke-width="1.5" />
        Мои награды
      </h3>
      <div class="header-actions">
        <button class="btn-icon" @click="showAddModal = true">
          <Plus :size="18" :stroke-width="1.5" />
        </button>
        <button class="btn-icon btn-icon-ai" @click="openAiSuggestionsModal" title="Подбор от ментора">
          <Sparkles :size="18" :stroke-width="1.5" />
        </button>
      </div>
    </div>

    <div v-if="rewardsLoading && rewards.length === 0" class="loading-state">
      <Loader2 :size="24" :stroke-width="2" class="spinner" />
      <span>Загрузка наград...</span>
    </div>

    <div v-else-if="rewards.length === 0" class="empty-state">
      <div class="empty-icon">🎁</div>
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
            <h3>{{ editingReward ? 'Редактировать награду' : 'Новая награда' }}</h3>
            <button class="btn-close" @click="closeModal">
              <X :size="20" :stroke-width="1.5" />
            </button>
          </div>
          <div class="modal-content">
            <div class="form-group">
              <label>Иконка</label>
              <div class="icon-grid">
                <button 
                  v-for="icon in availableIcons" 
                  :key="icon"
                  class="icon-option"
                  :class="{ selected: formData.icon === icon }"
                  @click="formData.icon = icon"
                >
                  {{ icon }}
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>Название</label>
              <input 
                v-model="formData.name"
                type="text"
                class="form-input"
                placeholder="Например: Поход в кино"
              />
            </div>
            <div class="form-group">
              <label>Стоимость (XP)</label>
              <input 
                v-model.number="formData.cost"
                type="number"
                min="10"
                max="10000"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Описание (необязательно)</label>
              <textarea 
                v-model="formData.description"
                class="form-input"
                rows="2"
                placeholder="Чем эта награда особенная?"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button v-if="editingReward" class="btn btn-danger" @click="deleteReward" :disabled="rewardsLoading">
              Удалить
            </button>
            <div class="spacer"></div>
            <button class="btn btn-secondary" @click="closeModal">Отмена</button>
            <button 
              class="btn btn-primary" 
              @click="saveReward"
              :disabled="!formData.name || !formData.cost || rewardsLoading"
            >
              {{ editingReward ? 'Сохранить' : 'Добавить' }}
            </button>
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

    <Teleport to="body">
      <div v-if="showAiSuggestionsModal" class="modal-overlay" @click.self="closeAiSuggestionsModal">
        <div class="modal-container modal-md ai-suggestions-modal">
          <div class="modal-header ai-header">
            <div class="ai-header-title">
              <Sparkles :size="20" :stroke-width="1.5" class="ai-header-icon" />
              <h3>Умный подбор наград</h3>
            </div>
            <button class="btn-close" @click="closeAiSuggestionsModal">
              <X :size="20" :stroke-width="1.5" />
            </button>
          </div>
          <div class="modal-content ai-content">
            <template v-if="aiSuggestionsStep === 'intro'">
              <div class="ai-intro-section">
                <div class="ai-intro-icon">
                  <Sparkles :size="48" :stroke-width="1.5" />
                </div>
                <h4>AI-ментор подберёт награды специально для вас</h4>
                <p class="ai-intro-text">
                  На основе ваших целей, интересов и зон роста я предложу награды, 
                  которые будут мотивировать именно вас.
                </p>
                <div class="ai-features">
                  <div class="ai-feature">
                    <Target :size="16" :stroke-width="1.5" />
                    <span>Анализ целей и ССП</span>
                  </div>
                  <div class="ai-feature">
                    <TrendingUp :size="16" :stroke-width="1.5" />
                    <span>Учёт зон роста</span>
                  </div>
                  <div class="ai-feature">
                    <Gift :size="16" :stroke-width="1.5" />
                    <span>Персонализированные награды</span>
                  </div>
                  <div class="ai-feature">
                    <Coins :size="16" :stroke-width="1.5" />
                    <span>Подходящая стоимость в XP</span>
                  </div>
                </div>
                <button class="btn btn-ai-primary" @click="startAiSuggestions">
                  <Sparkles :size="16" :stroke-width="1.5" />
                  Подобрать награды
                </button>
                <label class="skip-checkbox">
                  <input type="checkbox" v-model="skipRewardSuggestionsIntro" @change="saveSkipIntroPreference" />
                  <span>Не показывать это окно снова</span>
                </label>
              </div>
            </template>

            <template v-else-if="aiSuggestionsStep === 'loading'">
              <div class="ai-loading-section">
                <Loader2 :size="48" :stroke-width="2" class="spinner ai-spinner" />
                <h4>AI анализирует ваш профиль...</h4>
                <p class="ai-loading-text">Подбираем награды на основе ваших целей и интересов</p>
              </div>
            </template>

            <template v-else-if="aiSuggestionsStep === 'selection'">
              <div class="ai-selection-section">
                <p class="ai-selection-hint">Выберите награды, которые хотите добавить</p>
                <div class="ai-rewards-list">
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
                <button 
                  class="btn btn-ai-primary"
                  :disabled="selectedAiRewards.length === 0"
                  @click="confirmAiRewardSelection"
                >
                  Добавить {{ selectedAiRewards.length }} {{ getRewardsWord(selectedAiRewards.length) }}
                </button>
              </div>
            </template>

            <template v-else-if="aiSuggestionsStep === 'confirmation'">
              <div class="ai-confirmation-section">
                <div class="ai-success-icon">
                  <CheckCircle :size="48" :stroke-width="1.5" />
                </div>
                <h4>Награды успешно добавлены!</h4>
                <p class="ai-confirmation-text">
                  Добавлено {{ createdAiRewards.length }} {{ getRewardsWord(createdAiRewards.length) }}
                </p>
                <div class="ai-created-list">
                  <div v-for="reward in createdAiRewards" :key="reward.reward_id" class="ai-created-item">
                    <span class="ai-created-icon">{{ reward.icon }}</span>
                    <span>{{ reward.name }}</span>
                    <span class="ai-created-cost">{{ reward.cost }} XP</span>
                  </div>
                </div>
                <button class="btn btn-primary" @click="closeAiSuggestionsModal">
                  Отлично!
                </button>
              </div>
            </template>

            <template v-else-if="aiSuggestionsStep === 'error'">
              <div class="ai-error-section">
                <div class="ai-error-icon">
                  <AlertTriangle :size="48" :stroke-width="1.5" />
                </div>
                <h4>Не удалось подобрать награды</h4>
                <p class="ai-error-text">{{ aiSuggestionsErrorMessage }}</p>
                <div class="ai-error-actions">
                  <button class="btn btn-secondary" @click="openManualAddModal">
                    Добавить вручную
                  </button>
                  <button class="btn btn-primary" @click="aiSuggestionsStep = 'intro'">
                    Попробовать снова
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useXpStore } from '../stores/xp'
import { useToastStore } from '../stores/toast'
import { useAppStore } from '../stores/app'
import { apiFetch } from '../services/api'
import { Gift, Plus, Pencil, Check, X, ChevronDown, Loader2, Sparkles, Target, TrendingUp, Coins, CheckCircle, AlertTriangle } from 'lucide-vue-next'

const xpStore = useXpStore()
const toast = useToastStore()
const appStore = useAppStore()

const showAddModal = ref(false)
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
  formData.value = {
    name: '',
    cost: 100,
    icon: '🎁',
    description: ''
  }
}

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
  
  try {
    const userData = prepareUserDataForRewards()
    const response = await apiFetch('/api/ai/suggest-rewards', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
    
    const result = await response.json()
    
    if (result.success && result.suggestions?.length > 0) {
      aiSuggestedRewards.value = result.suggestions
      aiSuggestionsStep.value = 'selection'
    } else {
      aiSuggestionsErrorMessage.value = result.error || 'Не удалось получить рекомендации'
      aiSuggestionsStep.value = 'error'
    }
  } catch (error) {
    console.error('[RewardWishlist] AI suggestion error:', error)
    aiSuggestionsErrorMessage.value = 'Произошла ошибка при генерации наград'
    aiSuggestionsStep.value = 'error'
  }
}

function prepareUserDataForRewards() {
  const lifeSpheres = appStore.lifeSpheres || []
  const goals = appStore.ideas || []
  const existingRewards = rewards.value || []
  
  return {
    spheres: lifeSpheres.map(s => ({
      id: s.id,
      name: s.name,
      score: s.score || 0,
      reflection: s.reflection || {}
    })),
    growthZones: lifeSpheres
      .filter(s => s.score > 0 && s.score <= 5)
      .map(s => ({
        id: s.id,
        name: s.name,
        score: s.score,
        desired: s.reflection?.desired || '',
        prevents: s.reflection?.prevents || ''
      })),
    goals: goals.slice(0, 5).map(g => ({
      text: g.text,
      sphereId: g.sphereId
    })),
    existingRewards: existingRewards.map(r => r.name),
    xpBalance: xpBalance.value
  }
}

async function confirmAiRewardSelection() {
  createdAiRewards.value = []
  
  const selected = selectedAiRewards.value.map(idx => aiSuggestedRewards.value[idx])
  
  for (const reward of selected) {
    const rewardData = {
      name: reward.name,
      icon: reward.icon || '🎁',
      cost: reward.cost || 500,
      description: reward.whyMotivating || ''
    }
    
    const result = await xpStore.addReward(rewardData)
    if (result.success && result.reward) {
      createdAiRewards.value.push(result.reward)
    }
  }
  
  if (createdAiRewards.value.length > 0) {
    aiSuggestionsStep.value = 'confirmation'
  } else {
    toast.showToast({ title: 'Не удалось добавить награды', type: 'error' })
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
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.section-header h3 svg {
  color: var(--primary-color);
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

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
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
  color: #22c55e;
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
  color: #22c55e;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-sm {
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.btn-success {
  background: #22c55e;
  color: white;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  font-size: 1.1rem;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  padding: 0.4rem;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: 6px;
}

.modal-content {
  padding: 1.25rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.form-input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.25rem;
}

.icon-option {
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  border-radius: 8px;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-option:hover {
  background: var(--bg-tertiary, rgba(0,0,0,0.05));
}

.icon-option.selected {
  background: var(--primary-color);
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-color);
}

.spacer {
  flex: 1;
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
  color: #ef4444;
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
  border-color: #22c55e;
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
  color: #22c55e;
  font-weight: 500;
}

.compact-check {
  color: #22c55e;
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
  background: linear-gradient(135deg, #10b981, #059669);
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
  background: linear-gradient(135deg, #10b981, #059669);
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
  color: #10b981;
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
  color: #10b981;
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
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
  color: #10b981;
  flex-shrink: 0;
}

.btn-ai-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #10b981, #059669);
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
  color: #10b981;
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
  border-color: #10b981;
}

.ai-reward-card.selected {
  border-color: #10b981;
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
  color: #10b981;
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
  background: #10b981;
  border-color: #10b981;
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
  color: #10b981;
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
  color: #10b981;
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
</style>
