import { test, expect } from '@playwright/test'

test('carrega framework e expõe VERSION', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `
    import * as FG from '/src/main.ts';
    window.FG = FG;
  ` })
  await page.waitForFunction(() => !!(window as any).FG, undefined, { timeout: 5000 })
  const version = await page.evaluate(() => (window as any).FG?.VERSION)
  expect(typeof version).toBe('string')
})

test('aplica tokens e cria stylesheet', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `
    import * as FG from '/src/main.ts';
    const el = document.createElement('div');
    document.body.appendChild(el);
    FG.applyTokens({ colors: { brand: { base: 'rebeccapurple' } } }, el);
    window.result = el.getAttribute('style');
  ` })
  await page.waitForFunction(() => !!(window as any).result, undefined, { timeout: 5000 })
  const style = await page.evaluate(() => (window as any).result)
  expect(style).toContain('--fluent-colors-brand')
})

test('registry registra e lista componentes', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `
    import { registerComponent, getRegisteredComponents } from '/src/core/component-registry.ts';
    await registerComponent({ tag: 'fluent-demo', element: class extends HTMLElement {} });
    window.tags = getRegisteredComponents();
  ` })
  const tags = await page.evaluate(() => (window as any).tags)
  expect(Array.isArray(tags)).toBeTruthy()
  expect(tags.includes('fluent-demo')).toBeTruthy()
})

test('supports: container queries e view transitions flags', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `
    import * as FG from '/src/main.ts';
    window.supports = {
      cq: FG.supportsContainerQueries(),
      vt: FG.supportsViewTransitions(),
    };
  ` })
  await page.waitForFunction(() => !!(window as any).supports, undefined, { timeout: 5000 })
  const supports = await page.evaluate(() => (window as any).supports)
  expect(typeof supports.cq).toBe('boolean')
  expect(typeof supports.vt).toBe('boolean')
})
