module.exports = {
  presets: [['react-app', { flow: false, typescript: true, runtime: 'automatic' }], '@linaria'],
  plugins: [
    ['@babel/plugin-proposal-private-methods', { loose: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
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
          app: './src/app',
          pages: './src/pages',
          components: './src/components',
          assets: './src/assets',
          styles: './src/styles',
        },
      },
    ],
  ],
};
