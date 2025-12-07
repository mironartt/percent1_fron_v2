<template>
  <div class="landing-page">
    <header class="landing-header" :class="{ scrolled: isScrolled }">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <span class="logo-icon">1%</span>
            <div class="logo-text">
              <h1>OnePercent</h1>
              <span class="tagline">+1% каждый день</span>
            </div>
          </div>
          <nav class="header-nav">
            <router-link to="/auth/login" class="nav-link">Войти</router-link>
            <router-link to="/auth/register" class="btn btn-primary">Начать бесплатно</router-link>
          </nav>
        </div>
      </div>
    </header>

    <main>
      <section class="hero">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">
              Системный рост в жизни<br>
              <span class="highlight">через простые действия</span>
            </h1>
            <p class="hero-description">
              Ты можешь стать сильнее на 1% сегодня — и это изменит всё завтра.
              Не курс. Не марафон. А система, которая делает развитие предсказуемым.
            </p>
            <div class="hero-actions">
              <router-link to="/auth/register" class="btn btn-primary btn-lg">
                Сделать +1% уже сегодня
              </router-link>
            </div>
          </div>
        </div>
        <div class="hero-bg"></div>
      </section>

      <section class="effect-section">
        <div class="container">
          <h2 class="section-title">Эффект 1%: маленькие шаги → большие результаты</h2>
          <p class="section-subtitle">
            Улучшая каждый день хотя бы на 1%, за год ты станешь сильнее почти в 38 раз.<br>
            Это эффект сложных процентов, применённый к жизни.
          </p>
          
          <div class="slider-container">
            <input 
              type="range" 
              min="30" 
              max="365" 
              v-model="days" 
              class="days-slider"
            >
            <div class="slider-labels">
              <span>1 мес.</span>
              <span>6 мес.</span>
              <span>1 год</span>
            </div>
          </div>

          <div class="effect-result">
            <div class="days-display">{{ days }} дней</div>
            <div class="multiplier">× {{ multiplier }}</div>
          </div>

          <div class="effect-description">
            <p v-if="days <= 30">
              <strong>Ты начнёшь управлять днём</strong>, а не плыть по потоку: меньше хаоса, больше точности.
            </p>
            <p v-else-if="days <= 90">
              <strong>Система становится привычкой</strong>, нет тревоги, есть четкий план и ясность что делать и зачем.
            </p>
            <p v-else-if="days <= 180">
              <strong>Новая «операционка»</strong>: уже есть большие победы и достигнутые цели как в жизни, так и в финансах.
            </p>
            <p v-else>
              <strong>Качественный сдвиг</strong>: ясность, устойчивость, рост дохода и ощущение контроля над жизнью.
            </p>
          </div>
        </div>
      </section>

      <section class="problem-section">
        <div class="container">
          <h2 class="section-title">Почему большинство не растут — хотя стараются каждый день</h2>
          <div class="problem-content">
            <p class="problem-text">
              Проблема не в мотивации, а в отсутствии системы.<br>
              Люди делают всё подряд, теряют фокус и выгорают.
            </p>
            <p class="solution-text">
              <strong>One Percent решает это просто:</strong> каждый день — маленький шаг в плюс.
            </p>
          </div>
        </div>
      </section>

      <section class="app-preview-section">
        <div class="container">
          <h2 class="section-title">Посмотри, как это выглядит</h2>
          <p class="section-subtitle">
            Современное веб-приложение с интуитивным интерфейсом
          </p>
          
          <div class="preview-tabs">
            <button 
              v-for="(tab, index) in previewTabs" 
              :key="index"
              class="preview-tab"
              :class="{ active: activePreview === index }"
              @click="activePreview = index"
            >
              {{ tab.icon }} {{ tab.name }}
            </button>
          </div>
          
          <div class="preview-content">
            <div class="preview-mockup">
              <div class="mockup-header">
                <div class="mockup-dots">
                  <span></span><span></span><span></span>
                </div>
                <span class="mockup-title">OnePercent</span>
              </div>
              <div class="mockup-body">
                <div class="mockup-sidebar">
                  <div class="sidebar-item active">📊 Главная</div>
                  <div class="sidebar-item" :class="{ active: activePreview === 0 }">🎯 ССП</div>
                  <div class="sidebar-item" :class="{ active: activePreview === 1 }">📅 Планирование</div>
                  <div class="sidebar-item" :class="{ active: activePreview === 2 }">🔥 Привычки</div>
                  <div class="sidebar-item" :class="{ active: activePreview === 3 }">🏆 Достижения</div>
                </div>
                <div class="mockup-content">
                  <div v-if="activePreview === 0" class="preview-screen">
                    <h4>Колесо баланса</h4>
                    <div class="wheel-preview">
                      <div class="wheel-segment" v-for="n in 6" :key="n" :style="{ transform: `rotate(${n * 60}deg)` }"></div>
                    </div>
                    <div class="preview-stats">
                      <div class="stat-item"><span>Средний балл</span><strong>7.2</strong></div>
                      <div class="stat-item"><span>Зона роста</span><strong>Здоровье</strong></div>
                    </div>
                  </div>
                  <div v-else-if="activePreview === 1" class="preview-screen">
                    <h4>Недельное планирование</h4>
                    <div class="week-preview">
                      <div class="day-tab" v-for="day in ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']" :key="day">{{ day }}</div>
                    </div>
                    <div class="tasks-preview">
                      <div class="task-item"><span class="priority high"></span>Утренняя тренировка</div>
                      <div class="task-item"><span class="priority med"></span>Работа над проектом</div>
                      <div class="task-item completed"><span class="priority low"></span>Чтение 30 минут</div>
                    </div>
                  </div>
                  <div v-else-if="activePreview === 2" class="preview-screen">
                    <h4>Мои привычки</h4>
                    <div class="habits-preview">
                      <div class="habit-item"><span class="habit-icon">🏃</span>Утренняя зарядка<span class="streak">🔥 12 дней</span></div>
                      <div class="habit-item"><span class="habit-icon">📚</span>Чтение<span class="streak">🔥 8 дней</span></div>
                      <div class="habit-item"><span class="habit-icon">💧</span>Вода 2л<span class="streak">🔥 5 дней</span></div>
                    </div>
                    <div class="xp-bar"><span style="width: 65%"></span></div>
                    <p class="xp-text">+45 XP сегодня</p>
                  </div>
                  <div v-else class="preview-screen">
                    <h4>Достижения</h4>
                    <div class="badges-preview">
                      <div class="badge unlocked">🥇<span>Первые шаги</span></div>
                      <div class="badge unlocked">🔥<span>7 дней подряд</span></div>
                      <div class="badge locked">🏆<span>30 дней</span></div>
                      <div class="badge locked">💎<span>Мастер</span></div>
                    </div>
                    <div class="progress-text">Разблокировано: 8 / 19</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="preview-description">
              <h3>{{ previewTabs[activePreview].title }}</h3>
              <p>{{ previewTabs[activePreview].description }}</p>
              <ul class="preview-features">
                <li v-for="(feature, i) in previewTabs[activePreview].features" :key="i">{{ feature }}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="features" class="features">
        <div class="container">
          <h2 class="section-title">Все инструменты в одном месте</h2>
          <p class="section-subtitle">
            8 модулей для системного роста — от диагностики до геймификации
          </p>
          
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">🎯</div>
              <h3>Колесо баланса</h3>
              <p>Оцени 6 сфер жизни и найди зоны роста. Визуальная карта твоего прогресса.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🏦</div>
              <h3>Банк целей</h3>
              <p>Собери все мечты, отфильтруй важное, разбей на конкретные шаги.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📅</div>
              <h3>Недельный планировщик</h3>
              <p>Распредели шаги по дням. Утром — фокус, вечером — рефлексия.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🤖</div>
              <h3>AI Mentor</h3>
              <p>Персональный коуч 24/7. Помогает анализировать день и держать курс.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📓</div>
              <h3>Дневник рефлексии</h3>
              <p>4 вопроса каждый вечер. Фиксируй победы и уроки дня.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🔥</div>
              <h3>Трекер привычек</h3>
              <p>Формируй полезные привычки. Серии выполнения, XP за каждый день, гибкое расписание.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🏆</div>
              <h3>Достижения</h3>
              <p>19 бейджей в 4 категориях. Отслеживай прогресс, получай награды за системность.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">⭐</div>
              <h3>XP и награды</h3>
              <p>Зарабатывай опыт за привычки, шаги и цели. Обменивай на награды из вишлиста.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="journey-section">
        <div class="container">
          <h2 class="section-title">Как выглядит путь One Percent</h2>
          
          <div class="journey-steps">
            <div class="journey-step">
              <div class="step-number">01</div>
              <div class="step-content">
                <h3>Диагностика → Осознание</h3>
                <p>Смотришь внутрь себя, выявляешь точки утечки энергии. Понимаешь, что мешает действовать стабильно.</p>
              </div>
            </div>
            <div class="journey-step">
              <div class="step-number">02</div>
              <div class="step-content">
                <h3>Осознание → Фокус</h3>
                <p>Определяешь, что действительно важно сейчас. Энергия на одном шаге, который реально двигает вперёд.</p>
              </div>
            </div>
            <div class="journey-step">
              <div class="step-number">03</div>
              <div class="step-content">
                <h3>Фокус → Системность</h3>
                <p>Выстраиваешь ритм дня и недели. Привычка действовать по системе, а не по настроению.</p>
              </div>
            </div>
            <div class="journey-step">
              <div class="step-number">04</div>
              <div class="step-content">
                <h3>Системность → Энергия</h3>
                <p>Учишься управлять состоянием. Работаешь в ресурсе, без перегрузок и выгорания.</p>
              </div>
            </div>
            <div class="journey-step">
              <div class="step-number">05</div>
              <div class="step-content">
                <h3>Энергия → Рост</h3>
                <p>Закрепляешь результаты, ставишь новые цели. Каждый день +1% — спокойно и последовательно.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="audience-section">
        <div class="container">
          <h2 class="section-title">Кому подойдёт One Percent</h2>
          <div class="audience-grid">
            <div class="audience-card">
              <div class="audience-icon">💼</div>
              <h3>Предпринимателям</h3>
              <p>С нагрузкой и хаосом, которые хотят структуру без потери гибкости</p>
            </div>
            <div class="audience-card">
              <div class="audience-icon">🎨</div>
              <h3>Фрилансерам</h3>
              <p>Которые хотят систему планирования и стабильный рост дохода</p>
            </div>
            <div class="audience-card">
              <div class="audience-icon">📊</div>
              <h3>Менеджерам</h3>
              <p>Которые ищут баланс между работой и личной жизнью</p>
            </div>
          </div>
        </div>
      </section>

      <section class="testimonials-section">
        <div class="container">
          <h2 class="section-title">Инсайты участников</h2>
          <div class="testimonials-grid">
            <div class="testimonial-card">
              <p>"На третий день понял, что не всё нужно делать. Главное — понять, что именно."</p>
            </div>
            <div class="testimonial-card">
              <p>"Эта система вернула ясность. Пропал туман в голове и бесконечный список задач."</p>
            </div>
            <div class="testimonial-card">
              <p>"Раньше искал мотивацию, теперь есть ритм. Это работает гораздо лучше."</p>
            </div>
            <div class="testimonial-card">
              <p>"Понял, что рост — это не про надрыв, а про ежедневные маленькие, но правильные шаги."</p>
            </div>
          </div>
        </div>
      </section>

      <section class="benefits-section">
        <div class="container">
          <h2 class="section-title">Что меняется, когда системность становится привычкой</h2>
          <div class="benefits-grid">
            <div class="benefit-item">
              <span class="benefit-icon">🎯</span>
              <span>Чёткий фокус без выгорания</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">🔄</span>
              <span>Естественная дисциплина</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">🧭</span>
              <span>Понимание своих приоритетов</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">🌱</span>
              <span>Рост без стресса</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">🧠</span>
              <span>Спокойная уверенность</span>
            </div>
          </div>
        </div>
      </section>

      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2>Твоя жизнь не нуждается в революции</h2>
            <p class="cta-subtitle">Ей нужен +1% каждый день</p>
            <p class="cta-text">
              Не курс. Не марафон. А система, которая делает развитие предсказуемым и эффективным.
            </p>
            <router-link to="/auth/register" class="btn btn-primary btn-lg">
              Приступить к действиям →
            </router-link>
          </div>
        </div>
      </section>
    </main>

    <footer class="landing-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <div class="logo">
              <span class="logo-icon small">1%</span>
              <span>OnePercent</span>
            </div>
            <p>Система управления жизнью</p>
          </div>
          <div class="footer-links">
            <router-link to="/auth/login">Войти</router-link>
            <router-link to="/auth/register">Регистрация</router-link>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 OnePercent. Все права защищены.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const days = ref(90)
