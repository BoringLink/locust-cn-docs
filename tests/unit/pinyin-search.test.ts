import { describe, it, expect } from 'vitest'
import {
  toPinyin,
  toPinyinInitials,
  matchesPinyinSearch,
  createSearchIndex,
  searchInIndex,
} from '../../.vitepress/utils/pinyin-search'

describe('拼音搜索工具', () => {
  describe('toPinyin', () => {
    it('应该将中文转换为拼音', () => {
      expect(toPinyin('用户')).toBe('yonghu')
      expect(toPinyin('任务')).toBe('renwu')
      expect(toPinyin('性能测试')).toBe('xingnengceshi')
    })

    it('应该保留英文', () => {
      expect(toPinyin('User')).toBe('User')
      expect(toPinyin('Locust')).toBe('Locust')
    })

    it('应该处理混合文本', () => {
      const result = toPinyin('Locust用户')
      expect(result).toContain('Locust')
      expect(result).toContain('yonghu')
    })
  })

  describe('toPinyinInitials', () => {
    it('应该将中文转换为拼音首字母', () => {
      expect(toPinyinInitials('用户')).toBe('yh')
      expect(toPinyinInitials('任务')).toBe('rw')
      expect(toPinyinInitials('性能测试')).toBe('xncs')
    })

    it('应该保留英文首字母', () => {
      const result = toPinyinInitials('User')
      expect(result).toBeTruthy()
    })
  })

  describe('matchesPinyinSearch', () => {
    it('应该匹配中文', () => {
      expect(matchesPinyinSearch('用户管理', '用户')).toBe(true)
      expect(matchesPinyinSearch('任务调度', '任务')).toBe(true)
    })

    it('应该匹配全拼', () => {
      expect(matchesPinyinSearch('用户', 'yonghu')).toBe(true)
      expect(matchesPinyinSearch('任务', 'renwu')).toBe(true)
    })

    it('应该匹配首字母', () => {
      expect(matchesPinyinSearch('用户', 'yh')).toBe(true)
      expect(matchesPinyinSearch('任务', 'rw')).toBe(true)
    })

    it('应该不区分大小写', () => {
      expect(matchesPinyinSearch('用户', 'YONGHU')).toBe(true)
      expect(matchesPinyinSearch('用户', 'YH')).toBe(true)
    })

    it('应该匹配部分拼音', () => {
      expect(matchesPinyinSearch('用户管理', 'yong')).toBe(true)
      expect(matchesPinyinSearch('性能测试', 'xing')).toBe(true)
    })

    it('不匹配时应该返回 false', () => {
      expect(matchesPinyinSearch('用户', 'abc')).toBe(false)
      expect(matchesPinyinSearch('任务', 'xyz')).toBe(false)
    })
  })

  describe('createSearchIndex', () => {
    it('应该创建搜索索引', () => {
      const index = createSearchIndex('用户管理')
      
      expect(index.text).toBe('用户管理')
      expect(index.pinyin).toBe('yonghuguanli')
      expect(index.initials).toBe('yhgl')
    })

    it('应该处理英文', () => {
      const index = createSearchIndex('User Management')
      
      expect(index.text).toBe('User Management')
      expect(index.pinyin).toBeTruthy()
      expect(index.initials).toBeTruthy()
    })
  })

  describe('searchInIndex', () => {
    it('应该在索引中搜索中文', () => {
      const index = createSearchIndex('用户管理系统')
      
      expect(searchInIndex(index, '用户')).toBe(true)
      expect(searchInIndex(index, '管理')).toBe(true)
    })

    it('应该在索引中搜索拼音', () => {
      const index = createSearchIndex('用户管理')
      
      expect(searchInIndex(index, 'yonghu')).toBe(true)
      expect(searchInIndex(index, 'guanli')).toBe(true)
    })

    it('应该在索引中搜索首字母', () => {
      const index = createSearchIndex('用户管理')
      
      expect(searchInIndex(index, 'yh')).toBe(true)
      expect(searchInIndex(index, 'gl')).toBe(true)
    })

    it('不匹配时应该返回 false', () => {
      const index = createSearchIndex('用户管理')
      
      expect(searchInIndex(index, 'xyz')).toBe(false)
    })
  })

  describe('实际使用场景', () => {
    const terms = ['用户', '任务', '分布式模式', '主节点', '工作节点', '孵化速率']

    it('应该能搜索 Locust 术语（中文）', () => {
      const results = terms.filter((term) => matchesPinyinSearch(term, '用户'))
      expect(results).toContain('用户')
    })

    it('应该能搜索 Locust 术语（全拼）', () => {
      const results = terms.filter((term) => matchesPinyinSearch(term, 'yonghu'))
      expect(results).toContain('用户')
    })

    it('应该能搜索 Locust 术语（首字母）', () => {
      const results = terms.filter((term) => matchesPinyinSearch(term, 'yh'))
      expect(results).toContain('用户')
    })

    it('应该能搜索多字术语', () => {
      const results = terms.filter((term) => matchesPinyinSearch(term, 'fenbushi'))
      expect(results).toContain('分布式模式')
    })

    it('应该能用首字母搜索多字术语', () => {
      const results = terms.filter((term) => matchesPinyinSearch(term, 'fbsms'))
      expect(results).toContain('分布式模式')
    })
  })
})
