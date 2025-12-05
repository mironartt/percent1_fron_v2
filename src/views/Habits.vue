<template>
  <div class="habits-page">
    <header class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>
            <Flame :size="28" :stroke-width="1.5" />
            Мои привычки
          </h1>
          <p class="subtitle">Маленькие шаги к большим изменениям</p>
        </div>
        <button class="btn btn-primary" @click="openAddModal">
          <Plus :size="18" :stroke-width="1.5" />
          Добавить привычку
        </button>
      </div>
    </header>

    <div class="stats-bar">
      <button class="stat-item streak clickable" @click="showStreakModal = true" title="Нажмите для просмотра серии">
        <div class="stat-icon">
          <Zap :size="20" :stroke-width="1.5" />
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ habitStreak }}</span>
          <span class="stat-label">{{ pluralizeDays(habitStreak) }} подряд</span>
        </div>
        <div class="stat-action-hint">
          <TrendingUp :size="12" :stroke-width="1.5" />
        </div>
      </button>
      <button class="stat-item today clickable" @click="showTodayModal = true" title="Нажмите для просмотра сегодня">
        <div class="stat-icon">
          <CheckCircle :size="20" :stroke-width="1.5" />
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ todayCompleted }}/{{ todayTotal }}</span>
          <span class="stat-label">сегодня</span>
        </div>
        <div class="stat-action-hint">
          <TrendingUp :size="12" :stroke-width="1.5" />
        </div>
      </button>
      <button class="stat-item xp clickable" @click="showXpModal = true" title="Нажмите для просмотра XP">
        <div class="stat-icon">
          <Sparkles :size="20" :stroke-width="1.5" />
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ weekXpFromHabits }}</span>
          <span class="stat-label">XP за неделю</span>
        </div>
        <div class="stat-action-hint">
          <TrendingUp :size="12" :stroke-width="1.5" />
        </div>
      </button>
      <button class="stat-item mode settings clickable compact-mode" @click="showSettingsModal = true" title="Настройки геймификации">
        <div class="stat-icon" :class="gameSettings.difficultyMode">
          <Shield :size="18" :stroke-width="1.5" />
        </div>
        <div class="stat-content-inline">
          <span class="mode-label">режим: <strong>{{ difficultyLabel }}</strong></span>
        </div>
        <Settings :size="14" :stroke-width="1.5" class="settings-icon" />
      </button>
    </div>

    <!-- Блок амнистии -->
    <div class="amnesty-banner" v-if="maxAmnesties > 0 && amnestiesRemaining > 0 && missedDaysForAmnesty.length > 0">
      <div class="amnesty-banner-header">
        <div class="amnesty-banner-icon">
          <Heart :size="20" :stroke-width="1.5" />
        </div>
        <div class="amnesty-banner-info">
          <span class="amnesty-banner-title">Амнистия доступна</span>
          <span class="amnesty-banner-subtitle">{{ amnestiesRemaining }} из {{ maxAmnesties }} использований</span>
        </div>
      </div>
      <div class="amnesty-days-list">
        <span class="amnesty-days-label">Выберите день для прощения:</span>
        <div class="amnesty-days">
          <button 
            v-for="day in missedDaysForAmnesty" 
            :key="day.date"
            class="amnesty-day-btn"
            @click="applyAmnestyForDay(day.date)"
            :title="`Простить ${day.missedCount} пропущенных привычек`"
          >
            <span class="day-name">{{ day.dayName }}</span>
            <span class="day-missed">-{{ day.penaltyXp }} XP</span>
          </button>
        </div>
      </div>
    </div>

    <div class="tabs-navigation" v-if="allHabits.length > 0">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'tracker' }"
        @click="activeTab = 'tracker'"
      >
        <CheckCircle :size="16" :stroke-width="1.5" />
        Трекер
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'analytics' }"
        @click="activeTab = 'analytics'"
      >
        <TrendingUp :size="16" :stroke-width="1.5" />
        Аналитика
      </button>
    </div>

    <div class="tab-content" v-if="activeTab === 'tracker'">
    </div>

    <div class="tab-content analytics-tab" v-if="activeTab === 'analytics' && allHabits.length > 0">
      <div class="analytics-header">
        <h3>
          <TrendingUp :size="18" :stroke-width="1.5" />
          Детальная аналитика
        </h3>
      </div>
      
      <div class="analytics-grid">
        <div class="analytics-card completion">
          <div class="card-header">
            <span class="card-title">Выполнение</span>
          </div>
          <div class="completion-stats">
            <div class="completion-item">
              <span class="completion-value">{{ weekCompletionRate }}%</span>
              <span class="completion-label">за 7 дней</span>
            </div>
            <div class="completion-item">
              <span class="completion-value">{{ monthCompletionRate }}%</span>
              <span class="completion-label">за 30 дней</span>
            </div>
          </div>
          <div class="trend-chart">
            <div 
              v-for="(day, index) in last14Days" 
              :key="index" 
              class="trend-bar"
              :class="{ filled: day.completed > 0, partial: day.completed > 0 && day.completed < day.total }"
              :style="{ height: day.total > 0 ? (day.completed / day.total * 100) + '%' : '10%' }"
              :title="`${day.date}: ${day.completed}/${day.total}`"
            ></div>
          </div>
        </div>

        <div class="analytics-card calendar">
          <div class="card-header">
            <span class="card-title">Календарь</span>
            <span class="card-subtitle">последние 4 недели</span>
          </div>
          <div class="heatmap">
            <div class="heatmap-row" v-for="week in calendarWeeks" :key="week.weekNum">
              <div 
                v-for="day in week.days" 
                :key="day.date"
                class="heatmap-cell"
                :class="getHeatmapClass(day)"
                :title="`${formatCalendarDate(day.date)}: ${day.completed}/${day.total}`"
              ></div>
            </div>
          </div>
          <div class="heatmap-legend">
            <span>Меньше</span>
            <div class="legend-scale">
              <div class="legend-cell level-0"></div>
              <div class="legend-cell level-1"></div>
              <div class="legend-cell level-2"></div>
              <div class="legend-cell level-3"></div>
            </div>
            <span>Больше</span>
          </div>
        </div>

        <div class="analytics-card achievements">
          <div class="card-header">
            <span class="card-title">Достижения</span>
          </div>
          <div class="badges-list">
            <div 
              v-for="badge in habitBadges" 
              :key="badge.id"
              class="badge-item"
              :class="{ unlocked: badge.unlocked, locked: !badge.unlocked }"
            >
              <span class="badge-icon">{{ badge.icon }}</span>
              <div class="badge-info">
                <span class="badge-name">{{ badge.name }}</span>
                <span class="badge-desc">{{ badge.description }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="habits-per-habit-analytics">
        <h4>По привычкам</h4>
        <div class="habit-analytics-list">
          <div v-for="habit in allHabits" :key="habit.id" class="habit-analytics-item">
            <div class="habit-analytics-header">
              <span class="habit-icon-small">{{ getIconEmoji(habit.icon) }}</span>
              <span class="habit-name-small">{{ habit.name }}</span>
              <span class="habit-streak-badge">
                <Zap :size="12" :stroke-width="1.5" />
                {{ getHabitStreak(habit) }} дн.
              </span>
            </div>
            <div class="habit-week-view">
              <div 
                v-for="day in last14Days" 
                :key="day.date"
                class="habit-day-cell"
                :class="{ 
                  completed: isCompletedOnDay(habit, day.date),
                  scheduled: isScheduledForDay(habit, new Date(day.date).getDay()),
                  'not-scheduled': !isScheduledForDay(habit, new Date(day.date).getDay())
                }"
                :title="formatCalendarDate(day.date)"
              >
                <Check v-if="isCompletedOnDay(habit, day.date)" :size="10" :stroke-width="2.5" />
              </div>
            </div>
            <div class="habit-analytics-stats">
              <span class="stat-mini">{{ getHabitCompletionRate(habit, 7) }}% за неделю</span>
              <span class="stat-mini">{{ getHabitCompletionRate(habit, 30) }}% за месяц</span>
            </div>
          </div>
        </div>
      </div>

      <div class="ai-insights" v-if="gameSettings.aiCoachEnabled && aiInsights.length > 0">
        <h4>
          <Bot :size="16" :stroke-width="1.5" />
          AI-инсайты
        </h4>
        <div class="insights-list">
          <div v-for="insight in aiInsights" :key="insight.id" class="insight-item">
            <span class="insight-icon">{{ insight.icon }}</span>
            <span class="insight-text">{{ insight.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="habits-content" v-if="activeTab === 'tracker' || allHabits.length === 0">
      <div class="habits-list" v-if="allHabits.length > 0">
        <div 
          v-for="habit in allHabits" 
          :key="habit.id"
          class="habit-card"
          :class="{ completed: isHabitCompletedToday(habit), 'not-scheduled': !isScheduledForToday(habit) }"
        >
          <div class="habit-main" @click="toggleHabitCompletion(habit)">
            <div class="habit-check">
              <div class="checkbox" :class="{ checked: isHabitCompletedToday(habit), disabled: !isScheduledForToday(habit) }">
                <Check v-if="isHabitCompletedToday(habit)" :size="14" :stroke-width="2.5" />
              </div>
            </div>
            <span class="habit-icon">{{ getIconEmoji(habit.icon) }}</span>
            <div class="habit-info">
              <span class="habit-name">{{ habit.name }}</span>
              <div class="habit-meta">
                <span class="xp-badge positive">+{{ habit.xpReward }} XP</span>
                <span v-if="habit.xpPenalty && gameSettings.penaltiesEnabled" class="xp-badge negative">
                  -{{ habit.xpPenalty }} XP
                </span>
                <span class="frequency-badge">{{ getFrequencyLabel(habit) }}</span>
              </div>
            </div>
            <transition name="xp-pop">
              <span v-if="showXpPopup === habit.id" class="xp-popup">+{{ habit.xpReward }} XP</span>
            </transition>
          </div>
          
          <div class="habit-schedule-inline">
            <div 
              v-for="day in weekDays" 
              :key="day.key"
              class="schedule-day"
              :class="{ 
                active: isScheduledForDay(habit, day.key),
                completed: isCompletedOnDay(habit, day.date),
                today: day.isToday
              }"
              :title="`${day.name}: ${isCompletedOnDay(habit, day.date) ? 'выполнено' : isScheduledForDay(habit, day.key) ? 'запланировано' : 'не запланировано'}`"
            >
              <span class="day-letter">{{ day.short.charAt(0) }}</span>
            </div>
          </div>
          
          <div class="habit-actions">
            <button class="btn-icon" @click.stop="editHabit(habit)" title="Редактировать">
              <Pencil :size="16" :stroke-width="1.5" />
            </button>
            <button class="btn-icon" @click.stop="archiveHabit(habit)" title="Архивировать">
              <Archive :size="16" :stroke-width="1.5" />
            </button>
            <button class="btn-icon danger" @click.stop="confirmDeleteHabit(habit)" title="Удалить">
              <Trash2 :size="16" :stroke-width="1.5" />
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">🔥</div>
        <h3>Начните формировать привычки</h3>
        <p>Добавьте регулярные действия, которые хотите закрепить в своей жизни</p>
        <button class="btn btn-primary" @click="openAddModal">
          <Plus :size="18" :stroke-width="1.5" />
          Создать первую привычку
        </button>
      </div>
    </div>

    <div class="ai-coach-hint" v-if="coachHint">
      <div class="hint-icon">
        <Bot :size="20" :stroke-width="1.5" />
      </div>
      <p>{{ coachHint }}</p>
      <button class="btn-icon" @click="coachHint = null">
        <X :size="16" :stroke-width="1.5" />
      </button>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container modal-compact">
          <div class="modal-header">
            <h3>{{ editingHabit ? 'Редактировать привычку' : 'Новая привычка' }}</h3>
            <button class="btn-close" @click="closeModal">
              <X :size="20" :stroke-width="1.5" />
            </button>
          </div>
          
          <div class="modal-content">
            <div class="icon-picker-row">
              <button 
                v-for="icon in quickIcons" 
                :key="icon.name"
                class="icon-pick-btn"
                :class="{ selected: formData.icon === icon.name }"
                @click="formData.icon = icon.name"
              >
                {{ icon.emoji }}
              </button>
              <button 
                class="icon-pick-btn more-btn"
                :class="{ active: showIconPicker }"
                @click="showIconPicker = !showIconPicker"
                title="Ещё иконки"
              >
                <Ellipsis :size="16" :stroke-width="1.5" />
              </button>
            </div>
            
            <div class="icon-grid-dropdown" v-if="showIconPicker">
              <button 
                v-for="icon in moreIcons" 
                :key="icon.name"
                class="icon-option"
                :class="{ selected: formData.icon === icon.name }"
                @click="formData.icon = icon.name; showIconPicker = false"
              >
                {{ icon.emoji }}
              </button>
            </div>
            
            <div class="habit-name-row">
              <input 
                v-model="formData.name"
                type="text"
                class="form-input name-input-full"
                placeholder="Название привычки"
              />
            </div>
            
            <button 
              v-if="!editingHabit"
              class="btn-suggest-habit"
              @click="showSuggestionsModal = true"
            >
              <Sparkles :size="14" :stroke-width="1.5" />
              Подобрать привычку
            </button>
            
            <div class="xp-slider-row">
              <label class="slider-label">Награда за выполнение</label>
              <div class="xp-slider-control">
                <input 
                  type="range" 
                  v-model.number="formData.xpReward"
                  min="1"
                  max="100"
                  step="1"
                  class="xp-slider"
                />
                <span class="xp-slider-value">+{{ formData.xpReward }} XP</span>
              </div>
            </div>
            
            <textarea 
              v-model="formData.description"
              class="form-input description-input description-spacing"
              rows="4"
              placeholder="Зачем вам эта привычка? (опционально)"
            />
            
            <div class="schedule-compact">
              <div class="schedule-presets">
                <button 
                  class="preset-btn"
                  :class="{ active: formData.frequencyType === 'daily' }"
                  @click="formData.frequencyType = 'daily'"
                >
                  Каждый день
                </button>
                <button 
                  class="preset-btn"
                  :class="{ active: formData.frequencyType === 'weekdays' }"
                  @click="formData.frequencyType = 'weekdays'"
                >
                  Будни
                </button>
                <button 
                  class="preset-btn"
                  :class="{ active: formData.frequencyType === 'weekends' }"
                  @click="formData.frequencyType = 'weekends'"
                >
                  Выходные
                </button>
              </div>
              <div class="days-row">
                <button 
                  v-for="day in weekDaysConfig" 
                  :key="day.key"
                  class="day-btn-compact"
                  :class="{ active: isDayActiveBySchedule(day.key) }"
                  @click="toggleDayManual(day.key)"
                >
                  {{ day.short }}
                </button>
              </div>
            </div>
            
            <div class="optional-actions" v-if="gameSettings.difficultyMode !== 'soft'">
              <button 
                v-if="!showPenaltyField"
                class="btn-link optional-btn penalty"
                @click="showPenaltyField = true"
              >
                <Minus :size="14" :stroke-width="1.5" />
                Настроить штраф
              </button>
            </div>
            
            <div class="penalty-field" v-if="showPenaltyField && gameSettings.difficultyMode !== 'soft'">
              <label class="slider-label">
                <CircleAlert :size="14" :stroke-width="1.5" />
                Штраф за пропуск
              </label>
              <div class="xp-slider-control">
                <input 
                  type="range" 
                  v-model.number="formData.xpPenalty"
                  min="0"
                  max="200"
                  step="1"
                  class="xp-slider penalty"
                />
                <span class="xp-slider-value penalty">-{{ formData.xpPenalty }} XP</span>
              </div>
            </div>
          </div>
          
          <div class="modal-footer compact">
            <button v-if="editingHabit" class="btn-icon-only danger" @click="deleteHabit" title="Удалить">
              <Trash2 :size="18" :stroke-width="1.5" />
            </button>
            <div class="spacer"></div>
            <button class="btn btn-secondary" @click="closeModal">Отмена</button>
            <button 
              class="btn btn-primary" 
              @click="saveHabit"
              :disabled="!formData.name.trim()"
            >
              {{ editingHabit ? 'Сохранить' : 'Создать' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showSuggestionsModal" class="modal-overlay" @click.self="showSuggestionsModal = false">
        <div class="modal-container modal-suggestions">
          <div class="modal-header">
            <h3>
              <Sparkles :size="20" :stroke-width="1.5" />
              Подобрать привычку
            </h3>
            <button class="btn-close" @click="showSuggestionsModal = false">
              <X :size="20" :stroke-width="1.5" />
            </button>
          </div>
          
          <div class="modal-content">
            <p class="suggestions-intro">
              <Bot :size="16" :stroke-width="1.5" />
              Рекомендации от AI-ментора для формирования полезных привычек
            </p>
            
            <div class="suggestions-categories">
              <div 
                v-for="category in habitSuggestions" 
                :key="category.name"
                class="suggestion-category"
              >
                <div class="category-header">
                  <span class="category-icon">{{ category.icon }}</span>
                  <span class="category-name">{{ category.name }}</span>
                </div>
                <div class="category-habits">
                  <button 
                    v-for="habit in category.habits" 
                    :key="habit.name"
                    class="suggestion-habit"
                    @click="selectSuggestedHabit(habit)"
                  >
                    <span class="habit-emoji">{{ getIconEmoji(habit.icon) }}</span>
                    <div class="habit-details">
                      <span class="habit-title">{{ habit.name }}</span>
                      <span class="habit-desc">{{ habit.description }}</span>
                    </div>
                    <div class="habit-schedule-badge">{{ habit.scheduleLabel }}</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showSettingsModal" class="modal-overlay" @click.self="showSettingsModal = false">
        <div class="modal-container modal-settings">
          <div class="modal-header">
            <h3>
              <Settings :size="20" :stroke-width="1.5" />
              Настройки геймификации
            </h3>
            <button class="btn-close" @click="showSettingsModal = false">
              <X :size="20" :stroke-width="1.5" />
            </button>
          </div>
          
          <div class="modal-content">
            <div class="settings-section">
              <div class="section-header">
                <h4>Режим сложности</h4>
                <span class="section-hint">Выберите подходящий уровень</span>
              </div>
              
              <div class="difficulty-options">
                <button 
                  class="difficulty-btn soft"
                  :class="{ active: gameSettings.difficultyMode === 'soft' }"
                  @click="setDifficulty('soft')"
                >
                  <div class="diff-icon">🌱</div>
                  <div class="diff-info">
                    <span class="diff-name">Мягкий</span>
                    <span class="diff-desc">Только награды, без штрафов</span>
                    <span class="diff-details">Идеально для начинающих. Получайте XP за выполненные привычки без риска потерять прогресс.</span>
                  </div>
                  <div class="diff-check" v-if="gameSettings.difficultyMode === 'soft'">
                    <Check :size="16" :stroke-width="2.5" />
                  </div>
                </button>
                
                <button 
                  class="difficulty-btn balanced"
                  :class="{ active: gameSettings.difficultyMode === 'balanced' }"
                  @click="setDifficulty('balanced')"
                >
                  <div class="diff-icon">⚖️</div>
                  <div class="diff-info">
                    <span class="diff-name">Сбалансированный</span>
                    <span class="diff-desc">Штрафы 50% от награды</span>
                    <span class="diff-details">Баланс мотивации и ответственности. Пропуск привычки снимает половину XP награды. Амнистия 1 раз в неделю.</span>
                  </div>
                  <div class="diff-check" v-if="gameSettings.difficultyMode === 'balanced'">
                    <Check :size="16" :stroke-width="2.5" />
                  </div>
                </button>
                
                <button 
                  class="difficulty-btn hardcore"
                  :class="{ active: gameSettings.difficultyMode === 'hardcore' }"
                  @click="setDifficulty('hardcore')"
                >
                  <div class="diff-icon">🔥</div>
                  <div class="diff-info">
                    <span class="diff-name">Хардкор</span>
                    <span class="diff-desc">Штрафы равны награде</span>
                    <span class="diff-details">Максимальная ответственность. Пропуск = полный штраф. Быстрый прогресс при дисциплине, высокий риск при срывах.</span>
                  </div>
                  <div class="diff-check" v-if="gameSettings.difficultyMode === 'hardcore'">
                    <Check :size="16" :stroke-width="2.5" />
                  </div>
                </button>
                
                <button 
                  class="difficulty-btn custom"
                  :class="{ active: gameSettings.difficultyMode === 'custom' }"
                  @click="setDifficulty('custom')"
                >
                  <div class="diff-icon">⚙️</div>
                  <div class="diff-info">
                    <span class="diff-name">Свой режим</span>
                    <span class="diff-desc">Настроить вручную</span>
                    <span class="diff-details">Полный контроль над штрафами и амнистиями. Для опытных пользователей.</span>
                  </div>
                  <div class="diff-check" v-if="gameSettings.difficultyMode === 'custom'">
                    <Check :size="16" :stroke-width="2.5" />
                  </div>
                </button>
              </div>
              
              <div class="custom-settings" v-if="gameSettings.difficultyMode === 'custom'">
                <div class="custom-setting">
                  <div class="setting-header">
                    <label>Размер штрафа</label>
                    <span class="setting-value">{{ gameSettings.customPenaltyPercent }}%</span>
                  </div>
                  <div class="setting-hint">При награде 10 XP штраф будет {{ Math.round(10 * gameSettings.customPenaltyPercent / 100) }} XP</div>
                  <input 
                    type="range" 
                    min="0" 
                    max="150" 
                    step="10"
                    v-model.number="gameSettings.customPenaltyPercent"
                    @change="saveGameSettings"
                    class="slider penalty-slider"
                  />
                  <div class="slider-labels penalty-labels">
                    <span>0%</span>
                    <span>75%</span>
                    <span>150%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="settings-section" v-if="gameSettings.difficultyMode !== 'soft'">
              <div class="section-header">
                <h4>Амнистии</h4>
                <span class="section-hint">Прощение штрафов</span>
              </div>
              
              <div class="amnesty-setting">
                <div class="setting-header">
                  <label>Амнистий в неделю</label>
                  <span class="setting-value">{{ gameSettings.weeklyAmnestyCount }}</span>
                </div>
                <div class="setting-hint">Амнистия отменяет все штрафы за один день. Используйте их мудро.</div>
                <input 
                  type="range" 
                  min="0" 
                  max="7" 
                  step="1"
                  v-model.number="gameSettings.weeklyAmnestyCount"
                  @change="saveGameSettings"
                  class="slider amnesty-slider"
                />
                <div class="slider-labels amnesty-labels">
                  <span>0</span>
                  <span>3</span>
                  <span>7</span>
                </div>
              </div>
              
              <div class="amnesty-use-block" v-if="maxAmnesties > 0">
                <div class="amnesty-status">
                  <Gift :size="18" :stroke-width="1.5" />
                  <div class="amnesty-info-text">
                    <span class="amnesty-available" v-if="amnestiesRemaining > 0">
                      Доступно {{ amnestiesRemaining }} из {{ maxAmnesties }} на этой неделе
                    </span>
                    <span class="amnesty-depleted" v-else>
                      Все амнистии использованы на этой неделе
                    </span>
                  </div>
                </div>
                <button 
                  v-if="amnestiesRemaining > 0"
                  class="btn btn-amnesty"
                  @click="useAmnesty"
                >
                  <Gift :size="14" :stroke-width="1.5" />
                  Использовать амнистию
                </button>
              </div>
              
              <p class="settings-tip">
                <Lightbulb :size="14" :stroke-width="1.5" />
                Детальную настройку наград и штрафов можно задать при добавлении каждой привычки
              </p>
            </div>
            
            <div class="settings-section" :class="{ 'section-disabled': isSoftMode }">
              <div class="section-header">
                <h4>Санкции</h4>
                <span class="section-hint">Дополнительная мотивация</span>
              </div>
              
              <div v-if="isSoftMode" class="soft-mode-notice">
                <Shield :size="16" :stroke-width="1.5" />
                <span>В мягком режиме штрафы недоступны. Выберите другой режим для активации.</span>
              </div>
              
              <p v-else class="settings-info">
                <Info :size="14" :stroke-width="1.5" />
                Штрафы снимают XP, но ваш баланс никогда не уйдёт ниже 0
              </p>
              
              <div class="toggle-group-with-sliders" :class="{ 'toggles-disabled': isSoftMode }">
                <div class="toggle-item">
                  <label class="toggle-row" :class="{ disabled: isSoftMode }">
                    <div class="toggle-info">
                      <span class="toggle-label">Штрафы за пропуск привычек</span>
                      <span class="toggle-hint">Снимает XP если запланированная привычка не выполнена</span>
                    </div>
                    <input type="checkbox" v-model="gameSettings.penaltiesEnabled" @change="onPenaltiesEnabledChange" :disabled="isSoftMode" />
                    <span class="toggle"></span>
                  </label>
                </div>
                
                <div class="toggle-item">
                  <label class="toggle-row" :class="{ disabled: isSoftMode }">
                    <div class="toggle-info">
                      <span class="toggle-label">Штрафы за планирование</span>
                      <span class="toggle-hint">Снимает XP если нет плана на следующий день</span>
                    </div>
                    <input type="checkbox" v-model="gameSettings.planningPenalty" @change="saveGameSettings" :disabled="isSoftMode" />
                    <span class="toggle"></span>
                  </label>
                  <div class="inline-slider" v-if="gameSettings.planningPenalty && !isSoftMode">
                    <div class="inline-slider-header">
                      <span>Размер штрафа</span>
                      <span class="inline-slider-value">{{ gameSettings.planningPenaltyAmount || 10 }} XP</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      step="5"
                      v-model.number="gameSettings.planningPenaltyAmount"
                      @change="saveGameSettings"
                      class="slider mini-slider"
                    />
                  </div>
                </div>
                
                <div class="toggle-item">
                  <label class="toggle-row" :class="{ disabled: isSoftMode }">
                    <div class="toggle-info">
                      <span class="toggle-label">Штрафы за дневник</span>
                      <span class="toggle-hint">Снимает XP если дневник не заполнен за день</span>
                    </div>
                    <input type="checkbox" v-model="gameSettings.journalPenalty" @change="saveGameSettings" :disabled="isSoftMode" />
                    <span class="toggle"></span>
                  </label>
                  <div class="inline-slider" v-if="gameSettings.journalPenalty && !isSoftMode">
                    <div class="inline-slider-header">
                      <span>Размер штрафа</span>
                      <span class="inline-slider-value">{{ gameSettings.journalPenaltyAmount || 10 }} XP</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      step="5"
                      v-model.number="gameSettings.journalPenaltyAmount"
                      @change="saveGameSettings"
                      class="slider mini-slider"
                    />
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          
          <div class="modal-footer modal-footer-right">
            <button class="btn btn-primary" @click="showSettingsModal = false">Готово</button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showStreakModal" class="modal-overlay" @click.self="showStreakModal = false">
        <div class="modal-container modal-mini">
          <div class="modal-header">
            <h3>
              <Zap :size="20" :stroke-width="1.5" />
              Серия выполнений
            </h3>
            <button class="btn-close" @click="showStreakModal = false">
              <X :size="20" :stroke-width="1.5" />
            </button>
          </div>
          <div class="modal-content">
            <div class="streak-display">
              <span class="streak-number">{{ habitStreak }}</span>
              <span class="streak-text">{{ pluralizeDays(habitStreak) }} подряд</span>
            </div>
            <div class="streak-calendar">
              <div class="streak-week" v-for="week in streakCalendar" :key="week.weekNum">
                <div 
                  v-for="day in week.days" 
                  :key="day.date"
                  class="streak-day"
                  :class="{ success: day.allCompleted, partial: day.partialCompleted, missed: day.missed, today: day.isToday, future: day.isFuture }"
                  :title="day.label"
                >
                  <span class="day-letter">{{ day.letter }}</span>
                </div>
              </div>
            </div>
            <p class="streak-tip">Выполняйте все запланированные привычки каждый день, чтобы увеличить серию</p>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showTodayModal" class="modal-overlay" @click.self="showTodayModal = false">
        <div class="modal-container modal-mini">
          <div class="modal-header">
            <h3>
              <CheckCircle :size="20" :stroke-width="1.5" />
              Сегодня
            </h3>
            <button class="btn-close" @click="showTodayModal = false">
              <X :size="20" :stroke-width="1.5" />
            </button>
          </div>
          <div class="modal-content">
            <div class="today-progress">
              <div class="progress-circle" :style="{ '--progress': todayProgressPercent }">
                <span class="progress-value">{{ todayCompleted }}/{{ todayTotal }}</span>
              </div>
              <span class="progress-label">привычек выполнено</span>
            </div>
            <div class="today-habits-list">
              <div 
                v-for="habit in scheduledToday" 
                :key="habit.id"
                class="today-habit-item clickable"
                :class="{ completed: isHabitCompletedToday(habit) }"
                @click="toggleHabitCompletion(habit)"
              >
                <div class="habit-check-mini">
                  <div class="checkbox-mini" :class="{ checked: isHabitCompletedToday(habit) }">
                    <Check v-if="isHabitCompletedToday(habit)" :size="12" :stroke-width="2.5" />
                  </div>
                </div>
                <span class="habit-icon">{{ getIconEmoji(habit.icon) }}</span>
                <span class="habit-name">{{ habit.name }}</span>
                <span class="habit-xp-reward" :class="{ earned: isHabitCompletedToday(habit) }">
                  +{{ habit.xpReward || 5 }} XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showXpModal" class="modal-overlay" @click.self="showXpModal = false">
        <div class="modal-container modal-mini">
          <div class="modal-header">
            <h3>
              <Sparkles :size="20" :stroke-width="1.5" />
              XP за привычки
            </h3>
            <button class="btn-close" @click="showXpModal = false">
              <X :size="20" :stroke-width="1.5" />
            </button>
          </div>
          <div class="modal-content">
            <div class="xp-summary">
              <div class="xp-stat">
                <span class="xp-value">{{ weekXpFromHabits }}</span>
                <span class="xp-label">XP за неделю</span>
              </div>
              <div class="xp-stat">
                <span class="xp-value">{{ monthXpFromHabits }}</span>
                <span class="xp-label">XP за месяц</span>
              </div>
            </div>
            <div class="xp-chart">
              <div 
                v-for="(day, index) in xpByDay" 
                :key="index"
                class="xp-bar-container"
              >
                <div 
                  class="xp-bar" 
                  :style="{ height: day.height + '%' }"
                  :class="{ today: day.isToday }"
                ></div>
                <span class="xp-day-label">{{ day.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import { useXpStore, XP_REWARDS } from '../stores/xp'
import { useToastStore } from '../stores/toast'
import { DEBUG_MODE } from '@/config/settings.js'
import { 
  Flame, Plus, Minus, Zap, CheckCircle, Sparkles, Shield, Bot,
  Check, Pencil, X, Trash2, Settings, Gift, Archive, Info, TrendingUp, Calendar, Award,
  Ellipsis, CircleAlert, Lightbulb, Heart
} from 'lucide-vue-next'

const appStore = useAppStore()
const xpStore = useXpStore()
const toast = useToastStore()

const showModal = ref(false)
const showSettingsModal = ref(false)
const editingHabit = ref(null)
const showXpPopup = ref(null)
const coachHint = ref(null)
const activeTab = ref('tracker')
const showIconPicker = ref(false)
const showAdvancedOptions = ref(false)
const showStreakModal = ref(false)
const showTodayModal = ref(false)
const showXpModal = ref(false)
const showDescriptionField = ref(false)
const showXpSlider = ref(false)
const showPenaltyField = ref(false)
const showSuggestionsModal = ref(false)

const habitSuggestions = [
  {
    name: 'Здоровье и спорт',
    icon: '💪',
    habits: [
      { name: 'Утренняя зарядка', description: 'Разминка для бодрости на весь день', icon: 'gym', frequencyType: 'daily', scheduleDays: [1,2,3,4,5,6,0], scheduleLabel: 'Каждый день', xpReward: 10 },
      { name: 'Прогулка 30 минут', description: 'Свежий воздух и движение', icon: 'walking', frequencyType: 'daily', scheduleDays: [1,2,3,4,5,6,0], scheduleLabel: 'Каждый день', xpReward: 8 },
      { name: 'Выпить 8 стаканов воды', description: 'Поддержание водного баланса', icon: 'water', frequencyType: 'daily', scheduleDays: [1,2,3,4,5,6,0], scheduleLabel: 'Каждый день', xpReward: 5 },
      { name: 'Тренировка в зале', description: 'Силовые или кардио упражнения', icon: 'gym', frequencyType: 'custom', scheduleDays: [1,3,5], scheduleLabel: 'Пн, Ср, Пт', xpReward: 15 },
    ]
  },
  {
    name: 'Продуктивность',
    icon: '🎯',
    habits: [
      { name: 'Планирование дня', description: 'Составить список задач на день', icon: 'writing', frequencyType: 'weekdays', scheduleDays: [1,2,3,4,5], scheduleLabel: 'Будни', xpReward: 8 },
      { name: 'Фокус-сессия 25 мин', description: 'Работа без отвлечений по Помодоро', icon: 'target', frequencyType: 'weekdays', scheduleDays: [1,2,3,4,5], scheduleLabel: 'Будни', xpReward: 10 },
      { name: 'Разбор почты', description: 'Обработка входящих сообщений', icon: 'work', frequencyType: 'weekdays', scheduleDays: [1,2,3,4,5], scheduleLabel: 'Будни', xpReward: 5 },
    ]
  },
  {
    name: 'Саморазвитие',
    icon: '📚',
    habits: [
      { name: 'Чтение 20 минут', description: 'Расширение кругозора и отдых', icon: 'book', frequencyType: 'daily', scheduleDays: [1,2,3,4,5,6,0], scheduleLabel: 'Каждый день', xpReward: 10 },
      { name: 'Изучение языка', description: 'Практика иностранного языка', icon: 'brain', frequencyType: 'daily', scheduleDays: [1,2,3,4,5,6,0], scheduleLabel: 'Каждый день', xpReward: 12 },
      { name: 'Ведение дневника', description: 'Рефлексия и анализ дня', icon: 'writing', frequencyType: 'daily', scheduleDays: [1,2,3,4,5,6,0], scheduleLabel: 'Каждый день', xpReward: 8 },
    ]
  },
  {
    name: 'Ментальное здоровье',
    icon: '🧘',
    habits: [
      { name: 'Медитация', description: 'Практика осознанности и покоя', icon: 'meditation', frequencyType: 'daily', scheduleDays: [1,2,3,4,5,6,0], scheduleLabel: 'Каждый день', xpReward: 10 },
      { name: 'Благодарность', description: 'Записать 3 вещи за которые благодарен', icon: 'heart', frequencyType: 'daily', scheduleDays: [1,2,3,4,5,6,0], scheduleLabel: 'Каждый день', xpReward: 5 },
      { name: 'Цифровой детокс', description: 'Час без телефона перед сном', icon: 'phone', frequencyType: 'daily', scheduleDays: [1,2,3,4,5,6,0], scheduleLabel: 'Каждый день', xpReward: 8 },
    ]
  },
  {
    name: 'Режим и отдых',
    icon: '😴',
    habits: [
      { name: 'Ранний подъём', description: 'Встать до 7:00 утра', icon: 'sunrise', frequencyType: 'weekdays', scheduleDays: [1,2,3,4,5], scheduleLabel: 'Будни', xpReward: 10 },
      { name: 'Сон до 23:00', description: 'Лечь спать вовремя', icon: 'sleep', frequencyType: 'daily', scheduleDays: [1,2,3,4,5,6,0], scheduleLabel: 'Каждый день', xpReward: 8 },
      { name: 'Без экранов за час до сна', description: 'Подготовка к качественному сну', icon: 'moon', frequencyType: 'daily', scheduleDays: [1,2,3,4,5,6,0], scheduleLabel: 'Каждый день', xpReward: 6 },
    ]
  }
]

const habitIconsData = [
  { emoji: '🔥', name: 'fire' },
  { emoji: '💪', name: 'strength' },
  { emoji: '📖', name: 'book' },
  { emoji: '🧘', name: 'meditation' },
  { emoji: '💧', name: 'water' },
  { emoji: '🏃', name: 'running' },
  { emoji: '🍎', name: 'apple' },
  { emoji: '😴', name: 'sleep' },
  { emoji: '🎯', name: 'target' },
  { emoji: '📝', name: 'writing' },
  { emoji: '🧠', name: 'brain' },
  { emoji: '🎨', name: 'art' },
  { emoji: '🎵', name: 'music' },
  { emoji: '🌅', name: 'sunrise' },
  { emoji: '🚶', name: 'walking' },
  { emoji: '🧹', name: 'cleaning' },
  { emoji: '💼', name: 'work' },
  { emoji: '🏋️', name: 'gym' },
  { emoji: '🥗', name: 'salad' },
  { emoji: '☕', name: 'coffee' },
  { emoji: '🚿', name: 'shower' },
  { emoji: '🌿', name: 'nature' },
  { emoji: '📱', name: 'phone' },
  { emoji: '💊', name: 'pills' },
  { emoji: '🧘‍♀️', name: 'yoga' },
  { emoji: '🚴', name: 'cycling' },
  { emoji: '🏊', name: 'swimming' },
  { emoji: '⏰', name: 'alarm' },
  { emoji: '📚', name: 'study' },
  { emoji: '🎮', name: 'gaming' },
  { emoji: '🐕', name: 'dog' },
  { emoji: '🌙', name: 'moon' }
]

const quickIcons = habitIconsData.slice(0, 8)
const moreIcons = habitIconsData.slice(8)

const weekDaysConfig = [
  { key: 1, name: 'Понедельник', short: 'Пн' },
  { key: 2, name: 'Вторник', short: 'Вт' },
  { key: 3, name: 'Среда', short: 'Ср' },
  { key: 4, name: 'Четверг', short: 'Чт' },
  { key: 5, name: 'Пятница', short: 'Пт' },
  { key: 6, name: 'Суббота', short: 'Сб' },
  { key: 0, name: 'Воскресенье', short: 'Вс' }
]


const formData = ref({
  name: '',
  icon: 'fire',
  description: '',
  xpReward: 5,
  xpPenalty: 0,
  frequencyType: 'daily',
  scheduleDays: [1, 2, 3, 4, 5, 6, 0],
  reminderTime: ''
})

function getIconEmoji(iconName) {
  const found = habitIconsData.find(i => i.name === iconName)
  return found ? found.emoji : iconName
}

function normalizeIconName(rawIcon) {
  const byName = habitIconsData.find(i => i.name === rawIcon)
  if (byName) return rawIcon
  const byEmoji = habitIconsData.find(i => i.emoji === rawIcon)
  if (byEmoji) return byEmoji.name
  return 'fire'
}

const gameSettings = ref({
  difficultyMode: 'soft',
  penaltiesEnabled: false,
  journalPenalty: false,
  planningPenalty: false,
  journalPenaltyAmount: 10,
  planningPenaltyAmount: 10,
  aiCoachEnabled: true,
  weeklyAmnestyUsed: null,
  customPenaltyPercent: 50,
  weeklyAmnestyCount: 1,
  amnestiesUsedThisWeek: 0,
  amnestyWeekStart: null
})

const weekDays = computed(() => {
  const today = new Date()
  const currentDay = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((currentDay + 6) % 7))
  
  return weekDaysConfig.map((day, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return {
      ...day,
      date: date.toISOString().split('T')[0],
      isToday: date.toDateString() === today.toDateString()
    }
  })
})

const allHabits = computed(() => {
  return appStore.habits.filter(h => !h.archived).map(habit => ({
    ...habit,
    frequencyType: habit.frequencyType || 'daily',
    scheduleDays: habit.scheduleDays || [1, 2, 3, 4, 5, 6, 0],
    xpPenalty: habit.xpPenalty || 0
  }))
})

const habitStreak = computed(() => appStore.habitStreak)
const scheduledToday = computed(() => {
  const today = new Date().getDay()
  return allHabits.value.filter(h => isScheduledForDay(h, today))
})

const todayCompleted = computed(() => {
  const todayStr = new Date().toISOString().split('T')[0]
  const completedIds = appStore.habitLog[todayStr] || []
  return scheduledToday.value.filter(h => completedIds.includes(h.id)).length
})

const todayTotal = computed(() => scheduledToday.value.length)

const weekXpFromHabits = computed(() => {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  return xpStore.xpHistory
    .filter(e => e.source === 'habit_completed' && new Date(e.timestamp) >= weekAgo)
    .reduce((sum, e) => sum + e.amount, 0)
})

const monthXpFromHabits = computed(() => {
  const monthAgo = new Date()
  monthAgo.setDate(monthAgo.getDate() - 30)
  return xpStore.xpHistory
    .filter(e => e.source === 'habit_completed' && new Date(e.timestamp) >= monthAgo)
    .reduce((sum, e) => sum + e.amount, 0)
})

const todayProgressPercent = computed(() => {
  if (todayTotal.value === 0) return 0
  return Math.round((todayCompleted.value / todayTotal.value) * 100)
})

const streakCalendar = computed(() => {
  const weeks = []
  const today = new Date()
  const dayLetters = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  
  for (let w = 2; w >= 0; w--) {
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay() - (w * 7) + 1)
    
    const days = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + d)
      const dateStr = date.toISOString().split('T')[0]
      const todayStr = today.toISOString().split('T')[0]
      const isFuture = date > today
      const isToday = dateStr === todayStr
      
      const completedIds = appStore.habitLog[dateStr] || []
      const dayKey = date.getDay()
      const scheduled = allHabits.value.filter(h => isScheduledForDay(h, dayKey))
      const completedCount = scheduled.filter(h => completedIds.includes(h.id)).length
      
      days.push({
        date: dateStr,
        letter: dayLetters[date.getDay()],
        isToday,
        isFuture,
        allCompleted: !isFuture && scheduled.length > 0 && completedCount === scheduled.length,
        partialCompleted: !isFuture && completedCount > 0 && completedCount < scheduled.length,
        missed: !isFuture && !isToday && scheduled.length > 0 && completedCount === 0,
        label: `${date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}: ${completedCount}/${scheduled.length}`
      })
    }
    weeks.push({ weekNum: w, days })
  }
  return weeks
})

const xpByDay = computed(() => {
  const days = []
  const today = new Date()
  const dayLabels = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const todayStr = today.toISOString().split('T')[0]
    
    const xp = xpStore.xpHistory
      .filter(e => e.source === 'habit_completed' && e.timestamp.startsWith(dateStr))
      .reduce((sum, e) => sum + e.amount, 0)
    
    days.push({
      date: dateStr,
      xp,
      label: dayLabels[date.getDay()],
      isToday: dateStr === todayStr
    })
  }
  
  const maxXp = Math.max(...days.map(d => d.xp), 1)
  return days.map(d => ({ ...d, height: (d.xp / maxXp) * 100 }))
})

