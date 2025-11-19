import { FluentComponent } from '../core/fluent-component'

export class FluentAvatar extends FluentComponent {
  static tag = 'fluent-avatar'

  static override get observedAttributes() {
    return ['src', 'alt', 'size', 'shape', 'ring', 'ring-color', 'status', 'initials', 'srcset', 'sizes', 'loading', 'decoding']
  }

  override connectedCallback() {
    super.connectedCallback()
    this.attachImageEvents()
  }

  render() {
    const src = this.getAttribute('src') || ''
    const alt = this.getAttribute('alt') || ''
    const initials = this.getAttribute('initials') || ''
    const srcset = this.getAttribute('srcset') || ''
    const sizes = this.getAttribute('sizes') || ''
    const loading = this.getAttribute('loading') || ''
    const decoding = this.getAttribute('decoding') || ''
    this.shadowRootRef.innerHTML = `
      <div class="avatar" part="container">
        <img class="image" part="image" src="${src}" alt="${alt}" ${srcset ? `srcset=\"${srcset}\"` : ''} ${sizes ? `sizes=\"${sizes}\"` : ''} ${loading ? `loading=\"${loading}\"` : ''} ${decoding ? `decoding=\"${decoding}\"` : ''} />
        <span class="initials" part="initials">${initials}</span>
        <span class="status-dot" part="status"></span>
      </div>
    `
  }

  constructor() {
    super()
    this.recipe = {
      base: { display: 'inline-block', position: 'relative', '--avatar-size': '40px' },
      selectors: {
        '.avatar': { position: 'relative', width: 'var(--avatar-size)', height: 'var(--avatar-size)', 'border-radius': '50%', overflow: 'hidden', display: 'inline-flex', 'align-items': 'center', 'justify-content': 'center', 'background': 'var(--fluent-color-neutral-200)' },
        '.image': { width: '100%', height: '100%', 'object-fit': 'cover', display: 'none' },
        '.initials': { display: 'inline-flex', 'align-items': 'center', 'justify-content': 'center', 'font-weight': '700', 'letter-spacing': '0.03em', color: 'light-dark(var(--fluent-color-neutral-900), var(--fluent-color-neutral-50))' },
        ':host([data-image-ok]) .image': { display: 'block' },
        ':host([data-image-ok]) .initials': { display: 'none' },
        ':host([size="sm"])': { '--avatar-size': '24px' },
        ':host([size="md"])': { '--avatar-size': '40px' },
        ':host([size="lg"])': { '--avatar-size': '56px' },
        ':host([size="xl"])': { '--avatar-size': '80px' },
        ':host([shape="circle"]) .avatar': { 'border-radius': '50%' },
        ':host([shape="square"]) .avatar': { 'border-radius': '0' },
        ':host([shape="rounded"]) .avatar': { 'border-radius': '0.75rem' },
        ':host([ring]) .avatar': { 'box-shadow': '0 0 0 2px var(--fluent-avatar-ring-color, var(--fluent-color-primary-500))' },
        '.status-dot': { position: 'absolute', bottom: '2px', right: '2px', width: '10px', height: '10px', 'border-radius': '50%', 'box-shadow': '0 0 0 2px light-dark(white, var(--fluent-color-neutral-900))', display: 'none' },
        ':host([status]) .status-dot': { display: 'block' },
        ':host([status="online"]) .status-dot': { background: 'var(--fluent-color-success-500)' },
        ':host([status="offline"]) .status-dot': { background: 'var(--fluent-color-neutral-500)' },
        ':host([status="busy"]) .status-dot': { background: 'var(--fluent-color-danger-500)' },
        ':host([status="away"]) .status-dot': { background: 'var(--fluent-color-warning-500)' }
      }
    }
  }

  override attributeChangedCallback(): void {
    super.attributeChangedCallback()
    const ringColor = this.getAttribute('ring-color')
    if (ringColor) this.style.setProperty('--fluent-avatar-ring-color', ringColor)
    else this.style.removeProperty('--fluent-avatar-ring-color')
    this.render()
    this.attachImageEvents()
  }

  private attachImageEvents() {
    const img = this.shadowRootRef.querySelector('.image') as HTMLImageElement | null
    if (!img) return
    img.onload = () => this.setAttribute('data-image-ok', '')
    img.onerror = () => this.removeAttribute('data-image-ok')
  }
}

if (typeof window !== 'undefined') {
  customElements.define(FluentAvatar.tag, FluentAvatar)
}
