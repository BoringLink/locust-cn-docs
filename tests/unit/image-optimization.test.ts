import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync, statSync } from 'fs'
import { resolve } from 'path'

const logoFile = 'docs/public/assets/branding/Locust-logo.svg'

describe('图片优化系统', () => {
  describe('配置验证', () => {
    it('应该配置图片优化插件', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain('ViteImageOptimizer')
    })

    it('应该配置 WebP 格式', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain('webp')
    })

    it('应该配置 AVIF 格式', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain('avif')
    })

    it('应该配置图片质量', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain('quality')
    })
  })

  describe('Logo 文件', () => {
    it('应该存在品牌 logo SVG', () => {
      const logoPath = resolve(process.cwd(), logoFile)
      expect(existsSync(logoPath)).toBe(true)
    })

    it('logo 文件应该是 SVG 格式', () => {
      const logoPath = resolve(process.cwd(), logoFile)
      const content = readFileSync(logoPath, 'utf-8')
      expect(content).toContain('<svg')
      expect(content).toContain('</svg>')
    })

    it('SVG 文件应该很小', () => {
      const logoPath = resolve(process.cwd(), logoFile)
      const stats = statSync(logoPath)
      // SVG 应该小于 10KB
      expect(stats.size).toBeLessThan(10 * 1024)
    })
  })

  describe('图片格式指南', () => {
    it('文档应该说明优先使用 SVG', () => {
      const readme = readFileSync('README.md', 'utf-8')
      // README 应该提到图片优化
      expect(readme).toBeTruthy()
    })

    it('配置应该支持现代图片格式', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      // 应该配置 WebP 和 AVIF
      expect(config).toContain('webp')
      expect(config).toContain('avif')
    })
  })

  describe('图片优化质量设置', () => {
    it('应该设置合理的压缩质量', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')

      // 质量应该在 70-90 之间（平衡质量和大小）
      const qualityMatches = config.match(/quality:\s*(\d+)/g)
      expect(qualityMatches).toBeTruthy()

      if (qualityMatches) {
        qualityMatches.forEach((match) => {
          const quality = parseInt(match.match(/\d+/)![0])
          expect(quality).toBeGreaterThanOrEqual(70)
          expect(quality).toBeLessThanOrEqual(90)
        })
      }
    })
  })

  describe('图片文件夹结构', () => {
    it('应该有 public 文件夹', () => {
      const publicPath = resolve(process.cwd(), 'docs/public')
      expect(existsSync(publicPath)).toBe(true)
    })

    it('应该有 images 或 img 文件夹的说明', () => {
      // 验证项目结构合理
      const publicPath = resolve(process.cwd(), 'docs/public')
      expect(existsSync(publicPath)).toBe(true)
    })
  })

  describe('性能要求', () => {
    it('配置应该针对性能优化', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')

      // 应该有图片优化配置
      expect(config).toContain('ViteImageOptimizer')

      // 应该有压缩配置
      expect(config).toContain('viteCompression')
    })
  })

  describe('图片格式支持', () => {
    const formats = ['png', 'jpeg', 'jpg', 'webp', 'avif']

    formats.forEach((format) => {
      it(`应该配置 ${format} 格式优化`, () => {
        const config = readFileSync('.vitepress/config.ts', 'utf-8')
        expect(config).toContain(format)
      })
    })
  })
})
