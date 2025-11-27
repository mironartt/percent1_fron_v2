<template>
  <div class="planning-container">
    <!-- Empty State - First Visit -->
    <div v-if="showEmptyState" class="empty-state-section">
      <div class="empty-state-card card">
        <div class="icon-wrapper lg primary">
          <Calendar :size="32" />
        </div>
        <h1>Планирование</h1>
        <p class="subtitle">
          Распределите шаги по дням недели и получайте напоминания
        </p>
        
        <div class="lesson-info">
          <h3>Что вас ждёт в уроке:</h3>
          <div class="lesson-steps">
            <div class="lesson-step">
              <span class="step-num">1</span>
              <div>
                <strong>Теория планирования</strong>
                <p>Узнаете принципы эффективного недельного планирования</p>
              </div>
            </div>
            <div class="lesson-step">
              <span class="step-num">2</span>
              <div>
                <strong>Практика</strong>
                <p>Распределите шаги ваших целей по дням недели</p>
              </div>
            </div>
            <div class="lesson-step">
              <span class="step-num">3</span>
              <div>
                <strong>Настройка напоминаний</strong>
                <p>Подключите Telegram-бота для ежедневных напоминаний</p>
              </div>
            </div>
          </div>
        </div>

        <button class="btn btn-primary btn-lg" @click="startLesson">
          <Sparkles :size="18" />
          Начать урок
        </button>
      </div>
    </div>

    <!-- Lesson Mode -->
    <div v-else-if="!lessonCompleted" class="lesson-mode">
      <div class="progress-bar">
        <div 
          v-for="(step, index) in lessonSteps" 
          :key="index"
          class="progress-step"
          :class="{ 
            active: currentStep === index + 1, 
            completed: currentStep > index + 1 
          }"
          @click="goToStep(index + 1)"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-label">{{ step }}</div>
        </div>
      </div>

      <!-- Step 1: Theory -->
      <div v-if="currentStep === 1" class="step-content">
        <div class="step-layout">
          <div class="step-main">
            <header class="section-header">
              <div class="header-with-icon">
                <div class="icon-wrapper md primary">
                  <BookOpen :size="24" />
                </div>
                <h1>Теория недельного планирования</h1>
              </div>
              <p class="subtitle">
                Научитесь планировать неделю так, чтобы двигаться к целям каждый день
              </p>
            </header>

            <div class="theory-content">
              <div class="theory-block card">
                <div class="theory-header">
                  <div class="icon-wrapper sm target">
                    <Target :size="18" />
                  </div>
                  <h3>Принцип «Неделя вперёд»</h3>
                </div>
                <p>
                  Планируйте неделю заранее — в выходные или в начале недели. 
                  Это даёт ясность и снижает стресс от неопределённости.
                </p>
                <div class="key-point">
                  <div class="icon-wrapper xs accent">
                    <Lightbulb :size="14" />
                  </div>
                  <span>Лучшее время для планирования: воскресенье вечером или понедельник утром</span>
                </div>
              </div>

              <div class="theory-block card">
                <div class="theory-header">
                  <div class="icon-wrapper sm zap">
                    <Zap :size="18" />
                  </div>
                  <h3>Правило 3 шагов в день</h3>
                </div>
                <p>
                  Не перегружайте день. Выберите максимум 3 ключевых шага из ваших целей.
                  Остальное время оставьте для рутины и непредвиденных задач.
                </p>
                <div class="key-point warning">
                  <div class="icon-wrapper xs warning">
                    <AlertTriangle :size="14" />
                  </div>
                  <span>Перегруженный план = срыв плана. Меньше = лучше.</span>
                </div>
              </div>

              <div class="theory-block card">
                <div class="theory-header">
                  <div class="icon-wrapper sm refresh">
                    <RefreshCcw :size="18" />
                  </div>
                  <h3>Баланс сфер жизни</h3>
                </div>
                <p>
                  Распределяйте шаги из разных сфер жизни по неделе.
                  Это поможет поддерживать баланс и не выгорать.
                </p>
                <ul class="balance-tips">
                  <li>Утро — для важных и сложных задач</li>
                  <li>День — для рутины и встреч</li>
                  <li>Вечер — для отдыха и хобби</li>
                </ul>
              </div>

              <div class="theory-block card">
                <div class="theory-header">
                  <div class="icon-wrapper sm phone">
                    <Smartphone :size="18" />
                  </div>
                  <h3>Напоминания = дисциплина</h3>
                </div>
                <p>
                  Ежедневные напоминания в Telegram помогут не забыть о запланированных шагах.
                  Отмечайте выполнение прямо в мессенджере — и прогресс синхронизируется.
                </p>
                <div class="telegram-preview">
                  <div class="tg-message">
                    <div class="tg-header">
                      <Target :size="16" class="tg-icon" />
                      <strong>Задачи на сегодня:</strong>
                    </div>
                    <ul class="tg-tasks">
                      <li><Square :size="14" class="task-check" /> Пробежка 30 минут</li>
                      <li><Square :size="14" class="task-check" /> Прочитать главу книги</li>
                      <li><Square :size="14" class="task-check" /> Позвонить другу</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div class="step-actions">
              <button class="btn btn-primary btn-lg" @click="nextStep">
                Перейти к практике
                <ArrowRight :size="18" />
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- Step 2: Practice -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="step-layout">
          <div class="step-main">
            <header class="section-header">
              <h1>Планирование недели</h1>
              <p class="subtitle">
                Распределите шаги из ваших целей по дням недели
              </p>
            </header>

            <div class="week-info card">
              <div class="week-dates">
                <span class="week-label">Планируемая неделя:</span>
                <span class="week-range">{{ weekRangeText }}</span>
              </div>
            </div>

            <!-- Weekly Calendar View (moved above goals) -->
            <div class="week-calendar card">
              <h3 class="calendar-title">
                <Calendar :size="20" class="calendar-icon" />
                Ваш план на неделю 
                <span class="drag-hint" v-if="draggedStep">(отпустите на нужный день)</span>
              </h3>
              <div class="calendar-grid">
                <div 
                  v-for="day in weekDays" 
                  :key="day.date"
                  class="calendar-day"
                  :class="{ 
                    today: isToday(day.date), 
                    'has-tasks': getTasksForDay(day.date).length > 0,
                    'drag-over-day': dragOverDay === day.date 
                  }"
                  @dragover.prevent="handleDayDragOver($event, day.date)"
                  @dragleave="handleDayDragLeave"
                  @drop="handleDayDrop($event, day.date)"
                >
                  <div class="day-header">
                    <span class="day-name">{{ day.shortName }}</span>
                    <span class="day-date">{{ day.dayNum }}</span>
                    <span v-if="getTotalTimeForDay(day.date)" class="day-time-total">{{ getTotalTimeForDay(day.date) }}</span>
                  </div>
                  <div class="day-tasks">
                    <div 
                      v-for="task in getTasksForDay(day.date)" 
                      :key="task.id"
                      class="scheduled-task"
                      :class="'priority-' + (task.priority || 'optional')"
                    >
                      <span class="task-title">{{ task.stepTitle }}</span>
                      <span v-if="task.timeEstimate" class="task-time-badge">{{ formatTimeShort(task.timeEstimate) }}</span>
                    </div>
                    <div v-if="getTasksForDay(day.date).length === 0" class="no-tasks drop-hint">
                      {{ draggedStep ? 'Сюда' : '—' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Goals with steps to schedule (accordion) -->
            <div class="goals-to-schedule">
              <div class="goals-header">
                <h3>🎯 Ваши цели и шаги</h3>
                <button 
                  v-if="goalsWithSteps.length > 0"
                  class="btn btn-sm btn-outline toggle-all-btn"
                  @click="toggleAllGoals"
                >
                  {{ allGoalsExpanded ? 'Свернуть все' : 'Развернуть все' }}
                </button>
              </div>
              <p class="hint" v-if="goalsWithSteps.length === 0">
                У вас пока нет целей с шагами. Сначала добавьте цели в модуле Декомпозиция.
              </p>
              
              <div v-for="goal in goalsWithSteps" :key="goal.id" class="goal-schedule-card card" :class="{ collapsed: !expandedGoals[goal.id] }">
                <div class="goal-header-accordion" @click="toggleGoal(goal.id)">
                  <div class="goal-header-left">
                    <span class="expand-icon">{{ expandedGoals[goal.id] ? '▼' : '▶' }}</span>
                    <span class="goal-sphere">{{ getSphereName(goal.sphereId) }}</span>
                    <h4>{{ goal.title }}</h4>
                  </div>
                  <div class="goal-header-right">
                    <span class="steps-count">{{ getUncompletedSteps(goal).length }} шагов</span>
                    <span class="scheduled-count" v-if="getScheduledStepsCount(goal) > 0">
                      ✓ {{ getScheduledStepsCount(goal) }} запланировано
                    </span>
                  </div>
                </div>
                <div class="steps-to-schedule" v-show="expandedGoals[goal.id]">
                  <div 
                    v-for="step in getUncompletedSteps(goal)" 
                    :key="step.id"
                    class="step-schedule-item"
                    :class="{ 
                      scheduled: isStepScheduled(goal.id, step.id),
                      dragging: draggedStep && draggedStep.stepId === step.id 
                    }"
                    draggable="true"
                    @dragstart="handleStepDragStart($event, goal, step)"
                    @dragend="handleStepDragEnd"
                  >
                    <div class="step-info">
                      <span class="drag-handle-lesson">⠿</span>
                      <span class="step-title">{{ step.title }}</span>
                    </div>
                    <div class="step-schedule-controls">
                      <select 
                        :value="getScheduledDate(goal.id, step.id)"
                        @change="scheduleStep(goal.id, step, $event.target.value)"
                        class="day-select"
                      >
                        <option value="">📅 День</option>
                        <option 
                          v-for="day in weekDays" 
                          :key="day.date"
                          :value="day.date"
                        >
                          {{ day.label }}
                        </option>
                      </select>
                      <template v-if="isStepScheduled(goal.id, step.id)">
                        <select 
                          :value="getScheduledTimeEstimate(goal.id, step.id)"
                          @change="updateScheduledStep(goal.id, step.id, 'timeEstimate', $event.target.value)"
                          class="time-select"
                          title="Время выполнения"
                        >
                          <option value="">⏱️ Время</option>
                          <option value="30min">30 мин</option>
                          <option value="1h">1 час</option>
                          <option value="2h">2 часа</option>
                          <option value="4h">4 часа</option>
                        </select>
                        <select 
                          :value="getScheduledPriority(goal.id, step.id)"
                          @change="updateScheduledStep(goal.id, step.id, 'priority', $event.target.value)"
                          class="priority-select"
                          title="Приоритет"
                        >
                          <option value="">🎯 Приоритет</option>
                          <option value="critical">🔴 Важно</option>
                          <option value="desirable">🟠 Желательно</option>
                          <option value="attention">🔵 В поле внимания</option>
                          <option value="optional">⚪ Опционально</option>
                        </select>
                        <button 
                          class="btn-icon remove"
                          @click="unscheduleStep(goal.id, step.id)"
                          title="Убрать из плана"
                        >
                          ✕
                        </button>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="step-actions">
              <button class="btn btn-secondary" @click="prevStep">
                ← Назад
              </button>
              <button 
                class="btn btn-primary btn-lg" 
                @click="nextStep"
                :disabled="scheduledTasksCount === 0"
              >
                Далее: Напоминания →
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- Step 3: Telegram Setup -->
      <div v-if="currentStep === 3" class="step-content">
        <div class="step-layout">
          <div class="step-main">
            <header class="section-header">
              <h1>📱 Настройка напоминаний</h1>
              <p class="subtitle">
                Подключите Telegram-бота для получения ежедневных задач
              </p>
            </header>

            <!-- Connected State -->
            <div v-if="telegramConnected" class="telegram-setup card connected">
              <div class="telegram-header">
                <div class="telegram-icon connected">✅</div>
                <div class="telegram-info">
                  <h3>Telegram подключён</h3>
                  <p class="telegram-username">@{{ telegramUsername }}</p>
                </div>
              </div>
              
              <div class="notification-settings">
                <h4>Настройки уведомлений</h4>
                
                <label class="toggle-setting">
                  <input 
                    type="checkbox" 
                    :checked="notificationSettings.morningPlan"
                    @change="updateNotification('morningPlan', $event.target.checked)"
                  />
                  <span class="toggle-label">
                    <span class="toggle-title">🌅 Утренний план</span>
                    <span class="toggle-desc">Задачи на сегодня в {{ notificationSettings.morningTime }}</span>
                  </span>
                </label>
                
                <label class="toggle-setting">
                  <input 
                    type="checkbox" 
                    :checked="notificationSettings.eveningReview"
                    @change="updateNotification('eveningReview', $event.target.checked)"
                  />
                  <span class="toggle-label">
                    <span class="toggle-title">🌙 Вечерний обзор</span>
                    <span class="toggle-desc">Итоги дня в {{ notificationSettings.eveningTime }}</span>
                  </span>
                </label>
                
                <label class="toggle-setting">
                  <input 
                    type="checkbox" 
                    :checked="notificationSettings.weekendPlanning"
                    @change="updateNotification('weekendPlanning', $event.target.checked)"
                  />
                  <span class="toggle-label">
                    <span class="toggle-title">📅 Планирование выходных</span>
                    <span class="toggle-desc">Пятница — обзор недели, воскресенье — план на неделю</span>
                  </span>
                </label>
              </div>
              
              <button class="btn btn-danger-outline btn-sm" @click="handleDisconnectTelegram">
                Отключить Telegram
              </button>
            </div>

            <!-- Not Connected State -->
            <div v-else class="telegram-setup card">
              <div class="telegram-icon">📱</div>
              <h3>Подключите Telegram</h3>
              <p>
                Получайте ежедневные напоминания о задачах и отмечайте выполнение прямо в мессенджере.
              </p>
              
              <div class="connection-steps">
                <div class="connection-step">
                  <span class="step-number">1</span>
                  <span class="step-text">Откройте бота <a href="https://t.me/OnePercentLifeBot" target="_blank">@OnePercentLifeBot</a></span>
                </div>
                <div class="connection-step">
                  <span class="step-number">2</span>
                  <span class="step-text">Нажмите "Начать" и следуйте инструкциям</span>
                </div>
                <div class="connection-step">
                  <span class="step-number">3</span>
                  <span class="step-text">Введите код подключения ниже</span>
                </div>
              </div>
              
              <div class="connection-form">
                <input 
                  type="text" 
                  v-model="telegramCode"
                  placeholder="Введите код из бота"
                  class="input-lg"
                />
                <button 
                  class="btn btn-primary" 
                  @click="handleConnectTelegram"
                  :disabled="!telegramCode.trim()"
                >
                  Подключить
                </button>
              </div>
              
              <p class="skip-note">
                Можно пропустить этот шаг и настроить позже в настройках.
              </p>
            </div>

            <div class="plan-summary card">
              <h3>📊 Ваш план на неделю</h3>
              <div class="summary-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ scheduledTasksCount }}</span>
                  <span class="stat-label">Запланировано шагов</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ scheduledDaysCount }}</span>
                  <span class="stat-label">Дней с задачами</span>
                </div>
              </div>

              <div class="daily-breakdown">
                <template v-for="day in weekDays" :key="day.date">
                  <div 
                    v-if="getTasksForDay(day.date).length > 0"
                    class="day-summary"
                  >
                    <span class="day-name">{{ day.label }}:</span>
                    <span class="day-tasks-count">{{ getTasksForDay(day.date).length }} {{ pluralize(getTasksForDay(day.date).length, 'шаг', 'шага', 'шагов') }}</span>
                  </div>
                </template>
              </div>
            </div>

            <div class="step-actions">
              <button class="btn btn-secondary" @click="prevStep">
                ← Назад
              </button>
              <button class="btn btn-primary btn-lg" @click="completeLesson">
                ✅ Завершить урок
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Planner Mode - After lesson completion -->
    <div v-else class="planner-mode">
      <div class="planner-layout">
        <div class="planner-main">
          <header class="section-header">
            <div class="header-row">
              <h1>Планирование недели</h1>
            </div>
            <div class="week-navigation">
              <button class="btn btn-icon-nav" @click="prevWeek" title="Предыдущая неделя">
                ←
              </button>
              <span class="week-range-text">{{ weekRangeText }}</span>
              <button class="btn btn-icon-nav" @click="nextWeek" title="Следующая неделя">
                →
              </button>
              <button 
                v-if="!isCurrentWeek" 
                class="btn btn-text-sm" 
                @click="goToCurrentWeek"
              >
                Сегодня
              </button>
            </div>
          </header>

          <!-- Weekly Statistics -->
          <div class="weekly-stats card">
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-content">
                  <span class="stat-number">{{ weeklyCompletedTasks }}</span>
                  <span class="stat-label">Выполнено</span>
                </div>
              </div>
              <div class="stat-box">
                <div class="stat-content">
                  <span class="stat-number">{{ weeklyTotalTasks }}</span>
                  <span class="stat-label">Всего задач</span>
                </div>
              </div>
              <div class="stat-box">
                <div class="stat-content">
                  <span class="stat-number">{{ weeklyCompletionRate }}%</span>
                  <span class="stat-label">Прогресс</span>
                </div>
              </div>
              <div class="stat-box">
                <div class="stat-content">
                  <span class="stat-number">{{ currentStreak }}</span>
                  <span class="stat-label">Дней подряд</span>
                </div>
              </div>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar-bg">
                <div 
                  class="progress-bar-fill" 
                  :style="{ width: weeklyCompletionRate + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Week Calendar (moved above goals) -->
          <div class="week-calendar-full card">
            <h3>План на неделю <span class="drag-hint">Перетаскивайте задачи между днями</span></h3>
            <div class="calendar-grid-full">
              <div 
                v-for="day in weekDays" 
                :key="day.date"
                class="calendar-day-full"
                :class="{ 
                  today: isToday(day.date),
                  'drag-over': dragOverDay === day.date
                }"
                @dragover.prevent="handleDragOver(day.date)"
                @dragleave="handleDragLeave"
                @drop="handleDrop(day.date)"
              >
                <div class="day-header-full">
                  <div class="day-header-left">
                    <span class="day-name">{{ day.label }}</span>
                    <span class="tasks-count" v-if="getTasksForDay(day.date).length > 0">
                      {{ getTasksForDay(day.date).length }}
                    </span>
                  </div>
                  <span v-if="getTotalTimeForDay(day.date)" class="day-time-total">{{ getTotalTimeForDay(day.date) }}</span>
                </div>
                <div class="day-tasks-full">
                  <div 
                    v-for="task in getTasksForDay(day.date)" 
                    :key="task.id"
                    class="task-card"
                    :class="[
                      { completed: task.completed, dragging: draggedTaskId === task.id },
                      'priority-' + (task.priority || 'optional')
                    ]"
                    draggable="true"
                    @dragstart="handleDragStart(task)"
                    @dragend="handleDragEnd"
                  >
                    <div class="drag-handle">⋮⋮</div>
                    <input 
                      type="checkbox"
                      :checked="task.completed"
                      @change="toggleTaskComplete(task.id)"
                      class="task-checkbox"
                    />
                    <div class="task-info">
                      <span class="task-title">{{ task.stepTitle }}</span>
                      <span class="task-goal">{{ task.goalTitle }}</span>
                    </div>
                    <span v-if="task.timeEstimate" class="task-time-badge">{{ formatTimeShort(task.timeEstimate) }}</span>
                    <button 
                      class="btn-icon remove-sm"
                      @click="removeTask(task.id)"
                      title="Удалить"
                    >
                      ✕
                    </button>
                  </div>
                  <div v-if="getTasksForDay(day.date).length === 0" class="empty-day drop-zone">
                    Перетащите задачу сюда
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Goals with steps (accordion) -->
          <div class="goals-section">
            <div class="goals-header">
              <h3>Цели и шаги</h3>
              <button 
                v-if="goalsWithSteps.length > 0"
                class="btn btn-sm btn-outline toggle-all-btn"
                @click="toggleAllGoals"
              >
                {{ allGoalsExpanded ? 'Свернуть все' : 'Развернуть все' }}
              </button>
            </div>
            <div v-if="goalsWithSteps.length === 0" class="empty-goals card">
              <p>У вас пока нет целей с шагами.</p>
              <button class="btn btn-primary" @click="goToDecomposition">
                Перейти к декомпозиции
              </button>
            </div>

            <div v-for="goal in goalsWithSteps" :key="goal.id" class="goal-card card" :class="{ collapsed: !expandedGoals[goal.id] }">
              <div class="goal-header-accordion" @click="toggleGoal(goal.id)">
                <div class="goal-header-left">
                  <span class="expand-icon">{{ expandedGoals[goal.id] ? '▼' : '▶' }}</span>
                  <span class="goal-sphere">{{ getSphereName(goal.sphereId) }}</span>
                  <h4>{{ goal.title }}</h4>
                </div>
                <div class="goal-header-right">
                  <span class="steps-count">{{ getUncompletedSteps(goal).length }} шагов</span>
                  <span class="scheduled-count" v-if="getScheduledStepsCount(goal) > 0">
                    ✓ {{ getScheduledStepsCount(goal) }} запланировано
                  </span>
                  <span class="goal-progress">{{ goal.progress || 0 }}%</span>
                </div>
              </div>
              <div class="steps-list" v-show="expandedGoals[goal.id]">
                <div 
                  v-for="step in getUncompletedSteps(goal)" 
                  :key="step.id"
                  class="step-item"
                  :class="{ 
                    scheduled: isStepScheduled(goal.id, step.id),
                    ['priority-' + getScheduledPriority(goal.id, step.id)]: isStepScheduled(goal.id, step.id),
                    dragging: draggedStep && draggedStep.stepId === step.id
                  }"
                  draggable="true"
                  @dragstart="handleStepDragStart($event, goal, step)"
                  @dragend="handleStepDragEnd"
                >
                  <span class="step-title">{{ step.title }}</span>
                  <div class="step-actions">
                    <select 
                      :value="getScheduledDate(goal.id, step.id)"
                      @change="scheduleStep(goal.id, step, $event.target.value)"
                      class="day-select-sm"
                    >
                      <option value="">День</option>
                      <option 
                        v-for="day in weekDays" 
                        :key="day.date"
                        :value="day.date"
                      >
                        {{ day.shortName }}
                      </option>
                    </select>
                    <select 
                      :value="getScheduledTimeEstimate(goal.id, step.id)"
                      @change="updateScheduledStep(goal.id, step.id, 'timeEstimate', $event.target.value)"
                      class="time-select-sm"
                      title="Время"
                    >
                      <option value="">⏱</option>
                      <option value="30min">30м</option>
                      <option value="1h">1ч</option>
                      <option value="2h">2ч</option>
                      <option value="4h">4ч</option>
                    </select>
                    <select 
                      :value="getScheduledPriority(goal.id, step.id)"
                      @change="updateScheduledStep(goal.id, step.id, 'priority', $event.target.value)"
                      class="priority-select-sm"
                      :class="'priority-' + (getScheduledPriority(goal.id, step.id) || 'none')"
                      title="Приоритет"
                    >
                      <option value="">—</option>
                      <option value="critical">Критично</option>
                      <option value="desirable">Важно</option>
                      <option value="attention">Внимание</option>
                      <option value="optional">Опционально</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <Transition name="toast">
      <div v-if="showUndoToast" class="undo-toast">
        <span>Задача удалена</span>
        <button class="btn-undo" @click="undoDeleteTask">Отменить</button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { DEMO_PLANNING_MODE } from '../config/settings.js'
