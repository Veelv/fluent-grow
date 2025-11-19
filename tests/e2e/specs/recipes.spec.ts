import { test, expect } from '@playwright/test'

test('Recipe: compila stylesheet e aplica em adoptedStyleSheets', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `
    import { createRecipe } from '/src/styles/recipes/recipe.ts';
    const recipe = createRecipe({ base: { color: 'oklch(0.4 0.1 200)' } });
    const { stylesheet } = recipe.compile({}, ':root');
    if ('adoptedStyleSheets' in document) {
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, stylesheet];
    } else {
      const style = document.createElement('style');
      document.head.appendChild(style);
      style.textContent = ':root { color: red; }'
    }
    window.sheetRules = stylesheet.cssRules.length;
  ` })
  const hasAdopted = await page.evaluate(() => 'adoptedStyleSheets' in document)
  if (hasAdopted) {
    const count = await page.evaluate(() => document.adoptedStyleSheets.length)
    expect(count).toBeGreaterThan(0)
  } else {
    const styleExists = await page.$('style')
    expect(!!styleExists).toBeTruthy()
  }
})
