import { test, expect } from '@playwright/test'

test.describe('文档导航冒烟', () => {
  test('首页的快速开始按钮可用', async ({ page }) => {
    await page.goto('/')

    await page.waitForLoadState('networkidle')
    await expect(page.locator('.VPHero')).toBeVisible()

    const quickstartCta = page.getByRole('link', { name: '快速开始' }).first()
    await expect(quickstartCta).toBeVisible()

    await quickstartCta.click()
    await expect(page).toHaveURL(/getting-started\/installation/)
    await expect(page.getByRole('heading', { level: 1, name: '安装 Locust' })).toBeVisible()
  })
})
