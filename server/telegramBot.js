import { Telegraf, Markup } from 'telegraf'
import cron from 'node-cron'
import OpenAI from 'openai'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://onepercent.app'
const MODEL = 'gpt-5'

if (!BOT_TOKEN) {
  console.error('[TelegramBot] TELEGRAM_BOT_TOKEN is not set')
  process.exit(1)
}

const bot = new Telegraf(BOT_TOKEN)

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
})

const userSessions = new Map()
const journalSessions = new Map()

const JOURNAL_QUESTIONS = [
  'Что хорошего произошло сегодня? 🌟',
  'За что ты благодарен сегодня? 🙏',
  'Что можно улучшить завтра? 📈',
  'Как ты себя чувствуешь? 💭'
]

function getMainMenu() {
  return Markup.keyboard([
    ['📋 Задачи', '✅ Привычки'],
    ['📝 Дневник', '💬 Ментор'],
    ['📊 Прогресс', '⚙️ Настройки']
  ]).resize()
}

function getUserSession(userId) {
  if (!userSessions.has(userId)) {
    userSessions.set(userId, {
      linkedAccountId: null,
      mentorHistory: [],
      timezone: 'Europe/Moscow'
    })
  }
  return userSessions.get(userId)
}

bot.command('start', async (ctx) => {
  const startPayload = ctx.payload
  const userId = ctx.from.id
  const userName = ctx.from.first_name || 'друг'
  
  if (startPayload && startPayload.startsWith('auth_')) {
    const authToken = startPayload.replace('auth_', '')
    const session = getUserSession(userId)
    session.linkedAccountId = authToken
    
    await ctx.reply(
      `✅ Аккаунт успешно привязан!\n\nТеперь ты можешь использовать все функции OnePercent прямо в Telegram.`,
      getMainMenu()
    )
    return
  }
  
  const session = getUserSession(userId)
  
  if (session.linkedAccountId) {
    await ctx.reply(
      `С возвращением, ${userName}! 👋\n\nВыбери, что хочешь сделать:`,
      getMainMenu()
    )
  } else {
    await ctx.reply(
      `Привет, ${userName}! 👋\n\n` +
      `Я — бот OnePercent, твой помощник в достижении целей.\n\n` +
      `Чтобы начать, привяжи свой аккаунт:`,
      Markup.inlineKeyboard([
        [Markup.button.url('🔗 Привязать аккаунт', `${WEBAPP_URL}/settings?telegram_link=${userId}`)],
        [Markup.button.callback('❓ Узнать больше', 'about')]
      ])
    )
  }
})

bot.action('about', async (ctx) => {
  await ctx.answerCbQuery()
  await ctx.reply(
    `📱 *OnePercent — приложение для личного развития*\n\n` +
    `Что умеет бот:\n` +
    `• ✅ Отмечать привычки\n` +
    `• 📋 Просматривать и закрывать задачи\n` +
    `• 📝 Заполнять вечерний дневник\n` +
    `• 💬 Общаться с AI-ментором\n` +
    `• ⏰ Получать напоминания\n\n` +
    `Привяжи аккаунт, чтобы начать!`,
    { parse_mode: 'Markdown' }
  )
})

bot.hears('📋 Задачи', async (ctx) => {
  const session = getUserSession(ctx.from.id)
  
  if (!session.linkedAccountId) {
    await ctx.reply('Сначала привяжи аккаунт с помощью /start')
    return
  }
  
  const demoTasks = [
    { id: 1, title: 'Изучить новую главу курса', goalTitle: 'Изучить Python', completed: false },
    { id: 2, title: 'Позвонить родителям', goalTitle: 'Укрепить отношения', completed: false },
    { id: 3, title: '30 минут кардио', goalTitle: 'Здоровье', completed: true }
  ]
  
  const taskButtons = demoTasks.map(task => [
    Markup.button.callback(
      `${task.completed ? '✅' : '⬜'} ${task.title}`,
      `toggle_task_${task.id}`
    )
  ])
  
  await ctx.reply(
    `📋 *Твои задачи на сегодня:*\n\n` +
    `Выполнено: ${demoTasks.filter(t => t.completed).length}/${demoTasks.length}`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        ...taskButtons,
        [Markup.button.url('📱 Открыть в приложении', `${WEBAPP_URL}/planning`)]
      ])
    }
  )
})

bot.action(/toggle_task_(\d+)/, async (ctx) => {
  const taskId = ctx.match[1]
  await ctx.answerCbQuery(`Задача ${taskId} обновлена! +10 XP 🎉`)
  await ctx.editMessageText(
    `✅ Отлично! Задача выполнена!\n\n+10 XP 🎉`,
    Markup.inlineKeyboard([
      [Markup.button.callback('⬅️ Назад к задачам', 'back_to_tasks')]
    ])
  )
})

