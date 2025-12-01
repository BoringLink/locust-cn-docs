import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],
  theme: {
    colors: {
      // Locust 官方绿色主题
      primary: '#35563a',
      'primary-light': '#4a7350',
      'primary-dark': '#2a4430',
    },
    fontFamily: {
      // 中文字体
      sans: [
        'HarmonyOS Sans',
        'MiSans',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'sans-serif',
      ],
      // 代码字体
      mono: [
        'Geist Mono',
        'JetBrains Mono',
        'Fira Code',
        'Consolas',
        'Monaco',
        'monospace',
      ],
    },
  },
  shortcuts: {
    'btn-primary': 'bg-primary text-white px-4 py-2 rounded hover:bg-primary-light transition-colors',
    'card': 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4',
  },
})
