<template>
  <div class="landing-v6">
    <header class="header" :class="{ scrolled: isScrolled }">
      <div class="header-container">
        <div class="logo">
          <div class="logo-icon">1%</div>
          <span class="logo-text">OnePercent</span>
        </div>

        <nav class="nav-desktop">
          <a href="#how-it-works" class="nav-link">Как это работает</a>
          <a href="#pricing" class="nav-link">Тарифы</a>
          <a href="/blog/" class="nav-link">Блог</a>
        </nav>

        <div class="header-actions">
          <router-link to="/auth/login" class="login-link">Войти</router-link>
          <a href="https://t.me/onepercent_bot" class="btn-primary">Начать</a>
        </div>

        <button class="mobile-toggle" @click="mobileMenuOpen = !mobileMenuOpen">
          <component :is="mobileMenuOpen ? XIcon : MenuIcon" />
        </button>
      </div>

      <div v-if="mobileMenuOpen" class="mobile-menu">
        <a href="#how-it-works" class="mobile-link" @click="mobileMenuOpen = false">Как это работает</a>
        <a href="#pricing" class="mobile-link" @click="mobileMenuOpen = false">Тарифы</a>
        <a href="/blog/" class="mobile-link" @click="mobileMenuOpen = false">Блог</a>
        <div class="mobile-divider"></div>
        <router-link to="/auth/login" class="mobile-link">Войти</router-link>
        <a href="https://t.me/onepercent_bot" class="mobile-btn-primary">Начать</a>
      </div>
    </header>

    <main>
      <section class="hero">
        <div class="hero-container">
          <div class="hero-badge">Личный AI наставник</div>
          
          <h1 class="hero-title">
            Системный рост в жизни <br>
            <span class="hero-highlight">через простые действия</span>
          </h1>
          
          <p class="hero-description">
            Система, которая делает развитие предсказуемым. <br class="desktop-only">
            Стань сильнее в 38 раз за один год.
          </p>
          
          <div class="hero-actions">
            <a href="https://t.me/onepercent_bot" class="btn-hero">
              Сделать +1% уже сегодня
            </a>
            <div class="social-proof">
              <div class="avatars">
                <div v-for="i in 3" :key="i" class="avatar">
                  <img :src="`https://picsum.photos/seed/${i + 45}/100/100`" alt="User">
                </div>
              </div>
              <span>2,847+ человек уже растут</span>
            </div>
          </div>

          <div id="method" class="effect-card">
            <div class="effect-header">
              <div>
                <h3 class="effect-title">Эффект 1%</h3>
                <p class="effect-subtitle">Сложные проценты в жизни</p>
              </div>
              <div class="effect-multiplier">x{{ multiplier }}</div>
            </div>
            
            <input 
              type="range" 
              min="30" 
              max="365" 
              v-model.number="days"
              class="modern-range"
            >
            
            <div class="effect-labels">
              <span>{{ days }} дней усилий</span>
              <span>Результат</span>
            </div>
            
            <div class="effect-description">
              <p>"{{ effectDescription }}"</p>
            </div>
          </div>
        </div>
      </section>

      <section class="situations-section">
        <div class="situations-container">
          <h2 class="situations-title">Знакомые ситуации?</h2>
          <div class="situations-grid">
            <div class="situation-card">
              <div class="situation-icon icon-blue">
                <Link class="icon" />
              </div>
              <p class="situation-text">Если хочешь двигаться вперед, но не понимаешь — куда</p>
            </div>
            <div class="situation-card">
              <div class="situation-icon icon-orange">
                <CircleDot class="icon" />
              </div>
              <p class="situation-text">Когда целей много, а ясности мало</p>
            </div>
            <div class="situation-card">
              <div class="situation-icon icon-pink">
                <LayoutGrid class="icon" />
              </div>
              <p class="situation-text">Навести порядок в целях, задачах и деньгах</p>
            </div>
          </div>
        </div>
      </section>

      <section class="math-section">
        <div class="math-container">
          <div class="math-header">
            <h2 class="section-title">Математика успеха</h2>
            <p class="section-subtitle">
              Улучшая себя всего на 1% каждый день, к концу года вы станете в 37 раз эффективнее. 
              Это сила сложного процента, примененная к привычкам.
            </p>
          </div>

          <div class="math-cards">
            <div class="math-card linear">
              <p class="card-label">Линейное мышление</p>
              <div class="formula">1.00<span class="exp">365</span></div>
              <p class="result">= 1.00</p>
              <p class="card-desc">
                Делая одно и то же каждый день, вы остаетесь на том же месте. Отсутствие прогресса — это регресс.
              </p>
            </div>

            <div class="math-card growth">
              <p class="card-label">Метод OnePercent</p>
              <div class="formula">1.01<span class="exp">365</span></div>
              <p class="result">= 37.78</p>
              <p class="card-desc">
                Маленькие ежедневные улучшения накапливаются, создавая лавину положительных изменений.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" class="features-section">
        <div class="features-container">
          <div class="features-header">
            <div class="features-badge">
              <Sparkles class="icon-sm" />
              <span>Как это работает</span>
            </div>
            <h2 class="section-title-lg">
              От хаоса к порядку <br> 
              <span class="gradient-text">за 6 простых шагов</span>
            </h2>
            <p class="section-subtitle">
              Мы убрали всё лишнее. Оставили только научный подход, дофаминовую подпитку и четкие алгоритмы.
            </p>
          </div>

          <div class="steps-list">
            <div 
              v-for="(step, index) in steps" 
              :key="step.id" 
              class="step-row"
              :class="{ reversed: index % 2 !== 0 }"
            >
              <div class="step-text">
                <div class="step-subtitle-badge">{{ step.subtitle }}</div>
                <h3 class="step-title">{{ step.title }}</h3>
                <p class="step-description">{{ step.description }}</p>
                <div class="step-footer">
                  <div class="step-icon" :class="step.colorClass">
                    <component :is="step.icon" class="icon" />
                  </div>
                  <div class="step-brand">OnePercent System</div>
                </div>
              </div>

              <div class="step-visual">
                <div v-if="step.id === 1" class="visual-wrapper" :class="step.gradientClass">
                  <WheelBalanceMockup />
                </div>
                <div v-else class="visual-wrapper" :class="step.gradientClass">
                  <div class="visual-card">
                    <div class="browser-header">
                      <div class="dots">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                      </div>
                      <div class="browser-title">OnePercent AI</div>
                    </div>

                    <div class="visual-content">
                      <div class="visual-bg" :class="step.gradientClass"></div>

                      <div v-if="step.id === 2" class="chat-preview">
                        <div class="chat-message bot">
                          <div class="chat-avatar bot-avatar">
                            <Activity class="icon-sm" />
                          </div>
                          <div class="chat-bubble">Твой уровень энергии низкий. Давай поставим цель по здоровью?</div>
                        </div>
                        <div class="chat-message user">
                          <div class="chat-bubble user-bubble">Да, я хочу быть в форме к лету.</div>
                          <div class="chat-avatar user-avatar">
                            <img src="https://picsum.photos/seed/user/100/100" alt="Me">
                          </div>
                        </div>
                        <div class="chat-message bot">
                          <div class="chat-avatar bot-avatar">
                            <Target class="icon-sm" />
                          </div>
                          <div class="chat-bubble goal-bubble">
                            <div class="goal-accent"></div>
                            <p class="goal-title">Цель сформирована:</p>
                            <p>"Снизить % жира до 18% и пробежать 10км до 1 июня"</p>
                          </div>
                        </div>
                      </div>

                      <div v-else-if="step.id === 3" class="plan-preview">
                        <div class="plan-card">
                          <div class="plan-header">
                            <span class="plan-title">План: Июньский забег</span>
                            <span class="plan-status">Активен</span>
                          </div>
                          <div class="plan-timeline">
                            <div class="plan-item active">
                              <div class="plan-dot active"></div>
                              <div class="plan-content">
                                <p class="plan-week">Неделя 1</p>
                                <p class="plan-text">Адаптация и экипировка</p>
                              </div>
                            </div>
                            <div class="plan-item">
                              <div class="plan-dot"></div>
                              <div class="plan-content">
                                <p class="plan-week">Неделя 2</p>
                                <p class="plan-text">Первые интервальные тренировки</p>
                              </div>
                            </div>
                            <div class="plan-item">
                              <div class="plan-dot"></div>
                              <div class="plan-content">
                                <p class="plan-week">Неделя 3-4</p>
                                <p class="plan-text">Увеличение объема до 15км/нед</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div v-else-if="step.id === 4" class="focus-preview">
                        <div class="focus-time">
                          <div class="time-badge">Сегодня</div>
                          <div class="time-display">08:00 AM</div>
                        </div>
                        <div class="focus-card">
                          <div class="focus-check">
                            <CheckSquare class="icon-sm" />
                          </div>
                          <p class="focus-label">Главный фокус</p>
                          <h4 class="focus-title">Медленный бег</h4>
                          <p class="focus-desc">Зона 2 пульса, 30 минут. Не ускоряться.</p>
                          <div class="focus-tags">
                            <span class="tag-xp">+150 XP</span>
                            <span class="tag-category">Здоровье</span>
                          </div>
                        </div>
                      </div>

                      <div v-else-if="step.id === 5" class="habits-preview-v2">
                        <div class="habits-header-v2">
                          <div class="habits-icon-v2">
                            <Repeat class="icon-sm" />
                          </div>
                          <span class="habits-title-v2">Трекер привычек</span>
                          <div class="habits-today-v2">
                            <span class="today-dot"></span>
                            <span>Сегодня</span>
                          </div>
                        </div>
                        <div class="habits-list-v2">
                          <div class="habit-card-v2">
                            <div class="habit-row">
                              <div class="habit-icon-v2 habit-orange">
                                <Target class="icon-xs" />
                              </div>
                              <span class="habit-name-v2">Хобби 2ч/нед</span>
                              <span class="habit-xp-v2">+20 XP</span>
                            </div>
                            <div class="habit-days-v2">
                              <span class="day-v2">П</span>
                              <span class="day-v2 done">В</span>
                              <span class="day-v2">С</span>
                              <span class="day-v2 done">Ч</span>
                              <span class="day-v2">П</span>
                              <span class="day-v2 current">С</span>
                              <span class="day-v2">В</span>
                              <span class="day-v2 more">...</span>
                            </div>
                          </div>
                          <div class="habit-card-v2">
                            <div class="habit-row">
                              <div class="habit-icon-v2 habit-green-v2">
                                <Check class="icon-xs" />
                              </div>
                              <span class="habit-name-v2">Финансы</span>
                              <span class="habit-xp-v2">+15 XP</span>
                            </div>
                            <div class="habit-days-v2">
                              <span class="day-v2">П</span>
                              <span class="day-v2 done">В</span>
                              <span class="day-v2 done">С</span>
                              <span class="day-v2">Ч</span>
                              <span class="day-v2 done">П</span>
                              <span class="day-v2 current">С</span>
                              <span class="day-v2">В</span>
                            </div>
                          </div>
                          <div class="habit-card-v2">
                            <div class="habit-row">
                              <div class="habit-icon-v2 habit-pink-v2">
                                <Activity class="icon-xs" />
                              </div>
                              <span class="habit-name-v2">Ужин с семьёй</span>
                              <span class="habit-xp-v2">+20 XP</span>
                            </div>
                            <div class="habit-days-v2">
                              <span class="day-v2 done">П</span>
                              <span class="day-v2 done">В</span>
                              <span class="day-v2 done">С</span>
                              <span class="day-v2 done">Ч</span>
                              <span class="day-v2 done">П</span>
                              <span class="day-v2 current">С</span>
                              <span class="day-v2">В</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div v-else-if="step.id === 6" class="xp-preview-v3">
                        <div class="xp-status-bar-v3">
                          <Sparkles class="icon-xs" />
                          <span>Прошло 3 месяца. 2450 XP заработано.</span>
                        </div>
                        <div class="xp-balance-card-v3">
                          <p class="xp-balance-label-v3">ТВОЙ БАЛАНС</p>
                          <p class="xp-balance-value-v3">2450 <span>XP</span></p>
                        </div>
                        <div class="xp-mentor-tip-v3">
                          <div class="mentor-avatar-v3">
                            <MessageCircle class="icon-xs" />
                          </div>
                          <p><span class="mentor-name">AI Ментор:</span> Максим, хватает на новую игру! Это не противоречит цели "Спорт". Отдых важен.</p>
                        </div>
                        <div class="xp-rewards-list-v3">
                          <div class="reward-row-v3">
                            <div class="reward-check-v3 received">
                              <Check class="icon-xs" />
                            </div>
                            <div class="reward-info-v3">
                              <span class="reward-name-v3">Вечер кино</span>
                              <span class="reward-cost-v3">500 XP</span>
                            </div>
                            <span class="reward-status-v3">Получено</span>
                          </div>
                          <div class="reward-row-v3 highlighted">
                            <div class="reward-check-v3 available">
                              <Zap class="icon-xs" />
                            </div>
                            <div class="reward-info-v3">
                              <span class="reward-name-v3">Новая игра</span>
                              <span class="reward-cost-v3">1500 XP</span>
                            </div>
                            <button class="reward-btn-v3">Доступно!</button>
                          </div>
                          <div class="reward-row-v3">
                            <div class="reward-check-v3 pending">
                              <Map class="icon-xs" />
                            </div>
                            <div class="reward-info-v3">
                              <span class="reward-name-v3">Поездка</span>
                              <span class="reward-cost-v3">5000 XP</span>
                            </div>
                            <span class="reward-percent-v3">49%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mentor-section">
        <div class="mentor-glow"></div>
        <div class="mentor-container">
          <div class="mentor-banner">
            <p>
              <span class="banner-problem">Проблема:</span> 68% бросают после 3 месяцев. 
              <span class="banner-divider">|</span>
              <span class="banner-solution">Решение:</span> AI Ментор поддерживает каждый день.
            </p>
          </div>

          <div class="mentor-grid">
            <div class="mentor-content">
              <div class="mentor-badge">
                <MessageCircle class="icon-sm" />
                <span>Всегда рядом</span>
              </div>

              <h2 class="mentor-title">
                Персональный коуч <br> на связи 
                <span class="gradient-text">24/7</span>
              </h2>
              
              <p class="mentor-description">
                AI анализирует твои цели, рефлексии и паттерны. Задаёт правильные вопросы, чтобы ты сам нашёл ответы, когда мотивация на нуле.
              </p>

              <div class="mentor-roles">
                <div class="role-line"></div>

                <div class="role-item">
                  <div class="role-icon">
                    <Mic class="icon" />
                  </div>
                  <div class="role-text">
                    <h4>Интервьюер</h4>
                    <p class="role-period">Первая неделя</p>
                    <p class="role-desc">Задает глубокие вопросы, собирает контекст вашей жизни и определяет истинные ценности.</p>
                  </div>
                </div>

                <div class="role-item">
                  <div class="role-icon">
                    <Map class="icon" />
                  </div>
                  <div class="role-text">
                    <h4>Стратег</h4>
                    <p class="role-period">Первый месяц</p>
                    <p class="role-desc">Помогает оцифровать цели, составить реалистичный план и найти время в календаре.</p>
                  </div>
                </div>

                <div class="role-item active">
                  <div class="role-icon active">
                    <Zap class="icon" />
                  </div>
                  <div class="role-text">
                    <h4>Коуч 1%</h4>
                    <p class="role-period">2+ месяц</p>
                    <p class="role-desc">Поддерживает дисциплину, анализирует срывы и помогает вернуться в строй без чувства вины.</p>
                  </div>
                </div>
              </div>

              <div class="mentor-quote desktop-only">
                <div class="quote-mark">"</div>
                <div>
                  <p class="quote-text">
                    AI в Telegram — причина, почему не бросил после 2 месяцев. 'Ты на серии 45 дней, неужели обнулишь?' — работает лучше любого таймера.
                  </p>
                  <div class="quote-author">
                    <div class="author-avatar">
                      <img src="https://picsum.photos/seed/sergey/100/100" alt="Avatar">
                    </div>
                    <p class="author-name">Сергей, e-commerce</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="mentor-phone-wrapper">
              <div class="phone-float">
                <div class="phone-shadow"></div>
                <div class="phone-frame">
                  <div class="phone-glare"></div>
                  <div class="phone-notch"></div>

                  <div class="telegram-header">
                    <div class="tg-avatar">
                      <img src="https://api.dicebear.com/7.x/bottts/svg?seed=OnePercent" alt="AI">
                    </div>
                    <div class="tg-info">
                      <h4>AI Ментор 1%</h4>
                      <p>bot</p>
                    </div>
                  </div>

                  <div class="telegram-chat">
                    <div class="chat-pattern"></div>
                    <div class="tg-message">
                      <p class="tg-greeting">Доброе утро, Максим! <br> Сегодня — вторник.</p>
                      <p class="tg-section-title">Задачи на сегодня:</p>
                      <ul class="tg-tasks">
                        <li><span>🎨</span> Первая проба хобби [→ Хобби 2ч в неделю]</li>
                        <li><span class="heart">❤</span> Вечер с семьёй [→ Вечер с семьёй 3х в неделю]</li>
                      </ul>
                      
                      <p class="tg-section-title">Привычки:</p>
                      <ul class="tg-habits">
                        <li><div class="habit-dot"></div> Хобби 2ч/неделю</li>
                        <li><div class="habit-dot"></div> Финансовый обзор</li>
                        <li><div class="habit-dot"></div> Ужин с семьёй</li>
                      </ul>

                      <p class="tg-note">
                        Обрати внимание: у тебя есть просроченная задача «Выбрать хобби на неделю» — возможно, стоит начать с неё.
                      </p>

                      <div class="tg-time">08:00</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mentor-quote mobile-only">
                <p class="quote-text">
                  "AI в Telegram — причина, почему не бросил после 2 месяцев. 'Ты на серии 45 дней, неужели обнулишь?'"
                </p>
                <p class="author-name">— Сергей, e-commerce</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="cta-section">
        <div class="cta-bg">
          <div class="cta-blob1"></div>
          <div class="cta-blob2"></div>
          <div class="cta-noise"></div>
        </div>

        <div class="cta-container">
          <h2 class="cta-title">
            Ты прошёл путь <br class="mobile-only"> от диагностики до результата
          </h2>

          <div class="cta-checklist">
            <div v-for="(item, i) in ctaItems" :key="i" class="cta-item">
              <div class="cta-check">
                <Check class="icon" />
              </div>
              <span>{{ item }}</span>
            </div>
          </div>

          <div class="cta-actions">
            <a href="https://t.me/onepercent_bot" class="btn-cta">
              Начать бесплатно — диагностика за 2 минуты
              <ArrowRight class="icon" />
            </a>

            <div class="cta-guarantees">
              <div class="guarantee">
                <Check class="icon-sm" />
                <span>Без банковской карты</span>
              </div>
              <div class="guarantee">
                <Check class="icon-sm" />
                <span>Отменить можно в 1 клик</span>
              </div>
            </div>

            <div class="cta-counter">
              <span class="fire">🔥</span>
              <span><strong>2 847</strong> человек уже растут на 1% каждый день</span>
            </div>
          </div>
        </div>
      </section>

      <section class="testimonials-section">
        <div class="testimonials-container">
          <div class="testimonials-header">
            <h2 class="section-title">Проверено временем</h2>
            <p class="section-subtitle">
              Величайшие умы истории использовали системный подход к развитию задолго до нас
            </p>
          </div>

          <div class="testimonials-grid">
            <div v-for="(person, idx) in legends" :key="idx" class="legend-card">
              <div class="legend-icon">
                <component :is="person.icon" class="icon-lg" />
              </div>
              <div class="legend-content">
                <h3>{{ person.name }}</h3>
                <p class="legend-role">{{ person.role }}</p>
                <div class="legend-quote">
                  <Quote class="quote-icon" />
                  <p>«{{ person.quote }}»</p>
                </div>
                <p class="legend-desc">{{ person.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" class="pricing-section">
        <div class="pricing-bg">
          <div class="pricing-blob1"></div>
          <div class="pricing-blob2"></div>
        </div>

        <div class="pricing-container">
          <div class="pricing-header">
            <h2 class="section-title">Простая и честная стоимость</h2>
            <p class="section-subtitle">Без скрытых платежей. Отмена в любой момент.</p>
          </div>

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
          
          <div v-else class="period-switcher">
            <button 
              v-for="p in periods" 
              :key="p.value"
              class="period-btn"
              :class="{ active: billingCycle === p.value }"
              @click="billingCycle = p.value"
            >
              {{ p.label }}
              <span v-if="p.discount" class="period-discount" :class="{ active: billingCycle === p.value }">
                {{ p.discount }}
              </span>
              <span v-if="p.hit" class="period-hit">ХИТ</span>
            </button>
          </div>

          <div class="pricing-cards">
            <template v-if="pricingTariffs.length > 0">
              <div 
                v-for="(tariff, index) in pricingTariffs" 
                :key="tariff.id"
                :class="['pricing-card', { 
                  'free': tariff.code === 'free',
                  'pro': tariff.is_popular, 
                  'club': index === 2, 
                  'is-soon': tariff.is_soon 
                }]"
              >
                <div v-if="tariff.is_popular" class="popular-badge">Популярный выбор</div>
                <div v-if="tariff.is_soon" class="soon-badge">Скоро</div>
                <h3>{{ tariff.title }}</h3>
                <div class="price">
                  <span class="amount">{{ formatPrice(getTariffPrice(tariff).price) }} ₽</span>
                  <span class="period">{{ getTariffPrice(tariff).period }}</span>
                </div>
                <div v-if="getTariffSavings(tariff) > 0" class="savings">
                  Экономия {{ formatPrice(getTariffSavings(tariff)) }} ₽
                </div>
                <p v-if="tariff.description" class="plan-desc">{{ tariff.description }}</p>
                
                <ul class="features-list">
                  <li v-for="item in getSortedFeatureItems(tariff)" :key="item.id">
                    <Check class="check-icon" />
                    <span>{{ item.text }}</span>
                  </li>
                </ul>
                
                <a 
                  v-if="!tariff.is_soon"
                  href="https://t.me/onepercent_bot" 
                  target="_blank"
                  :class="['pricing-cta', tariff.code === 'free' ? 'btn-outline' : (tariff.is_popular ? 'btn-secondary' : 'btn-outline')]"
                >
                  {{ tariff.code === 'free' ? 'Начать бесплатно' : 'Попробовать' }}
                </a>
                <button v-else class="btn-disabled" disabled>Скоро</button>
              </div>
            </template>
            
            <template v-else>
              <div class="pricing-card free">
                <h3>Бесплатный</h3>
                <div class="price">
                  <span class="amount">0 ₽</span>
                  <span class="period">навсегда</span>
                </div>
                <p class="plan-desc">Базовый функционал для начала работы над собой.</p>

                <ul class="features-list">
                  <li v-for="(feature, i) in freeFeatures" :key="i">
                    <Check class="check-icon" />
                    <span>{{ feature }}</span>
                  </li>
                </ul>

                <button class="btn-outline">Начать бесплатно</button>
              </div>

              <div class="pricing-card pro">
                <div class="popular-badge">Популярный выбор</div>
                <div class="pro-content">
                  <h3>Pro</h3>
                  <div class="price">
                    <span class="amount">{{ calculatePrice(990) }} ₽</span>
                    <span class="period">/ месяц</span>
                  </div>
                  <div v-if="billingCycle > 1" class="old-price">990 ₽ / месяц</div>
                </div>
                <p class="plan-desc">Полный функционал с AI-помощником и голосовым чатом с ментором.</p>

                <ul class="features-list">
                  <li v-for="(feature, i) in proFeatures" :key="i">
                    <div class="check-circle">
                      <Check class="check-icon-sm" />
                    </div>
                    <span>{{ feature }}</span>
                  </li>
                </ul>

                <button class="btn-secondary">7 дней бесплатно</button>
              </div>

              <div class="pricing-card club">
                <h3>Клуб 1%</h3>
                <div class="price">
                  <span class="amount">{{ calculatePrice(2990) }} ₽</span>
                  <span class="period">/ месяц</span>
                </div>
                <p class="plan-desc">Premium тариф с мастермайндами, челленджами и нетворкингом.</p>

                <ul class="features-list">
                  <li v-for="(feature, i) in clubFeatures" :key="i">
                    <Check class="check-icon" />
                    <span>{{ feature }}</span>
                  </li>
                </ul>

                <button class="btn-disabled" disabled>Скоро</button>
              </div>
            </template>
          </div>

          <div class="pricing-hint">
            <Lightbulb class="hint-icon" />
            <p>Начни бесплатно и переходи на Pro, когда почувствуешь, что готов к следующему уровню</p>
          </div>
        </div>
      </section>

      <footer class="footer-dark">
        <div class="footer-dark-container">
          <div class="footer-dark-top">
            <div class="footer-dark-logo">
              <div class="logo-icon-dark">1%</div>
              <span>OnePercent</span>
            </div>
            <div class="footer-dark-auth">
              <router-link to="/auth/login" class="footer-auth-link">Войти</router-link>
              <router-link to="/auth/register" class="footer-auth-link">Регистрация</router-link>
            </div>
          </div>
          
          <div class="footer-dark-links">
            <router-link to="/legal/privacy">Политика конфиденциальности</router-link>
            <router-link to="/legal/terms">Пользовательское соглашение</router-link>
            <router-link to="/legal/disclaimer">Отказ от ответственности</router-link>
          </div>
          
          <div class="footer-dark-company">
            <p>ИП Косик Дмитрий Владимирович</p>
            <p>ИНН: 711280082908 | ОГРНИП: 321774600074346</p>
          </div>
          
          <p class="footer-dark-copy">© 2025 OnePercent. Все права защищены.</p>
        </div>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import WheelBalanceMockup from '@/components/landing/WheelBalanceMockup.vue'
