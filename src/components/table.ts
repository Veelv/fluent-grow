import { FluentComponent } from '../core/fluent-component'

export class FluentTable extends FluentComponent {
  static tag = 'fluent-table'

  static override get observedAttributes() {
    return ['sortable']
  }

  override connectedCallback() {
    super.connectedCallback()
    this.addEventListener('click', (e) => {
      const path = (e.composedPath && e.composedPath()) || []
      const target = path.find((el: any) => el?.matches && el.matches('th[aria-sort]')) as HTMLElement | undefined
      if (target && this.hasAttribute('sortable')) {
        const slot = this.shadowRootRef.querySelector('slot[name="thead"]') as HTMLSlotElement | null
        const headers = slot ? slot.assignedElements() : []
        const index = headers.indexOf(target)
        const dir = target.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending'
        target.setAttribute('aria-sort', dir)
        this.sortByIndex(index, dir === 'ascending')
      }
    })
  }

  render() {
    const sortable = this.hasAttribute('sortable')
    this.shadowRootRef.innerHTML = `
      <table class="tbl" role="table" part="table">
        <thead><tr><slot name="thead"></slot></tr></thead>
        <tbody><slot name="tbody"></slot></tbody>
      </table>
    `
    if (sortable) {
      const slot = this.shadowRootRef.querySelector('slot[name="thead"]') as HTMLSlotElement | null
      slot?.assignedElements().forEach(el => el.setAttribute('aria-sort', 'none'))
    }
  }

  constructor() {
    super()
    this.recipe = {
      base: { display: 'block', width: '100%' },
      selectors: {
        '.tbl': { width: '100%', borderCollapse: 'collapse' },
        'thead': { position: 'sticky', top: '0', background: 'light-dark(var(--fluent-color-neutral-100), var(--fluent-color-neutral-800))' },
        'th, td': { border: '1px solid var(--fluent-color-neutral-300)', padding: '0.5rem', textAlign: 'left' }
      }
    }
  }

  private sortByIndex(index: number, asc: boolean) {
    const bodySlot = this.shadowRootRef.querySelector('slot[name="tbody"]') as HTMLSlotElement | null
    if (!bodySlot) return
    const rows = bodySlot.assignedNodes().filter(n => (n as Element).nodeType === 1) as HTMLElement[]
    rows.sort((a, b) => {
      const ta = a.querySelectorAll('td')[index]?.textContent || ''
      const tb = b.querySelectorAll('td')[index]?.textContent || ''
      return asc ? ta.localeCompare(tb) : tb.localeCompare(ta)
    })
    rows.forEach(r => r.parentElement?.appendChild(r))
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentTable.tag, FluentTable)
}