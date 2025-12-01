/**
 * 文件命名验证工具
 * 确保所有文档文件使用 kebab-case 命名约定
 */

import { readdirSync, statSync } from 'fs'
import { join, extname, basename } from 'path'

/**
 * 验证文件名是否符合 kebab-case 格式
 */
export function isKebabCase(filename: string): boolean {
  // 移除文件扩展名
  const nameWithoutExt = filename.replace(/\.[^.]+$/, '')
  
  // kebab-case 规则：小写字母、数字和连字符
  const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/
  
  return kebabCaseRegex.test(nameWithoutExt)
}

/**
 * 递归扫描目录中的所有文件
 */
export function scanDirectory(
  dir: string,
  extensions: string[] = ['.md', '.vue', '.ts', '.js']
): string[] {
  const files: string[] = []
  
  try {
    const items = readdirSync(dir)
    
    for (const item of items) {
      const fullPath = join(dir, item)
      const stat = statSync(fullPath)
      
      if (stat.isDirectory()) {
        // 跳过 node_modules 和隐藏目录
        if (item === 'node_modules' || item.startsWith('.')) {
          continue
        }
        // 递归扫描子目录
        files.push(...scanDirectory(fullPath, extensions))
      } else if (stat.isFile()) {
        // 检查文件扩展名
        const ext = extname(item)
        if (extensions.includes(ext)) {
          files.push(fullPath)
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error)
  }
  
  return files
}

/**
 * 验证文件列表中的文件名
 */
export function validateFilenames(files: string[]): {
  valid: string[]
  invalid: { file: string; reason: string }[]
} {
  const valid: string[] = []
  const invalid: { file: string; reason: string }[] = []
  
  for (const file of files) {
    const filename = basename(file)
    
    // 跳过特殊文件
    if (filename === 'README.md' || filename === 'CHANGELOG.md') {
      valid.push(file)
      continue
    }
    
    if (isKebabCase(filename)) {
      valid.push(file)
    } else {
      invalid.push({
        file,
        reason: `文件名 "${filename}" 不符合 kebab-case 格式`,
      })
    }
  }
  
  return { valid, invalid }
}

/**
 * 主验证函数
 */
export function validateProjectFilenames(rootDir: string): boolean {
  console.log('🔍 开始验证文件命名...\n')
  
  // 扫描文档目录
  const docsFiles = scanDirectory(join(rootDir, 'docs'), ['.md'])
  
  // 扫描组件目录
  const componentFiles = scanDirectory(join(rootDir, '.vitepress/theme/components'), ['.vue'])
  
  // 合并所有文件
  const allFiles = [...docsFiles, ...componentFiles]
  
  // 验证文件名
  const { valid, invalid } = validateFilenames(allFiles)
  
  console.log(`✅ 有效文件: ${valid.length}`)
  
  if (invalid.length > 0) {
    console.log(`\n❌ 无效文件: ${invalid.length}\n`)
    invalid.forEach(({ file, reason }) => {
      console.log(`  - ${file}`)
      console.log(`    ${reason}\n`)
    })
    return false
  }
  
  console.log('\n✨ 所有文件命名验证通过！')
  return true
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const rootDir = process.cwd()
  const success = validateProjectFilenames(rootDir)
  process.exit(success ? 0 : 1)
}
