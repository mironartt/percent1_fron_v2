<template>
  <div class="landing-v2">
    <nav class="sidebar-nav" aria-label="Навигация по разделам">
      <div 
        v-for="(section, index) in sections" 
        :key="section.id"
        class="nav-dot"
        :class="{ active: activeSection === index }"
        :title="section.title"
        @click="scrollToSection(index)"
      ></div>
    </nav>

    <!-- HERO SECTION -->
    <section id="hero" class="screen-section bg-hero">
      <div class="section-content">
        <div class="hero-grid">
          <div class="hero-text">
            <h1 class="hero-title">
              Системный рост в жизни
              <span class="text-accent">через простые действия</span>
            </h1>
            <p class="hero-subtitle">
              Не курс. Не марафон. А система, которая делает развитие предсказуемым.
            </p>
            
            <div class="persona-card">
              <div class="persona-header">
                <div class="persona-avatar">М</div>
                <div class="persona-info">
                  <h3>Максим, 32 года</h3>
                  <p>Менеджер проектов, Москва</p>
                </div>
              </div>
              <p class="persona-quote">
                "Работа отнимает всё время. Здоровье запустил, отношения буксуют, 
                а планы на жизнь так и остаются планами. Хочу наконец взять жизнь под контроль."
              </p>
            </div>

            <button class="cta-button" @click="scrollToSection(1)">
              Посмотреть путь Максима
            </button>
          </div>

          <div class="hero-visual">
            <div class="growth-chart">
              <svg viewBox="0 0 300 200" class="chart-svg">
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.1" />
                    <stop offset="100%" style="stop-color:#6366f1;stop-opacity:0.4" />
                  </linearGradient>
                </defs>
                <path d="M 0 180 Q 75 170 150 140 T 300 20" fill="none" stroke="#6366f1" stroke-width="3"/>
                <path d="M 0 180 Q 75 170 150 140 T 300 20 L 300 200 L 0 200 Z" fill="url(#chartGradient)"/>
              </svg>
              <div class="chart-label">
                <span class="chart-multiplier">×37.8</span>
                <span class="chart-text">+1% каждый день = экспоненциальный рост</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="arrow-connector">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#6366f1" stroke-width="2">
          <path d="M20 5 L20 30 M10 20 L20 30 L30 20" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </section>

    <!-- AI MENTOR SECTION -->
    <section id="mentor" class="screen-section bg-mentor">
      <div class="section-content">
        <div class="two-column">
          <div class="column-text">
            <h2 class="section-title">AI-ментор</h2>
            <p class="section-subtitle">Твой личный помощник на каждом этапе пути</p>
            
            <div class="mentor-features">
              <div class="feature-item">
                <div class="feature-icon">🎯</div>
                <div class="feature-text">
                  <strong>Диагностика</strong>
                  <p>Задаёт правильные вопросы, чтобы понять твою ситуацию</p>
                </div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">📋</div>
                <div class="feature-text">
                  <strong>Стратегия</strong>
                  <p>Помогает ставить цели и разбивать их на шаги</p>
                </div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">📅</div>
                <div class="feature-text">
                  <strong>Планирование</strong>
                  <p>Распределяет задачи по дням с учётом твоей загрузки</p>
                </div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">💪</div>
                <div class="feature-text">
                  <strong>Поддержка</strong>
                  <p>Мотивирует, напоминает и празднует победы</p>
                </div>
              </div>
            </div>
          </div>

          <div class="column-visual">
            <div class="chat-demo">
              <div class="chat-message ai">
                <div class="message-avatar">🤖</div>
                <div class="message-bubble">
                  Привет, Максим! Я вижу, что ты хочешь привести жизнь в порядок. 
                  Давай начнём с честной оценки — где ты сейчас в разных сферах жизни?
                </div>
              </div>
              <div class="chat-message user">
                <div class="message-bubble">
                  Да, чувствую, что здоровье запустил. Работа съедает всё время.
                </div>
              </div>
              <div class="chat-message ai">
                <div class="message-avatar">🤖</div>
                <div class="message-bubble">
                  Понимаю. Это частая история. Давай пройдём диагностику по 8 сферам — 
                  это займёт 5 минут, но даст честную картину. Готов?
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="arrow-connector">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#10b981" stroke-width="2">
          <path d="M20 5 L20 30 M10 20 L20 30 L30 20" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </section>

    <!-- WHEEL OF BALANCE SECTION - REDESIGNED -->
    <section id="wheel" class="screen-section bg-wheel">
      <div class="section-content">
        <div class="two-column">
          <div class="column-text">
            <div class="step-badge">День 1</div>
            <h2 class="section-title">Колесо баланса</h2>
            <p class="section-subtitle">Первый шаг — честная оценка. Где ты сейчас по ключевым сферам жизни?</p>
            
            <div class="example-card">
              <h3 class="example-title">Диагностика Максима</h3>
              
              <div class="scores-list">
                <div class="score-item" v-for="score in wheelScores" :key="score.name">
                  <div class="score-header">
                    <span class="score-name">{{ score.name }}</span>
                    <span class="score-value" :class="score.level">{{ score.value }}/10</span>
                  </div>
                  <div class="score-bar">
                    <div class="score-fill" :style="{ width: score.value * 10 + '%' }" :class="score.level"></div>
                  </div>
                </div>
              </div>

              <div class="ai-comment">
                <strong>AI Интервьюер:</strong> "Я вижу, что здоровье и спорт — твои главные провалы. 
                Расскажи, почему так вышло? Что мешает заниматься собой?"
              </div>
            </div>
          </div>

          <div class="column-visual wheel-visual-container">
            <div class="wheel-wrapper">
              <svg viewBox="0 0 400 400" class="wheel-svg-new">
                <circle cx="200" cy="200" r="180" fill="none" stroke="#e5e7eb" stroke-width="1"/>
                <circle cx="200" cy="200" r="144" fill="none" stroke="#e5e7eb" stroke-width="1" opacity="0.6"/>
                <circle cx="200" cy="200" r="108" fill="none" stroke="#e5e7eb" stroke-width="1" opacity="0.4"/>
                <circle cx="200" cy="200" r="72" fill="none" stroke="#e5e7eb" stroke-width="1" opacity="0.3"/>
                <circle cx="200" cy="200" r="36" fill="none" stroke="#e5e7eb" stroke-width="1" opacity="0.2"/>

                <path :d="getWedgePath(0, wheelScoresVisual[0].value)" :fill="wheelScoresVisual[0].color" opacity="0.85"/>
                <path :d="getWedgePath(1, wheelScoresVisual[1].value)" :fill="wheelScoresVisual[1].color" opacity="0.85"/>
                <path :d="getWedgePath(2, wheelScoresVisual[2].value)" :fill="wheelScoresVisual[2].color" opacity="0.85"/>
                <path :d="getWedgePath(3, wheelScoresVisual[3].value)" :fill="wheelScoresVisual[3].color" opacity="0.85"/>
                <path :d="getWedgePath(4, wheelScoresVisual[4].value)" :fill="wheelScoresVisual[4].color" opacity="0.85"/>
                <path :d="getWedgePath(5, wheelScoresVisual[5].value)" :fill="wheelScoresVisual[5].color" opacity="0.85"/>

                <text x="280" y="35" font-size="11" fill="#E86C6C" font-weight="600" transform="rotate(30, 280, 35)">БЛАГОСОСТОЯНИЕ</text>
                <text x="375" y="200" font-size="11" fill="#2BC4A4" font-weight="600" transform="rotate(90, 375, 200)">ХОББИ И ОТДЫХ</text>
                <text x="270" y="375" font-size="11" fill="#EFC75E" font-weight="600" transform="rotate(-30, 270, 375)">ДРУЖБА И ОКРУЖЕНИЕ</text>
                <text x="70" y="375" font-size="11" fill="#2BC4A4" font-weight="600" transform="rotate(30, 70, 375)">ЗДОРОВЬЕ И СПОРТ</text>
                <text x="10" y="200" font-size="11" fill="#2F4858" font-weight="600" transform="rotate(-90, 10, 200)">РАБОТА И КАРЬЕРА</text>
                <text x="70" y="35" font-size="11" fill="#A78BFA" font-weight="600" transform="rotate(-30, 70, 35)">ЛЮБОВЬ СЕМЬЯ</text>
              </svg>
              <div class="wheel-center-label">Я</div>
            </div>
          </div>
        </div>
      </div>

      <div class="transition-text">
        <p>"После диагностики стало ясно — здоровье и финансы провалены. Пора ставить конкретные цели."</p>
      </div>

      <div class="arrow-connector">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#6366f1" stroke-width="2">
          <path d="M20 5 L20 30 M10 20 L20 30 L30 20" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </section>

    <!-- GOALS SECTION - BIGGER VISUAL -->
    <section id="goals" class="screen-section bg-goals">
      <div class="section-content">
        <div class="goals-full-layout">
          <div class="goals-header-block">
            <div class="step-badge">День 1</div>
            <h2 class="section-title">Цели</h2>
            <p class="section-subtitle">Цели не из головы — они рождаются из проблем, выявленных в колесе баланса</p>
          </div>

          <div class="goals-cards-grid">
            <div class="goal-card-big red">
              <div class="goal-card-icon">❤️</div>
              <div class="goal-card-sphere">Здоровье</div>
              <div class="goal-card-score">4/10</div>
              <div class="goal-card-title">Заниматься спортом 3 раза в неделю</div>
              <div class="goal-card-reason">Запустил здоровье из-за работы</div>
            </div>

            <div class="goal-card-big pink">
              <div class="goal-card-icon">💰</div>
              <div class="goal-card-sphere">Финансы</div>
              <div class="goal-card-score">3/10</div>
              <div class="goal-card-title">Увеличить доход на 50 000 ₽/мес</div>
              <div class="goal-card-reason">Нет подушки безопасности</div>
            </div>

            <div class="goal-card-big blue">
              <div class="goal-card-icon">👨‍👩‍👧</div>
              <div class="goal-card-sphere">Семья</div>
              <div class="goal-card-score">5/10</div>
              <div class="goal-card-title">Проводить время с родителями 2 раза в месяц</div>
              <div class="goal-card-reason">Редко вижу близких</div>
            </div>
          </div>

          <div class="ai-comment-block purple">
            <strong>AI Стратег:</strong> "Я вижу 3 критические зоны. Давай начнём со здоровья — 
            это фундамент для остального. Готов разбить цель на конкретные шаги?"
          </div>
        </div>
      </div>

      <div class="transition-text">
        <p>"Цели есть. Но как съесть слона? По кусочкам. Время декомпозиции."</p>
      </div>

      <div class="arrow-connector">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#a855f7" stroke-width="2">
          <path d="M20 5 L20 30 M10 20 L20 30 L30 20" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </section>

    <!-- DECOMPOSITION SECTION - REDESIGNED -->
    <section id="decomposition" class="screen-section bg-decomposition">
      <div class="section-content">
        <div class="decomposition-layout">
          <div class="decomposition-header">
            <div class="step-badge">Неделя 1</div>
            <h2 class="section-title">Декомпозиция</h2>
            <p class="section-subtitle">Большая цель разбивается на конкретные, выполнимые шаги</p>
          </div>

          <div class="decomposition-visual">
            <div class="decomp-goal-card">
              <span class="decomp-goal-icon">🎯</span>
              <span class="decomp-goal-text">Спорт 3x/неделю</span>
            </div>

            <div class="decomp-connector"></div>

            <div class="decomp-step-card step-1">
              <span class="decomp-step-num">1. Выбрать вид спорта</span>
            </div>

            <div class="decomp-connector"></div>

            <div class="decomp-step-card step-2">
              <span class="decomp-step-num">2. Купить форму</span>
            </div>

            <div class="decomp-connector"></div>

            <div class="decomp-step-card step-3">
              <span class="decomp-step-num">3. Первая тренировка</span>
            </div>

            <div class="decomp-connector"></div>

            <div class="decomp-step-card step-4">
              <span class="decomp-step-num">4. Привыкнуть к ритму</span>
            </div>

            <div class="decomp-connector"></div>

            <div class="decomp-done-card">
              <span class="decomp-done-text">✓ Цель достигнута!</span>
            </div>
          </div>

          <div class="ai-comment-block pink">
            <strong>AI Методолог:</strong> "Разбил твою цель на 4 реальных шага. 
            Каждый занимает 15-30 минут. Первый можно сделать прямо сейчас!"
          </div>
        </div>
      </div>

      <div class="transition-text">
        <p>"Шаги есть. Теперь нужно вписать их в реальную жизнь — в календарь."</p>
      </div>

      <div class="arrow-connector">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#ec4899" stroke-width="2">
          <path d="M20 5 L20 30 M10 20 L20 30 L30 20" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </section>

    <!-- PLANNING SECTION - SERVICE DESIGN -->
    <section id="planning" class="screen-section bg-planning">
      <div class="section-content">
        <div class="planning-layout">
          <div class="planning-header">
            <div class="step-badge">Неделя 1</div>
            <h2 class="section-title">Планирование</h2>
            <p class="section-subtitle">AI распределяет шаги по дням с учётом твоей загрузки</p>
          </div>

          <div class="planning-demo-card">
            <div class="planning-week-header">
              <span class="week-title">Неделя Максима</span>
              <span class="week-range">23-29 декабря</span>
            </div>

            <div class="planning-stats-row">
              <div class="plan-stat"><span class="plan-stat-val">5</span><span class="plan-stat-lbl">шагов</span></div>
              <div class="plan-stat"><span class="plan-stat-val">3</span><span class="plan-stat-lbl">выполнено</span></div>
              <div class="plan-stat"><span class="plan-stat-val">2.5ч</span><span class="plan-stat-lbl">всего</span></div>
            </div>

            <div class="week-bar-demo">
              <div 
                v-for="day in planningDays" 
                :key="day.short"
                class="week-day-tab"
                :class="{ active: day.active, today: day.today, 'has-tasks': day.tasks > 0 }"
              >
                <span class="day-short">{{ day.short }}</span>
                <span class="day-num">{{ day.num }}</span>
                <span v-if="day.tasks > 0" class="day-task-count">{{ day.tasks }}</span>
              </div>
            </div>

            <div class="day-tasks-preview">
              <div class="task-preview-item completed">
                <div class="task-check done">✓</div>
                <span class="task-name">Выбрать вид спорта</span>
                <span class="task-time">30м</span>
              </div>
              <div class="task-preview-item">
                <div class="task-check"></div>
                <span class="task-name">Купить форму</span>
                <span class="task-time">1ч</span>
              </div>
            </div>

            <button class="ai-button">
              <span class="ai-icon">✨</span>
              AI распределил шаги по неделе
            </button>
          </div>

          <div class="ai-comment-block orange">
            <strong>AI Планировщик:</strong> "Вижу, что вторник и четверг у тебя посвободнее. 
            Поставлю тренировки туда. Утром или вечером удобнее?"
          </div>
        </div>
      </div>

      <div class="transition-text">
        <p>"План готов. Теперь главное — не забросить. Привычки + геймификация помогут."</p>
      </div>

      <div class="arrow-connector">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#f97316" stroke-width="2">
          <path d="M20 5 L20 30 M10 20 L20 30 L30 20" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </section>

    <!-- HABITS SECTION -->
    <section id="habits" class="screen-section bg-habits">
      <div class="section-content">
        <div class="two-column">
          <div class="column-text">
            <div class="step-badge">Месяц 1</div>
            <h2 class="section-title">Привычки</h2>
            <p class="section-subtitle">Стрики и XP превращают рутину в игру</p>
            
            <div class="example-card">
              <h3 class="example-title">Привычки Максима</h3>
              
              <div class="habits-list">
                <div class="habit-item" v-for="habit in habits" :key="habit.name">
                  <div class="habit-icon">{{ habit.icon }}</div>
                  <div class="habit-info">
                    <strong>{{ habit.name }}</strong>
                    <div class="habit-streak">
                      <span class="streak-fire">🔥</span>
                      <span class="streak-count">{{ habit.streak }} дней подряд</span>
                    </div>
                  </div>
                  <div class="habit-xp">+{{ habit.xp }} XP</div>
                </div>
              </div>

              <div class="xp-total">
                <span class="xp-label">Сегодня заработал:</span>
                <span class="xp-value">+45 XP</span>
              </div>

              <div class="ai-comment green">
                <strong>AI Ментор:</strong> "14 дней подряд! Это уже привычка. 
                Ещё неделя — и тело само будет просить тренировку. Горжусь тобой! 💪"
              </div>
            </div>
          </div>

          <div class="column-visual">
            <div class="streak-visual">
              <div class="streak-calendar">
                <div class="streak-month">Декабрь 2025</div>
                <div class="streak-days">
                  <div 
                    v-for="day in 21" 
                    :key="day" 
                    class="streak-day"
                    :class="{ completed: day <= 14, today: day === 15 }"
                  >
                    {{ day }}
                  </div>
                </div>
              </div>
              <div class="streak-badge">
                <span class="badge-icon">🏆</span>
                <span class="badge-text">14 дней стрик!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="transition-text">
        <p>"Месяц прошёл. XP копится — пора себя порадовать!"</p>
      </div>

      <div class="arrow-connector">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#22c55e" stroke-width="2">
          <path d="M20 5 L20 30 M10 20 L20 30 L30 20" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </section>

    <!-- ACHIEVEMENTS/REWARDS SECTION - REDESIGNED -->
    <section id="achievements" class="screen-section bg-achievements">
      <div class="section-content">
        <div class="two-column reverse">
          <div class="column-visual">
            <div class="rewards-demo-card">
              <div class="rewards-header">
                <span class="rewards-title">Мои награды</span>
                <div class="xp-balance">
                  <span class="xp-icon">⭐</span>
                  <span class="xp-amount">2,450 XP</span>
                </div>
              </div>

              <div class="reward-item unlocked">
                <div class="reward-icon">🎬</div>
                <div class="reward-info">
                  <span class="reward-name">Вечер кино</span>
                  <span class="reward-cost">500 XP</span>
                </div>
                <button class="reward-btn claimed">Получено!</button>
              </div>

              <div class="reward-item unlocked">
                <div class="reward-icon">🍕</div>
                <div class="reward-info">
                  <span class="reward-name">Заказать любимую пиццу</span>
                  <span class="reward-cost">750 XP</span>
                </div>
                <button class="reward-btn claimed">Получено!</button>
              </div>

              <div class="reward-item available">
                <div class="reward-icon">🎮</div>
                <div class="reward-info">
                  <span class="reward-name">Новая игра</span>
                  <span class="reward-cost">1500 XP</span>
                </div>
                <button class="reward-btn ready">Наградить себя!</button>
              </div>

              <div class="reward-item locked">
                <div class="reward-icon">✈️</div>
                <div class="reward-info">
                  <span class="reward-name">Поездка на выходные</span>
                  <span class="reward-cost">5000 XP</span>
                </div>
                <div class="reward-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 49%"></div>
                  </div>
                  <span class="progress-text">2450/5000</span>
                </div>
              </div>
            </div>
          </div>

          <div class="column-text">
            <div class="step-badge success">3 месяца</div>
            <h2 class="section-title">Награды</h2>
            <p class="section-subtitle">Планируй награды, зарабатывай XP и поощряй себя за прогресс</p>
            
            <div class="example-card success">
              <h3 class="example-title">Система Максима</h3>
              
              <div class="rewards-explain">
                <div class="explain-item">
                  <span class="explain-num">1</span>
                  <span class="explain-text">Составь список желанных наград</span>
                </div>
                <div class="explain-item">
                  <span class="explain-num">2</span>
                  <span class="explain-text">Назначь каждой цену в XP</span>
                </div>
                <div class="explain-item">
                  <span class="explain-num">3</span>
                  <span class="explain-text">Выполняй привычки и шаги — копи XP</span>
                </div>
                <div class="explain-item">
                  <span class="explain-num">4</span>
                  <span class="explain-text">Достиг цели — порадуй себя!</span>
                </div>
              </div>

              <div class="ai-comment success">
                <strong>AI Ментор:</strong> "Максим, у тебя хватает на новую игру! 
                Ты её заслужил — 47 шагов выполнено. Нажми 'Наградить себя'! 🎉"
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="arrow-connector">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#8b5cf6" stroke-width="2">
          <path d="M20 5 L20 30 M10 20 L20 30 L30 20" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </section>

    <!-- AI MENTOR IN TELEGRAM - NEW SECTION -->
    <section id="telegram" class="screen-section bg-telegram">
      <div class="section-content">
        <div class="two-column">
          <div class="column-text">
            <h2 class="section-title">AI Ментор в Telegram</h2>
            <p class="section-subtitle">Сквозной помощник на всём пути. Ежедневная поддержка, фидбэк и направление</p>
            
            <div class="telegram-schedule-card">
              <h3 class="schedule-title">Как работает AI Ментор Максима</h3>
              
              <div class="schedule-item">
                <div class="schedule-icon">🌅</div>
                <div class="schedule-content">
                  <strong>Утро (08:00)</strong>
                  <p>"Привет, Максим! Сегодня у тебя запланирована тренировка в 18:00. Готов? 💪"</p>
                </div>
              </div>

              <div class="schedule-item">
                <div class="schedule-icon">🍽️</div>
                <div class="schedule-content">
                  <strong>Днём (14:00)</strong>
                  <p>"Напоминание: не забудь про завтрак дома. Это одна из твоих привычек! 🍳"</p>
                </div>
              </div>

              <div class="schedule-item">
                <div class="schedule-icon">🌙</div>
                <div class="schedule-content">
                  <strong>Вечер (21:00)</strong>
                  <p>"Время отчёта! Расскажи как дела. Ты тренировался? Ел здоровую пищу?"</p>
                </div>
              </div>

              <div class="schedule-item">
                <div class="schedule-icon">✨</div>
                <div class="schedule-content">
                  <strong>Анализ (21:15)</strong>
                  <p>"Отлично! Ты выполнил 5 из 6 пунктов. Что помешало 6-му? Давай разберёмся"</p>
                </div>
              </div>

              <div class="role-transformation">
                <strong>Ролевая трансформация:</strong> На этапе Колеса - Интервьюер 🎙 → На целях - Стратег 📊 → На спорте - Коуч 💪 → Всегда - Ментор 🤝
              </div>
            </div>
          </div>

          <div class="column-visual">
            <div class="phone-mockup">
              <div class="phone-frame">
                <div class="phone-notch"></div>
                <div class="phone-screen">
                  <div class="tg-header">
                    <div class="tg-avatar">🤖</div>
                    <div class="tg-info">
                      <span class="tg-name">AI Ментор 1%</span>
                      <span class="tg-status">online</span>
                    </div>
                  </div>
                  <div class="tg-messages">
                    <div class="tg-msg bot">
                      <span>Привет! 👋 Как у тебя дела со спортом?</span>
                    </div>
                    <div class="tg-msg user">
                      <span>Потренировался! 💪</span>
                    </div>
                    <div class="tg-msg bot">
                      <span>Отлично! 🔥 Это твой 7-й день подряд.<br/>Горячая полоса начинается с 7!</span>
                    </div>
                    <div class="tg-msg user green-btn">
                      <span>Спасибо за поддержку! 😊</span>
                    </div>
                    <div class="tg-msg bot">
                      <span>Это твоя победа, Максим!<br/><span class="tg-accent">+1% каждый день = 37x в год</span></span>
                    </div>
                  </div>
                  <div class="tg-input">
                    <span>Сообщение...</span>
                    <div class="tg-send">!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="arrow-connector">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#0ea5e9" stroke-width="2">
          <path d="M20 5 L20 30 M10 20 L20 30 L30 20" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </section>

    <!-- FINAL CTA SECTION -->
    <section id="cta" class="screen-section bg-cta">
      <div class="section-content centered">
        <h2 class="cta-title">Хочешь как Максим?</h2>
        <p class="cta-subtitle">
          Начни с малого. Система сделает остальное.
        </p>
        
        <div class="cta-features">
          <div class="cta-feature">✓ 5 минут на диагностику</div>
          <div class="cta-feature">✓ AI поможет на каждом шаге</div>
          <div class="cta-feature">✓ Бесплатный старт</div>
        </div>

        <router-link to="/register" class="cta-button-large">
          Начать свой путь
        </router-link>

        <p class="cta-note">Уже есть аккаунт? <router-link to="/login">Войти</router-link></p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const activeSection = ref(0)

