<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="closeModal">
      <div class="mentor-modal">
        <div class="modal-header">
          <h3>
            <Bot :size="20" class="modal-header-icon" />
            Помощь от ментора
          </h3>
          <button class="modal-close" @click="closeModal">
            <X :size="20" />
          </button>
        </div>

        <div class="modal-body">
          <template v-if="step === 'intro'">
            <div class="intro-section">
              <div class="intro-icon">
                <Sparkles :size="48" />
              </div>
              <h4>Персональный подбор целей</h4>
              <p class="intro-description">
                Ментор проанализирует ваши данные из Колеса жизни: оценки сфер, 
                зоны роста и ваши желания. На основе этого подберет 3 цели, 
                которые помогут вам развиваться в приоритетных направлениях.
              </p>
              <div class="intro-features">
                <div class="feature-item">
                  <Target :size="18" />
                  <span>Цели на основе ваших зон роста</span>
                </div>
                <div class="feature-item">
                  <MessageCircle :size="18" />
                  <span>Объяснение пользы каждой цели</span>
                </div>
                <div class="feature-item">
                  <ListChecks :size="18" />
                  <span>Автоматическая декомпозиция на шаги</span>
                </div>
              </div>
              <button class="btn btn-primary btn-lg" @click="startGeneration">
                <Sparkles :size="18" />
                Подобрать цели
              </button>
            </div>
          </template>

          <template v-else-if="step === 'loading'">
            <div class="loading-section">
              <div class="loading-spinner-large"></div>
              <h4>Ментор анализирует ваш профиль...</h4>
              <p class="loading-hint">Это займет несколько секунд</p>
            </div>
          </template>

          <template v-else-if="step === 'selection'">
            <div class="selection-section">
              <h4>Рекомендованные цели</h4>
              <p class="selection-hint">Выберите цели, которые хотите добавить</p>
              
              <div class="suggestions-list">
                <div 
                  v-for="(suggestion, idx) in suggestions" 
                  :key="idx"
                  class="suggestion-card"
                  :class="{ selected: selectedGoals.includes(idx) }"
                  @click="toggleGoalSelection(idx)"
                >
                  <div class="suggestion-checkbox">
                    <CheckSquare v-if="selectedGoals.includes(idx)" :size="20" />
                    <Square v-else :size="20" />
                  </div>
                  <div class="suggestion-content">
                    <div class="suggestion-header">
                      <span class="sphere-badge" :style="{ background: getSphereColor(suggestion.sphereId) }">
                        {{ getSphereName(suggestion.sphereId) }}
                      </span>
                    </div>
                    <h5 class="suggestion-title">{{ suggestion.title }}</h5>
                    <p class="suggestion-reason">
                      <Bot :size="14" />
                      {{ suggestion.whyUseful }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="selection-actions">
                <button class="btn btn-secondary" @click="step = 'intro'">
                  <ArrowLeft :size="16" />
                  Назад
                </button>
                <button 
                  class="btn btn-primary" 
                  :disabled="selectedGoals.length === 0"
                  @click="confirmSelection"
                >
                  Добавить выбранные ({{ selectedGoals.length }})
                </button>
              </div>
            </div>
          </template>

          <template v-else-if="step === 'creating'">
            <div class="creating-section">
              <div class="loading-spinner-large"></div>
              <h4>Создаем цели и шаги...</h4>
              <p class="creating-progress">{{ creatingProgress }}</p>
            </div>
          </template>

          <template v-else-if="step === 'confirmation'">
            <div class="confirmation-section">
              <div class="success-icon">
                <CheckCircle :size="48" />
              </div>
              <h4>Цели успешно созданы!</h4>
              <p class="confirmation-text">
                Добавлено {{ createdGoals.length }} {{ getGoalsWord(createdGoals.length) }} с декомпозицией на шаги
              </p>
              
              <div class="created-goals-list">
                <div v-for="goal in createdGoals" :key="goal.id" class="created-goal-item">
                  <CheckCircle :size="16" class="created-icon" />
                  <span>{{ goal.text }}</span>
                </div>
              </div>

              <div class="confirmation-actions">
                <button class="btn btn-secondary" @click="closeModal">
                  Закрыть
                </button>
                <button class="btn btn-primary" @click="goToPlanning">
                  <Calendar :size="16" />
                  Запланировать сейчас
                </button>
              </div>
            </div>
          </template>

          <template v-else-if="step === 'error'">
            <div class="error-section">
              <div class="error-icon">
                <AlertTriangle :size="48" />
              </div>
              <h4>Не удалось подобрать цели</h4>
              <p class="error-text">{{ errorMessage }}</p>
              <button class="btn btn-primary" @click="step = 'intro'">
                Попробовать снова
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { generateMentorGoalSuggestions, generateStepsWithAI } from '@/services/aiGoalService.js'
import {
  Bot,
  X,
  Sparkles,
  Target,
  MessageCircle,
  ListChecks,
  Square,
  CheckSquare,
  ArrowLeft,
  CheckCircle,
  Calendar,
  AlertTriangle
} from 'lucide-vue-next'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'goals-created'])

