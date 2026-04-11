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

  ignores: ['dist'],
}, {
  rules: {
    'node/prefer-global/process': 'off',
  },
});
