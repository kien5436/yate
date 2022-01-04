/* eslint-disable sort-keys */
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { resolve } = require('path');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');

/** @type import('webpack').Configuration */
module.exports = {
  mode: 'production',
  entry: {
    popup: './src/ui/popup/index.jsx',
    context: './src/ui/context.jsx',
    background: './src/background/index.js',
    options: './src/ui/options-page/index.jsx',
  },
  output: {
    filename: '[name].js',
    publicPath: '',
    path: resolve('built'),
  },
  module: {
    rules: [
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { cacheDirectory: true },
        },
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { url: false },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: {
                  tailwindcss: { config: resolve('tailwind.config.js') },
                  autoprefixer: {},
                },
              },
            },
          },
        ],
      },
      {
        test: /\.png$/,
        type: 'asset/resource',
        generator: { filename: 'res/icons/[name][ext]' },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new WebpackManifestPlugin({
      fileName: resolve('assets.json'),
      filter: (file) => file.path.endsWith('js'),
      generate: (seed, files, entries) => entries,
      useEntryKeys: true,
    }),
    new HtmlWebpackPlugin({
      title: '',
      filename: 'popup.html',
      template: 'src/ui/popup/index.html',
      inject: 'body',
      hash: true,
      chunks: ['popup'],
    }),
    new HtmlWebpackPlugin({
      title: 'Settings - Yate',
      filename: 'options.html',
      template: 'src/ui/options-page/index.html',
      inject: 'body',
      hash: true,
      chunks: ['options'],
    }),
    new MiniCssExtractPlugin({ filename: '[name].css' }),
    new CopyWebpackPlugin({
      patterns: [{
        from: './src/manifest/manifest.json',
        to: '[name][ext]',
        transform(content) {

          const manifest = JSON.parse(content.toString());
          const extraInfo = require('./src/manifest')(process.env.BROWSER);

          for (const key in extraInfo)
            manifest[key] = extraInfo[key];

          return Promise.resolve(JSON.stringify(manifest));
        },
      },
      {
        from: './src/**/messages.json',
        to: ({ absoluteFilename }) => absoluteFilename.substring(absoluteFilename.indexOf('_locales')),
        transform: (content) => Promise.resolve(JSON.stringify(JSON.parse(content.toString()))),
      },
      {
        from: './src/res/**/*',
        to: ({ absoluteFilename }) => absoluteFilename.substring(absoluteFilename.indexOf('res')),
      },
      ],
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 0,
    },
    minimizer: [
      new TerserJSPlugin({ extractComments: false }),
      new CssMinimizerPlugin({ minimizerOptions: { preset: ['default', { discardComments: { removeAll: true } }] } }),
    ],
  },
  resolve: { extensions: ['.js', '.jsx', '.css'] },
  stats: 'minimal',
};