/**
 * 属性测试：文件命名规范
 * 
 * **功能: locust-cn-docs, 属性 10: 文件命名规范**
 * **验证需求: 7.5, 8.1**
 * 
 * 属性：对于任何新创建的文档文件或目录，其名称应符合 kebab-case 格式（小写字母和连字符）
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { isKebabCase } from '../../.vitepress/utils/validate-filenames'

describe('属性 10: 文件命名规范', () => {
  it('属性：任何符合 kebab-case 的文件名应该通过验证', () => {
    fc.assert(
      fc.property(
        fc.array(fc.stringMatching(/^[a-z0-9]+$/), { minLength: 1, maxLength: 3 }),
        fc.constantFrom('.md', '.vue', '.ts', '.js'),
        (words, ext) => {
          const filename = words.join('-') + ext
          const isValid = isKebabCase(filename)

          expect(isValid).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：包含大写字母的文件名应该验证失败', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => /[A-Z]/.test(s)),
        fc.constantFrom('.md', '.vue', '.ts', '.js'),
        (name, ext) => {
          const filename = name + ext
          const isValid = isKebabCase(filename)

          expect(isValid).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：包含下划线的文件名应该验证失败', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.includes('_')),
        fc.constantFrom('.md', '.vue', '.ts', '.js'),
        (name, ext) => {
          const filename = name + ext
          const isValid = isKebabCase(filename)

          expect(isValid).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：包含空格的文件名应该验证失败', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.includes(' ')),
        fc.constantFrom('.md', '.vue', '.ts', '.js'),
        (name, ext) => {
          const filename = name + ext
          const isValid = isKebabCase(filename)

          expect(isValid).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：单个小写单词应该通过验证', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z0-9]+$/),
        fc.constantFrom('.md', '.vue', '.ts', '.js'),
        (word, ext) => {
          const filename = word + ext
          const isValid = isKebabCase(filename)

          expect(isValid).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：多个小写单词用连字符连接应该通过验证', () => {
    fc.assert(
      fc.property(
        fc.array(fc.stringMatching(/^[a-z0-9]+$/), { minLength: 2, maxLength: 5 }),
        fc.constantFrom('.md', '.vue', '.ts', '.js'),
        (words, ext) => {
          const filename = words.join('-') + ext
          const isValid = isKebabCase(filename)

          expect(isValid).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：以连字符开头的文件名应该验证失败', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z0-9]+$/),
        fc.constantFrom('.md', '.vue', '.ts', '.js'),
        (word, ext) => {
          const filename = `-${word}${ext}`
          const isValid = isKebabCase(filename)

          expect(isValid).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：以连字符结尾的文件名应该验证失败', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z0-9]+$/),
        fc.constantFrom('.md', '.vue', '.ts', '.js'),
        (word, ext) => {
          const filename = `${word}-${ext}`
          const isValid = isKebabCase(filename)

          expect(isValid).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：连续多个连字符的文件名应该验证失败', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z0-9]+$/),
        fc.stringMatching(/^[a-z0-9]+$/),
        fc.constantFrom('.md', '.vue', '.ts', '.js'),
        (word1, word2, ext) => {
          const filename = `${word1}--${word2}${ext}`
          const isValid = isKebabCase(filename)

          expect(isValid).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：包含数字的 kebab-case 文件名应该通过验证', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            fc.stringMatching(/^[a-z]+$/),
            fc.stringMatching(/^[0-9]+$/)
          ),
          { minLength: 1, maxLength: 4 }
        ),
        fc.constantFrom('.md', '.vue', '.ts', '.js'),
        (parts, ext) => {
          const filename = parts.join('-') + ext
          const isValid = isKebabCase(filename)

          expect(isValid).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：特殊字符（除连字符外）应该验证失败', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '+', '=', '[', ']', '{', '}', '|', '\\', ':', ';', '"', "'", '<', '>', ',', '.', '?', '/'),
        fc.stringMatching(/^[a-z0-9]+$/),
        fc.constantFrom('.md', '.vue', '.ts', '.js'),
        (specialChar, word, ext) => {
          const filename = `${word}${specialChar}test${ext}`
          const isValid = isKebabCase(filename)

          expect(isValid).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：README.md 和 CHANGELOG.md 是特殊文件（在实际验证中会被跳过）', () => {
    // 这些文件在 validateFilenames 函数中会被特殊处理
    // 这里只是记录这个行为
    const specialFiles = ['README.md', 'CHANGELOG.md']
    
    specialFiles.forEach(file => {
      // 这些文件不符合 kebab-case，但在实际验证中会被允许
      const isValid = isKebabCase(file)
      expect(isValid).toBe(false) // 它们确实不符合 kebab-case
    })
  })

  it('属性：边界情况 - 单字符文件名应该通过验证', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('a', 'b', 'c', 'x', 'y', 'z', '0', '1', '9'),
        fc.constantFrom('.md', '.vue', '.ts', '.js'),
        (char, ext) => {
          const filename = char + ext
          const isValid = isKebabCase(filename)

          expect(isValid).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：边界情况 - 很长的 kebab-case 文件名应该通过验证', () => {
    fc.assert(
      fc.property(
        fc.array(fc.stringMatching(/^[a-z0-9]+$/), { minLength: 10, maxLength: 20 }),
        fc.constantFrom('.md', '.vue', '.ts', '.js'),
        (words, ext) => {
          const filename = words.join('-') + ext
          const isValid = isKebabCase(filename)

          expect(isValid).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })
})
