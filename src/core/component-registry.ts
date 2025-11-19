/**
 * Component registration registry.
 *
 * The registry is responsible for coordinating when and how custom elements are
 * defined.  It supports eager constructors as well as lazy loaders, ensuring
 * we never attempt to define the same tag twice (regardless of SSR or runtime).
 */

export interface ComponentRegistration {
  /** Custom element tag name (will be normalised to lower-case). */
  tag: string;
  /** Optional constructor for eager registration. */
  element?: CustomElementConstructor;
  /**
   * Lazy loader returning a constructor or a module with a default export.  The
   * loader can be used for code splitting or progressive enhancement.
   */
  loader?: () => Promise<CustomElementConstructor | { default: CustomElementConstructor } | void>;
  /** Whether the component should be registered immediately (default: true). */
  eager?: boolean;
  /** Native Custom Elements options (e.g. extends). */
  options?: ElementDefinitionOptions;
}

interface RegistryEntry {
  ctor?: CustomElementConstructor;
  registration: ComponentRegistration;
  state: 'pending' | 'resolved' | 'failed';
  resolveQueue: Array<(ctor: CustomElementConstructor | undefined) => void>;
}

const registry = new Map<string, RegistryEntry>();

/**
 * Determines whether a tag has already been registered (either eagerly or via
 * native customElements registry).
 */
export function hasComponent(tag: string): boolean {
  const normalised = tag.toLowerCase();

  if (registry.has(normalised)) {
    return true;
  }

  if (typeof customElements === 'undefined') {
    return false;
  }

  return Boolean(customElements.get(normalised));
}

/**
 * Returns all tags that have been registered through the registry.  Native
 * customElements definitions that bypassed the registry are not guaranteed to
 * be present.
 */
export function getRegisteredComponents(): string[] {
  return Array.from(registry.keys());
}

/**
 * Registers a component. The operation is idempotent; attempting to register
 * the same tag twice is a no-op unless the next registration attempts to supply
 * a different constructor (in which case an error is thrown).
 */
export async function registerComponent(config: ComponentRegistration): Promise<void> {
  if (!config.tag) {
    throw new Error('Component registration requires a "tag" property.');
  }

  const normalised = config.tag.toLowerCase();
  const existing = registry.get(normalised);

  if (existing) {
    // If the user re-registers the same constructor we silently ignore.
    if (config.element && existing.ctor && config.element !== existing.ctor) {
      throw new Error(`Component tag "${normalised}" is already registered with a different constructor.`);
    }

    return; // Nothing else to do – already registered.
  }

  const entry: RegistryEntry = {
    registration: { ...config, tag: normalised },
    state: 'pending',
    resolveQueue: []
  };

  registry.set(normalised, entry);

  if (config.eager ?? true) {
    await resolveAndDefine(entry);
  }
}

/**
 * Resolves the constructor for the provided registration and ensures the
 * custom element is defined (when run in a browser environment).
 */
export async function resolveComponent(tag: string): Promise<CustomElementConstructor | undefined> {
  const normalised = tag.toLowerCase();
  const entry = registry.get(normalised);

  if (!entry) {
    return undefined;
  }

  if (entry.state === 'resolved') {
    return entry.ctor;
  }

  return new Promise((resolve) => {
    entry.resolveQueue.push(resolve);
    void resolveAndDefine(entry);
  });
}

async function resolveAndDefine(entry: RegistryEntry): Promise<void> {
  if (entry.state === 'resolved' || entry.state === 'failed') {
    return;
  }

  try {
    const ctor = await resolveConstructor(entry.registration);

    if (!ctor) {
      throw new Error(`Component "${entry.registration.tag}" did not return a constructor.`);
    }

    entry.ctor = ctor;
    entry.state = 'resolved';

    if (typeof customElements !== 'undefined' && !customElements.get(entry.registration.tag)) {
      customElements.define(entry.registration.tag, ctor, entry.registration.options);
    }

    entry.resolveQueue.splice(0).forEach((resolve) => resolve(ctor));
  } catch (error) {
    entry.state = 'failed';
    if (typeof console !== 'undefined') {
      console.error(`[FluentFramework] Failed to register component "${entry.registration.tag}":`, error);
    }
    entry.resolveQueue.splice(0).forEach((resolve) => resolve(undefined));
  }
}

async function resolveConstructor(config: ComponentRegistration): Promise<CustomElementConstructor | undefined> {
  if (config.element) {
    return config.element;
  }

  if (!config.loader) {
    return undefined;
  }

  const result = await config.loader();

  if (!result) {
    return undefined;
  }

  if (typeof result === 'function') {
    return result as CustomElementConstructor;
  }

  return (result as { default?: CustomElementConstructor }).default;
}