bot.action('back_to_tasks', async (ctx) => {
  await ctx.answerCbQuery()
  await ctx.deleteMessage()
  ctx.reply('Используй кнопку "📋 Задачи" в меню')
})

bot.hears('✅ Привычки', async (ctx) => {
  const session = getUserSession(ctx.from.id)
  
  if (!session.linkedAccountId) {
    await ctx.reply('Сначала привяжи аккаунт с помощью /start')
    return
  }
  
  const demoHabits = [
    { id: 1, name: '🏃 Зарядка', completed: false },
    { id: 2, name: '📖 Чтение 30 мин', completed: true },
    { id: 3, name: '🧘 Медитация', completed: false },
    { id: 4, name: '💧 8 стаканов воды', completed: false }
  ]
  
  const completedCount = demoHabits.filter(h => h.completed).length
  const totalCount = demoHabits.length
  const progressBar = '█'.repeat(completedCount) + '░'.repeat(totalCount - completedCount)
  
  const habitButtons = demoHabits.map(habit => [
    Markup.button.callback(
      `${habit.completed ? '✅' : '⬜'} ${habit.name}`,
      `toggle_habit_${habit.id}`
    )
  ])
  
  await ctx.reply(
    `✅ *Твои привычки на сегодня:*\n\n` +
    `Прогресс: [${progressBar}] ${completedCount}/${totalCount}`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        ...habitButtons,
        [Markup.button.callback('🔄 Обновить', 'refresh_habits')]
      ])
    }
  )
})

bot.action(/toggle_habit_(\d+)/, async (ctx) => {
  const habitId = ctx.match[1]
  await ctx.answerCbQuery(`Привычка отмечена! +10 XP 🎉`)
})

bot.action('refresh_habits', async (ctx) => {
  await ctx.answerCbQuery('Обновлено!')
})

bot.hears('📝 Дневник', async (ctx) => {
  const session = getUserSession(ctx.from.id)
  
  if (!session.linkedAccountId) {
    await ctx.reply('Сначала привяжи аккаунт с помощью /start')
    return
  }
  
  await ctx.reply(
    `📝 *Вечерняя рефлексия*\n\n` +
    `Ответь на 4 коротких вопроса, чтобы подвести итоги дня.`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('▶️ Начать', 'start_journal')],
        [Markup.button.callback('📅 История записей', 'journal_history')]
      ])
    }
  )
})

bot.action('start_journal', async (ctx) => {
  await ctx.answerCbQuery()
  const userId = ctx.from.id
  
  journalSessions.set(userId, {
    step: 0,
    answers: []
  })
  
  await ctx.reply(
    `Вопрос 1 из 4:\n\n${JOURNAL_QUESTIONS[0]}`,
    Markup.forceReply()
  )
})

bot.action('journal_history', async (ctx) => {
  await ctx.answerCbQuery()
  await ctx.reply(
    `📅 *История дневника*\n\n` +
    `Последние записи:\n` +
    `• Вчера — ✅ заполнено\n` +
    `• 2 дня назад — ✅ заполнено\n` +
    `• 3 дня назад — ❌ пропущено\n\n` +
    `🔥 Серия: 2 дня`,
    { parse_mode: 'Markdown' }
  )
})

bot.hears('💬 Ментор', async (ctx) => {
  const session = getUserSession(ctx.from.id)
  
  if (!session.linkedAccountId) {
    await ctx.reply('Сначала привяжи аккаунт с помощью /start')
    return
  }
  
  await ctx.reply(
    `💬 *AI Ментор*\n\n` +
    `Я твой персональный коуч. Могу помочь с:\n` +
    `• Постановкой и декомпозицией целей\n` +
    `• Мотивацией и поддержкой\n` +
    `• Анализом прогресса\n` +
    `• Советами по продуктивности\n\n` +
    `Просто напиши свой вопрос!`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🎯 С чего начать?', 'mentor_start')],
        [Markup.button.callback('📊 Мой прогресс', 'mentor_progress')],
        [Markup.button.callback('💪 Мотивация', 'mentor_motivation')]
      ])
    }
  )
})

bot.action('mentor_start', async (ctx) => {
  await ctx.answerCbQuery()
  await handleMentorMessage(ctx, 'С чего мне начать работу над своими целями?')
})

bot.action('mentor_progress', async (ctx) => {
  await ctx.answerCbQuery()
  await handleMentorMessage(ctx, 'Проанализируй мой прогресс и дай рекомендации')
})