const sections = [
  { id: 'hero', title: 'Начало' },
  { id: 'mentor', title: 'AI Ментор' },
  { id: 'wheel', title: 'Колесо баланса' },
  { id: 'goals', title: 'Цели' },
  { id: 'decomposition', title: 'Декомпозиция' },
  { id: 'planning', title: 'Планирование' },
  { id: 'habits', title: 'Привычки' },
  { id: 'achievements', title: 'Награды' },
  { id: 'telegram', title: 'Telegram' },
  { id: 'cta', title: 'Начать' }
]

const wheelScores = [
  { name: 'Благосостояние', value: 3, level: 'low' },
  { name: 'Хобби и отдых', value: 7, level: 'high' },
  { name: 'Дружба', value: 6, level: 'medium' },
  { name: 'Здоровье', value: 4, level: 'low' },
  { name: 'Карьера', value: 8, level: 'high' },
  { name: 'Семья', value: 5, level: 'medium' }
]

const wheelScoresVisual = [
  { value: 3, color: '#E86C6C' },
  { value: 7, color: '#2BC4A4' },
  { value: 6, color: '#EFC75E' },
  { value: 4, color: '#2BC4A4' },
  { value: 8, color: '#2F4858' },
  { value: 5, color: '#A78BFA' }
]

const getWedgePath = (index, value) => {
  const cx = 200
  const cy = 200
  const maxRadius = 180
  const minRadius = 20
  const radius = minRadius + (value / 10) * (maxRadius - minRadius)
  const anglePerSector = 60
  const startAngle = (index * anglePerSector - 90) * Math.PI / 180
  const endAngle = ((index + 1) * anglePerSector - 90) * Math.PI / 180
  
  const x1 = cx + radius * Math.cos(startAngle)
  const y1 = cy + radius * Math.sin(startAngle)
  const x2 = cx + radius * Math.cos(endAngle)
  const y2 = cy + radius * Math.sin(endAngle)
  
  return `M${cx},${cy} L${x1},${y1} A${radius},${radius} 0 0,1 ${x2},${y2} Z`
}

