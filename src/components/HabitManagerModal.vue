<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <div class="modal-header">
          <h2>Управление привычками</h2>
          <button class="btn-close" @click="$emit('close')">
            <X :size="20" :stroke-width="1.5" />
          </button>
        </div>

        <div class="modal-content">
          <div v-if="!editingHabit" class="habits-management">
            <div class="add-habit-form">
              <div class="form-row">
                <button 
                  class="icon-picker" 
                  @click="showIconPicker = !showIconPicker"
                  :title="'Выбрать иконку'"
                >
                  {{ newHabit.icon }}
                </button>
                <input 
                  v-model="newHabit.name"
                  type="text"
                  placeholder="Новая привычка..."
                  class="habit-input"
                  @keyup.enter="addNewHabit"
                />
                <input 
                  v-model.number="newHabit.xpReward"
                  type="number"
                  min="1"
                  max="50"
                  class="xp-input"
                  placeholder="XP"
                />
                <button 
                  class="btn btn-primary btn-sm"
                  @click="addNewHabit"
                  :disabled="!newHabit.name.trim()"
                >
                  <Plus :size="16" :stroke-width="2" />
                </button>
              </div>

              <div v-if="showIconPicker" class="icon-picker-dropdown">
                <button 
                  v-for="icon in availableIcons" 
                  :key="icon"
                  class="icon-option"
                  :class="{ selected: newHabit.icon === icon }"
                  @click="selectIcon(icon)"
                >
                  {{ icon }}
                </button>
              </div>
              
              <button 
                class="btn btn-ai-suggest"
                @click="generateHabitSuggestions"
                :disabled="isGeneratingHabits"
              >
                <Loader2 v-if="isGeneratingHabits" :size="16" class="spin" />
                <Sparkles v-else :size="16" />
                <span>{{ isGeneratingHabits ? (aiProgress.text || 'Подбираем...') : 'Подбор от ментора' }}</span>
              </button>
            </div>
            
            <div v-if="aiHabitSuggestions.length > 0" class="ai-suggestions-section">
              <h4>Рекомендации от ментора</h4>
              <div class="suggestion-cards">
                <div 
                  v-for="habit in aiHabitSuggestions" 
                  :key="habit.name"
                  class="suggestion-card"
                >
                  <div class="suggestion-header">
                    <span class="habit-icon">{{ habit.icon }}</span>
                    <span class="habit-name">{{ habit.name }}</span>
                    <span class="habit-xp">{{ habit.xpReward }} XP</span>
                  </div>
                  <p v-if="habit.description" class="suggestion-description">{{ habit.description }}</p>
                  <div class="suggestion-actions">
                    <button class="btn btn-sm btn-primary" @click="addSuggestedHabit(habit)">
                      <Plus :size="14" />
                      Добавить
                    </button>
                    <button class="btn btn-sm btn-ghost" @click="dismissSuggestion(habit)">
                      <X :size="14" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="habits-list">
              <div class="list-section">
                <h4>Ваши привычки</h4>
                <div v-if="customHabits.length === 0" class="empty-state">
                  <span>Добавьте свои привычки выше</span>
                </div>
                <div 
                  v-for="habit in customHabits" 
                  :key="habit.id"
                  class="habit-row"
                >
                  <span class="habit-icon">{{ habit.icon }}</span>
                  <span class="habit-name">{{ habit.name }}</span>
                  <span class="habit-xp">{{ habit.xpReward }} XP</span>
                  <button class="btn-icon" @click="startEdit(habit)">
                    <Pencil :size="14" :stroke-width="1.5" />
                  </button>
                  <button class="btn-icon btn-danger" @click="confirmDelete(habit)">
                    <Trash2 :size="14" :stroke-width="1.5" />
                  </button>
                </div>
              </div>

              <div class="list-section default-section">
                <h4>Системные привычки</h4>
                <p class="section-hint">Эти привычки связаны с функциями приложения</p>
                <div 
                  v-for="habit in defaultHabits" 
                  :key="habit.id"
                  class="habit-row default"
                >
                  <span class="habit-icon">{{ habit.icon }}</span>
                  <span class="habit-name">{{ habit.name }}</span>
                  <span class="habit-xp">{{ habit.xpReward }} XP</span>
                  <span class="badge">системная</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="edit-habit-form">
            <h3>Редактирование привычки</h3>
            <div class="form-group">
              <label>Иконка</label>
              <div class="icon-grid">
                <button 
                  v-for="icon in availableIcons" 
                  :key="icon"
                  class="icon-option"
                  :class="{ selected: editingHabit.icon === icon }"
                  @click="editingHabit.icon = icon"
                >
                  {{ icon }}
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>Название</label>
              <input 
                v-model="editingHabit.name"
                type="text"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>XP за выполнение</label>
              <input 
                v-model.number="editingHabit.xpReward"
                type="number"
                min="1"
                max="50"
                class="form-input"
              />
            </div>
            <div class="form-actions">
              <button class="btn btn-secondary" @click="cancelEdit">Отмена</button>
              <button class="btn btn-primary" @click="saveEdit">Сохранить</button>
            </div>
          </div>
        </div>

        <div v-if="confirmingDelete" class="delete-confirm">
          <p>Удалить привычку "{{ confirmingDelete.name }}"?</p>
          <div class="confirm-actions">
            <button class="btn btn-secondary" @click="confirmingDelete = null">Отмена</button>
            <button class="btn btn-danger" @click="deleteHabit">Удалить</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useAppStore } from '../stores/app'