const isScrolled = ref(false)
const activePreview = ref(0)

const previewTabs = [
  {
    icon: '🎯',
    name: 'ССП',
    title: 'Колесо баланса (ССП)',
    description: 'Оцени 6 ключевых сфер жизни по шкале от 1 до 10. Увидь общую картину и найди зоны, которые тянут вниз.',
    features: [
      'Интерактивная диаграмма баланса',
      'История оценок и динамика',
      'Рефлексия по каждой сфере',
      'Автоматические рекомендации целей'
    ]
  },
  {
    icon: '📅',
    name: 'Планирование',
    title: 'Недельный планировщик',
    description: 'Распредели шаги по дням недели. Визуальный календарь с приоритетами и временными оценками.',
    features: [
      'Drag & drop шагов по дням',
      'Цветовые приоритеты (критично / желательно / внимание)',
      'Оценка времени на каждый шаг',
      'Статистика выполнения'
    ]
  },
  {
    icon: '🔥',
    name: 'Привычки',
    title: 'Трекер привычек',
    description: 'Формируй полезные привычки и отслеживай серии выполнения. Гибкое расписание и XP за каждый день.',
    features: [
      'Серии выполнения (streaks)',
      'XP за каждую привычку (1-100)',
      'Гибкое расписание (ежедневно / будни / выходные)',
      '4 режима геймификации'
    ]
  },
  {
    icon: '🏆',
    name: 'Достижения',
    title: 'Система достижений',
    description: '19 бейджей в 4 категориях: Серии, Выполнение, Объём, Разнообразие. Мотивация через прогресс.',
    features: [
      'Визуальные бейджи с прогрессом',
      'Уведомления о новых достижениях',
      'Статистика профиля',
      'Вишлист наград за XP'
    ]
  }
]

