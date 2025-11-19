export default {
  minify: true,
  sourceMap: true,
  targets: {
    chrome: 90,
    safari: 14.1,
    firefox: 102,
    edge: 90
  },
  include: {
    nesting: true,
    customMedia: true,
    clamp: true,
    colorFunction: true,
    oklch: true,
    p3: true,
    hexAlphaColors: true,
    spaceSeparatedColorNotation: true,
    fontFamilySystemUi: true,
    doublePositionGradients: true,
    vendorPrefixes: true,
    logicalProperties: true
  },
  exclude: {
    // Allow adding vendor prefixes for wider support; keep excluding obsolete -ms- except when needed
    vendorPrefixes: []
  },
  drafts: {
    customMedia: true
  }
} as const;