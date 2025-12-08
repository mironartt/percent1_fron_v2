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
        <button class="btn btn-primary desktop-only" @click="openAddModal">
          <Plus :size="18" :stroke-width="1.5" />
          Добавить привычку
        </button>
      </div>
    </header>

    <div class="stats-bar" :class="{ 'has-amnesty': showAmnestyButton }">
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
      <button 
        v-if="showAmnestyButton" 
        class="stat-item amnesty clickable" 
        :class="{ 
          'has-missed': missedDaysForAmnesty.length > 0 && amnestiesRemaining > 0,
          'depleted': amnestiesRemaining === 0
        }"
        @click="openAmnestyModal" 
        title="Амнистия"
      >
        <div class="stat-icon">
          <Heart :size="20" :stroke-width="1.5" />
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ amnestiesRemaining }}/{{ maxAmnesties }}</span>
          <span class="stat-label">амнистия</span>
        </div>
        <div class="stat-action-hint" v-if="missedDaysForAmnesty.length > 0 && amnestiesRemaining > 0">
          <span class="amnesty-badge">{{ missedDaysForAmnesty.length }}</span>
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

    <div class="tabs-navigation" v-if="allHabits.length > 0 || deletedHabits.length > 0">
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

    <div class="week-navigation" v-if="activeTab === 'tracker' && (allHabits.length > 0 || deletedHabits.length > 0)">
      <button class="week-nav-btn" @click="goToPreviousWeek" title="Предыдущая неделя">
        <ChevronLeft :size="20" :stroke-width="2" />
      </button>
      <div class="week-label" :class="{ past: isPastWeek }">
        <span class="week-text">{{ currentWeekLabel }}</span>
        <button 
          v-if="isPastWeek" 
          class="btn-return-current" 
          @click="goToCurrentWeek"
          title="Вернуться к текущей неделе"
        >
          <RotateCcw :size="14" :stroke-width="2" />
          Сейчас
        </button>
      </div>
      <button 
        class="week-nav-btn" 
        @click="goToNextWeek" 
        :disabled="isCurrentWeek"
        title="Следующая неделя"
      >
        <ChevronRight :size="20" :stroke-width="2" />
      </button>
    </div>

    <div class="past-week-notice" v-if="isPastWeek && activeTab === 'tracker'">
      <Lock :size="14" :stroke-width="2" />
      <span>Режим просмотра — редактирование статусов через клик по дню</span>
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
          <button class="card-expand-btn" @click="showCompletionDetailModal = true">
            <ChartBar :size="14" :stroke-width="1.5" />
            Подробнее
          </button>
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
          <button class="card-expand-btn" @click="showCalendarDetailModal = true">
            <CalendarDays :size="14" :stroke-width="1.5" />
            Годовой обзор
          </button>
        </div>

        <div class="analytics-card achievements">
          <div class="card-header">
            <span class="card-title">Достижения</span>
            <span class="card-subtitle">{{ unlockedBadgesCount }}/{{ allHabitBadges.length }}</span>
          </div>
          <div class="badges-list compact">
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
          <button class="card-expand-btn" @click="showAllBadgesModal = true">
            <Award :size="14" :stroke-width="1.5" />
            Все достижения
          </button>
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
                :class="'status-' + getHabitDayStatus(habit, day.date)"
                :title="getStatusTooltip(day.date, getHabitDayStatus(habit, day.date))"
              >
                <Check v-if="getHabitDayStatus(habit, day.date) === 'completed'" :size="10" :stroke-width="2.5" />
                <X v-else-if="getHabitDayStatus(habit, day.date) === 'missed'" :size="10" :stroke-width="2" />
                <CircleAlert v-else-if="getHabitDayStatus(habit, day.date) === 'excused'" :size="10" :stroke-width="2" />
                <Shield v-else-if="getHabitDayStatus(habit, day.date) === 'amnestied'" :size="10" :stroke-width="2" />
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
          :class="{ 
            completed: isHabitCompletedToday(habit), 
            'not-scheduled': !isScheduledForToday(habit),
            'deleted-during-week': habit.wasDeletedThisWeek
          }"
        >
          <div class="habit-row-top" @click="toggleHabitCompletion(habit)">
            <div class="habit-check">
              <div class="checkbox" :class="{ checked: isHabitCompletedToday(habit), disabled: !isScheduledForToday(habit) }">
                <Check v-if="isHabitCompletedToday(habit)" :size="14" :stroke-width="2.5" />
              </div>
            </div>
            <span class="habit-icon">{{ getIconEmoji(habit.icon) }}</span>
            <span class="habit-name">{{ habit.name }}</span>
            <span class="xp-badge positive">+{{ habit.xpReward }} XP</span>
            <button 
              class="btn-edit-habit" 
              @click.stop="editHabit(habit)" 
              title="Редактировать привычку"
            >
              <Pencil :size="14" :stroke-width="1.5" />
            </button>
            <transition name="xp-pop">
              <span v-if="showXpPopup === habit.id" class="xp-popup">+{{ habit.xpReward }} XP</span>
            </transition>
          </div>
          
          <div class="habit-row-bottom">
            <span class="frequency-badge">{{ getFrequencyLabel(habit) }}</span>
            <div class="habit-schedule-inline clickable-schedule" @click.stop>
              <div 
                v-for="day in weekDays" 
                :key="day.key"
                class="schedule-day"
                :class="[
                  getDayStatus(habit, day.date), 
                  { 
                    today: day.isToday,
                    'deleted-after': habit.deletedDuringWeek && day.date > habit.deletedDuringWeek
                  }
                ]"
                :title="`${day.name}: ${getDayStatusLabel(getDayStatus(habit, day.date))}${habit.deletedDuringWeek && day.date > habit.deletedDuringWeek ? ' (привычка удалена)' : ''}`"
                @click="openDayEditModal(habit, day)"
              >
                <span class="day-letter">{{ day.short.charAt(0) }}</span>
              </div>
            </div>
          </div>
          
          <div class="habit-deleted-during-week-badge" v-if="habit.wasDeletedThisWeek">
            <Trash2 :size="12" :stroke-width="1.5" />
            <span>Удалена {{ formatDeletedDate(habit.deletedDuringWeek) }}</span>
          </div>
          <div class="habit-deleted-badge" v-else-if="habit.deletedAt && !habit.wasDeletedThisWeek">
            <Trash2 :size="12" :stroke-width="1.5" />
            <span>Удалена {{ formatDeletedDate(habit.deletedAt) }}</span>
          </div>
        </div>
      </div>

      <div class="deleted-habits-section" v-if="deletedHabits.length > 0 && isCurrentWeek">
        <button 
          class="deleted-habits-toggle" 
          @click="showDeletedHabits = !showDeletedHabits"
        >
          <Archive :size="16" :stroke-width="1.5" />
          <span>Удалённые привычки ({{ deletedHabits.length }})</span>
          <ChevronRight 
            :size="16" 
            :stroke-width="2" 
            class="toggle-icon"
            :class="{ rotated: showDeletedHabits }"
          />
        </button>
        
        <div class="deleted-habits-list" v-if="showDeletedHabits">
          <div 
            v-for="habit in deletedHabits" 
            :key="habit.id"
            class="habit-card deleted"
          >
            <div class="habit-main">
              <div class="habit-icon deleted">
                {{ getIconEmoji(habit.icon) }}
              </div>
              <div class="habit-info">
                <span class="habit-name deleted">{{ habit.name }}</span>
                <span class="deleted-date">Удалена {{ formatDeletedDate(habit.deletedAt) }}</span>
              </div>
            </div>
            
            <div class="habit-actions">
              <button class="btn-icon restore" @click.stop="restoreHabit(habit)" title="Восстановить">
                <RotateCcw :size="16" :stroke-width="1.5" />
              </button>
              <button class="btn-icon danger" @click.stop="permanentlyDeleteHabit(habit)" title="Удалить навсегда">
                <Trash2 :size="16" :stroke-width="1.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="mobile-add-button" v-if="allHabits.length > 0 || deletedHabits.length > 0">
        <button class="btn btn-primary btn-add-habit" @click="openAddModal">
          <Plus :size="18" :stroke-width="1.5" />
          Добавить привычку
        </button>
      </div>

      <div v-else-if="allHabits.length === 0 && deletedHabits.length === 0" class="empty-state">
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

    <Teleport to="body">
      <div v-if="showAmnestyModal" class="modal-overlay" @click.self="showAmnestyModal = false">
        <div class="modal-container modal-mini amnesty-modal">
          <div class="modal-header amnesty-header">
            <h3>
              <Heart :size="20" :stroke-width="1.5" />
              Амнистия
            </h3>
            <button class="btn-close" @click="showAmnestyModal = false">
              <X :size="20" :stroke-width="1.5" />
            </button>
          </div>
          <div class="modal-content">
            <div v-if="habitsStore.amnestyDataLoading" class="amnesty-loading">
              <Loader2 :size="24" :stroke-width="1.5" class="spinning" />
              <span>Загрузка данных...</span>
            </div>
            
            <template v-else>
              <div class="amnesty-status">
                <div class="amnesty-counter">
                  <span class="amnesty-remaining">{{ amnestiesRemaining }}</span>
                  <span class="amnesty-separator">/</span>
                  <span class="amnesty-total">{{ maxAmnesties }}</span>
                </div>
                <span class="amnesty-hint">использований на этой неделе</span>
              </div>

              <div v-if="amnestiedDaysInWeek.length > 0" class="amnesty-days-section amnestied-section">
                <p class="amnesty-instruction amnestied-label">Амнистия уже применена:</p>
                <div class="amnesty-days-grid">
                  <div 
                    v-for="day in amnestiedDaysInWeek" 
                    :key="day.date"
                    class="amnesty-day-card amnestied"
                  >
                    <div class="amnestied-badge">
                      <Heart :size="14" :stroke-width="1.5" />
                    </div>
                    <span class="day-name">{{ day.dayName }}</span>
                    <span class="day-date">{{ formatAmnestyDate(day.date) }}</span>
                    <span class="day-missed">{{ day.missedCount }} {{ pluralizeHabits(day.missedCount) }}</span>
                    <span class="day-penalty saved">+{{ day.penaltyXp }} XP</span>
                    <button 
                      class="btn-cancel-amnesty"
                      @click="cancelAmnestyFromModal(day.date)"
                      title="Отменить амнистию"
                    >
                      <X :size="14" :stroke-width="2" />
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="missedDaysForAmnesty.length > 0" class="amnesty-days-section">
                <p class="amnesty-instruction">Выберите день для прощения:</p>
                <div class="amnesty-days-grid">
                  <button 
                    v-for="day in missedDaysForAmnesty" 
                    :key="day.date"
                    class="amnesty-day-card"
                    :disabled="amnestiesRemaining <= 0"
                    @click="applyAmnestyForDay(day.date)"
                  >
                    <span class="day-name">{{ day.dayName }}</span>
                    <span class="day-date">{{ formatAmnestyDate(day.date) }}</span>
                    <span class="day-missed">{{ day.missedCount }} {{ pluralizeHabits(day.missedCount) }}</span>
                    <span class="day-penalty">-{{ day.penaltyXp }} XP</span>
                  </button>
                </div>
              </div>

              <div v-if="missedDaysForAmnesty.length === 0 && amnestiedDaysInWeek.length === 0" class="amnesty-empty">
                <CheckCircle :size="32" :stroke-width="1.5" />
                <p>Нет пропущенных дней для амнистии</p>
                <span class="amnesty-empty-hint">Пропущенные дни за последнюю неделю появятся здесь</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showDayEditModal && selectedHabitForEdit && selectedDayForEdit" class="modal-overlay" @click.self="closeDayEditModal">
        <div class="modal-container modal-mini day-edit-modal">
          <div class="modal-header">
            <h3>
              <Calendar :size="20" :stroke-width="1.5" />
              {{ selectedDayForEdit.name }}, {{ formatAmnestyDate(selectedDayForEdit.date) }}
            </h3>
            <button class="btn-close" @click="closeDayEditModal">
              <X :size="20" :stroke-width="1.5" />
            </button>
          </div>
          <div class="modal-content">
            <div class="day-edit-habit-info">
              <span class="habit-icon">{{ getIconEmoji(selectedHabitForEdit.icon) }}</span>
              <span class="habit-name">{{ selectedHabitForEdit.name }}</span>
            </div>

            <div class="day-edit-schedule clickable">
              <div 
                v-for="day in weekDays" 
                :key="day.key"
                class="schedule-day-mini"
                :class="[
                  getDayStatus(selectedHabitForEdit, day.date), 
                  { 
                    current: day.date === selectedDayForEdit.date,
                    clickable: isScheduledFromWeekSchedule(selectedHabitForEdit, day.date)
                  }
                ]"
                @click="switchToDay(day)"
                :title="getDayStatusLabel(getDayStatus(selectedHabitForEdit, day.date))"
              >
                <span class="day-letter">{{ day.short.charAt(0) }}</span>
              </div>
            </div>

            <div class="day-edit-stats">
              <div class="stat-item-mini positive">
                <span class="stat-value">+{{ dayEditWeekStats.xpEarned }}</span>
                <span class="stat-label">XP за неделю</span>
              </div>
              <div class="stat-item-mini negative" v-if="dayEditWeekStats.xpPenalty > 0">
                <span class="stat-value">-{{ dayEditWeekStats.xpPenalty }}</span>
                <span class="stat-label">штрафы</span>
              </div>
            </div>

            <div v-if="isFutureDay" class="day-edit-future-notice">
              <Info :size="16" :stroke-width="1.5" />
              <span>Это будущий день. Изменение статуса недоступно, но вы можете добавить заметку заранее.</span>
            </div>

            <div class="day-edit-current-status">
              <div class="status-row">
                <span class="status-label">Текущий статус:</span>
                <span 
                  class="status-value" 
                  :class="isSelectedDayToday && getDayStatus(selectedHabitForEdit, selectedDayForEdit.date) !== 'completed' ? 'today' : getDayStatus(selectedHabitForEdit, selectedDayForEdit.date)"
                >
                  {{ isSelectedDayToday && getDayStatus(selectedHabitForEdit, selectedDayForEdit.date) !== 'completed' 
                     ? 'Сегодня' 
                     : getDayStatusLabel(getDayStatus(selectedHabitForEdit, selectedDayForEdit.date)) }}
                </span>
              </div>
              <div class="xp-row" v-if="selectedDayXpInfo.xpEarned > 0 || selectedDayXpInfo.xpPenalty > 0">
                <span v-if="selectedDayXpInfo.xpEarned > 0" class="xp-badge positive">+{{ selectedDayXpInfo.xpEarned }} XP</span>
                <span v-if="selectedDayXpInfo.xpPenalty > 0" class="xp-badge negative">-{{ selectedDayXpInfo.xpPenalty }} XP</span>
              </div>
            </div>

            <div class="day-edit-notes">
              <label>Заметка о выполнении:</label>
              <textarea 
                v-model="dayEditNote" 
                placeholder="Как прошло выполнение? Что получилось? Что можно улучшить?"
                rows="2"
                @blur="saveNoteOnBlur"
              ></textarea>
              <div class="note-save-row" v-if="dayEditNote">
                <button class="btn-save-note-inline" @click="saveNoteOnBlur" :disabled="noteSaving">
                  <Save :size="14" :stroke-width="2" />
                  {{ noteSaving ? 'Сохраняю...' : 'Сохранить заметку' }}
                </button>
              </div>
            </div>

            <div v-if="showSkipReasonField" class="day-edit-reason">
              <label>Причина пропуска:</label>
              <textarea 
                v-model="dayEditSkipReason" 
                placeholder="Почему не удалось выполнить?"
                rows="2"
                :disabled="isFutureDay"
              ></textarea>
            </div>

            <div v-if="!isFutureDay" class="day-edit-actions" :class="{ 'today-mode': isSelectedDayToday }">
              <button 
                class="btn-status completed"
                :class="{ active: getDayStatus(selectedHabitForEdit, selectedDayForEdit.date) === 'completed' }"
                @click="setDayAsCompleted"
              >
                <Check :size="16" :stroke-width="2" />
                {{ isSelectedDayToday ? (getDayStatus(selectedHabitForEdit, selectedDayForEdit.date) === 'completed' ? 'Выполнено' : 'Отметить выполненным') : 'Выполнено' }}
              </button>
              <button 
                v-if="!isSelectedDayToday"
                class="btn-status missed"
                :class="{ active: getDayStatus(selectedHabitForEdit, selectedDayForEdit.date) === 'missed' }"
                @click="setDayAsMissed"
              >
                <X :size="16" :stroke-width="2" />
                Пропущено
              </button>
              <button 
                v-if="!isSelectedDayToday"
                class="btn-status excused"
                :class="{ active: getDayStatus(selectedHabitForEdit, selectedDayForEdit.date) === 'excused' }"
                @click="setDayAsExcused"
                title="Уважительная причина — без штрафа"
              >
                <Heart :size="16" :stroke-width="1.5" />
                Уваж. пропуск
              </button>
            </div>

            <div v-if="isFutureDay" class="day-edit-actions-locked">
              <button class="btn-save-note" @click="saveNoteAndClose">
                <Check :size="16" :stroke-width="2" />
                Сохранить заметку
              </button>
            </div>

            <div 
              v-if="!isFutureDay && getDayStatus(selectedHabitForEdit, selectedDayForEdit.date) === 'amnestied'" 
              class="day-edit-amnesty-warning"
            >
              <div class="amnesty-info-row">
                <Heart :size="16" :stroke-width="1.5" />
                <span>На этот день применена амнистия</span>
              </div>
              <div class="amnesty-cancel-row">
                <button class="btn-cancel-amnesty" @click="cancelAmnestyForDay">
                  Отменить амнистию
                </button>
                <span class="amnesty-cancel-note">Амнистия будет отменена для всех привычек в этот день</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- All Badges Modal -->
    <Teleport to="body">
      <div v-if="showAllBadgesModal" class="modal-overlay" @click.self="showAllBadgesModal = false">
        <div class="modal detail-modal badges-modal">
          <div class="modal-header">
            <h3>
              <Award :size="20" :stroke-width="1.5" />
              Все достижения
            </h3>
            <span class="modal-subtitle">{{ unlockedBadgesCount }} из {{ allHabitBadges.length }} разблокировано</span>
            <button class="btn-close" @click="showAllBadgesModal = false">
              <X :size="20" :stroke-width="1.5" />
            </button>
          </div>
          <div class="modal-body">
            <div v-for="category in badgeCategories" :key="category.id" class="badge-category">
              <h4 class="category-title">
                <span class="category-icon">{{ category.icon }}</span>
                {{ category.name }}
              </h4>
              <div class="badges-grid">
                <div 
                  v-for="badge in allHabitBadges.filter(b => b.category === category.id)" 
                  :key="badge.id"
                  class="badge-card"
                  :class="{ unlocked: badge.unlocked, locked: !badge.unlocked }"
                >
                  <div class="badge-card-icon">{{ badge.icon }}</div>
                  <div class="badge-card-content">
                    <span class="badge-card-name">{{ badge.name }}</span>
                    <span class="badge-card-desc">{{ badge.description }}</span>
                    <div class="badge-progress" v-if="!badge.unlocked">
                      <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: (badge.progress / badge.target * 100) + '%' }"></div>
                      </div>
                      <span class="progress-text">{{ badge.progress }}/{{ badge.target }}</span>
                    </div>
                    <div class="badge-unlocked-mark" v-else>
                      <Check :size="14" :stroke-width="2.5" />
                      Получено
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Completion Detail Modal -->
    <Teleport to="body">
      <div v-if="showCompletionDetailModal" class="modal-overlay" @click.self="showCompletionDetailModal = false">
        <div class="modal detail-modal completion-modal">
          <div class="modal-header">
            <h3>
              <ChartBar :size="20" :stroke-width="1.5" />
              Статистика выполнения
            </h3>
            <button class="btn-close" @click="showCompletionDetailModal = false">
              <X :size="20" :stroke-width="1.5" />
            </button>
          </div>
          <div class="modal-body">
            <div class="stats-summary">
              <div class="summary-card">
                <span class="summary-value">{{ weekCompletionRate }}%</span>
                <span class="summary-label">За 7 дней</span>
              </div>
              <div class="summary-card">
                <span class="summary-value">{{ monthCompletionRate }}%</span>
                <span class="summary-label">За 30 дней</span>
              </div>
              <div class="summary-card accent">
                <span class="summary-value">{{ habitStreak }}</span>
                <span class="summary-label">Дней подряд</span>
              </div>
            </div>

            <div class="chart-section">
              <h4>Тренд за 8 недель</h4>
              <div class="weekly-chart">
                <div 
                  v-for="(week, index) in weeklyCompletionData" 
                  :key="index" 
                  class="weekly-bar-container"
                >
                  <div class="weekly-bar-wrapper">
                    <div 
                      class="weekly-bar" 
                      :style="{ height: week.rate + '%' }"
                      :class="{ current: index === weeklyCompletionData.length - 1 }"
                    ></div>
                  </div>
                  <span class="weekly-label">{{ week.label }}</span>
                  <span class="weekly-rate">{{ week.rate }}%</span>
                </div>
              </div>
            </div>

            <div class="chart-section">
              <h4>По привычкам (за 30 дней)</h4>
              <div class="habit-distribution">
                <div 
                  v-for="habit in habitCompletionDistribution" 
                  :key="habit.id" 
                  class="habit-dist-item"
                >
                  <div class="habit-dist-header">
                    <span class="habit-dist-icon">{{ getIconEmoji(habit.icon) }}</span>
                    <span class="habit-dist-name">{{ habit.name }}</span>
                    <span class="habit-dist-rate">{{ habit.rate }}%</span>
                  </div>
                  <div class="habit-dist-bar">
                    <div class="habit-dist-fill" :style="{ width: habit.rate + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="best-worst-section">
              <div class="best-card">
                <TrendingUp :size="16" :stroke-width="1.5" />
                <div class="bw-content">
                  <span class="bw-label">Лучшая неделя</span>
                  <span class="bw-value">{{ bestWeekRate }}%</span>
                </div>
              </div>
              <div class="worst-card" v-if="worstHabitName">
                <TrendingUp :size="16" :stroke-width="1.5" class="down" />
                <div class="bw-content">
                  <span class="bw-label">Нужно улучшить</span>
                  <span class="bw-value">{{ worstHabitName }} ({{ worstHabitRate }}%)</span>
                </div>
              </div>
              <div class="worst-card" v-else>
                <TrendingUp :size="16" :stroke-width="1.5" class="down" />
                <div class="bw-content">
                  <span class="bw-label">Нужно улучшить</span>
                  <span class="bw-value">Нет данных</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Calendar Detail Modal -->
    <Teleport to="body">
      <div v-if="showCalendarDetailModal" class="modal-overlay" @click.self="showCalendarDetailModal = false">
        <div class="modal detail-modal calendar-modal">
          <div class="modal-header">
            <h3>
              <CalendarDays :size="20" :stroke-width="1.5" />
              Годовой календарь
            </h3>
            <button class="btn-close" @click="showCalendarDetailModal = false">
              <X :size="20" :stroke-width="1.5" />
            </button>
          </div>
          <div class="modal-body">
            <div class="year-stats-summary">
              <div class="year-stat">
                <span class="year-stat-value">{{ yearTotalCompletions }}</span>
                <span class="year-stat-label">Выполнений за год</span>
              </div>
              <div class="year-stat">
                <span class="year-stat-value">{{ yearActiveDays }}</span>
                <span class="year-stat-label">Активных дней</span>
              </div>
              <div class="year-stat accent" v-if="bestMonthName && bestMonthName !== '-'">
                <span class="year-stat-value">{{ bestMonthName }}</span>
                <span class="year-stat-label">Лучший месяц ({{ bestMonthRate }}%)</span>
              </div>
              <div class="year-stat accent" v-else>
                <span class="year-stat-value">-</span>
                <span class="year-stat-label">Лучший месяц</span>
              </div>
            </div>

            <div class="yearly-heatmap-section">
              <div class="yearly-heatmap">
                <div class="heatmap-months-labels">
                  <span v-for="month in monthLabels" :key="month">{{ month }}</span>
                </div>
                <div class="heatmap-days-labels">
                  <span>Пн</span>
                  <span>Ср</span>
                  <span>Пт</span>
                </div>
                <div class="heatmap-grid-wrapper">
                  <div class="yearly-heatmap-grid">
                    <div 
                      v-for="(week, weekIndex) in yearlyHeatmapData" 
                      :key="weekIndex"
                      class="heatmap-week-column"
                    >
                      <div 
                        v-for="(day, dayIndex) in week" 
                        :key="dayIndex"
                        class="heatmap-day"
                        :class="[day.level, { empty: !day.date }]"
                        :title="day.date ? `${formatCalendarDate(day.date)}: ${day.completed}/${day.total}` : ''"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="heatmap-legend yearly">
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

            <div class="monthly-breakdown">
              <h4>По месяцам</h4>
              <div class="months-grid">
                <div 
                  v-for="month in monthlyStats" 
                  :key="month.name" 
                  class="month-card"
                  :class="{ best: month.isBest, current: month.isCurrent }"
                >
                  <span class="month-name">{{ month.name }}</span>
                  <span class="month-rate">{{ month.rate }}%</span>
                  <div class="month-bar">
                    <div class="month-bar-fill" :style="{ width: month.rate + '%' }"></div>
                  </div>
                  <span class="month-completions">{{ month.completed }}/{{ month.total }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAppStore } from '../stores/app'
