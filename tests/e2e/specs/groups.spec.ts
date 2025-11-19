import { test, expect } from '@playwright/test'

test('RadioGroup: seleção única por value', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `import '/src/main.ts';` })
  await page.evaluate(() => {
    const g = document.createElement('fluent-radio-group')
    g.setAttribute('name', 'fruit')
    g.innerHTML = '<fluent-radio value="apple">Apple</fluent-radio><fluent-radio value="banana">Banana</fluent-radio>'
    document.body.appendChild(g)
  })
  await page.evaluate(() => document.querySelector('fluent-radio-group')!.setAttribute('value','banana'))
  const checked = await page.$$eval('fluent-radio[checked]', els => els.length)
  expect(checked).toBe(1)
})

test('CheckboxGroup: valores e validade mínima', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `import '/src/main.ts';` })
  await page.evaluate(() => {
    const g = document.createElement('fluent-checkbox-group')
    g.setAttribute('name', 'opts')
    g.setAttribute('min', '2')
    g.innerHTML = '<fluent-checkbox>One</fluent-checkbox><fluent-checkbox>Two</fluent-checkbox><fluent-checkbox>Three</fluent-checkbox>'
    document.body.appendChild(g)
  })
  await page.evaluate(() => {
    const group = document.querySelector('fluent-checkbox-group')!
    const boxes = group.querySelectorAll('fluent-checkbox')
    boxes[0].setAttribute('checked','')
    boxes[1].setAttribute('checked','')
  })
  const valid = await page.$('fluent-checkbox-group[data-valid]')
  expect(!!valid).toBeTruthy()
  const values = await page.$eval('fluent-checkbox-group', el => el.getAttribute('values'))
  expect(values?.includes('One') && values?.includes('Two')).toBeTruthy()
})