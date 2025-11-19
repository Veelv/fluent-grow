import { FluentComponent } from '../core/fluent-component'

export class FluentMenu extends FluentComponent {
  static tag = 'fluent-menu'

  render() {
    return `
      <ul class="fluent-menu"><slot></slot></ul>
    `
  }

  styles() {
    return {
      ':host': { 'display': 'block' },
      '.fluent-menu': { 'list-style': 'none', 'margin': '0', 'padding': '0.25rem', 'display': 'flex', 'gap': '0.5rem' }
    }
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentMenu.tag, FluentMenu)
}