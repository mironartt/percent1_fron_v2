<template>
  <div class="newyear-landing">
    <header class="landing-header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <span class="logo-icon">1%</span>
            <span class="logo-text">OnePercent</span>
          </div>
          <router-link to="/auth/login" class="login-link">Войти</router-link>
        </div>
      </div>
    </header>

    <main>
      <section class="hero">
        <div class="container">
          <div class="hero-badge">Бесплатно • 10 минут • Без регистрации</div>
          <h1 class="hero-title">
            Подведи итоги 2025<br>
            <span class="highlight">и получи план на 2026</span>
          </h1>
          <p class="hero-description">
            Ответь на 12 вопросов, узнай свои сильные стороны и зоны роста,
            получи персональный AI-план развития на новый год
          </p>
          <router-link to="/land/newyear/test" class="btn-start">
            Начать тест
            <span class="arrow">→</span>
          </router-link>
          <p class="hero-note">Уже прошли: 2,847 человек</p>
        </div>
      </section>

      <section class="how-it-works">
        <div class="container">
          <h2 class="section-title">Как это работает</h2>
          <div class="steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-icon">📝</div>
              <h3>Пройди тест</h3>
              <p>12 вопросов по 6 сферам жизни. Оцени свой год честно.</p>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-icon">📊</div>
              <h3>Получи анализ</h3>
              <p>Визуализация результатов: сильные стороны и зоны роста.</p>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-icon">🎯</div>
              <h3>Создай план</h3>
              <p>AI сгенерирует персональный план целей на 2026 год.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="preview">
        <div class="container">
          <h2 class="section-title">Что ты получишь</h2>
          <div class="preview-cards">
            <div class="preview-card">
              <div class="card-header green">
                <span class="card-icon">💪</span>
                <span class="card-label">Сильные стороны</span>
              </div>
              <div class="card-body">
                <div class="sphere-item">
                  <span class="sphere-name">Здоровье и спорт</span>
                  <div class="progress-bar"><div class="fill" style="width: 85%"></div></div>
                  <span class="score">8.5</span>
                </div>
                <div class="sphere-item">
                  <span class="sphere-name">Работа и карьера</span>
                  <div class="progress-bar"><div class="fill" style="width: 80%"></div></div>
                  <span class="score">8.0</span>
                </div>
                <div class="sphere-item">
                  <span class="sphere-name">Дружба и окружение</span>
                  <div class="progress-bar"><div class="fill" style="width: 75%"></div></div>
                  <span class="score">7.5</span>
                </div>
              </div>
            </div>
            <div class="preview-card">
              <div class="card-header orange">
                <span class="card-icon">🎯</span>
                <span class="card-label">Зоны роста</span>
              </div>
              <div class="card-body">
                <div class="sphere-item">
                  <span class="sphere-name">Благосостояние</span>
                  <div class="progress-bar orange"><div class="fill" style="width: 45%"></div></div>
                  <span class="score">4.5</span>
                </div>
                <div class="sphere-item">
                  <span class="sphere-name">Хобби и отдых</span>
                  <div class="progress-bar orange"><div class="fill" style="width: 50%"></div></div>
                  <span class="score">5.0</span>
                </div>
                <div class="sphere-item">
                  <span class="sphere-name">Семья и отношения</span>
                  <div class="progress-bar orange"><div class="fill" style="width: 55%"></div></div>
                  <span class="score">5.5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="recommendations-preview">
        <div class="container">
          <h2 class="section-title">Пример рекомендаций</h2>
          <p class="section-subtitle">Вот что получит пользователь с низкой оценкой в сфере "Благосостояние"</p>
          
          <div class="recommendation-example">
            <div class="example-header">
              <span class="example-icon">💰</span>
              <span class="example-sphere">Благосостояние — главный рычаг 2026</span>
            </div>
            
            <div class="example-goals">
              <h4>Цели на год:</h4>
              <div class="goal-item">
                <span class="goal-check">✓</span>
                <div class="goal-content">
                  <strong>Создать финансовую подушку на 3 месяца</strong>
                  <span class="goal-metric">Накопить 150-300 тыс. ₽ к июню 2026</span>
                </div>
              </div>
              <div class="goal-item">
                <span class="goal-check">✓</span>
                <div class="goal-content">
                  <strong>Увеличить доход на 20%</strong>
                  <span class="goal-metric">Через фриланс, повышение или смену работы</span>
                </div>
              </div>
              <div class="goal-item">
                <span class="goal-check">✓</span>
                <div class="goal-content">
                  <strong>Оптимизировать расходы на 15%</strong>
                  <span class="goal-metric">Сократить траты на 10-15 тыс. ₽ в месяц</span>
                </div>
              </div>
            </div>

            <div class="example-steps">
              <h4>Первые шаги:</h4>
              <div class="step-item">
                <span class="step-number">1</span>
                <span class="step-title">Скачать выписки из всех банков за 2025 год и выгрузить в Google Sheets</span>
                <span class="step-time">1 ч</span>
              </div>
              <div class="step-item">
                <span class="step-number">2</span>
                <span class="step-title">Категоризировать расходы: жильё, еда, транспорт, развлечения, подписки</span>
                <span class="step-time">2 ч</span>
              </div>
              <div class="step-item">
                <span class="step-number">3</span>
                <span class="step-title">Найти 3 статьи экономии (отказ от подписок, оптимизация тарифов, кешбэк)</span>
                <span class="step-time">1 ч</span>
              </div>
              <div class="step-item">
                <span class="step-number">4</span>
                <span class="step-title">Открыть накопительный счёт в Тинькофф/Альфа с 10%+ годовых</span>
                <span class="step-time">30 мин</span>
              </div>
              <div class="step-item">
                <span class="step-number">5</span>
                <span class="step-title">Настроить автоперевод 10% зарплаты на накопительный счёт</span>
                <span class="step-time">30 мин</span>
              </div>
              <div class="step-item">
                <span class="step-number">6</span>
                <span class="step-title">Составить бюджет на январь в приложении (YNAB, ZenMoney, CoinKeeper)</span>
                <span class="step-time">2 ч</span>
              </div>
              <div class="step-item">
                <span class="step-number">7</span>
                <span class="step-title">Изучить 5 вакансий на HeadHunter в своей сфере для понимания рынка</span>
                <span class="step-time">1 ч</span>
              </div>
              <div class="step-item">
                <span class="step-number">8</span>
                <span class="step-title">Написать список из 3 идей дополнительного дохода (фриланс, консультации, курсы)</span>
                <span class="step-time">1 ч</span>
              </div>
            </div>

            <div class="example-plan">
              <h4>План на 4 недели:</h4>
              <div class="week-items-detailed">
                <div class="week-item-detailed">
                  <span class="week-num">Неделя 1</span>
                  <ul class="week-tasks-list">
                    <li>Выгрузить выписки из банков</li>
                    <li>Категоризировать расходы за 6 месяцев</li>
                    <li>Найти подписки на отмену</li>
                  </ul>
                </div>
                <div class="week-item-detailed">
                  <span class="week-num">Неделя 2</span>
                  <ul class="week-tasks-list">
                    <li>Открыть накопительный счёт</li>
                    <li>Настроить автоперевод 10%</li>
                    <li>Установить приложение для бюджета</li>
                  </ul>
                </div>
                <div class="week-item-detailed">
                  <span class="week-num">Неделя 3</span>
                  <ul class="week-tasks-list">
                    <li>Составить бюджет на февраль</li>
                    <li>Изучить 5 вакансий</li>
                    <li>Выбрать 1 идею доп. дохода</li>
                  </ul>
                </div>
                <div class="week-item-detailed">
                  <span class="week-num">Неделя 4</span>
                  <ul class="week-tasks-list">
                    <li>Сделать первый шаг к доп. доходу</li>
                    <li>Проверить баланс накоплений</li>
                    <li>Скорректировать бюджет</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <p class="preview-note">После теста ты получишь такие же рекомендации для своей главной зоны роста</p>
        </div>
      </section>

      <section class="service-flow">
        <div class="container">
          <h2 class="section-title">Запланируй задачи в сервисе</h2>
          <p class="section-subtitle">Все шаги из твоего плана превращаются в удобный таск-менеджер</p>
          
          <div class="service-content">
            <div class="planner-mockup" aria-hidden="true">
              <div class="mockup-header">
                <div class="mockup-title">
                  <span class="mockup-icon">📋</span>
                  <span>Мой план на январь</span>
                </div>
                <div class="mockup-progress">
                  <div class="progress-fill" style="width: 35%"></div>
                </div>
                <span class="mockup-stats">5 из 14 выполнено</span>
              </div>
              
              <div class="mockup-weeks">
                <div class="mockup-week">
                  <div class="week-label">Неделя 1</div>
                  <div class="task-card completed">
                    <span class="task-check">✓</span>
                    <span class="task-text">Скачать выписки из банков</span>
                    <span class="task-xp">+15 XP</span>
                  </div>
                  <div class="task-card completed">
                    <span class="task-check">✓</span>
                    <span class="task-text">Категоризировать расходы</span>
                    <span class="task-xp">+25 XP</span>
                  </div>
                  <div class="task-card">
                    <span class="task-check empty"></span>
                    <span class="task-text">Найти подписки на отмену</span>
                    <span class="task-time">1ч</span>
                  </div>
                </div>
                <div class="mockup-week">
                  <div class="week-label">Неделя 2</div>
                  <div class="task-card">
                    <span class="task-check empty"></span>
                    <span class="task-text">Открыть накопительный счёт</span>
                    <span class="task-time">30м</span>
                  </div>
                  <div class="task-card">
                    <span class="task-check empty"></span>
                    <span class="task-text">Настроить автоперевод</span>
                    <span class="task-time">30м</span>
                  </div>
                </div>
              </div>
              
              <div class="mockup-footer">
                <div class="xp-badge">
                  <span class="xp-icon">⚡</span>
                  <span>145 XP заработано</span>
                </div>
                <div class="streak-badge">
                  <span class="streak-icon">🔥</span>
                  <span>5 дней подряд</span>
                </div>
              </div>
            </div>

            <div class="benefits-section">
              <div class="benefits-grid">
                <article class="benefit-card">
                  <div class="benefit-icon">📅</div>
                  <h4>Всё разбито по неделям</h4>
                  <p>Ты точно знаешь что делать <strong>сегодня</strong>. Не нужно думать — просто действуй.</p>
                </article>
                <article class="benefit-card">
                  <div class="benefit-icon">✅</div>
                  <h4>Видимый прогресс</h4>
                  <p>Отмечай выполненное и наблюдай как <strong>растёт процент</strong> достижения цели.</p>
                </article>
                <article class="benefit-card">
                  <div class="benefit-icon">🔔</div>
                  <h4>Напоминания в Telegram</h4>
                  <p>Бот напомнит о задачах утром и <strong>не даст забыть</strong> важное вечером.</p>
                </article>
                <article class="benefit-card">
                  <div class="benefit-icon">⚡</div>
                  <h4>XP за каждый шаг</h4>
                  <p>Получай очки опыта, открывай достижения — <strong>геймификация</strong> для дисциплины.</p>
                </article>
                <article class="benefit-card">
                  <div class="benefit-icon">📊</div>
                  <h4>Аналитика прогресса</h4>
                  <p>Графики, статистика, streak-и — <strong>мотивация через цифры</strong> и визуализацию.</p>
                </article>
              </div>

              <div class="value-message">
                <div class="value-icon">🎯</div>
                <div class="value-text">
                  <h4>От плана к результату за 4 недели</h4>
                  <p>AI создаёт план → ты получаешь шаги → выполняешь по 1-2 в день → видишь прогресс → достигаешь цели</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="faq">
        <div class="container">
          <h2 class="section-title">Частые вопросы</h2>
          <div class="faq-list">
            <div class="faq-item" v-for="(item, index) in faqItems" :key="index">
              <button class="faq-question" @click="toggleFaq(index)">
                {{ item.question }}
                <span class="faq-icon">{{ openFaq === index ? '−' : '+' }}</span>
              </button>
              <div class="faq-answer" v-show="openFaq === index">
                {{ item.answer }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="cta-section">
        <div class="container">
          <h2>Готов подвести итоги 2025?</h2>
          <p>10 минут — и ты получишь ясность о прошедшем годе и план на будущий</p>
          <router-link to="/land/newyear/test" class="btn-start">
            Начать бесплатный тест
          </router-link>
        </div>
      </section>
    </main>

    <footer class="landing-footer">
      <div class="container">
        <p>© 2025 OnePercent. Все права защищены.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useNewYearStore } from '@/stores/newyear'

