

export interface AdvancedThemeConfig {
  name: string;
  colors: Record<string, string>;
  typography: {
    fontFamily: Record<string, string>;
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}

export class AdvancedThemeManager {
  private themes = new Map<string, AdvancedThemeConfig>();

  static readonly FLUENT_LIGHT: AdvancedThemeConfig = {
    name: 'fluent-light',
    colors: {
      'primary-500': 'oklch(60% 0.15 240)',
      'primary-600': 'oklch(50% 0.16 240)',
      'neutral-100': 'oklch(95% 0.01 240)',
      'neutral-900': 'oklch(10% 0.01 240)',
      'success-500': 'oklch(65% 0.15 140)',
      'warning-500': 'oklch(75% 0.15 60)',
      'error-500': 'oklch(55% 0.20 20)'
    },
    typography: {
      fontFamily: {
        'ui': 'system-ui, -apple-system, sans-serif',
        'display': 'Inter, system-ui, sans-serif',
        'body': 'Inter, system-ui, sans-serif'
      },
      fontSize: {
        'sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
        'base': 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
        'lg': 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
        'xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)'
      },
      fontWeight: {
        'normal': 400,
        'medium': 500,
        'semibold': 600,
        'bold': 700
      }
    },
    spacing: {
      '1': '0.25rem',
      '2': '0.5rem',
      '4': '1rem',
      '8': '2rem',
      '16': '4rem'
    },
    borderRadius: {
      'sm': '0.25rem',
      'md': '0.5rem',
      'lg': '0.75rem',
      'xl': '1rem'
    },
    shadows: {
      'sm': '0 1px 2px oklch(0% 0 0 / 0.05)',
      'md': '0 4px 6px oklch(0% 0 0 / 0.07)',
      'lg': '0 10px 15px oklch(0% 0 0 / 0.1)',
      'xl': '0 20px 25px oklch(0% 0 0 / 0.1)'
    }
  };

  static readonly FLUENT_DARK: AdvancedThemeConfig = {
    name: 'fluent-dark',
    colors: {
      'primary-500': 'oklch(60% 0.15 240)',
      'primary-600': 'oklch(70% 0.14 240)',
      'neutral-100': 'oklch(15% 0.01 240)',
      'neutral-900': 'oklch(95% 0.01 240)',
      'success-500': 'oklch(70% 0.15 140)',
      'warning-500': 'oklch(80% 0.15 60)',
      'error-500': 'oklch(60% 0.20 20)'
    },
    typography: {
      fontFamily: {
        'ui': 'system-ui, -apple-system, sans-serif',
        'display': 'Inter, system-ui, sans-serif',
        'body': 'Inter, system-ui, sans-serif'
      },
      fontSize: {
        'sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
        'base': 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
        'lg': 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
        'xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)'
      },
      fontWeight: {
        'normal': 400,
        'medium': 500,
        'semibold': 600,
        'bold': 700
      }
    },
    spacing: {
      '1': '0.25rem',
      '2': '0.5rem',
      '4': '1rem',
      '8': '2rem',
      '16': '4rem'
    },
    borderRadius: {
      'sm': '0.25rem',
      'md': '0.5rem',
      'lg': '0.75rem',
      'xl': '1rem'
    },
    shadows: {
      'sm': '0 1px 2px oklch(0% 0 0 / 0.3)',
      'md': '0 4px 6px oklch(0% 0 0 / 0.4)',
      'lg': '0 10px 15px oklch(0% 0 0 / 0.5)',
      'xl': '0 20px 25px oklch(0% 0 0 / 0.5)'
    }
  };

  registerTheme(theme: AdvancedThemeConfig): this {
    this.themes.set(theme.name, theme);
    return this;
  }

  applyTheme(name: string, root: HTMLElement = document.documentElement): void {
    const theme = this.themes.get(name) || AdvancedThemeManager.FLUENT_LIGHT;
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--fluent-color-${key}`, value);
    });

    Object.entries(theme.typography.fontFamily).forEach(([key, value]) => {
      root.style.setProperty(`--fluent-font-family-${key}`, value);
    });

    Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--fluent-font-size-${key}`, value);
    });

    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--fluent-spacing-${key}`, value);
    });

    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--fluent-shadow-${key}`, value);
    });

    root.setAttribute('data-theme', name);
  }

  enableAutoTheme(): void {
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
}

export const advancedThemeManager = new AdvancedThemeManager();
advancedThemeManager.registerTheme(AdvancedThemeManager.FLUENT_LIGHT);
advancedThemeManager.registerTheme(AdvancedThemeManager.FLUENT_DARK);