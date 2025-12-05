<template>
  <div class="plan-review-overlay" @click.self="$emit('close')">
    <div class="plan-review-modal">
      <div class="modal-header">
        <div class="header-content">
          <div class="header-icon">
            <Sparkles :size="24" />
          </div>
          <div class="header-text">
            <h2>Ваши цели на старт</h2>
            <p>AI подготовил цели с шагами на основе анализа ССП. Утвердите или откажитесь от целей.</p>
          </div>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <X :size="20" />
        </button>
      </div>

      <div class="modal-body">
        <div class="stats-bar">
          <div class="stat">
            <Check :size="16" class="text-success" />
            <span>{{ acceptedCount }} принято</span>
          </div>
          <div class="stat">
            <Clock :size="16" class="text-warning" />
            <span>{{ pendingCount }} ожидает</span>
          </div>
          <div class="stat">
            <XCircle :size="16" class="text-muted" />
            <span>{{ rejectedCount }} пропущено</span>
          </div>
        </div>

        <div class="goals-list">
          <div 
            v-for="goal in recommendedGoals" 
            :key="goal.id"
            class="goal-card"
            :class="{ 
              'accepted': goal.status === 'accepted',
              'rejected': goal.status === 'rejected',
              'editing': editingGoalId === goal.id
            }"
            :style="{ '--goal-color': getSphereColor(goal.sphereId) }"
          >
            <div class="goal-header">
              <div class="goal-sphere-badge" :style="{ background: getSphereColor(goal.sphereId) }">
                <component :is="getSphereIcon(goal.sphereId)" :size="16" />
              </div>
              
              <div class="goal-main">
                <template v-if="editingGoalId === goal.id">
                  <input 
                    v-model="editForm.title" 
                    class="edit-input"
                    placeholder="Название цели"
                  />
                  <textarea 
                    v-model="editForm.description" 
                    class="edit-textarea"
                    placeholder="Описание (необязательно)"
                    rows="2"
                  ></textarea>
                  <div class="edit-actions">
                    <button class="btn-small btn-primary" @click="saveGoalEdit(goal)">
                      <Check :size="14" />
                      Сохранить
                    </button>
                    <button class="btn-small btn-secondary" @click="cancelEdit">
                      Отмена
                    </button>
                  </div>
                </template>
                <template v-else>
                  <h3 class="goal-title">{{ goal.title }}</h3>
                  <p v-if="goal.description" class="goal-description">{{ goal.description }}</p>
                  <div class="goal-meta">
                    <span class="sphere-name">{{ getSphereName(goal.sphereId) }}</span>
                    <span class="steps-count">
                      <ListTodo :size="12" />
                      {{ goal.steps.length }} шагов
                    </span>
                    <span v-if="goal.status === 'accepted'" class="status-badge accepted">
                      <Check :size="12" />
                      Принято
                    </span>
                    <span v-else-if="goal.status === 'rejected'" class="status-badge rejected">
                      Пропущено
                    </span>
                  </div>
                </template>
              </div>

              <div v-if="goal.status === 'pending' && editingGoalId !== goal.id" class="goal-actions">
                <button 
                  class="action-btn accept" 
                  @click="acceptGoal(goal)"
                  title="Принять цель"
                >
                  <Check :size="18" />
                </button>
                <button 
                  class="action-btn edit" 
                  @click="startGoalEdit(goal)"
                  title="Изменить"
                >
                  <Pencil :size="18" />
                </button>
                <button 
                  class="action-btn reject" 
                  @click="rejectGoal(goal)"
                  title="Пропустить"
                >
                  <X :size="18" />
                </button>
              </div>

              <div v-else-if="goal.status !== 'pending' && editingGoalId !== goal.id" class="goal-actions-done">
                <button 
                  class="action-btn-small undo" 
                  @click="resetGoal(goal)"
                  title="Отменить"
                >
                  <RotateCcw :size="14" />
                </button>
              </div>
            </div>

            <div v-if="goal.steps.length > 0" class="goal-steps" :class="{ collapsed: !expandedGoals[goal.id] }">
              <button class="steps-toggle" @click="toggleGoalExpanded(goal.id)">
                <ChevronDown :size="16" :class="{ rotated: expandedGoals[goal.id] }" />
                <span>{{ expandedGoals[goal.id] ? 'Скрыть шаги' : 'Показать шаги' }}</span>
              </button>
              
              <div v-show="expandedGoals[goal.id]" class="steps-list">
                <div 
                  v-for="(step, index) in goal.steps" 
                  :key="step.id"
                  class="step-item"
                  :class="{ editing: editingStepId === step.id }"
                >
                  <span class="step-number">{{ index + 1 }}</span>
                  <template v-if="editingStepId === step.id">
                    <input 
                      v-model="stepEditForm.title" 
                      class="step-edit-input"
                      placeholder="Название шага"
                      @keyup.enter="saveStepEdit(goal, step)"
                      @keyup.esc="cancelStepEdit"
                    />
                    <button class="step-edit-btn save" @click="saveStepEdit(goal, step)">
                      <Check :size="14" />
                    </button>
                    <button class="step-edit-btn cancel" @click="cancelStepEdit">
                      <X :size="14" />
                    </button>
                  </template>
                  <template v-else>
                    <span class="step-title">{{ step.title }}</span>
                    <button 
                      v-if="goal.status === 'pending'"
                      class="step-edit-trigger"
                      @click="startStepEdit(step)"
                      title="Изменить шаг"
                    >
                      <Pencil :size="12" />
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="skipAll">
          Пропустить всё
        </button>
        <button class="btn btn-primary" @click="confirmPlan" :disabled="acceptedCount === 0 || isConfirming">
          <Check :size="18" />
          {{ isConfirming ? 'Сохранение...' : `Добавить цели (${acceptedCount})` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'
import {
  Sparkles,
  X,
  Check,
  Clock,
  XCircle,
  Pencil,
  RotateCcw,
  ChevronDown,
  ListTodo,
  Wallet,
  Palette,
  Users,
  Heart,
  Briefcase,
  Home,
  Target
} from 'lucide-vue-next'

const emit = defineEmits(['close', 'confirmed'])
const store = useAppStore()

const editingGoalId = ref(null)
const editingStepId = ref(null)
const expandedGoals = ref({})

const editForm = ref({
  title: '',
  description: ''
})

const stepEditForm = ref({
  title: ''
})

const isConfirming = ref(false)

const sphereColors = {
  wealth: '#10b981',
  hobbies: '#f59e0b',
  friendship: '#8b5cf6',
  health: '#ef4444',
  career: '#3b82f6',
  love: '#ec4899'
}

const sphereNames = {
  wealth: 'Финансы',
  hobbies: 'Хобби',
  friendship: 'Друзья',
  health: 'Здоровье',
  career: 'Карьера',
  love: 'Семья'
}

const sphereIcons = {
  wealth: Wallet,
  hobbies: Palette,
  friendship: Users,
  health: Heart,
  career: Briefcase,
  love: Home
}

const recommendedGoals = computed(() => store.aiRecommendedGoals)

const acceptedCount = computed(() => 
  recommendedGoals.value.filter(g => g.status === 'accepted').length
)

const pendingCount = computed(() => 
  recommendedGoals.value.filter(g => g.status === 'pending').length
)

const rejectedCount = computed(() => 
  recommendedGoals.value.filter(g => g.status === 'rejected').length
)

function getSphereColor(id) {
  return sphereColors[id] || '#6b7280'
}

function getSphereIcon(id) {
  return sphereIcons[id] || Target
}

function getSphereName(id) {
  return sphereNames[id] || id
}

function toggleGoalExpanded(goalId) {
  expandedGoals.value[goalId] = !expandedGoals.value[goalId]
}

function acceptGoal(goal) {
  store.updateRecommendedGoalStatus(goal.id, 'accepted')
}

function rejectGoal(goal) {
  store.updateRecommendedGoalStatus(goal.id, 'rejected')
}

function resetGoal(goal) {
  store.updateRecommendedGoalStatus(goal.id, 'pending')
}

function startGoalEdit(goal) {
  editingGoalId.value = goal.id
  editForm.value = {
    title: goal.title,
    description: goal.description || ''
  }
}

function cancelEdit() {
  editingGoalId.value = null
  editForm.value = { title: '', description: '' }
}

function saveGoalEdit(goal) {
  store.updateRecommendedGoal(goal.id, {
    title: editForm.value.title,
    description: editForm.value.description,
    status: 'accepted'
  })
  cancelEdit()
}

function startStepEdit(step) {
  editingStepId.value = step.id
  stepEditForm.value = {
    title: step.title
  }
}

function cancelStepEdit() {
  editingStepId.value = null
  stepEditForm.value = { title: '' }
}

function saveStepEdit(goal, step) {
  store.updateRecommendedGoalStep(goal.id, step.id, {
    title: stepEditForm.value.title
  })
  cancelStepEdit()
}

function skipAll() {
  recommendedGoals.value.forEach(goal => {
    if (goal.status === 'pending') {
      store.updateRecommendedGoalStatus(goal.id, 'rejected')
    }
  })
  emit('close')
}

async function confirmPlan() {
  isConfirming.value = true
  try {
    const result = await store.confirmAIRecommendations()
    if (result.success) {
      emit('confirmed')
      emit('close')
    }
  } finally {
    isConfirming.value = false
  }
}
</script>

<style scoped>
.plan-review-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.plan-review-modal {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 700px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
}

.header-content {
  display: flex;
  gap: 1rem;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--primary-color), #a78bfa);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-text h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.header-text p {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.close-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.stats-bar {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.text-success { color: #10b981; }
.text-warning { color: #f59e0b; }
.text-muted { color: var(--text-tertiary); }

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.goal-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.2s;
}

.goal-card:hover {
  border-color: var(--goal-color, var(--border-color));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.goal-card.accepted {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.03);
}

.goal-card.rejected {
  opacity: 0.5;
  border-color: var(--border-color);
}

.goal-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
}

.goal-sphere-badge {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.goal-main {
  flex: 1;
  min-width: 0;
}

.goal-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.goal-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.goal-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.75rem;
}

.sphere-name {
  color: var(--text-secondary);
  font-weight: 500;
}

.steps-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-tertiary);
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-full);
  font-weight: 500;
}

