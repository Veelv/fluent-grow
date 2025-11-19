import { FluentComponent } from '../core/fluent-component'

export class FluentCard extends FluentComponent {
  static tag = 'fluent-card'

  static override get observedAttributes() {
    return ['variant', 'elevated', 'interactive']
  }

  render() {
    this.shadowRootRef.innerHTML = `
      <article class="fluent-card">
        <header class="card-header"><slot name="header"></slot></header>
        <div class="card-content"><slot></slot></div>
        <footer class="card-footer"><slot name="footer"></slot></footer>
      </article>
    `
  }

  constructor() {
    super()
    this.recipe = {
      base: { display: 'block', 'container-type': 'inline-size' },
      selectors: {
        '.fluent-card': {
          background: 'light-dark(white, var(--fluent-color-neutral-900))',
          'border-radius': '1rem',
          border: '1px solid light-dark(var(--fluent-color-neutral-200), var(--fluent-color-neutral-700))',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        },
        ':host([elevated]) .fluent-card': { 'box-shadow': '0 10px 40px oklch(0% 0 0 / 0.1)', border: 'none' },
        ':host([interactive]) .fluent-card': { cursor: 'pointer' },
        ':host([interactive]) .fluent-card:hover': { transform: 'translateY(-4px)', 'box-shadow': '0 20px 60px oklch(0% 0 0 / 0.15)' },
        '.card-content': { padding: '1rem' }
      }
    }
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentCard.tag, FluentCard)
}
