import { FlatCompat } from '@eslint/eslintrc';
import eslintRecommended from '@eslint/eslintrc/conf/eslint-recommended.js';

const compat = new FlatCompat({
  baseDirectory: new URL('.', import.meta.url).pathname,
  recommendedConfig: eslintRecommended,
});

export default [
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ),
  {
    files: ['*.ts', '*.tsx'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': await import('@typescript-eslint/eslint-plugin'),
      prettier: await import('eslint-plugin-prettier'),
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
