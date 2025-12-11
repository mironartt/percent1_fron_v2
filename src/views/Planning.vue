<template>
  <div class="planning-container">
    <header class="planning-header-full">
      <button class="nav-btn-edge" @click="prevWeek" aria-label="Предыдущая неделя">
        <ChevronLeft :size="20" />
      </button>
      <div class="header-center">
        <h1 class="page-title">Планирование</h1>
        <span class="week-range-center">{{ weekRangeText }}</span>
      </div>
      <div class="header-right">
        <button class="nav-btn-edge" @click="nextWeek" aria-label="Следующая неделя">
          <ChevronRight :size="20" />
        </button>
        <button 
          v-if="!isCurrentWeek" 
          class="today-btn-inline"
          @click="goToCurrentWeek"
        >
          Сегодня
        </button>
      </div>
    </header>

    <div class="week-stats">
      <div class="stat-chip">
        <span class="stat-value">{{ weeklyTotalTasks }}</span>
        <span class="stat-label">шагов</span>
      </div>
      <div class="stat-chip">
        <span class="stat-value">{{ weeklyCompletedTasks }}</span>
        <span class="stat-label">выполнено</span>
      </div>
      <div class="stat-chip" v-if="weeklyTotalTime">
        <span class="stat-value">{{ weeklyTotalTime }}</span>
        <span class="stat-label">всего</span>
      </div>
    </div>

    <div class="week-bar">
      <button 
        v-for="day in weekDays" 
        :key="day.date"
        class="day-tab"
        :class="{ 
          active: selectedDay === day.date,
          today: isToday(day.date),
          'has-tasks': getTasksForDay(day.date).length > 0,
          weekend: day.isWeekend
        }"
        @click="selectDay(day.date)"
      >
        <span class="day-name">{{ day.shortName }}</span>
        <span class="day-num">{{ day.dayNum }}</span>
        <span v-if="getTasksForDay(day.date).length > 0" class="task-count">
          {{ getTasksForDay(day.date).length }}
        </span>
      </button>
    </div>

    <div class="day-content" v-if="selectedDay">
      <div class="day-header-info">
        <h2 class="day-title">{{ selectedDayTitle }}</h2>
        <span v-if="getTotalTimeForDay(selectedDay)" class="day-time">
          <Clock :size="14" />
          {{ getTotalTimeForDay(selectedDay) }}
        </span>
      </div>

      <div class="tasks-list" v-if="getTasksForDay(selectedDay).length > 0">
        <div 
          v-for="group in getGroupedTasksForDay(selectedDay)" 
          :key="group.goalId"
          class="task-group"
          :class="{ collapsed: collapsedGoalGroups[group.goalId] }"
        >
          <div 
            class="group-header clickable" 
            v-if="getGroupedTasksForDay(selectedDay).length > 1 || group.tasks.length > 1"
            @click="toggleGoalGroupCollapse(group.goalId)"
          >
            <ChevronRight 
              :size="16" 
              class="group-chevron"
              :class="{ rotated: !collapsedGoalGroups[group.goalId] }"
            />
            <span class="group-title">{{ group.goalTitle }}</span>
            <div class="group-meta">
              <span class="group-count">{{ group.completedCount }}/{{ group.tasks.length }}</span>
              <span v-if="group.totalMinutes" class="group-time">
                <Clock :size="12" />
                {{ formatGroupTime(group.totalMinutes) }}
              </span>
            </div>
          </div>
          <div class="group-tasks" v-show="!collapsedGoalGroups[group.goalId]">
            <div 
              v-for="task in group.tasks" 
              :key="task.id"
              class="task-card"
              :class="[
                { completed: task.completed },
                'priority-' + (task.priority || 'none')
              ]"
              @click="openTaskActions(task)"
              @touchstart="handleTouchStart(task, $event)"
              @touchend="handleTouchEnd"
              @touchmove="handleTouchMove"
            >
              <div class="priority-stripe" :class="'priority-' + (task.priority || 'none')"></div>
              <button 
                class="task-checkbox"
                :class="{ completed: task.completed }"
                @click.stop="toggleTaskComplete(task)"
              >
                <Check v-if="task.completed" :size="16" />
              </button>
              <div class="task-info">
                <span class="task-title">{{ task.stepTitle }}</span>
                <span class="task-goal" v-if="getGroupedTasksForDay(selectedDay).length === 1 && group.tasks.length === 1">{{ task.goalTitle }}</span>
              </div>
              <div class="task-meta">
                <span v-if="task.timeEstimate" class="time-badge">
                  <Clock :size="12" />
                  {{ formatTimeShort(task.timeEstimate) }}
                </span>
                <span v-if="task.priority" class="priority-icon-badge" :class="'priority-' + task.priority">
                  {{ getPriorityIcon(task.priority) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Секция просроченных задач -->
      <div class="task-group overdue-group" :class="{ collapsed: overdueCollapsed }" v-if="isToday(selectedDay) && overdueTasks.length > 0">
        <div class="group-header clickable" @click="toggleOverdueCollapse">
          <ChevronRight 
            :size="16" 
            class="group-chevron"
            :class="{ rotated: !overdueCollapsed }"
          />
          <span class="group-title">Просроченные</span>
          <div class="group-meta">
            <span class="group-count">{{ overdueCompletedCount }}/{{ overdueTasks.length }}</span>
          </div>
        </div>
        <div class="group-tasks" v-show="!overdueCollapsed">
          <div 
            v-for="task in overdueTasks" 
            :key="task.id"
            class="task-card"
            :class="{ completed: task.completed }"
            @click="openTaskActions(task)"
          >
            <div class="priority-stripe priority-critical"></div>
            <button 
              class="task-checkbox"
              :class="{ completed: task.completed }"
              @click.stop="toggleOverdueTaskComplete(task)"
            >
              <Check v-if="task.completed" :size="16" />
            </button>
            <div class="task-info">
              <span class="task-title">{{ task.stepTitle }}</span>
              <span class="task-goal">{{ task.goalTitle }}</span>
            </div>
            <div class="task-meta">
              <span class="overdue-date">{{ formatOverdueDate(task.scheduledDate) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="getTasksForDay(selectedDay).length === 0" class="empty-day">
        <Calendar :size="48" class="empty-icon" />
        <p>Нет задач на этот день</p>
        <span class="empty-hint">Добавьте шаги из целей ниже</span>
      </div>
    </div>

    <div class="section-divider">
      <span>Цели и шаги</span>
    </div>

    <div class="filters-row compact">
      <div class="sphere-dropdown" :class="{ open: showSphereDropdown }">
        <button class="dropdown-trigger" @click="showSphereDropdown = !showSphereDropdown">
          <Filter :size="14" />
          <span>{{ selectedSphereName }}</span>
          <span class="dropdown-count" v-if="filterSphere">1</span>
          <ChevronDown :size="14" class="dropdown-arrow" />
        </button>
        <div class="dropdown-menu" v-if="showSphereDropdown" @click.stop>
          <button 
            class="dropdown-item"
            :class="{ active: filterSphere === '' }"
            @click="filterSphere = ''; showSphereDropdown = false"
          >
            Все сферы
            <span class="item-count">{{ goalsWithSteps.length }}</span>
          </button>
          <button 
            v-for="sphere in spheresWithGoals" 
            :key="sphere.id"
            class="dropdown-item"
            :class="{ active: filterSphere === sphere.id }"
            @click="filterSphere = sphere.id; showSphereDropdown = false"
          >
            {{ sphere.icon }} {{ sphere.name }}
            <span class="item-count">{{ sphere.goalCount }}</span>
          </button>
        </div>
      </div>
      
      <!-- Desktop: segmented control -->
      <div class="segmented-control desktop-only">
        <button 
          class="segment"
          :class="{ active: filterStatus === '' }"
          @click="filterStatus = ''"
        >
          Все
        </button>
        <button 
          class="segment"
          :class="{ active: filterStatus === 'unscheduled' }"
          @click="filterStatus = 'unscheduled'"
        >
          Незапл.
        </button>
        <button 
          class="segment"
          :class="{ active: filterStatus === 'scheduled' }"
          @click="filterStatus = 'scheduled'"
        >
          Запл.
        </button>
      </div>
      
      <!-- Mobile: status dropdown -->
      <div class="status-dropdown mobile-only" :class="{ open: showStatusDropdown }">
        <button class="dropdown-trigger" @click="showStatusDropdown = !showStatusDropdown">
          <span>{{ selectedStatusName }}</span>
          <ChevronDown :size="14" class="dropdown-arrow" />
        </button>
        <div class="dropdown-menu" v-if="showStatusDropdown" @click.stop>
          <button 
            class="dropdown-item"
            :class="{ active: filterStatus === '' }"
            @click="filterStatus = ''; showStatusDropdown = false"
          >
            Все
          </button>
          <button 
            class="dropdown-item"
            :class="{ active: filterStatus === 'unscheduled' }"
            @click="filterStatus = 'unscheduled'; showStatusDropdown = false"
          >
            Незапланированные
          </button>
          <button 
            class="dropdown-item"
            :class="{ active: filterStatus === 'scheduled' }"
            @click="filterStatus = 'scheduled'; showStatusDropdown = false"
          >
            Запланированные
          </button>
        </div>
      </div>
      
      <!-- AI Planning button -->
      <button class="ai-planner-btn filters-ai-btn" @click="openAIPlannerModal">
        <Sparkles :size="16" />
        <span class="ai-btn-text desktop-only">AI планирование</span>
      </button>
    </div>

    <!-- Баннер: цели без шагов -->
    <div class="needs-decomposition-banner" v-if="goalsWithoutStepsTotal > 0">
      <div class="banner-header">
        <AlertCircle :size="20" class="banner-icon" />
        <span class="banner-title">{{ goalsWithoutStepsTotal }} {{ goalsWithoutStepsTotal === 1 ? 'цель требует' : 'целей требуют' }} декомпозиции</span>
      </div>
      <p class="banner-text">Чтобы планировать, разбейте цели на конкретные шаги</p>
      <div class="banner-goals">
        <div 
          v-for="goal in goalsWithoutSteps.slice(0, 3)" 
          :key="goal.id" 
          class="banner-goal-item"
          @click="goToDecomposition(goal)"
        >
          <span class="goal-sphere-mini">{{ getSphereIcon(goal.sphereId || goal.category) }}</span>
          <span class="goal-title-mini">{{ goal.text || goal.title }}</span>
          <ChevronRight :size="16" class="go-icon" />
        </div>
      </div>
      <button 
        v-if="goalsWithoutStepsTotal > 3" 
        class="btn btn-outline btn-small"
        @click="goToGoalsBank"
      >
        Показать все ({{ goalsWithoutStepsTotal }})
      </button>
    </div>

    <div class="goals-list" v-if="filteredGoalsWithSteps.length > 0">
      <div 
        v-for="goal in paginatedGoals" 
        :key="goal.id" 
        class="goal-card"
        :class="{ expanded: expandedGoals[goal.id] }"
      >
        <div class="goal-header" @click="toggleGoal(goal.id)">
          <div class="goal-main">
            <span class="goal-sphere-badge">{{ getSphereName(goal.sphereId) }}</span>
            <h3 class="goal-title">{{ goal.text || goal.title }}</h3>
          </div>
          <div class="goal-meta">
            <span class="steps-badge">
              {{ getUnscheduledStepsCount(goal) }}/{{ getUncompletedSteps(goal).length }}
            </span>
            <ChevronDown :size="20" class="expand-icon" :class="{ expanded: expandedGoals[goal.id] }" />
          </div>
        </div>
        
        <div class="steps-grid" v-show="expandedGoals[goal.id]">
          <!-- Если есть шаги -->
          <template v-if="goal.steps && goal.steps.length > 0">
            <div 
              v-for="step in getFilteredSteps(goal)" 
              :key="step.id"
              class="step-card"
              :class="{ 
                scheduled: isStepScheduled(goal.id, step.id),
                completed: step.completed,
                ['priority-' + getScheduledPriority(goal.id, step.id)]: isStepScheduled(goal.id, step.id)
              }"
              @click="openStepActions(goal, step)"
            >
              <button 
                class="step-checkbox"
                :class="{ completed: step.completed }"
                @click.stop="quickToggleStepComplete(goal, step)"
                :title="step.completed ? 'Отменить выполнение' : 'Выполнить'"
              >
                <Check v-if="step.completed" :size="14" />
              </button>
              <div class="step-content">
                <span class="step-title" :class="{ completed: step.completed }">{{ step.title }}</span>
                <div class="step-badges" v-if="isStepScheduled(goal.id, step.id)">
                  <span class="date-badge">
                    <Calendar :size="11" />
                    {{ formatStepDate(goal.id, step.id) }}
                  </span>
                  <span class="time-badge" :class="{ empty: !getScheduledTime(goal.id, step.id) }">
                    <Clock :size="11" />
                    {{ getScheduledTime(goal.id, step.id) ? formatTimeShort(getScheduledTime(goal.id, step.id)) : '—' }}
                  </span>
                </div>
              </div>
              <div class="priority-stripe" :class="'priority-' + (getScheduledPriority(goal.id, step.id) || 'none')"></div>
            </div>
          </template>
          
          <!-- Если нет шагов -->
          <div v-else class="no-steps-state">
            <ListTodo :size="32" class="no-steps-icon" />
            <p class="no-steps-text">У этой цели пока нет шагов</p>
            <p class="no-steps-hint">Разбейте цель на конкретные шаги для планирования</p>
            <button class="btn btn-primary" @click="goToGoalDetails(goal)">
              <Plus :size="16" />
              Добавить шаги
            </button>
          </div>
        </div>
      </div>

      <!-- Пагинация -->
      <div v-if="totalPages > 1" class="pagination-container">
        <button 
          class="pagination-btn"
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
        >
          <ChevronLeft :size="18" />
        </button>
        
        <div class="pagination-pages">
          <button 
            v-for="page in paginationPages" 
            :key="page"
            class="pagination-page"
            :class="{ active: page === currentPage, dots: page === '...' }"
            :disabled="page === '...'"
            @click="page !== '...' && goToPage(page)"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          class="pagination-btn"
          :disabled="currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
        >
          <ChevronRight :size="18" />
        </button>
      </div>
    </div>

    <div v-else-if="goalsWithSteps.length === 0" class="empty-state">
      <Target :size="48" class="empty-icon" />
      <h3>Нет целей для планирования</h3>
      <p>Добавьте цели в банк целей и декомпозируйте их на шаги</p>
      <button class="btn btn-primary" @click="goToGoalsBank">
        Перейти в банк целей
      </button>
    </div>

    <div v-else class="empty-state">
      <Filter :size="48" class="empty-icon" />
      <p>Нет целей по выбранным фильтрам</p>
      <button class="btn btn-outline" @click="clearFilters">
        Сбросить фильтры
      </button>
    </div>

    <!-- AI Planner Modal -->
    <div class="ai-planner-overlay" v-if="showAIPlannerModal" @click="closeAIPlannerModal">
      <div class="ai-planner-modal" @click.stop>
        <div class="ai-modal-header">
          <div class="ai-modal-title-row">
            <Sparkles :size="20" class="ai-modal-icon" />
            <h3>AI планирование недели</h3>
          </div>
          <button class="ai-modal-close" @click="closeAIPlannerModal">
            <X :size="20" />
          </button>
        </div>
        
        <div class="ai-modal-content" v-if="aiPlannerStep === 'intro'">
          <div class="ai-intro-section">
            <div class="ai-intro-icon">
              <Sparkles :size="48" />
            </div>
            <h4 class="ai-intro-title">Умное планирование недели</h4>
            <p class="ai-intro-description">
              AI проанализирует ваши задачи: приоритеты, оценки времени и сферы жизни. 
              На основе этого распределит задачи по дням недели с учётом баланса нагрузки.
            </p>
            
            <div class="ai-feature-list">
              <div class="ai-feature-item">
                <Brain :size="18" />
                <span>Анализ приоритетов и времени</span>
              </div>
              <div class="ai-feature-item">
                <BarChart3 :size="18" />
                <span>Баланс нагрузки по дням</span>
              </div>
              <div class="ai-feature-item">
                <ListChecks :size="18" />
                <span>Предпросмотр перед применением</span>
              </div>
            </div>
            
            <div class="ai-option-toggle">
              <label class="toggle-label">
                <input type="checkbox" v-model="aiPlannerIncludeOverdue" />
                <span class="toggle-text">Включить просроченные задачи ({{ overdueTasks.length }})</span>
              </label>
            </div>
            
            <button class="btn btn-primary btn-lg ai-start-btn" @click="startAIPlanning" :disabled="aiPlannerLoading">
              <Sparkles :size="18" />
              Запланировать неделю
            </button>
            
            <label class="dont-show-label">
              <input type="checkbox" v-model="aiPlannerDontShowCheck" />
              <span>Не показывать больше</span>
            </label>
          </div>
        </div>
        
        <div class="ai-modal-content" v-else-if="aiPlannerStep === 'loading'">
          <div class="ai-loading-section">
            <div class="ai-loading-spinner"></div>
            <p>AI анализирует ваши задачи...</p>
            <span class="ai-loading-hint">Это займёт несколько секунд</span>
          </div>
        </div>
        
        <div class="ai-modal-content" v-else-if="aiPlannerStep === 'result'">
          <div class="ai-result-section">
            <div class="ai-result-summary">
              <h4 class="ai-result-title">План готов!</h4>
              <p class="ai-result-subtitle">Распределено {{ aiPlannerResult?.totalTasks || 0 }} задач на неделю</p>
            </div>
            
            <div class="ai-result-preview" v-if="aiPlannerResult">
              <div 
                v-for="day in aiPlannerResult.days" 
                :key="day.date"
                class="ai-day-preview"
                :class="{ collapsed: !isDayExpanded(day.date) }"
              >
                <div class="ai-day-header" @click="toggleDayExpand(day.date)">
                  <span class="ai-day-name">{{ day.dayName }}</span>
                  <div class="ai-day-meta">
                    <span class="ai-day-count">{{ getSelectedCountForDay(day) }} задач</span>
                    <ChevronRight :size="16" class="ai-day-chevron" :class="{ rotated: isDayExpanded(day.date) }" />
                  </div>
                </div>
                <div class="ai-day-tasks" v-show="isDayExpanded(day.date)">
                  <div 
                    v-for="task in day.tasks" 
                    :key="task.id" 
                    class="ai-task-preview"
                    :class="{ selected: isTaskSelected(task.id) }"
                    @click="toggleTaskSelection(task.id)"
                  >
                    <component 
                      :is="isTaskSelected(task.id) ? CheckSquare : Square" 
                      :size="18" 
                      class="ai-task-checkbox"
                    />
                    <span class="ai-task-title">{{ task.title }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="ai-modal-actions">
            <button class="btn btn-outline" @click="goBackToIntro">Назад</button>
            <button class="btn btn-primary ai-btn" @click="applyAIPlan" :disabled="aiPlannerSelectedTasks.length === 0">
              <Check :size="16" />
              <span>Применить план ({{ aiPlannerSelectedTasks.length }})</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-sheet-overlay" v-if="showBottomSheet" @click="closeBottomSheet">
      <div class="bottom-sheet" @click.stop>
        <div class="sheet-handle"></div>
        
        <template v-if="bottomSheetMode === 'task'">
          <h3 class="sheet-title">{{ selectedTask?.stepTitle }}</h3>
          <p class="sheet-subtitle">{{ selectedTask?.goalTitle }}</p>
          
          <button 
            class="complete-toggle-btn"
            :class="{ completed: selectedTask?.completed }"
            @click="toggleTaskComplete(selectedTask)"
          >
            <CheckCircle :size="20" />
            <span>{{ selectedTask?.completed ? 'Выполнено' : 'Отметить выполненным' }}</span>
          </button>
          
          <div class="inline-options-section">
            <div class="option-label">
              <Calendar :size="16" />
              <span>День</span>
            </div>
            <div class="option-chips">
              <button 
                v-for="day in weekDays" 
                :key="day.date"
                class="chip"
                :class="{ active: selectedTask?.scheduledDate === day.date }"
                @click="rescheduleTask(selectedTask, day.date, true)"
              >
                {{ day.label }} {{ day.dayNum }}
              </button>
            </div>
          </div>
          
          <div class="inline-options-section">
            <div class="option-label">
              <Flag :size="16" />
              <span>Приоритет</span>
            </div>
            <div class="option-chips">
              <button 
                v-for="priority in priorities" 
                :key="priority.value"
                class="chip"
                :class="{ 
                  active: selectedTask?.priority === priority.value,
                  ['priority-' + priority.value]: true
                }"
                @click="updateTaskPriority(selectedTask, priority.value, true)"
              >
                {{ priority.label }}
              </button>
            </div>
          </div>
          
          <div class="inline-options-section">
            <div class="option-label">
              <Clock :size="16" />
              <span>Время</span>
            </div>
            <div class="option-chips">
              <button 
                v-for="time in timeOptions" 
                :key="time.value"
                class="chip"
                :class="{ active: selectedTask?.timeEstimate === time.value }"
                @click="updateTaskTime(selectedTask, time.value, true)"
              >
                {{ time.label }}
              </button>
            </div>
          </div>
          
          <div class="sheet-actions-row">
            <button class="sheet-action danger" @click="removeTaskFromSchedule(selectedTask); closeBottomSheet()">
              <Trash2 :size="20" />
              <span>Убрать из плана</span>
            </button>
            <button class="sheet-action primary" @click="saveTaskChangesAndClose">
              <Check :size="20" />
              <span>Сохранить</span>
            </button>
          </div>
        </template>

        <template v-else-if="bottomSheetMode === 'step'">
          <h3 class="sheet-title">{{ selectedStep?.title }}</h3>
          <p class="sheet-subtitle">{{ selectedGoal?.text || selectedGoal?.title }}</p>
          
          <!-- Запланированный шаг: показываем inline-действия -->
          <template v-if="isSelectedStepScheduled">
            <div class="inline-options-section">
              <div class="option-label">
                <Calendar :size="16" />
                <span>День</span>
              </div>
              <div class="option-chips">
                <button 
                  v-for="day in weekDays" 
                  :key="day.date"
                  class="chip"
                  :class="{ active: getScheduledStepDate === day.date }"
                  @click="rescheduleStep(day.date)"
                >
                  {{ day.label }} {{ day.dayNum }}
                </button>
              </div>
            </div>
            
            <div class="inline-options-section">
              <div class="option-label">
                <Flag :size="16" />
                <span>Приоритет</span>
              </div>
              <div class="option-chips">
                <button 
                  v-for="priority in priorities" 
                  :key="priority.value"
                  class="chip"
                  :class="{ 
                    active: getScheduledStepPriority === priority.value,
                    ['priority-' + priority.value]: true
                  }"
                  @click="updateStepPriority(priority.value)"
                >
                  {{ priority.label }}
                </button>
              </div>
            </div>
            
            <div class="inline-options-section">
              <div class="option-label">
                <Clock :size="16" />
                <span>Время</span>
              </div>
              <div class="option-chips">
                <button 
                  v-for="time in timeOptions" 
                  :key="time.value"
                  class="chip"
                  :class="{ active: getScheduledStepTime === time.value }"
                  @click="updateStepTime(time.value)"
                >
                  {{ time.label }}
                </button>
              </div>
            </div>
            
            <div class="sheet-actions-row">
              <button class="sheet-action danger" @click="removeStepFromSchedule">
                <Trash2 :size="20" />
                <span>Убрать из плана</span>
              </button>
              <button class="sheet-action primary" @click="saveStepChangesAndClose">
                <Check :size="20" />
                <span>Сохранить</span>
              </button>
            </div>
          </template>
          
          <!-- Незапланированный шаг: показываем все опции -->
          <template v-else>
            <div class="inline-options-section">
              <div class="option-label">
                <Calendar :size="16" />
                <span>День</span>
              </div>
              <div class="option-chips">
                <button 
                  v-for="day in futureDays" 
                  :key="day.date"
                  class="chip"
                  :class="{ active: newStepDay === day.date, today: isToday(day.date) }"
                  @click="newStepDay = day.date"
                >
                  {{ day.shortName }} {{ day.dayNum }}
                </button>
              </div>
            </div>
            
            <div class="inline-options-section">
              <div class="option-label">
                <Flag :size="16" />
                <span>Приоритет</span>
              </div>
              <div class="option-chips">
                <button 
                  v-for="priority in priorities" 
                  :key="priority.value"
                  class="chip"
                  :class="{ 
                    active: newStepPriority === priority.value,
                    ['priority-' + priority.value]: true
                  }"
                  @click="newStepPriority = priority.value"
                >
                  {{ priority.label }}
                </button>
              </div>
            </div>
            
            <div class="inline-options-section">
              <div class="option-label">
                <Clock :size="16" />
                <span>Время</span>
              </div>
              <div class="option-chips">
                <button 
                  v-for="time in timeOptions" 
                  :key="time.value"
                  class="chip"
                  :class="{ active: newStepTime === time.value }"
                  @click="newStepTime = time.value"
                >
                  {{ time.label }}
                </button>
              </div>
            </div>
            
            <div class="sheet-actions" style="margin-top: 0.75rem;">
              <button 
                class="sheet-action primary"
                :disabled="!newStepDay"
                @click="scheduleNewStep"
              >
                <CheckCircle :size="20" />
                <span>Запланировать</span>
              </button>
            </div>
          </template>
        </template>

        <template v-else-if="bottomSheetMode === 'reschedule'">
          <h3 class="sheet-title">Перенести на</h3>
          
          <div class="sheet-actions">
            <button 
              v-for="day in weekDays" 
              :key="day.date"
              class="sheet-action day-option"
              :class="{ 
                today: isToday(day.date),
                active: selectedTask?.scheduledDate === day.date 
              }"
              @click="rescheduleTask(selectedTask, day.date)"
            >
              <span class="day-label">{{ day.label }}</span>
              <span class="day-date">{{ day.dayNum }}</span>
            </button>
          </div>
        </template>

        <template v-else-if="bottomSheetMode === 'priority'">
          <h3 class="sheet-title">Приоритет</h3>
          
          <div class="sheet-actions">
            <button 
              v-for="priority in priorities" 
              :key="priority.value"
              class="sheet-action priority-option"
              :class="{ active: selectedTask?.priority === priority.value }"
              @click="updateTaskPriority(selectedTask, priority.value)"
            >
              <span class="priority-indicator" :class="'priority-' + priority.value"></span>
              <span>{{ priority.label }}</span>
            </button>
          </div>
        </template>

        <template v-else-if="bottomSheetMode === 'time'">
          <h3 class="sheet-title">Время выполнения</h3>
          
          <div class="sheet-actions">
            <button 
              v-for="time in timeOptions" 
              :key="time.value"
              class="sheet-action"
              :class="{ active: selectedTask?.timeEstimate === time.value }"
              @click="updateTaskTime(selectedTask, time.value)"
            >
              <Clock :size="18" />
              <span>{{ time.label }}</span>
            </button>
          </div>
        </template>

        <template v-else-if="bottomSheetMode === 'add'">
          <h3 class="sheet-title">Добавить шаг на {{ selectedDayTitle }}</h3>
          
          <div class="add-step-search">
            <Search :size="16" />
            <input 
              v-model="addStepSearch" 
              type="text" 
              placeholder="Поиск по шагам..."
              class="search-input"
            />
          </div>
          
          <div class="add-step-list">
            <template v-for="goal in goalsWithUnscheduledSteps" :key="goal.id">
              <div class="add-goal-header">{{ goal.title }}</div>
              <button 
                v-for="step in getUnscheduledStepsFiltered(goal)" 
                :key="step.id"
                class="sheet-action step-option"
                @click="scheduleStepToDay(goal, step, selectedDay)"
              >
                <span class="step-name">{{ step.title }}</span>
                <Plus :size="18" />
              </button>
            </template>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { useXpStore } from '../stores/xp'
