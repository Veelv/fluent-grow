/**
 * Opinionated flex layouts for common UI patterns.
 */

import { FlexContainer, type FlexContainerConfig } from './container';

export class FlexPresets {
  static horizontalStack(element: HTMLElement, gap: string | number = '1rem'): FlexContainer {
    return new FlexContainer(element).config({ direction: 'row', align: 'center', gap });
  }

  static verticalStack(element: HTMLElement, gap: string | number = '1rem'): FlexContainer {
    return new FlexContainer(element).config({ direction: 'column', gap });
  }

  static center(element: HTMLElement): FlexContainer {
    return new FlexContainer(element).config({ justify: 'center', align: 'center' });
  }

  static spaceBetween(element: HTMLElement, align: FlexContainerConfig['align'] = 'center'): FlexContainer {
    return new FlexContainer(element).config({ justify: 'space-between', align });
  }

  static cluster(element: HTMLElement, gap: string | number = '0.75rem'): FlexContainer {
    return new FlexContainer(element).config({ direction: 'row', wrap: 'wrap', gap, justify: 'flex-start', align: 'center' });
  }

  static splitNavigation(element: HTMLElement): FlexContainer {
    return new FlexContainer(element).config({ justify: 'space-between', align: 'center' });
  }

  static responsive(element: HTMLElement, breakpoints: Record<string, FlexContainerConfig>, base?: FlexContainerConfig): FlexContainer {
    const container = new FlexContainer(element);
    return base ? container.responsive(breakpoints, { base }) : container.responsive(breakpoints);
  }
}