const router = useRouter()
const appStore = useAppStore()

const step = ref('intro')
const suggestions = ref([])
const selectedGoals = ref([])
const createdGoals = ref([])
const creatingProgress = ref('')
const errorMessage = ref('')

const sphereColors = {
  wealth: '#f59e0b',
  hobbies: '#ec4899',
  friendship: '#8b5cf6',
  health: '#10b981',
  career: '#3b82f6',
  love: '#ef4444'
}

const sphereNames = {
  wealth: 'Благосостояние',
  hobbies: 'Хобби и отдых',
  friendship: 'Дружба и окружение',
  health: 'Здоровье и спорт',
  career: 'Работа и карьера',
  love: 'Любовь, семья'
}

function getSphereColor(sphereId) {
  return sphereColors[sphereId] || '#10b981'
}

function getSphereName(sphereId) {
  return sphereNames[sphereId] || sphereId
}

function getGoalsWord(count) {
  if (count === 1) return 'цель'
  if (count >= 2 && count <= 4) return 'цели'
  return 'целей'
}

function toggleGoalSelection(idx) {
  const index = selectedGoals.value.indexOf(idx)
  if (index === -1) {
    selectedGoals.value.push(idx)
  } else {
    selectedGoals.value.splice(index, 1)
  }
}

async function startGeneration() {
  step.value = 'loading'
  selectedGoals.value = []
  
  try {
    const sspData = prepareSSPData()
    const result = await generateMentorGoalSuggestions(sspData)
    
    if (result.success && result.suggestions?.length > 0) {
      suggestions.value = result.suggestions
      step.value = 'selection'
    } else {
      errorMessage.value = result.error || 'Не удалось получить рекомендации'
      step.value = 'error'
    }
  } catch (error) {
    console.error('[MentorModal] Generation error:', error)
    errorMessage.value = 'Произошла ошибка при генерации целей'
    step.value = 'error'
  }
}

function prepareSSPData() {
  const lifeSpheres = appStore.lifeSpheres || []
  
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
      }))
  }
}

async function confirmSelection() {
  step.value = 'creating'
  createdGoals.value = []
  
  const selected = selectedGoals.value.map(idx => suggestions.value[idx])
  
  for (let i = 0; i < selected.length; i++) {
    const suggestion = selected[i]
    creatingProgress.value = `Создаем цель ${i + 1} из ${selected.length}...`
    
    try {
      const goalId = appStore.addGoalFromBank({
        text: suggestion.title,
        sphereId: suggestion.sphereId,
        whyImportant: suggestion.whyUseful,
        generatedByAI: true,
        steps: []
      })
      
      creatingProgress.value = `Генерируем шаги для цели ${i + 1}...`
      
      const stepsResult = await generateStepsWithAI(suggestion.title, suggestion.sphereId)
      
      if (stepsResult.success && stepsResult.steps?.length > 0) {
        const goal = appStore.ideas.find(g => g.id === goalId)
        if (goal) {
          stepsResult.steps.forEach((stepText, idx) => {
            goal.steps.push({
              id: `step-${Date.now()}-${idx}`,
              text: stepText,
              completed: false
            })
          })
        }
      }
      
      createdGoals.value.push({
        id: goalId,
        text: suggestion.title
      })
    } catch (error) {
      console.error('[MentorModal] Error creating goal:', error)
    }
  }
  
  step.value = 'confirmation'
  emit('goals-created', createdGoals.value)
}

