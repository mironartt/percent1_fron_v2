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

      <!-- Goals Content -->
      <div class="goals-content" v-if="rawIdeas.length > 0 || hasActiveFilters">
        <!-- Filter Bar: Dropdown + Status Tabs -->
        <div class="filter-bar-unified">
          <!-- Sphere Dropdown -->
          <div class="sphere-dropdown-wrapper">
            <button 
              class="sphere-dropdown-btn"
              :class="{ active: filterSphere !== '' }"
              @click="toggleSphereDropdown"
            >
              <Filter :size="16" />
              <span>{{ filterSphere ? getSphereNameOnly(filterSphere) : 'Все сферы' }}</span>
              <ChevronDown :size="14" :class="{ rotated: showSphereDropdown }" />
            </button>
            <transition name="dropdown-fade">
              <div v-if="showSphereDropdown" class="sphere-dropdown-menu">
                <button 
                  class="sphere-dropdown-item"
                  :class="{ active: filterSphere === '' }"
                  @click="selectSphere('')"
                >
                  Все сферы
                </button>
                <button 
                  v-for="sphere in lifeSpheres" 
                  :key="sphere.id"
                  class="sphere-dropdown-item"
                  :class="{ active: filterSphere === sphere.id }"
                  @click="selectSphere(sphere.id)"
                >
                  <component :is="getSphereIcon(sphere.id)" :size="16" />
                  {{ getSphereNameOnly(sphere.id) }}
                </button>
              </div>
            </transition>
          </div>

          <!-- Status Dropdown (mobile-friendly) -->
          <div class="status-dropdown-wrapper">
            <button 
              class="status-dropdown-btn"
              :class="{ active: filterStatus !== '' }"
              @click="toggleStatusDropdown"
            >
              <span>{{ getStatusLabel(filterStatus) }}</span>
              <ChevronDown :size="14" :class="{ rotated: showStatusDropdown }" />
            </button>
            <transition name="dropdown-fade">
              <div v-if="showStatusDropdown" class="status-dropdown-menu">
                <button 
                  class="status-dropdown-item"
                  :class="{ active: filterStatus === '' }"
                  @click="selectStatus('')"
                >
                  Все
                </button>
                <button 
                  class="status-dropdown-item"
                  :class="{ active: filterStatus === 'work' }"
                  @click="selectStatus('work')"
                >
                  В работе
                </button>
                <button 
                  class="status-dropdown-item"
                  :class="{ active: filterStatus === 'complete' }"
                  @click="selectStatus('complete')"
                >
                  Завершены
                </button>
              </div>
            </transition>
          </div>

          <!-- Search -->
          <div class="search-expandable" :class="{ expanded: showSearchInput }">
            <button 
              v-if="!showSearchInput" 
              class="search-toggle-btn"
              @click="toggleSearch"
              title="Поиск"
            >
              <Search :size="18" :stroke-width="2" />
            </button>
            <div v-else class="search-input-wrapper">
              <Search :size="16" :stroke-width="2" class="search-icon" />
              <input 
                ref="searchInputRef"
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="Поиск..."
                @input="onSearchInput"
                @blur="onSearchBlur"
              />
              <button class="search-close-btn" @click="closeSearch">
                <X :size="14" />
              </button>
            </div>
          </div>

          <!-- Reset Filters Button -->
          <transition name="fade">
            <button 
              v-if="hasActiveFilters"
              class="reset-filters-btn"
              @click="clearFilters"
              title="Сбросить все фильтры"
            >
              <RotateCcw :size="14" />
              <span class="reset-text">Сбросить</span>
            </button>
          </transition>
        </div>

        <!-- Empty state when filters return no results -->
        <div v-if="paginatedGoals.length === 0 && hasActiveFilters" class="empty-results-content">
          <Search :size="32" :stroke-width="1.5" class="empty-icon" />
          <p class="empty-title">Ничего не найдено</p>
          <p class="empty-hint">Попробуйте изменить параметры фильтрации</p>
          <button class="btn btn-sm btn-primary" @click="clearFilters">
            Сбросить фильтры
          </button>
        </div>

        <!-- Goals Grid -->
        <div v-else class="goals-grid">
          <div 
            v-for="goal in paginatedGoals" 
            :key="goal.id" 
            class="goal-card" 
            :style="{ '--sphere-accent': getSphereColor(goal.sphereId) }"
            @click="goToDecompose(goal.id)"
            @contextmenu.prevent="openBottomSheet(goal)"
            @touchstart="startLongPress(goal)"
            @touchend="cancelLongPress"
            @touchmove="cancelLongPress"
          >
            <div class="goal-card-visual">
              <div class="goal-sphere-icon-wrapper" :style="{ '--sphere-color': getSphereColor(goal.sphereId) }">
                <component :is="getSphereIconComponent(goal.sphereId)" :size="24" />
              </div>
              <span v-if="goal.emoji" class="goal-emoji">{{ goal.emoji }}</span>
            </div>
            <div class="goal-card-content">
              <div class="goal-card-header">
                <h3 class="goal-title">{{ goal.text }}</h3>
                <button 
                  class="btn-settings-card" 
                  @click.stop="openEditModal(goal)" 
                  title="Настройки цели"
                >
                  <Settings :size="18" />
                </button>
              </div>
              <div class="goal-card-footer">
                <span class="sphere-chip" :style="{ '--sphere-color': getSphereColor(goal.sphereId) }">
                  {{ getSphereNameOnly(goal.sphereId) }}
                </span>
                <span v-if="goal.generatedByAI" class="ai-badge" title="Создано с помощью ИИ">
                  <Bot :size="12" />
                </span>
                <span v-if="getStatusText(goal)" class="status-chip" :class="getStatusClass(goal)">
                  {{ getStatusText(goal) }}
                </span>
                <span v-if="getStepsProgress(goal)" class="steps-progress">
                  <ListChecks :size="14" />
                  {{ getStepsProgress(goal).completed }}/{{ getStepsProgress(goal).total }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination-bar">
          <button 
            class="pagination-btn"
            :disabled="currentPageLocal === 1"
            @click="goToPage(currentPageLocal - 1)"
          >
            <ChevronLeft :size="18" />
          </button>
          <button 
            v-for="page in visiblePages" 
            :key="page"
            class="pagination-btn"
            :class="{ active: page === currentPageLocal, ellipsis: page === '...' }"
            :disabled="page === '...'"
            @click="page !== '...' && goToPage(page)"
          >
            {{ page }}
          </button>
          <button 
            class="pagination-btn"
            :disabled="currentPageLocal === totalPages"
            @click="goToPage(currentPageLocal + 1)"
          >
            <ChevronRight :size="18" />
          </button>
        </div>
      </div>

      <div class="summary-actions desktop-only">
        <button class="btn btn-secondary" @click="goToPlanning">
          <Calendar :size="16" :stroke-width="2" /> Запланировать задачу
        </button>
        <button class="btn btn-primary" @click="addNewGoal">
          <Plus :size="16" :stroke-width="2" /> Добавить новую цель
        </button>
      </div>

      <!-- FAB Button for mobile -->
      <button class="fab-button mobile-only" @click="addNewGoal">
        <Plus :size="24" />
      </button>
    </div>

    <!-- Bottom Sheet for goal actions -->
    <Transition name="bottom-sheet">
      <div v-if="showBottomSheet" class="bottom-sheet-overlay" @click="closeBottomSheet">
        <div class="bottom-sheet" @click.stop>
          <div class="bottom-sheet-handle"></div>
          <div class="bottom-sheet-header">
            <h4>{{ bottomSheetGoal?.text }}</h4>
          </div>
          <div class="bottom-sheet-actions">
            <button class="bottom-sheet-action" @click="handleBottomSheetEdit">
              <Edit2 :size="20" />
              <span>Редактировать</span>
            </button>
            <button 
              v-if="isGoalTransferred(bottomSheetGoal?.id)" 
              class="bottom-sheet-action" 
              @click="handleBottomSheetDecompose"
            >
              <GitBranch :size="20" />
              <span>Шаги</span>
            </button>
            <button 
              v-if="!isGoalTransferred(bottomSheetGoal?.id) && !isGoalCompleted(bottomSheetGoal?.id)"
              class="bottom-sheet-action" 
              @click="handleBottomSheetTakeToWork"
            >
              <Play :size="20" />
              <span>Взять в работу</span>
            </button>
            <button 
              v-if="isGoalTransferred(bottomSheetGoal?.id) && !isGoalCompleted(bottomSheetGoal?.id)"
              class="bottom-sheet-action action-success" 
              @click="handleBottomSheetComplete"
            >
              <Check :size="20" />
              <span>Завершить</span>
            </button>
            <button 
              v-if="isGoalTransferred(bottomSheetGoal?.id) && !isGoalCompleted(bottomSheetGoal?.id)"
              class="bottom-sheet-action action-danger" 
              @click="handleBottomSheetRemoveFromWork"
            >
              <RotateCcw :size="20" />
              <span>Вернуть в банк</span>
            </button>
            <button 
              v-if="isGoalCompleted(bottomSheetGoal?.id)"
              class="bottom-sheet-action action-success" 
              @click="handleBottomSheetReturnToWork"
            >
              <RotateCcw :size="20" />
              <span>Вернуть в работу</span>
            </button>
            <button class="bottom-sheet-action action-cancel" @click="closeBottomSheet">
              <span>Отмена</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

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

    <!-- Edit Goal Modal - Redesigned with Tabs -->
    <Transition name="modal-fade">
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
              v-if="!isGoalTransferred(editingGoal.id) && !isGoalCompleted(editingGoal.id)"
              class="quick-action-btn action-work"
              title="Взять цель в работу"
              @click="handleQuickTakeToWork"
            >
              <Play :size="16" />
              <span>Взять в работу</span>
            </button>
            <button 
              v-if="isGoalTransferred(editingGoal.id) && !isGoalCompleted(editingGoal.id)"
              class="quick-action-btn action-remove-work"
              title="Вернуть цель в банк"
              @click="handleQuickRemoveFromWork"
            >
              <RotateCcw :size="16" />
              <span>Вернуть в банк</span>
            </button>
            <button 
              v-if="isGoalTransferred(editingGoal.id)"
              class="quick-action-btn action-decompose"
              title="Перейти к декомпозиции на шаги"
              @click="goToDecompose(editingGoal.id)"
            >
              <GitBranch :size="16" />
              <span>Шаги</span>
            </button>
            <button 
              v-if="isGoalTransferred(editingGoal.id) && !isGoalCompleted(editingGoal.id)"
              class="quick-action-btn action-complete"
              title="Завершить цель"
              @click="handleQuickComplete"
            >
              <CheckCircle :size="16" />
              <span>Завершить</span>
            </button>
            <button 
              v-if="isGoalCompleted(editingGoal.id)"
              class="quick-action-btn action-work"
              title="Вернуть цель в работу"
              @click="handleQuickReturnToWork"
            >
              <RotateCcw :size="16" />
              <span>Вернуть в работу</span>
            </button>
          </div>

          <div class="modal-body modal-body-tabs" v-if="editingGoal">
            <!-- Goal editing content -->
            <div class="tab-content">
              <div class="form-group">
                <label class="form-label">Название цели</label>
                <input 
                  v-model="editingGoal.text"
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
                    <component :is="getSphereIcon(sphere.id)" :size="18" :stroke-width="2" />
                    <span>{{ getSphereNameOnly(sphere.id) }}</span>
                  </button>
                </div>
              </div>

              <!-- Collapsible Reflection Section -->
              <div class="reflection-toggle-section">
                <button 
                  type="button"
                  class="reflection-toggle-btn"
                  @click="showEditReflection = !showEditReflection"
                >
                  <MessageSquare :size="16" />
                  <span>{{ showEditReflection ? 'Скрыть рефлексию' : 'Добавить рефлексию' }}</span>
                  <span class="optional-badge" v-if="!showEditReflection">опционально</span>
                  <ChevronDown :size="16" class="toggle-chevron" :class="{ rotated: showEditReflection }" />
                </button>
              </div>

              <transition name="slide-fade">
                <div v-if="showEditReflection" class="reflection-fields">
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
              </transition>
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
              <button class="btn btn-primary" @click="saveGoalEdit">
                <Check :size="16" :stroke-width="2" />
                Сохранить
              </button>
            </div>
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
            <!-- Секция помощников: шаблоны и ментор -->
            <div class="helpers-section">
              <button class="helper-toggle" @click="toggleTemplates">
                <Lightbulb :size="18" />
                <span>Выбрать из шаблонов</span>
                <ChevronDown :size="16" class="toggle-chevron" :class="{ rotated: showTemplates }" />
              </button>
              <button class="helper-toggle mentor-toggle" @click="openMentorModal">
                <Bot :size="18" />
                <span>Помощь от ментора</span>
              </button>
            </div>
            
            <!-- Секция шаблонов целей -->
            <transition name="slide-fade">
              <div v-if="showTemplates" class="templates-section">
                <div class="templates-sphere-tabs">
                  <button
                    v-for="sphere in lifeSpheres"
                    :key="sphere.id"
                    class="template-sphere-tab"
                    :class="{ active: selectedTemplateSphere === sphere.id }"
                    :style="{ '--sphere-color': getSphereColor(sphere.id) }"
                    :title="getSphereNameOnly(sphere.id)"
                    @click="selectedTemplateSphere = sphere.id"
                  >
                    <component :is="getSphereIcon(sphere.id)" :size="16" />
                  </button>
                </div>
                
                <div class="templates-list">
                  <button
                    v-for="(template, idx) in filteredTemplates"
                    :key="idx"
                    class="template-item"
                    @click="selectTemplate(template)"
                  >
                    {{ template }}
                  </button>
                </div>
              </div>
            </transition>

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

            <!-- Опциональная секция рефлексии (скрыта по умолчанию) -->
            <div class="reflection-toggle-section">
              <button class="reflection-toggle-btn" @click="showReflectionSection = !showReflectionSection">
                <MessageSquare :size="16" />
                <span>Добавить рефлексию</span>
                <span class="optional-badge">опционально</span>
                <ChevronDown :size="16" class="toggle-chevron" :class="{ rotated: showReflectionSection }" />
              </button>
              
              <transition name="slide-fade">
                <div v-if="showReflectionSection" class="reflection-content">
                  <div class="accordion-group">
                    <div 
                      class="accordion-header" 
                      :class="{ open: whyAccordion.question1Open, filled: newGoal.whyImportant?.trim() }"
                      @click="toggleWhyQuestion(1)"
                    >
                      <span class="accordion-title">1. Почему для меня это важно?</span>
                      <span v-if="newGoal.whyImportant?.trim() && !whyAccordion.question1Open" class="accordion-preview">{{ newGoal.whyImportant.slice(0, 30) }}...</span>
                      <ChevronDown :size="16" class="accordion-chevron" :class="{ open: whyAccordion.question1Open }" />
                    </div>
                    <div class="accordion-content" v-show="whyAccordion.question1Open">
                      <textarea 
                        v-model="newGoal.whyImportant"
                        class="form-textarea"
                        placeholder="Опишите, почему эта цель важна для вас"
                        rows="3"
                      ></textarea>
                    </div>
                  </div>

                  <div class="accordion-group">
                    <div 
                      class="accordion-header" 
                      :class="{ open: whyAccordion.question2Open, filled: newGoal.why2?.trim() }"
                      @click="toggleWhyQuestion(2)"
                    >
                      <span class="accordion-title">2. Как это изменит мою жизнь?</span>
                      <span v-if="newGoal.why2?.trim() && !whyAccordion.question2Open" class="accordion-preview">{{ newGoal.why2.slice(0, 30) }}...</span>
                      <ChevronDown :size="16" class="accordion-chevron" :class="{ open: whyAccordion.question2Open }" />
                    </div>
                    <div class="accordion-content" v-show="whyAccordion.question2Open">
                      <textarea 
                        v-model="newGoal.why2"
                        class="form-textarea"
                        placeholder="Опишите, как достижение этой цели изменит вашу жизнь"
                        rows="3"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </transition>
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

    <!-- Mentor Goal Suggestions Modal -->
    <MentorGoalSuggestionsModal
      :show="showMentorModal"
      @close="showMentorModal = false"
      @goals-created="onMentorGoalsCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '../stores/app'
import { useXpStore } from '@/stores/xp'
import { useXPNotification } from '@/composables/useXPNotification.js'
import { DEBUG_MODE, SKIP_AUTH_CHECK } from '@/config/settings.js'
import MentorGoalSuggestionsModal from '@/components/MentorGoalSuggestionsModal.vue'
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
  ChevronLeft,
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
  MoreVertical,
  Play,
  Pause,
  FileText,
  Settings,
  MessageSquare,
  Wand2,
  Bot,
  Loader2,
  Info
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

function getSphereIconComponent(sphereId) {
  return sphereIcons[sphereId] || Lightbulb
}

function getSphereColor(sphereId) {
  return sphereColors[sphereId] || '#6366f1'
}

const store = useAppStore()
const router = useRouter()
const route = useRoute()
const xpStore = useXpStore()
const { showGoalCompletedXP, XP_AMOUNTS } = useXPNotification()

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
const inWorkGoalsCount = computed(() => apiTotalData.value?.in_work_goals ?? transferredGoals.value.length)

// Pagination state
const currentPage = ref(1)

const addingNewGoal = ref(false)
const filterSphere = ref('')
const filterStatus = ref('')
const searchQuery = ref('')
const showSearchInput = ref(false)
const searchInputRef = ref(null)
const displayLimit = ref(10)
const showSphereDropdown = ref(false)
const showStatusDropdown = ref(false)

// Debounce timer for search
let searchDebounceTimer = null

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
    setTimeout(() => {
      showSearchInput.value = false
    }, 150)
  }
}
const selectedBankGoals = ref([])

