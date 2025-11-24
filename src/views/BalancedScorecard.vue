<template>
  <div class="ssp-container">
    <header class="page-header">
      <div>
        <h1>Сбалансированная система показателей</h1>
        <p class="subtitle">
          Оцените все сферы своей жизни для понимания текущего баланса и выявления зон роста
        </p>
      </div>
    </header>

    <div class="overview-card card">
      <div class="overview-header">
        <div class="overall-score">
          <div class="score-circle">
            <div class="score-number">{{ averageScore }}</div>
            <div class="score-label">/ 10</div>
          </div>
          <div class="score-info">
            <h3>Общий баланс</h3>
            <p>{{ getScoreDescription(averageScore) }}</p>
          </div>
        </div>
        <div class="score-tip">
          <span class="tip-icon">💡</span>
          <p>Сферы с оценкой ниже 5 требуют особого внимания</p>
        </div>
      </div>
    </div>

    <div class="spheres-grid">
      <div 
        v-for="sphere in lifeSpheres" 
        :key="sphere.id"
        class="sphere-card card"
        :class="{ 'needs-attention': sphere.score < 5 }"
      >
        <div class="sphere-header">
          <div class="sphere-title">
            <span class="sphere-icon">{{ sphere.icon }}</span>
            <h3>{{ sphere.name }}</h3>
          </div>
          <button 
            class="btn-icon" 
            @click="openModal(sphere)"
            title="Редактировать"
          >
            ✏️
          </button>
        </div>

        <div class="sphere-body">
          <div class="score-slider">
            <input 
              type="range" 
              min="0" 
              max="10" 
              v-model.number="sphere.score"
              @change="saveSphere(sphere.id)"
              class="slider"
            />
            <div class="score-display">
              <span class="score-current">{{ sphere.score }}</span>
              <span class="score-max">/ 10</span>
            </div>
          </div>

          <div v-if="sphere.notes" class="sphere-notes">
            {{ sphere.notes }}
          </div>
          <div v-else class="sphere-notes empty">
            Добавьте заметки о текущем состоянии этой сферы
          </div>

          <div v-if="sphere.goals && sphere.goals.length > 0" class="sphere-goals">
            <div class="goals-label">Связанные цели:</div>
            <div class="goals-list">
              <span 
                v-for="goalId in sphere.goals" 
                :key="goalId"
                class="goal-tag"
              >
                {{ getGoalName(goalId) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for editing sphere -->
    <transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h2>
              <span class="sphere-icon">{{ selectedSphere?.icon }}</span>
              {{ selectedSphere?.name }}
            </h2>
            <button class="btn-close" @click="closeModal">✕</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Оценка ({{ selectedSphere?.score }}/10)</label>
              <input 
                type="range" 
                min="0" 
                max="10" 
                v-model.number="selectedSphere.score"
                class="slider large"
              />
              <div class="score-description">
                {{ getScoreDescription(selectedSphere?.score) }}
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Заметки и размышления</label>
              <textarea 
                v-model="selectedSphere.notes"
                class="form-textarea"
                rows="5"
                placeholder="Опишите текущее состояние этой сферы жизни. Что работает хорошо? Что требует улучшения?"
              ></textarea>
            </div>

            <div class="modal-tips">
              <h4>Вопросы для рефлексии:</h4>
              <ul>
                <li v-for="(question, index) in getReflectionQuestions(selectedSphere?.id)" :key="index">
                  {{ question }}
                </li>
              </ul>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeModal">Отмена</button>
            <button class="btn btn-primary" @click="saveSphereModal">Сохранить</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()

const lifeSpheres = computed(() => store.lifeSpheres)
const averageScore = computed(() => store.averageScore)
const goals = computed(() => store.goals)

const showModal = ref(false)
const selectedSphere = ref(null)

function openModal(sphere) {
  selectedSphere.value = { ...sphere }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedSphere.value = null
}

function saveSphere(sphereId) {
  const sphere = lifeSpheres.value.find(s => s.id === sphereId)
  if (sphere) {
    store.updateSphere(sphereId, { score: sphere.score })
  }
}

function saveSphereModal() {
  if (selectedSphere.value) {
    store.updateSphere(selectedSphere.value.id, {
      score: selectedSphere.value.score,
      notes: selectedSphere.value.notes
    })
    closeModal()
  }
}

function getGoalName(goalId) {
  const goal = goals.value.find(g => g.id === goalId)
  return goal ? goal.title : 'Неизвестная цель'
}

function getScoreDescription(score) {
  if (score >= 9) return '🔥 Отлично! Всё под контролем'
  if (score >= 7) return '✅ Хорошо, но есть куда расти'
  if (score >= 5) return '⚠️ Средне, требует внимания'
  if (score >= 3) return '❗ Проблемная зона'
  return '🚨 Критическое состояние'
}

function getReflectionQuestions(sphereId) {
  const questions = {
    wealth: [
      'Достаточно ли у меня денег для комфортной жизни?',
      'Есть ли финансовая подушка безопасности?',
      'Умею ли я управлять своими финансами?',
      'Растет ли мой доход?'
    ],
    hobbies: [
      'Достаточно ли я отдыхаю?',
      'Есть ли у меня хобби, которые приносят радость?',
      'Умею ли я получать удовольствие от жизни?',
      'Соблюдаю ли баланс между работой и отдыхом?'
    ],
    friendship: [
      'Есть ли у меня близкие друзья?',
      'Окружают ли меня позитивные люди?',
      'Чувствую ли я поддержку от окружения?',
      'Развиваю ли я свои социальные связи?'
    ],
    health: [
      'Как я себя чувствую физически?',
      'Достаточно ли я сплю и отдыхаю?',
      'Правильно ли я питаюсь?',
      'Есть ли регулярная физическая активность?'
    ],
    career: [
      'Доволен ли я своей работой?',
      'Развиваюсь ли я профессионально?',
      'Есть ли перспективы роста?',
      'Соответствует ли работа моим ценностям?'
    ],
    love: [
      'Качественно ли я провожу время с близкими?',
      'Чувствую ли я любовь и поддержку?',
      'Работаю ли я над отношениями?',
      'Гармоничны ли мои семейные отношения?'
    ]
  }
  return questions[sphereId] || []
}
</script>

<style scoped>
.ssp-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
}

.overview-card {
  margin-bottom: 2rem;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.overall-score {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.score-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.score-number {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
}

.score-label {
  font-size: 1rem;
  opacity: 0.9;
}

.score-info h3 {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.score-info p {
  color: var(--text-secondary);
  margin: 0;
}

.score-tip {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(99, 102, 241, 0.05);
  border-radius: var(--radius-md);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.tip-icon {
  font-size: 1.5rem;
}

.score-tip p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9375rem;
}

.spheres-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.sphere-card {
  transition: all 0.2s ease;
}

.sphere-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.sphere-card.needs-attention {
  border-left: 4px solid var(--warning-color);
}

.sphere-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.sphere-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sphere-icon {
  font-size: 1.75rem;
}

.sphere-title h3 {
  font-size: 1.25rem;
  margin: 0;
}

.btn-icon {
  background: var(--bg-tertiary);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--border-color);
  transform: scale(1.05);
}

.sphere-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.score-slider {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: var(--bg-tertiary);
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  border: none;
  box-shadow: var(--shadow-sm);
}

.slider.large {
  height: 12px;
}

.slider.large::-webkit-slider-thumb {
  width: 28px;
  height: 28px;
}

.slider.large::-moz-range-thumb {
  width: 28px;
  height: 28px;
}

.score-display {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.score-current {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-color);
}

.score-max {
  font-size: 1.125rem;
  color: var(--text-secondary);
}

.sphere-notes {
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--text-secondary);
}

.sphere-notes.empty {
  font-style: italic;
  opacity: 0.7;
}

.sphere-goals {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.goals-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.goals-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.goal-tag {
  padding: 0.375rem 0.75rem;
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  font-weight: 500;
}

/* Modal styles */
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

.modal {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.score-description {
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  text-align: center;
  font-weight: 500;
  color: var(--text-primary);
}

.modal-tips {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: rgba(99, 102, 241, 0.05);
  border-radius: var(--radius-md);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.modal-tips h4 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: var(--primary-color);
}

.modal-tips ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.modal-tips li {
  padding: 0.5rem 0;
  color: var(--text-secondary);
  font-size: 0.9375rem;
  position: relative;
  padding-left: 1.5rem;
}

.modal-tips li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--primary-color);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .spheres-grid {
    grid-template-columns: 1fr;
  }

  .overview-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
