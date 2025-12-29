<template>
  <footer class="catalog-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="footer-logo">
            <span class="logo-icon">1%</span>
            <div class="logo-text">
              <b class="logo-title">OnePercent</b>
              <span class="tagline">+1% каждый день</span>
            </div>
          </div>
          <p class="footer-description">
            Система управления жизнью для достижения целей через маленькие ежедневные улучшения.
          </p>
        </div>

        <div class="footer-section">
          <h4>Каталог</h4>
          <nav>
            <router-link to="/catalog/goals">Цели</router-link>
            <router-link to="/catalog/habits">Привычки</router-link>
            <router-link to="/catalog/bundles">Готовые наборы</router-link>
          </nav>
        </div>

        <div class="footer-section">
          <h4>Категории</h4>
          <nav>
            <router-link to="/catalog/goals/welfare">Финансы</router-link>
            <router-link to="/catalog/goals/health_sport">Здоровье</router-link>
            <router-link to="/catalog/goals/work">Карьера</router-link>
            <router-link to="/catalog/goals/family">Отношения</router-link>
            <router-link to="/catalog/goals/hobby">Хобби</router-link>
            <router-link to="/catalog/goals/environment">Окружение</router-link>
          </nav>
        </div>

        <div class="footer-section">
          <h4>Компания</h4>
          <nav>
            <router-link to="/">Главная</router-link>
            <router-link to="/auth/register">Начать бесплатно</router-link>
            <router-link to="/legal/terms">Условия использования</router-link>
            <router-link to="/legal/privacy">Политика конфиденциальности</router-link>
          </nav>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="copyright">© {{ currentYear }} OnePercent. Все права защищены.</p>
        <p class="footer-contact">ИП Сагитов Р.М. • ИНН 027604119997</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.catalog-footer {
  background: #1f2937;
  color: #d1d5db;
  padding: 60px 0 30px;
  margin-top: 80px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 48px;
  margin-bottom: 48px;
}

.footer-brand {
  max-width: 300px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.logo-icon {
  width: 42px;
  height: 42px;
  background: #6366f1;
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  color: white;
  font-size: 18px;
  font-weight: 700;
}

.tagline {
  color: #9ca3af;
  font-size: 12px;
}

.footer-description {
  color: #9ca3af;
  font-size: 14px;
  line-height: 1.6;
}

.footer-section h4 {
  color: white;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
}

.footer-section nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-section a {
  color: #9ca3af;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.footer-section a:hover {
  color: #6366f1;
}

.footer-bottom {
  border-top: 1px solid #374151;
  padding-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright {
  color: #6b7280;
  font-size: 14px;
}

.footer-contact {
  color: #6b7280;
  font-size: 13px;
}

@media (max-width: 900px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  .footer-brand {
    grid-column: span 2;
    max-width: none;
  }
}

@media (max-width: 600px) {
  .footer-grid {
    grid-template-columns: 1fr;
  }

  .footer-brand {
    grid-column: span 1;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
}
</style>
