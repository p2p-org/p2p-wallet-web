import path from 'path';
import type { Configuration as WebpackConfiguration } from 'webpack';
import type { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';

interface Configuration extends WebpackConfiguration, WebpackDevServerConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

type ConfigFn = (env: any, argv: any) => Configuration;

const config: ConfigFn = (env, argv) => {
  console.log(env);
  console.log(argv);
  return {
    mode: 'development',

    entry: './packages/web/src/index.tsx',

    output: {
      publicPath: '/',
    },

    module: {
      rules: [
        {
          test: /\.(ts|js)x?$/i,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
            },
          },
        },
      ],
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
  };
};

module.exports = config;
