<template>
  <div class="min-h-screen bg-slate-50 font-sans selection:bg-brand-200 selection:text-brand-900">
    <!-- Header -->
    <header :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 py-3' : 'py-6'
    ]">
      <div class="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="https://percent1.ru/" class="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div class="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-brand-200">
            1%
          </div>
          <span class="font-extrabold text-xl tracking-tight text-slate-900">OnePercent</span>
        </a>

        <nav class="hidden md:flex gap-8 font-semibold text-sm text-slate-600 items-center">
          <a href="#how-it-works" class="hover:text-brand-600 transition">Как это работает</a>
          <a href="#pricing" class="hover:text-brand-600 transition">Тарифы</a>
        </nav>

        <div class="hidden md:flex items-center gap-6">
          <router-link to="/login" class="font-bold text-slate-600 hover:text-brand-600 transition text-sm">
            Войти
          </router-link>
          <router-link to="/register" class="bg-brand-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-brand-700 transition shadow-lg shadow-brand-200 text-base transform hover:-translate-y-0.5">
            Начать
          </router-link>
        </div>

        <button class="md:hidden p-2 text-slate-600" @click="mobileMenuOpen = !mobileMenuOpen">
          <svg v-if="!mobileMenuOpen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div v-if="mobileMenuOpen" class="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-4 shadow-xl flex flex-col gap-4 animate-in slide-in-from-top-2">
        <a href="#how-it-works" class="text-base font-semibold text-slate-700 py-2" @click="mobileMenuOpen = false">Как это работает</a>
        <a href="#pricing" class="text-base font-semibold text-slate-700 py-2" @click="mobileMenuOpen = false">Тарифы</a>
        <div class="h-px bg-slate-100 my-2"></div>
        <div class="flex flex-col gap-3">
          <router-link to="/login" class="text-center font-bold text-slate-600 py-2">Войти</router-link>
          <router-link to="/register" class="w-full bg-brand-600 text-center text-white py-3.5 rounded-xl font-bold shadow-lg shadow-brand-200 text-base">Начать</router-link>
        </div>
      </div>
    </header>

    <main>
      <!-- Hero Section -->
      <section class="relative pt-28 lg:pt-32 pb-12 lg:pb-16 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-brand-50 via-slate-50 to-slate-50 overflow-hidden">
        <div class="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div class="inline-block px-4 py-1.5 bg-brand-100 text-brand-700 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-brand-200">
            Личный AI наставник
          </div>

          <h1 class="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-[1.1] text-slate-900">
            Системный рост в жизни <br />
            <span class="text-gradient text-4xl md:text-5xl lg:text-6xl">через простые действия</span>
          </h1>

          <p class="text-slate-500 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Система, которая делает развитие предсказуемым. <br class="hidden md:block"/>
            Стань сильнее в 38 раз за один год.
          </p>
          
          <div class="flex flex-col md:flex-row items-center justify-center gap-6">
            <router-link 
              to="/register" 
              class="w-full md:w-auto bg-brand-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition duration-300 shadow-2xl shadow-brand-300"
            >
              Сделать +1% уже сегодня
            </router-link>
            <div class="flex items-center gap-3 text-slate-400 text-sm font-medium">
              <div class="flex -space-x-2">
                <div v-for="i in 3" :key="i" class="w-8 h-8 rounded-full bg-slate-200 border-2 border-white overflow-hidden">
                  <img :src="`https://picsum.photos/seed/${i + 45}/100/100`" alt="User" class="w-full h-full object-cover" />
                </div>
              </div>
              <span>2,847+ человек уже растут</span>
            </div>
          </div>

          <!-- Calculator (hidden for now) -->
          <div v-if="false" id="method" class="max-w-xl mx-auto bg-white rounded-[32px] p-8 md:p-12 shadow-2xl shadow-slate-200/40 border border-slate-100 text-left">
            <div class="flex justify-between items-start mb-10">
              <div>
                <h3 class="font-black text-3xl mb-2 text-slate-900">Эффект 1%</h3>
                <p class="text-slate-400 font-medium">Сложные проценты в жизни</p>
              </div>
              <div class="text-6xl font-black text-brand-500 tracking-tighter">x{{ multiplier }}</div>
            </div>
            
            <div class="mb-10">
              <input 
                type="range" 
                min="1" 
                max="365"
                step="1"
                v-model="days"
                class="modern-range"
              />
              <div class="flex justify-between mt-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>{{ days }} дней усилий</span>
                <span>Результат</span>
              </div>
            </div>

            <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p class="text-lg font-medium text-slate-800 italic leading-relaxed">
                "{{ effectDescription }}"
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ProblemSolution Section -->
      <section class="py-12 md:py-20 bg-white relative z-20 rounded-t-[2.5rem] md:rounded-t-[4rem] shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)]">
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-12">
            <h2 class="text-2xl md:text-3xl font-bold text-slate-900">
              Знакомые ситуации?
            </h2>
          </div>

          <div class="grid md:grid-cols-3 gap-6">
            <div 
              v-for="(card, idx) in problemCards" 
              :key="idx" 
              :class="[
                'p-6 md:p-8 rounded-3xl bg-white border shadow-lg shadow-slate-200/40 hover:-translate-y-1 transition-transform duration-300 flex flex-col items-center text-center md:items-start md:text-left group',
                card.borderColor
              ]"
            >
              <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300', card.color]">
                <component :is="card.icon" class="w-7 h-7" :stroke-width="2" />
              </div>
              <p class="text-lg font-bold text-slate-800 leading-snug">
                {{ card.text }}
              </p>
            </div>
          </div>

          <div class="flex justify-center mt-12 opacity-30">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 animate-bounce text-slate-400"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
          </div>
        </div>
      </section>

      <!-- Math Section (hidden for now) -->
      <section v-if="false" class="py-24 bg-white">
        <div class="max-w-5xl mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-6">Математика успеха</h2>
            <p class="text-lg text-slate-500 max-w-2xl mx-auto">
              Улучшая себя всего на 1% каждый день, к концу года вы станете в 37 раз эффективнее. 
              Это сила сложного процента, примененная к привычкам.
            </p>
          </div>

          <div class="grid md:grid-cols-2 gap-8 items-center justify-center">
            <div class="bento-card bg-slate-50 border-slate-200">
              <p class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Линейное мышление</p>
              <div class="text-6xl font-mono font-bold text-slate-300 mb-4 tracking-tighter">
                1.00<span class="text-xl align-top text-slate-400">365</span>
              </div>
              <p class="text-3xl font-bold text-slate-400 mb-2">= 1.00</p>
              <p class="mt-6 text-sm font-medium text-slate-500">
                Делая одно и то же каждый день, вы остаетесь на том же месте. Отсутствие прогресса — это регресс.
              </p>
            </div>

            <div class="bento-card bg-brand-600 border-brand-500 text-white shadow-xl shadow-brand-500/20 transform md:scale-105">
              <p class="text-xs font-bold uppercase tracking-wider text-brand-200 mb-4">Метод OnePercent</p>
              <div class="text-6xl font-mono font-bold text-white mb-4 tracking-tighter">
                1.01<span class="text-xl align-top text-brand-200">365</span>
              </div>
              <p class="text-3xl font-bold text-white mb-2">= 37.78</p>
              <p class="mt-6 text-sm font-medium text-brand-100">
                Маленькие ежедневные улучшения накапливаются, создавая лавину положительных изменений.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-16 md:py-20 bg-slate-50 overflow-hidden" id="how-it-works">
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-16 max-w-3xl mx-auto">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold uppercase tracking-wider mb-6 shadow-sm text-brand-600">
              <Sparkles class="w-3 h-3" />
              <span>Как это работает</span>
            </div>
            <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight">
              От хаоса к порядку <br/> <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">за 6 простых шагов</span>
            </h2>
            <p class="text-lg text-slate-500 leading-relaxed">
              Мы убрали всё лишнее. Оставили только научный подход, дофаминовую подпитку и четкие алгоритмы.
            </p>
          </div>

          <div class="space-y-20 md:space-y-24">
            <div 
              v-for="(step, index) in featureSteps" 
              :key="step.id" 
              :class="['flex flex-col gap-12 items-center', index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse']"
            >
              <!-- Text Section -->
              <div class="flex-1 space-y-8">
                <div class="inline-block px-4 py-1.5 rounded-lg bg-slate-100 text-slate-500 font-bold text-sm">
                  {{ step.subtitle }}
                </div>
                <h3 class="text-2xl md:text-3xl font-bold text-slate-900">
                  {{ step.title }}
                </h3>
                
                <div v-if="step.id === 6" class="space-y-6">
                  <p class="text-lg text-slate-600 leading-relaxed font-medium">
                    XP = валюта для твоих желаний. Ты сам выбираешь награды и цену в XP.
                  </p>
                  <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
                    <div class="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-brand-500 to-purple-500"></div>
                    <h4 class="font-bold text-slate-900 mb-4 flex items-center gap-2 text-lg">
                      Как работает система наград:
                    </h4>
                    <div class="text-base text-slate-600 leading-relaxed space-y-3 relative z-10">
                      <div class="flex gap-3">
                        <span class="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs">1</span>
                        <p>В начале месяца составь список желаний</p>
                      </div>
                      <div class="flex gap-3">
                        <span class="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs">2</span>
                        <p>Назначь цену в XP (1 XP ≈ 10₽)</p>
                      </div>
                      <div class="flex gap-3">
                        <span class="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs">3</span>
                        <p>Выполняй привычки, копи XP</p>
                      </div>
                      <div class="pl-9 pt-1">
                        <p class="font-bold text-brand-600 bg-brand-50 inline-block px-3 py-1 rounded-lg">Достиг цели — порадуй себя без вины</p>
                      </div>
                    </div>
                  </div>
                </div>
                <p v-else class="text-lg text-slate-600 leading-relaxed">
                  {{ step.description }}
                </p>

                <div class="flex items-center gap-4 pt-4">
                  <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm', step.color]">
                    <component :is="step.icon" class="w-6 h-6" />
                  </div>
                  <div class="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    OnePercent System
                  </div>
                </div>
              </div>

              <!-- Visual Section -->
              <div class="flex-1 w-full">
                <div :class="['relative rounded-3xl p-1 ring-1 ring-slate-900/5 shadow-2xl', `bg-gradient-to-br ${step.gradient}`]">
                  <div class="bg-white/80 backdrop-blur-sm rounded-[20px] overflow-hidden border border-white/50 min-h-[320px] md:min-h-[400px] flex flex-col">
                    
                    <div class="h-10 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2">
                      <div class="flex gap-1.5">
                        <div class="w-3 h-3 rounded-full bg-slate-200"></div>
                        <div class="w-3 h-3 rounded-full bg-slate-200"></div>
                        <div class="w-3 h-3 rounded-full bg-slate-200"></div>
                      </div>
                      <div class="ml-4 bg-white px-3 py-1 rounded text-[10px] text-slate-400 font-medium border border-slate-100 shadow-sm flex-1 text-center">
                        OnePercent AI
                      </div>
                    </div>

                    <div class="flex-1 p-6 md:p-8 flex items-center justify-center bg-slate-50/50 relative overflow-hidden">
                      <div :class="['absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-20 blur-3xl pointer-events-none', `bg-gradient-to-br ${step.gradient}`]"></div>

                      <div class="relative w-full z-10 flex justify-center">
                        <!-- Step 1: Wheel of Life -->
                        <div v-if="step.id === 1" class="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 w-full max-w-md">
                          <WheelOfLifeMockup />
                        </div>

                        <!-- Step 2: AI Goals Chat -->
                        <div v-else-if="step.id === 2" class="space-y-4 max-w-md w-full">
                          <div class="flex gap-4 items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                              <TrendingUp class="w-5 h-5 text-orange-600"/>
                            </div>
                            <div class="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 text-sm text-slate-600">
                              <p>Диагностика: Доход 100к ₽, накопления 0 ₽. Финансы — зона риска.</p>
                            </div>
                          </div>
                          <div class="flex gap-4 items-start flex-row-reverse animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                            <div class="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 border-2 border-white">
                              <img src="https://picsum.photos/seed/user/100/100" alt="Me" />
                            </div>
                            <div class="bg-brand-600 p-4 rounded-2xl rounded-tr-none shadow-md text-sm text-white">
                              <p>Хочу накопить 300 000 ₽, но деньги "утекают" к концу месяца.</p>
                            </div>
                          </div>
                          <div class="flex gap-4 items-start animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
                            <div class="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                              <Target class="w-5 h-5 text-brand-600"/>
                            </div>
                            <div class="bg-white p-4 rounded-2xl rounded-tl-none shadow-lg border border-brand-100 text-sm relative overflow-hidden">
                              <div class="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                              <p class="font-bold text-slate-900 mb-1">Цель сформирована:</p>
                              <p class="text-slate-600">"Откладывать 20% (20 000 ₽) в день зарплаты. Накопить 300к за 15 месяцев."</p>
                            </div>
                          </div>
                        </div>

                        <!-- Step 3: Decomposition -->
                        <div v-else-if="step.id === 3" class="max-w-sm w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                          <div class="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <span class="font-bold text-slate-700">План: Финансовая дисциплина</span>
                            <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">Активен</span>
                          </div>
                          <div class="p-4 space-y-6">
                            <div class="relative pl-6 border-l-2 border-slate-200">
                              <div class="absolute -left-[9px] top-0 w-4 h-4 bg-brand-600 rounded-full border-4 border-white shadow-sm"></div>
                              <p class="text-xs text-slate-400 font-bold uppercase mb-1">Неделя 1: Аудит</p>
                              <p class="text-sm font-medium text-slate-800">Установить трекер расходов. Записать каждую трату, даже кофе.</p>
                            </div>
                            <div class="relative pl-6 border-l-2 border-slate-200">
                              <div class="absolute -left-[9px] top-0 w-4 h-4 bg-slate-300 rounded-full border-4 border-white"></div>
                              <p class="text-xs text-slate-400 font-bold uppercase mb-1">Неделя 2: Оптимизация</p>
                              <p class="text-sm font-medium text-slate-800">Найти "дыры" (подписки, такси). Сократить расходы на 5000 ₽.</p>
                            </div>
                            <div class="relative pl-6 border-l-2 border-slate-200">
                              <div class="absolute -left-[9px] top-0 w-4 h-4 bg-slate-300 rounded-full border-4 border-white"></div>
                              <p class="text-xs text-slate-400 font-bold uppercase mb-1">Неделя 3-4: Автоматизация</p>
                              <p class="text-sm font-medium text-slate-800">Настроить автоплатеж 20 000 ₽ на накопительный счет в день ЗП.</p>
                            </div>
                          </div>
                        </div>

                        <!-- Step 4: Focus Day -->
                        <div v-else-if="step.id === 4" class="max-w-sm w-full">
                          <div class="text-center mb-6">
                            <div class="inline-block px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold mb-2">Сегодня</div>
                            <div class="text-3xl font-black text-slate-800">08:00 AM</div>
                          </div>
                          <div class="bg-white p-6 rounded-3xl shadow-2xl shadow-brand-500/20 border border-brand-100 transform hover:scale-105 transition duration-300 cursor-pointer relative group">
                            <div class="absolute top-4 right-4 w-6 h-6 rounded-full border-2 border-brand-200 flex items-center justify-center group-hover:bg-brand-500 group-hover:border-brand-500 transition-colors">
                              <CheckSquare class="w-3 h-3 text-white opacity-0 group-hover:opacity-100" />
                            </div>
                            <p class="text-xs text-brand-500 font-bold uppercase tracking-wider mb-2">Главный фокус</p>
                            <h4 class="text-xl font-bold text-slate-900 mb-2">Медленный бег</h4>
                            <p class="text-slate-500 text-sm mb-4">Зона 2 пульса, 30 минут. Не ускоряться.</p>
                            <div class="flex items-center gap-2">
                              <span class="px-2 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded">+150 XP</span>
                              <span class="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded">Здоровье</span>
                            </div>
                          </div>
                        </div>

                        <!-- Step 5: Habits -->
                        <div v-else-if="step.id === 5" class="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                          <div class="bg-slate-50/80 backdrop-blur-sm p-4 border-b border-slate-100 flex justify-between items-center">
                            <div class="flex items-center gap-2.5">
                              <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                <Repeat class="w-4 h-4" />
                              </div>
                              <span class="font-bold text-slate-700 text-sm">Трекер привычек</span>
                            </div>
                            <div class="px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-[10px] font-bold text-slate-500 shadow-sm flex items-center gap-1.5">
                              <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                              Сегодня
                            </div>
                          </div>
                          
                          <div class="p-4 space-y-3 bg-white">
                            <div v-for="(habit, hIdx) in habitsMockup" :key="hIdx" class="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex flex-col gap-3 group hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all duration-300">
                              <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                  <div :class="['w-8 h-8 rounded-full flex items-center justify-center shrink-0', habit.iconBg]">
                                    <component :is="habit.icon" :size="16" :class="habit.iconColor" />
                                  </div>
                                  <span :class="['font-bold text-sm', habit.done ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-700']">{{ habit.name }}</span>
                                </div>
                                <span :class="['text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full whitespace-nowrap', habit.done ? 'opacity-50' : '']">+{{ habit.xp }} XP</span>
                              </div>
                              <div :class="['flex justify-between items-center pt-1', habit.done ? 'opacity-60' : '']">
                                <div class="flex gap-1">
                                  <div 
                                    v-for="(d, i) in ['П','В','С','Ч','П','С','В']" 
                                    :key="i" 
                                    :class="[
                                      'w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all',
                                      habit.activeDays.includes(i) ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200' : 'bg-white text-slate-300',
                                      habit.currentDay === i ? 'ring-2 ring-indigo-500 ring-offset-1' : ''
                                    ]"
                                  >
                                    {{ d }}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Step 6: Gamification -->
                        <div v-else-if="step.id === 6" class="w-full max-w-md mx-auto">
                          <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden p-6">
                            <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full text-xs font-bold text-emerald-600 mb-4">
                              <Sparkles class="w-3 h-3" />
                              <span>Прошло 3 месяца. 2450 XP заработано.</span>
                            </div>
                            
                            <div class="bg-gradient-to-br from-brand-600 to-purple-600 rounded-2xl p-5 mb-4">
                              <p class="text-xs font-bold text-brand-200 uppercase tracking-wider mb-1">ТВОЙ БАЛАНС</p>
                              <p class="text-4xl font-black text-white">2450 <span class="text-xl">XP</span></p>
                            </div>

                            <div class="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                              <div class="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
                                <MessageCircle class="w-4 h-4 text-white" />
                              </div>
                              <p class="text-xs text-slate-600 leading-relaxed">
                                <span class="font-bold text-brand-600">AI Ментор:</span> Максим, хватает на новую игру! Это не противоречит цели "Спорт". Отдых важен.
                              </p>
                            </div>

                            <div class="space-y-2">
                              <div class="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
                                <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                  <Check class="w-4 h-4 text-slate-400" />
                                </div>
                                <div class="flex-1">
                                  <p class="text-sm font-bold text-slate-700">Вечер кино</p>
                                  <p class="text-xs text-slate-400">500 XP</p>
                                </div>
                                <span class="text-xs text-slate-400">Получено</span>
                              </div>
                              <div class="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                                <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                  <Zap class="w-4 h-4 text-white" />
                                </div>
                                <div class="flex-1">
                                  <p class="text-sm font-bold text-slate-700">Новая игра</p>
                                  <p class="text-xs text-slate-400">1500 XP</p>
                                </div>
                                <button class="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-lg">Доступно!</button>
                              </div>
                              <div class="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
                                <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                  <Map class="w-4 h-4 text-slate-500" />
                                </div>
                                <div class="flex-1">
                                  <p class="text-sm font-bold text-slate-700">Поездка</p>
                                  <p class="text-xs text-slate-400">5000 XP</p>
                                </div>
                                <span class="text-sm font-bold text-slate-500">49%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- AI Mentor Section -->
      <section class="py-16 md:py-20 bg-white overflow-hidden relative">
        <div class="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-brand-50/50 rounded-full blur-3xl -z-10 pointer-events-none opacity-60"></div>

        <div class="max-w-7xl mx-auto px-6">
          <div class="flex justify-center mb-16 md:mb-20">
            <div class="bg-emerald-50/80 backdrop-blur-sm border border-emerald-100 rounded-full px-6 py-3 text-center shadow-sm">
              <p class="text-sm md:text-base text-emerald-800">
                <span class="font-bold bg-emerald-200/50 px-2 py-0.5 rounded-md mr-1">Проблема:</span> 68% бросают после 3 месяцев. 
                <span class="mx-2 text-emerald-300">|</span>
                <span class="font-bold bg-emerald-200/50 px-2 py-0.5 rounded-md mr-1">Решение:</span> AI Ментор поддерживает каждый день.
              </p>
            </div>
          </div>

          <div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div class="order-2 lg:order-1">
              <div class="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 border border-brand-100 rounded-full text-xs font-bold uppercase tracking-wider mb-6 text-brand-600">
                <MessageCircle class="w-3 h-3" />
                <span>Всегда рядом</span>
              </div>

              <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-[1.1]">
                Персональный коуч <br/> на связи
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600 ml-3">24/7</span>
              </h2>
              
              <p class="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg">
                AI анализирует твои цели, рефлексии и паттерны. Задаёт правильные вопросы, чтобы ты сам нашёл ответы, когда мотивация на нуле.
              </p>

              <div class="relative pl-4 mb-12 space-y-8">
                <div class="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-brand-200 via-brand-100 to-transparent"></div>

                <div v-for="(role, rIdx) in mentorRoles" :key="rIdx" class="relative flex gap-5 items-start group">
                  <div :class="[
                    'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-all duration-300',
                    role.active 
                      ? 'bg-gradient-to-br from-brand-600 to-purple-600 shadow-lg shadow-brand-500/30 transform scale-105' 
                      : 'bg-white border-2 border-slate-100 shadow-sm group-hover:border-brand-200 group-hover:scale-105'
                  ]">
                    <component :is="role.icon" :class="['w-6 h-6', role.active ? 'text-white' : 'text-slate-400 group-hover:text-brand-600 transition-colors']" />
                  </div>
                  <div>
                    <h4 class="font-bold text-slate-900 text-lg">{{ role.title }}</h4>
                    <p class="text-xs font-bold text-brand-500 uppercase tracking-wider mb-1">{{ role.period }}</p>
                    <p class="text-slate-500 text-sm leading-relaxed">{{ role.description }}</p>
                  </div>
                </div>
              </div>

              <div class="hidden lg:flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div class="text-4xl leading-none text-brand-300 font-serif opacity-50">"</div>
                <div>
                  <p class="text-slate-700 italic mb-3 font-medium text-base leading-relaxed">
                    AI ментор — главная причина, почему я не бросил. Он не давит, а реально помогает разобраться в себе и мягко возвращает фокус, когда опускаются руки.
                  </p>
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-slate-300 overflow-hidden">
                      <img src="https://picsum.photos/seed/sergey/100/100" alt="Avatar" class="w-full h-full object-cover" />
                    </div>
                    <p class="font-bold text-slate-900 text-sm">Сергей, e-commerce</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Phone Mockup -->
            <div class="order-1 lg:order-2 flex flex-col items-center relative perspective-1000">
              <div class="relative animate-float">
                <div class="absolute -bottom-10 left-10 right-10 h-8 bg-black/20 blur-xl rounded-[100%]"></div>
                
                <div class="relative w-[320px] md:w-[340px] h-[660px] bg-slate-900 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(50,50,93,0.25),0_30px_60px_-30px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.1)] border-[10px] border-slate-900 overflow-hidden ring-1 ring-white/10">
                  <div class="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none z-30"></div>
                  <div class="absolute top-0 w-full h-7 bg-slate-900 z-20 flex justify-center items-end pb-1">
                    <div class="w-20 h-4 bg-black rounded-full"></div>
                  </div>

                  <div class="bg-[#517da2] p-4 pt-10 text-white flex items-center gap-3 shadow-md relative z-10">
                    <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center p-0.5 ring-2 ring-white/20">
                      <img src="https://api.dicebear.com/7.x/bottts/svg?seed=OnePercent" alt="AI" class="w-full h-full rounded-full bg-slate-100" />
                    </div>
                    <div>
                      <h4 class="font-bold text-base leading-tight">AI Ментор 1%</h4>
                      <p class="text-xs text-blue-100 opacity-90">bot</p>
                    </div>
                  </div>

                  <div class="bg-[#8e9eab] bg-gradient-to-br from-[#eef2f3] to-[#8e9eab] h-full overflow-y-auto p-3 space-y-4 pb-20 font-sans text-sm relative">
                    <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(#444 1px, transparent 1px); background-size: 20px 20px;"></div>
                    
                    <div class="bg-white p-3.5 rounded-2xl rounded-tl-sm shadow-sm max-w-[95%] text-slate-800 relative z-10 leading-snug">
                      <p class="mb-2.5">Доброе утро, Максим! <br/> Сегодня — вторник.</p>
                      <p class="font-bold mb-1.5 text-brand-900">Задачи на сегодня:</p>
                      <ul class="space-y-1.5 mb-3">
                        <li class="flex items-start gap-2">
                          <span class="mt-0.5 shrink-0">🎨</span>
                          <span>Первая проба хобби [→ Хобби 2ч в неделю]</span>
                        </li>
                        <li class="flex items-start gap-2">
                          <span class="text-red-500 mt-0.5 shrink-0">❤</span>
                          <span>Вечер с семьёй [→ Вечер с семьёй 3х в неделю]</span>
                        </li>
                      </ul>
                      
                      <p class="font-bold mb-1.5 mt-3 text-brand-900">Привычки:</p>
                      <ul class="space-y-1.5 text-slate-600 text-xs">
                        <li class="flex items-center gap-2"><div class="w-1.5 h-1.5 bg-brand-500 rounded-full"></div> Хобби 2ч/неделю</li>
                        <li class="flex items-center gap-2"><div class="w-1.5 h-1.5 bg-brand-500 rounded-full"></div> Финансовый обзор</li>
                        <li class="flex items-center gap-2"><div class="w-1.5 h-1.5 bg-brand-500 rounded-full"></div> Ужин с семьёй</li>
                      </ul>

                      <p class="mt-3 pt-3 border-t border-slate-100 text-slate-600 italic">
                        Обрати внимание: у тебя есть просроченная задача «Выбрать хобби на неделю» — возможно, стоит начать с неё.
                      </p>

                      <div class="text-[10px] text-slate-400 text-right mt-1.5 font-medium">08:00</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="lg:hidden mt-12 text-center max-w-sm">
                <p class="text-slate-600 italic mb-4 font-medium">
                  "AI ментор — главная причина, почему я не бросил. Он не давит, а реально помогает разобраться в себе."
                </p>
                <p class="font-bold text-slate-900 text-sm">
                  — Сергей, e-commerce
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Final CTA Section -->
      <section class="py-16 md:py-20 bg-gradient-to-br from-brand-600 to-purple-700 relative overflow-hidden text-white">
        <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div class="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-brand-500 rounded-full mix-blend-overlay filter blur-[128px] opacity-30 animate-pulse"></div>
          <div class="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-overlay filter blur-[128px] opacity-30"></div>
        </div>

        <div class="max-w-5xl mx-auto px-6 relative z-10">
          <h2 class="text-3xl md:text-4xl font-black text-center mb-10 md:mb-12 leading-tight drop-shadow-sm">
            Ты прошёл путь <br class="md:hidden"/> от диагностики до результата
          </h2>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
            <div 
              v-for="(item, i) in ctaItems" 
              :key="i" 
              class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 md:p-6 flex items-center gap-4 hover:bg-white/20 transition duration-300 shadow-lg shadow-brand-900/10 group"
            >
              <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 ring-1 ring-white/30">
                <Check class="w-5 h-5 text-white" :stroke-width="3" />
              </div>
              <span class="font-medium text-lg leading-snug tracking-tight text-white/95">{{ item }}</span>
            </div>
          </div>

          <div class="flex flex-col items-center gap-8">
            <router-link 
              to="/register" 
              class="w-full md:w-auto bg-white text-brand-700 px-8 py-5 rounded-2xl font-black text-lg md:text-xl hover:scale-105 hover:shadow-2xl hover:shadow-white/20 transition duration-300 flex items-center justify-center gap-3 group"
            >
              Начать бесплатно — диагностика за 2 минуты
              <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </router-link>

            <div class="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-sm font-medium text-brand-100/90">
              <div class="flex items-center gap-2">
                <Check class="w-4 h-4" />
                <span>Без банковской карты</span>
              </div>
              <div class="flex items-center gap-2">
                <Check class="w-4 h-4" />
                <span>Отменить можно в 1 клик</span>
              </div>
            </div>

            <div class="mt-4 bg-brand-800/30 backdrop-blur-md border border-white/10 rounded-full pl-4 pr-6 py-2 flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <span class="animate-pulse">🔥</span>
              <span><span class="font-bold text-white">2 847</span> человек уже растут на 1% каждый день</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Testimonials Section -->
      <section class="py-16 md:py-20 bg-white border-t border-slate-100">
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-6">Проверено временем</h2>
            <p class="text-lg text-slate-500 max-w-2xl mx-auto">
              Величайшие умы истории использовали системный подход к развитию задолго до нас
            </p>
          </div>

          <div class="grid md:grid-cols-2 gap-8">
            <div 
              v-for="(person, idx) in testimonials" 
              :key="idx" 
              class="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row gap-6 items-start group"
            >
              <div class="shrink-0">
                <div class="w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-200 group-hover:scale-110 transition-transform duration-300">
                  <component :is="person.icon" class="w-8 h-8 text-white" :stroke-width="1.5" />
                </div>
              </div>

              <div class="flex-1">
                <h3 class="text-xl font-bold text-slate-900 mb-1">{{ person.name }}</h3>
                <p class="text-sm text-slate-500 mb-4">{{ person.role }}</p>
                
                <div class="flex gap-3 mb-4">
                  <Quote class="w-5 h-5 text-brand-400 fill-brand-100 shrink-0 transform scale-x-[-1]" />
                  <p class="text-slate-800 font-medium italic leading-relaxed">
                    «{{ person.quote }}»
                  </p>
                </div>
                
                <p class="text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
                  {{ person.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Pricing Section -->
      <section class="py-16 md:py-20 bg-slate-50 relative overflow-hidden" id="pricing">
        <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div class="absolute top-1/2 left-0 w-96 h-96 bg-brand-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>
          <div class="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>
        </div>

        <div class="max-w-7xl mx-auto px-6 relative z-10">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-black text-slate-900 mb-4">Простая и честная стоимость</h2>
            <p class="text-lg text-slate-500">Без скрытых платежей. Отмена в любой момент.</p>
          </div>

          <div v-if="pricingTerms.length > 0" class="flex flex-wrap justify-center gap-3 md:gap-4 mb-16">
            <button
              v-for="term in pricingTerms"
              :key="term.id"
              @click="selectTerm(term.id)"
              :class="[
                'relative px-5 py-3 md:px-6 rounded-2xl font-bold transition-all duration-300 border-2 text-sm md:text-base',
                selectedTerm?.id === term.id 
                  ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-500/30 transform scale-105' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-brand-200 hover:bg-slate-50'
              ]"
            >
              {{ term.title }}
              <span 
                v-if="term.discount > 0" 
                :class="[
                  'absolute -top-2.5 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm transition-colors',
                  selectedTerm?.id === term.id ? 'bg-white text-brand-600' : 'bg-emerald-500 text-white'
                ]"
              >
                -{{ term.discount }}%
              </span>
              <span v-if="term.is_hit" class="absolute -top-6 -right-6 md:-right-8 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md transform rotate-12 shadow-sm">
                ХИТ
              </span>
            </button>
          </div>
          <div v-else class="flex flex-wrap justify-center gap-3 md:gap-4 mb-16">
            <button
              v-for="p in pricingPeriods"
              :key="p.value"
              @click="billingCycle = p.value"
              :class="[
                'relative px-5 py-3 md:px-6 rounded-2xl font-bold transition-all duration-300 border-2 text-sm md:text-base',
                billingCycle === p.value 
                  ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-500/30 transform scale-105' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-brand-200 hover:bg-slate-50'
              ]"
            >
              {{ p.label }}
              <span 
                v-if="p.discount" 
                :class="[
                  'absolute -top-2.5 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm transition-colors',
                  billingCycle === p.value ? 'bg-white text-brand-600' : 'bg-emerald-500 text-white'
                ]"
              >
                {{ p.discount }}
              </span>
              <span v-if="p.hit" class="absolute -top-6 -right-6 md:-right-8 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md transform rotate-12 shadow-sm">
                ХИТ
              </span>
            </button>
          </div>

          <div class="grid lg:grid-cols-3 gap-6 items-start">
            <template v-if="pricingTariffs.length > 0">
              <div 
                v-for="(tariff, index) in pricingTariffs" 
                :key="tariff.id"
                :class="[
                  'rounded-[32px] p-8 border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative',
                  tariff.is_popular 
                    ? 'bg-brand-600 border-brand-500 shadow-2xl shadow-brand-500/30 transform lg:-translate-y-4 z-10 text-white' 
                    : tariff.is_soon 
                      ? 'bg-slate-700 border-slate-600 shadow-xl text-slate-200'
                      : 'bg-white border-slate-200 group'
                ]"
              >
                <div v-if="tariff.is_popular" class="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                  Популярный выбор
                </div>
                
                <h3 :class="['text-2xl font-black mb-2', tariff.is_popular || tariff.is_soon ? 'text-white' : 'text-slate-900']">
                  {{ tariff.title }}
                </h3>
                <div class="flex items-baseline gap-2 mb-2">
                  <span :class="['text-4xl font-black', tariff.is_popular || tariff.is_soon ? 'text-white' : 'text-slate-900']">
                    {{ formatPrice(getTariffPrice(tariff).price) }} ₽
                  </span>
                  <span :class="['text-sm font-medium', tariff.is_popular ? 'opacity-60' : tariff.is_soon ? 'text-slate-400' : 'text-slate-400']">
                    {{ getTariffPrice(tariff).period }}
                  </span>
                </div>
                <div v-if="getTariffSavings(tariff) > 0" :class="['text-xs font-medium mb-2', tariff.is_popular ? 'text-brand-200' : 'text-emerald-600']">
                  Экономия {{ formatPrice(getTariffSavings(tariff)) }} ₽
                </div>
                <p v-if="tariff.description" :class="['text-sm mb-8 leading-relaxed', tariff.is_popular ? 'text-brand-100 opacity-90' : tariff.is_soon ? 'text-slate-400' : 'text-slate-500']">
                  {{ tariff.description }}
                </p>

                <ul class="space-y-4 mb-8 flex-1">
                  <li v-for="item in getSortedFeatureItems(tariff)" :key="item.id" class="flex items-start gap-3">
                    <div v-if="tariff.is_popular" class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <Check class="w-3 h-3 text-white" />
                    </div>
                    <Check v-else :class="['w-5 h-5 shrink-0', tariff.is_soon ? 'text-slate-400' : 'text-emerald-500']" />
                    <span :class="['text-sm font-medium', tariff.is_popular ? 'text-white' : tariff.is_soon ? 'text-slate-300' : 'text-slate-600']">
                      {{ item.text }}
                    </span>
                  </li>
                </ul>

                <a 
                  v-if="!tariff.is_soon"
                  href="https://percent1.ru/auth/register" 
                  target="_blank"
                  :class="[
                    'w-full rounded-2xl py-4 font-bold transition text-center block',
                    tariff.is_popular 
                      ? 'bg-white text-brand-600 hover:bg-slate-50 shadow-lg' 
                      : tariff.code === 'free' 
                        ? 'border-2 border-brand-600 text-brand-600 hover:bg-brand-50'
                        : 'bg-brand-600 text-white hover:bg-brand-700'
                  ]"
                >
                  {{ tariff.code === 'free' ? 'Начать бесплатно' : 'Попробовать' }}
                </a>
                <button v-else disabled class="w-full rounded-2xl py-4 bg-slate-600 text-slate-400 cursor-not-allowed border-none">
                  Скоро
                </button>
              </div>
            </template>
            
            <template v-else>
              <!-- Fallback: Static cards when no data from backend -->
              <div class="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative group">
                <h3 class="text-2xl font-black text-slate-900 mb-2">Бесплатный</h3>
                <div class="flex items-baseline gap-2 mb-2">
                  <span class="text-4xl font-black text-slate-900">0 ₽</span>
                  <span class="text-sm font-medium text-slate-400">навсегда</span>
                </div>
                <p class="text-sm text-slate-500 mb-8 leading-relaxed">
                  Базовый функционал для начала работы над собой.
                </p>
                <ul class="space-y-4 mb-8 flex-1">
                  <li v-for="(item, i) in freePlanFeatures" :key="i" class="flex items-start gap-3">
                    <Check class="w-5 h-5 text-emerald-500 shrink-0" />
                    <span class="text-sm font-medium text-slate-600">{{ item }}</span>
                  </li>
                </ul>
                <button class="w-full rounded-2xl py-4 border-2 border-brand-600 text-brand-600 font-bold hover:bg-brand-50 transition">
                  Начать бесплатно
                </button>
              </div>

              <div class="bg-brand-600 rounded-[32px] p-8 border border-brand-500 shadow-2xl shadow-brand-500/30 flex flex-col h-full relative transform lg:-translate-y-4 z-10 text-white">
                <div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                  Популярный выбор
                </div>
                <div class="text-center mb-6 mt-2">
                  <h3 class="text-2xl font-black mb-1 opacity-90">Pro</h3>
                  <div class="flex items-center justify-center gap-1">
                    <span class="text-5xl font-black">{{ calculatePrice(990) }} ₽</span>
                    <span class="text-sm font-medium opacity-60">/ месяц</span>
                  </div>
                  <div v-if="billingCycle > 1" class="text-xs font-medium text-brand-200 mt-1 line-through decoration-brand-400">
                    990 ₽ / месяц
                  </div>
                </div>
                <p class="text-sm text-brand-100 mb-8 text-center leading-relaxed opacity-90">
                  Полный функционал с AI-помощником и голосовым чатом с ментором.
                </p>
                <ul class="space-y-4 mb-8 flex-1">
                  <li v-for="(item, i) in proPlanFeatures" :key="i" class="flex items-start gap-3">
                    <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <Check class="w-3 h-3 text-white" />
                    </div>
                    <span class="text-sm font-medium text-white">{{ item }}</span>
                  </li>
                </ul>
                <button class="w-full rounded-2xl py-4 bg-white text-brand-600 font-bold hover:bg-slate-50 transition shadow-lg">
                  7 дней бесплатно
                </button>
              </div>

              <div class="bg-slate-700 rounded-[32px] p-8 border border-slate-600 shadow-xl flex flex-col h-full relative text-slate-200">
                <h3 class="text-2xl font-black text-white mb-2">Клуб 1%</h3>
                <div class="flex items-baseline gap-2 mb-2">
                  <span class="text-4xl font-black text-white">{{ calculatePrice(2990) }} ₽</span>
                  <span class="text-sm font-medium text-slate-400">/ месяц</span>
                </div>
                <p class="text-sm text-slate-400 mb-8 leading-relaxed">
                  Premium тариф с мастермайндами, челленджами и нетворкингом.
                </p>
                <ul class="space-y-4 mb-8 flex-1">
                  <li v-for="(item, i) in clubPlanFeatures" :key="i" class="flex items-start gap-3">
                    <Check class="w-5 h-5 text-slate-400 shrink-0" />
                    <span class="text-sm font-medium text-slate-300">{{ item }}</span>
                  </li>
                </ul>
                <button disabled class="w-full rounded-2xl py-4 bg-slate-600 text-slate-400 cursor-not-allowed border-none">
                  Скоро
                </button>
              </div>
            </template>
          </div>

          <div class="mt-16 flex items-center justify-center gap-3 text-slate-500 text-sm animate-in fade-in duration-700">
            <Lightbulb class="w-5 h-5 text-amber-500 shrink-0" />
            <p class="text-center">Начни бесплатно и переходи на Pro, когда почувствуешь, что готов к следующему уровню</p>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-[#0f1117] text-slate-400 py-16">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
          <a href="https://percent1.ru/" class="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div class="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand-900/20">
              1%
            </div>
            <span class="text-2xl font-bold text-white tracking-tight">OnePercent</span>
          </a>

          <div class="flex gap-8 font-medium text-sm">
            <router-link to="/login" class="text-slate-300 hover:text-white transition-colors">Войти</router-link>
            <router-link to="/register" class="text-slate-300 hover:text-white transition-colors">Регистрация</router-link>
          </div>
        </div>

        <div class="h-px bg-slate-800/50 w-full mb-12"></div>

        <div class="flex flex-col items-center text-center gap-8">
          <div class="flex flex-col md:flex-row gap-4 md:gap-8 text-xs md:text-sm font-medium text-slate-500">
            <router-link to="/privacy" class="hover:text-slate-300 transition-colors">Политика конфиденциальности</router-link>
            <router-link to="/termspolicy" class="hover:text-slate-300 transition-colors">Пользовательское соглашение</router-link>
            <router-link to="/disclaimer" class="hover:text-slate-300 transition-colors">Отказ от ответственности</router-link>
          </div>

          <div class="space-y-2 text-[10px] md:text-xs text-slate-600 font-medium">
            <p>ИП Косик Дмитрий Владимирович</p>
            <p class="opacity-70">ИНН: 711280082908 | ОГРНИП: 321774600074346</p>
          </div>

          <div class="text-[10px] md:text-xs text-slate-600">
            &copy; 2025 OnePercent. Все права защищены.
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, markRaw } from 'vue'
import { 
  Compass, Target, LayoutDashboard, Activity, CheckSquare, Calendar, 
  Repeat, Trophy, Sparkles, MessageCircle, Check, Zap, Map, 
  TrendingUp, Mic, Feather, BookOpen, PenTool, Quote, Lightbulb,
  ArrowRight, Palette, Users
} from 'lucide-vue-next'
import WheelOfLifeMockup from '@/components/landing/WheelOfLifeMockup.vue'
import { useSubscriptionStore } from '@/stores/subscription.js'