import { 
  Calendar, 
  BookOpen, 
  Target, 
  Lightbulb, 
  Zap, 
  AlertTriangle, 
  RefreshCcw, 
  Smartphone, 
  Sparkles,
  Square,
  ArrowRight,
  CheckSquare
} from 'lucide-vue-next'

const store = useAppStore()
const router = useRouter()

const lessonSteps = ['Теория', 'Практика', 'Напоминания']

const lessonStarted = computed(() => store.planningModule.lessonStarted)
const lessonCompleted = computed(() => store.planningModule.lessonCompleted || DEMO_PLANNING_MODE)
const currentStep = computed(() => store.planningModule.currentStep)

const weekOffset = ref(0)

const showEmptyState = computed(() => {
  if (DEMO_PLANNING_MODE) return false
  return !lessonStarted.value && !lessonCompleted.value
})

const telegramCode = ref('')
const telegramConnected = computed(() => store.telegramSettings.connected)
const telegramUsername = computed(() => store.telegramSettings.username)
const notificationSettings = computed(() => store.telegramSettings.notifications)

const draggedTaskId = ref(null)
const draggedTask = ref(null)
const dragOverDay = ref(null)
const draggedStep = ref(null)
const deletedTask = ref(null)
const showUndoToast = ref(false)
let undoTimeout = null

