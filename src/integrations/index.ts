/**
 * Enterprise Framework Integration Suite
 * 
 * Comprehensive integration system for seamless adoption of Fluent Grow
 * within existing frontend frameworks and styling systems.
 * 
 * @module integrations
 * @version 0.1.1
 * @author Fluent Grow Team
 */

// Framework Adapter - Core integration engine
// Framework Adapter - Core integration engine
export {
  FrameworkAdapter,
  integrations,
  type FrameworkIntegration,
  type AdapterConfig
} from './framework-adapter';

// SSR Adapter - Server-side rendering optimization
export {
  SSRAdapter,
  ssrHelpers,
  type SSRConfig,
  type SSRResult
} from './ssr-adapter';

// Hydration Manager - Progressive component activation
export {
  HydrationManager,
  hydrationStrategies,
  type HydrationConfig
} from './hydration-manager';

/**
 * Enterprise integration suite for comprehensive framework adoption.
 */
export interface IntegrationSuite {
  adapter: any;
  ssr?: any;
  hydration?: any;
  analytics: IntegrationAnalytics;
}

/**
 * Analytics and monitoring interface for integration performance.
 */
export interface IntegrationAnalytics {
  getMetrics(): IntegrationMetrics;
  trackEvent(event: string, data?: any): void;
  generateReport(): IntegrationReport;
}

/**
 * Comprehensive metrics for integration performance monitoring.
 */
export interface IntegrationMetrics {
  setupTime: number;
  bundleSize: number;
  memoryUsage: number;
  conflictsResolved: number;
  componentsRegistered: number;
  tokensExported: number;
}

/**
 * Detailed integration report with performance analysis and recommendations.
 */
export interface IntegrationReport {
  summary: IntegrationSummary;
  performance: PerformanceReport;
  conflicts: ConflictAnalysis;
  recommendations: string[];
}

/**
 * Integration summary with status and metadata.
 */
export interface IntegrationSummary {
  framework: string;
  mode: string;
  status: 'success' | 'warning' | 'error';
  timestamp: number;
}

/**
 * Performance analysis report with detailed metrics.
 */
export interface PerformanceReport {
  bundleImpact: number;
  runtimeOverhead: number;
  memoryFootprint: number;
  loadTime: number;
}

/**
 * Conflict analysis with resolution status and severity assessment.
 */