import { 
  Calendar, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  CheckCircle,
  Clock,
  Plus,
  Target,
  Filter,
  Search,
  Flag,
  Trash2,
  AlertCircle,
  Sparkles,
  Zap,
  Brain,
  ListChecks,
  ListTodo,
  X,
  Square,
  CheckSquare,
  BarChart3
} from 'lucide-vue-next'

const store = useAppStore()
const xpStore = useXpStore()
const router = useRouter()

const weekOffset = ref(0)
const selectedDay = ref(null)
const filterSphere = ref('')
const filterStatus = ref('')
const showSphereDropdown = ref(false)
const showStatusDropdown = ref(false)
const addStepSearch = ref('')
const goalsDisplayLimit = ref(10)
const currentPage = ref(1)
const expandedGoals = ref({})
const infiniteScrollTrigger = ref(null)
let infiniteScrollObserver = null

const collapsedGoalGroups = ref(JSON.parse(localStorage.getItem('planning_collapsed_groups') || '{}'))
const overdueCollapsed = ref(false)

const showAIPlannerModal = ref(false)
const aiPlannerStep = ref('intro')
const aiPlannerIncludeOverdue = ref(true)
const aiPlannerLoading = ref(false)
const aiPlannerResult = ref(null)
const aiPlannerDontShowIntro = ref(localStorage.getItem('ai_planner_skip_intro') === 'true')
const aiPlannerDontShowCheck = ref(false)
const aiPlannerSelectedTasks = ref([])

function openAIPlannerModal() {
  aiPlannerDontShowCheck.value = aiPlannerDontShowIntro.value
  if (aiPlannerDontShowIntro.value) {
    showAIPlannerModal.value = true
    startAIPlanning()
  } else {
    showAIPlannerModal.value = true
    aiPlannerStep.value = 'intro'
  }
}

// Просроченные шаги (загружаются с бэкенда)
const overdueStepsData = ref([])
const totalOverdueSteps = ref(0)

