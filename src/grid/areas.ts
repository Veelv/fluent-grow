/**
 * Utility for building complex grid area maps in a declarative fashion.
 */

export type AreaMatrix = Array<Array<string | null>>;

export interface AreaBuilderOptions {
  fill?: string;
}

export class GridAreaBuilder {
  private matrix: AreaMatrix;
  private fill: string | null;

  constructor(rows: number, columns: number, options: AreaBuilderOptions = {}) {
    if (rows <= 0 || columns <= 0) {
      throw new Error('GridAreaBuilder requires positive row and column counts.');
    }

    this.matrix = Array.from({ length: rows }, () => Array(columns).fill(null));
    this.fill = options.fill ?? null;
  }

  place(name: string, rowStart: number, columnStart: number, rowSpan = 1, columnSpan = 1): this {
    for (let r = 0; r < rowSpan; r += 1) {
      for (let c = 0; c < columnSpan; c += 1) {
        const rowIndex = rowStart + r;
        const columnIndex = columnStart + c;

        if (!this.matrix[rowIndex] || this.matrix[rowIndex][columnIndex] === undefined) {
          throw new Error(`Position [${rowIndex}, ${columnIndex}] is outside the grid bounds.`);
        }

        this.matrix[rowIndex][columnIndex] = name;
      }
    }

    return this;
  }

  toTemplateAreas(): string[] {
    return this.matrix.map((row) => {
      return row.map((cell) => cell ?? this.fill ?? '.').join(' ');
    });
  }
}

