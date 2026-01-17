# Content Factory - n8n Workflows

## Обзор системы

Автоматизированная фабрика контента для создания и публикации коротких видео в TikTok, YouTube Shorts и Instagram Reels.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  ПЛАНИРОВАНИЕ   │────▶│    ГЕНЕРАЦИЯ    │────▶│   МОДЕРАЦИЯ     │────▶│   ПУБЛИКАЦИЯ    │
│                 │     │                 │     │                 │     │                 │
│ Google Sheet    │     │ OpenAI Script   │     │ Telegram Bot    │     │ TikTok          │
│ (темы)          │     │ Creatomate Video│     │ (Approve/Reject)│     │ YouTube Shorts  │
│                 │     │                 │     │                 │     │ Instagram Reels │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Файлы

| Файл | Workflow | Описание |
|------|----------|----------|
| `01_script_generator.json` | Script Generator | Генерация скриптов по темам из Google Sheet |
| `02_moderation_handler.json` | Moderation Handler | Обработка callback'ов из Telegram |
| `03_video_generator.json` | Video Generator | Создание инфографики через Creatomate |
| `04_auto_publisher.json` | Auto Publisher | Публикация в соцсети |

## Как импортировать в n8n

1. Откройте n8n
2. Нажмите **+** → **Import from File**
3. Выберите JSON файл
4. Настройте credentials (см. ниже)

## Необходимые Credentials

### 1. Google Sheets OAuth2
- Создайте проект в [Google Cloud Console](https://console.cloud.google.com/)
- Включите Google Sheets API
- Создайте OAuth 2.0 credentials
- В n8n: **Settings → Credentials → New → Google Sheets OAuth2**

### 2. OpenAI API
- Получите API ключ на [platform.openai.com](https://platform.openai.com/)
- В n8n: **Settings → Credentials → New → OpenAI**

### 3. Telegram Bot
- Создайте бота через [@BotFather](https://t.me/BotFather)
- Получите Bot Token
- Узнайте ваш Chat ID через [@userinfobot](https://t.me/userinfobot)
- В n8n: **Settings → Credentials → New → Telegram**

### 4. Creatomate API
- Зарегистрируйтесь на [creatomate.com](https://creatomate.com/)
- Получите API ключ в Dashboard → API
- В n8n: **Settings → Credentials → New → HTTP Header Auth**
  - Name: `Authorization`
  - Value: `Bearer YOUR_API_KEY`

### 5. TikTok API (опционально)
- Зарегистрируйте приложение на [developers.tiktok.com](https://developers.tiktok.com/)
- Получите OAuth credentials

### 6. YouTube API (опционально)
- Используйте Google Cloud Console
- Включите YouTube Data API v3
- Создайте OAuth 2.0 credentials

### 7. Instagram/Meta API (опционально)
- Создайте приложение на [developers.facebook.com](https://developers.facebook.com/)
- Настройте Instagram Basic Display API
- Получите Business Account ID

## Замены в workflow файлах

После импорта замените следующие placeholder'ы:

| Placeholder | Где найти |
|-------------|-----------|
| `YOUR_SPREADSHEET_ID` | ID из URL Google Sheet (`/d/XXXXX/edit`) |
| `YOUR_TELEGRAM_CHAT_ID` | От @userinfobot в Telegram |
| `YOUR_GOOGLE_CREDENTIALS_ID` | ID credential в n8n |
| `YOUR_OPENAI_CREDENTIALS_ID` | ID credential в n8n |
| `YOUR_TELEGRAM_CREDENTIALS_ID` | ID credential в n8n |
| `YOUR_CREATOMATE_TEMPLATE_ID` | ID шаблона в Creatomate |
| `YOUR_CREATOMATE_CREDENTIALS_ID` | ID credential в n8n |
| `VIDEO_GENERATOR_WORKFLOW_ID` | ID workflow 03_video_generator |
| `PUBLISHER_WORKFLOW_ID` | ID workflow 04_auto_publisher |

## Статусы контента

| Статус | Описание |
|--------|----------|
| `new` | Новая тема, ожидает генерации скрипта |
| `script_ready` | Скрипт сгенерирован, ожидает модерации |
| `video_pending` | Скрипт одобрен, генерируется видео |
| `video_ready` | Видео готово, ожидает финальной модерации |
| `approved` | Видео одобрено, готово к публикации |
| `published` | Опубликовано во всех соцсетях |
| `rejected` | Отклонено на модерации |

## Порядок активации

1. Импортируйте все 4 workflow
2. Настройте credentials
3. Замените placeholder'ы
4. Активируйте в порядке:
   - `02_moderation_handler.json` (первым, т.к. слушает Telegram)
   - `03_video_generator.json`
   - `04_auto_publisher.json`
   - `01_script_generator.json` (последним)

## Тестирование

1. Добавьте тему в Google Sheet со статусом `new`
2. Запустите `01_script_generator` вручную (кнопка Execute)
3. Проверьте Telegram — должен прийти скрипт
4. Нажмите "Одобрить скрипт"
5. Дождитесь видео
6. Нажмите "Опубликовать"

## Troubleshooting

### Telegram не получает сообщения
- Проверьте Bot Token
- Убедитесь, что Chat ID правильный
- Напишите боту `/start`

### Google Sheets не читает данные
- Проверьте ID таблицы
- Убедитесь, что Service Account имеет доступ к таблице
- Проверьте название листа (Sheet1)

### Creatomate не рендерит видео
- Проверьте API ключ
- Убедитесь, что Template ID существует
- Проверьте, что поля шаблона совпадают с modifications

## Поддержка

Вопросы? Создайте issue или напишите в Telegram.
