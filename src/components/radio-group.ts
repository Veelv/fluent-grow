import { FluentComponent } from '../core/fluent-component'

export class FluentRadioGroup extends FluentComponent {
  static tag = 'fluent-radio-group'

  static override get observedAttributes() {
    return ['name', 'value']
  }

  override connectedCallback() {
    super.connectedCallback()
    this.addEventListener('click', (e) => {
      const t = e.target as HTMLElement
      if (t.tagName.toLowerCase() === 'fluent-radio') {
        const val = t.getAttribute('value') || ''
        this.setAttribute('value', val)
        this.sync()
      }
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
    this.sync()
  }

  private sync() {
    const name = this.getAttribute('name') || ''
    const value = this.getAttribute('value') || ''
    const items = Array.from(this.querySelectorAll('fluent-radio')) as HTMLElement[]
    items.forEach(el => {
      if (name) el.setAttribute('name', name)
      const v = el.getAttribute('value') || ''
      if (v === value) el.setAttribute('checked', '')
      else el.removeAttribute('checked')
    })
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentRadioGroup.tag, FluentRadioGroup)
}