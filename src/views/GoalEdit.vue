<template>
  <div class="goal-edit-container">
    <!-- Toast уведомления -->
    <transition-group name="toast-slide" tag="div" class="toast-container">
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        class="toast"
        :class="toast.type"
      >
        <CheckCircle2 v-if="toast.type === 'success'" :size="16" />
        <AlertCircle v-else-if="toast.type === 'error'" :size="16" />
        <span>{{ toast.message }}</span>
      </div>
    </transition-group>


    <div v-if="showGoalLoading" class="loading-state card">
      <div class="loading-spinner"></div>
      <p>Загрузка цели...</p>
    </div>

    <div v-else-if="showGoalNotFound" class="empty-state card">
      <div class="empty-icon">
        <AlertCircle :size="48" />
      </div>
      <h3>Цель не найдена</h3>
      <p>Возможно, она была удалена или указан неверный адрес</p>
      <button class="btn btn-primary" @click="goBack">
        Вернуться к списку целей
      </button>
    </div>

    <div v-else class="edit-layout">
      <!-- Compact Sticky Header -->
      <header class="goal-header-compact">
        <div class="header-row">
          <button class="btn-back" @click="goBack" title="Назад">
            <ArrowLeft :size="20" />
          </button>
          <div class="header-title-section">
            <h1 class="header-goal-title">{{ goalForm.title || 'Без названия' }}</h1>
            <span class="header-sphere-badge" :style="{ '--sphere-color': getSphereColor(goalForm.sphereId) }">
              {{ getSphereNameOnly(goalForm.sphereId) }}
            </span>
          </div>
        </div>
        <div class="header-progress">
          <div class="progress-bar-wrapper">
            <div class="progress-bar-track">
              <div class="progress-bar-fill" :style="{ width: completionProgress + '%' }"></div>
            </div>
            <span class="progress-text-inline">{{ completedStepsCount }}/{{ totalStepsCount }}</span>
          </div>
        </div>
      </header>

      <!-- Collapsible Reflection Block -->
      <div class="goal-reflection-block" v-if="hasReflection">
        <button 
          class="reflection-toggle-btn"
          @click="showGoalReflection = !showGoalReflection"
        >
          <MessageSquare :size="16" />
          <span>Рефлексия</span>
          <ChevronDown :size="16" class="toggle-chevron" :class="{ rotated: showGoalReflection }" />
        </button>
        <transition name="slide">
          <div v-show="showGoalReflection" class="reflection-content">
            <div v-if="goalForm.whyImportant || goalForm.description" class="reflection-item">
              <label>Почему это важно?</label>
              <p>{{ goalForm.whyImportant || goalForm.description }}</p>
            </div>
            <div v-if="goalForm.why2" class="reflection-item">
              <label>Как это изменит жизнь?</label>
              <p>{{ goalForm.why2 }}</p>
            </div>
          </div>
        </transition>
      </div>

      <div class="main-content">
        <div class="card card-no-header">
          <!-- Combined Search + Filter Bar -->
          <div class="search-filter-bar">
            <div class="search-expandable" :class="{ expanded: showSearchInput }">
              <button 
                v-if="!showSearchInput" 
                class="search-icon-btn"
                @click="toggleSearch"
                title="Поиск"
              >
                <Search :size="18" />
              </button>
              <div v-else class="search-input-wrapper">
                <Search :size="16" class="search-icon" />
                <input 
                  ref="searchInputRef"
                  v-model="searchQuery"
                  type="text"
                  class="search-input"
                  placeholder="Поиск..."
                  @blur="onSearchBlur"
                />
                <button class="search-close-btn" @click="closeSearch">
                  <X :size="14" />
                </button>
              </div>
            </div>
            
            <div class="filter-chips-scroll">
              <div class="filter-chips-inner">
                <button 
                  class="filter-chip"
                  :class="{ active: filterStatus === '' }"
                  @click="filterStatus = ''"
                >
                  Все
                </button>
                <button 
                  class="filter-chip"
                  :class="{ active: filterStatus === 'pending' }"
                  @click="filterStatus = 'pending'"
                >
                  Активные
                </button>
                <button 
                  class="filter-chip"
                  :class="{ active: filterStatus === 'completed' }"
                  @click="filterStatus = 'completed'"
                >
                  Готовые
                </button>
              </div>
            </div>

            <button 
              class="btn-ai-steps-inline"
              :class="{ generating: isGeneratingSteps }"
              :disabled="isGeneratingSteps"
              @click="openAIConfirmModal"
              title="ИИ сгенерирует 3-7 шагов для достижения цели"
            >
              <Loader2 v-if="isGeneratingSteps" :size="16" class="spin" />
              <Sparkles v-else :size="16" />
              <span class="btn-ai-label">{{ isGeneratingSteps ? (aiStepsProgress.text || 'Генерация...') : 'Помощь от ментора' }}</span>
            </button>
          </div>

          <!-- Подсказка о drag/drop -->
          <div v-if="hasActiveFilters" class="drag-disabled-hint">
            Перетаскивание шагов отключено при активных фильтрах
          </div>

          <!-- Empty state когда нет шагов -->
          <div v-if="totalStepsCount === 0 && newSteps.length === 0" class="steps-empty-state">
            <div class="empty-icon-circle">
              <Target :size="32" />
            </div>
            <h3>Добавьте шаги декомпозиции</h3>
            <p>Разбейте цель на конкретные действия,<br>чтобы начать планирование</p>
            <div class="empty-state-actions">
              <button class="btn btn-primary" @click="openAddStepModal">
                <Plus :size="16" />
                Добавить первый шаг
              </button>
            </div>
          </div>

          <div 
            v-show="totalStepsCount > 0 || newSteps.length > 0"
            ref="stepsContainer"
            class="steps-section" 
            :class="{ 'has-scroll': hasMoreStepsToLoad || paginatedSteps.length > 6 }"
            :style="stepsContainerStyle"
            @dragover="handleContainerDragOver"
          >
            <div 
              v-for="(step, displayIndex) in paginatedSteps" 
              :key="step.id || displayIndex"
              class="step-card step-card-clickable step-card-expanded"
              :class="{ 
                dragging: isDragEnabled && dragIndex === getOriginalIndex(step),
                'drag-over': isDragEnabled && dragOverIndex === getOriginalIndex(step) && dragIndex !== getOriginalIndex(step),
                'step-completed': step.completed,
                'drag-disabled': !isDragEnabled,
                ['priority-' + step.priority]: step.priority && !step.completed
              }"
              :style="step.priority && !step.completed ? { '--priority-color': getPriorityColor(step.priority) } : {}"
              :draggable="isDragEnabled"
              @dragstart="isDragEnabled && handleDragStart(getOriginalIndex(step), $event)"
              @dragend="isDragEnabled && handleDragEnd()"
              @dragover="isDragEnabled && handleDragOver(getOriginalIndex(step), $event)"
              @drop="isDragEnabled && handleDrop(getOriginalIndex(step), $event)"
              @click="openEditStepModal(step, getOriginalIndex(step))"
            >
              <!-- Левая колонка: drag-handle -->
              <div class="step-actions-column">
                <div 
                  class="step-drag-handle" 
                  :class="{ disabled: !isDragEnabled }"
                  :title="isDragEnabled ? 'Перетащите для изменения порядка' : 'Перетаскивание отключено (активны фильтры или сортировка)'"
                >
                  <GripVertical :size="16" />
                </div>
              </div>

              <span class="step-number-badge">{{ getOriginalIndex(step) + 1 }}</span>
              
              <div class="step-main">
                <span class="step-title" :class="{ 'completed-text': step.completed }">
                  {{ step.title || `Шаг ${getOriginalIndex(step) + 1}` }}
                </span>
                <!-- Мета-строка: приоритет, время, дата -->
                <div class="step-meta" v-if="step.priority || step.timeEstimate || step.scheduledDate">
                  <span v-if="step.priority" class="step-meta-item priority-indicator" :class="'priority-' + step.priority">
                    <span class="priority-dot"></span>
                    {{ getPriorityLabel(step.priority) }}
                  </span>
                  <span v-if="step.timeEstimate" class="step-meta-item">
                    <Clock :size="12" />
                    {{ formatTimeEstimate(step.timeEstimate) }}
                  </span>
                  <span v-if="step.scheduledDate" class="step-meta-item">
                    <Calendar :size="12" />
                    {{ formatScheduledDate(step.scheduledDate) }}
                  </span>
                </div>
              </div>
              
              <!-- Шеврон - индикатор кликабельности -->
              <ChevronRight :size="18" class="step-chevron" />
              
              <!-- Чекбокс справа для быстрого выполнения -->
              <button 
                class="step-checkbox-btn"
                :class="{ checked: step.completed }"
                @click.stop="toggleStepComplete(step, getOriginalIndex(step))"
                :title="step.completed ? 'Отметить как невыполненный' : 'Отметить как выполненный'"
              >
                <CheckCircle v-if="step.completed" :size="22" />
                <Circle v-else :size="22" />
              </button>
            </div>
            
            <!-- Кнопка загрузить ещё (локальная пагинация) -->
            <div v-if="hasMoreSteps" class="load-more-steps">
              <button class="btn btn-secondary btn-sm" @click="loadMoreSteps">
                Показать ещё {{ remainingStepsCount }} шагов
              </button>
            </div>
            
            <!-- Кнопка загрузить ещё с бэкенда (если есть больше шагов) -->
            <div v-if="hasMoreStepsToLoad && !hasMoreSteps" class="load-more-steps">
              <button 
                class="btn btn-secondary btn-sm" 
                @click="loadMoreStepsFromBackend"
                :disabled="isLoadingSteps"
              >
                <template v-if="isLoadingSteps">Загрузка...</template>
                <template v-else>Загрузить ещё {{ remainingStepsToLoadCount }} шагов</template>
              </button>
            </div>

            <!-- Новые шаги (добавленные кнопкой, ещё не сохранённые) -->
            <template v-if="newSteps.length > 0">
              <div v-if="hasActiveFiltersOrSort" class="new-steps-warning">
                Новые шаги не отображаются в фильтрованном списке. Сбросьте фильтры чтобы увидеть их.
              </div>
              <div v-else class="new-steps-section">
                <div class="new-steps-divider">
                  <span>Новые шаги</span>
                </div>
                <div 
                  v-for="(step, newIndex) in newSteps" 
                  :key="step.id"
                  class="step-card new-step-card"
                  :class="{ 
                    'step-completed': step.completed,
                    ['priority-' + step.priority]: step.priority && !step.completed
                  }"
                  :style="step.priority && !step.completed ? { '--priority-color': getPriorityColor(step.priority) } : {}"
                  @focusout="handleNewStepFocusOut(step, $event)"
                >
                  <div class="new-step-content">
                    <!-- Поле ввода названия -->
                    <input 
                      type="text"
                      :value="step.title"
                      @input="updateStep(getOriginalIndex(step), 'title', $event.target.value)"
                      @keydown.enter="saveNewStep(step)"
                      class="step-input new-step-title-input"
                      :placeholder="'Введите название нового шага'"
                    />
                    
                    <!-- Нижняя строка: комментарий слева, кнопки справа -->
                    <div class="new-step-footer">
                      <!-- Комментарий (сворачиваемый) -->
                      <div class="step-comment-section collapsible">
                        <button 
                          v-if="!step.showComment && !step.comment"
                          class="btn-link add-comment-toggle"
                          @click="step.showComment = true"
                          type="button"
                        >
                          + Добавить комментарий
                        </button>
                        <textarea 
                          v-else
                          :value="step.comment || ''"
                          @input="handleCommentInput(getOriginalIndex(step), $event)"
                          class="step-comment-input"
                          :placeholder="'Комментарий к шагу'"
                          rows="2"
                        ></textarea>
                      </div>
                      
                      <!-- Кнопки действий -->
                      <div class="new-step-actions-row">
                        <button 
                          class="btn btn-primary btn-sm save-new-step-btn"
                          @click="saveNewStep(step)"
                          title="Добавить шаг"
                        >
                          <Check :size="14" />
                          Добавить
                        </button>
                        <button 
                          class="btn btn-ghost btn-sm delete-new-step-btn"
                          @click="removeStep(getOriginalIndex(step))"
                          title="Удалить"
                        >
                          <X :size="14" />
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Inline добавление шага (как в Remente) -->
            <div class="inline-add-step">
              <div class="inline-add-step-input-wrapper">
                <Plus :size="18" class="inline-add-icon" />
                <input 
                  ref="inlineStepInput"
                  v-model="inlineStepTitle"
                  type="text"
                  class="inline-add-step-input"
                  placeholder="Добавить шаг..."
                  @keydown.enter="addInlineStep"
                  @focus="inlineInputFocused = true"
                  @blur="inlineInputFocused = false"
                />
                <button 
                  v-if="inlineStepTitle.trim()"
                  class="inline-add-btn"
                  @click="addInlineStep"
                  title="Добавить"
                >
                  <Check :size="18" />
                </button>
              </div>
              
            </div>

          </div>

        </div>
      </div>
      
      <!-- Блок заметок -->
      <div class="mini-journal-section">
        <button class="mini-journal-toggle" @click="toggleMiniJournal">
          <BookOpen :size="18" />
          <span>Заметки</span>
          <span v-if="notesCountBadge" class="journal-count">{{ notesCountBadge }}</span>
          <ChevronDown :size="16" class="toggle-icon" :class="{ rotated: showMiniJournal }" />
        </button>

        <transition name="slide">
          <div v-if="showMiniJournal" class="mini-journal-content">

            <!-- Поиск -->
            <div v-if="totalNotesCount > 5" class="notes-search-bar">
              <div class="notes-search-expandable" :class="{ expanded: showNotesSearch }">
                <button
                  v-if="!showNotesSearch"
                  class="notes-search-toggle-btn"
                  @click="toggleNotesSearch"
                  title="Поиск по заметкам"
                >
                  <Search :size="16" />
                </button>
                <div v-else class="notes-search-input-wrapper">
                  <Search :size="14" class="search-icon" />
                  <input
                    ref="notesSearchInputRef"
                    v-model="notesSearchQuery"
                    type="text"
                    class="notes-search-input"
                    placeholder="Поиск..."
                    @input="onNotesSearchInput"
                    @blur="onNotesSearchBlur"
                  />
                  <button class="notes-search-close-btn" @click="closeNotesSearch">
                    <X :size="12" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Поле ввода новой заметки -->
            <div class="journal-input-wrapper">
              <textarea
                v-model="miniJournalEntry"
                class="journal-input"
                placeholder="Запишите мысли, прогресс или идеи..."
                rows="2"
                @keydown.ctrl.enter="addMiniJournalEntry"
                @keydown.meta.enter="addMiniJournalEntry"
              ></textarea>
              <button
                class="journal-add-btn"
                @click="addMiniJournalEntry"
                :disabled="!miniJournalEntry.trim()"
              >
                <Send :size="16" />
              </button>
            </div>

            <!-- Loader -->
            <div v-if="isLoadingNotes" class="notes-loading">
              <div class="loading-spinner-small"></div>
              <span>Загрузка заметок...</span>
            </div>

            <!-- Список заметок -->
            <div v-else-if="miniJournalEntries.length" class="journal-entries">
              <div
                v-for="entry in miniJournalEntries"
                :key="entry.note_id"
                class="journal-entry"
                :class="{ editing: editingNoteId === entry.note_id }"
              >
                <div class="entry-header">
                  <span class="entry-date">{{ formatJournalDate(entry.date_created) }}</span>
                  <div class="entry-actions">
                    <!-- Кнопка редактирования -->
                    <button
                      v-if="editingNoteId !== entry.note_id"
                      class="entry-edit"
                      @click="startEditingNote(entry)"
                      title="Редактировать"
                    >
                      <Edit2 :size="14" />
                    </button>
                    <!-- Кнопка удаления -->
                    <button
                      v-if="editingNoteId !== entry.note_id"
                      class="entry-delete"
                      @click="removeMiniJournalEntry(entry.note_id)"
                      title="Удалить"
                    >
                      <X :size="14" />
                    </button>
                  </div>
                </div>

                <!-- Режим просмотра -->
                <p v-if="editingNoteId !== entry.note_id" class="entry-text">{{ entry.text }}</p>

                <!-- Режим редактирования -->
                <div v-else class="entry-edit-mode">
                  <textarea
                    v-model="editingNoteText"
                    class="entry-edit-input"
                    rows="3"
                    @keydown.ctrl.enter="saveEditedNote(entry.note_id)"
                    @keydown.meta.enter="saveEditedNote(entry.note_id)"
                    @keydown.esc="cancelEditingNote"
                  ></textarea>
                  <div class="entry-edit-actions">
                    <button
                      class="btn-cancel-edit"
                      @click="cancelEditingNote"
                      :disabled="isSavingNote"
                    >
                      Отмена
                    </button>
                    <button
                      class="btn-save-edit"
                      @click="saveEditedNote(entry.note_id)"
                      :disabled="!editingNoteText.trim() || isSavingNote"
                    >
                      <Save :size="14" />
                      {{ isSavingNote ? 'Сохранение...' : 'Сохранить' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Пустое состояние -->
            <div v-else-if="!isLoadingNotes && hasActiveNotesFilters" class="journal-empty">
              <Search :size="24" />
              <p>Ничего не найдено</p>
              <button class="btn-clear-search" @click="closeNotesSearch">
                Очистить поиск
              </button>
            </div>

            <div v-else class="journal-empty">
              <Lightbulb :size="24" />
              <p>Записывайте идеи и прогресс по этой цели</p>
            </div>

            <!-- Пагинация -->
            <div v-if="totalNotesPages > 1" class="notes-pagination-bar">
              <button
                class="pagination-btn"
                :disabled="currentNotesPage === 1"
                @click="goToNotesPage(currentNotesPage - 1)"
              >
                <ChevronLeft :size="16" />
              </button>
              <button
                v-for="page in visibleNotesPages"
                :key="page"
                class="pagination-btn"
                :class="{ active: page === currentNotesPage, ellipsis: page === '...' }"
                :disabled="page === '...'"
                @click="page !== '...' && goToNotesPage(page)"
              >
                {{ page }}
              </button>
              <button
                class="pagination-btn"
                :disabled="currentNotesPage === totalNotesPages"
                @click="goToNotesPage(currentNotesPage + 1)"
              >
                <ChevronRight :size="16" />
              </button>
            </div>

          </div>
        </transition>
      </div>

      <!-- Кнопка "Запланировать шаги" -->
      <div class="plan-steps-section">
        <button class="plan-steps-btn" @click="goToPlanning">
          <Calendar :size="18" />
          <span>Запланировать</span>
          <span v-if="unscheduledStepsCount > 0" class="unscheduled-count">{{ unscheduledStepsCount }}</span>
        </button>
      </div>

    </div>

    <!-- Модальное окно подтверждения AI генерации -->
    <transition name="modal-fade">
      <div v-if="showAIConfirmModal" class="modal-overlay" @click.self="closeAIConfirmModal">
        <div class="ai-confirm-modal">
          <div class="ai-confirm-header">
            <div class="ai-confirm-icon">
              <Sparkles :size="24" />
            </div>
            <h3>Декомпозиция цели от ментора</h3>
            <button class="modal-close" @click="closeAIConfirmModal">
              <X :size="20" />
            </button>
          </div>
          <div class="ai-confirm-body">
            <p class="ai-confirm-description">
              ИИ-ментор проанализирует вашу цель и предложит <strong>3-7 конкретных шагов</strong> для её достижения.
            </p>
            <div class="ai-confirm-warning">
              <AlertCircle :size="18" />
              <div>
                <strong>Важно:</strong> Убедитесь, что название цели сформулировано чётко и понятно. Чем конкретнее цель — тем точнее будут шаги.
              </div>
            </div>
            <div class="ai-confirm-goal">
              <label>Ваша цель:</label>
              <p class="goal-title-preview">{{ goalForm.title || 'Без названия' }}</p>
            </div>
          </div>
          <div class="ai-confirm-footer">
            <button class="btn btn-secondary" @click="closeAIConfirmModal">
              Отмена
            </button>
            <button class="btn btn-primary" @click="confirmAndGenerateSteps">
              <Sparkles :size="16" />
              Запустить
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Модальное окно редактирования цели (унифицировано с GoalsBank) -->
    <transition name="modal-fade">
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="edit-modal edit-modal-redesigned">
          <div class="modal-header">
            <h3>
              <Edit2 :size="20" :stroke-width="2" class="modal-header-icon" />
              Редактирование цели
            </h3>
            <button class="modal-close" @click="closeEditModal">
              <X :size="20" :stroke-width="2" />
            </button>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions" v-if="editingGoal">
            <button 
              v-if="editingGoal.status === 'validated' && !isGoalInWork"
              class="quick-action-btn action-work"
              title="Взять цель в работу"
              @click="handleQuickTakeToWork"
            >
              <Play :size="16" />
              <span>В работу</span>
            </button>
            <button 
              v-if="isGoalInWork"
              class="quick-action-btn action-remove-work"
              title="Убрать из работы"
              @click="handleQuickRemoveFromWork"
            >
              <Pause :size="16" />
              <span>Убрать</span>
            </button>
            <button 
              v-if="isGoalInWork && !isGoalCompleted"
              class="quick-action-btn action-complete"
              title="Завершить цель"
              @click="handleQuickComplete"
            >
              <CheckCircle :size="16" />
              <span>Завершить</span>
            </button>
          </div>

          <!-- Tab Navigation (Simplified: 2 tabs) -->
          <div class="modal-tabs">
            <button 
              class="modal-tab" 
              :class="{ active: editModalTab === 'main' }"
              title="Цель"
              @click="editModalTab = 'main'"
            >
              <FileText :size="16" />
              <span>Цель</span>
            </button>
            <button 
              class="modal-tab" 
              :class="{ active: editModalTab === 'settings' }"
              title="Настройки"
              @click="editModalTab = 'settings'"
            >
              <Settings :size="16" />
              <span>Настройки</span>
            </button>
          </div>

          <div class="modal-body modal-body-tabs" v-if="editingGoal">
            <!-- Tab: Goal (merged Main + Motivation) -->
            <div v-show="editModalTab === 'main'" class="tab-content">
              <div class="form-group">
                <label class="form-label">Название цели</label>
                <input 
                  v-model="editingGoal.title"
                  type="text"
                  class="form-input form-input-large"
                  placeholder="Введите название цели"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Сфера жизни</label>
                <div class="sphere-select-grid sphere-grid-compact">
                  <button
                    v-for="sphere in lifeSpheres"
                    :key="sphere.id"
                    class="sphere-select-btn"
                    :class="{ active: editingGoal.sphereId === sphere.id }"
                    :style="{ '--sphere-color': getSphereColor(sphere.id) }"
                    @click="editingGoal.sphereId = sphere.id"
                  >
                    <component :is="getSphereIconComponent(sphere.id)" :size="18" :stroke-width="2" />
                    <span>{{ getSphereNameOnly(sphere.id) }}</span>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Почему это важно?</label>
                <textarea 
                  v-model="editingGoal.whyImportant"
                  class="form-textarea form-textarea-visible"
                  placeholder="Опишите, почему эта цель важна для вас..."
                  rows="2"
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Как это изменит жизнь?</label>
                <textarea 
                  v-model="editingGoal.why2"
                  class="form-textarea form-textarea-visible"
                  placeholder="Опишите ожидаемые изменения..."
                  rows="2"
                ></textarea>
              </div>
            </div>

            <!-- Tab: Settings (simplified Status) -->
            <div v-show="editModalTab === 'settings'" class="tab-content">
              <!-- Validation Section -->
              <div class="status-card">
                <div class="status-card-header">
                  <Shield :size="20" />
                  <span>Оценка цели</span>
                </div>
                <div class="validation-buttons-new">
                  <button 
                    class="btn-validation-new btn-confirm"
                    :class="{ active: editingGoal.status === 'validated' || goal?.status === 'validated' }"
                    @click="setValidationStatus(true)"
                  >
                    <CheckCircle :size="20" />
                    <span>Подтвердить</span>
                  </button>
                  <button 
                    class="btn-validation-new btn-reject"
                    :class="{ active: editingGoal.status === 'rejected' || goal?.status === 'rejected' }"
                    @click="setValidationStatus(false)"
                  >
                    <XCircle :size="20" />
                    <span>Отклонить</span>
                  </button>
                </div>
              </div>

              <!-- Progress (only if goal is in work) -->
              <div class="status-card" v-if="isGoalInWork">
                <div class="status-card-header">
                  <BarChart2 :size="20" />
                  <span>Прогресс</span>
                </div>
                <div class="progress-info">
                  <div class="progress-bar-container">
                    <div class="progress-bar-fill" :style="{ width: completionProgress + '%' }"></div>
                  </div>
                  <span class="progress-text">{{ completedStepsCount }}/{{ totalStepsCount }} шагов</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer modal-footer-redesigned modal-footer-with-delete">
            <button class="btn btn-danger-ghost" @click="deleteGoalFromModal">
              <Trash2 :size="16" />
            </button>
            <div class="modal-footer-actions">
              <button class="btn btn-secondary" @click="closeEditModal">
                Отмена
              </button>
              <button class="btn btn-primary" @click="saveEditModal">
                <Check :size="16" :stroke-width="2" />
                Сохранить
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Модальное окно добавления шага (мобильная версия) -->
    <transition name="modal-fade">
      <div v-if="showAddStepModal" class="modal-overlay" @click.self="closeAddStepModal">
        <div class="add-step-modal">
          <div class="modal-header">
            <h3>Новый шаг</h3>
            <button class="modal-close" @click="closeAddStepModal">
              <X :size="20" :stroke-width="2" />
            </button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Название шага</label>
              <input 
                v-model="newStepForm.title"
                type="text"
                class="form-input"
                placeholder="Введите название шага"
                ref="newStepTitleInput"
                @keydown.enter="saveStepFromModal"
              />
            </div>
            
            <div class="form-group">
              <button 
                v-if="!newStepForm.showComment && !newStepForm.comment"
                class="btn-link add-comment-toggle"
                @click="newStepForm.showComment = true"
                type="button"
              >
                + Добавить комментарий
              </button>
              <template v-else>
                <label class="form-label">Комментарий</label>
                <textarea 
                  v-model="newStepForm.comment"
                  class="form-input form-textarea"
                  placeholder="Комментарий к шагу (необязательно)"
                  rows="3"
                ></textarea>
              </template>
            </div>
          </div>
          
          <div class="modal-footer modal-footer-center">
            <button class="btn btn-primary" @click="saveStepFromModal">
              <Check :size="16" :stroke-width="2" />
              Добавить
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Bottom Sheet модалка редактирования шага (упрощённая) -->
    <transition name="bottom-sheet">
      <div v-if="showEditStepModal" class="bottom-sheet-overlay" @click.self="closeEditStepModal">
        <div class="bottom-sheet step-bottom-sheet step-bottom-sheet-simple">
          <div class="bottom-sheet-handle"></div>
          
          <div class="bottom-sheet-body">
            <div class="form-group">
              <label class="form-label">Название шага</label>
              <input 
                v-model="editStepForm.title"
                type="text"
                class="form-input"
                placeholder="Введите название шага"
                ref="editStepTitleInput"
              />
            </div>
            
            <button 
              v-if="!showCommentField && !editStepForm.comment"
              class="btn-link add-comment-btn"
              @click="showCommentField = true"
            >
              <Plus :size="14" />
              Добавить комментарий
            </button>
            
            <div v-if="showCommentField || editStepForm.comment" class="form-group">
              <label class="form-label">Комментарий</label>
              <textarea 
                v-model="editStepForm.comment"
                class="form-input form-textarea"
                placeholder="Дополнительные заметки..."
                rows="2"
              ></textarea>
            </div>

            <div class="step-params-row">
              <div 
                class="param-chip" 
                :class="{ 'has-value': editStepForm.timeEstimate }"
                @click="showTimeSelector = !showTimeSelector"
              >
                <Clock :size="18" />
                <span>{{ formatTimeEstimate(editStepForm.timeEstimate) || 'Время' }}</span>
              </div>
              <div 
                class="param-chip" 
                :class="{ 'has-value': editStepForm.scheduledDate }"
                @click="showDatePicker = !showDatePicker"
              >
                <Calendar :size="18" />
                <span>{{ formatParamDate(editStepForm.scheduledDate) || 'Дата' }}</span>
              </div>
              <div 
                class="param-chip priority-chip"
                :class="['priority-' + (editStepForm.priority || 'none'), { 'has-value': editStepForm.priority }]"
                @click="cyclePriority"
              >
                <span>{{ getPriorityLabel(editStepForm.priority) || 'Приоритет' }}</span>
              </div>
            </div>

            <div v-if="showTimeSelector" class="time-options-row">
              <button 
                v-for="time in timeOptions" 
                :key="time.value"
                class="time-chip"
                :class="{ active: editStepForm.timeEstimate === time.value }"
                @click="editStepForm.timeEstimate = time.value"
              >
                {{ time.label }}
              </button>
            </div>

            <div v-if="showDatePicker" class="param-input-group date-picker-row">
              <label>Дата</label>
              <input 
                v-model="editStepForm.scheduledDate"
                type="date"
                class="form-input"
              />
            </div>
          </div>
          
          <div class="bottom-sheet-footer step-footer-redesigned">
            <button 
              class="action-btn action-delete"
              @click="confirmDeleteStep"
            >
              <Trash2 :size="18" />
              <span>Удалить</span>
            </button>
            <button class="btn btn-primary btn-save" @click="saveEditStepModal">
              <Check :size="18" />
              <span>Сохранить</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Модальное окно подтверждения удаления шага -->
    <transition name="modal-fade">
      <div v-if="showDeleteStepConfirm" class="modal-overlay delete-confirm-overlay" @click.self="cancelDeleteStep">
        <div class="delete-confirm-modal">
          <div class="delete-confirm-icon">
            <Trash2 :size="28" />
          </div>
          <h3>Удалить шаг?</h3>
          <p>Шаг "{{ editStepForm.title || 'Без названия' }}" будет удалён. Это действие нельзя отменить.</p>
          <div class="delete-confirm-actions">
            <button class="btn btn-secondary" @click="cancelDeleteStep">
              Отмена
            </button>
            <button class="btn btn-danger" @click="executeDeleteStep">
              <Trash2 :size="16" />
              Удалить
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useAppStore } from '../stores/app'
import { useAITasksStore } from '../stores/aiTasks'
import { useXpStore } from '@/stores/xp'
import { useXPNotification } from '@/composables/useXPNotification.js'
import { DEBUG_MODE, SKIP_AUTH_CHECK } from '@/config/settings.js'
import { updateGoalSteps } from '@/services/api.js'
import {
  Trash2, Save, Plus, ArrowLeft, GripVertical, X, Edit2,
  Wallet, Palette, Users, Heart, Briefcase, HeartHandshake, Target,
  Square, CheckSquare, Search, CheckCircle2, AlertCircle,
  CheckCircle, XCircle, Check, Filter, Settings, Clock, Calendar, Circle,
  FileText, Lightbulb, Shield, BarChart2, Play, Pause, GitBranch,
  BookOpen, ChevronDown, ChevronRight, ChevronLeft, Send, MessageSquare, Wand2, Loader2, Sparkles
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useAppStore()
const aiTasksStore = useAITasksStore()
const xpStore = useXpStore()
const { showStepCompletedXP, showGoalCompletedXP, XP_AMOUNTS } = useXPNotification()

const lifeSpheres = computed(() => store.lifeSpheres)
const goals = computed(() => store.goals)

// route.params.id is now backendId from the URL (or local-{id} in dev mode)
const goalBackendId = computed(() => route.params.id)

// Check if this is a local id (dev mode)
const isLocalId = computed(() => goalBackendId.value?.startsWith('local-'))
const localGoalId = computed(() => isLocalId.value ? goalBackendId.value.replace('local-', '') : null)

// Local ref to store goal data loaded from API (when opening directly via URL)
const goalDataFromApi = ref(null)

// Find goal by backendId in store.goals or rawIdeas
const goal = computed(() => {
  // Dev mode: handle local ids
  if (DEBUG_MODE && SKIP_AUTH_CHECK && isLocalId.value) {
    // Find by local id in rawIdeas - return direct reference for reactivity
    const rawGoal = store.goalsBank.rawIdeas.find(g => g.id === localGoalId.value)
    if (rawGoal) {
      // Ensure steps array exists on rawGoal for reactivity
      if (!rawGoal.steps) rawGoal.steps = []
      // Return proxy object that reads from rawGoal but provides mapped property names
      // This maintains reactivity while providing consistent interface
      return {
        get id() { return rawGoal.id },
        get backendId() { return rawGoal.backendId },
        get title() { return rawGoal.title || rawGoal.text },
        get text() { return rawGoal.text || rawGoal.title },
        get description() { return rawGoal.description || rawGoal.why },
        get sphereId() { return rawGoal.category || rawGoal.sphereId },
        get category() { return rawGoal.category },
        get status() { return rawGoal.status },
        get steps() { return rawGoal.steps },
        set steps(val) { rawGoal.steps = val },
        get progress() { return rawGoal.progress || 0 },
        get source() { return 'goals-bank' },
        get sourceId() { return rawGoal.id },
        get whyImportant() { return rawGoal.whyImportant },
        get why2() { return rawGoal.why2 },
        _rawGoal: rawGoal
      }
    }
    // Also try in goals
    const foundGoal = goals.value.find(g => g.id === localGoalId.value)
    if (foundGoal) return foundGoal
    
    return null
  }
  
  // First try to find in goals by backendId
  let found = goals.value.find(g => g.backendId === goalBackendId.value || String(g.backendId) === goalBackendId.value)
  if (found) return found
  
  // Then try in rawIdeas
  const rawGoal = store.goalsBank.rawIdeas.find(g =>
    g.backendId === goalBackendId.value || String(g.backendId) === goalBackendId.value
  )
  if (rawGoal) {
    // Create a goal-like object from rawIdea for display
    return {
      id: rawGoal.id,
      backendId: rawGoal.backendId,
      title: rawGoal.title || rawGoal.text,
      description: rawGoal.description || rawGoal.why,
      sphereId: rawGoal.sphereId || rawGoal.category,
      status: rawGoal.status,
      steps: rawGoal.steps || [],
      source: 'goals-bank',
      sourceId: rawGoal.id,
      whyImportant: rawGoal.whyImportant,
      threeWhys: rawGoal.threeWhys
    }
  }

  // Finally, check if we loaded goal data from API (when opening directly via URL)
  if (goalDataFromApi.value &&
      (goalDataFromApi.value.backendId === goalBackendId.value ||
       String(goalDataFromApi.value.backendId) === goalBackendId.value)) {
    return goalDataFromApi.value
  }

  return null
})

const goalForm = ref({
  title: '',
  description: '',
  sphereId: '',
  mvp: '',
  steps: [],
  progress: 0
})

// Toast уведомления
const toasts = ref([])
let toastId = 0

function showToast(message, type = 'success') {
  const id = ++toastId
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3000)
}

// Модальное окно редактирования
const showEditModal = ref(false)
const editingGoal = ref(null)
const editModalTab = ref('main')

// Модальное окно подтверждения AI генерации
const showAIConfirmModal = ref(false)

function openAIConfirmModal() {
  showAIConfirmModal.value = true
}

function closeAIConfirmModal() {
  showAIConfirmModal.value = false
}

function confirmAndGenerateSteps() {
  closeAIConfirmModal()
  generateStepsAI()
}

// Quick Actions computed properties
const isGoalInWork = computed(() => {
  if (!goal.value) return false
  // Check if goal is transferred to active goals
  const transferred = store.goals.find(g => 
    (g.sourceId === goal.value.id || g.backendId === goal.value.backendId) && 
    g.source === 'goals-bank'
  )
  return !!transferred
})

const isGoalCompleted = computed(() => {
  if (!goal.value) return false
  return goal.value.status === 'completed'
})

// Quick Actions functions
async function handleQuickTakeToWork() {
  if (!editingGoal.value) return
  
  // Create transferred goal
  const newGoal = {
    id: Date.now().toString(),
    title: editingGoal.value.title || editingGoal.value.text,
    sphereId: editingGoal.value.sphereId,
    source: 'goals-bank',
    sourceId: goal.value?.id,
    backendId: goal.value?.backendId,
    status: 'active',
    steps: goalForm.value.steps || [],
    progress: 0,
    createdAt: new Date().toISOString()
  }
  
  store.addGoal(newGoal)
  showToast('Цель взята в работу')
  closeEditModal()
}

async function handleQuickRemoveFromWork() {
  if (!goal.value) return
  
  if (confirm('Убрать эту цель из работы?')) {
    const transferred = store.goals.find(g => 
      (g.sourceId === goal.value.id || g.backendId === goal.value.backendId) && 
      g.source === 'goals-bank'
    )
    if (transferred) {
      store.deleteGoal(transferred.id)
      showToast('Цель убрана из работы')
    }
    closeEditModal()
  }
}

async function handleQuickComplete() {
  if (!goal.value) return
  
  const transferred = store.goals.find(g => 
    (g.sourceId === goal.value.id || g.backendId === goal.value.backendId) && 
    g.source === 'goals-bank'
  )
  if (transferred) {
    store.updateGoal(transferred.id, { 
      status: 'completed',
      completedAt: new Date().toISOString()
    })
    showGoalCompletedXP()
    xpStore.addToBalance(XP_AMOUNTS.goal_completed)
    showToast('Цель завершена!')
  }
  closeEditModal()
}

// Toggle work status for goal (in Status tab)
function toggleWorkStatus() {
  if (isGoalInWork.value) {
    // Remove from work
    handleQuickRemoveFromWork()
  } else {
    // Add to work
    handleQuickTakeToWork()
  }
}

// Set validation status
function setValidationStatus(validated) {
  if (!editingGoal.value) return
  editingGoal.value.status = validated ? 'validated' : 'rejected'
}

// Inline добавление шага (как в Remente)
const inlineStepInput = ref(null)
const inlineStepTitle = ref('')
const inlineInputFocused = ref(false)
const isGeneratingSteps = ref(false)
const showAIStepsTooltip = ref(false)

const aiStepsProgress = ref({ percent: 0, text: '' })

async function generateStepsAI() {
  if (isGeneratingSteps.value || !goal.value) return
  
  const goalTitle = goalForm.value.title || goal.value.title || goal.value.text
  if (!goalTitle) return
  
  isGeneratingSteps.value = true
  aiStepsProgress.value = { percent: 0, text: 'Запуск генерации...' }
  
  try {
    const context = {
      goal_title: goalTitle
    }
    
    if (goalBackendId.value && !isLocalId.value) {
      context.goal_id = parseInt(goalBackendId.value)
    }
    
    const result = await aiTasksStore.startTaskAndWait('goal_decomposition', context, 120000)
    
    if (DEBUG_MODE) {
      console.log('[GoalEdit] AI decomposition completed:', result)
    }
    
    handleAIStepsResult(result)
  } catch (error) {
    console.error('[GoalEdit] AI steps generation error:', error)
    showToast(error.message || 'Ошибка генерации', 'error')
    isGeneratingSteps.value = false
  }
}

watch(() => aiTasksStore.getTaskProgress('goal_decomposition'), (progress) => {
  if (progress && isGeneratingSteps.value) {
    aiStepsProgress.value = progress
  }
}, { deep: true })

function handleAIStepsResult(result) {
  if (result.steps && result.steps.length > 0) {
    const existingStepsCount = goalForm.value.steps?.length || 0
    
    result.steps.forEach((step, idx) => {
      const newStep = {
        id: `ai-${Date.now()}-${idx}`,
        title: step.title,
        comment: step.description || '',
        showComment: !!step.description,
        completed: false,
        isNew: true,
        order: existingStepsCount + idx + 1,
        priority: null,
        timeEstimate: step.time_estimate || null,
        scheduledDate: null,
        checklist: []
      }
      goalForm.value.steps.push(newStep)
    })
    
    showToast(`ИИ добавил ${result.steps.length} шагов`, 'success')
    
    if (DEBUG_MODE) {
      console.log('[GoalEdit] AI steps added:', result.steps.length)
    }
  } else {
    showToast('Не удалось сгенерировать шаги', 'error')
  }
  
  isGeneratingSteps.value = false
}

async function addInlineStep() {
  if (!inlineStepTitle.value.trim()) return
  
  // Генерируем уникальный ID с суффиксом для избежания коллизий
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const newStep = { 
    id: uniqueId,
    title: inlineStepTitle.value.trim(),
    completed: false,
    comment: '',
    timeEstimate: '',
    priority: '',
    scheduledDate: '',
    status: 'pending',
    isNew: false
  }
  
  goalForm.value.steps.push(newStep)
  inlineStepTitle.value = ''
  autoSave()
  
  // Держим фокус на поле для быстрого добавления следующего шага
  nextTick(() => {
    inlineStepInput.value?.focus()
  })
}

// Рефлексия (свёрнута по умолчанию)
const showGoalReflection = ref(false)

const hasReflection = computed(() => {
  return Boolean(goalForm.value?.whyImportant || goalForm.value?.description || goalForm.value?.why2)
})

// ========================================
// ЗАМЕТКИ (Notes) — Backend Integration
// ========================================

// UI состояние
const showMiniJournal = ref(false)
const miniJournalEntry = ref('')

// Пагинация
const NOTES_PER_PAGE = 10
const currentNotesPage = ref(1)
const totalNotesPages = ref(1)
const totalNotesCount = ref(0)
const totalFilteredNotesCount = ref(0)

// Данные заметок
const notesData = ref([])
const isLoadingNotes = ref(false)
const notesLoadedFromStepsApi = ref(false)  // Флаг: заметки загружены через with_notes_first_page

// Поиск
const notesSearchQuery = ref('')
const showNotesSearch = ref(false)
const notesSearchInputRef = ref(null)

// Редактирование
const editingNoteId = ref(null)
const editingNoteText = ref('')
const isSavingNote = ref(false)

// Computed: список заметок для отображения
const miniJournalEntries = computed(() => {
  return notesData.value || []
})

// Computed: видимые страницы пагинации
const visibleNotesPages = computed(() => {
  const total = totalNotesPages.value
  const current = currentNotesPage.value
  const pages = []

  if (total <= 5) {
    // Показываем все страницы
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Показываем первую, последнюю, текущую ±1
    pages.push(1)
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i)
    }
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }
  return pages
})

