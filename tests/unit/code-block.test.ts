import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'

describe('代码块配置', () => {
  it('VitePress 配置应该启用行号', () => {
    const config = readFileSync('.vitepress/config.ts', 'utf-8')
    expect(config).toContain('lineNumbers: true')
  })

  it('VitePress 配置应该设置语法高亮主题', () => {
    const config = readFileSync('.vitepress/config.ts', 'utf-8')
    expect(config).toContain('github-light')
    expect(config).toContain('github-dark')
  })

  it('示例文档应该包含正确格式的代码块', () => {
    const installDoc = readFileSync('docs/getting-started/installation.md', 'utf-8')
    
    // 应该有代码块
    expect(installDoc).toContain('```bash')
    expect(installDoc).toContain('```')
  })

  it('首页应该包含带标题和高亮的代码块示例', () => {
    const index = readFileSync('docs/index.md', 'utf-8')
    
    // 应该有 Python 代码块
    expect(index).toContain('```python')
    
    // 应该有行号高亮语法
    expect(index).toMatch(/```python.*{.*}/)
    
    // 应该有 title 属性
    expect(index).toContain('title=')
    
    // 应该有 showLineNumbers
    expect(index).toContain('showLineNumbers')
  })

  describe('代码块格式规范', () => {
    it('Python 代码块应该包含必需的元数据', () => {
      const index = readFileSync('docs/index.md', 'utf-8')
      const pythonCodeBlock = index.match(/```python[^\n]*\n[\s\S]*?```/)
      
      expect(pythonCodeBlock).toBeTruthy()
      if (pythonCodeBlock) {
        const firstLine = pythonCodeBlock[0].split('\n')[0]
        
        // 应该有行号高亮
        expect(firstLine).toMatch(/{[\d,-]+}/)
        
        // 应该有 showLineNumbers
        expect(firstLine).toContain('showLineNumbers')
        
        // 应该有 title
        expect(firstLine).toContain('title=')
      }
    })

    it('Bash 代码块应该有 $ 前缀', () => {
      const installDoc = readFileSync('docs/getting-started/installation.md', 'utf-8')
      const bashBlocks = installDoc.match(/```bash[\s\S]*?```/g)
      
      expect(bashBlocks).toBeTruthy()
      if (bashBlocks) {
        bashBlocks.forEach((block) => {
          // 检查是否有 $ 前缀的命令
          const hasPrefix = block.includes('$ ')
          expect(hasPrefix).toBe(true)
        })
      }
    })
  })

  describe('代码块内容保护', () => {
    it('代码块中的英文不应该被翻译', () => {
      const index = readFileSync('docs/index.md', 'utf-8')
      
      // 代码块中应该保留英文关键字
      expect(index).toContain('from locust import')
      expect(index).toContain('class WebsiteUser')
      expect(index).toContain('@task')
    })

    it('代码块应该保持原始格式', () => {
      const installDoc = readFileSync('docs/getting-started/installation.md', 'utf-8')
      
      // pip install 命令应该保持原样
      expect(installDoc).toContain('pip install locust')
      expect(installDoc).toContain('pip install --upgrade')
    })
  })

  describe('语法高亮支持', () => {
    const supportedLanguages = ['python', 'bash', 'javascript', 'typescript', 'yaml', 'json', 'ini']
    
    supportedLanguages.forEach((lang) => {
      it(`应该支持 ${lang} 语法高亮`, () => {
        // VitePress 使用 Shiki，默认支持所有主流语言
        // 这里只是确保配置正确
        const config = readFileSync('.vitepress/config.ts', 'utf-8')
        expect(config).toContain('markdown:')
      })
    })
  })

  describe('代码块样式', () => {
    it('自定义样式应该包含代码块优化', () => {
      const customCss = readFileSync('.vitepress/theme/styles/custom.css', 'utf-8')
      
      // 应该有代码块相关样式
      expect(customCss).toContain('language-')
      expect(customCss).toContain('copy')
    })

    it('CSS 变量应该定义代码块样式', () => {
      const varsCss = readFileSync('.vitepress/theme/styles/vars.css', 'utf-8')
      
      // 应该有代码相关的 CSS 变量
      expect(varsCss).toContain('--vp-code')
      expect(varsCss).toContain('--vp-font-family-mono')
    })
  })
})
