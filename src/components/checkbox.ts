import { FluentComponent } from '../core/fluent-component'

export class FluentCheckbox extends FluentComponent {
  static tag = 'fluent-checkbox'

  static override get observedAttributes() {
    return ['checked', 'disabled', 'name']
  }

  override connectedCallback() {
    super.connectedCallback()
    this.shadowRootRef.addEventListener('click', () => {
      if (this.hasAttribute('disabled')) return
      this.toggleAttribute('checked')
      const input = this.shadowRootRef.querySelector('input') as HTMLInputElement | null
      if (input) input.checked = this.hasAttribute('checked')
    })
  }

  render() {
    const name = this.getAttribute('name') || ''
    const checked = this.hasAttribute('checked')
    const disabled = this.hasAttribute('disabled')
    this.shadowRootRef.innerHTML = `
      <label class="root" part="checkbox">
        <input type="checkbox" id="cb" name="${name}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''} />
        <span class="box" part="box"></span>
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
        '.box': { width: '18px', height: '18px', border: '1px solid var(--fluent-color-neutral-400)', 'border-radius': '4px', background: 'light-dark(white, var(--fluent-color-neutral-900))' },
        ':host([checked]) .box': { background: 'var(--fluent-color-primary-500)' }
      }
    }
  }

  override attributeChangedCallback(): void {
    super.attributeChangedCallback()
    const input = this.shadowRootRef.querySelector('input') as HTMLInputElement | null
    if (input) input.checked = this.hasAttribute('checked')
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentCheckbox.tag, FluentCheckbox)
}
