/**
 * Fluent Grow Layout - Sizing Module
 * ----------------------------------
 * Offers fluent helpers for width/height management, fluid sizing and
 * responsive breakpoints.
 */

import type { CSSProperties } from '../utils/css-engine';
import { applyStyles } from '../utils/css-engine';
import {
  createStyles,
  observeResponsive,
  resolveLength,
  type CleanupFn,
  type LengthValue,
  type ResponsiveInput,
  type ResponsiveOptions
} from './shared';

export type SizingValue = LengthValue;

export interface ClampConfig {
  property: 'width' | 'height' | 'inline-size' | 'block-size';
  min: SizingValue;
  ideal: SizingValue;
  max: SizingValue;
}

export interface SizingConfig {
  width?: SizingValue;
  height?: SizingValue;
  minWidth?: SizingValue;
  minHeight?: SizingValue;
  maxWidth?: SizingValue;
  maxHeight?: SizingValue;
  inlineSize?: SizingValue;
  blockSize?: SizingValue;
  aspectRatio?: string | number;
  objectFit?: CSSStyleDeclaration['objectFit'];
  objectPosition?: string;
  contain?: string;
  clamp?: ClampConfig | ClampConfig[];
}

export type SizingResponsiveMap = ResponsiveInput<SizingConfig>;
export type SizingScale = Record<string, SizingValue>;

export class Sizing {
  private cleanupFns: CleanupFn[] = [];
  private scale: SizingScale | undefined;

  constructor(private element: HTMLElement, scale?: SizingScale) {
    this.scale = scale;
  }

  withScale(scale: SizingScale): this {
    this.scale = scale;
    return this;
  }

  width(value: SizingValue): this {
    this.applyConfig({ width: value });
    return this;
  }

  height(value: SizingValue): this {
    this.applyConfig({ height: value });
    return this;
  }

  size(width?: SizingValue, height?: SizingValue): this {
    const config: SizingConfig = {};
    if (width !== undefined) {
      config.width = width;
    }
    if (height !== undefined) {
      config.height = height;
    }
    if (Object.keys(config).length > 0) {
      this.applyConfig(config);
    }
    return this;
  }

  minSize(width?: SizingValue, height?: SizingValue): this {
    const config: SizingConfig = {};
    if (width !== undefined) {
      config.minWidth = width;
    }
    if (height !== undefined) {
      config.minHeight = height;
    }
    if (Object.keys(config).length > 0) {
      this.applyConfig(config);
    }
    return this;
  }

  maxSize(width?: SizingValue, height?: SizingValue): this {
    const config: SizingConfig = {};
    if (width !== undefined) {
      config.maxWidth = width;
    }
    if (height !== undefined) {
      config.maxHeight = height;
    }
    if (Object.keys(config).length > 0) {
      this.applyConfig(config);
    }
    return this;
  }

  inlineSize(value: SizingValue): this {
    this.applyConfig({ inlineSize: value });
    return this;
  }

  blockSize(value: SizingValue): this {
    this.applyConfig({ blockSize: value });
    return this;
  }

  aspectRatio(value: string | number): this {
    this.applyConfig({ aspectRatio: value });
    return this;
  }

  square(size: SizingValue): this {
    this.applyConfig({ width: size, height: size, aspectRatio: '1 / 1' });
    return this;
  }

  circle(diameter: SizingValue): this {
    this.square(diameter);
    applyStyles(this.element, { 'border-radius': '50%' });
    return this;
  }

  objectFit(value: CSSStyleDeclaration['objectFit'], position?: string): this {
    const config: SizingConfig = { objectFit: value };
    if (position !== undefined) {
      config.objectPosition = position;
    }
    this.applyConfig(config);
    return this;
  }

  contain(value: string): this {
    this.applyConfig({ contain: value });
    return this;
  }

  clamp(config: ClampConfig | ClampConfig[]): this {
    this.applyConfig({ clamp: config });
    return this;
  }

  fluid(property: ClampConfig['property'], min: SizingValue, ideal: SizingValue, max: SizingValue): this {
    this.applyConfig({ clamp: { property, min, ideal, max } });
    return this;
  }

  responsive(responsive: SizingResponsiveMap, options: ResponsiveOptions<SizingConfig> = {}): this {
    observeResponsive(responsive, (config) => this.applyConfig(config), (fn) => this.registerCleanup(fn), options);
    return this;
  }

  destroy(): void {
    this.cleanupFns.forEach((cleanup) => cleanup());
    this.cleanupFns = [];
  }

  private applyConfig(config: SizingConfig): void {
    const styles = createStyles();

    this.assignIfPresent(styles, 'width', config.width);
    this.assignIfPresent(styles, 'height', config.height);
    this.assignIfPresent(styles, 'min-width', config.minWidth);
    this.assignIfPresent(styles, 'min-height', config.minHeight);
    this.assignIfPresent(styles, 'max-width', config.maxWidth);
    this.assignIfPresent(styles, 'max-height', config.maxHeight);
    this.assignIfPresent(styles, 'inline-size', config.inlineSize);
    this.assignIfPresent(styles, 'block-size', config.blockSize);

    if (config.aspectRatio !== undefined) {
      styles['aspect-ratio'] = typeof config.aspectRatio === 'number' ? String(config.aspectRatio) : config.aspectRatio;
    }

    if (config.objectFit) {
      styles['object-fit'] = config.objectFit;
    }

    if (config.objectPosition) {
      styles['object-position'] = config.objectPosition;
    }

    if (config.contain) {
      styles.contain = config.contain;
    }

    if (config.clamp) {
      const clampConfigs = Array.isArray(config.clamp) ? config.clamp : [config.clamp];
      clampConfigs.forEach((clampConfig) => {
        const value = this.formatClamp(clampConfig);
        styles[clampConfig.property] = value;
      });
    }

    applyStyles(this.element, styles);
  }

  private assignIfPresent(styles: CSSProperties, property: string, value?: SizingValue): void {
    if (value === undefined) {
      return;
    }

    styles[property] = this.resolve(value);
  }

  private formatClamp(config: ClampConfig): string {
    return `clamp(${this.resolve(config.min)}, ${this.resolve(config.ideal)}, ${this.resolve(config.max)})`;
  }

  private resolve(value: SizingValue): string {
    if (typeof value === 'string' && this.scale && value in this.scale) {
      return resolveLength(this.scale[value]!);
    }

    return resolveLength(value);
  }

  private registerCleanup(fn: CleanupFn): void {
    this.cleanupFns.push(fn);
  }
}

