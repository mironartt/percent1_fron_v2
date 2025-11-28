<template>
  <div class="mini-task-welcome">
    <div class="welcome-card">
      <!-- Header Icon -->
      <div class="welcome-icon-wrapper">
        <Target :size="48" />
      </div>
      
      <h1 class="welcome-title">Добро пожаловать в OnePercent!</h1>
      <p class="welcome-subtitle">Сейчас мы проведём тебя через твоё первое мини-задание</p>

      <!-- Stepper -->
      <div class="stepper">
        <div class="step-item" v-for="(step, index) in steps" :key="index">
          <div class="step-icon-wrapper" :class="step.colorClass">
            <component :is="step.icon" :size="20" />
          </div>
          <div class="step-connector" v-if="index < steps.length - 1"></div>
          <div class="step-content">
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-description">{{ step.description }}</p>
          </div>
        </div>
      </div>

      <!-- Time Estimate -->
      <div class="time-estimate">
        <Clock :size="18" />
        <span>Займёт около <strong>15 минут</strong></span>
      </div>

      <!-- CTA Button -->
      <button class="btn-start" @click="startMiniTask">
        <Rocket :size="20" />
        Начать мини-задание
      </button>

      <!-- Skip Option -->
      <button class="btn-skip" @click="$emit('skip')">
        Пропустить и начать самостоятельно
      </button>
    </div>
  </div>
</template>

<script setup>
import { 
  Target, Brain, FolderOpen, CheckSquare, 
  Trophy, Clock, Rocket 
} from 'lucide-vue-next'
import { markRaw } from 'vue'

const emit = defineEmits(['start', 'skip'])

const steps = [
  {
    icon: markRaw(Brain),
    title: 'Мозговой штурм',
    description: 'Выгрузи всё, что крутится в голове',
    colorClass: 'purple'
  },
  {
    icon: markRaw(FolderOpen),
    title: 'Структурирование',
    description: 'Разложи мысли по категориям',
    colorClass: 'blue'
  },
  {
    icon: markRaw(CheckSquare),
    title: 'Выбор дел',
    description: 'Выбери 1-3 дела для выполнения',
    colorClass: 'green'
  },
  {
    icon: markRaw(Trophy),
    title: 'Твоя первая ачивка!',
    description: 'Получишь первый +1%',
    colorClass: 'amber'
  }
]

function startMiniTask() {
  emit('start')
}
</script>

<style scoped>
.mini-task-welcome {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 100px);
  padding: 2rem;
}

.welcome-card {
  max-width: 560px;
  width: 100%;
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  text-align: center;
}

/* Header Icon */
.welcome-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 50%;
  color: white;
  margin-bottom: 1.5rem;
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
  }
  50% { 
    box-shadow: 0 0 0 12px rgba(99, 102, 241, 0);
  }
}

.welcome-title {
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.welcome-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

/* Stepper */
.stepper {
  display: flex;
  flex-direction: column;
  gap: 0;
  text-align: left;
  margin-bottom: 2rem;
}

.step-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  position: relative;
  padding-bottom: 1.25rem;
}

.step-item:last-child {
  padding-bottom: 0;
}

.step-icon-wrapper {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  transition: transform 0.2s, box-shadow 0.2s;
}

.step-item:hover .step-icon-wrapper {
  transform: scale(1.1);
}

.step-icon-wrapper.purple {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.step-icon-wrapper.blue {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.step-icon-wrapper.green {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.step-icon-wrapper.amber {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

/* Connector Line */
.step-connector {
  position: absolute;
  left: 19px;
  top: 44px;
  width: 2px;
  height: calc(100% - 44px);
  background: var(--border-color);
}

.step-content {
  flex: 1;
  padding-top: 0.25rem;
}

.step-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.125rem;
}

.step-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Time Estimate */
.time-estimate {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--bg-secondary);
  border-radius: 9999px;
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.time-estimate strong {
  color: var(--text-primary);
}

/* Buttons */
.btn-start {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  font-size: 1.0625rem;
  font-weight: 600;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
}

.btn-start:active {
  transform: translateY(0);
}

.btn-skip {
  width: 100%;
  margin-top: 0.75rem;
  padding: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  background: transparent;
  color: var(--text-tertiary);
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-skip:hover {
  color: var(--text-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .welcome-card {
    padding: 2rem 1.5rem;
  }

  .welcome-title {
    font-size: 1.5rem;
  }

  .welcome-icon-wrapper {
    width: 72px;
    height: 72px;
  }

  .welcome-icon-wrapper svg {
    width: 36px;
    height: 36px;
  }
}

/* Dark mode support */
:root.dark .welcome-card {
  background: var(--bg-secondary);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}
</style>
