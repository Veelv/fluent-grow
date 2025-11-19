/**
 * Container Query Manager
 * -----------------------
 * Applies container queries with breakpoint-aware conditions and exposes a
 * convenient API for layout integrations.
 */

import { BreakpointManager } from './breakpoints';

export type ContainerAxis = 'width' | 'height';
export type ContainerComparison = 'min' | 'max' | 'between';

export interface ContainerConditionDescriptor {
  breakpoint: string;
  comparison?: ContainerComparison;
  to?: string;
  axis?: ContainerAxis;
}

export type ContainerCondition = string | ContainerConditionDescriptor;

export interface ContainerQueryContext {
  element: HTMLElement;
  rect: DOMRectReadOnly;
}

export interface ContainerQueryRule {
  condition: ContainerCondition;
  apply: (context: ContainerQueryContext) => void;
}

export interface ContainerQueryConfig {
  name?: string;
  type?: 'inline-size' | 'block-size';
  axis?: ContainerAxis;
  base?: (context: ContainerQueryContext) => void;
  rules: ContainerQueryRule[];
}

export interface ContainerQueryController {
  disconnect: () => void;
}

export function applyContainerQueries(element: HTMLElement, config: ContainerQueryConfig): ContainerQueryController {
  if (typeof ResizeObserver === 'undefined') {
    return { disconnect: () => undefined };
  }

  const axis: ContainerAxis = config.axis ?? 'width';

  const observer = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      const context: ContainerQueryContext = { element, rect: entry.contentRect };
      if (config.base) {
        config.base(context);
      }
      config.rules.forEach((rule) => {
        if (evaluateCondition(entry.contentRect, resolveCondition(rule.condition, axis))) {
          rule.apply(context);
        }
      });
    });
  });

  element.style.containerType = config.type ?? 'inline-size';
  if (config.name) {
    element.style.containerName = config.name;
  }

  observer.observe(element);
  return {
    disconnect: () => observer.disconnect()
  };
}

function evaluateCondition(rect: DOMRectReadOnly, condition: string): boolean {
  const clauses = condition.split('and').map((clause) => clause.trim());
  return clauses.every((clause) => {
    const match = clause.match(/(width|height)\s*(>=|<=|>|<)\s*([0-9]+\.?[0-9]*)px?/);
    if (!match) {
      return false;
    }
    const dimension = match[1];
    const operator = match[2];
    const valueRaw = match[3];
    if (!dimension || !operator || !valueRaw) {
      return false;
    }
    const numericValue = parseFloat(valueRaw);
    const target = dimension === 'height' ? rect.height : rect.width;
    switch (operator) {
      case '>=':
        return target >= numericValue;
      case '>':
        return target > numericValue;
      case '<=':
        return target <= numericValue;
      case '<':
        return target < numericValue;
      default:
        return false;
    }
  });
}

function resolveCondition(condition: ContainerCondition, axis: ContainerAxis): string {
  if (typeof condition === 'string') {
    return condition;
  }
  const comparison = condition.comparison ?? 'min';
  const breakpointAxis = condition.axis ?? axis;
  let base: string;
  if (comparison === 'between') {
    if (!condition.to) {
      throw new Error('Container conditions using "between" must provide a "to" breakpoint.');
    }
    base = BreakpointManager.condition(condition.breakpoint, 'between', condition.to);
  } else if (comparison === 'max') {
    base = BreakpointManager.condition(condition.breakpoint, 'max');
  } else {
    base = BreakpointManager.condition(condition.breakpoint, 'min');
  }
  if (breakpointAxis === 'width') {
    return base;
  }
  return base.replace(/width/g, 'height');
}

