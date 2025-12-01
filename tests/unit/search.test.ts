import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'

describe('搜索功能', () => {
  describe('搜索配置', () => {
    it('应该启用本地搜索', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain('search:')
      expect(config).toContain("provider: 'local'")
    })

    it('应该配置中文搜索文本', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain('搜索文档')
    })

    it('应该配置搜索占位符', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain('buttonText')
      expect(config).toContain('buttonAriaLabel')
    })

    it('应该配置搜索模态框文本', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain('modal:')
      expect(config).toContain('noResultsText')
    })

    it('应该配置中文本地化', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain('locales:')
      expect(config).toContain('root:')
      expect(config).toContain('translations:')
    })
  })

  describe('搜索文本本地化', () => {
    it('应该有"无法找到相关结果"提示', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain('无法找到相关结果')
    })

    it('应该有"清除查询条件"提示', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain('清除查询条件')
    })

    it('应该有导航提示文本', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain('selectText')
      expect(config).toContain('navigateText')
    })
  })

  describe('搜索功能可用性', () => {
    it('配置应该完整', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      
      // 验证搜索配置的完整性
      expect(config).toContain('search:')
      expect(config).toContain('provider:')
      expect(config).toContain('options:')
    })

    it('应该支持中文搜索', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      
      // 本地搜索默认支持中文
      expect(config).toContain("provider: 'local'")
    })
  })

  describe('文档内容可搜索性', () => {
    it('文档应该有标题', () => {
      const index = readFileSync('docs/index.md', 'utf-8')
      expect(index).toContain('title:')
    })

    it('文档应该有描述或 tagline', () => {
      const index = readFileSync('docs/index.md', 'utf-8')
      // 首页使用 tagline，其他页面使用 description
      const hasDescription = index.includes('description:') || index.includes('tagline:')
      expect(hasDescription).toBe(true)
    })

    it('安装文档应该有标题', () => {
      const install = readFileSync('docs/getting-started/installation.md', 'utf-8')
      expect(install).toContain('title:')
      expect(install).toContain('安装')
    })

    it('文档应该有正文内容', () => {
      const install = readFileSync('docs/getting-started/installation.md', 'utf-8')
      expect(install.length).toBeGreaterThan(100)
    })
  })

  describe('搜索性能', () => {
    it('应该使用本地搜索（更快）', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain("provider: 'local'")
    })

    it('配置应该优化搜索体验', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      
      // 应该有完整的本地化配置
      expect(config).toContain('translations:')
    })
  })

  describe('搜索界面', () => {
    it('应该有搜索按钮文本', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain('buttonText')
    })

    it('应该有搜索按钮无障碍标签', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain('buttonAriaLabel')
    })

    it('应该有搜索结果提示', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain('noResultsText')
    })
  })
})
