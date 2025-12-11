<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1>Страница не найдена</h1>
      <p>К сожалению, запрашиваемая страница не существует или была перемещена.</p>
      <div class="actions">
        <router-link to="/" class="btn btn-primary">
          <Home :size="18" :stroke-width="1.5" />
          На главную
        </router-link>
        <router-link to="/app" class="btn btn-secondary">
          <LayoutDashboard :size="18" :stroke-width="1.5" />
          В приложение
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Home, LayoutDashboard } from 'lucide-vue-next'
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  padding: 2rem;
}

.not-found-content {
  text-align: center;
  max-width: 480px;
}

.error-code {
  font-size: 8rem;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 1rem;
}

.not-found-content h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.75rem 0;
}

.not-found-content p {
  font-size: 1rem;
  color: #64748b;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-secondary {
  background: white;
  color: #1a1a2e;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

@media (max-width: 480px) {
  .error-code {
    font-size: 5rem;
  }
  
  .not-found-content h1 {
    font-size: 1.5rem;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
