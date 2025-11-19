import { test, expect } from '@playwright/test'

test('Stepper: aria-current e teclado', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `import '/src/main.ts';` })
  await page.evaluate(() => {
    const s = document.createElement('fluent-stepper')
    s.setAttribute('current', '2')
    s.setAttribute('total', '5')
    document.body.appendChild(s)
  })
  await page.locator('fluent-stepper').locator('[role="list"]').waitFor()
  const ariaBefore = await page.locator('fluent-stepper').locator('.step[aria-current="step"]').count()
  expect(ariaBefore).toBe(1)
  await page.locator('fluent-stepper').locator('[role="list"]').press('ArrowRight')
  const ariaAfter = await page.locator('fluent-stepper').locator('.step[aria-current="step"]').count()
  expect(ariaAfter).toBe(1)
})