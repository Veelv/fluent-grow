import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import type { Config } from '@typescript-eslint/utils/ts-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-const': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'warn'
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**', '*.js']
  }
);