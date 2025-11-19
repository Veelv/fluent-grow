/**
 * Fluent Grow Layout - Spacing Module
 * -----------------------------------
 * Handles margins, padding and gap utilities with token-aware values and
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

export type SpacingValue = LengthValue;
export type SpacingSeries = SpacingValue | SpacingValue[];

export interface SpacingConfig {
  margin?: SpacingSeries;
  marginX?: SpacingValue;
  marginY?: SpacingValue;
  marginTop?: SpacingValue;
  marginRight?: SpacingValue;
  marginBottom?: SpacingValue;
  marginLeft?: SpacingValue;
  padding?: SpacingSeries;
  paddingX?: SpacingValue;
  paddingY?: SpacingValue;
  paddingTop?: SpacingValue;
  paddingRight?: SpacingValue;
  paddingBottom?: SpacingValue;
  paddingLeft?: SpacingValue;
  gap?: SpacingValue;
  rowGap?: SpacingValue;
  columnGap?: SpacingValue;
  inset?: SpacingSeries;
  insetX?: SpacingValue;
  insetY?: SpacingValue;
  top?: SpacingValue;
  right?: SpacingValue;
  bottom?: SpacingValue;
  left?: SpacingValue;
  scrollPadding?: SpacingSeries;
  scrollMargin?: SpacingSeries;
}

export type SpacingResponsiveMap = ResponsiveInput<SpacingConfig>;
export type SpacingScale = Record<string, SpacingValue>;

export class Spacing {
  private cleanupFns: CleanupFn[] = [];
  private scale: SpacingScale | undefined;

  constructor(private element: HTMLElement, scale?: SpacingScale) {
    this.scale = scale;
  }

  withScale(scale: SpacingScale): this {
    this.scale = scale;
    return this;
  }

  margin(...values: SpacingValue[]): this {
    if (values.length === 0) {
      return this;
    }
    this.applyConfig({ margin: values });
    return this;
  }

  marginX(value: SpacingValue): this {
    this.applyConfig({ marginX: value });
    return this;
  }

  marginY(value: SpacingValue): this {
    this.applyConfig({ marginY: value });
    return this;
  }

  padding(...values: SpacingValue[]): this {
    if (values.length === 0) {
      return this;
    }
    this.applyConfig({ padding: values });
    return this;
  }

  paddingX(value: SpacingValue): this {
    this.applyConfig({ paddingX: value });
    return this;
  }

  paddingY(value: SpacingValue): this {
    this.applyConfig({ paddingY: value });
    return this;
  }

  gap(value: SpacingValue): this {
    this.applyConfig({ gap: value });
    return this;
  }

  inset(...values: SpacingValue[]): this {
    if (values.length === 0) {
      return this;
    }
    this.applyConfig({ inset: values });
    return this;
  }

  insetX(value: SpacingValue): this {
    this.applyConfig({ insetX: value });
    return this;
  }

  insetY(value: SpacingValue): this {
    this.applyConfig({ insetY: value });
    return this;
  }

  scrollPadding(...values: SpacingValue[]): this {
    if (values.length === 0) {
      return this;
    }
    this.applyConfig({ scrollPadding: values });
    return this;
  }

  scrollMargin(...values: SpacingValue[]): this {
    if (values.length === 0) {
      return this;
    }
    this.applyConfig({ scrollMargin: values });
    return this;
  }

  responsive(responsive: SpacingResponsiveMap, options: ResponsiveOptions<SpacingConfig> = {}): this {
    observeResponsive(responsive, (config) => this.applyConfig(config), (fn) => this.registerCleanup(fn), options);
    return this;
  }

  destroy(): void {
    this.cleanupFns.forEach((cleanup) => cleanup());
    this.cleanupFns = [];
  }

  private applyConfig(config: SpacingConfig): void {
    const styles = createStyles();

    if (config.margin !== undefined) {
      styles.margin = this.formatSeries(config.margin);
    }

    if (config.marginX !== undefined) {
      const value = this.resolve(config.marginX);
      styles['margin-left'] = value;
      styles['margin-right'] = value;
    }

    if (config.marginY !== undefined) {
      const value = this.resolve(config.marginY);
      styles['margin-top'] = value;
      styles['margin-bottom'] = value;
    }

    this.assignIfPresent(styles, 'margin-top', config.marginTop);
    this.assignIfPresent(styles, 'margin-right', config.marginRight);
    this.assignIfPresent(styles, 'margin-bottom', config.marginBottom);
    this.assignIfPresent(styles, 'margin-left', config.marginLeft);

    if (config.padding !== undefined) {
      styles.padding = this.formatSeries(config.padding);
    }

    if (config.paddingX !== undefined) {
      const value = this.resolve(config.paddingX);
      styles['padding-left'] = value;
      styles['padding-right'] = value;
    }

    if (config.paddingY !== undefined) {
      const value = this.resolve(config.paddingY);
      styles['padding-top'] = value;
      styles['padding-bottom'] = value;
    }

    this.assignIfPresent(styles, 'padding-top', config.paddingTop);
    this.assignIfPresent(styles, 'padding-right', config.paddingRight);
    this.assignIfPresent(styles, 'padding-bottom', config.paddingBottom);
    this.assignIfPresent(styles, 'padding-left', config.paddingLeft);

    this.assignIfPresent(styles, 'gap', config.gap);
    this.assignIfPresent(styles, 'row-gap', config.rowGap);
    this.assignIfPresent(styles, 'column-gap', config.columnGap);

    if (config.inset !== undefined) {
      styles.inset = this.formatSeries(config.inset);
    }

    this.assignIfPresent(styles, 'inset-inline', config.insetX);
    this.assignIfPresent(styles, 'inset-block', config.insetY);
    this.assignIfPresent(styles, 'top', config.top);
    this.assignIfPresent(styles, 'right', config.right);
    this.assignIfPresent(styles, 'bottom', config.bottom);
    this.assignIfPresent(styles, 'left', config.left);

    if (config.scrollPadding !== undefined) {
      styles['scroll-padding'] = this.formatSeries(config.scrollPadding);
    }

    if (config.scrollMargin !== undefined) {
      styles['scroll-margin'] = this.formatSeries(config.scrollMargin);
    }

    applyStyles(this.element, styles);
  }

  private assignIfPresent(styles: CSSProperties, property: string, value?: SpacingValue): void {
    if (value === undefined) {
      return;
    }

    styles[property] = this.resolve(value);
  }

  private formatSeries(series: SpacingSeries): string {
    if (Array.isArray(series)) {
      return series.map((value) => this.resolve(value)).join(' ');
    }
    return this.resolve(series);
  }

  private resolve(value: SpacingValue): string {
    if (typeof value === 'string' && this.scale && value in this.scale) {
      return this.resolveValue(this.scale[value]!);
    }

    return this.resolveValue(value);
  }

  private resolveValue(value: SpacingValue): string {
    return resolveLength(value);
  }

  private registerCleanup(fn: CleanupFn): void {
    this.cleanupFns.push(fn);
  }
}

