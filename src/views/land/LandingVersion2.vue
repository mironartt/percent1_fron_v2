<template>
  <div class="landing-v2">
    <!-- Sidebar Navigation -->
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
            
            <!-- Persona Card -->
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

    <!-- WHEEL OF BALANCE SECTION -->
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

          <div class="column-visual">
            <svg viewBox="0 0 300 300" class="wheel-svg">
              <defs>
                <linearGradient id="wheelRed" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#ef4444;stop-opacity:0.6" />
                  <stop offset="100%" style="stop-color:#fca5a5;stop-opacity:0.3" />
                </linearGradient>
                <linearGradient id="wheelGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.6" />
                  <stop offset="100%" style="stop-color:#a7f3d0;stop-opacity:0.3" />
                </linearGradient>
                <linearGradient id="wheelYellow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:0.6" />
                  <stop offset="100%" style="stop-color:#fcd34d;stop-opacity:0.3" />
                </linearGradient>
              </defs>

              <circle cx="150" cy="150" r="120" fill="none" stroke="#e5e7eb" stroke-width="1" opacity="0.5"/>
              <circle cx="150" cy="150" r="80" fill="none" stroke="#e5e7eb" stroke-width="1" opacity="0.3"/>
              <circle cx="150" cy="150" r="40" fill="#f3f4f6" stroke="#6366f1" stroke-width="2"/>
              <text x="150" y="155" text-anchor="middle" font-size="14" fill="#6366f1" font-weight="bold">Я</text>

              <g class="wheel-segment">
                <path d="M 150 30 A 120 120 0 0 1 254 90 L 202 120 A 60 60 0 0 0 150 90 Z" fill="url(#wheelRed)" stroke="#6366f1" stroke-width="1"/>
                <text x="195" y="65" font-size="11" fill="#1f2937" font-weight="bold">Здоровье</text>
                <text x="205" y="80" font-size="14" fill="#ef4444" font-weight="bold">4/10</text>
              </g>

              <g class="wheel-segment">
                <path d="M 254 90 A 120 120 0 0 1 254 210 L 202 180 A 60 60 0 0 0 202 120 Z" fill="url(#wheelGreen)" stroke="#6366f1" stroke-width="1"/>
                <text x="245" y="145" font-size="11" fill="#1f2937" font-weight="bold">Карьера</text>
                <text x="245" y="165" font-size="14" fill="#10b981" font-weight="bold">8/10</text>
              </g>

              <g class="wheel-segment">
                <path d="M 254 210 A 120 120 0 0 1 150 270 L 150 210 A 60 60 0 0 0 202 180 Z" fill="url(#wheelYellow)" stroke="#6366f1" stroke-width="1"/>
                <text x="195" y="235" font-size="11" fill="#1f2937" font-weight="bold">Семья</text>
                <text x="195" y="255" font-size="14" fill="#f59e0b" font-weight="bold">5/10</text>
              </g>

              <g class="wheel-segment">
                <path d="M 150 270 A 120 120 0 0 1 46 210 L 98 180 A 60 60 0 0 0 150 210 Z" fill="url(#wheelRed)" stroke="#6366f1" stroke-width="1"/>
                <text x="85" y="255" font-size="11" fill="#1f2937" font-weight="bold">Спорт</text>
                <text x="95" y="235" font-size="14" fill="#ef4444" font-weight="bold">2/10</text>
              </g>

              <g class="wheel-segment">
                <path d="M 46 210 A 120 120 0 0 1 46 90 L 98 120 A 60 60 0 0 0 98 180 Z" fill="url(#wheelYellow)" stroke="#6366f1" stroke-width="1"/>
                <text x="35" y="145" font-size="11" fill="#1f2937" font-weight="bold">Отнош.</text>
                <text x="45" y="165" font-size="14" fill="#f59e0b" font-weight="bold">6/10</text>
              </g>

              <g class="wheel-segment">
                <path d="M 46 90 A 120 120 0 0 1 150 30 L 150 90 A 60 60 0 0 0 98 120 Z" fill="url(#wheelRed)" stroke="#6366f1" stroke-width="1"/>
                <text x="75" y="65" font-size="11" fill="#1f2937" font-weight="bold">Финансы</text>
                <text x="85" y="85" font-size="14" fill="#ef4444" font-weight="bold">3/10</text>
              </g>
            </svg>
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

    <!-- GOALS SECTION -->
    <section id="goals" class="screen-section bg-goals">
      <div class="section-content">
        <div class="two-column reverse">
          <div class="column-visual">
            <svg viewBox="0 0 300 350" class="goals-svg">
              <line x1="150" y1="60" x2="150" y2="120" stroke="#9333ea" stroke-width="3"/>
              <line x1="150" y1="120" x2="80" y2="180" stroke="#9333ea" stroke-width="2"/>
              <line x1="150" y1="120" x2="220" y2="180" stroke="#9333ea" stroke-width="2"/>
              <line x1="150" y1="120" x2="150" y2="180" stroke="#9333ea" stroke-width="2"/>

              <circle cx="150" cy="50" r="30" fill="#9333ea"/>
              <text x="150" y="45" text-anchor="middle" font-size="9" fill="white" font-weight="bold">Слабые</text>
              <text x="150" y="58" text-anchor="middle" font-size="9" fill="white" font-weight="bold">зоны</text>

              <rect x="40" y="190" width="80" height="60" rx="8" fill="#fee2e2" stroke="#ef4444" stroke-width="2"/>
              <text x="80" y="215" text-anchor="middle" font-size="10" fill="#991b1b" font-weight="bold">Здоровье</text>
              <text x="80" y="235" text-anchor="middle" font-size="9" fill="#7f1d1d">Спорт 3x/нед</text>

              <rect x="110" y="190" width="80" height="60" rx="8" fill="#fce7f3" stroke="#ec4899" stroke-width="2"/>
              <text x="150" y="215" text-anchor="middle" font-size="10" fill="#9d174d" font-weight="bold">Финансы</text>
              <text x="150" y="235" text-anchor="middle" font-size="9" fill="#831843">+50к/мес</text>

              <rect x="180" y="190" width="80" height="60" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
              <text x="220" y="215" text-anchor="middle" font-size="10" fill="#1e40af" font-weight="bold">Семья</text>
              <text x="220" y="235" text-anchor="middle" font-size="9" fill="#1e3a8a">2x в месяц</text>

              <text x="150" y="290" text-anchor="middle" font-size="12" fill="#6b21a8" font-weight="bold">Из проблем → Конкретные цели</text>
            </svg>
          </div>

          <div class="column-text">
            <div class="step-badge">День 1</div>
            <h2 class="section-title">Цели</h2>
            <p class="section-subtitle">Цели не из головы — они рождаются из проблем, выявленных в колесе баланса</p>
            
            <div class="example-card">
              <h3 class="example-title">Цели Максима</h3>
              
              <div class="goals-list">
                <div class="goal-item red">
                  <div class="goal-header">
                    <span class="goal-sphere">Здоровье (4/10)</span>
                  </div>
                  <p class="goal-text">Заниматься спортом 3 раза в неделю</p>
                </div>
                <div class="goal-item pink">
                  <div class="goal-header">
                    <span class="goal-sphere">Финансы (3/10)</span>
                  </div>
                  <p class="goal-text">Увеличить доход на 50 000 ₽/мес</p>
                </div>
                <div class="goal-item blue">
                  <div class="goal-header">
                    <span class="goal-sphere">Семья (5/10)</span>
                  </div>
                  <p class="goal-text">Проводить время с родителями 2 раза в месяц</p>
                </div>
              </div>

              <div class="ai-comment purple">
                <strong>AI Стратег:</strong> "Я вижу 3 критические зоны. Давай начнём со здоровья — 
                это фундамент для остального. Готов разбить цель на конкретные шаги?"
              </div>
            </div>
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

    <!-- DECOMPOSITION SECTION -->
    <section id="decomposition" class="screen-section bg-decomposition">
      <div class="section-content">
        <div class="two-column">
          <div class="column-text">
            <div class="step-badge">Неделя 1</div>
            <h2 class="section-title">Декомпозиция</h2>
            <p class="section-subtitle">Большая цель разбивается на конкретные, выполнимые шаги</p>
            
            <div class="example-card">
              <h3 class="example-title">Цель: "Спорт 3x в неделю"</h3>
              
              <div class="steps-list">
                <div class="step-item" v-for="(step, index) in decompositionSteps" :key="index">
                  <div class="step-number">{{ index + 1 }}</div>
                  <div class="step-content">
                    <strong>{{ step.title }}</strong>
                    <p>{{ step.description }}</p>
                  </div>
                  <div class="step-time">{{ step.time }}</div>
                </div>
              </div>

              <div class="ai-comment pink">
                <strong>AI Методолог:</strong> "Разбил твою цель на 5 реальных шагов. 
                Каждый занимает 15-30 минут. Первый можно сделать прямо сейчас!"
              </div>
            </div>
          </div>

          <div class="column-visual">
            <svg viewBox="0 0 280 400" class="steps-svg">
              <defs>
                <linearGradient id="stepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#ec4899;stop-opacity:0.2" />
                  <stop offset="100%" style="stop-color:#f97316;stop-opacity:0.2" />
                </linearGradient>
              </defs>

              <rect x="60" y="20" width="160" height="50" rx="10" fill="#9333ea" stroke="none"/>
              <text x="140" y="50" text-anchor="middle" font-size="12" fill="white" font-weight="bold">🎯 Спорт 3x/неделю</text>

              <line x1="140" y1="70" x2="140" y2="100" stroke="#9333ea" stroke-width="2" stroke-dasharray="4"/>

              <rect x="40" y="100" width="200" height="45" rx="8" fill="url(#stepGrad)" stroke="#ec4899" stroke-width="2"/>
              <text x="140" y="128" text-anchor="middle" font-size="11" fill="#1f2937">1. Выбрать вид спорта</text>

              <line x1="140" y1="145" x2="140" y2="165" stroke="#f97316" stroke-width="2" stroke-dasharray="4"/>

              <rect x="40" y="165" width="200" height="45" rx="8" fill="url(#stepGrad)" stroke="#f97316" stroke-width="2"/>
              <text x="140" y="193" text-anchor="middle" font-size="11" fill="#1f2937">2. Купить форму</text>

              <line x1="140" y1="210" x2="140" y2="230" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4"/>

              <rect x="40" y="230" width="200" height="45" rx="8" fill="url(#stepGrad)" stroke="#f59e0b" stroke-width="2"/>
              <text x="140" y="258" text-anchor="middle" font-size="11" fill="#1f2937">3. Первая тренировка</text>

              <line x1="140" y1="275" x2="140" y2="295" stroke="#eab308" stroke-width="2" stroke-dasharray="4"/>

              <rect x="40" y="295" width="200" height="45" rx="8" fill="url(#stepGrad)" stroke="#eab308" stroke-width="2"/>
              <text x="140" y="323" text-anchor="middle" font-size="11" fill="#1f2937">4. Привыкнуть к ритму</text>

              <line x1="140" y1="340" x2="140" y2="360" stroke="#22c55e" stroke-width="2" stroke-dasharray="4"/>

              <rect x="40" y="360" width="200" height="35" rx="8" fill="#dcfce7" stroke="#22c55e" stroke-width="2"/>
              <text x="140" y="382" text-anchor="middle" font-size="11" fill="#166534">✓ Цель достигнута!</text>
            </svg>
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

    <!-- PLANNING SECTION -->
    <section id="planning" class="screen-section bg-planning">
      <div class="section-content">
        <div class="two-column reverse">
          <div class="column-visual">
            <div class="calendar-demo">
              <div class="calendar-header">
                <span>Неделя Максима</span>
              </div>
              <div class="calendar-grid">
                <div class="calendar-day" v-for="day in weekDays" :key="day.name">
                  <div class="day-name">{{ day.name }}</div>
                  <div class="day-tasks">
                    <div 
                      v-for="task in day.tasks" 
                      :key="task" 
                      class="day-task"
                      :class="{ highlight: task.includes('🏃') }"
                    >
                      {{ task }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="column-text">
            <div class="step-badge">Неделя 1</div>
            <h2 class="section-title">Планирование</h2>
            <p class="section-subtitle">AI распределяет шаги по дням с учётом твоей загрузки</p>
            
            <div class="example-card">
              <h3 class="example-title">План недели Максима</h3>
              
              <div class="planning-stats">
                <div class="stat-item">
                  <span class="stat-value">5</span>
                  <span class="stat-label">шагов запланировано</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">2.5ч</span>
                  <span class="stat-label">всего времени</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">30м</span>
                  <span class="stat-label">в среднем/день</span>
                </div>
              </div>

              <button class="ai-button">
                <span class="ai-icon">✨</span>
                AI распределил шаги по неделе
              </button>

              <div class="ai-comment orange">
                <strong>AI Планировщик:</strong> "Вижу, что вторник и четверг у тебя посвободнее. 
                Поставлю тренировки туда. Утром или вечером удобнее?"
              </div>
            </div>
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
        <p>"Месяц прошёл. Посмотрим, что изменилось?"</p>
      </div>

      <div class="arrow-connector">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#22c55e" stroke-width="2">
          <path d="M20 5 L20 30 M10 20 L20 30 L30 20" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </section>

    <!-- ACHIEVEMENTS SECTION -->
    <section id="achievements" class="screen-section bg-achievements">
      <div class="section-content">
        <div class="two-column reverse">
          <div class="column-visual">
            <div class="before-after">
              <div class="ba-column before">
                <h4>Было</h4>
                <div class="ba-item">Здоровье: <span class="bad">4/10</span></div>
                <div class="ba-item">Спорт: <span class="bad">2/10</span></div>
                <div class="ba-item">Финансы: <span class="bad">3/10</span></div>
                <div class="ba-item">Семья: <span class="medium">5/10</span></div>
              </div>
              <div class="ba-arrow">→</div>
              <div class="ba-column after">
                <h4>Стало</h4>
                <div class="ba-item">Здоровье: <span class="good">7/10</span></div>
                <div class="ba-item">Спорт: <span class="good">7/10</span></div>
                <div class="ba-item">Финансы: <span class="medium">5/10</span></div>
                <div class="ba-item">Семья: <span class="good">7/10</span></div>
              </div>
            </div>

            <div class="badges-grid">
              <div class="badge-item" v-for="badge in badges" :key="badge.name">
                <span class="badge-emoji">{{ badge.icon }}</span>
                <span class="badge-name">{{ badge.name }}</span>
              </div>
            </div>
          </div>

          <div class="column-text">
            <div class="step-badge success">3 месяца</div>
            <h2 class="section-title">Достижения</h2>
            <p class="section-subtitle">Результаты Максима за 3 месяца работы с системой</p>
            
            <div class="example-card success">
              <h3 class="example-title">Итоги пути</h3>
              
              <div class="achievements-stats">
                <div class="achievement-stat">
                  <span class="stat-number">47</span>
                  <span class="stat-text">выполненных шагов</span>
                </div>
                <div class="achievement-stat">
                  <span class="stat-number">14</span>
                  <span class="stat-text">завершённых целей</span>
                </div>
                <div class="achievement-stat">
                  <span class="stat-number">2,450</span>
                  <span class="stat-text">XP заработано</span>
                </div>
              </div>

              <div class="ai-comment success">
                <strong>AI Ментор:</strong> "Максим, ты прошёл путь от 'всё плохо' до реальных результатов. 
                Здоровье +3, семья +2. Это не магия — это система. 
                Теперь ты знаешь, как это работает. Продолжаем? 🚀"
              </div>
            </div>
          </div>
        </div>
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
  { id: 'achievements', title: 'Достижения' },
  { id: 'cta', title: 'Начать' }
]

