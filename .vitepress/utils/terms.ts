/**
 * 术语管理工具
 * 用于加载、验证和查询术语表
 */

export interface TermEntry {
  zh: string // 中文术语
  en: string // 英文原文
  definition: string // 详细定义
  category: string // 分类
  relatedTerms: string[] // 相关术语
}

export interface TermsDatabase {
  version: string
  lastUpdated: string
  terms: Record<string, TermEntry>
}

/**
 * 验证术语表数据格式
 */
export function validateTermsDatabase(data: unknown): TermsDatabase {
  if (!data || typeof data !== 'object') {
    throw new Error('术语表数据格式无效：必须是对象')
  }

  const db = data as Partial<TermsDatabase>

  // 验证必需字段
  if (!db.version || typeof db.version !== 'string') {
    throw new Error('术语表缺少 version 字段或格式错误')
  }

  if (!db.lastUpdated || typeof db.lastUpdated !== 'string') {
    throw new Error('术语表缺少 lastUpdated 字段或格式错误')
  }

  if (!db.terms || typeof db.terms !== 'object') {
    throw new Error('术语表缺少 terms 字段或格式错误')
  }

  // 验证每个术语条目
  for (const [key, term] of Object.entries(db.terms)) {
    if (!term || typeof term !== 'object') {
      throw new Error(`术语 ${key} 格式无效`)
    }

    const requiredFields = ['zh', 'en', 'definition', 'category', 'relatedTerms']
    for (const field of requiredFields) {
      if (!(field in term)) {
        throw new Error(`术语 ${key} 缺少必需字段: ${field}`)
      }
    }

    if (typeof term.zh !== 'string' || term.zh.trim() === '') {
      throw new Error(`术语 ${key} 的 zh 字段必须是非空字符串`)
    }

    if (typeof term.en !== 'string' || term.en.trim() === '') {
      throw new Error(`术语 ${key} 的 en 字段必须是非空字符串`)
    }

    if (typeof term.definition !== 'string' || term.definition.trim() === '') {
      throw new Error(`术语 ${key} 的 definition 字段必须是非空字符串`)
    }

    if (typeof term.category !== 'string' || term.category.trim() === '') {
      throw new Error(`术语 ${key} 的 category 字段必须是非空字符串`)
    }

    if (!Array.isArray(term.relatedTerms)) {
      throw new Error(`术语 ${key} 的 relatedTerms 字段必须是数组`)
    }
  }

  return db as TermsDatabase
}

/**
 * 加载术语表
 */
export async function loadTermsDatabase(): Promise<TermsDatabase> {
  try {
    const data = await import('../data/terms.json')
    return validateTermsDatabase(data.default || data)
  } catch (error) {
    throw new Error(`加载术语表失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * 根据英文术语获取中文翻译
 */
export function getChineseTerm(db: TermsDatabase, englishTerm: string): string | null {
  const entry = Object.values(db.terms).find((term) => term.en.toLowerCase() === englishTerm.toLowerCase())
  return entry ? entry.zh : null
}

/**
 * 根据术语 ID 获取完整信息
 */
export function getTermById(db: TermsDatabase, termId: string): TermEntry | null {
  return db.terms[termId] || null
}

/**
 * 搜索术语（支持中英文）
 */
export function searchTerms(db: TermsDatabase, query: string): TermEntry[] {
  const lowerQuery = query.toLowerCase()
  return Object.values(db.terms).filter(
    (term) =>
      term.zh.toLowerCase().includes(lowerQuery) ||
      term.en.toLowerCase().includes(lowerQuery) ||
      term.definition.toLowerCase().includes(lowerQuery)
  )
}

/**
 * 按分类获取术语
 */
export function getTermsByCategory(db: TermsDatabase, category: string): TermEntry[] {
  return Object.values(db.terms).filter((term) => term.category === category)
}

/**
 * 获取所有分类
 */
export function getAllCategories(db: TermsDatabase): string[] {
  const categories = new Set(Object.values(db.terms).map((term) => term.category))
  return Array.from(categories).sort()
}

/**
 * 验证术语引用的完整性
 * 检查 relatedTerms 中引用的术语是否都存在
 */
export function validateTermReferences(db: TermsDatabase): string[] {
  const errors: string[] = []
  const termIds = new Set(Object.keys(db.terms))

  for (const [termId, term] of Object.entries(db.terms)) {
    for (const relatedId of term.relatedTerms) {
      if (!termIds.has(relatedId)) {
        errors.push(`术语 ${termId} 引用了不存在的术语: ${relatedId}`)
      }
    }
  }

  return errors
}

/**
 * 格式化术语为"中文(English)"格式
 */
export function formatTermWithEnglish(term: TermEntry): string {
  return `${term.zh}(${term.en})`
}

/**
 * 检查术语翻译一致性
 * 确保相同的英文术语在所有地方都使用相同的中文翻译
 */
export function checkTranslationConsistency(db: TermsDatabase): Map<string, string[]> {
  const englishToZh = new Map<string, Set<string>>()

  for (const term of Object.values(db.terms)) {
    const en = term.en.toLowerCase()
    if (!englishToZh.has(en)) {
      englishToZh.set(en, new Set())
    }
    englishToZh.get(en)!.add(term.zh)
  }

  // 找出有多个中文翻译的英文术语
  const inconsistencies = new Map<string, string[]>()
  for (const [en, zhSet] of englishToZh.entries()) {
    if (zhSet.size > 1) {
      inconsistencies.set(en, Array.from(zhSet))
    }
  }

  return inconsistencies
}
