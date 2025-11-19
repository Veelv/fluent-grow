import { FluentComponent } from '../core/fluent-component'

export class FluentSwitch extends FluentComponent {
  static tag = 'fluent-switch'

  static override get observedAttributes() {
    return ['checked', 'disabled']
  }

  override connectedCallback() {
    super.connectedCallback()
    this.addEventListener('click', () => {
      if (this.hasAttribute('disabled')) return
      this.toggleAttribute('checked')
    })
  }

  render() {
    const checked = this.hasAttribute('checked')
    this.shadowRootRef.innerHTML = `
      <div class="fluent-switch ${checked ? 'checked' : ''}" part="switch"></div>
    `
  }

  constructor() {
    super()
    this.recipe = {
      base: { display: 'inline-block' },
      selectors: {
        '.fluent-switch': { width: '40px', height: '24px', 'border-radius': '9999px', background: 'var(--fluent-color-neutral-300)', position: 'relative' },
        '.fluent-switch::after': { content: '""', position: 'absolute', top: '2px', left: '2px', width: '20px', height: '20px', 'border-radius': '50%', background: 'white', 'box-shadow': '0 2px 8px oklch(0% 0 0 / 0.2)', transition: 'transform 0.2s ease' },
        ':host([checked]) .fluent-switch': { background: 'var(--fluent-color-primary-500)' },
        ':host([checked]) .fluent-switch::after': { transform: 'translateX(16px)' }
      }
    }
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentSwitch.tag, FluentSwitch)
}
