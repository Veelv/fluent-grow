# Fluent Grow Framework

**Zero-runtime CSS-in-TS framework** leveraging Web Components, Houdini worklets, and Interop 2025 features. Built for enterprise applications requiring maximum performance and developer experience.

## Core Architecture

### Component System
- **Atomic Design**: Quarks → Atoms → Molecules → Organisms → Templates → Systems
- **Web Components**: Custom elements with Shadow DOM encapsulation
- **TypeScript-first**: Full type safety with IntelliSense support
- **Zero CSS files**: All styles via `styleMap` and Houdini properties

### Performance Features
- **<35KB bundle**: Single JS file, tree-shakeable components
- **Off-main-thread**: Houdini worklets for paint/animation/layout
- **Native APIs**: No polyfills for modern browsers (Chrome 125+, Safari 26+, Firefox TP)
- **Lazy loading**: Components register on-demand

### Modern CSS Integration
- **Container queries**: Size and style-based responsive design
- **Anchor positioning**: Dynamic tooltip/popover placement
- **Subgrid**: Multi-level grid layouts
- **View transitions**: SPA-like page navigation
- **Scroll-driven animations**: Timeline-based effects
- **OKLCH colors**: Perceptually uniform color space

## Quick Start

```bash
npm install fluent-grow
```

```typescript
import 'fluent-grow';

// Components auto-register
document.body.innerHTML = `
  <fluent-grid columns="3">
    <fluent-card variant="premium" size="lg">
      <h2 slot="title">Enterprise Ready</h2>
      <p slot="content">Zero runtime overhead</p>
    </fluent-card>
  </fluent-grid>
`;
```

## Component API

### Styling System
```typescript
// Recipe-based styling
const cardRecipe = {
  base: {
    'container-type': 'inline-size',
    'background': 'light-dark(oklch(98% 0.1 200), oklch(20% 0.2 240))',
    'border-radius': 'calc(8px + sin(var(--angle)) * 4px)'
  },
  variants: {
    premium: {
      'border-image': 'paint(wave-distort)',
      '--premium': 'true'
    }
  }
};
```

### Houdini Integration
```typescript
// Paint worklets
CSS.paintWorklet.addModule('houdini/paint/ripple-ink.js');

// Animation worklets
CSS.animationWorklet.addModule('houdini/animation/spring-physics.js');

// Layout worklets (experimental)
CSS.layoutWorklet.addModule('houdini/layout/masonry-advanced.js');
```

### Reactive Attributes
```html
<fluent-card 
  variant="premium" 
  size="lg" 
  animated
  data-theme="dark">
</fluent-card>
```

## Development Workflow

```bash
npm run dev          # Vite dev server with HMR
npm run build        # Production bundle
npm run test:unit    # Vitest unit tests
npm run test:e2e     # Playwright integration tests
npm run docs         # Generate API documentation
```

## Universal Browser Support

**Works in ALL modern browsers** with automatic feature detection and fallbacks:

| Feature | Support Strategy | Fallback |
|---------|------------------|----------|
| Web Components | Native detection | Polyfill for older browsers |
| Container Queries | Native detection | Media queries |
| Anchor Positioning | Native detection | Absolute positioning |
| View Transitions | Native detection | CSS transitions |
| Houdini Paint | Native detection | CSS gradients/patterns |
| CSS Nesting | Native detection | Expanded selectors |

### Supported Browsers
- **Modern browsers**: Chrome 60+, Firefox 63+, Safari 10.1+, Edge 79+
- **Legacy browsers**: IE 11, Chrome 49+, Firefox 45+, Safari 9+ (with polyfills)
- **Mobile browsers**: iOS Safari 9+, Chrome Mobile 60+, Samsung Internet 7+
- **Enterprise browsers**: Compatible with corporate environments
- **Any browser** supporting ES5 with automatic polyfill loading

## Framework Philosophy

1. **Zero Runtime**: No JavaScript execution for styling
2. **Native First**: Leverage platform APIs over abstractions
3. **Type Safety**: Full TypeScript integration
4. **Performance**: Sub-second load times, 60fps animations
5. **Accessibility**: ARIA attributes auto-injected
6. **Future Proof**: Built on emerging web standards
7. **Graceful Degradation**: Robust fallbacks for limited browser support

## Fallback Strategy

### Houdini Features
- **Paint Worklets**: Automatic fallback to CSS gradients/patterns
- **Animation Worklets**: Falls back to CSS transitions/animations
- **Layout Worklets**: Uses CSS Grid/Flexbox alternatives

### Modern CSS Features
- **Anchor Positioning**: Polyfill + absolute positioning fallback
- **View Transitions**: CSS transitions for unsupported browsers
- **Container Queries**: Media queries fallback with polyfill

### Universal Compatibility
All browsers get full functionality through intelligent feature detection:
- **Modern browsers**: Native features when available
- **Older browsers**: Automatic polyfills and fallbacks
- **Mobile browsers**: Optimized for performance and battery
- **Enterprise browsers**: Compatible with corporate environments

> Users experience zero degradation regardless of browser choice.

```typescript
// Automatic fallback generation
import { withFallbacks } from '@/utils/css-fallbacks';

const styles = withFallbacks({
  background: 'paint(ripple)', // → radial-gradient fallback
  position: 'anchor(top)', // → absolute positioning fallback
  'view-transition-name': 'slide' // → CSS transition fallback
});
```

## Enterprise Features

- **Design System**: Consistent tokens and recipes
- **Theme Support**: Light/dark mode with `light-dark()`
- **Internationalization**: RTL support via logical properties
- **Analytics Ready**: Performance metrics and usage tracking
- **SSR Compatible**: Server-side rendering support
- **CDN Optimized**: Single file deployment

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Examples: Modern CSS fallbacks and preferences

