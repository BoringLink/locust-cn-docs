/**
 * 属性测试：拼音搜索匹配
 * 功能: locust-cn-docs, 属性 8: 拼音搜索匹配
 * 验证需求: 6.2
 * 
 * 对于任何中文文档内容，使用对应的拼音（全拼或首字母）进行搜索应返回包含该内容的页面。
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { matchesPinyinSearch, toPinyin, toPinyinInitials } from '../../.vitepress/utils/pinyin-search'

describe('属性测试：拼音搜索匹配', () => {
  const chineseTerms = ['用户', '任务', '分布式模式', '主节点', '工作节点', '孵化速率', '等待时间', '任务集', '负载测试', '性能测试']

  it('属性 8: 中文内容应该能用全拼搜索到', () => {
    fc.assert(
      fc.property(fc.constantFrom(...chineseTerms), (term) => {
        const fullPinyin = toPinyin(term)
        expect(matchesPinyinSearch(term, fullPinyin)).toBe(true)
      }),
      { numRuns: 30 }
    )
  })

  it('属性 8: 中文内容应该能用首字母搜索到', () => {
    fc.assert(
      fc.property(fc.constantFrom(...chineseTerms), (term) => {
        const initials = toPinyinInitials(term)
        expect(matchesPinyinSearch(term, initials)).toBe(true)
      }),
      { numRuns: 30 }
    )
  })

  it('属性 8: 拼音搜索不区分大小写', () => {
    fc.assert(
      fc.property(fc.constantFrom(...chineseTerms), (term) => {
        const pinyin = toPinyin(term)
        
        expect(matchesPinyinSearch(term, pinyin.toLowerCase())).toBe(true)
        expect(matchesPinyinSearch(term, pinyin.toUpperCase())).toBe(true)
      }),
      { numRuns: 30 }
    )
  })

  it('属性 8: 部分拼音也应该能匹配', () => {
    fc.assert(
      fc.property(fc.constantFrom(...chineseTerms), (term) => {
        const pinyin = toPinyin(term)
        if (pinyin.length > 2) {
          const partial = pinyin.substring(0, 3)
          expect(matchesPinyinSearch(term, partial)).toBe(true)
        }
      }),
      { numRuns: 30 }
    )
  })

  it('属性 8: 中文直接搜索应该总是匹配', () => {
    fc.assert(
      fc.property(fc.constantFrom(...chineseTerms), (term) => {
        expect(matchesPinyinSearch(term, term)).toBe(true)
      }),
      { numRuns: 30 }
    )
  })

  describe('特定术语验证', () => {
    it('用户 应该能用 yonghu 搜索到', () => {
      expect(matchesPinyinSearch('用户', 'yonghu')).toBe(true)
      expect(matchesPinyinSearch('用户', 'yh')).toBe(true)
    })

    it('任务 应该能用 renwu 搜索到', () => {
      expect(matchesPinyinSearch('任务', 'renwu')).toBe(true)
      expect(matchesPinyinSearch('任务', 'rw')).toBe(true)
    })

    it('分布式模式 应该能用 fenbushimoshi 搜索到', () => {
      expect(matchesPinyinSearch('分布式模式', 'fenbushimoshi')).toBe(true)
      expect(matchesPinyinSearch('分布式模式', 'fbsms')).toBe(true)
    })

    it('孵化速率 应该能用拼音搜索到', () => {
      // 实际拼音可能是 fuhuasulu 或其他变体
      const pinyin = toPinyin('孵化速率')
      expect(matchesPinyinSearch('孵化速率', pinyin)).toBe(true)
      expect(matchesPinyinSearch('孵化速率', 'fhsl')).toBe(true)
    })
  })

  describe('边缘情况', () => {
    it('空字符串会匹配（includes 行为）', () => {
      // JavaScript 的 includes('') 总是返回 true
      expect(matchesPinyinSearch('用户', '')).toBe(true)
    })

    it('完全不相关的拼音不应该匹配', () => {
      expect(matchesPinyinSearch('用户', 'xyz')).toBe(false)
      expect(matchesPinyinSearch('任务', 'abc')).toBe(false)
    })

    it('应该处理单字', () => {
      expect(matchesPinyinSearch('用', 'yong')).toBe(true)
      expect(matchesPinyinSearch('用', 'y')).toBe(true)
    })
  })
})
