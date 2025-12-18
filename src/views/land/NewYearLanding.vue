<template>
  <div class="newyear-landing">
    <!-- Snowflakes animation -->
    <div class="snowflakes" aria-hidden="true">
      <div class="snowflake">❄</div>
      <div class="snowflake">❅</div>
      <div class="snowflake">✨</div>
      <div class="snowflake">❆</div>
      <div class="snowflake">❄</div>
      <div class="snowflake">⭐</div>
      <div class="snowflake">❅</div>
      <div class="snowflake">✨</div>
      <div class="snowflake">❆</div>
      <div class="snowflake">❄</div>
      <div class="snowflake">❅</div>
      <div class="snowflake">⭐</div>
      <div class="snowflake">❆</div>
      <div class="snowflake">✨</div>
      <div class="snowflake">❄</div>
    </div>

    <!-- Sparkle decorations -->
    <div class="sparkles" aria-hidden="true">
      <div class="sparkle">✦</div>
      <div class="sparkle">✧</div>
      <div class="sparkle">✦</div>
      <div class="sparkle">✧</div>
      <div class="sparkle">✦</div>
    </div>

    <header class="landing-header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <span class="logo-icon">1%</span>
            <span class="logo-text">OnePercent</span>
          </div>
          <router-link v-if="isAuthenticated" to="/app" class="login-link">Личный кабинет</router-link>
          <router-link v-else to="/auth/login" class="login-link">Войти</router-link>
        </div>
      </div>
    </header>

    <main>
      <section class="hero">
        <div class="container">
          <div class="hero-badge">❄️ Бесплатно • 10 минут • Без регистрации</div>
          <h1 class="hero-title">
            Подведи итоги 2025<br>
            <span class="highlight">и получи план на 2026 ✨</span>
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
          <div class="steps steps-desktop">
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
          <div class="steps-accordion">
            <details class="step-accordion">
              <summary class="step-summary">
                <span class="step-number">1</span>
                <span class="step-icon">📝</span>
                <span class="step-title">Пройди тест</span>
                <span class="chevron">▼</span>
              </summary>
              <p class="step-description">12 вопросов по 6 сферам жизни. Оцени свой год честно.</p>
            </details>
            <details class="step-accordion">
              <summary class="step-summary">
                <span class="step-number">2</span>
                <span class="step-icon">📊</span>
                <span class="step-title">Получи анализ</span>
                <span class="chevron">▼</span>
              </summary>
              <p class="step-description">Визуализация результатов: сильные стороны и зоны роста.</p>
            </details>
            <details class="step-accordion">
              <summary class="step-summary">
                <span class="step-number">3</span>
                <span class="step-icon">🎯</span>
                <span class="step-title">Создай план</span>
                <span class="chevron">▼</span>
              </summary>
              <p class="step-description">AI сгенерирует персональный план целей на 2026 год.</p>
            </details>
          </div>
        </div>
      </section>

      <section class="new-year-motivation">
        <div class="container">
          <div class="motivation-content">
            <div class="motivation-badge">❄️ Новый год — новый шанс</div>
            <h2 class="motivation-title">92% людей забрасывают цели<br><span class="highlight">уже к февралю</span></h2>
            <p class="motivation-text">
              Каждый год миллионы людей дают себе обещания: похудеть, начать копить, выучить английский...
              И каждый год — одни и те же провалы. Знаешь почему?
            </p>
            <div class="motivation-reasons">
              <div class="reason-item wrong">
                <span class="reason-icon">❌</span>
                <span>Ставят размытые цели без конкретных шагов</span>
              </div>
              <div class="reason-item wrong">
                <span class="reason-icon">❌</span>
                <span>Нет системы — полагаются на силу воли</span>
              </div>
              <div class="reason-item wrong">
                <span class="reason-icon">❌</span>
                <span>Не отслеживают прогресс и теряют мотивацию</span>
              </div>
            </div>
            <div class="motivation-solution">
              <div class="solution-header">
                <span class="solution-icon">✨</span>
                <span>Но 2026 может быть другим</span>
              </div>
              <p>
                Представь, что у тебя есть <strong>чёткий план</strong> с конкретными шагами на каждую неделю.
                Система, которая <strong>напоминает</strong>, <strong>мотивирует</strong> и <strong>показывает прогресс</strong>.
                Это не магия — это правильное планирование.
              </p>
            </div>
            <div class="motivation-stats">
              <div class="stat-item">
                <div class="stat-number">3x</div>
                <div class="stat-label">выше шанс достижения цели с письменным планом</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">42%</div>
                <div class="stat-label">эффективнее люди с еженедельным трекингом</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">10 мин</div>
                <div class="stat-label">нужно чтобы получить свой персональный план</div>
              </div>
            </div>
            <div class="motivation-cta">
              <router-link to="/land/newyear/test" class="btn-start">
                Узнать свой план на 2026
                <span class="arrow">→</span>
              </router-link>
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
          <div class="section-cta">
            <router-link to="/land/newyear/test" class="btn-start">
              Получить свои рекомендации
              <span class="arrow">→</span>
            </router-link>
          </div>
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
          <div class="section-cta">
            <router-link to="/land/newyear/test" class="btn-start">
              Создать свой план
              <span class="arrow">→</span>
            </router-link>
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

    <!-- Mobile Sticky CTA -->
    <div class="mobile-sticky-cta">
      <router-link to="/land/newyear/test" class="btn-start-sticky">
        Начать тест →
      </router-link>
    </div>

    <footer class="landing-footer">
      <div class="container">
        <div class="footer-legal">
          <div class="legal-links">
            <a href="https://percent1.ru/privacy" target="_blank" rel="noopener noreferrer">Политика конфиденциальности</a>
            <a href="https://percent1.ru/termspolicy" target="_blank" rel="noopener noreferrer">Пользовательское соглашение</a>
            <a href="https://percent1.ru/disclaimer" target="_blank" rel="noopener noreferrer">Отказ от ответственности</a>
          </div>
          <div class="company-info">
            <p>ИП Косик Дмитрий Владимирович | ИНН: 711280092908 | ОГРНИП: 321774600674346</p>
          </div>
          <p class="copyright">© 2025 OnePercent. Все права защищены.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useNewYearStore } from '@/stores/newyear'