function handleStepDragStart(event, goal, step) {
  console.log('[Planning] DragStart - step:', step.title, 'goal:', goal.title)
  draggedStep.value = {
    goalId: goal.id,
    stepId: step.id,
    stepTitle: step.title,
    goal: goal
  }
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', step.id)
}

function handleStepDragEnd() {
  draggedStep.value = null
  dragOverDay.value = null
}

function handleDayDragOver(event, dayDate) {
  event.preventDefault()
  if (draggedStep.value) {
    dragOverDay.value = dayDate
  }
}

function handleDayDragLeave() {
  dragOverDay.value = null
}

function handleDayDrop(event, dayDate) {
  if (draggedStep.value) {
    event.preventDefault()
    console.log('[Planning] Drop step:', draggedStep.value.stepTitle, 'on day:', dayDate)
    scheduleStep(draggedStep.value.goalId, { 
      id: draggedStep.value.stepId, 
      title: draggedStep.value.stepTitle 
    }, dayDate)
    handleStepDragEnd()
  }
}

function handleConnectTelegram() {
  if (!telegramCode.value.trim()) return
  const code = telegramCode.value.trim()
  const username = 'user_' + code.substring(0, 6)
  store.connectTelegram(code, username)
  telegramCode.value = ''
}

function handleDisconnectTelegram() {
  store.disconnectTelegram()
}

