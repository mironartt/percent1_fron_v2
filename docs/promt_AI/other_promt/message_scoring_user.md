Проверь допустимость сообщения для чата OnePercent.
 
CONTEXT (последние сообщения, от старых к новым):
 
{{recent\_messages}}
 
CURRENT (текущее сообщение пользователя):
 
"""
 
{{user\_message}}
 
"""
 
Верни ТОЛЬКО JSON по схеме:
 
{"result": true/false, "reason": "off\_topic/medical/psychological/legal/financial/inappropriate/illegal/crisis" или null, "message": строка или null}
 
Важно:
 
\- Используй CONTEXT только для понимания смысла CURRENT.
 
\- Если можно разумно трактовать запрос как саморазвитие/привычки/цели/OnePercent — выбирай result=true.