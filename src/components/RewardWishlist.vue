<template>
  <div class="wishlist-section">
    <div class="section-header">
      <h3>
        <Gift :size="18" :stroke-width="1.5" />
        Мои награды
      </h3>
      <button class="btn-icon desktop-only" @click="showAddModal = true">
        <Plus :size="18" :stroke-width="1.5" />
      </button>
    </div>

    <div v-if="wishlist.length === 0" class="empty-state">
      <div class="empty-icon">🎁</div>
      <p>Добавьте награды, которые хотите получить за свои достижения</p>
      <button class="btn btn-primary btn-sm" @click="addDemoRewards">
        Добавить примеры
      </button>
    </div>

    <div v-else>
      <div class="rewards-compact mobile-only">
        <div class="compact-list">
          <div 
            v-for="reward in visibleRewards" 
            :key="reward.id"
            class="compact-reward"
            :class="{ available: reward.isAvailable }"
            @click="reward.isAvailable ? claimReward(reward) : editReward(reward)"
          >
            <span class="compact-icon">{{ reward.icon }}</span>
            <div class="compact-info">
              <span class="compact-name">{{ reward.name }}</span>
              <div class="compact-progress" v-if="!reward.isAvailable">
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
            <Check v-if="reward.isAvailable" :size="16" :stroke-width="2" class="compact-check" />
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
        </div>
      </div>

      <div class="rewards-list desktop-only">
        <div class="rewards-section" v-if="availableRewards.length > 0">
          <h4 class="section-label available">Доступны сейчас</h4>
          <div 
            v-for="reward in availableRewards" 
            :key="reward.id"
            class="reward-card available"
          >
            <span class="reward-icon">{{ reward.icon }}</span>
            <div class="reward-info">
              <span class="reward-name">{{ reward.name }}</span>
              <span class="reward-cost">{{ reward.cost }} XP</span>
            </div>
            <button class="btn btn-success btn-sm" @click="claimReward(reward)">
              Получить
            </button>
          </div>
        </div>

        <div class="rewards-section" v-if="upcomingRewards.length > 0">
          <h4 class="section-label upcoming">Впереди</h4>
          <div 
            v-for="reward in upcomingRewards" 
            :key="reward.id"
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
            :key="reward.id"
            class="reward-card redeemed"
          >
            <span class="reward-icon">{{ reward.icon }}</span>
            <div class="reward-info">
              <span class="reward-name">{{ reward.name }}</span>
              <span class="reward-date">{{ formatDate(reward.redeemedAt) }}</span>
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
            <button v-if="editingReward" class="btn btn-danger" @click="deleteReward">
              Удалить
            </button>
            <div class="spacer"></div>
            <button class="btn btn-secondary" @click="closeModal">Отмена</button>
            <button 
              class="btn btn-primary" 
              @click="saveReward"
              :disabled="!formData.name || !formData.cost"
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
            <button class="btn btn-success" @click="confirmClaim">Получить!</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useXpStore } from '../stores/xp'
import { useToastStore } from '../stores/toast'
import { Gift, Plus, Pencil, Check, X, ChevronDown } from 'lucide-vue-next'

const xpStore = useXpStore()
const toast = useToastStore()

const showAddModal = ref(false)
const rewardsExpanded = ref(false)
const editingReward = ref(null)
const claimingReward = ref(null)

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
const wishlist = computed(() => xpStore.wishlist)
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

function toggleRewardsExpand() {
  rewardsExpanded.value = !rewardsExpanded.value
}

function getProgress(reward) {
  return Math.min(100, (xpBalance.value / reward.cost) * 100)
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function addDemoRewards() {
  xpStore.addDemoRewards()
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

function saveReward() {
  if (editingReward.value) {
    xpStore.updateReward(editingReward.value.id, formData.value)
    toast.showToast({ title: 'Награда обновлена', type: 'success' })
  } else {
    xpStore.addReward(formData.value)
    toast.showToast({ title: 'Награда добавлена', type: 'success' })
  }
  closeModal()
}

function deleteReward() {
  if (editingReward.value) {
    xpStore.removeReward(editingReward.value.id)
    toast.showToast({ title: 'Награда удалена', type: 'info' })
    closeModal()
  }
}

function claimReward(reward) {
  claimingReward.value = reward
}

function confirmClaim() {
  if (!claimingReward.value) return
  
  const result = xpStore.spendXP(claimingReward.value.id)
  if (result.success) {
    toast.showToast({ title: `Поздравляем! Вы получили: ${claimingReward.value.name}`, type: 'success' })
  } else {
    toast.showToast({ title: result.error, type: 'error' })
  }
  claimingReward.value = null
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
</style>
