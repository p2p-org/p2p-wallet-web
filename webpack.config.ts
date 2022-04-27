import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import DotEnv from 'dotenv-webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import type { Configuration as WebpackConfiguration, WebpackPluginInstance } from 'webpack';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import type { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';
import zlib from 'zlib';

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
const DEV_PORT = 9000;
const APP_TITLE = 'Solana Wallet';

const config: ConfigFn = (env, argv) => {
  const __DEVELOPMENT__ = argv.mode === 'development';
  const __PRODUCTION__ = argv.mode === 'production';
  const __ANALYSE__ = env.analyze;
  const __PACKAGE_NAME__ = env.name;

  const devPlugins: Array<WebpackPluginInstance> = [];
  const utilityPlugins: Array<WebpackPluginInstance> = [];
  const prodPlugins: Array<WebpackPluginInstance> = [];

  if (__PRODUCTION__) {
    prodPlugins.push(
      new CompressionPlugin({
        filename: '[path][base].br',
        algorithm: 'brotliCompress',
        test: /\.(js|css|svg)$/,
        compressionOptions: {
          // @ts-ignore
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
          },
        },
        threshold: 10240,
        minRatio: 0.8,
      }),
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 10,
      }),
      new MiniCssExtractPlugin({
        filename: __DEVELOPMENT__ ? 'styles.css' : 'styles-[contenthash].css',
      }),
    );
  }

  if (__DEVELOPMENT__) {
    devPlugins.push(new ReactRefreshWebpackPlugin());
  }

  if (__ANALYSE__) {
    utilityPlugins.push(new BundleAnalyzerPlugin());
  }

  return {
    bail: __PRODUCTION__,

    name: __PACKAGE_NAME__,

    mode: argv.mode,

    entry: path.resolve(__dirname, './packages/web/src/index.tsx'),

    // @TODO output for library https://webpack.js.org/configuration/output/#outputlibrary
    // @TODO https://webpack.js.org/guides/author-libraries/
    // set up sideeffect as well for the libs
    output: {
      path: path.resolve(__dirname, 'packages/web/public'),
      filename: __DEVELOPMENT__ ? '[name].[contenthash].js' : '[contenthash].js',
      chunkFilename: __DEVELOPMENT__ ? '[id]-[contenthash].chunk.js' : '[contenthash].chunk.js',
    },

    optimization: {
      nodeEnv: argv.mode,
      runtimeChunk: 'single',
      minimize: __PRODUCTION__,
      minimizer: __PRODUCTION__ ? [new TerserPlugin(), new CssMinimizerPlugin()] : [],
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
              options: { sourceMap: __DEVELOPMENT__ },
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
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        Buffer: require.resolve('buffer'),
      },
      alias: {
        constants: path.resolve(__dirname, './packages/web/src/constants'),
        config: path.resolve(__dirname, './packages/web/src/config'),
        utils: path.resolve(__dirname, './packages/web/src/utils'),
        lib: path.resolve(__dirname, './packages/web/src/lib'),
        store: path.resolve(__dirname, './packages/web/src/store'),
        api: path.resolve(__dirname, './packages/web/src/api'),
        app: path.resolve(__dirname, './packages/web/src/app'),
        pages: path.resolve(__dirname, './packages/web/src/pages'),
        components: path.resolve(__dirname, './packages/web/src/components'),
        assets: path.resolve(__dirname, './packages/web/src/assets'),
        styles: path.resolve(__dirname, './packages/web/src/styles'),
      },
    },

    devtool: __DEVELOPMENT__ ? 'eval-cheap-module-source-map' : 'source-map',

    // @TODO Webpack cache for CI  https://webpack.js.org/configuration/cache/#setup-cache-in-cicd-system

    devServer: {
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
        progress: true,
      },
      historyApiFallback: true,
      compress: true,
      port: DEV_PORT,
      hot: true,
      open: false,
    },

    stats: __PRODUCTION__ ? 'errors-warnings' : 'normal',

    target: 'browserslist',

    plugins: [
      new HtmlWebpackPlugin({
        title: APP_TITLE,
        template: path.join(__dirname + '/packages/web/index.html'),
      }),
      new DotEnv({
        path: './packages/web/.env.development',
        ignoreStub: true,
      }),
      new webpack.DefinePlugin({
        __DEVELOPMENT__,
        __PRODUCTION__,
      }),
      new webpack.ProvidePlugin({
        // process: 'process/browser.js',
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