import { useAppStore } from '@/stores/app'
import { checkAuth } from '@/services/api'

const route = useRoute()
const store = useNewYearStore()
const appStore = useAppStore()

const isAuthenticated = computed(() => appStore.isAuthenticated)
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

onMounted(async () => {
  const refCode = route.query.ref
  if (refCode) {
    store.setReferralCode(refCode)
  }
  
  // Проверяем авторизацию через API если в localStorage нет данных
  if (!appStore.isAuthenticated) {
    try {
      const userData = await checkAuth()
      if (userData) {
        appStore.setUser(userData)
      }
    } catch (e) {
      // Пользователь не авторизован - это нормально для лендинга
    }
  }
})
</script>

<style scoped>
/* Snowflakes Animation */
.snowflakes {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
  overflow: hidden;
}

.snowflake {
  position: absolute;
  top: -20px;
  color: rgba(180, 200, 220, 0.6);
  font-size: 1rem;
  animation: fall linear infinite;
}

.snowflake:nth-child(1) { left: 3%; animation-duration: 10s; animation-delay: 0s; font-size: 1rem; }
.snowflake:nth-child(2) { left: 10%; animation-duration: 12s; animation-delay: 2s; font-size: 1.4rem; }
.snowflake:nth-child(3) { left: 18%; animation-duration: 8s; animation-delay: 4s; font-size: 0.9rem; }
.snowflake:nth-child(4) { left: 26%; animation-duration: 14s; animation-delay: 1s; font-size: 1.2rem; }
.snowflake:nth-child(5) { left: 35%; animation-duration: 11s; animation-delay: 3s; font-size: 1.1rem; }
.snowflake:nth-child(6) { left: 44%; animation-duration: 9s; animation-delay: 5s; font-size: 1rem; }
.snowflake:nth-child(7) { left: 52%; animation-duration: 13s; animation-delay: 2s; font-size: 1.5rem; }
.snowflake:nth-child(8) { left: 62%; animation-duration: 10s; animation-delay: 4s; font-size: 1rem; }
.snowflake:nth-child(9) { left: 70%; animation-duration: 15s; animation-delay: 0s; font-size: 1.3rem; }
.snowflake:nth-child(10) { left: 78%; animation-duration: 12s; animation-delay: 3s; font-size: 1.1rem; }
.snowflake:nth-child(11) { left: 84%; animation-duration: 9s; animation-delay: 1s; font-size: 0.9rem; }
.snowflake:nth-child(12) { left: 89%; animation-duration: 11s; animation-delay: 5s; font-size: 1.2rem; }
.snowflake:nth-child(13) { left: 93%; animation-duration: 14s; animation-delay: 2s; font-size: 1rem; }
.snowflake:nth-child(14) { left: 96%; animation-duration: 8s; animation-delay: 4s; font-size: 1.4rem; }
.snowflake:nth-child(15) { left: 99%; animation-duration: 12s; animation-delay: 0s; font-size: 1.1rem; }

