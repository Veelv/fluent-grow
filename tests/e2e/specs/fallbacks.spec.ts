import { test, expect } from '@playwright/test'

test('css-fallbacks: gera fallbacks para paint/anchor/view-transitions', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  const css = await page.evaluate(async () => {
    const FG = await import('/src/main.ts');
    return FG.withFallbacks({
      background: 'paint(ripple)',
      position: 'anchor(top)',
      'view-transition-name': 'card'
    });
  })
  expect(typeof css).toBe('object')
  expect(Object.keys(css).length).toBeGreaterThan(0)
  expect(css.background || css['background--native'] || css.transition).toBeTruthy()
})