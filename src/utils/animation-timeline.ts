export interface KeyframeDefinition {
  [offset: string]: Keyframe;
}

export interface TimelineOptions {
  duration?: number;
  easing?: string;
  delay?: number;
  fill?: FillMode;
}

export class AnimationTimeline {
  private animations: Array<Animation> = [];

  add(element: Element, keyframes: Keyframe[] | KeyframeDefinition, options: TimelineOptions = {}): this {
  const resolvedKeyframes = Array.isArray(keyframes) ? keyframes : convertKeyframeDefinition(keyframes);
    const animation = element.animate(resolvedKeyframes, {
      duration: options.duration ?? 300,
      easing: options.easing ?? 'ease-out',
      delay: options.delay ?? 0,
      fill: options.fill ?? 'both'
    });

    this.animations.push(animation);
    return this;
  }

  play(): void {
    this.animations.forEach((animation) => animation.play());
  }

  pause(): void {
    this.animations.forEach((animation) => animation.pause());
  }

  cancel(): void {
    this.animations.forEach((animation) => animation.cancel());
    this.animations = [];
  }
}

function convertKeyframeDefinition(definition: KeyframeDefinition): Keyframe[] {
  return Object.entries(definition).map(([offset, frame]) => {
    const keyframe: Keyframe = { ...frame };
    const parsedOffset = parseOffset(offset);
    if (parsedOffset !== undefined) {
      keyframe.offset = parsedOffset;
    }
    return keyframe;
  });
}

function parseOffset(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed.endsWith('%')) {
    return parseFloat(trimmed) / 100;
  }
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : undefined;
}

/**
 * Attach a scroll-linked timeline if supported (view-timeline). Falls back to no-op.
 */
export function attachScrollTimeline(element: HTMLElement, name = '--content', axis: 'block' | 'inline' = 'block'): void {
  if (typeof (element.style as any)['viewTimelineName'] !== 'undefined') {
    (element.style as any)['viewTimelineName'] = name;
    (element.style as any)['viewTimelineAxis'] = axis;
  }
}

/**
 * Prefer reduced motion: helper to disable ongoing animations
 */
export function respectReducedMotion(animations: Array<Animation>): void {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.matches) {
      animations.forEach((a) => a.cancel());
    }
  }
}

