export interface CSSProperties {
  [property: string]: string | number | undefined;
}

export function applyStyles(element: HTMLElement, styles: CSSProperties): void {
  Object.entries(styles).forEach(([property, value]) => {
    if (value !== undefined && value !== null) {
      element.style.setProperty(property, String(value));
    }
  });
}

export function createStyleSheet(styles: Record<string, CSSProperties>): CSSStyleSheet {
  const cssText = Object.entries(styles)
    .map(([selector, properties]) => {
      const declarations = Object.entries(properties)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([property, value]) => `${property}: ${value}`)
        .join('; ');
      return declarations ? `${selector} { ${declarations} }` : '';
    })
    .filter(Boolean)
    .join('\n');

  if (typeof (globalThis as any).CSSStyleSheet !== 'undefined') {
    const sheet = new (globalThis as any).CSSStyleSheet();
    if (cssText) {
      sheet.replaceSync(cssText);
    }
    return sheet as CSSStyleSheet;
  }

  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = cssText;
    document.head.appendChild(style);
    return (style.sheet as unknown) as CSSStyleSheet;
  }

  return ({ replaceSync: () => {} } as unknown) as CSSStyleSheet;
}

export function isPropertySupported(property: string, value: string): boolean {
  return typeof CSS !== 'undefined' && CSS.supports(property, value);
}

export function isSelectorSupported(selector: string): boolean {
  try {
    return typeof CSS !== 'undefined' && CSS.supports('selector', selector);
  } catch {
    return false;
  }
}

