/**
 * Fluent Grow Layout - Overflow Module
 * ------------------------------------
 * Controls overflow behaviours, scroll snapping and masking utilities with
 * responsive breakpoints.
 */

import { applyStyles } from '../utils/css-engine';
import {
  createStyles,
  observeResponsive,
  type CleanupFn,
  type ResponsiveInput,
  type ResponsiveOptions
} from './shared';

export interface OverflowConfig {
  overflow?: CSSStyleDeclaration['overflow'];
  overflowX?: CSSStyleDeclaration['overflowX'];
  overflowY?: CSSStyleDeclaration['overflowY'];
  overscrollBehavior?: CSSStyleDeclaration['overscrollBehavior'];
  overscrollBehaviorX?: CSSStyleDeclaration['overscrollBehaviorX'];
  overscrollBehaviorY?: CSSStyleDeclaration['overscrollBehaviorY'];
  scrollBehavior?: CSSStyleDeclaration['scrollBehavior'];
  scrollSnapType?: string;
  scrollSnapAlign?: string;
  scrollSnapStop?: CSSStyleDeclaration['scrollSnapStop'];
  scrollPadding?: string;
  scrollMargin?: string;
  scrollbarGutter?: CSSStyleDeclaration['scrollbarGutter'];
  mask?: string;
  maskComposite?: string;
  clipPath?: string;
  touchAction?: CSSStyleDeclaration['touchAction'];
}

export type OverflowResponsiveMap = ResponsiveInput<OverflowConfig>;

export class Overflow {
  private cleanupFns: CleanupFn[] = [];

  constructor(private element: HTMLElement) {}

  set(config: OverflowConfig): this {
    this.applyConfig(config);
    return this;
  }

  hidden(axis: 'x' | 'y' | 'both' = 'both'): this {
    if (axis === 'both') {
      this.applyConfig({ overflow: 'hidden' });
    } else {
      this.applyConfig(axis === 'x' ? { overflowX: 'hidden' } : { overflowY: 'hidden' });
    }
    return this;
  }

  auto(axis: 'x' | 'y' | 'both' = 'both'): this {
    if (axis === 'both') {
      this.applyConfig({ overflow: 'auto' });
    } else {
      this.applyConfig(axis === 'x' ? { overflowX: 'auto' } : { overflowY: 'auto' });
    }
    return this;
  }

  scroll(axis: 'x' | 'y' | 'both' = 'both'): this {
    if (axis === 'both') {
      this.applyConfig({ overflow: 'scroll' });
    } else {
      this.applyConfig(axis === 'x' ? { overflowX: 'scroll' } : { overflowY: 'scroll' });
    }
    return this;
  }

  clip(): this {
    this.applyConfig({ overflow: 'clip' });
    return this;
  }

  overscroll(value: CSSStyleDeclaration['overscrollBehavior'], axis: 'x' | 'y' | 'both' = 'both'): this {
    if (axis === 'both') {
      this.applyConfig({ overscrollBehavior: value });
    } else {
      this.applyConfig(axis === 'x' ? { overscrollBehaviorX: value } : { overscrollBehaviorY: value });
    }
    return this;
  }

  scrollSnap(type: string, align?: string, stop?: CSSStyleDeclaration['scrollSnapStop']): this {
    const config: OverflowConfig = { scrollSnapType: type };
    if (align !== undefined) {
      config.scrollSnapAlign = align;
    }
    if (stop !== undefined) {
      config.scrollSnapStop = stop;
    }
    this.applyConfig(config);
    return this;
  }

  scrollPadding(value: string): this {
    this.applyConfig({ scrollPadding: value });
    return this;
  }

  scrollMargin(value: string): this {
    this.applyConfig({ scrollMargin: value });
    return this;
  }

  scrollBehavior(value: CSSStyleDeclaration['scrollBehavior']): this {
    this.applyConfig({ scrollBehavior: value });
    return this;
  }

  scrollbarGutter(value: CSSStyleDeclaration['scrollbarGutter']): this {
    this.applyConfig({ scrollbarGutter: value });
    return this;
  }

  mask(value: string, composite?: string): this {
    const config: OverflowConfig = { mask: value };
    if (composite !== undefined) {
      config.maskComposite = composite;
    }
    this.applyConfig(config);
    return this;
  }

  clipPath(value: string): this {
    this.applyConfig({ clipPath: value });
    return this;
  }

  touchAction(value: CSSStyleDeclaration['touchAction']): this {
    this.applyConfig({ touchAction: value });
    return this;
  }

  responsive(responsive: OverflowResponsiveMap, options: ResponsiveOptions<OverflowConfig> = {}): this {
    observeResponsive(responsive, (config) => this.applyConfig(config), (fn) => this.registerCleanup(fn), options);
    return this;
  }

  destroy(): void {
    this.cleanupFns.forEach((cleanup) => cleanup());
    this.cleanupFns = [];
  }

  private applyConfig(config: OverflowConfig): void {
    const styles = createStyles();

    if (config.overflow !== undefined) {
      styles.overflow = config.overflow;
    }
    if (config.overflowX !== undefined) {
      styles['overflow-x'] = config.overflowX;
    }
    if (config.overflowY !== undefined) {
      styles['overflow-y'] = config.overflowY;
    }
    if (config.overscrollBehavior !== undefined) {
      styles['overscroll-behavior'] = config.overscrollBehavior;
    }
    if (config.overscrollBehaviorX !== undefined) {
      styles['overscroll-behavior-x'] = config.overscrollBehaviorX;
    }
    if (config.overscrollBehaviorY !== undefined) {
      styles['overscroll-behavior-y'] = config.overscrollBehaviorY;
    }
    if (config.scrollBehavior !== undefined) {
      styles['scroll-behavior'] = config.scrollBehavior;
    }
    if (config.scrollSnapType !== undefined) {
      styles['scroll-snap-type'] = config.scrollSnapType;
    }
    if (config.scrollSnapAlign !== undefined) {
      styles['scroll-snap-align'] = config.scrollSnapAlign;
    }
    if (config.scrollSnapStop !== undefined) {
      styles['scroll-snap-stop'] = config.scrollSnapStop;
    }
    if (config.scrollPadding !== undefined) {
      styles['scroll-padding'] = config.scrollPadding;
    }
    if (config.scrollMargin !== undefined) {
      styles['scroll-margin'] = config.scrollMargin;
    }
    if (config.scrollbarGutter !== undefined) {
      styles['scrollbar-gutter'] = config.scrollbarGutter;
    }
    if (config.mask !== undefined) {
      styles.mask = config.mask;
    }
    if (config.maskComposite !== undefined) {
      styles['mask-composite'] = config.maskComposite;
    }
    if (config.clipPath !== undefined) {
      styles['clip-path'] = config.clipPath;
    }
    if (config.touchAction !== undefined) {
      styles['touch-action'] = config.touchAction;
    }

    applyStyles(this.element, styles);
  }

  private registerCleanup(fn: CleanupFn): void {
    this.cleanupFns.push(fn);
  }
}

