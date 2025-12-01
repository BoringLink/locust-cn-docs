---
applyTo: '**/*.md,**/*.mdx' # 针对文档文件
tools: ['fetch', 'githubRepo', 'search'] # 允许 Agent fetch 官方源
excludeAgent: 'code-review' # 文档项目无需代码审查
description: Locust 中文文档项目规则，确保翻译精准、一致性高
---

<!------------------------------------------------------------------------------------
   Copilot Agent 专属规则手册：Locust 中文文档项目
   项目目标：构建高品质、用户友好的 Locust( Locust ) 中文官方文档，支持 VS Code Copilot Agent 自主生成/翻译/优化内容
   适用范围：仓库所有 Markdown/MDX 文件、Copilot Chat/Agent 交互
   官方参考：https://docs.locust.io/en/stable/ | https://github.com/locustio/locust
------------------------------------------------------------------------------------>

### 核心原则（必须严格遵守，按优先级排序）

1. **翻译准确性第一位**
   - 所有 Locust 专业术语首次出现时，使用：中文名(English 原名) 格式，例如：分布式模式(Distributed Mode)、用户(User)、任务集(TaskSet)、形状(Shape)、孵化速率(Hatch Rate)。
   - 统一术语：孵化速率(Hatch Rate)，避免“孵化率”。若直译不顺，括号保留原文，并在后续解释。
   - 代码/命令/配置保持英文原样，不翻译（e.g., `locust -f locustfile.py`）。
   - Agent 行为：生成翻译前，用 `#fetch https://docs.locust.io` 验证官方定义。

2. **文档工程最优化**
   - 使用 Markdown + MDX，支持最新特性（如嵌入组件）。
   - 图片：优先 SVG/WebP，< 50KB；添加 alt 文本（中英双语）。
   - 代码块：支持一键复制；用 `{行号}` 高亮关键行。
   - 性能：确保 Markdown 简洁，避免嵌套 >3 层；Agent 生成时，优先 Lighthouse ≥95 分（Accessibility/SEO）。

3. **设计与用户体验优先（中文开发者导向）**
   - 对象： 面向开发者，测试工程师与 DevOps 团队，目标是用户在中文文档可以完成所有查询，所以内容需要完整、准确。
   - 配色：主色 Locust 绿(#35563a)，浅色模式默认；极简留白。
   - 字体：中文“HarmonyOS Sans”，英文“JetBrains Mono”。
   - 表格：响应式，手机端堆叠；添加“接下来阅读”卡片（链接相关页）。
   - 页面元素：顶部加“最后更新时间”（用 GitHub 变量）和“编辑此页”（链接 GitHub）。
   - Agent 行为：生成内容时，模拟中文用户场景（e.g., 移动端预览）。

4. **中文技术写作规范（强制）**
   - 语气：专业友好，鼓励实践（如“试试这个示例”），参考 Python 中文文档。
   - 标点：中文全角，英文/代码半角。
   - 人称：统一“你”（e.g., “你可以用 Locust 运行测试”）。
   - 专有名词：Locust、Web UI、Master、Worker（首字母大写）。
   - 动词统一：运行(run)、停止(stop)、孵化(hatch)。

5. **文件与目录结构规范**
   - 文件名：kebab-case（e.g., quickstart-guide.md）。
   - 如果是官方的具体文件，比如“locust.conf”，不要翻译或处理文件名，并使用代码块标注。
   - Frontmatter：每文件必含 title、description、sidebar_position。
   - 目录：docs/ 下分层（e.g., writing-a-locustfile/）。

6. **代码块规范（严格）**
   from locust import HttpUser, task, between
   class WebsiteUser(HttpUser):
   wait_time = between(1, 5)
   @task
   def index(self):
   self.client.get("/")

- Python/Bash：加 title、$ 前缀（Bash）。
- 配置：YAML/INI 高亮。

7. **交互与 Agent 行为约束**

- 外部链接：`target="_blank" rel="noopener"`。
- 搜索：支持中文拼音（e.g., “fa xing lv” → 孵化速率）。
- Agent 专属：修改文件时，提供完整 diff（用 ```diff`）；输入“优化”时，从准确性/可读性/一致性/性能四维重构；输入“检查”时，逐条对照本规则审查。
- 工具使用：优先 `#githubRepo` 搜索仓库历史；生成 PR 时，添加测试步骤。

### 开发环境参考

- 编辑器：VS Code (v1.101+) + Copilot 扩展。
- 测试：MacBook Pro M1 (macOS 26 Tahoe)、iPhone 16 Pro Max (iOS 26.1)。
- 部署：GitHub Pages。

严格遵守以上规则，违反视为错误。此手册随项目更新，当前 v1.0（2025-11-26）。