```typescript
// Recipe with :has() and color-mix fallbacks
import { createRecipe } from '@/styles/recipes/recipe';
import { ColorManager } from '@/colors';

const colors = new ColorManager();

const badge = createRecipe({
  base: {
    'border-radius': '9999px',
    'padding': '0.25rem 0.5rem',
    // Prefer OKLCH + color-mix with automatic fallbacks
    'background': 'color-mix(in oklch, oklch(0.85 0.12 80) 80%, oklch(0.25 0.02 80))',
    'color': 'oklch(0.18 0.02 260)'
  },
  selectors: {
    // Use :has() to style parent when child icon exists (enhancement)
    ':host(:has([slot="icon"]))': {
      'padding-left': '0.375rem'
    }
  }
})
.withFallbacks({
  // When :has() is not supported, provide an alternative selector strategy
  hasFallbacks: {
    // Example: rely on a modifier class applied by component logic
    ':host(.has-icon)': {
      'padding-left': '0.375rem'
    }
  },
  // Provide a host-level color fallback when color-mix/oklch unsupported
  colorMixHostFallback: {
    'background': colors.resolveWithFallback(
      'color-mix(in oklch, oklch(0.85 0.12 80) 80%, oklch(0.25 0.02 80))',
      // sRGB fallback
      'rgb(230 230 240)'
    ),
    'color': colors.resolveWithFallback('oklch(0.18 0.02 260)', 'rgb(30 30 35)')
  }
});
```

```typescript
// Variable fonts and features
import { FontManager } from '@/typography/font-manager';
import { applyFontFeatures, applyHyphenation, applyFontVariationAxes } from '@/typography';

const fm = new FontManager();
await fm.register({
  family: 'InterVar',
  variants: [{ src: '/fonts/Inter.var.woff2', variationAxes: { wght: 500, opsz: 14 } }]
});

const el = document.querySelector('.article') as HTMLElement;
applyFontFeatures(el, { liga: 1, kern: 1, dlig: 0 });
applyHyphenation(el, 'auto');
applyFontVariationAxes(el, { wght: 600, opsz: 16 });
```

```typescript
// Media/Preferences: reduced motion, contrast, color scheme, HDR
import {
  watchPrefersReducedMotion,
  watchPrefersContrast,
  watchColorScheme,
  watchDynamicRange
} from '@/responsive/media-queries';

const cleanup: Array<() => void> = [];

cleanup.push(
  watchPrefersReducedMotion((reduce) => {
    document.documentElement.toggleAttribute('data-reduced-motion', reduce);
  })
);

cleanup.push(
  watchPrefersContrast(() => {
    // Decide more/less in app logic
    const more = matchMedia('(prefers-contrast: more)').matches;
    document.documentElement.dataset.contrast = more ? 'more' : 'less';
  })
);

cleanup.push(
  watchColorScheme((scheme) => {
    document.documentElement.dataset.scheme = scheme;
  })
);

cleanup.push(
  watchDynamicRange((high) => {
    document.documentElement.dataset.hdr = high ? 'on' : 'off';
  })
);

// Later: cleanup.forEach(fn => fn());
```

### Scoped Theming (light/dark) and RTL/LTR

```typescript
// Scoped theming via data-theme and tokens
import { ThemeManager } from '@/core';
import { setDirection } from '@/utils/dir';

const theme = new ThemeManager();

theme.register({
  name: 'light',
  tokens: {
    colors: {
      bg: { base: 'rgb(255 255 255)' },
      fg: { base: 'rgb(24 24 27)' },
      accent: { base: 'rgb(99 102 241)' }
    }
  }
});

theme.register({
  name: 'dark',
  inheritsFrom: 'light',
  tokens: {
    colors: {
      bg: { base: 'rgb(18 18 22)' },
      fg: { base: 'rgb(228 228 231)' },
      accent: { base: 'rgb(129 140 248)' }
    }
  }
});

// Global light theme
theme.apply('light');

// Scoped dark theme in a specific container
const card = document.querySelector('.card') as HTMLElement;
theme.applyScoped('dark', card);

// In CSS (constructable stylesheet/recipes), use:
// [data-theme="dark"] :host { /* overrides dark */ }
```

```typescript
// Layout direction (RTL/LTR)
import { setDirection, getDirection } from '@/utils/dir';

// Global RTL
setDirection(document, 'rtl');

// Scoped LTR in a container
const sidebar = document.querySelector('.sidebar') as HTMLElement;
setDirection(sidebar, 'ltr');

console.log('Global direction:', getDirection(document)); // rtl
console.log('Sidebar direction:', getDirection(sidebar)); // ltr
```

```typescript
// Token contracts: validation and migration
import { validateTokens, registerMigration, migrateTokens } from '@/core';

// Validation: number ranges (e.g.: leading between 1 and 2)
const issues = validateTokens(
  {
    typography: { leading: { base: 2.4 } }
  },
  { numberRanges: { 'typography.leading.base': { min: 1, max: 2 } } }
);
console.log(issues); // [{ path: 'typography.leading.base', message: 'Value 2.4 > max 2' }]

// Migration: rename tokens or adjust structures between versions
registerMigration({
  from: '0.1.1',
  to: '0.1.1',
  migrate(tokens) {
    const next = { ...tokens };
    // example: move colors.brand -> colors.accent
    const brand = (next as any).colors?.brand;
    if (brand) {
      (next as any).colors = { ...(next as any).colors, accent: brand };
      delete (next as any).colors.brand;
    }
    return next;
  }
});

const migrated = migrateTokens(
  { colors: { brand: { base: 'rebeccapurple' } } },
  '0.1'
);
// migrated.colors.accent.base === 'rebeccapurple'
```