import { useXpStore, XP_REWARDS } from '../stores/xp'
import { useToastStore } from '../stores/toast'
import { useHabitsStore } from '../stores/habits'
import { DEBUG_MODE } from '@/config/settings.js'
import { 
  Flame, Plus, Minus, Zap, CheckCircle, Sparkles, Shield, Bot,
  Check, Pencil, X, Trash2, Settings, Gift, Archive, Info, TrendingUp, Calendar, Award,
  Ellipsis, CircleAlert, Lightbulb, Heart, ChevronLeft, ChevronRight, RotateCcw, Lock,
  ChartBar, CalendarDays, Target, Save, Loader2
} from 'lucide-vue-next'

const appStore = useAppStore()
const xpStore = useXpStore()
const toast = useToastStore()
const habitsStore = useHabitsStore()

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
const showAmnestyModal = ref(false)
const showAllBadgesModal = ref(false)
const showCompletionDetailModal = ref(false)
const showCalendarDetailModal = ref(false)
const showDayEditModal = ref(false)
const selectedDayForEdit = ref(null)
const selectedHabitForEdit = ref(null)
const dayEditSkipReason = ref('')
const dayEditNote = ref('')
const weekOffset = ref(0)
const pendingWeekLoad = ref(null)
const showDeletedHabits = ref(false)
const noteSaving = ref(false)
const lastSavedNote = ref('')

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

const MONTH_NAMES_RU = {
  'January': 'Январь',
  'February': 'Февраль',
  'March': 'Март',
  'April': 'Апрель',
  'May': 'Май',
  'June': 'Июнь',
  'July': 'Июль',
  'August': 'Август',
  'September': 'Сентябрь',
  'October': 'Октябрь',
  'November': 'Ноябрь',
  'December': 'Декабрь'
}

