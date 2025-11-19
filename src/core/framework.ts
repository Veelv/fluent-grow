import { registerComponent, resolveComponent } from './component-registry';
import type { ComponentRegistration } from './component-registry';
import { resolveConfig, type FluentConfigResult, type FrameworkConfig, type FrameworkTokens } from './config';
import { mergeTokenGroups, applyTokens } from './token-manager';
import { loadWorklets } from './worklet-loader';
import type { ThemeDefinition } from './theme-manager';
import { ThemeManager } from './theme-manager';
import { ColorManager } from '../colors';
import { registerFluentPalettes } from '../colors/presets';
import { VersionManager } from './version-manager';
import { FeatureLayerManager } from './feature-layers';
import { AnalyticsManager, type AnalyticsConfig } from './analytics';
import { PolyfillManager } from './polyfill-manager';
import { FeatureFallbackManager } from './feature-fallbacks';
import { LegacySupportManager } from './legacy-support';

export type FluentPlugin = (framework: FluentFramework) => void | Promise<void>;

export interface FrameworkHooks {
  beforeInit?: Array<() => void | Promise<void>>;
  afterInit?: Array<() => void | Promise<void>>;
}

/**
 * Main entry point for the Fluent Grow runtime. Orchestrates configuration,
 * component registration, worklet loading and theming.
 */
export class FluentFramework {
  readonly config: FluentConfigResult;

  private initialised = false;
  private plugins: FluentPlugin[] = [];
  private hooks: FrameworkHooks = { beforeInit: [], afterInit: [] };
  private themeManager = new ThemeManager();
  private versionManager = VersionManager.getInstance();
  private featureManager = new FeatureLayerManager();
  private analyticsManager?: AnalyticsManager;
  private polyfillManager = new PolyfillManager();
  private fallbackManager = new FeatureFallbackManager();
  private legacyManager = new LegacySupportManager();
  private runtimeTokens: FrameworkTokens;

  constructor(config?: FrameworkConfig & { analytics?: AnalyticsConfig | boolean }) {
    this.config = resolveConfig(config);
    this.runtimeTokens = { ...this.config.tokens };
    
    if (config?.analytics) {
      if (typeof config.analytics === 'object') {
        this.analyticsManager = new AnalyticsManager(config.analytics);
      } else {
        this.analyticsManager = new AnalyticsManager();
      }
    }
  }

  /** Registers a plugin that will be executed during initialisation. */
  use(plugin: FluentPlugin): this {
    this.plugins.push(plugin);
    return this;
  }

  /** Adds a lifecycle hook (beforeInit/afterInit). */
  hook<T extends keyof FrameworkHooks>(type: T, callback: NonNullable<FrameworkHooks[T]>[number]): this {
    (this.hooks[type] ??= []).push(callback as never);
    return this;
  }

  /** Registers a theme definition with the internal theme manager. */
  registerTheme(theme: ThemeDefinition): this {
    this.themeManager.register(theme);
    return this;
  }

  /** Bootstraps the framework if it has not been initialised already. */
  async initialise(): Promise<void> {
    if (this.initialised) {
      return;
    }

    const startTime = performance.now();
    this.initialised = true;

    // Load polyfills first (including legacy browser support) unless disabled
    if (!this.config.disablePolyfills) {
      await this.polyfillManager.loadRequiredPolyfills();
    }
    
    // Inject legacy browser support if needed
    if (this.legacyManager.isLegacyBrowser()) {
      this.legacyManager.injectLegacySupport();
    }
    
    await this.runHooks('beforeInit');
    await this.executePlugins();

    if (typeof window !== 'undefined') {
      this.applyTokens(this.config.tokens);
      // Register and apply default Fluent palettes to expose --fluent-color-*-* variables
      try {
        const colorManager = new ColorManager();
        registerFluentPalettes(colorManager, true, 'fluent');
      } catch (error) {
        if (typeof console !== 'undefined') {
          console.warn('[FluentFramework] Failed to register default color palettes', error);
        }
      }
      await Promise.all([
        this.registerConfiguredComponents(),
        loadWorklets(this.config.worklets.paint, 'paint'),
        loadWorklets(this.config.worklets.animation, 'animation'),
        loadWorklets(this.config.worklets.layout, 'layout')
      ]);
    }

    await this.runHooks('afterInit');
    
    const initTime = performance.now() - startTime;
    this.analyticsManager?.trackPerformance('initTime', initTime);
    
    console.info(this.versionManager.getCompatibilityReport());
    console.info(`[FluentFramework] Initialized in ${initTime.toFixed(2)}ms`);
  }

