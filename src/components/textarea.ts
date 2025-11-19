import { FluentComponent } from '../core/fluent-component'

export class FluentTextarea extends FluentComponent {
  static tag = 'fluent-textarea'

  static override get observedAttributes() {
    return ['placeholder', 'disabled', 'name', 'rows']
  }

  render() {
    const placeholder = this.getAttribute('placeholder') || ''
    const disabled = this.hasAttribute('disabled') ? 'disabled' : ''
    const rows = this.getAttribute('rows') || '3'
    const name = this.getAttribute('name') || ''
    this.shadowRootRef.innerHTML = `<textarea class="ta" part="textarea" placeholder="${placeholder}" rows="${rows}" name="${name}" ${disabled}></textarea>`
  }

  constructor() {
    super()
    this.recipe = {
      base: { display: 'inline-block', width: '100%' },
      selectors: { '.ta': { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--fluent-color-neutral-300)', 'border-radius': '0.5rem' } }
    }
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentTextarea.tag, FluentTextarea)
}