function translateMonth(monthName) {
  return MONTH_NAMES_RU[monthName] || monthName
}


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
  difficultyMode: 'balanced',
  penaltiesEnabled: true,
  journalPenalty: false,
  planningPenalty: false,
  journalPenaltyAmount: 10,
  planningPenaltyAmount: 10,
  aiCoachEnabled: true,
  weeklyAmnestyUsed: null,
  customPenaltyPercent: 50,
  weeklyAmnestyCount: 1,
  amnestiesUsedThisWeek: 0,
  amnestyWeekStart: null,
  amnestiedDates: []
})

function formatLocalDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const weekDays = computed(() => {
  const today = new Date()
  const currentDay = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((currentDay + 6) % 7) + (weekOffset.value * 7))
  
  return weekDaysConfig.map((day, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return {
      ...day,
      date: formatLocalDate(date),
      isToday: date.toDateString() === today.toDateString()
    }
  })
})

const isPastWeek = computed(() => weekOffset.value < 0)
const isCurrentWeek = computed(() => weekOffset.value === 0)

const currentWeekLabel = computed(() => {
  if (isCurrentWeek.value) return 'Текущая неделя'
  
  const start = weekDays.value[0]
  const end = weekDays.value[6]
  const startDate = new Date(start.date)
  const endDate = new Date(end.date)
  
  const formatDate = (d) => d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  return `${formatDate(startDate)} — ${formatDate(endDate)}`
})

function goToPreviousWeek() {
  weekOffset.value--
}

function goToNextWeek() {
  if (weekOffset.value < 0) {
    weekOffset.value++
  }
}

function goToCurrentWeek() {
  weekOffset.value = 0
}

const allHabits = computed(() => {
  const weekStartDate = weekDays.value[0]?.date
  const weekEndDate = weekDays.value[6]?.date
  
  const storeHabits = habitsStore.habits
  const habitsSource = storeHabits.length > 0 ? storeHabits : appStore.habits
  
  if (DEBUG_MODE) {
    console.log('[Habits.vue] allHabits computed - habitsStore.habits:', storeHabits.length, storeHabits)
    console.log('[Habits.vue] allHabits computed - using source:', storeHabits.length > 0 ? 'habitsStore' : 'appStore')
  }
  
  return habitsSource
    .filter(h => !h.archived && !h.is_archived)
    .filter(h => {
      const deletedDate = h.deletedAt || h.date_deleted
      if (!deletedDate) return true
      if (isPastWeek.value) {
        const deleted = deletedDate.split('T')[0]
        return deleted > weekStartDate
      }
      return false
    })
    .map(habit => {
      let wasDeletedThisWeek = false
      let deletedDuringWeek = null
      const deletedDate = habit.deletedAt || habit.date_deleted
      
      if (deletedDate && isPastWeek.value) {
        const deleted = deletedDate.split('T')[0]
        if (deleted >= weekStartDate && deleted <= weekEndDate) {
          wasDeletedThisWeek = true
          deletedDuringWeek = deleted
        }
      }
      
      return {
        ...habit,
        id: habit.id || habit.habit_id,
        habit_id: habit.habit_id || habit.id,
        frequencyType: habit.frequencyType || habit.frequency_type || 'daily',
        frequency_type: habit.frequency_type || habit.frequencyType || 'daily',
        scheduleDays: habit.scheduleDays || habit.schedule_days || [1, 2, 3, 4, 5, 6, 0],
        schedule_days: habit.schedule_days || habit.scheduleDays || [1, 2, 3, 4, 5, 6, 0],
        xpPenalty: habit.xpPenalty || habit.xp_penalty || 0,
        xp_penalty: habit.xp_penalty || habit.xpPenalty || 0,
        xpReward: habit.xpReward || habit.xp_reward || 5,
        xp_reward: habit.xp_reward || habit.xpReward || 5,
        wasDeletedThisWeek,
        deletedDuringWeek
      }
    })
})

const deletedHabits = computed(() => {
  const habitsSource = habitsStore.habits.length > 0 ? habitsStore.habits : appStore.habits
  
  return habitsSource
    .filter(h => !h.archived && !h.is_archived && (h.deletedAt || h.date_deleted))
    .map(habit => ({
      ...habit,
      id: habit.id || habit.habit_id,
      habit_id: habit.habit_id || habit.id,
      frequencyType: habit.frequencyType || habit.frequency_type || 'daily',
      frequency_type: habit.frequency_type || habit.frequencyType || 'daily',
      scheduleDays: habit.scheduleDays || habit.schedule_days || [1, 2, 3, 4, 5, 6, 0],
      schedule_days: habit.schedule_days || habit.scheduleDays || [1, 2, 3, 4, 5, 6, 0],
      xpPenalty: habit.xpPenalty || habit.xp_penalty || 0,
      xp_penalty: habit.xp_penalty || habit.xpPenalty || 0
    }))
})

const habitStreak = computed(() => {
  return habitsStore.statsPanel?.streak ?? appStore.habitStreak
})
const scheduledToday = computed(() => {
  const today = new Date().getDay()
  return allHabits.value.filter(h => isScheduledForDay(h, today))
})

const todayCompleted = computed(() => {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  
  if (habitsStore.habits.length > 0) {
    return habitsStore.habits.filter(habit => {
      if (habit.date_deleted) return false
      const todaySchedule = habit.week_schedule?.find(s => s.date === todayStr)
      if (todaySchedule && todaySchedule.is_scheduled !== false) {
        return todaySchedule.status === 'completed'
      }
      return false
    }).length
  }
  
  const completedIds = appStore.habitLog[todayStr] || []
  return scheduledToday.value.filter(h => completedIds.includes(h.id)).length
})

const todayTotal = computed(() => scheduledToday.value.length)

const todayProgressFromStore = computed(() => {
  return habitsStore.statsPanel?.today_progress ?? null
})

