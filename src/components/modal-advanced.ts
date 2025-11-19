import { FluentComponent } from '../core/fluent-component'

export class FluentModalAdvanced extends FluentComponent {
  static tag = 'fluent-modal-advanced'

  static override get observedAttributes() {
    return ['open']
  }

  override connectedCallback() {
    super.connectedCallback()
    this.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.removeAttribute('open')
      if (e.key === 'Tab') {
        const f = this.shadowRootRef.querySelectorAll<HTMLElement>('[tabindex], button, a, input, select, textarea')
        if (!f.length) return
        const first = f[0] || null
        const last = f[f.length - 1] || null
        if (e.shiftKey && first && document.activeElement === first) { e.preventDefault(); last?.focus() }
        else if (!e.shiftKey && last && document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    })
  }

  render() {
    const open = this.hasAttribute('open')
    this.shadowRootRef.innerHTML = `
      <div class="modal ${open ? 'open' : ''}" role="dialog" aria-modal="true" part="modal">
        <div class="backdrop" part="backdrop"></div>
        <div class="panel" tabindex="0" part="panel">
          <header class="header" part="header"><slot name="header"></slot></header>
          <section class="body" part="body"><slot></slot></section>
          <footer class="footer" part="footer"><slot name="footer"></slot></footer>
        </div>
      </div>
    `
    const panel = this.shadowRootRef.querySelector('.panel') as HTMLElement | null
    if (open && panel) panel.focus()
  }

  constructor() {
    super()
    this.recipe = {
      base: { position: 'fixed', inset: '0' },
      selectors: {
        '.modal': { position: 'fixed', inset: '0', display: 'none' },
        ':host([open]) .modal': { display: 'grid', 'place-items': 'center' },
        '.backdrop': { position: 'absolute', inset: '0', background: 'oklch(0% 0 0 / 0.35)' },
        '.panel': { position: 'relative', background: 'light-dark(white, var(--fluent-color-neutral-900))', color: 'light-dark(var(--fluent-color-neutral-900), var(--fluent-color-neutral-50))', padding: '1rem', 'border-radius': '1rem', width: 'min(720px, 90vw)' },
        '.header': { 'font-weight': '700', 'margin-bottom': '0.5rem' },
        '.footer': { 'margin-top': '0.75rem', 'display': 'flex', 'justify-content': 'flex-end', 'gap': '0.5rem' }
      }
    }
  }

  override attributeChangedCallback(): void {
    super.attributeChangedCallback()
    const root = this.shadowRootRef.querySelector('.modal') as HTMLElement | null
    if (!root) return
    if (this.hasAttribute('open')) root.classList.add('open')
    else root.classList.remove('open')
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentModalAdvanced.tag, FluentModalAdvanced)
}
