/**
 * Markdown-it 插件：为外部链接自动添加安全属性
 * 
 * 功能：
 * - 检测外部链接（不是以 / 或 # 开头的链接）
 * - 自动添加 target="_blank" 属性
 * - 自动添加 rel="noopener" 属性
 */

import type MarkdownIt from 'markdown-it'

/**
 * 判断链接是否为外部链接
 */
function isExternalLink(href: string): boolean {
  // 内部链接以 / 或 # 开头
  if (href.startsWith('/') || href.startsWith('#')) {
    return false
  }

  // mailto: 和 tel: 链接不需要处理
  if (href.startsWith('mailto:') || href.startsWith('tel:')) {
    return false
  }

  // 其他情况视为外部链接
  return true
}

/**
 * 外部链接插件
 */
export function externalLinksPlugin(md: MarkdownIt) {
  // 保存原始的 link_open 渲染规则
  const defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }

  // 重写 link_open 渲染规则
  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const token = tokens[idx]
    const hrefIndex = token.attrIndex('href')

    if (hrefIndex >= 0) {
      const href = token.attrs![hrefIndex][1]

      // 如果是外部链接，添加安全属性
      if (isExternalLink(href)) {
        // 添加 target="_blank"
        const targetIndex = token.attrIndex('target')
        if (targetIndex < 0) {
          token.attrPush(['target', '_blank'])
        } else {
          token.attrs![targetIndex][1] = '_blank'
        }

        // 添加 rel="noopener"
        const relIndex = token.attrIndex('rel')
        if (relIndex < 0) {
          token.attrPush(['rel', 'noopener'])
        } else {
          // 如果已有 rel 属性，追加 noopener
          const existingRel = token.attrs![relIndex][1]
          if (!existingRel.includes('noopener')) {
            token.attrs![relIndex][1] = `${existingRel} noopener`.trim()
          }
        }
      }
    }

    // 使用原始渲染规则
    return defaultRender(tokens, idx, options, env, self)
  }
}