function isHabitCompletedToday(habit) {
  const todayStr = new Date().toISOString().split('T')[0]
  const completedIds = appStore.habitLog[todayStr] || []
  return completedIds.includes(habit.id)
}

const difficultyLabel = computed(() => {
  const labels = { soft: 'Мягкий', balanced: 'Баланс', hardcore: 'Хардкор', custom: 'Свой' }
  return labels[gameSettings.value.difficultyMode]
})

const isSoftMode = computed(() => gameSettings.value.difficultyMode === 'soft')

const currentPenaltyPercent = computed(() => {
  const mode = gameSettings.value.difficultyMode
  if (mode === 'soft') return 0
  if (mode === 'balanced') return 50
  if (mode === 'hardcore') return 100
  return gameSettings.value.customPenaltyPercent
})

const maxAmnesties = computed(() => {
  const mode = gameSettings.value.difficultyMode
  if (mode === 'soft') return 0
  if (mode === 'balanced') return 1
  if (mode === 'hardcore') return 0
  return gameSettings.value.weeklyAmnestyCount
})

const amnestiesRemaining = computed(() => {
  const now = new Date()
  const weekStart = getWeekStart(now)
  
  if (!gameSettings.value.amnestyWeekStart || 
      new Date(gameSettings.value.amnestyWeekStart).getTime() !== weekStart.getTime()) {
    return maxAmnesties.value
  }
  
  return Math.max(0, maxAmnesties.value - gameSettings.value.amnestiesUsedThisWeek)
})