import { useAITasksStore } from '../stores/aiTasks'
import { X, Plus, Pencil, Trash2, Sparkles, Loader2 } from 'lucide-vue-next'

const emit = defineEmits(['close'])

const appStore = useAppStore()
const aiTasksStore = useAITasksStore()

const newHabit = ref({
  name: '',
  icon: '✨',
  xpReward: 5
})

const showIconPicker = ref(false)
const editingHabit = ref(null)
const confirmingDelete = ref(null)

const availableIcons = [
  '✨', '🎯', '💪', '🧘', '📚', '💧', '🏃', '🍎', 
  '😴', '🧠', '💊', '🎨', '🎵', '🌅', '🌙', '💼',
  '🏋️', '🚶', '🧹', '📝', '🎓', '💰', '🌱', '❤️'
]

const customHabits = computed(() => appStore.habits.filter(h => !h.archived))
const defaultHabits = [
  { id: 'journal', name: 'Дневник', icon: '📝', xpReward: 10, isDefault: true },
  { id: 'balance', name: 'Баланс жизни', icon: '⚖️', xpReward: 5, isDefault: true }
]

function selectIcon(icon) {
  newHabit.value.icon = icon
  showIconPicker.value = false
}

function addNewHabit() {
  if (!newHabit.value.name.trim()) return
  
  appStore.addHabit({
    name: newHabit.value.name.trim(),
    icon: newHabit.value.icon,
    xpReward: newHabit.value.xpReward || 5
  })
  
  newHabit.value = {
    name: '',
    icon: '✨',
    xpReward: 5
  }
}

function startEdit(habit) {
  editingHabit.value = { ...habit }
}

function cancelEdit() {
  editingHabit.value = null
}

function saveEdit() {
  if (!editingHabit.value) return
  
  appStore.updateHabit(editingHabit.value.id, {
    name: editingHabit.value.name,
    icon: editingHabit.value.icon,
    xpReward: editingHabit.value.xpReward
  })
  
  editingHabit.value = null
}

function confirmDelete(habit) {
  confirmingDelete.value = habit
}

function deleteHabit() {
  if (!confirmingDelete.value) return
  
  appStore.removeHabit(confirmingDelete.value.id)
  confirmingDelete.value = null
}

const isGeneratingHabits = ref(false)
const aiHabitSuggestions = ref([])
const aiProgress = ref({ percent: 0, text: '' })

