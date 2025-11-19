/**
 * OKLCH colour utilities used across the Fluent Grow colour system.
 */
export interface OKLCHColor {
  l: number;
  c: number;
  h: number;
  alpha?: number;
}

/**
 * Serialises a colour structure into a CSS `oklch()` string.
 */
export function toOKLCH({ l, c, h, alpha }: OKLCHColor): string {
  const lightness = `${(clamp(l, 0, 1) * 100).toFixed(2)}%`;
  const chroma = `${Math.max(c, 0).toFixed(3)}`;
  const hue = `${((h % 360) + 360) % 360}deg`;
  const alphaPart = alpha !== undefined ? ` / ${clamp(alpha, 0, 1)}` : '';
  return `oklch(${lightness} ${chroma} ${hue}${alphaPart})`;
}

/**
 * Parses a CSS `oklch()` string into a colour structure. Returns null when the
 * value cannot be parsed.
 */
export function fromOKLCH(value: string): OKLCHColor | null {
  const match = value.trim().match(/oklch\(([^)]+)\)/i);
  if (!match) {
    return null;
  }

  const raw = match[1];
  if (!raw) {
    return null;
  }

  const parts = raw.split(/[\s/]+/).filter(Boolean);
  const lPart = parts[0];
  const cPart = parts[1];
  const hPart = parts[2];
  const alphaPart = parts[3];

  if (lPart === undefined || cPart === undefined || hPart === undefined) {
    return null;
  }

  const colour: OKLCHColor = {
    l: clamp(parseFloat(lPart) / 100, 0, 1),
    c: Math.max(parseFloat(cPart), 0),
    h: ((parseFloat(hPart) % 360) + 360) % 360
  };

  if (alphaPart !== undefined) {
    colour.alpha = clamp(parseFloat(alphaPart), 0, 1);
  }

  return colour;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

