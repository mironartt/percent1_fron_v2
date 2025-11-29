<template>
  <div class="first-steps-widget card">
    <div class="widget-header">
      <div class="header-left">
        <div class="header-icon">
          <Rocket :size="20" />
        </div>
        <div>
          <h3>Твои первые шаги</h3>
          <p class="header-subtitle">Познакомься с возможностями</p>
        </div>
      </div>
      <div class="progress-badge">
        <span class="progress-current">{{ completedCount }}</span>
        <span class="progress-separator">/</span>
        <span class="progress-total">{{ steps.length }}</span>
      </div>
    </div>

    <div class="progress-bar">
      <div 
        class="progress-fill" 
        :style="{ width: `${progressPercentage}%` }"
      ></div>
    </div>

    <div class="steps-list">
      <div 
        v-for="step in steps" 
        :key="step.id"
        class="step-item"
        :class="{ 
          completed: step.completed,
          current: !step.completed && isNextStep(step.id)
        }"
        @click="goToStep(step)"
      >
        <div class="step-checkbox">
          <CheckCircle v-if="step.completed" :size="20" class="check-icon" />
          <Circle v-else :size="20" class="circle-icon" />
        </div>
        <div class="step-content">
          <span class="step-title">{{ step.title }}</span>
          <span v-if="!step.completed && isNextStep(step.id)" class="step-hint">
            <ArrowRight :size="14" />
            {{ step.hint }}
          </span>
        </div>
        <component 
          :is="step.icon" 
          :size="18" 
          class="step-icon"
          :class="step.iconClass"
        />
      </div>
    </div>

    <div v-if="allCompleted" class="completion-message">
      <Trophy :size="24" class="trophy-icon" />
      <span>Отлично! Ты готов к работе</span>
    </div>

    <div v-if="!allCompleted" class="widget-footer">
      <button class="btn btn-primary btn-sm" @click="goToNextStep">
        {{ nextStepAction }}
        <ArrowRight :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { 
  Rocket,
  CheckCircle,
  Circle,
  ArrowRight,
  Trophy,
  PieChart,
  Lightbulb,
  HelpCircle,
  Target,
  Calendar,
  BookOpen,
  MessageSquare
} from 'lucide-vue-next'
import { markRaw } from 'vue'

const router = useRouter()
const store = useAppStore()

const steps = computed(() => [
  {
    id: 'ssp',
    title: 'Оценить баланс жизни',
    hint: 'Узнай свои точки роста',
    icon: markRaw(PieChart),
    iconClass: 'icon-purple',
    route: '/app/ssp',
    completed: store.firstSteps.ssp
  },
  {
    id: 'add_idea',
    title: 'Добавить первую идею',
    hint: 'Запиши желание или цель',
    icon: markRaw(Lightbulb),
    iconClass: 'icon-amber',
    route: '/app/goals-bank',
    completed: store.firstSteps.add_idea
  },
  {
    id: 'validate_goal',
    title: 'Проверить цель',
    hint: 'Правило "3 Почему"',
    icon: markRaw(HelpCircle),
    iconClass: 'icon-blue',
    route: '/app/goals-bank',
    completed: store.firstSteps.validate_goal
  },
  {
    id: 'select_key_goal',
    title: 'Выбрать ключевую цель',
    hint: 'Фокус на главном',
    icon: markRaw(Target),
    iconClass: 'icon-red',
    route: '/app/goals-bank',
    completed: store.firstSteps.select_key_goal
  },
  {
    id: 'plan_task',
    title: 'Запланировать задачу',
    hint: 'Добавь в план недели',
    icon: markRaw(Calendar),
    iconClass: 'icon-green',
    route: '/app/planning',
    completed: store.firstSteps.plan_task
  },
  {
    id: 'write_journal',
    title: 'Написать в дневник',
    hint: 'Подведи итоги дня',
    icon: markRaw(BookOpen),
    iconClass: 'icon-indigo',
    route: '/app/journal',
    completed: store.firstSteps.write_journal
  },
  {
    id: 'chat_mentor',
    title: 'Пообщаться с наставником',
    hint: 'Задай вопрос',
    icon: markRaw(MessageSquare),
    iconClass: 'icon-teal',
    route: null,
    completed: store.firstSteps.chat_mentor
  }
])

const completedCount = computed(() => {
  return steps.value.filter(s => s.completed).length
})

const progressPercentage = computed(() => {
  return Math.round((completedCount.value / steps.value.length) * 100)
})

const allCompleted = computed(() => {
  return completedCount.value === steps.value.length
})

const nextStep = computed(() => {
  return steps.value.find(s => !s.completed)
})

const nextStepAction = computed(() => {
  if (!nextStep.value) return 'Готово!'
  return nextStep.value.title
})

function isNextStep(stepId) {
  return nextStep.value?.id === stepId
}

function goToStep(step) {
  if (step.route) {
    router.push(step.route)
  } else if (step.id === 'chat_mentor') {
    store.openMentorChat()
  }
}

function goToNextStep() {
  if (nextStep.value) {
    goToStep(nextStep.value)
  }
}
</script>

<style scoped>
.first-steps-widget {
  padding: 1.25rem;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.header-left {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.widget-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.header-subtitle {
  margin: 0.125rem 0 0;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

.progress-badge {
  display: flex;
  align-items: baseline;
  gap: 0.125rem;
  padding: 0.375rem 0.75rem;
  background: var(--bg-secondary);
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.progress-current {
  color: var(--primary-color);
}

.progress-separator {
  color: var(--text-tertiary);
}

.progress-total {
  color: var(--text-secondary);
}

.progress-bar {
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: 3px;
  transition: width 0.3s ease;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
}

.step-item:hover {
  background: var(--bg-secondary);
}

.step-item.completed {
  opacity: 0.6;
}

.step-item.completed:hover {
  opacity: 0.8;
}

.step-item.current {
  background: var(--bg-secondary);
  border: 1px solid var(--primary-color);
  border-left: 3px solid var(--primary-color);
}

.step-checkbox {
  flex-shrink: 0;
}

.check-icon {
  color: #22c55e;
}

.circle-icon {
  color: var(--text-tertiary);
}

.step-item.current .circle-icon {
  color: var(--primary-color);
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-title {
  display: block;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
}

.step-item.completed .step-title {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.step-hint {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--primary-color);
  margin-top: 0.125rem;
}

.step-icon {
  flex-shrink: 0;
  opacity: 0.7;
}

.step-item.current .step-icon {
  opacity: 1;
}

.icon-purple { color: #8b5cf6; }
.icon-amber { color: #f59e0b; }
.icon-blue { color: #3b82f6; }
.icon-red { color: #ef4444; }
.icon-green { color: #22c55e; }
.icon-indigo { color: #6366f1; }
.icon-teal { color: #14b8a6; }

.completion-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
  background: rgba(34, 197, 94, 0.1);
  border-radius: var(--radius-md);
  color: #22c55e;
  font-weight: 500;
}

.trophy-icon {
  color: #f59e0b;
}

.widget-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.widget-footer .btn {
  width: 100%;
  justify-content: center;
  gap: 0.5rem;
}
</style>
