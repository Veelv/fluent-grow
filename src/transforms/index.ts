import { applyStyles } from '../utils/css-engine';

export class TransformEngine {
  private transforms: string[] = [];

  constructor(private element: HTMLElement) {}

  // BASIC TRANSFORMS
  scale(value: number): this {
    this.transforms.push(`scale(${value})`);
    this.apply();
    return this;
  }

  rotate(value: string): this {
    this.transforms.push(`rotate(${value})`);
    this.apply();
    return this;
  }

  translate(x: string, y: string): this {
    this.transforms.push(`translate(${x}, ${y})`);
    this.apply();
    return this;
  }

  translateX(value: string): this {
    this.transforms.push(`translateX(${value})`);
    this.apply();
    return this;
  }

  translateY(value: string): this {
    this.transforms.push(`translateY(${value})`);
    this.apply();
    return this;
  }

  skew(x: string, y: string): this {
    this.transforms.push(`skew(${x}, ${y})`);
    this.apply();
    return this;
  }

  // 3D TRANSFORMS
  perspective(value: string): this {
    applyStyles(this.element, { perspective: value });
    return this;
  }

  rotateX(value: string): this {
    this.transforms.push(`rotateX(${value})`);
    this.apply();
    return this;
  }

  rotateY(value: string): this {
    this.transforms.push(`rotateY(${value})`);
    this.apply();
    return this;
  }

  // TRANSFORM ORIGIN
  transformOrigin(value: string): this {
    applyStyles(this.element, { transformOrigin: value });
    return this;
  }

  originCenter(): this { return this.transformOrigin('center'); }
  originTop(): this { return this.transformOrigin('top'); }

  // TRANSITIONS
  transition(property: string, duration: string, easing?: string): this {
    const transition = [property, duration, easing].filter(Boolean).join(' ');
    applyStyles(this.element, { transition });
    return this;
  }

  transitionAll(duration: string, easing?: string): this {
    return this.transition('all', duration, easing);
  }

  // ANIMATIONS
  animate(name: string, duration: string, easing?: string): this {
    const animation = [name, duration, easing].filter(Boolean).join(' ');
    applyStyles(this.element, { animation });
    return this;
  }

  // RESET
  reset(): this {
    this.transforms = [];
    applyStyles(this.element, { transform: 'none' });
    return this;
  }

  private apply(): void {
    applyStyles(this.element, { transform: this.transforms.join(' ') });
  }
}