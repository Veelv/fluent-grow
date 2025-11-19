import { FeatureFallbackManager } from '../core/feature-fallbacks';

const fallbackManager = new FeatureFallbackManager();

/**
 * Gera CSS com fallbacks automáticos para features modernas
 */
export function withFallbacks(css: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [property, value] of Object.entries(css)) {
    // Detecta uso de paint worklets
    if (value.includes('paint(')) {
      const paintMatch = value.match(/paint\(([^)]+)\)/);
      if (paintMatch?.[1]) {
        const paintName = paintMatch[1];
        const fallbackValue = fallbackManager.getHoudiniPaintFallback(paintName);
        result[property] = fallbackValue;
        
        // Adiciona versão nativa como progressive enhancement
        if (fallbackValue !== value) {
          result[`${property}--native`] = value;
        }
      }
    }
    // Detecta anchor positioning
    else if (value.includes('anchor(')) {
      const fallback = fallbackManager.getBestFallback('anchor-positioning');
      if (fallback?.quality !== 'native') {
        // Converte anchor() para absolute positioning
        result[property] = value.replace(/anchor\([^)]+\)/g, '0');
        result[`${property}--anchor`] = value;
      } else {
        result[property] = value;
      }
    }
    // Detecta view transitions
    else if (property === 'view-transition-name') {
      const fallback = fallbackManager.getBestFallback('view-transitions');
      if (fallback?.quality !== 'native') {
        // Remove view-transition-name se não suportado
        result['transition'] = 'opacity 0.3s ease';
      } else {
        result[property] = value;
      }
    }
    else {
      result[property] = value;
    }
  }
  
  return result;
}

/**
 * Gera @supports rules para progressive enhancement
 */
export function generateSupportsRules(feature: string, css: Record<string, string>): string {
  const rules: string[] = [];
  
  switch (feature) {
    case 'houdini-paint':
      rules.push(`@supports (background: paint(test)) {`);
      for (const [prop, value] of Object.entries(css)) {
        if (prop.endsWith('--native')) {
          const baseProp = prop.replace('--native', '');
          rules.push(`  ${baseProp}: ${value};`);
        }
      }
      rules.push(`}`);
      break;
      
    case 'anchor-positioning':
      rules.push(`@supports (anchor-name: --test) {`);
      for (const [prop, value] of Object.entries(css)) {
        if (prop.endsWith('--anchor')) {
          const baseProp = prop.replace('--anchor', '');
          rules.push(`  ${baseProp}: ${value};`);
        }
      }
      rules.push(`}`);
      break;
      
    case 'view-transitions':
      rules.push(`@supports (view-transition-name: test) {`);
      for (const [prop, value] of Object.entries(css)) {
        rules.push(`  ${prop}: ${value};`);
      }
      rules.push(`}`);
      break;
  }
  
  return rules.join('\n');
}

/**
 * Aplica fallbacks específicos para diferentes browsers
 */
export function applyBrowserSpecificFallbacks(css: Record<string, string>): Record<string, string> {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isFirefox = /Firefox/.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
  
  const result = { ...css };
  
  // Firefox não suporta Houdini Paint
  if (isFirefox) {
    for (const [prop, value] of Object.entries(result)) {
      if (typeof value === 'string' && value.includes('paint(')) {
        const paintMatch = value.match(/paint\(([^)]+)\)/);
        if (paintMatch && paintMatch[1]) {
          result[prop] = fallbackManager.getHoudiniPaintFallback(paintMatch[1]);
        }
      }
    }
  }
  
  // Safari tem suporte limitado para algumas features
  if (isSafari) {
    for (const [prop] of Object.entries(result)) {
      // View transitions parciais no Safari
      if (prop === 'view-transition-name') {
        result['transition'] = 'opacity 0.3s ease';
      }
    }
  }
  
  return result;
}

/**
 * Utilitário para criar CSS resiliente com múltiplas camadas de fallback
 */
export function createResilientCSS(config: {
  base: Record<string, string>;
  enhanced?: Record<string, string>;
  experimental?: Record<string, string>;
}): string {
  const baseCSS = withFallbacks(config.base);
  const enhancedCSS = config.enhanced ? withFallbacks(config.enhanced) : {};
  const experimentalCSS = config.experimental ? withFallbacks(config.experimental) : {};
  
  const rules: string[] = [];
  
  // Base styles (sempre aplicados)
  for (const [prop, value] of Object.entries(baseCSS)) {
    if (!prop.includes('--')) {
      rules.push(`${prop}: ${value};`);
    }
  }
  
  // Enhanced styles com @supports
  if (Object.keys(enhancedCSS).length > 0) {
    rules.push(generateSupportsRules('container-queries', enhancedCSS));
  }
  
  // Experimental styles com @supports
  if (Object.keys(experimentalCSS).length > 0) {
    rules.push(generateSupportsRules('houdini-paint', experimentalCSS));
    rules.push(generateSupportsRules('anchor-positioning', experimentalCSS));
    rules.push(generateSupportsRules('view-transitions', experimentalCSS));
  }
  
  return rules.filter(rule => rule.trim()).join('\n');
}