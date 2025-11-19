import { test, expect } from '@playwright/test'

test('Dropdown: role menu e fecha ao clicar fora', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `import '/src/main.ts';` })
  await page.evaluate(() => {
    const d = document.createElement('fluent-dropdown')
    d.innerHTML = '<button class="trigger">Abrir</button><div class="menu"><div role="menuitem">A</div></div>'
    document.body.appendChild(d)
  })
  await page.locator('fluent-dropdown').locator('.trigger').first().click()
  const open = await page.$('fluent-dropdown[open]')
  expect(!!open).toBeTruthy()
  await page.click('body', { position: { x: 5, y: 5 } })
  const closed = await page.$('fluent-dropdown[open]')
  expect(!!closed).toBeFalsy()
})