const multiplier = computed(() => {
  return Math.pow(1.01, days.value).toFixed(2)
})

function handleScroll() {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: #fafafa;
  color: #1a1a2e;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.landing-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(250, 250, 250, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s;
}

.landing-header.scrolled {
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
  border-radius: 10px;
}

.logo-icon.small {
  width: 32px;
  height: 32px;
  font-size: 0.75rem;
}

.logo h1 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a2e;
}

.tagline {
  font-size: 0.75rem;
  color: #6b7280;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #6366f1;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.hero {
  position: relative;
  padding: 8rem 0 5rem;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  top: 0;
  right: -20%;
  width: 60%;
  height: 100%;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
  border-radius: 0 0 0 50%;
  z-index: -1;
}

.hero-content {
  max-width: 700px;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  color: #1a1a2e;
}

.highlight {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 1.25rem;
  color: #4b5563;
  line-height: 1.7;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.section-title {
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  color: #1a1a2e;
}

.section-subtitle {
  text-align: center;
  color: #6b7280;
  font-size: 1.125rem;
  max-width: 600px;
  margin: 0 auto 3rem;
  line-height: 1.6;
}

.effect-section {
  padding: 5rem 0;
  background: white;
}

.slider-container {
  max-width: 500px;
  margin: 0 auto 2rem;
}

.days-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.days-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #9ca3af;
}

