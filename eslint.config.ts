// eslint.config.ts
import globals from 'globals'
import eslintPluginVue from 'eslint-plugin-vue'
import eslintConfigPrettier from 'eslint-config-prettier'
import typescriptEslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'

export default typescriptEslint.config(
  // 1. ESLint 官方推荐（对 JS 仍有用）
  // js.configs.recommended,

  // 2. TypeScript 强类型检查规则（重点！）
  ...typescriptEslint.configs.recommendedTypeChecked,
  ...typescriptEslint.configs.stylisticTypeChecked,

  // 3. Vue3 推荐规则
  ...eslintPluginVue.configs['flat/recommended'],

  // 4. 全局环境
  {
    languageOptions: {
      parser: typescriptEslint.parser,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.vue'],
      },
    },
  },

  // 5. Vue 文件专用解析器配置
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: typescriptEslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
  },

  // 6. 针对 TS 项目关闭/调整不必要的 JS 规则，开启更精准的 TS 规则
  {
    files: ['**/*.{ts,tsx,vue}'],
    rules: {
      // —— 关闭只适用于 JS 的规则（TS 已经类型安全）——
      'no-unused-vars': 'off', // 用 TS 版替代
      'no-undef': 'off', // TS 自己检查
      'no-redeclare': 'off',

      // —— 使用 @typescript-eslint 更精准的替代规则 ——
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-redeclare': 'warn',

      // —— 项目常用宽松规则（保留你原来的习惯）——
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'warn', // warn 而不是 error
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          // 允许带说明的 @ts-ignore
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': 'allow-with-description',
          'ts-nocheck': 'allow-with-description',
          'ts-check': false,
        },
      ],

      // —— 可选：更严格但对 VitePress 友好的规则微调 ——
      '@typescript-eslint/consistent-type-imports': 'warn', // 推荐使用 type import
      '@typescript-eslint/no-empty-object-type': 'off', // VitePress 很多 {} 类型定义配置
      '@typescript-eslint/no-empty-interface': 'off', // 同上，常见于 defineConfig
    },
  },

  // 6.1 Markdown-it 插件通过第三方 API，放宽 unsafe 系列规则
  {
    files: ['.vitepress/plugins/**/*.ts', 'docs/.vitepress/plugins/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },

  // 7. 忽略文件
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.vitepress/dist/**',
      '.vitepress/cache/**',
      'tests/**',
      'test-results/**',
      'playwright-report/**',
      '**/*.d.ts',
    ],
  },

  eslintConfigPrettier
)
