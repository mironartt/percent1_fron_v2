# ЧТО ИСПОЛЬЗОВАТЬ - КРАТКАЯ СВОДКА

## ❌ ПРОБЛЕМА

В файле `FRONTEND_API_GUIDE.md` раздел **"2.2. Обновить привычки"** содержит **НЕПРАВИЛЬНУЮ** структуру запросов.

---

## ✅ РЕШЕНИЕ

Используйте **CORRECTED_UPDATE_ENDPOINT_DOCS.md** для endpoint `/update/`

---

## 📋 ПРАВИЛЬНАЯ СТРУКТУРА

### POST /api/app/habits/update/

**Создание:**
```json
{
    "habits_data": [{
        "name": "Зарядка",
        "icon": "strength",
        "xp_reward": 10
    }]
}
```

**Обновление:**
```json
{
    "habits_data": [{
        "habit_id": 123,
        "xp_reward": 25
    }]
}
```

**Удаление (soft):**
```json
{
    "deleted_habit_ids": [123, 456]
}
```

**Восстановление:**
```json
{
    "restored_habit_ids": [123]
}
```

**Полное удаление:**
```json
{
    "permanently_deleted_ids": [789]
}
```

---

## ⚠️ НЕТ этих полей:

- ❌ `action`
- ❌ `habits` (правильно: `habits_data`)
- ❌ `habit_ids` (правильно: `deleted_habit_ids` и т.д.)
- ❌ `permanent` (правильно: `permanently_deleted_ids`)

---

## 📁 ФАЙЛЫ

**Используйте:**
- ✅ [CORRECTED_UPDATE_ENDPOINT_DOCS.md](computer:///mnt/user-data/outputs/CORRECTED_UPDATE_ENDPOINT_DOCS.md) — Для `/update/`
- ✅ [ANSWERS_TO_FRONTEND.md](computer:///mnt/user-data/outputs/ANSWERS_TO_FRONTEND.md) — Ответы на вопросы
- ✅ Остальные разделы FRONTEND_API_GUIDE.md — правильные

**НЕ используйте:**
- ❌ FRONTEND_API_GUIDE.md раздел "2.2" — неправильная структура

---

## ✅ ОСТАЛЬНЫЕ ENDPOINTS (правильные)

Все остальные endpoints в FRONTEND_API_GUIDE.md **правильные**:
- POST /get/
- POST /completions/update/
- POST /amnesty/apply/
- POST /amnesty/revoke/
- POST /settings/get/
- POST /settings/update/
- POST /analytics/get/
- POST /achievements/get/

---

**Извинения за путаницу!** 🙏
