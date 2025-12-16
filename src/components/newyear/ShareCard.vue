<template>
  <div class="share-card">
    <div class="card-header">
      <div class="logo">
        <span class="logo-icon">1%</span>
        <span class="logo-text">OnePercent</span>
      </div>
      <div class="year-badge">2025</div>
    </div>

    <h2 class="card-title">Мои итоги года</h2>

    <div class="spheres-list">
      <div 
        v-for="sphere in store.spheres" 
        :key="sphere.id"
        class="sphere-row"
      >
        <span class="sphere-icon">{{ sphere.icon }}</span>
        <span class="sphere-name">{{ sphere.name }}</span>
        <div class="sphere-bar">
          <div 
            class="bar-fill" 
            :style="{ 
              width: (store.sphereScores[sphere.id] * 10) + '%',
              background: sphere.color 
            }"
          ></div>
        </div>
        <span class="sphere-score">{{ store.sphereScores[sphere.id] || 0 }}</span>
      </div>
    </div>

    <div class="lever-block" v-if="store.mainLever">
      <div class="lever-label">Главный рычаг 2026</div>
      <div class="lever-value">
        <span class="lever-icon">{{ store.mainLever.icon }}</span>
        <span class="lever-name">{{ store.mainLever.name }}</span>
      </div>
    </div>

    <div class="card-footer">
      <div class="cta-text">Пройди тест и узнай свои итоги!</div>
      <div class="url">onepercent.app/land/newyear</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  store: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.share-card {
  width: 1080px;
  height: 1920px;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  color: #f8fafc;
  padding: 80px;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 80px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo-icon {
  font-size: 64px;
  font-weight: 800;
  color: #10b981;
}

.logo-text {
  font-size: 48px;
  font-weight: 600;
}

.year-badge {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  padding: 16px 32px;
  border-radius: 40px;
  font-size: 36px;
  font-weight: 700;
}

.card-title {
  font-size: 72px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 80px;
}

.spheres-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 40px;
  margin-bottom: 80px;
}

.sphere-row {
  display: flex;
  align-items: center;
  gap: 24px;
}

.sphere-icon {
  font-size: 56px;
  width: 80px;
}

.sphere-name {
  font-size: 36px;
  font-weight: 500;
  width: 220px;
}

.sphere-bar {
  flex: 1;
  height: 32px;
  background: rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 16px;
}

.sphere-score {
  font-size: 48px;
  font-weight: 700;
  width: 80px;
  text-align: right;
}

.lever-block {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
  border: 2px solid rgba(16, 185, 129, 0.4);
  border-radius: 32px;
  padding: 48px;
  text-align: center;
  margin-bottom: 80px;
}

.lever-label {
  font-size: 28px;
  color: #10b981;
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-bottom: 24px;
}

.lever-value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.lever-icon {
  font-size: 72px;
}

.lever-name {
  font-size: 56px;
  font-weight: 700;
}

.card-footer {
  text-align: center;
}

.cta-text {
  font-size: 32px;
  color: #94a3b8;
  margin-bottom: 16px;
}

.url {
  font-size: 36px;
  font-weight: 600;
  color: #10b981;
}
</style>
