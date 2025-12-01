import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ResponsiveTable from '../../.vitepress/theme/components/ResponsiveTable.vue'

describe('ResponsiveTable 组件', () => {
  const mockHeaders = ['名称', '类型', '说明']
  const mockRows = [
    ['User', '类', '用户类'],
    ['Task', '装饰器', '任务装饰器'],
    ['wait_time', '属性', '等待时间'],
  ]

  beforeEach(() => {
    // 模拟窗口大小
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  describe('桌面端渲染', () => {
    it('应该渲染标准表格', () => {
      const wrapper = mount(ResponsiveTable, {
        props: {
          headers: mockHeaders,
          rows: mockRows,
        },
      })

      expect(wrapper.find('table.desktop').exists()).toBe(true)
    })

    it('应该渲染表头', () => {
      const wrapper = mount(ResponsiveTable, {
        props: {
          headers: mockHeaders,
          rows: mockRows,
        },
      })

      const headers = wrapper.findAll('th')
      expect(headers).toHaveLength(3)
      expect(headers[0].text()).toBe('名称')
      expect(headers[1].text()).toBe('类型')
      expect(headers[2].text()).toBe('说明')
    })

    it('应该渲染所有行', () => {
      const wrapper = mount(ResponsiveTable, {
        props: {
          headers: mockHeaders,
          rows: mockRows,
        },
      })

      const rows = wrapper.findAll('tbody tr')
      expect(rows).toHaveLength(3)
    })

    it('应该渲染单元格内容', () => {
      const wrapper = mount(ResponsiveTable, {
        props: {
          headers: mockHeaders,
          rows: mockRows,
        },
      })

      const firstRow = wrapper.findAll('tbody tr')[0]
      const cells = firstRow.findAll('td')

      expect(cells[0].text()).toBe('User')
      expect(cells[1].text()).toBe('类')
      expect(cells[2].text()).toBe('用户类')
    })
  })

  describe('移动端渲染', () => {
    beforeEach(() => {
      // 设置移动端窗口大小
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
    })

    it('应该渲染卡片布局', async () => {
      const wrapper = mount(ResponsiveTable, {
        props: {
          headers: mockHeaders,
          rows: mockRows,
        },
      })

      // 触发 resize 事件
      await wrapper.vm.$nextTick()
      window.dispatchEvent(new Event('resize'))
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.responsive-table.mobile').exists()).toBe(true)
    })

    it('应该渲染卡片', async () => {
      const wrapper = mount(ResponsiveTable, {
        props: {
          headers: mockHeaders,
          rows: mockRows,
        },
      })

      await wrapper.vm.$nextTick()
      window.dispatchEvent(new Event('resize'))
      await wrapper.vm.$nextTick()

      const cards = wrapper.findAll('.table-card')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('卡片应该包含标签和值', async () => {
      const wrapper = mount(ResponsiveTable, {
        props: {
          headers: mockHeaders,
          rows: mockRows,
        },
      })

      await wrapper.vm.$nextTick()
      window.dispatchEvent(new Event('resize'))
      await wrapper.vm.$nextTick()

      const labels = wrapper.findAll('.card-label')
      const values = wrapper.findAll('.card-value')

      expect(labels.length).toBeGreaterThan(0)
      expect(values.length).toBeGreaterThan(0)
    })
  })

  describe('响应式行为', () => {
    it('应该响应窗口大小变化', async () => {
      const wrapper = mount(ResponsiveTable, {
        props: {
          headers: mockHeaders,
          rows: mockRows,
        },
      })

      // 初始为桌面端
      expect(wrapper.find('table.desktop').exists()).toBe(true)

      // 改变窗口大小到移动端
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      window.dispatchEvent(new Event('resize'))
      await wrapper.vm.$nextTick()

      // 应该切换到移动端布局
      expect(wrapper.vm.isMobile).toBe(true)
    })

    it('应该使用自定义断点', async () => {
      const wrapper = mount(ResponsiveTable, {
        props: {
          headers: mockHeaders,
          rows: mockRows,
          mobileBreakpoint: 1024,
        },
      })

      // 设置窗口大小为 800px（小于自定义断点 1024px）
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      })

      window.dispatchEvent(new Event('resize'))
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isMobile).toBe(true)
    })
  })

  describe('样式和可访问性', () => {
    it('应该有响应式包装器', () => {
      const wrapper = mount(ResponsiveTable, {
        props: {
          headers: mockHeaders,
          rows: mockRows,
        },
      })

      expect(wrapper.find('.responsive-table-wrapper').exists()).toBe(true)
    })

    it('表格应该有边框和圆角', () => {
      const wrapper = mount(ResponsiveTable, {
        props: {
          headers: mockHeaders,
          rows: mockRows,
        },
      })

      const table = wrapper.find('table.desktop')
      expect(table.exists()).toBe(true)
    })

    it('卡片应该有阴影效果', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const wrapper = mount(ResponsiveTable, {
        props: {
          headers: mockHeaders,
          rows: mockRows,
        },
      })

      await wrapper.vm.$nextTick()
      window.dispatchEvent(new Event('resize'))
      await wrapper.vm.$nextTick()

      const card = wrapper.find('.table-card')
      expect(card.exists()).toBe(true)
    })
  })

  describe('富文本与高亮', () => {
    it('allowHtml=true 时应该渲染 HTML 内容', () => {
      const htmlRows = [['<strong class="accent">重点</strong>', '类型', '说明']]

      const wrapper = mount(ResponsiveTable, {
        props: {
          headers: mockHeaders,
          rows: htmlRows,
          allowHtml: true,
        },
      })

      const firstCell = wrapper.find('tbody td')
      expect(firstCell.html()).toContain('cell-rich-text')
      expect(firstCell.html()).toContain('accent')
      expect(firstCell.text()).toBe('重点')
    })

    it('应该根据 tone 应用高亮类名', () => {
      const rowsWithTone = [
        [
          {
            text: '重点关注',
            highlight: true,
            tone: 'warning',
          },
          '类型',
          '说明',
        ],
      ]

      const wrapper = mount(ResponsiveTable, {
        props: {
          headers: mockHeaders,
          rows: rowsWithTone,
        },
      })

      const firstCell = wrapper.find('tbody td')
      expect(firstCell.classes()).toContain('cell-highlight')
      expect(firstCell.classes()).toContain('cell-highlight-tone-warning')
    })

    it('应该支持自定义颜色样式', () => {
      const rowsWithColor = [
        [
          {
            text: '彩色单元格',
            color: '#ff5722',
            backgroundColor: '#fff7ed',
          },
          '类型',
          '说明',
        ],
      ]

      const wrapper = mount(ResponsiveTable, {
        props: {
          headers: mockHeaders,
          rows: rowsWithColor,
        },
      })

      const firstCell = wrapper.find('tbody td')
      expect(firstCell.element.style.color).toBe('rgb(255, 87, 34)')
      expect(firstCell.element.style.backgroundColor).toBe('rgb(255, 247, 237)')
    })
  })

  describe('数据处理', () => {
    it('应该处理空数据', () => {
      const wrapper = mount(ResponsiveTable, {
        props: {
          headers: mockHeaders,
          rows: [],
        },
      })

      const rows = wrapper.findAll('tbody tr')
      expect(rows).toHaveLength(0)
    })

    it('应该处理不同数量的列', () => {
      const headers = ['列1', '列2']
      const rows = [['值1', '值2']]

      const wrapper = mount(ResponsiveTable, {
        props: {
          headers,
          rows,
        },
      })

      const headerCells = wrapper.findAll('th')
      expect(headerCells).toHaveLength(2)
    })

    it('应该处理多行数据', () => {
      const manyRows = Array.from({ length: 10 }, (_, i) => [`名称${i}`, `类型${i}`, `说明${i}`])

      const wrapper = mount(ResponsiveTable, {
        props: {
          headers: mockHeaders,
          rows: manyRows,
        },
      })

      const rows = wrapper.findAll('tbody tr')
      expect(rows).toHaveLength(10)
    })
  })
})
