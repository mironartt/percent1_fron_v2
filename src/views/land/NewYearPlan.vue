<template>
  <div class="newyear-plan">
    <header class="plan-header">
      <div class="container">
        <div class="logo">
          <span class="logo-icon">1%</span>
          <span class="logo-text">OnePercent</span>
        </div>
      </div>
    </header>

    <main class="plan-main">
      <div class="container">
        <div v-if="loading" class="loading-state">
          <div class="loading-animation">
            <div class="spinner"></div>
            <div class="loading-text">
              <h2>Генерируем твой план на 2026 ✨</h2>
              <p>{{ loadingMessage }}</p>
            </div>
          </div>
          <div class="loading-steps">
            <div class="loading-step" :class="{ active: loadingStep >= 1, done: loadingStep > 1 }">
              <span class="step-icon">{{ loadingStep > 1 ? '✓' : '1' }}</span>
              <span>Анализируем твои ответы</span>
            </div>
            <div class="loading-step" :class="{ active: loadingStep >= 2, done: loadingStep > 2 }">
              <span class="step-icon">{{ loadingStep > 2 ? '✓' : '2' }}</span>
              <span>Подбираем цели</span>
            </div>
            <div class="loading-step" :class="{ active: loadingStep >= 3, done: loadingStep > 3 }">
              <span class="step-icon">{{ loadingStep > 3 ? '✓' : '3' }}</span>
              <span>Составляем план действий</span>
            </div>
          </div>
        </div>

        <div v-else-if="error" class="error-state">
          <div class="error-icon">😕</div>
          <h2>Что-то пошло не так</h2>
          <p>{{ error }}</p>
          <button class="retry-btn" @click="generatePlan">Попробовать снова</button>
        </div>

        <div v-else-if="plan" class="plan-content">
          <div class="plan-hero">
            <h1>Твой план на 2026 🎯</h1>
            <p class="motivation">{{ plan.motivation }}</p>
          </div>

          <div class="goals-section">
            <h2>Цели на 2026</h2>
            <div class="goals-list">
              <div 
                v-for="(goal, index) in plan.goals" 
                :key="goal.id"
                class="goal-card"
                :class="{ expanded: expandedGoal === index }"
              >
                <div class="goal-header" @click="toggleGoal(index)">
                  <div class="goal-number">{{ index + 1 }}</div>
                  <div class="goal-info">
                    <div class="goal-sphere">{{ getSphereIcon(goal.sphereId) }} {{ getSphereName(goal.sphereId) }}</div>
                    <h3 class="goal-title">{{ goal.title }}</h3>
                    <div class="goal-metric">📊 {{ goal.metric }}</div>
                  </div>
                  <div class="expand-icon">{{ expandedGoal === index ? '−' : '+' }}</div>
                </div>
                <div class="goal-steps" v-show="expandedGoal === index">
                  <div class="steps-header">
                    <span>Шаги к цели</span>
                    <span class="total-hours">{{ getTotalHours(goal.steps) }}ч</span>
                  </div>
                  <div 
                    v-for="(step, si) in goal.steps" 
                    :key="si"
                    class="step-item"
                  >
                    <span class="step-checkbox">☐</span>
                    <span class="step-title">{{ step.title }}</span>
                    <span class="step-hours">{{ step.hours }}ч</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="week-plan-section">
            <h2>План на январь</h2>
            <div class="weeks-grid">
              <div 
                v-for="week in plan.weekPlan" 
                :key="week.week"
                class="week-card"
              >
                <div class="week-header">
                  <span class="week-number">Неделя {{ week.week }}</span>
                  <span class="week-dates">{{ getWeekDates(week.week) }}</span>
                </div>
                <div class="week-focus">{{ week.focus }}</div>
                <ul class="week-tasks">
                  <li v-for="(task, ti) in week.tasks" :key="ti">{{ task }}</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="cta-section">
            <div class="cta-card">
              <h2>🚀 Сохрани план в приложении</h2>
              <p>Все {{ totalSteps }} шагов автоматически появятся в твоём планировщике с напоминаниями</p>
              <router-link to="/auth/register" class="cta-btn pulse">
                Добавить в OnePercent
                <span class="arrow">→</span>
              </router-link>
              <p class="cta-hint">Бесплатно • Telegram-бот напомнит о задачах</p>
            </div>
          </div>

          <div class="share-section">
            <h3>Поделись планом</h3>
            <div class="share-buttons">
              <button class="share-btn telegram" @click="shareToTelegram">
                <span class="btn-icon">📱</span>
                Telegram
              </button>
              <button class="share-btn copy" @click="copyLink">
                <span class="btn-icon">🔗</span>
                {{ copied ? 'Скопировано!' : 'Копировать ссылку' }}
              </button>
            </div>
          </div>

          <div class="nav-section">
            <router-link to="/land/newyear/results" class="back-link">
              ← Вернуться к результатам
            </router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNewYearStore } from '@/stores/newyear'
