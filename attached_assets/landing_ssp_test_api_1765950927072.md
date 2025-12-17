# API документация: Тесты ССП с лендингов

## Обзор

API для работы с тестами ССП, которые проходят пользователи на лендингах.
Позволяет сохранять результаты без авторизации и привязывать их к аккаунту позже.

## Основные концепции

### hash

Уникальный 20-символьный идентификатор теста.

**Использование:**
- Сохраняется в localStorage после прохождения теста
- Используется для получения результатов
- Используется для привязки к аккаунту после регистрации

### Категории (совпадают с ССП)

| ID | Название | Frontend ID |
|----|----------|-------------|
| welfare | Благосостояние | wealth |
| hobby | Хобби и отдых | hobbies |
| environment | Дружба и окружение | friendship |
| health_sport | Здоровье и спорт | health |
| work | Работа и карьера | career |
| family | Любовь, семья | love |

---

## Эндпоинты

### 1. Сохранение теста (публичный)

**URL:** `POST /api/rest/front/app/landing-ssp-test/save/`

**Авторизация:** Не требуется (работает и для авторизованных)

**Request:**
```json
{
  "page": "ssp_test",
  "categories_data": [
    {
      "category": "health_sport",
      "score": 7,
      "answer": "Регулярно занимаюсь спортом, но питание могло бы быть лучше"
    },
    {
      "category": "welfare",
      "score": 5,
      "answer": "Есть стабильный доход, но хочу больше"
    },
    {
      "category": "hobby",
      "score": 8,
      "answer": null
    },
    {
      "category": "environment",
      "score": 6,
      "answer": ""
    },
    {
      "category": "work",
      "score": 7,
      "answer": "Работаю на любимой работе"
    },
    {
      "category": "family",
      "score": 9,
      "answer": "Отличные отношения с семьей"
    }
  ],
  "meta": {
    "utm_source": "google",
    "utm_campaign": "ssp_landing"
  }
}
```

**Параметры:**
| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| page | string | нет | ID страницы лендинга (main, ssp_test, blog_article, promo). По умолчанию "main" |
| categories_data | array | да | Массив данных по категориям (макс. 6 элементов) |
| categories_data[].category | string | да | ID категории (welfare, hobby, environment, health_sport, work, family) |
| categories_data[].score | int | нет | Оценка 1-10 |
| categories_data[].answer | string | нет | Описание до 10000 символов |
| meta | object | нет | Дополнительные метаданные (UTM и т.д.) |

**Response (успех):**
```json
{
  "status": "ok",
  "data": {
    "hash": "a1b2c3d4e5f6g7h8i9j0",
    "result_url": "/ssp-test/result/a1b2c3d4e5f6g7h8i9j0/",
    "is_linked_to_user": false,
    "categories_data": [
      {
        "category": "welfare",
        "category_title": "Благосостояние",
        "score": 5,
        "answer": "Есть стабильный доход, но хочу больше"
      },
      {
        "category": "hobby",
        "category_title": "Хобби и отдых",
        "score": 8,
        "answer": null
      }
    ],
    "total_data": {
      "average_score": 7,
      "max_score": 10,
      "categories_with_score": 6,
      "categories_with_answer": 4
    }
  }
}
```

**Ошибки:**
- `landing_ssp_duplicate_categories` (400) - Дублирующиеся категории в запросе
- `landing_ssp_rate_limit_ip` (429) - Слишком частые запросы (для анонимных: 1 раз в минуту)

---

### 2. Получение теста по хэшу (публичный)

**URL:** `POST /api/rest/front/app/landing-ssp-test/get/`

**Авторизация:** Не требуется

**Request:**
```json
{
  "hash": "a1b2c3d4e5f6g7h8i9j0"
}
```

**Параметры:**
| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| hash | string | да | Уникальный хэш теста (ровно 20 символов) |

**Response (успех):**
```json
{
  "status": "ok",
  "data": {
    "hash": "a1b2c3d4e5f6g7h8i9j0",
    "page": "ssp_test",
    "is_linked_to_user": false,
    "date_created": "2024-12-15 14:30:00",
    "categories_data": [
      {
        "category": "welfare",
        "category_title": "Благосостояние",
        "score": 5,
        "answer": "Есть стабильный доход, но хочу больше"
      }
    ],
    "total_data": {
      "average_score": 7,
      "max_score": 10,
      "categories_with_score": 6,
      "categories_with_answer": 4
    }
  }
}
```

**Ошибки:**
- `landing_ssp_test_not_found` (404) - Тест не найден

---

### 3. Привязка теста к пользователю (требует авторизации)

**URL:** `POST /api/rest/front/app/landing-ssp-test/link/`

**Авторизация:** Обязательна

**Request:**
```json
{
  "hash": "a1b2c3d4e5f6g7h8i9j0"
}
```

**Параметры:**
| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| hash | string | да | Уникальный хэш теста (ровно 20 символов) |

**Response (успех):**
```json
{
  "status": "ok",
  "data": {
    "hash": "a1b2c3d4e5f6g7h8i9j0",
    "is_linked": true,
    "was_already_linked": false
  }
}
```

**Ошибки:**
- `landing_ssp_test_not_found` (404) - Тест не найден
- `landing_ssp_already_linked_other` (400) - Тест привязан к другому пользователю

---

## Сценарии использования

### Сценарий 1: Прохождение теста без регистрации