function isScheduledForDay(habit, dayKey) {
  if (habit.frequencyType === 'daily') return true
  if (habit.frequencyType === 'weekdays') return dayKey >= 1 && dayKey <= 5
  if (habit.frequencyType === 'weekends') return dayKey === 0 || dayKey === 6
  return habit.scheduleDays?.includes(dayKey)
}

const missedDaysForAmnesty = computed(() => {
  if (gameSettings.value.difficultyMode === 'soft') return []
  if (!gameSettings.value.penaltiesEnabled) return []
  
  const days = []
  const today = new Date()
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const dayOfWeek = date.getDay()
    
    const scheduledForDay = allHabits.value.filter(h => isScheduledForDay(h, dayOfWeek))
    const completedIds = appStore.habitLog[dateStr] || []
    const missedHabits = scheduledForDay.filter(h => !completedIds.includes(h.id))
    
    if (missedHabits.length > 0) {
      const penaltyXp = missedHabits.reduce((sum, h) => {
        const baseXp = h.xpReward || 5
        const penaltyMultiplier = (h.penaltyPercent ?? currentPenaltyPercent.value) / 100
        return sum + Math.round(baseXp * penaltyMultiplier)
      }, 0)
      
      const amnestiedDates = gameSettings.value.amnestiedDates || []
      if (!amnestiedDates.includes(dateStr)) {
        days.push({
          date: dateStr,
          dayName: dayNames[dayOfWeek] + ', ' + date.getDate(),
          missedCount: missedHabits.length,
          penaltyXp
        })
      }
    }
  }
  
  return days.slice(0, 5)
})

