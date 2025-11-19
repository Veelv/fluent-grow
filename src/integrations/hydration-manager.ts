/**
 * Hydration strategies for progressive component activation.
 */
export type HydrationStrategy = 
  | 'immediate'    // Hydrate immediately on page load
  | 'lazy'         // Hydrate when browser is idle
  | 'viewport'     // Hydrate when component enters viewport
  | 'interaction'  // Hydrate on first user interaction
  | 'media-query'  // Hydrate based on media query match
  | 'network'      // Hydrate based on network conditions
  | 'cpu'          // Hydrate based on CPU availability
  | 'custom';      // Custom hydration logic

/**
 * Component hydration state tracking.
 */
export interface ComponentHydrationState {
  readonly tag: string;
  readonly strategy: HydrationStrategy;
  readonly priority: 'critical' | 'high' | 'normal' | 'low';
  readonly status: 'pending' | 'hydrating' | 'hydrated' | 'error';
  readonly startTime?: number;
  readonly endTime?: number;
  readonly error?: Error;
  readonly retryCount: number;
  readonly maxRetries: number;
}

/**
 * Advanced hydration configuration with performance optimization.
 */
export interface HydrationConfig {
  readonly strategy: HydrationStrategy;
  readonly priority?: 'critical' | 'high' | 'normal' | 'low';
  readonly components?: string[];
  readonly timeout?: number;
  readonly retries?: number;
  readonly conditions?: HydrationConditions;
  readonly performance?: HydrationPerformanceConfig;
  readonly analytics?: boolean;
}

/**
 * Conditions for conditional hydration strategies.
 */
export interface HydrationConditions {
  readonly mediaQuery?: string;
  readonly networkSpeed?: 'slow-2g' | '2g' | '3g' | '4g';
  readonly deviceMemory?: number; // GB
  readonly cpuCores?: number;
  readonly batteryLevel?: number; // 0-1
  readonly dataSaver?: boolean;
  readonly reducedMotion?: boolean;
}

/**
 * Performance configuration for hydration optimization.
 */
export interface HydrationPerformanceConfig {
  readonly batchSize?: number;
  readonly batchDelay?: number;
  readonly concurrency?: number;
  readonly memoryThreshold?: number;
  readonly cpuThreshold?: number;
}

/**
 * Hydration analytics and metrics.
 */
export interface HydrationMetrics {
  readonly totalComponents: number;
  readonly hydratedComponents: number;
  readonly failedComponents: number;
  readonly averageHydrationTime: number;
  readonly totalHydrationTime: number;
  readonly memoryUsage: number;
  readonly performanceScore: number;
}

/**
 * Enterprise-grade hydration manager with intelligent optimization.
 * 
 * Features:
 * - Multiple hydration strategies with conditions
 * - Performance-aware batching and prioritization
 * - Network and device capability detection
 * - Comprehensive error handling and retry logic
 * - Real-time performance monitoring
 * - Memory and CPU usage optimization
 * - Analytics and debugging support
 */
export class HydrationManager {
  private readonly componentStates = new Map<string, ComponentHydrationState>();
  private readonly pending = new Map<string, Promise<void>>();
  private readonly observers = new Map<string, IntersectionObserver>();
  private performanceObserver?: PerformanceObserver;
  private mutationObserver?: MutationObserver;
  
  private batchQueue: Array<{ tag: string; config: HydrationConfig }> = [];
  private batchTimer?: number;
  private concurrentHydrations = 0;
  // private maxConcurrency = 3; // TODO: implement concurrency control
  
  private metrics = {
    totalComponents: 0,
    hydratedComponents: 0,
    failedComponents: 0,
    averageHydrationTime: 0,
    totalHydrationTime: 0,
    memoryUsage: 0,
    performanceScore: 100
  };

