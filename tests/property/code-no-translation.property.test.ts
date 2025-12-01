/**
 * 属性测试：代码内容不翻译
 * 功能: locust-cn-docs, 属性 2: 代码内容不翻译
 * 验证需求: 1.2
 * 
 * 对于任何包含代码块、命令行或配置文件的文档页面，
 * 所有代码内容中的英文字符应与源文件完全一致，不应被翻译或修改。
 */

import { describe, it, expect, beforeAll } from 'vitest'
import * as fc from 'fast-check'
import { loadTermsDatabase, type TermsDatabase } from '../../.vitepress/utils/terms'

// 从术语替换插件导入逻辑
function markTermsInContent(content: string, termsDb: TermsDatabase): string {
  const termOccurrences = new Map<string, boolean>()
  const sortedTerms = Object.entries(termsDb.terms).sort(([, a], [, b]) => b.en.length - a.en.length)

  let result = content

  // 保护代码块
  const codeBlocks: string[] = []
  result = result.replace(/(```[\s\S]*?```|`[^`]+`)/g, (match) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`
    codeBlocks.push(match)
    return placeholder
  })

  function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  for (const [termId, term] of sortedTerms) {
    const regex = new RegExp(`\\b${escapeRegExp(term.en)}\\b`, 'gi')
    result = result.replace(regex, (match) => {
      const isFirst = !termOccurrences.has(termId)
      termOccurrences.set(termId, true)
      const definition = term.definition.replace(/"/g, '&quot;')
      return `<TermTooltip term="${term.zh}" english="${term.en}" definition="${definition}" :first-occurrence="${isFirst}" />`
    })
  }

  // 恢复代码块
  codeBlocks.forEach((block, index) => {
    result = result.replace(`__CODE_BLOCK_${index}__`, block)
  })

  return result
}

describe('属性测试：代码内容不翻译', () => {
  let termsDb: TermsDatabase

  beforeAll(async () => {
    termsDb = await loadTermsDatabase()
  })

  it('属性 2: 代码块中的术语不应该被替换', () => {
    const codeLanguages = ['python', 'bash', 'javascript', 'typescript', 'yaml', 'json']
    
    fc.assert(
      fc.property(
        fc.constantFrom(...codeLanguages),
        fc.constantFrom('User', 'Task', 'Master', 'Worker', 'Locust'),
        (lang, term) => {
          const content = `
Some text with ${term}.

\`\`\`${lang}
${term}
\`\`\`

More text with ${term}.
`
          const result = markTermsInContent(content, termsDb)
          
          // 代码块应该保持不变
          expect(result).toContain(`\`\`\`${lang}\n${term}\n\`\`\``)
          
          // 代码块外的术语应该被替换
          const tooltipMatches = result.match(/<TermTooltip/g)
          expect(tooltipMatches).toBeTruthy()
          expect(tooltipMatches!.length).toBeGreaterThan(0)
        }
      ),
      { numRuns: 30 }
    )
  })

  it('属性 2: 行内代码中的术语不应该被替换', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('User', 'Task', 'Master', 'Worker'),
        (term) => {
          const content = `Use the \`${term}\` class to define a ${term.toLowerCase()}.`
          const result = markTermsInContent(content, termsDb)
          
          // 行内代码应该保持不变
          expect(result).toContain(`\`${term}\``)
          
          // 代码外的术语应该被替换
          expect(result).toContain('<TermTooltip')
        }
      ),
      { numRuns: 30 }
    )
  })

  it('属性 2: 多个代码块都应该被保护', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('User', 'Task', 'Locust'),
        (term) => {
          const content = `
Text with ${term}.

\`\`\`python
class ${term}:
    pass
\`\`\`

More ${term}.

\`\`\`bash
${term.toLowerCase()}
\`\`\`

Final ${term}.
`
          const result = markTermsInContent(content, termsDb)
          
          // 两个代码块都应该保持不变
          expect(result).toContain(`\`\`\`python\nclass ${term}:\n    pass\n\`\`\``)
          expect(result).toContain(`\`\`\`bash\n${term.toLowerCase()}\n\`\`\``)
          
          // 代码块外的术语应该被替换
          const tooltipMatches = result.match(/<TermTooltip/g)
          expect(tooltipMatches).toBeTruthy()
          expect(tooltipMatches!.length).toBe(3) // 三个代码块外的术语
        }
      ),
      { numRuns: 20 }
    )
  })

  it('属性 2: 嵌套代码块应该被正确保护', () => {
    const content = `
Text with User.

\`\`\`markdown
# Example
Use User class.
\`\`\`

More User.
`
    const result = markTermsInContent(content, termsDb)
    
    // 外层代码块应该完整保留
    expect(result).toContain('```markdown')
    expect(result).toContain('Use User class')
    
    // 代码块外的术语应该被替换
    const tooltipMatches = result.match(/<TermTooltip/g)
    expect(tooltipMatches).toBeTruthy()
  })

  describe('实际文档验证', () => {
    it('首页代码块中的 User 不应该被翻译', () => {
      const content = `
\`\`\`python {1-3} showLineNumbers title="locustfile.py"
from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    wait_time = between(1, 5)

    @task
    def index(self):
        self.client.get("/")
\`\`\`
`
      const result = markTermsInContent(content, termsDb)
      
      // 代码块应该完整保留
      expect(result).toContain('HttpUser')
      expect(result).toContain('WebsiteUser')
      expect(result).toContain('@task')
      expect(result).not.toContain('<TermTooltip')
    })

    it('安装文档中的命令不应该被翻译', () => {
      const content = `
\`\`\`bash
$ pip install locust
$ locust --version
\`\`\`
`
      const result = markTermsInContent(content, termsDb)
      
      // 命令应该保持不变
      expect(result).toContain('$ pip install locust')
      expect(result).toContain('$ locust --version')
    })
  })

  describe('边缘情况', () => {
    it('空代码块应该被保护', () => {
      const content = '```python\n```'
      const result = markTermsInContent(content, termsDb)
      expect(result).toBe(content)
    })

    it('只有空格的代码块应该被保护', () => {
      const content = '```python\n   \n```'
      const result = markTermsInContent(content, termsDb)
      expect(result).toBe(content)
    })

    it('代码块紧邻术语应该正确处理', () => {
      const content = 'User\n\n```python\nUser\n```\n\nUser'
      const result = markTermsInContent(content, termsDb)
      
      // 代码块应该保持不变
      expect(result).toContain('```python\nUser\n```')
      
      // 代码块外的 User 应该被替换
      const tooltipMatches = result.match(/<TermTooltip/g)
      expect(tooltipMatches).toBeTruthy()
      expect(tooltipMatches!.length).toBe(2)
    })
  })

  describe('不同代码语言', () => {
    const languages = ['python', 'bash', 'javascript', 'typescript', 'java', 'go', 'rust', 'yaml', 'json', 'xml']
    
    languages.forEach((lang) => {
      it(`${lang} 代码块中的内容不应该被翻译`, () => {
        const content = `
Text with User.

\`\`\`${lang}
User Task Master Worker
\`\`\`

More User.
`
        const result = markTermsInContent(content, termsDb)
        
        // 代码块应该保持不变
        expect(result).toContain(`\`\`\`${lang}\nUser Task Master Worker\n\`\`\``)
        
        // 代码块外的术语应该被替换
        expect(result).toContain('<TermTooltip')
      })
    })
  })
})
