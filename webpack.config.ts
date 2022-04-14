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
  const isDevelopment = argv.mode === 'development';

  return {
    mode: argv.mode,

    // entry: './packages/web/src/testy.tsx',
    entry: path.resolve(__dirname, './packages/web/src/index.tsx'),

    output: {
      path: path.resolve(__dirname, 'packages/web/public'),
      chunkFilename: '[id].chunk.js',
    },

    // @TODO file names in loaders for PROD and DEV (check all files)
    module: {
      rules: [
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
          test: /.(svg|png)$/,
          type: 'asset/resource',
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
            },
            {
              loader: 'css-loader',
              // @FIXME there are a lot of style tags when isDevelopment = false
              options: { sourceMap: isDevelopment },
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
                sourceMap: isDevelopment,
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

    // @TODO production https://webpack.js.org/configuration/devtool/#production
    devtool: isDevelopment ? 'eval-cheap-module-source-map' : 'none',

    devServer: {
      client: {
        overlay: {
          errors: true,
          warnings: false,
        }, // @TODO check
        progress: true,
      },
      // static: {
      //   directory: path.join(__dirname, '/packages/web/public'),
      // },
      historyApiFallback: true, // @TODO check
      compress: true,
      port: 9000,
      // hot: true // @TODO check
    },

    plugins: [
      new HtmlWebpackPlugin({
        title: 'Solana Wallet',
        template: path.join(__dirname + '/packages/web/index.html'),
      }),
      new webpack.DefinePlugin({
        'process.env': { NODE_ENV: JSON.stringify(process.env.NODE_ENV) },
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
        filename: isDevelopment ? 'styles.css' : 'styles-[contenthash].css',
      }),
    ],
  };
};

module.exports = config;
