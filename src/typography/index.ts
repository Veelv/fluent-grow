/**
 * Fluent Grow Typography System
 * -----------------------------
 * Provides a fluent API for applying typographic styles sourced from
 * design tokens, fluid scales and responsive breakpoints.
 */

import { applyStyles } from '../utils/css-engine';
import type { CSSProperties } from '../utils/css-engine';
import { BreakpointManager } from '../responsive/breakpoints';
import { observeResponsive, type CleanupFn, type ResponsiveInput, type ResponsiveOptions } from '../layout/shared';
import type { TokenGroup } from '../core/config';
import { watchTokens } from '../core/token-manager';
import { fluidTypography, type FluidTypographyOptions } from './fluid';
import {
  getScale,
  getScaleNames,
  onScalesChange,
  type TypographyScaleDefinition,
  type TypographyScaleName
} from './scales';

export type ResponsiveTypographyMap = ResponsiveInput<TypographyConfig>;

export interface TypographyConfig extends CSSProperties {
  fontSize?: string | number;
  lineHeight?: string | number;
  letterSpacing?: string | number;
  fontWeight?: string | number;
  fontFamily?: string;
}

export class Typography {
  private cleanupFns: CleanupFn[] = [];
  private activeScale?: TypographyScaleName;

  constructor(private element: HTMLElement) {
    TypographySystem.initialize();
    this.registerCleanup(
      onScalesChange((name, definition) => {
        if (this.activeScale === name) {
          this.applyScaleDefinition(definition);
        }
      })
    );
  }

  set(config: TypographyConfig): this {
    this.apply(config);
    return this;
  }

  scale(name: TypographyScaleName): this {
    const definition = getScale(name);
    this.activeScale = name;
    this.applyScaleDefinition(definition);
    return this;
  }

  weight(value: string | number): this {
    this.apply({ fontWeight: value });
    return this;
  }

  leading(value: string | number): this {
    this.apply({ lineHeight: value });
    return this;
  }

  tracking(value: string | number): this {
    this.apply({ letterSpacing: typeof value === 'number' ? `${value}em` : value });
    return this;
  }

  family(value: string): this {
    this.apply({ fontFamily: value });
    return this;
  }

  familyToken(name: string): this {
    this.apply({ fontFamily: `var(--fluent-font-family-${name}, inherit)` });
    return this;
  }

  color(value: string): this {
    this.apply({ color: value });
    return this;
  }

  transform(value: CSSProperties['textTransform']): this {
    this.apply({ textTransform: value });
    return this;
  }

  uppercase(): this {
    return this.transform('uppercase');
  }

  lowercase(): this {
    return this.transform('lowercase');
  }

  capitalize(): this {
    return this.transform('capitalize');
  }

  fluid(options: FluidTypographyOptions): this {
    const value = fluidTypography(options);
    this.apply({ fontSize: value });
    return this;
  }

  featureSettings(value: string): this {
    this.apply({ fontFeatureSettings: value });
    return this;
  }

  truncate(lines = 1): this {
    this.apply({
      display: '-webkit-box',
      overflow: 'hidden',
      'text-overflow': 'ellipsis',
      '-webkit-box-orient': 'vertical',
      '-webkit-line-clamp': String(lines)
    });
    return this;
  }

  wrap(strategy: 'balance' | 'pretty' | 'stable' | 'nowrap' = 'balance'): this {
    if (strategy === 'nowrap') {
      this.apply({ 'white-space': 'nowrap', 'text-wrap': 'nowrap' });
    } else {
      this.apply({ 'white-space': 'normal', 'text-wrap': strategy });
    }
    return this;
  }

  responsive(map: ResponsiveTypographyMap, options: ResponsiveOptions<TypographyConfig> = {}): this {
    const normalised = Array.isArray(map) ? map : this.normaliseBreakpointMap(map);
    observeResponsive(normalised, (config) => this.apply(config), (fn) => this.registerCleanup(fn), options);
    return this;
  }

  responsiveScale(map: Record<string, TypographyScaleName>, options: ResponsiveOptions<TypographyConfig> = {}): this {
    const configMap: Record<string, TypographyConfig> = {};
    Object.entries(map).forEach(([breakpoint, scaleName]) => {
      const query = this.resolveBreakpointQuery(breakpoint);
      const definition = getScale(scaleName);
      configMap[query] = this.scaleDefinitionToConfig(definition);
    });
    return this.responsive(configMap, options);
  }

  responsiveFluid(map: Record<string, FluidTypographyOptions>, options: ResponsiveOptions<TypographyConfig> = {}): this {
    const configMap: Record<string, TypographyConfig> = {};
    Object.entries(map).forEach(([breakpoint, fluidOptions]) => {
      configMap[this.resolveBreakpointQuery(breakpoint)] = { fontSize: fluidTypography(fluidOptions) };
    });
    return this.responsive(configMap, options);
  }

