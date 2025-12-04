<template>
  <div class="goals-bank-container">
    <!-- Loading State -->
    <div v-if="isGoalsLoading && !isGoalsLoaded" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Загрузка целей...</p>
    </div>

    <!-- Empty State - No goals yet -->
    <div v-else-if="showEmptyState" class="empty-state-section">
      <div class="empty-state-card card">
        <div class="empty-icon">
          <Target :size="48" :stroke-width="1.5" />
        </div>
        <h1>Банк целей</h1>
        <p class="subtitle">
          Здесь хранятся все ваши идеи, желания и цели для достижения
        </p>
        
        <div class="empty-actions">
          <button class="btn btn-primary btn-lg" @click="addNewGoal">
            <Plus :size="20" :stroke-width="2" />
            Добавить первую цель
          </button>
        </div>
        
        <div class="learning-hint">
          <BookOpen :size="16" :stroke-width="1.5" />
          <span>Не знаете с чего начать? Изучите </span>
          <router-link to="/app/learning" class="learning-link">урок "Постановка целей"</router-link>
        </div>
      </div>
    </div>

    <!-- Summary State - After Completion -->
    <div v-else-if="showSummary" class="summary-section">
      <header class="section-header">
        <h1>Банк целей</h1>
      </header>

      <div class="summary-grid">
        <div class="summary-card card hide-mobile">
          <div class="summary-icon summary-icon-ideas">
            <Lightbulb :size="18" :stroke-width="2" />
          </div>
          <div class="summary-value">{{ totalGoalsCount }}</div>
          <div class="summary-label">Идей в банке</div>
        </div>

        <div class="summary-card card">
          <div class="summary-icon summary-icon-valid">
            <CheckCircle :size="18" :stroke-width="2" />
          </div>
          <div class="summary-value">{{ trueGoalsCount }}</div>
          <div class="summary-label">Истинных целей</div>
        </div>

        <div class="summary-card card hide-mobile">
          <div class="summary-icon summary-icon-rejected">
            <XCircle :size="18" :stroke-width="2" />
          </div>
          <div class="summary-value">{{ falseGoalsCount }}</div>
          <div class="summary-label">Ложных целей</div>
        </div>

        <div class="summary-card card">
          <div class="summary-icon summary-icon-work">
            <PlayCircle :size="18" :stroke-width="2" />
          </div>
          <div class="summary-value">{{ inWorkGoalsCount }}</div>
          <div class="summary-label">Целей в работе</div>
        </div>
      </div>

      <!-- Единая таблица целей -->
      <div class="goals-table-section card" v-if="rawIdeas.length > 0 || hasActiveFilters">
        <div class="table-header hide-mobile">
          <h3>Банк идей и целей</h3>
          <p class="section-hint">Все ваши цели и идеи</p>
        </div>
        
        <!-- Фильтры -->
        <div class="goals-filters">
          <!-- Mobile: Toggle button -->
          <button 
            class="mobile-filters-toggle"
            @click="toggleMobileFilters"
          >
            <Filter :size="16" />
            <span>Фильтры</span>
            <span v-if="activeFiltersCount > 0" class="filters-badge">{{ activeFiltersCount }}</span>
            <ChevronDown :size="16" class="toggle-chevron" :class="{ open: mobileFiltersOpen }" />
          </button>
          
          <!-- Desktop: Always visible / Mobile: Collapsible -->
          <div class="filter-content" :class="{ 'mobile-open': mobileFiltersOpen }">
            <div class="filter-row">
              <div class="filter-group search-group">
                <div class="search-input-wrapper">
                  <Search :size="16" :stroke-width="2" class="search-icon" />
                  <input 
                    v-model="searchQuery"
                    type="text"
                    class="search-input"
                    placeholder="Поиск по названию..."
                    @input="onSearchInput"
                  />
                </div>
              </div>
              <div class="filter-group">
                <select v-model="filterSphere" class="filter-select" @change="onFilterChange">
                  <option value="">Все сферы</option>
                  <option v-for="sphere in lifeSpheres" :key="sphere.id" :value="sphere.id">
                    {{ sphere.icon }} {{ sphere.name }}
                  </option>
                </select>
              </div>
              <div class="filter-group">
                <select v-model="filterStatus" class="filter-select" @change="onFilterChange">
                  <option value="">Все статусы</option>
                  <option value="work">В работе</option>
                  <option value="complete">Завершенные</option>
                  <option value="unstatus">Не оценённые</option>
                </select>
              </div>
              <button 
                v-if="filterSphere || filterStatus || searchQuery" 
                class="btn btn-sm btn-ghost"
                @click="clearFilters"
              >
                ✕ Сбросить
              </button>
            </div>
          </div>
        </div>

        <div class="goals-table-wrapper" :class="{ 'has-scroll': filteredGoals.length > 6 }">
          <table class="goals-table">
            <thead>
              <tr>
                <th class="col-status">Статус</th>
                <th class="col-goal">Цель</th>
                <th class="col-why">Почему для меня это важно?</th>
                <th class="col-actions">Действия</th>
              </tr>
            </thead>
            <tbody>
              <!-- Empty state when filters return no results -->
              <tr v-if="paginatedGoals.length === 0 && hasActiveFilters" class="empty-results-row">
                <td colspan="4" class="empty-results-cell">
                  <div class="empty-results-content">
                    <Search :size="32" :stroke-width="1.5" class="empty-icon" />
                    <p class="empty-title">Ничего не найдено</p>
                    <p class="empty-hint">Попробуйте изменить параметры фильтрации</p>
                    <button class="btn btn-sm btn-primary" @click="clearFilters">
                      Сбросить фильтры
                    </button>
                  </div>
                </td>
              </tr>
              <tr 
                v-for="goal in paginatedGoals" 
                :key="goal.id"
                :class="{ 
                  'in-work': isGoalTransferred(goal.id),
                  'row-selected': isBankGoalSelected(goal.id),
                  'row-rejected': goal.status === 'rejected',
                  'row-raw': !goal.status || goal.status === 'raw'
                }"
              >
                <td class="col-status">
                  <span v-if="isGoalCompleted(goal.id)" class="status-badge completed">
                    Завершена
                  </span>
                  <span v-else-if="isGoalTransferred(goal.id)" class="status-badge in-work">
                    В работе
                  </span>
                  <span v-else-if="goal.status === 'validated'" class="status-badge available">
                    Не в работе
                  </span>
                  <span v-else-if="goal.status === 'rejected'" class="status-badge rejected">
                    Отклонена
                  </span>
                  <span v-else class="status-badge raw">
                    Не оценена
                  </span>
                </td>
                <td class="col-goal">
                  <div class="goal-cell">
                    <span class="goal-text line-clamp-2" :title="goal.text">{{ goal.text }}</span>
                    <span class="goal-sphere-badge-new" :style="{ '--sphere-color': getSphereColor(goal.sphereId) }">
                      <component :is="getSphereIcon(goal.sphereId)" :size="14" :stroke-width="2" />
                      {{ getSphereNameOnly(goal.sphereId) }}
                      <AlertTriangle v-if="isWeakSphere(goal.sphereId)" :size="12" class="weak-indicator" title="Проседающая сфера" />
                    </span>
                  </div>
                </td>
                <td class="col-why">
                  <div class="why-cell" :class="{ 'why-empty': !getWhyImportant(goal) || getWhyImportant(goal) === '—' }">
                    {{ getWhyImportant(goal) || 'Добавьте причину' }}
                  </div>
                </td>
                <td class="col-actions">
                  <div class="actions-cell">
                    <!-- Desktop: all buttons inline -->
                    <button 
                      class="btn-icon btn-icon-edit desktop-only"
                      @click.stop="openEditModal(goal)"
                      title="Редактировать"
                    >
                      <Edit2 :size="16" :stroke-width="2" />
                    </button>
                    <button 
                      v-if="goal.status === 'validated'"
                      class="btn-icon btn-icon-decompose desktop-only"
                      @click.stop="goToDecompose(goal.id)"
                      title="Декомпозировать"
                    >
                      <GitBranch :size="16" :stroke-width="2" />
                    </button>
                    <button 
                      v-if="goal.status === 'validated' && !isGoalTransferred(goal.id) && !isGoalCompleted(goal.id)"
                      class="btn-icon btn-icon-primary desktop-only"
                      @click.stop="takeGoalToWork(goal)"
                      title="Взять в работу"
                    >
                      <Plus :size="16" :stroke-width="2" />
                    </button>
                    <button 
                      v-if="isGoalTransferred(goal.id) && !isGoalCompleted(goal.id)"
                      class="btn-icon btn-icon-success desktop-only"
                      @click.stop="completeGoalFromBank(goal)"
                      title="Завершить цель"
                    >
                      <Check :size="16" :stroke-width="2" />
                    </button>
                    <button 
                      v-if="isGoalTransferred(goal.id) && !isGoalCompleted(goal.id)"
                      class="btn-icon btn-icon-danger desktop-only"
                      @click.stop="removeFromWorkBySourceId(goal.id)"
                      title="Убрать из работы"
                    >
                      <X :size="16" :stroke-width="2" />
                    </button>
                    <button 
                      v-if="isGoalCompleted(goal.id)"
                      class="btn-icon btn-icon-secondary desktop-only"
                      @click.stop="returnToWork(goal.id)"
                      title="Вернуть в работу"
                    >
                      <RotateCcw :size="16" :stroke-width="2" />
                    </button>
                    
                    <!-- Mobile: primary action + dropdown -->
                    <button 
                      v-if="goal.status === 'validated' && !isGoalTransferred(goal.id) && !isGoalCompleted(goal.id)"
                      class="btn-icon btn-icon-primary mobile-only"
                      @click.stop="takeGoalToWork(goal)"
                      title="Взять в работу"
                    >
                      <Plus :size="16" :stroke-width="2" />
                    </button>
                    <button 
                      v-if="isGoalTransferred(goal.id) && !isGoalCompleted(goal.id)"
                      class="btn-icon btn-icon-success mobile-only"
                      @click.stop="completeGoalFromBank(goal)"
                      title="Завершить"
                    >
                      <Check :size="16" :stroke-width="2" />
                    </button>
                    <button 
                      v-if="isGoalCompleted(goal.id)"
                      class="btn-icon btn-icon-secondary mobile-only"
                      @click.stop="returnToWork(goal.id)"
                      title="Вернуть"
                    >
                      <RotateCcw :size="16" :stroke-width="2" />
                    </button>
                    
                    <div class="mobile-actions-dropdown mobile-only">
                      <button 
                        class="btn-icon btn-icon-more"
                        @click.stop="toggleActionsDropdown(goal.id)"
                        title="Ещё"
                      >
                        <MoreVertical :size="16" :stroke-width="2" />
                      </button>
                      <div 
                        v-if="openActionsDropdown === goal.id" 
                        class="dropdown-menu"
                        @click.stop
                      >
                        <button class="dropdown-item" @click="openEditModal(goal); closeActionsDropdown()">
                          <Edit2 :size="14" :stroke-width="2" />
                          Редактировать
                        </button>
                        <button 
                          v-if="goal.status === 'validated'"
                          class="dropdown-item" 
                          @click="goToDecompose(goal.id); closeActionsDropdown()"
                        >
                          <GitBranch :size="14" :stroke-width="2" />
                          Декомпозировать
                        </button>
                        <button 
                          v-if="isGoalTransferred(goal.id) && !isGoalCompleted(goal.id)"
                          class="dropdown-item dropdown-item-danger" 
                          @click="removeFromWorkBySourceId(goal.id); closeActionsDropdown()"
                        >
                          <X :size="14" :stroke-width="2" />
                          Убрать из работы
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Load More Button -->
        <div v-if="hasMoreGoals" class="load-more-section">
          <button class="btn btn-secondary btn-load-more" @click="loadMoreGoals">
            <ChevronDown :size="16" :stroke-width="2" />
            Загрузить ещё ({{ remainingGoalsCount }})
          </button>
        </div>
        
        <!-- Collapse Button (when expanded) -->
        <div v-if="displayLimit > 6 && filteredGoals.length > 6" class="collapse-section">
          <button class="btn btn-ghost btn-collapse" @click="resetPagination">
            <ChevronUp :size="16" :stroke-width="2" />
            Свернуть
          </button>
        </div>
        
        <div v-if="filteredGoals.length === 0" class="empty-filter-result">
          Нет целей, соответствующих выбранным фильтрам
        </div>

      </div>

      <div class="summary-actions">
        <button class="btn btn-secondary" @click="goToPlanning">
          <Calendar :size="18" :stroke-width="2" /> Запланировать задачу
        </button>
        <button class="btn btn-primary btn-lg" @click="addNewGoal">
          <Plus :size="16" :stroke-width="2" /> Добавить новую цель
        </button>
      </div>
    </div>

    <!-- Floating Action Bar -->
    <Transition name="slide-up">
      <div v-if="selectedBankGoals.length > 0" class="floating-action-bar">
        <div class="fab-content">
          <div class="fab-info">
            <span class="fab-count">Выбрано: {{ selectedBankGoals.length }}</span>
          </div>
          <div class="fab-buttons">
            <button 
              v-if="canBulkTakeToWork" 
              class="btn btn-primary"
              @click="bulkTakeToWork"
            >
              ➕ Взять в работу
            </button>
            <button 
              v-if="canBulkComplete" 
              class="btn btn-success"
              @click="bulkCompleteGoals"
            >
              ✓ Завершить
            </button>
            <button 
              class="btn btn-ghost fab-close"
              @click="clearBankSelection"
              title="Снять выделение"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Edit Goal Modal -->
    <Transition name="modal-fade">
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
                  <component :is="getSphereIcon(sphere.id)" :size="18" :stroke-width="2" />
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
              <div class="validation-label">
                Оценка цели:
                <span class="tooltip-wrapper">
                  <HelpCircle :size="16" :stroke-width="2" class="help-icon" />
                  <span class="tooltip-text">Истинная цель отвечает на вопросы «почему важно?» и «как изменит жизнь?». Ложная — навязана извне или не ведёт к переменам.</span>
                </span>
              </div>
              <div class="validation-buttons">
                <button 
                  class="btn btn-validation btn-true-goal"
                  :class="{ active: editingGoal.status === 'validated' }"
                  @click="selectValidationStatus(true)"
                >
                  <CheckCircle :size="18" :stroke-width="2" />
                  Это истинная цель
                </button>
                <button 
                  class="btn btn-validation btn-false-goal"
                  :class="{ active: editingGoal.status === 'rejected' }"
                  @click="selectValidationStatus(false)"
                >
                  <XCircle :size="18" :stroke-width="2" />
                  Это ложная цель
                </button>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <div class="modal-footer-left">
              <button 
                v-if="isGoalTransferred(editingGoal?.id)"
                class="btn btn-danger-outline" 
                @click="removeGoalFromWork"
              >
                <X :size="16" :stroke-width="2" />
                Убрать из работы
              </button>
              <button 
                v-else
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
              <button class="btn btn-primary" @click="saveGoalEdit">
                <Check :size="16" :stroke-width="2" />
                Сохранить
              </button>
            </div>
          </div>

          <div class="modal-advanced" v-if="editingGoal && editingGoal.status === 'validated'">
            <div class="advanced-divider">
              <span>Нужна декомпозиция на шаги?</span>
            </div>
            <button class="btn btn-link" @click="goToDecompose(editingGoal.id)">
              <GitBranch :size="16" :stroke-width="2" />
              Перейти к декомпозиции
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Add New Goal Modal -->
    <Transition name="modal-fade">
      <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
        <div class="edit-modal edit-modal-extended">
          <div class="modal-header">
            <h3>
              <Plus :size="20" :stroke-width="2" class="modal-header-icon" />
              Добавление новой цели
            </h3>
            <button class="modal-close" @click="closeAddModal">
              <X :size="20" :stroke-width="2" />
            </button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Название цели</label>
              <input 
                v-model="newGoal.text"
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
                  :class="{ active: newGoal.sphereId === sphere.id }"
                  :style="{ '--sphere-color': getSphereColor(sphere.id) }"
                  @click="newGoal.sphereId = sphere.id"
                >
                  <component :is="getSphereIcon(sphere.id)" :size="18" :stroke-width="2" />
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
                v-model="newGoal.whyImportant"
                class="form-textarea"
                placeholder="Опишите, почему эта цель важна для вас"
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">2. Как эта цель поможет выйти на новый уровень?</label>
              <textarea 
                v-model="newGoal.why2"
                class="form-textarea"
                placeholder="Опишите, как достижение этой цели изменит вашу жизнь"
                rows="3"
              ></textarea>
            </div>

            <div class="validation-section">
              <div class="validation-label">
                Оценка цели:
                <span class="tooltip-wrapper">
                  <HelpCircle :size="16" :stroke-width="2" class="help-icon" />
                  <span class="tooltip-text">Истинная цель отвечает на вопросы «почему важно?» и «как изменит жизнь?». Ложная — навязана извне или не ведёт к переменам.</span>
                </span>
              </div>
              <div class="validation-buttons">
                <button 
                  class="btn btn-validation btn-true-goal"
                  :class="{ active: newGoal.status === 'validated' }"
                  @click="selectNewGoalValidationStatus(true)"
                >
                  <CheckCircle :size="18" :stroke-width="2" />
                  Это истинная цель
                </button>
                <button 
                  class="btn btn-validation btn-false-goal"
                  :class="{ active: newGoal.status === 'rejected' }"
                  @click="selectNewGoalValidationStatus(false)"
                >
                  <XCircle :size="18" :stroke-width="2" />
                  Это ложная цель
                </button>
              </div>
            </div>
          </div>

          <div class="modal-footer modal-footer-add">
            <button class="btn btn-secondary" @click="closeAddModal">
              Отмена
            </button>
            <button class="btn btn-primary" @click="saveNewGoal" :disabled="!newGoal.text.trim()">
              <Plus :size="16" :stroke-width="2" />
              Добавить цель
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '../stores/app'
import { 
  Lightbulb, 
  CheckCircle, 
  XCircle, 
  PlayCircle,
  Wallet, 
  Palette, 
  Users, 
  Heart, 
  Briefcase, 
  HeartHandshake,
  Plus,
  Check,
  X,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  Trash2,
  ChevronRight,
  ChevronDown,
  Eye,
  UserX,
  Target,
  Clock,
  ClipboardList,
  Square,
  CheckSquare,
  ArrowRight,
  ListChecks,
  Edit2,
  ExternalLink,
  Calendar,
  Search,
  GitBranch,
  ChevronUp,
  BookOpen,
  HelpCircle,
  Filter,
  MoreVertical
} from 'lucide-vue-next'

