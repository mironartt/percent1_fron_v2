<template>
  <div class="landing-v4">
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

    <section class="hero">
      <div class="container">
        <div class="hero-grid">
          <div class="hero-content">
            <h1 class="hero-title">
              Системный рост в жизни<br>
              <span class="highlight">через простые действия</span>
            </h1>
            <p class="hero-description">
              Система, которая делает развитие предсказуемым. Твой личный AI наставник
            </p>
            <div class="hero-actions">
              <router-link to="/auth/register" class="btn btn-primary btn-lg">
                Сделать +1% уже сегодня
              </router-link>
            </div>
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

    <!-- Блок "Эффект 1%" -->
    <section class="block effect-section">
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

    <section id="block1" class="block block-wheel">
      <div class="container">
        <div class="block-content">
          <div class="block-text">
            <div class="step-badge">Шаг 1 из 5: Диагностика</div>
            <h2>Почему ты топчешься на месте, хотя стараешься?</h2>
            <h2 class="wheel-answer">Потому что жизнь — это система. Одна сломанная часть ломает всё</h2>

            <div class="explanation-box">
              <p><strong>Проблема:</strong> Нет энергии из-за здоровья — страдает карьера и семья. Финансовый стресс убивает сон и мотивацию. Одна слабая сфера обрушивает остальные, как костяшки домино.</p>
              <p><strong>Решение:</strong> Сделай диагностику через Колесо баланса за 2 минуты и увидишь свою зону роста. На следующем шаге AI превратит его в конкретный план действий.</p>
            </div>

            <div class="ai-mentor-quote">
              <div class="ai-avatar">🤖</div>
              <div class="ai-mentor-message">
                <span class="ai-mentor-name">AI ментор</span>
                <p>"Пройди диагностику — я найду твою точку роста и составлю план первых шагов. Это займёт 2 минуты."</p>
              </div>
            </div>

          </div>

          <div class="block-visual">
            <div class="wheel-balance-chart wheel-component">
              <WheelOfLife :spheres="wheelSpheres" :readonly="true" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="block2" class="block block-goals">
      <div class="container">
        <div class="block2-header-compact">
          <div class="header-row">
            <span class="transition-check">✓ Диагностика пройдена</span>
            <span class="step-badge-inline">Шаг 2 из 5: Твои цели</span>
          </div>
          <h2>Твои зоны роста → конкретные цели</h2>
          <p class="block-subtitle">AI ментор взял результаты диагностики и превратил их в 3 цели на ближайший месяц</p>
          
        </div>

        <div class="goals-grid">
          <div class="goals-grid-header">
            <span class="goals-grid-title">Твои цели на месяц</span>
            <button class="how-ai-works-link" @click="showHowAiWorksModal = true">
              Как AI выбрал цели?
            </button>
          </div>
          <div class="goals-cards-row">
            <div class="goal-card-v2 goal-hobby">
              <div class="goal-card-number">1</div>
              <div class="goal-card-content">
                <div class="goal-icon">🎨</div>
                <div class="goal-info">
                  <div class="goal-title">Хобби 2 часа в неделю</div>
                  <div class="goal-meta">Зона роста: Хобби 2/10</div>
                </div>
              </div>
            </div>
            <div class="goal-card-v2 goal-money">
              <div class="goal-card-number">2</div>
              <div class="goal-card-content">
                <div class="goal-icon">💰</div>
                <div class="goal-info">
                  <div class="goal-title">+30% к доходу</div>
                  <div class="goal-meta">Требует внимания: Благосостояние 4/10</div>
                </div>
              </div>
            </div>
            <div class="goal-card-v2 goal-family">
              <div class="goal-card-number">3</div>
              <div class="goal-card-content">
                <div class="goal-icon">❤️</div>
                <div class="goal-info">
                  <div class="goal-title">Вечер с семьёй 3х в неделю</div>
                  <div class="goal-meta">Сильная сторона: Любовь 8/10</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="ai-quote-centered">
          <div class="ai-avatar">🤖</div>
          <div class="ai-message">
            <div class="ai-name">AI ментор</div>
            <p>"Начнём с хобби — это твоя точка входа в энергию. Когда появится ресурс, подтянем финансы и укрепим семью."</p>
          </div>
        </div>
      </div>
    </section>

    <section id="block3" class="block block-decomposition">
      <div class="container">
        <div class="block3-header-compact">
          <div class="header-row">
            <span class="transition-check">✓ Цели есть</span>
            <span class="step-badge-inline">Шаг 3 из 5: Декомпозиция</span>
          </div>
          <h2>От цели до первого шага — за 30 секунд</h2>
          <p class="block-subtitle">AI разбивает твою цель на реальные задачи с точным временем. Просто начни делать.</p>
        </div>

        <div class="decomp-transformation">
          <div class="decomp-before">
            <div class="decomp-label">Твоя цель</div>
            <div class="decomp-goal-card">
              <span class="decomp-icon">🎨</span>
              <span class="decomp-goal-text">Хобби 2 часа в неделю</span>
            </div>
          </div>
          
          <div class="decomp-arrow">
            <div class="decomp-ai-badge">🤖 AI</div>
            <svg class="arrow-icon" width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          
          <div class="decomp-after">
            <div class="decomp-label">Шаги на неделю</div>
            <div class="decomp-steps-mini">
              <div class="decomp-step-mini">День 1: Выбрать что нравится — рисование, музыка, спорт? <span>10 мин</span></div>
              <div class="decomp-step-mini">День 3: Попробовать первый раз — без перфекционизма <span>30 мин</span></div>
              <div class="decomp-step-mini">День 5: Повторить — закрепить привычку <span>30 мин</span></div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <section id="block4" class="block block-planning">
      <div class="container">
        <div class="block4-header-compact">
          <div class="header-row">
            <span class="transition-check">✓ Шаги готовы</span>
            <span class="step-badge-inline">Шаг 4 из 5: Расписание</span>
          </div>
          <h2>От плана к делу — без раздумий «что делать сегодня»</h2>
          <p class="block-subtitle">AI распределил задачи по дням недели. Открой календарь и начни.</p>
        </div>

        <div class="block-content reverse">
          <div class="block-visual">
            <div class="calendar-week">
              <div class="calendar-header">
                <span>22 дек. — 28 дек.</span>
              </div>
              <div class="calendar-days">
                <div class="calendar-day" v-for="(day, index) in calendarDays" :key="index" :class="{ active: day.active }">
                  <div class="day-name">{{ day.name }}</div>
                  <div class="day-number">{{ day.number }}</div>
                  <div class="day-task" v-if="day.task">{{ day.task }}</div>
                </div>
              </div>
            </div>
            
          </div>

          <div class="block-text">
            <div class="personalization-note">
              <div class="note-icon">💡</div>
              <div class="note-text">
                <strong>AI учёл твою загрузку:</strong>
                <p>Вторник и четверг у тебя свободнее — AI поставил основные задачи туда. Можно перетащить на другой день если планы изменились.</p>
              </div>
            </div>

            <a href="#block5" class="btn btn-primary" @click.prevent="scrollTo('#block5')">Начать неделю →</a>
            <div class="btn-meta">Бесплатно • Следующий шаг: привычки</div>
          </div>
        </div>
      </div>
    </section>

    <section id="block5" class="block block-habits">
      <div class="container">
        <div class="block5-header-compact">
          <div class="header-row">
            <span class="transition-check">✓ Неделя пройдена</span>
            <span class="step-badge-inline">Шаг 5 из 5: Привычки</span>
          </div>
          <h2>От хаотичных попыток к системе привычек</h2>
          <p class="block-subtitle">AI подберёт привычки под твои цели, напомнит о выполнении и покажет реальный прогресс.</p>
        </div>

        <div class="block5-layout">
          <div class="block5-text">
            <div class="ai-mentor-info">
              <div class="ai-mentor-icon">🤖</div>
              <div class="ai-mentor-content">
                <strong>AI Ментор подберёт привычки</strong>
                <p>Проанализирует твои цели, паттерны поведения и рефлексию. На основе этого предложит привычки для достижения результатов.</p>
              </div>
            </div>

          </div>

          <div class="habits-demo">
            <div class="habit-card" v-for="habit in habitsDemo" :key="habit.name">
              <div class="habit-check">
                <input type="checkbox" :checked="habit.todayDone" disabled />
              </div>
              <div class="habit-icon-demo">{{ habit.icon }}</div>
              <div class="habit-name-demo">{{ habit.name }}</div>
              <div class="habit-weekdays">
                <span v-for="(day, idx) in habit.days" :key="idx" class="weekday" :class="{ done: day.done, today: day.today }">{{ day.label }}</span>
              </div>
              <div class="habit-xp-badge">+{{ habit.xp }} XP</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="block6" class="block block-rewards">
      <div class="container">
        <div class="transition-text">
          <p>Прошло 3 месяца. 2450 XP заработано. Время наградить себя за прогресс.</p>
        </div>
        <div class="block-content reverse">
          <div class="block-visual">
            <div class="xp-balance">
              <div class="balance-label">Твой баланс</div>
              <div class="balance-value">2450 XP</div>
            </div>
            <div class="rewards-list">
              <div class="reward-item" v-for="reward in rewards" :key="reward.title" :class="reward.status">
                <div class="reward-icon">{{ reward.icon }}</div>
                <div class="reward-content">
                  <div class="reward-title">{{ reward.title }}</div>
                  <div class="reward-cost">{{ reward.cost }} XP</div>
                </div>
                <div class="reward-status" v-if="reward.status !== 'locked'">{{ reward.statusText }}</div>
                <div class="reward-progress" v-else>
                  <div class="reward-progress-bar">
                    <div class="reward-progress-fill" :style="{ width: reward.progress + '%' }"></div>
                  </div>
                  <div class="reward-progress-text">{{ reward.progressText }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="block-text">
            <h2>Заработал 2450 XP — пора порадовать себя</h2>
            <p class="block-subtitle">XP = валюта для твоих желаний. Ты сам выбираешь награды и цену в XP.</p>

            <div class="rewards-explanation">
              <h4>Как работает система наград:</h4>
              <p>В начале месяца составь список желаний → Назначь цену в XP (1 XP ≈ 10₽) → Выполняй привычки, копи XP → Достиг цели — порадуй себя без вины</p>
            </div>

            <div class="ai-quote">
              <div class="ai-avatar">🤖</div>
              <div class="ai-message">
                <div class="ai-name">AI Ментор</div>
                <p>"Максим, у тебя 2450 XP — хватает на новую игру! Эти награды не противоречат цели 'Спорт'. Более того, отдых важен для восстановления. Рекомендую взять игру сейчас, а на поездку копить ещё 2 месяца."</p>
              </div>
            </div>

            <div class="testimonial">
              <p>"Система наград — единственное, что работает для меня. Раньше я покупал вещи импульсивно и потом жалел. Теперь каждая покупка — заслуженная."</p>
              <div class="testimonial-author">— Артём, основатель диджитал агентства</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="block7" class="block block-mentor">
      <div class="container">
        <div class="transition-text">
          <p>Главная проблема: 68% бросают после 3 месяцев. Решение: AI Ментор в Telegram поддерживает каждый день.</p>
        </div>
        <div class="block-content">
          <div class="block-text">
            <h2>Персональный коуч на связи 24/7</h2>
            <p class="block-subtitle">AI анализирует твои цели, рефлексии и паттерны. Задаёт правильные вопросы, чтобы ты сам нашёл ответы.</p>

            <div class="role-transformation">
              <h4>💡 Ролевая трансформация AI:</h4>
              <ul>
                <li><strong>Первая неделя:</strong> Интервьюер (собирает данные)</li>
                <li><strong>Первый месяц:</strong> Стратег (помогает с целями)</li>
                <li><strong>2+ месяц:</strong> Коуч* (поддержка и помощь в развитии)</li>
              </ul>
              <div class="disclaimer">*AI-ассистент не является заменой профессионального психолога, коуча или врача. При серьёзных проблемах обращайтесь к специалистам.</div>
            </div>
          </div>

          <div class="block-visual">
            <div class="phone-mockup">
              <div class="phone-frame">
                <div class="phone-screen phone-screen-tall">
                  <div class="telegram-chat">
                    <div class="tg-header">
                      <div class="tg-avatar">🤖</div>
                      <div class="tg-info">
                        <div class="tg-name">AI Ментор 1%</div>
                        <div class="tg-status">online</div>
                      </div>
                    </div>
                    <div class="tg-messages">
                      <div class="tg-message ai">
                        <div class="tg-bubble tg-bubble-morning">
                          Доброе утро, Максим!<br>
                          Сегодня — вторник.<br><br>
                          <strong>Задачи на сегодня:</strong><br>
                          🎨 Первая проба хобби [→ Хобби 2ч в неделю]<br>
                          ❤️ Вечер с семьёй [→ Вечер с семьёй 3х в неделю]<br><br>
                          <strong>Привычки:</strong><br>
                          🔹 Хобби 2ч/неделю<br>
                          🔹 Финансовый обзор<br>
                          🔹 Ужин с семьёй<br><br>
                          Обрати внимание: у тебя есть просроченная задача «Выбрать хобби на неделю» — возможно, стоит начать с неё.
                        </div>
                        <div class="tg-time">08:00</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="testimonial testimonial-centered">
          <p>"AI в Telegram — причина, почему не бросил после 2 месяцев. 'Ты на серии 45 дней, неужели обнулишь?' — работает лучше любого таймера."</p>
          <div class="testimonial-author">— Сергей, e-commerce</div>
        </div>
      </div>
    </section>

    <section class="final-cta">
      <div class="container">
        <div class="cta-content">
          <h2>Ты прошёл путь от диагностики до результата</h2>
          <div class="cta-checklist">
            <div class="check-item">✓ Увидел свои проблемные зоны</div>
            <div class="check-item">✓ Получил персональные цели от AI</div>
            <div class="check-item">✓ План на месяц разбит по дням</div>
            <div class="check-item">✓ Система привычек с геймификацией</div>
            <div class="check-item">✓ Награды за прогресс</div>
            <div class="check-item">✓ AI поддержка 24/7 в Telegram</div>
          </div>
          <div class="cta-action">
            <a href="https://t.me/onepercent_bot" target="_blank" class="btn btn-primary btn-large">Начать бесплатно — диагностика за 2 минуты →</a>
            <div class="cta-meta">
              <span>✓ Без банковской карты</span>
              <span>✓ Отменить можно в 1 клик</span>
            </div>
          </div>
          <div class="social-proof">
            🔥 <strong>{{ socialProofCount.toLocaleString() }}</strong> человек уже растут на 1% каждый день
          </div>
        </div>
      </div>
    </section>

    <section class="legends-section">
      <div class="container">
        <h2 class="section-title">Проверено временем</h2>
        <p class="section-subtitle">
          Величайшие умы истории использовали системный подход к развитию задолго до нас
        </p>
        
        <div class="legends-grid">
          <div class="legend-card">
            <div class="legend-avatar">
              <Feather :size="32" />
            </div>
            <div class="legend-content">
              <h3>Бенджамин Франклин</h3>
              <span class="legend-role">Политик, учёный, изобретатель</span>
              <blockquote class="legend-quote">
                <Quote :size="16" class="quote-icon" />
                «Маленькие удары валят большие дубы»
              </blockquote>
              <p class="legend-method">
                Создал систему 13 добродетелей: каждую неделю фокусировался на одном качестве, вёл дневник самоанализа.
              </p>
            </div>
          </div>
          
          <div class="legend-card">
            <div class="legend-avatar">
              <BookMarked :size="32" />
            </div>
            <div class="legend-content">
              <h3>Джеймс Клир</h3>
              <span class="legend-role">Автор «Atomic Habits»</span>
              <blockquote class="legend-quote">
                <Quote :size="16" class="quote-icon" />
                «Привычки — это сложные проценты самосовершенствования»
              </blockquote>
              <p class="legend-method">
                Популяризировал концепцию 1%: если каждый день улучшаться на 1%, за год станешь лучше в 37 раз.
              </p>
            </div>
          </div>
          
          <div class="legend-card">
            <div class="legend-avatar">
              <TrendingUp :size="32" />
            </div>
            <div class="legend-content">
              <h3>Уоррен Баффетт</h3>
              <span class="legend-role">Инвестор, миллиардер</span>
              <blockquote class="legend-quote">
                <Quote :size="16" class="quote-icon" />
                «Я просто сижу в офисе и читаю целый день»
              </blockquote>
              <p class="legend-method">
                Правило 5 часов: ежедневно инвестирует минимум час в обучение и рефлексию. 80% рабочего времени — чтение.
              </p>
            </div>
          </div>
          
          <div class="legend-card">
            <div class="legend-avatar">
              <PenTool :size="32" />
            </div>
            <div class="legend-content">
              <h3>Леонардо да Винчи</h3>
              <span class="legend-role">Художник, учёный, изобретатель</span>
              <blockquote class="legend-quote">
                <Quote :size="16" class="quote-icon" />
                «Препятствия не могут сокрушить меня»
              </blockquote>
              <p class="legend-method">
                Вёл легендарные записные книжки: 7000+ страниц наблюдений, идей и планов. Ежедневная практика.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Блок "Что меняется" -->
    <section class="block block-benefits">
      <div class="container">
        <h2 class="benefits-title">Что меняется, когда системность становится привычкой</h2>
        
        <div class="benefits-pills">
          <div class="benefit-pill">
            <span class="pill-icon">🎯</span>
            <span class="pill-text">Чёткий фокус без выгорания</span>
          </div>
          <div class="benefit-pill">
            <span class="pill-icon">🌱</span>
            <span class="pill-text">Естественная дисциплина</span>
          </div>
          <div class="benefit-pill">
            <span class="pill-icon">📊</span>
            <span class="pill-text">Понимание своих приоритетов</span>
          </div>
          <div class="benefit-pill">
            <span class="pill-icon">📈</span>
            <span class="pill-text">Рост без стресса</span>
          </div>
          <div class="benefit-pill">
            <span class="pill-icon">🧘</span>
            <span class="pill-text">Спокойная уверенность</span>
          </div>
        </div>
      </div>
    </section>

    <section class="pricing-section">
      <div class="container">
        <h2 class="section-title">Простая и честная стоимость</h2>
        <p class="section-subtitle">
          Без скрытых платежей. Отмена в любой момент.
        </p>
        
        <div v-if="pricingTerms.length > 0" class="term-selector">
          <button 
            v-for="term in pricingTerms" 
            :key="term.id"
            :class="['term-btn', { active: selectedTerm?.id === term.id, hit: term.is_hit }]"
            @click="selectTerm(term.id)"
          >
            <span class="term-name">{{ term.title }}</span>
            <span v-if="term.discount > 0" class="term-discount">-{{ term.discount }}%</span>
            <span v-if="term.is_hit" class="hit-badge">Хит</span>
          </button>
        </div>
        
        <div class="pricing-cards">
          <template v-if="pricingTariffs.length > 0">
            <div 
              v-for="(tariff, index) in pricingTariffs" 
              :key="tariff.id"
              :class="['pricing-card', { featured: tariff.is_popular, premium: index === 2, 'is-soon': tariff.is_soon }]"
            >
              <div v-if="tariff.is_popular" class="popular-badge">Популярный выбор</div>
              <div v-if="tariff.is_soon" class="soon-badge">Скоро</div>
              <div class="pricing-header">
                <h3>{{ tariff.title }}</h3>
                <div class="price">
                  <span class="amount">{{ formatPrice(getTariffPrice(tariff).price) }} ₽</span>
                  <span class="period">{{ getTariffPrice(tariff).period }}</span>
                </div>
                <div v-if="getTariffSavings(tariff) > 0" class="savings">
                  Экономия {{ formatPrice(getTariffSavings(tariff)) }} ₽
                </div>
              </div>
              <p v-if="tariff.description" class="tariff-description">{{ tariff.description }}</p>
              <ul class="pricing-features">
                <li 
                  v-for="item in getSortedFeatureItems(tariff)" 
                  :key="item.id"
                >
                  <span class="check"><Check :size="16" /></span> {{ item.text }}
                </li>
              </ul>
              <a 
                v-if="!tariff.is_soon"
                href="https://t.me/onepercent_bot" 
                target="_blank"
                :class="['btn', tariff.code === 'free' ? 'btn-outline' : (tariff.is_popular ? 'btn-white' : 'btn-premium')]"
              >
                {{ tariff.code === 'free' ? 'Начать бесплатно' : 'Попробовать' }}
              </a>
              <button v-else class="btn btn-disabled" disabled>Скоро</button>
            </div>
          </template>
          
          <template v-else>
            <div class="pricing-card">
              <div class="pricing-header">
                <h3>Бесплатно</h3>
                <div class="price">
                  <span class="amount">0 ₽</span>
                  <span class="period">навсегда</span>
                </div>
              </div>
              <ul class="pricing-features">
                <li><span class="check"><Check :size="16" /></span> Колесо баланса (ССП)</li>
                <li><span class="check"><Check :size="16" /></span> Банк целей (до 3 целей)</li>
                <li><span class="check"><Check :size="16" /></span> Трекер привычек (до 5)</li>
                <li><span class="check"><Check :size="16" /></span> Дневник рефлексии</li>
              </ul>
              <a href="https://t.me/onepercent_bot" target="_blank" class="btn btn-outline">
                Начать бесплатно
              </a>
            </div>
            
            <div class="pricing-card featured">
              <div class="popular-badge">Популярный выбор</div>
              <div class="pricing-header">
                <h3>Pro</h3>
                <div class="price">
                  <span class="amount">599 ₽</span>
                  <span class="period">/ месяц</span>
                </div>
              </div>
              <ul class="pricing-features">
                <li><span class="check"><Check :size="16" /></span> Всё из бесплатного</li>
                <li><span class="check"><Check :size="16" /></span> Безлимитные цели и привычки</li>
                <li><span class="check"><Check :size="16" /></span> AI ментор</li>
                <li><span class="check"><Check :size="16" /></span> Приоритетная поддержка</li>
              </ul>
              <a href="https://t.me/onepercent_bot" target="_blank" class="btn btn-white">
                Попробовать Pro
              </a>
            </div>
          </template>
        </div>
        
        <p class="pricing-note">
          <Lightbulb :size="18" class="note-icon" /> Начни бесплатно и переходи на Pro, когда почувствуешь, что готов к следующему уровню
        </p>
      </div>
    </section>

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
            <a href="https://t.me/onepercent_bot" target="_blank">Войти</a>
            <a href="https://t.me/onepercent_bot" target="_blank">Регистрация</a>
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

    <button class="back-to-top" v-show="showBackToTop" @click="scrollToTop">↑</button>

    <div class="modal-overlay" v-if="showHowAiWorksModal" @click.self="showHowAiWorksModal = false">
      <div class="modal-content">
        <button class="modal-close" @click="showHowAiWorksModal = false">&times;</button>
        <h3>Как AI выбрал именно эти цели?</h3>
        <div class="modal-body">
          <h4>🎯 AI трансформирует проблемы по формуле:</h4>
          <div class="formula-flow">
            <span>Низкий балл</span>
            <span class="formula-arrow">→</span>
            <span>Анализ причин</span>
            <span class="formula-arrow">→</span>
            <span>Конкретная цель</span>
            <span class="formula-arrow">→</span>
            <span>Измеримый результат</span>
            <span class="formula-arrow">→</span>
            <span>План действий</span>
          </div>
          <div class="example-transformation">
            <h5>Пример трансформации:</h5>
            <div class="transform-step">🟡 Хобби и Отдых 2/10</div>
            <div class="transform-arrow">↓</div>
            <div class="transform-step">Причина: Нет времени на себя</div>
            <div class="transform-arrow">↓</div>
            <div class="transform-step">Цель: Хобби 2 часа в неделю</div>
            <div class="transform-arrow">↓</div>
            <div class="transform-step">Результат: Хобби поднимется до 5-6/10</div>
            <div class="transform-arrow">↓</div>
            <div class="transform-step">План: 4 недели от выбора занятия до привычки</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import WheelOfLife from '@/components/WheelOfLife.vue'
import { useSubscriptionStore } from '@/stores/subscription'
import { useAppStore } from '@/stores/app'
import { 
  Check, 
  Lightbulb,
  Feather,
  Quote,
  BookMarked,
  PenTool,
  TrendingUp 
} from 'lucide-vue-next'

const subscriptionStore = useSubscriptionStore()
const appStore = useAppStore()

const isScrolled = ref(false)
const isAuthenticated = computed(() => appStore.isAuthenticated)

const pricingTariffs = computed(() => subscriptionStore.tariffs)
const pricingTerms = computed(() => subscriptionStore.terms)

const selectedTermId = ref(null)

const selectedTerm = computed(() => {
  if (!pricingTerms.value.length) return null
  if (selectedTermId.value) {
    return pricingTerms.value.find(t => t.id === selectedTermId.value) || pricingTerms.value[0]
  }
  return pricingTerms.value.find(t => t.is_hit) || pricingTerms.value[0]
})

function selectTerm(termId) {
  selectedTermId.value = termId
}

function getTariffPrice(tariff) {
  if (!tariff || tariff.code === 'free') return { price: 0, period: 'навсегда' }
  if (!selectedTerm.value || !tariff.terms) return { price: tariff.price, period: '/ месяц' }
  
  const term = tariff.terms.find(t => t.id === selectedTerm.value.id)
  if (!term) return { price: tariff.price, period: '/ месяц' }
  
  return {
    price: term.final_price,
    period: selectedTerm.value.months === 1 ? '/ месяц' : `за ${selectedTerm.value.months} мес`
  }
}

function getTariffSavings(tariff) {
  if (!tariff || tariff.code === 'free' || !selectedTerm.value) return 0
  const term = tariff.terms?.find(t => t.id === selectedTerm.value.id)
  if (!term) return 0
  return parseFloat(term.savings) || 0
}

function getSortedFeatureItems(tariff) {
  if (!tariff?.feature_items?.length) return []
  return [...tariff.feature_items].sort((a, b) => a.sort_order - b.sort_order)
}

function formatPrice(price) {
  return Math.round(price).toLocaleString('ru-RU')
}

const socialProofCount = ref(2847)
const showBackToTop = ref(false)
const showHowAiWorksModal = ref(false)

const days = ref(90)
const multiplier = computed(() => Math.pow(1.01, days.value).toFixed(2))

const accordions = ref({
  howItWorks: false
})

const wheelSpheres = ref([
  { id: 'health', name: 'Здоровье и спорт', score: 7 },
  { id: 'wealth', name: 'Благосостояние', score: 4 },
  { id: 'hobby', name: 'Хобби и отдых', score: 2 },
  { id: 'friends', name: 'Дружба и окружение', score: 7 },
  { id: 'career', name: 'Работа и карьера', score: 6 },
  { id: 'love', name: 'Любовь, семья, отношения', score: 8 }
])

const spheres = ref([
  { name: 'Здоровье', score: 4, icon: '❤️', label: 'Зона роста' },
  { name: 'Карьера', score: 8, icon: '💼', label: 'Сильная сторона' },
  { name: 'Семья', score: 6, icon: '👨‍👩‍👧', label: 'Норма' },
  { name: 'Благосостояние', score: 5, icon: '💰', label: 'Требует внимания' },
  { name: 'Хобби и отдых', score: 7, icon: '🎨', label: 'Норма' },
  { name: 'Дружба', score: 3, icon: '👥', label: 'Требует внимания' }
])

const steps = ref([
  { title: 'Выбрать вид спорта', date: 'День 1 (сегодня)', completed: false },
  { title: 'Купить форму и абонемент', date: 'День 2 (завтра)', completed: false },
  { title: 'Первая тренировка (20 минут)', date: 'День 3', completed: false },
  { title: 'Привыкнуть к ритму', date: 'День 7', completed: true }
])

const stepsV2 = ref([
  { day: 'День 1', title: 'Выбрать хобби на неделю', goal: 'Хобби 2/10', time: '10 мин', category: 'hobby', completed: false },
  { day: 'День 2', title: 'Изучить способы роста дохода', goal: 'Благосостояние 4/10', time: '15 мин', category: 'money', completed: false },
  { day: 'День 3', title: 'Первое занятие хобби', goal: 'Хобби 2/10', time: '30 мин', category: 'hobby', completed: false },
  { day: 'День 4', title: 'Запланировать вечер с семьёй', goal: 'Любовь 8/10', time: '5 мин', category: 'family', completed: false },
  { day: 'День 7', title: 'Оценка первой недели', goal: 'Все сферы', time: '10 мин', category: 'review', completed: false }
])

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const calendarDays = ref([
  { name: 'Пн', number: 22, task: 'Выбрать хобби', active: false },
  { name: 'Вт', number: 23, task: null, active: false },
  { name: 'Ср', number: 24, task: 'Первая проба', active: true },
  { name: 'Чт', number: 25, task: null, active: false },
  { name: 'Пт', number: 26, task: 'Повторить', active: false },
  { name: 'Сб', number: 27, task: null, active: false },
  { name: 'Вс', number: 28, task: null, active: false }
])

const habits = ref([
  { icon: '🎨', title: 'Хобби 2ч/неделю', streak: 14, xp: 20 },
  { icon: '💰', title: 'Финансовый обзор', streak: 10, xp: 15 },
  { icon: '👨‍👩‍👧', title: 'Ужин с семьёй', streak: 12, xp: 20 }
])

const habitsDemo = ref([
  { 
    icon: '🎨', 
    name: 'Хобби 2ч/неделю', 
    xp: 20,
    todayDone: false,
    days: [
      { label: 'П', done: false, today: false },
      { label: 'В', done: true, today: false },
      { label: 'С', done: false, today: false },
      { label: 'Ч', done: true, today: false },
      { label: 'П', done: false, today: false },
      { label: 'С', done: true, today: true },
      { label: 'В', done: false, today: false }
    ]
  },
  { 
    icon: '💰', 
    name: 'Финансовый обзор', 
    xp: 15,
    todayDone: true,
    days: [
      { label: 'П', done: false, today: false },
      { label: 'В', done: true, today: false },
      { label: 'С', done: true, today: false },
      { label: 'Ч', done: false, today: false },
      { label: 'П', done: true, today: false },
      { label: 'С', done: true, today: true },
      { label: 'В', done: false, today: false }
    ]
  },
  { 
    icon: '👨‍👩‍👧', 
    name: 'Ужин с семьёй', 
    xp: 20,
    todayDone: false,
    days: [
      { label: 'П', done: true, today: false },
      { label: 'В', done: true, today: false },
      { label: 'С', done: true, today: false },
      { label: 'Ч', done: true, today: false },
      { label: 'П', done: true, today: false },
      { label: 'С', done: false, today: true },
      { label: 'В', done: false, today: false }
    ]
  }
])

const streakDays = ref(
  Array.from({ length: 21 }, (_, i) => ({
    num: i + 1,
    completed: i < 14,
    today: i === 14
  }))
)

const rewards = ref([
  { icon: '🎬', title: 'Вечер кино', cost: 500, status: 'completed', statusText: 'Получено!' },
  { icon: '🍕', title: 'Любимая пицца', cost: 750, status: 'completed', statusText: 'Получено!' },
  { icon: '🎮', title: 'Новая игра', cost: 1500, status: 'available', statusText: 'Доступно!' },
  { icon: '✈️', title: 'Поездка на выходные', cost: 5000, status: 'locked', progress: 49, progressText: '2450/5000' }
])

const schedule = ref([
  { time: '🌅 Утро', title: '', example: '"Доброе утро, Максим!\nСегодня — вторник.\n\nЗадачи на сегодня:\n🎨 Первая проба хобби [→ Хобби 2ч в неделю]\n❤️ Вечер с семьёй [→ Вечер с семьёй 3х в неделю]\n\nПривычки:\n🔹 Хобби 2ч/неделю\n🔹 Финансовый обзор\n🔹 Ужин с семьёй\n\nОбрати внимание: у тебя есть просроченная задача «Выбрать хобби на неделю» — возможно, стоит начать с неё."' }
])

function getScoreClass(score) {
  if (score <= 4) return 'critical'
  if (score <= 5) return 'low'
  if (score <= 7) return 'medium'
  return 'good'
}

function getBadgeClass(score) {
  if (score <= 4) return 'badge-critical'
  if (score <= 5) return 'badge-low'
  if (score <= 7) return 'badge-medium'
  return 'badge-good'
}

function toggleAccordion(name) {
  accordions.value[name] = !accordions.value[name]
}

function scrollTo(selector) {
  const target = document.querySelector(selector)
  if (target) {
    const offset = 80
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    })
  }
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

