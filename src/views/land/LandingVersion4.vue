<template>
  <div class="landing-v4">
    <section id="balance" class="section balance-section">
      <div class="container">
        <h1 class="section-title">Где ты прямо сейчас?</h1>
        <p class="section-subtitle">Диагностика по 6 сферам жизни за 2 минуты</p>
        
        <div class="balance-content">
          <div class="wheel-container">
            <svg viewBox="0 0 300 300" class="balance-wheel">
              <g v-for="(sphere, index) in spheres" :key="sphere.name">
                <path 
                  :d="getWedgePath(index, sphere.value)"
                  :fill="sphere.color"
                  :opacity="0.3 + (sphere.value / 10) * 0.7"
                />
                <text 
                  :x="getLabelPosition(index).x" 
                  :y="getLabelPosition(index).y"
                  class="sphere-label"
                  text-anchor="middle"
                >
                  {{ sphere.icon }}
                </text>
              </g>
              <circle cx="150" cy="150" r="30" fill="#F5F3FF" />
            </svg>
          </div>
          
          <div class="sphere-stats">
            <div 
              v-for="sphere in spheres" 
              :key="sphere.name" 
              class="sphere-stat"
              :class="{ critical: sphere.value <= 4, strong: sphere.value >= 7 }"
            >
              <span class="stat-name">{{ sphere.name }}</span>
              <span class="stat-value">{{ sphere.value }}/10</span>
              <span class="stat-badge" v-if="sphere.value <= 4">🔴 Критическая зона</span>
              <span class="stat-badge" v-else-if="sphere.value >= 7">🟢 Сильная сторона</span>
            </div>
          </div>
        </div>

        <div class="examples-row">
          <div class="example-card">
            <span class="example-from">Здоровье 4/10</span>
            <span class="arrow">→</span>
            <span class="example-to">Спорт 3х/неделю</span>
          </div>
          <div class="example-card">
            <span class="example-from">Финансы 5/10</span>
            <span class="arrow">→</span>
            <span class="example-to">+20% к доходу</span>
          </div>
        </div>

        <div class="accordion" :class="{ open: accordionOpen.diagnostics }">
          <button class="accordion-trigger" @click="toggleAccordion('diagnostics')">
            <span>Как работает диагностика?</span>
            <span class="accordion-icon">{{ accordionOpen.diagnostics ? '▲' : '▼' }}</span>
          </button>
          <div class="accordion-content" v-show="accordionOpen.diagnostics">
            <div class="accordion-inner">
              <h4>📊 AI анализирует 3 фактора:</h4>
              <div class="factor">
                <strong>1. Твои ответы на 8 уточняющих вопросов</strong>
                <ul>
                  <li>"Как часто ты чувствуешь усталость?"</li>
                  <li>"Когда последний раз был на тренировке?"</li>
                  <li>"Доволен ли текущим доходом?"</li>
                </ul>
              </div>
              <div class="factor">
                <strong>2. Баланс между сферами жизни</strong>
                <p>AI смотрит на разрыв между высокими и низкими показателями. Большой разрыв = риск выгорания.</p>
              </div>
              <div class="factor">
                <strong>3. Твои приоритеты по важности</strong>
                <p>Ты указываешь что важнее: карьера или семья, здоровье или деньги. AI учитывает это при формировании целей.</p>
              </div>
              <div class="accordion-stats">
                <span>⏱ Время: 2 минуты</span>
                <span>✓ Точность: 87% совпадения с оценкой психолога</span>
              </div>
              <button class="cta-button small" @click="scrollToFinalCta">
                Пройти диагностику сейчас →
              </button>
            </div>
          </div>
        </div>

        <button class="cta-button" @click="scrollToFinalCta">
          Получить персональный план за 2 минуты →
        </button>

        <div class="review-compact">
          <p>"За 2 минуты увидел то, что сам не замечал годами" — <strong>Алексей, 34</strong></p>
        </div>
      </div>
    </section>

    <section id="goals" class="section goals-section">
      <div class="container">
        <h2 class="section-title">AI превратил проблемы в цели за 90 секунд</h2>
        
        <div class="goals-content">
          <div class="ai-explanation">
            <div class="ai-avatar">🤖</div>
            <div class="ai-speech">
              <p>Я проанализировал твои ответы. Вижу 3 зоны роста: здоровье, финансы и отношения. Вот персональные цели на месяц.</p>
            </div>
          </div>
          
          <div class="goals-cards">
            <div class="goal-card" v-for="goal in goals" :key="goal.title">
              <div class="goal-icon" :style="{ backgroundColor: goal.color }">{{ goal.icon }}</div>
              <h4>{{ goal.title }}</h4>
              <p>{{ goal.description }}</p>
            </div>
          </div>
        </div>

        <div class="decomposition-preview">
          <div class="decomposition-header">Пример декомпозиции:</div>
          <div class="decomposition-flow">
            <span class="flow-item from">Здоровье 4/10</span>
            <span class="flow-arrow">→</span>
            <span class="flow-item goal">Спорт 3х/неделю</span>
          </div>
          <div class="decomposition-weeks">
            <div class="week">Неделя 1: Выбрать спорт, купить форму</div>
            <div class="week">Неделя 2-4: От 2 до 3 тренировок</div>
          </div>
        </div>

        <div class="accordion" :class="{ open: accordionOpen.goals }">
          <button class="accordion-trigger" @click="toggleAccordion('goals')">
            <span>Как AI формирует цели?</span>
            <span class="accordion-icon">{{ accordionOpen.goals ? '▲' : '▼' }}</span>
          </button>
          <div class="accordion-content" v-show="accordionOpen.goals">
            <div class="accordion-inner">
              <h4>🎯 AI трансформирует проблемы по формуле:</h4>
              <div class="formula">
                Низкий балл → Анализ причин → Конкретная цель → Измеримый результат → План действий
              </div>
              <div class="transformation-example">
                <div class="transform-step">🔴 Здоровье 4/10</div>
                <div class="transform-arrow">↓</div>
                <div class="transform-step">Причина: Нет физической активности</div>
                <div class="transform-arrow">↓</div>
                <div class="transform-step">Цель: Спорт 3 раза в неделю</div>
                <div class="transform-arrow">↓</div>
                <div class="transform-step">Результат: Здоровье поднимется до 7-8/10</div>
                <div class="transform-arrow">↓</div>
                <div class="transform-step">План: 4 недели от подготовки до привычки</div>
              </div>
              <div class="why-works">
                <h5>💡 Почему это работает:</h5>
                <ul>
                  <li>Цель конкретная и измеримая</li>
                  <li>Связана с реальной проблемой</li>
                  <li>Разбита на выполнимые шаги</li>
                  <li>Учитывает твою текущую загрузку</li>
                </ul>
              </div>
              <button class="cta-button small" @click="scrollToFinalCta">
                Получить мои цели →
              </button>
            </div>
          </div>
        </div>

        <button class="cta-button" @click="scrollToFinalCta">
          Получить мой план на месяц →
        </button>
        <p class="cta-subtext">Бесплатно • Без регистрации</p>

        <div class="review-compact">
          <p>"AI сформулировал за меня то, что я не мог объяснить даже психологу" — <strong>Мария, 28</strong></p>
        </div>
      </div>
    </section>

    <section id="decomposition" class="section decomposition-section">
      <div class="transition-phrase">
        Цели есть. Теперь разобьём их на конкретные шаги по дням.
      </div>
      <div class="container">
        <h2 class="section-title">Твой план на первую неделю</h2>
        
        <div class="steps-timeline">
          <div 
            v-for="(step, index) in weekSteps" 
            :key="index" 
            class="step-item"
            :class="{ completed: step.completed }"
          >
            <div class="step-marker">
              <span class="step-day">{{ step.day }}</span>
              <span class="step-date">{{ step.date }}</span>
            </div>
            <div class="step-content">
              <span class="step-icon">{{ step.icon }}</span>
              <span class="step-text">{{ step.text }}</span>
            </div>
            <div class="step-status">
              <span v-if="step.completed" class="checkmark">✓</span>
            </div>
          </div>
          <div class="step-item final">
            <div class="step-marker">
              <span class="step-day">Результат</span>
            </div>
            <div class="step-content">
              <span class="step-icon">🏆</span>
              <span class="step-text">Цель достигнута</span>
            </div>
          </div>
        </div>

        <div class="telegram-reminder">
          📲 Telegram-бот будет напоминать о каждом шаге
        </div>

        <div class="ai-quote">
          <span class="quote-icon">🤖</span>
          <p>"Каждый шаг занимает 15-30 минут. Я буду рядом, если что-то пойдёт не так."</p>
        </div>

        <div class="review-compact">
          <p>"Первую неделю прошёл легко — всё разложено по полочкам" — <strong>Дмитрий, 31</strong></p>
        </div>
      </div>
    </section>

    <section id="planning" class="section planning-section">
      <div class="container">
        <h2 class="section-title">AI вписал задачи в твой календарь</h2>
        <p class="section-description">AI спросил про твою загрузку и вписал задачи в свободные дни. Можешь перетащить на другой день.</p>
        
        <div class="calendar-demo">
          <div class="calendar-header">
            <div class="day-name" v-for="day in weekDays" :key="day">{{ day }}</div>
          </div>
          <div class="calendar-grid">
            <div 
              v-for="(tasks, dayIndex) in calendarTasks" 
              :key="dayIndex" 
              class="calendar-day"
              :class="{ 'has-tasks': tasks.length > 0 }"
            >
              <div v-for="task in tasks" :key="task.text" class="calendar-task" :class="task.priority">
                {{ task.text }}
              </div>
            </div>
          </div>
        </div>

        <div class="tasks-list">
          <div class="tasks-header">
            <span>Задачи на неделю</span>
            <span class="tasks-progress">3 из 5 выполнено</span>
          </div>
          <div 
            v-for="(task, index) in planningTasks" 
            :key="index" 
            class="task-item"
            :class="{ done: task.done }"
          >
            <span class="task-checkbox">{{ task.done ? '✓' : '○' }}</span>
            <span class="task-text">{{ task.text }}</span>
          </div>
        </div>

        <div class="review-compact">
          <p>"Перетащил тренировку на среду — AI сам перестроил остальное" — <strong>Игорь, 27</strong></p>
        </div>
      </div>
    </section>

    <section id="habits" class="section habits-section">
      <div class="transition-phrase">
        Прошёл месяц. Цель "Спорт 3х/неделю" стала привычкой. AI добавил 2 микропривычки для усиления результата.
      </div>
      <div class="container">
        <h2 class="section-title">Месяц пройден — привычка сформирована</h2>
        
        <div class="habits-content">
          <div class="streak-calendar">
            <div class="streak-header">
              <span class="streak-title">🔥 14 дней подряд</span>
            </div>
            <div class="streak-grid">
              <div 
                v-for="day in 28" 
                :key="day" 
                class="streak-day"
                :class="{ 
                  active: day <= 14, 
                  current: day === 14,
                  future: day > 14 
                }"
              >
                {{ day <= 14 ? '✓' : '' }}
              </div>
            </div>
          </div>

          <div class="habits-list">
            <div v-for="habit in habits" :key="habit.name" class="habit-item">
              <span class="habit-icon">{{ habit.icon }}</span>
              <span class="habit-name">{{ habit.name }}</span>
              <span class="habit-xp">+{{ habit.xp }} XP</span>
            </div>
          </div>
        </div>

        <div class="xp-explanation">
          <p>За каждую привычку — опыт (XP). Копи XP → получай награды за прогресс.</p>
        </div>

        <div class="xp-today">
          <span class="xp-icon">⭐</span>
          <span>Сегодня заработал: <strong>+45 XP</strong></span>
        </div>

        <div class="review-compact">
          <p>"Игровой элемент неожиданно затягивает. Уже 30 дней без пропусков" — <strong>Анна, 25</strong></p>
        </div>
      </div>
    </section>

    <section id="rewards" class="section rewards-section">
      <div class="transition-phrase">
        Прошло 3 месяца. 2450 XP заработано. Время наградить себя за прогресс.
      </div>
      <div class="container">
        <h2 class="section-title">Заработал 2450 XP — пора порадовать себя</h2>
        
        <p class="rewards-explanation">XP = валюта для твоих желаний. Ты сам выбираешь награды и цену в XP.</p>

        <div class="rewards-list">
          <div v-for="reward in rewards" :key="reward.name" class="reward-item">
            <div class="reward-info">
              <span class="reward-icon">{{ reward.icon }}</span>
              <span class="reward-name">{{ reward.name }}</span>
            </div>
            <div class="reward-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: reward.progress + '%' }"></div>
              </div>
              <span class="reward-xp">{{ reward.current }}/{{ reward.total }} XP</span>
            </div>
            <span v-if="reward.earned" class="reward-earned">Получено!</span>
          </div>
        </div>

        <div class="ai-recommendation">
          <span class="ai-avatar">🤖</span>
          <p>Рекомендую: массаж за 800 XP. У тебя достаточно — побалуй себя!</p>
        </div>

        <div class="review-compact">
          <p>"Заработал на новые кроссовки своими привычками. Теперь бегаю с удовольствием" — <strong>Сергей, 33</strong></p>
        </div>
      </div>
    </section>

    <section id="mentor" class="section mentor-section">
      <div class="transition-phrase">
        Главная проблема: 68% бросают после 3 месяцев. Решение: AI Ментор в Telegram поддерживает каждый день.
      </div>
      <div class="container">
        <h2 class="section-title">Персональный коуч на связи 24/7</h2>
        <p class="section-description">4 сообщения в день: утром мотивирует, днём напоминает, вечером анализирует.</p>

        <div class="mentor-content">
          <div class="phone-mockup">
            <div class="phone-screen">
              <div class="chat-messages">
                <div class="chat-message ai">
                  <span class="time">08:00</span>
                  <p>Привет! ☀️ Сегодня тренировка в 18:00. Готов? 💪</p>
                </div>
                <div class="chat-message user">
                  <p>Потренировался! 💪</p>
                </div>
                <div class="chat-message ai">
                  <span class="time">18:30</span>
                  <p>Отлично! 🔥 Это твой 7-й день подряд. +1% каждый день = 37x за год 🎯</p>
                </div>
              </div>
            </div>
          </div>

          <div class="mentor-tabs">
            <div class="tabs-header">
              <button 
                v-for="tab in mentorTabs" 
                :key="tab.id"
                class="tab-button"
                :class="{ active: activeMentorTab === tab.id }"
                @click="activeMentorTab = tab.id"
              >
                {{ tab.label }}
              </button>
            </div>
            
            <div class="tab-content" v-show="activeMentorTab === 'overview'">
              <h4>Типичный день с AI Ментором</h4>
              <div class="day-schedule">
                <div class="schedule-item">
                  <span class="schedule-time">🌅 Утро (08:00)</span>
                  <span class="schedule-role">Мотиватор</span>
                  <p>"Привет! ☀️ Сегодня тренировка в 18:00. Готов? 💪"</p>
                </div>
                <div class="schedule-item">
                  <span class="schedule-time">🌞 День (14:00)</span>
                  <span class="schedule-role">Напоминатель</span>
                  <p>"Не забудь про обед дома. Это одна из твоих привычек! 🔔"</p>
                </div>
                <div class="schedule-item">
                  <span class="schedule-time">🌙 Вечер (21:00)</span>
                  <span class="schedule-role">Трекер</span>
                  <p>"Время отчёта! Ты тренировался? Ел здоровую пищу? 🎯"</p>
                </div>
                <div class="schedule-item">
                  <span class="schedule-time">🌃 Ночь (21:15)</span>
                  <span class="schedule-role">Аналитик</span>
                  <p>"Отлично! 🔥 7-й день подряд. 5 из 6. Что помешало 6-му?"</p>
                </div>
              </div>
            </div>
            
            <div class="tab-content" v-show="activeMentorTab === 'dialogs'">
              <div class="dialog-subtabs">
                <button 
                  v-for="subTab in dialogSubTabs" 
                  :key="subTab.id"
                  class="subtab-button"
                  :class="{ active: activeDialogSubTab === subTab.id }"
                  @click="activeDialogSubTab = subTab.id"
                >
                  {{ subTab.label }}
                </button>
              </div>
              
              <div class="dialog-content" v-show="activeDialogSubTab === 'morning'">
                <h5>Утренний диалог (08:00)</h5>
                <div class="dialog-demo">
                  <div class="msg ai">Привет! ☀️ Как у тебя дела со спортом? Сегодня у тебя запланирована тренировка в 18:00. Готов? 💪</div>
                  <div class="msg user">Потренировался! 💪</div>
                  <div class="msg ai">Отлично! 🔥 Это твой 7-й день подряд. Горячая полоса начинается с 7! +1% каждый день = 37x за год 🎯</div>
                </div>
              </div>
              
              <div class="dialog-content" v-show="activeDialogSubTab === 'day'">
                <h5>Дневное напоминание (14:00)</h5>
                <div class="dialog-demo">
                  <div class="msg ai">Напоминание: не забудь про обед дома. Это одна из твоих привычек! 🔔</div>
                  <div class="msg-buttons">
                    <span class="btn-option">✓ Выполнено</span>
                    <span class="btn-option">✗ Пропустил</span>
                    <span class="btn-option">⏰ Позже</span>
                  </div>
                  <div class="msg user">[нажал "Выполнено"]</div>
                  <div class="msg ai">Супер! 🎉 +10 XP. Серия: 14 дней. Продолжай в том же духе!</div>
                </div>
              </div>
              
              <div class="dialog-content" v-show="activeDialogSubTab === 'evening'">
                <h5>Вечерний отчёт (21:00)</h5>
                <div class="dialog-demo">
                  <div class="msg ai">Время отчёта! Расскажи как дела. Ты тренировался? Ел здоровую пищу? 🎯</div>
                  <div class="habits-check">
                    <div class="habit-check done">✓ Утренняя зарядка</div>
                    <div class="habit-check done">✓ Пить воду</div>
                    <div class="habit-check missed">✗ Чтение 30 мин</div>
                  </div>
                  <div class="msg ai">Отлично! 2 из 3 ✓. Сегодня заработал: +25 XP. Что помешало почитать?</div>
                </div>
              </div>
              
              <div class="dialog-content" v-show="activeDialogSubTab === 'analysis'">
                <h5>Ночной анализ (21:15)</h5>
                <div class="dialog-demo">
                  <div class="msg ai">Отлично! 🔥 Это твой 7-й день подряд. Выполнил 5 из 6 пунктов. Что помешало 6-му?</div>
                  <div class="msg user">Забыл про воду</div>
                  <div class="msg ai">Понятно. Ставлю напоминание на 12:00 и 18:00. Так ты не забудешь. Договорились? 💧</div>
                  <div class="msg ai">Кстати, заметил паттерн: в среду ты чаще пропускаешь воду. Может среда более загруженный день? Предлагаю поставить 3 напоминания вместо 2 по средам.</div>
                  <div class="msg-buttons">
                    <span class="btn-option">Да, изменить</span>
                    <span class="btn-option">Нет, оставить как есть</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="faq-section">
          <div class="accordion" :class="{ open: accordionOpen.mentorFaq }">
            <button class="accordion-trigger" @click="toggleAccordion('mentorFaq')">
              <span>Частые вопросы про AI Ментора</span>
              <span class="accordion-icon">{{ accordionOpen.mentorFaq ? '▲' : '▼' }}</span>
            </button>
            <div class="accordion-content" v-show="accordionOpen.mentorFaq">
              <div class="accordion-inner">
                <div class="faq-item">
                  <p class="faq-q">❓ AI реально умный или это просто рассылка?</p>
                  <p class="faq-a">💬 AI подключён к твоему профилю OnePercent и видит: какие привычки выполнил, серии и провалы, паттерны поведения. На основе этого адаптирует сообщения и советы.</p>
                </div>
                <div class="faq-item">
                  <p class="faq-q">❓ Можно отключить бота если надоест?</p>
                  <p class="faq-a">💬 Да, в любой момент командой /stop в Telegram. Или просто не отвечай — AI поймёт намёк.</p>
                </div>
                <div class="faq-item">
                  <p class="faq-q">❓ Бот видит мои личные сообщения в Telegram?</p>
                  <p class="faq-a">💬 Нет! Бот работает только в диалоге с тобой и видит только то, что ты ему пишешь.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button class="cta-button primary" @click="scrollToFinalCta">
          Начать бесплатно →
        </button>

        <div class="review-compact">
          <p>"Как будто коуч в кармане. Только без счетов на 50к в месяц" — <strong>Ольга, 29</strong></p>
        </div>
      </div>
    </section>

    <section id="final-cta" class="section final-cta-section">
      <div class="container">
        <h2 class="section-title">Ты прошёл путь от диагностики до результата</h2>
        
        <div class="journey-checklist">
          <div class="checklist-item">✓ Увидел свои проблемные зоны</div>
          <div class="checklist-item">✓ Получил персональные цели от AI</div>
          <div class="checklist-item">✓ План на месяц разбит по дням</div>
          <div class="checklist-item">✓ Система привычек с геймификацией</div>
          <div class="checklist-item">✓ Награды за прогресс</div>
          <div class="checklist-item">✓ AI поддержка 24/7 в Telegram</div>
        </div>

        <div class="cta-block">
          <h3>Начни прямо сейчас:</h3>
          <a href="https://t.me/onepercent_bot" target="_blank" class="cta-button large">
            Пройти диагностику за 2 минуты →
          </a>
          <div class="cta-benefits">
            <span>• Без банковской карты</span>
            <span>• Без регистрации на первом шаге</span>
            <span>• Отменить можно в 1 клик</span>
          </div>
        </div>

        <div class="social-proof">
          🔥 2,847 человек уже растут на 1% каждый день
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const spheres = ref([
  { name: 'Здоровье', value: 4, color: '#EF4444', icon: '💪' },
  { name: 'Карьера', value: 8, color: '#22C55E', icon: '💼' },
  { name: 'Финансы', value: 5, color: '#F59E0B', icon: '💰' },
  { name: 'Отношения', value: 6, color: '#EC4899', icon: '❤️' },
  { name: 'Развитие', value: 7, color: '#8B5CF6', icon: '📚' },
  { name: 'Отдых', value: 3, color: '#06B6D4', icon: '🌴' }
])

