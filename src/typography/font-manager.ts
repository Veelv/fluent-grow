/**
 * Font Manager
 * ------------
 * Provides programmatic font registration and integrates with typography
 * design tokens to keep the document font-face list in sync.
 */

import type { TokenGroup } from '../core/config';
import { watchTokens } from '../core/token-manager';

export type FontDisplayStrategy = 'auto' | 'block' | 'swap' | 'fallback' | 'optional';

export interface FontVariantDescriptor {
  src: string;
  weight?: string | number;
  style?: 'normal' | 'italic' | 'oblique';
  display?: FontDisplayStrategy;
  unicodeRange?: string;
  stretch?: string;
  variationAxes?: Record<string, number>; // e.g., { wght: 600, wdth: 100, opsz: 14 }
}

export interface FontFamilyConfig {
  family: string;
  fallbacks?: string[];
  variants: FontVariantDescriptor[];
}

const registry = new Map<string, FontFamilyConfig>();
const loadCache = new Map<string, Promise<void>>();
let tokensUnsubscribe: (() => void) | undefined;
let initialised = false;

export class FontManager {
  constructor(private documentRef: Document | undefined = typeof document !== 'undefined' ? document : undefined) {
    if (!initialised) {
      this.attachTokenListener();
      initialised = true;
    }
  }

  /**
   * Registers a font family configuration. If executed in the browser, this
   * method loads all declared variants and adds them to `document.fonts`.
   */
  async register(config: FontFamilyConfig): Promise<void> {
    registry.set(config.family, config);
    if (!this.documentRef) {
      return;
    }
    await Promise.all(config.variants.map((variant) => this.loadVariant(config.family, variant)));
  }

  /**
   * Reveals all registered families (including those sourced from tokens).
   */
  listFamilies(): FontFamilyConfig[] {
    return Array.from(registry.values());
  }

  /**
   * Loads a single font variant. Calls are deduplicated via an internal cache.
   */
  async loadVariant(family: string, variant: FontVariantDescriptor): Promise<void> {
    if (!this.documentRef) {
      return;
    }

    const cacheKey = `${family}-${variant.weight ?? '400'}-${variant.style ?? 'normal'}-${variant.src}`;
    if (loadCache.has(cacheKey)) {
      await loadCache.get(cacheKey);
      return;
    }

    const promise = this.createFontFace(family, variant)
      .then((face) => {
        if (this.documentRef) {
          // Apply variable font axes when provided
          if (variant.variationAxes && typeof (face as any).variationSettings !== 'undefined') {
            const entries = Object.entries(variant.variationAxes)
              .map(([axis, value]) => `'${axis}' ${value}`)
              .join(', ');
            try {
              (face as any).variationSettings = entries;
            } catch {
              // ignore if unsupported
            }
          }
          this.documentRef.fonts.add(face);
        }
      })
      .catch((error) => {
        if (typeof console !== 'undefined') {
          console.warn(`[FontManager] Failed to load font variant for "${family}"`, error);
        }
      });

    loadCache.set(cacheKey, promise);
    await promise;
  }

  /**
   * Derives a CSS `font-family` declaration combining the primary family and
   * any declared fallbacks.
   */
  static toFontStack(config: FontFamilyConfig): string {
    const fallbacks = config.fallbacks?.length ? config.fallbacks.join(', ') : 'system-ui, -apple-system, BlinkMacSystemFont';
    return `'${config.family}', ${fallbacks}`;
  }

  private createFontFace(family: string, variant: FontVariantDescriptor): Promise<FontFace> {
    if (!this.documentRef) {
      return Promise.reject(new Error('FontFace construction requires a document.'));
    }

    const options: FontFaceDescriptors = {};
    if (variant.weight !== undefined) {
      options.weight = typeof variant.weight === 'number' ? String(variant.weight) : variant.weight;
    }
    if (variant.style !== undefined) {
      options.style = variant.style;
    }
    if (variant.display !== undefined) {
      options.display = variant.display;
    }
    if (variant.unicodeRange !== undefined) {
      options.unicodeRange = variant.unicodeRange;
    }
    if (variant.stretch !== undefined) {
      options.stretch = variant.stretch;
    }

    const face = new FontFace(family, `url(${variant.src})`, options);
    return face.load();
  }

