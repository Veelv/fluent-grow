import { describe, it } from 'node:test'
import assert from 'node:assert'
import { FrameworkAdapter } from '../../dist/integrations/framework-adapter.js'
import { FluentFramework } from '../../dist/core/framework.js'

describe('FrameworkAdapter – modos e tokens', () => {
  it('deve configurar modo minimal sem inicializar framework completo', async () => {
    const fw = new FluentFramework({ autoRegisterComponents: false })
    const adapter = new FrameworkAdapter(fw, { integration: { name: 'svelte' }, mode: 'minimal', conflictResolution: 'fluent-first' })
    await adapter.setup()
    const info = fw.getCompatibilityInfo()
    assert.ok(info.version.version)
  })
})