const wheelScores = [
  { name: 'Здоровье', value: 4, level: 'low' },
  { name: 'Карьера', value: 8, level: 'high' },
  { name: 'Семья', value: 5, level: 'medium' },
  { name: 'Спорт', value: 2, level: 'low' },
  { name: 'Отношения', value: 6, level: 'medium' },
  { name: 'Финансы', value: 3, level: 'low' }
]

const decompositionSteps = [
  { title: 'Выбрать вид спорта', description: 'Протестировать 3 варианта', time: '30м' },
  { title: 'Купить форму', description: 'Кроссовки и одежда', time: '1ч' },
  { title: 'Первая тренировка', description: 'Пробный день в зале', time: '1ч' },
  { title: 'Составить расписание', description: 'Вт, Чт, Сб — утро', time: '15м' },
  { title: 'Привыкнуть к ритму', description: '3 недели без пропусков', time: '3нед' }
]

const weekDays = [
  { name: 'Пн', tasks: ['Работа', 'Звонок маме'] },
  { name: 'Вт', tasks: ['🏃 Тренировка', 'Работа'] },
  { name: 'Ср', tasks: ['Работа', 'Книга 30м'] },
  { name: 'Чт', tasks: ['🏃 Тренировка', 'Работа'] },
  { name: 'Пт', tasks: ['Работа', 'Отдых'] },
  { name: 'Сб', tasks: ['🏃 Тренировка', 'Семья'] },
  { name: 'Вс', tasks: ['Планирование', 'Отдых'] }
]

