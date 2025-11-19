import { FluentComponent } from '../core/fluent-component'

export class FluentTabs extends FluentComponent {
  static tag = 'fluent-tabs'

  static override get observedAttributes() {
    return ['selected']
  }

  override connectedCallback() {
    super.connectedCallback()
    this.addEventListener('click', (e) => {
      const t = e.target as HTMLElement
      if (t.matches('.tab')) this.setAttribute('selected', t.dataset.key || '0')
    })
  }

  render() {
    this.shadowRootRef.innerHTML = `
      <div class="tablist" part="tablist">
        <button class="tab" part="tab" data-key="0"><slot name="tab-0">Tab 1</slot></button>
        <button class="tab" part="tab" data-key="1"><slot name="tab-1">Tab 2</slot></button>
      </div>
      <div class="tabpanel" part="tabpanel" data-key="0"><slot name="panel-0"></slot></div>
      <div class="tabpanel" part="tabpanel" data-key="1"><slot name="panel-1"></slot></div>
    `
  }

  constructor() {
    super()
    this.recipe = {
      base: { display: 'block' },
      selectors: {
        '.tablist': { display: 'flex', gap: '0.5rem', 'border-bottom': '1px solid var(--fluent-color-neutral-200)' },
        '.tab': { padding: '0.5rem 0.75rem', background: 'transparent', border: 'none', cursor: 'pointer' },
        '.tabpanel': { display: 'none', padding: '0.75rem 0' },
        ':host([selected="0"]) .tabpanel[data-key="0"]': { display: 'block' },
        ':host([selected="1"]) .tabpanel[data-key="1"]': { display: 'block' }
      }
    }
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentTabs.tag, FluentTabs)
}
