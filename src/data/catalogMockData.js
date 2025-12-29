export const categories = [
  {
    id: 'welfare',
    slug: 'welfare',
    title: 'Финансы',
    icon: '💰',
    description: 'Накопления, инвестиции, пассивный доход',
    goalsCount: 25,
    habitsCount: 40,
    url: '/catalog/goals/welfare',
    subcategories: [
      { slug: 'savings', title: 'Накопления', count: 8 },
      { slug: 'investments', title: 'Инвестиции', count: 6 },
      { slug: 'income', title: 'Доходы', count: 5 },
      { slug: 'debts', title: 'Долги', count: 6 }
    ]
  },
  {
    id: 'health_sport',
    slug: 'health_sport',
    title: 'Здоровье',
    icon: '🏃',
    description: 'Фитнес, питание, сон, ментальное здоровье',
    goalsCount: 30,
    habitsCount: 50,
    url: '/catalog/goals/health_sport',
    subcategories: [
      { slug: 'fitness', title: 'Фитнес', count: 10 },
      { slug: 'nutrition', title: 'Питание', count: 8 },
      { slug: 'sleep', title: 'Сон', count: 4 },
      { slug: 'mental', title: 'Ментальное', count: 8 }
    ]
  },
  {
    id: 'work',
    slug: 'work',
    title: 'Карьера',
    icon: '💼',
    description: 'Навыки, продвижение, смена работы, бизнес',
    goalsCount: 20,
    habitsCount: 35,
    url: '/catalog/goals/work',
    subcategories: [
      { slug: 'skills', title: 'Навыки', count: 6 },
      { slug: 'career-growth', title: 'Карьерный рост', count: 5 },
      { slug: 'business', title: 'Бизнес', count: 5 },
      { slug: 'education', title: 'Обучение', count: 4 }
    ]
  },
  {
    id: 'family',
    slug: 'family',
    title: 'Отношения',
    icon: '❤️',
    description: 'Партнёрство, дети, родители, друзья',
    goalsCount: 18,
    habitsCount: 25,
    url: '/catalog/goals/family',
    subcategories: [
      { slug: 'partner', title: 'Партнёр', count: 6 },
      { slug: 'children', title: 'Дети', count: 4 },
      { slug: 'parents', title: 'Родители', count: 4 },
      { slug: 'friends', title: 'Друзья', count: 4 }
    ]
  },
  {
    id: 'hobby',
    slug: 'hobby',
    title: 'Хобби',
    icon: '🎨',
    description: 'Творчество, обучение новому, развлечения',
    goalsCount: 22,
    habitsCount: 30,
    url: '/catalog/goals/hobby',
    subcategories: [
      { slug: 'creativity', title: 'Творчество', count: 8 },
      { slug: 'music', title: 'Музыка', count: 5 },
      { slug: 'languages', title: 'Языки', count: 5 },
      { slug: 'sports-hobby', title: 'Спортивные хобби', count: 4 }
    ]
  },
  {
    id: 'environment',
    slug: 'environment',
    title: 'Окружение',
    icon: '👥',
    description: 'Нетворкинг, социальные навыки, сообщество',
    goalsCount: 15,
    habitsCount: 20,
    url: '/catalog/goals/environment',
    subcategories: [
      { slug: 'networking', title: 'Нетворкинг', count: 5 },
      { slug: 'communication', title: 'Коммуникация', count: 4 },
      { slug: 'community', title: 'Сообщество', count: 3 },
      { slug: 'social-skills', title: 'Социальные навыки', count: 3 }
    ]
  }
]

