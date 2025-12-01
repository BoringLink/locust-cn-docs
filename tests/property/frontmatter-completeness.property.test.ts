/**
 * 属性测试：Frontmatter 完整性
 * 
 * **功能: locust-cn-docs, 属性 11: Frontmatter 完整性**
 * **验证需求: 7.4, 8.2**
 * 
 * 属性：对于任何文档文件，其 frontmatter 应包含 title、description、sidebar_position 和 lastUpdated 四个必需字段
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

interface DocFrontmatter {
  title?: string
  description?: string
  sidebar_position?: number
  lastUpdated?: string
  [key: string]: any
}

/**
 * 验证 frontmatter 是否包含所有必需字段
 */
function validateFrontmatter(fm: DocFrontmatter): {
  valid: boolean
  missingFields: string[]
} {
  const requiredFields = ['title', 'description', 'sidebar_position', 'lastUpdated']
  const missingFields: string[] = []

  for (const field of requiredFields) {
    if (!(field in fm) || fm[field] === undefined || fm[field] === null || fm[field] === '') {
      missingFields.push(field)
    }
  }

  return {
    valid: missingFields.length === 0,
    missingFields,
  }
}

/**
 * 生成有效的 frontmatter
 */
function generateValidFrontmatter(
  title: string,
  description: string,
  position: number,
  date: Date
): DocFrontmatter {
  return {
    title,
    description,
    sidebar_position: position,
    lastUpdated: date.toISOString(),
  }
}

describe('属性 11: Frontmatter 完整性', () => {
  it('属性：任何包含所有必需字段的 frontmatter 应该通过验证', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }), // title
        fc.string({ minLength: 10, maxLength: 200 }), // description
        fc.integer({ min: 1, max: 100 }), // sidebar_position
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }), // lastUpdated
        (title, description, position, date) => {
          const frontmatter = generateValidFrontmatter(title, description, position, date)
          const result = validateFrontmatter(frontmatter)

          expect(result.valid).toBe(true)
          expect(result.missingFields).toEqual([])
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：缺少 title 字段的 frontmatter 应该验证失败', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 200 }), // description
        fc.integer({ min: 1, max: 100 }), // sidebar_position
        fc.date(), // lastUpdated
        (description, position, date) => {
          const frontmatter: DocFrontmatter = {
            description,
            sidebar_position: position,
            lastUpdated: date.toISOString(),
          }
          const result = validateFrontmatter(frontmatter)

          expect(result.valid).toBe(false)
          expect(result.missingFields).toContain('title')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：缺少 description 字段的 frontmatter 应该验证失败', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }), // title
        fc.integer({ min: 1, max: 100 }), // sidebar_position
        fc.date(), // lastUpdated
        (title, position, date) => {
          const frontmatter: DocFrontmatter = {
            title,
            sidebar_position: position,
            lastUpdated: date.toISOString(),
          }
          const result = validateFrontmatter(frontmatter)

          expect(result.valid).toBe(false)
          expect(result.missingFields).toContain('description')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：缺少 sidebar_position 字段的 frontmatter 应该验证失败', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }), // title
        fc.string({ minLength: 10, maxLength: 200 }), // description
        fc.date(), // lastUpdated
        (title, description, date) => {
          const frontmatter: DocFrontmatter = {
            title,
            description,
            lastUpdated: date.toISOString(),
          }
          const result = validateFrontmatter(frontmatter)

          expect(result.valid).toBe(false)
          expect(result.missingFields).toContain('sidebar_position')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：缺少 lastUpdated 字段的 frontmatter 应该验证失败', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }), // title
        fc.string({ minLength: 10, maxLength: 200 }), // description
        fc.integer({ min: 1, max: 100 }), // sidebar_position
        (title, description, position) => {
          const frontmatter: DocFrontmatter = {
            title,
            description,
            sidebar_position: position,
          }
          const result = validateFrontmatter(frontmatter)

          expect(result.valid).toBe(false)
          expect(result.missingFields).toContain('lastUpdated')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：包含额外字段的 frontmatter 只要有必需字段就应该通过验证', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }), // title
        fc.string({ minLength: 10, maxLength: 200 }), // description
        fc.integer({ min: 1, max: 100 }), // sidebar_position
        fc.date(), // lastUpdated
        fc.array(fc.tuple(fc.string(), fc.anything())), // 额外字段
        (title, description, position, date, extraFields) => {
          const frontmatter = generateValidFrontmatter(title, description, position, date)

          // 添加额外字段
          extraFields.forEach(([key, value]) => {
            if (!['title', 'description', 'sidebar_position', 'lastUpdated'].includes(key)) {
              frontmatter[key] = value
            }
          })

          const result = validateFrontmatter(frontmatter)

          expect(result.valid).toBe(true)
          expect(result.missingFields).toEqual([])
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：空字符串值应该被视为缺失字段', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('title', 'description', 'lastUpdated'),
        (fieldToEmpty) => {
          const frontmatter: DocFrontmatter = {
            title: 'Test Title',
            description: 'Test Description',
            sidebar_position: 1,
            lastUpdated: new Date().toISOString(),
          }

          // 将某个字段设为空字符串
          frontmatter[fieldToEmpty] = ''

          const result = validateFrontmatter(frontmatter)

          expect(result.valid).toBe(false)
          expect(result.missingFields).toContain(fieldToEmpty)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：null 或 undefined 值应该被视为缺失字段', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('title', 'description', 'sidebar_position', 'lastUpdated'),
        fc.constantFrom(null, undefined),
        (fieldToNull, nullValue) => {
          const frontmatter: DocFrontmatter = {
            title: 'Test Title',
            description: 'Test Description',
            sidebar_position: 1,
            lastUpdated: new Date().toISOString(),
          }

          // 将某个字段设为 null 或 undefined
          frontmatter[fieldToNull] = nullValue as any

          const result = validateFrontmatter(frontmatter)

          expect(result.valid).toBe(false)
          expect(result.missingFields).toContain(fieldToNull)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：lastUpdated 应该是有效的 ISO 8601 日期格式', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }), // title
        fc.string({ minLength: 10, maxLength: 200 }), // description
        fc.integer({ min: 1, max: 100 }), // sidebar_position
        fc.date(), // lastUpdated
        (title, description, position, date) => {
          const frontmatter = generateValidFrontmatter(title, description, position, date)
          const result = validateFrontmatter(frontmatter)

          // 验证通过
          expect(result.valid).toBe(true)

          // 验证日期格式
          const lastUpdated = frontmatter.lastUpdated as string
          const parsedDate = new Date(lastUpdated)
          expect(parsedDate.toISOString()).toBe(lastUpdated)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：sidebar_position 应该是正整数', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }), // title
        fc.string({ minLength: 10, maxLength: 200 }), // description
        fc.integer({ min: 1, max: 100 }), // sidebar_position
        fc.date(), // lastUpdated
        (title, description, position, date) => {
          const frontmatter = generateValidFrontmatter(title, description, position, date)
          const result = validateFrontmatter(frontmatter)

          // 验证通过
          expect(result.valid).toBe(true)

          // 验证 sidebar_position 是正整数
          expect(frontmatter.sidebar_position).toBeGreaterThan(0)
          expect(Number.isInteger(frontmatter.sidebar_position)).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })
})
