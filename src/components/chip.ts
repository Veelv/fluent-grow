import { FluentComponent } from '../core/fluent-component'

export class FluentChip extends FluentComponent {
  static tag = 'fluent-chip'

  static override get observedAttributes() {
    return ['variant']
  }

  render() {
    const variant = this.getAttribute('variant') || 'neutral'
    return `
      <span class="fluent-chip ${variant}"><slot></slot></span>
    `
  }

  styles() {
    return {
      ':host': { 'display': 'inline-block' },
      '.fluent-chip': { 'display': 'inline-flex', 'align-items': 'center', 'gap': '0.375rem', 'border-radius': '9999px', 'padding': '0.25rem 0.5rem', 'font-weight': '500', 'border': '1px solid var(--fluent-color-neutral-300)' },
      '.fluent-chip.neutral': { 'background': 'light-dark(var(--fluent-color-neutral-100), var(--fluent-color-neutral-800))' },
      '.fluent-chip.primary': { 'background': 'var(--fluent-color-primary-500)', 'color': 'white' }
    }
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentChip.tag, FluentChip)
}