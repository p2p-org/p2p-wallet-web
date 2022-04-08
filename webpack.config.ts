// @ts-ignore
import DotEnv from 'dotenv-webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
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

    // @FIXME extract aliases
    // @TODO file names in loaders for PROD and DEV
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
          // @TODO make sure global styles are loaded. read the docs
          test: /\.css$/i,
          loader: 'css-loader',
        },
        {
          // @TODO add source maps
          test: /\.(ts|js)x?$/i,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
            },
            {
              loader: '@linaria/webpack-loader',
              options: {
                sourceMap: !isDevelopment,
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
        // @FIXME remove title
        title: 'My App',
        template: path.join(__dirname + '/packages/web/index.html'),
      }),
      new webpack.DefinePlugin({
        'process.env': { NODE_ENV: JSON.stringify(process.env.NODE_ENV) },
      }),
      new DotEnv({
        path: './packages/web/.env.development',
        ignoreStub: true,
      }),
    ],
  };
};

module.exports = config;
