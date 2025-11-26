<template>
  <div class="goals-bank">
    <div class="add-goal-section card">
      <h3>➕ Добавить цель в банк</h3>
      <form @submit.prevent="handleAddGoal" class="add-goal-form">
        <div class="form-row">
          <div class="form-group flex-1">
            <input
              v-model="newGoal.title"
              type="text"
              class="form-input"
              placeholder="Название цели..."
              required
            />
          </div>
          <div class="form-group" style="min-width: 200px;">
            <select v-model="newGoal.sphereId" class="form-select" required>
              <option value="">Выберите сферу</option>
              <option v-for="sphere in spheres" :key="sphere.id" :value="sphere.id">
                {{ sphere.icon }} {{ sphere.name }}
              </option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary">Добавить</button>
        </div>
      </form>
    </div>

    <div class="goals-filter">
      <button
        class="filter-btn"
        :class="{ active: filter === 'all' }"
        @click="filter = 'all'"
      >
        Все ({{ goals.length }})
      </button>
      <button
        class="filter-btn"
        :class="{ active: filter === 'true' }"
        @click="filter = 'true'"
      >
        Истинные ({{ trueGoalsCount }})
      </button>
      <button
        class="filter-btn"
        :class="{ active: filter === 'sphere' }"
        @click="filter = 'sphere'"
      >
        По сферам
      </button>
    </div>

    <!-- All goals view -->
    <div v-if="filter === 'all'" class="goals-list">
      <div
        v-for="goal in goals"
        :key="goal.id"
        class="goal-item card"
        :class="{ true: goal.isTrue }"
      >
        <div class="goal-header">
          <div class="goal-main">
            <input
              :value="goal.title"
              @input="(e) => handleTitleInput(goal.id, e.target.value)"
              class="goal-title-input"
              placeholder="Название цели"
            />
            <div class="goal-sphere-badge">
              {{ getSphereById(goal.sphereId)?.icon }}
              {{ getSphereById(goal.sphereId)?.name }}
            </div>
          </div>
          <div class="goal-actions">
            <button
              class="btn-toggle-true"
              :class="{ active: goal.isTrue }"
              @click="toggleTrue(goal)"
              title="Отметить как истинную цель"
            >
              ✓
            </button>
            <button
              class="btn-delete"
              @click="deleteGoal(goal.id)"
              title="Удалить цель"
            >
              🗑️
            </button>
          </div>
        </div>
        <textarea
          :value="goal.description"
          @input="(e) => handleDescriptionInput(goal.id, e.target.value)"
          class="goal-description"
          placeholder="Опишите цель подробнее. Почему это важно для вас?"
          rows="2"
        ></textarea>
        <div v-if="goal.isTrue" class="true-marker">
          💎 Истинная цель
        </div>
      </div>
    </div>

    <!-- True goals only view -->
    <div v-if="filter === 'true'" class="goals-list">
      <div v-if="trueGoalsCount === 0" class="empty-state">
        <p>Пока нет истинных целей. Отметьте цели, которые действительно ваши.</p>
      </div>
      <div
        v-for="goal in trueGoals"
        :key="goal.id"
        class="goal-item card true"
      >
        <div class="goal-header">
          <div class="goal-main">
            <input
              :value="goal.title"
              @input="(e) => handleTitleInput(goal.id, e.target.value)"
              class="goal-title-input"
              placeholder="Название цели"
            />
            <div class="goal-sphere-badge">
              {{ getSphereById(goal.sphereId)?.icon }}
              {{ getSphereById(goal.sphereId)?.name }}
            </div>
          </div>
          <div class="goal-actions">
            <button
              class="btn-toggle-true active"
              @click="toggleTrue(goal)"
              title="Убрать отметку истинной цели"
            >
              ✓
            </button>
            <button
              class="btn-delete"
              @click="deleteGoal(goal.id)"
              title="Удалить цель"
            >
              🗑️
            </button>
          </div>
        </div>
        <textarea
          :value="goal.description"
          @input="(e) => handleDescriptionInput(goal.id, e.target.value)"
          class="goal-description"
          placeholder="Опишите цель подробнее"
          rows="2"
        ></textarea>
        <div class="true-marker">
          💎 Истинная цель
        </div>
      </div>
    </div>

    <!-- By sphere view -->
    <div v-if="filter === 'sphere'" class="goals-by-sphere">
      <div
        v-for="sphere in spheres"
        :key="sphere.id"
        class="sphere-section"
      >
        <h3 class="sphere-header">
          {{ sphere.icon }} {{ sphere.name }}
          <span class="goals-count">({{ getGoalsBySphere(sphere.id).length }})</span>
        </h3>
        <div v-if="getGoalsBySphere(sphere.id).length === 0" class="empty-sphere">
          Нет целей в этой сфере
        </div>
        <div v-else class="goals-list-compact">
          <div
            v-for="goal in getGoalsBySphere(sphere.id)"
            :key="goal.id"
            class="goal-item-compact"
            :class="{ true: goal.isTrue }"
          >
            <button
              class="btn-toggle-true-small"
              :class="{ active: goal.isTrue }"
              @click="toggleTrue(goal)"
            >
              ✓
            </button>
            <div class="goal-content-compact">
              <input
                :value="goal.title"
                @input="(e) => handleTitleInput(goal.id, e.target.value)"
                class="goal-title-input-compact"
              />
            </div>
            <button
              class="btn-delete-small"
              @click="deleteGoal(goal.id)"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  spheres: {
    type: Array,
    required: true
  },
  goals: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['add-goal', 'update-goal', 'delete-goal'])