const weekXpFromHabits = computed(() => {
  if (habitsStore.statsPanel?.week_xp !== undefined) {
    return habitsStore.statsPanel.week_xp
  }
  
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
  if (weekOffset.value !== 0) {
    return false
  }
  
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  
  if (habit.week_schedule) {
    const todaySchedule = habit.week_schedule.find(s => s.date === todayStr)
    if (todaySchedule) {
      return todaySchedule.status === 'completed'
    }
  }
  
  if (habit.completions) {
    const todayCompletion = habit.completions.find(c => c.date === todayStr)
    if (todayCompletion) {
      return todayCompletion.status === 'completed'
    }
  }
  
  const completedIds = appStore.habitLog[todayStr] || []
  return completedIds.includes(habit.id)
}

const difficultyLabel = computed(() => {
  const labels = { soft: 'Мягкий', balanced: 'Баланс', hardcore: 'Хардкор', custom: 'Свой' }
  return labels[gameSettings.value.difficultyMode]
})

const isSoftMode = computed(() => gameSettings.value.difficultyMode === 'soft')

const showAmnestyButton = computed(() => {
  return maxAmnesties.value > 0
})

const currentPenaltyPercent = computed(() => {
  const mode = gameSettings.value.difficultyMode
  if (mode === 'soft') return 0
  if (mode === 'balanced') return 50
  if (mode === 'hardcore') return 100
  return gameSettings.value.customPenaltyPercent
})

const amnestyDataWasLoaded = computed(() => {
  return habitsStore.amnestyData.week_start !== null
})

const maxAmnesties = computed(() => {
  if (amnestyDataWasLoaded.value && habitsStore.amnestyData.amnesty_available?.total !== undefined) {
    return habitsStore.amnestyData.amnesty_available.total
  }
  const mode = gameSettings.value.difficultyMode
  if (mode === 'soft') return 0
  return gameSettings.value.weeklyAmnestyCount || 0
})

const amnestiesRemaining = computed(() => {
  if (amnestyDataWasLoaded.value && habitsStore.amnestyData.amnesty_available?.remaining !== undefined) {
    return habitsStore.amnestyData.amnesty_available.remaining
  }
  
  if (habitsStore.statsPanel?.amnesty_remaining !== undefined) {
    return habitsStore.statsPanel.amnesty_remaining
  }
  
  const now = new Date()
  const weekStart = getWeekStart(now)
  
  if (!gameSettings.value.amnestyWeekStart || 
      new Date(gameSettings.value.amnestyWeekStart).getTime() !== weekStart.getTime()) {
    return maxAmnesties.value
  }
  
  return Math.max(0, maxAmnesties.value - gameSettings.value.amnestiesUsedThisWeek)
})

async function openAmnestyModal() {
  showAmnestyModal.value = true
  await habitsStore.loadAmnestyAvailableDays()
}

function isScheduledForDay(habit, dayKey) {
  const freqType = habit.frequencyType || habit.frequency_type
  const schedDays = habit.scheduleDays || habit.schedule_days
  
  if (freqType === 'daily') return true
  if (freqType === 'weekdays') return dayKey >= 1 && dayKey <= 5
  if (freqType === 'weekends') return dayKey === 0 || dayKey === 6
  return schedDays?.includes(dayKey)
}

const missedDaysForAmnesty = computed(() => {
  const apiDays = habitsStore.amnestyData.days || []
  if (apiDays.length > 0) {
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    return apiDays
      .filter(day => day.can_apply && !day.is_amnestied && day.missed_habits_count > 0)
      .map(day => {
        const date = new Date(day.date)
        const dayOfWeek = date.getDay()
        return {
          date: day.date,
          dayName: dayNames[dayOfWeek] + ', ' + date.getDate(),
          missedCount: day.missed_habits_count,
          penaltyXp: day.total_penalty
        }
      })
  }
  
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

const amnestiedDaysInWeek = computed(() => {
  const apiDays = habitsStore.amnestyData.days || []
  if (apiDays.length > 0) {
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    return apiDays
      .filter(day => day.is_amnestied)
      .map(day => {
        const date = new Date(day.date)
        const dayOfWeek = date.getDay()
        return {
          date: day.date,
          dayName: dayNames[dayOfWeek] + ', ' + date.getDate(),
          missedCount: day.missed_habits_count,
          penaltyXp: day.total_penalty
        }
      })
  }
  
  const amnestiedDates = gameSettings.value.amnestiedDates || []
  if (amnestiedDates.length === 0) return []
  
  const days = []
  const today = new Date()
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const dayOfWeek = date.getDay()
    
    if (amnestiedDates.includes(dateStr)) {
      const scheduledForDay = allHabits.value.filter(h => isScheduledForDay(h, dayOfWeek))
      const completedIds = appStore.habitLog[dateStr] || []
      const missedHabits = scheduledForDay.filter(h => !completedIds.includes(h.id))
      
      const penaltyXp = missedHabits.reduce((sum, h) => {
        const baseXp = h.xpReward || 5
        const penaltyMultiplier = (h.penaltyPercent ?? currentPenaltyPercent.value) / 100
        return sum + Math.round(baseXp * penaltyMultiplier)
      }, 0)
      
      days.push({
        date: dateStr,
        dayName: dayNames[dayOfWeek] + ', ' + date.getDate(),
        missedCount: missedHabits.length,
        penaltyXp
      })
    }
  }
  
  return days
})

async function cancelAmnestyFromModal(dateStr) {
  const dayInfo = amnestiedDaysInWeek.value.find(d => d.date === dateStr)
  const xpPenalty = dayInfo?.penaltyXp || 0
  
  const result = await habitsStore.revokeAmnesty(dateStr)
  
  if (result.success) {
    toast.showToast({ type: 'info', title: `Амнистия отменена. Штраф -${xpPenalty} XP` })
    await habitsStore.loadAmnestyAvailableDays()
    habitsStore.loadStatsPanel()
  } else {
    toast.showToast({ type: 'error', title: 'Ошибка отмены амнистии' })
  }
}

async function applyAmnestyForDay(dateStr) {
  if (amnestiesRemaining.value <= 0) {
    toast.showToast({ type: 'warning', title: 'Нет доступных амнистий' })
    return
  }
  
  const dayInfo = missedDaysForAmnesty.value.find(d => d.date === dateStr)
  const xpRecovered = dayInfo?.penaltyXp || 0
  
  const result = await habitsStore.applyAmnesty(dateStr)
  
  if (result.success) {
    const actualXp = result.xpRestored || xpRecovered
    toast.showToast({ type: 'success', title: `Амнистия применена! Возвращено ${actualXp} XP` })
    await habitsStore.loadAmnestyAvailableDays()
    habitsStore.loadStatsPanel()
  } else {
    toast.showToast({ type: 'error', title: 'Ошибка применения амнистии' })
  }
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
  if (habitsStore.analytics?.completion_rate_7 !== undefined) {
    return habitsStore.analytics.completion_rate_7
  }
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
  if (habitsStore.analytics?.completion_rate_30 !== undefined) {
    return habitsStore.analytics.completion_rate_30
  }
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
  const analyticsData = habitsStore.analytics?.habits_data
  if (analyticsData) {
    const habitData = analyticsData.find(h => h.habit_id === habit.backendId)
    if (habitData?.streak !== undefined) {
      return habitData.streak
    }
  }
  
  const backendHabit = habitsStore.habits.find(h => h.habit_id === habit.backendId)
  const completions = backendHabit?.completions || []
  
  let streak = 0
  const today = new Date()
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const dayOfWeek = date.getDay()
    
    if (!isScheduledForDay(habit, dayOfWeek)) continue
    
    const completion = completions.find(c => c.date === dateStr)
    if (completion?.status === 'completed') {
      streak++
    } else if (appStore.habitLog[dateStr]?.includes(habit.id)) {
      streak++
    } else {
      break
    }
  }
  return streak
}

function getHabitCompletionRate(habit, days) {
  const analyticsData = habitsStore.analytics?.habits_data
  if (analyticsData) {
    const habitData = analyticsData.find(h => h.habit_id === habit.backendId)
    if (habitData) {
      if (days === 7 && habitData.completion_rate_7 !== undefined) {
        return habitData.completion_rate_7
      }
      if (days === 30 && habitData.completion_rate_30 !== undefined) {
        return habitData.completion_rate_30
      }
    }
  }
  
  const backendHabit = habitsStore.habits.find(h => h.habit_id === habit.backendId)
  const completions = backendHabit?.completions || []
  
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
      const completion = completions.find(c => c.date === dateStr)
      if (completion?.status === 'completed') {
        completed++
      } else if (appStore.habitLog[dateStr]?.includes(habit.id)) {
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

const allHabitBadges = computed(() => {
  const streak = habitStreak.value
  const weekRate = weekCompletionRate.value
  const monthRate = monthCompletionRate.value
  const totalCompletions = Object.values(appStore.habitLog).flat().length
  const habitsCount = allHabits.value.length
  
  const badges = [
    // Серии (стрики)
    { id: 'streak3', icon: '🌱', name: 'Первые ростки', description: '3 дня подряд', unlocked: streak >= 3, category: 'streak', progress: Math.min(streak, 3), target: 3 },
    { id: 'streak7', icon: '🔥', name: 'Неделя огня', description: '7 дней подряд', unlocked: streak >= 7, category: 'streak', progress: Math.min(streak, 7), target: 7 },
    { id: 'streak14', icon: '⚡', name: 'Две недели силы', description: '14 дней дисциплины', unlocked: streak >= 14, category: 'streak', progress: Math.min(streak, 14), target: 14 },
    { id: 'streak21', icon: '🧠', name: 'Привычка закреплена', description: '21 день — новая привычка', unlocked: streak >= 21, category: 'streak', progress: Math.min(streak, 21), target: 21 },
    { id: 'streak30', icon: '🏆', name: 'Месяц стабильности', description: '30 дней без пропусков', unlocked: streak >= 30, category: 'streak', progress: Math.min(streak, 30), target: 30 },
    { id: 'streak50', icon: '👑', name: 'Железная воля', description: '50 дней подряд', unlocked: streak >= 50, category: 'streak', progress: Math.min(streak, 50), target: 50 },
    { id: 'streak100', icon: '💎', name: 'Легенда', description: '100 дней без пропусков', unlocked: streak >= 100, category: 'streak', progress: Math.min(streak, 100), target: 100 },
    
    // Выполнение
    { id: 'perfectWeek', icon: '✨', name: 'Идеальная неделя', description: '100% за 7 дней', unlocked: weekRate === 100, category: 'completion', progress: weekRate, target: 100 },
    { id: 'week80', icon: '🎯', name: 'Почти идеал', description: '80%+ за неделю', unlocked: weekRate >= 80, category: 'completion', progress: weekRate, target: 80 },
    { id: 'month80', icon: '📈', name: 'Стабильный месяц', description: '80%+ за 30 дней', unlocked: monthRate >= 80, category: 'completion', progress: monthRate, target: 80 },
    { id: 'perfectMonth', icon: '🌟', name: 'Идеальный месяц', description: '100% за 30 дней', unlocked: monthRate === 100, category: 'completion', progress: monthRate, target: 100 },
    
    // Объём
    { id: 'first', icon: '🚀', name: 'Первый шаг', description: 'Первое выполнение', unlocked: totalCompletions >= 1, category: 'volume', progress: Math.min(totalCompletions, 1), target: 1 },
    { id: 'completions10', icon: '🎖️', name: 'Десятка', description: '10 выполнений', unlocked: totalCompletions >= 10, category: 'volume', progress: Math.min(totalCompletions, 10), target: 10 },
    { id: 'completions50', icon: '🏅', name: 'Полсотни', description: '50 выполнений', unlocked: totalCompletions >= 50, category: 'volume', progress: Math.min(totalCompletions, 50), target: 50 },
    { id: 'completions100', icon: '🥇', name: 'Сотня', description: '100 выполнений', unlocked: totalCompletions >= 100, category: 'volume', progress: Math.min(totalCompletions, 100), target: 100 },
    { id: 'completions500', icon: '🏆', name: 'Мастер привычек', description: '500 выполнений', unlocked: totalCompletions >= 500, category: 'volume', progress: Math.min(totalCompletions, 500), target: 500 },
    
    // Разнообразие
    { id: 'habits3', icon: '🌈', name: 'Разнообразие', description: '3 активных привычки', unlocked: habitsCount >= 3, category: 'variety', progress: Math.min(habitsCount, 3), target: 3 },
    { id: 'habits5', icon: '🎨', name: 'Богатый арсенал', description: '5 активных привычек', unlocked: habitsCount >= 5, category: 'variety', progress: Math.min(habitsCount, 5), target: 5 },
    { id: 'habits10', icon: '🌍', name: 'Всесторонний рост', description: '10 активных привычек', unlocked: habitsCount >= 10, category: 'variety', progress: Math.min(habitsCount, 10), target: 10 },
  ]
  
  return badges
})

const habitBadges = computed(() => {
  // Для карточки показываем только первые 4 (2 строки по 2)
  return allHabitBadges.value.slice(0, 4)
})

const unlockedBadgesCount = computed(() => {
  return allHabitBadges.value.filter(b => b.unlocked).length
})

const badgeCategories = computed(() => {
  return [
    { id: 'streak', name: 'Серии', icon: '🔥' },
    { id: 'completion', name: 'Выполнение', icon: '✨' },
    { id: 'volume', name: 'Объём', icon: '🏅' },
    { id: 'variety', name: 'Разнообразие', icon: '🌈' }
  ]
})

const weeklyLabels = ['7н', '6н', '5н', '4н', '3н', '2н', '1н', 'Сейчас']

const weeklyCompletionData = computed(() => {
  if (habitsStore.analytics?.weekly_trend && habitsStore.analytics.weekly_trend.length === 8) {
    return habitsStore.analytics.weekly_trend.map((rate, index) => ({
      label: weeklyLabels[index],
      rate: rate || 0,
      completed: 0,
      total: 0
    }))
  }
  
  const weeks = []
  const today = new Date()
  
  for (let w = 7; w >= 0; w--) {
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - (today.getDay() || 7) + 1 - (w * 7))
    
    let completed = 0
    let total = 0
    
    for (let d = 0; d < 7; d++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + d)
      const dateStr = date.toISOString().split('T')[0]
      
      if (date > today) continue
      
      allHabits.value.forEach(habit => {
        if (isScheduledForDay(habit, date.getDay())) {
          total++
          if (appStore.habitLog[dateStr]?.includes(habit.id)) {
            completed++
          }
        }
      })
    }
    
    weeks.push({
      label: weeklyLabels[7 - w],
      rate: total > 0 ? Math.round(completed / total * 100) : 0,
      completed,
      total
    })
  }
  
  return weeks
})

const bestWeekRate = computed(() => {
  if (habitsStore.analytics?.best_week_rate !== undefined) {
    return habitsStore.analytics.best_week_rate
  }
  return Math.max(...weeklyCompletionData.value.map(w => w.rate), 0)
})

const worstHabitName = computed(() => {
  if (habitsStore.analytics?.worst_habit_name !== undefined) {
    return habitsStore.analytics.worst_habit_name
  }
  const distribution = habitCompletionDistribution.value
  if (distribution.length === 0) return null
  const worst = distribution[distribution.length - 1]
  return worst?.name || null
})

const worstHabitRate = computed(() => {
  if (habitsStore.analytics?.worst_habit_rate !== undefined) {
    return habitsStore.analytics.worst_habit_rate
  }
  const distribution = habitCompletionDistribution.value
  if (distribution.length === 0) return 0
  const worst = distribution[distribution.length - 1]
  return worst?.rate || 0
})

const habitCompletionDistribution = computed(() => {
  if (habitsStore.analytics?.habits_data && habitsStore.analytics.habits_data.length > 0) {
    return habitsStore.analytics.habits_data.map(habit => ({
      id: habit.habit_id,
      name: habit.name,
      icon: habit.icon,
      rate: habit.completion_rate_30 || 0,
      streak: habit.streak || 0,
      completed: habit.total_completions || 0,
      total: 0
    })).sort((a, b) => b.rate - a.rate)
  }
  
  const today = new Date()
  
  return allHabits.value.map(habit => {
    let completed = 0
    let total = 0
    
    for (let d = 0; d < 30; d++) {
      const date = new Date(today)
      date.setDate(today.getDate() - d)
      const dateStr = date.toISOString().split('T')[0]
      
      if (isScheduledForDay(habit, date.getDay())) {
        total++
        if (appStore.habitLog[dateStr]?.includes(habit.id)) {
          completed++
        }
      }
    }
    
    return {
      id: habit.id,
      name: habit.name,
      icon: habit.icon,
      rate: total > 0 ? Math.round(completed / total * 100) : 0,
      completed,
      total
    }
  }).sort((a, b) => b.rate - a.rate)
})

function getHeatmapLevel(count) {
  if (count === 0) return 'level-0'
  if (count === 1) return 'level-1'
  if (count === 2) return 'level-2'
  if (count <= 4) return 'level-3'
  return 'level-3'
}

const yearlyHeatmapData = computed(() => {
  const calendarData = habitsStore.analytics?.calendar_data
  const weeks = []
  const today = new Date()
  const startDate = new Date(today)
  startDate.setFullYear(today.getFullYear() - 1)
  startDate.setDate(startDate.getDate() - startDate.getDay() + 1)
  
  let currentDate = new Date(startDate)
  
  while (currentDate <= today) {
    const week = []
    
    for (let d = 0; d < 7; d++) {
      const date = new Date(currentDate)
      date.setDate(currentDate.getDate() + d)
      
      if (date > today) {
        week.push({ date: null, completed: 0, total: 0, level: 'level-0' })
        continue
      }
      
      const dateStr = date.toISOString().split('T')[0]
      
      if (calendarData && calendarData[dateStr] !== undefined) {
        const count = calendarData[dateStr]
        week.push({ 
          date: dateStr, 
          completed: count, 
          total: count, 
          level: getHeatmapLevel(count) 
        })
      } else {
        let completed = 0
        let total = 0
        
        allHabits.value.forEach(habit => {
          if (isScheduledForDay(habit, date.getDay())) {
            total++
            if (appStore.habitLog[dateStr]?.includes(habit.id)) {
              completed++
            }
          }
        })
        
        const rate = total > 0 ? completed / total : 0
        let level = 'level-0'
        if (rate > 0 && rate < 0.33) level = 'level-1'
        else if (rate >= 0.33 && rate < 0.66) level = 'level-2'
        else if (rate >= 0.66) level = 'level-3'
        
        week.push({ date: dateStr, completed, total, level })
      }
    }
    
    weeks.push(week)
    currentDate.setDate(currentDate.getDate() + 7)
  }
  
  return weeks
})

const monthLabels = computed(() => {
  const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
  const today = new Date()
  const result = []
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(today)
    date.setMonth(today.getMonth() - i)
    result.push(months[date.getMonth()])
  }
  
  return result
})

const yearTotalCompletions = computed(() => {
  if (habitsStore.analytics?.year_completions !== undefined) {
    return habitsStore.analytics.year_completions
  }
  return Object.values(appStore.habitLog).flat().length
})

const yearActiveDays = computed(() => {
  if (habitsStore.analytics?.year_active_days !== undefined) {
    return habitsStore.analytics.year_active_days
  }
  return Object.keys(appStore.habitLog).filter(date => appStore.habitLog[date].length > 0).length
})

const bestMonthRate = computed(() => {
  if (habitsStore.analytics?.best_month_rate !== undefined) {
    return habitsStore.analytics.best_month_rate
  }
  const best = monthlyStats.value.find(m => m.isBest)
  return best ? best.rate : 0
})

const monthlyStats = computed(() => {
  if (habitsStore.analytics?.monthly_stats && habitsStore.analytics.monthly_stats.length > 0) {
    const apiStats = habitsStore.analytics.monthly_stats
    const bestRate = Math.max(...apiStats.map(m => m.completion_rate))
    const currentMonth = new Date().getMonth() + 1
    
    return apiStats.map(month => ({
      name: translateMonth(month.month_name),
      rate: month.completion_rate || 0,
      completed: month.completed || 0,
      total: month.scheduled || 0,
      isCurrent: month.month === currentMonth,
      isBest: month.completion_rate === bestRate && month.scheduled > 0
    }))
  }
  
  const today = new Date()
  const months = []
  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
  
  for (let m = 11; m >= 0; m--) {
    const monthDate = new Date(today)
    monthDate.setMonth(today.getMonth() - m)
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()
    
    let completed = 0
    let total = 0
    
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      if (date > today) continue
      
      const dateStr = date.toISOString().split('T')[0]
      
      allHabits.value.forEach(habit => {
        if (isScheduledForDay(habit, date.getDay())) {
          total++
          if (appStore.habitLog[dateStr]?.includes(habit.id)) {
            completed++
          }
        }
      })
    }
    
    months.push({
      name: monthNames[month],
      rate: total > 0 ? Math.round(completed / total * 100) : 0,
      completed,
      total,
      isCurrent: m === 0,
      isBest: false
    })
  }
  
  const maxRate = Math.max(...months.filter(m => m.total > 0).map(m => m.rate))
  months.forEach(m => {
    if (m.rate === maxRate && m.total > 0) m.isBest = true
  })
  
  return months
})

const bestMonthName = computed(() => {
  if (habitsStore.analytics?.best_month_name) {
    return translateMonth(habitsStore.analytics.best_month_name)
  }
  const best = monthlyStats.value.find(m => m.isBest)
  return best ? best.name : '-'
})

function isScheduledForToday(habit) {
  if (weekOffset.value !== 0) {
    return true
  }
  const today = new Date().getDay()
  return isScheduledForDay(habit, today)
}