const subscriptionStore = useSubscriptionStore()

const isScrolled = ref(false)
const mobileMenuOpen = ref(false)
const days = ref(30)
const billingCycle = ref(1)
const selectedTerm = ref(null)

const multiplier = computed(() => Math.pow(1.01, days.value).toFixed(2))

const pricingTariffs = computed(() => subscriptionStore.tariffs)
const pricingTerms = computed(() => subscriptionStore.terms)

function selectTerm(termId) {
  const term = pricingTerms.value.find(t => t.id === termId)
  if (term) {
    selectedTerm.value = term
    billingCycle.value = term.months || 1
  }
}

function getTariffPrice(tariff) {
  if (!tariff || tariff.code === 'free') return { price: 0, period: 'навсегда' }
  if (!selectedTerm.value || !tariff.terms || tariff.terms.length === 0) {
    return { price: tariff.price || 0, period: '/ месяц' }
  }
  
  const term = tariff.terms.find(t => t.id === selectedTerm.value.id)
  if (!term) return { price: tariff.price || 0, period: '/ месяц' }
  
  return { price: term.base_price || tariff.price || 0, period: '/ месяц' }
}

function getTariffSavings(tariff) {
  if (!tariff || tariff.code === 'free' || !selectedTerm.value) return 0
  const term = tariff.terms?.find(t => t.id === selectedTerm.value.id)
  if (!term) return 0
  return term.term_discount_value || 0
}

