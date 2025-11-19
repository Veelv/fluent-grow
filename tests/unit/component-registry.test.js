import { describe, it } from 'node:test'
import assert from 'node:assert'
import { registerComponent, resolveComponent, hasComponent, getRegisteredComponents } from '../../dist/core/component-registry.js'

describe('Component Registry – registro e resolução', () => {
  it('deve registrar e resolver um componente customizado', async () => {
    const tag = 'fluent-test'
    await registerComponent({ tag, element: class {} })
    assert.ok(hasComponent(tag))
    const ctor = await resolveComponent(tag)
    assert.ok(typeof ctor === 'function')
    const list = getRegisteredComponents()
    assert.ok(list.includes(tag))
  })
})