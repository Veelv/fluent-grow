import { applyStyles, createStyleSheet } from '../utils/css-engine';
import type { CSSProperties } from '../utils/css-engine';
import { RecipeEngine, type FluentRecipe, type VariantValue } from './recipe-engine';

/**
 * Base class for all Fluent Grow custom elements.
 *
 * Responsibilities:
 * - Attach a shadow root with focus delegation.
 * - Compute styles using the recipe engine whenever attributes change.
 * - Offer lifecycle hooks (render/setup/teardown) to derived classes.
 * - Provide helpers for mapping attributes to recipe variants.
 */
export abstract class FluentComponent<Variants extends Record<string, VariantValue> = Record<string, VariantValue>> extends HTMLElement {
  /** Variant attributes that should be observed for changes. */
  protected static variantAttributes: string[] = [];

  protected static getVariantAttributes(): string[] {
    return this.variantAttributes;
  }

  /** Recipe definition applied to the host element. */
  protected recipe?: FluentRecipe<Variants>;

  /** Shadow root reference (exposed for tests/subclasses). */
  protected shadowRootRef: ShadowRoot;

  #recipeSheet?: CSSStyleSheet;
  #updateQueued = false;

  static get observedAttributes(): string[] {
    return (this as typeof FluentComponent).getVariantAttributes();
  }

  constructor() {
    super();
    this.shadowRootRef = this.attachShadow({ mode: 'open', delegatesFocus: true });
  }

  connectedCallback(): void {
    this.render();
    this.queueStyleUpdate();
    this.setupEventListeners();
  }

  disconnectedCallback(): void {
    this.teardownEventListeners();
  }

  attributeChangedCallback(): void {
    this.queueStyleUpdate();
  }

  /** Derived classes must render their DOM structure. */
  protected abstract render(): void;

  /** Optional hook for wiring event listeners. */
  protected setupEventListeners(): void {
    // noop by default
  }

  /** Optional hook for removing event listeners. */
  protected teardownEventListeners(): void {
    // noop by default
  }

  /**
   * Schedules a style recomputation on the next microtask, batching multiple
   * attribute updates in quick succession.
   */
  protected queueStyleUpdate(): void {
    if (this.#updateQueued) {
      return;
    }

    this.#updateQueued = true;
    queueMicrotask(() => {
      this.#updateQueued = false;
      this.updateStyles();
    });
  }

  /** Computes host + selector styles based on the recipe definition. */
  protected updateStyles(): void {
    if (!this.recipe) {
      return;
    }

    const variants = this.getVariants();
    const computed = RecipeEngine.compute(this.recipe, variants);

    applyStyles(this, computed.host);
    this.syncShadowStyles(RecipeEngine.toStyleMap(computed));
  }

  /** Maps observed attributes to recipe variant values. */
  protected getVariants(): Partial<Variants> {
    const ctor = this.constructor as typeof FluentComponent;
    const attributes = ctor.getVariantAttributes() as Array<keyof Variants>;
    const result: Partial<Variants> = {};

    attributes.forEach((attribute) => {
      if (this.hasAttribute(String(attribute))) {
        const value = this.getAttribute(String(attribute));
        (result as Record<string, VariantValue | undefined>)[String(attribute)] = value ?? true;
      }
    });

    return result;
  }

  /** Allows derived classes to target ::part selectors dynamically. */
  protected setPartStyles(part: string, styles: CSSProperties): void {
    if (!this.recipe) {
      this.recipe = { base: {}, selectors: {} } as FluentRecipe<Variants>;
    }

    if (!this.recipe.selectors) {
      this.recipe.selectors = {};
    }

    this.recipe.selectors[`::part(${part})`] = styles;
    this.queueStyleUpdate();
  }

  private syncShadowStyles(styleMap: Record<string, CSSProperties>): void {
    if (!Object.keys(styleMap).length) {
      return;
    }

    const { ':host': _hostStyles, ...selectors } = styleMap;

    const shadowRoot = this.shadowRootRef as ShadowRoot & { adoptedStyleSheets?: CSSStyleSheet[] };
    if (Array.isArray(shadowRoot.adoptedStyleSheets)) {
      const sheet = createStyleSheet(selectors);
      const retained = shadowRoot.adoptedStyleSheets.filter((candidate) => candidate !== this.#recipeSheet);
      shadowRoot.adoptedStyleSheets = [...retained, sheet];
      this.#recipeSheet = sheet;
      return;
    }

    const existingStyle = this.shadowRootRef.querySelector('style[data-fluent-recipe]') ?? document.createElement('style');
    existingStyle.setAttribute('data-fluent-recipe', '');
    existingStyle.textContent = Object.entries(selectors)
      .map(([selector, declarations]) => {
        const cssBody = Object.entries(declarations)
          .map(([property, value]) => `${property}: ${value};`)
          .join(' ');
        return `${selector} { ${cssBody} }`;
      })
      .join('\n');

    if (!existingStyle.isConnected) {
      this.shadowRootRef.appendChild(existingStyle);
    }
  }
}


