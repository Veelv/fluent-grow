import { describe, it } from 'node:test'
import assert from 'node:assert'
import { VersionManager } from '../../dist/core/version-manager.js'
import { PolyfillManager } from '../../dist/core/polyfill-manager.js'
import { FluentFramework } from '../../dist/core/framework.js'

describe('Version/Polyfill – relatório e status', () => {
  it('deve emitir relatório de compatibilidade', () => {
    const vm = VersionManager.getInstance()
    const report = vm.getCompatibilityReport()
    assert.ok(typeof report === 'string')
  })

  it('deve listar polyfills carregados (vazio em Node)', () => {
    const pm = new PolyfillManager()
    const loaded = pm.getLoadedPolyfills()
    assert.ok(Array.isArray(loaded))
    assert.strictEqual(loaded.length, 0)
  })

  it('deve permitir desabilitar polyfills via config', async () => {
    const fw = new FluentFramework({ disablePolyfills: true, autoRegisterComponents: false })
    await fw.initialise()
    const info = fw.getCompatibilityInfo()
    assert.deepStrictEqual(info.loadedPolyfills, [])
  })
})