function updateNotification(key, value) {
  store.updateTelegramNotifications({ [key]: value })
}

function handleDragStart(task) {
  draggedTaskId.value = task.id
  draggedTask.value = task
}

function handleDragEnd() {
  draggedTaskId.value = null
  draggedTask.value = null
  dragOverDay.value = null
}

function handleDragOver(dayDate) {
  // Highlight day for both task and step dragging
  if (draggedTask.value || draggedStep.value) {
    dragOverDay.value = dayDate
  }
}

function handleDragLeave() {
  dragOverDay.value = null
}

function handleDrop(newDate) {
  // Handle step drag from goals section
  if (draggedStep.value) {
    console.log('[Planning] Drop step:', draggedStep.value.stepTitle, 'on day:', newDate)
    scheduleStep(draggedStep.value.goalId, { 
      id: draggedStep.value.stepId, 
      title: draggedStep.value.stepTitle 
    }, newDate)
    handleStepDragEnd()
    return
  }
  
  // Handle task drag between days
  if (draggedTask.value && draggedTask.value.scheduledDate !== newDate) {
    updateTaskDate(draggedTask.value.id, newDate)
  }
  handleDragEnd()
}

function updateTaskDate(taskId, newDate) {
  const plan = currentPlan.value
  if (!plan) return
  
  const task = plan.scheduledTasks.find(t => t.id === taskId)
  if (task) {
    task.scheduledDate = newDate
    store.saveToLocalStorage()
  }
}

const goals = computed(() => store.goals)
const goalsWithSteps = computed(() => {
  const filtered = goals.value.filter(g => g.status === 'active' && g.steps && g.steps.length > 0)
  console.log('[Planning] goalsWithSteps:', filtered.length, 'goals with steps, all goals:', goals.value.length)
  if (filtered.length > 0) {
    filtered.forEach(g => console.log('[Planning] Goal:', g.title, 'steps:', g.steps?.length))
  }
  return filtered
})

const expandedGoals = ref({})

function toggleGoal(goalId) {
  expandedGoals.value[goalId] = !expandedGoals.value[goalId]
}

const allGoalsExpanded = computed(() => {
  if (goalsWithSteps.value.length === 0) return false
  return goalsWithSteps.value.every(g => expandedGoals.value[g.id])
})

function toggleAllGoals() {
  const newState = !allGoalsExpanded.value
  goalsWithSteps.value.forEach(g => {
    expandedGoals.value[g.id] = newState
  })
}

function getScheduledStepsCount(goal) {
  return scheduledTasks.value.filter(t => t.goalId === goal.id).length
}

const lifeSpheres = computed(() => store.lifeSpheres)

function getSphereName(sphereId) {
  const sphere = lifeSpheres.value.find(s => s.id === sphereId)
  return sphere ? `${sphere.icon} ${sphere.name}` : ''
}

function getUncompletedSteps(goal) {
  return (goal.steps || []).filter(s => !s.completed)
}

const weekDays = computed(() => {
  const days = []
  const today = new Date()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset + (weekOffset.value * 7))
  
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  const fullNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    days.push({
      date: date.toISOString().split('T')[0],
      dayNum: date.getDate(),
      shortName: dayNames[i],
      label: fullNames[i]
    })
  }
  return days
})

