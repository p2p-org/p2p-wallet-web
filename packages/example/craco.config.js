const {
  addAfterLoader,
  loaderByName,
  getLoaders,
  removeLoaders,
  throwUnexpectedConfigError,
  addBeforeLoader,
} = require('@craco/craco');

const throwError = (message) =>
  throwUnexpectedConfigError({
    packageName: 'craco',
    githubRepo: 'gsoft-inc/craco',
    message,
    githubIssueQuery: 'webpack',
  });

function addBabelLoader(config, isDev) {
  console.log('adding ts babel-loader');

  const babelLoader = {
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
  };

  const { isAdded: babelLoaderIsAdded } = addBeforeLoader(
    config,
    loaderByName('babel-loader'),
    babelLoader,
  );
  if (!babelLoaderIsAdded) throwError('failed to add babel-loader');
  console.log('added babel-loader');
}

function addMjsLoader(config, isDev) {
  console.log('adding mjs loader');

  const mjsLoader = {
    test: /\.mjs$/,
    include: /node_modules/,
    type: 'javascript/auto',
  };

  const { isAdded: mjsLoaderIsAdded } = addAfterLoader(
    config,
    loaderByName('babel-loader'),
    mjsLoader,
  );
  if (!mjsLoaderIsAdded) throwError('failed to add mjs loader');
  console.log('added mjs loader');
}

module.exports = {
  webpack: {
    configure: (config, { env }) => {
      const isDev = env === 'development';

      addBabelLoader(config, isDev);
      addMjsLoader(config, isDev);

      return config;
    },
  },
};