@keyframes fall {
  0% { 
    transform: translateY(-20px) rotate(0deg); 
    opacity: 1;
  }
  100% { 
    transform: translateY(100vh) rotate(360deg); 
    opacity: 0.3;
  }
}

/* Sparkle decorations */
.sparkles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 999;
  overflow: hidden;
}

.sparkle {
  position: absolute;
  color: #fbbf24;
  font-size: 1.5rem;
  animation: twinkle 2s ease-in-out infinite;
}

.sparkle:nth-child(1) { top: 15%; left: 8%; animation-delay: 0s; }
.sparkle:nth-child(2) { top: 25%; right: 12%; animation-delay: 0.5s; }
.sparkle:nth-child(3) { top: 45%; left: 5%; animation-delay: 1s; }
.sparkle:nth-child(4) { top: 60%; right: 8%; animation-delay: 1.5s; }
.sparkle:nth-child(5) { top: 80%; left: 15%; animation-delay: 0.7s; }

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* Main Styles - Light Theme */
.newyear-landing {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #e8f4f8 50%, #f0f9ff 100%);
  color: #1a1a2e;
  position: relative;
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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
  color: #d97706;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a2e;
}

.login-link {
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.login-link:hover {
  color: #d97706;
}

.hero {
  padding: 140px 0 80px;
  text-align: center;
}

.hero-badge {
  display: inline-block;
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.1) 0%, rgba(251, 191, 36, 0.15) 100%);
  color: #b45309;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  margin-bottom: 24px;
  border: 1px solid rgba(217, 119, 6, 0.2);
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 24px;
  color: #1a1a2e;
}

.hero-title .highlight {
  background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 18px;
  color: #4b5563;
  max-width: 600px;
  margin: 0 auto 32px;
  line-height: 1.6;
}

.btn-start {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
  color: white;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 20px rgba(217, 119, 6, 0.25);
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px rgba(217, 119, 6, 0.35);
}

.btn-start .arrow {
  font-size: 20px;
}

.hero-note {
  margin-top: 16px;
  color: #6b7280;
  font-size: 14px;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 48px;
  color: #1a1a2e;
}

.how-it-works {
  padding: 80px 0;
  background: rgba(255, 255, 255, 0.7);
}

.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.step {
  text-align: center;
  padding: 32px;
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.step-number {
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  color: white;
}

.step-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.step h3 {
  font-size: 20px;
  margin-bottom: 12px;
  color: #1a1a2e;
}

.step p {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.steps-accordion {
  display: none;
}

.step-accordion {
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.step-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  cursor: pointer;
  list-style: none;
  font-weight: 600;
  color: #1a1a2e;
}

.step-summary::-webkit-details-marker {
  display: none;
}

.step-summary .step-number {
  position: static;
  transform: none;
  width: 28px;
  height: 28px;
  font-size: 13px;
  flex-shrink: 0;
}

.step-summary .step-icon {
  font-size: 24px;
  margin: 0;
  flex-shrink: 0;
}

.step-summary .step-title {
  flex: 1;
  font-size: 15px;
}

.step-summary .chevron {
  font-size: 12px;
  color: #9ca3af;
  transition: transform 0.2s;
}

.step-accordion[open] .chevron {
  transform: rotate(180deg);
}

.step-description {
  padding: 0 16px 16px 56px;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.new-year-motivation {
  padding: 80px 0;
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.03) 0%, rgba(251, 191, 36, 0.05) 100%);
}

.motivation-content {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
}

.motivation-badge {
  display: inline-block;
  background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
  color: white;
  padding: 8px 20px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 24px;
}

.motivation-title {
  font-size: 32px;
  font-weight: 800;
  line-height: 1.3;
  margin-bottom: 20px;
  color: #1a1a2e;
}

.motivation-title .highlight {
  color: #dc2626;
}

.motivation-text {
  font-size: 18px;
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 32px;
}

.motivation-reasons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.reason-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.15);
  border-radius: 12px;
  font-size: 15px;
  color: #4b5563;
}

