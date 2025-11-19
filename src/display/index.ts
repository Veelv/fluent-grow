import { applyStyles } from '../utils/css-engine';

export class DisplayEngine {
  constructor(private element: HTMLElement) {}

  // DISPLAY
  display(value: string): this {
    applyStyles(this.element, { display: value });
    return this;
  }

  block(): this { return this.display('block'); }
  inline(): this { return this.display('inline'); }
  inlineBlock(): this { return this.display('inline-block'); }
  flex(): this { return this.display('flex'); }
  grid(): this { return this.display('grid'); }
  none(): this { return this.display('none'); }

  // OVERFLOW
  overflow(value: string): this {
    applyStyles(this.element, { overflow: value });
    return this;
  }

  overflowHidden(): this { return this.overflow('hidden'); }
  overflowScroll(): this { return this.overflow('scroll'); }
  overflowAuto(): this { return this.overflow('auto'); }

  // POSITION
  position(value: string): this {
    applyStyles(this.element, { position: value });
    return this;
  }

  relative(): this { return this.position('relative'); }
  absolute(): this { return this.position('absolute'); }
  fixed(): this { return this.position('fixed'); }
  sticky(): this { return this.position('sticky'); }

  // POSITIONING
  top(value: string): this {
    applyStyles(this.element, { top: value });
    return this;
  }

  right(value: string): this {
    applyStyles(this.element, { right: value });
    return this;
  }

  bottom(value: string): this {
    applyStyles(this.element, { bottom: value });
    return this;
  }

  left(value: string): this {
    applyStyles(this.element, { left: value });
    return this;
  }

  // Z-INDEX
  zIndex(value: number): this {
    applyStyles(this.element, { zIndex: value.toString() });
    return this;
  }

  // OBJECT FIT
  objectFit(value: string): this {
    applyStyles(this.element, { objectFit: value });
    return this;
  }

  objectCover(): this { return this.objectFit('cover'); }
  objectContain(): this { return this.objectFit('contain'); }

  // ASPECT RATIO
  aspectRatio(value: string): this {
    applyStyles(this.element, { aspectRatio: value });
    return this;
  }

  aspectSquare(): this { return this.aspectRatio('1/1'); }
  aspectVideo(): this { return this.aspectRatio('16/9'); }
}