export const popularGoals = [
  {
    id: 1,
    slug: 'financial-cushion',
    title: 'Накопить финансовую подушку безопасности',
    description: 'Создайте резерв на 3-6 месяцев расходов для спокойствия и финансовой стабильности',
    categoryId: 'welfare',
    categoryName: 'Финансы',
    stepsCount: 8,
    difficulty: 'Средняя сложность',
    url: '/catalog/goals/welfare/savings/financial-cushion',
    tags: ['финансы', 'накопления', 'безопасность']
  },
  {
    id: 2,
    slug: 'learn-english-b2',
    title: 'Выучить английский до уровня B2',
    description: 'Достигните уровня Upper-Intermediate за 6-12 месяцев систематических занятий',
    categoryId: 'work',
    categoryName: 'Карьера',
    stepsCount: 12,
    difficulty: 'Высокая сложность',
    url: '/catalog/goals/work/education/learn-english-b2',
    tags: ['английский', 'языки', 'обучение']
  },
  {
    id: 3,
    slug: 'lose-10kg',
    title: 'Сбросить 10 кг лишнего веса',
    description: 'Здоровое похудение без экстремальных диет через правильное питание и активность',
    categoryId: 'health_sport',
    categoryName: 'Здоровье',
    stepsCount: 6,
    difficulty: 'Средняя сложность',
    url: '/catalog/goals/health_sport/fitness/lose-10kg',
    tags: ['похудение', 'здоровье', 'фитнес']
  },
  {
    id: 4,
    slug: 'start-business',
    title: 'Запустить собственный бизнес',
    description: 'Пошаговый план от идеи до первых продаж за 3-6 месяцев',
    categoryId: 'work',
    categoryName: 'Карьера',
    stepsCount: 15,
    difficulty: 'Высокая сложность',
    url: '/catalog/goals/work/business/start-business',
    tags: ['бизнес', 'предпринимательство', 'доход']
  },
  {
    id: 5,
    slug: 'improve-relationship',
    title: 'Улучшить отношения с партнёром',
    description: 'Восстановите близость и понимание через регулярные практики',
    categoryId: 'family',
    categoryName: 'Отношения',
    stepsCount: 8,
    difficulty: 'Средняя сложность',
    url: '/catalog/goals/family/partner/improve-relationship',
    tags: ['отношения', 'семья', 'любовь']
  }
]

export const popularHabits = [
  {
    id: 1,
    slug: 'morning-exercise',
    title: 'Утренняя зарядка',
    description: 'Простой комплекс упражнений для бодрости на весь день',
    categoryName: 'Здоровье',
    duration: '15 мин',
    difficulty: 'Легко',
    frequency: 'Ежедневно',
    url: '/catalog/habits/health_sport/fitness/morning-exercise',
    tags: ['утро', 'спорт', 'энергия', 'здоровье']
  },
  {
    id: 2,
    slug: 'reading-30min',
    title: 'Чтение 30 минут',
    description: 'Ежедневное чтение для расширения кругозора и развития',
    categoryName: 'Саморазвитие',
    duration: '30 мин',
    difficulty: 'Легко',
    frequency: 'Ежедневно',
    url: '/catalog/habits/hobby/self-development/reading-30min',
    tags: ['чтение', 'книги', 'саморазвитие', 'вечер']
  },
  {
    id: 3,
    slug: 'meditation',
    title: 'Медитация 10 минут',
    description: 'Практика осознанности для снижения стресса и ясности ума',
    categoryName: 'Здоровье',
    duration: '10 мин',
    difficulty: 'Легко',
    frequency: 'Ежедневно',
    url: '/catalog/habits/health_sport/mental/meditation',
    tags: ['медитация', 'mindfulness', 'стресс', 'утро']
  },
  {
    id: 4,
    slug: 'budget-tracking',
    title: 'Вести бюджет',
    description: 'Записывайте все расходы для контроля финансов',
    categoryName: 'Финансы',
    duration: '10 мин',
    difficulty: 'Легко',
    frequency: 'Ежедневно',
    url: '/catalog/habits/welfare/savings/budget-tracking',
    tags: ['финансы', 'бюджет', 'деньги', 'контроль']
  },
  {
    id: 5,
    slug: 'walking-after-lunch',
    title: 'Прогулка после обеда',
    description: 'Улучшает пищеварение и повышает продуктивность',
    categoryName: 'Здоровье',
    duration: '20 мин',
    difficulty: 'Легко',
    frequency: 'По будням',
    url: '/catalog/habits/health_sport/fitness/walking-after-lunch',
    tags: ['прогулка', 'здоровье', 'обед']
  },
  {
    id: 6,
    slug: 'day-planning',
    title: 'Планирование дня',
    description: 'Утренний ритуал планирования задач на день',
    categoryName: 'Продуктивность',
    duration: '5 мин',
    difficulty: 'Легко',
    frequency: 'По будням',
    url: '/catalog/habits/work/productivity/day-planning',
    tags: ['планирование', 'продуктивность', 'утро', 'работа']
  }
]

