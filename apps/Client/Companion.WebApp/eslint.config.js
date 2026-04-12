import antfu from '@antfu/eslint-config';

export default antfu({
  react: true,
  typescript: true,

  stylistic: {
    quotes: 'single',
    semi: true,
    indent: 2,
  },

  formatters: {
    css: true,
  },

  // Match both app-relative paths and repo-root paths (lint-staged passes the latter).
  ignores: ['dist', '**/src/components/ui/**'],
}, {
  rules: {
    'node/prefer-global/process': 'off',
  },
});
