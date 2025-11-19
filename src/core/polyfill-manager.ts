import { VersionManager } from './version-manager';

export interface PolyfillConfig {
  feature: string;
  url: string;
  condition: () => boolean;
  priority: number;
  size: number; // KB
}

export class PolyfillManager {
  private versionManager = VersionManager.getInstance();
  private loadedPolyfills = new Set<string>();
  
  private polyfills: PolyfillConfig[] = [
    {
      feature: 'custom-elements',
      url: 'https://unpkg.com/@webcomponents/custom-elements@1.6.0/custom-elements.min.js',
      condition: () => !this.versionManager.isFeatureSupported('customElements'),
      priority: 1,
      size: 7
    },
    {
      feature: 'shadow-dom',
      url: 'https://unpkg.com/@webcomponents/shadydom@1.11.0/shadydom.min.js',
      condition: () => !this.versionManager.isFeatureSupported('shadowDOM'),
      priority: 1,
      size: 15
    },
    {
      feature: 'container-queries',
      url: 'https://unpkg.com/container-query-polyfill@1.0.2/dist/container-query-polyfill.modern.js',
      condition: () => !this.versionManager.isFeatureSupported('containerQueries'),
      priority: 2,
      size: 25
    },
    {
      feature: 'focus-visible',
      url: 'https://unpkg.com/focus-visible@5.2.0/dist/focus-visible.min.js',
      condition: () => typeof window !== 'undefined' && typeof CSS !== 'undefined' && !CSS.supports('selector(:focus-visible)'),
      priority: 3,
      size: 2
    },
    {
      feature: 'smoothscroll',
      url: 'https://unpkg.com/smoothscroll-polyfill@0.4.4/dist/smoothscroll.min.js',
      condition: () => typeof window !== 'undefined' && typeof document !== 'undefined' && !('scrollBehavior' in document.documentElement.style),
      priority: 3,
      size: 8
    },
    {
      feature: 'resize-observer',
      url: 'https://unpkg.com/resize-observer-polyfill@1.5.1/dist/ResizeObserver.global.js',
      condition: () => typeof window !== 'undefined' && typeof (window as unknown as { ResizeObserver?: unknown }).ResizeObserver === 'undefined',
      priority: 3,
      size: 8
    },
    {
      feature: 'intersection-observer',
      url: 'https://unpkg.com/intersection-observer@0.12.2/intersection-observer.js',
      condition: () => typeof window !== 'undefined' && !('IntersectionObserver' in window),
      priority: 3,
      size: 9
    },
    {
      feature: 'anchor-positioning',
      url: 'https://unpkg.com/@oddbird/css-anchor-positioning@0.1.0/dist/css-anchor-positioning.min.js',
      condition: () => !this.versionManager.isFeatureSupported('anchorPositioning'),
      priority: 4,
      size: 45
    },
    {
      feature: 'view-transitions',
      // Inline-safe shim applied without injecting a <script> to respect CSP.
      url: '',
      condition: () => typeof document !== 'undefined' && !('startViewTransition' in document),
      priority: 4,
      size: 1
    },
    {
      feature: 'houdini-paint',
      url: 'https://unpkg.com/css-paint-polyfill@2.0.0/dist/css-paint-polyfill.min.js',
      condition: () => !this.versionManager.isFeatureSupported('houdiniPaint'),
      priority: 5,
      size: 65
    },
    {
      feature: 'es6-promise',
      url: 'https://unpkg.com/es6-promise@4.2.8/dist/es6-promise.auto.min.js',
      condition: () => typeof Promise === 'undefined',
      priority: 0,
      size: 7
    },
    {
      feature: 'fetch',
      url: 'https://unpkg.com/whatwg-fetch@3.6.2/dist/fetch.umd.js',
      condition: () => typeof fetch === 'undefined',
      priority: 0,
      size: 12
    }
  ];

  async loadRequiredPolyfills(): Promise<void> {
    const requiredPolyfills = this.polyfills
      .filter(p => p.condition())
      .sort((a, b) => a.priority - b.priority);

    if (requiredPolyfills.length === 0) {
      console.info('[Polyfill] No polyfills required - modern browser detected');
      return;
    }

    const totalSize = requiredPolyfills.reduce((sum, p) => sum + p.size, 0);
    console.info(`[Polyfill] Loading ${requiredPolyfills.length} polyfills (${totalSize}KB)`);

    for (const polyfill of requiredPolyfills) {
      await this.loadPolyfill(polyfill);
    }
  }

  private async loadPolyfill(config: PolyfillConfig): Promise<void> {
    if (this.loadedPolyfills.has(config.feature)) {
      return;
    }

    try {
      const startTime = performance.now();
      if (config.feature === 'view-transitions') {
        // Apply inline shim (no network, no <script>, CSP-friendly)
        (document as any).startViewTransition = function (callback?: () => unknown) {
          try {
            return Promise.resolve(typeof callback === 'function' ? callback() : undefined);
          } catch {
            return Promise.resolve();
          }
        };
      } else {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = config.url;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`Failed to load ${config.feature}`));
          document.head.appendChild(script);
        });
      }

      const loadTime = performance.now() - startTime;
      this.loadedPolyfills.add(config.feature);
      
      console.info(`[Polyfill] Loaded ${config.feature} in ${loadTime.toFixed(2)}ms`);
    } catch (error) {
      console.error(`[Polyfill] Failed to load ${config.feature}:`, error);
    }
  }

  async loadConditionalPolyfill(feature: string): Promise<boolean> {
    const polyfill = this.polyfills.find(p => p.feature === feature);
    if (!polyfill || !polyfill.condition()) {
      return false;
    }

    await this.loadPolyfill(polyfill);
    return true;
  }

  getLoadedPolyfills(): string[] {
    return Array.from(this.loadedPolyfills);
  }

  getPolyfillStatus(): Record<string, boolean> {
    return this.polyfills.reduce((status, polyfill) => {
      status[polyfill.feature] = this.loadedPolyfills.has(polyfill.feature);
      return status;
    }, {} as Record<string, boolean>);
  }
}