// Computed: есть ли активные фильтры
const hasActiveNotesFilters = computed(() => {
  return notesSearchQuery.value.length >= 3
})

// Computed: счётчик заметок для бейджа
const notesCountBadge = computed(() => {
  return totalFilteredNotesCount.value || totalNotesCount.value || 0
})

const unscheduledStepsCount = computed(() => {
  if (!goalForm.value?.steps) return 0
  return goalForm.value.steps.filter(s => !s.completed && !s.scheduledDate).length
})

const hasUnscheduledSteps = computed(() => {
  return unscheduledStepsCount.value > 0
})

function goToPlanning() {
  const goalId = goal.value?.backendId || goal.value?.id
  if (goalId) {
    router.push({ path: '/app/planning', query: { first_goal_id: goalId } })
  } else {
    router.push('/app/planning')
  }
}

// ========================================
// ЗАМЕТКИ — Методы
// ========================================

/**
 * Переключить раскрытие блока заметок
 */
function toggleMiniJournal() {
  showMiniJournal.value = !showMiniJournal.value

  // При первом открытии загрузить заметки, если они ещё не были загружены через with_notes_first_page
  if (showMiniJournal.value && notesData.value.length === 0 && !isLoadingNotes.value && !notesLoadedFromStepsApi.value) {
    loadNotesFromBackend()
  }
}