function handleScroll() {
  showBackToTop.value = window.pageYOffset > 500
  isScrolled.value = window.pageYOffset > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  subscriptionStore.loadTariffs(true)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.landing-v4 {
  --primary: #6366F1;
  --primary-hover: #5558E3;
  --primary-light: #E0E7FF;
  
  --bg-main: #F8F9FA;
  --bg-white: #FFFFFF;
  --bg-light: #F3F4F6;
  
  --text-primary: #1F2937;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;
  
  --success: #10B981;
  --success-light: #D1FAE5;
  --success-dark: #059669;
  --warning: #F59E0B;
  --warning-light: #FEF3C7;
  --warning-lighter: #FDE68A;
  --warning-dark: #D97706;
  --error: #EF4444;
  --error-light: #FEE2E2;
  --error-dark: #DC2626;
  --info: #06B6D4;
  
  --pink: #EC4899;
  --purple: #8B5CF6;
  --orange: #F59E0B;
  --cyan: #06B6D4;
  
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 2.5rem;
  --spacing-2xl: 3rem;
  --spacing-3xl: 4rem;
  
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;
  
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
  
  --container-max-width: 1200px;
  
  --transition-fast: 150ms ease;
  --transition-base: 300ms ease;
  --transition-slow: 500ms ease;
  
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--bg-main);
  -webkit-font-smoothing: antialiased;
}

