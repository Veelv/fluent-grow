import type { TypeDocOptions } from 'typedoc';

const config: Partial<TypeDocOptions> = {
  entryPoints: ['src/main.ts'],
  out: 'docs',
  theme: 'default',
  includeVersion: true,
  excludePrivate: true,
  excludeProtected: true,
  excludeExternals: true,
  readme: 'README.md',
  name: 'Fluent Grow Framework',
  tsconfig: 'tsconfig.json'
};

export default config;