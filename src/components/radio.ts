import { FluentComponent } from '../core/fluent-component'

export class FluentRadio extends FluentComponent {
  static tag = 'fluent-radio'

  static override get observedAttributes() {
    return ['checked', 'disabled', 'name', 'value']
  }

  override connectedCallback() {
    super.connectedCallback()
    this.shadowRootRef.addEventListener('click', () => {
      if (this.hasAttribute('disabled')) return
      this.setAttribute('checked', '')
      const name = this.getAttribute('name') || ''
      if (name) document.querySelectorAll(`fluent-radio[name="${name}"]`).forEach(el => el.removeAttribute('checked'))
      this.setAttribute('checked', '')
      const input = this.shadowRootRef.querySelector('input') as HTMLInputElement | null
      if (input) input.checked = true
    })
  }

  render() {
    const name = this.getAttribute('name') || ''
    const value = this.getAttribute('value') || ''
    const checked = this.hasAttribute('checked')
    const disabled = this.hasAttribute('disabled')
    this.shadowRootRef.innerHTML = `
      <label class="root" part="radio">
        <input type="radio" name="${name}" value="${value}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''} />
        <span class="dot" part="dot"></span>
        <span class="text" part="text"><slot></slot></span>
      </label>
    `
  }

  constructor() {
    super()
    this.recipe = {
      base: { display: 'inline-block' },
      selectors: {
        '.root': { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' },
        'input': { position: 'absolute', opacity: '0' },
        '.dot': { width: '18px', height: '18px', border: '1px solid var(--fluent-color-neutral-400)', 'border-radius': '50%', background: 'light-dark(white, var(--fluent-color-neutral-900))' },
        ':host([checked]) .dot': { background: 'var(--fluent-color-primary-500)' }
      }
    }
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentRadio.tag, FluentRadio)
}
