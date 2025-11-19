/**
 * Fluent Grow Layout - Positioning Module
 * ---------------------------------------
 * Provides a fluent API for advanced positioning scenarios including anchor
 * positioning, sticky behaviours, and responsive overrides.
 */

import type { CSSProperties } from '../utils/css-engine';
import { applyStyles } from '../utils/css-engine';
import {
  createStyles,
  observeResponsive,
  resolveLength,
  toCssProperty,
  type CleanupFn,
  type LengthValue,
  type ResponsiveInput,
  type ResponsiveOptions
} from './shared';

export type PositionMode = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';

export interface OffsetConfig {
  top?: LengthValue;
  right?: LengthValue;
  bottom?: LengthValue;
  left?: LengthValue;
  inset?: LengthValue | LengthValue[];
}

export interface PositioningConfig extends OffsetConfig {
  mode?: PositionMode;
  zIndex?: number;
  pointerEvents?: CSSStyleDeclaration['pointerEvents'];
  anchorName?: string;
  anchorReference?: 'auto' | 'none' | 'initial';
  anchorOffset?: LengthValue;
  translate?: { x?: LengthValue; y?: LengthValue };
  transform?: string;
  layer?: string;
  contain?: string;
}

export type PositioningResponsiveMap = ResponsiveInput<PositioningConfig>;

export class Positioning {
  private cleanupFns: CleanupFn[] = [];

  constructor(private element: HTMLElement, private defaults: PositioningConfig = {}) {
    if (Object.keys(defaults).length) {
      this.apply(defaults);
    }
  }

  set(config: PositioningConfig): this {
    this.apply({ ...this.defaults, ...config });
    return this;
  }

  mode(mode: PositionMode, offsets: OffsetConfig = {}): this {
    this.apply({ mode, ...offsets });
    return this;
  }

  absolute(offsets: OffsetConfig = {}): this {
    return this.mode('absolute', offsets);
  }

  relative(offsets: OffsetConfig = {}): this {
    return this.mode('relative', offsets);
  }

  fixed(offsets: OffsetConfig = {}): this {
    return this.mode('fixed', offsets);
  }

  sticky(offsets: OffsetConfig = {}): this {
    return this.mode('sticky', offsets);
  }

  static(): this {
    return this.mode('static');
  }

  zIndex(value: number): this {
    this.apply({ zIndex: value });
    return this;
  }

  anchor(options: { name: string; offset?: LengthValue; reference?: PositioningConfig['anchorReference'] }): this {
    const config: PositioningConfig = { anchorName: options.name };
    if (options.offset !== undefined) {
      config.anchorOffset = options.offset;
    }
    if (options.reference !== undefined) {
      config.anchorReference = options.reference;
    }
    this.apply(config);
    return this;
  }

  translate(x?: LengthValue, y?: LengthValue): this {
    const translate: PositioningConfig['translate'] = {};
    if (x !== undefined) {
      translate.x = x;
    }
    if (y !== undefined) {
      translate.y = y;
    }

    if (Object.keys(translate).length > 0) {
      this.apply({ translate });
    }
    return this;
  }

  center(axis: 'both' | 'x' | 'y' = 'both', strategy: 'transform' | 'margin' = 'transform'): this {
    if (strategy === 'transform') {
      const translate: PositioningConfig['translate'] = {};
      if (axis === 'both' || axis === 'x') {
        translate.x = '-50%';
      }
      if (axis === 'both' || axis === 'y') {
        translate.y = '-50%';
      }

      this.apply({
        mode: 'absolute',
        top: '50%',
        left: '50%',
        translate
      });
    } else {
      const styles = createStyles();
      if (axis === 'both' || axis === 'x') {
        styles['margin-left'] = 'auto';
        styles['margin-right'] = 'auto';
      }
      if (axis === 'both' || axis === 'y') {
        styles['margin-top'] = 'auto';
        styles['margin-bottom'] = 'auto';
      }
      applyStyles(this.element, styles);
    }

    return this;
  }

  pin(options: PositioningConfig): this {
    this.apply({ mode: 'absolute', ...options });
    return this;
  }

  layer(name: string, zIndex: number): this {
    this.apply({ layer: name, zIndex });
    return this;
  }

  contain(value: string): this {
    this.apply({ contain: value });
    return this;
  }

  responsive(responsive: PositioningResponsiveMap, options: ResponsiveOptions<PositioningConfig> = {}): this {
    observeResponsive(responsive, (config) => this.apply(config), (fn) => this.registerCleanup(fn), options);
    return this;
  }

  destroy(): void {
    this.cleanupFns.forEach((cleanup) => cleanup());
    this.cleanupFns = [];
  }

  private apply(config: PositioningConfig): void {
    const merged = { ...this.defaults, ...config };
    const styles = createStyles();

    if (merged.mode) {
      styles.position = merged.mode;
    }

    if (merged.inset !== undefined) {
      styles.inset = this.formatSeries(merged.inset);
    }

    this.applyOffset(styles, 'top', merged.top);
    this.applyOffset(styles, 'right', merged.right);
    this.applyOffset(styles, 'bottom', merged.bottom);
    this.applyOffset(styles, 'left', merged.left);

    if (merged.translate) {
      const translateX = merged.translate.x ? resolveLength(merged.translate.x) : '0';
      const translateY = merged.translate.y ? resolveLength(merged.translate.y) : '0';
      styles.transform = merged.transform ? `${merged.transform} translate(${translateX}, ${translateY})` : `translate(${translateX}, ${translateY})`;
    } else if (merged.transform) {
      styles.transform = merged.transform;
    }

    if (merged.zIndex !== undefined) {
      styles['z-index'] = String(merged.zIndex);
    }

    if (merged.pointerEvents) {
      styles['pointer-events'] = merged.pointerEvents;
    }

    if (merged.anchorName) {
      styles['anchor-name'] = merged.anchorName.startsWith('--') ? merged.anchorName : `--${merged.anchorName}`;
    }

    if (merged.anchorReference) {
      styles['anchor-reference'] = merged.anchorReference;
    }

    if (merged.anchorOffset !== undefined) {
      styles['anchor-offset'] = resolveLength(merged.anchorOffset);
    }

    if (merged.layer) {
      const layerName = merged.layer.startsWith('--') ? merged.layer : `--${merged.layer}`;
      styles['--fluent-layer'] = layerName;
    }

    if (merged.contain) {
      styles.contain = merged.contain;
    }

    applyStyles(this.element, styles);
  }

  private applyOffset(styles: CSSProperties, property: string, value?: LengthValue): void {
    if (value === undefined) {
      return;
    }

    const resolved = resolveLength(value);
    styles[toCssProperty(property)] = resolved;
  }

  private formatSeries(value: LengthValue | LengthValue[]): string {
    if (Array.isArray(value)) {
      return value.map((item) => resolveLength(item)).join(' ');
    }
    return resolveLength(value);
  }

  private registerCleanup(fn: CleanupFn): void {
    this.cleanupFns.push(fn);
  }
}

