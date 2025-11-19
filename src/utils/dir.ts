export type Direction = 'ltr' | 'rtl' | 'auto';

/**
 * Sets document or element direction and mirrors a data attribute for styling hooks.
 */
export function setDirection(target: Document | HTMLElement = document, dir: Direction): void {
  if (isDocument(target)) {
    target.documentElement.setAttribute('dir', dir);
    target.documentElement.setAttribute('data-dir', dir);
    return;
  }
  target.setAttribute('dir', dir);
  target.setAttribute('data-dir', dir);
}

export function getDirection(target: Document | HTMLElement = document): Direction {
  if (isDocument(target)) {
    return (target.documentElement.getAttribute('dir') as Direction) ?? 'ltr';
  }
  return (target.getAttribute('dir') as Direction) ?? 'ltr';
}

function isDocument(val: unknown): val is Document {
  return typeof Document !== 'undefined' && val instanceof Document;
}