bot.action('mentor_motivation', async (ctx) => {
  await ctx.answerCbQuery()
  await handleMentorMessage(ctx, 'Мне нужна мотивация, чтобы продолжать работать над целями')
})

async function handleMentorMessage(ctx, userMessage) {
  const userId = ctx.from.id
  const session = getUserSession(userId)
  
  await ctx.sendChatAction('typing')
  
  try {
    session.mentorHistory.push({ role: 'user', content: userMessage })
    
    if (session.mentorHistory.length > 10) {
      session.mentorHistory = session.mentorHistory.slice(-10)
    }
    
    const systemPrompt = `Ты — персональный AI-ментор по личному развитию в приложении OnePercent. 
Твоя задача — помогать пользователю достигать целей, формировать полезные привычки и развиваться на 1% каждый день.

Стиль общения:
- Дружелюбный, но профессиональный
- Краткий и по делу (ответы до 200 слов)
- Используй эмодзи умеренно
- Давай конкретные, actionable советы
- Поддерживай и мотивируй

Отвечай на русском языке.`
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...session.mentorHistory
      ],
      max_completion_tokens: 1024
    })
    
    const assistantMessage = response.choices?.[0]?.message?.content || 'Извини, не смог обработать запрос. Попробуй ещё раз.'
    session.mentorHistory.push({ role: 'assistant', content: assistantMessage })
    
    await ctx.reply(assistantMessage)
  } catch (error) {
    console.error('[TelegramBot] Mentor error:', error)
    await ctx.reply('Произошла ошибка при обработке запроса. Попробуй позже.')
  }
}

bot.hears('📊 Прогресс', async (ctx) => {
  const session = getUserSession(ctx.from.id)
  
  if (!session.linkedAccountId) {
    await ctx.reply('Сначала привяжи аккаунт с помощью /start')
    return
  }
  
  await ctx.reply(
    `📊 *Твой прогресс за неделю:*\n\n` +
    `🎯 Цели: 2/5 выполнено (40%)\n` +
    `✅ Привычки: 85% за неделю\n` +
    `📝 Дневник: 5/7 дней\n` +
    `⚡ XP: 450 (+120 за неделю)\n\n` +
    `🔥 *Серия:* 5 дней подряд!\n\n` +
    `Так держать! 💪`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.url('📱 Подробнее в приложении', `${WEBAPP_URL}/achievements`)]
      ])
    }
  )
})

bot.hears('⚙️ Настройки', async (ctx) => {
  await ctx.reply(
    `⚙️ *Настройки бота*`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🔔 Напоминания', 'settings_reminders')],
        [Markup.button.callback('🕐 Часовой пояс', 'settings_timezone')],
        [Markup.button.url('📱 Все настройки', `${WEBAPP_URL}/settings`)]
      ])
    }
  )
})

bot.action('settings_reminders', async (ctx) => {
  await ctx.answerCbQuery()
  await ctx.reply(
    `🔔 *Настройки напоминаний*\n\n` +
    `• Утреннее (8:00): ✅ Включено\n` +
    `• Вечернее (21:00): ✅ Включено\n` +
    `• Streak-алерты: ✅ Включено`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🌅 Утреннее: ВКЛ', 'toggle_morning')],
        [Markup.button.callback('🌆 Вечернее: ВКЛ', 'toggle_evening')],
        [Markup.button.callback('🔥 Streak: ВКЛ', 'toggle_streak')]
      ])
    }
  )
})

bot.action('settings_timezone', async (ctx) => {
  await ctx.answerCbQuery()
  await ctx.reply(
    `🕐 *Часовой пояс*\n\nТекущий: Europe/Moscow (UTC+3)\n\nВыбери свой часовой пояс:`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🇷🇺 Москва (UTC+3)', 'tz_moscow')],
        [Markup.button.callback('🇷🇺 Екатеринбург (UTC+5)', 'tz_ekb')],
        [Markup.button.callback('🇷🇺 Новосибирск (UTC+7)', 'tz_nsk')],
        [Markup.button.callback('🇷🇺 Владивосток (UTC+10)', 'tz_vlad')]
      ])
    }
  )
})

bot.on('text', async (ctx) => {
  const userId = ctx.from.id
  const text = ctx.message.text
  
  if (journalSessions.has(userId)) {
    const journalSession = journalSessions.get(userId)
    journalSession.answers.push(text)
    journalSession.step++
    
    if (journalSession.step < JOURNAL_QUESTIONS.length) {
      await ctx.reply(
        `Вопрос ${journalSession.step + 1} из 4:\n\n${JOURNAL_QUESTIONS[journalSession.step]}`,
        Markup.forceReply()
      )
    } else {
      journalSessions.delete(userId)
      
      await ctx.reply(
        `✅ *Дневник заполнен!*\n\n` +
        `Отличная работа! Ты получил +15 XP 🎉\n\n` +
        `🔥 Серия: 3 дня подряд!`,
        {
          parse_mode: 'Markdown',
          ...getMainMenu()
        }
      )
    }
    return
  }
  
  const session = getUserSession(userId)
  if (session.linkedAccountId) {
    await handleMentorMessage(ctx, text)
  }
})

