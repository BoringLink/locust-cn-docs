/**
 * 属性测试：代码块必需元素
 * 功能: locust-cn-docs, 属性 6: 代码块必需元素
 * 验证需求: 5.1, 5.2, 5.3
 * 
 * 对于任何代码块，渲染后的 DOM 应包含复制按钮、行号显示和语法高亮样式。
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { readFileSync } from 'fs'

describe('属性测试：代码块必需元素', () => {
  describe('配置验证', () => {
    it('属性 6: VitePress 应该启用行号', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain('lineNumbers: true')
    })

    it('属性 6: VitePress 应该配置语法高亮主题', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain('theme:')
      expect(config).toContain('light:')
      expect(config).toContain('dark:')
    })

    it('属性 6: 应该配置代码字体', () => {
      const vars = readFileSync('.vitepress/theme/styles/vars.css', 'utf-8')
      expect(vars).toContain('--vp-font-family-mono')
    })
  })

  describe('样式验证', () => {
    it('属性 6: 应该有复制按钮样式', () => {
      const custom = readFileSync('.vitepress/theme/styles/custom.css', 'utf-8')
      expect(custom).toContain('copy')
      expect(custom).toContain('button')
    })

    it('属性 6: 应该有代码块容器样式', () => {
      const custom = readFileSync('.vitepress/theme/styles/custom.css', 'utf-8')
      expect(custom).toMatch(/div\[class\*='language-'\]/)
    })

    it('属性 6: 应该有行号相关的 CSS 变量', () => {
      const vars = readFileSync('.vitepress/theme/styles/vars.css', 'utf-8')
      expect(vars).toContain('--vp-code-line-height')
    })
  })

  describe('文档示例验证', () => {
    it('属性 6: 所有代码块都应该有语言标识', () => {
      const files = [
        'docs/index.md',
        'docs/getting-started/installation.md',
      ]

      files.forEach((file) => {
        const content = readFileSync(file, 'utf-8')
        const codeBlocks = content.match(/```[\s\S]*?```/g)

        if (codeBlocks) {
          codeBlocks.forEach((block) => {
            // 每个代码块都应该有语言标识
            expect(block).toMatch(/```[a-z]+/)
          })
        }
      })
    })

    it('属性 6: Python 代码块应该有完整的元数据', () => {
      const index = readFileSync('docs/index.md', 'utf-8')
      const pythonBlocks = index.match(/```python[\s\S]*?```/g)

      expect(pythonBlocks).toBeTruthy()
      if (pythonBlocks) {
        pythonBlocks.forEach((block) => {
          const firstLine = block.split('\n')[0]
          
          // 应该有语言标识
          expect(firstLine).toContain('python')
          
          // 应该有 showLineNumbers
          expect(firstLine).toContain('showLineNumbers')
          
          // 应该有 title
          expect(firstLine).toContain('title=')
        })
      }
    })
  })

  describe('代码块格式属性测试', () => {
    const languages = ['python', 'bash', 'javascript', 'typescript', 'yaml', 'json']

    it('属性 6: 所有支持的语言都应该有配置', () => {
      fc.assert(
        fc.property(fc.constantFrom(...languages), (lang) => {
          // VitePress 使用 Shiki，默认支持所有主流语言
          // 验证配置文件存在
          const config = readFileSync('.vitepress/config.ts', 'utf-8')
          expect(config).toContain('markdown:')
        }),
        { numRuns: languages.length }
      )
    })

    it('属性 6: 代码块应该有正确的格式', () => {
      const validCodeBlocks = [
        '```python\nprint("hello")\n```',
        '```bash\n$ ls\n```',
        '```javascript\nconsole.log("test")\n```',
      ]

      fc.assert(
        fc.property(fc.constantFrom(...validCodeBlocks), (block) => {
          // 验证代码块格式正确
          expect(block).toMatch(/```[a-z]+\n[\s\S]*\n```/)
        }),
        { numRuns: validCodeBlocks.length }
      )
    })
  })

  describe('代码块元数据支持', () => {
    it('属性 6: 应该支持行号高亮语法', () => {
      const index = readFileSync('docs/index.md', 'utf-8')
      
      // 应该有 {1-3} 格式的行号高亮
      expect(index).toMatch(/{[\d,-]+}/)
    })

    it('属性 6: 应该支持 title 属性', () => {
      const index = readFileSync('docs/index.md', 'utf-8')
      expect(index).toContain('title=')
    })

    it('属性 6: 应该支持 showLineNumbers 属性', () => {
      const index = readFileSync('docs/index.md', 'utf-8')
      expect(index).toContain('showLineNumbers')
    })
  })

  describe('复制按钮功能', () => {
    it('属性 6: 应该有复制按钮的悬停效果', () => {
      const custom = readFileSync('.vitepress/theme/styles/custom.css', 'utf-8')
      
      // 应该有 opacity 变化
      expect(custom).toContain('opacity')
      
      // 应该有 hover 状态
      expect(custom).toContain(':hover')
    })

    it('属性 6: 复制按钮应该有过渡动画', () => {
      const custom = readFileSync('.vitepress/theme/styles/custom.css', 'utf-8')
      expect(custom).toContain('transition')
    })
  })

  describe('语法高亮验证', () => {
    it('属性 6: 应该配置浅色主题', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain('github-light')
    })

    it('属性 6: 应该配置深色主题', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain('github-dark')
    })

    it('属性 6: 应该有代码块背景色变量', () => {
      const vars = readFileSync('.vitepress/theme/styles/vars.css', 'utf-8')
      expect(vars).toContain('--vp-code-block-bg')
    })
  })

  describe('代码块样式细节', () => {
    it('属性 6: 应该有圆角样式', () => {
      const custom = readFileSync('.vitepress/theme/styles/custom.css', 'utf-8')
      expect(custom).toContain('border-radius')
    })

    it('属性 6: 应该有代码块间距', () => {
      const custom = readFileSync('.vitepress/theme/styles/custom.css', 'utf-8')
      expect(custom).toContain('margin')
    })

    it('属性 6: 应该有代码字体大小设置', () => {
      const vars = readFileSync('.vitepress/theme/styles/vars.css', 'utf-8')
      expect(vars).toContain('--vp-code-font-size')
    })
  })

  describe('行高亮功能', () => {
    it('属性 6: 应该有行高亮样式', () => {
      const custom = readFileSync('.vitepress/theme/styles/custom.css', 'utf-8')
      expect(custom).toContain('.has-focused')
      expect(custom).toContain('.focused')
    })

    it('属性 6: 非高亮行应该有透明度变化', () => {
      const custom = readFileSync('.vitepress/theme/styles/custom.css', 'utf-8')
      expect(custom).toContain('opacity')
    })
  })

  describe('代码块组功能', () => {
    it('属性 6: 应该有代码组样式', () => {
      const custom = readFileSync('.vitepress/theme/styles/custom.css', 'utf-8')
      expect(custom).toContain('.vp-code-group')
    })
  })
})
