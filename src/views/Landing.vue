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
            <a href="/blog/" class="nav-link">Блог</a>
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
      <!-- 1. HERO — захват внимания -->
      <section class="hero">
        <div class="container">
          <div class="hero-grid">
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

      <!-- 2. PROBLEM — резонанс с болью -->
      <section class="problem-section">
        <div class="container">
          <h2 class="section-title">Знакомо?</h2>
          <div class="pain-cards">
            <div class="pain-card">
              <div class="pain-icon"><Frown :size="36" /></div>
              <h3>Не хватает дисциплины</h3>
              <p class="pain-text">Начинаю, бросаю, снова начинаю... Сила воли заканчивается через неделю.</p>
              <div class="solution-arrow"><TrendingUp :size="20" /></div>
              <p class="solution-text">Система делает дисциплину ненужной — маленькие шаги + привычки + AI-напоминания.</p>
            </div>
            <div class="pain-card">
              <div class="pain-icon"><Wallet :size="36" /></div>
              <h3>Хочу расти в доходе</h3>
              <p class="pain-text">Работаю много, но финансового роста нет. Не понимаю, что конкретно делать.</p>
              <div class="solution-arrow"><TrendingUp :size="20" /></div>
              <p class="solution-text">Сфера "Карьера/Деньги" → конкретные цели → ежедневные действия. Рост = система.</p>
            </div>
            <div class="pain-card">
              <div class="pain-icon"><HelpCircle :size="36" /></div>
              <h3>Не знаю, что делать</h3>
              <p class="pain-text">Много идей, но непонятно с чего начать. Ступор и прокрастинация.</p>
              <div class="solution-arrow"><TrendingUp :size="20" /></div>
              <p class="solution-text">AI Mentor анализирует ситуацию и предлагает следующий шаг. Никакого ступора.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. EFFECT 1% — простая идея решения -->
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

      <!-- 4. AI MENTOR — главное УТП (поднято выше!) -->
      <section class="ai-mentor-section">
        <div class="container">
          <div class="mentor-header">
            <div class="mentor-avatar"><Bot :size="48" /></div>
            <h2 class="section-title">AI Mentor — твой проводник в системе 1%</h2>
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
                  <p>Привет! Вижу, что на этой неделе ты запланировал 12 шагов, но выполнил только 4. Похоже на перегрузку. Давай уберём 3 менее важных?</p>
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

      <!-- 5. APP PREVIEW — как это работает -->
      <section class="app-preview-section">
        <div class="container">
          <h2 class="section-title">Посмотри, как это выглядит</h2>
          <p class="section-subtitle">
            Современное веб-приложение с интуитивным интерфейсом
          </p>
          
          <div class="preview-tabs">
            <button 
              v-for="(tab, index) in previewTabs" 
              :key="index"
              class="preview-tab"
              :class="{ active: activePreview === index }"
              @click="activePreview = index"
            >
              {{ tab.icon }} {{ tab.name }}
            </button>
          </div>
          
          <div class="preview-content">
            <div class="preview-mockup">
              <div class="mockup-header">
                <div class="mockup-dots">
                  <span></span><span></span><span></span>
                </div>
                <span class="mockup-title">OnePercent</span>
              </div>
              <div class="mockup-body">
                <div class="mockup-sidebar">
                  <div class="sidebar-item active">📊 Главная</div>
                  <div class="sidebar-item" :class="{ active: activePreview === 0 }">🎯 ССП</div>
                  <div class="sidebar-item" :class="{ active: activePreview === 1 }">🏦 Цели</div>
                  <div class="sidebar-item" :class="{ active: activePreview === 2 }">📅 Планирование</div>
                  <div class="sidebar-item" :class="{ active: activePreview === 3 }">🔥 Привычки</div>
                  <div class="sidebar-item" :class="{ active: activePreview === 4 }">🏆 Достижения</div>
                </div>
                <div class="mockup-content">
                  <div v-if="activePreview === 0" class="preview-screen">
                    <h4>Колесо баланса</h4>
                    <div class="wheel-preview">
                      <div class="wheel-segment" v-for="n in 6" :key="n" :style="{ transform: `rotate(${n * 60}deg)` }"></div>
                    </div>
                    <div class="preview-stats">
                      <div class="stat-item"><span>Средний балл</span><strong>7.2</strong></div>
                      <div class="stat-item"><span>Зона роста</span><strong>Здоровье</strong></div>
                    </div>
                  </div>
                  <div v-else-if="activePreview === 1" class="preview-screen">
                    <h4>Банк целей</h4>
                    <div class="goals-preview">
                      <div class="goal-card">
                        <div class="goal-header">
                          <span class="goal-sphere">💰</span>
                          <span class="goal-title">Накопить на отпуск</span>
                        </div>
                        <div class="goal-progress">
                          <div class="progress-bar"><span style="width: 60%"></span></div>
                          <span class="progress-text">3/5 шагов</span>
                        </div>
                      </div>
                      <div class="goal-card">
                        <div class="goal-header">
                          <span class="goal-sphere">💪</span>
                          <span class="goal-title">Пробежать 10 км</span>
                        </div>
                        <div class="goal-progress">
                          <div class="progress-bar"><span style="width: 40%"></span></div>
                          <span class="progress-text">2/5 шагов</span>
                        </div>
                      </div>
                    </div>
                    <div class="ai-hint">🤖 AI разобьёт цель на шаги</div>
                  </div>
                  <div v-else-if="activePreview === 2" class="preview-screen">
                    <h4>Недельное планирование</h4>
                    <div class="week-preview">
                      <div class="day-tab" v-for="day in ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']" :key="day">{{ day }}</div>
                    </div>
                    <div class="tasks-preview">
                      <div class="task-item"><span class="priority high"></span>Утренняя тренировка</div>
                      <div class="task-item"><span class="priority med"></span>Работа над проектом</div>
                      <div class="task-item completed"><span class="priority low"></span>Чтение 30 минут</div>
                    </div>
                  </div>
                  <div v-else-if="activePreview === 3" class="preview-screen">
                    <h4>Мои привычки</h4>
                    <div class="habits-preview">
                      <div class="habit-item"><span class="habit-icon">🏃</span>Утренняя зарядка<span class="streak">🔥 12 дней</span></div>
                      <div class="habit-item"><span class="habit-icon">📚</span>Чтение<span class="streak">🔥 8 дней</span></div>
                      <div class="habit-item"><span class="habit-icon">💧</span>Вода 2л<span class="streak">🔥 5 дней</span></div>
                    </div>
                    <div class="xp-bar"><span style="width: 65%"></span></div>
                    <p class="xp-text">+45 XP сегодня</p>
                  </div>
                  <div v-else class="preview-screen">
                    <h4>Достижения</h4>
                    <div class="badges-preview">
                      <div class="badge unlocked">🥇<span>Первые шаги</span></div>
                      <div class="badge unlocked">🔥<span>7 дней подряд</span></div>
                      <div class="badge locked">🏆<span>30 дней</span></div>
                      <div class="badge locked">💎<span>Мастер</span></div>
                    </div>
                    <div class="progress-text">Разблокировано: 8 / 19</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="preview-description">
              <h3>{{ previewTabs[activePreview].title }}</h3>
              <p>{{ previewTabs[activePreview].description }}</p>
              <ul class="preview-features">
                <li v-for="(feature, i) in previewTabs[activePreview].features" :key="i">{{ feature }}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. LEGENDS — социальное доказательство (известные люди) -->
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

      <!-- 7. TESTIMONIALS — отзывы -->
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
              <span class="benefit-icon"><Target :size="20" /></span>
              <span>Чёткий фокус без выгорания</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon"><RefreshCw :size="20" /></span>
              <span>Естественная дисциплина</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon"><Compass :size="20" /></span>
              <span>Понимание своих приоритетов</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon"><Sprout :size="20" /></span>
              <span>Рост без стресса</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon"><Brain :size="20" /></span>
              <span>Спокойная уверенность</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 9. PRICING — тарифы (раньше, пока горячий) -->
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
                <router-link 
                  v-if="!tariff.is_soon"
                  to="/auth/register" 
                  :class="['btn', tariff.code === 'free' ? 'btn-outline' : (tariff.is_popular ? 'btn-white' : 'btn-premium')]"
                >
                  {{ tariff.code === 'free' ? 'Начать бесплатно' : 'Попробовать' }}
                </router-link>
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
                <router-link to="/auth/register" class="btn btn-outline">
                  Начать бесплатно
                </router-link>
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
                <router-link to="/auth/register" class="btn btn-white">
                  Попробовать Pro
                </router-link>
              </div>
            </template>
          </div>
          
          <p class="pricing-note">
            <Lightbulb :size="18" class="note-icon" /> Начни бесплатно и переходи на Pro, когда почувствуешь, что готов к следующему уровню
          </p>
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
import { useSubscriptionStore } from '@/stores/subscription'
import { checkAuth } from '@/services/api'
import { 
  Target, 
  Calendar, 
  Flame, 
  Trophy, 
  Users, 
  BookOpen, 
  MessageCircle,
  Check,
  X,
  Lightbulb,
  RefreshCw,
  Compass,
  Sprout,
  Brain,
  Frown,
  Wallet,
  HelpCircle,
  Bot,
  TrendingUp,
  BarChart3,
  Zap,
  Heart,
  Shield,
  Rocket,
  Star,
  Eye,
  Layout,
  ClipboardList,
  Layers,
  Play,
  PenTool,
  Quote,
  Feather,
  BookMarked
} from 'lucide-vue-next'

