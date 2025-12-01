<template>
  <div v-if="nextPage" class="next-reading">
    <div class="next-reading-header">
      <span class="next-reading-label">接下来阅读</span>
    </div>
    <a :href="nextPage.next" class="next-reading-card">
      <div class="next-reading-content">
        <h3 class="next-reading-title">{{ nextPage.title }}</h3>
        <p class="next-reading-description">{{ nextPage.description }}</p>
      </div>
      <div class="next-reading-arrow">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </div>
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import readingPathData from '../../data/reading-path.json'

interface ReadingPathEntry {
  next: string
  title: string
  description: string
}

type ReadingPathConfig = Record<string, ReadingPathEntry>

const { page } = useData()

const readingPath = readingPathData.paths as ReadingPathConfig

const nextPage = computed(() => {
  const currentPath = page.value.relativePath.replace(/\.md$/, '')
  const normalizedPath = currentPath.startsWith('/') ? currentPath : `/${currentPath}`

  readingPath[normalizedPath].next = withBase(readingPath[normalizedPath].next)
  return readingPath[normalizedPath] || null
})
</script>

<style scoped>
.next-reading {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--vp-c-divider);
}

.next-reading-header {
  margin-bottom: 1rem;
}

.next-reading-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.next-reading-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
  background-color: var(--vp-c-bg-soft);
}

.next-reading-card:hover {
  border-color: var(--vp-c-brand);
  background-color: var(--vp-c-bg);
  transform: translateX(4px);
}

.next-reading-content {
  flex: 1;
}

.next-reading-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.next-reading-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.next-reading-arrow {
  flex-shrink: 0;
  margin-left: 1rem;
  color: var(--vp-c-brand);
  transition: transform 0.2s ease;
}

.next-reading-card:hover .next-reading-arrow {
  transform: translateX(4px);
}

@media (max-width: 640px) {
  .next-reading-card {
    padding: 1rem;
  }

  .next-reading-title {
    font-size: 1rem;
  }

  .next-reading-description {
    font-size: 0.8125rem;
  }
}
</style>