function goToPlanning() {
  closeModal()
  router.push('/app/planning')
}

function closeModal() {
  step.value = 'intro'
  suggestions.value = []
  selectedGoals.value = []
  createdGoals.value = []
  emit('close')
}
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

.mentor-modal {
  background: var(--bg-primary, #fff);
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary, #1f2937);
}

.modal-header-icon {
  color: #10b981;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-secondary, #6b7280);
  transition: all 0.2s;
}

.modal-close:hover {
  background: var(--bg-secondary, #f3f4f6);
  color: var(--text-primary, #1f2937);
}

.modal-body {
  padding: 1.5rem;
}

.intro-section {
  text-align: center;
}

.intro-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #10b981, #22c55e);
  border-radius: 50%;
  color: #fff;
}

.intro-section h4 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: var(--text-primary, #1f2937);
}

.intro-description {
  color: var(--text-secondary, #6b7280);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.intro-features {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary, #f3f4f6);
  border-radius: 10px;
  color: var(--text-primary, #1f2937);
  font-size: 0.9rem;
}

.feature-item svg {
  color: #10b981;
  flex-shrink: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #10b981;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #059669;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-secondary, #f3f4f6);
  color: var(--text-primary, #1f2937);
}

.btn-secondary:hover {
  background: var(--bg-tertiary, #e5e7eb);
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1rem;
  width: 100%;
}

.loading-section,
.creating-section {
  text-align: center;
  padding: 2rem 0;
}

.loading-spinner-large {
  width: 48px;
  height: 48px;
  border: 3px solid var(--bg-secondary, #f3f4f6);
  border-top-color: #10b981;
  border-radius: 50%;
  margin: 0 auto 1.5rem;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-section h4,
.creating-section h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: var(--text-primary, #1f2937);
}

.loading-hint,
.creating-progress {
  color: var(--text-secondary, #6b7280);
  font-size: 0.9rem;
}

.selection-section h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  color: var(--text-primary, #1f2937);
}

.selection-hint {
  color: var(--text-secondary, #6b7280);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.suggestion-card {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-secondary, #f3f4f6);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-card:hover {
  background: var(--bg-tertiary, #e5e7eb);
}

.suggestion-card.selected {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.suggestion-checkbox {
  flex-shrink: 0;
  color: var(--text-secondary, #6b7280);
}

.suggestion-card.selected .suggestion-checkbox {
  color: #10b981;
}

.suggestion-content {
  flex: 1;
  min-width: 0;
}

.suggestion-header {
  margin-bottom: 0.5rem;
}

.sphere-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #fff;
  border-radius: 4px;
}

.suggestion-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: var(--text-primary, #1f2937);
}

.suggestion-reason {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary, #6b7280);
  line-height: 1.5;
  margin: 0;
}

.suggestion-reason svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: #10b981;
}

.selection-actions {
  display: flex;
  gap: 0.75rem;
}

.selection-actions .btn {
  flex: 1;
}

.confirmation-section {
  text-align: center;
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: #dcfce7;
  border-radius: 50%;
  color: #22c55e;
}

.confirmation-section h4 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: var(--text-primary, #1f2937);
}

.confirmation-text {
  color: var(--text-secondary, #6b7280);
  margin-bottom: 1.5rem;
}

.created-goals-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.created-goal-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary, #f3f4f6);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--text-primary, #1f2937);
}

.created-icon {
  color: #22c55e;
  flex-shrink: 0;
}

.confirmation-actions {
  display: flex;
  gap: 0.75rem;
}

.confirmation-actions .btn {
  flex: 1;
}

.error-section {
  text-align: center;
  padding: 1rem 0;
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: #fef3c7;
  border-radius: 50%;
  color: #f59e0b;
}

.error-section h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: var(--text-primary, #1f2937);
}

.error-text {
  color: var(--text-secondary, #6b7280);
  margin-bottom: 1.5rem;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 480px) {
  .mentor-modal {
    max-height: 95vh;
    border-radius: 16px 16px 0 0;
    margin-top: auto;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .selection-actions,
  .confirmation-actions {
    flex-direction: column;
  }
}
</style>
