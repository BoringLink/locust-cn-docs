<template>
  <div class="responsive-table-wrapper">
    <table v-if="!isMobile" class="responsive-table desktop">
      <thead>
        <tr>
          <th v-for="(header, index) in headers" :key="`header-${index}`">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in normalizedRows" :key="`row-${rowIndex}`">
          <td
            v-for="(cell, cellIndex) in row"
            :key="`cell-${rowIndex}-${cellIndex}`"
            :class="getCellClassNames(cell)"
            :style="getCellStyles(cell)"
          >
            <slot name="cell" :value="cell" :row-index="rowIndex" :col-index="cellIndex">
              <span
                v-if="shouldRenderHtml(cell)"
                class="cell-rich-text"
                v-html="getCellHtmlContent(cell)"
              />
              <span v-else>{{ getCellText(cell) }}</span>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="responsive-table mobile">
      <div v-for="(row, rowIndex) in normalizedRows" :key="`card-${rowIndex}`" class="table-card">
        <div
          v-for="(cell, cellIndex) in row"
          :key="`card-row-${rowIndex}-${cellIndex}`"
          class="table-card-row"
        >
          <div class="card-label">{{ getHeaderLabel(cellIndex) }}</div>
          <div class="card-value" :class="getCellClassNames(cell)" :style="getCellStyles(cell)">
            <slot name="cell" :value="cell" :row-index="rowIndex" :col-index="cellIndex">
              <span
                v-if="shouldRenderHtml(cell)"
                class="cell-rich-text"
                v-html="getCellHtmlContent(cell)"
              />
              <span v-else>{{ getCellText(cell) }}</span>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, type CSSProperties } from 'vue'

type HighlightTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

type TableCellMeta = {
  text?: string | number | null
  html?: string
  highlight?: boolean
  tone?: HighlightTone
  color?: string
  backgroundColor?: string
  bold?: boolean
  italic?: boolean
}

type TableCell = string | number | null | undefined | TableCellMeta
type TableRow = TableCell[]

const props = defineProps<{
  headers: string[]
  rows: TableRow[]
  mobileBreakpoint?: number
  allowHtml?: boolean
}>()

const BREAKPOINT_DEFAULT = 768

const breakpoint = computed(() => props.mobileBreakpoint ?? BREAKPOINT_DEFAULT)
const allowHtml = computed(() => Boolean(props.allowHtml))
const isMobile = ref(false)

const highlightToneClassMap: Record<HighlightTone, string> = {
  neutral: 'cell-highlight-tone-neutral',
  info: 'cell-highlight-tone-info',
  success: 'cell-highlight-tone-success',
  warning: 'cell-highlight-tone-warning',
  danger: 'cell-highlight-tone-danger',
}

const isRichCell = (cell: TableCell): cell is TableCellMeta => {
  return typeof cell === 'object' && cell !== null && !Array.isArray(cell)
}

const toDisplayString = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return ''
  return String(value)
}

const getCellText = (cell: TableCell) => {
  if (isRichCell(cell)) {
    if (cell.text !== undefined && cell.text !== null) {
      return toDisplayString(cell.text)
    }
    if (cell.html) return cell.html
    return ''
  }
  return toDisplayString(cell)
}

const getCellHtmlContent = (cell: TableCell) => {
  if (isRichCell(cell)) {
    if (cell.html) return cell.html
    if (cell.text !== undefined && cell.text !== null) {
      return toDisplayString(cell.text)
    }
    return ''
  }
  return toDisplayString(cell)
}

const shouldRenderHtml = (cell: TableCell) => {
  if (!allowHtml.value) return false
  if (isRichCell(cell)) {
    return Boolean(cell.html)
  }
  return true
}

const getCellClassNames = (cell: TableCell) => {
  if (!isRichCell(cell)) return []

  const classes: string[] = []

  if (cell.highlight || cell.tone) {
    classes.push('cell-highlight')
  }

  if (cell.tone) {
    classes.push(highlightToneClassMap[cell.tone])
  }

  if (cell.bold) {
    classes.push('cell-typography-bold')
  }

  if (cell.italic) {
    classes.push('cell-typography-italic')
  }

  return classes
}

const getCellStyles = (cell: TableCell): CSSProperties | undefined => {
  if (!isRichCell(cell)) return undefined

  const styles: CSSProperties = {}

  if (cell.color) {
    styles.color = cell.color
  }

  if (cell.backgroundColor) {
    styles.backgroundColor = cell.backgroundColor
  }

  return Object.keys(styles).length ? styles : undefined
}

const normalizedRows = computed<TableRow[]>(() => {
  return props.rows.map((row) => {
    if (row.length === props.headers.length) return row
    const filled = [...row]
    while (filled.length < props.headers.length) {
      filled.push('')
    }
    return filled
  })
})

const getHeaderLabel = (index: number) => {
  return props.headers[index] ?? ''
}

const updateViewportFlag = () => {
  if (typeof window === 'undefined') return
  isMobile.value = window.innerWidth <= breakpoint.value
}

onMounted(() => {
  updateViewportFlag()
  window.addEventListener('resize', updateViewportFlag)
})

onUnmounted(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('resize', updateViewportFlag)
})

watch(breakpoint, () => {
  updateViewportFlag()
})

defineExpose({
  isMobile,
})
</script>

<style scoped>
.responsive-table-wrapper {
  width: 100%;
  margin: 24px 0;
}

.responsive-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  font-size: 14px;
  background: var(--vp-c-bg-soft);
}

table.desktop thead {
  background: var(--vp-c-bg-soft);
}

table.desktop th,
table.desktop td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  text-align: left;
}

table.desktop tbody tr:last-child td {
  border-bottom: none;
}

.responsive-table.mobile {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.table-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 16px;
  background: var(--vp-c-bg-soft);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.table-card-row + .table-card-row {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--vp-c-divider);
}

.card-label {
  font-size: 12px;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.card-value {
  color: var(--vp-c-text-1);
  font-weight: 500;
}

.cell-rich-text {
  display: inline-block;
  width: 100%;
}

td.cell-highlight,
.card-value.cell-highlight {
  background-color: rgba(88, 111, 190, 0.08);
  border-left: 3px solid rgba(88, 111, 190, 0.4);
}

td.cell-highlight {
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.cell-highlight-tone-neutral {
  background-color: rgba(148, 163, 184, 0.14) !important;
  border-left-color: rgba(148, 163, 184, 0.65) !important;
}

.cell-highlight-tone-info {
  background-color: rgba(88, 111, 190, 0.15) !important;
  border-left-color: rgba(88, 111, 190, 0.85) !important;
}

.cell-highlight-tone-success {
  background-color: rgba(34, 197, 94, 0.14) !important;
  border-left-color: rgba(34, 197, 94, 0.75) !important;
}

.cell-highlight-tone-warning {
  background-color: rgba(251, 191, 36, 0.25) !important;
  border-left-color: rgba(251, 191, 36, 0.85) !important;
}

.cell-highlight-tone-danger {
  background-color: rgba(248, 113, 113, 0.22) !important;
  border-left-color: rgba(248, 113, 113, 0.85) !important;
}

.cell-typography-bold {
  font-weight: 600;
}

.cell-typography-italic {
  font-style: italic;
}

@media (max-width: 768px) {
  .responsive-table.desktop {
    display: none;
  }
}

@media (min-width: 769px) {
  .responsive-table.mobile {
    display: none;
  }
}
</style>
