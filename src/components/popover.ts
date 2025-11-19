import { FluentComponent } from '../core/fluent-component'

export class FluentPopover extends FluentComponent {
  static tag = 'fluent-popover'

  static override get observedAttributes() {
    return ['open', 'position']
  }

  render() {
    const open = this.hasAttribute('open')
    this.shadowRootRef.innerHTML = `
      <div class="fluent-popover ${open ? 'open' : ''}"><slot></slot></div>
    `
  }

  constructor() {
    super()
    this.recipe = {
      base: { position: 'relative', display: 'inline-block' },
      selectors: {
        '.fluent-popover': { position: 'absolute', 'min-width': '200px', background: 'light-dark(white, var(--fluent-color-neutral-900))', color: 'light-dark(var(--fluent-color-neutral-900), var(--fluent-color-neutral-50))', 'border-radius': '0.5rem', padding: '0.75rem', 'box-shadow': '0 12px 40px oklch(0% 0 0 / 0.2)', display: 'none' },
        ':host([position="top"]) .fluent-popover': { bottom: '100%', left: '50%', transform: 'translateX(-50%)' },
        ':host([position="bottom"]) .fluent-popover': { top: '100%', left: '50%', transform: 'translateX(-50%)' },
        ':host([position="left"]) .fluent-popover': { right: '100%', top: '50%', transform: 'translateY(-50%)' },
        ':host([position="right"]) .fluent-popover': { left: '100%', top: '50%', transform: 'translateY(-50%)' },
        ':host([open]) .fluent-popover': { display: 'block' }
      }
    }
  }

  override attributeChangedCallback(): void {
    super.attributeChangedCallback()
    const el = this.shadowRootRef.querySelector('.fluent-popover') as HTMLElement | null
    if (!el) return
    if (this.hasAttribute('open')) el.classList.add('open')
    else el.classList.remove('open')
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentPopover.tag, FluentPopover)
}