const isCurrentWeek = computed(() => weekOffset.value === 0)

function prevWeek() {
  weekOffset.value--
}

function nextWeek() {
  weekOffset.value++
}

function goToCurrentWeek() {
  weekOffset.value = 0
}

const weekRangeText = computed(() => {
  if (weekDays.value.length < 7) return ''
  const start = new Date(weekDays.value[0].date)
  const end = new Date(weekDays.value[6].date)
  const options = { day: 'numeric', month: 'long' }
  return `${start.toLocaleDateString('ru-RU', options)} — ${end.toLocaleDateString('ru-RU', options)}`
})

function isToday(dateStr) {
  return dateStr === new Date().toISOString().split('T')[0]
}

const currentPlan = computed(() => {
  const mondayDate = weekDays.value[0]?.date
  if (!mondayDate) return null
  return store.weeklyPlans.find(p => p.weekStart === mondayDate)
})

const scheduledTasks = computed(() => {
  return currentPlan.value?.scheduledTasks || []
})

const scheduledTasksCount = computed(() => scheduledTasks.value.length)

const scheduledDaysCount = computed(() => {
  const days = new Set(scheduledTasks.value.map(t => t.scheduledDate))
  return days.size
})

const weeklyTotalTasks = computed(() => scheduledTasks.value.length)

const weeklyCompletedTasks = computed(() => {
  return scheduledTasks.value.filter(t => t.completed).length
})

const weeklyCompletionRate = computed(() => {
  if (weeklyTotalTasks.value === 0) return 0
  return Math.round((weeklyCompletedTasks.value / weeklyTotalTasks.value) * 100)
})

const currentStreak = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let streak = 0
  
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() - i)
    const dateStr = checkDate.toISOString().split('T')[0]
    
    const dayTasks = scheduledTasks.value.filter(t => t.scheduledDate === dateStr)
    if (dayTasks.length === 0) {
      if (i === 0) continue
      break
    }
    
    const allCompleted = dayTasks.every(t => t.completed)
    if (allCompleted) {
      streak++
    } else if (i > 0) {
      break
    }
  }
  
  return streak
})

const priorityOrder = { critical: 0, desirable: 1, attention: 2, optional: 3, '': 4 }

function getTasksForDay(dateStr) {
  return scheduledTasks.value
    .filter(t => t.scheduledDate === dateStr)
    .sort((a, b) => {
      const priorityA = priorityOrder[a.priority] ?? 4
      const priorityB = priorityOrder[b.priority] ?? 4
      return priorityA - priorityB
    })
}

function getTotalTimeForDay(dateStr) {
  const timeValues = { '30min': 30, '1h': 60, '2h': 120, '4h': 240 }
  const tasks = getTasksForDay(dateStr)
  const totalMinutes = tasks.reduce((sum, task) => {
    return sum + (timeValues[task.timeEstimate] || 0)
  }, 0)
  
  if (totalMinutes === 0) return ''
  if (totalMinutes < 60) return `${totalMinutes}м`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes > 0 ? `${hours}ч${minutes}м` : `${hours}ч`
}

function isStepScheduled(goalId, stepId) {
  return scheduledTasks.value.some(t => t.goalId === goalId && t.stepId === stepId)
}

function getScheduledDate(goalId, stepId) {
  const task = scheduledTasks.value.find(t => t.goalId === goalId && t.stepId === stepId)
  return task?.scheduledDate || ''
}

function getScheduledTimeEstimate(goalId, stepId) {
  const task = scheduledTasks.value.find(t => t.goalId === goalId && t.stepId === stepId)
  return task?.timeEstimate || ''
}

function getScheduledPriority(goalId, stepId) {
  const task = scheduledTasks.value.find(t => t.goalId === goalId && t.stepId === stepId)
  return task?.priority || ''
}

function updateScheduledStep(goalId, stepId, field, value) {
  const plan = ensureWeekPlan()
  if (!plan) return

  const existingTask = plan.scheduledTasks.find(t => t.goalId === goalId && t.stepId === stepId)
  if (existingTask) {
    store.updateScheduledTask(plan.id, existingTask.id, { [field]: value })
  }
}

function ensureWeekPlan() {
  const mondayDate = weekDays.value[0]?.date
  console.log('[Planning] ensureWeekPlan - mondayDate:', mondayDate)
  if (!mondayDate) return null
  
  let plan = store.weeklyPlans.find(p => p.weekStart === mondayDate)
  console.log('[Planning] Found existing plan:', plan?.id || 'none')
  if (!plan) {
    plan = store.createWeeklyPlan(mondayDate)
    console.log('[Planning] Created new plan:', plan.id)
  }
  return plan
}

function scheduleStep(goalId, step, dateStr) {
  console.log('[Planning] scheduleStep called:', { goalId, stepId: step?.id, dateStr })
  const plan = ensureWeekPlan()
  console.log('[Planning] Plan for scheduling:', plan?.id || 'null')
  if (!plan) return

  const existingTask = plan.scheduledTasks.find(t => t.goalId === goalId && t.stepId === step.id)
  if (existingTask) {
    if (dateStr) {
      store.updateScheduledTask(plan.id, existingTask.id, { scheduledDate: dateStr })
    } else {
      store.removeScheduledTask(plan.id, existingTask.id)
    }
  } else if (dateStr) {
    const goal = goals.value.find(g => g.id === goalId)
    store.addScheduledTask(plan.id, {
      goalId: goalId,
      stepId: step.id,
      stepTitle: step.title,
      goalTitle: goal?.title || '',
      scheduledDate: dateStr,
      timeEstimate: '',
      priority: ''
    })
  }
}

function unscheduleStep(goalId, stepId) {
  const plan = currentPlan.value
  if (!plan) return
  const task = plan.scheduledTasks.find(t => t.goalId === goalId && t.stepId === stepId)
  if (task) {
    store.removeScheduledTask(plan.id, task.id)
  }
}

function toggleTaskComplete(taskId) {
  const plan = currentPlan.value
  if (plan) {
    store.toggleScheduledTaskComplete(plan.id, taskId)
  }
}

function removeTask(taskId) {
  const plan = currentPlan.value
  if (plan) {
    const taskToDelete = plan.scheduledTasks.find(t => t.id === taskId)
    if (taskToDelete) {
      deletedTask.value = { ...taskToDelete, planId: plan.id }
      store.removeScheduledTask(plan.id, taskId)
      showUndoToast.value = true
      
      if (undoTimeout) clearTimeout(undoTimeout)
      undoTimeout = setTimeout(() => {
        showUndoToast.value = false
        deletedTask.value = null
      }, 4000)
    }
  }
}

function undoDeleteTask() {
  if (deletedTask.value) {
    const { planId, ...task } = deletedTask.value
    store.addScheduledTask(planId, task)
    showUndoToast.value = false
    deletedTask.value = null
    if (undoTimeout) clearTimeout(undoTimeout)
  }
}

function formatTimeEstimate(estimate) {
  const labels = {
    '30min': '30 мин',
    '1h': '1 час',
    '2h': '2 часа',
    '4h': '4 часа'
  }
  return labels[estimate] || estimate
}

function formatTimeShort(estimate) {
  const labels = {
    '30min': '30м',
    '1h': '1ч',
    '2h': '2ч',
    '4h': '4ч'
  }
  return labels[estimate] || estimate
}

