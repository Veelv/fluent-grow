import { test, expect } from '@playwright/test'

test('Table: sortable por coluna', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `import '/src/main.ts';` })
  await page.evaluate(() => {
    const tbl = document.createElement('fluent-table')
    tbl.setAttribute('sortable', '')
    const thead = document.createElement('span')
    thead.setAttribute('slot', 'thead')
    thead.textContent = 'Nome'
    const tbody1 = document.createElement('div')
    tbody1.setAttribute('slot', 'tbody')
    tbody1.innerHTML = '<td>Ana</td>'
    const tbody2 = document.createElement('div')
    tbody2.setAttribute('slot', 'tbody')
    tbody2.innerHTML = '<td>Bruno</td>'
    tbl.appendChild(thead)
    tbl.appendChild(tbody1)
    tbl.appendChild(tbody2)
    document.body.appendChild(tbl)
  })
  await page.locator('fluent-table').locator('thead th').first().waitFor()
  await page.locator('fluent-table').locator('thead th').first().click()
  const first = await page.locator('fluent-table').locator('tbody').locator('div').first().evaluate(el => el.textContent?.trim())
  expect(first).toBe('Ana')
})
