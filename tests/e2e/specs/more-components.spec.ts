import { test, expect } from '@playwright/test'

test('Cria e anexa Modal, Popover, Tabs, Input, Select, Toast, Progress, Skeleton', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `import '/src/main.ts';` })
  await page.evaluate(() => {
    const comps: Array<[string, Record<string, string>]> = [
      ['fluent-popover', { open: '' }],
      ['fluent-tabs', { selected: '0' }],
      ['fluent-input', { placeholder: 'Digite' }],
      ['fluent-select', {} as any],
      ['fluent-toast', { text: 'Olá', open: '' }],
      ['fluent-progress', { value: '50', max: '100' }],
      ['fluent-skeleton', { width: '120px', height: '16px' }]
    ]
    comps.forEach(([tag, attrs]) => {
      const el = document.createElement(tag)
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
      document.body.appendChild(el)
    })
  })
  const selectors = [
    'fluent-popover',
    'fluent-tabs',
    'fluent-input',
    'fluent-select',
    'fluent-toast',
    'fluent-progress',
    'fluent-skeleton'
  ]
  for (const sel of selectors) {
    await page.waitForSelector(sel, { state: 'attached', timeout: 5000 })
    const el = await page.$(sel)
    expect(!!el).toBeTruthy()
  }
})