const goals = ref([
  { title: 'Спорт 3х/неделю', description: 'Повысить здоровье с 4 до 7', icon: '💪', color: '#FEE2E2' },
  { title: '+20% к доходу', description: 'Улучшить финансовую стабильность', icon: '💰', color: '#FEF3C7' },
  { title: 'Качественный отдых', description: 'Восстановить баланс работы и отдыха', icon: '🌴', color: '#CFFAFE' }
])

const weekSteps = ref([
  { day: 'День 1', date: '(сегодня)', icon: '🎯', text: 'Выбрать вид спорта', completed: true },
  { day: 'День 2', date: '(завтра)', icon: '🛒', text: 'Купить форму', completed: true },
  { day: 'День 3', date: '', icon: '🏃', text: 'Первая тренировка', completed: false },
  { day: 'День 7', date: '', icon: '🔄', text: 'Привыкнуть к ритму', completed: false }
])

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const calendarTasks = ref([
  [{ text: 'Выбрать спорт', priority: 'high' }],
  [{ text: 'Купить форму', priority: 'medium' }],
  [],
  [{ text: 'Тренировка', priority: 'high' }],
  [],
  [{ text: 'Тренировка', priority: 'high' }],
  [{ text: 'Отдых', priority: 'low' }]
])

const planningTasks = ref([
  { text: 'Выбрать вид спорта', done: true },
  { text: 'Купить форму и обувь', done: true },
  { text: 'Первая тренировка', done: true },
  { text: 'Вторая тренировка', done: false },
  { text: 'Третья тренировка', done: false }
])

