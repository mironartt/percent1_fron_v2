<template>
  <div class="legal-page">
    <div class="legal-container">
      <div class="legal-header">
        <router-link to="/" class="back-link">
          <ArrowLeft :size="20" />
          <span>На главную</span>
        </router-link>
      </div>
      
      <div class="legal-content" v-html="renderedContent"></div>
      
      <div class="legal-footer">
        <router-link to="/" class="btn btn-primary">
          Вернуться на главную
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const rawContent = ref('')

const documents = {
  privacy: () => import('@/assets/legal/privacy_policy.md?raw'),
  terms: () => import('@/assets/legal/terms_of_service.md?raw'),
  disclaimer: () => import('@/assets/legal/disclaimer.md?raw')
}

async function loadDocument() {
  const docType = route.meta.docType || 'privacy'
  try {
    const module = await documents[docType]()
    rawContent.value = module.default
  } catch (e) {
    rawContent.value = '# Документ не найден\n\nПожалуйста, попробуйте позже.'
  }
}

function parseMarkdown(md) {
  let html = md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*([^*]+)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/gim, '<em>$1</em>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/^---$/gim, '<hr>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
  
  html = html.replace(/(<li>.*<\/li>)/gis, (match) => {
    return '<ul>' + match + '</ul>'
  })
  html = html.replace(/<\/ul>\s*<ul>/g, '')
  
  return '<p>' + html + '</p>'
}

const renderedContent = computed(() => {
  return parseMarkdown(rawContent.value)
})

watch(() => route.meta.docType, () => {
  loadDocument()
}, { immediate: false })

onMounted(() => {
  loadDocument()
})
</script>

<style scoped>
.legal-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 2rem 1rem;
}

.legal-container {
  max-width: 800px;
  margin: 0 auto;
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  padding: 2rem;
  box-shadow: var(--shadow-lg);
}

.legal-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s;
}

.back-link:hover {
  opacity: 0.8;
}

.legal-content {
  color: var(--text-primary);
  line-height: 1.7;
}

.legal-content :deep(h1) {
  font-size: 1.75rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 0.5rem;
}

.legal-content :deep(h2) {
  font-size: 1.35rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.legal-content :deep(h3) {
  font-size: 1.1rem;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: var(--text-secondary);
}

.legal-content :deep(p) {
  margin-bottom: 1rem;
}

.legal-content :deep(ul) {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.legal-content :deep(li) {
  margin-bottom: 0.5rem;
}

.legal-content :deep(a) {
  color: var(--primary-color);
  text-decoration: none;
}

.legal-content :deep(a:hover) {
  text-decoration: underline;
}

.legal-content :deep(hr) {
  margin: 2rem 0;
  border: none;
  border-top: 1px solid var(--border-color);
}

.legal-content :deep(strong) {
  font-weight: 600;
  color: var(--text-primary);
}

.legal-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .legal-container {
    padding: 1.5rem 1rem;
  }
  
  .legal-content :deep(h1) {
    font-size: 1.5rem;
  }
  
  .legal-content :deep(h2) {
    font-size: 1.2rem;
  }
}
</style>