function isCompletedOnDay(habit, dateStr) {
  const backendHabit = habitsStore.habits.find(h => h.habit_id === habit.backendId)
  if (backendHabit?.completions) {
    const completion = backendHabit.completions.find(c => c.date === dateStr)
    if (completion?.status === 'completed') return true
  }
  return appStore.habitLog[dateStr]?.includes(habit.id)
}

function getHabitDayStatus(habit, dateStr) {
  const habitBackendId = String(habit.habit_id || habit.backendId || habit.id)
  
  const analyticsData = habitsStore.analytics?.habits_data
  if (analyticsData) {
    const habitData = analyticsData.find(h => String(h.habit_id) === habitBackendId)
    if (habitData?.completion_history) {
      const dayData = habitData.completion_history.find(d => d.date === dateStr)
      if (dayData) {
        return dayData.status
      }
    }
  }
  
  const backendHabit = habitsStore.habits.find(h => 
    String(h.habit_id) === habitBackendId || String(h.id) === habitBackendId
  )
  if (backendHabit?.completions) {
    const completion = backendHabit.completions.find(c => c.date === dateStr)
    if (completion) {
      return completion.status
    }
  }
  
  if (appStore.habitLog[dateStr]?.includes(habit.id)) {
    return 'completed'
  }
  
  if (isScheduledFromWeekSchedule(habit, dateStr)) {
    return 'missed'
  }
  
  return 'not_scheduled'
}

function getStatusLabel(status) {
  const labels = {
    'completed': 'Выполнена',
    'missed': 'Пропущена',
    'excused': 'Уважительная причина',
    'amnestied': 'Амнистия',
    'not_scheduled': 'Не запланирована'
  }
  return labels[status] || status
}

function getStatusTooltip(dateStr, status) {
  return `${formatCalendarDate(dateStr)}: ${getStatusLabel(status)}`
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

function pluralizeHabits(n) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'привычка'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'привычки'
  return 'привычек'
}

function formatAmnestyDate(dateStr) {
  const date = new Date(dateStr)
  const day = date.getDate()
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  return `${day} ${months[date.getMonth()]}`
}

const skipReasons = ref(JSON.parse(localStorage.getItem('habitSkipReasons') || '{}'))
const excusedSkips = ref(JSON.parse(localStorage.getItem('habitExcusedSkips') || '{}'))
const habitNotes = ref(JSON.parse(localStorage.getItem('habitNotes') || '{}'))

function saveSkipData() {
  localStorage.setItem('habitSkipReasons', JSON.stringify(skipReasons.value))
  localStorage.setItem('habitExcusedSkips', JSON.stringify(excusedSkips.value))
  localStorage.setItem('habitNotes', JSON.stringify(habitNotes.value))
}

function getDayStatus(habit, dateStr) {
  const daySchedule = habit.week_schedule?.find(s => s.date === dateStr)
  if (daySchedule) {
    if (daySchedule.is_scheduled === false) {
      return 'not-scheduled'
    }
    const status = daySchedule.status
    if (status === 'pending') return 'today'
    if (status === 'not-scheduled') return 'not-scheduled'
    return status
  }
  
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dayOfWeek = date.getDay()
  
  const isScheduled = isScheduledForDay(habit, dayOfWeek)
  const isCompleted = isCompletedOnDay(habit, dateStr)
  const isAmnestied = gameSettings.value.amnestiedDates?.includes(dateStr)
  const isExcused = excusedSkips.value[dateStr]?.[habit.id]
  const isFuture = date > today
  const isToday = date.toDateString() === today.toDateString()
  const isPast = date < today && !isToday
  
  if (!isScheduled) return 'not-scheduled'
  if (isFuture) return 'future'
  if (isCompleted) return 'completed'
  if (isAmnestied) return 'amnestied'
  if (isExcused) return 'excused'
  if (isPast) return 'missed'
  if (isToday) return 'today'
  return 'scheduled'
}

function getDayScheduleData(habit, dateStr) {
  return habit.week_schedule?.find(s => s.date === dateStr) || null
}

function isScheduledFromWeekSchedule(habit, dateStr) {
  const daySchedule = habit.week_schedule?.find(s => s.date === dateStr)
  if (daySchedule !== undefined && daySchedule.is_scheduled !== undefined) {
    return daySchedule.is_scheduled === true
  }
  return isScheduledForDay(habit, new Date(dateStr).getDay())
}

function getDayStatusLabel(status) {
  const labels = {
    'not-scheduled': 'Не запланировано',
    'future': 'Запланировано',
    'completed': 'Выполнено',
    'amnestied': 'Амнистия',
    'excused': 'Уважительный пропуск',
    'missed': 'Пропущено',
    'today': 'Сегодня',
    'scheduled': 'Запланировано'
  }
  return labels[status] || status
}

const isFutureDay = computed(() => {
  if (!selectedDayForEdit.value) return false
  const selectedDateStr = selectedDayForEdit.value.date
  const todayStr = new Date().toISOString().split('T')[0]
  return selectedDateStr > todayStr
})

const isSelectedDayToday = computed(() => {
  if (!selectedDayForEdit.value) return false
  const selectedDateStr = selectedDayForEdit.value.date
  const todayStr = new Date().toISOString().split('T')[0]
  return selectedDateStr === todayStr
})

const selectedDayXpInfo = computed(() => {
  if (!selectedHabitForEdit.value || !selectedDayForEdit.value) {
    return { xpEarned: 0, xpPenalty: 0 }
  }
  const daySchedule = getDayScheduleData(selectedHabitForEdit.value, selectedDayForEdit.value.date)
  return {
    xpEarned: daySchedule?.xp_earned || 0,
    xpPenalty: daySchedule?.xp_penalty || 0
  }
})

const showSkipReasonField = computed(() => {
  if (!selectedHabitForEdit.value || !selectedDayForEdit.value) return false
  const status = getDayStatus(selectedHabitForEdit.value, selectedDayForEdit.value.date)
  return status === 'missed' || status === 'excused'
})

function openDayEditModal(habit, day) {
  if (!isScheduledFromWeekSchedule(habit, day.date)) {
    toast.showToast({ type: 'info', title: 'Привычка не запланирована на этот день' })
    return
  }
  
  selectedHabitForEdit.value = habit
  selectedDayForEdit.value = day
  
  const daySchedule = getDayScheduleData(habit, day.date)
  dayEditSkipReason.value = daySchedule?.excuse_reason || skipReasons.value[day.date]?.[habit.id] || ''
  dayEditNote.value = daySchedule?.note || habitNotes.value[day.date]?.[habit.id] || ''
  lastSavedNote.value = dayEditNote.value
  showDayEditModal.value = true
}

async function switchToDay(day) {
  if (!selectedHabitForEdit.value) return
  if (!isScheduledFromWeekSchedule(selectedHabitForEdit.value, day.date)) {
    toast.showToast({ type: 'info', title: 'Привычка не запланирована на этот день' })
    return
  }
  
  await saveNoteOnBlur()
  saveCurrentDayData()
  
  selectedDayForEdit.value = day
  const daySchedule = getDayScheduleData(selectedHabitForEdit.value, day.date)
  dayEditSkipReason.value = daySchedule?.excuse_reason || skipReasons.value[day.date]?.[selectedHabitForEdit.value.id] || ''
  dayEditNote.value = daySchedule?.note || habitNotes.value[day.date]?.[selectedHabitForEdit.value.id] || ''
  lastSavedNote.value = dayEditNote.value
}

function saveCurrentDayData() {
  if (!selectedHabitForEdit.value || !selectedDayForEdit.value) return
  
  const habit = selectedHabitForEdit.value
  const dateStr = selectedDayForEdit.value.date
  
  if (dayEditNote.value) {
    if (!habitNotes.value[dateStr]) habitNotes.value[dateStr] = {}
    habitNotes.value[dateStr][habit.id] = dayEditNote.value
  } else if (habitNotes.value[dateStr]?.[habit.id]) {
    delete habitNotes.value[dateStr][habit.id]
  }
  
  saveSkipData()
}

function closeDayEditModal() {
  saveCurrentDayData()
  showDayEditModal.value = false
  selectedDayForEdit.value = null
  selectedHabitForEdit.value = null
  dayEditSkipReason.value = ''
  dayEditNote.value = ''
}

async function saveNoteAndClose() {
  if (!selectedHabitForEdit.value || !selectedDayForEdit.value) {
    closeDayEditModal()
    return
  }
  
  saveCurrentDayData()
  
  const habit = selectedHabitForEdit.value
  const habitId = habit.habit_id || habit.id
  const dateStr = selectedDayForEdit.value.date
  const currentStatus = getDayStatus(habit, dateStr)
  
  if (dayEditNote.value) {
    const statusToSend = isFutureDay.value ? null : currentStatus
    const result = await habitsStore.updateCompletionNote(habitId, dateStr, dayEditNote.value, statusToSend)
    
    if (result.success) {
      toast.showToast({ type: 'success', title: 'Заметка сохранена' })
    } else {
      toast.showToast({ type: 'error', title: 'Ошибка сохранения', message: result.error?.message })
    }
  } else {
    toast.showToast({ type: 'success', title: 'Заметка сохранена' })
  }
  
  closeDayEditModal()
}

async function saveNoteOnBlur() {
  if (!selectedHabitForEdit.value || !selectedDayForEdit.value) return
  if (noteSaving.value) return
  if (dayEditNote.value === lastSavedNote.value) return
  if (!dayEditNote.value && !lastSavedNote.value) return
  
  noteSaving.value = true
  
  const habit = selectedHabitForEdit.value
  const habitId = habit.habit_id || habit.id
  const dateStr = selectedDayForEdit.value.date
  const currentStatus = getDayStatus(habit, dateStr)
  
  saveCurrentDayData()
  
  const validStatuses = ['completed', 'missed', 'excused']
  const statusToSend = validStatuses.includes(currentStatus) ? currentStatus : null
  const result = await habitsStore.updateCompletionNote(habitId, dateStr, dayEditNote.value, statusToSend)
  
  noteSaving.value = false
  
  if (result.success) {
    lastSavedNote.value = dayEditNote.value
    if (DEBUG_MODE) {
      console.log('[Habits] Note saved successfully:', dateStr, dayEditNote.value)
    }
  } else {
    toast.showToast({ type: 'error', title: 'Ошибка сохранения заметки', message: result.error?.message })
  }
}

async function setDayAsCompleted() {
  if (!selectedHabitForEdit.value || !selectedDayForEdit.value) return
  if (isFutureDay.value) {
    toast.showToast({ type: 'warning', title: 'Нельзя изменить статус будущего дня' })
    return
  }
  
  saveCurrentDayData()
  
  const habit = selectedHabitForEdit.value
  const habitId = habit.habit_id || habit.id
  const dateStr = selectedDayForEdit.value.date
  
  if (!appStore.habitLog[dateStr]) {
    appStore.habitLog[dateStr] = []
  }
  if (!appStore.habitLog[dateStr].includes(habit.id)) {
    appStore.habitLog[dateStr].push(habit.id)
  }
  
  if (excusedSkips.value[dateStr]?.[habit.id]) {
    delete excusedSkips.value[dateStr][habit.id]
    saveSkipData()
  }
  
  const result = await habitsStore.markCompleted(habitId, dateStr, dayEditNote.value)
  
  if (result.success) {
    toast.showToast({ type: 'success', title: `Отмечено как выполненное` })
    await habitsStore.loadStatsPanel()
  } else {
    toast.showToast({ type: 'error', title: 'Ошибка сохранения', message: result.error?.message })
  }
}

async function setDayAsMissed() {
  if (!selectedHabitForEdit.value || !selectedDayForEdit.value) return
  if (isFutureDay.value) {
    toast.showToast({ type: 'warning', title: 'Нельзя изменить статус будущего дня' })
    return
  }
  
  saveCurrentDayData()
  
  const habit = selectedHabitForEdit.value
  const habitId = habit.habit_id || habit.id
  const dateStr = selectedDayForEdit.value.date
  
  if (appStore.habitLog[dateStr]) {
    appStore.habitLog[dateStr] = appStore.habitLog[dateStr].filter(id => id !== habit.id)
  }
  
  if (excusedSkips.value[dateStr]?.[habit.id]) {
    delete excusedSkips.value[dateStr][habit.id]
    saveSkipData()
  }
  
  if (dayEditSkipReason.value) {
    if (!skipReasons.value[dateStr]) skipReasons.value[dateStr] = {}
    skipReasons.value[dateStr][habit.id] = dayEditSkipReason.value
    saveSkipData()
  }
  
  const result = await habitsStore.unmarkCompleted(habitId, dateStr)
  
  if (result.success) {
    toast.showToast({ type: 'info', title: `Отмечено как пропущенное` })
    await habitsStore.loadStatsPanel()
  } else {
    toast.showToast({ type: 'error', title: 'Ошибка сохранения', message: result.error?.message })
  }
}

async function setDayAsExcused() {
  if (!selectedHabitForEdit.value || !selectedDayForEdit.value) return
  if (isFutureDay.value) {
    toast.showToast({ type: 'warning', title: 'Нельзя изменить статус будущего дня' })
    return
  }
  
  saveCurrentDayData()
  
  const habit = selectedHabitForEdit.value
  const habitId = habit.habit_id || habit.id
  const dateStr = selectedDayForEdit.value.date
  
  if (appStore.habitLog[dateStr]) {
    appStore.habitLog[dateStr] = appStore.habitLog[dateStr].filter(id => id !== habit.id)
  }
  
  if (!excusedSkips.value[dateStr]) excusedSkips.value[dateStr] = {}
  excusedSkips.value[dateStr][habit.id] = true
  
  if (dayEditSkipReason.value) {
    if (!skipReasons.value[dateStr]) skipReasons.value[dateStr] = {}
    skipReasons.value[dateStr][habit.id] = dayEditSkipReason.value
  }
  saveSkipData()
  
  const result = await habitsStore.markExcused(habitId, dateStr, dayEditSkipReason.value)
  
  if (result.success) {
    toast.showToast({ type: 'success', title: `Уважительный пропуск (без штрафа)` })
    await habitsStore.loadStatsPanel()
  } else {
    toast.showToast({ type: 'error', title: 'Ошибка сохранения', message: result.error?.message })
  }
}

