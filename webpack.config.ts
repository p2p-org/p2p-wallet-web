import path from 'path';
import type { Configuration as WebpackConfiguration } from 'webpack';
import type { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';

interface Configuration extends WebpackConfiguration, WebpackDevServerConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

type ConfigFn = (env: any, argv: any) => Configuration;

// @ts-ignore
const config: ConfigFn = (env, argv) => {
  return {
    mode: argv.mode,

    entry: './packages/web/src/index.tsx',

    output: {
      publicPath: '/',
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
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript',
                // ['react-app', { flow: false, typescript: true, runtime: 'automatic' }],
                // '@linaria',
              ],
              plugins: [
                ['@babel/plugin-proposal-private-methods', { loose: true }],
                ['@babel/plugin-proposal-class-properties', { loose: true }],
                ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
                [
                  'module-resolver',
                  {
                    root: [path.resolve(__dirname, './packages/web/src')],
                    alias: {
                      constants: './packages/web/src/constants',
                      config: './packages/web/src/config',
                      utils: './packages/web/src/utils',
                      lib: './packages/web/src/lib',
                      store: './packages/web/src/store',
                      api: './packages/web/src/api',
                      app: './packages/web/src/app',
                      pages: './packages/web/src/pages',
                      components: './packages/web/src/components',
                      assets: './packages/web/src/assets',
                      styles: './packages/web/src/styles',
                    },
                  },
                ],
              ],
            },
          },
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
    },

    devServer: {
      client: {
        overlay: {
          errors: true,
          warnings: false,
        }, // @TODO check
        progress: true,
      },
      static: {
        directory: path.join(__dirname, '/packages/web/public'),
      },
      historyApiFallback: true, // @TODO check
      compress: true,
      port: 9000,
      // hot: true // @TODO check
    },

    plugins: [],
  };
};

module.exports = config;
