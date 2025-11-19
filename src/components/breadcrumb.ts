import { FluentComponent } from '../core/fluent-component'

export class FluentBreadcrumb extends FluentComponent {
  static tag = 'fluent-breadcrumb'

  render() {
    return `
      <nav class="fluent-breadcrumb"><slot></slot></nav>
    `
  }

  styles() {
    return {
      ':host': { 'display': 'block' },
      '.fluent-breadcrumb': { 'display': 'flex', 'flex-wrap': 'wrap', 'gap': '0.5rem', 'color': 'var(--fluent-color-neutral-700)' }
    }
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentBreadcrumb.tag, FluentBreadcrumb)
}