export const popularBundles = [
  {
    id: 1,
    slug: 'financial-safety',
    title: 'Финансовая подушка безопасности',
    description: 'Накопить подушку на 3-6 месяцев расходов',
    category: 'Финансы',
    categoryIcon: '💰',
    goal: {
      title: 'Накопить подушку на 3-6 месяцев расходов',
      url: '/catalog/goals/welfare/savings/financial-cushion'
    },
    habits: [
      { title: 'Вести бюджет', duration: '10 мин/день' },
      { title: 'Откладывать 10% от дохода', duration: 'при поступлении' },
      { title: 'Ревизия подписок', duration: '1 раз/месяц' },
      { title: 'Планирование покупок', duration: 'перед шопингом' }
    ],
    duration: '6-12 месяцев',
    difficulty: 'Средняя',
    url: '/catalog/bundles/financial-safety'
  },
  {
    id: 2,
    slug: 'productive-morning',
    title: 'Утро продуктивного человека',
    description: 'Создать продуктивный утренний ритуал',
    category: 'Продуктивность',
    categoryIcon: '⚡',
    goal: {
      title: 'Создать продуктивный утренний ритуал',
      url: '/catalog/goals/work/productivity/morning-routine'
    },
    habits: [
      { title: 'Ранний подъём в 6:00', duration: 'ежедневно' },
      { title: 'Утренняя зарядка', duration: '15 мин' },
      { title: 'Медитация', duration: '10 мин' },
      { title: 'Планирование дня', duration: '5 мин' }
    ],
    duration: '1-2 месяца',
    difficulty: 'Средняя',
    url: '/catalog/bundles/productive-morning'
  },
  {
    id: 3,
    slug: 'healthy-body',
    title: 'Здоровое тело',
    description: 'Достичь оптимального веса и физической формы',
    category: 'Здоровье',
    categoryIcon: '🏃',
    goal: {
      title: 'Сбросить 10 кг и укрепить здоровье',
      url: '/catalog/goals/health_sport/fitness/lose-10kg'
    },
    habits: [
      { title: 'Утренняя зарядка', duration: '15 мин' },
      { title: 'Подсчёт калорий', duration: '5 мин' },
      { title: '10000 шагов в день', duration: 'в течение дня' },
      { title: 'Стакан воды перед едой', duration: '1 мин' }
    ],
    duration: '3-6 месяцев',
    difficulty: 'Средняя',
    url: '/catalog/bundles/healthy-body'
  }
]

export const popularTags = [
  { slug: 'morning', title: 'утро' },
  { slug: 'evening', title: 'вечер' },
  { slug: 'meditation', title: 'медитация' },
  { slug: 'sport', title: 'спорт' },
  { slug: 'reading', title: 'чтение' },
  { slug: 'planning', title: 'планирование' },
  { slug: 'health', title: 'здоровье' },
  { slug: 'productivity', title: 'продуктивность' },
  { slug: 'focus', title: 'фокус' },
  { slug: 'relationships', title: 'отношения' },
  { slug: 'finance', title: 'финансы' }
]

export const habitCollections = [
  {
    id: 'morning',
    slug: 'morning',
    title: 'Утренние привычки',
    icon: '🌅',
    description: 'Для продуктивного начала дня',
    count: 15,
    url: '/catalog/habits/tags/morning'
  },
  {
    id: 'evening',
    slug: 'evening',
    title: 'Вечерние привычки',
    icon: '🌙',
    description: 'Для качественного отдыха и сна',
    count: 12,
    url: '/catalog/habits/tags/evening'
  },
  {
    id: 'quick',
    slug: 'quick',
    title: 'За 5 минут',
    icon: '⚡',
    description: 'Быстрые привычки на каждый день',
    count: 20,
    url: '/catalog/habits/filter/duration/5min'
  },
  {
    id: 'fitness',
    slug: 'fitness',
    title: 'Для фитнеса',
    icon: '🏋️',
    description: 'Привычки для физической формы',
    count: 18,
    url: '/catalog/habits/health_sport/fitness'
  },
  {
    id: 'mental',
    slug: 'mental',
    title: 'Для ментального здоровья',
    icon: '🧘',
    description: 'Медитация, дыхание, осознанность',
    count: 10,
    url: '/catalog/habits/health_sport/mental'
  },
  {
    id: 'beginners',
    slug: 'beginners',
    title: 'Для начинающих',
    icon: '💪',
    description: 'Самые простые привычки',
    count: 15,
    url: '/catalog/habits/filter/difficulty/easy'
  }
]