import { useSubscriptionStore } from '@/stores/subscription'
import { 
  Menu as MenuIcon, 
  X as XIcon, 
  Sparkles, 
  Activity, 
  Target, 
  CheckSquare, 
  Calendar, 
  Trophy,
  MessageCircle,
  Mic,
  Map,
  Zap,
  Check,
  ArrowRight,
  Feather,
  BookOpen,
  TrendingUp,
  PenTool,
  Quote,
  Lightbulb,
  Repeat,
  Link,
  CircleDot,
  LayoutGrid
} from 'lucide-vue-next'

const subscriptionStore = useSubscriptionStore()

const isScrolled = ref(false)
const mobileMenuOpen = ref(false)
const days = ref(90)
const billingCycle = ref(1)

const multiplier = computed(() => Math.pow(1.01, days.value).toFixed(2))

const effectDescription = computed(() => {
  if (days.value <= 30) return "Ты начнешь управлять днем, а не плыть по течению: меньше хаоса, больше точности."
  if (days.value <= 90) return "Система становится привычкой. Уходит тревога, появляется четкий план и ясность действий."
  if (days.value <= 180) return "Качественный сдвиг: ясность ума, устойчивость к стрессу, рост дохода и ощущение полного контроля."
  return "Трансформация завершена. Твоя эффективность в 38 раз выше, чем в первый день."
})