  /** Applies tokens to the document root. */
  applyTokens(tokens: FrameworkTokens = this.config.tokens): void {
    if (typeof document === 'undefined') {
      return;
    }
    this.runtimeTokens = tokens;
    applyTokens(this.runtimeTokens);
  }

  /** Merges new tokens into the existing graph and reapplies them. */
  updateTokens(partialTokens: FrameworkTokens): void {
    this.runtimeTokens = mergeTokenGroups(this.runtimeTokens, partialTokens);
    this.applyTokens(this.runtimeTokens);
  }

  getTokens(): FrameworkTokens {
    return { ...this.runtimeTokens };
  }

  setTokens(tokens: FrameworkTokens): void {
    this.runtimeTokens = { ...tokens };
    this.applyTokens(this.runtimeTokens);
  }

  async registerComponents(...components: ComponentRegistration[]): Promise<void> {
    await Promise.all(components.map((component) => registerComponent(component)));
    this.analyticsManager?.trackPerformance('componentRegistrations', components.length);
    
    components.forEach(comp => {
      this.analyticsManager?.trackComponentUsage(comp.tag);
    });
  }

  /** Alias for registerComponents to match test expectations */
  registerComponent = this.registerComponents;

  async ensureComponent(tag: string): Promise<CustomElementConstructor | undefined> {
    return resolveComponent(tag);
  }

  applyTheme(name: string): void {
    this.themeManager.apply(name);
  }

  /** Get browser compatibility information */
  getCompatibilityInfo() {
    return {
      version: this.versionManager.getVersionInfo(),
      support: this.versionManager.getBrowserSupport(),
      enabledFeatures: this.featureManager.getEnabledFeatures(),
      loadedPolyfills: this.polyfillManager.getLoadedPolyfills(),
      fallbacks: this.fallbackManager.getFeatureReport()
    };
  }

  /** Check if a specific feature is available */
  isFeatureAvailable(feature: string): boolean {
    return this.featureManager.isFeatureAvailable(feature);
  }

  /** Get performance and usage metrics */
  getMetrics() {
    return {
      performance: this.analyticsManager?.getMetrics(),
      usage: this.analyticsManager?.getUsage()
    };
  }

  /** Manually track feature usage */
  trackFeature(feature: string): void {
    this.analyticsManager?.trackFeatureUsage(feature);
  }

  /** Load a polyfill conditionally */
  async loadPolyfill(feature: string): Promise<boolean> {
    return this.polyfillManager.loadConditionalPolyfill(feature);
  }

  private async registerConfiguredComponents(): Promise<void> {
    if (!this.config.autoRegisterComponents || !this.config.components.length) {
      return;
    }

    await this.registerComponents(...this.config.components);
  }

  private async executePlugins(): Promise<void> {
    for (const plugin of this.plugins) {
      await plugin(this);
    }
  }

  private async runHooks(type: keyof FrameworkHooks): Promise<void> {
    const hooks = this.hooks[type];
    if (!hooks?.length) {
      return;
    }

    for (const hook of hooks) {
      await hook();
    }
  }

  /** Cleanup resources when framework is destroyed */
  destroy(): void {
    this.analyticsManager?.destroy();
  }
}

