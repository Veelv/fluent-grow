import { describe, it } from 'node:test'
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { resolve as pathResolve } from 'node:path'

describe('Observed attributes – novo lote', () => {
  it('Modal avançado deve observar open', () => {
    const src = readFileSync(pathResolve('dist/components/modal-advanced.js'), 'utf-8')
    assert.ok(/observedAttributes[^\]]*\["open"\]/.test(src))
  })
  it('Datepicker deve observar open e value', () => {
    const src = readFileSync(pathResolve('dist/components/datepicker.js'), 'utf-8')
    assert.ok(/observedAttributes[\s\S]*"open"/.test(src))
    assert.ok(/observedAttributes[\s\S]*"value"/.test(src))
  })
  it('Autocomplete deve observar open, value, suggestions', () => {
    const src = readFileSync(pathResolve('dist/components/autocomplete.js'), 'utf-8')
    assert.ok(/observedAttributes[\s\S]*"open"/.test(src))
    assert.ok(/observedAttributes[\s\S]*"value"/.test(src))
    assert.ok(/observedAttributes[\s\S]*"suggestions"/.test(src))
  })
  it('Notification deve observar open, variant, text, duration', () => {
    const src = readFileSync(pathResolve('dist/components/notification.js'), 'utf-8')
    assert.ok(/observedAttributes[\s\S]*"open"/.test(src))
    assert.ok(/observedAttributes[\s\S]*"variant"/.test(src))
    assert.ok(/observedAttributes[\s\S]*"text"/.test(src))
    assert.ok(/observedAttributes[\s\S]*"duration"/.test(src))
  })
  it('Stepper deve observar current e total', () => {
    const src = readFileSync(pathResolve('dist/components/stepper.js'), 'utf-8')
    assert.ok(/observedAttributes[\s\S]*"current"/.test(src))
    assert.ok(/observedAttributes[\s\S]*"total"/.test(src))
  })
})
