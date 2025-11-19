import { test, expect } from '@playwright/test'

test('ThemeManager: aplica tema escopado e define data-theme', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `
    import { ThemeManager } from '/src/core/theme-manager.ts';
    const tm = new ThemeManager();
    tm.register({ name: 'light', tokens: { colors: { bg: { base: 'rgb(255 255 255)' } } } });
    const el = document.createElement('div');
    document.body.appendChild(el);
    tm.applyScoped('light', el);
    window.themeEl = el;
  ` })
  await page.waitForFunction(() => !!(window as any).themeEl, undefined, { timeout: 5000 })
  const dataTheme = await page.evaluate(() => (window as any).themeEl.getAttribute('data-theme'))
  expect(dataTheme).toBe('light')
  const style = await page.evaluate(() => (window as any).themeEl.getAttribute('style'))
  expect(style).toContain('--fluent-colors-bg-base')
})
