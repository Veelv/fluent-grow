import { FluentComponent } from '../core/fluent-component'

export class FluentFormMessage extends FluentComponent {
  static tag = 'fluent-form-message'

  static override get observedAttributes() {
    return ['for', 'type']
  }

  render() {
    this.shadowRootRef.innerHTML = `<div class="msg" part="message" role="status"><slot></slot></div>`
  }

  constructor() {
    super()
    this.recipe = { base: { display: 'block' }, selectors: { '.msg': { color: 'var(--fluent-color-danger-500)', 'font-size': '0.875rem' } } }
  }

  override attributeChangedCallback(): void {
    super.attributeChangedCallback()
    const id = this.getAttribute('for') || ''
    const el = document.getElementById(id) as HTMLElement | null
    const invalid = el?.classList.contains('invalid')
    this.toggleAttribute('hidden', !invalid)
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentFormMessage.tag, FluentFormMessage)
}
