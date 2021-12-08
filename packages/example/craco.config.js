const {
  addAfterLoader,
  loaderByName,
  getLoaders,
  removeLoaders,
  throwUnexpectedConfigError, addBeforeLoader,
} = require('@craco/craco');

const throwError = (message) =>
  throwUnexpectedConfigError({
    packageName: 'craco',
    githubRepo: 'gsoft-inc/craco',
    message,
    githubIssueQuery: 'webpack',
  });

module.exports = {
  webpack: {
    configure: (config, { env }) => {
      const isDev = env === 'development';

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

      return config;
    },
  },
};
