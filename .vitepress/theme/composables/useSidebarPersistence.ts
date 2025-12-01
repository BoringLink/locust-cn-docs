/**
 * 侧边栏状态持久化 Composable
 * 保存和恢复侧边栏展开状态到 localStorage
 */

import { ref, watch, onMounted, type Ref } from 'vue'

export interface SidebarState {
  expandedItems: string[]
  scrollPosition: number
}

const STORAGE_KEY = 'vitepress-sidebar-state'

export function useSidebarPersistence() {
  const state = ref<SidebarState>({
    expandedItems: [],
    scrollPosition: 0,
  })

  /**
   * 保存状态到 localStorage
   */
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
    } catch (error) {
      console.warn('无法保存侧边栏状态:', error)
    }
  }

  /**
   * 从 localStorage 恢复状态
   */
  function restoreState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        state.value = {
          expandedItems: parsed.expandedItems || [],
          scrollPosition: parsed.scrollPosition || 0,
        }
      }
    } catch (error) {
      console.warn('无法恢复侧边栏状态:', error)
    }
  }

  /**
   * 切换项目展开状态
   */
  function toggleItem(itemId: string) {
    const index = state.value.expandedItems.indexOf(itemId)
    if (index > -1) {
      state.value.expandedItems.splice(index, 1)
    } else {
      state.value.expandedItems.push(itemId)
    }
    saveState()
  }

  /**
   * 检查项目是否展开
   */
  function isExpanded(itemId: string): boolean {
    return state.value.expandedItems.includes(itemId)
  }

  /**
   * 更新滚动位置
   */
  function updateScrollPosition(position: number) {
    state.value.scrollPosition = position
    saveState()
  }

  /**
   * 清除所有状态
   */
  function clearState() {
    state.value = {
      expandedItems: [],
      scrollPosition: 0,
    }
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.warn('无法清除侧边栏状态:', error)
    }
  }

  // 监听状态变化，自动保存
  watch(
    state,
    () => {
      saveState()
    },
    { deep: true }
  )

  // 组件挂载时恢复状态
  onMounted(() => {
    restoreState()
  })

  return {
    state,
    saveState,
    restoreState,
    toggleItem,
    isExpanded,
    updateScrollPosition,
    clearState,
  }
}
