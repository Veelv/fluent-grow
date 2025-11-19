import { test, expect } from '@playwright/test'

test('Datepicker: ARIA roles e navegação por teclado', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `import '/src/main.ts';` })
  await page.evaluate(() => {
    const d = document.createElement('fluent-datepicker')
    d.setAttribute('open', '')
    document.body.appendChild(d)
  })
  await page.locator('fluent-datepicker').locator('[role="grid"]').waitFor()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  const val = await page.locator('fluent-datepicker').locator('.field').evaluate(el => (el as HTMLInputElement).value)
  expect(val.length > 0).toBeTruthy()
})