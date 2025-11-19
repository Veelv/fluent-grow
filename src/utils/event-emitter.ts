type Listener<T> = (payload: T) => void;

export class EventEmitter<T = void> {
  private listeners = new Set<Listener<T>>();

  on(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => this.off(listener);
  }

  off(listener: Listener<T>): void {
    this.listeners.delete(listener);
  }

  emit(payload: T): void {
    this.listeners.forEach((listener) => listener(payload));
  }

  clear(): void {
    this.listeners.clear();
  }
}

