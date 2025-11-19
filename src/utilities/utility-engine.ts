import { applyStyles } from '../utils/css-engine';
import type { CSSProperties } from '../utils/css-engine';
import { BreakpointManager } from '../responsive/breakpoints';
import { observeResponsive, type ResponsiveInput } from '../layout/shared';

export interface UtilityConfig extends CSSProperties {
  // Spacing utilities
  m?: string | number;
  mx?: string | number;
  my?: string | number;
  mt?: string | number;
  mr?: string | number;
  mb?: string | number;
  ml?: string | number;
  p?: string | number;
  px?: string | number;
  py?: string | number;
  pt?: string | number;
  pr?: string | number;
  pb?: string | number;
  pl?: string | number;
  
  // Modern CSS utilities
  containerType?: 'normal' | 'size' | 'inline-size';
  anchorName?: string;
  positionAnchor?: string;
  viewTransitionName?: string;
  animationTimeline?: 'scroll' | 'view' | string;
}

export type ResponsiveUtilityMap = ResponsiveInput<UtilityConfig>;

export class UtilityEngine {
  private cleanupFns: (() => void)[] = [];

  constructor(private element: HTMLElement) {}

  // Spacing utilities (logical properties)
  margin(value: string | number): this {
    return this.set({ margin: this.normalizeValue(value) });
  }

  marginX(value: string | number): this {
    return this.set({ marginInline: this.normalizeValue(value) });
  }

  marginY(value: string | number): this {
    return this.set({ marginBlock: this.normalizeValue(value) });
  }

  marginTop(value: string | number): this {
    return this.set({ marginBlockStart: this.normalizeValue(value) });
  }

  marginRight(value: string | number): this {
    return this.set({ marginInlineEnd: this.normalizeValue(value) });
  }

  marginBottom(value: string | number): this {
    return this.set({ marginBlockEnd: this.normalizeValue(value) });
  }

  marginLeft(value: string | number): this {
    return this.set({ marginInlineStart: this.normalizeValue(value) });
  }

  padding(value: string | number): this {
    return this.set({ padding: this.normalizeValue(value) });
  }

  paddingX(value: string | number): this {
    return this.set({ paddingInline: this.normalizeValue(value) });
  }

  paddingY(value: string | number): this {
    return this.set({ paddingBlock: this.normalizeValue(value) });
  }

  // Color utilities (OKLCH-based)
  textColor(palette: string, level: string): this {
    const color = `var(--fluent-color-${palette}-${level})`;
    return this.set({ color });
  }

  backgroundColor(palette: string, level: string): this {
    const color = `var(--fluent-color-${palette}-${level})`;
    return this.set({ backgroundColor: color });
  }

  borderColor(palette: string, level: string): this {
    const color = `var(--fluent-color-${palette}-${level})`;
    return this.set({ borderColor: color });
  }

  // Gradient utilities
  gradientTo(palette: string, ...levels: string[]): this {
    const colors = levels.map(level => `var(--fluent-color-${palette}-${level})`);
    const gradient = `linear-gradient(135deg, ${colors.join(', ')})`;
    return this.set({ background: gradient });
  }

  // Modern CSS utilities
  containerQuery(type: 'normal' | 'size' | 'inline-size' = 'inline-size'): this {
    return this.set({ containerType: type });
  }

  anchor(name: string): this {
    return this.set({ anchorName: `--${name}` });
  }

  anchorTo(target: string): this {
    return this.set({ positionAnchor: `--${target}` });
  }

  viewTransition(name: string): this {
    return this.set({ viewTransitionName: name });
  }

  scrollAnimation(): this {
    return this.set({ animationTimeline: 'scroll()' });
  }

  viewAnimation(): this {
    return this.set({ animationTimeline: 'view()' });
  }

  // Subgrid utilities
  subgrid(): this {
    return this.set({
      gridTemplateColumns: 'subgrid',
      gridTemplateRows: 'subgrid'
    });
  }

  subgridColumns(): this {
    return this.set({ gridTemplateColumns: 'subgrid' });
  }

  subgridRows(): this {
    return this.set({ gridTemplateRows: 'subgrid' });
  }

  // Fluid typography
  fluidText(min: string, max: string, minVw = '320px', maxVw = '1200px'): this {
    const fluid = `clamp(${min}, ${min} + (${max} - ${min}) * ((100vw - ${minVw}) / (${maxVw} - ${minVw})), ${max})`;
    return this.set({ fontSize: fluid });
  }

  // Advanced effects
  backdropBlur(amount = '8px'): this {
    return this.set({ backdropFilter: `blur(${amount})` });
  }

  glassmorphism(blur = '10px', opacity = 0.1): this {
    return this.set({
      backdropFilter: `blur(${blur})`,
      backgroundColor: `oklch(100% 0 0 / ${opacity})`,
      border: '1px solid oklch(100% 0 0 / 0.2)'
    });
  }

