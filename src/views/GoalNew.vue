<template>
  <div class="goal-new-container">
    <header class="page-header">
      <button class="btn btn-secondary btn-back" @click="goBack">
        <span>←</span>
        Назад к списку
      </button>
    </header>

    <div class="edit-layout">
      <div class="main-content">
        <div class="card">
          <div class="card-header">
            <h2>Новая цель</h2>
          </div>

          <div class="form-section">
            <div class="form-group">
              <label class="form-label">Название цели *</label>
              <input 
                type="text"
                :value="goalForm.title"
                @input="updateField('title', $event.target.value)"
                class="form-input form-input-lg"
                placeholder="Например: Выучить английский до B2"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Описание и мотивация</label>
              <textarea 
                :value="goalForm.description"
                @input="updateField('description', $event.target.value)"
                class="form-textarea"
                rows="4"
                placeholder="Почему эта цель важна для вас? Что изменится в вашей жизни?"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Сфера жизни</label>
                <select 
                  :value="goalForm.sphereId"
                  @change="updateField('sphereId', $event.target.value)"
                  class="form-select"
                >
                  <option value="">Выберите сферу</option>
                  <option 
                    v-for="sphere in lifeSpheres" 
                    :key="sphere.id"
                    :value="sphere.id"
                  >
                    {{ sphere.icon }} {{ sphere.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Дедлайн</label>
                <input 
                  type="date"
                  :value="goalForm.deadline"
                  @input="updateField('deadline', $event.target.value)"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">MVP (Минимально жизнеспособный результат)</label>
              <input 
                type="text"
                :value="goalForm.mvp"
                @input="updateField('mvp', $event.target.value)"
                class="form-input"
                placeholder="Какой минимальный результат будет успехом?"
              />
              <span class="form-hint">Определите самый простой вариант достижения цели — что вас уже порадует</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Декомпозиция на шаги</h3>
            <span class="steps-count">{{ goalForm.steps.length }} шагов</span>
          </div>

          <div class="form-hint decomposition-hint">
            Разбейте цель на конкретные действия. Каждый шаг должен быть понятным и выполнимым за 1-4 часа.
          </div>

          <div class="steps-section">
            <div 
              v-for="(step, index) in goalForm.steps" 
              :key="step.id || index"
              class="step-card"
            >
              <div class="step-number-badge">{{ index + 1 }}</div>
              <input 
                type="text"
                :value="step.title"
                @input="updateStep(index, 'title', $event.target.value)"
                class="step-input"
                :placeholder="`Шаг ${index + 1}: что конкретно нужно сделать?`"
              />
              <button 
                class="btn-icon delete"
                @click="removeStep(index)"
                title="Удалить шаг"
              >
                ✕
              </button>
            </div>

            <button class="btn btn-secondary add-step-btn" @click="addStep">
              ➕ Добавить шаг
            </button>
          </div>
        </div>
      </div>

      <div class="sidebar-actions">
        <div class="card sticky-card">
          <h4>Действия</h4>
          <div class="action-buttons">
            <button class="btn btn-primary btn-lg btn-full" @click="createGoal">
              ✨ Создать цель
            </button>
            <button class="btn btn-secondary btn-full" @click="goBack">
              Отмена
            </button>
          </div>

          <div class="mentor-section">
            <h5>Нужна помощь?</h5>
            <button 
              class="btn btn-mentor btn-full" 
              @click="requestMentorHelp"
              :disabled="isMentorLoading"
            >
              <span v-if="isMentorLoading">
                {{ mentorProgress.text || 'Загрузка...' }}
              </span>
              <span v-else>
                🤖 Помощь от ментора
              </span>
            </button>
            <p v-if="mentorError" class="mentor-error">{{ mentorError }}</p>
          </div>

          <div class="tips-section">
            <h5>Советы по постановке цели</h5>
            <ul class="tips-list">
              <li>Формулируйте цель конкретно и измеримо</li>
              <li>Определите MVP — минимальный результат</li>
              <li>Разбейте на шаги по 1-4 часа каждый</li>
              <li>Укажите дедлайн для мотивации</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div v-if="mentorSuggestions.length > 0" class="mentor-suggestions-overlay" @click.self="dismissSuggestions">
      <div class="mentor-suggestions-modal">
        <div class="modal-header">
          <h3>Предложения от ментора</h3>
          <button class="btn-close" @click="dismissSuggestions">✕</button>
        </div>
        <div class="suggestions-list">
          <div 
            v-for="suggestion in mentorSuggestions" 
            :key="suggestion.id"
            class="suggestion-card"
            @click="selectSuggestion(suggestion)"
          >
            <h4>{{ suggestion.title }}</h4>
            <p v-if="suggestion.description">{{ suggestion.description }}</p>
            <p v-if="suggestion.whyImportant" class="why-important">{{ suggestion.whyImportant }}</p>
          </div>
        </div>
      </div>
    </div>

    <AICurator context="decomposition" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { useAITasksStore } from '../stores/aiTasks'
import AICurator from '../components/AICurator.vue'

const router = useRouter()
const store = useAppStore()
const aiTasksStore = useAITasksStore()

const isMentorLoading = ref(false)
const mentorSuggestions = ref([])
const mentorError = ref(null)
const mentorProgress = ref({ percent: 0, text: '' })

const categoryBackendToFrontend = {
  'welfare': 'wealth',
  'hobby': 'hobbies',
  'environment': 'friendship',
  'health_sport': 'health',
  'health': 'health',
  'work': 'career',
  'family': 'love'
}

async function requestMentorHelp() {
  isMentorLoading.value = true
  mentorError.value = null
  mentorProgress.value = { percent: 0, text: 'Запрашиваю идеи...' }
  
  try {
    const context = {}
    if (goalForm.value.sphereId) {
      context.category = goalForm.value.sphereId
    }
    
    const result = await aiTasksStore.startTaskAndWait('goal_mentor_help', context, 120000)
    handleMentorResult(result)
  } catch (error) {
    mentorError.value = error.message
    isMentorLoading.value = false
  }
}

watch(() => aiTasksStore.getTaskProgress('goal_mentor_help'), (progress) => {
  if (progress && isMentorLoading.value) {
    mentorProgress.value = progress
  }
}, { deep: true })

function handleMentorResult(result) {
  isMentorLoading.value = false
  
  if (result.suggestions && result.suggestions.length > 0) {
    mentorSuggestions.value = result.suggestions.map((s, idx) => ({
      id: `suggestion-${Date.now()}-${idx}`,
      title: s.title,
      description: s.description,
      whyImportant: s.why_important,
      category: s.category ? categoryBackendToFrontend[s.category] || s.category : null
    }))
  }
}

function selectSuggestion(suggestion) {
  goalForm.value.title = suggestion.title
  goalForm.value.description = suggestion.description || suggestion.whyImportant || ''
  if (suggestion.category) {
    goalForm.value.sphereId = suggestion.category
  }
  mentorSuggestions.value = []
}

function dismissSuggestions() {
  mentorSuggestions.value = []
}

const lifeSpheres = computed(() => store.lifeSpheres)

const goalForm = ref({
  title: '',
  description: '',
  sphereId: '',
  deadline: '',
  mvp: '',
  steps: []
})

function updateField(field, value) {
  goalForm.value[field] = value
}

function addStep() {
  goalForm.value.steps.push({ 
    id: Date.now().toString(),
    title: '', 
    completed: false 
  })
}

function removeStep(index) {
  goalForm.value.steps.splice(index, 1)
}

function updateStep(index, field, value) {
  goalForm.value.steps[index][field] = value
}

function createGoal() {
  if (!goalForm.value.title.trim()) {
    alert('Введите название цели')
    return
  }

  const filteredSteps = goalForm.value.steps
    .filter(s => s.title.trim())
    .map(s => ({
      id: s.id || Date.now().toString(),
      title: s.title,
      completed: false
    }))

  const goalData = {
    title: goalForm.value.title,
    description: goalForm.value.description,
    sphereId: goalForm.value.sphereId,
    deadline: goalForm.value.deadline,
    mvp: goalForm.value.mvp,
    steps: filteredSteps
  }

  store.addGoal(goalData)
  router.push('/app/goals')
}

function goBack() {
  router.push('/app/goals')
}
</script>

<style scoped>
.goal-new-container {
  max-width: var(--content-width-narrow);
  margin: 0 auto;
  padding: var(--container-padding);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  align-items: start;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.card-header h2 {
  font-size: 1.5rem;
  margin: 0;
}

.card-header h3 {
  font-size: 1.25rem;
  margin: 0;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-input-lg {
  font-size: 1.25rem;
  padding: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.steps-count {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.decomposition-hint {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.steps-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.step-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.step-number-badge {
  width: 28px;
  height: 28px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.step-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 1rem;
  background: var(--bg-primary);
  transition: all 0.2s ease;
}

.step-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.add-step-btn {
  margin-top: 0.5rem;
}

.sidebar-actions {
  position: relative;
}

.sticky-card {
  position: sticky;
  top: 2rem;
}

.sticky-card h4 {
  margin-bottom: 1rem;
  font-size: 1rem;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.btn-full {
  width: 100%;
}

.tips-section {
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.tips-section h5 {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tips-list li {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  padding-left: 1.25rem;
  position: relative;
  line-height: 1.4;
}

.tips-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--success-color);
  font-weight: 600;
}

@media (max-width: 1024px) {
  .edit-layout {
    grid-template-columns: 1fr;
  }

  .sidebar-actions {
    order: -1;
  }

  .sticky-card {
    position: static;
  }

  .action-buttons {
    flex-direction: row;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }
}

.mentor-section {
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
}

.mentor-section h5 {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.btn-mentor {
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-mentor:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-mentor:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.mentor-error {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: var(--error-color);
}

.mentor-suggestions-overlay {
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

.mentor-suggestions-modal {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.mentor-suggestions-modal .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.mentor-suggestions-modal .modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0.25rem;
}

.btn-close:hover {
  color: var(--text-primary);
}

.suggestions-list {
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.suggestion-card {
  padding: 1rem 1.25rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.suggestion-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.suggestion-card h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: var(--text-primary);
}

.suggestion-card p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.suggestion-card .why-important {
  margin-top: 0.5rem;
  font-style: italic;
  color: var(--primary-color);
}
</style>
