/**
 * Typography Scales
 * -----------------
 * Maintains a registry of type scales sourced from defaults and design tokens.
 */

import type { TokenGroup } from '../core/config';
import { watchTokens } from '../core/token-manager';

export interface TypographyScaleDefinition {
  fontSize: string;
  lineHeight: string;
  letterSpacing?: string;
  fontWeight?: string | number;
  fontFamily?: string;
}

export type TypographyScaleName = string;

const DEFAULT_SCALES: Record<TypographyScaleName, TypographyScaleDefinition> = {
  'display-2': { fontSize: '3.5rem', lineHeight: '1.1', letterSpacing: '-0.04em', fontWeight: '700' },
  'display-1': { fontSize: '3rem', lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '700' },
  headline: { fontSize: '2.25rem', lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' },
  title: { fontSize: '1.75rem', lineHeight: '1.3', letterSpacing: '-0.005em', fontWeight: '600' },
  subtitle: { fontSize: '1.25rem', lineHeight: '1.4', fontWeight: '500' },
  body: { fontSize: '1rem', lineHeight: '1.6', fontWeight: '400' },
  'body-sm': { fontSize: '0.9375rem', lineHeight: '1.5', fontWeight: '400' },
  caption: { fontSize: '0.8125rem', lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '500' },
  label: { fontSize: '0.75rem', lineHeight: '1.3', letterSpacing: '0.08em', fontWeight: '600', fontFamily: 'var(--fluent-font-family-label, inherit)' },
  code: { fontSize: '0.875rem', lineHeight: '1.5', letterSpacing: '0.02em', fontFamily: 'var(--fluent-font-family-code, "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace)' }
};

const scaleRegistry = new Map<string, TypographyScaleDefinition>(Object.entries(DEFAULT_SCALES));
const listeners = new Set<(name: TypographyScaleName, definition: TypographyScaleDefinition) => void>();
let tokensHandled = false;

watchTokens((tokens) => {
  const typographyTokens = tokens.typography as TokenGroup | undefined;
  const scalesToken = typographyTokens?.scales as TokenGroup | undefined;
  if (!scalesToken) {
    return;
  }
  tokensHandled = true;
  Object.entries(scalesToken).forEach(([name, value]) => {
    const definition = parseScaleToken(value as TokenGroup | string | number | undefined);
    if (definition) {
      registerScale(name, definition);
    }
  });
});

export function registerScale(name: TypographyScaleName, definition: TypographyScaleDefinition): void {
  scaleRegistry.set(name, sanitizeDefinition(definition));
  emitChange(name, getScale(name));
}

export function extendScales(partial: Record<TypographyScaleName, Partial<TypographyScaleDefinition>>): void {
  Object.entries(partial).forEach(([name, definition]) => {
    const existing = scaleRegistry.get(name) ?? DEFAULT_SCALES[name];
    if (!existing) {
      if (!definition.fontSize || !definition.lineHeight) {
        throw new Error(`Cannot extend scale "${name}" without providing at least fontSize and lineHeight.`);
      }
      registerScale(name, sanitizeDefinition(definition as TypographyScaleDefinition));
      return;
    }

    const merged: TypographyScaleDefinition = {
      fontSize: definition.fontSize ?? existing.fontSize,
      lineHeight: definition.lineHeight ?? existing.lineHeight
    };

    if (definition.letterSpacing !== undefined) {
      merged.letterSpacing = definition.letterSpacing;
    } else if (existing.letterSpacing !== undefined) {
      merged.letterSpacing = existing.letterSpacing;
    }

    if (definition.fontWeight !== undefined) {
      merged.fontWeight = definition.fontWeight;
    } else if (existing.fontWeight !== undefined) {
      merged.fontWeight = existing.fontWeight;
    }

    if (definition.fontFamily !== undefined) {
      merged.fontFamily = definition.fontFamily;
    } else if (existing.fontFamily !== undefined) {
      merged.fontFamily = existing.fontFamily;
    }

    registerScale(name, merged);
  });
}

export function getScale(name: TypographyScaleName): TypographyScaleDefinition {
  const definition = scaleRegistry.get(name);
  if (!definition) {
    throw new Error(`Unknown typography scale "${name}". Define it via tokens or registerScale().`);
  }
  return definition;
}

export function getScaleNames(): TypographyScaleName[] {
  return Array.from(scaleRegistry.keys());
}

export function onScalesChange(listener: (name: TypographyScaleName, definition: TypographyScaleDefinition) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function hasTokenDrivenScales(): boolean {
  return tokensHandled;
}

function parseScaleToken(token: TokenGroup | string | number | undefined): TypographyScaleDefinition | undefined {
  if (!token) {
    return undefined;
  }

  if (typeof token === 'string') {
    return { fontSize: token, lineHeight: '1.5' };
  }

  if (typeof token === 'number') {
    return { fontSize: `${token}`, lineHeight: '1.5' };
  }

  const fontSize = token.fontSize ?? token.size ?? token['font-size'];
  const lineHeight = token.lineHeight ?? token.leading ?? token['line-height'];

  if (!fontSize) {
    return undefined;
  }

  const definition: TypographyScaleDefinition = {
    fontSize: String(fontSize),
    lineHeight: String(lineHeight ?? '1.5')
  };

  const letterSpacing = (token.letterSpacing ?? token['letter-spacing']) as string | undefined;
  if (letterSpacing !== undefined) {
    definition.letterSpacing = String(letterSpacing);
  }

  const fontWeight = (token.fontWeight ?? token['font-weight']) as string | number | undefined;
  if (fontWeight !== undefined) {
    definition.fontWeight = fontWeight;
  }

  const fontFamily = (token.fontFamily ?? token['font-family']) as string | undefined;
  if (fontFamily !== undefined) {
    definition.fontFamily = fontFamily;
  }

  return definition;
}

function sanitizeDefinition(definition: TypographyScaleDefinition): TypographyScaleDefinition {
  const sanitized: TypographyScaleDefinition = {
    fontSize: definition.fontSize,
    lineHeight: definition.lineHeight
  };

  const letterSpacing = definition.letterSpacing;
  if (letterSpacing !== undefined) {
    sanitized.letterSpacing = letterSpacing;
  }

  const fontWeight = definition.fontWeight;
  if (fontWeight !== undefined) {
    sanitized.fontWeight = fontWeight;
  }

  const fontFamily = definition.fontFamily;
  if (fontFamily !== undefined) {
    sanitized.fontFamily = fontFamily;
  }

  return sanitized;
}

function emitChange(name: TypographyScaleName, definition: TypographyScaleDefinition): void {
  listeners.forEach((listener) => {
    try {
      listener(name, definition);
    } catch (error) {
      if (typeof console !== 'undefined') {
        console.error('[Typography] scale listener failed', error);
      }
    }
  });
}