function cancelAmnestyForDay() {
  if (!selectedDayForEdit.value) return
  
  const dateStr = selectedDayForEdit.value.date
  const amnestiedDates = gameSettings.value.amnestiedDates || []
  
  if (!amnestiedDates.includes(dateStr)) return
  
  if (!confirm('Отменить амнистию для этого дня? Штрафы будут восстановлены для ВСЕХ привычек в этот день.')) {
    return
  }
  
  gameSettings.value.amnestiedDates = amnestiedDates.filter(d => d !== dateStr)
  if (gameSettings.value.amnestiesUsedThisWeek > 0) {
    gameSettings.value.amnestiesUsedThisWeek--
  }
  saveGameSettings()
  
  toast.showToast({ type: 'warning', title: 'Амнистия отменена' })
}

const dayEditWeekStats = computed(() => {
  if (!selectedHabitForEdit.value) return { xpEarned: 0, xpPenalty: 0 }
  
  const habit = selectedHabitForEdit.value
  let xpEarned = 0
  let xpPenalty = 0
  
  weekDays.value.forEach(day => {
    const status = getDayStatus(habit, day.date)
    if (status === 'completed') {
      xpEarned += habit.xpReward || 5
    } else if (status === 'missed' && gameSettings.value.penaltiesEnabled) {
      const baseXp = habit.xpReward || 5
      const penaltyMultiplier = (habit.penaltyPercent ?? currentPenaltyPercent.value) / 100
      xpPenalty += Math.round(baseXp * penaltyMultiplier)
    }
  })
  
  return { xpEarned, xpPenalty }
})

async function toggleHabitCompletion(habit) {
  if (isPastWeek.value) {
    toast.showToast({ title: 'Нельзя изменять статусы в прошлых неделях', type: 'info' })
    return
  }
  if (!isScheduledForToday(habit)) {
    toast.showToast({ title: 'Эта привычка не запланирована на сегодня', type: 'info' })
    return
  }
  
  const result = appStore.toggleHabit(habit.id)
  const todayStr = new Date().toISOString().split('T')[0]
  
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
    
    const backendResult = await habitsStore.markCompleted(habit.backendId || habit.id, todayStr)
    if (backendResult.success) {
      await habitsStore.loadStatsPanel()
    } else if (DEBUG_MODE) {
      console.log('[Habits] Backend completion sync failed, will retry later')
    }
  } else {
    const lastEvent = xpStore.xpHistory.find(
      e => e.source === 'habit_completed' && 
           e.metadata?.habitId === habit.id &&
           new Date(e.timestamp).toDateString() === new Date().toDateString()
    )
    if (lastEvent) {
      xpStore.revokeXP(lastEvent.id)
    }
    
    const backendResult = await habitsStore.unmarkCompleted(habit.backendId || habit.id, todayStr)
    if (backendResult.success) {
      await habitsStore.loadStatsPanel()
    } else if (DEBUG_MODE) {
      console.log('[Habits] Backend undo sync failed, will retry later')
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
  
  const scheduleDays = habit.scheduleDays || habit.schedule_days || []
  const frequencyType = determineFrequencyType(habit.frequencyType || habit.frequency_type, scheduleDays)
  
  formData.value = {
    name: habit.name,
    icon: normalizeIconName(habit.icon),
    description: habit.description || '',
    xpReward: habit.xpReward || habit.xp_reward || 5,
    xpPenalty: habit.xpPenalty || habit.xp_penalty || 0,
    frequencyType: frequencyType,
    scheduleDays: scheduleDays.length > 0 ? [...scheduleDays] : [1, 2, 3, 4, 5, 6, 0],
    reminderTime: habit.reminderTime || habit.reminder_time || ''
  }
  showModal.value = true
}

function determineFrequencyType(existingType, scheduleDays) {
  if (existingType && existingType !== 'daily') {
    return existingType
  }
  
  if (!scheduleDays || scheduleDays.length === 0) {
    return 'daily'
  }
  
  const sortedDays = [...scheduleDays].sort((a, b) => a - b)
  const allDays = [0, 1, 2, 3, 4, 5, 6]
  const weekdays = [1, 2, 3, 4, 5]
  const weekends = [0, 6]
  
  const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false
    const sortedA = [...a].sort((x, y) => x - y)
    const sortedB = [...b].sort((x, y) => x - y)
    return sortedA.every((val, i) => val === sortedB[i])
  }
  
  if (arraysEqual(sortedDays, allDays)) {
    return 'daily'
  }
  if (arraysEqual(sortedDays, weekdays)) {
    return 'weekdays'
  }
  if (arraysEqual(sortedDays, weekends)) {
    return 'weekends'
  }
  
  return 'custom'
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

async function saveHabit() {
  if (!formData.value.name.trim()) return
  
  const scheduleDays = formData.value.frequencyType === 'custom' ? formData.value.scheduleDays :
                       formData.value.frequencyType === 'weekdays' ? [1, 2, 3, 4, 5] :
                       formData.value.frequencyType === 'weekends' ? [0, 6] : [0, 1, 2, 3, 4, 5, 6]
  
  const habitData = {
    name: formData.value.name.trim(),
    icon: formData.value.icon,
    description: formData.value.description,
    xpReward: formData.value.xpReward,
    xpPenalty: formData.value.xpPenalty,
    frequencyType: formData.value.frequencyType,
    scheduleDays: scheduleDays,
    reminderTime: formData.value.reminderTime
  }
  
  const backendHabitData = {
    name: habitData.name,
    description: habitData.description || '',
    icon: habitData.icon,
    xp_reward: habitData.xpReward,
    xp_penalty: habitData.xpPenalty || 0,
    schedule_days: scheduleDays
  }
  
  if (editingHabit.value) {
    appStore.updateHabit(editingHabit.value.id, habitData)
    toast.showToast({ title: 'Привычка обновлена', type: 'success' })
    
    const backendId = editingHabit.value.backendId || editingHabit.value.id
    const backendResult = await habitsStore.updateHabit(backendId, backendHabitData)
    if (backendResult.success && backendResult.data?.id) {
      appStore.updateHabit(editingHabit.value.id, { backendId: backendResult.data.id })
    }
  } else {
    const localHabit = appStore.addHabit(habitData)
    toast.showToast({ title: 'Привычка создана', type: 'success' })
    
    if (allHabits.value.length === 0 && gameSettings.value.aiCoachEnabled) {
      coachHint.value = 'Отлично! Первый шаг сделан. Старайтесь выполнять привычку каждый день — так она закрепится быстрее.'
    }
    
    console.log('[Habits] Creating habit on backend:', backendHabitData)
    const backendResult = await habitsStore.createHabit(backendHabitData)
    console.log('[Habits] Backend create result:', backendResult)
    
    if (backendResult.success && backendResult.habitId) {
      appStore.updateHabit(localHabit.id, { backendId: backendResult.habitId })
      console.log('[Habits] Habit synced with backend, id:', backendResult.habitId)
    }
  }
  
  closeModal()
}

async function deleteHabit() {
  if (editingHabit.value) {
    appStore.removeHabit(editingHabit.value.id)
    toast.showToast({ title: 'Привычка удалена', type: 'info' })
    
    const backendId = editingHabit.value.backendId || editingHabit.value.id
    await habitsStore.deleteHabit(backendId)
    
    closeModal()
  }
}

async function archiveHabit(habit) {
  appStore.updateHabit(habit.id, { archived: true })
  toast.showToast({ title: 'Привычка архивирована', type: 'info' })
  
  const backendId = habit.backendId || habit.id
  await habitsStore.archiveHabit(backendId)
}

async function confirmDeleteHabit(habit) {
  if (confirm(`Удалить привычку "${habit.name}"?`)) {
    appStore.removeHabit(habit.id)
    toast.showToast({ title: 'Привычка удалена', message: 'Её можно восстановить в блоке "Удалённые привычки"', type: 'info' })
    
    const backendId = habit.backendId || habit.id
    await habitsStore.deleteHabit(backendId)
  }
}

async function restoreHabit(habit) {
  appStore.restoreHabit(habit.id)
  toast.showToast({ title: 'Привычка восстановлена', type: 'success' })
  
  const backendId = habit.backendId || habit.id
  await habitsStore.restoreHabit(backendId)
}

async function permanentlyDeleteHabit(habit) {
  if (confirm(`Удалить привычку "${habit.name}" навсегда? Это действие нельзя отменить.`)) {
    appStore.permanentlyDeleteHabit(habit.id)
    toast.showToast({ title: 'Привычка удалена навсегда', type: 'warning' })
    
    const backendId = habit.backendId || habit.id
    await habitsStore.permanentlyDeleteHabit(backendId)
  }
}

function formatDeletedDate(dateStr) {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return 'сегодня'
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'вчера'
  }
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function setDifficulty(mode) {
  gameSettings.value.difficultyMode = mode
  gameSettings.value.penaltiesEnabled = mode !== 'soft'
  
  if (mode === 'soft') {
    gameSettings.value.weeklyAmnestyCount = 0
  } else if (mode === 'balanced' && gameSettings.value.weeklyAmnestyCount === 0) {
    gameSettings.value.weeklyAmnestyCount = 1
  } else if (mode === 'hardcore' && gameSettings.value.weeklyAmnestyCount === undefined) {
    gameSettings.value.weeklyAmnestyCount = 0
  }
  
  saveGameSettings()
}

async function saveGameSettings() {
  try {
    localStorage.setItem('onepercent_game_settings', JSON.stringify(gameSettings.value))

    const backendSettings = {
      difficulty_mode: gameSettings.value.difficultyMode,
      planning_penalty_enabled: gameSettings.value.planningPenalty ?? false,
      planning_penalty_amount: gameSettings.value.planningPenalty ? (gameSettings.value.planningPenaltyAmount ?? 10) : 0,
      journal_penalty_enabled: gameSettings.value.journalPenalty ?? false,
      journal_penalty_amount: gameSettings.value.journalPenalty ? (gameSettings.value.journalPenaltyAmount ?? 10) : 0,
      weekly_amnesty_count: gameSettings.value.weeklyAmnestyCount ?? 1
    }

    const result = await habitsStore.saveSettings(backendSettings)

    if (result.success) {
      if (amnestyDataWasLoaded.value) {
        const newTotal = gameSettings.value.weeklyAmnestyCount ?? 1
        const used = habitsStore.amnestyData.amnesty_available.used || 0
        habitsStore.amnestyData.amnesty_available.total = newTotal
        habitsStore.amnestyData.amnesty_available.remaining = Math.max(0, newTotal - used)
      }
      
      if (habitsStore.settings?.weekly_amnesty_count !== undefined) {
        gameSettings.value.weeklyAmnestyCount = habitsStore.settings.weekly_amnesty_count
      }
      if (habitsStore.settings?.amnesty_remaining !== undefined) {
        gameSettings.value.amnestiesUsedThisWeek = (gameSettings.value.weeklyAmnestyCount ?? 1) - habitsStore.settings.amnesty_remaining
      }
    }

    if (DEBUG_MODE) {
      console.log('[Habits] Game settings saved:', gameSettings.value, 'Backend result:', result.success)
    }
  } catch (e) {
    console.error('[Habits] Failed to save game settings:', e)
  }
}

async function loadGameSettings() {
  try {
    const stored = localStorage.getItem('onepercent_game_settings')
    if (stored) {
      const parsed = JSON.parse(stored)
      gameSettings.value = { ...gameSettings.value, ...parsed }
      
      if (gameSettings.value.difficultyMode !== 'soft' && 
          (gameSettings.value.weeklyAmnestyCount === undefined || gameSettings.value.weeklyAmnestyCount === 0)) {
        if (gameSettings.value.difficultyMode === 'balanced') {
          gameSettings.value.weeklyAmnestyCount = 1
        }
      }
    }
    
    const result = await habitsStore.loadSettings()
    if (result.success && result.data) {
      gameSettings.value.difficultyMode = result.data.difficulty_mode || gameSettings.value.difficultyMode
      gameSettings.value.penaltiesEnabled = result.data.difficulty_mode !== 'soft'
      gameSettings.value.amnestiedDates = result.data.amnestied_dates || []
      
      if (result.data.planning_penalty_enabled !== undefined) {
        gameSettings.value.planningPenalty = result.data.planning_penalty_enabled
        gameSettings.value.planningPenaltyAmount = result.data.planning_penalty_amount ?? 10
      }
      if (result.data.journal_penalty_enabled !== undefined) {
        gameSettings.value.journalPenalty = result.data.journal_penalty_enabled
        gameSettings.value.journalPenaltyAmount = result.data.journal_penalty_amount ?? 10
      }
      if (result.data.amnesty_remaining !== undefined) {
        const maxAmnesty = result.data.weekly_amnesty_count ?? 1
        gameSettings.value.weeklyAmnestyCount = maxAmnesty
        gameSettings.value.amnestiesUsedThisWeek = maxAmnesty - result.data.amnesty_remaining
      }
      
      if (DEBUG_MODE) {
        console.log('[Habits] Settings loaded from backend:', result.data)
      }
    }
  } catch (e) {
    console.error('[Habits] Failed to load game settings:', e)
  }
}

async function useAmnesty(date = null) {
  const targetDate = date || selectedAmnestyDate.value
  if (!targetDate) {
    toast.showToast({ title: 'Ошибка', message: 'Выберите день для амнистии', type: 'error' })
    return
  }
  
  const result = await habitsStore.applyAmnesty(targetDate)
  
  if (result.success) {
    const now = new Date()
    const weekStart = getWeekStart(now)
    
    if (!gameSettings.value.amnestyWeekStart || 
        new Date(gameSettings.value.amnestyWeekStart).getTime() !== weekStart.getTime()) {
      gameSettings.value.amnestyWeekStart = weekStart.toISOString()
      gameSettings.value.amnestiesUsedThisWeek = 0
    }
    
    gameSettings.value.amnestiesUsedThisWeek++
    gameSettings.value.weeklyAmnestyUsed = now.toISOString()
    gameSettings.value.amnestiedDates = [...(gameSettings.value.amnestiedDates || []), targetDate]
    saveGameSettings()
    
    const xpRestored = result.xpRestored || 0
    const remaining = habitsStore.amnestyRemaining
    const message = xpRestored > 0 
      ? `+${xpRestored} XP возвращено. Осталось амнистий: ${remaining}` 
      : `Штрафы отменены. Осталось амнистий: ${remaining}`
    toast.showToast({ title: 'Амнистия применена!', message, type: 'success' })
    
    selectedAmnestyDate.value = null
    showAmnestyModal.value = false
  } else {
    const errorMsg = result.error?.message || 'Не удалось применить амнистию'
    toast.showToast({ title: 'Ошибка', message: errorMsg, type: 'error' })
  }
}

async function revokeAmnesty(date) {
  const result = await habitsStore.revokeAmnesty(date)
  
  if (result.success) {
    gameSettings.value.amnestiedDates = (gameSettings.value.amnestiedDates || []).filter(d => d !== date)
    gameSettings.value.amnestiesUsedThisWeek = Math.max(0, gameSettings.value.amnestiesUsedThisWeek - 1)
    saveGameSettings()
    
    toast.showToast({ title: 'Амнистия отменена', message: 'Штрафы снова активны для этого дня', type: 'info' })
  } else {
    const errorMsg = result.error?.message || 'Не удалось отменить амнистию'
    toast.showToast({ title: 'Ошибка', message: errorMsg, type: 'error' })
  }
}

const selectedAmnestyDate = ref(null)
const analyticsLoaded = ref(false)
const achievementsLoaded = ref(false)

watch(activeTab, async (newTab) => {
  if (newTab === 'analytics') {
    if (!analyticsLoaded.value) {
      await habitsStore.loadAnalytics()
      analyticsLoaded.value = true
    }
    if (!achievementsLoaded.value) {
      await habitsStore.loadAchievements()
      achievementsLoaded.value = true
    }
  }
})

watch(weekOffset, async (newOffset, oldOffset) => {
  if (newOffset === oldOffset) return
  
  const days = weekDays.value
  if (!days.length) return
  
  const dateFrom = days[0].date
  const dateTo = days[6].date
  
  if (DEBUG_MODE) {
    console.log('[Habits.vue] Week changed, loading data:', { dateFrom, dateTo, weekOffset: newOffset })
  }
  
  const params = {
    date_from: dateFrom,
    date_to: dateTo,
    include_deleted: true
  }
  
  const result = await habitsStore.loadHabits(params)
  
  if (!result.success && result.reason === 'loading') {
    pendingWeekLoad.value = params
    if (DEBUG_MODE) {
      console.log('[Habits.vue] Load in progress, queued for retry:', params)
    }
  }
})

watch(() => habitsStore.loading, async (isLoading, wasLoading) => {
  if (wasLoading && !isLoading && pendingWeekLoad.value) {
    const params = pendingWeekLoad.value
    pendingWeekLoad.value = null
    
    if (DEBUG_MODE) {
      console.log('[Habits.vue] Retrying pending week load:', params)
    }
    
    await habitsStore.loadHabits(params)
  }
})

onMounted(async () => {
  loadGameSettings()
  
  await habitsStore.initialize({ force: true })
  
  if (gameSettings.value.aiCoachEnabled && habitStreak.value >= 7 && habitStreak.value % 7 === 0) {
    coachHint.value = `Потрясающе! ${habitStreak.value} дней подряд — это уже настоящая привычка! Так держать!`
  }
})
</script>

<style scoped>
.habits-page {
  max-width: var(--content-width-narrow);
  margin: 0 auto;
  padding: var(--container-padding);
}

.page-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.title-section {
  text-align: center;
}

.title-section h1 {
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

.stats-bar.has-amnesty {
  grid-template-columns: 1fr 1fr 1fr 1fr 1.5fr;
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

.stat-item.amnesty .stat-icon {
  background: rgba(236, 72, 153, 0.1);
  color: #ec4899;
}

.stat-item.amnesty.has-missed {
  border-color: rgba(236, 72, 153, 0.3);
  background: linear-gradient(135deg, var(--card-bg) 0%, rgba(236, 72, 153, 0.05) 100%);
}

.stat-item.amnesty.depleted {
  opacity: 0.6;
}

.stat-item.amnesty.depleted .stat-icon {
  color: var(--text-muted);
}

.stat-item.amnesty.depleted .stat-value {
  color: var(--text-muted);
}

.stat-item.amnesty .amnesty-badge {
  background: #ec4899;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.amnesty-modal .amnesty-header h3 {
  color: #ec4899;
}

.amnesty-modal .amnesty-header h3 svg {
  color: #ec4899;
}

.amnesty-status {
  text-align: center;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(236, 72, 153, 0.02) 100%);
  border-radius: 12px;
  margin-bottom: 1.25rem;
}

.amnesty-counter {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 0.25rem;
}

.amnesty-remaining {
  font-size: 2rem;
  font-weight: 700;
  color: #ec4899;
}

.amnesty-separator {
  font-size: 1.5rem;
  color: var(--text-muted);
}

.amnesty-total {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-muted);
}

.amnesty-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.amnesty-days-section {
  margin-top: 0.5rem;
}

.amnesty-instruction {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
  text-align: center;
}

.amnesty-days-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.amnesty-day-card {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.amnesty-day-card:hover {
  border-color: #ec4899;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, rgba(236, 72, 153, 0.05) 100%);
}

.amnesty-day-card .day-name {
  font-weight: 600;
  color: var(--text-primary);
}

.amnesty-day-card .day-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.amnesty-day-card .day-missed {
  font-size: 0.75rem;
  color: var(--text-secondary);
  background: var(--bg-primary);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}

.amnesty-day-card .day-penalty {
  font-weight: 600;
  color: #ef4444;
  font-size: 0.85rem;
}

.amnesty-day-card .day-penalty.saved {
  color: #22c55e;
}

.amnesty-day-card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.amnesty-day-card:disabled:hover {
  border-color: var(--border-color);
  background: var(--bg-secondary);
}

.amnesty-day-card.amnestied {
  position: relative;
  grid-template-columns: 1fr auto auto auto auto;
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(236, 72, 153, 0.02) 100%);
  border-color: rgba(236, 72, 153, 0.3);
  cursor: default;
}

.amnesty-day-card.amnestied:hover {
  border-color: rgba(236, 72, 153, 0.4);
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0.04) 100%);
}

