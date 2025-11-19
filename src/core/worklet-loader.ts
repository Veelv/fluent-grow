import type { WorkletModuleConfig } from './config';

type WorkletType = 'paint' | 'animation' | 'layout';

type WorkletRegistry = { addModule(url: string): Promise<void> };

const loadCache = new Set<string>();

const MAX_RETRIES = 3;
const RETRY_DELAY = 150;

/**
 * Loads worklet modules com detecção de suporte real e fallbacks.
 * Inclui verificação específica por browser para evitar falsos positivos.
 */
export async function loadWorklets(modules: WorkletModuleConfig[], type: WorkletType = 'paint'): Promise<void> {
  if (!modules.length || typeof CSS === 'undefined') {
    return;
  }

  // Verifica suporte real baseado no browser
  const hasRealSupport = checkRealWorkletSupport(type);
  if (!hasRealSupport) {
    console.info(`[Worklets] ${type} worklets not supported in this browser, using fallbacks`);
    await loadWorkletFallbacks(modules, type);
    return;
  }

  const registry = resolveRegistry(type);
  if (!registry) {
    console.warn(`[Worklets] ${type} worklet registry not available, using fallbacks`);
    await loadWorkletFallbacks(modules, type);
    return;
  }

  for (const module of modules) {
    const shouldLoad = typeof module.when === 'function' ? module.when() : true;
    if (!shouldLoad) {
      continue;
    }

    if (loadCache.has(module.url)) {
      continue;
    }

    const success = await attemptLoad(registry, module, type);
    if (success) {
      loadCache.add(module.url);
    } else {
      // Se falhou, tenta carregar fallback
      await loadWorkletFallback(module, type);
    }
  }
}

async function attemptLoad(registry: WorkletRegistry, module: WorkletModuleConfig, type: WorkletType): Promise<boolean> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      await registry.addModule(module.url);
      return true;
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        if (typeof console !== 'undefined') {
          console.warn(`[FluentFramework] Failed to load ${type} worklet "${module.url}" after ${MAX_RETRIES} attempts.`, error);
        }
        return false;
      }

      await delay(RETRY_DELAY * attempt);
    }
  }

  return false;
}

function resolveRegistry(type: WorkletType): WorkletRegistry | undefined {
  if (typeof CSS === 'undefined') {
    return undefined;
  }

  const namespace = CSS as unknown as {
    paintWorklet?: WorkletRegistry;
    animationWorklet?: WorkletRegistry;
    layoutWorklet?: WorkletRegistry;
  };

  switch (type) {
    case 'paint':
      return namespace.paintWorklet;
    case 'animation':
      return namespace.animationWorklet;
    case 'layout':
      return namespace.layoutWorklet;
    default:
      return undefined;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Verifica suporte para worklets baseado em detecção de features
 */
function checkRealWorkletSupport(type: WorkletType): boolean {
  if (typeof CSS === 'undefined') return false;
  
  switch (type) {
    case 'paint':
      return 'paintWorklet' in CSS;
    case 'animation':
      return 'animationWorklet' in CSS;
    case 'layout':
      return 'layoutWorklet' in CSS;
    default:
      return false;
  }
}

/**
 * Carrega fallbacks CSS para worklets não suportados
 */
async function loadWorkletFallbacks(modules: WorkletModuleConfig[], type: WorkletType): Promise<void> {
  for (const module of modules) {
    await loadWorkletFallback(module, type);
  }
}

/**
 * Carrega fallback individual para um worklet
 */
async function loadWorkletFallback(module: WorkletModuleConfig, type: WorkletType): Promise<void> {
  const fallbackName = module.name || 'unknown';
  
  switch (type) {
    case 'paint':
      await loadPaintWorkletFallback(fallbackName);
      break;
    case 'animation':
      await loadAnimationWorkletFallback(fallbackName);
      break;
    case 'layout':
      await loadLayoutWorkletFallback(fallbackName);
      break;
  }
}

/**
 * Fallbacks para paint worklets usando CSS puro
 */
async function loadPaintWorkletFallback(name: string): Promise<void> {
  const fallbackCSS = generatePaintFallbackCSS(name);
  if (fallbackCSS) {
    injectFallbackCSS(fallbackCSS, `paint-fallback-${name}`);
  }
}

/**
 * Fallbacks para animation worklets usando CSS animations
 */
async function loadAnimationWorkletFallback(name: string): Promise<void> {
  const fallbackCSS = generateAnimationFallbackCSS(name);
  if (fallbackCSS) {
    injectFallbackCSS(fallbackCSS, `animation-fallback-${name}`);
  }
}

/**
 * Fallbacks para layout worklets usando CSS Grid/Flexbox
 */
async function loadLayoutWorkletFallback(name: string): Promise<void> {
  const fallbackCSS = generateLayoutFallbackCSS(name);
  if (fallbackCSS) {
    injectFallbackCSS(fallbackCSS, `layout-fallback-${name}`);
  }
}

/**
 * Gera CSS fallback para paint worklets comuns
 */
function generatePaintFallbackCSS(name: string): string | null {
  switch (name) {
    case 'ripple':
      return `
        .paint-ripple-fallback {
          background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
        }
      `;
    
    case 'wave':
      return `
        .paint-wave-fallback {
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(0,0,0,0.1) 10px,
            rgba(0,0,0,0.1) 20px
          );
        }
      `;
    
    case 'noise':
      return `
        .paint-noise-fallback {
          background: conic-gradient(from 0deg, #f0f0f0, #e0e0e0, #f0f0f0);
        }
      `;
    
    default:
      return `
        .paint-${name}-fallback {
          background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
        }
      `;
  }
}

/**
 * Gera CSS fallback para animation worklets
 */
function generateAnimationFallbackCSS(name: string): string | null {
  switch (name) {
    case 'spring':
      return `
        .animation-spring-fallback {
          transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `;
    
    case 'parallax':
      return `
        .animation-parallax-fallback {
          transform: translateZ(0);
          will-change: transform;
        }
      `;
    
    default:
      return `
        .animation-${name}-fallback {
          transition: all 0.3s ease;
        }
      `;
  }
}

/**
 * Gera CSS fallback para layout worklets
 */
function generateLayoutFallbackCSS(name: string): string | null {
  switch (name) {
    case 'masonry':
      return `
        .layout-masonry-fallback {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }
      `;
    
    case 'isotope':
      return `
        .layout-isotope-fallback {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }
      `;
    
    default:
      return `
        .layout-${name}-fallback {
          display: grid;
          gap: 1rem;
        }
      `;
  }
}

/**
 * Injeta CSS fallback no documento
 */
function injectFallbackCSS(css: string, id: string): void {
  if (typeof document === 'undefined') return;
  
  // Remove CSS anterior se existir
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }
  
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
  
  console.info(`[Worklets] Loaded fallback CSS for ${id}`);
}