import confetti from 'canvas-confetti'

const router = useRouter()
const store = useNewYearStore()

const loading = ref(true)
const loadingStep = ref(1)
const loadingMessage = ref('Анализируем твои ответы...')
const error = ref(null)
const plan = ref(null)
const expandedGoal = ref(0)
const copied = ref(false)

const sphereMap = {
  welfare: { name: 'Благосостояние', icon: '💰' },
  hobby: { name: 'Хобби и отдых', icon: '🎨' },
  environment: { name: 'Дружба и окружение', icon: '👥' },
  health: { name: 'Здоровье и спорт', icon: '💪' },
  work: { name: 'Работа и карьера', icon: '💼' },
  family: { name: 'Любовь, семья', icon: '❤️' }
}

const totalSteps = computed(() => {
  if (!plan.value?.goals) return 0
  return plan.value.goals.reduce((sum, g) => sum + (g.steps?.length || 0), 0)
})

function getSphereIcon(id) {
  return sphereMap[id]?.icon || '🎯'
}

function getSphereName(id) {
  return sphereMap[id]?.name || id
}

function getTotalHours(steps) {
  if (!steps) return 0
  return steps.reduce((sum, s) => sum + (s.hours || 0), 0)
}

function getWeekDates(weekNum) {
  const jan1 = new Date(2026, 0, 1)
  const dayOfWeek = jan1.getDay()
  const firstMonday = dayOfWeek === 0 ? 2 : dayOfWeek === 1 ? 1 : 9 - dayOfWeek
  const startDay = firstMonday + (weekNum - 1) * 7
  const endDay = startDay + 6
  return `${startDay}-${Math.min(endDay, 31)} января`
}

function toggleGoal(index) {
  expandedGoal.value = expandedGoal.value === index ? -1 : index
}

function fireConfetti() {
  const duration = 3000
  const end = Date.now() + duration

  const colors = ['#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6']

  ;(function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }())
}

async function generatePlan() {
  loading.value = true
  loadingStep.value = 1
  loadingMessage.value = 'Анализируем твои ответы...'
  error.value = null
  
  if (!store.isCompleted) {
    router.push('/land/newyear/test')
    return
  }

  try {
    setTimeout(() => {
      loadingStep.value = 2
      loadingMessage.value = 'Подбираем персональные цели...'
    }, 1500)
    
    setTimeout(() => {
      loadingStep.value = 3
      loadingMessage.value = 'Составляем план на 4 недели...'
    }, 3000)

    const response = await fetch('/api/ai/year-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sphereScores: store.sphereScores,
        growthZones: store.growthZones.map(z => ({
          id: z.id,
          name: z.name
        })),
        answers: store.answers
      })
    })

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Ошибка генерации плана')
    }

    plan.value = data.data
    loading.value = false
    
    setTimeout(() => {
      fireConfetti()
    }, 300)
    
  } catch (err) {
    console.error('Year plan generation error:', err)
    error.value = err.message || 'Не удалось сгенерировать план. Попробуйте ещё раз.'
    loading.value = false
  }
}

function shareToTelegram() {
  const text = `Мой план на 2026 год! 🎯\n\nСоставил персональный план с ${plan.value?.goals?.length || 0} целями и ${totalSteps.value} шагами.\n\nПройди тест и получи свой:`
  const url = window.location.origin + '/land/newyear'
  window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank')
}

function copyLink() {
  const url = window.location.origin + '/land/newyear'
  navigator.clipboard.writeText(url)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

onMounted(() => {
  generatePlan()
})
</script>

<style scoped>
.newyear-plan {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #f8fafc;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.plan-header {
  padding: 20px 0;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(10px);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 24px;
  font-weight: 800;
  color: #10b981;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
}

.plan-main {
  padding: 40px 0 80px;
}

.loading-state {
  text-align: center;
  padding: 60px 0;
}

.loading-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  margin-bottom: 48px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(16, 185, 129, 0.2);
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text h2 {
  font-size: 28px;
  margin-bottom: 8px;
}

.loading-text p {
  color: #94a3b8;
  font-size: 16px;
}

.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 300px;
  margin: 0 auto;
}

