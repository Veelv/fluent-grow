/**
 * Fluid Typography Helpers
 * ------------------------
 * Generates responsive `clamp()` expressions that scale between two font sizes
 * across a viewport range.
 */

export interface FluidTypographyOptions {
  minSize: number;
  maxSize: number;
  minViewport?: number;
  maxViewport?: number;
  unit?: 'rem' | 'px' | 'em';
  precision?: number;
}

const DEFAULT_OPTIONS: Required<Pick<FluidTypographyOptions, 'minViewport' | 'maxViewport' | 'unit' | 'precision'>> = {
  minViewport: 320,
  maxViewport: 1440,
  unit: 'rem',
  precision: 4
};

export function fluidTypography(options: FluidTypographyOptions): string {
  const { minSize, maxSize } = options;
  if (minSize > maxSize) {
    throw new Error('`minSize` must be less than or equal to `maxSize` in fluid typography settings.');
  }
  const merged = { ...DEFAULT_OPTIONS, ...options };
  const minViewport = merged.minViewport;
  const maxViewport = merged.maxViewport;
  const unit = merged.unit;
  const precision = merged.precision;

  if (minViewport >= maxViewport) {
    throw new Error('`minViewport` must be smaller than `maxViewport` for fluid typography.');
  }

  const slope = (maxSize - minSize) / (maxViewport - minViewport);
  const intercept = minSize - slope * minViewport;

  const formattedMin = formatValue(minSize, unit, precision);
  const formattedMax = formatValue(maxSize, unit, precision);
  const formattedIntercept = formatValue(intercept, unit, precision);
  const formattedSlope = formatPercentage(slope * 100, precision);
  const viewportSpan = maxViewport - minViewport;

  return `clamp(${formattedMin}, ${formattedIntercept} + ${formattedSlope}vw, ${formattedMax}) /* ${minSize}${unit}–${maxSize}${unit} across ${viewportSpan}px */`;
}

function formatValue(value: number, unit: 'rem' | 'px' | 'em', precision: number): string {
  return `${round(value, precision)}${unit}`;
}

function formatPercentage(value: number, precision: number): string {
  return `${round(value, precision)}%`;
}

function round(value: number, precision: number): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

