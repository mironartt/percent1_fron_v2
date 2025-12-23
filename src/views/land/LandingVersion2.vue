<template>
  <div class="landing-page">
    <header class="landing-header" :class="{ scrolled: isScrolled }">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <span class="logo-icon">1%</span>
            <div class="logo-text">
              <b class="logo-title">OnePercent</b>
              <span class="tagline">+1% каждый день</span>
            </div>
          </div>
          <nav class="header-nav">
            <template v-if="isAuthenticated">
              <router-link to="/app" class="btn btn-primary">Личный кабинет</router-link>
            </template>
            <template v-else>
              <router-link to="/auth/login" class="nav-link">Войти</router-link>
              <router-link to="/auth/register" class="btn btn-primary">Начать бесплатно</router-link>
            </template>
          </nav>
        </div>
      </div>
    </header>

    <main>
      <section class="hero">
        <div class="container">
          <div class="hero-grid">
            <div class="hero-content">
              <h1 class="hero-title">
                Системный рост в жизни<br>
                <span class="highlight">через простые действия</span>
              </h1>
              <p class="hero-description">
                Не курс. Не марафон. А система, которая делает развитие предсказуемым.
              </p>
              <div class="hero-actions">
                <a href="#journey-start" class="btn btn-primary btn-lg">
                  Сделать +1% уже сегодня
                </a>
              </div>
              <p class="hero-note">Начнём с оценки текущего состояния</p>
            </div>
            <div class="hero-image">
              <div class="compound-chart">
                <svg viewBox="0 0 400 300" class="chart-svg">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.3" />
                      <stop offset="100%" style="stop-color:#6366f1;stop-opacity:0" />
                    </linearGradient>
                  </defs>
                  <path d="M 30 270 Q 100 268, 150 260 T 250 220 T 320 120 T 370 30" 
                        fill="none" stroke="#6366f1" stroke-width="3" class="chart-line"/>
                  <path d="M 30 270 Q 100 268, 150 260 T 250 220 T 320 120 T 370 30 L 370 270 L 30 270 Z" 
                        fill="url(#chartGradient)" class="chart-area"/>
                  <line x1="30" y1="270" x2="370" y2="270" stroke="#e5e7eb" stroke-width="1"/>
                  <line x1="30" y1="30" x2="30" y2="270" stroke="#e5e7eb" stroke-width="1"/>
                  <text x="30" y="290" font-size="12" fill="#9ca3af">Сегодня</text>
                  <text x="340" y="290" font-size="12" fill="#9ca3af">1 год</text>
                  <text x="340" y="25" font-size="14" font-weight="600" fill="#6366f1">×37.8</text>
                </svg>
                <div class="chart-label">
                  <span class="chart-highlight">+1% каждый день</span>
                  <span class="chart-text">= экспоненциальный рост</span>
                </div>
              </div>
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

      <section id="journey-start" class="ai-mentor-section">
        <div class="container">
          <div class="mentor-header">
            <div class="mentor-avatar"><Bot :size="48" /></div>
            <h2 class="section-title">AI Mentor — твой проводник</h2>
            <p class="mentor-tagline">Он видит то, что сложно заметить в рутине, и помогает каждый день делать маленький шаг в плюс</p>
          </div>
          
          <div class="mentor-benefits">
            <div class="mentor-card">
              <div class="mentor-icon"><Target :size="24" /></div>
              <h3>Ясность вместо хаоса</h3>
              <p>Перестань гадать, что делать. Ментор анализирует твои сферы жизни и помогает поставить цели, которые действительно важны именно тебе.</p>
            </div>
            <div class="mentor-card">
              <div class="mentor-icon"><Calendar :size="24" /></div>
              <h3>Неделя спланирована за минуту</h3>
              <p>Не трать время на раскладывание задач. Ментор сам распределяет шаги по дням с учётом твоей загрузки и приоритетов.</p>
            </div>
            <div class="mentor-card">
              <div class="mentor-icon"><Eye :size="24" /></div>
              <h3>Видишь то, что упускаешь</h3>
              <p>В рутине легко не заметить перегрузку или дисбаланс. Ментор подсвечивает паттерны и предупреждает до того, как ты выгоришь.</p>
            </div>
            <div class="mentor-card">
              <div class="mentor-icon"><Lightbulb :size="24" /></div>
              <h3>Знаешь следующий шаг</h3>
              <p>Никакого ступора "а что теперь?". Получаешь персональные рекомендации на основе твоего реального прогресса.</p>
            </div>
          </div>

          <div class="mentor-chat-demo">
            <div class="chat-window">
              <div class="chat-header">
                <div class="chat-avatar"><Bot :size="24" /></div>
                <div class="chat-info">
                  <span class="chat-name">AI Mentor</span>
                  <span class="chat-status">Онлайн</span>
                </div>
              </div>
              <div class="chat-messages">
                <div class="message mentor">
                  <p>Привет, Максим! Вижу, что на этой неделе ты запланировал 12 шагов, но выполнил только 4. Похоже на перегрузку. Давай уберём 3 менее важных?</p>
                </div>
                <div class="message user">
                  <p>Да, ты прав. Какие убрать?</p>
                </div>
                <div class="message mentor">
                  <p>Рекомендую оставить шаги по сфере "Карьера" — они двигают тебя к цели быстрее. Остальное перенесём на следующую неделю.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="section-connector" :class="{ visible: connectorVisible[0] }" ref="connector0">
        <div class="connector-arrow">
          <ChevronDown :size="32" />
        </div>
        <p class="connector-text">Путь начинается с понимания, где ты сейчас</p>
      </div>

      <section class="journey-block ssp-block">
        <div class="container">
          <div class="journey-content-grid">
            <div class="journey-mockup">
              <div class="mockup-window">
                <div class="mockup-header-bar">
                  <div class="mockup-dots"><span></span><span></span><span></span></div>
                  <span class="mockup-title-bar">Колесо баланса</span>
                </div>
                <div class="mockup-body-content">
                  <div class="wheel-demo">
                    <svg viewBox="0 0 200 200" class="wheel-svg">
                      <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" stroke-width="2"/>
                      <circle cx="100" cy="100" r="70" fill="none" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4,4"/>
                      <circle cx="100" cy="100" r="50" fill="none" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4,4"/>
                      <circle cx="100" cy="100" r="30" fill="none" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4,4"/>
                      <path d="M100,10 L100,100 L100,10" stroke="#6366f1" stroke-width="2" fill="rgba(99,102,241,0.1)"/>
                      <polygon points="100,100 145,35 190,100 145,165 55,165 10,100 55,35" fill="none" stroke="none"/>
                      <path d="M100,100 L100,55 L145,35 L165,75 L100,100" fill="rgba(99,102,241,0.15)" stroke="#6366f1" stroke-width="2"/>
                      <path d="M100,100 L165,75 L185,120 L100,100" fill="rgba(139,92,246,0.15)" stroke="#8b5cf6" stroke-width="2"/>
                      <path d="M100,100 L185,120 L145,165 L100,100" fill="rgba(167,139,250,0.15)" stroke="#a78bfa" stroke-width="2"/>
                      <path d="M100,100 L145,165 L55,165 L100,100" fill="rgba(196,181,253,0.15)" stroke="#c4b5fd" stroke-width="2"/>
                      <path d="M100,100 L55,165 L15,120 L100,100" fill="rgba(221,214,254,0.15)" stroke="#ddd6fe" stroke-width="2"/>
                      <path d="M100,100 L15,120 L55,35 L100,100" fill="rgba(237,233,254,0.15)" stroke="#ede9fe" stroke-width="2"/>
                    </svg>
                  </div>
                  <div class="ssp-scores">
                    <div class="score-item low"><span>Здоровье</span><strong>4/10</strong></div>
                    <div class="score-item medium"><span>Карьера</span><strong>6/10</strong></div>
                    <div class="score-item low"><span>Финансы</span><strong>5/10</strong></div>
                    <div class="score-item high"><span>Отношения</span><strong>8/10</strong></div>
                  </div>
                  <div class="example-label">Оценки Максима</div>
                </div>
              </div>
            </div>
            <div class="journey-description">
              <h2 class="block-title">Колесо баланса — точка старта</h2>
              <p class="block-text">
                Оцени ключевые сферы жизни и увидь общую картину.<br>
                Не абстрактно — а честно.
              </p>
              <div class="ai-role">
                <Bot :size="16" />
                <span>AI задаёт уточняющие вопросы и помогает увидеть реальные зоны роста</span>
              </div>
              <a href="#goals-block" class="btn btn-primary">Сформировать цели</a>
            </div>
          </div>
        </div>
      </section>

      <div class="section-connector" :class="{ visible: connectorVisible[1] }" ref="connector1">
        <div class="connector-lines">
          <svg viewBox="0 0 100 60" class="flow-lines">
            <path d="M20,0 Q20,30 50,30 Q80,30 80,60" fill="none" stroke="#6366f1" stroke-width="2" stroke-dasharray="5,5"/>
            <path d="M50,0 L50,60" fill="none" stroke="#6366f1" stroke-width="2" stroke-dasharray="5,5"/>
            <path d="M80,0 Q80,30 50,30 Q20,30 20,60" fill="none" stroke="#6366f1" stroke-width="2" stroke-dasharray="5,5"/>
          </svg>
        </div>
        <p class="connector-text">Зоны роста → цели</p>
      </div>

      <section id="goals-block" class="journey-block goals-block">
        <div class="container">
          <h2 class="section-title">Цели, которые вытекают из реальности</h2>
          <p class="section-subtitle">Не случайные желания, а логичное продолжение твоей оценки жизни</p>

          <div class="maxim-goals">
            <h3 class="example-heading">Цели Максима после диагностики:</h3>
            <div class="goals-grid">
              <div class="goal-demo-card">
                <span class="goal-sphere-icon">💪</span>
                <div class="goal-info">
                  <h4>Пробежать 10 км</h4>
                  <p class="goal-sphere-label">Здоровье</p>
                </div>
                <div class="goal-progress-mini">
                  <div class="progress-track"><div class="progress-fill" style="width: 20%"></div></div>
                  <span>1/5 шагов</span>
                </div>
              </div>
              <div class="goal-demo-card">
                <span class="goal-sphere-icon">💰</span>
                <div class="goal-info">
                  <h4>Повысить доход на 20%</h4>
                  <p class="goal-sphere-label">Финансы</p>
                </div>
                <div class="goal-progress-mini">
                  <div class="progress-track"><div class="progress-fill" style="width: 0%"></div></div>
                  <span>0/4 шагов</span>
                </div>
              </div>
              <div class="goal-demo-card">
                <span class="goal-sphere-icon">📚</span>
                <div class="goal-info">
                  <h4>Пройти курс по навыку</h4>
                  <p class="goal-sphere-label">Карьера</p>
                </div>
                <div class="goal-progress-mini">
                  <div class="progress-track"><div class="progress-fill" style="width: 40%"></div></div>
                  <span>2/5 шагов</span>
                </div>
              </div>
            </div>
          </div>

          <div class="legends-mini">
            <p class="legends-intro">Эти люди не гнались за рывками. Они строили системы — через цели, привычки и рефлексию.</p>
            <h3 class="legends-heading">Системный подход работает веками</h3>
            <div class="legends-row">
              <div class="legend-mini-card">
                <div class="legend-mini-avatar"><Feather :size="20" /></div>
                <span>Франклин</span>
              </div>
              <div class="legend-mini-card">
                <div class="legend-mini-avatar"><BookMarked :size="20" /></div>
                <span>Клир</span>
              </div>
              <div class="legend-mini-card">
                <div class="legend-mini-avatar"><TrendingUp :size="20" /></div>
                <span>Баффетт</span>
              </div>
              <div class="legend-mini-card">
                <div class="legend-mini-avatar"><PenTool :size="20" /></div>
                <span>Да Винчи</span>
              </div>
            </div>
          </div>

          <div class="ai-role centered">
            <Bot :size="16" />
            <span>AI-стратег помогает сформулировать цели и проверить, действительно ли они твои</span>
          </div>

          <div class="block-cta">
            <a href="#decomposition-block" class="btn btn-primary">Разложить цели на шаги</a>
          </div>
        </div>
      </section>

      <div class="section-connector" :class="{ visible: connectorVisible[2] }" ref="connector2">
        <div class="connector-arrow">
          <ChevronDown :size="32" />
        </div>
        <p class="connector-text">Цели → конкретные шаги</p>
      </div>

      <section id="decomposition-block" class="journey-block decomposition-block">
        <div class="container">
          <div class="journey-content-grid reverse">
            <div class="journey-description">
              <h2 class="block-title">Большая цель — это просто набор шагов</h2>
              <p class="block-text">Каждый шаг понятен и выполним</p>
              <div class="ai-role">
                <Bot :size="16" />
                <span>AI-методолог помогает упростить и убрать лишнее</span>
              </div>
              <a href="#planning-block" class="btn btn-primary">Запланировать шаги</a>
            </div>
            <div class="journey-mockup">
              <div class="mockup-window">
                <div class="mockup-header-bar">
                  <div class="mockup-dots"><span></span><span></span><span></span></div>
                  <span class="mockup-title-bar">Декомпозиция: Пробежать 10 км</span>
                </div>
                <div class="mockup-body-content steps-demo">
                  <div class="step-item">
                    <div class="step-check done"><Check :size="14" /></div>
                    <span>Купить кроссовки для бега</span>
                  </div>
                  <div class="step-item">
                    <div class="step-check done"><Check :size="14" /></div>
                    <span>Составить план тренировок</span>
                  </div>
                  <div class="step-item active">
                    <div class="step-check"></div>
                    <span>Бегать 3 раза в неделю по 3 км</span>
                  </div>
                  <div class="step-item">
                    <div class="step-check"></div>
                    <span>Увеличить дистанцию до 5 км</span>
                  </div>
                  <div class="step-item">
                    <div class="step-check"></div>
                    <span>Пробежать 10 км на время</span>
                  </div>
                  <div class="example-label">Шаги Максима</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="section-connector" :class="{ visible: connectorVisible[3] }" ref="connector3">
        <div class="connector-flow">
          <svg viewBox="0 0 100 50" class="flow-svg">
            <path d="M10,25 Q30,10 50,25 Q70,40 90,25" fill="none" stroke="#6366f1" stroke-width="2" stroke-dasharray="5,5"/>
            <polygon points="90,25 82,20 82,30" fill="#6366f1"/>
          </svg>
        </div>
        <p class="connector-text">Шаги → календарь</p>
      </div>

      <section id="planning-block" class="journey-block planning-block">
        <div class="container">
          <h2 class="section-title">План, который подстраивается под твою жизнь</h2>
          
          <div class="planning-demo">
            <div class="week-calendar">
              <div class="week-header">
                <span v-for="day in ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']" :key="day" class="day-header">{{ day }}</span>
              </div>
              <div class="week-body">
                <div class="day-col">
                  <div class="task-chip high">Тренировка</div>
                </div>
                <div class="day-col">
                  <div class="task-chip medium">Курс: урок 3</div>
                </div>
                <div class="day-col">
                  <div class="task-chip high">Тренировка</div>
                  <div class="task-chip low">Чтение 30 мин</div>
                </div>
                <div class="day-col">
                  <div class="task-chip medium">Курс: урок 4</div>
                </div>
                <div class="day-col">
                  <div class="task-chip high">Тренировка</div>
                </div>
                <div class="day-col rest">
                  <span class="rest-label">Отдых</span>
                </div>
                <div class="day-col">
                  <div class="task-chip low">Рефлексия недели</div>
                </div>
              </div>
              <div class="example-label">Неделя Максима</div>
            </div>

            <button class="btn-ai-planning">
              <Sparkles :size="20" />
              <span>AI-планирование</span>
            </button>
          </div>

          <div class="ai-role centered">
            <Bot :size="16" />
            <span>AI учитывает твою загрузку и расставляет шаги без перегруза</span>
          </div>
        </div>
      </section>

      <div class="section-connector" :class="{ visible: connectorVisible[4] }" ref="connector4">
        <div class="connector-arrow pulse">
          <RefreshCw :size="24" />
        </div>
        <p class="connector-text">Повтор → привычка</p>
      </div>

      <section class="journey-block habits-block">
        <div class="container">
          <div class="journey-content-grid">
            <div class="journey-mockup">
              <div class="mockup-window">
                <div class="mockup-header-bar">
                  <div class="mockup-dots"><span></span><span></span><span></span></div>
                  <span class="mockup-title-bar">Привычки</span>
                </div>
                <div class="mockup-body-content habits-demo">
                  <div class="habit-demo-item">
                    <span class="habit-emoji">🏃</span>
                    <div class="habit-info-demo">
                      <span class="habit-name">Утренняя пробежка</span>
                      <span class="habit-schedule">Пн, Ср, Пт</span>
                    </div>
                    <div class="habit-streak">🔥 12</div>
                  </div>
                  <div class="habit-demo-item">
                    <span class="habit-emoji">📚</span>
                    <div class="habit-info-demo">
                      <span class="habit-name">Чтение 30 минут</span>
                      <span class="habit-schedule">Ежедневно</span>
                    </div>
                    <div class="habit-streak">🔥 8</div>
                  </div>
                  <div class="habit-demo-item">
                    <span class="habit-emoji">💧</span>
                    <div class="habit-info-demo">
                      <span class="habit-name">Вода 2 литра</span>
                      <span class="habit-schedule">Ежедневно</span>
                    </div>
                    <div class="habit-streak">🔥 21</div>
                  </div>
                  <div class="xp-demo">
                    <div class="xp-bar-demo"><div class="xp-fill" style="width: 65%"></div></div>
                    <span class="xp-label">+45 XP сегодня</span>
                  </div>
                  <div class="example-label">Привычки Максима</div>
                </div>
              </div>
            </div>
            <div class="journey-description">
              <h2 class="block-title">Рост происходит не через усилия, а через систему</h2>
              <p class="block-text">
                Привычки автоматизируют прогресс. Стрики и XP мотивируют продолжать.
              </p>
              <div class="ai-role">
                <Bot :size="16" />
                <span>AI-коуч рекомендует привычки, которые усиливают именно твои цели</span>
              </div>
              <a href="#achievements-block" class="btn btn-primary">Посмотреть прогресс</a>
            </div>
          </div>
        </div>
      </section>

      <div class="section-connector" :class="{ visible: connectorVisible[5] }" ref="connector5">
        <div class="connector-arrow">
          <TrendingUp :size="28" />
        </div>
        <p class="connector-text">Прогресс → результаты</p>
      </div>

      <section id="achievements-block" class="journey-block achievements-block">
        <div class="container">
          <h2 class="section-title">Ты видишь свой путь</h2>
          <p class="section-subtitle">Мозгу нужна поддержка. Каждый шаг отмечается и награждается.</p>

          <div class="achievements-demo">
            <div class="before-after">
              <div class="state-card before">
                <h4>БЫЛО</h4>
                <div class="state-metric"><span>Здоровье</span><div class="metric-bar"><div class="metric-fill" style="width: 40%"></div></div><strong>4/10</strong></div>
                <div class="state-metric"><span>Спорт</span><div class="metric-bar"><div class="metric-fill" style="width: 20%"></div></div><strong>2/10</strong></div>
              </div>
              <div class="state-arrow"><ArrowRight :size="24" /></div>
              <div class="state-card after">
                <h4>СТАЛО</h4>
                <div class="state-metric"><span>Здоровье</span><div class="metric-bar success"><div class="metric-fill" style="width: 80%"></div></div><strong>8/10</strong></div>
                <div class="state-metric"><span>Спорт</span><div class="metric-bar success"><div class="metric-fill" style="width: 90%"></div></div><strong>9/10</strong></div>
              </div>
            </div>

            <div class="badges-demo-list">
              <h4>Достижения Максима через 3 месяца:</h4>
              <div class="badge-row">
                <div class="badge-demo"><span>🏅</span><div><strong>Новичок в спорте</strong><p>Посещена 1-я тренировка</p></div></div>
                <div class="badge-demo"><span>🔥</span><div><strong>Горячая полоса</strong><p>14 дней подряд в спорте</p></div></div>
                <div class="badge-demo"><span>⭐</span><div><strong>Чемпион</strong><p>3 месяца спорта 3x в неделю</p></div></div>
                <div class="badge-demo"><span>📈</span><div><strong>Рост в 2 раза</strong><p>Баланс в здоровье с 4 до 8</p></div></div>
              </div>
            </div>

            <div class="mentor-comment">
              <Bot :size="20" />
              <p>"Максим, ты в пути! За 3 месяца ты стал сильнее на 100% в здоровье. Продолжим?"</p>
            </div>
          </div>

          <div class="ai-role centered">
            <Bot :size="16" />
            <span>AI-ментор помогает зафиксировать результат и двигаться дальше</span>
          </div>

          <div class="block-cta">
            <a href="#final-cta" class="btn btn-primary">Пройти следующий цикл</a>
          </div>
        </div>
      </section>

      <section id="final-cta" class="final-cta-section">
        <div class="container">
          <div class="final-cta-content">
            <h2>Начни с малого. Система сделает остальное.</h2>
            <router-link to="/auth/register" class="btn btn-primary btn-lg">
              Сделать +1% сегодня
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
          </div>
          <div class="footer-links">
            <router-link to="/auth/login">Войти</router-link>
            <router-link to="/auth/register">Регистрация</router-link>
          </div>
        </div>
        <div class="footer-legal">
          <div class="legal-links">
            <a href="https://percent1.ru/privacy" target="_blank" rel="noopener noreferrer">Политика конфиденциальности</a>
            <a href="https://percent1.ru/termspolicy" target="_blank" rel="noopener noreferrer">Пользовательское соглашение</a>
            <a href="https://percent1.ru/disclaimer" target="_blank" rel="noopener noreferrer">Отказ от ответственности</a>
          </div>
        </div>
        <div class="footer-bottom">
          <div class="company-info">
            <p>ИП Косик Дмитрий Владимирович</p>
            <p>ИНН: 711280092908 | ОГРНИП: 321774600674346</p>
          </div>
          <p>&copy; 2025 OnePercent. Все права защищены.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { checkAuth } from '@/services/api'
