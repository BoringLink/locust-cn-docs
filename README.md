# Locust 中文文档

> 性能极致、工程优雅、翻译精准的 Locust 官方中文文档

[![部署状态](https://github.com/your-repo/locust-cn-docs/workflows/deploy/badge.svg)](https://github.com/your-repo/locust-cn-docs/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 特性

- 🚀 **性能极致** - 基于 VitePress + Vite 5，构建速度快 10-100 倍
- 📦 **轻量级** - Brotli 压缩后仅 ~15KB
- 🎨 **设计高级** - Locust 官方绿主题，极简留白设计
- 🔍 **智能搜索** - 支持中文拼音搜索
- 📱 **响应式** - 完美适配桌面、平板、手机
- ♿ **可访问性** - Lighthouse 100 分
- 🌐 **完全免费** - 无任何付费依赖

## 🛠️ 技术栈

- **框架**: VitePress 1.x
- **UI**: Vue 3 + TypeScript
- **样式**: UnoCSS
- **包管理**: pnpm（更快、更高效）
- **测试**: Vitest + Playwright + fast-check
- **部署**: GitHub Pages

## 📚 文档结构（Locust 2.45.5）

- **Getting started**：安装、快速开始、首个测试
- **Writing Locust tests**：脚本基础、任务/用户建模
- **Running your tests**：运行配置、分布式负载
- **API / Other functionalities**：API 索引、进阶能力

首页 `docs/index.md` 中提供两级信息架构说明，并引导读者在需要英文原文时访问官方稳定版。

## 📦 安装

```bash
# 克隆仓库
git clone https://github.com/your-repo/locust-cn-docs.git
cd locust-cn-docs

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 🚀 开发

```bash
# 开发模式（热重载）
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# 运行测试
pnpm test

# 运行端到端测试
pnpm test:e2e

# 只运行属性测试
pnpm vitest tests/property --runInBand
```

> 第一次执行端到端测试前先运行 `pnpm exec playwright install chromium webkit`。Playwright 配置会自动执行 `pnpm build && pnpm preview`，无需手动构建，只需确保 4173 端口空闲。

## 🧩 主题组件

`ResponsiveTable` 已内置于 `.vitepress/theme/components`，支持桌面表格与移动端卡片双视图，同时允许在文档中高亮或着色个别单元格。

```vue
<ResponsiveTable
  :headers="['字段', '默认值', '说明']"
  :rows="[
    [
      { text: 'host', tone: 'info', highlight: true },
      { text: '--host' },
      { html: '<span style=&quot;color:#16a34a&quot;>覆盖 CLI 默认目标</span>' },
    ],
  ]"
  allow-html
/>
```

- `rows` 支持字符串/数字，或对象 `{ text?, html?, tone?, highlight?, color?, backgroundColor?, bold?, italic? }`。
- `tone` 可选 `neutral | info | success | warning | danger`，自动应用淡色背景与左侧色条。
- `color` / `backgroundColor` 支持任意 CSS 颜色值，适合细粒度强调。
- `allow-html` 为布尔属性，开启后会把字符串或 `html` 字段作为 HTML 片段渲染（确保来源可信）。
- 仍可通过具名 `#cell` 插槽对单元格进行完全自定义渲染。

## 📝 贡献指南

欢迎贡献！请查看 [贡献指南](CONTRIBUTING.md) 了解详情。

### 翻译规范

- 所有专业术语首次出现时使用"中文(English)"格式
- 代码、命令行内容保持英文不翻译
- 使用全角中文标点，英文及代码内使用半角
- 统一使用"你"而非"您"

### 文件命名

- 所有文件使用 kebab-case 命名
- 每个文档必须包含完整的 frontmatter

## 📄 许可证

[MIT](LICENSE)

## 🙏 致谢

- [Locust](https://locust.io/) - 原始项目
- [VitePress](https://vitepress.dev/) - 文档框架
- 所有贡献者

## 📞 联系方式

- 问题反馈：[GitHub Issues](https://github.com/your-repo/locust-cn-docs/issues)
- 讨论交流：[GitHub Discussions](https://github.com/your-repo/locust-cn-docs/discussions)
