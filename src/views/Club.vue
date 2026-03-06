<template>
  <div class="club-container">
    <Breadcrumbs :items="breadcrumbs" />

    <header class="page-header">
      <div class="header-icon-wrap">
        <Users :size="32" :stroke-width="1.5" />
      </div>
      <h1>Клуб 1%</h1>
      <p class="subtitle">Сообщество людей, которые растут на 1% каждый день</p>
    </header>

    <div class="hero-card card">
      <div class="hero-content">
        <div class="hero-icon">
          <Star :size="36" :stroke-width="1.5" />
        </div>
        <div>
          <h2>Присоединяйтесь к сообществу</h2>
          <p>Более 10 000 участников уже достигают своих целей вместе с нами</p>
        </div>
      </div>
    </div>

    <div class="features-grid">
      <div class="feature-card card">
        <div class="feature-icon">
          <MessageCircle :size="28" :stroke-width="1.5" />
        </div>
        <h3>Общение и поддержка</h3>
        <p>Обменивайтесь опытом, получайте советы и поддержку от единомышленников</p>
      </div>

      <div class="feature-card card">
        <div class="feature-icon">
          <Target :size="28" :stroke-width="1.5" />
        </div>
        <h3>Групповые челленджи</h3>
        <p>Участвуйте в 30-дневных челленджах и достигайте целей вместе</p>
      </div>

      <div class="feature-card card">
        <div class="feature-icon">
          <BookOpen :size="28" :stroke-width="1.5" />
        </div>
        <h3>Эксклюзивный контент</h3>
        <p>Доступ к вебинарам, мастер-классам и материалам от экспертов</p>
      </div>

      <div class="feature-card card">
        <div class="feature-icon">
          <Trophy :size="28" :stroke-width="1.5" />
        </div>
        <h3>Рейтинг и достижения</h3>
        <p>Соревнуйтесь с другими участниками и получайте награды за прогресс</p>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title-row">
          <Calendar :size="18" :stroke-width="1.5" class="card-title-icon" />
          <h3 class="card-title">Предстоящие события</h3>
        </div>
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
                <span class="event-meta-item">
                  <Clock :size="14" :stroke-width="1.5" /> 19:00 МСК
                </span>
                <span class="event-meta-item">
                  <Users :size="14" :stroke-width="1.5" /> 120 участников
                </span>
              </div>
            </div>
            <button class="btn btn-primary btn-sm">Записаться</button>
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
                <span class="event-meta-item">
                  <CalendarDays :size="14" :stroke-width="1.5" /> 30 дней
                </span>
                <span class="event-meta-item">
                  <Users :size="14" :stroke-width="1.5" /> 450 участников
                </span>
              </div>
            </div>
            <button class="btn btn-primary btn-sm">Участвовать</button>
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
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import {
  Users, Star, MessageCircle, Target, BookOpen, Trophy,
  Calendar, CalendarDays, Clock
} from 'lucide-vue-next'

const breadcrumbs = [
  { label: 'Главная', to: '/app' },
  { label: 'Клуб 1%' }
]
</script>

<style scoped>
.club-container {
  max-width: var(--content-width-narrow);
  margin: 0 auto;
  padding: var(--container-padding);
  padding-bottom: 100px;
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.header-icon-wrap {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.12));
  color: var(--primary-color);
  margin: 0 auto 1rem;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

/* Hero */
.hero-card {
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08));
  border: 1px solid rgba(99, 102, 241, 0.18);
  padding: 1.5rem;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.hero-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  background: rgba(99, 102, 241, 0.12);
  color: var(--primary-color);
  flex-shrink: 0;
}

.hero-content h2 {
  font-size: 1.375rem;
  font-weight: 600;
  margin-bottom: 0.375rem;
}

.hero-content p {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  margin: 0;
  line-height: 1.5;
}

/* Features */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.feature-card {
  text-align: center;
  padding: 1.5rem 1.25rem;
}

.feature-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  background: rgba(99, 102, 241, 0.08);
  color: var(--primary-color);
  margin: 0 auto 1rem;
}

.feature-card h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0;
}

/* Card */
.card-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-title-icon {
  color: var(--text-secondary);
  flex-shrink: 0;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.card-body {
  padding: 1.25rem;
}

/* Events */
.event-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.event-date {
  text-align: center;
  padding: 0.625rem 0.875rem;
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.event-day {
  font-size: 1.375rem;
  font-weight: 700;
  line-height: 1;
}

.event-month {
  font-size: 0.75rem;
  text-transform: uppercase;
  margin-top: 0.25rem;
  opacity: 0.85;
}

.event-content {
  flex: 1;
  min-width: 0;
}

.event-content h4 {
  font-size: 0.9375rem;
  font-weight: 600;
  margin: 0 0 0.375rem;
}

.event-content p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0 0 0.625rem;
  line-height: 1.5;
}

.event-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.event-meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

/* CTA */
.cta-card {
  text-align: center;
  padding: 2.5rem 2rem;
  margin-top: 1.5rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
  border: 1px solid rgba(99, 102, 241, 0.18);
}

.cta-content h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.cta-content > p {
  color: var(--text-secondary);
  font-size: 1rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.btn-lg {
  padding: 0.875rem 2rem;
  font-size: 1rem;
  border-radius: var(--radius-lg);
}

.cta-note {
  margin-top: 1rem;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  font-style: italic;
}

@media (max-width: 768px) {
  .event-item {
    flex-wrap: wrap;
  }

  .event-item .btn {
    width: 100%;
    justify-content: center;
  }

  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .features-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .features-grid {
    grid-template-columns: 1fr;
  }

  .cta-card {
    padding: 1.5rem 1rem;
  }
}
</style>
