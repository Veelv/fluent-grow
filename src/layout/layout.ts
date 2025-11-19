/**
 * Fluent Grow Layout - Aggregator
 * --------------------------------
 * Provides a high-level API that composes spacing, sizing, positioning and
 * overflow utilities for expressive layout declarations.
 */

import { Positioning, type OffsetConfig, type PositionMode, type PositioningConfig, type PositioningResponsiveMap } from './positioning';
import {
  Spacing,
  type SpacingConfig,
  type SpacingResponsiveMap,
  type SpacingScale,
  type SpacingValue
} from './spacing';
import {
  Sizing,
  type ClampConfig,
  type SizingConfig,
  type SizingResponsiveMap,
  type SizingScale,
  type SizingValue
} from './sizing';
import { Overflow, type OverflowConfig, type OverflowResponsiveMap } from './overflow';
import type { ResponsiveOptions } from './shared';
import { applyStyles } from '../utils/css-engine';
import { BreakpointManager, type BreakpointDescriptor } from '../responsive/breakpoints';
import { applyContainerQueries, type ContainerQueryController } from '../responsive/container-queries';

const spacingToken = (token: string, fallback: string): SpacingValue => ({ token: `fluent-${token}`, fallback });

export interface LayoutOptions {
  spacingScale?: SpacingScale;
  sizingScale?: SizingScale;
  positioningDefaults?: PositioningConfig;
}

export class Layout {
  private readonly _positioning: Positioning;
  private readonly _spacing: Spacing;
  private readonly _sizing: Sizing;
  private readonly _overflow: Overflow;
  private cleanupFns: Array<() => void> = [];

  constructor(private element: HTMLElement, options: LayoutOptions = {}) {
    this._positioning = new Positioning(element, options.positioningDefaults);
    this._spacing = new Spacing(element, options.spacingScale);
    this._sizing = new Sizing(element, options.sizingScale);
    this._overflow = new Overflow(element);
  }

  spacing(...values: SpacingValue[]): this {
    this._spacing.padding(...values);
    return this;
  }

  margin(...values: SpacingValue[]): this {
    this._spacing.margin(...values);
    return this;
  }

  marginX(value: SpacingValue): this {
    this._spacing.marginX(value);
    return this;
  }

  marginY(value: SpacingValue): this {
    this._spacing.marginY(value);
    return this;
  }

  padding(...values: SpacingValue[]): this {
    this._spacing.padding(...values);
    return this;
  }

  paddingX(value: SpacingValue): this {
    this._spacing.paddingX(value);
    return this;
  }

  paddingY(value: SpacingValue): this {
    this._spacing.paddingY(value);
    return this;
  }

  gap(value: SpacingValue): this {
    this._spacing.gap(value);
    return this;
  }

  inset(...values: SpacingValue[]): this {
    this._spacing.inset(...values);
    return this;
  }

  size(width?: SizingValue, height?: SizingValue): this {
    this._sizing.size(width, height);
    return this;
  }

  minSize(width?: SizingValue, height?: SizingValue): this {
    this._sizing.minSize(width, height);
    return this;
  }

  maxSize(width?: SizingValue, height?: SizingValue): this {
    this._sizing.maxSize(width, height);
    return this;
  }

  aspectRatio(value: string | number): this {
    this._sizing.aspectRatio(value);
    return this;
  }

  fluid(property: ClampConfig['property'], min: SizingValue, ideal: SizingValue, max: SizingValue): this {
    this._sizing.fluid(property, min, ideal, max);
    return this;
  }

  position(mode: PositionMode, offsets: OffsetConfig = {}): this {
    this._positioning.mode(mode, offsets);
    return this;
  }

  absolute(offsets: OffsetConfig = {}): this {
    this._positioning.absolute(offsets);
    return this;
  }

  relative(offsets: OffsetConfig = {}): this {
    this._positioning.relative(offsets);
    return this;
  }

  fixed(offsets: OffsetConfig = {}): this {
    this._positioning.fixed(offsets);
    return this;
  }

  sticky(offsets: OffsetConfig = {}): this {
    this._positioning.sticky(offsets);
    return this;
  }

  zIndex(value: number): this {
    this._positioning.zIndex(value);
    return this;
  }

  anchor(options: { name: string; offset?: SizingValue; reference?: PositioningConfig['anchorReference'] }): this {
    this._positioning.anchor(options);
    return this;
  }

  center(axis: 'both' | 'x' | 'y' = 'both', strategy: 'transform' | 'margin' = 'transform'): this {
    this._positioning.center(axis, strategy);
    return this;
  }

  overflowHidden(axis: 'x' | 'y' | 'both' = 'both'): this {
    this._overflow.hidden(axis);
    return this;
  }

  overflowAuto(axis: 'x' | 'y' | 'both' = 'both'): this {
    this._overflow.auto(axis);
    return this;
  }

  overflowScroll(axis: 'x' | 'y' | 'both' = 'both'): this {
    this._overflow.scroll(axis);
    return this;
  }

  scrollSnap(type: string, align?: string, stop?: CSSStyleDeclaration['scrollSnapStop']): this {
    this._overflow.scrollSnap(type, align, stop);
    return this;
  }

  overscroll(value: CSSStyleDeclaration['overscrollBehavior'], axis: 'x' | 'y' | 'both' = 'both'): this {
    this._overflow.overscroll(value, axis);
    return this;
  }

  responsiveSpacing(map: SpacingResponsiveMap, options?: ResponsiveOptions<SpacingConfig>): this {
    this._spacing.responsive(map, options ?? {});
    return this;
  }

