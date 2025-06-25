import { resolve } from 'node:path';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserJSPlugin from 'terser-webpack-plugin';

/** @type import('webpack').Configuration */
export default {
  mode: 'production',
  entry: {
    background: './src/background/index.js',
    embedded: './src/ui/embedded/index.jsx',
    options: './src/ui/options-page/index.jsx',
    popup: './src/ui/popup/index.js',
  },
  output: {
    filename: '[name].js',
    publicPath: '',
    path: resolve('dist/yate'),
    clean: true,
  },
  module: {
    rules: [
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
                  autoprefixer: {},
                  '@tailwindcss/postcss': {},
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
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader' },
      },
    ],
  },
  plugins: [
    new WebpackManifestPlugin({
      fileName: resolve('dist/assets.json'),
      filter: (file) => file.path.endsWith('js'),
      generate: (_, _files, entries) => entries,
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
      patterns: [
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
  resolve: { extensions: ['.js', 'jsx', '.css'] },
  stats: 'minimal',
};