const sphereIcons = {
  wealth: Wallet,
  hobbies: Palette,
  friendship: Users,
  health: Heart,
  career: Briefcase,
  love: HeartHandshake
}

const sphereColors = {
  wealth: '#e63946',
  hobbies: '#f4a261',
  friendship: '#e9c46a',
  health: '#2a9d8f',
  career: '#264653',
  love: '#9b5de5'
}

function getSphereIcon(sphereId) {
  return sphereIcons[sphereId] || Lightbulb
}

function getSphereColor(sphereId) {
  return sphereColors[sphereId] || '#6366f1'
}

const store = useAppStore()
const router = useRouter()
const route = useRoute()

const lifeSpheres = computed(() => store.lifeSpheres)
const rawIdeas = computed(() => store.goalsBank.rawIdeas)
const keyGoals = computed(() => store.goalsBank.keyGoals)
const sphereAnalysis = computed(() => store.goalsBank.sphereAnalysis)
const completedAt = computed(() => store.goalsBank.completedAt)
const allGoals = computed(() => [...store.goals])

// API data from store
const goalsApiData = computed(() => store.goalsApiData)
const apiTotalData = computed(() => goalsApiData.value?.totalData || null)
const apiPagination = computed(() => goalsApiData.value?.pagination || { page: 1, totalPages: 1, totalItems: 0 })

// Stats from API (prefer API data, fallback to local)
const totalGoalsCount = computed(() => apiTotalData.value?.total_goals ?? rawIdeas.value.length)
const trueGoalsCount = computed(() => apiTotalData.value?.true_goals ?? validatedGoals.value.length)
const falseGoalsCount = computed(() => apiTotalData.value?.false_goals ?? rejectedGoals.value.length)
const inWorkGoalsCount = computed(() => apiTotalData.value?.in_work_goals ?? transferredGoals.value.length)

// Pagination state
const currentPage = ref(1)
const totalPages = computed(() => apiPagination.value.totalPages || 1)
const hasMorePages = computed(() => currentPage.value < totalPages.value)

const addingNewGoal = ref(false)
const filterSphere = ref('')
const filterStatus = ref('')
const searchQuery = ref('')
const displayLimit = ref(6)

// Debounce timer for search
let searchDebounceTimer = null
const selectedBankGoals = ref([])

const showEditModal = ref(false)
const editingGoal = ref(null)

const showAddModal = ref(false)
const newGoal = ref({
  text: '',
  sphereId: '',
  whyImportant: '',
  why2: '',
  status: null
})

// API loading state  
const loadAttempted = ref(false)
const isGoalsLoading = computed(() => goalsApiData.value?.loading ?? false)
const isGoalsLoaded = computed(() => goalsApiData.value?.loaded ?? false)
const hasLoadedOrFinished = computed(() => isGoalsLoaded.value || (loadAttempted.value && !isGoalsLoading.value))

// Show empty state when:
// 1. Loading finished (successfully or with error)
// 2. No goals from backend or local storage
const showEmptyState = computed(() => {
  if (isGoalsLoading.value) return false
  if (!hasLoadedOrFinished.value) return false
  const totalItems = apiPagination.value?.totalItems ?? 0
  return totalItems === 0 && rawIdeas.value.length === 0
})

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return !!(filterSphere.value || filterStatus.value || searchQuery.value)
})