.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  overflow-wrap: anywhere;
  word-break: break-word;
  hyphens: auto;
}

p, .block-subtitle, .transition-text, li {
  overflow-wrap: anywhere;
  word-break: break-word;
  hyphens: auto;
}

h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  letter-spacing: -0.02em;
}

h2 {
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  letter-spacing: -0.01em;
}

p {
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

.block-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: 0.875rem 1.75rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 1rem;
  transition: all var(--transition-base);
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--primary);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.btn-large {
  padding: 1.125rem 2.5rem;
  font-size: 1.125rem;
}

.btn-meta {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: var(--spacing-xs);
}

.landing-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  transition: all 0.3s;
  padding: 1rem 0;
}

.landing-header.scrolled {
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  color: white;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-weight: 700;
  font-size: 1.125rem;
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
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #6366f1;
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
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
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

.social-proof {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

.mockup-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.stat-card {
  text-align: center;
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, var(--primary-light) 0%, #E0E7FF 100%);
  border-radius: var(--radius-lg);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary);
  line-height: 1;
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.block {
  padding: calc(var(--spacing-2xl) + var(--spacing-sm)) 0;
}

.block:not(:first-of-type) {
  padding-top: calc(var(--spacing-2xl) + var(--spacing-lg) + var(--spacing-sm));
}

.block:nth-child(even) {
  background: var(--bg-white);
}

.block-planning,
.block-habits,
.block-goals {
  padding: calc(var(--spacing-3xl) + var(--spacing-xl) + var(--spacing-md)) 0;
}

.block-planning .container,
.block-habits .container {
  max-width: 1200px;
  padding-left: var(--spacing-xl);
  padding-right: var(--spacing-xl);
}

/* Блок "Эффект 1%" */
.effect-section {
  padding: calc(var(--spacing-3xl) + var(--spacing-xl) + var(--spacing-md)) 0;
  background: var(--bg-white);
}

.effect-section .section-title {
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.effect-section .section-subtitle {
  text-align: center;
  color: var(--text-secondary);
  font-size: 1.125rem;
  max-width: 600px;
  margin: 0 auto 3rem;
  line-height: 1.6;
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
  color: var(--text-muted);
}

.effect-result {
  text-align: center;
  margin-bottom: 1.5rem;
}

.days-display {
  font-size: 1.25rem;
  color: var(--text-secondary);
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
  background: var(--bg-light);
  border-radius: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.effect-description p {
  margin: 0;
}

.effect-description strong {
  color: var(--text-primary);
}

/* Wheel block answer */
.wheel-answer {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--primary);
  margin-top: -0.5rem;
  margin-bottom: var(--spacing-lg);
}

/* AI Mentor Quote in Wheel block */
.ai-mentor-quote {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-top: var(--spacing-md);
}

.ai-mentor-quote .ai-avatar {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.ai-mentor-quote .ai-mentor-message {
  flex: 1;
}

.ai-mentor-quote .ai-mentor-name {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 0.25rem;
}

.ai-mentor-quote .ai-mentor-message p {
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-primary);
}

/* Блок "Что меняется" */
.block-benefits {
  background: var(--bg-light);
  padding: var(--spacing-3xl) 0;
}

.benefits-title {
  text-align: center;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xl);
}

.benefits-pills {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--spacing-md);
  max-width: 900px;
  margin: 0 auto;
}

.benefit-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--bg-white);
  border: 1px solid var(--bg-light);
  border-radius: var(--radius-full);
  font-size: 0.9375rem;
  color: var(--text-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.benefit-pill .pill-icon {
  font-size: 1rem;
}

.benefit-pill .pill-text {
  font-weight: 500;
}

@media (max-width: 600px) {
  .benefits-pills {
    flex-direction: column;
    align-items: center;
  }
  
  .benefits-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 900px) {
  .familiar-cards {
    grid-template-columns: 1fr;
    max-width: 480px;
  }
}

.block-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
  align-items: center;
}

