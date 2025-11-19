import type { FluentFramework } from '../core/framework';
import type { FrameworkTokens } from '../core/config';

export interface FrameworkIntegration {
  name: 'react' | 'vue' | 'svelte' | 'angular';
  stylingSystem?: 'styled-components' | 'emotion' | 'css-modules' | 'tailwind';
}

export interface AdapterConfig {
  integration: FrameworkIntegration;
  mode: 'complement' | 'override' | 'minimal';
  conflictResolution: 'framework-first' | 'fluent-first' | 'merge';
  cssVariablePrefix?: string;
}

export class FrameworkAdapter {
  private config: AdapterConfig;
  private framework: FluentFramework;

  constructor(framework: FluentFramework, config: AdapterConfig) {
    this.framework = framework;
    this.config = config;
  }

  async setup(): Promise<void> {
    const { mode } = this.config;
    
    switch (mode) {
      case 'minimal':
        await this.setupMinimalMode();
        break;
      case 'complement':
        await this.setupComplementMode();
        break;
      case 'override':
        await this.setupOverrideMode();
        break;
    }
  }

  private async setupMinimalMode(): Promise<void> {
    const prefixedTokens = this.prefixTokens(this.framework.config.tokens, (this.config as any).namespace || 'fluent');
    this.framework.updateTokens(prefixedTokens);
  }

  private async setupComplementMode(): Promise<void> {
    const adaptedTokens = this.adaptTokensForFramework();
    this.framework.updateTokens(adaptedTokens);
    await this.registerNonConflictingComponents();
  }

  private async setupOverrideMode(): Promise<void> {
    await this.framework.initialise();
  }

  private prefixTokens(tokens: FrameworkTokens, prefix: string): FrameworkTokens {
    const result: FrameworkTokens = {};
    
    Object.entries(tokens).forEach(([groupKey, group]) => {
      if (group) {
        result[`${prefix}-${groupKey}`] = group;
      }
    });
    
    return result;
  }

  private adaptTokensForFramework(): FrameworkTokens {
    const tokens = this.framework.config.tokens;
    const { stylingSystem } = this.config.integration;
    
    // Adapt tokens based on styling system
    if (stylingSystem === 'tailwind') {
      return this.adaptForTailwind(tokens);
    } else if (stylingSystem === 'styled-components') {
      return this.adaptForStyledComponents(tokens);
    }
    
    return tokens;
  }
  
  private adaptForTailwind(tokens: FrameworkTokens): FrameworkTokens {
    // Convert to Tailwind-compatible format
    const adapted = { ...tokens };
    if (adapted.spacing) {
      // Convert spacing to rem values for Tailwind compatibility
      Object.keys(adapted.spacing).forEach(key => {
        const value = adapted.spacing![key as keyof typeof adapted.spacing];
        if (value && typeof value === 'object' && 'base' in value && typeof value.base === 'string' && value.base.endsWith('px')) {
          const px = parseInt(value.base);
          (value as any).base = `${px / 16}rem`;
        }
      });
    }
    return adapted;
  }
  
  private adaptForStyledComponents(tokens: FrameworkTokens): FrameworkTokens {
    // Optimize for styled-components theme structure
    return tokens;
  }

  private async registerNonConflictingComponents(): Promise<void> {
    const safeComponents = this.framework.config.components.filter(comp => 
      !this.isConflictingComponent(comp.tag)
    );
    
    if (safeComponents.length > 0) {
      await this.framework.registerComponents(...safeComponents);
    }
  }

  private isConflictingComponent(tag: string): boolean {
    const { name, stylingSystem } = this.config.integration;
    
    // Check for known conflicts by framework
    const frameworkConflicts: Record<string, string[]> = {
      react: ['fluent-button', 'fluent-input', 'fluent-select'],
      vue: ['fluent-card', 'fluent-modal', 'fluent-dialog'],
      svelte: ['fluent-grid', 'fluent-flex', 'fluent-layout'],
      angular: ['fluent-form', 'fluent-table', 'fluent-list']
    };
    
    // Check for styling system conflicts
    const stylingConflicts: Record<string, string[]> = {
      'styled-components': ['fluent-styled'],
      'emotion': ['fluent-emotion'],
      'tailwind': ['fluent-tw'],
      'css-modules': ['fluent-module']
    };
    
    const conflicts = frameworkConflicts[name] || [];
    const styleConflicts = stylingSystem ? stylingConflicts[stylingSystem] || [] : [];
    
    return conflicts.includes(tag) || styleConflicts.includes(tag);
  }

