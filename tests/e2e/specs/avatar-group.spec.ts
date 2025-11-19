import { test, expect } from '@playwright/test'

test('AvatarGroup: aplica max e exibe +N', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `import '/src/main.ts';` })
  await page.evaluate(() => {
    const g = document.createElement('fluent-avatar-group')
    g.setAttribute('max', '3')
    g.setAttribute('overlap', '10px')
    for (let i = 0; i < 5; i++) {
      const a = document.createElement('fluent-avatar')
      a.setAttribute('initials', 'A' + i)
      g.appendChild(a)
    }
    document.body.appendChild(g)
  })
  await page.waitForSelector('fluent-avatar-group', { state: 'attached', timeout: 5000 })
  await page.locator('fluent-avatar-group').locator('.overflow').waitFor()
  const visibleCount = await page.locator('fluent-avatar-group').evaluate(host => Array.from(host.querySelectorAll('fluent-avatar')).filter(el => !el.hasAttribute('hidden')).length)
  expect(visibleCount).toBe(3)
  const overflowText = await page.locator('fluent-avatar-group').locator('.overflow').evaluate(el => (el as HTMLElement).textContent)
  expect(overflowText).toBe('+2')
})

test('AvatarGroup: propaga size e ring', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `import '/src/main.ts';` })
  await page.evaluate(() => {
    const g = document.createElement('fluent-avatar-group')
    g.setAttribute('size', 'lg')
    g.setAttribute('ring', '')
    g.setAttribute('ring-color', '#00f')
    for (let i = 0; i < 2; i++) {
      const a = document.createElement('fluent-avatar')
      a.setAttribute('initials', 'B' + i)
      g.appendChild(a)
    }
    document.body.appendChild(g)
  })
  const sizeAttr = await page.locator('fluent-avatar-group').locator('fluent-avatar').first().evaluate(el => el.getAttribute('size'))
  expect(sizeAttr).toBe('lg')
  const ringAttr = await page.locator('fluent-avatar-group').locator('fluent-avatar').first().evaluate(el => el.hasAttribute('ring'))
  expect(ringAttr).toBeTruthy()
})
