import { FluentComponent } from '../core/fluent-component'

export class FluentModal extends FluentComponent {
  static tag = 'fluent-modal'

  static override get observedAttributes() {
    return ['open', 'size', 'backdrop']
  }

  override connectedCallback() {
    super.connectedCallback()
    this.setup()
  }

  render() {
    const open = this.hasAttribute('open')
    const backdrop = this.getAttribute('backdrop') || 'dim'
    this.shadowRootRef.innerHTML = `
      <div class="fluent-modal ${open ? 'open' : ''}" part="modal" aria-hidden="${open ? 'false' : 'true'}">
        <div class="modal-backdrop ${backdrop}" part="backdrop"></div>
        <div class="modal-content" part="content"><slot></slot></div>
      </div>
    `
  }

  constructor() {
    super()
    this.recipe = {
      base: { position: 'fixed', inset: '0', display: 'block' },
      selectors: {
        '.fluent-modal': { position: 'fixed', inset: '0', display: 'none' },
        ':host([open]) .fluent-modal': { display: 'grid', 'place-items': 'center' },
        '.modal-backdrop': { position: 'absolute', inset: '0' },
        '.modal-backdrop.dim': { background: 'oklch(0% 0 0 / 0.35)' },
        '.modal-backdrop.blur': { 'backdrop-filter': 'blur(8px)', background: 'oklch(0% 0 0 / 0.15)' },
        '.modal-content': {
          position: 'relative', background: 'light-dark(white, var(--fluent-color-neutral-900))',
          color: 'light-dark(var(--fluent-color-neutral-900), var(--fluent-color-neutral-50))',
          'border-radius': '1rem', 'box-shadow': '0 24px 80px oklch(0% 0 0 / 0.25)', padding: '1.25rem',
          width: '640px', 'max-width': '90vw', 'max-height': '90vh', overflow: 'auto'
        }
      }
    }
  }

  override attributeChangedCallback(): void {
    super.attributeChangedCallback()
    const root = this.shadowRootRef.querySelector('.fluent-modal') as HTMLElement | null
    if (!root) return
    if (this.hasAttribute('open')) root.classList.add('open')
    else root.classList.remove('open')
  }

  private setup() {
    this.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (this.hasAttribute('open') && target.classList.contains('modal-backdrop')) this.removeAttribute('open')
    })
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentModal.tag, FluentModal)
}
