# Chat v3 Integration Guide

Полная документация для фронтенд разработчиков по интеграции WebSocket чат-системы OnePercent.

**Дата:** 15 декабря 2025
**Версия:** 3.2.0
**Для:** Фронтенд разработчиков (Replit / Vue.js)

---

## Содержание

1. [Обзор системы](#1-обзор-системы)
   - Быстрый старт: get-user-data
2. [Подключение WebSocket](#2-подключение-websocket)
3. [Heartbeat (Ping/Pong)](#3-heartbeat-pingpong)
4. [События от клиента к серверу](#4-события-от-клиента-к-серверу)
5. [События от сервера к клиенту](#5-события-от-сервера-к-клиенту)
6. [REST API](#6-rest-api)
   - 6.1 GET Conversations
   - 6.2 CREATE Conversation
   - 6.3 DELETE Conversation
   - 6.4 GET Messages
   - 6.5 Загрузка истории (Infinite Scroll)
   - 6.6 SEND Message
   - 6.7 MARK Messages Read
   - 6.8 UPDATE Reaction
7. [Блокировка отправки сообщений](#7-блокировка-отправки-сообщений)
8. [Meta данные (source_page, client_context)](#8-meta-данные-source_page-client_context)
9. [Markdown в сообщениях](#9-markdown-в-сообщениях)
10. [Типы данных (TypeScript)](#10-типы-данных-typescript)
11. [Vue.js Composable](#11-vuejs-composable)
12. [Пример компонента ChatWindow](#12-пример-компонента-chatwindow)
13. [Обработка ошибок](#13-обработка-ошибок)
14. [Чек-лист интеграции](#14-чек-лист-интеграции)

---

## 1. Обзор системы

### Возможности

- **WebSocket** — реал-тайм двунаправленный обмен сообщениями
- **REST API** — fallback для HTTP-only клиентов
- **AI бот** — автоматические ответы от персонального AI ассистента
- **Блокировка** — пока бот думает, отправка новых сообщений заблокирована
- **Heartbeat** — сервер проверяет активность соединения (ping/pong)
- **Одно соединение** — при открытии нового соединения старое закрывается

### Endpoints

```
WebSocket:
wss://your-domain.com/ws/chat/

REST API (POST only):
/api/rest/front/app/chat/conversations/get/
/api/rest/front/app/chat/conversations/create/
/api/rest/front/app/chat/conversations/delete/
/api/rest/front/app/chat/messages/get/
/api/rest/front/app/chat/messages/send/
/api/rest/front/app/chat/messages/mark-read/
/api/rest/front/app/chat/reactions/update/

WebSocket Documentation (fake, always 404):
/api/rest/front/ws/chat/docs/
```

### Быстрый старт: get-user-data

Эндпоинт `/api/rest/front/get-user-data/` возвращает объект `ai_bot_chat` с данными чата:

```json
{
  "status": "ok",
  "data": {
    "id": 10,
    "email": "user@example.com",
    "first_name": "Иван",
    // ... другие поля пользователя

    "ai_bot_chat": {
      "conversation_id": 123,
      "unread_count": 2,
      "is_bot_processing": false
    }
  }
}
```

**Поля `ai_bot_chat`:**

| Поле | Тип | Описание |
|------|-----|----------|
| `conversation_id` | integer | ID беседы с AI ботом (создаётся автоматически) |
| `unread_count` | integer | Количество непрочитанных сообщений от бота |
| `is_bot_processing` | boolean | Флаг блокировки (бот генерирует ответ) |

**Кейсы использования:**

1. **Badge непрочитанных** — показать количество на иконке чата в меню/хедере
2. **Блокировка до открытия чата** — знать что бот ещё думает, не открывая чат
3. **Готовый conversation_id** — не нужно создавать беседу, сразу открыть чат
4. **Автосоздание беседы** — беседа создаётся автоматически при первом вызове get-user-data

**Пример использования:**

```javascript
// При загрузке приложения
const { data } = await api.post('/get-user-data/')

// Показать badge
const unreadCount = data.ai_bot_chat.unread_count
if (unreadCount > 0) {
  showChatBadge(unreadCount)
}

// Открыть чат с готовым ID
function openChat() {
  const conversationId = data.ai_bot_chat.conversation_id
  router.push(`/chat/${conversationId}`)
}

// Проверить блокировку
const canSend = !data.ai_bot_chat.is_bot_processing
```

---

## 2. Подключение WebSocket

### URL

```
wss://your-domain.com/ws/chat/
```

### Требования

- Пользователь должен быть аутентифицирован (session cookie)
- Cookie `sessionid` должна передаваться с запросом

### Базовое подключение

```javascript
const WS_URL = 'wss://your-domain.com/ws/chat/'

let socket = null
let shouldReconnect = true

function connect() {
  socket = new WebSocket(WS_URL)

  socket.onopen = () => {
    console.log('WebSocket connected')
  }

  socket.onclose = (event) => {
    console.log('WebSocket closed:', event.code, event.reason)
    handleClose(event.code)
  }

  socket.onerror = (error) => {
    console.error('WebSocket error:', error)
  }

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    handleMessage(data)
  }
}

function handleClose(code) {
  switch (code) {
    case 4001:
      // Не авторизован — редирект на логин
      window.location.href = '/login'
      break

    case 4002:
      // Heartbeat timeout — можно переподключиться
      if (shouldReconnect) {
        setTimeout(connect, 3000)
      }
      break

    case 4003:
      // Новое соединение открыто — НЕ переподключаемся
      shouldReconnect = false
      showNotification('Чат открыт в другом окне')
      break

    default:
      // Другие причины — переподключение с exponential backoff
      if (shouldReconnect) {
        setTimeout(connect, 3000)
      }
  }
}
```

### Коды закрытия WebSocket

| Код | Значение | Переподключаться? |
|-----|----------|-------------------|
| `4001` | Не авторизован | Нет (редирект на логин) |
| `4002` | Heartbeat timeout (нет pong) | Да |
| `4003` | Принудительное отключение (новое соединение) | Нет |

---

## 3. Heartbeat (Ping/Pong)

### Механизм

- Сервер отправляет `ping` каждые **30 секунд**
- Клиент **ОБЯЗАН** ответить `pong`
- Если сервер не получает `pong` в течение **60 секунд** — соединение закрывается (код 4002)

### Сервер → Клиент (ping)

```json
{
  "type": "ping",
  "data": {
    "timestamp": "2025-12-15T10:30:00.000000",
    "timeout": 60
  }
}
```

### Клиент → Сервер (pong)

```json
{
  "action": "pong",
  "data": {}
}
```

### Реализация

```javascript
function handleMessage(data) {
  if (data.type === 'ping') {
    // ОБЯЗАТЕЛЬНО отвечаем pong!
    socket.send(JSON.stringify({
      action: 'pong',
      data: {}
    }))
    return
  }

  // Обработка других событий...
}
```

---

## 4. События от клиента к серверу

### 4.1 send_message — Отправка сообщения

**Payload:**

```json
{
  "action": "send_message",
  "data": {
    "conversation_id": 123,
    "content": "Привет! Как мне улучшить привычку к спорту?",
    "reply_to_id": null,
    "source_page": "/habits",
    "client_context": {
      "selected_habit_id": 456,
      "today_completed": false
    }
  }
}
```

**Поля:**

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| `conversation_id` | integer | Да | ID диалога |
| `content` | string | Да | Текст сообщения (1-10000 символов) |
| `reply_to_id` | integer | Нет | ID сообщения на которое отвечаем |
| `source_page` | string | Нет | URL страницы (например `/goals`, `/habits`) |
| `client_context` | object | Нет | Произвольный JSON с контекстом UI |

**Ответ:** `message_sent` или `error`

---

### 4.2 typing_start — Начало набора

```json
{
  "action": "typing_start",
  "data": {
    "conversation_id": 123
  }
}
```

---

### 4.3 typing_stop — Конец набора

```json
{
  "action": "typing_stop",
  "data": {
    "conversation_id": 123
  }
}
```

---

### 4.4 mark_read — Отметить как прочитанные

```json
{
  "action": "mark_read",
  "data": {
    "conversation_id": 123,
    "message_ids": [450, 451, 452]
  }
}
```

**Примечание:** Если `message_ids` не указан — отмечаются все непрочитанные.

---

### 4.5 add_reaction — Добавить/удалить реакцию

**Добавить:**

```json
{
  "action": "add_reaction",
  "data": {
    "message_id": 456,
    "reaction_type": "like"
  }
}
```

**Удалить:**

```json
{
  "action": "add_reaction",
  "data": {
    "message_id": 456,
    "reaction_type": "like",
    "remove": true
  }
}
```

**Типы реакций:** `like`, `dislike`, `helpful`

---

### 4.6 pong — Ответ на ping

```json
{
  "action": "pong",
  "data": {}
}
```

---

## 5. События от сервера к клиенту

### 5.1 message_sent — Подтверждение отправки

```json
{
  "type": "message_sent",
  "data": {
    "message": {
      "message_id": 789,
      "conversation_id": 123,
      "message_type": "user",
      "content": "Привет! Как мне улучшить привычку к спорту?",
      "status": "sent",
      "reply_to_id": null,
      "source_page": "/habits",
      "client_context": {"selected_habit_id": 456},
      "bot_metadata": null,
      "date_created": "2025-12-15 15:30:45",
      "date_read": null
    }
  }
}
```

---

### 5.2 new_message — Новое входящее сообщение

```json
{
  "type": "new_message",
  "data": {
    "message": {
      "message_id": 790,
      "conversation_id": 123,
      "message_type": "bot",
      "content": "Отличный вопрос! Основываясь на твоих целях...\n\n**Совет 1:** Начни с малого...",
      "status": "sent",
      "reply_to_id": 789,
      "source_page": null,
      "client_context": null,
      "bot_metadata": {
        "model": "gpt-4o-mini",
        "tokens_used": 234,
        "finish_reason": "stop"
      },
      "date_created": "2025-12-15 15:30:48",
      "date_read": null
    }
  }
}
```

---

### 5.3 bot_typing — Бот печатает

**Начало:**

```json
{
  "type": "bot_typing",
  "data": {
    "conversation_id": 123,
    "typing": true
  }
}
```

**Конец:**

```json
{
  "type": "bot_typing",
  "data": {
    "conversation_id": 123,
    "typing": false
  }
}
```

---

### 5.4 ping — Проверка активности

```json
{
  "type": "ping",
  "data": {
    "timestamp": "2025-12-15T10:30:00.000000",
    "timeout": 60
  }
}
```

**Обязательно ответить:** `pong`

---

### 5.5 force_disconnect — Принудительное отключение

```json
{
  "type": "force_disconnect",
  "data": {
    "reason": "new_connection"
  }
}
```

**Действие:** Показать уведомление, НЕ переподключаться автоматически.

---

### 5.6 error — Ошибка

```json
{
  "type": "error",
  "data": {
    "error_code": "bot_is_processing",
    "error_message": "Bot is currently processing your previous message"
  }
}
```

**Возможные error_code:**

| Код | Описание |
|-----|----------|
| `missing_event_type` | Не указан тип события |
| `unknown_event_type` | Неизвестный тип события |
| `validation_error` | Ошибка валидации данных |
| `conversation_not_access` | Нет доступа к беседе |
| `message_not_access` | Нет доступа к сообщению |
| `bot_is_processing` | Бот обрабатывает предыдущее сообщение |
| `reply_message_not_found` | Сообщение для reply не найдено |
| `handler_error` | Внутренняя ошибка обработчика |
| `internal_error` | Внутренняя ошибка сервера |

---

## 6. REST API

Все REST endpoints используют **POST** метод.

### 6.1 GET Conversations

**URL:** `POST /api/rest/front/app/chat/conversations/get/`

**Request:**

```json
{
  "conversation_type_filter": "ai_bot",
  "order_by": "last_message_at",
  "order_direction": "desc",
  "page": 1,
  "page_size": 20
}
```

**Response:**

```json
{
  "status": "ok",
  "data": {
    "conversations_data": [
      {
        "conversation_id": 123,
        "conversation_type": "ai_bot",
        "title": "Чат с AI помощником",
        "last_message_at": "2025-12-15 15:35:12",
        "messages_count": 8,
        "unread_count": 2,
        "is_bot_processing": false,
        "date_created": "2025-12-10 10:00:00",
        "date_updated": "2025-12-15 15:35:12"
      }
    ],
    "total_items": 1,
    "total_filtered_items": 1,
    "total_pages": 1,
    "page": 1,
    "page_size": 20
  }
}
```

**Поля ответа:**

| Поле | Тип | Описание |
|------|-----|----------|
| `conversation_id` | integer | ID беседы |
| `conversation_type` | string | Тип: `ai_bot` или `user_to_user` |
| `title` | string | Название беседы |
| `last_message_at` | datetime | Дата последнего сообщения |
| `messages_count` | integer | Всего сообщений в беседе |
| `unread_count` | integer | Непрочитанных сообщений от бота |
| `is_bot_processing` | boolean | Флаг блокировки (бот генерирует ответ) |
| `date_created` | datetime | Дата создания |
| `date_updated` | datetime | Дата обновления |

---

### 6.2 CREATE Conversation

**URL:** `POST /api/rest/front/app/chat/conversations/create/`

**Request:**

```json
{
  "conversation_type": "ai_bot",
  "title": "Моя новая тема"
}
```

**Поля запроса:**

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| `conversation_type` | string | Нет | Тип: `ai_bot` (default) или `user_to_user` |
| `title` | string | Нет | Название беседы |

**Response:**

```json
{
  "status": "ok",
  "data": {
    "conversation": {
      "conversation_id": 124,
      "conversation_type": "ai_bot",
      "title": "Моя новая тема",
      "last_message_at": null,
      "messages_count": 0,
      "unread_count": 0,
      "is_bot_processing": false,
      "date_created": "2025-12-15 16:00:00",
      "date_updated": "2025-12-15 16:00:00"
    }
  }
}
```

---

### 6.3 DELETE Conversation

**URL:** `POST /api/rest/front/app/chat/conversations/delete/`

Удаление беседы (soft delete). Все сообщения беседы также помечаются удалёнными.

**Request:**

```json
{
  "conversation_id": 123
}
```

**Response (успех):**

```json
{
  "status": "ok"
}
```

**Response (ошибка — нет доступа):**

```json
{
  "status": "error",
  "error_code": "conversation_not_access",
  "error_message": "Нет доступа к беседе"
}
```

**Кейсы использования:**

1. **Удаление чата пользователем** — пользователь хочет удалить историю переписки
2. **Очистка старых бесед** — автоматическое удаление неактивных бесед
3. **Перед созданием новой темы** — если нужно "начать с чистого листа"

---

### 6.4 GET Messages

**URL:** `POST /api/rest/front/app/chat/messages/get/`

**Request:**

```json
{
  "conversation_id": 123,
  "order_by": "date_created",
  "order_direction": "asc",
  "page": 1,
  "page_size": 50
}
```

**Response:**

```json
{
  "status": "ok",
  "data": {
    "messages_data": [
      {
        "message_id": 450,
        "conversation_id": 123,
        "message_type": "user",
        "content": "Привет!",
        "status": "read",
        "reply_to_id": null,
        "source_page": "/goals",
        "client_context": null,
        "bot_metadata": null,
        "date_created": "2025-12-15 15:20:00",
        "date_read": "2025-12-15 15:25:00"
      },
      {
        "message_id": 451,
        "conversation_id": 123,
        "message_type": "bot",
        "content": "Привет! Чем могу помочь?",
        "status": "read",
        "reply_to_id": 450,
        "source_page": null,
        "client_context": null,
        "bot_metadata": {
          "model": "gpt-4o-mini",
          "tokens_used": 45,
          "finish_reason": "stop"
        },
        "date_created": "2025-12-15 15:20:05",
        "date_read": "2025-12-15 15:25:00"
      }
    ],
    "total_items": 8,
    "total_filtered_items": 8,
    "total_pages": 1,
    "page": 1,
    "page_size": 50
  }
}
```

---

### 6.5 Загрузка истории (Infinite Scroll)

Паттерн загрузки истории сообщений при скролле вверх.

#### Начальная загрузка

При открытии чата загружаем последние сообщения:

```javascript
// Загрузить последние 50 сообщений (от новых к старым)
const response = await api.post('/app/chat/messages/get/', {
  conversation_id: conversationId,
  order_by: 'date_created',
  order_direction: 'desc',  // От новых к старым
  page: 1,
  page_size: 50
})

// Перевернуть массив для отображения (старые сверху)
const messages = response.data.messages_data.reverse()
```

#### Загрузка при скролле вверх

```javascript
let currentPage = 1
let hasMore = true
let isLoading = false

async function loadOlderMessages() {
  if (isLoading || !hasMore) return

  isLoading = true
  currentPage++

  const response = await api.post('/app/chat/messages/get/', {
    conversation_id: conversationId,
    order_by: 'date_created',
    order_direction: 'desc',
    page: currentPage,
    page_size: 50
  })

  const olderMessages = response.data.messages_data.reverse()

  // Добавить в начало списка
  messages.value = [...olderMessages, ...messages.value]

  // Проверить есть ли ещё
  hasMore = currentPage < response.data.total_pages
  isLoading = false
}
```

#### IntersectionObserver для автозагрузки

```vue
<template>
  <div class="messages-container" ref="container">
    <!-- Trigger для загрузки истории -->
    <div ref="loadTrigger" class="load-trigger"></div>

    <div v-for="msg in messages" :key="msg.message_id" class="message">
      <!-- ... -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const loadTrigger = ref(null)
let observer = null

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      loadOlderMessages()
    }
  }, { threshold: 0.1 })

  observer.observe(loadTrigger.value)
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>
```

#### Совмещение REST + WebSocket

```javascript
// REST — для загрузки истории
const loadHistory = async () => {
  const response = await api.post('/app/chat/messages/get/', {...})
  messages.value = response.data.messages_data
}

// WebSocket — для новых сообщений в реальном времени
socket.onmessage = (event) => {
  const data = JSON.parse(event.data)

  if (data.type === 'new_message') {
    // Добавить в конец списка
    messages.value.push(data.data.message)
  }
}
```

---

### 6.6 SEND Message

**URL:** `POST /api/rest/front/app/chat/messages/send/`

**Request:**

```json
{
  "conversation_id": 123,
  "content": "Как мне улучшить дисциплину?",
  "reply_to_id": null,
  "source_page": "/goals",
  "client_context": {
    "selected_goal_id": 456
  }
}
```

**Response (успех):**

```json
{
  "status": "ok",
  "data": {
    "message": {
      "message_id": 459,
      "conversation_id": 123,
      "message_type": "user",
      "content": "Как мне улучшить дисциплину?",
      "status": "sent",
      "reply_to_id": null,
      "source_page": "/goals",
      "client_context": {"selected_goal_id": 456},
      "bot_metadata": null,
      "date_created": "2025-12-15 16:10:00",
      "date_read": null
    }
  }
}
```

**Response (ошибка — бот обрабатывает):**

```json
{
  "status": "error",
  "error_code": "bot_is_processing",
  "error_message": "Подождите, бот обрабатывает предыдущее сообщение"
}
```

---

### 6.7 MARK Messages Read

**URL:** `POST /api/rest/front/app/chat/messages/mark-read/`

**Request:**

```json
{
  "conversation_id": 123,
  "message_ids": [450, 451, 452]
}
```

**Response:**

```json
{
  "status": "ok"
}
```

---

### 6.8 UPDATE Reaction

**URL:** `POST /api/rest/front/app/chat/reactions/update/`

**Request:**

```json
{
  "message_id": 456,
  "reaction_type": "helpful",
  "remove": false
}
```

**Response:**

```json
{
  "status": "ok"
}
```

---

## 7. Блокировка отправки сообщений

### Логика

Для `ai_bot` бесед: пока бот генерирует ответ (`is_bot_processing = true`), отправка новых сообщений заблокирована.

### Как определить блокировку

**Способ 1: Событие `bot_typing`**

```javascript
const isBotTyping = ref(false)
const canSendMessage = computed(() => !isBotTyping.value)

function handleMessage(data) {
  if (data.type === 'bot_typing') {
    isBotTyping.value = data.data.typing
  }
}
```

**Способ 2: Ошибка `bot_is_processing`**

```javascript
async function sendMessage(content) {
  try {
    const response = await api.post('/app/chat/messages/send/', {...})
    // Успех
  } catch (error) {
    if (error.response?.data?.error_code === 'bot_is_processing') {
      showNotification('Подождите ответа бота')
    }
  }
}
```

### Рекомендуемый подход

Комбинация обоих:

```javascript
const isBotTyping = ref(false)
const isProcessing = ref(false)

const canSendMessage = computed(() => {
  return !isBotTyping.value && !isProcessing.value
})

async function sendMessage(content) {
  if (!canSendMessage.value) {
    showNotification('Подождите ответа бота')
    return
  }

  isProcessing.value = true

  try {
    // Отправка через WebSocket или REST
    socket.send(JSON.stringify({
      action: 'send_message',
      data: { conversation_id, content, source_page }
    }))
  } catch (error) {
    if (error?.error_code === 'bot_is_processing') {
      isBotTyping.value = true
    }
  }
}

// При получении bot_typing: false
function onBotTypingEnd() {
  isBotTyping.value = false
  isProcessing.value = false
}
```

---

## 8. Meta данные (source_page, client_context)

### Описание

| Поле | Тип | Описание |
|------|-----|----------|
| `source_page` | string | URL страницы откуда отправлено (например `/goals`, `/habits`) |
| `client_context` | object | Произвольный JSON с контекстом UI |

### Автоматическое добавление

```javascript
import { useRouter } from 'vue-router'

const router = useRouter()

function sendMessage(content, clientContext = null) {
  const payload = {
    conversation_id: conversationId.value,
    content,
    source_page: router.currentRoute.value.path,
    client_context: clientContext
  }

  socket.send(JSON.stringify({ action: 'send_message', data: payload }))
}
```

### Примеры client_context

```javascript
// На странице целей
client_context: {
  selected_goal_id: 123,
  goal_title: 'Выучить английский',
  view_mode: 'weekly'
}

// На странице привычек
client_context: {
  habit_id: 456,
  habit_name: 'Утренняя зарядка',
  today_completed: false,
  current_streak: 7
}

// На дашборде
client_context: {
  widget_source: 'daily_summary',
  date: '2025-12-15'
}
```

---

## 9. Markdown в сообщениях

### Формат

Все сообщения (`content`) хранятся в формате **Markdown**.

### Поддерживаемые элементы

- **Жирный**: `**текст**`
- *Курсив*: `*текст*`
- ~~Зачёркнутый~~: `~~текст~~`
- `Код`: `` `код` ``
- Блоки кода: ` ```язык ... ``` `
- Списки: `- пункт` или `1. пункт`
- Ссылки: `[текст](url)`

### Рендеринг

```bash
npm install marked dompurify
```

```javascript
import { marked } from 'marked'
import DOMPurify from 'dompurify'

function renderMarkdown(content) {
  const html = marked(content)
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'del', 'code', 'pre',
                   'ul', 'ol', 'li', 'a', 'blockquote'],
    ALLOWED_ATTR: ['href', 'class']
  })
}
```

```vue
<template>
  <div class="message-content" v-html="renderedContent"></div>
</template>

<script setup>
const renderedContent = computed(() => renderMarkdown(props.content))
</script>
```

**ВАЖНО:** Всегда используйте DOMPurify для защиты от XSS!

---

## 10. Типы данных (TypeScript)

```typescript
// === Сообщение ===
interface ChatMessage {
  message_id: number
  conversation_id: number
  message_type: 'user' | 'bot' | 'system'
  content: string  // Markdown
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  reply_to_id: number | null
  source_page: string | null
  client_context: Record<string, any> | null
  bot_metadata: BotMetadata | null
  date_created: string  // "YYYY-MM-DD HH:MM:SS"
  date_read: string | null
}

interface BotMetadata {
  model: string           // "gpt-4o-mini"
  tokens_used: number
  finish_reason: string   // "stop", "length"
  is_stub?: boolean       // true если заглушка (dev)
  is_proactive?: boolean  // true если проактивное сообщение
}

// === AI Bot Chat (из get-user-data) ===
interface AiBotChatData {
  conversation_id: number   // ID беседы с AI ботом
  unread_count: number      // Непрочитанных сообщений
  is_bot_processing: boolean // Бот генерирует ответ
}

// === Беседа ===
interface Conversation {
  conversation_id: number
  conversation_type: 'ai_bot' | 'user_to_user'
  title: string
  last_message_at: string | null
  messages_count: number
  unread_count: number          // Непрочитанных сообщений от бота
  is_bot_processing: boolean    // Блокировка отправки
  date_created: string          // "YYYY-MM-DD HH:MM:SS"
  date_updated: string
}

// === WebSocket события ===
interface WsEvent {
  type: string
  data: Record<string, any>
}

interface WsAction {
  action: string
  data: Record<string, any>
}
```

---

## 11. Vue.js Composable

```javascript
// composables/useChat.js
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

export function useChat(conversationId) {
  const router = useRouter()

  // State
  const socket = ref(null)
  const isConnected = ref(false)
  const isBotTyping = ref(false)
  const messages = ref([])
  let shouldReconnect = true

  // Computed
  const canSendMessage = computed(() => {
    return isConnected.value && !isBotTyping.value
  })

  // WebSocket
  function connect() {
    if (socket.value?.readyState === WebSocket.OPEN) return

    socket.value = new WebSocket('wss://your-domain.com/ws/chat/')

    socket.value.onopen = () => {
      isConnected.value = true
      console.log('Chat connected')
    }

    socket.value.onclose = (event) => {
      isConnected.value = false
      handleClose(event.code)
    }

    socket.value.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    socket.value.onmessage = (event) => {
      const data = JSON.parse(event.data)
      handleMessage(data)
    }
  }

  function handleClose(code) {
    switch (code) {
      case 4001:
        router.push('/login')
        break
      case 4003:
        shouldReconnect = false
        showNotification('Чат открыт в другом месте')
        break
      default:
        if (shouldReconnect) {
          setTimeout(connect, 3000)
        }
    }
  }

  function handleMessage(data) {
    switch (data.type) {
      case 'ping':
        // ОБЯЗАТЕЛЬНО отвечаем!
        socket.value?.send(JSON.stringify({ action: 'pong', data: {} }))
        break

      case 'bot_typing':
        isBotTyping.value = data.data.typing
        break

      case 'new_message':
        messages.value.push(data.data.message)
        break

      case 'message_sent':
        // Обновить pending → sent
        const idx = messages.value.findIndex(
          m => m._temp_id === data.data.message._temp_id
        )
        if (idx !== -1) {
          messages.value[idx] = data.data.message
        } else {
          messages.value.push(data.data.message)
        }
        break

      case 'force_disconnect':
        shouldReconnect = false
        showNotification('Чат открыт в другом окне')
        break

      case 'error':
        console.error('Chat error:', data.data.error_code, data.data.error_message)
        if (data.data.error_code === 'bot_is_processing') {
          isBotTyping.value = true
        }
        break
    }
  }

  // Send message
  function sendMessage(content, clientContext = null) {
    if (!canSendMessage.value) {
      showNotification('Подождите ответа бота')
      return
    }

    const tempId = Date.now()

    // Optimistic UI
    const tempMessage = {
      message_id: tempId,
      _temp_id: tempId,
      conversation_id: conversationId,
      message_type: 'user',
      content,
      status: 'pending',
      date_created: new Date().toISOString()
    }
    messages.value.push(tempMessage)

    // Send
    socket.value?.send(JSON.stringify({
      action: 'send_message',
      data: {
        conversation_id: conversationId,
        content,
        source_page: router.currentRoute.value.path,
        client_context: clientContext
      }
    }))
  }

  // Mark as read
  function markRead(messageIds = null) {
    socket.value?.send(JSON.stringify({
      action: 'mark_read',
      data: {
        conversation_id: conversationId,
        message_ids: messageIds
      }
    }))
  }

  // Add reaction
  function addReaction(messageId, reactionType, remove = false) {
    socket.value?.send(JSON.stringify({
      action: 'add_reaction',
      data: {
        message_id: messageId,
        reaction_type: reactionType,
        remove
      }
    }))
  }

  // Render markdown
  function renderContent(content) {
    return DOMPurify.sanitize(marked(content))
  }

  // Disconnect
  function disconnect() {
    shouldReconnect = false
    socket.value?.close()
  }

  // Lifecycle
  onMounted(connect)
  onUnmounted(disconnect)

  return {
    isConnected,
    isBotTyping,
    canSendMessage,
    messages,
    sendMessage,
    markRead,
    addReaction,
    renderContent
  }
}

// Helper
function showNotification(message) {
  // Implement your notification system
  alert(message)
}
```

---

## 12. Пример компонента ChatWindow

```vue
<template>
  <div class="chat-window">
    <!-- Messages -->
    <div class="messages-container" ref="messagesContainer">
      <div
        v-for="msg in messages"
        :key="msg.message_id"
        :class="['message', `message-${msg.message_type}`]"
      >
        <div
          class="message-content"
          v-html="renderContent(msg.content)"
        />
        <div class="message-meta">
          {{ formatTime(msg.date_created) }}
          <span v-if="msg.status === 'pending'" class="status-pending">
            Отправляется...
          </span>
        </div>
      </div>

      <!-- Bot typing indicator -->
      <div v-if="isBotTyping" class="typing-indicator">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="typing-text">AI помощник печатает...</span>
      </div>
    </div>

    <!-- Input -->
    <div class="input-container">
      <textarea
        v-model="inputText"
        :disabled="!canSendMessage"
        @keydown.enter.exact.prevent="handleSend"
        placeholder="Написать сообщение..."
        :class="{ disabled: !canSendMessage }"
      />
      <button
        :disabled="!canSendMessage || !inputText.trim()"
        @click="handleSend"
        class="send-button"
      >
        Отправить
      </button>
    </div>

    <!-- Connection status -->
    <div v-if="!isConnected" class="connection-warning">
      Соединение потеряно. Переподключение...
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useChat } from '@/composables/useChat'

const props = defineProps({
  conversationId: {
    type: Number,
    required: true
  }
})

const {
  isConnected,
  isBotTyping,
  canSendMessage,
  messages,
  sendMessage,
  markRead,
  renderContent
} = useChat(props.conversationId)

const inputText = ref('')
const messagesContainer = ref(null)

// Send message
function handleSend() {
  if (!inputText.value.trim()) return

  sendMessage(inputText.value.trim())
  inputText.value = ''
}

// Format time
function formatTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

// Auto-scroll and mark as read
watch(messages, async () => {
  await nextTick()

  // Scroll to bottom
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }

  // Mark bot messages as read
  const unreadBotIds = messages.value
    .filter(m => m.message_type === 'bot' && !m.date_read)
    .map(m => m.message_id)

  if (unreadBotIds.length > 0) {
    markRead(unreadBotIds)
  }
}, { deep: true })
</script>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message {
  margin-bottom: 15px;
  padding: 10px 15px;
  border-radius: 8px;
  max-width: 70%;
}

.message-user {
  background: #007bff;
  color: white;
  margin-left: auto;
}

.message-bot {
  background: #f1f1f1;
  color: #333;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px;
  color: #999;
}

.dot {
  width: 8px;
  height: 8px;
  background: #999;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.input-container {
  display: flex;
  padding: 15px;
  border-top: 1px solid #eee;
}

.input-container textarea {
  flex: 1;
  resize: none;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.input-container textarea.disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.send-button {
  margin-left: 10px;
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.send-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.connection-warning {
  background: #fff3cd;
  color: #856404;
  padding: 10px;
  text-align: center;
}
</style>
```

---

## 13. Обработка ошибок

### WebSocket ошибки

```javascript
function handleMessage(data) {
  if (data.type === 'error') {
    const { error_code, error_message } = data.data

    switch (error_code) {
      case 'bot_is_processing':
        isBotTyping.value = true
        showNotification('Подождите ответа бота')
        break

      case 'conversation_not_access':
        showNotification('Нет доступа к беседе')
        router.push('/chat')
        break

      case 'validation_error':
        showNotification(error_message)
        break

      default:
        console.error('Chat error:', error_code, error_message)
        showNotification('Произошла ошибка')
    }
  }
}
```

### REST API ошибки

```javascript
async function sendMessageREST(content) {
  try {
    const response = await api.post('/app/chat/messages/send/', {
      conversation_id: conversationId,
      content,
      source_page: router.currentRoute.value.path
    })

    if (response.data.status === 'ok') {
      return response.data.data.message
    }
  } catch (error) {
    const errorCode = error.response?.data?.error_code

    if (errorCode === 'bot_is_processing') {
      showNotification('Подождите ответа бота')
      isBotTyping.value = true
    } else {
      showNotification('Не удалось отправить сообщение')
    }

    throw error
  }
}
```

---

## 14. Чек-лист интеграции

### WebSocket

- [ ] Подключение к `wss://your-domain.com/ws/chat/`
- [ ] Обработка `ping` → отправка `pong` (ОБЯЗАТЕЛЬНО!)
- [ ] Обработка `bot_typing` → блокировка input
- [ ] Обработка `force_disconnect` → уведомление, без auto-reconnect
- [ ] Обработка кодов закрытия (4001, 4002, 4003)
- [ ] Показ статуса соединения пользователю
- [ ] Автоматическое переподключение с exponential backoff

### Отправка сообщений

- [ ] Проверка `canSendMessage` перед отправкой
- [ ] Отправка `source_page` с каждым сообщением
- [ ] Отправка `client_context` при необходимости
- [ ] Optimistic UI (добавить сообщение сразу)
- [ ] Обновление статуса при получении `message_sent`
- [ ] Обработка ошибки `bot_is_processing`

### UI

- [ ] Рендеринг Markdown с санитизацией (DOMPurify!)
- [ ] Индикатор "бот печатает"
- [ ] Блокировка поля ввода когда бот думает
- [ ] Auto-scroll при новых сообщениях
- [ ] Отметка сообщений как прочитанных

### REST API (fallback)

- [ ] Загрузка истории сообщений (GET Messages)
- [ ] Infinite scroll — IntersectionObserver для автозагрузки
- [ ] Создание/удаление бесед
- [ ] Отправка через REST если WebSocket недоступен

---

## Вопросы?

- **Redoc:** `https://your-domain.com/api/rest/front/v1/docs/`
- **WebSocket Docs:** `https://your-domain.com/api/rest/front/ws/chat/docs/` (fake endpoint)
- **Исходный код:** `chat/consumers/chat_consumer.py`, `chat/views/`

---

**Последнее обновление:** 15 декабря 2025
**Версия:** 3.2.0
