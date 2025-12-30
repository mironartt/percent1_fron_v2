# Django Templates для SEO Каталога

Эти HTML/CSS шаблоны предназначены для интеграции с Django templates для серверного рендеринга страниц каталога. Статические HTML-страницы обеспечивают лучшую индексацию поисковыми системами (особенно Яндекс).

## Структура файлов

```
django_templates/catalog/
├── base.html                      # Базовый шаблон (хедер, футер, общая структура)
├── catalog.css                    # Все CSS стили в одном файле
├── README.md                      # Этот файл
│
├── # Главные страницы
├── home.html                      # Главная страница каталога (/catalog/)
├── goals.html                     # Страница целей (/catalog/goals/)
├── habits.html                    # Страница привычек (/catalog/habits/)
├── bundles.html                   # Страница наборов (/catalog/bundles/)
│
├── # Иерархия целей
├── goals_category.html            # Категория целей (/catalog/goals/<category>/)
├── goals_subcategory.html         # Подкатегория целей (/catalog/goals/<category>/<subcategory>/)
├── goal_detail.html               # Детальная страница цели (/catalog/goals/<category>/<subcategory>/<goal>/)
├── goal_step.html                 # Детальная страница шага цели (/catalog/goals/steps/<step>/)
│
├── # Иерархия привычек
├── habits_category.html           # Категория привычек (/catalog/habits/<category>/)
├── habits_subcategory.html        # Подкатегория привычек (/catalog/habits/<category>/<subcategory>/)
├── habit_detail.html              # Детальная страница привычки (/catalog/habits/<category>/<subcategory>/<habit>/)
│
├── # Теги
├── goals_tags.html                # Список тегов целей (/catalog/goals/tags/)
├── goals_tag.html                 # Цели по тегу (/catalog/goals/tags/<tag>/)
├── habits_tags.html               # Список тегов привычек (/catalog/habits/tags/)
├── habits_tag.html                # Привычки по тегу (/catalog/habits/tags/<tag>/)
│
├── # Бандлы
├── bundle_detail.html             # Детальная страница набора (/catalog/bundles/<bundle>/)
│
├── # Фильтры целей
├── goals_filter_difficulty.html   # Цели по сложности (/catalog/goals/filter/difficulty/<level>/)
├── goals_filter_duration.html     # Цели по длительности (/catalog/goals/filter/duration/<period>/)
│
└── # Фильтры привычек
    ├── habits_filter_difficulty.html  # Привычки по сложности (/catalog/habits/filter/difficulty/<level>/)
    ├── habits_filter_duration.html    # Привычки по длительности (/catalog/habits/filter/duration/<period>/)
    └── habits_filter_frequency.html   # Привычки по частоте (/catalog/habits/filter/frequency/<freq>/)
```

## Дизайн-система

### Цвета
- **Цели**: фиолетовый `#6366f1` (градиенты `#f5f3ff` → `#ede9fe`)
- **Привычки**: оранжевый `#f59e0b` (градиенты `#fef3c7` → `#fde68a`)
- **Бандлы**: зелёный `#10b981` (градиенты `#d1fae5` → `#a7f3d0`)

### Иконки
Используются emoji-иконки (не требуются изображения):
- 🎯 — цели
- ⚡ — привычки
- 📦 — бандлы (наборы)
- 🏷️ — теги
- ⏱ — длительность
- 📅 — частота

## Контекстные переменные для шаблонов

### base.html
| Переменная | Тип | Описание |
|------------|-----|----------|
| `user` | User | Объект пользователя Django |
| `active_page` | str | 'catalog', 'goals', 'habits', или 'bundles' |

---

### goals_category.html
```python
context = {
    'category': {
        'name': 'Финансы',
        'slug': 'finance',
        'icon': '💰',
        'goals_count': 25,
        'description_genitive': 'финансового благополучия',
        'tagline': 'От накоплений до инвестиций',
    },
    'subcategories': [
        {
            'slug': 'savings',
            'icon': '💵',
            'name': 'Накопления',
            'goals_count': 8,
            'short_description': 'Финансовая подушка и крупные покупки',
        },
        # ...
    ],
    'goals': Paginator,  # Список целей с пагинацией
    'current_difficulty': 'easy' | 'medium' | 'hard' | None,
    'current_duration': '1m' | '1-3m' | '3-6m' | '6m+' | None,
    'current_sort': 'popular' | 'new' | 'difficulty' | None,
    'popular_tags': QuerySet[Tag],
    'related_habits': QuerySet[Habit],
    'related_bundles': QuerySet[Bundle],
    'other_categories': QuerySet[Category],
}
```

---

### goals_subcategory.html
```python
context = {
    'category': Category,
    'subcategory': {
        'name': 'Накопления',
        'slug': 'savings',
        'icon': '💵',
        'goals_count': 8,
        'description_genitive': 'для создания резервов',
        'tagline': 'От подушки безопасности до крупных покупок',
        'name_dative': 'накоплениям',
    },
    'goals': Paginator,
    'related_habits': QuerySet[Habit],
    'articles': [{'title': '...', 'url': '...'}],  # опционально
    'other_subcategories': QuerySet[Subcategory],
    'other_categories': QuerySet[Category],
}
```

