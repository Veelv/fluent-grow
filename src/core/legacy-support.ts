/**
 * Suporte para navegadores antigos com polyfills e fallbacks
 */

export interface LegacySupport {
  hasES6: boolean;
  hasPromise: boolean;
  hasFetch: boolean;
  hasCSS: boolean;
  needsPolyfills: string[];
}

export class LegacySupportManager {
  private support: LegacySupport;

  constructor() {
    this.support = this.detectLegacySupport();
  }

  private detectLegacySupport(): LegacySupport {
    const hasES6 = typeof Map !== 'undefined' && typeof Set !== 'undefined';
    const hasPromise = typeof Promise !== 'undefined';
    const hasFetch = typeof fetch !== 'undefined';
    const hasCSS = typeof CSS !== 'undefined';

    const needsPolyfills: string[] = [];
    if (!hasPromise) needsPolyfills.push('es6-promise');
    if (!hasFetch) needsPolyfills.push('fetch');
    if (!hasCSS) needsPolyfills.push('css-supports');

    return {
      hasES6,
      hasPromise,
      hasFetch,
      hasCSS,
      needsPolyfills
    };
  }

  getSupport(): LegacySupport {
    return { ...this.support };
  }

  isLegacyBrowser(): boolean {
    return this.support.needsPolyfills.length > 0 || !this.support.hasES6;
  }

  /**
   * Aplica fallbacks CSS para navegadores antigos
   */
  generateLegacyCSS(modernCSS: Record<string, string>): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [prop, value] of Object.entries(modernCSS)) {
      // Converte propriedades modernas para equivalentes antigos
      switch (prop) {
        case 'display':
          if (value === 'grid') {
            result[prop] = 'block'; // Fallback para IE
            result['display'] = 'grid'; // Progressive enhancement
          } else {
            result[prop] = value;
          }
          break;

        case 'gap':
          // IE não suporta gap, usa margin
          result['margin'] = value;
          result[prop] = value;
          break;

        default:
          result[prop] = value;
      }
    }

    return result;
  }

  /**
   * Injeta CSS para suporte a navegadores antigos
   */
  injectLegacySupport(): void {
    if (typeof document === 'undefined') return;

    const css = `
      .fluent-flex, fluent-flex {
        display: -ms-flexbox;
        display: flex;
      }
      .fluent-grid, fluent-grid {
        display: block;
      }
      @supports (display: grid) {
        .fluent-grid, fluent-grid {
          display: grid;
        }
      }
      :root {
        --fluent-color-primary: #0078d4;
        --fluent-color-secondary: #6c757d;
      }
    `;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }
}