.amnestied-badge {
  position: absolute;
  top: -6px;
  left: -6px;
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(236, 72, 153, 0.4);
}

.amnestied-badge svg {
  color: white;
}

.btn-cancel-amnesty {
  width: 26px;
  height: 26px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: all 0.2s ease;
}

.btn-cancel-amnesty:hover {
  background: #fee2e2;
  border-color: #ef4444;
  color: #ef4444;
}

.amnestied-section {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.amnesty-instruction.amnestied-label {
  color: #ec4899;
  font-weight: 500;
}

.amnesty-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1rem;
  color: var(--text-muted);
}

.amnesty-loading .spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.amnesty-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
  color: var(--text-muted);
}

.amnesty-empty svg {
  color: #22c55e;
}

.amnesty-empty p {
  margin: 0;
  font-weight: 500;
  color: var(--text-secondary);
}

.amnesty-empty-hint {
  font-size: 0.75rem;
  text-align: center;
}

.day-edit-modal .modal-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.day-edit-modal .modal-header h3 svg {
  color: var(--primary-color);
}

.day-edit-habit-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 10px;
  margin-bottom: 1rem;
}

.day-edit-habit-info .habit-icon {
  font-size: 1.25rem;
}

.day-edit-habit-info .habit-name {
  font-weight: 600;
}

.day-edit-schedule {
  display: flex;
  justify-content: center;
  gap: 4px;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 10px;
  margin-bottom: 1rem;
}

.schedule-day-mini {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: var(--bg-primary);
  transition: all 0.2s ease;
}

.schedule-day-mini .day-letter {
  font-size: 0.7rem;
}

.schedule-day-mini.current {
  box-shadow: 0 0 0 2px var(--primary-color);
}

.schedule-day-mini.not-scheduled {
  opacity: 0.4;
}

.schedule-day-mini.completed {
  background: #22c55e;
}

.schedule-day-mini.completed .day-letter {
  color: white;
}

.schedule-day-mini.missed {
  background: rgba(239, 68, 68, 0.15);
}

.schedule-day-mini.missed .day-letter {
  color: #ef4444;
}

.schedule-day-mini.amnestied {
  background: rgba(236, 72, 153, 0.15);
}

.schedule-day-mini.amnestied .day-letter {
  color: #ec4899;
}

.schedule-day-mini.excused {
  background: rgba(234, 179, 8, 0.15);
}

.schedule-day-mini.excused .day-letter {
  color: #eab308;
}

.schedule-day-mini.scheduled,
.schedule-day-mini.future {
  background: rgba(124, 58, 237, 0.1);
}

.schedule-day-mini.today {
  background: rgba(124, 58, 237, 0.1);
  box-shadow: 0 0 0 2px var(--primary-color);
}

.schedule-day-mini.scheduled .day-letter,
.schedule-day-mini.future .day-letter,
.schedule-day-mini.today .day-letter {
  color: var(--primary-color);
}