---

### goal_detail.html
```python
context = {
    'category': Category,
    'subcategory': Subcategory,
    'goal': {
        'id': 1,
        'name': 'Накопить финансовую подушку безопасности',
        'name_short': 'Финансовая подушка',
        'slug': 'emergency-fund',
        'steps_count': 8,
        'difficulty': 'medium',  # easy, medium, hard
        'difficulty_display': '⭐⭐ Средняя',
        'duration_display': '3-6 месяцев',
        'description': 'Полное описание цели...',
        'short_description': 'Краткое описание...',
        'benefits': ['Финансовая безопасность', 'Спокойствие'],
        'tags': QuerySet[Tag],
    },
    'steps': [
        {
            'slug': 'calculate-expenses',
            'name': 'Посчитать месячные расходы',
            'short_description': 'Определите ваши обязательные траты',
            'duration_display': '1-2 часа',
            'difficulty': 'easy',
            'difficulty_display': '⭐ Легко',
        },
        # ...
    ],
    'related_habits': QuerySet[Habit],
    'related_bundle': Bundle | None,
    'similar_goals': QuerySet[Goal],
    'other_categories': QuerySet[Category],
}
```

---

### goal_step.html
```python
context = {
    'step': {
        'name': 'Посчитать месячные расходы',
        'name_short': 'Расчёт расходов',
        'slug': 'calculate-expenses',
        'subtitle': 'Первый шаг к финансовой подушке',
        'duration_display': '1-2 часа',
        'difficulty': 'easy',
        'difficulty_display': '⭐ Легко',
        'type_display': 'Анализ',
        'why_description': 'Зачем нужен этот шаг...',
        'what_you_get': ['Понимание расходов', 'Базу для расчёта'],
        'methods': [
            {
                'title': 'Метод категорий',
                'steps': [
                    {'title': 'Шаг 1', 'description': 'Описание...'},
                ],
            },
        ],
        'template': 'Шаблон для расчёта...',  # опционально
        'common_mistakes': ['Ошибка 1', 'Ошибка 2'],
        'tips': ['Совет 1', 'Совет 2'],
        'goal': Goal,  # родительская цель
    },
    'other_goals_with_step': QuerySet[Goal],  # опционально
}
```

---

### goals_tags.html
```python
context = {
    'tags_count': 78,
    'popular_tags': [
        {
            'slug': 'nakopleniya',
            'name': 'накопления',
            'goals_count': 12,
            'short_description': 'Финансовая подушка, крупные покупки',
        },
        # ...
    ],
    'categories_with_tags': [
        {
            'icon': '💰',
            'name': 'Финансы',
            'tags': QuerySet[Tag],
        },
        # ...
    ],
    'alphabet': ['А', 'Б', 'В', ...],
    'tags_by_letter': {
        'А': QuerySet[Tag],
        'Б': QuerySet[Tag],
        # ...
    },
}
```

---

### goals_tag.html
```python
context = {
    'tag': {
        'name': 'накопления',
        'slug': 'nakopleniya',
        'goals_count': 12,
        'description_instrumental': 'накоплением денег',
        'tagline': 'От подушки безопасности до крупных покупок',
        'full_description': 'Полное описание тега...',
    },
    'goals': Paginator,
    'categories': QuerySet[Category],  # для фильтров
    'current_category': str | None,
    'current_difficulty': str | None,
    'current_sort': str | None,
    'related_tags': QuerySet[Tag],
    'habits_with_tag': QuerySet[Habit],  # опционально
}
```

---

### bundle_detail.html
```python
context = {
    'bundle': {
        'id': 1,
        'name': 'Финансовый старт',
        'slug': 'financial-start',
        'short_description': 'Краткое описание набора',
        'description': 'Полное описание набора...',
        'habits_count': 3,
        'duration_display': '2-3 месяца',
        'goal': Goal,
        'habits': QuerySet[Habit],
        'strategy': 'Текст стратегии...',
        'timeline': {
            'Неделя 1-2': 'Описание этапа',
            'Неделя 3-4': 'Описание этапа',
        },  # опционально
        'expected_results': ['Результат 1', 'Результат 2'],
    },
    'similar_bundles': QuerySet[Bundle],
}
```

---

### habits_category.html, habits_subcategory.html, habit_detail.html
Аналогичны шаблонам целей, с заменой:
- `goal` → `habit`
- `steps_count` → `duration_display`, `frequency_display`
- Добавлены фильтры по частоте

---

