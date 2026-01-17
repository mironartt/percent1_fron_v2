# Инструкция по установке A/B Test Onboarding

Пошаговая инструкция для разработчика по установке A/B теста онбординга в продакшн.

---

## Обзор

**Что делает A/B тест:**
- Делит новых пользователей на две группы (50/50)
- **Fast вариант**: 3 шага, 2-3 минуты, быстрый старт
- **Deep вариант**: 5 шагов, 5-7 минут, полная диагностика ССП
- Трекает события для аналитики (опционально)

**Время установки:**
- Frontend: 15-30 минут
- Backend: 2-3 часа (опционально, для аналитики)

---

## Часть 1: Frontend (обязательно)

### Шаг 1: Создать новые файлы

Скопировать файлы из `frontend/` в проект:

```bash
cd /Users/karolinaarrospide/percent1_fron_v2

# 1. A/B Test Store
cp docs/onboarding_ab_test/frontend/stores_abtest.js src/stores/abtest.js

# 2. Onboarding Router
cp docs/onboarding_ab_test/frontend/components_OnboardingRouter.vue src/components/OnboardingRouter.vue

# 3. Fast Variant
cp docs/onboarding_ab_test/frontend/components_OnboardingFast.vue src/components/OnboardingFast.vue

# 4. Deep Variant
cp docs/onboarding_ab_test/frontend/components_OnboardingDeep.vue src/components/OnboardingDeep.vue
```

**Проверка:**
```bash
ls -la src/stores/abtest.js
ls -la src/components/OnboardingRouter.vue
ls -la src/components/OnboardingFast.vue
ls -la src/components/OnboardingDeep.vue
```

Все файлы должны существовать.

---

### Шаг 2: Добавить API метод

Открыть файл `src/services/api.js` и добавить в конец:

```javascript
/**
 * Track A/B test event
 */
export async function trackABEvent(data) {
  return apiFetch('/api/rest/front/ab-event/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    skipRateLimit: true,
  })
}
```

**Или скопировать из готового файла:**
```bash
cat docs/onboarding_ab_test/frontend/api_additions.js
# Скопировать функцию trackABEvent вручную в src/services/api.js
```

---

### Шаг 3: Изменить роутер

Открыть файл `src/router/index.js`:

**3.1. Найти строку с импортом OnboardingAI:**
```javascript
const OnboardingAI = () => import('@/components/OnboardingAI.vue')
```

**3.2. Заменить на:**
```javascript
const OnboardingRouter = () => import('@/components/OnboardingRouter.vue')
```

**3.3. Найти route definition для /onboarding:**
```javascript
{
  path: '/onboarding',
  name: 'Onboarding',
  component: OnboardingAI, // ← БЫЛО
  meta: {
    requiresAuth: true,
    title: 'Онбординг'
  }
}
```

**3.4. Заменить на:**
```javascript
{
  path: '/onboarding',
  name: 'Onboarding',
  component: OnboardingRouter, // ← СТАЛО
  meta: {
    requiresAuth: true,
    title: 'Онбординг'
  }
}
```

**Готово!** Frontend установлен.

---

### Шаг 4: Локальное тестирование

```bash
# Запустить dev сервер
npm run dev
```

**Открыть браузер:**
1. Перейти на `http://localhost:5000/onboarding`
2. Открыть DevTools (F12) → Console
3. Должно появиться: `🧪 A/B Test: { variant: 'fast', ... }` или `variant: 'deep'`
4. Открыть DevTools → Application → Local Storage
5. Проверить ключ `onboarding_variant` — должен быть `'fast'` или `'deep'`

**Пройти онбординг:**
- Завершить все шаги
- Проверить, что редирект на `/app` работает
- Проверить, что цели созданы (в разделе "Цели")

**Тестирование обоих вариантов:**
```javascript
// В консоли браузера:
localStorage.removeItem('onboarding_variant')
location.reload()
// Проверить новый вариант
```

---

### Шаг 5: Build и деплой

```bash
# Build production
npm run build

# Проверить build
npm run preview
```

**Деплой:**
- Закоммитить изменения:
  ```bash
  git add .
  git commit -m "Add A/B test onboarding (Fast vs Deep)"
  git push
  ```

- Залить на production сервер (ваш CI/CD процесс)

---

## Часть 2: Backend (опционально, для аналитики)

**Важно:** Backend НЕ обязателен для работы A/B теста. Фронтенд работает без него, просто не будет аналитики.

### Предварительные требования

- Django REST Framework установлен
- PostgreSQL настроен
- Доступ к Django проекту

### Шаг 1: Создать модель

Открыть `server/apps/front/models.py` и добавить:

```python
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class ABEvent(models.Model):
    """Событие A/B теста"""

    EVENT_TYPES = [
        ('variant_assigned', 'Вариант назначен'),
        ('onboarding_started', 'Онбординг начат'),
        ('step_completed', 'Шаг завершён'),
        ('onboarding_completed', 'Онбординг завершён'),
        ('onboarding_abandoned', 'Онбординг покинут'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='ab_events',
        null=True,
        blank=True
    )
    session_id = models.CharField(max_length=100, db_index=True)
    variant = models.CharField(
        max_length=20,
        choices=[('fast', 'Fast'), ('deep', 'Deep')],
        db_index=True
    )
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES, db_index=True)
    step_number = models.IntegerField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'ab_events'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['variant', 'event_type']),
            models.Index(fields=['session_id', 'timestamp']),
        ]
```

### Шаг 2: Создать Serializer

Открыть `server/apps/front/serializers.py` и добавить:

```python
from rest_framework import serializers
from .models import ABEvent

class ABEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ABEvent
        fields = ['session_id', 'variant', 'event_type', 'step_number', 'metadata']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        return super().create(validated_data)
```

