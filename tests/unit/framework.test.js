import { describe, it } from 'node:test'
import assert from 'node:assert'
import { FluentFramework } from '../../dist/core/framework.js'

describe('FluentFramework – inicialização e compatibilidade', () => {
  it('deve inicializar sem erro em ambiente Node', async () => {
    const fw = new FluentFramework({ autoRegisterComponents: false })
    await fw.initialise()
    const info = fw.getCompatibilityInfo()
    assert.ok(info.version.version)
    assert.ok(Array.isArray(info.loadedPolyfills))
  })

  it('deve expor métricas e compatibilidade', async () => {
    const fw = new FluentFramework({ autoRegisterComponents: false })
    await fw.initialise()
    const report = fw.getCompatibilityInfo()
    assert.ok(report.support)
    const vm = fw.getCompatibilityInfo().version
    assert.strictEqual(typeof vm.version, 'string')
  })
})