import type { FluentFramework } from '../core/framework';
import { renderStylesToString } from '../core/style-injector';

export interface SSRConfig {
  framework: 'next' | 'nuxt' | 'sveltekit' | 'astro' | 'remix';
  extractCritical?: boolean;
  inlineStyles?: boolean;
  deferNonCritical?: boolean;
}

export interface SSRResult {
  html: string;
  css: string;
  criticalCss?: string;
  deferredCss?: string;
}

export class SSRAdapter {
  private framework: FluentFramework;
  private config: SSRConfig;

  constructor(framework: FluentFramework, config: SSRConfig) {
    this.framework = framework;
    this.config = config;
  }

  async renderToString(html: string): Promise<SSRResult> {
    // Initialize framework in SSR mode
    await this.framework.initialise();
    
    const css = renderStylesToString();
    
    if (this.config.extractCritical) {
      const { criticalCss, deferredCss } = this.extractCriticalCSS(css, html);
      return {
        html: this.injectCriticalCSS(html, criticalCss),
        css,
        criticalCss,
        deferredCss
      };
    }

    return {
      html: this.config.inlineStyles ? this.inlineCSS(html, css) : html,
      css
    };
  }

  private extractCriticalCSS(css: string, html: string): { criticalCss: string; deferredCss: string } {
    // Extract only CSS rules that match elements in HTML
    const usedSelectors = this.findUsedSelectors(html);
    const rules = css.split('}').filter(Boolean);
    
    const critical: string[] = [];
    const deferred: string[] = [];
    
    rules.forEach(rule => {
      const selector = rule.split('{')[0]?.trim();
      if (selector && this.isCriticalSelector(selector, usedSelectors)) {
        critical.push(rule + '}');
      } else {
        deferred.push(rule + '}');
      }
    });
    
    return {
      criticalCss: critical.join('\n'),
      deferredCss: deferred.join('\n')
    };
  }

  private findUsedSelectors(html: string): Set<string> {
    const selectors = new Set<string>();
    
    // Extract class names
    const classMatches = html.match(/class=["']([^"']*)["']/g) || [];
    classMatches.forEach(match => {
      const classes = match.replace(/class=["']([^"']*)["']/, '$1').split(/\s+/);
      classes.forEach(cls => cls && selectors.add(`.${cls}`));
    });
    
    // Extract IDs
    const idMatches = html.match(/id=["']([^"']*)["']/g) || [];
    idMatches.forEach(match => {
      const id = match.replace(/id=["']([^"']*)["']/, '$1');
      selectors.add(`#${id}`);
    });
    
    // Extract tag names
    const tagMatches = html.match(/<(\w+)/g) || [];
    tagMatches.forEach(match => {
      const tag = match.replace('<', '');
      selectors.add(tag.toLowerCase());
    });
    
    // Use querySelector-like logic for complex selectors
    const complexSelectors = html.match(/\[data-[\w-]+\]/g) || [];
    complexSelectors.forEach(selector => {
      selectors.add(selector);
    });
    
    // Extract fluent components
    const fluentMatches = html.match(/<fluent-[\w-]+/g) || [];
    fluentMatches.forEach(match => {
      const tag = match.replace('<', '');
      selectors.add(tag);
    });
    
    return selectors;
  }

  private isCriticalSelector(selector: string, usedSelectors: Set<string>): boolean {
    // Always include reset/base styles
    if (selector.includes('*') || selector.includes('html') || selector.includes('body')) {
      return true;
    }
    
    // Check direct matches
    if (usedSelectors.has(selector)) {
      return true;
    }
    
    // Check if selector matches any used selectors
    for (const used of usedSelectors) {
      // Direct match
      if (selector === used) return true;
      
      // Class/ID match
      if (selector.includes(used) || used.includes(selector.replace(/[.#:].*/, ''))) {
        return true;
      }
      
      // Tag match
      if (selector.startsWith(used) || used.startsWith(selector)) {
        return true;
      }
    }
    
    return false;
  }

  private injectCriticalCSS(html: string, css: string): string {
    const styleTag = `<style data-fluent-critical>${css}</style>`;
    
    if (html.includes('</head>')) {
      return html.replace('</head>', `${styleTag}</head>`);
    }
    
    return `${styleTag}${html}`;
  }

  private inlineCSS(html: string, css: string): string {
    const styleTag = `<style data-fluent-inline>${css}</style>`;
    
    if (html.includes('</head>')) {
      return html.replace('</head>', `${styleTag}</head>`);
    }
    
    return `${styleTag}${html}`;
  }

  generateDeferredLoader(deferredCss: string): string {
    return `
<script>
(function() {
  const css = ${JSON.stringify(deferredCss)};
  const style = document.createElement('style');
  style.setAttribute('data-fluent-deferred', '');
  style.textContent = css;
  document.head.appendChild(style);
})();
</script>`;
  }
}

// Framework-specific helpers
export const ssrHelpers = {
  next: {
    getServerSideProps: (_framework: FluentFramework) => async () => {
      return {
        props: {
          fluentCSS: renderStylesToString()
        }
      };
    }
  },
  
  nuxt: {
    plugin: (_framework: FluentFramework) => ({
      name: 'fluent-grow',
      setup() {
        // Nuxt 3 plugin setup
      }
    })
  },
  
  sveltekit: {
    hooks: (framework: FluentFramework) => ({
      async handle({ event, resolve }: any) {
        const response = await resolve(event);
        
        if (response.headers.get('content-type')?.includes('text/html')) {
          const adapter = new SSRAdapter(framework, { 
            framework: 'sveltekit',
            inlineStyles: true 
          });
          
          const html = await response.text();
          const result = await adapter.renderToString(html);
          
          return new Response(result.html, {
            headers: response.headers
          });
        }
        
        return response;
      }
    })
  }
};