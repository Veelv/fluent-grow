import { FluentComponent } from '../core/fluent-component'

export class FluentCheckboxGroup extends FluentComponent {
  static tag = 'fluent-checkbox-group'

  static override get observedAttributes() {
    return ['name', 'min', 'values']
  }

  override connectedCallback() {
    super.connectedCallback()
    this.addEventListener('click', (e) => {
      const t = e.target as HTMLElement
      if (t.tagName.toLowerCase() === 'fluent-checkbox') this.update()
    })
  }

  render() {
    this.shadowRootRef.innerHTML = `<div class="group"><slot></slot></div>`
  }

  constructor() {
    super()
    this.recipe = { base: { display: 'grid', gap: '0.5rem' } }
  }

  override attributeChangedCallback(): void {
    super.attributeChangedCallback()
    this.update()
  }

  private update() {
    const name = this.getAttribute('name') || ''
    const min = Number(this.getAttribute('min') || '0')
    const items = Array.from(this.querySelectorAll('fluent-checkbox')) as HTMLElement[]
    const checked = items.filter(el => el.hasAttribute('checked'))
    if (name) items.forEach(el => el.setAttribute('name', name))
    const values = checked.map(el => (el.textContent || '').trim())
    this.setAttribute('values', values.join(','))
    const valid = checked.length >= min
    this.toggleAttribute('data-valid', valid)
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentCheckboxGroup.tag, FluentCheckboxGroup)
}