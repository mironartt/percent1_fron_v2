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

    <header class="page-header">
      <button class="btn btn-secondary btn-back" @click="goBack">
        <ArrowLeft :size="16" />
        Назад
      </button>
      <div class="header-actions">
        <button class="btn btn-ghost btn-with-icon btn-planning" @click="goToPlanning" title="Запланировать шаги">
          <CalendarDays :size="16" />
          <span class="btn-planning-text">Планировщик</span>
        </button>
        <button class="btn btn-primary btn-with-icon" @click="saveAndGoToBank">
          <Save :size="16" />
          Сохранить
        </button>
        <button 
          class="btn btn-danger-outline btn-with-icon"
          @click="deleteGoalConfirm"
        >
          <Trash2 :size="16" />
          Удалить
        </button>
      </div>
    </header>

    <div v-if="!goal" class="empty-state card">
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
      <div class="main-content">
        <div class="card goal-info-card">
          <div class="card-header-optimized">
            <div class="goal-title-wrapper">
              <h2 class="goal-title-truncate" :title="goalForm.title">{{ goalForm.title || 'Без названия' }}</h2>
              <button 
                v-if="goal.sourceId" 
                class="btn btn-link edit-in-bank-btn"
                @click="openEditModal"
              >
                <Edit2 :size="14" />
                Редактировать цель
              </button>
            </div>
            <div class="goal-meta-right">
              <span 
                class="goal-status-badge"
                :class="goal.status"
              >
                {{ getStatusLabel(goal.status) }}
              </span>
              <div class="sphere-display-compact" v-if="goalForm.sphereId">
                <span class="sphere-icon-wrapper" :style="{ '--sphere-color': getSphereColor(goalForm.sphereId) }">
                  <component :is="getSphereIconComponent(goalForm.sphereId)" :size="14" />
                </span>
                <span class="sphere-name-sm">{{ getSphereName(goalForm.sphereId) }}</span>
              </div>
            </div>
          </div>

          <div class="goal-info-section" v-if="goalForm.description">
            <div class="goal-info-row">
              <span class="info-label">Почему важно:</span>
              <p class="info-value description-value">{{ goalForm.description }}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Декомпозиция на шаги</h3>
            <span class="steps-count">
              {{ goalForm.steps.filter(s => !s.isNew).length }}
              <template v-if="totalFilteredSteps > 0 && totalFilteredSteps !== totalStepsFromBackend">
                из {{ totalFilteredSteps }} (всего {{ totalStepsFromBackend }})
              </template>
              <template v-else-if="totalStepsFromBackend > 0">
                из {{ totalStepsFromBackend }}
              </template>
              шагов
            </span>
          </div>

          <div class="form-hint decomposition-hint">
            Разбейте цель на конкретные действия. Каждый шаг должен быть понятным и выполнимым за 1-4 часа.
          </div>

          <!-- Фильтры шагов -->
          <div class="steps-filters">
            <button 
              class="mobile-filters-toggle"
              @click="mobileFiltersExpanded = !mobileFiltersExpanded"
            >
              <Filter :size="16" />
              <span>Фильтры</span>
              <span v-if="hasActiveFilters" class="filters-badge">{{ activeFiltersCount }}</span>
              <ChevronDown :size="16" :class="{ rotated: mobileFiltersExpanded }" />
            </button>
            
            <div class="filter-row" :class="{ 'mobile-expanded': mobileFiltersExpanded }">
              <div class="search-input-wrapper">
                <Search :size="16" class="search-icon" />
                <input 
                  v-model="searchQuery"
                  type="text"
                  class="search-input"
                  placeholder="Поиск по шагам..."
                />
                <button 
                  v-if="searchQuery" 
                  class="search-clear"
                  @click="searchQuery = ''"
                >
                  <X :size="14" />
                </button>
              </div>
              
              <select v-model="filterStatus" class="filter-select">
                <option value="">Все статусы</option>
                <option value="pending">Не выполнены</option>
                <option value="completed">Выполнены</option>
              </select>
              
              <select v-model="filterPriority" class="filter-select">
                <option value="">Все приоритеты</option>
                <option value="critical">Критично</option>
                <option value="desirable">Важно</option>
                <option value="attention">Внимание</option>
                <option value="optional">Опционально</option>
              </select>
              
              <button 
                v-if="hasActiveFilters"
                class="btn btn-sm btn-secondary"
                @click="clearFilters"
              >
                <X :size="14" />
                Сбросить
              </button>
              
              <div class="sort-controls">
                <select v-model="sortBy" class="filter-select sort-select">
                  <option value="order">По порядку</option>
                  <option value="priority">По приоритету</option>
                  <option value="is_complete">По результату</option>
                  <option value="time_duration">По времени</option>
                  <option value="date_created">По дате создания</option>
                  <option value="title">По названию</option>
                </select>
                <button 
                  class="btn-icon sort-direction-btn"
                  @click="toggleSortDirection"
                  :title="sortDirection === 'asc' ? 'По возрастанию' : 'По убыванию'"
                >
                  <ChevronsUpDown :size="16" v-if="sortBy === 'order'" />
                  <ChevronUp :size="16" v-else-if="sortDirection === 'asc'" />
                  <ChevronDown :size="16" v-else />
                </button>
              </div>
            </div>
          </div>

          <!-- Подсказка о drag/drop -->
          <div v-if="hasActiveFilters" class="drag-disabled-hint">
            Перетаскивание шагов отключено при активных фильтрах
          </div>

          <div 
            ref="stepsContainer"
            class="steps-section" 
            :class="{ 'has-scroll': hasMoreStepsToLoad || paginatedSteps.length > 6 }"
            :style="stepsContainerStyle"
            @dragover="handleContainerDragOver"
          >
            <div 
              v-for="(step, displayIndex) in paginatedSteps" 
              :key="step.id || displayIndex"
              class="step-card"
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
            >
              <!-- Левая колонка: drag-handle, checkbox, delete -->
              <div class="step-actions-column">
                <div 
                  class="step-drag-handle" 
                  :class="{ disabled: !isDragEnabled }"
                  :title="isDragEnabled ? 'Перетащите для изменения порядка' : 'Перетаскивание отключено (активны фильтры или сортировка)'"
                >
                  <GripVertical :size="16" />
                </div>
                
                <div class="step-checkbox-wrapper">
                  <input 
                    type="checkbox"
                    :checked="step.completed"
                    @change="toggleStepCompletion(getOriginalIndex(step))"
                    class="step-checkbox"
                    :id="`step-checkbox-${step.id}`"
                  />
                  <label 
                    :for="`step-checkbox-${step.id}`" 
                    class="step-checkbox-label"
                    :title="step.completed ? 'Отметить как невыполненный' : 'Отметить как выполненный'"
                  >
                    <CheckSquare v-if="step.completed" :size="20" class="check-icon checked" />
                    <Square v-else :size="20" class="check-icon" />
                  </label>
                </div>
                
                <button 
                  class="btn-icon btn-icon-danger step-delete-btn"
                  @click="removeStep(getOriginalIndex(step))"
                  title="Удалить шаг"
                >
                  <X :size="14" :stroke-width="2" />
                </button>
              </div>

              <span class="step-number-badge">{{ getOriginalIndex(step) + 1 }}</span>
              
              <div class="step-main">
                <input 
                  type="text"
                  :value="step.title"
                  @input="updateStep(getOriginalIndex(step), 'title', $event.target.value)"
                  @blur="autoSave"
                  class="step-input"
                  :class="{ 'completed-text': step.completed }"
                  :placeholder="`Шаг ${getOriginalIndex(step) + 1}: что конкретно нужно сделать?`"
                />
                
                <!-- Параметры шага -->
                <div class="step-params">
                  <!-- Приоритет -->
                  <select 
                    :value="step.priority || ''"
                    @change="updateStepAndSave(getOriginalIndex(step), 'priority', $event.target.value)"
                    class="step-param-select priority-select-sm"
                    :class="'priority-' + (step.priority || 'none')"
                    title="Приоритет"
                  >
                    <option value="">Приоритет</option>
                    <option value="critical">Критично</option>
                    <option value="desirable">Важно</option>
                    <option value="attention">Внимание</option>
                    <option value="optional">Опционально</option>
                  </select>
                  
                  <!-- Время -->
                  <select 
                    :value="step.timeEstimate || ''"
                    @change="updateStepAndSave(getOriginalIndex(step), 'timeEstimate', $event.target.value)"
                    class="step-param-select time-select-sm"
                    title="Время на выполнение"
                  >
                    <option value="">Время</option>
                    <option value="15">15 мин</option>
                    <option value="30">30 мин</option>
                    <option value="60">1 час</option>
                    <option value="120">2 часа</option>
                    <option value="180">3 часа</option>
                    <option value="240">4 часа</option>
                  </select>
                  
                  <!-- Дата -->
                  <input 
                    type="date"
                    :value="step.scheduledDate || ''"
                    @change="updateStepAndSave(getOriginalIndex(step), 'scheduledDate', $event.target.value)"
                    class="step-param-select date-input-sm"
                    title="Запланировать на дату"
                  />
                </div>
                
                <!-- Комментарий -->
                <div class="step-comment-section">
                  <textarea 
                    ref="commentTextareas"
                    :value="step.comment || ''"
                    @input="handleCommentInput(getOriginalIndex(step), $event)"
                    @blur="autoSave"
                    class="step-comment-input"
                    :placeholder="'Комментарий к шагу (необязательно)'"
                    rows="1"
                  ></textarea>
                </div>
              </div>
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
                  <!-- Левая колонка: drag-handle, checkbox, delete -->
                  <div class="step-actions-column">
                    <div class="step-drag-handle disabled" title="Сохраните шаг для возможности перетаскивания">
                      <GripVertical :size="16" />
                    </div>
                    
                    <div class="step-checkbox-wrapper">
                      <input 
                        type="checkbox"
                        :checked="step.completed"
                        @change="updateStep(getOriginalIndex(step), 'completed', !step.completed)"
                        class="step-checkbox"
                        :id="`new-step-checkbox-${step.id}`"
                      />
                      <label 
                        :for="`new-step-checkbox-${step.id}`" 
                        class="step-checkbox-label"
                        :title="step.completed ? 'Отметить как невыполненный' : 'Отметить как выполненный'"
                      >
                        <CheckSquare v-if="step.completed" :size="20" class="check-icon checked" />
                        <Square v-else :size="20" class="check-icon" />
                      </label>
                    </div>
                    
                    <button 
                      class="btn-icon btn-icon-danger step-delete-btn"
                      @click="removeStep(getOriginalIndex(step))"
                      title="Удалить шаблон"
                    >
                      <X :size="14" :stroke-width="2" />
                    </button>
                  </div>

                  <span class="step-number-badge new-badge">Новый</span>
                  
                  <div class="step-main">
                    <input 
                      type="text"
                      :value="step.title"
                      @input="updateStep(getOriginalIndex(step), 'title', $event.target.value)"
                      @keydown.enter="saveNewStep(step)"
                      class="step-input"
                      :class="{ 'completed-text': step.completed }"
                      :placeholder="`Введите название нового шага`"
                    />
                    
                    <!-- Параметры шага -->
                    <div class="step-params">
                      <!-- Приоритет -->
                      <select 
                        :value="step.priority || ''"
                        @change="updateStep(getOriginalIndex(step), 'priority', $event.target.value)"
                        class="step-param-select priority-select-sm"
                        :class="'priority-' + (step.priority || 'none')"
                        title="Приоритет"
                      >
                        <option value="">Приоритет</option>
                        <option value="critical">Критично</option>
                        <option value="desirable">Важно</option>
                        <option value="attention">Внимание</option>
                        <option value="optional">Опционально</option>
                      </select>
                      
                      <!-- Время -->
                      <select 
                        :value="step.timeEstimate || ''"
                        @change="updateStep(getOriginalIndex(step), 'timeEstimate', $event.target.value)"
                        class="step-param-select time-select-sm"
                        title="Время на выполнение"
                      >
                        <option value="">Время</option>
                        <option value="15">15 мин</option>
                        <option value="30">30 мин</option>
                        <option value="60">1 час</option>
                        <option value="120">2 часа</option>
                        <option value="180">3 часа</option>
                        <option value="240">4 часа</option>
                      </select>
                      
                      <!-- Дата -->
                      <input 
                        type="date"
                        :value="step.scheduledDate || ''"
                        @change="updateStep(getOriginalIndex(step), 'scheduledDate', $event.target.value)"
                        class="step-param-select date-input-sm"
                        title="Запланировать на дату"
                      />
                      
                      <!-- Кнопка добавления -->
                      <button 
                        class="btn btn-primary btn-sm save-new-step-btn"
                        @click="saveNewStep(step)"
                        title="Добавить шаг"
                      >
                        <Check :size="14" />
                        Добавить
                      </button>
                    </div>
                    
                    <!-- Комментарий -->
                    <div class="step-comment-section">
                      <textarea 
                        :value="step.comment || ''"
                        @input="handleCommentInput(getOriginalIndex(step), $event)"
                        class="step-comment-input"
                        :placeholder="'Комментарий к шагу (необязательно)'"
                        rows="1"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <button class="btn btn-secondary add-step-btn btn-with-icon" @click="addStep">
              <Plus :size="16" />
              Добавить шаг
            </button>
          </div>

          <div class="goal-meta-info">
            <span class="meta-item">
              <span class="meta-label">Создана:</span>
              {{ formatDate(goal.createdAt) }}
            </span>
            <span v-if="goal.completedAt" class="meta-item">
              <span class="meta-label">Завершена:</span>
              {{ formatDate(goal.completedAt) }}
            </span>
          </div>

        </div>
      </div>

    </div>

    <!-- Модальное окно редактирования цели (унифицировано с GoalsBank) -->
    <transition name="modal-fade">
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="edit-modal edit-modal-extended">
          <div class="modal-header">
            <h3>
              <Edit2 :size="20" :stroke-width="2" class="modal-header-icon" />
              Редактирование цели
            </h3>
            <button class="modal-close" @click="closeEditModal">
              <X :size="20" :stroke-width="2" />
            </button>
          </div>
          
          <div class="modal-body" v-if="editingGoal">
            <div class="form-group">
              <label class="form-label">Название цели</label>
              <input 
                v-model="editingGoal.text"
                type="text"
                class="form-input"
                placeholder="Введите название цели"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Сфера жизни</label>
              <div class="sphere-select-grid">
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
            
            <div class="why-section-divider">
              <span>Проверка цели</span>
            </div>
            
            <div class="form-group">
              <label class="form-label">1. Почему для меня это важно?</label>
              <textarea 
                v-model="editingGoal.whyImportant"
                class="form-textarea"
                placeholder="Опишите, почему эта цель важна для вас"
                rows="3"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label class="form-label">2. Как эта цель поможет выйти на новый уровень?</label>
              <textarea 
                v-model="editingGoal.why2"
                class="form-textarea"
                placeholder="Опишите, как достижение этой цели изменит вашу жизнь"
                rows="3"
              ></textarea>
            </div>
            
            <div class="validation-section">
              <div class="validation-label">Тип цели:</div>
              <div class="validation-buttons">
                <button 
                  class="btn btn-validation btn-true-goal"
                  :class="{ active: editingGoal.validationStatus === 'validated' }"
                  @click="editingGoal.validationStatus = 'validated'"
                >
                  <CheckCircle :size="18" :stroke-width="2" />
                  Истинная цель
                </button>
                <button 
                  class="btn btn-validation btn-false-goal"
                  :class="{ active: editingGoal.validationStatus === 'rejected' }"
                  @click="editingGoal.validationStatus = 'rejected'"
                >
                  <XCircle :size="18" :stroke-width="2" />
                  Ложная цель
                </button>
              </div>
            </div>
            
            <div class="validation-section">
              <div class="validation-label">Статус:</div>
              <div class="validation-buttons">
                <button 
                  class="btn btn-validation"
                  :class="{ active: editingGoal.workStatus === 'work' }"
                  @click="editingGoal.workStatus = 'work'"
                >
                  В работе
                </button>
                <button 
                  class="btn btn-validation"
                  :class="{ active: editingGoal.workStatus === 'complete' }"
                  @click="editingGoal.workStatus = 'complete'"
                >
                  Завершена
                </button>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <div class="modal-footer-left">
              <button 
                class="btn btn-danger-outline" 
                @click="deleteGoalFromModal"
              >
                <Trash2 :size="16" :stroke-width="2" />
                Удалить
              </button>
            </div>
            <div class="modal-footer-right">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useAppStore } from '../stores/app'
