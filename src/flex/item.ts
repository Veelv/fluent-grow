/**
 * Fluent Grow Flex Item Utility
 * -----------------------------
 * Provides granular control over flex items with optional responsive overrides.
 */

export interface FlexItemConfig {
  flex?: string | number;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: string | number;
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  order?: number;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
}

export interface FlexItemResponsiveConfig {
  query: string;
  config: FlexItemConfig;
}

export class FlexItem {
  private cleanupFns: Array<() => void> = [];

  constructor(private element: HTMLElement, initialConfig: FlexItemConfig = {}) {
    this.config(initialConfig);
  }

  config(config: FlexItemConfig): this {
    Object.entries(config).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }

      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      const cssValue = key === 'flexBasis' && typeof value === 'number' ? `${value}px` : String(value);
      this.element.style.setProperty(cssKey, cssValue);
    });
    return this;
  }

  grow(value: number): this {
    this.element.style.flexGrow = String(value);
    return this;
  }

  shrink(value: number): this {
    this.element.style.flexShrink = String(value);
    return this;
  }

  basis(value: string | number): this {
    this.element.style.flexBasis = typeof value === 'number' ? `${value}px` : value;
    return this;
  }

  alignSelf(value: FlexItemConfig['alignSelf']): this {
    if (value) {
      this.element.style.alignSelf = value;
    }
    return this;
  }

  order(value: number): this {
    this.element.style.order = String(value);
    return this;
  }

  responsive(responsive: FlexItemResponsiveConfig[] | Record<string, FlexItemConfig>, base?: FlexItemConfig): this {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return this;
    }

    const entries = Array.isArray(responsive)
      ? responsive.map((definition) => ({ definition, mql: window.matchMedia(definition.query) }))
      : Object.entries(responsive).map(([query, config]) => ({ definition: { query, config }, mql: window.matchMedia(query) }));

    const sorted = entries.sort((a, b) => extractBreakpointValue(a.definition.query) - extractBreakpointValue(b.definition.query));

    const applyConfig = () => {
      if (base) {
        this.config(base);
      }

      const active = sorted.find((entry) => entry.mql.matches);
      if (active) {
        this.config(active.definition.config);
      }
    };

    sorted.forEach(({ mql }) => {
      const listener = () => applyConfig();
      mql.addEventListener('change', listener);
      this.cleanupFns.push(() => mql.removeEventListener('change', listener));
    });

    applyConfig();
    return this;
  }

  destroy(): void {
    this.cleanupFns.forEach((cleanup) => cleanup());
    this.cleanupFns = [];
  }
}

function extractBreakpointValue(query: string): number {
  const numeric = query.match(/([0-9]+\.?[0-9]*)/);
  if (numeric && numeric[1]) {
    return parseFloat(numeric[1]);
  }
  return 0;
}

