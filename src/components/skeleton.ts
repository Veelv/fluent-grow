import { FluentComponent } from '../core/fluent-component'

export class FluentSkeleton extends FluentComponent {
  static tag = 'fluent-skeleton'

  static override get observedAttributes() {
    return ['width', 'height']
  }

  render() {
    const w = this.getAttribute('width') || '100%'
    const h = this.getAttribute('height') || '1rem'
    return `
      <div class="fluent-skeleton" part="skeleton" style="width:${w};height:${h}"></div>
    `
  }

  styles() {
    return {
      ':host': { 'display': 'inline-block' },
      '.fluent-skeleton': {
        'border-radius': '0.5rem', 'background': 'linear-gradient(90deg, var(--fluent-color-neutral-200), var(--fluent-color-neutral-300), var(--fluent-color-neutral-200))'
      }
    }
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentSkeleton.tag, FluentSkeleton)
}