const appStore = useAppStore()
const subscriptionStore = useSubscriptionStore()
const isAuthenticated = computed(() => appStore.isAuthenticated)

const pricingTariffs = computed(() => subscriptionStore.tariffs)
const pricingTerms = computed(() => subscriptionStore.terms)
const tariffsLoading = computed(() => subscriptionStore.tariffsLoading)

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

const days = ref(90)
const isScrolled = ref(false)
const activePreview = ref(0)

const previewTabs = [
  {
    icon: '🎯',
    name: 'ССП',
    title: 'Колесо баланса (ССП)',
    description: 'Оцени 6 ключевых сфер жизни по шкале от 1 до 10. Увидь общую картину и найди зоны, которые тянут вниз.',
    features: [
      'Интерактивная диаграмма баланса',
      'История оценок и динамика',
      'Рефлексия по каждой сфере',
      'Автоматические рекомендации целей'
    ]
  },
  {
    icon: '🏦',
    name: 'Цели',
    title: 'Банк целей',
    description: 'Ставь цели по SMART, разбивай на шаги с помощью AI, отслеживай прогресс. Все цели привязаны к сферам жизни.',
    features: [
      'AI-декомпозиция целей на шаги',
      'Привязка к сферам жизни',
      'Визуальные карточки с прогрессом',
      'Чеклисты и мини-дневник цели'
    ]
  },
  {
    icon: '📅',
    name: 'Планирование',
    title: 'Недельный планировщик',
    description: 'Распредели шаги по дням недели. Визуальный календарь с приоритетами и временными оценками.',
    features: [
      'Drag & drop шагов по дням',
      'Цветовые приоритеты (критично / желательно / внимание)',
      'Оценка времени на каждый шаг',
      'Статистика выполнения'
    ]
  },
  {
    icon: '🔥',
    name: 'Привычки',
    title: 'Трекер привычек',
    description: 'Формируй полезные привычки и отслеживай серии выполнения. Гибкое расписание и XP за каждый день.',
    features: [
      'Серии выполнения (streaks)',
      'XP за каждую привычку (1-100)',
      'Гибкое расписание (ежедневно / будни / выходные)',
      '4 режима геймификации'
    ]
  },
  {
    icon: '🏆',
    name: 'Достижения',
    title: 'Система достижений',
    description: '19 бейджей в 4 категориях: Серии, Выполнение, Объём, Разнообразие. Мотивация через прогресс.',
    features: [
      'Визуальные бейджи с прогрессом',
      'Уведомления о новых достижениях',
      'Статистика профиля',
      'Вишлист наград за XP'
    ]
  }
]

