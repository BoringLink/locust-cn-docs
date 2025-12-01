import { describe, it, expect, beforeEach, vi } from 'vitest'

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
})

import { useSidebarPersistence } from '../../.vitepress/theme/composables/useSidebarPersistence'

describe('useSidebarPersistence', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('基本功能', () => {
    it('应该初始化空状态', () => {
      const { state } = useSidebarPersistence()
      
      expect(state.value.expandedItems).toEqual([])
      expect(state.value.scrollPosition).toBe(0)
    })

    it('应该能切换项目展开状态', () => {
      const { state, toggleItem } = useSidebarPersistence()
      
      toggleItem('item-1')
      expect(state.value.expandedItems).toContain('item-1')
      
      toggleItem('item-1')
      expect(state.value.expandedItems).not.toContain('item-1')
    })

    it('应该能检查项目是否展开', () => {
      const { toggleItem, isExpanded } = useSidebarPersistence()
      
      expect(isExpanded('item-1')).toBe(false)
      
      toggleItem('item-1')
      expect(isExpanded('item-1')).toBe(true)
    })

    it('应该能更新滚动位置', () => {
      const { state, updateScrollPosition } = useSidebarPersistence()
      
      updateScrollPosition(100)
      expect(state.value.scrollPosition).toBe(100)
      
      updateScrollPosition(200)
      expect(state.value.scrollPosition).toBe(200)
    })
  })

  describe('持久化功能', () => {
    it('应该保存状态到 localStorage', () => {
      const { toggleItem } = useSidebarPersistence()
      
      toggleItem('item-1')
      
      const saved = localStorageMock.getItem('vitepress-sidebar-state')
      expect(saved).toBeTruthy()
      
      const parsed = JSON.parse(saved!)
      expect(parsed.expandedItems).toContain('item-1')
    })

    it('应该从 localStorage 恢复状态', () => {
      // 先保存状态
      const state1 = {
        expandedItems: ['item-1', 'item-2'],
        scrollPosition: 150,
      }
      localStorageMock.setItem('vitepress-sidebar-state', JSON.stringify(state1))
      
      // 创建新实例应该恢复状态
      const { state, restoreState } = useSidebarPersistence()
      restoreState()
      
      expect(state.value.expandedItems).toEqual(['item-1', 'item-2'])
      expect(state.value.scrollPosition).toBe(150)
    })

    it('应该能清除状态', () => {
      const { toggleItem, clearState, state } = useSidebarPersistence()
      
      toggleItem('item-1')
      expect(state.value.expandedItems).toContain('item-1')
      
      clearState()
      expect(state.value.expandedItems).toEqual([])
      expect(localStorageMock.getItem('vitepress-sidebar-state')).toBeNull()
    })
  })

  describe('多个项目管理', () => {
    it('应该能管理多个展开项目', () => {
      const { state, toggleItem } = useSidebarPersistence()
      
      toggleItem('item-1')
      toggleItem('item-2')
      toggleItem('item-3')
      
      expect(state.value.expandedItems).toHaveLength(3)
      expect(state.value.expandedItems).toContain('item-1')
      expect(state.value.expandedItems).toContain('item-2')
      expect(state.value.expandedItems).toContain('item-3')
    })

    it('应该能折叠特定项目', () => {
      const { state, toggleItem } = useSidebarPersistence()
      
      toggleItem('item-1')
      toggleItem('item-2')
      toggleItem('item-3')
      
      toggleItem('item-2')
      
      expect(state.value.expandedItems).toHaveLength(2)
      expect(state.value.expandedItems).toContain('item-1')
      expect(state.value.expandedItems).not.toContain('item-2')
      expect(state.value.expandedItems).toContain('item-3')
    })
  })

  describe('错误处理', () => {
    it('localStorage 不可用时应该优雅降级', () => {
      // Mock localStorage 抛出错误
      const originalSetItem = localStorageMock.setItem
      localStorageMock.setItem = () => {
        throw new Error('QuotaExceededError')
      }

      const { toggleItem } = useSidebarPersistence()
      
      // 不应该抛出错误
      expect(() => toggleItem('item-1')).not.toThrow()

      // 恢复
      localStorageMock.setItem = originalSetItem
    })

    it('无效的 JSON 数据应该被忽略', () => {
      localStorageMock.setItem('vitepress-sidebar-state', 'invalid json')
      
      const { state, restoreState } = useSidebarPersistence()
      
      // 不应该抛出错误
      expect(() => restoreState()).not.toThrow()
      
      // 应该使用默认状态
      expect(state.value.expandedItems).toEqual([])
    })
  })
})
