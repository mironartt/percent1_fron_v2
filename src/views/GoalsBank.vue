<template>
  <div class="goals-bank-container">
    <!-- Empty State - First Visit -->
    <div v-if="showEmptyState" class="empty-state-section">
      <div class="empty-state-card card">
        <div class="empty-icon">🏦</div>
        <h1>Банк целей</h1>
        <p class="subtitle">
          Систематизируй свои желания и выбери приоритеты для достижения
        </p>
        
        <div class="lesson-info">
          <h3>Что вас ждёт в уроке:</h3>
          <div class="lesson-steps">
            <div class="lesson-step">
              <span class="step-num">1</span>
              <div>
                <strong>Банк идей</strong>
                <p>Запишите все свои желания, мечты и цели без фильтрации</p>
              </div>
            </div>
            <div class="lesson-step">
              <span class="step-num">2</span>
              <div>
                <strong>Проверка</strong>
                <p>Отфильтруйте истинные цели от ложных через правило "3 Почему"</p>
              </div>
            </div>
            <div class="lesson-step">
              <span class="step-num">3</span>
              <div>
                <strong>Ключевые цели</strong>
                <p>Выберите 1-3 цели для немедленного фокуса</p>
              </div>
            </div>
          </div>
        </div>

        <button class="btn btn-primary btn-lg" @click="startLesson">
          ✨ Начать урок
        </button>
      </div>
    </div>

    <!-- Summary State - After Completion -->
    <div v-else-if="showSummary" class="summary-section">
      <header class="section-header">
        <h1>🏦 Банк целей</h1>
      </header>

      <div class="summary-grid">
        <div class="summary-card card">
          <div class="summary-icon">💡</div>
          <div class="summary-value">{{ rawIdeas.length }}</div>
          <div class="summary-label">Идей в банке</div>
        </div>

        <div class="summary-card card">
          <div class="summary-icon">✅</div>
          <div class="summary-value">{{ validatedCount }}</div>
          <div class="summary-label">Истинных целей</div>
        </div>

        <div class="summary-card card">
          <div class="summary-icon">❌</div>
          <div class="summary-value">{{ rejectedCount }}</div>
          <div class="summary-label">Ложных целей</div>
        </div>

        <div class="summary-card card">
          <div class="summary-icon">🎯</div>
          <div class="summary-value">{{ transferredGoalsCount }}</div>
          <div class="summary-label">Целей в работе</div>
        </div>
      </div>

      <!-- Распределение по сферам -->
      <div class="sphere-distribution card" v-if="rawIdeas.length > 0">
        <h3>📊 Распределение целей по сферам</h3>
        <div class="sphere-bars">
          <div 
            v-for="sphere in sphereDistribution" 
            :key="sphere.id" 
            class="sphere-bar-item"
          >
            <div class="sphere-bar-header">
              <span class="sphere-bar-name">{{ sphere.icon }} {{ sphere.name }}</span>
              <span class="sphere-bar-count">{{ sphere.total }} целей</span>
            </div>
            <div class="sphere-bar-track">
              <div 
                class="sphere-bar-fill validated" 
                :style="{ width: sphere.validatedPercent + '%' }"
                :title="sphere.validated + ' истинных'"
              ></div>
              <div 
                class="sphere-bar-fill rejected" 
                :style="{ width: sphere.rejectedPercent + '%', left: sphere.validatedPercent + '%' }"
                :title="sphere.rejected + ' ложных'"
              ></div>
            </div>
            <div class="sphere-bar-legend">
              <span class="legend-validated">✅ {{ sphere.validated }}</span>
              <span class="legend-rejected">❌ {{ sphere.rejected }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Единая таблица истинных целей -->
      <div class="goals-table-section card" v-if="validatedGoals.length > 0">
        <div class="table-header">
          <h3>✅ Банк идей и целей</h3>
          <p class="section-hint">Выберите цели для отправки в декомпозицию</p>
        </div>
        
        <div class="goals-table-wrapper">
          <table class="goals-table">
            <thead>
              <tr>
                <th class="col-status">Статус</th>
                <th class="col-goal">Цель / Идея</th>
                <th class="col-why">Почему для меня это важно?</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="goal in validatedGoals" 
                :key="goal.id"
                :class="{ 'in-work': isGoalTransferred(goal.id) }"
              >
                <td class="col-status">
                  <span 
                    v-if="isGoalCompleted(goal.id)" 
                    class="status-badge completed"
                  >
                    <span class="status-icon">✓</span> Завершена
                  </span>
                  <span 
                    v-else-if="isGoalTransferred(goal.id)" 
                    class="status-badge in-work clickable"
                    @click="removeFromWork(goal.id)"
                    title="Нажмите, чтобы убрать из работы"
                  >
                    <span class="status-icon">✓</span> В работе
                  </span>
                  <label v-else class="checkbox-wrapper">
                    <input 
                      type="checkbox" 
                      :checked="selectedForTransfer.includes(goal.id)"
                      @change="toggleGoalForTransfer(goal.id)"
                    />
                    <span class="checkbox-custom"></span>
                  </label>
                </td>
                <td class="col-goal">
                  <div class="goal-cell">
                    <span class="goal-sphere-badge">{{ getSphereName(goal.sphereId) }}</span>
                    <span class="goal-text">{{ goal.text }}</span>
                  </div>
                </td>
                <td class="col-why">
                  <div class="why-cell">
                    {{ getWhyImportant(goal) }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-actions" v-if="availableForTransfer.length > 0">
          <div class="selection-info">
            Выбрано: {{ selectedForTransfer.length }} из {{ availableForTransfer.length }}
          </div>
          <button 
            class="btn btn-primary"
            :disabled="selectedForTransfer.length === 0"
            @click="transferSelectedGoals"
          >
            📋 Отправить в декомпозицию ({{ selectedForTransfer.length }})
          </button>
        </div>
      </div>

      <!-- Ложные цели -->
      <div class="rejected-goals-summary card" v-if="rejectedGoals.length > 0">
        <h3>❌ Отклонённые цели</h3>
        <p class="section-hint">Эти цели не прошли проверку "3 Почему" — сохраните их для рефлексии</p>
        <div class="rejected-goals-list">
          <div 
            v-for="goal in rejectedGoals" 
            :key="goal.id"
            class="rejected-goal-item"
          >
            <div class="rejected-goal-header">
              <span class="goal-sphere-badge muted">{{ getSphereName(goal.sphereId) }}</span>
              <span class="goal-name">{{ goal.text }}</span>
            </div>
            <div class="rejected-reason" v-if="goal.whyImportant">
              <span class="reason-label">Изначальная причина:</span> {{ goal.whyImportant }}
            </div>
          </div>
        </div>
      </div>

      <div class="summary-actions">
        <button class="btn btn-primary btn-lg" @click="goToDecomposition">
          📋 Перейти к декомпозиции
        </button>
        <button class="btn btn-secondary" @click="addNewGoal">
          ➕ Добавить новую цель
        </button>
      </div>
    </div>

    <!-- Lesson Mode - In Progress -->
    <div v-else class="lesson-mode">
      <div class="progress-bar">
        <div 
          v-for="(step, index) in steps" 
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

    <!-- Step 1: Формирование банка целей -->
    <div v-if="currentStep === 1" class="step-content">
      <div class="step-section">
        <header class="section-header">
          <h1>📝 Формирование банка целей</h1>
          <p class="subtitle">
            Запиши все идеи, желания, мечты, цели, хотелки для каждой сферы.
            <strong>Не фильтруй, не рационализируй.</strong>
          </p>
        </header>

        <div class="instruction-card card">
          <div class="instruction-icon">💡</div>
          <div>
            <h3>Как заполнять?</h3>
            <ul>
              <li>Записывай всё подряд — желания, мечты, цели</li>
              <li>Ничего не удаляй и не структурируй</li>
              <li>Это сырая база для декомпозиции на следующих этапах</li>
              <li>Формулируй: <strong>что хочу</strong> + <strong>почему это важно для меня</strong></li>
            </ul>
          </div>
        </div>

        <!-- Weak spheres alert -->
        <div v-if="weakSpheres.length > 0" class="weak-spheres-alert card">
          <div class="alert-icon">⚠️</div>
          <div class="alert-content">
            <h4>Обратите внимание на слабые сферы</h4>
            <p>По результатам ССП эти сферы требуют особого внимания:</p>
            <div class="weak-spheres-list">
              <span 
                v-for="sphere in weakSpheres" 
                :key="sphere.id"
                class="weak-sphere-tag"
                @click="selectWeakSphere(sphere.id)"
              >
                {{ sphere.icon }} {{ sphere.name }} ({{ sphere.score }}/10)
              </span>
            </div>
          </div>
        </div>

        <div class="goals-table-container">
          <div class="table-header-actions">
            <h3 class="table-title">🏦 Банк идей и целей на жизнь</h3>
            <button class="btn btn-secondary btn-sm" @click="toggleIdeasHelper">
              💡 Нужны идеи?
            </button>
          </div>

          <!-- Ideas Helper Modal -->
          <transition name="fade">
            <div v-if="showIdeasHelper" class="ideas-helper card">
              <div class="ideas-helper-header">
                <h4>💡 Примеры целей по сферам</h4>
                <button class="btn-close" @click="showIdeasHelper = false">✕</button>
              </div>
              <div class="ideas-helper-content">
                <div v-for="sphere in lifeSpheres" :key="sphere.id" class="sphere-examples">
                  <div class="sphere-examples-header">
                    <span>{{ sphere.icon }} {{ sphere.name }}</span>
                  </div>
                  <div class="example-goals">
                    <div 
                      v-for="(example, idx) in getGoalExamples(sphere.id)" 
                      :key="idx"
                      class="example-goal"
                      @click="addExampleGoal(sphere.id, example)"
                    >
                      <span class="example-text">{{ example }}</span>
                      <span class="add-icon">+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
          
          <div class="add-idea-section">
            <select v-model="newIdea.sphereId" class="form-select sphere-select" :class="{ 'weak-sphere-selected': isWeakSphere(newIdea.sphereId) }">
              <option value="">Выбери сферу</option>
              <option 
                v-for="sphere in lifeSpheres" 
                :key="sphere.id" 
                :value="sphere.id"
              >
                {{ sphere.icon }} {{ sphere.name }} {{ isWeakSphere(sphere.id) ? '⚠️' : '' }}
              </option>
            </select>
            <input 
              v-model="newIdea.text"
              type="text"
              class="form-input"
              placeholder="Цель/Идея (что хочу)"
              @keyup.enter="addNewIdea"
            />
            <input 
              v-model="newIdea.whyImportant"
              type="text"
              class="form-input"
              placeholder="Почему это важно для меня?"
              @keyup.enter="addNewIdea"
            />
            <button class="btn btn-primary" @click="addNewIdea">
              ➕ Добавить
            </button>
          </div>

          <!-- Grouped by spheres -->
          <div class="goals-grouped" v-if="rawIdeas.length > 0">
            <div 
              v-for="sphereGroup in ideasBySphere" 
              :key="sphereGroup.sphere.id"
              class="sphere-group"
              :class="{ 'weak': isWeakSphere(sphereGroup.sphere.id) }"
            >
              <div class="sphere-group-header">
                <span class="sphere-group-name">
                  {{ sphereGroup.sphere.icon }} {{ sphereGroup.sphere.name }}
                  <span v-if="isWeakSphere(sphereGroup.sphere.id)" class="weak-badge">Слабая сфера</span>
                </span>
                <span class="sphere-group-count">{{ sphereGroup.ideas.length }} целей</span>
              </div>
              <div class="sphere-group-ideas">
                <div 
                  v-for="idea in sphereGroup.ideas" 
                  :key="idea.id"
                  class="idea-card"
                  :class="{ validated: idea.status === 'validated', rejected: idea.status === 'rejected' }"
                >
                  <div class="idea-card-content">
                    <input 
                      :value="idea.text"
                      @input="updateIdea(idea.id, { text: $event.target.value })"
                      class="idea-input"
                      placeholder="Цель..."
                    />
                    <textarea 
                      :value="idea.whyImportant"
                      @input="updateIdea(idea.id, { whyImportant: $event.target.value })"
                      class="idea-textarea"
                      placeholder="Почему важно..."
                      rows="2"
                    ></textarea>
                  </div>
                  <div class="idea-card-actions">
                    <span class="status-indicator" :class="idea.status" v-if="idea.status && idea.status !== 'raw'">
                      {{ idea.status === 'validated' ? '✅' : '❌' }}
                    </span>
                    <button 
                      class="btn-icon delete"
                      @click="deleteIdea(idea.id)"
                      title="Удалить"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-table">
            <p>Пока нет целей. Начните добавлять свои идеи и желания!</p>
            <p class="hint">Нажмите "Нужны идеи?" для примеров целей</p>
          </div>
        </div>

        <div class="step-actions">
          <div class="ideas-count">
            Добавлено идей: <strong>{{ rawIdeas.length }}</strong>
          </div>
          <button 
            class="btn btn-primary btn-lg" 
            @click="nextStep"
            :disabled="!canProceedToStep(2)"
          >
            Перейти к проверке целей →
          </button>
        </div>
      </div>
    </div>

    <!-- Step 2: Проверка целей -->
    <div v-if="currentStep === 2" class="step-content">
      <div class="step-section">
        <header class="section-header">
          <h1>🔍 Проверка целей</h1>
          <p class="subtitle">
            Проверь каждую цель с помощью правила "3 Почему" и отсей ложные цели
          </p>
        </header>

        <div class="step-2-layout">
          <div class="step-2-main">
            <div class="filters-block card">
              <h3>⚠️ Убери следующие типы целей:</h3>
              <div class="filter-types">
                <div class="filter-type">
                  <span class="filter-icon">🎭</span>
                  <div>
                    <strong>Социально-приемлемые цели</strong>
                    <p>"Чтобы выглядело правильно" перед другими</p>
                  </div>
                </div>
                <div class="filter-type">
                  <span class="filter-icon">👥</span>
                  <div>
                    <strong>Чужие цели</strong>
                    <p>Взятые у авторитетов или окружения</p>
                  </div>
                </div>
                <div class="filter-type">
                  <span class="filter-icon">💭</span>
                  <div>
                    <strong>Суррогаты</strong>
                    <p>Цели, не ведущие к реальному результату</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="three-whys-instruction card">
              <h3>✅ Правило "3 Почему"</h3>
              <p>Для каждой цели ответь на три вопроса:</p>
              <ol>
                <li><strong>Почему эта цель мне важна?</strong></li>
                <li><strong>Почему именно это даст мне то, что я хочу?</strong></li>
                <li><strong>Почему это действительно про меня?</strong></li>
              </ol>
            </div>

            <!-- Validation Progress Bar -->
            <div class="validation-progress card">
          <div class="progress-header">
            <span class="progress-title">Прогресс проверки</span>
            <span class="progress-count">{{ checkedCount }} из {{ rawIdeas.length }} целей проверено</span>
          </div>
          <div class="progress-track">
            <div 
              class="progress-fill validated" 
              :style="{ width: validatedPercent + '%' }"
            ></div>
            <div 
              class="progress-fill rejected" 
              :style="{ width: rejectedPercent + '%', left: validatedPercent + '%' }"
            ></div>
          </div>
          <div class="progress-legend">
            <span class="legend-item validated">✅ Истинных: {{ validatedCount }}</span>
            <span class="legend-item rejected">❌ Ложных: {{ rejectedCount }}</span>
            <span class="legend-item pending">⏳ Осталось: {{ uncheckedCount }}</span>
          </div>
        </div>

        <div class="validation-list compact">
          <div 
            v-for="idea in rawIdeas" 
            :key="idea.id"
            class="validation-card-compact card"
            :class="{ 
              validated: idea.status === 'validated', 
              rejected: idea.status === 'rejected',
              expanded: expandedGoalId === idea.id
            }"
          >
            <div 
              class="validation-header-compact"
              @click="toggleGoalExpansion(idea.id)"
            >
              <div class="goal-info-compact">
                <span class="expand-icon">{{ expandedGoalId === idea.id ? '▼' : '▶' }}</span>
                <span class="sphere-badge-small">{{ getSphereName(idea.sphereId) }}</span>
                <h4>{{ idea.goal || idea.text || 'Без названия' }}</h4>
              </div>
              <div class="goal-status-indicator">
                <span v-if="idea.status === 'validated'" class="status-badge validated">✅ Истинная</span>
                <span v-else-if="idea.status === 'rejected'" class="status-badge rejected">❌ Ложная</span>
                <span v-else class="status-badge pending">⏳ Не проверена</span>
              </div>
            </div>

            <transition name="expand">
              <div v-if="expandedGoalId === idea.id" class="validation-dropdown">
                <p class="why-important-compact" v-if="idea.whyImportant">
                  <strong>Почему важно:</strong> {{ idea.whyImportant }}
                </p>

                <div class="three-whys-form-compact">
                  <div class="why-field-compact">
                    <label>1. Почему эта цель мне важна?</label>
                    <textarea 
                      :value="idea.threeWhys?.why1 || ''"
                      @input="updateIdeaWhys(idea.id, 'why1', $event.target.value)"
                      rows="2"
                      placeholder="Напиши свой ответ..."
                    ></textarea>
                  </div>
                  <div class="why-field-compact">
                    <label>2. Почему именно это даст мне то, что я хочу?</label>
                    <textarea 
                      :value="idea.threeWhys?.why2 || ''"
                      @input="updateIdeaWhys(idea.id, 'why2', $event.target.value)"
                      rows="2"
                      placeholder="Напиши свой ответ..."
                    ></textarea>
                  </div>
                  <div class="why-field-compact">
                    <label>3. Почему это действительно про меня?</label>
                    <textarea 
                      :value="idea.threeWhys?.why3 || ''"
                      @input="updateIdeaWhys(idea.id, 'why3', $event.target.value)"
                      rows="2"
                      placeholder="Напиши свой ответ..."
                    ></textarea>
                  </div>
                </div>

                <div class="validation-buttons">
                  <button 
                    class="btn btn-lg"
                    :class="idea.status === 'validated' ? 'btn-success' : 'btn-outline-success'"
                    @click.stop="validateGoal(idea.id, true)"
                  >
                    ✅ Это истинная цель
                  </button>
                  <button 
                    class="btn btn-lg"
                    :class="idea.status === 'rejected' ? 'btn-danger' : 'btn-outline-danger'"
                    @click.stop="validateGoal(idea.id, false)"
                  >
                    ❌ Это ложная цель
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>

            <div class="step-actions">
              <button class="btn btn-secondary" @click="prevStep">
                ← Назад
              </button>
              <button 
                class="btn btn-primary btn-lg" 
                @click="nextStep"
                :disabled="!canProceedToStep(3)"
              >
                Выбрать ключевые цели →
              </button>
            </div>
          </div>

          <!-- AI Coach Sidebar -->
          <div class="step-2-sidebar">
            <div class="card ai-coach">
              <div class="coach-header">
                <span class="coach-icon">💬</span>
                <h3>ИИ-коуч</h3>
              </div>
              
              <div class="chat-container">
                <div class="chat-messages" ref="chatMessagesContainer">
                  <div class="message coach-message">
                    <span class="message-avatar">🤖</span>
                    <div class="message-content">
                      <p>Привет! Я помогу тебе проверить цели. Ответь на 3 вопроса для каждой цели, чтобы понять — она истинная или ложная.</p>
                    </div>
                  </div>
                  <div v-for="msg in goalsChatMessages" :key="msg.id" class="message" :class="msg.type + '-message'">
                    <span v-if="msg.type === 'coach'" class="message-avatar">🤖</span>
                    <div class="message-content">
                      <p>{{ msg.text }}</p>
                    </div>
                    <span v-if="msg.type === 'user'" class="message-avatar user">👤</span>
                  </div>
                </div>
                
                <div class="chat-input-area">
                  <input 
                    v-model="goalsUserMessage"
                    @keyup.enter="sendGoalsMessage"
                    type="text"
                    placeholder="Напишите ваш вопрос..."
                    class="chat-input"
                  />
                  <button @click="sendGoalsMessage" class="btn-send" :disabled="!goalsUserMessage.trim()">
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 3: Выбор ключевых целей -->
    <div v-if="currentStep === 3" class="step-content">
      <div class="step-section">
        <header class="section-header">
          <h1>🎯 Выбор ключевых целей</h1>
          <p class="subtitle">
            Выбери 1–3 цели из истинных для выполнения в ближайшее время
          </p>
        </header>

        <div class="key-goals-instruction card">
          <h3>✨ Как выбрать цели для фокуса:</h3>
          <ul>
            <li><strong>Реально зажигают</strong> — вызывают энтузиазм и желание действовать</li>
            <li><strong>Достижимы сейчас</strong> — есть ресурсы и время для работы над ними</li>
            <li><strong>Максимум 3 цели</strong> — лучше меньше, но качественнее</li>
          </ul>
        </div>

        <!-- Recommendations for weak spheres -->
        <div v-if="weakSphereGoals.length > 0" class="recommendations-block card">
          <h3>💡 Рекомендуем обратить внимание</h3>
          <p>Эти цели относятся к вашим слабым сферам (по результатам ССП):</p>
          <div class="recommended-goals">
            <div 
              v-for="goal in weakSphereGoals" 
              :key="goal.id"
              class="recommended-goal"
              :class="{ selected: isGoalSelected(goal.id) }"
              @click="toggleGoalSelection(goal.id)"
            >
              <span class="rec-checkbox">{{ isGoalSelected(goal.id) ? '✅' : '⬜' }}</span>
              <span class="rec-sphere">{{ getSphereName(goal.sphereId) }}</span>
              <span class="rec-text">{{ goal.text }}</span>
              <span class="rec-badge">⚠️ Слабая сфера</span>
            </div>
          </div>
        </div>

        <div class="select-goals-section card">
          <h3>📋 Твои истинные цели</h3>
          <p class="select-hint">Отметь от 1 до 3 целей, над которыми будешь работать в ближайшее время</p>
          
          <div class="selectable-goals-list">
            <div 
              v-for="goal in validatedGoals" 
              :key="goal.id" 
              class="selectable-goal-item"
              :class="{ selected: isGoalSelected(goal.id), 'weak-sphere': isWeakSphere(goal.sphereId) }"
              @click="toggleGoalSelection(goal.id)"
            >
              <div class="goal-checkbox">
                <span v-if="isGoalSelected(goal.id)">✅</span>
                <span v-else>⬜</span>
              </div>
              <div class="goal-content">
                <div class="goal-header-row">
                  <span class="sphere-badge">{{ getSphereName(goal.sphereId) }}</span>
                  <span v-if="isWeakSphere(goal.sphereId)" class="weak-indicator">⚠️</span>
                </div>
                <span class="goal-text">{{ goal.text }}</span>
                <span class="goal-why" v-if="goal.whyImportant">{{ goal.whyImportant }}</span>
              </div>
            </div>
          </div>

          <div class="selection-counter">
            Выбрано: <strong>{{ selectedGoalsCount }}</strong> / 3
          </div>
        </div>

        <!-- Preview of what happens next -->
        <div class="next-steps-preview card" v-if="selectedGoalsCount > 0">
          <h3>📋 Что будет дальше</h3>
          <div class="preview-content">
            <div class="preview-step">
              <span class="preview-icon">1️⃣</span>
              <div>
                <strong>Цели перейдут в Декомпозицию</strong>
                <p>{{ selectedGoalsCount }} {{ selectedGoalsCount === 1 ? 'цель будет добавлена' : 'цели будут добавлены' }} в раздел "Декомпозиция"</p>
              </div>
            </div>
            <div class="preview-step">
              <span class="preview-icon">2️⃣</span>
              <div>
                <strong>Разбейте на шаги</strong>
                <p>Вы сможете создать пошаговый план достижения каждой цели</p>
              </div>
            </div>
            <div class="preview-step">
              <span class="preview-icon">3️⃣</span>
              <div>
                <strong>Отслеживайте прогресс</strong>
                <p>Ежедневно отмечайте выполненные шаги и двигайтесь к результату</p>
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
            @click="completeGoalsBankHandler"
            :disabled="selectedGoalsCount < 1"
          >
            ✅ Завершить и сохранить
          </button>
        </div>
      </div>
    </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'

const store = useAppStore()
const router = useRouter()

const steps = ['Банк идей', 'Проверка', 'Ключевые цели']
const currentStep = computed(() => store.goalsBank.currentStep)

const lifeSpheres = computed(() => store.lifeSpheres)
const rawIdeas = computed(() => store.goalsBank.rawIdeas)
const keyGoals = computed(() => store.goalsBank.keyGoals)
const sphereAnalysis = computed(() => store.goalsBank.sphereAnalysis)
const completedAt = computed(() => store.goalsBank.completedAt)
const allGoals = computed(() => store.goals)

const lessonStarted = ref(false)
const addingNewGoal = ref(false)

const showEmptyState = computed(() => {
  return !completedAt.value && rawIdeas.value.length === 0 && !lessonStarted.value && !addingNewGoal.value
})

const showSummary = computed(() => {
  return !!completedAt.value && !addingNewGoal.value
})

const transferredGoals = computed(() => {
  return allGoals.value.filter(g => g.source === 'goals-bank')
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

function startLesson() {
  lessonStarted.value = true
}

function goToDecomposition() {
  router.push('/goals')
}

function addNewGoal() {
  addingNewGoal.value = true
  store.setGoalsBankStep(1)
}

function restartLesson() {
  if (confirm('Вы уверены? Все данные урока будут сброшены.')) {
    store.resetGoalsBank()
    lessonStarted.value = false
    addingNewGoal.value = false
  }
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
const selectedForTransfer = ref([])

const availableForTransfer = computed(() => {
  return validatedGoals.value.filter(g => !isGoalTransferred(g.id))
})

function toggleGoalForTransfer(goalId) {
  const index = selectedForTransfer.value.indexOf(goalId)
  if (index === -1) {
    selectedForTransfer.value.push(goalId)
  } else {
    selectedForTransfer.value.splice(index, 1)
  }
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

function transferSelectedGoals() {
  if (selectedForTransfer.value.length === 0) return
  
  selectedForTransfer.value.forEach(goalId => {
    const goal = validatedGoals.value.find(g => g.id === goalId)
    if (goal && !isGoalTransferred(goalId)) {
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
      store.addGoal(goalData)
    }
  })
  
  selectedForTransfer.value = []
}

function toggleSummaryGoalExpand(goalId) {
  if (expandedSummaryGoalId.value === goalId) {
    expandedSummaryGoalId.value = null
  } else {
    expandedSummaryGoalId.value = goalId
  }
}

function isGoalTransferred(goalId) {
  return transferredGoals.value.some(g => g.sourceId === goalId)
}

function getTransferredGoalStatus(goalId) {
  const goal = transferredGoals.value.find(g => g.sourceId === goalId)
  return goal ? goal.status : null
}

function isGoalCompleted(goalId) {
  return getTransferredGoalStatus(goalId) === 'completed'
}

function removeFromWork(goalId) {
  const goal = transferredGoals.value.find(g => g.sourceId === goalId)
  if (goal && confirm('Убрать цель из работы? Она вернётся в список для выбора.')) {
    store.deleteGoal(goal.id)
    const idx = selectedForTransfer.value.indexOf(goalId)
    if (idx > -1) {
      selectedForTransfer.value.splice(idx, 1)
    }
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

const goalsChatMessages = ref([])
const goalsUserMessage = ref('')
const chatMessagesContainer = ref(null)

async function sendGoalsMessage() {
  if (!goalsUserMessage.value.trim()) return
  
  const userMsg = {
    id: Date.now(),
    type: 'user',
    text: goalsUserMessage.value.trim()
  }
  goalsChatMessages.value.push(userMsg)
  const question = goalsUserMessage.value.trim()
  goalsUserMessage.value = ''
  
  // Scroll to bottom
  setTimeout(() => {
    if (chatMessagesContainer.value) {
      chatMessagesContainer.value.scrollTop = chatMessagesContainer.value.scrollHeight
    }
  }, 50)
  
  // Demo response (in production would call AI API)
  setTimeout(() => {
    const responses = [
      'Отличный вопрос! Подумай: если бы ты достиг этой цели, что бы изменилось в твоей жизни?',
      'Попробуй спросить себя: это действительно твоя цель или ты взял её у кого-то другого?',
      'Хороший способ проверить цель — представить, что прошёл год. Ты всё ещё хочешь этого?',
      'Истинная цель обычно вызывает энергию и желание действовать. Что ты чувствуешь, думая об этой цели?',
      'Если эта цель связана со слабой сферой из твоего колеса баланса — это хороший знак!'
    ]
    const coachMsg = {
      id: Date.now() + 1,
      type: 'coach',
      text: responses[Math.floor(Math.random() * responses.length)]
    }
    goalsChatMessages.value.push(coachMsg)
    
    setTimeout(() => {
      if (chatMessagesContainer.value) {
        chatMessagesContainer.value.scrollTop = chatMessagesContainer.value.scrollHeight
      }
    }, 50)
  }, 800)
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

function canProceedToStep(step) {
  if (step === 1) return true
  if (step === 2) return rawIdeas.value.length > 0
  if (step === 3) return validatedCount.value > 0
  return false
}

function nextStep() {
  const nextStepNum = currentStep.value + 1
  if (nextStepNum <= 3 && canProceedToStep(nextStepNum)) {
    store.setGoalsBankStep(nextStepNum)
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    store.setGoalsBankStep(currentStep.value - 1)
  }
}

function goToStep(step) {
  if (step < currentStep.value) {
    store.setGoalsBankStep(step)
  } else if (step > currentStep.value) {
    for (let s = currentStep.value + 1; s <= step; s++) {
      if (!canProceedToStep(s)) {
        return
      }
    }
    store.setGoalsBankStep(step)
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

function completeGoalsBankHandler() {
  const selectedGoals = keyGoals.value
    .filter(goal => selectedGoalIds.value.includes(goal.id))
    .map(goal => ({
      goal: goal.text,
      whyImportant: goal.action,
      sphere: goal.sphereId
    }))
  
  store.completeGoalsBank(selectedGoals)
}

function getSphereName(sphereId) {
  const sphere = lifeSpheres.value.find(s => s.id === sphereId)
  return sphere ? `${sphere.icon} ${sphere.name}` : 'Не указана'
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
</script>

<style scoped>
.goals-bank-container {
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: 2rem;
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

.lesson-info {
  text-align: left;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.lesson-info h3 {
  font-size: 1rem;
  margin-bottom: 1rem;
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

.lesson-step .step-num {
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
}

.lesson-step strong {
  display: block;
  margin-bottom: 0.25rem;
}

.lesson-step p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
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
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  text-align: center;
  padding: 1.5rem;
}

.summary-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.summary-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.summary-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.key-goals-summary {
  margin-bottom: 2rem;
}

.key-goals-summary h3 {
  margin-bottom: 1rem;
}

.key-goals-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.key-goal-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.key-goal-item .goal-sphere {
  font-size: 0.875rem;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.key-goal-item .goal-title {
  flex: 1;
  font-weight: 500;
}

.key-goal-item .goal-progress {
  font-weight: 600;
  color: var(--primary-color);
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
  content: '✓';
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
  background: #6366f1;
  color: white;
  box-shadow: 0 1px 4px rgba(99, 102, 241, 0.25);
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

/* Rejected Goals */
.rejected-goals-summary {
  margin-bottom: 2rem;
}

.rejected-goals-summary h3 {
  margin-bottom: 0.5rem;
}

.rejected-goals-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rejected-goal-item {
  padding: 1rem;
  background: rgba(239, 68, 68, 0.05);
  border-left: 3px solid var(--danger-color);
  border-radius: var(--radius-md);
}

.rejected-goal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.rejected-goal-header .goal-name {
  color: var(--text-secondary);
  text-decoration: line-through;
  text-decoration-color: var(--danger-color);
}

.rejected-reason {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-style: italic;
}

.reason-label {
  font-weight: 500;
  color: var(--text-muted);
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
  font-size: 1.5rem;
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
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.weak-sphere-tag:hover {
  background: rgba(245, 158, 11, 0.3);
  transform: translateY(-1px);
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
  font-weight: 600;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
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
  font-size: 1.25rem;
  color: var(--primary-color);
  opacity: 0;
  transition: opacity 0.2s ease;
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
  font-size: 1rem;
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

/* Step 2 Layout with AI Coach Sidebar */
.step-2-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2rem;
  align-items: start;
}

.step-2-main {
  min-width: 0;
}

.step-2-sidebar {
  position: sticky;
  top: 2rem;
}

@media (max-width: 1024px) {
  .step-2-layout {
    grid-template-columns: 1fr;
  }
  
  .step-2-sidebar {
    position: static;
    order: -1;
  }
}

/* AI Coach Styles */
.ai-coach {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1rem;
}

.coach-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.coach-icon {
  font-size: 1.25rem;
}

.coach-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 300px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-right: 0.5rem;
}

.message {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.message-avatar {
  flex-shrink: 0;
  font-size: 1rem;
}

.message-avatar.user {
  order: 1;
}

.message-content {
  flex: 1;
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.message-content p {
  margin: 0;
  padding: 0.6rem 0.85rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  line-height: 1.4;
}

.coach-message .message-content p {
  background: var(--bg-tertiary);
}

.user-message {
  flex-direction: row-reverse;
}

.user-message .message-content {
  flex-direction: row-reverse;
}

.user-message .message-content p {
  background: var(--primary-color);
  color: white;
}

.chat-input-area {
  display: flex;
  gap: 0.5rem;
}

.chat-input {
  flex: 1;
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.chat-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.chat-input-area .btn-send {
  padding: 0.6rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s ease;
}

.chat-input-area .btn-send:hover:not(:disabled) {
  background: var(--primary-hover);
}

.chat-input-area .btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  flex-shrink: 0;
}

.rec-sphere {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.rec-text {
  flex: 1;
  font-weight: 500;
}

.rec-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  background: rgba(245, 158, 11, 0.2);
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
  font-size: 0.875rem;
}

.selectable-goal-item.weak-sphere {
  border-left: 3px solid var(--warning-color);
}

/* Next Steps Preview */
.next-steps-preview {
  margin-bottom: 2rem;
  background: rgba(139, 92, 246, 0.05);
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.next-steps-preview h3 {
  margin-bottom: 1.5rem;
  color: var(--primary-color);
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preview-step {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.preview-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.preview-step strong {
  display: block;
  margin-bottom: 0.25rem;
}

.preview-step p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
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

.progress-step::after {
  content: '';
  position: absolute;
  top: 20px;
  right: 50%;
  width: 100%;
  height: 2px;
  background: var(--border-color);
  z-index: 0;
}

.progress-step:first-child::after {
  display: none;
}

.progress-step.completed::after {
  background: var(--primary-color);
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  z-index: 1;
  transition: all 0.3s ease;
}

.progress-step.active .step-number {
  background: var(--primary-color);
  color: white;
}

.progress-step.completed .step-number {
  background: var(--success-color);
  color: white;
}

.step-label {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
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

.instruction-card {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.instruction-icon {
  font-size: 2.5rem;
}

.instruction-card h3 {
  margin-bottom: 0.75rem;
}

.instruction-card ul {
  margin: 0;
  padding-left: 1.5rem;
  line-height: 1.8;
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

.filter-icon {
  font-size: 1.5rem;
}

.filter-type p {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
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
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
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
  font-size: 0.75rem;
  color: var(--text-secondary);
  transition: transform 0.2s ease;
}

.sphere-badge-small {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  white-space: nowrap;
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
  font-size: 1.5rem;
  display: flex;
  align-items: center;
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
  .progress-bar {
    padding: 0;
  }
  
  .step-label {
    font-size: 0.75rem;
  }
  
  .goals-table {
    overflow-x: auto;
  }
  
  .table-header,
  .table-row {
    min-width: 900px;
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
}
</style>
