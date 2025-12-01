/**
 * 拼音搜索工具
 * 支持中文拼音搜索（全拼和首字母）
 */

import { pinyin } from 'pinyin-pro'

/**
 * 将中文转换为拼音（全拼）
 */
export function toPinyin(text: string): string {
  return pinyin(text, { toneType: 'none', type: 'array' }).join('')
}

/**
 * 将中文转换为拼音首字母
 */
export function toPinyinInitials(text: string): string {
  return pinyin(text, { pattern: 'first', toneType: 'none', type: 'array' }).join('')
}

/**
 * 检查文本是否匹配拼音搜索
 */
export function matchesPinyinSearch(text: string, query: string): boolean {
  const lowerQuery = query.toLowerCase()
  const lowerText = text.toLowerCase()

  // 1. 直接匹配中文
  if (lowerText.includes(lowerQuery)) {
    return true
  }

  // 2. 匹配全拼
  const fullPinyin = toPinyin(text).toLowerCase()
  if (fullPinyin.includes(lowerQuery)) {
    return true
  }

  // 3. 匹配首字母
  const initials = toPinyinInitials(text).toLowerCase()
  if (initials.includes(lowerQuery)) {
    return true
  }

  return false
}

/**
 * 为搜索内容生成拼音索引
 */
export interface SearchIndex {
  text: string
  pinyin: string
  initials: string
}

export function createSearchIndex(text: string): SearchIndex {
  return {
    text,
    pinyin: toPinyin(text),
    initials: toPinyinInitials(text),
  }
}

/**
 * 在索引中搜索
 */
export function searchInIndex(index: SearchIndex, query: string): boolean {
  const lowerQuery = query.toLowerCase()

  return (
    index.text.toLowerCase().includes(lowerQuery) ||
    index.pinyin.toLowerCase().includes(lowerQuery) ||
    index.initials.toLowerCase().includes(lowerQuery)
  )
}