.reason-icon {
  font-size: 18px;
}

.motivation-solution {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 40px;
}

.solution-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
  color: #059669;
  margin-bottom: 12px;
}

.solution-icon {
  font-size: 24px;
}

.motivation-solution p {
  color: #374151;
  line-height: 1.6;
}

.motivation-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-item {
  padding: 20px;
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.stat-number {
  font-size: 36px;
  font-weight: 800;
  color: #d97706;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

.motivation-cta {
  margin-top: 40px;
  text-align: center;
}

.section-cta {
  margin-top: 48px;
  text-align: center;
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

.mobile-sticky-cta {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.btn-start-sticky {
  display: block;
  width: 100%;
  text-align: center;
  background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
  color: white;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.1s, box-shadow 0.2s;
}

.btn-start-sticky:active {
  transform: scale(0.98);
}

.btn-start:active,
.login-link:active,
.step-summary:active,
.faq-question:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.preview-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.card-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-header.green {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%);
}

.card-header.orange {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.08) 100%);
}

.card-icon {
  font-size: 24px;
}

.card-label {
  font-weight: 600;
  font-size: 16px;
  color: #1a1a2e;
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
  color: #6b7280;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(0, 0, 0, 0.06);
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
  color: #1a1a2e;
}

.faq {
  padding: 80px 0;
  background: rgba(255, 255, 255, 0.7);
}

.faq-list {
  max-width: 700px;
  margin: 0 auto;
}

.faq-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.faq-question {
  width: 100%;
  padding: 20px 0;
  background: none;
  border: none;
  color: #1a1a2e;
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
  color: #d97706;
}

.faq-answer {
  padding: 0 0 20px;
  color: #4b5563;
  line-height: 1.6;
}

.cta-section {
  padding: 80px 0;
  text-align: center;
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.05) 0%, rgba(251, 191, 36, 0.08) 100%);
}

.cta-section h2 {
  font-size: 32px;
  margin-bottom: 16px;
  color: #1a1a2e;
}

.cta-section p {
  color: #4b5563;
  margin-bottom: 32px;
}

.landing-footer {
  padding: 32px 0;
  text-align: center;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: #1a1a2e;
}

.landing-footer p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.recommendations-preview {
  padding: 80px 0;
  background: rgba(255, 255, 255, 0.7);
}

.section-subtitle {
  text-align: center;
  color: #6b7280;
  margin-bottom: 40px;
  font-size: 16px;
}

.recommendation-example {
  background: white;
  border-radius: 20px;
  padding: 32px;
  max-width: 700px;
  margin: 0 auto;
  border: 1px solid rgba(217, 119, 6, 0.2);
  box-shadow: 0 8px 30px rgba(217, 119, 6, 0.08);
}

.example-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.example-icon {
  font-size: 32px;
}

.example-sphere {
  font-size: 20px;
  font-weight: 600;
  color: #d97706;
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
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
}

.goal-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: rgba(16, 185, 129, 0.08);
  border-radius: 10px;
  margin-bottom: 10px;
}

.goal-check {
  color: #059669;
  font-weight: 700;
}

.goal-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.goal-content strong {
  font-weight: 600;
  color: #1a1a2e;
}

.goal-metric {
  font-size: 13px;
  color: #6b7280;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.step-number {
  width: 24px;
  height: 24px;
  background: rgba(217, 119, 6, 0.15);
  color: #d97706;
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
  color: #374151;
}

.step-time {
  color: #9ca3af;
  font-size: 13px;
}