import { DEBUG_MODE, SKIP_AUTH_CHECK } from '@/config/settings.js'
import { 
  Trash2, Save, Plus, ArrowLeft, GripVertical, X, Edit2, ChevronUp, ChevronDown, ChevronsUpDown,
  Wallet, Palette, Users, Heart, Briefcase, HeartHandshake, Target,
  Square, CheckSquare, Search, Calendar, CheckCircle2, AlertCircle,
  CheckCircle, XCircle, Check, CalendarDays, Filter
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useAppStore()

const lifeSpheres = computed(() => store.lifeSpheres)
const goals = computed(() => store.goals)

// route.params.id is now backendId from the URL (or local-{id} in dev mode)
const goalBackendId = computed(() => route.params.id)

// Check if this is a local id (dev mode)
const isLocalId = computed(() => goalBackendId.value?.startsWith('local-'))
const localGoalId = computed(() => isLocalId.value ? goalBackendId.value.replace('local-', '') : null)

// Find goal by backendId in store.goals or rawIdeas
const goal = computed(() => {
  // Dev mode: handle local ids
  if (DEBUG_MODE && SKIP_AUTH_CHECK && isLocalId.value) {
    // Find by local id in rawIdeas
    const rawGoal = store.goalsBank.rawIdeas.find(g => g.id === localGoalId.value)
    if (rawGoal) {
      return {
        id: rawGoal.id,
        backendId: rawGoal.backendId,
        title: rawGoal.title,
        description: rawGoal.description || rawGoal.why,
        sphereId: rawGoal.category,
        status: rawGoal.status,
        steps: [],
        source: 'goals-bank',
        sourceId: rawGoal.id
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
      title: rawGoal.title,
      description: rawGoal.description || rawGoal.why,
      sphereId: rawGoal.category,
      status: rawGoal.status,
      steps: [],
      source: 'goals-bank',
      sourceId: rawGoal.id
    }
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

// Фильтры
const searchQuery = ref('')
const filterStatus = ref('')
const filterPriority = ref('')
const sortBy = ref('order')
const sortDirection = ref('asc')
const mobileFiltersExpanded = ref(false)

// Автоматически раскрывать фильтры на мобильных при активных фильтрах
watch(() => [searchQuery.value, filterStatus.value, filterPriority.value], () => {
  if (searchQuery.value || filterStatus.value || filterPriority.value) {
    mobileFiltersExpanded.value = true
  }
}, { immediate: true })

// Пагинация
const stepsDisplayLimit = ref(10)

const hasActiveFilters = computed(() => {
  return searchQuery.value || filterStatus.value || filterPriority.value
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (searchQuery.value) count++
  if (filterStatus.value) count++
  if (filterPriority.value) count++
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
  filterPriority.value = ''
}

function toggleSortDirection() {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
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
  
  if (filterPriority.value) {
    steps = steps.filter(s => s.priority === filterPriority.value)
  }
  
  // Применить сортировку
  steps = sortSteps(steps)
  
  return steps
})

// Пагинированные шаги (без новых)
const paginatedSteps = computed(() => {
  return filteredSteps.value.slice(0, stepsDisplayLimit.value)
})

// Проверка есть ли активные фильтры или сортировка
const hasActiveFiltersOrSort = computed(() => {
  return searchQuery.value || filterStatus.value || filterPriority.value || sortBy.value !== 'order'
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

watch([searchQuery, filterStatus, filterPriority, sortBy, sortDirection], () => {
  stepsDisplayLimit.value = 10
  
  // Debounce for search query, immediate for other filters
  if (filterDebounceTimer) clearTimeout(filterDebounceTimer)
  
  const hasFiltersOrSort = searchQuery.value || filterStatus.value || filterPriority.value || 
    sortBy.value !== 'order' || sortDirection.value !== 'asc'
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
  if (!backendId) return
  
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
    if (filterPriority.value) {
      params.priority_filter = mapPriorityToBackend(filterPriority.value)
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

function goToPlanning() {
  router.push('/app/planning')
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

const dragIndex = ref(null)
const dragOverIndex = ref(null)
const stepsContainer = ref(null)
let autoScrollInterval = null

// Loading state for API
const isLoadingSteps = ref(false)
const stepsLoadedFromBackend = ref(false)

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
  
  if (!backendId) {
    console.log('[GoalEdit] No backendId in URL, skipping backend load')
    return
  }
  
  // Capture current backendId to detect stale responses
  const currentBackendId = backendId
  
  isLoadingSteps.value = true
  
  try {
    const { getGoalSteps } = await import('@/services/api.js')
    const result = await getGoalSteps({
      goal_id: backendId,
      order_by: 'order',
      order_direction: 'asc',
      page: page
    })
    
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
  } catch (error) {
    console.error('[GoalEdit] Error loading steps from backend:', error)
    isLoadingSteps.value = false
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
    'half': '30',
    'one': '60',
    'two': '120',
    'three': '180',
    'four': '240'
  }
  return map[timeDuration] || ''
}

// Map frontend time to backend
function mapTimeToBackend(timeEstimate) {
  const map = {
    '15': 'half',
    '30': 'half',
    '60': 'one',
    '120': 'two',
    '180': 'three',
    '240': 'four'
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
  loadGoalData()
  
  // Reset flags on mount
  stepsLoadedFromBackend.value = false
  initialStepsContainerHeight.value = null
  
  // Always try to load steps from backend (will check for backendId internally)
  loadStepsFromBackend()
})

watch(goalBackendId, () => {
  // Reset flag on route change
  stepsLoadedFromBackend.value = false
  loadGoalData()
  loadStepsFromBackend()
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
    isNew: true
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
function saveNewStep(step) {
  // Валидация: нельзя создать шаг с пустым названием
  if (!step.title?.trim()) {
    showToast('Введите название шага', 'error')
    return
  }
  
  // Убираем флаг isNew - шаг готов к сохранению
  step.isNew = false
  
  // Сохраняем
  flushSave(true)
}

// Обработка focusout со всего шаблона нового шага
function handleNewStepFocusOut(step, event) {
  // Проверяем, остаётся ли фокус внутри этого же шаблона
  const stepCard = event.currentTarget
  const relatedTarget = event.relatedTarget
  
  // Если фокус уходит внутрь этого же шаблона - игнорируем
  if (relatedTarget && stepCard.contains(relatedTarget)) {
    return
  }
  
  // Фокус ушёл полностью с шаблона
  // Если есть название - сохраняем автоматически
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
    
    // Убрать флаг isNew у сохранённых шагов
    goalForm.value.steps.forEach(s => {
      if (s.isNew && s.title.trim()) {
        delete s.isNew
      }
    })
    
    lastSavedHash = currentHash
    
    if (showNotification) {
      showToast('Изменения сохранены')
    }
    
    // Sync with backend (non-blocking)
    if (goalBackendId.value) {
      syncStepsToBackend(stepsToSave)
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
  if (!goalBackendId.value) return
  
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
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
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

.edit-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 900px;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

/* Goal Info Card */
.goal-info-card .card-header {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}

.card-header-optimized {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1rem;
}

.goal-title-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.goal-title-truncate {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.goal-meta-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
  min-width: 120px;
  max-width: 160px;
}

.sphere-display-compact {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  max-width: 100%;
}

.sphere-name-sm {
  font-size: 0.8125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goal-title-section {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  max-width: 100%;
  min-width: 0;
}

.goal-title {
  font-size: 1.5rem;
  margin: 0;
  color: var(--text-primary);
  word-break: break-word;
}

.edit-in-bank-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0;
  font-size: 0.875rem;
  color: var(--primary-color);
  background: transparent;
  border: none;
  cursor: pointer;
}

.edit-in-bank-btn:hover {
  text-decoration: underline;
}

.goal-info-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.goal-info-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  margin: 0;
  color: var(--text-primary);
  line-height: 1.5;
}

.description-value {
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--primary-color);
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

/* Фильтры шагов */
.steps-filters {
  margin-bottom: 1rem;
}

.filter-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 300px;
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

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  background: var(--bg-primary);
  min-width: 130px;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: auto;
}

.sort-select {
  min-width: 120px;
}

.sort-direction-btn {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-direction-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
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
  gap: 0.75rem;
}

.steps-section.has-scroll {
  overflow-y: auto;
  padding-right: 0.5rem;
}

.step-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
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
}

.step-number-badge.new-badge {
  background: var(--primary-color);
  color: white;
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  min-width: auto;
}

/* Кнопка добавления нового шага */
.save-new-step-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  white-space: nowrap;
  margin-left: auto;
}

.save-new-step-btn:hover {
  transform: translateY(-1px);
}

.step-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
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

/* Комментарий */
.step-comment-section {
  margin-top: 0.25rem;
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

.btn-planning {
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn-planning:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
  background: rgba(99, 102, 241, 0.05);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Кнопка toggle фильтров - скрыта по умолчанию */
.mobile-filters-toggle {
  display: none;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .header-actions .btn {
    flex: 1;
    min-width: 100px;
  }

  .btn-planning-text {
    display: none;
  }

  /* Кнопка toggle фильтров на мобильных */
  .mobile-filters-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    margin-bottom: 0.5rem;
    min-height: 44px;
  }

  .mobile-filters-toggle:active {
    background: var(--bg-tertiary);
  }

  .mobile-filters-toggle svg:last-child {
    margin-left: auto;
    transition: transform 0.2s ease;
  }

  .mobile-filters-toggle svg.rotated {
    transform: rotate(180deg);
  }

  .filters-badge {
    background: var(--primary-color);
    color: white;
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    border-radius: 10px;
    font-weight: 600;
  }

  /* Скрыть фильтры по умолчанию на мобильных */
  .filter-row {
    display: none;
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .filter-row.mobile-expanded {
    display: flex;
  }
  
  .search-input-wrapper {
    max-width: none;
  }
  
  .filter-select {
    width: 100%;
    min-height: 44px;
  }

  /* Скрыть drag-handle на мобильных */
  .step-drag-handle {
    display: none !important;
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

  .card-header-optimized {
    flex-direction: column;
    gap: 0.75rem;
  }

  .goal-title-wrapper {
    width: 100%;
  }

  .goal-title-truncate {
    white-space: normal;
    -webkit-line-clamp: 2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
  }

  .goal-meta-right {
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }

  .validation-buttons {
    flex-direction: column;
  }

  .modal-footer {
    flex-direction: column-reverse;
    gap: 0.75rem;
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
</style>