.loading-step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 12px;
  opacity: 0.5;
  transition: all 0.3s;
}

.loading-step.active {
  opacity: 1;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.loading-step.done {
  opacity: 0.7;
}

.loading-step.done .step-icon {
  color: #10b981;
}

.step-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 185, 129, 0.2);
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
}

.error-state {
  text-align: center;
  padding: 60px 0;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.error-state h2 {
  font-size: 24px;
  margin-bottom: 12px;
}

.error-state p {
  color: #94a3b8;
  margin-bottom: 24px;
}

.retry-btn {
  padding: 12px 32px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: #059669;
  transform: translateY(-2px);
}

.plan-content {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.plan-hero {
  text-align: center;
  margin-bottom: 48px;
}

.plan-hero h1 {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 16px;
}

.motivation {
  font-size: 18px;
  color: #94a3b8;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.goals-section {
  margin-bottom: 48px;
}

.goals-section h2,
.week-plan-section h2 {
  font-size: 24px;
  margin-bottom: 24px;
  text-align: center;
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.goal-card {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  overflow: hidden;
  transition: all 0.3s;
}

.goal-card.expanded {
  border-color: rgba(16, 185, 129, 0.3);
}

.goal-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.goal-header:hover {
  background: rgba(30, 41, 59, 1);
}

.goal-number {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 10px;
  font-weight: 700;
  font-size: 18px;
  flex-shrink: 0;
}

.goal-info {
  flex: 1;
}

.goal-sphere {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 6px;
}

.goal-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.4;
}

.goal-metric {
  font-size: 14px;
  color: #f59e0b;
}

.expand-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(148, 163, 184, 0.1);
  border-radius: 8px;
  font-size: 20px;
  color: #94a3b8;
  flex-shrink: 0;
}

.goal-steps {
  padding: 0 20px 20px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.steps-header {
  display: flex;
  justify-content: space-between;
  padding: 16px 0 12px;
  font-size: 14px;
  color: #94a3b8;
}

.total-hours {
  color: #10b981;
  font-weight: 600;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.05);
}

.step-item:last-child {
  border-bottom: none;
}

.step-checkbox {
  color: #64748b;
}

.step-title {
  flex: 1;
  font-size: 14px;
}

.step-hours {
  font-size: 13px;
  color: #64748b;
  background: rgba(148, 163, 184, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
}

.week-plan-section {
  margin-bottom: 48px;
}

.weeks-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.week-card {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.week-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.week-number {
  font-weight: 700;
  color: #10b981;
}

.week-dates {
  font-size: 12px;
  color: #64748b;
}

.week-focus {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #f8fafc;
}

.week-tasks {
  list-style: none;
  padding: 0;
  margin: 0;
}

.week-tasks li {
  position: relative;
  padding-left: 16px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.4;
}

.week-tasks li::before {
  content: '○';
  position: absolute;
  left: 0;
  color: #64748b;
}

.cta-section {
  margin-bottom: 48px;
}

.cta-card {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
}

.cta-card h2 {
  font-size: 24px;
  margin-bottom: 12px;
}

.cta-card > p {
  color: #94a3b8;
  margin-bottom: 24px;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 40px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
}

.cta-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 30px rgba(16, 185, 129, 0.4);
}

.cta-btn.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3); }
  50% { box-shadow: 0 4px 30px rgba(16, 185, 129, 0.5); }
}

.cta-hint {
  margin-top: 16px;
  font-size: 14px;
  color: #64748b;
}

.share-section {
  text-align: center;
  margin-bottom: 48px;
}

.share-section h3 {
  font-size: 18px;
  margin-bottom: 16px;
}

.share-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.share-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  color: #f8fafc;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.share-btn:hover {
  background: rgba(30, 41, 59, 1);
  border-color: rgba(148, 163, 184, 0.4);
}

.share-btn.telegram:hover {
  border-color: #0088cc;
}

.nav-section {
  text-align: center;
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

@media (max-width: 640px) {
  .plan-hero h1 {
    font-size: 28px;
  }
  
  .weeks-grid {
    grid-template-columns: 1fr;
  }
  
  .goal-header {
    flex-wrap: wrap;
  }
  
  .share-buttons {
    flex-direction: column;
  }
  
  .cta-card {
    padding: 24px;
  }
  
  .cta-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
