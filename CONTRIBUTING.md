# Contributing to Fluent Grow

## Development Setup

```bash
git clone https://github.com/veelv/fluent-grow
cd fluent-grow
npm install
npm run dev
```

## Architecture Guidelines

### Component Structure
- Each component extends `HTMLElement`
- Use Shadow DOM for encapsulation
- Implement `attributeChangedCallback` for reactivity
- Apply styles via `styleMap` only

### Naming Convention
- `modern-{level}-{name}`: Component naming
- `{name}.recipe.ts`: Style recipes
- `{name}.test.ts`: Unit tests

### Code Standards
- TypeScript strict mode
- ESLint + Prettier
- 95%+ test coverage
- JSDoc for public APIs

## Pull Request Process

1. Create feature branch
2. Add tests for new functionality
3. Update documentation
4. Ensure all checks pass
5. Request review

## Testing Requirements

```bash
npm run test:unit     # Vitest unit tests
npm run test:e2e      # Playwright E2E tests
npm run test:visual   # Visual regression tests
```

## Performance Benchmarks

- Bundle size: <35KB gzipped
- First paint: <100ms
- Interaction ready: <200ms
- Lighthouse score: 100/100