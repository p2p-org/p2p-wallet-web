const webpack = require('webpack');
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const SvgStorePlugin = require('external-svg-sprite-loader');

const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: isDev ? 'development' : 'production',
  devtool: 'source-map',
  entry: {
    app: './src/index.tsx',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    modules: ['node_modules'],
    alias: {
      // Webpack 5 Change: Polyfill Node bindings.
      // See https://github.com/webpack/webpack/pull/8460
      // See https://github.com/webpack/node-libs-browser/blob/master/index.js
      process: 'process/browser.js',
      assert: 'assert',
      util: 'util',
      buffer: 'buffer',
      stream: 'stream-browserify',
      'stream-http': 'stream-http',
      http: 'http-browserify',
      https: 'https-browserify',
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].bundle.js',
  },
  plugins: [
    new SvgStorePlugin(),
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify(process.env.NODE_ENV) },
    }),
    new HtmlWebPackPlugin({
      template: path.resolve(__dirname, 'public/index.html'),
      filename: 'index.html',
    }),
    new MiniCssExtractPlugin({ filename: 'styles.css' }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: { cacheDirectory: true },
          },
          {
            loader: '@linaria/webpack-loader',
            options: { sourceMap: isDev },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: { sourceMap: isDev },
          },
        ],
      },
      {
        test: /\.(jpg|png|gif|woff|woff2|eot|ttf)$/,
        use: [{ loader: 'file-loader' }],
      },
      {
        test: /\.svg$/,
        exclude: /node_modules/,
        loader: SvgStorePlugin.loader,
      },
    ],
  },
  devServer: {
    contentBase: [path.join(__dirname, 'public')],
    historyApiFallback: true,
  },
};
