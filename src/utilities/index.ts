export interface UtilityConfig {
  prefix: string;
  responsive: boolean;
  hover: boolean;
  focus: boolean;
  dark: boolean;
  container: boolean;
}

export class UtilityGenerator {
  private config: UtilityConfig;
  private utilities: Map<string, string> = new Map();

  constructor(config: Partial<UtilityConfig> = {}) {
    this.config = {
      prefix: 'fg-',
      responsive: true,
      hover: true,
      focus: true,
      dark: true,
      container: true,
      ...config
    };
    
    this.generateUtilities();
  }

  private generateUtilities(): void {
    this.generateSpacing();
    this.generateColors();
    this.generateLayout();
    this.generateTypography();
    this.generateEffects();
  }

  private generateSpacing(): void {
    const spaces = {
      '0': '0', 'px': '1px', '0.5': '0.125rem', '1': '0.25rem', '2': '0.5rem',
      '3': '0.75rem', '4': '1rem', '5': '1.25rem', '6': '1.5rem', '8': '2rem',
      '10': '2.5rem', '12': '3rem', '16': '4rem', '20': '5rem', '24': '6rem',
      '32': '8rem', '40': '10rem', '48': '12rem', '56': '14rem', '64': '16rem'
    };

    Object.entries(spaces).forEach(([key, value]) => {
      this.utilities.set(`${this.config.prefix}m-${key}`, `margin: ${value}`);
      this.utilities.set(`${this.config.prefix}p-${key}`, `padding: ${value}`);
      this.utilities.set(`${this.config.prefix}mx-${key}`, `margin-inline: ${value}`);
      this.utilities.set(`${this.config.prefix}px-${key}`, `padding-inline: ${value}`);
    });
  }

  private generateColors(): void {
    const colors = {
      'primary': 'oklch(60% 0.15 240)',
      'secondary': 'oklch(70% 0.12 120)',
      'accent': 'oklch(65% 0.20 300)',
      'success': 'oklch(65% 0.15 140)',
      'warning': 'oklch(75% 0.15 60)',
      'error': 'oklch(55% 0.20 20)'
    };

    const shades = [100, 200, 300, 400, 500, 600, 700, 800, 900];
    
    Object.entries(colors).forEach(([name, baseColor]) => {
      shades.forEach(shade => {
        const lightness = 100 - (shade / 10);
        const color = baseColor.replace(/\d+%/, `${lightness}%`);
        
        this.utilities.set(`${this.config.prefix}text-${name}-${shade}`, `color: ${color}`);
        this.utilities.set(`${this.config.prefix}bg-${name}-${shade}`, `background-color: ${color}`);
      });
    });
  }

  private generateLayout(): void {
    this.utilities.set(`${this.config.prefix}container-size`, 'container-type: size');
    this.utilities.set(`${this.config.prefix}grid-subgrid`, 'grid-template-columns: subgrid');
    this.utilities.set(`${this.config.prefix}anchor-center`, 'position-anchor: center');
  }

  private generateTypography(): void {
    const fluidSizes = {
      'xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
      'sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
      'base': 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
      'lg': 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
      'xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
      '2xl': 'clamp(1.5rem, 1.3rem + 1vw, 1.875rem)'
    };

    Object.entries(fluidSizes).forEach(([size, value]) => {
      this.utilities.set(`${this.config.prefix}text-${size}`, `font-size: ${value}`);
    });
  }

  private generateEffects(): void {
    this.utilities.set(`${this.config.prefix}bg-ripple`, 'background-image: paint(ripple)');
    this.utilities.set(`${this.config.prefix}transition-slide`, 'view-transition-name: slide');
    this.utilities.set(`${this.config.prefix}animate-scroll`, 'animation-timeline: scroll()');
  }

  generateCSS(): string {
    let css = '';
    
    this.utilities.forEach((styles, className) => {
      css += `.${className} { ${styles}; }\n`;
      
      if (this.config.responsive) {
        css += `@container (min-width: 640px) { .sm\\:${className} { ${styles}; } }\n`;
        css += `@container (min-width: 768px) { .md\\:${className} { ${styles}; } }\n`;
      }
      
      if (this.config.hover) {
        css += `.hover\\:${className}:hover { ${styles}; }\n`;
      }
      
      if (this.config.dark) {
        css += `@media (prefers-color-scheme: dark) { .dark\\:${className} { ${styles}; } }\n`;
      }
    });
    
    return css;
  }
}