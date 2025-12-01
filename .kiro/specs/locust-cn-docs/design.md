# 设计文档 - Locust 中文文档项目

## 概述

本设计文档描述了 Locust 中文文档系统的技术架构和实现方案。该系统将采用现代化的静态站点生成技术，结合性能优化、国际化支持和高级 UI 设计，为中文开发者提供极致的文档阅读体验。

### 核心优势

✅ **完全免费** - 所有工具和服务都是开源免费的，无任何付费依赖
✅ **性能极致** - 基于 Vite 5，构建速度比 Webpack 快 10-100 倍
✅ **轻量级** - 产物仅 ~15KB (Brotli 压缩)，比传统方案小 10 倍
✅ **现代化** - 使用最新的 ESM、Vue 3、TypeScript、UnoCSS
✅ **零成本部署** - GitHub Pages 免费托管，GitHub Actions 免费 CI/CD

### 技术栈选择

**核心框架**: VitePress 1.x
- 理由：基于 Vite 5 的现代文档框架，构建速度极快
- Vue 3 驱动，轻量级（~15KB Brotli 压缩）
- 原生支持 Markdown、Vue 组件、i18n
- 性能极致，默认 Lighthouse 100 分
- 完全免费开源，无任何付费依赖

**为什么选择 VitePress 而不是 Docusaurus**:
- Vite 比 Webpack 快 10-100 倍（HMR 毫秒级）
- 更轻量：VitePress 产物 ~15KB (Brotli) vs Docusaurus ~200KB (gzip)
- 更现代：使用 ESM、原生 TypeScript
- 更简单：配置更少，学习曲线平缓
- MDX 支持：通过 @vitejs/plugin-vue-jsx 实现
- 压缩优化：Vite 默认生成 Brotli 和 gzip 双格式，自动选择最优

**UI 框架**: Vue 3 + TypeScript
**样式方案**: UnoCSS（比 Tailwind 更快，零运行时）
**搜索引擎**: Algolia DocSearch（开源项目免费，需申请）+ 本地搜索备选（MiniSearch）
**图片优化**: vite-plugin-imagemin（Sharp 后端，免费）
**拼音搜索**: pinyin-pro（开源库，免费）
**部署平台**: GitHub Pages + GitHub Actions（完全免费）

## 架构

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户浏览器                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  搜索组件     │  │  导航组件     │  │  主题切换     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    静态资源 (GitHub Pages)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  HTML 页面    │  │  JS Bundle   │  │  CSS 样式     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  WebP 图片    │  │  搜索索引     │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    构建流程 (GitHub Actions)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  MDX 解析     │  │  图片压缩     │  │  代码高亮     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  术语替换     │  │  SEO 优化     │  │  性能分析     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    源文件 (Git Repository)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  MDX 文档     │  │  配置文件     │  │  自定义组件   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  术语表       │  │  原始图片     │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### 目录结构

```
locust-cn-docs/
├── docs/                          # 文档内容
│   ├── getting-started/           # 快速开始
│   ├── writing-locustfile/        # 编写测试文件
│   ├── running-distributed/       # 分布式运行
│   ├── configuration/             # 配置说明
│   └── api/                       # API 参考
├── .vitepress/                    # VitePress 配置
│   ├── config.ts                  # 主配置文件
│   ├── theme/                     # 自定义主题
│   │   ├── index.ts               # 主题入口
│   │   ├── components/            # Vue 组件
│   │   │   ├── CodeBlock.vue      # 增强代码块
│   │   │   ├── TermTooltip.vue    # 术语提示
│   │   │   ├── NextReading.vue    # 下一篇推荐
│   │   │   └── ResponsiveTable.vue # 响应式表格
│   │   └── styles/                # 样式文件
│   │       ├── vars.css           # CSS 变量
│   │       └── custom.css         # 自定义样式
│   ├── plugins/                   # Vite 插件
│   │   ├── term-replacer.ts       # 术语替换插件
│   │   ├── image-optimizer.ts     # 图片优化插件
│   │   └── pinyin-search.ts       # 拼音搜索插件
│   └── data/                      # 数据文件
│       ├── terms.json             # 术语对照表
│       └── reading-path.json      # 阅读路径配置
├── public/                        # 静态资源
│   ├── images/                    # 图片资源
│   └── fonts/                     # 字体文件
├── package.json                   # 依赖管理
├── tsconfig.json                  # TypeScript 配置
├── uno.config.ts                  # UnoCSS 配置
└── .github/                       # GitHub 配置
    └── workflows/
        └── deploy.yml             # 自动部署
```

## 组件和接口

### 核心组件

