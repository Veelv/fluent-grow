import { FluentComponent } from '../core/fluent-component'

export class FluentAvatarGroup extends FluentComponent {
  static tag = 'fluent-avatar-group'

  static override get observedAttributes() {
    return ['max', 'size', 'overlap', 'ring', 'ring-color']
  }

  override connectedCallback() {
    super.connectedCallback()
    this.observeChildren()
    this.updateGroup()
  }

  render() {
    this.shadowRootRef.innerHTML = `
      <div class="group" part="group"><slot></slot><span class="overflow" part="overflow" hidden></span></div>
    `
  }

  constructor() {
    super()
    this.recipe = {
      base: { display: 'inline-flex', 'align-items': 'center', gap: '0' },
      selectors: {
        '.group': { display: 'inline-flex', 'align-items': 'center' },
        '::slotted(fluent-avatar)': { position: 'relative' },
        '.overflow': { 'margin-left': '4px', 'font-weight': '600', color: 'var(--fluent-color-neutral-700)' }
      }
    }
  }

  override attributeChangedCallback(): void {
    super.attributeChangedCallback()
    this.updateGroup()
  }

  private observeChildren() {
    const mo = new MutationObserver(() => this.updateGroup())
    mo.observe(this, { childList: true })
  }

  private updateGroup() {
    const avatars = Array.from(this.querySelectorAll('fluent-avatar')) as HTMLElement[]
    const max = Number(this.getAttribute('max') || String(avatars.length))
    const overlap = this.getAttribute('overlap') || '12px'
    const size = this.getAttribute('size') || ''
    const ring = this.hasAttribute('ring')
    const ringColor = this.getAttribute('ring-color') || ''

    avatars.forEach((a, i) => {
      a.style.zIndex = String(1000 + i)
      a.style.marginLeft = i === 0 ? '0px' : `-${overlap}`
      if (size) a.setAttribute('size', size)
      if (ring) a.setAttribute('ring', '')
      else a.removeAttribute('ring')
      if (ringColor) a.setAttribute('ring-color', ringColor)
      else a.removeAttribute('ring-color')
      if (i < max) a.removeAttribute('hidden')
      else a.setAttribute('hidden', '')
    })

    const extra = Math.max(0, avatars.length - max)
    const overflowEl = this.shadowRootRef.querySelector('.overflow') as HTMLSpanElement | null
    if (overflowEl) {
      if (extra > 0) {
        overflowEl.textContent = `+${extra}`
        overflowEl.hidden = false
      } else {
        overflowEl.hidden = true
        overflowEl.textContent = ''
      }
    }
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentAvatarGroup.tag, FluentAvatarGroup)
}