/**
 * Загрузить заметки с бэкенда
 * @param {number} page - Номер страницы
 * @param {boolean} resetSearch - Сбросить поиск при загрузке
 */
async function loadNotesFromBackend(page = 1, resetSearch = false) {
  if (!goal.value || !goal.value.id) return

  isLoadingNotes.value = true

  try {
    const { getGoalNotes } = await import('@/services/api.js')

    const params = {
      goal_id: goal.value.id,
      page: page,
      page_size: NOTES_PER_PAGE,
      order_by: 'date_created',
      order_direction: 'desc'
    }

    // Добавляем поиск только если запрос >= 3 символов
    if (!resetSearch && notesSearchQuery.value.length >= 3) {
      params.query_filter = notesSearchQuery.value
    }

    const result = await getGoalNotes(params)

    if (result.status === 'ok' && result.data) {
      const data = result.data

      notesData.value = data.notes_data || []
      currentNotesPage.value = data.page || 1
      totalNotesPages.value = data.total_pages || 1
      totalNotesCount.value = data.total_items || 0
      totalFilteredNotesCount.value = data.total_filtered_items || 0

      if (DEBUG_MODE) {
        console.log('[GoalEdit] Notes loaded:', {
          page: data.page,
          totalPages: data.total_pages,
          count: notesData.value.length
        })
      }
    } else {
      showToast('Ошибка загрузки заметок', 'error')
    }
  } catch (error) {
    if (DEBUG_MODE) {
      console.error('[GoalEdit] Failed to load notes:', error)
    }
    showToast('Ошибка загрузки заметок', 'error')
  } finally {
    isLoadingNotes.value = false
  }
}

/**
 * Переход на страницу пагинации
 * @param {number} page - Номер страницы
 */
function goToNotesPage(page) {
  if (page >= 1 && page <= totalNotesPages.value && page !== currentNotesPage.value) {
    loadNotesFromBackend(page)
  }
}

/**
 * Добавить новую заметку
 */
async function addMiniJournalEntry() {
  if (!miniJournalEntry.value.trim()) return
  if (!goal.value || !goal.value.id) return

  const text = miniJournalEntry.value.trim()

  // Оптимистичное обновление UI
  const tempNote = {
    note_id: `temp_${Date.now()}`,
    text: text,
    date_created: new Date().toISOString(),
    date_updated: new Date().toISOString(),
    _isTemp: true
  }

  notesData.value.unshift(tempNote)
  miniJournalEntry.value = ''

  try {
    const { createGoalNote } = await import('@/services/api.js')
    const result = await createGoalNote(goal.value.id, text)

    if (result.status === 'ok' && result.data) {
      // Обновляем данные с сервера
      await loadNotesFromBackend(1)
      showToast('Заметка добавлена', 'success')
    } else {
      // Откат при ошибке
      notesData.value = notesData.value.filter(n => n.note_id !== tempNote.note_id)
      showToast('Ошибка при добавлении заметки', 'error')
    }
  } catch (error) {
    // Откат при ошибке
    notesData.value = notesData.value.filter(n => n.note_id !== tempNote.note_id)
    showToast('Ошибка при добавлении заметки', 'error')
    if (DEBUG_MODE) {
      console.error('[GoalEdit] Failed to create note:', error)
    }
  }
}

/**
 * Удалить заметку
 * @param {number} noteId - ID заметки
 */
async function removeMiniJournalEntry(noteId) {
  if (!goal.value || !goal.value.id) return

  // Оптимистичное удаление из UI
  const noteIndex = notesData.value.findIndex(n => n.note_id === noteId)
  if (noteIndex === -1) return

  const removedNote = notesData.value[noteIndex]
  notesData.value.splice(noteIndex, 1)

  try {
    const { deleteGoalNote } = await import('@/services/api.js')
    const result = await deleteGoalNote(goal.value.id, noteId)

    if (result.status === 'ok') {
      showToast('Заметка удалена', 'success')
      // Перезагрузить текущую страницу (счётчики могли измениться)
      await loadNotesFromBackend(currentNotesPage.value)
    } else {
      // Откат при ошибке
      notesData.value.splice(noteIndex, 0, removedNote)
      showToast('Ошибка при удалении заметки', 'error')
    }
  } catch (error) {
    // Откат при ошибке
    notesData.value.splice(noteIndex, 0, removedNote)
    showToast('Ошибка при удалении заметки', 'error')
    if (DEBUG_MODE) {
      console.error('[GoalEdit] Failed to delete note:', error)
    }
  }
}

/**
 * Начать редактирование заметки
 * @param {object} note - Заметка для редактирования
 */
function startEditingNote(note) {
  editingNoteId.value = note.note_id
  editingNoteText.value = note.text
}

/**
 * Отменить редактирование заметки
 */
function cancelEditingNote() {
  editingNoteId.value = null
  editingNoteText.value = ''
}

/**
 * Сохранить отредактированную заметку
 * @param {number} noteId - ID заметки
 */
async function saveEditedNote(noteId) {
  if (!editingNoteText.value.trim()) {
    showToast('Текст заметки не может быть пустым', 'error')
    return
  }

  if (!goal.value || !goal.value.id) return

  isSavingNote.value = true
  const newText = editingNoteText.value.trim()

  // Оптимистичное обновление
  const noteIndex = notesData.value.findIndex(n => n.note_id === noteId)
  if (noteIndex !== -1) {
    const oldText = notesData.value[noteIndex].text
    notesData.value[noteIndex].text = newText

    try {
      const { updateGoalNote } = await import('@/services/api.js')
      const result = await updateGoalNote(goal.value.id, noteId, newText)

      if (result.status === 'ok') {
        showToast('Заметка обновлена', 'success')
        cancelEditingNote()
        // Обновить с сервера (чтобы получить date_updated)
        await loadNotesFromBackend(currentNotesPage.value)
      } else {
        // Откат
        notesData.value[noteIndex].text = oldText
        showToast('Ошибка при обновлении заметки', 'error')
      }
    } catch (error) {
      // Откат
      notesData.value[noteIndex].text = oldText
      showToast('Ошибка при обновлении заметки', 'error')
      if (DEBUG_MODE) {
        console.error('[GoalEdit] Failed to update note:', error)
      }
    } finally {
      isSavingNote.value = false
    }
  }
}

/**
 * Переключить поле поиска заметок
 */
function toggleNotesSearch() {
  showNotesSearch.value = !showNotesSearch.value

  if (showNotesSearch.value) {
    nextTick(() => {
      notesSearchInputRef.value?.focus()
    })
  } else {
    closeNotesSearch()
  }
}

/**
 * Закрыть поиск заметок
 */
function closeNotesSearch() {
  showNotesSearch.value = false
  if (notesSearchQuery.value) {
    notesSearchQuery.value = ''
    // Перезагрузить без фильтра
    loadNotesFromBackend(1, true)
  }
}

/**
 * Обработчик потери фокуса поля поиска
 */
function onNotesSearchBlur() {
  // Закрываем поиск только если запрос пустой
  if (!notesSearchQuery.value) {
    setTimeout(() => {
      showNotesSearch.value = false
    }, 150)
  }
}

/**
 * Debounced поиск заметок
 */
let notesSearchTimeout = null
function onNotesSearchInput() {
  clearTimeout(notesSearchTimeout)

  notesSearchTimeout = setTimeout(() => {
    if (notesSearchQuery.value.length >= 3) {
      // Поиск с минимум 3 символами
      loadNotesFromBackend(1)
    } else if (notesSearchQuery.value.length === 0) {
      // Сброс поиска
      loadNotesFromBackend(1, true)
    }
  }, 500) // 500ms debounce
}

/**
 * Форматирование даты заметки для отображения
 * @param {string} dateStr - Дата в ISO формате
 * @returns {string} - Относительная дата (например, "2 часа назад")
 */
