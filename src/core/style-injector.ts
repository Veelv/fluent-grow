export interface StyleModule {
  id: string;
  css: string;
  layer?: 'base' | 'components' | 'utilities' | string;
}

interface StyleEntry {
  element?: HTMLStyleElement;
  refCount: number;
  module: StyleModule;
}

const injectedStyles = new Map<string, StyleEntry>();

/**
 * Injects a style module into the document head. When running in SSR mode the
 * CSS string is returned so it can be inlined manually.
 */
export function injectStyle(style: StyleModule): string | void {
  const existing = injectedStyles.get(style.id);

  if (existing) {
    existing.refCount += 1;
    return existing.element ? undefined : existing.module.css;
  }

  const entry: StyleEntry = { refCount: 1, module: style };
  injectedStyles.set(style.id, entry);

  if (typeof document === 'undefined') {
    return style.css;
  }

  const styleElement = document.createElement('style');
  styleElement.setAttribute('data-fluent-style', style.id);

  if (style.layer) {
    styleElement.setAttribute('data-fluent-layer', style.layer);
  }

  styleElement.textContent = style.css;
  document.head.appendChild(styleElement);
  entry.element = styleElement;
}

/**
 * Removes an injected style when no consumers remain.
 */
export function removeStyle(id: string): void {
  const entry = injectedStyles.get(id);
  if (!entry) {
    return;
  }

  entry.refCount -= 1;
  if (entry.refCount > 0) {
    return;
  }

  if (entry.element?.parentElement) {
    entry.element.parentElement.removeChild(entry.element);
  }

  injectedStyles.delete(id);
}

/**
 * Serialises all injected styles – useful when rendering on the server.
 */
export function renderStylesToString(): string {
  return Array.from(injectedStyles.values())
    .map((entry) => `<!-- fluent:${entry.module.id} --><style data-fluent-style="${entry.module.id}">${entry.module.css}</style>`)
    .join('');
}

