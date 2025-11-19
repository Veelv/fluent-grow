import type { FrameworkTokens } from './config';
import { applyTokens, mergeTokenGroups } from './token-manager';

export interface ThemeDefinition {
  name: string;
  tokens: FrameworkTokens;
  inheritsFrom?: string;
}

export type ThemeChangeListener = (theme: ThemeDefinition) => void;

/**
 * Runtime theme manager.  Handles registration, inheritance and notifies
 * listeners whenever the active theme changes.
 */
export class ThemeManager {
  private themes = new Map<string, ThemeDefinition>();
  private activeTheme?: ThemeDefinition;
  private listeners = new Set<ThemeChangeListener>();

  register(theme: ThemeDefinition): void {
    this.themes.set(theme.name, theme);
  }

  onChange(listener: ThemeChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  apply(name: string): void {
    const resolved = this.resolveTheme(name);
    if (!resolved) {
      throw new Error(`Theme "${name}" is not registered.`);
    }

    const tokens = resolved.tokens;

    if (typeof document !== 'undefined') {
      applyTokens(tokens);
    }

    this.activeTheme = resolved;
    this.notifyListeners(resolved);
  }

  /**
   * Applies a theme to a specific scope (element or selector) and marks it with data-theme.
   * Falls back to setting tokens directly on the element when @scope is unavailable.
   */
  applyScoped(name: string, scope: HTMLElement | string): void {
    const resolved = this.resolveTheme(name);
    if (!resolved) {
      throw new Error(`Theme "${name}" is not registered.`);
    }
    if (typeof document === 'undefined') {
      return;
    }
    const root: HTMLElement | null = typeof scope === 'string' ? document.querySelector(scope) : scope;
    if (!root) {
      throw new Error('Theme scope element not found.');
    }
    root.setAttribute('data-theme', name);
    applyTokens(resolved.tokens, root);
  }

  getActiveTheme(): string | undefined {
    return this.activeTheme?.name;
  }

  private resolveTheme(name: string, visited = new Set<string>()): ThemeDefinition | undefined {
    if (visited.has(name)) {
      throw new Error(`Theme inheritance cycle detected for "${name}".`);
    }

    const theme = this.themes.get(name);
    if (!theme) {
      return undefined;
    }

    if (!theme.inheritsFrom) {
      return theme;
    }

    visited.add(name);
    const parent = this.resolveTheme(theme.inheritsFrom, visited);
    if (!parent) {
      throw new Error(`Theme "${name}" inherits from unknown theme "${theme.inheritsFrom}".`);
    }

    return {
      name: theme.name,
      tokens: mergeTokenGroups(parent.tokens, theme.tokens),
      inheritsFrom: parent.name
    };
  }

  private notifyListeners(theme: ThemeDefinition): void {
    this.listeners.forEach((listener) => {
      try {
        listener(theme);
      } catch (error) {
        if (typeof console !== 'undefined') {
          console.error('[FluentFramework] Theme change listener failed', error);
        }
      }
    });
  }
}

