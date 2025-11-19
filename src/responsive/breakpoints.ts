/**
 * Responsive Breakpoint Manager
 * -----------------------------
 * Watches design tokens to derive breakpoint values, exposes helpers to build
 * media queries, and keeps CSS custom properties in sync.
 */

import type { TokenGroup } from '../core/config';
import { watchTokens } from '../core/token-manager';

export interface BreakpointDescriptor {
  name: string;
  min?: number;
  max?: number;
  container?: number;
}

export type BreakpointInput = Array<BreakpointDescriptor> | Record<string, number | Partial<BreakpointDescriptor>>;

interface BreakpointListener {
  unsubscribe: () => void;
}

const DEFAULT_BREAKPOINTS: BreakpointDescriptor[] = [
  { name: 'xs', min: 0, max: 479, container: 360 },
  { name: 'sm', min: 480, max: 767, container: 540 },
  { name: 'md', min: 768, max: 1023, container: 720 },
  { name: 'lg', min: 1024, max: 1439, container: 960 },
  { name: 'xl', min: 1440, max: 1919, container: 1140 },
  { name: 'xxl', min: 1920, container: 1320 }
];

const registry = new Map<string, BreakpointDescriptor>();
let sortedBreakpoints: BreakpointDescriptor[] = [];
const matchListeners = new Map<string, Set<(matches: boolean) => void>>();
const mediaCache = new Map<string, MediaQueryList>();
let tokensUnsubscribe: (() => void) | undefined;
let initialised = false;

export class BreakpointManager {
  /**
   * Ensures the registry is populated with defaults and token synchronisation
   * is in place.
   */
  static initialize(): void {
    if (initialised) {
      return;
    }
    this.configure(DEFAULT_BREAKPOINTS);
    tokensUnsubscribe = watchTokens((tokens) => {
      const responsive = tokens.responsive as TokenGroup | undefined;
      const breakpointGroup = responsive?.breakpoints as TokenGroup | undefined;
      if (breakpointGroup) {
        const parsed = parseBreakpointTokens(breakpointGroup);
        if (parsed.length) {
          this.configure(parsed);
        }
      }
    });
    initialised = true;
  }

  /**
   * Replaces the current breakpoint registry with the provided definitions.
   */
  static configure(input: BreakpointInput): void {
    const entries = normaliseInput(input);
    registry.clear();
    entries.forEach((definition) => {
      registry.set(definition.name, definition);
    });
    sortedBreakpoints = entries.slice().sort((a, b) => (a.min ?? 0) - (b.min ?? 0));
    syncCustomProperties();
    refreshListeners();
  }

  /**
   * Returns a shallow copy of the current breakpoint descriptors.
   */
  static all(): BreakpointDescriptor[] {
    this.initialize();
    return sortedBreakpoints.slice();
  }

  /**
   * Retrieves a breakpoint by name.
   */
  static get(name: string): BreakpointDescriptor | undefined {
    this.initialize();
    return registry.get(name);
  }

  /**
   * Returns the container width associated with a breakpoint, if available.
   */
  static containerWidth(name: string): number | undefined {
    return this.get(name)?.container;
  }

  /**
   * Returns the minimum width in pixels for the given breakpoint.
   */
  static min(name: string): number | undefined {
    return this.get(name)?.min;
  }

  /**
   * Returns the maximum width in pixels for the given breakpoint. If the
   * descriptor does not specify a max, the method derives one from the next
   * registered breakpoint.
   */
  static max(name: string): number | undefined {
    const descriptor = this.get(name);
    if (!descriptor) {
      return undefined;
    }
    if (descriptor.max !== undefined) {
      return descriptor.max;
    }
    const next = nextBreakpoint(descriptor.name);
    if (next?.min !== undefined) {
      return next.min - 0.02;
    }
    return undefined;
  }

  /**
   * Produces a media query string for the specified breakpoint and comparison.
   */
  static query(name: string, comparison: 'min' | 'max' | 'between' = 'min', to?: string): string {
    this.initialize();
    const descriptor = registry.get(name);
    if (!descriptor) {
      throw new Error(`Breakpoint "${name}" is not registered.`);
    }
    switch (comparison) {
      case 'min': {
        const value = descriptor.min ?? 0;
        return `(min-width: ${value}px)`;
      }
      case 'max': {
        const value = this.max(name);
        if (value === undefined) {
          throw new Error(`Breakpoint "${name}" does not expose a max value.`);
        }
        return `(max-width: ${value}px)`;
      }
      case 'between': {
        if (!to) {
          throw new Error('The "between" comparison requires the "to" breakpoint name.');
        }
        const upper = registry.get(to);
        if (!upper) {
          throw new Error(`Breakpoint "${to}" is not registered.`);
        }
        const minValue = descriptor.min ?? 0;
        const maxValue = upper.min ? upper.min - 0.02 : upper.max;
        if (maxValue === undefined) {
          throw new Error(`Unable to derive a maximum boundary for "${name}" -> "${to}".`);
        }
        return `(min-width: ${minValue}px) and (max-width: ${maxValue}px)`;
      }
      default:
        return '(min-width: 0px)';
    }
  }

