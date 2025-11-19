import { test, expect } from '@playwright/test'

test('Form: valida campos e emite evento', async ({ page }) => {
  await page.goto('http://localhost:5176/')
  await page.addScriptTag({ type: 'module', content: `import '/src/main.ts';` })
  await page.evaluate(() => {
    const f = document.createElement('fluent-form')
    const inp = document.createElement('fluent-input')
    const ta = document.createElement('fluent-textarea')
    const cb = document.createElement('fluent-checkbox')
    ;(inp.shadowRoot as any).querySelector('.fluent-input')?.setAttribute('name','n')
    ;(ta.shadowRoot as any).querySelector('.ta')?.setAttribute('name','m')
    ;(ta.shadowRoot as any).querySelector('.ta')?.setAttribute('data-required','true')
    ;(cb.shadowRoot as any).querySelector('input')?.setAttribute('name','agree')
    ;(cb.shadowRoot as any).querySelector('input')?.setAttribute('required','')
    f.appendChild(inp)
    f.appendChild(ta)
    f.appendChild(cb)
    document.body.appendChild(f)
    f.addEventListener('fluent-submit', (e: any) => { (window as any).submitted = e.detail.valid })
    const btn = document.createElement('button')
    btn.type = 'submit'
    ;(f.shadowRoot as any).querySelector('.frm')?.appendChild(btn)
  })
  await page.locator('fluent-form').locator('.frm').waitFor()
  await page.locator('fluent-form').locator('.frm').press('Enter')
  await page.waitForFunction(() => (window as any).submitted !== undefined)
  const submittedInvalid = await page.evaluate(() => (window as any).submitted)
  expect(submittedInvalid).toBe(false)
  await page.evaluate(() => {
    const ta = document.querySelector('fluent-form')!.querySelector('fluent-textarea')!
    const el = ta.shadowRoot!.querySelector('.ta') as HTMLTextAreaElement
    el.value = 'ok'
    const cb = document.querySelector('fluent-form')!.querySelector('fluent-checkbox')!
    const elc = cb.shadowRoot!.querySelector('input') as HTMLInputElement
    elc.checked = true
  })
  await page.locator('fluent-form').locator('.frm').press('Enter')
  await page.waitForFunction(() => (window as any).submitted !== undefined)
  const submittedValid = await page.evaluate(() => (window as any).submitted)
  expect(submittedValid).toBe(true)
})
