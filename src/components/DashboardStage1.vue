<template>
  <div class="stage-container">
    <div class="stage-card card">
      <div class="hero-icon-circle">
        <ChartPie :size="48" :stroke-width="1.5" />
      </div>
      
      <h1 class="stage-title">Начните с оценки баланса жизни</h1>
      <p class="stage-subtitle">
        Первый шаг к осознанному развитию — понять, где вы сейчас находитесь. 
        Оцените 6 ключевых сфер жизни и определите точки роста.
      </p>

      <div class="steps-preview">
        <div class="step-item">
          <div class="step-num">1</div>
          <div class="step-content">
            <strong>Теория</strong>
            <span>Узнайте, как баланс влияет на качество жизни</span>
          </div>
        </div>
        <div class="step-item">
          <div class="step-num">2</div>
          <div class="step-content">
            <strong>Колесо баланса</strong>
            <span>Оцените каждую из 6 сфер от 0 до 10</span>
          </div>
        </div>
        <div class="step-item">
          <div class="step-num">3</div>
          <div class="step-content">
            <strong>Рефлексия</strong>
            <span>Проведите глубокий анализ каждой сферы</span>
          </div>
        </div>
      </div>

      <div class="time-estimate">
        <Clock :size="16" :stroke-width="1.5" />
        <span>Займёт около 5-10 минут</span>
      </div>

      <router-link to="/app/ssp" class="btn btn-primary btn-lg">
        <Sparkles :size="18" :stroke-width="1.5" />
        Начать оценку
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ChartPie, Clock, Sparkles } from 'lucide-vue-next'
</script>

<style scoped>
.stage-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: calc(100vh - 200px);
  padding: 2rem;
}

.stage-card {
  max-width: 600px;
  width: 100%;
  text-align: center;
  padding: 3rem 2.5rem;
}

.hero-icon-circle {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  color: white;
}

.stage-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.stage-subtitle {
  font-size: 1.0625rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}

.steps-preview {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem 0;
}

.step-item:not(:last-child) {
  border-bottom: 1px solid var(--border-color);
}

.step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.step-content strong {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
}

.step-content span {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.time-estimate {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.time-estimate svg {
  color: var(--primary-color);
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.0625rem;
}
</style>
