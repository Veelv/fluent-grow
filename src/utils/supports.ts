export function supportsContainerQueries(): boolean {
  return typeof CSS !== 'undefined' && CSS.supports('container-type', 'inline-size');
}

export function supportsViewTransitions(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document;
}

export function supportsAnchorPositioning(): boolean {
  return typeof CSS !== 'undefined' && CSS.supports('position-anchor', 'center');
}

export function supportsColorMix(): boolean {
  // CSS.supports for colors uses "property: value" syntax
  return typeof CSS !== 'undefined' && CSS.supports('color', 'color-mix(in srgb, black 50%, white)');
}

export function supportsDisplayP3(): boolean {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(color-gamut: p3)').matches;
  }
  // Fallback quick check
  return typeof CSS !== 'undefined' && CSS.supports('color', 'color(display-p3 1 0 0)');
}

export function supportsHDR(): boolean {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(dynamic-range: high)').matches;
  }
  return false;
}

export function supportsHasSelector(): boolean {
  return typeof CSS !== 'undefined' && CSS.supports('selector(:has(*))');
}

export function supportsCascadeLayers(): boolean {
  // Heuristic: @layer support is not detectable via CSS.supports; use a conservative check
  try {
    // Some engines expose CSSLayerBlockRule when supported
    return typeof (globalThis as any).CSSLayerBlockRule !== 'undefined';
  } catch {
    return false;
  }
}