  constructor(options: {
    maxConcurrency?: number;
    enableAnalytics?: boolean;
    enablePerformanceMonitoring?: boolean;
  } = {}) {
    // this.maxConcurrency = options.maxConcurrency || 3; // TODO: implement concurrency control
    
    if (options.enablePerformanceMonitoring) {
      this.setupPerformanceMonitoring();
    }
    
    if (options.enableAnalytics) {
      this.setupAnalytics();
    }
    
    this.setupMutationObserver();
  }

  /**
   * Hydrates a component with intelligent strategy selection and optimization.
   */
  async hydrateComponent(
    tag: string, 
    config: HydrationConfig = { strategy: 'immediate' }
  ): Promise<void> {
    // Check if already hydrated or in progress
    const state = this.componentStates.get(tag);
    if (state?.status === 'hydrated') {
      return;
    }

    const existing = this.pending.get(tag);
    if (existing) {
      return existing;
    }

    // Initialize component state
    this.initializeComponentState(tag, config);
    
    // Check hydration conditions
    if (!await this.checkHydrationConditions(config)) {
      this.updateComponentState(tag, { status: 'pending' });
      return;
    }

    const promise = this.executeHydrationWithRetry(tag, config);
    this.pending.set(tag, promise);
    
    try {
      await promise;
      this.updateComponentState(tag, { 
        status: 'hydrated',
        endTime: performance.now()
      });
      this.metrics.hydratedComponents++;
    } catch (error) {
      this.updateComponentState(tag, { 
        status: 'error',
        error: error as Error
      });
      this.metrics.failedComponents++;
      throw error;
    } finally {
      this.pending.delete(tag);
      this.concurrentHydrations--;
    }
  }
  