.status-badge.accepted {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.rejected {
  background: var(--bg-secondary);
  color: var(--text-tertiary);
}

.goal-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: var(--text-secondary);
}

.action-btn:hover {
  border-color: transparent;
}

.action-btn.accept:hover {
  background: #10b981;
  color: white;
}

.action-btn.edit:hover {
  background: #3b82f6;
  color: white;
}

.action-btn.reject:hover {
  background: #ef4444;
  color: white;
}

.goal-actions-done {
  flex-shrink: 0;
}

.action-btn-small {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  transition: all 0.2s;
}

.action-btn-small:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.goal-steps {
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.steps-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.steps-toggle:hover {
  color: var(--text-primary);
}

.steps-toggle svg {
  transition: transform 0.2s;
}

.steps-toggle svg.rotated {
  transform: rotate(180deg);
}

.steps-list {
  padding: 0 1rem 1rem;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.step-item:last-child {
  border-bottom: none;
}

.step-number {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.step-title {
  flex: 1;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.step-edit-trigger {
  padding: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-tertiary);
  opacity: 0;
  transition: opacity 0.2s;
}

.step-item:hover .step-edit-trigger {
  opacity: 1;
}

.step-edit-trigger:hover {
  color: var(--primary-color);
}

.step-edit-input {
  flex: 1;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--primary-color);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.step-edit-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-edit-btn.save {
  background: #10b981;
  color: white;
}

.step-edit-btn.cancel {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.edit-input,
.edit-textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.edit-textarea {
  resize: vertical;
  min-height: 60px;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-small {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s;
}

.btn-small.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-small.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.btn {
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: var(--radius-lg);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.btn-secondary:hover {
  background: var(--bg-quaternary, #e5e7eb);
}

@media (max-width: 640px) {
  .plan-review-modal {
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .stats-bar {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .goal-header {
    flex-wrap: wrap;
  }
  
  .goal-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }
}
</style>