#### 1. TermTooltip 组件（Vue）
```typescript
interface TermTooltipProps {
  term: string;           // 中文术语
  english: string;        // 英文原文
  definition?: string;    // 可选的详细定义
  firstOccurrence: boolean; // 是否首次出现
}
```

**职责**: 
- 首次出现时显示"中文(English)"格式
- 后续出现时显示为可悬停的提示
- 从术语表自动加载定义

#### 2. EnhancedCodeBlock 组件（Vue）
```typescript
interface EnhancedCodeBlockProps {
  code: string;
  language: string;
  title?: string;
  highlightLines?: number[];
  showLineNumbers: boolean;
  enableCopy: boolean;
  enableRun?: boolean;  // 未来支持在线运行
}
```

**职责**:
- 语法高亮（使用 Shiki，VitePress 内置）
- 行号显示
- 一键复制功能
- 指定行高亮
- 文件名标题显示

#### 3. ResponsiveTable 组件（Vue）
```typescript
interface ResponsiveTableProps {
  headers: string[];
  rows: Array<Array<string | VNode>>;
  mobileStackable: boolean;
}
```

**职责**:
- 桌面端显示标准表格
- 移动端自动堆叠为卡片布局
- 支持排序和筛选

#### 4. NextReading 组件（Vue）
```typescript
interface NextReadingProps {
  currentPath: string;
  readingPath: ReadingPathConfig;
}

interface ReadingPathConfig {
  [key: string]: {
    next: string;
    title: string;
    description: string;
  };
}
```

**职责**:
- 根据当前页面推荐下一篇文章
- 显示推荐理由
- 支持自定义阅读路径

#### 5. SidebarPersistence 组件（Vue Composable）
```typescript
interface SidebarState {
  expandedItems: string[];
  scrollPosition: number;
}

function useSidebarPersistence(): {
  state: Ref<SidebarState>;
  saveState: () => void;
  restoreState: () => void;
}
```

**职责**:
- 监听侧边栏展开/折叠事件
- 将状态保存到 localStorage
- 页面加载时恢复状态

### 插件接口

#### 1. TermReplacerPlugin
```typescript
interface TermReplacerOptions {
  termsFile: string;      // 术语表文件路径
  markFirstOccurrence: boolean;
}
```

**功能**:
- 构建时扫描所有 MDX 文件
- 自动标记术语首次出现
- 注入 TermTooltip 组件

#### 2. ImageOptimizerPlugin
```typescript
interface ImageOptimizerOptions {
  formats: ['webp', 'avif'];
  maxSize: number;        // 最大文件大小（KB）
  quality: number;        // 压缩质量 0-100
}
```

**功能**:
- 自动转换图片格式
- 生成多种尺寸的响应式图片
- 添加懒加载属性

#### 3. PinyinSearchPlugin
```typescript
interface PinyinSearchOptions {
  indexFields: string[];  // 需要索引的字段
  pinyinLibrary: 'pinyin-pro' | 'pinyin';
}
```

**功能**:
- 为中文内容生成拼音索引
- 集成到 Algolia DocSearch
- 支持全拼和首字母搜索

## 数据模型

### 术语表数据结构
```typescript
interface TermEntry {
  zh: string;              // 中文术语
  en: string;              // 英文原文
  definition: string;      // 详细定义
  category: string;        // 分类（如：核心概念、配置项）
  relatedTerms: string[];  // 相关术语
}

interface TermsDatabase {
  version: string;
  lastUpdated: string;
  terms: Record<string, TermEntry>;
}
```

### 文档元数据
```typescript
interface DocFrontmatter {
  title: string;
  description: string;
  sidebar_position: number;
  sidebar_label?: string;
  lastUpdated: string;     // ISO 8601 格式
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}
```

### 阅读路径配置
```typescript
interface ReadingNode {
  path: string;
  title: string;
  description: string;
  next?: string;           // 下一篇路径
  prerequisites?: string[]; // 前置阅读
  estimatedTime?: number;  // 预计阅读时间（分钟）
}

interface ReadingPath {
  name: string;
  description: string;
  nodes: ReadingNode[];
}
```

## 正确性属性

*属性(Property)是系统在所有有效执行中应保持为真的特征或行为——本质上是关于系统应该做什么的形式化陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性 1: 术语首次出现格式一致性
*对于任何*文档页面和任何专业术语，当该术语在页面正文中首次出现时，渲染结果应包含"中文(English)"格式，后续出现应仅显示中文。
**验证需求: 1.1**

### 属性 2: 代码内容不翻译
*对于任何*包含代码块、命令行或配置文件的文档页面，所有代码内容中的英文字符应与源文件完全一致，不应被翻译或修改。
**验证需求: 1.2**