// Преобразованные просроченные задачи для отображения
const overdueTasks = computed(() => {
  return overdueStepsData.value.map(step => ({
    id: `overdue-${step.step_id}`,
    goalId: step.goal_id,
    stepId: step.step_id,
    stepTitle: step.step_title,
    goalTitle: step.goal_title,
    goalCategory: step.goal_category,
    scheduledDate: step.step_dt,
    priority: priorityBackendToFrontend[step.step_priority] || step.step_priority || '',
    timeEstimate: timeDurationMap[step.step_time_duration] || step.step_time_duration || '',
    completed: step.step_is_complete || false
  }))
})

const overdueCompletedCount = computed(() => {
  return overdueTasks.value.filter(t => t.completed).length
})

function toggleGoalGroupCollapse(goalId) {
  collapsedGoalGroups.value[goalId] = !collapsedGoalGroups.value[goalId]
  localStorage.setItem('planning_collapsed_groups', JSON.stringify(collapsedGoalGroups.value))
}

function toggleOverdueCollapse() {
  overdueCollapsed.value = !overdueCollapsed.value
}

async function toggleOverdueTaskComplete(task) {
  if (!task) return
  
  const newCompleted = !task.completed
  
  // Находим оригинальные данные в overdueStepsData и обновляем
  const originalStep = overdueStepsData.value.find(s => s.step_id === task.stepId)
  if (originalStep) {
    originalStep.step_is_complete = newCompleted
  }
  
  if (newCompleted) {
    xpStore.addXP(10, 'step', `Выполнен шаг: ${task.stepTitle}`)
  }
  
  try {
    const { updateGoalSteps } = await import('@/services/api.js')
    await updateGoalSteps({
      goals_steps_data: [{
        goal_id: task.goalId,
        step_id: task.stepId,
        is_complete: newCompleted
      }]
    })
    
    // Синхронизируем данные в обоих блоках
    await Promise.all([
      loadWeeklySteps(),
      store.loadGoalsFromBackend({ page: 1 }, false)
    ])
  } catch (error) {
    console.error('[Planning] Error toggling overdue task complete:', error)
    // Откатываем изменение
    if (originalStep) {
      originalStep.step_is_complete = !newCompleted
    }
  }
}

function formatOverdueDate(dateStr) {
  const date = new Date(dateStr)
  const today = new Date()
  const diffDays = Math.floor((today - date) / (24 * 60 * 60 * 1000))
  
  if (diffDays === 1) return 'вчера'
  if (diffDays === 2) return '2 дня назад'
  if (diffDays <= 7) return `${diffDays} дн. назад`
  
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function closeAIPlannerModal() {
  showAIPlannerModal.value = false
  aiPlannerStep.value = 'intro'
  aiPlannerResult.value = null
  aiPlannerSelectedTasks.value = []
}

function goBackToIntro() {
  if (aiPlannerDontShowIntro.value) {
    closeAIPlannerModal()
  } else {
    aiPlannerStep.value = 'intro'
  }
}

const aiDayExpandState = ref({})

function isDayExpanded(date) {
  return aiDayExpandState.value[date] !== false
}

function toggleDayExpand(date) {
  aiDayExpandState.value[date] = !isDayExpanded(date)
}

function toggleTaskSelection(taskId) {
  const idx = aiPlannerSelectedTasks.value.indexOf(taskId)
  if (idx > -1) {
    aiPlannerSelectedTasks.value.splice(idx, 1)
  } else {
    aiPlannerSelectedTasks.value.push(taskId)
  }
}

function isTaskSelected(taskId) {
  return aiPlannerSelectedTasks.value.includes(taskId)
}

function getSelectedCountForDay(day) {
  return day.tasks.filter(t => aiPlannerSelectedTasks.value.includes(t.id)).length
}

async function startAIPlanning() {
  if (aiPlannerDontShowCheck.value) {
    localStorage.setItem('ai_planner_skip_intro', 'true')
    aiPlannerDontShowIntro.value = true
  } else {
    localStorage.removeItem('ai_planner_skip_intro')
    aiPlannerDontShowIntro.value = false
  }
  
  aiPlannerStep.value = 'loading'
  aiPlannerLoading.value = true
  
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const dayNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
  
  aiPlannerResult.value = {
    totalTasks: 12,
    days: weekDays.value.map((day, idx) => ({
      date: day.date,
      dayName: dayNames[idx],
      tasks: idx < 5 ? [
        { id: `mock-${idx}-1`, title: 'Проверить почту и ответить на важные письма' },
        { id: `mock-${idx}-2`, title: 'Сделать упражнения для спины' },
        ...(idx % 2 === 0 ? [{ id: `mock-${idx}-3`, title: 'Прочитать главу книги' }] : [])
      ] : []
    }))
  }
  
  const allTaskIds = aiPlannerResult.value.days.flatMap(d => d.tasks.map(t => t.id))
  aiPlannerSelectedTasks.value = [...allTaskIds]
  aiDayExpandState.value = {}
  
  aiPlannerLoading.value = false
  aiPlannerStep.value = 'result'
}

function applyAIPlan() {
  closeAIPlannerModal()
}

const showBottomSheet = ref(false)
const bottomSheetMode = ref('task')
const selectedTask = ref(null)
const selectedGoal = ref(null)
const selectedStep = ref(null)

// Буфер для отложенных изменений (сохраняем только по кнопке "Сохранить")
const pendingTaskChanges = ref({})
const originalTaskState = ref(null)

// Буфер для изменений шага из блока "Цели и шаги"
const pendingStepChanges = ref({})
const originalStepState = ref(null)

let touchTimer = null
const longPressDelay = 500

const priorities = [
  { value: 'critical', label: 'Критично' },
  { value: 'desirable', label: 'Важно' },
  { value: 'attention', label: 'В поле внимания' },
  { value: 'optional', label: 'По возможности' },
  { value: '', label: 'Без приоритета' }
]

const timeOptions = [
  { value: '30min', label: '30 минут' },
  { value: '1h', label: '1 час' },
  { value: '2h', label: '2 часа' },
  { value: '3h', label: '3 часа' },
  { value: '4h', label: '4 часа' },
  { value: '', label: 'Без оценки' }
]

function formatDateLocal(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const weekDays = computed(() => {
  const days = []
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset + (weekOffset.value * 7))
  monday.setHours(12, 0, 0, 0)
  
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  const fullNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    days.push({
      date: formatDateLocal(date),
      dayNum: date.getDate(),
      shortName: dayNames[i],
      label: fullNames[i],
      isWeekend: i >= 5
    })
  }
  return days
})

const isCurrentWeek = computed(() => weekOffset.value === 0)

const futureDays = computed(() => {
  const todayStr = formatDateLocal(new Date())
  return weekDays.value.filter(day => day.date >= todayStr)
})

const newStepDay = ref(null)
const newStepPriority = ref('')
const newStepTime = ref('')

const weekRangeText = computed(() => {
  if (weekDays.value.length < 7) return ''
  const start = new Date(weekDays.value[0].date)
  const end = new Date(weekDays.value[6].date)
  const options = { day: 'numeric', month: 'short' }
  return `${start.toLocaleDateString('ru-RU', options)} — ${end.toLocaleDateString('ru-RU', options)}`
})

const selectedDayTitle = computed(() => {
  if (!selectedDay.value) return ''
  const day = weekDays.value.find(d => d.date === selectedDay.value)
  if (!day) return ''
  const date = new Date(selectedDay.value)
  const monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
                      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  return `${day.label}, ${day.dayNum} ${monthNames[date.getMonth()]}`
})

function prevWeek() {
  weekOffset.value--
  loadWeeklySteps()
}

function nextWeek() {
  weekOffset.value++
  loadWeeklySteps()
}

function goToCurrentWeek() {
  weekOffset.value = 0
  loadWeeklySteps()
}

function selectDay(date) {
  selectedDay.value = date
}

function isToday(dateStr) {
  return dateStr === formatDateLocal(new Date())
}

function initSelectedDay() {
  const today = formatDateLocal(new Date())
  const todayInWeek = weekDays.value.find(d => d.date === today)
  selectedDay.value = todayInWeek ? todayInWeek.date : weekDays.value[0].date
}

const weeklyStepsData = ref([])
const weeklyStepsLoading = ref(false)
const localUpdateTrigger = ref(0)

function generateDemoWeeklySteps(days) {
  const demoGoals = [
    { id: 1, title: 'Здоровый образ жизни', category: 'health' },
    { id: 2, title: 'Карьерный рост', category: 'career' },
    { id: 3, title: 'Финансовая грамотность', category: 'finance' },
    { id: 4, title: 'Личное развитие', category: 'personal' }
  ]
  
  const demoSteps = [
    { goalIdx: 0, title: 'Сделать зарядку 15 минут', duration: 'half', priority: 'critical' },
    { goalIdx: 0, title: 'Прогулка на свежем воздухе', duration: 'one', priority: 'important' },
    { goalIdx: 0, title: 'Приготовить здоровый обед', duration: 'one', priority: 'attention' },
    { goalIdx: 1, title: 'Изучить новую технологию', duration: 'two', priority: 'critical' },
    { goalIdx: 1, title: 'Пройти урок онлайн-курса', duration: 'one', priority: 'important' },
    { goalIdx: 1, title: 'Написать статью для блога', duration: 'two', priority: 'attention' },
    { goalIdx: 2, title: 'Проверить бюджет за неделю', duration: 'half', priority: 'important' },
    { goalIdx: 2, title: 'Прочитать главу о инвестициях', duration: 'one', priority: 'optional' },
    { goalIdx: 3, title: 'Медитация 10 минут', duration: 'half', priority: 'critical' },
    { goalIdx: 3, title: 'Прочитать 20 страниц книги', duration: 'one', priority: 'attention' },
    { goalIdx: 3, title: 'Записать мысли в дневник', duration: 'half', priority: 'optional' }
  ]
  
  let stepId = 1
  return days.map((day, dayIdx) => {
    const tasksCount = dayIdx < 5 ? (dayIdx % 2 === 0 ? 4 : 3) : (dayIdx === 5 ? 2 : 1)
    const daySteps = []
    
    for (let i = 0; i < tasksCount; i++) {
      const stepData = demoSteps[(dayIdx * 2 + i) % demoSteps.length]
      const goal = demoGoals[stepData.goalIdx]
      daySteps.push({
        goal_id: goal.id,
        step_id: stepId++,
        step_title: stepData.title,
        goal_title: goal.title,
        goal_category: goal.category,
        step_dt: day.date,
        step_time_duration: stepData.duration,
        step_priority: stepData.priority,
        step_is_complete: Math.random() > 0.7,
        step_order: i + 1
      })
    }
    
    return { date: day.date, steps_data: daySteps }
  })
}

async function loadWeeklySteps() {
  if (weeklyStepsLoading.value) return
  
  await nextTick()
  
  const startDate = weekDays.value[0]?.date
  const endDate = weekDays.value[6]?.date
  
  if (!startDate || !endDate) {
    console.log('[Planning] Week dates not ready yet')
    return
  }
  
  weeklyStepsLoading.value = true
  
  try {
    const { getPlannedSteps } = await import('@/services/api.js')
    console.log('[Planning] Loading weekly steps for:', startDate, 'to', endDate)
    
    const response = await getPlannedSteps({ date_from: startDate, date_to: endDate })
    
    // API возвращает status: 'ok' и данные в data.result_week_data
    if (response.status === 'ok' && response.data?.result_week_data) {
      weeklyStepsData.value = response.data.result_week_data
      
      // Сохраняем просроченные шаги
      overdueStepsData.value = response.data.overdue_steps_data || []
      totalOverdueSteps.value = response.data.total_overdue_steps || 0
      
      console.log('[Planning] Loaded weekly steps from API:', response.data.result_week_data.length, 'days')
      console.log('[Planning] Overdue steps:', overdueStepsData.value.length)
    } else {
      console.log('[Planning] Using demo data (API returned error or no data)', response)
      weeklyStepsData.value = generateDemoWeeklySteps(weekDays.value)
      overdueStepsData.value = []
      totalOverdueSteps.value = 0
    }
  } catch (error) {
    console.error('[Planning] Error loading weekly steps, using demo data:', error)
    weeklyStepsData.value = generateDemoWeeklySteps(weekDays.value)
    overdueStepsData.value = []
    totalOverdueSteps.value = 0
  } finally {
    weeklyStepsLoading.value = false
  }
}

const timeDurationMap = { 'half': '30min', 'one': '1h', 'two': '2h', 'three': '3h', 'four': '4h' }
const timeDurationFrontendToBackend = { '30min': 'half', '1h': 'one', '2h': 'two', '3h': 'three', '4h': 'four' }
const priorityBackendToFrontend = { 'critical': 'critical', 'important': 'desirable', 'attention': 'attention', 'optional': 'optional' }
const priorityFrontendToBackend = { 'critical': 'critical', 'desirable': 'important', 'attention': 'attention', 'optional': 'optional' }
const priorityOrder = { critical: 0, important: 0, desirable: 1, attention: 2, optional: 3, '': 4 }

function getTasksForDay(dateStr) {
  // Триггер для реактивности при локальных изменениях
  void localUpdateTrigger.value
  
  const weekStart = weekDays.value[0]?.date
  const plan = store.weeklyPlans.find(p => p.weekStart === weekStart)
  const localTasks = plan?.scheduledTasks || []
  
  const dayData = weeklyStepsData.value.find(d => d.date === dateStr)
  if (dayData && dayData.steps_data && dayData.steps_data.length > 0) {
    return dayData.steps_data
      .map(step => {
        // Ищем локальные override-ы для этого шага
        const localOverride = localTasks.find(t => 
          (t.goalId === step.goal_id || t.goalId === String(step.goal_id)) &&
          (t.stepId === step.step_id || t.stepId === String(step.step_id))
        )
        
        // Бэкенд значения
        const backendTime = timeDurationMap[step.step_time_duration] || ''
        const backendPriority = priorityBackendToFrontend[step.step_priority] || step.step_priority || ''
        const backendCompleted = step.step_is_complete || false
        
        return {
          id: `backend-${step.step_id}`,
          goalId: step.goal_id,
          stepId: step.step_id,
          stepTitle: step.step_title,
          goalTitle: step.goal_title,
          goalCategory: step.goal_category,
          scheduledDate: step.step_dt,
          // Локальные override-ы имеют приоритет над бэкендом
          timeEstimate: localOverride?.timeEstimate ?? backendTime,
          priority: localOverride?.priority ?? backendPriority,
          completed: localOverride?.completed ?? backendCompleted,
          order: step.step_order
        }
      })
      .sort((a, b) => {
        const priorityA = priorityOrder[a.priority] ?? 4
        const priorityB = priorityOrder[b.priority] ?? 4
        return priorityA - priorityB
      })
  }
  
  // Если бэкенд данных нет, используем только локальные
  return localTasks
    .filter(t => t.scheduledDate === dateStr)
    .sort((a, b) => {
      const priorityA = priorityOrder[a.priority] ?? 4
      const priorityB = priorityOrder[b.priority] ?? 4
      return priorityA - priorityB
    })
}

