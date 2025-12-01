import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

describe('项目配置文件测试', () => {
  describe('package.json', () => {
    it('应该存在且格式正确', () => {
      const pkgPath = resolve(process.cwd(), 'package.json')
      expect(existsSync(pkgPath)).toBe(true)
      
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      expect(pkg.name).toBe('locust-cn-docs')
      expect(pkg.type).toBe('module')
    })

    it('应该包含所有必需的脚本', () => {
      const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))
      expect(pkg.scripts).toHaveProperty('dev')
      expect(pkg.scripts).toHaveProperty('build')
      expect(pkg.scripts).toHaveProperty('preview')
      expect(pkg.scripts).toHaveProperty('test')
      expect(pkg.scripts).toHaveProperty('test:e2e')
    })

    it('应该指定 pnpm 作为包管理器', () => {
      const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))
      expect(pkg.packageManager).toContain('pnpm')
    })

    it('应该包含核心依赖', () => {
      const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))
      expect(pkg.devDependencies).toHaveProperty('vitepress')
      expect(pkg.devDependencies).toHaveProperty('vue')
      expect(pkg.devDependencies).toHaveProperty('typescript')
      expect(pkg.devDependencies).toHaveProperty('unocss')
      expect(pkg.devDependencies).toHaveProperty('vitest')
      expect(pkg.devDependencies).toHaveProperty('@playwright/test')
      expect(pkg.devDependencies).toHaveProperty('fast-check')
    })
  })

  describe('tsconfig.json', () => {
    it('应该存在且配置正确', () => {
      const tsconfigPath = resolve(process.cwd(), 'tsconfig.json')
      expect(existsSync(tsconfigPath)).toBe(true)
      
      const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'))
      expect(tsconfig.compilerOptions.target).toBe('ES2020')
      expect(tsconfig.compilerOptions.module).toBe('ESNext')
      expect(tsconfig.compilerOptions.strict).toBe(true)
    })

    it('应该配置路径别名', () => {
      const tsconfig = JSON.parse(readFileSync('tsconfig.json', 'utf-8'))
      expect(tsconfig.compilerOptions.paths).toHaveProperty('@/*')
      expect(tsconfig.compilerOptions.paths).toHaveProperty('@components/*')
      expect(tsconfig.compilerOptions.paths).toHaveProperty('@plugins/*')
      expect(tsconfig.compilerOptions.paths).toHaveProperty('@data/*')
    })
  })

  describe('UnoCSS 配置', () => {
    it('应该存在 uno.config.ts', () => {
      const unoConfigPath = resolve(process.cwd(), 'uno.config.ts')
      expect(existsSync(unoConfigPath)).toBe(true)
    })

    it('应该包含 Locust 官方绿色主题', () => {
      const unoConfig = readFileSync('uno.config.ts', 'utf-8')
      expect(unoConfig).toContain('#35563a') // Locust 官方绿
      expect(unoConfig).toContain('primary')
    })

    it('应该配置中文和代码字体', () => {
      const unoConfig = readFileSync('uno.config.ts', 'utf-8')
      expect(unoConfig).toContain('HarmonyOS Sans')
      expect(unoConfig).toContain('Geist Mono')
      expect(unoConfig).toContain('JetBrains Mono')
    })
  })

  describe('VitePress 配置', () => {
    it('应该存在 .vitepress/config.ts', () => {
      const configPath = resolve(process.cwd(), '.vitepress/config.ts')
      expect(existsSync(configPath)).toBe(true)
    })

    it('应该配置 Brotli 和 Gzip 压缩', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain('brotliCompress')
      expect(config).toContain('gzip')
      expect(config).toContain('viteCompression')
    })

    it('应该配置中文语言', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain("lang: 'zh-CN'")
      expect(config).toContain('Locust 中文文档')
    })

    it('应该配置本地搜索', () => {
      const config = readFileSync('.vitepress/config.ts', 'utf-8')
      expect(config).toContain("provider: 'local'")
      expect(config).toContain('搜索文档')
    })
  })

  describe('主题样式', () => {
    it('应该存在 vars.css', () => {
      const varsPath = resolve(process.cwd(), '.vitepress/theme/styles/vars.css')
      expect(existsSync(varsPath)).toBe(true)
    })

    it('应该定义 Locust 品牌色变量', () => {
      const vars = readFileSync('.vitepress/theme/styles/vars.css', 'utf-8')
      expect(vars).toContain('--vp-c-brand-1: #35563a')
      expect(vars).toContain('--vp-font-family-base')
      expect(vars).toContain('--vp-font-family-mono')
    })

    it('应该存在 custom.css', () => {
      const customPath = resolve(process.cwd(), '.vitepress/theme/styles/custom.css')
      expect(existsSync(customPath)).toBe(true)
    })

    it('应该包含响应式表格样式', () => {
      const custom = readFileSync('.vitepress/theme/styles/custom.css', 'utf-8')
      expect(custom).toContain('@media (max-width: 768px)')
      expect(custom).toContain('table')
    })

    it('应该包含触摸目标优化（44x44px）', () => {
      const custom = readFileSync('.vitepress/theme/styles/custom.css', 'utf-8')
      expect(custom).toContain('min-height: 44px')
      expect(custom).toContain('min-width: 44px')
    })
  })

  describe('GitHub Actions', () => {
    it('应该存在部署工作流', () => {
      const workflowPath = resolve(process.cwd(), '.github/workflows/deploy.yml')
      expect(existsSync(workflowPath)).toBe(true)
    })

    it('应该配置 GitHub Pages 部署', () => {
      const workflow = readFileSync('.github/workflows/deploy.yml', 'utf-8')
      expect(workflow).toContain('deploy-pages')
      expect(workflow).toContain('pnpm run build')
      expect(workflow).toContain('node-version: 20')
    })

    it('应该使用 pnpm 作为包管理器', () => {
      const workflow = readFileSync('.github/workflows/deploy.yml', 'utf-8')
      expect(workflow).toContain('pnpm/action-setup')
      expect(workflow).toContain('pnpm install')
      expect(workflow).toContain('cache: pnpm')
    })
  })

  describe('文档结构', () => {
    it('应该存在首页', () => {
      const indexPath = resolve(process.cwd(), 'docs/index.md')
      expect(existsSync(indexPath)).toBe(true)
    })

    it('首页应该包含 hero 配置', () => {
      const index = readFileSync('docs/index.md', 'utf-8')
      expect(index).toContain('layout: home')
      expect(index).toContain('hero:')
      expect(index).toContain('features:')
    })

    it('应该存在安装文档', () => {
      const installPath = resolve(process.cwd(), 'docs/getting-started/installation.md')
      expect(existsSync(installPath)).toBe(true)
    })

    it('安装文档应该包含完整的 frontmatter', () => {
      const install = readFileSync('docs/getting-started/installation.md', 'utf-8')
      expect(install).toContain('title:')
      expect(install).toContain('description:')
      expect(install).toContain('sidebar_position:')
      expect(install).toContain('lastUpdated:')
    })
  })

  describe('代码质量工具', () => {
    it('应该存在 .prettierrc', () => {
      const prettierPath = resolve(process.cwd(), '.prettierrc')
      expect(existsSync(prettierPath)).toBe(true)
    })

    it('应该存在 .eslintrc.cjs', () => {
      const eslintPath = resolve(process.cwd(), '.eslintrc.cjs')
      expect(existsSync(eslintPath)).toBe(true)
    })

    it('应该存在 .gitignore', () => {
      const gitignorePath = resolve(process.cwd(), '.gitignore')
      expect(existsSync(gitignorePath)).toBe(true)
    })
  })

  describe('README', () => {
    it('应该存在且包含项目信息', () => {
      const readmePath = resolve(process.cwd(), 'README.md')
      expect(existsSync(readmePath)).toBe(true)
      
      const readme = readFileSync(readmePath, 'utf-8')
      expect(readme).toContain('Locust 中文文档')
      expect(readme).toContain('VitePress')
      expect(readme).toContain('Brotli')
    })
  })
})