function applyAmnestyForDay(dateStr) {
  if (amnestiesRemaining.value <= 0) {
    toast.warning('Нет доступных амнистий')
    return
  }
  
  const now = new Date()
  const weekStart = getWeekStart(now)
  
  if (!gameSettings.value.amnestyWeekStart || 
      new Date(gameSettings.value.amnestyWeekStart).getTime() !== weekStart.getTime()) {
    gameSettings.value.amnestyWeekStart = weekStart.toISOString()
    gameSettings.value.amnestiesUsedThisWeek = 0
  }
  
  if (!gameSettings.value.amnestiedDates) {
    gameSettings.value.amnestiedDates = []
  }
  gameSettings.value.amnestiedDates.push(dateStr)
  gameSettings.value.amnestiesUsedThisWeek++
  saveGameSettings()
  
  const dayInfo = missedDaysForAmnesty.value.find(d => d.date === dateStr)
  const xpRecovered = dayInfo?.penaltyXp || 0
  
  toast.success(`Амнистия применена! Возвращено ${xpRecovered} XP`)
}

function getWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

const weeklyAmnestyAvailable = computed(() => {
  if (gameSettings.value.difficultyMode === 'soft') return false
  if (!gameSettings.value.penaltiesEnabled) return false
  return amnestiesRemaining.value > 0
})