### 属性 3: 术语翻译一致性
*对于任何*在术语表中定义的英文术语，在所有文档页面中的中文翻译应完全一致。
**验证需求: 1.3**

### 属性 4: 图片格式和大小限制
*对于任何*非 SVG 格式的图片资源，构建后的输出应为 WebP 或 AVIF 格式，且文件大小应小于 100KB。
**验证需求: 2.3**

### 属性 5: Lighthouse 性能分数
*对于任何*文档页面，在 Lighthouse 测试中 Performance 分数应大于等于 98，Accessibility、Best Practices 和 SEO 分数应等于 100。
**验证需求: 3.1, 3.2, 3.3, 3.4**

### 属性 6: 代码块必需元素
*对于任何*代码块，渲染后的 DOM 应包含复制按钮、行号显示和语法高亮样式。
**验证需求: 5.1, 5.2, 5.3**

### 属性 7: 侧边栏状态持久化
*对于任何*侧边栏展开/折叠操作，刷新页面后侧边栏的展开状态应与操作前保持一致。
**验证需求: 6.1**

### 属性 8: 拼音搜索匹配
*对于任何*中文文档内容，使用对应的拼音（全拼或首字母）进行搜索应返回包含该内容的页面。
**验证需求: 6.2**

### 属性 9: 外部链接安全属性
*对于任何*指向外部域名的链接，渲染后的 `<a>` 标签应包含 `target="_blank"` 和 `rel="noopener"` 属性。
**验证需求: 7.3**

### 属性 10: 文件命名规范
*对于任何*新创建的文档文件或目录，其名称应符合 kebab-case 格式（小写字母和连字符）。
**验证需求: 7.5, 8.1**

### 属性 11: Frontmatter 完整性
*对于任何*文档文件，其 frontmatter 应包含 title、description、sidebar_position 和 lastUpdated 四个必需字段。
**验证需求: 7.4, 8.2**

### 属性 12: 移动端触摸目标大小
*对于任何*可交互元素（按钮、链接），在移动设备视口下的渲染尺寸应至少为 44x44 像素。
**验证需求: 9.4**

### 属性 13: GitHub Pages 路径正确性
*对于任何*内部链接和资源引用，在 GitHub Pages 部署后应正确解析到对应的资源，不应出现 404 错误。
**验证需求: 10.2**

### 属性 14: SEO 元数据生成
*对于任何*文档页面，构建后应生成包含该页面的 sitemap.xml 条目。
**验证需求: 10.4**

## 错误处理

### 构建时错误

1. **术语表验证失败**
   - 检测：构建时验证 terms.json 格式
   - 处理：输出详细错误信息，指出具体的格式问题
   - 恢复：提供默认术语表，允许构建继续

2. **图片优化失败**
   - 检测：Sharp 处理图片时抛出异常
   - 处理：记录警告日志，保留原始图片
   - 恢复：跳过该图片的优化，继续处理其他图片

3. **MDX 解析错误**
   - 检测：MDX 编译器报告语法错误
   - 处理：显示错误位置和原因
   - 恢复：停止构建，要求修复后重试

4. **Frontmatter 缺失**
   - 检测：文档文件缺少必需的 frontmatter 字段
   - 处理：输出警告，列出缺失字段
   - 恢复：使用默认值填充，继续构建

### 运行时错误

1. **搜索服务不可用**
   - 检测：Algolia API 请求失败或未配置
   - 处理：显示友好的错误提示
   - 恢复：自动降级到客户端本地搜索（MiniSearch）

2. **字体加载失败**
   - 检测：字体文件 404 或加载超时
   - 处理：使用系统默认字体
   - 恢复：记录错误到监控系统

3. **LocalStorage 不可用**
   - 检测：浏览器禁用或隐私模式
   - 处理：侧边栏状态不持久化
   - 恢复：每次加载使用默认展开状态

4. **图片加载失败**
   - 检测：图片资源 404
   - 处理：显示占位图和错误提示
   - 恢复：不影响页面其他内容

### 数据验证

1. **术语表数据验证**
```typescript
function validateTermsDatabase(data: unknown): TermsDatabase {
  // 验证必需字段
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid terms database format');
  }
  
  // 验证每个术语条目
  for (const [key, term] of Object.entries(data.terms)) {
    if (!term.zh || !term.en) {
      throw new Error(`Term ${key} missing required fields`);
    }
  }
  
  return data as TermsDatabase;
}
```

2. **Frontmatter 验证**
```typescript
function validateFrontmatter(fm: unknown): DocFrontmatter {
  const required = ['title', 'description', 'sidebar_position', 'lastUpdated'];
  const missing = required.filter(field => !(field in fm));
  
  if (missing.length > 0) {
    throw new Error(`Missing required frontmatter fields: ${missing.join(', ')}`);
  }
  
  return fm as DocFrontmatter;
}
```