function getTotalTimeForDay(dateStr) {
  const timeValues = { '30min': 30, '1h': 60, '2h': 120, '3h': 180, '4h': 240 }
  const tasks = getTasksForDay(dateStr)
  const totalMinutes = tasks.reduce((sum, task) => {
    return sum + (timeValues[task.timeEstimate] || 0)
  }, 0)
  
  if (totalMinutes === 0) return ''
  if (totalMinutes < 60) return `${totalMinutes}м`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes > 0 ? `${hours}ч ${minutes}м` : `${hours}ч`
}

function getGroupedTasksForDay(dateStr) {
  const tasks = getTasksForDay(dateStr)
  const groups = {}
  const timeValues = { '30min': 30, '1h': 60, '2h': 120, '3h': 180, '4h': 240 }
  
  for (const task of tasks) {
    const goalKey = task.goalId || task.goalTitle
    if (!groups[goalKey]) {
      groups[goalKey] = {
        goalId: task.goalId,
        goalTitle: task.goalTitle,
        goalCategory: task.goalCategory,
        tasks: [],
        totalMinutes: 0,
        completedCount: 0
      }
    }
    groups[goalKey].tasks.push(task)
    groups[goalKey].totalMinutes += timeValues[task.timeEstimate] || 0
    if (task.completed) groups[goalKey].completedCount++
  }
  
  return Object.values(groups).sort((a, b) => {
    const maxPriorityA = Math.min(...a.tasks.map(t => priorityOrder[t.priority] ?? 4))
    const maxPriorityB = Math.min(...b.tasks.map(t => priorityOrder[t.priority] ?? 4))
    return maxPriorityA - maxPriorityB
  })
}

