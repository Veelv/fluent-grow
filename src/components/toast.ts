import { FluentComponent } from '../core/fluent-component'

export class FluentToast extends FluentComponent {
  static tag = 'fluent-toast'

  static override get observedAttributes() {
    return ['text', 'open']
  }

  render() {
    const text = this.getAttribute('text') || ''
    const open = this.hasAttribute('open')
    this.shadowRootRef.innerHTML = `
      <div class="fluent-toast ${open ? 'open' : ''}" part="toast">${text}<slot></slot></div>
    `
  }

  constructor() {
    super()
    this.recipe = {
      base: { position: 'fixed', bottom: '1rem', right: '1rem', 'z-index': '9999' },
      selectors: {
        '.fluent-toast': { display: 'none', background: 'var(--fluent-color-neutral-900)', color: 'var(--fluent-color-neutral-50)', padding: '0.5rem 0.75rem', 'border-radius': '0.5rem', 'box-shadow': '0 12px 40px oklch(0% 0 0 / 0.2)' },
        ':host([open]) .fluent-toast': { display: 'inline-block' }
      }
    }
  }

  override attributeChangedCallback(): void {
    super.attributeChangedCallback()
    // class is derived from attribute for non-adoptedStyleSheets environments
    const el = this.shadowRootRef.querySelector('.fluent-toast') as HTMLElement | null
    if (!el) return
    if (this.hasAttribute('open')) el.classList.add('open')
    else el.classList.remove('open')
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentToast.tag, FluentToast)
}
