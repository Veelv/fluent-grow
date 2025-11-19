export interface PerformanceMarkOptions {
  start?: number;
  detail?: Record<string, unknown>;
}

export function mark(name: string, options: PerformanceMarkOptions = {}): void {
  if (typeof performance === 'undefined' || !performance.mark) {
    return;
  }
  performance.mark(name, options);
}

export function measure(name: string, startMark?: string, endMark?: string): PerformanceMeasure | undefined {
  if (typeof performance === 'undefined' || !performance.measure) {
    return undefined;
  }
  try {
    return performance.measure(name, startMark, endMark);
  } catch {
    return undefined;
  }
}

export function clearMarks(name?: string): void {
  if (typeof performance === 'undefined' || !performance.clearMarks) {
    return;
  }
  performance.clearMarks(name);
}

export function clearMeasures(name?: string): void {
  if (typeof performance === 'undefined' || !performance.clearMeasures) {
    return;
  }
  performance.clearMeasures(name);
}