.effect-result {
  text-align: center;
  margin-bottom: 1.5rem;
}

.days-display {
  font-size: 1.25rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.multiplier {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.effect-description {
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
  color: #4b5563;
  line-height: 1.6;
}

.problem-section {
  padding: 5rem 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%);
  color: white;
}

.problem-section .section-title {
  color: white;
}

.problem-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.problem-text {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1.5rem;
  line-height: 1.7;
}

.solution-text {
  font-size: 1.5rem;
  color: #a5b4fc;
}

.features {
  padding: 5rem 0;
  background: #fafafa;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #1a1a2e;
}

.feature-card p {
  color: #6b7280;
  line-height: 1.6;
}

.journey-section {
  padding: 5rem 0;
  background: white;
}

.journey-steps {
  max-width: 700px;
  margin: 0 auto;
}

.journey-step {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.journey-step:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.step-number {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  font-weight: 700;
  border-radius: 12px;
}

.step-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1a1a2e;
}

.step-content p {
  color: #6b7280;
  line-height: 1.6;
}

.audience-section {
  padding: 5rem 0;
  background: #fafafa;
}

.audience-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.audience-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.audience-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.audience-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1a1a2e;
}

.audience-card p {
  color: #6b7280;
  line-height: 1.5;
}

.app-preview-section {
  padding: 5rem 0;
  background: linear-gradient(180deg, #fafafa 0%, #f0f0ff 100%);
}

.preview-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.preview-tab {
  padding: 0.75rem 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.preview-tab:hover {
  border-color: #a5b4fc;
}

.preview-tab.active {
  border-color: #6366f1;
  background: #6366f1;
  color: white;
}

.preview-content {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 3rem;
  align-items: center;
}

.preview-mockup {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.mockup-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
}

.mockup-dots {
  display: flex;
  gap: 6px;
}

.mockup-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #d1d5db;
}

.mockup-dots span:first-child { background: #ef4444; }
.mockup-dots span:nth-child(2) { background: #f59e0b; }
.mockup-dots span:last-child { background: #22c55e; }

.mockup-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
}

.mockup-body {
  display: flex;
  min-height: 320px;
}

.mockup-sidebar {
  width: 140px;
  background: #f9fafb;
  border-right: 1px solid #e5e7eb;
  padding: 1rem 0;
}

.sidebar-item {
  padding: 0.625rem 1rem;
  font-size: 0.8125rem;
  color: #6b7280;
  cursor: pointer;
}

.sidebar-item.active {
  background: #eef2ff;
  color: #6366f1;
  font-weight: 500;
}

.mockup-content {
  flex: 1;
  padding: 1.5rem;
}

.preview-screen h4 {
  margin: 0 0 1rem;
  font-size: 1rem;
  color: #1a1a2e;
}

.wheel-preview {
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  position: relative;
  border-radius: 50%;
  background: conic-gradient(
    #6366f1 0deg 60deg,
    #8b5cf6 60deg 120deg,
    #a78bfa 120deg 180deg,
    #c4b5fd 180deg 240deg,
    #ddd6fe 240deg 300deg,
    #ede9fe 300deg 360deg
  );
}

.preview-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-item span {
  display: block;
  font-size: 0.75rem;
  color: #9ca3af;
}

.stat-item strong {
  font-size: 1.125rem;
  color: #1a1a2e;
}

.week-preview {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.day-tab {
  flex: 1;
  padding: 0.5rem;
  text-align: center;
  font-size: 0.75rem;
  background: #f3f4f6;
  border-radius: 6px;
}

.day-tab:nth-child(7) {
  background: #6366f1;
  color: white;
}

.tasks-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 0.8125rem;
}

.task-item.completed {
  opacity: 0.5;
  text-decoration: line-through;
}

.priority {
  width: 4px;
  height: 20px;
  border-radius: 2px;
}

.priority.high { background: #ef4444; }
.priority.med { background: #f59e0b; }
.priority.low { background: #3b82f6; }

.habits-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.habit-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 0.8125rem;
}

.habit-icon {
  font-size: 1rem;
}

.streak {
  margin-left: auto;
  font-size: 0.75rem;
  color: #f59e0b;
}

.xp-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.xp-bar span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 4px;
}

.xp-text {
  text-align: center;
  font-size: 0.875rem;
  color: #6366f1;
  font-weight: 600;
}

.badges-preview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 10px;
  font-size: 1.5rem;
}

.badge span {
  font-size: 0.6875rem;
  color: #6b7280;
}

.badge.locked {
  opacity: 0.4;
}

.badge.unlocked {
  background: #eef2ff;
}

.progress-text {
  text-align: center;
  font-size: 0.8125rem;
  color: #6b7280;
}

.preview-description h3 {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
  color: #1a1a2e;
}

.preview-description > p {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.preview-features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.preview-features li {
  position: relative;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
  color: #4b5563;
}

.preview-features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #6366f1;
  font-weight: 600;
}

@media (max-width: 900px) {
  .preview-content {
    grid-template-columns: 1fr;
  }
  
  .mockup-sidebar {
    display: none;
  }
  
  .preview-description {
    text-align: center;
  }
  
  .preview-features {
    text-align: left;
    max-width: 300px;
    margin: 0 auto;
  }
}

.testimonials-section {
  padding: 5rem 0;
  background: white;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.testimonial-card {
  background: #f9fafb;
  padding: 2rem;
  border-radius: 16px;
  border-left: 4px solid #6366f1;
}

.testimonial-card p {
  color: #4b5563;
  font-style: italic;
  line-height: 1.7;
}

.benefits-section {
  padding: 5rem 0;
  background: #fafafa;
}

.benefits-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 50px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.benefit-icon {
  font-size: 1.25rem;
}

.cta-section {
  padding: 5rem 0;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.cta-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.cta-section h2 {
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.cta-subtitle {
  font-size: 1.5rem;
  opacity: 0.9;
  margin-bottom: 1rem;
}

.cta-text {
  opacity: 0.8;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.cta-section .btn-primary {
  background: white;
  color: #6366f1;
}

.cta-section .btn-primary:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.landing-footer {
  background: #1a1a2e;
  color: white;
  padding: 3rem 0 1.5rem;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-brand .logo {
  margin-bottom: 0.5rem;
}

.footer-brand .logo span:not(.logo-icon) {
  color: white;
  font-weight: 600;
}

.footer-brand p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

.footer-links {
  display: flex;
  gap: 2rem;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: white;
}

.footer-bottom {
  text-align: center;
  padding-top: 1.5rem;
}

.footer-bottom p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .header-nav .nav-link {
    display: none;
  }
  
  .hero {
    padding: 7rem 0 4rem;
  }
  
  .hero-bg {
    display: none;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
  
  .journey-step {
    flex-direction: column;
    text-align: center;
  }
  
  .step-number {
    margin: 0 auto;
  }
}
</style>
