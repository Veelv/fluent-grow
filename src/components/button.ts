import { FluentComponent } from '../core/fluent-component'

export class FluentButton extends FluentComponent {
  static tag = 'fluent-button'

  static override get observedAttributes() {
    return ['variant', 'size', 'loading', 'disabled']
  }

  override connectedCallback() {
    super.connectedCallback()
    this.addEventListener('click', (event) => {
      if (this.hasAttribute('loading') || this.hasAttribute('disabled')) {
        event.preventDefault()
      }
    })
  }

  render() {
    const loading = this.hasAttribute('loading')
    this.shadowRootRef.innerHTML = `
      <button class="fluent-button" ${this.hasAttribute('disabled') ? 'disabled' : ''}>
        ${loading ? '<span class="loading-spinner"></span>' : ''}
        <slot></slot>
      </button>
    `
  }

  constructor() {
    super()
    this.recipe = {
      base: { display: 'inline-block', 'container-type': 'inline-size' },
      selectors: {
        '.fluent-button': {
          display: 'flex', 'align-items': 'center', 'justify-content': 'center', gap: '0.5rem',
          border: 'none', 'border-radius': '0.75rem', 'font-weight': '500', cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'var(--fluent-color-primary-500)', color: 'white'
        },
        ':host([variant="primary"]) .fluent-button': {
          background: 'linear-gradient(135deg, var(--fluent-color-primary-500), var(--fluent-color-primary-600))',
          'box-shadow': '0 4px 12px var(--fluent-color-primary-500 / 0.3)'
        },
        ':host([variant="secondary"]) .fluent-button': {
          background: 'var(--fluent-color-neutral-100)', color: 'var(--fluent-color-neutral-900)',
          border: '1px solid var(--fluent-color-neutral-300)'
        },
        ':host([size="sm"]) .fluent-button': { padding: '0.5rem 1rem', 'font-size': '0.875rem' },
        ':host([size="md"]) .fluent-button': { padding: '0.75rem 1.5rem', 'font-size': '1rem' },
        ':host([size="lg"]) .fluent-button': { padding: '1rem 2rem', 'font-size': '1.125rem' },
        '.fluent-button:hover': { transform: 'translateY(-2px)', 'box-shadow': '0 8px 24px var(--fluent-color-primary-500 / 0.4)' },
        '.loading-spinner': {
          width: '1rem', height: '1rem', border: '2px solid transparent', 'border-top': '2px solid currentColor',
          'border-radius': '50%'
        }
      }
    }
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentButton.tag, FluentButton)
}
