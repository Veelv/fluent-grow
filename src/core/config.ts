import type { ComponentRegistration } from './component-registry';

/**
 * Primitive value accepted inside any token map.
 */
export type TokenValue = string | number;

/**
 * Recursive structure describing token groups (colors, spacing, etc.).
 */
export interface TokenGroup {
  [token: string]: TokenValue | TokenGroup;
}

/**
 * Public token contract. The index signature allows authors to define custom
 * buckets without losing type-safety in the remainder of the framework.
 */
export interface FrameworkTokens {
  colors?: TokenGroup;
  spacing?: TokenGroup;
  typography?: TokenGroup;
  motion?: TokenGroup;
  shadows?: TokenGroup;
  radii?: TokenGroup;
  zIndex?: TokenGroup;
  layers?: TokenGroup;
  [group: string]: TokenGroup | undefined;
}

/**
 * Metadata describing a single Houdini worklet module.
 */
export interface WorkletModuleConfig {
  /** URL to the module entry file. */
  url: string;
  /** Optional friendly name that will surface in diagnostics. */
  name?: string;
  /** Predicate executed before attempting to load the module. */
  when?: () => boolean;
}

/**
 * Grouping of worklet modules by family.
 */
export interface WorkletConfig {
  paint?: WorkletModuleConfig[];
  animation?: WorkletModuleConfig[];
  layout?: WorkletModuleConfig[];
}

/**
 * Author-facing configuration surface.
 */
export interface FrameworkConfig {
  tokens?: FrameworkTokens;
  components?: Array<ComponentRegistration>;
  worklets?: WorkletConfig;
  autoRegisterComponents?: boolean;
  disablePolyfills?: boolean;
}

export type PartialFrameworkConfig = DeepPartial<FrameworkConfig>;

/**
 * Fully resolved configuration consumed by the runtime.
 */
export interface FluentConfigResult extends FrameworkConfig {
  tokens: FrameworkTokens;
  components: ComponentRegistration[];
  worklets: Required<WorkletConfig>;
  autoRegisterComponents: boolean;
  disablePolyfills: boolean;
}

// ---------------------------------------------------------------------------
// Deep utility types
// ---------------------------------------------------------------------------

type Primitive = string | number | boolean | null | undefined;

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Primitive
    ? T[K]
    : T[K] extends Array<infer U>
      ? Array<DeepPartial<U>>
      : DeepPartial<T[K]>;
};

// ---------------------------------------------------------------------------
// Defaults & immutable baseline
// ---------------------------------------------------------------------------

const DEFAULT_CONFIG: Readonly<FluentConfigResult> = Object.freeze({
  tokens: {},
  components: [],
  worklets: {
    paint: [],
    animation: [],
    layout: []
  },
  autoRegisterComponents: true,
  disablePolyfills: false
});

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Creates a fully resolved configuration object. User supplied configuration is
 * deeply merged with the defaults, validated, then frozen to prevent accidental
 * mutations during runtime.
 */
export function defineConfig(config: PartialFrameworkConfig = {}): FluentConfigResult {
  const merged = mergeDeep(structuredClone(DEFAULT_CONFIG), config) as FluentConfigResult;

  merged.tokens = merged.tokens ?? {};
  merged.worklets = normaliseWorklets(merged.worklets);
  merged.components = normaliseComponents(merged.components);
  merged.autoRegisterComponents = merged.autoRegisterComponents ?? true;
  merged.disablePolyfills = merged.disablePolyfills ?? false;

  validateConfig(merged);

  return Object.freeze(merged);
}

export function resolveConfig(config?: FrameworkConfig | PartialFrameworkConfig): FluentConfigResult {
  return config ? defineConfig(config) : defineConfig();
}

// ---------------------------------------------------------------------------
// Normalisation helpers
// ---------------------------------------------------------------------------

function normaliseWorklets(worklets: WorkletConfig | undefined): Required<WorkletConfig> {
  return {
    paint: [...(worklets?.paint ?? [])],
    animation: [...(worklets?.animation ?? [])],
    layout: [...(worklets?.layout ?? [])]
  };
}

function normaliseComponents(components: Array<ComponentRegistration> | undefined): ComponentRegistration[] {
  if (!components?.length) {
    return [];
  }

  return components.map((component) => ({
    eager: component.eager ?? true,
    ...component,
    tag: component.tag.toLowerCase()
  }));
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateConfig(config: FluentConfigResult): void {
  const seenTags = new Set<string>();

  config.components.forEach((registration) => {
    if (!registration.tag) {
      throw new Error('Component registration is missing a "tag" property.');
    }

    if (seenTags.has(registration.tag)) {
      throw new Error(`Component tag "${registration.tag}" is registered multiple times.`);
    }

    seenTags.add(registration.tag);
  });
}

// ---------------------------------------------------------------------------
// Deep merge utility
// ---------------------------------------------------------------------------

function mergeDeep<T>(target: T, source: DeepPartial<T>): T {
  if (source === undefined) {
    return target;
  }

  if (Array.isArray(source)) {
    if (Array.isArray(target)) {
      return [...target, ...source] as unknown as T;
    }
    return [...source] as unknown as T;
  }

  if (Array.isArray(target)) {
    return [...target] as unknown as T;
  }

  if (!isObject(target) || !isObject(source)) {
    return source as T;
  }

  const output: Record<string, unknown> = { ...(target as Record<string, unknown>) };

  Object.entries(source).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    const existing = output[key];

    if (isObject(existing) && isObject(value)) {
      output[key] = mergeDeep(existing, value as DeepPartial<unknown>);
      return;
    }

    if (Array.isArray(existing) && Array.isArray(value)) {
      output[key] = [...existing, ...value];
      return;
    }

    output[key] = value as unknown;
  });

  return output as T;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

