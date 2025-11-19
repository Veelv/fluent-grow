/**
 * Responsive Utilities
 * --------------------
 * Bridges BreakpointManager with utilities/recipes by generating
 * media-query maps and container conditions in a consistent way.
 */

import { BreakpointManager } from '../responsive/breakpoints';

export type Comparison = 'min' | 'max' | 'between';

export interface BetweenRange {
  from: string;
  to: string;
}

export type QueryLabel = string | BetweenRange;

export function queryFor(label: QueryLabel, comparison: Comparison = 'min'): string {
  if (typeof label === 'string') {
    if (label.trim().startsWith('(')) {
      return label.trim();
    }
    if (comparison === 'between') {
      throw new Error('Use { from, to } when building a "between" query.');
    }
    return BreakpointManager.query(label, comparison);
  }
  return BreakpointManager.query(label.from, 'between', label.to);
}

export function conditionFor(label: QueryLabel, comparison: Comparison = 'min'): string {
  if (typeof label === 'string') {
    if (label.includes('width') || label.includes('height')) {
      return label;
    }
    if (comparison === 'between') {
      throw new Error('Use { from, to } when building a "between" condition.');
    }
    return BreakpointManager.condition(label, comparison);
  }
  return BreakpointManager.condition(label.from, 'between', label.to);
}

export function mapByBreakpoints<T>(map: Record<string, T>, comparison: Exclude<Comparison, 'between'> = 'min'): Record<string, T> {
  const result: Record<string, T> = {};
  Object.entries(map).forEach(([label, value]) => {
    result[queryFor(label, comparison)] = value;
  });
  return result;
}

export function mapBetween<T>(ranges: Array<{ from: string; to: string; value: T }>): Record<string, T> {
  const result: Record<string, T> = {};
  ranges.forEach((range) => {
    result[queryFor({ from: range.from, to: range.to }, 'between')] = range.value;
  });
  return result;
}