const habits = ref([
  { name: 'Утренняя зарядка', icon: '🏃', xp: 15 },
  { name: 'Пить воду (8 стаканов)', icon: '💧', xp: 10 },
  { name: 'Чтение 30 мин', icon: '📚', xp: 20 }
])

const rewards = ref([
  { name: 'Массаж', icon: '💆', current: 800, total: 800, progress: 100, earned: true },
  { name: 'Новые кроссовки', icon: '👟', current: 1200, total: 1500, progress: 80, earned: false },
  { name: 'Выходные в спа', icon: '🧖', current: 450, total: 2000, progress: 22, earned: false },
  { name: 'Новая игра PS5', icon: '🎮', current: 0, total: 1500, progress: 0, earned: false }
])

const mentorTabs = [
  { id: 'overview', label: 'Обзор' },
  { id: 'dialogs', label: 'Примеры диалогов' }
]

const dialogSubTabs = [
  { id: 'morning', label: 'Утро' },
  { id: 'day', label: 'День' },
  { id: 'evening', label: 'Вечер' },
  { id: 'analysis', label: 'Анализ' }
]

const activeMentorTab = ref('overview')
const activeDialogSubTab = ref('morning')

const accordionOpen = ref({
  diagnostics: false,
  goals: false,
  mentorFaq: false
})

