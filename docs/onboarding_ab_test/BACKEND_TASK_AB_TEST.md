# Backend Task: A/B Test Analytics Endpoint

> **Цель:** Создать endpoint для трекинга событий A/B теста онбординга
> **Приоритет:** 🟡 Средний (можно сделать после фронтенда)
> **Время:** ~2-3 часа

---

## Обзор

Frontend уже реализует A/B тест онбординга с двумя вариантами (Fast и Deep). Нужно создать backend endpoint для сбора аналитики о поведении пользователей в каждом варианте.

**Важно:** Frontend может работать БЕЗ этого endpoint (аналитика опциональна). Это не блокирует запуск A/B теста.

---

## Требования

### 1. Создать модель ABEvent

**Файл:** `server/apps/front/models.py` (или отдельный `ab_testing/models.py`)

```python
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class ABEvent(models.Model):
    """
    Событие A/B теста для аналитики
    """

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
        blank=True,
        help_text="Пользователь (null для анонимных)"
    )

    session_id = models.CharField(
        max_length=100,
        db_index=True,
        help_text="ID сессии (для анонимных пользователей)"
    )

    variant = models.CharField(
        max_length=20,
        choices=[('fast', 'Fast'), ('deep', 'Deep')],
        db_index=True,
        help_text="Вариант онбординга"
    )

    event_type = models.CharField(
        max_length=50,
        choices=EVENT_TYPES,
        db_index=True,
        help_text="Тип события"
    )

    step_number = models.IntegerField(
        null=True,
        blank=True,
        help_text="Номер шага (если применимо)"
    )

    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Дополнительные данные (время на шаге, выборы пользователя, etc)"
    )

    timestamp = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text="Время события"
    )

    class Meta:
        db_table = 'ab_events'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['variant', 'event_type']),
            models.Index(fields=['session_id', 'timestamp']),
            models.Index(fields=['user', 'timestamp']),
        ]

    def __str__(self):
        user_id = self.user_id or self.session_id[:8]
        return f"{user_id} - {self.variant} - {self.event_type}"
```

---

### 2. Создать Serializer

**Файл:** `server/apps/front/serializers.py`

```python
from rest_framework import serializers
from .models import ABEvent

class ABEventSerializer(serializers.ModelSerializer):
    """
    Serializer для создания события A/B теста
    """

    class Meta:
        model = ABEvent
        fields = [
            'session_id',
            'variant',
            'event_type',
            'step_number',
            'metadata',
        ]

    def create(self, validated_data):
        # Добавляем user из request, если авторизован
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user

        return super().create(validated_data)

    def validate_variant(self, value):
        """Валидация варианта"""
        if value not in ['fast', 'deep']:
            raise serializers.ValidationError(
                "Variant должен быть 'fast' или 'deep'"
            )
        return value

    def validate_event_type(self, value):
        """Валидация типа события"""
        valid_types = [
            'variant_assigned',
            'onboarding_started',
            'step_completed',
            'onboarding_completed',
            'onboarding_abandoned',
        ]
        if value not in valid_types:
            raise serializers.ValidationError(
                f"Event type должен быть одним из: {', '.join(valid_types)}"
            )
        return value
```

---

### 3. Создать View

**Файл:** `server/apps/front/views.py`

```python
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .serializers import ABEventSerializer

@api_view(['POST'])
@permission_classes([AllowAny])  # Разрешаем анонимным пользователям
def track_ab_event(request):
    """
    Endpoint для трекинга событий A/B теста

    POST /api/rest/front/ab-event/

    Body:
    {
        "session_id": "uuid-v4-string",
        "variant": "fast" | "deep",
        "event_type": "variant_assigned" | "onboarding_started" | ...,
        "step_number": 1,  // опционально
        "metadata": {      // опционально
            "time_spent_ms": 15000,
            "category_selected": "health"
        }
    }

    Response:
    {
        "success": true
    }
    """

    serializer = ABEventSerializer(
        data=request.data,
        context={'request': request}
    )

    if serializer.is_valid():
        serializer.save()
        return Response(
            {'success': True},
            status=status.HTTP_201_CREATED
        )

    return Response(
        {
            'success': False,
            'errors': serializer.errors
        },
        status=status.HTTP_400_BAD_REQUEST
    )
```

