import { FluentComponent } from '../core/fluent-component'

export class FluentForm extends FluentComponent {
  static tag = 'fluent-form'

  static override get observedAttributes() {
    return ['novalidate']
  }

  override connectedCallback() {
    super.connectedCallback()
    this.shadowRootRef.addEventListener('submit', (e) => {
      e.preventDefault()
      const valid = this.validate()
      const ev = new CustomEvent('fluent-submit', { detail: { valid }, bubbles: true })
      this.dispatchEvent(ev)
    })
  }

  render() {
    const novalidate = this.hasAttribute('novalidate')
    this.shadowRootRef.innerHTML = `<form class="frm" part="form" ${novalidate ? 'novalidate' : ''}><slot></slot></form>`
  }

  constructor() {
    super()
    this.recipe = { base: { display: 'block' }, selectors: { '.frm': { display: 'grid', gap: '0.75rem' } } }
  }

  private validate(): boolean {
    const host = this.shadowRootRef.querySelector('.frm') as HTMLFormElement | null
    if (!host) return true
    let ok = true
    const inputs = host.querySelectorAll('input, select, textarea')
    inputs.forEach(i => {
      const required = (i as HTMLInputElement).required || i.getAttribute('data-required') === 'true'
      const val = (i as HTMLInputElement).value || ''
      const filled = i instanceof HTMLInputElement && i.type === 'checkbox' ? (i as HTMLInputElement).checked : val.trim().length > 0
      if (required && !filled) { ok = false; ;(i as HTMLElement).classList.add('invalid') } else ;(i as HTMLElement).classList.remove('invalid')
    })
    return ok
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentForm.tag, FluentForm)
}
