import { applyStyles } from '../utils/css-engine';
import type { CSSProperties } from '../utils/css-engine';

export class EffectsEngine {
  private styleId: string;

  constructor(private element: HTMLElement) {
    this.styleId = `effects-${Math.random().toString(36).substr(2, 9)}`;
    this.element.classList.add(this.styleId);
  }

  // SHADOWS
  shadow(value: string): this {
    applyStyles(this.element, { boxShadow: value });
    return this;
  }

  shadowSm(): this { return this.shadow('0 1px 2px rgba(0,0,0,0.05)'); }
  shadowMd(): this { return this.shadow('0 4px 6px rgba(0,0,0,0.07)'); }
  shadowLg(): this { return this.shadow('0 10px 15px rgba(0,0,0,0.1)'); }
  shadowXl(): this { return this.shadow('0 20px 25px rgba(0,0,0,0.1)'); }
  shadowInner(): this { return this.shadow('inset 0 2px 4px rgba(0,0,0,0.06)'); }

  // TEXT SHADOW
  textShadow(value: string): this {
    applyStyles(this.element, { textShadow: value });
    return this;
  }

  textShadowSm(): this { return this.textShadow('1px 1px 2px rgba(0,0,0,0.3)'); }
  textShadowMd(): this { return this.textShadow('2px 2px 4px rgba(0,0,0,0.3)'); }
  textShadowLg(): this { return this.textShadow('3px 3px 6px rgba(0,0,0,0.3)'); }

  // FILTERS
  blur(value: string): this {
    applyStyles(this.element, { filter: `blur(${value})` });
    return this;
  }

  brightness(value: number): this {
    applyStyles(this.element, { filter: `brightness(${value})` });
    return this;
  }

  contrast(value: number): this {
    applyStyles(this.element, { filter: `contrast(${value})` });
    return this;
  }

  grayscale(value: number = 1): this {
    applyStyles(this.element, { filter: `grayscale(${value})` });
    return this;
  }

  // BACKDROP FILTER
  backdropBlur(value: string): this {
    applyStyles(this.element, { backdropFilter: `blur(${value})` });
    return this;
  }

  // PSEUDO ELEMENTS
  before(styles: CSSProperties): this {
    this.addPseudoRule('::before', { content: '""', ...styles });
    return this;
  }

  after(styles: CSSProperties): this {
    this.addPseudoRule('::after', { content: '""', ...styles });
    return this;
  }

  // TRANSFORMS
  scale(value: number): this {
    applyStyles(this.element, { transform: `scale(${value})` });
    return this;
  }

  rotate(value: string): this {
    applyStyles(this.element, { transform: `rotate(${value})` });
    return this;
  }

  translate(x: string, y: string): this {
    applyStyles(this.element, { transform: `translate(${x}, ${y})` });
    return this;
  }

  // GRADIENTS
  gradientLinear(direction: string, ...colors: string[]): this {
    applyStyles(this.element, { 
      background: `linear-gradient(${direction}, ${colors.join(', ')})` 
    });
    return this;
  }

  gradientRadial(...colors: string[]): this {
    applyStyles(this.element, { 
      background: `radial-gradient(${colors.join(', ')})` 
    });
    return this;
  }

  // CLIP PATH
  clipPath(value: string): this {
    applyStyles(this.element, { clipPath: value });
    return this;
  }

  clipCircle(radius: string): this {
    return this.clipPath(`circle(${radius})`);
  }

  clipPolygon(...points: string[]): this {
    return this.clipPath(`polygon(${points.join(', ')})`);
  }

  private addPseudoRule(pseudo: string, styles: CSSProperties): void {
    const styleEl = document.createElement('style');
    const rules = Object.entries(styles).map(([key, value]) => 
      `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`
    ).join('; ');
    
    styleEl.textContent = `.${this.styleId}${pseudo} { ${rules} }`;
    document.head.appendChild(styleEl);
  }
}