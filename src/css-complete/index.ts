import { UtilityEngine } from '../utilities/utility-engine';
import { EffectsEngine } from '../effects';
import { StatesEngine } from '../states';
import { TransformEngine } from '../transforms';
import { DisplayEngine } from '../display';
import { BorderEngine } from '../borders';
import { AnimationEngine } from '../animations';
import { Typography } from '../typography';
import { ColorManager } from '../colors';

export class FluentCSS {
  public utilities: UtilityEngine;
  public effects: EffectsEngine;
  public states: StatesEngine;
  public transforms: TransformEngine;
  public display: DisplayEngine;
  public borders: BorderEngine;
  public animations: AnimationEngine;
  public typography: Typography;
  public colors: ColorManager;

  constructor(element: HTMLElement) {
    this.utilities = new UtilityEngine(element);
    this.effects = new EffectsEngine(element);
    this.states = new StatesEngine(element);
    this.transforms = new TransformEngine(element);
    this.display = new DisplayEngine(element);
    this.borders = new BorderEngine(element);
    this.animations = new AnimationEngine(element);
    this.typography = new Typography(element);
    this.colors = new ColorManager();
  }

  // QUICK ACCESS METHODS
  
  // Display & Layout
  flex(): this { this.display.flex(); return this; }
  grid(): this { this.display.grid(); return this; }
  block(): this { this.display.block(); return this; }
  hidden(): this { this.display.none(); return this; }
  
  // Positioning
  relative(): this { this.display.relative(); return this; }
  absolute(): this { this.display.absolute(); return this; }
  fixed(): this { this.display.fixed(); return this; }
  
  // Spacing
  p(value: string | number): this { this.utilities.padding(value); return this; }
  m(value: string | number): this { this.utilities.margin(value); return this; }
  px(value: string | number): this { this.utilities.paddingX(value); return this; }
  py(value: string | number): this { this.utilities.paddingY(value); return this; }
  
  // Colors
  bg(palette: string, level: string): this { this.utilities.backgroundColor(palette, level); return this; }
  text(palette: string, level: string): this { this.utilities.textColor(palette, level); return this; }
  
  // Borders
  border(width: string, style?: string, color?: string): this { this.borders.border(width, style as any, color); return this; }
  rounded(value?: string): this { 
    if (value) this.borders.radius(value);
    else this.borders.rounded();
    return this; 
  }
  
  // Effects
  shadow(value?: string): this { 
    if (value) this.effects.shadow(value);
    else this.effects.shadowMd();
    return this; 
  }
  
  // Transforms
  scale(value: number): this { this.transforms.scale(value); return this; }
  rotate(value: string): this { this.transforms.rotate(value); return this; }
  
  // Animations
  fadeIn(): this { this.animations.fadeIn(); return this; }
  slideUp(): this { this.animations.slideUp(); return this; }
  
  // Cleanup
  destroy(): void {
    this.utilities.destroy();
    this.animations.destroy();
    this.typography.destroy();
  }
}

// Global function for easy access
export function css(element: HTMLElement | string): FluentCSS {
  const el = typeof element === 'string' ? document.querySelector(element) as HTMLElement : element;
  if (!el) throw new Error('Element not found');
  return new FluentCSS(el);
}

// Utility function for multiple elements
export function cssAll(selector: string): FluentCSS[] {
  const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
  return Array.from(elements).map(el => new FluentCSS(el));
}