# UTM метки и HTTP Referer при регистрации

## Обзор

При регистрации пользователя система сохраняет маркетинговые метки (UTM) и источник перехода (HTTP Referer) для аналитики.

**Дата обновления:** 2025-12-25

## Приоритет источников данных

Система обрабатывает UTM метки с приоритетом:

1. **Тело POST запроса** (высший приоритет) — явно переданные UTM параметры
2. **GET параметры URL** — автоматическое извлечение из `?utm_source=...`
3. **Сессия браузера** — сохраненные ранее UTM при первом визите

## API эндпоинт

### URL
```
POST /api/rest/front/registration/
```

### Новые опциональные поля

Все поля опциональны и могут быть переданы в теле запроса:

```typescript
interface RegistrationRequest {
  // Обязательные поля (как раньше)
  first_name: string;
  email: string;
  password1: string;
  password2: string;
  is_terms_accepted: boolean;  // должно быть true
  is_privacy_accepted: boolean;  // должно быть true
  referral_code?: string;

  // === НОВЫЕ UTM ПОЛЯ ===
  utm_source?: string;      // max 500 символов, пример: "google"
  utm_medium?: string;      // max 500 символов, пример: "cpc"
  utm_campaign?: string;    // max 500 символов, пример: "summer_sale"
  utm_term?: string;        // max 500 символов, пример: "personal_growth"
  utm_content?: string;     // max 500 символов, пример: "textlink"
  ga_client_id?: string;    // max 50 символов, GA Client ID

  // === HTTP REFERER ===
  http_referer?: string;    // max 2500 символов, document.referrer
}
```

## Реализация на фронтенде

### 1. Сбор HTTP Referer при загрузке приложения

Сохраните `document.referrer` при первом визите пользователя:

```javascript
// В главном файле приложения (main.js / App.vue)
if (!localStorage.getItem('initial_referer') && document.referrer) {
  localStorage.setItem('initial_referer', document.referrer);
}
```

### 2. Сбор UTM меток при загрузке

Парсинг UTM из URL и сохранение в localStorage:

```javascript
// utils/utm.js
export function parseAndSaveUTM() {
  const params = new URLSearchParams(window.location.search);
  const utmData = {};

  const utmKeys = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'ga_client_id'
  ];

  utmKeys.forEach(key => {
    const value = params.get(key);
    if (value) {
      utmData[key] = value;
    }
  });

  // Сохранить только если есть хотя бы одна UTM метка
  if (Object.keys(utmData).length > 0) {
    localStorage.setItem('utm_data', JSON.stringify(utmData));
  }
}

// Вызвать при загрузке приложения
parseAndSaveUTM();
```

### 3. Отправка при регистрации

Включите UTM и referer в запрос регистрации:

```javascript
// services/auth.js
export async function register(userData) {
  // Загрузить сохраненные UTM и referer
  const utmData = JSON.parse(localStorage.getItem('utm_data') || '{}');
  const httpReferer = localStorage.getItem('initial_referer');

  const requestBody = {
    // Основные данные регистрации
    first_name: userData.firstName,
    email: userData.email,
    password1: userData.password,
    password2: userData.passwordConfirm,
    is_terms_accepted: true,
    is_privacy_accepted: true,
    referral_code: userData.referralCode || null,

    // UTM метки (если есть)
    ...utmData,

    // HTTP Referer (если есть)
    http_referer: httpReferer || null,
  };

  const response = await fetch('/api/rest/front/registration/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken(),
    },
    body: JSON.stringify(requestBody),
  });

  // После успешной регистрации очистить localStorage
  if (response.ok) {
    localStorage.removeItem('utm_data');
    localStorage.removeItem('initial_referer');
  }

  return response.json();
}
```

### 4. Полный пример для Vue 3

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const formData = ref({
  firstName: '',
  email: '',
  password: '',
  passwordConfirm: '',
  referralCode: '',
});

// Сбор UTM при монтировании компонента
onMounted(() => {
  // Сохранить referer
  if (!localStorage.getItem('initial_referer') && document.referrer) {
    localStorage.setItem('initial_referer', document.referrer);
  }

  // Парсинг UTM из URL
  const params = new URLSearchParams(window.location.search);
  const utmData = {};

  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ga_client_id'].forEach(key => {
    const value = params.get(key);
    if (value) utmData[key] = value;
  });

  if (Object.keys(utmData).length > 0) {
    localStorage.setItem('utm_data', JSON.stringify(utmData));
  }

  // Сохранить referral_code из URL
  const refCode = params.get('ref') || params.get('referral_code');
  if (refCode) {
    formData.value.referralCode = refCode;
  }
});