const showEditModal = ref(false)
const editingGoal = ref(null)
const showEditReflection = ref(false)

const showBottomSheet = ref(false)
const bottomSheetGoal = ref(null)
let longPressTimer = null

const infiniteScrollTrigger = ref(null)
let infiniteScrollObserver = null

const showAddModal = ref(false)
const showMentorModal = ref(false)
const showReflectionSection = ref(false)
const newGoal = ref({
  text: '',
  sphereId: '',
  whyImportant: '',
  why2: '',
  status: null,
  generatedByAI: false,
  steps: []
})

// Accordion state for question fields
const whyAccordion = ref({
  question1Open: false,
  question2Open: false
})
const editWhyAccordion = ref({
  question1Open: false,
  question2Open: false
})

function toggleWhyQuestion(questionNum, isEdit = false) {
  const accordion = isEdit ? editWhyAccordion : whyAccordion
  if (questionNum === 1) {
    accordion.value.question1Open = !accordion.value.question1Open
  } else {
    accordion.value.question2Open = !accordion.value.question2Open
  }
}

function resetAccordion(isEdit = false) {
  const accordion = isEdit ? editWhyAccordion : whyAccordion
  accordion.value.question1Open = false
  accordion.value.question2Open = false
}

// Шаблоны целей по сферам ССП
const goalTemplates = {
  wealth: [
    'Создать финансовую подушку на 3 месяца',
    'Увеличить доход на 20%',
    'Закрыть все кредиты и долги',
    'Начать инвестировать регулярно',
    'Сократить ненужные расходы'
  ],
  hobbies: [
    'Освоить новое творческое хобби',
    'Создать портфолио своих работ',
    'Участвовать в творческом конкурсе',
    'Выделять время на отдых и хобби еженедельно',
    'Пройти курс по дизайну/музыке/искусству'
  ],
  friendship: [
    'Улучшить общение с друзьями',
    'Завести новых друзей по интересам',
    'Организовать регулярные встречи с друзьями',
    'Научиться слушать и понимать других',
    'Расширить круг общения'
  ],
  health: [
    'Установить режим сна 7-8 часов',
    'Заниматься спортом 3 раза в неделю',
    'Пройти полное медицинское обследование',
    'Наладить здоровое питание',
    'Избавиться от вредной привычки'
  ],
  career: [
    'Получить повышение или новую должность',
    'Освоить новый профессиональный навык',
    'Построить личный бренд в индустрии',
    'Найти ментора в своей сфере',
    'Пройти сертификацию или курс повышения квалификации'
  ],
  love: [
    'Улучшить отношения с партнёром',
    'Проводить качественное время с семьёй',
    'Научиться выражать чувства и благодарность',
    'Разрешить затянувшийся конфликт в отношениях',
    'Укрепить эмоциональную связь с близкими'
  ]
}

