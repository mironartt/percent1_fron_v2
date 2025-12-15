<template>
  <div class="newyear-test">
    <header class="test-header">
      <div class="container">
        <router-link to="/land/newyear" class="back-link">
          ← Назад
        </router-link>
        <div class="progress-info">
          <span>{{ store.currentQuestion + 1 }} / {{ store.questions.length }}</span>
        </div>
      </div>
    </header>

    <div class="progress-bar-container">
      <div class="progress-bar" :style="{ width: store.progress + '%' }"></div>
    </div>

    <main class="test-main">
      <div class="container">
        <div class="question-card" v-if="store.currentQuestionData">
          <div class="sphere-badge" :style="{ background: getSphereColor() }">
            {{ getSphereIcon() }} {{ getSphereName() }}
          </div>
          
          <h2 class="question-text">{{ store.currentQuestionData.text }}</h2>

          <div class="answer-section" v-if="store.currentQuestionData.type === 'scale'">
            <div class="scale-container">
              <input 
                type="range" 
                min="0" 
                max="10" 
                step="1"
                :value="currentAnswer || 5"
                @input="handleScaleChange"
                class="scale-slider"
              >
              <div class="scale-labels">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
            <div class="scale-value">
              <span class="value-number">{{ currentAnswer !== undefined ? currentAnswer : 5 }}</span>
              <span class="value-label">{{ getScaleLabel() }}</span>
            </div>
          </div>

          <div class="answer-section" v-else-if="store.currentQuestionData.type === 'text'">
            <textarea
              v-model="textAnswer"
              @input="handleTextChange"
              placeholder="Напиши свой ответ..."
              class="text-input"
              rows="4"
            ></textarea>
            <p class="text-hint">Минимум 10 символов</p>
          </div>
        </div>

        <div class="navigation">
          <button 
            class="nav-btn prev" 
            @click="store.prevQuestion()"
            :disabled="store.currentQuestion === 0"
          >
            ← Назад
          </button>
          
          <button 
            v-if="!store.isLastQuestion"
            class="nav-btn next"
            @click="store.nextQuestion()"
            :disabled="!store.canProceed"
          >
            Далее →
          </button>
          
          <button 
            v-else
            class="nav-btn finish"
            @click="finishTest"
            :disabled="!store.canProceed"
          >
            Завершить тест ✓
          </button>
        </div>

        <div class="question-dots">
          <button 
            v-for="(q, index) in store.questions" 
            :key="q.id"
            class="dot"
            :class="{ 
              active: index === store.currentQuestion,
              answered: store.answers[q.id] !== undefined
            }"
            @click="store.goToQuestion(index)"
          ></button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNewYearStore } from '@/stores/newyear'

const router = useRouter()
const store = useNewYearStore()
const textAnswer = ref('')

const currentAnswer = computed(() => {
  if (!store.currentQuestionData) return undefined
  return store.answers[store.currentQuestionData.id]
})

watch(() => store.currentQuestion, () => {
  if (store.currentQuestionData?.type === 'text') {
    textAnswer.value = store.answers[store.currentQuestionData.id] || ''
  }
}, { immediate: true })

function getSphereColor() {
  if (!store.currentQuestionData) return '#10b981'
  const sphere = store.spheres.find(s => s.id === store.currentQuestionData.sphere)
  return sphere?.color || '#10b981'
}

function getSphereIcon() {
  if (!store.currentQuestionData) return '📝'
  const sphere = store.spheres.find(s => s.id === store.currentQuestionData.sphere)
  return sphere?.icon || '📝'
}

function getSphereName() {
  if (!store.currentQuestionData) return ''
  const sphere = store.spheres.find(s => s.id === store.currentQuestionData.sphere)
  return sphere?.name || ''
}

function getScaleLabel() {
  const value = currentAnswer.value !== undefined ? currentAnswer.value : 5
  if (value <= 2) return 'Очень плохо'
  if (value <= 4) return 'Ниже среднего'
  if (value <= 6) return 'Средне'
  if (value <= 8) return 'Хорошо'
  return 'Отлично'
}

function handleScaleChange(event) {
  const value = parseInt(event.target.value, 10)
  store.setAnswer(store.currentQuestionData.id, value)
}

function handleTextChange() {
  store.setAnswer(store.currentQuestionData.id, textAnswer.value)
}

function finishTest() {
  store.completeTest()
  router.push('/land/newyear/results')
}
</script>

<style scoped>
.newyear-test {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #f8fafc;
}

.container {
  max-width: 700px;
  margin: 0 auto;
  padding: 0 20px;
}

.test-header {
  padding: 20px 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(10px);
}

.test-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-link {
  color: #94a3b8;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.back-link:hover {
  color: #f8fafc;
}

.progress-info {
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
}

.progress-bar-container {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(148, 163, 184, 0.2);
  z-index: 99;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  transition: width 0.3s ease;
}

.test-main {
  padding: 100px 0 40px;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.question-card {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 20px;
  padding: 40px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.sphere-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 24px;
  color: white;
}

.question-text {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 32px;
}

.answer-section {
  margin-bottom: 24px;
}

.scale-container {
  margin-bottom: 24px;
}

.scale-slider {
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  background: rgba(148, 163, 184, 0.2);
  border-radius: 4px;
  outline: none;
}

.scale-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.scale-slider::-moz-range-thumb {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.scale-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  color: #64748b;
  font-size: 12px;
}

.scale-value {
  text-align: center;
}

.value-number {
  display: block;
  font-size: 48px;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 4px;
}

.value-label {
  color: #94a3b8;
  font-size: 16px;
}

.text-input {
  width: 100%;
  padding: 16px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  color: #f8fafc;
  font-size: 16px;
  line-height: 1.5;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}

.text-input:focus {
  border-color: #10b981;
}

.text-input::placeholder {
  color: #64748b;
}

.text-hint {
  margin-top: 8px;
  color: #64748b;
  font-size: 12px;
}

.navigation {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 32px;
}

.nav-btn {
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.nav-btn.prev {
  background: rgba(148, 163, 184, 0.1);
  color: #94a3b8;
}

.nav-btn.prev:hover:not(:disabled) {
  background: rgba(148, 163, 184, 0.2);
  color: #f8fafc;
}

.nav-btn.next,
.nav-btn.finish {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  flex: 1;
}

.nav-btn.next:hover:not(:disabled),
.nav-btn.finish:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.question-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 32px;
  flex-wrap: wrap;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(148, 163, 184, 0.2);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.dot.answered {
  background: rgba(16, 185, 129, 0.4);
}

.dot.active {
  background: #10b981;
  transform: scale(1.2);
}

@media (max-width: 768px) {
  .question-card {
    padding: 24px;
  }
  
  .question-text {
    font-size: 20px;
  }
  
  .value-number {
    font-size: 36px;
  }
}
</style>