const route = useRoute()
const store = useNewYearStore()
const openFaq = ref(null)

const faqItems = [
  {
    question: 'Сколько времени займёт тест?',
    answer: 'Около 10 минут. Тест состоит из 12 вопросов — по 2 на каждую из 6 сфер жизни.'
  },
  {
    question: 'Нужна ли регистрация для прохождения теста?',
    answer: 'Нет, тест можно пройти без регистрации. Регистрация понадобится только для получения персонального AI-плана.'
  },
  {
    question: 'Что такое AI-план?',
    answer: 'После регистрации искусственный интеллект проанализирует твои ответы и создаст персональный план с целями и конкретными шагами на 2026 год.'
  },
  {
    question: 'Мои данные в безопасности?',
    answer: 'Да, мы не передаём твои данные третьим лицам. Ответы используются только для генерации твоего персонального плана.'
  },
  {
    question: 'Можно ли поделиться результатами?',
    answer: 'Да! После прохождения теста ты сможешь скачать красивую карточку с результатами и поделиться ею в соцсетях.'
  }
]

function toggleFaq(index) {
  openFaq.value = openFaq.value === index ? null : index
}

onMounted(() => {
  const refCode = route.query.ref
  if (refCode) {
    store.setReferralCode(refCode)
  }
})
</script>

