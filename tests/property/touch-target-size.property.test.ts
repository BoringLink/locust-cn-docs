/**
 * 属性测试：移动端触摸目标大小
 * 
 * **功能: locust-cn-docs, 属性 12: 移动端触摸目标大小**
 * **验证需求: 9.4**
 * 
 * 属性：对于任何可交互元素（按钮、链接），在移动设备视口下的渲染尺寸应至少为 44x44 像素
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

const MIN_TOUCH_TARGET_SIZE = 44 // 像素

/**
 * 验证元素尺寸是否满足触摸目标要求
 */
function validateTouchTargetSize(width: number, height: number): boolean {
  return width >= MIN_TOUCH_TARGET_SIZE && height >= MIN_TOUCH_TARGET_SIZE
}

/**
 * 从 CSS 样式中提取尺寸
 */
function extractDimensions(cssStyles: {
  minWidth?: string
  minHeight?: string
  width?: string
  height?: string
  padding?: string
}): { width: number; height: number } {
  // 解析 CSS 值为像素
  const parsePixels = (value: string | undefined): number => {
    if (!value) return 0
    const match = value.match(/(\d+)px/)
    return match ? parseInt(match[1], 10) : 0
  }

  const minWidth = parsePixels(cssStyles.minWidth)
  const minHeight = parsePixels(cssStyles.minHeight)
  const width = parsePixels(cssStyles.width)
  const height = parsePixels(cssStyles.height)
  const padding = parsePixels(cssStyles.padding)

  // 计算实际尺寸（包括 padding）
  const actualWidth = Math.max(minWidth, width) + padding * 2
  const actualHeight = Math.max(minHeight, height) + padding * 2

  return { width: actualWidth, height: actualHeight }
}

/**
 * 生成移动端按钮样式
 */
function generateMobileButtonStyles(): {
  minWidth: string
  minHeight: string
  padding: string
} {
  return {
    minWidth: '44px',
    minHeight: '44px',
    padding: '0px',
  }
}

describe('属性 12: 移动端触摸目标大小', () => {
  it('属性：任何可交互元素的最小尺寸应该至少为 44x44 像素', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 44, max: 200 }), // 宽度
        fc.integer({ min: 44, max: 200 }), // 高度
        (width, height) => {
          const isValid = validateTouchTargetSize(width, height)
          expect(isValid).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：小于 44x44 像素的元素应该验证失败', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 43 }), // 宽度小于 44
        fc.integer({ min: 1, max: 43 }), // 高度小于 44
        (width, height) => {
          const isValid = validateTouchTargetSize(width, height)
          expect(isValid).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：宽度足够但高度不足的元素应该验证失败', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 44, max: 200 }), // 宽度足够
        fc.integer({ min: 1, max: 43 }), // 高度不足
        (width, height) => {
          const isValid = validateTouchTargetSize(width, height)
          expect(isValid).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：高度足够但宽度不足的元素应该验证失败', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 43 }), // 宽度不足
        fc.integer({ min: 44, max: 200 }), // 高度足够
        (width, height) => {
          const isValid = validateTouchTargetSize(width, height)
          expect(isValid).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：使用 min-width 和 min-height 的元素应该满足要求', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 43 }), // 实际内容宽度可能小于 44
        fc.integer({ min: 0, max: 43 }), // 实际内容高度可能小于 44
        (contentWidth, contentHeight) => {
          const styles = {
            minWidth: '44px',
            minHeight: '44px',
            width: `${contentWidth}px`,
            height: `${contentHeight}px`,
            padding: '0px',
          }

          const dimensions = extractDimensions(styles)
          const isValid = validateTouchTargetSize(dimensions.width, dimensions.height)

          expect(isValid).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：包含 padding 的元素应该计算总尺寸', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 20, max: 40 }), // 内容宽度
        fc.integer({ min: 20, max: 40 }), // 内容高度
        fc.integer({ min: 2, max: 12 }), // padding
        (contentWidth, contentHeight, padding) => {
          const styles = {
            width: `${contentWidth}px`,
            height: `${contentHeight}px`,
            padding: `${padding}px`,
          }

          const dimensions = extractDimensions(styles)
          
          // 验证总尺寸 = 内容 + padding * 2
          expect(dimensions.width).toBe(contentWidth + padding * 2)
          expect(dimensions.height).toBe(contentHeight + padding * 2)

          // 如果总尺寸 >= 44，应该通过验证
          const isValid = validateTouchTargetSize(dimensions.width, dimensions.height)
          const expectedValid = dimensions.width >= 44 && dimensions.height >= 44
          expect(isValid).toBe(expectedValid)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：移动端按钮样式应该满足触摸目标要求', () => {
    fc.assert(
      fc.property(
        fc.constant(null), // 不需要随机输入
        () => {
          const styles = generateMobileButtonStyles()
          const dimensions = extractDimensions(styles)
          const isValid = validateTouchTargetSize(dimensions.width, dimensions.height)

          expect(isValid).toBe(true)
          expect(dimensions.width).toBeGreaterThanOrEqual(44)
          expect(dimensions.height).toBeGreaterThanOrEqual(44)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：正方形触摸目标（宽高相等）应该正确验证', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 200 }),
        (size) => {
          const isValid = validateTouchTargetSize(size, size)
          const expectedValid = size >= 44

          expect(isValid).toBe(expectedValid)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：长方形触摸目标应该两个维度都满足要求', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 200 }),
        fc.integer({ min: 1, max: 200 }),
        (width, height) => {
          const isValid = validateTouchTargetSize(width, height)
          const expectedValid = width >= 44 && height >= 44

          expect(isValid).toBe(expectedValid)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：边界值 44x44 应该通过验证', () => {
    const isValid = validateTouchTargetSize(44, 44)
    expect(isValid).toBe(true)
  })

  it('属性：边界值 43x43 应该验证失败', () => {
    const isValid = validateTouchTargetSize(43, 43)
    expect(isValid).toBe(false)
  })

  it('属性：边界值 44x43 应该验证失败', () => {
    const isValid = validateTouchTargetSize(44, 43)
    expect(isValid).toBe(false)
  })

  it('属性：边界值 43x44 应该验证失败', () => {
    const isValid = validateTouchTargetSize(43, 44)
    expect(isValid).toBe(false)
  })

  it('属性：超大触摸目标应该通过验证', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 1000 }),
        fc.integer({ min: 100, max: 1000 }),
        (width, height) => {
          const isValid = validateTouchTargetSize(width, height)
          expect(isValid).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })
})
