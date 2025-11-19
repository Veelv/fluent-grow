/**
 * Fluent Grow Grid Item Utility
 * -----------------------------
 * Offers a fluent API for configuring individual grid items, including span,
 * placement and responsive declarations.
 */

export interface GridItemConfig {
  column?: string;
  row?: string;
  columnSpan?: number;
  rowSpan?: number;
  area?: string;
  justifySelf?: 'start' | 'end' | 'center' | 'stretch';
  alignSelf?: 'start' | 'end' | 'center' | 'stretch';
  placeSelf?: 'auto' | 'start' | 'end' | 'center' | 'stretch';
  order?: number;
}

export interface GridItemResponsiveConfig {
  query: string;
  config: GridItemConfig;
}

export class GridItem {
  private cleanupFns: Array<() => void> = [];

  constructor(private element: HTMLElement, initialConfig: GridItemConfig = {}) {
    this.config(initialConfig);
  }

  config(config: GridItemConfig): this {
    Object.entries(config).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }

      switch (key) {
        case 'column':
          this.element.style.gridColumn = value as string;
          break;
        case 'row':
          this.element.style.gridRow = value as string;
          break;
        case 'columnSpan':
          this.element.style.gridColumn = `span ${value}`;
          break;
        case 'rowSpan':
          this.element.style.gridRow = `span ${value}`;
          break;
        case 'area':
          this.element.style.gridArea = value as string;
          break;
        default:
          this.element.style.setProperty(key.replace(/([A-Z])/g, '-$1').toLowerCase(), String(value));
      }
    });

    return this;
  }

  place(column: string, row: string): this {
    this.element.style.gridColumn = column;
    this.element.style.gridRow = row;
    return this;
  }

  responsive(responsive: GridItemResponsiveConfig[] | Record<string, GridItemConfig>, base?: GridItemConfig): this {
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

