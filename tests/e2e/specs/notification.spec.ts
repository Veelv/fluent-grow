import { test, expect } from '@playwright/test'

test('Notification: status/alert e fila', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `import '/src/main.ts';` })
  await page.evaluate(() => {
    const n = document.createElement('fluent-notification')
    document.body.appendChild(n)
    ;(n as any).push('Primeira', 'status', 500)
    ;(n as any).push('Segunda', 'alert', 500)
  })
  await page.waitForSelector('fluent-notification[open]', { timeout: 2000 })
  const roleFirst = await page.locator('fluent-notification').locator('.notification').evaluate(el => (el as HTMLElement).getAttribute('role'))
  expect(roleFirst).toBe('status')
  await page.waitForTimeout(600)
  const roleSecond = await page.locator('fluent-notification').locator('.notification').evaluate(el => (el as HTMLElement).getAttribute('role'))
  expect(roleSecond).toBe('alert')
})