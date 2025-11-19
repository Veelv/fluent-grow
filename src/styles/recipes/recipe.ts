/**
 * Fluent Grow - Recipe API
 * ------------------------
 * Thin wrapper around the core RecipeEngine to provide a developer-friendly
 * interface for defining recipes with base/variants/compound/selectors and
 * emitting constructable stylesheets for zero-runtime usage.
 */

import type { CSSProperties } from '../../utils/css-engine';
import { createStyleSheet } from '../../utils/css-engine';
import {
  RecipeEngine,
  type FluentRecipe,
  type VariantValue,
  type VariantDefinitions,
  type CompoundVariant,
  type RecipeSelectors
} from '../../core/recipe-engine';
import { mapByBreakpoints } from '../../utils/responsive';

export interface RecipeDefinition<Variants extends Record<string, VariantValue>> {
  base: CSSProperties;
  variants?: VariantDefinitions<Variants>;
  compoundVariants?: Array<CompoundVariant<Variants>>;
  selectors?: RecipeSelectors;
  tokens?: CSSProperties;
}

export interface CompiledRecipe {
  stylesheet: CSSStyleSheet;
  selectors: RecipeSelectors;
}

export function createRecipe<Variants extends Record<string, VariantValue>>(
  definition: RecipeDefinition<Variants>
) {
  const recipe: FluentRecipe<Variants> = definition;

  return {
    compute(variants: Partial<Variants> = {}) {
      return RecipeEngine.compute(recipe, variants);
    },

    compile(variants: Partial<Variants> = {}, hostSelector = ':host'): CompiledRecipe {
      const computed = RecipeEngine.compute(recipe, variants);
      const styleMap = RecipeEngine.toStyleMap(computed, hostSelector);
      const stylesheet = createStyleSheet(styleMap);
      return { stylesheet, selectors: styleMap };
    },

    withResponsiveSelectors(responsive: Record<string, RecipeSelectors>) {
      const expanded: RecipeSelectors = { ...(definition.selectors ?? {}) };
      const queryMap = mapByBreakpoints(responsive);
      Object.entries(queryMap).forEach(([query, selectors]) => {
        // nest selectors under @media query using a flattened key pattern
        Object.entries(selectors).forEach(([selector, styles]) => {
          expanded[`@media ${query} { ${selector} }`] = styles;
        });
      });
      return createRecipe<Variants>({ ...definition, selectors: expanded });
    },

    /**
     * Adds fallbacks using @supports wrappers, without mutating the original base.
     * - :has() -> provide alternative selectors under @supports not (selector(:has(*)))
     * - color-mix/oklch -> provide host-level fallback styles under @supports not (color: color-mix(...))
     */
    withFallbacks(options: {
      hasFallbacks?: RecipeSelectors;
      colorMixHostFallback?: CSSProperties;
    }) {
      const expanded: RecipeSelectors = { ...(definition.selectors ?? {}) };

      if (options.hasFallbacks) {
        Object.entries(options.hasFallbacks).forEach(([selector, styles]) => {
          expanded[`@supports not (selector(:has(*))) { ${selector} }`] = styles;
        });
      }

      if (options.colorMixHostFallback && Object.keys(options.colorMixHostFallback).length > 0) {
        // Wrap :host fallback for color-mix/oklch
        expanded[`@supports not (color: color-mix(in srgb, black 50%, white)) { :host }`] =
          options.colorMixHostFallback;
      }

      return createRecipe<Variants>({ ...definition, selectors: expanded });
    }
  };
}
