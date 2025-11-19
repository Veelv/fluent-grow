import { test, expect } from '@playwright/test'

test('Cria e anexa Accordion, Dropdown, Menu, Breadcrumb, Pagination, Avatar, Chip, Spinner, Switch, Slider', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `import '/src/main.ts';` })
  const create = async (tag: string, attrs: Record<string, string>) => {
    await page.evaluate(([t, a]) => {
      const el = document.createElement(t as any)
      Object.entries(a as any).forEach(([k, v]) => el.setAttribute(k, v as any))
      document.body.appendChild(el)
    }, [tag, attrs])
    await page.waitForSelector(tag, { state: 'attached', timeout: 5000 })
  }
  await create('fluent-accordion', { open: '' })
  await create('fluent-dropdown', { open: '' })
  await create('fluent-menu', { })
  await create('fluent-breadcrumb', { })
  await create('fluent-pagination', { page: '1', pages: '5' })
  await create('fluent-avatar', { src: '', alt: 'A' })
  await create('fluent-chip', { variant: 'primary' })
  await create('fluent-spinner', { })
  await create('fluent-switch', { checked: '' })
  await create('fluent-slider', { value: '30', min: '0', max: '100' })
  const selectors = ['fluent-accordion','fluent-dropdown','fluent-menu','fluent-breadcrumb','fluent-pagination','fluent-avatar','fluent-chip','fluent-spinner','fluent-switch','fluent-slider']
  for (const sel of selectors) {
    const el = await page.$(sel)
    expect(!!el).toBeTruthy()
  }
})