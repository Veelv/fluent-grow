import { FluentComponent } from '../core/fluent-component'

export class FluentBadge extends FluentComponent {
  static tag = 'fluent-badge'

  static override get observedAttributes() {
    return ['variant', 'size']
  }

  render() {
    const variant = this.getAttribute('variant') || 'neutral'
    const size = this.getAttribute('size') || 'md'
    return `
      <span class="fluent-badge ${variant} ${size}"><slot></slot></span>
    `
  }

  styles() {
    return {
      ':host': { 'display': 'inline-block' },
      '.fluent-badge': {
        'display': 'inline-flex', 'align-items': 'center', 'gap': '0.375rem',
        'border-radius': '9999px', 'padding': '0.25rem 0.5rem', 'font-weight': '600',
        'background': 'color-mix(in oklch, var(--fluent-color-primary-500) 85%, var(--fluent-color-primary-900))',
        'color': 'light-dark(var(--fluent-color-neutral-900), var(--fluent-color-neutral-50))'
      },
      '.fluent-badge.neutral': {
        'background': 'light-dark(var(--fluent-color-neutral-100), var(--fluent-color-neutral-800))',
        'color': 'light-dark(var(--fluent-color-neutral-900), var(--fluent-color-neutral-50))'
      },
      '.fluent-badge.success': {
        'background': 'var(--fluent-color-success-500)', 'color': 'white'
      },
      '.fluent-badge.warning': {
        'background': 'var(--fluent-color-warning-500)', 'color': 'black'
      },
      '.fluent-badge.error': {
        'background': 'var(--fluent-color-danger-500)', 'color': 'white'
      },
      '.fluent-badge.sm': { 'padding': '0.125rem 0.375rem', 'font-size': '0.75rem' },
      '.fluent-badge.md': { 'padding': '0.25rem 0.5rem', 'font-size': '0.875rem' },
      '.fluent-badge.lg': { 'padding': '0.375rem 0.75rem', 'font-size': '1rem' }
    }
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentBadge.tag, FluentBadge)
}