  exportTokens(format: 'css' | 'js' | 'json' | 'scss' | 'less' = 'css'): string {
    const tokens = this.framework.config.tokens;
    const transforms = (this.config as any).tokenTransforms;
    
    let processedTokens = tokens;
    if (transforms?.transforms) {
      processedTokens = this.applyTokenTransforms(tokens, transforms.transforms);
    }
    
    return this.formatTokens(processedTokens, format);
  }
  
  private formatTokens(tokens: FrameworkTokens, format: string): string {
    switch (format) {
      case 'js':
        return `export const tokens = ${JSON.stringify(tokens, null, 2)};`;
      case 'json':
        return JSON.stringify(tokens, null, 2);
      case 'scss':
        return this.tokensToSCSS(tokens);
      case 'less':
        return this.tokensToLess(tokens);
      case 'css':
      default:
        return this.tokensToCSS(tokens);
    }
  }
  
  private tokensToCSS(tokens: FrameworkTokens): string {
    const cssVars: string[] = [':root {'];
    
    const processTokenGroup = (group: any, prefix: string) => {
      Object.entries(group).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null && 'base' in value) {
          cssVars.push(`  --${prefix}-${key}: ${value.base};`);
        } else if (typeof value === 'object' && value !== null) {
          processTokenGroup(value, `${prefix}-${key}`);
        }
      });
    };
    
    Object.entries(tokens).forEach(([groupName, group]) => {
      if (typeof group === 'object' && group !== null) {
        processTokenGroup(group, groupName);
      }
    });
    
    cssVars.push('}');
    return cssVars.join('\n');
  }
  
  private tokensToSCSS(tokens: FrameworkTokens): string {
    const scssVars: string[] = [];
    
    const processTokenGroup = (group: any, prefix: string) => {
      Object.entries(group).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null && 'base' in value) {
          scssVars.push(`$${prefix}-${key}: ${value.base};`);
        } else if (typeof value === 'object' && value !== null) {
          processTokenGroup(value, `${prefix}-${key}`);
        }
      });
    };
    
    Object.entries(tokens).forEach(([groupName, group]) => {
      if (typeof group === 'object' && group !== null) {
        processTokenGroup(group, groupName);
      }
    });
    
    return scssVars.join('\n');
  }
  
  private tokensToLess(tokens: FrameworkTokens): string {
    const lessVars: string[] = [];
    
    const processTokenGroup = (group: any, prefix: string) => {
      Object.entries(group).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null && 'base' in value) {
          lessVars.push(`@${prefix}-${key}: ${value.base};`);
        } else if (typeof value === 'object' && value !== null) {
          processTokenGroup(value, `${prefix}-${key}`);
        }
      });
    };
    
    Object.entries(tokens).forEach(([groupName, group]) => {
      if (typeof group === 'object' && group !== null) {
        processTokenGroup(group, groupName);
      }
    });
    
    return lessVars.join('\n');
  }
  
  private applyTokenTransforms(tokens: any, transforms: any[]): any {
    let result = { ...tokens };
    
    transforms.forEach(transform => {
      if (typeof transform === 'function') {
        const entries = Object.entries(result);
        entries.forEach(([key, value]) => {
          const [newKey, newValue] = transform(key, value);
          if (newKey !== key) {
            delete result[key];
            result[newKey] = newValue;
          } else {
            result[key] = newValue;
          }
        });
      }
    });
    
    return result;
  }
  

}

export const integrations = {
  react: (framework: FluentFramework) => 
    new FrameworkAdapter(framework, {
      integration: { name: 'react' },
      mode: 'complement',
      conflictResolution: 'framework-first'
    }),
    
  vue: (framework: FluentFramework) =>
    new FrameworkAdapter(framework, {
      integration: { name: 'vue' },
      mode: 'complement', 
      conflictResolution: 'merge'
    }),
    
  svelte: (framework: FluentFramework) =>
    new FrameworkAdapter(framework, {
      integration: { name: 'svelte' },
      mode: 'minimal',
      conflictResolution: 'fluent-first'
    })
};