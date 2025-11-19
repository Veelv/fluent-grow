import { fromOKLCH, toOKLCH, type OKLCHColor } from './oklch';

export type HarmonyType = 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'split-complementary';

/**
 * Generates a palette of harmonious colours based on OKLCH hue rotation.
 */
export function generateHarmony(base: string, type: HarmonyType): string[] {
  const color = fromOKLCH(base);
  if (!color) {
    return [base];
  }

  switch (type) {
    case 'analogous':
      return [rotate(color, -30), base, rotate(color, 30)];
    case 'complementary':
      return [base, rotate(color, 180)];
    case 'triadic':
      return [base, rotate(color, 120), rotate(color, -120)];
    case 'tetradic':
      return [base, rotate(color, 90), rotate(color, 180), rotate(color, 270)];
    case 'split-complementary':
      return [base, rotate(color, 150), rotate(color, -150)];
    default:
      return [base];
  }
}

function rotate(color: OKLCHColor, degrees: number): string {
  const next: OKLCHColor = { ...color, h: (color.h + degrees + 360) % 360 };
  return toOKLCH(next);
}

