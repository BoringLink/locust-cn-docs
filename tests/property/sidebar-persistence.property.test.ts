/**
 * 属性测试：侧边栏状态持久化
 * 
 * **功能: locust-cn-docs, 属性 7: 侧边栏状态持久化**
 * **验证需求: 6.1**
 * 
 * 属性：对于任何侧边栏展开/折叠操作，刷新页面后侧边栏的展开状态应与操作前保持一致
 */

import { describe, it, expect, beforeEach } from 'vitest'
import fc from 'fast-check'
import { useSidebarPersistence } from '../../.vitepress/theme/composables/useSidebarPersistence'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

describe('属性 7: 侧边栏状态持久化', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('属性：任意展开操作序列应该被持久化并可恢复', () => {
    fc.assert(
      fc.property(
        // 生成随机的项目ID列表
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
        (itemIds) => {
          // 清除之前的状态
          localStorageMock.clear()

          // 第一个实例：执行展开操作
          const instance1 = useSidebarPersistence()
          
          // 展开所有项目
          itemIds.forEach(id => {
            instance1.toggleItem(id)
          })

          // 获取第一个实例的状态
          const expectedExpandedItems = [...instance1.state.value.expandedItems].sort()

          // 模拟页面刷新：创建新实例
          const instance2 = useSidebarPersistence()
          instance2.restoreState()

          // 验证：新实例应该恢复相同的展开状态
          const actualExpandedItems = [...instance2.state.value.expandedItems].sort()
          
          expect(actualExpandedItems).toEqual(expectedExpandedItems)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：任意展开/折叠混合操作序列应该被正确持久化', () => {
    fc.assert(
      fc.property(
        // 生成随机的操作序列：每个操作包含项目ID和是否展开
        fc.array(
          fc.record({
            itemId: fc.string({ minLength: 1, maxLength: 20 }),
            shouldExpand: fc.boolean(),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (operations) => {
          // 清除之前的状态
          localStorageMock.clear()

          // 第一个实例：执行操作序列
          const instance1 = useSidebarPersistence()
          
          operations.forEach(({ itemId, shouldExpand }) => {
            const isCurrentlyExpanded = instance1.isExpanded(itemId)
            
            // 如果当前状态与目标状态不同，则切换
            if (isCurrentlyExpanded !== shouldExpand) {
              instance1.toggleItem(itemId)
            }
          })

          // 获取最终状态
          const expectedExpandedItems = [...instance1.state.value.expandedItems].sort()

          // 模拟页面刷新：创建新实例
          const instance2 = useSidebarPersistence()
          instance2.restoreState()

          // 验证：新实例应该恢复相同的状态
          const actualExpandedItems = [...instance2.state.value.expandedItems].sort()
          
          expect(actualExpandedItems).toEqual(expectedExpandedItems)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：滚动位置应该被持久化', () => {
    fc.assert(
      fc.property(
        // 生成随机的滚动位置（0-10000像素）
        fc.integer({ min: 0, max: 10000 }),
        (scrollPosition) => {
          // 清除之前的状态
          localStorageMock.clear()

          // 第一个实例：设置滚动位置
          const instance1 = useSidebarPersistence()
          instance1.updateScrollPosition(scrollPosition)

          // 模拟页面刷新：创建新实例
          const instance2 = useSidebarPersistence()
          instance2.restoreState()

          // 验证：新实例应该恢复相同的滚动位置
          expect(instance2.state.value.scrollPosition).toBe(scrollPosition)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：展开状态和滚动位置应该同时被持久化', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 10 }),
        fc.integer({ min: 0, max: 10000 }),
        (itemIds, scrollPosition) => {
          // 清除之前的状态
          localStorageMock.clear()

          // 第一个实例：设置状态
          const instance1 = useSidebarPersistence()
          
          // 展开项目
          itemIds.forEach(id => {
            instance1.toggleItem(id)
          })
          
          // 设置滚动位置
          instance1.updateScrollPosition(scrollPosition)

          // 获取期望的状态
          const expectedExpandedItems = [...instance1.state.value.expandedItems].sort()
          const expectedScrollPosition = instance1.state.value.scrollPosition

          // 模拟页面刷新：创建新实例
          const instance2 = useSidebarPersistence()
          instance2.restoreState()

          // 验证：新实例应该恢复完整状态
          const actualExpandedItems = [...instance2.state.value.expandedItems].sort()
          
          expect(actualExpandedItems).toEqual(expectedExpandedItems)
          expect(instance2.state.value.scrollPosition).toBe(expectedScrollPosition)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：重复的切换操作应该正确处理（幂等性）', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.integer({ min: 1, max: 10 }),
        (itemId, toggleCount) => {
          // 清除之前的状态
          localStorageMock.clear()

          // 执行多次切换
          const instance1 = useSidebarPersistence()
          
          for (let i = 0; i < toggleCount; i++) {
            instance1.toggleItem(itemId)
          }

          // 期望的状态：奇数次切换应该展开，偶数次应该折叠
          const expectedExpanded = toggleCount % 2 === 1

          // 模拟页面刷新
          const instance2 = useSidebarPersistence()
          instance2.restoreState()

          // 验证
          expect(instance2.isExpanded(itemId)).toBe(expectedExpanded)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：清除状态后应该恢复为空状态', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
        fc.integer({ min: 0, max: 10000 }),
        (itemIds, scrollPosition) => {
          // 清除之前的状态
          localStorageMock.clear()

          // 设置一些状态
          const instance1 = useSidebarPersistence()
          itemIds.forEach(id => instance1.toggleItem(id))
          instance1.updateScrollPosition(scrollPosition)

          // 清除状态
          instance1.clearState()

          // 模拟页面刷新
          const instance2 = useSidebarPersistence()
          instance2.restoreState()

          // 验证：应该是空状态
          expect(instance2.state.value.expandedItems).toEqual([])
          expect(instance2.state.value.scrollPosition).toBe(0)
        }
      ),
      { numRuns: 100 }
    )
  })
})
