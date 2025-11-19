/**
 * Fluent Grow Flex Container Utility
 * ----------------------------------
 * Provides a fluent API for configuring complex flexbox layouts with responsive
 * variants and lifecycle management.
 */

export type GapValue = string | number;

export interface FlexContainerConfig {
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  align?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
  alignContent?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
  gap?: GapValue;
  rowGap?: GapValue;
  columnGap?: GapValue;
  inline?: boolean;
  minHeight?: string;
  minWidth?: string;
}

export interface FlexResponsiveConfig {
  query: string;
  config: FlexContainerConfig;
}

export type FlexResponsiveMap = Record<string, FlexContainerConfig>;

export interface ResponsiveOptions {
  base?: FlexContainerConfig;
  strategy?: 'mobile-first' | 'desktop-first';
}

export class FlexContainer {
  private cleanupFns: Array<() => void> = [];

  constructor(private element: HTMLElement, initialConfig: FlexContainerConfig = {}) {
    this.element.style.display = initialConfig.inline ? 'inline-flex' : 'flex';
    this.config(initialConfig);
  }

  config(config: FlexContainerConfig): this {
    Object.entries(config).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }

      switch (key) {
        case 'direction':
          this.element.style.flexDirection = value as string;
          break;
        case 'wrap':
          this.element.style.flexWrap = value as string;
          break;
        case 'justify':
          this.element.style.justifyContent = value as string;
          break;
        case 'align':
          this.element.style.alignItems = value as string;
          break;
        case 'inline':
          this.element.style.display = value ? 'inline-flex' : 'flex';
          break;
        case 'gap':
        case 'rowGap':
        case 'columnGap':
          this.element.style.setProperty(toCssProperty(key), formatGap(value));
          break;
        default:
          this.element.style.setProperty(toCssProperty(key), String(value));
      }
    });

    return this;
  }

  direction(value: FlexContainerConfig['direction']): this {
    if (value) {
      this.element.style.flexDirection = value;
    }
    return this;
  }

  wrap(value: FlexContainerConfig['wrap'] = 'wrap'): this {
    this.element.style.flexWrap = value;
    return this;
  }

  gap(value: GapValue): this {
    this.element.style.gap = formatGap(value);
    return this;
  }

  justify(value: FlexContainerConfig['justify']): this {
    if (value) {
      this.element.style.justifyContent = value;
    }
    return this;
  }

  align(value: FlexContainerConfig['align']): this {
    if (value) {
      this.element.style.alignItems = value;
    }
    return this;
  }

  responsive(responsive: FlexResponsiveConfig[] | FlexResponsiveMap, options: ResponsiveOptions = {}): this {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return this;
    }

    const entries = normaliseResponsive(responsive, options.strategy);
    const applyConfig = () => {
      if (options.base) {
        this.config(options.base);
      }

      const active = entries.find((entry) => entry.mql.matches);
      if (active) {
        this.config(active.definition.config);
      }
    };

    entries.forEach(({ mql }) => {
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

function formatGap(value: GapValue): string {
  return typeof value === 'number' ? `${value}px` : value;
}

function normaliseResponsive(responsive: FlexResponsiveConfig[] | FlexResponsiveMap, strategy: ResponsiveOptions['strategy']): Array<{ definition: FlexResponsiveConfig; mql: MediaQueryList; }> {
  const list: FlexResponsiveConfig[] = Array.isArray(responsive)
    ? responsive
    : Object.entries(responsive).map(([query, config]) => ({ query, config }));

  return list
    .map((definition) => ({ definition, mql: window.matchMedia(definition.query) }))
    .sort((a, b) => {
      const delta = extractBreakpointValue(a.definition.query) - extractBreakpointValue(b.definition.query);
      return strategy === 'desktop-first' ? -delta : delta;
    });
}

function extractBreakpointValue(query: string): number {
  const numeric = query.match(/([0-9]+\.?[0-9]*)/);
  if (numeric && numeric[1]) {
    return parseFloat(numeric[1]);
  }
  return 0;
}

function toCssProperty(property: string): string {
  return property.replace(/([A-Z])/g, '-$1').toLowerCase();
}

