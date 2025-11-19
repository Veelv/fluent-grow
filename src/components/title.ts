import { FluentComponent } from '../core/fluent-component'

export class FluentTitle extends FluentComponent {
  static tag = 'fluent-title'

  static override get observedAttributes() {
    return ['level']
  }

  render() {
    const level = Number(this.getAttribute('level') || '2')
    const tag = `h${Math.min(6, Math.max(1, level))}`
    this.shadowRootRef.innerHTML = `<${tag} class="ttl"><slot></slot></${tag}>`
  }

  constructor() {
    super()
    this.recipe = { base: { display: 'block' }, selectors: { '.ttl': { fontWeight: '800', margin: '0.5rem 0' } } }
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentTitle.tag, FluentTitle)
}