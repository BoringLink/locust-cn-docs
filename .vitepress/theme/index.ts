import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import '@unocss/reset/tailwind.css'
import 'uno.css'
import './styles/vars.css'
import './styles/custom.css'

// 导入自定义组件
import TermTooltip from './components/TermTooltip.vue'
import ResponsiveTable from './components/ResponsiveTable.vue'
import NextReading from './components/NextReading.vue'
import EnhancedCodeBlock from './components/EnhancedCodeBlock.vue'
import LocustNavTitle from './components/LocustNavTitle.vue'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      'nav-bar-title': () => h(LocustNavTitle),
    })
  },
  enhanceApp({ app }) {
    // 注册全局组件
    app.component('TermTooltip', TermTooltip)
    app.component('ResponsiveTable', ResponsiveTable)
    app.component('NextReading', NextReading)
    app.component('EnhancedCodeBlock', EnhancedCodeBlock)
  },
} satisfies Theme