  // Houdini paint worklets
  paintRipple(): this {
    return this.set({ backgroundImage: 'paint(ripple)' });
  }

  paintNoise(): this {
    return this.set({ backgroundImage: 'paint(noise)' });
  }

  paintWaves(): this {
    return this.set({ backgroundImage: 'paint(waves)' });
  }

  // Responsive utilities
  responsive(map: ResponsiveUtilityMap): this {
    const normalised = Array.isArray(map) ? map : this.normaliseBreakpointMap(map);
    observeResponsive(
      normalised,
      (config) => this.apply(config),
      (fn) => this.cleanupFns.push(fn)
    );
    return this;
  }

  // State utilities
  hover(config: UtilityConfig): this {
    const hoverStyles: CSSProperties = {};
    Object.entries(config).forEach(([key, value]) => {
      if (value !== undefined) {
        hoverStyles[key] = value as string | number;
      }
    });

    this.element.addEventListener('mouseenter', () => {
      applyStyles(this.element, hoverStyles);
    });

    this.element.addEventListener('mouseleave', () => {
      // Reset styles - could be improved with state management
      Object.keys(hoverStyles).forEach(key => {
        this.element.style.removeProperty(key);
      });
    });

    return this;
  }

  focus(config: UtilityConfig): this {
    const focusStyles: CSSProperties = {};
    Object.entries(config).forEach(([key, value]) => {
      if (value !== undefined) {
        focusStyles[key] = value as string | number;
      }
    });

    this.element.addEventListener('focus', () => {
      applyStyles(this.element, focusStyles);
    });

    this.element.addEventListener('blur', () => {
      Object.keys(focusStyles).forEach(key => {
        this.element.style.removeProperty(key);
      });
    });

    return this;
  }

  // Core methods
  set(config: UtilityConfig): this {
    this.apply(config);
    return this;
  }

  private apply(config: UtilityConfig): void {
    const styles: CSSProperties = {};
    
    // Handle spacing shortcuts
    if (config.m !== undefined) styles.margin = this.normalizeValue(config.m);
    if (config.mx !== undefined) styles.marginInline = this.normalizeValue(config.mx);
    if (config.my !== undefined) styles.marginBlock = this.normalizeValue(config.my);
    if (config.mt !== undefined) styles.marginBlockStart = this.normalizeValue(config.mt);
    if (config.mr !== undefined) styles.marginInlineEnd = this.normalizeValue(config.mr);
    if (config.mb !== undefined) styles.marginBlockEnd = this.normalizeValue(config.mb);
    if (config.ml !== undefined) styles.marginInlineStart = this.normalizeValue(config.ml);
    
    if (config.p !== undefined) styles.padding = this.normalizeValue(config.p);
    if (config.px !== undefined) styles.paddingInline = this.normalizeValue(config.px);
    if (config.py !== undefined) styles.paddingBlock = this.normalizeValue(config.py);
    if (config.pt !== undefined) styles.paddingBlockStart = this.normalizeValue(config.pt);
    if (config.pr !== undefined) styles.paddingInlineEnd = this.normalizeValue(config.pr);
    if (config.pb !== undefined) styles.paddingBlockEnd = this.normalizeValue(config.pb);
    if (config.pl !== undefined) styles.paddingInlineStart = this.normalizeValue(config.pl);

    // Handle modern CSS properties
    if (config.containerType !== undefined) styles.containerType = config.containerType;
    if (config.anchorName !== undefined) styles.anchorName = config.anchorName;
    if (config.positionAnchor !== undefined) styles.positionAnchor = config.positionAnchor;
    if (config.viewTransitionName !== undefined) styles.viewTransitionName = config.viewTransitionName;
    if (config.animationTimeline !== undefined) styles.animationTimeline = config.animationTimeline;

    // Apply regular CSS properties
    Object.entries(config).forEach(([key, value]) => {
      if (value !== undefined && !this.isUtilityShortcut(key)) {
        styles[key] = value as string | number;
      }
    });

    applyStyles(this.element, styles);
  }

  private normalizeValue(value: string | number): string {
    if (typeof value === 'number') {
      return value === 0 ? '0' : `${value * 0.25}rem`;
    }
    return value;
  }

  private isUtilityShortcut(key: string): boolean {
    return ['m', 'mx', 'my', 'mt', 'mr', 'mb', 'ml', 'p', 'px', 'py', 'pt', 'pr', 'pb', 'pl'].includes(key);
  }

  private normaliseBreakpointMap(map: Record<string, UtilityConfig>): Record<string, UtilityConfig> {
    const normalised: Record<string, UtilityConfig> = {};
    Object.entries(map).forEach(([breakpoint, config]) => {
      const query = breakpoint.startsWith('(') ? breakpoint : BreakpointManager.query(breakpoint);
      normalised[query] = config;
    });
    return normalised;
  }

  destroy(): void {
    this.cleanupFns.forEach(cleanup => cleanup());
    this.cleanupFns = [];
  }
}