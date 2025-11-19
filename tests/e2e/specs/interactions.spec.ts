import { test, expect } from '@playwright/test'

test('Switch: alterna checked ao clicar', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `import '/src/main.ts';` })
  await page.evaluate(() => {
    const s = document.createElement('fluent-switch')
    document.body.appendChild(s)
  })
  await page.waitForSelector('fluent-switch', { state: 'attached', timeout: 5000 })
  const initiallyChecked = await page.$('fluent-switch[checked]')
  expect(!!initiallyChecked).toBeFalsy()
  await page.locator('fluent-switch').locator('.fluent-switch').click()
  const checked = await page.$('fluent-switch[checked]')
  expect(!!checked).toBeTruthy()
})

test('Dropdown: abre/fecha via atributo open', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `import '/src/main.ts';` })
  await page.evaluate(() => {
    const d = document.createElement('fluent-dropdown')
    d.innerHTML = '<button class="trigger">Abrir</button><div class="menu">Item</div>'
    document.body.appendChild(d)
  })
  await page.evaluate(() => document.querySelector('fluent-dropdown')!.setAttribute('open',''))
  const opened = await page.$('fluent-dropdown[open]')
  expect(!!opened).toBeTruthy()
  await page.evaluate(() => document.querySelector('fluent-dropdown')!.removeAttribute('open'))
  const closed = await page.$('fluent-dropdown[open]')
  expect(!!closed).toBeFalsy()
})

test('Tabs: alterna painel ao clicar na tab', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `import '/src/main.ts';` })
  await page.evaluate(() => {
    const t = document.createElement('fluent-tabs')
    t.innerHTML = `
      <span slot="tab-0">A</span>
      <span slot="tab-1">B</span>
      <div slot="panel-0">Painel A</div>
      <div slot="panel-1">Painel B</div>
    `
    document.body.appendChild(t)
  })
  await page.evaluate(() => document.querySelector('fluent-tabs')!.setAttribute('selected','1'))
  const panelShownCount = await page.locator('fluent-tabs').locator('.tabpanel').nth(1).evaluate(el => getComputedStyle(el).display !== 'none')
  expect(panelShownCount).toBeTruthy()
})

test('Slider: atualiza posição ao alterar valor', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `import '/src/main.ts';` })
  await page.evaluate(() => {
    const sl = document.createElement('fluent-slider')
    sl.setAttribute('value', '10')
    sl.setAttribute('min', '0')
    sl.setAttribute('max', '100')
    document.body.appendChild(sl)
  })
  await page.locator('fluent-slider').locator('.thumb').waitFor()
  const before = await page.locator('fluent-slider').locator('.thumb').evaluate(el => getComputedStyle(el as HTMLElement).left)
  await page.evaluate(() => {
    const sl = document.querySelector('fluent-slider')!
    sl.setAttribute('value', '90')
  })
  await page.waitForTimeout(50)
  const after = await page.locator('fluent-slider').locator('.thumb').evaluate(el => getComputedStyle(el as HTMLElement).left)
  expect(before !== after).toBeTruthy()
})

test('Toast: visibilidade controlada pelo atributo open', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `import '/src/main.ts';` })
  await page.evaluate(() => {
    const t = document.createElement('fluent-toast')
    t.setAttribute('text', 'Olá')
    document.body.appendChild(t)
  })
  await page.waitForSelector('fluent-toast', { state: 'attached', timeout: 5000 })
  const visibleBefore = await page.locator('fluent-toast').locator('.fluent-toast').evaluate(el => getComputedStyle(el as HTMLElement).display !== 'none')
  expect(visibleBefore).toBeFalsy()
  await page.evaluate(() => document.querySelector('fluent-toast')!.setAttribute('open', ''))
  const visibleAfter = await page.locator('fluent-toast').locator('.fluent-toast').evaluate(el => getComputedStyle(el as HTMLElement).display !== 'none')
  expect(visibleAfter).toBeTruthy()
})
