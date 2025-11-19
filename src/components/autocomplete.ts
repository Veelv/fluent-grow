import { FluentComponent } from '../core/fluent-component'

export class FluentAutocomplete extends FluentComponent {
  static tag = 'fluent-autocomplete'

  static override get observedAttributes() {
    return ['open', 'value', 'suggestions']
  }

  override connectedCallback() {
    super.connectedCallback()
    this.shadowRootRef.addEventListener('input', (e) => {
      const t = e.target as HTMLInputElement
      if (t.classList.contains('field')) this.setAttribute('value', t.value)
      this.updateSuggestions()
    })
    this.shadowRootRef.addEventListener('click', (e) => {
      const t = e.target as HTMLElement
      if (t.classList.contains('item')) {
        const v = t.textContent || ''
        this.setAttribute('value', v)
        this.removeAttribute('open')
        const field = this.shadowRootRef.querySelector('.field') as HTMLInputElement | null
        if (field) field.value = v
      }
    })
    this.addEventListener('keydown', (e: KeyboardEvent) => {
      const items = Array.from(this.shadowRootRef.querySelectorAll<HTMLElement>('.item'))
      const idx = items.findIndex(i => i.getAttribute('aria-selected') === 'true')
      if (e.key === 'ArrowDown') { e.preventDefault(); const next = items[Math.min(items.length - 1, idx + 1)] || items[0]; items.forEach(i => i.setAttribute('aria-selected', 'false')); next?.setAttribute('aria-selected', 'true') }
      if (e.key === 'ArrowUp') { e.preventDefault(); const prev = items[Math.max(0, idx - 1)] || items[0]; items.forEach(i => i.setAttribute('aria-selected', 'false')); prev?.setAttribute('aria-selected', 'true') }
      if (e.key === 'Enter') { e.preventDefault(); const sel = items.find(i => i.getAttribute('aria-selected') === 'true'); if (sel) { const v = (sel.textContent || ''); this.setAttribute('value', v); this.removeAttribute('open'); setTimeout(() => { const field = this.shadowRootRef.querySelector('.field') as HTMLInputElement | null; if (field) field.value = v }, 0) } }
    })
  }

  render() {
    const open = this.hasAttribute('open')
    const value = this.getAttribute('value') || ''
    const suggestions = (this.getAttribute('suggestions') || '').split(',').map(s => s.trim()).filter(Boolean)
    const filtered = suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()))
    const items = filtered.map((s, i) => `<div class="item" role="option" aria-selected="${i === 0}" tabindex="-1">${s}</div>`).join('')
    this.shadowRootRef.innerHTML = `
      <div class="root" role="combobox" part="root" aria-expanded="${open ? 'true' : 'false'}" aria-controls="list">
        <input class="field" part="field" type="text" value="${value}" />
        <div class="list ${open ? 'open' : ''}" part="list" role="listbox" id="list">${items.replaceAll('<div class="item"', '<div class="item" part="item"')}</div>
      </div>
    `
  }

  constructor() {
    super()
    this.recipe = {
      base: { display: 'inline-block', position: 'relative' },
      selectors: {
        '.field': { padding: '0.5rem 0.75rem', 'border-radius': '0.5rem', border: '1px solid var(--fluent-color-neutral-300)' },
        '.list': { display: 'none', position: 'absolute', top: '100%', left: '0', background: 'light-dark(white, var(--fluent-color-neutral-900))', 'border-radius': '0.5rem', border: '1px solid var(--fluent-color-neutral-300)', padding: '0.25rem', 'box-shadow': '0 12px 40px oklch(0% 0 0 / 0.2)', 'min-width': '240px' },
        ':host([open]) .list': { display: 'block' },
        '.item[aria-selected="true"]': { background: 'var(--fluent-color-neutral-200)' }
      }
    }
  }

  override attributeChangedCallback(): void {
    super.attributeChangedCallback()
    const v = this.getAttribute('value') || ''
    const field = this.shadowRootRef.querySelector('.field') as HTMLInputElement | null
    if (field) field.value = v
    const list = this.shadowRootRef.querySelector('.list') as HTMLElement | null
    if (this.hasAttribute('open')) list?.classList.add('open')
    else list?.classList.remove('open')
    this.updateSuggestions()
  }

  private updateSuggestions() {
    if (!this.hasAttribute('open')) this.setAttribute('open', '')
    const value = this.getAttribute('value') || ''
    const suggestions = (this.getAttribute('suggestions') || '').split(',').map(s => s.trim()).filter(Boolean)
    const filtered = suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()))
    const items = filtered.map((s, i) => `<div class="item" role="option" aria-selected="${i === 0}" tabindex="-1">${s}</div>`).join('')
    const list = this.shadowRootRef.querySelector('.list') as HTMLElement | null
    if (list) list.innerHTML = items
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentAutocomplete.tag, FluentAutocomplete)
}