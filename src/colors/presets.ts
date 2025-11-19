/**
 * Fluent Grow - Built-in Color Presets
 * ------------------------------------
 * Provides a curated set of brand/semantic palettes inspired by modern design
 * systems. Each palette is expressed in OKLCH for superior perceptual uniformity.
 */

import type { PaletteDefinition } from './palette';
import { ColorManager, type ColorThemeDefinition } from './index';

export type FluentPaletteName =
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger';

export type FluentPalettes = Record<FluentPaletteName, PaletteDefinition>;

export const FLUENT_PALETTES: FluentPalettes = {
  primary: createScale(260, 0.09),     // Indigo / Violet
  secondary: createScale(340, 0.09),   // Fuchsia
  neutral: createGrayScale(0.015),     // Gray (low chroma)
  success: createScale(150, 0.09),     // Green
  info: createScale(220, 0.09),        // Blue
  warning: createScale(80, 0.09),      // Amber
  danger: createScale(25, 0.09)        // Orange/Red
};

export function createFluentTheme(name = 'fluent'): ColorThemeDefinition {
  return {
    name,
    palettes: FLUENT_PALETTES
  };
}

export function registerFluentPalettes(manager: ColorManager, apply = true, name = 'fluent'): void {
  const theme = createFluentTheme(name);
  manager.registerTheme(theme);
  if (apply) {
    manager.applyTheme(theme.name);
  }
}

// ---------------------------------------------------------------------------
// Palette generators
// ---------------------------------------------------------------------------

function createScale(hue: number, baseChroma = 0.09): PaletteDefinition {
  // Lightness distribution tuned for UI usage (higher contrast in mid/high levels)
  const lightness: Array<[number, number]> = [
    [50, 0.98],
    [100, 0.95],
    [200, 0.90],
    [300, 0.83],
    [400, 0.75],
    [500, 0.68],
    [600, 0.60],
    [700, 0.51],
    [800, 0.42],
    [900, 0.35],
    [950, 0.28]
  ];

  const chromaFor = (l: number): number => {
    // Slightly increase chroma around mid-tones; reduce on extremes
    const center = 0.6;
    const variance = Math.max(0, 1 - Math.abs(l - center) * 2);
    return clampChroma(baseChroma * (0.8 + variance * 0.4));
  };

  const scale: PaletteDefinition = {};
  lightness.forEach(([step, l]) => {
    const c = chromaFor(l);
    scale[step] = `oklch(${toFixed(l)} ${toFixed(c)} ${toFixed(hue)})`;
  });
  return scale;
}

function createGrayScale(baseChroma = 0.015): PaletteDefinition {
  // Use near-zero chroma with slight hue shift to avoid muddy neutrals on some displays
  const hue = 260; // cool-neutral
  const lightness: Array<[number, number]> = [
    [50, 0.98],
    [100, 0.95],
    [200, 0.90],
    [300, 0.84],
    [400, 0.78],
    [500, 0.72],
    [600, 0.64],
    [700, 0.56],
    [800, 0.48],
    [900, 0.40],
    [950, 0.32]
  ];

  const scale: PaletteDefinition = {};
  lightness.forEach(([step, l]) => {
    scale[step] = `oklch(${toFixed(l)} ${toFixed(baseChroma)} ${toFixed(hue)})`;
  });
  return scale;
}

function clampChroma(value: number): number {
  // OKLCH chroma safe range commonly within 0–0.4 for sRGB
  return Math.max(0, Math.min(value, 0.4));
}

function toFixed(value: number, precision = 4): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}
