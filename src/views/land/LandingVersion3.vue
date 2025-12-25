<template>
  <div class="landing-v3">
    <section id="hero" class="hero-section">
      <div class="container">
        <h1 class="hero-title">
          Работаешь 12 часов, но ощущение, что топчешься на месте?
        </h1>
        <p class="hero-subtitle">Выбери ситуацию, которая про тебя:</p>
        
        <div class="pain-cards">
          <div 
            v-for="(card, index) in painCards" 
            :key="index"
            class="pain-card"
            :class="{ active: selectedPain === index }"
            @click="selectPain(index)"
          >
            <div class="pain-icon">{{ card.icon }}</div>
            <p class="pain-text">{{ card.text }}</p>
          </div>
        </div>

        <button 
          v-if="selectedPain !== null" 
          class="cta-button"
          @click="scrollToJourney"
        >
          Посмотри, как это решается за 90 дней
        </button>
      </div>
    </section>

    <section v-if="selectedPain !== null" id="journey" class="journey-section">
      <div class="container">
        <h2 class="section-title">Твой путь к результату</h2>
        
        <div class="timeline">
          <div 
            v-for="(day, index) in journeySteps[selectedPain]" 
            :key="day.day"
            class="timeline-step"
            :class="{ active: activeStep >= index }"
            @click="activeStep = index"
          >
            <div class="step-marker">
              <span class="day-label">День {{ day.day }}</span>
            </div>
            
            <div class="step-content">
              <div v-if="day.problem" class="step-problem">
                <span class="label">Проблема:</span>
                <p>{{ day.problem }}</p>
              </div>

              <div v-if="day.chat" class="chat-demo">
                <div 
                  v-for="(msg, msgIndex) in day.chat" 
                  :key="msgIndex"
                  class="chat-message"
                  :class="msg.type"
                >
                  <div class="message-avatar">{{ msg.type === 'ai' ? '🤖' : '👤' }}</div>
                  <div class="message-bubble">{{ msg.text }}</div>
                </div>
              </div>

              <div v-if="day.insight" class="step-insight">
                <span class="label">Инсайт:</span>
                <p>{{ day.insight }}</p>
              </div>

              <div v-if="day.changed" class="step-changed">
                <span class="label">Что изменилось:</span>
                <p>{{ day.changed }}</p>
              </div>

              <div v-if="day.plan" class="step-plan">
                <span class="label">Пример утреннего плана:</span>
                <div class="plan-example">
                  <div v-for="(task, taskIndex) in day.plan" :key="taskIndex" class="plan-task">
                    <span class="task-time">{{ task.time }}</span>
                    <span class="task-name">{{ task.task }}</span>
                  </div>
                </div>
              </div>

              <div v-if="day.result" class="step-result">
                <span class="label">Результат:</span>
                <p>{{ day.result }}</p>
              </div>

              <div v-if="day.metrics" class="step-metrics">
                <div v-for="(metric, metricIndex) in day.metrics" :key="metricIndex" class="metric">
                  <span class="metric-value">{{ metric.value }}</span>
                  <span class="metric-label">{{ metric.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="how-it-works" class="how-section">
      <div class="container">
        <h2 class="section-title">Как это работает</h2>
        
        <div class="how-cards">
          <div class="how-card">
            <div class="how-visual">
              <div class="chat-preview">
                <div class="preview-message ai">
                  <span class="avatar">🤖</span>
                  <span class="text">Расскажи, что сейчас больше всего давит?</span>
                </div>
                <div class="preview-message user">
                  <span class="text">Куча задач, не знаю за что браться</span>
                </div>
                <div class="preview-message ai">
                  <span class="avatar">🤖</span>
                  <span class="text">Понял. Давай разберём по приоритетам...</span>
                </div>
              </div>
            </div>
            <h3>AI-ментор анализирует твой контекст</h3>
            <p>Понимает твою ситуацию и адаптирует советы под тебя</p>
          </div>

          <div class="how-card">
            <div class="how-visual">
              <div class="plan-preview">
                <div class="plan-header">Твой план на сегодня</div>
                <div class="plan-item priority">🎯 Закрыть сделку с клиентом</div>
                <div class="plan-item">📧 Ответить на 3 важных письма</div>
                <div class="plan-item">💪 Тренировка 30 мин</div>
                <div class="plan-item">📚 Чтение 20 страниц</div>
              </div>
            </div>
            <h3>Персональный план на каждый день</h3>
            <p>Чёткие приоритеты вместо хаоса задач</p>
          </div>

          <div class="how-card">
            <div class="how-visual">
              <div class="summary-preview">
                <div class="summary-header">Вечернее саммари</div>
                <div class="summary-stat">✅ Выполнено: 4/5 задач</div>
                <div class="summary-stat">🔥 Серия: 12 дней</div>
                <div class="summary-stat">📈 Прогресс: +3% к цели</div>
              </div>
            </div>
            <h3>Автоматизация без усилий</h3>
            <p>Утренние планы и вечерние отчёты — без напоминаний</p>
          </div>
        </div>
      </div>
    </section>

    <section id="comparison" class="comparison-section">
      <div class="container">
        <h2 class="section-title">Почему не как у других</h2>
        
        <div class="comparison-table">
          <div class="table-header">
            <div class="col-feature"></div>
            <div class="col-us">OnePercent</div>
            <div class="col-other">Курсы</div>
            <div class="col-other">Коучи</div>
          </div>
          
          <div class="table-row">
            <div class="col-feature">Персонализация</div>
            <div class="col-us"><span class="check">✓</span></div>
            <div class="col-other"><span class="cross">✗</span></div>
            <div class="col-other"><span class="check">✓</span></div>
          </div>

          <div class="table-row">
            <div class="col-feature">Доступен 24/7</div>
            <div class="col-us"><span class="check">✓</span></div>
            <div class="col-other"><span class="cross">✗</span></div>
            <div class="col-other"><span class="cross">✗</span></div>
          </div>

          <div class="table-row">
            <div class="col-feature">Цена</div>
            <div class="col-us"><span class="price-good">от 0₽</span></div>
            <div class="col-other"><span class="price-bad">50k₽</span></div>
            <div class="col-other"><span class="price-bad">150k₽</span></div>
          </div>

          <div class="table-row">
            <div class="col-feature">Системный подход</div>
            <div class="col-us"><span class="check">✓</span></div>
            <div class="col-other"><span class="cross">✗</span></div>
            <div class="col-other"><span class="partial">±</span></div>
          </div>
        </div>
      </div>
    </section>

    <section id="cta" class="cta-section">
      <div class="container">
        <h2 class="section-title">Начни сейчас</h2>
        <p class="cta-subtitle">Первые 7 дней бесплатно. Без карты. Без обязательств.</p>
        
        <div class="cta-buttons">
          <a 
            href="https://t.me/OnePercentMentorBot" 
            target="_blank" 
            class="cta-button primary"
          >
            Попробовать бесплатно
          </a>
          <button class="cta-button secondary" @click="showDemo = true">
            Посмотреть демо-диалог с ментором
          </button>
        </div>
      </div>
    </section>

    <div v-if="showDemo" class="demo-modal" @click.self="showDemo = false">
      <div class="demo-content">
        <button class="close-btn" @click="showDemo = false">×</button>
        <h3>Демо-диалог с AI-ментором</h3>
        
        <div class="demo-chat">
          <div class="chat-message ai">
            <div class="message-avatar">🤖</div>
            <div class="message-bubble">
              Привет! Я твой AI-ментор. Расскажи, что сейчас больше всего мешает двигаться вперёд?
            </div>
          </div>
          <div class="chat-message user">
            <div class="message-avatar">👤</div>
            <div class="message-bubble">
              Слишком много задач, не понимаю что важно. Всё время тушу пожары.
            </div>
          </div>
          <div class="chat-message ai">
            <div class="message-avatar">🤖</div>
            <div class="message-bubble">
              Знакомая ситуация. Давай разберёмся: сколько задач у тебя сейчас "висит" примерно? И какие из них реально влияют на твой доход или главные цели?
            </div>
          </div>
          <div class="chat-message user">
            <div class="message-avatar">👤</div>
            <div class="message-bubble">
              Наверное штук 20-30. А на доход... может 3-4 влияют напрямую.
            </div>
          </div>
          <div class="chat-message ai">
            <div class="message-avatar">🤖</div>
            <div class="message-bubble">
              Отлично, что ты это видишь! Вот что мы сделаем: каждое утро я буду помогать тебе выбрать 3-4 главных задачи. Остальные — либо делегируем, либо отменяем, либо откладываем. Через неделю ты почувствуешь, что контролируешь ситуацию. Начнём завтра?
            </div>
          </div>
        </div>
        
        <a 
          href="https://t.me/OnePercentMentorBot" 
          target="_blank" 
          class="cta-button primary"
        >
          Начать диалог с ментором
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedPain = ref(null)
const activeStep = ref(0)
const showDemo = ref(false)

const painCards = [
  { icon: '📋', text: 'Куча задач, но непонятно что важно' },
  { icon: '⏰', text: 'Откладываю всё на потом, дедлайны горят' },
  { icon: '📈', text: 'Хочу расти, но нет системы' }
]

const journeySteps = [
  [
    {
      day: 1,
      problem: 'У тебя 20+ задач и ощущение, что всё срочное. Не понимаешь за что хвататься.',
      chat: [
        { type: 'ai', text: 'Сколько задач сейчас "висит" над тобой?' },
        { type: 'user', text: 'Наверное 20-30, всё кажется важным' },
        { type: 'ai', text: 'А сколько из них реально влияют на твой доход или главную цель?' }
      ],
      insight: 'Только 3-4 задачи из 30 реально двигают тебя к цели. Остальное — шум.'
    },
    {
      day: 30,
      changed: '4 приоритетных задачи вместо 20 срочных. Ты начинаешь день с ясностью.',
      plan: [
        { time: '09:00', task: '🎯 Звонок с ключевым клиентом' },
        { time: '11:00', task: '📝 Доработать предложение' },
        { time: '14:00', task: '💰 Выставить счета' },
        { time: '16:00', task: '📚 30 минут на обучение' }
      ]
    },
    {
      day: 90,
      result: 'Ты делаешь меньше, но достигаешь больше. Рабочий день стал предсказуемым.',
      metrics: [
        { value: '-40%', label: 'меньше задач' },
        { value: '+60%', label: 'продуктивность' },
        { value: '0', label: 'переработок' }
      ]
    }
  ],
  [
    {
      day: 1,
      problem: 'Ты откладываешь важные задачи до последнего. Дедлайны горят, стресс зашкаливает.',
      chat: [
        { type: 'ai', text: 'Что обычно происходит, когда ты откладываешь задачу?' },
        { type: 'user', text: 'Нарастает тревога, потом делаю в последний момент' },
        { type: 'ai', text: 'Давай попробуем технику "2 минуты": разбить большую задачу на микрошаги' }
      ],
      insight: 'Прокрастинация — это не лень. Это реакция на непонятную или пугающую задачу.'
    },
    {
      day: 30,
      changed: 'Ты научился разбивать задачи на 15-минутные блоки. Начинать стало легко.',
      plan: [
        { time: '09:00', task: '✏️ Написать 1 абзац отчёта (15 мин)' },
        { time: '09:15', task: '✏️ Написать 2-й абзац (15 мин)' },
        { time: '09:30', task: '🎯 Позвонить клиенту (10 мин)' },
        { time: '10:00', task: '☕ Перерыв' }
      ]
    },
    {
      day: 90,
      result: 'Ты закрываешь задачи до дедлайна. Стресс снизился, появилось свободное время.',
      metrics: [
        { value: '95%', label: 'задач вовремя' },
        { value: '-70%', label: 'стресс' },
        { value: '+2ч', label: 'свободного времени' }
      ]
    }
  ],
  [
    {
      day: 1,
      problem: 'Ты хочешь развиваться, но нет чёткого плана. Пробуешь всё подряд без системы.',
      chat: [
        { type: 'ai', text: 'Какой главный навык или привычка изменит твою жизнь больше всего?' },
        { type: 'user', text: 'Наверное дисциплина и регулярность' },
        { type: 'ai', text: 'Отлично! Начнём с одной микро-привычки. Какую готов делать каждый день 5 минут?' }
      ],
      insight: 'Рост — это не прорывы, а маленькие шаги каждый день. +1% = ×37.8 за год.'
    },
    {
      day: 30,
      changed: 'У тебя есть 3 ключевые привычки, которые ты делаешь каждый день без усилий.',
      plan: [
        { time: '07:00', task: '🧘 Медитация 10 мин' },
        { time: '07:15', task: '📚 Чтение 20 страниц' },
        { time: '19:00', task: '✍️ Дневник благодарности' },
        { time: '22:00', task: '📊 Рефлексия дня' }
      ]
    },
    {
      day: 90,
      result: 'Ты чувствуешь прогресс. Есть система, которая работает на автопилоте.',
      metrics: [
        { value: '90 дней', label: 'подряд' },
        { value: '12', label: 'привычек закреплено' },
        { value: '×2.5', label: 'рост продуктивности' }
      ]
    }
  ]
]

const selectPain = (index) => {
  selectedPain.value = index
  activeStep.value = 0
}

const scrollToJourney = () => {
  const el = document.getElementById('journey')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style scoped>
.landing-v3 {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #1a1a2e;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 48px;
  color: #1a1a2e;
}

.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  background: linear-gradient(135deg, #f8f9ff 0%, #fff 100%);
}

.hero-title {
  font-size: 2.75rem;
  font-weight: 700;
  text-align: center;
  max-width: 800px;
  margin: 0 auto 24px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.25rem;
  text-align: center;
  color: #64748b;
  margin-bottom: 48px;
}

.pain-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  max-width: 900px;
  margin: 0 auto 48px;
}

.pain-card {
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pain-card:hover {
  border-color: #6366f1;
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(99, 102, 241, 0.15);
}

.pain-card.active {
  border-color: #6366f1;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
}

.pain-icon {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.pain-text {
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0;
}

.cta-button {
  display: inline-block;
  padding: 16px 32px;
  font-size: 1.125rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.cta-button.primary,
.hero-section .cta-button {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
}

.cta-button.primary:hover,
.hero-section .cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
}

.cta-button.secondary {
  background: #fff;
  color: #6366f1;
  border: 2px solid #6366f1;
}

.cta-button.secondary:hover {
  background: #f8f9ff;
}

.journey-section {
  padding: 100px 24px;
  background: #fff;
}

.timeline {
  max-width: 700px;
  margin: 0 auto;
}

.timeline-step {
  position: relative;
  padding-left: 60px;
  padding-bottom: 48px;
  border-left: 3px solid #e2e8f0;
  margin-left: 20px;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.timeline-step:last-child {
  border-left-color: transparent;
  padding-bottom: 0;
}

.timeline-step.active {
  border-left-color: #6366f1;
}

.step-marker {
  position: absolute;
  left: -12px;
  top: 0;
  width: 24px;
  height: 24px;
  background: #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.timeline-step.active .step-marker {
  background: #6366f1;
}

.day-label {
  position: absolute;
  left: 40px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6366f1;
  white-space: nowrap;
}

.step-content {
  background: #f8f9ff;
  border-radius: 16px;
  padding: 24px;
  margin-top: 8px;
}

.label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6366f1;
  margin-bottom: 8px;
}

.step-problem p,
.step-insight p,
.step-changed p,
.step-result p {
  margin: 0;
  font-size: 1rem;
  color: #1a1a2e;
}

.step-problem,
.step-insight,
.step-changed,
.step-plan,
.step-result,
.step-metrics {
  margin-bottom: 20px;
}

.step-metrics {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 0;
}

.metric {
  text-align: center;
  flex: 1;
  min-width: 100px;
}

.metric-value {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  color: #6366f1;
}

.metric-label {
  font-size: 0.875rem;
  color: #64748b;
}

.chat-demo {
  margin: 16px 0;
}

.chat-message {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  align-items: flex-start;
}

.chat-message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.chat-message.ai .message-avatar {
  background: #6366f1;
}

.message-bubble {
  background: #fff;
  padding: 12px 16px;
  border-radius: 16px;
  max-width: 80%;
  font-size: 0.9375rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.chat-message.user .message-bubble {
  background: #6366f1;
  color: #fff;
}

.plan-example {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.plan-task {
  display: flex;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}

.plan-task:last-child {
  border-bottom: none;
}

.task-time {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6366f1;
  min-width: 50px;
}

.task-name {
  font-size: 0.9375rem;
}

.how-section {
  padding: 100px 24px;
  background: #f8f9ff;
}

.how-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
}

.how-card {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.how-visual {
  margin-bottom: 24px;
}

.how-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.how-card p {
  color: #64748b;
  margin: 0;
}

.chat-preview,
.plan-preview,
.summary-preview {
  background: #f8f9ff;
  border-radius: 12px;
  padding: 16px;
  text-align: left;
}

.preview-message {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.875rem;
  align-items: flex-start;
}

.preview-message.user {
  justify-content: flex-end;
}

.preview-message .avatar {
  width: 24px;
  height: 24px;
  background: #6366f1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

.preview-message .text {
  background: #fff;
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 85%;
}

.preview-message.user .text {
  background: #6366f1;
  color: #fff;
}

.plan-header,
.summary-header {
  font-weight: 600;
  margin-bottom: 12px;
  color: #6366f1;
}

.plan-item {
  padding: 8px 0;
  font-size: 0.875rem;
  border-bottom: 1px solid #e2e8f0;
}

.plan-item:last-child {
  border-bottom: none;
}

.plan-item.priority {
  font-weight: 600;
  color: #6366f1;
}

.summary-stat {
  padding: 6px 0;
  font-size: 0.875rem;
}

.comparison-section {
  padding: 100px 24px;
  background: #fff;
}

.comparison-table {
  max-width: 800px;
  margin: 0 auto;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1px;
  background: #e2e8f0;
}

.table-header {
  background: #6366f1;
  color: #fff;
  font-weight: 600;
}

.table-header > div,
.table-row > div {
  padding: 16px;
  text-align: center;
  background: #fff;
}

.table-header > div {
  background: #6366f1;
}

.col-feature {
  text-align: left !important;
  font-weight: 500;
}

.col-us {
  background: #f0f9ff !important;
}

.check {
  color: #22c55e;
  font-size: 1.25rem;
  font-weight: 700;
}

.cross {
  color: #ef4444;
  font-size: 1.25rem;
}

.partial {
  color: #f59e0b;
  font-size: 1.25rem;
}

.price-good {
  color: #22c55e;
  font-weight: 600;
}

.price-bad {
  color: #64748b;
}

.cta-section {
  padding: 100px 24px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
  text-align: center;
}

.cta-section .section-title {
  color: #fff;
}

.cta-subtitle {
  font-size: 1.25rem;
  margin-bottom: 40px;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-section .cta-button.primary {
  background: #fff;
  color: #6366f1;
}

.cta-section .cta-button.secondary {
  background: transparent;
  border-color: #fff;
  color: #fff;
}

.cta-section .cta-button.secondary:hover {
  background: rgba(255,255,255,0.1);
}

.demo-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 1000;
}

.demo-content {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: #f1f5f9;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.close-btn:hover {
  background: #e2e8f0;
}

.demo-content h3 {
  text-align: center;
  margin-bottom: 24px;
  font-size: 1.5rem;
}

.demo-chat {
  margin-bottom: 24px;
}

.demo-content .cta-button {
  width: 100%;
  text-align: center;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 1.75rem;
  }

  .section-title {
    font-size: 1.75rem;
  }

  .pain-cards {
    grid-template-columns: 1fr;
  }

  .how-cards {
    grid-template-columns: 1fr;
  }

  .comparison-table {
    font-size: 0.875rem;
  }

  .table-header > div,
  .table-row > div {
    padding: 12px 8px;
  }

  .cta-buttons {
    flex-direction: column;
  }

  .step-metrics {
    flex-direction: column;
  }
}
</style>
