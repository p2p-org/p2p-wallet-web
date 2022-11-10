import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import DotEnv from 'dotenv-webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import type { Configuration as WebpackConfiguration, WebpackPluginInstance } from 'webpack';
import webpack from 'webpack';
import type { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';

interface Configuration extends WebpackConfiguration, WebpackDevServerConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

type CustomEnv = {
  analyze: boolean;
  name: string;
};

type ArgV = {
  mode: Configuration['mode'];
};

type ConfigFn = (env: CustomEnv, argv: ArgV) => Configuration;

const MAX_CHUNK_SIZE = 300000;
const DEV_PORT = 3000;
const APP_TITLE = 'Solana Wallet';
const WEB_PATH = path.resolve(__dirname, '../packages/web');
const PACKAGE_PATH = path.resolve(__dirname, '../packages');

const config: ConfigFn = (env, argv) => {
  const __DEVELOPMENT__ = argv.mode === 'development';
  const __PRODUCTION__ = argv.mode === 'production';
  const __PACKAGE_NAME__ = env.name;

  // @ts-ignore
  process.env.NODE_ENV = argv.mode;
  process.env.BABEL_ENV = argv.mode;

  const devPlugins: Array<WebpackPluginInstance> = [];
  const utilityPlugins: Array<WebpackPluginInstance> = [];
  const prodPlugins: Array<WebpackPluginInstance> = [];

  const webAliases = {
    new: path.join(WEB_PATH, '/src/new'),
    constants: path.join(WEB_PATH, '/src/constants'),
    config: path.resolve(WEB_PATH, '/src/config'),
    utils: path.resolve(WEB_PATH, '/src/utils'),
    lib: path.resolve(WEB_PATH, '/src/lib'),
    store: path.resolve(WEB_PATH, '/src/store'),
    api: path.resolve(WEB_PATH, '/src/api'),
    app: path.resolve(WEB_PATH, '/src/app'),
    pages: path.resolve(WEB_PATH, '/src/pages'),
    components: path.resolve(WEB_PATH, '/src/components'),
    assets: path.resolve(WEB_PATH, '/src/assets'),
    styles: path.resolve(WEB_PATH, '/src/styles'),
  };

  const packageAliases: object = {
    '@p2p-wallet-web/core': path.join(PACKAGE_PATH, '/core/src'),
    '@p2p-wallet-web/sail': path.join(PACKAGE_PATH, '/sail/src'),
    '@p2p-wallet-web/token-utils': path.join(PACKAGE_PATH, '/token-utils/src'),
    '@p2p-wallet-web/ui': path.join(PACKAGE_PATH, '/ui/src'),
  };

  if (__PRODUCTION__) {
    prodPlugins.push(
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 10,
      }),
      new MiniCssExtractPlugin({
        filename: 'styles-[contenthash].css',
        ignoreOrder: true,
      }),
      // These ENVs are for passing secrets on CI in opposite to passing them from .env
      new webpack.DefinePlugin({
        'process.env': {
          REACT_APP_BASENAME: JSON.stringify(process.env.REACT_APP_BASENAME),
          REACT_APP_AMPLITUDE_API_KEY: JSON.stringify(process.env.REACT_APP_AMPLITUDE_API_KEY),
          REACT_APP_CRYPTO_COMPARE_API_KEY: JSON.stringify(
            process.env.REACT_APP_CRYPTO_COMPARE_API_KEY,
          ),
          REACT_APP_FEE_RELAYER_URL: JSON.stringify(process.env.REACT_APP_FEE_RELAYER_URL),
          REACT_APP_INTERCOM_APP_ID: JSON.stringify(process.env.REACT_APP_INTERCOM_APP_ID),
          REACT_APP_MOONPAY_API_KEY: JSON.stringify(process.env.REACT_APP_MOONPAY_API_KEY),
          REACT_APP_MOONPAY_SIGNER_URL: JSON.stringify(process.env.REACT_APP_MOONPAY_SIGNER_URL),
          REACT_APP_ORCA_CACHE_URL: JSON.stringify(process.env.REACT_APP_ORCA_CACHE_URL),
          REACT_APP_STAGING: JSON.stringify(process.env.REACT_APP_STAGING),
          REACT_APP_SENTRY_DSN_ENDPOINT: JSON.stringify(process.env.REACT_APP_SENTRY_DSN_ENDPOINT),
          REACT_APP_SENTRY_MODE: JSON.stringify(process.env.REACT_APP_SENTRY_MODE),
          REACT_APP_SENTRY_TRACES_SAMPLE_RATE: JSON.stringify(
            process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE,
          ),
          REACT_APP_SENTRY_RELEASE: JSON.stringify(process.env.REACT_APP_SENTRY_RELEASE),
          REACT_APP_FIREBASE_API_KEY: JSON.stringify(process.env.REACT_APP_FIREBASE_API_KEY),
          REACT_APP_FIREBASE_APP_ID: JSON.stringify(process.env.REACT_APP_FIREBASE_APP_ID),
          REACT_APP_RPCPOOL_API_KEY: JSON.stringify(process.env.REACT_APP_RPCPOOL_API_KEY),
        },
      }),
      new CleanWebpackPlugin(),
      new CopyPlugin({
        patterns: [
          {
            from: path.join(WEB_PATH, '/public'),
            to: path.join(WEB_PATH, '/build'),
          },
        ],
      }),
    );
  }

  if (__DEVELOPMENT__) {
    devPlugins.push(new ReactRefreshWebpackPlugin({ overlay: false }));
  }

  return {
    bail: __PRODUCTION__,

    name: __PACKAGE_NAME__,

    mode: argv.mode,

    entry: path.resolve(__dirname, WEB_PATH, '/src/index.tsx'),

    output: {
      publicPath: __DEVELOPMENT__ ? '/' : undefined,
      path: path.resolve(__dirname, WEB_PATH, 'build'),
      filename: __DEVELOPMENT__ ? '[name].[contenthash].js' : '[contenthash].js',
      chunkFilename: __DEVELOPMENT__ ? '[id]-[contenthash].chunk.js' : '[contenthash].chunk.js',
      assetModuleFilename: '[name]-[contenthash][ext]',
    },

    optimization: {
      runtimeChunk: 'single',
      minimize: __PRODUCTION__,
      minimizer: __PRODUCTION__
        ? [
            new TerserPlugin(),
            new CssMinimizerPlugin(),
            new ImageMinimizerPlugin({
              loader: false,
              minimizer: {
                implementation: ImageMinimizerPlugin.imageminMinify,
                options: {
                  plugins: [
                    'imagemin-gifsicle',
                    'imagemin-mozjpeg',
                    'imagemin-pngquant',
                    'imagemin-svgo',
                  ],
                },
              },
            }),
          ]
        : [],
      splitChunks: {
        maxSize: __PRODUCTION__ ? MAX_CHUNK_SIZE : undefined,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
            reuseExistingChunk: true,
          },
        },
      },
    },

    performance: {
      hints: 'warning',
    },

    module: {
      rules: [
        {
          test: /.(png)$/,
          type: 'asset/resource',
        },
        {
          test: /-icon\.svg$/,
          use: [
            {
              loader: 'svg-sprite-loader',
            },
            {
              loader: 'svgo-loader',
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: __DEVELOPMENT__ ? 'style-loader' : MiniCssExtractPlugin.loader,
            },
            {
              loader: 'css-loader',
              options: {
                sourceMap: __DEVELOPMENT__,
                // @TODO in the case of css-modules use getLocalIndent
              },
            },
          ],
        },
        {
          test: /\.(ts|js)x?$/i,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
            },
            {
              loader: '@linaria/webpack-loader',
              options: {
                sourceMap: __DEVELOPMENT__,
              },
            },
          ],
        },
      ],
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.css'],
      fallback: {
        path: require.resolve('path-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        Buffer: require.resolve('buffer'),
      },
      alias: {
        ...webAliases,
        ...packageAliases,
      },
    },

    devtool: __DEVELOPMENT__ ? 'source-map' : false,

    devServer: {
      client: {
        overlay: false,
      },
      historyApiFallback: true,
      compress: true,
      port: DEV_PORT,
      hot: true,
      open: true,
    },

    stats: 'errors-only',

    target: 'browserslist',

    plugins: [
      new HtmlWebpackPlugin(
        Object.assign(
          {},

          {
            title: APP_TITLE,
            template: path.join(WEB_PATH, '/index.html'),
            favicon: path.join(WEB_PATH, '/public/favicon.ico'),
            base: process.env.PUBLIC_URL,
          },
          __PRODUCTION__ && {
            minify: {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true,
            },
          },
        ),
      ),
      // These ENVs are passed from local .env file (in opposite to those from CI secrets)
      new DotEnv({
        path: path.join(WEB_PATH, '/.env.development'),
        ignoreStub: true,
      }),
      new webpack.DefinePlugin({
        __DEVELOPMENT__,
        __PRODUCTION__,
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser.js',
        Buffer: ['buffer', 'Buffer'],
      }),
      new webpack.ProgressPlugin(),
      ...utilityPlugins,
      ...devPlugins,
      ...prodPlugins,
    ],
  };
};

module.exports = config;