<style scoped>
.newyear-landing {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #f8fafc;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
}

.landing-header {
  padding: 20px 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(10px);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 24px;
  font-weight: 800;
  color: #10b981;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
}

.login-link {
  color: #94a3b8;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.login-link:hover {
  color: #f8fafc;
}

.hero {
  padding: 140px 0 80px;
  text-align: center;
}

.hero-badge {
  display: inline-block;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  margin-bottom: 24px;
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 24px;
}

.hero-title .highlight {
  color: #10b981;
}

.hero-description {
  font-size: 18px;
  color: #94a3b8;
  max-width: 600px;
  margin: 0 auto 32px;
  line-height: 1.6;
}

.btn-start {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3);
}

.btn-start .arrow {
  font-size: 20px;
}

.hero-note {
  margin-top: 16px;
  color: #64748b;
  font-size: 14px;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 48px;
}

.how-it-works {
  padding: 80px 0;
  background: rgba(30, 41, 59, 0.5);
}

.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.step {
  text-align: center;
  padding: 32px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  position: relative;
}

.step-number {
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 32px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.step-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.step h3 {
  font-size: 20px;
  margin-bottom: 12px;
}

.step p {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.5;
}

.preview {
  padding: 80px 0;
}

.preview-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.preview-card {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.card-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-header.green {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
}

.card-header.orange {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%);
}

.card-icon {
  font-size: 24px;
}

.card-label {
  font-weight: 600;
  font-size: 16px;
}

.card-body {
  padding: 20px;
}

.sphere-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.sphere-item:last-child {
  margin-bottom: 0;
}

.sphere-name {
  width: 90px;
  font-size: 14px;
  color: #94a3b8;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(148, 163, 184, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar .fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  border-radius: 4px;
}

.progress-bar.orange .fill {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.score {
  width: 32px;
  text-align: right;
  font-weight: 600;
  font-size: 14px;
}

.faq {
  padding: 80px 0;
  background: rgba(30, 41, 59, 0.5);
}

.faq-list {
  max-width: 700px;
  margin: 0 auto;
}

.faq-item {
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.faq-question {
  width: 100%;
  padding: 20px 0;
  background: none;
  border: none;
  color: #f8fafc;
  font-size: 16px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.faq-icon {
  font-size: 24px;
  color: #10b981;
}

.faq-answer {
  padding: 0 0 20px;
  color: #94a3b8;
  line-height: 1.6;
}

.cta-section {
  padding: 80px 0;
  text-align: center;
}

.cta-section h2 {
  font-size: 32px;
  margin-bottom: 16px;
}

.cta-section p {
  color: #94a3b8;
  margin-bottom: 32px;
}

.landing-footer {
  padding: 32px 0;
  text-align: center;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.landing-footer p {
  color: #64748b;
  font-size: 14px;
}

.recommendations-preview {
  padding: 80px 0;
  background: rgba(30, 41, 59, 0.5);
}

.section-subtitle {
  text-align: center;
  color: #94a3b8;
  margin-bottom: 40px;
  font-size: 16px;
}

.recommendation-example {
  background: rgba(15, 23, 42, 0.8);
  border-radius: 20px;
  padding: 32px;
  max-width: 700px;
  margin: 0 auto;
  border: 1px solid rgba(234, 179, 8, 0.3);
}

.example-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.example-icon {
  font-size: 32px;
}

.example-sphere {
  font-size: 20px;
  font-weight: 600;
  color: #eab308;
}

.example-goals,
.example-steps,
.example-plan {
  margin-bottom: 24px;
}

.example-goals h4,
.example-steps h4,
.example-plan h4 {
  font-size: 14px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
}

.goal-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 10px;
  margin-bottom: 10px;
}

.goal-check {
  color: #10b981;
  font-weight: 700;
}

.goal-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.goal-content strong {
  font-weight: 600;
}

.goal-metric {
  font-size: 13px;
  color: #94a3b8;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 8px;
  margin-bottom: 8px;
}

.step-number {
  width: 24px;
  height: 24px;
  background: rgba(148, 163, 184, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.step-title {
  flex: 1;
  font-size: 14px;
}

.step-time {
  color: #64748b;
  font-size: 13px;
}

.week-items {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.week-item {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 10px;
  padding: 12px;
  text-align: center;
}

.week-items-detailed {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.week-item-detailed {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 10px;
  padding: 14px;
}

.week-tasks-list {
  list-style: none;
  padding: 0;
  margin: 8px 0 0 0;
}

.week-tasks-list li {
  font-size: 13px;
  color: #cbd5e1;
  padding: 4px 0;
  padding-left: 16px;
  position: relative;
}

.week-tasks-list li::before {
  content: '○';
  position: absolute;
  left: 0;
  color: #64748b;
}

.week-num {
  display: block;
  font-size: 12px;
  color: #10b981;
  font-weight: 600;
  margin-bottom: 4px;
}

.week-focus {
  font-size: 13px;
  color: #94a3b8;
}

.preview-note {
  text-align: center;
  color: #64748b;
  font-size: 14px;
  margin-top: 24px;
}

.service-flow {
  padding: 80px 0;
}

.service-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: start;
}

.planner-mockup {
  background: rgba(15, 23, 42, 0.9);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.mockup-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  margin-bottom: 16px;
}

.mockup-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.mockup-icon {
  font-size: 20px;
}

.mockup-progress {
  height: 8px;
  background: rgba(148, 163, 184, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.mockup-progress .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  border-radius: 4px;
}

.mockup-stats {
  font-size: 13px;
  color: #94a3b8;
}

.mockup-weeks {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mockup-week {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.week-label {
  font-size: 12px;
  color: #10b981;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.task-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 8px;
  border-left: 3px solid #64748b;
}

.task-card.completed {
  border-left-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.task-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #10b981;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.task-check.empty {
  background: transparent;
  border: 2px solid #64748b;
}

.task-text {
  flex: 1;
  font-size: 13px;
  color: #e2e8f0;
}

.task-xp {
  font-size: 12px;
  color: #10b981;
  font-weight: 600;
}

.task-time {
  font-size: 12px;
  color: #64748b;
}

.mockup-footer {
  display: flex;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  margin-top: 16px;
}

.xp-badge,
.streak-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #94a3b8;
  background: rgba(30, 41, 59, 0.8);
  padding: 8px 12px;
  border-radius: 20px;
}

.xp-icon,
.streak-icon {
  font-size: 16px;
}

.benefits-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.benefits-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.benefit-card {
  background: rgba(30, 41, 59, 0.6);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.benefit-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.benefit-card h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #f8fafc;
}

.benefit-card p {
  font-size: 14px;
  color: #94a3b8;
  line-height: 1.5;
  margin: 0;
}

.benefit-card strong {
  color: #10b981;
  font-weight: 600;
}

.value-message {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.value-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.value-text h4 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #10b981;
}

.value-text p {
  font-size: 14px;
  color: #cbd5e1;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 960px) {
  .service-content {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  
  .planner-mockup {
    max-width: 500px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }
  
  .steps {
    grid-template-columns: 1fr;
  }
  
  .preview-cards {
    grid-template-columns: 1fr;
  }

  .week-items {
    grid-template-columns: repeat(2, 1fr);
  }

  .week-items-detailed {
    grid-template-columns: 1fr;
  }

  .recommendation-example {
    padding: 20px;
  }

  .sphere-name {
    width: auto;
    min-width: 100px;
  }
}
</style>
