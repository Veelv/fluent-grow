import { describe, it } from 'node:test'
import assert from 'node:assert'
import { applyStyles, createStyleSheet, isPropertySupported } from '../../dist/utils/css-engine.js'

describe('CSS Engine – aplicação e stylesheet', () => {
  it('deve aplicar estilos em elemento', () => {
    const el = { style: { setProperty: (k, v) => { (el.style._ = el.style._ || []).push([k, v]) } } }
    applyStyles(el, { color: 'red', 'font-size': '14px' })
    assert.strictEqual(el.style._.length, 2)
  })

  it('deve criar um stylesheet mesmo sem CSSStyleSheet', () => {
    const sheet = createStyleSheet({ ':root': { color: 'black' } })
    assert.ok(sheet)
  })

  it('deve verificar suporte de propriedade com guarda', () => {
    const supported = isPropertySupported('display', 'block')
    assert.strictEqual(typeof supported, 'boolean')
  })
})