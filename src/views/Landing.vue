<template>
  <div class="landing-page">
    <header class="landing-header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <h1>OnePercent</h1>
            <span class="tagline">+1% каждый день</span>
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
              Станьте лучшей версией себя<br>
              <span class="highlight">всего на 1% каждый день</span>
            </h1>
            <p class="hero-description">
              Система управления жизнью, которая поможет вам достигать целей 
              во всех сферах: карьера, здоровье, отношения, финансы и личностный рост.
            </p>
            <div class="hero-actions">
              <router-link to="/auth/register" class="btn btn-primary btn-lg">
                Начать путь к успеху
              </router-link>
              <a href="#features" class="btn btn-outline btn-lg">
                Узнать больше
              </a>
            </div>
            <div class="hero-stats">
              <div class="stat">
                <span class="stat-value">365%</span>
                <span class="stat-label">рост за год</span>
              </div>
              <div class="stat">
                <span class="stat-value">6</span>
                <span class="stat-label">сфер жизни</span>
              </div>
              <div class="stat">
                <span class="stat-value">5 мин</span>
                <span class="stat-label">в день</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" class="features">
        <div class="container">
          <h2 class="section-title">Как это работает</h2>
          <p class="section-subtitle">Простая система для достижения больших результатов</p>
          
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">&#x1F3AF;</div>
              <h3>ССП - Сбалансированная система</h3>
              <p>Оцените текущее состояние 6 ключевых сфер жизни и определите приоритеты развития</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">&#x1F3E6;</div>
              <h3>Банк целей</h3>
              <p>Соберите и валидируйте все свои мечты и желания, превратите их в достижимые цели</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">&#x1F4CA;</div>
              <h3>Декомпозиция</h3>
              <p>Разбейте большие цели на маленькие шаги и ежедневные действия</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">&#x1F4C5;</div>
              <h3>Планировщик</h3>
              <p>Планируйте неделю и день для максимальной продуктивности</p>
            </div>
          </div>
        </div>
      </section>

      <section class="cta">
        <div class="container">
          <div class="cta-content">
            <h2>Готовы начать свой путь?</h2>
            <p>Присоединяйтесь к тысячам людей, которые уже меняют свою жизнь</p>
            <router-link to="/auth/register" class="btn btn-primary btn-lg">
              Создать аккаунт бесплатно
            </router-link>
          </div>
        </div>
      </section>
    </main>

    <footer class="landing-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <h3>OnePercent</h3>
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
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: var(--bg-primary);
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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.logo .tagline {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--primary-color);
}

.hero {
  padding: 8rem 0 4rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
}

.hero-content {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.highlight {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 1.25rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.features {
  padding: 5rem 0;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  text-align: center;
  color: var(--text-secondary);
  font-size: 1.125rem;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-color);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}

.feature-card p {
  color: var(--text-secondary);
  line-height: 1.6;
}

.cta {
  padding: 5rem 0;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
}

.cta-content {
  text-align: center;
  color: white;
}

.cta-content h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.cta-content p {
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 2rem;
}

.cta .btn-primary {
  background: white;
  color: var(--primary-color);
}

.cta .btn-primary:hover {
  background: rgba(255, 255, 255, 0.9);
}

.landing-footer {
  background: var(--bg-secondary);
  padding: 3rem 0 1.5rem;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.footer-brand h3 {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.footer-brand p {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.footer-links {
  display: flex;
  gap: 2rem;
}

.footer-links a {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: var(--primary-color);
}

.footer-bottom {
  border-top: 1px solid var(--border-color);
  padding-top: 1.5rem;
  text-align: center;
}

.footer-bottom p {
  color: var(--text-tertiary);
  font-size: 0.875rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: var(--radius-md);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-outline {
  border: 2px solid var(--border-color);
  background: transparent;
  color: var(--text-primary);
}

.btn-outline:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .hero-stats {
    flex-wrap: wrap;
    gap: 2rem;
  }

  .footer-content {
    flex-direction: column;
    gap: 2rem;
    text-align: center;
  }
}
</style>