function toggleAccordion(key) {
  accordionOpen.value[key] = !accordionOpen.value[key]
}

function getWedgePath(index, value) {
  const total = 6
  const anglePerSlice = (2 * Math.PI) / total
  const startAngle = index * anglePerSlice - Math.PI / 2
  const endAngle = startAngle + anglePerSlice
  const radius = 40 + (value / 10) * 80
  const cx = 150
  const cy = 150
  
  const x1 = cx + radius * Math.cos(startAngle)
  const y1 = cy + radius * Math.sin(startAngle)
  const x2 = cx + radius * Math.cos(endAngle)
  const y2 = cy + radius * Math.sin(endAngle)
  
  const largeArcFlag = anglePerSlice > Math.PI ? 1 : 0
  
  return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
}

function getLabelPosition(index) {
  const total = 6
  const anglePerSlice = (2 * Math.PI) / total
  const angle = index * anglePerSlice + anglePerSlice / 2 - Math.PI / 2
  const radius = 130
  const cx = 150
  const cy = 150
  
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle) + 5
  }
}

function scrollToFinalCta() {
  document.getElementById('final-cta')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.landing-v4 {
  background-color: #F5F3FF;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.section {
  min-height: 100vh;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1F2937;
  text-align: center;
  margin-bottom: 12px;
}

.section-subtitle,
.section-description {
  font-size: 1.1rem;
  color: #6B7280;
  text-align: center;
  margin-bottom: 32px;
}

.transition-phrase {
  background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
  color: white;
  padding: 16px 24px;
  border-radius: 12px;
  text-align: center;
  font-size: 1rem;
  margin-bottom: 32px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.balance-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
  margin-bottom: 24px;
}

.wheel-container {
  display: flex;
  justify-content: center;
}

.balance-wheel {
  width: 280px;
  height: 280px;
}

.sphere-label {
  font-size: 24px;
}

.sphere-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sphere-stat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.stat-name {
  flex: 1;
  font-weight: 500;
  color: #374151;
}

.stat-value {
  font-weight: 700;
  color: #1F2937;
}

.stat-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  background: #FEE2E2;
  color: #DC2626;
}

