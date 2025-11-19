/**
 * Fluent Grow Color System
 * ------------------------
 * Provides palette management, OKLCH conversions, harmonies, and helpers for
 * applying tokenised colour schemes to DOM nodes or global scopes.
 */

import { clamp } from '../utils/math-utils';
import { toOKLCH, fromOKLCH, type OKLCHColor } from './oklch';
import { ColorPalette, type PaletteDefinition, type PaletteLevel } from './palette';
import { getContrastRatio, isAccessible } from './contrast';
import { generateHarmony, type HarmonyType } from './harmony';
import { supportsColorMix, supportsDisplayP3 } from '../utils/supports';

export * from './presets';

export interface PaletteMap {
  [name: string]: ColorPalette;
}

export interface ApplyOptions {
  background?: string;
  color?: string;
  borderColor?: string;
  accent?: string;
}

export interface ColorThemeDefinition {
  name: string;
  palettes: Record<string, PaletteDefinition>;
}

export type ThemeListener = (theme: ColorThemeDefinition) => void;

export class ColorManager {
  private palettes: PaletteMap = {};
  private themes = new Map<string, ColorThemeDefinition>();
  private activeTheme?: ColorThemeDefinition;
  private listeners = new Set<ThemeListener>();

  registerPalette(name: string, definition: PaletteDefinition): this {
    this.palettes[name] = new ColorPalette(definition);
    return this;
  }

  removePalette(name: string): this {
    delete this.palettes[name];
    return this;
  }

  getPalette(name: string): ColorPalette | undefined {
    return this.palettes[name];
  }

  getColor(palette: string, level: PaletteLevel): string | undefined {
    return this.palettes[palette]?.get(level);
  }

  generateHarmony(base: string, type: HarmonyType): string[] {
    return generateHarmony(base, type);
  }

  adjustLightness(color: string, delta: number): string {
    const parsed = fromOKLCH(color);
    if (!parsed) {
      return color;
    }

    const adjusted: OKLCHColor = {
      ...parsed,
      l: clamp(parsed.l + delta, 0, 1)
    };

    return toOKLCH(adjusted);
  }

  toOKLCH(color: OKLCHColor): string {
    return toOKLCH(color);
  }

  fromOKLCH(value: string): OKLCHColor | null {
    return fromOKLCH(value);
  }

  mix(base: string, mixColor: string, percentage: number): string {
    return `color-mix(in oklch, ${base} ${clamp(percentage, 0, 100)}%, ${mixColor})`;
  }

  /**
   * Returns a colour with progressive enhancement:
   * - Prefer OKLCH or P3 input as-is in capable browsers
   * - Fallback to sRGB or provided fallback when not supported
   */
  resolveWithFallback(primary: string, fallback?: string): string {
    // If the color uses display-p3 and it's not supported, fallback
    if (primary.includes('display-p3') && !supportsDisplayP3()) {
      return fallback ?? 'rgb(0 0 0)';
    }
    // If using color-mix/oklch but not supported, return fallback
    if ((primary.includes('color-mix(') || primary.includes('oklch(')) && !supportsColorMix()) {
      return fallback ?? 'rgb(0 0 0)';
    }
    return primary;
  }

  registerTheme(theme: ColorThemeDefinition): this {
    this.themes.set(theme.name, theme);
    return this;
  }

  onThemeChange(listener: ThemeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getActiveTheme(): string | undefined {
    return this.activeTheme?.name;
  }

  applyTheme(name: string, root: HTMLElement = document.documentElement): void {
    const theme = this.themes.get(name);
    if (!theme) {
      throw new Error(`Color theme "${name}" is not registered.`);
    }

    Object.entries(theme.palettes).forEach(([paletteName, definition]) => {
      this.registerPalette(paletteName, definition);
      const palette = this.palettes[paletteName];
      if (!palette) {
        return;
      }
      palette.levels().forEach((level) => {
        const value = palette.get(level);
        if (value) {
          root.style.setProperty(`--fluent-color-${paletteName}-${level}`, value);
        }
      });
    });

    this.activeTheme = theme;
    this.listeners.forEach((listener) => {
      try {
        listener(theme);
      } catch (error) {
        if (typeof console !== 'undefined') {
          console.error('[FluentFramework] Color theme listener failed', error);
        }
      }
    });
  }

  applyToElement(element: HTMLElement, options: ApplyOptions): void {
    if (options.background) {
      element.style.background = options.background;
    }
    if (options.color) {
      element.style.color = options.color;
    }
    if (options.borderColor) {
      element.style.borderColor = options.borderColor;
    }
    if (options.accent) {
      element.style.setProperty('accent-color', options.accent);
    }
  }

  gradient(palette: string, ...levels: PaletteLevel[]): string | undefined {
    const paletteRef = this.palettes[palette];
    if (!paletteRef) {
      return undefined;
    }

    const stops = levels
      .map((level) => paletteRef.get(level))
      .filter((value): value is string => Boolean(value));

    if (!stops.length) {
      return undefined;
    }

    return `linear-gradient(135deg, ${stops.join(', ')})`;
  }

  contrast(foreground: string, background: string): number {
    return getContrastRatio(foreground, background);
  }

  isAccessible(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean {
    return isAccessible(foreground, background, level);
  }
}

export const ColorUtils = {
  toOKLCH,
  fromOKLCH,
  generateHarmony,
  getContrastRatio,
  isAccessible,
  mix(base: string, mixColor: string, percentage: number): string {
    return `color-mix(in oklch, ${base} ${clamp(percentage, 0, 100)}%, ${mixColor})`;
  },
  resolveWithFallback(primary: string, fallback?: string): string {
    // Reuse manager logic statically
    return new ColorManager().resolveWithFallback(primary, fallback);
  }
};

