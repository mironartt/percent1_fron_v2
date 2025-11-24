<template>
  <div class="club-container">
    <header class="page-header">
      <div>
        <h1>Клуб 1% 👥</h1>
        <p class="subtitle">Сообщество людей, которые растут на 1% каждый день</p>
      </div>
    </header>

    <div class="hero-card card">
      <div class="hero-content">
        <div class="hero-icon">🌟</div>
        <div>
          <h2>Присоединяйтесь к сообществу</h2>
          <p>Более 10 000 участников уже достигают своих целей вместе с нами</p>
        </div>
      </div>
    </div>

    <div class="features-grid">
      <div class="feature-card card">
        <div class="feature-icon">💬</div>
        <h3>Общение и поддержка</h3>
        <p>Обменивайтесь опытом, получайте советы и поддержку от единомышленников</p>
      </div>

      <div class="feature-card card">
        <div class="feature-icon">🎯</div>
        <h3>Групповые челленджи</h3>
        <p>Участвуйте в 30-дневных челленджах и достигайте целей вместе</p>
      </div>

      <div class="feature-card card">
        <div class="feature-icon">📚</div>
        <h3>Эксклюзивный контент</h3>
        <p>Доступ к вебинарам, мастер-классам и материалам от экспертов</p>
      </div>

      <div class="feature-card card">
        <div class="feature-icon">🏆</div>
        <h3>Рейтинг и достижения</h3>
        <p>Соревнуйтесь с другими участниками и получайте награды за прогресс</p>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">📅 Предстоящие события</h3>
      </div>
      <div class="card-body">
        <div class="event-list">
          <div class="event-item">
            <div class="event-date">
              <div class="event-day">25</div>
              <div class="event-month">ноя</div>
            </div>
            <div class="event-content">
              <h4>Вебинар: Как ставить цели правильно</h4>
              <p>Эксперт по целеполаганию расскажет о методиках постановки и достижения целей</p>
              <div class="event-meta">
                <span>⏰ 19:00 МСК</span>
                <span>👥 120 участников</span>
              </div>
            </div>
            <button class="btn btn-primary">Записаться</button>
          </div>

          <div class="event-item">
            <div class="event-date">
              <div class="event-day">01</div>
              <div class="event-month">дек</div>
            </div>
            <div class="event-content">
              <h4>Челлендж: 30 дней продуктивности</h4>
              <p>Месяц системной работы над продуктивностью с ежедневной поддержкой</p>
              <div class="event-meta">
                <span>📅 30 дней</span>
                <span>👥 450 участников</span>
              </div>
            </div>
            <button class="btn btn-primary">Участвовать</button>
          </div>
        </div>
      </div>
    </div>

    <div class="card cta-card">
      <div class="cta-content">
        <h3>Готовы присоединиться?</h3>
        <p>Станьте частью сообщества людей, которые меняют свою жизнь к лучшему</p>
        <button class="btn btn-primary btn-lg">
          Вступить в клуб
        </button>
        <p class="cta-note">Доступно для премиум-подписчиков</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Club page logic
</script>

<style scoped>
.club-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.hero-card {
  margin-bottom: 2rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.hero-icon {
  font-size: 4rem;
}

.hero-content h2 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.hero-content p {
  color: var(--text-secondary);
  font-size: 1.125rem;
  margin: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.feature-card {
  text-align: center;
  padding: 2rem 1.5rem;
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
  margin: 0;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.event-item {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.event-date {
  text-align: center;
  padding: 0.75rem 1rem;
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.event-day {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
}

.event-month {
  font-size: 0.875rem;
  text-transform: uppercase;
  margin-top: 0.25rem;
}

.event-content {
  flex: 1;
}

.event-content h4 {
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.event-content p {
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

.event-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.cta-card {
  text-align: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.cta-content h3 {
  font-size: 1.75rem;
  margin-bottom: 0.75rem;
}

.cta-content p {
  color: var(--text-secondary);
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
}

.cta-note {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-style: italic;
}

@media (max-width: 768px) {
  .event-item {
    flex-direction: column;
  }

  .hero-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>
