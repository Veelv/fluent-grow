import type { ThemeDefinition } from '../core/theme-manager'
import { ColorManager } from '../colors'
import { FLUENT_PALETTES, createFluentTheme } from '../colors/presets'

export class AdvancedThemeManager {
  private themes = new Map<string, ThemeDefinition>()
  private colorManager = new ColorManager()

  constructor() {
    // Registrar as paletas fluent por padrão
    Object.entries(FLUENT_PALETTES).forEach(([name, definition]) => {
      this.colorManager.registerPalette(name, definition)
    })
  }

  static readonly FLUENT_LIGHT: ThemeDefinition = {
    name: 'fluent-light',
    tokens: {
      // Usando os tokens já definidos no sistema
      colors: {},
      typography: {},
      spacing: {},
      shadows: {},
      radii: {}
    }
  }

  static readonly FLUENT_DARK: ThemeDefinition = {
    name: 'fluent-dark',
    tokens: {
      // Usando os tokens já definidos no sistema
      colors: {},
      typography: {},
      spacing: {},
      shadows: {},
      radii: {}
    }
  }

  registerTheme(theme: ThemeDefinition): this {
    this.themes.set(theme.name, theme);
    return this;
  }

  applyTheme(name: string, root: HTMLElement = document.documentElement): void {
    // Aplicar tema de cores usando o sistema existente
    const themeName = name === 'fluent-dark' ? 'fluent-dark' : 'fluent-light';
    const theme = createFluentTheme(themeName);
    
    // Registrar e aplicar o tema de cores
    this.colorManager.registerTheme(theme);
    this.colorManager.applyTheme(themeName, root);
    
    // Aplicar outros tokens do tema
    const themeConfig = this.themes.get(name) || AdvancedThemeManager.FLUENT_LIGHT;
    if (themeConfig.tokens) {
      Object.entries(themeConfig.tokens).forEach(([key, value]) => {
        if (typeof value === 'string') {
          root.style.setProperty(`--fluent-${key}`, value);
        } else if (typeof value === 'object') {
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (typeof subValue === 'string' || typeof subValue === 'number') {
              root.style.setProperty(`--fluent-${key}-${subKey}`, String(subValue));
            }
          });
        }
      });
    }

    root.setAttribute('data-theme', name);
  }

  enableAutoTheme(): void {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateTheme = () => {
      const theme = mediaQuery.matches ? 'fluent-dark' : 'fluent-light';
      this.applyTheme(theme);
    };

    updateTheme();
    mediaQuery.addEventListener('change', updateTheme);
  }

  transitionToTheme(name: string, duration = '300ms'): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.style.transition = `all ${duration} ease`;
    this.applyTheme(name);

    setTimeout(() => {
      root.style.removeProperty('transition');
    }, parseInt(duration));
  }
  
  /**
   * Apply a default theme if none is currently applied
   */
  applyDefaultTheme(): void {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme');
    
    // Apply default theme only if no theme is currently applied
    if (!currentTheme || !this.themes.has(currentTheme)) {
      this.applyTheme('fluent-light');
    }
  }
}

export const advancedThemeManager = new AdvancedThemeManager();

// Registrar os temas padrão
advancedThemeManager.registerTheme(AdvancedThemeManager.FLUENT_LIGHT);
advancedThemeManager.registerTheme(AdvancedThemeManager.FLUENT_DARK);

// Apply default theme on module load to ensure components have styling
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    advancedThemeManager.applyDefaultTheme();
  }, 0);
}