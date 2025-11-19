/**
 * Contrast and luminance utilities based on WCAG guidelines.
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return 0;
  }

  const [r, g, b] = rgb;

  const linear = (channel: number): number => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };

  const transformed = [linear(r), linear(g), linear(b)] as [number, number, number];

  return 0.2126 * transformed[0] + 0.7152 * transformed[1] + 0.0722 * transformed[2];
}

export function getContrastRatio(foreground?: string, background?: string): number {
  if (!foreground || !background) {
    return 1;
  }

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export function isAccessible(foreground?: string, background?: string, level: 'AA' | 'AAA' = 'AA'): boolean {
  const ratio = getContrastRatio(foreground, background);
  const threshold = level === 'AAA' ? 7 : 4.5;
  return ratio >= threshold;
}

function hexToRgb(hex?: string): [number, number, number] | null {
  if (!hex) {
    return null;
  }

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result || !result[1] || !result[2] || !result[3]) {
    return null;
  }

  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
}

