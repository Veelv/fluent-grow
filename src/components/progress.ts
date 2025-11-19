import { FluentComponent } from '../core/fluent-component'

export class FluentProgress extends FluentComponent {
  static tag = 'fluent-progress'

  static override get observedAttributes() {
    return ['value', 'max']
  }

  render() {
    const value = Number(this.getAttribute('value') || '0')
    const max = Number(this.getAttribute('max') || '100')
    const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)))
    return `
      <div class="fluent-progress" part="progress"><div class="bar" part="bar" style="width:${pct}%"></div></div>
    `
  }

  styles() {
    return {
      ':host': { 'display': 'block', 'width': '100%' },
      '.fluent-progress': { 'height': '0.5rem', 'background': 'var(--fluent-color-neutral-200)', 'border-radius': '9999px' },
      '.bar': { 'height': '100%', 'background': 'var(--fluent-color-primary-500)', 'border-radius': '9999px' }
    }
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentProgress.tag, FluentProgress)
}