import { 
  Target, 
  Calendar, 
  Lightbulb,
  RefreshCw,
  Bot,
  TrendingUp,
  Eye,
  PenTool,
  Feather,
  BookMarked,
  ChevronDown,
  Check,
  Sparkles,
  ArrowRight
} from 'lucide-vue-next'

const appStore = useAppStore()
const isAuthenticated = computed(() => appStore.isAuthenticated)

const days = ref(90)
const isScrolled = ref(false)
const connectorVisible = ref([false, false, false, false, false, false])

const connector0 = ref(null)
const connector1 = ref(null)
const connector2 = ref(null)
const connector3 = ref(null)
const connector4 = ref(null)
const connector5 = ref(null)

const multiplier = computed(() => {
  return Math.pow(1.01, days.value).toFixed(2)
})

function handleScroll() {
  isScrolled.value = window.scrollY > 50
}

let observer = null

onMounted(async () => {
  window.addEventListener('scroll', handleScroll)
  
  const connectors = [connector0, connector1, connector2, connector3, connector4, connector5]
  
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const index = connectors.findIndex(c => c.value === entry.target)
      if (index !== -1 && entry.isIntersecting) {
        connectorVisible.value[index] = true
      }
    })
  }, { threshold: 0.3 })
  
  connectors.forEach(c => {
    if (c.value) observer.observe(c.value)
  })
  
  if (!appStore.isAuthenticated) {
    try {
      const userData = await checkAuth()
      if (userData) {
        appStore.setUser(userData)
      }
    } catch (e) {}
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (observer) observer.disconnect()
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

.logo-title {
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
  gap: 0.5rem;
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.hero {
  position: relative;
  padding: 10rem 0 6rem;
  overflow: hidden;
  min-height: 75vh;
  display: flex;
  align-items: center;
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

.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-content {
  max-width: 600px;
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
  margin-bottom: 0.75rem;
}

.hero-note {
  font-size: 0.875rem;
  color: #9ca3af;
}

.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.compound-chart {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(99, 102, 241, 0.15);
  width: 100%;
  max-width: 450px;
}

.chart-svg {
  width: 100%;
  height: auto;
}

.chart-line {
  stroke-dasharray: 500;
  stroke-dashoffset: 500;
  animation: drawLine 2s ease-out forwards;
}

.chart-area {
  opacity: 0;
  animation: fadeIn 1s ease-out 1.5s forwards;
}

@keyframes drawLine {
  to { stroke-dashoffset: 0; }
}

@keyframes fadeIn {
  to { opacity: 1; }
}

.chart-label {
  text-align: center;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.chart-highlight {
  font-size: 1.25rem;
  font-weight: 700;
  color: #6366f1;
}

.chart-text {
  font-size: 0.9375rem;
  color: #6b7280;
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

.ai-mentor-section {
  padding: 5rem 0;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.mentor-header {
  text-align: center;
  margin-bottom: 3rem;
}

.mentor-avatar {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.ai-mentor-section .section-title {
  color: white;
  margin-bottom: 1rem;
}

.mentor-tagline {
  font-size: 1.25rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.mentor-benefits {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.mentor-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.mentor-icon {
  margin-bottom: 0.75rem;
  display: flex;
}

.mentor-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.mentor-card p {
  font-size: 0.9375rem;
  opacity: 0.85;
  line-height: 1.6;
}

.mentor-chat-demo {
  max-width: 500px;
  margin: 0 auto;
}

.chat-window {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.chat-avatar {
  color: #6366f1;
  display: flex;
}

.chat-info {
  display: flex;
  flex-direction: column;
}

.chat-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a2e;
}

.chat-status {
  font-size: 0.75rem;
  color: #22c55e;
}

.chat-messages {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.message {
  max-width: 85%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  line-height: 1.5;
}

.message.mentor {
  background: #eef2ff;
  color: #1a1a2e;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}

.message.user {
  background: #6366f1;
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}

.message p {
  margin: 0;
}

.section-connector {
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.section-connector.visible {
  opacity: 1;
  transform: translateY(0);
}

.connector-arrow {
  color: #6366f1;
  animation: bounce 2s infinite;
}

.connector-arrow.pulse {
  animation: pulse 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.connector-lines {
  width: 100px;
  height: 60px;
}

.flow-lines {
  width: 100%;
  height: 100%;
}

.connector-flow {
  width: 100px;
  height: 50px;
}

.flow-svg {
  width: 100%;
  height: 100%;
}

.connector-text {
  font-size: 0.9375rem;
  color: #6b7280;
  font-weight: 500;
}

.journey-block {
  padding: 5rem 0;
}

.journey-block:nth-child(odd) {
  background: white;
}

.journey-block:nth-child(even) {
  background: #fafafa;
}

.ssp-block { background: #fafafa; }
.goals-block { background: white; }
.decomposition-block { background: #fafafa; }
.planning-block { background: white; }
.habits-block { background: #fafafa; }
.achievements-block { background: white; }

.journey-content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.journey-content-grid.reverse {
  direction: rtl;
}

.journey-content-grid.reverse > * {
  direction: ltr;
}

.journey-mockup {
  display: flex;
  justify-content: center;
}

.mockup-window {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 400px;
}

.mockup-header-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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
}

.mockup-dots span:first-child { background: #ef4444; }
.mockup-dots span:nth-child(2) { background: #f59e0b; }
.mockup-dots span:last-child { background: #22c55e; }

.mockup-title-bar {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #6b7280;
}

.mockup-body-content {
  padding: 1.5rem;
  position: relative;
}

.example-label {
  position: absolute;
  bottom: 0.5rem;
  right: 0.75rem;
  font-size: 0.6875rem;
  color: #9ca3af;
  font-style: italic;
}

.wheel-demo {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.wheel-svg {
  width: 160px;
  height: 160px;
}

.ssp-scores {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.score-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8125rem;
}

.score-item.low { background: rgba(239, 68, 68, 0.1); }
.score-item.medium { background: rgba(245, 158, 11, 0.1); }
.score-item.high { background: rgba(34, 197, 94, 0.1); }

.score-item span { color: #6b7280; }
.score-item strong { color: #1a1a2e; }

.journey-description {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.block-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.3;
}

.block-text {
  font-size: 1.125rem;
  color: #6b7280;
  line-height: 1.6;
}

.ai-role {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(99, 102, 241, 0.08);
  border-radius: 10px;
  font-size: 0.875rem;
  color: #6366f1;
}

.ai-role.centered {
  justify-content: center;
  max-width: 600px;
  margin: 2rem auto 0;
}

.ai-role svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.maxim-goals {
  margin-bottom: 3rem;
}

.example-heading {
  font-size: 1rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 1rem;
  text-align: center;
}

.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  max-width: 900px;
  margin: 0 auto;
}

.goal-demo-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.goal-sphere-icon {
  font-size: 1.5rem;
}

.goal-info {
  flex: 1;
}

.goal-info h4 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 0.25rem;
}

.goal-sphere-label {
  font-size: 0.75rem;
  color: #9ca3af;
}

.goal-progress-mini {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.progress-track {
  width: 60px;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 3px;
}

.goal-progress-mini span {
  font-size: 0.6875rem;
  color: #9ca3af;
}

.legends-mini {
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.legends-intro {
  text-align: center;
  color: #6b7280;
  font-size: 0.9375rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.legends-heading {
  text-align: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 1.5rem;
}

.legends-row {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.legend-mini-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.legend-mini-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.legend-mini-card span {
  font-size: 0.8125rem;
  color: #6b7280;
  font-weight: 500;
}

.block-cta {
  text-align: center;
  margin-top: 2rem;
}

.steps-demo {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #4b5563;
}

.step-item.active {
  background: #eef2ff;
  border: 1px solid #6366f1;
  color: #1a1a2e;
  font-weight: 500;
}

.step-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-check.done {
  background: #22c55e;
  border-color: #22c55e;
  color: white;
}

.step-item.active .step-check {
  border-color: #6366f1;
}

.planning-demo {
  max-width: 800px;
  margin: 0 auto;
}

.week-calendar {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 1.5rem;
  position: relative;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.day-header {
  text-align: center;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #6b7280;
  padding: 0.5rem;
}

.week-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  min-height: 100px;
}

.day-col {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 8px;
  min-height: 80px;
}

.day-col.rest {
  background: #f3f4f6;
  justify-content: center;
  align-items: center;
}

.rest-label {
  font-size: 0.75rem;
  color: #9ca3af;
}

.task-chip {
  padding: 0.375rem 0.5rem;
  border-radius: 6px;
  font-size: 0.6875rem;
  font-weight: 500;
  text-align: center;
}

.task-chip.high {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.task-chip.medium {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.task-chip.low {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.btn-ai-planning {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
  transition: all 0.2s;
}

.btn-ai-planning:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4);
}

.habits-demo {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.habit-demo-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 10px;
}

.habit-emoji {
  font-size: 1.25rem;
}

.habit-info-demo {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.habit-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1a1a2e;
}

.habit-schedule {
  font-size: 0.75rem;
  color: #9ca3af;
}

.habit-streak {
  font-size: 0.875rem;
  font-weight: 600;
  color: #f59e0b;
}

.xp-demo {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.xp-bar-demo {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.xp-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 4px;
}

.xp-label {
  display: block;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6366f1;
}

.achievements-demo {
  max-width: 900px;
  margin: 0 auto;
}

.before-after {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.state-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  min-width: 200px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
}

.state-card.before {
  border: 2px solid #fecaca;
}

.state-card.after {
  border: 2px solid #bbf7d0;
}

.state-card h4 {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
  text-align: center;
}

.state-card.before h4 { color: #dc2626; }
.state-card.after h4 { color: #16a34a; }

.state-metric {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.8125rem;
}

.state-metric span {
  width: 70px;
  color: #6b7280;
}

.metric-bar {
  flex: 1;
  height: 8px;
  background: #fee2e2;
  border-radius: 4px;
  overflow: hidden;
}

.metric-bar.success {
  background: #dcfce7;
}

.metric-bar .metric-fill {
  height: 100%;
  background: #ef4444;
  border-radius: 4px;
}

.metric-bar.success .metric-fill {
  background: #22c55e;
}

.state-metric strong {
  width: 40px;
  text-align: right;
  color: #1a1a2e;
}

.state-arrow {
  color: #6366f1;
}

.badges-demo-list {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.badges-demo-list h4 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 1rem;
}

.badge-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.badge-demo {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 10px;
}

.badge-demo span:first-child {
  font-size: 1.5rem;
}

.badge-demo strong {
  display: block;
  font-size: 0.875rem;
  color: #1a1a2e;
  margin-bottom: 0.125rem;
}

.badge-demo p {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
}

.mentor-comment {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08));
  border-radius: 12px;
  border-left: 3px solid #6366f1;
}

.mentor-comment svg {
  color: #6366f1;
  flex-shrink: 0;
  margin-top: 2px;
}

.mentor-comment p {
  margin: 0;
  font-size: 0.9375rem;
  color: #4b5563;
  font-style: italic;
}

.final-cta-section {
  padding: 5rem 0;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.final-cta-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.final-cta-section h2 {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  margin-bottom: 2rem;
}

.final-cta-section .btn-primary {
  background: white;
  color: #6366f1;
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

.footer-brand .logo span:not(.logo-icon) {
  color: white;
  font-weight: 600;
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

.footer-legal {
  padding-top: 1rem;
  text-align: center;
}

.legal-links {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
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
  margin: 0.25rem 0;
}

.footer-bottom {
  text-align: center;
  padding-top: 1.5rem;
}

.footer-bottom p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
}

@media (max-width: 900px) {
  .journey-content-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .journey-content-grid.reverse {
    direction: ltr;
  }
  
  .journey-mockup {
    order: -1;
  }
  
  .journey-description {
    text-align: center;
    align-items: center;
  }
  
  .ai-role {
    justify-content: center;
  }
  
  .before-after {
    flex-direction: column;
    gap: 1rem;
  }
  
  .state-arrow {
    transform: rotate(90deg);
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 7rem 0 4rem;
    min-height: auto;
  }
  
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .hero-image {
    order: -1;
  }
  
  .compound-chart {
    max-width: 320px;
    padding: 1.5rem;
  }
  
  .hero-bg {
    display: none;
  }
  
  .mentor-benefits {
    grid-template-columns: 1fr;
  }
  
  .week-header,
  .week-body {
    grid-template-columns: repeat(7, 1fr);
    gap: 0.25rem;
  }
  
  .day-header {
    font-size: 0.6875rem;
    padding: 0.25rem;
  }
  
  .task-chip {
    font-size: 0.5625rem;
    padding: 0.25rem;
  }
  
  .goals-grid {
    grid-template-columns: 1fr;
  }
  
  .badge-row {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
  
  .header-nav .nav-link {
    display: none;
  }
}

@media (max-width: 480px) {
  .journey-block {
    padding: 3rem 0;
  }
  
  .block-title {
    font-size: 1.375rem;
  }
  
  .legends-row {
    gap: 1rem;
  }
  
  .legend-mini-avatar {
    width: 40px;
    height: 40px;
  }
  
  .mockup-window {
    max-width: 100%;
  }
  
  .week-calendar {
    padding: 1rem;
  }
  
  .btn-ai-planning {
    font-size: 1rem;
    padding: 0.875rem 1.5rem;
  }
}
</style>
