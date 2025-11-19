import { VersionManager } from './version-manager';

export interface PerformanceMetrics {
  initTime: number;
  componentRegistrations: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
}

export interface UsageMetrics {
  featuresUsed: string[];
  componentsUsed: string[];
  browserInfo: string;
  compatibility: string;
  errors: Array<{ message: string; timestamp: number }>;
}

export interface AnalyticsConfig {
  enabled: boolean;
  endpoint?: string;
  batchSize: number;
  flushInterval: number;
  collectPerformance: boolean;
  collectUsage: boolean;
}

export class AnalyticsManager {
  private config: AnalyticsConfig;
  private versionManager = VersionManager.getInstance();
  private metrics: PerformanceMetrics;
  private usage: UsageMetrics;
  private eventQueue: any[] = [];
  private flushTimer?: number;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      enabled: true,
      batchSize: 50,
      flushInterval: 30000, // 30 seconds
      collectPerformance: true,
      collectUsage: true,
      ...config
    };

    this.metrics = {
      initTime: 0,
      componentRegistrations: 0,
      renderTime: 0,
      memoryUsage: 0,
      bundleSize: 0
    };

    this.usage = {
      featuresUsed: [],
      componentsUsed: [],
      browserInfo: this.getBrowserInfo(),
      compatibility: this.versionManager.getVersionInfo().compatibility,
      errors: []
    };

    if (this.config.enabled) {
      this.startCollection();
    }
  }

  private getBrowserInfo(): string {
    if (typeof navigator === 'undefined') return 'unknown';
    return `${navigator.userAgent}`;
  }

  private startCollection(): void {
    if (typeof window === 'undefined') return;

    // Performance observer para métricas de renderização
    if ('PerformanceObserver' in window && this.config.collectPerformance) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes('fluent-')) {
            this.metrics.renderTime += entry.duration;
          }
        }
      });
      observer.observe({ entryTypes: ['measure'] });
    }

    // Memory usage tracking
    if ('memory' in performance && this.config.collectPerformance) {
      setInterval(() => {
        this.metrics.memoryUsage = (performance as any).memory.usedJSHeapSize;
      }, 5000);
    }

    // Auto flush
    this.flushTimer = window.setInterval(() => {
      this.flush();
    }, this.config.flushInterval);

    // Error tracking
    window.addEventListener('error', (event) => {
      this.trackError(event.message);
    });
  }

  trackFeatureUsage(feature: string): void {
    if (!this.config.collectUsage) return;
    
    if (!this.usage.featuresUsed.includes(feature)) {
      this.usage.featuresUsed.push(feature);
      this.queueEvent('feature_used', { feature, timestamp: Date.now() });
    }
  }

  trackComponentUsage(component: string): void {
    if (!this.config.collectUsage) return;
    
    if (!this.usage.componentsUsed.includes(component)) {
      this.usage.componentsUsed.push(component);
      this.queueEvent('component_used', { component, timestamp: Date.now() });
    }
  }

  trackPerformance(metric: keyof PerformanceMetrics, value: number): void {
    if (!this.config.collectPerformance) return;
    
    this.metrics[metric] = value;
    this.queueEvent('performance_metric', { metric, value, timestamp: Date.now() });
  }

  trackError(message: string): void {
    const error = { message, timestamp: Date.now() };
    this.usage.errors.push(error);
    this.queueEvent('error', error);
  }

  private queueEvent(type: string, data: any): void {
    if (!this.config.enabled) return;
    
    this.eventQueue.push({
      type,
      data,
      version: this.versionManager.getVersionInfo().version,
      compatibility: this.usage.compatibility,
      timestamp: Date.now()
    });

    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  async flush(): Promise<void> {
    if (!this.config.enabled || !this.eventQueue.length || !this.config.endpoint) {
      return;
    }

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events,
          session: {
            metrics: this.metrics,
            usage: this.usage,
            versionInfo: this.versionManager.getVersionInfo()
          }
        })
      });
    } catch (error) {
      console.warn('[Analytics] Failed to send metrics:', error);
      // Re-queue events for retry
      this.eventQueue.unshift(...events);
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getUsage(): UsageMetrics {
    return { ...this.usage };
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}