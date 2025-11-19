import type { CSSProperties } from '../utils/css-engine';

export type LengthPrimitive = string | number;

export interface TokenReference {
  token: string;
  fallback?: LengthPrimitive | TokenReference;
}

export type LengthValue = LengthPrimitive | TokenReference;

export type ResponsiveStrategy = 'mobile-first' | 'desktop-first';

export interface ResponsiveDefinition<T> {
  query: string;
  config: T;
}

export type ResponsiveInput<T> = Array<ResponsiveDefinition<T>> | Record<string, T>;

export interface ResponsiveOptions<T> {
  base?: T;
  strategy?: ResponsiveStrategy;
}

export type CleanupFn = () => void;

export function resolveLength(value: LengthValue): string {
  if (typeof value === 'number') {
    return `${value}px`;
  }

  if (typeof value === 'string') {
    return value;
  }

  const tokenName = value.token.startsWith('--') ? value.token : `--${value.token}`;
  const fallback = value.fallback !== undefined ? `, ${resolveLength(value.fallback)}` : '';
  return `var(${tokenName}${fallback})`;
}

export function toCssProperty(property: string): string {
  return property.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export function createStyles(): CSSProperties {
  return Object.create(null);
}

export function setStyle(styles: CSSProperties, property: string, value: string | number | undefined): void {
  if (value === undefined) {
    return;
  }

  styles[toCssProperty(property)] = value;
}

export function normaliseResponsive<T>(responsive: ResponsiveInput<T>, strategy: ResponsiveStrategy = 'mobile-first') {
  const list: ResponsiveDefinition<T>[] = Array.isArray(responsive)
    ? responsive
    : Object.entries(responsive).map(([query, config]) => ({ query, config }));

  return list
    .map((definition) => ({ definition, mql: window.matchMedia(definition.query) }))
    .sort((a, b) => {
      const delta = extractBreakpointValue(a.definition.query) - extractBreakpointValue(b.definition.query);
      return strategy === 'desktop-first' ? -delta : delta;
    });
}

export function observeResponsive<T>(
  responsive: ResponsiveInput<T>,
  apply: (config: T) => void,
  registerCleanup: (fn: CleanupFn) => void,
  options: ResponsiveOptions<T> = {}
): void {
  if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
    return;
  }

  const entries = normaliseResponsive(responsive, options.strategy);

  const run = () => {
    if (options.base) {
      apply(options.base);
    }

    const active = entries.find((entry) => entry.mql.matches);
    if (active) {
      apply(active.definition.config);
    }
  };

  entries.forEach(({ mql }) => {
    const listener = () => run();
    mql.addEventListener('change', listener);
    registerCleanup(() => mql.removeEventListener('change', listener));
  });

  run();
}

export function extractBreakpointValue(query: string): number {
  const numeric = query.match(/([0-9]+\.?[0-9]*)/);
  if (numeric && numeric[1]) {
    return parseFloat(numeric[1]);
  }
  return 0;
}