function getCompletionForDate(dateStr) {
  const dayOfWeek = new Date(dateStr).getDay()
  const scheduledForDay = allHabits.value.filter(h => isScheduledForDay(h, dayOfWeek))
  const completedIds = appStore.habitLog[dateStr] || []
  const completed = scheduledForDay.filter(h => completedIds.includes(h.id)).length
  return { completed, total: scheduledForDay.length }
}

const last14Days = computed(() => {
  const days = []
  const today = new Date()
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const { completed, total } = getCompletionForDate(dateStr)
    days.push({ date: dateStr, completed, total })
  }
  return days
})

const weekCompletionRate = computed(() => {
  let totalCompleted = 0
  let totalScheduled = 0
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const { completed, total } = getCompletionForDate(dateStr)
    totalCompleted += completed
    totalScheduled += total
  }
  return totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0
})

const monthCompletionRate = computed(() => {
  let totalCompleted = 0
  let totalScheduled = 0
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const { completed, total } = getCompletionForDate(dateStr)
    totalCompleted += completed
    totalScheduled += total
  }
  return totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0
})

function getHabitStreak(habit) {
  let streak = 0
  const today = new Date()
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const dayOfWeek = date.getDay()
    
    if (!isScheduledForDay(habit, dayOfWeek)) continue
    
    if (appStore.habitLog[dateStr]?.includes(habit.id)) {
      streak++
    } else {
      break
    }
  }
  return streak
}

function getHabitCompletionRate(habit, days) {
  let completed = 0
  let scheduled = 0
  const today = new Date()
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const dayOfWeek = date.getDay()
    
    if (isScheduledForDay(habit, dayOfWeek)) {
      scheduled++
      if (appStore.habitLog[dateStr]?.includes(habit.id)) {
        completed++
      }
    }
  }
  
  return scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0
}

const aiInsights = computed(() => {
  const insights = []
  
  const dayNames = ['воскресенье', 'понедельник', 'вторник', 'среду', 'четверг', 'пятницу', 'субботу']
  const dayCompletionRates = Array(7).fill(0).map((_, dayIndex) => {
    let completed = 0
    let scheduled = 0
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      if (date.getDay() !== dayIndex) continue
      
      const dateStr = date.toISOString().split('T')[0]
      allHabits.value.forEach(habit => {
        if (isScheduledForDay(habit, dayIndex)) {
          scheduled++
          if (appStore.habitLog[dateStr]?.includes(habit.id)) {
            completed++
          }
        }
      })
    }
    
    return { day: dayIndex, rate: scheduled > 0 ? completed / scheduled : 1 }
  })
  
  const worstDay = dayCompletionRates.reduce((min, curr) => curr.rate < min.rate ? curr : min)
  if (worstDay.rate < 0.5 && allHabits.value.length > 0) {
    insights.push({
      id: 'worst-day',
      icon: '📊',
      text: `Вы чаще пропускаете привычки в ${dayNames[worstDay.day]}. Возможно, стоит пересмотреть расписание.`
    })
  }
  
  allHabits.value.forEach(habit => {
    const streak = getHabitStreak(habit)
    if (streak >= 21) {
      insights.push({
        id: `habit-${habit.id}-streak`,
        icon: '🎯',
        text: `"${habit.name}" выполняется ${streak} дней — это уже настоящая привычка!`
      })
    }
  })
  
  if (weekCompletionRate.value >= 90) {
    insights.push({
      id: 'excellent-week',
      icon: '🌟',
      text: 'Отличная неделя! Продолжайте в том же духе.'
    })
  } else if (weekCompletionRate.value < 50 && allHabits.value.length > 3) {
    insights.push({
      id: 'too-many-habits',
      icon: '💡',
      text: 'Много пропусков? Попробуйте сфокусироваться на 2-3 ключевых привычках.'
    })
  }
  
  return insights.slice(0, 3)
})

const calendarWeeks = computed(() => {
  const weeks = []
  const today = new Date()
  for (let w = 3; w >= 0; w--) {
    const weekDays = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(today)
      date.setDate(date.getDate() - (w * 7 + (6 - d)))
      const dateStr = date.toISOString().split('T')[0]
      const { completed, total } = getCompletionForDate(dateStr)
      weekDays.push({ date: dateStr, completed, total })
    }
    weeks.push({ weekNum: 3 - w, days: weekDays })
  }
  return weeks
})

function getHeatmapClass(day) {
  if (day.total === 0) return 'level-0'
  const rate = day.completed / day.total
  if (rate === 0) return 'level-0'
  if (rate < 0.5) return 'level-1'
  if (rate < 1) return 'level-2'
  return 'level-3'
}

function formatCalendarDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

const habitBadges = computed(() => {
  const streak = habitStreak.value
  const badges = [
    { id: 'week', icon: '🔥', name: '7 дней подряд', description: 'Неделя без пропусков', unlocked: streak >= 7 },
    { id: 'fortnight', icon: '⚡', name: '14 дней подряд', description: 'Две недели дисциплины', unlocked: streak >= 14 },
    { id: 'month', icon: '🏆', name: '30 дней подряд', description: 'Месяц стабильности', unlocked: streak >= 30 },
    { id: 'perfectWeek', icon: '💎', name: 'Идеальная неделя', description: '100% выполнение за 7 дней', unlocked: weekCompletionRate.value === 100 },
  ]
  return badges
})

function isScheduledForToday(habit) {
  const today = new Date().getDay()
  return isScheduledForDay(habit, today)
}

function isCompletedOnDay(habit, dateStr) {
  return appStore.habitLog[dateStr]?.includes(habit.id)
}

function getFrequencyLabel(habit) {
  if (habit.frequencyType === 'daily') return 'Ежедневно'
  if (habit.frequencyType === 'weekdays') return 'Будни'
  if (habit.frequencyType === 'weekends') return 'Выходные'
  const days = habit.scheduleDays?.length || 0
  return `${days} ${pluralizeDaysWord(days)} в неделю`
}

function pluralizeDays(n) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'день'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'дня'
  return 'дней'
}

function pluralizeDaysWord(n) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'день'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'дня'
  return 'дней'
}

function toggleHabitCompletion(habit) {
  if (!isScheduledForToday(habit)) {
    toast.showToast({ title: 'Эта привычка не запланирована на сегодня', type: 'info' })
    return
  }
  
  const result = appStore.toggleHabit(habit.id)
  
  if (result.completed) {
    const xpAmount = habit.xpReward || XP_REWARDS.HABIT_COMPLETED
    xpStore.awardXP(xpAmount, 'habit_completed', { 
      habitId: habit.id, 
      habitName: habit.name 
    })
    
    showXpPopup.value = habit.id
    setTimeout(() => {
      showXpPopup.value = null
    }, 1200)
  } else {
    const lastEvent = xpStore.xpHistory.find(
      e => e.source === 'habit_completed' && 
           e.metadata?.habitId === habit.id &&
           new Date(e.timestamp).toDateString() === new Date().toDateString()
    )
    if (lastEvent) {
      xpStore.revokeXP(lastEvent.id)
    }
  }
}

function openAddModal() {
  editingHabit.value = null
  formData.value = {
    name: '',
    icon: '🔥',
    description: '',
    xpReward: 5,
    xpPenalty: gameSettings.value.difficultyMode === 'hardcore' ? 5 : 
               gameSettings.value.difficultyMode === 'balanced' ? 3 : 0,
    frequencyType: 'daily',
    scheduleDays: [1, 2, 3, 4, 5, 6, 0],
    reminderTime: ''
  }
  showDescriptionField.value = false
  showXpSlider.value = false
  showPenaltyField.value = false
  showIconPicker.value = false
  showModal.value = true
}