function formatJournalDate(dateStr) {
  if (!dateStr) return ''

  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) return 'только что'
  if (diffMinutes < 60) return `${diffMinutes} мин. назад`
  if (diffHours < 24) return `${diffHours} ч. назад`
  if (diffDays < 7) return `${diffDays} дн. назад`

  // Для старых заметок — точная дата
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}.${month}.${year}`
}

// Модалка добавления шага (мобильная версия)
const showAddStepModal = ref(false)
const newStepForm = ref({
  title: '',
  comment: '',
  showComment: false
})
const newStepTitleInput = ref(null)

function openAddStepModal() {
  newStepForm.value = {
    title: '',
    comment: '',
    showComment: false
  }
  showAddStepModal.value = true
  nextTick(() => {
    newStepTitleInput.value?.focus()
  })
}

function closeAddStepModal() {
  showAddStepModal.value = false
}

async function saveStepFromModal() {
  if (!newStepForm.value.title.trim()) {
    return
  }
  
  const newStep = { 
    id: Date.now().toString(),
    title: newStepForm.value.title.trim(),
    completed: false,
    comment: newStepForm.value.comment || '',
    timeEstimate: '',
    priority: '',
    scheduledDate: '',
    status: 'pending',
    isNew: false // Сразу сохраняем
  }
  
  goalForm.value.steps.push(newStep)
  closeAddStepModal()
  autoSave()
}

// Модалка редактирования шага
const showEditStepModal = ref(false)
const showTimeSelector = ref(false)
const showDatePicker = ref(false)
const showCommentField = ref(false)

const timeOptions = [
  { value: '30min', label: '30 минут' },
  { value: '1h', label: '1 час' },
  { value: '2h', label: '2 часа' },
  { value: '3h', label: '3 часа' },
  { value: '4h', label: '4 часа' },
  { value: '', label: 'Без оценки' }
]
const editStepForm = ref({
  title: '',
  comment: '',
  completed: false,
  priority: '',
  timeEstimate: '',
  scheduledDate: '',
  stepIndex: -1,
  checklist: []
})
const editStepTitleInput = ref(null)

const priorityOptions = [
  { value: 'critical', label: 'Критично' },
  { value: 'desirable', label: 'Желательно' },
  { value: 'attention', label: 'Внимание' },
  { value: 'optional', label: 'Опционально' }
]

function openEditStepModal(step, index) {
  showTimeSelector.value = false
  showDatePicker.value = false
  showCommentField.value = false
  editStepForm.value = {
    title: step.title || '',
    comment: step.comment || '',
    completed: step.completed || false,
    priority: step.priority || '',
    timeEstimate: step.timeEstimate || '',
    scheduledDate: step.scheduledDate || '',
    stepIndex: index,
    checklist: step.checklist ? JSON.parse(JSON.stringify(step.checklist)) : []
  }
  showEditStepModal.value = true
  nextTick(() => {
    editStepTitleInput.value?.focus()
  })
}

function addChecklistItem() {
  const newItem = {
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    text: '',
    completed: false
  }
  editStepForm.value.checklist.push(newItem)
}

function removeChecklistItem(index) {
  editStepForm.value.checklist.splice(index, 1)
}

function toggleChecklistItem(index) {
  editStepForm.value.checklist[index].completed = !editStepForm.value.checklist[index].completed
}

function toggleEditStepComplete() {
  editStepForm.value.completed = !editStepForm.value.completed
}

function cyclePriority() {
  const priorities = ['', 'optional', 'attention', 'desirable', 'critical']
  const current = editStepForm.value.priority || ''
  const idx = priorities.indexOf(current)
  editStepForm.value.priority = priorities[(idx + 1) % priorities.length]
}


function formatParamDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) return 'Сегодня'
  if (date.toDateString() === tomorrow.toDateString()) return 'Завтра'
  
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function openScheduleForStep() {
  showDatePicker.value = true
}

function closeEditStepModal() {
  showEditStepModal.value = false
}

function saveEditStepModal() {
  const index = editStepForm.value.stepIndex
  if (index < 0 || index >= goalForm.value.steps.length) {
    return
  }
  
  const step = goalForm.value.steps[index]
  const wasCompleted = step.completed
  const nowCompleted = editStepForm.value.completed
  
  step.title = editStepForm.value.title.trim()
  step.comment = editStepForm.value.comment || ''
  step.priority = editStepForm.value.priority || ''
  step.timeEstimate = editStepForm.value.timeEstimate || ''
  step.scheduledDate = editStepForm.value.scheduledDate || ''
  step.checklist = editStepForm.value.checklist.filter(item => item.text.trim())
  
  if (wasCompleted !== nowCompleted) {
    step.completed = nowCompleted
    step.status = nowCompleted ? 'completed' : 'pending'
    recalculateProgress()
  }
  
  closeEditStepModal()
  autoSave()
}

async function deleteStepFromModal() {
  const index = editStepForm.value.stepIndex
  closeEditStepModal()
  
  if (index >= 0 && index < goalForm.value.steps.length) {
    await removeStep(index)
  }
}

// Подтверждение удаления шага
const showDeleteStepConfirm = ref(false)

function confirmDeleteStep() {
  showDeleteStepConfirm.value = true
}

function cancelDeleteStep() {
  showDeleteStepConfirm.value = false
}

async function executeDeleteStep() {
  showDeleteStepConfirm.value = false
  await deleteStepFromModal()
}

// Фильтры
const searchQuery = ref('')
const filterStatus = ref('')
const sortBy = ref('order')
const showSearchInput = ref(false)
const searchInputRef = ref(null)

function toggleSearch() {
  showSearchInput.value = true
  nextTick(() => {
    searchInputRef.value?.focus()
  })
}

function closeSearch() {
  searchQuery.value = ''
  showSearchInput.value = false
}

function onSearchBlur() {
  if (!searchQuery.value) {
    showSearchInput.value = false
  }
}
const sortDirection = ref('asc')
const showFilterDropdown = ref(false)

// Пагинация
const stepsDisplayLimit = ref(10)

const hasActiveFilters = computed(() => {
  return searchQuery.value || filterStatus.value
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (searchQuery.value) count++
  if (filterStatus.value) count++
  return count
})

// Drag & drop отключен при активных фильтрах или сортировке
const isDragEnabled = computed(() => {
  // Отключить если фильтры активны
  if (hasActiveFilters.value) return false
  // Отключить если сортировка не по порядку
  if (sortBy.value !== 'order') return false
  // Отключить если пагинация обрезает список существующих шагов
  const existingLen = existingSteps.value?.length || 0
  if (existingLen > stepsDisplayLimit.value) return false
  // Отключить если отфильтрованный список не равен списку существующих шагов
  const filteredLen = filteredSteps.value?.length || 0
  if (filteredLen !== existingLen) return false
  return true
})

// Флаг сохранения и отслеживание изменений
const isSaving = ref(false)
let lastSavedHash = ''

function clearFilters() {
  searchQuery.value = ''
  filterStatus.value = ''
}


function sortSteps(steps) {
  if (sortBy.value === 'order') {
    return steps
  }
  
  const sorted = [...steps]
  const dir = sortDirection.value === 'asc' ? 1 : -1
  
  sorted.sort((a, b) => {
    switch (sortBy.value) {
      case 'priority': {
        const priorityOrder = { 'critical': 1, 'desirable': 2, 'attention': 3, 'optional': 4, '': 5 }
        const aVal = priorityOrder[a.priority || ''] || 5
        const bVal = priorityOrder[b.priority || ''] || 5
        return (aVal - bVal) * dir
      }
      case 'status': {
        const statusOrder = { 'in_progress': 1, 'pending': 2, 'completed': 3 }
        const aVal = statusOrder[a.status || 'pending'] || 2
        const bVal = statusOrder[b.status || 'pending'] || 2
        return (aVal - bVal) * dir
      }
      case 'time': {
        const timeOrder = { '15': 1, '30': 2, '60': 3, '120': 4, '180': 5, '240': 6, '': 7 }
        const aVal = timeOrder[a.timeEstimate || ''] || 7
        const bVal = timeOrder[b.timeEstimate || ''] || 7
        return (aVal - bVal) * dir
      }
      case 'date': {
        const aDate = a.scheduledDate ? new Date(a.scheduledDate).getTime() : (dir === 1 ? Infinity : -Infinity)
        const bDate = b.scheduledDate ? new Date(b.scheduledDate).getTime() : (dir === 1 ? Infinity : -Infinity)
        return (aDate - bDate) * dir
      }
      default:
        return 0
    }
  })
  
  return sorted
}

// Новые шаги (добавленные кнопкой "Добавить шаг", ещё не сохранённые)
const newSteps = computed(() => {
  return goalForm.value.steps.filter(s => s.isNew)
})

// Существующие шаги (без новых)
const existingSteps = computed(() => {
  return goalForm.value.steps.filter(s => !s.isNew)
})

// Фильтрованные и отсортированные шаги (только существующие)
const filteredSteps = computed(() => {
  let steps = existingSteps.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    steps = steps.filter(s => 
      s.title?.toLowerCase().includes(query) || 
      s.comment?.toLowerCase().includes(query)
    )
  }
  
  if (filterStatus.value) {
    if (filterStatus.value === 'completed') {
      steps = steps.filter(s => s.completed || s.status === 'completed')
    } else if (filterStatus.value === 'pending') {
      steps = steps.filter(s => !s.completed && s.status !== 'completed')
    }
  }
  
  
  // Применить сортировку
  steps = sortSteps(steps)
  
  return steps
})

// Пагинированные шаги (без новых)
const paginatedSteps = computed(() => {
  return filteredSteps.value.slice(0, stepsDisplayLimit.value)
})

// Progress computed properties
const totalStepsCount = computed(() => {
  return goalForm.value.steps.filter(s => !s.isNew).length
})

const completedStepsCount = computed(() => {
  return goalForm.value.steps.filter(s => !s.isNew && s.completed).length
})

const completionProgress = computed(() => {
  if (totalStepsCount.value === 0) return 0
  return Math.round((completedStepsCount.value / totalStepsCount.value) * 100)
})

// Проверка есть ли активные фильтры
const hasActiveFiltersOrSort = computed(() => {
  return searchQuery.value || filterStatus.value
})

const hasMoreSteps = computed(() => {
  return filteredSteps.value.length > stepsDisplayLimit.value
})

const remainingStepsCount = computed(() => {
  return filteredSteps.value.length - stepsDisplayLimit.value
})

function loadMoreSteps() {
  stepsDisplayLimit.value += 10
  adjustAllCommentHeights()
}

// Получить оригинальный индекс шага в goalForm.steps
function getOriginalIndex(step) {
  return goalForm.value.steps.findIndex(s => s.id === step.id)
}

// Сброс пагинации и загрузка с бэкенда при изменении фильтров
let filterDebounceTimer = null
let previousHasFilters = false

watch([searchQuery, filterStatus], () => {
  stepsDisplayLimit.value = 10
  
  // Debounce for search query, immediate for other filters
  if (filterDebounceTimer) clearTimeout(filterDebounceTimer)
  
  const hasFiltersOrSort = searchQuery.value || filterStatus.value
  const filtersCleared = previousHasFilters && !hasFiltersOrSort
  
  if (goalBackendId.value) {
    // Always reload: when filters/sort active, when filters cleared, or when sort changed
    const needsReload = hasFiltersOrSort || filtersCleared
    
    if (needsReload) {
      // Shorter debounce for non-search filters, longer for search
      const debounceMs = searchQuery.value && searchQuery.value.length > 0 ? 500 : 100
      
      filterDebounceTimer = setTimeout(() => {
        loadStepsWithFilters()
      }, debounceMs)
    }
  }
  
  previousHasFilters = hasFiltersOrSort
})

// Map frontend sort keys to backend order_by values
// Backend supports: order, date_created, title, status, priority, time_duration, is_complete
function mapSortToBackend(sortKey) {
  // Frontend now uses same keys as backend, just pass through
  const validKeys = ['order', 'date_created', 'title', 'status', 'priority', 'time_duration', 'is_complete']
  return validKeys.includes(sortKey) ? sortKey : 'order'
}

// Map frontend priority values to backend values
// Frontend uses 'desirable', backend expects 'important'
function mapPriorityToBackend(priority) {
  const priorityMap = {
    'critical': 'critical',
    'desirable': 'important', // frontend → backend
    'attention': 'attention',
    'optional': 'optional'
  }
  return priorityMap[priority] || priority
}

// Map backend priority values to frontend values
function mapPriorityFromBackend(priority) {
  const priorityMap = {
    'critical': 'critical',
    'important': 'desirable', // backend → frontend
    'attention': 'attention',
    'optional': 'optional'
  }
  return priorityMap[priority] || priority
}

// Load steps from backend with current filters
async function loadStepsWithFilters() {
  // Use goalBackendId from URL directly
  const backendId = goalBackendId.value
  // Skip for local goals (dev mode)
  if (!backendId || isLocalId.value) return
  
  const currentBackendId = backendId
  
  try {
    const { getGoalSteps } = await import('@/services/api.js')
    
    const params = {
      goal_id: backendId,
      order_by: mapSortToBackend(sortBy.value),
      order_direction: sortDirection.value
    }
    
    // Add filters if present
    // API accepts: query_filter (min 3 chars), result_filter (complete/uncomplete), priority_filter
    if (searchQuery.value && searchQuery.value.length >= 3) {
      params.query_filter = searchQuery.value
    }
    if (filterStatus.value) {
      // Frontend uses 'completed'/'pending', backend uses 'complete'/'uncomplete'
      params.result_filter = filterStatus.value === 'completed' ? 'complete' : 'uncomplete'
    }
    
    console.log('[GoalEdit] Loading steps with filters:', params)
    
    const result = await getGoalSteps(params)
    
    // Check if user navigated away
    if (goalBackendId.value !== currentBackendId) return
    
    if (result.status === 'ok' && result.data) {
      // Update pagination info (reset to page 1 on filter/sort change)
      totalStepsFromBackend.value = result.data.total_items || result.data.goal_data?.total_data?.total_steps || 0
      totalFilteredSteps.value = result.data.total_filtered_items || totalStepsFromBackend.value
      totalStepsPages.value = result.data.total_pages || 1
      stepsPageSize.value = result.data.page_size || 6
      currentStepsPage.value = 1
      
      const stepsData = result.data.steps_data || result.data.goal_data?.steps_data || []
      
      const backendSteps = stepsData.map(s => ({
        id: String(s.step_id),
        backendId: s.step_id,
        title: s.title || '',
        completed: s.is_complete || false,
        comment: s.description || '',
        timeEstimate: mapTimeFromBackend(s.time_duration),
        priority: mapPriorityFromBackend(s.priority) || '',
        scheduledDate: s.dt || '',
        status: s.is_complete ? 'completed' : 'pending',
        order: s.order || 0
      }))
      
      // Merge with existing new steps (isNew flag)
      const newStepsLocal = goalForm.value.steps.filter(s => s.isNew)
      goalForm.value.steps = [...backendSteps, ...newStepsLocal]
      
      recalculateProgress()
      takeStepsSnapshot()
      adjustAllCommentHeights()
      
      console.log('[GoalEdit] Loaded', backendSteps.length, 'filtered steps from backend, total:', totalStepsFromBackend.value)
    }
  } catch (error) {
    console.error('[GoalEdit] Error loading filtered steps:', error)
  }
}

function openEditModal() {
  // Найти данные из rawIdeas (банка целей) по backendId
  const rawIdea = store.goalsBank?.rawIdeas?.find(r => r.backendId === goalBackendId.value || r.id === goal.value.sourceId)
  
  // rawIdea.status уже содержит 'validated'/'rejected'/'raw' (смаппировано из backend score)
  // rawIdea.workStatus содержит 'work'/'complete'/null (из backend status)
  const validationStatus = rawIdea?.status === 'raw' ? null : (rawIdea?.status || null)
  
  editingGoal.value = {
    id: goal.value.sourceId,
    text: goal.value.title,
    sphereId: goal.value.sphereId,
    whyImportant: rawIdea?.whyImportant || rawIdea?.threeWhys?.why1 || goal.value.description || '',
    why2: rawIdea?.threeWhys?.why2 || '',
    why3: rawIdea?.threeWhys?.why3 || '',
    validationStatus: validationStatus, // 'validated'/'rejected'/null - тип цели (score)
    workStatus: rawIdea?.workStatus || goal.value.status || 'work' // work/complete
  }
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  editingGoal.value = null
  editModalTab.value = 'main'
}

function deleteGoalFromModal() {
  if (editingGoal.value && confirm('Удалить эту цель?')) {
    store.deleteRawIdea(editingGoal.value.id)
    store.deleteGoal(goal.value.id)
    closeEditModal()
    router.push('/app/goals-bank')
  }
}

function getSphereNameOnly(sphereId) {
  const sphere = lifeSpheres.value.find(s => s.id === sphereId)
  return sphere ? sphere.name : ''
}

async function saveEditModal() {
  if (!editingGoal.value) return
  
  // Capture data before any async operation
  const goalData = {
    id: editingGoal.value.id,
    text: editingGoal.value.text,
    sphereId: editingGoal.value.sphereId,
    whyImportant: editingGoal.value.whyImportant,
    why2: editingGoal.value.why2,
    why3: editingGoal.value.why3,
    validationStatus: editingGoal.value.validationStatus,
    workStatus: editingGoal.value.workStatus
  }
  
  // First, sync to backend (blocking - wait for response)
  if (goalBackendId.value) {
    try {
      const { updateGoal: updateGoalApi } = await import('@/services/api.js')
      // Map frontend sphereId to backend category
      const backendCategory = store.categoryFrontendToBackend[goalData.sphereId] || goalData.sphereId
      
      // Map frontend validationStatus to backend score
      // Frontend: 'validated'/'rejected'/null → Backend: 'true'/'false'/null
      let backendScore = null
      if (goalData.validationStatus === 'validated') backendScore = 'true'
      else if (goalData.validationStatus === 'rejected') backendScore = 'false'
      
      const result = await updateGoalApi(goalBackendId.value, {
        title: goalData.text,
        category: backendCategory,
        status: goalData.workStatus || null,
        score: backendScore,
        why_important: goalData.whyImportant || null,
        why_give_me: goalData.why2 || null,
        why_about_me: goalData.why3 || null
      })
      
      console.log('[GoalEdit] Goal updated on backend:', goalBackendId.value, result)
      
      if (result.status !== 'ok') {
        showToast('Ошибка сохранения на сервере', 'error')
        return
      }
    } catch (error) {
      console.error('[GoalEdit] Error updating goal on backend:', error)
      showToast('Ошибка сохранения: ' + (error.message || 'Неизвестная ошибка'), 'error')
      return
    }
  }
  
  // Backend success - now update local state
  // Map frontend validationStatus back to backend score format for storage
  let scoreForStore = null
  if (goalData.validationStatus === 'validated') scoreForStore = 'true'
  else if (goalData.validationStatus === 'rejected') scoreForStore = 'false'
  
  store.updateRawIdea(goalData.id, {
    text: goalData.text,
    whyImportant: goalData.whyImportant,
    sphereId: goalData.sphereId,
    score: scoreForStore,
    workStatus: goalData.workStatus,
    status: goalData.validationStatus, // legacy field
    threeWhys: {
      why1: goalData.whyImportant,
      why2: goalData.why2,
      why3: goalData.why3
    }
  })
  
  // Обновить текущую цель
  if (goal.value) {
    store.updateGoal(goal.value.id, {
      title: goalData.text,
      sphereId: goalData.sphereId,
      description: goalData.whyImportant,
      status: goalData.workStatus
    })
  }
  
  // Обновить локальную форму
  goalForm.value.title = goalData.text
  goalForm.value.sphereId = goalData.sphereId
  goalForm.value.description = goalData.whyImportant
  
  closeEditModal()
  showToast('Цель успешно обновлена')
}

function getSphereIconComponent(sphereId) {
  const iconMap = {
    'wealth': Wallet,
    'hobbies': Palette,
    'friendship': Users,
    'health': Heart,
    'career': Briefcase,
    'love': HeartHandshake
  }
  return iconMap[sphereId] || Target
}

function getSphereColor(sphereId) {
  const colorMap = {
    'wealth': '#e63946',
    'hobbies': '#f4a261',
    'friendship': '#e9c46a',
    'health': '#2a9d8f',
    'career': '#264653',
    'love': '#9b5de5'
  }
  return colorMap[sphereId] || '#6366f1'
}

function getSphereName(sphereId) {
  const sphere = lifeSpheres.value.find(s => s.id === sphereId)
  return sphere ? sphere.name : 'Не указана'
}

function getPriorityColor(priority) {
  const colors = {
    'critical': '#ef4444',
    'desirable': '#f97316',
    'attention': '#3b82f6',
    'optional': '#9ca3af'
  }
  return colors[priority] || '#9ca3af'
}

function getPriorityLabel(priority) {
  const labels = {
    'critical': 'Критично',
    'desirable': 'Важно',
    'attention': 'В поле внимания',
    'optional': 'По возможности'
  }
  return labels[priority] || ''
}

function formatScheduledDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) return 'Сегодня'
  if (date.toDateString() === tomorrow.toDateString()) return 'Завтра'
  
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function formatTimeEstimate(timeEstimate) {
  if (!timeEstimate) return ''
  const timeLabels = {
    '30min': '30м',
    '1h': '1ч',
    '2h': '2ч',
    '3h': '3ч',
    '4h': '4ч'
  }
  return timeLabels[timeEstimate] || timeEstimate
}

async function toggleStepComplete(step, index) {
  const newCompleted = !step.completed
  
  // Проверка: нужен backendId для сохранения на сервер
  if (!step.backendId || !goalBackendId.value) {
    console.warn('[GoalEdit] Cannot toggle step - missing backendId:', { stepBackendId: step.backendId, goalBackendId: goalBackendId.value })
    showToast('Шаг ещё не сохранён на сервере', 'warning')
    return
  }
  
  // Оптимистичное обновление UI
  updateStep(index, 'completed', newCompleted)
  
  try {
    // Отправляем API запрос на бэкенд
    const result = await updateGoalSteps({
      goals_steps_data: [{
        goal_id: parseInt(goalBackendId.value),
        step_id: parseInt(step.backendId),
        is_complete: newCompleted
      }]
    })
    
    if (result.status === 'success') {
      showToast(newCompleted ? 'Шаг выполнен!' : 'Шаг возвращён в работу', 'success')
      // XP обновление и уведомление только при успешном сохранении
      if (newCompleted) {
        showStepCompletedXP()
        xpStore.addToBalance(XP_AMOUNTS.goal_step_completed)
      } else {
        xpStore.addToBalance(-XP_AMOUNTS.goal_step_completed)
      }
      
      // Обновить локальный store для синхронизации
      store.updateGoalStepByBackendId(goalBackendId.value, step.backendId, { completed: newCompleted })
    } else {
      throw new Error(result.error_data?.message || 'Ошибка сервера')
    }
  } catch (error) {
    console.error('Failed to update step:', error)
    // Откатить изменение
    updateStep(index, 'completed', !newCompleted)
    showToast('Ошибка при обновлении шага', 'error')
  }
}

const dragIndex = ref(null)
const dragOverIndex = ref(null)
const stepsContainer = ref(null)
let autoScrollInterval = null

// Loading state for API
const isLoadingSteps = ref(false)
const isLoadingGoal = ref(false)
const stepsLoadedFromBackend = ref(false)

// Goal fetch state: 'idle' | 'loading' | 'loaded' | 'error'
const goalFetchStatus = ref('idle')

// Computed properties for template
const showGoalLoading = computed(() => {
  // Show loading when goal is not available and we're loading or just waiting for hydration
  return !goal.value && (goalFetchStatus.value === 'loading' || goalFetchStatus.value === 'idle')
})

const showGoalNotFound = computed(() => {
  // Show "not found" only when API explicitly returned error or loaded with no data
  // For 'loaded' status, only show empty if goal is still null (actual API completion)
  if (goal.value) return false
  if (goalFetchStatus.value === 'error') return true
  // For 'loaded' status - show empty only if we actually tried to load from API (not local)
  if (goalFetchStatus.value === 'loaded' && !isLocalId.value) return true
  return false
})

// Steps pagination from backend
const totalStepsFromBackend = ref(0)      // total_items (всего без фильтров)
const totalFilteredSteps = ref(0)         // total_filtered_items (с учётом фильтров)
const currentStepsPage = ref(1)
const stepsPageSize = ref(6)
const totalStepsPages = ref(1)

// Fixed height for steps container after initial load
const initialStepsContainerHeight = ref(null)

const stepsContainerStyle = computed(() => {
  if (initialStepsContainerHeight.value && hasMoreStepsToLoad.value) {
    return {
      minHeight: `${initialStepsContainerHeight.value}px`,
      maxHeight: `${initialStepsContainerHeight.value}px`
    }
  }
  return {}
})

const hasMoreStepsToLoad = computed(() => {
  // Use page-based check instead of counting loaded steps
  return currentStepsPage.value < totalStepsPages.value
})

const remainingStepsToLoadCount = computed(() => {
  // Calculate remaining based on filtered total and pages already loaded
  const total = totalFilteredSteps.value || totalStepsFromBackend.value
  const loadedPagesCount = currentStepsPage.value
  const alreadyLoadedCount = loadedPagesCount * stepsPageSize.value
  // On last page there might be fewer items than page_size, so cap at total
  const effectiveLoaded = Math.min(alreadyLoadedCount, total)
  return Math.max(0, total - effectiveLoaded)
})

// Load steps from backend
async function loadStepsFromBackend(page = 1, append = false) {
  // route.params.id IS the backendId now
  const backendId = goalBackendId.value
  
  // Skip backend load for local goals (dev mode)
  if (!backendId || isLocalId.value) {
    console.log('[GoalEdit] Skipping backend load for local goal')
    // For local goals, don't change goalFetchStatus - it's managed by onMounted/watch
    return
  }
  
  // Capture current backendId to detect stale responses
  const currentBackendId = backendId
  
  isLoadingSteps.value = true
  // Only set goal loading on first page if goal is not already loaded
  if (page === 1 && !goal.value) {
    isLoadingGoal.value = true
  }
  
  try {
    const { getGoalSteps } = await import('@/services/api.js')

    const params = {
      goal_id: backendId,
      order_by: 'order',
      order_direction: 'asc',
      page: page
    }

    // Запросить первую страницу заметок вместе с шагами (только при первой загрузке)
    if (page === 1) {
      params.with_notes_first_page = true
    }

    const result = await getGoalSteps(params)
    
    // Check if user navigated away - don't update if goal changed
    if (goalBackendId.value !== currentBackendId) {
      console.log('[GoalEdit] Goal changed during load, discarding stale response')
      isLoadingSteps.value = false
      return
    }
    
    if (result.status === 'ok' && result.data) {
      // Update pagination info
      totalStepsFromBackend.value = result.data.total_items || result.data.goal_data?.total_data?.total_steps || 0
      totalFilteredSteps.value = result.data.total_filtered_items || totalStepsFromBackend.value
      totalStepsPages.value = result.data.total_pages || 1
      stepsPageSize.value = result.data.page_size || 6
      currentStepsPage.value = page
      
      // Handle steps from steps_data or goal_data.steps_data
      const stepsData = result.data.steps_data || result.data.goal_data?.steps_data || []
      
      const backendSteps = stepsData.map(s => ({
        id: String(s.step_id),
        backendId: s.step_id,
        title: s.title || '',
        completed: s.is_complete || false,
        comment: s.description || '',
        timeEstimate: mapTimeFromBackend(s.time_duration),
        priority: mapPriorityFromBackend(s.priority) || '',
        scheduledDate: s.dt || '',
        status: s.is_complete ? 'completed' : 'pending',
        order: s.order || 0
      }))

      // Обработать данные заметок, если они пришли с флагом with_notes_first_page
      // Данные заметок приходят внутри goal_data согласно API документации
      const goalData = result.data.goal_data
      if (page === 1 && goalData && goalData.notes_data) {
        notesData.value = goalData.notes_data || []
        const notesPagination = goalData.notes_pagination || {}
        currentNotesPage.value = notesPagination.page || 1
        totalNotesPages.value = notesPagination.total_pages || 1
        totalNotesCount.value = notesPagination.total_items || 0
        totalFilteredNotesCount.value = notesPagination.total_filtered_items || 0
        notesLoadedFromStepsApi.value = true

        if (DEBUG_MODE) {
          console.log('[GoalEdit] Notes loaded with steps:', {
            page: notesPagination.page,
            totalPages: notesPagination.total_pages,
            count: notesData.value.length
          })
        }
      }

      // Обработать данные цели, если они пришли в ответе (для случая прямого открытия страницы по URL)
      if (page === 1 && goalData) {
        // Создать объект цели из данных API
        goalDataFromApi.value = {
          id: goalData.goal_id,
          backendId: goalData.goal_id,
          title: goalData.title || '',
          description: goalData.description || goalData.why_important || '',
          whyImportant: goalData.why_important || '',
          why2: goalData.why_give_me || '',
          sphereId: goalData.category || '',
          category: goalData.category || '',
          status: goalData.status || 'work',
          score: goalData.score || null,
          progress: 0,
          steps: [],
          source: 'api',
          sourceId: goalData.goal_id
        }

        if (DEBUG_MODE) {
          console.log('[GoalEdit] Goal data loaded from API:', {
            goalId: goalData.goal_id,
            title: goalData.title,
            category: goalData.category
          })
        }
      }

      // Final check before mutating any state
      if (goalBackendId.value !== currentBackendId) {
        console.log('[GoalEdit] Goal changed before applying steps, discarding')
        isLoadingSteps.value = false
        return
      }
      
      // All checks passed - safe to mutate state
      // Mark that we've loaded steps from backend for THIS goal
      stepsLoadedFromBackend.value = true
      
      if (append) {
        // Append mode: add new steps to existing, dedupe by backendId
        const existingBackendIds = new Set(goalForm.value.steps.map(s => s.backendId))
        const newStepsLocal = goalForm.value.steps.filter(s => s.isNew)
        const existingSteps = goalForm.value.steps.filter(s => !s.isNew)
        const uniqueNewSteps = backendSteps.filter(s => !existingBackendIds.has(s.backendId))
        goalForm.value.steps = [...existingSteps, ...uniqueNewSteps, ...newStepsLocal]
        
        // Increase display limit to show all loaded steps from backend
        const totalBackendSteps = goalForm.value.steps.filter(s => !s.isNew).length
        if (stepsDisplayLimit.value < totalBackendSteps) {
          stepsDisplayLimit.value = totalBackendSteps
        }
      } else {
        // Replace mode: preserve only local new steps
        const newStepsLocal = goalForm.value.steps.filter(s => s.isNew)
        goalForm.value.steps = [...backendSteps, ...newStepsLocal]
      }
      
      recalculateProgress()
      lastSavedHash = getStepsHash()
      adjustAllCommentHeights()
      
      // Take snapshot for change detection
      takeStepsSnapshot()
      
      // Update store goal if it exists
      const currentGoal = goal.value
      if (currentGoal) {
        currentGoal.steps = goalForm.value.steps.filter(s => !s.isNew)
      }
      
      console.log('[GoalEdit] Loaded', backendSteps.length, 'steps from backend for goal', currentBackendId, '(page', page, ', append:', append, ')')
      
      // Capture initial container height after first page load (for fixed height on pagination)
      if (!append && !initialStepsContainerHeight.value && totalStepsFromBackend.value > stepsPageSize.value) {
        nextTick(() => {
          if (stepsContainer.value) {
            initialStepsContainerHeight.value = stepsContainer.value.offsetHeight
            console.log('[GoalEdit] Captured initial steps container height:', initialStepsContainerHeight.value)
          }
        })
      }
    }
    
    isLoadingSteps.value = false
    // Mark goal fetch complete (we got goal data from API on first page)
    if (page === 1) {
      isLoadingGoal.value = false
      goalFetchStatus.value = 'loaded'
    }
  } catch (error) {
    console.error('[GoalEdit] Error loading steps from backend:', error)
    isLoadingSteps.value = false
    // Mark goal fetch as error only on first page
    if (page === 1) {
      isLoadingGoal.value = false
      goalFetchStatus.value = 'error'
    }
  }
}

// Load more steps from backend (next page)
async function loadMoreStepsFromBackend() {
  if (isLoadingSteps.value || !hasMoreStepsToLoad.value) return
  
  const nextPage = currentStepsPage.value + 1
  await loadStepsFromBackend(nextPage, true)
}

// Map backend time duration to frontend
function mapTimeFromBackend(timeDuration) {
  const map = {
    'half': '30min',
    'one': '1h',
    'two': '2h',
    'three': '3h',
    'four': '4h'
  }
  return map[timeDuration] || ''
}

// Map frontend time to backend
function mapTimeToBackend(timeEstimate) {
  const map = {
    '30min': 'half',
    '1h': 'one',
    '2h': 'two',
    '3h': 'three',
    '4h': 'four'
  }
  return map[timeEstimate] || null
}

// Save pending changes before leaving the route
onBeforeRouteLeave(() => {
  if (pendingSave) {
    flushSave(false)
  }
})

onMounted(async () => {
  // If goal is already in store, mark as loaded immediately
  if (goal.value) {
    goalFetchStatus.value = 'loaded'
  } else if (isLocalId.value) {
    // Local goal - wait a tick for store to hydrate, then mark as loaded
    await nextTick()
    goalFetchStatus.value = 'loaded'
  } else if (goalBackendId.value) {
    // Need to fetch from API
    goalFetchStatus.value = 'loading'
  } else {
    goalFetchStatus.value = 'idle'
  }
  
  loadGoalData()

  // Reset flags on mount
  stepsLoadedFromBackend.value = false
  initialStepsContainerHeight.value = null

  // Always try to load steps from backend (will check for backendId internally)
  loadStepsFromBackend()
})

onBeforeUnmount(() => {
  // Очистить timeout поиска при размонтировании компонента
  if (notesSearchTimeout) {
    clearTimeout(notesSearchTimeout)
  }
})

watch(goalBackendId, async () => {
  // Reset flags on route change
  stepsLoadedFromBackend.value = false
  notesLoadedFromStepsApi.value = false
  notesData.value = []
  goalDataFromApi.value = null  // Clear goal data from previous goal
  
  // Determine if goal exists in store
  const goalInStore = goals.value.find(g => g.backendId === goalBackendId.value || String(g.backendId) === goalBackendId.value)
  
  if (goalInStore) {
    goalFetchStatus.value = 'loaded'
  } else if (isLocalId.value) {
    // Local goal - wait a tick for computed to update
    await nextTick()
    goalFetchStatus.value = 'loaded'
  } else if (goalBackendId.value) {
    goalFetchStatus.value = 'loading'
  } else {
    goalFetchStatus.value = 'idle'
  }
  
  loadGoalData()
  loadStepsFromBackend()
})

// Watch for goalDataFromApi changes - load goal data when API returns
watch(goalDataFromApi, (newValue) => {
  if (newValue) {
    console.log('[GoalEdit] goalDataFromApi updated, reloading goal data')
    // Flags are set in loadStepsFromBackend, just reload the form
    loadGoalData()
  }
})

const commentTextareas = ref([])

function adjustAllCommentHeights() {
  nextTick(() => {
    const textareas = document.querySelectorAll('.step-comment-input')
    textareas.forEach(textarea => {
      if (textarea.value && textarea.value.includes('\n')) {
        textarea.style.height = 'auto'
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20
        const maxHeight = lineHeight * 7 + 16
        const newHeight = Math.min(textarea.scrollHeight, maxHeight)
        textarea.style.height = newHeight + 'px'
        
        if (textarea.scrollHeight > maxHeight) {
          textarea.style.overflowY = 'auto'
        } else {
          textarea.style.overflowY = 'hidden'
        }
      }
    })
  })
}

function loadGoalData() {
  if (goal.value) {
    // Don't overwrite steps if they were already loaded from backend
    const shouldLoadSteps = !stepsLoadedFromBackend.value
    
    goalForm.value = {
      title: goal.value.title || '',
      description: goal.value.description || '',
      sphereId: goal.value.sphereId || '',
      mvp: goal.value.mvp || '',
      // Only use store steps if we haven't loaded from backend yet
      steps: shouldLoadSteps ? (goal.value.steps ? goal.value.steps.map(s => ({ ...s })) : []) : goalForm.value.steps,
      progress: goal.value.progress || 0
    }
    recalculateProgress()
    // Инициализировать hash для отслеживания изменений
    lastSavedHash = getStepsHash()
    // Установить лимит пагинации равным количеству шагов (до 50) чтобы drag & drop работал
    const stepsCount = goalForm.value.steps.filter(s => !s.isNew).length
    stepsDisplayLimit.value = Math.max(10, Math.min(stepsCount, 50))
    // Корректировать высоту многострочных комментариев
    adjustAllCommentHeights()
    // Take snapshot for change detection (if not loading from backend)
    if (!stepsLoadedFromBackend.value) {
      takeStepsSnapshot()
    }
  }
}

function addStep() {
  const newStep = { 
    id: Date.now().toString(),
    title: '', 
    completed: false,
    comment: '',
    timeEstimate: '',
    priority: '',
    scheduledDate: '',
    status: 'pending',
    isNew: true,
    showComment: false
  }
  goalForm.value.steps.push(newStep)
  
  // НЕ изменяем stepsDisplayLimit — новые шаги отображаются отдельно внизу
  // НЕ сохраняем пустой шаг — сохранение произойдёт по кнопке "Добавить"
  
  // Auto-scroll к новому шаблону
  nextTick(() => {
    const newStepEl = document.querySelector('.new-step-card:last-child')
    if (newStepEl) {
      newStepEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Фокус на поле ввода названия
      const titleInput = newStepEl.querySelector('.step-input')
      if (titleInput) titleInput.focus()
    }
  })
}

// Сохранить новый шаг (кнопка "Добавить")
async function saveNewStep(step) {
  // Валидация: нельзя создать шаг с пустым названием
  if (!step.title?.trim()) {
    showToast('Введите название шага', 'error')
    return
  }
  
  // Сохраняем шаг (флаг isNew будет убран только при успехе)
  await saveSingleStep(step)
}

async function saveSingleStep(step) {
  if (!goalBackendId.value || isLocalId.value) {
    // Для локальных целей просто обновляем UI
    step.isNew = false
    store.updateGoal(goal.value.id, { steps: goalForm.value.steps })
    showToast('Шаг добавлен')
    return
  }
  
  try {
    const { updateGoalSteps } = await import('@/services/api.js')
    
    const goalIdInt = parseInt(goalBackendId.value, 10)
    
    const stepData = {
      goal_id: goalIdInt,
      step_id: step.backendId || null,
      title: step.title,
      description: step.comment || '',
      priority: mapPriorityToBackend(step.priority) || null,
      time_duration: mapTimeToBackend(step.timeEstimate),
      dt: step.scheduledDate || null,
      is_complete: step.completed || false
    }
    
    console.log('[GoalEdit] Saving single step:', stepData)
    
    const result = await updateGoalSteps({ goals_steps_data: [stepData] })
    
    if (result.status === 'ok') {
      // Только при успехе убираем флаг isNew
      step.isNew = false
      
      // Обновляем backendId для созданного шага
      if (result.data?.created_steps?.length > 0) {
        step.backendId = result.data.created_steps[0].step_id
      }
      
      // Обновляем snapshot для этого шага
      takeStepsSnapshot()
      
      // Обновляем локальное хранилище
      store.updateGoal(goal.value.id, { steps: goalForm.value.steps })
      
      showToast('Шаг добавлен')
    } else {
      // При ошибке шаг остаётся в списке "новых" для повторной попытки
      showToast('Ошибка сохранения шага', 'error')
    }
  } catch (error) {
    console.error('[GoalEdit] Error saving step:', error)
    // При ошибке шаг остаётся в списке "новых" для повторной попытки
    showToast('Ошибка сохранения шага', 'error')
  }
}

// Обработка focusout со всего шаблона нового шага
function handleNewStepFocusOut(step, event) {
  // Для AI-сгенерированных шагов НЕ сохраняем автоматически при потере фокуса
  // Пользователь должен явно нажать "Добавить" или "Удалить"
  if (step.id?.startsWith('ai-')) {
    return
  }
  
  // Проверяем, остаётся ли фокус внутри этого же шаблона
  const stepCard = event.currentTarget
  const relatedTarget = event.relatedTarget
  
  // Если фокус уходит внутрь этого же шаблона - игнорируем
  if (relatedTarget && stepCard.contains(relatedTarget)) {
    return
  }
  
  // Фокус ушёл полностью с шаблона
  // Если есть название - сохраняем автоматически (только для ручных шагов)
  if (step.title?.trim()) {
    saveNewStep(step)
  }
}

function handleDragStart(index, event) {
  dragIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', index)
}

function handleDragEnd() {
  dragIndex.value = null
  dragOverIndex.value = null
  stopAutoScroll()
}

function handleDragOver(index, event) {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  dragOverIndex.value = index
}

// Автоскролл при перетаскивании за пределы видимой области
function handleContainerDragOver(event) {
  if (!stepsContainer.value || dragIndex.value === null) return
  
  const container = stepsContainer.value
  const rect = container.getBoundingClientRect()
  const mouseY = event.clientY
  const scrollZoneHeight = 60 // пикселей от края для активации скролла
  const scrollSpeed = 5 // скорость скролла
  
  // Проверяем, находится ли курсор в зоне скролла
  if (mouseY < rect.top + scrollZoneHeight) {
    // Скролл вверх
    startAutoScroll(-scrollSpeed)
  } else if (mouseY > rect.bottom - scrollZoneHeight) {
    // Скролл вниз
    startAutoScroll(scrollSpeed)
  } else {
    stopAutoScroll()
  }
}

function startAutoScroll(speed) {
  if (autoScrollInterval) return
  
  autoScrollInterval = setInterval(() => {
    if (stepsContainer.value) {
      stepsContainer.value.scrollTop += speed
    }
  }, 16) // ~60fps
}

function stopAutoScroll() {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval)
    autoScrollInterval = null
  }
}

function handleDrop(index, event) {
  event.preventDefault()
  const fromIndex = dragIndex.value
  if (fromIndex !== null && fromIndex !== index) {
    const steps = [...goalForm.value.steps]
    const [movedStep] = steps.splice(fromIndex, 1)
    steps.splice(index, 0, movedStep)
    goalForm.value.steps = steps
    autoSave()
  }
  dragIndex.value = null
  dragOverIndex.value = null
}

async function removeStep(index) {
  const step = goalForm.value.steps[index]
  
  // Optimistic UI: remove locally first
  goalForm.value.steps.splice(index, 1)
  recalculateProgress()
  autoSave()
  
  // Sync deletion to backend if step has backendId
  if (step?.backendId && goalBackendId.value) {
    try {
      const { updateGoalSteps } = await import('@/services/api.js')
      await updateGoalSteps({
        goals_steps_data: [{
          goal_id: goalBackendId.value,
          step_id: step.backendId,
          is_deleted: true
        }]
      })
    } catch (error) {
      console.error('[GoalEdit] Error deleting step from backend:', error)
    }
  }
}

function updateStep(index, field, value) {
  goalForm.value.steps[index][field] = value
}

function updateStepAndSave(index, field, value) {
  goalForm.value.steps[index][field] = value
  autoSave()
}

function toggleStepCompletion(index) {
  const step = goalForm.value.steps[index]
  if (!step.title.trim()) {
    showToast('Сначала введите название шага', 'error')
    return
  }
  step.completed = !step.completed
  step.status = step.completed ? 'completed' : 'pending'
  recalculateProgress()
  autoSave()
}

// Обработка комментария с авто-расширением
function handleCommentInput(index, event) {
  const textarea = event.target
  updateStep(index, 'comment', textarea.value)
  
  // Авто-расширение (макс 7 строк)
  textarea.style.height = 'auto'
  const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20
  const maxHeight = lineHeight * 7 + 16 // 7 строк + padding
  const newHeight = Math.min(textarea.scrollHeight, maxHeight)
  textarea.style.height = newHeight + 'px'
  
  if (textarea.scrollHeight > maxHeight) {
    textarea.style.overflowY = 'auto'
  } else {
    textarea.style.overflowY = 'hidden'
  }
}

function recalculateProgress() {
  if (goalForm.value.steps.length > 0) {
    const completed = goalForm.value.steps.filter(s => s.completed).length
    goalForm.value.progress = Math.round((completed / goalForm.value.steps.length) * 100)
  } else {
    goalForm.value.progress = 0
  }
}

// Автосохранение с debounce
let saveTimeout = null
let pendingSave = false

function autoSave() {
  if (saveTimeout) clearTimeout(saveTimeout)
  pendingSave = true
  saveTimeout = setTimeout(() => {
    doSave()
  }, 500)
}

function getStepsHash() {
  // Исключаем пустые шаги из хэша
  return JSON.stringify(goalForm.value.steps
    .filter(s => s.title && s.title.trim())
    .map(s => ({
      id: s.id,
      title: s.title,
      completed: s.completed,
      comment: s.comment,
      timeEstimate: s.timeEstimate,
      priority: s.priority,
      scheduledDate: s.scheduledDate,
      status: s.status
    })))
}

async function doSave(showNotification = true) {
  if (!goal.value) return
  
  const currentHash = getStepsHash()
  
  // Не сохранять если нет изменений
  if (currentHash === lastSavedHash) {
    pendingSave = false
    return
  }
  
  isSaving.value = true
  pendingSave = false
  
  try {
    const stepsToSave = goalForm.value.steps
      .filter(s => s.title.trim())
      .map((s) => ({
        id: s.id || `step_${Date.now()}_${Math.random()}`,
        backendId: s.backendId || null,
        title: s.title,
        completed: s.completed || false,
        comment: s.comment || '',
        timeEstimate: s.timeEstimate || '',
        priority: s.priority || '',
        scheduledDate: s.scheduledDate || '',
        status: s.status || (s.completed ? 'completed' : 'pending'),
        order: s.order  // Preserve original order from backend, don't overwrite with index!
      }))

    const progress = stepsToSave.length > 0
      ? Math.round((stepsToSave.filter(s => s.completed).length / stepsToSave.length) * 100)
      : 0

    // Optimistic UI: update local state first
    store.updateGoal(goal.value.id, {
      steps: stepsToSave,
      progress: progress
    })
    
    // НЕ убираем флаг isNew здесь автоматически!
    // Флаг убирается только при явном сохранении шага через saveNewStep()
    // Это позволяет AI-сгенерированным шагам оставаться "новыми" до явного подтверждения
    
    lastSavedHash = currentHash
    
    if (showNotification) {
      showToast('Изменения сохранены')
    }
    
    // Sync with backend (non-blocking)
    // Только шаги БЕЗ флага isNew - они ждут явного подтверждения
    if (goalBackendId.value) {
      const confirmedSteps = goalForm.value.steps.filter(s => !s.isNew && s.title?.trim())
      if (confirmedSteps.length > 0) {
        syncStepsToBackend(confirmedSteps)
      }
    }
  } catch (e) {
    showToast('Ошибка сохранения', 'error')
  } finally {
    isSaving.value = false
  }
}

// Snapshot of steps for change detection
let stepsSnapshot = []

function takeStepsSnapshot() {
  stepsSnapshot = goalForm.value.steps.map(s => ({
    id: s.id,
    backendId: s.backendId,
    title: s.title,
    comment: s.comment || '',
    priority: s.priority || '',
    timeEstimate: s.timeEstimate || '',
    scheduledDate: s.scheduledDate || '',
    completed: s.completed || false,
    order: s.order
  }))
}

// Get only changed steps for backend sync
function getChangedSteps(currentSteps) {
  const changedSteps = []
  
  currentSteps.forEach((step) => {
    // Skip new steps without title (empty new steps)
    if (step.isNew && !step.title?.trim()) return
    
    const snapshot = stepsSnapshot.find(s => s.id === step.id)
    
    if (!snapshot) {
      // New step - send all fields EXCEPT order (backend assigns order automatically)
      // Only if step has backendId === undefined (truly new, not just missing from snapshot)
      if (!step.backendId) {
        changedSteps.push({
          step,
          isNew: true,
          changedFields: ['title', 'description', 'priority', 'time_duration', 'dt', 'is_complete']
        })
      }
      // If step has backendId but not in snapshot - it was loaded later, skip it
      // (don't send existing steps that we didn't modify)
    } else {
      // Check what changed - compare step.order with snapshot.order (not array index)
      const changes = []
      if (step.title !== snapshot.title) changes.push('title')
      if ((step.comment || '') !== snapshot.comment) changes.push('description')
      if ((step.priority || '') !== snapshot.priority) changes.push('priority')
      if ((step.timeEstimate || '') !== snapshot.timeEstimate) changes.push('time_duration')
      if ((step.scheduledDate || '') !== snapshot.scheduledDate) changes.push('dt')
      // Compare order as numbers to avoid type mismatch issues
      const currentOrder = step.order ?? -1
      const snapshotOrder = snapshot.order ?? -1
      if (currentOrder !== snapshotOrder) changes.push('order')
      if ((step.completed || false) !== snapshot.completed) changes.push('is_complete')
      
      if (changes.length > 0) {
        changedSteps.push({ step, isNew: false, changedFields: changes })
      }
    }
  })
  
  return changedSteps
}

// Sync only changed steps to backend
async function syncStepsToBackend(steps) {
  // Don't sync to backend for local goals (dev mode)
  if (!goalBackendId.value || isLocalId.value) {
    console.log('[GoalEdit] Skipping backend sync for local goal')
    return
  }
  
  const changedSteps = getChangedSteps(steps)
  
  if (changedSteps.length === 0) {
    console.log('[GoalEdit] No changes to sync')
    return
  }
  
  try {
    const { updateGoalSteps } = await import('@/services/api.js')
    
    // Convert goalBackendId to integer
    const goalIdInt = parseInt(goalBackendId.value, 10)
    
    const stepsData = changedSteps.map(({ step, changedFields }) => {
      const data = {
        goal_id: goalIdInt,
        step_id: step.backendId || null
      }
      
      // Only include changed fields
      if (changedFields.includes('title')) data.title = step.title
      if (changedFields.includes('description')) data.description = step.comment || ''
      if (changedFields.includes('priority')) data.priority = mapPriorityToBackend(step.priority) || null
      if (changedFields.includes('time_duration')) data.time_duration = mapTimeToBackend(step.timeEstimate)
      if (changedFields.includes('dt')) data.dt = step.scheduledDate || null
      if (changedFields.includes('order')) data.order = step.order
      if (changedFields.includes('is_complete')) data.is_complete = step.completed || false
      
      return data
    })
    
    console.log('[GoalEdit] Syncing', stepsData.length, 'changed steps:', stepsData.map(s => ({ step_id: s.step_id, fields: Object.keys(s).filter(k => k !== 'goal_id' && k !== 'step_id') })))
    
    await updateGoalSteps({ goals_steps_data: stepsData })
    
    // Update snapshot after successful sync
    takeStepsSnapshot()
    
  } catch (error) {
    console.error('[GoalEdit] Error syncing steps to backend:', error)
  }
}

// Синхронное сохранение (flush pending) - всегда сохраняет текущее состояние
function flushSave(showNotification = true) {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
    saveTimeout = null
  }
  pendingSave = false
  // Всегда вызываем doSave для гарантии сохранения последнего состояния
  doSave(showNotification)
}

function saveGoalData() {
  flushSave(true)
}

function saveAndGoToBank() {
  // Сначала сохраняем синхронно (без toast, покажем свой)
  flushSave(false)
  showToast('Цель сохранена')
  
  // Получить фильтры из localStorage
  const savedFilters = localStorage.getItem('goalsBankFilters')
  let query = {}
  
  if (savedFilters) {
    try {
      query = JSON.parse(savedFilters)
    } catch (e) {
      // ignore
    }
  }
  
  // Переходим сразу без задержки
  router.push({ path: '/app/goals-bank', query })
}

function goBack() {
  // Сохранить изменения перед уходом
  flushSave(false)
  
  // Сохранить текущие фильтры банка целей
  const savedFilters = localStorage.getItem('goalsBankFilters')
  let query = {}
  
  if (savedFilters) {
    try {
      query = JSON.parse(savedFilters)
    } catch (e) {
      // ignore
    }
  }
  
  router.push({ path: '/app/goals-bank', query })
}

function deleteGoalConfirm() {
  if (confirm(`Удалить цель "${goal.value.title}"?`)) {
    store.deleteGoal(goal.value.id)
    router.push('/app/goals-bank')
  }
}

function getStatusLabel(status) {
  const labels = {
    active: 'Активна',
    completed: 'Завершена',
    paused: 'Приостановлена'
  }
  return labels[status] || status
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

</script>

<style scoped>
.goal-edit-container {
  max-width: var(--content-width-narrow);
  margin: 0 auto;
  padding: var(--container-padding);
  position: relative;
}

/* Compact Sticky Header */
.goal-header-compact {
  background: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: var(--radius-lg, 12px);
  padding: 0.75rem 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
  margin-bottom: 1rem;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: var(--hover-bg, #f3f4f6);
  border-radius: 50%;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
}

.btn-back:hover {
  background: var(--border-color, #e5e7eb);
  color: var(--text-primary, #1f2937);
}

.header-title-section {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.header-goal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.header-sphere-badge {
  display: inline-block;
  font-size: 0.75rem;
  color: var(--sphere-color, var(--primary, #6366f1));
  margin-top: 2px;
}

.btn-settings {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  flex-shrink: 0;
  border-radius: 50%;
  transition: all 0.2s;
}

.btn-settings:hover {
  background: var(--hover-bg, #f3f4f6);
  color: var(--primary, #6366f1);
}

.header-progress {
  margin-top: 0.5rem;
}

.progress-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar-track {
  flex: 1;
  height: 6px;
  background: var(--border-color, #e5e7eb);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--primary, #6366f1);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text-inline {
  font-size: 0.8125rem;
  color: var(--text-secondary, #6b7280);
  font-weight: 500;
  white-space: nowrap;
}

/* card-no-header - убран, оба блока имеют одинаковый стиль */

/* Combined Search + Filter Bar */
.search-filter-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
  margin-bottom: 0.75rem;
}

.search-filter-bar .search-input-wrapper {
  flex-shrink: 0;
  width: 140px;
  min-width: 100px;
}

.filter-chips-scroll {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.filter-chips-scroll::-webkit-scrollbar {
  display: none;
}

.filter-chips-inner {
  display: flex;
  gap: 0.5rem;
  padding: 2px 4px;
  white-space: nowrap;
}

/* Expandable Search */
.search-expandable {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.search-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.search-icon-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--primary-color);
}

.search-expandable.expanded .search-input-wrapper {
  width: 160px;
  animation: expandSearch 0.2s ease-out;
}

@keyframes expandSearch {
  from {
    width: 36px;
    opacity: 0;
  }
  to {
    width: 160px;
    opacity: 1;
  }
}

.search-close-btn {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
}

.search-close-btn:hover {
  background: var(--danger-color);
  color: #fff;
}

/* AI Steps Inline Button */
.btn-ai-steps-inline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-ai-steps-inline:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-ai-steps-inline:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-ai-steps-inline.generating {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
}

@media (max-width: 768px) {
  .search-icon-btn {
    width: 32px;
    height: 32px;
  }
  
  .search-expandable.expanded .search-input-wrapper {
    width: 120px;
  }
  
  .btn-ai-steps-inline {
    padding: 0.4rem 0.75rem;
    font-size: 0.75rem;
  }
  
  .btn-ai-steps-inline .btn-ai-label {
    display: none;
  }
}

/* AI Confirm Modal */
.ai-confirm-modal {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 480px;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.ai-confirm-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.ai-confirm-header h3 {
  flex: 1;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.ai-confirm-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.ai-confirm-body {
  padding: 1.5rem;
}

.ai-confirm-description {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.ai-confirm-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
}

.ai-confirm-warning svg {
  color: #f59e0b;
  flex-shrink: 0;
  margin-top: 2px;
}

.ai-confirm-warning div {
  font-size: 0.875rem;
  color: var(--text-primary);
  line-height: 1.5;
}

.ai-confirm-goal {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 1rem;
}

.ai-confirm-goal label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  display: block;
}

.goal-title-preview {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.ai-confirm-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.ai-confirm-footer .btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .ai-confirm-modal {
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }
}

/* Toast уведомления */
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: var(--shadow-lg);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
}

.toast.success {
  background: rgba(16, 185, 129, 0.1);
  border-color: var(--success-color);
  color: var(--success-color);
}

.toast.error {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--danger-color);
  color: var(--danger-color);
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  max-width: 900px;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-danger-outline {
  background: transparent;
  border: 1px solid var(--danger-color);
  color: var(--danger-color);
}

.btn-danger-outline:hover {
  background: var(--danger-color);
  color: white;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-state p {
  color: var(--text-secondary);
  margin: 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color, #e5e7eb);
  border-top-color: var(--primary-color, #6366f1);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.steps-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1.5rem;
  min-height: 300px;
}

.steps-empty-state .empty-icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--bg-tertiary, #f3f4f6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary, #6b7280);
  margin-bottom: 1rem;
}

.steps-empty-state h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary, #111827);
  margin: 0 0 0.5rem 0;
}

.steps-empty-state p {
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.steps-empty-state .btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.empty-state-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.ai-steps-generate-empty {
  position: relative;
}

.ai-steps-tooltip-empty {
  bottom: auto;
  top: calc(100% + 8px);
}

.ai-steps-tooltip-empty::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-bottom-color: var(--border-color, #e5e7eb);
}

@media (min-width: 480px) {
  .empty-state-actions {
    flex-direction: row;
    gap: 0.75rem;
  }
}

.edit-layout {
  display: flex;
  flex-direction: column;
  gap: 0;
  max-width: 900px;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-content .card {
  padding: 1rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: var(--radius-lg, 12px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.card-header h3 {
  font-size: 1.25rem;
  margin: 0;
}

/* Заголовок декомпозиции с названием цели */
.decomposition-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.goal-title-in-header {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
  line-height: 1.3;
}

.decomposition-header h3 {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0;
}

/* Кнопки внизу страницы */
.footer-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.goal-status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.goal-status-badge.active {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.goal-status-badge.completed {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
}


.goal-info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.goal-info-item {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.sphere-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sphere-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.1);
  color: var(--sphere-color, #6366f1);
  border: 1.5px solid var(--sphere-color, var(--border-color));
}

.sphere-name {
  font-weight: 500;
  color: var(--text-primary);
}

.steps-count {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.decomposition-hint {
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

/* Поиск и фильтр */
.search-bar {
  margin-bottom: 0.75rem;
}

.filter-chips {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.filter-chip:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.filter-chip.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
}

.search-input-wrapper .search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.search-input {
  width: 100%;
  padding: 0.5rem 2rem 0.5rem 2.25rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  background: var(--bg-primary);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.search-clear {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
}

/* Кнопка фильтра */
.filter-dropdown-wrapper {
  position: relative;
}

.btn-filter-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.btn-filter-icon:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-filter-icon.active {
  border-color: var(--primary-color);
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
}

.btn-filter-icon.open {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.filter-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  background: var(--primary-color);
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Dropdown фильтров */
.filter-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 200px;
  z-index: 100;
}

.filter-dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  font-weight: 500;
}

.btn-reset-filters {
  font-size: 0.8125rem;
  color: var(--primary-color);
  padding: 0;
}

.filter-option {
  padding: 0.75rem 1rem;
}

.filter-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.filter-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  background: var(--bg-primary);
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.filter-dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
}

.drag-disabled-hint {
  padding: 0.5rem 0.75rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  color: #b45309;
  margin-bottom: 0.75rem;
}

.steps-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.steps-section.has-scroll {
  overflow-y: auto;
  padding-right: 0.5rem;
}

.step-card {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.step-card.priority-critical:not(.step-completed) {
  border-left-color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
}

.step-card.priority-desirable:not(.step-completed) {
  border-left-color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}

.step-card.priority-attention:not(.step-completed) {
  border-left-color: #3b82f6;
  background: rgba(59, 130, 246, 0.06);
}

.step-card.priority-optional:not(.step-completed) {
  border-left-color: #9ca3af;
  background: rgba(156, 163, 175, 0.06);
}

/* Расширенный вид карточки */
.step-card-expanded {
  align-items: center;
  padding: 0.625rem 0.75rem;
}

.step-card-expanded .step-main {
  flex: 1;
  min-width: 0;
}

.step-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.375rem;
}

.step-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary, #6b7280);
}

.step-meta-item svg {
  opacity: 0.7;
}

.priority-indicator {
  font-weight: 500;
}

.priority-indicator.priority-critical {
  color: #ef4444;
}

.priority-indicator.priority-desirable {
  color: #f97316;
}

.priority-indicator.priority-attention {
  color: #3b82f6;
}

.priority-indicator.priority-optional {
  color: #9ca3af;
}

.priority-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* Шеврон - индикатор кликабельности */
.step-chevron {
  color: var(--text-muted, #9ca3af);
  flex-shrink: 0;
  opacity: 0.6;
  transition: opacity 0.2s, transform 0.2s;
}

.step-card-clickable:hover .step-chevron {
  opacity: 1;
  transform: translateX(2px);
}

/* Чекбокс справа */
.step-checkbox-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  border-radius: 50%;
  flex-shrink: 0;
  transition: all 0.2s;
  margin-left: auto;
}

.step-checkbox-btn:hover {
  background: var(--hover-bg, #f3f4f6);
  color: var(--primary, #6366f1);
}

.step-checkbox-btn.checked {
  color: #10b981;
}

.step-checkbox-btn.checked:hover {
  color: #059669;
}

/* Inline добавление шага (как в Remente) */
.inline-add-step {
  margin-top: 0.75rem;
  padding: 0.25rem 0;
}

.inline-add-step-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary, #f9fafb);
  border: 2px dashed var(--border-color, #e5e7eb);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.inline-add-step-input-wrapper:focus-within {
  background: var(--bg-primary, #ffffff);
  border-color: var(--primary, #6366f1);
  border-style: solid;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.inline-add-icon {
  color: var(--text-secondary, #6b7280);
  flex-shrink: 0;
  transition: color 0.2s;
}

.inline-add-step-input-wrapper:focus-within .inline-add-icon {
  color: var(--primary, #6366f1);
}

.inline-add-step-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.9375rem;
  color: var(--text-primary, #111827);
  outline: none;
  padding: 0;
  min-width: 0;
}

.inline-add-step-input::placeholder {
  color: var(--text-secondary, #9ca3af);
}

.inline-add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--primary, #6366f1);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.inline-add-btn:hover {
  background: var(--primary-dark, #4f46e5);
  transform: scale(1.05);
}

.inline-add-btn:active {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .inline-add-step-input-wrapper {
    padding: 0.875rem 1rem;
  }
  
  .inline-add-step-input {
    font-size: 1rem;
  }
}

/* AI генерация шагов */
.ai-steps-generate {
  position: relative;
  margin-top: 0.75rem;
  display: flex;
  justify-content: center;
}

.btn-ai-steps {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
}

.btn-ai-steps:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.35);
}

.btn-ai-steps:active:not(:disabled) {
  transform: translateY(0);
}

.btn-ai-steps:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-ai-steps.generating {
  background: linear-gradient(135deg, #a78bfa 0%, #818cf8 100%);
}

.btn-ai-steps .spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ai-steps-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-primary, #fff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 100;
  width: 220px;
  text-align: center;
}

.ai-steps-tooltip strong {
  display: block;
  color: var(--primary, #6366f1);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.ai-steps-tooltip p {
  color: var(--text-secondary, #6b7280);
  font-size: 0.8rem;
  margin: 0;
  line-height: 1.4;
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}

/* FAB кнопка добавления шага */
.fab-add-step {
  position: fixed;
  bottom: 2rem;
  right: 80px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary, #6366f1);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  transition: all 0.2s;
  z-index: 999;
}

.fab-add-step:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5);
}

.fab-add-step:active {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .fab-add-step {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 52px;
    height: 52px;
  }
}

/* Мини-журнал */
.mini-journal-section {
  margin-top: 1.5rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
  padding-top: 1rem;
}

.mini-journal-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary, #f9fafb);
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary, #111827);
  cursor: pointer;
  transition: all 0.2s;
}

.mini-journal-toggle:hover {
  background: var(--bg-hover, #f3f4f6);
}

.mini-journal-toggle .toggle-icon {
  margin-left: auto;
  transition: transform 0.2s;
  color: var(--text-secondary, #9ca3af);
}

.mini-journal-toggle .toggle-icon.rotated {
  transform: rotate(180deg);
}

.journal-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: var(--primary, #6366f1);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 10px;
}

.mini-journal-content {
  padding: 1rem 0;
}

.journal-input-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

.journal-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  font-size: 0.9rem;
  resize: none;
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #111827);
  transition: border-color 0.2s;
}

.journal-input:focus {
  outline: none;
  border-color: var(--primary, #6366f1);
}

.journal-input::placeholder {
  color: var(--text-secondary, #9ca3af);
}

.journal-add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: var(--primary, #6366f1);
  color: white;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.journal-add-btn:hover:not(:disabled) {
  background: var(--primary-dark, #4f46e5);
}

.journal-add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.journal-entries {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.journal-entry {
  padding: 0.875rem;
  background: var(--bg-secondary, #f9fafb);
  border-radius: 10px;
  border-left: 3px solid var(--primary, #6366f1);
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.entry-date {
  font-size: 0.75rem;
  color: var(--text-secondary, #9ca3af);
  font-weight: 500;
}

.entry-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--text-secondary, #9ca3af);
  cursor: pointer;
  border-radius: 4px;
  opacity: 0;
  transition: all 0.15s;
}

.journal-entry:hover .entry-delete {
  opacity: 1;
}

.entry-delete:hover {
  background: #fee2e2;
  color: #ef4444;
}

.entry-text {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-primary, #111827);
  line-height: 1.5;
  white-space: pre-wrap;
}

.journal-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--text-secondary, #9ca3af);
  text-align: center;
}

.journal-empty p {
  margin: 0;
  font-size: 0.9rem;
}

/* Кнопка "Запланировать шаги" */
.plan-steps-section {
  margin-top: 1.5rem;
  padding-top: 1rem;
}

.plan-steps-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.plan-steps-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.plan-steps-btn:active {
  transform: translateY(0);
}

.unscheduled-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 11px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Блок рефлексии (свёрнут по умолчанию) */
.goal-reflection-block {
  margin: 0.75rem 1rem 0;
  padding: 0;
}

.reflection-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--card-bg, #f9fafb);
  border: 1px solid var(--border-light, #e5e7eb);
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary, #374151);
  cursor: pointer;
  transition: all 0.2s;
}

.reflection-toggle-btn:hover {
  background: var(--card-bg-hover, #f3f4f6);
}

.reflection-toggle-btn svg:first-child {
  color: var(--primary, #6366f1);
}

.toggle-chevron {
  margin-left: auto;
  transition: transform 0.25s;
  color: var(--text-secondary, #9ca3af);
}

.toggle-chevron.rotated {
  transform: rotate(180deg);
}

.reflection-content {
  padding: 1rem;
  background: var(--card-bg, #f9fafb);
  border: 1px solid var(--border-light, #e5e7eb);
  border-top: none;
  border-radius: 0 0 10px 10px;
  margin-top: -1px;
}

.reflection-item {
  margin-bottom: 0.75rem;
}

.reflection-item:last-child {
  margin-bottom: 0;
}

.reflection-item label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 0.25rem;
}

.reflection-item p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-primary, #374151);
  line-height: 1.5;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 500px;
}

/* Bottom Sheet стили */
.bottom-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bottom-sheet {
  background: var(--bg-primary, #ffffff);
  border-radius: 1rem 1rem 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.bottom-sheet-handle {
  width: 36px;
  height: 4px;
  background: var(--border-color, #e5e7eb);
  border-radius: 2px;
  margin: 0.75rem auto;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  justify-content: space-around;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.quick-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s;
  font-size: 0.75rem;
}

.quick-action-btn:hover {
  background: var(--hover-bg, #f3f4f6);
}

.quick-action-btn.active {
  color: #10b981;
}

.quick-action-btn.danger {
  color: #ef4444;
}

.quick-action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Step Modal Tabs */
.step-modal-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.step-modal-tabs .tab-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  font-weight: 500;
  position: relative;
  transition: color 0.2s;
}

.step-modal-tabs .tab-btn.active {
  color: var(--primary, #6366f1);
}

.step-modal-tabs .tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--primary, #6366f1);
}

.bottom-sheet-body {
  padding: 1rem;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Priority Selector */
.priority-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.priority-option {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color, #e5e7eb);
  background: transparent;
  border-radius: 2rem;
  cursor: pointer;
  font-size: 0.8125rem;
  color: var(--text-secondary, #6b7280);
  transition: all 0.2s;
}

.priority-option:hover {
  border-color: var(--text-secondary, #6b7280);
}

.priority-option.active {
  border-color: currentColor;
  font-weight: 500;
}

.priority-option.critical { color: #ef4444; }
.priority-option.desirable { color: #f97316; }
.priority-option.attention { color: #3b82f6; }
.priority-option.optional { color: #9ca3af; }

.priority-option.active.critical { background: rgba(239, 68, 68, 0.1); }
.priority-option.active.desirable { background: rgba(249, 115, 22, 0.1); }
.priority-option.active.attention { background: rgba(59, 130, 246, 0.1); }
.priority-option.active.optional { background: rgba(156, 163, 175, 0.1); }

.bottom-sheet-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.bottom-sheet-footer .btn {
  flex: 1;
}

.step-bottom-sheet-simple {
  max-height: 80vh;
}

/* Checklist стили */
.checklist-section {
  margin-top: 0.5rem;
}

.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  min-height: 48px;
}

.checklist-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  color: var(--text-secondary, #9ca3af);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.15s;
  flex-shrink: 0;
}

.checklist-checkbox:hover {
  background: var(--bg-secondary, #f3f4f6);
  color: var(--primary, #6366f1);
}

.checklist-checkbox.checked {
  color: #10b981;
}

.checklist-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  color: var(--text-primary, #111827);
  padding: 0.375rem 0;
  outline: none;
  min-width: 0;
}

.checklist-input::placeholder {
  color: var(--text-secondary, #9ca3af);
}

.checklist-input.completed {
  text-decoration: line-through;
  color: var(--text-secondary, #9ca3af);
}

.checklist-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  color: var(--text-secondary, #9ca3af);
  cursor: pointer;
  border-radius: 8px;
  opacity: 0.5;
  transition: all 0.15s;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .checklist-remove {
    opacity: 1;
  }
}

.checklist-item:hover .checklist-remove {
  opacity: 1;
}

.checklist-remove:hover {
  background: #fee2e2;
  color: #ef4444;
}

.add-checklist-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.375rem;
  padding: 0.375rem 0;
  font-size: 0.85rem;
  color: var(--primary, #6366f1);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s;
}

.add-checklist-btn:hover {
  opacity: 0.8;
}

.step-params-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: nowrap;
  margin-top: 0.5rem;
}

.param-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  flex: 1;
  padding: 0.625rem 0.5rem;
  min-height: 44px;
  background: var(--bg-secondary, #f3f4f6);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.param-chip.has-value {
  background: rgba(99, 102, 241, 0.08);
  border-color: var(--primary-color, #6366f1);
  color: var(--primary-color, #6366f1);
}

.param-chip:hover {
  background: var(--bg-hover, #e5e7eb);
}

.param-chip.priority-chip.priority-critical {
  background: rgba(239, 68, 68, 0.12);
  border-color: #ef4444;
  color: #dc2626;
}

.param-chip.priority-chip.priority-desirable {
  background: rgba(245, 158, 11, 0.12);
  border-color: #f59e0b;
  color: #d97706;
}

.param-chip.priority-chip.priority-attention {
  background: rgba(59, 130, 246, 0.12);
  border-color: #3b82f6;
  color: #2563eb;
}

.param-chip.priority-chip.priority-optional {
  background: rgba(156, 163, 175, 0.12);
  border-color: #9ca3af;
  color: #6b7280;
}

.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.add-comment-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-muted, #9ca3af);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.add-comment-btn:hover {
  color: var(--primary-color, #6366f1);
}

.param-dropdown {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: var(--bg-secondary, #f9fafb);
  border-radius: 8px;
}

.param-inputs-row {
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
  padding: 1rem;
  background: var(--bg-secondary, #f9fafb);
  border-radius: var(--radius-md, 8px);
}

.time-options-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-secondary, #f9fafb);
  border-radius: var(--radius-md, 8px);
}

.time-chip {
  padding: 0.5rem 1rem;
  min-height: 44px;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-primary, #fff);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.time-chip:hover {
  border-color: var(--primary-color, #6366f1);
}

.time-chip.active {
  background: var(--primary-color, #6366f1);
  color: #fff;
  border-color: var(--primary-color, #6366f1);
}

.date-picker-row {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-secondary, #f9fafb);
  border-radius: var(--radius-md, 8px);
}

.param-input-group {
  flex: 1;
  min-width: 0;
}

.param-input-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted, #9ca3af);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.param-input-group .form-input {
  width: 100%;
}

.form-input-small {
  max-width: 100%;
}

/* Redesigned Step Footer */
.step-footer-redesigned {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-primary, #fff);
  position: sticky;
  bottom: 0;
}

.step-footer-redesigned .btn-save {
  flex: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  min-height: 44px;
  border: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-secondary, #f3f4f6);
  border-radius: var(--radius-md, 8px);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.action-btn:hover {
  background: var(--bg-hover, #e5e7eb);
}

.action-btn.action-complete.active {
  background: rgba(34, 197, 94, 0.12);
  border-color: #22c55e;
  color: #16a34a;
}

.action-btn.action-delete {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
}

.action-btn.action-delete:hover {
  background: rgba(239, 68, 68, 0.12);
  border-color: #ef4444;
}

.btn-save {
  min-height: 44px;
  padding: 0.625rem 1.25rem;
}

/* Delete Confirm Modal */
.delete-confirm-overlay {
  z-index: 1100;
}

.delete-confirm-modal {
  background: var(--bg-primary, #fff);
  border-radius: var(--radius-lg, 12px);
  padding: 1.5rem;
  width: 100%;
  max-width: 340px;
  text-align: center;
  box-shadow: var(--shadow-xl);
}

.delete-confirm-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
}

.delete-confirm-modal h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: var(--text-primary, #111827);
}

.delete-confirm-modal p {
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
  margin: 0 0 1.25rem;
  line-height: 1.5;
}

.delete-confirm-actions {
  display: flex;
  gap: 0.75rem;
}

.delete-confirm-actions .btn {
  flex: 1;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-danger {
  background: #ef4444;
  color: #fff;
  border: none;
}

.btn-danger:hover {
  background: #dc2626;
}

@media (max-width: 768px) {
  .step-footer-redesigned {
    gap: 0.75rem;
    padding: 1rem;
  }
  
  .action-btn.action-delete {
    flex-shrink: 0;
  }
  
  .btn-save {
    flex: 1;
  }
  
  .param-inputs-row {
    gap: 0.75rem;
    padding: 0.75rem;
  }
}

/* Legacy styles kept for compatibility */
.step-footer-simple {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.step-footer-simple .btn {
  flex: none;
}

.footer-spacer {
  flex: 1;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  background: var(--bg-secondary, #f3f4f6);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary, #6b7280);
}

.icon-btn:hover {
  background: var(--bg-hover, #e5e7eb);
}

.icon-btn.active {
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
}

.icon-btn.danger {
  color: #ef4444;
}

.icon-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Bottom Sheet transition */
.bottom-sheet-enter-active,
.bottom-sheet-leave-active {
  transition: opacity 0.3s;
}

.bottom-sheet-enter-active .bottom-sheet,
.bottom-sheet-leave-active .bottom-sheet {
  transition: transform 0.3s;
}

.bottom-sheet-enter-from,
.bottom-sheet-leave-to {
  opacity: 0;
}

.bottom-sheet-enter-from .bottom-sheet,
.bottom-sheet-leave-to .bottom-sheet {
  transform: translateY(100%);
}

/* Desktop: центрированная модалка */
@media (min-width: 769px) {
  .bottom-sheet-overlay {
    align-items: center;
  }
  
  .bottom-sheet {
    border-radius: 1rem;
    max-height: 80vh;
  }
  
  .bottom-sheet-handle {
    display: none;
  }
}

.step-card.step-completed {
  background: rgba(16, 185, 129, 0.08);
  border-left-color: var(--success-color);
}

.step-checkbox-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  margin-top: 0.25rem;
}

.step-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.step-checkbox-label {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.step-checkbox-label:hover {
  background: var(--bg-tertiary);
}

.check-icon {
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.check-icon.checked {
  color: var(--success-color);
}

.step-input.completed-text {
  text-decoration: line-through;
  color: var(--text-secondary);
  opacity: 0.7;
}

.step-drag-handle {
  cursor: grab;
  color: var(--text-secondary);
  padding: 0.25rem;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.step-drag-handle.disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.step-drag-handle:active:not(.disabled) {
  cursor: grabbing;
}

.step-card.drag-disabled {
  cursor: default;
}

.step-card.dragging {
  opacity: 0.5;
  background: var(--bg-tertiary);
}

.step-card.drag-over {
  border: 2px dashed var(--primary-color);
  background: rgba(99, 102, 241, 0.05);
}

/* Левая колонка с действиями (drag, checkbox, delete) */
.step-actions-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.step-delete-btn {
  padding: 0.25rem;
  width: 24px;
  height: 24px;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.step-card:hover .step-delete-btn {
  opacity: 1;
}

.step-delete-btn:hover {
  opacity: 1;
  background: rgba(239, 68, 68, 0.1);
}

/* Новые шаги (добавленные кнопкой) */
.new-steps-section {
  margin-top: 1rem;
}

.new-steps-divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  color: var(--text-secondary);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.new-steps-divider::before,
.new-steps-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.new-steps-warning {
  padding: 0.75rem 1rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: var(--radius-md);
  color: var(--warning-color);
  font-size: 0.875rem;
  text-align: center;
  margin-top: 1rem;
}

.new-step-card {
  border-style: dashed;
  border-color: var(--primary-color);
  background: rgba(99, 102, 241, 0.02);
  flex-direction: column;
  padding: 1rem;
}

.new-step-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.new-step-title-input {
  font-size: 1rem;
}

.new-step-footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.new-step-footer .step-comment-section {
  flex: 1;
  margin-top: 0;
}

.new-step-actions-row {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* Кнопка добавления нового шага */
.save-new-step-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  white-space: nowrap;
}

.delete-new-step-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  white-space: nowrap;
  color: var(--text-secondary);
}

.delete-new-step-btn:hover {
  color: var(--danger-color);
  background: rgba(239, 68, 68, 0.1);
}

.save-new-step-btn:hover {
  transform: translateY(-1px);
}

.step-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.step-title {
  font-size: 0.9375rem;
  color: var(--text-primary);
  line-height: 1.4;
}

.step-comment-preview {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.step-card-clickable {
  cursor: pointer;
}

.step-card-clickable:hover {
  background: var(--bg-secondary);
}

.step-completed-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--text-primary);
}

.step-completed-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.step-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  background: var(--bg-primary);
}

.step-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* Параметры шага */
.step-params {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.step-param-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  background: var(--bg-primary);
  cursor: pointer;
}

.step-param-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.priority-select-sm {
  min-width: 90px;
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

.time-select-sm {
  min-width: 80px;
}

.date-input-sm {
  min-width: 130px;
}

/* Новые шаги - упрощённая колонка действий */
.new-step-actions {
  justify-content: center;
  min-width: auto;
  width: auto;
  padding-top: 0.5rem;
}

/* Комментарий */
.step-comment-section {
  margin-top: 0.25rem;
}

.step-comment-section.collapsible {
  margin-top: 0.5rem;
}

.add-comment-toggle {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  cursor: pointer;
  padding: 0.25rem 0;
  transition: color 0.2s ease;
}

.add-comment-toggle:hover {
  color: var(--primary-color);
}

.step-comment-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  background: transparent;
  color: var(--text-secondary);
  resize: none;
  min-height: 32px;
  overflow-y: hidden;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.step-comment-input:focus {
  outline: none;
  border-color: var(--border-color);
  background: var(--bg-primary);
}

.step-comment-input::placeholder {
  color: var(--text-muted);
  font-style: italic;
}

.step-number-badge {
  width: 28px;
  height: 28px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.btn-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.btn-icon-danger {
  border-color: var(--border-color);
  color: var(--text-secondary);
}

.btn-icon-danger:hover {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}

/* Кнопка загрузить ещё */
.load-more-steps {
  display: flex;
  justify-content: center;
  padding: 0.5rem 0;
}

.add-step-btn {
  margin-top: 0.5rem;
}

.btn-with-icon {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.goal-meta-info {
  display: flex;
  gap: 2rem;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.goal-meta-info .meta-item {
  display: flex;
  gap: 0.5rem;
}

.goal-meta-info .meta-label {
  color: var(--text-muted);
}

/* Модальное окно */
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

.edit-modal {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.edit-modal.edit-modal-extended {
  max-width: 600px;
}

.edit-modal.edit-modal-redesigned {
  max-width: 520px;
  width: 95%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.quick-actions-goal {
  display: flex;
  gap: 0.5rem;
  padding: 0 1.25rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.quick-actions-goal .quick-action-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border-radius: 20px;
  border: none;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-actions-goal .quick-action-btn.action-complete {
  background: var(--success, #10b981);
  color: white;
}

.quick-actions-goal .quick-action-btn.action-complete:hover {
  background: #059669;
}

.modal-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  padding: 0 1.25rem;
  gap: 0.25rem;
}

.modal-tab {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.2s;
}

.modal-tab:hover {
  color: var(--text-primary, #1f2937);
}

.modal-tab.active {
  color: var(--primary, #6366f1);
  border-bottom-color: var(--primary, #6366f1);
}

.modal-body-tabs {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
}

.motivation-intro {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(99, 102, 241, 0.05);
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
}

.motivation-intro .motivation-icon {
  color: var(--primary, #6366f1);
}

.motivation-intro p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.form-textarea-visible {
  min-height: 80px;
  resize: vertical;
}

.status-card {
  background: var(--bg-secondary, #f9fafb);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 1rem;
}

.status-card:last-child {
  margin-bottom: 0;
}

.status-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
}

.status-card-header svg {
  color: var(--primary, #6366f1);
}

.status-description {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.status-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.toggle-label {
  font-size: 0.875rem;
  color: var(--text-primary);
}

.toggle-switch {
  width: 48px;
  height: 26px;
  background: var(--bg-tertiary, #e5e7eb);
  border: none;
  border-radius: 13px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-switch.active {
  background: var(--primary, #6366f1);
}

.toggle-slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.toggle-switch.active .toggle-slider {
  left: 25px;
}

.status-hint {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0;
}

.validation-buttons-new {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.btn-validation-new {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 2px solid var(--border-color, #e5e7eb);
  border-radius: var(--radius-md);
  background: transparent;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-validation-new.btn-confirm {
  color: var(--success, #10b981);
}

.btn-validation-new.btn-confirm.active {
  background: rgba(16, 185, 129, 0.1);
  border-color: var(--success, #10b981);
}

.btn-validation-new.btn-reject {
  color: var(--danger, #ef4444);
}

.btn-validation-new.btn-reject.active {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--danger, #ef4444);
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar-container {
  flex: 1;
  height: 8px;
  background: var(--bg-tertiary, #e5e7eb);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-container .progress-bar-fill {
  height: 100%;
  background: var(--primary, #6366f1);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
}

.status-card-danger {
  background: transparent;
  border: 1px dashed var(--danger, #ef4444);
  padding: 0.75rem;
}

.btn-full {
  width: 100%;
  justify-content: center;
}

.modal-footer-redesigned {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.modal-footer-with-delete {
  justify-content: space-between;
}

.modal-footer-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-danger-ghost {
  background: transparent;
  color: #ef4444;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-danger-ghost:hover {
  background: rgba(239, 68, 68, 0.1);
}

.modal-footer-redesigned .btn {
  flex: 1;
  justify-content: center;
}

.modal-footer-actions .btn {
  flex: none;
}

.form-input-large {
  font-size: 1rem;
  padding: 0.75rem;
}

.sphere-grid-compact {
  gap: 0.5rem;
}

.sphere-grid-compact .sphere-select-btn {
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
}

@media (max-width: 768px) {
  .edit-modal.edit-modal-redesigned {
    max-width: 100%;
    width: 100%;
    height: 100%;
    max-height: 100%;
    border-radius: 0;
  }
  
  .modal-tabs {
    padding: 0 1rem;
  }
  
  .modal-tab {
    flex: 1;
    justify-content: center;
    padding: 0.625rem 0.5rem;
    font-size: 0.8125rem;
  }
  
  .modal-tab span {
    display: none;
  }
  
  .quick-actions-goal {
    padding: 0 1rem;
  }
  
  .quick-actions-goal .quick-action-btn {
    flex: 1;
    justify-content: center;
    padding: 0.625rem 0.5rem;
  }
  
  .quick-actions-goal .quick-action-btn span {
    display: none;
  }
  
  .modal-body-tabs {
    padding: 1rem;
  }
  
  .validation-buttons-new {
    grid-template-columns: 1fr;
  }
}

/* Модалка добавления шага */
.add-step-modal {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
}

.add-step-modal .modal-footer {
  justify-content: flex-end;
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
}

/* Классы отображения для десктоп/мобильная */
.desktop-only {
  display: flex;
}

.mobile-only {
  display: none;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.125rem;
}

.modal-header-icon {
  color: var(--primary-color);
}

.modal-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-delete-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.375rem;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.modal-delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

.modal-footer-center {
  justify-content: center !important;
}

.btn-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--radius-sm);
}

.btn-close:hover {
  background: var(--bg-secondary);
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  background: var(--bg-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-textarea {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  background: var(--bg-primary);
  resize: vertical;
  min-height: 80px;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.sphere-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.sphere-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  cursor: pointer;
  font-size: 0.75rem;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.sphere-btn:hover {
  border-color: var(--sphere-color);
  background: rgba(99, 102, 241, 0.05);
}

.sphere-btn.active {
  border-color: var(--sphere-color);
  background: rgba(99, 102, 241, 0.1);
  color: var(--sphere-color);
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

.modal-footer-left {
  display: flex;
  gap: 0.5rem;
}

.modal-footer-right {
  display: flex;
  gap: 0.75rem;
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.sphere-select-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.sphere-select-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  cursor: pointer;
  font-size: 0.75rem;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.sphere-select-btn:hover {
  border-color: var(--sphere-color);
  background: rgba(99, 102, 241, 0.05);
}

.sphere-select-btn.active {
  border-color: var(--sphere-color);
  background: rgba(99, 102, 241, 0.1);
  color: var(--sphere-color);
}

.why-section-divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0 1rem;
}

.why-section-divider::before,
.why-section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.why-section-divider span {
  padding: 0 1rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.validation-section {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.validation-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.validation-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn-validation {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.btn-validation:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
  color: var(--text-primary);
}

.btn-validation.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.btn-true-goal {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.btn-true-goal:hover,
.btn-true-goal.active {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.btn-false-goal {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.btn-false-goal:hover,
.btn-false-goal.active {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  /* Переключение десктоп/мобильных элементов */
  .desktop-only {
    display: none !important;
  }
  
  .mobile-only {
    display: flex !important;
  }

  /* Центрирование заголовка на мобилке */
  .card-header {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
  }
  
  .decomposition-header {
    text-align: center;
    align-items: center;
  }
  
  .steps-count {
    text-align: center;
  }

  /* Скрыть встроенные новые шаги на мобильных */
  .new-steps-section {
    display: none;
  }

  /* Скрыть drag-handle на мобильных */
  .step-drag-handle {
    display: none !important;
  }

  /* Кнопка "Добавить" на полную ширину в мобильной версии */
  .save-new-step-btn {
    width: 100%;
    justify-content: center;
    min-height: 44px;
    align-self: stretch;
  }

  /* Карточка нового шага на мобильных */
  .new-step-card {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .new-step-card .step-actions-column {
    flex-direction: row;
    justify-content: flex-end;
    order: -1;
  }

  /* Увеличить touch targets */
  .step-checkbox {
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .step-delete-btn {
    min-width: 44px;
    min-height: 44px;
  }

  .step-params {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .step-param-select {
    width: 100%;
    min-height: 44px;
  }

  .goal-meta-info {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .sphere-selector,
  .sphere-select-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .validation-buttons {
    flex-direction: column;
  }

  .modal-footer {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }

  .modal-footer.modal-footer-redesigned {
    flex-direction: row !important;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  .modal-footer-left,
  .modal-footer-right {
    width: 100%;
    justify-content: stretch;
  }

  .modal-footer-right {
    flex-direction: row;
  }

  .modal-footer-left .btn,
  .modal-footer-right .btn {
    flex: 1;
  }

  /* Форма добавления шага - вертикальное расположение */
  .new-step-card .step-params {
    flex-direction: column;
    gap: 0.5rem;
  }

  .new-step-card .step-param-select {
    width: 100%;
  }
}

/* ========================================
   ЗАМЕТКИ (Notes) — Новые стили для интеграции с бэкендом
   ======================================== */

/* === Search Bar === */
.notes-search-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.75rem;
  gap: 0.5rem;
}

.notes-search-expandable {
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.notes-search-expandable.expanded {
  flex: 1;
  max-width: 100%;
}

.notes-search-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.notes-search-toggle-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.notes-search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  gap: 0.5rem;
  transition: border-color 0.2s;
}

.notes-search-input-wrapper:focus-within {
  border-color: #4f46e5;
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.notes-search-input-wrapper .search-icon {
  color: #9ca3af;
  flex-shrink: 0;
}

.notes-search-input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.875rem;
  background: transparent;
  color: #1f2937;
}

.notes-search-input-wrapper input::placeholder {
  color: #9ca3af;
}

.notes-search-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.notes-search-close-btn:hover {
  background: #f3f4f6;
  color: #ef4444;
}

/* === Loading State === */
.notes-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  gap: 0.75rem;
  color: #6b7280;
}

.notes-loading span {
  font-size: 0.875rem;
  font-weight: 500;
}

.loading-spinner-small {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* === Journal Entry — Edit Mode === */
.journal-entry {
  position: relative;
  padding: 0.875rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.journal-entry:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.journal-entry.editing {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.entry-date {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.entry-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.journal-entry:hover .entry-actions {
  opacity: 1;
}

.entry-edit,
.entry-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.entry-edit:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #3b82f6;
}

.entry-delete:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #ef4444;
}

.entry-text {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #1f2937;
  white-space: pre-wrap;
  word-break: break-word;
}

/* === Edit Mode === */
.entry-edit-mode {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.entry-edit-input {
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
  transition: all 0.2s;
  background: #f9fafb;
}

.entry-edit-input:focus {
  outline: none;
  border-color: #4f46e5;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.entry-edit-mode textarea {
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
  transition: all 0.2s;
  background: #f9fafb;
}

.entry-edit-mode textarea:focus {
  outline: none;
  border-color: #4f46e5;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.entry-edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-cancel-edit {
  padding: 0.5rem 1rem;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel-edit:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
  color: #374151;
}

.btn-cancel-edit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-save-edit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #4f46e5;
  border: 1px solid #4f46e5;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save-edit:hover:not(:disabled) {
  background: #4338ca;
  border-color: #4338ca;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
}

.btn-save-edit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* === Pagination === */
.notes-pagination-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  margin-top: 1rem;
  padding: 0.75rem 0;
  border-top: 1px solid #e5e7eb;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 0.5rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled):not(.ellipsis) {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #1f2937;
}

.pagination-btn.active {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #ffffff;
  font-weight: 600;
}

.pagination-btn.active:hover {
  background: #4338ca;
  border-color: #4338ca;
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  color: #9ca3af;
}

.pagination-btn.ellipsis {
  border: none;
  background: transparent;
  cursor: default;
  color: #9ca3af;
  pointer-events: none;
}

.pagination-btn.ellipsis:hover {
  background: transparent;
  border: none;
}

/* === Mini Journal Section — Enhanced === */
.mini-journal-toggle .journal-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 0.375rem;
  background: #4f46e5;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 10px;
  margin-left: auto;
}

/* === Empty State — Clear Search Button === */
.btn-clear-search {
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear-search:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
  color: #1f2937;
}

/* === Responsive Adjustments for Notes === */
@media (max-width: 768px) {
  .notes-search-bar {
    flex-direction: column;
  }

  .notes-search-expandable {
    width: 100%;
  }

  .notes-search-expandable.expanded {
    max-width: 100%;
  }

  .entry-actions {
    opacity: 1;
  }

  .notes-pagination-bar {
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .pagination-btn {
    min-width: 28px;
    height: 28px;
    font-size: 0.8125rem;
  }

  .entry-edit-actions {
    flex-direction: column;
  }

  .btn-cancel-edit,
  .btn-save-edit {
    width: 100%;
    justify-content: center;
  }
}
</style>