const showTemplates = ref(false)
const selectedTemplateSphere = ref('')

const filteredTemplates = computed(() => {
  if (!selectedTemplateSphere.value) return []
  return goalTemplates[selectedTemplateSphere.value] || []
})

function selectTemplate(template) {
  newGoal.value.text = template
  newGoal.value.sphereId = selectedTemplateSphere.value
  showTemplates.value = false
}

function toggleTemplates() {
  showTemplates.value = !showTemplates.value
  if (showTemplates.value && !selectedTemplateSphere.value && lifeSpheres.value.length > 0) {
    selectedTemplateSphere.value = lifeSpheres.value[0].id
  }
}

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
  router.push('/app/goals-bank')
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
    status: null,
    generatedByAI: false,
    steps: []
  }
  resetAccordion(false)
  showReflectionSection.value = false
  showTemplates.value = false
  showAddModal.value = true
}

function openMentorModal() {
  showAddModal.value = false
  showMentorModal.value = true
}

function onMentorGoalsCreated(goals) {
  if (DEBUG_MODE) {
    console.log('[GoalsBank] Mentor created goals:', goals)
  }
  showMentorModal.value = false
}

function closeAddModal() {
  showAddModal.value = false
  showReflectionSection.value = false
  showTemplates.value = false
  resetAccordion(false)
  newGoal.value = {
    text: '',
    sphereId: '',
    whyImportant: '',
    why2: '',
    status: null,
    generatedByAI: false,
    steps: []
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
    },
    generatedByAI: newGoal.value.generatedByAI,
    steps: newGoal.value.steps || []
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

const completedGoalsCount = computed(() => apiTotalData.value?.completed_goals ?? allGoals.value.filter(g => g.status === 'completed' && g.source === 'goals-bank').length)

function setFilterStatus(status) {
  filterStatus.value = status
  onFilterChange()
}

function setFilterSphere(sphereId) {
  filterSphere.value = sphereId
  onFilterChange()
}

function toggleSphereDropdown() {
  showSphereDropdown.value = !showSphereDropdown.value
  showStatusDropdown.value = false
}

function selectSphere(sphereId) {
  setFilterSphere(sphereId)
  showSphereDropdown.value = false
}

function toggleStatusDropdown() {
  showStatusDropdown.value = !showStatusDropdown.value
  showSphereDropdown.value = false
}

function selectStatus(status) {
  setFilterStatus(status)
  showStatusDropdown.value = false
}

function getStatusLabel(status) {
  if (status === 'work') return 'В работе'
  if (status === 'complete') return 'Завершены'
  return 'Все'
}

function closeAllDropdowns() {
  showSphereDropdown.value = false
  showStatusDropdown.value = false
}

function handleClickOutside(event) {
  const sphereDropdown = document.querySelector('.sphere-dropdown-wrapper')
  const statusDropdown = document.querySelector('.status-dropdown-wrapper')
  
  if (sphereDropdown && !sphereDropdown.contains(event.target)) {
    showSphereDropdown.value = false
  }
  if (statusDropdown && !statusDropdown.contains(event.target)) {
    showStatusDropdown.value = false
  }
}

function getStatusClass(goal) {
  if (isGoalCompleted(goal.id)) return 'completed'
  if (isGoalTransferred(goal.id)) return 'in-work'
  return 'available'
}

function getStatusText(goal) {
  if (isGoalCompleted(goal.id)) return 'Завершена'
  if (isGoalTransferred(goal.id)) return 'В работе'
  return ''
}

function getStepsProgress(goal) {
  // 1. Check rawIdea's totalStepsData (from backend)
  if (goal.totalStepsData?.total_steps > 0) {
    return {
      completed: goal.totalStepsData.completed_steps || 0,
      total: goal.totalStepsData.total_steps
    }
  }
  
  // 2. Check rawIdea's steps directly (for local/demo mode)
  if (goal.steps && goal.steps.length > 0) {
    return {
      completed: goal.steps.filter(s => s.completed).length,
      total: goal.steps.length
    }
  }
  
  // 3. Find transferred goal in work (by sourceId or by id)
  const transferredGoal = allGoals.value.find(g => 
    (g.sourceId === goal.id && g.source === 'goals-bank') || g.id === goal.id
  )
  if (transferredGoal) {
    if (transferredGoal.totalStepsData?.total_steps > 0) {
      return {
        completed: transferredGoal.totalStepsData.completed_steps || 0,
        total: transferredGoal.totalStepsData.total_steps
      }
    }
    if (transferredGoal.steps && transferredGoal.steps.length > 0) {
      return {
        completed: transferredGoal.steps.filter(s => s.completed).length,
        total: transferredGoal.steps.length
      }
    }
  }
  
  return null
}

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

// Bottom Sheet methods
function openBottomSheet(goal) {
  bottomSheetGoal.value = goal
  showBottomSheet.value = true
}

function closeBottomSheet() {
  showBottomSheet.value = false
  bottomSheetGoal.value = null
}

function startLongPress(goal) {
  longPressTimer = setTimeout(() => {
    openBottomSheet(goal)
  }, 500)
}

function cancelLongPress() {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

function handleBottomSheetEdit() {
  if (bottomSheetGoal.value) {
    openEditModal(bottomSheetGoal.value)
  }
  closeBottomSheet()
}

function handleBottomSheetDecompose() {
  if (bottomSheetGoal.value) {
    goToDecompose(bottomSheetGoal.value.id)
  }
  closeBottomSheet()
}

function handleBottomSheetTakeToWork() {
  if (bottomSheetGoal.value) {
    takeGoalToWork(bottomSheetGoal.value)
  }
  closeBottomSheet()
}

function handleBottomSheetComplete() {
  if (bottomSheetGoal.value) {
    completeGoalFromBank(bottomSheetGoal.value)
  }
  closeBottomSheet()
}

function handleBottomSheetRemoveFromWork() {
  if (bottomSheetGoal.value) {
    removeFromWorkBySourceId(bottomSheetGoal.value.id)
  }
  closeBottomSheet()
}

async function handleBottomSheetReturnToWork() {
  if (!bottomSheetGoal.value) return
  
  const goal = bottomSheetGoal.value
  const backendId = goal.backendId || goal.id
  
  try {
    const { updateGoals } = await import('@/services/api.js')
    const result = await updateGoals({
      goals_data: [{
        goal_id: parseInt(backendId, 10),
        work_status: 'work'
      }]
    })
    
    if (result.status === 'ok' || result.status === 'success') {
      const transferredGoal = store.goals.find(g => 
        (g.sourceId === goal.id || g.backendId === backendId) && 
        g.source === 'goals-bank'
      )
      if (transferredGoal) {
        store.updateGoal(transferredGoal.id, { status: 'active' })
      }
      console.log('[GoalsBank] Цель возвращена в работу:', backendId)
    } else {
      throw new Error(result.error_data?.message || 'Ошибка сервера')
    }
  } catch (error) {
    console.error('Failed to return goal to work:', error)
    alert('Ошибка при изменении статуса: ' + error.message)
  }
  closeBottomSheet()
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
// No local filtering needed - just return rawIdeas from current page
const filteredGoals = computed(() => {
  return rawIdeas.value
})

const GOALS_PER_PAGE = 10
const currentPageLocal = ref(1)

const totalPages = computed(() => {
  return apiPagination.value.totalPages || 1
})

const paginatedGoals = computed(() => {
  return filteredGoals.value
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPageLocal.value
  const pages = []
  
  if (total <= 5) {
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

async function goToPage(page) {
  if (page >= 1 && page <= totalPages.value && page !== currentPageLocal.value) {
    currentPageLocal.value = page
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
    await loadGoalsWithFilters(page, false)
  }
}

const hasMoreGoals = computed(() => {
  return false
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
    displayLimit.value += 10
  }
}

function resetPagination() {
  currentPageLocal.value = 1
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
    page: page,
    page_size: GOALS_PER_PAGE
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
    // Pass append flag to store - false for page navigation (replace data)
    const result = await store.loadGoalsFromBackend(params, append)
    
    if (result.success) {
      currentPage.value = page
      currentPageLocal.value = page
      if (DEBUG_MODE) {
        console.log('[GoalsBank] Goals loaded, page:', page, 'totalPages:', apiPagination.value.totalPages, 'count:', rawIdeas.value.length)
      }
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
    const goal = rawIdeas.value.find(g => g.id === id)
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
    .map(id => rawIdeas.value.find(g => g.id === id))
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
      const goal = rawIdeas.value.find(g => g.id === sourceId)
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
      total: 0
    }
  })
  
  rawIdeas.value.forEach(idea => {
    if (idea.sphereId && distribution[idea.sphereId]) {
      distribution[idea.sphereId].total++
    }
  })
  
  return Object.values(distribution)
    .filter(s => s.total > 0)
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
  return rawIdeas.value.filter(g => isWeakSphere(g.sphereId))
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
  
  const selectedGoals = rawIdeas.value.filter(g => selectedGoalIds.value.includes(g.id))
  
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
    
    showGoalCompletedXP()
    xpStore.addToBalance(XP_AMOUNTS.goal_completed)
    
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

function getGoalStatusEmoji(status) {
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
  resetAccordion(true)
  showEditReflection.value = !!(editingGoal.value.whyImportant || editingGoal.value.why2)
  showEditModal.value = true
}

function handleQuickTakeToWork() {
  if (editingGoal.value) {
    takeGoalToWork(editingGoal.value)
  }
}

function handleQuickRemoveFromWork() {
  if (editingGoal.value) {
    removeFromWorkBySourceId(editingGoal.value.id)
  }
}

function handleQuickComplete() {
  if (editingGoal.value) {
    completeGoalFromBank(editingGoal.value)
    closeEditModal()
  }
}

async function handleQuickReturnToWork() {
  if (!editingGoal.value) return
  
  const goal = editingGoal.value
  const backendId = goal.backendId || goal.id
  
  try {
    const { updateGoals } = await import('@/services/api.js')
    const result = await updateGoals({
      goals_data: [{
        goal_id: parseInt(backendId, 10),
        work_status: 'work'
      }]
    })
    
    if (result.status === 'ok' || result.status === 'success') {
      // Обновляем статус в store
      const transferredGoal = store.goals.find(g => 
        (g.sourceId === goal.id || g.backendId === backendId) && 
        g.source === 'goals-bank'
      )
      if (transferredGoal) {
        store.updateGoal(transferredGoal.id, { status: 'active' })
      }
      
      console.log('[GoalsBank] Цель возвращена в работу:', backendId)
      closeEditModal()
    } else {
      throw new Error(result.error_data?.message || 'Ошибка сервера')
    }
  } catch (error) {
    console.error('Failed to return goal to work:', error)
    alert('Ошибка при изменении статуса: ' + error.message)
  }
}

function toggleWorkStatus() {
  if (!editingGoal.value) return
  
  if (isGoalTransferred(editingGoal.value.id)) {
    removeFromWorkBySourceId(editingGoal.value.id)
  } else {
    takeGoalToWork(editingGoal.value)
  }
}

function closeEditModal() {
  showEditModal.value = false
  showEditReflection.value = false
  resetAccordion(true)
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
  
  // Dev mode: allow navigation with local id when backend is skipped
  if (DEBUG_MODE && SKIP_AUTH_CHECK) {
    if (rawGoal) {
      // Use backendId if available, otherwise use local id prefixed with 'local-'
      const navigateId = rawGoal.backendId || `local-${goalId}`
      router.push(`/app/goals/${navigateId}`)
    } else {
      console.warn('[GoalsBank] Cannot decompose: goal not found', goalId)
    }
    return
  }
  
  // Production mode: require backendId
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
  if (!transferredGoal) {
    console.warn('[GoalsBank] Cannot edit: transferred goal not found for', goalId)
    return
  }
  
  // Use backendId if available, otherwise use id directly (id may already be local-{id} format)
  const navigateId = transferredGoal.backendId || transferredGoal.id
  
  // Dev mode: allow navigation without backendId
  if (DEBUG_MODE && SKIP_AUTH_CHECK) {
    router.push(`/app/goals/${navigateId}`)
    return
  }
  
  // Production: require backendId
  if (transferredGoal.backendId) {
    router.push(`/app/goals/${transferredGoal.backendId}`)
  } else {
    console.warn('[GoalsBank] Cannot edit: no backendId for transferred goal', goalId)
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
  
  // Setup Infinite Scroll Observer
  setupInfiniteScroll()
  
  // Add click outside listener for dropdowns
  document.addEventListener('click', handleClickOutside)
  
  // Track activation task - user viewed goals
  try {
    const { useActivationStore } = await import('@/stores/activation.js')
    const { useAppStore } = await import('@/stores/app.js')
    const activationStore = useActivationStore()
    const result = activationStore.completeTask('view_goals')
    if (result.completed && result.message) {
      const appStore = useAppStore()
      appStore.sendMentorMessage(result.message, 'assistant')
    }
  } catch (e) {
    console.error('[GoalsBank] Activation tracking error:', e)
  }
})

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
  
  // Watch for trigger element
  watch(infiniteScrollTrigger, (el) => {
    if (el && infiniteScrollObserver) {
      infiniteScrollObserver.observe(el)
    }
  }, { immediate: true })
}

onUnmounted(() => {
  if (infiniteScrollObserver) {
    infiniteScrollObserver.disconnect()
  }
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.goals-bank-container {
  max-width: var(--content-width-wide);
  margin: 0 auto;
  padding: var(--container-padding);
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

.loading-spinner-small {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.infinite-scroll-trigger {
  display: flex;
  justify-content: center;
  padding: 1.5rem;
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
  font-size: 1.75rem;
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
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.summary-section .section-header .subtitle {
  color: var(--text-secondary);
}

/* Unified Filter Bar */
.filter-bar-unified {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1rem;
  margin-bottom: 1rem;
}

/* Sphere Dropdown */
.sphere-dropdown-wrapper {
  position: relative;
}

.sphere-dropdown-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: var(--bg-secondary, #f3f4f6);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.sphere-dropdown-btn:hover {
  background: var(--bg-hover, #e5e7eb);
}

.sphere-dropdown-btn.active {
  background: rgba(99, 102, 241, 0.1);
  border-color: var(--primary-color, #6366f1);
  color: var(--primary-color, #6366f1);
}

.sphere-dropdown-btn svg.rotated {
  transform: rotate(180deg);
}

.sphere-dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 200px;
  background: var(--bg-primary, white);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-height: 300px;
  overflow-y: auto;
}

.sphere-dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: none;
  border: none;
  font-size: 0.875rem;
  color: var(--text-primary, #374151);
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}

.sphere-dropdown-item:hover {
  background: var(--bg-secondary, #f3f4f6);
}

.sphere-dropdown-item.active {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color, #6366f1);
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Status Dropdown */
.status-dropdown-wrapper {
  position: relative;
}

.status-dropdown-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: var(--bg-secondary, #f3f4f6);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.status-dropdown-btn:hover {
  background: var(--bg-hover, #e5e7eb);
}

.status-dropdown-btn.active {
  background: rgba(99, 102, 241, 0.1);
  border-color: var(--primary-color, #6366f1);
  color: var(--primary-color, #6366f1);
}

.status-dropdown-btn svg.rotated {
  transform: rotate(180deg);
}

.status-dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 140px;
  background: var(--bg-primary, white);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.status-dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: none;
  border: none;
  font-size: 0.875rem;
  color: var(--text-primary, #374151);
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}

.status-dropdown-item:hover {
  background: var(--bg-secondary, #f3f4f6);
}

.status-dropdown-item.active {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color, #6366f1);
}

/* Pagination */
.pagination-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.375rem;
  padding: 1rem;
  margin-top: 1rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 0.5rem;
  background: var(--bg-secondary, #f3f4f6);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--bg-hover, #e5e7eb);
  color: var(--text-primary, #374151);
}

.pagination-btn.active {
  background: var(--primary-color, #6366f1);
  border-color: var(--primary-color, #6366f1);
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-btn.ellipsis {
  background: transparent;
  border: none;
  cursor: default;
}

/* Search Bar */
/* Combined Search + Filter Bar */
.search-filter-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1rem;
  margin-bottom: 1rem;
}

.search-expandable {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.search-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-toggle-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.search-expandable.expanded .search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  animation: expandSearch 0.2s ease forwards;
}

@keyframes expandSearch {
  from { width: 36px; opacity: 0; }
  to { width: 160px; opacity: 1; }
}

.search-expandable .search-input {
  padding: 0.5rem 2rem 0.5rem 2rem;
  font-size: 0.875rem;
  width: 160px;
}

.search-close-btn {
  position: absolute;
  right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: var(--bg-secondary);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.search-close-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

/* Reset Filters Button */
.reset-filters-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.reset-filters-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--text-tertiary);
}

.reset-filters-btn:active {
  transform: scale(0.97);
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.search-filter-bar .search-icon {
  left: 0.625rem;
}

/* Scrollable Filter Chips */
.filter-chips-scroll {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  mask-image: linear-gradient(to right, transparent, black 8px, black calc(100% - 8px), transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 8px, black calc(100% - 8px), transparent);
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

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
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
  flex-shrink: 0;
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

.chip-count {
  font-size: 0.75rem;
  opacity: 0.8;
}

/* Goals Grid */
.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  padding: 0 1rem 1rem;
}

.goal-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  gap: 0.875rem;
  border-left: 3px solid var(--sphere-accent, var(--border-color));
}

.goal-card:hover {
  border-color: var(--primary-color);
  border-left-color: var(--sphere-accent, var(--primary-color));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.goal-card-visual {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
}

.goal-sphere-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--sphere-color) 12%, transparent);
  color: var(--sphere-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.goal-card:hover .goal-sphere-icon-wrapper {
  background: color-mix(in srgb, var(--sphere-color) 20%, transparent);
  transform: scale(1.05);
}

.goal-emoji {
  font-size: 1.25rem;
  line-height: 1;
}

.goal-card-content {
  flex: 1;
  min-width: 0;
}

.goal-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.goal-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.btn-arrow {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.btn-arrow:hover {
  background: var(--primary-color);
  color: white;
}

.btn-settings-card {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition: all 0.2s;
}

.btn-settings-card:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
  opacity: 1;
}

.goal-card:hover .btn-settings-card {
  opacity: 1;
}

.goal-card-footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.sphere-chip {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  background: color-mix(in srgb, var(--sphere-color) 15%, transparent);
  color: var(--sphere-color);
}

.status-chip {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
}

.status-chip.in-work {
  background: var(--status-success-bg);
  color: var(--status-success-text);
}

.status-chip.completed {
  background: var(--status-info-bg);
  color: var(--status-info-text);
}

.status-chip.raw {
  background: var(--status-warning-bg);
  color: var(--status-warning-text);
}

.status-chip.rejected {
  background: var(--status-danger-bg);
  color: var(--status-danger-text);
}

.status-chip.available {
  background: var(--status-purple-bg);
  color: var(--status-purple-text);
}

.steps-progress {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.ai-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: white;
}

/* Input with AI button */
.input-with-ai {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.input-with-ai .form-input {
  flex: 1;
}

.ai-generate-wrapper {
  position: relative;
}

.btn-ai-generate {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  border: none;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-ai-generate:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.btn-ai-generate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-ai-generate.generating {
  background: linear-gradient(135deg, #a78bfa, #818cf8);
}

.btn-ai-generate .spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ai-tooltip {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 220px;
  padding: 0.75rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.ai-tooltip strong {
  display: block;
  font-size: 0.875rem;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.ai-tooltip p {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* AI Preview Section */
.ai-preview-section {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1));
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.ai-preview-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #7c3aed;
  margin-bottom: 0.5rem;
}

.ai-steps-preview {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.ai-step-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  background: var(--bg-primary);
  border-radius: 0.5rem;
  font-size: 0.8125rem;
}

.ai-step-item .step-number {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #7c3aed;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-step-item .step-title {
  color: var(--text-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-steps-more {
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-secondary);
  padding: 0.25rem;
}

/* FAB Button */
.fab-button {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: var(--primary-color);
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: transform 0.15s ease;
}

.fab-button:hover {
  transform: scale(1.05);
}

/* Bottom Sheet */
.bottom-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bottom-sheet {
  background: var(--bg-primary);
  border-radius: 1rem 1rem 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom, 1rem);
}

.bottom-sheet-handle {
  width: 40px;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  margin: 0.75rem auto;
}

.bottom-sheet-header {
  padding: 0.5rem 1rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.bottom-sheet-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bottom-sheet-actions {
  padding: 0.5rem 0;
}

.bottom-sheet-action {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.25rem;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.bottom-sheet-action:hover {
  background: var(--bg-secondary);
}

.bottom-sheet-action.action-success {
  color: var(--success-color);
}

.bottom-sheet-action.action-danger {
  color: var(--danger-color);
}

.bottom-sheet-action.action-cancel {
  justify-content: center;
  color: var(--text-secondary);
  border-top: 1px solid var(--border-color);
  margin-top: 0.5rem;
}

/* Bottom Sheet Animation */
.bottom-sheet-enter-active,
.bottom-sheet-leave-active {
  transition: opacity 0.2s ease;
}

.bottom-sheet-enter-active .bottom-sheet,
.bottom-sheet-leave-active .bottom-sheet {
  transition: transform 0.25s ease;
}

.bottom-sheet-enter-from,
.bottom-sheet-leave-to {
  opacity: 0;
}

.bottom-sheet-enter-from .bottom-sheet,
.bottom-sheet-leave-to .bottom-sheet {
  transform: translateY(100%);
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
  background: var(--status-danger-bg);
  color: var(--danger-color);
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
  background: var(--primary-dark);
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.4);
}

.status-badge.completed {
  background: var(--success-color);
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
  background: var(--success-color);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
}

.status-badge.rejected {
  background: var(--danger-color);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
}

.status-badge.raw {
  background: var(--warning-color);
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
  position: relative;
  overflow: hidden;
}

.idea-card:hover {
  box-shadow: var(--shadow-sm);
}

.idea-card.validated::before,
.idea-card.rejected::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: var(--radius-md) 0 0 var(--radius-md);
}

.idea-card.validated::before {
  background: var(--success-color);
}

.idea-card.rejected {
  opacity: 0.7;
}

.idea-card.rejected::before {
  background: var(--danger-color);
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
  position: relative;
  overflow: hidden;
}

.selectable-goal-item.weak-sphere::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--warning-color);
  border-radius: var(--radius-md) 0 0 var(--radius-md);
}

.summary-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .goals-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-chips {
    padding: 0 0.75rem;
  }
  
  .search-filter-bar {
    padding: 0 0.75rem;
    gap: 0.5rem;
  }
  
  .search-toggle-btn {
    width: 32px;
    height: 32px;
  }
  
  .search-expandable.expanded .search-input-wrapper {
    animation: expandSearchMobile 0.2s ease forwards;
  }
  
  @keyframes expandSearchMobile {
    from { width: 32px; opacity: 0; }
    to { width: 120px; opacity: 1; }
  }
  
  .search-expandable .search-input {
    padding: 0.375rem 1.75rem;
    font-size: 0.8125rem;
    width: 120px;
  }
  
  .filter-chips-inner {
    gap: 0.375rem;
  }
  
  .filter-chip {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }
  
  .chip-count {
    font-size: 0.6875rem;
  }
  
  /* Reset button - hide text on mobile */
  .reset-filters-btn {
    padding: 0.5rem;
  }
  
  .reset-filters-btn .reset-text {
    display: none;
  }
  
  .summary-actions.desktop-only {
    display: none !important;
  }
  
  .fab-button.mobile-only {
    display: flex !important;
  }
  
  /* Full-screen modal on mobile */
  .edit-modal {
    max-width: 100%;
    max-height: 100%;
    height: 100%;
    border-radius: 0;
    display: flex;
    flex-direction: column;
  }
  
  .edit-modal .modal-body {
    flex: 1;
    overflow-y: auto;
  }
  
  .edit-modal .modal-footer {
    position: sticky;
    bottom: 0;
    background: var(--bg-primary);
    border-top: 1px solid var(--border-color);
    padding: 1rem;
  }
}

.section-header {
  margin-bottom: 2rem;
  text-align: center;
}

.section-header h1 {
  font-size: 1.75rem;
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
  position: relative;
  overflow: hidden;
}

.validation-card.validated::before,
.validation-card.rejected::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: var(--radius-md) 0 0 var(--radius-md);
}

.validation-card.validated::before {
  background: var(--success-color);
}

.validation-card.rejected {
  opacity: 0.7;
}

.validation-card.rejected::before {
  background: var(--danger-color);
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
  .section-header {
    padding-left: 3.5rem;
  }

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
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 1rem;
    gap: 0.75rem;
    position: relative;
    overflow: hidden;
  }
  
  .goals-table-section .goals-table tbody tr:hover {
    background: var(--bg-primary);
  }
  
  .goals-table-section .goals-table tbody tr.in-work {
    border-color: var(--primary-color);
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
  
  .goals-table-section .status-row {
    display: flex;
    align-items: stretch;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  .goals-table-section .status-row .status-badge,
  .goals-table-section .status-row .goal-sphere-badge-new {
    display: inline-flex;
    align-items: center;
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
    line-height: 1;
    margin: 0;
    vertical-align: middle;
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
    justify-content: flex-end;
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

/* Mobile Action Sheet Styles */
.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 9998;
}

.dropdown-menu-mobile {
  position: fixed;
  left: 0.75rem;
  right: 0.75rem;
  bottom: 0.75rem;
  background: var(--bg-primary);
  border-radius: 16px;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.25);
  z-index: 9999;
  padding: 0.5rem;
  animation: slideUpSheet 0.25s ease-out;
}

@keyframes slideUpSheet {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.dropdown-menu-mobile .dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem;
  border: none;
  background: none;
  font-size: 1rem;
  color: var(--text-primary);
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
}

.dropdown-menu-mobile .dropdown-item:active {
  background: var(--bg-secondary);
}

.dropdown-menu-mobile .dropdown-item-danger {
  color: #ef4444;
}

.dropdown-menu-mobile .dropdown-item-cancel {
  margin-top: 0.5rem;
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
  color: var(--text-secondary);
  justify-content: center;
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

.edit-modal.edit-modal-redesigned {
  max-width: 520px;
  width: 95%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.quick-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0 1.25rem;
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.quick-action-btn {
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

.quick-action-btn.action-work {
  background: var(--primary, #6366f1);
  color: white;
}

.quick-action-btn.action-work:hover {
  background: var(--primary-dark, #4f46e5);
}

.quick-action-btn.action-remove-work {
  background: var(--warning, #f59e0b);
  color: white;
}

.quick-action-btn.action-decompose {
  background: #8b5cf6;
  color: white;
}

.quick-action-btn.action-decompose:hover {
  background: #7c3aed;
}

.quick-action-btn.action-complete {
  background: var(--success, #10b981);
  color: white;
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

.tab-content {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-input-large {
  font-size: 1.125rem;
  padding: 0.875rem 1rem;
}

.sphere-grid-compact {
  gap: 0.5rem;
}

.motivation-intro {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--primary-light, rgba(99, 102, 241, 0.08));
  border-radius: 12px;
  margin-bottom: 1.25rem;
}

.motivation-intro p {
  margin: 0;
  color: var(--text-secondary, #6b7280);
  font-size: 0.875rem;
}

.motivation-icon {
  color: var(--primary, #6366f1);
  flex-shrink: 0;
}

.form-textarea-visible {
  min-height: 80px;
  resize: vertical;
}

.status-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.status-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  margin-bottom: 0.75rem;
}

.status-card-header svg {
  color: var(--primary, #6366f1);
}

.status-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.toggle-label {
  font-size: 0.9375rem;
  color: var(--text-primary, #1f2937);
}

.toggle-switch {
  position: relative;
  width: 52px;
  height: 28px;
  background: var(--border-color, #d1d5db);
  border-radius: 14px;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.toggle-switch.active {
  background: var(--primary, #6366f1);
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-switch.active .toggle-slider {
  transform: translateX(24px);
}

.status-hint {
  font-size: 0.8125rem;
  color: var(--text-muted, #9ca3af);
  margin: 0;
}

.status-description {
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
  margin: 0 0 1rem 0;
}

.validation-buttons-new {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.btn-validation-new {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid var(--border-color, #e5e7eb);
  background: var(--card-bg, #ffffff);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
}

.btn-validation-new:hover {
  border-color: var(--text-muted, #9ca3af);
}

.btn-validation-new.btn-confirm.active {
  background: var(--success-light, rgba(16, 185, 129, 0.1));
  border-color: var(--success, #10b981);
  color: var(--success, #10b981);
}

.btn-validation-new.btn-reject.active {
  background: var(--danger-light, rgba(239, 68, 68, 0.1));
  border-color: var(--danger, #ef4444);
  color: var(--danger, #ef4444);
}

.btn-validation-new svg {
  width: 24px;
  height: 24px;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar-container {
  flex: 1;
  height: 8px;
  background: var(--border-color, #e5e7eb);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--primary, #6366f1);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8125rem;
  color: var(--text-secondary, #6b7280);
  white-space: nowrap;
}

.modal-footer-redesigned {
  display: flex;
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

.btn-secondary {
  background: var(--bg, #f3f4f6);
  color: var(--text-primary, #1f2937);
  border: 1px solid var(--border-color, #e5e7eb);
}

.btn-secondary:hover {
  background: var(--hover-bg, #e5e7eb);
}

@media (max-width: 480px) {
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
  
  .quick-actions {
    padding: 0 1rem;
  }
  
  .quick-action-btn {
    flex: 1;
    justify-content: center;
    padding: 0.625rem 0.5rem;
  }
  
  .quick-action-btn span {
    display: none;
  }
  
  .modal-body-tabs {
    padding: 1rem;
  }
  
  .validation-buttons-new {
    grid-template-columns: 1fr;
  }
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

/* Accordion styles for why questions */
.accordion-group {
  margin-bottom: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.accordion-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.accordion-header:hover {
  background: var(--bg-tertiary);
}

.accordion-header.open {
  border-bottom: 1px solid var(--border-color);
}

.accordion-header.filled:not(.open) {
  background: rgba(34, 197, 94, 0.05);
  border-color: rgba(34, 197, 94, 0.2);
}

.accordion-title {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.accordion-preview {
  font-size: 0.75rem;
  color: var(--text-secondary);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.accordion-chevron {
  color: var(--text-secondary);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.accordion-chevron.open {
  transform: rotate(180deg);
}

.accordion-content {
  padding: 0.75rem 1rem;
  background: var(--bg-primary);
}

.accordion-content .form-textarea {
  margin: 0;
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

/* Секция рефлексии (опциональная) */
.reflection-toggle-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.reflection-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.reflection-toggle-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.reflection-toggle-btn .toggle-chevron {
  margin-left: auto;
  transition: transform 0.2s;
}

.reflection-toggle-btn .toggle-chevron.rotated {
  transform: rotate(180deg);
}

.optional-badge {
  font-size: 0.7rem;
  padding: 0.125rem 0.375rem;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: 4px;
}

.reflection-content {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.reflection-fields {
  margin-top: 0.75rem;
}

/* Шаблоны целей */
.templates-section {
  margin-bottom: 1rem;
}

.helpers-section {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.helper-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  padding: 0.75rem 0.75rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08));
  border: 1px dashed var(--primary-color);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--primary-color);
  cursor: pointer;
  transition: all 0.2s;
}

.helper-toggle:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.12));
}

.helper-toggle .toggle-chevron {
  margin-left: auto;
  transition: transform 0.2s;
}

.helper-toggle .toggle-chevron.rotated {
  transform: rotate(180deg);
}

.mentor-toggle {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(34, 197, 94, 0.08));
  border-color: #10b981;
  color: #10b981;
}

.mentor-toggle:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(34, 197, 94, 0.15));
}

@media (max-width: 480px) {
  .helpers-section {
    flex-direction: column;
  }
  
  .helper-toggle span {
    font-size: 0.8rem;
  }
}

.templates-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08));
  border: 1px dashed var(--primary-color);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--primary-color);
  cursor: pointer;
  transition: all 0.2s;
}

.templates-toggle:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.12));
}

.templates-toggle .toggle-chevron {
  margin-left: auto;
  transition: transform 0.2s;
}

.templates-toggle .toggle-chevron.rotated {
  transform: rotate(180deg);
}

.templates-content {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.templates-sphere-tabs {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.template-sphere-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1.5px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.template-sphere-tab:hover {
  border-color: var(--sphere-color);
  color: var(--sphere-color);
}

.template-sphere-tab.active {
  border-color: var(--sphere-color);
  background: color-mix(in srgb, var(--sphere-color) 15%, var(--bg-primary));
  color: var(--sphere-color);
}

.templates-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.template-item {
  padding: 0.75rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
}

.template-item:hover {
  border-color: var(--primary-color);
  background: rgba(99, 102, 241, 0.05);
}

/* Slide-fade transition */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  opacity: 1;
  max-height: 400px;
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

.modal-footer-center {
  justify-content: center;
}

.modal-footer-left,
.modal-footer-right {
  display: flex;
  gap: 0.75rem;
}

.modal-footer-add {
  display: flex;
  flex-direction: row;
  gap: 0.75rem;
}

.modal-footer-add .btn {
  flex: 1;
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
  
  .modal-footer-add {
    flex-direction: row;
  }
  
  .modal-footer-add .btn {
    flex: 1;
    padding: 0.75rem 0.5rem;
    font-size: 0.875rem;
  }
}
</style>