const priorityOptions = [
  { value: 'critical', label: 'Критично', color: '#ef4444' },
  { value: 'desirable', label: 'Важно', color: '#f97316' },
  { value: 'attention', label: 'Внимание', color: '#3b82f6' },
  { value: 'optional', label: 'Опционально', color: '#9ca3af' }
]

function getPriorityColor(priority) {
  const option = priorityOptions.find(p => p.value === priority)
  return option ? option.color : '#9ca3af'
}

function getPriorityLabel(priority) {
  const option = priorityOptions.find(p => p.value === priority)
  return option ? option.label : 'Опционально'
}

function pluralize(n, one, few, many) {
  if (n % 10 === 1 && n % 100 !== 11) return one
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return few
  return many
}

function startLesson() {
  store.startPlanningLesson()
}

function goToStep(step) {
  if (step <= currentStep.value) {
    store.setPlanningStep(step)
  }
}

function nextStep() {
  if (currentStep.value < 3) {
    store.setPlanningStep(currentStep.value + 1)
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    store.setPlanningStep(currentStep.value - 1)
  }
}

function completeLesson() {
  store.completePlanningLesson()
}

function restartLesson() {
  if (confirm('Вы уверены? Урок начнётся заново.')) {
    store.resetPlanningModule()
  }
}

function goToDecomposition() {
  router.push('/goals')
}

