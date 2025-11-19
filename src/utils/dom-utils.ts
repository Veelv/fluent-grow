export function createElement<T extends keyof HTMLElementTagNameMap>(tag: T, className?: string): HTMLElementTagNameMap[T] {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  return element;
}

export function setAttributes(element: Element, attributes: Record<string, string | number | boolean | null | undefined>): void {
  Object.entries(attributes).forEach(([key, value]) => {
    if (value === null || value === undefined || value === false) {
      element.removeAttribute(key);
    } else {
      element.setAttribute(key, value === true ? '' : String(value));
    }
  });
}

export function toggleClass(element: Element, className: string, force?: boolean): void {
  element.classList.toggle(className, force);
}