.sphere-stat.strong .stat-badge {
  background: #D1FAE5;
  color: #059669;
}

.examples-row {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
}

.example-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.example-from {
  color: #DC2626;
  font-weight: 500;
}

.arrow {
  color: #9CA3AF;
}

.example-to {
  color: #059669;
  font-weight: 600;
}

.accordion {
  margin-bottom: 24px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.accordion-trigger {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: #6366F1;
  text-align: left;
}

.accordion-icon {
  font-size: 0.8rem;
  transition: transform 0.3s;
}

.accordion.open .accordion-icon {
  transform: rotate(180deg);
}

.accordion-content {
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.accordion-inner {
  padding: 0 20px 20px;
}

.accordion-inner h4 {
  color: #1F2937;
  margin-bottom: 16px;
}

.factor {
  margin-bottom: 16px;
}

.factor strong {
  color: #374151;
}

.factor ul {
  margin: 8px 0 0 20px;
  color: #6B7280;
}

.factor p {
  color: #6B7280;
  margin-top: 4px;
}

.accordion-stats {
  display: flex;
  gap: 24px;
  margin: 16px 0;
  color: #6B7280;
}

.cta-button {
  display: block;
  margin: 0 auto 16px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
}

.cta-button.small {
  padding: 12px 24px;
  font-size: 0.95rem;
}

.cta-button.large {
  padding: 20px 40px;
  font-size: 1.2rem;
  text-decoration: none;
}

.cta-button.primary {
  background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
}

.cta-subtext {
  text-align: center;
  color: #6B7280;
  font-size: 0.9rem;
  margin-bottom: 16px;
}

.review-compact {
  text-align: center;
  color: #6B7280;
  font-size: 0.9rem;
  font-style: italic;
  padding: 16px;
  background: rgba(255,255,255,0.5);
  border-radius: 8px;
  margin-top: 16px;
}

.review-compact strong {
  color: #374151;
}

.goals-content {
  margin-bottom: 24px;
}

.ai-explanation {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 12px;
}

.ai-avatar {
  font-size: 2rem;
}

.ai-speech {
  flex: 1;
  color: #374151;
  line-height: 1.6;
}

.goals-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.goal-card {
  padding: 20px;
  background: white;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.goal-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  border-radius: 12px;
  font-size: 1.5rem;
}

.goal-card h4 {
  color: #1F2937;
  margin-bottom: 8px;
}

.goal-card p {
  color: #6B7280;
  font-size: 0.9rem;
}

.decomposition-preview {
  padding: 20px;
  background: white;
  border-radius: 12px;
  margin-bottom: 24px;
}

.decomposition-header {
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.decomposition-flow {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.flow-item {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
}

.flow-item.from {
  background: #FEE2E2;
  color: #DC2626;
}

.flow-item.goal {
  background: #D1FAE5;
  color: #059669;
}

.flow-arrow {
  color: #9CA3AF;
  font-size: 1.2rem;
}

.decomposition-weeks {
  padding-left: 16px;
  border-left: 3px solid #E5E7EB;
}

.decomposition-weeks .week {
  padding: 8px 0;
  color: #6B7280;
}

.formula {
  padding: 16px;
  background: #EEF2FF;
  border-radius: 8px;
  color: #4F46E5;
  font-weight: 500;
  text-align: center;
  margin-bottom: 16px;
}

.transformation-example {
  padding: 16px;
  background: #F9FAFB;
  border-radius: 8px;
  margin-bottom: 16px;
}

.transform-step {
  padding: 8px;
  text-align: center;
  color: #374151;
}

.transform-arrow {
  text-align: center;
  color: #9CA3AF;
}

.why-works h5 {
  color: #374151;
  margin-bottom: 8px;
}

.why-works ul {
  margin-left: 20px;
  color: #6B7280;
}

.steps-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  position: relative;
}

.step-item::before {
  content: '';
  position: absolute;
  left: 60px;
  top: 100%;
  width: 2px;
  height: 16px;
  background: linear-gradient(to bottom, #E5E7EB, transparent);
}

.step-item:last-child::before {
  display: none;
}

.step-item.completed {
  background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
}

.step-item.final {
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
}

.step-marker {
  min-width: 100px;
}

.step-day {
  display: block;
  font-weight: 600;
  color: #1F2937;
}

.step-date {
  font-size: 0.8rem;
  color: #6B7280;
}

.step-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.step-icon {
  font-size: 1.5rem;
}

.step-text {
  font-weight: 500;
  color: #374151;
}

.step-status .checkmark {
  color: #059669;
  font-size: 1.5rem;
  font-weight: 700;
}

.telegram-reminder {
  text-align: center;
  padding: 12px 20px;
  background: #DBEAFE;
  color: #1D4ED8;
  border-radius: 8px;
  margin-bottom: 16px;
}

.ai-quote {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  margin-bottom: 16px;
}

.quote-icon {
  font-size: 1.5rem;
}

.ai-quote p {
  color: #374151;
  font-style: italic;
}

.calendar-demo {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.day-name {
  text-align: center;
  font-weight: 600;
  color: #6B7280;
  font-size: 0.9rem;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-day {
  min-height: 80px;
  padding: 8px;
  background: #F9FAFB;
  border-radius: 8px;
}

.calendar-day.has-tasks {
  background: #EEF2FF;
}

.calendar-task {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-bottom: 4px;
  background: white;
}

.calendar-task.high {
  border-left: 3px solid #EF4444;
}

.calendar-task.medium {
  border-left: 3px solid #F59E0B;
}

.calendar-task.low {
  border-left: 3px solid #22C55E;
}

.tasks-list {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-weight: 600;
  color: #374151;
}

.tasks-progress {
  color: #059669;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #E5E7EB;
}

.task-item:last-child {
  border-bottom: none;
}

.task-item.done {
  opacity: 0.7;
}

.task-item.done .task-text {
  text-decoration: line-through;
}

.task-checkbox {
  font-size: 1.2rem;
  color: #22C55E;
}

.task-text {
  color: #374151;
}

.habits-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.streak-calendar {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.streak-header {
  text-align: center;
  margin-bottom: 16px;
}

.streak-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #F59E0B;
}

.streak-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.streak-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F3F4F6;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #9CA3AF;
}

.streak-day.active {
  background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
  color: white;
  font-weight: 600;
}

.streak-day.current {
  box-shadow: 0 0 0 3px #F59E0B;
}

.streak-day.future {
  background: #E5E7EB;
}

.habits-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.habit-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
}

.habit-icon {
  font-size: 1.5rem;
}

.habit-name {
  flex: 1;
  font-weight: 500;
  color: #374151;
}

.habit-xp {
  padding: 4px 12px;
  background: #FEF3C7;
  color: #D97706;
  border-radius: 16px;
  font-weight: 600;
  font-size: 0.9rem;
}

.xp-explanation {
  text-align: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  color: #6B7280;
  margin-bottom: 16px;
}

.xp-today {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  border-radius: 12px;
  color: #92400E;
  font-weight: 500;
}

.xp-icon {
  font-size: 1.2rem;
}

.rewards-explanation {
  text-align: center;
  color: #6B7280;
  margin-bottom: 24px;
}

.rewards-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
}

.reward-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 160px;
}

.reward-icon {
  font-size: 1.5rem;
}

.reward-name {
  font-weight: 500;
  color: #374151;
}

.reward-progress {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8B5CF6 0%, #6366F1 100%);
  border-radius: 4px;
  transition: width 0.3s;
}

.reward-xp {
  font-size: 0.9rem;
  color: #6B7280;
  min-width: 100px;
}

.reward-earned {
  padding: 4px 12px;
  background: #D1FAE5;
  color: #059669;
  border-radius: 16px;
  font-weight: 600;
  font-size: 0.85rem;
}

.ai-recommendation {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
  border-radius: 12px;
  margin-bottom: 16px;
}

.ai-recommendation p {
  color: #4F46E5;
}

.mentor-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 32px;
  margin-bottom: 24px;
}

.phone-mockup {
  background: #1F2937;
  border-radius: 32px;
  padding: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.phone-screen {
  background: #374151;
  border-radius: 24px;
  padding: 16px;
  min-height: 400px;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-message {
  padding: 12px;
  border-radius: 16px;
  max-width: 85%;
}

.chat-message.ai {
  background: white;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}

.chat-message.user {
  background: #8B5CF6;
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}

.chat-message .time {
  display: block;
  font-size: 0.7rem;
  color: #9CA3AF;
  margin-bottom: 4px;
}

.chat-message p {
  margin: 0;
  font-size: 0.9rem;
}

.mentor-tabs {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid #E5E7EB;
}

.tab-button {
  flex: 1;
  padding: 16px;
  background: transparent;
  border: none;
  font-weight: 500;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-button.active {
  color: #6366F1;
  border-bottom: 2px solid #6366F1;
  margin-bottom: -1px;
}

.tab-content {
  padding: 20px;
}

.tab-content h4 {
  color: #1F2937;
  margin-bottom: 16px;
}

.day-schedule {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.schedule-item {
  padding: 16px;
  background: #F9FAFB;
  border-radius: 8px;
}

.schedule-time {
  font-weight: 600;
  color: #1F2937;
}

.schedule-role {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  background: #EEF2FF;
  color: #6366F1;
  border-radius: 12px;
  font-size: 0.8rem;
}

.schedule-item p {
  margin-top: 8px;
  color: #6B7280;
  font-style: italic;
}

.dialog-subtabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.subtab-button {
  padding: 8px 16px;
  background: #F3F4F6;
  border: none;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
}

.subtab-button.active {
  background: #6366F1;
  color: white;
}

.dialog-content h5 {
  color: #374151;
  margin-bottom: 12px;
}

.dialog-demo {
  background: #F9FAFB;
  border-radius: 12px;
  padding: 16px;
}

.msg {
  padding: 10px 14px;
  border-radius: 12px;
  margin-bottom: 8px;
  max-width: 90%;
}

.msg.ai {
  background: white;
  color: #374151;
}

.msg.user {
  background: #8B5CF6;
  color: white;
  margin-left: auto;
}

.msg-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 8px 0;
}

.btn-option {
  padding: 6px 12px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  font-size: 0.85rem;
  color: #6B7280;
}

.habits-check {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  margin: 8px 0;
}

.habit-check {
  padding: 4px 0;
  color: #374151;
}

.habit-check.done {
  color: #059669;
}

.habit-check.missed {
  color: #DC2626;
}

.faq-section {
  margin-bottom: 24px;
}

.faq-item {
  margin-bottom: 16px;
}

.faq-q {
  font-weight: 500;
  color: #1F2937;
  margin-bottom: 4px;
}

.faq-a {
  color: #6B7280;
  padding-left: 24px;
}

.final-cta-section {
  background: linear-gradient(180deg, #F5F3FF 0%, #EEF2FF 100%);
}

.journey-checklist {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
  margin: 0 auto 32px;
}

.checklist-item {
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  color: #059669;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.cta-block {
  text-align: center;
  padding: 32px;
  background: white;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}

.cta-block h3 {
  color: #1F2937;
  margin-bottom: 20px;
}

.cta-benefits {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
  color: #6B7280;
  font-size: 0.9rem;
  flex-wrap: wrap;
}

.social-proof {
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: #F59E0B;
  padding: 16px;
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  border-radius: 12px;
}

@media (max-width: 768px) {
  .section-title {
    font-size: 1.5rem;
  }
  
  .balance-content,
  .habits-content,
  .mentor-content {
    grid-template-columns: 1fr;
  }
  
  .goals-cards {
    grid-template-columns: 1fr;
  }
  
  .examples-row {
    flex-direction: column;
    align-items: center;
  }
  
  .phone-mockup {
    max-width: 300px;
    margin: 0 auto;
  }
  
  .calendar-header,
  .calendar-grid {
    grid-template-columns: repeat(7, 1fr);
  }
  
  .calendar-task {
    font-size: 0.65rem;
    padding: 2px 4px;
  }
  
  .cta-benefits {
    flex-direction: column;
    gap: 8px;
  }
  
  .dialog-subtabs {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 8px;
  }
  
  .subtab-button {
    white-space: nowrap;
  }
}
</style>
