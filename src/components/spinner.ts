import { FluentComponent } from '../core/fluent-component'

export class FluentSpinner extends FluentComponent {
  static tag = 'fluent-spinner'

  render() {
    return `
      <div class="fluent-spinner" part="spinner"></div>
    `
  }

  styles() {
    return {
      ':host': { 'display': 'inline-block' },
      '.fluent-spinner': { 'width': '24px', 'height': '24px', 'border': '3px solid var(--fluent-color-neutral-300)', 'border-top': '3px solid var(--fluent-color-primary-500)', 'border-radius': '50%' }
    }
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentSpinner.tag, FluentSpinner)
}