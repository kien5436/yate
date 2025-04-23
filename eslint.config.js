import pk from 'eslint-config-pk';

export default [
  ...pk,
  {
    rules: {
      'no-useless-constructor': 'off',
      'no-underscore-dangle': 'off',
    },
  },
];