  responsiveSizing(map: SizingResponsiveMap, options?: ResponsiveOptions<SizingConfig>): this {
    this._sizing.responsive(map, options ?? {});
    return this;
  }

  responsivePositioning(map: PositioningResponsiveMap, options?: ResponsiveOptions<PositioningConfig>): this {
    this._positioning.responsive(map, options ?? {});
    return this;
  }

  responsiveOverflow(map: OverflowResponsiveMap, options?: ResponsiveOptions<OverflowConfig>): this {
    this._overflow.responsive(map, options ?? {});
    return this;
  }

  customStyles(styles: Record<string, string | number | undefined>): this {
    applyStyles(this.element, styles);
    return this;
  }

  onDestroy(fn: () => void): this {
    this.cleanupFns.push(fn);
    return this;
  }

  get positioningModule(): Positioning {
    return this._positioning;
  }

  get spacingModule(): Spacing {
    return this._spacing;
  }

  get sizingModule(): Sizing {
    return this._sizing;
  }

  get overflowModule(): Overflow {
    return this._overflow;
  }

  destroy(): void {
    this._positioning.destroy();
    this._spacing.destroy();
    this._sizing.destroy();
    this._overflow.destroy();
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns = [];
  }
}

export class LayoutPresets {
  static fullScreen(element: HTMLElement): Layout {
    return new Layout(element)
      .size('100vw', '100vh')
      .position('fixed', { inset: 0 })
      .overflowHidden();
  }

  static container(element: HTMLElement, options: { name?: string } = {}): Layout {
    const layout = new Layout(element);

    layout
      .margin('0', 'auto')
      .padding(spacingToken('spacing-lg', '1.5rem'))
      .maxSize(`var(--fluent-container-xs, 100%)`);

    const responsiveSpacing: SpacingResponsiveMap = {
      [BreakpointManager.query('sm')]: { paddingX: spacingToken('spacing-xl', '2rem') },
      [BreakpointManager.query('lg')]: { paddingX: spacingToken('spacing-2xl', '3rem') }
    };

    const responsiveSizing = buildResponsiveSizingMap();

    layout.responsiveSpacing(responsiveSpacing);
    if (Object.keys(responsiveSizing).length) {
      layout.responsiveSizing(responsiveSizing);
    }

    const controller = applyContainerQueries(element, {
      name: options.name ?? 'layout-container',
      base: () => {
        layout.spacingModule.padding(spacingToken('spacing-lg', '1.5rem'));
      },
      rules: [
        {
          condition: { breakpoint: 'md' },
          apply: () => layout.spacingModule.padding(spacingToken('spacing-xl', '2rem'))
        },
        {
          condition: { breakpoint: 'xl' },
          apply: () => layout.spacingModule.padding(spacingToken('spacing-2xl', '3rem'))
        }
      ]
    });

    layout.onDestroy(() => controller.disconnect());
    return layout;
  }

  static centerContent(element: HTMLElement): Layout {
    applyStyles(element, { display: 'grid', 'place-items': 'center' });
    return new Layout(element).size('100%', '100%');
  }

  static stickyHeader(element: HTMLElement, top: SpacingValue = 0): Layout {
    return new Layout(element)
      .sticky({ top })
      .zIndex(100)
      .overflowHidden('x');
  }

  static card(element: HTMLElement): Layout {
    return new Layout(element)
      .padding(spacingToken('spacing-md', '1rem'))
      .gap(spacingToken('spacing-sm', '0.75rem'))
      .customStyles({ display: 'flex', 'flex-direction': 'column', 'border-radius': 'var(--fluent-radius-md, 12px)' });
  }

  static responsiveStack(element: HTMLElement): Layout {
    const layout = new Layout(element);
    layout
      .customStyles({ display: 'flex', 'flex-direction': 'column' })
      .gap(spacingToken('spacing-md', '1rem'));

    const spacingMap: SpacingResponsiveMap = {
      [BreakpointManager.query('md')]: { gap: spacingToken('spacing-lg', '1.5rem') },
      [BreakpointManager.query('xl')]: { gap: spacingToken('spacing-xl', '2rem') }
    };

    layout.responsiveSpacing(spacingMap);

    const controller: ContainerQueryController = applyContainerQueries(element, {
      name: 'responsive-stack',
      base: () => {
        layout.customStyles({ display: 'flex', 'flex-direction': 'column' });
        layout.spacingModule.gap(spacingToken('spacing-md', '1rem'));
      },
      rules: [
        {
          condition: { breakpoint: 'lg' },
          apply: () => {
            layout.customStyles({ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' });
            layout.spacingModule.gap(spacingToken('spacing-xl', '2rem'));
          }
        },
        {
          condition: { breakpoint: 'xl' },
          apply: () => {
            layout.customStyles({ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' });
            layout.spacingModule.gap(spacingToken('spacing-2xl', '3rem'));
          }
        }
      ]
    });

    layout.onDestroy(() => controller.disconnect());
    return layout;
  }
}

function buildResponsiveSizingMap(): SizingResponsiveMap {
  const sizingMap: SizingResponsiveMap = {};
  BreakpointManager.all().forEach((descriptor: BreakpointDescriptor) => {
    const containerWidth = BreakpointManager.containerWidth(descriptor.name);
    if (!containerWidth) {
      return;
    }
    sizingMap[BreakpointManager.query(descriptor.name)] = {
      maxWidth: `var(--fluent-container-${descriptor.name}, ${containerWidth}px)`
    };
  });
  return sizingMap;
}
