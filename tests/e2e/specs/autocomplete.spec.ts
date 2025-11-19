import { test, expect } from '@playwright/test'

test('Autocomplete: combobox/listbox, filtro e Enter', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `import '/src/main.ts';` })
  await page.evaluate(() => {
    const a = document.createElement('fluent-autocomplete')
    a.setAttribute('suggestions', 'Apple,Banana,Blueberry')
    a.setAttribute('open', '')
    document.body.appendChild(a)
  })
  await page.locator('fluent-autocomplete').locator('[role="listbox"]').waitFor()
  await page.locator('fluent-autocomplete').locator('.field').type('Blue')
  await page.locator('fluent-autocomplete').locator('.item').first().click()
  await page.waitForFunction(() => {
    const el = document.querySelector('fluent-autocomplete')!.shadowRoot!.querySelector('.field') as HTMLInputElement
    return el.value === 'Blueberry'
  }, undefined, { timeout: 2000 })
  const val = await page.locator('fluent-autocomplete').locator('.field').evaluate(el => (el as HTMLInputElement).value)
  expect(val).toBe('Blueberry')
})