async function handleRegister() {
  const utmData = JSON.parse(localStorage.getItem('utm_data') || '{}');
  const httpReferer = localStorage.getItem('initial_referer');

  const payload = {
    first_name: formData.value.firstName,
    email: formData.value.email,
    password1: formData.value.password,
    password2: formData.value.passwordConfirm,
    is_terms_accepted: true,
    is_privacy_accepted: true,
    referral_code: formData.value.referralCode || null,
    ...utmData,
    http_referer: httpReferer || null,
  };

  try {
    const response = await fetch('/api/rest/front/registration/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.status === 'ok') {
      // Очистить сохраненные данные
      localStorage.removeItem('utm_data');
      localStorage.removeItem('initial_referer');

      router.push('/dashboard');
    } else {
      console.error('Registration failed:', result);
    }
  } catch (error) {
    console.error('Registration error:', error);
  }
}
</script>
```

## Хранение данных

### Backend

**UTM метки:**
- Модель: `UserUTM` (`core/models/globals.py`)
- Таблица: `core_userutm`
- Связь: `user_id` (ForeignKey на User)
- Поле `before_registration=True` для меток при регистрации

**HTTP Referer:**
- Модель: `User` (`core/models/globals.py`)
- Таблица: `core_user`
- Поле: `http_referer` (CharField, max_length=2500)

### Примеры сохраненных данных

**UserUTM запись:**
```python
{
  "user_id": 123,
  "before_registration": True,
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "summer_sale",
  "utm_term": "personal_growth",
  "utm_content": "textlink",
  "ga_client_id": "123456789.1234567890",
  "date_created": "2025-12-25 14:30:00"
}
```

**User.http_referer:**
```python
user.http_referer = "https://www.google.com/search?q=personal+development+app"
```

## Особенности работы

### Приоритет данных

При регистрации система использует следующий приоритет:

1. **POST body** (явно переданные UTM) — если фронтенд отправил UTM в теле запроса
2. **GET параметры** — если UTM в URL (`?utm_source=google`)
3. **Session** — сохраненные ранее UTM из первого визита

**Пример:**
```
URL: /register?utm_source=google&utm_medium=organic

POST body: {
  utm_source: "facebook",  // <-- этот будет использован (приоритет 1)
  utm_medium: "cpc"        // <-- этот будет использован (приоритет 1)
}

Результат: utm_source=facebook, utm_medium=cpc
```

### Автоматическое извлечение из URL

Backend автоматически извлекает UTM из GET параметров, но **явная передача в POST body имеет приоритет**.

### Сохранение только при регистрации

- `before_registration=True` — UTM сохраняются ТОЛЬКО при первой регистрации
- Повторные визиты не создают новые UTM записи (избегаем дублирования)

## Валидация

### Длина полей

- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`: **max 500 символов**
- `ga_client_id`: **max 50 символов**
- `http_referer`: **max 2500 символов**

Превышение лимита:
- UTM поля: валидация DRF вернет ошибку
- `http_referer`: обрезается до 2500 символов автоматически

### Опциональность

Все UTM поля и `http_referer` **опциональны**. Регистрация работает без них.

## Тестирование

### Пример 1: Регистрация с UTM в URL

```bash
# URL с UTM параметрами
https://percent1.ru/register?utm_source=google&utm_medium=cpc&utm_campaign=test

# POST запрос (без UTM в body)
curl -X POST https://percent1.ru/api/rest/front/registration/ \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Тест",
    "email": "test@example.com",
    "password1": "TestPass123!",
    "password2": "TestPass123!",
    "is_terms_accepted": true,
    "is_privacy_accepted": true
  }'

# Результат: UTM извлечены из GET параметров URL
```

### Пример 2: Регистрация с UTM в body (приоритет)

```bash
# URL с UTM (будут проигнорированы)
https://percent1.ru/register?utm_source=google

# POST запрос с UTM в body (приоритет)
curl -X POST https://percent1.ru/api/rest/front/registration/ \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Тест",
    "email": "test@example.com",
    "password1": "TestPass123!",
    "password2": "TestPass123!",
    "is_terms_accepted": true,
    "is_privacy_accepted": true,
    "utm_source": "facebook",
    "utm_medium": "social",
    "http_referer": "https://facebook.com/post/123"
  }'

# Результат:
# - UTM из body: utm_source=facebook, utm_medium=social
# - http_referer сохранен в User.http_referer
```

### Пример 3: Регистрация с document.referrer

```javascript
// JavaScript на странице регистрации
const httpReferer = document.referrer || null;

fetch('/api/rest/front/registration/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': csrfToken,
  },
  body: JSON.stringify({
    first_name: 'Иван',
    email: 'ivan@example.com',
    password1: 'SecurePass123!',
    password2: 'SecurePass123!',
    is_terms_accepted: true,
    is_privacy_accepted: true,
    http_referer: httpReferer,  // "https://google.com/search?q=..."
  }),
});
```

## Миграция для существующих пользователей

Поле `User.http_referer` добавлено с `null=True, blank=True`, поэтому:
- Существующие пользователи: `http_referer = NULL`
- Новые пользователи: `http_referer` заполняется при регистрации (если передан)

## FAQ

**Q: Что если фронтенд не отправляет UTM в body?**
A: Backend автоматически извлечет UTM из GET параметров URL (как раньше).

**Q: Можно ли не отправлять http_referer?**
A: Да, поле опциональное. Если не отправлено — останется NULL.

**Q: Что если UTM и в URL, и в body?**
A: Приоритет у body. Данные из body перезапишут данные из URL.

**Q: Зачем сохранять в localStorage?**
A: Для SPA приложений, где пользователь может перейти с лендинга на форму регистрации. UTM из первого визита сохраняются и используются при регистрации.

**Q: Когда очищать localStorage?**
A: После успешной регистрации. Пример в коде выше.

## История изменений

- **2025-12-25**: Добавлена поддержка UTM в теле POST запроса и поле `http_referer`