## 测试策略

### 单元测试

使用 **Vitest** 和 **@vue/test-utils** 进行组件和工具函数测试：

1. **组件测试**
   - TermTooltip: 测试首次/后续出现的不同渲染
   - EnhancedCodeBlock: 测试复制功能、行号显示
   - ResponsiveTable: 测试响应式布局切换
   - NextReading: 测试推荐逻辑

2. **工具函数测试**
   - 术语替换逻辑
   - 拼音转换准确性
   - 路径解析正确性

3. **插件测试**
   - TermReplacerPlugin: 测试术语标记
   - ImageOptimizerPlugin: 测试图片转换
   - PinyinSearchPlugin: 测试索引生成

### 属性测试

使用 **fast-check** 进行基于属性的测试，每个测试运行至少 100 次迭代：

1. **属性 1 测试: 术语格式一致性**
   - 生成随机文档内容和术语列表
   - 验证首次出现使用"中文(English)"格式
   - **功能: locust-cn-docs, 属性 1: 术语首次出现格式一致性**

2. **属性 2 测试: 代码不翻译**
   - 生成包含代码块的随机文档
   - 验证代码内容未被修改
   - **功能: locust-cn-docs, 属性 2: 代码内容不翻译**

3. **属性 3 测试: 术语翻译一致性**
   - 生成多个包含相同术语的文档
   - 验证所有出现的翻译一致
   - **功能: locust-cn-docs, 属性 3: 术语翻译一致性**

4. **属性 6 测试: 代码块元素**
   - 生成随机代码块配置
   - 验证渲染结果包含所有必需元素
   - **功能: locust-cn-docs, 属性 6: 代码块必需元素**

5. **属性 7 测试: 侧边栏持久化**
   - 生成随机展开/折叠操作序列
   - 验证 localStorage 状态正确
   - **功能: locust-cn-docs, 属性 7: 侧边栏状态持久化**

6. **属性 8 测试: 拼音搜索**
   - 生成随机中文内容
   - 验证拼音搜索能找到对应内容
   - **功能: locust-cn-docs, 属性 8: 拼音搜索匹配**

7. **属性 9 测试: 外部链接属性**
   - 生成包含各种链接的文档
   - 验证外部链接包含安全属性
   - **功能: locust-cn-docs, 属性 9: 外部链接安全属性**

8. **属性 10 测试: 文件命名**
   - 生成随机文件路径
   - 验证符合 kebab-case 规范
   - **功能: locust-cn-docs, 属性 10: 文件命名规范**

9. **属性 11 测试: Frontmatter 完整性**
   - 生成随机文档文件
   - 验证包含所有必需字段
   - **功能: locust-cn-docs, 属性 11: Frontmatter 完整性**

10. **属性 12 测试: 触摸目标大小**
    - 生成随机交互元素
    - 验证移动端尺寸符合要求
    - **功能: locust-cn-docs, 属性 12: 移动端触摸目标大小**

### 集成测试

使用 **Playwright** 进行端到端测试：

1. **导航流程测试**
   - 测试侧边栏导航
   - 测试面包屑导航
   - 测试"下一篇"推荐链接

2. **搜索功能测试**
   - 测试中文搜索
   - 测试拼音搜索
   - 测试搜索结果准确性

3. **响应式测试**
   - 在不同设备尺寸下测试布局
   - 测试表格堆叠
   - 测试移动端菜单

4. **性能测试**
   - 使用 Lighthouse CI 自动化测试
   - 验证所有页面达到性能目标
   - 监控构建产物大小

### 视觉回归测试

使用 **Playwright** 内置截图对比功能（完全免费）：

1. 关键页面截图对比
2. 不同主题模式对比
3. 响应式布局对比
4. 代码块样式对比

```typescript
// 示例：使用 Playwright 进行视觉测试
test('homepage visual regression', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});
```

### 测试覆盖率目标

- 组件代码覆盖率: ≥ 90%
- 工具函数覆盖率: ≥ 95%
- 插件代码覆盖率: ≥ 85%
- 端到端测试覆盖核心用户流程: 100%

### 持续集成

GitHub Actions 工作流：

1. **PR 检查**
   - 运行所有单元测试和属性测试
   - 运行 ESLint 和 Prettier
   - 构建预览版本
   - 运行 Lighthouse CI

2. **主分支部署**
   - 运行完整测试套件
   - 构建生产版本
   - 部署到 GitHub Pages
   - 更新搜索索引

3. **定期检查**
   - 每日运行端到端测试
   - 每周检查依赖更新
   - 每月进行性能审计
