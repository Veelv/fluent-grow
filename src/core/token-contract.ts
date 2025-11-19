import type { FrameworkTokens } from './config';

export interface TokenContract {
  version: string;
  schema: Record<string, 'string' | 'number' | 'group'>;
}

export interface TokenMigration {
  from: string;
  to: string;
  migrate: (tokens: FrameworkTokens) => FrameworkTokens;
}

const migrations: TokenMigration[] = [];

export function registerMigration(migration: TokenMigration): void {
  migrations.push(migration);
}

export function migrateTokens(tokens: FrameworkTokens, currentVersion: string): FrameworkTokens {
  let result = { ...tokens };
  // Apply migrations in order
  migrations
    .filter((m) => m.from !== m.to)
    .sort((a, b) => a.from.localeCompare(b.from))
    .forEach((m) => {
      if (m.from === currentVersion) {
        result = m.migrate(result);
        currentVersion = m.to;
      }
    });
  return result;
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationRules {
  numberRanges?: Record<string, { min?: number; max?: number }>; // e.g., 'typography.leading.base': { min: 1, max: 2 }
}

export function validateTokens(tokens: FrameworkTokens, rules: ValidationRules): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (rules.numberRanges) {
    Object.entries(rules.numberRanges).forEach(([path, range]) => {
      const value = getPath(tokens, path);
      if (typeof value === 'number') {
        if (range.min !== undefined && value < range.min) {
          issues.push({ path, message: `Value ${value} < min ${range.min}` });
        }
        if (range.max !== undefined && value > range.max) {
          issues.push({ path, message: `Value ${value} > max ${range.max}` });
        }
      }
    });
  }
  return issues;
}

function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce((acc: any, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), obj as any);
}


