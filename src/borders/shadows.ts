/**
 * Fluent Grow Shadow System
 * -------------------------
 * Provides comprehensive shadow utilities including box shadows, text shadows,
 * drop shadows and advanced shadow effects with responsive support.
 */

import { applyStyles } from '../utils/css-engine';
import type { CSSProperties } from '../utils/css-engine';
import {
  observeResponsive,
  type CleanupFn,
  type ResponsiveInput,
  type ResponsiveOptions
} from '../layout/shared';

export interface ShadowConfig {
  x?: string | number;
  y?: string | number;
  blur?: string | number;
  spread?: string | number;
  color?: string;
  inset?: boolean;
}

export interface TextShadowConfig {
  x?: string | number;
  y?: string | number;
  blur?: string | number;
  color?: string;
}

export interface DropShadowConfig {
  x?: string | number;
  y?: string | number;
  blur?: string | number;
  color?: string;
}

export type ShadowResponsiveMap = ResponsiveInput<{
  boxShadow?: string;
  textShadow?: string;
  filter?: string;
}>;

export class Shadow {
  private cleanupFns: CleanupFn[] = [];

  constructor(private element: HTMLElement) {}

  /**
   * Sets box shadow with configuration object
   */
  box(config: ShadowConfig | string): this {
    if (typeof config === 'string') {
      applyStyles(this.element, { boxShadow: config });
      return this;
    }

    const { x = 0, y = 4, blur = 6, spread = 0, color = 'rgba(0, 0, 0, 0.1)', inset = false } = config;
    const shadow = `${inset ? 'inset ' : ''}${this.normalizeValue(x)} ${this.normalizeValue(y)} ${this.normalizeValue(blur)} ${this.normalizeValue(spread)} ${color}`;
    
    applyStyles(this.element, { boxShadow: shadow });
    return this;
  }

  /**
   * Sets multiple box shadows
   */
  boxMultiple(...configs: (ShadowConfig | string)[]): this {
    const shadows = configs.map(config => {
      if (typeof config === 'string') return config;
      
      const { x = 0, y = 4, blur = 6, spread = 0, color = 'rgba(0, 0, 0, 0.1)', inset = false } = config;
      return `${inset ? 'inset ' : ''}${this.normalizeValue(x)} ${this.normalizeValue(y)} ${this.normalizeValue(blur)} ${this.normalizeValue(spread)} ${color}`;
    });

    applyStyles(this.element, { boxShadow: shadows.join(', ') });
    return this;
  }

  /**
   * Sets text shadow with configuration object
   */
  text(config: TextShadowConfig | string): this {
    if (typeof config === 'string') {
      applyStyles(this.element, { textShadow: config });
      return this;
    }

    const { x = 1, y = 1, blur = 2, color = 'rgba(0, 0, 0, 0.3)' } = config;
    const shadow = `${this.normalizeValue(x)} ${this.normalizeValue(y)} ${this.normalizeValue(blur)} ${color}`;
    
    applyStyles(this.element, { textShadow: shadow });
    return this;
  }

  /**
   * Sets multiple text shadows
   */
  textMultiple(...configs: (TextShadowConfig | string)[]): this {
    const shadows = configs.map(config => {
      if (typeof config === 'string') return config;
      
      const { x = 1, y = 1, blur = 2, color = 'rgba(0, 0, 0, 0.3)' } = config;
      return `${this.normalizeValue(x)} ${this.normalizeValue(y)} ${this.normalizeValue(blur)} ${color}`;
    });

    applyStyles(this.element, { textShadow: shadows.join(', ') });
    return this;
  }

  /**
   * Sets drop shadow filter
   */
  drop(config: DropShadowConfig): this {
    const { x = 0, y = 4, blur = 6, color = 'rgba(0, 0, 0, 0.1)' } = config;
    const filter = `drop-shadow(${this.normalizeValue(x)} ${this.normalizeValue(y)} ${this.normalizeValue(blur)} ${color})`;
    
    applyStyles(this.element, { filter });
    return this;
  }

  /** Preset shadow utilities */
  
  /** Small box shadow */
  sm(): this {
    return this.box('0 1px 2px 0 rgba(0, 0, 0, 0.05)');
  }

  /** Medium box shadow */
  md(): this {
    return this.box('0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)');
  }

  /** Large box shadow */
  lg(): this {
    return this.box('0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)');
  }

  /** Extra large box shadow */
  xl(): this {
    return this.box('0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)');
  }

  /** 2x extra large box shadow */
  xl2(): this {
    return this.box('0 25px 50px -12px rgba(0, 0, 0, 0.25)');
  }

  /** Inner shadow */
  inner(): this {
    return this.box({ inset: true, x: 0, y: 2, blur: 4, color: 'rgba(0, 0, 0, 0.06)' });
  }

  /** Removes all shadows */
  none(): this {
    applyStyles(this.element, { 
      boxShadow: 'none',
      textShadow: 'none',
      filter: 'none'
    });
    return this;
  }

  /**
   * Creates a glow effect
   */
  glow(color = 'var(--fluent-color-primary-500)', intensity = 0.5): this {
    const alpha = Math.round(intensity * 255).toString(16).padStart(2, '0');
    return this.box({
      x: 0,
      y: 0,
      blur: 20,
      spread: 0,
      color: `${color}${alpha}`
    });
  }

  /**
   * Creates neumorphism effect
   */
  neumorphism(config: { light?: string; dark?: string; distance?: number } = {}): this {
    const { light = '#ffffff', dark = '#d1d5db', distance = 8 } = config;
    
    return this.boxMultiple(
      { x: -distance, y: -distance, blur: distance * 2, color: light },
      { x: distance, y: distance, blur: distance * 2, color: dark }
    );
  }

  /**
   * Applies responsive shadow configuration
   */
  responsive(map: ShadowResponsiveMap, options: ResponsiveOptions<any> = {}): this {
    observeResponsive(map, (config) => {
      const styles: CSSProperties = {};
      if (config.boxShadow) styles.boxShadow = config.boxShadow;
      if (config.textShadow) styles.textShadow = config.textShadow;
      if (config.filter) styles.filter = config.filter;
      applyStyles(this.element, styles);
    }, (fn) => this.registerCleanup(fn), options);
    return this;
  }

  /**
   * Cleanup method to remove event listeners and observers
   */
  destroy(): void {
    this.cleanupFns.forEach((cleanup) => cleanup());
    this.cleanupFns = [];
  }

  private normalizeValue(value: string | number): string {
    if (typeof value === 'number') {
      return value === 0 ? '0' : `${value}px`;
    }
    return value;
  }

  private registerCleanup(fn: CleanupFn): void {
    this.cleanupFns.push(fn);
  }
}