  /**
   * Produces a container condition string compatible with container queries.
   */
  static condition(name: string, comparison: 'min' | 'max' | 'between' = 'min', to?: string): string {
    const descriptor = this.get(name);
    if (!descriptor) {
      throw new Error(`Breakpoint "${name}" is not registered.`);
    }
    switch (comparison) {
      case 'min':
        return `width >= ${descriptor.min ?? 0}px`;
      case 'max': {
        const value = this.max(name);
        if (value === undefined) {
          throw new Error(`Breakpoint "${name}" does not expose a max value.`);
        }
        return `width <= ${value}px`;
      }
      case 'between': {
        if (!to) {
          throw new Error('The "between" comparison requires the "to" breakpoint name.');
        }
        const upper = this.get(to);
        if (!upper) {
          throw new Error(`Breakpoint "${to}" is not registered.`);
        }
        const minValue = descriptor.min ?? 0;
        const maxValue = upper.min ? upper.min - 0.02 : upper.max;
        if (maxValue === undefined) {
          throw new Error(`Unable to derive a maximum boundary for "${name}" -> "${to}".`);
        }
        return `width >= ${minValue}px and width <= ${maxValue}px`;
      }
      default:
        return 'width >= 0px';
    }
  }

  /**
   * Observes a single breakpoint using matchMedia.
   */
  static observe(name: string, comparison: 'min' | 'max' = 'min', listener: (matches: boolean) => void): BreakpointListener {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return { unsubscribe: () => undefined };
    }
    const query = this.query(name, comparison);
    const mql = getMediaQueryList(query);
    const handler = (event: MediaQueryListEvent) => listener(event.matches);
    mql.addEventListener('change', handler);
    listener(mql.matches);
    const listeners = matchListeners.get(query) ?? new Set();
    listeners.add(listener);
    matchListeners.set(query, listeners);
    return {
      unsubscribe: () => {
        mql.removeEventListener('change', handler);
        listeners.delete(listener);
      }
    };
  }

  /**
   * Generates a map suitable for the responsive helpers (`responsiveSpacing`,
   * `responsiveSizing`, etc.) in the layout system.
   */
  static mapResponsive<T>(mapper: (descriptor: BreakpointDescriptor) => T | undefined, comparison: 'min' | 'max' = 'min'): Record<string, T> {
    this.initialize();
    const result: Record<string, T> = {};
    sortedBreakpoints.forEach((descriptor) => {
      const config = mapper(descriptor);
      if (config !== undefined) {
        result[this.query(descriptor.name, comparison)] = config;
      }
    });
    return result;
  }

  /**
   * Disposes internal listeners (used primarily for testing).
   */
  static teardown(): void {
    tokensUnsubscribe?.();
    tokensUnsubscribe = undefined;
    registry.clear();
    sortedBreakpoints = [];
    matchListeners.clear();
    mediaCache.clear();
    initialised = false;
  }
}

function normaliseInput(input: BreakpointInput): BreakpointDescriptor[] {
  if (Array.isArray(input)) {
    return input.map((entry) => ({ ...entry }));
  }
  return Object.entries(input).map(([name, value]) => {
    if (typeof value === 'number') {
      return { name, min: value };
    }
    const descriptor: BreakpointDescriptor = { name };
    if (value.min !== undefined) {
      descriptor.min = value.min;
    }
    if (value.max !== undefined) {
      descriptor.max = value.max;
    }
    if (value.container !== undefined) {
      descriptor.container = value.container;
    }
    return descriptor;
  });
}

function parseBreakpointTokens(group: TokenGroup): BreakpointDescriptor[] {
  return Object.entries(group)
    .map(([name, raw]) => {
      const descriptor: BreakpointDescriptor = { name };
      if (typeof raw === 'number' || typeof raw === 'string') {
        const minValue = toNumber(raw);
        if (minValue !== undefined) {
          descriptor.min = minValue;
        }
        return descriptor;
      }
      const tokenGroup = raw as TokenGroup;
      const min = toNumber(readTokenValue(tokenGroup, 'min'));
      const max = toNumber(readTokenValue(tokenGroup, 'max'));
      const container = toNumber(readTokenValue(tokenGroup, 'container'));
      if (min !== undefined) {
        descriptor.min = min;
      }
      if (max !== undefined) {
        descriptor.max = max;
      }
      if (container !== undefined) {
        descriptor.container = container;
      }
      return descriptor;
    })
    .filter((descriptor) => descriptor.min !== undefined || descriptor.max !== undefined);
}

function readTokenValue(group: TokenGroup, key: string): string | number | undefined {
  const value = group[key];
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === 'object' && value !== null) {
    return undefined;
  }
  return value;
}

function toNumber(value: string | number | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === 'number') {
    return value;
  }
  const numeric = parseFloat(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function nextBreakpoint(name: string): BreakpointDescriptor | undefined {
  const index = sortedBreakpoints.findIndex((descriptor) => descriptor.name === name);
  if (index === -1) {
    return undefined;
  }
  return sortedBreakpoints[index + 1];
}

function syncCustomProperties(): void {
  if (typeof document === 'undefined') {
    return;
  }
  const root = document.documentElement;
  sortedBreakpoints.forEach((descriptor) => {
    if (descriptor.min !== undefined) {
      root.style.setProperty(`--fluent-breakpoint-${descriptor.name}`, `${descriptor.min}px`);
    }
    if (descriptor.container !== undefined) {
      root.style.setProperty(`--fluent-container-${descriptor.name}`, `${descriptor.container}px`);
    }
  });
}

function refreshListeners(): void {
  if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
    return;
  }
  matchListeners.forEach((listeners, query) => {
    const mql = getMediaQueryList(query);
    const matches = mql.matches;
    listeners.forEach((listener) => listener(matches));
  });
}

function getMediaQueryList(query: string): MediaQueryList {
  if (!mediaCache.has(query)) {
    mediaCache.set(query, window.matchMedia(query));
  }
  return mediaCache.get(query)!;
}

BreakpointManager.initialize();