export interface ConflictAnalysis {
  total: number;
  resolved: number;
  unresolved: any[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Creates a comprehensive integration suite with enterprise features.
 * 
 * Provides a complete integration solution with framework adapter, SSR support,
 * hydration management, and comprehensive analytics for production deployments.
 * 
 * @param framework - Fluent Grow framework instance
 * @param options - Integration configuration options
 * @returns Complete integration suite with all requested features
 * 
 * @example
 * ```typescript
 * const suite = await createIntegrationSuite(framework, {
 *   type: 'react',
 *   mode: 'complement',
 *   ssr: true,
 *   hydration: true,
 *   analytics: true
 * });
 * ```
 */
export async function createIntegrationSuite(
  framework: any,
  options: {
    type: 'react' | 'vue' | 'svelte' | 'angular' | 'solid' | 'qwik';
    mode?: string;
    ssr?: boolean | any;
    hydration?: boolean | any;
    analytics?: boolean;
    performance?: boolean;
  }
): Promise<IntegrationSuite> {
  const { type } = options;

  // Create framework adapter with enterprise configuration
  const { integrations } = await import('./framework-adapter');
  const adapter = (integrations as any)[type] ? (integrations as any)[type](framework) : integrations.react(framework);

  const suite: IntegrationSuite = {
    adapter,
    analytics: new IntegrationAnalyticsImpl(adapter)
  };

  // Add SSR support if requested
  if (options.ssr) {
    const { SSRAdapter } = await import('./ssr-adapter');
    const ssrConfig = typeof options.ssr === 'object' ? options.ssr : {
      framework: getSSRFramework(type)
    };
    
    (suite as any).ssr = new SSRAdapter(framework, ssrConfig);
  }

  // Add hydration support if requested
  if (options.hydration) {
    const { HydrationManager } = await import('./hydration-manager');
    (suite as any).hydration = new HydrationManager();
  }

  // Initialize the suite
  await adapter.setup();

  return suite;
}

/**
 * Quick setup function for common integration patterns with preset configurations.
 * 
 * Provides pre-configured integration setups optimized for different use cases,
 * from minimal token-only integration to full enterprise deployment.
 * 
 * @param framework - Fluent Grow framework instance
 * @param type - Target framework type
 * @param preset - Integration preset (minimal, standard, enterprise)
 * @returns Configured integration suite
 * 
 * @example
 * ```typescript
 * // Minimal integration - tokens only
 * const minimal = await quickSetup(framework, 'react', 'minimal');
 * 
 * // Enterprise integration - full features
 * const enterprise = await quickSetup(framework, 'vue', 'enterprise');
 * ```
 */
export function quickSetup(
  framework: any,
  type: 'react' | 'vue' | 'svelte',
  preset: 'minimal' | 'standard' | 'enterprise' = 'standard'
) {
  const presets = {
    minimal: {
      mode: 'tokens-only',
      ssr: false,
      hydration: false,
      analytics: false
    },
    standard: {
      mode: 'complement',
      ssr: true,
      hydration: true,
      analytics: true
    },
    enterprise: {
      mode: 'progressive',
      ssr: true,
      hydration: true,
      analytics: true,
      performance: true
    }
  };

  return createIntegrationSuite(framework, {
    type,
    ...presets[preset]
  });
}

/**
 * Legacy compatibility function for existing integrations.
 * 
 * @deprecated Use createIntegrationSuite for new implementations
 */
export function createIntegration(framework: any, options: {
  type: 'react' | 'vue' | 'svelte';
  ssr?: boolean;
  hydration?: boolean;
}) {
  return quickSetup(framework, options.type, 'standard');
}

// Helper functions for internal use

/**
 * Maps framework types to their corresponding SSR framework names.
 */
function getSSRFramework(type: string): any {
  const mapping = {
    react: 'next',
    vue: 'nuxt',
    svelte: 'sveltekit',
    angular: 'angular',
    solid: 'solid-start',
    qwik: 'qwik-city'
  };
  return (mapping as any)[type] || type;
}

/**
 * Implementation of integration analytics with comprehensive monitoring.
 */
class IntegrationAnalyticsImpl implements IntegrationAnalytics {
  private metrics = new Map<string, number>();
  private events: Array<{ event: string; data: any; timestamp: number }> = [];

  constructor(private adapter: any) {
    // Listen to adapter events for automatic metric collection
    if (adapter.on) {
      adapter.on('performance:metric', ({ metric, value }: any) => {
        this.metrics.set(metric, value);
      });
      
      adapter.on('setup:complete', ({ duration }: any) => {
        this.metrics.set('setup-time', duration);
      });
    }
  }

  /**
   * Retrieves current integration metrics.
   */
  getMetrics(): IntegrationMetrics {
    const status = this.adapter.getStatus();
    
    return {
      setupTime: this.metrics.get('setup-time') || 0,
      bundleSize: status.bundleSize,
      memoryUsage: status.memoryUsage,
      conflictsResolved: status.conflicts.length,
      componentsRegistered: status.registeredComponents.length,
      tokensExported: this.metrics.get('tokens-exported') || 0
    };
  }

  /**
   * Tracks custom events for analytics and debugging.
   */
  trackEvent(event: string, data?: any): void {
    this.events.push({
      event,
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Generates comprehensive integration report with analysis and recommendations.
   */
  generateReport(): IntegrationReport {
    const metrics = this.getMetrics();
    const status = this.adapter.getStatus();
    
    return {
      summary: {
        framework: 'fluent-grow',
        mode: status.mode,
        status: status.conflicts.some((c: any) => c.severity === 'critical') ? 'error' : 'success',
        timestamp: Date.now()
      },
      performance: {
        bundleImpact: metrics.bundleSize,
        runtimeOverhead: 0, // Calculate based on metrics
        memoryFootprint: metrics.memoryUsage,
        loadTime: metrics.setupTime
      },
      conflicts: {
        total: status.conflicts.length,
        resolved: status.conflicts.filter((c: any) => c.resolution).length,
        unresolved: status.conflicts.filter((c: any) => !c.resolution),
        severity: this.calculateOverallSeverity(status.conflicts)
      },
      recommendations: this.generateRecommendations(status)
    };
  }

  /**
   * Calculates overall severity level from conflict reports.
   */
  private calculateOverallSeverity(conflicts: any[]): 'low' | 'medium' | 'high' | 'critical' {
    if (conflicts.some((c: any) => c.severity === 'critical')) return 'critical';
    if (conflicts.some((c: any) => c.severity === 'high')) return 'high';
    if (conflicts.some((c: any) => c.severity === 'medium')) return 'medium';
    return 'low';
  }

  /**
   * Generates actionable recommendations based on integration status.
   */
  private generateRecommendations(status: any): string[] {
    const recommendations: string[] = [];
    
    if (status.bundleSize > 100000) {
      recommendations.push('Consider enabling tree-shaking to reduce bundle size');
    }
    
    if (status.conflicts.length > 5) {
      recommendations.push('Multiple conflicts detected - consider isolated mode');
    }
    
    if (status.memoryUsage > 50000000) {
      recommendations.push('High memory usage detected - optimize component registration');
    }
    
    return recommendations;
  }
}