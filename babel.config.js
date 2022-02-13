/** @type import('@babel/core').TransformOptions */
module.exports = {
  compact: true,
  minified: true,
  only: ['./src'],
  plugins: [
    [
      '@babel/plugin-transform-react-jsx', {
        pragma: 'h',
        pragmaFrag: 'Fragment',
      },
    ],
    [
      '@babel/plugin-transform-runtime', {
        absoluteRuntime: true,
        corejs: 3,
        helpers: false,
        regenerator: false,
        version: '^7.11.0',
      },
    ],
  ],
  presets: [
    '@babel/preset-env',
  ],
};