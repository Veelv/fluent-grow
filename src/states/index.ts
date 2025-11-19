import { applyStyles } from '../utils/css-engine';
import type { CSSProperties } from '../utils/css-engine';

export class StatesEngine {
  private styleId: string;

  constructor(private element: HTMLElement) {
    this.styleId = `states-${Math.random().toString(36).substr(2, 9)}`;
    this.element.classList.add(this.styleId);
  }

  // HOVER STATES
  hover(styles: CSSProperties): this {
    this.addStateRule(':hover', styles);
    return this;
  }

  // FOCUS STATES
  focus(styles: CSSProperties): this {
    this.addStateRule(':focus', styles);
    return this;
  }

  focusVisible(styles: CSSProperties): this {
    this.addStateRule(':focus-visible', styles);
    return this;
  }

  // ACTIVE STATES
  active(styles: CSSProperties): this {
    this.addStateRule(':active', styles);
    return this;
  }

  // DISABLED STATES
  disabled(styles: CSSProperties): this {
    this.addStateRule(':disabled', styles);
    return this;
  }

  // CURSOR
  cursor(type: string): this {
    applyStyles(this.element, { cursor: type });
    return this;
  }

  cursorPointer(): this { return this.cursor('pointer'); }
  cursorGrab(): this { return this.cursor('grab'); }
  cursorNotAllowed(): this { return this.cursor('not-allowed'); }

  // USER SELECT
  userSelect(value: string): this {
    applyStyles(this.element, { userSelect: value });
    return this;
  }

  selectNone(): this { return this.userSelect('none'); }
  selectAll(): this { return this.userSelect('all'); }

  // POINTER EVENTS
  pointerEvents(value: string): this {
    applyStyles(this.element, { pointerEvents: value });
    return this;
  }

  pointerNone(): this { return this.pointerEvents('none'); }
  pointerAuto(): this { return this.pointerEvents('auto'); }

  // VISIBILITY
  visibility(value: string): this {
    applyStyles(this.element, { visibility: value });
    return this;
  }

  visible(): this { return this.visibility('visible'); }
  hidden(): this { return this.visibility('hidden'); }

  // OPACITY
  opacity(value: number): this {
    applyStyles(this.element, { opacity: value.toString() });
    return this;
  }

  private addStateRule(state: string, styles: CSSProperties): void {
    const styleEl = document.createElement('style');
    const rules = Object.entries(styles).map(([key, value]) => 
      `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`
    ).join('; ');
    
    styleEl.textContent = `.${this.styleId}${state} { ${rules} }`;
    document.head.appendChild(styleEl);
  }
}