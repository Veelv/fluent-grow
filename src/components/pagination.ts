import { FluentComponent } from '../core/fluent-component'

export class FluentPagination extends FluentComponent {
  static tag = 'fluent-pagination'

  static override get observedAttributes() {
    return ['page', 'pages']
  }

  render() {
    const page = Number(this.getAttribute('page') || '1')
    const pages = Number(this.getAttribute('pages') || '1')
    return `
      <div class="fluent-pagination">
        <button class="prev" ${page <= 1 ? 'disabled' : ''}>Prev</button>
        <span class="info">${page} / ${pages}</span>
        <button class="next" ${page >= pages ? 'disabled' : ''}>Next</button>
      </div>
    `
  }

  styles() {
    return {
      ':host': { 'display': 'inline-block' },
      '.fluent-pagination': { 'display': 'inline-flex', 'gap': '0.5rem', 'align-items': 'center' }
    }
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentPagination.tag, FluentPagination)
}