function editHabit(habit) {
  editingHabit.value = habit
  formData.value = {
    name: habit.name,
    icon: normalizeIconName(habit.icon),
    description: habit.description || '',
    xpReward: habit.xpReward || 5,
    xpPenalty: habit.xpPenalty || 0,
    frequencyType: habit.frequencyType || 'daily',
    scheduleDays: habit.scheduleDays || [1, 2, 3, 4, 5, 6, 0],
    reminderTime: habit.reminderTime || ''
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingHabit.value = null
  showIconPicker.value = false
  showAdvancedOptions.value = false
  showDescriptionField.value = false
  showXpSlider.value = false
  showPenaltyField.value = false
}

function selectSuggestedHabit(habit) {
  formData.value = {
    name: habit.name,
    icon: habit.icon,
    description: habit.description || '',
    xpReward: habit.xpReward || 10,
    xpPenalty: 0,
    frequencyType: habit.frequencyType || 'daily',
    scheduleDays: habit.scheduleDays || [1, 2, 3, 4, 5, 6, 0],
    reminderTime: ''
  }
  showSuggestionsModal.value = false
}

function toggleDay(dayKey) {
  const index = formData.value.scheduleDays.indexOf(dayKey)
  if (index === -1) {
    formData.value.scheduleDays.push(dayKey)
  } else if (formData.value.scheduleDays.length > 1) {
    formData.value.scheduleDays.splice(index, 1)
  }
}

function toggleDayManual(dayKey) {
  formData.value.frequencyType = 'custom'
  toggleDay(dayKey)
}

function isDayActiveBySchedule(dayKey) {
  const freqType = formData.value.frequencyType
  if (freqType === 'daily') {
    return true
  } else if (freqType === 'weekdays') {
    return dayKey >= 1 && dayKey <= 5
  } else if (freqType === 'weekends') {
    return dayKey === 0 || dayKey === 6
  } else if (freqType === 'custom') {
    const days = formData.value.scheduleDays
    return Array.isArray(days) && days.includes(dayKey)
  }
  return false
}

function saveHabit() {
  if (!formData.value.name.trim()) return
  
  const habitData = {
    name: formData.value.name.trim(),
    icon: formData.value.icon,
    description: formData.value.description,
    xpReward: formData.value.xpReward,
    xpPenalty: formData.value.xpPenalty,
    frequencyType: formData.value.frequencyType,
    scheduleDays: formData.value.frequencyType === 'custom' ? formData.value.scheduleDays :
                  formData.value.frequencyType === 'weekdays' ? [1, 2, 3, 4, 5] :
                  formData.value.frequencyType === 'weekends' ? [0, 6] : [0, 1, 2, 3, 4, 5, 6],
    reminderTime: formData.value.reminderTime
  }
  
  if (editingHabit.value) {
    appStore.updateHabit(editingHabit.value.id, habitData)
    toast.showToast({ title: 'Привычка обновлена', type: 'success' })
  } else {
    appStore.addHabit(habitData)
    toast.showToast({ title: 'Привычка создана', type: 'success' })
    
    if (allHabits.value.length === 0 && gameSettings.value.aiCoachEnabled) {
      coachHint.value = 'Отлично! Первый шаг сделан. Старайтесь выполнять привычку каждый день — так она закрепится быстрее.'
    }
  }
  
  closeModal()
}

function deleteHabit() {
  if (editingHabit.value) {
    appStore.removeHabit(editingHabit.value.id)
    toast.showToast({ title: 'Привычка удалена', type: 'info' })
    closeModal()
  }
}

function archiveHabit(habit) {
  appStore.updateHabit(habit.id, { archived: true })
  toast.showToast({ title: 'Привычка архивирована', type: 'info' })
}

function confirmDeleteHabit(habit) {
  if (confirm(`Удалить привычку "${habit.name}"?`)) {
    appStore.removeHabit(habit.id)
    toast.showToast({ title: 'Привычка удалена', type: 'info' })
  }
}

function setDifficulty(mode) {
  gameSettings.value.difficultyMode = mode
  gameSettings.value.penaltiesEnabled = mode !== 'soft'
  
  if (mode === 'soft') {
    gameSettings.value.weeklyAmnestyCount = 0
  } else if (mode === 'balanced') {
    gameSettings.value.weeklyAmnestyCount = 1
  } else if (mode === 'hardcore') {
    gameSettings.value.weeklyAmnestyCount = 0
  }
  
  saveGameSettings()
}

function saveGameSettings() {
  try {
    localStorage.setItem('onepercent_game_settings', JSON.stringify(gameSettings.value))
    if (DEBUG_MODE) {
      console.log('[Habits] Game settings saved:', gameSettings.value)
    }
  } catch (e) {
    console.error('[Habits] Failed to save game settings:', e)
  }
}

function onPenaltiesEnabledChange() {
  if (!gameSettings.value.penaltiesEnabled) {
    gameSettings.value.difficultyMode = 'soft'
    gameSettings.value.weeklyAmnestyCount = 0
  }
  saveGameSettings()
}

function loadGameSettings() {
  try {
    const stored = localStorage.getItem('onepercent_game_settings')
    if (stored) {
      gameSettings.value = { ...gameSettings.value, ...JSON.parse(stored) }
    }
  } catch (e) {
    console.error('[Habits] Failed to load game settings:', e)
  }
}

function useAmnesty() {
  const now = new Date()
  const weekStart = getWeekStart(now)
  
  if (!gameSettings.value.amnestyWeekStart || 
      new Date(gameSettings.value.amnestyWeekStart).getTime() !== weekStart.getTime()) {
    gameSettings.value.amnestyWeekStart = weekStart.toISOString()
    gameSettings.value.amnestiesUsedThisWeek = 0
  }
  
  gameSettings.value.amnestiesUsedThisWeek++
  gameSettings.value.weeklyAmnestyUsed = now.toISOString()
  saveGameSettings()
  
  const remaining = amnestiesRemaining.value
  const message = remaining > 0 
    ? `Штрафы за сегодня отменены. Осталось амнистий: ${remaining}` 
    : 'Штрафы за сегодня отменены. Это была последняя амнистия на этой неделе'
  toast.showToast({ title: 'Амнистия активирована!', message, type: 'success' })
}

onMounted(() => {
  loadGameSettings()
  
  if (gameSettings.value.aiCoachEnabled && habitStreak.value >= 7 && habitStreak.value % 7 === 0) {
    coachHint.value = `Потрясающе! ${habitStreak.value} дней подряд — это уже настоящая привычка! Так держать!`
  }
})
</script>

<style scoped>
.habits-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.title-section h1 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.75rem;
  margin: 0 0 0.25rem 0;
}

.title-section h1 svg {
  color: #f97316;
}

.subtitle {
  color: var(--text-muted);
  margin: 0;
}

