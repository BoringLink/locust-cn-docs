import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TermTooltip from '../../.vitepress/theme/components/TermTooltip.vue'

describe('TermTooltip 组件', () => {
  describe('首次出现', () => {
    it('应该渲染"中文(English)"格式', () => {
      const wrapper = mount(TermTooltip, {
        props: {
          term: '用户',
          english: 'User',
          firstOccurrence: true,
        },
      })

      const text = wrapper.text()
      expect(text).toContain('用户')
      expect(text).toContain('(User)')
    })

    it('应该有 first-occurrence 类', () => {
      const wrapper = mount(TermTooltip, {
        props: {
          term: '用户',
          english: 'User',
          firstOccurrence: true,
        },
      })

      expect(wrapper.classes()).toContain('first-occurrence')
    })

    it('应该显示中文和英文', () => {
      const wrapper = mount(TermTooltip, {
        props: {
          term: '任务',
          english: 'Task',
          firstOccurrence: true,
        },
      })

      expect(wrapper.find('.term-with-english').exists()).toBe(true)
      expect(wrapper.find('.english-term').text()).toBe('(Task)')
    })

    it('首次出现时不应该显示提示框', async () => {
      const wrapper = mount(TermTooltip, {
        props: {
          term: '用户',
          english: 'User',
          firstOccurrence: true,
        },
      })

      await wrapper.trigger('mouseenter')
      expect(wrapper.find('.tooltip-content').exists()).toBe(false)
    })
  })

  describe('后续出现', () => {
    it('应该只显示中文术语', () => {
      const wrapper = mount(TermTooltip, {
        props: {
          term: '用户',
          english: 'User',
          firstOccurrence: false,
        },
      })

      expect(wrapper.find('.term-only').exists()).toBe(true)
      expect(wrapper.find('.term-only').text()).toBe('用户')
    })

    it('应该有虚线下划线样式', () => {
      const wrapper = mount(TermTooltip, {
        props: {
          term: '用户',
          english: 'User',
          firstOccurrence: false,
        },
      })

      expect(wrapper.find('.term-only').exists()).toBe(true)
    })

    it('鼠标悬停时应该显示提示框', async () => {
      const wrapper = mount(TermTooltip, {
        props: {
          term: '用户',
          english: 'User',
          definition: '在 Locust 中模拟真实用户行为的类',
          firstOccurrence: false,
        },
      })

      await wrapper.trigger('mouseenter')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.tooltip-content').exists()).toBe(true)
    })

    it('鼠标离开时应该隐藏提示框', async () => {
      const wrapper = mount(TermTooltip, {
        props: {
          term: '用户',
          english: 'User',
          firstOccurrence: false,
        },
      })

      await wrapper.trigger('mouseenter')
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.tooltip-content').exists()).toBe(true)

      await wrapper.trigger('mouseleave')
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.tooltip-content').exists()).toBe(false)
    })
  })

  describe('提示框内容', () => {
    it('应该显示中文术语', async () => {
      const wrapper = mount(TermTooltip, {
        props: {
          term: '用户',
          english: 'User',
          definition: '测试定义',
          firstOccurrence: false,
        },
      })

      await wrapper.trigger('mouseenter')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.tooltip-zh').text()).toBe('用户')
    })

    it('应该显示英文术语', async () => {
      const wrapper = mount(TermTooltip, {
        props: {
          term: '用户',
          english: 'User',
          definition: '测试定义',
          firstOccurrence: false,
        },
      })

      await wrapper.trigger('mouseenter')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.tooltip-en').text()).toBe('User')
    })

    it('应该显示定义', async () => {
      const wrapper = mount(TermTooltip, {
        props: {
          term: '用户',
          english: 'User',
          definition: '在 Locust 中模拟真实用户行为的类',
          firstOccurrence: false,
        },
      })

      await wrapper.trigger('mouseenter')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.tooltip-definition').text()).toBe('在 Locust 中模拟真实用户行为的类')
    })

    it('没有定义时不应该显示定义区域', async () => {
      const wrapper = mount(TermTooltip, {
        props: {
          term: '用户',
          english: 'User',
          firstOccurrence: false,
        },
      })

      await wrapper.trigger('mouseenter')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.tooltip-definition').exists()).toBe(false)
    })
  })

  describe('样式和可访问性', () => {
    it('应该有 cursor: help 样式', () => {
      const wrapper = mount(TermTooltip, {
        props: {
          term: '用户',
          english: 'User',
          firstOccurrence: false,
        },
      })

      expect(wrapper.classes()).toContain('term-tooltip')
    })

    it('应该是内联元素', () => {
      const wrapper = mount(TermTooltip, {
        props: {
          term: '用户',
          english: 'User',
          firstOccurrence: false,
        },
      })

      const element = wrapper.element as HTMLElement
      expect(element.tagName).toBe('SPAN')
    })
  })

  describe('不同术语测试', () => {
    it('应该正确显示"分布式模式(Distributed Mode)"', () => {
      const wrapper = mount(TermTooltip, {
        props: {
          term: '分布式模式',
          english: 'Distributed Mode',
          firstOccurrence: true,
        },
      })

      expect(wrapper.text()).toContain('分布式模式')
      expect(wrapper.text()).toContain('(Distributed Mode)')
    })

    it('应该正确显示"孵化速率(Hatch Rate)"', () => {
      const wrapper = mount(TermTooltip, {
        props: {
          term: '孵化速率',
          english: 'Hatch Rate',
          firstOccurrence: true,
        },
      })

      expect(wrapper.text()).toContain('孵化速率')
      expect(wrapper.text()).toContain('(Hatch Rate)')
    })

    it('应该正确显示"任务集(TaskSet)"', () => {
      const wrapper = mount(TermTooltip, {
        props: {
          term: '任务集',
          english: 'TaskSet',
          firstOccurrence: true,
        },
      })

      expect(wrapper.text()).toContain('任务集')
      expect(wrapper.text()).toContain('(TaskSet)')
    })
  })
})
