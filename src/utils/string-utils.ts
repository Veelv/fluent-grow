export function toKebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

export function capitalize(value: string): string {
  if (!value.length) {
    return value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function isEmpty(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim() === '';
}

