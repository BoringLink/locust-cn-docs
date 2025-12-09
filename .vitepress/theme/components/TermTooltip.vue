<template>
  <span
    :class="['term-tooltip']"
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
  >
    <span class="term-only">{{ term }}</span>

    <transition name="tooltip-fade">
      <div v-if="showTooltip" class="tooltip-content">
        <div class="tooltip-header">
          <span class="tooltip-zh">{{ term }}</span>
          <span class="tooltip-en">{{ english }}</span>
        </div>
        <div v-if="definition" class="tooltip-definition">
          {{ definition }}
        </div>
      </div>
    </transition>
  </span>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  term: string // 中文术语
  english: string // 英文原文
  definition?: string // 可选的详细定义
  firstOccurrence: boolean // 是否首次出现
}

defineProps<Props>()
const showTooltip = ref(false)
</script>

<style scoped>
.term-tooltip {
  position: relative;
  display: inline;
  cursor: help;
}

.first-occurrence {
  font-weight: 500;
}

.term-with-english {
  color: var(--vp-c-brand-1);
}

.english-term {
  color: var(--vp-c-text-2);
  font-size: 0.9em;
  margin-left: 0.1em;
}

.term-only {
  color: var(--vp-c-text-1);
  border-bottom: 1px dotted var(--vp-c-brand-1);
  transition: border-color 0.2s;
}

.term-only:hover {
  border-bottom-color: var(--vp-c-brand-2);
}

.tooltip-content {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  padding: 12px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  min-width: 200px;
  max-width: 300px;
  pointer-events: none;
}

.tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.tooltip-zh {
  font-weight: 600;
  color: var(--vp-c-brand-1);
  font-size: 14px;
}

.tooltip-en {
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-style: italic;
}

.tooltip-definition {
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}

/* 提示框箭头 */
.tooltip-content::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--vp-c-bg-soft);
}

/* 过渡动画 */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .tooltip-content {
    position: fixed;
    bottom: auto;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
    max-width: 90vw;
  }

  .tooltip-content::after {
    display: none;
  }
}

/* 暗色模式 */
.dark .tooltip-content {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style>