const steps = [
  {
    id: 1,
    title: "Умная диагностика",
    subtitle: "Шаг 1. Точка А",
    description: "Система не дает абстрактных советов. Сначала ИИ анализирует ваше текущее состояние через «Колесо жизни», чтобы найти одну сферу, улучшение которой даст максимальный эффект на всё остальное.",
    icon: Activity,
    colorClass: "bg-blue",
    gradientClass: "gradient-blue"
  },
  {
    id: 2,
    title: "AI Постановка целей",
    subtitle: "Шаг 2. Ясность",
    description: "Ментор превращает размытые желания («Хочу быть богатым/спортивным») в четкие метрики. ИИ формулирует цель по SMART, которую реально достичь с вашим текущим графиком.",
    icon: Target,
    colorClass: "bg-purple",
    gradientClass: "gradient-purple"
  },
  {
    id: 3,
    title: "Декомпозиция",
    subtitle: "Шаг 3. План действий",
    description: "Большая цель пугает. Система разбивает её на микро-атомы. Вы получаете интерактивную карту действий от сегодняшнего дня до финального результата.",
    icon: CheckSquare,
    colorClass: "bg-green",
    gradientClass: "gradient-green"
  },
  {
    id: 4,
    title: "Фокус дня",
    subtitle: "Шаг 4. Дисциплина",
    description: "Утром вы получаете ровно одну главную задачу. Больше не нужно думать «за что взяться». Просто сделайте +1% сегодня, и система пересчитает маршрут.",
    icon: Calendar,
    colorClass: "bg-amber",
    gradientClass: "gradient-amber"
  },
  {
    id: 5,
    title: "Система привычек",
    subtitle: "Шаг 5. Ритм",
    description: "От хаотичных попыток к системе. AI подбирает привычки под ваши цели, напоминает о выполнении и показывает реальный прогресс на наглядных дашбордах.",
    icon: Repeat,
    colorClass: "bg-teal",
    gradientClass: "gradient-teal"
  },
  {
    id: 6,
    title: "Геймификация и XP",
    subtitle: "Шаг 6. Мотивация",
    description: "XP = валюта для твоих желаний. Ты сам выбираешь награды и цену в XP.",
    icon: Trophy,
    colorClass: "bg-pink",
    gradientClass: "gradient-pink"
  }
]