function formatGroupTime(minutes) {
  if (minutes === 0) return ''
  if (minutes < 60) return `${minutes}м`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}ч ${mins}м` : `${hours}ч`
}

const weeklyTotalTasks = computed(() => {
  let total = 0
  for (const day of weekDays.value) {
    total += getTasksForDay(day.date).length
  }
  return total
})

const weeklyCompletedTasks = computed(() => {
  let completed = 0
  for (const day of weekDays.value) {
    completed += getTasksForDay(day.date).filter(t => t.completed).length
  }
  return completed
})

const weeklyTotalTime = computed(() => {
  const timeValues = { '30min': 30, '1h': 60, '2h': 120, '3h': 180, '4h': 240 }
  let totalMinutes = 0
  
  for (const day of weekDays.value) {
    for (const task of getTasksForDay(day.date)) {
      totalMinutes += timeValues[task.timeEstimate] || 0
    }
  }
  
  if (totalMinutes === 0) return ''
  if (totalMinutes < 60) return `${totalMinutes}м`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes > 0 ? `${hours}ч ${minutes}м` : `${hours}ч`
})

function formatTimeShort(time) {
  const labels = { '30min': '30м', '1h': '1ч', '2h': '2ч', '3h': '3ч', '4h': '4ч' }
  return labels[time] || time
}

const workingGoals = computed(() => store.goals || [])
const lifeSpheres = computed(() => store.lifeSpheres)

const goalsWithSteps = computed(() => {
  // Показываем все цели из пагинации (бэкенд уже отфильтровал)
  // Фильтруем только завершённые цели
  return workingGoals.value.filter(g => 
    g.status !== 'completed'
  )
})

const goalsWithoutStepsFromApi = computed(() => store.goalsApiData?.goalsWithoutSteps || { total: 0, goals: [] })

const goalsWithoutSteps = computed(() => {
  // Используем данные из API если они есть
  const apiData = goalsWithoutStepsFromApi.value
  if (apiData.goals && apiData.goals.length > 0) {
    return apiData.goals.map(g => ({
      id: g.goal_id,
      backendId: g.goal_id,
      text: g.title,
      title: g.title,
      sphereId: g.category,
      category: g.category
    }))
  }
  
  // Fallback: фильтруем локально
  return workingGoals.value.filter(g => 
    g.status !== 'completed' &&
    (!g.steps || g.steps.length === 0)
  )
})

const goalsWithoutStepsTotal = computed(() => {
  return goalsWithoutStepsFromApi.value.total || goalsWithoutSteps.value.length
})

const spheresWithGoals = computed(() => {
  const sphereCounts = {}
  for (const goal of goalsWithSteps.value) {
    const sphereId = goal.sphereId || goal.sphere_id
    if (!sphereCounts[sphereId]) {
      sphereCounts[sphereId] = 0
    }
    sphereCounts[sphereId]++
  }
  
  return lifeSpheres.value
    .filter(s => sphereCounts[s.id])
    .map(s => ({
      ...s,
      goalCount: sphereCounts[s.id]
    }))
})

const selectedSphereName = computed(() => {
  if (!filterSphere.value) return 'Все сферы'
  const sphere = spheresWithGoals.value.find(s => s.id === filterSphere.value)
  return sphere ? `${sphere.icon} ${sphere.name}` : 'Все сферы'
})

const selectedStatusName = computed(() => {
  if (filterStatus.value === 'unscheduled') return 'Незапл.'
  if (filterStatus.value === 'scheduled') return 'Запл.'
  return 'Все'
})

const filteredGoalsWithSteps = computed(() => {
  let filtered = goalsWithSteps.value
  
  if (filterSphere.value) {
    filtered = filtered.filter(g => (g.sphereId || g.sphere_id) === filterSphere.value)
  }
  
  if (filterStatus.value === 'unscheduled') {
    filtered = filtered.filter(g => getUnscheduledStepsCount(g) > 0)
  } else if (filterStatus.value === 'scheduled') {
    filtered = filtered.filter(g => getScheduledStepsCount(g) > 0)
  }
  
  return filtered
})

const paginatedGoals = computed(() => {
  // Используем все загруженные цели с текущей страницы (уже отфильтрованы бэкендом)
  // Для локальной фильтрации по статусу (scheduled/unscheduled) применяем дополнительный фильтр
  let goals = goalsWithSteps.value
  
  if (filterStatus.value === 'unscheduled') {
    goals = goals.filter(g => getUnscheduledStepsCount(g) > 0)
  } else if (filterStatus.value === 'scheduled') {
    goals = goals.filter(g => getScheduledStepsCount(g) > 0)
  }
  
  return goals
})

const hasMoreGoals = computed(() => {
  // Больше страниц для загрузки с бэкенда
  return currentPage.value < totalPages.value
})

// Пагинация из API
const goalsPagination = computed(() => store.goalsApiData?.pagination || { page: 1, totalPages: 1, totalItems: 0 })
const totalPages = computed(() => goalsPagination.value.totalPages || 1)
const totalGoalsItems = computed(() => goalsPagination.value.totalItems || 0)

// Функции пагинации
async function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  await loadGoalsWithFilters()
}

async function loadGoalsWithFilters() {
  const params = {
    score_filter: 'true',
    status_filter: 'work',
    with_steps_data: true,
    has_steps: true,
    page: currentPage.value,
    page_size: 10
  }
  
  // Добавляем фильтр по сфере если выбран
  if (filterSphere.value) {
    // Конвертируем из frontend формата в backend
    const categoryMap = {
      'welfare': 'welfare',
      'hobby': 'hobby', 
      'environment': 'environment',
      'health': 'health_sport',
      'work': 'work',
      'family': 'family'
    }
    params.category_filter = categoryMap[filterSphere.value] || filterSphere.value
  }
  
  await store.loadGoalsFromBackend(params)
}

// Watch для фильтров - при изменении делаем запрос к бэку
watch([filterSphere], async () => {
  currentPage.value = 1
  await loadGoalsWithFilters()
})

// Computed для номеров страниц пагинации
const paginationPages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages = []
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    
    for (let i = start; i <= end; i++) pages.push(i)
    
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }
  
  return pages
})

const goalsWithUnscheduledSteps = computed(() => {
  return goalsWithSteps.value.filter(g => 
    getUncompletedSteps(g).some(s => !isStepScheduled(g.id, s.id))
  )
})

function getUncompletedSteps(goal) {
  return (goal.steps || []).filter(s => !s.completed)
}

function getAllSteps(goal) {
  return goal.steps || []
}

function getFilteredSteps(goal) {
  // Показываем ВСЕ шаги, включая выполненные (они будут с визуальным отличием)
  let steps = getAllSteps(goal)
  
  if (filterStatus.value === 'unscheduled') {
    steps = steps.filter(s => !isStepScheduled(goal.id, s.id))
  } else if (filterStatus.value === 'scheduled') {
    steps = steps.filter(s => isStepScheduled(goal.id, s.id))
  }
  
  return steps
}

function getUnscheduledStepsFiltered(goal) {
  let steps = getUncompletedSteps(goal).filter(s => !isStepScheduled(goal.id, s.id))
  
  if (addStepSearch.value) {
    const query = addStepSearch.value.toLowerCase()
    steps = steps.filter(s => s.title?.toLowerCase().includes(query))
  }
  
  return steps
}

function getUnscheduledStepsCount(goal) {
  return getUncompletedSteps(goal).filter(s => !isStepScheduled(goal.id, s.id)).length
}

function getScheduledStepsCount(goal) {
  return getUncompletedSteps(goal).filter(s => isStepScheduled(goal.id, s.id)).length
}

function getSphereName(sphereId) {
  const sphere = lifeSpheres.value.find(s => s.id === sphereId)
  return sphere ? `${sphere.icon} ${sphere.name}` : ''
}

function isStepScheduled(goalId, stepId, step = null) {
  const goal = workingGoals.value.find(g => g.id === goalId || g.backendId === goalId)
  const stepObj = step || goal?.steps?.find(s => s.id === stepId || s.backendId === stepId)
  const backendGoalId = goal?.backendId || goalId
  const backendStepId = stepObj?.backendId || stepId
  
  for (const day of weeklyStepsData.value) {
    if (day.steps_data?.some(s => 
      (s.goal_id === goalId || s.goal_id === backendGoalId) && 
      (s.step_id === stepId || s.step_id === backendStepId)
    )) {
      return true
    }
  }
  
  const plan = store.weeklyPlans.find(p => p.weekStart === weekDays.value[0]?.date)
  if (plan?.scheduledTasks?.some(t => 
    (t.goalId === goalId || t.goalId === backendGoalId) && 
    (t.stepId === stepId || t.stepId === backendStepId)
  )) {
    return true
  }
  
  return !!stepObj?.date
}

function getScheduledDate(goalId, stepId, step = null) {
  const goal = workingGoals.value.find(g => g.id === goalId || g.backendId === goalId)
  const stepObj = step || goal?.steps?.find(s => s.id === stepId || s.backendId === stepId)
  const backendGoalId = goal?.backendId || goalId
  const backendStepId = stepObj?.backendId || stepId
  
  for (const day of weeklyStepsData.value) {
    const foundStep = day.steps_data?.find(s => 
      (s.goal_id === goalId || s.goal_id === backendGoalId) && 
      (s.step_id === stepId || s.step_id === backendStepId)
    )
    if (foundStep) return foundStep.step_dt
  }
  
  const plan = store.weeklyPlans.find(p => p.weekStart === weekDays.value[0]?.date)
  const task = plan?.scheduledTasks?.find(t => 
    (t.goalId === goalId || t.goalId === backendGoalId) && 
    (t.stepId === stepId || t.stepId === backendStepId)
  )
  if (task) return task.scheduledDate
  
  return stepObj?.date || ''
}

function getScheduledPriority(goalId, stepId, step = null) {
  void localUpdateTrigger.value
  
  const goal = workingGoals.value.find(g => g.id === goalId || g.backendId === goalId)
  const stepObj = step || goal?.steps?.find(s => s.id === stepId || s.backendId === stepId)
  const backendGoalId = goal?.backendId || goalId
  const backendStepId = stepObj?.backendId || stepId
  
  const plan = store.weeklyPlans.find(p => p.weekStart === weekDays.value[0]?.date)
  const localTask = plan?.scheduledTasks?.find(t => 
    (t.goalId === goalId || t.goalId === backendGoalId || t.goalId === String(goalId)) && 
    (t.stepId === stepId || t.stepId === backendStepId || t.stepId === String(stepId))
  )
  if (localTask?.priority) return localTask.priority
  
  for (const day of weeklyStepsData.value) {
    const foundStep = day.steps_data?.find(s => 
      (s.goal_id === goalId || s.goal_id === backendGoalId || s.goal_id === String(goalId)) && 
      (s.step_id === stepId || s.step_id === backendStepId || s.step_id === String(stepId))
    )
    if (foundStep) return priorityBackendToFrontend[foundStep.step_priority] || foundStep.step_priority || ''
  }
  
  return ''
}

function getScheduledTimeEstimate(goalId, stepId, step = null) {
  void localUpdateTrigger.value
  
  const goal = workingGoals.value.find(g => g.id === goalId || g.backendId === goalId)
  const stepObj = step || goal?.steps?.find(s => s.id === stepId || s.backendId === stepId)
  const backendGoalId = goal?.backendId || goalId
  const backendStepId = stepObj?.backendId || stepId
  
  const plan = store.weeklyPlans.find(p => p.weekStart === weekDays.value[0]?.date)
  const localTask = plan?.scheduledTasks?.find(t => 
    (t.goalId === goalId || t.goalId === backendGoalId || t.goalId === String(goalId)) && 
    (t.stepId === stepId || t.stepId === backendStepId || t.stepId === String(stepId))
  )
  if (localTask?.timeEstimate) return localTask.timeEstimate
  
  for (const day of weeklyStepsData.value) {
    const foundStep = day.steps_data?.find(s => 
      (s.goal_id === goalId || s.goal_id === backendGoalId || s.goal_id === String(goalId)) && 
      (s.step_id === stepId || s.step_id === backendStepId || s.step_id === String(stepId))
    )
    if (foundStep) return timeDurationMap[foundStep.step_time_duration] || foundStep.step_time_duration || ''
  }
  
  return stepObj?.timeEstimate || stepObj?.time_estimate || ''
}

function formatStepDate(goalId, stepId) {
  const dateStr = getScheduledDate(goalId, stepId)
  if (!dateStr) return ''
  
  const day = weekDays.value.find(d => d.date === dateStr)
  if (day) return day.shortName
  
  const date = new Date(dateStr)
  return `${date.getDate()}.${date.getMonth() + 1}`
}

function getPriorityShort(priority) {
  const labels = { 'critical': '!!!', 'desirable': '!!', 'attention': '!', 'optional': '○' }
  return labels[priority] || ''
}

function getPriorityIcon(priority) {
  const icons = { 'critical': '🔥', 'desirable': '⚡', 'attention': '👁', 'optional': '○' }
  return icons[priority] || ''
}

function getScheduledTime(goalId, stepId, step = null) {
  const goal = workingGoals.value.find(g => g.id === goalId || g.backendId === goalId)
  const stepObj = step || goal?.steps?.find(s => s.id === stepId || s.backendId === stepId)
  const backendGoalId = goal?.backendId || goalId
  const backendStepId = stepObj?.backendId || stepId
  
  const plan = store.weeklyPlans.find(p => p.weekStart === weekDays.value[0]?.date)
  const localTask = plan?.scheduledTasks?.find(t => 
    (t.goalId === goalId || t.goalId === backendGoalId || t.goalId === String(goalId)) && 
    (t.stepId === stepId || t.stepId === backendStepId || t.stepId === String(stepId))
  )
  if (localTask?.timeEstimate) return localTask.timeEstimate
  
  for (const day of weeklyStepsData.value) {
    const foundStep = day.steps_data?.find(s => 
      (s.goal_id === goalId || s.goal_id === backendGoalId || s.goal_id === String(goalId)) && 
      (s.step_id === stepId || s.step_id === backendStepId || s.step_id === String(stepId))
    )
    if (foundStep) {
      const backendTime = foundStep.step_time_duration || foundStep.time_estimate || ''
      return timeDurationMap[backendTime] || backendTime
    }
  }
  
  return ''
}

function toggleGoal(goalId) {
  expandedGoals.value[goalId] = !expandedGoals.value[goalId]
}

function clearFilters() {
  filterSphere.value = ''
  filterStatus.value = ''
}

function goToGoalsBank() {
  router.push('/app/goals-bank')
}

function goToDecomposition(goal) {
  // In dev mode use local-{id}, in prod use backendId
  const goalId = goal.backendId || `local-${goal.id}`
  router.push(`/app/goals/${goalId}`)
}

function goToGoalDetails(goal) {
  const goalId = goal.backendId || `local-${goal.id}`
  router.push(`/app/goals/${goalId}`)
}

function getSphereIcon(sphereId) {
  const sphere = lifeSpheres.value.find(s => s.id === sphereId)
  return sphere?.icon || '🎯'
}

function handleTouchStart(task, event) {
  touchTimer = setTimeout(() => {
    openTaskActions(task)
  }, longPressDelay)
}

function handleTouchEnd() {
  if (touchTimer) {
    clearTimeout(touchTimer)
    touchTimer = null
  }
}

function handleTouchMove() {
  if (touchTimer) {
    clearTimeout(touchTimer)
    touchTimer = null
  }
}

function openTaskActions(task) {
  // Сохраняем оригинальное состояние для возможности отмены
  originalTaskState.value = {
    scheduledDate: task.scheduledDate,
    priority: task.priority,
    timeEstimate: task.timeEstimate
  }
  // Сбрасываем буфер изменений
  pendingTaskChanges.value = {}
  
  selectedTask.value = task
  bottomSheetMode.value = 'task'
  showBottomSheet.value = true
}

function openStepActions(goal, step) {
  selectedGoal.value = goal
  selectedStep.value = step
  newStepDay.value = null
  newStepPriority.value = ''
  newStepTime.value = ''
  
  // Сохраняем оригинальное состояние для возможности отмены (для запланированных шагов)
  if (isStepScheduled(goal.id, step.id, step)) {
    originalStepState.value = {
      scheduledDate: getScheduledDate(goal.id, step.id, step),
      priority: getScheduledPriority(goal.id, step.id, step),
      timeEstimate: getScheduledTime(goal.id, step.id, step)
    }
  } else {
    originalStepState.value = null
  }
  // Сбрасываем буфер изменений
  pendingStepChanges.value = {}
  
  bottomSheetMode.value = 'step'
  showBottomSheet.value = true
}

function openRescheduleSheet() {
  bottomSheetMode.value = 'reschedule'
}

function openPrioritySheet() {
  bottomSheetMode.value = 'priority'
}

function openTimeSheet() {
  bottomSheetMode.value = 'time'
}

// Computed свойства для работы с шагами из блока "Цели и шаги"
const isSelectedStepScheduled = computed(() => {
  if (!selectedGoal.value || !selectedStep.value) return false
  return isStepScheduled(selectedGoal.value.id, selectedStep.value.id, selectedStep.value)
})

const getScheduledStepDate = computed(() => {
  if (!selectedGoal.value || !selectedStep.value) return null
  return getScheduledDate(selectedGoal.value.id, selectedStep.value.id, selectedStep.value) || null
})

const getScheduledStepPriority = computed(() => {
  void localUpdateTrigger.value
  
  if (!selectedGoal.value || !selectedStep.value) return null
  return getScheduledPriority(selectedGoal.value.id, selectedStep.value.id, selectedStep.value) || null
})

const getScheduledStepTime = computed(() => {
  void localUpdateTrigger.value
  
  if (!selectedGoal.value || !selectedStep.value) return null
  return getScheduledTimeEstimate(selectedGoal.value.id, selectedStep.value.id, selectedStep.value) || null
})

function formatScheduledDateLabel(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) return 'Сегодня'
  if (date.toDateString() === tomorrow.toDateString()) return 'Завтра'
  
  return date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })
}

function getPriorityLabel(priority) {
  const labels = {
    'critical': 'Критично',
    'desirable': 'Важно',
    'attention': 'В поле внимания',
    'optional': 'По возможности'
  }
  return labels[priority] || priority || ''
}

function formatTimeLabel(time) {
  const labels = {
    '30min': '30 мин',
    '1h': '1 час',
    '2h': '2 часа',
    '3h': '3 часа',
    '4h': '4 часа'
  }
  return labels[time] || time || ''
}


async function toggleStepComplete() {
  if (!selectedGoal.value || !selectedStep.value) return
  
  const goalId = selectedGoal.value.backendId || selectedGoal.value.id
  const stepId = selectedStep.value.backendId || selectedStep.value.id
  
  // Валидация
  const actualGoal = store.goals.find(g => g.backendId === goalId || g.id === goalId)
  if (actualGoal) {
    const stepExists = actualGoal.steps?.some(s => s.backendId === stepId || s.id === stepId)
    if (!stepExists) {
      console.warn('[Planning] Step not found, refreshing data:', { goalId, stepId })
      await store.loadGoalsFromBackend({ page: 1 }, false)
      await loadWeeklySteps()
      closeBottomSheet()
      return
    }
  }
  
  const newCompleted = !selectedStep.value.completed
  selectedStep.value.completed = newCompleted
  
  if (newCompleted) {
    xpStore.addXP(10, 'step', `Выполнен шаг: ${selectedStep.value.title}`)
  }
  
  try {
    const { updateGoalSteps } = await import('@/services/api.js')
    const result = await updateGoalSteps({
      goals_steps_data: [{
        goal_id: goalId,
        step_id: stepId,
        is_complete: newCompleted
      }]
    })
    
    if (result?.error_code === 'GOALS_STEPS_UPDATE__STEP_NOT_ACCESS') {
      await store.loadGoalsFromBackend({ page: 1 }, false)
    }
    
    await loadWeeklySteps()
    closeBottomSheet()
  } catch (error) {
    console.error('[Planning] Error toggling step complete:', error)
    selectedStep.value.completed = !newCompleted
    if (error?.response?.data?.error_code?.includes('STEP_NOT_ACCESS')) {
      await store.loadGoalsFromBackend({ page: 1 }, false)
      await loadWeeklySteps()
    }
  }
}

function quickToggleStepComplete(goal, step) {
  const goalId = goal.backendId || goal.id
  const stepId = step.backendId || step.id
  
  // Определяем текущее состояние
  const currentCompleted = step.completed || false
  const newCompleted = !currentCompleted
  
  console.log('[Planning] quickToggleStepComplete:', { goalId, stepId, currentCompleted, newCompleted })
  
  // Обновляем шаг в store.goals (напрямую - step это ссылка)
  step.completed = newCompleted
  console.log('[Planning] Updated step.completed =', newCompleted)
  
  // Обновляем в weeklyStepsData с принудительной реактивностью
  let dayIndex = -1
  let stepIndex = -1
  for (let i = 0; i < weeklyStepsData.value.length; i++) {
    const day = weeklyStepsData.value[i]
    if (day.steps_data) {
      const idx = day.steps_data.findIndex(s => s.step_id === stepId && s.goal_id === goalId)
      if (idx !== -1) {
        dayIndex = i
        stepIndex = idx
        break
      }
    }
  }
  
  if (dayIndex !== -1 && stepIndex !== -1) {
    const updatedDay = { ...weeklyStepsData.value[dayIndex] }
    updatedDay.steps_data = [...updatedDay.steps_data]
    updatedDay.steps_data[stepIndex] = { 
      ...updatedDay.steps_data[stepIndex], 
      step_is_complete: newCompleted 
    }
    weeklyStepsData.value = [
      ...weeklyStepsData.value.slice(0, dayIndex),
      updatedDay,
      ...weeklyStepsData.value.slice(dayIndex + 1)
    ]
    console.log('[Planning] Updated weeklyStepsData with new array')
  }
  
  // Триггер реактивности
  localUpdateTrigger.value++
  
  // XP за выполнение
  if (newCompleted) {
    xpStore.addXP(10, 'step', `Выполнен шаг: ${step.title}`)
  }
  
  // Отправляем запрос на бэкенд
  const originalStep = dayIndex !== -1 ? weeklyStepsData.value[dayIndex].steps_data[stepIndex] : null
  sendStepUpdateToBackend(goalId, stepId, newCompleted, originalStep, step)
}

function rescheduleStep(newDate) {
  if (!selectedGoal.value || !selectedStep.value) return
  
  // Обновляем локально для UI
  saveStepToLocalPlan(selectedGoal.value, selectedStep.value, newDate)
  
  // Записываем изменение в буфер (отправим по кнопке "Сохранить")
  pendingStepChanges.value.dt = newDate
}

function updateStepPriority(priority) {
  if (!selectedGoal.value || !selectedStep.value) return
  
  // Обновляем локально для UI
  updateStepInLocalPlan(selectedGoal.value, selectedStep.value, { priority })
  
  // Записываем изменение в буфер (отправим по кнопке "Сохранить")
  pendingStepChanges.value.priority = priorityFrontendToBackend[priority] || priority || null
}

function updateStepTime(time) {
  if (!selectedGoal.value || !selectedStep.value) return
  
  // Обновляем локально для UI
  updateStepInLocalPlan(selectedGoal.value, selectedStep.value, { timeEstimate: time })
  
  // Записываем изменение в буфер (отправим по кнопке "Сохранить")
  pendingStepChanges.value.time_duration = timeDurationFrontendToBackend[time] || time || null
}

async function saveStepChangesAndClose() {
  if (!selectedGoal.value || !selectedStep.value) {
    closeBottomSheet()
    return
  }
  
  const goalId = selectedGoal.value.backendId || selectedGoal.value.id
  const stepId = selectedStep.value.backendId || selectedStep.value.id
  
  // Проверяем есть ли изменения для отправки
  const hasChanges = Object.keys(pendingStepChanges.value).length > 0
  
  if (hasChanges) {
    // Валидация: проверяем что шаг существует
    const actualGoal = store.goals.find(g => g.backendId === goalId || g.id === goalId)
    if (actualGoal) {
      const stepExists = actualGoal.steps?.some(s => s.backendId === stepId || s.id === stepId)
      if (!stepExists) {
        console.warn('[Planning] Step not found, refreshing data:', { goalId, stepId })
        await store.loadGoalsFromBackend({ page: 1 }, false)
        await loadWeeklySteps()
        pendingStepChanges.value = {}
        originalStepState.value = null
        closeBottomSheet()
        return
      }
    }
    
    try {
      const { updateGoalSteps } = await import('@/services/api.js')
      
      // Формируем данные для API
      const stepData = {
        goal_id: goalId,
        step_id: stepId,
        ...pendingStepChanges.value
      }
      
      console.log('[Planning] Saving step changes:', stepData)
      
      const result = await updateGoalSteps({
        goals_steps_data: [stepData]
      })
      
      if (result?.error_code === 'GOALS_STEPS_UPDATE__STEP_NOT_ACCESS') {
        await store.loadGoalsFromBackend({ page: 1 }, false)
      }
      
      // Синхронизируем данные в обоих блоках
      await Promise.all([
        loadWeeklySteps(),                              // Таймлайн
        store.loadGoalsFromBackend({ page: 1 }, false)  // Цели и шаги
      ])
      
    } catch (error) {
      console.error('[Planning] Error saving step changes:', error)
      
      // При ошибке можно восстановить оригинальное состояние (опционально)
      if (error?.response?.data?.error_code?.includes('STEP_NOT_ACCESS')) {
        await Promise.all([
          loadWeeklySteps(),
          store.loadGoalsFromBackend({ page: 1 }, false)
        ])
      }
    }
  }
  
  // Сбрасываем буфер и закрываем
  pendingStepChanges.value = {}
  originalStepState.value = null
  closeBottomSheet()
}

async function removeStepFromSchedule() {
  if (!selectedGoal.value || !selectedStep.value) return
  
  const goalId = selectedGoal.value.backendId || selectedGoal.value.id
  const stepId = selectedStep.value.backendId || selectedStep.value.id
  
  // Валидация
  const actualGoal = store.goals.find(g => g.backendId === goalId || g.id === goalId)
  if (actualGoal) {
    const stepExists = actualGoal.steps?.some(s => s.backendId === stepId || s.id === stepId)
    if (!stepExists) {
      console.warn('[Planning] Step not found, refreshing data:', { goalId, stepId })
      await store.loadGoalsFromBackend({ page: 1 }, false)
      await loadWeeklySteps()
      closeBottomSheet()
      return
    }
  }
  
  // Сначала удаляем локально
  removeStepFromLocalPlan(selectedGoal.value, selectedStep.value)
  closeBottomSheet()
  
  try {
    const { updateGoalSteps } = await import('@/services/api.js')
    const result = await updateGoalSteps({
      goals_steps_data: [{
        goal_id: goalId,
        step_id: stepId,
        dt: null
      }]
    })
    
    if (result?.error_code === 'GOALS_STEPS_UPDATE__STEP_NOT_ACCESS') {
      await store.loadGoalsFromBackend({ page: 1 }, false)
    }
    
    await loadWeeklySteps()
  } catch (error) {
    console.error('[Planning] Error removing step from schedule:', error)
    if (error?.response?.data?.error_code?.includes('STEP_NOT_ACCESS')) {
      await store.loadGoalsFromBackend({ page: 1 }, false)
      await loadWeeklySteps()
    }
  }
}

function removeStepFromLocalPlan(goal, step) {
  const weekStart = weekDays.value[0]?.date
  if (!weekStart) return
  
  const plan = store.weeklyPlans.find(p => p.weekStart === weekStart)
  if (plan) {
    // Удалить по обоим вариантам ID
    plan.scheduledTasks = (plan.scheduledTasks || []).filter(
      t => !((t.goalId === goal.id || t.goalId === goal.backendId) && 
             (t.stepId === step.id || t.stepId === step.backendId))
    )
  }
  
  // Убрать дату из шага (в обеих коллекциях)
  updateStepDateInCollections(goal.id, step.id, null)
  
  store.saveToLocalStorage()
}

function updateStepInLocalPlan(goal, step, updates) {
  const weekStart = weekDays.value[0]?.date
  if (!weekStart) return
  
  const goalId = goal.backendId || goal.id
  const stepId = step.backendId || step.id
  
  let plan = store.weeklyPlans.find(p => p.weekStart === weekStart)
  if (!plan) {
    plan = { weekStart, scheduledTasks: [] }
    store.weeklyPlans.push(plan)
  }
  
  let task = plan.scheduledTasks.find(
    t => (t.goalId === goalId || t.goalId === goal.id || t.goalId === String(goalId)) && 
         (t.stepId === stepId || t.stepId === step.id || t.stepId === String(stepId))
  )
  
  if (!task) {
    // Создаём локальную запись если шаг пришёл с бэкенда
    task = {
      id: `local-${goalId}-${stepId}`,
      goalId: goalId,
      stepId: stepId,
      stepTitle: step.title,
      goalTitle: goal.text || goal.title,
      scheduledDate: step.date || getScheduledDate(goal.id, step.id, step),
      timeEstimate: step.timeEstimate || getScheduledTimeEstimate(goal.id, step.id, step) || '',
      priority: step.priority || getScheduledPriority(goal.id, step.id, step) || '',
      completed: step.completed || false
    }
    plan.scheduledTasks.push(task)
  }
  
  if (updates.priority !== undefined) task.priority = updates.priority
  if (updates.timeEstimate !== undefined) task.timeEstimate = updates.timeEstimate
  if (updates.completed !== undefined) task.completed = updates.completed
  
  // Триггерим реактивность для перерендера UI
  localUpdateTrigger.value++
  
  store.saveToLocalStorage()
}

function openAddStepModal() {
  addStepSearch.value = ''
  bottomSheetMode.value = 'add'
  showBottomSheet.value = true
}

function closeBottomSheet() {
  // При закрытии без сохранения - восстанавливаем оригинальное состояние для задач (таймлайн)
  if (selectedTask.value && originalTaskState.value && Object.keys(pendingTaskChanges.value).length > 0) {
    selectedTask.value.scheduledDate = originalTaskState.value.scheduledDate
    selectedTask.value.priority = originalTaskState.value.priority
    selectedTask.value.timeEstimate = originalTaskState.value.timeEstimate
  }
  
  // При закрытии без сохранения шагов - восстанавливаем их состояние
  // (локальные изменения уже применены, но мы должны перезагрузить данные)
  if (selectedStep.value && originalStepState.value && Object.keys(pendingStepChanges.value).length > 0) {
    // Нужно перезагрузить данные чтобы отменить локальные изменения
    loadWeeklySteps()
  }
  
  // Сбрасываем буферы
  pendingTaskChanges.value = {}
  originalTaskState.value = null
  pendingStepChanges.value = {}
  originalStepState.value = null
  
  showBottomSheet.value = false
  selectedTask.value = null
  selectedGoal.value = null
  selectedStep.value = null
}

function toggleTaskComplete(task) {
  if (!task) return
  
  const goalId = task.goalId
  const stepId = task.stepId
  
  // Находим день и индекс шага в weeklyStepsData
  let dayIndex = -1
  let stepIndex = -1
  for (let i = 0; i < weeklyStepsData.value.length; i++) {
    const day = weeklyStepsData.value[i]
    if (day.steps_data) {
      const idx = day.steps_data.findIndex(s => s.step_id === stepId && s.goal_id === goalId)
      if (idx !== -1) {
        dayIndex = i
        stepIndex = idx
        break
      }
    }
  }
  
  // Находим шаг в store.goals
  const goal = workingGoals.value.find(g => g.id === goalId || g.backendId === goalId)
  const storeStep = goal?.steps?.find(s => s.id === stepId || s.backendId === stepId)
  
  // Определяем текущее состояние
  const currentCompleted = dayIndex !== -1 
    ? weeklyStepsData.value[dayIndex].steps_data[stepIndex].step_is_complete 
    : (storeStep?.completed || false)
  const newCompleted = !currentCompleted
  
  console.log('[Planning] toggleTaskComplete:', { goalId, stepId, currentCompleted, newCompleted })
  
  // Обновляем в weeklyStepsData с принудительной реактивностью
  if (dayIndex !== -1 && stepIndex !== -1) {
    const updatedDay = { ...weeklyStepsData.value[dayIndex] }
    updatedDay.steps_data = [...updatedDay.steps_data]
    updatedDay.steps_data[stepIndex] = { 
      ...updatedDay.steps_data[stepIndex], 
      step_is_complete: newCompleted 
    }
    weeklyStepsData.value = [
      ...weeklyStepsData.value.slice(0, dayIndex),
      updatedDay,
      ...weeklyStepsData.value.slice(dayIndex + 1)
    ]
    console.log('[Planning] Updated weeklyStepsData with new array')
  }
  
  // Обновляем в store.goals
  if (storeStep) {
    storeStep.completed = newCompleted
    console.log('[Planning] Updated storeStep.completed =', newCompleted)
  }
  
  // Триггер реактивности
  localUpdateTrigger.value++
  
  // XP за выполнение
  if (newCompleted) {
    xpStore.addXP(10, 'step', `Выполнен шаг: ${task.stepTitle}`)
  }
  
  // Отправляем запрос на бэкенд
  const originalStep = dayIndex !== -1 ? weeklyStepsData.value[dayIndex].steps_data[stepIndex] : null
  sendStepUpdateToBackend(goalId, stepId, newCompleted, originalStep, storeStep)
}

async function sendStepUpdateToBackend(goalId, stepId, newCompleted, originalStep, storeStep) {
  try {
    const { updateGoalSteps } = await import('@/services/api.js')
    console.log('[Planning] Sending updateGoalSteps:', { goalId, stepId, is_complete: newCompleted })
    
    await updateGoalSteps({
      goals_steps_data: [{
        goal_id: goalId,
        step_id: stepId,
        is_complete: newCompleted
      }]
    })
    console.log('[Planning] updateGoalSteps SUCCESS')
  } catch (error) {
    console.error('[Planning] updateGoalSteps ERROR:', error)
    // Откатываем изменения
    if (originalStep) {
      originalStep.step_is_complete = !newCompleted
    }
    if (storeStep) {
      storeStep.completed = !newCompleted
    }
    localUpdateTrigger.value++
  }
}

function rescheduleTask(task, newDate, skipClose = false) {
  if (!task) return
  
  // Обновляем локальное состояние для UI
  task.scheduledDate = newDate
  
  // Записываем изменение в буфер (отправим по кнопке "Сохранить")
  pendingTaskChanges.value.dt = newDate
}

function updateTaskPriority(task, priority, skipClose = false) {
  if (!task) return
  
  // Обновляем локальное состояние для UI
  task.priority = priority
  
  // Записываем изменение в буфер (отправим по кнопке "Сохранить")
  pendingTaskChanges.value.priority = priorityFrontendToBackend[priority] || priority || null
}

function updateTaskTime(task, time, skipClose = false) {
  if (!task) return
  
  const timeMap = { '30min': 'half', '1h': 'one', '2h': 'two', '3h': 'three', '4h': 'four' }
  
  // Обновляем локальное состояние для UI
  task.timeEstimate = time
  
  // Записываем изменение в буфер (отправим по кнопке "Сохранить")
  pendingTaskChanges.value.time_duration = timeMap[time] || null
}

async function saveTaskChangesAndClose() {
  const task = selectedTask.value
  if (!task) {
    closeBottomSheet()
    return
  }
  
  // Проверяем есть ли изменения для отправки
  const hasChanges = Object.keys(pendingTaskChanges.value).length > 0
  
  if (hasChanges) {
    try {
      const { updateGoalSteps } = await import('@/services/api.js')
      
      // Формируем данные для API
      const stepData = {
        goal_id: task.goalId,
        step_id: task.stepId,
        ...pendingTaskChanges.value
      }
      
      console.log('[Planning] Saving task changes:', stepData)
      
      await updateGoalSteps({
        goals_steps_data: [stepData]
      })
      
      // Синхронизируем данные в обоих блоках
      await Promise.all([
        loadWeeklySteps(),                              // Таймлайн
        store.loadGoalsFromBackend({ page: 1 }, false)  // Цели и шаги
      ])
      
    } catch (error) {
      console.error('[Planning] Error saving task changes:', error)
      
      // При ошибке восстанавливаем оригинальное состояние
      if (originalTaskState.value && task) {
        task.scheduledDate = originalTaskState.value.scheduledDate
        task.priority = originalTaskState.value.priority
        task.timeEstimate = originalTaskState.value.timeEstimate
      }
    }
  }
  
  // Сбрасываем буфер и закрываем
  pendingTaskChanges.value = {}
  originalTaskState.value = null
  closeBottomSheet()
}

async function removeTaskFromSchedule(task) {
  if (!task) return
  
  const goalId = task.goalId
  const stepId = task.stepId
  
  // Валидация: проверяем что шаг существует
  const actualGoal = store.goals.find(g => g.backendId === goalId || g.id === goalId)
  if (actualGoal) {
    const stepExists = actualGoal.steps?.some(s => s.backendId === stepId || s.id === stepId)
    if (!stepExists) {
      console.warn('[Planning] Step not found, refreshing data:', { goalId, stepId })
      await store.loadGoalsFromBackend({ page: 1 }, false)
      await loadWeeklySteps()
      return
    }
  }
  
  try {
    const { updateGoalSteps } = await import('@/services/api.js')
    const result = await updateGoalSteps({
      goals_steps_data: [{
        goal_id: goalId,
        step_id: stepId,
        dt: '1700-01-01'
      }]
    })
    
    if (result?.error_code === 'GOALS_STEPS_UPDATE__STEP_NOT_ACCESS') {
      await store.loadGoalsFromBackend({ page: 1 }, false)
    }
    
    // Синхронизируем данные в обоих блоках
    await Promise.all([
      loadWeeklySteps(),                              // Таймлайн
      store.loadGoalsFromBackend({ page: 1 }, false)  // Цели и шаги
    ])
  } catch (error) {
    console.error('[Planning] Error removing task from schedule:', error)
    if (error?.response?.data?.error_code?.includes('STEP_NOT_ACCESS')) {
      await Promise.all([
        loadWeeklySteps(),
        store.loadGoalsFromBackend({ page: 1 }, false)
      ])
    }
  }
}

async function scheduleStepToDay(goal, step, date) {
  if (!goal || !step || !date) return
  
  const { DEBUG_MODE } = await import('@/config/settings.js')
  
  // Валидация: проверяем что шаг существует в актуальных данных цели
  const goalId = goal.backendId || goal.id
  const stepId = step.backendId || step.id
  const actualGoal = store.goals.find(g => g.backendId === goalId || g.id === goalId)
  
  if (actualGoal) {
    const stepExists = actualGoal.steps?.some(s => s.backendId === stepId || s.id === stepId)
    if (!stepExists) {
      console.warn('[Planning] Step not found in goal, refreshing data:', { goalId, stepId })
      await store.loadGoalsFromBackend({ page: 1 }, false)
      await loadWeeklySteps()
      return
    }
  }
  
  // Сначала обновляем локально для мгновенного отклика
  saveStepToLocalPlan(goal, step, date)
  closeBottomSheet()
  
  try {
    const { updateGoalSteps } = await import('@/services/api.js')
    const result = await updateGoalSteps({
      goals_steps_data: [{
        goal_id: goalId,
        step_id: stepId,
        dt: date
      }]
    })
    
    // Проверяем на ошибку step_not_access
    if (result?.error_code === 'GOALS_STEPS_UPDATE__STEP_NOT_ACCESS') {
      console.warn('[Planning] Step not accessible, refreshing data')
      await store.loadGoalsFromBackend({ page: 1 }, false)
    }
    
    // Синхронизируем данные в обоих блоках
    await Promise.all([
      loadWeeklySteps(),                              // Таймлайн
      store.loadGoalsFromBackend({ page: 1 }, false)  // Цели и шаги
    ])
  } catch (error) {
    console.error('[Planning] Error scheduling step:', error)
    // При ошибке доступа к шагу - обновляем данные
    if (error?.response?.data?.error_code?.includes('STEP_NOT_ACCESS')) {
      await Promise.all([
        loadWeeklySteps(),
        store.loadGoalsFromBackend({ page: 1 }, false)
      ])
    }
    // В DEV_MODE данные уже сохранены локально, всё ок
    if (DEBUG_MODE) {
      console.log('[Planning] DEV_MODE: Step saved locally')
    }
  }
}

async function scheduleNewStep() {
  if (!selectedGoal.value || !selectedStep.value || !newStepDay.value) return
  
  const goal = selectedGoal.value
  const step = selectedStep.value
  const date = newStepDay.value
  
  // Валидация: проверяем что шаг существует в актуальных данных цели
  const goalId = goal.backendId || goal.id
  const stepId = step.backendId || step.id
  const actualGoal = store.goals.find(g => g.backendId === goalId || g.id === goalId)
  
  if (actualGoal) {
    const stepExists = actualGoal.steps?.some(s => s.backendId === stepId || s.id === stepId)
    if (!stepExists) {
      console.warn('[Planning] Step not found in goal, refreshing data:', { goalId, stepId })
      await store.loadGoalsFromBackend({ page: 1 }, false)
      await loadWeeklySteps()
      return
    }
  }
  
  // Сохраняем с приоритетом и временем
  saveStepToLocalPlan(goal, step, date)
  
  // Обновляем приоритет и время если заданы
  if (newStepPriority.value || newStepTime.value) {
    updateStepInLocalPlan(goal, step, { 
      priority: newStepPriority.value, 
      timeEstimate: newStepTime.value 
    })
  }
  
  closeBottomSheet()
  
  try {
    const { updateGoalSteps } = await import('@/services/api.js')
    const result = await updateGoalSteps({
      goals_steps_data: [{
        goal_id: goalId,
        step_id: stepId,
        dt: date,
        priority: newStepPriority.value || undefined,
        time_estimate: newStepTime.value || undefined
      }]
    })
    
    // Проверяем на ошибку step_not_access
    if (result?.error_code === 'GOALS_STEPS_UPDATE__STEP_NOT_ACCESS') {
      console.warn('[Planning] Step not accessible, refreshing data')
      await store.loadGoalsFromBackend({ page: 1 }, false)
    }
    
    // Синхронизируем данные в обоих блоках
    await Promise.all([
      loadWeeklySteps(),                              // Таймлайн
      store.loadGoalsFromBackend({ page: 1 }, false)  // Цели и шаги
    ])
  } catch (error) {
    console.error('[Planning] Error scheduling new step:', error)
    if (error?.response?.data?.error_code?.includes('STEP_NOT_ACCESS')) {
      await Promise.all([
        loadWeeklySteps(),
        store.loadGoalsFromBackend({ page: 1 }, false)
      ])
    }
  }
}

function saveStepToLocalPlan(goal, step, date) {
  const weekStart = weekDays.value[0]?.date
  if (!weekStart) return
  
  // Использовать универсальные ключи
  const goalKey = goal.backendId || goal.id
  const stepKey = step.backendId || step.id
  
  // Найти или создать план на неделю
  let plan = store.weeklyPlans.find(p => p.weekStart === weekStart)
  if (!plan) {
    plan = { weekStart, scheduledTasks: [] }
    store.weeklyPlans.push(plan)
  }
  
  // Найти существующую запись для сохранения текущих значений времени/приоритета
  const existingTask = plan.scheduledTasks?.find(
    t => (t.goalId === goal.id || t.goalId === goal.backendId || t.goalId === goalKey) && 
         (t.stepId === step.id || t.stepId === step.backendId || t.stepId === stepKey)
  )
  
  // Получить текущие значения из существующей записи или из бэкенд данных
  const currentTime = existingTask?.timeEstimate || step.timeEstimate || getScheduledTimeEstimate(goal.id, step.id, step) || ''
  const currentPriority = existingTask?.priority || step.priority || getScheduledPriority(goal.id, step.id, step) || ''
  
  // Удалить старую запись этого шага если есть (проверяем все варианты ID)
  plan.scheduledTasks = (plan.scheduledTasks || []).filter(
    t => !((t.goalId === goal.id || t.goalId === goal.backendId || t.goalId === goalKey) && 
           (t.stepId === step.id || t.stepId === step.backendId || t.stepId === stepKey))
  )
  
  // Добавить новую задачу с сохранением текущих значений
  plan.scheduledTasks.push({
    id: `local-${goalKey}-${stepKey}`,
    goalId: goalKey,
    stepId: stepKey,
    stepTitle: step.title,
    goalTitle: goal.text || goal.title,
    scheduledDate: date,
    timeEstimate: currentTime,
    priority: currentPriority,
    completed: step.completed || false
  })
  
  // Обновить дату в шаге для isStepScheduled (в обеих коллекциях)
  updateStepDateInCollections(goal.id, step.id, date)
  
  // Триггерим реактивность для перерендера UI
  localUpdateTrigger.value++
  
  // Сохранить в localStorage
  store.saveToLocalStorage()
}

function updateStepDateInCollections(goalId, stepId, date) {
  const goal = workingGoals.value.find(g => g.id === goalId || g.backendId === goalId)
  if (goal) {
    const step = goal.steps?.find(s => s.id === stepId || s.backendId === stepId)
    if (step) step.date = date
  }
}

function quickScheduleStep(goal, step) {
  selectedGoal.value = goal
  selectedStep.value = step
  bottomSheetMode.value = 'step'
  showBottomSheet.value = true
}

async function loadMoreGoals() {
  if (hasMoreGoals.value) {
    currentPage.value++
    await loadGoalsWithFilters()
  }
}

function setupInfiniteScroll() {
  if (infiniteScrollObserver) {
    infiniteScrollObserver.disconnect()
  }
  
  infiniteScrollObserver = new IntersectionObserver((entries) => {
    const entry = entries[0]
    if (entry.isIntersecting && hasMoreGoals.value) {
      loadMoreGoals()
    }
  }, {
    rootMargin: '100px'
  })
  
  watch(infiniteScrollTrigger, (el) => {
    if (el && infiniteScrollObserver) {
      infiniteScrollObserver.observe(el)
    }
  }, { immediate: true })
}

watch(weekOffset, () => {
  initSelectedDay()
})

function closeSphereDropdown(e) {
  if (!e.target.closest('.sphere-dropdown')) {
    showSphereDropdown.value = false
  }
}

onMounted(async () => {
  initSelectedDay()
  await Promise.all([
    loadWeeklySteps(),
    store.loadGoalsFromBackend({ score_filter: 'true', status_filter: 'work', with_steps_data: true, has_steps: true, page_size: 10 })
  ])
  setupInfiniteScroll()
  document.addEventListener('click', closeSphereDropdown)
  
  if (filteredGoalsWithSteps.value.length > 0) {
    expandedGoals.value[filteredGoalsWithSteps.value[0].id] = true
  }
})

onUnmounted(() => {
  if (infiniteScrollObserver) {
    infiniteScrollObserver.disconnect()
  }
  if (touchTimer) {
    clearTimeout(touchTimer)
  }
  document.removeEventListener('click', closeSphereDropdown)
})
</script>

<style scoped>
.planning-container {
  max-width: var(--content-width-narrow);
  margin: 0 auto;
  padding: var(--container-padding);
  padding-bottom: 100px;
}

.planning-header {
  margin-bottom: 1rem;
  text-align: center;
}

.planning-header-full {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 0.5rem;
}

.header-center {
  flex: 1;
  text-align: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-btn-edge {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg, white);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.nav-btn-edge:hover {
  background: var(--hover-bg, #f3f4f6);
  color: var(--text-primary);
}

.week-range-center {
  display: block;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9375rem;
}

.today-btn-inline {
  padding: 0.5rem 0.875rem;
  border-radius: 20px;
  border: none;
  background: var(--primary, #6366f1);
  color: white;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.today-btn-inline:hover {
  background: var(--primary-dark, #4f46e5);
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.ai-planner-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(34, 197, 94, 0.1));
  border: 1px solid #10b981;
  border-radius: 20px;
  color: #10b981;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.ai-planner-btn:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(34, 197, 94, 0.2));
  transform: translateY(-1px);
}

.ai-btn-text {
  display: none;
}

@media (min-width: 480px) {
  .ai-btn-text {
    display: inline;
  }
}

.week-navigation {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.week-navigation-wide {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 0.5rem 0;
}

.nav-btn-wide {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg, white);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn-wide:hover {
  background: var(--hover-bg, #f3f4f6);
  color: var(--text-primary);
}

.today-btn-floating {
  display: block;
  margin: 0.5rem auto 0;
  padding: 0.375rem 0.75rem;
  border-radius: 16px;
  border: 1px solid var(--primary, #6366f1);
  background: transparent;
  color: var(--primary, #6366f1);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
}

.today-btn-floating:hover {
  background: var(--primary, #6366f1);
  color: white;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: var(--hover-bg, #f3f4f6);
}

.week-range {
  flex: 1;
  text-align: center;
  font-weight: 500;
  color: var(--text-primary);
}

.today-btn {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid var(--primary, #6366f1);
  background: transparent;
  color: var(--primary, #6366f1);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.today-btn:hover {
  background: var(--primary, #6366f1);
  color: white;
}

.week-stats {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}

.week-stats::-webkit-scrollbar {
  display: none;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  white-space: nowrap;
}

.stat-value {
  font-weight: 600;
  color: var(--primary, #6366f1);
}

.stat-label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.week-bar {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}

.week-bar::-webkit-scrollbar {
  display: none;
}

.day-tab {
  flex: 1;
  min-width: 44px;
  padding: 0.5rem 0.25rem;
  border: none;
  border-radius: 12px;
  background: var(--card-bg);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s;
  position: relative;
}

.day-tab:hover {
  background: var(--hover-bg, #f3f4f6);
}

.day-tab.active {
  background: var(--primary, #6366f1);
  color: white;
}

.day-tab.today:not(.active) {
  border: 2px solid var(--primary, #6366f1);
}

.day-tab.weekend {
  opacity: 0.8;
}

.day-tab .day-name {
  font-size: 0.75rem;
  font-weight: 500;
}

.day-tab .day-num {
  font-size: 1rem;
  font-weight: 600;
}

.day-tab .task-count {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  background: var(--accent);
  color: white;
  font-size: 0.6875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-tab.active .task-count {
  background: white;
  color: var(--primary, #6366f1);
}

.day-content {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.day-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.day-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.day-time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: var(--bg-secondary, #f8fafc);
  border-radius: 8px;
  margin-bottom: 0.25rem;
}

.group-header.clickable {
  cursor: pointer;
  transition: background 0.2s;
}

.group-header.clickable:hover {
  background: var(--bg-tertiary, #e5e7eb);
}

.group-chevron {
  color: var(--text-secondary);
  flex-shrink: 0;
  transition: transform 0.2s;
}

.group-chevron.rotated {
  transform: rotate(90deg);
}

.group-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
}

.group-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.group-count {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.group-time {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.group-meta {
  margin-left: auto;
}

.group-tasks {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.task-group.collapsed .group-header {
  margin-bottom: 0;
}

.overdue-group {
  margin-top: 0.75rem;
}

.overdue-group .group-header {
  background: rgba(239, 68, 68, 0.05);
  border-left: 3px solid #ef4444;
}

.overdue-group .group-header:hover {
  background: rgba(239, 68, 68, 0.1);
}

.overdue-date {
  font-size: 0.75rem;
  color: #ef4444;
  font-weight: 500;
}

.task-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  padding-left: 0;
  background: var(--bg);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.priority-stripe {
  width: 4px;
  min-height: 100%;
  align-self: stretch;
  border-radius: 4px 0 0 4px;
  flex-shrink: 0;
}

.priority-stripe.priority-critical { background: var(--danger, #ef4444); }
.priority-stripe.priority-desirable { background: var(--warning, #f59e0b); }
.priority-stripe.priority-attention { background: var(--info, #3b82f6); }
.priority-stripe.priority-optional { background: var(--text-muted, #9ca3af); }
.priority-stripe.priority-none { background: #c7d2fe; }

.task-card:hover {
  background: var(--hover-bg, #f3f4f6);
}

.task-card.completed {
  opacity: 0.7;
  background: var(--bg-secondary, #f8fafc);
}

.task-card.completed .task-title {
  text-decoration: line-through;
  color: var(--text-tertiary, #94a3b8);
}

.task-checkbox {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.task-checkbox:hover {
  border-color: var(--primary, #6366f1);
}

.task-checkbox.completed {
  background: var(--success);
  border-color: var(--success);
  color: white;
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-title {
  display: block;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


.task-goal {
  display: block;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.time-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  background: var(--bg-secondary, #f3f4f6);
  border-radius: 10px;
  color: var(--text-secondary);
}

.time-badge svg {
  opacity: 0.7;
}

.priority-icon-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  min-width: 24px;
  height: 24px;
  border-radius: 6px;
  background: transparent;
}

.priority-icon-badge.priority-critical { 
  background: rgba(239, 68, 68, 0.15);
}
.priority-icon-badge.priority-desirable { 
  background: rgba(245, 158, 11, 0.15);
}
.priority-icon-badge.priority-attention { 
  background: rgba(59, 130, 246, 0.15);
}
.priority-icon-badge.priority-optional { 
  background: rgba(156, 163, 175, 0.15);
}
.priority-icon-badge.priority-none {
  background: rgba(199, 210, 254, 0.3);
  color: var(--text-muted, #9ca3af);
}

.time-badge.empty {
  opacity: 0.5;
}

.empty-day {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-secondary);
}

.empty-icon {
  color: var(--text-muted, #9ca3af);
  margin-bottom: 0.5rem;
}

.empty-day p {
  margin: 0.5rem 0 0.25rem;
  font-weight: 500;
}

.empty-hint {
  font-size: 0.875rem;
  color: var(--text-muted, #9ca3af);
}

.section-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0 1rem;
}

.section-divider::before,
.section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.section-divider span {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
}

.filters-row.compact {
  flex-wrap: nowrap;
  gap: 0.75rem;
}

.sphere-dropdown {
  position: relative;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg);
  color: var(--text-primary);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.dropdown-trigger:hover {
  border-color: var(--primary, #6366f1);
}

.sphere-dropdown.open .dropdown-trigger {
  border-color: var(--primary, #6366f1);
  background: var(--primary-light, rgba(99, 102, 241, 0.1));
}

.dropdown-arrow {
  transition: transform 0.2s;
}

.sphere-dropdown.open .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-count {
  font-size: 0.6875rem;
  padding: 0.125rem 0.375rem;
  background: var(--primary, #6366f1);
  color: white;
  border-radius: 10px;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 180px;
  background: var(--card-bg, white);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
}

.dropdown-item:hover {
  background: var(--hover-bg, #f3f4f6);
}

.dropdown-item.active {
  background: var(--primary-light, rgba(99, 102, 241, 0.1));
  color: var(--primary, #6366f1);
}

.item-count {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.dropdown-item.active .item-count {
  color: var(--primary, #6366f1);
}

.segmented-control {
  display: flex;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg);
}

.segment {
  padding: 0.5rem 0.75rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
  border-right: 1px solid var(--border-color, #e5e7eb);
}

.segment:last-child {
  border-right: none;
}

.segment:hover {
  background: var(--hover-bg, #f3f4f6);
}

.segment.active {
  background: var(--primary, #6366f1);
  color: white;
}

/* Responsive visibility */
.desktop-only {
  display: flex;
}

.mobile-only {
  display: none;
}

@media (max-width: 640px) {
  .desktop-only {
    display: none !important;
  }
  
  .mobile-only {
    display: flex !important;
  }
}

/* Status dropdown (mobile) */
.status-dropdown {
  position: relative;
}

.status-dropdown .dropdown-trigger {
  min-width: 80px;
}

/* AI button in filters row */
.filters-ai-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border-radius: 8px;
  border: 1px solid #10b981;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.filters-ai-btn:hover {
  background: rgba(16, 185, 129, 0.2);
}

.filters-ai-btn .ai-btn-text {
  margin-left: 0;
}

@media (max-width: 640px) {
  .filters-ai-btn {
    padding: 0.5rem;
    min-width: 36px;
    justify-content: center;
  }
  
  .filters-ai-btn .ai-btn-text {
    display: none;
  }
}

.chip {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.chip:hover {
  background: var(--hover-bg, #f3f4f6);
}

.chip.active {
  background: var(--primary, #6366f1);
  border-color: var(--primary, #6366f1);
  color: white;
}

.chip.small {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

.chip-count {
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.chip.active .chip-count {
  background: rgba(255, 255, 255, 0.2);
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.goal-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
}

.goal-header:hover {
  background: var(--hover-bg, #f3f4f6);
}

.goal-main {
  flex: 1;
  min-width: 0;
}

.goal-sphere-badge {
  display: inline-block;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.goal-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goal-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.steps-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: var(--bg);
  border-radius: 10px;
  color: var(--text-secondary);
}

.expand-icon {
  color: var(--text-muted, #9ca3af);
  transition: transform 0.2s;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.steps-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  padding: 0 1rem 1rem;
}

@media (min-width: 480px) {
  .steps-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.no-steps-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
  background: var(--bg);
  border-radius: 12px;
  border: 2px dashed var(--border-color, #e5e7eb);
}

.no-steps-icon {
  color: var(--text-muted, #9ca3af);
  margin-bottom: 0.75rem;
}

.no-steps-text {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 0.25rem;
}

.no-steps-hint {
  font-size: 0.85rem;
  color: var(--text-secondary, #6b7280);
  margin: 0 0 1rem;
}

.no-steps-state .btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.step-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.625rem;
  background: var(--bg);
  border-radius: 10px;
  border: 1px solid var(--border-color, #e5e7eb);
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  min-height: 44px;
  position: relative;
}

.step-checkbox {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--border-color, #d1d5db);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
}

.step-checkbox:hover {
  border-color: var(--primary, #6366f1);
  background: var(--primary-light, rgba(99, 102, 241, 0.1));
}

.step-checkbox.completed {
  background: var(--success, #10b981);
  border-color: var(--success, #10b981);
}

.step-title.completed {
  text-decoration: line-through;
  opacity: 0.6;
}

.step-card .priority-stripe {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 0 10px 10px 0;
}

.step-card:hover {
  background: var(--hover-bg, #f3f4f6);
}

.step-card.scheduled {
  background: var(--primary-light, rgba(99, 102, 241, 0.1));
}

.step-card.scheduled.priority-critical {
  background: rgba(239, 68, 68, 0.08);
}

.step-card.scheduled.priority-desirable {
  background: rgba(245, 158, 11, 0.08);
}

.step-card.scheduled.priority-attention {
  background: rgba(59, 130, 246, 0.08);
}

.step-card.completed {
  opacity: 0.7;
  background: var(--bg-tertiary, #f1f5f9);
}

.step-card.completed .step-title {
  text-decoration: line-through;
  color: var(--text-tertiary, #94a3b8);
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-title {
  display: block;
  font-size: 0.875rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.step-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.25rem;
  align-items: center;
}

.date-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  padding: 0.125rem 0.375rem;
  background: var(--primary, #6366f1);
  color: white;
  border-radius: 6px;
}

.date-badge svg {
  opacity: 0.8;
}

.priority-badge {
  font-size: 0.6875rem;
  padding: 0.125rem 0.375rem;
  border-radius: 6px;
}

.priority-badge.priority-critical { background: var(--danger, #ef4444); color: white; }
.priority-badge.priority-desirable { background: var(--warning, #f59e0b); color: white; }
.priority-badge.priority-attention { background: var(--info, #3b82f6); color: white; }
.priority-badge.priority-optional { background: var(--text-muted, #9ca3af); color: white; }
.priority-badge.priority-none { background: var(--border-color, #e5e7eb); color: var(--text-primary, #1f2937); }


.infinite-scroll-trigger {
  display: flex;
  justify-content: center;
  padding: 1.5rem;
}

.loading-spinner-small {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-color, #e5e7eb);
  border-top-color: var(--primary, #6366f1);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Пагинация */
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 0;
  margin-top: 1rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #1f2937);
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--bg-secondary, #f9fafb);
  border-color: var(--primary, #6366f1);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 0.25rem;
}

.pagination-page {
  min-width: 36px;
  height: 36px;
  padding: 0 0.5rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #1f2937);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-page:hover:not(:disabled):not(.active) {
  background: var(--bg-secondary, #f9fafb);
  border-color: var(--primary, #6366f1);
}

.pagination-page.active {
  background: var(--primary, #6366f1);
  border-color: var(--primary, #6366f1);
  color: #fff;
}

.pagination-page.dots {
  border: none;
  background: transparent;
  cursor: default;
}

.needs-decomposition-banner {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.banner-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.banner-icon {
  color: #d97706;
  flex-shrink: 0;
}

.banner-title {
  font-weight: 600;
  color: #92400e;
  font-size: 0.9375rem;
}

.banner-text {
  color: #a16207;
  font-size: 0.8125rem;
  margin: 0 0 0.75rem;
}

.banner-goals {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.banner-goal-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.banner-goal-item:hover {
  background: rgba(255, 255, 255, 0.9);
}

.goal-sphere-mini {
  font-size: 1rem;
  flex-shrink: 0;
}

.goal-title-mini {
  flex: 1;
  font-size: 0.875rem;
  color: #78350f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.go-icon {
  color: #d97706;
  flex-shrink: 0;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  margin-top: 0.75rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  color: var(--text-secondary);
}

.empty-state h3 {
  margin: 1rem 0 0.5rem;
  color: var(--text-primary);
}

.empty-state p {
  margin: 0 0 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: var(--primary, #6366f1);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.btn-outline:hover {
  background: var(--hover-bg, #f3f4f6);
}

.fab {
  position: fixed;
  bottom: 80px;
  right: 1rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary, #6366f1);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  transition: all 0.2s;
}

.fab:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
}

.ai-planner-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.ai-planner-modal {
  width: 100%;
  max-width: 480px;
  background: var(--card-bg, #fff);
  border-radius: 16px;
  overflow: hidden;
  animation: modalSlideUp 0.25s ease;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ai-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.ai-modal-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ai-modal-icon {
  color: #10b981;
}

.ai-modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.ai-modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 0.2s;
}

.ai-modal-close:hover {
  background: var(--bg-secondary, #f3f4f6);
}

.ai-modal-content {
  padding: 1.25rem;
}

.ai-intro-section {
  text-align: center;
  padding: 0.5rem 0 0;
}

.ai-intro-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-intro-icon svg {
  color: #10b981;
}

.ai-intro-title {
  margin: 0 0 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.ai-intro-description {
  margin: 0 0 1.25rem;
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.5;
  text-align: center;
}

.ai-feature-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  text-align: left;
}

.ai-feature-item {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 0.625rem 0.875rem;
  background: var(--bg-secondary, #f8fafc);
  border-radius: 10px;
}

.ai-feature-item svg {
  flex-shrink: 0;
  color: #10b981;
}

.ai-feature-item span {
  font-size: 0.9375rem;
  color: var(--text-primary);
}

.ai-start-btn {
  width: 100%;
  padding: 0.875rem 1.25rem !important;
  background: #10b981 !important;
  border: none !important;
  color: white !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  border-radius: 12px !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 1rem;
}

.ai-start-btn:hover {
  background: #059669 !important;
}

.dont-show-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.dont-show-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #10b981;
}

.ai-option-toggle {
  padding: 0.75rem;
  background: var(--bg-secondary, #f8fafc);
  border-radius: 8px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.toggle-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #10b981;
}

.toggle-text {
  font-size: 0.875rem;
  color: var(--text-primary);
}

.ai-modal-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
  margin-top: 1rem;
}

.ai-modal-actions .btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.ai-modal-actions .btn-outline {
  background: transparent;
  border: 1px solid var(--border-color, #e5e7eb);
  color: var(--text-secondary);
}

.ai-modal-actions .btn-outline:hover {
  background: var(--bg-secondary, #f3f4f6);
}

.ai-modal-actions .ai-btn {
  background: #10b981;
  border: none;
  color: white;
}

.ai-modal-actions .ai-btn:hover {
  background: #059669;
}

.ai-modal-actions .ai-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ai-loading-section {
  text-align: center;
  padding: 2rem 1rem;
}

.ai-loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--bg-secondary, #f3f4f6);
  border-top-color: #10b981;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.ai-loading-section p {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
}

.ai-loading-hint {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.ai-result-section {
  margin-bottom: 0.5rem;
}

.ai-result-summary {
  text-align: center;
  margin-bottom: 1.25rem;
}

.ai-result-summary h4 {
  margin: 0 0 0.25rem;
  font-size: 1.125rem;
  color: #10b981;
}

.ai-result-summary p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.ai-result-preview {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 280px;
  overflow-y: auto;
}

.ai-day-preview {
  padding: 0.75rem;
  background: var(--bg-secondary, #f8fafc);
  border-radius: 10px;
}

.ai-day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 0.125rem 0;
}

.ai-day-preview.collapsed .ai-day-header {
  margin-bottom: 0;
}

.ai-day-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ai-day-name {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.ai-day-count {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.ai-day-chevron {
  color: var(--text-secondary);
  transition: transform 0.2s;
}

.ai-day-chevron.rotated {
  transform: rotate(90deg);
}

.ai-day-tasks {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-top: 0.5rem;
}

.ai-task-preview {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.625rem;
  background: var(--card-bg, #fff);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.ai-task-preview:hover {
  background: var(--bg-secondary, #f1f5f9);
}

.ai-task-preview.selected .ai-task-checkbox {
  color: #10b981;
}

.ai-task-preview:not(.selected) .ai-task-checkbox {
  color: var(--text-tertiary, #9ca3af);
}

.ai-task-preview:not(.selected) .ai-task-title {
  color: var(--text-tertiary, #9ca3af);
  text-decoration: line-through;
}

.ai-task-checkbox {
  flex-shrink: 0;
}

.ai-task-title {
  font-size: 0.8125rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ai-result-title {
  margin: 0 0 0.25rem;
  font-size: 1.125rem;
  color: #10b981;
}

.ai-result-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.ai-more-tasks {
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 500;
}

.bottom-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.bottom-sheet {
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  background: var(--card-bg);
  border-radius: 16px;
  padding: 1rem 1rem 1.5rem;
  overflow-y: auto;
}

.sheet-handle {
  width: 40px;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  margin: 0 auto 1rem;
}

.sheet-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  color: var(--text-primary);
}

.sheet-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 1rem;
}

.sheet-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 0.75rem;
}

.step-info-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.info-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  background: var(--bg, #f3f4f6);
  border-radius: 20px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.info-badge svg {
  opacity: 0.7;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
}

.days-grid .sheet-action.day-option {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  min-height: 60px;
}

.days-grid .day-label {
  font-size: 0.875rem;
}

.days-grid .day-date {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.sheet-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sheet-actions-row {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.sheet-actions-row .sheet-action {
  flex: 1;
  justify-content: center;
  min-height: 44px;
  border-radius: 10px;
  font-weight: 500;
}

.sheet-action.primary {
  background: var(--primary-color, #6366f1);
  color: #fff;
}

.sheet-action.primary:hover {
  background: var(--primary-dark, #4f46e5);
}

.complete-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background: var(--bg-secondary, #f3f4f6);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  font-size: 0.95rem;
  color: var(--text-primary, #1f2937);
  cursor: pointer;
  transition: all 0.2s ease;
}

.complete-toggle-btn:hover {
  background: var(--bg-tertiary, #e5e7eb);
}

.complete-toggle-btn.completed {
  background: var(--success-bg, #dcfce7);
  border-color: var(--success-color, #22c55e);
  color: var(--success-color, #22c55e);
}

.inline-options-section {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.inline-options-section:last-of-type {
  border-bottom: none;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.option-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.chip {
  padding: 0.375rem 0.75rem;
  border-radius: 16px;
  border: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg);
  color: var(--text-primary);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.chip:hover {
  border-color: var(--primary, #6366f1);
  background: var(--primary-light, rgba(99, 102, 241, 0.1));
}

.chip.active {
  background: var(--primary, #6366f1);
  border-color: var(--primary, #6366f1);
  color: white;
}

.chip.priority-critical.active {
  background: var(--danger, #ef4444);
  border-color: var(--danger, #ef4444);
}

.chip.priority-desirable.active {
  background: var(--warning, #f59e0b);
  border-color: var(--warning, #f59e0b);
}

.chip.priority-attention.active {
  background: var(--info, #3b82f6);
  border-color: var(--info, #3b82f6);
}

.chip.priority-optional.active {
  background: var(--text-muted, #9ca3af);
  border-color: var(--text-muted, #9ca3af);
}

.sheet-action {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: none;
  background: transparent;
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.sheet-action:hover {
  background: var(--hover-bg, #f3f4f6);
}

.sheet-action.danger {
  color: var(--danger);
}

.sheet-action.primary {
  background: var(--primary, #6366f1);
  color: white;
  font-weight: 500;
}

.sheet-action.primary:hover {
  background: var(--primary-dark, #4f46e5);
}

.sheet-action.primary:disabled {
  background: var(--border-color, #e5e7eb);
  color: var(--text-muted, #9ca3af);
  cursor: not-allowed;
}

.chip.today {
  border-color: var(--primary, #6366f1);
}

.sheet-action.active {
  background: var(--primary-light, rgba(99, 102, 241, 0.1));
  color: var(--primary, #6366f1);
}

.sheet-action.day-option {
  justify-content: space-between;
}

.sheet-action.day-option.today {
  background: var(--primary-light, rgba(99, 102, 241, 0.1));
}

.day-label {
  font-weight: 500;
}

.day-date {
  color: var(--text-secondary);
}

.priority-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.priority-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.priority-indicator.priority-critical { background: var(--danger, #ef4444); }
.priority-indicator.priority-desirable { background: var(--warning, #f59e0b); }
.priority-indicator.priority-attention { background: var(--info, #3b82f6); }
.priority-indicator.priority-optional { background: var(--text-muted, #9ca3af); }
.priority-indicator.priority-none { background: var(--border-color, #e5e7eb); }

.add-step-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg);
  border-radius: 12px;
  margin-bottom: 1rem;
  color: var(--text-muted);
}

.add-step-search .search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: var(--text-primary);
  outline: none;
}

.add-step-list {
  max-height: 50vh;
  overflow-y: auto;
}

.add-goal-header {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.step-option {
  justify-content: space-between;
}

.step-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 767px) {
  .sheet-action {
    min-height: 52px;
    padding: 0.875rem 1rem;
    -webkit-tap-highlight-color: transparent;
  }
  
  .sheet-action:active {
    background: var(--hover-bg, #f3f4f6);
    transform: scale(0.98);
  }
  
  .days-grid {
    grid-template-columns: repeat(7, 1fr);
    gap: 0.35rem;
  }
  
  .days-grid .sheet-action.day-option {
    padding: 0.5rem 0.25rem;
    min-height: 50px;
  }
  
  .days-grid .day-label {
    font-size: 0.7rem;
  }
  
  .days-grid .day-date {
    font-size: 0.95rem;
  }
  
  .step-card {
    min-height: 48px;
    -webkit-tap-highlight-color: transparent;
  }
  
  .step-card:active {
    transform: scale(0.98);
    background: var(--hover-bg, #f3f4f6);
  }
  
}

@media (max-width: 768px) {
  .planning-header {
    padding-left: 3.5rem;
  }
}

@media (min-width: 768px) {
  .planning-container {
    padding: 1.5rem;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .week-bar {
    gap: 0.5rem;
  }
  
  .day-tab {
    min-width: 60px;
    padding: 0.75rem 0.5rem;
  }
  
  .day-tab .day-name {
    font-size: 0.8125rem;
  }
  
  .day-tab .day-num {
    font-size: 1.125rem;
  }
  
  .fab {
    bottom: 2rem;
    right: 2rem;
  }
  
  .bottom-sheet {
    border-radius: 20px;
    margin-bottom: 2rem;
  }
}

/* Dark theme overrides */
:root.dark .step-card {
  background: var(--card-bg);
  border-color: var(--border-color);
}

:root.dark .step-title {
  color: var(--text-primary);
}

:root.dark .step-meta {
  color: var(--text-secondary);
}

:root.dark .day-tab {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

:root.dark .day-tab.active {
  background: var(--primary-color);
  color: white;
}

:root.dark .day-tab:hover:not(.active) {
  background: var(--bg-hover);
}

:root.dark .priority-badge.priority-none {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

:root.dark .bottom-sheet {
  background: var(--bg-primary);
}

:root.dark .chip-filter {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

:root.dark .chip-filter.active {
  background: var(--primary-color);
  color: white;
}
</style>
