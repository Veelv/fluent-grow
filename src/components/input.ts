import { FluentComponent } from '../core/fluent-component'

export class FluentInput extends FluentComponent {
  static tag = 'fluent-input'

  static override get observedAttributes() {
    return ['type', 'placeholder', 'value', 'disabled']
  }

  render() {
    const type = this.getAttribute('type') || 'text'
    const placeholder = this.getAttribute('placeholder') || ''
    const value = this.getAttribute('value') || ''
    const disabled = this.hasAttribute('disabled') ? 'disabled' : ''
    return `
      <input class="fluent-input" part="input" type="${type}" placeholder="${placeholder}" value="${value}" ${disabled} />
    `
  }

  styles() {
    return {
      ':host': { 'display': 'inline-block', 'width': '100%' },
      '.fluent-input': {
        'width': '100%', 'padding': '0.5rem 0.75rem', 'border-radius': '0.5rem',
        'border': '1px solid var(--fluent-color-neutral-300)', 'background': 'light-dark(white, var(--fluent-color-neutral-900))',
        'color': 'light-dark(var(--fluent-color-neutral-900), var(--fluent-color-neutral-50))'
      }
    }
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentInput.tag, FluentInput)
}
