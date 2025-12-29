# Django Templates для SEO Каталога

Эти HTML/CSS шаблоны предназначены для интеграции с Django templates для серверного рендеринга страниц каталога.

## Структура файлов

```
django_templates/catalog/
├── base.html          # Базовый шаблон (хедер, футер, общая структура)
├── catalog.css        # Все CSS стили в одном файле
├── home.html          # Главная страница каталога (/catalog/)
├── goals.html         # Страница целей (/catalog/goals/)
├── habits.html        # Страница привычек (/catalog/habits/)
├── bundles.html       # Страница наборов (/catalog/bundles/)
└── README.md          # Этот файл
```

## Как использовать

### 1. Скопировать файлы в Django проект

```bash
# Скопировать шаблоны
cp -r django_templates/catalog/ /path/to/django/templates/catalog/

# Скопировать CSS в статику
cp django_templates/catalog/catalog.css /path/to/django/static/catalog/
```

### 2. Настроить Django views

```python
# views.py
from django.shortcuts import render

def catalog_home(request):
    context = {
        'active_page': 'catalog',
        'categories': Category.objects.all(),
        'popular_goals': Goal.objects.popular()[:5],
        'popular_habits': Habit.objects.popular()[:6],
    }
    return render(request, 'catalog/home.html', context)

def catalog_goals(request):
    context = {
        'active_page': 'goals',
        'categories': Category.objects.with_goals(),
        'popular_tags': Tag.objects.popular()[:10],
        'popular_goals': Goal.objects.popular()[:10],
    }
    return render(request, 'catalog/goals.html', context)

def catalog_habits(request):
    context = {
        'active_page': 'habits',
        'categories': Category.objects.with_habits(),
        'popular_tags': Tag.objects.habits_popular()[:10],
        'collections': HabitCollection.objects.all(),
        'top_habits': Habit.objects.popular()[:10],
    }
    return render(request, 'catalog/habits.html', context)

def catalog_bundles(request, category=None):
    bundles = Bundle.objects.all()
    if category:
        bundles = bundles.filter(category__slug=category)
    
    context = {
        'active_page': 'bundles',
        'bundles': bundles,
        'active_category': category or 'all',
    }
    return render(request, 'catalog/bundles.html', context)
```

### 3. Настроить URL routes

```python
# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('catalog/', views.catalog_home, name='catalog_home'),
    path('catalog/goals/', views.catalog_goals, name='catalog_goals'),
    path('catalog/habits/', views.catalog_habits, name='catalog_habits'),
    path('catalog/bundles/', views.catalog_bundles, name='catalog_bundles'),
    path('catalog/bundles/<slug:category>/', views.catalog_bundles, name='catalog_bundles_category'),
]
```

## Контекстные переменные

### base.html
- `user` - объект пользователя Django (для проверки `user.is_authenticated`)
- `active_page` - строка: 'catalog', 'goals', 'habits', или 'bundles'

### home.html
- `categories` - QuerySet категорий с полями: `icon`, `title`, `url`, `goals_count`
- `popular_goals` - QuerySet целей с полями: `url`, `title`, `category_name`, `duration`, `difficulty`, `description`
- `popular_habits` - QuerySet привычек с полями: `title`, `category_name`, `duration`, `difficulty`, `difficulty_class`, `description`, `tags`

### goals.html
- `categories` - QuerySet с вложенными `subcategories`
- `popular_tags` - QuerySet тегов: `slug`, `title`
- `popular_goals` - QuerySet целей с дополнительным полем `steps_count`

### habits.html
- `categories` - QuerySet с полями: `slug`, `icon`, `title`, `description`, `habits_count`, `popular_items`
- `popular_tags` - QuerySet тегов
- `collections` - QuerySet подборок: `url`, `icon`, `title`, `description`, `count`
- `top_habits` - QuerySet привычек с полями: `title`, `category_name`, `duration`, `difficulty`, `difficulty_class`, `difficulty_stars`, `frequency`, `description`, `tags`

### bundles.html
- `bundles` - QuerySet наборов с вложенными `goal` и `habits`
- `active_category` - текущий активный фильтр категории

## CSS классы для динамических данных

### Сложность привычек
```html
<span class="habit-difficulty easy">⭐ Легко</span>
<span class="habit-difficulty medium">⭐⭐ Средняя</span>
<span class="habit-difficulty hard">⭐⭐⭐ Сложно</span>
```

### Активные фильтры
```html
<a class="filter-btn active green">Все</a>
```

## SEO рекомендации

1. Добавьте Schema.org разметку (JSON-LD) для категорий и товаров
2. Настройте canonical URLs
3. Добавьте sitemap.xml с URL всех страниц каталога
4. Настройте robots.txt
5. Убедитесь, что страницы загружаются быстро (< 2 секунды)

## Адаптивность

CSS включает медиа-запросы для:
- Десктоп (> 1024px)
- Планшет (768px - 1024px)
- Мобильный (< 768px)
- Маленький мобильный (< 480px)
