/**
 * Fluent Grow Border System
 * -------------------------
 * Provides comprehensive border styling utilities including width, style, color,
 * radius, outlines and ring effects with responsive breakpoint support.
 */

export { Shadow, type ShadowConfig, type TextShadowConfig, type DropShadowConfig } from './shadows';
export { PseudoElements, type PseudoElementConfig } from './pseudo-elements';

import { applyStyles } from '../utils/css-engine';
import type { CSSProperties } from '../utils/css-engine';
import {
  observeResponsive,
  type CleanupFn,
  type ResponsiveInput,
  type ResponsiveOptions
} from '../layout/shared';

export type BorderWidth = string | number;
export type BorderStyle = 'none' | 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
export type BorderRadius = string | number;

export interface BorderConfig {
  width?: BorderWidth;
  style?: BorderStyle;
  color?: string;
  topWidth?: BorderWidth;
  rightWidth?: BorderWidth;
  bottomWidth?: BorderWidth;
  leftWidth?: BorderWidth;
  topStyle?: BorderStyle;
  rightStyle?: BorderStyle;
  bottomStyle?: BorderStyle;
  leftStyle?: BorderStyle;
  topColor?: string;
  rightColor?: string;
  bottomColor?: string;
  leftColor?: string;
  radius?: BorderRadius;
  topLeftRadius?: BorderRadius;
  topRightRadius?: BorderRadius;
  bottomLeftRadius?: BorderRadius;
  bottomRightRadius?: BorderRadius;
}

export type BorderResponsiveMap = ResponsiveInput<BorderConfig>;

// Legacy BorderEngine class for backward compatibility
export class BorderEngine {
  private cleanupFns: CleanupFn[] = [];

  constructor(private element: HTMLElement) {}

  /**
   * Sets border width, style and color in a single declaration
   */
  border(width: BorderWidth, style?: BorderStyle, color?: string): this {
    const border = [this.normalizeWidth(width), style, color].filter(Boolean).join(' ');
    applyStyles(this.element, { border });
    return this;
  }

  /**
   * Sets border width for all sides
   */
  width(value: BorderWidth): this {
    applyStyles(this.element, { borderWidth: this.normalizeWidth(value) });
    return this;
  }

  /**
   * Sets top border with optional style and color
   */
  top(width: BorderWidth, style?: BorderStyle, color?: string): this {
    const border = [this.normalizeWidth(width), style, color].filter(Boolean).join(' ');
    applyStyles(this.element, { borderTop: border });
    return this;
  }

  /**
   * Sets right border with optional style and color
   */
  right(width: BorderWidth, style?: BorderStyle, color?: string): this {
    const border = [this.normalizeWidth(width), style, color].filter(Boolean).join(' ');
    applyStyles(this.element, { borderRight: border });
    return this;
  }

  /**
   * Sets bottom border with optional style and color
   */
  bottom(width: BorderWidth, style?: BorderStyle, color?: string): this {
    const border = [this.normalizeWidth(width), style, color].filter(Boolean).join(' ');
    applyStyles(this.element, { borderBottom: border });
    return this;
  }

  /**
   * Sets left border with optional style and color
   */
  left(width: BorderWidth, style?: BorderStyle, color?: string): this {
    const border = [this.normalizeWidth(width), style, color].filter(Boolean).join(' ');
    applyStyles(this.element, { borderLeft: border });
    return this;
  }

  /**
   * Sets border style for all sides
   */
  style(value: BorderStyle): this {
    applyStyles(this.element, { borderStyle: value });
    return this;
  }

  /** Sets solid border style */
  solid(): this { return this.style('solid'); }
  
  /** Sets dashed border style */
  dashed(): this { return this.style('dashed'); }
  
  /** Sets dotted border style */
  dotted(): this { return this.style('dotted'); }
  
  /** Sets double border style */
  double(): this { return this.style('double'); }
  
  /** Removes border */
  none(): this { return this.style('none'); }

  /**
   * Sets border color for all sides
   */
  color(value: string): this {
    applyStyles(this.element, { borderColor: value });
    return this;
  }

  /**
   * Sets border radius for all corners
   */
  radius(value: BorderRadius): this {
    applyStyles(this.element, { borderRadius: this.normalizeRadius(value) });
    return this;
  }

  /**
   * Sets individual corner radius
   */
  topLeftRadius(value: BorderRadius): this {
    applyStyles(this.element, { borderTopLeftRadius: this.normalizeRadius(value) });
    return this;
  }

  topRightRadius(value: BorderRadius): this {
    applyStyles(this.element, { borderTopRightRadius: this.normalizeRadius(value) });
    return this;
  }

  bottomLeftRadius(value: BorderRadius): this {
    applyStyles(this.element, { borderBottomLeftRadius: this.normalizeRadius(value) });
    return this;
  }

