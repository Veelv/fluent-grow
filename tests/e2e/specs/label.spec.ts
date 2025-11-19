import { test, expect } from '@playwright/test'

test('Label: clique foca input associado', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `import '/src/main.ts';` })
  await page.evaluate(() => {
    const input = document.createElement('input')
    input.id = 'x1'
    document.body.appendChild(input)
    const lbl = document.createElement('fluent-label')
    lbl.setAttribute('for', 'x1')
    lbl.textContent = 'Nome'
    document.body.appendChild(lbl)
  })
  await page.locator('fluent-label').click()
  const activeId = await page.evaluate(() => (document.activeElement as HTMLElement)?.id)
  expect(activeId).toBe('x1')
})