```javascript
// 1. Пользователь проходит тест на лендинге
const response = await api.post('/api/rest/front/app/landing-ssp-test/save/', {
  page: 'ssp_test',
  categories_data: [
    { category: 'health_sport', score: 7, answer: '...' },
    { category: 'welfare', score: 5 },
    { category: 'hobby', score: 8 },
    { category: 'environment', score: 6 },
    { category: 'work', score: 7 },
    { category: 'family', score: 9 }
  ],
  meta: {
    utm_source: 'google'
  }
});

// 2. Сохраняем hash для дальнейшего использования
const testHash = response.data.data.hash;
localStorage.setItem('landing_ssp_hash', testHash);

// 3. Перенаправляем на страницу результатов
router.push(`/ssp-test/result/${testHash}`);
```

### Сценарий 2: Просмотр результатов

```javascript
// Загружаем результаты по hash из URL
const hash = route.params.hash;

const response = await api.post('/api/rest/front/app/landing-ssp-test/get/', { hash });

if (response.data.status === 'ok') {
  displayResults(response.data.data);
} else {
  showError('Тест не найден');
}
```

### Сценарий 3: Привязка после регистрации

```javascript
// После успешной регистрации/авторизации
async function linkPendingTest() {
  const hash = localStorage.getItem('landing_ssp_hash');
  if (!hash) return;

  try {
    const response = await api.post('/api/rest/front/app/landing-ssp-test/link/', { hash });

    if (response.data.status === 'ok') {
      // Тест успешно привязан
      localStorage.removeItem('landing_ssp_hash');

      if (!response.data.data.was_already_linked) {
        showNotification('Результаты теста ССП привязаны к вашему аккаунту!');
      }
    }
  } catch (error) {
    if (error.response?.data?.error_data?.error === 'landing_ssp_already_linked_other') {
      // Тест принадлежит другому пользователю
      localStorage.removeItem('landing_ssp_hash');
    }
  }
}
```

### Сценарий 4: Авторизованный пользователь проходит тест

```javascript
// Если пользователь авторизован при прохождении - тест автоматически привязывается
const response = await api.post('/api/rest/front/app/landing-ssp-test/save/', {
  categories_data: [...]
});

// response.data.data.is_linked_to_user будет true
console.log(response.data.data.is_linked_to_user); // true
```

---

## Интеграция с Pinia Store

```javascript
// stores/landingSSP.js
import { defineStore } from 'pinia';
import api from '@/services/api';

export const useLandingSSPStore = defineStore('landingSSP', {
  state: () => ({
    currentTest: null,
    pendingHash: localStorage.getItem('landing_ssp_hash'),
  }),

  actions: {
    // Сохранить результаты теста
    async saveTest(categoriesData, page = 'main', meta = null) {
      const response = await api.post('/api/rest/front/app/landing-ssp-test/save/', {
        page,
        categories_data: categoriesData,
        meta,
      });

      if (response.data.status === 'ok') {
        this.currentTest = response.data.data;

        // Если не привязан - сохраняем hash
        if (!response.data.data.is_linked_to_user) {
          this.pendingHash = response.data.data.hash;
          localStorage.setItem('landing_ssp_hash', response.data.data.hash);
        }
      }

      return response.data;
    },

    // Получить тест по hash
    async getTest(hash) {
      const response = await api.post('/api/rest/front/app/landing-ssp-test/get/', { hash });

      if (response.data.status === 'ok') {
        this.currentTest = response.data.data;
      }

      return response.data;
    },

    // Привязать тест к пользователю
    async linkToUser() {
      if (!this.pendingHash) return null;

      try {
        const response = await api.post('/api/rest/front/app/landing-ssp-test/link/', {
          hash: this.pendingHash,
        });

        if (response.data.status === 'ok') {
          // Очищаем pending hash
          this.pendingHash = null;
          localStorage.removeItem('landing_ssp_hash');
        }

        return response.data;
      } catch (error) {
        // Если ошибка - очищаем hash
        this.pendingHash = null;
        localStorage.removeItem('landing_ssp_hash');
        throw error;
      }
    },

    // Проверить есть ли ожидающий привязки тест
    hasPendingTest() {
      return !!this.pendingHash;
    },

    // Очистить pending hash
    clearPendingHash() {
      this.pendingHash = null;
      localStorage.removeItem('landing_ssp_hash');
    },
  },
});
```

---

## Важные моменты

1. **Rate limiting:**
   - save: 1 запрос в секунду (базовый)
   - save для анонимных: 1 запрос в минуту с одного IP
   - get: 0.3 секунды
   - link: 0.5 секунды

2. **Валидация:**
   - score: 1-10 (целое число)
   - answer: до 10000 символов
   - hash: ровно 20 символов
   - Категории не должны дублироваться

3. **Безопасность:**
   - hash генерируется на сервере (uuid4.hex[:20])
   - IP-адрес записывается для аналитики и защиты от злоупотреблений
   - Тест можно привязать только к одному пользователю

4. **Маппинг категорий:**
   При отображении используйте маппинг для соответствия с существующим ССП:
   ```javascript
   const categoryMap = {
     'welfare': 'wealth',
     'hobby': 'hobbies',
     'environment': 'friendship',
     'health_sport': 'health',
     'work': 'career',
     'family': 'love'
   };
   ```

---

## Коды ошибок

| Код | HTTP | Описание |
|-----|------|----------|
| landing_ssp_test_not_found | 404 | Тест не найден |
| landing_ssp_already_linked_other | 400 | Тест привязан к другому пользователю |
| landing_ssp_duplicate_categories | 400 | Дублирующиеся категории в запросе |
| landing_ssp_rate_limit_ip | 429 | Слишком частые запросы (для анонимных: 1 раз в минуту) |