function getSortedFeatureItems(tariff) {
  if (!tariff?.feature_items?.length) return []
  return [...tariff.feature_items].sort((a, b) => a.sort_order - b.sort_order)
}

function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(price))
}

const effectDescription = computed(() => {
  if (days.value <= 30) return "Ты начнешь управлять днем, а не плыть по течению: меньше хаоса, больше точности."
  if (days.value <= 90) return "Система становится привычкой. Уходит тревога, появляется четкий план и ясность действий."
  if (days.value <= 180) return "Качественный сдвиг: ясность ума, устойчивость к стрессу, рост дохода и ощущение полного контроля."
  return "Трансформация завершена. Твоя эффективность в 38 раз выше, чем в первый день."
})

const problemCards = [
  {
    text: "Если хочешь двигаться вперед, но не понимаешь — куда",
    icon: markRaw(Compass),
    color: "bg-blue-100 text-blue-600",
    borderColor: "border-blue-100"
  },
  {
    text: "Когда целей много, а ясности мало",
    icon: markRaw(Target),
    color: "bg-orange-100 text-orange-600",
    borderColor: "border-orange-100"
  },
  {
    text: "Навести порядок в целях, задачах и деньгах",
    icon: markRaw(LayoutDashboard),
    color: "bg-purple-100 text-purple-600",
    borderColor: "border-purple-100"
  }
]

