import { describe, it, expect, beforeAll } from 'vitest'
import {
  validateTermsDatabase,
  loadTermsDatabase,
  getChineseTerm,
  getTermById,
  searchTerms,
  getTermsByCategory,
  getAllCategories,
  validateTermReferences,
  formatTermWithEnglish,
  checkTranslationConsistency,
  type TermsDatabase,
} from '../../.vitepress/utils/terms'

describe('术语管理系统', () => {
  let termsDb: TermsDatabase

  beforeAll(async () => {
    termsDb = await loadTermsDatabase()
  })

  describe('validateTermsDatabase', () => {
    it('应该验证有效的术语表', () => {
      const validDb = {
        version: '1.0.0',
        lastUpdated: '2024-11-24',
        terms: {
          test: {
            zh: '测试',
            en: 'Test',
            definition: '测试定义',
            category: '测试分类',
            relatedTerms: [],
          },
        },
      }

      expect(() => validateTermsDatabase(validDb)).not.toThrow()
    })

    it('应该拒绝缺少 version 的数据', () => {
      const invalidDb = {
        lastUpdated: '2024-11-24',
        terms: {},
      }

      expect(() => validateTermsDatabase(invalidDb)).toThrow('version')
    })

    it('应该拒绝缺少 terms 的数据', () => {
      const invalidDb = {
        version: '1.0.0',
        lastUpdated: '2024-11-24',
      }

      expect(() => validateTermsDatabase(invalidDb)).toThrow('terms')
    })

    it('应该拒绝术语条目缺少必需字段', () => {
      const invalidDb = {
        version: '1.0.0',
        lastUpdated: '2024-11-24',
        terms: {
          test: {
            zh: '测试',
            en: 'Test',
            // 缺少 definition, category, relatedTerms
          },
        },
      }

      expect(() => validateTermsDatabase(invalidDb)).toThrow()
    })

    it('应该拒绝空字符串字段', () => {
      const invalidDb = {
        version: '1.0.0',
        lastUpdated: '2024-11-24',
        terms: {
          test: {
            zh: '',
            en: 'Test',
            definition: '定义',
            category: '分类',
            relatedTerms: [],
          },
        },
      }

      expect(() => validateTermsDatabase(invalidDb)).toThrow('zh')
    })
  })

  describe('loadTermsDatabase', () => {
    it('应该成功加载术语表', async () => {
      const db = await loadTermsDatabase()
      expect(db).toBeDefined()
      expect(db.version).toBeDefined()
      expect(db.terms).toBeDefined()
      expect(Object.keys(db.terms).length).toBeGreaterThan(0)
    })

    it('加载的术语表应该包含核心术语', async () => {
      const db = await loadTermsDatabase()
      expect(db.terms).toHaveProperty('user')
      expect(db.terms).toHaveProperty('task')
      expect(db.terms).toHaveProperty('locust')
    })
  })

  describe('getChineseTerm', () => {
    it('应该根据英文术语返回中文翻译', () => {
      const zh = getChineseTerm(termsDb, 'User')
      expect(zh).toBe('用户')
    })

    it('应该不区分大小写', () => {
      const zh1 = getChineseTerm(termsDb, 'user')
      const zh2 = getChineseTerm(termsDb, 'USER')
      const zh3 = getChineseTerm(termsDb, 'User')
      expect(zh1).toBe(zh2)
      expect(zh2).toBe(zh3)
    })

    it('应该对不存在的术语返回 null', () => {
      const zh = getChineseTerm(termsDb, 'NonExistentTerm')
      expect(zh).toBeNull()
    })
  })

  describe('getTermById', () => {
    it('应该根据 ID 返回术语信息', () => {
      const term = getTermById(termsDb, 'user')
      expect(term).toBeDefined()
      expect(term?.zh).toBe('用户')
      expect(term?.en).toBe('User')
    })

    it('应该对不存在的 ID 返回 null', () => {
      const term = getTermById(termsDb, 'non-existent')
      expect(term).toBeNull()
    })
  })

  describe('searchTerms', () => {
    it('应该能搜索中文术语', () => {
      const results = searchTerms(termsDb, '用户')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some((t) => t.zh === '用户')).toBe(true)
    })

    it('应该能搜索英文术语', () => {
      const results = searchTerms(termsDb, 'user')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some((t) => t.en === 'User')).toBe(true)
    })

    it('应该能搜索定义内容', () => {
      const results = searchTerms(termsDb, '性能测试')
      expect(results.length).toBeGreaterThan(0)
    })

    it('应该不区分大小写', () => {
      const results1 = searchTerms(termsDb, 'user')
      const results2 = searchTerms(termsDb, 'USER')
      expect(results1.length).toBe(results2.length)
    })
  })

  describe('getTermsByCategory', () => {
    it('应该返回指定分类的所有术语', () => {
      const coreTerms = getTermsByCategory(termsDb, '核心概念')
      expect(coreTerms.length).toBeGreaterThan(0)
      expect(coreTerms.every((t) => t.category === '核心概念')).toBe(true)
    })

    it('应该对不存在的分类返回空数组', () => {
      const results = getTermsByCategory(termsDb, '不存在的分类')
      expect(results).toEqual([])
    })
  })

  describe('getAllCategories', () => {
    it('应该返回所有分类', () => {
      const categories = getAllCategories(termsDb)
      expect(categories.length).toBeGreaterThan(0)
      expect(categories).toContain('核心概念')
    })

    it('返回的分类应该是排序的', () => {
      const categories = getAllCategories(termsDb)
      const sorted = [...categories].sort()
      expect(categories).toEqual(sorted)
    })

    it('返回的分类应该没有重复', () => {
      const categories = getAllCategories(termsDb)
      const unique = Array.from(new Set(categories))
      expect(categories.length).toBe(unique.length)
    })
  })

  describe('validateTermReferences', () => {
    it('实际术语表的引用应该都是有效的', () => {
      const errors = validateTermReferences(termsDb)
      expect(errors).toEqual([])
    })

    it('应该检测无效的术语引用', () => {
      const invalidDb: TermsDatabase = {
        version: '1.0.0',
        lastUpdated: '2024-11-24',
        terms: {
          test: {
            zh: '测试',
            en: 'Test',
            definition: '定义',
            category: '分类',
            relatedTerms: ['non-existent'],
          },
        },
      }

      const errors = validateTermReferences(invalidDb)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('non-existent')
    })
  })

  describe('formatTermWithEnglish', () => {
    it('应该格式化为"中文(English)"格式', () => {
      const term = getTermById(termsDb, 'user')!
      const formatted = formatTermWithEnglish(term)
      expect(formatted).toBe('用户(User)')
    })
  })

  describe('checkTranslationConsistency', () => {
    it('实际术语表应该没有翻译不一致', () => {
      const inconsistencies = checkTranslationConsistency(termsDb)
      expect(inconsistencies.size).toBe(0)
    })

    it('应该检测翻译不一致', () => {
      const inconsistentDb: TermsDatabase = {
        version: '1.0.0',
        lastUpdated: '2024-11-24',
        terms: {
          test1: {
            zh: '测试',
            en: 'Test',
            definition: '定义1',
            category: '分类',
            relatedTerms: [],
          },
          test2: {
            zh: '试验',
            en: 'Test',
            definition: '定义2',
            category: '分类',
            relatedTerms: [],
          },
        },
      }

      const inconsistencies = checkTranslationConsistency(inconsistentDb)
      expect(inconsistencies.size).toBeGreaterThan(0)
      expect(inconsistencies.get('test')).toEqual(['测试', '试验'])
    })
  })

  describe('术语表内容质量', () => {
    it('所有术语应该有非空的中文翻译', () => {
      for (const [id, term] of Object.entries(termsDb.terms)) {
        expect(term.zh.trim()).not.toBe('')
      }
    })

    it('所有术语应该有非空的英文原文', () => {
      for (const [id, term] of Object.entries(termsDb.terms)) {
        expect(term.en.trim()).not.toBe('')
      }
    })

    it('所有术语应该有详细定义', () => {
      for (const [id, term] of Object.entries(termsDb.terms)) {
        expect(term.definition.trim()).not.toBe('')
        expect(term.definition.length).toBeGreaterThan(5)
      }
    })

    it('所有术语应该有分类', () => {
      for (const [id, term] of Object.entries(termsDb.terms)) {
        expect(term.category.trim()).not.toBe('')
      }
    })

    it('Hatch Rate 应该翻译为"孵化速率"', () => {
      const term = getTermById(termsDb, 'hatch-rate')
      expect(term?.zh).toBe('孵化速率')
    })
  })
})