// Mobile filters toggle
const mobileFiltersOpen = ref(false)

function toggleMobileFilters() {
  mobileFiltersOpen.value = !mobileFiltersOpen.value
}

const activeFiltersCount = computed(() => {
  let count = 0
  if (filterSphere.value) count++
  if (filterStatus.value) count++
  if (searchQuery.value) count++
  return count
})

// Show summary (main goals table) when:
// 1. Loading finished AND there are goals
const showSummary = computed(() => {
  if (isGoalsLoading.value) return false
  if (!hasLoadedOrFinished.value) return false
  const totalItems = apiPagination.value?.totalItems ?? 0
  return totalItems > 0 || rawIdeas.value.length > 0
})

const transferredGoals = computed(() => {
  return allGoals.value.filter(g => g.source === 'goals-bank' && g.status !== 'completed')
})

const transferredGoalsCount = computed(() => transferredGoals.value.length)

const formatCompletedDate = computed(() => {
  if (!completedAt.value) return ''
  const date = new Date(completedAt.value)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

function goToDecomposition() {
  router.push('/app/goals')
}

function goToPlanning() {
  router.push('/app/planning')
}

function addNewGoal() {
  newGoal.value = {
    text: '',
    sphereId: '',
    whyImportant: '',
    why2: '',
    status: null
  }
  showAddModal.value = true
}

function closeAddModal() {
  showAddModal.value = false
  newGoal.value = {
    text: '',
    sphereId: '',
    whyImportant: '',
    why2: '',
    status: null
  }
}

async function saveNewGoal() {
  if (!newGoal.value.text.trim()) {
    return
  }
  
  const goalData = {
    text: newGoal.value.text.trim(),
    sphereId: newGoal.value.sphereId,
    whyImportant: newGoal.value.whyImportant,
    status: newGoal.value.status,
    threeWhys: {
      why1: newGoal.value.whyImportant,
      why2: newGoal.value.why2
    }
  }
  
  // Optimistic UI: add to local state first
  const localGoal = store.addRawIdea(goalData, { insertAtTop: true })
  
  closeAddModal()
  
  // Update displayLimit to show new goal
  displayLimit.value = rawIdeas.value.length
  
  // Sync with backend (non-blocking)
  store.createGoalOnBackend(goalData).then(result => {
    if (result.success && result.goalId) {
      // Update local goal with backend ID
      store.updateRawIdea(localGoal.id, { backendId: result.goalId })
    }
  })
}

function selectNewGoalValidationStatus(isValid) {
  newGoal.value.status = isValid ? 'validated' : 'rejected'
}

const validatedGoals = computed(() => rawIdeas.value.filter(i => i.status === 'validated'))
const validatedCount = computed(() => validatedGoals.value.length)
const rejectedGoals = computed(() => rawIdeas.value.filter(i => i.status === 'rejected'))
const rejectedCount = computed(() => rejectedGoals.value.length)
const uncheckedCount = computed(() => rawIdeas.value.filter(i => !i.status || i.status === 'raw').length)
const checkedCount = computed(() => validatedCount.value + rejectedCount.value)
const validatedPercent = computed(() => rawIdeas.value.length > 0 ? (validatedCount.value / rawIdeas.value.length) * 100 : 0)
const rejectedPercent = computed(() => rawIdeas.value.length > 0 ? (rejectedCount.value / rawIdeas.value.length) * 100 : 0)

const expandedGoalId = ref(null)
const expandedSummaryGoalId = ref(null)
const openActionsDropdown = ref(null)

function toggleActionsDropdown(goalId) {
  if (openActionsDropdown.value === goalId) {
    openActionsDropdown.value = null
  } else {
    openActionsDropdown.value = goalId
  }
}

function closeActionsDropdown() {
  openActionsDropdown.value = null
}

function getWhyImportant(goal) {
  if (goal.threeWhys?.why1) {
    return goal.threeWhys.why1
  }
  if (goal.whyImportant) {
    return goal.whyImportant
  }
  return '—'
}


function toggleSummaryGoalExpand(goalId) {
  if (expandedSummaryGoalId.value === goalId) {
    expandedSummaryGoalId.value = null
  } else {
    expandedSummaryGoalId.value = goalId
  }
}

function isGoalTransferred(goalId) {
  return allGoals.value.some(g => g.sourceId === goalId && g.source === 'goals-bank')
}

function getTransferredGoalStatus(goalId) {
  const goal = allGoals.value.find(g => g.sourceId === goalId && g.source === 'goals-bank')
  return goal ? goal.status : null
}

function isGoalCompleted(goalId) {
  return getTransferredGoalStatus(goalId) === 'completed'
}

// Backend already filters by: category_filter, status_filter, query_filter
// No local filtering needed - just return rawIdeas
const filteredGoals = computed(() => rawIdeas.value)

const paginatedGoals = computed(() => {
  return filteredGoals.value.slice(0, displayLimit.value)
})

const hasMoreGoals = computed(() => {
  // Prefer API pagination, fallback to local
  if (apiPagination.value.totalPages > 1) {
    return currentPage.value < apiPagination.value.totalPages
  }
  return filteredGoals.value.length > displayLimit.value
})

const remainingGoalsCount = computed(() => {
  // Prefer API pagination, fallback to local
  if (apiPagination.value.totalItems > 0) {
    const loaded = rawIdeas.value.length
    return apiPagination.value.totalFilteredItems - loaded
  }
  return filteredGoals.value.length - displayLimit.value
})

async function loadMoreGoals() {
  if (isLoadingGoals.value) return
  
  // If we have API pagination, load next page
  if (apiPagination.value.totalPages > 1 && currentPage.value < apiPagination.value.totalPages) {
    currentPage.value++
    await loadGoalsWithFilters(currentPage.value, true)
    // Increase displayLimit to show all loaded data (API returns 6 per page)
    displayLimit.value = rawIdeas.value.length
  } else {
    // Fallback to local pagination
    displayLimit.value += 6
  }
}

function resetPagination() {
  displayLimit.value = 6
  currentPage.value = 1
}

function clearFilters() {
  filterSphere.value = ''
  filterStatus.value = ''
  searchQuery.value = ''
  resetPagination()
  updateUrlParams()
  // Reload from backend without filters
  loadGoalsWithFilters(1, false)
}

// Backend filtering - build API params from current filters
// API fields: category_filter, status_filter, query_filter, order_by, order_direction, page, with_steps_data
function buildApiParams(page = 1) {
  const params = {
    with_steps_data: false,
    order_by: 'date_created',
    order_direction: 'desc',
    page: page
  }
  
  // Add text search filter (min 3 characters)
  if (searchQuery.value && searchQuery.value.length >= 3) {
    params.query_filter = searchQuery.value
  }
  
  // Add sphere/category filter (API field: category_filter)
  if (filterSphere.value) {
    const backendCategory = store.categoryFrontendToBackend[filterSphere.value]
    if (backendCategory) {
      params.category_filter = backendCategory
    }
  }
  
  // Add status filter (API field: status_filter)
  // Values: work, complete, null (for all)
  if (filterStatus.value) {
    params.status_filter = filterStatus.value
  }
  
  return params
}

// Load goals with current filters from backend
async function loadGoalsWithFilters(page = 1, append = false) {
  if (isLoadingGoals.value) return
  
  isLoadingGoals.value = true
  
  try {
    const params = buildApiParams(page)
    // Pass append flag to store - true for pagination (page > 1), false for fresh load
    const result = await store.loadGoalsFromBackend(params, append)
    
    if (result.success) {
      currentPage.value = page
      console.log('[GoalsBank] Goals loaded, page:', page, 'append:', append, 'total loaded:', rawIdeas.value.length)
    }
  } catch (error) {
    console.error('[GoalsBank] Error loading goals with filters:', error)
  } finally {
    isLoadingGoals.value = false
    loadAttempted.value = true
  }
}

// Handler for filter dropdowns change
function onFilterChange() {
  resetPagination()
  updateUrlParams()
  loadGoalsWithFilters(1, false)
}

// Handler for search input with debounce
function onSearchInput() {
  // Clear previous timer
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  
  // Only search if 3+ characters or empty
  if (searchQuery.value.length >= 3 || searchQuery.value.length === 0) {
    searchDebounceTimer = setTimeout(() => {
      resetPagination()
      updateUrlParams()
      loadGoalsWithFilters(1, false)
    }, 500) // 500ms debounce
  }
}

// URL parameter sync
function updateUrlParams() {
  const newQuery = { ...route.query }
  
  // Update filter params
  if (searchQuery.value) {
    newQuery.search = searchQuery.value
  } else {
    delete newQuery.search
  }
  
  if (filterSphere.value) {
    newQuery.sphere = filterSphere.value
  } else {
    delete newQuery.sphere
  }
  
  if (filterStatus.value) {
    newQuery.status = filterStatus.value
  } else {
    delete newQuery.status
  }
  
  // Check if query actually changed to avoid redundant navigation
  const currentQuery = JSON.stringify(route.query)
  const updatedQuery = JSON.stringify(newQuery)
  if (currentQuery !== updatedQuery) {
    router.replace({ path: route.path, query: newQuery })
  }
}

function loadFiltersFromUrl() {
  if (route.query.search) searchQuery.value = route.query.search
  if (route.query.sphere) filterSphere.value = route.query.sphere
  if (route.query.status) filterStatus.value = route.query.status
}

// Note: Filter changes are now handled via onFilterChange and onSearchInput
// No need for watch - it would cause duplicate API calls

const isBankGoalSelected = (goalId) => selectedBankGoals.value.includes(goalId)

const isAllBankGoalsSelected = computed(() => {
  if (filteredGoals.value.length === 0) return false
  return filteredGoals.value.every(g => selectedBankGoals.value.includes(g.id))
})

const isSomeBankGoalsSelected = computed(() => selectedBankGoals.value.length > 0)

function toggleBankGoalSelection(goalId) {
  const index = selectedBankGoals.value.indexOf(goalId)
  if (index === -1) {
    selectedBankGoals.value.push(goalId)
  } else {
    selectedBankGoals.value.splice(index, 1)
  }
}

function toggleAllBankGoals() {
  if (isAllBankGoalsSelected.value) {
    selectedBankGoals.value = []
  } else {
    selectedBankGoals.value = filteredGoals.value.map(g => g.id)
  }
}

function clearBankSelection() {
  selectedBankGoals.value = []
}

const canBulkTakeToWork = computed(() => {
  return selectedBankGoals.value.some(id => {
    const goal = validatedGoals.value.find(g => g.id === id)
    return goal && !isGoalTransferred(id) && !isGoalCompleted(id)
  })
})

const canBulkComplete = computed(() => {
  return selectedBankGoals.value.some(id => {
    return isGoalTransferred(id) && !isGoalCompleted(id)
  })
})

function bulkTakeToWork() {
  const goalsToTake = selectedBankGoals.value
    .map(id => validatedGoals.value.find(g => g.id === id))
    .filter(goal => goal && !isGoalTransferred(goal.id) && !isGoalCompleted(goal.id))
  
  if (goalsToTake.length === 0) return
  
  goalsToTake.forEach(goal => takeGoalToWork(goal))
  clearBankSelection()
}

function bulkCompleteGoals() {
  const goalsToComplete = selectedBankGoals.value
    .filter(id => isGoalTransferred(id) && !isGoalCompleted(id))
  
  if (goalsToComplete.length === 0) return
  
  if (confirm(`Завершить ${goalsToComplete.length} ${goalsToComplete.length === 1 ? 'цель' : 'целей'}?`)) {
    goalsToComplete.forEach(sourceId => {
      const goal = validatedGoals.value.find(g => g.id === sourceId)
      if (goal) completeGoalFromBank(goal)
    })
    clearBankSelection()
  }
}

function removeFromWorkBySourceId(sourceId) {
  const goal = store.goals.find(g => g.sourceId === sourceId)
  if (goal) {
    removeFromWork(goal.id)
  }
}

const sphereDistribution = computed(() => {
  const distribution = {}
  
  lifeSpheres.value.forEach(sphere => {
    distribution[sphere.id] = {
      id: sphere.id,
      name: sphere.name,
      icon: sphere.icon,
      total: 0,
      validated: 0,
      rejected: 0,
      validatedPercent: 0,
      rejectedPercent: 0
    }
  })
  
  rawIdeas.value.forEach(idea => {
    if (idea.sphereId && distribution[idea.sphereId]) {
      distribution[idea.sphereId].total++
      if (idea.status === 'validated') {
        distribution[idea.sphereId].validated++
      } else if (idea.status === 'rejected') {
        distribution[idea.sphereId].rejected++
      }
    }
  })
  
  return Object.values(distribution)
    .filter(s => s.total > 0)
    .map(s => ({
      ...s,
      validatedPercent: s.total > 0 ? (s.validated / s.total) * 100 : 0,
      rejectedPercent: s.total > 0 ? (s.rejected / s.total) * 100 : 0
    }))
    .sort((a, b) => b.total - a.total)
})

// Step 1 features: weak spheres, ideas helper, grouping
const showIdeasHelper = ref(false)

const weakSpheres = computed(() => {
  return lifeSpheres.value.filter(s => s.score <= 5).sort((a, b) => a.score - b.score)
})

function isWeakSphere(sphereId) {
  return weakSpheres.value.some(s => s.id === sphereId)
}

function selectWeakSphere(sphereId) {
  newIdea.value.sphereId = sphereId
}

function toggleIdeasHelper() {
  showIdeasHelper.value = !showIdeasHelper.value
}

const goalExamples = {
  wealth: [
    'Увеличить доход на 30%',
    'Создать пассивный источник дохода',
    'Накопить подушку безопасности на 6 месяцев',
    'Инвестировать 10% дохода ежемесячно'
  ],
  hobbies: [
    'Научиться играть на музыкальном инструменте',
    'Прочитать 24 книги за год',
    'Освоить новый вид спорта',
    'Путешествовать в новую страну'
  ],
  friends: [
    'Расширить круг полезных знакомств',
    'Проводить время с друзьями еженедельно',
    'Найти ментора в своей области',
    'Вступить в профессиональное сообщество'
  ],
  health: [
    'Заниматься спортом 3 раза в неделю',
    'Нормализовать режим сна',
    'Пройти полное медицинское обследование',
    'Сбросить/набрать вес до целевого'
  ],
  career: [
    'Получить повышение на работе',
    'Освоить новый профессиональный навык',
    'Запустить собственный проект',
    'Сменить сферу деятельности'
  ],
  love: [
    'Улучшить качество отношений с партнёром',
    'Проводить больше времени с семьёй',
    'Наладить отношения с родителями',
    'Построить серьёзные отношения'
  ]
}

function getGoalExamples(sphereId) {
  return goalExamples[sphereId] || []
}

function addExampleGoal(sphereId, goalText) {
  store.addRawIdea({
    text: goalText,
    whyImportant: '',
    sphereId: sphereId
  })
  showIdeasHelper.value = false
}

const weakSphereGoals = computed(() => {
  return validatedGoals.value.filter(g => isWeakSphere(g.sphereId))
})

const ideasBySphere = computed(() => {
  const grouped = {}
  
  rawIdeas.value.forEach(idea => {
    const sphereId = idea.sphereId || 'unknown'
    if (!grouped[sphereId]) {
      const sphere = lifeSpheres.value.find(s => s.id === sphereId) || { id: 'unknown', name: 'Без сферы', icon: '❓' }
      grouped[sphereId] = {
        sphere,
        ideas: []
      }
    }
    grouped[sphereId].ideas.push(idea)
  })
  
  // Sort: weak spheres first, then by ideas count
  return Object.values(grouped).sort((a, b) => {
    const aWeak = isWeakSphere(a.sphere.id) ? 0 : 1
    const bWeak = isWeakSphere(b.sphere.id) ? 0 : 1
    if (aWeak !== bWeak) return aWeak - bWeak
    return b.ideas.length - a.ideas.length
  })
})

function toggleGoalExpansion(goalId) {
  if (expandedGoalId.value === goalId) {
    expandedGoalId.value = null
  } else {
    expandedGoalId.value = goalId
  }
}

const sortedSpheres = computed(() => {
  return [...lifeSpheres.value].sort((a, b) => a.score - b.score)
})

const lowestSphere = computed(() => {
  if (lifeSpheres.value.length === 0) return null
  return lifeSpheres.value.reduce((min, s) => s.score < min.score ? s : min)
})

const newIdea = ref({
  sphereId: '',
  text: '',
  whyImportant: ''
})

const newKeyGoal = ref({
  sphereId: '',
  text: '',
  action: ''
})

const selectedGoalIds = ref([])

const selectedGoalsCount = computed(() => selectedGoalIds.value.length)

function isGoalSelected(goalId) {
  return selectedGoalIds.value.includes(goalId)
}

function toggleGoalSelection(goalId) {
  const index = selectedGoalIds.value.indexOf(goalId)
  if (index > -1) {
    selectedGoalIds.value.splice(index, 1)
  } else {
    if (selectedGoalIds.value.length < 3) {
      selectedGoalIds.value.push(goalId)
    }
  }
}

function addNewIdea() {
  if (!newIdea.value.text.trim()) return
  
  store.addRawIdea({
    text: newIdea.value.text,
    whyImportant: newIdea.value.whyImportant,
    sphereId: newIdea.value.sphereId
  })
  
  newIdea.value = {
    sphereId: newIdea.value.sphereId,
    text: '',
    whyImportant: ''
  }
}

function updateIdea(ideaId, updates) {
  store.updateRawIdea(ideaId, updates)
}

function updateIdeaWhys(ideaId, whyField, value) {
  const idea = rawIdeas.value.find(i => i.id === ideaId)
  if (idea) {
    store.updateRawIdea(ideaId, {
      threeWhys: {
        ...idea.threeWhys,
        [whyField]: value
      }
    })
  }
}

function deleteIdea(ideaId) {
  if (confirm('Удалить эту идею?')) {
    store.deleteRawIdea(ideaId)
  }
}

function validateGoal(ideaId, isValid) {
  store.validateIdea(ideaId, isValid)
}

function setLowestSphere(sphereId) {
  store.updateSphereAnalysis({ lowestSphere: sphereId })
}

function setLeverageSphere(sphereId) {
  store.updateSphereAnalysis({ leverageSphere: sphereId })
}

function updateAnalysisNotes(notes) {
  store.updateSphereAnalysis({ notes })
}


function addKeyGoalHandler() {
  if (!newKeyGoal.value.text.trim()) {
    alert('Введите текст цели')
    return
  }
  if (!newKeyGoal.value.action.trim()) {
    alert('Введите действие (что делаю)')
    return
  }
  if (keyGoals.value.length >= 5) {
    alert('Максимум 5 ключевых целей')
    return
  }
  
  store.addKeyGoal({
    text: newKeyGoal.value.text,
    action: newKeyGoal.value.action,
    sphereId: newKeyGoal.value.sphereId
  })
  
  newKeyGoal.value = {
    sphereId: '',
    text: '',
    action: ''
  }
}

function removeKeyGoal(goalId) {
  store.deleteKeyGoal(goalId)
}

async function completeGoalsBankHandler() {
  if (selectedGoalIds.value.length < 1) {
    alert('Выберите хотя бы одну цель')
    return
  }
  
  const selectedGoals = validatedGoals.value.filter(g => selectedGoalIds.value.includes(g.id))
  
  // First, sync ALL rawIdeas with backend (those without backendId)
  const goalsToCreate = rawIdeas.value.filter(g => !g.backendId)
  
  if (goalsToCreate.length > 0) {
    console.log('[GoalsBank] Creating', goalsToCreate.length, 'goals on backend')
    
    // Create goals on backend in parallel
    const createPromises = goalsToCreate.map(async (goal) => {
      const result = await store.createGoalOnBackend({
        text: goal.text,
        sphereId: goal.sphereId,
        whyImportant: goal.whyImportant || goal.threeWhys?.why1 || '',
        status: goal.status,
        threeWhys: goal.threeWhys
      })
      
      if (result.success && result.goalId) {
        // Update local goal with backend ID
        store.updateRawIdea(goal.id, { backendId: result.goalId })
        return { localId: goal.id, backendId: result.goalId }
      }
      return null
    })
    
    await Promise.all(createPromises)
  }
  
  // Now set selected goals to "work" status on backend
  for (const goal of selectedGoals) {
    const backendId = goal.backendId || rawIdeas.value.find(g => g.id === goal.id)?.backendId
    if (backendId) {
      console.log('[GoalsBank] Setting goal to work:', backendId)
      store.takeGoalToWorkOnBackend(backendId)
    }
  }
  
  const goalsToTransfer = selectedGoals.map(g => ({
    id: g.id,
    goal: g.text,
    whyImportant: g.whyImportant,
    sphere: g.sphereId,
    threeWhys: g.threeWhys || null
  }))
  
  store.completeGoalsBank(goalsToTransfer)
  
  if (addingNewGoal.value) {
    addingNewGoal.value = false
    router.push('/app/goals-bank')
  } else {
    router.push('/app/planning')
  }
}

async function takeGoalToWork(goal) {
  if (isGoalTransferred(goal.id)) return
  
  const goalData = {
    title: goal.text,
    description: goal.whyImportant || '',
    sphereId: goal.sphereId,
    source: 'goals-bank',
    sourceId: goal.id,
    threeWhys: goal.threeWhys || null,
    steps: [],
    progress: 0
  }
  
  // Optimistic UI: add to local state
  store.addGoal(goalData)
  
  // Sync with backend (non-blocking) - set status to 'work'
  const backendId = goal.backendId
  if (backendId) {
    store.takeGoalToWorkOnBackend(backendId)
  }
}

async function completeGoalFromBank(goal) {
  const transferredGoal = store.goals.find(g => g.sourceId === goal.id)
  if (!transferredGoal) return
  
  if (confirm(`Завершить цель "${transferredGoal.title}"?`)) {
    // Optimistic UI: update local state
    store.updateGoal(transferredGoal.id, { 
      status: 'completed',
      progress: 100,
      completedAt: new Date().toISOString()
    })
    
    // Sync with backend (non-blocking)
    const backendId = goal.backendId || transferredGoal.backendId
    if (backendId) {
      store.completeGoalOnBackend(backendId)
    }
  }
}

async function returnToWork(sourceId) {
  const goal = store.goals.find(g => g.sourceId === sourceId && g.source === 'goals-bank')
  if (!goal) return
  
  if (confirm(`Вернуть цель "${goal.title}" в работу?`)) {
    // Optimistic UI: update local state
    store.updateGoal(goal.id, { 
      status: 'active',
      completedAt: null
    })
    
    // Sync with backend (non-blocking)
    const backendId = goal.backendId
    if (backendId) {
      store.takeGoalToWorkOnBackend(backendId)
    }
  }
}

async function removeFromWork(goalId) {
  const goal = transferredGoals.value.find(g => g.id === goalId)
  if (goal) {
    const hasSteps = goal.steps && goal.steps.length > 0
    const message = hasSteps 
      ? `Убрать цель "${goal.title}" из работы? Все шаги декомпозиции будут удалены. Цель вернётся в банк.`
      : `Убрать цель "${goal.title}" из работы? Цель вернётся в банк.`
    
    if (confirm(message)) {
      // Optimistic UI: update local state
      if (goal.sourceId) {
        store.updateRawIdea(goal.sourceId, { status: 'validated', validated: true })
      } else {
        store.addRawIdea({
          text: goal.title,
          whyImportant: goal.description || '',
          sphereId: goal.sphereId,
          status: 'validated',
          validated: true,
          threeWhys: goal.threeWhys || null
        })
      }
      store.deleteGoal(goal.id)
      
      // Sync with backend (non-blocking)
      const backendId = goal.backendId
      if (backendId) {
        store.removeGoalFromWorkOnBackend(backendId)
      }
    }
  }
}

function getSphereName(sphereId) {
  const sphere = lifeSpheres.value.find(s => s.id === sphereId)
  return sphere ? `${sphere.icon} ${sphere.name}` : 'Не указана'
}

function getSphereNameOnly(sphereId) {
  const sphere = lifeSpheres.value.find(s => s.id === sphereId)
  return sphere ? sphere.name : 'Не указана'
}

function getGoalsCountForSphere(sphereId) {
  return rawIdeas.value.filter(i => i.sphereId === sphereId).length
}

function getStatusLabel(status) {
  const labels = {
    raw: '📝',
    validated: '✅',
    rejected: '❌'
  }
  return labels[status] || '📝'
}

function openEditModal(goal) {
  editingGoal.value = {
    id: goal.id,
    text: goal.text,
    whyImportant: goal.whyImportant || goal.threeWhys?.why1 || '',
    why2: goal.threeWhys?.why2 || '',
    sphereId: goal.sphereId,
    status: goal.status || 'raw'
  }
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  editingGoal.value = null
}

async function saveGoalEdit() {
  if (!editingGoal.value) return
  
  const updates = {
    text: editingGoal.value.text,
    whyImportant: editingGoal.value.whyImportant,
    sphereId: editingGoal.value.sphereId,
    status: editingGoal.value.status,
    threeWhys: {
      why1: editingGoal.value.whyImportant,
      why2: editingGoal.value.why2
    }
  }
  
  // Optimistic UI: update local state first
  store.updateRawIdea(editingGoal.value.id, updates)
  
  const goalId = editingGoal.value.id
  const backendId = rawIdeas.value.find(g => g.id === goalId)?.backendId
  
  closeEditModal()
  
  // Sync with backend (non-blocking)
  if (backendId) {
    store.updateGoalOnBackend(backendId, updates)
  }
}

function selectValidationStatus(isTrue) {
  if (!editingGoal.value) return
  editingGoal.value.status = isTrue ? 'validated' : 'rejected'
}

function removeGoalFromWork() {
  if (!editingGoal.value) return
  
  if (confirm('Убрать эту цель из работы?')) {
    const transferredGoal = store.goals.find(g => g.sourceId === editingGoal.value.id && g.source === 'goals-bank')
    if (transferredGoal) {
      store.deleteGoal(transferredGoal.id)
    }
    closeEditModal()
  }
}

function saveFiltersToStorage() {
  const filters = {}
  if (searchQuery.value) filters.search = searchQuery.value
  if (filterSphere.value) filters.sphere = filterSphere.value
  if (filterStatus.value) filters.status = filterStatus.value
  localStorage.setItem('goalsBankFilters', JSON.stringify(filters))
}

function goToDecompose(goalId) {
  // Сохранить текущие фильтры перед переходом
  saveFiltersToStorage()
  
  // Find the goal and get its backendId
  const rawGoal = rawIdeas.value.find(g => g.id === goalId)
  if (rawGoal && rawGoal.backendId) {
    // Navigate using backendId - this will be used by GoalEdit to fetch data
    router.push(`/app/goals/${rawGoal.backendId}`)
  } else {
    console.warn('[GoalsBank] Cannot decompose: goal not found or no backendId', goalId)
  }
}

async function deleteGoalFromModal() {
  if (!editingGoal.value) return
  
  if (confirm('Удалить эту цель из банка?')) {
    const goalId = editingGoal.value.id
    const backendId = rawIdeas.value.find(g => g.id === goalId)?.backendId
    
    // Optimistic UI: delete from local state first
    store.deleteRawIdea(goalId)
    closeEditModal()
    
    // Sync with backend (non-blocking)
    if (backendId) {
      store.deleteGoalOnBackend(backendId)
    }
  }
}

function goToFullEdit(goalId) {
  const transferredGoal = store.goals.find(g => g.sourceId === goalId && g.source === 'goals-bank')
  if (transferredGoal) {
    router.push(`/app/goal/${transferredGoal.id}`)
  }
}

// Loading state for API
const isLoadingGoals = ref(false)

// Load goals from backend (uses current filters)
async function loadGoals() {
  if (isLoadingGoals.value) return
  
  isLoadingGoals.value = true
  
  try {
    // Load global data first if not loaded
    if (!store.globalData.loaded) {
      await store.loadGlobalData()
    }
    
    // Load goals with current filters
    const params = buildApiParams(1)
    await store.loadGoalsFromBackend(params)
  } catch (error) {
    console.error('[GoalsBank] Error loading goals:', error)
  } finally {
    isLoadingGoals.value = false
    loadAttempted.value = true
  }
}

onMounted(async () => {
  // Load filters from URL
  loadFiltersFromUrl()
  
  // Load goals from backend (non-blocking)
  loadGoals()
  
  // Handle edit query parameter
  const editId = route.query.edit
  if (editId) {
    const goalToEdit = store.goalsBank.rawIdeas.find(i => i.id === editId)
    if (goalToEdit) {
      openEditModal(goalToEdit)
    }
  }
})
</script>

<style scoped>
.goals-bank-container {
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: 2rem;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  gap: 1rem;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State Styles */
.empty-state-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.empty-state-card {
  text-align: center;
  max-width: 600px;
  padding: 3rem;
}

.empty-state-card .empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.empty-state-card h1 {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.empty-state-card .subtitle {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.empty-state-card .empty-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
}

.empty-actions {
  margin-bottom: 1.5rem;
}

.empty-actions .btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.learning-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.learning-hint .learning-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.learning-hint .learning-link:hover {
  text-decoration: underline;
}

/* Summary Styles */
.summary-section {
  max-width: 900px;
  margin: 0 auto;
}

.summary-section .section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.summary-section .section-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.summary-section .section-header .subtitle {
  color: var(--text-secondary);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  text-align: center;
  padding: 0.875rem 0.75rem;
}

.summary-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin: 0 auto 0.5rem;
  border-radius: var(--radius-sm);
}

.summary-icon-ideas {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.summary-icon-valid {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.summary-icon-rejected {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.summary-icon-work {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

.summary-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1.2;
}

.summary-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.125rem;
}

/* Sphere Distribution */
.sphere-distribution {
  margin-bottom: 2rem;
}

.sphere-distribution h3 {
  margin-bottom: 1.5rem;
}

.sphere-bars {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sphere-bar-item {
  padding: 0.75rem 0;
}

.sphere-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.sphere-bar-name {
  font-weight: 500;
}

.sphere-bar-count {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.sphere-bar-track {
  position: relative;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.sphere-bar-fill {
  position: absolute;
  top: 0;
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.sphere-bar-fill.validated {
  background: var(--success-color);
  left: 0;
}

.sphere-bar-fill.rejected {
  background: var(--danger-color);
}

.sphere-bar-legend {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
}

.legend-validated {
  color: var(--success-color);
}

.legend-rejected {
  color: var(--danger-color);
}

/* Goals Table Section */
.goals-table-section {
  margin-bottom: 2rem;
}

.goals-table-section .table-header {
  display: block;
  background: none;
  color: var(--text-primary);
  padding: 0;
  margin-bottom: 1.5rem;
}

.goals-table-section .table-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.goals-table-section .table-header .section-hint {
  margin-bottom: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 400;
}

.goals-filters {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
}

.goals-filters .filter-content {
  display: block;
  padding: 1rem;
}

.goals-filters .filter-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Mobile filters toggle button - hidden on desktop */
.mobile-filters-toggle {
  display: none;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group.search-group {
  flex: 1;
  min-width: 200px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--text-tertiary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.filter-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  min-width: 150px;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.weak-sphere-indicator {
  margin-left: 0.25rem;
  cursor: help;
}

.empty-filter-result {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
}

.empty-results-row {
  background: transparent !important;
}

.empty-results-row:hover {
  background: transparent !important;
}

.empty-results-cell {
  padding: 3rem 1rem !important;
  text-align: center;
}

.empty-results-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.empty-results-content .empty-icon {
  color: var(--text-secondary);
  opacity: 0.5;
}

.empty-results-content .empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.empty-results-content .empty-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.goals-table-wrapper {
  overflow-x: auto;
  margin-bottom: 1rem;
}

.goals-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9375rem;
}

.goals-table thead {
  background: var(--bg-secondary);
}

.goals-table th {
  text-align: left;
  padding: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
}

.goals-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: top;
}

.goals-table tbody tr:hover {
  background: var(--bg-secondary);
}

.goals-table tbody tr.in-work {
  background: rgba(99, 102, 241, 0.05);
}

.col-status {
  width: 100px;
  text-align: center;
  vertical-align: middle;
}

.col-goal {
  width: 35%;
}

.col-why {
  width: auto;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.checkbox-wrapper input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkbox-custom {
  width: 22px;
  height: 22px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.checkbox-wrapper:hover .checkbox-custom {
  border-color: var(--primary-color);
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkbox-custom {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkbox-custom::after {
  content: '\2713';
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.in-work {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  white-space: nowrap;
}

.status-badge.in-work.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-badge.in-work.clickable:hover {
  background: #4f46e5;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.4);
}

.status-badge.completed {
  background: #10b981;
  color: white;
  box-shadow: 0 1px 4px rgba(16, 185, 129, 0.25);
  white-space: nowrap;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
}

.status-badge.pending {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  white-space: nowrap;
}

.status-badge.available {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
}

.status-badge.validated {
  background: #22c55e;
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
}

.status-badge.rejected {
  background: #ef4444;
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
}

.status-badge.raw {
  background: #f59e0b;
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
}

/* Row status styles */
.goals-table tbody tr.row-rejected {
  background: rgba(239, 68, 68, 0.05);
}

.goals-table tbody tr.row-raw {
  background: rgba(245, 158, 11, 0.05);
}

.goals-table tbody tr.row-rejected:hover {
  background: rgba(239, 68, 68, 0.1);
}

.goals-table tbody tr.row-raw:hover {
  background: rgba(245, 158, 11, 0.1);
}

/* Sphere badge with Lucide icons */
.goal-sphere-badge-new {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--sphere-color);
  background: color-mix(in srgb, var(--sphere-color) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--sphere-color) 20%, transparent);
  white-space: nowrap;
}

.goal-sphere-badge-new .weak-indicator {
  color: #f59e0b;
  margin-left: 0.125rem;
}

/* Goal sphere icon in key goals list */
.goal-sphere-icon {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 500;
}

/* Why cell empty state */
.why-cell.why-empty {
  color: var(--text-tertiary);
  font-style: italic;
  font-size: 0.8125rem;
}

/* Table checkbox column */
.col-checkbox {
  width: 40px;
  text-align: center;
  vertical-align: middle;
}

.table-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--primary-color);
}

/* Actions column - compact */
.col-actions {
  width: 90px;
  text-align: center;
  vertical-align: middle;
}

.actions-cell {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
  align-items: center;
}

/* Mobile/Desktop visibility */
.mobile-only {
  display: none !important;
}

.desktop-only {
  display: flex;
}

.mobile-actions-dropdown {
  display: none;
}

.btn-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border-color);
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.btn-icon-primary {
  border-color: var(--border-color);
  color: var(--text-secondary);
}

.btn-icon-primary:hover {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  transform: scale(1.05);
}

.btn-icon-success {
  border-color: var(--border-color);
  color: var(--text-secondary);
}

.btn-icon-success:hover {
  background: #10b981;
  border-color: #10b981;
  color: white;
  transform: scale(1.05);
}

.btn-icon-danger {
  border-color: var(--border-color);
  color: var(--text-secondary);
}

.btn-icon-danger:hover {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
  transform: scale(1.05);
}

.btn-icon-secondary {
  border-color: var(--border-color);
  color: var(--text-secondary);
}

.btn-icon-secondary:hover {
  background: #6b7280;
  border-color: #6b7280;
  color: white;
  transform: scale(1.05);
}

.btn-icon-decompose {
  border-color: var(--border-color);
  color: var(--text-secondary);
}

.btn-icon-decompose:hover {
  background: #8b5cf6;
  border-color: #8b5cf6;
  color: white;
  transform: scale(1.05);
}

/* Pagination */
.load-more-section,
.collapse-section {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
}

.btn-load-more,
.btn-collapse {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Table wrapper with fixed height for pagination */
/* 6 goals should fit without scroll, scroll appears only for 7+ */
.goals-table-wrapper.has-scroll {
  max-height: calc(7 * 80px + 60px);
  overflow-y: auto;
}

.action-done {
  color: var(--text-tertiary);
  font-size: 1rem;
}

/* Row selection highlight */
.goals-table tbody tr.row-selected {
  background: rgba(99, 102, 241, 0.08);
}

/* Floating Action Bar */
.floating-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 1rem;
  padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0));
  background: linear-gradient(to top, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%);
  border-top: 1px solid var(--border-color);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
}

:root.dark .floating-action-bar {
  background: linear-gradient(to top, rgba(30,30,30,0.98) 0%, rgba(30,30,30,0.95) 100%);
}

.fab-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.fab-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.fab-count {
  font-weight: 600;
  font-size: 1rem;
  color: var(--primary-color);
}

.fab-buttons {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.fab-close {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.25rem;
  color: var(--text-secondary);
}

.fab-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Slide-up transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateY(0);
  opacity: 1;
}

.btn-success {
  background: #10b981;
  color: white;
  border: none;
}

.btn-success:hover {
  background: #059669;
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn-ghost:hover {
  background: var(--bg-tertiary);
}

.btn-action.take-to-work {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-action.take-to-work:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.status-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}

.complete-goal-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.complete-goal-btn:hover {
  background: #059669;
  transform: translateY(-1px);
}

.status-badge .status-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 10px;
  height: 10px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  font-size: 6px;
  font-weight: bold;
}

.goal-cell {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.goal-cell .goal-sphere-badge {
  font-size: 0.8125rem;
  padding: 0.125rem 0.5rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  white-space: nowrap;
  display: inline-block;
  width: fit-content;
}

.goal-cell .goal-text {
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.4;
  color: var(--text-primary);
}

.why-cell {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.5;
  /* Ограничение до 3 строк с многоточием */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: calc(1.5em * 3);
}

.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.selection-info {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* Validated Goals Accordion */
.validated-goals-summary {
  margin-bottom: 2rem;
}

.validated-goals-summary h3 {
  margin-bottom: 0.5rem;
}

.section-hint {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.goals-accordion.readonly {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.goals-accordion .accordion-item {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all 0.2s ease;
}

.goals-accordion .accordion-item.expanded {
  box-shadow: var(--shadow-md);
}

.goals-accordion .accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.goals-accordion .accordion-header:hover {
  background: var(--bg-tertiary);
}

.accordion-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.expand-arrow {
  font-size: 0.7rem;
  color: var(--text-secondary);
  transition: transform 0.2s ease;
}

.goal-sphere-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.goal-sphere-badge.muted {
  opacity: 0.7;
}

.goal-name {
  font-weight: 500;
}

.transferred-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  background: rgba(139, 92, 246, 0.15);
  color: var(--primary-color);
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.goals-accordion .accordion-content {
  padding: 1.25rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-primary);
}

.why-important-block {
  margin-bottom: 1.25rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.three-whys-answers {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.three-whys-answers .answer-item {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 1rem;
}

.answer-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.answer-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-primary);
  white-space: pre-wrap;
}

.no-answers {
  padding: 1rem;
  text-align: center;
  color: var(--text-muted);
  font-style: italic;
}

/* Accordion transition */
.accordion-expand-enter-active,
.accordion-expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.accordion-expand-enter-from,
.accordion-expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.accordion-expand-enter-to,
.accordion-expand-leave-from {
  opacity: 1;
  max-height: 500px;
}

/* Step 1: Weak spheres alert */
.weak-spheres-alert {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  margin-bottom: 2rem;
}

.weak-spheres-alert .alert-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: var(--radius-sm);
  color: #f59e0b;
  flex-shrink: 0;
}

.weak-spheres-alert h4 {
  margin: 0 0 0.5rem;
  color: var(--warning-color);
}

.weak-spheres-alert p {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
}

.weak-spheres-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.weak-sphere-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: white;
  border: 1.5px solid var(--sphere-color);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--sphere-color);
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.weak-sphere-tag:hover {
  background: color-mix(in srgb, var(--sphere-color) 10%, white);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

/* Table header actions */
.table-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.table-header-actions .table-title {
  margin: 0;
}

.ideas-prompt {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.05));
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.ideas-prompt:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08));
  border-color: rgba(99, 102, 241, 0.25);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.ideas-prompt-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: var(--radius-sm);
  color: var(--primary-color);
  flex-shrink: 0;
}

.ideas-prompt-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.ideas-prompt-title {
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--text-primary);
}

.ideas-prompt-subtitle {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.ideas-prompt-arrow {
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
}

.ideas-prompt:hover .ideas-prompt-arrow {
  transform: translateX(4px);
  color: var(--primary-color);
}

.add-idea-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

/* Ideas Helper */
.ideas-helper {
  margin-bottom: 1.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.ideas-helper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.ideas-helper-header h4 {
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0.25rem;
}

.btn-close:hover {
  color: var(--text-primary);
}

.sphere-examples {
  margin-bottom: 1rem;
}

.sphere-examples-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: color-mix(in srgb, var(--sphere-color) 10%, var(--bg-secondary));
  border-radius: var(--radius-sm);
  color: var(--sphere-color);
  border-left: 3px solid var(--sphere-color);
}

.example-goals {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-left: 0.5rem;
}

.example-goal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.2s ease;
}

.example-goal:hover {
  background: var(--bg-secondary);
}

.example-text {
  font-size: 0.9rem;
}

.add-icon {
  color: var(--primary-color);
  opacity: 0;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

.example-goal:hover .add-icon {
  opacity: 1;
}

/* Weak sphere select */
.sphere-select.weak-sphere-selected {
  border-color: var(--warning-color);
  background: rgba(245, 158, 11, 0.05);
}

/* Grouped by spheres */
.goals-grouped {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sphere-group {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.sphere-group.weak {
  border: 2px solid rgba(245, 158, 11, 0.4);
}

.sphere-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary));
}

.sphere-group.weak .sphere-group-header {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05));
}

.sphere-group-name {
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sphere-group-icon {
  color: var(--sphere-color);
}

.weak-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  background: var(--warning-color);
  color: white;
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.sphere-group-count {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.sphere-group-ideas {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
}

.idea-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.idea-card:hover {
  box-shadow: var(--shadow-sm);
}

.idea-card.validated {
  border-left: 3px solid var(--success-color);
}

.idea-card.rejected {
  border-left: 3px solid var(--danger-color);
  opacity: 0.7;
}

.idea-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.idea-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.idea-input:focus {
  outline: none;
  border-color: var(--primary-color);
  background: var(--bg-secondary);
}

.idea-textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: 0.85rem;
  font-family: inherit;
  resize: vertical;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.idea-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  background: var(--bg-secondary);
}

.idea-card-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  display: flex;
  align-items: center;
}

.status-icon.validated {
  color: #22c55e;
}

.status-icon.rejected {
  color: #ef4444;
}

.empty-table .hint {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Step 2 Layout */
.step-2-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.step-2-main {
  min-width: 0;
  width: 100%;
}

/* Validation Progress Bar */
.validation-progress {
  margin-bottom: 2rem;
}

.validation-progress .progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.validation-progress .progress-title {
  font-weight: 600;
}

.validation-progress .progress-count {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.validation-progress .progress-track {
  position: relative;
  height: 12px;
  background: var(--bg-tertiary);
  border-radius: 6px;
  overflow: hidden;
}

.validation-progress .progress-fill {
  position: absolute;
  top: 0;
  height: 100%;
  transition: width 0.3s ease;
}

.validation-progress .progress-fill.validated {
  background: var(--success-color);
  left: 0;
  border-radius: 6px 0 0 6px;
}

.validation-progress .progress-fill.rejected {
  background: var(--danger-color);
  border-radius: 0 6px 6px 0;
}

.validation-progress .progress-legend {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.75rem;
  font-size: 0.875rem;
}

.validation-progress .legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.validation-progress .legend-item.validated {
  color: var(--success-color);
}

.validation-progress .legend-item.rejected {
  color: var(--danger-color);
}

.validation-progress .legend-item.pending {
  color: var(--text-secondary);
}

/* Step 3: Recommendations */
.recommendations-block {
  margin-bottom: 2rem;
  background: rgba(245, 158, 11, 0.05);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.recommendations-block h3 {
  margin-bottom: 0.5rem;
  color: var(--warning-color);
}

.recommendations-block p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.recommended-goals {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recommended-goal {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.recommended-goal:hover {
  background: var(--bg-secondary);
}

.recommended-goal.selected {
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid var(--primary-color);
}

.rec-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--text-secondary);
}

.recommended-goal.selected .rec-checkbox {
  color: var(--primary-color);
}

.rec-sphere {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: white;
  border: 1.5px solid var(--sphere-color, var(--border-color));
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  color: var(--sphere-color, var(--text-secondary));
  font-weight: 500;
}

.rec-text {
  flex: 1;
  font-weight: 500;
}

.rec-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  background: rgba(245, 158, 11, 0.15);
  color: var(--warning-color);
  border-radius: var(--radius-sm);
  font-weight: 500;
}

/* Goal header row */
.goal-header-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.weak-indicator {
  display: inline-flex;
  align-items: center;
  color: var(--warning-color);
}

.selectable-goal-item.weak-sphere {
  border-left: 3px solid var(--warning-color);
}

.summary-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.section-header {
  margin-bottom: 2rem;
  text-align: center;
}

.section-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
  max-width: 700px;
  margin: 0 auto;
}

.goals-table-container {
  margin-bottom: 2rem;
}

.table-title {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
}

.add-idea-section {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.sphere-select {
  min-width: 180px;
}

.add-idea-section .form-input {
  flex: 1;
  min-width: 200px;
}

.goals-table {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 140px 1fr 1fr 80px;
  gap: 0.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 140px 1fr 1fr 80px;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  align-items: center;
  transition: all 0.2s ease;
}

.table-row:hover {
  background: var(--bg-tertiary);
}

.table-row.validated {
  background: rgba(16, 185, 129, 0.05);
}

.table-row.rejected {
  background: rgba(239, 68, 68, 0.05);
  opacity: 0.7;
}

.empty-table {
  padding: 3rem;
  text-align: center;
  color: var(--text-secondary);
}

.cell-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.cell-input:focus {
  outline: none;
  border-color: var(--primary-color);
  background: var(--bg-primary);
}

.cell-textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: 0.8rem;
  font-family: inherit;
  resize: vertical;
  min-height: 50px;
  transition: all 0.2s ease;
}

.cell-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  background: var(--bg-primary);
}

.status-badge {
  font-size: 1.25rem;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.ideas-count {
  font-size: 1rem;
  color: var(--text-secondary);
}

.filters-block {
  margin-bottom: 2rem;
}

.filters-block h3 {
  margin-bottom: 1rem;
  color: var(--warning-color);
}

.filter-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.filter-type {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.filter-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.filter-icon-wrapper.social {
  background: rgba(156, 39, 176, 0.12);
  color: #9c27b0;
}

.filter-icon-wrapper.others {
  background: rgba(255, 152, 0, 0.12);
  color: #f57c00;
}

.filter-icon-wrapper.surrogate {
  background: rgba(0, 150, 136, 0.12);
  color: #009688;
}

.filter-type p {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.header-icon {
  vertical-align: middle;
  margin-right: 0.375rem;
}

.header-icon.warning {
  color: var(--warning-color);
}

.header-icon.success {
  color: var(--success-color);
}

.header-icon.accent {
  color: #f59e0b;
}

.header-icon.primary {
  color: var(--primary-color);
}

.three-whys-instruction {
  margin-bottom: 2rem;
}

.three-whys-instruction h3 {
  margin-bottom: 0.75rem;
  color: var(--success-color);
}

.three-whys-instruction ol {
  margin: 0;
  padding-left: 1.5rem;
  line-height: 2;
}

.validation-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.validation-card {
  transition: all 0.3s ease;
}

.validation-card.validated {
  border-left: 4px solid var(--success-color);
}

.validation-card.rejected {
  border-left: 4px solid var(--danger-color);
  opacity: 0.7;
}

.validation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.goal-info {
  flex: 1;
}

.sphere-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  background: white;
  border: 1.5px solid var(--sphere-color, var(--border-color));
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
  color: var(--sphere-color, var(--text-secondary));
  font-weight: 500;
}

.goal-info h4 {
  margin: 0;
  font-size: 1.1rem;
}

.validation-actions {
  display: flex;
  gap: 0.5rem;
}

.why-important {
  color: var(--text-secondary);
  font-style: italic;
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.three-whys-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.why-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
}

.why-field textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  transition: all 0.2s ease;
}

.why-field textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.validation-stats {
  display: flex;
  gap: 1.5rem;
}

.stat {
  font-weight: 500;
}

.stat.validated {
  color: var(--success-color);
}

.stat.rejected {
  color: var(--danger-color);
}

.stat.pending {
  color: var(--text-secondary);
}

.required-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  margin-bottom: 2rem;
}

.required-notice .notice-icon {
  font-size: 1.25rem;
}

.required-notice p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.validation-list.compact {
  gap: 0.75rem;
}

.validation-card-compact {
  transition: all 0.3s ease;
  padding: 0;
  overflow: hidden;
}

.validation-card-compact.validated {
  border-left: 4px solid var(--success-color);
}

.validation-card-compact.rejected {
  border-left: 4px solid var(--danger-color);
}

.validation-card-compact.expanded {
  box-shadow: var(--shadow-md);
}

.validation-header-compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.validation-header-compact:hover {
  background: var(--bg-tertiary);
}

.goal-info-compact {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.expand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: transform 0.2s ease;
}

.sphere-badge-small {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: white;
  border: 1.5px solid var(--sphere-color, var(--border-color));
  border-radius: var(--radius-sm);
  white-space: nowrap;
  color: var(--sphere-color, var(--text-secondary));
  font-weight: 500;
}

.goal-info-compact h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.goal-status-indicator .status-badge {
  font-size: 0.8rem;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.goal-status-indicator .status-badge.validated {
  background: rgba(16, 185, 129, 0.15);
  color: var(--success-color);
}

.goal-status-indicator .status-badge.rejected {
  background: rgba(239, 68, 68, 0.15);
  color: var(--danger-color);
}

.goal-status-indicator .status-badge.pending {
  background: rgba(156, 163, 175, 0.15);
  color: var(--text-secondary);
}

.validation-dropdown {
  padding: 1.25rem;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

.why-important-compact {
  margin: 0 0 1.25rem;
  padding: 0.75rem;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.three-whys-form-compact {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.why-field-compact label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.why-field-compact textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  transition: all 0.2s ease;
}

.why-field-compact textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.validation-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.validation-buttons .btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-outline-success {
  background: transparent;
  border: 2px solid var(--success-color);
  color: var(--success-color);
}

.btn-outline-success:hover {
  background: rgba(16, 185, 129, 0.1);
}

.btn-outline-danger {
  background: transparent;
  border: 2px solid var(--danger-color);
  color: var(--danger-color);
}

.btn-outline-danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
}

.foreign-goals-theory {
  margin-bottom: 2rem;
}

.foreign-goals-theory h3 {
  margin-bottom: 1.5rem;
  color: var(--warning-color);
}

.signs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.sign-card {
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--warning-color);
}

.sign-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.sign-card h4 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: var(--text-primary);
}

.sign-card p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.example-card {
  margin-bottom: 2rem;
  background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
}

.example-card h3 {
  margin-bottom: 1.5rem;
  color: var(--primary-color);
}

.example-content {
  padding: 1.5rem;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
}

.example-goal {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px dashed var(--border-color);
}

.example-questions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.example-qa {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.example-qa .q {
  font-weight: 600;
  color: var(--primary-color);
  font-size: 0.9rem;
}

.example-qa .a {
  color: var(--text-secondary);
  font-style: italic;
  padding-left: 1rem;
  border-left: 2px solid var(--border-color);
}

.example-conclusion {
  padding: 1rem;
  background: rgba(var(--success-rgb), 0.1);
  border-radius: var(--radius-sm);
}

.example-conclusion p {
  margin: 0;
  color: var(--text-primary);
}

.goals-review {
  margin-bottom: 2rem;
}

.goals-review h3 {
  margin-bottom: 0.5rem;
}

.review-hint {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.goals-review-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.goal-review-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.goal-review-item.needs-review {
  background: rgba(var(--warning-rgb), 0.1);
  border: 1px solid var(--warning-color);
}

.goal-review-item .goal-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.goal-review-item .goal-text {
  font-size: 0.95rem;
}

.reflection-section {
  margin-bottom: 2rem;
}

.reflection-section h3 {
  margin-bottom: 1rem;
}

.reflection-section textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  min-height: 100px;
}

.reflection-section textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.spheres-analysis {
  margin-bottom: 2rem;
}

.spheres-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.sphere-analysis-card {
  text-align: center;
  transition: all 0.3s ease;
}

.sphere-analysis-card.lowest {
  border: 2px solid var(--danger-color);
}

.sphere-analysis-card.selected {
  transform: scale(1.02);
  box-shadow: var(--shadow-md);
}

.sphere-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.sphere-icon {
  font-size: 2rem;
}

.sphere-header h4 {
  margin: 0;
  font-size: 0.95rem;
  text-align: left;
}

.sphere-score {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.sphere-goals-count {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.sphere-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.analysis-questions {
  margin-bottom: 2rem;
}

.analysis-questions h3 {
  margin-bottom: 1.5rem;
}

.analysis-field {
  margin-bottom: 1.5rem;
}

.analysis-field label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.field-icon {
  font-size: 1.25rem;
}

.selected-sphere {
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  font-weight: 500;
}

.hint {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.analysis-field textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
}

.key-goals-instruction {
  margin-bottom: 2rem;
}

.key-goals-instruction h3 {
  margin-bottom: 1rem;
}

.key-goals-instruction ul {
  margin: 0;
  padding-left: 1.5rem;
  line-height: 2;
}

.select-goals-section {
  margin-bottom: 2rem;
}

.select-goals-section h3 {
  margin-bottom: 0.5rem;
}

.select-hint {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.selectable-goals-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.selectable-goal-item {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.selectable-goal-item:hover {
  background: var(--bg-tertiary);
}

.selectable-goal-item.selected {
  background: rgba(16, 185, 129, 0.1);
  border-color: var(--success-color);
}

.goal-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
}

.goal-checkbox .checkbox-unchecked {
  color: var(--text-secondary);
}

.goal-checkbox .checkbox-checked {
  color: var(--success-color);
}

.selectable-goal-item .goal-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.selectable-goal-item .goal-text {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-primary);
}

.selectable-goal-item .goal-why {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-style: italic;
  /* Ограничение до 3 строк с многоточием */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  max-height: calc(1.4em * 3);
}

.selection-counter {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  text-align: center;
  font-size: 1.1rem;
}

.selection-counter strong {
  color: var(--primary-color);
  font-size: 1.25rem;
}

.validated-goals-summary {
  margin-bottom: 2rem;
}

.validated-goals-summary h3 {
  margin-bottom: 1rem;
}

.validated-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.validated-goal-item {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
}

.sphere-mini {
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.key-goals-section h3 {
  margin-bottom: 1.5rem;
}

.add-key-goal {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.add-key-goal .form-select {
  min-width: 150px;
}

.add-key-goal .form-input {
  flex: 1;
  min-width: 180px;
}

.key-goals-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.key-goal-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.key-goal-number {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  flex-shrink: 0;
}

.key-goal-content {
  flex: 1;
}

.key-goal-sphere {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.key-goal-want,
.key-goal-do {
  margin-bottom: 0.25rem;
}

.key-goal-want .label,
.key-goal-do .label {
  font-weight: 600;
  color: var(--primary-color);
}

.empty-key-goals {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.btn-success {
  background: var(--success-color);
  color: white;
  border-color: var(--success-color);
}

.btn-danger {
  background: var(--danger-color);
  color: white;
  border-color: var(--danger-color);
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
}

.btn-icon.delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

@media (max-width: 1024px) {
  .table-header,
  .table-row {
    grid-template-columns: 60px 120px 1fr 1fr 60px;
  }
}

@media (max-width: 768px) {
  .goals-bank-container {
    padding: 1rem;
  }
  
  .progress-bar {
    padding: 0;
    margin-bottom: 1.5rem;
  }
  
  .step-label {
    font-size: 0.7rem;
  }
  
  .step-number {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
  }
  
  /* Mobile filters */
  .mobile-filters-toggle {
    display: flex !important;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .mobile-filters-toggle:hover {
    background: var(--bg-tertiary);
  }
  
  .mobile-filters-toggle .toggle-chevron {
    margin-left: auto;
    transition: transform 0.2s ease;
  }
  
  .mobile-filters-toggle .toggle-chevron.open {
    transform: rotate(180deg);
  }
  
  .filters-badge {
    background: var(--primary-color);
    color: white;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.15rem 0.4rem;
    border-radius: 10px;
    min-width: 18px;
    text-align: center;
  }
  
  .goals-filters {
    padding: 0;
  }
  
  .goals-filters .filter-content {
    display: none;
    padding: 1rem;
    border-top: 1px solid var(--border-color);
  }
  
  .goals-filters .filter-content.mobile-open {
    display: block;
  }
  
  .goals-filters .filter-row {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filter-group.search-group {
    min-width: unset;
  }
  
  .filter-select,
  .search-input {
    width: 100%;
    padding: 0.625rem;
  }
  
  .search-input {
    padding-left: 2.25rem;
  }
  
  .goals-filters .filter-row .btn {
    width: 100%;
    justify-content: center;
  }
  
  .goals-table-section .goals-table-wrapper {
    overflow-x: visible;
    overflow-y: visible;
  }
  
  .goals-table-section .goals-table {
    display: block;
  }
  
  .goals-table-section .goals-table thead {
    display: none;
  }
  
  .goals-table-section .goals-table tbody {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .goals-table-section .goals-table tbody tr {
    display: flex;
    flex-direction: column;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 1rem;
    gap: 0.75rem;
    position: relative;
    overflow: visible;
  }
  
  .goals-table-section .goals-table tbody tr:hover {
    background: var(--bg-primary);
  }
  
  .goals-table-section .goals-table tbody tr.in-work {
    border-color: var(--primary-color);
    border-width: 2px;
  }
  
  .goals-table-section .goals-table tbody tr.row-rejected {
    border-color: var(--danger-color);
  }
  
  .goals-table-section .goals-table tbody tr.row-raw {
    border-color: var(--warning-color);
  }
  
  .goals-table-section .goals-table td {
    padding: 0;
    border-bottom: none;
  }
  
  .goals-table-section .goals-table .col-status {
    width: 100%;
    text-align: left;
    order: -1;
  }
  
  .goals-table-section .goals-table .col-goal {
    width: 100%;
  }
  
  .goals-table-section .goals-table .col-why {
    width: 100%;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
  
  .goals-table-section .goals-table .col-actions {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    gap: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border-color);
  }
  
  /* Larger touch targets for mobile */
  .goals-table-section .actions-cell .btn-icon {
    width: 40px;
    height: 40px;
    min-width: 40px;
  }
  
  .goals-table-section .actions-cell .btn-icon svg {
    width: 18px;
    height: 18px;
  }
  
  .goals-table-section .goal-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .goals-table-section .goal-text {
    font-size: 1rem;
    font-weight: 500;
  }
  
  .goals-table-section .goal-sphere-badge-new {
    margin-top: 0.25rem;
  }
  
  .add-idea-section {
    flex-direction: column;
  }
  
  .add-idea-section .form-input,
  .sphere-select {
    min-width: 100%;
  }
  
  .step-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .validation-header {
    flex-direction: column;
  }
  
  .filter-types {
    grid-template-columns: 1fr;
  }
  
  .section-header h1 {
    font-size: 1.5rem;
  }
  
  .summary-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
  
  .summary-card {
    padding: 0.75rem;
  }
  
  .summary-card.hide-mobile {
    display: none;
  }
  
  .summary-value {
    font-size: 1.25rem;
  }
  
  .summary-label {
    font-size: 0.7rem;
  }
  
  .summary-icon {
    width: 28px;
    height: 28px;
  }
  
  .summary-icon svg {
    width: 14px;
    height: 14px;
  }
  
  .table-header.hide-mobile {
    display: none;
  }
  
  .desktop-only {
    display: none !important;
  }
  
  .mobile-only {
    display: flex !important;
  }
  
  .mobile-actions-dropdown {
    display: flex !important;
    position: relative;
  }
  
  .actions-cell {
    gap: 0.25rem;
  }
  
  .goals-table-section .actions-cell .btn-icon {
    min-width: 36px;
    min-height: 36px;
  }
  
  .mobile-actions-dropdown .dropdown-menu {
    position: absolute;
    right: 0;
    bottom: 100%;
    margin-bottom: 4px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
    min-width: 160px;
    z-index: 1000;
    padding: 0.25rem;
  }
  
  .mobile-actions-dropdown .dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.625rem 0.75rem;
    border: none;
    background: none;
    font-size: 0.875rem;
    color: var(--text-primary);
    border-radius: 6px;
    cursor: pointer;
    text-align: left;
  }
  
  .mobile-actions-dropdown .dropdown-item:hover {
    background: var(--bg-secondary);
  }
  
  .mobile-actions-dropdown .dropdown-item-danger {
    color: #ef4444;
  }
  
  .mobile-actions-dropdown .dropdown-item-danger:hover {
    background: rgba(239, 68, 68, 0.1);
  }
  
  .pagination {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .pagination-info {
    width: 100%;
    text-align: center;
    order: -1;
    margin-bottom: 0.5rem;
  }
}

/* Edit Modal Styles */
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
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
}

.edit-modal.edit-modal-extended {
  max-width: 600px;
}

.why-section-divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0 1rem;
  gap: 1rem;
}

.why-section-divider::before,
.why-section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.why-section-divider span {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--primary-color);
  white-space: nowrap;
}

.validation-section {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.validation-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tooltip-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: help;
}

.help-icon {
  color: var(--text-tertiary);
  opacity: 0.7;
  transition: opacity 0.2s, color 0.2s;
}

.tooltip-wrapper:hover .help-icon {
  opacity: 1;
  color: var(--primary-color);
}

.tooltip-text {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  width: 260px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  font-size: 0.8125rem;
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transition: opacity 0.2s, visibility 0.2s;
}

.tooltip-text::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--border-color);
}

.tooltip-wrapper:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
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
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-true-goal {
  background: rgba(34, 197, 94, 0.1);
  border: 1.5px solid #22c55e;
  color: #22c55e;
}

.btn-true-goal:hover {
  background: rgba(34, 197, 94, 0.2);
  border-color: #22c55e;
}

.btn-true-goal.active {
  background: #22c55e;
  color: white;
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4);
}

.btn-false-goal {
  background: rgba(239, 68, 68, 0.1);
  border: 1.5px solid #ef4444;
  color: #ef4444;
}

.btn-false-goal:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
}

.btn-false-goal.active {
  background: #ef4444;
  color: white;
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-header-icon {
  color: var(--primary-color);
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  font-size: 0.9375rem;
  color: var(--text-primary);
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  font-size: 0.9375rem;
  color: var(--text-primary);
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
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
  gap: 0.375rem;
  padding: 0.75rem 0.5rem;
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.sphere-select-btn:hover {
  border-color: var(--sphere-color);
  background: color-mix(in srgb, var(--sphere-color) 5%, var(--bg-primary));
}

.sphere-select-btn.active {
  border-color: var(--sphere-color);
  background: color-mix(in srgb, var(--sphere-color) 10%, var(--bg-primary));
  color: var(--sphere-color);
}

.sphere-select-btn svg {
  color: var(--sphere-color);
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.modal-footer-left,
.modal-footer-right {
  display: flex;
  gap: 0.75rem;
}

.modal-footer-add {
  justify-content: space-between;
}

.modal-footer-add .btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger-outline {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 1rem;
  background: transparent;
  border: 1px solid var(--danger-color);
  color: var(--danger-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-danger-outline:hover {
  background: rgba(239, 68, 68, 0.1);
}

.modal-advanced {
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

.advanced-divider {
  text-align: center;
  margin-bottom: 0.75rem;
}

.advanced-divider span {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.btn-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  background: transparent;
  border: none;
  color: var(--primary-color);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  justify-content: center;
}

.btn-link:hover {
  text-decoration: underline;
}

.btn-icon-edit {
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.btn-icon-edit:hover {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
}

/* Modal transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-active .edit-modal,
.modal-fade-leave-active .edit-modal {
  transition: transform 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .edit-modal,
.modal-fade-leave-to .edit-modal {
  transform: scale(0.95) translateY(-10px);
}

@media (max-width: 480px) {
  .empty-state-card {
    padding: 1.5rem;
  }
  
  .empty-state-card .empty-icon {
    font-size: 3rem;
  }
  
  .empty-state-card h1 {
    font-size: 1.5rem;
  }
  
  .empty-state-card .subtitle {
    font-size: 0.9375rem;
  }
  
  .learning-hint {
    flex-direction: column;
    text-align: center;
    gap: 0.25rem;
  }
  
  .sphere-select-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .modal-footer-left,
  .modal-footer-right {
    width: 100%;
    justify-content: center;
  }
}
</style>