  resetTransform(): this {
    this.apply({ textTransform: 'none' });
    return this;
  }

  destroy(): void {
    this.cleanupFns.forEach((cleanup) => cleanup());
    this.cleanupFns = [];
  }

  private applyScaleDefinition(definition: TypographyScaleDefinition): void {
    this.apply(this.scaleDefinitionToConfig(definition));
  }

  private scaleDefinitionToConfig(definition: TypographyScaleDefinition): TypographyConfig {
    const config: TypographyConfig = {
      fontSize: definition.fontSize,
      lineHeight: definition.lineHeight
    };
    if (definition.letterSpacing !== undefined) {
      config.letterSpacing = definition.letterSpacing;
    }
    if (definition.fontWeight !== undefined) {
      config.fontWeight = definition.fontWeight;
    }
    if (definition.fontFamily !== undefined) {
      config.fontFamily = definition.fontFamily;
    }
    return config;
  }

  private apply(config: TypographyConfig): void {
    const styles: CSSProperties = {};
    Object.entries(config).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }
      styles[key] = value as string | number;
    });
    applyStyles(this.element, styles);
  }

  private resolveBreakpointQuery(label: string): string {
    const trimmed = label.trim();
    if (trimmed.startsWith('(')) {
      return trimmed;
    }
    return BreakpointManager.query(trimmed);
  }

  private normaliseBreakpointMap(map: Record<string, TypographyConfig>): Record<string, TypographyConfig> {
    const normalised: Record<string, TypographyConfig> = {};
    Object.entries(map).forEach(([breakpoint, config]) => {
      normalised[this.resolveBreakpointQuery(breakpoint)] = config;
    });
    return normalised;
  }

  private registerCleanup(fn: CleanupFn): void {
    this.cleanupFns.push(fn);
  }

  lineHeightToken(name: string, fallback = '1.6'): this {
    this.apply({ lineHeight: `var(--fluent-leading-${name}, ${fallback})` });
    return this;
  }
}

export class TypographySystem {
  private static initialised = false;
  private static unsubscribe: (() => void) | undefined;

  static initialize(): void {
    if (this.initialised || typeof document === 'undefined') {
      return;
    }
    this.unsubscribe = watchTokens((tokens) => {
      const typographyTokens = tokens.typography as TokenGroup | undefined;
      const families = typographyTokens?.families as TokenGroup | undefined;
      const weights = typographyTokens?.weights as TokenGroup | undefined;
      const tracking = typographyTokens?.tracking as TokenGroup | undefined;
      const leading = typographyTokens?.leading as TokenGroup | undefined;
      applyTokenGroup('font-family', families);
      applyTokenGroup('font-weight', weights);
      applyTokenGroup('tracking', tracking);
      applyTokenGroup('leading', leading);
    });
    this.initialised = true;
  }

  static teardown(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.initialised = false;
  }

  static availableScales(): TypographyScaleName[] {
    return getScaleNames();
  }
}

function applyTokenGroup(prefix: string, group: TokenGroup | undefined): void {
  if (!group || typeof document === 'undefined') {
    return;
  }
  const root = document.documentElement;
  flattenTokenGroup(group).forEach(([token, value]) => {
    root.style.setProperty(`--fluent-${prefix}-${token}`, String(value));
  });
}

function flattenTokenGroup(group: TokenGroup, path: string[] = []): Array<[string, string | number]> {
  const entries: Array<[string, string | number]> = [];
  Object.entries(group).forEach(([key, value]) => {
    const nextPath = [...path, key];
    if (value && typeof value === 'object') {
      entries.push(...flattenTokenGroup(value as TokenGroup, nextPath));
    } else if (value !== undefined) {
      entries.push([nextPath.join('-'), value as string | number]);
    }
  });
  return entries;
}

/**
 * Typography feature utilities
 * - font-feature-settings
 * - hyphenation
 * - variable font axes (element-level)
 */
export function applyFontFeatures(element: HTMLElement, features: Record<string, boolean | number>): void {
  const settings = Object.entries(features)
    .map(([feat, val]) => `'${feat}' ${typeof val === 'boolean' ? (val ? 1 : 0) : Number(val)}`)
    .join(', ');
  (element.style as any).fontFeatureSettings = settings;
}

export function applyHyphenation(element: HTMLElement, mode: 'none' | 'manual' | 'auto' = 'auto'): void {
  (element.style as any).hyphens = mode;
  (element.style as any).webkitHyphens = mode as any;
  (element.style as any).msHyphens = mode as any;
}

export function applyFontVariationAxes(element: HTMLElement, axes: Record<string, number>): void {
  const settings = Object.entries(axes)
    .map(([axis, value]) => `'${axis}' ${value}`)
    .join(', ');
  (element.style as any).fontVariationSettings = settings;
}