const ctaItems = [
  "Увидел свои проблемные зоны",
  "Получил персональные цели от AI",
  "План на месяц разбит по дням",
  "Система привычек с геймификацией",
  "Награды за прогресс",
  "AI поддержка 24/7 в Telegram"
]

const legends = [
  {
    name: "Бенджамин Франклин",
    role: "Политик, учёный, изобретатель",
    quote: "Маленькие удары валят большие дубы",
    description: "Создал систему 13 добродетелей: каждую неделю фокусировался на одном качестве, вёл дневник самоанализа.",
    icon: Feather
  },
  {
    name: "Джеймс Клир",
    role: "Автор «Atomic Habits»",
    quote: "Привычки — это сложные проценты самосовершенствования",
    description: "Популяризировал концепцию 1%: если каждый день улучшаться на 1%, за год станешь лучше в 37 раз.",
    icon: BookOpen
  },
  {
    name: "Уоррен Баффетт",
    role: "Инвестор, миллиардер",
    quote: "Я просто сижу в офисе и читаю целый день",
    description: "Правило 5 часов: ежедневно инвестирует минимум час в обучение и рефлексию. 80% рабочего времени — чтение.",
    icon: TrendingUp
  },
  {
    name: "Леонардо да Винчи",
    role: "Художник, учёный, изобретатель",
    quote: "Препятствия не могут сокрушить меня",
    description: "Вёл легендарные записные книжки: 7000+ страниц наблюдений, идей и планов. Ежедневная практика.",
    icon: PenTool
  }
]

const periods = [
  { value: 1, label: '1 месяц', discount: null },
  { value: 3, label: '3 месяца', discount: '-10%' },
  { value: 6, label: '6 месяцев', discount: '-20%' },
  { value: 12, label: '12 месяцев', discount: '-30%', hit: true }
]

const freeFeatures = [
  'Колесо баланса (ССП)',
  'Банк целей (до 4 целей)',
  'Базовое планирование',
  'Трекер привычек (до 3)',
  'Дневник рефлексии',
  'Достижения (до 5)',
  'Напоминания в Telegram'
]

const proFeatures = [
  'Всё из Бесплатного плана',
  'Безлимитные цели и привычки',
  'AI ментор',
  'AI планирование',
  'AI помощь',
  'Голосовой чат с ментором',
  'Клуб 1%'
]

const clubFeatures = [
  'Всё из Pro плана',
  'Еженедельные мастермайнды',
  'Групповые челленджи',
  'Ранний доступ к новым функциям',
  'Нетворкинг 2.0'
]

const calculatePrice = (basePrice) => {
  if (basePrice === 0) return 0
  let discount = 0
  if (billingCycle.value === 3) discount = 0.1
  if (billingCycle.value === 6) discount = 0.2
  if (billingCycle.value === 12) discount = 0.3
  return Math.round(basePrice * (1 - discount))
}

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

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
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
.landing-v6 {
  min-height: 100vh;
  background: #f8fafc;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.landing-v6 a {
  text-decoration: none;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  transition: all 0.3s;
  padding: 1.5rem 0;
}

.header.scrolled {
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e2e8f0;
  padding: 0.75rem 0;
}

.header-container {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1.5rem;
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
  width: 2.5rem;
  height: 2.5rem;
  background: #6366f1;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 900;
  font-size: 0.875rem;
  box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
}

.logo-text {
  font-weight: 800;
  font-size: 1.25rem;
  color: #0f172a;
}

.nav-desktop {
  display: none;
  gap: 2rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: #475569;
}

@media (min-width: 768px) {
  .nav-desktop {
    display: flex;
  }
}

.nav-link {
  transition: color 0.2s;
}

.nav-link:hover {
  color: #6366f1;
}

.header-actions {
  display: none;
  align-items: center;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .header-actions {
    display: flex;
  }
}

.login-link {
  font-weight: 700;
  color: #475569;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.login-link:hover {
  color: #6366f1;
}

.btn-primary {
  background: #6366f1;
  color: white;
  padding: 0.875rem 2rem;
  border-radius: 1rem;
  font-weight: 900;
  transition: all 0.2s;
  box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
  border: none;
  outline: none;
}

.btn-primary:hover {
  background: #4f46e5;
  transform: translateY(-2px);
}

.mobile-toggle {
  display: block;
  padding: 0.5rem;
  color: #475569;
}

@media (min-width: 768px) {
  .mobile-toggle {
    display: none;
  }
}

.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mobile-link {
  font-size: 1rem;
  font-weight: 600;
  color: #334155;
  padding: 0.5rem 0;
}

.mobile-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 0.5rem 0;
}

.mobile-btn-primary {
  width: 100%;
  background: #6366f1;
  color: white;
  text-align: center;
  padding: 0.875rem;
  border-radius: 0.75rem;
  font-weight: 700;
  box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
}

.hero {
  position: relative;
  padding: 10rem 0 5rem;
  background: radial-gradient(circle at top, #eef2ff, #f8fafc 50%, #f8fafc);
  overflow: hidden;
}

.hero-container {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1.5rem;
  text-align: center;
  position: relative;
  z-index: 10;
}

.hero-badge {
  display: inline-block;
  padding: 0.375rem 1rem;
  background: #e0e7ff;
  color: #4338ca;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2rem;
  border: 1px solid #c7d2fe;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 2rem;
  line-height: 1.1;
  color: #0f172a;
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 4rem;
  }
}

.hero-highlight {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 3rem;
}

@media (min-width: 768px) {
  .hero-highlight {
    font-size: 5rem;
  }
}

.hero-description {
  color: #64748b;
  font-size: 1.125rem;
  max-width: 42rem;
  margin: 0 auto 3rem;
  line-height: 1.7;
}

@media (min-width: 768px) {
  .hero-description {
    font-size: 1.25rem;
  }
}

.desktop-only {
  display: none;
}

@media (min-width: 768px) {
  .desktop-only {
    display: block;
  }
}

.mobile-only {
  display: block;
}

@media (min-width: 768px) {
  .mobile-only {
    display: none;
  }
}

.hero-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .hero-actions {
    flex-direction: row;
    justify-content: center;
  }
}

.btn-hero {
  width: 100%;
  background: #6366f1;
  color: white;
  padding: 1.25rem 2.5rem;
  border-radius: 1rem;
  font-weight: 900;
  font-size: 1.125rem;
  transition: all 0.3s;
  box-shadow: 0 25px 50px -12px rgba(99, 102, 241, 0.4);
}

@media (min-width: 768px) {
  .btn-hero {
    width: auto;
  }
}

.btn-hero:hover {
  transform: scale(1.05);
}

.social-proof {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 500;
}

.avatars {
  display: flex;
  margin-left: 0.5rem;
}

.avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background: #e2e8f0;
  border: 2px solid white;
  overflow: hidden;
  margin-left: -0.5rem;
}

.avatar:first-child {
  margin-left: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.effect-card {
  margin-top: 6rem;
  max-width: 36rem;
  margin-left: auto;
  margin-right: auto;
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  text-align: left;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1);
  border: 1px solid rgba(15, 23, 42, 0.05);
}

.effect-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
}

.effect-title {
  font-weight: 900;
  font-size: 1.5rem;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.effect-subtitle {
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 500;
}

.effect-multiplier {
  font-size: 3rem;
  font-weight: 900;
  color: #6366f1;
}

.modern-range {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #e2e8f0;
  outline: none;
  -webkit-appearance: none;
  margin-bottom: 1.5rem;
}

.modern-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}