const featureSteps = [
  {
    id: 1,
    title: "Умная диагностика",
    subtitle: "Шаг 1. Точка А",
    description: "Система не дает абстрактных советов. Сначала ИИ анализирует ваше текущее состояние через «Колесо жизни», чтобы найти одну сферу, улучшение которой даст максимальный эффект на всё остальное.",
    icon: markRaw(Activity),
    color: "bg-blue-100 text-blue-600",
    gradient: "from-blue-500/20 to-cyan-500/20"
  },
  {
    id: 2,
    title: "AI Постановка целей",
    subtitle: "Шаг 2. Ясность",
    description: "Ментор превращает размытые желания («Хочу быть богатым/спортивным») в четкие метрики. ИИ формулирует цель по SMART, которую реально достичь с вашим текущим графиком.",
    icon: markRaw(Target),
    color: "bg-purple-100 text-purple-600",
    gradient: "from-purple-500/20 to-pink-500/20"
  },
  {
    id: 3,
    title: "Декомпозиция",
    subtitle: "Шаг 3. План действий",
    description: "Большая цель пугает. Система разбивает её на микро-атомы. Вы получаете интерактивную карту действий от сегодняшнего дня до финального результата.",
    icon: markRaw(CheckSquare),
    color: "bg-green-100 text-green-600",
    gradient: "from-green-500/20 to-emerald-500/20"
  },
  {
    id: 4,
    title: "Фокус дня",
    subtitle: "Шаг 4. Дисциплина",
    description: "Утром вы получаете ровно одну главную задачу. Больше не нужно думать «за что взяться». Просто сделайте +1% сегодня, и система пересчитает маршрут.",
    icon: markRaw(Calendar),
    color: "bg-amber-100 text-amber-600",
    gradient: "from-amber-500/20 to-orange-500/20"
  },
  {
    id: 5,
    title: "Система привычек",
    subtitle: "Шаг 5. Ритм",
    description: "От хаотичных попыток к системе. AI подбирает привычки под ваши цели, напоминает о выполнении и показывает реальный прогресс на наглядных дашбордах.",
    icon: markRaw(Repeat),
    color: "bg-indigo-100 text-indigo-600",
    gradient: "from-indigo-500/20 to-violet-500/20"
  },
  {
    id: 6,
    title: "Геймификация и XP",
    subtitle: "Шаг 6. Мотивация",
    description: "Ваш мозг любит награды. За выполнение задач вы получаете XP (опыт) и уровни. Обменивайте заработанный опыт на реальные награды: отдых, покупки или развлечения.",
    icon: markRaw(Trophy),
    color: "bg-pink-100 text-pink-600",
    gradient: "from-pink-500/20 to-rose-500/20"
  }
]

