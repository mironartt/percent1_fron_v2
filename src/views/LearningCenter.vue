<template>
  <div class="learning-center">
    <header class="page-header">
      <div>
        <h1>Обучение</h1>
        <p class="subtitle">Изучите все возможности системы и методологию 1%</p>
      </div>
      <div class="header-progress" v-if="completedLessons > 0">
        <div class="progress-badge">
          <Award :size="16" :stroke-width="1.5" />
          <span>{{ completedLessons }}/{{ lessons.length }} уроков</span>
        </div>
      </div>
    </header>

    <div class="lessons-grid">
      <div 
        v-for="lesson in lessons" 
        :key="lesson.id"
        class="lesson-card"
        :class="{ completed: isLessonCompleted(lesson.id), locked: lesson.locked }"
        @click="openLesson(lesson)"
      >
        <div class="lesson-icon" :style="{ background: lesson.color }">
          <component :is="lesson.icon" :size="24" :stroke-width="1.5" />
        </div>
        <div class="lesson-content">
          <h3>{{ lesson.title }}</h3>
          <p>{{ lesson.description }}</p>
          <div class="lesson-meta">
            <span class="duration">
              <Clock :size="14" :stroke-width="1.5" />
              {{ lesson.duration }} мин
            </span>
            <span v-if="isLessonCompleted(lesson.id)" class="status completed">
              <CheckCircle :size="14" :stroke-width="1.5" />
              Пройдено
            </span>
            <span v-else-if="lesson.locked" class="status locked">
              <Lock :size="14" :stroke-width="1.5" />
              Заблокировано
            </span>
          </div>
        </div>
        <ChevronRight :size="20" :stroke-width="1.5" class="arrow" />
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div 
          v-if="showLessonModal" 
          class="modal-overlay" 
          @click.self="closeLessonModal"
        >
          <div class="lesson-modal">
            <button class="modal-close" @click="closeLessonModal">
              <X :size="20" :stroke-width="1.5" />
            </button>
            
            <div class="lesson-modal-header" :style="{ background: currentLesson?.color }">
              <component :is="currentLesson?.icon" :size="32" :stroke-width="1.5" />
              <h2>{{ currentLesson?.title }}</h2>
            </div>
            
            <div class="lesson-modal-content">
              <div v-if="currentLesson" v-html="currentLesson.content"></div>
            </div>
            
            <div class="lesson-modal-footer">
              <button 
                v-if="!isLessonCompleted(currentLesson?.id)" 
                class="btn btn-primary"
                @click="markLessonComplete"
              >
                <CheckCircle :size="18" :stroke-width="1.5" />
                Отметить как пройденное
              </button>
              <button 
                v-else 
                class="btn btn-secondary"
                @click="closeLessonModal"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, markRaw } from 'vue'
import { 
  BookOpen, 
  Target, 
  ChartPie, 
  Lightbulb, 
  Calendar, 
  CheckCircle, 
  TrendingUp,
  Clock,
  Lock,
  ChevronRight,
  X,
  Award,
  Bot,
  Compass
} from 'lucide-vue-next'

const showLessonModal = ref(false)
const currentLesson = ref(null)
const completedLessonIds = ref(JSON.parse(localStorage.getItem('completed-lessons') || '[]'))