.modern-range::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
  border: none;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}

.effect-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1.5rem;
}

.effect-description {
  padding: 1.25rem;
  background: #f8fafc;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
}

.effect-description p {
  color: #334155;
  font-weight: 500;
  line-height: 1.6;
  font-style: italic;
}

.math-section {
  padding: 6rem 0;
  background: white;
}

.math-container {
  max-width: 64rem;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.math-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 1.875rem;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .section-title {
    font-size: 2.5rem;
  }
}

.section-subtitle {
  font-size: 1.125rem;
  color: #64748b;
  max-width: 42rem;
  margin: 0 auto;
}

.math-cards {
  display: grid;
  gap: 2rem;
  align-items: center;
  justify-content: center;
}

@media (min-width: 768px) {
  .math-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

.math-card {
  padding: 2rem;
  border-radius: 1.5rem;
  border: 1px solid #e2e8f0;
}

.math-card.linear {
  background: #f8fafc;
}

.math-card.growth {
  background: #6366f1;
  border-color: #4f46e5;
  color: white;
  box-shadow: 0 25px 50px -12px rgba(99, 102, 241, 0.3);
  transform: scale(1.05);
}

.card-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.linear .card-label {
  color: #94a3b8;
}

.growth .card-label {
  color: #c7d2fe;
}

.formula {
  font-size: 3.5rem;
  font-family: ui-monospace, monospace;
  font-weight: 700;
  letter-spacing: -0.05em;
  margin-bottom: 1rem;
}

.linear .formula {
  color: #cbd5e1;
}

.formula .exp {
  font-size: 1.25rem;
  vertical-align: super;
}

.linear .formula .exp {
  color: #94a3b8;
}

.growth .formula .exp {
  color: #c7d2fe;
}

.result {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.linear .result {
  color: #94a3b8;
}

.card-desc {
  margin-top: 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.6;
}

.linear .card-desc {
  color: #64748b;
}

.growth .card-desc {
  color: #e0e7ff;
}

.features-section {
  padding: 6rem 0;
  background: #f8fafc;
  overflow: hidden;
}

.features-container {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.features-header {
  text-align: center;
  margin-bottom: 6rem;
  max-width: 48rem;
  margin-left: auto;
  margin-right: auto;
}

.features-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  color: #6366f1;
}

.icon-sm {
  width: 0.75rem;
  height: 0.75rem;
}

.section-title-lg {
  font-size: 2.25rem;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

@media (min-width: 768px) {
  .section-title-lg {
    font-size: 3rem;
  }
}

.gradient-text {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 8rem;
}

.step-row {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  align-items: center;
}

@media (min-width: 1024px) {
  .step-row {
    flex-direction: row;
  }
  
  .step-row.reversed {
    flex-direction: row-reverse;
  }
}

.step-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.step-subtitle-badge {
  display: inline-block;
  padding: 0.375rem 1rem;
  border-radius: 0.5rem;
  background: #f1f5f9;
  color: #64748b;
  font-weight: 700;
  font-size: 0.875rem;
}

.step-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
}

@media (min-width: 768px) {
  .step-title {
    font-size: 2.25rem;
  }
}

.step-description {
  font-size: 1.125rem;
  color: #475569;
  line-height: 1.7;
}

.step-footer {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
}

.step-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.step-icon.bg-blue {
  background: #dbeafe;
  color: #2563eb;
}

.step-icon.bg-purple {
  background: #f3e8ff;
  color: #9333ea;
}

.step-icon.bg-green {
  background: #dcfce7;
  color: #16a34a;
}

.step-icon.bg-amber {
  background: #fef3c7;
  color: #d97706;
}

.step-icon.bg-pink {
  background: #fce7f3;
  color: #db2777;
}

.step-icon .icon {
  width: 1.5rem;
  height: 1.5rem;
}

.step-brand {
  font-size: 0.875rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.step-visual {
  flex: 1;
  width: 100%;
}

.visual-wrapper {
  position: relative;
  border-radius: 1.5rem;
  padding: 4px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}

.visual-wrapper.gradient-blue {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.2));
}

.visual-wrapper.gradient-purple {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2));
}

.visual-wrapper.gradient-green {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2));
}

.visual-wrapper.gradient-amber {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(249, 115, 22, 0.2));
}

.visual-wrapper.gradient-pink {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(244, 63, 94, 0.2));
}

.visual-card {
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(8px);
  border-radius: calc(1.5rem - 4px);
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.5);
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .visual-card {
    min-height: 500px;
  }
}

.browser-header {
  height: 2.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  gap: 0.5rem;
}

.dots {
  display: flex;
  gap: 0.375rem;
}

.dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 9999px;
  background: #e2e8f0;
}

.browser-title {
  margin-left: 1rem;
  background: white;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.625rem;
  color: #94a3b8;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  flex: 1;
  text-align: center;
}

.visual-content {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(248, 250, 252, 0.5);
  position: relative;
  overflow: hidden;
}

@media (min-width: 768px) {
  .visual-content {
    padding: 2rem;
  }
}

.visual-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  opacity: 0.2;
  filter: blur(48px);
  pointer-events: none;
}

.wheel-preview {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
  width: 100%;
  position: relative;
  z-index: 10;
}

.wheel-analysis {
  text-align: center;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  font-size: 0.875rem;
  color: #475569;
}

.analysis-label {
  color: #6366f1;
  font-weight: 700;
}

.chat-preview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 24rem;
  margin: 0 auto;
  position: relative;
  z-index: 10;
}

.chat-message {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.chat-message.user {
  flex-direction: row-reverse;
}

.chat-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  flex-shrink: 0;
  overflow: hidden;
}

.bot-avatar {
  background: #e0e7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
}

.user-avatar {
  background: #e2e8f0;
  border: 2px solid white;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chat-bubble {
  background: white;
  padding: 1rem;
  border-radius: 1rem;
  border-top-left-radius: 0.25rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  font-size: 0.875rem;
  color: #475569;
}

.user-bubble {
  background: #6366f1;
  color: white;
  border-color: #4f46e5;
  border-radius: 1rem;
  border-top-right-radius: 0.25rem;
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3);
}

.goal-bubble {
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  border-color: #e0e7ff;
}

.goal-accent {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: #6366f1;
}

.goal-title {
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.plan-preview {
  position: relative;
  z-index: 10;
}

.plan-card {
  max-width: 24rem;
  margin: 0 auto;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.plan-header {
  padding: 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-title {
  font-weight: 700;
  color: #334155;
}

.plan-status {
  font-size: 0.75rem;
  background: #dcfce7;
  color: #15803d;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-weight: 700;
}

.plan-timeline {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.plan-item {
  position: relative;
  padding-left: 1.5rem;
  border-left: 2px solid #e2e8f0;
}

.plan-dot {
  position: absolute;
  left: -9px;
  top: 0;
  width: 1rem;
  height: 1rem;
  background: #cbd5e1;
  border-radius: 9999px;
  border: 4px solid white;
}

.plan-dot.active {
  background: #6366f1;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.plan-week {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.plan-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
}

.focus-preview {
  max-width: 24rem;
  margin: 0 auto;
  position: relative;
  z-index: 10;
}

.focus-time {
  text-align: center;
  margin-bottom: 1.5rem;
}

.time-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: #0f172a;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.time-display {
  font-size: 1.875rem;
  font-weight: 900;
  color: #1e293b;
}

.focus-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(99, 102, 241, 0.2);
  border: 1px solid #e0e7ff;
  position: relative;
  transition: all 0.3s;
  cursor: pointer;
}

.focus-card:hover {
  transform: scale(1.05);
}

.focus-check {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  border: 2px solid #c7d2fe;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: all 0.2s;
}

.focus-card:hover .focus-check {
  background: #6366f1;
  border-color: #6366f1;
  opacity: 1;
}

.focus-label {
  font-size: 0.75rem;
  color: #6366f1;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.focus-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.focus-desc {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.focus-tags {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tag-xp {
  padding: 0.25rem 0.5rem;
  background: #eef2ff;
  color: #4338ca;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 0.25rem;
}

.tag-category {
  padding: 0.25rem 0.5rem;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 0.25rem;
}

.xp-preview {
  position: relative;
  z-index: 10;
}

.xp-card {
  max-width: 24rem;
  margin: 0 auto;
  background: #0f172a;
  color: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  position: relative;
  overflow: hidden;
}

.xp-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 8rem;
  height: 8rem;
  background: #a855f7;
  filter: blur(48px);
  opacity: 0.3;
}

.xp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.xp-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.xp-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  background: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #334155;
  overflow: hidden;
}

.xp-avatar img {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
}

.xp-level {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 700;
}

.xp-name {
  font-weight: 700;
}

.trophy-icon {
  color: #fbbf24;
  width: 1.5rem;
  height: 1.5rem;
}

.xp-progress {
  margin-bottom: 1.5rem;
}

.xp-progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.xp-bar {
  height: 0.75rem;
  background: #1e293b;
  border-radius: 9999px;
  overflow: hidden;
}

