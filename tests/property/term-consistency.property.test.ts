/**
 * 属性测试：术语翻译一致性
 * 功能: locust-cn-docs, 属性 3: 术语翻译一致性
 * 验证需求: 1.3
 * 
 * 对于任何在术语表中定义的英文术语，在所有文档页面中的中文翻译应完全一致。
 */

import { describe, it, expect, beforeAll } from 'vitest'
import * as fc from 'fast-check'
import { loadTermsDatabase, checkTranslationConsistency, getChineseTerm, type TermsDatabase } from '../../.vitepress/utils/terms'

describe('属性测试：术语翻译一致性', () => {
  let termsDb: TermsDatabase

  beforeAll(async () => {
    termsDb = await loadTermsDatabase()
  })

  it('属性 3: 术语表中不应该有翻译不一致的情况', () => {
    const inconsistencies = checkTranslationConsistency(termsDb)
    
    // 验证没有不一致的翻译
    expect(inconsistencies.size).toBe(0)
    
    // 如果有不一致，输出详细信息
    if (inconsistencies.size > 0) {
      console.error('发现翻译不一致的术语:')
      for (const [en, zhList] of inconsistencies.entries()) {
        console.error(`  ${en}: ${zhList.join(', ')}`)
      }
    }
  })

  it('属性 3: 相同的英文术语应该总是返回相同的中文翻译', () => {
    // 获取所有英文术语
    const englishTerms = Object.values(termsDb.terms).map(t => t.en)
    
    fc.assert(
      fc.property(fc.constantFrom(...englishTerms), (englishTerm) => {
        // 多次查询同一个术语
        const zh1 = getChineseTerm(termsDb, englishTerm)
        const zh2 = getChineseTerm(termsDb, englishTerm)
        const zh3 = getChineseTerm(termsDb, englishTerm)
        
        // 所有查询结果应该相同
        expect(zh1).toBe(zh2)
        expect(zh2).toBe(zh3)
        expect(zh1).not.toBeNull()
      }),
      { numRuns: 50 }
    )
  })

  it('属性 3: 不区分大小写查询应该返回相同的翻译', () => {
    const englishTerms = Object.values(termsDb.terms).map(t => t.en)
    
    fc.assert(
      fc.property(fc.constantFrom(...englishTerms), (englishTerm) => {
        const lower = getChineseTerm(termsDb, englishTerm.toLowerCase())
        const upper = getChineseTerm(termsDb, englishTerm.toUpperCase())
        const original = getChineseTerm(termsDb, englishTerm)
        
        // 所有形式应该返回相同的翻译
        expect(lower).toBe(upper)
        expect(upper).toBe(original)
      }),
      { numRuns: 50 }
    )
  })

  it('属性 3: 每个术语ID应该对应唯一的英文-中文对', () => {
    const termIds = Object.keys(termsDb.terms)
    
    fc.assert(
      fc.property(fc.constantFrom(...termIds), (termId) => {
        const term = termsDb.terms[termId]
        
        // 通过英文查询应该返回对应的中文
        const zh = getChineseTerm(termsDb, term.en)
        expect(zh).toBe(term.zh)
      }),
      { numRuns: 50 }
    )
  })

  describe('特定术语一致性验证', () => {
    it('User 应该始终翻译为"用户"', () => {
      const zh = getChineseTerm(termsDb, 'User')
      expect(zh).toBe('用户')
      
      // 不区分大小写
      expect(getChineseTerm(termsDb, 'user')).toBe('用户')
      expect(getChineseTerm(termsDb, 'USER')).toBe('用户')
    })

    it('Task 应该始终翻译为"任务"', () => {
      const zh = getChineseTerm(termsDb, 'Task')
      expect(zh).toBe('任务')
      
      expect(getChineseTerm(termsDb, 'task')).toBe('任务')
      expect(getChineseTerm(termsDb, 'TASK')).toBe('任务')
    })

    it('Hatch Rate 应该始终翻译为"孵化速率"（不是"孵化率"）', () => {
      const zh = getChineseTerm(termsDb, 'Hatch Rate')
      expect(zh).toBe('孵化速率')
      
      // 验证不是其他可能的翻译
      expect(zh).not.toBe('孵化率')
      expect(zh).not.toBe('生成速率')
    })

    it('Distributed Mode 应该始终翻译为"分布式模式"', () => {
      const zh = getChineseTerm(termsDb, 'Distributed Mode')
      expect(zh).toBe('分布式模式')
    })

    it('Master 应该始终翻译为"主节点"', () => {
      const zh = getChineseTerm(termsDb, 'Master')
      expect(zh).toBe('主节点')
    })

    it('Worker 应该始终翻译为"工作节点"', () => {
      const zh = getChineseTerm(termsDb, 'Worker')
      expect(zh).toBe('工作节点')
    })

    it('TaskSet 应该始终翻译为"任务集"', () => {
      const zh = getChineseTerm(termsDb, 'TaskSet')
      expect(zh).toBe('任务集')
    })

    it('Load Test 应该始终翻译为"负载测试"', () => {
      const zh = getChineseTerm(termsDb, 'Load Test')
      expect(zh).toBe('负载测试')
    })

    it('Performance Test 应该始终翻译为"性能测试"', () => {
      const zh = getChineseTerm(termsDb, 'Performance Test')
      expect(zh).toBe('性能测试')
    })

    it('Web UI 应该保持为"Web UI"', () => {
      const zh = getChineseTerm(termsDb, 'Web UI')
      expect(zh).toBe('Web UI')
    })
  })

  describe('翻译映射完整性', () => {
    it('所有术语都应该有唯一的英文-中文映射', () => {
      const enToZh = new Map<string, string>()
      
      for (const term of Object.values(termsDb.terms)) {
        const en = term.en.toLowerCase()
        
        if (enToZh.has(en)) {
          // 如果已存在，应该是相同的中文翻译
          expect(enToZh.get(en)).toBe(term.zh)
        } else {
          enToZh.set(en, term.zh)
        }
      }
    })

    it('不应该有两个不同的英文术语翻译成相同的中文', () => {
      const zhToEn = new Map<string, string[]>()
      
      for (const term of Object.values(termsDb.terms)) {
        if (!zhToEn.has(term.zh)) {
          zhToEn.set(term.zh, [])
        }
        zhToEn.get(term.zh)!.push(term.en)
      }
      
      // 检查是否有中文对应多个不同的英文
      for (const [zh, enList] of zhToEn.entries()) {
        if (enList.length > 1) {
          // 如果有多个英文，它们应该是相同的（只是大小写不同）
          const uniqueEn = new Set(enList.map(e => e.toLowerCase()))
          expect(uniqueEn.size).toBe(1)
        }
      }
    })
  })

  describe('边缘情况', () => {
    it('不存在的术语应该返回 null', () => {
      const zh = getChineseTerm(termsDb, 'NonExistentTerm')
      expect(zh).toBeNull()
    })

    it('空字符串应该返回 null', () => {
      const zh = getChineseTerm(termsDb, '')
      expect(zh).toBeNull()
    })

    it('只有空格的字符串应该返回 null', () => {
      const zh = getChineseTerm(termsDb, '   ')
      expect(zh).toBeNull()
    })
  })

  describe('术语表质量检查', () => {
    it('所有术语的中文翻译应该是非空字符串', () => {
      for (const [id, term] of Object.entries(termsDb.terms)) {
        expect(term.zh).toBeTruthy()
        expect(term.zh.trim()).not.toBe('')
      }
    })

    it('所有术语的英文原文应该是非空字符串', () => {
      for (const [id, term] of Object.entries(termsDb.terms)) {
        expect(term.en).toBeTruthy()
        expect(term.en.trim()).not.toBe('')
      }
    })

    it('中文翻译不应该包含多余的空格', () => {
      for (const [id, term] of Object.entries(termsDb.terms)) {
        expect(term.zh).toBe(term.zh.trim())
        expect(term.zh).not.toMatch(/\s{2,}/) // 不应该有连续空格
      }
    })

    it('英文原文不应该包含多余的空格', () => {
      for (const [id, term] of Object.entries(termsDb.terms)) {
        expect(term.en).toBe(term.en.trim())
        // 允许单个空格（如 "Distributed Mode"），但不允许连续空格
        expect(term.en).not.toMatch(/\s{2,}/)
      }
    })
  })
})
