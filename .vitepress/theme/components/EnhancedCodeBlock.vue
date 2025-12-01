<template>
  <div class="enhanced-code-block" :data-language="language">
    <header class="code-toolbar">
      <div class="code-meta">
        <span v-if="title" class="code-title">{{ title }}</span>
        <span class="code-language">{{ languageLabel }}</span>
      </div>
      <div class="code-actions">
        <button class="code-action" type="button" :aria-pressed="wrap" @click="toggleWrap">
          {{ wrap ? '取消换行' : '自动换行' }}
        </button>
        <button class="code-action" type="button" :disabled="copied" @click="copyCode">
          {{ copied ? '已复制' : '复制代码' }}
        </button>
      </div>
    </header>
    <div class="code-body" :class="{ wrap }">
      <pre>
				<code>
					<template v-for="(line, index) in renderedLines" :key="index">
						<span class="code-line" :class="{ highlighted: isHighlighted(index + 1) }">
							<span v-if="showLineNumbers" class="line-number">{{ index + 1 }}</span>
							<span class="line-content">{{ line }}</span>
						</span>
					</template>
				</code>
			</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  code: string
  language?: string
  title?: string
  highlightLines?: number[] | string
  showLineNumbers?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  language: 'bash',
  title: '',
  highlightLines: () => [],
  showLineNumbers: true,
})

const wrap = ref(false)
const copied = ref(false)

const normalizedCode = computed(() => props.code.replace(/\s+$/, ''))
const renderedLines = computed(() => normalizedCode.value.split('\n'))

const highlightSet = computed(() => {
  if (Array.isArray(props.highlightLines)) {
    return new Set(props.highlightLines)
  }

  if (typeof props.highlightLines === 'string' && props.highlightLines.trim()) {
    const set = new Set<number>()
    props.highlightLines.split(',').forEach((segment) => {
      const [start, end] = segment.split('-').map((value) => Number(value.trim()))
      if (!Number.isNaN(start)) {
        if (end && !Number.isNaN(end)) {
          for (let i = start; i <= end; i += 1) {
            set.add(i)
          }
        } else {
          set.add(start)
        }
      }
    })
    return set
  }

  return new Set<number>()
})

const languageLabel = computed(() => props.language.toUpperCase())

function isHighlighted(line: number): boolean {
  return highlightSet.value.has(line)
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.warn('无法复制代码', error)
  }
}

function toggleWrap() {
  wrap.value = !wrap.value
}
</script>

<style scoped>
.enhanced-code-block {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background-color: var(--vp-code-block-bg);
  overflow: hidden;
  margin: 1.5rem 0;
}

.code-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.code-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.code-title {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.code-language {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
}

.code-actions {
  display: flex;
  gap: 0.5rem;
}

.code-action {
  font-size: 0.8125rem;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border-radius: 6px;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.code-action:hover:not(:disabled) {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.code-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.code-body {
  position: relative;
  padding: 1rem;
}

.code-body pre {
  margin: 0;
  overflow: auto;
}

.code-body.wrap pre {
  white-space: pre-wrap;
}

.code-line {
  display: flex;
  gap: 1rem;
  font-family: var(--vp-font-family-mono);
  font-size: var(--vp-code-font-size);
  line-height: var(--vp-code-line-height);
}

.line-number {
  width: 2.5rem;
  text-align: right;
  color: var(--vp-c-text-2);
  user-select: none;
}

.line-content {
  flex: 1;
  white-space: pre-wrap;
}

.code-line.highlighted {
  background-color: rgba(53, 86, 58, 0.08);
  border-left: 3px solid var(--vp-c-brand-1);
  padding-left: 0.5rem;
}

@media (max-width: 768px) {
  .code-toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .code-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
