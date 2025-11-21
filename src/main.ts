/**
 * Fluent Grow – Unified entry point.
 */

export * from './core';

export * from './layout';
export * from './layout/positioning';
export * from './layout/spacing';
export * from './layout/sizing';
export * from './layout/overflow';

export * from './flex';
export * from './flex/container';
export * from './flex/item';
export * from './flex/presets';

export * from './grid';
export * from './grid/container';
export * from './grid/item';
export * from './grid/subgrid';
export * from './grid/areas';

export * from './typography';
export * from './typography/font-manager';
export * from './typography/scales';
export * from './typography/fluid';
export * from './typography/presets';

export * from './colors';
export * from './colors/oklch';
export * from './colors/palette';
export * from './colors/contrast';
export * from './colors/harmony';

export * from './responsive';
export * from './responsive/breakpoints';
export * from './responsive/container-queries';
export * from './responsive/viewport';
export * from './responsive/media-queries';

export * from './utils/accessibility';
export * from './utils/animation-timeline';
export * from './utils/css-engine';
export * from './utils/css-fallbacks';
export * from './utils/performance';
export * from './utils/polyfill-loader';
export * from './utils/supports';
export * from './utils/dom-utils';
export * from './utils/math-utils';
export * from './utils/string-utils';
export * from './utils/event-emitter';
export * from './utils/debounce-throttle';
export * from './utils/responsive';
export * from './styles/recipes';

// Advanced Features
export * from './utilities/utility-engine';
export * from './components/advanced-components';
export * from './components/badge';
export * from './components/tooltip';
export * from './components/modal';
export * from './components/popover';
export * from './components/tabs';
export * from './components/input';
export * from './components/select';
export * from './components/toast';
export * from './components/progress';
export * from './components/skeleton';
export * from './components/accordion';
export * from './components/dropdown';
export * from './components/menu';
export * from './components/breadcrumb';
export * from './components/pagination';
export * from './components/avatar';
export * from './components/chip';
export * from './components/spinner';
export * from './components/switch';
export * from './components/slider';
export * from './components/avatar-group';
export * from './components/modal-advanced';
export * from './components/datepicker';
export * from './components/autocomplete';
export * from './components/notification';
export * from './components/stepper';
export * from './components/table';
export * from './components/label';
export * from './components/checkbox';
export * from './components/radio';
export * from './components/textarea';
export * from './components/text';
export * from './components/title';
export * from './components/form';
export * from './components/radio-group';
export * from './components/checkbox-group';
export * from './components/form-message';
export * from './animations';
export * from './themes/advanced-themes';

// Complete CSS System
export * from './effects';
export * from './states';
export * from './transforms';
export * from './display';
export * from './borders';
export * from './css-complete';
export * from './integrations';

export const VERSION = '0.1.1';

if (typeof window !== 'undefined') {
  // Progressive enhancement: attempt to load critical polyfills for broader support
  void (async () => {
    try {
      const { PolyfillManager } = await import('./core/polyfill-manager');
      const disabled = Boolean((window as any).__FG_DISABLE_POLYFILLS__);
      if (!disabled) {
        const manager = new PolyfillManager();
        await manager.loadRequiredPolyfills();
      }
    } catch {
      // no-op: polyfills are best-effort
    }
  })();
  console.info(`🚀 Fluent Grow Framework v${VERSION} - Complete CSS Edition initialised`);
  console.info('✨ Features: Complete CSS System, Effects, States, Transforms, Borders, Display');
  console.info('🎯 All CSS Properties: Shadows, Pseudo-elements, Filters, Gradients, Animations');
}