---

### 4. Добавить URL

**Файл:** `server/apps/front/urls.py`

```python
from django.urls import path
from .views import track_ab_event

urlpatterns = [
    # ... существующие пути

    path('ab-event/', track_ab_event, name='ab-event'),
]
```

Endpoint будет доступен по адресу: `POST /api/rest/front/ab-event/`

---

### 5. Создать миграцию

```bash
# В директории server/
python manage.py makemigrations
python manage.py migrate
```

---

## Примеры использования

### Frontend вызов (уже будет в коде)

```javascript
// src/services/api.js
export async function trackABEvent(data) {
  return request('POST', '/api/rest/front/ab-event/', data, {
    skipRateLimit: true
  })
}

// Использование:
await trackABEvent({
  session_id: sessionId,
  variant: 'fast',
  event_type: 'variant_assigned',
  metadata: {}
})

await trackABEvent({
  session_id: sessionId,
  variant: 'fast',
  event_type: 'step_completed',
  step_number: 2,
  metadata: {
    time_spent_ms: 15000,
    category_selected: 'health'
  }
})
```

---

## Запросы к БД для аналитики

После накопления данных можно делать такие запросы:

### 1. Completion Rate по вариантам

```python
from django.db.models import Count, Q

def get_completion_rates():
    """
    Процент завершивших онбординг для каждого варианта
    """
    stats = ABEvent.objects.values('variant').annotate(
        total_started=Count(
            'id',
            filter=Q(event_type='onboarding_started')
        ),
        total_completed=Count(
            'id',
            filter=Q(event_type='onboarding_completed')
        )
    )

    for stat in stats:
        variant = stat['variant']
        started = stat['total_started']
        completed = stat['total_completed']
        rate = (completed / started * 100) if started > 0 else 0

        print(f"{variant}: {completed}/{started} = {rate:.1f}%")

    return stats
```

### 2. Среднее время на каждом шаге

```python
from django.db.models import Avg

def get_average_time_per_step(variant='fast'):
    """
    Среднее время на каждом шаге для варианта
    """
    steps = ABEvent.objects.filter(
        variant=variant,
        event_type='step_completed',
        metadata__time_spent_ms__isnull=False
    ).values('step_number').annotate(
        avg_time_ms=Avg('metadata__time_spent_ms')
    ).order_by('step_number')

    for step in steps:
        step_num = step['step_number']
        avg_ms = step['avg_time_ms']
        avg_sec = avg_ms / 1000

        print(f"Step {step_num}: {avg_sec:.1f} sec")

    return steps
```

### 3. Места отвала (Drop-off Points)

```python
def get_dropout_points(variant='fast'):
    """
    На каких шагах пользователи чаще всего бросают онбординг
    """
    abandoned = ABEvent.objects.filter(
        variant=variant,
        event_type='onboarding_abandoned'
    ).values('step_number').annotate(
        count=Count('id')
    ).order_by('-count')

    total = ABEvent.objects.filter(
        variant=variant,
        event_type='onboarding_abandoned'
    ).count()

    for item in abandoned:
        step = item['step_number']
        count = item['count']
        pct = (count / total * 100) if total > 0 else 0

        print(f"Step {step}: {count} ({pct:.1f}%)")

    return abandoned
```

### 4. Сравнение вариантов (Winner Detection)

