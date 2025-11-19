import { FluentComponent } from '../core/fluent-component'

export class FluentText extends FluentComponent {
  static tag = 'fluent-text'

  static override get observedAttributes() {
    return ['size', 'weight']
  }

  render() {
    const size = this.getAttribute('size') || 'md'
    const weight = this.getAttribute('weight') || 'normal'
    this.shadowRootRef.innerHTML = `<span class="txt ${size} ${weight}"><slot></slot></span>`
  }

  constructor() {
    super()
    this.recipe = {
      base: { display: 'inline' },
      selectors: {
        '.txt': { color: 'light-dark(var(--fluent-color-neutral-900), var(--fluent-color-neutral-50))' },
        '.txt.sm': { fontSize: '0.875rem' },
        '.txt.md': { fontSize: '1rem' },
        '.txt.lg': { fontSize: '1.125rem' },
        '.txt.bold': { fontWeight: '700' }
      }
    }
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentText.tag, FluentText)
}