export interface AriaAttributes {
  role?: string;
  label?: string;
  describedBy?: string;
  labelledBy?: string;
  live?: 'off' | 'polite' | 'assertive';
}

export function applyAriaAttributes(element: HTMLElement, attributes: AriaAttributes): void {
  if (attributes.role) {
    element.setAttribute('role', attributes.role);
  }

  if (attributes.label) {
    element.setAttribute('aria-label', attributes.label);
  }

  if (attributes.describedBy) {
    element.setAttribute('aria-describedby', attributes.describedBy);
  }

  if (attributes.labelledBy) {
    element.setAttribute('aria-labelledby', attributes.labelledBy);
  }

  if (attributes.live) {
    element.setAttribute('aria-live', attributes.live);
  }
}

export function trapFocus(container: HTMLElement): () => void {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ];

  const focusableElements = Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelectors.join(','))
  );

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (!first || !last) {
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  container.addEventListener('keydown', handleKeydown);

  return () => {
    container.removeEventListener('keydown', handleKeydown);
  };
}

