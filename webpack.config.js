/* eslint-disable sort-keys */
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const { resolve } = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// const TerserJSPlugin = require('terser-webpack-plugin');

/** @type import('webpack').Configuration */
module.exports = {
  mode: 'production',
  entry: {
    popup: './src/ui/popup/index.jsx',
    context: './src/ui/context/index.jsx',
    background: './src/background/index.js',
  },
  output: {
    filename: '[name].js',
    publicPath: '',
    path: resolve('built'),
  },
  module: {
    rules: [{
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
      // name(module) {
      //   return module.context.includes('node_modules') ?
      //     (module.context.includes('preact') ? 'libs/preact' : 'libs/common') :
      //     'libs/utils';
      // },
      // cacheGroups: {
      //   background: {
      //     name: 'background',
      //   }
      // },
    },
    minimizer: [
      // new TerserJSPlugin({
      //   cache: true,
      //   parallel: true,
      //   extractComments: false,
      // }),
      // new OptimizeCSSAssetsPlugin({ cssProcessorPluginOptions: { preset: ['default', { discardComments: { removeAll: true } }] } }),
    ],
  },
  resolve: { extensions: ['.js', '.jsx', '.css'] },
  stats: 'minimal',
};