const {
  useBabelRc,
  override,
  addWebpackModuleRule,
  addWebpackPlugin,
  setWebpackPublicPath,
} = require('customize-cra');
const SpritePlugin = require('svg-sprite-loader/plugin');

const isDev = process.env.NODE_ENV === 'development';

module.exports = override(
  useBabelRc(),
  setWebpackPublicPath(process.env.REACT_APP_BASENAME || '/'),
  addWebpackPlugin(new SpritePlugin()),
  addWebpackModuleRule({
    test: /\.tsx?$/,
    exclude: /node_modules/,
    use: [
      { loader: 'babel-loader' },
      {
        loader: '@linaria/webpack-loader',
        options: {
          cacheDirectory: 'src/.linaria_cache',
          sourceMap: isDev,
        },
      },
    ],
  }),
  addWebpackModuleRule({
    test: /\.svg$/,
    use: [
      {
        loader: 'svg-sprite-loader',
      },
    ],
  }),
);