### Шаг 3: Создать View

Открыть `server/apps/front/views.py` и добавить:

```python
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .serializers import ABEventSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def track_ab_event(request):
    serializer = ABEventSerializer(
        data=request.data,
        context={'request': request}
    )
    if serializer.is_valid():
        serializer.save()
        return Response({'success': True}, status=status.HTTP_201_CREATED)
    return Response(
        {'success': False, 'errors': serializer.errors},
        status=status.HTTP_400_BAD_REQUEST
    )
```

### Шаг 4: Добавить URL

Открыть `server/apps/front/urls.py` и добавить:

```python
from .views import track_ab_event

urlpatterns = [
    # ... существующие пути
    path('ab-event/', track_ab_event, name='ab-event'),
]
```

### Шаг 5: Миграции

```bash
cd server/
python manage.py makemigrations
python manage.py migrate
```

### Шаг 6: Тестирование

```bash
# Manual test
curl -X POST http://localhost:8000/api/rest/front/ab-event/ \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-123",
    "variant": "fast",
    "event_type": "variant_assigned"
  }'

# Ожидаемый ответ:
# {"success": true}
```

**Проверка в Django shell:**
```bash
python manage.py shell
```

```python
from server.apps.front.models import ABEvent
ABEvent.objects.all()
ABEvent.objects.filter(variant='fast').count()
```

### Шаг 7: Деплой backend

```bash
# На production сервере:
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn  # или ваш WSGI сервер
```

---

## Проверка в Production

### Frontend

1. **Откройте сайт** (production URL)
2. **Зарегистрируйте нового пользователя** (или выйдите и войдите заново)
3. **Перейдите на `/onboarding`**
4. **Проверьте:**
   - Онбординг запустился
   - Вариант назначен (Fast или Deep)
   - Все шаги работают
   - Редирект на `/app` после завершения
   - Цели созданы

### Backend (если установлен)

1. **Проверьте логи Django:**
   ```bash
   tail -f /var/log/django/error.log
   ```
   Не должно быть ошибок 500

2. **Проверьте БД:**
   ```bash
   python manage.py shell
   ```
   ```python
   from server.apps.front.models import ABEvent
   ABEvent.objects.count()  # Должно быть > 0
   ABEvent.objects.filter(variant='fast').count()
   ABEvent.objects.filter(variant='deep').count()
   ```

3. **Проверьте разделение 50/50:**
   После 100+ пользователей:
   ```python
   from django.db.models import Count
   ABEvent.objects.filter(event_type='variant_assigned').values('variant').annotate(count=Count('id'))
   # Ожидается примерно 50/50
   ```

---

## Rollback Plan

Если что-то пошло не так, можно быстро откатить изменения:

### Frontend Rollback

**Вариант 1: Через Git**
```bash
git revert HEAD
git push
```

**Вариант 2: Вручную**

Открыть `src/router/index.js`:

```javascript
// Заменить обратно:
const OnboardingAI = () => import('@/components/OnboardingAI.vue')

// В route:
component: OnboardingAI
```

Пересобрать:
```bash
npm run build
# Задеплоить
```

### Backend Rollback

```bash
# Откатить миграцию
python manage.py migrate front <номер_предыдущей_миграции>

# Удалить endpoint (опционально)
# Закомментировать path('ab-event/', ...) в urls.py
```

---

## Мониторинг после запуска

### Метрики для отслеживания

**Через 100 пользователей:**
1. **Completion Rate** — процент завершивших онбординг
2. **Time to Complete** — среднее время прохождения
3. **Drop-off Rate** — процент бросивших

**Через 1000 пользователей:**
4. **Retention D1** — вернулись на следующий день
5. **Retention D7** — вернулись через неделю
6. **Goal Creation** — сколько целей создали

### Запросы для аналитики

**Completion Rate:**
```python
from django.db.models import Count, Q

stats = ABEvent.objects.values('variant').annotate(
    started=Count('id', filter=Q(event_type='onboarding_started')),
    completed=Count('id', filter=Q(event_type='onboarding_completed'))
)

for s in stats:
    rate = (s['completed'] / s['started'] * 100) if s['started'] > 0 else 0
    print(f"{s['variant']}: {rate:.1f}%")
```

**Average Time:**
```python
from django.db.models import Avg

ABEvent.objects.filter(
    event_type='step_completed',
    variant='fast'
).aggregate(avg_time=Avg('metadata__time_spent_ms'))
```

---

## Troubleshooting

### Проблема: "Cannot find module '@/stores/abtest'"

**Решение:**
```bash
# Проверить, что файл создан:
ls -la src/stores/abtest.js

# Если нет — скопировать:
cp docs/onboarding_ab_test/frontend/stores_abtest.js src/stores/abtest.js
```

### Проблема: "WheelOfLife component not found"

**Решение:**
```bash
# Проверить, что компонент существует:
ls -la src/components/WheelOfLife.vue

# Если нет — создать заглушку или закомментировать импорт в OnboardingDeep.vue
```

### Проблема: Backend 404 на /api/rest/front/ab-event/

**Решение:**
1. Проверить, что URL добавлен в `urls.py`
2. Проверить, что сервер перезапущен
3. Проверить логи Django

### Проблема: localStorage не сохраняется

**Решение:**
- Проверить, что браузер не в режиме инкогнито
- Проверить настройки приватности браузера
- Проверить, что сайт на HTTPS (для production)

---

## Контакты и документация

- **Полная спецификация:** `ONBOARDING_AB_TEST.md`
- **Backend детали:** `BACKEND_TASK_AB_TEST.md`
- **Эта инструкция:** `INSTALLATION.md`

**Готово к деплою!** 🚀
