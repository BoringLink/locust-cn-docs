import { defineConfig } from 'vitepress'
import UnoCSS from 'unocss/vite'
import viteCompression from 'vite-plugin-compression'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { externalLinksPlugin } from './plugins/external-links'
import { termReplacerPlugin } from './plugins/term-replacer'

export default defineConfig({
  title: 'Locust 中文文档',
  description: 'Locust 性能测试框架官方中文文档 - 简单、可扩展、开源',
  lang: 'zh-CN',
  ignoreDeadLinks: [/^https?:\/\/localhost(:\d+)?/],

  head: [
    ['link', { rel: 'icon', href: '/locust-cn-docs/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#35563a' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh_CN' }],
  ],

  // 主题配置
  themeConfig: {
    siteTitle: false,
    logo: '/Locust-logo.svg',

    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/getting-started/' },
      { text: '文档', link: '/writing-locustfile/' },
      { text: '运行测试', link: '/running-tests/configuration' },
      { text: 'API 参考', link: '/api/' },
    ],

    sidebar: {
      '/getting-started/': [
        {
          text: '快速开始',
          items: [
            { text: '安装', link: '/getting-started/installation' },
            { text: '快速开始', link: '/getting-started/quickstart' },
            { text: '第一个测试', link: '/getting-started/first-test' },
          ],
        },
      ],
      '/writing-locustfile/': [
        {
          text: '编写测试文件',
          items: [
            { text: '基础概念', link: '/writing-locustfile/basics' },
            { text: '任务和用户', link: '/writing-locustfile/tasks-and-users' },
          ],
        },
      ],
      '/running-tests/': [
        {
          text: '运行 Locust 测试',
          items: [
            { text: '运行配置', link: '/running-tests/configuration' },
            { text: '分布式负载', link: '/running-tests/distributed-load' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 与进阶',
          items: [{ text: 'API 参考', link: '/api/index' }],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/locustio/locust' }],

    editLink: {
      pattern: 'https://github.com/your-repo/locust-cn-docs/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'short',
      },
    },

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档',
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                },
              },
            },
          },
        },
      },
    },

    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2025-present Locust 中文文档',
    },
  },

  // Markdown 配置
  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    // 代码块配置
    codeTransformers: [
      // 可以在这里添加自定义代码转换器
    ],
    config: (md) => {
      // 使用外部链接插件
      md.use(externalLinksPlugin)
      md.use(termReplacerPlugin)
    },
  },

  // Vite 配置
  vite: {
    plugins: [
      UnoCSS(),
      // 图片优化
      ViteImageOptimizer({
        png: {
          quality: 80,
        },
        jpeg: {
          quality: 80,
        },
        jpg: {
          quality: 80,
        },
        webp: {
          quality: 80,
        },
        avif: {
          quality: 70,
        },
      }),
      // Brotli 和 Gzip 双格式压缩
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
      }),
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024,
      }),
    ],
    ssr: {
      noExternal: ['@vue/test-utils'],
    },
  },

  // 路由配置
  cleanUrls: true,

  // 构建配置
  build: {
    chunkSizeWarningLimit: 1000,
  },

  // GitHub仓库子路径配置
  base: '/locust-cn-docs/',

  // 源目录配置
  srcDir: 'docs',

  // 站点地图
  sitemap: {
    hostname: 'https://tkssoul.github.io/locust-cn-docs',
  },
})
