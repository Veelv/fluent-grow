import { FluentComponent } from '../core/fluent-component'

export class FluentSelect extends FluentComponent {
  static tag = 'fluent-select'

  static override get observedAttributes() {
    return ['disabled']
  }

  render() {
    const disabled = this.hasAttribute('disabled') ? 'disabled' : ''
    return `
      <select class="fluent-select" part="select" ${disabled}><slot></slot></select>
    `
  }

  styles() {
    return {
      ':host': { 'display': 'inline-block' },
      '.fluent-select': {
        'padding': '0.5rem 0.75rem', 'border-radius': '0.5rem',
        'border': '1px solid var(--fluent-color-neutral-300)', 'background': 'light-dark(white, var(--fluent-color-neutral-900))',
        'color': 'light-dark(var(--fluent-color-neutral-900), var(--fluent-color-neutral-50))'
      }
    }
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentSelect.tag, FluentSelect)
}
