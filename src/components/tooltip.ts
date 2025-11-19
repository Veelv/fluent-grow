import { FluentComponent } from '../core/fluent-component'

export class FluentTooltip extends FluentComponent {
  static tag = 'fluent-tooltip'

  static override get observedAttributes() {
    return ['text', 'position']
  }

  override connectedCallback() {
    super.connectedCallback()
    this.setup()
  }

  render() {
    const text = this.getAttribute('text') || ''
    return `
      <div class="fluent-tooltip" role="tooltip" part="tooltip">${text}<slot></slot></div>
    `
  }

  styles() {
    const pos = this.getAttribute('position') || 'top'
    const base: Record<string, string> = {
      'position': 'absolute', 'z-index': '9999', 'background': 'var(--fluent-color-neutral-900)',
      'color': 'var(--fluent-color-neutral-50)', 'border-radius': '0.5rem', 'padding': '0.375rem 0.5rem',
      'box-shadow': '0 8px 24px oklch(0% 0 0 / 0.25)'
    }
    const positions: Record<string, Record<string, string>> = {
      top: { 'transform': 'translate(-50%, -100%)', 'left': '50%', 'bottom': '100%' },
      bottom: { 'transform': 'translate(-50%, 0)', 'left': '50%', 'top': '100%' },
      left: { 'transform': 'translate(-100%, -50%)', 'right': '100%', 'top': '50%' },
      right: { 'transform': 'translate(0, -50%)', 'left': '100%', 'top': '50%' }
    }
    const merged = { ...base, ...(positions[pos] || positions.top) }
    return {
      ':host': { 'position': 'relative', 'display': 'inline-block' },
      '.fluent-tooltip': merged
    }
  }

  private setup() {
    const el = this
    el.addEventListener('mouseenter', () => el.setAttribute('data-show', ''))
    el.addEventListener('mouseleave', () => el.removeAttribute('data-show'))
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentTooltip.tag, FluentTooltip)
}