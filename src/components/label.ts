import { FluentComponent } from '../core/fluent-component'

export class FluentLabel extends FluentComponent {
  static tag = 'fluent-label'

  static override get observedAttributes() {
    return ['for']
  }

  override connectedCallback() {
    super.connectedCallback()
    this.shadowRootRef.addEventListener('click', () => {
      const id = this.getAttribute('for') || ''
      const el = document.getElementById(id) as HTMLElement | null
      el?.focus()
    })
  }

  render() {
    this.shadowRootRef.innerHTML = `<label class="lbl" part="label"><slot></slot></label>`
  }

  constructor() {
    super()
    this.recipe = {
      base: { display: 'inline-block' },
      selectors: { '.lbl': { fontWeight: '600' } }
    }
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentLabel.tag, FluentLabel)
}
