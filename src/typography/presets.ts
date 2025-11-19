/**
 * Typography Presets
 * ------------------
 * Ready-made typographic compositions that adapt across breakpoints.
 */

import { Typography } from './index';

interface HeadingPreset {
  base: string;
  responsive?: Record<string, string>;
}

const HEADING_PRESETS: Record<'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', HeadingPreset> = {
  h1: { base: 'headline', responsive: { md: 'display-1', xl: 'display-2' } },
  h2: { base: 'title', responsive: { md: 'headline', xl: 'display-1' } },
  h3: { base: 'subtitle', responsive: { md: 'title' } },
  h4: { base: 'body', responsive: { md: 'subtitle' } },
  h5: { base: 'body-sm', responsive: { md: 'body' } },
  h6: { base: 'caption' }
};

export const TypographyPresets = {
  heading(element: HTMLElement, level: keyof typeof HEADING_PRESETS = 'h1'): Typography {
    const preset = HEADING_PRESETS[level];
    const typography = new Typography(element).scale(preset.base).weight('700').tracking('-0.02em');
    if (preset.responsive) {
      typography.responsiveScale(preset.responsive);
    }
    return typography;
  },

  display(element: HTMLElement): Typography {
    return new Typography(element)
      .scale('display-2')
      .weight('700')
      .tracking('-0.04em')
      .wrap('balance');
  },

  body(element: HTMLElement): Typography {
    return new Typography(element)
      .scale('body')
      .lineHeightToken('body');
  },

  lead(element: HTMLElement): Typography {
    return new Typography(element)
      .scale('subtitle')
      .tracking('0.02em')
      .color('var(--fluent-color-content-subtle, inherit)');
  },

  caption(element: HTMLElement): Typography {
    return new Typography(element)
      .scale('caption')
      .tracking('0.08em')
      .uppercase();
  },

  code(element: HTMLElement): Typography {
    return new Typography(element)
      .scale('code')
      .familyToken('code')
      .featureSettings('"ss01" 1, "ss02" 1')
      .wrap('stable');
  },

  blockquote(element: HTMLElement): Typography {
    return new Typography(element)
      .scale('subtitle')
      .leading('1.8')
      .tracking('0.01em')
      .color('var(--fluent-color-content-muted, inherit)');
  }
};