.week-items {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.week-item {
  background: #f8fafc;
  border-radius: 10px;
  padding: 12px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.week-items-detailed {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.week-item-detailed {
  background: #f8fafc;
  border-radius: 10px;
  padding: 14px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.week-tasks-list {
  list-style: none;
  padding: 0;
  margin: 8px 0 0 0;
}

.week-tasks-list li {
  font-size: 13px;
  color: #4b5563;
  padding: 4px 0;
  padding-left: 16px;
  position: relative;
}

.week-tasks-list li::before {
  content: '○';
  position: absolute;
  left: 0;
  color: #9ca3af;
}

.week-num {
  display: block;
  font-size: 12px;
  color: #d97706;
  font-weight: 600;
  margin-bottom: 4px;
}

.week-focus {
  font-size: 13px;
  color: #6b7280;
}

.preview-note {
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  margin-top: 24px;
}

.service-flow {
  padding: 80px 0;
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.02) 0%, rgba(251, 191, 36, 0.04) 100%);
}

.service-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: start;
}

.planner-mockup {
  background: #1a1a2e;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
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
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  gap: 16px;
  align-items: flex-start;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.benefit-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.benefit-card h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #1a1a2e;
}

.benefit-card p {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

.benefit-card strong {
  color: #d97706;
  font-weight: 600;
}

.value-message {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(217, 119, 6, 0.2);
}

.value-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.value-text h4 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #d97706;
}

.value-text p {
  font-size: 14px;
  color: #4b5563;
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
  .container {
    padding: 0 16px;
  }

  .hero-title {
    font-size: 32px;
  }
  
  .hero-description {
    font-size: 16px;
  }

  .hero-badge {
    font-size: 13px;
    padding: 8px 16px;
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

  .motivation-stats {
    flex-direction: column;
    gap: 16px;
  }

  .stat-item {
    padding: 16px;
  }

  .benefits-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .benefit-card {
    padding: 20px;
  }

  .section-title {
    font-size: 24px;
  }

  .motivation-title {
    font-size: 24px;
  }

  .faq-question {
    font-size: 15px;
    padding: 16px;
  }

  .cta-section h2 {
    font-size: 24px;
  }

  .btn-start {
    padding: 14px 28px;
    font-size: 16px;
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .newyear-landing {
    overflow-x: hidden;
  }

  .landing-header {
    display: none;
  }

  .container {
    padding: 0 20px;
  }

  .hero {
    padding: 40px 0 30px;
  }

  .hero-title {
    font-size: 26px;
    line-height: 1.3;
  }

  .hero-description {
    font-size: 15px;
  }

  .hero-badge {
    font-size: 12px;
    padding: 6px 12px;
  }

  .steps-desktop {
    display: none;
  }

  .steps-accordion {
    display: block;
  }

  .how-it-works {
    padding: 40px 0;
  }

  .snowflakes,
  .sparkles {
    display: none;
  }

  .mobile-sticky-cta {
    display: block;
  }

  .newyear-landing {
    padding-bottom: 80px;
  }

  .preview-cards {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    padding: 0 20px 16px;
    margin: 0 -20px;
  }

  .preview-cards::-webkit-scrollbar {
    display: none;
  }

  .preview-card {
    flex: 0 0 85%;
    scroll-snap-align: center;
  }

  .section-title {
    font-size: 22px;
  }

  .btn-start,
  .login-link,
  .step-summary,
  .step-accordion,
  .faq-question {
    min-height: 48px;
  }

  .motivation-title {
    font-size: 20px;
  }

  .stat-number {
    font-size: 28px;
  }

  .stat-label {
    font-size: 13px;
  }

  .reason-item {
    font-size: 14px;
  }

  .goal-item {
    padding: 12px;
  }

  .step-item {
    padding: 10px;
    gap: 10px;
  }

  .week-items {
    grid-template-columns: 1fr;
  }

  .mockup-header {
    padding: 12px;
  }

  .task-card {
    padding: 10px;
    font-size: 13px;
  }

  .value-message {
    flex-direction: column;
    text-align: center;
  }

  .faq-question {
    font-size: 14px;
    padding: 14px;
  }

  .faq-answer {
    font-size: 14px;
    padding: 14px;
  }

  .cta-section {
    padding: 40px 0;
  }

  .cta-section h2 {
    font-size: 22px;
  }

  .cta-section p {
    font-size: 15px;
  }

  .legal-links {
    gap: 1rem;
  }

  .legal-links a {
    font-size: 12px;
  }

  .company-info {
    font-size: 11px;
  }
}

.footer-legal {
  text-align: center;
}

.legal-links {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.legal-links a {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 0.8125rem;
  transition: color 0.2s;
}

.legal-links a:hover {
  color: rgba(255, 255, 255, 0.9);
}

.company-info {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
}

.company-info p {
  margin: 0;
}

.copyright {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
  margin: 0.75rem 0 0;
}
</style>