async function generateHabitSuggestions() {
  if (isGeneratingHabits.value) return
  
  isGeneratingHabits.value = true
  aiProgress.value = { percent: 0, text: 'Анализ ваших целей...' }
  
  try {
    const result = await aiTasksStore.startTaskAndWait('habit_create_help', {}, 120000)
    console.log('[HabitManager] AI habit suggestions completed:', result)
    handleAIHabitResult(result)
  } catch (error) {
    console.error('[HabitManager] AI habit generation error:', error)
  } finally {
    isGeneratingHabits.value = false
  }
}

watch(() => aiTasksStore.getTaskProgress('habit_create_help'), (progress) => {
  if (progress && isGeneratingHabits.value) {
    aiProgress.value = progress
  }
}, { deep: true })

function handleAIHabitResult(result) {
  if (result.habits && result.habits.length > 0) {
    aiHabitSuggestions.value = result.habits.map(h => ({
      name: h.name || h.title,
      icon: h.icon || '✨',
      xpReward: h.xp_reward || 5,
      description: h.description
    }))
  }
}

function addSuggestedHabit(habit) {
  appStore.addHabit({
    name: habit.name,
    icon: habit.icon,
    xpReward: habit.xpReward || 5
  })
  
  aiHabitSuggestions.value = aiHabitSuggestions.value.filter(h => h.name !== habit.name)
}

function dismissSuggestion(habit) {
  aiHabitSuggestions.value = aiHabitSuggestions.value.filter(h => h.name !== habit.name)
}

function cleanup() {
  aiHabitSuggestions.value = []
  isGeneratingHabits.value = false
  aiProgress.value = { percent: 0, text: '' }
}

onBeforeUnmount(() => {
  cleanup()
})
</script>

<style scoped>
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
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.add-habit-form {
  margin-bottom: 1.5rem;
}

.form-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.icon-picker {
  width: 44px;
  height: 44px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-secondary);
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-picker:hover {
  border-color: var(--primary-color);
}

.habit-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 0.95rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.xp-input {
  width: 60px;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 0.95rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  text-align: center;
}

.btn-sm {
  padding: 0.75rem;
  min-width: 44px;
}

.icon-picker-dropdown {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.25rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border-radius: 10px;
  border: 1px solid var(--border-color);
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

.habits-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.list-section h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.section-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.empty-state {
  padding: 1rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
  background: var(--bg-secondary);
  border-radius: 10px;
}

.habit-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 10px;
  margin-bottom: 0.5rem;
}

.habit-row.default {
  opacity: 0.7;
}

.habit-icon {
  font-size: 1.1rem;
}

.habit-name {
  flex: 1;
  font-size: 0.95rem;
}

.habit-xp {
  font-size: 0.8rem;
  color: var(--primary-color);
  font-weight: 500;
}

.badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  background: var(--bg-tertiary, rgba(0,0,0,0.1));
  border-radius: 4px;
  color: var(--text-muted);
}

.btn-icon {
  background: none;
  border: none;
  padding: 0.4rem;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--bg-tertiary, rgba(0,0,0,0.05));
  color: var(--text-primary);
}

.btn-icon.btn-danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.edit-habit-form h3 {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 0.95rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.delete-confirm {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background: rgba(239, 68, 68, 0.05);
}

.delete-confirm p {
  margin-bottom: 1rem;
  font-weight: 500;
}

.confirm-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--bg-tertiary, rgba(0,0,0,0.1));
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.default-section {
  opacity: 0.8;
}

.btn-ai-suggest {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  margin-top: 0.75rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  justify-content: center;
}

.btn-ai-suggest:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.btn-ai-suggest:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ai-suggestions-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(139, 92, 246, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(139, 92, 246, 0.1);
}

.ai-suggestions-section h4 {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.suggestion-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.suggestion-card {
  background: var(--card-bg);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.suggestion-header .habit-icon {
  font-size: 1.25rem;
}

.suggestion-header .habit-name {
  flex: 1;
  font-weight: 500;
}

.suggestion-header .habit-xp {
  font-size: 0.8rem;
  color: var(--primary-color);
  font-weight: 600;
}

.suggestion-description {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0 0 0.75rem;
  line-height: 1.4;
}

.suggestion-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-sm {
  padding: 0.4rem 0.75rem;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}

.btn-ghost:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}
</style>