  bottomRightRadius(value: BorderRadius): this {
    applyStyles(this.element, { borderBottomRightRadius: this.normalizeRadius(value) });
    return this;
  }

  /** Preset radius values */
  rounded(): this { return this.radius('0.25rem'); }
  roundedMd(): this { return this.radius('0.375rem'); }
  roundedLg(): this { return this.radius('0.5rem'); }
  roundedXl(): this { return this.radius('0.75rem'); }
  rounded2xl(): this { return this.radius('1rem'); }
  rounded3xl(): this { return this.radius('1.5rem'); }
  roundedFull(): this { return this.radius('9999px'); }
  roundedNone(): this { return this.radius('0'); }

  /**
   * Sets outline with width, style and color
   */
  outline(width: BorderWidth, style?: BorderStyle, color?: string): this {
    const outline = [this.normalizeWidth(width), style, color].filter(Boolean).join(' ');
    applyStyles(this.element, { outline });
    return this;
  }

  /**
   * Sets outline offset
   */
  outlineOffset(value: string): this {
    applyStyles(this.element, { outlineOffset: value });
    return this;
  }

  /** Removes outline */
  outlineNone(): this {
    applyStyles(this.element, { outline: 'none' });
    return this;
  }

  /**
   * Creates a ring effect using box-shadow
   */
  ring(width: BorderWidth, color?: string): this {
    const ringColor = color || 'var(--fluent-color-primary-500, rgba(59, 130, 246, 0.5))';
    const ringWidth = this.normalizeWidth(width);
    applyStyles(this.element, { 
      boxShadow: `0 0 0 ${ringWidth} ${ringColor}` 
    });
    return this;
  }

  /**
   * Creates an inset ring effect
   */
  ringInset(width: BorderWidth, color?: string): this {
    const ringColor = color || 'var(--fluent-color-primary-500, rgba(59, 130, 246, 0.5))';
    const ringWidth = this.normalizeWidth(width);
    applyStyles(this.element, { 
      boxShadow: `inset 0 0 0 ${ringWidth} ${ringColor}` 
    });
    return this;
  }

  /**
   * Applies border configuration object
   */
  set(config: BorderConfig): this {
    this.applyConfig(config);
    return this;
  }

  /**
   * Applies responsive border configuration
   */
  responsive(map: BorderResponsiveMap, options: ResponsiveOptions<BorderConfig> = {}): this {
    observeResponsive(map, (config) => this.applyConfig(config), (fn) => this.registerCleanup(fn), options);
    return this;
  }

  /**
   * Cleanup method to remove event listeners and observers
   */
  destroy(): void {
    this.cleanupFns.forEach((cleanup) => cleanup());
    this.cleanupFns = [];
  }

  private applyConfig(config: BorderConfig): void {
    const styles: CSSProperties = {};

    if (config.width !== undefined) {
      styles.borderWidth = this.normalizeWidth(config.width);
    }
    if (config.style !== undefined) {
      styles.borderStyle = config.style;
    }
    if (config.color !== undefined) {
      styles.borderColor = config.color;
    }

    // Individual sides
    if (config.topWidth !== undefined) {
      styles.borderTopWidth = this.normalizeWidth(config.topWidth);
    }
    if (config.rightWidth !== undefined) {
      styles.borderRightWidth = this.normalizeWidth(config.rightWidth);
    }
    if (config.bottomWidth !== undefined) {
      styles.borderBottomWidth = this.normalizeWidth(config.bottomWidth);
    }
    if (config.leftWidth !== undefined) {
      styles.borderLeftWidth = this.normalizeWidth(config.leftWidth);
    }

    // Border radius
    if (config.radius !== undefined) {
      styles.borderRadius = this.normalizeRadius(config.radius);
    }
    if (config.topLeftRadius !== undefined) {
      styles.borderTopLeftRadius = this.normalizeRadius(config.topLeftRadius);
    }
    if (config.topRightRadius !== undefined) {
      styles.borderTopRightRadius = this.normalizeRadius(config.topRightRadius);
    }
    if (config.bottomLeftRadius !== undefined) {
      styles.borderBottomLeftRadius = this.normalizeRadius(config.bottomLeftRadius);
    }
    if (config.bottomRightRadius !== undefined) {
      styles.borderBottomRightRadius = this.normalizeRadius(config.bottomRightRadius);
    }

    applyStyles(this.element, styles);
  }

  private normalizeWidth(value: BorderWidth): string {
    if (typeof value === 'number') {
      return value === 0 ? '0' : `${value}px`;
    }
    return value;
  }

  private normalizeRadius(value: BorderRadius): string {
    if (typeof value === 'number') {
      return value === 0 ? '0' : `${value}px`;
    }
    return value;
  }

  private registerCleanup(fn: CleanupFn): void {
    this.cleanupFns.push(fn);
  }
}

// Main Border class export
export { BorderEngine as Border };