  /**
   * Hydrates multiple components with intelligent batching and prioritization.
   */
  async hydrateComponents(
    components: Array<{ tag: string; config: HydrationConfig }>
  ): Promise<void> {
    // Sort by priority
    const sorted = components.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
      const aPriority = priorityOrder[a.config.priority || 'normal'];
      const bPriority = priorityOrder[b.config.priority || 'normal'];
      return aPriority - bPriority;
    });
    
    // Batch hydration based on strategy
    const batches = this.createHydrationBatches(sorted);
    
    for (const batch of batches) {
      await this.processBatch(batch);
    }
  }
  
  /**
   * Automatically discovers and hydrates components based on DOM.
   */
  async autoHydrate(options: {
    selector?: string;
    defaultStrategy?: HydrationStrategy;
    respectDataAttributes?: boolean;
  } = {}): Promise<void> {
    const {
      selector = 'fluent-*',
      defaultStrategy = 'viewport',
      respectDataAttributes = true
    } = options;
    
    const elements = document.querySelectorAll(selector);
    const components: Array<{ tag: string; config: HydrationConfig }> = [];
    
    elements.forEach(element => {
      const tag = element.tagName.toLowerCase();
      let config: HydrationConfig = { strategy: defaultStrategy };
      
      if (respectDataAttributes) {
        config = this.parseDataAttributes(element, config);
      }
      
      components.push({ tag, config });
    });
    
    await this.hydrateComponents(components);
  }

  private async executeHydration(tag: string, config: HydrationConfig): Promise<void> {
    performance.mark(`fluent-hydrate-${tag}-start`);
    
    try {
      switch (config.strategy) {
        case 'immediate':
          await this.hydrateImmediate(tag);
          break;
        case 'lazy':
          await this.hydrateLazy(tag, config);
          break;
        case 'viewport':
          await this.hydrateOnViewport(tag, config);
          break;
        case 'interaction':
          await this.hydrateOnInteraction(tag, config);
          break;
        case 'media-query':
          await this.hydrateOnMediaQuery(tag, config);
          break;
        case 'network':
          await this.hydrateOnNetwork(tag, config);
          break;
        case 'cpu':
          await this.hydrateOnCPU(tag, config);
          break;
        case 'custom':
          await this.hydrateCustom(tag, config);
          break;
      }
      
      performance.mark(`fluent-hydrate-${tag}-end`);
      performance.measure(
        `fluent-hydrate-${tag}`,
        `fluent-hydrate-${tag}-start`,
        `fluent-hydrate-${tag}-end`
      );
      
      // Dispatch hydration complete event
      window.dispatchEvent(new CustomEvent('fluent-hydration-complete', {
        detail: { tag, strategy: config.strategy }
      }));
      
    } catch (error) {
      performance.mark(`fluent-hydrate-${tag}-error`);
      throw error;
    }
  }

  private async hydrateImmediate(tag: string): Promise<void> {
    const elements = document.querySelectorAll(tag);
    await Promise.all(Array.from(elements).map(el => this.hydrateElement(el as HTMLElement)));
  }

  private async hydrateLazy(tag: string, config: HydrationConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = config.timeout || 10000;
      const timeoutId = setTimeout(() => {
        reject(new Error(`Lazy hydration timeout for ${tag}`));
      }, timeout);
      
      const callback = (deadline?: IdleDeadline) => {
        clearTimeout(timeoutId);
        
        // Check if we have enough time or if timeout is approaching
        if (deadline && deadline.timeRemaining() > 5) {
          this.hydrateImmediate(tag).then(resolve).catch(reject);
        } else {
          // Defer to next idle period
          if ('requestIdleCallback' in window) {
            requestIdleCallback(callback, { timeout: 1000 });
          } else {
            setTimeout(() => callback(), 16); // ~60fps
          }
        }
      };
      
      if ('requestIdleCallback' in window) {
        requestIdleCallback(callback, { timeout });
      } else {
        setTimeout(() => callback(), 0);
      }
    });
  }

  private async hydrateOnViewport(tag: string, config: HydrationConfig): Promise<void> {
    const elements = document.querySelectorAll(tag);
    
    if (!elements.length) {
      return;
    }

    return new Promise((resolve, reject) => {
      const timeout = config.timeout || 30000;
      const timeoutId = setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Viewport hydration timeout for ${tag}`));
      }, timeout);
      
      let hydratedCount = 0;
      const totalElements = elements.length;
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.hydrateElement(entry.target as HTMLElement)
              .then(() => {
                hydratedCount++;
                observer.unobserve(entry.target);
                
                if (hydratedCount === totalElements) {
                  clearTimeout(timeoutId);
                  observer.disconnect();
                  resolve();
                }
              })
              .catch(reject);
          }
        });
      }, {
        rootMargin: '50px', // Start hydrating 50px before element is visible
        threshold: 0.1 // Trigger when 10% of element is visible
      });

      elements.forEach(el => observer.observe(el));
      this.observers.set(tag, observer);
    });
  }

  private async hydrateOnInteraction(tag: string, config: HydrationConfig): Promise<void> {
    const elements = document.querySelectorAll(tag);
    
    if (!elements.length) {
      return;
    }
    
    return new Promise((resolve, reject) => {
      const timeout = config.timeout || 60000;
      const timeoutId = setTimeout(() => {
        reject(new Error(`Interaction hydration timeout for ${tag}`));
      }, timeout);
      
      let hydratedCount = 0;
      const totalElements = elements.length;
      const eventListeners = new Map<Element, Array<{ event: string; handler: () => void }>>();
      
      elements.forEach(el => {
        const handlers: Array<{ event: string; handler: () => void }> = [];
        
        const hydrateOnEvent = () => {
          // Remove all event listeners for this element
          const elementHandlers = eventListeners.get(el) || [];
          elementHandlers.forEach(({ event, handler }) => {
            el.removeEventListener(event, handler);
          });
          eventListeners.delete(el);
          
          this.hydrateElement(el as HTMLElement)
            .then(() => {
              hydratedCount++;
              
              if (hydratedCount === totalElements) {
                clearTimeout(timeoutId);
                resolve();
              }
            })
            .catch(reject);
        };
        
        // Listen for various interaction events
        const events = ['click', 'focus', 'mouseenter', 'touchstart', 'keydown'];
        events.forEach(event => {
          const handler = hydrateOnEvent;
          el.addEventListener(event, handler, { once: true, passive: true });
          handlers.push({ event, handler });
        });
        
        eventListeners.set(el, handlers);
      });
    });
  }
  
  private async hydrateOnMediaQuery(tag: string, config: HydrationConfig): Promise<void> {
    const mediaQuery = config.conditions?.mediaQuery;
    if (!mediaQuery) {
      throw new Error('Media query condition is required for media-query strategy');
    }
    
    return new Promise((resolve, reject) => {
      const mq = matchMedia(mediaQuery);
      
      const handleChange = () => {
        if (mq.matches) {
          mq.removeEventListener('change', handleChange);
          this.hydrateImmediate(tag).then(resolve).catch(reject);
        }
      };
      
      if (mq.matches) {
        this.hydrateImmediate(tag).then(resolve).catch(reject);
      } else {
        mq.addEventListener('change', handleChange);
        
        // Timeout fallback
        if (config.timeout) {
          setTimeout(() => {
            mq.removeEventListener('change', handleChange);
            reject(new Error(`Media query hydration timeout for ${tag}`));
          }, config.timeout);
        }
      }
    });
  }
  
  private async hydrateOnNetwork(tag: string, config: HydrationConfig): Promise<void> {
    const requiredSpeed = config.conditions?.networkSpeed;
    if (!requiredSpeed) {
      throw new Error('Network speed condition is required for network strategy');
    }
    
    return new Promise((resolve, reject) => {
      const checkNetwork = () => {
        if ('connection' in navigator) {
          const connection = (navigator as any).connection;
          if (connection.effectiveType === requiredSpeed) {
            this.hydrateImmediate(tag).then(resolve).catch(reject);
            return true;
          }
        }
        return false;
      };
      
      if (checkNetwork()) {
        return;
      }
      
      // Poll network conditions
      const interval = setInterval(() => {
        if (checkNetwork()) {
          clearInterval(interval);
        }
      }, 5000);
      
      // Timeout fallback
      if (config.timeout) {
        setTimeout(() => {
          clearInterval(interval);
          reject(new Error(`Network hydration timeout for ${tag}`));
        }, config.timeout);
      }
    });
  }
  
  private async hydrateOnCPU(tag: string, config: HydrationConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkCPU = () => {
        // Simple CPU availability check using requestIdleCallback
        if ('requestIdleCallback' in window) {
          requestIdleCallback((deadline) => {
            if (deadline.timeRemaining() > 10) {
              this.hydrateImmediate(tag).then(resolve).catch(reject);
            } else {
              setTimeout(checkCPU, 1000);
            }
          });
        } else {
          // Fallback for browsers without requestIdleCallback
          setTimeout(() => {
            this.hydrateImmediate(tag).then(resolve).catch(reject);
          }, 100);
        }
      };
      
      checkCPU();
      
      // Timeout fallback
      if (config.timeout) {
        setTimeout(() => {
          reject(new Error(`CPU hydration timeout for ${tag}`));
        }, config.timeout);
      }
    });
  }
  
  private async hydrateCustom(tag: string, _config: HydrationConfig): Promise<void> {
    throw new Error(`Custom hydration strategy not implemented for ${tag}`);
  }

  private async hydrateElement(element: HTMLElement): Promise<void> {
    if (this.isHydrated(element)) {
      return;
    }

    const tag = element.tagName.toLowerCase();
    const startTime = performance.now();
    
    try {
      // Mark as hydrating
      element.setAttribute('data-fluent-hydrating', 'true');
      
      // Trigger component-specific hydration logic
      if (element.tagName.startsWith('FLUENT-')) {
        const component = element as any;
        
        // Call component hydration method if available
        if (typeof component.hydrate === 'function') {
          await component.hydrate();
        }
        
        // Ensure component is properly connected
        if (typeof component.connectedCallback === 'function' && !component.isConnected) {
          component.connectedCallback();
        }
        
        // Setup component event listeners if needed
        if (typeof component.setupEventListeners === 'function') {
          component.setupEventListeners();
        }
      }
      
      // Mark as hydrated
      element.removeAttribute('data-fluent-hydrating');
      element.setAttribute('data-fluent-hydrated', 'true');
      element.setAttribute('data-fluent-hydrated-at', Date.now().toString());
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Track hydration performance
      element.setAttribute('data-fluent-hydration-time', duration.toString());
      
      // Dispatch element hydration event
      element.dispatchEvent(new CustomEvent('fluent-element-hydrated', {
        detail: { tag, duration },
        bubbles: true
      }));
      
    } catch (error) {
      element.removeAttribute('data-fluent-hydrating');
      element.setAttribute('data-fluent-hydration-error', 'true');
      throw error;
    }
  }

  private isHydrated(element: HTMLElement): boolean {
    return element.hasAttribute('data-fluent-hydrated') && 
           !element.hasAttribute('data-fluent-hydrating');
  }

  /**
   * Gets comprehensive hydration metrics and analytics.
   */
  getMetrics(): HydrationMetrics {
    const states = Array.from(this.componentStates.values());
    const hydrationTimes = states
      .filter(s => s.startTime && s.endTime)
      .map(s => s.endTime! - s.startTime!);
    
    return {
      ...this.metrics,
      totalComponents: states.length,
      averageHydrationTime: hydrationTimes.length > 0 
        ? hydrationTimes.reduce((a, b) => a + b, 0) / hydrationTimes.length 
        : 0,
      totalHydrationTime: hydrationTimes.reduce((a, b) => a + b, 0),
      memoryUsage: this.getMemoryUsage(),
      performanceScore: this.calculatePerformanceScore()
    };
  }
  
  /**
   * Gets detailed component states for debugging.
   */
  getComponentStates(): ComponentHydrationState[] {
    return Array.from(this.componentStates.values());
  }
  
  /**
   * Pauses hydration for performance optimization.
   */
  pauseHydration(): void {
    this.observers.forEach(observer => observer.disconnect());
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
  }
  
  /**
   * Resumes hydration after pause.
   */
  resumeHydration(): void {
    this.setupObservers();
    this.processBatchQueue();
  }
  
  /**
   * Forces immediate hydration of all pending components.
   */
  async forceHydrateAll(): Promise<void> {
    const pending = Array.from(this.componentStates.entries())
      .filter(([_, state]) => state.status === 'pending')
      .map(([tag]) => ({ 
        tag, 
        config: { strategy: 'immediate' as HydrationStrategy } 
      }));
    
    await this.hydrateComponents(pending);
  }
  
  /**
   * Cleanup resources and observers.
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.pending.clear();
    this.componentStates.clear();
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
  }
  
  // Private implementation methods
  
  private initializeComponentState(tag: string, config: HydrationConfig): void {
    this.componentStates.set(tag, {
      tag,
      strategy: config.strategy,
      priority: config.priority || 'normal',
      status: 'pending',
      startTime: performance.now(),
      retryCount: 0,
      maxRetries: config.retries || 3
    });
    
    this.metrics.totalComponents++;
  }
  
  private updateComponentState(
    tag: string, 
    updates: Partial<ComponentHydrationState>
  ): void {
    const current = this.componentStates.get(tag);
    if (current) {
      this.componentStates.set(tag, { ...current, ...updates });
    }
  }
  
  private async checkHydrationConditions(config: HydrationConfig): Promise<boolean> {
    const conditions = config.conditions;
    if (!conditions) return true;
    
    // Check media query
    if (conditions.mediaQuery && !matchMedia(conditions.mediaQuery).matches) {
      return false;
    }
    
    // Check network conditions
    if (conditions.networkSpeed && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.effectiveType !== conditions.networkSpeed) {
        return false;
      }
    }
    
    // Check device memory
    if (conditions.deviceMemory && 'deviceMemory' in navigator) {
      const deviceMemory = (navigator as any).deviceMemory;
      if (deviceMemory < conditions.deviceMemory) {
        return false;
      }
    }
    
    // Check battery level
    if (conditions.batteryLevel && 'getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        if (battery.level < conditions.batteryLevel) {
          return false;
        }
      } catch {
        // Battery API not supported, continue
      }
    }
    
    // Check data saver
    if (conditions.dataSaver && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.saveData && conditions.dataSaver) {
        return false;
      }
    }
    
    // Check reduced motion preference
    if (conditions.reducedMotion) {
      const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion !== conditions.reducedMotion) {
        return false;
      }
    }
    
    return true;
  }
  
  private async executeHydrationWithRetry(
    tag: string, 
    config: HydrationConfig
  ): Promise<void> {
    const state = this.componentStates.get(tag)!;
    
    try {
      this.updateComponentState(tag, { status: 'hydrating' });
      this.concurrentHydrations++;
      
      await this.executeHydration(tag, config);
    } catch (error) {
      if (state.retryCount < state.maxRetries) {
        this.updateComponentState(tag, { 
          retryCount: state.retryCount + 1 
        });
        
        // Exponential backoff
        const delay = Math.pow(2, state.retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.executeHydrationWithRetry(tag, config);
      }
      
      throw error;
    }
  }
  
  private createHydrationBatches(
    components: Array<{ tag: string; config: HydrationConfig }>
  ): Array<Array<{ tag: string; config: HydrationConfig }>> {
    const batches: Array<Array<{ tag: string; config: HydrationConfig }>> = [];
    const batchSize = 5; // Configurable batch size
    
    for (let i = 0; i < components.length; i += batchSize) {
      batches.push(components.slice(i, i + batchSize));
    }
    
    return batches;
  }
  
  private async processBatch(
    batch: Array<{ tag: string; config: HydrationConfig }>
  ): Promise<void> {
    const promises = batch.map(({ tag, config }) => 
      this.hydrateComponent(tag, config)
    );
    
    await Promise.allSettled(promises);
  }
  
  private parseDataAttributes(
    element: Element, 
    defaultConfig: HydrationConfig
  ): HydrationConfig {
    const config = { ...defaultConfig };
    
    // Parse strategy
    const strategy = element.getAttribute('data-hydrate-strategy');
    if (strategy && this.isValidStrategy(strategy)) {
      config.strategy = strategy as HydrationStrategy;
    }
    
    // Parse priority
    const priority = element.getAttribute('data-hydrate-priority');
    if (priority && ['critical', 'high', 'normal', 'low'].includes(priority)) {
      config.priority = priority as any;
    }
    
    // Parse timeout
    const timeout = element.getAttribute('data-hydrate-timeout');
    if (timeout) {
      config.timeout = parseInt(timeout, 10);
    }
    
    return config;
  }
  
  private isValidStrategy(strategy: string): boolean {
    return ['immediate', 'lazy', 'viewport', 'interaction', 'media-query', 'network', 'cpu', 'custom']
      .includes(strategy);
  }
  
  private setupPerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name.startsWith('fluent-hydrate')) {
            this.metrics.totalHydrationTime += entry.duration;
          }
        });
      });
      
      this.performanceObserver.observe({ entryTypes: ['measure'] });
    }
  }
  
  private setupAnalytics(): void {
    // Setup analytics tracking for hydration events
    window.addEventListener('fluent-hydration-complete', (event: any) => {
      console.log('Hydration completed:', event.detail);
    });
  }
  
  private setupMutationObserver(): void {
    if ('MutationObserver' in window) {
      this.mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName.startsWith('FLUENT-')) {
                // Auto-hydrate new components
                const tag = element.tagName.toLowerCase();
                this.hydrateComponent(tag, { strategy: 'viewport' });
              }
            }
          });
        });
      });
      
      this.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }
  
  private setupObservers(): void {
    // Re-setup intersection observers after resume
    this.componentStates.forEach((state, tag) => {
      if (state.strategy === 'viewport' && state.status === 'pending') {
        this.setupViewportObserver(tag);
      }
    });
  }
  
  private setupViewportObserver(tag: string): void {
    const elements = document.querySelectorAll(tag);
    if (!elements.length) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.hydrateElement(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      });
    });
    
    elements.forEach(el => observer.observe(el));
    this.observers.set(tag, observer);
  }
  
  private processBatchQueue(): void {
    if (this.batchQueue.length === 0) return;
    
    const batch = this.batchQueue.splice(0, 5); // Process 5 at a time
    this.processBatch(batch);
    
    if (this.batchQueue.length > 0) {
      this.batchTimer = window.setTimeout(() => this.processBatchQueue(), 100);
    }
  }
  
  private getMemoryUsage(): number {
    return (performance as any).memory?.usedJSHeapSize || 0;
  }
  
  private calculatePerformanceScore(): number {
    const metrics = this.metrics;
    let score = 100;
    
    // Penalize for failed hydrations
    if (metrics.totalComponents > 0) {
      const failureRate = metrics.failedComponents / metrics.totalComponents;
      score -= failureRate * 50;
    }
    
    // Penalize for slow hydration
    if (metrics.averageHydrationTime > 100) {
      score -= Math.min(30, (metrics.averageHydrationTime - 100) / 10);
    }
    
    return Math.max(0, Math.min(100, score));
  }
}

/**
 * Predefined hydration strategies for common use cases.
 */
export const hydrationStrategies = {
  // Critical components that need immediate hydration
  critical: {
    strategy: 'immediate' as const,
    priority: 'critical' as const,
    timeout: 5000,
    retries: 1
  },
  
  // High priority components with performance awareness
  highPriority: {
    strategy: 'lazy' as const,
    priority: 'high' as const,
    timeout: 3000,
    retries: 2,
    conditions: {
      networkSpeed: '3g' as const,
      deviceMemory: 2
    }
  },
  
  // Standard components that hydrate when visible
  standard: {
    strategy: 'viewport' as const,
    priority: 'normal' as const,
    timeout: 10000,
    retries: 3
  },
  
  // Components that can wait for idle time
  deferred: {
    strategy: 'lazy' as const,
    priority: 'low' as const,
    timeout: 15000,
    retries: 2,
    conditions: {
      dataSaver: false
    }
  },
  
  // Components that only hydrate when visible (below fold)
  belowFold: {
    strategy: 'viewport' as const,
    priority: 'low' as const,
    timeout: 20000,
    retries: 1
  },
  
  // Interactive components that hydrate on user interaction
  interactive: {
    strategy: 'interaction' as const,
    priority: 'normal' as const,
    timeout: 5000,
    retries: 3
  },
  
  // Performance-aware strategy for low-end devices
  lowEnd: {
    strategy: 'viewport' as const,
    priority: 'low' as const,
    timeout: 30000,
    retries: 1,
    conditions: {
      deviceMemory: 1,
      networkSpeed: '2g' as const,
      dataSaver: true
    },
    performance: {
      batchSize: 2,
      batchDelay: 1000,
      concurrency: 1
    }
  },
  
  // High-performance strategy for modern devices
  highEnd: {
    strategy: 'immediate' as const,
    priority: 'high' as const,
    timeout: 2000,
    retries: 1,
    conditions: {
      deviceMemory: 8,
      networkSpeed: '4g' as const
    },
    performance: {
      batchSize: 10,
      batchDelay: 50,
      concurrency: 5
    }
  },
  
  // Accessibility-aware strategy
  accessible: {
    strategy: 'immediate' as const,
    priority: 'critical' as const,
    timeout: 3000,
    retries: 2,
    conditions: {
      reducedMotion: true
    }
  },
  
  // Battery-conscious strategy
  batterySaver: {
    strategy: 'interaction' as const,
    priority: 'low' as const,
    timeout: 60000,
    retries: 1,
    conditions: {
      batteryLevel: 0.2, // Only when battery > 20%
      dataSaver: true
    }
  }
};