.block-content.reverse {
  direction: rtl;
}

.block-content.reverse > * {
  direction: ltr;
}

.transition-text {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.transition-text p {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
  border-radius: var(--radius-full);
  font-weight: 500;
  font-size: 0.875rem;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.wheel-demo {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--bg-light);
}

.wheel-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--bg-light);
}

.wheel-item:last-child {
  border-bottom: none;
}

.wheel-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 500;
}

.wheel-icon {
  font-size: 1.5rem;
}

.wheel-score {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.score-number {
  font-size: 1.25rem;
  font-weight: 700;
}

.score-number.critical { color: var(--error); }
.score-number.low { color: var(--warning); }
.score-number.medium { color: var(--warning); }
.score-number.good { color: var(--success); }

.score-badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-critical { background: #ffebee; color: #c62828; }
.badge-low { background: #fff3e0; color: #e65100; }
.badge-medium { background: #fff3e0; color: #e65100; }
.badge-good { background: #e8f5e9; color: #2e7d32; }

.examples-box {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--bg-light);
}

.step-badge {
  display: inline-block;
  background: var(--primary-light);
  color: var(--primary);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.explanation-box {
  background: var(--bg-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.explanation-box p {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-primary);
  line-height: 1.6;
  font-size: 0.9375rem;
}

.explanation-box p:last-child {
  margin-bottom: 0;
}

.explanation-box strong {
  color: var(--text-primary);
}

.result-example-header {
  text-align: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-md);
}

.score-forecast {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--bg-white);
  border-radius: var(--radius-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.forecast-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.forecast-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.forecast-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--success);
}

.forecast-goal .forecast-value {
  color: var(--primary);
  font-size: 1rem;
}


.testimonial-with-result {
  border: 1px solid var(--bg-light);
  padding: var(--spacing-lg);
}

.testimonial-result {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--bg-light);
}

.result-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.result-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--success);
}

.example-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  font-size: 0.9375rem;
}

.example-item:last-child { margin-bottom: 0; }
.example-from { color: var(--text-muted); font-size: 0.875rem; }
.example-arrow { color: var(--primary); font-weight: 700; }
.example-to { color: var(--text-primary); font-weight: 600; }

