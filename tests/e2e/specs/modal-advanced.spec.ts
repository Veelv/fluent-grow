import { test, expect } from '@playwright/test'

test('Modal avançado: ARIA e focus trap/ESC', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `import '/src/main.ts';` })
  await page.evaluate(() => {
    const m = document.createElement('fluent-modal-advanced')
    m.setAttribute('open', '')
    m.innerHTML = `<button slot="footer">OK</button>`
    document.body.appendChild(m)
  })
  await page.locator('fluent-modal-advanced').locator('[role="dialog"]').waitFor()
  const ariaModal = await page.locator('fluent-modal-advanced').locator('[role="dialog"]').evaluate(el => (el as HTMLElement).getAttribute('aria-modal'))
  expect(ariaModal).toBe('true')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Escape')
  const open = await page.$('fluent-modal-advanced[open]')
  expect(!!open).toBeFalsy()
})