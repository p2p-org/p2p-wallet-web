const webpack = require('webpack');
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const SvgStorePlugin = require('external-svg-sprite-loader');
const SpritePlugin = require('svg-sprite-loader/plugin');

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  target: 'web',
  // target: ['web', 'es5'],
  mode: isDev ? 'development' : 'production',
  devtool: 'source-map',
  entry: {
    app: './src/index.tsx',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    modules: ['node_modules'],
    // alias: {
    //   // Webpack 5 Change: Polyfill Node bindings.
    //   // See https://github.com/webpack/webpack/pull/8460
    //   // See https://github.com/webpack/node-libs-browser/blob/master/index.js
    //   process: 'process/browser.js',
    //   assert: 'assert',
    //   util: 'util',
    //   buffer: 'buffer',
    //   stream: 'stream-browserify',
    //   'stream-http': 'stream-http',
    //   http: 'http-browserify',
    //   https: 'https-browserify',
    // },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: isDev ? '/' : '/p2p-wallet-web/',
    filename: '[name].bundle.js',
  },
  plugins: [
    // new SvgStorePlugin(),
    new SpritePlugin(),
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        APP_LOCAL_WALLET_PRIVATE_KEY: JSON.stringify(process.env.APP_LOCAL_WALLET_PRIVATE_KEY),
        APP_LOCAL_WALLET_MNEMONIC: JSON.stringify(process.env.APP_LOCAL_WALLET_MNEMONIC),
        SWAP_PROGRAM_ID: JSON.stringify(process.env.SWAP_PROGRAM_ID),
        DEFAULT_COMMITMENT: JSON.stringify(process.env.DEFAULT_COMMITMENT),
        POST_TRANSACTION_SLEEP_MS: JSON.stringify(process.env.POST_TRANSACTION_SLEEP_MS),
      },
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
      // {
      //   test: /\.svg$/,
      //   exclude: /node_modules/,
      //   loader: SvgStorePlugin.loader,
      // },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-sprite-loader',
            // options: {
            //   extract: true,
            //   publicPath: '/static/',
            // },
          },
          // 'svgo-loader'
        ],
      },
    ],
  },
  devServer: {
    contentBase: [path.join(__dirname, 'public')],
    historyApiFallback: true,
    publicPath: '/',
  },
};