.stats-bar {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1.5fr;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.stat-item.mode {
  cursor: pointer;
  transition: all 0.2s ease;
}

.stat-item.mode:hover {
  border-color: var(--primary-color);
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-item.streak .stat-icon {
  background: rgba(234, 179, 8, 0.1);
  color: #eab308;
}

.stat-item.today .stat-icon {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.stat-item.xp .stat-icon {
  background: rgba(124, 58, 237, 0.1);
  color: #7c3aed;
}

.stat-item.mode .stat-icon {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.stat-item.mode .stat-icon.soft { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
.stat-item.mode .stat-icon.balanced { background: rgba(234, 179, 8, 0.1); color: #eab308; }
.stat-item.mode .stat-icon.hardcore { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.stat-item.mode .stat-icon.custom { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }

.tabs-navigation {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 4px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--card-bg);
  color: var(--primary-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.analytics-mini {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: 10px;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
}

.mini-stat {
  display: flex;
  flex-direction: column;
}

.mini-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary-color);
}

.mini-label {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.mini-chart {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 30px;
  margin-left: auto;
}

.mini-bar {
  width: 6px;
  min-height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.mini-bar.filled {
  background: var(--primary-color);
}

.mini-bar.partial {
  background: rgba(124, 58, 237, 0.5);
}

.analytics-tab {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.habits-per-habit-analytics {
  margin-top: 1.5rem;
}

.habits-per-habit-analytics h4 {
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.habit-analytics-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.habit-analytics-item {
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.habit-analytics-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.habit-icon-small {
  font-size: 1.25rem;
}

.habit-name-small {
  font-weight: 500;
  color: var(--text-primary);
}

.habit-streak-badge {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: rgba(234, 179, 8, 0.1);
  color: #eab308;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.habit-week-view {
  display: flex;
  gap: 4px;
  margin-bottom: 0.5rem;
}

.habit-day-cell {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.habit-day-cell.scheduled {
  background: rgba(124, 58, 237, 0.15);
}

.habit-day-cell.completed {
  background: var(--primary-color);
  color: white;
}

.habit-day-cell.not-scheduled {
  opacity: 0.3;
}

.habit-analytics-stats {
  display: flex;
  gap: 1rem;
}

.stat-mini {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.ai-insights {
  margin-top: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(59, 130, 246, 0.05));
  border-radius: 12px;
  border: 1px solid rgba(124, 58, 237, 0.2);
}

.ai-insights h4 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  margin: 0 0 0.75rem 0;
  color: var(--primary-color);
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--card-bg);
  border-radius: 8px;
}

.insight-icon {
  font-size: 1rem;
}

.insight-text {
  font-size: 0.85rem;
  color: var(--text-primary);
  line-height: 1.4;
}

.habits-content {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.week-header {
  display: flex;
  justify-content: flex-end;
  padding-right: 48px;
  margin-bottom: 0.5rem;
}

.day-label {
  width: 32px;
  text-align: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
}

.habits-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.habit-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.habit-card:hover {
  background: var(--bg-tertiary, rgba(0,0,0,0.05));
}

.habit-card.completed {
  background: rgba(34, 197, 94, 0.1);
}

.habit-card.not-scheduled {
  opacity: 0.5;
}

.habit-main {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  position: relative;
}

.habit-check {
  flex-shrink: 0;
}

.checkbox {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: var(--card-bg);
}

.checkbox.checked {
  background: var(--success-color, #22c55e);
  border-color: var(--success-color, #22c55e);
  color: white;
}

.checkbox.disabled {
  opacity: 0.4;
}

.habit-icon {
  font-size: 1.5rem;
}

.habit-info {
  flex: 1;
  min-width: 0;
}

.habit-name {
  display: block;
  font-weight: 500;
}

.habit-card.completed .habit-name {
  text-decoration: line-through;
  opacity: 0.7;
}

.habit-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.xp-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.xp-badge.positive {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.xp-badge.negative {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.frequency-badge {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.xp-popup {
  position: absolute;
  right: 0;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
}

.xp-pop-enter-active {
  animation: xp-bounce 0.5s ease;
}

.xp-pop-leave-active {
  transition: all 0.3s ease;
}

.xp-pop-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes xp-bounce {
  0% { transform: scale(0.5) translateY(10px); opacity: 0; }
  50% { transform: scale(1.2) translateY(-5px); }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

.habit-schedule-inline {
  display: flex;
  gap: 3px;
  margin-left: auto;
  margin-right: 0.5rem;
}

.schedule-day {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: var(--bg-secondary);
  transition: all 0.2s ease;
  cursor: default;
}

.day-letter {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
}

.schedule-day.active {
  background: rgba(124, 58, 237, 0.15);
}

.schedule-day.active .day-letter {
  color: var(--primary-color);
}

.schedule-day.completed {
  background: #22c55e;
}

.schedule-day.completed .day-letter {
  color: white;
}

.schedule-day.today {
  box-shadow: 0 0 0 2px var(--primary-color);
}

.habit-actions {
  flex-shrink: 0;
  display: flex;
  gap: 0.25rem;
}

.btn-icon {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--bg-secondary);
}

.btn-icon.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.stat-item.clickable {
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.stat-item.clickable:hover {
  border-color: var(--primary-color);
  background: rgba(124, 58, 237, 0.05);
}

.stat-action {
  margin-left: auto;
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.stat-item.clickable:hover .stat-action {
  color: var(--primary-color);
}

.stat-main {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
  min-width: 0;
}

.stat-main .stat-content {
  white-space: nowrap;
}

.stat-item.compact-mode {
  min-width: 0;
  padding: 0.75rem 1rem;
}

.stat-content-inline {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.mode-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mode-label strong {
  color: var(--text-primary);
  font-weight: 600;
}

.settings-icon {
  flex-shrink: 0;
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.stat-item.compact-mode:hover .settings-icon {
  color: var(--primary-color);
}

.settings-cta {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.5rem;
  background: rgba(124, 58, 237, 0.1);
  border-radius: 5px;
  color: var(--primary-color);
  font-size: 0.7rem;
  font-weight: 500;
  width: fit-content;
  transition: all 0.2s ease;
}

.stat-item.settings:hover .settings-cta {
  background: var(--primary-color);
  color: white;
}

.analytics-section {
  margin-bottom: 1.5rem;
}

.analytics-header {
  margin-bottom: 1rem;
}

.analytics-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.analytics-header h3 svg {
  color: var(--primary-color);
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.analytics-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid var(--border-color);
}

.analytics-card .card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.analytics-card .card-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.analytics-card .card-subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.completion-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.completion-item {
  display: flex;
  flex-direction: column;
}

.completion-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.completion-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.trend-chart {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 40px;
}

.trend-bar {
  flex: 1;
  min-height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  transition: all 0.2s ease;
}

.trend-bar.filled {
  background: var(--primary-color);
}

.trend-bar.partial {
  background: rgba(124, 58, 237, 0.5);
}

.heatmap {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.heatmap-row {
  display: flex;
  gap: 3px;
}

.heatmap-cell {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  background: var(--bg-secondary);
  transition: all 0.2s ease;
}

.heatmap-cell.level-0 { background: var(--bg-secondary); }
.heatmap-cell.level-1 { background: rgba(34, 197, 94, 0.3); }
.heatmap-cell.level-2 { background: rgba(34, 197, 94, 0.6); }
.heatmap-cell.level-3 { background: #22c55e; }

.heatmap-legend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  font-size: 0.7rem;
  color: var(--text-muted);
}

.legend-scale {
  display: flex;
  gap: 2px;
}

.legend-cell {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-cell.level-0 { background: var(--bg-secondary); }
.legend-cell.level-1 { background: rgba(34, 197, 94, 0.3); }
.legend-cell.level-2 { background: rgba(34, 197, 94, 0.6); }
.legend-cell.level-3 { background: #22c55e; }

.badges-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.badge-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 8px;
  background: var(--bg-secondary);
  transition: all 0.2s ease;
}

.badge-item.unlocked {
  background: rgba(34, 197, 94, 0.1);
}

.badge-item.locked {
  opacity: 0.5;
}

.badge-icon {
  font-size: 1.25rem;
}

.badge-info {
  display: flex;
  flex-direction: column;
}

.badge-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.badge-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.section-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.settings-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(124, 58, 237, 0.05);
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.settings-info svg {
  color: var(--primary-color);
  flex-shrink: 0;
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.toggle-group-with-sliders {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toggle-item {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.toggle-item .toggle-row {
  margin-bottom: 0;
}

.inline-slider {
  padding: 0.75rem 1rem;
  margin-left: 0;
  background: var(--bg-tertiary);
  border-radius: 0 0 10px 10px;
  margin-top: -2px;
}

.inline-slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.inline-slider-value {
  font-weight: 600;
  color: var(--text-primary);
}

.mini-slider {
  width: 100%;
  height: 4px;
}

.amnesty-setting {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 0.75rem;
}

.amnesty-setting .setting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.amnesty-setting .setting-header label {
  font-weight: 500;
  color: var(--text-primary);
}

.amnesty-setting .setting-value {
  font-weight: 700;
}

.amnesty-use-block {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(34, 197, 94, 0.04));
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 10px;
  margin-bottom: 0.75rem;
}

.amnesty-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #22c55e;
}

.amnesty-info-text {
  flex: 1;
}

.amnesty-available {
  font-weight: 500;
  color: var(--text-primary);
}

.amnesty-depleted {
  color: var(--text-muted);
}

.btn-amnesty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: #22c55e;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-amnesty:hover {
  background: #16a34a;
}

.amnesty-setting .setting-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.settings-tip {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(124, 58, 237, 0.08);
  border-radius: 8px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.settings-tip svg {
  flex-shrink: 0;
  color: var(--primary-color);
  margin-top: 0.1rem;
}

.toggle-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.toggle-label {
  font-weight: 500;
  color: var(--text-primary);
}

.toggle-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.15rem;
}

.diff-details {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
  line-height: 1.4;
}

.diff-check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #22c55e;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.amnesty-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.amnesty-title {
  font-weight: 600;
  color: var(--text-primary);
}

.amnesty-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.ai-coach-hint {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(168, 85, 247, 0.1));
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: 12px;
}

.hint-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(124, 58, 237, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7c3aed;
  flex-shrink: 0;
}

.ai-coach-hint p {
  flex: 1;
  margin: 0;
  font-size: 0.95rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  filter: brightness(1.1);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-sm {
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: var(--card-bg);
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-settings {
  max-width: 520px;
}

.modal-suggestions {
  max-width: 560px;
  max-height: 85vh;
}

.modal-suggestions .modal-content {
  overflow-y: auto;
  max-height: calc(85vh - 80px);
}

.btn-suggest-habit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.6rem 1rem;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(139, 92, 246, 0.12));
  border: 1px dashed var(--primary-color);
  border-radius: 8px;
  color: var(--primary-color);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0.75rem;
}

.btn-suggest-habit:hover {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(139, 92, 246, 0.2));
  border-style: solid;
}

.amnesty-banner {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.08), rgba(244, 114, 182, 0.12));
  border: 1px solid rgba(236, 72, 153, 0.2);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.amnesty-banner-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.amnesty-banner-icon {
  width: 36px;
  height: 36px;
  background: rgba(236, 72, 153, 0.15);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ec4899;
  flex-shrink: 0;
}

.amnesty-banner-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.amnesty-banner-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.amnesty-banner-subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.amnesty-days-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.amnesty-days-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.amnesty-days {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.amnesty-day-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.5rem 0.75rem;
  background: var(--card-bg);
  border: 1px solid rgba(236, 72, 153, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;
}

.amnesty-day-btn:hover {
  background: rgba(236, 72, 153, 0.1);
  border-color: #ec4899;
  transform: translateY(-1px);
}

.amnesty-day-btn .day-name {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-primary);
}

.amnesty-day-btn .day-missed {
  font-size: 0.7rem;
  color: #ef4444;
  font-weight: 500;
}

.suggestions-intro {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(124, 58, 237, 0.08);
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.suggestions-intro svg {
  color: var(--primary-color);
  flex-shrink: 0;
}

.suggestions-categories {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.suggestion-category {
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--bg-tertiary);
  font-weight: 600;
  font-size: 0.9rem;
}

.category-icon {
  font-size: 1.1rem;
}

.category-habits {
  display: flex;
  flex-direction: column;
}

.suggestion-habit {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
  border-bottom: 1px solid var(--border-color);
}

.suggestion-habit:last-child {
  border-bottom: none;
}

.suggestion-habit:hover {
  background: var(--bg-tertiary);
}

.suggestion-habit .habit-emoji {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.suggestion-habit .habit-details {
  flex: 1;
  min-width: 0;
}

.suggestion-habit .habit-title {
  display: block;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9rem;
  margin-bottom: 0.15rem;
}

.suggestion-habit .habit-desc {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.habit-schedule-badge {
  flex-shrink: 0;
  padding: 0.25rem 0.5rem;
  background: rgba(124, 58, 237, 0.1);
  color: var(--primary-color);
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 500;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.15rem;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  padding: 0.4rem;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: 6px;
}

.modal-content {
  padding: 1.5rem;
}

.modal-content.modal-sections {
  padding: 1rem 1.5rem;
}

.modal-section {
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
}

.modal-section:last-child {
  border-bottom: none;
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.icon-preview {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  flex-shrink: 0;
}

.name-input-wrap {
  flex: 1;
}

.name-input {
  font-size: 1.1rem;
  font-weight: 600;
}

.icon-grid.compact {
  grid-template-columns: repeat(8, 1fr);
  gap: 0.2rem;
}

.icon-grid.compact .icon-option {
  width: 36px;
  height: 36px;
  font-size: 1.2rem;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-secondary);
}

.xp-section {
  background: var(--bg-secondary);
  margin: 0 -1.5rem;
  padding: 1rem 1.5rem;
  border-bottom: none;
}

.xp-inputs {
  display: flex;
  gap: 1rem;
}

.xp-input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.xp-input-group.disabled {
  opacity: 0.5;
}

.xp-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.xp-label.positive {
  color: #22c55e;
}

.xp-label.negative {
  color: #ef4444;
}

.input-with-suffix.compact .form-input {
  padding: 0.5rem 2rem 0.5rem 0.75rem;
}

.xp-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0.5rem 0 0 0;
}

.schedule-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.schedule-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.schedule-btn:hover {
  border-color: var(--primary-color);
}

.schedule-btn.active {
  border-color: var(--primary-color);
  background: rgba(124, 58, 237, 0.1);
  color: var(--primary-color);
}

.schedule-icon {
  font-size: 1rem;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

.modal-footer-right {
  justify-content: flex-end;
}

.spacer {
  flex: 1;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.form-group .optional {
  font-weight: 400;
  color: var(--text-muted);
}

.form-input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-group.half {
  flex: 1;
}

.input-with-suffix {
  position: relative;
}

.input-with-suffix .form-input {
  padding-right: 2.5rem;
}

.input-with-suffix .suffix {
  position: absolute;
  right: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.85rem;
  color: var(--text-muted);
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.25rem;
}

.icon-option {
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  border-radius: 8px;
  font-size: 1.35rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-option:hover {
  background: var(--bg-tertiary, rgba(0,0,0,0.05));
}

.icon-option.selected {
  background: var(--primary-color);
}

.schedule-options {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.schedule-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-primary);
}

.schedule-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.days-selector {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.day-btn {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-primary);
}

.day-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.time-input {
  max-width: 150px;
}

.settings-section {
  margin-bottom: 1.5rem;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.settings-section h4 {
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
}

.settings-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0 0 1rem 0;
}

.difficulty-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.difficulty-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.difficulty-btn:hover {
  border-color: var(--text-muted);
}

.difficulty-btn.active {
  border-color: var(--primary-color);
  background: rgba(124, 58, 237, 0.1);
}

.diff-icon {
  font-size: 1.5rem;
}

.diff-info {
  display: flex;
  flex-direction: column;
}

.diff-name {
  font-weight: 600;
  color: var(--text-primary);
}

.diff-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.diff-details {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
  line-height: 1.4;
}

.diff-check {
  margin-left: auto;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.difficulty-btn.custom.active {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
}

.custom-settings {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.custom-setting {
  margin-bottom: 1.25rem;
}

.custom-setting:last-child {
  margin-bottom: 0;
}

.custom-setting .setting-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.custom-setting .setting-header label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.custom-setting .setting-value {
  font-weight: 600;
  color: var(--primary-color);
  font-size: 0.9rem;
}

.custom-setting .setting-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--border-color);
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.25rem;
  font-size: 0.7rem;
  color: var(--text-muted);
}

.amnesty-info.no-amnesty {
  opacity: 0.6;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
}

.toggle-row:last-child {
  border-bottom: none;
}

.toggle-row.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.toggle-row.disabled .toggle-label,
.toggle-row.disabled .toggle-hint {
  color: var(--text-muted);
}

.toggle-row.disabled .toggle {
  background: var(--bg-tertiary);
  border-color: var(--border-color);
}

.toggles-disabled {
  position: relative;
}

.toggles-disabled::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary);
  opacity: 0.3;
  border-radius: 10px;
  pointer-events: none;
}

.soft-mode-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(156, 163, 175, 0.1);
  border: 1px solid rgba(156, 163, 175, 0.2);
  border-radius: 8px;
  margin-bottom: 1rem;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.soft-mode-notice svg {
  flex-shrink: 0;
  color: var(--text-muted);
}

.toggle-row input[type="checkbox"] {
  display: none;
}

.toggle {
  width: 44px;
  height: 24px;
  background: var(--border-color);
  border-radius: 12px;
  position: relative;
  transition: all 0.2s ease;
}

.toggle::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.toggle-row input:checked + .toggle {
  background: var(--primary-color);
}

.toggle-row input:checked + .toggle::after {
  left: 22px;
}

.amnesty-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: rgba(124, 58, 237, 0.1);
  border-radius: 8px;
  font-size: 0.85rem;
  color: #7c3aed;
}

.amnesty-info svg {
  flex-shrink: 0;
}

.amnesty-info .btn {
  margin-left: auto;
}

.stat-action-hint {
  position: absolute;
  right: 6px;
  top: 6px;
  color: var(--text-muted);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.stat-item.clickable:hover .stat-action-hint {
  opacity: 1;
  color: var(--primary-color);
}

.modal-compact {
  max-width: 420px;
}

.modal-compact .modal-content {
  padding: 1rem 1.25rem;
}

.icon-picker-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
  margin-bottom: 0.75rem;
}

.icon-pick-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  background: var(--bg-secondary);
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.icon-pick-btn:hover {
  background: rgba(124, 58, 237, 0.1);
  transform: scale(1.1);
}

.icon-pick-btn.selected {
  border-color: var(--primary-color);
  background: rgba(124, 58, 237, 0.15);
}

.icon-pick-btn.more-btn {
  background: var(--bg-secondary);
  color: var(--text-muted);
}

.icon-pick-btn.more-btn:hover,
.icon-pick-btn.more-btn.active {
  color: var(--primary-color);
  background: rgba(124, 58, 237, 0.1);
}

.habit-name-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.name-input-full {
  flex: 1;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--card-bg);
  color: var(--text-primary);
}

.name-input-full:focus {
  outline: none;
  border-color: var(--primary-color);
}

.xp-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(124, 58, 237, 0.05));
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: 8px;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.xp-badge:hover {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(124, 58, 237, 0.1));
}

.xp-badge svg {
  color: var(--primary-color);
}

.xp-badge .xp-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--primary-color);
}

.xp-badge .xp-suffix {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
}

.xp-slider-row {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 10px;
}

.slider-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.xp-slider-control {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.xp-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--border-color);
  border-radius: 3px;
  outline: none;
}

.xp-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.xp-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.xp-slider.penalty::-webkit-slider-thumb {
  background: #ef4444;
}

.xp-slider-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--primary-color);
  min-width: 50px;
  text-align: right;
}

.xp-slider-value.penalty {
  color: #ef4444;
}

.optional-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.optional-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  padding: 0.35rem 0;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.optional-btn:hover {
  color: var(--primary-color);
}

.optional-btn.penalty {
  color: var(--text-muted);
}

.optional-btn.penalty:hover {
  color: #ef4444;
}

.penalty-field {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.15);
  border-radius: 10px;
}

.penalty-field .slider-label {
  color: #ef4444;
}

.icon-grid-dropdown {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
  padding: 0.75rem;
  margin-top: 0.5rem;
  background: var(--bg-secondary);
  border-radius: 10px;
  animation: slideDown 0.15s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.schedule-compact {
  margin-top: 1rem;
}

.schedule-presets {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.preset-btn {
  flex: 1;
  padding: 0.5rem 0.5rem;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.preset-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.preset-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.days-row {
  display: flex;
  gap: 4px;
}

.day-btn-compact {
  flex: 1;
  padding: 0.5rem 0;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.day-btn-compact:hover {
  border-color: var(--primary-color);
}

.day-btn-compact.active {
  background: rgba(124, 58, 237, 0.15);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.optional-fields {
  margin-top: 1rem;
}

.description-input {
  resize: none;
  font-size: 0.9rem;
}

.description-spacing {
  margin-top: 0.75rem;
}

.btn-link {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  transition: color 0.2s ease;
}

.btn-link:hover {
  color: var(--primary-color);
}

.modal-footer.compact {
  padding: 0.75rem 1.25rem;
}

.btn-icon-only {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.btn-icon-only.danger:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.modal-mini {
  max-width: 360px;
}

.modal-mini .modal-header h3 {
  font-size: 1rem;
}

.streak-display {
  text-align: center;
  margin-bottom: 1.5rem;
}

.streak-number {
  display: block;
  font-size: 3rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.streak-text {
  font-size: 1rem;
  color: var(--text-secondary);
}

.streak-calendar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 1rem;
}

.streak-week {
  display: flex;
  gap: 4px;
}

.streak-day {
  flex: 1;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: var(--bg-secondary);
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
  transition: all 0.2s ease;
}

.streak-day.success {
  background: #22c55e;
  color: white;
}

.streak-day.partial {
  background: #fbbf24;
  color: white;
}

.streak-day.missed {
  background: var(--bg-secondary);
  color: var(--text-muted);
}

.streak-day.today {
  box-shadow: 0 0 0 2px var(--primary-color);
}

.streak-day.future {
  opacity: 0.4;
}

.streak-tip {
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
}

.today-progress {
  text-align: center;
  margin-bottom: 1.5rem;
}

.progress-circle {
  width: 100px;
  height: 100px;
  margin: 0 auto 0.75rem;
  border-radius: 50%;
  background: conic-gradient(
    var(--primary-color) calc(var(--progress) * 3.6deg),
    var(--bg-secondary) 0
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.progress-circle::before {
  content: '';
  width: 75px;
  height: 75px;
  background: var(--card-bg);
  border-radius: 50%;
  position: absolute;
}

.progress-value {
  position: relative;
  z-index: 1;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.progress-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.today-habits-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.today-habit-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.today-habit-item.clickable {
  cursor: pointer;
}

.today-habit-item.clickable:hover {
  background: var(--bg-tertiary);
}

.today-habit-item.completed {
  background: rgba(34, 197, 94, 0.1);
}

.today-habit-item.completed.clickable:hover {
  background: rgba(34, 197, 94, 0.15);
}

.habit-check-mini {
  flex-shrink: 0;
}

.checkbox-mini {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: var(--bg-primary);
}

.checkbox-mini.checked {
  background: #22c55e;
  border-color: #22c55e;
  color: white;
}

.today-habit-item .habit-icon {
  font-size: 1.25rem;
}

.today-habit-item .habit-name {
  flex: 1;
  font-weight: 500;
  color: var(--text-primary);
}

.habit-xp-reward {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  padding: 0.25rem 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.habit-xp-reward.earned {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.today-habit-item .check-icon {
  color: #22c55e;
}

.xp-summary {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1.5rem;
}

.xp-stat {
  text-align: center;
}

.xp-stat .xp-value {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-color);
}

.xp-stat .xp-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.xp-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 80px;
  padding: 0 0.5rem;
}

.xp-bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  height: 100%;
}

.xp-bar {
  width: 100%;
  max-width: 24px;
  background: var(--bg-secondary);
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
  margin-bottom: 4px;
}

.xp-bar.today {
  background: var(--primary-color);
}

.xp-day-label {
  font-size: 0.65rem;
  color: var(--text-muted);
}

.slider-labels.penalty-labels,
.slider-labels.amnesty-labels {
  display: flex;
  justify-content: space-between;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-content .btn {
    width: 100%;
    justify-content: center;
    padding: 0.875rem 1rem;
  }
  
  .modal-compact {
    margin: 0.5rem;
    max-width: calc(100vw - 1rem);
  }
  
  .modal-compact .modal-content {
    padding: 1rem;
  }
  
  .icon-picker-row {
    gap: 2px;
    justify-content: space-between;
  }
  
  .icon-pick-btn {
    width: 28px;
    height: 28px;
    font-size: 0.9rem;
    border-radius: 6px;
    border-width: 1.5px;
  }
  
  .icon-pick-btn.more-btn {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: -0.5px;
  }
  
  .icon-grid {
    grid-template-columns: repeat(8, 1fr);
  }
  
  .schedule-options {
    flex-direction: column;
  }
  
  .schedule-btn {
    width: 100%;
    text-align: center;
  }
  
  .tabs-navigation {
    width: 100%;
  }
  
  .tabs-navigation .tab-btn {
    flex: 1;
    justify-content: center;
    padding: 0.875rem;
    min-height: 44px;
  }
  
  .habit-schedule {
    display: none;
  }
  
  .week-header {
    display: none;
  }
  
  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
  
  .stat-item {
    padding: 0.625rem;
    min-height: 50px;
  }
  
  .stat-item .settings-cta {
    display: none;
  }
  
  .stat-action-hint {
    display: none;
  }
  
  .stat-item.compact-mode {
    grid-column: span 2;
  }
  
  .amnesty-banner {
    padding: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .amnesty-days {
    gap: 0.35rem;
  }
  
  .amnesty-day-btn {
    padding: 0.4rem 0.5rem;
    min-width: 50px;
  }
  
  .habit-card {
    padding: 0.875rem 1rem;
    gap: 0.75rem;
  }
  
  .habit-actions {
    gap: 0.5rem;
  }
  
  .btn-icon {
    min-width: 40px;
    min-height: 40px;
    padding: 0.625rem;
  }
  
  .btn-icon svg {
    width: 18px;
    height: 18px;
  }
  
  .habit-check-btn {
    min-width: 40px;
    min-height: 40px;
  }
  
  .analytics-grid {
    grid-template-columns: 1fr;
  }
  
  .completion-stats {
    flex-direction: row;
    gap: 1.5rem;
  }
  
  .empty-state h2 {
    font-size: 1.25rem;
  }
  
  .empty-state p {
    font-size: 0.9rem;
  }
}
</style>
