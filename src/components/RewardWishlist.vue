<template>
  <div class="wishlist-section">
    <div class="section-header">
      <h3>
        <Gift :size="18" :stroke-width="1.5" />
        Мои награды
      </h3>
      <button class="btn-icon" @click="showAddModal = true">
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

    <div v-else class="rewards-list">
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
import { Gift, Plus, Pencil, Check, X } from 'lucide-vue-next'

const xpStore = useXpStore()
const toast = useToastStore()

const showAddModal = ref(false)
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
</style>
