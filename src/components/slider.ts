import { FluentComponent } from '../core/fluent-component'

export class FluentSlider extends FluentComponent {
  static tag = 'fluent-slider'

  static override get observedAttributes() {
    return ['value', 'min', 'max']
  }

  render() {
    this.shadowRootRef.innerHTML = `
      <div class="fluent-slider" part="slider"><div class="track" part="track"></div><div class="thumb" part="thumb"></div></div>
    `
    this.updateThumb()
  }

  constructor() {
    super()
    this.recipe = {
      base: { display: 'block', width: '100%', position: 'relative' },
      selectors: {
        '.fluent-slider': { height: '2rem', position: 'relative' },
        '.track': { position: 'absolute', top: '50%', left: '0', right: '0', height: '4px', background: 'var(--fluent-color-neutral-200)', transform: 'translateY(-50%)', 'border-radius': '9999px' },
        '.thumb': { position: 'absolute', top: '50%', width: '16px', height: '16px', background: 'var(--fluent-color-primary-500)', 'border-radius': '50%', transform: 'translate(-50%, -50%)', 'box-shadow': '0 2px 8px oklch(0% 0 0 / 0.2)' }
      }
    }
  }

  override attributeChangedCallback(): void {
    super.attributeChangedCallback()
    this.updateThumb()
  }

  private updateThumb() {
    const value = Number(this.getAttribute('value') || '0')
    const min = Number(this.getAttribute('min') || '0')
    const max = Number(this.getAttribute('max') || '100')
    const pct = Math.max(0, Math.min(100, Math.round(((value - min) / (max - min)) * 100)))
    const thumb = this.shadowRootRef.querySelector('.thumb') as HTMLElement | null
    if (thumb) thumb.style.left = pct + '%'
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentSlider.tag, FluentSlider)
}
