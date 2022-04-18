// @ts-ignore
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
// @ts-ignore
import DotEnv from 'dotenv-webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import type { Configuration as WebpackConfiguration } from 'webpack';
import webpack from 'webpack';
import type { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';

interface Configuration extends WebpackConfiguration, WebpackDevServerConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

type ConfigFn = (env: any, argv: any) => Configuration;

// @TODO add process and may be dashboard in terminal

// @ts-ignore
const config: ConfigFn = (env, argv) => {
  const DEVELOPMENT = argv.mode === 'development';

  const devPlugins = [];

  if (DEVELOPMENT) {
    devPlugins.push(new ReactRefreshWebpackPlugin());
  }

  return {
    mode: argv.mode,

    entry: path.resolve(__dirname, './packages/web/src/index.tsx'),

    output: {
      path: path.resolve(__dirname, 'packages/web/public'),
      chunkFilename: '[id].chunk.js',
    },

    // @TODO file names in loaders for PROD and DEV (check all files)
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
              loader: DEVELOPMENT ? 'style-loader' : MiniCssExtractPlugin.loader,
            },
            {
              loader: 'css-loader',
              options: { sourceMap: DEVELOPMENT },
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
                sourceMap: DEVELOPMENT,
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

    devtool: DEVELOPMENT ? 'eval-cheap-module-source-map' : 'none',

    // @TODO Webpack cache https://webpack.js.org/configuration/cache/#cache
    // @TODO Webpack plugins https://webpack.js.org/configuration/plugins/
    // @TODO Webpack perf https://webpack.js.org/configuration/plugins/

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
      port: 9000,
      hot: true,
      open: false,
    },

    // @TODO should be different for the prod build (browserlist) and ES sth for packages build
    target: 'web',

    plugins: [
      new HtmlWebpackPlugin({
        title: 'Solana Wallet',
        template: path.join(__dirname + '/packages/web/index.html'),
      }),
      new webpack.DefinePlugin({
        'process.env': { NODE_ENV: JSON.stringify(process.env.NODE_ENV) },
        DEVELOPMENT,
      }),
      new DotEnv({
        path: './packages/web/.env.development',
        ignoreStub: true,
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser.js',
        Buffer: ['buffer', 'Buffer'],
      }),
      new MiniCssExtractPlugin({
        filename: DEVELOPMENT ? 'styles.css' : 'styles-[contenthash].css',
      }),
      ...devPlugins,
    ],
  };
};

module.exports = config;
