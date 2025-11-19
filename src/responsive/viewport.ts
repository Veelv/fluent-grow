/**
 * Viewport Utilities
 * ------------------
 * Provides dimension helpers, orientation detection and resize listeners with
 * SSR safety checks.
 */

type ViewportListener = (dimensions: { width: number; height: number }) => void;

const listeners = new Set<ViewportListener>();
let resizeHandlerBound = false;
let resizeHandler: (() => void) | undefined;

export const Viewport = {
  getDimensions(): { width: number; height: number } {
    if (typeof window === 'undefined') {
      return { width: 0, height: 0 };
    }
    return { width: window.innerWidth, height: window.innerHeight };
  },
  width(): number {
    return this.getDimensions().width;
  },
  height(): number {
    return this.getDimensions().height;
  },
  orientation(): 'portrait' | 'landscape' {
    const { width, height } = this.getDimensions();
    return height >= width ? 'portrait' : 'landscape';
  },
  isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  },
  isTablet(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.innerWidth >= 768 && window.innerWidth < 1024;
  },
  isDesktop(): boolean {
    return typeof window !== 'undefined' && window.innerWidth >= 1024;
  },
  subscribe(listener: ViewportListener): () => void {
    listeners.add(listener);
    listener(this.getDimensions());
    bindResizeEvents();
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        unbindResizeEvents();
      }
    };
  }
};

function bindResizeEvents(): void {
  if (resizeHandlerBound || typeof window === 'undefined') {
    return;
  }
  resizeHandler = () => {
    const dimensions = Viewport.getDimensions();
    listeners.forEach((listener) => listener(dimensions));
  };
  window.addEventListener('resize', resizeHandler);
  window.addEventListener('orientationchange', resizeHandler);
  resizeHandlerBound = true;
}

function unbindResizeEvents(): void {
  if (!resizeHandlerBound || typeof window === 'undefined' || !resizeHandler) {
    return;
  }
  window.removeEventListener('resize', resizeHandler);
  window.removeEventListener('orientationchange', resizeHandler);
  resizeHandler = undefined;
  resizeHandlerBound = false;
}