.xp-bar-fill {
  height: 100%;
  width: 85%;
  background: linear-gradient(90deg, #6366f1, #a855f7);
}

.xp-achievement {
  background: rgba(255,255,255,0.1);
  padding: 0.75rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
}

.xp-achievement:hover {
  background: rgba(255,255,255,0.2);
}

.achievement-icon {
  padding: 0.5rem;
  background: rgba(251, 191, 36, 0.2);
  border-radius: 0.5rem;
  color: #fbbf24;
}

.achievement-label {
  font-size: 0.75rem;
  font-weight: 700;
}

.achievement-name {
  font-size: 0.75rem;
  color: #cbd5e1;
}

.mentor-section {
  padding: 6rem 0;
  background: white;
  overflow: hidden;
  position: relative;
}

.mentor-glow {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 600px;
  height: 600px;
  background: rgba(238, 242, 255, 0.5);
  border-radius: 9999px;
  filter: blur(48px);
  z-index: 0;
  pointer-events: none;
  opacity: 0.6;
}

.mentor-container {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.mentor-banner {
  display: flex;
  justify-content: center;
  margin-bottom: 4rem;
}

.mentor-banner > p {
  background: rgba(236, 253, 245, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid #a7f3d0;
  border-radius: 9999px;
  padding: 0.75rem 1.5rem;
  text-align: center;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  font-size: 0.875rem;
  color: #065f46;
}

@media (min-width: 768px) {
  .mentor-banner > p {
    font-size: 1rem;
  }
}

.banner-problem, .banner-solution {
  font-weight: 700;
  background: rgba(167, 243, 208, 0.5);
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  margin-right: 0.25rem;
}

.banner-divider {
  margin: 0 0.5rem;
  color: #6ee7b7;
}

.mentor-grid {
  display: grid;
  gap: 3rem;
  align-items: center;
}

@media (min-width: 1024px) {
  .mentor-grid {
    grid-template-columns: 1fr 1fr;
    gap: 5rem;
  }
}

.mentor-content {
  order: 2;
}

@media (min-width: 1024px) {
  .mentor-content {
    order: 1;
  }
}

.mentor-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: #eef2ff;
  border: 1px solid #e0e7ff;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1.5rem;
  color: #6366f1;
}

.mentor-title {
  font-size: 2.25rem;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 1.5rem;
  line-height: 1.1;
}

@media (min-width: 768px) {
  .mentor-title {
    font-size: 3rem;
  }
}

.mentor-description {
  font-size: 1.125rem;
  color: #64748b;
  margin-bottom: 2.5rem;
  line-height: 1.7;
  max-width: 32rem;
}

.mentor-roles {
  position: relative;
  padding-left: 1rem;
  margin-bottom: 3rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.role-line {
  position: absolute;
  left: 27px;
  top: 1rem;
  bottom: 1rem;
  width: 2px;
  background: linear-gradient(180deg, #c7d2fe, #e0e7ff, transparent);
}

.role-item {
  position: relative;
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
}

.role-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1rem;
  background: white;
  border: 2px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 10;
  transition: all 0.3s;
  color: #94a3b8;
}

.role-item:hover .role-icon {
  border-color: #c7d2fe;
  transform: scale(1.05);
  color: #6366f1;
}

.role-icon.active {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  border: none;
  box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
  transform: scale(1.05);
  color: white;
}

.role-icon .icon {
  width: 1.5rem;
  height: 1.5rem;
}

.role-text h4 {
  font-weight: 700;
  color: #0f172a;
  font-size: 1.125rem;
}

.role-period {
  font-size: 0.75rem;
  font-weight: 700;
  color: #6366f1;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.role-desc {
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.6;
}

.mentor-quote {
  display: none;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: #f8fafc;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
}

@media (min-width: 1024px) {
  .mentor-quote.desktop-only {
    display: flex;
  }
}

.quote-mark {
  font-size: 2.5rem;
  line-height: 1;
  color: #c7d2fe;
  font-family: serif;
  opacity: 0.5;
}

.quote-text {
  color: #334155;
  font-style: italic;
  margin-bottom: 0.75rem;
  font-weight: 500;
  font-size: 1rem;
  line-height: 1.6;
}

.quote-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.author-avatar {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  background: #cbd5e1;
  overflow: hidden;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-name {
  font-weight: 700;
  color: #0f172a;
  font-size: 0.875rem;
}

.mentor-phone-wrapper {
  order: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

@media (min-width: 1024px) {
  .mentor-phone-wrapper {
    order: 2;
  }
}

.phone-float {
  position: relative;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.phone-shadow {
  position: absolute;
  bottom: -2.5rem;
  left: 2.5rem;
  right: 2.5rem;
  height: 2rem;
  background: rgba(0,0,0,0.2);
  filter: blur(15px);
  border-radius: 100%;
}

.phone-frame {
  position: relative;
  width: 320px;
  height: 660px;
  background: #0f172a;
  border-radius: 3.5rem;
  box-shadow: 
    0 50px 100px -20px rgba(50, 50, 93, 0.25),
    0 30px 60px -30px rgba(0, 0, 0, 0.3),
    inset -2px -2px 4px rgba(255, 255, 255, 0.1);
  border: 10px solid #0f172a;
  overflow: hidden;
}

@media (min-width: 768px) {
  .phone-frame {
    width: 340px;
  }
}

.phone-glare {
  position: absolute;
  top: 0;
  right: 0;
  width: 66%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05));
  pointer-events: none;
  z-index: 30;
}

.phone-notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 5rem;
  height: 1rem;
  background: black;
  border-radius: 0 0 1rem 1rem;
  z-index: 20;
}

.telegram-header {
  background: #517da2;
  padding: 1rem;
  padding-top: 2.5rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  position: relative;
  z-index: 10;
}

.tg-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
}

.tg-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 9999px;
  background: #f1f5f9;
}

.tg-info h4 {
  font-weight: 700;
  font-size: 1rem;
  line-height: 1.2;
}

.tg-info p {
  font-size: 0.75rem;
  color: #bfdbfe;
  opacity: 0.9;
}

.telegram-chat {
  background: linear-gradient(135deg, #eef2f3, #8e9eab);
  height: 100%;
  overflow-y: auto;
  padding: 0.75rem;
  padding-bottom: 5rem;
  font-size: 0.875rem;
  position: relative;
}

.chat-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.05;
  background-image: radial-gradient(#444 1px, transparent 1px);
  background-size: 20px 20px;
}

.tg-message {
  background: white;
  padding: 0.875rem;
  border-radius: 1rem;
  border-top-left-radius: 0.25rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  max-width: 95%;
  color: #1e293b;
  position: relative;
  z-index: 10;
  line-height: 1.4;
}

.tg-greeting {
  margin-bottom: 0.625rem;
}

.tg-section-title {
  font-weight: 700;
  margin-bottom: 0.375rem;
  color: #0f172a;
}

.tg-tasks {
  margin-bottom: 0.75rem;
}

.tg-tasks li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.375rem;
}

.tg-tasks li span {
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.tg-tasks li .heart {
  color: #ef4444;
}

.tg-habits {
  color: #475569;
  font-size: 0.75rem;
}

.tg-habits li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.375rem;
}

.habit-dot {
  width: 6px;
  height: 6px;
  background: #6366f1;
  border-radius: 9999px;
}

.tg-note {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
  color: #475569;
  font-style: italic;
}

.tg-time {
  font-size: 0.625rem;
  color: #94a3b8;
  text-align: right;
  margin-top: 0.375rem;
  font-weight: 500;
}

.mentor-quote.mobile-only {
  display: block;
  margin-top: 3rem;
  text-align: center;
  max-width: 24rem;
}

@media (min-width: 1024px) {
  .mentor-quote.mobile-only {
    display: none;
  }
}

.mentor-quote.mobile-only .quote-text {
  color: #475569;
  font-style: italic;
  margin-bottom: 1rem;
  font-weight: 500;
}

.mentor-quote.mobile-only .author-name {
  font-weight: 700;
  color: #0f172a;
  font-size: 0.875rem;
}

.cta-section {
  padding: 5rem 0 7rem;
  background: linear-gradient(135deg, #6366f1, #7c3aed);
  position: relative;
  overflow: hidden;
  color: white;
}

@media (min-width: 768px) {
  .cta-section {
    padding: 7rem 0;
  }
}

.cta-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.cta-blob1, .cta-blob2 {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 9999px;
  mix-blend-mode: overlay;
  filter: blur(128px);
  opacity: 0.3;
}

.cta-blob1 {
  top: 50%;
  left: 25%;
  background: #6366f1;
  animation: pulse 4s ease-in-out infinite;
}

.cta-blob2 {
  bottom: 0;
  right: 25%;
  background: #a855f7;
}

.cta-noise {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

.cta-container {
  max-width: 64rem;
  margin: 0 auto;
  padding: 0 1.5rem;
  position: relative;
  z-index: 10;
}

.cta-title {
  font-size: 1.875rem;
  font-weight: 900;
  text-align: center;
  margin-bottom: 3rem;
  line-height: 1.2;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

@media (min-width: 768px) {
  .cta-title {
    font-size: 3rem;
    margin-bottom: 4rem;
  }
}

.cta-checklist {
  display: grid;
  gap: 1rem;
  margin-bottom: 3rem;
}

@media (min-width: 768px) {
  .cta-checklist {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 4rem;
  }
}

@media (min-width: 1024px) {
  .cta-checklist {
    grid-template-columns: repeat(3, 1fr);
  }
}

.cta-item {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: background 0.3s;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}

.cta-item:hover {
  background: rgba(255,255,255,0.2);
}

.cta-check {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.3s;
}

.cta-item:hover .cta-check {
  transform: scale(1.1);
}

.cta-check .icon {
  width: 1.25rem;
  height: 1.25rem;
  stroke-width: 3;
}

.cta-item span {
  font-weight: 500;
  font-size: 1.125rem;
  line-height: 1.3;
  letter-spacing: -0.01em;
  opacity: 0.95;
}

.cta-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.btn-cta {
  width: 100%;
  background: white;
  color: #4338ca;
  padding: 1.25rem 2rem;
  border-radius: 1rem;
  font-weight: 900;
  font-size: 1.125rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .btn-cta {
    width: auto;
    font-size: 1.25rem;
  }
}

.btn-cta:hover {
  transform: scale(1.05);
  box-shadow: 0 25px 50px -12px rgba(255,255,255,0.2);
}

.btn-cta .icon {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.2s;
}

.btn-cta:hover .icon {
  transform: translateX(4px);
}

.cta-guarantees {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(224, 231, 255, 0.9);
}

@media (min-width: 768px) {
  .cta-guarantees {
    flex-direction: row;
    gap: 2rem;
  }
}

.guarantee {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cta-counter {
  margin-top: 1rem;
  background: rgba(99, 102, 241, 0.3);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 9999px;
  padding: 0.5rem 1rem 0.5rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.fire {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.cta-counter strong {
  color: white;
  font-weight: 700;
}

.testimonials-section {
  padding: 6rem 0;
  background: white;
  border-top: 1px solid #e2e8f0;
}

.testimonials-container {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.testimonials-header {
  text-align: center;
  margin-bottom: 4rem;
}

.testimonials-grid {
  display: grid;
  gap: 2rem;
}

@media (min-width: 768px) {
  .testimonials-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.legend-card {
  background: white;
  border-radius: 2rem;
  padding: 2rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transition: all 0.3s;
}

@media (min-width: 640px) {
  .legend-card {
    flex-direction: row;
  }
}

.legend-card:hover {
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1);
  transform: translateY(-4px);
}

.legend-icon {
  flex-shrink: 0;
}

.legend-icon > :deep(svg) {
  width: 4rem;
  height: 4rem;
  padding: 1rem;
  background: #6366f1;
  border-radius: 9999px;
  color: white;
  box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
  transition: transform 0.3s;
  stroke-width: 1.5;
}

.legend-card:hover .legend-icon > :deep(svg) {
  transform: scale(1.1);
}

.icon-lg {
  width: 2rem;
  height: 2rem;
}

.legend-content {
  flex: 1;
}

.legend-content h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.legend-role {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 1rem;
}

.legend-quote {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.quote-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #a5b4fc;
  fill: #e0e7ff;
  flex-shrink: 0;
  transform: scaleX(-1);
}

.legend-quote p {
  color: #1e293b;
  font-weight: 500;
  font-style: italic;
  line-height: 1.6;
}

.legend-desc {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.6;
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
}

.pricing-section {
  padding: 6rem 0;
  background: #f8fafc;
  position: relative;
  overflow: hidden;
}

.pricing-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.pricing-blob1, .pricing-blob2 {
  position: absolute;
  width: 24rem;
  height: 24rem;
  border-radius: 9999px;
  mix-blend-mode: multiply;
  filter: blur(128px);
  opacity: 0.4;
}

.pricing-blob1 {
  top: 50%;
  left: 0;
  background: #c7d2fe;
}

.pricing-blob2 {
  bottom: 0;
  right: 0;
  background: #e9d5ff;
}

.pricing-container {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1.5rem;
  position: relative;
  z-index: 10;
}

.pricing-header {
  text-align: center;
  margin-bottom: 3rem;
}

.period-switcher {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 4rem;
}

@media (min-width: 768px) {
  .period-switcher {
    gap: 1rem;
  }
}

.period-btn {
  position: relative;
  padding: 0.75rem 1.25rem;
  border-radius: 1rem;
  font-weight: 700;
  transition: all 0.3s;
  border: 2px solid #e2e8f0;
  background: white;
  color: #475569;
  font-size: 0.875rem;
}

@media (min-width: 768px) {
  .period-btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
}

.period-btn:hover {
  border-color: #c7d2fe;
  background: #f8fafc;
}

.period-btn.active {
  background: #6366f1;
  border-color: #6366f1;
  color: white;
  box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
  transform: scale(1.05);
}

.period-discount {
  position: absolute;
  top: -0.625rem;
  right: -0.5rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: 700;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  background: #10b981;
  color: white;
  transition: all 0.2s;
}

.period-discount.active {
  background: white;
  color: #6366f1;
}

.period-hit {
  position: absolute;
  top: -1.5rem;
  right: -1.5rem;
  background: #f59e0b;
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  transform: rotate(12deg);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

@media (min-width: 768px) {
  .period-hit {
    right: -2rem;
  }
}

.term-selector {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 4rem;
}

@media (min-width: 768px) {
  .term-selector {
    gap: 1rem;
  }
}

.term-btn {
  position: relative;
  padding: 0.75rem 1.25rem;
  border-radius: 1rem;
  font-weight: 700;
  transition: all 0.3s;
  border: 2px solid #e2e8f0;
  background: white;
  color: #475569;
  font-size: 0.875rem;
  cursor: pointer;
}

@media (min-width: 768px) {
  .term-btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
}

.term-btn:hover {
  border-color: #c7d2fe;
  background: #f8fafc;
}

.term-btn.active {
  background: #6366f1;
  border-color: #6366f1;
  color: white;
  box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
  transform: scale(1.05);
}

.term-btn .term-name {
  display: block;
}

.term-btn .term-discount {
  position: absolute;
  top: -0.625rem;
  right: -0.5rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: 700;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  background: #10b981;
  color: white;
}

.term-btn.active .term-discount {
  background: white;
  color: #6366f1;
}

.term-btn .hit-badge {
  position: absolute;
  top: -1.5rem;
  right: -1.5rem;
  background: #f59e0b;
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  transform: rotate(12deg);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

@media (min-width: 768px) {
  .term-btn .hit-badge {
    right: -2rem;
  }
}

.savings {
  color: #10b981;
  font-size: 0.875rem;
  font-weight: 600;
  margin-top: 0.25rem;
}

.soon-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #94a3b8;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

.pricing-card.is-soon {
  opacity: 0.7;
}

.pricing-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  border-radius: 1rem;
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.3s;
  cursor: pointer;
  margin-top: auto;
}

.pricing-cards {
  display: grid;
  gap: 1.5rem;
  align-items: flex-start;
}

@media (min-width: 1024px) {
  .pricing-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

.pricing-card {
  border-radius: 2rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.pricing-card.free {
  background: white;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: box-shadow 0.3s;
}

.pricing-card.free:hover {
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1);
}

.pricing-card.pro {
  background: #6366f1;
  border: 1px solid #4f46e5;
  color: white;
  box-shadow: 0 25px 50px -12px rgba(99, 102, 241, 0.3);
  z-index: 10;
}

@media (min-width: 1024px) {
  .pricing-card.pro {
    transform: translateY(-1rem);
  }
}

.pricing-card.club {
  background: #334155;
  border: 1px solid #475569;
  color: #e2e8f0;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}

.popular-badge {
  position: absolute;
  top: -1rem;
  left: 50%;
  transform: translateX(-50%);
  background: #fbbf24;
  color: #78350f;
  padding: 0.375rem 1rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}

.pricing-card h3 {
  font-size: 1.5rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
}

.free h3 {
  color: #0f172a;
}

.pro h3 {
  opacity: 0.9;
}

.club h3 {
  color: white;
}

.pro .pro-content {
  text-align: center;
  margin-bottom: 1.5rem;
  margin-top: 0.5rem;
}

.price {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.pro .price {
  justify-content: center;
}

.amount {
  font-size: 2.5rem;
  font-weight: 900;
}

.free .amount {
  color: #0f172a;
}

.pro .amount {
  font-size: 3rem;
}

.club .amount {
  color: white;
}

.period {
  font-size: 0.875rem;
  font-weight: 500;
}

.free .period {
  color: #94a3b8;
}

.pro .period {
  opacity: 0.6;
}

.club .period {
  color: #94a3b8;
}

.old-price {
  font-size: 0.75rem;
  font-weight: 500;
  color: #c7d2fe;
  text-decoration: line-through;
  margin-top: 0.25rem;
}

.plan-desc {
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.free .plan-desc {
  color: #64748b;
}

.pro .plan-desc {
  color: #e0e7ff;
  opacity: 0.9;
  text-align: center;
}

.club .plan-desc {
  color: #94a3b8;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  flex: 1;
}

.features-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.check-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.free .check-icon {
  color: #10b981;
}

.club .check-icon {
  color: #94a3b8;
}

.features-list li span {
  font-size: 0.875rem;
  font-weight: 500;
}

.free .features-list li span {
  color: #475569;
}

.club .features-list li span {
  color: #cbd5e1;
}

.check-circle {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.check-icon-sm {
  width: 0.75rem;
  height: 0.75rem;
  color: white;
}

.pro .features-list li span {
  color: white;
}

.btn-outline {
  width: 100%;
  padding: 1rem;
  border-radius: 1rem;
  border: 2px solid #e2e8f0;
  font-weight: 700;
  background: transparent;
  color: #334155;
  transition: all 0.2s;
}

.btn-outline:hover {
  background: #eef2ff;
}

.btn-secondary {
  width: 100%;
  padding: 1rem;
  border-radius: 1rem;
  font-weight: 700;
  background: white;
  color: #6366f1;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  transition: color 0.2s;
  border: none;
  outline: none;
}

.btn-secondary:hover {
  color: #4338ca;
}

.btn-disabled {
  width: 100%;
  padding: 1rem;
  border-radius: 1rem;
  font-weight: 700;
  background: #475569;
  color: #94a3b8;
  cursor: not-allowed;
  border: none;
}

.pricing-hint {
  margin-top: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: #64748b;
  font-size: 0.875rem;
}

.hint-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #f59e0b;
  flex-shrink: 0;
}

.pricing-hint p {
  text-align: center;
}

.footer {
  background: white;
  border-top: 1px solid #e2e8f0;
  padding: 2rem 0;
}

.footer-container {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

@media (min-width: 768px) {
  .footer-container {
    flex-direction: row;
    justify-content: space-between;
  }
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-logo .logo-icon {
  width: 2rem;
  height: 2rem;
  font-size: 0.75rem;
}

.footer-logo span {
  font-weight: 700;
  color: #0f172a;
}

.footer-copy {
  font-size: 0.875rem;
  color: #64748b;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.footer-links a {
  font-size: 0.875rem;
  color: #64748b;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #6366f1;
}

/* Situations Section */
.situations-section {
  padding: 4rem 0;
  background: white;
  border-radius: 2rem 2rem 0 0;
  margin-top: -1rem;
  position: relative;
  z-index: 1;
}

.situations-container {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.situations-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 3rem;
}

.situations-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .situations-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.situation-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid #e2e8f0;
  transition: all 0.3s;
}

.situation-card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.situation-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.situation-icon .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.situation-icon.icon-blue {
  background: #dbeafe;
  color: #3b82f6;
}

.situation-icon.icon-orange {
  background: #ffedd5;
  color: #f97316;
}

.situation-icon.icon-pink {
  background: #fae8ff;
  color: #d946ef;
}

.situation-text {
  font-size: 1rem;
  font-weight: 500;
  color: #334155;
  line-height: 1.5;
}

/* Teal gradient for step 5 */
.gradient-teal {
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(45, 212, 191, 0.1) 100%);
}

.bg-teal {
  background: #14b8a6;
}

/* Habits Preview */
.habits-preview {
  padding: 1rem;
}

.habits-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.habits-icon {
  width: 2rem;
  height: 2rem;
  background: #14b8a6;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.habits-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
  flex: 1;
}

.habits-today {
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 600;
}

.habits-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.habit-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.habit-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.habit-icon.habit-green { background: #10b981; }
.habit-icon.habit-blue { background: #3b82f6; }
.habit-icon.habit-pink { background: #ec4899; }

.habit-info {
  flex: 1;
}

.habit-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #0f172a;
  display: block;
  margin-bottom: 0.25rem;
}

.habit-days {
  display: flex;
  gap: 0.25rem;
}

.habit-days .day {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 600;
  background: #f1f5f9;
  color: #94a3b8;
}

.habit-days .day.done {
  background: #10b981;
  color: white;
}

.habit-days .day.missed {
  background: #fecaca;
  color: #ef4444;
}

.habit-days .day.current {
  background: #6366f1;
  color: white;
}

.habit-xp {
  font-size: 0.75rem;
  font-weight: 700;
  color: #10b981;
}

.icon-xs {
  width: 0.875rem;
  height: 0.875rem;
}

/* XP Preview V2 */
.xp-preview-v2 {
  padding: 1rem;
}

.xp-status-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #ecfdf5;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #10b981;
  margin-bottom: 1rem;
}

.xp-balance-card {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  margin-bottom: 1rem;
}

.xp-balance-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.25rem;
}

.xp-balance-value {
  font-size: 2.5rem;
  font-weight: 900;
  color: white;
}

.xp-balance-value span {
  font-size: 1.25rem;
  font-weight: 700;
}

.xp-mentor-tip {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
}

.mentor-avatar-small {
  width: 1.75rem;
  height: 1.75rem;
  background: #6366f1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.xp-mentor-tip p {
  font-size: 0.75rem;
  color: #475569;
  line-height: 1.4;
  margin: 0;
}

.xp-mentor-tip strong {
  color: #6366f1;
}

.xp-rewards-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.reward-icon {
  font-size: 1.25rem;
}

.reward-info {
  flex: 1;
}

.reward-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #0f172a;
  display: block;
}

.reward-cost {
  font-size: 0.7rem;
  color: #64748b;
}

.reward-status {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 500;
}

.reward-btn {
  padding: 0.375rem 0.75rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
}

.reward-percent {
  font-size: 0.75rem;
  font-weight: 700;
  color: #6366f1;
  background: #ede9fe;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

/* Dark Footer */
.footer-dark {
  background: #0f172a;
  padding: 3rem 0 2rem;
}

.footer-dark-container {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1.5rem;
  text-align: center;
}

.footer-dark-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .footer-dark-top {
    flex-direction: row;
  }
}

.footer-dark-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon-dark {
  width: 2.5rem;
  height: 2.5rem;
  background: #6366f1;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 900;
  font-size: 0.875rem;
}

.footer-dark-logo span {
  font-weight: 800;
  font-size: 1.25rem;
  color: white;
}

.footer-dark-auth {
  display: flex;
  gap: 1.5rem;
}

.footer-auth-link {
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s;
}

.footer-auth-link:hover {
  color: white;
}

.footer-dark-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.footer-dark-links a {
  color: #6366f1;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.footer-dark-links a:hover {
  color: #818cf8;
}

.footer-dark-company {
  margin-bottom: 1rem;
}

.footer-dark-company p {
  color: #64748b;
  font-size: 0.75rem;
  margin: 0.25rem 0;
}

.footer-dark-copy {
  color: #475569;
  font-size: 0.75rem;
}

/* Habits Preview V2 */
.habits-preview-v2 {
  padding: 1.5rem;
}

.habits-header-v2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.habits-icon-v2 {
  width: 2.5rem;
  height: 2.5rem;
  background: #e0f2fe;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0ea5e9;
}

.habits-title-v2 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  flex: 1;
}

.habits-today-v2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8fafc;
  border-radius: 9999px;
  font-size: 0.875rem;
  color: #64748b;
}

.today-dot {
  width: 0.5rem;
  height: 0.5rem;
  background: #10b981;
  border-radius: 50%;
}

.habits-list-v2 {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.habit-card-v2 {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1rem 1.25rem;
}

.habit-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.habit-icon-v2 {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.habit-icon-v2.habit-orange {
  background: #fff7ed;
  color: #f97316;
}

.habit-icon-v2.habit-green-v2 {
  background: #dcfce7;
  color: #22c55e;
}

.habit-icon-v2.habit-pink-v2 {
  background: #fce7f3;
  color: #ec4899;
}

.habit-name-v2 {
  flex: 1;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
}

.habit-xp-v2 {
  font-size: 0.875rem;
  font-weight: 700;
  color: #10b981;
}

.habit-days-v2 {
  display: flex;
  gap: 0.5rem;
  padding-left: 3rem;
}

.day-v2 {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  background: #f1f5f9;
  color: #94a3b8;
}

.day-v2.done {
  background: #10b981;
  color: white;
}

.day-v2.current {
  background: white;
  border: 2px solid #10b981;
  color: #10b981;
}

.day-v2.more {
  background: transparent;
  color: #94a3b8;
}

/* XP Preview V3 */
.xp-preview-v3 {
  padding: 1.25rem;
}

.xp-status-bar-v3 {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #ecfdf5;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #10b981;
  margin-bottom: 1rem;
}

.xp-balance-card-v3 {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1rem;
}

.xp-balance-label-v3 {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 0.25rem 0;
}

.xp-balance-value-v3 {
  font-size: 2.5rem;
  font-weight: 900;
  color: white;
  margin: 0;
  line-height: 1;
}

.xp-balance-value-v3 span {
  font-size: 1.5rem;
  font-weight: 700;
  margin-left: 0.25rem;
}

.xp-mentor-tip-v3 {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
}

.mentor-avatar-v3 {
  width: 2rem;
  height: 2rem;
  background: #6366f1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.xp-mentor-tip-v3 p {
  font-size: 0.8rem;
  color: #475569;
  line-height: 1.5;
  margin: 0;
}

.xp-mentor-tip-v3 .mentor-name {
  font-weight: 700;
  color: #6366f1;
}

.xp-rewards-list-v3 {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reward-row-v3 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.reward-row-v3.highlighted {
  background: #eff6ff;
  border-color: #3b82f6;
}

.reward-check-v3 {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.reward-check-v3.received {
  background: #f1f5f9;
  color: #94a3b8;
}

.reward-check-v3.available {
  background: #3b82f6;
  color: white;
}

.reward-check-v3.pending {
  background: #f1f5f9;
  color: #64748b;
}

.reward-info-v3 {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.reward-name-v3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
}

.reward-cost-v3 {
  font-size: 0.75rem;
  color: #64748b;
}

.reward-status-v3 {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

.reward-btn-v3 {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.reward-percent-v3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
}
</style>