.day-edit-stats {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-item-mini {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  border-radius: 8px;
}

.stat-item-mini.positive {
  background: rgba(34, 197, 94, 0.1);
}

.stat-item-mini.positive .stat-value {
  color: #22c55e;
  font-weight: 700;
}

.stat-item-mini.negative {
  background: rgba(239, 68, 68, 0.1);
}

.stat-item-mini.negative .stat-value {
  color: #ef4444;
  font-weight: 700;
}

.stat-item-mini .stat-label {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.day-edit-current-status {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.85rem;
}

.day-edit-current-status .status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.day-edit-current-status .xp-row {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.day-edit-current-status .xp-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.day-edit-current-status .xp-badge.positive {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.day-edit-current-status .xp-badge.negative {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.day-edit-current-status .status-label {
  color: var(--text-muted);
}

.day-edit-current-status .status-value {
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}

.day-edit-current-status .status-value.completed {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.day-edit-current-status .status-value.missed {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.day-edit-current-status .status-value.amnestied {
  background: rgba(236, 72, 153, 0.15);
  color: #ec4899;
}

.day-edit-current-status .status-value.excused {
  background: rgba(234, 179, 8, 0.15);
  color: #eab308;
}

.day-edit-current-status .status-value.today,
.day-edit-current-status .status-value.scheduled {
  background: rgba(124, 58, 237, 0.15);
  color: var(--primary-color);
}

.day-edit-notes,
.day-edit-reason {
  margin-bottom: 1rem;
}

.note-save-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.btn-save-note-inline {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  background: var(--primary-color);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-save-note-inline:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-save-note-inline:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.day-edit-notes label,
.day-edit-reason label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 0.35rem;
}

.day-edit-notes textarea,
.day-edit-reason textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.85rem;
  resize: none;
}

.day-edit-notes textarea:focus,
.day-edit-reason textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.day-edit-reason textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.day-edit-future-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(124, 58, 237, 0.08);
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: var(--primary-color);
}

.day-edit-future-notice svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.day-edit-actions-locked {
  display: flex;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.btn-save-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #7c3aed;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
}

.btn-save-note:hover {
  background: #6d28d9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
}

.day-edit-schedule.clickable .schedule-day-mini.clickable {
  cursor: pointer;
}

.day-edit-schedule.clickable .schedule-day-mini.clickable:hover {
  transform: scale(1.1);
}

.day-edit-schedule.clickable .schedule-day-mini:not(.clickable) {
  cursor: not-allowed;
  opacity: 0.4;
}

.day-edit-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.day-edit-actions.today-mode {
  grid-template-columns: 1fr;
}

.day-edit-actions.today-mode .btn-status.completed {
  flex-direction: row;
  justify-content: center;
  padding: 0.875rem 1rem;
  font-size: 0.9rem;
}

.status-value.today {
  color: var(--primary-color);
  background: rgba(124, 58, 237, 0.1);
}

.btn-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.6rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.btn-status:hover {
  border-color: var(--primary-color);
}

.btn-status.completed:hover,
.btn-status.completed.active {
  background: rgba(34, 197, 94, 0.1);
  border-color: #22c55e;
  color: #22c55e;
}

.btn-status.missed:hover,
.btn-status.missed.active {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
}

.btn-status.excused:hover,
.btn-status.excused.active {
  background: rgba(234, 179, 8, 0.1);
  border-color: #eab308;
  color: #eab308;
}

.day-edit-amnesty-warning {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(236, 72, 153, 0.08);
  border: 1px solid rgba(236, 72, 153, 0.2);
  border-radius: 8px;
}

.day-edit-amnesty-warning .amnesty-info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #ec4899;
  font-weight: 500;
}

.amnesty-cancel-row {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.amnesty-cancel-note {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-style: italic;
}

.btn-cancel-amnesty {
  align-self: flex-start;
  padding: 0.4rem 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #ef4444;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel-amnesty:hover {
  background: rgba(239, 68, 68, 0.2);
}

.tabs-navigation {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding: 4px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.week-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.week-nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: var(--card-bg);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.week-nav-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
}

.week-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.week-label {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-weight: 500;
  color: var(--text-primary);
}

.week-label.past .week-text {
  color: var(--text-muted);
}

.btn-return-current {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.6rem;
  background: var(--primary-color);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-return-current:hover {
  background: var(--primary-hover, #6d28d9);
  transform: translateY(-1px);
}

.past-week-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.75rem;
  background: rgba(234, 179, 8, 0.1);
  border: 1px solid rgba(234, 179, 8, 0.3);
  border-radius: 8px;
  font-size: 0.8rem;
  color: #ca8a04;
}

.deleted-habits-section {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--border-color);
}

.deleted-habits-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.deleted-habits-toggle:hover {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.deleted-habits-toggle .toggle-icon {
  margin-left: auto;
  transition: transform 0.2s ease;
}

.deleted-habits-toggle .toggle-icon.rotated {
  transform: rotate(90deg);
}

.deleted-habits-list {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.habit-card.deleted {
  opacity: 0.7;
  background: var(--bg-tertiary);
}

.habit-icon.deleted {
  opacity: 0.5;
}

.habit-name.deleted {
  text-decoration: line-through;
  color: var(--text-muted);
}

.deleted-date {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.habit-deleted-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 6px;
  font-size: 0.65rem;
  color: #ef4444;
}

.habit-card.deleted-during-week {
  position: relative;
  border: 1px dashed rgba(239, 68, 68, 0.4);
  background: linear-gradient(135deg, var(--card-bg) 0%, rgba(239, 68, 68, 0.03) 100%);
}

.habit-deleted-during-week-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.65rem;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 500;
  color: #ef4444;
}

.habit-deleted-during-week-badge svg {
  opacity: 0.8;
}

.schedule-day.deleted-after {
  opacity: 0.35;
  pointer-events: none;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 2px,
    rgba(239, 68, 68, 0.1) 2px,
    rgba(239, 68, 68, 0.1) 4px
  );
}

.schedule-day.deleted-after::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 70%;
  height: 1px;
  background: rgba(239, 68, 68, 0.5);
  transform: translate(-50%, -50%) rotate(-45deg);
}

.btn-icon.restore {
  color: var(--success-color, #22c55e);
}

.btn-icon.restore:hover {
  background: rgba(34, 197, 94, 0.1);
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

.habit-day-cell.status-completed {
  background: #10b981;
  color: white;
}

.habit-day-cell.status-missed {
  background: #ef4444;
  color: white;
}

.habit-day-cell.status-excused {
  background: #f59e0b;
  color: white;
}

.habit-day-cell.status-amnestied {
  background: #8b5cf6;
  color: white;
}

.habit-day-cell.status-not_scheduled {
  background: var(--border-color);
  opacity: 0.4;
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
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.habit-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.habit-card:hover .habit-schedule-inline {
  background: rgba(124, 58, 237, 0.06);
  border-radius: 8px;
  padding: 4px;
  margin: -4px;
}

.habit-row-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.habit-row-top .habit-name {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 500;
}

.habit-row-top .xp-badge {
  flex-shrink: 0;
}

.habit-row-bottom {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.habit-row-bottom .habit-schedule-inline {
  margin-left: auto;
}

.habit-card.completed {
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.3);
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

.btn-edit-habit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;
  flex-shrink: 0;
}

.habit-card:hover .btn-edit-habit {
  opacity: 1;
}

.btn-edit-habit:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .btn-edit-habit {
    opacity: 1;
    width: 32px;
    height: 32px;
  }
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
  transition: all 0.2s ease;
  padding: 4px;
  margin: -4px;
  margin-left: auto;
  border-radius: 8px;
}

.clickable-schedule {
  cursor: pointer;
}

.clickable-schedule:hover .schedule-day:not(.not-scheduled) {
  transform: translateY(-1px);
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
  cursor: pointer;
}

.day-letter {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
}

.schedule-day.not-scheduled {
  background: var(--bg-secondary);
  opacity: 0.5;
  cursor: default;
}

.schedule-day.scheduled,
.schedule-day.future {
  background: rgba(124, 58, 237, 0.15);
}

.schedule-day.scheduled .day-letter,
.schedule-day.future .day-letter {
  color: var(--primary-color);
}

.schedule-day.completed {
  background: #22c55e;
}

.schedule-day.completed .day-letter {
  color: white;
}

.schedule-day.missed {
  background: rgba(239, 68, 68, 0.15);
}

.schedule-day.missed .day-letter {
  color: #ef4444;
}

.schedule-day.amnestied {
  background: rgba(236, 72, 153, 0.15);
}

.schedule-day.amnestied .day-letter {
  color: #ec4899;
}

.schedule-day.excused {
  background: rgba(234, 179, 8, 0.15);
}

.schedule-day.excused .day-letter {
  color: #eab308;
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
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
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

.mobile-add-button {
  display: none;
  padding: 1rem 0;
  margin-top: 0.5rem;
}

.btn-add-habit {
  width: 100%;
  justify-content: center;
  padding: 0.875rem 1rem;
  border-radius: 12px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: center;
  }
  
  .title-section {
    text-align: center;
  }
  
  .title-section h1 {
    justify-content: center;
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
  
  .stat-item.amnesty {
    grid-column: span 1;
  }
  
  .stats-bar.has-amnesty {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-bar.has-amnesty .stat-item.compact-mode {
    grid-column: span 2;
  }
  
  .amnesty-day-card {
    grid-template-columns: 1fr auto auto;
    gap: 0.5rem;
    padding: 0.625rem 0.75rem;
  }
  
  .amnesty-day-card.amnestied {
    grid-template-columns: 1fr auto auto auto;
  }
  
  .amnesty-day-card .day-date {
    display: none;
  }
  
  .amnestied-badge {
    width: 18px;
    height: 18px;
    top: -4px;
    left: -4px;
  }
  
  .amnestied-badge svg {
    width: 10px;
    height: 10px;
  }
  
  .btn-cancel-amnesty {
    width: 24px;
    height: 24px;
  }
  
  .habit-card {
    padding: 0.875rem 1rem;
    gap: 0.75rem;
  }
  
  .habit-row-bottom {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .habit-row-bottom .habit-schedule-inline {
    margin-left: 0;
    width: 100%;
    justify-content: flex-start;
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
  
  .desktop-only {
    display: none !important;
  }
  
  .mobile-add-button {
    display: block;
  }
}

/* Card Expand Buttons */
.card-expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-expand-btn:hover {
  background: rgba(124, 58, 237, 0.1);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.badges-list.compact {
  max-height: 140px;
  overflow: hidden;
}

/* Detail Modals */
.detail-modal {
  max-width: 600px;
  width: 95%;
  max-height: 90vh;
  background: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
}

.detail-modal .modal-header {
  position: relative;
  padding-right: 3rem;
}

.detail-modal .modal-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-modal .modal-header h3 svg {
  color: var(--primary-color);
}

.detail-modal .modal-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.detail-modal .modal-body {
  max-height: 70vh;
  overflow-y: auto;
  padding: 1rem 1.5rem 1.5rem;
}

/* Badges Modal */
.badges-modal {
  max-width: 650px;
}

.badge-category {
  margin-bottom: 1.5rem;
}

.badge-category:last-child {
  margin-bottom: 0;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.category-icon {
  font-size: 1.1rem;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
}

.badge-card {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 10px;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.badge-card.unlocked {
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.2);
}

.badge-card.locked {
  opacity: 0.6;
}

.badge-card-icon {
  font-size: 1.75rem;
  flex-shrink: 0;
}

.badge-card-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.badge-card-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.badge-card-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.badge-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.badge-progress .progress-bar {
  flex: 1;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
}

.badge-progress .progress-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.badge-progress .progress-text {
  font-size: 0.7rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.badge-unlocked-mark {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: #22c55e;
  font-weight: 500;
  margin-top: 0.25rem;
}

/* Completion Modal */
.completion-modal {
  max-width: 600px;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.summary-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.summary-card.accent {
  background: rgba(124, 58, 237, 0.1);
  border-color: rgba(124, 58, 237, 0.2);
}

.summary-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-color);
}

.summary-card.accent .summary-value {
  color: var(--primary-color);
}

.summary-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-align: center;
}

.chart-section {
  margin-bottom: 1.5rem;
}

.chart-section h4 {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.weekly-chart {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
  height: 120px;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.weekly-bar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  height: 100%;
}

.weekly-bar-wrapper {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
}

.weekly-bar {
  width: 100%;
  min-height: 4px;
  background: var(--primary-color);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
  opacity: 0.7;
}

.weekly-bar.current {
  opacity: 1;
  background: linear-gradient(135deg, var(--primary-color), #a855f7);
}

.weekly-label {
  font-size: 0.65rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.weekly-rate {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.habit-distribution {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.habit-dist-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.habit-dist-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.habit-dist-icon {
  font-size: 1rem;
}

.habit-dist-name {
  flex: 1;
  font-size: 0.85rem;
  color: var(--text-primary);
}

.habit-dist-rate {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--primary-color);
}

.habit-dist-bar {
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.habit-dist-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), #a855f7);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.best-worst-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.best-card, .worst-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: var(--bg-secondary);
}

.best-card {
  background: rgba(34, 197, 94, 0.1);
}

.best-card svg {
  color: #22c55e;
}

.worst-card {
  background: rgba(234, 179, 8, 0.1);
}

.worst-card svg {
  color: #eab308;
}

.worst-card svg.down {
  transform: rotate(180deg);
}

.bw-content {
  display: flex;
  flex-direction: column;
}

.bw-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.bw-value {
  font-size: 1.1rem;
  font-weight: 700;
}

.best-card .bw-value {
  color: #22c55e;
}

.worst-card .bw-value {
  color: #eab308;
}

/* Calendar Modal */
.calendar-modal {
  max-width: 700px;
}

.year-stats-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.year-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.year-stat.accent {
  background: rgba(124, 58, 237, 0.1);
  border-color: rgba(124, 58, 237, 0.2);
}

.year-stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.year-stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: center;
}

.yearly-heatmap-section {
  margin-bottom: 1.5rem;
}

.yearly-heatmap {
  position: relative;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.heatmap-months-labels {
  display: flex;
  justify-content: space-between;
  padding-left: 30px;
  margin-bottom: 0.5rem;
  font-size: 0.7rem;
  color: var(--text-muted);
}

.heatmap-days-labels {
  position: absolute;
  left: 0.5rem;
  top: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 0.65rem;
  color: var(--text-muted);
}

.heatmap-grid-wrapper {
  padding-left: 25px;
  overflow-x: auto;
}

.yearly-heatmap-grid {
  display: flex;
  gap: 2px;
}

.heatmap-week-column {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.heatmap-day {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: var(--border-color);
}

.heatmap-day.empty {
  visibility: hidden;
}

.heatmap-day.level-0 { background: var(--border-color); }
.heatmap-day.level-1 { background: rgba(34, 197, 94, 0.3); }
.heatmap-day.level-2 { background: rgba(34, 197, 94, 0.6); }
.heatmap-day.level-3 { background: #22c55e; }

.heatmap-legend.yearly {
  margin-top: 0.75rem;
  justify-content: flex-end;
}

.monthly-breakdown h4 {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
}

.month-card {
  display: flex;
  flex-direction: column;
  padding: 0.6rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.month-card.best {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
}

.month-card.current {
  border-color: var(--primary-color);
}

.month-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.month-rate {
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary-color);
}

.month-card.best .month-rate {
  color: #22c55e;
}

.month-bar {
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  margin: 0.35rem 0;
  overflow: hidden;
}

.month-bar-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.month-card.best .month-bar-fill {
  background: #22c55e;
}

.month-completions {
  font-size: 0.7rem;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .detail-modal {
    max-width: 100%;
    width: 100%;
    max-height: 95vh;
    border-radius: 16px 16px 0 0;
    margin: auto 0 0 0;
  }
  
  .detail-modal .modal-header {
    padding: 1rem;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  
  .detail-modal .modal-header h3 {
    font-size: 1rem;
    flex: 1;
  }
  
  .detail-modal .modal-subtitle {
    width: 100%;
    order: 3;
    margin-top: 0.25rem;
  }
  
  .detail-modal .modal-body {
    padding: 1rem;
    max-height: calc(95vh - 80px);
  }
  
  .badges-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .badge-category {
    margin-bottom: 1rem;
  }
  
  .category-title {
    font-size: 0.85rem;
  }
  
  .badge-item {
    padding: 0.75rem;
  }
  
  .badge-icon {
    font-size: 1.5rem;
    min-width: 2.5rem;
  }
  
  .badge-name {
    font-size: 0.85rem;
  }
  
  .badge-description {
    font-size: 0.75rem;
  }
  
  .stats-summary,
  .year-stats-summary {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
  
  .summary-card,
  .year-stat {
    padding: 0.75rem 0.5rem;
  }
  
  .summary-value,
  .year-stat-value {
    font-size: 1.25rem;
  }
  
  .summary-label,
  .year-stat-label {
    font-size: 0.65rem;
  }
  
  .weekly-chart {
    height: 100px;
  }
  
  .chart-bar-value {
    font-size: 0.6rem;
  }
  
  .habit-distribution .habit-bar-label {
    font-size: 0.75rem;
  }
  
  .best-worst-section {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .months-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
  
  .month-card {
    padding: 0.5rem;
  }
  
  .month-name {
    font-size: 0.7rem;
  }
  
  .month-rate {
    font-size: 0.95rem;
  }
  
  .heatmap-months-labels {
    font-size: 0.6rem;
  }
  
  .yearly-heatmap-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 0.5rem;
  }
  
  .yearly-heatmap-grid {
    min-width: 500px;
  }
  
  .heatmap-cell {
    width: 10px;
    height: 10px;
  }
  
  .modal-section-title {
    font-size: 0.9rem;
  }
}
</style>
