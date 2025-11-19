import { VersionManager } from './version-manager';

export interface FallbackStrategy {
  feature: string;
  fallbacks: Array<{
    condition: () => boolean;
    implementation: string;
    quality: 'native' | 'polyfill' | 'graceful' | 'minimal';
  }>;
}

/**
 * Gerencia fallbacks para features com suporte limitado ou inconsistente
 */
export class FeatureFallbackManager {
  private versionManager = VersionManager.getInstance();
  
  private strategies: FallbackStrategy[] = [
    {
      feature: 'houdini-paint',
      fallbacks: [
        {
          condition: () => this.versionManager.isFeatureSupported('houdiniPaint'),
          implementation: 'native',
          quality: 'native'
        },
        {
          condition: () => typeof CSS !== 'undefined' && CSS.supports('background: conic-gradient(red, blue)'),
          implementation: 'css-gradients-advanced',
          quality: 'graceful'
        },
        {
          condition: () => typeof CSS !== 'undefined' && CSS.supports('background: linear-gradient(red, blue)'),
          implementation: 'css-gradients-basic',
          quality: 'minimal'
        }
      ]
    },
    {
      feature: 'anchor-positioning',
      fallbacks: [
        {
          condition: () => this.versionManager.isFeatureSupported('anchorPositioning'),
          implementation: 'native',
          quality: 'native'
        },
        {
          condition: () => typeof window !== 'undefined' && 'ResizeObserver' in window,
          implementation: 'js-positioning-observer',
          quality: 'polyfill'
        },
        {
          condition: () => true,
          implementation: 'absolute-positioning',
          quality: 'minimal'
        }
      ]
    },
    {
      feature: 'view-transitions',
      fallbacks: [
        {
          condition: () => this.versionManager.isFeatureSupported('viewTransitions'),
          implementation: 'native',
          quality: 'native'
        },
        {
          condition: () => typeof CSS !== 'undefined' && CSS.supports('animation: fade 1s'),
          implementation: 'css-transitions',
          quality: 'graceful'
        },
        {
          condition: () => true,
          implementation: 'instant-change',
          quality: 'minimal'
        }
      ]
    }
  ];

  getBestFallback(feature: string): { implementation: string; quality: string } | null {
    const strategy = this.strategies.find(s => s.feature === feature);
    if (!strategy) return null;

    for (const fallback of strategy.fallbacks) {
      if (fallback.condition()) {
        return {
          implementation: fallback.implementation,
          quality: fallback.quality
        };
      }
    }

    return null;
  }

  getFeatureReport(): Record<string, { available: string; quality: string }> {
    const report: Record<string, { available: string; quality: string }> = {};
    
    for (const strategy of this.strategies) {
      const fallback = this.getBestFallback(strategy.feature);
      if (fallback) {
        report[strategy.feature] = {
          available: fallback.implementation,
          quality: fallback.quality
        };
      }
    }

    return report;
  }

  /**
   * Gera CSS com fallbacks automáticos baseado no suporte do browser
   */
  generateFallbackCSS(feature: string, nativeCSS: string, fallbackCSS: string): string {
    const fallback = this.getBestFallback(feature);
    
    if (!fallback || fallback.quality === 'native') {
      return nativeCSS;
    }
    
    if (fallback.quality === 'minimal') {
      return fallbackCSS;
    }
    
    // Para polyfills e graceful degradation, usa ambos
    return `${fallbackCSS}\n${nativeCSS}`;
  }

  /**
   * Aplica estratégias específicas para Houdini Paint
   */
  getHoudiniPaintFallback(paintName: string): string {
    const fallback = this.getBestFallback('houdini-paint');
    
    switch (fallback?.implementation) {
      case 'native':
        return `paint(${paintName})`;
      
      case 'css-gradients-advanced':
        // Mapeia paint worklets comuns para gradientes CSS
        switch (paintName) {
          case 'ripple':
            return 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)';
          case 'wave':
            return 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)';
          case 'noise':
            return 'conic-gradient(from 0deg, #f0f0f0, #e0e0e0, #f0f0f0)';
          default:
            return 'linear-gradient(45deg, #f0f0f0, #e0e0e0)';
        }
      
      case 'css-gradients-basic':
        return 'linear-gradient(45deg, #f0f0f0, #e0e0e0)';
      
      default:
        return 'transparent';
    }
  }
}