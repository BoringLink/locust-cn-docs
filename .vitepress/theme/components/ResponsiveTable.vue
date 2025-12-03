<template>
  <div class="responsive-table-wrapper">
    <!-- 隐藏的列宽度测量表格 -->
    <table
      v-if="!isMobile && !hasMeasured"
      ref="fakeTable"
      style="position: absolute; left: -9999px; top: -9999px; visibility: hidden; width: auto"
      class="responsive-table desktop"
    >
      <thead>
        <tr>
          <th v-for="(h, i) in headers" :key="i">{{ h }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, ri) in normalizedRows" :key="ri">
          <td v-for="(cell, ci) in row" :key="ci">
            <span v-if="shouldRenderHtml(cell)" v-html="getCellHtmlContent(cell)" />
            <span v-else>{{ getCellText(cell) }}</span>
          </td>
        </tr>
      </tbody>
    </table>

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
import { computed, nextTick, onMounted, onUnmounted, ref, watch, type CSSProperties } from 'vue'

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

// 列宽测量表格
const fakeTable = ref<HTMLTableElement | null>(null)
const hasMeasured = ref(false)

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

// 测量列宽
const measureColumns = async () => {
  if (hasMeasured.value || isMobile.value) return
  await nextTick()

  if (!fakeTable.value || props.rows.length === 0) return

  const headerCells = fakeTable.value.querySelectorAll('thead th')
  const bodyRows = fakeTable.value.querySelectorAll('tbody tr')
  const colCount = props.headers.length

  // 计算每列“内容所需的最小宽度”（包括 thead 和所有行）
  const minWidths: number[] = Array(colCount).fill(0)

  // 测量表头
  headerCells.forEach((th, i) => {
    minWidths[i] = Math.max(minWidths[i], th.scrollWidth)
  })

  // 测量所有单元格（包括富文本展开后的真实宽度）
  bodyRows.forEach((row) => {
    const tr = row as HTMLTableRowElement
    const cells = tr.cells
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i] as HTMLElement
      // 强制显示 + 展开 v-html 内容才能测准
      cell.style.whiteSpace = 'nowrap'
      cell.style.display = 'inline-block' // 关键！让 v-html 内容真正“摊开”
      cell.style.maxWidth = 'none'
      minWidths[i] = Math.max(minWidths[i], cell.scrollWidth + 40) // +40 预留 padding + 安全边距
    }
  })

  // 将计算出的宽度应用到真实表格的 colgroup
  const realTable = fakeTable.value!.parentElement?.querySelector(
    'table.desktop'
  ) as HTMLTableElement
  if (realTable) {
    let colgroup = realTable.querySelector('colgroup') as HTMLTableColElement | null
    if (!colgroup) {
      colgroup = document.createElement('colgroup')
      realTable.prepend(colgroup)
    }
    colgroup.innerHTML = ''

    minWidths.forEach((width, i) => {
      const col = document.createElement('col')
      if (i === minWidths.length - 1) {
        // 最后一列：填充剩余空间
        col.style.width = '100%'
      } else {
        col.style.width = `${width}px`
        col.style.minWidth = `${width}px`
      }
      colgroup!.appendChild(col)
    })
  }

  hasMeasured.value = true
}

// 在数据更新后重新测量
watch(() => props.rows, measureColumns, { deep: true })
watch(() => props.headers, measureColumns)
// 响应式切换时也重新测量
watch(isMobile, () => {
  if (!isMobile.value) {
    setTimeout(measureColumns, 100)
  }
})

onMounted(() => {
  updateViewportFlag()

  measureColumns()

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
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.responsive-table {
  width: 100%;
  table-layout: fixed !important;
  border-collapse: collapse;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  font-size: 14px;
  background: var(--vp-c-bg-soft);
}

table.desktop thead {
  width: 100%;
  background: var(--vp-c-bg-soft);
}

table.desktop tbody {
  width: 100%;
}

table.desktop th,
table.desktop td {
  width: fit-content;
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
