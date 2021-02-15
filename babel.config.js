module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' },
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
    'module:@linaria/babel-preset',
  ],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          constants: './src/constants',
          config: './src/config',
          utils: './src/utils',
          lib: './src/lib',
          store: './src/store',
          api: './src/api',
          features: './src/features',
          pages: './src/pages',
          components: './src/components',
          assets: './src/assets',
          styles: './src/styles',
          assets: './src/assets',
        },
      },
    ],
    '@babel/plugin-proposal-class-properties',
    '@babel/transform-runtime',
  ],
};