async function sendMorningReminder(userId, userName) {
  try {
    await bot.telegram.sendMessage(
      userId,
      `🌅 Доброе утро, ${userName}!\n\n` +
      `Сегодня отличный день, чтобы стать на 1% лучше.\n\n` +
      `📋 У тебя 3 задачи на сегодня\n` +
      `✅ 4 привычки ждут выполнения\n\n` +
      `Готов начать?`,
      {
        ...Markup.inlineKeyboard([
          [Markup.button.callback('📋 Посмотреть задачи', 'show_tasks')],
          [Markup.button.callback('✅ Отметить привычки', 'show_habits')]
        ])
      }
    )
  } catch (error) {
    console.error(`[TelegramBot] Failed to send morning reminder to ${userId}:`, error)
  }
}

async function sendEveningReminder(userId, userName) {
  try {
    await bot.telegram.sendMessage(
      userId,
      `🌆 Добрый вечер, ${userName}!\n\n` +
      `Время подвести итоги дня 📝\n\n` +
      `Заполни дневник и сохрани свою серию!`,
      {
        ...Markup.inlineKeyboard([
          [Markup.button.callback('📝 Заполнить дневник', 'start_journal')],
          [Markup.button.callback('⏭️ Пропустить', 'skip_journal')]
        ])
      }
    )
  } catch (error) {
    console.error(`[TelegramBot] Failed to send evening reminder to ${userId}:`, error)
  }
}

async function sendStreakWarning(userId, userName, streakDays) {
  try {
    await bot.telegram.sendMessage(
      userId,
      `🔥 ${userName}, не потеряй свою серию!\n\n` +
      `У тебя ${streakDays} дней подряд.\n` +
      `До конца дня осталось 2 часа!\n\n` +
      `Заполни дневник, чтобы сохранить серию.`,
      {
        ...Markup.inlineKeyboard([
          [Markup.button.callback('📝 Заполнить сейчас', 'start_journal')]
        ])
      }
    )
  } catch (error) {
    console.error(`[TelegramBot] Failed to send streak warning to ${userId}:`, error)
  }
}

async function sendXPNotification(userId, amount, reason) {
  try {
    await bot.telegram.sendMessage(
      userId,
      `⚡ +${amount} XP!\n\n${reason}`
    )
  } catch (error) {
    console.error(`[TelegramBot] Failed to send XP notification to ${userId}:`, error)
  }
}

async function sendAchievementUnlocked(userId, achievementName, achievementIcon) {
  try {
    await bot.telegram.sendMessage(
      userId,
      `🏆 *Новое достижение!*\n\n` +
      `${achievementIcon} ${achievementName}\n\n` +
      `Поздравляем! Так держать! 🎉`,
      { parse_mode: 'Markdown' }
    )
  } catch (error) {
    console.error(`[TelegramBot] Failed to send achievement notification to ${userId}:`, error)
  }
}

cron.schedule('0 8 * * *', async () => {
  console.log('[TelegramBot] Running morning reminders...')
  for (const [userId, session] of userSessions) {
    if (session.linkedAccountId) {
      await sendMorningReminder(userId, 'друг')
    }
  }
}, { timezone: 'Europe/Moscow' })

cron.schedule('0 21 * * *', async () => {
  console.log('[TelegramBot] Running evening reminders...')
  for (const [userId, session] of userSessions) {
    if (session.linkedAccountId) {
      await sendEveningReminder(userId, 'друг')
    }
  }
}, { timezone: 'Europe/Moscow' })

cron.schedule('0 22 * * *', async () => {
  console.log('[TelegramBot] Running streak warnings...')
}, { timezone: 'Europe/Moscow' })

cron.schedule('0 20 * * 0', async () => {
  console.log('[TelegramBot] Sending weekly reports...')
}, { timezone: 'Europe/Moscow' })

bot.launch()
  .then(() => {
    console.log('[TelegramBot] Bot started successfully')
  })
  .catch((error) => {
    console.error('[TelegramBot] Failed to start bot:', error)
  })

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

export { bot, sendMorningReminder, sendEveningReminder, sendStreakWarning, sendXPNotification, sendAchievementUnlocked }
