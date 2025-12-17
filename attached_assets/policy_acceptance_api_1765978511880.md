# API документация: Согласие с политиками

## Обзор

Функционал обязательного согласия пользователя с условиями использования и политикой конфиденциальности.

Без принятия обоих согласий пользователь не может:
- Использовать `/app/` эндпоинты (ошибка 403)
- Подключаться к WebSocket (код закрытия 4004)

---

## Новые поля пользователя

| Поле | Тип | Описание |
|------|-----|----------|
| `is_terms_accepted` | boolean | Согласие с условиями использования |
| `is_privacy_accepted` | boolean | Согласие с политикой конфиденциальности |
| `date_policy_accepted` | datetime | Дата принятия политик (формат: `YYYY-MM-DD HH:MM:SS`) |

---

## Эндпоинты

### 1. Получение данных пользователя (обновлен)

**URL:** `POST /api/rest/front/get-user-data/`

Теперь возвращает дополнительные поля:

```json
{
  "status": "ok",
  "data": {
    "id": 123,
    "email": "user@example.com",
    "first_name": "Иван",
    "is_telegram_registration": false,
    "is_terms_accepted": true,
    "is_privacy_accepted": true,
    "date_policy_accepted": "2024-01-15 10:30:00",
    // ... остальные поля
  }
}
```

---

### 2. Обновление согласий с политиками (новый)

**URL:** `POST /api/rest/front/update-user-data/`

**Авторизация:** Обязательна

**Запрос:**
```json
{
  "is_terms_accepted": true,
  "is_privacy_accepted": true
}
```

**Параметры:**
| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| is_terms_accepted | boolean | да | Должно быть `true` |
| is_privacy_accepted | boolean | да | Должно быть `true` |

**Важно:** Оба флага должны быть `true`. Нельзя принять только одну политику.

**Успешный ответ:**
```json
{
  "status": "ok",
  "data": {
    "is_terms_accepted": true,
    "is_privacy_accepted": true,
    "date_policy_accepted": "2024-01-15 10:30:00"
  }
}
```

**Ошибка (не все флаги true):**
```json
{
  "status": "error",
  "error_data": {
    "error": "policy_both_flags_required",
    "message": "Необходимо принять оба согласия одновременно",
    "error_code": "POL002"
  }
}
```

---

### 3. Регистрация (обновлена)

**URL:** `POST /api/rest/front/registration/`

Теперь требует два дополнительных обязательных поля:

```json
{
  "first_name": "Иван",
  "email": "user@example.com",
  "password1": "securepassword123",
  "password2": "securepassword123",
  "is_terms_accepted": true,
  "is_privacy_accepted": true
}
```

**Важно:** Оба флага обязательны и должны быть `true`.

---

## Блокировка доступа

### REST API

Все эндпоинты `/app/*` возвращают 403 с ошибкой:

```json
{
  "status": "error",
  "error_data": {
    "error": "policy_acceptance_required",
    "message": "Необходимо подтвердить согласия для дальнейшей работы",
    "error_code": "POL001"
  }
}
```

### WebSocket

WebSocket соединения закрываются с кодом **4004** если политики не приняты.

---

## Эндпоинты НЕ требующие принятия политик

Эти эндпоинты работают до принятия согласий:

- `/api/rest/front/csrf/`
- `/api/rest/front/registration/`
- `/api/rest/front/login/`
- `/api/rest/front/logout/`
- `/api/rest/front/get-user-data/`
- `/api/rest/front/update-user-data/`
- `/api/rest/front/get-global-data/`
- `/api/rest/front/telegram/webapp-auth/`

---

## Коды ошибок

| Код | HTTP | Описание |
|-----|------|----------|
| policy_acceptance_required | 403 | Политики не приняты, доступ заблокирован |
| policy_both_flags_required | 400 | Нужно принять оба согласия одновременно |

---

## WebSocket коды закрытия

| Код | Значение |
|-----|----------|
| 4001 | Не авторизован |
| 4004 | Политики не приняты |

---

## Сценарии использования

### Сценарий 1: Проверка при загрузке приложения

```javascript
const response = await api.post('/api/rest/front/get-user-data/');
const userData = response.data.data;

if (!userData.is_terms_accepted || !userData.is_privacy_accepted) {
  // Показать модальное окно с политиками
  showPolicyModal();
}
```

### Сценарий 2: Принятие политик

```javascript
async function acceptPolicies() {
  const response = await api.post('/api/rest/front/update-user-data/', {
    is_terms_accepted: true,
    is_privacy_accepted: true,
  });

  if (response.data.status === 'ok') {
    // Политики приняты, можно продолжать работу
    closePolicyModal();
    initApp();
  }
}
```

### Сценарий 3: Обработка ошибки 403

```javascript
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.data?.error_data?.error === 'policy_acceptance_required') {
      // Перенаправить на страницу принятия политик
      showPolicyModal();
    }
    return Promise.reject(error);
  }
);
```

### Сценарий 4: Обработка WebSocket закрытия

```javascript
socket.onclose = (event) => {
  if (event.code === 4004) {
    // Политики не приняты
    showPolicyModal();
  }
};
```

---

## Интеграция с Pinia Store

```javascript
// stores/user.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    userData: null,
    needsPolicyAcceptance: false,
  }),

  getters: {
    hasPoliciesAccepted() {
      return this.userData?.is_terms_accepted && this.userData?.is_privacy_accepted;
    },
  },

  actions: {
    async fetchUserData() {
      const response = await api.post('/api/rest/front/get-user-data/');
      if (response.data.status === 'ok') {
        this.userData = response.data.data;
        this.needsPolicyAcceptance = !this.hasPoliciesAccepted;
      }
    },

    async acceptPolicies() {
      const response = await api.post('/api/rest/front/update-user-data/', {
        is_terms_accepted: true,
        is_privacy_accepted: true,
      });

      if (response.data.status === 'ok') {
        this.userData.is_terms_accepted = true;
        this.userData.is_privacy_accepted = true;
        this.userData.date_policy_accepted = response.data.data.date_policy_accepted;
        this.needsPolicyAcceptance = false;
      }
    },
  },
});
```