.wheel-demo-compact {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.wheel-item-critical,
.wheel-item-warning,
.wheel-item-success {
  background: var(--bg-white);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.wheel-item-critical {
  border-left: 4px solid var(--error);
}

.wheel-item-warning {
  border-left: 4px solid var(--warning);
}

.wheel-item-success {
  border-left: 4px solid var(--success);
}

.wheel-action {
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--bg-light);
  font-size: 0.875rem;
  color: var(--primary);
  font-weight: 500;
}

.badge-critical {
  background-color: var(--error-light, #FEE2E2) !important;
  color: var(--error-dark, #DC2626) !important;
}

.badge-warning {
  background-color: var(--warning-light, #FEF3C7) !important;
  color: var(--warning-dark, #D97706) !important;
}

.badge-success {
  background-color: var(--success-light, #D1FAE5) !important;
  color: var(--success-dark, #059669) !important;
}

.wheel-chart {
  max-width: 300px;
  margin: 0 auto var(--spacing-xl) auto;
}

.wheel-svg {
  filter: drop-shadow(0 10px 20px rgba(99, 102, 241, 0.2));
}

.wheel-track {
  stroke: var(--bg-light);
}

.wheel-progress {
  stroke: var(--primary);
}

.wheel-score-text {
  fill: var(--text-primary);
}

.wheel-label-text {
  fill: var(--text-muted);
}

.wheel-goal-text {
  fill: var(--primary);
}

.wheel-balance-chart {
  position: relative;
  max-width: 340px;
  margin: 0 auto var(--spacing-lg) auto;
  padding: var(--spacing-xl);
}

.wheel-balance-svg {
  width: 100%;
  height: auto;
  display: block;
}

.wheel-grid-circle {
  stroke: var(--bg-light);
  stroke-width: 1;
}

.wheel-grid-line {
  stroke: var(--bg-light);
  stroke-width: 1;
}

.wheel-polygon {
  fill: var(--primary-light);
  stroke: var(--primary);
  stroke-width: 2;
  opacity: 0.8;
}

.wheel-dot {
  fill: var(--primary);
}

.wheel-component {
  max-width: 888px;
  margin: 0 auto;
}

.wheel-component :deep(.wheel-of-life) {
  width: 100%;
}

.wheel-component :deep(.wheel-svg) {
  width: 100%;
  height: auto;
  cursor: default;
}

.wheel-demo-mini {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.wheel-item-mini {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-white);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
}

.wheel-item-mini.wheel-item-critical {
  border-left: 3px solid #e9c46a;
}

.wheel-item-mini.wheel-item-warning {
  border-left: 3px solid #f4a261;
}

.wheel-item-mini.wheel-item-success {
  border-left: 3px solid #9b5de5;
}

.mini-label {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.mini-value {
  font-weight: 600;
  font-size: 0.8125rem;
}

.mini-value.score-low {
  color: #e9c46a;
}

.mini-value.score-medium {
  color: #f4a261;
}

.mini-value.score-high {
  color: #9b5de5;
}

.wheel-labels {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.wheel-label-item {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: var(--bg-white);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  font-size: 0.75rem;
  white-space: nowrap;
}

.label-icon {
  font-size: 1rem;
}

.label-text {
  color: var(--text-muted);
  font-size: 0.6875rem;
}

.label-score {
  font-weight: 700;
  font-size: 0.875rem;
}

.label-score.score-high {
  color: var(--success);
}

.label-score.score-medium {
  color: var(--warning);
}

.label-score.score-low {
  color: var(--error);
}

.goals-cards {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.goal-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border-left: 4px solid var(--primary);
  transition: all var(--transition-base);
}

.goal-card:hover {
  transform: translateX(8px);
  box-shadow: var(--shadow-md);
}

.goal-card.goal-health { border-left-color: var(--error); }
.goal-card.goal-money { border-left-color: #f4a261; }
.goal-card.goal-family { border-left-color: #9b5de5; }
.goal-card.goal-hobby { border-left-color: #e9c46a; }

.block2-centered {
  text-align: center;
  max-width: 600px;
  margin: 0 auto var(--spacing-2xl);
}

.block2-centered h2 {
  margin-bottom: var(--spacing-sm);
}

.block2-centered .block-subtitle {
  margin-bottom: var(--spacing-lg);
}

.block2-centered .btn {
  margin-bottom: var(--spacing-xs);
}

.block2-header-compact {
  text-align: center;
  max-width: 700px;
  margin: 0 auto var(--spacing-xl);
}

.block2-header-compact h2 {
  margin-bottom: var(--spacing-xs);
  font-size: 1.75rem;
}

.block2-header-compact .block-subtitle {
  margin-bottom: var(--spacing-lg);
}

.block2-header-compact .btn {
  margin-bottom: var(--spacing-xs);
}

.block4-header-compact {
  text-align: center;
  max-width: 700px;
  margin: 0 auto var(--spacing-xl);
}

.block4-header-compact h2 {
  margin-bottom: var(--spacing-xs);
  font-size: 1.75rem;
}

.block4-header-compact .block-subtitle {
  margin-bottom: 0;
}

.block5-header-compact {
  text-align: center;
  max-width: 700px;
  margin: 0 auto var(--spacing-xl);
}

.block5-header-compact h2 {
  margin-bottom: var(--spacing-xs);
  font-size: 1.75rem;
}

.block5-header-compact .block-subtitle {
  margin-bottom: 0;
}

.block5-layout {
  display: flex;
  gap: var(--spacing-xl);
  align-items: flex-start;
}

.block5-text {
  flex: 0 0 320px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.ai-mentor-info {
  display: flex;
  gap: var(--spacing-md);
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  border-left: 4px solid var(--primary);
}

.ai-mentor-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.ai-mentor-content strong {
  display: block;
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
}

.ai-mentor-content p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.habits-demo {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.habit-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.habit-check input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: var(--primary);
  cursor: default;
}

.habit-icon-demo {
  font-size: 1.5rem;
}

.habit-name-demo {
  flex: 1;
  font-weight: 500;
  color: var(--text-primary);
}

.habit-weekdays {
  display: flex;
  gap: 4px;
}

.weekday {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #f3f4f6;
  color: #9ca3af;
  border: 1px solid #e5e7eb;
}

.weekday.done {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.weekday.today {
  border: 2px solid var(--primary);
  background: #ede9fe;
  color: var(--primary);
}

.weekday.today.done {
  background: #10b981;
  color: white;
  border-color: var(--primary);
}

.habit-xp-badge {
  background: #ecfdf5;
  color: #059669;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .landing-header {
    padding: 0.75rem 0;
  }
  
  .logo-text {
    display: none;
  }
  
  .nav-link {
    display: none;
  }
  
  .hero {
    padding: 7rem 0 4rem;
    min-height: auto;
  }
  
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
  
  .hero-content {
    max-width: 100%;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .compound-chart {
    max-width: 350px;
    margin: 0 auto;
  }
  
  .block5-layout {
    flex-direction: column;
  }
  
  .block5-text {
    flex: none;
    width: 100%;
  }
  
  .habit-card {
    flex-wrap: wrap;
  }
  
  .habit-weekdays {
    order: 10;
    width: 100%;
    justify-content: center;
    margin-top: var(--spacing-sm);
  }
}

.goals-grid {
  background: var(--bg-white);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-xl);
}

.goals-grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.goals-grid-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
}

.goals-cards-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.goal-card-v2 {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-lg);
  background: var(--bg-light);
  border-radius: var(--radius-lg);
  position: relative;
  transition: all var(--transition-base);
}

.goal-card-v2:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.goal-card-v2.goal-hobby { border-top: 4px solid #e9c46a; }
.goal-card-v2.goal-money { border-top: 4px solid #f4a261; }
.goal-card-v2.goal-family { border-top: 4px solid #9b5de5; }

.goal-card-number {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  width: 24px;
  height: 24px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

.goal-card-content {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
}

.goal-card-v2 .goal-icon {
  font-size: 1.5rem;
}

.goal-card-v2 .goal-title {
  font-size: 0.9375rem;
  margin-bottom: var(--spacing-xs);
}

.goal-card-v2 .goal-meta {
  font-size: 0.75rem;
}

.ai-quote-centered {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  background: linear-gradient(135deg, var(--primary-light) 0%, #f0f0ff 100%);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  max-width: 600px;
  margin: 0 auto;
}

.ai-quote-centered .ai-avatar {
  font-size: 2rem;
  flex-shrink: 0;
}

.ai-quote-centered .ai-message p {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--text-primary);
  margin: 0;
}

@media (max-width: 768px) {
  .goals-cards-row {
    grid-template-columns: 1fr;
  }
  
  .goals-grid-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
}

.goals-section-header {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: var(--spacing-sm);
  padding-left: var(--spacing-xs);
}

.month-structure-card {
  background: var(--bg-white);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  border: 1px solid var(--border-light);
}

.month-structure-header {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.goal-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.goal-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.goal-meta {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.decomposition-example {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--bg-light);
}

.decomp-step {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.decomp-label {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-light);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.decomp-arrow {
  color: var(--primary);
  font-weight: 700;
}

.decomp-timeline {
  margin-top: var(--spacing-lg);
}

.timeline-item {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.timeline-item:last-child { margin-bottom: 0; }

.timeline-dot {
  width: 12px;
  height: 12px;
  background: var(--primary);
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.timeline-content {
  color: var(--text-secondary);
  font-size: 0.9375rem;
}

.timeline-content strong {
  color: var(--text-primary);
}

.ai-quote {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-white);
  border-radius: var(--radius-md);
  margin: var(--spacing-lg) 0;
  border-left: 3px solid var(--primary);
  box-shadow: var(--shadow-sm);
}

.ai-avatar {
  width: 40px;
  height: 40px;
  background: var(--primary-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.ai-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 0.25rem;
}

.ai-message p {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.9375rem;
}

.accordion {
  margin: var(--spacing-xl) 0;
}

.accordion-trigger {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--bg-white);
  border: 1px solid var(--bg-light);
  border-radius: var(--radius-md);
  font-weight: 500;
  color: var(--text-primary);
  transition: all var(--transition-base);
  cursor: pointer;
}

.accordion-trigger:hover {
  background: var(--bg-light);
}

.accordion-icon {
  transition: transform var(--transition-base);
  color: var(--primary);
}

.accordion-trigger.active .accordion-icon {
  transform: rotate(180deg);
}

.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height var(--transition-slow);
}

.accordion-content.active {
  max-height: 2000px;
}

.accordion-inner {
  padding: var(--spacing-lg);
  background: var(--bg-light);
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  margin-top: -1px;
}

.accordion-inner h4 {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
}

.formula-flow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
}

.formula-flow span {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-white);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}

.formula-arrow {
  color: var(--primary);
  font-weight: 700;
}

.example-transformation {
  background: var(--bg-white);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
}

.transform-step {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-light);
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-xs);
  font-size: 0.875rem;
}

.transform-arrow {
  text-align: center;
  color: var(--primary);
  font-weight: 700;
  padding: var(--spacing-xs) 0;
}

.steps-list {
  margin: var(--spacing-xl) 0;
}

.step-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-md);
  border: 2px solid var(--bg-light);
  transition: all var(--transition-base);
}

.step-item:hover {
  border-color: var(--primary-light);
  transform: translateX(4px);
}

.step-item.completed {
  background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
  border-color: var(--success);
}

.step-number {
  width: 40px;
  height: 40px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.step-item.completed .step-number {
  background: var(--success);
}

.step-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.step-date {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.block3-header {
  text-align: center;
  max-width: 700px;
  margin: 0 auto var(--spacing-xl);
}

.block3-header h2 {
  margin-bottom: var(--spacing-sm);
}

.block3-header-compact {
  text-align: center;
  max-width: 700px;
  margin: 0 auto var(--spacing-lg);
}

.block3-header-compact h2 {
  margin-bottom: var(--spacing-xs);
  font-size: 1.75rem;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  flex-wrap: wrap;
}

.transition-check {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: #D1FAE5;
  color: #059669;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 500;
}

.step-badge-inline {
  display: inline-flex;
  align-items: center;
  background: var(--primary-light);
  color: var(--primary);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 600;
}

.ai-quote-compact {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  background: linear-gradient(135deg, var(--primary-light) 0%, #e8e4ff 100%);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
  max-width: 600px;
  margin: var(--spacing-lg) auto 0;
}

.ai-quote-compact .ai-emoji {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.ai-quote-compact p {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--text-primary);
  margin: 0;
  font-style: italic;
}

.block3-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
  flex-wrap: wrap;
}

.telegram-inline {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-muted);
  font-size: 0.875rem;
}

.telegram-inline svg {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .header-row {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  
  .block3-footer {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .block3-header-compact h2 {
    font-size: 1.5rem;
  }
}

.decomp-transformation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-xl);
  background: var(--bg-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.decomp-before,
.decomp-after {
  flex: 1;
  max-width: 280px;
}

.decomp-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--spacing-sm);
}

.decomp-goal-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: var(--radius-lg);
  border-left: 4px solid #e9c46a;
}

.decomp-icon {
  font-size: 2rem;
}

.decomp-goal-text {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1rem;
}

.decomp-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 0 var(--spacing-md);
}

.decomp-ai-badge {
  background: var(--primary);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.decomp-arrow .arrow-icon {
  color: var(--primary);
}

.decomp-steps-mini {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.decomp-step-mini {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-light);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--text-primary);
  border-left: 3px solid var(--success);
}

.decomp-step-mini span {
  font-size: 0.75rem;
  color: var(--text-muted);
  background: var(--bg-white);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.ai-quote-decomp {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  background: linear-gradient(135deg, var(--primary-light) 0%, #e8e4ff 100%);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  max-width: 700px;
  margin: 0 auto var(--spacing-2xl);
}

.ai-quote-decomp .ai-avatar {
  font-size: 2rem;
  flex-shrink: 0;
}

.ai-quote-decomp .ai-message p {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--text-primary);
  margin: 0;
}

.block-visual-full {
  width: 100%;
  max-width: 600px;
  margin: 0 auto var(--spacing-xl);
}

.block-text-center {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
}

.block-text-center .telegram-box-v2 {
  text-align: left;
  margin-bottom: var(--spacing-lg);
}

.block-text-center .btn {
  margin-bottom: var(--spacing-xs);
}

@media (max-width: 768px) {
  .decomp-transformation {
    flex-direction: column;
    padding: var(--spacing-lg);
    gap: var(--spacing-md);
  }
  
  .decomp-before,
  .decomp-after {
    width: 100%;
    max-width: none;
  }
  
  .decomp-arrow {
    flex-direction: row;
    padding: var(--spacing-sm) 0;
  }
  
  .decomp-arrow .arrow-icon {
    transform: rotate(90deg);
  }
  
  .ai-quote-decomp {
    padding: var(--spacing-md);
  }
  
  .block-visual-full {
    max-width: 100%;
  }
}

.steps-card {
  background: var(--bg-white);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
}

.steps-card-header {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: var(--spacing-lg);
  padding-left: var(--spacing-xs);
}

.steps-list-v2 {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.step-item-v2 {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-light);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--primary);
  transition: all var(--transition-base);
}

.step-item-v2:hover {
  background: var(--bg-white);
  box-shadow: var(--shadow-sm);
}

.step-item-v2.hobby { border-left-color: #e9c46a; }
.step-item-v2.money { border-left-color: #f4a261; }
.step-item-v2.family { border-left-color: #9b5de5; }
.step-item-v2.review { border-left-color: var(--success); }

.step-day {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary);
  background: var(--primary-light);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.step-content-v2 {
  flex: 1;
  min-width: 0;
}

.step-title-v2 {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9375rem;
  margin-bottom: 2px;
}

.step-goal {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.step-time {
  font-size: 0.75rem;
  color: var(--text-muted);
  background: var(--bg-white);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.telegram-box-v2 {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.ai-quote-v2 {
  background: linear-gradient(135deg, var(--primary-light) 0%, #f0f0ff 100%);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  margin: var(--spacing-lg) 0;
}

@media (max-width: 768px) {
  .step-item-v2 {
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }
  
  .step-day {
    order: -1;
  }
  
  .step-time {
    margin-left: auto;
  }
}

.telegram-box {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-light);
  border-radius: var(--radius-md);
  margin: var(--spacing-lg) 0;
  border-left: 3px solid #0088cc;
}

.telegram-icon {
  width: 40px;
  height: 40px;
  background: #0088cc;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.telegram-text strong {
  display: block;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  font-size: 0.9375rem;
}

.telegram-text p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.week-progress {
  background: var(--bg-white);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  font-weight: 600;
}

.progress-status {
  color: var(--primary);
  font-size: 0.875rem;
}

.progress-bar {
  height: 8px;
  background: var(--bg-light);
  border-radius: var(--radius-full);
  margin-bottom: var(--spacing-lg);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary) 0%, var(--purple) 100%);
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}

.week-days {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-xs);
}

.day-dot {
  width: 40px;
  height: 40px;
  background: var(--bg-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
}

.day-dot.active {
  background: var(--primary);
  color: white;
}

.calendar-week {
  background: var(--bg-white);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.calendar-header {
  text-align: center;
  font-weight: 600;
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-xs);
}

.calendar-day {
  text-align: center;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  background: var(--bg-light);
  transition: all var(--transition-base);
}

.calendar-day:hover {
  background: var(--primary-light);
}

.calendar-day.active {
  background: var(--primary);
  color: white;
}

.day-name {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.calendar-day.active .day-name {
  color: rgba(255,255,255,0.8);
}

.day-number {
  font-weight: 700;
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
}

.day-task {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.calendar-day.active .day-task {
  color: white;
}

.tasks-progress {
  background: var(--bg-light);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  margin-top: var(--spacing-lg);
}

.progress-stats {
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.progress-stats span {
  color: var(--text-secondary);
}

.progress-stats strong {
  display: block;
  font-size: 1.5rem;
  color: var(--primary);
  margin-bottom: 0.25rem;
}

.personalization-note {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--bg-white);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--primary);
  margin: var(--spacing-lg) 0;
  box-shadow: var(--shadow-sm);
}

.note-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.note-text strong {
  display: block;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.9375rem;
}

.note-text p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.habits-list {
  margin-bottom: var(--spacing-lg);
}

.habit-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.habit-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.habit-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary-light) 0%, #E0E7FF 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.habit-content {
  flex: 1;
}

.habit-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.habit-streak {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.habit-xp {
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--primary);
  color: white;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: 0.875rem;
}

.xp-earned {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--primary-light);
  color: var(--primary);
  border-radius: var(--radius-md);
  margin: var(--spacing-lg) 0;
  border: 2px solid var(--primary);
}

.xp-label {
  font-weight: 500;
  font-size: 0.9375rem;
}

.xp-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.streak-calendar {
  background: var(--bg-white);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.calendar-title {
  text-align: center;
  font-weight: 600;
  margin-bottom: var(--spacing-lg);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
}

.cal-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 600;
  background: var(--bg-light);
  color: var(--text-muted);
}

.cal-day.completed {
  background: var(--success);
  color: white;
}

.cal-day.today {
  background: var(--warning);
  color: white;
  border: 2px solid var(--text-primary);
}

.streak-badge {
  text-align: center;
  padding: var(--spacing-md);
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  border-radius: var(--radius-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.xp-balance {
  text-align: center;
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, var(--primary) 0%, var(--purple) 100%);
  color: white;
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-lg);
}

.balance-label {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.balance-value {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
}

.rewards-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.reward-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 2px solid var(--bg-light);
}

.reward-item.available {
  border-color: var(--success);
  background: linear-gradient(135deg, #D1FAE5 0%, white 100%);
}

.reward-item.completed {
  opacity: 0.6;
}

.reward-icon {
  width: 48px;
  height: 48px;
  background: var(--bg-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.reward-content {
  flex: 1;
}

.reward-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.reward-cost {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.reward-status {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 600;
}

.reward-item.completed .reward-status {
  background: var(--bg-light);
  color: var(--text-muted);
}

.reward-item.available .reward-status {
  background: var(--success);
  color: white;
}

.reward-progress {
  min-width: 120px;
}

.reward-progress-bar {
  height: 6px;
  background: var(--bg-light);
  border-radius: var(--radius-full);
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.reward-progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: var(--radius-full);
}

.reward-progress-text {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: right;
}

.rewards-explanation {
  background: var(--bg-white);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  margin: var(--spacing-lg) 0;
  box-shadow: var(--shadow-sm);
}

.rewards-explanation h4 {
  margin-bottom: var(--spacing-md);
}

.rewards-explanation p {
  margin: 0;
}

.day-schedule {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.schedule-item {
  padding: var(--spacing-md);
  background: var(--bg-light);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--primary);
}

.schedule-time {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--primary);
  margin-bottom: 0.25rem;
}

.schedule-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  font-size: 0.9375rem;
}

.schedule-example {
  font-style: normal;
  color: var(--text-secondary);
  font-size: 0.875rem;
  padding: var(--spacing-sm);
  background: var(--bg-white);
  border-radius: var(--radius-sm);
  white-space: pre-line;
  line-height: 1.5;
}

.role-transformation {
  background: var(--bg-light);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-top: var(--spacing-md);
}

.role-transformation h4 {
  margin-bottom: var(--spacing-sm);
  font-size: 0.9375rem;
}

.role-transformation ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.role-transformation li {
  padding: var(--spacing-xs) 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.role-transformation strong {
  color: var(--text-primary);
}

.role-transformation .disclaimer {
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-light);
  font-size: 0.75rem;
  color: var(--text-muted);
  font-style: italic;
}

.phone-mockup {
  max-width: 300px;
  margin: 0 auto;
}

.phone-frame {
  background: #1F2937;
  border-radius: 36px;
  padding: 12px;
  box-shadow: var(--shadow-xl);
}

.phone-screen {
  background: var(--bg-white);
  border-radius: 24px;
  overflow: hidden;
  height: 480px;
}

.phone-screen-tall {
  height: 560px;
}

.testimonial-centered {
  max-width: 700px;
  margin: var(--spacing-xl) auto 0;
  text-align: center;
}

.telegram-chat {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tg-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--primary);
  color: white;
}

.tg-avatar {
  width: 40px;
  height: 40px;
  background: white;
  color: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.tg-name {
  font-weight: 600;
}

.tg-status {
  font-size: 0.75rem;
  opacity: 0.8;
}

.tg-messages {
  flex: 1;
  padding: var(--spacing-md);
  overflow-y: auto;
  background: #E5DDD5;
}

.tg-message {
  margin-bottom: var(--spacing-md);
}

.tg-message.user {
  text-align: right;
}

.tg-bubble {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-lg);
  max-width: 85%;
  text-align: left;
  font-size: 0.8125rem;
  line-height: 1.4;
}

.tg-message.ai .tg-bubble {
  background: white;
  border-bottom-left-radius: 4px;
}

.tg-bubble-morning {
  max-width: 95%;
  line-height: 1.5;
}

.tg-message.user .tg-bubble {
  background: #DCF8C6;
  border-bottom-right-radius: 4px;
}

.tg-time {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.testimonial {
  padding: var(--spacing-md);
  border-left: 3px solid var(--primary);
  margin-top: var(--spacing-lg);
  background: var(--bg-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.testimonial p {
  font-style: italic;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
  font-size: 0.9375rem;
  line-height: 1.5;
}

.testimonial-author {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.final-cta {
  background: linear-gradient(135deg, var(--primary) 0%, var(--purple) 100%);
  color: white;
  padding: calc(var(--spacing-3xl) + var(--spacing-xl)) 0;
  text-align: center;
}

.cta-content h2 {
  color: white;
  margin-bottom: var(--spacing-xl);
}

.cta-checklist {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
  max-width: 800px;
  margin: 0 auto var(--spacing-2xl);
}

.check-item {
  padding: var(--spacing-md);
  background: rgba(255,255,255,0.1);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(10px);
}

.cta-action {
  margin-bottom: var(--spacing-xl);
}

.cta-action .btn-primary {
  background: white;
  color: var(--primary);
}

.cta-action .btn-primary:hover {
  background: var(--bg-light);
  transform: translateY(-4px);
}

.cta-meta {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-md);
  color: rgba(255,255,255,0.9);
}

.final-cta .social-proof {
  background: rgba(255,255,255,0.1);
  color: white;
  backdrop-filter: blur(10px);
}

.footer {
  background: var(--text-primary);
  color: white;
  padding: var(--spacing-2xl) 0;
}

.footer-content {
  text-align: center;
}

.footer-logo {
  margin-bottom: var(--spacing-lg);
}

.footer-logo strong {
  font-size: 1.25rem;
  color: var(--primary-light);
}

.footer-logo p {
  color: rgba(255,255,255,0.6);
  margin: 0;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.footer-links a {
  color: rgba(255,255,255,0.8);
  font-size: 0.875rem;
  transition: color var(--transition-base);
  text-decoration: none;
}

.footer-links a:hover {
  color: white;
}

.footer-copy {
  color: rgba(255,255,255,0.6);
  font-size: 0.875rem;
}

.back-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 48px;
  height: 48px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  z-index: 1000;
}

.back-to-top:hover {
  background: var(--primary-hover);
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.how-ai-works-link {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  padding: 0;
  margin-top: var(--spacing-sm);
  transition: color 0.2s ease;
}

.how-ai-works-link:hover {
  color: var(--primary-hover);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: var(--spacing-md);
}

.modal-content {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: var(--spacing-xl);
  position: relative;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.modal-close {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-muted);
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--bg-light);
  color: var(--text-primary);
}

.modal-content h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  padding-right: var(--spacing-xl);
}

.modal-body h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.modal-body h5 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

@media (max-width: 1024px) {
  .hero-content,
  .block-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
  
  .block-content.reverse {
    direction: ltr;
  }
  
  .block-visual {
    order: -1;
  }
}

@media (max-width: 768px) {
  .hero {
    padding: var(--spacing-2xl) 0;
  }
  
  .hero-text,
  .block-text,
  .block2-header-compact,
  .block3-header-compact,
  .block4-header-compact,
  .block5-header-compact,
  .block5-text {
    min-width: 0;
    width: 100%;
  }
  
  .header-row {
    flex-wrap: wrap;
  }
  
  .hero-meta {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  
  .mockup-content {
    grid-template-columns: 1fr;
  }
  
  .step-badge {
    font-size: 0.8125rem;
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  .explanation-box {
    padding: var(--spacing-md);
  }
  
  .score-forecast {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .forecast-item {
    flex-direction: row;
    gap: var(--spacing-sm);
  }
  
  .wheel-demo-compact {
    gap: var(--spacing-sm);
  }
  
  .wheel-item-critical,
  .wheel-item-warning,
  .wheel-item-success {
    padding: var(--spacing-sm);
  }
  
  .testimonial-result {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
  
  .calendar-days {
    gap: 4px;
  }
  
  .calendar-day {
    padding: var(--spacing-xs);
  }
  
  .day-task {
    display: none;
  }
  
  .cta-checklist {
    grid-template-columns: 1fr;
  }
  
  .cta-meta {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  
  .footer-links {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .phone-mockup {
    display: none;
  }
  
  .mobile-content-card {
    display: block;
  }
  
  .block-visual {
    order: 1;
  }
  
  .block-rewards .block-visual,
  .block-mentor .block-visual {
    display: block;
    order: -1;
  }
  
  .block-mentor .phone-mockup {
    display: block;
    max-width: 100%;
  }
  
  .block-mentor .phone-frame {
    border-radius: var(--radius-lg);
    padding: 8px;
  }
  
  .block-mentor .phone-screen {
    height: auto;
    min-height: 400px;
  }
  
  .block-mentor .phone-screen-tall {
    height: auto;
  }
  
  h2 {
    font-size: 1.5rem;
  }
  
  .block-subtitle {
    font-size: 0.9375rem;
  }
  
  .testimonial-centered {
    max-width: 100%;
  }
  
  .wheel-balance-chart {
    max-width: 300px;
    padding: var(--spacing-md);
  }
  
  .xp-balance {
    padding: var(--spacing-md);
  }
  
  .rewards-list {
    gap: var(--spacing-sm);
  }
  
  .reward-item {
    padding: var(--spacing-sm);
  }
  
  .tg-bubble-morning {
    font-size: 0.75rem;
  }
  
  .role-transformation {
    padding: var(--spacing-md);
  }
  
  .role-transformation ul {
    padding-left: var(--spacing-md);
  }
  
  .disclaimer {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 var(--spacing-xs);
  }
  
  .btn {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 0.9375rem;
  }
  
  h1 {
    font-size: 1.5rem;
    line-height: 1.25;
  }
  
  h2 {
    font-size: 1.25rem;
    line-height: 1.3;
  }
  
  .hero-title {
    font-size: 1.5rem;
  }
  
  .hero-subtitle {
    font-size: 0.9375rem;
  }
  
  .block-subtitle {
    font-size: 0.875rem;
    margin-bottom: var(--spacing-md);
  }
  
  .step-badge,
  .step-badge-inline {
    font-size: 0.6875rem;
    padding: 0.25rem 0.5rem;
  }
  
  .transition-check {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
  
  .header-row {
    gap: var(--spacing-xs);
    justify-content: center;
  }
  
  .explanation-box {
    padding: var(--spacing-sm);
    border-radius: var(--radius-md);
  }
  
  .explanation-box p {
    font-size: 0.8125rem;
  }
  
  .result-example-header {
    font-size: 0.6875rem;
  }
  
  .goal-card-v2 {
    padding: var(--spacing-sm);
  }
  
  .goal-title {
    font-size: 0.9375rem;
  }
  
  .goal-meta {
    font-size: 0.75rem;
  }
  
  .decomp-transformation {
    padding: var(--spacing-sm);
  }
  
  .decomp-goal-card {
    padding: var(--spacing-sm);
  }
  
  .decomp-goal-text {
    font-size: 0.9375rem;
  }
  
  .step-item-v2 {
    padding: var(--spacing-sm);
  }
  
  .step-title {
    font-size: 0.875rem;
  }
  
  .ai-mentor-info {
    padding: var(--spacing-sm);
  }
  
  .ai-mentor-content strong {
    font-size: 0.9375rem;
  }
  
  .ai-mentor-content p {
    font-size: 0.8125rem;
  }
  
  .habit-card {
    padding: var(--spacing-xs);
    gap: var(--spacing-xs);
  }
  
  .habit-name-demo {
    font-size: 0.875rem;
  }
  
  .weekday {
    width: 20px;
    height: 20px;
    font-size: 0.625rem;
  }
  
  .habit-xp-badge {
    font-size: 0.6875rem;
    padding: 0.125rem 0.375rem;
  }
  
  .xp-balance {
    padding: var(--spacing-sm);
  }
  
  .balance-value {
    font-size: 2rem;
  }
  
  .reward-item {
    padding: var(--spacing-xs);
    gap: var(--spacing-xs);
  }
  
  .reward-title {
    font-size: 0.875rem;
  }
  
  .reward-cost {
    font-size: 0.75rem;
  }
  
  .rewards-explanation {
    padding: var(--spacing-sm);
  }
  
  .rewards-explanation h4 {
    font-size: 0.9375rem;
  }
  
  .rewards-explanation p {
    font-size: 0.8125rem;
  }
  
  .ai-quote {
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);
  }
  
  .ai-quote p {
    font-size: 0.8125rem;
  }
  
  .testimonial p {
    font-size: 0.8125rem;
  }
  
  .transition-text {
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
  }
  
  .transition-text p {
    font-size: 0.8125rem;
  }
  
  .role-transformation {
    padding: var(--spacing-sm);
  }
  
  .role-transformation h4 {
    font-size: 0.9375rem;
  }
  
  .role-transformation li {
    font-size: 0.8125rem;
  }
  
  .disclaimer {
    font-size: 0.6875rem;
  }
  
  .tg-bubble-morning {
    font-size: 0.6875rem;
    padding: 0.375rem;
    line-height: 1.4;
  }
  
  .cta-content h2 {
    font-size: 1.25rem;
  }
  
  .check-item {
    font-size: 0.875rem;
  }
  
  .social-proof {
    font-size: 0.8125rem;
  }
  
  .wheel-balance-chart {
    max-width: 280px;
    padding: var(--spacing-md);
  }
  
  .wheel-label-item {
    padding: 2px 4px;
    font-size: 0.625rem;
  }
  
  .label-icon {
    font-size: 0.75rem;
  }
  
  .label-score {
    font-size: 0.75rem;
  }
  
  .wheel-chart {
    max-width: 200px;
  }
  
  .wheel-action {
    font-size: 0.8125rem;
  }
  
  .calendar-grid {
    gap: 2px;
  }
  
  .cal-day {
    font-size: 0.75rem;
  }
  
  h2 {
    font-size: 1.25rem;
    line-height: 1.3;
  }
  
  .hero-title {
    font-size: 1.75rem;
  }
  
  .block-subtitle {
    font-size: 0.875rem;
  }
  
  .tg-bubble-morning {
    font-size: 0.6875rem;
    padding: var(--spacing-xs);
  }
  
  .block-mentor .phone-screen {
    min-height: 350px;
  }
  
  .testimonial-centered p {
    font-size: 0.875rem;
  }
  
  .transition-text p {
    font-size: 0.875rem;
  }
  
  .cta-content h2 {
    font-size: 1.25rem;
  }
  
  .social-proof {
    font-size: 0.875rem;
  }
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.section-subtitle {
  text-align: center;
  color: var(--text-secondary);
  font-size: 1.125rem;
  margin-bottom: var(--spacing-xl);
}

.legends-section {
  padding: 5rem 0;
  background: linear-gradient(180deg, #f8fafc 0%, #fff 100%);
}

.legends-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

.legend-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  gap: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  transition: all 0.3s;
}

.legend-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.3);
}

.legend-avatar {
  width: 64px;
  height: 64px;
  min-width: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.legend-content h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.25rem;
}

.legend-role {
  font-size: 0.8125rem;
  color: #6b7280;
  display: block;
  margin-bottom: 0.75rem;
}

.legend-quote {
  position: relative;
  font-style: italic;
  color: #4b5563;
  padding-left: 1.5rem;
  margin: 0 0 0.75rem;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.legend-quote .quote-icon {
  position: absolute;
  left: 0;
  top: 2px;
  color: #6366f1;
  opacity: 0.6;
}

.legend-method {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

.pricing-section {
  padding: var(--spacing-3xl) 0;
  background: var(--bg-light);
}

.term-selector {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
}

.term-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--bg-white);
  border: 2px solid var(--bg-light);
  border-radius: var(--radius-full);
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.term-btn:hover {
  border-color: var(--primary-light);
}

.term-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.term-btn.hit {
  position: relative;
}

.term-discount {
  background: var(--success);
  color: white;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
}

.hit-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--warning);
  color: white;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
}

.tariff-description {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0 0 var(--spacing-sm);
  line-height: 1.4;
}

.savings {
  margin-top: var(--spacing-xs);
  font-size: 0.875rem;
  color: var(--success);
  font-weight: 600;
}

.pricing-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  max-width: 1100px;
  margin: 0 auto var(--spacing-lg);
}

.pricing-card {
  background: var(--bg-white);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  border: 2px solid var(--bg-light);
  display: flex;
  flex-direction: column;
  transition: all var(--transition-base);
}

.pricing-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.pricing-card.featured {
  background: linear-gradient(135deg, var(--primary) 0%, var(--purple) 100%);
  color: white;
  border: none;
  position: relative;
  transform: scale(1.05);
}

.pricing-card.featured:hover {
  transform: scale(1.08);
}

.pricing-card.premium {
  background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%);
  color: white;
  border: 2px solid var(--warning);
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--warning);
  color: #1a1a2e;
  padding: 0.25rem 1rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.soon-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--text-muted);
  color: white;
  padding: 0.25rem 1rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.pricing-card.is-soon {
  opacity: 0.7;
  pointer-events: none;
}

.pricing-header {
  text-align: center;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.pricing-card.featured .pricing-header,
.pricing-card.premium .pricing-header {
  border-bottom-color: rgba(255, 255, 255, 0.2);
}

.pricing-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
}

.price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.25rem;
}

.price .amount {
  font-size: 2.5rem;
  font-weight: 700;
}

.price .period {
  font-size: 0.875rem;
  opacity: 0.7;
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--spacing-md);
  flex: 1;
}

.pricing-features li {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) 0;
  font-size: 0.9375rem;
  line-height: 1.4;
}

.pricing-features li.disabled {
  opacity: 0.5;
}

.pricing-features .check {
  color: var(--success);
  font-weight: 700;
  flex-shrink: 0;
}

.pricing-card.featured .check,
.pricing-card.premium .check {
  color: #a7f3d0;
}

.pricing-card .btn {
  width: 100%;
  text-align: center;
  padding: var(--spacing-sm);
  font-weight: 600;
}

.btn-outline {
  background: transparent;
  border: 2px solid var(--primary);
  color: var(--primary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  text-decoration: none;
}

.btn-outline:hover {
  background: var(--primary-light);
}

.btn-white {
  background: white;
  color: var(--primary);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  text-decoration: none;
}

.btn-white:hover {
  background: var(--bg-light);
}

.btn-premium {
  background: linear-gradient(135deg, var(--warning) 0%, #f59e0b 100%);
  color: #1a1a2e;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.25);
}

.btn-premium:hover {
  opacity: 0.9;
}

.btn-disabled {
  background: var(--bg-light);
  color: var(--text-muted);
  border: none;
  border-radius: var(--radius-lg);
  cursor: not-allowed;
}

.pricing-note {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-xs);
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9375rem;
}

.pricing-note .note-icon {
  color: var(--warning);
}

.landing-footer {
  background: #1a1a2e;
  color: white;
  padding: var(--spacing-2xl) 0 var(--spacing-md);
}

.landing-footer .footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-brand .logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.footer-brand .logo .logo-icon {
  background: var(--primary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 0.875rem;
}

.footer-brand .logo .logo-icon.small {
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
}

.footer-brand .logo span:not(.logo-icon) {
  color: white;
  font-weight: 600;
  font-size: 1.125rem;
}

.landing-footer .footer-links {
  display: flex;
  gap: var(--spacing-lg);
}

.landing-footer .footer-links a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color var(--transition-base);
}

.landing-footer .footer-links a:hover {
  color: white;
}

.footer-legal {
  padding-top: var(--spacing-md);
  margin-top: var(--spacing-md);
  text-align: center;
}

.legal-links {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  margin-bottom: var(--spacing-md);
}

.legal-links a {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 0.8125rem;
  transition: color var(--transition-base);
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
  padding-top: var(--spacing-md);
}

.footer-bottom p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
  margin: var(--spacing-xs) 0;
}

@media (max-width: 900px) {
  .pricing-card.featured {
    transform: scale(1);
  }
  
  .pricing-card.featured:hover {
    transform: translateY(-5px);
  }
}

@media (max-width: 768px) {
  .section-title {
    font-size: 1.5rem;
  }
  
  .section-subtitle {
    font-size: 1rem;
    padding: 0 var(--spacing-sm);
  }
  
  .legends-section {
    padding: var(--spacing-2xl) 0;
  }
  
  .legends-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
  
  .legend-card {
    padding: var(--spacing-lg);
  }
  
  .pricing-section {
    padding: var(--spacing-2xl) 0;
  }
  
  .pricing-cards {
    grid-template-columns: 1fr;
    max-width: 400px;
  }
  
  .term-selector {
    gap: var(--spacing-xs);
  }
  
  .term-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 0.875rem;
  }
  
  .landing-footer .footer-content {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }
  
  .legal-links {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.25rem;
  }
  
  .legends-section {
    padding: 3rem 0;
  }
  
  .pricing-section {
    padding: var(--spacing-xl) 0;
  }
  
  .legend-card {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }
  
  .legend-avatar {
    margin: 0 auto;
  }
  
  .legend-quote {
    padding-left: 0;
    text-align: center;
  }
  
  .legend-quote .quote-icon {
    display: none;
  }
  
  .pricing-card {
    padding: var(--spacing-md);
  }
  
  .price .amount {
    font-size: 2rem;
  }
  
  .pricing-features li {
    font-size: 0.875rem;
  }
}
</style>
