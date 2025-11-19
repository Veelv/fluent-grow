import { applyStyles } from '../utils/css-engine';
import type { CSSProperties } from '../utils/css-engine';

export interface AnimationConfig {
  duration?: string;
  easing?: string;
  delay?: string;
  iterations?: number | 'infinite';
}

export class AnimationEngine {
  private observers: IntersectionObserver[] = [];
  private animations: Animation[] = [];

  constructor(private element: HTMLElement) {}

  fadeIn(config: AnimationConfig = {}): this {
    return this.animate('fadeIn', {
      duration: '0.3s',
      easing: 'ease-out',
      ...config
    });
  }

  slideUp(config: AnimationConfig = {}): this {
    return this.animate('slideUp', {
      duration: '0.4s',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      ...config
    });
  }

  scale(config: AnimationConfig = {}): this {
    return this.animate('scale', {
      duration: '0.3s',
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      ...config
    });
  }

  scrollFade(): this {
    if ('CSS' in window && 'supports' in CSS && CSS.supports('animation-timeline', 'scroll()')) {
      applyStyles(this.element, {
        'animation-name': 'scrollFade',
        'animation-timeline': 'scroll()',
        'animation-duration': '1s'
      });
    } else {
      this.observeScroll((entry) => {
        const opacity = Math.max(0, Math.min(1, entry.intersectionRatio));
        applyStyles(this.element, { opacity: opacity.toString() });
      });
    }
    return this;
  }

  viewTransition(name: string): this {
    applyStyles(this.element, {
      'view-transition-name': name
    });
    return this;
  }

  parallax(speed = 0.5): this {
    let ticking = false;
    const updateParallax = () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * speed;
      applyStyles(this.element, {
        transform: `translateY(${rate}px)`
      });
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    });
    return this;
  }

  magnetic(strength = 0.3): this {
    let isHovering = false;

    this.element.addEventListener('mouseenter', () => {
      isHovering = true;
    });

    this.element.addEventListener('mouseleave', () => {
      isHovering = false;
      applyStyles(this.element, { transform: 'translate(0, 0)' });
    });

    this.element.addEventListener('mousemove', (e) => {
      if (!isHovering) return;

      const rect = this.element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      applyStyles(this.element, {
        transform: `translate(${deltaX}px, ${deltaY}px)`
      });
    });

    return this;
  }

  private animate(name: string, config: AnimationConfig): this {
    const styles: CSSProperties = {
      'animation-name': name,
      'animation-duration': config.duration || '0.3s',
      'animation-timing-function': config.easing || 'ease',
      'animation-delay': config.delay || '0s',
      'animation-iteration-count': config.iterations?.toString() || '1',
      'animation-fill-mode': 'both'
    };

    applyStyles(this.element, styles);
    return this;
  }

  private observeScroll(callback: (entry: IntersectionObserverEntry) => void): void {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(callback),
      { threshold: 0.1 }
    );

    observer.observe(this.element);
    this.observers.push(observer);
  }

  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.animations.forEach(animation => animation.cancel());
    this.observers = [];
    this.animations = [];
  }
}

export const ANIMATION_KEYFRAMES = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes scale {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes scrollFade {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = ANIMATION_KEYFRAMES;
  document.head.appendChild(style);
}