### Фильтры (goals_filter_difficulty.html и др.)
```python
context = {
    'difficulty': 'easy',  # или 'medium', 'hard'
    'difficulty_display': '⭐ Лёгкие',
    'difficulty_icon': '⭐',
    'difficulty_adjective': 'лёгких',
    'difficulty_adjective_lower': 'лёгкие',
    'difficulty_description': 'Цели для начинающих...',
    'difficulty_description_genitive': 'для начинающих',
    'difficulty_tagline': 'Идеально для первых шагов',
    'difficulty_why_text': 'Почему стоит начать с лёгких целей...',
    'difficulty_why_list': ['Быстрый результат', 'Мотивация'],
    'goals_count': 35,
    'goals': Paginator,
    'categories': QuerySet[Category],
    'other_difficulties': [
        {'slug': 'medium', 'icon': '⭐⭐', 'display': 'Средние', 'count': 40},
        {'slug': 'hard', 'icon': '⭐⭐⭐', 'display': 'Сложные', 'count': 20},
    ],
}
```

## URL маршруты

```python
# urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Главные страницы
    path('catalog/', views.catalog_home, name='catalog_home'),
    path('catalog/goals/', views.catalog_goals, name='catalog_goals'),
    path('catalog/habits/', views.catalog_habits, name='catalog_habits'),
    path('catalog/bundles/', views.catalog_bundles, name='catalog_bundles'),
    
    # Иерархия целей
    path('catalog/goals/<slug:category>/', views.goals_category, name='goals_category'),
    path('catalog/goals/<slug:category>/<slug:subcategory>/', views.goals_subcategory, name='goals_subcategory'),
    path('catalog/goals/<slug:category>/<slug:subcategory>/<slug:goal>/', views.goal_detail, name='goal_detail'),
    path('catalog/goals/steps/<slug:step>/', views.goal_step, name='goal_step'),
    
    # Иерархия привычек
    path('catalog/habits/<slug:category>/', views.habits_category, name='habits_category'),
    path('catalog/habits/<slug:category>/<slug:subcategory>/', views.habits_subcategory, name='habits_subcategory'),
    path('catalog/habits/<slug:category>/<slug:subcategory>/<slug:habit>/', views.habit_detail, name='habit_detail'),
    
    # Теги целей
    path('catalog/goals/tags/', views.goals_tags, name='goals_tags'),
    path('catalog/goals/tags/<slug:tag>/', views.goals_tag, name='goals_tag'),
    
    # Теги привычек
    path('catalog/habits/tags/', views.habits_tags, name='habits_tags'),
    path('catalog/habits/tags/<slug:tag>/', views.habits_tag, name='habits_tag'),
    
    # Бандлы
    path('catalog/bundles/<slug:bundle>/', views.bundle_detail, name='bundle_detail'),
    
    # Фильтры целей
    path('catalog/goals/filter/difficulty/<slug:difficulty>/', views.goals_filter_difficulty, name='goals_filter_difficulty'),
    path('catalog/goals/filter/duration/<slug:duration>/', views.goals_filter_duration, name='goals_filter_duration'),
    
    # Фильтры привычек
    path('catalog/habits/filter/difficulty/<slug:difficulty>/', views.habits_filter_difficulty, name='habits_filter_difficulty'),
    path('catalog/habits/filter/duration/<slug:duration>/', views.habits_filter_duration, name='habits_filter_duration'),
    path('catalog/habits/filter/frequency/<slug:frequency>/', views.habits_filter_frequency, name='habits_filter_frequency'),
]
```

## CSS классы

### Сложность
```html
<span class="difficulty-easy">⭐ Легко</span>
<span class="difficulty-medium">⭐⭐ Средняя</span>
<span class="difficulty-hard">⭐⭐⭐ Сложно</span>
```

### Цветовые модификаторы
```html
<!-- Кнопки -->
<a class="btn btn-primary">Фиолетовая (цели)</a>
<a class="btn btn-primary orange">Оранжевая (привычки)</a>
<a class="btn btn-primary green">Зелёная (бандлы)</a>

<!-- Ссылки -->
<a class="btn-link">Фиолетовая</a>
<a class="btn-link orange">Оранжевая</a>

<!-- Теги -->
<a class="tag-link">Фиолетовый</a>
<a class="tag-link orange">Оранжевый</a>

<!-- Hero секции -->
<section class="hero-section">Фиолетовый градиент</section>
<section class="hero-section yellow">Жёлтый градиент</section>
<section class="hero-section green">Зелёный градиент</section>
```

## SEO рекомендации

1. **Schema.org разметка**: Добавьте JSON-LD для `CollectionPage`, `ItemList`, `BreadcrumbList`, `HowTo`
2. **Canonical URLs**: Настройте для каждой страницы
3. **Sitemap.xml**: Включите все URL каталога
4. **Open Graph**: Используйте блоки `og_title`, `og_description`, `og_url` из base.html
5. **Скорость загрузки**: CSS в одном файле, без внешних зависимостей, emoji вместо изображений

## Юридическая информация

Все шаблоны содержат актуальные реквизиты:
- **Компания**: ИП Косик Дмитрий Владимирович
- **ИНН**: 711280092908
- **ОГРНИП**: 321774600674346

## Адаптивность

CSS включает медиа-запросы для:
- Десктоп (> 1024px) — полная сетка
- Планшет (768px - 1024px) — упрощённая сетка
- Мобильный (< 768px) — одна колонка
- Маленький мобильный (< 480px) — компактные элементы