  private attachTokenListener(): void {
    tokensUnsubscribe = watchTokens((tokens) => {
      const typographyTokens = tokens.typography as TokenGroup | undefined;
      const fontTokens = typographyTokens?.fonts as TokenGroup | undefined;
      if (!fontTokens) {
        return;
      }
      Object.entries(fontTokens).forEach(([familyName, token]) => {
        const descriptor = parseFontToken(familyName, token as TokenGroup | string | number | undefined);
        if (descriptor) {
          this.register(descriptor).catch(() => undefined);
        }
      });
    });
  }
}

export function detachFontTokenListener(): void {
  tokensUnsubscribe?.();
  tokensUnsubscribe = undefined;
  initialised = false;
}

function parseFontToken(name: string, token: TokenGroup | string | number | undefined): FontFamilyConfig | undefined {
  if (!token) {
    return undefined;
  }

  if (typeof token === 'string') {
    return {
      family: name,
      variants: [{ src: token }]
    };
  }

  if (typeof token === 'number') {
    return {
      family: name,
      variants: [{ src: String(token) }]
    };
  }

  const group = token as TokenGroup;
  const fallbacksToken = group.fallbacks;
  const fallbacks = Array.isArray(fallbacksToken)
    ? fallbacksToken.map((fallback) => String(fallback))
    : typeof fallbacksToken === 'string'
      ? fallbacksToken.split(',').map((fallback) => fallback.trim())
      : undefined;

  const variantsToken = group.variants as TokenGroup | undefined;
  const sources: FontVariantDescriptor[] = [];

  if (variantsToken) {
    Object.values(variantsToken).forEach((value) => {
      if (!value || typeof value !== 'object') {
        return;
      }
      const variantGroup = value as TokenGroup;
      const src = variantGroup.src as string | undefined;
      if (!src) {
        return;
      }
      const descriptor: FontVariantDescriptor = { src };
      const weight = variantGroup.weight as string | number | undefined;
      if (weight !== undefined) {
        descriptor.weight = weight;
      }
      const style = variantGroup.style as 'normal' | 'italic' | 'oblique' | undefined;
      if (style !== undefined) {
        descriptor.style = style;
      }
      const unicode = (variantGroup['unicode-range'] ?? variantGroup.unicodeRange) as string | undefined;
      if (unicode !== undefined) {
        descriptor.unicodeRange = unicode;
      }
      const display = variantGroup.display as FontDisplayStrategy | undefined;
      if (display !== undefined) {
        descriptor.display = display;
      }
      const stretch = variantGroup.stretch as string | undefined;
      if (stretch !== undefined) {
        descriptor.stretch = stretch;
      }
      sources.push(descriptor);
    });
  }

  if (!sources.length) {
    const src = (group.src as string | undefined) ?? undefined;
    if (!src) {
      return undefined;
    }
    const descriptor: FontVariantDescriptor = { src };
    const weight = group.weight as string | number | undefined;
    if (weight !== undefined) {
      descriptor.weight = weight;
    }
    const style = group.style as 'normal' | 'italic' | 'oblique' | undefined;
    if (style !== undefined) {
      descriptor.style = style;
    }
    const unicode = (group['unicode-range'] ?? group.unicodeRange) as string | undefined;
    if (unicode !== undefined) {
      descriptor.unicodeRange = unicode;
    }
    const display = group.display as FontDisplayStrategy | undefined;
    if (display !== undefined) {
      descriptor.display = display;
    }
    const stretch = group.stretch as string | undefined;
    if (stretch !== undefined) {
      descriptor.stretch = stretch;
    }
    const axesToken = group.axes as TokenGroup | undefined;
    if (axesToken && typeof axesToken === 'object') {
      const axes: Record<string, number> = {};
      Object.entries(axesToken).forEach(([axis, val]) => {
        const num = Number(val as unknown);
        if (Number.isFinite(num)) {
          axes[axis] = num;
        }
      });
      if (Object.keys(axes).length) {
        descriptor.variationAxes = axes;
      }
    }
    sources.push(descriptor);
  }

  const config: FontFamilyConfig = {
    family: name,
    variants: sources
  };

  if (fallbacks && fallbacks.length) {
    config.fallbacks = fallbacks;
  }

  return config;
}

