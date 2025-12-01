/**
 * EnhancedCodeBlock 功能测试
 * VitePress 内置了完善的代码块功能，我们验证其配置和功能
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'

describe('EnhancedCodeBlock 功能（VitePress 内置）', () => {
  describe('配置验证', () => {
    it('应该启用行号显示', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain('lineNumbers: true')
    })

    it('应该配置语法高亮主题', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain('theme:')
      expect(config).toContain('github-light')
      expect(config).toContain('github-dark')
    })

    it('应该配置代码字体', () => {
      const vars = readFileSync('.vitepress/theme/styles/vars.css', 'utf-8')
      expect(vars).toContain('--vp-font-family-mono')
      expect(vars).toContain('Geist Mono')
      expect(vars).toContain('JetBrains Mono')
    })
  })

  describe('复制功能', () => {
    it('自定义样式应该包含复制按钮样式', () => {
      const custom = readFileSync('.vitepress/theme/styles/custom.css', 'utf-8')
      expect(custom).toContain('copy')
      expect(custom).toContain('opacity')
    })

    it('复制按钮应该在悬停时显示', () => {
      const custom = readFileSync('.vitepress/theme/styles/custom.css', 'utf-8')
      expect(custom).toContain(':hover')
      expect(custom).toContain('button.copy')
    })
  })

  describe('行号功能', () => {
    it('配置应该启用行号', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain('lineNumbers: true')
    })

    it('CSS 应该定义代码行高', () => {
      const vars = readFileSync('.vitepress/theme/styles/vars.css', 'utf-8')
      expect(vars).toContain('--vp-code-line-height')
    })
  })

  describe('语法高亮', () => {
    it('应该使用 Shiki 主题', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      // VitePress 使用 Shiki，配置中应该有 theme
      expect(config).toContain('theme:')
    })

    it('应该支持浅色和深色模式', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain('light:')
      expect(config).toContain('dark:')
    })
  })

  describe('代码块样式', () => {
    it('应该定义代码块背景色', () => {
      const vars = readFileSync('.vitepress/theme/styles/vars.css', 'utf-8')
      expect(vars).toContain('--vp-code-block-bg')
    })

    it('应该定义代码字体大小', () => {
      const vars = readFileSync('.vitepress/theme/styles/vars.css', 'utf-8')
      expect(vars).toContain('--vp-code-font-size')
    })

    it('应该有圆角样式', () => {
      const custom = readFileSync('.vitepress/theme/styles/custom.css', 'utf-8')
      expect(custom).toContain('border-radius')
    })
  })

  describe('文档示例', () => {
    it('首页应该有完整的代码块示例', () => {
      const index = readFileSync('docs/index.md', 'utf-8')
      
      // 应该有 Python 代码块
      expect(index).toContain('```python')
      
      // 应该有行号高亮
      expect(index).toMatch(/```python.*{.*}/)
      
      // 应该有 showLineNumbers
      expect(index).toContain('showLineNumbers')
      
      // 应该有 title
      expect(index).toContain('title=')
    })

    it('安装文档应该有 bash 代码块', () => {
      const install = readFileSync('docs/getting-started/installation.md', 'utf-8')
      
      // 应该有 bash 代码块
      expect(install).toContain('```bash')
      
      // 应该有 $ 前缀
      expect(install).toContain('$ ')
    })
  })

  describe('代码块元数据支持', () => {
    it('应该支持 title 属性', () => {
      const index = readFileSync('docs/index.md', 'utf-8')
      expect(index).toContain('title="locustfile.py"')
    })

    it('应该支持行号高亮', () => {
      const index = readFileSync('docs/index.md', 'utf-8')
      // {1-3} 格式的行号高亮
      expect(index).toMatch(/{[\d,-]+}/)
    })

    it('应该支持 showLineNumbers', () => {
      const index = readFileSync('docs/index.md', 'utf-8')
      expect(index).toContain('showLineNumbers')
    })
  })

  describe('代码块组样式', () => {
    it('应该有代码组样式', () => {
      const custom = readFileSync('.vitepress/theme/styles/custom.css', 'utf-8')
      expect(custom).toContain('.vp-code-group')
    })

    it('应该有代码组间距', () => {
      const custom = readFileSync('.vitepress/theme/styles/custom.css', 'utf-8')
      expect(custom).toContain('margin')
    })
  })

  describe('行高亮功能', () => {
    it('应该有行高亮样式', () => {
      const custom = readFileSync('.vitepress/theme/styles/custom.css', 'utf-8')
      expect(custom).toContain('.has-focused')
      expect(custom).toContain('.focused')
    })

    it('非高亮行应该有透明度变化', () => {
      const custom = readFileSync('.vitepress/theme/styles/custom.css', 'utf-8')
      expect(custom).toContain('opacity')
    })
  })
})