const lessons = [
  {
    id: 'philosophy',
    title: 'Философия 1%',
    description: 'Узнайте, как маленькие ежедневные улучшения приводят к большим результатам',
    duration: 5,
    icon: markRaw(TrendingUp),
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    locked: false,
    content: `
      <h3>Принцип 1% улучшений</h3>
      <p>Идея проста: улучшайте что-то на 1% каждый день, и за год вы станете в 37 раз лучше.</p>
      
      <h4>Почему это работает?</h4>
      <ul>
        <li><strong>Сложный процент:</strong> Маленькие улучшения накапливаются экспоненциально</li>
        <li><strong>Привычки:</strong> Легче внедрить маленькое изменение, чем большое</li>
        <li><strong>Психология:</strong> Маленькие победы мотивируют продолжать</li>
      </ul>
      
      <h4>Математика</h4>
      <p>1.01^365 = 37.78 — если улучшаться на 1% каждый день</p>
      <p>0.99^365 = 0.03 — если ухудшаться на 1% каждый день</p>
      
      <h4>Как применять?</h4>
      <ol>
        <li>Выберите одну область для улучшения</li>
        <li>Определите минимальное действие (2 минуты)</li>
        <li>Делайте его каждый день</li>
        <li>Постепенно увеличивайте сложность</li>
      </ol>
    `
  },
  {
    id: 'ssp',
    title: 'Сбалансированная система',
    description: 'Как оценивать и балансировать все сферы жизни',
    duration: 7,
    icon: markRaw(ChartPie),
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    locked: false,
    content: `
      <h3>Колесо жизненного баланса</h3>
      <p>ССП — это инструмент для оценки удовлетворённости в разных сферах жизни.</p>
      
      <h4>8 сфер жизни</h4>
      <ul>
        <li><strong>Здоровье:</strong> Физическое и ментальное состояние</li>
        <li><strong>Карьера:</strong> Профессиональное развитие и доход</li>
        <li><strong>Финансы:</strong> Денежное благополучие и безопасность</li>
        <li><strong>Отношения:</strong> Семья, друзья, близкие</li>
        <li><strong>Личностный рост:</strong> Обучение и саморазвитие</li>
        <li><strong>Творчество:</strong> Хобби и самовыражение</li>
        <li><strong>Окружение:</strong> Дом, рабочее место, комфорт</li>
        <li><strong>Вклад:</strong> Помощь другим, влияние на мир</li>
      </ul>
      
      <h4>Как работать с ССП</h4>
      <ol>
        <li>Оцените каждую сферу от 1 до 10</li>
        <li>Найдите сферы с низкими оценками</li>
        <li>Выберите 1-2 для фокусной работы</li>
        <li>Регулярно переоценивайте (раз в месяц)</li>
      </ol>
    `
  },
  {
    id: 'goals',
    title: 'Постановка целей',
    description: 'Полная методика работы с целями: от идеи до результата',
    duration: 15,
    icon: markRaw(Target),
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    locked: false,
    content: `
      <h3>Искусство ставить и достигать цели</h3>
      <p>Правильно поставленная цель — половина успеха. В этом уроке вы узнаете полную методику работы с целями: от сбора идей до выбора ключевых целей для фокуса.</p>
      
      <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--border-color);">
      
      <h3>Шаг 1: Формирование банка идей</h3>
      <p>Первый шаг — собрать все ваши идеи, желания и мечты в одном месте.</p>
      
      <h4>Правила сбора идей:</h4>
      <ul>
        <li><strong>Записывайте всё подряд</strong> — желания, мечты, цели, хотелки</li>
        <li><strong>Не фильтруйте и не рационализируйте</strong> — пока не оценивайте реалистичность</li>
        <li><strong>Охватите все сферы жизни</strong> — здоровье, карьера, отношения, финансы, хобби</li>
        <li><strong>Формулируйте:</strong> что хочу + почему это важно для меня</li>
      </ul>
      
      <h4>Примеры целей по сферам:</h4>
      <ul>
        <li><strong>Здоровье:</strong> Пробежать марафон, сбросить 10 кг, наладить сон</li>
        <li><strong>Карьера:</strong> Получить повышение, освоить новый навык, сменить работу</li>
        <li><strong>Финансы:</strong> Накопить подушку безопасности, инвестировать, погасить кредит</li>
        <li><strong>Отношения:</strong> Больше времени с семьёй, завести друзей, улучшить общение</li>
        <li><strong>Хобби:</strong> Научиться играть на гитаре, путешествовать, рисовать</li>
      </ul>
      
      <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--border-color);">
      
      <h3>Шаг 2: Проверка целей</h3>
      <p>Не все цели — ваши настоящие цели. Некоторые навязаны обществом, взяты у авторитетов или являются «суррогатами».</p>
      
      <h4>Уберите следующие типы целей:</h4>
      <ul>
        <li><strong>Социально-приемлемые цели</strong> — «чтобы выглядело правильно» перед другими</li>
        <li><strong>Чужие цели</strong> — взятые у авторитетов, родителей или окружения</li>
        <li><strong>Суррогаты</strong> — цели, не ведущие к реальному результату (например, «похудеть» вместо «быть здоровым»)</li>
      </ul>
      
      <h4>Техника «Два Почему» для проверки:</h4>
      <p>Для каждой цели ответьте на два вопроса:</p>
      <ol>
        <li><strong>Почему для меня это важно?</strong> — найдите личную мотивацию</li>
        <li><strong>Как эта цель поможет выйти на новый уровень?</strong> — проверьте значимость</li>
      </ol>
      
      <p>Если не можете ответить честно — это, скорее всего, ложная цель.</p>
      
      <h4>Пример проверки:</h4>
      <p><strong>Цель:</strong> Выучить английский до уровня B2</p>
      <p><strong>Почему важно?</strong> Смогу читать профессиональную литературу и общаться с коллегами из других стран</p>
      <p><strong>Как поможет выйти на новый уровень?</strong> Открою доступ к международным проектам и карьерному росту</p>
      <p><em>Вывод: Истинная цель</em></p>
      
      <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--border-color);">
      
      <h3>Шаг 3: Выбор ключевых целей</h3>
      <p>Из всех истинных целей выберите 1–3 для фокусной работы. Больше — значит рассеянность.</p>
      
      <h4>Критерии выбора:</h4>
      <ul>
        <li><strong>Реально зажигают</strong> — вызывают энтузиазм и желание действовать</li>
        <li><strong>Достижимы сейчас</strong> — есть ресурсы и время для работы над ними</li>
        <li><strong>Влияют на слабые сферы</strong> — помогут улучшить баланс жизни (по результатам ССП)</li>
      </ul>
      
      <h4>Правило фокуса:</h4>
      <p><strong>Максимум 3 цели в работе одновременно.</strong> Лучше меньше, но качественнее. Остальные цели остаются в банке — вы вернётесь к ним позже.</p>
      
      <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--border-color);">
      
      <h3>Метод SMART</h3>
      <p>После выбора целей, сформулируйте их по методу SMART:</p>
      <ul>
        <li><strong>S</strong>pecific — Конкретная (что именно?)</li>
        <li><strong>M</strong>easurable — Измеримая (как измерить результат?)</li>
        <li><strong>A</strong>chievable — Достижимая (реально ли это?)</li>
        <li><strong>R</strong>elevant — Актуальная (важна ли сейчас?)</li>
        <li><strong>T</strong>ime-bound — Ограниченная по времени (когда дедлайн?)</li>
      </ul>
      
      <h4>Пример SMART-цели:</h4>
      <p><em>Вместо:</em> «Выучить английский»</p>
      <p><em>SMART:</em> «Достичь уровня B2 по английскому (сдать тест) за 6 месяцев, занимаясь 30 минут каждый день»</p>
      
      <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--border-color);">
      
      <h3>Следующий шаг</h3>
      <p>После постановки целей переходите к <strong>декомпозиции</strong> — разбивке целей на конкретные шаги. Об этом — в следующем уроке.</p>
    `
  },
  {
    id: 'decomposition',
    title: 'Декомпозиция целей',
    description: 'Как разбить большую цель на выполнимые шаги',
    duration: 6,
    icon: markRaw(Compass),
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    locked: false,
    content: `
      <h3>Разбиваем слона на кусочки</h3>
      <p>Большие цели пугают. Маленькие шаги вдохновляют.</p>
      
      <h4>Принципы декомпозиции</h4>
      <ul>
        <li><strong>Шаг = конкретное действие:</strong> «Позвонить», а не «Решить вопрос»</li>
        <li><strong>Один шаг = один сеанс:</strong> Можно сделать за 1 подход</li>
        <li><strong>Первый шаг очевиден:</strong> Вы точно знаете, что делать</li>
      </ul>
      
      <h4>Метод обратного планирования</h4>
      <ol>
        <li>Представьте, что цель достигнута</li>
        <li>Что было последним действием?</li>
        <li>Что было перед этим?</li>
        <li>Продолжайте до первого шага</li>
      </ol>
      
      <h4>Правило первого шага</h4>
      <p>Первый шаг должен быть таким простым, что невозможно сказать «нет».</p>
      <p>Не «Написать книгу», а «Открыть документ и написать заголовок».</p>
    `
  },
  {
    id: 'planning',
    title: 'Планирование недели',
    description: 'Эффективное распределение задач по дням',
    duration: 5,
    icon: markRaw(Calendar),
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    locked: false,
    content: `
      <h3>Искусство планирования</h3>
      <p>Хороший план — это свобода, а не ограничение.</p>
      
      <h4>Еженедельный ритуал</h4>
      <ol>
        <li><strong>Обзор целей:</strong> Какие цели актуальны?</li>
        <li><strong>Выбор задач:</strong> 3-5 главных задач на неделю</li>
        <li><strong>Распределение:</strong> По дням с учётом энергии</li>
        <li><strong>Буфер:</strong> Оставьте 20% времени на непредвиденное</li>
      </ol>
      
      <h4>Правило трёх</h4>
      <p>Каждый день выбирайте 3 главные задачи. Не больше.</p>
      
      <h4>Учёт энергии</h4>
      <ul>
        <li><strong>Утро:</strong> Сложные, творческие задачи</li>
        <li><strong>День:</strong> Встречи, коммуникация</li>
        <li><strong>Вечер:</strong> Рутинные, простые дела</li>
      </ul>
    `
  },
  {
    id: 'journal',
    title: 'Ведение дневника',
    description: 'Рефлексия и отслеживание прогресса',
    duration: 4,
    icon: markRaw(BookOpen),
    color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    locked: false,
    content: `
      <h3>Сила ежедневной рефлексии</h3>
      <p>Дневник — это разговор с самим собой.</p>
      
      <h4>4 вопроса для записи</h4>
      <ol>
        <li><strong>Что получилось?</strong> Зафиксируйте победы</li>
        <li><strong>Что не сделано?</strong> Честно признайте</li>
        <li><strong>Что я понял?</strong> Инсайты и уроки</li>
        <li><strong>Что завтра?</strong> Планы на следующий день</li>
      </ol>
      
      <h4>Почему это работает</h4>
      <ul>
        <li>Фиксация прогресса повышает мотивацию</li>
        <li>Анализ ошибок помогает не повторять их</li>
        <li>Письменные цели достигаются чаще</li>
      </ul>
      
      <h4>Стрик</h4>
      <p>Ведите дневник каждый день. Непрерывная серия мотивирует продолжать.</p>
    `
  },
  {
    id: 'mentor',
    title: 'Работа с наставником',
    description: 'Как эффективно использовать AI-помощника',
    duration: 3,
    icon: markRaw(Bot),
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    locked: false,
    content: `
      <h3>Ваш личный AI-наставник</h3>
      <p>Наставник всегда рядом, чтобы помочь.</p>
      
      <h4>Когда обращаться</h4>
      <ul>
        <li>Нужна помощь с формулировкой цели</li>
        <li>Застряли и не знаете следующий шаг</li>
        <li>Хотите обсудить приоритеты</li>
        <li>Нужна мотивация или поддержка</li>
      </ul>
      
      <h4>Как спрашивать</h4>
      <p>Чем конкретнее вопрос, тем полезнее ответ:</p>
      <ul>
        <li>Вместо «Что делать?» → «Как разбить цель X на шаги?»</li>
        <li>Вместо «Помоги» → «Какой первый шаг для Y?»</li>
      </ul>
      
      <h4>Режимы работы</h4>
      <ul>
        <li><strong>Проактивный:</strong> Наставник сам предлагает советы</li>
        <li><strong>По запросу:</strong> Отвечает только когда спросите</li>
      </ul>
    `
  }
]