const planningDays = [
  { short: 'Пн', num: 23, tasks: 2, active: false, today: false },
  { short: 'Вт', num: 24, tasks: 1, active: true, today: true },
  { short: 'Ср', num: 25, tasks: 0, active: false, today: false },
  { short: 'Чт', num: 26, tasks: 2, active: false, today: false },
  { short: 'Пт', num: 27, tasks: 0, active: false, today: false },
  { short: 'Сб', num: 28, tasks: 1, active: false, today: false },
  { short: 'Вс', num: 29, tasks: 0, active: false, today: false }
]

const habits = [
  { name: 'Утренняя зарядка', icon: '🏃', streak: 14, xp: 15 },
  { name: 'Пить воду', icon: '💧', streak: 21, xp: 10 },
  { name: 'Чтение 30 мин', icon: '📚', streak: 7, xp: 20 }
]

const scrollToSection = (index) => {
  const section = document.getElementById(sections[index].id)
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' })
  }
}

const handleScroll = () => {
  const sectionElements = sections.map(s => document.getElementById(s.id))
  const scrollPosition = window.scrollY + window.innerHeight / 2

  for (let i = sectionElements.length - 1; i >= 0; i--) {
    const section = sectionElements[i]
    if (section && section.offsetTop <= scrollPosition) {
      activeSection.value = i
      break
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.landing-v2 {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1f2937;
}

.sidebar-nav {
  position: fixed;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nav-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-dot.active {
  width: 14px;
  height: 14px;
  background: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
}

.nav-dot:hover {
  background: #6366f1;
  transform: scale(1.2);
}

.screen-section {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  padding: 60px 20px;
}

.section-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.bg-hero { background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%); }
.bg-mentor { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); }
.bg-wheel { background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%); }
.bg-goals { background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%); }
.bg-decomposition { background: linear-gradient(135deg, #fce7f3 0%, #fee2e2 100%); }
.bg-planning { background: linear-gradient(135deg, #fed7aa 0%, #fef3c7 100%); }
.bg-habits { background: linear-gradient(135deg, #d1fae5 0%, #ccfbf1 100%); }
.bg-achievements { background: linear-gradient(135deg, #bfdbfe 0%, #ddd6fe 100%); }
.bg-telegram { background: linear-gradient(135deg, #e0f2fe 0%, #cffafe 100%); }
.bg-cta { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); }

.two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.two-column.reverse .column-visual {
  order: -1;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 20px;
}

.text-accent {
  display: block;
  color: #6366f1;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #6b7280;
  margin-bottom: 30px;
}

.persona-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
}

.persona-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.persona-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.25rem;
}

.persona-info h3 {
  font-weight: 700;
  margin: 0;
}

.persona-info p {
  color: #6b7280;
  margin: 0;
  font-size: 0.9rem;
}

.persona-quote {
  font-style: italic;
  color: #4b5563;
  border-left: 3px solid #6366f1;
  padding-left: 15px;
  margin: 0;
}

.cta-button {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

.growth-chart {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.chart-svg {
  width: 100%;
  height: auto;
}

.chart-label {
  text-align: center;
  margin-top: 20px;
}

.chart-multiplier {
  display: block;
  font-size: 2rem;
  font-weight: 800;
  color: #6366f1;
}

.chart-text {
  color: #6b7280;
  font-size: 0.9rem;
}

.arrow-connector {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(10px); }
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 15px;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #6b7280;
  margin-bottom: 30px;
}

.step-badge {
  display: inline-block;
  background: #6366f1;
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 15px;
}

.step-badge.success {
  background: #22c55e;
}

.example-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
}

.example-card.success {
  border: 2px solid #22c55e;
}

.example-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #6366f1;
  margin-bottom: 20px;
}

.scores-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.score-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.score-header {
  display: flex;
  justify-content: space-between;
}

.score-name {
  font-size: 0.9rem;
  font-weight: 500;
}

.score-value {
  font-weight: 700;
  font-size: 0.9rem;
}

.score-value.low { color: #ef4444; }
.score-value.medium { color: #f59e0b; }
.score-value.high { color: #22c55e; }

.score-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.score-fill.low { background: linear-gradient(90deg, #ef4444, #f87171); }
.score-fill.medium { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.score-fill.high { background: linear-gradient(90deg, #22c55e, #4ade80); }

.ai-comment {
  background: #eef2ff;
  border-left: 4px solid #6366f1;
  padding: 15px;
  border-radius: 0 8px 8px 0;
  font-size: 0.95rem;
  margin-top: 20px;
}

.ai-comment.purple { background: #faf5ff; border-color: #a855f7; }
.ai-comment.pink { background: #fdf2f8; border-color: #ec4899; }
.ai-comment.orange { background: #fff7ed; border-color: #f97316; }
.ai-comment.green { background: #ecfdf5; border-color: #22c55e; }
.ai-comment.success { background: #f0fdf4; border-color: #22c55e; }

.ai-comment-block {
  background: white;
  border-left: 4px solid #6366f1;
  padding: 20px;
  border-radius: 0 12px 12px 0;
  font-size: 1rem;
  margin-top: 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.ai-comment-block.purple { border-color: #a855f7; }
.ai-comment-block.pink { border-color: #ec4899; }
.ai-comment-block.orange { border-color: #f97316; }

.transition-text {
  text-align: center;
  margin-top: 40px;
  padding: 20px;
}

.transition-text p {
  font-style: italic;
  color: #6b7280;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

/* Wheel - New Design */
.wheel-visual-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.wheel-wrapper {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.wheel-svg-new {
  width: 100%;
  height: auto;
}

.wheel-center-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  font-weight: 700;
  color: #6366f1;
  background: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

/* Goals - Big Cards */
.goals-full-layout {
  text-align: center;
}

.goals-header-block {
  margin-bottom: 40px;
}

.goals-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 30px;
}

.goal-card-big {
  background: white;
  border-radius: 20px;
  padding: 30px 20px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08);
  border-top: 4px solid;
  transition: transform 0.2s;
}

.goal-card-big:hover {
  transform: translateY(-5px);
}

.goal-card-big.red { border-color: #ef4444; }
.goal-card-big.pink { border-color: #ec4899; }
.goal-card-big.blue { border-color: #3b82f6; }

.goal-card-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.goal-card-sphere {
  font-size: 0.9rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 5px;
}

.goal-card-score {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 15px;
}

.goal-card-big.red .goal-card-score { color: #ef4444; }
.goal-card-big.pink .goal-card-score { color: #ec4899; }
.goal-card-big.blue .goal-card-score { color: #3b82f6; }

.goal-card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.goal-card-reason {
  font-size: 0.9rem;
  color: #9ca3af;
}

/* Decomposition - New Design */
.decomposition-layout {
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}

.decomposition-header {
  margin-bottom: 40px;
}

.decomposition-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.decomp-goal-card {
  background: linear-gradient(135deg, #9333ea, #7c3aed);
  color: white;
  padding: 20px 40px;
  border-radius: 16px;
  font-size: 1.2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
}

.decomp-goal-icon {
  font-size: 1.5rem;
}

.decomp-connector {
  width: 3px;
  height: 25px;
  background: repeating-linear-gradient(
    to bottom,
    #9ca3af 0,
    #9ca3af 8px,
    transparent 8px,
    transparent 16px
  );
}

.decomp-step-card {
  width: 100%;
  max-width: 350px;
  padding: 20px 30px;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  border: 2px solid;
}

.decomp-step-card.step-1 {
  background: linear-gradient(135deg, #fce7f3, #fdf2f8);
  border-color: #ec4899;
}

.decomp-step-card.step-2 {
  background: linear-gradient(135deg, #ffedd5, #fff7ed);
  border-color: #f97316;
}

.decomp-step-card.step-3 {
  background: linear-gradient(135deg, #fef3c7, #fffbeb);
  border-color: #f59e0b;
}

.decomp-step-card.step-4 {
  background: linear-gradient(135deg, #fef9c3, #fefce8);
  border-color: #eab308;
}

.decomp-done-card {
  background: linear-gradient(135deg, #dcfce7, #f0fdf4);
  border: 2px solid #22c55e;
  padding: 18px 35px;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #166534;
}

/* Planning - Service Design */
.planning-layout {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.planning-header {
  margin-bottom: 30px;
}

.planning-demo-card {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
}

.planning-week-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.week-title {
  font-size: 1.2rem;
  font-weight: 700;
}

.week-range {
  color: #6b7280;
  font-size: 0.9rem;
}

.planning-stats-row {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e5e7eb;
}

.plan-stat {
  text-align: center;
}

.plan-stat-val {
  display: block;
  font-size: 1.3rem;
  font-weight: 700;
  color: #6366f1;
}

.plan-stat-lbl {
  font-size: 0.8rem;
  color: #6b7280;
}

.week-bar-demo {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 20px;
}

.week-day-tab {
  flex: 1;
  padding: 10px 5px;
  border-radius: 12px;
  background: #f3f4f6;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.week-day-tab.active {
  background: #6366f1;
  color: white;
}

.week-day-tab.today {
  border: 2px solid #6366f1;
}

.week-day-tab.has-tasks::after {
  content: '';
  position: absolute;
  top: 5px;
  right: 5px;
  width: 6px;
  height: 6px;
  background: #22c55e;
  border-radius: 50%;
}

.week-day-tab.active.has-tasks::after {
  background: white;
}

.day-short {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
}

.day-num {
  display: block;
  font-size: 1rem;
  font-weight: 700;
}

.day-task-count {
  display: block;
  font-size: 0.7rem;
  color: #6b7280;
}

.week-day-tab.active .day-task-count {
  color: rgba(255,255,255,0.8);
}

.day-tasks-preview {
  margin-bottom: 20px;
}

.task-preview-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
  margin-bottom: 8px;
}

.task-preview-item.completed {
  opacity: 0.7;
}

.task-check {
  width: 24px;
  height: 24px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-check.done {
  background: #22c55e;
  border-color: #22c55e;
  color: white;
  font-size: 0.8rem;
}

.task-name {
  flex: 1;
  text-align: left;
  font-weight: 500;
}

.task-preview-item.completed .task-name {
  text-decoration: line-through;
}

.task-time {
  color: #6b7280;
  font-size: 0.85rem;
}

.ai-button {
  width: 100%;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.ai-icon {
  font-size: 1.2rem;
}

/* Habits */
.habits-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.habit-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  background: #f0fdf4;
  border-radius: 10px;
}

.habit-icon {
  font-size: 1.5rem;
}

.habit-info {
  flex: 1;
}

.habit-info strong {
  display: block;
}

.habit-streak {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.85rem;
  color: #f97316;
}

.streak-fire {
  font-size: 1rem;
}

.habit-xp {
  background: #6366f1;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.xp-total {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 10px;
  color: white;
  margin-bottom: 15px;
}

.xp-value {
  font-weight: 700;
}

.streak-visual {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.streak-month {
  text-align: center;
  font-weight: 700;
  color: #6366f1;
  margin-bottom: 15px;
}

.streak-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.streak-day {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.85rem;
  background: #f3f4f6;
}

.streak-day.completed {
  background: #22c55e;
  color: white;
  font-weight: 600;
}

.streak-day.today {
  background: #fef3c7;
  border: 2px solid #f59e0b;
}

.streak-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  padding: 15px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 10px;
}

.badge-icon {
  font-size: 1.5rem;
}

.badge-text {
  font-weight: 700;
  color: #92400e;
}

/* Rewards/Achievements */
.rewards-demo-card {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
}

.rewards-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e5e7eb;
}

.rewards-title {
  font-size: 1.2rem;
  font-weight: 700;
}

.xp-balance {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  padding: 8px 15px;
  border-radius: 20px;
}

.xp-icon {
  font-size: 1.2rem;
}

.xp-amount {
  font-weight: 700;
  color: #92400e;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 10px;
  background: #f9fafb;
}

.reward-item.unlocked {
  background: #f0fdf4;
}

.reward-item.available {
  background: #ecfdf5;
  border: 2px solid #22c55e;
}

.reward-item.locked {
  opacity: 0.7;
}

.reward-icon {
  font-size: 2rem;
}

.reward-info {
  flex: 1;
}

.reward-name {
  display: block;
  font-weight: 600;
}

.reward-cost {
  font-size: 0.85rem;
  color: #6b7280;
}

.reward-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  border: none;
  cursor: pointer;
}

.reward-btn.claimed {
  background: #d1d5db;
  color: #6b7280;
}

.reward-btn.ready {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

.reward-progress {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 100px;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 4px;
}

.progress-text {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
}

.rewards-explain {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.explain-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.explain-num {
  width: 30px;
  height: 30px;
  background: #6366f1;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.explain-text {
  font-size: 1rem;
}

/* Telegram Section */
.telegram-schedule-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08);
}

.schedule-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0ea5e9;
  margin-bottom: 20px;
}

.schedule-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 12px;
  margin-bottom: 12px;
}

.schedule-icon {
  font-size: 1.5rem;
}

.schedule-content strong {
  display: block;
  margin-bottom: 5px;
}

.schedule-content p {
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
  font-style: italic;
}

.role-transformation {
  margin-top: 20px;
  padding: 15px;
  background: #e0f2fe;
  border-radius: 10px;
  font-size: 0.9rem;
}

/* Phone Mockup */
.phone-mockup {
  display: flex;
  justify-content: center;
}

.phone-frame {
  width: 280px;
  background: #1f2937;
  border-radius: 35px;
  padding: 10px;
  box-shadow: 0 25px 60px rgba(0,0,0,0.3);
}

.phone-notch {
  width: 100px;
  height: 25px;
  background: #1f2937;
  border-radius: 0 0 15px 15px;
  margin: 0 auto 10px;
}

.phone-screen {
  background: white;
  border-radius: 25px;
  overflow: hidden;
}

.tg-header {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.tg-avatar {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}

.tg-info {
  color: white;
}

.tg-name {
  display: block;
  font-weight: 700;
}

.tg-status {
  font-size: 0.8rem;
  opacity: 0.9;
}

.tg-messages {
  padding: 15px;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tg-msg {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 0.9rem;
  line-height: 1.4;
}

.tg-msg.bot {
  background: #f3f4f6;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}

.tg-msg.user {
  background: #0ea5e9;
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}

.tg-msg.green-btn {
  background: #22c55e;
}

.tg-accent {
  color: #0ea5e9;
  font-weight: 600;
}

.tg-input {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-top: 1px solid #e5e7eb;
  color: #9ca3af;
  font-size: 0.9rem;
}

.tg-send {
  width: 30px;
  height: 30px;
  background: #0ea5e9;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  font-weight: 700;
}

/* Mentor Features */
.mentor-features {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 30px;
}

.feature-item {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.feature-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.feature-text strong {
  display: block;
  margin-bottom: 4px;
}

.feature-text p {
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
}

/* Chat Demo */
.chat-demo {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chat-message {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.chat-message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  background: #ecfdf5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.message-bubble {
  background: #f3f4f6;
  padding: 12px 16px;
  border-radius: 16px;
  max-width: 80%;
  font-size: 0.95rem;
  line-height: 1.5;
}

.chat-message.ai .message-bubble {
  background: #ecfdf5;
  border: 1px solid #d1fae5;
}

.chat-message.user .message-bubble {
  background: #6366f1;
  color: white;
}

/* Final CTA */
.bg-cta {
  color: white;
}

.centered {
  text-align: center;
  max-width: 600px;
}

.cta-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 20px;
}

.cta-subtitle {
  font-size: 1.3rem;
  opacity: 0.9;
  margin-bottom: 30px;
}

.cta-features {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.cta-feature {
  font-size: 1.1rem;
  opacity: 0.9;
}

.cta-button-large {
  display: inline-block;
  background: white;
  color: #6366f1;
  padding: 18px 48px;
  border-radius: 14px;
  font-size: 1.2rem;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.cta-button-large:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.cta-note {
  margin-top: 20px;
  opacity: 0.8;
}

.cta-note a {
  color: white;
  text-decoration: underline;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .sidebar-nav {
    display: none;
  }

  .screen-section {
    min-height: auto;
    padding: 60px 15px;
  }

  .hero-grid,
  .two-column {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .two-column.reverse .column-visual {
    order: 0;
  }

  .hero-title {
    font-size: 2rem;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .goals-cards-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .week-bar-demo {
    gap: 4px;
  }

  .week-day-tab {
    padding: 8px 3px;
  }

  .cta-title {
    font-size: 2rem;
  }

  .cta-features {
    flex-direction: column;
    gap: 15px;
  }

  .streak-days {
    gap: 4px;
  }

  .streak-day {
    width: 30px;
    height: 30px;
    font-size: 0.75rem;
  }

  .phone-frame {
    width: 240px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.75rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .planning-stats-row {
    gap: 15px;
  }

  .decomp-step-card,
  .decomp-goal-card {
    padding: 15px 20px;
    font-size: 1rem;
  }
}
</style>
