import { test, expect } from '@playwright/test'

test('Modal: abre com atributo open e fecha ao clicar no backdrop', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `import '/src/main.ts';` })
  await page.evaluate(() => {
    const m = document.createElement('fluent-modal')
    m.setAttribute('open', '')
    m.setAttribute('backdrop', 'dim')
    document.body.appendChild(m)
  })
  await page.locator('fluent-modal').locator('.modal-backdrop').waitFor()
  const visibleBefore = await page.locator('fluent-modal').locator('.fluent-modal').evaluate(el => el.classList.contains('open'))
  expect(visibleBefore).toBeTruthy()
  await page.evaluate(() => document.querySelector('fluent-modal')!.removeAttribute('open'))
  await page.waitForTimeout(100)
  const visibleAfter = await page.locator('fluent-modal').locator('.fluent-modal').evaluate(el => el.classList.contains('open'))
  expect(visibleAfter).toBeFalsy()
})
