import type { CSSProperties } from '../utils/css-engine';

/**
 * Primitive variant value supported by the recipe system.
 */
export type VariantValue = string | number | boolean | null | undefined;

export type VariantDefinitions<Variants extends Record<string, VariantValue>> = {
  [VariantKey in keyof Variants]?: Record<string, CSSProperties>;
};

export interface CompoundVariant<Variants extends Record<string, VariantValue>> {
  when: Partial<Record<keyof Variants, string | number | boolean>>;
  styles: CSSProperties;
}

export interface RecipeSelectors {
  [selector: string]: CSSProperties;
}

export interface FluentRecipe<Variants extends Record<string, VariantValue> = Record<string, VariantValue>> {
  base: CSSProperties;
  variants?: VariantDefinitions<Variants>;
  compoundVariants?: Array<CompoundVariant<Variants>>;
  selectors?: RecipeSelectors;
  tokens?: CSSProperties;
}

export interface ComputedRecipe {
  host: CSSProperties;
  selectors: RecipeSelectors;
}

/**
 * Responsible for mapping a recipe definition + runtime variants into a
 * concrete CSS object. The implementation is intentionally allocation-light so
 * that we can execute it for every host update without blowing budgets.
 */
export class RecipeEngine {
  static compute<Variants extends Record<string, VariantValue>>(
    recipe: FluentRecipe<Variants>,
    variants: Partial<Variants> = {}
  ): ComputedRecipe {
    const hostStyles: CSSProperties = { ...recipe.base };
    const selectorStyles: RecipeSelectors = { ...(recipe.selectors ?? {}) };

    if (recipe.variants) {
      for (const [key, value] of Object.entries(variants)) {
        if (value === undefined || value === null) {
          continue;
        }

        const variantGroup = recipe.variants[key as keyof Variants];
        if (!variantGroup) {
          continue;
        }

        const normalised = normaliseVariantValue(value);
        const variantStyles = variantGroup[normalised];
        if (variantStyles) {
          Object.assign(hostStyles, variantStyles);
        }
      }
    }

    if (recipe.compoundVariants?.length) {
      for (const compound of recipe.compoundVariants) {
        const matches = Object.entries(compound.when).every(([variantName, expected]) => {
          const provided = variants[variantName as keyof Variants];
          return normaliseVariantValue(provided) === normaliseVariantValue(expected);
        });

        if (matches) {
          Object.assign(hostStyles, compound.styles);
        }
      }
    }

    if (recipe.tokens) {
      Object.entries(recipe.tokens).forEach(([name, value]) => {
        if (value !== undefined) {
          hostStyles[`--${name}`] = value;
        }
      });
    }

    return {
      host: hostStyles,
      selectors: selectorStyles
    };
  }

  static toStyleMap(computed: ComputedRecipe, hostSelector = ':host'): RecipeSelectors {
    return {
      [hostSelector]: computed.host,
      ...computed.selectors
    };
  }
}

function normaliseVariantValue(value: VariantValue): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  return String(value);
}

