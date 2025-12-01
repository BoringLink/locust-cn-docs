/**
 * 属性测试：术语格式一致性
 * 功能: locust-cn-docs, 属性 1: 术语首次出现格式一致性
 * 验证需求: 1.1
 * 
 * 对于任何文档页面和任何专业术语，当该术语在页面正文中首次出现时，
 * 渲染结果应包含"中文(English)"格式，后续出现应仅显示中文。
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { mount } from '@vue/test-utils'
import TermTooltip from '../../.vitepress/theme/components/TermTooltip.vue'

describe('属性测试：术语格式一致性', () => {
  /**
   * 生成随机的中文术语
   */
  const chineseTermArbitrary = fc.constantFrom('用户', '任务', '分布式模式', '主节点', '工作节点', '孵化速率', '等待时间', '任务集', '负载测试', '性能测试')

  /**
   * 生成随机的英文术语
   */
  const englishTermArbitrary = fc.constantFrom('User', 'Task', 'Distributed Mode', 'Master', 'Worker', 'Hatch Rate', 'Wait Time', 'TaskSet', 'Load Test', 'Performance Test')

  /**
   * 生成随机的术语对
   */
  const termPairArbitrary = fc.record({
    zh: chineseTermArbitrary,
    en: englishTermArbitrary,
    definition: fc.string({ minLength: 5, maxLength: 100 }),
  })

  it('属性 1: 首次出现时应该包含"中文(English)"格式', () => {
    fc.assert(
      fc.property(termPairArbitrary, (term) => {
        const wrapper = mount(TermTooltip, {
          props: {
            term: term.zh,
            english: term.en,
            firstOccurrence: true,
          },
        })

        const text = wrapper.text()
        
        // 验证包含中文术语
        expect(text).toContain(term.zh)
        
        // 验证包含英文术语（带括号）
        expect(text).toContain(`(${term.en})`)
        
        // 验证格式正确：中文后面紧跟(English)
        const expectedFormat = `${term.zh}(${term.en})`
        expect(text).toContain(expectedFormat)
      }),
      { numRuns: 50 } // 运行 50 次迭代
    )
  })

  it('属性 1: 后续出现时应该只显示中文', () => {
    fc.assert(
      fc.property(termPairArbitrary, (term) => {
        const wrapper = mount(TermTooltip, {
          props: {
            term: term.zh,
            english: term.en,
            firstOccurrence: false,
          },
        })

        const termOnlyElement = wrapper.find('.term-only')
        
        // 验证只显示中文术语
        expect(termOnlyElement.exists()).toBe(true)
        expect(termOnlyElement.text()).toBe(term.zh)
        
        // 验证不包含英文术语（在可见文本中）
        const visibleText = wrapper.find('.term-only').text()
        expect(visibleText).not.toContain(term.en)
      }),
      { numRuns: 50 }
    )
  })

  it('属性 1: 首次出现应该有特殊样式标记', () => {
    fc.assert(
      fc.property(termPairArbitrary, (term) => {
        const wrapper = mount(TermTooltip, {
          props: {
            term: term.zh,
            english: term.en,
            firstOccurrence: true,
          },
        })

        // 验证有 first-occurrence 类
        expect(wrapper.classes()).toContain('first-occurrence')
        
        // 验证有 term-with-english 元素
        expect(wrapper.find('.term-with-english').exists()).toBe(true)
      }),
      { numRuns: 50 }
    )
  })

  it('属性 1: 后续出现应该有不同的样式标记', () => {
    fc.assert(
      fc.property(termPairArbitrary, (term) => {
        const wrapper = mount(TermTooltip, {
          props: {
            term: term.zh,
            english: term.en,
            firstOccurrence: false,
          },
        })

        // 验证没有 first-occurrence 类（或者不是首次出现）
        // 验证有 term-only 元素
        expect(wrapper.find('.term-only').exists()).toBe(true)
        
        // 验证没有 term-with-english 元素
        expect(wrapper.find('.term-with-english').exists()).toBe(false)
      }),
      { numRuns: 50 }
    )
  })

  it('属性 1: 相同术语的首次和后续出现应该显示相同的中文', () => {
    fc.assert(
      fc.property(termPairArbitrary, (term) => {
        const firstWrapper = mount(TermTooltip, {
          props: {
            term: term.zh,
            english: term.en,
            firstOccurrence: true,
          },
        })

        const laterWrapper = mount(TermTooltip, {
          props: {
            term: term.zh,
            english: term.en,
            firstOccurrence: false,
          },
        })

        // 两次都应该包含相同的中文术语
        expect(firstWrapper.text()).toContain(term.zh)
        expect(laterWrapper.text()).toContain(term.zh)
      }),
      { numRuns: 50 }
    )
  })

  it('属性 1: 提示框应该在后续出现时可用', async () => {
    await fc.assert(
      fc.asyncProperty(termPairArbitrary, async (term) => {
        const wrapper = mount(TermTooltip, {
          props: {
            term: term.zh,
            english: term.en,
            definition: term.definition,
            firstOccurrence: false,
          },
        })

        // 触发鼠标悬停
        await wrapper.trigger('mouseenter')
        await wrapper.vm.$nextTick()

        // 验证提示框出现
        const tooltip = wrapper.find('.tooltip-content')
        expect(tooltip.exists()).toBe(true)
        
        // 验证提示框包含中英文
        expect(tooltip.find('.tooltip-zh').text()).toBe(term.zh)
        expect(tooltip.find('.tooltip-en').text()).toBe(term.en)
      }),
      { numRuns: 20 } // 异步测试运行次数少一些
    )
  })

  it('属性 1: 首次出现时不应该显示提示框', async () => {
    await fc.assert(
      fc.asyncProperty(termPairArbitrary, async (term) => {
        const wrapper = mount(TermTooltip, {
          props: {
            term: term.zh,
            english: term.en,
            firstOccurrence: true,
          },
        })

        // 触发鼠标悬停
        await wrapper.trigger('mouseenter')
        await wrapper.vm.$nextTick()

        // 验证提示框不出现
        expect(wrapper.find('.tooltip-content').exists()).toBe(false)
      }),
      { numRuns: 20 }
    )
  })

  describe('边缘情况', () => {
    it('应该处理包含特殊字符的术语', () => {
      const specialTerms = [
        { zh: '用户-管理', en: 'User-Management' },
        { zh: 'Web UI', en: 'Web UI' },
        { zh: 'HTTP/2', en: 'HTTP/2' },
        { zh: 'Master/Worker', en: 'Master/Worker' },
      ]

      specialTerms.forEach((term) => {
        const wrapper = mount(TermTooltip, {
          props: {
            term: term.zh,
            english: term.en,
            firstOccurrence: true,
          },
        })

        expect(wrapper.text()).toContain(term.zh)
        expect(wrapper.text()).toContain(`(${term.en})`)
      })
    })

    it('应该处理很长的术语', () => {
      const longTerm = {
        zh: '这是一个非常非常长的中文术语名称',
        en: 'This Is A Very Very Long English Term Name',
      }

      const wrapper = mount(TermTooltip, {
        props: {
          term: longTerm.zh,
          english: longTerm.en,
          firstOccurrence: true,
        },
      })

      expect(wrapper.text()).toContain(longTerm.zh)
      expect(wrapper.text()).toContain(`(${longTerm.en})`)
    })

    it('应该处理单字符术语', () => {
      const shortTerm = {
        zh: '用',
        en: 'U',
      }

      const wrapper = mount(TermTooltip, {
        props: {
          term: shortTerm.zh,
          english: shortTerm.en,
          firstOccurrence: true,
        },
      })

      expect(wrapper.text()).toContain(shortTerm.zh)
      expect(wrapper.text()).toContain(`(${shortTerm.en})`)
    })
  })
})
