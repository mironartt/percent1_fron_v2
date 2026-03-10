# Voice Messages in AI Chat - Frontend Implementation

## Context

Backend реализовал поддержку голосовых сообщений в AI-чате (REST endpoint, Celery task, WebSocket events). Фронтенд нуждался в интеграции: запись аудио, отправка, отображение голосовых сообщений.

## Изменённые файлы

### Новые файлы

| Файл | Назначение |
|------|-----------|
| `src/composables/useVoiceRecorder.js` | Composable для записи аудио через MediaRecorder API |
| `src/components/VoiceMessageBubble.vue` | Компонент отображения голосового сообщения (плеер + расшифровка) |

### Модифицированные файлы

| Файл | Изменения |
|------|-----------|
| `src/services/api.js` | FormData support в `apiFetch()`, новая функция `sendVoiceMessage()` |
| `src/services/chatWebSocket.js` | Обработка события `message_updated` |
| `src/stores/chat.js` | Метод `sendVoiceMessage()`, handler `handleMessageUpdated` |
| `src/views/ChatView.vue` | Кнопка микрофона, recording bar UI, VoiceMessageBubble рендеринг |

## Архитектура

### Flow отправки голосового сообщения

```
1. Пользователь нажимает кнопку микрофона (пустой input)
2. useVoiceRecorder: MediaRecorder API → запись аудио
3. Recording bar: таймер + кнопки Cancel/Send
4. Stop → audioBlob
5. chatStore.sendVoiceMessage() → api.sendVoiceMessage()
6. POST /api/rest/front/app/chat/messages/send-voice/ (multipart/form-data)
7. Backend: ChatMessage (content='') + MessageAttachment → Celery task
8. WebSocket: message_updated → content заполняется расшифровкой
9. WebSocket: new_message → ответ AI-бота
```

### useVoiceRecorder composable

- Нативный MediaRecorder API, без внешних зависимостей
- MIME fallback: `audio/webm;codecs=opus` → `audio/webm` → `audio/mp4` (Safari)
- Max duration: 120 сек (auto-stop)
- Корректное освобождение MediaStream при unmount
- Обработка ошибок: permission_denied, no_device, not_supported

### VoiceMessageBubble component

- Play/Pause кнопка с нативным `<audio>` элементом
- Progress bar с отслеживанием `timeupdate`
- Отображение длительности (mm:ss)
- Расшифровка: текст или "Расшифровка..." (анимированный спиннер)

### API changes

- `apiFetch()`: не устанавливает `Content-Type` для `FormData` (браузер сам добавляет boundary)
- `sendVoiceMessage()`: отправляет `FormData` с `audio_file`, `conversation_id`, `duration`, `source_page`

### WebSocket

- Добавлен case `message_updated` в `chatWebSocket.js`
- Handler в store обновляет существующее сообщение (merge, не replace)

## UI/UX

- Кнопка микрофона появляется когда input пуст (и браузер поддерживает запись)
- Кнопка Send появляется когда есть текст
- Во время записи: recording bar с пульсирующей красной точкой, таймером, кнопками Cancel и Send
- Голосовое сообщение в чате: плеер (play/pause + progress) + текст расшифровки
- Обе формы (empty state + active chat) поддерживают микрофон

## Edge Cases

- Safari/iOS: fallback на `audio/mp4` вместо `audio/webm`
- Unsupported browser: кнопка микрофона скрыта (`isSupported`)
- Permission denied: toast-уведомление
- Bot processing: mic кнопка disabled через `canSendMessage`
- message_updated race condition: игнорируется для неизвестных message_id

## Verification

- [x] Проект собирается без ошибок (`vite build` — success)
- [x] Текстовый чат не затронут (все изменения за `v-if`/`v-else` guards)
- [x] Существующие imports не сломаны
- [x] WebSocket backwards-compatible (новый case в switch, default не затронут)
