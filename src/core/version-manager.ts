export interface BrowserSupport {
  customElements: boolean;
  shadowDOM: boolean;
  containerQueries: boolean;
  anchorPositioning: boolean;
  viewTransitions: boolean;
  houdiniPaint: boolean;
  cssNesting: boolean;
}

export interface VersionInfo {
  version: string;
  buildDate: string;
  compatibility: 'modern' | 'legacy' | 'hybrid';
  features: string[];
}

export class VersionManager {
  private static instance: VersionManager;
  private browserSupport: BrowserSupport;
  private versionInfo: VersionInfo;

  constructor() {
    this.browserSupport = this.detectBrowserSupport();
    this.versionInfo = {
      version: '0.1.1',
      buildDate: new Date().toISOString(),
      compatibility: this.determineCompatibilityLevel(),
      features: this.getAvailableFeatures()
    };
  }

  static getInstance(): VersionManager {
    if (!VersionManager.instance) {
      VersionManager.instance = new VersionManager();
    }
    return VersionManager.instance;
  }

  private detectBrowserSupport(): BrowserSupport {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return {
        customElements: false,
        shadowDOM: false,
        containerQueries: false,
        anchorPositioning: false,
        viewTransitions: false,
        houdiniPaint: false,
        cssNesting: false
      };
    }

    // Detecção baseada em features, não em user agent
    const hasCustomElements = 'customElements' in window;
    const hasShadowDOM = typeof Element !== 'undefined' && 'attachShadow' in Element.prototype;
    const hasCSS = typeof CSS !== 'undefined';
    const hasDocument = typeof document !== 'undefined';

    return {
      // Web Components - suporte universal moderno
      customElements: hasCustomElements,
      shadowDOM: hasShadowDOM,
      
      // Container queries - teste direto de suporte
      containerQueries: hasCSS && CSS.supports('container-type: inline-size'),
      
      // Anchor positioning - teste direto
      anchorPositioning: hasCSS && CSS.supports('anchor-name: --test'),
      
      // View transitions - teste direto
      viewTransitions: hasDocument && 'startViewTransition' in document,
      
      // Houdini Paint - teste direto
      houdiniPaint: hasCSS && 'paintWorklet' in CSS,
      
      // CSS Nesting - teste direto
      cssNesting: hasCSS && CSS.supports('selector(&:hover)')
    };
  }

  private determineCompatibilityLevel(): 'modern' | 'legacy' | 'hybrid' {
    const { customElements, shadowDOM, containerQueries } = this.browserSupport;
    
    // Detecta navegadores muito antigos
    const hasBasicES6 = typeof Promise !== 'undefined' && typeof Map !== 'undefined';
    const hasBasicCSS = typeof CSS !== 'undefined';
    
    if (!hasBasicES6 || !hasBasicCSS) return 'legacy';
    if (customElements && shadowDOM && containerQueries) return 'modern';
    if (customElements && shadowDOM) return 'hybrid';
    return 'legacy';
  }

  private getAvailableFeatures(): string[] {
    const features: string[] = [];
    
    if (this.browserSupport.customElements) features.push('web-components');
    if (this.browserSupport.containerQueries) features.push('container-queries');
    if (this.browserSupport.anchorPositioning) features.push('anchor-positioning');
    if (this.browserSupport.viewTransitions) features.push('view-transitions');
    if (this.browserSupport.houdiniPaint) features.push('houdini-paint');
    
    return features;
  }

  getBrowserSupport(): BrowserSupport {
    return { ...this.browserSupport };
  }

  getVersionInfo(): VersionInfo {
    return { ...this.versionInfo };
  }

  isFeatureSupported(feature: keyof BrowserSupport): boolean {
    return this.browserSupport[feature];
  }

  getCompatibilityReport(): string {
    const { compatibility, features, version } = this.versionInfo;
    const support = this.browserSupport;
    
    const fallbacks: string[] = [];
    
    // Lista features que usarão fallbacks
    if (!support.houdiniPaint) fallbacks.push('Houdini Paint → CSS gradients');
    if (!support.anchorPositioning) fallbacks.push('Anchor Positioning → Absolute positioning');
    if (!support.viewTransitions) fallbacks.push('View Transitions → CSS transitions');
    if (!support.containerQueries) fallbacks.push('Container Queries → Media queries');
    
    let report = `Fluent Grow v${version} - ${compatibility} mode (${features.length} features)`;
    
    if (fallbacks.length > 0) {
      report += '\n🔄 Active Fallbacks:\n' + fallbacks.map(f => `   ${f}`).join('\n');
    } else {
      report += '\n✅ All modern features supported natively';
    }
    
    return report;
  }

  /**
   * Retorna informações sobre limitações gerais de features
   */
  getFeatureLimitations(): Record<string, { supported: boolean; limitations: string[] }> {
    const support = this.browserSupport;
    
    return {
      'houdini-paint': {
        supported: support.houdiniPaint,
        limitations: [
          'Limited browser support - automatic CSS gradient fallbacks',
          'Requires HTTPS in production',
          'Performance varies between implementations',
          'Fallbacks maintain visual consistency'
        ]
      },
      'anchor-positioning': {
        supported: support.anchorPositioning,
        limitations: [
          'Emerging feature with limited support',
          'Automatic absolute positioning fallback',
          'Polyfill available for broader compatibility',
          'Performance implications with polyfill'
        ]
      },
      'view-transitions': {
        supported: support.viewTransitions,
        limitations: [
          'Limited browser support - CSS transition fallbacks',
          'Same-origin navigation only',
          'Performance sensitive feature',
          'Graceful degradation to standard transitions'
        ]
      },
      'container-queries': {
        supported: support.containerQueries,
        limitations: [
          'Widely supported in modern browsers',
          'Media query fallbacks for older browsers',
          'Polyfill available if needed'
        ]
      }
    };
  }
}