const newGoal = ref({
  title: '',
  sphereId: '',
  description: '',
  isTrue: false
})

const filter = ref('all')

const trueGoals = computed(() => {
  return props.goals.filter(g => g.isTrue)
})

const trueGoalsCount = computed(() => trueGoals.value.length)

function handleAddGoal() {
  if (newGoal.value.title && newGoal.value.sphereId) {
    emit('add-goal', {
      title: newGoal.value.title,
      sphereId: newGoal.value.sphereId,
      description: newGoal.value.description,
      isTrue: false,
      priority: false
    })
    newGoal.value = {
      title: '',
      sphereId: '',
      description: '',
      isTrue: false
    }
  }
}

function handleTitleInput(goalId, value) {
  emit('update-goal', goalId, { title: value })
}

function handleDescriptionInput(goalId, value) {
  emit('update-goal', goalId, { description: value })
}

function updateGoal(goal) {
  emit('update-goal', goal.id, {
    title: goal.title,
    description: goal.description,
    isTrue: goal.isTrue
  })
}

function toggleTrue(goal) {
  emit('update-goal', goal.id, {
    isTrue: !goal.isTrue
  })
}

function deleteGoal(goalId) {
  if (confirm('Удалить эту цель из банка?')) {
    emit('delete-goal', goalId)
  }
}

function getSphereById(sphereId) {
  return props.spheres.find(s => s.id === sphereId)
}

function getGoalsBySphere(sphereId) {
  return props.goals.filter(g => g.sphereId === sphereId)
}
</script>

<style scoped>
.goals-bank {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.add-goal-section {
  padding: 1.5rem;
}

.add-goal-section h3 {
  margin-bottom: 1rem;
}

.add-goal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.flex-1 {
  flex: 1;
}

.goals-filter {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.625rem 1.25rem;
  background: var(--bg-tertiary);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: var(--border-color);
}

.filter-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.goal-item {
  padding: 1.5rem;
  border-left: 4px solid transparent;
  transition: all 0.2s ease;
}

.goal-item.true {
  border-left-color: var(--success-color);
  background: rgba(16, 185, 129, 0.05);
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.goal-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.goal-title-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  transition: all 0.2s ease;
}

.goal-title-input:hover,
.goal-title-input:focus {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

.goal-sphere-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  width: fit-content;
}

.goal-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-toggle-true {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  cursor: pointer;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: transparent;
}

.btn-toggle-true:hover {
  border-color: var(--success-color);
  color: var(--success-color);
}

.btn-toggle-true.active {
  background: var(--success-color);
  border-color: var(--success-color);
  color: white;
}

.btn-delete {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--bg-tertiary);
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-delete:hover {
  background: var(--danger-color);
}

.goal-description {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  line-height: 1.6;
  resize: vertical;
  min-height: 60px;
}

.true-marker {
  margin-top: 1rem;
  padding: 0.625rem 1rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: var(--radius-sm);
  color: var(--success-color);
  font-weight: 600;
  font-size: 0.875rem;
  text-align: center;
}

.empty-state {
  padding: 3rem;
  text-align: center;
  color: var(--text-secondary);
}

.goals-by-sphere {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.sphere-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sphere-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--border-color);
}

.goals-count {
  color: var(--text-secondary);
  font-size: 1rem;
  font-weight: 400;
}

.empty-sphere {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.goals-list-compact {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.goal-item-compact {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
}

.goal-item-compact.true {
  border-left-color: var(--success-color);
  background: rgba(16, 185, 129, 0.05);
}

.btn-toggle-true-small {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  background: white;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  color: transparent;
}

.btn-toggle-true-small:hover {
  border-color: var(--success-color);
  color: var(--success-color);
}

.btn-toggle-true-small.active {
  background: var(--success-color);
  border-color: var(--success-color);
  color: white;
}

.goal-content-compact {
  flex: 1;
}

.goal-title-input-compact {
  width: 100%;
  padding: 0.25rem 0.5rem;
  font-size: 1rem;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  transition: all 0.2s ease;
}

.goal-title-input-compact:hover,
.goal-title-input-compact:focus {
  background: white;
  border-color: var(--border-color);
}

.btn-delete-small {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  opacity: 0.5;
}

.btn-delete-small:hover {
  opacity: 1;
  background: var(--danger-color);
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }

  .goal-header {
    flex-direction: column;
  }
}
</style>
