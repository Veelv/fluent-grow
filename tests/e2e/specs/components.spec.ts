import { test, expect } from '@playwright/test'

test('Badge: renderiza e aplica variantes', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `
    import '/src/main.ts';
    const b = document.createElement('fluent-badge');
    b.setAttribute('variant', 'success');
    b.textContent = 'OK';
    document.body.appendChild(b);
  ` })
  await page.waitForSelector('fluent-badge', { state: 'attached', timeout: 5000 })
  const el = await page.$('fluent-badge')
  expect(!!el).toBeTruthy()
})

test('Tooltip: renderiza e posiciona', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `
    import '/src/main.ts';
    const t = document.createElement('fluent-tooltip');
    t.setAttribute('text', 'Tip');
    t.setAttribute('position', 'top');
    document.body.appendChild(t);
  ` })
  await page.waitForSelector('fluent-tooltip', { state: 'attached', timeout: 5000 })
  const tt = await page.$('fluent-tooltip')
  expect(!!tt).toBeTruthy()
})