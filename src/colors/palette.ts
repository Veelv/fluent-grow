export type PaletteLevel = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

export interface PaletteDefinition {
  [level: number]: string;
}

/**
 * Immutable palette wrapper with helper utilities for tone lookup and mapping.
 */
export class ColorPalette {
  private readonly definition: Record<string, string>;

  constructor(definition: PaletteDefinition = {}) {
    this.definition = { ...definition };
  }

  set(level: PaletteLevel, value: string): ColorPalette {
    return new ColorPalette({ ...this.definition, [level]: value });
  }

  has(level: PaletteLevel): boolean {
    return Object.prototype.hasOwnProperty.call(this.definition, level);
  }

  get(level: PaletteLevel): string | undefined {
    return this.definition[level];
  }

  toRecord(): Record<string, string> {
    return { ...this.definition };
  }

  levels(): PaletteLevel[] {
    return Object.keys(this.definition)
      .map((key) => Number(key) as PaletteLevel)
      .sort((a, b) => a - b);
  }

  map<T>(callback: (level: PaletteLevel, value: string) => T): T[] {
    return this.levels().map((level) => callback(level, this.definition[level]!));
  }
}

