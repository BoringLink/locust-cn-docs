import { defineConfig } from 'vitepress'
import UnoCSS from 'unocss/vite'
import viteCompression from 'vite-plugin-compression'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { externalLinksPlugin } from './plugins/external-links'
import { termReplacerPlugin } from './plugins/term-replacer'

export default defineConfig({
  title: 'Locust中文文档 - Python开源性能测试框架 | 官方中文教程与完整API文档',
  description: 'Locust 性能测试框架官方中文文档 - 简单、可扩展、开源',
  lang: 'zh-CN',
  ignoreDeadLinks: [/^https?:\/\/localhost(:\d+)?/],

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#35563a' }],
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1' }],
    ['meta', { name: 'author', content: 'Locust 中文文档个人开发者 Boring Link' }],
    [
      'meta',
      {
        name: 'keywords',
        content: 'Locust,性能测试,Python测试工具,负载测试,分布式测试,压力测试,API测试',
      },
    ],

    // Open Graph / Facebook
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Locust 中文文档' }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    [
      'meta',
      {
        property: 'og:title',
        content: 'Locust中文文档 - Python开源性能测试框架 | 官方教程与API文档',
      },
    ],
    [
      'meta',
      {
        property: 'og:description',
        content:
          '使用 Python 编写性能测试脚本，支持分布式负载测试，提供实时 Web UI 监控。Locust 官方中文文档，翻译精准，示例完整。',
      },
    ],
    ['meta', { property: 'og:url', content: 'https://locust-cn.pages.dev/' }],
    ['meta', { property: 'og:image', content: 'https://locust-cn.pages.dev/Locust-logo.svg' }],

    // Twitter Card
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    [
      'meta',
      {
        name: 'twitter:title',
        content: 'Locust中文文档 - Python开源性能测试框架 | 官方教程与API文档',
      },
    ],
    [
      'meta',
      {
        name: 'twitter:description',
        content: '使用 Python 编写性能测试脚本，支持分布式负载测试，提供实时 Web UI 监控。',
      },
    ],
    [
      'meta',
      {
        name: 'twitter:image',
        content: 'https://locust-cn.pages.dev/Locust-logo.svg',
      },
    ],

    // 百度 SEO 优化
    ['meta', { name: 'baidu-site-verification', content: 'codeva-XXXXXXXX' }],
    ['meta', { name: 'mobile-agent', content: 'format=html5; url=https://locust-cn.pages.dev/' }],
    ['meta', { name: 'applicable-device', content: 'pc,mobile' }],
    ['meta', { name: 'renderer', content: 'webkit' }],
    ['meta', { httpEquiv: 'Cache-Control', content: 'no-transform' }],
    ['meta', { httpEquiv: 'Cache-Control', content: 'no-siteapp' }],

    // 360 搜索优化
    ['meta', { name: '360-site-verification', content: 'XXXXXXXXXXXXXXXXXXXXXXXX' }],

    // 搜狗搜索优化
    ['meta', { name: 'sogou_site_verification', content: 'XXXXXXXXXXXXXXXX' }],

    // Google 站点验证
    ['meta', { name: 'google-site-verification', content: 'XXXXXXXXXXXXXXXXXXXXXXXX' }],

    // Canonical URL
    ['link', { rel: 'canonical', href: 'https://locust-cn.pages.dev/' }],

    // Alternate language versions
    ['link', { rel: 'alternate', hreflang: 'zh-CN', href: 'https://locust-cn.pages.dev/' }],
    ['link', { rel: 'alternate', hreflang: 'en', href: 'https://docs.locust.io/' }],

    // JSON-LD 结构化数据
    [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Locust',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Cross-platform',
        description:
          'Locust 是一个易于使用、可编写脚本且可扩展的性能测试工具。使用 Python 代码定义用户行为，测试任何系统。',
        url: 'https://locust-cn.pages.dev/',
        author: {
          '@type': 'Organization',
          name: 'Locust 中文文档团队',
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '2000',
          bestRating: '5',
          worstRating: '1',
        },
        programmingLanguage: 'Python',
        keywords: 'Locust,性能测试,Python测试工具,负载测试,分布式测试,压力测试,API测试',
        inLanguage: 'zh-CN',
        license: 'https://opensource.org/licenses/MIT',
        softwareVersion: '2.45.5',
        releaseNotes: 'https://github.com/locustio/locust/releases',
        applicationSubCategory: '性能测试工具',
        featureList: [
          '分布式负载测试',
          'Python脚本编写',
          '实时Web监控',
          '支持多种协议',
          '开源免费',
        ],
      }),
    ],
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

  // 源目录配置
  srcDir: 'docs',

  // 站点地图
  sitemap: {
    hostname: 'https://locust-cn.pages.dev',
    transformItems: (items) => {
      return items.map((item) => {
        const url = item.url

        // 首页优先级最高
        if (url === 'https://locust-cn.pages.dev/' || url === 'https://locust-cn.pages.dev') {
          return { ...item, priority: 1.0, changefreq: 'weekly' }
        }
        // API 参考（必须在 getting-started 之前检查）
        if (url.includes('/api/') || url.includes('/api')) {
          return { ...item, priority: 0.7, changefreq: 'monthly' }
        }
        // 快速开始和主要文档页面
        if (
          url.includes('/getting-started') ||
          url.includes('/writing-locustfile') ||
          url.includes('/running-tests')
        ) {
          return { ...item, priority: 0.8, changefreq: 'weekly' }
        }
        // 其他页面
        return { ...item, priority: 0.5, changefreq: 'monthly' }
      })
    },
  },

  // 动态 head 标签配置（为每个页面生成唯一的 SEO 元数据）
  transformHead: ({ pageData }) => {
    const head = []
    // 生成规范的URL，移除index后缀，确保尾部斜杠一致性
    let path = pageData.relativePath.replace(/\.md$/, '').replace(/\/index$/, '')
    if (path && !path.endsWith('/')) {
      path += '/'
    }
    const canonicalUrl = `https://locust-cn.pages.dev/${path}`

    // 为每个页面添加 canonical URL
    head.push(['link', { rel: 'canonical', href: canonicalUrl }])

    // 如果页面有描述，添加 og:description
    if (pageData.frontmatter.description) {
      head.push(['meta', { property: 'og:description', content: pageData.frontmatter.description }])
      head.push([
        'meta',
        { name: 'twitter:description', content: pageData.frontmatter.description },
      ])
    }

    // 如果页面有标题，添加 og:title
    if (pageData.title) {
      const fullTitle = `${pageData.title} | Locust 中文文档`
      head.push(['meta', { property: 'og:title', content: fullTitle }])
      head.push(['meta', { name: 'twitter:title', content: fullTitle }])
    }

    // 添加页面 URL
    head.push(['meta', { property: 'og:url', content: canonicalUrl }])

    // 为文档页面添加额外的结构化数据
    if (
      pageData.relativePath.includes('getting-started') ||
      pageData.relativePath.includes('writing-locustfile') ||
      pageData.relativePath.includes('running-tests') ||
      pageData.relativePath.includes('api')
    ) {
      const breadcrumbList = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Locust 中文文档',
            item: 'https://locust-cn.pages.dev/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: pageData.title,
            item: canonicalUrl,
          },
        ],
      }
      head.push(['script', { type: 'application/ld+json' }, JSON.stringify(breadcrumbList)])

      // 为教程/文档页面添加 TechArticle 结构化数据
      const techArticle = {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: pageData.title,
        description: pageData.frontmatter.description || '',
        author: {
          '@type': 'Organization',
          name: 'Locust 中文文档团队',
        },
        datePublished: pageData.frontmatter.lastUpdated || '2025-11-27',
        dateModified: pageData.frontmatter.lastUpdated || '2025-11-27',
        inLanguage: 'zh-CN',
        url: canonicalUrl,
      }
      head.push(['script', { type: 'application/ld+json' }, JSON.stringify(techArticle)])
    }

    return head
  },
})
