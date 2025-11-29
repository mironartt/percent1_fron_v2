<template>
  <div class="stage-container">
    <div class="content-layout">
      <div class="main-card card">
        <div class="hero-icon-circle">
          <Calendar :size="48" :stroke-width="1.5" />
        </div>
        
        <h1 class="stage-title">Спланируйте неделю</h1>
        <p class="stage-subtitle">
          У вас есть цели. Теперь распределите задачи по дням недели,
          чтобы двигаться к ним каждый день.
        </p>

        <div class="goals-preview">
          <h4>Ваши активные цели:</h4>
          <div class="goals-list">
            <div 
              v-for="goal in activeGoalsList.slice(0, 3)" 
              :key="goal.id"
              class="goal-item"
            >
              <div class="goal-sphere">{{ getSphereIcon(goal.sphereId) }}</div>
              <span class="goal-title">{{ goal.title }}</span>
              <span class="goal-steps">{{ goal.steps?.length || 0 }} шагов</span>
            </div>
            <div v-if="activeGoalsList.length > 3" class="more-goals">
              +{{ activeGoalsList.length - 3 }} ещё
            </div>
          </div>
        </div>

        <router-link to="/app/planning" class="btn btn-primary btn-lg">
          <CalendarCheck :size="18" :stroke-width="1.5" />
          Спланировать неделю
        </router-link>
      </div>

      <div class="sidebar-widgets">
        <div class="widget-card card">
          <h3 class="widget-title">
            <Target :size="18" :stroke-width="1.5" />
            Статистика целей
          </h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ activeGoalsCount }}</span>
              <span class="stat-label">Активных</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ totalSteps }}</span>
              <span class="stat-label">Шагов</span>
            </div>
          </div>
        </div>

        <div class="widget-card card tip-card">
          <Lightbulb :size="24" :stroke-width="1.5" class="tip-icon" />
          <p class="tip-text">
            <strong>Совет:</strong> Планируйте не больше 3 ключевых задач в день. 
            Лучше сделать меньше, но качественно.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { Calendar, CalendarCheck, Target, Lightbulb } from 'lucide-vue-next'

const store = useAppStore()

const activeGoalsList = computed(() => store.goals.filter(g => g.status === 'active'))
const activeGoalsCount = computed(() => activeGoalsList.value.length)
const totalSteps = computed(() => {
  return activeGoalsList.value.reduce((sum, goal) => sum + (goal.steps?.length || 0), 0)
})

function getSphereIcon(sphereId) {
  const sphere = store.lifeSpheres.find(s => s.id === sphereId)
  return sphere?.icon || '🎯'
}
</script>

<style scoped>
.stage-container {
  padding: 2rem;
}

.content-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  max-width: 1000px;
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

.goals-preview {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.goals-preview h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.goal-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.goal-sphere {
  font-size: 1.25rem;
}

.goal-title {
  flex: 1;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goal-steps {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
}

.more-goals {
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
  padding: 0.5rem;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.0625rem;
}

.sidebar-widgets {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.stat-value {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tip-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08));
  border-color: rgba(99, 102, 241, 0.2);
}

.tip-icon {
  color: var(--primary-color);
  margin-bottom: 0.75rem;
}

.tip-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.tip-text strong {
  color: var(--text-primary);
}
</style>
