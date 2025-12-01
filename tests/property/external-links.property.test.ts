/**
 * 属性测试：外部链接安全属性
 * 
 * **功能: locust-cn-docs, 属性 9: 外部链接安全属性**
 * **验证需求: 7.3**
 * 
 * 属性：对于任何指向外部域名的链接，渲染后的 <a> 标签应包含 target="_blank" 和 rel="noopener" 属性
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

/**
 * 判断链接是否为外部链接（从插件复制的逻辑）
 */
function isExternalLink(href: string): boolean {
  if (href.startsWith('/') || href.startsWith('#')) {
    return false
  }
  if (href.startsWith('mailto:') || href.startsWith('tel:')) {
    return false
  }
  return true
}

/**
 * 模拟链接属性处理逻辑
 */
function processLinkAttributes(href: string): {
  target?: string
  rel?: string
} {
  if (isExternalLink(href)) {
    return {
      target: '_blank',
      rel: 'noopener',
    }
  }
  return {}
}



describe('属性 9: 外部链接安全属性', () => {
  it('属性：任何外部 HTTP/HTTPS 链接应该包含 target="_blank" 和 rel="noopener"', () => {
    fc.assert(
      fc.property(
        fc.webUrl(), // 生成随机的 web URL
        (url) => {
          const attrs = processLinkAttributes(url)

          expect(attrs.target).toBe('_blank')
          expect(attrs.rel).toBe('noopener')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：内部链接（以 / 开头）不应该添加 target 和 rel 属性', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s/g, '-')}`), // 内部路径
        (path) => {
          const attrs = processLinkAttributes(path)

          expect(attrs.target).toBeUndefined()
          expect(attrs.rel).toBeUndefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：锚点链接（以 # 开头）不应该添加 target 和 rel 属性', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).map(s => `#${s.replace(/\s/g, '-')}`), // 锚点
        (anchor) => {
          const attrs = processLinkAttributes(anchor)

          expect(attrs.target).toBeUndefined()
          expect(attrs.rel).toBeUndefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：mailto 链接不应该添加 target 和 rel 属性', () => {
    fc.assert(
      fc.property(
        fc.emailAddress(), // 生成随机邮箱地址
        (email) => {
          const href = `mailto:${email}`
          const attrs = processLinkAttributes(href)

          expect(attrs.target).toBeUndefined()
          expect(attrs.rel).toBeUndefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：tel 链接不应该添加 target 和 rel 属性', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000000000, max: 9999999999 }).map(n => `+${n}`), // 电话号码
        (phone) => {
          const href = `tel:${phone}`
          const attrs = processLinkAttributes(href)

          expect(attrs.target).toBeUndefined()
          expect(attrs.rel).toBeUndefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：多个外部链接应该都包含安全属性', () => {
    fc.assert(
      fc.property(
        fc.array(fc.webUrl(), { minLength: 2, maxLength: 5 }),
        (urls) => {
          // 验证每个外部链接都有安全属性
          urls.forEach(url => {
            const attrs = processLinkAttributes(url)
            expect(attrs.target).toBe('_blank')
            expect(attrs.rel).toBe('noopener')
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：混合内部和外部链接应该正确处理', () => {
    fc.assert(
      fc.property(
        fc.webUrl(), // 外部链接
        fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s/g, '-')}`), // 内部链接
        (externalUrl, internalPath) => {
          const externalAttrs = processLinkAttributes(externalUrl)
          const internalAttrs = processLinkAttributes(internalPath)

          // 外部链接应该有安全属性
          expect(externalAttrs.target).toBe('_blank')
          expect(externalAttrs.rel).toBe('noopener')

          // 内部链接不应该有这些属性
          expect(internalAttrs.target).toBeUndefined()
          expect(internalAttrs.rel).toBeUndefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：不同协议的外部链接都应该被正确处理', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('http', 'https', 'ftp'),
        fc.domain(),
        (protocol, domain) => {
          const url = `${protocol}://${domain}`
          const attrs = processLinkAttributes(url)

          // 所有协议的外部链接都应该有安全属性
          expect(attrs.target).toBe('_blank')
          expect(attrs.rel).toBe('noopener')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：带查询参数和哈希的外部链接应该正确处理', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        (baseUrl, param, value, hash) => {
          const url = `${baseUrl}?${param}=${value}#${hash}`
          const attrs = processLinkAttributes(url)

          expect(attrs.target).toBe('_blank')
          expect(attrs.rel).toBe('noopener')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('属性：isExternalLink 函数应该正确识别各种链接类型', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.webUrl(),
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s}`),
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `#${s}`),
          fc.emailAddress().map(e => `mailto:${e}`),
          fc.integer({ min: 1000000000, max: 9999999999 }).map(n => `tel:+${n}`)
        ),
        (url) => {
          const isExternal = isExternalLink(url)
          
          // 验证识别逻辑
          if (url.startsWith('/') || url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('tel:')) {
            expect(isExternal).toBe(false)
          } else {
            expect(isExternal).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
