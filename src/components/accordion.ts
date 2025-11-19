import { FluentComponent } from '../core/fluent-component'

export class FluentAccordion extends FluentComponent {
  static tag = 'fluent-accordion'

  static override get observedAttributes() {
    return ['open']
  }

  override connectedCallback() {
    super.connectedCallback()
    this.addEventListener('click', (e) => {
      const t = e.target as HTMLElement
      if (t.matches('.accordion-header')) this.toggleAttribute('open')
    })
  }

  render() {
    const open = this.hasAttribute('open')
    return `
      <div class="accordion">
        <div class="accordion-header"><slot name="header">Section</slot></div>
        <div class="accordion-panel ${open ? 'show' : ''}"><slot></slot></div>
      </div>
    `
  }

  styles() {
    return {
      ':host': { 'display': 'block' },
      '.accordion-header': { 'cursor': 'pointer', 'padding': '0.75rem', 'border': '1px solid var(--fluent-color-neutral-300)' },
      '.accordion-panel': { 'display': 'none', 'padding': '0.75rem', 'border': '1px solid var(--fluent-color-neutral-200)', 'border-top': 'none' },
      '.accordion-panel.show': { 'display': 'block' }
    }
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentAccordion.tag, FluentAccordion)
}