```python
def compare_variants():
    """
    Статистическое сравнение двух вариантов
    """
    from django.db.models import Count, Q, F

    stats = ABEvent.objects.values('variant').annotate(
        started=Count('id', filter=Q(event_type='onboarding_started')),
        completed=Count('id', filter=Q(event_type='onboarding_completed')),
        abandoned=Count('id', filter=Q(event_type='onboarding_abandoned'))
    )

    results = {}
    for stat in stats:
        variant = stat['variant']
        started = stat['started']
        completed = stat['completed']
        abandoned = stat['abandoned']

        completion_rate = (completed / started * 100) if started > 0 else 0
        abandon_rate = (abandoned / started * 100) if started > 0 else 0

        results[variant] = {
            'started': started,
            'completed': completed,
            'abandoned': abandoned,
            'completion_rate': completion_rate,
            'abandon_rate': abandon_rate
        }

    # Сравнение
    if 'fast' in results and 'deep' in results:
        fast = results['fast']
        deep = results['deep']

        print(f"Fast: {fast['completion_rate']:.1f}% completion")
        print(f"Deep: {deep['completion_rate']:.1f}% completion")

        diff = deep['completion_rate'] - fast['completion_rate']
        if diff > 0:
            print(f"✅ Deep лучше на {diff:.1f}%")
        elif diff < 0:
            print(f"✅ Fast лучше на {abs(diff):.1f}%")
        else:
            print("🤷 Варианты равны")

    return results
```

---

## Admin панель (опционально)

**Файл:** `server/apps/front/admin.py`

```python
from django.contrib import admin
from .models import ABEvent

@admin.register(ABEvent)
class ABEventAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'user',
        'session_id_short',
        'variant',
        'event_type',
        'step_number',
        'timestamp'
    ]

    list_filter = [
        'variant',
        'event_type',
        'timestamp',
    ]

    search_fields = [
        'session_id',
        'user__email',
        'user__username',
    ]

    readonly_fields = [
        'user',
        'session_id',
        'variant',
        'event_type',
        'step_number',
        'metadata',
        'timestamp',
    ]

    date_hierarchy = 'timestamp'

    def session_id_short(self, obj):
        """Укороченный ID сессии для отображения"""
        return obj.session_id[:8] + '...'

    session_id_short.short_description = 'Session'

    def has_add_permission(self, request):
        """Запрещаем создание через admin (только через API)"""
        return False

    def has_change_permission(self, request, obj=None):
        """Запрещаем изменение через admin (read-only)"""
        return False
```

---

## Тестирование

### 1. Unit Test

**Файл:** `server/apps/front/tests/test_ab_events.py`

```python
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from ..models import ABEvent

User = get_user_model()

class ABEventTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_create_anonymous_event(self):
        """Анонимный пользователь может отправить событие"""
        data = {
            'session_id': 'test-session-123',
            'variant': 'fast',
            'event_type': 'variant_assigned',
        }

        response = self.client.post('/api/rest/front/ab-event/', data)

        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data['success'])

        event = ABEvent.objects.first()
        self.assertIsNotNone(event)
        self.assertEqual(event.session_id, 'test-session-123')
        self.assertEqual(event.variant, 'fast')
        self.assertIsNone(event.user)

    def test_create_authenticated_event(self):
        """Авторизованный пользователь — event связан с user"""
        self.client.force_authenticate(user=self.user)

        data = {
            'session_id': 'test-session-456',
            'variant': 'deep',
            'event_type': 'onboarding_started',
        }

        response = self.client.post('/api/rest/front/ab-event/', data)

        self.assertEqual(response.status_code, 201)

        event = ABEvent.objects.first()
        self.assertEqual(event.user, self.user)

    def test_invalid_variant(self):
        """Невалидный вариант отклоняется"""
        data = {
            'session_id': 'test-session-789',
            'variant': 'invalid',
            'event_type': 'variant_assigned',
        }

        response = self.client.post('/api/rest/front/ab-event/', data)

        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data['success'])

    def test_step_completed_with_metadata(self):
        """Событие с метаданными сохраняется правильно"""
        data = {
            'session_id': 'test-session-abc',
            'variant': 'fast',
            'event_type': 'step_completed',
            'step_number': 2,
            'metadata': {
                'time_spent_ms': 15000,
                'category_selected': 'health'
            }
        }

        response = self.client.post('/api/rest/front/ab-event/', data)

        self.assertEqual(response.status_code, 201)

        event = ABEvent.objects.first()
        self.assertEqual(event.step_number, 2)
        self.assertEqual(event.metadata['time_spent_ms'], 15000)
        self.assertEqual(event.metadata['category_selected'], 'health')
```

