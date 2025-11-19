import { FluentComponent } from '../core/fluent-component'

export class FluentNotification extends FluentComponent {
  static tag = 'fluent-notification'

  static override get observedAttributes() {
    return ['open', 'variant', 'text', 'duration']
  }

  private queue: Array<{ text: string; variant: string; duration: number }> = []
  private timer?: number

  override connectedCallback() {
    super.connectedCallback()
  }

  render() {
    const open = this.hasAttribute('open')
    const variant = this.getAttribute('variant') || 'status'
    const text = this.getAttribute('text') || ''
    const role = variant === 'alert' ? 'alert' : 'status'
    this.shadowRootRef.innerHTML = `
      <div class="notification ${open ? 'open' : ''}" role="${role}" aria-live="polite">${text}<slot></slot></div>
    `
  }

  constructor() {
    super()
    this.recipe = {
      base: { position: 'fixed', bottom: '1rem', right: '1rem', 'z-index': '10000' },
      selectors: {
        '.notification': { display: 'none', background: 'var(--fluent-color-neutral-900)', color: 'var(--fluent-color-neutral-50)', padding: '0.5rem 0.75rem', 'border-radius': '0.5rem', 'box-shadow': '0 12px 40px oklch(0% 0 0 / 0.2)' },
        ':host([open]) .notification': { display: 'inline-block' }
      }
    }
  }

  override attributeChangedCallback(): void {
    super.attributeChangedCallback()
    const duration = Number(this.getAttribute('duration') || '0')
    if (this.hasAttribute('open') && duration > 0) {
      if (this.timer) clearTimeout(this.timer)
      this.timer = setTimeout(() => this.removeAttribute('open'), duration) as unknown as number
    }
    this.render()
    if (!this.hasAttribute('open')) this.next()
  }

  push(text: string, variant: 'status' | 'alert' = 'status', duration = 3000) {
    this.queue.push({ text, variant, duration })
    this.next()
  }

  private next() {
    if (this.hasAttribute('open')) return
    const item = this.queue.shift()
    if (!item) return
    this.setAttribute('text', item.text)
    this.setAttribute('variant', item.variant)
    this.setAttribute('duration', String(item.duration))
    this.setAttribute('open', '')
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentNotification.tag, FluentNotification)
}
