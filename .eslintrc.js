module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'pk/eslint-browser',
    'preact',
  ],
  ignorePatterns: 'build/**',
  parserOptions: { ecmaVersion: 2020 },
  rules: {
    'arrow-parens': [
      'error',
      'always',
    ],
    'brace-style': [
      'error',
      'stroustrup',
    ],
    'no-prototype-builtins': 'off',
    'object-curly-spacing': [
      'error',
      'always',
    ],
    quotes: ['error', 'single'],
    'react/jsx-max-props-per-line': [1, { maximum: 1, when: 'always' }],
    semi: [
      'error',
      'always',
      { omitLastInOneLineBlock: true },
    ],
  },
};