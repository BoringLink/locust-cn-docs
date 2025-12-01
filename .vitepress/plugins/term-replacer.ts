/**
 * 术语替换 Markdown-It 插件
 * 在 Markdown 解析阶段注入 TermTooltip 组件，避免被转义或破坏表格结构。
 */

import type MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token'
import termsData from '../data/terms.json'
import { validateTermsDatabase, type TermEntry, type TermsDatabase } from '../utils/terms'

export interface TermReplacerOptions {
  markFirstOccurrence?: boolean
  ignoreBlockDirectives?: {
    start: string
    end: string
  }
}

interface TermLookupEntry {
  id: string
  entry: TermEntry
}

const termsDb = validateTermsDatabase(termsData as TermsDatabase)
const sortedTerms = Object.entries(termsDb.terms).sort(([, a], [, b]) => b.en.length - a.en.length)
const lookupMap = new Map<string, TermLookupEntry>()
for (const [id, entry] of sortedTerms) {
  lookupMap.set(entry.en.toLowerCase(), { id, entry })
}
const termPatternSource = buildTermPattern(sortedTerms)

export function termReplacerPlugin(md: MarkdownIt, options: TermReplacerOptions = {}): void {
  if (!termPatternSource) {
    return
  }

  const config = {
    markFirstOccurrence: options.markFirstOccurrence ?? true,
    ignoreBlockDirectives: options.ignoreBlockDirectives ?? {
      start: '<!-- term-replacer:ignore-start -->',
      end: '<!-- term-replacer:ignore-end -->',
    },
  }

  md.core.ruler.after('inline', 'term-replacer', (state) => {
    const termOccurrences = new Map<string, boolean>()
    const ignoreState = { depth: 0 }

    for (const token of state.tokens) {
      if (token.type === 'html_block') {
        updateIgnoreDepth(token.content, ignoreState, config.ignoreBlockDirectives)
        continue
      }

      if (token.type !== 'inline' || !token.children) {
        continue
      }

      token.children = processInlineChildren(
        token.children,
        state,
        termOccurrences,
        ignoreState,
        config
      )
    }
  })
}

function processInlineChildren(
  children: Token[],
  state: MarkdownIt.Core.StateCore,
  termOccurrences: Map<string, boolean>,
  ignoreState: { depth: number },
  config: Required<TermReplacerOptions>
): Token[] {
  const TokenCtor = state.Token
  const nextChildren: Token[] = []
  let linkDepth = 0

  for (const child of children) {
    if (child.type === 'link_open') {
      linkDepth += 1
      nextChildren.push(child)
      continue
    }

    if (child.type === 'link_close') {
      linkDepth = Math.max(0, linkDepth - 1)
      nextChildren.push(child)
      continue
    }

    if (child.type === 'html_inline') {
      updateIgnoreDepth(child.content, ignoreState, config.ignoreBlockDirectives)
      nextChildren.push(child)
      continue
    }

    if (ignoreState.depth > 0 || linkDepth > 0) {
      nextChildren.push(child)
      continue
    }

    if (child.type === 'code_inline' || child.type === 'code_block' || child.type === 'fence') {
      nextChildren.push(child)
      continue
    }

    if (child.type === 'text') {
      const replaced = replaceTextNode(
        child.content,
        TokenCtor,
        termOccurrences,
        config.markFirstOccurrence
      )
      if (replaced) {
        nextChildren.push(...replaced)
      } else {
        nextChildren.push(child)
      }
      continue
    }

    nextChildren.push(child)
  }

  return nextChildren
}

function replaceTextNode(
  content: string,
  TokenCtor: typeof Token,
  termOccurrences: Map<string, boolean>,
  markFirstOccurrence: boolean
): Token[] | null {
  if (!termPatternSource) {
    return null
  }

  const regex = new RegExp(termPatternSource, 'gi')
  let match: RegExpExecArray | null
  let lastIndex = 0
  const tokens: Token[] = []

  while ((match = regex.exec(content)) !== null) {
    const matchedText = match[0]
    const start = match.index
    const lookup = lookupMap.get(matchedText.toLowerCase())

    if (!lookup) {
      continue
    }

    if (start > lastIndex) {
      tokens.push(createTextToken(content.slice(lastIndex, start), TokenCtor))
    }

    const alreadySeen = termOccurrences.has(lookup.id)
    const isFirst = markFirstOccurrence ? !alreadySeen : false
    if (markFirstOccurrence) {
      termOccurrences.set(lookup.id, true)
    }

    tokens.push(createHtmlToken(createTermComponent(lookup.entry, isFirst), TokenCtor))
    lastIndex = regex.lastIndex
  }

  if (!tokens.length) {
    return null
  }

  if (lastIndex < content.length) {
    tokens.push(createTextToken(content.slice(lastIndex), TokenCtor))
  }

  return tokens
}

function createTermComponent(term: TermEntry, isFirst: boolean): string {
  const termAttr = escapeAttribute(term.zh)
  const englishAttr = escapeAttribute(term.en)
  const definitionAttr = escapeAttribute(term.definition)
  return `<TermTooltip term="${termAttr}" english="${englishAttr}" definition="${definitionAttr}" :first-occurrence="${isFirst}"/>`
}

function createTextToken(text: string, TokenCtor: typeof Token): Token {
  const token = new TokenCtor('text', '', 0)
  token.content = text
  return token
}

function createHtmlToken(html: string, TokenCtor: typeof Token): Token {
  const token = new TokenCtor('html_inline', '', 0)
  token.content = html
  return token
}

function updateIgnoreDepth(
  content: string,
  ignoreState: { depth: number },
  directives?: { start: string; end: string }
): void {
  if (!directives) {
    return
  }

  const { start, end } = directives
  if (!start || !end) {
    return
  }

  let cursor = 0
  while (cursor < content.length) {
    const startIdx = content.indexOf(start, cursor)
    const endIdx = content.indexOf(end, cursor)

    if (startIdx !== -1 && (startIdx < endIdx || endIdx === -1)) {
      ignoreState.depth += 1
      cursor = startIdx + start.length
    } else if (endIdx !== -1) {
      ignoreState.depth = Math.max(0, ignoreState.depth - 1)
      cursor = endIdx + end.length
    } else {
      break
    }
  }
}

function buildTermPattern(entries: Array<[string, TermEntry]>): string {
  if (!entries.length) {
    return ''
  }
  const alternations = entries.map(([, entry]) => escapeRegExp(entry.en)).filter(Boolean)
  if (!alternations.length) {
    return ''
  }
  return `\\b(${alternations.join('|')})\\b`
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
