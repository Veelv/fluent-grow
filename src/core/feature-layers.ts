import { VersionManager } from './version-manager';

export type FeatureLayer = 'core' | 'enhanced' | 'experimental';

export interface LayerConfig {
  layer: FeatureLayer;
  dependencies: string[];
  fallback?: string;
  polyfill?: string;
}

export class FeatureLayerManager {
  private versionManager = VersionManager.getInstance();
  private enabledLayers: Set<FeatureLayer> = new Set();
  
  private layerDefinitions: Map<string, LayerConfig> = new Map([
    ['web-components', { layer: 'core', dependencies: ['customElements', 'shadowDOM'] }],
    ['container-queries', { layer: 'enhanced', dependencies: ['containerQueries'], fallback: 'media-queries' }],
    
    // Features com suporte limitado - requerem fallbacks robustos
    ['anchor-positioning', { 
      layer: 'experimental', 
      dependencies: ['anchorPositioning'], 
      fallback: 'absolute-positioning',
      polyfill: '@oddbird/css-anchor-positioning'
    }],
    ['view-transitions', { 
      layer: 'experimental', 
      dependencies: ['viewTransitions'], 
      fallback: 'css-transitions',
      polyfill: 'view-transitions-polyfill'
    }],
    
    // Houdini features - suporte muito limitado, fallbacks essenciais
    ['houdini-paint', { 
      layer: 'experimental', 
      dependencies: ['houdiniPaint'], 
      fallback: 'css-gradients',
      polyfill: 'css-paint-polyfill'
    }],
    ['houdini-animation', { 
      layer: 'experimental', 
      dependencies: ['houdiniPaint'], // Usa mesma detecção
      fallback: 'css-animations'
    }],
    ['houdini-layout', { 
      layer: 'experimental', 
      dependencies: ['houdiniPaint'], // Usa mesma detecção
      fallback: 'css-grid'
    }]
  ]);

  constructor() {
    this.initializeLayers();
  }

  private initializeLayers(): void {
    const support = this.versionManager.getBrowserSupport();
    
    // Core layer - sempre habilitado se Web Components estiver disponível
    if (support.customElements && support.shadowDOM) {
      this.enabledLayers.add('core');
    }
    
    // Enhanced layer - recursos estáveis e amplamente suportados
    if (support.containerQueries) {
      this.enabledLayers.add('enhanced');
    }
    
    // Experimental layer - recursos cutting-edge
    if (support.anchorPositioning || support.viewTransitions || support.houdiniPaint) {
      this.enabledLayers.add('experimental');
    }
  }

  isLayerEnabled(layer: FeatureLayer): boolean {
    return this.enabledLayers.has(layer);
  }

  isFeatureAvailable(feature: string): boolean {
    const config = this.layerDefinitions.get(feature);
    if (!config) return false;
    
    if (!this.enabledLayers.has(config.layer)) return false;
    
    const support = this.versionManager.getBrowserSupport();
    return config.dependencies.every(dep => support[dep as keyof typeof support]);
  }

  getFallback(feature: string): string | null {
    const config = this.layerDefinitions.get(feature);
    return config?.fallback || null;
  }

  getEnabledFeatures(): string[] {
    return Array.from(this.layerDefinitions.entries())
      .filter(([feature]) => this.isFeatureAvailable(feature))
      .map(([feature]) => feature);
  }

  async loadPolyfillsForLayer(layer: FeatureLayer): Promise<void> {
    const features = Array.from(this.layerDefinitions.entries())
      .filter(([, config]) => config.layer === layer && config.polyfill);
    
    for (const [feature, config] of features) {
      if (!this.isFeatureAvailable(feature) && config.polyfill) {
        try {
          await import(config.polyfill);
          console.info(`[FeatureLayer] Loaded polyfill for ${feature}`);
        } catch (error) {
          console.warn(`[FeatureLayer] Failed to load polyfill for ${feature}:`, error);
        }
      }
    }
  }
}