const multiplier = computed(() => {
  return Math.pow(1.01, days.value).toFixed(2)
})

function handleScroll() {
  isScrolled.value = window.scrollY > 50
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll)
  
  subscriptionStore.loadTariffs(true)
  
  if (!appStore.isAuthenticated) {
    try {
      const userData = await checkAuth()
      if (userData) {
        appStore.setUser(userData)
      }
    } catch (e) {
    }
  }
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

.logo h1,
.logo-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a2e;
  display: block;
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
  transition: opacity 0.15s ease;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.btn:hover {
  opacity: 0.85;
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

.btn-white {
  background: white;
  color: #6366f1;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn-white:hover {
  opacity: 0.9;
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
  margin-bottom: 2.5rem;
}

.pain-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.pain-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
}

.pain-icon {
  margin-bottom: 1rem;
  color: #a5b4fc;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pain-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: white;
}

.pain-text {
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.solution-arrow {
  color: #22c55e;
  margin: 0.5rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pain-card .solution-text {
  font-size: 0.9375rem;
  color: #a5b4fc;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .pain-cards {
    grid-template-columns: 1fr;
  }
  
  .pain-card {
    padding: 1.5rem;
  }
  
  .pain-card h3 {
    font-size: 1.125rem;
  }
  
  .pain-text,
  .pain-card .solution-text {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .pain-card {
    padding: 1.25rem;
  }
  
  
  .pain-card h3 {
    font-size: 1rem;
  }
  
  .pain-text,
  .pain-card .solution-text {
    font-size: 0.8125rem;
    line-height: 1.5;
  }
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
  align-items: center;
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
  align-items: center;
}

.mentor-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: white;
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
  align-items: center;
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

@media (max-width: 768px) {
  .mentor-benefits {
    grid-template-columns: 1fr;
  }
  
  .mentor-tagline {
    font-size: 1rem;
  }
  
  .mentor-chat-demo {
    max-width: 100%;
    padding: 0 1rem;
  }
}

@media (max-width: 480px) {
  .ai-mentor-section {
    padding: 3rem 0;
  }
  
  .mentor-avatar {
    font-size: 3rem;
  }
  
  .ai-mentor-section .section-title {
    font-size: 1.25rem;
  }
  
  .mentor-tagline {
    font-size: 0.875rem;
  }
  
  .mentor-card {
    padding: 1rem;
  }
  
  .mentor-icon {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  .mentor-card h3 {
    font-size: 1rem;
  }
  
  .mentor-card p {
    font-size: 0.8125rem;
  }
  
  .chat-window {
    border-radius: 12px;
  }
  
  .chat-messages {
    padding: 0.75rem;
  }
  
  .message {
    max-width: 90%;
    padding: 0.625rem 0.75rem;
    font-size: 0.8125rem;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
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
  margin-bottom: 1rem;
  color: #6366f1;
  display: flex;
  align-items: center;
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

.journey-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.journey-card {
  position: relative;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s;
}

.journey-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.1);
  border-color: #a5b4fc;
}

.journey-icon {
  margin-bottom: 0.5rem;
  color: #6366f1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.journey-num {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #a5b4fc;
}

.journey-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1a1a2e;
}

.journey-tool {
  font-size: 0.8125rem;
  color: #6366f1;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.journey-benefit {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .journey-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .journey-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .journey-card {
    padding: 1.25rem;
  }
  
  .journey-icon {
    font-size: 1.5rem;
  }
  
  .journey-card h3 {
    font-size: 1rem;
  }
  
  .journey-tool,
  .journey-benefit {
    font-size: 0.75rem;
  }
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
  margin-bottom: 1rem;
  color: #6366f1;
  display: flex;
  justify-content: center;
  align-items: center;
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

.app-preview-section {
  padding: 5rem 0;
  background: linear-gradient(180deg, #fafafa 0%, #f0f0ff 100%);
}

.preview-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.preview-tab {
  padding: 0.75rem 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.preview-tab:hover {
  border-color: #a5b4fc;
}

.preview-tab.active {
  border-color: #6366f1;
  background: #6366f1;
  color: white;
}

.preview-content {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 3rem;
  align-items: center;
}

.preview-mockup {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.mockup-header {
  display: flex;
  align-items: center;
  gap: 1rem;
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
  background: #d1d5db;
}

.mockup-dots span:first-child { background: #ef4444; }
.mockup-dots span:nth-child(2) { background: #f59e0b; }
.mockup-dots span:last-child { background: #22c55e; }

.mockup-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
}

.mockup-body {
  display: flex;
  min-height: 320px;
}

.mockup-sidebar {
  width: 140px;
  background: #f9fafb;
  border-right: 1px solid #e5e7eb;
  padding: 1rem 0;
}

.sidebar-item {
  padding: 0.625rem 1rem;
  font-size: 0.8125rem;
  color: #6b7280;
  cursor: pointer;
}

.sidebar-item.active {
  background: #eef2ff;
  color: #6366f1;
  font-weight: 500;
}

.mockup-content {
  flex: 1;
  padding: 1.5rem;
}

.preview-screen h4 {
  margin: 0 0 1rem;
  font-size: 1rem;
  color: #1a1a2e;
}

.wheel-preview {
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  position: relative;
  border-radius: 50%;
  background: conic-gradient(
    #6366f1 0deg 60deg,
    #8b5cf6 60deg 120deg,
    #a78bfa 120deg 180deg,
    #c4b5fd 180deg 240deg,
    #ddd6fe 240deg 300deg,
    #ede9fe 300deg 360deg
  );
}

.preview-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-item span {
  display: block;
  font-size: 0.75rem;
  color: #9ca3af;
}

.stat-item strong {
  font-size: 1.125rem;
  color: #1a1a2e;
}

.week-preview {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.day-tab {
  flex: 1;
  padding: 0.5rem;
  text-align: center;
  font-size: 0.75rem;
  background: #f3f4f6;
  border-radius: 6px;
}

.day-tab:nth-child(7) {
  background: #6366f1;
  color: white;
}

.tasks-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 0.8125rem;
}

.task-item.completed {
  opacity: 0.5;
  text-decoration: line-through;
}

.priority {
  width: 4px;
  height: 20px;
  border-radius: 2px;
}

.priority.high { background: #ef4444; }
.priority.med { background: #f59e0b; }
.priority.low { background: #3b82f6; }

.goals-preview {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.goal-card {
  background: #f9fafb;
  border-radius: 8px;
  padding: 0.75rem;
}

.goal-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.goal-sphere {
  font-size: 1rem;
}

.goal-title {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #1a1a2e;
}

.goal-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.goal-progress .progress-bar {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.goal-progress .progress-bar span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #a855f7);
  border-radius: 3px;
}

.goal-progress .progress-text {
  font-size: 0.7rem;
  color: #6b7280;
  white-space: nowrap;
}

.ai-hint {
  font-size: 0.75rem;
  color: #7c3aed;
  text-align: center;
  padding: 0.5rem;
  background: rgba(124, 58, 237, 0.08);
  border-radius: 6px;
}

.habits-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.habit-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 0.8125rem;
}

.habit-icon {
  font-size: 1rem;
}

.streak {
  margin-left: auto;
  font-size: 0.75rem;
  color: #f59e0b;
}

.xp-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.xp-bar span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 4px;
}

.xp-text {
  text-align: center;
  font-size: 0.875rem;
  color: #6366f1;
  font-weight: 600;
}

.badges-preview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 10px;
  font-size: 1.5rem;
}

.badge span {
  font-size: 0.6875rem;
  color: #6b7280;
}

.badge.locked {
  opacity: 0.4;
}

.badge.unlocked {
  background: #eef2ff;
}

.progress-text {
  text-align: center;
  font-size: 0.8125rem;
  color: #6b7280;
}

.preview-description h3 {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
  color: #1a1a2e;
}

.preview-description > p {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.preview-features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.preview-features li {
  position: relative;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
  color: #4b5563;
}

.preview-features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #6366f1;
  font-weight: 600;
}

@media (max-width: 900px) {
  .preview-content {
    grid-template-columns: 1fr;
  }
  
  .mockup-sidebar {
    display: none;
  }
  
  .preview-description {
    text-align: center;
  }
  
  .preview-features {
    text-align: left;
    max-width: 300px;
    margin: 0 auto;
  }
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
  color: #6366f1;
  display: flex;
  align-items: center;
}

.club-section {
  padding: 5rem 0;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.club-header {
  text-align: center;
  margin-bottom: 3rem;
}

.club-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.club-benefits {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.club-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  transition: all 0.3s;
}

.club-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(99, 102, 241, 0.15);
  border-color: #a5b4fc;
}

.club-icon {
  margin-bottom: 1rem;
  color: #6366f1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.club-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1a1a2e;
}

.club-card p {
  font-size: 0.9375rem;
  color: #6b7280;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .club-benefits {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .club-section {
    padding: 3rem 0;
  }
  
  .club-benefits {
    grid-template-columns: 1fr;
  }
  
  .club-card {
    padding: 1.5rem;
  }
  
  .club-icon {
    font-size: 2rem;
  }
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

@media (max-width: 900px) {
  .legends-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .legends-section {
    padding: 3rem 0;
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
}

.pricing-section {
  padding: 5rem 0;
  background: white;
}

.term-selector {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.term-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 1.25rem;
  background: #f3f4f6;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 90px;
}

.term-btn:hover {
  border-color: #d1d5db;
}

.term-btn.active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

.term-name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: #1f2937;
}

.term-discount {
  font-size: 0.8125rem;
  color: #10b981;
  font-weight: 600;
}

.hit-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 6px;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
}

.tariff-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1rem;
  line-height: 1.4;
}

.savings {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #10b981;
  font-weight: 600;
}

.pricing-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1100px;
  margin: 0 auto 2rem;
}

.pricing-card {
  background: #f9fafb;
  border-radius: 20px;
  padding: 2rem;
  border: 2px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
}

.pricing-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
}

.pricing-card.featured {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
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
  border: 2px solid #fbbf24;
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #fbbf24;
  color: #1a1a2e;
  padding: 0.25rem 1rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.soon-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #94a3b8;
  color: #ffffff;
  padding: 0.25rem 1rem;
  border-radius: 50px;
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
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.pricing-card.featured .pricing-header,
.pricing-card.premium .pricing-header {
  border-bottom-color: rgba(255, 255, 255, 0.2);
}

.pricing-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
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
  margin: 0 0 1.5rem;
  flex: 1;
}

.pricing-features li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0;
  font-size: 0.9375rem;
  line-height: 1.4;
}

.pricing-features li.disabled {
  opacity: 0.5;
}

.pricing-features .check {
  color: #22c55e;
  font-weight: 700;
}

.pricing-card.featured .check,
.pricing-card.premium .check {
  color: #a7f3d0;
}

.pricing-features .cross {
  color: #9ca3af;
}

.pricing-card .btn {
  width: 100%;
  text-align: center;
  padding: 1rem;
  font-weight: 600;
}

.btn-outline {
  background: transparent;
  border: 2px solid #6366f1;
  color: #6366f1;
  border-radius: 12px;
  cursor: pointer;
  transition: opacity 0.15s ease;
  text-decoration: none;
}

.btn-outline:hover {
  opacity: 0.85;
}

.btn-premium {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #1a1a2e;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: opacity 0.15s ease;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.25);
}

.btn-premium:hover {
  opacity: 0.9;
}

.pricing-note {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.9375rem;
}

.pricing-note .note-icon {
  color: #fbbf24;
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
  .pricing-cards {
    grid-template-columns: 1fr;
    max-width: 400px;
  }
}

@media (max-width: 480px) {
  .pricing-section {
    padding: 3rem 0;
  }
  
  .pricing-card {
    padding: 1.5rem;
  }
  
  .price .amount {
    font-size: 2rem;
  }
  
  .pricing-features li {
    font-size: 0.875rem;
  }
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

.footer-legal {
  padding-top: 1rem;
  margin-top: 1rem;
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

.footer-legal {
  margin-top: 0.75rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.footer-legal a {
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-legal a:hover {
  color: rgba(255, 255, 255, 0.8);
}

.footer-legal .separator {
  color: rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .header-nav .nav-link {
    display: none;
  }
  
  .header-nav .btn {
    padding: 0.5rem 0.875rem;
    font-size: 0.8125rem;
  }
  
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
  
  .footer-content {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
}
</style>
