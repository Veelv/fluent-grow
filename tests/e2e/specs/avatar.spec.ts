import { test, expect } from '@playwright/test'

test('Avatar: tamanhos e formas', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `import '/src/main.ts';` })
  await page.evaluate(() => {
    const mk = (size: string, shape: string) => {
      const a = document.createElement('fluent-avatar')
      a.setAttribute('size', size)
      a.setAttribute('shape', shape)
      a.setAttribute('initials', 'FG')
      document.body.appendChild(a)
    }
    mk('sm','circle'); mk('xl','square'); mk('md','rounded')
  })
  const elSm = await page.$('fluent-avatar[size="sm"]')
  const elXl = await page.$('fluent-avatar[size="xl"]')
  const elRounded = await page.$('fluent-avatar[shape="rounded"]')
  expect(!!elSm && !!elXl && !!elRounded).toBeTruthy()
  const rCircle = await page.locator('fluent-avatar[size="sm"]').locator('.avatar').evaluate(el => getComputedStyle(el as HTMLElement).borderRadius)
  const rSquare = await page.locator('fluent-avatar[size="xl"]').locator('.avatar').evaluate(el => getComputedStyle(el as HTMLElement).borderRadius)
  expect(rCircle.includes('50%')).toBeTruthy()
  expect(rSquare === '0px').toBeTruthy()
})

test('Avatar: ring e status', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `import '/src/main.ts';` })
  await page.evaluate(() => {
    const a = document.createElement('fluent-avatar')
    a.setAttribute('initials', 'FG')
    a.setAttribute('ring', '')
    a.setAttribute('ring-color', '#ff00ff')
    a.setAttribute('status', 'online')
    document.body.appendChild(a)
  })
  const boxShadow = await page.locator('fluent-avatar').locator('.avatar').evaluate(el => getComputedStyle(el as HTMLElement).boxShadow)
  expect(boxShadow.length > 0).toBeTruthy()
  const dotColor = await page.locator('fluent-avatar').locator('.status-dot').evaluate(el => getComputedStyle(el as HTMLElement).backgroundColor)
  expect(dotColor).toBeTruthy()
})

test('Avatar: srcset/sizes/decoding/loading refletem no <img>', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `import '/src/main.ts';` })
  await page.evaluate(() => {
    const a = document.createElement('fluent-avatar')
    a.setAttribute('initials', 'FG')
    a.setAttribute('src', '/assets/sample-40.png')
    a.setAttribute('srcset', '/assets/sample-40.png 40w, /assets/sample-80.png 80w')
    a.setAttribute('sizes', '(max-width: 600px) 40px, 80px')
    a.setAttribute('loading', 'lazy')
    a.setAttribute('decoding', 'async')
    document.body.appendChild(a)
  })
  const attrs = await page.locator('fluent-avatar').locator('.image').evaluate(el => ({
    src: (el as HTMLImageElement).getAttribute('src'),
    srcset: (el as HTMLImageElement).getAttribute('srcset'),
    sizes: (el as HTMLImageElement).getAttribute('sizes'),
    loading: (el as HTMLImageElement).getAttribute('loading'),
    decoding: (el as HTMLImageElement).getAttribute('decoding')
  }))
  expect(attrs.src?.length).toBeTruthy()
  expect(attrs.srcset?.length).toBeTruthy()
  expect(attrs.sizes?.length).toBeTruthy()
  expect(attrs.loading).toBe('lazy')
  expect(attrs.decoding).toBe('async')
})

test('Avatar: fallback de iniciais quando imagem falha', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `import '/src/main.ts';` })
  await page.evaluate(() => {
    const a = document.createElement('fluent-avatar')
    a.setAttribute('src', 'http://localhost:5176/nao-existe.png')
    a.setAttribute('initials', 'FG')
    document.body.appendChild(a)
  })
  await page.waitForTimeout(100)
  const displayInitials = await page.locator('fluent-avatar').locator('.initials').evaluate(el => getComputedStyle(el as HTMLElement).display !== 'none')
  expect(displayInitials).toBeTruthy()
})
