import { defineConfig, configDefaults } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'tests/e2e/**', 'tests/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '.vitepress/cache/', '**/*.spec.ts', '**/*.test.ts'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.vitepress'),
      '@components': resolve(__dirname, '.vitepress/theme/components'),
      '@plugins': resolve(__dirname, '.vitepress/plugins'),
      '@data': resolve(__dirname, '.vitepress/data'),
    },
  },
})