const habits = [
  { name: 'Утренняя зарядка', icon: '🏃', streak: 14, xp: 15 },
  { name: 'Пить воду', icon: '💧', streak: 21, xp: 10 },
  { name: 'Чтение 30 мин', icon: '📚', streak: 7, xp: 20 }
]

const badges = [
  { name: 'Первый шаг', icon: '🎯' },
  { name: '7 дней стрик', icon: '🔥' },
  { name: 'Спортсмен', icon: '💪' },
  { name: 'Планировщик', icon: '📅' }
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

/* Sidebar Navigation */
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

/* Screen Sections */
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

/* Gradient Backgrounds */
.bg-hero { background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%); }
.bg-mentor { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); }
.bg-wheel { background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%); }
.bg-goals { background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%); }
.bg-decomposition { background: linear-gradient(135deg, #fce7f3 0%, #fee2e2 100%); }
.bg-planning { background: linear-gradient(135deg, #fed7aa 0%, #fef3c7 100%); }
.bg-habits { background: linear-gradient(135deg, #d1fae5 0%, #ccfbf1 100%); }
.bg-achievements { background: linear-gradient(135deg, #bfdbfe 0%, #ddd6fe 100%); }
.bg-cta { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); }

/* Two Column Layout */
.two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.two-column.reverse .column-visual {
  order: -1;
}

/* Hero Section */
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

/* Persona Card */
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

/* Buttons */
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

/* Growth Chart */
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

/* Arrow Connectors */
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

/* Section Titles */
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

/* Example Cards */
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

/* Scores List */
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

/* AI Comments */
.ai-comment {
  background: #eef2ff;
  border-left: 4px solid #6366f1;
  padding: 15px;
  border-radius: 0 8px 8px 0;
  font-size: 0.95rem;
  margin-top: 20px;
}

.ai-comment.purple {
  background: #faf5ff;
  border-color: #a855f7;
}

.ai-comment.pink {
  background: #fdf2f8;
  border-color: #ec4899;
}

.ai-comment.orange {
  background: #fff7ed;
  border-color: #f97316;
}

.ai-comment.green {
  background: #ecfdf5;
  border-color: #22c55e;
}

.ai-comment.success {
  background: #f0fdf4;
  border-color: #22c55e;
}

/* Transition Text */
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

/* Wheel SVG */
.wheel-svg {
  width: 100%;
  max-width: 300px;
  height: auto;
}

/* Goals List */
.goals-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.goal-item {
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid;
}

.goal-item.red {
  background: #fef2f2;
  border-color: #ef4444;
}

.goal-item.pink {
  background: #fdf2f8;
  border-color: #ec4899;
}

.goal-item.blue {
  background: #eff6ff;
  border-color: #3b82f6;
}

.goal-sphere {
  font-weight: 700;
  font-size: 0.9rem;
}

.goal-item.red .goal-sphere { color: #dc2626; }
.goal-item.pink .goal-sphere { color: #db2777; }
.goal-item.blue .goal-sphere { color: #2563eb; }

.goal-text {
  margin: 5px 0 0;
  font-size: 0.95rem;
}

/* Steps List */
.steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  background: #fdf2f8;
  border-radius: 10px;
}

.step-number {
  width: 32px;
  height: 32px;
  background: #ec4899;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content strong {
  display: block;
  font-size: 0.95rem;
}

.step-content p {
  margin: 3px 0 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.step-time {
  font-size: 0.85rem;
  color: #9ca3af;
  font-weight: 500;
}

/* Calendar Demo */
.calendar-demo {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.calendar-header {
  font-weight: 700;
  margin-bottom: 15px;
  text-align: center;
  color: #6366f1;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-day {
  text-align: center;
}

.day-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
}

.day-tasks {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.day-task {
  font-size: 0.7rem;
  padding: 4px;
  background: #f3f4f6;
  border-radius: 4px;
}

.day-task.highlight {
  background: #dcfce7;
  color: #166534;
  font-weight: 600;
}

/* Planning Stats */
.planning-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  color: #6366f1;
}

.stat-label {
  font-size: 0.8rem;
  color: #6b7280;
}

/* AI Button */
.ai-button {
  width: 100%;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 15px;
}

.ai-icon {
  font-size: 1.2rem;
}

/* Habits List */
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

/* Streak Visual */
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

/* Before/After */
.before-after {
  display: flex;
  align-items: center;
  gap: 20px;
  background: white;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.ba-column {
  flex: 1;
}

.ba-column h4 {
  margin: 0 0 15px;
  font-weight: 700;
}

.ba-column.before h4 { color: #ef4444; }
.ba-column.after h4 { color: #22c55e; }

.ba-item {
  padding: 8px 0;
  font-size: 0.95rem;
}

.ba-item .bad { color: #ef4444; font-weight: 700; }
.ba-item .medium { color: #f59e0b; font-weight: 700; }
.ba-item .good { color: #22c55e; font-weight: 700; }

.ba-arrow {
  font-size: 2rem;
  color: #6366f1;
}

/* Badges Grid */
.badges-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.badge-item {
  background: white;
  padding: 15px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.badge-emoji {
  font-size: 1.5rem;
}

.badge-name {
  font-size: 0.9rem;
  font-weight: 600;
}

/* Achievements Stats */
.achievements-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.achievement-stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 800;
  color: #22c55e;
}

.stat-text {
  font-size: 0.85rem;
  color: #6b7280;
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

/* Goals SVG */
.goals-svg {
  width: 100%;
  max-width: 300px;
  height: auto;
}

/* Steps SVG */
.steps-svg {
  width: 100%;
  max-width: 280px;
  height: auto;
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

  .calendar-grid {
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  .day-task {
    font-size: 0.6rem;
    padding: 2px;
  }

  .before-after {
    flex-direction: column;
    gap: 15px;
  }

  .ba-arrow {
    transform: rotate(90deg);
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
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.75rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .planning-stats {
    flex-direction: column;
    gap: 15px;
  }

  .achievements-stats {
    flex-direction: column;
    gap: 15px;
  }

  .badges-grid {
    grid-template-columns: 1fr;
  }
}
</style>
