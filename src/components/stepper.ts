import { FluentComponent } from '../core/fluent-component'

export class FluentStepper extends FluentComponent {
  static tag = 'fluent-stepper'

  static override get observedAttributes() {
    return ['current', 'total']
  }

  override connectedCallback() {
    super.connectedCallback()
    this.addEventListener('keydown', (e: KeyboardEvent) => {
      const current = Number(this.getAttribute('current') || '1')
      const total = Number(this.getAttribute('total') || '1')
      if (e.key === 'ArrowRight') this.setAttribute('current', String(Math.min(total, current + 1)))
      if (e.key === 'ArrowLeft') this.setAttribute('current', String(Math.max(1, current - 1)))
    })
  }

  render() {
    const current = Number(this.getAttribute('current') || '1')
    const total = Number(this.getAttribute('total') || '1')
    const items = Array.from({ length: total }, (_, i) => `<div class="step" role="listitem" data-index="${i + 1}" aria-current="${i + 1 === current ? 'step' : 'false'}"></div>`).join('')
    this.shadowRootRef.innerHTML = `
      <div class="root" role="list" tabindex="0">${items}</div>
    `
  }

  constructor() {
    super()
    this.recipe = {
      base: { display: 'inline-block' },
      selectors: {
        '.root': { display: 'inline-flex', gap: '0.5rem' },
        '.step': { width: '24px', height: '4px', background: 'var(--fluent-color-neutral-300)', 'border-radius': '9999px' },
        '.step[aria-current="step"]': { background: 'var(--fluent-color-primary-500)' }
      }
    }
  }

  override attributeChangedCallback(): void {
    super.attributeChangedCallback()
    this.render()
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentStepper.tag, FluentStepper)
}