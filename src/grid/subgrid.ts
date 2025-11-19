/**
 * Subgrid helpers to promote consistent layouts across nested grid regions.
 */

import { GridContainer, type GridContainerConfig } from './container';

export interface SubgridOptions extends GridContainerConfig {
  inheritTemplate?: boolean;
}

export function createSubgrid(element: HTMLElement, options: SubgridOptions = {}): GridContainer {
  const config: GridContainerConfig = {};

  if (options.inheritTemplate) {
    config.columns = 'subgrid';
    config.rows = 'subgrid';
  } else {
    if (options.columns) {
      config.columns = options.columns;
    }
    if (options.rows) {
      config.rows = options.rows;
    }
  }

  if (options.areas) {
    config.areas = options.areas;
  }
  if (options.gap) {
    config.gap = options.gap;
  }
  if (options.rowGap) {
    config.rowGap = options.rowGap;
  }
  if (options.columnGap) {
    config.columnGap = options.columnGap;
  }
  if (options.justifyItems) {
    config.justifyItems = options.justifyItems;
  }
  if (options.alignItems) {
    config.alignItems = options.alignItems;
  }
  if (options.justifyContent) {
    config.justifyContent = options.justifyContent;
  }
  if (options.alignContent) {
    config.alignContent = options.alignContent;
  }
  if (options.autoColumns) {
    config.autoColumns = options.autoColumns;
  }
  if (options.autoRows) {
    config.autoRows = options.autoRows;
  }
  if (options.autoFlow) {
    config.autoFlow = options.autoFlow;
  }
  if (options.inline) {
    config.inline = options.inline;
  }

  const container = new GridContainer(element, config);

  if (options.inheritTemplate) {
    element.style.gridTemplateColumns = 'subgrid';
    element.style.gridTemplateRows = 'subgrid';
  }

  return container;
}

