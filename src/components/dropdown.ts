import { FluentComponent } from '../core/fluent-component'

export class FluentDropdown extends FluentComponent {
  static tag = 'fluent-dropdown'

  static override get observedAttributes() {
    return ['open']
  }

  override connectedCallback() {
    super.connectedCallback()
    this.addEventListener('click', (e) => {
      const t = e.target as HTMLElement
      if (t.matches('.trigger')) this.toggleAttribute('open')
    })
    document.addEventListener('click', (e) => {
      if (!this.hasAttribute('open')) return
      const path = e.composedPath() as unknown as Element[]
      if (!path.includes(this)) this.removeAttribute('open')
    })
  }

  render() {
    const open = this.hasAttribute('open')
    this.shadowRootRef.innerHTML = `
      <div class="dropdown" role="menu" part="dropdown">
        <button class="trigger" part="trigger"><slot name="trigger">Menu</slot></button>
        <div class="menu ${open ? 'show' : ''}" part="menu"><slot></slot></div>
      </div>
    `
  }

  constructor() {
    super()
    this.recipe = {
      base: { position: 'relative', display: 'inline-block' },
      selectors: {
        '.menu': { position: 'absolute', display: 'none', 'min-width': '160px', background: 'light-dark(white, var(--fluent-color-neutral-900))', border: '1px solid var(--fluent-color-neutral-300)', 'border-radius': '0.5rem', 'box-shadow': '0 12px 40px oklch(0% 0 0 / 0.2)', padding: '0.5rem' },
        ':host([open]) .menu': { display: 'block' }
      }
    }
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentDropdown.tag, FluentDropdown)
}
