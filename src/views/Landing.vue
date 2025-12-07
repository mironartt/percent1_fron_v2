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

      <section id="features" class="features">
        <div class="container">
          <h2 class="section-title">Как это работает внутри</h2>
          <p class="section-subtitle">
            Веб-приложение с ИИ-наставником, который помогает держать фокус и работать над эффективностью
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
              <div class="feature-icon">⭐</div>
              <h3>Геймификация</h3>
              <p>Зарабатывай XP за привычки и шаги. Трекер прогресса и достижения.</p>
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