function setupDemoData() {
  if (!DEMO_PLANNING_MODE) return
  
  const today = new Date()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)
  
  const demoGoals = [
    {
      id: 'demo-goal-1',
      title: 'Улучшить физическую форму',
      sphere: 'health',
      status: 'active',
      steps: [
        { id: 'step-1-1', title: 'Пробежка 3 км', completed: false },
        { id: 'step-1-2', title: 'Зарядка 15 минут', completed: false },
        { id: 'step-1-3', title: 'Тренировка в зале', completed: false }
      ]
    },
    {
      id: 'demo-goal-2', 
      title: 'Изучить новый навык',
      sphere: 'development',
      status: 'active',
      steps: [
        { id: 'step-2-1', title: 'Прочитать главу книги', completed: false },
        { id: 'step-2-2', title: 'Пройти урок курса', completed: false }
      ]
    },
    {
      id: 'demo-goal-3',
      title: 'Улучшить отношения',
      sphere: 'relationships',
      status: 'active',
      steps: [
        { id: 'step-3-1', title: 'Позвонить родителям', completed: false },
        { id: 'step-3-2', title: 'Встретиться с друзьями', completed: false }
      ]
    }
  ]
  
  if (store.goals.length === 0) {
    demoGoals.forEach(g => store.addGoal(g))
  }
  
  const plan = currentPlan.value
  if (plan && (!plan.scheduledTasks || plan.scheduledTasks.length === 0)) {
    const getDateStr = (offset) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + offset)
      return d.toISOString().split('T')[0]
    }
    
    const demoTasks = [
      { goalId: 'demo-goal-1', stepId: 'step-1-1', stepTitle: 'Пробежка 3 км', goalTitle: 'Улучшить физическую форму', scheduledDate: getDateStr(0), timeEstimate: '30', priority: 'critical', completed: false },
      { goalId: 'demo-goal-1', stepId: 'step-1-2', stepTitle: 'Зарядка 15 минут', goalTitle: 'Улучшить физическую форму', scheduledDate: getDateStr(1), timeEstimate: '15', priority: 'desirable', completed: false },
      { goalId: 'demo-goal-2', stepId: 'step-2-1', stepTitle: 'Прочитать главу книги', goalTitle: 'Изучить новый навык', scheduledDate: getDateStr(1), timeEstimate: '45', priority: 'attention', completed: false },
      { goalId: 'demo-goal-1', stepId: 'step-1-3', stepTitle: 'Тренировка в зале', goalTitle: 'Улучшить физическую форму', scheduledDate: getDateStr(2), timeEstimate: '60', priority: 'critical', completed: true },
      { goalId: 'demo-goal-2', stepId: 'step-2-2', stepTitle: 'Пройти урок курса', goalTitle: 'Изучить новый навык', scheduledDate: getDateStr(3), timeEstimate: '30', priority: 'desirable', completed: false },
      { goalId: 'demo-goal-3', stepId: 'step-3-1', stepTitle: 'Позвонить родителям', goalTitle: 'Улучшить отношения', scheduledDate: getDateStr(4), timeEstimate: '20', priority: 'critical', completed: false },
      { goalId: 'demo-goal-3', stepId: 'step-3-2', stepTitle: 'Встретиться с друзьями', goalTitle: 'Улучшить отношения', scheduledDate: getDateStr(5), timeEstimate: '120', priority: 'optional', completed: false }
    ]
    
    demoTasks.forEach(task => {
      plan.scheduledTasks.push({
        id: `demo-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...task
      })
    })
    store.saveToLocalStorage()
  }
}

onMounted(() => {
  console.log('[Planning] onMounted - goals count:', store.goals.length)
  console.log('[Planning] onMounted - goalsWithSteps:', goalsWithSteps.value.length)
  store.goals.forEach(g => {
    console.log('[Planning] Goal:', g.title, 'status:', g.status, 'steps:', g.steps?.length || 0)
  })
  ensureWeekPlan()
  setupDemoData()
})
</script>

<style scoped>
.planning-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

.empty-state-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 2rem;
}

.empty-state-card {
  text-align: center;
  max-width: 600px;
  padding: 3rem;
}

.empty-state-card h1 {
  margin-bottom: 0.5rem;
}

/* Icon wrapper system */
.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.icon-wrapper.xs {
  width: 24px;
  height: 24px;
}

.icon-wrapper.sm {
  width: 32px;
  height: 32px;
}

.icon-wrapper.md {
  width: 48px;
  height: 48px;
}

.icon-wrapper.lg {
  width: 72px;
  height: 72px;
  margin-bottom: 1rem;
}

.icon-wrapper.primary {
  background: rgba(124, 58, 237, 0.15);
  color: var(--primary-color);
}

.icon-wrapper.accent {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.icon-wrapper.target {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.icon-wrapper.zap {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.icon-wrapper.warning {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.icon-wrapper.refresh {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.icon-wrapper.phone {
  background: rgba(6, 182, 212, 0.15);
  color: #06b6d4;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.lesson-info {
  text-align: left;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.lesson-info h3 {
  margin-bottom: 1rem;
  font-size: 1rem;
}

.lesson-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lesson-step {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.step-num {
  width: 28px;
  height: 28px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.lesson-step strong {
  display: block;
  margin-bottom: 0.25rem;
}

.lesson-step p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.progress-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
  padding: 0 2rem;
}

.progress-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.progress-step.active,
.progress-step.completed {
  opacity: 1;
}

.progress-step::before {
  content: '';
  position: absolute;
  top: 20px;
  right: 50%;
  width: 100%;
  height: 2px;
  background: var(--border-color);
  z-index: 0;
}

.progress-step:first-child::before {
  display: none;
}

.progress-step.completed::before,
.progress-step.active::before {
  background: var(--primary-color);
}

.progress-step .step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.progress-step.active .step-number {
  background: var(--primary-color);
  color: white;
  transform: scale(1.1);
}

.progress-step.completed .step-number {
  background: var(--success-color);
  color: white;
}

.step-label {
  font-size: 0.875rem;
  text-align: center;
  font-weight: 500;
  color: var(--text-secondary);
}

.progress-step.active .step-label {
  color: var(--text-primary);
  font-weight: 600;
}

.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
}

.step-main {
  min-width: 0;
}

.step-sidebar {
  min-width: 0;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-header h1 {
  margin-bottom: 0.5rem;
}

.theory-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.theory-block {
  padding: 1.5rem;
}

.theory-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.theory-header h3 {
  margin: 0;
}

.theory-block p {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.key-point {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
}

.key-point.warning {
  background: rgba(245, 158, 11, 0.1);
}

.balance-tips {
  margin: 0;
  padding-left: 1.25rem;
}

.balance-tips li {
  margin-bottom: 0.5rem;
}

.telegram-preview {
  background: #e3f2fd;
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-top: 1rem;
}

.tg-message {
  font-size: 0.9rem;
}

.tg-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.tg-icon {
  color: var(--primary-color);
}

.tg-tasks {
  margin: 0;
  padding: 0;
  list-style: none;
}

.tg-tasks li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}

.task-check {
  color: var(--text-secondary);
}

.header-with-icon {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-with-icon h1 {
  margin: 0;
}

.calendar-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.calendar-icon {
  color: var(--primary-color);
}

.btn.btn-primary.btn-lg {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.week-info {
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
}

.week-dates {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.week-label {
  color: var(--text-secondary);
}

.week-range {
  font-weight: 600;
  color: var(--primary-color);
}

.goals-to-schedule {
  margin-bottom: 2rem;
}

.goals-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.goals-header h3 {
  margin: 0;
}

.toggle-all-btn {
  font-size: 0.85rem;
  padding: 0.4rem 0.75rem;
}

.hint {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.goal-schedule-card {
  margin-bottom: 1rem;
  padding: 0;
  overflow: hidden;
}

.goal-schedule-card.collapsed {
  background: var(--bg-primary);
}

.goal-header-accordion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.goal-header-accordion:hover {
  background: var(--bg-secondary);
}

.goal-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.expand-icon {
  font-size: 0.7rem;
  color: var(--text-secondary);
  transition: transform 0.2s;
  flex-shrink: 0;
}

.goal-header-left h4 {
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.goal-header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.steps-count {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.scheduled-count {
  font-size: 0.85rem;
  color: var(--success-color, #10b981);
  font-weight: 500;
}

.goal-schedule-card .steps-to-schedule {
  padding: 0 1.25rem 1.25rem;
}

.goal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.goal-sphere {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.goal-header h4 {
  margin: 0;
  flex: 1;
}

.goal-progress {
  font-weight: 600;
  color: var(--primary-color);
}

.steps-to-schedule {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.step-schedule-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.step-schedule-item.scheduled {
  background: rgba(99, 102, 241, 0.1);
  border-left: 3px solid var(--primary-color);
}

.step-schedule-item[draggable="true"] {
  cursor: grab;
}

.step-schedule-item[draggable="true"]:active {
  cursor: grabbing;
}

.step-schedule-item.dragging {
  opacity: 0.5;
  transform: scale(0.98);
}

.drag-handle-lesson {
  color: var(--text-tertiary);
  font-size: 0.9rem;
  cursor: grab;
  user-select: none;
}

.drag-handle-lesson:active {
  cursor: grabbing;
}

.calendar-day.drag-over-day {
  background: rgba(99, 102, 241, 0.15);
  border: 2px dashed var(--primary-color);
}

.calendar-day.drag-over-day .no-tasks {
  color: var(--primary-color);
  font-weight: 500;
}

.drop-hint {
  transition: all 0.2s;
}

.step-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.step-title {
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.step-time {
  font-size: 0.8rem;
  color: var(--text-secondary);
  padding: 0.125rem 0.5rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

.step-schedule-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.time-select,
.priority-select,
.day-select {
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  background: var(--bg-primary);
  cursor: pointer;
}

.time-select {
  min-width: 100px;
}

.priority-select {
  min-width: 140px;
}

.priority-select option[value="critical"] {
  color: #dc2626;
}

.priority-select option[value="desirable"] {
  color: #ea580c;
}

.priority-select option[value="attention"] {
  color: #2563eb;
}

.priority-select option[value="optional"] {
  color: #6b7280;
}

.btn-icon.remove {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon.remove:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

.week-calendar {
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.week-calendar h3 {
  margin-bottom: 1rem;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.calendar-day {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  min-height: 100px;
}

.calendar-day.today {
  border: 2px solid var(--primary-color);
}

.calendar-day.has-tasks {
  background: rgba(99, 102, 241, 0.05);
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
  gap: 0.25rem;
}

.day-time-total {
  font-size: 0.7rem;
  color: var(--primary-color);
  background: rgba(99, 102, 241, 0.1);
  padding: 0.15rem 0.4rem;
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.day-name {
  font-weight: 600;
  font-size: 0.875rem;
}

.day-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.day-tasks {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.scheduled-task {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.25rem;
}

.scheduled-task .task-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.task-time-badge {
  font-size: 0.65rem;
  color: var(--text-tertiary);
  background: var(--bg-secondary);
  padding: 0.1rem 0.3rem;
  border-radius: var(--radius-xs, 2px);
  white-space: nowrap;
  flex-shrink: 0;
}

.scheduled-task.priority-critical {
  border-left-color: #dc2626;
  background: rgba(220, 38, 38, 0.1);
}

.scheduled-task.priority-desirable {
  border-left-color: #ea580c;
  background: rgba(234, 88, 12, 0.1);
}

.scheduled-task.priority-attention {
  border-left-color: #2563eb;
  background: rgba(37, 99, 235, 0.1);
}

.scheduled-task.priority-optional {
  border-left-color: #9ca3af;
  background: rgba(156, 163, 175, 0.1);
}

.no-tasks {
  color: var(--text-tertiary);
  font-size: 0.8rem;
  text-align: center;
}

.telegram-setup {
  text-align: center;
  padding: 2rem;
  margin-bottom: 1.5rem;
}

.telegram-setup.connected {
  text-align: left;
}

.telegram-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.telegram-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 50%;
}

.telegram-icon.connected {
  background: rgba(34, 197, 94, 0.1);
}

.telegram-info h3 {
  margin: 0 0 0.25rem;
}

.telegram-username {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.9rem;
}

.telegram-setup h3 {
  margin-bottom: 0.75rem;
}

.telegram-setup > p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.connection-steps {
  text-align: left;
  max-width: 400px;
  margin: 0 auto 1.5rem;
}

.connection-step {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
}

.step-number {
  width: 28px;
  height: 28px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.step-text {
  color: var(--text-primary);
}

.step-text a {
  color: var(--primary-color);
  font-weight: 500;
}

.connection-form {
  display: flex;
  gap: 0.75rem;
  max-width: 350px;
  margin: 0 auto 1rem;
}

.connection-form .input-lg {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 1rem;
}

.skip-note {
  font-size: 0.85rem;
  color: var(--text-tertiary);
  margin-top: 1rem;
}

.notification-settings {
  margin-bottom: 1.5rem;
}

.notification-settings h4 {
  margin-bottom: 1rem;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.toggle-setting {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.toggle-setting input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  cursor: pointer;
}

.toggle-label {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.toggle-title {
  font-weight: 500;
}

.toggle-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.btn-danger-outline {
  border: 1px solid var(--danger-color);
  color: var(--danger-color);
  background: transparent;
}

.btn-danger-outline:hover {
  background: rgba(239, 68, 68, 0.1);
}

.plan-summary {
  padding: 1.5rem;
}

.plan-summary h3 {
  margin-bottom: 1rem;
}

.summary-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.daily-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.day-summary {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.day-summary .day-name {
  font-weight: 500;
}

.day-tasks-count {
  color: var(--text-secondary);
}

.planner-mode {
  padding: 0;
}

.planner-layout {
  display: block;
}

.planner-main {
  min-width: 0;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.weekly-stats {
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-box .stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.progress-bar-container {
  margin-top: 0.5rem;
}

.progress-bar-bg {
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), #818cf8);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.goals-section {
  margin-top: 2rem;
  margin-bottom: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.goals-section .goals-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.goals-section .goals-header h3 {
  margin: 0;
}

.empty-goals {
  text-align: center;
  padding: 2rem;
}

.empty-goals p {
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

.goal-card {
  margin-bottom: 1rem;
  padding: 0;
  overflow: hidden;
}

.goal-card.collapsed {
  background: var(--bg-primary);
}

.goal-card .goal-header-accordion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.goal-card .goal-header-accordion:hover {
  background: var(--bg-secondary);
}

.goal-card .goal-progress {
  font-weight: 600;
  color: var(--primary-color);
  margin-left: 0.5rem;
}

.goal-card .steps-list {
  padding: 0 1.25rem 1.25rem;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.step-item {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 12px;
  padding: 6px 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  border-left: 3px solid transparent;
  cursor: grab;
  transition: opacity 0.2s, transform 0.2s;
}

.step-item:active {
  cursor: grabbing;
}

.step-item.dragging {
  opacity: 0.5;
  transform: scale(0.98);
}

.step-item.scheduled {
  background: rgba(99, 102, 241, 0.08);
  border-left-color: var(--primary-color);
}

.step-item.priority-critical {
  border-left-color: var(--danger-color);
  background: rgba(239, 68, 68, 0.05);
}

.step-item.priority-desirable {
  border-left-color: var(--warning-color);
  background: rgba(245, 158, 11, 0.05);
}

.step-item.priority-attention {
  border-left-color: var(--info-color);
  background: rgba(59, 130, 246, 0.05);
}

.step-item.priority-optional {
  border-left-color: var(--text-tertiary);
  background: rgba(156, 163, 175, 0.05);
}

.step-item .step-title {
  flex: 1 1 auto;
  font-size: 0.875rem;
  min-width: 0;
  line-height: 28px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.step-item .step-actions {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 6px;
  flex-shrink: 0;
  flex-wrap: nowrap !important;
}

.day-select-sm,
.time-select-sm,
.priority-select-sm {
  padding: 0.25rem 0.4rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  background: var(--bg-primary);
  cursor: pointer;
  height: 28px;
}

.day-select-sm {
  min-width: 50px;
}

.time-select-sm {
  min-width: 45px;
}

.priority-select-sm {
  min-width: 85px;
}

.priority-select-sm.priority-critical {
  border-color: var(--danger-color);
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

.priority-select-sm.priority-desirable {
  border-color: var(--warning-color);
  background: rgba(245, 158, 11, 0.1);
  color: #b45309;
}

.priority-select-sm.priority-attention {
  border-color: var(--info-color);
  background: rgba(59, 130, 246, 0.1);
  color: var(--info-color);
}

.priority-select-sm.priority-optional {
  border-color: var(--text-tertiary);
  background: rgba(156, 163, 175, 0.1);
}

.week-navigation {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.week-navigation .btn-icon {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.week-navigation .btn-icon:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.week-range-text {
  font-weight: 500;
  min-width: 180px;
  text-align: center;
}

.btn-today {
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.week-calendar-full {
  padding: 1.5rem;
}

.week-calendar-full h3 {
  margin-bottom: 1rem;
}

.calendar-grid-full {
  display: grid;
  grid-template-columns: repeat(7, minmax(120px, 1fr));
  gap: 0.5rem;
}

.calendar-day-full {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  min-height: 150px;
  display: flex;
  flex-direction: column;
}

.calendar-day-full.today {
  border: 2px solid var(--primary-color);
}

.day-header-full {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.day-header-full .day-header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.day-header-full .day-name {
  font-weight: 600;
  font-size: 0.8rem;
}

.tasks-count {
  width: 22px;
  height: 22px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.day-tasks-full {
  flex: 1;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  overflow-y: auto;
}

.task-card {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  border-left: 3px solid var(--border-color);
}

.task-card.priority-critical {
  border-left-color: #dc2626;
  background: rgba(220, 38, 38, 0.08);
}

.task-card.priority-desirable {
  border-left-color: #ea580c;
  background: rgba(234, 88, 12, 0.08);
}

.task-card.priority-attention {
  border-left-color: #2563eb;
  background: rgba(37, 99, 235, 0.08);
}

.task-card.priority-optional {
  border-left-color: #9ca3af;
  background: rgba(156, 163, 175, 0.08);
}

.task-card.completed {
  opacity: 0.6;
}

.task-card.completed .task-title {
  text-decoration: line-through;
}

.task-card.dragging {
  opacity: 0.5;
  transform: scale(0.98);
}

.task-card[draggable="true"] {
  cursor: grab;
}

.task-card[draggable="true"]:active {
  cursor: grabbing;
}

.drag-handle {
  color: var(--text-tertiary);
  font-size: 0.7rem;
  cursor: grab;
  padding: 0 0.125rem;
  user-select: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.calendar-day-full.drag-over {
  background: rgba(99, 102, 241, 0.15);
  border: 2px dashed var(--primary-color);
}

.calendar-day-full.drag-over .empty-day {
  color: var(--primary-color);
  font-weight: 500;
}

.drop-zone {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-sm);
  min-height: 60px;
  transition: all 0.2s;
}

.drag-hint {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-weight: 400;
  margin-left: 0.5rem;
}

.task-checkbox {
  margin-top: 2px;
  cursor: pointer;
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-info .task-title {
  display: block;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-info .task-goal {
  display: block;
  font-size: 0.7rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-icon.remove-sm {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: 2px;
  font-size: 0.7rem;
  flex-shrink: 0;
}

.btn-icon.remove-sm:hover {
  color: var(--danger-color);
}

.empty-day {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 0.8rem;
  min-height: 80px;
}

@media (max-width: 1024px) {
  .step-layout,
  .planner-layout {
    grid-template-columns: 1fr;
  }
  
  .step-sidebar,
  .planner-sidebar {
    order: -1;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .lesson-progress-bar {
    padding: 0 0.5rem;
  }
  
  .step-label {
    display: none;
  }
  
  .step-actions {
    flex-direction: column;
  }
  
  .step-item .step-actions {
    flex-direction: row !important;
  }
  
  .step-schedule-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .step-schedule-controls {
    width: 100%;
  }
  
  .time-select,
  .priority-select,
  .day-select {
    flex: 1;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  .stat-box {
    padding: 0.5rem;
  }
  
  .stat-icon {
    font-size: 1.25rem;
  }
  
  .stat-number {
    font-size: 1rem;
  }
  
  .header-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .week-navigation {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .task-card {
    padding: 0.75rem;
  }
  
  .task-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .task-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .telegram-setup {
    padding: 1rem;
  }
  
  .telegram-status {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .notification-options {
    gap: 0.5rem;
  }
}

.undo-toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.undo-toast span {
  font-size: 0.9rem;
}

.btn-undo {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: var(--primary-color);
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-undo:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--primary-color);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(1rem);
}
</style>