const habitsMockup = [
  { name: 'Хобби', icon: markRaw(Palette), iconBg: 'bg-orange-100', iconColor: 'text-orange-500', xp: 20, activeDays: [1, 3, 5], currentDay: 5, done: false },
  { name: 'Финансы', icon: markRaw(Check), iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', xp: 15, activeDays: [1, 2, 4, 5], currentDay: 5, done: true },
  { name: 'Ужин с семьёй', icon: markRaw(Users), iconBg: 'bg-blue-100', iconColor: 'text-blue-500', xp: 20, activeDays: [0, 1, 2, 3, 4], currentDay: 5, done: false }
]

const mentorRoles = [
  { title: 'Интервьюер', period: 'Первая неделя', description: 'Задает глубокие вопросы, собирает контекст вашей жизни и определяет истинные ценности.', icon: markRaw(Mic), active: false },
  { title: 'Стратег', period: 'Первый месяц', description: 'Помогает оцифровать цели, составить реалистичный план и найти время в календаре.', icon: markRaw(Map), active: false },
  { title: 'Коуч 1%', period: '2+ месяц', description: 'Поддерживает дисциплину, анализирует срывы и помогает вернуться в строй без чувства вины.', icon: markRaw(Zap), active: true }
]

const ctaItems = [
  "Увидел свои проблемные зоны",
  "Получил персональные цели от AI",
  "План на месяц разбит по дням",
  "Система привычек с геймификацией",
  "Награды за прогресс",
  "AI поддержка 24/7 в Telegram"
]

const testimonials = [
  {
    name: "Бенджамин Франклин",
    role: "Политик, учёный, изобретатель",
    quote: "Маленькие удары валят большие дубы",
    description: "Создал систему 13 добродетелей: каждую неделю фокусировался на одном качестве, вёл дневник самоанализа.",
    icon: markRaw(Feather)
  },
  {
    name: "Джеймс Клир",
    role: "Автор «Atomic Habits»",
    quote: "Привычки — это сложные проценты самосовершенствования",
    description: "Популяризировал концепцию 1%: если каждый день улучшаться на 1%, за год станешь лучше в 37 раз.",
    icon: markRaw(BookOpen)
  },
  {
    name: "Уоррен Баффетт",
    role: "Инвестор, миллиардер",
    quote: "Я просто сижу в офисе и читаю целый день",
    description: "Правило 5 часов: ежедневно инвестирует минимум час в обучение и рефлексию. 80% рабочего времени — чтение.",
    icon: markRaw(TrendingUp)
  },
  {
    name: "Леонардо да Винчи",
    role: "Художник, учёный, изобретатель",
    quote: "Препятствия не могут сокрушить меня",
    description: "Вёл легендарные записные книжки: 7000+ страниц наблюдений, идей и планов. Ежедневная практика.",
    icon: markRaw(PenTool)
  }
]

const pricingPeriods = [
  { value: 1, label: '1 месяц', discount: null },
  { value: 3, label: '3 месяца', discount: '-10%' },
  { value: 6, label: '6 месяцев', discount: '-20%' },
  { value: 12, label: '12 месяцев', discount: '-30%', hit: true }
]

const freePlanFeatures = [
  'Колесо баланса (ССП)',
  'Банк целей (до 4 целей)',
  'Базовое планирование',
  'Трекер привычек (до 3)',
  'Дневник рефлексии',
  'Достижения (до 5)',
  'Напоминания в Telegram'
]

const proPlanFeatures = [
  'Всё из Бесплатного плана',
  'Безлимитные цели и привычки',
  'AI ментор',
  'AI планирование',
  'AI помощь',
  'Голосовой чат с ментором',
  'Клуб 1%'
]

const clubPlanFeatures = [
  'Всё из Pro плана',
  'Еженедельные мастермайнды',
  'Групповые челленджи',
  'Ранний доступ к новым функциям',
  'Нетворкинг 2.0'
]

const calculatePrice = (basePrice) => {
  if (basePrice === 0) return 0
  let discount = 0
  if (billingCycle.value === 3) discount = 0.1
  if (billingCycle.value === 6) discount = 0.2
  if (billingCycle.value === 12) discount = 0.3
  return Math.round(basePrice * (1 - discount))
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  
  subscriptionStore.loadTariffs(true).then(() => {
    if (pricingTerms.value.length > 0 && !selectedTerm.value) {
      const defaultTerm = pricingTerms.value.find(t => t.months === 1) || pricingTerms.value[0]
      if (defaultTerm) {
        selectTerm(defaultTerm.id)
      }
    }
  })
  
  if (!document.getElementById('tailwind-v7')) {
    const script = document.createElement('script')
    script.id = 'tailwind-v7'
    script.src = 'https://cdn.tailwindcss.com'
    script.onload = () => {
      if (window.tailwind) {
        window.tailwind.config = {
          theme: {
            extend: {
              fontFamily: {
                sans: ['Inter', 'sans-serif'],
              },
              colors: {
                brand: {
                  50: '#eef2ff',
                  100: '#e0e7ff',
                  200: '#c7d2fe',
                  300: '#a5b4fc',
                  400: '#818cf8',
                  500: '#6366f1',
                  600: '#4f46e5',
                  700: '#4338ca',
                  800: '#3730a3',
                  900: '#312e81',
                }
              }
            }
          }
        }
      }
    }
    document.head.appendChild(script)
  }
  
  if (!document.getElementById('inter-font')) {
    const link = document.createElement('link')
    link.id = 'inter-font'
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.text-gradient {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.bento-card {
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}
.bento-card:hover { 
  transform: translateY(-5px); 
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); 
}

.modern-range {
  -webkit-appearance: none;
  width: 100%;
  height: 8px;
  border-radius: 5px;
  background: #e2e8f0;
  outline: none;
}
.modern-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
  border: 4px solid white;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  transition: transform 0.1s;
}
.modern-range::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
</style>
