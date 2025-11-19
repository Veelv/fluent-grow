const POLYFILLS: Array<() => Promise<void>> = [];

let loaded = false;

export function registerPolyfill(loader: () => Promise<void>): void {
  POLYFILLS.push(loader);
}

export async function loadPolyfills(): Promise<void> {
  if (loaded) {
    return;
  }

  loaded = true;

  await Promise.all(
    POLYFILLS.map(async (loader) => {
      try {
        await loader();
      } catch (error) {
        if (typeof console !== 'undefined') {
          console.warn('[FluentFramework] Failed to load polyfill', error);
        }
      }
    })
  );
}

if (typeof window !== 'undefined') {
  void loadPolyfills();
}

