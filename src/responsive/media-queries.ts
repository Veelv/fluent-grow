/**
 * Media Query Utilities
 * ---------------------
 * Unified helpers for observing media queries, with syntactic sugar for the
 * registered breakpoints.
 */

import { BreakpointManager } from './breakpoints';

type Listener = (matches: boolean) => void;

const queryListeners = new Map<string, Set<Listener>>();
const controllerCache = new Map<string, MediaQueryList>();

export function watchMediaQuery(query: string, listener: Listener): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
    return () => undefined;
  }

  const mql = getMediaQueryList(query);
  const listeners = queryListeners.get(query) ?? new Set<Listener>();
  listeners.add(listener);
  queryListeners.set(query, listeners);

  const handler = (event: MediaQueryListEvent) => listener(event.matches);
  mql.addEventListener('change', handler);
  listener(mql.matches);

  return () => {
    mql.removeEventListener('change', handler);
    listeners.delete(listener);
    if (listeners.size === 0) {
      queryListeners.delete(query);
      controllerCache.delete(query);
    }
  };
}

export function watchBreakpoint(name: string, comparison: 'min' | 'max' = 'min', listener: Listener): () => void {
  const query = BreakpointManager.query(name, comparison);
  return watchMediaQuery(query, listener);
}

function getMediaQueryList(query: string): MediaQueryList {
  if (!controllerCache.has(query)) {
    controllerCache.set(query, window.matchMedia(query));
  }
  return controllerCache.get(query)!;
}

// Modern preference/media helpers
export const MQ = {
  prefersReducedMotion: '(prefers-reduced-motion: reduce)',
  prefersMoreContrast: '(prefers-contrast: more)',
  prefersLessContrast: '(prefers-contrast: less)',
  colorSchemeDark: '(prefers-color-scheme: dark)',
  colorSchemeLight: '(prefers-color-scheme: light)',
  dynamicRangeHigh: '(dynamic-range: high)'
} as const;

export function watchPrefersReducedMotion(listener: Listener): () => void {
  return watchMediaQuery(MQ.prefersReducedMotion, listener);
}

export function watchPrefersContrast(listener: Listener): () => void {
  // Fire for either more/less to let consumer decide
  const offMore = watchMediaQuery(MQ.prefersMoreContrast, listener);
  const offLess = watchMediaQuery(MQ.prefersLessContrast, listener);
  return () => {
    offMore();
    offLess();
  };
}

export function watchColorScheme(listener: (scheme: 'dark' | 'light' | 'no-preference') => void): () => void {
  const notify = () => {
    const dark = typeof window !== 'undefined' && window.matchMedia?.(MQ.colorSchemeDark).matches;
    const light = typeof window !== 'undefined' && window.matchMedia?.(MQ.colorSchemeLight).matches;
    listener(dark ? 'dark' : light ? 'light' : 'no-preference');
  };
  const offDark = watchMediaQuery(MQ.colorSchemeDark, () => notify());
  const offLight = watchMediaQuery(MQ.colorSchemeLight, () => notify());
  notify();
  return () => {
    offDark();
    offLight();
  };
}

export function watchDynamicRange(listener: Listener): () => void {
  return watchMediaQuery(MQ.dynamicRangeHigh, listener);
}