### 2. Manual Test (curl)

```bash
# Тест создания события
curl -X POST http://localhost:8000/api/rest/front/ab-event/ \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-123",
    "variant": "fast",
    "event_type": "variant_assigned"
  }'

# Ожидаемый response:
# {"success": true}

# Проверка в Django shell
python manage.py shell
>>> from server.apps.front.models import ABEvent
>>> ABEvent.objects.all()
>>> ABEvent.objects.filter(variant='fast').count()
```

---

## Performance Considerations

### 1. Rate Limiting
Frontend уже использует `skipRateLimit: true` для этого endpoint, так что не будет задержек.

### 2. Database Indexes
Модель уже содержит оптимальные индексы для частых запросов:
- `variant` + `event_type` (для аналитики по вариантам)
- `session_id` + `timestamp` (для трекинга сессий)
- `user` + `timestamp` (для трекинга пользователей)

### 3. Async Processing (опционально, для будущего)
Если событий станет очень много (>10k/день), можно переключиться на асинхронную обработку:
- Celery task для сохранения в БД
- Redis queue для буферизации
- Batch insert вместо одиночных INSERT

Но для MVP это избыточно.

---

## Чек-лист выполнения

- [ ] Создана модель `ABEvent` в `models.py`
- [ ] Создан serializer `ABEventSerializer` в `serializers.py`
- [ ] Создан view `track_ab_event` в `views.py`
- [ ] Добавлен URL path в `urls.py`
- [ ] Выполнены миграции (`makemigrations` + `migrate`)
- [ ] Написаны тесты в `tests/test_ab_events.py`
- [ ] Тесты проходят (`python manage.py test`)
- [ ] Добавлен admin интерфейс (опционально)
- [ ] Проверено вручную через curl/Postman
- [ ] Endpoint работает для анонимных пользователей
- [ ] Endpoint работает для авторизованных пользователей

---

## Dependencies

Никаких новых зависимостей не требуется. Используется стандартный Django REST Framework.

---

## Deployment Notes

1. **Migration:** После деплоя выполнить `python manage.py migrate`
2. **Rollback plan:** Если что-то пойдёт не так, можно откатить миграцию:
   ```bash
   python manage.py migrate front <previous_migration_number>
   ```
3. **Monitoring:** После запуска следить за:
   - Количеством событий в БД (должно расти)
   - Ошибками в логах (не должно быть 400/500)
   - Latency endpoint (должен отвечать <100ms)

---

## Связь с фронтендом

Frontend уже будет содержать:
- `src/stores/abtest.js` — Pinia store для A/B теста
- `src/services/api.js` — метод `trackABEvent()`
- Вызовы в компонентах `OnboardingFast.vue` и `OnboardingDeep.vue`

Backend просто принимает события и сохраняет в БД. Никакой сложной логики на стороне сервера не требуется.

---

## Timeline

- **Модель + Serializer + View:** 1-1.5 часа
- **Миграция + Тестирование:** 30 минут
- **Admin панель (опционально):** 20 минут
- **Аналитические запросы (для будущего):** 30 минут

**Итого:** 2-3 часа работы.

---

## Вопросы?

Если что-то непонятно, можно:
1. Посмотреть существующие модели в `server/apps/front/models.py`
2. Посмотреть существующие views в `server/apps/front/views.py`
3. Паттерн аналогичен другим endpoint в проекте

**Важно:** Этот endpoint НЕ блокирует запуск A/B теста. Фронтенд может работать без него, просто не будет аналитики.
