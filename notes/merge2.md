# Merge Report #2: main → back_intergration

**Дата:** 26 ноября 2025  
**Направление:** Слияние `origin/main` в `back_intergration`  
**Метод:** `git merge origin/main --allow-unrelated-histories`

---

## Краткое описание

Выполнено слияние ветки `main` в ветку `back_intergration` для объединения:
- **Из back_intergration:** Логика работы с API, роутинг, аутентификация, онбординг
- **Из main:** Новые страницы, вёрстка, стили, UI-компоненты

---

## Приоритеты при слиянии

| Категория | Приоритет |
|-----------|-----------|
| Роутинг (`/app/*`, `/auth/*`) | back_intergration |
| API взаимодействие | back_intergration |
| Аутентификация | back_intergration |
| Pinia Store (user, onboarding) | back_intergration |
| Новые страницы (Planner, Goals, etc.) | main |
| Вёрстка и стили | main |
| UI-компоненты | main |

---

## Конфликтные файлы

Всего 18 файлов с конфликтами:

| Файл | Тип |
|------|-----|
| `.replit` | Конфигурация |
| `package.json` | Зависимости |
| `package-lock.json` | Lock файл |
| `replit.md` | Документация |
| `vite.config.js` | Сборка |
| `src/main.js` | Точка входа |
| `src/router/index.js` | Роутинг |
| `src/stores/app.js` | State management |
| `src/components/Onboarding.vue` | Компонент |
| `src/components/Sidebar.vue` | Навигация |
| `src/views/Dashboard.vue` | Главная |
| `src/views/Login.vue` | Авторизация |
| `src/views/Register.vue` | Регистрация |
| `src/views/BalancedScorecard.vue` | ССП |
| `src/views/Goals.vue` | Декомпозиция |
| `src/views/GoalsBank.vue` | Банк целей |
| `src/views/GoalNew.vue` | Новая цель |
| `src/views/GoalEdit.vue` | Редактирование |

---

## Новые файлы из main

| Файл | Назначение |
|------|------------|
| `src/views/Planning.vue` | Страница планирования (не добавлена - дубликат Planner.vue) |
| `src/components/GuidancePanel.vue` | Панель подсказок (не добавлена) |
| `attached_assets/image_*.png` | Изображения для документации |

---

## Исправления после слияния

### 1. Обновление путей навигации

Все программные переходы (`router.push()`) обновлены с использованием нового формата `/app/*`:

#### src/views/Dashboard.vue
```diff
- <router-link to="/ssp" class="action-link">
+ <router-link to="/app/ssp" class="action-link">

- <router-link to="/goals" class="action-link">
+ <router-link to="/app/goals" class="action-link">

- <router-link to="/planner" class="action-link">
+ <router-link to="/app/planner" class="action-link">
```

#### src/views/BalancedScorecard.vue
```diff
function goToGoalsBank() {
-   router.push('/goals-bank')
+   router.push('/app/goals-bank')
}
```

#### src/views/GoalEdit.vue
```diff
- router.push('/goals')
+ router.push('/app/goals')
```
(4 места: saveGoal, goBack, deleteGoalConfirm, completeGoal)

#### src/views/GoalNew.vue
```diff
- router.push('/goals')
+ router.push('/app/goals')
```
(2 места: createGoal, goBack)

#### src/views/GoalsBank.vue
```diff
function goToDecomposition() {
-   router.push('/goals')
+   router.push('/app/goals')
}

function completeGoalsBankHandler() {
-   router.push('/goals')
+   router.push('/app/goals')
}
```

#### src/views/Goals.vue
```diff
function createNewGoalFromLesson() {
-   router.push('/goals/new')
+   router.push('/app/goals/new')
}

function createNewGoal() {
-   router.push('/goals/new')
+   router.push('/app/goals/new')
}

function editGoal(goal) {
-   router.push(`/goals/${goal.id}`)
+   router.push(`/app/goals/${goal.id}`)
}
```

---

## Итоговая структура роутов

### Публичные роуты
| Путь | Компонент | Описание |
|------|-----------|----------|
| `/` | Landing | Лендинг |
| `/auth/login` | Login | Авторизация |
| `/auth/register` | Register | Регистрация |
| `/auth/recovery` | Recovery | Восстановление пароля |
| `/auth/logout` | - | Выход (редирект) |

### Защищённые роуты (/app/*)
| Путь | Компонент | Описание |
|------|-----------|----------|
| `/app` | Dashboard | Главная |
| `/app/ssp` | BalancedScorecard | ССП модуль |
| `/app/goals` | Goals | Декомпозиция |
| `/app/goals/new` | GoalNew | Новая цель |
| `/app/goals/:id` | GoalEdit | Редактирование цели |
| `/app/goals-bank` | GoalsBank | Банк целей |
| `/app/planner` | Planner | Планировщик |
| `/app/settings` | Settings | Настройки |
| `/app/club` | Club | Клуб 1% |

### Редиректы для обратной совместимости
Старые пути автоматически перенаправляются на новые:
- `/login` → `/auth/login`
- `/ssp` → `/app/ssp`
- `/goals` → `/app/goals`
- и т.д.

---

## Сохранённая логика из back_intergration

### Аутентификация
- Cookie-based сессии с CSRF
- Bidirectional redirects (гости ↔ авторизованные)
- `guestOnly` meta-флаг для auth-страниц
- Кэширование проверки авторизации (30 сек)

### Онбординг
- Backend интеграция (`/api/rest/front/app/onboard/*`)
- Автосохранение прогресса
- Возобновление с сохранённого шага
- Development флаги (`FORCE_SHOW_ONBOARDING`)

### Store (Pinia)
- `finish_onboarding`, `finish_minitask` поля пользователя
- `shouldShowOnboarding`, `shouldShowMiniTask` computed
- Методы синхронизации с бэкендом

---

## Проверка работоспособности

После слияния и исправлений:
- Приложение запускается без ошибок
- Все навигационные ссылки используют правильные пути
- Роутер корректно обрабатывает защищённые и публичные роуты
- Редиректы работают для обратной совместимости

---

## Рекомендации

1. **Протестировать навигацию** — пройти по всем ссылкам в приложении
2. **Проверить онбординг** — убедиться что данные сохраняются
3. **Протестировать авторизацию** — login/logout/register с реальным бэкендом
4. **Запустить полный цикл** — от регистрации до создания цели

---

## Команды для финализации

```bash
# Закоммитить исправления
git add .
git commit -m "Fix navigation paths after merge: use /app/* prefix"

# Отправить на сервер
git push origin back_intergration

# После проверки — слить в main
git checkout main
git merge back_intergration
git push origin main
```
