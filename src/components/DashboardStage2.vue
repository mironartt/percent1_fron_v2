<template>
  <div class="stage-container">
    <div class="content-layout">
      <div class="main-card card">
        <div class="hero-icon-circle">
          <Target :size="48" :stroke-width="1.5" />
        </div>
        
        <h1 class="stage-title">Отлично! Теперь поставьте цели</h1>
        <p class="stage-subtitle">
          Вы оценили баланс жизни. Следующий шаг — определить, чего вы хотите достичь.
          Создайте первую цель и разбейте её на шаги.
        </p>

        <div class="action-options">
          <router-link to="/app/goals-bank" class="action-option">
            <div class="action-icon">
              <Landmark :size="24" :stroke-width="1.5" />
            </div>
            <div class="action-info">
              <strong>Банк целей</strong>
              <span>Соберите все идеи и желания, проверьте их на истинность</span>
            </div>
            <ChevronRight :size="20" :stroke-width="1.5" class="arrow" />
          </router-link>

          <router-link to="/app/goals/new" class="action-option">
            <div class="action-icon alt">
              <Plus :size="24" :stroke-width="1.5" />
            </div>
            <div class="action-info">
              <strong>Быстрая цель</strong>
              <span>Сразу создать цель без прохождения банка</span>
            </div>
            <ChevronRight :size="20" :stroke-width="1.5" class="arrow" />
          </router-link>
        </div>
      </div>

      <div class="sidebar-widget">
        <div class="widget-card card">
          <h3 class="widget-title">
            <ChartPie :size="18" :stroke-width="1.5" />
            Ваш баланс
          </h3>
          <div class="spheres-mini">
            <div 
              v-for="sphere in lifeSpheres" 
              :key="sphere.id"
              class="sphere-mini-item"
            >
              <span class="sphere-icon">{{ sphere.icon }}</span>
              <span class="sphere-name">{{ sphere.name }}</span>
              <div class="sphere-bar">
                <div 
                  class="sphere-fill" 
                  :style="{ width: `${(sphere.score / 10) * 100}%` }"
                ></div>
              </div>
              <span class="sphere-score">{{ sphere.score }}</span>
            </div>
          </div>
          <div class="average-score">
            <span>Средний балл:</span>
            <strong>{{ averageScore }}/10</strong>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { Target, Landmark, Plus, ChevronRight, ChartPie } from 'lucide-vue-next'

const store = useAppStore()
const lifeSpheres = computed(() => store.lifeSpheres)
const averageScore = computed(() => store.averageScore)
</script>

<style scoped>
.stage-container {
  padding: 2rem;
}

.content-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

@media (max-width: 900px) {
  .content-layout {
    grid-template-columns: 1fr;
  }
}

.main-card {
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

.action-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
}

.action-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.action-option:hover {
  background: var(--bg-tertiary);
  border-color: var(--primary-color);
  transform: translateX(4px);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-icon.alt {
  background: var(--bg-tertiary);
  color: var(--primary-color);
}

.action-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.action-info strong {
  font-size: 1rem;
  font-weight: 600;
}

.action-info span {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.arrow {
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
}

.action-option:hover .arrow {
  transform: translateX(4px);
  color: var(--primary-color);
}

.widget-card {
  padding: 1.5rem;
}

.widget-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  color: var(--text-primary);
}

.widget-title svg {
  color: var(--primary-color);
}

.spheres-mini {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sphere-mini-item {
  display: grid;
  grid-template-columns: 24px 1fr auto auto;
  align-items: center;
  gap: 0.5rem;
}

.sphere-icon {
  font-size: 1rem;
}

.sphere-name {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sphere-bar {
  width: 60px;
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.sphere-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: 3px;
  transition: width 0.3s ease;
}

.sphere-score {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 20px;
  text-align: right;
}

.average-score {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  font-size: 0.875rem;
}

.average-score span {
  color: var(--text-secondary);
}

.average-score strong {
  color: var(--primary-color);
  font-size: 1rem;
}
</style>
