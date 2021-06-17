const path = require('path');
const {
  useBabelRc,
  override,
  addWebpackModuleRule,
  addWebpackPlugin,
  setWebpackPublicPath,
  disableChunk,
  getBabelLoader,
} = require('customize-cra');
const SpritePlugin = require('svg-sprite-loader/plugin');
const PrerenderSPAPlugin = require('prerender-spa-plugin');

const isDev = process.env.NODE_ENV === 'development';

const addCustomBabelLoader = () => (config) => {
  const babelLoader = getBabelLoader(config);

  delete babelLoader.options.babelrc;
  delete babelLoader.options.configFile;
  delete babelLoader.options.cacheIdentifier;

  babelLoader.use = [
    {
      loader: babelLoader.loader,
      options: babelLoader.options,
    },
    {
      loader: '@linaria/webpack-loader',
      options: {
        cacheDirectory: 'src/.linaria_cache',
        sourceMap: isDev,
      },
    },
  ];

  delete babelLoader.loader;
  delete babelLoader.options;
  delete babelLoader.include;

  return config;
};

module.exports = override(
  useBabelRc(),
  setWebpackPublicPath(process.env.REACT_APP_BASENAME || '/'),
  addWebpackPlugin(new SpritePlugin()),
  isDev && disableChunk(),
  !isDev &&
    addWebpackPlugin(
      new PrerenderSPAPlugin({
        routes: ['/'],
        staticDir: path.join(__dirname, 'build'),
      }),
    ),
  addCustomBabelLoader(),
  addWebpackModuleRule({
    test: /-icon\.svg$/,
    use: [
      {
        loader: 'svg-sprite-loader',
      },
      {
        loader: 'svgo-loader',
      },
    ],
  }),
);
