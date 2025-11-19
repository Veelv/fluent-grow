/**
 * Fluent Grow Grid Container Utility
 * ----------------------------------
 * Provides a fluent API around CSS Grid with responsive breakpoints and
 * container query support.
 */

export type GridGapValue = string | number;

export interface GridContainerConfig {
  columns?: string;
  rows?: string;
  areas?: string[];
  gap?: GridGapValue;
  rowGap?: GridGapValue;
  columnGap?: GridGapValue;
  justifyItems?: 'start' | 'end' | 'center' | 'stretch';
  alignItems?: 'start' | 'end' | 'center' | 'stretch';
  justifyContent?: 'start' | 'end' | 'center' | 'stretch' | 'space-around' | 'space-between' | 'space-evenly';
  alignContent?: 'start' | 'end' | 'center' | 'stretch' | 'space-around' | 'space-between' | 'space-evenly';
  autoColumns?: string;
  autoRows?: string;
  autoFlow?: 'row' | 'column' | 'row dense' | 'column dense';
  inline?: boolean;
}

export interface GridResponsiveConfig {
  query: string;
  config: GridContainerConfig;
}

export type GridResponsiveMap = Record<string, GridContainerConfig>;

export interface GridContainerQueryConfig {
  query: string;
  config: GridContainerConfig;
}

export interface GridContainerQueryOptions {
  base?: GridContainerConfig;
  type?: 'inline-size' | 'block-size';
  name?: string;
}

export class GridContainer {
  private cleanupFns: Array<() => void> = [];

  constructor(private element: HTMLElement, initialConfig: GridContainerConfig = {}) {
    this.element.style.display = initialConfig.inline ? 'inline-grid' : 'grid';
    this.config(initialConfig);
  }

  config(config: GridContainerConfig): this {
    Object.entries(config).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }

      switch (key) {
        case 'columns':
          this.element.style.gridTemplateColumns = value as string;
          break;
        case 'rows':
          this.element.style.gridTemplateRows = value as string;
          break;
        case 'areas':
          this.element.style.gridTemplateAreas = formatAreas(value as string[]);
          break;
        case 'inline':
          this.element.style.display = value ? 'inline-grid' : 'grid';
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

  columns(value: string): this {
    this.element.style.gridTemplateColumns = value;
    return this;
  }

  rows(value: string): this {
    this.element.style.gridTemplateRows = value;
    return this;
  }

  areas(value: string[]): this {
    this.element.style.gridTemplateAreas = formatAreas(value);
    return this;
  }

  gap(value: GridGapValue): this {
    this.element.style.gap = formatGap(value);
    return this;
  }

  responsive(responsive: GridResponsiveConfig[] | GridResponsiveMap, strategy: 'mobile-first' | 'desktop-first' = 'mobile-first', base?: GridContainerConfig): this {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return this;
    }

    const entries = normaliseResponsive(responsive, strategy);

    const applyConfig = () => {
      if (base) {
        this.config(base);
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

  containerQueries(configs: GridContainerQueryConfig[] | Record<string, GridContainerConfig>, options: GridContainerQueryOptions = {}): this {
    if (typeof ResizeObserver === 'undefined') {
      return this;
    }

    this.element.style.containerType = options.type ?? 'inline-size';
    if (options.name) {
      this.element.style.containerName = options.name;
    }

    const queries = Array.isArray(configs)
      ? configs
      : Object.entries(configs).map(([query, config]) => ({ query, config }));

    const resolver = queries.map((definition) => ({
      definition,
      test: createConditionTester(definition.query)
    }));

    const apply = (rect: DOMRectReadOnly) => {
      if (options.base) {
        this.config(options.base);
      }

      for (const entry of resolver) {
        if (entry.test(rect)) {
          this.config(entry.definition.config);
          break;
        }
      }
    };

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => apply(entry.contentRect));
    });

    observer.observe(this.element);
    this.cleanupFns.push(() => observer.disconnect());

    apply(this.element.getBoundingClientRect());
    return this;
  }

  destroy(): void {
    this.cleanupFns.forEach((cleanup) => cleanup());
    this.cleanupFns = [];
  }
}

function formatGap(value: GridGapValue): string {
  return typeof value === 'number' ? `${value}px` : value;
}

function formatAreas(areas: string[]): string {
  return areas.map((area) => `"${area}"`).join(' ');
}

function normaliseResponsive(responsive: GridResponsiveConfig[] | GridResponsiveMap, strategy: 'mobile-first' | 'desktop-first') {
  const list: GridResponsiveConfig[] = Array.isArray(responsive)
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

function createConditionTester(condition: string): (rect: DOMRectReadOnly) => boolean {
  const normalized = condition.trim().toLowerCase();
  const match = normalized.match(/(width|height)\s*(>=|<=|>|<)\s*([0-9]+\.?[0-9]*)(px)?/);

  if (!match) {
    return () => false;
  }

  const [, dimension, operator, value] = match;
  if (!dimension || !operator || !value) {
    return () => false;
  }

  const numericValue = parseFloat(value);

  return (rect: DOMRectReadOnly) => {
    const target = dimension === 'height' ? rect.height : rect.width;
    switch (operator) {
      case '>=':
        return target >= numericValue;
      case '<=':
        return target <= numericValue;
      case '>':
        return target > numericValue;
      case '<':
        return target < numericValue;
      default:
        return false;
    }
  };
}

function toCssProperty(property: string): string {
  return property.replace(/([A-Z])/g, '-$1').toLowerCase();
}

