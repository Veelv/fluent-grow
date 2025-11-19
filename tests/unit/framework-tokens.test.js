import { describe, it } from 'node:test'
import assert from 'node:assert'
import { FluentFramework } from '../../dist/core/framework.js'

describe('FluentFramework – APIs de tokens', () => {
  it('getTokens deve retornar snapshot dos tokens atuais', async () => {
    const fw = new FluentFramework({ autoRegisterComponents: false })
    await fw.initialise()
    const t = fw.getTokens()
    assert.ok(typeof t === 'object')
  })

  it('setTokens deve atualizar tokens em runtime', async () => {
    const fw = new FluentFramework({ autoRegisterComponents: false })
    await fw.initialise()
    fw.setTokens({ spacing: { md: { base: '16px' } } })
    const t = fw.getTokens()
    assert.strictEqual(t.spacing.md.base, '16px')
  })
})