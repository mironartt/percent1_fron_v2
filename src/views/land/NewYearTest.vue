<template>
  <div class="newyear-test">
    <!-- Snowflakes animation -->
    <div class="snowflakes" aria-hidden="true">
      <div class="snowflake">❄</div>
      <div class="snowflake">❅</div>
      <div class="snowflake">✨</div>
      <div class="snowflake">❆</div>
      <div class="snowflake">❄</div>
      <div class="snowflake">⭐</div>
      <div class="snowflake">❅</div>
      <div class="snowflake">✨</div>
      <div class="snowflake">❆</div>
      <div class="snowflake">❄</div>
    </div>

    <!-- Sparkle decorations -->
    <div class="sparkles" aria-hidden="true">
      <div class="sparkle">✦</div>
      <div class="sparkle">✧</div>
      <div class="sparkle">✦</div>
      <div class="sparkle">✧</div>
      <div class="sparkle">✦</div>
    </div>

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

    <footer class="test-footer">
      <div class="container">
        <div class="footer-legal">
          <div class="legal-links">
            <a href="https://percent1.ru/privacy" target="_blank" rel="noopener noreferrer">Политика конфиденциальности</a>
            <a href="https://percent1.ru/termspolicy" target="_blank" rel="noopener noreferrer">Пользовательское соглашение</a>
            <a href="https://percent1.ru/disclaimer" target="_blank" rel="noopener noreferrer">Отказ от ответственности</a>
          </div>
          <div class="company-info">
            <p>ИП Косик Дмитрий Владимирович | ИНН: 711280092908 | ОГРНИП: 321774600674346</p>
          </div>
          <p class="copyright">© 2025 OnePercent. Все права защищены.</p>
        </div>
      </div>
    </footer>
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
  background: #f8fafc;
  color: #1a1a2e;
  position: relative;
  overflow-x: hidden;
}

.container {
  max-width: 700px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Snowflakes */
.snowflakes {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.snowflake {
  position: absolute;
  top: -20px;
  font-size: 1.2rem;
  animation: fall linear infinite;
  opacity: 0.7;
}

.snowflake:nth-child(1) { left: 5%; animation-duration: 12s; animation-delay: 0s; font-size: 1rem; }
.snowflake:nth-child(2) { left: 15%; animation-duration: 14s; animation-delay: 1s; font-size: 1.4rem; }
.snowflake:nth-child(3) { left: 25%; animation-duration: 10s; animation-delay: 2s; font-size: 0.9rem; }
.snowflake:nth-child(4) { left: 35%; animation-duration: 16s; animation-delay: 0.5s; font-size: 1.1rem; }
.snowflake:nth-child(5) { left: 45%; animation-duration: 11s; animation-delay: 3s; font-size: 1.3rem; }
.snowflake:nth-child(6) { left: 55%; animation-duration: 13s; animation-delay: 1.5s; font-size: 1rem; }
.snowflake:nth-child(7) { left: 65%; animation-duration: 15s; animation-delay: 2.5s; font-size: 1.2rem; }
.snowflake:nth-child(8) { left: 75%; animation-duration: 9s; animation-delay: 0.8s; font-size: 0.8rem; }
.snowflake:nth-child(9) { left: 85%; animation-duration: 17s; animation-delay: 1.8s; font-size: 1.4rem; }
.snowflake:nth-child(10) { left: 95%; animation-duration: 12s; animation-delay: 3.5s; font-size: 1rem; }

@keyframes fall {
  0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
  10% { opacity: 0.7; }
  90% { opacity: 0.7; }
  100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
}

/* Sparkles */
.sparkles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.sparkle {
  position: absolute;
  font-size: 1.5rem;
  color: #d97706;
  animation: twinkle 3s ease-in-out infinite;
}

.sparkle:nth-child(1) { top: 15%; left: 10%; animation-delay: 0s; }
.sparkle:nth-child(2) { top: 25%; right: 15%; animation-delay: 0.5s; }
.sparkle:nth-child(3) { top: 45%; left: 8%; animation-delay: 1s; }
.sparkle:nth-child(4) { top: 60%; right: 12%; animation-delay: 1.5s; }
.sparkle:nth-child(5) { top: 80%; left: 15%; animation-delay: 2s; }

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* Header */
.test-header {
  padding: 20px 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(26, 26, 46, 0.1);
}

.test-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-link {
  color: #64748b;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.back-link:hover {
  color: #1a1a2e;
}

.progress-info {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.progress-bar-container {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(26, 26, 46, 0.1);
  z-index: 99;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #d97706 0%, #f59e0b 100%);
  transition: width 0.3s ease;
}

/* Main content */
.test-main {
  padding: 100px 0 40px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 2;
}

.question-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(26, 26, 46, 0.08);
  border: 1px solid rgba(26, 26, 46, 0.08);
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
  color: #1a1a2e;
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
  background: rgba(26, 26, 46, 0.1);
  border-radius: 4px;
  outline: none;
}

.scale-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
}

.scale-slider::-moz-range-thumb {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
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
  color: #d97706;
  margin-bottom: 4px;
}

.value-label {
  color: #64748b;
  font-size: 16px;
}

.text-input {
  width: 100%;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid rgba(26, 26, 46, 0.15);
  border-radius: 12px;
  color: #1a1a2e;
  font-size: 16px;
  line-height: 1.5;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}

.text-input:focus {
  border-color: #d97706;
}

.text-input::placeholder {
  color: #94a3b8;
}

.text-hint {
  margin-top: 8px;
  color: #94a3b8;
  font-size: 12px;
}

/* Navigation */
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
  background: rgba(26, 26, 46, 0.08);
  color: #64748b;
}

.nav-btn.prev:hover:not(:disabled) {
  background: rgba(26, 26, 46, 0.15);
  color: #1a1a2e;
}

.nav-btn.next,
.nav-btn.finish {
  background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
  color: white;
  flex: 1;
}

.nav-btn.next:hover:not(:disabled),
.nav-btn.finish:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(217, 119, 6, 0.3);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Question dots */
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
  background: rgba(26, 26, 46, 0.15);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.dot.answered {
  background: rgba(217, 119, 6, 0.4);
}

.dot.active {
  background: #d97706;
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

/* Footer - Dark for contrast */
.test-footer {
  padding: 40px 0;
  background: #1a1a2e;
  border-top: 1px solid rgba(248, 250, 252, 0.1);
  position: relative;
  z-index: 2;
}

.footer-legal {
  text-align: center;
}

.legal-links {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.legal-links a {
  color: rgba(248, 250, 252, 0.6);
  text-decoration: none;
  font-size: 0.8125rem;
  transition: color 0.2s;
}

.legal-links a:hover {
  color: #f8fafc;
}

.company-info {
  color: rgba(248, 250, 252, 0.4);
  font-size: 0.75rem;
}

.company-info p {
  margin: 0;
}

.copyright {
  color: rgba(248, 250, 252, 0.5);
  font-size: 0.875rem;
  margin: 0.75rem 0 0;
}
</style>
