import { describe, it } from 'node:test'
import assert from 'node:assert'
import { mergeTokenGroups, applyTokens } from '../../dist/core/token-manager.js'

describe('Token Manager – merge e aplicação', () => {
  it('deve mesclar grupos de tokens profundamente', () => {
    const base = { colors: { primary: { base: '#000' } }, spacing: { sm: { base: '8px' } } }
    const partial = { colors: { primary: { base: '#111' }, accent: { base: '#f0f' } } }
    const merged = mergeTokenGroups(base, partial)
    assert.strictEqual(merged.colors.primary.base, '#111')
    assert.strictEqual(merged.colors.accent.base, '#f0f')
    assert.strictEqual(merged.spacing.sm.base, '8px')
  })

  it('deve aplicar tokens em um elemento root customizado', () => {
    const tokens = { spacing: { md: { base: '16px' } }, colors: { bg: { base: 'rgb(0 0 0)' } } }
    const root = { style: { setProperty: (k, v) => { (root.style._ = root.style._ || []).push([k, v]) } } }
    applyTokens(tokens, root)
    assert.ok(Array.isArray(root.style._))
    const names = root.style._.map(x => x[0])
    assert.ok(names.includes('--fluent-spacing-md-base'))
    assert.ok(names.includes('--fluent-colors-bg-base'))
  })
})