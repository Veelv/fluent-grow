/**
 * Fluent Grow Pseudo-Elements System
 * ----------------------------------
 * Provides utilities for styling pseudo-elements (::before, ::after) with
 * comprehensive positioning, styling and responsive support.
 */

import type { CSSProperties } from '../utils/css-engine';
import {
  type CleanupFn
} from '../layout/shared';

export interface PseudoElementConfig extends CSSProperties {
  content?: string;
  position?: 'absolute' | 'relative' | 'fixed' | 'sticky';
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  width?: string | number;
  height?: string | number;
  background?: string;
  border?: string;
  borderRadius?: string | number;
  opacity?: number;
  transform?: string;
  zIndex?: number;
}



export class PseudoElements {
  private cleanupFns: CleanupFn[] = [];
  private styleSheet?: CSSStyleSheet;
  private pseudoRules = new Map<string, string>();
  private elementClass: string;

  constructor(private element: HTMLElement) {
    this.elementClass = this.generateUniqueClass();
    this.element.classList.add(this.elementClass);
    this.initializeStyleSheet();
  }

  /**
   * Styles the ::before pseudo-element
   */
  before(config: PseudoElementConfig): this {
    this.addPseudoElement('::before', config);
    return this;
  }

  /**
   * Styles the ::after pseudo-element
   */
  after(config: PseudoElementConfig): this {
    this.addPseudoElement('::after', config);
    return this;
  }

  /**
   * Cleanup method to remove stylesheets and observers
   */
  destroy(): void {
    this.cleanupFns.forEach((cleanup) => cleanup());
    this.cleanupFns = [];
    this.pseudoRules.clear();
  }

  private addPseudoElement(pseudo: string, config: Partial<PseudoElementConfig>): void {
    const styles: string[] = [];
    
    // Required content property for ::before and ::after
    if ((pseudo === '::before' || pseudo === '::after') && !config.content) {
      styles.push('content: ""');
    } else if (config.content !== undefined) {
      styles.push(`content: "${config.content}"`);
    }
    
    // Position and dimensions
    if (config.position) styles.push(`position: ${config.position}`);
    if (config.top !== undefined) styles.push(`top: ${this.normalizeValue(config.top)}`);
    if (config.right !== undefined) styles.push(`right: ${this.normalizeValue(config.right)}`);
    if (config.bottom !== undefined) styles.push(`bottom: ${this.normalizeValue(config.bottom)}`);
    if (config.left !== undefined) styles.push(`left: ${this.normalizeValue(config.left)}`);
    if (config.width !== undefined) styles.push(`width: ${this.normalizeValue(config.width)}`);
    if (config.height !== undefined) styles.push(`height: ${this.normalizeValue(config.height)}`);
    
    // Styling properties
    if (config.background) styles.push(`background: ${config.background}`);
    if (config.border) styles.push(`border: ${config.border}`);
    if (config.borderRadius !== undefined) styles.push(`border-radius: ${this.normalizeValue(config.borderRadius)}`);
    if (config.opacity !== undefined) styles.push(`opacity: ${config.opacity}`);
    if (config.transform) styles.push(`transform: ${config.transform}`);
    if (config.zIndex !== undefined) styles.push(`z-index: ${config.zIndex}`);

    const rule = `.${this.elementClass}${pseudo} { ${styles.join('; ')} }`;
    this.addCSSRule(rule);
    this.pseudoRules.set(`${this.elementClass}${pseudo}`, rule);
  }

  private initializeStyleSheet(): void {
    if (typeof document === 'undefined') return;
    
    if (document.adoptedStyleSheets) {
      this.styleSheet = new CSSStyleSheet();
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, this.styleSheet];
    }
  }

  private addCSSRule(rule: string): void {
    if (this.styleSheet) {
      try {
        this.styleSheet.insertRule(rule);
      } catch (error) {
        this.fallbackToStyleElement(rule);
      }
    } else {
      this.fallbackToStyleElement(rule);
    }
  }

  private fallbackToStyleElement(rule: string): void {
    const style = document.createElement('style');
    style.textContent = rule;
    style.setAttribute('data-fluent-pseudo', this.elementClass);
    document.head.appendChild(style);
  }

  private generateUniqueClass(): string {
    return `fluent-pseudo-${Math.random().toString(36).substr(2, 9)}`;
  }

  private normalizeValue(value: string | number): string {
    if (typeof value === 'number') {
      return value === 0 ? '0' : `${value}px`;
    }
    return value;
  }


}