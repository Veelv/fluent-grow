import type { FrameworkTokens, TokenGroup } from './config';

/**
 * Watcher invoked whenever the token graph changes.
 */
export type TokenWatcher = (tokens: FrameworkTokens) => void;

const watchers = new Set<TokenWatcher>();

/**
 * Registers a watcher that will be notified whenever tokens are merged or
 * applied. Returns an unsubscribe function.
 */
export function watchTokens(fn: TokenWatcher): () => void {
  watchers.add(fn);
  return () => watchers.delete(fn);
}

/**
 * Merges two token graphs. The resulting object is a new reference.
 */
export function mergeTokenGroups(base: FrameworkTokens = {}, partial: FrameworkTokens = {}): FrameworkTokens {
  const result: FrameworkTokens = { ...base };

  Object.entries(partial).forEach(([groupName, groupValue]) => {
    if (!groupValue) {
      return;
    }

    const existingGroup = base[groupName];
    result[groupName] = mergeTokenGroup(existingGroup as TokenGroup | undefined, groupValue);
  });

  notifyWatchers(result);
  return result;
}

/**
 * Produces a flattened representation of the tokens suitable for setting CSS
 * custom properties.
 */
export function flattenTokens(tokens: FrameworkTokens): Array<[string, string | number]> {
  const entries: Array<[string, string | number]> = [];

  Object.entries(tokens).forEach(([groupName, groupValue]) => {
    if (!groupValue) {
      return;
    }

    entries.push(...flattenTokenGroup(groupValue, groupName));
  });

  return entries;
}

/**
 * Applies the provided tokens onto the supplied element (defaults to
 * documentElement) using the `--fluent-` prefix convention.
 */
export function applyTokens(tokens: FrameworkTokens, root: HTMLElement = document.documentElement): void {
  flattenTokens(tokens).forEach(([token, value]) => {
    root.style.setProperty(`--fluent-${token}`, String(value));
  });
}

function mergeTokenGroup(target: TokenGroup | undefined, source: TokenGroup): TokenGroup {
  const merged: TokenGroup = target ? { ...target } : {};

  Object.entries(source).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      merged[key] = mergeTokenGroup(merged[key] as TokenGroup | undefined, value as TokenGroup);
    } else {
      merged[key] = value as string | number;
    }
  });

  return merged;
}

function flattenTokenGroup(group: TokenGroup, parentKey: string): Array<[string, string | number]> {
  const entries: Array<[string, string | number]> = [];

  Object.entries(group).forEach(([key, value]) => {
    const tokenKey = `${parentKey}-${key}`;

    if (typeof value === 'object' && value !== null) {
      entries.push(...flattenTokenGroup(value as TokenGroup, tokenKey));
    } else {
      entries.push([tokenKey, value as string | number]);
    }
  });

  return entries;
}

function notifyWatchers(tokens: FrameworkTokens): void {
  watchers.forEach((watcher) => {
    try {
      watcher(tokens);
    } catch (error) {
      if (typeof console !== 'undefined') {
        console.error('[FluentFramework] Token watcher threw an error', error);
      }
    }
  });
}

