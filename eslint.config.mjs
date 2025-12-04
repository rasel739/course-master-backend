import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';

export default [
  {
    ignores: ['dist', 'node_modules'],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ['**/*.ts', '**/*.js'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },

    plugins: {
      prettier,
    },

    rules: {
      'no-unused-vars': 'error',
      'prefer-const': 'error',
      'no-unused-expressions': 'error',
      'no-console': 'off',

      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      '@typescript-eslint/no-unused-vars': ['error'],

      'no-undef': 'off',

      'prettier/prettier': 'error',
    },
  },
];
