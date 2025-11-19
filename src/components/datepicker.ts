import { FluentComponent } from '../core/fluent-component'

export class FluentDatepicker extends FluentComponent {
  static tag = 'fluent-datepicker'

  static override get observedAttributes() {
    return ['open', 'value']
  }

  override connectedCallback() {
    super.connectedCallback()
    this.addEventListener('keydown', (e: KeyboardEvent) => {
      const active = this.shadowRootRef.querySelector('.day[tabindex="0"]') as HTMLElement | null
      if (!active) return
      const all = Array.from(this.shadowRootRef.querySelectorAll<HTMLElement>('.day'))
      const idx = all.indexOf(active)
      if (e.key === 'ArrowRight') { e.preventDefault(); const t = all[idx + 1] || active; t.focus() }
      if (e.key === 'ArrowLeft') { e.preventDefault(); const t = all[idx - 1] || active; t.focus() }
      if (e.key === 'ArrowDown') { e.preventDefault(); const t = all[idx + 7] || active; t.focus() }
      if (e.key === 'ArrowUp') { e.preventDefault(); const t = all[idx - 7] || active; t.focus() }
      if (e.key === 'Enter') { e.preventDefault(); const d = active.getAttribute('data-day') || ''; this.setAttribute('value', d) }
    })
  }

  render() {
    const open = this.hasAttribute('open')
    const value = this.getAttribute('value') || ''
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const first = new Date(year, month, 1)
    const startIdx = first.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: string[] = []
    let focusSet = false
    for (let i = 0; i < startIdx; i++) cells.push('<div class="day empty"></div>')
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const selected = value === dateStr
      const tab = selected || !focusSet ? '0' : '-1'
      if (tab === '0') focusSet = true
      cells.push(`<button class="day${selected ? ' selected' : ''}" role="gridcell" data-day="${dateStr}" tabindex="${tab}">${d}</button>`)
    }
    this.shadowRootRef.innerHTML = `
      <div class="root" role="combobox" part="root" aria-expanded="${open ? 'true' : 'false'}">
        <input class="field" part="field" type="text" value="${value}" aria-controls="grid" aria-haspopup="grid" />
        <div class="popup ${open ? 'open' : ''}" part="popup" role="grid" id="grid">${cells.join('').replaceAll('class="day', 'class="day" part="day')}</div>
      </div>
    `
    if (open) {
      const focusEl = this.shadowRootRef.querySelector('.day[tabindex="0"]') as HTMLElement | null
      focusEl?.focus()
    }
  }

  constructor() {
    super()
    this.recipe = {
      base: { display: 'inline-block', position: 'relative' },
      selectors: {
        '.field': { padding: '0.5rem 0.75rem', 'border-radius': '0.5rem', border: '1px solid var(--fluent-color-neutral-300)' },
        '.popup': { display: 'none', position: 'absolute', top: '100%', left: '0', background: 'light-dark(white, var(--fluent-color-neutral-900))', 'border-radius': '0.5rem', border: '1px solid var(--fluent-color-neutral-300)', padding: '0.5rem', 'box-shadow': '0 12px 40px oklch(0% 0 0 / 0.2)', 'grid-template-columns': 'repeat(7, 1fr)', gap: '0.25rem' },
        ':host([open]) .popup': { display: 'grid' },
        '.day': { padding: '0.375rem', 'border-radius': '0.375rem', border: '1px solid transparent' },
        '.day.selected': { background: 'var(--fluent-color-primary-500)', color: 'white' },
        '.day.empty': { visibility: 'hidden' }
      }
    }
  }

  override attributeChangedCallback(): void {
    super.attributeChangedCallback()
    this.render()
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentDatepicker.tag, FluentDatepicker)
}