const completedLessons = computed(() => completedLessonIds.value.length)

function isLessonCompleted(lessonId) {
  return completedLessonIds.value.includes(lessonId)
}

function openLesson(lesson) {
  if (lesson.locked) return
  currentLesson.value = lesson
  showLessonModal.value = true
}

function closeLessonModal() {
  showLessonModal.value = false
  currentLesson.value = null
}

function markLessonComplete() {
  if (currentLesson.value && !completedLessonIds.value.includes(currentLesson.value.id)) {
    completedLessonIds.value.push(currentLesson.value.id)
    localStorage.setItem('completed-lessons', JSON.stringify(completedLessonIds.value))
  }
  closeLessonModal()
}
</script>

<style scoped>
.learning-center {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: var(--text-secondary);
  margin: 0;
}

.header-progress {
  flex-shrink: 0;
}

.progress-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  font-size: 0.85rem;
  color: var(--text-primary);
}

.progress-badge svg {
  color: #f59e0b;
}

.lessons-grid {
  display: grid;
  gap: 16px;
}

.lesson-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.lesson-card:hover:not(.locked) {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.lesson-card.completed {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.05);
}

.lesson-card.locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.lesson-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.lesson-content {
  flex: 1;
  min-width: 0;
}

.lesson-content h3 {
  margin: 0 0 4px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.lesson-content p {
  margin: 0 0 10px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.lesson-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.8rem;
}

.duration, .status {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
}

.status.completed {
  color: #22c55e;
}

.status.locked {
  color: var(--text-secondary);
}

.arrow {
  color: var(--text-secondary);
  flex-shrink: 0;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.lesson-modal {
  background: var(--card-bg);
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 8px;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  z-index: 1;
}

.lesson-modal-header {
  padding: 32px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: white;
}

.lesson-modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.lesson-modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  line-height: 1.6;
}

.lesson-modal-content h3 {
  margin: 0 0 16px;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.lesson-modal-content h4 {
  margin: 24px 0 12px;
  font-size: 1rem;
  color: var(--text-primary);
}

.lesson-modal-content p {
  margin: 0 0 16px;
  color: var(--text-secondary);
}

.lesson-modal-content ul, .lesson-modal-content ol {
  margin: 0 0 16px;
  padding-left: 24px;
  color: var(--text-secondary);
}

.lesson-modal-content li {
  margin-bottom: 8px;
}

.lesson-modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-hover);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-active .lesson-modal,
.modal-leave-active .lesson-modal {
  transition: transform 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .lesson-modal,
.modal-leave-to .lesson-modal {
  transform: scale(0.95) translateY(20px);
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .lesson-card {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  
  .arrow {
    display: none;
  }
  
  .lesson-modal {
    max-height: 90vh;
  }
}
</style>
